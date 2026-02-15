/**
 * Color schemes and constants
 */

import { TileType, BiomeType } from '../../../dist/shared/domain/models.js'

export const TILE_COLORS = {
  [TileType.WALL]: '#8b4513',
  [TileType.FLOOR]: '#f0f0f0',
  [TileType.VOID]: '#000000',
  miner: '#3b82f6'
}

export const BIOME_COLORS = {
  [BiomeType.WATER]: {
    floor: '#6bb6ff',
    wall: '#1e40af'
  },
  [BiomeType.FOREST]: {
    floor: '#86efac',
    wall: '#166534'
  },
  [BiomeType.SWAMP]: {
    floor: '#c084fc',
    wall: '#6b21a8'
  },
  [BiomeType.MAGMA]: {
    floor: '#fca5a5',
    wall: '#991b1b'
  },
  [BiomeType.ICE]: {
    floor: '#a5f3fc',
    wall: '#155e75'
  },
  [BiomeType.DESERT]: {
    floor: '#fde68a',
    wall: '#92400e'
  },
  [BiomeType.DUNGEON]: {
    floor: '#d1d5db',
    wall: '#374151'
  }
}

export const BIOME_NAMES = {
  [BiomeType.WATER]: 'Water',
  [BiomeType.FOREST]: 'Forest',
  [BiomeType.SWAMP]: 'Swamp',
  [BiomeType.MAGMA]: 'Magma',
  [BiomeType.ICE]: 'Ice',
  [BiomeType.DESERT]: 'Desert',
  [BiomeType.DUNGEON]: 'Dungeon'
}

// NEW: Interactable colors
export const INTERACTABLE_COLORS = {
  'ENTRY': '#22c55e',   // Green
  'EXIT': '#ef4444',    // Red
  'KEY': '#eab308'      // Yellow
}