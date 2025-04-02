import {
  selectedDestination,
  lastSelectedFeature,
} from '../core/varGlobals.js';
import { tutorialIsActive, currentStep } from '../core/varGlobals.js';
import {
  showTutorialStep,
  nextTutorialStep,
  endTutorial,
} from '../tutorial/tutorial.js';
import { closeCarouselModal } from '../ui/modals.js';
import { closeSideMenu } from '../ui/menu.js';
import { handleFeatureSelection } from '../ui/feature-selection.js';
import { startCarousel } from '../ui/carousel.js'; // Importa a função startCarousel
import { updateInterfaceLanguage } from '../i18n/language.js';
import { setLanguage } from './config.js';
import { hideAllControlButtons } from '../ui/buttons.js';
import { startRouteCreation } from '../route/route.js';

/**
 * 2. setupEventListeners - Configura os event listeners (já implementado em parte no DOMContentLoaded).
 */
export function setupEventListeners() {
  // Configura o evento de mudança de idioma com integração ao tutorial do assistente
  document.querySelectorAll('.lang-btn').forEach((button) => {
    button.addEventListener('click', () => {
      const lang = button.dataset.lang;

      // Define o idioma globalmente
      setLanguage(lang);
      updateInterfaceLanguage(lang);
      console.log(`Idioma alterado para: ${lang}`);
    });
  });

  // event listeners para os botões do tutorial

  // Configuração do botão de avançar do tutorial
  const tutorialStartBtn = document.getElementById('tutorial-iniciar-btn');
  if (tutorialStartBtn) {
    tutorialStartBtn.addEventListener('click', () => {
      try {
        console.log('Botão Iniciar Tutorial clicado');
        // Avança para o próximo passo
        nextTutorialStep();
      } catch (error) {
        console.error(
          'Erro ao processar clique no botão de iniciar tutorial:',
          error
        );
      }
    });
  }

  // Configuração do botão de finalizar o tutorial
  const tutorialEndBtn = document.getElementById('tutorial-finalizar-btn');
  if (tutorialEndBtn) {
    tutorialEndBtn.addEventListener('click', () => {
      try {
        console.log('Botão Finalizar Tutorial clicado');
        // Finaliza o tutorial
        endTutorial();
      } catch (error) {
        console.error(
          'Erro ao processar clique no botão de finalizar tutorial:',
          error
        );
      }
    });
  }

  // Configuração do botão de zoom in do mapa
  const zoomInBtn = document.querySelector('.menu-btn.zoom-in');
  if (zoomInBtn) {
    zoomInBtn.addEventListener('click', () => {
      // Verificamos se o mapa existe antes de chamar zoomIn
      if (window.map) {
        window.map.zoomIn(); // Aumenta o zoom do mapa
      } else {
        console.warn('Mapa não inicializado ao tentar usar zoomIn');
      }
      closeSideMenu(); // Fecha o menu lateral se estiver aberto

      // Se o tutorial estiver ativo e este for o passo atual, avança para o próximo
      if (
        tutorialIsActive &&
        allTutorialSteps[currentStep] &&
        allTutorialSteps[currentStep].step === 'zoom-in-button'
      ) {
        nextTutorialStep();
      }
    });
  }

  // Configuração do botão de zoom out do mapa
  const zoomOutBtn = document.querySelector('.menu-btn.zoom-out');
  if (zoomOutBtn) {
    zoomOutBtn.addEventListener('click', () => {
      // Verificamos se o mapa existe antes de chamar zoomOut
      if (window.map) {
        window.map.zoomOut(); // Reduz o zoom do mapa
      } else {
        console.warn('Mapa não inicializado ao tentar usar zoomOut');
      }
      closeSideMenu(); // Fecha o menu lateral se estiver aberto

      // Se o tutorial estiver ativo e este for o passo atual, avança para o próximo
      if (
        tutorialIsActive &&
        allTutorialSteps[currentStep] &&
        allTutorialSteps[currentStep].step === 'zoom-out-button'
      ) {
        nextTutorialStep();
      }
    });
  }

  // Configuração do botão de alternar o menu flutuante
  const menuToggle = document.getElementById('menu-toggle-btn'); // ID correto
  if (menuToggle) {
    menuToggle.addEventListener('click', () => {
      const menu = document.getElementById('menu');
      if (menu) {
        menu.classList.toggle('hidden');
      }

      showTutorialStep('ask-interest'); // Exibe o passo específico do tutorial (pergunta de interesses)

      // Se o tutorial estiver ativo e estiver no passo que requer interação com o menu toggle
      if (
        tutorialIsActive &&
        allTutorialSteps[currentStep] &&
        allTutorialSteps[currentStep].step === 'menu-toggle-btn'
      ) {
        nextTutorialStep();
      }
    });
  }

  // Configuração do botão de detalhes do menu
  const menuDetailsBtn = document.getElementById('menu-details-btn');
  if (menuDetailsBtn) {
    menuDetailsBtn.addEventListener('click', () => {
      console.log("✅ Botão 'menu-details-btn' clicado!");
      // Funções simplificadas para evitar erros
      console.log('Limpando marcadores de rota...');
      console.log('Escondendo banner de instruções...');
      showTutorialStep('ask-interest'); // Exibe o passo específico do tutorial (pergunta de interesses)
    });
  }

  // Configuração dos botões do menu flutuante com identificador de feature
  const floatingMenu = document.getElementById('floating-menu'); // Menu flutuante com opções principais
  if (floatingMenu) {
    // Evento para botões do menu flutuante
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

  const startCreateRouteBtn = document.getElementById('create-route-btn');
  if (startCreateRouteBtn) {
    startCreateRouteBtn.addEventListener('click', () => {
      startRouteCreation();
    });
  }

  // Configuração do botão "carousel-modal-close"
  const carouselModalCloseBtn = document.getElementById('carousel-modal-close');
  if (carouselModalCloseBtn) {
    carouselModalCloseBtn.addEventListener('click', () => {
      closeCarouselModal(); // Chama a função para fechar o modal do carrossel
      console.log('Modal do carrossel fechado.');
    });
  }

  // Configuração dos botões de controle com identificador de feature
  // Evento para botões de controle
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

  // Adiciona eventos de clique aos botões
  /*
document
  .getElementById('start-navigation-rodape-btn')
  .addEventListener('click', startNavigation);
document
  .getElementById('stop-navigation-rodape-btn')
  .addEventListener('click', endNavigation);
*/

  // Configuração do botão "about-more-btn"
  const aboutMoreBtn = document.getElementById('about-more-btn');
  if (aboutMoreBtn) {
    aboutMoreBtn.addEventListener('click', () => {
      if (selectedDestination && selectedDestination.name) {
        startCarousel(selectedDestination.name);
      } else {
        alert('Por favor, selecione um destino primeiro.');
      }
    });
  }

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
