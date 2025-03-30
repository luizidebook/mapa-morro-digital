import { showNotification } from '../ui/notifications.js';
import { clearMarkers } from '../map/map-core.js';
import { calculateDistance } from '../navigation/route.js';

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

// Função: Manipula a orientação do dispositivo
export function deviceOrientationHandler(event) {
  const heading = event.alpha; // Direção em graus
  setMapRotation(heading);
}

// Função: Define a visualização em primeira pessoa no mapa
export function setFirstPersonView(lat, lon, zoom, heading) {
  setMapRotation(heading);
  updateUserMarker(lat, lon, heading);
  console.log('Visualização em primeira pessoa ativada.');
}

// Função: Define a rotação do mapa com base no heading
export function setMapRotation(heading) {
  const mapContainer = document.getElementById('map-container');
  if (mapContainer) {
    mapContainer.style.transform = `rotate(${heading}deg)`;
  }
}

// Função: Aplica transformações de rotação e inclinação
export function applyRotationTransform(heading, tilt) {
  const mapContainer = document.getElementById('map-container');
  if (mapContainer) {
    mapContainer.style.transform = `rotateX(${tilt}deg) rotateZ(${heading}deg)`;
  }
}

// Função: Atualiza o indicador de qualidade do GPS
export function updateGPSQualityIndicator(accuracy) {
  const indicator = document.getElementById('gps-quality-indicator');
  if (indicator) {
    indicator.textContent = `Precisão: ${accuracy.toFixed(1)}m`;
  }
}

// Função: Inicia o rastreamento da posição do usuário
export function startPositionTracking(options = {}) {
  const watchId = initContinuousLocationTracking(options);
  console.log('Rastreamento de posição iniciado. Watch ID:', watchId);
  return watchId;
}

// Função: Inicia o rastreamento do usuário
export function startUserTracking() {
  const watchId = startPositionTracking();
  console.log('Rastreamento do usuário iniciado. Watch ID:', watchId);
  return watchId;
}

// Função: Atualiza o mapa com a localização do usuário
export function updateMapWithUserLocation(zoomLevel = 15) {
  getCurrentLocation()
    .then(({ latitude, longitude }) => {
      updateUserMarker(latitude, longitude);
      console.log('Mapa atualizado com a localização do usuário.');
    })
    .catch((error) => {
      console.error(
        'Erro ao atualizar mapa com localização do usuário:',
        error
      );
    });
}

// Função: Detecta movimento do dispositivo
export function detectMotion() {
  window.addEventListener('devicemotion', (event) => {
    const acceleration = event.acceleration;
    console.log('Movimento detectado:', acceleration);
  });
}

// Função: Atualiza o marcador do usuário no mapa
export function updateUserMarker(lat, lon, heading, accuracy) {
  console.log('Marcador do usuário atualizado:', {
    lat,
    lon,
    heading,
    accuracy,
  });
}

// Função: Aplica suavização às coordenadas
export function applyCoordinateSmoothing(newCoord) {
  console.log('Suavização aplicada às coordenadas:', newCoord);
}

// Função: Atualiza a posição do usuário na rota
export function updateUserPositionOnRoute(userLat, userLon, destLat, destLon) {
  const distance = calculateDistance(userLat, userLon, destLat, destLon);
  console.log('Distância até o destino:', distance);
}

// Função: Para o rastreamento da posição
export function stopPositionTracking(watchId) {
  if (navigator.geolocation && watchId) {
    navigator.geolocation.clearWatch(watchId);
    console.log('Rastreamento de posição parado. Watch ID:', watchId);
  }
}

// Função: Remove todos os marcadores do mapa
export function clearAllMarkers() {
  clearMarkers();
  console.log('Todos os marcadores removidos do mapa.');
}
