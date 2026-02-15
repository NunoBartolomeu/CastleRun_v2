/**
 * Global state management
 */

export const state = {
  activeModule: 'module1',
  
  data: {
    module1: null,      // MiningResult
    module2_1: null,    // BiomeAssignmentResult
    module2_2: null     // SpawnPointResult (NEW)
  },
  
  visualizer: {
    module1: {
      currentStep: 0,
      isPlaying: false,
      playInterval: null,
      tileSize: 10
    },
    module2_1: {
      currentStep: 0,
      currentCycle: 0,
      isPlaying: false,
      playInterval: null,
      tileSize: 10,
      showFinal: false
    },
    module2_2: {
      tileSize: 10  // Just shows final, no animation
    }
  }
}

export const MIN_TILE_SIZE = 2
export const MAX_TILE_SIZE = 50