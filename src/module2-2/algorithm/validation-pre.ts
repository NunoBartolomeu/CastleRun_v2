/**
 * Pre-generation validation for spawn point placement.
 */

import type { SpawnPointConfig, Grid } from '../../shared/domain/models.js'
import { analyzeConnectivity } from './connectivity.js'

/**
 * Validates spawn point configuration.
 * Throws errors for invalid configurations.
 */
export function validateSpawnPointConfig(config: SpawnPointConfig, grid: Grid): void {
  // Validate counts
  if (config.entryCount < 1) {
    throw new Error('Must have at least 1 entry')
  }
  
  if (config.exitCount < 1) {
    throw new Error('Must have at least 1 exit')
  }
  
  if (config.keyCount < 1) {
    throw new Error('Must have at least 1 key')
  }
  
  // Analyze connectivity
  const connectivity = analyzeConnectivity(grid)
  
  const c1 = connectivity.get(1)!.length
  const c2 = connectivity.get(2)!.length
  const c3 = connectivity.get(3)!.length
  const c4 = connectivity.get(4)!.length
  
  console.log(`Connectivity analysis: C1=${c1}, C2=${c2}, C3=${c3}, C4=${c4}`)
  
  // Check if enough tiles for exits (prefer C1, fall back to C2)
  if (c1 + c2 < config.exitCount) {
    throw new Error(
      `Not enough isolated tiles for exits. Need ${config.exitCount}, found ${c1 + c2} (C1+C2)`
    )
  }
  
  // Check if enough tiles for entries (prefer C4, fall back to C3)
  if (c4 + c3 < config.entryCount) {
    throw new Error(
      `Not enough connected tiles for entries. Need ${config.entryCount}, found ${c4 + c3} (C4+C3)`
    )
  }
  
  // Check if enough tiles for keys (prefer C3 and C2)
  const usedTiles = config.entryCount + config.exitCount
  const availableForKeys = c2 + c3 - usedTiles  // Approximate
  
  if (availableForKeys < config.keyCount) {
    console.warn(
      `Warning: Might not have enough C2/C3 tiles for keys. ` +
      `Need ${config.keyCount}, approximately ${availableForKeys} available.`
    )
  }
  
  // Warn about recommendations
  if (config.keyCount < config.exitCount) {
    console.warn(
      `Warning: Fewer keys (${config.keyCount}) than exits (${config.exitCount}). ` +
      `Recommend at least 1 key per exit.`
    )
  }
}