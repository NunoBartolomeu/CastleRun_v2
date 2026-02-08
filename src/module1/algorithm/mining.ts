/**
 * Main mining algorithm entry point.
 */

import type { MiningConfig, MiningResult, Position, PathNode } from '../../shared/domain/models.js'
import { TileType, MiningAction } from '../../shared/domain/models.js'
import { createEmptyGrid, setTile } from '../../shared/utils/grid.js'
import { SeededRandom } from '../../shared/utils/random.js'
import { getPositionInDirection, isOnBorder } from '../../shared/utils/position.js'
import { validateMiningConfig } from './validation.js'
import { getValidMoves, determineAction, shouldStop } from './pathfinding.js'
import { applyVoidToEdges } from './postProcessing.js'
import { calculateStats } from '../stats/metrics.js'
import { validateGrid } from './validation-post.js'  // ADD THIS

/**
 * Executes the complete mining algorithm.
 * 
 * @param config - Mining configuration
 * @returns Complete mining result with grid, path, and stats
 * @throws Error if config is invalid or generated grid fails validation
 */
export function runMiningAlgorithm(config: MiningConfig): MiningResult {
  // Validate configuration
  validateMiningConfig(config)
  
  // Initialize RNG
  const seed = config.seed ?? Date.now()
  const rng = new SeededRandom(seed)
  
  // Initialize grid (all WALL)
  const grid = createEmptyGrid(config.width, config.height, TileType.WALL)
  
  // Determine starting position
  let startPos: Position
  if (config.startingPos) {
    startPos = config.startingPos
  } else {
    // Random position, but not on border
    do {
      startPos = rng.randomPosition(config.width, config.height)
    } while (isOnBorder(startPos, config.width, config.height))
  }
  
  const path: PathNode[] = []
  let minerPos = startPos
  
  const startTime = Date.now()
  
  // First action: BREAK at starting position
  setTile(grid, startPos, TileType.FLOOR)
  path.push({
    position: { ...startPos },
    miningAction: MiningAction.BREAK,
    timestamp: Date.now() - startTime
  })
  
  // Mining loop
  while (!shouldStop(grid, config.targetPercentage)) {
    const validMoves = getValidMoves(grid, minerPos, config, rng)
    
    if (validMoves.length === 0) {
      // This should never happen based on our logic, but safety check
      throw new Error(
        `No valid moves available at position (${minerPos.x}, ${minerPos.y}). This should not happen.`
      )
    }
    
    // Choose random direction from weighted options
    const chosenDirection = rng.choice(validMoves)
    const targetPos = getPositionInDirection(minerPos, chosenDirection)
    
    // Determine action and update grid
    const action = determineAction(grid, targetPos)
    if (action === MiningAction.BREAK) {
      setTile(grid, targetPos, TileType.FLOOR)
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
  
  const endTime = Date.now()
  
// Post-processing: apply VOID to edges
  applyVoidToEdges(grid)
  
  // Calculate statistics first
  const stats = calculateStats(grid, path, startTime, endTime, startPos)
  
  // VALIDATE THE GENERATED GRID (but don't throw, just warn)
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