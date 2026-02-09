/**
 * Console client for testing the mining algorithm.
 * Renders the final grid to terminal using emojis.
 */

import { runMiningAlgorithm, TileType, MiningAction, type Grid, type MiningStats, type PathNode } from '../../index.js'
import * as readline from 'readline'

/**
 * Available square emojis for customization:
 * 
 * Colored squares:
 * 🟥 Red, 🟧 Orange, 🟨 Yellow, 🟩 Green, 🟦 Blue, 🟪 Purple
 * ⬛ Black, ⬜ White, 🟫 Brown
 * 
 * Other options:
 * ◼️ Black small, ◻️ White small, ▪️ Black tiny, ▫️ White tiny
 * ■ Filled, □ Hollow
 */

/**
 * Renders a grid to the console using emojis.
 */
function renderGridToConsole(grid: Grid, minerPos?: { x: number, y: number }): void {
  const tileEmojis = {
    [TileType.WALL]: '🟫',   // Brown square
    [TileType.FLOOR]: '⬜',  // White square
    [TileType.VOID]: '⬛'    // Black square
  }
  
  const minerEmoji = '🟦'  // Blue square for miner
  
  console.clear()
  console.log('\nGenerated Map:')
  console.log('─'.repeat(grid.width * 2))
  
  for (let y = 0; y < grid.height; y++) {
    let row = ''
    for (let x = 0; x < grid.width; x++) {
      const tile = grid.tiles[y][x]
      
      // Show miner position if provided
      if (minerPos && minerPos.x === x && minerPos.y === y) {
        row += minerEmoji
      } else {
        row += tileEmojis[tile.type]
      }
    }
    console.log(row)
  }
  
  console.log('─'.repeat(grid.width * 2))
}

/**
 * Prints statistics to console in a formatted way.
 */
function printStats(stats: MiningStats): void {
  console.log('\n=== Mining Statistics ===')
  console.log(`Grid Size: ${Math.sqrt(stats.totalTiles).toFixed(0)}x${Math.sqrt(stats.totalTiles).toFixed(0)}`)
  console.log(`Starting Position: (${stats.minersStartPosition.x}, ${stats.minersStartPosition.y})`)
  console.log('')
  
  console.log('Composition:')
  console.log(`  Floor: ${stats.floorTiles} tiles (${stats.finalPercentage.toFixed(2)}%)`)
  console.log(`  Wall:  ${stats.wallTiles} tiles (${((stats.wallTiles / stats.totalTiles) * 100).toFixed(2)}%)`)
  console.log(`  Void:  ${stats.voidTiles} tiles (${((stats.voidTiles / stats.totalTiles) * 100).toFixed(2)}%)`)
  console.log('')
  
  console.log('Mining Process:')
  console.log(`  Total Steps: ${stats.totalSteps}`)
  console.log(`  Break Actions: ${stats.breakActions} (${((stats.breakActions / stats.totalSteps) * 100).toFixed(1)}%)`)
  console.log(`  Backtrack Actions: ${stats.backtrackActions} (${((stats.backtrackActions / stats.totalSteps) * 100).toFixed(1)}%)`)
  console.log('')
  
  console.log('Performance:')
  console.log(`  Execution Time: ${stats.executionTimeMs.toFixed(2)}ms`)
  console.log(`  Avg Step Time: ${stats.avgStepTimeMs.toFixed(4)}ms`)
  console.log(`  Steps/Second: ${(1000 / stats.avgStepTimeMs).toFixed(0)}`)
  console.log('========================\n')
}

/**
 * Reconstructs grid state at a specific step in the path.
 */
function reconstructGridAtStep(path: PathNode[], stepIndex: number, width: number, height: number): Grid {
  const grid: Grid = {
    width,
    height,
    tiles: []
  }
  
  // Initialize all walls
  for (let y = 0; y < height; y++) {
    const row = []
    for (let x = 0; x < width; x++) {
      row.push({
        type: TileType.WALL,
        position: { x, y },
        region: null
      })
    }
    grid.tiles.push(row)
  }
  
  // Replay path up to stepIndex
  for (let i = 0; i <= stepIndex && i < path.length; i++) {
    const node = path[i]
    grid.tiles[node.position.y][node.position.x].type = TileType.FLOOR
  }
  
  return grid
}

