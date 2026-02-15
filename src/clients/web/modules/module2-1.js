/**
 * Module 2.1: Biome visualization and controls
 */

import { assignBiomes, BiomeAction } from '../../../../dist/module2-1/index.js'
import { state, MIN_TILE_SIZE, MAX_TILE_SIZE } from '../state.js'
import { renderGrid } from '../rendering.js'
import { BIOME_COLORS, BIOME_NAMES } from '../constants.js'
import { getBiomeList } from '../ui/biome-manager.js'

function reconstructBiomeGridAtStep(path, stepIndex, originalGrid) {
  const grid = {
    width: originalGrid.width,
    height: originalGrid.height,
    tiles: []
  }
  
  for (let y = 0; y < originalGrid.height; y++) {
    const row = []
    for (let x = 0; x < originalGrid.width; x++) {
      row.push({
        type: originalGrid.tiles[y][x].type,
        position: { x, y },
        biome: null
      })
    }
    grid.tiles.push(row)
  }
  
  for (let i = 0; i <= stepIndex && i < path.length; i++) {
    const node = path[i]
    if (node.action === BiomeAction.CONVERT || node.action === BiomeAction.CENTER) {
      grid.tiles[node.position.y][node.position.x].biome = node.biomeType
    }
  }
  
  return grid
}

export function updateModule2_1Visualizer() {
  const result = state.data.module2_1
  if (!result) return
  
  const s = state.visualizer.module2_1
  
  if (s.showFinal) {
    renderGrid(result.grid, null, 'module2-1', s.tileSize)
    document.getElementById('m2-current-cycle').textContent = result.stats.totalCycles
    document.getElementById('m2-current-step').textContent = result.path.length
    document.getElementById('m2-current-action').textContent = 'FINAL'
    document.getElementById('m2-current-biome').textContent = '-'
    document.getElementById('m2-current-position').textContent = '-'
  } else {
    const node = result.path[s.currentStep]
    const grid = reconstructBiomeGridAtStep(result.path, s.currentStep, state.data.module1.grid)
    
    renderGrid(grid, node.position, 'module2-1', s.tileSize)
    
    document.getElementById('m2-current-cycle').textContent = node.cycleNumber
    document.getElementById('m2-total-cycles').textContent = result.stats.totalCycles
    document.getElementById('m2-current-step').textContent = s.currentStep + 1
    document.getElementById('m2-total-steps').textContent = result.path.length
    document.getElementById('m2-current-action').textContent = node.action
    document.getElementById('m2-current-biome').textContent = BIOME_NAMES[node.biomeType]
    document.getElementById('m2-current-position').textContent = `${node.position.x},${node.position.y}`
  }
}

export function generateModule2_1() {
  if (!state.data.module1) {
    alert('Please generate a Module 1 map first!')
    return
  }
  
  const biomes = getBiomeList()
  
  if (biomes.length === 0) {
    alert('Please add at least one biome!')
    return
  }
  
  const config = {
    biomes,
    floorConversionChance: parseInt(document.getElementById('m2-floorChance').value) / 100,
    wallConversionChance: parseInt(document.getElementById('m2-wallChance').value) / 100,
    expansionMode: document.getElementById('m2-expansionMode').value,
    seed: parseInt(document.getElementById('m2-seed').value)
  }
  
  try {
    const btn = document.getElementById('generate-module2-1')
    btn.disabled = true
    btn.textContent = 'Assigning...'
    
    // IMPORTANT: Clone Module 1 grid to avoid mutation
    const gridCopy = cloneGrid(state.data.module1.grid)
    
    const result = assignBiomes(gridCopy, config)
    state.data.module2_1 = result
    state.visualizer.module2_1.currentStep = 0
    state.visualizer.module2_1.currentCycle = 0
    state.visualizer.module2_1.showFinal = false
    
    updateBiomeLegend(result.stats.biomeCoverage)
    updateBiomeStats(result.stats)
    updateModule2_1Visualizer()
    
    btn.disabled = false
    btn.textContent = 'Assign Biomes'
  } catch (error) {
    alert('Error: ' + error.message)
    document.getElementById('generate-module2-1').disabled = false
    document.getElementById('generate-module2-1').textContent = 'Assign Biomes'
  }
}

// Helper function to clone grid
function cloneGrid(grid) {
  const tiles = []
  for (let y = 0; y < grid.height; y++) {
    const row = []
    for (let x = 0; x < grid.width; x++) {
      const original = grid.tiles[y][x]
      row.push({
        type: original.type,
        position: { x: original.position.x, y: original.position.y },
        biome: null  // Reset biome
      })
    }
    tiles.push(row)
  }
  return { width: grid.width, height: grid.height, tiles }
}

