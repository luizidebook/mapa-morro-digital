// Importações necessárias
import { showNotification } from '../ui/notifications.js';
import { calculateDistance, createRoute } from '../navigation/route.js';
import { endNavigation } from '../navigation/navigation-control.js';
import { getGeneralText } from '../ui/texts.js';
import { navigationState } from '../core/varGlobal.js';
import { setMapRotation } from '../map/map-core.js';
import { map } from '../map/map-core.js';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Variáveis globais
let lastRecalculationTime = 0; // Controle de tempo para recalcular rota
let smoothedPosition = null; // Última posição suavizada
const SMOOTHING_ALPHA = 0.2; // Fator de suavização

// Função: Obtém a localização atual do usuário
export function getCurrentLocation(options = {}) {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      showNotification(
        'Geolocalização não é suportada pelo navegador.',
        'error'
      );
      reject(new Error('Geolocalização não suportada.'));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude, accuracy } = position.coords;
        resolve({ latitude, longitude, accuracy });
      },
      (error) => {
        console.error('Erro ao obter localização:', error);
        reject(error);
      },
      options
    );
  });
}

// Função: Usa a localização atual do usuário para centralizar o mapa
export function useCurrentLocation() {
  getCurrentLocation()
    .then(({ latitude, longitude }) => {
      updateUserMarker(latitude, longitude);
      console.log('Localização atual usada:', { latitude, longitude });
    })
    .catch((error) => {
      console.error('Erro ao usar localização atual:', error);
    });
}

// Função: Inicializa o rastreamento contínuo da localização
export function initContinuousLocationTracking() {
  if (!navigator.geolocation) {
    showNotification('Geolocalização não é suportada pelo navegador.', 'error');
    return;
  }

  const watchId = navigator.geolocation.watchPosition(
    (position) => {
      const { latitude, longitude, heading, accuracy } = position.coords;
      updateUserMarker(latitude, longitude, heading, accuracy);
    },
    (error) => {
      console.error('Erro no rastreamento contínuo:', error);
    },
    { enableHighAccuracy: true }
  );

  console.log('Rastreamento contínuo iniciado. Watch ID:', watchId);
  return watchId;
}

// Função: Atualiza ou cria o marcador do usuário no mapa
export function updateUserMarker(lat, lon, heading, accuracy) {
  console.log(
    `[updateUserMarker] Atualizando posição para (${lat}, ${lon}) com heading: ${heading}°`
  );

  if (accuracy !== undefined && accuracy > 20) {
    console.log(
      `[updateUserMarker] Precisão baixa (${accuracy}m), atualização pode ser menos agressiva.`
    );
  }

  if (window.userMarker) {
    window.userMarker.setLatLng([lat, lon]);
    if (typeof window.userMarker.setRotationAngle === 'function') {
      window.userMarker.setRotationAngle(heading);
    } else if (window.userMarker._icon) {
      window.userMarker._icon.style.transformOrigin = '50% 50%';
      window.userMarker._icon.style.transform = `rotate(${heading}deg)`;
    }
  } else {
    const iconHtml = '<i class="fas fa-location-arrow"></i>';
    window.userMarker = L.marker([lat, lon], {
      icon: L.divIcon({
        className: 'user-marker',
        html: iconHtml,
        iconSize: [50, 50],
        iconAnchor: [25, 25],
      }),
      rotationAngle: heading,
    }).addTo(map);
  }

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
}

// Função: Aplica suavização às coordenadas de geolocalização
export function applyCoordinateSmoothing(newCoord) {
  if (
    !newCoord ||
    typeof newCoord.latitude !== 'number' ||
    typeof newCoord.longitude !== 'number'
  ) {
    return smoothedPosition;
  }

  if (smoothedPosition === null) {
    smoothedPosition = { ...newCoord };
  } else {
    smoothedPosition.latitude =
      SMOOTHING_ALPHA * newCoord.latitude +
      (1 - SMOOTHING_ALPHA) * smoothedPosition.latitude;
    smoothedPosition.longitude =
      SMOOTHING_ALPHA * newCoord.longitude +
      (1 - SMOOTHING_ALPHA) * smoothedPosition.longitude;
  }
  return smoothedPosition;
}

