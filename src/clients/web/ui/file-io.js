/**
 * Save and Load functionality
 */

import { state } from '../state.js'
import { updateModule1Visualizer } from '../modules/module1.js'
import { updateModule2_1Visualizer } from '../modules/module2-1.js'
import { getBiomeList } from './biome-manager.js'
import { 
  createCompactSave, 
  loadCompactSave, 
  isCompactFormat 
} from './compact-encoding.js'

export function initFileIO() {
  document.getElementById('save-map').addEventListener('click', () => saveMap(false))
  document.getElementById('save-compact').addEventListener('click', () => saveMap(true))
  document.getElementById('load-map').addEventListener('click', () => {
    document.getElementById('file-input').click()
  })
  document.getElementById('file-input').addEventListener('change', handleFileLoad)
}

function getModule1Config() {
  return {
    width: parseInt(document.getElementById('m1-width').value),
    height: parseInt(document.getElementById('m1-height').value),
    targetPercentage: parseInt(document.getElementById('m1-target').value),
    breakWallWeight: parseInt(document.getElementById('m1-breakWeight').value),
    backtrackWeight: parseInt(document.getElementById('m1-backtrackWeight').value),
    sectionsX: parseInt(document.getElementById('m1-sectionsX').value),
    sectionsY: parseInt(document.getElementById('m1-sectionsY').value),
    applyVoid: document.getElementById('m1-applyVoid').checked,
    seed: parseInt(document.getElementById('m1-seed').value)
  }
}

function getModule2Config() {
  return {
    biomes: getBiomeList(),
    floorConversionChance: parseInt(document.getElementById('m2-floorChance').value) / 100,
    wallConversionChance: parseInt(document.getElementById('m2-wallChance').value) / 100,
    expansionMode: document.getElementById('m2-expansionMode').value,
    seed: parseInt(document.getElementById('m2-seed').value)
  }
}

function saveMap(compact) {
  let data
  
  if (compact) {
    // Compact format
    const module1Config = state.data.module1 ? getModule1Config() : null
    const module2Config = state.data.module2_1 ? getModule2Config() : null
    
    data = createCompactSave(
      state.data.module1, 
      state.data.module2_1,
      module1Config,
      module2Config
    )
  } else {
    // Full format
    const module1Data = state.data.module1 ? {
      config: getModule1Config(),
      grid: cleanBiomesFromGrid(state.data.module1.grid),
      path: state.data.module1.path,
      stats: state.data.module1.stats
    } : null
    
    const module2Data = state.data.module2_1 ? {
      config: getModule2Config(),
      grid: state.data.module2_1.grid,
      path: state.data.module2_1.path,
      stats: state.data.module2_1.stats
    } : null
    
    data = {
      version: '2.0',
      timestamp: new Date().toISOString(),
      module1: module1Data,
      module2_1: module2Data
    }
  }
  
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  const suffix = compact ? 'compact' : 'full'
  a.download = `castle-run-${suffix}-${Date.now()}.json`
  a.click()
  URL.revokeObjectURL(url)
  
  // Show file size info
  const sizeKB = (blob.size / 1024).toFixed(2)
  console.log(`Saved ${suffix} format: ${sizeKB} KB`)
}

function cleanBiomesFromGrid(grid) {
  const tiles = []
  for (let y = 0; y < grid.height; y++) {
    const row = []
    for (let x = 0; x < grid.width; x++) {
      const original = grid.tiles[y][x]
      row.push({
        type: original.type,
        position: { x: original.position.x, y: original.position.y },
        biome: null
      })
    }
    tiles.push(row)
  }
  return { width: grid.width, height: grid.height, tiles }
}

function handleFileLoad(e) {
  const file = e.target.files[0]
  if (!file) return
  
  const reader = new FileReader()
  reader.onload = (event) => {
    try {
      const data = JSON.parse(event.target.result)
      
      if (!data.version) {
        throw new Error('Invalid file format')
      }
      
      let loadedData
      
      // Check if compact or full format
      if (isCompactFormat(data)) {
        console.log('Loading compact format...')
        loadedData = loadCompactSave(data)
      } else {
        console.log('Loading full format...')
        loadedData = {
          module1: data.module1,
          module2_1: data.module2_1
        }
      }
      
      // Restore data
      if (loadedData.module1) {
        state.data.module1 = loadedData.module1
        state.visualizer.module1.currentStep = 0
        
        // Restore Module 1 config to UI if available
        if (loadedData.module1.config) {
          document.getElementById('m1-width').value = loadedData.module1.config.width
          document.getElementById('m1-height').value = loadedData.module1.config.height
          document.getElementById('m1-target').value = loadedData.module1.config.targetPercentage
          document.getElementById('m1-breakWeight').value = loadedData.module1.config.breakWallWeight
          document.getElementById('m1-backtrackWeight').value = loadedData.module1.config.backtrackWeight
          document.getElementById('m1-sectionsX').value = loadedData.module1.config.sectionsX
          document.getElementById('m1-sectionsY').value = loadedData.module1.config.sectionsY
          document.getElementById('m1-applyVoid').checked = loadedData.module1.config.applyVoid
          document.getElementById('m1-seed').value = loadedData.module1.config.seed
        }
        
        // Show Module 1 sections
        document.getElementById('visualizer-section').style.display = 'block'
        document.getElementById('stats-section').style.display = 'block'
        document.getElementById('controls-module1').classList.add('active')
        document.getElementById('stats-module1').classList.add('active')
        document.getElementById('legend-module1').classList.add('active')
        
        // Update stats
        const stats = loadedData.module1.stats
        document.getElementById('stats-module1').innerHTML = `
          <div class="stat-item">
            <span class="stat-label">Grid Size</span>
            <span class="stat-value">${loadedData.module1.grid.width}×${loadedData.module1.grid.height}</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">Floor %</span>
            <span class="stat-value">${stats.finalPercentage.toFixed(2)}%</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">Total Steps</span>
            <span class="stat-value">${stats.totalSteps}</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">Break Actions</span>
            <span class="stat-value">${stats.breakActions}</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">Backtrack Actions</span>
            <span class="stat-value">${stats.backtrackActions}</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">Time</span>
            <span class="stat-value">${stats.executionTimeMs.toFixed(2)}ms</span>
          </div>
        `
      }
      
      if (loadedData.module2_1) {
        state.data.module2_1 = loadedData.module2_1
        state.visualizer.module2_1.currentStep = 0
        state.visualizer.module2_1.showFinal = false
        
        // Restore Module 2 config to UI if available
        if (loadedData.module2_1.config) {
          document.getElementById('m2-floorChance').value = loadedData.module2_1.config.floorConversionChance * 100
          document.getElementById('m2-wallChance').value = loadedData.module2_1.config.wallConversionChance * 100
          document.getElementById('m2-expansionMode').value = loadedData.module2_1.config.expansionMode
          document.getElementById('m2-seed').value = loadedData.module2_1.config.seed
          
          // TODO: Restore biome list to UI (would need to rebuild biome entries)
        }
      }
      
      // Refresh current view
      if (state.activeModule === 'module1' && state.data.module1) {
        updateModule1Visualizer()
      } else if (state.activeModule === 'module2-1' && state.data.module2_1) {
        updateModule2_1Visualizer()
      }
      
      alert('Map loaded successfully!')
    } catch (error) {
      alert('Error loading file: ' + error.message)
      console.error(error)
    }
  }
  
  reader.readAsText(file)
  e.target.value = '' // Reset input
}