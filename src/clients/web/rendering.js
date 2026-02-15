/**
 * Canvas rendering utilities
 */

import { TileType } from '../../../dist/shared/domain/models.js'
import { TILE_COLORS, BIOME_COLORS, INTERACTABLE_COLORS } from './constants.js'

const canvas = document.getElementById('canvas')
const ctx = canvas.getContext('2d')

export function getTileColor(tile, module) {
  if (tile.type === TileType.VOID) {
    return TILE_COLORS[TileType.VOID]
  }
  
  if ((module === 'module2-1' || module === 'module2-2') && tile.biome !== null) {
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
      
      // For Module 2.2, render with alpha overlay
      if (module === 'module2-2') {
        // Base color (no biome)
        if (tile.type === TileType.VOID) {
          ctx.fillStyle = TILE_COLORS[TileType.VOID]
        } else if (tile.type === TileType.WALL) {
          ctx.fillStyle = '#6b7280'  // Grey for walls
        } else {
          ctx.fillStyle = TILE_COLORS[TileType.FLOOR]
        }
        ctx.fillRect(x * tileSize, y * tileSize, tileSize, tileSize)
        
        // Biome overlay with 50% alpha
        if (tile.biome !== null) {
          const biomeColors = BIOME_COLORS[tile.biome]
          const biomeColor = tile.type === TileType.FLOOR ? biomeColors.floor : biomeColors.wall
          
          // Set alpha to 0.5 (50%)
          ctx.globalAlpha = 0.5
          ctx.fillStyle = biomeColor
          ctx.fillRect(x * tileSize, y * tileSize, tileSize, tileSize)
          ctx.globalAlpha = 1.0  // Reset alpha
        }
      } else {
        // Normal rendering for other modules
        ctx.fillStyle = getTileColor(tile, module)
        ctx.fillRect(x * tileSize, y * tileSize, tileSize, tileSize)
      }
      
      // Grid lines (only if tiles are large enough)
      if (tileSize >= 10) {
        ctx.strokeStyle = '#00000020'
        ctx.strokeRect(x * tileSize, y * tileSize, tileSize, tileSize)
      }
      
      // Render interactable (if present)
      if (tile.interactable) {
        renderInteractable(tile, x, y, tileSize)
      }
    }
  }
  
  // Highlight current position with white inward border
  if (highlightPos) {
    const x = highlightPos.x
    const y = highlightPos.y
    const borderWidth = Math.max(1, Math.floor(tileSize * 0.15))
    
    ctx.strokeStyle = '#ffffff'
    ctx.lineWidth = borderWidth
    
    const offset = borderWidth / 2
    ctx.strokeRect(
      x * tileSize + offset,
      y * tileSize + offset,
      tileSize - borderWidth,
      tileSize - borderWidth
    )
  }
}

function renderInteractable(tile, x, y, tileSize) {
  const centerX = x * tileSize + tileSize / 2
  const centerY = y * tileSize + tileSize / 2
  const dotRadius = Math.max(3, tileSize * 0.3)  // Increased from 0.15 to 0.25 (25% of tile)
  
  // Draw colored dot (solid, no transparency)
  ctx.fillStyle = INTERACTABLE_COLORS[tile.interactable]
  ctx.beginPath()
  ctx.arc(centerX, centerY, dotRadius, 0, Math.PI * 2)
  ctx.fill()
  
  // Add white outline for visibility (thicker)
  ctx.strokeStyle = '#ffffff'
  ctx.lineWidth = Math.max(1.5, dotRadius * 0.4)  // Increased from 0.3 to 0.4
  ctx.beginPath()
  ctx.arc(centerX, centerY, dotRadius, 0, Math.PI * 2)
  ctx.stroke()
}