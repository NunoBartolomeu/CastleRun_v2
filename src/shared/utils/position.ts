/**
 * Position utilities for grid operations.
 */

import type { Position, Direction } from '../domain/models.js'
import { Direction as Dir } from '../domain/models.js'

/**
 * Checks if position is within grid bounds.
 */
export function isInBounds(pos: Position, width: number, height: number): boolean {
  return pos.x >= 0 && pos.x < width && pos.y >= 0 && pos.y < height
}

/**
 * Checks if position is on grid border.
 */
export function isOnBorder(pos: Position, width: number, height: number): boolean {
  return pos.x === 0 || pos.x === width - 1 || pos.y === 0 || pos.y === height - 1
}

/**
 * Gets position offset by a direction.
 */
export function getPositionInDirection(pos: Position, direction: Direction): Position {
  const offsets: Record<Direction, { dx: number; dy: number }> = {
    [Dir.N]:  { dx: 0,  dy: -1 },
    [Dir.S]:  { dx: 0,  dy: 1 },
    [Dir.E]:  { dx: 1,  dy: 0 },
    [Dir.W]:  { dx: -1, dy: 0 },
    [Dir.NE]: { dx: 1,  dy: -1 },
    [Dir.SE]: { dx: 1,  dy: 1 },
    [Dir.NW]: { dx: -1, dy: -1 },
    [Dir.SW]: { dx: -1, dy: 1 }
  }
  
  const offset = offsets[direction]
  return {
    x: pos.x + offset.dx,
    y: pos.y + offset.dy
  }
}

/**
 * Checks if two positions are equal.
 */
export function positionsEqual(a: Position, b: Position): boolean {
  return a.x === b.x && a.y === b.y
}

/**
 * Creates a position key for use in Sets/Maps.
 */
export function positionKey(pos: Position): string {
  return `${pos.x},${pos.y}`
}

/**
 * Parses a position from a key string.
 */
export function parsePositionKey(key: string): Position {
  const [x, y] = key.split(',').map(Number)
  return { x, y }
}