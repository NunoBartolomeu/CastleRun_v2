/**
 * Biome list UI management
 */

import { BiomeType } from '../../../../dist/shared/domain/models.js'

let biomeIdCounter = 0

export function initBiomeManager() {
  document.getElementById('add-biome').addEventListener('click', addBiomeEntry)
  
  // Add initial biome
  addBiomeEntry()
}

export function addBiomeEntry() {
  const container = document.getElementById('biome-entries')
  const id = biomeIdCounter++
  
  const entry = document.createElement('div')
  entry.className = 'biome-entry'
  entry.dataset.id = id
  
  entry.innerHTML = `
    <select>
      <option value="${BiomeType.WATER}">Water</option>
      <option value="${BiomeType.FOREST}">Forest</option>
      <option value="${BiomeType.SWAMP}">Swamp</option>
      <option value="${BiomeType.MAGMA}">Magma</option>
      <option value="${BiomeType.ICE}">Ice</option>
      <option value="${BiomeType.DESERT}">Desert</option>
      <option value="${BiomeType.DUNGEON}">Dungeon</option>
    </select>
    <input type="number" value="1" min="1" max="10" style="width: 60px;">
    <button data-remove="${id}">✕</button>
  `
  
  entry.querySelector('button').addEventListener('click', () => removeBiomeEntry(id))
  
  container.appendChild(entry)
}

function removeBiomeEntry(id) {
  const entry = document.querySelector(`.biome-entry[data-id="${id}"]`)
  if (entry) entry.remove()
}

export function getBiomeList() {
  const biomeEntries = document.querySelectorAll('.biome-entry')
  const biomes = []
  
  for (const entry of biomeEntries) {
    const type = entry.querySelector('select').value
    const centerCount = parseInt(entry.querySelector('input').value)
    biomes.push({ type, centerCount })
  }
  
  return biomes
}