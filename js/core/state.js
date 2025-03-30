import { eventBus, EVENT_TYPES } from './eventBus.js';

console.log('state.js loaded');

// Estado inicial da aplicação
const initialState = {
  // Configurações gerais
  config: {
    isDarkMode: false,
    autoAdjustTheme: true,
  },

  // Estado de idioma
  language: {
    selected: 'pt', // pt, en, es, he
    direction: 'ltr', // ltr, rtl (para hebraico)
  },

  // Estado do usuário e sua localização
  user: {
    location: null, // { lat, lon, accuracy }
    heading: 0, // Orientação em graus
    speed: 0, // Velocidade em m/s
    locationUpdateTimestamp: null,
    watcherId: null,
  },

  // Estado do mapa
  map: {
    instance: null, // Instância do mapa Leaflet
    center: { lat: -13.381811, lon: -38.913896 }, // Coordenadas iniciais
    zoom: 16,
    markers: [], // Array de todos os marcadores no mapa
    layers: {
      currentRoute: null,
      alternatives: [],
      userMarker: null,
      destinationMarker: null,
    },
    rotation: {
      enabled: false,
      currentAngle: 0,
      isFirstPersonView: false,
    },
  },

  // Estado da navegação
  navigation: {
    isActive: false,
    isPaused: false,
    currentStepIndex: 0,
    instructions: [],
    route: null,
    startTime: null,
    eta: null, // Tempo estimado de chegada
    distance: 0,
    duration: 0,
    lastRecalculationTime: null,
    destinationReached: false,
  },

  // Estado dos pontos de interesse
  poi: {
    selected: null, // Destino atual selecionado
    lastCategory: null, // Última categoria selecionada
    history: [], // Histórico de POIs visitados
  },

  // Estado da interface
  ui: {
    isMenuOpen: false,
    isSubmenuOpen: false,
    activeSubmenu: null,
    activeModal: null,
    lastSelectedFeature: null,
    searchQuery: '',
    isSearching: false,
    tutorialActive: false,
    tutorialStep: 0,
  },

  // Dados em cache
  cache: {
    searchHistory: [],
    routeHistory: [],
    lastDestinations: [],
  },
};

let state = {};

export function setState(key, value) {
  const keys = key.split('.');
  const lastKey = keys.pop();
  const target = keys.reduce(
    (acc, part) => (acc[part] = acc[part] || {}),
    state
  );
  target[lastKey] = value;
}

export function getState(key) {
  return key.split('.').reduce((acc, part) => acc && acc[part], state) || null;
}

export function resetState() {
  state = {};
}

// Função para obter uma propriedade aninhada de um objeto
function getNestedProperty(obj, path) {
  return path.split('.').reduce((acc, key) => acc && acc[key], obj);
}

// Função para definir uma propriedade aninhada de um objeto
function setNestedProperty(obj, path, value) {
  const keys = path.split('.');
  const lastKey = keys.pop();
  const target = keys.reduce((acc, key) => (acc[key] = acc[key] || {}), obj);
  target[lastKey] = value;
}

// Se você estava usando algum objeto com o nome appState, defina-o aqui
export const appState = { setState, resetState };

// Adicionar listeners para salvar o estado automaticamente quando mudar
eventBus.subscribe(EVENT_TYPES.STATE_CHANGED, (changeData) => {
  // Salvar automaticamente apenas para certas mudanças de estado
  // que são importantes para persistência
  const criticalPaths = ['language', 'config', 'poi.history', 'cache'];

  if (
    changeData.path &&
    criticalPaths.some((path) => changeData.path.startsWith(path))
  ) {
    appState.save();
  }
});

// Exportar funções auxiliares para uso em testes e depuração
export const stateUtils = {
  getNestedProperty,
  setNestedProperty,
};

beforeEach(() => {
  resetState();
});
