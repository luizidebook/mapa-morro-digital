import { appState } from '../core/state.js';
import { eventBus, EVENT_TYPES } from '../core/eventBus.js';
import { LOCATION_CONFIG } from '../core/config.js';
import { showError, showWarning } from '../ui/notifications.js';
import { updateUserMarker } from '../map/map-markers.js';
import { centerMap } from '../map/map-core.js';
import { translate } from '../i18n/language.js';
import { calculateDistance } from '../utils/geo.js';

/**
 * Módulo de rastreamento de geolocalização
 * Responsável por rastrear a posição do usuário e fornecer atualizações
 */

/**
 * Inicializa o rastreamento contínuo da localização do usuário
 * @param {Object} options - Opções de rastreamento
 * @returns {Promise<Object>} - Localização inicial ou erro
 */
export function initContinuousLocationTracking(options = {}) {
  return new Promise((resolve, reject) => {
    // Verificar se o navegador suporta geolocalização
    if (!navigator.geolocation) {
      const error = new Error('Geolocalização não suportada neste navegador.');
      showError('geolocation-not-supported');
      reject(error);
      return;
    }

    // Definir opções de rastreamento
    const trackingOptions = {
      ...LOCATION_CONFIG.GEOLOCATION_OPTIONS,
      ...options,
    };

    // Obter posição inicial
    navigator.geolocation.getCurrentPosition(
      // Sucesso
      (position) => {
        const { latitude, longitude, accuracy, heading, speed } =
          position.coords;

        // Armazenar a localização inicial no estado
        appState.set('user.location', {
          lat: latitude,
          lon: longitude,
          accuracy,
        });
        appState.set('user.heading', heading || 0);
        appState.set('user.speed', speed || 0);
        appState.set('user.locationUpdateTimestamp', position.timestamp);

        // Atualizar marcador do usuário
        updateUserMarker(latitude, longitude, heading, accuracy);

        // Iniciar o rastreamento contínuo
        startContinuousTracking(trackingOptions);

        // Publicar evento de localização inicializada
        eventBus.publish(EVENT_TYPES.LOCATION_INITIALIZED, {
          lat: latitude,
          lon: longitude,
          accuracy,
          heading,
          speed,
        });

        // Resolver a promessa com a posição inicial
        resolve({
          lat: latitude,
          lon: longitude,
          accuracy,
          heading,
          speed,
          timestamp: position.timestamp,
        });
      },
      // Erro
      (error) => {
        handleGeolocationError(error);
        reject(error);
      },
      // Opções
      trackingOptions
    );
  });
}

/**
 * Inicia o rastreamento contínuo da posição
 * @param {Object} options - Opções de rastreamento
 */
function startContinuousTracking(options = {}) {
  // Limpar rastreamento anterior se existir
  stopLocationTracking();

  // Iniciar novo rastreamento
  const watcherId = navigator.geolocation.watchPosition(
    // Sucesso - atualização de posição
    (position) => {
      const { latitude, longitude, accuracy, heading, speed } = position.coords;
      const timestamp = position.timestamp;

      // Obter a última posição conhecida
      const lastLocation = appState.get('user.location');
      const lastTimestamp = appState.get('user.locationUpdateTimestamp');

      // Calcular distância da última posição (para filtrar atualizações mínimas)
      let distance = 0;
      let timeDelta = 0;

      if (lastLocation && lastTimestamp) {
        distance = calculateDistance(
          lastLocation.lat,
          lastLocation.lon,
          latitude,
          longitude
        );

        timeDelta = timestamp - lastTimestamp;
      }

      // Filtrar atualizações muito frequentes ou com deslocamento mínimo
      const MIN_UPDATE_INTERVAL = 1000; // 1 segundo
      const MIN_DISTANCE = 1; // 1 metro

      if (timeDelta < MIN_UPDATE_INTERVAL && distance < MIN_DISTANCE) {
        return; // Ignorar atualização
      }

      // Atualizar estado com a nova posição
      appState.set('user.location', {
        lat: latitude,
        lon: longitude,
        accuracy,
      });
      appState.set(
        'user.heading',
        heading || appState.get('user.heading') || 0
      );
      appState.set('user.speed', speed || 0);
      appState.set('user.locationUpdateTimestamp', timestamp);

      // Atualizar marcador do usuário no mapa
      updateUserMarker(latitude, longitude, heading, accuracy);

      // Publicar evento de atualização de localização
      eventBus.publish(EVENT_TYPES.LOCATION_UPDATED, {
        lat: latitude,
        lon: longitude,
        accuracy,
        heading,
        speed,
        timestamp,
        distance,
        timeDelta,
      });
    },
    // Erro
    handleGeolocationError,
    // Opções
    options
  );

  // Armazenar ID do watcher no estado
  appState.set('user.watcherId', watcherId);

  // Também armazenar na variável global por compatibilidade
  window.positionWatcher = watcherId;

  // Publicar evento de rastreamento iniciado
  eventBus.publish(EVENT_TYPES.LOCATION_TRACKING_STARTED);

  return watcherId;
}

/**
 * Para o rastreamento de localização
 */
export function stopLocationTracking() {
  // Obter ID do watcher atual
  const watcherId = appState.get('user.watcherId');

  if (watcherId) {
    // Parar o rastreamento
    navigator.geolocation.clearWatch(watcherId);

    // Limpar referências
    appState.set('user.watcherId', null);
    window.positionWatcher = null;

    // Publicar evento
    eventBus.publish(EVENT_TYPES.LOCATION_TRACKING_STOPPED);
  }
}

