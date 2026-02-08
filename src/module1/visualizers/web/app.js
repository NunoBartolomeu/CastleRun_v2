import { runMiningAlgorithm, TileType, MiningAction } from '../../../../dist/index.js'

// Canvas setup
const canvas = document.getElementById('canvas')
const ctx = canvas.getContext('2d')

let TILE_SIZE = 20
const MIN_TILE_SIZE = 5
const MAX_TILE_SIZE = 50

const colors = {
  [TileType.WALL]: '#8b4513',
  [TileType.FLOOR]: '#f0f0f0',
  [TileType.VOID]: '#000000',
  miner: '#3b82f6'
}

let currentResult = null
let currentStep = 0
let isPlaying = false
let playInterval = null

// Reconstruct grid at step
function reconstructGridAtStep(path, stepIndex, width, height) {
  const tiles = []
  for (let y = 0; y < height; y++) {
    const row = []
    for (let x = 0; x < width; x++) {
      row.push({ type: TileType.WALL, position: { x, y }, region: null })
    }
    tiles.push(row)
  }
  
  for (let i = 0; i <= stepIndex && i < path.length; i++) {
    const node = path[i]
    tiles[node.position.y][node.position.x].type = TileType.FLOOR
  }
  
  return { width, height, tiles }
}

// Render grid
function renderGrid(grid, minerPos) {
  canvas.width = grid.width * TILE_SIZE
  canvas.height = grid.height * TILE_SIZE
  
  for (let y = 0; y < grid.height; y++) {
    for (let x = 0; x < grid.width; x++) {
      const tile = grid.tiles[y][x]
      ctx.fillStyle = colors[tile.type]
      ctx.fillRect(x * TILE_SIZE, y * TILE_SIZE, TILE_SIZE, TILE_SIZE)
      
      // Grid lines (only if tiles are large enough)
      if (TILE_SIZE >= 10) {
        ctx.strokeStyle = '#00000020'
        ctx.strokeRect(x * TILE_SIZE, y * TILE_SIZE, TILE_SIZE, TILE_SIZE)
      }
    }
  }
  
  // Draw miner
  if (minerPos) {
    ctx.fillStyle = colors.miner
    ctx.fillRect(minerPos.x * TILE_SIZE, minerPos.y * TILE_SIZE, TILE_SIZE, TILE_SIZE)
  }
}

// Update step info
function updateStepInfo() {
  if (!currentResult) return
  
  const node = currentResult.path[currentStep]
  document.getElementById('current-step').textContent = currentStep + 1
  document.getElementById('total-steps').textContent = currentResult.path.length
  document.getElementById('current-action').textContent = node.miningAction
  document.getElementById('current-position').textContent = `(${node.position.x}, ${node.position.y})`
  
  const grid = reconstructGridAtStep(currentResult.path, currentStep, currentResult.grid.width, currentResult.grid.height)
  renderGrid(grid, node.position)
}

// Save result to file
function saveResult() {
  if (!currentResult) return
  
  const data = {
    version: '1.0',
    timestamp: new Date().toISOString(),
    config: {
      width: currentResult.grid.width,
      height: currentResult.grid.height,
      targetPercentage: parseInt(document.getElementById('target').value),
      breakWallWeight: parseInt(document.getElementById('breakWeight').value),
      backtrackWeight: parseInt(document.getElementById('backtrackWeight').value),
      seed: parseInt(document.getElementById('seed').value)
    },
    grid: currentResult.grid,
    path: currentResult.path,
    stats: currentResult.stats
  }
  
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `castle-run-map-${Date.now()}.json`
  a.click()
  URL.revokeObjectURL(url)
}

// Load result from file
function loadResult(file) {
  const reader = new FileReader()
  reader.onload = (e) => {
    try {
      const data = JSON.parse(e.target.result)
      
      // Validate data structure
      if (!data.grid || !data.path || !data.stats) {
        throw new Error('Invalid map file format')
      }
      
      // Restore result
      currentResult = {
        grid: data.grid,
        path: data.path,
        stats: data.stats
      }
      currentStep = 0
      
      // Update config inputs
      if (data.config) {
        document.getElementById('width').value = data.config.width
        document.getElementById('height').value = data.config.height
        document.getElementById('target').value = data.config.targetPercentage
        document.getElementById('breakWeight').value = data.config.breakWallWeight
        document.getElementById('backtrackWeight').value = data.config.backtrackWeight
        document.getElementById('seed').value = data.config.seed
      }
      
      // Show visualizer and stats
      document.getElementById('visualizer-section').style.display = 'flex'
      document.getElementById('stats-section').style.display = 'flex'
      
      // Render stats
      const stats = currentResult.stats
      document.getElementById('stats').innerHTML = `
        <div class="stat-item">
          <span class="stat-label">Grid Size</span>
          <span class="stat-value">${data.config.width}x${data.config.height}</span>
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
          <span class="stat-label">Execution Time</span>
          <span class="stat-value">${stats.executionTimeMs.toFixed(2)}ms</span>
        </div>
      `
      
      updateStepInfo()
      
      alert('Map loaded successfully!')
    } catch (error) {
      alert('Error loading map file: ' + error.message)
    }
  }
  reader.readAsText(file)
}

