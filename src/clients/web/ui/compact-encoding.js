/**
 * Compact encoding/decoding for save files
 */

// Encoding maps
const TYPE_TO_CHAR = {
  'VOID': 'V',
  'WALL': 'W',
  'FLOOR': 'F'
}

const CHAR_TO_TYPE = {
  'V': 'VOID',
  'W': 'WALL',
  'F': 'FLOOR'
}

const BIOME_TO_CHAR = {
  null: 'N',
  'WATER': 'W',
  'FOREST': 'F',
  'SWAMP': 'S',
  'MAGMA': 'M',
  'ICE': 'I',
  'DESERT': 'D',
  'DUNGEON': 'U'
}

const CHAR_TO_BIOME = {
  'N': null,
  'W': 'WATER',
  'F': 'FOREST',
  'S': 'SWAMP',
  'M': 'MAGMA',
  'I': 'ICE',
  'D': 'DESERT',
  'U': 'DUNGEON'
}

const ACTION_TO_CHAR = {
  'BREAK': 'B',
  'BACKTRACK': 'T',
  'CONVERT': 'C',
  'SKIP': 'S'
}

const CHAR_TO_ACTION = {
  'B': 'BREAK',
  'T': 'BACKTRACK',
  'C': 'CONVERT',
  'S': 'SKIP'
}

// ============================================================================
// ENCODING
// ============================================================================

export function encodeModule1Grid(grid) {
  let encoded = ''
  for (let y = 0; y < grid.height; y++) {
    for (let x = 0; x < grid.width; x++) {
      const tile = grid.tiles[y][x]
      encoded += TYPE_TO_CHAR[tile.type]
    }
  }
  return encoded
}

export function encodeModule2Grid(grid) {
  let encoded = ''
  for (let y = 0; y < grid.height; y++) {
    for (let x = 0; x < grid.width; x++) {
      const tile = grid.tiles[y][x]
      encoded += BIOME_TO_CHAR[tile.biome]
    }
  }
  return encoded
}

export function encodePath(path, module) {
  const parts = []
  
  for (const node of path) {
    const action = ACTION_TO_CHAR[node.miningAction || node.action]
    const timestamp = Math.round(node.timestamp)
    parts.push(`${node.position.x},${node.position.y},${action},${timestamp}`)
  }
  
  return parts.join('|')
}

export function createCompactSave(module1Data, module2Data, module1Config, module2Config) {
  const compact = {
    version: '2.0-compact',
    timestamp: new Date().toISOString(),
    format: {
      module1_grid: 'V=VOID, W=WALL, F=FLOOR',
      module2_grid: 'Biome codes only (N=null, W=WATER, F=FOREST, S=SWAMP, M=MAGMA, I=ICE, D=DESERT, U=DUNGEON)',
      path: 'Pipe-separated: x,y,action,timestamp',
      actions_m1: 'B=BREAK, T=BACKTRACK',
      actions_m2: 'C=CONVERT, S=SKIP'
    }
  }
  
  if (module1Data && module1Config) {
    compact.module1 = {
      config: module1Config,
      grid: encodeModule1Grid(module1Data.grid),
      path: encodePath(module1Data.path, 'module1'),
      stats: module1Data.stats
    }
  }
  
  if (module2Data && module2Config) {
    compact.module2_1 = {
      config: module2Config,
      grid: encodeModule2Grid(module2Data.grid),
      path: encodePath(module2Data.path, 'module2'),
      stats: module2Data.stats
    }
  }
  
  return compact
}

// ============================================================================
// DECODING
// ============================================================================

export function decodeModule1Grid(gridString, width, height) {
  const tiles = []
  let index = 0
  
  for (let y = 0; y < height; y++) {
    const row = []
    for (let x = 0; x < width; x++) {
      row.push({
        type: CHAR_TO_TYPE[gridString[index++]],
        position: { x, y },
        biome: null
      })
    }
    tiles.push(row)
  }
  
  return { width, height, tiles }
}

export function decodeModule2Grid(module1Grid, biomeString) {
  const tiles = []
  let index = 0
  
  for (let y = 0; y < module1Grid.height; y++) {
    const row = []
    for (let x = 0; x < module1Grid.width; x++) {
      const originalTile = module1Grid.tiles[y][x]
      row.push({
        type: originalTile.type,
        position: { x, y },
        biome: CHAR_TO_BIOME[biomeString[index++]]
      })
    }
    tiles.push(row)
  }
  
  return { width: module1Grid.width, height: module1Grid.height, tiles }
}

export function decodePath(pathString, module) {
  if (!pathString) return []
  
  const parts = pathString.split('|')
  const path = []
  
  for (const part of parts) {
    const [x, y, actionChar, timestamp] = part.split(',')
    
    const node = {
      position: { x: parseInt(x), y: parseInt(y) },
      timestamp: parseInt(timestamp)
    }
    
    if (module === 'module1') {
      node.miningAction = CHAR_TO_ACTION[actionChar]
    } else {
      node.action = CHAR_TO_ACTION[actionChar]
    }
    
    path.push(node)
  }
  
  return path
}

//107
//2523

export function isCompactFormat(data) {
  return data.version && data.version.includes('compact')
}

export function loadCompactSave(data) {
  const result = {
    module1: null,
    module2_1: null
  }
  
  if (data.module1) {
    const config = data.module1.config
    const grid = decodeModule1Grid(data.module1.grid, config.width, config.height)
    const path = decodePath(data.module1.path, 'module1')
    
    result.module1 = {
      config: config,
      grid,
      path,
      stats: data.module1.stats
    }
  }
  
  if (data.module2_1 && result.module1) {
    const grid = decodeModule2Grid(result.module1.grid, data.module2_1.grid)
    const path = decodePath(data.module2_1.path, 'module2')
    
    result.module2_1 = {
      config: data.module2_1.config,
      grid,
      path,
      stats: data.module2_1.stats
    }
  }
  
  return result
}