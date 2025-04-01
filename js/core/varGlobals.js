//=====================================================================
// VARIÁVEIS ESSENCIAIS DO SISTEMA
//=====================================================================
/**
 * Configurações essenciais do mapa e da aplicação
 */
export let map; // Instância principal do mapa (Leaflet)
import { getLocalStorageItem } from '../data/cache.js';

// Idioma atual da interface
export let selectedLanguage = getLocalStorageItem('preferredLanguage', 'pt'); // Idioma atual da interface

/**
 * Variáveis de localização e destino
 */
export let selectedDestination = null; // Permite reatribuição
export let userLocation = null; // Localização atual do usuário capturada pelo GPS
export let userPosition = null; // Posição formatada do usuário para cálculos
export let userCurrentLocation = null; // Cache da última localização conhecida
export let cachedLocation = null; // Localização armazenada para uso quando GPS não disponível

//=====================================================================
// ELEMENTOS VISUAIS DO MAPA
//=====================================================================

/**
 * Marcadores e elementos visuais do mapa
 */
export let markers = []; // Array para armazenar os marcadores no mapa
export let currentRoute = null; // Linha (polyline) da rota atual no mapa
export let userMarker = null; // Marcador visual da posição do usuário
export let userLocationMarker = null; // Marcador alternativo para a localização do usuário
export let destinationMarker = null; // Marcador do destino selecionado
export let currentMarker = null; // Marcador atualmente em foco/selecionado

//=====================================================================
// CONTROLES DE NAVEGAÇÃO E ROTA
//=====================================================================

/**
 * Sistema de navegação e rotas
 */
export let routingControl = null; // Controlador da navegação (Leaflet Routing Machine)
export let currentRouteData = null; // Permitir reatribuição
export let isNavigationActive = false; // Flag que indica se navegação está ativa
export let isnavigationPaused = false; // Flag que indica se navegação está pausada
export let currentRouteSteps = []; // Lista de passos (instruções) da rota atual
export let instructions = []; // Instruções detalhadas de navegação
export let currentStepIndex = 0; // Índice do passo atual na navegação
export let selectedProfile = 'foot-walking'; // Perfil de rota (a pé, bicicleta, carro)
export let navigationWatchId = null; // ID do watchPosition para navegação
export let watchId = null; // ID adicional para monitoramento de posição

/**
 * Parâmetros de navegação e recálculo
 */
export let lastRecalculationTime = 0; // Timestamp do último recálculo de rota
export let lastDeviationTime = 0; // Timestamp do último desvio detectado
export let locationPermissionGranted = false; // Se o usuário permitiu acesso à localização
export let trackingActive = false; // Se o rastreamento contínuo está ativo

//=====================================================================
// INTERFACE DO USUÁRIO E CONTROLES
//=====================================================================

/**
 * Elementos de UI e controle de estado
 */
export let currentSubMenu = null; // Submenu atualmente aberto
export let currentLocation = null; // Localização atual no fluxo da UI
export let currentStep = null; // Passo atual do tutorial
export let tutorialIsActive = false; // Alterado de const para let
export let swiperInstance = null; // Instância do componente de swipe (carrossel)
export let debounceTimer = null; // Timer para limitação de frequência de funções

/**
 * Interação com voz e som
 */
export let speechSynthesisUtterance = null; // Objeto para síntese de voz (instruções faladas)
export let voices = []; // Vozes disponíveis para síntese de voz

/**
 * Dados do usuário
 */
export let searchHistory = []; // Histórico de pesquisas do usuário
export let achievements = []; // Conquistas desbloqueadas pelo usuário
export let favorites = []; // Locais favoritos do usuário

//=====================================================================
// OBJETOS E CONFIGURAÇÕES COMPLEXAS
//=====================================================================

/**
 * Estado de navegação - Objeto que mantém o estado completo da navegação atual
 * Usado para controlar flags, índices e parâmetros durante o fluxo de navegação
 */
