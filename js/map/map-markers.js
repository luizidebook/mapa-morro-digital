import { appState } from '../core/state.js';
import { eventBus, EVENT_TYPES } from '../core/eventBus.js';
import { getMap } from './map-core.js';
import { smoothCoordinate } from '../utils/helpers.js';
import { calculateDistance } from '../utils/geo.js';
import { translate } from '../i18n/language.js';

/**
 * Módulo de marcadores do mapa
 * Responsável pela criação e gerenciamento de marcadores no mapa
 */

// Cache de ícones para evitar recriar ícones idênticos
const iconCache = new Map();

/**
 * Cria um marcador personalizado e o adiciona ao mapa
 * @param {number} lat - Latitude
 * @param {number} lon - Longitude
 * @param {Object} options - Opções do marcador
 * @returns {Object} Marcador Leaflet
 */
export function createMarker(lat, lon, options = {}) {
  const map = getMap();
  if (!map) return null;

  // Opções padrão
  const defaultOptions = {
    title: '',
    description: '',
    icon: 'default',
    category: '',
    draggable: false,
    clickable: true,
    autoPan: true,
    showPopup: false,
    zIndexOffset: 0,
    id: `marker-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
  };

  // Mesclar opções
  const markerOptions = { ...defaultOptions, ...options };

  // Criar o ícone personalizado
  const icon = getMarkerIcon(markerOptions.icon, markerOptions.category);

  // Criar o marcador
  const marker = L.marker([lat, lon], {
    icon: icon,
    draggable: markerOptions.draggable,
    title: markerOptions.title,
    alt: markerOptions.title,
    zIndexOffset: markerOptions.zIndexOffset,
    riseOnHover: true,
    riseOffset: 250,
  });

  // Armazenar dados personalizados no marcador
  marker.options.id = markerOptions.id;
  marker.options.category = markerOptions.category;
  marker.options.customData = markerOptions.customData || {};

  // Adicionar ao mapa
  marker.addTo(map);

  // Configurar popup se necessário
  if (markerOptions.title || markerOptions.description) {
    const popupContent = createPopupContent(
      markerOptions.title,
      markerOptions.description,
      markerOptions.customData,
      markerOptions.category
    );

    marker.bindPopup(popupContent, {
      closeButton: true,
      autoClose: !markerOptions.keepPopupOpen,
      className: `popup-${markerOptions.category}`,
      maxWidth: 300,
    });

    // Exibir popup automaticamente se solicitado
    if (markerOptions.showPopup) {
      marker.openPopup();
    }
  }

  // Configurar eventos
  setupMarkerEvents(marker, markerOptions);

  // Adicionar ao estado
  const currentMarkers = appState.get('map.markers') || [];
  currentMarkers.push(marker);
  appState.set('map.markers', currentMarkers);

  // Publicar evento
  eventBus.publish(EVENT_TYPES.MARKER_CREATED, {
    id: markerOptions.id,
    lat,
    lon,
    category: markerOptions.category,
    title: markerOptions.title,
  });

  return marker;
}

/**
 * Cria o marcador do usuário e o adiciona ao mapa
 * @param {number} lat - Latitude
 * @param {number} lon - Longitude
 * @param {number} [accuracy=null] - Precisão da localização em metros
 * @param {number} [heading=null] - Direção do usuário em graus
 * @returns {Object} Objeto com marcador e círculo de precisão
 */
export function createUserMarker(lat, lon, accuracy = null, heading = null) {
  const map = getMap();
  if (!map) return null;

  // Remover marcador existente do usuário
  removeUserMarker();

  // Criar ícone personalizado para o usuário
  const userIcon = L.divIcon({
    className: 'user-location-marker',
    html: `
      <div style="
        width: 22px;
        height: 22px;
        background-color: #4285F4;
        border-radius: 50%;
        border: 3px solid white;
        box-shadow: 0 0 5px rgba(0,0,0,0.3);
        position: relative;
        transform: ${heading !== null ? `rotate(${heading}deg)` : ''};
      ">
        ${
          heading !== null
            ? `
          <div style="
            position: absolute;
            top: -6px;
            left: 7px;
            width: 0;
            height: 0;
            border-left: 4px solid transparent;
            border-right: 4px solid transparent;
            border-bottom: 8px solid #4285F4;
            transform: rotate(0deg);
          "></div>
        `
            : ''
        }
      </div>
    `,
    iconSize: [28, 28],
    iconAnchor: [14, 14],
  });

  // Criar marcador do usuário
  const userMarker = L.marker([lat, lon], {
    icon: userIcon,
    zIndexOffset: 1000,
    interactive: false,
  }).addTo(map);

  // Criar círculo de precisão, se fornecido
  let accuracyCircle = null;
  if (accuracy && accuracy > 0) {
    accuracyCircle = L.circle([lat, lon], {
      radius: accuracy,
      className: 'user-location-accuracy-circle',
      interactive: false,
    }).addTo(map);
  }

  // Armazenar no estado
  appState.set('map.layers.userMarker', userMarker);
  appState.set('map.layers.accuracyCircle', accuracyCircle);

  return { marker: userMarker, accuracyCircle };
}

/**
 * Atualiza a posição do marcador do usuário
 * @param {number} lat - Latitude
 * @param {number} lon - Longitude
 * @param {number} [heading=null] - Direção do usuário em graus
 * @param {number} [accuracy=null] - Precisão da localização em metros
 * @param {boolean} [smooth=true] - Se true, suaviza a transição
 */
export function updateUserMarker(
  lat,
  lon,
  heading = null,
  accuracy = null,
  smooth = true
) {
  let userMarker = appState.get('map.layers.userMarker');
  let accuracyCircle = appState.get('map.layers.accuracyCircle');

  // Se não existe, criar novo marcador
  if (!userMarker) {
    const result = createUserMarker(lat, lon, accuracy, heading);
    userMarker = result.marker;
    accuracyCircle = result.accuracyCircle;
    return;
  }

  // Obter posição atual
  const currentPos = userMarker.getLatLng();
  let targetPos = { lat, lon };

  // Aplicar suavização se solicitado
  if (smooth) {
    targetPos = smoothCoordinate(
      { lat: currentPos.lat, lon: currentPos.lng },
      { lat, lon },
      0.3
    );
  }

  // Calcular distância entre posição atual e nova
  const distance = calculateDistance(
    currentPos.lat,
    currentPos.lng,
    targetPos.lat,
    targetPos.lon
  );

  // Atualizar posição do marcador
  userMarker.setLatLng([targetPos.lat, targetPos.lon]);

  // Atualizar rotação se fornecida
  if (heading !== null) {
    const iconElement = userMarker.getElement();
    if (iconElement) {
      const innerDiv = iconElement.querySelector('div');
      if (innerDiv) {
        innerDiv.style.transform = `rotate(${heading}deg)`;
      }
    }
  }

  // Atualizar círculo de precisão
  if (accuracyCircle && accuracy && accuracy > 0) {
    accuracyCircle.setLatLng([targetPos.lat, targetPos.lon]);
    accuracyCircle.setRadius(accuracy);
  } else if (accuracy && accuracy > 0) {
    // Criar novo círculo se não existir
    accuracyCircle = L.circle([targetPos.lat, targetPos.lon], {
      radius: accuracy,
      className: 'user-location-accuracy-circle',
      interactive: false,
    }).addTo(getMap());

    appState.set('map.layers.accuracyCircle', accuracyCircle);
  }

  // Publicar evento apenas se a distância for significativa
  if (distance > 1) {
    eventBus.publish(EVENT_TYPES.USER_LOCATION_UPDATED, {
      lat: targetPos.lat,
      lon: targetPos.lon,
      heading,
      accuracy,
      distance,
    });
  }
}

/**
 * Remove o marcador do usuário do mapa
 */
export function removeUserMarker() {
  const map = getMap();
  if (!map) return;

  const userMarker = appState.get('map.layers.userMarker');
  const accuracyCircle = appState.get('map.layers.accuracyCircle');

  if (userMarker) {
    map.removeLayer(userMarker);
    appState.set('map.layers.userMarker', null);
  }

  if (accuracyCircle) {
    map.removeLayer(accuracyCircle);
    appState.set('map.layers.accuracyCircle', null);
  }
}

/**
 * Cria um marcador de destino
 * @param {number} lat - Latitude
 * @param {number} lon - Longitude
 * @param {string} title - Título do destino
 * @param {Object} [options={}] - Opções adicionais
 * @returns {Object} Marcador Leaflet
 */
export function createDestinationMarker(lat, lon, title, options = {}) {
  // Remover marcador de destino existente
  removeDestinationMarker();

  // Opções padrão para destino
  const destinationOptions = {
    icon: 'destination',
    category: 'destination',
    title: title || translate('destination'),
    description: options.description || '',
    customData: options.customData || {},
    zIndexOffset: 500,
    showPopup: options.showPopup || false,
    id: 'destination-marker',
  };

  // Criar marcador
  const marker = createMarker(lat, lon, destinationOptions);

  // Armazenar no estado
  appState.set('map.layers.destinationMarker', marker);

  // Publicar evento
  eventBus.publish(EVENT_TYPES.DESTINATION_MARKER_CREATED, {
    lat,
    lon,
    title: destinationOptions.title,
  });

  return marker;
}

/**
 * Remove o marcador de destino do mapa
 */
export function removeDestinationMarker() {
  const map = getMap();
  if (!map) return;

  const destinationMarker = appState.get('map.layers.destinationMarker');

  if (destinationMarker) {
    map.removeLayer(destinationMarker);
    appState.set('map.layers.destinationMarker', null);

    // Atualizar lista de marcadores
    const markers = appState.get('map.markers') || [];
    const updatedMarkers = markers.filter(
      (marker) => marker.options.id !== 'destination-marker'
    );

    appState.set('map.markers', updatedMarkers);

    // Publicar evento
    eventBus.publish(EVENT_TYPES.DESTINATION_MARKER_REMOVED);
  }
}

/**
 * Cria marcadores para múltiplos pontos de interesse
 * @param {Array} pois - Array de pontos de interesse
 * @param {string} category - Categoria dos POIs
 * @param {Function} [onClick] - Função de callback para clique
 * @returns {Array} Array de marcadores criados
 */
export function createPOIMarkers(pois, category, onClick = null) {
  if (!pois || !pois.length) return [];

  // Limpar marcadores existentes da mesma categoria
  clearMarkersByCategory(category);

  // Criar marcadores para cada POI
  const markers = pois.map((poi) => {
    const options = {
      icon: category,
      category: category,
      title: poi.name || poi.title || poi.properties?.name || '',
      description: poi.description || poi.properties?.description || '',
      customData: poi,
      showPopup: false,
      id: `${category}-${poi.id || Date.now() + Math.random()}`,
    };

    return createMarker(
      poi.lat ||
        poi.latitude ||
        poi.coordinates?.[1] ||
        poi.geometry?.coordinates[1],
      poi.lon ||
        poi.longitude ||
        poi.coordinates?.[0] ||
        poi.geometry?.coordinates[0],
      options
    );
  });

  // Configurar evento personalizado se fornecido
  if (onClick && typeof onClick === 'function') {
    markers.forEach((marker) => {
      marker.on('click', (e) => {
        onClick(marker.options.customData, marker);
      });
    });
  }

  // Publicar evento
  eventBus.publish(EVENT_TYPES.POI_MARKERS_CREATED, {
    category,
    count: markers.length,
  });

  return markers;
}

/**
 * Limpa todos os marcadores do mapa, exceto os especificados
 * @param {Array} [exclude=[]] - Array de categorias a serem excluídas da limpeza
 */
export function clearMarkers(exclude = []) {
  const map = getMap();
  if (!map) return;

  // Adicionar categorias protegidas por padrão
  const protectedCategories = ['user', 'destination', ...exclude];

  const markers = appState.get('map.markers') || [];
  const updatedMarkers = [];

  markers.forEach((marker) => {
    if (
      marker &&
      marker.options &&
      protectedCategories.includes(marker.options.category)
    ) {
      // Manter este marcador
      updatedMarkers.push(marker);
    } else if (marker && map.hasLayer(marker)) {
      // Remover do mapa
      map.removeLayer(marker);
    }
  });

  // Atualizar estado
  appState.set('map.markers', updatedMarkers);

  // Publicar evento
  eventBus.publish(EVENT_TYPES.MARKERS_CLEARED, {
    excludedCategories: protectedCategories,
  });
}

/**
 * Limpa marcadores de uma categoria específica
 * @param {string} category - Categoria a ser limpa
 */
export function clearMarkersByCategory(category) {
  const map = getMap();
  if (!map || !category) return;

  const markers = appState.get('map.markers') || [];
  const updatedMarkers = [];

  markers.forEach((marker) => {
    if (
      marker &&
      marker.options &&
      marker.options.category === category &&
      map.hasLayer(marker)
    ) {
      // Remover do mapa
      map.removeLayer(marker);
    } else {
      // Manter este marcador
      updatedMarkers.push(marker);
    }
  });

  // Atualizar estado
  appState.set('map.markers', updatedMarkers);

  // Publicar evento
  eventBus.publish(EVENT_TYPES.CATEGORY_MARKERS_CLEARED, { category });
}

/**
 * Obtém ícone para um marcador baseado em seu tipo
 * @param {string} iconType - Tipo de ícone
 * @param {string} [category=''] - Categoria do marcador
 * @returns {Object} Ícone Leaflet
 */
function getMarkerIcon(iconType, category = '') {
  // Verificar cache primeiro
  const cacheKey = `${iconType}-${category}`;
  if (iconCache.has(cacheKey)) {
    return iconCache.get(cacheKey);
  }

  // Configurações padrão
  const defaultIcon = {
    iconUrl: 'img/markers/default-marker.png',
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32],
  };

  // Configurações específicas por tipo
  const iconConfig = {
    default: defaultIcon,
    destination: {
      iconUrl: 'img/markers/destination-marker.png',
      iconSize: [36, 36],
      iconAnchor: [18, 36],
      popupAnchor: [0, -36],
    },
    'pontos-turisticos': {
      iconUrl: 'img/markers/tourist-marker.png',
      iconSize: [32, 32],
      iconAnchor: [16, 32],
      popupAnchor: [0, -32],
    },
    praias: {
      iconUrl: 'img/markers/beach-marker.png',
      iconSize: [32, 32],
      iconAnchor: [16, 32],
      popupAnchor: [0, -32],
    },
    restaurantes: {
      iconUrl: 'img/markers/restaurant-marker.png',
      iconSize: [32, 32],
      iconAnchor: [16, 32],
      popupAnchor: [0, -32],
    },
    pousadas: {
      iconUrl: 'img/markers/hotel-marker.png',
      iconSize: [32, 32],
      iconAnchor: [16, 32],
      popupAnchor: [0, -32],
    },
    emergencias: {
      iconUrl: 'img/markers/emergency-marker.png',
      iconSize: [32, 32],
      iconAnchor: [16, 32],
      popupAnchor: [0, -32],
    },
  };

  // Usar categoria como fallback para o tipo
  const config = iconConfig[iconType] || iconConfig[category] || defaultIcon;

  // Criar ícone
  const icon = L.icon(config);

  // Armazenar no cache
  iconCache.set(cacheKey, icon);

  return icon;
}

/**
 * Configura eventos para um marcador
 * @param {Object} marker - Marcador Leaflet
 * @param {Object} options - Opções do marcador
 */
function setupMarkerEvents(marker, options) {
  // Evento de clique
  marker.on('click', (e) => {
    // Suprimir o evento se o marcador não for clicável
    if (!options.clickable) {
      return;
    }

    // Publicar evento
    eventBus.publish(EVENT_TYPES.MARKER_CLICKED, {
      id: options.id,
      lat: e.latlng.lat,
      lon: e.latlng.lng,
      category: options.category,
      title: options.title,
      customData: options.customData,
    });
  });

  // Evento de arrastar (se o marcador for arrastável)
  if (options.draggable) {
    marker.on('dragend', (e) => {
      const latlng = e.target.getLatLng();

      // Publicar evento
      eventBus.publish(EVENT_TYPES.MARKER_MOVED, {
        id: options.id,
        lat: latlng.lat,
        lon: latlng.lng,
        category: options.category,
      });
    });
  }
}

/**
 * Cria conteúdo HTML para popup de marcador
 * @param {string} title - Título
 * @param {string} description - Descrição
 * @param {Object} [customData={}] - Dados personalizados
 * @param {string} [category=''] - Categoria do marcador
 * @returns {string} HTML para o popup
 */
function createPopupContent(
  title,
  description,
  customData = {},
  category = ''
) {
  // Obter botões específicos da categoria
  const buttons = getPopupButtons(category, customData);

  // Montando o HTML do conteúdo
  let html = `
    <div class="marker-popup ${category}-popup">
      ${title ? `<h3 class="popup-title">${title}</h3>` : ''}
      ${
        description ? `<div class="popup-description">${description}</div>` : ''
      }
  `;

  // Adicionar informações extras se disponíveis
  if (customData.address) {
    html += `<div class="popup-address"><i class="fas fa-map-marker-alt"></i> ${customData.address}</div>`;
  }

  if (customData.phone) {
    html += `<div class="popup-phone"><i class="fas fa-phone"></i> ${customData.phone}</div>`;
  }

  if (customData.website) {
    html += `<div class="popup-website"><i class="fas fa-globe"></i> <a href="${
      customData.website
    }" target="_blank">${translate('visit-website')}</a></div>`;
  }

  // Adicionar botões
  if (buttons && buttons.length > 0) {
    html += `<div class="popup-actions">`;

    buttons.forEach((button) => {
      html += `
        <button 
          class="popup-btn popup-btn-${button.type}" 
          data-action="${button.action}"
          data-id="${customData.id || ''}"
          onclick="${button.onclick}"
        >
          ${button.icon ? `<i class="${button.icon}"></i>` : ''}
          ${button.label}
        </button>
      `;
    });

    html += `</div>`;
  }

  html += `</div>`;

  return html;
}

