/**
 * Core mining loop logic.
 */

import type { Grid, Position, Direction, MiningConfig } from '../../shared/domain/models.js'
import { TileType, MiningAction } from '../../shared/domain/models.js'
import { getTile, setTile } from '../../shared/utils/grid.js'
import { getPositionInDirection } from '../../shared/utils/position.js'
import { CARDINAL_DIRECTIONS } from '../../shared/utils/direction.js'
import { canBreakWall } from './rules.js'
import type { SeededRandom } from '../../shared/utils/random.js'

/**
 * Gets weighted array of valid moves from current position.
 * Never returns empty array (miner always has at least one valid move).
 */
export function getValidMoves(
  grid: Grid,
  pos: Position,
  config: MiningConfig,
  rng: SeededRandom
): Direction[] {
  const weighted: Direction[] = []
  
  for (const direction of CARDINAL_DIRECTIONS) {
    const targetPos = getPositionInDirection(pos, direction)
    const targetTile = getTile(grid, targetPos)
    
    if (!targetTile) continue
    
    // If target is WALL and can be broken, add with breakWallWeight
    if (targetTile.type === TileType.WALL && canBreakWall(grid, pos, direction)) {
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

/**
 * Checks if mining should stop based on target percentage.
 */
export function shouldStop(grid: Grid, targetPercentage: number): boolean {
  const totalTiles = grid.width * grid.height
  const floorTiles = getTile(grid, { x: 0, y: 0 }) // Will count properly
  let floorCount = 0
  
  // Count floor tiles
  for (let y = 0; y < grid.height; y++) {
    for (let x = 0; x < grid.width; x++) {
      const tile = grid.tiles[y][x]
      if (tile.type === TileType.FLOOR) {
        floorCount++
      }
    }
  }
  
  const currentPercentage = (floorCount / totalTiles) * 100
  return currentPercentage >= targetPercentage
}