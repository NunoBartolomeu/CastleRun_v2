/**
 * Direction utilities for mining algorithm.
 */

import { Direction } from '../domain/models.js'

/**
 * Cardinal directions (used for movement).
 */
export const CARDINAL_DIRECTIONS: Direction[] = [
  Direction.N,
  Direction.S,
  Direction.E,
  Direction.W
]

/**
 * All 8 directions (cardinals + diagonals).
 */
export const ALL_DIRECTIONS: Direction[] = [
  Direction.N,
  Direction.S,
  Direction.E,
  Direction.W,
  Direction.NE,
  Direction.SE,
  Direction.NW,
  Direction.SW
]

/**
 * Gets adjacent cardinal directions for a given direction.
 * Used for 2x2 checking (e.g., N -> [E, W]).
 */
export function getAdjacentDirections(direction: Direction): Direction[] {
  const adjacents: Record<Direction, Direction[]> = {
    [Direction.N]:  [Direction.E, Direction.W],
    [Direction.S]:  [Direction.E, Direction.W],
    [Direction.E]:  [Direction.N, Direction.S],
    [Direction.W]:  [Direction.N, Direction.S],
    // Diagonals not used for movement, but include for completeness
    [Direction.NE]: [Direction.N, Direction.E],
    [Direction.SE]: [Direction.S, Direction.E],
    [Direction.NW]: [Direction.N, Direction.W],
    [Direction.SW]: [Direction.S, Direction.W]
  }
  
  return adjacents[direction]
}