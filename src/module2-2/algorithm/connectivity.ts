/**
 * Connectivity analysis for spawn point placement.
 * Categorizes floor tiles by number of adjacent floor tiles.
 */

import type { Grid, Position } from '../../shared/domain/models.js'
import { TileType } from '../../shared/domain/models.js'
import { getTile } from '../../shared/utils/grid.js'
import { getPositionInDirection, positionKey } from '../../shared/utils/position.js'
import { CARDINAL_DIRECTIONS } from '../../shared/utils/direction.js'

/**
 * Connectivity map: number of connections -> positions
 */
export type ConnectivityMap = Map<number, Position[]>

/**
 * Analyzes grid and categorizes floor tiles by connectivity.
 * 
 * @param grid - Grid to analyze
 * @returns Map of connectivity (1-4) to positions
 */
export function analyzeConnectivity(grid: Grid): ConnectivityMap {
  const connectivity = new Map<number, Position[]>()
  connectivity.set(1, [])  // C1 - dead ends
  connectivity.set(2, [])  // C2
  connectivity.set(3, [])  // C3
  connectivity.set(4, [])  // C4 - most connected
  
  for (let y = 0; y < grid.height; y++) {
    for (let x = 0; x < grid.width; x++) {
      const tile = grid.tiles[y][x]
      
      // Only analyze floor tiles
      if (tile.type !== TileType.FLOOR) continue
      
      // Count adjacent floor tiles (cardinal directions only)
      let adjacentFloors = 0
      for (const direction of CARDINAL_DIRECTIONS) {
        const neighborPos = getPositionInDirection({ x, y }, direction)
        const neighbor = getTile(grid, neighborPos)
        
        if (neighbor?.type === TileType.FLOOR) {
          adjacentFloors++
        }
      }
      
      // Add to appropriate connectivity group
      if (adjacentFloors >= 1 && adjacentFloors <= 4) {
        connectivity.get(adjacentFloors)!.push({ x, y })
      }
    }
  }
  
  return connectivity
}

/**
 * Shuffles an array in place using Fisher-Yates algorithm.
 */
export function shuffleArray<T>(array: T[], rng: { next: () => number }): void {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(rng.next() * (i + 1))
    ;[array[i], array[j]] = [array[j], array[i]]
  }
}