export const navigationState = {
  // Controle básico da navegação
  isActive: false, // Se a navegação está ativa
  isPaused: false, // Se a navegação está em pausa
  watchId: null, // ID do watchPosition para monitoramento
  currentStepIndex: 0, // Índice do passo atual na rota
  instructions: [], // Lista de instruções detalhadas para o usuário
  selectedDestination: null, // Destino selecionado para a navegação
  lang: 'pt', // Idioma das instruções de navegação

  // Propriedades para controle da rotação do mapa
  isRotationEnabled: true, // Habilita/desabilita rotação automática do mapa
  quietMode: true, // Modo silencioso - menos atualizações de UI
  rotationInterval: 1000, // Intervalo mínimo entre atualizações de rotação (ms)
  speed: 0, // Velocidade atual do usuário (m/s)
  manualOverride: false, // Se a rotação manual está ativada
  manualAngle: 0, // Ângulo manual (graus) quando override ativado
  tilt: 10, // Inclinação do mapa (graus) para efeito 3D
  rotationMode: 'compass', // Modo de rotação (north-up: fixo ou compass: seguindo direção)
  headingBuffer: [], // Buffer para suavizar leituras de direção
  minRotationDelta: 2, // Mudança mínima (graus) para atualizar rotação
  alpha: 0.2, // Fator de suavização (0-1)
  currentHeading: 0, // Direção atual aplicada (graus)
  lastRotationTime: 0, // Timestamp da última rotação (ms)
};

//=====================================================================
// REFERÊNCIAS DO DOM E CONSTANTES DO SISTEMA
//=====================================================================

/**
 * Referência global para controle de posição
 */
export let positionWatcher = (window.positionWatcher = null); // ID do watchPosition global

/**
 * Elementos DOM frequentemente acessados
 */
export const notificationContainer = document.getElementById(
  'notification-container'
); // Container de notificações
export const navigationInstructionsContainer =
  document.getElementById('route-summary'); // Container de instruções
export const progressBar = document.getElementById('progress-bar'); // Barra de progresso da interface

/**
 * Chaves de API e URLs de serviços externos
 */
export const ORS_API_KEY =
  '5b3ce3597851110001cf62480e27ce5b5dcf4e75a9813468e027d0d3'; // API OpenRouteService
export const apiKey =
  '5b3ce3597851110001cf62480e27ce5b5dcf4e75a9813468e027d0d3'; // Chave de API alternativa
export const NOMINATIM_URL = 'https://nominatim.openstreetmap.org/search'; // API de geocodificação
export const OVERPASS_API_URL = 'https://overpass-api.de/api/interpreter'; // API Overpass para POIs

/**
 * Configurações de consultas Overpass para diferentes categorias de POIs
 * Cada consulta busca pontos de interesse específicos em um raio de 10-15km do centro de Morro
 */
export const queries = {
  'touristSpots-submenu':
    '[out:json];node["tourism"="attraction"](around:10000,-13.376,-38.913);out body;', // Atrações turísticas
  'tours-submenu':
    '[out:json];node["tourism"="information"](around:10000,-13.376,-38.913);out body;', // Informações turísticas
  'beaches-submenu':
    '[out:json];node["natural"="beach"](around:15000,-13.376,-38.913);out body;', // Praias
  'nightlife-submenu':
    '[out:json];node["amenity"="nightclub"](around:10000,-13.376,-38.913);out body;', // Vida noturna
  'restaurants-submenu':
    '[out:json];node["amenity"="restaurant"](around:15000,-13.376,-38.913);out body;', // Restaurantes
  'inns-submenu':
    '[out:json];node["tourism"="hotel"](around:15000,-13.376,-38.913);out body;', // Pousadas/hotéis
  'shops-submenu':
    '[out:json];node["shop"](around:15000,-13.376,-38.913);out body;', // Comércios
  'emergencies-submenu':
    '[out:json];node["amenity"~"hospital|police"](around:10000,-13.376,-38.913);out body;', // Emergências
  'tips-submenu':
    '[out:json];node["tips"](around:10000,-13.376,-38.913);out body;', // Dicas
  'about-submenu':
    '[out:json];node["about"](around:10000,-13.376,-38.913);out body;', // Sobre
  'education-submenu':
    '[out:json];node["education"](around:10000,-13.376,-38.913);out body;', // Educação
};

/**
 * Constantes para gamificação e achievements
 */
export const TOCA_DO_MORCEGO_COORDS = { lat: -13.3782, lon: -38.914 }; // Coordenadas de local especial
export const PARTNER_CHECKIN_RADIUS = 50; // Raio em metros para check-in em parceiros

export function setSelectedLanguage(lang) {
  selectedLanguage = lang;
  console.log(`Idioma global atualizado para: ${selectedLanguage}`);
}
