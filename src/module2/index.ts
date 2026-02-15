/**
 * Module 2: Map Filling - Public API
 */

// Module 2.1: Biome Assignment
export { assignBiomes } from './algorithm/biome-assignment.js'
export { validateBiomeConfig } from './algorithm/validation-pre.js'
export { validateBiomeAssignment } from './algorithm/validation-post.js'
export type { BiomeValidationResult } from './algorithm/validation-post.js'

// Types
export type {
  BiomeConfig,
  BiomeDefinition,
  BiomeAssignmentResult,
  BiomePathNode,
  BiomeStats
} from '../shared/domain/models.js'

export { BiomeType, BiomeAction } from '../shared/domain/models.js'