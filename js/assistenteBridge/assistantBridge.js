/**
 * Bridge de Integração do Assistente Virtual com o Mapa e Funcionalidades
 * Este módulo conecta o assistente virtual com o mapa OSM e outras funções do site,
 * permitindo interações avançadas como mostrar locais no mapa, exibir fotos, etc.
 * Versão: 1.0.0
 */

import { startCarousel, getImagesForLocation } from '../ui/carousel.js';
import { showNotification } from '../ui/notifications.js';
import { getSelectedLanguage } from '../i18n/language.js';
import { getMapInstance } from '../map/mapManager.js';
// Importar funções e módulos necessários

// Estrutura para armazenar marcadores criados pelo assistente
const assistantMarkers = {
  markers: [],
  clusters: {},
  activeCategory: null,
};

// Definição de cores por categoria para marcadores
const markerColors = {
  praias: '#0066ff', // Azul
  restaurantes: '#00cc66', // Verde
  hospedagem: '#ff9900', // Laranja
  passeios: '#9900cc', // Roxo
  servicos: '#ff3366', // Rosa
  comercio: '#cc6600', // Marrom
  pontos: '#0099cc', // Azul claro
};

// Definição de ícones por categoria para marcadores
const markerIcons = {
  praias: 'beach',
  restaurantes: 'restaurant',
  hospedagem: 'hotel',
  passeios: 'attraction',
  servicos: 'service',
  comercio: 'shopping',
  pontos: 'landmark',
};

/**
 * Inicializa o módulo bridge
 * @param {Object} map - Instância do mapa Leaflet
 * @returns {Object} A API do assistentBridge
 */
export function initializeAssistantBridge(map) {
  console.log('Inicializando AssistantBridge...');

  // Verificar se temos um mapa válido
  if (!map && typeof getMapInstance === 'function') {
    map = getMapInstance();
  }

  if (!map) {
    console.error('Mapa não disponível para assistentBridge');
    showNotification('Erro ao conectar assistente ao mapa', 'error');
    return createEmptyAPI();
  }

  // Configurar o sistema de eventos
  setupEventSystem();

  // Criar e exportar a API pública
  const api = createBridgeAPI(map);

  // Disponibilizar globalmente
  window.assistantBridge = api;

  console.log('AssistantBridge inicializado com sucesso');
  return api;
}

/**
 * Configura o sistema de eventos para comunicação entre componentes
 */
function setupEventSystem() {
  // Criando o hub de eventos se ainda não existir
  if (!window.assistantEvents) {
    window.assistantEvents = new AssistantEventHub();
  }

  // Configurar listeners para eventos relevantes
  window.assistantEvents.on(
    'assistantRequestedMapFocus',
    handleMapFocusRequest
  );
  window.assistantEvents.on(
    'assistantRequestedLocationInfo',
    handleLocationInfoRequest
  );
  window.assistantEvents.on('mapLocationSelected', handleMapSelection);

  console.log('Sistema de eventos do AssistantBridge configurado');
}

/**
 * Sistema de eventos para comunicação entre componentes
 */
class AssistantEventHub {
  constructor() {
    this.events = {};
  }

  on(eventName, callback) {
    if (!this.events[eventName]) {
      this.events[eventName] = [];
    }
    this.events[eventName].push(callback);
    return () => this.off(eventName, callback);
  }

  off(eventName, callback) {
    if (!this.events[eventName]) return;
    this.events[eventName] = this.events[eventName].filter(
      (cb) => cb !== callback
    );
  }

  emit(eventName, data) {
    if (!this.events[eventName]) return;
    this.events[eventName].forEach((callback) => {
      try {
        callback(data);
      } catch (error) {
        console.error(`Erro em evento ${eventName}:`, error);
      }
    });
  }
}

// Criar instância global de eventos do assistente
window.assistantEvents = new AssistantEventHub();

/**
 * Inicializa o sistema ponte entre o assistente e o mapa
 * @param {Object} map - Instância do mapa Leaflet
 * @returns {Object} - API do bridge
 */
export function initializeBridge(map) {
  // Verificação básica
  if (!map) {
    console.warn(
      'Mapa não fornecido para o assistenteBridge, funcionalidade limitada'
    );
  }

  // Salvar referência local ao mapa
  const mapInstance = map;

  // Configurar sistema de eventos
  const eventHub = window.assistantEvents || new AssistantEventHub();

  // Se não existir globalmente, torná-lo global
  if (!window.assistantEvents) {
    window.assistantEvents = eventHub;
  }

  // Configurar handlers de eventos para comunicação
  setupEventHandlers(mapInstance, eventHub);

  // Criar e retornar API do bridge
  return createBridgeAPI(mapInstance);
}

/**
 * Cria a API pública do bridge
 * @param {Object} map - Instância do mapa Leaflet
 * @returns {Object} API do assistentBridge
 */