/**
 * Obtém a localização atual do usuário (única vez)
 * @param {Object} options - Opções de geolocalização
 * @returns {Promise<Object>} - Localização ou erro
 */
export function getCurrentLocation(options = {}) {
  return new Promise((resolve, reject) => {
    // Verificar se o navegador suporta geolocalização
    if (!navigator.geolocation) {
      const error = new Error('Geolocalização não suportada neste navegador.');
      showError('geolocation-not-supported');
      reject(error);
      return;
    }

    // Definir opções
    const geoOptions = {
      ...LOCATION_CONFIG.GEOLOCATION_OPTIONS,
      ...options,
    };

    // Obter posição
    navigator.geolocation.getCurrentPosition(
      // Sucesso
      (position) => {
        const { latitude, longitude, accuracy, heading, speed } =
          position.coords;

        // Criar objeto de localização
        const location = {
          lat: latitude,
          lon: longitude,
          accuracy,
          heading: heading || 0,
          speed: speed || 0,
          timestamp: position.timestamp,
        };

        // Atualizar estado se solicitado
        if (options.updateState !== false) {
          appState.set('user.location', {
            lat: latitude,
            lon: longitude,
            accuracy,
          });
          appState.set('user.heading', heading || 0);
          appState.set('user.speed', speed || 0);
          appState.set('user.locationUpdateTimestamp', position.timestamp);
        }

        // Atualizar marcador do usuário se solicitado
        if (options.updateMarker !== false) {
          updateUserMarker(latitude, longitude, heading, accuracy);
        }

        // Centralizar mapa se solicitado
        if (options.centerMap === true) {
          centerMap(latitude, longitude, null, {
            animate: true,
            offsetYPercent: options.offsetYPercent || 0,
          });
        }

        // Publicar evento
        eventBus.publish(EVENT_TYPES.LOCATION_OBTAINED, location);

        // Resolver promessa
        resolve(location);
      },
      // Erro
      (error) => {
        handleGeolocationError(error);
        reject(error);
      },
      // Opções
      geoOptions
    );
  });
}

/**
 * Trata erros de geolocalização
 * @param {Object} error - Objeto de erro de geolocalização
 */
function handleGeolocationError(error) {
  console.error('Erro de geolocalização:', error);

  let message = 'Erro desconhecido de geolocalização.';

  // Tratar diferentes tipos de erro
  switch (error.code) {
    case error.PERMISSION_DENIED:
      message = 'location-access-denied';
      break;
    case error.POSITION_UNAVAILABLE:
      message = 'location-unavailable';
      break;
    case error.TIMEOUT:
      message = 'location-timeout';
      break;
  }

  // Exibir mensagem de erro
  showError(message);

  // Publicar evento de erro
  eventBus.publish(EVENT_TYPES.LOCATION_ERROR, {
    code: error.code,
    message: error.message || translate(message),
  });
}

/**
 * Verifica se a localização está sendo rastreada ativamente
 * @returns {boolean} - true se o rastreamento estiver ativo
 */
export function isTrackingActive() {
  return appState.get('user.watcherId') !== null;
}

/**
 * Calcula a precisão da localização
 * @param {Object} location - Objeto de localização
 * @returns {string} - Descrição da precisão ("alta", "média", "baixa")
 */
export function getLocationAccuracyLevel(location) {
  if (!location || !location.accuracy) return 'unknown';

  const accuracy = location.accuracy;

  if (accuracy <= 10) return 'high'; // Alta precisão: <= 10 metros
  if (accuracy <= 50) return 'medium'; // Média precisão: <= 50 metros
  return 'low'; // Baixa precisão: > 50 metros
}

/**
 * Verifica se a localização é recente
 * @param {number} timestamp - Timestamp da atualização
 * @param {number} [maxAge=30000] - Idade máxima em ms (padrão: 30 segundos)
 * @returns {boolean} - true se a localização for recente
 */
export function isLocationRecent(timestamp, maxAge = 30000) {
  if (!timestamp) return false;

  const now = Date.now();
  return now - timestamp <= maxAge;
}

/**
 * Recupera a última localização conhecida do usuário
 * @returns {Object|null} - Objeto de localização ou null
 */
export function getLastKnownLocation() {
  const location = appState.get('user.location');
  const timestamp = appState.get('user.locationUpdateTimestamp');
  const heading = appState.get('user.heading');
  const speed = appState.get('user.speed');

  if (!location) return null;

  return {
    lat: location.lat,
    lon: location.lon,
    accuracy: location.accuracy,
    heading,
    speed,
    timestamp,
  };
}

/**
 * Solicita permissão de geolocalização explicitamente
 * Útil para chamar em resposta a um clique do usuário
 * @returns {Promise<boolean>} - true se permissão concedida
 */
export function requestLocationPermission() {
  return new Promise((resolve) => {
    if (!navigator.geolocation) {
      showError('geolocation-not-supported');
      resolve(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      () => {
        // Permissão concedida
        resolve(true);
      },
      (error) => {
        // Permissão negada ou outro erro
        handleGeolocationError(error);
        resolve(false);
      },
      { timeout: 10000, maximumAge: 0 }
    );
  });
}

// Exportar funções
export default {
  initContinuousLocationTracking,
  stopLocationTracking,
  getCurrentLocation,
  isTrackingActive,
  getLocationAccuracyLevel,
  isLocationRecent,
  getLastKnownLocation,
  requestLocationPermission,
};
