import { appState } from "../core/state.js";
import { eventBus, EVENT_TYPES } from "../core/eventBus.js";
import { getLastKnownLocation } from "../geolocation/tracking.js";
import { calculateDistance } from "../utils/geo.js";
import { showSuccess, showWarning } from "../ui/notifications.js";
import { translate } from "../i18n/language.js";
import { highlightNextStepInMap } from "../map/map-markers.js";
import { getMap, centerMap } from "../map/map-core.js";
import { LOCATION_CONFIG } from "../core/config.js";

/**
 * Módulo de Estado de Navegação
 * Gerencia o estado interno da navegação e a lógica de instruções passo a passo
 */

// Intervalo de atualização de progresso
let progressUpdateInterval = null;

// Timestamp da última recalculação (para evitar recalculações frequentes)
let lastRecalculationTime = 0;

/**
 * Inicia a navegação com uma rota específica
 * @param {Object} route - Objeto de rota a ser navegado
 * @param {Object} [options={}] - Opções de navegação
 */
export function startNavigation(route, options = {}) {
  if (!route) {
    console.error("Tentativa de iniciar navegação sem rota");
    return;
  }

  // Opções padrão
  const defaultOptions = {
    startAtStep: 0,
    skipIntro: false,
    centerMap: true,
    followUser: true,
    speakInstructions: true,
  };

  // Mesclar opções
  const navOptions = { ...defaultOptions, ...options };

  // Configurar estado de navegação
  appState.set("navigation.active", true);
  appState.set("navigation.paused", false);
  appState.set("navigation.currentStepIndex", navOptions.startAtStep || 0);
  appState.set("navigation.startTime", Date.now());
  appState.set("navigation.options", navOptions);
  appState.set("navigation.progress", 0);
  appState.set("navigation.distanceTraveled", 0);
  appState.set("navigation.lastPosition", getLastKnownLocation());

  // Definir passo inicial
  const currentStep = route.instructions[navOptions.startAtStep || 0];

  // Publicar evento de navegação iniciada
  eventBus.publish(EVENT_TYPES.NAVIGATION_STARTED, {
    route,
    step: currentStep,
    options: navOptions,
  });

  // Iniciar rastreamento de progresso
  startProgressTracking();

  // Mostrar e destacar o passo atual se não estiver pulando introdução
  if (!navOptions.skipIntro) {
    goToInstructionStep(navOptions.startAtStep || 0);
  }

  // Mostrar mensagem para o usuário
  showSuccess(translate("navigation-started"));

  return true;
}

/**
 * Para a navegação ativa
 * @param {Object} [options={}] - Opções para parar a navegação
 */
export function stopNavigation(options = {}) {
  // Verificar se existe navegação ativa
  if (!isNavigationActive()) {
    return;
  }

  // Parar rastreamento de progresso
  stopProgressTracking();

  // Limpar estado
  appState.set("navigation.active", false);
  appState.set("navigation.paused", false);
  appState.set("navigation.currentStepIndex", 0);
  appState.set("navigation.progress", 0);

  // Publicar evento
  eventBus.publish(EVENT_TYPES.NAVIGATION_ENDED, {
    canceled: options.canceled || false,
  });

  // Mostrar mensagem apenas se não cancelada
  if (!options.silent) {
    showSuccess(translate("navigation-ended"));
  }
}

/**
 * Pausa ou retoma a navegação
 * @param {boolean} pause - true para pausar, false para retomar
 */
export function pauseNavigation(pause = true) {
  // Apenas se a navegação estiver ativa
  if (!isNavigationActive()) return;

  appState.set("navigation.paused", pause);

  // Publicar evento
  eventBus.publish(EVENT_TYPES.NAVIGATION_PAUSED, { paused: pause });
}

/**
 * Verifica se a navegação está ativa
 * @returns {boolean} - true se estiver ativa
 */
export function isNavigationActive() {
  return appState.get("navigation.active") === true;
}

/**
 * Verifica se a navegação está pausada
 * @returns {boolean} - true se estiver pausada
 */
export function isNavigationPaused() {
  return appState.get("navigation.paused") === true;
}

/**
 * Obtém o progresso atual da navegação
 * @returns {number} - Progresso entre 0 e 1
 */
export function getNavigationProgress() {
  return appState.get("navigation.progress") || 0;
}

/**
 * Inicia o rastreamento de progresso da navegação
 */
function startProgressTracking() {
  // Limpar intervalo anterior se existir
  stopProgressTracking();

  // Definir novo intervalo
  progressUpdateInterval = setInterval(() => {
    updateNavigationProgress();
  }, 2000); // Atualizar a cada 2 segundos
}

/**
 * Para o rastreamento de progresso
 */
function stopProgressTracking() {
  if (progressUpdateInterval) {
    clearInterval(progressUpdateInterval);
    progressUpdateInterval = null;
  }
}

/**
 * Atualiza o progresso da navegação
 */
