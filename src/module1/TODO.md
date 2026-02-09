# Module 1: Map Generation - TODO List

This document tracks remaining tasks for Module 1. Items are categorized by priority.

---

## 🔴 URGENT
*Needs to be done as soon as possible above everything else.*

### Move Visualizers Out of Module 1
**Why:** Visualizers will be used across multiple modules (Module 2 for region editing, Module 3 for gameplay testing). They shouldn't be nested inside Module 1.

**Proposed Structure:**
```
src/
├── shared/
├── module1/
├── module2/ (future)
└── visualizers/
    ├── console/
    └── web/
```

**Tasks:**
- [ ] Move `src/module1/visualizers/` → `src/visualizers/`
- [ ] Update import paths in visualizer files
- [ ] Update `package.json` scripts
- [ ] Test both visualizers still work
- [ ] Update READMEs to reflect new structure

---

## 🟠 IMPORTANT
*Needs to be done, the sooner the better.*

### Performance Investigation (1000×1000 Grids)
**Issue:** Large grids still crash or are extremely slow despite optimizations.

**Tasks:**
- [ ] Profile the algorithm to identify bottlenecks
- [ ] Test if sections help performance (e.g., 1000×1000 with 10×10 sections)
- [ ] Consider async/background generation for web visualizer (Web Workers)
- [ ] Add progress reporting for long-running generations
- [ ] Document tested grid size limits in README

### Improve Configuration Guidance
**Issue:** Users don't know what values make sense for different use cases.

**Tasks:**
- [ ] Add configuration presets in web visualizer (Tiny, Small, Medium, Large, Huge)
- [ ] Add "Calculate Recommended Sections" button based on grid size
- [ ] Show real-time warnings in UI when config is outside recommended ranges
- [ ] Add tooltips/help text explaining each parameter
- [ ] Document common use cases with example configs

### Section Distribution Quality
**Issue:** Even with sections, floor distribution can be uneven within sections.

**Tasks:**
- [ ] Investigate if miner gets "stuck" in corners of sections
- [ ] Consider adding "exploration pressure" to encourage spreading
- [ ] Test different weight ratios for sectioned vs non-sectioned generation
- [ ] Add distribution metrics to stats (variance, clustering)

---

## 🟡 NECESSARY
*Needs to be done by the end, but can be put aside for now.*

### Testing
**Tasks:**
- [ ] Unit tests for validation functions (`validation-pre.ts`)
- [ ] Unit tests for rules (`canBreakWall`, 2×2 detection)
- [ ] Unit tests for section creation and bounds checking
- [ ] Integration tests for small grids (verify no 2×2, correct percentage)
- [ ] Seed reproducibility tests (same seed = same output)
- [ ] Performance benchmarks for different grid sizes
- [ ] Edge case tests (minimum grid size, maximum percentage, single-tile sections)

### Better Documentation
**Tasks:**
- [ ] Add inline code examples to Module 1 README
- [ ] Document algorithm complexity (time/space)
- [ ] Add troubleshooting section with common errors
- [ ] Create visual diagrams for 2×2 detection logic
- [ ] Document section boundary behavior with examples
- [ ] Add "How to Choose Section Count" guide
- [ ] Explain cache strategy and when it helps vs hurts

### Code Quality
**Tasks:**
- [ ] Remove any remaining magic numbers (search codebase)
- [ ] Ensure all functions have proper JSDoc comments
- [ ] Standardize error messages (consistent format)
- [ ] Add type guards where appropriate
- [ ] Review and optimize import statements

### Save/Load Improvements
**Tasks:**
- [ ] Add validation when loading saved maps (check version, schema)
- [ ] Support loading older map formats (if schema changes)
- [ ] Add map metadata (name, description, tags)
- [ ] Create a "map library" view in web visualizer to browse saved maps

---

## 🟢 OPTIONAL
*Doesn't need to be done, but is nice to have.*

### Curated Example Maps
**Tasks:**
- [ ] Generate and save high-quality example maps with different configs
- [ ] Include maps showcasing different section layouts
- [ ] Add maps with extreme parameters (high density, large size, many sections)
- [ ] Create a `examples/maps/` folder with these files
- [ ] Document each example map's purpose

### Web Visualizer Enhancements
**Tasks:**
- [ ] Change theme colors (current brown/white/blue palette)
- [ ] Add dark/light theme toggle
- [ ] Keyboard shortcut reference panel
- [ ] Export map as PNG image
- [ ] Show section boundaries visually on canvas (different color lines)
- [ ] Add "heat map" mode showing floor density
- [ ] Minimap for large grids
- [ ] Customizable playback speed slider

