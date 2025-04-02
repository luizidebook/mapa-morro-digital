import { setLanguage } from '../core/config.js';
import { selectedDestination } from '../data/cache.js';
import { tutorialIsActive, currentStep } from '../core/varGlobals.js';
import {
  showTutorialStep,
  nextTutorialStep,
  endTutorial,
  startTutorial,
} from '../tutorial/tutorial.js';
import { closeCarouselModal } from '../ui/modals.js';
import { closeSideMenu } from '../ui/menu.js';
import { handleFeatureSelection } from '../ui/feature-selection.js';
import { hideAllControlButtons } from '../ui/buttons.js';
import { startCarousel } from '../ui/carousel.js'; // Importa a função startCarousel
import { getSelectedDestination } from '../data/cache.js'; // Importa a função getSelectedDestination
import { startRouteCreation } from '../route/managerRoute.js';
/**
 * 2. setupEventListeners - Configura os event listeners (já implementado em parte no DOMContentLoaded).
 */
export function setupEventListeners() {
  document.querySelectorAll('.lang-btn').forEach((button) => {
    button.addEventListener('click', () => {
      try {
        const lang = button.dataset.lang;
        setLanguage(lang); // Define o idioma
        startTutorial(lang); //
        console.log(`Idioma definido para: ${lang}`);
      } catch (error) {
        console.error('Erro ao processar seleção de idioma:', error);
      }
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

  const startCreateRouteBtn = document.getElementById('create-route-btn');
  if (startCreateRouteBtn) {
    startCreateRouteBtn.addEventListener('click', () => {
      startRouteCreation();
      hideAllControlButtons();
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

  // Configuração do botão "carousel-modal-close"
  const carouselModalCloseBtn = document.getElementById('carousel-modal-close');
  if (carouselModalCloseBtn) {
    carouselModalCloseBtn.addEventListener('click', () => {
      closeCarouselModal(); // Chama a função para fechar o modal do carrossel
      console.log('Modal do carrossel fechado.');
    });
  }

  // Configuração dos botões de controle com identificador de feature
  document.querySelectorAll('.control-btn[data-feature]').forEach((btn) => {
    btn.addEventListener('click', (event) => {
      const feature = btn.getAttribute('data-feature'); // Obtém o identificador da feature
      console.log(`Control button feature selected: ${feature}`);
      handleFeatureSelection(feature); // Manipula a seleção da feature
      event.stopPropagation(); // Impede propagação do evento
      hideAllControlButtons(); // Esconde todos os botões de controle

      // Se o tutorial estiver ativo e este for o passo ask-interest, avança para o próximo
      if (
        tutorialIsActive &&
        allTutorialSteps[currentStep] &&
        allTutorialSteps[currentStep].step === 'ask-interest'
      ) {
        nextTutorialStep();
      }
    });
  });
}

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
  aboutMoreBtn.addEventListener('click', async () => {
    try {
      // Verifica se o destino já está definido
      if (!selectedDestination || !selectedDestination.name) {
        console.log('Tentando recuperar destino do localStorage...');
        const destination = await getSelectedDestination();
        if (destination && destination.name) {
          console.log('Destino recuperado para o carrossel:', destination.name);
          startCarousel(destination.name);
          return;
        }
      } else {
        // Se o destino já está definido, inicia o carrossel
        startCarousel(selectedDestination.name);
        return;
      }

      // Exibe o alerta apenas se o destino não foi encontrado
      alert('Por favor, selecione um destino primeiro.');
    } catch (error) {
      console.error('Erro ao recuperar destino para o carrossel:', error);
      alert('Por favor, selecione um destino primeiro.');
    }
  });
}

/**
 * 3. handleUserIdleState - Detecta inatividade e oferece ação.
 */
export function handleUserIdleState(lastLocation, currentLocation) {
  const movedDistance = calculateDistance(
    lastLocation.latitude,
    lastLocation.longitude,
    currentLocation.latitude,
    currentLocation.longitude
  );
  if (movedDistance < 5) {
    showNotification('Você está inativo. Deseja recalcular a rota?', 'info');
    console.log('handleUserIdleState: Usuário inativo detectado.');
  }
}
