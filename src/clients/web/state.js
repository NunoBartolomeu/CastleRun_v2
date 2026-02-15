/**
 * Global state management
 */

export const state = {
  activeModule: 'module1',
  
  data: {
    module1: null,    // MiningResult
    module2_1: null   // BiomeAssignmentResult
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
    }
  }
}

export const MIN_TILE_SIZE = 2
export const MAX_TILE_SIZE = 50