function updateNavigationProgress() {
  // Verificar se navegação está ativa e não pausada
  if (!isNavigationActive() || isNavigationPaused()) {
    return;
  }

  const currentRoute = appState.get("route.current");
  if (!currentRoute) return;

  // Obter posição atual
  const currentPosition = getLastKnownLocation();
  if (!currentPosition) return;

  // Obter último passo de instrução
  const stepIndex = appState.get("navigation.currentStepIndex") || 0;
  const instructions = currentRoute.instructions;

  if (!instructions || !instructions.length) return;

  // Obter a posição anterior para cálculo de distância percorrida
  const lastPosition = appState.get("navigation.lastPosition");

  // Atualizar distância percorrida
  if (lastPosition) {
    const distance = calculateDistance(
      lastPosition.lat,
      lastPosition.lon,
      currentPosition.lat,
      currentPosition.lon
    );

    // Apenas considerar se o movimento for significativo (> 1m)
    if (distance > 1) {
      const distanceTraveled =
        (appState.get("navigation.distanceTraveled") || 0) + distance;
      appState.set("navigation.distanceTraveled", distanceTraveled);
      appState.set("navigation.lastPosition", currentPosition);
    }
  } else {
    appState.set("navigation.lastPosition", currentPosition);
  }

  // Calcular progresso com base na distância
  const totalDistance = currentRoute.distance;
  const distanceTraveled = appState.get("navigation.distanceTraveled") || 0;

  // Limitar entre 0 e 1
  let progress = Math.min(1, Math.max(0, distanceTraveled / totalDistance));

  // Ajustar progresso com base nas instruções
  // Isso dá um progresso mais preciso, considerando os pontos de passagem
  const currentStep = instructions[stepIndex];
  if (currentStep && currentStep.location) {
    const stepLat = currentStep.location[1] || currentStep.location.lat;
    const stepLon = currentStep.location[0] || currentStep.location.lon;

    // Distância até o próximo ponto de instrução
    const distanceToStep = calculateDistance(
      currentPosition.lat,
      currentPosition.lon,
      stepLat,
      stepLon
    );

    // Se estiver muito próximo, avançar para o próximo passo
    if (distanceToStep < LOCATION_CONFIG.TRACKING.ARRIVAL_THRESHOLD) {
      // Apenas avançar se ainda não estiver no último passo
      if (stepIndex < instructions.length - 1) {
        goToInstructionStep(stepIndex + 1);
      }
    }
  }

  // Atualizar progresso no estado
  appState.set("navigation.progress", progress);

  // Publicar evento
  eventBus.publish(EVENT_TYPES.NAVIGATION_PROGRESS_UPDATED, { progress });

  // Verificar se chegou ao destino
  if (progress >= 0.99) {
    // Dar uma pequena margem para considerar como finalizado
    handleArrival();
    return;
  }

  // Verificar se está desviado da rota e precisa recalcular
  checkAndRecalculateIfNeeded(currentPosition);
}

/**
 * Verifica se há um desvio significativo da rota e recalcula se necessário
 * @param {Object} currentPosition - Posição atual
 */
function checkAndRecalculateIfNeeded(currentPosition) {
  // Verificar se a recalculação está em cooldown
  const now = Date.now();
  if (
    now - lastRecalculationTime <
    LOCATION_CONFIG.TRACKING.RECALCULATION_COOLDOWN
  ) {
    return;
  }

  // Importar sob demanda para evitar dependência circular
  const { checkRouteDeviation, recalculateRoute } = require("./route.js");

  // Verificar desvio
  const needsRecalculation = checkRouteDeviation(currentPosition);

  // Recalcular se necessário
  if (needsRecalculation) {
    lastRecalculationTime = now;
    showWarning(translate("route-deviation-recalculating"));

    // Executar recalculação
    recalculateRoute().catch((error) => {
      console.error("Erro na recalculação automática:", error);
    });
  }
}

/**
 * Processa a chegada ao destino
 */
function handleArrival() {
  // Verificar se já finalizou
  if (!isNavigationActive()) return;

  // Mostrar mensagem de chegada
  showSuccess(translate("destination-reached"));

  // Ir para o último passo
  const route = appState.get("route.current");
  if (route && route.instructions) {
    goToInstructionStep(route.instructions.length - 1);
  }

  // Parar navegação
  stopNavigation({ silent: true });
}

/**
 * Avança para o próximo passo de instrução
 */
export function nextInstructionStep() {
  const currentIndex = appState.get("navigation.currentStepIndex") || 0;
  const route = appState.get("route.current");

  if (!route || !route.instructions) return;

  const newIndex = Math.min(route.instructions.length - 1, currentIndex + 1);
  goToInstructionStep(newIndex);
}

/**
 * Retorna ao passo anterior de instrução
 */
export function prevInstructionStep() {
  const currentIndex = appState.get("navigation.currentStepIndex") || 0;

  const newIndex = Math.max(0, currentIndex - 1);
  goToInstructionStep(newIndex);
}

/**
 * Vai para um passo específico da navegação
 * @param {number} stepIndex - Índice do passo
 */
export function goToInstructionStep(stepIndex) {
  const route = appState.get("route.current");

  if (!route || !route.instructions) {
    console.warn("Não há instruções para navegar");
    return;
  }

  // Garantir que o índice é válido
  stepIndex = Math.max(0, Math.min(route.instructions.length - 1, stepIndex));

  // Atualizar o passo atual
  appState.set("navigation.currentStepIndex", stepIndex);

  // Obter o passo
  const step = route.instructions[stepIndex];

  // Publicar evento
  eventBus.publish(EVENT_TYPES.NAVIGATION_STEP_CHANGED, {
    step,
    index: stepIndex,
  });

  // Destacar no mapa
  highlightNextStepInMap(step);

  // Centralizar mapa se necessário
  const shouldCenterMap = appState.get("navigation.options.centerMap");
  if (shouldCenterMap && step.location) {
    const map = getMap();
    if (map) {
      const lat = step.location[1] || step.location.lat;
      const lon = step.location[0] || step.location.lon;

      centerMap(lat, lon, null, {
        animate: true,
        duration: 0.5,
        offsetYPercent: 30,
      });
    }
  }

  // Ler instrução em voz alta se ativado
  const shouldSpeak = appState.get("navigation.options.speakInstructions");
  if (shouldSpeak) {
    speakInstruction(step.text);
  }

  // Atualizar UI
  eventBus.publish(EVENT_TYPES.INSTRUCTION_DISPLAY_UPDATE_NEEDED, {
    instructions: route.instructions,
    currentIndex: stepIndex,
  });
}
