// Importações do módulo core/config.js
import { initializeMap } from './map/map-core.js';
import { showWelcomeMessage } from './core/config.js';
import { setupEventListeners } from './core/event-listeners.js';
import { autoAdjustTheme } from './ui/theme.js';
// 1. onDOMContentLoaded       - Executado quando o DOM carrega (busca parâmetros iniciais)*/
document.addEventListener('DOMContentLoaded', () => {
  try {
    console.log('Iniciando a aplicação...');

    console.log('Inicializando o mapa...');
    initializeMap(); // Inicializa o mapa
    console.log('Mapa inicializado com sucesso.');

    console.log('Exibindo a mensagem de boas-vindas...');
    showWelcomeMessage(); // Exibe a mensagem de boas-vindas
    console.log('Mensagem de boas-vindas exibida.');

    console.log('Configurando os event listeners...');
    setupEventListeners(); // Configura os event listeners
    console.log('Event listeners configurados.');

    console.log('Ajustando o tema...');
    autoAdjustTheme(); // Ajusta o tema automaticamente
    console.log('Tema ajustado com sucesso.');

    console.log('DOM completamente carregado e analisado.');
  } catch (error) {
    console.error('Erro ao inicializar a aplicação:', error);
  }
});
