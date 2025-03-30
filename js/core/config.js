/**
 * Módulo de configurações globais
 * Centraliza todas as constantes, URLs de API e parâmetros de configuração
 */

// Configurações do mapa
export const MAP_CONFIG = {
  // Coordenadas iniciais (Morro de São Paulo)
  DEFAULT_CENTER: { lat: -13.381811, lon: -38.913896 },
  DEFAULT_ZOOM: 16,
  MIN_ZOOM: 3,
  MAX_ZOOM: 19,

  // Camadas do mapa
  TILE_LAYERS: {
    STREETS: {
      url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
      attribution: '© OpenStreetMap contributors',
      maxZoom: 19,
    },
    SATELLITE: {
      url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
      attribution: '© Esri',
      maxZoom: 19,
    },
  },

  // Opções de estilo para rotas
  ROUTE_STYLES: {
    PRIMARY: {
      color: 'blue',
      weight: 5,
      opacity: 0.8,
      dashArray: '10,5',
    },
    ALTERNATIVE: {
      color: 'purple',
      weight: 4,
      opacity: 0.7,
    },
    TRAVELED: {
      color: 'green',
      weight: 5,
      opacity: 0.8,
    },
    HIGHLIGHT: {
      color: 'yellow',
      weight: 6,
      opacity: 1,
    },
  },
};

// Chaves de API e URLs para serviços externos
export const API = {
  // OpenRouteService API
  ORS_KEY: '5b3ce3597851110001cf62480e27ce5b5dcf4e75a9813468e027d0d3',
  ORS_BASE_URL: 'https://api.openrouteservice.org/v2',

  // Nominatim API
  NOMINATIM_URL: 'https://nominatim.openstreetmap.org/search',

  // Overpass API
  OVERPASS_API_URL: 'https://overpass-api.de/api/interpreter',
};

// Queries Overpass predefinidas por categoria
export const OVERPASS_QUERIES = {
  TOURIST_SPOTS:
    '[out:json];node["tourism"="attraction"](around:10000,-13.376,-38.913);out body;',
  TOURS:
    '[out:json];node["tourism"="information"](around:10000,-13.376,-38.913);out body;',
  BEACHES:
    '[out:json];node["natural"="beach"](around:15000,-13.376,-38.913);out body;',
  NIGHTLIFE:
    '[out:json];node["amenity"="nightclub"](around:10000,-13.376,-38.913);out body;',
  RESTAURANTS:
    '[out:json];node["amenity"="restaurant"](around:15000,-13.376,-38.913);out body;',
  INNS: '[out:json];node["tourism"="hotel"](around:15000,-13.376,-38.913);out body;',
  SHOPS: '[out:json];node["shop"](around:15000,-13.376,-38.913);out body;',
  EMERGENCIES:
    '[out:json];node["amenity"~"hospital|police"](around:10000,-13.376,-38.913);out body;',
};

// Configurações de localização e navegação
export const LOCATION_CONFIG = {
  // Parâmetros de geolocalização
  GEOLOCATION_OPTIONS: {
    enableHighAccuracy: true,
    maximumAge: 5000,
    timeout: 15000,
  },

  // Configurações de rastreamento
  TRACKING: {
    UPDATE_INTERVAL: 1000,
    RECALCULATION_THRESHOLD: 50, // em metros
    RECALCULATION_COOLDOWN: 30000, // em ms (30 segundos)
    ARRIVAL_THRESHOLD: 30, // em metros
    SMOOTHING_FACTOR: 0.2,
  },

  // Perfis de navegação
  NAVIGATION_PROFILES: {
    WALKING: 'foot-walking',
    CYCLING: 'cycling-regular',
    DRIVING: 'driving-car',
  },

  // Opções de rotação
  ROTATION: {
    MIN_ROTATION_DELTA: 2, // em graus
    UPDATE_INTERVAL: 1000, // em ms
    SMOOTHING_ALPHA: 0.2,
  },
};

// Configurações de interface
export const UI_CONFIG = {
  // Timeouts em milissegundos
  TIMEOUTS: {
    NOTIFICATION: 5000,
    LOADER: 15000,
    IDLE_DETECTION: 300000, // 5 minutos
  },

  // Exibição de instruções
  INSTRUCTION_DISPLAY: {
    MAX_VISIBLE_INSTRUCTIONS: 3,
    INSTRUCTION_LOOKAHEAD: 2,
  },

  // Coordenadas especiais
  SPECIAL_LOCATIONS: {
    TOCA_DO_MORCEGO: { lat: -13.3782, lon: -38.914 },
    PARTNER_CHECKIN_RADIUS: 50, // em metros
  },
};

// Configurações de persistência
export const STORAGE_CONFIG = {
  // Chaves para localStorage
  KEYS: {
    LANGUAGE: 'preferredLanguage',
    THEME: 'theme',
    CACHED_ROUTE: 'cachedRoute',
    ROUTE_HISTORY: 'routeHistory',
    SEARCH_HISTORY: 'searchHistory',
    SELECTED_DESTINATION: 'selectedDestination',
    APP_STATE: 'app_state',
  },

  // Limites de armazenamento
  LIMITS: {
    MAX_HISTORY_ITEMS: 50,
    MAX_CACHE_AGE: 86400000, // 24 horas em ms
  },
};

// Idiomas suportados
export const SUPPORTED_LANGUAGES = ['pt', 'en', 'es', 'he'];
export const DEFAULT_LANGUAGE = 'pt';

// Mapeamento de categorias para seus respectivos submenus
export const FEATURE_TO_SUBMENU = {
  'pontos-turisticos': 'touristSpots-submenu',
  passeios: 'tours-submenu',
  praias: 'beaches-submenu',
  festas: 'nightlife-submenu',
  restaurantes: 'restaurants-submenu',
  pousadas: 'inns-submenu',
  lojas: 'shops-submenu',
  emergencias: 'emergencies-submenu',
  dicas: 'tips-submenu',
  sobre: 'about-submenu',
  ensino: 'education-submenu',
};

// Configurações de tema
export const THEME_CONFIG = {
  AUTO_SWITCH: true, // Ativa mudança automática de tema
  DARK_THEME_START_HOUR: 18, // 18:00
  DARK_THEME_END_HOUR: 6, // 06:00
};

// Exporta objeto com todas as configurações para acesso mais fácil
export default {
  MAP: MAP_CONFIG,
  API,
  OVERPASS_QUERIES,
  LOCATION: LOCATION_CONFIG,
  UI: UI_CONFIG,
  STORAGE: STORAGE_CONFIG,
  SUPPORTED_LANGUAGES,
  DEFAULT_LANGUAGE,
  FEATURE_TO_SUBMENU,
  THEME: THEME_CONFIG,
};
