/**
 * Statistics calculation for spawn point placement.
 */

import type { SpawnPointStats } from '../../shared/domain/models.js'
import type { ConnectivityMap } from './connectivity.js'

/**
 * Calculates statistics from spawn point placement.
 */
export function calculateSpawnPointStats(
  connectivity: ConnectivityMap,
  entriesOnC4: number,
  entriesOnC3: number,
  exitsOnC1: number,
  exitsOnC2: number,
  keysOnC3: number,
  keysOnC2: number
): SpawnPointStats {
  return {
    c1Tiles: connectivity.get(1)!.length,
    c2Tiles: connectivity.get(2)!.length,
    c3Tiles: connectivity.get(3)!.length,
    c4Tiles: connectivity.get(4)!.length,
    
    entriesPlacedOnC4: entriesOnC4,
    entriesPlacedOnC3: entriesOnC3,
    
    exitsPlacedOnC1: exitsOnC1,
    exitsPlacedOnC2: exitsOnC2,
    
    keysPlacedOnC3: keysOnC3,
    keysPlacedOnC2: keysOnC2
  }
}