function createBridgeAPI(map) {
  return {
    // Funções de integração com mapa
    map: {
      /**
       * Destaca um ou mais locais no mapa
       * @param {Array|Object} locations - Locais a serem destacados
       * @param {Object} options - Opções de destaque
       */
      highlight: (locations, options = {}) => {
        return mapHighlight(map, locations, options);
      },

      // Adicionar marcadores por categoria
      addMarkersByCategory: (category, options = {}) => {
        return addMarkersByCategory(map, category, options);
      },

      // Mostrar rota entre dois pontos
      showRoute: (from, to, options = {}) => {
        // Se implementada, chamar função para mostrar rota
        if (typeof showRouteOnMap === 'function') {
          return showRouteOnMap(map, from, to, options);
        }
        return false;
      },

      /**
       * Foca o mapa em um local específico
       * @param {Object} location - Localização a ser focada
       * @param {number} zoomLevel - Nível de zoom
       */
      focusOn: (location, zoomLevel) => {
        return focusMapOn(map, location, zoomLevel);
      },

      // Limpar destaques
      clearHighlights: () => {
        // Se implementada, chamar função para limpar destaques
        if (typeof clearMapHighlights === 'function') {
          return clearMapHighlights(map);
        }
        return false;
      },
    },

    // Gerenciamento de conteúdo
    content: {
      /**
       * Obtém detalhes de um ponto específico
       * @param {string} poiId - ID do ponto de interesse
       */
      getDetails: (poiId) => {
        return getPoiDetails(poiId);
      },

      /**
       * Lista pontos por categoria
       * @param {string} category - Categoria desejada
       * @param {Object} filter - Filtros a serem aplicados
       */
      listByCategory: (category, filter = {}) => {
        return listPointsByCategory(category, filter);
      },

      /**
       * Busca pontos de interesse com base em uma consulta
       * @param {string} query - Consulta para busca
       * @param {Object} options - Opções de busca
       */
      search: (query, options = {}) => {
        return searchContent(query, options);
      },
    },

    // Manipulação de mídia
    media: {
      /**
       * Exibe galeria de imagens para um local específico
       * @param {string} poiId - ID do ponto de interesse
       * @param {HTMLElement} target - Elemento alvo para exibir galeria (opcional)
       */
      showGallery: (poiId, target = null) => {
        try {
          // Obter detalhes do local para obter o nome correto
          const locationDetails = getPoiDetails(poiId);
          const locationName = locationDetails ? locationDetails.name : poiId;

          // Verificar se a função startCarousel está disponível
          if (typeof startCarousel === 'function') {
            startCarousel(locationName);

            // Registrar no analytics
            logUserInteraction('gallery_view', {
              poiId: poiId,
              name: locationName,
            });

            return true;
          } else {
            console.warn('Função startCarousel não disponível');
            return false;
          }
        } catch (error) {
          console.error('Erro ao mostrar galeria:', error);
          return false;
        }
      },

      /**
       * Pré-carrega imagens para uma lista de locais
       * @param {string|Array} locations - ID do local ou lista de IDs
       */
      preloadImages: (locations) => {
        try {
          // Se for string, converter para array
          const locationArray =
            typeof locations === 'string' ? [locations] : locations;

          // Verificar se a função getImagesForLocation está disponível
          if (typeof getImagesForLocation === 'function') {
            // Para cada local, carregar as imagens em segundo plano
            locationArray.forEach((locationId) => {
              const locationDetails = getPoiDetails(locationId);
              const locationName = locationDetails
                ? locationDetails.name
                : locationId;

              // Obter URLs das imagens
              const imageUrls = getImagesForLocation(locationName);

              // Pré-carregar imagens
              if (imageUrls && imageUrls.length > 0) {
                imageUrls.forEach((url) => {
                  const img = new Image();
                  img.src = url;
                });
              }
            });

            return true;
          } else {
            console.warn('Função getImagesForLocation não disponível');
            return false;
          }
        } catch (error) {
          console.error('Erro ao pré-carregar imagens:', error);
          return false;
        }
      },
    },

    // Interação com UI
    ui: {
      /**
       * Abre um painel específico da interface
       * @param {string} panelId - ID do painel
       * @param {Object} data - Dados para o painel
       */
      openPanel: (panelId, data = {}) => {
        return openUiPanel(panelId, data);
      },

      /**
       * Aciona uma ação específica na UI
       * @param {string} actionName - Nome da ação
       * @param {Object} params - Parâmetros para a ação
       */
      triggerAction: (actionName, params = {}) => {
        return triggerUiAction(actionName, params);
      },
    },

    // Analytics e aprendizado
    analytics: {
      /**
       * Registra interação para análise
       * @param {string} type - Tipo de interação
       * @param {Object} data - Dados da interação
       */
      logInteraction: (type, data = {}) => {
        return logUserInteraction(type, data);
      },

      /**
       * Obtém preferências do usuário
       */
      getUserPreferences: () => {
        return getUserPreferenceData();
      },
    },
  };
}

/**
 * Cria uma API vazia para falha elegante
 * @returns {Object} API vazia
 */
function createEmptyAPI() {
  // Criar uma API que não faz nada quando o mapa não está disponível
  const noopFn = () => false;

  return {
    map: {
      highlight: noopFn,
      showRoute: noopFn,
      focusOn: noopFn,
      addMarkers: noopFn,
      clearHighlights: noopFn,
    },
    content: {
      getDetails: noopFn,
      listByCategory: noopFn,
      search: noopFn,
    },
    media: {
      showGallery: noopFn,
      preloadImages: noopFn,
    },
    ui: {
      openPanel: noopFn,
      triggerAction: noopFn,
    },
    analytics: {
      logInteraction: noopFn,
      getUserPreferences: noopFn,
    },
  };
}

// ==============================
// Manipulação do Mapa
// ==============================

/**
 * Destaca um ou mais locais no mapa
 * @param {Object} map - Instância do mapa Leaflet
 * @param {Array|Object} locations - Locais a serem destacados
 * @param {Object} options - Opções de destaque
 */
