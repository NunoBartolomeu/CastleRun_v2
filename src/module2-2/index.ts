/**
 * Module 2.2: Spawn Points - Public API
 */

export { placeSpawnPoints } from './algorithm/placement.js'
export { validateSpawnPointConfig } from './algorithm/validation-pre.js'
export { validateSpawnPointPlacement } from './algorithm/validation-post.js'
export type { SpawnPointValidationResult } from './algorithm/validation-post.js'

// Types
export type {
  SpawnPointConfig,
  SpawnPointResult,
  SpawnPointStats
} from '../shared/domain/models.js'

export { InteractableType } from '../shared/domain/models.js'