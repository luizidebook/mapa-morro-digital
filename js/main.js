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

document.addEventListener('DOMContentLoaded', async () => {
  try {
    // 1. Inicializar mapa primeiro e aguardar conclusão
    await initializeMap();
    console.log('Mapa inicializado com sucesso');

    // 2. Mostrar mensagem de boas-vindas e obter idioma
    const userLanguage = await showWelcomeMessage();

    // 3. Configurar listeners de eventos básicos
    setupEventListeners();
    autoAdjustTheme();

    // 4. Inicializar widgets após mapa carregado
    initializeWeatherWidgets();

    // 5. Garantir que o DOM está completamente carregado antes de inicializar o assistente
    setTimeout(() => {
      // Inicializar assistente como componente central
      const assistantOptions = {
        language: userLanguage,
        autoShow: true,
        enableVoice: true,
        proactiveMode: true,
        followUser: true,
      };

      // Verificar se o evento mapInitialized já foi disparado
      if (window.mapInitialized) {
        initializeAssistantWithOptions(assistantOptions);
      } else {
        // Caso contrário, aguardar o evento
        window.addEventListener('mapInitialized', () => {
          initializeAssistantWithOptions(assistantOptions);
        });
      }
    }, 1000); // Aguardar 1 segundo para garantir que o DOM esteja pronto

    // 6. Registrar service worker para suporte offline
    registerServiceWorker();
  } catch (error) {
    console.error('Erro na inicialização:', error);
    showErrorMessage(
      'Não foi possível inicializar a aplicação. Tente novamente.'
    );
  }
});

// Função auxiliar para inicializar o assistente com as opções
function initializeAssistantWithOptions(options) {
  console.log('Inicializando assistente com opções:', options);
  try {
    // Verificar se o mapa está disponível
    if (!window.map) {
      throw new Error('Mapa não disponível para inicialização do assistente');
    }

    // Verificar se os elementos necessários existem no DOM
    ensureAssistantElementsExist();

    // Inicializar o assistente com acesso ao mapa e opções
    const assistantAPI = initializeAssistant(window.map, options);

    if (!assistantAPI) {
      throw new Error('Falha ao inicializar a API do assistente');
    }

    // Disponibilizar API globalmente para outros componentes
    window.assistantApi = assistantAPI;

    // Notificar que o assistente está pronto
    window.dispatchEvent(new CustomEvent('assistantReady'));

    // Adicionar elemento de debug para dispositivos móveis
    addDebugElement();

    console.log('Assistente inicializado com sucesso');
    return true;
  } catch (error) {
    console.error('Erro ao inicializar assistente:', error);

    // Adicionar feedback visual do erro
    const errorMessage = document.createElement('div');
    errorMessage.className = 'assistant-error';
    errorMessage.textContent = `Erro ao inicializar assistente: ${error.message}`;
    document.body.appendChild(errorMessage);

    setTimeout(() => {
      if (errorMessage.parentNode) {
        errorMessage.parentNode.removeChild(errorMessage);
      }
    }, 5000);

    return false;
  }
}

// Função para adicionar elemento de debugging
function addDebugElement() {
  if (
    window.location.hostname === 'localhost' ||
    window.location.hostname === '127.0.0.1'
  ) {
    const debugElement = document.createElement('div');
    debugElement.id = 'debug-log';
    debugElement.className = 'debug-log';
    debugElement.style.cssText =
      'position: fixed; bottom: 10px; left: 10px; width: 300px; max-height: 200px; overflow-y: auto; background: rgba(0,0,0,0.7); color: white; font-size: 12px; padding: 10px; border-radius: 5px; z-index: 9999; display: none;';

    const toggleButton = document.createElement('button');
    toggleButton.textContent = 'Debug';
    toggleButton.style.cssText =
      'position: fixed; bottom: 10px; left: 10px; z-index: 10000; padding: 5px; font-size: 12px;';
    toggleButton.addEventListener('click', () => {
      debugElement.style.display =
        debugElement.style.display === 'none' ? 'block' : 'none';
    });

    document.body.appendChild(debugElement);
    document.body.appendChild(toggleButton);
  }
}