/**
 * Interactive visualizer for stepping through mining process.
 */
async function runVisualizer(path: PathNode[], width: number, height: number) {
  let currentStep = 0
  
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  })
  
  function displayCurrentStep() {
    const grid = reconstructGridAtStep(path, currentStep, width, height)
    const minerPos = path[currentStep].position
    const action = path[currentStep].miningAction
    
    renderGridToConsole(grid, minerPos)
    
    console.log(`\nStep: ${currentStep + 1}/${path.length}`)
    console.log(`Action: ${action}`)
    console.log(`Position: (${minerPos.x}, ${minerPos.y})`)
    console.log('\nControls:')
    console.log('  < (prev step) | > (next step)')
    console.log('  << (prev break) | >> (next break)')
    console.log('  [number] (jump to step) | q (quit)')
  }
  
  displayCurrentStep()
  
  return new Promise<void>((resolve) => {
    rl.on('line', (input) => {
      const cmd = input.trim()
      
      if (cmd === 'q') {
        rl.close()
        resolve()
        return
      }
      
      if (cmd === '>') {
        // Next step
        if (currentStep < path.length - 1) {
          currentStep++
        }
      } else if (cmd === '<') {
        // Previous step
        if (currentStep > 0) {
          currentStep--
        }
      } else if (cmd === '>>') {
        // Next break action
        for (let i = currentStep + 1; i < path.length; i++) {
          if (path[i].miningAction === MiningAction.BREAK) {
            currentStep = i
            break
          }
        }
      } else if (cmd === '<<') {
        // Previous break action
        for (let i = currentStep - 1; i >= 0; i--) {
          if (path[i].miningAction === MiningAction.BREAK) {
            currentStep = i
            break
          }
        }
      } else if (/^\d+$/.test(cmd)) {
        // Jump to specific step (1-indexed from user perspective)
        const targetStep = parseInt(cmd, 10) - 1
        if (targetStep >= 0 && targetStep < path.length) {
          currentStep = targetStep
        } else {
          console.log(`Invalid step number. Must be between 1 and ${path.length}`)
        }
      }
      
      displayCurrentStep()
    })
  })
}

/**
 * Main execution
 */
async function main() {
  console.log('Castle Run - Map Generation Test\n')
  
  // Configuration for testing
  const config = {
    width: 50,
    height: 50,
    targetPercentage: 50,
    breakWallWeight: 5,
    backtrackWeight: 1,
    sectionsX: 5,
    sectionsY: 5,
    seed: 47198//Date.now() // You can set a fixed seed for reproducibility
  }
  
  console.log('Configuration:')
  console.log(`  Size: ${config.width}x${config.height}`)
  console.log(`  Target: ${config.targetPercentage}%`)
  console.log(`  Weights: Break=${config.breakWallWeight}, Backtrack=${config.backtrackWeight}`)
  console.log(`  Seed: ${config.seed}`)
  console.log('')
  
  try {
    console.log('Running mining algorithm...')
    const result = runMiningAlgorithm(config)
    
    console.log('✓ Mining complete!')
    
    printStats(result.stats)
    renderGridToConsole(result.grid)
    
    console.log('\nStarting interactive visualizer...')
    console.log('Press Enter to continue...')
    
    await new Promise(resolve => {
      const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
      })
      rl.once('line', () => {
        rl.close()
        resolve(null)
      })
    })
    
    await runVisualizer(result.path, config.width, config.height)
    
    console.log('\nVisualization complete! 🎉')
  } catch (error) {
    console.error('\n❌ Error during mining:')
    console.error(error)
    process.exit(1)
  }
}

// Run the test
main()