function mapHighlight(map, locations, options = {}) {
  try {
    // Limpar destaques anteriores se solicitado
    if (options.clearPrevious !== false) {
      clearMapHighlights(map);
    }

    // Normalizar para array
    const locationArray = Array.isArray(locations) ? locations : [locations];

    // Verificar se temos locais para destacar
    if (locationArray.length === 0) {
      console.warn('Nenhum local para destacar no mapa');
      return false;
    }

    // Configurar opções
    const defaultOptions = {
      zoom: true,
      popup: true,
      cluster: locationArray.length > 5,
      category: 'pontos',
      duration: 5000, // Tempo para destaque temporário em ms
      isTemporary: false,
    };

    const finalOptions = { ...defaultOptions, ...options };

    // Obter cor e ícone para a categoria
    const color = markerColors[finalOptions.category] || markerColors.pontos;
    const icon = markerIcons[finalOptions.category] || markerIcons.pontos;

    // Criar marcadores para cada local
    const bounds = L.latLngBounds();
    const markers = [];

    locationArray.forEach((location) => {
      // Criar marcador Leaflet
      const marker = createLeafletMarker(map, location, {
        color,
        icon,
        category: finalOptions.category,
        isAssistantMarker: true,
        temporary: finalOptions.isTemporary,
      });

      // Adicionar ao mapa
      marker.addTo(map);

      // Configurar popup se necessário
      if (finalOptions.popup && location.name) {
        marker.bindPopup(createPopupContent(location));

        // Abrir popup para o primeiro item se houver poucos
        if (locationArray.length <= 3 && markers.length === 0) {
          marker.openPopup();
        }
      }

      // Expandir os limites para incluir este marcador
      if (marker.getLatLng) {
        bounds.extend(marker.getLatLng());
      }

      // Armazenar para referência
      markers.push(marker);
      assistantMarkers.markers.push(marker);
    });

    // Agrupar marcadores se necessário
    if (finalOptions.cluster && markers.length > 5) {
      const cluster = L.markerClusterGroup();
      markers.forEach((marker) => cluster.addLayer(marker));
      map.addLayer(cluster);
      assistantMarkers.clusters[finalOptions.category] = cluster;
    }

    // Aplicar zoom se solicitado
    if (finalOptions.zoom && bounds.isValid()) {
      map.fitBounds(bounds, { padding: [50, 50] });
    }

    // Definir para remover marcadores temporários
    if (finalOptions.isTemporary && finalOptions.duration > 0) {
      setTimeout(() => {
        markers.forEach((marker) => {
          if (marker.isAssistantMarker && marker.temporary) {
            map.removeLayer(marker);

            // Remover da lista de marcadores assistidos
            const index = assistantMarkers.markers.indexOf(marker);
            if (index > -1) {
              assistantMarkers.markers.splice(index, 1);
            }
          }
        });
      }, finalOptions.duration);
    }

    // Atualizar categoria ativa
    assistantMarkers.activeCategory = finalOptions.category;

    return true;
  } catch (error) {
    console.error('Erro ao destacar locais no mapa:', error);
    return false;
  }
}

/**
 * Cria um marcador Leaflet para um local
 * @param {Object} map - Instância do mapa Leaflet
 * @param {Object} location - Local para o marcador
 * @param {Object} options - Opções do marcador
 * @returns {Object} Marcador Leaflet
 */
function createLeafletMarker(map, location, options = {}) {
  // Extrair coordenadas
  let coords;

  if (location.lat && location.lng) {
    coords = [location.lat, location.lng];
  } else if (location.latitude && location.longitude) {
    coords = [location.latitude, location.longitude];
  } else if (location.coords) {
    coords = [location.coords.lat, location.coords.lng];
  } else if (Array.isArray(location) && location.length >= 2) {
    coords = [location[0], location[1]];
  } else {
    console.error('Formato de localização inválido:', location);
    return null;
  }

  // Criar ícone personalizado se disponível
  let markerOptions = {};

  if (window.L && window.L.BeautifyIcon) {
    markerOptions.icon = new L.BeautifyIcon({
      icon: options.icon || 'star',
      borderColor: options.color || '#0078ff',
      textColor: options.color || '#0078ff',
      backgroundColor: 'white',
    });
  }

  // Criar marcador
  const marker = L.marker(coords, markerOptions);

  // Adicionar propriedades personalizadas
  marker.isAssistantMarker = true;
  marker.category = options.category || 'pontos';
  marker.temporary = options.temporary || false;
  marker.locationName = location.name || '';
  marker.locationId = location.id || '';

  return marker;
}

/**
 * Cria conteúdo para popup
 * @param {Object} location - Local para o popup
 * @returns {string} Conteúdo HTML do popup
 */
function createPopupContent(location) {
  const name = location.name || location.title || 'Local desconhecido';
  const description = location.description || '';

  let content = `
    <div class="map-popup">
      <h3>${name}</h3>
      ${description ? `<p>${description}</p>` : ''}
  `;

  // Adicionar botões de ação
  content += `
      <div class="popup-actions">
        <button class="popup-btn details-btn" onclick="window.assistantBridge.content.getDetails('${location.id || name}')">Detalhes</button>
        <button class="popup-btn photos-btn" onclick="window.assistantBridge.media.showGallery('${location.id || name}')">Fotos</button>
      </div>
    </div>
  `;

  return content;
}

