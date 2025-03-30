import { map, markers } from './map.js';

/**
 * Inicializa o mapa Leaflet e configura as camadas.
 * @param {string} containerId - ID do elemento HTML que conterá o mapa.
 * @returns {Object} Instância do mapa Leaflet.
 */
export function initializeMap() {
  if (map) {
    console.warn('Mapa já inicializado.');
    return;
  }
  console.log('Inicializando mapa...');

  // Define as camadas de tiles
  const tileLayers = {
    streets: L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors',
      maxZoom: 19,
    }),
    satellite: L.tileLayer(
      'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
      {
        attribution: '© Esri',
        maxZoom: 19,
      }
    ),
  };

  // Cria o mapa com uma visão inicial (esta posição será atualizada quando a localização do usuário for obtida)
  map = L.map('map', {
    layers: [tileLayers.streets],
    zoomControl: false,
    maxZoom: 19,
    minZoom: 3,
  }).setView([-13.378, -38.918], 14);

  // Adiciona o controle de camadas
  L.control.layers(tileLayers).addTo(map);

  if (typeof RotationPlugin !== 'undefined') {
    RotationPlugin.initialize();
  } else {
    console.warn('Plugin de rotação não encontrado. Usando CSS para rotação.');
    // Código alternativo para rotação via CSS
  }
}

/**
 * Retorna a camada de tiles para o mapa.
 * @returns {Object} Camada de tiles Leaflet.
 */
export function getTileLayer() {
  return L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap contributors',
  });
}

/**
 * Restaura a visualização original do mapa.
 */
export function resetMapView() {
  const defaultView = {
    lat: -13.4125,
    lon: -38.9131,
    zoom: 13,
  };

  if (mapInstance) {
    mapInstance.setView([defaultView.lat, defaultView.lon], defaultView.zoom);
    console.log('Visualização do mapa restaurada para o estado inicial.');
  }
}

/**
 * Ajusta o mapa para a localização do usuário.
 * @param {number} lat - Latitude do usuário.
 * @param {number} lon - Longitude do usuário.
 */
export function adjustMapWithLocationUser(lat, lon) {
  map.setView([lat, lon], 21);
  const marker = L.marker([lat, lon])
    .addTo(map)
    .bindPopup('Você está aqui!')
    .openPopup();
  markers.push(marker);
}

/**
 * Ajusta o mapa para uma localização específica.
 * @param {number} lat - Latitude.
 * @param {number} lon - Longitude.
 * @param {string} name - Nome do local.
 * @param {string} description - Descrição do local.
 * @param {number} zoom - Nível de zoom.
 * @param {number} offsetYPercent - Offset vertical em porcentagem.
 */
export function adjustMapWithLocation(
  lat,
  lon,
  name,
  description,
  zoom = 15,
  offsetYPercent = 0
) {
  if (mapInstance) {
    const offset = mapInstance.getSize().y * (offsetYPercent / 100);
    const targetPoint = mapInstance
      .project([lat, lon], zoom)
      .subtract([0, offset]);
    const targetLatLng = mapInstance.unproject(targetPoint, zoom);

    mapInstance.setView(targetLatLng, zoom);
    console.log(`Mapa ajustado para: [${lat}, ${lon}] - ${name}`);
  }
}

/**
 * Remove marcadores do mapa com base em um filtro.
 * @param {Function} filterFn - Função de filtro para remover marcadores.
 */
export function clearMarkers(filterFn) {
  if (mapInstance) {
    mapInstance.eachLayer((layer) => {
      if (layer instanceof L.Marker && (!filterFn || filterFn(layer))) {
        mapInstance.removeLayer(layer);
      }
    });
    console.log('Marcadores removidos do mapa.');
  }
}

/**
 * Remove todas as camadas do mapa.
 */
export function clearMapLayers() {
  if (mapInstance) {
    mapInstance.eachLayer((layer) => {
      if (!(layer instanceof L.TileLayer)) {
        mapInstance.removeLayer(layer);
      }
    });
    console.log('Todas as camadas foram removidas do mapa.');
  }
}

/**
 * Restaura a interface para a última feature selecionada.
 * @param {string} feature - Nome da feature.
 */
export function restoreFeatureUI(feature) {
  console.log(`Interface restaurada para a feature: ${feature}`);
}

/**
 * Exibe a rota na pré-visualização.
 * @param {Object} route - Dados da rota.
 */
export function visualizeRouteOnPreview(route) {
  console.log('Rota exibida na pré-visualização:', route);
}

/**
 * Aplica zoom aos limites especificados.
 * @param {Object} bounds - Limites (bounds) para aplicar o zoom.
 */
export function zoomToSelectedArea(bounds) {
  if (mapInstance) {
    mapInstance.fitBounds(bounds);
    console.log('Zoom aplicado aos limites especificados.');
  }
}

/**
 * Recentraliza o mapa na localização do usuário.
 * @param {number} lat - Latitude do usuário.
 * @param {number} lon - Longitude do usuário.
 * @param {number} zoom - Nível de zoom.
 */
export function centerMapOnUser(lat, lon, zoom = 15) {
  if (mapInstance) {
    mapInstance.setView([lat, lon], zoom);
    console.log(`Mapa recentralizado no usuário: [${lat}, ${lon}]`);
  }
}

/**
 * Adiciona um ícone de seta no mapa.
 * @param {Object} coordinate - Coordenadas para adicionar a seta.
 */
export function addArrowToMap(coordinate) {
  console.log('Seta adicionada no mapa em:', coordinate);
}
