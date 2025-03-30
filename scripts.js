// Importações do módulo core/config.js
import { initializeMap, showWelcomeMessage } from './js/map/map-core.js';
import { addRotatedMarker } from './js/map/map-core.js';
import { autoAdjustTheme } from './ui/theme.js';
import { setupEventListeners } from './core/event-listeners.js';

// 1. onDOMContentLoaded       - Executado quando o DOM carrega (busca parâmetros iniciais)*/
document.addEventListener('DOMContentLoaded', () => {
  try {
    console.log('Iniciando a aplicação...');
    initializeMap();

    // Adiciona um marcador rotacionado
    addRotatedMarker(-13.378, -38.918, 45); // Latitude, Longitude, Ângulo de rotação

    showWelcomeMessage();
    setupEventListeners();
    autoAdjustTheme();
    console.log('DOM completamente carregado e analisado.');
  } catch (error) {
    console.error('Erro durante a inicialização:', error);
  }
});