/**
 * Remove destaques do mapa
 * @param {Object} map - Instância do mapa Leaflet
 */
function clearMapHighlights(map) {
  try {
    // Remover marcadores individuais
    assistantMarkers.markers.forEach((marker) => {
      if (marker && map.hasLayer(marker)) {
        map.removeLayer(marker);
      }
    });

    // Limpar clusters
    Object.values(assistantMarkers.clusters).forEach((cluster) => {
      if (cluster && map.hasLayer(cluster)) {
        map.removeLayer(cluster);
      }
    });

    // Resetar arrays
    assistantMarkers.markers = [];
    assistantMarkers.clusters = {};

    return true;
  } catch (error) {
    console.error('Erro ao limpar destaques do mapa:', error);
    return false;
  }
}

/**
 * Adiciona marcadores ao mapa por categoria
 * @param {Object} map - Instância do mapa Leaflet
 * @param {string} category - Categoria dos marcadores
 * @param {Object} filter - Filtros a serem aplicados
 */
function addMarkersByCategory(map, category, filter = {}) {
  try {
    // Verificar se já existe essa categoria ativa
    if (assistantMarkers.activeCategory === category && !filter.force) {
      // Já está mostrando esta categoria, apenas ajustar zoom se necessário
      if (filter.highlight && assistantMarkers.markers.length > 0) {
        const bounds = L.latLngBounds();
        assistantMarkers.markers.forEach((marker) => {
          if (marker.getLatLng) {
            bounds.extend(marker.getLatLng());
          }
        });

        if (bounds.isValid()) {
          map.fitBounds(bounds, { padding: [50, 50] });
        }
      }
      return true;
    }

    // Buscar dados para a categoria
    const locationsData = getCategoryLocations(category, filter);

    if (!locationsData || locationsData.length === 0) {
      console.warn(`Sem dados para a categoria: ${category}`);
      return false;
    }

    // Configurar opções para destaque
    const options = {
      category: category,
      popup: true,
      cluster: filter.cluster !== false,
      zoom: filter.highlight !== false,
    };

    // Aplicar destaque
    return mapHighlight(map, locationsData, options);
  } catch (error) {
    console.error(
      `Erro ao adicionar marcadores para categoria ${category}:`,
      error
    );
    return false;
  }
}

/**
 * Obtém locais de uma categoria específica
 * @param {string} category - Categoria desejada
 * @param {Object} filter - Filtros a serem aplicados
 * @returns {Array} Lista de locais
 */
function getCategoryLocations(category, filter = {}) {
  // Esta função seria idealmente conectada ao seu banco de dados
  // Por enquanto, retornaremos dados de exemplo

  // Banco de dados de exemplo com alguns pontos
  const sampleLocations = {
    praias: [
      {
        name: 'Primeira Praia',
        lat: -13.381,
        lng: -38.913,
        id: 'primeira_praia',
        description: 'Praia pequena e tranquila, próxima ao centro.',
      },
      {
        name: 'Segunda Praia',
        lat: -13.383,
        lng: -38.914,
        id: 'segunda_praia',
        description: 'A mais movimentada, com bares e restaurantes.',
      },
      {
        name: 'Terceira Praia',
        lat: -13.385,
        lng: -38.915,
        id: 'terceira_praia',
        description: 'Bom equilíbrio entre estrutura e tranquilidade.',
      },
      {
        name: 'Quarta Praia',
        lat: -13.388,
        lng: -38.916,
        id: 'quarta_praia',
        description: 'Extensa e tranquila, ideal para caminhadas.',
      },
      {
        name: 'Praia do Encanto',
        lat: -13.391,
        lng: -38.917,
        id: 'praia_encanto',
        description: 'Pequena e isolada, com águas cristalinas.',
      },
    ],
    restaurantes: [
      {
        name: 'Restaurante do Gallo',
        lat: -13.383,
        lng: -38.9135,
        id: 'restaurante_gallo',
        description: 'Especializado em frutos do mar na Segunda Praia.',
      },
      {
        name: 'Dona Carmô',
        lat: -13.38,
        lng: -38.911,
        id: 'dona_carmo',
        description: 'Autêntica comida baiana na Vila.',
      },
      {
        name: 'O Beco',
        lat: -13.38,
        lng: -38.912,
        id: 'o_beco',
        description: 'Culinária italiana em ambiente aconchegante.',
      },
      {
        name: 'Sambass',
        lat: -13.385,
        lng: -38.914,
        id: 'sambass',
        description: 'Restaurante à beira-mar com música ao vivo.',
      },
    ],
    hospedagem: [
      {
        name: 'Vila dos Orixás',
        lat: -13.386,
        lng: -38.915,
        id: 'vila_orixas',
        description: 'Hotel boutique com spa na Terceira Praia.',
      },
      {
        name: 'Pousada Natureza',
        lat: -13.384,
        lng: -38.916,
        id: 'pousada_natureza',
        description: 'Pousada econômica com ótima localização.',
      },
      {
        name: 'Hotel Morro de São Paulo',
        lat: -13.381,
        lng: -38.912,
        id: 'hotel_morro',
        description: 'Hotel tradicional no centro da Vila.',
      },
    ],
    passeios: [
      {
        name: 'Volta à Ilha',
        lat: -13.382,
        lng: -38.91,
        id: 'volta_ilha',
        description: 'Passeio de barco pela costa da ilha.',
      },
      {
        name: 'Piscina Natural de Garapuá',
        lat: -13.41,
        lng: -38.92,
        id: 'garapua',
        description: 'Passeio até a incrível piscina natural.',
      },
      {
        name: 'Trilha do Farol',
        lat: -13.376,
        lng: -38.915,
        id: 'trilha_farol',
        description: 'Caminhada até o farol com vista panorâmica.',
      },
    ],
    pontos: [
      {
        name: 'Farol do Morro',
        lat: -13.376,
        lng: -38.919,
        id: 'farol_morro',
        description: 'Marco histórico com vista para toda a ilha.',
      },
      {
        name: 'Fortaleza de Morro',
        lat: -13.38,
        lng: -38.91,
        id: 'fortaleza',
        description: 'Construção histórica do período colonial.',
      },
      {
        name: 'Toca do Morcego',
        lat: -13.388,
        lng: -38.912,
        id: 'toca_morcego',
        description: 'Formação rochosa com vista para o mar.',
      },
    ],
    servicos: [
      {
        name: 'Posto de Saúde',
        lat: -13.379,
        lng: -38.911,
        id: 'posto_saude',
        description: 'Atendimento médico básico.',
      },
      {
        name: 'Polícia Militar',
        lat: -13.38,
        lng: -38.912,
        id: 'policia',
        description: 'Base da PM para emergências.',
      },
    ],
    comercio: [
      {
        name: 'Super Zimbo',
        lat: -13.379,
        lng: -38.912,
        id: 'super_zimbo',
        description: 'Supermercado com produtos básicos.',
      },
      {
        name: 'Galeria de Artesanato',
        lat: -13.381,
        lng: -38.911,
        id: 'galeria_arte',
        description: 'Loja com produtos locais e artesanato.',
      },
    ],
  };

  // Retornar a categoria solicitada ou array vazio
  return sampleLocations[category] || [];
}

