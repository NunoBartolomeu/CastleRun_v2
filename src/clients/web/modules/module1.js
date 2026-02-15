/**
 * Module 1: Mining visualization and controls
 */

import { runMiningAlgorithm, TileType, MiningAction } from '../../../../dist/module1/index.js'
import { state, MIN_TILE_SIZE, MAX_TILE_SIZE } from '../state.js'
import { renderGrid } from '../rendering.js'

function reconstructGridAtStep(path, stepIndex, width, height) {
  const tiles = []
  for (let y = 0; y < height; y++) {
    const row = []
    for (let x = 0; x < width; x++) {
      row.push({
        type: TileType.WALL,
        position: { x, y },
        biome: null
      })
    }
    tiles.push(row)
  }
  
  for (let i = 0; i <= stepIndex && i < path.length; i++) {
    const node = path[i]
    tiles[node.position.y][node.position.x].type = TileType.FLOOR
  }
  
  return { width, height, tiles }
}

export function updateModule1Visualizer() {
  const result = state.data.module1
  if (!result) return
  
  const s = state.visualizer.module1
  const node = result.path[s.currentStep]
  
  document.getElementById('m1-current-step').textContent = s.currentStep + 1
  document.getElementById('m1-total-steps').textContent = result.path.length
  document.getElementById('m1-current-action').textContent = node.miningAction
  document.getElementById('m1-current-position').textContent = `(${node.position.x}, ${node.position.y})`
  
  const grid = reconstructGridAtStep(result.path, s.currentStep, result.grid.width, result.grid.height)
  renderGrid(grid, node.position, 'module1', s.tileSize)
}

export function generateModule1() {
  const config = {
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

  try {
    const btn = document.getElementById('generate-module1')
    btn.disabled = true
    btn.textContent = 'Generating...'
    
    const result = runMiningAlgorithm(config)
    state.data.module1 = result
    state.visualizer.module1.currentStep = 0
    
    // Show visualizer and stats
    document.getElementById('visualizer-section').style.display = 'block'
    document.getElementById('stats-section').style.display = 'block'
    
    // Update stats
    const stats = result.stats
    document.getElementById('stats-module1').innerHTML = `
      <div class="stat-item">
        <span class="stat-label">Grid Size</span>
        <span class="stat-value">${config.width}×${config.height}</span>
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
    
    updateModule1Visualizer()
    
    btn.disabled = false
    btn.textContent = 'Generate Map'
  } catch (error) {
    alert('Error: ' + error.message)
    document.getElementById('generate-module1').disabled = false
    document.getElementById('generate-module1').textContent = 'Generate Map'
  }

    // Show visualizer and stats
    document.getElementById('visualizer-section').style.display = 'block'
    document.getElementById('stats-section').style.display = 'block'

    // Make sure Module 1 controls are visible
    document.getElementById('controls-module1').classList.add('active')
    document.getElementById('stats-module1').classList.add('active')
    document.getElementById('legend-module1').classList.add('active')
}

export function initModule1Controls() {
  document.getElementById('generate-module1').addEventListener('click', generateModule1)
  
  document.getElementById('m1-zoom-in').addEventListener('click', () => {
    if (state.visualizer.module1.tileSize < MAX_TILE_SIZE) {
      state.visualizer.module1.tileSize += 2
      updateModule1Visualizer()
    }
  })
  
  document.getElementById('m1-zoom-out').addEventListener('click', () => {
    if (state.visualizer.module1.tileSize > MIN_TILE_SIZE) {
      state.visualizer.module1.tileSize -= 2
      updateModule1Visualizer()
    }
  })
  
  document.getElementById('m1-first').addEventListener('click', () => {
    if (!state.data.module1) return
    state.visualizer.module1.currentStep = 0
    updateModule1Visualizer()
  })
  
  document.getElementById('m1-last').addEventListener('click', () => {
    if (!state.data.module1) return
    state.visualizer.module1.currentStep = state.data.module1.path.length - 1
    updateModule1Visualizer()
  })
  
  document.getElementById('m1-prev').addEventListener('click', () => {
    if (!state.data.module1 || state.visualizer.module1.currentStep === 0) return
    state.visualizer.module1.currentStep--
    updateModule1Visualizer()
  })
  
  document.getElementById('m1-next').addEventListener('click', () => {
    if (!state.data.module1) return
    if (state.visualizer.module1.currentStep < state.data.module1.path.length - 1) {
      state.visualizer.module1.currentStep++
      updateModule1Visualizer()
    }
  })
  
  document.getElementById('m1-prev-break').addEventListener('click', () => {
    if (!state.data.module1) return
    const path = state.data.module1.path
    for (let i = state.visualizer.module1.currentStep - 1; i >= 0; i--) {
      if (path[i].miningAction === MiningAction.BREAK) {
        state.visualizer.module1.currentStep = i
        updateModule1Visualizer()
        return
      }
    }
  })
  
  document.getElementById('m1-next-break').addEventListener('click', () => {
    if (!state.data.module1) return
    const path = state.data.module1.path
    for (let i = state.visualizer.module1.currentStep + 1; i < path.length; i++) {
      if (path[i].miningAction === MiningAction.BREAK) {
        state.visualizer.module1.currentStep = i
        updateModule1Visualizer()
        return
      }
    }
  })
  
    document.getElementById('m1-play').addEventListener('click', () => {
    if (!state.data.module1) return
    
    const s = state.visualizer.module1
    
    if (s.isPlaying) {
        // Stop playing
        clearInterval(s.playInterval)
        s.isPlaying = false
        document.getElementById('m1-play').textContent = '▶ Play'
    } else {
        // Start playing
        s.isPlaying = true
        document.getElementById('m1-play').textContent = '⏸ Pause'
        
        s.playInterval = setInterval(() => {
        if (s.currentStep < state.data.module1.path.length - 1) {
            s.currentStep++
            updateModule1Visualizer()
        } else {
            // Reached end, stop
            clearInterval(s.playInterval)
            s.isPlaying = false
            document.getElementById('m1-play').textContent = '▶ Play'
        }
        }, 50) // 50ms = 20 steps per second
    }
    })

  document.getElementById('m1-reset').addEventListener('click', () => {
    if (!state.data.module1) return
    renderGrid(state.data.module1.grid, null, 'module1', state.visualizer.module1.tileSize)
  })
}