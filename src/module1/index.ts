/**
 * Module 1: Map Generation - Public API
 */

// Main algorithm
export { runMiningAlgorithm } from './algorithm/mining.js'

// Validation
export { validateGrid } from './algorithm/validation-post.js'
export type { ValidationResult } from './algorithm/validation-post.js'

// Types (re-export from shared)
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
} from '../shared/domain/models.js'

export { 
  TileType, 
  MiningAction, 
  Direction
} from '../shared/domain/models.js'

export { GRID_CONSTRAINTS, SECTION_CONSTRAINTS } from '../shared/domain/constants.js'

// Utilities
export { getTile, countTiles, cloneGrid } from '../shared/utils/grid.js'
export { isInBounds, isOnBorder, positionKey } from '../shared/utils/position.js'
export { calculateMaxPercentage } from './algorithm/validation-pre.js'