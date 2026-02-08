# Module 1: Map Generation

This module implements the **Mining Walls Algorithm** for procedural map generation in Castle Run. It creates connected, maze-like layouts with guaranteed pathfinding properties.

## Table of Contents

- [Algorithm Overview](#algorithm-overview)
- [Architecture](#architecture)
- [API Reference](#api-reference)
- [Configuration](#configuration)
- [Performance](#performance)
- [Validation](#validation)
- [Visualizers](#visualizers)

---

## Algorithm Overview

The Mining Walls algorithm generates maps by simulating a virtual "miner" carving paths through a solid wall grid.

### Core Concept

1. **Initialize**: Start with a grid entirely filled with walls
2. **Place Miner**: Drop miner at a random interior position
3. **Mining Loop**: Miner repeatedly chooses a direction and moves:
   - If target is a **breakable wall** → break it (create floor)
   - If target is **existing floor** → backtrack (reuse path)
4. **Termination**: Stop when target floor percentage is reached
5. **Post-Processing**: Apply VOID type to unreachable outer walls

### Wall Breaking Rules

The miner cannot break a wall if:

1. **Border Rule**: Target position is on the grid border
2. **No 2×2 Rule**: Breaking would create a 2×2 block of floor tiles

The 2×2 rule prevents large open areas and maintains corridor-like paths.

#### 2×2 Detection

For each potential wall break, check all 4 possible 2×2 patterns where the target would be one corner:
```
Target at T, checking pattern with E, S, SE:

  T  E
  S  SE

If E, S, and SE are all FLOOR → Cannot break T
```

All four patterns are checked:
- North + East + NE
- North + West + NW
- South + East + SE
- South + West + SW

### Movement Weighting

The miner's direction is chosen randomly from a weighted pool:

- **Break Weight**: How many times to add "break new wall" options
- **Backtrack Weight**: How many times to add "move to existing floor" options

Example with `breakWallWeight=5`, `backtrackWeight=1`:
```
Valid moves: [N_break, N_break, N_break, N_break, N_break, S_backtrack]
Miner has 5/6 chance to break North, 1/6 chance to backtrack South
```

This creates a bias toward exploration while allowing occasional backtracking.

### VOID Application

After mining completes, a BFS (Breadth-First Search) floods from border tiles inward:

1. Start at all border walls
2. For each wall, check if any adjacent tile (including diagonals) is FLOOR
3. If **no adjacent floor** → convert to VOID and propagate to neighbors
4. Continue until no more tiles can become VOID

This creates a "moat" of unreachable void around the playable area.

---

## Architecture
```
module1/
├── algorithm/
│   ├── mining.ts              # Main entry point
│   ├── pathfinding.ts         # Movement logic + caching
│   ├── rules.ts               # Wall-breaking validation
│   ├── validation.ts          # Pre-generation config checks
│   ├── validation-post.ts     # Post-generation grid validation
│   └── postProcessing.ts      # VOID application
│
├── stats/
│   └── metrics.ts             # Statistics calculation
│
├── visualizers/
│   ├── console/               # Terminal-based replay
│   └── web/                   # Browser-based UI
│
└── index.ts                   # Public API exports
```

### Key Components

**`mining.ts`**
- Main algorithm orchestrator
- Initializes grid, miner, and caching
- Runs mining loop until target reached
- Applies post-processing and validation

**`pathfinding.ts`**
- `getValidMoves()` - Finds breakable walls and backtrack options
- `createBreakabilityCache()` - Performance optimization with HashSets
- `shouldStop()` - Checks if target percentage reached

**`rules.ts`**
- `canBreakWall()` - Validates wall-breaking rules
- Checks border constraint and 2×2 patterns

**`validation.ts`**
- Pre-generation config validation
- Size, percentage, and weight checks
- `calculateMaxPercentage()` - Theoretical max based on grid size

**`validation-post.ts`**
- Post-generation grid validation
- Detects any 2×2 patterns that slipped through
- Ensures no floor tiles on borders

**`postProcessing.ts`**
- `applyVoidToEdges()` - BFS-based VOID flooding

**`metrics.ts`**
- Calculates comprehensive statistics
- Tile counts, action breakdown, performance metrics

---

## API Reference

### Main Function
```typescript
function runMiningAlgorithm(config: MiningConfig): MiningResult
```

**Parameters:**
- `config: MiningConfig` - Algorithm configuration

**Returns:**
- `MiningResult` - Complete result with grid, path, and stats

**Throws:**
- `Error` - If config is invalid or constraints violated

### Types

#### MiningConfig
```typescript
interface MiningConfig {
  width: number              // Grid width (min: 7, recommended: 50+)
  height: number             // Grid height (min: 7, recommended: 50+)
  targetPercentage: number   // Target floor % (max: 70%, recommended: 50%)
  breakWallWeight: number    // Weight for breaking new walls (min: 1)
  backtrackWeight: number    // Weight for moving to existing floor (min: 1)
  startingPos?: Position     // Optional starting position (random if null)
  seed?: number              // Optional seed for reproducibility (timestamp if null)
}
```

#### MiningResult
```typescript
interface MiningResult {
  grid: Grid           // Final grid state (with VOID applied)
  path: PathNode[]     // Complete miner path (every step)
  stats: MiningStats   // Performance and composition metrics
}
```

#### Grid
```typescript
interface Grid {
  width: number
  height: number
  tiles: Tile[][]      // 2D array, access as tiles[y][x]
}

interface Tile {
  type: TileType       // WALL, FLOOR, or VOID
  position: Position   // { x, y }
  region: RegionType | null  // For Module 2 (null in Module 1)
}
```

#### PathNode
```typescript
interface PathNode {
  position: Position
  miningAction: MiningAction  // BREAK or BACKTRACK
  timestamp: number           // Milliseconds since start
}
```

#### MiningStats
```typescript
interface MiningStats {
  // Grid composition
  totalTiles: number
  floorTiles: number
  wallTiles: number
  voidTiles: number
  
  // Mining process
  totalSteps: number
  breakActions: number
  backtrackActions: number
  
  // Performance
  executionTimeMs: number
  avgStepTimeMs: number
  
  // Metadata
  minersStartPosition: Position
  finalPercentage: number
}
```

---

## Configuration

### Size Constraints
```typescript
const GRID_CONSTRAINTS = {
  MATHEMATICAL_MIN_SIZE: 7,      // Hard minimum
  RECOMMENDED_MIN_SIZE: 50,      // For good gameplay
  
  MATHEMATICAL_MAX_PERCENT: 75,  // Geometric ceiling
  ALLOWED_MAX_PERCENT: 70,       // Enforced limit
  RECOMMENDED_MAX_PERCENT: 50    // Optimal balance
}
```

**Why these limits?**

- **Minimum 7×7**: Smaller grids don't provide enough interior space for meaningful paths
- **Maximum 70% floor**: The 2×2 rule geometrically limits density (theoretical max ~75%)
- **Recommended 50%**: Creates interesting maze-like layouts with good exploration

### Calculating Maximum Floor Percentage

The theoretical maximum is based on an alternating pattern:
```
For inner area (excluding 2-tile border):

oddRows = ceil(innerHeight / 2)
evenRows = floor(innerHeight / 2)
oddCols = ceil(innerWidth / 2)

maxFloor = (oddRows × innerWidth) + (evenRows × oddCols)
```

Example for 50×50 grid:
- Inner area: 48×48 = 2,304 tiles
- Max floor: ~1,728 tiles (75%)
- Total grid: 2,500 tiles
- Max percentage: ~69%

### Weight Tuning

**Higher Break Weight** (e.g., 10:1)
- More aggressive exploration
- Longer corridors
- Less branching
- Faster to reach target percentage

**Lower Break Weight** (e.g., 3:1)
- More backtracking
- More branching paths
- Denser coverage
- Slower generation

**Recommended**: `breakWallWeight: 5`, `backtrackWeight: 1`

---

## Performance

### Optimization Strategies

#### 1. Breakability Cache (HashSets)

Two HashSets track wall-breaking eligibility:

- **`cantBreak`**: Walls confirmed as unbreakable (don't re-check)
- **`noFurtherBreak`**: Floor positions that block all adjacent walls

This avoids redundant `canBreakWall()` calls, which are expensive (check 4 patterns × 3 tiles each).

**Performance Impact:**
- 50×50 grid: ~10-20% faster
- 100×100 grid: ~30-50% faster
- 200×200 grid: ~60-80% faster

#### 2. Early Termination

The algorithm checks `shouldStop()` every iteration, terminating as soon as the target percentage is reached.

#### 3. Seeded RNG

Uses a simple Linear Congruential Generator (LCG) for deterministic randomness. Avoids `Math.random()` overhead.

### Benchmarks

Typical performance on modern hardware:

| Grid Size | Target % | Time (ms) | Steps  |
|-----------|----------|-----------|--------|
| 25×25     | 50%      | 5-10      | ~300   |
| 50×50     | 50%      | 15-30     | ~1,200 |
| 100×100   | 50%      | 80-150    | ~5,000 |
| 200×200   | 50%      | 500-800   | ~20,000|

*Note: Times vary based on seed and weights*

---

## Validation

### Pre-Generation Validation

**`validateMiningConfig(config)`** checks:

1. Grid size ≥ 7×7
2. Target percentage ≤ 70%
3. Weights > 0
4. Starting position (if provided) is in bounds and not on border

Throws errors for hard constraints, logs warnings for soft recommendations.

### Post-Generation Validation

**`validateGrid(grid)`** checks the final grid:

1. **No 2×2 floor patterns**: Sliding window across entire grid
2. **No floor on borders**: All border tiles must be WALL or VOID

Returns `ValidationResult`:
```typescript
{
  isValid: boolean
  errors: string[]  // Detailed error messages
}
```

Currently configured to **warn** (not throw) to allow inspection of invalid grids during development.

---

## Visualizers

### Console Visualizer

**Location**: `visualizers/console/console-visualizer.ts`

**Run**: `npm run dev:console`

**Features**:
- Emoji rendering (🟫 Wall, ⬜ Floor, ⬛ Void, 🟦 Miner)
- Step-through controls:
  - `<` / `>` - Previous/next step
  - `<<` / `>>` - Previous/next BREAK action
  - `[number]` - Jump to specific step
  - `q` - Quit
- Real-time statistics display

### Web Visualizer

**Location**: `visualizers/web/`

**Run**: `npm run dev:web`

**Features**:
- Canvas-based rendering with zoom (`+` / `-`)
- Interactive controls:
  - ⏮ First / ⏭ Last
  - ⏪ Prev Break / ⏩ Next Break
  - ◀ Previous / ▶ Next
  - ▶ Play/Pause (auto-advance)
- Configuration panel
- Statistics dashboard
- Save/Load maps as JSON
- Keyboard shortcuts (arrows, space)

---

## Examples

### Basic Usage
```typescript
import { runMiningAlgorithm } from './module1/index.js'

const result = runMiningAlgorithm({
  width: 30,
  height: 30,
  targetPercentage: 50,
  breakWallWeight: 5,
  backtrackWeight: 1,
  seed: 12345
})

console.log(`Floor: ${result.stats.finalPercentage.toFixed(2)}%`)
console.log(`Steps: ${result.stats.totalSteps}`)
console.log(`Time: ${result.stats.executionTimeMs}ms`)
```

### Save Map to File
```typescript
import { writeFileSync } from 'fs'

const result = runMiningAlgorithm({ /* config */ })

const data = {
  version: '1.0',
  timestamp: new Date().toISOString(),
  config: { /* your config */ },
  grid: result.grid,
  path: result.path,
  stats: result.stats
}

writeFileSync('saved-maps/my-map.json', JSON.stringify(data, null, 2))
```

### Load and Replay
```typescript
import { readFileSync } from 'fs'

const data = JSON.parse(readFileSync('saved-maps/my-map.json', 'utf-8'))

// Use data.grid, data.path for visualization
// data.config contains original parameters
```

---

## Future Improvements

### Potential Enhancements

1. **Connectivity Analysis**: Verify all floor tiles are reachable from any starting point
2. **Density Maps**: Heat map showing floor distribution across grid
3. **Path Complexity Metrics**: Measure branching factor, dead-ends, longest paths
4. **GPU Acceleration**: Offload grid operations for 500×500+ grids
5. **Alternative Algorithms**: Cellular automata, recursive division, etc.

### Module 2 Integration

The `Tile.region` field is reserved for Module 2, which will:
- Assign regions (water, forest, desert, etc.)
- Theme visuals based on region type
- Apply region-specific game mechanics

---

## Troubleshooting

### Common Issues

**"No valid moves available"**
- Bug in wall-breaking logic (should never happen)
- Check if starting position is on border

**Generation too slow**
- Reduce grid size or target percentage
- Lower break weight (causes more backtracking, which is faster)

**2×2 patterns appearing**
- Post-generation validation should catch these
- If you see this, report as bug

**Invalid percentage target**
- Cannot exceed 70% due to 2×2 rule
- Use `calculateMaxPercentage()` to check theoretical limit

---

## Contributing

When modifying this module:

1. Run validation on generated grids
2. Test with various seeds (randomness is critical)
3. Benchmark large grids (100×100+) for performance
4. Update this README if changing API or algorithm

---

**Questions or suggestions? Open an issue on GitHub!**