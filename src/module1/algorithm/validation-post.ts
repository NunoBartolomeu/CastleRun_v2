/**
 * Post-generation validation to ensure map follows all rules.
 */

import type { Grid } from '../../shared/domain/models.js'
import { TileType } from '../../shared/domain/models.js'
import { getTile } from '../../shared/utils/grid.js'

/**
 * Validation result with detailed error information.
 */
export interface ValidationResult {
  isValid: boolean
  errors: string[]
}

/**
 * Validates a completed grid follows all mining rules.
 * 
 * Checks:
 * 1. No 2x2 floor patterns exist
 * 2. All border tiles are WALL or VOID (not FLOOR)
 */
export function validateGrid(grid: Grid): ValidationResult {
  const errors: string[] = []
  
  // Check 1: No 2x2 floor patterns
  // Use sliding 2x2 window across entire grid (excluding borders)
  for (let y = 0; y < grid.height - 1; y++) {
    for (let x = 0; x < grid.width - 1; x++) {
      const topLeft = getTile(grid, { x, y })
      const topRight = getTile(grid, { x: x + 1, y })
      const bottomLeft = getTile(grid, { x, y: y + 1 })
      const bottomRight = getTile(grid, { x: x + 1, y: y + 1 })
      
      // Check if all 4 tiles in this 2x2 window are FLOOR
      if (topLeft?.type === TileType.FLOOR &&
          topRight?.type === TileType.FLOOR &&
          bottomLeft?.type === TileType.FLOOR &&
          bottomRight?.type === TileType.FLOOR) {
        errors.push(
          `2x2 floor pattern found at position (${x}, ${y}). ` +
          `Pattern: (${x},${y}), (${x+1},${y}), (${x},${y+1}), (${x+1},${y+1})`
        )
      }
    }
  }
  
  // Check 2: All border tiles must be WALL or VOID (never FLOOR)
  for (let y = 0; y < grid.height; y++) {
    for (let x = 0; x < grid.width; x++) {
      const isBorder = x === 0 || x === grid.width - 1 || y === 0 || y === grid.height - 1
      
      if (isBorder) {
        const tile = getTile(grid, { x, y })
        if (tile?.type === TileType.FLOOR) {
          errors.push(`Border tile at (${x}, ${y}) is FLOOR (should be WALL or VOID)`)
        }
      }
    }
  }
  
  return {
    isValid: errors.length === 0,
    errors
  }
}