/**
 * Mostra uma rota entre dois pontos no mapa
 * @param {Object} map - Instância do mapa Leaflet
 * @param {Object} from - Coordenadas de origem
 * @param {Object} to - Coordenadas de destino
 * @param {Object} options - Opções para a rota
 */
function showMapRoute(map, from, to, options = {}) {
  try {
    // Limpar rotas anteriores se necessário
    if (assistantMarkers.route && map.hasLayer(assistantMarkers.route)) {
      map.removeLayer(assistantMarkers.route);
    }

    // Normalizar coordenadas
    let fromCoords, toCoords;

    if (from.lat && from.lng) {
      fromCoords = [from.lat, from.lng];
    } else if (Array.isArray(from)) {
      fromCoords = from;
    } else {
      console.error('Formato de origem inválido:', from);
      return false;
    }

    if (to.lat && to.lng) {
      toCoords = [to.lat, to.lng];
    } else if (Array.isArray(to)) {
      toCoords = to;
    } else {
      console.error('Formato de destino inválido:', to);
      return false;
    }

    // Se tivermos o plugin para rotas OSRM
    if (window.L && window.L.Routing) {
      // Usar o plugin de roteamento do Leaflet
      const control = L.Routing.control({
        waypoints: [
          L.latLng(fromCoords[0], fromCoords[1]),
          L.latLng(toCoords[0], toCoords[1]),
        ],
        routeWhileDragging: true,
        showAlternatives: true,
      }).addTo(map);

      assistantMarkers.route = control;

      return true;
    } else {
      // Alternativa simples: desenhar uma linha reta
      const polyline = L.polyline([fromCoords, toCoords], {
        color: 'blue',
        weight: 5,
        opacity: 0.7,
        dashArray: '10, 10',
      }).addTo(map);

      // Adicionar marcadores nos pontos inicial e final
      const startMarker = createLeafletMarker(map, fromCoords, {
        color: 'green',
        icon: 'play',
        category: 'route',
        isAssistantMarker: true,
      }).addTo(map);

      const endMarker = createLeafletMarker(map, toCoords, {
        color: 'red',
        icon: 'flag',
        category: 'route',
        isAssistantMarker: true,
      }).addTo(map);

      // Ajustar zoom para mostrar a rota
      const bounds = L.latLngBounds(fromCoords, toCoords);
      map.fitBounds(bounds, { padding: [50, 50] });

      // Armazenar referências
      assistantMarkers.route = polyline;
      assistantMarkers.markers.push(startMarker, endMarker);

      return true;
    }
  } catch (error) {
    console.error('Erro ao mostrar rota no mapa:', error);
    return false;
  }
}

/**
 * Foca o mapa em um local específico
 * @param {Object} map - Instância do mapa Leaflet
 * @param {Object} location - Localização a ser focada
 * @param {number} zoomLevel - Nível de zoom
 */
function focusMapOn(map, location, zoomLevel = 16) {
  try {
    // Normalizar coordenadas
    let coords;

    if (location.lat && location.lng) {
      coords = [location.lat, location.lng];
    } else if (location.latitude && location.longitude) {
      coords = [location.latitude, location.longitude];
    } else if (location.coords) {
      coords = [location.coords.lat, location.coords.lng];
    } else if (Array.isArray(location) && location.length >= 2) {
      coords = [location[0], location[1]];
    } else if (typeof location === 'string') {
      // Buscar localização pelo nome
      const foundLocation = findLocationByName(location);
      if (foundLocation) {
        return focusMapOn(map, foundLocation, zoomLevel);
      } else {
        console.error('Local não encontrado:', location);
        return false;
      }
    } else {
      console.error('Formato de localização inválido:', location);
      return false;
    }

    // Aplicar zoom e centralização com animação
    map.flyTo(coords, zoomLevel, {
      animate: true,
      duration: 1.5,
    });

    return true;
  } catch (error) {
    console.error('Erro ao focar mapa em local:', error);
    return false;
  }
}

