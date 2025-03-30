// Importações do módulo core/config.js
import { initializeMap, showWelcomeMessage } from './map/map-core.js';
import { autoAdjustTheme } from './ui/theme.js';
import { setupEventListeners } from './core/event-listeners.js';

// 1. onDOMContentLoaded       - Executado quando o DOM carrega (busca parâmetros iniciais)*/
document.addEventListener('DOMContentLoaded', () => {
  try {
    initializeMap();
    showWelcomeMessage();
    setupEventListeners();
    autoAdjustTheme();
    console.log('DOM completamente carregado e analisado.');
  } catch (error) {
    console.error('Erro durante a inicialização:', error);
  }
});
