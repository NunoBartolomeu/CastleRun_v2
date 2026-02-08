/**
 * Public API for Castle Run map generation.
 * This is what clients (console, UI) will import.
 */

// Main algorithm
export { runMiningAlgorithm } from './module1/algorithm/mining.js'

// Validation
export { validateGrid } from './module1/algorithm/validation-post.js'  // ADD THIS
export type { ValidationResult } from './module1/algorithm/validation-post.js'  // ADD THIS

// Types
export type { 
  MiningConfig,
  MiningResult,
  Grid,
  Tile,
  Position,
  PathNode,
  MiningStats,
  Viewport,
  VisualizerInput,
  VisualizerState
} from './shared/domain/models.js'

// Enums
export { 
  TileType, 
  MiningAction, 
  Direction,
  RegionType 
} from './shared/domain/models.js'

// Constants
export { GRID_CONSTRAINTS } from './shared/domain/constants.js'

// Utilities that clients might need
export { getTile, countTiles, cloneGrid } from './shared/utils/grid.js'
export { isInBounds, isOnBorder, positionKey } from './shared/utils/position.js'
export { calculateMaxPercentage } from './module1/algorithm/validation.js'