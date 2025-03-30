import { appState } from '../core/state.js';
import { eventBus, EVENT_TYPES } from '../core/eventBus.js';
import { MAP_CONFIG, UI_CONFIG } from '../core/config.js';
import { showError } from '../ui/notifications.js';
import { isMobile, debounce } from '../utils/helpers.js';

/**
 * Módulo core do mapa
 * Responsável pela inicialização e funções básicas do mapa
 */

/**
 * Inicializa o mapa Leaflet
 * @param {string} containerId - ID do elemento que conterá o mapa
 * @param {Object} options - Opções de inicialização do mapa
 * @returns {Object} Instância do mapa Leaflet
 */
export function initializeMap(containerId = 'map', options = {}) {
  try {
    // Verificar se o container existe
    const mapContainer = document.getElementById(containerId);
    if (!mapContainer) {
      throw new Error(`Container do mapa #${containerId} não encontrado`);
    }

    // Configurações padrão do mapa
    const defaultOptions = {
      center: [MAP_CONFIG.DEFAULT_CENTER.lat, MAP_CONFIG.DEFAULT_CENTER.lon],
      zoom: MAP_CONFIG.DEFAULT_ZOOM,
      minZoom: MAP_CONFIG.MIN_ZOOM,
      maxZoom: MAP_CONFIG.MAX_ZOOM,
      zoomControl: false, // Desabilitamos o controle padrão de zoom para usar nosso próprio
      attributionControl: true,
      closePopupOnClick: false,
      preferCanvas: true, // Melhor desempenho em dispositivos móveis
    };

    // Mesclar opções padrão com opções fornecidas
    const mapOptions = { ...defaultOptions, ...options };

    // Criar instância do mapa
    const map = L.map(containerId, mapOptions);

    // Adicionar camada de tiles padrão
    const tileLayer = getTileLayer();
    tileLayer.addTo(map);

    // Armazenar referências no estado da aplicação
    appState.set('map.instance', map);
    appState.set('map.center', {
      lat: mapOptions.center[0],
      lon: mapOptions.center[1],
    });
    appState.set('map.zoom', mapOptions.zoom);

    // Configurar handlers de eventos do mapa
    setupMapEventHandlers(map);

    // Evento de mapa inicializado
    eventBus.publish(EVENT_TYPES.MAP_INITIALIZED, { map });

    return map;
  } catch (error) {
    console.error('Erro ao inicializar o mapa:', error);
    showError('Erro ao inicializar o mapa. Por favor, recarregue a página.');
    return null;
  }
}

/**
 * Obtém a camada de tiles adequada com base nas configurações
 * @param {string} [style='streets'] - Estilo do mapa ('streets' ou 'satellite')
 * @returns {Object} Camada de tiles Leaflet
 */
export function getTileLayer(style = 'streets') {
  const isDarkMode = appState.get('config.isDarkMode');
  const tileLayerConfig =
    style === 'satellite'
      ? MAP_CONFIG.TILE_LAYERS.SATELLITE
      : MAP_CONFIG.TILE_LAYERS.STREETS;

  const tileLayer = L.tileLayer(tileLayerConfig.url, {
    attribution: tileLayerConfig.attribution,
    maxZoom: tileLayerConfig.maxZoom,
    // Adiciona classe CSS para tema escuro se necessário
    className: isDarkMode ? 'dark-tiles' : '',
  });

  return tileLayer;
}

/**
 * Configura handlers para eventos do mapa
 * @param {Object} map - Instância do mapa Leaflet
 */
function setupMapEventHandlers(map) {
  // Evento de movimentação do mapa
  map.on('moveend', () => {
    const center = map.getCenter();
    appState.set('map.center', {
      lat: center.lat,
      lon: center.lng,
    });
  });

  // Evento de mudança de zoom
  map.on('zoomend', () => {
    appState.set('map.zoom', map.getZoom());
  });

  // Atualizar mapa quando mudar o tema
  eventBus.subscribe(EVENT_TYPES.THEME_CHANGED, ({ isDarkMode }) => {
    updateMapTheme(map, isDarkMode);
  });

  // Manipular redimensionamento da janela (debounce para performance)
  const handleResize = debounce(() => {
    map.invalidateSize();
  }, 200);

  window.addEventListener('resize', handleResize);
}

/**
 * Atualiza o tema do mapa (claro/escuro)
 * @param {Object} map - Instância do mapa Leaflet
 * @param {boolean} isDarkMode - Se true, aplica o tema escuro
 */
export function updateMapTheme(map, isDarkMode) {
  // Atualizar classes do container do mapa
  const mapContainer = map.getContainer();

  if (isDarkMode) {
    mapContainer.classList.add('dark-theme-map');
  } else {
    mapContainer.classList.remove('dark-theme-map');
  }

  // Recarregar camada de tiles com a classe apropriada
  map.eachLayer((layer) => {
    if (layer instanceof L.TileLayer) {
      const url = layer._url; // URL atual

      // Remover a camada atual
      map.removeLayer(layer);

      // Adicionar nova camada com a mesma URL mas com classe atualizada
      const newLayer = L.tileLayer(url, {
        attribution: layer.options.attribution,
        maxZoom: layer.options.maxZoom,
        className: isDarkMode ? 'dark-tiles' : '',
      });

      newLayer.addTo(map);
    }
  });
}

/**
 * Centraliza o mapa em uma localização específica
 * @param {number} lat - Latitude
 * @param {number} lon - Longitude
 * @param {number} [zoom] - Nível de zoom (se omitido, mantém o zoom atual)
 * @param {Object} [options] - Opções adicionais
 */
