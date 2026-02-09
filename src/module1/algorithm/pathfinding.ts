/**
 * Core mining loop logic with performance optimizations.
 */

import type { Grid, Position, Direction, MiningConfig } from '../../shared/domain/models.js'
import { TileType, MiningAction } from '../../shared/domain/models.js'
import { getTile, setTile } from '../../shared/utils/grid.js'
import { getPositionInDirection } from '../../shared/utils/position.js'
import { CARDINAL_DIRECTIONS } from '../../shared/utils/direction.js'
import { canBreakWall } from './rules.js'
import type { SeededRandom } from '../../shared/utils/random.js'
import type { Section } from './sections.js'
import { isInSection } from './sections.js'

/**
 * Cache for wall breaking checks using 2D boolean arrays.
 */
export interface BreakabilityCache {
  cantBreak: boolean[][]
  noFurtherBreak: boolean[][]
}

/**
 * Creates a new breakability cache with 2D boolean arrays.
 */
export function createBreakabilityCache(width: number, height: number): BreakabilityCache {
  const cantBreak: boolean[][] = []
  const noFurtherBreak: boolean[][] = []
  
  for (let y = 0; y < height; y++) {
    cantBreak.push(new Array(width).fill(false))
    noFurtherBreak.push(new Array(width).fill(false))
  }
  
  return { cantBreak, noFurtherBreak }
}

/**
 * Checks if a wall can be broken, using cache to avoid redundant checks.
 */
function canBreakWallCached(
  grid: Grid,
  pos: Position,
  direction: Direction,
  cache: BreakabilityCache,
  section?: Section
): boolean {
  const targetPos = getPositionInDirection(pos, direction)
  
  // Check if position is in bounds
  if (targetPos.y < 0 || targetPos.y >= grid.height || 
      targetPos.x < 0 || targetPos.x >= grid.width) {
    return false
  }
  
  // Check cache first
  if (cache.cantBreak[targetPos.y][targetPos.x]) {
    return false
  }
  
  if (cache.noFurtherBreak[pos.y][pos.x]) {
    return false
  }
  
  // Perform actual check
  const breakable = canBreakWall(grid, pos, direction, section)
  
  // Update cache
  if (!breakable) {
    cache.cantBreak[targetPos.y][targetPos.x] = true
  }
  
  return breakable
}

/**
 * Updates cache when a floor is created.
 */
export function updateCacheAfterBreak(
  grid: Grid,
  newFloorPos: Position,
  cache: BreakabilityCache,
  section?: Section
): void {
  let blocksAllAdjacent = true
  
  for (const direction of CARDINAL_DIRECTIONS) {
    const adjPos = getPositionInDirection(newFloorPos, direction)
    const adjTile = getTile(grid, adjPos)
    
    if (adjTile && adjTile.type === TileType.WALL) {
      if (canBreakWall(grid, newFloorPos, direction, section)) {
        blocksAllAdjacent = false
      } else {
        cache.cantBreak[adjPos.y][adjPos.x] = true
      }
    }
  }
  
  if (blocksAllAdjacent) {
    cache.noFurtherBreak[newFloorPos.y][newFloorPos.x] = true
  }
}

/**
 * Gets weighted array of valid moves from current position.
 * Respects section boundaries - miner cannot cross into other sections.
 */
export function getValidMoves(
  grid: Grid,
  pos: Position,
  config: MiningConfig,
  rng: SeededRandom,
  cache: BreakabilityCache,
  section?: Section
): Direction[] {
  const weighted: Direction[] = []
  
  for (const direction of CARDINAL_DIRECTIONS) {
    const targetPos = getPositionInDirection(pos, direction)
    const targetTile = getTile(grid, targetPos)
    
    if (!targetTile) continue
    
    // If using sections, check if target is within section bounds
    if (section && !isInSection(targetPos, section)) {
      continue  // Cannot move outside section
    }
    
    // If target is WALL and can be broken, add with breakWallWeight
    if (targetTile.type === TileType.WALL && canBreakWallCached(grid, pos, direction, cache, section)) {
      for (let i = 0; i < config.breakWallWeight; i++) {
        weighted.push(direction)
      }
    }
    
    // If target is FLOOR, add with backtrackWeight
    if (targetTile.type === TileType.FLOOR) {
      for (let i = 0; i < config.backtrackWeight; i++) {
        weighted.push(direction)
      }
    }
  }
  
  return weighted
}

/**
 * Determines the action type based on target tile.
 */
export function determineAction(grid: Grid, targetPos: Position): MiningAction {
  const tile = getTile(grid, targetPos)
  if (!tile) {
    throw new Error(`Invalid target position: ${targetPos.x}, ${targetPos.y}`)
  }
  
  return tile.type === TileType.WALL ? MiningAction.BREAK : MiningAction.BACKTRACK
}