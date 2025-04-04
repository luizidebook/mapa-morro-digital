import { tutorialIsActive, currentStep } from '../core/varGlobals.js';
import { closeCarouselModal } from '../ui/modals.js';
import { closeSideMenu } from '../ui/menu.js';
import { handleFeatureSelection } from '../ui/feature-selection.js';
import { startCarousel } from '../ui/carousel.js';
import { setLanguage } from './config.js';
import { hideAllControlButtons } from '../ui/buttons.js';
import { startRouteCreation } from '../route/route.js';
import { showNotification } from '../ui/notifications.js';

// Função para restaurar o estado salvo no service worker
function restoreState(state) {
  console.log('Restaurando estado da aplicação:', state);
  // Implementar restauração de estado conforme necessário
}

// Função para atualizar a posição do usuário no mapa
function updateUserPositionOnMap(position) {
  if (!window.map) {
    console.warn(
      'Mapa não inicializado ao tentar atualizar posição do usuário'
    );
    return;
  }
  console.log('Atualizando posição do usuário no mapa:', position);
  // Implementar atualização da posição conforme necessário
}

/**
 * setupEventListeners - Configura todos os event listeners da aplicação.
 * Esta função é chamada após o carregamento do DOM.
 */
export function setupEventListeners() {
  console.log('Configurando event listeners da aplicação...');

  // CONFIGURAÇÃO DE BOTÕES DE IDIOMA
  document.querySelectorAll('.lang-btn').forEach((button) => {
    button.addEventListener('click', () => {
      const lang = button.dataset.lang;
      setLanguage(lang);
      console.log(`Idioma alterado para: ${lang}`);
    });
  });

  // CONFIGURAÇÃO DE BOTÕES DO TUTORIAL
  setupTutorialButtons();

  // CONFIGURAÇÃO DE BOTÕES DE MAPA E NAVEGAÇÃO
  setupMapButtons();

  // CONFIGURAÇÃO DE BOTÕES DE MENU
  setupMenuButtons();

  // CONFIGURAÇÃO DE SERVICE WORKER
  setupServiceWorker();

  // CONFIGURAÇÃO DO ASSISTENTE VIRTUAL
  setupAssistantEventListeners();

  console.log('Event listeners configurados com sucesso!');
}

/**
 * Configura os botões específicos do tutorial
 */
function setupTutorialButtons() {
  // Botão Iniciar Tutorial
  const tutorialStartBtn = document.getElementById('tutorial-iniciar-btn');
  if (tutorialStartBtn) {
    tutorialStartBtn.addEventListener('click', () => {
      try {
        console.log('Botão Iniciar Tutorial clicado');
        nextTutorialStep();
      } catch (error) {
        console.error(
          'Erro ao processar clique no botão de iniciar tutorial:',
          error
        );
      }
    });
  }

  // Botão Finalizar Tutorial
  const tutorialEndBtn = document.getElementById('tutorial-finalizar-btn');
  if (tutorialEndBtn) {
    tutorialEndBtn.addEventListener('click', () => {
      try {
        console.log('Botão Finalizar Tutorial clicado');
        endTutorial();
      } catch (error) {
        console.error(
          'Erro ao processar clique no botão de finalizar tutorial:',
          error
        );
      }
    });
  }
}

/**
 * Configura os botões relacionados ao mapa e navegação
 */
function setupMapButtons() {
  // Botão de Zoom In
  const zoomInBtn = document.querySelector('.menu-btn.zoom-in');
  if (zoomInBtn) {
    zoomInBtn.addEventListener('click', () => {
      if (window.map) {
        window.map.zoomIn();
      } else {
        console.warn('Mapa não inicializado ao tentar usar zoomIn');
      }
      closeSideMenu();

      if (
        tutorialIsActive &&
        allTutorialSteps[currentStep] &&
        allTutorialSteps[currentStep].step === 'zoom-in-button'
      ) {
        nextTutorialStep();
      }
    });
  }

  // Botão de Zoom Out
  const zoomOutBtn = document.querySelector('.menu-btn.zoom-out');
  if (zoomOutBtn) {
    zoomOutBtn.addEventListener('click', () => {
      if (window.map) {
        window.map.zoomOut();
      } else {
        console.warn('Mapa não inicializado ao tentar usar zoomOut');
      }
      closeSideMenu();

      if (
        tutorialIsActive &&
        allTutorialSteps[currentStep] &&
        allTutorialSteps[currentStep].step === 'zoom-out-button'
      ) {
        nextTutorialStep();
      }
    });
  }

  // Botão Criar Rota
  const startCreateRouteBtn = document.getElementById('create-route-btn');
  if (startCreateRouteBtn) {
    startCreateRouteBtn.addEventListener('click', () => {
      startRouteCreation();
    });
  }
}