/**
 * Obtém botões para o popup com base na categoria
 * @param {string} category - Categoria do marcador
 * @param {Object} data - Dados do marcador
 * @returns {Array} Array de objetos de botão
 */
function getPopupButtons(category, data) {
  // Botões padrão disponíveis para todas as categorias
  const defaultButtons = [
    {
      label: translate('create-route'),
      type: 'primary',
      action: 'create-route',
      icon: 'fas fa-route',
      onclick: `window.createRouteToMarker(${data.id || '0'}, ${
        data.lat || 0
      }, ${data.lon || 0}, '${data.name?.replace(/'/g, "\\'") || ''}')`,
    },
  ];

  // Botões específicos por categoria
  const categoryButtons = {
    destination: [],
    pousadas: [
      {
        label: translate('book-now'),
        type: 'secondary',
        action: 'book',
        icon: 'fas fa-bed',
        onclick: data.bookingUrl
          ? `window.openDestinationWebsite('${data.bookingUrl}')`
          : '',
      },
    ],
    restaurantes: [
      {
        label: translate('see-menu'),
        type: 'secondary',
        action: 'menu',
        icon: 'fas fa-utensils',
        onclick: data.menuUrl
          ? `window.openDestinationWebsite('${data.menuUrl}')`
          : '',
      },
    ],
    passeios: [
      {
        label: translate('buy-ticket'),
        type: 'secondary',
        action: 'buy-ticket',
        icon: 'fas fa-ticket-alt',
        onclick: data.ticketUrl
          ? `window.openDestinationWebsite('${data.ticketUrl}')`
          : '',
      },
    ],
  };

  // Combinar botões padrão com específicos da categoria
  return [...defaultButtons, ...(categoryButtons[category] || [])];
}