function updateBiomeLegend(biomeCoverage) {
  const legendEl = document.getElementById('biome-legend')
  legendEl.innerHTML = ''
  
  for (const [biomeType, percentage] of biomeCoverage) {
    const biomeColors = BIOME_COLORS[biomeType]
    const item = document.createElement('div')
    item.className = 'legend-item'
    item.innerHTML = `
      <div class="legend-color" style="background: ${biomeColors.floor};"></div>
      <span>${BIOME_NAMES[biomeType]} (${percentage.toFixed(1)}%)</span>
    `
    legendEl.appendChild(item)
  }
}

function updateBiomeStats(stats) {
  document.getElementById('stats-module2-1').innerHTML = `
    <div class="stat-item">
      <span class="stat-label">Total Cycles</span>
      <span class="stat-value">${stats.totalCycles}</span>
    </div>
    <div class="stat-item">
      <span class="stat-label">Biome Centers</span>
      <span class="stat-value">${stats.totalBiomeCenters}</span>
    </div>
    <div class="stat-item">
      <span class="stat-label">Tiles with Biome</span>
      <span class="stat-value">${stats.tilesWithBiome}</span>
    </div>
    <div class="stat-item">
      <span class="stat-label">Unassigned Tiles</span>
      <span class="stat-value">${stats.tilesWithoutBiome}</span>
    </div>
    <div class="stat-item">
      <span class="stat-label">Successful Conversions</span>
      <span class="stat-value">${stats.successfulConversions}</span>
    </div>
    <div class="stat-item">
      <span class="stat-label">Skipped Tiles</span>
      <span class="stat-value">${stats.skippedTiles}</span>
    </div>
  `
}

export function initModule2_1Controls() {
  document.getElementById('generate-module2-1').addEventListener('click', generateModule2_1)
  
  document.getElementById('m2-zoom-in').addEventListener('click', () => {
    if (state.visualizer.module2_1.tileSize < MAX_TILE_SIZE) {
      state.visualizer.module2_1.tileSize += 2
      updateModule2_1Visualizer()
    }
  })
  
  document.getElementById('m2-zoom-out').addEventListener('click', () => {
    if (state.visualizer.module2_1.tileSize > MIN_TILE_SIZE) {
      state.visualizer.module2_1.tileSize -= 2
      updateModule2_1Visualizer()
    }
  })
  
  document.getElementById('m2-prev-step').addEventListener('click', () => {
    if (!state.data.module2_1 || state.visualizer.module2_1.currentStep === 0) return
    state.visualizer.module2_1.currentStep--
    state.visualizer.module2_1.showFinal = false
    updateModule2_1Visualizer()
  })
  
  document.getElementById('m2-next-step').addEventListener('click', () => {
    if (!state.data.module2_1) return
    if (state.visualizer.module2_1.currentStep < state.data.module2_1.path.length - 1) {
      state.visualizer.module2_1.currentStep++
      state.visualizer.module2_1.showFinal = false
      updateModule2_1Visualizer()
    }
  })
  
  document.getElementById('m2-prev-cycle').addEventListener('click', () => {
    if (!state.data.module2_1 || state.visualizer.module2_1.currentStep === 0) return
    const path = state.data.module2_1.path
    const currentCycle = path[state.visualizer.module2_1.currentStep].cycleNumber
    
    for (let i = state.visualizer.module2_1.currentStep - 1; i >= 0; i--) {
      if (path[i].cycleNumber < currentCycle) {
        state.visualizer.module2_1.currentStep = i
        state.visualizer.module2_1.showFinal = false
        updateModule2_1Visualizer()
        return
      }
    }
  })
  
  document.getElementById('m2-next-cycle').addEventListener('click', () => {
    if (!state.data.module2_1) return
    const path = state.data.module2_1.path
    const currentCycle = path[state.visualizer.module2_1.currentStep].cycleNumber
    
    for (let i = state.visualizer.module2_1.currentStep + 1; i < path.length; i++) {
      if (path[i].cycleNumber > currentCycle) {
        state.visualizer.module2_1.currentStep = i
        state.visualizer.module2_1.showFinal = false
        updateModule2_1Visualizer()
        return
      }
    }
  })

  document.getElementById('m2-play').addEventListener('click', () => {
    if (!state.data.module2_1) return
    
    const s = state.visualizer.module2_1
    
    if (s.isPlaying) {
      // Stop playing
      clearInterval(s.playInterval)
      s.isPlaying = false
      document.getElementById('m2-play').textContent = '▶ Play'
    } else {
      // Start playing
      s.isPlaying = true
      s.showFinal = false
      document.getElementById('m2-play').textContent = '⏸ Pause'
      
      s.playInterval = setInterval(() => {
        if (s.currentStep < state.data.module2_1.path.length - 1) {
          s.currentStep++
          updateModule2_1Visualizer()
        } else {
          // Reached end, stop
          clearInterval(s.playInterval)
          s.isPlaying = false
          document.getElementById('m2-play').textContent = '▶ Play'
        }
      }, 50) // 50ms = 20 steps per second
    }
  })
  
  document.getElementById('m2-show-final').addEventListener('click', () => {
    if (!state.data.module2_1) return
    state.visualizer.module2_1.showFinal = true
    updateModule2_1Visualizer()
  })
}