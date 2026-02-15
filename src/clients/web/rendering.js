/**
 * Canvas rendering utilities
 */

import { TileType } from '../../../dist/shared/domain/models.js'
import { TILE_COLORS, BIOME_COLORS } from './constants.js'

const canvas = document.getElementById('canvas')
const ctx = canvas.getContext('2d')

export function getTileColor(tile, module) {
  if (tile.type === TileType.VOID) {
    return TILE_COLORS[TileType.VOID]
  }
  
  if (module === 'module2-1' && tile.biome !== null) {
    const biomeColors = BIOME_COLORS[tile.biome]
    return tile.type === TileType.FLOOR ? biomeColors.floor : biomeColors.wall
  }
  
  // WALL without biome = grey (not brown)
  if (tile.type === TileType.WALL && tile.biome === null) {
    return '#6b7280'  // Grey
  }
  
  return TILE_COLORS[tile.type]
}

export function renderGrid(grid, highlightPos, module, tileSize) {
  canvas.width = grid.width * tileSize
  canvas.height = grid.height * tileSize
  
  for (let y = 0; y < grid.height; y++) {
    for (let x = 0; x < grid.width; x++) {
      const tile = grid.tiles[y][x]
      ctx.fillStyle = getTileColor(tile, module)
      ctx.fillRect(x * tileSize, y * tileSize, tileSize, tileSize)
      
      // Grid lines (only if tiles are large enough)
      if (tileSize >= 10) {
        ctx.strokeStyle = '#00000020'
        ctx.strokeRect(x * tileSize, y * tileSize, tileSize, tileSize)
      }
    }
  }
  
  // Highlight current position with white inward border
  if (highlightPos) {
    const x = highlightPos.x
    const y = highlightPos.y
    const borderWidth = Math.max(1, Math.floor(tileSize * 0.25))  // 15% of tile size
    
    ctx.strokeStyle = '#000000'
    ctx.lineWidth = borderWidth
    
    // Draw inward border (offset by half the border width)
    const offset = borderWidth / 2
    ctx.strokeRect(
      x * tileSize + offset,
      y * tileSize + offset,
      tileSize - borderWidth,
      tileSize - borderWidth
    )
  }
}