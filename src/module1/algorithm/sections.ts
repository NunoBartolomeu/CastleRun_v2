/**
 * Section management for multi-section mining.
 * 
 * Sections divide a grid into independent rectangular areas.
 * Each section is mined separately with its own target floor count.
 * Miners cannot cross section boundaries but can break walls on boundaries.
 */

import type { Position } from '../../shared/domain/models.js'

/**
 * Represents a rectangular section of the grid.
 */
export interface Section {
  id: string              // Section identifier (e.g., "0,0" for top-left)
  minX: number           // Minimum X coordinate (inclusive)
  maxX: number           // Maximum X coordinate (inclusive)
  minY: number           // Minimum Y coordinate (inclusive)
  maxY: number           // Maximum Y coordinate (inclusive)
  targetFloorCount: number // Number of floor tiles this section should have
}

/**
 * Divides a grid into sections for multi-section mining.
 * 
 * Sections are arranged in a grid pattern (sectionsX columns × sectionsY rows).
 * The last section in each dimension may be larger to account for remainder tiles.
 * 
 * @param width - Total grid width
 * @param height - Total grid height
 * @param sectionsX - Number of sections horizontally
 * @param sectionsY - Number of sections vertically
 * @param targetPercentage - Target floor percentage for each section
 * @returns Array of sections, ordered left-to-right, top-to-bottom
 */
export function createSections(
  width: number,
  height: number,
  sectionsX: number,
  sectionsY: number,
  targetPercentage: number
): Section[] {
  const sections: Section[] = []
  
  const sectionWidth = Math.floor(width / sectionsX)
  const sectionHeight = Math.floor(height / sectionsY)
  
  for (let sy = 0; sy < sectionsY; sy++) {
    for (let sx = 0; sx < sectionsX; sx++) {
      const minX = sx * sectionWidth
      const minY = sy * sectionHeight
      
      // Last section in each direction gets any remaining tiles
      const maxX = (sx === sectionsX - 1) ? width - 1 : (sx + 1) * sectionWidth - 1
      const maxY = (sy === sectionsY - 1) ? height - 1 : (sy + 1) * sectionHeight - 1
      
      const sectionTiles = (maxX - minX + 1) * (maxY - minY + 1)
      const targetFloorCount = Math.floor(sectionTiles * (targetPercentage / 100))
      
      sections.push({
        id: `${sx},${sy}`,
        minX,
        maxX,
        minY,
        maxY,
        targetFloorCount
      })
    }
  }
  
  return sections
}

/**
 * Checks if a position is within section bounds.
 */
export function isInSection(pos: Position, section: Section): boolean {
  return pos.x >= section.minX && pos.x <= section.maxX &&
         pos.y >= section.minY && pos.y <= section.maxY
}

/**
 * Checks if a position is on the grid border (hard border - unbreakable).
 */
export function isOnGridBorder(pos: Position, width: number, height: number): boolean {
  return pos.x === 0 || pos.x === width - 1 || pos.y === 0 || pos.y === height - 1
}

/**
 * Checks if a position is on a section boundary (soft border).
 * Miners cannot cross these boundaries but can break walls on them.
 */
export function isOnSectionBoundary(pos: Position, section: Section): boolean {
  return pos.x === section.minX || pos.x === section.maxX ||
         pos.y === section.minY || pos.y === section.maxY
}