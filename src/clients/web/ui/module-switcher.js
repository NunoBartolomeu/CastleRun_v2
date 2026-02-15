/**
 * Module tab switching logic
 */

import { state } from '../state.js'
import { updateModule1Visualizer } from '../modules/module1.js'
import { updateModule2_1Visualizer } from '../modules/module2-1.js'

export function initModuleSwitcher() {
  document.querySelectorAll('.module-tab').forEach(tab => {
    tab.addEventListener('click', () => switchModule(tab.dataset.module))
  })
}

export function switchModule(module) {
  state.activeModule = module
  
  // Update tabs
  document.querySelectorAll('.module-tab').forEach(tab => {
    tab.classList.toggle('active', tab.dataset.module === module)
  })
  
  // Update config panels
  document.querySelectorAll('.config-panel').forEach(panel => {
    panel.classList.toggle('active', panel.id === `config-${module}`)
  })
  
  // Update control panels
  document.querySelectorAll('.controls-panel').forEach(panel => {
    panel.classList.toggle('active', panel.id === `controls-${module}`)
  })
  
  // Update legend panels
  document.querySelectorAll('.legend-panel').forEach(panel => {
    panel.classList.toggle('active', panel.id === `legend-${module}`)
  })
  
  // Update stats panels
  document.querySelectorAll('.stats-panel').forEach(panel => {
    panel.classList.toggle('active', panel.id === `stats-${module}`)
  })
  
  // Re-render if data exists
  if (module === 'module1' && state.data.module1) {
    updateModule1Visualizer()
  } else if (module === 'module2-1' && state.data.module2_1) {
    updateModule2_1Visualizer()
  }
}