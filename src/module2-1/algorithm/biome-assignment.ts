/**
 * Biome assignment algorithm.
 * Assigns biomes to all non-VOID tiles using probabilistic BFS expansion.
 */

import type { Grid, BiomeConfig, BiomeAssignmentResult, BiomePathNode, Position, BiomeType } from '../../shared/domain/models.js'
import { TileType, BiomeAction } from '../../shared/domain/models.js'
import { SeededRandom } from '../../shared/utils/random.js'
import { getTile } from '../../shared/utils/grid.js'
import { getPositionInDirection, positionKey, parsePositionKey } from '../../shared/utils/position.js'
import { CARDINAL_DIRECTIONS, ALL_DIRECTIONS } from '../../shared/utils/direction.js'
import { calculateBiomeStats } from './stats.js'
import { validateBiomeConfig } from './validation-pre.js'
import { validateBiomeAssignment } from './validation-post.js'

interface BiomeState {
  type: BiomeType
  current: Position[]      // Current positions to process
  next: Set<string>        // Next positions to try (Set to avoid duplicates)
}

/**
 * Finds random FLOOR tiles for biome center placement.
 */
function findRandomFloorTiles(grid: Grid, count: number, rng: SeededRandom, usedPositions: Set<string>): Position[] {
  const floorTiles: Position[] = []
  
  for (let y = 0; y < grid.height; y++) {
    for (let x = 0; x < grid.width; x++) {
      const tile = grid.tiles[y][x]
      const key = positionKey({ x, y })
      if (tile.type === TileType.FLOOR && !usedPositions.has(key)) {
        floorTiles.push({ x, y })
      }
    }
  }
  
  if (floorTiles.length < count) {
    throw new Error(`Not enough FLOOR tiles for biome centers. Need ${count}, found ${floorTiles.length}`)
  }
  
  // Shuffle
  for (let i = floorTiles.length - 1; i > 0; i--) {
    const j = rng.nextInt(0, i + 1)
    ;[floorTiles[i], floorTiles[j]] = [floorTiles[j], floorTiles[i]]
  }
  
  return floorTiles.slice(0, count)
}

/**
 * Sets the biome for a tile.
 */
function setTileBiome(grid: Grid, pos: Position, biomeType: BiomeType): void {
  const tile = getTile(grid, pos)
  if (tile) {
    tile.biome = biomeType
  }
}

/**
 * Assigns biomes to all non-VOID tiles on the grid.
 */
export function assignBiomes(grid: Grid, config: BiomeConfig): BiomeAssignmentResult {
  // Validate config
  validateBiomeConfig(config, grid)
  
  const rng = new SeededRandom(config.seed ?? Date.now())
  const path: BiomePathNode[] = []
  const startTime = Date.now()
  
  // Choose directions based on config
  const directions = config.expansionMode === 'CARDINAL' 
    ? CARDINAL_DIRECTIONS
    : ALL_DIRECTIONS
  
  const biomeStates: BiomeState[] = []
  const usedPositions = new Set<string>()
  let globalStepNumber = 0
  let cycleNumber = 0
  
  // ============================================================================
  // STEP 1: Place all centers (just queue them, don't convert yet)
  // ============================================================================
  for (const biomeDef of config.biomes) {
    const centers = findRandomFloorTiles(grid, biomeDef.centerCount, rng, usedPositions)
    
    for (const center of centers) {
      usedPositions.add(positionKey(center))
      
      // Create biome state with center in current queue
      const state: BiomeState = {
        type: biomeDef.type,
        current: [center],
        next: new Set<string>()
      }
      
      biomeStates.push(state)
    }
  }
  
  // ============================================================================
  // STEP 2: Expansion - CYCLE loop
  // ============================================================================
  while (biomeStates.some(b => b.current.length > 0 || b.next.size > 0)) {
    cycleNumber++
    
    // Process each biome in this cycle
    for (const biome of biomeStates) {
      
      // STEP loop - process all positions in current queue
      while (biome.current.length > 0) {
        const currentPos = biome.current.shift()!
        const currentTile = getTile(grid, currentPos)
    
        // 1. Out of bounds? Skip
        if (!currentTile) continue
        
        // 2. Is VOID? Skip
        if (currentTile.type === TileType.VOID) continue
        
        // 3. Tile.biome not null? Skip
        if (currentTile.biome !== null) continue
        
        // 4. Conversion chance
        const conversionChance = currentTile.type === TileType.FLOOR
          ? config.floorConversionChance
          : config.wallConversionChance
        
        const success = rng.next() < conversionChance
        
        if (!success) {
          // 5. FAIL - add position to biome.next
          biome.next.add(positionKey(currentPos))
          
          path.push({
            position: currentPos,
            biomeType: biome.type,
            action: BiomeAction.SKIP,
            cycleNumber,
            stepNumber: globalStepNumber++,
            timestamp: Date.now() - startTime
          })
        } else {
          // 6-7. SUCCESS - assign biome
          setTileBiome(grid, currentPos, biome.type)
          
          // 8. Add ALL neighbors to biome.next (unverified)
          for (const dir of directions) {
            const neighbor = getPositionInDirection(currentPos, dir)
            biome.next.add(positionKey(neighbor))
          }
          
          path.push({
            position: currentPos,
            biomeType: biome.type,
            action: BiomeAction.CONVERT,
            cycleNumber,
            stepNumber: globalStepNumber++,
            timestamp: Date.now() - startTime
          })
        }
      }
      
      // After current is empty: current = next, next = empty
      biome.current = Array.from(biome.next).map(parsePositionKey)
      biome.next.clear()
    }
  }
  
  // ============================================================================
  // STEP 3: Post-validation
  // ============================================================================
  const validation = validateBiomeAssignment(grid)
  
  if (!validation.isValid) {
    console.error('\n⚠️  Biome assignment failed validation!')
    validation.errors.forEach(err => console.error(`  - ${err}`))
    console.log(path) // Log the path for debugging
  } else {
    console.log('✅ All tiles successfully assigned biomes')
  }
  
  // Calculate total centers
  const totalCenters = config.biomes.reduce((sum, b) => sum + b.centerCount, 0)

  // Calculate statistics
  const stats = calculateBiomeStats(grid, path, cycleNumber, totalCenters)
  
  return { grid, path, stats }
}