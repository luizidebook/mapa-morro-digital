// Importações do módulo core/config.js
import { initializeMap, showWelcomeMessage } from './js/map/map-core.js';
import { autoAdjustTheme } from './js/ui/theme.js';
import { setupEventListeners } from './js/core/event-listeners.js';

// 1. onDOMContentLoaded       - Executado quando o DOM carrega (busca parâmetros iniciais)*/
document.addEventListener('DOMContentLoaded', () => {
  try {
    console.log('Iniciando a aplicação...');
    initializeMap();
    setupEventListeners();
    autoAdjustTheme();
    showWelcomeMessage();
    console.log('DOM completamente carregado e analisado.');
  } catch (error) {
    console.error('Erro ao inicializar a aplicação:', error);
  }
});
