/**
 * Post-processing operations after mining completes.
 */

import type { Grid, Position } from '../../shared/domain/models.js'
import { TileType, Direction } from '../../shared/domain/models.js'
import { getTile, setTile } from '../../shared/utils/grid.js'
import { getPositionInDirection, isInBounds, positionKey } from '../../shared/utils/position.js'
import { ALL_DIRECTIONS } from '../../shared/utils/direction.js'

/**
 * Applies VOID to unreachable outer walls using BFS.
 * 
 * Algorithm:
 * 1. Start with all border WALL tiles
 * 2. For each: if no adjacent FLOOR (in any of 8 directions) -> convert to VOID
 * 3. When tile becomes VOID -> add its WALL neighbors to queue
 * 4. Continue until no more tiles can become VOID
 */
export function applyVoidToEdges(grid: Grid): void {
  const visited = new Set<string>()
  const queue: Position[] = []
  
  // Step 1: Collect all border tiles that are WALL
  for (let y = 0; y < grid.height; y++) {
    for (let x = 0; x < grid.width; x++) {
      const pos = { x, y }
      const isBorder = x === 0 || x === grid.width - 1 || y === 0 || y === grid.height - 1
      
      if (isBorder) {
        const tile = getTile(grid, pos)
        if (tile && tile.type === TileType.WALL) {
          queue.push(pos)
        }
      }
    }
  }
  
  // Step 2: BFS from border tiles
  while (queue.length > 0) {
    const currentPos = queue.shift()!
    const key = positionKey(currentPos)
    
    if (visited.has(key)) {
      continue
    }
    
    visited.add(key)
    const currentTile = getTile(grid, currentPos)
    
    // Only process WALL tiles
    if (!currentTile || currentTile.type !== TileType.WALL) {
      continue
    }
    
    // Check if any adjacent tile (including diagonals) is FLOOR
    let hasAdjacentFloor = false
    for (const direction of ALL_DIRECTIONS) {
      const neighborPos = getPositionInDirection(currentPos, direction)
      if (isInBounds(neighborPos, grid.width, grid.height)) {
        const neighborTile = getTile(grid, neighborPos)
        if (neighborTile && neighborTile.type === TileType.FLOOR) {
          hasAdjacentFloor = true
          break
        }
      }
    }
    
    if (hasAdjacentFloor) {
      // Keep as WALL - don't propagate
      continue
    } else {
      // Convert to VOID and propagate to neighbors
      setTile(grid, currentPos, TileType.VOID)
      
      // Add all unvisited WALL neighbors to queue
      for (const direction of ALL_DIRECTIONS) {
        const neighborPos = getPositionInDirection(currentPos, direction)
        const neighborKey = positionKey(neighborPos)
        
        if (isInBounds(neighborPos, grid.width, grid.height) && !visited.has(neighborKey)) {
          const neighborTile = getTile(grid, neighborPos)
          if (neighborTile && neighborTile.type === TileType.WALL) {
            queue.push(neighborPos)
          }
        }
      }
    }
  }
}