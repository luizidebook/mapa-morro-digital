// Importações necessárias
import { showNotification } from '../ui/notifications.js';

// Estado global da navegação
export const navigationState = {
  isActive: false,
  isPaused: false,
  watchId: null,
  currentStepIndex: 0,
  instructions: [],
  selectedDestination: null,
  lang: 'pt',
  isRotationEnabled: true,
  quietMode: true,
  rotationInterval: 1000,
  speed: 0,
  manualOverride: false,
  manualAngle: 0,
  tilt: 10,
  rotationMode: 'compass',
  headingBuffer: [],
  minRotationDelta: 2,
  alpha: 0.2,
  currentHeading: 0,
  lastRotationTime: 0,
};

// Variáveis auxiliares
export let map = null; // Variável global para a instância do mapa
export const markers = []; // Array para armazenar marcadores
export let selectedLanguage = 'pt';
export let selectedDestination = {};
export let userLocation = null;
export let currentRoute = null;
export let userMarker = null;
export let destinationMarker = null;
export let currentSubMenu = null;
export let currentLocation = null;
export let currentStep = null;
export let tutorialIsActive = false;
export let searchHistory = [];
export let achievements = [];
export let favorites = [];
export let routingControl = null;
export let speechSynthesisUtterance = null;
export let voices = [];
export let currentMarker = null;
export let swiperInstance = null;
export let selectedProfile = 'foot-walking';
export let userLocationMarker = null;
export let userCurrentLocation = null;
export let currentRouteData = null;
export let isNavigationActive = false;
export let isnavigationPaused = false;
export let currentRouteSteps = [];
export let navigationWatchId = null;
export let cachedLocation = null;
export let locationPermissionGranted = false;
export let instructions = [];
export let lastRecalculationTime = 0;
export let lastDeviationTime = 0;
export let currentStepIndex = 0;
export let debounceTimer = null;
export let trackingActive = false;
export let watchId = null;
export let userPosition = null;

/* 1. initNavigationState
 * Reinicializa o objeto global de navegação, limpando estados anteriores. */
export function initNavigationState() {
  console.log('[initNavigationState] Reinicializando estado de navegação...');
  navigationState.isActive = false;
  navigationState.isPaused = false;
  navigationState.watchId = null;
  navigationState.currentStepIndex = 0;
  navigationState.instructions = [];
  navigationState.selectedDestination = null;
  if (navigationState.currentRouteLayer) {
    map.removeLayer(navigationState.currentRouteLayer);
    navigationState.currentRouteLayer = null;
  }
  console.log('[initNavigationState] Estado de navegação reinicializado.');
}

/**
 * 2. saveNavigationState - Salva o estado de navegação no sessionStorage.
 */
export function saveNavigationState(state) {
  if (!state) {
    console.warn('Nenhum estado de navegação para salvar.');
    return;
  }
  sessionStorage.setItem('navState', JSON.stringify(state));
  showNotification('Estado de navegação salvo.', 'success');
  console.log('Estado salvo:', state);
}

/**
 * 3. restoreNavigationState - Restaura o estado de navegação salvo no sessionStorage.
 */
export function restoreNavigationState() {
  const state = sessionStorage.getItem('navState');
  if (state) {
    const navState = JSON.parse(state);
    startNavigation(navState);
    showNotification('Estado de navegação restaurado.', 'info');
  } else {
    showNotification('Nenhum estado de navegação encontrado.', 'warning');
  }
}

/**
 * 5. autoRestoreState - Solicita ao Service Worker que restaure estado automaticamente.

export function autoRestoreState() {
  if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
    navigator.serviceWorker.controller.postMessage({
      type: 'RESTORE_STATE',
    });
    console.log('Tentando restaurar estado automaticamente.');
  } else {
    showNotification(
      'Service Worker não disponível para restauração automática.',
      'warning'
    );
  }
}
 */

/**
 * 6. restoreState - Restaura estado completo do sistema (geral).
 */
export function restoreState(state) {
  if (!state) {
    console.log('Nenhum estado para restaurar.');
    return;
  }

  console.log('Restaurando estado:', state);

  // Restaura o destino selecionado
  if (state.selectedDestination) {
    selectedDestination = state.selectedDestination;
    adjustMapWithLocation();
  }

  // Restaura as instruções da rota
  if (state.instructions) {
    displayStepByStepInstructions(state.instructions, 0);
  }

  // Restaura a localização do usuário
  if (state.userPosition) {
    updateUserPositionOnMap(state.userPosition);
  }

  document
    .getElementById('continue-navigation-btn')
    .addEventListener('click', () => {
      navigator.serviceWorker.controller.postMessage({ action: 'getState' });
      document.getElementById('recovery-modal').classList.add('hidden');
    });

  document
    .getElementById('start-new-navigation-btn')
    .addEventListener('click', () => {
      clearNavigationState();
      document.getElementById('recovery-modal').classList.add('hidden');
    });
} /*

/**
 * 7. updateNavigationState - Atualiza o objeto global navigationState (merge).
 */
export function updateNavigationState(newState) {
  if (!newState || typeof newState !== 'object') {
    console.error('updateNavigationState: newState inválido:', newState);
    return;
  }
  Object.assign(navigationState, newState);
  console.log('updateNavigationState: Estado atualizado:', navigationState);
}
