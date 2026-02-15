/**
 * Castle Run Web Client - Main Entry Point
 */

import { initModuleSwitcher } from './ui/module-switcher.js'
import { initBiomeManager } from './ui/biome-manager.js'
import { initFileIO } from './ui/file-io.js'
import { initModule1Controls } from './modules/module1.js'
import { initModule2_1Controls } from './modules/module2-1.js'
import { initModule2_2Controls } from './modules/module2-2.js'

initModuleSwitcher()
initBiomeManager()
initFileIO()
initModule1Controls()
initModule2_1Controls()
initModule2_2Controls()

console.log('🏰 Castle Run Web Client loaded!')