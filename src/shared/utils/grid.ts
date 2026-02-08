/**
 * Grid manipulation utilities.
 */

import type { Grid, Tile, Position, TileType } from '../domain/models.js'
import { TileType as TT } from '../domain/models.js'

/**
 * Creates empty grid filled with specified tile type.
 */
export function createEmptyGrid(width: number, height: number, fillType: TileType): Grid {
  const tiles: Tile[][] = []
  
  for (let y = 0; y < height; y++) {
    const row: Tile[] = []
    for (let x = 0; x < width; x++) {
      row.push({
        type: fillType,
        position: { x, y },
        region: null
      })
    }
    tiles.push(row)
  }
  
  return { width, height, tiles }
}

/**
 * Gets tile at position (with bounds checking).
 * Returns null if out of bounds.
 */
export function getTile(grid: Grid, pos: Position): Tile | null {
  if (pos.y < 0 || pos.y >= grid.height || pos.x < 0 || pos.x >= grid.width) {
    return null
  }
  return grid.tiles[pos.y][pos.x]
}

/**
 * Sets tile type at position (with bounds checking).
 * Returns true if successful, false if out of bounds.
 */
export function setTile(grid: Grid, pos: Position, type: TileType): boolean {
  const tile = getTile(grid, pos)
  if (!tile) return false
  
  tile.type = type
  return true
}

/**
 * Counts tiles of a specific type in the grid.
 */
export function countTiles(grid: Grid, tileType: TileType): number {
  let count = 0
  for (let y = 0; y < grid.height; y++) {
    for (let x = 0; x < grid.width; x++) {
      if (grid.tiles[y][x].type === tileType) {
        count++
      }
    }
  }
  return count
}

/**
 * Creates a deep copy of a grid.
 */
export function cloneGrid(grid: Grid): Grid {
  const tiles: Tile[][] = []
  
  for (let y = 0; y < grid.height; y++) {
    const row: Tile[] = []
    for (let x = 0; x < grid.width; x++) {
      const original = grid.tiles[y][x]
      row.push({
        type: original.type,
        position: { x: original.position.x, y: original.position.y },
        region: original.region
      })
    }
    tiles.push(row)
  }
  
  return { width: grid.width, height: grid.height, tiles }
}