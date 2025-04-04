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
import { showWelcomeMessage } from './ui/modals.js';
import { autoAdjustTheme } from './ui/theme.js';
import { initializeWeatherWidgets } from './ui/widgets.js';

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

    // Inicializar assistente com opções
    try {
      console.log('Inicializando assistente virtual com o mapa...');

      // Usar importação com caminho relativo correto
      import('./assistente/assistente.js')
        .then((module) => {
          if (!module || !module.initializeAssistant) {
            throw new Error(
              'Módulo do assistente carregado, mas função initializeAssistant não encontrada'
            );
          }

          const assistantAPI = module.initializeAssistant(window.map, {
            autoShow: false,
            enableVoice: true,
            firstTimeMessage:
              'Olá, seja bem vindo a Morro Digital! É a sua primeira visita a Morro de São Paulo?',
          });

          window.assistantApi = assistantAPI;
          console.log(
            'Assistente virtual inicializado com sucesso:',
            window.assistantApi
          );

          // MODIFICADO: Configurar event listeners DEPOIS da inicialização do assistente
          import('./core/event-listeners.js').then((module) => {
            if (typeof module.setupEventListeners === 'function') {
              module.setupEventListeners();
              console.log(
                'Event listeners configurados após inicialização do assistente'
              );
            }
          });

          // Verificar se o assistente foi integrado corretamente
          setTimeout(() => {
            if (
              window.assistantApi &&
              typeof window.assistantApi.getState === 'function'
            ) {
              const state = window.assistantApi.getState();
              console.log('Estado do assistente após inicialização:', state);

              // CORRIGIDO: Forçar o estado de inicialização
              if (!state.initialized) {
                console.warn('Forçando inicialização do assistente...');
                if (
                  window.assistantApi.initialize &&
                  typeof window.assistantApi.initialize === 'function'
                ) {
                  window.assistantApi.initialize();
                }
              }
            } else {
              console.warn(
                'API do assistente não está completamente disponível'
              );
            }
          }, 1000);
        })
        .catch((error) => {
          console.error('Erro ao importar módulo do assistente:', error);

          // SOLUÇÃO 2: Tentar caminho alternativo se o primeiro falhar
          console.log(
            'Tentando caminho alternativo para o módulo do assistente...'
          );

          // Tentar com caminho absoluto
          import('/js/assistente/assistente.js')
            .then((module) => {
              const assistantAPI = module.initializeAssistant(window.map, {
                autoShow: false,
                enableVoice: true,
                firstTimeMessage:
                  'Olá, seja bem vindo a Morro Digital! É a sua primeira visita a Morro de São Paulo?',
              });

              window.assistantApi = assistantAPI;
              console.log(
                'Assistente virtual inicializado com sucesso (caminho alternativo)'
              );
            })
            .catch((alternativeError) => {
              console.error(
                'Falha também no caminho alternativo:',
                alternativeError
              );

              // SOLUÇÃO 3: Usar fallback para criar uma versão básica do assistente
              console.warn('Criando versão fallback do assistente...');
              window.assistantApi = createAssistantFallback();
            });
        });
    } catch (assistantError) {
      console.error('Erro ao inicializar assistente virtual:', assistantError);
    }

    // Registrar Service Worker
    registerServiceWorker();

    // Por último, mostrar a mensagem de boas-vindas
    // Os widgets e o assistente serão mostrados após o usuário selecionar o idioma
    showWelcomeMessage();

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

/**
 * Cria uma versão de fallback do assistente quando o módulo principal falha ao carregar
 * @returns {Object} API básica do assistente
 */
function createAssistantFallback() {
  console.warn(
    'Usando versão de fallback do assistente - funcionalidade limitada'
  );

  // Criar e adicionar o botão do assistente ao DOM se não existir
  let assistantContainer = document.getElementById('digital-assistant');

  if (!assistantContainer) {
    assistantContainer = document.createElement('div');
    assistantContainer.id = 'digital-assistant';
    assistantContainer.className = 'assistant-container hidden';

    // Estrutura básica do assistente
    assistantContainer.innerHTML = `
      <div id="assistant-toggle" class="assistant-toggle">
        <i class="fas fa-robot"></i>
      </div>
      <div id="assistant-dialog" class="assistant-dialog hidden">
        <div class="assistant-header">
          <h3>Assistente Virtual</h3>
          <button id="close-assistant-dialog" class="close-button">×</button>
        </div>
        <div id="assistant-messages" class="assistant-messages"></div>
        <div class="assistant-input">
          <input type="text" id="assistant-input-field" placeholder="Digite sua mensagem...">
          <button id="assistant-send-btn"><i class="fas fa-paper-plane"></i></button>
          <button id="assistant-voice-btn"><i class="fas fa-microphone"></i></button>
        </div>
      </div>
    `;

    document.body.appendChild(assistantContainer);
  }

  // Implementar versão básica do assistente
  return {
    showAssistant: function () {
      if (assistantContainer) {
        assistantContainer.style.display = '';
        assistantContainer.classList.remove('hidden');
      }
      return true;
    },
    hideAssistant: function () {
      if (assistantContainer) {
        assistantContainer.style.display = 'none';
        assistantContainer.classList.add('hidden');
      }
      return true;
    },
    sendMessage: function (message) {
      console.log('Mensagem enviada para assistente fallback:', message);
      alert(
        'O assistente está em modo limitado. Por favor, recarregue a página.'
      );
      return true;
    },
    isActive: function () {
      return false;
    },
    getState: function () {
      return { initialized: true, isActive: false, isVisible: false };
    },
    notifyOpened: function () {
      alert(
        'O assistente está em modo limitado devido a um erro de carregamento.'
      );
      return true;
    },
    startVoiceInput: function () {
      alert('Reconhecimento de voz não disponível no modo limitado.');
      return false;
    },
    showWithAnimation: function () {
      this.showAssistant();
      return true;
    },
    clearHistory: function () {
      return true;
    },
    initialize: function () {
      console.log('Assistente fallback inicializado');
      return true;
    },
  };
}
