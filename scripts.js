// Importações do módulo core/config.js
import { initializeMap } from './js/map/map-core.js';
import { setupEventListeners } from './js/core/event-listeners.js';
import { autoAdjustTheme } from './js/ui/theme.js';
import { showWelcomeMessage } from './js/core/config.js';

// 1. onDOMContentLoaded       - Executado quando o DOM carrega (busca parâmetros iniciais)*/
document.addEventListener('DOMContentLoaded', () => {
  try {
    console.log('Iniciando a aplicação...');
    initializeMap(); // Inicializa o mapa
    setupEventListeners(); // Configura os event listeners
    autoAdjustTheme(); // Ajusta o tema automaticamente
    showWelcomeMessage(); // Exibe a mensagem de boas-vindas
    console.log('DOM completamente carregado e analisado.');
  } catch (error) {
    console.error('Erro ao inicializar a aplicação:', error);
  }
});