/**
 * Configura os botões relacionados aos menus
 */
function setupMenuButtons() {
  // Botão Toggle Menu
  const menuToggle = document.getElementById('menu-toggle-btn');
  if (menuToggle) {
    menuToggle.addEventListener('click', () => {
      const menu = document.getElementById('menu');
      if (menu) {
        menu.classList.toggle('hidden');
      }

      showTutorialStep('ask-interest');

      if (
        tutorialIsActive &&
        allTutorialSteps[currentStep] &&
        allTutorialSteps[currentStep].step === 'menu-toggle-btn'
      ) {
        nextTutorialStep();
      }
    });
  }

  // Botão Details
  const menuDetailsBtn = document.getElementById('menu-details-btn');
  if (menuDetailsBtn) {
    menuDetailsBtn.addEventListener('click', () => {
      console.log("✅ Botão 'menu-details-btn' clicado!");
      console.log('Limpando marcadores de rota...');
      console.log('Escondendo banner de instruções...');
      showTutorialStep('ask-interest');
    });
  }

  // Configuração do botão "about-more-btn"
  const aboutMoreBtn = document.getElementById('about-more-btn');
  if (aboutMoreBtn) {
    aboutMoreBtn.addEventListener('click', () => {
      if (window.selectedDestination && window.selectedDestination.name) {
        startCarousel(window.selectedDestination.name);
      } else {
        showNotification(
          'Por favor, selecione um destino primeiro.',
          'warning'
        );
      }
    });
  }

  // Botões do menu flutuante
  const floatingMenu = document.getElementById('floating-menu');
  if (floatingMenu) {
    document.querySelectorAll('.menu-btn[data-feature]').forEach((btn) => {
      btn.addEventListener('click', (event) => {
        const feature = btn.getAttribute('data-feature');
        console.log(`Feature selecionada: ${feature}`);
        handleFeatureSelection(feature);
        closeCarouselModal();
        event.stopPropagation();
      });
    });
  }

  // Botões de controle com identificador de feature
  document.querySelectorAll('.control-btn[data-feature]').forEach((btn) => {
    btn.addEventListener('click', (event) => {
      const feature = btn.getAttribute('data-feature');
      console.log(`Control button feature selected: ${feature}`);
      handleFeatureSelection(feature);
      event.stopPropagation();
      hideAllControlButtons();
      if (tutorialIsActive && tutorialSteps[currentStep].step === feature) {
        nextTutorialStep();
      }
    });
  });

  // Botão de fechar modal do carrossel
  const carouselModalCloseBtn = document.getElementById('carousel-modal-close');
  if (carouselModalCloseBtn) {
    carouselModalCloseBtn.addEventListener('click', () => {
      closeCarouselModal();
      console.log('Modal do carrossel fechado.');
    });
  }
}

/**
 * Configura o Service Worker
 */
function setupServiceWorker() {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker
      .register('/service-worker.js')
      .then((registration) => {
        console.log('Service Worker registrado com sucesso:', registration);
      })
      .catch((error) => {
        console.error('Erro ao registrar o Service Worker:', error);
      });

    // Recuperar o estado ao carregar a página
    navigator.serviceWorker.ready.then(() => {
      if (navigator.serviceWorker.controller) {
        navigator.serviceWorker.controller.postMessage({
          action: 'getState',
        });
      }
    });

    // Ouvir mensagens do Service Worker
    navigator.serviceWorker.onmessage = (event) => {
      const { action, payload } = event.data;

      if (action === 'stateRestored') {
        restoreState(payload);
      } else if (action === 'positionUpdate') {
        updateUserPositionOnMap(payload);
      }
    };
  }
}

/**
 * Configura os event listeners do assistente virtual
 */