// Generate map
document.getElementById('generate').addEventListener('click', async () => {
  const config = {
    width: parseInt(document.getElementById('width').value),
    height: parseInt(document.getElementById('height').value),
    targetPercentage: parseInt(document.getElementById('target').value),
    breakWallWeight: parseInt(document.getElementById('breakWeight').value),
    backtrackWeight: parseInt(document.getElementById('backtrackWeight').value),
    seed: parseInt(document.getElementById('seed').value)
  }
  
  try {
    document.getElementById('generate').disabled = true
    document.getElementById('generate').textContent = 'Generating...'
    
    currentResult = runMiningAlgorithm(config)
    currentStep = 0
    
    // Show visualizer and stats
    document.getElementById('visualizer-section').style.display = 'flex'
    document.getElementById('stats-section').style.display = 'flex'
    
    // Render stats
    const stats = currentResult.stats
    document.getElementById('stats').innerHTML = `
      <div class="stat-item">
        <span class="stat-label">Grid Size</span>
        <span class="stat-value">${config.width}x${config.height}</span>
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
        <span class="stat-label">Execution Time</span>
        <span class="stat-value">${stats.executionTimeMs.toFixed(2)}ms</span>
      </div>
    `
    
    updateStepInfo()
    
    document.getElementById('generate').disabled = false
    document.getElementById('generate').textContent = 'Generate Map'
  } catch (error) {
    alert('Error: ' + error.message)
    document.getElementById('generate').disabled = false
    document.getElementById('generate').textContent = 'Generate Map'
  }
})

// Zoom controls
document.getElementById('zoom-in').addEventListener('click', () => {
  if (TILE_SIZE < MAX_TILE_SIZE) {
    TILE_SIZE += 5
    updateStepInfo()
  }
})

document.getElementById('zoom-out').addEventListener('click', () => {
  if (TILE_SIZE > MIN_TILE_SIZE) {
    TILE_SIZE -= 5
    updateStepInfo()
  }
})

// Save/Load controls
document.getElementById('save').addEventListener('click', saveResult)
document.getElementById('load').addEventListener('click', () => {
  document.getElementById('file-input').click()
})
document.getElementById('file-input').addEventListener('change', (e) => {
  const file = e.target.files[0]
  if (file) {
    loadResult(file)
  }
  e.target.value = '' // Reset input
})

// Playback controls
document.getElementById('first').addEventListener('click', () => {
  if (!currentResult) return
  currentStep = 0
  updateStepInfo()
})

document.getElementById('last').addEventListener('click', () => {
  if (!currentResult) return
  currentStep = currentResult.path.length - 1
  updateStepInfo()
})

document.getElementById('prev').addEventListener('click', () => {
  if (!currentResult || currentStep === 0) return
  currentStep--
  updateStepInfo()
})

document.getElementById('next').addEventListener('click', () => {
  if (!currentResult || currentStep === currentResult.path.length - 1) return
  currentStep++
  updateStepInfo()
})

document.getElementById('prev-break').addEventListener('click', () => {
  if (!currentResult) return
  for (let i = currentStep - 1; i >= 0; i--) {
    if (currentResult.path[i].miningAction === MiningAction.BREAK) {
      currentStep = i
      updateStepInfo()
      return
    }
  }
})

document.getElementById('next-break').addEventListener('click', () => {
  if (!currentResult) return
  for (let i = currentStep + 1; i < currentResult.path.length; i++) {
    if (currentResult.path[i].miningAction === MiningAction.BREAK) {
      currentStep = i
      updateStepInfo()
      return
    }
  }
})

document.getElementById('play').addEventListener('click', () => {
  if (!currentResult) return
  
  if (isPlaying) {
    clearInterval(playInterval)
    isPlaying = false
    document.getElementById('play').textContent = '▶ Play'
  } else {
    isPlaying = true
    document.getElementById('play').textContent = '⏸ Pause'
    playInterval = setInterval(() => {
      if (currentStep < currentResult.path.length - 1) {
        currentStep++
        updateStepInfo()
      } else {
        clearInterval(playInterval)
        isPlaying = false
        document.getElementById('play').textContent = '▶ Play'
      }
    }, 50)
  }
})

document.getElementById('reset').addEventListener('click', () => {
  if (!currentResult) return
  renderGrid(currentResult.grid)
})

// Keyboard shortcuts
document.addEventListener('keydown', (e) => {
  if (!currentResult) return
  
  if (e.key === 'ArrowLeft') {
    document.getElementById('prev').click()
  } else if (e.key === 'ArrowRight') {
    document.getElementById('next').click()
  } else if (e.key === ' ') {
    e.preventDefault()
    document.getElementById('play').click()
  } else if (e.key === '=' || e.key === '+') {
    document.getElementById('zoom-in').click()
  } else if (e.key === '-' || e.key === '_') {
    document.getElementById('zoom-out').click()
  }
})