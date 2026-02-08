# 🏰 Castle Run

A procedurally-generated turn-based board game with fog-of-war exploration mechanics. Players deploy pieces to explore randomly generated maps, collect items, avoid traps, and race to escape through exits.

## Project Overview

Castle Run is built in a modular architecture, with each module handling a specific aspect of the game:

- **Module 1: Map Generation** - Procedural map creation using the Mining Walls algorithm
- **Module 2: Map Filling** *(Coming Soon)* - Region assignment, item/trap placement, entry/exit spawning
- **Module 3: Gameplay** *(Coming Soon)* - Turn-based mechanics, fog-of-war, async multiplayer

## Current Status

✅ **Module 1 Complete** - Fully functional map generation with visualization tools

## Tech Stack

- **Language**: TypeScript
- **Runtime**: Node.js (development), Browser (web visualizer)
- **Future Deployment**: Vercel (hosting) + Upstash (database for multiplayer)

## Quick Start

### Installation
```bash
npm install
```

### Generate a Map (Console)
```bash
npm run dev:console
```

This runs the terminal-based visualizer with emoji rendering. Use interactive controls:
- `<` / `>` - Step backward/forward
- `<<` / `>>` - Jump to previous/next wall break
- `[number]` - Jump to specific step
- `q` - Quit

### Generate a Map (Web UI)
```bash
npm run dev:web
```

Opens a browser-based visualizer at `http://localhost:3000` with:
- Interactive step-through controls
- Zoom in/out (`+` / `-` keys)
- Playback animation
- Save/load map files
- Real-time statistics

### Build
```bash
npm run build
```

Compiles TypeScript to JavaScript in the `dist/` folder.

### Run Tests
```bash
npm run test
```

## Project Structure
```
CastleRun_v2/
├── src/
│   ├── shared/              # Shared utilities and types
│   │   ├── domain/          # Core types and constants
│   │   └── utils/           # Grid, position, direction helpers
│   │
│   └── module1/             # Map Generation Module
│       ├── algorithm/       # Mining algorithm implementation
│       ├── stats/           # Performance metrics
│       ├── visualizers/     # Console and web visualizers
│       ├── index.ts         # Public API
│       └── README.md        # Module 1 documentation
│
├── saved-maps/              # Storage for downloaded map files
├── dist/                    # Compiled TypeScript output
└── README.md               # This file
```

## Module 1: Map Generation

The map generation uses a **Mining Walls algorithm**:

1. Start with a grid of all walls
2. Place a virtual "miner" at a random position
3. Miner breaks walls following specific rules:
   - Cannot break border walls
   - Cannot create 2×2 floor patterns (prevents open areas)
4. Miner randomly chooses to break new walls or backtrack (weighted)
5. Continues until target floor percentage is reached
6. Apply VOID to unreachable outer walls

### Key Features

- **Reproducible**: Seed-based generation for consistent maps
- **Configurable**: Adjust size, density, and miner behavior
- **Performance Optimized**: HashSet caching for large maps (100×100+)
- **Validated**: Post-generation checks ensure no invalid patterns
- **Save/Load**: Export maps as JSON for reuse

### Example Usage
```typescript
import { runMiningAlgorithm } from './src/module1/index.js'

const result = runMiningAlgorithm({
  width: 50,
  height: 50,
  targetPercentage: 50,
  breakWallWeight: 5,
  backtrackWeight: 1,
  seed: 12345
})

console.log(`Generated ${result.stats.floorTiles} floor tiles`)
console.log(`Took ${result.stats.totalSteps} steps`)
```

For detailed information about the algorithm, see [`src/module1/README.md`](src/module1/README.md).

## Saved Maps

Maps can be saved as JSON files and stored in the `saved-maps/` directory. Each file contains:
- Grid state (final layout)
- Complete miner path (for replay)
- Statistics (performance metrics)
- Configuration (for reproducibility)

Load saved maps in the web visualizer using the "Load Map" button.

## Development Roadmap

### ✅ Module 1: Map Generation (Complete)
- Mining Walls algorithm
- Console and web visualizers
- Save/load functionality
- Performance optimizations

### 🚧 Module 2: Map Filling (Next)
- Region assignment and theming
- Entry/exit placement
- Item, trap, and enemy spawning
- Breakable wall distribution

### 📋 Module 3: Gameplay (Planned)
- Player and piece classes
- Async turn-based resolution
- Fog-of-war mechanics
- Item/trap/combat systems
- Win conditions

## Contributing

This is a personal project, but feedback and suggestions are welcome! Open an issue on GitHub if you find bugs or have ideas.

## License

MIT License - See LICENSE file for details

---

**Built with ❤️ by Nuno Bartolomeu**