// Função: Atualiza a posição do usuário na rota ativa
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
    console.log('Usuário fora da rota. Iniciando recalculo...');
    showNotification('Recalculando a rota devido a desvio...', 'info');
    createRoute(destLat, destLon);
    lastRecalculationTime = now;
  }

  if (distance < 50) {
    console.log('Usuário chegou ao destino.');
    endNavigation();
  }
}

export function onDeviceOrientationChange(event) {
  const alpha = event.alpha; // tipicamente 0-360
  if (typeof alpha === 'number' && !isNaN(alpha)) {
    // Ajusta rotação do mapa
    setMapRotation(alpha);
  }
}

/**
 * autoRotationAuto
 *
 * Atualiza a visualização do mapa para centralizar na localização atual do usuário e
 * inicia o processo de rotação automática da camada de tiles.
 *
 * Fluxo:
 * 1. Verifica se a variável global userLocation está definida.
 * 2. Chama updateMapWithUserLocation para reposicionar o mapa com base nas coordenadas reais.
 * 3. Se a propriedade heading estiver disponível em userLocation, aplica a rotação inicial
 *    usando setMapRotation. Isso garante que, logo no início, o mapa seja rotacionado
 *    de acordo com o heading atual do usuário.
 * 4. Chama startRotationAuto para ativar os eventos de deviceorientation, permitindo
 *    que o mapa atualize continuamente a rotação com base nas leituras do dispositivo.
 */
export function startRotationAuto() {
  console.log(
    '[startRotationAuto] Tentando ativar rotação automática do mapa...'
  );

  // Habilita a flag no navigationState (caso usemos em setMapRotation)
  if (navigationState) {
    navigationState.isRotationEnabled = true;
  }

  // Verifica se o dispositivo/navegador suportam DeviceOrientationEvent
  if (typeof DeviceOrientationEvent === 'undefined') {
    console.warn("[startRotationAuto] 'DeviceOrientationEvent' não suportado.");
    showNotification(
      'Rotação automática não suportada neste dispositivo.',
      'warning'
    );
    return;
  }

  // iOS >= 13 precisa de permissão
  if (
    DeviceOrientationEvent.requestPermission &&
    typeof DeviceOrientationEvent.requestPermission === 'function'
  ) {
    DeviceOrientationEvent.requestPermission()
      .then((response) => {
        if (response === 'granted') {
          console.log('[startRotationAuto] Permissão concedida para heading.');
          attachOrientationListener();
        } else {
          console.warn('[startRotationAuto] Permissão negada para heading.');
          showNotification('Rotação automática não autorizada.', 'warning');
        }
      })
      .catch((err) => {
        console.error('[startRotationAuto] Erro ao solicitar permissão:', err);
        showNotification(
          'Não foi possível ativar rotação automática.',
          'error'
        );
      });
  } else {
    // Se não exigir permissão, adiciona o listener diretamente
    attachOrientationListener();
  }

  function attachOrientationListener() {
    // Evita adicionar múltiplos listeners
    window.removeEventListener(
      'deviceorientation',
      onDeviceOrientationChange,
      true
    );
    window.addEventListener(
      'deviceorientation',
      onDeviceOrientationChange,
      true
    );
    console.log(
      "[startRotationAuto] Evento 'deviceorientation' registrado com sucesso."
    );
  }
}

/**
 * 3. pauseNavigation
 *     Pausa a navegação.
 */
export function pauseNavigation() {
  if (!navigationState.isActive) {
    console.warn('Navegação não está ativa para pausar.');
    return;
  }
  if (navigationState.isPaused) {
    console.log('Navegação já está pausada.');
    return;
  }
  navigationState.isPaused = true;
  if (window.positionWatcher) {
    navigator.geolocation.clearWatch(window.positionWatcher);
    window.positionWatcher = null;
  }
  showNotification(getGeneralText('navPaused', navigationState.lang), 'info');
  console.log('Navegação pausada.');
}
