/**
 * Constants and constraints for map generation.
 */

export const GRID_CONSTRAINTS = {
  MATHEMATICAL_MIN_SIZE: 7,      // Hard minimum (prevents degenerate grids)
  RECOMMENDED_MIN_SIZE: 50,      // Practical minimum for gameplay
  
  MATHEMATICAL_MAX_PERCENT: 75,  // True geometric ceiling (odd row/column pattern)
  ALLOWED_MAX_PERCENT: 70,       // Hard limit enforced by validation
  RECOMMENDED_MAX_PERCENT: 50    // Optimal for gameplay balance
} as const

export const SECTION_CONSTRAINTS = {
  MIN_SECTION_SIZE: 10,          // Hard minimum section dimension
  RECOMMENDED_SECTION_SIZE: 50   // Recommended minimum section dimension
} as const