/**
 * Busca localização pelo nome
 * @param {string} name - Nome do local
 * @returns {Object|null} Localização encontrada ou null
 */
function findLocationByName(name) {
  // Normalizar nome para comparação
  const normalizedName = name.toLowerCase().trim();

  // Percorrer todas as categorias para encontrar o local
  for (const category in getCategoryLocations()) {
    const locations = getCategoryLocations(category);

    for (const location of locations) {
      if (
        location.name.toLowerCase().includes(normalizedName) ||
        (location.id && location.id.toLowerCase().includes(normalizedName))
      ) {
        return location;
      }
    }
  }

  return null;
}

// ==============================
// Manipulação de Conteúdo
// ==============================

/**
 * Obtém detalhes de um ponto específico
 * @param {string} poiId - ID ou nome do ponto de interesse
 */
function getPoiDetails(poiId) {
  try {
    // Normalizar ID
    const normalizedId = poiId.toLowerCase().trim().replace(/\s+/g, '_');

    // Buscar em todas as categorias
    let foundLocation = null;

    for (const category in getCategoryLocations()) {
      const locations = getCategoryLocations(category);

      for (const location of locations) {
        const locationId =
          location.id || location.name.toLowerCase().replace(/\s+/g, '_');

        if (
          locationId.includes(normalizedId) ||
          location.name.toLowerCase().includes(normalizedId)
        ) {
          foundLocation = { ...location, category };
          break;
        }
      }

      if (foundLocation) break;
    }

    if (!foundLocation) {
      console.warn(`Ponto de interesse não encontrado: ${poiId}`);
      return null;
    }

    // Emitir evento para que o assistente possa apresentar os detalhes
    window.assistantEvents.emit(
      'assistantRequestedLocationInfo',
      foundLocation
    );

    // Enviar mensagem completa para o assistente
    if (
      window.assistantApi &&
      typeof window.assistantApi.sendMessage === 'function'
    ) {
      const message =
        `Aqui estão mais detalhes sobre ${foundLocation.name}:\n` +
        `${foundLocation.description || 'Sem descrição disponível.'}\n` +
        `Tipo: ${foundLocation.category || 'Não categorizado'}\n` +
        `Você pode ver fotos deste local clicando no botão abaixo.`;

      window.assistantApi.sendMessage(message);

      // Mostrar galeria após a mensagem
      setTimeout(() => {
        showLocationGallery(poiId);
      }, 1500);
    }

    return foundLocation;
  } catch (error) {
    console.error('Erro ao obter detalhes do POI:', error);
    return null;
  }
}

/**
 * Lista pontos por categoria
 * @param {string} category - Categoria desejada
 * @param {Object} filter - Filtros a serem aplicados
 */
function listPointsByCategory(category, filter = {}) {
  try {
    const locations = getCategoryLocations(category, filter);

    if (!locations || locations.length === 0) {
      console.warn(`Sem pontos para listar na categoria: ${category}`);
      return [];
    }

    // Emitir evento com a lista
    window.assistantEvents.emit('locationListGenerated', {
      category,
      locations,
      filter,
    });

    // Construir mensagem para o assistente
    if (
      window.assistantApi &&
      typeof window.assistantApi.sendMessage === 'function'
    ) {
      let message = `Aqui está a lista de ${category}:\n\n`;

      locations.forEach((location, index) => {
        message += `${index + 1}. ${location.name}${location.description ? ` - ${location.description}` : ''}\n`;
      });

      window.assistantApi.sendMessage(message);
    }

    return locations;
  } catch (error) {
    console.error(`Erro ao listar pontos da categoria ${category}:`, error);
    return [];
  }
}

/**
 * Busca pontos de interesse com base em uma consulta
 * @param {string} query - Consulta para busca
 * @param {Object} options - Opções de busca
 */
function searchContent(query, options = {}) {
  try {
    const normalizedQuery = query.toLowerCase().trim();
    const results = [];

    // Definir categorias para busca
    let categories = options.categories;
    if (!categories) {
      categories = [
        'praias',
        'restaurantes',
        'hospedagem',
        'passeios',
        'pontos',
        'servicos',
        'comercio',
      ];
    } else if (!Array.isArray(categories)) {
      categories = [categories];
    }

    // Buscar em cada categoria
    categories.forEach((category) => {
      const locations = getCategoryLocations(category);

      locations.forEach((location) => {
        // Verificar nome e descrição
        if (
          location.name.toLowerCase().includes(normalizedQuery) ||
          (location.description &&
            location.description.toLowerCase().includes(normalizedQuery))
        ) {
          results.push({ ...location, category });
        }
      });
    });

    // Aplicar limite se especificado
    const limit = options.limit || results.length;
    const limitedResults = results.slice(0, limit);

    // Emitir evento com os resultados
    window.assistantEvents.emit('searchResultsGenerated', {
      query,
      results: limitedResults,
      options,
    });

    return limitedResults;
  } catch (error) {
    console.error('Erro na busca de conteúdo:', error);
    return [];
  }
}