// Função para garantir que os elementos do assistente existam no DOM
function ensureAssistantElementsExist() {
  // Verificar e criar container do assistente se não existir
  if (!document.querySelector('#digital-assistant, .digital-assistant')) {
    console.log('Criando elementos do assistente no DOM...');

    const assistantContainer = document.createElement('div');
    assistantContainer.id = 'digital-assistant';
    assistantContainer.className = 'digital-assistant assistant-container';

    // Estrutura adaptada para mobile
    assistantContainer.innerHTML = `
      <div id="assistant-toggle" class="assistant-icon">
        <i class="fas fa-robot"></i>
      </div>
      <div id="assistant-dialog" class="assistant-panel">
        <div class="assistant-header">
          <h3>Assistente Morro Digital</h3>
          <div class="assistant-controls">
            <button id="assistant-minimize-btn" class="assistant-btn"><i class="fas fa-minus"></i></button>
            <button id="close-assistant-dialog" class="assistant-btn"><i class="fas fa-times"></i></button>
          </div>
        </div>
        <div id="assistant-messages" class="assistant-messages">
          <ul class="messages-list"></ul>
        </div>
        <div class="assistant-input">
          <input id="assistant-input-field" type="text" placeholder="Pergunte algo sobre Morro de São Paulo..." />
          <div class="assistant-buttons">
            <button id="assistant-send-btn" class="assistant-btn send-btn">
              <i class="fas fa-paper-plane"></i>
            </button>
            <button id="assistant-voice-btn" class="assistant-btn voice-btn">
              <i class="fas fa-microphone"></i>
            </button>
          </div>
        </div>
      </div>
    `;

    document.body.appendChild(assistantContainer);

    // Adicionar listeners para botões de controle
    setupAssistantControls();

    console.log('Elementos do assistente criados com sucesso');
  }
}

// Função para configurar controles do assistente
function setupAssistantControls() {
  // Botão para fechar o painel do assistente
  const closeBtn = document.getElementById('close-assistant-dialog');
  if (closeBtn) {
    closeBtn.addEventListener('click', () => {
      const dialog = document.getElementById('assistant-dialog');
      if (dialog) dialog.classList.add('hidden');

      // Notificar o assistente sobre o fechamento
      if (
        window.assistantApi &&
        typeof window.assistantApi.hide === 'function'
      ) {
        window.assistantApi.hide();
      }
    });
  }

  // Botão para minimizar o assistente
  const minimizeBtn = document.getElementById('assistant-minimize-btn');
  if (minimizeBtn) {
    minimizeBtn.addEventListener('click', () => {
      const dialog = document.getElementById('assistant-dialog');
      if (dialog) dialog.classList.add('minimized');
    });
  }

  // Botão para abrir o assistente
  const toggleBtn = document.getElementById('assistant-toggle');
  if (toggleBtn) {
    toggleBtn.addEventListener('click', () => {
      const dialog = document.getElementById('assistant-dialog');
      if (dialog) {
        dialog.classList.remove('hidden');
        dialog.classList.remove('minimized');
      }

      // Notificar o assistente sobre a abertura
      if (
        window.assistantApi &&
        typeof window.assistantApi.show === 'function'
      ) {
        window.assistantApi.show();
      }
    });
  }

  // Botão para enviar mensagem
  const sendBtn = document.getElementById('assistant-send-btn');
  const inputField = document.getElementById('assistant-input-field');

  if (sendBtn && inputField) {
    sendBtn.addEventListener('click', () => {
      const message = inputField.value.trim();
      if (message && window.assistantApi) {
        window.assistantApi.processMessage(message);
        inputField.value = '';
      }
    });

    // Permitir envio com Enter
    inputField.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        const message = inputField.value.trim();
        if (message && window.assistantApi) {
          window.assistantApi.processMessage(message);
          inputField.value = '';
        }
      }
    });
  }

  // Botão para reconhecimento de voz
  const voiceBtn = document.getElementById('assistant-voice-btn');
  if (voiceBtn) {
    voiceBtn.addEventListener('click', () => {
      if (
        window.assistantApi &&
        typeof window.assistantApi.toggle === 'function'
      ) {
        window.assistantApi.toggle();
      }
    });
  }
}

// Função de registro do service worker
export function registerServiceWorker() {
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker
        .register('/service-worker.js')
        .then((registration) => {
          console.log(
            'Service Worker registrado com sucesso:',
            registration.scope
          );
        })
        .catch((error) => {
          console.error('Erro ao registrar Service Worker:', error);
        });
    });
  } else {
    console.warn('Service Worker não suportado neste navegador.');
  }
}

// Outras funções do arquivo main.js...
