/**
 * Pre-generation validation for biome assignment.
 */

import type { BiomeConfig, Grid } from '../../shared/domain/models.js'
import { TileType } from '../../shared/domain/models.js'

/**
 * Validates biome configuration.
 * Throws errors for invalid configurations.
 */
export function validateBiomeConfig(config: BiomeConfig, grid?: Grid): void {
  if (config.biomes.length === 0) {
    throw new Error('At least one biome must be specified')
  }
  
  // Check for duplicate biome types
  const biomeTypes = new Set<string>()
  for (const biome of config.biomes) {
    if (biomeTypes.has(biome.type)) {
      throw new Error(`Duplicate biome type: ${biome.type}. Each biome type should only appear once.`)
    }
    biomeTypes.add(biome.type)
  }
  
  // Validate conversion chances
  if (config.floorConversionChance < 0 || config.floorConversionChance > 1) {
    throw new Error('Floor conversion chance must be between 0 and 1')
  }
  
  if (config.wallConversionChance < 0 || config.wallConversionChance > 1) {
    throw new Error('Wall conversion chance must be between 0 and 1')
  }
  
  // Validate each biome
  for (const biome of config.biomes) {
    if (biome.centerCount < 1) {
      throw new Error(`Biome ${biome.type} must have at least 1 center`)
    }
    
    if (biome.centerCount > 100) {
      console.warn(`Warning: Biome ${biome.type} has ${biome.centerCount} centers. This may be excessive.`)
    }
  }
  
  // If grid provided, check if any tiles already have biomes
  if (grid) {
    let biomesFound = 0
    for (let y = 0; y < grid.height; y++) {
      for (let x = 0; x < grid.width; x++) {
        const tile = grid.tiles[y][x]
        if (tile.type !== TileType.VOID && tile.biome !== null) {
          biomesFound++
        }
      }
    }
    
    if (biomesFound > 0) {
      throw new Error(
        `Grid already has biomes assigned to ${biomesFound} tiles. ` +
        `Please use the original Module 1 grid without biomes.`
      )
    }
  }
  
  // Calculate total centers needed
  const totalCenters = config.biomes.reduce((sum, b) => sum + b.centerCount, 0)
  console.log(`Biome assignment will place ${totalCenters} centers across ${config.biomes.length} biome types`)
}