### Console Visualizer Enhancements
**Tasks:**
- [ ] Allow custom emoji selection via config
- [ ] Add color support for terminals that support it
- [ ] Show progress bar during generation
- [ ] Export final grid to ASCII art file

### Algorithm Variants
**Tasks:**
- [ ] Experiment with different miner behaviors (e.g., "prefer long corridors")
- [ ] Add "bias direction" parameter (encourage north/south vs east/west movement)
- [ ] Try multiple simultaneous miners in single section
- [ ] Implement alternative algorithms (cellular automata, recursive division) for comparison

### Developer Tools
**Tasks:**
- [ ] Add debug mode that logs every decision the miner makes
- [ ] Visualize cache state (which walls are marked unbreakable)
- [ ] Step-by-step breakdown of 2×2 checks for specific positions
- [ ] Performance profiler integrated into web visualizer

---

## 💡 IDEAS
*Not fully formed yet, more of a general thought.*

### Grid Connectivity Analysis
**Concept:** Verify that all floor tiles are reachable from any starting point.

**Potential Implementation:**
- Run flood-fill from a random floor tile
- Count reachable tiles vs total floor tiles
- Warn if disconnected regions exist
- Could be added to `validation-post.ts`

**Questions:**
- Is this actually needed? Players can break walls anyway.
- Performance cost for large grids?

### Path Complexity Metrics
**Concept:** Measure how "interesting" the generated map is.

**Potential Metrics:**
- Average path length between two random points
- Number of dead ends
- Branching factor (average exits per corridor intersection)
- Longest possible path without backtracking

**Use Case:** Compare different configs to find optimal settings for gameplay.

### Adaptive Section Sizing
**Concept:** Instead of uniform sections, create variable-sized sections based on target complexity.

**Example:**
- Dense central areas (smaller sections, more detail)
- Sparse outer areas (larger sections, more open)

**Challenges:**
- Complex to implement
- Unclear if it improves results

### Real-time Generation Visualization
**Concept:** Show the miner moving in real-time as the map generates (not just replay).

**Implementation:**
- Yield control to browser between miner steps
- Update canvas progressively
- Use `requestAnimationFrame` or Web Worker with message passing

**Benefits:**
- Visually impressive
- Easier to debug miner behavior

**Drawbacks:**
- Slower total generation time
- More complex code

### GPU-Accelerated Generation
**Concept:** Offload grid operations to GPU using WebGL or compute shaders.

**Feasibility:**
- Most grid operations are sequential (miner path)
- Hard to parallelize core algorithm
- Might help with post-processing (VOID flooding, validation)

**Worth Exploring?** Probably not unless 10,000×10,000 grids become a requirement.

### Alternative VOID Strategy
**Concept:** Instead of BFS from borders, use "distance from floor" metric.

**Algorithm:**
- Calculate distance of each wall tile to nearest floor tile
- Convert walls beyond certain distance threshold to VOID

**Benefit:** More predictable VOID shapes.

**Drawback:** More expensive than BFS.

### Map Editor (Basic)
**Concept:** Allow manual editing of generated maps before using in gameplay.

**Features:**
- Click to toggle WALL/FLOOR/VOID
- Brush size control
- Fill tool (flood fill)
- Undo/redo
- Re-validate after edits

**Where:** Web visualizer, new "Edit" mode.

**Complexity:** Medium - needs UI, state management, validation hooks.

---

## Completed ✅

- [x] Core mining algorithm
- [x] 2×2 floor pattern prevention
- [x] VOID edge application (BFS)
- [x] Performance optimization (2D arrays, incremental floor counting)
- [x] Multi-section support
- [x] Console visualizer
- [x] Web visualizer (canvas-based)
- [x] Save/load maps as JSON
- [x] Configuration validation (pre-generation)
- [x] Grid validation (post-generation)
- [x] Statistics tracking
- [x] Seeded random generation
- [x] Documentation (root README, Module 1 README)

---

## Notes

### On Testing Priority
Testing is **Necessary** but not **Important** because:
- The algorithm is working and validated through manual testing
- Visualizers provide immediate feedback on correctness
- Automated tests will catch regressions when refactoring, but aren't blocking current work

### On Performance
1000×1000 grids are currently problematic. Options:
1. Accept limitation and document "tested up to 500×500"
2. Investigate async generation (Important)
3. Recommend heavy use of sections for large grids (document this)

### On Visualizer Location
Moving visualizers out of Module 1 is **Urgent** because:
- Module 2 will need to edit regions/items/spawns on generated maps
- Module 3 will need to test gameplay on maps
- Visualizers are tools, not part of the generation logic
- Easier to maintain when decoupled

---

**Last Updated:** 2026-02-09