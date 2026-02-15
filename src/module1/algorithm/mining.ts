/**
 * Main mining algorithm entry point with multi-section support.
 */

import type { MiningConfig, MiningResult, Position, PathNode } from '../../shared/domain/models.js'
import { TileType, MiningAction } from '../../shared/domain/models.js'
import { createEmptyGrid, setTile } from '../../shared/utils/grid.js'
import { SeededRandom } from '../../shared/utils/random.js'
import { getPositionInDirection, isOnBorder } from '../../shared/utils/position.js'
import { validateMiningConfig } from './validation-pre.js'
import { 
  getValidMoves, 
  determineAction,
  createBreakabilityCache,
  updateCacheAfterBreak 
} from './pathfinding.js'
import { applyVoidToEdges } from './postProcessing.js'
import { calculateStats } from '../stats/metrics.js'
import { validateGrid } from './validation-post.js'
import { createSections } from './sections.js'

/**
 * Executes the complete mining algorithm with optional multi-section support.
 * 
 * Single-section mode (default): Mines entire grid with one miner.
 * Multi-section mode: Divides grid into sections, mines each independently.
 * 
 * @param config - Mining configuration
 * @returns Complete mining result with grid, path, and stats
 * @throws Error if config is invalid
 */
export function runMiningAlgorithm(config: MiningConfig): MiningResult {
  // Validate configuration
  validateMiningConfig(config)
  
  // Initialize RNG
  const seed = config.seed ?? Date.now()
  const rng = new SeededRandom(seed)
  
  // Initialize grid (all WALL)
  const grid = createEmptyGrid(config.width, config.height, TileType.WALL)
  
  // Initialize breakability cache
  const cache = createBreakabilityCache(config.width, config.height)
  
  // Determine section configuration
  const sectionsX = config.sectionsX ?? 1
  const sectionsY = config.sectionsY ?? 1
  const useSections = sectionsX > 1 || sectionsY > 1
  
  // Create sections
  const sections = useSections 
    ? createSections(config.width, config.height, sectionsX, sectionsY, config.targetPercentage)
    : [{
        id: '0,0',
        minX: 0,
        maxX: config.width - 1,
        minY: 0,
        maxY: config.height - 1,
        targetFloorCount: Math.floor(config.width * config.height * (config.targetPercentage / 100))
      }]
  
  const path: PathNode[] = []
  const startTime = Date.now()
  let totalFloorCount = 0
  
  // Mine each section
  for (const section of sections) {
    let sectionFloorCount = 0
    
    // Random starting position within section (not on grid border)
    let startPos: Position
    do {
      startPos = {
        x: rng.nextInt(section.minX, section.maxX + 1),
        y: rng.nextInt(section.minY, section.maxY + 1)
      }
    } while (isOnBorder(startPos, config.width, config.height))
    
    let minerPos = startPos
    
    // First action in section: BREAK at starting position
    setTile(grid, startPos, TileType.FLOOR)
    sectionFloorCount++
    totalFloorCount++
    updateCacheAfterBreak(grid, startPos, cache, section)
    path.push({
      position: { ...startPos },
      miningAction: MiningAction.BREAK,
      timestamp: Date.now() - startTime
    })
    
    // Mining loop for this section
    while (sectionFloorCount < section.targetFloorCount) {
      const validMoves = getValidMoves(grid, minerPos, config, rng, cache, section)
      
      if (validMoves.length === 0) {
        console.warn(
          `Section ${section.id}: No valid moves at (${minerPos.x}, ${minerPos.y}). ` +
          `Floor: ${sectionFloorCount}/${section.targetFloorCount}. Moving to next section.`
        )
        break  // Move to next section
      }
      
      // Choose random direction from weighted options
      const chosenDirection = rng.choice(validMoves)
      const targetPos = getPositionInDirection(minerPos, chosenDirection)
      
      // Determine action and update grid
      const action = determineAction(grid, targetPos)
      if (action === MiningAction.BREAK) {
        setTile(grid, targetPos, TileType.FLOOR)
        sectionFloorCount++
        totalFloorCount++
        updateCacheAfterBreak(grid, targetPos, cache, section)
      }
      
      // Move miner
      minerPos = targetPos
      
      // Record step
      path.push({
        position: { ...minerPos },
        miningAction: action,
        timestamp: Date.now() - startTime
      })
    }
    
    console.log(
      `Section ${section.id} complete: ${sectionFloorCount}/${section.targetFloorCount} floor tiles`
    )
  }
  
  const endTime = Date.now()
  
  console.log(`Total floor tiles: ${totalFloorCount}`)
  
  // Post-processing: apply VOID to edges
  if (config.applyVoid) {
    applyVoidToEdges(grid)
  }
  
  // Calculate statistics
  const stats = calculateStats(grid, path, startTime, endTime, path[0].position)
  
  // Validate the generated grid (warn, don't throw)
  const validation = validateGrid(grid)
  if (!validation.isValid) {
    console.error('\n\x1b[31m⚠️  WARNING: Generated grid failed validation!\x1b[0m')
    validation.errors.forEach(err => console.error(`\x1b[31m  - ${err}\x1b[0m`))
    console.error('')
  }
  
  return {
    grid,
    path,
    stats
  }
}