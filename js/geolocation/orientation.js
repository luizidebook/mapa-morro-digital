import { appState } from "../core/state.js";
import { eventBus, EVENT_TYPES } from "../core/eventBus.js";
import { LOCATION_CONFIG } from "../core/config.js";
import { throttle, smoothValue } from "../utils/helpers.js";

/**
 * Módulo de orientação do dispositivo
 * Gerencia a bússola e orientação para modo de primeira pessoa
 */

// Armazenar estado da orientação
let orientationTrackingActive = false;
let lastHeading = 0;
let lastAlpha = null;

/**
 * Inicia o rastreamento da orientação do dispositivo
 * @param {Function} [callback] - Função opcional de callback para cada atualização
 * @returns {boolean} - true se bem-sucedido
 */
export function startOrientationTracking(callback) {
  // Verificar se já está rastreando
  if (orientationTrackingActive) return true;

  // Verificar suporte a DeviceOrientationEvent
  if (!window.DeviceOrientationEvent) {
    console.warn("Orientação do dispositivo não suportada neste navegador.");
    return false;
  }

  // Throttle para limitar a frequência de atualizações (desempenho)
  const handleOrientation = throttle((event) => {
    processOrientationEvent(event, callback);
  }, LOCATION_CONFIG.ROTATION.UPDATE_INTERVAL);

  // Verificar se o navegador requer permissão (iOS 13+)
  if (typeof DeviceOrientationEvent.requestPermission === "function") {
    DeviceOrientationEvent.requestPermission()
      .then((permissionState) => {
        if (permissionState === "granted") {
          window.addEventListener("deviceorientation", handleOrientation);
          orientationTrackingActive = true;

          // Publicar evento
          eventBus.publish(EVENT_TYPES.ORIENTATION_TRACKING_STARTED);
        } else {
          console.warn("Permissão para orientação do dispositivo negada");
          orientationTrackingActive = false;
        }
      })
      .catch(console.error);
  } else {
    // Navegadores sem necessidade de permissão explícita
    window.addEventListener("deviceorientation", handleOrientation);
    orientationTrackingActive = true;

    // Publicar evento
    eventBus.publish(EVENT_TYPES.ORIENTATION_TRACKING_STARTED);
  }

  return orientationTrackingActive;
}

/**
 * Para o rastreamento da orientação do dispositivo
 */
export function stopOrientationTracking() {
  if (!orientationTrackingActive) return;

  // Remover listener
  window.removeEventListener("deviceorientation", processOrientationEvent);
  orientationTrackingActive = false;

  // Publicar evento
  eventBus.publish(EVENT_TYPES.ORIENTATION_TRACKING_STOPPED);
}

/**
 * Processa evento de orientação do dispositivo
 * @param {Object} event - Evento de orientação
 * @param {Function} [callback] - Função opcional de callback
 */
function processOrientationEvent(event, callback) {
  // Verificar se o evento contém dados válidos
  if (!event || (event.alpha === null && event.webkitCompassHeading === null)) {
    return;
  }

  // Obter o ângulo de bússola
  let heading = null;

  // Safari em iOS usa webkitCompassHeading (em graus, 0 = Norte)
  if (
    event.webkitCompassHeading !== undefined &&
    event.webkitCompassHeading !== null
  ) {
    heading = event.webkitCompassHeading;
  }
  // Chrome, Firefox, etc. usam event.alpha (em graus, 0 = inicial)
  else if (event.alpha !== null) {
    // Converter alpha para direção da bússola
    heading = 360 - event.alpha;
  }

  // Se não conseguimos obter um valor de heading válido, retornar
  if (heading === null) return;

  // Aplicar suavização ao heading para evitar movimentos bruscos
  if (lastAlpha !== null) {
    heading = smoothValue(
      lastAlpha,
      heading,
      LOCATION_CONFIG.ROTATION.SMOOTHING_ALPHA
    );
  }

  // Armazenar para a próxima iteração
  lastAlpha = heading;

  // Filtrar pequenas mudanças para reduzir tremulação
  const delta = Math.abs(heading - lastHeading);
  if (delta < LOCATION_CONFIG.ROTATION.MIN_ROTATION_DELTA && delta !== 0) {
    return;
  }

  // Atualizar o último heading
  lastHeading = heading;

  // Atualizar o estado
  appState.set("user.heading", heading);

  // Publicar evento
  eventBus.publish(EVENT_TYPES.HEADING_UPDATED, { heading });

  // Chamar callback se fornecido
  if (typeof callback === "function") {
    callback(heading);
  }
}

/**
 * Aplica rotação ao mapa com base na orientação do dispositivo
 * @param {Object} map - Instância do mapa Leaflet
 * @param {number} heading - Direção em graus
 */
export function rotateMap(map, heading) {
  if (!map) return;

  try {
    // Obter o container do mapa
    const container = map.getContainer();

    // Verificar se o modo de primeira pessoa está ativo
    const isFirstPerson = appState.get("map.rotation.isFirstPersonView");

    if (isFirstPerson) {
      // No modo de primeira pessoa, rotacionamos o mapa para alinhar com a direção
      const angle = heading;

      // Aplicar rotação às camadas do mapa
      container.style.transform = `rotate(${angle}deg)`;

      // Também precisamos rotacionar os textos de volta para serem legíveis
      const textElements = container.querySelectorAll(
        ".leaflet-marker-icon, .leaflet-tooltip"
      );
      textElements.forEach((el) => {
        el.style.transform = `rotate(${-angle}deg)`;
      });

      // Atualizar estado
      appState.set("map.rotation.currentAngle", angle);
    } else {
      // No modo normal, remover qualquer rotação
      container.style.transform = "";

      // Restaurar rotação dos textos
      const textElements = container.querySelectorAll(
        ".leaflet-marker-icon, .leaflet-tooltip"
      );
      textElements.forEach((el) => {
        el.style.transform = "";
      });

      // Atualizar estado
      appState.set("map.rotation.currentAngle", 0);
    }
  } catch (error) {
    console.error("Erro ao rotacionar mapa:", error);
  }
}

/**
 * Ativa ou desativa o modo de visão em primeira pessoa
 * @param {boolean} enable - Se true, ativa o modo primeira pessoa
 */
export function setFirstPersonView(enable) {
  // Atualizar estado
  appState.set("map.rotation.isFirstPersonView", enable);
  appState.set("map.rotation.enabled", enable);

  // Iniciar rastreamento de orientação se estiver ativando
  if (enable && !orientationTrackingActive) {
    startOrientationTracking();
  }

  // Publicar evento
  eventBus.publish(EVENT_TYPES.FIRST_PERSON_VIEW_CHANGED, { enabled: enable });

  return enable;
}

/**
 * Verifica se a orientação está sendo rastreada
 * @returns {boolean} - true se o rastreamento estiver ativo
 */
export function isOrientationTrackingActive() {
  return orientationTrackingActive;
}

/**
 * Obtém o último heading conhecido
 * @returns {number} - Heading em graus (0-359)
 */
export function getLastHeading() {
  return lastHeading;
}

// Subscrever a eventos
eventBus.subscribe(EVENT_TYPES.HEADING_UPDATED, ({ heading }) => {
  // Se o modo de primeira pessoa estiver ativo, rotacionar o mapa
  if (appState.get("map.rotation.isFirstPersonView")) {
    const map = appState.get("map.instance");
    if (map) {
      rotateMap(map, heading);
    }
  }
});

// Exportar funções
export default {
  startOrientationTracking,
  stopOrientationTracking,
  rotateMap,
  setFirstPersonView,
  isOrientationTrackingActive,
  getLastHeading,
};
