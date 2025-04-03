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
// Exemplo de chaves e constantes

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
import { map } from '../map/map.js';
export let userLocation = null; // Última localização conhecida do usuário (atualizada pelo GPS)
export let trackingActive = false;
export let watchId = null;
export let userPosition = null;
export let lastRecalculationTime = 0;
// Variável global para o ID do watchPosition (armazenada na propriedade window.positionWatcher)
export let positionWatcher = null;
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
  options = { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
) {
  console.log('[getCurrentLocation] Solicitando posição atual...');

  if (!('geolocation' in navigator)) {
    showNotification('Geolocalização não suportada pelo navegador.', 'error');
    return null;
  }

  try {
    const position = await new Promise((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(resolve, reject, options);
    });

    const { latitude, longitude, accuracy } = position.coords;
    userLocation = { latitude, longitude, accuracy };
    console.log('[getCurrentLocation] Localização obtida:', userLocation);

    return userLocation;
  } catch (error) {
    console.error('[getCurrentLocation] Erro ao obter localização:', error);
    showNotification(
      'Erro ao obter localização. Verifique as permissões.',
      'error'
    );
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
export function startPositionTracking(
  options = { enableHighAccuracy: true, maximumAge: 0, timeout: 15000 }
) {
  console.log('[startPositionTracking] Iniciando rastreamento contínuo...');

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
      const { latitude, longitude, accuracy } = position.coords;

      // Ignora atualizações com baixa precisão
      if (accuracy > 20) {
        console.warn(
          '[startPositionTracking] Precisão baixa. Atualização ignorada.'
        );
        return;
      }

      // Atualiza apenas se houver uma mudança significativa na posição
      if (userPosition) {
        const distance = calculateDistance(
          userPosition.latitude,
          userPosition.longitude,
          latitude,
          longitude
        );
        if (distance < 5) {
          console.log(
            '[startPositionTracking] Movimento insignificante. Atualização ignorada.'
          );
          return;
        }
      }

      userPosition = { latitude, longitude, accuracy };
      console.log('[startPositionTracking] Posição atualizada:', userPosition);

      // Atualiza o mapa com a nova posição
      updateMapWithUserLocation();
    },
    (error) => {
      console.error(
        '[startPositionTracking] Erro ao rastrear localização:',
        error
      );
      showNotification('Erro ao rastrear localização.', 'error');
    },
    options
  );

  console.log(
    '[startPositionTracking] Rastreamento contínuo iniciado. watchId =',
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
}

/**
 * 5. detectMotionAndOrientation
 *     Detecta movimento e orientação do dispositivo.
 */
export function detectMotionAndOrientation() {
  if ('DeviceMotionEvent' in window) {
    window.addEventListener('devicemotion', (event) => {
      const { x, y, z } = event.acceleration;
      if (x > 5 || y > 5 || z > 5) {
        console.log('[detectMotionAndOrientation] Movimento detectado:', {
          x,
          y,
          z,
        });
      }
    });
  } else {
    console.warn('[detectMotionAndOrientation] Acelerômetro não suportado.');
  }

  if ('DeviceOrientationEvent' in window) {
    window.addEventListener('deviceorientation', (event) => {
      const { alpha, beta, gamma } = event;
      console.log('[detectMotionAndOrientation] Orientação detectada:', {
        alpha,
        beta,
        gamma,
      });
      setMapRotation(alpha); // Ajusta a rotação do mapa com base na orientação
    });
  } else {
    console.warn('[detectMotionAndOrientation] Giroscópio não suportado.');
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

  const now = Date.now();
  if (distance > 100 && now - lastRecalculationTime > 5000) {
    console.log(
      '[updateUserPositionOnRoute] Usuário fora da rota. Recalculando...'
    );
    showNotification('Recalculando a rota devido a desvio...', 'info');
    createRoute(destLat, destLon);
    lastRecalculationTime = now;
  }

  if (distance < 50) {
    console.log('[updateUserPositionOnRoute] Usuário chegou ao destino.');
    endNavigation();
  }
}

export function notifyUser(message, type = 'info') {
  showNotification(message, type);
  console.log(`[notifyUser] ${type.toUpperCase()}: ${message}`);
}

/*
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
