/**
 * Module 2.2: Spawn Points visualization and controls
 */

import { placeSpawnPoints } from '../../../../dist/module2-2/index.js'
import { state, MIN_TILE_SIZE, MAX_TILE_SIZE } from '../state.js'
import { renderGrid } from '../rendering.js'

export function updateModule2_2Visualizer() {
  const result = state.data.module2_2
  if (!result) return
  
  const s = state.visualizer.module2_2
  renderGrid(result.grid, null, 'module2-2', s.tileSize)
}

export function generateModule2_2() {
  if (!state.data.module2_1) {
    alert('Please assign biomes (Module 2.1) first!')
    return
  }
  
  const config = {
    entryCount: parseInt(document.getElementById('m22-entryCount').value),
    exitCount: parseInt(document.getElementById('m22-exitCount').value),
    keyCount: parseInt(document.getElementById('m22-keyCount').value),
    seed: parseInt(document.getElementById('m22-seed').value)
  }
  
  try {
    const btn = document.getElementById('generate-module2-2')
    btn.disabled = true
    btn.textContent = 'Placing...'
    
    // Clone Module 2.1 grid
    const gridCopy = cloneGrid(state.data.module2_1.grid)
    
    const result = placeSpawnPoints(gridCopy, config)
    state.data.module2_2 = result
    
    // Show sections
    document.getElementById('visualizer-section').style.display = 'block'
    document.getElementById('stats-section').style.display = 'block'
    
    updateStats(result.stats)
    updateModule2_2Visualizer()
    
    btn.disabled = false
    btn.textContent = 'Place Spawn Points'
  } catch (error) {
    alert('Error: ' + error.message)
    document.getElementById('generate-module2-2').disabled = false
    document.getElementById('generate-module2-2').textContent = 'Place Spawn Points'
  }
}

function cloneGrid(grid) {
  const tiles = []
  for (let y = 0; y < grid.height; y++) {
    const row = []
    for (let x = 0; x < grid.width; x++) {
      const original = grid.tiles[y][x]
      row.push({
        type: original.type,
        position: { x: original.position.x, y: original.position.y },
        biome: original.biome,
        interactable: null  // Reset interactables
      })
    }
    tiles.push(row)
  }
  return { width: grid.width, height: grid.height, tiles }
}

function updateStats(stats) {
  document.getElementById('stats-module2-2').innerHTML = `
    <div class="stat-item">
      <span class="stat-label">Connectivity</span>
      <span class="stat-value">C1:${stats.c1Tiles} C2:${stats.c2Tiles} C3:${stats.c3Tiles} C4:${stats.c4Tiles}</span>
    </div>
    <div class="stat-item">
      <span class="stat-label">Entries</span>
      <span class="stat-value">${stats.entriesPlacedOnC4 + stats.entriesPlacedOnC3} (C4:${stats.entriesPlacedOnC4}, C3:${stats.entriesPlacedOnC3})</span>
    </div>
    <div class="stat-item">
      <span class="stat-label">Exits</span>
      <span class="stat-value">${stats.exitsPlacedOnC1 + stats.exitsPlacedOnC2} (C1:${stats.exitsPlacedOnC1}, C2:${stats.exitsPlacedOnC2})</span>
    </div>
    <div class="stat-item">
      <span class="stat-label">Keys</span>
      <span class="stat-value">${stats.keysPlacedOnC3 + stats.keysPlacedOnC2} (C3:${stats.keysPlacedOnC3}, C2:${stats.keysPlacedOnC2})</span>
    </div>
  `
}

export function initModule2_2Controls() {
  document.getElementById('generate-module2-2').addEventListener('click', generateModule2_2)
  
  document.getElementById('m22-zoom-in').addEventListener('click', () => {
    if (state.visualizer.module2_2.tileSize < MAX_TILE_SIZE) {
      state.visualizer.module2_2.tileSize += 2
      updateModule2_2Visualizer()
    }
  })
  
  document.getElementById('m22-zoom-out').addEventListener('click', () => {
    if (state.visualizer.module2_2.tileSize > MIN_TILE_SIZE) {
      state.visualizer.module2_2.tileSize -= 2
      updateModule2_2Visualizer()
    }
  })
}