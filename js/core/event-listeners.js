import {
  tutorialIsActive,
  tutorialSteps,
  currentStep,
  selectedDestination,
} from './state.js';
import {
  nextTutorialStep,
  showTutorialStep,
  startTutorial,
} from '../tutorial/tutorial.js';
import { setLanguage, updateInterfaceLanguage } from '../core/config.js';

// Função: Executada quando o DOM é carregado
export function onDOMContentLoaded() {
  try {
    initializeMap();
  } catch (error) {
    console.error('Erro ao inicializar o mapa:', error);
    showNotification('Erro ao carregar o mapa. Tente novamente.', 'error');
  }

  try {
    loadResources();
  } catch (error) {
    console.error('Erro ao carregar recursos:', error);
    showNotification('Erro ao carregar recursos. Tente novamente.', 'error');
  }

  try {
    setupEventListeners();
  } catch (error) {
    console.error('Erro ao configurar eventos:', error);
    showNotification('Erro ao configurar eventos. Tente novamente.', 'error');
  }

  try {
    autoAdjustTheme();
  } catch (error) {
    console.error('Erro ao ajustar tema:', error);
    showNotification('Erro ao ajustar tema. Tente novamente.', 'error');
  }

  console.log('DOM completamente carregado e inicializado.');
}

/**
 * 2. setupEventListeners - Configura os event listeners (já implementado em parte no DOMContentLoaded).
 */
