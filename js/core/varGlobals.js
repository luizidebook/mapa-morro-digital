import { getLocalStorageItem } from '../data/cache.js';

// Variáveis essenciais para a instância do mapa e configuração geral
export let selectedLanguage = getLocalStorageItem('preferredLanguage') || 'pt'; // Idioma selecionado (padrão 'pt')

// Variáveis de destino e localização do usuário
export let selectedDestination = {}; // Objeto com as propriedades do destino (lat, lon, name, etc.)
export let userLocation = null; // Última localização conhecida do usuário (atualizada pelo GPS)
export let lastSelectedFeature = null;
// Variáveis para controle e exibição de marcadores e rota
export let markers = []; // Array que armazena todos os marcadores adicionados ao mapa
export let currentRoute = null; // Camada (polyline) da rota atual exibida no mapa
export let userMarker = null; // Marcador que representa a posição atual do usuário
export let destinationMarker = null; // Marcador para o destino

// Variáveis auxiliares de navegação e controle de UI
export let currentSubMenu = null;
export let currentLocation = null;
export let currentStep = null;
export let tutorialIsActive = false;
export let searchHistory = [];
export let achievements = [];
export let favorites = [];
export let routingControl = null;
export let speechSynthesisUtterance = null;
export let voices = [];
export let currentMarker = null;
export let swiperInstance = null;
export let selectedProfile = 'foot-walking'; // Perfil de rota padrão
export let userLocationMarker = null;
export let userCurrentLocation = null;
export let currentRouteData = null;
export let isNavigationActive = false;
export let isnavigationPaused = false;
export let currentRouteSteps = [];
export let navigationWatchId = null;
export let cachedLocation = null;
export let locationPermissionGranted = false;
export let instructions = [];
export let lastRecalculationTime = 0;
export let lastDeviationTime = 0;
export let currentStepIndex = 0;
export let debounceTimer = null;
export let trackingActive = false;
export let watchId = null;
export let userPosition = null;

// Objeto global para armazenar o estado da navegação
export const navigationState = {
  isActive: false, // Indica se a navegação está ativa
  isPaused: false, // Indica se a navegação está pausada
  watchId: null, // ID do watchPosition (se aplicável)
  currentStepIndex: 0, // Índice do passo atual na rota
  instructions: [], // Array de instruções (passos da rota)
  selectedDestination: null, // Destino selecionado
  lang: 'pt', // Idioma atual
  isRotationEnabled: true, // Habilita ou desabilita a rotação automática
  quietMode: true, // Se true, ativa o modo silencioso (atualizações menos frequentes)
  rotationInterval: 1000, // Intervalo mínimo (em ms) entre atualizações de rotação
  speed: 0, // Velocidade atual do usuário em m/s (atualize conforme necessário)
  manualOverride: false, // Se true, ignora rotações automáticas e usa manualAngle
  manualAngle: 0, // Ângulo manual (em graus) a ser aplicado se manualOverride for true
  tilt: 10, // Inclinação (em graus) aplicada na visualização (ex.: para efeito 3D)
  rotationMode: 'compass', // Define o modo de rotação ("north-up" para fixo no norte ou "compass" para seguir o heading)
  headingBuffer: [], // Buffer para armazenar leituras de heading e suavizar a rotação
  minRotationDelta: 2, // Variação mínima (em graus) necessária para atualizar a rotação
  alpha: 0.2, // Fator de suavização (valor entre 0 e 1)
  currentHeading: 0, // Último heading (em graus) aplicado na rotação
  lastRotationTime: 0, // Timestamp da última atualização de rotação (em ms)
};

// Variável global para o ID do watchPosition (armazenada na propriedade window.positionWatcher)
export let positionWatcher = null;

// Exemplo de contêineres do DOM
export const notificationContainer = document.getElementById(
  'notification-container'
);
export const navigationInstructionsContainer =
  document.getElementById('route-summary');
export const progressBar = document.getElementById('progress-bar');

// Exemplo de chaves e constantes
export const ORS_API_KEY =
  '5b3ce3597851110001cf62480e27ce5b5dcf4e75a9813468e027d0d3';
export const apiKey =
  '5b3ce3597851110001cf62480e27ce5b5dcf4e75a9813468e027d0d3';
export const NOMINATIM_URL = 'https://nominatim.openstreetmap.org/search';
export const OVERPASS_API_URL = 'https://overpass-api.de/api/interpreter';

// Exemplo de queries Overpass
export const queries = {
  'touristSpots-submenu':
    '[out:json];node["tourism"="attraction"](around:10000,-13.376,-38.913);out body;',
  'tours-submenu':
    '[out:json];node["tourism"="information"](around:10000,-13.376,-38.913);out body;',
  'beaches-submenu':
    '[out:json];node["natural"="beach"](around:15000,-13.376,-38.913);out body;',
  'nightlife-submenu':
    '[out:json];node["amenity"="nightclub"](around:10000,-13.376,-38.913);out body;',
  'restaurants-submenu':
    '[out:json];node["amenity"="restaurant"](around:15000,-13.376,-38.913);out body;',
  'inns-submenu':
    '[out:json];node["tourism"="hotel"](around:15000,-13.376,-38.913);out body;',
  'shops-submenu':
    '[out:json];node["shop"](around:15000,-13.376,-38.913);out body;',
  'emergencies-submenu':
    '[out:json];node["amenity"~"hospital|police"](around:10000,-13.376,-38.913);out body;',
  'tips-submenu':
    '[out:json];node["tips"](around:10000,-13.376,-38.913);out body;',
  'about-submenu':
    '[out:json];node["about"](around:10000,-13.376,-38.913);out body;',
  'education-submenu':
    '[out:json];node["education"](around:10000,-13.376,-38.913);out body;',
};

// Exemplo de gamificação
export const TOCA_DO_MORCEGO_COORDS = { lat: -13.3782, lon: -38.914 };
export const PARTNER_CHECKIN_RADIUS = 50;
