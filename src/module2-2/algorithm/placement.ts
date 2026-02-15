/**
 * Spawn point placement algorithm.
 */

import type { Grid, SpawnPointConfig, SpawnPointResult, Position } from '../../shared/domain/models.js'
import { InteractableType } from '../../shared/domain/models.js'
import { SeededRandom } from '../../shared/utils/random.js'
import { getTile } from '../../shared/utils/grid.js'
import { positionKey } from '../../shared/utils/position.js'
import { analyzeConnectivity, shuffleArray } from './connectivity.js'
import { validateSpawnPointConfig } from './validation-pre.js'
import { validateSpawnPointPlacement } from './validation-post.js'
import { calculateSpawnPointStats } from './stats.js'

/**
 * Places entries, exits, and keys on the grid.
 * 
 * @param grid - Grid from Module 2.1 (with biomes)
 * @param config - Spawn point configuration
 * @returns Result with interactables placed
 */
export function placeSpawnPoints(grid: Grid, config: SpawnPointConfig): SpawnPointResult {
  // Validate configuration
  validateSpawnPointConfig(config, grid)
  
  const rng = new SeededRandom(config.seed ?? Date.now())
  const connectivity = analyzeConnectivity(grid)
  const usedPositions = new Set<string>()
  
  // Track placements
  const entries: Position[] = []
  const exits: Position[] = []
  const keys: Position[] = []
  
  let entriesOnC4 = 0
  let entriesOnC3 = 0
  let exitsOnC1 = 0
  let exitsOnC2 = 0
  let keysOnC3 = 0
  let keysOnC2 = 0
  
  // ============================================================================
  // 1. Place Exits (prefer C1, fall back to C2)
  // ============================================================================
  const c1Tiles = [...connectivity.get(1)!]
  const c2Tiles = [...connectivity.get(2)!]
  
  shuffleArray(c1Tiles, rng)
  shuffleArray(c2Tiles, rng)
  
  let exitsPlaced = 0
  
  // Try C1 first
  for (const pos of c1Tiles) {
    if (exitsPlaced >= config.exitCount) break
    
    const tile = getTile(grid, pos)
    if (!tile || tile.interactable !== null) continue
    
    tile.interactable = InteractableType.EXIT
    exits.push(pos)
    usedPositions.add(positionKey(pos))
    exitsOnC1++
    exitsPlaced++
  }
  
  // Fall back to C2 if needed
  if (exitsPlaced < config.exitCount) {
    console.warn(`Only ${exitsOnC1} C1 tiles available. Using C2 tiles for remaining exits.`)
    
    for (const pos of c2Tiles) {
      if (exitsPlaced >= config.exitCount) break
      if (usedPositions.has(positionKey(pos))) continue
      
      const tile = getTile(grid, pos)
      if (!tile || tile.interactable !== null) continue
      
      tile.interactable = InteractableType.EXIT
      exits.push(pos)
      usedPositions.add(positionKey(pos))
      exitsOnC2++
      exitsPlaced++
    }
  }
  
  // ============================================================================
  // 2. Place Entries (prefer C4, fall back to C3)
  // ============================================================================
  const c4Tiles = [...connectivity.get(4)!]
  const c3Tiles = [...connectivity.get(3)!]
  
  shuffleArray(c4Tiles, rng)
  shuffleArray(c3Tiles, rng)
  
  let entriesPlaced = 0
  
  // Try C4 first
  for (const pos of c4Tiles) {
    if (entriesPlaced >= config.entryCount) break
    if (usedPositions.has(positionKey(pos))) continue
    
    const tile = getTile(grid, pos)
    if (!tile || tile.interactable !== null) continue
    
    tile.interactable = InteractableType.ENTRY
    entries.push(pos)
    usedPositions.add(positionKey(pos))
    entriesOnC4++
    entriesPlaced++
  }
  
  // Fall back to C3 if needed
  if (entriesPlaced < config.entryCount) {
    console.warn(`Only ${entriesOnC4} C4 tiles available. Using C3 tiles for remaining entries.`)
    
    for (const pos of c3Tiles) {
      if (entriesPlaced >= config.entryCount) break
      if (usedPositions.has(positionKey(pos))) continue
      
      const tile = getTile(grid, pos)
      if (!tile || tile.interactable !== null) continue
      
      tile.interactable = InteractableType.ENTRY
      entries.push(pos)
      usedPositions.add(positionKey(pos))
      entriesOnC3++
      entriesPlaced++
    }
  }
  
  // ============================================================================
  // 3. Place Keys (prefer C3 and C2, randomly mixed)
  // ============================================================================
  const keyTiles = [...c3Tiles, ...c2Tiles].filter(pos => !usedPositions.has(positionKey(pos)))
  shuffleArray(keyTiles, rng)
  
  let keysPlaced = 0
  
  for (const pos of keyTiles) {
    if (keysPlaced >= config.keyCount) break
    
    const tile = getTile(grid, pos)
    if (!tile || tile.interactable !== null) continue
    
    tile.interactable = InteractableType.KEY
    keys.push(pos)
    usedPositions.add(positionKey(pos))
    
    // Track which connectivity level
    if (connectivity.get(3)!.some(p => p.x === pos.x && p.y === pos.y)) {
      keysOnC3++
    } else {
      keysOnC2++
    }
    
    keysPlaced++
  }
  
  if (keysPlaced < config.keyCount) {
    throw new Error(`Could only place ${keysPlaced}/${config.keyCount} keys`)
  }
  
  // ============================================================================
  // 4. Validate and Calculate Stats
  // ============================================================================
  const validation = validateSpawnPointPlacement(grid, entries, exits, keys)
  
  if (!validation.isValid) {
    console.error('⚠️  Spawn point placement validation failed!')
    validation.errors.forEach(err => console.error(`  - ${err}`))
  }
  
  const stats = calculateSpawnPointStats(
    connectivity,
    entriesOnC4,
    entriesOnC3,
    exitsOnC1,
    exitsOnC2,
    keysOnC3,
    keysOnC2
  )
  
  return {
    grid,
    entries,
    exits,
    keys,
    stats
  }
}