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
import { initializeAssistant } from './assistente/index.js';

document.addEventListener('DOMContentLoaded', () => {
  onDOMContentLoaded();
});

export function onDOMContentLoaded() {
  console.log('Iniciando aplicação...');

  try {
    // Ocultar explicitamente o widget de clima e o botão do assistente no início
    const weatherWidget = document.getElementById('weather-widget');
    const assistantContainer = document.getElementById('digital-assistant');

    if (weatherWidget) {
      weatherWidget.style.display = 'none';
      weatherWidget.classList.add('hidden');
    }

    if (assistantContainer) {
      assistantContainer.style.display = 'none';
      assistantContainer.classList.add('hidden');
    }

    // Primeiro inicializar o mapa
    initializeMap();

    // Depois configurar tema
    autoAdjustTheme();

    // Inicializar componentes relacionados ao clima, mas mantê-los ocultos
    initializeWeatherWidgets();

    // Inicializar assistente com opções - ele ficará oculto no início
    try {
      const assistantAPI = initializeAssistant(window.map, {
        autoShow: false,
        enableVoice: true,
        rememberHistory: true,
      });

      window.assistantApi = assistantAPI;
      console.log('Assistente virtual inicializado com sucesso');
    } catch (assistantError) {
      console.error('Erro ao inicializar assistente virtual:', assistantError);
      // Criar API vazia para evitar erros cascata
      window.assistantApi = {
        showAssistant: () => false,
        hideAssistant: () => false,
        sendMessage: () => false,
        isActive: () => false,
        getState: () => ({}),
        notifyOpened: () => false,
        startVoiceInput: () => false,
      };
    }

    // Registrar Service Worker
    registerServiceWorker();

    // Por último, mostrar a mensagem de boas-vindas
    // Os widgets e o assistente serão mostrados após o usuário selecionar o idioma
    showWelcomeMessage();

    // Configurar event listeners
    setupEventListeners();

    console.log('Aplicação inicializada com sucesso!');
  } catch (error) {
    console.error('Erro ao inicializar aplicação:', error);
  }
}

/**
 * Registra o Service Worker para funcionalidades offline
 */
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
