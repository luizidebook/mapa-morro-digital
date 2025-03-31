// Importações necessárias
import { showNotification } from '../ui/notifications.js';
import { getLocalStorageItem } from '../data/cache.js';

export let selectedLanguage = getLocalStorageItem('preferredLanguage', 'pt'); // Idioma atual da interface

export function setSelectedLanguage(lang) {
  selectedLanguage = lang;
}
// Estado global da navegação
/**
 * Estado de navegação - Objeto que mantém o estado completo da navegação atual
 * Usado para controlar flags, índices e parâmetros durante o fluxo de navegação
 */
export const navigationState = {
  // Controle básico da navegação
  isActive: false, // Se a navegação está ativa
  isPaused: false, // Se a navegação está em pausa
  watchId: null, // ID do watchPosition para monitoramento
  currentStepIndex: 0, // Índice do passo atual na rota
  instructions: [], // Lista de instruções detalhadas para o usuário
  selectedDestination: null, // Destino selecionado para a navegação
  lang: 'pt', // Idioma das instruções de navegação

  // Propriedades para controle da rotação do mapa
  isRotationEnabled: true, // Habilita/desabilita rotação automática do mapa
  quietMode: true, // Modo silencioso - menos atualizações de UI
  rotationInterval: 1000, // Intervalo mínimo entre atualizações de rotação (ms)
  speed: 0, // Velocidade atual do usuário (m/s)
  manualOverride: false, // Se a rotação manual está ativada
  manualAngle: 0, // Ângulo manual (graus) quando override ativado
  tilt: 10, // Inclinação do mapa (graus) para efeito 3D
  rotationMode: 'compass', // Modo de rotação (north-up: fixo ou compass: seguindo direção)
  headingBuffer: [], // Buffer para suavizar leituras de direção
  minRotationDelta: 2, // Mudança mínima (graus) para atualizar rotação
  alpha: 0.2, // Fator de suavização (0-1)
  currentHeading: 0, // Direção atual aplicada (graus)
  lastRotationTime: 0, // Timestamp da última rotação (ms)
};

// Variáveis auxiliares
export let map = null; // Variável global para a instância do mapa
export let markers = []; // Array para armazenar marcadores
export let selectedDestination = {};
export let userLocation = null;
export let currentRoute = null;
export let userMarker = null;
export let destinationMarker = null;
export let currentSubMenu = null;
export let currentLocation = null;
export let currentStep = null; // Nenhum passo ativo inicialmente
export let tutorialIsActive = false; // Tutorial desativado por padrão
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
export let positionWatcher = (window.positionWatcher = null); // ID do watchPosition global

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
