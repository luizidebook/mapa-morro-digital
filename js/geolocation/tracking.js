/**
 * Módulo: tracking.js
 * Descrição: Este módulo gerencia a geolocalização, rastreamento contínuo e atualização de marcadores no mapa.
 *
 * Dependências:
 * 1. **Funções Externas**:
 *    - `showNotification(message, type)`: Exibe notificações para o usuário.
 *    - `getGeneralText(key, lang)`: Retorna mensagens traduzidas com base no idioma selecionado.
 *    - `calculateDistance(lat1, lon1, lat2, lon2)`: Calcula a distância entre dois pontos geográficos.
 *    - `computeBearing(lat1, lon1, lat2, lon2)`: Calcula o rumo (heading) entre dois pontos geográficos.
 *    - `animateMarker(marker, fromLatLng, toLatLng, duration)`: Anima a transição de um marcador no mapa.
 *    - `setMapRotation()`: Sincroniza a rotação do mapa com a orientação do dispositivo.
 *    - `startRotationAuto()`: Inicia a rotação automática do mapa.
 *    - `createRoute(destLat, destLon)`: Cria uma nova rota para o destino especificado.
 *    - `endNavigation()`: Finaliza a navegação ativa.
 *    - `centerMapOnUser(lat, lon)`: Centraliza o mapa na posição do usuário.
 *
 * 2. **Variáveis Globais**:
 *    - `userLocation`: Objeto contendo a localização atual do usuário (`latitude`, `longitude`, `accuracy`).
 *    - `userPosition`: Objeto contendo a posição atual do usuário durante o rastreamento contínuo.
 *    - `trackingActive`: Booleano indicando se o rastreamento contínuo está ativo.
 *    - `watchId`: ID retornado pelo `navigator.geolocation.watchPosition`.
 *    - `map`: Instância do mapa (ex.: Leaflet ou outro framework de mapas).
 *    - `window.userMarker`: Marcador do usuário no mapa.
 *    - `window.userAccuracyCircle`: Círculo indicando a margem de erro do GPS no mapa.
 *    - `window.lastPosition`: Última posição conhecida do usuário.
 *    - `window.routeDestination`: Objeto contendo as coordenadas do destino da rota.
 *    - `lastRecalculationTime`: Timestamp da última vez que a rota foi recalculada.
 *    - `selectedLanguage`: Idioma selecionado pelo usuário (ex.: "pt", "en").
 *
 * 3. **Constantes**:
 *    - `navigator.geolocation`: API de geolocalização do navegador.
 *
 * Observação:
 * Certifique-se de que todas as dependências estão disponíveis no escopo global ou importadas corretamente.
 */

/////////////////////////////
// Código do módulo começa aqui
/////////////////////////////
// Importações de funções externas
import { showNotification } from '../ui/notifications.js';
import { getGeneralText } from '../i18n/language.js';
import { calculateDistance, computeBearing } from '../geolocation/geoUtil.js';
import {
  setMapRotation,
  startRotationAuto,
  centerMapOnUser,
} from '../map/mapUtils.js';

import { endNavigation } from '../navigation/navigation.js';

// Importações de variáveis globais
import { selectedLanguage } from '../core/varGlobals.js';
import { map } from '../main.js';
export let userLocation = null; // Última localização conhecida do usuário (atualizada pelo GPS)
export let trackingActive = false;
export let watchId = null;
export let userPosition = null;
export let lastRecalculationTime = 0;

/**
 * 1. getCurrentLocation
 * getCurrentLocation
 * Obtém a localização atual do usuário uma única vez.
 * Em caso de sucesso, inicia o tracking contínuo e retorna a posição.
 *
 * @param {Object} [options] - Opções para getCurrentPosition.
 * @returns {Object|null} - Objeto com latitude, longitude e precisão ou null em caso de erro.
 */
