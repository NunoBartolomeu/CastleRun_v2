/**
 * Statistics calculation for biome assignment.
 */

import type { Grid, BiomePathNode, BiomeStats, BiomeType } from '../../shared/domain/models.js'
import { BiomeAction, TileType } from '../../shared/domain/models.js'

/**
 * Calculates comprehensive statistics from biome assignment.
 */
export function calculateBiomeStats(
  grid: Grid,
  path: BiomePathNode[],
  totalCycles: number,
  totalCenters: number  // ADD THIS PARAMETER
): BiomeStats {
  // Count tiles per biome
  const biomeCounts = new Map<BiomeType, number>()
  let tilesWithBiome = 0
  let tilesWithoutBiome = 0
  
  for (let y = 0; y < grid.height; y++) {
    for (let x = 0; x < grid.width; x++) {
      const tile = grid.tiles[y][x]
      
      if (tile.type === TileType.VOID) continue
      
      if (tile.biome !== null) {
        tilesWithBiome++
        biomeCounts.set(tile.biome, (biomeCounts.get(tile.biome) || 0) + 1)
      } else {
        tilesWithoutBiome++
      }
    }
  }
  
  // Calculate coverage percentages
  const totalNonVoidTiles = tilesWithBiome + tilesWithoutBiome
  const biomeCoverage = new Map<BiomeType, number>()
  
  for (const [biomeType, count] of biomeCounts) {
    const percentage = (count / totalNonVoidTiles) * 100
    biomeCoverage.set(biomeType, percentage)
  }
  
  // Count actions
  const convertActions = path.filter(n => n.action === BiomeAction.CONVERT).length
  const skipActions = path.filter(n => n.action === BiomeAction.SKIP).length
  
  return {
    biomeCoverage,
    totalBiomeCenters: totalCenters,  // USE PARAMETER
    tilesWithBiome,
    tilesWithoutBiome,
    conversionAttempts: convertActions + skipActions,
    successfulConversions: convertActions,
    skippedTiles: skipActions,
    totalCycles
  }
}