/**
 * Realça um marcador específico temporariamente
 * @param {string} markerId - ID do marcador
 * @param {number} [duration=2000] - Duração em ms
 */
export function highlightMarker(markerId, duration = 2000) {
  const markers = appState.get('map.markers') || [];
  const marker = markers.find((m) => m.options.id === markerId);

  if (!marker) return;

  // Obter elemento DOM do marcador
  const element = marker.getElement();
  if (!element) return;

  // Adicionar classe de destaque
  element.classList.add('marker-highlight');

  // Remover classe após a duração
  setTimeout(() => {
    element.classList.remove('marker-highlight');
  }, duration);

  // Garantir que o marcador está visível
  const map = getMap();
  if (map) {
    map.panTo(marker.getLatLng(), { animate: true, duration: 0.5 });
  }
}

/**
 * Implementa a função que estava em falta no código original
 * Realça o próximo passo da rota no mapa
 * @param {Object} step - Passo da rota (contém informações de localização e instrução)
 */
export function highlightNextStepInMap(step) {
  if (!step || !step.location) return;

  const map = getMap();
  if (!map) return;

  // Limpar qualquer destaque anterior
  clearRouteHighlights();

  // Extrair coordenadas do passo
  const lat = step.location[1] || step.location.lat;
  const lon = step.location[0] || step.location.lon;

  // Criar um marcador temporário para o passo
  const stepIcon = L.divIcon({
    className: 'step-highlight-marker',
    html: `
      <div style="
        width: 24px;
        height: 24px;
        background-color: #FFC107;
        border-radius: 50%;
        border: 3px solid white;
        box-shadow: 0 0 0 2px #FFC107, 0 0 10px rgba(0,0,0,0.35);
        animation: pulse-highlight 1.5s infinite;
      "></div>
    `,
    iconSize: [30, 30],
    iconAnchor: [15, 15],
  });

  // Criar o marcador
  const stepMarker = L.marker([lat, lon], {
    icon: stepIcon,
    zIndexOffset: 900,
    interactive: false,
  }).addTo(map);

  // Armazenar no estado
  appState.set('map.layers.highlightedStep', stepMarker);

  // Destacar o segmento da rota se existir
  const currentRoute = appState.get('map.layers.currentRoute');
  if (currentRoute && step.index !== undefined) {
    try {
      // Tentar obter o segmento da rota
      highlightRouteSegment(currentRoute, step.index);
    } catch (error) {
      console.warn('Não foi possível destacar o segmento da rota:', error);
    }
  }

  // Centralizar o mapa na localização do passo
  map.panTo([lat, lon], {
    animate: true,
    duration: 0.5,
    easeLinearity: 0.25,
  });

  // Publicar evento
  eventBus.publish(EVENT_TYPES.STEP_HIGHLIGHTED, {
    lat,
    lon,
    instruction: step.text,
    index: step.index,
  });
}

