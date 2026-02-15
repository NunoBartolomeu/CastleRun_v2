/**
 * Post-generation validation for spawn point placement.
 */

import type { Grid, Position } from '../../shared/domain/models.js'
import { InteractableType } from '../../shared/domain/models.js'

export interface SpawnPointValidationResult {
  isValid: boolean
  errors: string[]
  warnings: string[]
}

/**
 * Validates that spawn points were placed correctly.
 */
export function validateSpawnPointPlacement(
  grid: Grid,
  entries: Position[],
  exits: Position[],
  keys: Position[]
): SpawnPointValidationResult {
  const errors: string[] = []
  const warnings: string[] = []
  
  // Check counts match
  let entryCount = 0
  let exitCount = 0
  let keyCount = 0
  
  for (let y = 0; y < grid.height; y++) {
    for (let x = 0; x < grid.width; x++) {
      const tile = grid.tiles[y][x]
      
      if (tile.interactable === InteractableType.ENTRY) entryCount++
      if (tile.interactable === InteractableType.EXIT) exitCount++
      if (tile.interactable === InteractableType.KEY) keyCount++
    }
  }
  
  if (entryCount !== entries.length) {
    errors.push(`Entry count mismatch: grid has ${entryCount}, array has ${entries.length}`)
  }
  
  if (exitCount !== exits.length) {
    errors.push(`Exit count mismatch: grid has ${exitCount}, array has ${exits.length}`)
  }
  
  if (keyCount !== keys.length) {
    errors.push(`Key count mismatch: grid has ${keyCount}, array has ${keys.length}`)
  }
  
  // Check for duplicates
  const allPositions = [...entries, ...exits, ...keys]
  const positionSet = new Set(allPositions.map(p => `${p.x},${p.y}`))
  
  if (positionSet.size !== allPositions.length) {
    errors.push('Duplicate positions detected in spawn points')
  }
  
  return {
    isValid: errors.length === 0,
    errors,
    warnings
  }
}