/**
 * Statistics calculation for mining results.
 */

import type { Grid, PathNode, MiningStats, Position } from '../../shared/domain/models.js'
import { TileType, MiningAction } from '../../shared/domain/models.js'
import { countTiles } from '../../shared/utils/grid.js'

/**
 * Calculates comprehensive statistics from mining result.
 */
export function calculateStats(
  grid: Grid,
  path: PathNode[],
  startTime: number,
  endTime: number,
  startPosition: Position
): MiningStats {
  const executionTimeMs = endTime - startTime
  
  // Grid composition
  const totalTiles = grid.width * grid.height
  const floorTiles = countTiles(grid, TileType.FLOOR)
  const wallTiles = countTiles(grid, TileType.WALL)
  const voidTiles = countTiles(grid, TileType.VOID)
  
  // Action breakdown
  const totalSteps = path.length
  const breakActions = path.filter(node => node.miningAction === MiningAction.BREAK).length
  const backtrackActions = path.filter(node => node.miningAction === MiningAction.BACKTRACK).length
  
  // Performance metrics
  const avgStepTimeMs = totalSteps > 0 ? executionTimeMs / totalSteps : 0
  
  // Final percentage
  const finalPercentage = (floorTiles / totalTiles) * 100
  
  return {
    totalTiles,
    floorTiles,
    wallTiles,
    voidTiles,
    
    totalSteps,
    breakActions,
    backtrackActions,
    
    executionTimeMs,
    avgStepTimeMs,
    
    minersStartPosition: startPosition,
    finalPercentage
  }
}