function setupAssistantEventListeners() {
  // Verificar se o DOM contém os elementos necessários
  const assistantToggle = document.getElementById('assistant-toggle');
  if (!assistantToggle) {
    console.warn('Elemento assistant-toggle não encontrado');
    return;
  }

  // CORRIGIDO: Verificar se a API do assistente está disponível
  if (!window.assistantApi) {
    console.warn(
      'API do assistente não disponível. Aguardando inicialização...'
    );

    // Escutar o evento personalizado para quando o assistente estiver pronto
    document.addEventListener(
      'assistantReady',
      () => {
        console.log(
          'Evento assistantReady recebido, configurando event listeners do assistente'
        );
        setupAssistantEventListenersInternal();
      },
      { once: true }
    ); // Use {once: true} para garantir que o handler seja executado apenas uma vez

    // Manter o retry como fallback
    const checkAssistantInterval = setInterval(() => {
      if (window.assistantApi) {
        console.log(
          'API do assistente detectada via polling, configurando event listeners'
        );
        clearInterval(checkAssistantInterval);
        setupAssistantEventListenersInternal();
      }
    }, 2000); // Aumentado para 2 segundos para reduzir sobrecarga

    // Definir um timeout maior
    setTimeout(() => {
      if (!window.assistantApi) {
        clearInterval(checkAssistantInterval);
        console.error(
          'Timeout: API do assistente não foi inicializada após 20 segundos'
        );
      }
    }, 20000);

    return;
  }

  setupAssistantEventListenersInternal();
}

/**
 * Configura os event listeners internos do assistente após a API estar disponível
 */
function setupAssistantEventListenersInternal() {
  const assistantDialog = document.getElementById('assistant-dialog');
  const headerContainer = document.getElementById('assistant-header-container');
  const inputContainer = document.getElementById('assistant-input-container');
  const closeAssistantDialog = document.getElementById(
    'close-assistant-dialog'
  );
  const assistantSendBtn = document.getElementById('assistant-send-btn');
  const assistantVoiceBtn = document.getElementById('assistant-voice-btn');
  const assistantInputField = document.getElementById('assistant-input-field');
  const assistantToggle = document.getElementById('assistant-toggle');

  // Botão toggle para abrir/fechar o diálogo
  assistantToggle.addEventListener('click', () => {
    console.log('Botão do assistente clicado');

    if (assistantDialog) {
      if (assistantDialog.classList.contains('hidden')) {
        // Abrir assistente
        assistantDialog.classList.remove('hidden');
        if (headerContainer) headerContainer.classList.add('visible');
        if (inputContainer) inputContainer.classList.add('visible');

        // Notificar API do assistente que foi aberto
        if (typeof window.assistantApi.notifyOpened === 'function') {
          window.assistantApi.notifyOpened();
        }
      } else {
        // Fechar assistente
        assistantDialog.classList.add('hidden');
        if (headerContainer) headerContainer.classList.remove('visible');
        if (inputContainer) inputContainer.classList.remove('visible');
      }
    }
  });

  // Botão de fechar o assistente
  if (closeAssistantDialog) {
    closeAssistantDialog.addEventListener('click', () => {
      console.log('Botão fechar assistente clicado');
      if (assistantDialog) {
        assistantDialog.classList.add('hidden');
      }
      if (headerContainer) headerContainer.classList.remove('visible');
      if (inputContainer) inputContainer.classList.remove('visible');
    });
  }

  // Botão de envio de mensagem
  if (assistantSendBtn && assistantInputField) {
    assistantSendBtn.addEventListener('click', () => {
      const message = assistantInputField.value.trim();
      if (message) {
        if (typeof window.assistantApi.sendMessage === 'function') {
          window.assistantApi.sendMessage(message);
          assistantInputField.value = '';
        }
      }
    });
  }

  // Tecla Enter para enviar mensagem
  if (assistantInputField) {
    assistantInputField.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        const message = assistantInputField.value.trim();
        if (message && typeof window.assistantApi.sendMessage === 'function') {
          window.assistantApi.sendMessage(message);
          assistantInputField.value = '';
        }
      }
    });
  }

  // Botão de entrada de voz
  if (assistantVoiceBtn) {
    assistantVoiceBtn.addEventListener('click', () => {
      if (typeof window.assistantApi.startVoiceInput === 'function') {
        window.assistantApi.startVoiceInput();
      }
    });
  }

  // ADICIONADO: Marcar que os listeners foram configurados
  window.assistantListenersConfigured = true;

  console.log('Event listeners do assistente configurados com sucesso');
}
