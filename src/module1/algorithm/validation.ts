/**
 * Configuration validation for mining algorithm.
 */

import type { MiningConfig } from '../../shared/domain/models.js'
import { GRID_CONSTRAINTS } from '../../shared/domain/constants.js'
import { isInBounds, isOnBorder } from '../../shared/utils/position.js'

/**
 * Calculates theoretical maximum floor percentage for given grid size.
 * Based on odd row/column pattern accounting for no-2x2 rule.
 */
export function calculateMaxPercentage(width: number, height: number): number {
  const innerWidth = width - 2
  const innerHeight = height - 2
  
  const oddRows = Math.ceil(innerHeight / 2)
  const evenRows = Math.floor(innerHeight / 2)
  const oddCols = Math.ceil(innerWidth / 2)
  
  const maxFloorTiles = (oddRows * innerWidth) + (evenRows * oddCols)
  const totalTiles = width * height
  const maxPercentage = (maxFloorTiles / totalTiles) * 100
  
  return maxPercentage
}

/**
 * Validates mining configuration against constraints.
 * Throws errors for hard constraint violations.
 * Logs warnings for soft recommendation violations.
 */
export function validateMiningConfig(config: MiningConfig): void {
  // Size validation - hard constraints
  if (config.width < GRID_CONSTRAINTS.MATHEMATICAL_MIN_SIZE || 
      config.height < GRID_CONSTRAINTS.MATHEMATICAL_MIN_SIZE) {
    throw new Error(
      `Grid size must be at least ${GRID_CONSTRAINTS.MATHEMATICAL_MIN_SIZE}x${GRID_CONSTRAINTS.MATHEMATICAL_MIN_SIZE}. ` +
      `Got ${config.width}x${config.height}`
    )
  }
  
  // Size validation - soft recommendations
  if (config.width < GRID_CONSTRAINTS.RECOMMENDED_MIN_SIZE || 
      config.height < GRID_CONSTRAINTS.RECOMMENDED_MIN_SIZE) {
    console.warn(
      `Warning: Grid size ${config.width}x${config.height} is below recommended minimum ` +
      `of ${GRID_CONSTRAINTS.RECOMMENDED_MIN_SIZE}x${GRID_CONSTRAINTS.RECOMMENDED_MIN_SIZE}`
    )
  }
  
  // Percentage validation - hard constraints
  if (config.targetPercentage <= 0 || config.targetPercentage > 100) {
    throw new Error(
      `Target percentage must be between 0 and 100. Got ${config.targetPercentage}`
    )
  }
  
  if (config.targetPercentage > GRID_CONSTRAINTS.ALLOWED_MAX_PERCENT) {
    throw new Error(
      `Target percentage ${config.targetPercentage}% exceeds allowed maximum of ` +
      `${GRID_CONSTRAINTS.ALLOWED_MAX_PERCENT}%`
    )
  }
  
  // Percentage validation - soft recommendations
  if (config.targetPercentage > GRID_CONSTRAINTS.RECOMMENDED_MAX_PERCENT) {
    console.warn(
      `Warning: Target percentage ${config.targetPercentage}% exceeds recommended maximum ` +
      `of ${GRID_CONSTRAINTS.RECOMMENDED_MAX_PERCENT}%`
    )
  }
  
  // Weight validation
  if (config.breakWallWeight <= 0) {
    throw new Error(
      `Break wall weight must be greater than 0. Got ${config.breakWallWeight}`
    )
  }
  
  if (config.backtrackWeight <= 0) {
    throw new Error(
      `Backtrack weight must be greater than 0. Got ${config.backtrackWeight}`
    )
  }
  
  // Starting position validation (if provided)
  if (config.startingPos) {
    if (!isInBounds(config.startingPos, config.width, config.height)) {
      throw new Error(
        `Starting position (${config.startingPos.x}, ${config.startingPos.y}) is out of bounds ` +
        `for grid size ${config.width}x${config.height}`
      )
    }
    
    if (isOnBorder(config.startingPos, config.width, config.height)) {
      throw new Error(
        `Starting position (${config.startingPos.x}, ${config.startingPos.y}) cannot be on border`
      )
    }
  }
}