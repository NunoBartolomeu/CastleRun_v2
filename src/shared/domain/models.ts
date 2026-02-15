/**
 * Domain models for Castle Run map generation.
 * Contains all core types, enums, and interfaces used throughout the project.
 */

// ============================================================================
// ENUMS
// ============================================================================

/**
 * Types of tiles in the grid.
 */
export enum TileType {
  WALL = 'WALL',
  FLOOR = 'FLOOR',
  VOID = 'VOID'
}

/**
 * Directional movement and checking.
 */
export enum Direction {
  N = 'N',
  S = 'S',
  E = 'E',
  W = 'W',
  NE = 'NE',
  SE = 'SE',
  NW = 'NW',
  SW = 'SW'
}

/**
 * Actions the miner can take during mining.
 */
export enum MiningAction {
  BREAK = 'BREAK',
  BACKTRACK = 'BACKTRACK'
}

/**
 * Biome types for theming different areas of the map.
 */
export enum BiomeType {
  WATER = 'WATER',
  FOREST = 'FOREST',
  SWAMP = 'SWAMP',
  MAGMA = 'MAGMA',
  ICE = 'ICE',
  DESERT = 'DESERT',
  DUNGEON = 'DUNGEON'
}

/**
 * Actions during biome assignment.
 */
export enum BiomeAction {
  CONVERT = 'CONVERT',     // Successful tile conversion
  SKIP = 'SKIP'           // Failed conversion or already assigned
}

/**
 * Interactable objects that can be placed on tiles.
 */
export enum InteractableType {
  ENTRY = 'ENTRY',
  EXIT = 'EXIT',
  KEY = 'KEY'
  // Future: CHEST, TRAP, MONSTER, etc.
}

// ============================================================================
// CORE DOMAIN MODELS
// ============================================================================

/**
 * 2D position on the grid.
 * Origin (0,0) is top-left corner.
 */
export interface Position {
  x: number
  y: number
}

/**
 * Individual cell in the grid.
 */
export interface Tile {
  position: Position
  type: TileType
  biome: BiomeType | null
  interactable: InteractableType | null
}

/**
 * 2D grid containing all tiles.
 * tiles[y][x] for row-major access.
 */
export interface Grid {
  width: number
  height: number
  tiles: Tile[][]
}

/**
 * Single step in the miner's path.
 */
export interface PathNode {
  position: Position
  miningAction: MiningAction
  timestamp: number
}

// ============================================================================
// MODULE 1: MINING CONFIGURATION
// ============================================================================

/**
 * Configuration for the mining algorithm.
 */
export interface MiningConfig {
  width: number
  height: number
  targetPercentage: number
  breakWallWeight: number
  backtrackWeight: number
  sectionsX?: number
  sectionsY?: number
  applyVoid?: boolean
  seed?: number
}

// ============================================================================
// MODULE 1: MINING OUTPUT
// ============================================================================

/**
 * Performance and composition metrics from mining run.
 */
export interface MiningStats {
  totalTiles: number
  floorTiles: number
  wallTiles: number
  voidTiles: number
  
  totalSteps: number
  breakActions: number
  backtrackActions: number
  
  executionTimeMs: number
  avgStepTimeMs: number
  
  minersStartPosition: Position
  finalPercentage: number
}

/**
 * Complete result from mining algorithm.
 */
export interface MiningResult {
  grid: Grid
  path: PathNode[]
  stats: MiningStats
}

// ============================================================================
// MODULE 2.1: BIOME CONFIGURATION
// ============================================================================

/**
 * Configuration for biome assignment.
 */
export interface BiomeConfig {
  biomes: BiomeDefinition[]
  floorConversionChance: number  // Default: 0.75
  wallConversionChance: number   // Default: 0.50
  expansionMode: 'CARDINAL' | 'ALL'  // NSWE only or all 8 directions
  seed?: number
}

/**
 * Definition of a single biome to be placed.
 */
export interface BiomeDefinition {
  type: BiomeType
  centerCount: number  // How many centers for this biome
}

// ============================================================================
// MODULE 2.1: BIOME OUTPUT
// ============================================================================

/**
 * Single step in biome expansion path.
 */
export interface BiomePathNode {
  position: Position
  biomeType: BiomeType
  action: BiomeAction
  cycleNumber: number    // Which iteration of the biomes loop
  stepNumber: number     // Which tile within this biome's turn
  timestamp: number
}

/**
 * Statistics from biome assignment.
 */
export interface BiomeStats {
  biomeCoverage: Map<BiomeType, number>  // Percentage of map per biome
  totalBiomeCenters: number
  tilesWithBiome: number
  tilesWithoutBiome: number
  conversionAttempts: number
  successfulConversions: number
  skippedTiles: number
  totalCycles: number
}

/**
 * Complete result from biome assignment.
 */
export interface BiomeAssignmentResult {
  grid: Grid
  path: BiomePathNode[]
  stats: BiomeStats
}

// ============================================================================
// MODULE 2.2: SPAWN POINTS CONFIGURATION
// ============================================================================

/**
 * Configuration for spawn point placement.
 */
export interface SpawnPointConfig {
  entryCount: number        // Total entry points
  exitCount: number         // Total exit points
  keyCount: number          // Total keys (recommend: exitCount + extras)
  seed?: number
}

// ============================================================================
// MODULE 2.2: SPAWN POINTS OUTPUT
// ============================================================================

/**
 * Statistics from spawn point placement.
 */
export interface SpawnPointStats {
  c1Tiles: number          // Dead ends (1 connection)
  c2Tiles: number          // 2 connections
  c3Tiles: number          // 3 connections
  c4Tiles: number          // Most connected (4 connections)
  
  entriesPlacedOnC4: number
  entriesPlacedOnC3: number
  
  exitsPlacedOnC1: number
  exitsPlacedOnC2: number
  
  keysPlacedOnC3: number
  keysPlacedOnC2: number
}

/**
 * Complete result from spawn point placement.
 */
export interface SpawnPointResult {
  grid: Grid               // Grid with interactables assigned
  entries: Position[]      // Entry positions
  exits: Position[]        // Exit positions
  keys: Position[]         // Key positions
  stats: SpawnPointStats
}

// ============================================================================
// VISUALIZER MODELS
// ============================================================================

/**
 * Viewport configuration for rendering large grids.
 */
export interface Viewport {
  windowWidth: number
  windowHeight: number
  offsetX: number
  offsetY: number
  zoom: number
}

/**
 * Input data for the visualizer.
 */
export interface VisualizerInput {
  grid: Grid
  path: PathNode[]
  stats: MiningStats
}

/**
 * Runtime state of the visualizer.
 */
export interface VisualizerState {
  currentStep: number
  isPlaying: boolean
  playbackSpeed: number
  displayGrid: Grid
  viewport: Viewport
  centerOnMiner: boolean
}