export function setupEventListeners() {
  const floatingMenu = document.getElementById('floating-menu');
  const startCreateRouteBtn = document.getElementById('create-route-btn');
  const searchBtn = document.querySelector(
    '.menu-btn[data-feature="pesquisar"]'
  );
  const carouselModalClose = document.getElementById('carousel-modal-close');
  const aboutMoreBtn = document.getElementById('about-more-btn');
  const menuToggle = document.getElementById('menu-btn');
  const buyTicketBtn = document.getElementById('buy-ticket-btn');

  // Exemplo de evento para fechar o modal com a tecla ESC
  document.addEventListener('keydown', function (event) {
    const modal = document.querySelector('.modal[style*="display: block"]');
    if (modal && event.key === 'Escape') {
      modal.style.display = 'none';
    }
  });

  if (menuToggle) {
    menuToggle.style.display = 'none';
    menuToggle.addEventListener('click', () => {
      floatingMenu.classList.toggle('hidden');
      if (
        tutorialIsActive &&
        tutorialSteps[currentStep].step === 'menu-toggle'
      ) {
        nextTutorialStep();
      }
    });
  }

  // Evento para o botão "start-navigation-btn"
  const startNavigationRodapeBtn = document.getElementById(
    'start-navigation-rodape-btn'
  );
  if (startNavigationRodapeBtn) {
    startNavigationRodapeBtn.addEventListener('click', () => {
      console.log("✅ Botão 'start-navigation-rodape-btn' clicado!");
      startNavigation();
    });
  }

  // Evento para o botão "menu-details-btn"
  const menuDetailsBtn = document.getElementById('menu-details-btn');
  if (menuDetailsBtn) {
    menuDetailsBtn.addEventListener('click', () => {
      console.log("✅ Botão 'menu-details-btn' clicado!");
      clearRouteMarkers();
      hideInstructionBanner();
      showTutorialStep('ask-interest'); // ou showTutorialStep('someStep') se for esse o caso
    });
  }

  if (aboutMoreBtn) {
    aboutMoreBtn.addEventListener('click', () => {
      if (selectedDestination && selectedDestination.name) {
        startCarousel(selectedDestination.name);
      } else {
        alert('Por favor, selecione um destino primeiro.');
      }
    });
  }

  if (buyTicketBtn) {
    buyTicketBtn.addEventListener('click', () => {
      if (selectedDestination && selectedDestination.url) {
        openDestinationWebsite(selectedDestination.url);
      } else {
        alert('Por favor, selecione um destino primeiro.');
      }
    });
  }

  // Evento para o botão "cancel-route-btn"
  const cancelRouteBtn = document.getElementById('cancel-route-btn');
  if (cancelRouteBtn) {
    cancelRouteBtn.addEventListener('click', () => {
      console.log("✅ Botão 'cancel-route-btn' clicado!");
      // Finaliza a navegação, desfazendo todas as ações iniciadas pelo fluxo de startNavigation
      endNavigation();
      // Em seguida, restaura a interface para a última feature selecionada
      // (Utiliza a variável global 'lastSelectedFeature' que deve ter sido atualizada quando o usuário selecionou uma feature)

      restoreFeatureUI(Feature);
    });
  }

  const reserveChairsBtn = document.getElementById('reserve-chairs-btn');
  if (reserveChairsBtn) {
    reserveChairsBtn.addEventListener('click', () => {
      if (selectedDestination && selectedDestination.url) {
        openDestinationWebsite(selectedDestination.url);
      } else {
        alert('Por favor, selecione um destino primeiro.');
      }
    });
  }

  const reserveRestaurantsBtn = document.getElementById(
    'reserve-restaurants-btn'
  );
  if (reserveRestaurantsBtn) {
    reserveRestaurantsBtn.addEventListener('click', () => {
      if (selectedDestination && selectedDestination.url) {
        openDestinationWebsite(selectedDestination.url);
      } else {
        alert('Por favor, selecione um destino primeiro.');
      }
    });
  }

  const reserveInnsBtn = document.getElementById('reserve-inns-btn');
  if (reserveInnsBtn) {
    reserveInnsBtn.addEventListener('click', () => {
      if (selectedDestination && selectedDestination.url) {
        openDestinationWebsite(selectedDestination.url);
      } else {
        alert('Por favor, selecione um destino primeiro.');
      }
    });
  }

  const speakAttendentBtn = document.getElementById('speak-attendent-btn');
  if (speakAttendentBtn) {
    speakAttendentBtn.addEventListener('click', () => {
      if (selectedDestination && selectedDestination.url) {
        openDestinationWebsite(selectedDestination.url);
      } else {
        alert('Por favor, selecione um destino primeiro.');
      }
    });
  }

  const callBtn = document.getElementById('call-btn');
  if (callBtn) {
    callBtn.addEventListener('click', () => {
      if (selectedDestination && selectedDestination.url) {
        openDestinationWebsite(selectedDestination.url);
      } else {
        alert('Por favor, selecione um destino primeiro.');
      }
    });
  }

  // Configura o evento de mudança de idioma com integração ao tutorial do assistente
  document.querySelectorAll('.lang-btn').forEach((button) => {
    button.addEventListener('click', () => {
      const lang = button.dataset.lang;

      // Define o idioma globalmente
      setLanguage(lang);
      updateInterfaceLanguage(lang);
      startTutorial();

      console.log(`Idioma alterado para: ${lang}`);
    });
  });

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

  // Evento para botões de controle
  document.querySelectorAll('.control-btn[data-feature]').forEach((btn) => {
    btn.addEventListener('click', (event) => {
      const feature = btn.getAttribute('data-feature');
      console.log(`Control button feature selected: ${feature}`);
      handleFeatureSelection(feature);
      event.stopPropagation();
      if (tutorialIsActive && tutorialSteps[currentStep].step === feature) {
        nextTutorialStep();
      }
    });
  });

  document.querySelector('.menu-btn.zoom-in').addEventListener('click', () => {
    map.zoomIn();
    closeSideMenu();
    if (tutorialIsActive && tutorialSteps[currentStep].step === 'zoom-in') {
      nextTutorialStep();
    }
  });

  document.querySelector('.menu-btn.zoom-out').addEventListener('click', () => {
    map.zoomOut();
    closeSideMenu();
    if (tutorialIsActive && tutorialSteps[currentStep].step === 'zoom-out') {
      nextTutorialStep();
    }
  });

  const startTutorialBtn = document.getElementById('tutorial-iniciar-btn');
  if (startTutorialBtn) {
    startTutorialBtn.addEventListener('click', () => {
      nextTutorialStep();
    });
  }

  if (searchBtn) {
    searchBtn.addEventListener('click', () => {
      searchLocation();
      closeSideMenu();
      if (tutorialIsActive && tutorialSteps[currentStep].step === 'pesquisar') {
        nextTutorialStep();
      }
    });
  }

  document
    .getElementById('carousel-modal-close')
    .addEventListener('click', function () {
      const modal = document.getElementById('carousel-modal');
      if (modal) {
        modal.style.display = 'none';
      }
    });

  if (startCreateRouteBtn) {
    startCreateRouteBtn.addEventListener('click', () => {
      startRouteCreation();
    });
  }

  if (carouselModalClose) {
    carouselModalClose.addEventListener('click', closeCarouselModal);
  }
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