export async function getCurrentLocation(
  options = { enableHighAccuracy: true, timeout: 15000, maximumAge: 5000 }
) {
  console.log('[getCurrentLocation] Solicitando posição atual...');

  // Verifica se a API de geolocalização está disponível
  if (!('geolocation' in navigator)) {
    showNotification(
      getGeneralText('geolocationUnsupported', selectedLanguage) ||
        'Geolocalização não suportada.',
      'error'
    );
    return null;
  }

  try {
    // Solicita a posição atual
    const position = await new Promise((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(resolve, reject, options);
    });
    const { latitude, longitude, accuracy } = position.coords;
    userLocation = { latitude, longitude, accuracy };
    console.log('[getCurrentLocation] Localização obtida:', userLocation);

    // Inicia o tracking contínuo após obter a posição inicial
    startPositionTracking();

    return userLocation;
  } catch (error) {
    console.error('[getCurrentLocation] Erro:', error);
    // Define mensagem de erro específica com base no código do erro
    let message = getGeneralText('trackingError', selectedLanguage);
    if (error.code === error.PERMISSION_DENIED) {
      message =
        getGeneralText('noLocationPermission', selectedLanguage) ||
        'Permissão de localização negada.';
    } else if (error.code === error.TIMEOUT) {
      message =
        getGeneralText('locationTimeout', selectedLanguage) ||
        'Tempo limite para obtenção de localização excedido.';
    } else if (error.code === error.POSITION_UNAVAILABLE) {
      message =
        getGeneralText('positionUnavailable', selectedLanguage) ||
        'Posição indisponível.';
    }
    showNotification(message, 'error');
    return null;
  }
}

/**
 * 2. useCurrentLocation
 * Centraliza o mapa na posição atual do usuário.
 */
export async function useCurrentLocation() {
  try {
    userLocation = await getCurrentLocation();
    if (!userLocation) return;
    centerMapOnUser(userLocation.latitude, userLocation.longitude);
    console.log('Mapa centralizado na localização do usuário.');
  } catch (error) {
    console.error('Erro em useCurrentLocation:', error);
  }
} /*

  --- 10.2. Rastreamento Contínuo ---
  /**
 * 1. startPositionTracking
 *     Inicia o rastreamento contínuo (watchPosition).
 */
export function startPositionTracking(options = {}) {
  const {
    enableHighAccuracy = true,
    maximumAge = 10000,
    timeout = 15000,
  } = options;

  if (!trackingActive) {
    console.warn('[startPositionTracking] trackingActive=false, abortando...');
    return;
  }

  if (!('geolocation' in navigator)) {
    console.warn('[startPositionTracking] Geolocalização não suportada.');
    return;
  }

  if (watchId !== null) {
    console.log('[startPositionTracking] Limpando watch anterior.');
    navigator.geolocation.clearWatch(watchId);
    watchId = null;
  }

  watchId = navigator.geolocation.watchPosition(
    (position) => {
      userPosition = {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
        accuracy: position.coords.accuracy,
      };
      console.log('[startPositionTracking] Posição atualizada:', userPosition);
    },
    (error) => {
      console.error('[startPositionTracking] Erro:', error);
      showNotification('Não foi possível obter localização.', 'error');
      fallbackToSensorNavigation(); // Ativa fallback
    },
    { enableHighAccuracy, maximumAge, timeout }
  );

  console.log(
    '[startPositionTracking] watchPosition iniciado. watchId =',
    watchId
  );
}

/**
 * 3. updateMapWithUserLocation
 *     Atualiza a visualização do mapa com a localização do usuário.
 */
export function updateMapWithUserLocation(zoomLevel = 18) {
  if (!userLocation || !map) {
    console.warn('Localização ou mapa indisponível.');
    return;
  }
  map.setView([userLocation.latitude, userLocation.longitude], zoomLevel);
  console.log(
    'Mapa atualizado para a localização do usuário, zoom:',
    zoomLevel
  );
}

/**
 * 4. detectMotion
 *     Detecta movimento do dispositivo (usando devicemotion).
 */
export function detectMotion() {
  if ('DeviceMotionEvent' in window) {
    window.addEventListener('devicemotion', (event) => {
      const acc = event.acceleration;
      if (acc.x > 5 || acc.y > 5 || acc.z > 5) {
        console.log('Movimento brusco detectado!');
      }
    });
  } else {
    console.warn('DeviceMotionEvent não suportado.');
  }
} /*

  --- 10.3. Atualização de Marcadores ---

/**
 * 1. updateUserMarker
 /**
 * updateUserMarker(lat, lon, heading, accuracy, iconSize)
 * Atualiza ou cria o marker do usuário com animação e rotação.
 * A função atualiza a rotação do ícone e chama setMapRotation para sincronizar a camada de tiles.
 */
