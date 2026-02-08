/**
 * Seeded random number generator for reproducible results.
 * Uses a simple Linear Congruential Generator (LCG).
 */

export class SeededRandom {
  private state: number
  
  constructor(seed: number) {
    this.state = seed
  }
  
  /**
   * Returns a random number between 0 and 1 (exclusive).
   */
  next(): number {
    // LCG parameters (same as java.util.Random)
    const a = 1103515245
    const c = 12345
    const m = 2 ** 31
    
    this.state = (a * this.state + c) % m
    return this.state / m
  }
  
  /**
   * Returns a random integer between min (inclusive) and max (exclusive).
   */
  nextInt(min: number, max: number): number {
    return Math.floor(this.next() * (max - min)) + min
  }
  
  /**
   * Picks a random element from an array.
   */
  choice<T>(array: T[]): T {
    if (array.length === 0) {
      throw new Error('Cannot choose from empty array')
    }
    const index = this.nextInt(0, array.length)
    return array[index]
  }
  
  /**
   * Generates a random position within bounds.
   */
  randomPosition(width: number, height: number): { x: number; y: number } {
    return {
      x: this.nextInt(0, width),
      y: this.nextInt(0, height)
    }
  }
}