// ==============================
// Manipulação de Mídia
// ==============================

/**
 * Exibe galeria de imagens para um local
 * @param {string} poiId - ID ou nome do ponto de interesse
 * @param {HTMLElement} target - Elemento alvo para exibição
 */
function showLocationGallery(poiId, target = null) {
  try {
    // Se tivermos a função startCarousel do módulo carousel.js
    if (typeof startCarousel === 'function') {
      // Normalizar ID para nome
      let locationName;

      if (typeof poiId === 'object' && poiId.name) {
        locationName = poiId.name;
      } else {
        // Buscar o local primeiro para obter o nome
        const location = findLocationByName(poiId);
        locationName = location ? location.name : poiId;
      }

      // Iniciar carrossel
      startCarousel(locationName);
      return true;
    } else {
      console.error('Função startCarousel não disponível');
      showNotification('Não foi possível exibir as fotos', 'error');
      return false;
    }
  } catch (error) {
    console.error('Erro ao mostrar galeria:', error);
    return false;
  }
}

/**
 * Pré-carrega imagens para uso futuro
 * @param {Array|string} locations - Locais para pré-carregar imagens
 */
function preloadLocationImages(locations) {
  try {
    // Normalizar para array
    const locationArray = Array.isArray(locations) ? locations : [locations];

    // Se tivermos a função getImagesForLocation do módulo carousel.js
    if (typeof getImagesForLocation === 'function') {
      let totalImages = 0;

      locationArray.forEach((location) => {
        // Obter nome do local
        let locationName;

        if (typeof location === 'object' && location.name) {
          locationName = location.name;
        } else if (typeof location === 'string') {
          if (
            location === 'praias' ||
            location === 'restaurantes' ||
            location === 'hospedagem' ||
            location === 'passeios' ||
            location === 'pontos'
          ) {
            // É uma categoria, buscar todos os locais
            const categoryLocations = getCategoryLocations(location);
            categoryLocations.forEach((catLocation) => {
              preloadLocationImages(catLocation.name);
            });
            return;
          } else {
            locationName = location;
          }
        } else {
          console.warn(
            'Formato de localização inválido para pré-carregar:',
            location
          );
          return;
        }

        // Obter URLs das imagens
        const images = getImagesForLocation(locationName);

        if (images && images.length > 0) {
          // Pré-carregar cada imagem
          images.forEach((imageUrl) => {
            const img = new Image();
            img.src = imageUrl;
            totalImages++;
          });
        }
      });

      console.log(`Pré-carregando ${totalImages} imagens`);
      return totalImages > 0;
    } else {
      console.warn('Função getImagesForLocation não disponível');
      return false;
    }
  } catch (error) {
    console.error('Erro ao pré-carregar imagens:', error);
    return false;
  }
}

// ==============================
// Manipulação de UI
// ==============================

/**
 * Abre um painel específico da interface
 * @param {string} panelId - ID do painel
 * @param {Object} data - Dados para o painel
 */
function openUiPanel(panelId, data = {}) {
  try {
    // Verificar se temos a função showModal
    if (
      typeof showModal === 'function' &&
      ['about', 'help', 'settings', 'carousel'].includes(panelId)
    ) {
      showModal(`${panelId}-modal`, data);
      return true;
    }

    // Implementação específica para diferentes painéis
    switch (panelId) {
      case 'filter':
        if (typeof toggleFilterPanel === 'function') {
          toggleFilterPanel();
          return true;
        }
        break;

      case 'search':
        if (typeof showSearchPanel === 'function') {
          showSearchPanel();
          return true;
        }
        break;

      default:
        console.warn(`Painel não reconhecido: ${panelId}`);
        return false;
    }

    console.warn(`Função para abrir painel ${panelId} não encontrada`);
    return false;
  } catch (error) {
    console.error(`Erro ao abrir painel ${panelId}:`, error);
    return false;
  }
}

/**
 * Aciona uma ação específica na UI
 * @param {string} actionName - Nome da ação
 * @param {Object} params - Parâmetros para a ação
 */
function triggerUiAction(actionName, params = {}) {
  try {
    // Implementação específica para diferentes ações
    switch (actionName) {
      case 'showAssistant':
        if (
          window.assistantApi &&
          typeof window.assistantApi.showAssistant === 'function'
        ) {
          window.assistantApi.showAssistant();
          return true;
        }
        break;

      case 'hideAssistant':
        if (
          window.assistantApi &&
          typeof window.assistantApi.hideAssistant === 'function'
        ) {
          window.assistantApi.hideAssistant();
          return true;
        }
        break;

      case 'showNotification':
        if (typeof showNotification === 'function') {
          showNotification(params.message, params.type || 'info');
          return true;
        }
        break;

      case 'zoomIn':
        const map = getMapInstance();
        if (map) {
          map.zoomIn(params.amount || 1);
          return true;
        }
        break;

      case 'zoomOut':
        const mapOut = getMapInstance();
        if (mapOut) {
          mapOut.zoomOut(params.amount || 1);
          return true;
        }
        break;

      default:
        console.warn(`Ação não reconhecida: ${actionName}`);
        return false;
    }

    console.warn(`Função para ação ${actionName} não encontrada`);
    return false;
  } catch (error) {
    console.error(`Erro ao acionar ação ${actionName}:`, error);
    return false;
  }
}

// ==============================
// Analytics e Aprendizado
// ==============================