export function updateUserMarker(lat, lon, heading, accuracy, iconSize) {
  console.log(
    `[updateUserMarker] Atualizando posição para: (${lat}, ${lon}) com heading: ${heading} e precisão: ${accuracy}`
  );
  // Se a precisão for baixa (acima de 15m), ignora a atualização
  if (accuracy !== undefined && accuracy > 15) {
    console.log('[updateUserMarker] Precisão GPS baixa. Atualização ignorada.');
    return;
  }
  // Se houver uma posição anterior, calcula a distância para evitar atualizações insignificantes
  if (window.lastPosition) {
    const distance = calculateDistance(
      window.lastPosition.lat,
      window.lastPosition.lon,
      lat,
      lon
    );
    if (distance < 1) {
      console.log(
        '[updateUserMarker] Movimento insignificante. Atualização ignorada.'
      );
      return;
    }
  }
  window.lastPosition = { lat, lon };

  // Se existir um destino (routeDestination), recalcula o heading (rumo) para o destino
  if (window.routeDestination) {
    heading = computeBearing(
      lat,
      lon,
      window.routeDestination.lat,
      window.routeDestination.lon
    );
  } else if (heading === undefined) {
    heading = 0;
  }

  // Define o HTML para o ícone do marcador (usando Font Awesome)
  const iconHtml = '<i class="fas fa-location-arrow"></i>';
  const finalIconSize = iconSize || [60, 60];
  const finalIconAnchor = [finalIconSize[0] / 2, finalIconSize[1]];

  // Se já existir um marcador, anima sua transição; caso contrário, cria-o
  if (window.userMarker) {
    const currentPos = window.userMarker.getLatLng();
    animateMarker(window.userMarker, currentPos, [lat, lon], 300);
    if (window.userMarker._icon) {
      window.userMarker._icon.style.transform = `rotate(${heading}deg)`;
    }
  } else {
    window.userMarker = L.marker([lat, lon], {
      icon: L.divIcon({
        className: 'user-marker',
        html: iconHtml,
        iconSize: finalIconSize,
        iconAnchor: finalIconAnchor,
      }),
    }).addTo(map);
    if (window.userMarker._icon) {
      window.userMarker._icon.style.transform = `rotate(${heading}deg)`;
    }
  }
  // Atualiza ou cria um círculo que indica a margem de erro do GPS
  if (accuracy !== undefined) {
    if (window.userAccuracyCircle) {
      window.userAccuracyCircle.setLatLng([lat, lon]);
      window.userAccuracyCircle.setRadius(accuracy);
    } else {
      window.userAccuracyCircle = L.circle([lat, lon], {
        radius: accuracy,
        className: 'gps-accuracy-circle',
      }).addTo(map);
    }
  }
  // Se houver função de rotação, inicia a rotação automática
  if (typeof setMapRotation === 'function') {
    startRotationAuto();
  }
}
/*
 * 3. updateUserPositionOnRoute
 *     Atualiza a posição do usuário na rota ativa.
 */
export function updateUserPositionOnRoute(userLat, userLon, destLat, destLon) {
  const distance = calculateDistance(userLat, userLon, destLat, destLon);
  if (distance === null) {
    showNotification(
      'Erro ao calcular a distância. Verifique os dados.',
      'error'
    );
    return;
  }
  console.log(`Distância do usuário ao destino: ${distance} metros.`);
  // Recalcula apenas se o usuário estiver fora do buffer e após 5 segundos
  const now = Date.now();
  if (distance > 100 && now - lastRecalculationTime > 5000) {
    console.log('Usuário fora da rota. Iniciando recalculo...');
    showNotification('Recalculando a rota devido a desvio...', 'info');
    createRoute(destLat, destLon);
    lastRecalculationTime = now;
  }
  if (distance < 50) {
    console.log('Usuário chegou ao destino.');
    endNavigation();
  }
} /*

  --- 10.4. Finalização do Rastreamento ---
/**
 * 1. stopPositionTracking
 *    Encerra o rastreamento de posição. */
export function stopPositionTracking() {
  if (navigationWatchId !== null) {
    navigator.geolocation.clearWatch(navigationWatchId);
    navigationWatchId = null;
    console.log('Rastreamento encerrado.');
  }
  userCurrentLocation = null;
  trackingActive = false;
}