export function centerMap(lat, lon, zoom = null, options = {}) {
  const map = appState.get('map.instance');
  if (!map) return;

  const zoomLevel = zoom !== null ? zoom : map.getZoom();

  // Opções padrão de animação
  const defaultOptions = {
    animate: true,
    duration: 0.5,
    easeLinearity: 0.25,
    noMoveStart: true,
  };

  // Mesclar opções
  const moveOptions = { ...defaultOptions, ...options };

  // Se for um dispositivo móvel, adicionar um pequeno deslocamento para melhor visibilidade
  if (isMobile() && options.offsetYPercent) {
    // Obter o tamanho do mapa em pixels
    const mapHeight = map.getContainer().clientHeight;

    // Calcular o deslocamento em coordenadas
    const offsetY = (options.offsetYPercent * mapHeight) / 100;
    const point = map.latLngToContainerPoint([lat, lon]);
    const newPoint = L.point(point.x, point.y - offsetY);
    const newLatLng = map.containerPointToLatLng(newPoint);

    map.setView([newLatLng.lat, newLatLng.lng], zoomLevel, moveOptions);
  } else {
    map.setView([lat, lon], zoomLevel, moveOptions);
  }

  // Atualizar estado
  appState.set('map.center', { lat, lon });
  if (zoom !== null) {
    appState.set('map.zoom', zoom);
  }
}

/**
 * Ajusta o mapa para uma localização com detalhes
 * @param {number} lat - Latitude
 * @param {number} lon - Longitude
 * @param {string} name - Nome do local
 * @param {string} description - Descrição do local
 * @param {number} [zoom=17] - Nível de zoom
 * @param {number} [offsetYPercent=30] - Percentual de deslocamento vertical
 */
export function adjustMapWithLocation(
  lat,
  lon,
  name,
  description,
  zoom = 17,
  offsetYPercent = 30
) {
  const map = appState.get('map.instance');
  if (!map) return;

  // Centralizar mapa na localização com offset
  centerMap(lat, lon, zoom, { offsetYPercent });

  // Publicar evento para outros módulos reagirem
  eventBus.publish(EVENT_TYPES.MAP_LOCATION_SELECTED, {
    lat,
    lon,
    name,
    description,
    zoom,
  });
}

/**
 * Habilita ou desabilita a interação com o mapa
 * @param {boolean} enable - Se true, habilita interação; se false, desabilita
 */
export function setMapInteraction(enable) {
  const map = appState.get('map.instance');
  if (!map) return;

  if (enable) {
    map.dragging.enable();
    map.touchZoom.enable();
    map.doubleClickZoom.enable();
    map.scrollWheelZoom.enable();
    map.boxZoom.enable();
    map.keyboard.enable();
    if (map.tap) map.tap.enable();
  } else {
    map.dragging.disable();
    map.touchZoom.disable();
    map.doubleClickZoom.disable();
    map.scrollWheelZoom.disable();
    map.boxZoom.disable();
    map.keyboard.disable();
    if (map.tap) map.tap.disable();
  }

  // Atualizar estado
  appState.set('map.interaction.enabled', enable);
}

/**
 * Limpa todas as camadas do mapa, exceto a camada base de tiles
 * @param {Function} [filter] - Função opcional para filtrar quais camadas devem ser removidas
 */
export function clearMapLayers(filter = null) {
  const map = appState.get('map.instance');
  if (!map) return;

  map.eachLayer((layer) => {
    // Não remover a camada base de tiles
    if (layer instanceof L.TileLayer) return;

    // Se houver filtro, aplicá-lo
    if (filter && !filter(layer)) return;

    // Remover a camada
    map.removeLayer(layer);
  });

  // Limpar referências no estado
  appState.set('map.layers.currentRoute', null);
  appState.set('map.layers.alternatives', []);
}

/**
 * Adiciona um botão de zoom customizado ao mapa
 * @param {string} position - Posição do controle ('topleft', 'topright', 'bottomleft', 'bottomright')
 */
export function addCustomZoomControl(position = 'bottomright') {
  const map = appState.get('map.instance');
  if (!map) return;

  // Criar controle de zoom customizado
  const zoomControl = L.control.zoom({
    position,
    zoomInTitle: 'Aumentar zoom',
    zoomOutTitle: 'Diminuir zoom',
  });

  zoomControl.addTo(map);
}

/**
 * Obtém a instância atual do mapa
 * @returns {Object|null} Instância do mapa Leaflet ou null se não inicializado
 */
export function getMap() {
  return appState.get('map.instance');
}

/**
 * Obtém a posição atual do centro do mapa
 * @returns {Object} Objeto {lat, lon}
 */
export function getMapCenter() {
  const map = appState.get('map.instance');
  if (!map) return MAP_CONFIG.DEFAULT_CENTER;

  const center = map.getCenter();
  return { lat: center.lat, lon: center.lng };
}

/**
 * Obtém o nível de zoom atual do mapa
 * @returns {number} Nível de zoom
 */
export function getMapZoom() {
  const map = appState.get('map.instance');
  if (!map) return MAP_CONFIG.DEFAULT_ZOOM;

  return map.getZoom();
}

/**
 * Restaura a visualização padrão do mapa
 */
export function resetMapView() {
  centerMap(
    MAP_CONFIG.DEFAULT_CENTER.lat,
    MAP_CONFIG.DEFAULT_CENTER.lon,
    MAP_CONFIG.DEFAULT_ZOOM
  );
}

// Exportar funções
export default {
  initializeMap,
  getTileLayer,
  centerMap,
  adjustMapWithLocation,
  setMapInteraction,
  clearMapLayers,
  addCustomZoomControl,
  getMap,
  getMapCenter,
  getMapZoom,
  resetMapView,
  updateMapTheme,
};
