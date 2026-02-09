/**
 * Domain models for Castle Run map generation.
 * Contains all core types, enums, and interfaces used throughout Module 1.
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
 * Cardinals (N,S,E,W): Used for miner movement
 * Diagonals (NE,SE,NW,SW): Used only for 2x2 floor detection
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
 * Placeholder for region types (Module 2).
 */
export enum RegionType {
  // To be defined in Module 2
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
  type: TileType
  position: Position
  region: RegionType | null
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
// CONFIGURATION
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
  backtrackPenalty?: number
  startingPos?: Position
  seed?: number
  sectionsX?: number
  sectionsY?: number
}

// ============================================================================
// ALGORITHM OUTPUT
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
// VISUALIZER MODELS (for future use)
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