/**
 * Registra interação para análise
 * @param {string} type - Tipo de interação
 * @param {Object} data - Dados da interação
 */
function logUserInteraction(type, data = {}) {
  try {
    // Criar objeto de evento
    const interactionEvent = {
      type,
      data,
      timestamp: new Date().toISOString(),
      sessionId: getUserSessionId(),
    };

    // Armazenar no histórico local
    const interactionHistory = JSON.parse(
      localStorage.getItem('assistantInteractions') || '[]'
    );
    interactionHistory.push(interactionEvent);

    // Limitar tamanho do histórico
    if (interactionHistory.length > 100) {
      interactionHistory.shift();
    }

    localStorage.setItem(
      'assistantInteractions',
      JSON.stringify(interactionHistory)
    );

    // Se houver função para envio ao servidor, chamá-la
    if (typeof sendAnalyticsToServer === 'function') {
      sendAnalyticsToServer(interactionEvent);
    }

    return true;
  } catch (error) {
    console.error('Erro ao registrar interação:', error);
    return false;
  }
}

/**
 * Obtém ID da sessão do usuário
 * @returns {string} ID da sessão
 */
function getUserSessionId() {
  let sessionId = sessionStorage.getItem('assistantSessionId');

  if (!sessionId) {
    sessionId = 'session_' + Math.random().toString(36).substring(2, 15);
    sessionStorage.setItem('assistantSessionId', sessionId);
  }

  return sessionId;
}

/**
 * Obtém preferências do usuário
 * @returns {Object} Dados de preferências
 */
function getUserPreferenceData() {
  try {
    // Obter preferências salvas
    const savedPreferences = JSON.parse(
      localStorage.getItem('userPreferences') || '{}'
    );

    // Obter histórico de interações
    const interactionHistory = JSON.parse(
      localStorage.getItem('assistantInteractions') || '[]'
    );

    // Análise básica de preferências com base em interações
    const preferences = { ...savedPreferences };

    // Contar tipos de interações
    const categoryCounts = {};
    interactionHistory.forEach((interaction) => {
      if (interaction.data && interaction.data.category) {
        const category = interaction.data.category;
        categoryCounts[category] = (categoryCounts[category] || 0) + 1;
      }
    });

    // Encontrar categorias preferidas
    const sortedCategories = Object.entries(categoryCounts)
      .sort((a, b) => b[1] - a[1])
      .map((entry) => entry[0]);

    preferences.favoriteCategories = sortedCategories;

    // Contar locais visitados
    const locationCounts = {};
    interactionHistory.forEach((interaction) => {
      if (interaction.data && interaction.data.locationName) {
        const location = interaction.data.locationName;
        locationCounts[location] = (locationCounts[location] || 0) + 1;
      }
    });

    // Encontrar locais favoritos
    const sortedLocations = Object.entries(locationCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map((entry) => entry[0]);

    preferences.favoriteLocations = sortedLocations;

    // Idioma
    preferences.language = getSelectedLanguage() || 'pt';

    return preferences;
  } catch (error) {
    console.error('Erro ao obter preferências do usuário:', error);
    return {};
  }
}

// ==============================
// Handlers de Eventos
// ==============================

/**
 * Manipula solicitação de foco no mapa
 * @param {Object} data - Dados da solicitação
 */
function handleMapFocusRequest(data) {
  try {
    const map = getMapInstance();
    if (!map) {
      console.error('Mapa não disponível para foco');
      return false;
    }

    if (data.location) {
      return focusMapOn(map, data.location, data.zoomLevel);
    } else if (data.category) {
      return addMarkersByCategory(map, data.category, { highlight: true });
    }

    return false;
  } catch (error) {
    console.error('Erro ao processar solicitação de foco no mapa:', error);
    return false;
  }
}

/**
 * Manipula solicitação de informações sobre local
 * @param {Object} data - Dados da solicitação
 */
function handleLocationInfoRequest(data) {
  try {
    // Mostrar local no mapa
    const map = getMapInstance();
    if (map && data.lat && data.lng) {
      mapHighlight(map, data, { popup: true, zoom: true });
    }

    // Verificar se temos imagens para o local
    if (data.name) {
      const images = getImagesForLocation(data.name);
      if (images && images.length > 0) {
        // Informar o assistente sobre a disponibilidade de imagens
        if (
          window.assistantApi &&
          typeof window.assistantApi.sendMessage === 'function'
        ) {
          window.assistantApi.sendMessage(
            `Há ${images.length} fotos disponíveis para ${data.name}. Deseja ver as imagens?`
          );
        }
      }
    }

    return true;
  } catch (error) {
    console.error(
      'Erro ao processar solicitação de informações de local:',
      error
    );
    return false;
  }
}

/**
 * Manipula seleção de local no mapa
 * @param {Object} data - Dados da seleção
 */
function handleMapSelection(data) {
  try {
    // Informar o assistente sobre a seleção
    if (
      window.assistantApi &&
      typeof window.assistantApi.sendMessage === 'function'
    ) {
      const message = `Você selecionou ${data.name || 'um local'} no mapa. Deseja mais informações sobre este local?`;
      window.assistantApi.sendMessage(message);
    }

    return true;
  } catch (error) {
    console.error('Erro ao processar seleção no mapa:', error);
    return false;
  }
}

// Exportar funções auxiliares
export {
  mapHighlight,
  showMapRoute,
  focusMapOn,
  addMarkersByCategory,
  getPoiDetails,
  showLocationGallery,
};
