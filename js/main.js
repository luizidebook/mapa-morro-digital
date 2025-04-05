// -------------------------
// main.js – Ponto de entrada principal da aplicação
// -------------------------

/**
 * Este arquivo contém as funções principais para inicialização da aplicação:
 *
 * initializeMap - Responsável por criar e configurar a instância do mapa Leaflet
 * initializeAssistant - Inicializa o assistente virtual da aplicação
 * loadResources - Carrega recursos necessários como textos, imagens e configurações
 * autoAdjustTheme - Ajusta o tema da interface (claro/escuro) com base nas preferências do usuário
 * showWelcomeMessage - Exibe a mensagem de boas-vindas e seleção de idioma inicial
 */

// Importações do módulo core/config.js
import { initializeMap } from './map/map.js';
import { setupEventListeners } from './core/event-listeners.js';
import { showWelcomeMessage } from './ui/modals.js';
import { autoAdjustTheme } from './ui/theme.js';
import { initializeWeatherWidgets } from './ui/widgets.js';
import { initializeAssistant } from './assistente/assistente.js'; // Importar inicializador do assistente

document.addEventListener('DOMContentLoaded', () => {
  onDOMContentLoaded();
});

export function onDOMContentLoaded() {
  console.log('Iniciando aplicação...');

  try {
    // Inicializar componentes principais
    initializeMap();
    showWelcomeMessage();
    setupEventListeners();
    autoAdjustTheme();

    // Inicializar widgets após configuração do mapa
    initializeWeatherWidgets();

    // Se o mapa foi inicializado, disparar evento
    if (window.map) {
      const mapInitializedEvent = new Event('mapInitialized');
      window.dispatchEvent(mapInitializedEvent);

      // Após a inicialização do mapa, configuramos o assistente
      // mas não mostramos ele automaticamente ainda
      window.addEventListener('mapInitialized', () => {
        // Inicializar o assistente com a instância do mapa
        const assistantAPI = initializeAssistant(window.map, {
          autoShow: false, // Não mostrar automaticamente
          enableVoice: true,
        });

        // Disponibilizar API globalmente
        window.assistantApi = assistantAPI;

        console.log('Assistente virtual registrado e pronto para uso!');
      });
    } else {
      // Se o mapa não foi inicializado por algum motivo, ainda inicializamos o assistente
      const assistantAPI = initializeAssistant(null, {
        autoShow: false,
        enableVoice: true,
      });

      window.assistantApi = assistantAPI;
    }
  } catch (error) {
    console.error('Erro ao inicializar aplicação:', error);
  }

  console.log('Aplicação inicializada com sucesso!');
}

export function registerServiceWorker() {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker
      .register('/service-worker.js')
      .then(() => console.log('Service Worker registrado com sucesso!'))
      .catch((error) =>
        console.error('Erro ao registrar o Service Worker:', error)
      );
  } else {
    console.warn('Service Workers não são suportados neste navegador.');
  }
}

// Outras funções do arquivo main.js...
