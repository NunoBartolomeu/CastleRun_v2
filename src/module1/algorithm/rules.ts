/**
 * Wall breaking rules for mining algorithm.
 */

import type { Grid, Position, Direction } from '../../shared/domain/models.js'
import { TileType, Direction as Dir } from '../../shared/domain/models.js'
import { getTile } from '../../shared/utils/grid.js'
import { getPositionInDirection, isOnBorder } from '../../shared/utils/position.js'

/**
 * Determines if a wall can be broken following mining rules.
 * 
 * Rules:
 * 1. Target position cannot be on border
 * 2. Breaking wall cannot create 2x2 floor block
 */
export function canBreakWall(
  grid: Grid, 
  pos: Position, 
  direction: Direction
): boolean {
  const targetPos = getPositionInDirection(pos, direction)
  
  // Rule 1: Border check
  if (isOnBorder(targetPos, grid.width, grid.height)) {
    return false
  }
  
  // Rule 2: 2x2 floor check
  // Check all 4 possible 2x2 patterns where targetPos would be one corner
  // Each pattern is defined by: [cardinal1, cardinal2, diagonal]
  const patterns: [Direction, Direction, Direction][] = [
    [Dir.N, Dir.E, Dir.NE],  // Top-right 2x2
    [Dir.N, Dir.W, Dir.NW],  // Top-left 2x2
    [Dir.S, Dir.E, Dir.SE],  // Bottom-right 2x2
    [Dir.S, Dir.W, Dir.SW]   // Bottom-left 2x2
  ]
  
  for (const [card1, card2, diag] of patterns) {
    const pos1 = getPositionInDirection(targetPos, card1)
    const pos2 = getPositionInDirection(targetPos, card2)
    const posDiag = getPositionInDirection(targetPos, diag)
    
    const tile1 = getTile(grid, pos1)
    const tile2 = getTile(grid, pos2)
    const tileDiag = getTile(grid, posDiag)
    
    // If all 3 other corners are FLOOR, breaking target would create 2x2
    if (tile1 && tile1.type === TileType.FLOOR &&
        tile2 && tile2.type === TileType.FLOOR &&
        tileDiag && tileDiag.type === TileType.FLOOR) {
      return false
    }
  }
  
  return true
}