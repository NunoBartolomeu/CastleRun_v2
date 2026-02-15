/**
 * Post-generation validation for biome assignment.
 */

import type { Grid } from '../../shared/domain/models.js'
import { TileType } from '../../shared/domain/models.js'

export interface BiomeValidationResult {
  isValid: boolean
  errors: string[]
  warnings: string[]
}

/**
 * Validates that all non-VOID tiles have biomes assigned.
 */
export function validateBiomeAssignment(grid: Grid): BiomeValidationResult {
  const errors: string[] = []
  const warnings: string[] = []
  let unassignedCount = 0
  
  for (let y = 0; y < grid.height; y++) {
    for (let x = 0; x < grid.width; x++) {
      const tile = grid.tiles[y][x]
      
      if (tile.type !== TileType.VOID && tile.biome === null) {
        unassignedCount++
        if (unassignedCount <= 10) {
          // Only log first 10 to avoid spam
          errors.push(`Tile at (${x}, ${y}) [${tile.type}] has no biome`)
        }
      }
    }
  }
  
  if (unassignedCount > 10) {
    errors.push(`... and ${unassignedCount - 10} more unassigned tiles`)
  }
  
  console.log(`Biome validation: ${unassignedCount} unassigned tiles found`)

  return {
    isValid: unassignedCount === 0,
    errors,
    warnings
  }
}