/**
 * Destaca um segmento específico da rota
 * @param {Object} routeLayer - Camada da rota (polyline)
 * @param {number} index - Índice do segmento
 */
function highlightRouteSegment(routeLayer, index) {
  const map = getMap();
  if (!map || !routeLayer) return;

  // Verificar se temos acesso às coordenadas da rota
  if (!routeLayer._latlngs || index >= routeLayer._latlngs.length - 1) {
    return;
  }

  // Obter coordenadas do segmento
  const start = routeLayer._latlngs[index];
  const end = routeLayer._latlngs[index + 1];

  // Criar um polyline para destacar o segmento
  const highlightLine = L.polyline([start, end], {
    color: '#FFC107',
    weight: 8,
    opacity: 0.8,
    className: 'route-highlight',
    dashArray: null,
  }).addTo(map);

  // Armazenar no estado
  appState.set('map.layers.highlightedSegment', highlightLine);
}

/**
 * Limpa destaques de rota do mapa
 */
function clearRouteHighlights() {
  const map = getMap();
  if (!map) return;

  // Remover marcador de passo destacado
  const stepMarker = appState.get('map.layers.highlightedStep');
  if (stepMarker) {
    map.removeLayer(stepMarker);
    appState.set('map.layers.highlightedStep', null);
  }

  // Remover segmento destacado
  const segmentLine = appState.get('map.layers.highlightedSegment');
  if (segmentLine) {
    map.removeLayer(segmentLine);
    appState.set('map.layers.highlightedSegment', null);
  }
}

// Exportar funções
export default {
  createMarker,
  createUserMarker,
  updateUserMarker,
  removeUserMarker,
  createDestinationMarker,
  removeDestinationMarker,
  createPOIMarkers,
  clearMarkers,
  clearMarkersByCategory,
  highlightMarker,
  highlightNextStepInMap,
};
