/****************************************************************************
 * scripts.js - Exemplo Integrado
 * 
 * Implementa todas as 269 funções do índice, organizadas por seções, 
 * unindo variáveis, constantes e DOM do seu arquivo original.
 ****************************************************************************/

// ============================================================================================
// ======================
// ÍNDICE DE FUNÇÕES – ESTRUTURA ATUALIZADA (TOTAL: 269 FUNÇÕES)
// ======================
// Formato: ID / Nome da função / Descrição (agrupadas por seções)
// ============================================================================================
//
// ========== SEÇÃO 1 – INICIALIZAÇÃO & CONFIGURAÇÃO (Funções 1 – 8) ==========
// --- 1.1. Carregamento e Idioma ---
//  1.  loadResources            - Carrega recursos iniciais (imagens, textos, etc.)
//  2.  setLanguage              - Define e salva o idioma selecionado
//  3.  updateInterfaceLanguage  - Atualiza os textos da interface conforme o idioma
//
// --- 1.2. Configuração de Mapa ---
//  4.  initializeMap            - Inicializa o mapa e configura camadas
//  5.  getTileLayer             - Retorna camada de tiles para o mapa
//  6.  customIcon               - Cria ícone personalizado para marcadores
//
// --- 1.3. Visualização e Animação do Mapa ---
//  7.  resetMapView             - Restaura a visualização original do mapa
//  8.  animateMapToLocation     - Anima a movimentação do mapa até uma localização (flyTo)
//  9. adjustMapWithLocationUser    - Centraliza o mapa no user c/ popup
// 10. adjustMapWithLocation        - Ajusta mapa p/ [lat,lon], offset e zoom
// 11. clearMarkers                 - Remove marcadores do mapa
// 12. restoreFeatureUI             - Restaura interface para a feature anterior

//
//
// ========== SEÇÃO 2 – LOCALIZAÇÃO & RASTREAMENTO (Funções 9 – 19) ==========
// --- 2.1. Obtenção da Localização ---
// 13.  getCurrentLocation       - Obtém a localização atual do usuário
// 14.  useCurrentLocation       - Centraliza o mapa na posição atual do usuário
//
// --- 2.2. Rastreamento Contínuo ---
// 15.  startPositionTracking    - Inicia o rastreamento contínuo da posição do usuário
// 16.  startUserTracking        - Controla o watchPosition do usuário (NOVA; exemplo de stub)
// 17.  updateMapWithUserLocation- Atualiza o mapa com a localização do usuário
// 18.  detectMotion             - Detecta movimento do dispositivo (eventos de devicemotion)
//
// --- 2.3. Centralização e Atualização de Marcadores ---
// 19.  centerMapOnUser          - Centraliza o mapa na localização do usuário
// 20.  updateUserMarker         - Cria/atualiza o marcador do usuário no mapa
// 21.  updateUserPositionOnRoute- Atualiza a posição do usuário sobre a rota ativa
//
// --- 2.4. Finalização do Rastreamento ---
// 22.  stopPositionTracking     - Interrompe o rastreamento de posição (clearWatch)
// 23.  clearAllMarkers          - Remove todos os marcadores do mapa
//
//
// ========== SEÇÃO 3 – GERENCIAMENTO DE ROTAS & NAVEGAÇÃO (Funções 20 – 51) ==========
// --- 3.1. Criação e Plotagem de Rota e Cálculos de Distância ---
// 24.  createRoute              - Inicia a criação da rota no mapa  
// 25.  plotRouteOnMap           - Plota a rota no mapa usando a API ORS
// 26.  calculateDistance        - Calcula a distância (em metros) entre dois pontos (lat/lon)
// 27.  distanceToPolyline       - Calcula a menor distância entre um ponto e uma polilinha
// 28.  pointToSegmentDistance   - Distância de um ponto a um segmento
// 29. clearCurrentRoute            - Remove a rota atual do mapa
//
// --- 3.2. Controle de Navegação ---
// 30.  startNavigation          - Inicia a navegação para o destino selecionado
// 31.  endNavigation            - Finaliza a navegação e limpa estados
// 32.  initNavigationState      - Reinicializa o estado global de navegação
// 33.  pauseNavigation          - Pausa a navegação
// 34.  toggleNavigationPause    - Alterna entre pausar e retomar a navegação
// 35.  updateRealTimeNavigation - Atualiza instruções em tempo real

// --- 3.3. Recalibração e Notificações ---
// 36.  recalculateRoute         - Recalcula a rota em caso de desvio
// 37.  notifyDeviation          - Notifica o usuário sobre desvio
// 38.  validateDestination      - Verifica se o destino possui coordenadas válidas
// 39.  handleRecalculation      - Lida com o recálculo automático
// 40.  highlightNextStepInMap   - Destaque visual do próximo passo no mapa
// 41.  notifyRouteDeviation     - Notificação de desvio de rota
// 42.  notifyNextInstruction    - Exibe próxima instrução de navegação
// 43.  shouldRecalculateRoute   - Verifica se precisa recalcular
// 44.  checkIfUserIdle          - Verifica se o usuário está inativo
//
// --- 3.4. Ajustes e Enriquecimento das instruções exibidas durante a navegação ---
// 45.  analyzeRouteForObstacles - Analisa a rota em busca de obstáculos
// 46.  validateRouteData        - Valida dados retornados pela API de rota
// 47.  startRoutePreview        - Exibe pré-visualização da rota
// 48.  drawPath                 - Desenha uma polyline com o caminho da rota
// 49.  enrichInstructionsWithOSM- Enriquece instruções com dados adicionais do OSM
// 50.  fetchRouteInstructions   - Busca instruções de rota (turn-by-turn) via API ORS
// 51.  finalizeRouteMarkers     - Adiciona marcadores de origem/destino
// 52.  recalcRouteOnDeviation   - Recalcula a rota ao detectar desvio
// 53.  updateRouteFooter        - Atualiza rodapé com dist/tempo
// 54.  updateInstructionBanner  - Atualiza banner com a instrução atual
// 55.  updateNavigationInstructions - Lida com instruções em tempo real
// 56.  updateNavigationProgress - Atualiza barra de progresso
// 57. updateRoutePreview           - Atualiza container com pré-visualização de rota

//
//
// ========== SEÇÃO 4 – INTERFACE & CONTROLE VISUAL (Funções 52 – 71) ==========
// --- 4.1. Mensagens e Barras ---
// 58.  showWelcomeMessage        - Exibe a mensagem de boas-vindas e botões de idioma
// 59.  showNavigationBar         - Mostra a barra de navegação na interface
//
// --- 4.2. Resumo e Destaques ---
// 60.  displayRouteSummary       - Exibe um resumo da rota
// 61.  highlightCriticalInstruction - Destaca instrução crítica
//
// --- 4.3. Exibição/Ocultação de Controles ---
// 62.  hideAllControls           - Oculta todos os controles e botões
// 63.  showRoutePreview          - Exibe pré-visualização da rota
// 64.  hideRoutePreview          - Oculta a pré-visualização da rota
//
// --- 4.4. Elementos Visuais no Mapa ---
// 65.  addDirectionArrows        - Adiciona setas de direção ao longo da rota
// 66.  showUserLocationPopup     - Exibe popup com “Você está aqui!”
//
// --- 4.5. Instruções e Modais ---
// 67.  displayStartNavigationButton - Mostra o botão para iniciar a navegação
// 68.  displayStepByStepInstructions - Lista de instruções roláveis
// 69.  fetchNextThreeInstructions - Retorna as próximas três instruções
// 70.  enqueueInstruction        - Enfileira uma nova instrução
// 71.  updateInstructionModal    - Atualiza o modal de instruções
//
// --- 4.6. Modais e Animações ---
// 72.  toggleModals              - Alterna a visibilidade de modais
// 73.  showModal                 - Exibe um modal específico
// 74.  closeCarouselModal        - Fecha modal do carrossel
// 75.  closeAssistantModal       - Fecha modal do assistente
// 76.  animateInstructionChange  - Anima a troca de instruções
// 77.  updateAssistantModalContent - Atualiza conteúdo do modal do assistente
//
//
// ========== SEÇÃO 5 – SUBMENUS & GERENCIAMENTO DE FUNCIONALIDADES (Funções 71 – 100) ==========
// --- 5.1. Gerenciamento de Submenus ---
// 78.  handleSubmenuButtonClick   - Lógica de clique em botões de submenu
// 79.  handleSubmenuButtonsTouristSpots  
// 80.  handleSubmenuButtonsTours  
// 81.  handleSubmenuButtonsBeaches  
// 82.  handleSubmenuButtonsRestaurants  
// 83.  handleSubmenuButtonsShops  
// 84.  handleSubmenuButtonsEmergencies  
// 85.  handleSubmenuButtonsEducation  
// 86.  handleSubmenuButtonsInns  
// 87.  handleSubmenuButtonsTips  
//
// --- 5.2. Exibição de Botões de Controle ---
// 88.  showControlButtonsTouristSpots    
// 89.  showControlButtonsTour            
// 90.  showControlButtonsBeaches         
// 91.  showControlButtonsNightlife       
// 92.  showControlButtonsRestaurants     
// 93.  showControlButtonsShops           
// 94.  showControlButtonsEmergencies     
// 95.  showControlButtonsTips            
// 96.  showControlButtonsInns            
//
// --- 5.3. Carregamento e Personalização de UI ---
// 97.  loadSubMenu                       - Carrega conteúdo de submenu
//
// --- 5.4. Exibição de Dados Customizados ---
// 98.  displayCustomAbout                - Exibe info "Sobre"
// 99.  displayCustomBeaches              - Exibe praias custom
// 100.  displayCustomEducation            - Exibe dados educacionais
// 101.  displayCustomEmergencies          - Exibe dados de emergência
// 102.  displayCustomInns                 - Exibe dados de pousadas
// 103.  displayCustomItems                - Exibe itens customizados
// 104.  displayCustomNightlife            - Exibe dados de vida noturna
// 105.  displayCustomRestaurants          - Exibe dados de restaurantes
// 106. displayCustomShops                - Exibe dados de lojas
// 107. displayCustomTips            - Exibe dicas (melhores locais, etc.)
// 108. displayCustomTouristSpots    - Exibe pontos turísticos
// 109. displayCustomTours           - Exibe lista de passeios
//
//
// ========== SEÇÃO 6 – VOZ & INTERAÇÃO (Funções 101 – 113) ==========
// --- 6.1. Reconhecimento e Feedback de Voz ---
// 110. startVoiceRecognition      - Inicia o reconhecimento de voz
// 111. visualizeVoiceCapture      - Efeito visual ao capturar voz
// 112. interpretCommand           - Interpreta o comando de voz
// 113. confirmCommandFeedback     - Feedback textual do comando
// 114. confirmAudioCommand        - Mensagem de confirmação do comando
//
// --- 6.2. Integração com POIs e Multimodalidade ---
// 115. detectPOI                  - Detecta pontos de interesse
// 116. validatePOIResults         - Valida resultados de POIs
// 117. displayPOIInAR             - Exibe POIs em AR (Realidade Aumentada)
// 118. integrateMultimodalRoute   - Integra rotas de diferentes modais
//
// --- 6.3. Gerenciamento do Reconhecimento de Voz ---
// 119. retryVoiceRecognition      - Reinicia o reconhecimento de voz após erro
// 220. cancelVoiceRecognition     - Cancela o reconhecimento de voz
//
// --- 6.4. Síntese de Voz ---
// 221. giveVoiceFeedback          - Converte texto em áudio
// 222. speakInstruction           - Fala a instrução via SpeechSynthesis
//
//
// ========== SEÇÃO 7 – CACHE, PERSISTÊNCIA & MODO OFFLINE (Funções 114 – 128) ==========
// --- 7.1. Cache e Destinos ---
// 223. cachePOIs                  - Armazena POIs no cache local
// 224. forcePOICacheRefresh       - Força a atualização do cache de POIs
// 225. loadDestinationsFromCache  - Carrega destinos salvos do cache
// 226. cacheRouteData               - Salva dados da rota no cache
// . loadRouteFromCache           - Carrega rota do cache
//
// --- 7.2. Estado de Navegação e Service Worker ---
// 127. saveNavigationState        - Salva o estado de navegação
// 128. restoreNavigationState     - Restaura o estado de navegação
// 129. saveStateToServiceWorker   - Envia estado ao Service Worker
// 130. autoRestoreState           - Solicita restauração automática de estado
// 131. restoreState               - Restaura o estado completo do sistema
//
// --- 7.3. Manipulação do LocalStorage ---
// 132. getLocalStorageItem        - Recupera item do localStorage
// 133. setLocalStorageItem        - Define item no localStorage
//
// --- 7.4. Histórico e Instruções Offline ---
// 134. removeLocalStorageItem     - Remove item do localStorage
// 135. saveDestinationToCache     - Salva o destino selecionado no cache
// 136. saveRouteToHistory         - Salva rota no histórico
// 137. saveSearchQueryToHistory   - Salva query de pesquisa no histórico
// 138. loadOfflineInstructions    - Carrega instruções offline
// 139. loadSearchHistory            - Carrega e exibe histórico de pesquisas
//
// ========== SEÇÃO 8 – TUTORIAL & ASSISTENTE VIRTUAL (Funções 129 – 136) ==========
// --- 8.1. Fluxo do Tutorial ---
// 140. startTutorial              - Inicia o tutorial interativo
// 141. endTutorial                - Finaliza o tutorial
// 142. nextTutorialStep           - Avança para o próximo passo do tutorial
// 143. previousTutorialStep       - Retorna ao passo anterior
// 144. showTutorialStep           - Exibe conteúdo de um passo do tutorial
//
// --- 8.2. Armazenamento de Respostas e Interesses ---
// 145. storeAndProceed            - Armazena resposta do usuário e prossegue
// 146. generateInterestSteps      - Gera passos com base em interesses
// 147. removeExistingHighlights   - Remove destaques visuais
//
//
// ========== SEÇÃO 9 – UTILITÁRIOS PARA ROTEIRIZAÇÃO (Funções 137 – 146) ==========
// --- 9.1. Mapeamento e Detalhamento de Instruções ---
// 148. mapORSInstruction          - Converte instrução bruta da ORS p/ chave interna
// 149. getDetailedInstructionText - Monta texto final p/ instrução
//
// --- 9.2. Estado e Exibição de Instruções no Mapa ---
// 150. updateNavigationState      - Atualiza objeto global de navegação
// 151. showInstructionsWithTooltip- Exibe instruções com tooltips no mapa
// 152. showInstructionsOnMap      - Exibe instruções no mapa (popups/tooltips)
//
//
// --- 9.3. Controle de Passos de Instrução ---
// 153. goToInstructionStep        - Define passo específico como atual
// 154. nextInstructionStep        - Avança para a próxima instrução
// 155. prevInstructionStep        - Retrocede para a anterior
//
// --- 9.4. Rotas Alternativas e ETA ---
// 156. showRouteAlternatives      - Exibe múltiplas rotas no mapa
// 157. calculateETA               - Estima tempo de chegada (ETA)
//
//
// ========== SEÇÃO 10 – DIVERSOS & EVENTOS (Funções 147 – 157) ==========
// --- 10.1. Gamificação e Parcerias ---
// 158. checkNearbyPartners        - Verifica se o usuário está próximo de parceiros
// 159. handleUserArrivalAtPartner - Lida com chegada do usuário no parceiro
// 160. awardPointsToUser          - Concede pontos ao usuário
//
// --- 10.2. Configuração de Eventos ---
// 161. setupEventListeners        - Configura listeners de clique etc.
// 162. handleUserIdleState        - Detecta inatividade e oferece ação
//
// --- 10.3. Feedback Tátil e Monitoramento ---
// 163. triggerHapticFeedback      - Vibração ou feedback tátil
// 164. monitorUserState           - Monitora estado do usuário (movimento/inatividade)
// 165. trackUserMovement          - Rastreia movimento e atualiza navegação
//
// --- 10.4. Alternativas e Notificações ---
// 166. fallbackToSensorNavigation - Fallback se GPS falhar
// 167. alertGPSFailure            - Alerta em caso de falha de localização
// 168. forceOfflineMode           - Ativa modo offline
//
//
// ========== SEÇÃO 11 – MARKETING & RESERVAS (Funções 158 – 159) ==========
// 169. handleReservation          - Processa reserva do destino
// 170. showMarketingPopup         - Exibe popup de marketing
//
//
// ========== SEÇÃO 12 – CONTROLE DE MENU & INTERFACE (Funções 160 – 180) ==========
// --- 12.1. Alternar Visibilidade dos Elementos ---
// 171. toggleNavigationInstructions - Alterna a visibilidade das instruções
// 172. toggleRouteSummary           - Alterna exibição do resumo de rota
// 173. toggleMenu                   - Alterna exibição do menu lateral
//
// --- 12.2. Ocultando Elementos ---
// 174. hideAllButtons               - Oculta todos os botões de determinada classe
// 175. hideAllControlButtons        - Oculta todos os botões de controle
// 176. hideAssistantModal           - Fecha o modal do assistente
// 177. hideControlButtons           - Oculta botões de controle específicos
// 178. hideNavigationBar            - Oculta a barra de navegação
// 179. hideRouteSummary             - Oculta o resumo da rota
// 180. closeSideMenu                - Fecha o menu lateral
//
// --- 12.3. Destaques e Inicialização ---
// 181. highlightElement             - Destaca visualmente um elemento
// 182. initializeNavigation         - Inicializa controles de navegação
//
// --- 12.4. Verificações e Roteiro ---
// 183. isUserOnStreet               - Verifica via reverse geocoding se usuário está em rua
// 184. renderItinerary              - Renderiza roteiro na interface
//
// --- 12.5. Permissões e Seleção de Destino ---
// 185. requestLocationPermission    - Solicita permissão de localização
// 186. selectDestination            - Define destino selecionado
// 187. sendDestinationToServiceWorker - Envia destino ao SW
// 188. setSelectedDestination       - Define globalmente o destino
// 189. validateSelectedDestination  - Valida se selectedDestination está setado
//
// --- 12.6. Exibindo Botões e POIs Próximos ---
// 190. showButtons                  - Exibe um grupo de botões
// 191. showMenuButtons              - Exibe botões do menu
// 192. showNearbyPOIs               - Mostra POIs próximos
// 193. showStartRouteButton         - Exibe botão para iniciar rota
// 194. displayOSMData               - Exibe dados vindos do Overpass no submenu

//
//
// ========== SEÇÃO 13 – TRADUÇÃO & INTERNACIONALIZAÇÃO (Funções 181 – 185) ==========
// 195. translateInstruction         - Traduz instrução
// 196. translatePageContent         - Atualiza todo texto conforme idioma
// 197. validateTranslations         - Verifica se chaves de tradução estão definidas
// 198. applyLanguage                - Aplica o idioma em toda a interface
// 199. getGeneralText               - Retorna texto traduzido p/ chave 
//
//
// ========== SEÇÃO 15 – MODOS ESPECIAIS & CUSTOMIZAÇÃO (Funções 187 – 188) ==========
// 200. enableDarkMode               - Ativa modo escuro
// 201. enableEcoMode                - Ativa modo econômico
//
//
// ========== SEÇÃO 16 – UTILITÁRIOS & HELPERS (Funções 189 – 194) ==========
// 202. clearElement                 - Remove todos os filhos de um elemento
// 203. updateInstructionsOnProgress - Atualiza as instruções conforme progresso
// 204. updateNavigationControls     - Atualiza controles de navegação
// 205. getNavigationText            - Gera texto descritivo p/ instrução
// 206. getSelectedDestination       - Retorna destino selecionado do cache
// 207. getUrlsForLocation           - Retorna URL associada a local
// 208. searchLocation               - Realiza busca por local (Nominatim + Overpass)
// 209. onDOMContentLoaded           - Executado quando o DOM carrega (busca param. iniciais)
// 210. performControlAction         - Executa ação de controle (próximo passo, etc.)
// 211. openDestinationWebsite       - Abre o site do destino em nova aba
// 212. getImagesForLocation         - Retorna array de imagens para um local
// 213. getDirectionIcon             - Mapeia manobra -> ícone (emoji/seta)
// 214. handleFeatureSelection       - Gerencia seleção de funcionalidades (ex.: praias)
// 215. startCarousel                - Inicia carrossel de imagens
// 216. startRouteCreation           - Inicia criação de rota
// 217. toggleDarkMode               - Alterna modo escuro
// 218. fetchOSMData                 - Busca dados do OSM (Overpass)
//
//
// ========== SEÇÃO 17 – INSTRUÇÕES AVANÇADAS & INTERAÇÃO NO MAPA (Funções 195 – 200) ==========
// 219. showInstructionsWithTooltip  - Exibe instruções no mapa via tooltips
// 220. showInstructionsOnMap        - Exibe instruções no mapa (popups/tooltips)
// 221. goToInstructionStep          - Atualiza a instrução atual para um passo específico
// 222. nextInstructionStep          - Avança para a próxima instrução
// 223. prevInstructionStep          - Retrocede para a instrução anterior
// 224. showRouteAlternatives        - Exibe rotas alternativas no mapa
// 225. handleNextInstructionIfClose - Avança step se usuário estiver próximo
// 226. customizeOSMPopup            - Personaliza estilo/size do popup Leaflet
//
//
// ========== SEÇÃO 18 – ASSISTÊNCIA CONTÍNUA & DESTAQUES (Funções 201 – 205) ==========
// 227. provideContinuousAssistance  - Oferece assistência contínua ao usuário
// 228. removeFloatingMenuHighlights - Remove destaques do menu flutuante
// 229. recalcRouteOnDeviation       - Recalcula rota ao desviar
//
//
// ========== SEÇÃO 19 – FINALIZAÇÃO, LIMPEZA & AJUSTES DE MAPA (Funções 206 – 222) ==========
//
// 230. toggleNavigationInstructions - Alterna exibição das instruções de navegação
// 231. toggleRouteSummary           - Alterna visibilidade do resumo
// 232. updateNavigationProgress     - Atualiza barra de progresso da navegação
// 233. updateProgressBar            - Atualiza barra de progresso genérica
//
//
// ========== SEÇÃO 20 – AJUSTES AVANÇADOS DE MAPA & VISUALIZAÇÃO (Funções 223 – 226) ==========
// 235. visualizeRouteOnPreview      - Exibe rota na pré-visualização
// 236. zoomToSelectedArea           - Aplica zoom ao bounds
// 237. recenterMapOnUser            - Recentraliza mapa no user
// 238. clearMapLayers               - Remove todas as camadas de marcadores/linhas
// 239. showMarketingPopup           - Exibe popup de marketing avançado
// 240. addArrowToMap                - Adiciona ícone de seta no mapa
//
//
// ====================================================================
// VARIÁVEIS GLOBAIS (conforme seu arquivo original)
// ====================================================================

let map; 
let currentSubMenu = null; 
let currentLocation = null; 
let selectedLanguage = getLocalStorageItem('preferredLanguage', 'pt'); 
let currentStep = null; 
let tutorialIsActive = false; 
let searchHistory = []; 
let achievements = []; 
let favorites = []; 
let routingControl = null; 
let speechSynthesisUtterance = null; 
let voices = []; 
let selectedDestination = {}; 
let markers = []; 
let currentMarker = null; 
let swiperInstance = null; 
let selectedProfile = 'foot-walking'; 
let userLocationMarker = null;
let userCurrentLocation = null; 
let currentRouteData = null;
let isNavigationActive = false;
let isnavigationPaused = false;
let currentRouteSteps = []; 
let navigationWatchId = null; 
let currentRoute = null; 
let userMarker = null; 
let destinationMarker = null; 
let cachedLocation = null; 
let locationPermissionGranted = false; 
let instructions = [];
let lastRecalculationTime = 0;
let userLocation = null;
let lastDeviationTime = 0;
let currentStepIndex = 0;
let lastSelectedFeature = null;
let debounceTimer = null;
let trackingActive = false;
let watchId = null;
let userPosition = null;

// Helpers específicos para “debouncedUpdate”
let gpsUpdateTimeout = null;

// Objeto para estado global de navegação
const navigationState = {
  isActive: false,
  isPaused: false,
  watchId: null,
  currentStepIndex: 0,
  instructions: [],
  selectedDestination: null,
  currentRouteLayer: null,
  routeMarkersLayer: null,
  lang: 'pt'
};

// Exemplo de contêineres do DOM
const notificationContainer = document.getElementById("notification-container");
const navigationInstructionsContainer = document.getElementById("route-summary");
const progressBar = document.getElementById("progress-bar");

// Exemplo de chaves e constantes:
const ORS_API_KEY = '5b3ce3597851110001cf62480e27ce5b5dcf4e75a9813468e027d0d3';
const apiKey = '5b3ce3597851110001cf62480e27ce5b5dcf4e75a9813468e027d0d3';
const NOMINATIM_URL = 'https://nominatim.openstreetmap.org/search';
const OVERPASS_API_URL = 'https://overpass-api.de/api/interpreter';

// Exemplo de queries Overpass
const queries = {
  'touristSpots-submenu': '[out:json];node["tourism"="attraction"](around:10000,-13.376,-38.913);out body;',
  'tours-submenu': '[out:json];node["tourism"="information"](around:10000,-13.376,-38.913);out body;',
  'beaches-submenu': '[out:json];node["natural"="beach"](around:15000,-13.376,-38.913);out body;',
  'nightlife-submenu': '[out:json];node["amenity"="nightclub"](around:10000,-13.376,-38.913);out body;',
  'restaurants-submenu': '[out:json];node["amenity"="restaurant"](around:15000,-13.376,-38.913);out body;',
  'inns-submenu': '[out:json];node["tourism"="hotel"](around:15000,-13.376,-38.913);out body;',
  'shops-submenu': '[out:json];node["shop"](around:15000,-13.376,-38.913);out body;',
  'emergencies-submenu': '[out:json];node["amenity"~"hospital|police"](around:10000,-13.376,-38.913);out body;',
  'tips-submenu': '[out:json];node["tips"](around:10000,-13.376,-38.913);out body;',
  'about-submenu': '[out:json];node["about"](around:10000,-13.376,-38.913);out body;',
  'education-submenu': '[out:json];node["education"](around:10000,-13.376,-38.913);out body;'
};

// Exemplo de gamificação
const TOCA_DO_MORCEGO_COORDS = { lat: -13.3782, lon: -38.9140 };
const PARTNER_CHECKIN_RADIUS = 50;


// ====================================================================
// EVENTO DOMContentLoaded
// ====================================================================
document.addEventListener('DOMContentLoaded', () => {
  try {
    initializeMap();         // (Função #4)
    loadResources();         // (Função #1)
    showWelcomeMessage();    // (Função #51)
    setupEventListeners();   // (Função #150)

    initializeTutorialListeners();  // (pode ser parte do tutorial)
    setupSubmenuClickListeners();   // (idem)

  } catch (error) {
    console.error('Erro durante a inicialização:', error);
  }
});

/* ===========================================================================================
   =====================
   SEÇÃO 1 – INICIALIZAÇÃO & CONFIGURAÇÃO (Funções 1 – 12)
   =====================
===========================================================================================*/

/** 
 * 1. loadResources 
 *    Carrega recursos iniciais (imagens, textos, etc.).
 */
async function loadResources(callback) {
  const loader = document.getElementById("loader");
  if (loader) loader.style.display = "block";
  try {
    await new Promise((resolve) => setTimeout(resolve, 1500));
    if (loader) loader.style.display = "none";
    console.log("Recursos carregados com sucesso!");
    if (typeof callback === "function") callback();
  } catch (error) {
    if (loader) loader.style.display = "none";
    console.error("Falha ao carregar recursos:", error);
  }
}

/**
 * 2. setLanguage
 *    Define e salva o idioma selecionado e atualiza a interface.
 */
function setLanguage(lang) {
  try {
    const availableLanguages = ["pt", "en", "es", "he"];
    const defaultLanguage = "pt";

    if (!availableLanguages.includes(lang)) {
      console.warn(
        `${getGeneralText("languageChanged", defaultLanguage)} => ${defaultLanguage}`
      );
      lang = defaultLanguage;
    }

    localStorage.setItem("preferredLanguage", lang);
    selectedLanguage = lang;

    // Traduz tudo
    translatePageContent(lang);

    const welcomeModal = document.getElementById("welcome-modal");
    if (welcomeModal) {
      welcomeModal.style.display = "none";
    }

    console.log(`Idioma definido para: ${lang}`);
    // opcionalmente iniciar tutorial
    showTutorialStep("start-tutorial");
  } catch (error) {
    console.error(getGeneralText("routeError", selectedLanguage), error);
    showNotification(getGeneralText("routeError", selectedLanguage), "error");
  }
}

/**
 * 3. updateInterfaceLanguage
 *    Atualiza os textos da interface conforme o idioma selecionado.
 */
function updateInterfaceLanguage(lang) {
  const elementsToTranslate = document.querySelectorAll("[data-i18n]");
  let missingTranslations = 0;

  elementsToTranslate.forEach((element) => {
    const key = element.getAttribute("data-i18n");
    let translation = getGeneralText(key, lang);

    if (translation.startsWith("⚠️")) {
      missingTranslations++;
      console.warn(`Tradução ausente para: '${key}' em '${lang}'.`);
    }

    if (element.tagName === "INPUT" || element.tagName === "TEXTAREA") {
      element.placeholder = translation;
    } else if (element.hasAttribute("title")) {
      element.title = translation;
    } else {
      element.textContent = translation;
    }
  });

  if (missingTranslations > 0) {
    console.warn(`Total de traduções ausentes: ${missingTranslations}`);
  } else {
    console.log(`Traduções aplicadas com sucesso para o idioma: ${lang}`);
  }
}

/**
 * 4. initializeMap
 * Inicializa o mapa e configura as camadas de tiles.
 */
function initializeMap() {
  if (map) {
    console.warn("Mapa já inicializado.");
    return;
  }
  console.log("Inicializando mapa...");

  // Define as camadas de tiles
  const tileLayers = {
    streets: L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "© OpenStreetMap contributors",
      maxZoom: 19,
    }),
    satellite: L.tileLayer("https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}", {
      attribution: "© Esri",
      maxZoom: 19,
    }),
  };

  // Cria o mapa com uma visão inicial (esta posição será atualizada quando a localização do usuário for obtida)
  map = L.map("map", {
    layers: [tileLayers.streets],
    zoomControl: false,
    maxZoom: 19,
    minZoom: 3,
  }).setView([-13.378, -38.918], 14);

  // Adiciona o controle de camadas
  L.control.layers(tileLayers).addTo(map);

  // (Opcional) Se houver plugin de rotação, adicione-o
  if (L.control.rotate) {
    const rotateControl = L.control.rotate({
      position: 'topright',
      angle: 0,
      // Outras opções do plugin, se necessário
    });
    rotateControl.addTo(map);
    console.log("Controle de rotação adicionado.");
  } else {
    console.warn("Plugin de rotação não encontrado. A rotação será atualizada via CSS na camada de tiles.");
  }

  console.log("Mapa inicializado.");
}

/**
 * 5. getTileLayer
 *    Retorna uma camada de tiles (fallback).
 */
function getTileLayer() {
  return L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: "© OpenStreetMap contributors",
  });
}

/**
 * 6. customIcon
 *    Cria um ícone personalizado para os marcadores.
 */

/**
 * 7. resetMapView
 *    Restaura a visualização original do mapa.
 */
function resetMapView() {
    const defaultView = {
        lat: -13.4125,
        lon: -38.9131,
        zoom: 13
    };
    
    map.setView([defaultView.lat, defaultView.lon], defaultView.zoom);
    console.log('Visualização do mapa restaurada para o estado inicial.');
}

const navigationTexts = {
    en: {
        straight: "Continue straight for {distance} meters.",
        turnLeft: "Turn left in {distance} meters.",
        turnRight: "Turn right in {distance} meters.",
        slightLeft: "Take a slight left in {distance} meters.",
        slightRight: "Take a slight right in {distance} meters.",
        uTurn: "Make a U-turn in {distance} meters.",
        prepareLeft: "Prepare to turn left.",
        prepareRight: "Prepare to turn right.",
        offRoute: "You are off route. Recalculating...",
        arrived: "You have arrived at your destination.",
        closeToTurn: "You are close to your turn. Turn {direction} now.",
        unknown: "Unknown instruction. Please follow the map.",
    },
    pt: {
        straight: "Siga em frente por {distance} metros.",
        turnLeft: "Vire à esquerda em {distance} metros.",
        turnRight: "Vire à direita em {distance} metros.",
        slightLeft: "Vire levemente à esquerda em {distance} metros.",
        slightRight: "Vire levemente à direita em {distance} metros.",
        uTurn: "Faça um retorno em {distance} metros.",
        prepareLeft: "Prepare-se para virar à esquerda.",
        prepareRight: "Prepare-se para virar à direita.",
        offRoute: "Você saiu da rota. Recalculando...",
        arrived: "Você chegou ao seu destino.",
        closeToTurn: "Você está próximo de virar. Vire {direction} agora.",
        unknown: "Instrução desconhecida. Siga o mapa.",
    },
    es: {
        straight: "Continúe recto por {distance} metros.",
        turnLeft: "Gire a la izquierda en {distance} metros.",
        turnRight: "Gire a la derecha en {distance} metros.",
        slightLeft: "Gire ligeramente a la izquierda en {distance} metros.",
        slightRight: "Gire ligeramente a la derecha en {distance} metros.",
        uTurn: "Dé una vuelta en U en {distance} metros.",
        prepareLeft: "Prepárese para girar a la izquierda.",
        prepareRight: "Prepárese para girar a la derecha.",
        offRoute: "Está fuera de la ruta. Recalculando...",
        arrived: "Ha llegado a su destino.",
        closeToTurn: "Está cerca de girar. Gire {direction} ahora.",
        unknown: "Instrucción desconocida. Por favor siga el mapa.",
    },
    he: {
        straight: "המשך ישר למשך {distance} מטרים.",
        turnLeft: "פנה שמאלה בעוד {distance} מטרים.",
        turnRight: "פנה ימינה בעוד {distance} מטרים.",
        slightLeft: "פנה קלות שמאלה בעוד {distance} מטרים.",
        slightRight: "פנה קלות ימינה בעוד {distance} מטרים.",
        uTurn: "בצע פניית פרסה בעוד {distance} מטרים.",
        prepareLeft: "התכונן לפנות שמאלה.",
        prepareRight: "התכונן לפנות ימינה.",
        offRoute: "אתה מחוץ למסלול. מחשב מחדש...",
        arrived: "הגעת ליעד שלך.",
        closeToTurn: "אתה קרוב לפנייה. פנה {direction} עכשיו.",
        unknown: "הוראה לא ידועה. אנא עקוב אחרי המפה.",
    },
};

/**
 * 8. animateMapToLocation
 *    Anima a movimentação do mapa até uma localização específica.
 */



/**
 * 9. adjustMapWithLocationUser
 *    Centraliza o mapa na localização [lat, lon], adicionando um popup "Você está aqui!".
 */
function adjustMapWithLocationUser(lat, lon) {
    map.setView([lat, lon], 18);
    const marker = L.marker([lat, lon]).addTo(map)
        .bindPopup(translations[selectedLanguage].youAreHere || "Você está aqui!")
        .openPopup();
    markers.push(marker);
}

/**
 * 10. adjustMapWithLocation
 *    Ajusta a posição do mapa conforme dados de GPS, definindo zoom, offset e limpando marcadores se desejado.
 */
function adjustMapWithLocation(
  lat,
  lon,
  name = "",
  description = "",
  zoom = 18,
  offsetYPercent = 40,
  shouldClearMarkers = true
) {
  try {
    if (shouldClearMarkers) {
      clearMarkers();
    }
    const marker = L.marker([lat, lon]).addTo(map)
      .bindPopup(`<b>${name}</b><br>${description || "Localização selecionada"}`)
      .openPopup();

    markers.push(marker);

    const mapSize = map.getSize();
    const offsetY = (mapSize.y * Math.min(offsetYPercent, 100)) / 100;
    const projectedPoint = map.project([lat, lon], zoom).subtract([0, offsetY]);
    const adjustedLatLng = map.unproject(projectedPoint, zoom);

    map.setView(adjustedLatLng, zoom);
    console.log(`Mapa ajustado para (${lat}, ${lon}) com zoom ${zoom}.`);
  } catch (error) {
    console.error("Erro ao ajustar o mapa:", error);
  }
}


/**
 * 11. clearMarkers
 *    Remove todos os marcadores do mapa, opcionalmente com um filtro.
 */
function clearMarkers(filterFn) {
  if (typeof filterFn === "function") {
    markers = markers.filter(marker => {
      if (filterFn(marker)) {
        map.removeLayer(marker);
        return false;
      }
      return true;
    });
  } else {
    markers.forEach(marker => map.removeLayer(marker));
    markers = [];
  }
  console.log("Marcadores removidos (com ou sem filtro).");
}

/**
 * 12. restoreFeatureUI
 *    Restaura interface para a última feature selecionada, focando no destino atual.
 */
function restoreFeatureUI(feature) {
    console.log("Restaurando interface para a feature:", feature);

    hideAllControlButtons();
    closeCarouselModal();

    if (!selectedDestination || !selectedDestination.lat || !selectedDestination.lon) {
        console.warn("Nenhum destino previamente selecionado. Abortando restoreFeatureUI.");
        return;
    }

    adjustMapWithLocation(
      selectedDestination.lat,
      selectedDestination.lon,
      selectedDestination.name,
      selectedDestination.description,
      15,
      -10
    );

    showNotification(
      `Último destino: ${selectedDestination.name || ''} restaurado no mapa.`,
      'info'
    );

    switch (feature) {
      case 'pontos-turisticos':
          showControlButtonsTouristSpots(); break;
      case 'passeios':
          showControlButtonsTour(); break;
      case 'praias':
          showControlButtonsBeaches(); break;
      case 'festas':
          showControlButtonsNightlife(); break;
      case 'restaurantes':
          showControlButtonsRestaurants(); break;
      case 'pousadas':
          showControlButtonsInns(); break;
      case 'lojas':
          showControlButtonsShops(); break;
      case 'emergencias':
          showControlButtonsEmergencies(); break;
      default:
          // sem ação
          break;
    }
}


/* ===========================================================================================
   SEÇÃO 2 – LOCALIZAÇÃO & RASTREAMENTO (Funções 13 – 23)
===========================================================================================*/

/**
 * 13. getCurrentLocation
/**
 * getCurrentLocation
 * Obtém a localização atual do usuário uma única vez.
 * Após obter a posição, inicia o tracking contínuo para manter a variável userLocation atualizada.
 */
async function getCurrentLocation(options = { enableHighAccuracy: true, timeout: 15000, maximumAge: 5000 }) {
  console.log("[getCurrentLocation] Solicitando posição atual...");

  if (!("geolocation" in navigator)) {
    showNotification(getGeneralText("trackingError", selectedLanguage), "error");
    return null;
  }

  try {
    const position = await new Promise((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(resolve, reject, options);
    });
    const { latitude, longitude, accuracy } = position.coords;
    userLocation = { latitude, longitude, accuracy };
    console.log("[getCurrentLocation] Localização obtida:", userLocation);

    // Inicia a atualização contínua para que userLocation seja atualizado em tempo real.
    initContinuousLocationTracking();

    return userLocation;
  } catch (error) {
    console.error("[getCurrentLocation] Erro:", error);
    showNotification(getGeneralText("trackingError", selectedLanguage), "error");
    return null;
  }
}



/**
 * 14. useCurrentLocation
 *     Centraliza o mapa na posição atual do usuário.
 */
async function useCurrentLocation() {
  try {
    userLocation = await getCurrentLocation();
    if (!userLocation) return;
    centerMapOnUser(userLocation.latitude, userLocation.longitude);
    console.log("Mapa centralizado na localização do usuário.");
  } catch (error) {
    console.error("Erro em useCurrentLocation:", error);
  }
}

/**
 * 15. startPositionTracking
 *     Inicia o rastreamento contínuo (watchPosition).
 */
function startPositionTracking(options = {}) {
  const { enableHighAccuracy = true, maximumAge = 10000, timeout = 15000 } = options;

  if (!trackingActive) {
    console.warn("[startPositionTracking] trackingActive=false, abortando...");
    return;
  }

  if (!("geolocation" in navigator)) {
    console.warn("[startPositionTracking] Geolocalização não suportada.");
    return;
  }

  if (watchId !== null) {
    console.log("[startPositionTracking] Limpando watch anterior.");
    navigator.geolocation.clearWatch(watchId);
    watchId = null;
  }

  watchId = navigator.geolocation.watchPosition(
    (position) => {
      userPosition = {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
        accuracy: position.coords.accuracy
      };
      console.log("[startPositionTracking] Posição atualizada:", userPosition);
    },
    (error) => {
      console.error("[startPositionTracking] Erro:", error);
      showNotification("Não foi possível obter localização.", "error");
      fallbackToSensorNavigation(); // Ativa fallback
    },
    { enableHighAccuracy, maximumAge, timeout }
  );

  console.log("[startPositionTracking] watchPosition iniciado. watchId =", watchId);
}

/**
 * 16. startUserTracking (Exemplo de stub)
 */
function startUserTracking() {
  console.log("Iniciando rastreamento do usuário...");
  trackingActive = true;
  startPositionTracking();
}

/**
 * 17. updateMapWithUserLocation
 *     Atualiza a visualização do mapa com a localização do usuário.
 */
function updateMapWithUserLocation(zoomLevel = 18) {
  if (!userLocation || !map) {
    console.warn("Localização ou mapa indisponível.");
    return;
  }
  map.setView([userLocation.latitude, userLocation.longitude], zoomLevel);
  console.log("Mapa atualizado para a localização do usuário, zoom:", zoomLevel);
}

/**
 * 18. detectMotion
 *     Detecta movimento do dispositivo (usando devicemotion).
 */
function detectMotion() {
  if ("DeviceMotionEvent" in window) {
    window.addEventListener("devicemotion", (event) => {
      const acc = event.acceleration;
      if (acc.x > 5 || acc.y > 5 || acc.z > 5) {
        console.log("Movimento brusco detectado!");
      }
    });
  } else {
    console.warn("DeviceMotionEvent não suportado.");
  }
}

/**
 * 19. centerMapOnUser
/**
 * Centraliza o mapa na posição do usuário e aplica a rotação (heading).
 *
 * @param {number} lat - Latitude atual do usuário.
 * @param {number} lon - Longitude atual do usuário.
 * @param {number} [heading] - (Opcional) Valor do heading em graus.
 */
function centerMapOnUser(lat, lon, heading) {
  // Centraliza o mapa na posição do usuário com um nível de zoom fixo (ajuste conforme necessário)
  map.setView([lat, lon], 16); // Por exemplo, zoom 16

  // Se a função setMapRotation estiver definida, aplique a rotação no mapa
  if (typeof setMapRotation === 'function' && heading !== undefined) {
    setMapRotation(180);
  }
}


/**
 * 20. updateUserMarker
/**
 * Atualiza ou cria o marcador do usuário e aplica a rotação de acordo com o heading.
 *
 * @param {number} lat - Latitude atual do usuário.
 * @param {number} lon - Longitude atual do usuário.
 * @param {number} [heading] - (Opcional) Valor do heading em graus.
 */
function updateUserMarker(lat, lon, heading) {
  // Se o marcador já existe, atualiza sua posição
  if (window.userMarker) {
    window.userMarker.setLatLng([lat, lon]);
    // Se o heading for fornecido e o elemento do marcador existir, aplica a rotação
    if (heading !== undefined && window.userMarker._icon) {
      window.userMarker._icon.style.transform = `rotate(${heading}deg)`;
    }
  } else {
    // Cria um novo marcador com um ícone personalizado (por exemplo, uma seta)
    window.userMarker = L.marker([lat, lon], {
      icon: L.divIcon({
        className: 'user-marker',
        html: '<i class="fas fa-location-arrow"></i>',  // Exemplo com Font Awesome
        iconSize: [30, 30],
        iconAnchor: [15, 15]
      })
    }).addTo(map);
    if (heading !== undefined && window.userMarker._icon) {
      window.userMarker._icon.style.transform = `rotate(${heading}deg)`;
    }
  }

  // Se existir a função setMapRotation, aplica a rotação no mapa
  if (typeof setMapRotation === 'function' && heading !== undefined) {
    setMapRotation(180);
  }
}



/**
 * 21. updateUserPositionOnRoute
 *     Atualiza a posição do usuário na rota ativa.
 */
function updateUserPositionOnRoute(userLat, userLon, destLat, destLon) {
    const distance = calculateDistance(userLat, userLon, destLat, destLon);

    if (distance === null) {
        showNotification("Erro ao calcular a distância. Verifique os dados.", "error");
        return;
    }

    console.log(`Distância do usuário ao destino: ${distance} metros.`);

    // Recalcula apenas se o usuário estiver fora do buffer e após 5 segundos
    const now = Date.now();
    if (distance > 100 && now - lastRecalculationTime > 5000) {
        console.log("Usuário fora da rota. Iniciando recalculo...");
        showNotification("Recalculando a rota devido a desvio...", "info");
        createRoute(destLat, destLon);
        lastRecalculationTime = now;
    }

    if (distance < 50) {
        console.log("Usuário chegou ao destino.");
        endNavigation();
    }
}

/**
 * 22. stopPositionTracking
 *     Encerra o rastreamento de posição.
 */
function stopPositionTracking() {
  if (navigationWatchId !== null) {
    navigator.geolocation.clearWatch(navigationWatchId);
    navigationWatchId = null;
    console.log("Rastreamento encerrado.");
  }
  userCurrentLocation = null;
  trackingActive = false;
}

/**
 * 23. clearAllMarkers
 *     Remove todos os marcadores do mapa e limpa o array global.
 */
function clearAllMarkers() {
  markers.forEach((marker) => map.removeLayer(marker));
  markers = [];
  if (userMarker) {
    map.removeLayer(userMarker);
    userMarker = null;
  }
  if (currentMarker) {
    map.removeLayer(currentMarker);
    currentMarker = null;
  }
  console.log("Todos os marcadores removidos.");
}


/* ===========================================================================================
   SEÇÃO 3 – GERENCIAMENTO DE ROTAS & NAVEGAÇÃO (Funções 24 – 50)
===========================================================================================*/

/**
 * 24. createRoute
 *    Exemplo de função async para criar rota a partir de userLocation até selectedDestination.
 */
async function createRoute(userLocation) {
    try {
        validateDestination();  // ou validateSelectedDestination()

        const routeData = await plotRouteOnMap(
            userLocation.latitude,
            userLocation.longitude,
            selectedDestination.lat,
            selectedDestination.lon
        );

        if (!routeData) {
            showNotification("Erro ao calcular rota. Tente novamente.", "error");
            return null;
        }

        finalizeRouteMarkers(userLocation.latitude, userLocation.longitude, selectedDestination);
        return routeData;
    } catch (error) {
        console.error("Erro ao criar rota:", error);
        showNotification("Erro ao criar rota. Verifique sua conexão e tente novamente.", "error");
        return null;
    }
}

/**
 * 25. plotRouteOnMap
/**
 * plotRouteOnMap
 * Plota a rota no mapa utilizando a API ORS.
 *
 * @param {number} startLat - Latitude de partida.
 * @param {number} startLon - Longitude de partida.
 * @param {number} destLat - Latitude do destino.
 * @param {number} destLon - Longitude do destino.
 * @param {string} [profile="foot-walking"] - Perfil de navegação.
 * @returns {Promise<Object|null>} - Dados da rota ou null em caso de erro.
 */
async function plotRouteOnMap(startLat, startLon, destLat, destLon, profile = "foot-walking") {
  const url = `https://api.openrouteservice.org/v2/directions/${profile}?api_key=${apiKey}` +
    `&start=${startLon},${startLat}&end=${destLon},${destLat}&instructions=false`;
  try {
    const response = await fetch(url);
    if (!response.ok) {
      console.error("[plotRouteOnMap] Erro ao obter rota:", response.status);
      return null;
    }
    const data = await response.json();
    const coords = data.features[0].geometry.coordinates;
    const latLngs = coords.map(([lon, lat]) => [lat, lon]);
    if (window.currentRoute) {
      map.removeLayer(window.currentRoute);
    }
    window.currentRoute = L.polyline(latLngs, { color: "blue", weight: 5, dashArray: "10,5" }).addTo(map);
    map.fitBounds(window.currentRoute.getBounds(), { padding: [50, 50] });
    console.log("[plotRouteOnMap] Rota plotada com sucesso.");
    return data;
  } catch (error) {
    console.error("[plotRouteOnMap] Erro ao plotar rota:", error);
    return null;
  }
}


/**
 * 26. calculateDistance
 *     Calcula a distância (em metros) entre dois pontos.
 */
function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // Raio da Terra em km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c * 1000;
}

/**
 * 27. distanceToPolyline
 *     Calcula a menor distância entre um ponto e uma polyline.
 */
function distanceToPolyline(userLat, userLon, polylineCoords) {
  let minDist = Infinity;
  for (let i = 0; i < polylineCoords.length - 1; i++) {
    const p1 = polylineCoords[i];
    const p2 = polylineCoords[i + 1];
    const dist = pointToSegmentDistance(userLat, userLon, p1[0], p1[1], p2[0], p2[1]);
    if (dist < minDist) minDist = dist;
  }
  return minDist;
}

/**
 * 28. pointToSegmentDistance
 *     Calcula a distância de um ponto a um segmento.
 */
function pointToSegmentDistance(latA, lonA, lat1, lon1, lat2, lon2) {
  const R = 6371000;
  const rad = Math.PI / 180;
  const Ax = R * lonA * rad * Math.cos(latA * rad);
  const Ay = R * latA * rad;
  const x1 = R * lon1 * rad * Math.cos(lat1 * rad);
  const y1 = R * lat1 * rad;
  const x2 = R * lon2 * rad * Math.cos(lat2 * rad);
  const y2 = R * lat2 * rad;
  const dx = x2 - x1;
  const dy = y2 - y1;
  const segLen2 = dx * dx + dy * dy;
  if (segLen2 === 0) return Math.sqrt((Ax - x1) ** 2 + (Ay - y1) ** 2);
  let t = ((Ax - x1) * dx + (Ay - y1) * dy) / segLen2;
  t = Math.max(0, Math.min(1, t));
  const projx = x1 + t * dx;
  const projy = y1 + t * dy;
  return Math.sqrt((Ax - projx) ** 2 + (Ay - projy) ** 2);
}

/**
 * 29. clearCurrentRoute
/**
 * clearCurrentRoute
 * Remove a rota atual do mapa (se existir).
 */
function clearCurrentRoute() {
  if (window.currentRoute) {
    map.removeLayer(window.currentRoute);
    window.currentRoute = null;
    console.log("[clearCurrentRoute] Rota removida do mapa.");
  } else {
    console.log("[clearCurrentRoute] Nenhuma rota ativa para remover.");
  }
}


/**
 * 30. startNavigation
 /**
 * startNavigation
 * Inicia a navegação para o destino selecionado.
 *
 * Responsabilidades:
 * - Valida o destino e a disponibilidade da localização.
 * - Inicializa o estado de navegação.
 * - Obtém as instruções de rota e plota a rota no mapa.
 * - Adiciona marcadores de origem e destino.
 * - Inicia o monitoramento da posição do usuário, atualizando a posição,
 *   as instruções e aplicando a rotação do mapa conforme o heading.
 */
async function startNavigation() {
  if (!validateDestination(selectedDestination)) {
    return;
  }

  if (!userLocation) {
    showNotification("Localização não disponível. Permita o acesso à localização primeiro.", "error");
    return;
  }
  
  // Inicializa o estado de navegação
  initNavigationState();
  navigationState.isActive = true;
  navigationState.isPaused = false;
  navigationState.currentStepIndex = 0;

  // Obtém as instruções de rota
  let routeInstructions = await fetchRouteInstructions(
    userLocation.latitude,
    userLocation.longitude,
    selectedDestination.lat,
    selectedDestination.lon,
    selectedLanguage
  );
  if (!routeInstructions || routeInstructions.length === 0) {
    showNotification(getGeneralText("noInstructions", selectedLanguage), "error");
    return;
  }

  // Enriquecer as instruções (se aplicável)
  routeInstructions = await enrichInstructionsWithOSM(routeInstructions, selectedLanguage);
  navigationState.instructions = routeInstructions;

  // Plota a rota no mapa e obtém os dados da rota
  const routeData = await plotRouteOnMap(
    userLocation.latitude,
    userLocation.longitude,
    selectedDestination.lat,
    selectedDestination.lon
  );
  
  // Adiciona os marcadores de origem e destino
  finalizeRouteMarkers(userLocation.latitude, userLocation.longitude, selectedDestination);
  
  hideRouteSummary();
  updateInstructionBanner(routeInstructions[0], selectedLanguage);
  updateRouteFooter(routeData, selectedLanguage);
  giveVoiceFeedback(getGeneralText("navigationStarted", selectedLanguage));

  // Inicia o monitoramento da posição via GPS
  if (window.positionWatcher) {
    navigator.geolocation.clearWatch(window.positionWatcher);
  }
  window.positionWatcher = navigator.geolocation.watchPosition(
    (pos) => {
      if (navigationState.isPaused) return;
      const { latitude, longitude, heading } = pos.coords;
      userLocation = { latitude, longitude, accuracy: pos.coords.accuracy, heading: heading };

      // Atualiza o marcador do usuário
      updateUserMarker(latitude, longitude);

      // Se houver heading válido, rotaciona o mapa
      if (heading !== null && !isNaN(heading)) {
        setMapRotation(180);
      }

      // Atualiza a navegação em tempo real
      updateRealTimeNavigation(
        latitude,
        longitude,
        navigationState.instructions,
        selectedDestination.lat,
        selectedDestination.lon,
        selectedLanguage
      );

      // Verifica se é necessário recalcular a rota
      if (shouldRecalculateRoute(latitude, longitude, navigationState.instructions)) {
        notifyDeviation();
      }
    },
    (error) => {
      console.error("Erro no watchPosition:", error);
      showNotification(getGeneralText("trackingError", selectedLanguage), "error");
    },
    { enableHighAccuracy: true }
  );

  console.log("startNavigation: Navegação iniciada com sucesso.");
}


/**
 * 31. endNavigation
/**
 * endNavigation
 * Finaliza a navegação, limpando estados e parando o monitoramento.
 */
function endNavigation() {
  console.log("[endNavigation] Encerrando navegação...");

  // Seta estado para inativo
  navigationState.isActive = false;
  navigationState.isPaused = false;
  
  // Remove o watchPosition, se estiver ativo
  if (window.positionWatcher !== undefined) {
    navigator.geolocation.clearWatch(window.positionWatcher);
    window.positionWatcher = undefined;
  }

  // Limpa o modal de instruções
  const instructionsModal = document.getElementById("navigation-instructions");
  if (instructionsModal) {
    instructionsModal.classList.add("hidden");
    instructionsModal.innerHTML = "";
  }
  
  // Limpa a rota e os marcadores do mapa
  clearCurrentRoute();
  clearFinalizedRouteMarkers();
  hideInstructionBanner();
  hideRouteFooter();
  initNavigationState();
  
  // Reseta a rotação do mapa
  setMapRotation(0);

  showNotification(getGeneralText("navEnded", navigationState.lang), "info");
  console.log("[endNavigation] Navegação encerrada com sucesso.");
}


/**
 * 32. initNavigationState
/**
 * initNavigationState
 * Reinicializa o objeto global de navegação, limpando estados anteriores.
 */
function initNavigationState() {
  console.log("[initNavigationState] Reinicializando estado de navegação...");
  navigationState.isActive = false;
  navigationState.isPaused = false;
  navigationState.watchId = null;
  navigationState.currentStepIndex = 0;
  navigationState.instructions = [];
  navigationState.selectedDestination = null;
  if (navigationState.currentRouteLayer) {
    map.removeLayer(navigationState.currentRouteLayer);
    navigationState.currentRouteLayer = null;
  }
  console.log("[initNavigationState] Estado de navegação reinicializado.");
}

/**
 * 33. pauseNavigation
 *     Pausa a navegação.
 */
function pauseNavigation() {
  if (!navigationState.isActive) {
    console.warn("Navegação não está ativa para pausar.");
    return;
  }
  if (navigationState.isPaused) {
    console.log("Navegação já está pausada.");
    return;
  }
  navigationState.isPaused = true;
  if (window.positionWatcher) {
    navigator.geolocation.clearWatch(window.positionWatcher);
    window.positionWatcher = null;
  }
  showNotification(getGeneralText("navPaused", navigationState.lang), "info");
  console.log("Navegação pausada.");
}

/**
 * 34. toggleNavigationPause
 *     Alterna entre pausar e retomar a navegação.
 */
function toggleNavigationPause() {
  if (navigationState.isPaused) {
    navigationState.isPaused = false;
    showNotification(getGeneralText("navResumed", navigationState.lang), "success");
    if (navigationState.instructions && selectedDestination) {
      window.positionWatcher = navigator.geolocation.watchPosition(
        (pos) => {
          updateRealTimeNavigation(
            pos.coords.latitude,
            pos.coords.longitude,
            navigationState.instructions,
            selectedDestination.lat,
            selectedDestination.lon,
            navigationState.lang
          );
        },
        (err) => {
          console.error("Erro ao retomar watchPosition:", err);
          showNotification(getGeneralText("trackingError", navigationState.lang), "error");
        },
        { enableHighAccuracy: true }
      );
    }
    console.log("Navegação retomada.");
  } else {
    pauseNavigation();
  }
  console.log("toggleNavigationPause executado.");
}

/**
 * 35. updateRealTimeNavigation
/**
 * Atualiza a navegação em tempo real com base na nova posição do usuário.
 *
 * @param {number} lat - Nova latitude do usuário.
 * @param {number} lon - Nova longitude do usuário.
 * @param {Array<Object>} instructions - Conjunto de instruções de navegação.
 * @param {number} destLat - Latitude do destino.
 * @param {number} destLon - Longitude do destino.
 * @param {string} lang - Código do idioma selecionado.
 * @param {number} [heading] - (Opcional) O heading atual do usuário.
 */
function updateRealTimeNavigation(lat, lon, instructions, destLat, destLon, lang, heading) {
  // Atualiza o marcador do usuário, agora passando também o heading
  updateUserMarker(lat, lon, heading);

  // Atualiza a interface, por exemplo, reavalia a instrução atual
  // (supondo que você tenha uma função para atualizar o banner/instruções)
  if (instructions && instructions.length > 0) {
    const currentStepIndex = navigationState.currentStepIndex;
    const currentInstruction = instructions[currentStepIndex];
    if (currentInstruction) {
      updateInstructionBanner(currentInstruction, lang);
    }
  }

  // (Opcional) Se desejar ajustar a centralização do mapa mantendo a rotação:
  centerMapOnUser(lat, lon, heading);
}





/**
 * 36. recalculateRoute
 *     Recalcula a rota em caso de desvio.
 */
async function recalculateRoute(userLat, userLon, destLat, destLon, options = {}) {
  const { lang = "pt", bigDeviation = false, profile = "foot-walking" } = options;
  console.log("Recalculando rota...");
  try {
    if (window.positionWatcher) {
      navigator.geolocation.clearWatch(window.positionWatcher);
      window.positionWatcher = null;
    }
    if (bigDeviation) {
      showNotification(getGeneralText("routeDeviated", lang), "warning");
      speakInstruction(getGeneralText("offRoute", lang), lang === "pt" ? "pt-BR" : "en-US");
    }
    const newInstructions = await fetchRouteInstructions(userLat, userLon, destLat, destLon, lang, profile);
    if (!newInstructions || newInstructions.length === 0) {
      showNotification(getGeneralText("noInstructions", lang), "error");
      return;
    }
    clearCurrentRoute();
    const routeData = await plotRouteOnMap(userLat, userLon, destLat, destLon, profile);
    updateNavigationState({
      instructions: newInstructions,
      currentStepIndex: 0,
      isActive: true,
      isPaused: false,
    });
    showNotification(getGeneralText("routeRecalculatedOk", lang), "success");
    highlightNextStepInMap(newInstructions[0]);
    window.positionWatcher = navigator.geolocation.watchPosition(
      (pos) => {
        if (navigationState.isPaused) return;
        const { latitude, longitude } = pos.coords;
        updateRealTimeNavigation(
          latitude,
          longitude,
          newInstructions,
          destLat,
          destLon,
          lang
        );
      },
      (err) => {
        console.error("Erro no watchPosition durante recalc:", err);
        fallbackToSensorNavigation();
      },
      { enableHighAccuracy: true }
    );
  } catch (error) {
    console.error("Erro em recalculateRoute:", error);
    showNotification(getGeneralText("routeError", lang), "error");
  }
}

/**
 * 37. notifyDeviation
/**
 * notifyDeviation
 * Notifica o usuário sobre o desvio da rota e dispara o recálculo.
 */
function notifyDeviation() {
  const lang = navigationState.lang || "pt";
  showNotification(getGeneralText("routeDeviated", lang), "warning");
  if (userLocation && selectedDestination) {
    // Chama recalcRoute com parâmetro bigDeviation para indicar desvio significativo
    recalculateRoute(
      userLocation.latitude,
      userLocation.longitude,
      selectedDestination.lat,
      selectedDestination.lon,
      { bigDeviation: true, lang }
    );
  }
  console.log("[notifyDeviation] Notificação de desvio enviada e recálculo iniciado.");
}


/**
 * 38. validateDestination
 *     Verifica se o destino selecionado possui coordenadas válidas.
 */
/**
 * validateDestination
 * Verifica se o destino fornecido (ou o global selectedDestination) possui coordenadas válidas.
 * Agora também verifica os limites geográficos.
 *
 * @param {Object} [destination=selectedDestination] - Objeto com as propriedades lat e lon.
 * @returns {boolean} - true se o destino for válido; false caso contrário.
 */
function validateDestination(destination = selectedDestination) {
  console.log("[validateDestination] Verificando destino...");
  
  if (!destination) {
    showNotification(getGeneralText("invalidDestination", navigationState.lang), "warning");
    console.warn("[validateDestination] Destino não fornecido.");
    return false;
  }
  
  const { lat, lon } = destination;
  if (
    typeof lat !== "number" ||
    typeof lon !== "number" ||
    Number.isNaN(lat) ||
    Number.isNaN(lon)
  ) {
    showNotification(getGeneralText("invalidDestination", navigationState.lang), "warning");
    console.warn("[validateDestination] Propriedades lat/lon inválidas:", destination);
    return false;
  }
  
  // Verifica limites: latitude entre -90 e 90; longitude entre -180 e 180
  if (lat < -90 || lat > 90 || lon < -180 || lon > 180) {
    showNotification(getGeneralText("invalidDestination", navigationState.lang), "warning");
    console.warn("[validateDestination] Coordenadas fora dos limites:", destination);
    return false;
  }
  
  console.log("[validateDestination] Destino válido:", destination);
  return true;
}


/**
 * 39. handleRecalculation
 *     Lida com o recálculo automático da rota.
 */
function handleRecalculation() {
  if (checkIfUserIdle()) {
    pauseNavigation();
  } else {
    recalculateRoute(userLocation.latitude, userLocation.longitude, selectedDestination.lat, selectedDestination.lon);
  }
  console.log("handleRecalculation executado.");
}

/**
 * 40. highlightNextStepInMap
 *     Destaca visualmente o próximo passo da rota no mapa.
 */
function highlightNextStepInMap(step) {
  if (!step || !step.lat || !step.lon) {
    console.warn("Step inválido para destaque.");
    return;
  }
  if (window.nextStepMarker) {
    map.removeLayer(window.nextStepMarker);
    window.nextStepMarker = null;
  }
  const highlightIcon = L.divIcon({ className: "blinking-arrow" });
  window.nextStepMarker = L.marker([step.lat, step.lon], { icon: highlightIcon }).addTo(map);
  window.nextStepMarker.bindPopup(`Próximo passo: ${step.text}`).openPopup();
  console.log("Próximo passo destacado:", step.text);
}

/**
 * 41. notifyRouteDeviation
 *     Exibe notificação de que o usuário está fora da rota.
 */
function notifyRouteDeviation() {
  showNotification("Você está fora da rota. Ajuste seu caminho.", "warning");
}

/**
 * 42. notifyNextInstruction
 *     Exibe a próxima instrução de navegação.
 */
function notifyNextInstruction(instruction) {
  showNotification(`Próxima instrução: ${instruction}`, "info");
  console.log("Instrução notificada:", instruction);
}

/**
 * 43. shouldRecalculateRoute
/**
 * shouldRecalculateRoute
 * Verifica se o usuário está suficientemente distante do ponto atual (passo)
 * para disparar o recálculo da rota.
 *
 * @param {number} userLat - Latitude atual do usuário.
 * @param {number} userLon - Longitude atual do usuário.
 * @param {Array} instructions - Array de instruções da rota.
 * @returns {boolean} - true se a rota precisar ser recalculada; false caso contrário.
 */
function shouldRecalculateRoute(userLat, userLon, instructions) {
  const currentStep = instructions[navigationState.currentStepIndex];
  if (!currentStep) return false;
  const distance = calculateDistance(userLat, userLon, currentStep.lat, currentStep.lon);
  if (distance > 50) { // Se o usuário estiver mais de 50 metros distante do passo atual
    console.log("[shouldRecalculateRoute] Desvio detectado: distância =", distance);
    return true;
  }
  return false;
}


/**
 * 44. checkIfUserIdle
 *     Verifica se o usuário está inativo.
 *     (Stub: retorna false como exemplo.)
 */
function checkIfUserIdle(timeout = 300000) {
  // Exemplo: sempre retorna false
  return false;
}

/**
 * 45. analyzeRouteForObstacles
 *     Analisa a rota em busca de obstáculos.
 */
function analyzeRouteForObstacles(route) {
  if (!route || !route.features || !route.features[0]) {
    console.error("Dados de rota inválidos para análise.");
    return;
  }
  const warnings = route.features[0].properties?.warnings || [];
  if (warnings.length > 0) {
    showNotification("Obstáculo detectado à frente. Ajustando rota.", "warning");
  } else {
    console.log("Nenhum obstáculo detectado.");
  }
}

/**
 * 46. validateRouteData
 *     Valida os dados retornados pela API de rota.
 */
function validateRouteData(routeData) {
  if (!routeData || !routeData.features || routeData.features.length === 0) {
    showNotification("Erro ao carregar dados da rota.", "error");
    return false;
  }
  const coords = routeData.features[0].geometry.coordinates;
  if (!coords || coords.length === 0) {
    showNotification("Rota sem coordenadas.", "error");
    return false;
  }
  console.log("Dados de rota validados.");
  return true;
}

/**
 * 47. startRoutePreview
 *     Exibe a pré-visualização da rota antes de iniciar a navegação.
 */
function startRoutePreview() {
    if (!currentRouteData) {
        showNotification("Nenhuma rota disponível para pré-visualização.", "error");
        return;
    }
    // Exibe o resumo e o botão
    displayRouteSummary(currentRouteData);
    displayStartNavigationButton();
}

/**
 * 48. drawPath
 *     Desenha uma polyline representando a rota no mapa.
 */
function drawPath(userLat, userLon, instructions, lang) {
  try {
    if (window.navigationPath) {
      map.removeLayer(window.navigationPath);
    }
    const latLngs = instructions.map(step => [step.lat, step.lon]);
    latLngs.unshift([userLat, userLon]);
    window.navigationPath = L.polyline(latLngs, {
      color: "blue",
      weight: 6,
      dashArray: "10, 5"
    }).addTo(map);
    addInteractiveArrowsOnRoute(latLngs);
    map.fitBounds(window.navigationPath.getBounds(), { padding: [50, 50] });
    console.log("Rota desenhada com sucesso.");
  } catch (error) {
    console.error("Erro ao desenhar rota:", error);
    showNotification(getGeneralText("failedToPlotRoute", lang), "error");
  }
}

/**
 * 49. enrichInstructionsWithOSM
/**
 * enrichInstructionsWithOSM
 * Enriquece as instruções com dados adicionais do OSM (ex.: POIs próximos).
 *
 * @param {Array} instructions - Array de instruções.
 * @param {string} lang - Código do idioma.
 * @returns {Promise<Array>} - Array de instruções possivelmente enriquecidas.
 */
async function enrichInstructionsWithOSM(instructions, lang = 'pt') {
  try {
    const enriched = await Promise.all(
      instructions.map(async (step) => {
        // Exemplo: fetchPOIs retorna um array de POIs próximos (defina essa função conforme sua API)
        const pois = await fetchPOIs(step.lat, step.lon);
        if (pois && pois.length > 0) {
          const extraMsg = getGeneralText("pois_nearby", lang).replace("{count}", pois.length);
          step.enrichedInfo = extraMsg;
        }
        return step;
      })
    );
    console.log("[enrichInstructionsWithOSM] Instruções enriquecidas.");
    return enriched;
  } catch (error) {
    console.error("[enrichInstructionsWithOSM] Erro ao enriquecer instruções:", error);
    return instructions; // fallback: retorna as instruções originais
  }
}


/**
 * 50. fetchRouteInstructions
/**
 * fetchRouteInstructions
 * Busca instruções de rota (turn-by-turn) via API ORS.
 *
 * @param {number} startLat - Latitude de início.
 * @param {number} startLon - Longitude de início.
 * @param {number} destLat - Latitude de destino.
 * @param {number} destLon - Longitude de destino.
 * @param {string} lang - Código do idioma (ex.: "pt").
 * @param {string} [profile="foot-walking"] - Perfil de navegação.
 * @returns {Promise<Array>} - Array de instruções formatadas.
 */
async function fetchRouteInstructions(startLat, startLon, destLat, destLon, lang = "pt", profile = "foot-walking") {
  const apiUrl = `https://api.openrouteservice.org/v2/directions/${profile}?api_key=${apiKey}` +
    `&start=${startLon},${startLat}&end=${destLon},${destLat}&instructions=true&language=${lang}`;
  
  try {
    const response = await fetch(apiUrl);
    if (!response.ok) {
      console.error("[fetchRouteInstructions] Erro na API:", response.status);
      return [];
    }
    const data = await response.json();
    const steps = data.features[0].properties.segments[0].steps;
    const coords = data.features[0].geometry.coordinates;
    // Mapeia cada step para um objeto mais simples
    const finalSteps = steps.map((step, index) => {
      const [lon, lat] = coords[step.way_points[0]];
      const { maneuverKey, placeName } = mapORSInstruction(step.instruction);
      const text = step.instruction || getGeneralText(maneuverKey, lang);
      return {
        id: index + 1,
        raw: step.instruction,
        maneuverKey,
        streetName: placeName,
        text,
        distance: Math.round(step.distance),
        lat,
        lon
      };
    });
    console.log("[fetchRouteInstructions] Instruções obtidas:", finalSteps.length);
    return finalSteps;
  } catch (error) {
    console.error("[fetchRouteInstructions] Erro ao buscar instruções:", error);
    return [];
  }
}


/**
 * 51. finalizeRouteMarkers
 * Adiciona marcadores de origem e destino no mapa.
 *
 * @param {number} userLat - Latitude do ponto de partida.
 * @param {number} userLon - Longitude do ponto de partida.
 * @param {Object} destination - Objeto com lat, lon e (opcionalmente) name do destino.
 */
function finalizeRouteMarkers(userLat, userLon, destination) {
  // Armazena o marcador de partida globalmente
  window.originRouteMarker = L.marker([userLat, userLon])
    .addTo(map)
    .bindPopup("📍 Ponto de partida!")
    .openPopup();

  // Armazena o marcador de destino globalmente
  window.destRouteMarker = L.marker([destination.lat, destination.lon])
    .addTo(map)
    .bindPopup(`🏁 Destino: ${destination.name || "Destino"}`)
    .openPopup();

  console.log("[finalizeRouteMarkers] Marcadores de origem e destino adicionados.");
}


/**
 * 52. recalcRouteOnDeviation
 *     Recalcula a rota ao detectar que o usuário se desviou.
 */
async function recalcRouteOnDeviation(userLat, userLon, destLat, destLon) {
  console.log("Recalculando rota devido ao desvio...");
  if (currentRoute) {
    map.removeLayer(currentRoute);
    currentRoute = null;
  }
  const data = await plotRouteOnMap(userLat, userLon, destLat, destLon);
  if (!data) {
    console.warn("Falha ao recalcular rota (plot).");
    return;
  }
  const newInstructions = await fetchRouteInstructions(userLat, userLon, destLat, destLon, selectedLanguage);
  if (!newInstructions || newInstructions.length === 0) {
    console.warn("Instruções vazias após recalc.");
    return;
  }
  navigationState.instructions = newInstructions;
  navigationState.currentStepIndex = 0;
  navigationState.isPaused = false;
  updateInstructionBanner(newInstructions[0], selectedLanguage);
  console.log("Rota recalculada com sucesso.");
}

/**
 * 53. updateRouteFooter
/**
 * updateRouteFooter
 * Atualiza o rodapé da rota com resumo (distância e tempo estimado).
 *
 * @param {Object} routeData - Dados da rota retornados pela API.
 * @param {string} lang - Código do idioma.
 */
function updateRouteFooter(routeData, lang = selectedLanguage) {
  if (!routeData || !routeData.features || routeData.features.length === 0) {
    console.warn("[updateRouteFooter] Dados de rota inválidos para atualização.");
    return;
  }
  const summary = routeData.features[0].properties.summary;
  const etaMinutes = Math.round(summary.duration / 60);
  const distanceKm = (summary.distance / 1000).toFixed(2);
  
  const routeTimeElem = document.getElementById("route-time");
  const routeDistanceElem = document.getElementById("route-distance");
  if (routeTimeElem) {
    routeTimeElem.textContent = `${etaMinutes} ${getGeneralText("minutes", lang)}`;
  }
  if (routeDistanceElem) {
    routeDistanceElem.textContent = `${distanceKm} km`;
  }
  
  const footer = document.getElementById("route-footer");
  if (footer) {
    footer.classList.remove("hidden");
    footer.style.display = "flex";
  }
  console.log("[updateRouteFooter] Rodapé atualizado: Tempo =", etaMinutes, "min; Distância =", distanceKm, "km.");
}


/**
 * 54. updateInstructionBanner
/**
 * updateInstructionBanner
 * Atualiza o banner de instruções na interface.
 *
 * @param {Object} instruction - Objeto contendo os detalhes da instrução atual.
 * @param {string} lang - Código do idioma.
 */
function updateInstructionBanner(instruction, lang = selectedLanguage) {
  const banner = document.getElementById("instruction-banner");
  if (!banner) {
    console.error("Banner de instruções não encontrado (#instruction-banner).");
    return;
  }
  const arrowEl = document.getElementById("instruction-arrow");
  const mainEl = document.getElementById("instruction-main");
  const detailsEl = document.getElementById("instruction-details");

  // Valores padrão para cada propriedade
  const maneuverKey = instruction.maneuverKey || "unknown";
  const text = instruction.text || "Instrução não disponível";
  const streetName = instruction.streetName || "";
  const distance = (instruction.distance !== undefined) ? instruction.distance : "0";

  // Verifica se getDirectionIcon existe; se não, usa um valor padrão
  const directionIcon = (typeof getDirectionIcon === "function")
    ? getDirectionIcon(maneuverKey)
    : "➡️";

  if (arrowEl) {
    arrowEl.textContent = directionIcon;
  }
  if (mainEl) {
    mainEl.textContent = text;
  }
  if (detailsEl) {
    detailsEl.textContent = `${distance}m - ${streetName}`;
  }
  banner.classList.remove("hidden");
  banner.style.display = "flex";
}

/**
 * 55. updateNavigationInstructions
 *     Atualiza as instruções de navegação em tempo real conforme o usuário se move.
 */
function updateNavigationInstructions(userLat, userLon, instructions, destLat, destLon, lang = selectedLanguage) {
  if (!instructions || instructions.length === 0) {
    console.warn("Nenhuma instrução disponível para atualizar.");
    return;
  }
  const currentIndex = navigationState.currentStepIndex;
  const currentStep = instructions[currentIndex];
  if (!currentStep) {
    console.warn("Nenhum passo atual encontrado.");
    return;
  }
  const dist = calculateDistance(userLat, userLon, currentStep.lat, currentStep.lon);
  console.log(`Distância até a instrução atual: ${dist.toFixed(1)} m`);
  if (dist < 10) {
    navigationState.currentStepIndex++;
    if (navigationState.currentStepIndex < instructions.length) {
      const nextStep = instructions[navigationState.currentStepIndex];
      updateInstructionBanner(nextStep, lang);
      speakInstruction(nextStep.text, lang === "pt" ? "pt-BR" : "en-US");
    } else {
      showNotification(getGeneralText("destinationReached", lang), "success");
      endNavigation();
    }
  }
}

/**
 * 56. updateNavigationProgress
 *     Atualiza a barra de progresso da navegação.
 */
function updateNavigationProgress(progress) {
  const progressBar = document.getElementById("progress-bar");
  if (!progressBar) return;
  progressBar.style.width = `${progress}%`;
  progressBar.setAttribute("aria-valuenow", progress.toString());
  console.log(`Progresso atualizado: ${progress}%`);
}

/**
 * 57. updateRoutePreview
 *     Atualiza container com pré-visualização de rota
 */
 function updateRoutePreview(contentHTML) {
  const previewContainer = document.getElementById("route-preview");
  if (!previewContainer) {
    console.error("Container de pré-visualização não encontrado.");
    return;
  }
  previewContainer.innerHTML = contentHTML;
  previewContainer.classList.remove("hidden");
  previewContainer.style.display = "block";
  console.log("Pré-visualização da rota atualizada.");
}

/***********************************************************************************************
 * FIM DA SEÇÃO 3 – GERENCIAMENTO DE ROTAS & NAVEGAÇÃO (Funções 20 – 50)
 ***********************************************************************************************/

/****************************************************************************
 * SEÇÃO 4 – INTERFACE & CONTROLE VISUAL (Funções 51 – 70)
 ****************************************************************************/

/**
 * 58. showWelcomeMessage - Exibe a mensagem de boas-vindas e habilita os botões de idioma.
 */
function showWelcomeMessage() {
  const modal = document.getElementById("welcome-modal");
  if (!modal) return;
  modal.style.display = "block";
  document.querySelectorAll(".lang-btn").forEach(btn => {
    btn.style.pointerEvents = "auto";
  });
  console.log("Mensagem de boas-vindas exibida.");
}

/**
 * 59. showNavigationBar - Mostra a barra de navegação na interface.
 */
function showNavigationBar() {
  const navBar = document.getElementById("navigation-bar");
  if (navBar) {
    navBar.style.display = "block";
    console.log("Barra de navegação exibida.");
  }
}

/**
 * 60. displayRouteSummary - Exibe um resumo da rota no painel lateral.
 */
function displayRouteSummary(routeData, lang = selectedLanguage) {
  const summary = routeData.features[0].properties.summary;
  const etaMinutes = Math.round(summary.duration / 60);
  const distanceKm = (summary.distance / 1000).toFixed(2);

  const routeSummaryTitle = getGeneralText("route_summary_title", lang);
  const routeDistanceLabel = getGeneralText("route_distance", lang);
  const routeEtaLabel = getGeneralText("route_eta", lang);
  const minutesTxt = getGeneralText("minutes", lang);

  const summaryHTML = `
    <div class="route-summary">
      <h3>${routeSummaryTitle}</h3>
      <p id="route-distance">${routeDistanceLabel} <strong>${distanceKm} km</strong></p>
      <p id="route-eta">${routeEtaLabel} <strong>${etaMinutes} ${minutesTxt}</strong></p>
    </div>
  `;

  const summaryContainer = document.getElementById("route-summary");
  if (summaryContainer) {
    summaryContainer.innerHTML = summaryHTML;
    summaryContainer.classList.remove("hidden");
    summaryContainer.style.display = "block";
    console.log("Resumo da rota exibido.");
  }
}

/**
 * 61. highlightCriticalInstruction - Destaca uma instrução crítica na interface.
 */
function highlightCriticalInstruction(instruction) {
  const instructionElement = document.getElementById("instruction");
  if (instructionElement) {
    instructionElement.innerHTML = `<strong>${instruction}</strong>`;
    console.log("Instrução crítica destacada:", instruction);
  }
}

/**
 * 62. hideAllControls - Oculta todos os controles e botões da interface.
 */
function hideAllControls(hideInstructions = false) {
  const controlButtons = document.querySelectorAll(".control-btn");
  controlButtons.forEach(btn => {
    btn.style.display = "none";
  });
  console.log("Todos os controles ocultados.");
  if (hideInstructions) {
    const instructionsModal = document.getElementById("navigation-instructions");
    if (instructionsModal) {
      instructionsModal.classList.add("hidden");
      console.log("Modal de instruções também ocultado.");
    }
  }
}

/**
 * 63. showRoutePreview - Exibe a pré-visualização da rota.
 */
function showRoutePreview(routeData) {
  const summaryContainer = document.getElementById("route-preview");
  if (!summaryContainer) {
    console.error("Elemento de pré-visualização não encontrado.");
    return;
  }
  const summary = routeData.features[0]?.properties?.summary;
  if (!summary) {
    console.error("Resumo da rota indisponível.");
    return;
  }
  const distance = (summary.distance / 1000).toFixed(2);
  const eta = Math.round(summary.duration / 60);
  summaryContainer.innerHTML = `
    <div class="route-preview-header">
      <h3>Resumo da Rota</h3>
      <p>Distância: ${distance} km</p>
      <p>Tempo estimado: ${eta} minutos</p>
    </div>
    <div class="route-preview-icons">
      <span>🚶</span>
      <span>➡️</span>
      <span>🏁</span>
    </div>
  `;
  summaryContainer.classList.remove("hidden");
  console.log("Pré-visualização da rota exibida.");
}

/**
 * 64. hideRoutePreview - Oculta a pré-visualização da rota.
 */
function hideRoutePreview() {
  const previewContainer = document.getElementById("route-preview");
  if (!previewContainer) {
    console.error("Elemento #route-preview não encontrado.");
    return;
  }
  previewContainer.classList.add("hidden");
  previewContainer.innerHTML = "";
  console.log("Pré-visualização da rota oculta.");
}

/**
 * 65. addDirectionArrows - Adiciona setas de direção no mapa.
 */
function addDirectionArrows(coordinates) {
  coordinates.forEach(point => {
    addArrowToMap(point);
  });
  console.log("Setas de direção adicionadas ao mapa.");
}

/**
 * 66. showUserLocationPopup - Exibe um popup com a localização do usuário.
 */
function showUserLocationPopup(lat, lon) {
  const timestamp = new Date().toLocaleString(selectedLanguage || "pt-BR");
  const message = getGeneralText("youAreHere", selectedLanguage) || "Você está aqui!";
  L.popup()
    .setLatLng([lat, lon])
    .setContent(`
      <strong>${message}</strong><br>
      Latitude: ${lat.toFixed(5)}, Longitude: ${lon.toFixed(5)}<br>
      Horário: ${timestamp}
    `)
    .openOn(map);
  console.log("Popup de localização do usuário exibido.");
}

/**
 * 67. displayStartNavigationButton - Exibe o botão para iniciar a navegação.
 */
function displayStartNavigationButton() {
  const startNavButton = document.getElementById("start-navigation-button");
  const endNavButton = document.getElementById("navigation-end-btn");
  const tutorialMenuButton = document.getElementById("tutorial-menu-btn");

  if (!startNavButton || !endNavButton || !tutorialMenuButton) {
    console.error("Um ou mais botões de navegação não foram encontrados.");
    return;
  }

  hideAllControls();
  startNavButton.style.display = "block";
  tutorialMenuButton.style.display = "block";
  endNavButton.style.display = "none";

  startNavButton.addEventListener("click", () => {
    if (!isNavigationActive) {
      startNavigation();
      isNavigationActive = true;
      startNavButton.style.display = "none";
      endNavButton.style.display = "block";
      hideRouteSummary();
    }
  });

  endNavButton.addEventListener("click", () => {
    endNavigation();
    isNavigationActive = false;
    startNavButton.style.display = "none";
    endNavButton.style.display = "none";
  });
  console.log("Botão para iniciar navegação exibido.");
}

/**
 * 68. displayStepByStepInstructions - Exibe uma lista rolável de instruções.
 */
function displayStepByStepInstructions(instructions, lang = "pt") {
  const container = document.getElementById("full-instructions-list");
  if (!container) {
    console.error("[displayStepByStepInstructions] #full-instructions-list não encontrado.");
    return;
  }

  container.innerHTML = ""; // Limpa
  if (!instructions || instructions.length === 0) {
    container.innerHTML = `<p>${getGeneralText("noInstructionsAvailable", lang)}</p>`;
    return;
  }

  instructions.forEach((step, idx) => {
    const detailText = getDetailedInstructionText(step, lang);
    const directionIcon = getDirectionIcon(step.maneuverKey);

    const li = document.createElement("li");
    li.innerHTML = `<span class="direction-arrow">${directionIcon}</span> ${detailText}`;
    container.appendChild(li);
  });

  container.classList.remove("hidden");
  console.log(`[displayStepByStepInstructions] Exibidas ${instructions.length} instruções.`);
}

/**
 * 69. fetchNextThreeInstructions - Retorna as próximas três instruções.
 */
function fetchNextThreeInstructions(route) {
  return route.instructions.slice(0, 3);
}

/**
 * 70. enqueueInstruction - Adiciona uma nova instrução à fila.
 */
function enqueueInstruction(instruction) {
  const queue = document.getElementById("instruction-queue");
  if (queue) {
    const li = document.createElement("li");
    li.textContent = instruction;
    queue.appendChild(li);
    console.log("Instrução enfileirada:", instruction);
  }
}

/**
 * 71. updateInstructionModal - Atualiza o modal de instruções com a instrução atual.
 */
// Placeholder: se updateInstructionModal não estiver definida, implemente uma versão simples
function updateInstructionModal(instructions, currentIndex, lang) {
  console.log(`Modal atualizado para o passo ${currentIndex}: ${instructions[currentIndex].text}`);
  // Implemente a lógica para atualizar o modal de instruções
}

// Placeholder: se speakInstruction não estiver definida, implemente uma versão simples
function speakInstruction(text, voiceLang = "pt-BR") {
  if (!('speechSynthesis' in window)) {
    console.warn("speechSynthesis não suportado.");
    return;
  }
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = voiceLang;
  window.speechSynthesis.speak(utterance);
}

// Placeholder: se highlightNextStepInMap não estiver definida, implemente uma versão simples
function highlightNextStepInMap(step) {
  if (!step || !step.lat || !step.lon) {
    console.warn("Step inválido para destacar.");
    return;
  }
  if (window.nextStepMarker) {
    map.removeLayer(window.nextStepMarker);
  }
  const highlightIcon = L.divIcon({ className: "blinking-arrow" });
  window.nextStepMarker = L.marker([step.lat, step.lon], { icon: highlightIcon }).addTo(map);
  window.nextStepMarker.bindPopup(`Próximo passo: ${step.text}`).openPopup();
}

/**
 * 72. toggleModals - Alterna a visibilidade de todos os modais.
 */
function toggleModals() {
  const modals = document.querySelectorAll(".modal");
  modals.forEach(modal => {
    modal.style.display = modal.style.display === "none" ? "block" : "none";
  });
  console.log("Modais alternados.");
}

/**
 * 73. showModal - Exibe um modal específico pelo ID.
 */
function showModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) {
    modal.style.display = "block";
    console.log(`Modal ${modalId} exibido.`);
  } else {
    console.error(`Modal com ID ${modalId} não encontrado.`);
  }
}

/**
 * 74. closeCarouselModal - Fecha o modal do carrossel.
 */
function closeCarouselModal() {
    const carouselModal = document.getElementById('carousel-modal');
    if (carouselModal) {
        carouselModal.style.display = 'none';
    }
}

/**
 * 75. closeAssistantModal - Fecha o modal do assistente.
 */
function closeAssistantModal() {
    const modal = document.getElementById('assistant-modal'); // Seleciona o modal pelo ID
    if (modal) {
        modal.style.display = 'none'; // Define o display como 'none' para ocultar o modal
        console.log('Modal do assistente fechado.'); // Log para depuração
    } else {
        console.error('Modal do assistente não encontrado.'); // Log de erro caso o modal não exista
    }
}

/**
 * 76. animateInstructionChange - Aplica animação na troca de instruções.
 */
function animateInstructionChange() {
  const activeStep = document.querySelector(".instruction-step.active-instruction");
  if (activeStep) {
    activeStep.classList.add("fade-in");
    setTimeout(() => activeStep.classList.remove("fade-in"), 300);
    console.log("Animação de troca de instrução aplicada.");
  }
}

/**
 * 77. updateAssistantModalContent - Atualiza o conteúdo do modal do assistente.
 */
function updateAssistantModalContent(step, content) {
    const modalContent = document.querySelector('#assistant-modal .modal-content');
    if (!modalContent) {
        console.error('Elemento de conteúdo do modal não encontrado.');
        return;
   
    } else {
        // Atualiza o conteúdo padrão para outros passos
        modalContent.innerHTML = `<p>${content}</p>`;
    }

    // Exibe o modal
    document.getElementById('assistant-modal').style.display = 'block';

}

// Passos do tutorial
const tutorialSteps = [
    {
        step: 'start-tutorial',
        message: {
            pt: "Sua aventura inesquecível em Morro de São Paulo começa aqui!",
            es: "¡Tu aventura inolvidable en Morro de São Paulo comienza aquí!",
            en: "Your unforgettable adventure in Morro de São Paulo starts here!",
            he: "ההרפתקה הבלתי נשכחת שלך במורו דה סאו פאולו מתחילה כאן!"
        },
        action: () => {
            showButtons(['tutorial-iniciar-btn']);
        }
    },
    {
        step: 'ask-interest',
        message: {
            pt: "O que você está procurando em Morro de São Paulo? Escolha uma das opções abaixo.",
            es: "¿Qué estás buscando en Morro de São Paulo? Elige una de las opciones a continuación.",
            en: "What are you looking for in Morro de São Paulo? Choose one of the options below.",
            he: "מה אתה מחפש במורו דה סאו פאולו? בחר אחת מהאפשרויות הבאות."
        },
        action: () => {
            showButtons(['pontos-turisticos-btn', 'passeios-btn', 'praias-btn', 'festas-btn', 'restaurantes-btn', 'pousadas-btn', 'lojas-btn', 'emergencias-btn']);
            clearAllMarkers();
            closeSideMenu();
        }
    },
    ...generateInterestSteps(),
    {
        step: 'end-tutorial',
        message: {
            pt: "Parabéns! Você concluiu o tutorial! Aproveite para explorar todas as funcionalidades disponíveis.",
            es: "¡Felicidades! Has completado el tutorial. Disfruta explorando todas las funciones disponibles.",
            en: "Congratulations! You have completed the tutorial! Enjoy exploring all the available features.",
            he: "מזל טוב! סיימת את המדריך! תהנה מחקר כל התכונות הזמינות."
        },
        action: () => {
            showButtons(['tutorial-end-btn']);
        }
    }
];



/***********************************************************************************************
 * FIM DA SEÇÃO 4 – INTERFACE & CONTROLE VISUAL (Funções 51 – 70)
 ***********************************************************************************************/

// ====================================================================
// FIM DA SEÇÃO 4
// ====================================================================

/****************************************************************************
 * SEÇÃO 5 – SUBMENUS & GERENCIAMENTO DE FUNCIONALIDADES (Funções 71 – 100)
 ****************************************************************************/

/**
 * 78. handleSubmenuButtonClick - Lida com cliques em botões de submenu.
 * Atualiza o destino global e executa uma função de controle.
 */
function handleSubmenuButtonClick(lat, lon, name, description, controlButtonsFn) {
    // Atualiza o estado global do destino
    selectedDestination = { lat, lon, name, description };

    // Ajusta o mapa
    adjustMapWithLocation(lat, lon, name);

    // Notificação
    giveVoiceFeedback(`Destino ${name} selecionado com sucesso.`);
}

function handleSubmenuButtons(lat, lon, name, description, images, feature) {
    // 1. Obtém URLs adicionais relacionados ao local
    const url = getUrlsForLocation(name);

    // 2. Limpa os marcadores existentes no mapa e ajusta para a localização selecionada
    clearMarkers();
    adjustMapWithLocation(lat, lon, name, description, 15, -10);


    // 3. Atualiza o estado global e salva o destino selecionado no cache
    selectedDestination = { name, description, lat, lon, images, feature, url };
    saveDestinationToCache(selectedDestination)
        .then(() => {
    
    // 4. Envia o destino para o Service Worker e limpa rotas atuais
            sendDestinationToServiceWorker(selectedDestination);
            clearCurrentRoute();
        })
        .catch(error => {
            console.error('Erro ao salvar destino no cache:', error);
        });

    // 5. Exibe botões de controle específicos com base na funcionalidade
    switch (feature) {
        case 'passeios':
            showControlButtonsTour();
            break;
        case 'festas':
            showControlButtonsNightlife();
            break;
        case 'restaurantes':
            showControlButtonsRestaurants();
            break;
        case 'pousadas':
            showControlButtonsInns();
            break;
        case 'lojas':
            showControlButtonsShops();
            break;
        case 'emergencias':
            showControlButtonsEmergencies();
            break;
        case 'dicas':
            showControlButtonsTips();
            break;
        case 'pontos-turisticos':
            showControlButtonsTouristSpots();
            break;
        case 'praias':
            showControlButtonsBeaches();
            break;
        case 'ensino':
            showControlButtonsEducation();
            break;
        // 7. Funcionalidade não reconhecida: Exibe botões genéricos
        default:
            showControlButtons();
            break;
    }
}


/**
 * 79. handleSubmenuButtonsTouristSpots - Gerencia submenu de pontos turísticos.
 */
function handleSubmenuButtonsTouristSpots(lat, lon, name, description) {
  handleSubmenuButtonClick(lat, lon, name, description, showControlButtonsTouristSpots);
}

/**
 * 80. handleSubmenuButtonsTours - Gerencia submenu de tours.
 */
function handleSubmenuButtonsTours(lat, lon, name, description) {
  handleSubmenuButtonClick(lat, lon, name, description, showControlButtonsTour);
}

/**
 * 81. handleSubmenuButtonsBeaches - Gerencia submenu de praias.
 */
function handleSubmenuButtonsBeaches(lat, lon, name, description) {
  handleSubmenuButtonClick(lat, lon, name, description, showControlButtonsBeaches);
}

/**
 * 82. handleSubmenuButtonsRestaurants - Gerencia submenu de restaurantes.
 */
function handleSubmenuButtonsRestaurants(lat, lon, name, description) {
  handleSubmenuButtonClick(lat, lon, name, description, showControlButtonsRestaurants);
}

/**
 * 83. handleSubmenuButtonsShops - Gerencia submenu de lojas.
 */
function handleSubmenuButtonsShops(lat, lon, name, description) {
  handleSubmenuButtonClick(lat, lon, name, description, showControlButtonsShops);
}

/**
 * 84. handleSubmenuButtonsEmergencies - Gerencia submenu de emergências.
 */
function handleSubmenuButtonsEmergencies(lat, lon, name, description) {
  handleSubmenuButtonClick(lat, lon, name, description, showControlButtonsEmergencies);
}

/**
 * 85. handleSubmenuButtonsEducation - Gerencia submenu de educação.
 */
function handleSubmenuButtonsEducation(lat, lon, name, description) {
  handleSubmenuButtonClick(lat, lon, name, description, showControlButtonsEducation);
}

/**
 * 86. handleSubmenuButtonsInns - Gerencia submenu de pousadas.
 */
function handleSubmenuButtonsInns(lat, lon, name, description) {
  handleSubmenuButtonClick(lat, lon, name, description, showControlButtonsInns);
}

/**
 * 87. handleSubmenuButtonsTips - Gerencia submenu de dicas.
 */
function handleSubmenuButtonsTips(lat, lon, name, description) {
  handleSubmenuButtonClick(lat, lon, name, description, showControlButtonsTips);
}

/**
 * 88. showControlButtonsTouristSpots - Exibe controles específicos para pontos turísticos.
 */
function showControlButtonsTouristSpots() {
  hideAllControlButtons();
  closeAssistantModal();
  const createRouteBtn = document.getElementById("create-route-btn");
  const aboutMoreBtn = document.getElementById("about-more-btn");
  const tutorialMenuBtn = document.getElementById("tutorial-menu-btn");
  if (createRouteBtn) createRouteBtn.style.display = "flex";
  if (aboutMoreBtn) aboutMoreBtn.style.display = "flex";
  if (tutorialMenuBtn) tutorialMenuBtn.style.display = "flex";
  console.log("Controles para pontos turísticos exibidos.");
}

/**
 * 89. showControlButtonsTour - Exibe controles específicos para tours.
 */
function showControlButtonsTour() {
  hideAllControlButtons();
  closeAssistantModal();
  const tourBtn = document.getElementById("tour-btn");
  const createRouteBtn = document.getElementById("create-route-btn");
  const aboutMoreBtn = document.getElementById("about-more-btn");
  const tutorialMenuBtn = document.getElementById("tutorial-menu-btn");
  if (tourBtn) tourBtn.style.display = "flex";
  if (createRouteBtn) createRouteBtn.style.display = "flex";
  if (aboutMoreBtn) aboutMoreBtn.style.display = "flex";
  if (tutorialMenuBtn) tutorialMenuBtn.style.display = "flex";
  console.log("Controles para tours exibidos.");
}

/**
 * 90. showControlButtonsBeaches - Exibe controles específicos para praias.
 */
function showControlButtonsBeaches() {
  hideAllControlButtons();
  closeAssistantModal();
  const reserveChairsBtn = document.getElementById("reserve-chairs-btn");
  const createRouteBtn = document.getElementById("create-route-btn");
  const aboutMoreBtn = document.getElementById("about-more-btn");
  const tutorialMenuBtn = document.getElementById("tutorial-menu-btn");
  if (reserveChairsBtn) reserveChairsBtn.style.display = "none";
  if (createRouteBtn) createRouteBtn.style.display = "flex";
  if (aboutMoreBtn) aboutMoreBtn.style.display = "flex";
  if (tutorialMenuBtn) tutorialMenuBtn.style.display = "flex";
  console.log("Controles para praias exibidos.");
}

/**
 * 91. showControlButtonsNightlife - Exibe controles específicos para vida noturna.
 */
function showControlButtonsNightlife() {
  hideAllControlButtons();
  closeAssistantModal();
  const createRouteBtn = document.getElementById("create-route-btn");
  const aboutMoreBtn = document.getElementById("about-more-btn");
  const tutorialMenuBtn = document.getElementById("tutorial-menu-btn");
  const buyTicketBtn = document.getElementById("buy-ticket-btn");
  if (createRouteBtn) createRouteBtn.style.display = "flex";
  if (aboutMoreBtn) aboutMoreBtn.style.display = "flex";
  if (tutorialMenuBtn) tutorialMenuBtn.style.display = "flex";
  if (buyTicketBtn) buyTicketBtn.style.display = "flex";
  console.log("Controles para vida noturna exibidos.");
}

/**
 * 92. showControlButtonsRestaurants - Exibe controles específicos para restaurantes.
 */
function showControlButtonsRestaurants() {
  hideAllControlButtons();
  closeAssistantModal();
  const createRouteBtn = document.getElementById("create-route-btn");
  const aboutMoreBtn = document.getElementById("about-more-btn");
  const tutorialMenuBtn = document.getElementById("tutorial-menu-btn");
  const reserveRestaurantsBtn = document.getElementById("reserve-restaurants-btn");
  if (createRouteBtn) createRouteBtn.style.display = "flex";
  if (aboutMoreBtn) aboutMoreBtn.style.display = "flex";
  if (tutorialMenuBtn) tutorialMenuBtn.style.display = "flex";
  if (reserveRestaurantsBtn) reserveRestaurantsBtn.style.display = "flex";
  console.log("Controles para restaurantes exibidos.");
}

/**
 * 93. showControlButtonsShops - Exibe controles específicos para lojas.
 */
function showControlButtonsShops() {
  hideAllControlButtons();
  closeAssistantModal();
  const createRouteBtn = document.getElementById("create-route-btn");
  const aboutMoreBtn = document.getElementById("about-more-btn");
  const speakAttendentBtn = document.getElementById("speak-attendent-btn");
  const tutorialMenuBtn = document.getElementById("tutorial-menu-btn");
  if (createRouteBtn) createRouteBtn.style.display = "flex";
  if (aboutMoreBtn) aboutMoreBtn.style.display = "flex";
  if (speakAttendentBtn) speakAttendentBtn.style.display = "flex";
  if (tutorialMenuBtn) tutorialMenuBtn.style.display = "flex";
  console.log("Controles para lojas exibidos.");
}

/**
 * 94. showControlButtonsEmergencies - Exibe controles específicos para emergências.
 */
function showControlButtonsEmergencies() {
  hideAllControlButtons();
  closeAssistantModal();
  const createRouteBtn = document.getElementById("create-route-btn");
  const aboutMoreBtn = document.getElementById("about-more-btn");
  const callBtn = document.getElementById("call-btn");
  const tutorialMenuBtn = document.getElementById("tutorial-menu-btn");
  if (createRouteBtn) createRouteBtn.style.display = "flex";
  if (aboutMoreBtn) aboutMoreBtn.style.display = "flex";
  if (callBtn) callBtn.style.display = "flex";
  if (tutorialMenuBtn) tutorialMenuBtn.style.display = "flex";
  console.log("Controles para emergências exibidos.");
}

/**
 * 95. showControlButtonsTips - Exibe controles específicos para dicas.
 */
function showControlButtonsTips() {
  hideAllControlButtons();
  closeAssistantModal();
  const aboutMoreBtn = document.getElementById("about-more-btn");
  const tutorialMenuBtn = document.getElementById("tutorial-menu-btn");
  if (aboutMoreBtn) aboutMoreBtn.style.display = "none";
  if (tutorialMenuBtn) tutorialMenuBtn.style.display = "flex";
  console.log("Controles para dicas exibidos.");
}

/**
 * 96. showControlButtonsInns - Exibe controles específicos para pousadas.
 */
function showControlButtonsInns() {
  hideAllControlButtons();
  closeAssistantModal();
  const reserveInnsBtn = document.getElementById("reserve-inns-btn");
  const createRouteBtn = document.getElementById("create-route-btn");
  const aboutMoreBtn = document.getElementById("about-more-btn");
  const tutorialMenuBtn = document.getElementById("tutorial-menu-btn");
  if (reserveInnsBtn) reserveInnsBtn.style.display = "none";
  if (createRouteBtn) createRouteBtn.style.display = "flex";
  if (aboutMoreBtn) aboutMoreBtn.style.display = "flex";
  if (tutorialMenuBtn) tutorialMenuBtn.style.display = "flex";
  console.log("Controles para pousadas exibidos.");
}

/***********************************************************************************************
 * Seção 5.4 – Exibição de Dados Customizados (Funções 92 – 100)
 ***********************************************************************************************/
// 97. loadSubMenu - Carrega conteúdo do submenu
function loadSubMenu(subMenuId, feature) {
    // 1. Verifica se o submenu existe
    const subMenu = document.getElementById(subMenuId);
    if (!subMenu) {
        console.error(`Submenu não encontrado: ${subMenuId}`);
        return;
    }

    console.log(`Carregando submenu: ${subMenuId} para a feature: ${feature}`);

    // 2. Exibe o submenu
    subMenu.style.display = 'block';

    // 3. Seleciona a funcionalidade específica para exibição
    switch (feature) {
        case 'pontos-turisticos':
            displayCustomTouristSpots();
            break;
        case 'passeios':
            displayCustomTours();
            break;
        case 'praias':
            displayCustomBeaches();
            break;
        case 'festas':
            displayCustomNightlife();
            break;
        case 'restaurantes':
            displayCustomRestaurants();
            break;
        case 'pousadas':
            displayCustomInns();
            break;
        case 'lojas':
            displayCustomShops();
            break;
        case 'emergencias':
            displayCustomEmergencies();
            break;
        case 'dicas':
            displayCustomTips();
            break;
        case 'sobre':
            displayCustomAbout();
            break;
        case 'ensino':
            displayCustomEducation();
            break;
        default:
            // 4. Lida com funcionalidades não reconhecidas
            console.error(`Feature não reconhecida ao carregar submenu: ${feature}`);
            break;
    }
}

/**
 * 98. displayCustomAbout - Exibe informações personalizadas sobre "Sobre".
 */
function displayCustomAbout() {
  const about = [
    { name: "Missão", lat: -13.3766787, lon: -38.9172057, description: "Nossa missão é oferecer a melhor experiência aos visitantes." },
    { name: "Serviços", lat: -13.3766787, lon: -38.9172057, description: "Conheça todos os serviços que oferecemos." },
    { name: "Benefícios para Turistas", lat: -13.3766787, lon: -38.9172057, description: "Saiba como você pode se beneficiar ao visitar Morro de São Paulo." },
    { name: "Benefícios para Moradores", lat: -13.3766787, lon: -38.9172057, description: "Veja as vantagens para os moradores locais." },
    { name: "Benefícios para Pousadas", lat: -13.3766787, lon: -38.9172057, description: "Descubra como as pousadas locais podem se beneficiar." },
    { name: "Benefícios para Restaurantes", lat: -13.3766787, lon: -38.9172057, description: "Saiba mais sobre os benefícios para os restaurantes." },
    { name: "Benefícios para Agências de Turismo", lat: -13.3766787, lon: -38.9172057, description: "Veja como as agências de turismo podem se beneficiar." },
    { name: "Benefícios para Lojas e Comércios", lat: -13.3766787, lon: -38.9172057, description: "Descubra os benefícios para lojas e comércios." },
    { name: "Benefícios para Transportes", lat: -13.3766787, lon: -38.9172057, description: "Saiba mais sobre os benefícios para transportes." },
    { name: "Impacto em MSP", lat: -13.3766787, lon: -38.9172057, description: "Conheça o impacto do nosso projeto em Morro de São Paulo." }
  ];
  const subMenu = document.getElementById("about-submenu");
  subMenu.innerHTML = "";
  about.forEach(item => {
    const btn = document.createElement("button");
    btn.className = "submenu-item";
    btn.textContent = item.name;
    btn.setAttribute("data-lat", item.lat);
    btn.setAttribute("data-lon", item.lon);
    btn.setAttribute("data-name", item.name);
    btn.setAttribute("data-description", item.description);
    btn.setAttribute("data-feature", "sobre");
    btn.setAttribute("data-destination", item.name);
    btn.onclick = () => {
      handleSubmenuButtons(item.lat, item.lon, item.name, item.description, [], "sobre");
    };
    subMenu.appendChild(btn);
    const marker = L.marker([item.lat, item.lon]).addTo(map)
      .bindPopup(`<b>${item.name}</b><br>${item.description}`);
    markers.push(marker);
  });
  console.log("Informações 'Sobre' exibidas no submenu.");
}

/**
 * 99. displayCustomBeaches - Exibe praias customizadas.
 */
function displayCustomBeaches() {
  fetchOSMData(queries["beaches-submenu"]).then(data => {
    if (data) {
      displayOSMData(data, "beaches-submenu", "praias");
    }
  });
}

/**
 * 100. displayCustomEducation - Exibe dados educacionais customizados.
 */
function displayCustomEducation() {
  const educationItems = [
    { name: "Iniciar Tutorial", lat: -13.3766787, lon: -38.9172057, description: "Comece aqui para aprender a usar o site." },
    { name: "Planejar Viagem com IA", lat: -13.3766787, lon: -38.9172057, description: "Planeje sua viagem com a ajuda de inteligência artificial." },
    { name: "Falar com IA", lat: -13.3766787, lon: -38.9172057, description: "Converse com nosso assistente virtual." },
    { name: "Falar com Suporte", lat: -13.3766787, lon: -38.9172057, description: "Entre em contato com o suporte." },
    { name: "Configurações", lat: -13.3766787, lon: -38.9172057, description: "Ajuste as configurações do site." }
  ];
  const subMenu = document.getElementById("education-submenu");
  if (!subMenu) {
    console.error("Submenu education-submenu não encontrado.");
    return;
  }
  subMenu.innerHTML = "";
  educationItems.forEach(item => {
    const btn = document.createElement("button");
    btn.className = "submenu-item";
    btn.textContent = item.name;
    btn.setAttribute("data-lat", item.lat);
    btn.setAttribute("data-lon", item.lon);
    btn.setAttribute("data-name", item.name);
    btn.setAttribute("data-description", item.description);
    btn.setAttribute("data-feature", "ensino");
    btn.setAttribute("data-destination", item.name);
    btn.onclick = () => {
      handleSubmenuButtons(item.lat, item.lon, item.name, item.description, [], "ensino");
    };
    subMenu.appendChild(btn);
    const marker = L.marker([item.lat, item.lon]).addTo(map)
      .bindPopup(`<b>${item.name}</b><br>${item.description}`);
    markers.push(marker);
  });
  console.log("Dados educacionais customizados exibidos.");
}

/**
 * 101. displayCustomEmergencies - Exibe dados de emergência customizados.
 */
function displayCustomEmergencies() {
  const emergencies = [
    { name: "Ambulância", lat: -13.3773, lon: -38.9171, description: "Serviço de ambulância 24h. Contato: +55 75-99894-5017." },
    { name: "Unidade de Saúde", lat: -13.3773, lon: -38.9171, description: "Unidade de saúde local. Contato: +55 75-3652-1798." },
    { name: "Polícia Civil", lat: -13.3775, lon: -38.9150, description: "Delegacia da Polícia Civil. Contato: +55 75-3652-1645." },
    { name: "Polícia Militar", lat: -13.3775, lon: -38.9150, description: "Posto da Polícia Militar. Contato: +55 75-99925-0856." }
  ];
  const subMenu = document.getElementById("emergencies-submenu");
  subMenu.innerHTML = "";
  emergencies.forEach(emergency => {
    const btn = document.createElement("button");
    btn.className = "submenu-item";
    btn.textContent = emergency.name;
    btn.setAttribute("data-lat", emergency.lat);
    btn.setAttribute("data-lon", emergency.lon);
    btn.setAttribute("data-name", emergency.name);
    btn.setAttribute("data-description", emergency.description);
    btn.setAttribute("data-feature", "emergencias");
    btn.setAttribute("data-destination", emergency.name);
    btn.onclick = () => {
      handleSubmenuButtons(emergency.lat, emergency.lon, emergency.name, emergency.description, [], "emergencias");
    };
    subMenu.appendChild(btn);
    const marker = L.marker([emergency.lat, emergency.lon]).addTo(map)
      .bindPopup(`<b>${emergency.name}</b><br>${emergency.description}`);
    markers.push(marker);
  });
  console.log("Dados de emergência customizados exibidos.");
}

/**
 * 102. displayCustomInns - Exibe dados de pousadas customizados.
 */
function displayCustomInns() {
  fetchOSMData(queries["inns-submenu"]).then(data => {
    if (data) {
      displayOSMData(data, "inns-submenu", "pousadas");
    }
  });
}

/**
 * 103. displayCustomItems - Exibe itens customizados com base em um array.
 */
function displayCustomItems(items, subMenuId, feature) {
  const subMenu = document.getElementById(subMenuId);
  subMenu.innerHTML = "";
  items.forEach(item => {
    const btn = document.createElement("button");
    btn.className = "submenu-item submenu-button";
    btn.textContent = item.name;
    btn.setAttribute("data-lat", item.lat);
    btn.setAttribute("data-lon", item.lon);
    btn.setAttribute("data-name", item.name);
    btn.setAttribute("data-description", item.description);
    btn.setAttribute("data-feature", feature);
    btn.setAttribute("data-destination", item.name);
    btn.onclick = () => {
      handleSubmenuButtons(item.lat, item.lon, item.name, item.description, [], feature);
    };
    subMenu.appendChild(btn);
    const marker = L.marker([item.lat, item.lon]).addTo(map)
      .bindPopup(`<b>${item.name}</b><br>${item.description}`);
    markers.push(marker);
  });
  console.log(`Itens customizados para ${feature} exibidos.`);
}

/**
 * 104. displayCustomNightlife - Exibe dados de vida noturna customizados.
 */
function displayCustomNightlife() {
  fetchOSMData(queries["nightlife-submenu"]).then(data => {
    if (data) {
      displayOSMData(data, "nightlife-submenu", "festas");
    }
  });
}

/**
 * 105. displayCustomRestaurants - Exibe dados de restaurantes customizados.
 */
function displayCustomRestaurants() {
  fetchOSMData(queries["restaurants-submenu"]).then(data => {
    if (data) {
      displayOSMData(data, "restaurants-submenu", "restaurantes");
    }
  });
}

/**
 * 106. displayCustomShops - Exibe dados de lojas customizados.
 */
function displayCustomShops() {
  fetchOSMData(queries["shops-submenu"]).then(data => {
    if (data) {
      displayOSMData(data, "shops-submenu", "lojas");
    }
  });
}

/**
 * 107. displayCustomTips - Exibe dados de dicas customizados.
 */
function displayCustomTips() {
  const tips = [
    { name: "Melhores Pontos Turísticos", lat: -13.3766787, lon: -38.9172057, description: "Explore os pontos turísticos mais icônicos." },
    { name: "Melhores Passeios", lat: -13.3766787, lon: -38.9172057, description: "Descubra os passeios mais recomendados." },
    { name: "Melhores Praias", lat: -13.3766787, lon: -38.9172057, description: "Saiba quais são as praias mais populares." },
    { name: "Melhores Restaurantes", lat: -13.3766787, lon: -38.9172057, description: "Conheça os melhores lugares para comer." },
    { name: "Melhores Pousadas", lat: -13.3766787, lon: -38.9172057, description: "Encontre as melhores opções de pousadas." },
    { name: "Melhores Lojas", lat: -13.3766787, lon: -38.9172057, description: "Descubra as melhores lojas para suas compras." }
  ];
  const subMenu = document.getElementById("tips-submenu");
  subMenu.innerHTML = "";
  tips.forEach(tip => {
    const btn = document.createElement("button");
    btn.className = "submenu-item";
    btn.textContent = tip.name;
    btn.setAttribute("data-lat", tip.lat);
    btn.setAttribute("data-lon", tip.lon);
    btn.setAttribute("data-name", tip.name);
    btn.setAttribute("data-description", tip.description);
    btn.setAttribute("data-feature", "dicas");
    btn.setAttribute("data-destination", tip.name);
    btn.onclick = () => {
      handleSubmenuButtons(tip.lat, tip.lon, tip.name, tip.description, [], "dicas");
    };
    subMenu.appendChild(btn);
    const marker = L.marker([tip.lat, tip.lon]).addTo(map)
      .bindPopup(`<b>${tip.name}</b><br>${tip.description}`);
    markers.push(marker);
  });
  console.log("Dados de dicas customizados exibidos.");
}

/**
 * 108. displayCustomTouristSpots
 *    Exibe pontos turísticos (touristSpots-submenu) e esconde botões extras se desejar.
 */
function displayCustomTouristSpots() {
    fetchOSMData(queries['touristSpots-submenu']).then(data => {
        if (data) {
            displayOSMData(data, 'touristSpots-submenu', 'pontos-turisticos');
        }
        hideAllButtons();
    });
}


/**
 * 109. displayCustomTours
 *    Exibe passeios personalizados (tours-submenu).
 */
function displayCustomTours() {
    const tours = [
        {
            name: "Passeio de lancha Volta a Ilha de Tinharé",
            lat: -13.3837729,
            lon: -38.9085360,
            description: "Desfrute de um emocionante passeio de lancha ao redor da Ilha de Tinharé..."
        },
        {
            name: "Passeio de Quadriciclo para Garapuá",
            lat: -13.3827765,
            lon: -38.9105500,
            description: "Aventure-se em um passeio de quadriciclo até a vila de Garapuá..."
        },
        {
            name: "Passeio 4X4 para Garapuá",
            lat: -13.3808638,
            lon: -38.9127107,
            description: "Embarque em uma viagem emocionante de 4x4 até Garapuá..."
        },
        {
            name: "Passeio de Barco para Gamboa",
            lat: -13.3766536,
            lon: -38.9186205,
            description: "Relaxe em um agradável passeio de barco até Gamboa..."
        }
    ];

    displayCustomItems(tours, 'tours-submenu', 'passeios');
}

/***********************************************************************************************
 * FIM DA SEÇÃO 5 – SUBMENUS & GERENCIAMENTO DE FUNCIONALIDADES (Funções 71 – 109)
 ***********************************************************************************************/
/****************************************************************************
 * SEÇÃO 6 – VOZ & INTERAÇÃO (Funções 101 – 113)
 ****************************************************************************/

/**
 * 110. startVoiceRecognition - Inicia o reconhecimento de voz
 * Define o idioma (selectedLanguage), inicia o SpeechRecognition e
 * chama interpretCommand ao receber resultado.
 */
function startVoiceRecognition() {
  if (!("SpeechRecognition" in window) && !("webkitSpeechRecognition" in window)) {
    console.warn("Reconhecimento de voz não suportado neste navegador.");
    return;
  }

  const SpeechRec = window.SpeechRecognition || window.webkitSpeechRecognition;
  const recognition = new SpeechRec();
  recognition.lang = selectedLanguage === "pt" ? "pt-BR" : selectedLanguage;
  recognition.start();

  recognition.onresult = event => {
    const command = event.results[0][0].transcript;
    console.log("Comando reconhecido:", command);
    interpretCommand(command);
  };

  recognition.onerror = event => {
    console.error("Erro no reconhecimento de voz:", event.error);
    showNotification("Erro ao processar comando de voz.", "error");
  };
  console.log("startVoiceRecognition: Reconhecimento de voz iniciado.");
}

/**
 * 111. visualizeVoiceCapture - Efeito visual ao capturar voz (ex.: animação do ícone do microfone).
 */
function visualizeVoiceCapture() {
  const micIcon = document.getElementById("mic-icon");
  if (micIcon) {
    micIcon.classList.add("listening");
    setTimeout(() => {
      micIcon.classList.remove("listening");
    }, 3000);
  }
  console.log("Efeito de captação de voz ativado (visualizeVoiceCapture).");
}

/**
 * 112. interpretCommand - Interpreta o comando de voz reconhecido.
 * Exemplo simples: verifica se contém 'praia', 'restaurante', etc.
 */
function interpretCommand(command) {
  const lowerCmd = command.toLowerCase();
  if (lowerCmd.includes("praia")) {
    handleFeatureSelection("praias");
  } else if (lowerCmd.includes("restaurante")) {
    handleFeatureSelection("restaurantes");
  } else if (lowerCmd.includes("tour")) {
    handleFeatureSelection("passeios");
  } else {
    showNotification("Comando não reconhecido. Tente novamente.", "warning");
  }
  console.log(`interpretCommand: Comando de voz interpretado: "${command}"`);
}

/**
 * 113. confirmCommandFeedback - Feedback textual do comando recebido.
 */
function confirmCommandFeedback(command) {
  showNotification(`Você disse: ${command}`, "info");
  console.log("Feedback do comando de voz:", command);
}

/**
 * 114. confirmAudioCommand - Confirma execução do comando de voz e chama visualizeVoiceCapture.
 */
function confirmAudioCommand() {
  showNotification("Comando recebido. Processando...", "info");
  visualizeVoiceCapture();
  console.log("confirmAudioCommand: Comando de voz confirmado.");
}

/**
 * 115. detectPOI - Detecta pontos de interesse próximos e exibe (ex.: via AR).
 */
function detectPOI() {
  // Exemplo: dados estáticos
  const poiList = ["Praia do Encanto", "Restaurante Raízes", "Museu Histórico"];
  displayPOIInAR(poiList);
  console.log("detectPOI: POIs detectados:", poiList);
}

/**
 * 116. validatePOIResults - Valida resultados dos POIs detectados.
 */
function validatePOIResults(poiList) {
  if (!poiList || poiList.length === 0) {
    return ["Nenhum ponto encontrado."];
  }
  return poiList;
}

/**
 * 117. displayPOIInAR - Exibe lista de POIs em AR (Realidade Aumentada).
 * Aqui é apenas um exemplo simples (colocando numa div #ar-container).
 */
function displayPOIInAR(poiList) {
  const arContainer = document.getElementById("ar-container");
  if (!arContainer) {
    console.warn("displayPOIInAR: #ar-container não encontrado.");
    return;
  }
  arContainer.innerHTML = "";
  poiList.forEach(poi => {
    const div = document.createElement("div");
    div.className = "ar-item";
    div.textContent = poi;
    arContainer.appendChild(div);
  });
  console.log("displayPOIInAR: POIs exibidos em AR:", poiList);
}

/**
 * 118. integrateMultimodalRoute - Integra diferentes modais de transporte.
 */
function integrateMultimodalRoute() {
  showNotification("Integrando diferentes rotas e modais...", "info");
  // Chamaria recalculateRoute ou outro fluxo
  console.log("integrateMultimodalRoute: Rota multimodal em implementação...");
}

/**
 * 119. retryVoiceRecognition - Tenta novamente reconhecimento de voz após falha.
 */
function retryVoiceRecognition() {
  showNotification("Tentando reconhecimento de voz novamente...", "info");
  startVoiceRecognition();
  console.log("retryVoiceRecognition: Reiniciando SpeechRecognition.");
}

/**
 * 120. cancelVoiceRecognition - Cancela o reconhecimento de voz atual.
 * (Este exemplo não é detalhado pois a API SpeechRecognition não expõe cancel() direto,
 * mas podemos parar a instância.)
 */
function cancelVoiceRecognition() {
  showNotification("Reconhecimento de voz cancelado.", "info");
  console.log("cancelVoiceRecognition: Reconhecimento de voz interrompido.");
}

/**
 * 121. giveVoiceFeedback - Converte texto em áudio (exemplo simples).
/**
 * giveVoiceFeedback
 * Converte um texto em áudio usando SpeechSynthesis.
 *
 * @param {string} message - Mensagem a ser falada.
 */
function giveVoiceFeedback(message) {
  if (!("speechSynthesis" in window)) {
    console.warn("[giveVoiceFeedback] API speechSynthesis não suportada.");
    return;
  }
  const utterance = new SpeechSynthesisUtterance(message);
  utterance.lang = selectedLanguage === "pt" ? "pt-BR" : "en-US";
  window.speechSynthesis.speak(utterance);
  console.log("[giveVoiceFeedback] Mensagem falada:", message);
}


/**
 * 122. speakInstruction - Fala instrução via SpeechSynthesis.
/**
 * speakInstruction
 * Converte o texto da instrução em áudio usando SpeechSynthesis.
 *
 * @param {string} text - Texto da instrução.
 * @param {string} voiceLang - Código da língua para voz (ex.: "pt-BR" ou "en-US").
 */
function speakInstruction(text, voiceLang = "pt-BR") {
  if (!("speechSynthesis" in window)) {
    console.warn("[speakInstruction] API speechSynthesis não suportada.");
    return;
  }
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = voiceLang;
  window.speechSynthesis.speak(utterance);
  console.log("[speakInstruction] Instrução falada:", text);
}


/****************************************************************************
 * FIM DA SEÇÃO 6 – VOZ & INTERAÇÃO (Funções 101 – 113)
 ****************************************************************************/

/****************************************************************************
 * SEÇÃO 7 – CACHE, PERSISTÊNCIA & MODO OFFLINE (Funções 114 – 128)
 ****************************************************************************/

/**
 * 123. forcePOICacheRefresh - Força a atualização do cache de POIs.
 */
function forcePOICacheRefresh() {
  localStorage.removeItem("cachedPOIs");
  showNotification("Cache de POIs atualizado.", "success");
  detectPOI(); // Recarrega POIs
  console.log("forcePOICacheRefresh: Cache de POIs renovado.");
}

/**
 * 124. loadDestinationsFromCache - Carrega destinos salvos do cache (ou Service Worker).
 */
function loadDestinationsFromCache(callback) {
    if (navigator.serviceWorker.controller) {
        navigator.serviceWorker.controller.postMessage({
            command: 'loadDestinations',
        });
        navigator.serviceWorker.onmessage = (event) => {
            if (event.data.command === 'destinationsLoaded') {
                callback(event.data.data);
            }
        };
    } else {
        console.error('Service worker não está ativo.');
    }
}

/**
 * 125. cacheRouteData - Salva dados da rota (instruções e polyline) no cache local (localStorage).
 */
function cacheRouteData(routeInstructions, routeLatLngs) {
  if (typeof localStorage === "undefined") {
    console.warn("LocalStorage não está disponível.");
    return;
  }
  try {
    const data = {
      instructions: routeInstructions,
      route: routeLatLngs,
      timestamp: Date.now()
    };
    localStorage.setItem('cachedRoute', JSON.stringify(data));
    console.log("[cacheRouteData] Rota salva no cache local (localStorage).");
    showNotification("Rota salva em cache para uso offline.", "success");
  } catch (err) {
    console.error("[cacheRouteData] Erro ao salvar rota no cache:", err);
    showNotification(getGeneralText("routeDataError", navigationState.lang), "error");
  }
}


/**
 * 126. loadRouteFromCache - Carrega rota salva do cache (localStorage).
 */
function loadRouteFromCache() {
  if (typeof localStorage === "undefined") {
    console.warn("LocalStorage não está disponível.");
    return null;
  }
  try {
    const dataStr = localStorage.getItem('cachedRoute');
    if (!dataStr) {
      console.warn("[loadRouteFromCache] Nenhuma rota salva no cache.");
      return null;
    }
    const data = JSON.parse(dataStr);
    console.log("[loadRouteFromCache] Rota carregada do cache:", data);
    showNotification("Rota carregada do cache com sucesso.", "info");
    return data;
  } catch (err) {
    console.error("[loadRouteFromCache] Erro ao carregar rota do cache:", err);
    showNotification(getGeneralText("routeDataError", navigationState.lang), "error");
    return null;
  }
}

/**
 * 127. saveNavigationState - Salva o estado de navegação no sessionStorage (exemplo).
 */
function saveNavigationState(state) {
  if (!state) {
    console.warn("Nenhum estado de navegação para salvar.");
    return;
  }
  sessionStorage.setItem("navState", JSON.stringify(state));
  showNotification("Estado de navegação salvo.", "success");
  console.log("Estado salvo:", state);
}

/**
 * 128. restoreNavigationState - Restaura o estado de navegação salvo no sessionStorage.
 */
function restoreNavigationState() {
    const state = sessionStorage.getItem('navState');
    if (state) {
        const navState = JSON.parse(state);
        startNavigation(navState);
        showNotification('Estado de navegação restaurado.', 'info');
    } else {
        showNotification('Nenhum estado de navegação encontrado.', 'warning');
    }
}

/**
 * 129. saveStateToServiceWorker - Salva estado de navegação no Service Worker.
 */
function saveStateToServiceWorker() {
    if (navigator.serviceWorker.controller) {
        navigator.serviceWorker.controller.postMessage({
            action: 'saveState',
            payload: {
                userPosition,
                selectedDestination,
                instructions: currentInstructions,
            },
        });
    } else {
        console.error('Service Worker não está ativo.');
    }
}

/**
 * 130. autoRestoreState - Solicita ao Service Worker que restaure estado automaticamente.
 */
function autoRestoreState() {
    if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
        navigator.serviceWorker.controller.postMessage({
            type: 'RESTORE_STATE'
        });
        console.log('Tentando restaurar estado automaticamente.');
    } else {
        showNotification('Service Worker não disponível para restauração automática.', 'warning');
    }
}

/**
 * 131. restoreState - Restaura estado completo do sistema (geral).
 */
function restoreState(state) {
    if (!state) {
        console.log('Nenhum estado para restaurar.');
        return;
    }

    console.log('Restaurando estado:', state);

    // Restaura o destino selecionado
    if (state.selectedDestination) {
        selectedDestination = state.selectedDestination;
        adjustMapWithLocation();
    }

    // Restaura as instruções da rota
    if (state.instructions) {
        displayStepByStepInstructions(state.instructions, 0);
    }

    // Restaura a localização do usuário
    if (state.userPosition) {
        updateUserPositionOnMap(state.userPosition);
    }

    document.getElementById("continue-navigation-btn").addEventListener("click", () => {
    navigator.serviceWorker.controller.postMessage({ action: 'getState' });
    document.getElementById("recovery-modal").classList.add("hidden");
});

document.getElementById("start-new-navigation-btn").addEventListener("click", () => {
    clearNavigationState();
    document.getElementById("recovery-modal").classList.add("hidden");
});

}

/**
 * 132. getLocalStorageItem - Recupera item do localStorage, parseando JSON.
 */
function getLocalStorageItem(key, defaultValue = null) {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch (error) {
    console.error(`Erro ao obter item do localStorage (${key}):`, error);
    return defaultValue;
  }
}

/**
 * 133. setLocalStorageItem - Define item no localStorage, convertendo para JSON.
 */
function setLocalStorageItem(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error(`Erro ao salvar item no localStorage (${key}):`, error);
  }
}

/**
 * 134. removeLocalStorageItem - Remove item do localStorage por chave.
 */
function removeLocalStorageItem(key) {
  try {
    localStorage.removeItem(key);
  } catch (error) {
    console.error(`Erro ao remover item do localStorage (${key}):`, error);
  }
}

/**
 * 135. saveDestinationToCache - Salva destino selecionado no cache local.
 */
function saveDestinationToCache(destination) {
  return new Promise((resolve, reject) => {
    try {
      localStorage.setItem("selectedDestination", JSON.stringify(destination));
      console.log("Destino salvo no cache:", destination);
      resolve();
    } catch (error) {
      console.error("Erro ao salvar destino no cache:", error);
      reject(new Error("Erro ao salvar destino no cache."));
    }
  });
}

/**
 * 136. saveRouteToHistory - Salva rota no histórico (localStorage).
 */
function saveRouteToHistory(route) {
  const historyStr = localStorage.getItem("routeHistory") || "[]";
  const history = JSON.parse(historyStr);
  history.push(route);
  localStorage.setItem("routeHistory", JSON.stringify(history));
  console.log("Rota salva no histórico (routeHistory).");
}

/**
 * 137. saveSearchQueryToHistory - Salva query de pesquisa no histórico.
 */
function saveSearchQueryToHistory(query) {
  const searchHistoryStr = localStorage.getItem("searchHistory") || "[]";
  const searchHistoryArr = JSON.parse(searchHistoryStr);
  searchHistoryArr.push(query);
  localStorage.setItem("searchHistory", JSON.stringify(searchHistoryArr));
  console.log("Consulta de pesquisa salva no histórico:", query);
}

/**
 * 138. loadOfflineInstructions - Carrega instruções offline (ex.: localStorage).
 */
function loadOfflineInstructions() {
  const cachedInstr = localStorage.getItem("offlineInstructions");
  if (cachedInstr) {
    return JSON.parse(cachedInstr);
  } else {
    console.warn("Nenhuma instrução offline encontrada.");
    return [];
  }
}


/**
 * 139. loadSearchHistory
 *    Carrega o histórico de buscas do localStorage e exibe na interface.
 */
function loadSearchHistory() {
    const history = getLocalStorageItem('searchHistory', []);
    searchHistory = history; // Atualiza a variável global

    const historyContainer = document.getElementById('search-history-container');
    if (historyContainer) {
        historyContainer.innerHTML = '';
        history.forEach(query => {
            const historyItem = document.createElement('div');
            historyItem.className = 'history-item';
            historyItem.textContent = query;
            historyContainer.appendChild(historyItem);
        });
    }
}

/****************************************************************************
 * FIM DA SEÇÃO 7 – CACHE, PERSISTÊNCIA & MODO OFFLINE (Funções 114 – 128)
 ****************************************************************************/

/****************************************************************************
 * SEÇÃO 8 – TUTORIAL & ASSISTENTE VIRTUAL (Funções 129 – 136)
 ****************************************************************************/

/**
 * 140. startTutorial - Inicia o tutorial interativo (definindo tutorialIsActive etc.)
 */
function startTutorial() {
  tutorialIsActive = true;
  currentStep = 0; // índice do passo inicial
  showTutorialStep("start-tutorial");
  console.log("startTutorial: Tutorial iniciado.");
}

/**
 * 141. endTutorial - Finaliza o tutorial, limpando estado e fechando modal.
 */
function endTutorial() {
  tutorialIsActive = false;
  currentStep = null;
  hideAllControlButtons();
  hideAssistantModal();
  console.log("endTutorial: Tutorial finalizado.");
}

/**
 * 142. nextTutorialStep - Avança para o próximo passo do tutorial.
 */
function nextTutorialStep() {
  if (currentStep < tutorialSteps.length - 1) {
    currentStep++;
    showTutorialStep(tutorialSteps[currentStep].step);
  } else {
    endTutorial();
  }
  console.log(`nextTutorialStep: Passo do tutorial definido para ${currentStep}.`);
}

/**
 * 143. previousTutorialStep - Retorna ao passo anterior do tutorial.
 */
function previousTutorialStep(currentStepId) {
  const idx = tutorialSteps.findIndex(s => s.step === currentStepId);
  if (idx > 0) {
    const previous = tutorialSteps[idx - 1];
    showTutorialStep(previous.step);
  }
  console.log("previousTutorialStep: Voltou um passo no tutorial.");
}

/**
 * 144. showTutorialStep - Exibe conteúdo de um passo específico do tutorial.
 */
function showTutorialStep(step) {
    const stepConfig = tutorialSteps.find(s => s.step === step);
    if (!stepConfig) {
        console.error(`Passo ${step} não encontrado.`);
        return;
    }

    const { message, action } = stepConfig;

    // Atualiza o modal do assistente com a mensagem no idioma certo
    updateAssistantModalContent(step, message[selectedLanguage]);
    hideAllControlButtons();   // para evitar poluição da tela
    hideRouteSummary();
    hideRoutePreview();
  


    if (action) action(); // executa a ação atrelada a este passo
}

/**
 * 145. storeAndProceed - Armazena a resposta do usuário e chama showTutorialStep para o próximo passo.
 */
function storeAndProceed(interest) {
    localStorage.setItem('ask-interest', interest);
    const specificStep = tutorialSteps.find(s => s.step === interest);
    if (specificStep) {
        currentStep = tutorialSteps.indexOf(specificStep);
        showTutorialStep(specificStep.step);

    } else {
        console.error('Passo específico para o interesse não encontrado.');
    }
}

/**
 * 146. generateInterestSteps - Gera passos personalizados de interesse (tutorial).
 */
function generateInterestSteps() {
    const interests = [
        { 
            id: 'pousadas', 
            label: "Pousadas", 
            message: {
                pt: "Encontre as melhores pousadas para sua estadia.",
                es: "Encuentra las mejores posadas para tu estadía.",
                en: "Find the best inns for your stay.",
                he: "מצא את הפוסאדות הטובות ביותר לשהותך."
            }
        },
        { 
            id: 'pontos-turisticos', 
            label: "Pontos Turísticos", 
            message: {
                pt: "Descubra os pontos turísticos mais populares.",
                es: "Descubre los puntos turísticos más populares.",
                en: "Discover the most popular tourist attractions.",
                he: "גלה את האטרקציות התיירותיות הפופולריות ביותר."
            }
        },
        { 
            id: 'praias', 
            label: "Praias", 
            message: {
                pt: "Explore as praias mais belas de Morro de São Paulo.",
                es: "Explora las playas más hermosas de Morro de São Paulo.",
                en: "Explore the most beautiful beaches of Morro de São Paulo.",
                he: "גלה את החופים היפים ביותר במורו דה סאו פאולו."
            }
        },
        { 
            id: 'passeios', 
            label: "Passeios", 
            message: {
                pt: "Veja passeios disponíveis e opções de reserva.",
                es: "Consulta los paseos disponibles y las opciones de reserva.",
                en: "See available tours and booking options.",
                he: "צפה בטיולים זמינים ואפשרויות הזמנה."
            }
        },
        { 
            id: 'restaurantes', 
            label: "Restaurantes", 
            message: {
                pt: "Descubra os melhores restaurantes da região.",
                es: "Descubre los mejores restaurantes de la región.",
                en: "Discover the best restaurants in the area.",
                he: "גלה את המסעדות הטובות ביותר באזור."
            }
        },
        { 
            id: 'festas', 
            label: "Festas", 
            message: {
                pt: "Saiba sobre festas e eventos disponíveis.",
                es: "Infórmate sobre fiestas y eventos disponibles.",
                en: "Learn about available parties and events.",
                he: "גלה מסיבות ואירועים זמינים."
            }
        },
        { 
            id: 'lojas', 
            label: "Lojas", 
            message: {
                pt: "Encontre lojas locais para suas compras.",
                es: "Encuentra tiendas locales para tus compras.",
                en: "Find local shops for your purchases.",
                he: "מצא חנויות מקומיות לקניות שלך."
            }
        },
        { 
            id: 'emergencias', 
            label: "Emergências", 
            message: {
                pt: "Informações úteis para situações de emergência.",
                es: "Información útil para situaciones de emergencia.",
                en: "Useful information for emergency situations.",
                he: "מידע שימושי למצבי חירום."
            }
        }
    ];

    // Mapeia os interesses e adiciona o passo "submenu-example"
    const steps = interests.flatMap(interest => [
        {
            step: interest.id,
            element: `.menu-btn[data-feature="${interest.id}"]`,
            message: interest.message,
            action: () => {
                const element = document.querySelector(`.menu-btn[data-feature="${interest.id}"]`);
                if (element) {
                    highlightElement(element);
                } else {
                    console.error(`Elemento para ${interest.label} não encontrado.`);
                }
                showMenuButtons(); // Exibe os botões do menu lateral e toggle
            }
        },
        {
            step: 'submenu-example',
            message: {
                pt: "Escolha uma opção do submenu para continuar.",
                es: "Elige una opción del submenú para continuar.",
                en: "Choose an option from the submenu to proceed.",
                he: "בחר אפשרות מתפריט המשנה כדי להמשיך."
            },
            action: () => {
                const submenu = document.querySelector('.submenu');
                if (submenu) {
                    submenu.style.display = 'block'; // Exibe o submenu
                }
                setupSubmenuListeners();
                endTutorial(); // Configura os listeners para fechar o modal
            }
        }
    ]);

    return steps;
}

/**
 * 147. removeExistingHighlights - Remove destaques visuais (ex.: setas, círculos).
 */
function removeExistingHighlights() {
  document.querySelectorAll(".arrow-highlight").forEach(e => e.remove());
  document.querySelectorAll(".circle-highlight").forEach(e => e.remove());
  console.log("removeExistingHighlights: Destaques visuais removidos.");
}

/****************************************************************************
 * FIM DA SEÇÃO 8 – TUTORIAL & ASSISTENTE VIRTUAL (Funções 129 – 136)
 ****************************************************************************/

/****************************************************************************
 * SEÇÃO 9 – UTILITÁRIOS PARA ROTEIRIZAÇÃO (Funções 137 – 146)
 ****************************************************************************/

/**
 * 148. mapORSInstruction - Mapeia a instrução bruta da ORS para { maneuverKey, placeName, ... }
 */
function mapORSInstruction(rawInstruction) {
  let maneuverKey = "unknown";
  let placeName = "";
  if (!rawInstruction) {
    return { maneuverKey, placeName };
  }
  const text = rawInstruction.toLowerCase();

  if (text.includes("turn left")) {
    maneuverKey = "turn_left";
  } else if (text.includes("turn right")) {
    maneuverKey = "turn_right";
  } else if (text.includes("continue straight")) {
    maneuverKey = "continue_straight";
  } else if (text.includes("keep left")) {
    maneuverKey = "keep_left";
  } else if (text.includes("keep right")) {
    maneuverKey = "keep_right";
  } else if (text.includes("u-turn")) {
    maneuverKey = "u_turn";
  } else if (text.includes("enter roundabout")) {
    maneuverKey = "enter_roundabout";
  } else if (text.includes("exit roundabout")) {
    maneuverKey = "exit_roundabout";
  } else if (text.includes("ferry")) {
    maneuverKey = "ferry";
  } else if (text.includes("end of road")) {
    maneuverKey = "end_of_road";
  }

  // Extrair o nome da rua ou local
  const match = rawInstruction.match(/on\s+([\w\s\d]+)/i);
  if (match && match[1]) {
    placeName = match[1].trim();
  }
  console.log(`[mapORSInstruction] Maneuver: "${maneuverKey}", Place: "${placeName}"`);
  return { maneuverKey, placeName };
}


/**
 * 149. getDetailedInstructionText - Monta texto final (ex.: “Vire à esquerda na Rua X (200m)”).
 */
function getDetailedInstructionText(step, lang = "pt") {
  if (!step) {
    console.warn("getDetailedInstructionText: Step inválido.");
    return "Sem instrução";
  }
  const { maneuverKey, placeName } = mapORSInstruction(step.raw);
  let baseText = step.text || getGeneralText(maneuverKey, lang);
  if (baseText.startsWith("⚠️")) {
    baseText = step.raw; // se não encontrou a key no dicionário
  }
  let placeSegment = "";
  if (placeName) {
    const onWord = getGeneralText("on", lang) || "na";
    placeSegment = ` ${onWord} ${placeName}`;
  } else if (step.streetName) {
    const onWord = getGeneralText("on", lang) || "na";
    placeSegment = ` ${onWord} ${step.streetName}`;
  }
  let distSegment = "";
  if (typeof step.distance === "number") {
    distSegment = ` (${step.distance}m)`;
  }
  return `${baseText}${placeSegment}${distSegment}`;
}

/**
 * 150. updateNavigationState - Atualiza o objeto global navigationState (merge).
 */
function updateNavigationState(newState) {
  if (typeof newState !== "object" || newState === null) {
    console.error("updateNavigationState: newState inválido:", newState);
    return;
  }
  Object.assign(navigationState, newState);
  console.log("updateNavigationState: Estado atualizado:", newState);
}

/**
 * 151. showInstructionsWithTooltip - Exibe instruções no mapa via tooltips fixos.
 */
function showInstructionsWithTooltip(instructions, mapInstance) {
  if (!instructions || instructions.length === 0) {
    console.warn("showInstructionsWithTooltip: Nenhuma instrução para exibir.");
    return;
  }
  instructions.forEach((step) => {
    const marker = L.marker([step.lat, step.lon]).addTo(mapInstance);
    marker.bindTooltip(step.text, {
      permanent: true,
      direction: "top",
      className: "my-custom-tooltip"
    }).openTooltip();
  });
  console.log("showInstructionsWithTooltip: Instruções exibidas com tooltip.");
}

/**
 * 152. showInstructionsOnMap - Exibe instruções no mapa como popups.
 */
function showInstructionsOnMap(instructions, mapInstance) {
  if (!instructions || instructions.length === 0) {
    console.warn("showInstructionsOnMap: Nenhuma instrução para exibir.");
    return;
  }
  instructions.forEach((step, idx) => {
    const icon = L.divIcon({ className: "instruction-marker-icon", html: "⚠️" });
    const marker = L.marker([step.lat, step.lon], { icon }).addTo(mapInstance);
    marker.bindPopup(`
      <strong>Passo ${idx + 1}</strong><br>
      ${step.text}<br>
      (${step.distance}m)
    `);
  });
  console.log(`showInstructionsOnMap: ${instructions.length} instruções exibidas no mapa.`);
}

/**
 * 153. goToInstructionStep - Define o step atual de navegação manualmente.
 */
// Função de navegação
function goToInstructionStep(stepIndex) {
  const instr = navigationState.instructions;
  if (!instr || !Array.isArray(instr) || instr.length === 0) {
    console.warn("[goToInstructionStep] Nenhuma instrução definida.");
    return;
  }
  stepIndex = Math.max(0, Math.min(stepIndex, instr.length - 1));
  navigationState.currentStepIndex = stepIndex;
  const step = instr[stepIndex];
  if (step) {
    updateInstructionModal(instr, stepIndex, navigationState.lang);
    speakInstruction(step.text, navigationState.lang === "pt" ? "pt-BR" : "en-US");
    highlightNextStepInMap(step);
    console.log(`[goToInstructionStep] Step atualizado: ${stepIndex}`);
  }
}

/**
 * 154. nextInstructionStep - Avança para a próxima instrução.
 */
function nextInstructionStep() {
  if (navigationState.currentStepIndex < navigationState.instructions.length - 1) {
    goToInstructionStep(navigationState.currentStepIndex + 1);
  } else {
    console.log("nextInstructionStep: Última instrução alcançada.");
    showNotification("Você chegou ao destino final!", "success");
  }
}

/**
 * 155. prevInstructionStep - Volta para a instrução anterior.
 */
function prevInstructionStep() {
  if (navigationState.currentStepIndex > 0) {
    goToInstructionStep(navigationState.currentStepIndex - 1);
  } else {
    console.log("prevInstructionStep: Já está na primeira instrução.");
  }
}

/**
 * 156. showRouteAlternatives - Exibe múltiplas rotas no mapa, cada uma com cor diferente.
 */
function showRouteAlternatives(routeDataArray) {
  clearCurrentRoute();
  const colors = ["blue", "green", "purple", "orange"];
  routeDataArray.forEach((rd, i) => {
    const color = colors[i % colors.length];
    const poly = L.polyline(rd.routeCoords, { color, weight: 5, opacity: 0.8 }).addTo(map);
    poly.bindPopup(`${rd.label || "Rota"} - Dist: ${rd.distance}km, ~${rd.duration} min`);
  });
  const allPoints = routeDataArray.flatMap(r => r.routeCoords);
  const bounds = L.latLngBounds(allPoints);
  map.fitBounds(bounds, { padding: [50, 50] });
  console.log("showRouteAlternatives: Rotas alternativas exibidas no mapa.");
}

/**
 * 157. calculateETA - Estima tempo (minutos) baseado em distância e velocidade (km/h).
 */
function calculateETA(lat1, lon1, lat2, lon2, averageSpeed = 50) {
  const dist = calculateDistance(lat1, lon1, lat2, lon2);
  if (dist <= 0 || averageSpeed <= 0) {
    console.warn("calculateETA: Distância ou velocidade inválida.");
    return "N/A";
  }
  const hours = dist / 1000 / averageSpeed; // dist em km / speed (km/h)
  const minutes = Math.round(hours * 60);
  console.log(`calculateETA: ${minutes} min para ${dist / 1000} km.`);
  return `${minutes} min`;
}

/****************************************************************************
 * FIM DA SEÇÃO 9 – UTILITÁRIOS PARA ROTEIRIZAÇÃO (Funções 137 – 146)
 ****************************************************************************/

/****************************************************************************
 * SEÇÃO 10 – DIVERSOS & EVENTOS (Funções 147 – 157)
 ****************************************************************************/

/**
 * 158. checkNearbyPartners - Verifica se o usuário está próximo de parceiros.
 */
function checkNearbyPartners(userLat, userLon) {
  const distance = calculateDistance(
    userLat,
    userLon,
    TOCA_DO_MORCEGO_COORDS.lat,
    TOCA_DO_MORCEGO_COORDS.lon
  );
  console.log(`checkNearbyPartners: Distância até parceiro: ${distance} metros.`);
  return distance <= PARTNER_CHECKIN_RADIUS;
}

/**
 * 159. handleUserArrivalAtPartner - Lida com a chegada do usuário em um parceiro.
 */
function handleUserArrivalAtPartner(userLat, userLon) {
  if (checkNearbyPartners(userLat, userLon)) {
    showNotification("Você chegou ao parceiro! Ganhou um drink e 10 pontos!", "success");
    awardPointsToUser("Toca do Morcego", 10);
    console.log("handleUserArrivalAtPartner: Parceria concluída.");
  }
}

/**
 * 160. awardPointsToUser - Concede pontos ao usuário e atualiza no localStorage.
 */
function awardPointsToUser(partnerName, points) {
  let currentPoints = parseInt(localStorage.getItem("userPoints") || "0", 10);
  currentPoints += points;
  localStorage.setItem("userPoints", currentPoints);
  showNotification(`Ganhou ${points} ponto(s) em ${partnerName}! Total: ${currentPoints}`, "success");
  console.log("awardPointsToUser: Pontos atualizados:", currentPoints);
}

/**
 * 161. setupEventListeners - Configura os event listeners (já implementado em parte no DOMContentLoaded).
 */
function setupEventListeners() {
    const modal = document.getElementById('assistant-modal');
    const floatingMenu = document.getElementById('floating-menu');
    const createItineraryBtn = document.getElementById('create-itinerary-btn');
    const startCreateRouteBtn = document.getElementById('create-route-btn');
    const searchBtn = document.querySelector('.menu-btn[data-feature="pesquisar"]');
    const ensinoBtn = document.querySelector('.menu-btn[data-feature="ensino"]');
    const carouselModalClose = document.getElementById('carousel-modal-close');
    const aboutMoreBtn = document.getElementById('about-more-btn');
    const menuToggle = document.getElementById('menu-btn');
    const buyTicketBtn = document.getElementById('buy-ticket-btn');
    const tourBtn = document.getElementById('tour-btn');
    const navigationBtn = document.getElementById('navigation-start');


const closeModal = document.querySelector('.close-btn'); // Seleciona o botão de fechar
if (closeModal) {
    closeModal.addEventListener('click', closeAssistantModal); // Associa o evento de clique à função
}


    if (menuToggle) {
        menuToggle.style.display = 'none';
        menuToggle.addEventListener('click', () => {
            floatingMenu.classList.toggle('hidden');
            if (tutorialIsActive && tutorialSteps[currentStep].step === 'menu-toggle') {
                nextTutorialStep();
            }
        });
    }

    // Evento para o botão "start-navigation-btn"
const startNavigationRodapeBtn = document.getElementById('start-navigation-rodape-btn');
if (startNavigationRodapeBtn) {
  startNavigationRodapeBtn.addEventListener('click', () => {
    console.log("✅ Botão 'start-navigation-rodape-btn' clicado!");
    startNavigation();
  });
}


// Evento para o botão "menu-details-btn"
const menuDetailsBtn = document.getElementById("menu-details-btn");
if (menuDetailsBtn) {
  menuDetailsBtn.addEventListener("click", () => {
    console.log("✅ Botão 'menu-details-btn' clicado!");
    clearRouteMarkers();
    hideInstructionBanner();
    showTutorialStep('ask-interest'); // ou showTutorialStep('someStep') se for esse o caso
  });
}

// Evento para o botão "cancel-route-btn"
const cancelRouteBtn = document.getElementById("cancel-route-btn");
if (cancelRouteBtn) {
  cancelRouteBtn.addEventListener("click", () => {
   clearRouteMarkers();
    hideInstructionBanner();
  	restoreFeatureUI(); // Passe o parâmetro adequado conforme sua lógica
    console.log("✅ Botão 'cancel-route-btn' clicado!");
  });
}


    if (aboutMoreBtn) {
        aboutMoreBtn.addEventListener('click', () => {
            if (selectedDestination && selectedDestination.name) {
                startCarousel(selectedDestination.name);
            } else {
                alert('Por favor, selecione um destino primeiro.');
            }
        });
    }

    if (buyTicketBtn) {
        buyTicketBtn.addEventListener('click', () => {
            if (selectedDestination && selectedDestination.url) {
                openDestinationWebsite(selectedDestination.url);
            } else {
                alert('Por favor, selecione um destino primeiro.');
            }
        });
    }

    const reserveChairsBtn = document.getElementById('reserve-chairs-btn');
    if (reserveChairsBtn) {
    reserveChairsBtn.addEventListener('click', () => {
        if (selectedDestination && selectedDestination.url) {
            openDestinationWebsite(selectedDestination.url);
        } else {
            alert('Por favor, selecione um destino primeiro.');
        }
    });
}


    const reserveRestaurantsBtn = document.getElementById('reserve-restaurants-btn');
    if (reserveRestaurantsBtn) {
        reserveRestaurantsBtn.addEventListener('click', () => {
            if (selectedDestination && selectedDestination.url) {
                openDestinationWebsite(selectedDestination.url);
            } else {
                alert('Por favor, selecione um destino primeiro.');
            }
        });
    }

    const reserveInnsBtn = document.getElementById('reserve-inns-btn');
    if (reserveInnsBtn) {
        reserveInnsBtn.addEventListener('click', () => {
            if (selectedDestination && selectedDestination.url) {
                openDestinationWebsite(selectedDestination.url);
            } else {
                alert('Por favor, selecione um destino primeiro.');
            }
        });
    }

    const speakAttendentBtn = document.getElementById('speak-attendent-btn');
    if (speakAttendentBtn) {
        speakAttendentBtn.addEventListener('click', () => {
            if (selectedDestination && selectedDestination.url) {
                openDestinationWebsite(selectedDestination.url);
            } else {
                alert('Por favor, selecione um destino primeiro.');
            }
        });
    }

    const callBtn = document.getElementById('call-btn');
    if (callBtn) {
        callBtn.addEventListener('click', () => {
            if (selectedDestination && selectedDestination.url) {
                openDestinationWebsite(selectedDestination.url);
            } else {
                alert('Por favor, selecione um destino primeiro.');
            }
        });
    }

// Configura o evento de mudança de idioma com integração ao tutorial do assistente
document.querySelectorAll('.lang-btn').forEach(button => {
    button.addEventListener('click', () => {
        const lang = button.dataset.lang;
        
        // Define o idioma globalmente
        setLanguage(lang);
        updateInterfaceLanguage(lang);
        
        // Fecha o modal de boas-vindas
        document.getElementById('welcome-modal').style.display = 'none';
        
        // Exibe o modal do assistente e revela botões
        const assistantModal = document.getElementById('assistant-modal');
        const sendAudioBtn = document.getElementById('send-audio-btn');
        const navigateManualBtn = document.getElementById('navigate-manually-btn');

        if (assistantModal && sendAudioBtn && navigateManualBtn) {
            assistantModal.style.display = 'block';  // Exibe o modal

            // Revela os botões existentes
            sendAudioBtn.style.display = 'block';
            navigateManualBtn.style.display = 'block';

            // Adiciona eventos aos botões
            sendAudioBtn.addEventListener('click', () => {
                startVoiceRecognition();  // Inicia reconhecimento de voz
                assistantModal.style.display = 'none';  // Fecha o modal
            });

            navigateManualBtn.addEventListener('click', () => {
                showTutorialStep('ask-interest');  // Inicia o tutorial manual
                assistantModal.style.display = 'none';
            });
        }

        console.log(`Idioma alterado para: ${lang}`);
    });
});

// Evento de clique para iniciar navegação
// Mantém ou confirma o listener do "start-navigation-button":
    const startNavigationBtn = document.getElementById("start-navigation-button");
    if (startNavigationBtn) {
      startNavigationBtn.addEventListener("click", () => {
        console.log("✅ Botão 'start-navigation-button' clicado!");
        startNavigation();
      });
    }

// Evento para botões do menu flutuante
document.querySelectorAll('.menu-btn[data-feature]').forEach(btn => {
    btn.addEventListener('click', (event) => {
        const feature = btn.getAttribute('data-feature');
        console.log(`Feature selected: ${feature}`);
        handleFeatureSelection(feature);
        closeCarouselModal();
        removeExistingHighlights();
        removeFloatingMenuHighlights();
        removeExistingHighlights();
        event.stopPropagation();
        if (tutorialIsActive && tutorialSteps[currentStep].step === feature) {
            nextTutorialStep();
        }
    });
});


// Evento para botões de controle
document.querySelectorAll('.control-btn[data-feature]').forEach(btn => {
    btn.addEventListener('click', (event) => {
        const feature = btn.getAttribute('data-feature');
        console.log(`Control button feature selected: ${feature}`);
        handleFeatureSelection(feature);
        event.stopPropagation();
        if (tutorialIsActive && tutorialSteps[currentStep].step === feature) {
            nextTutorialStep();
        }
    });
});



    document.querySelector('.menu-btn.zoom-in').addEventListener('click', () => {
        map.zoomIn();
        closeSideMenu();
        if (tutorialIsActive && tutorialSteps[currentStep].step === 'zoom-in') {
            nextTutorialStep();
        }
    });


    document.querySelector('.menu-btn.zoom-out').addEventListener('click', () => {
        map.zoomOut();
        closeSideMenu();
        if (tutorialIsActive && tutorialSteps[currentStep].step === 'zoom-out') {
            nextTutorialStep();
        }
    });

if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/service-worker.js')
        .then(registration => {
            console.log('Service Worker registrado com sucesso:', registration);
        })
        .catch(error => {
            console.error('Erro ao registrar o Service Worker:', error);
        });

    // Recuperar o estado ao carregar a página
    navigator.serviceWorker.ready.then(() => {
        if (navigator.serviceWorker.controller) {
            navigator.serviceWorker.controller.postMessage({
                action: 'getState',
            });
        }
    });

    // Ouvir mensagens do Service Worker
    navigator.serviceWorker.onmessage = event => {
        const { action, payload } = event.data;

        if (action === 'stateRestored') {
            restoreState(payload);
        } else if (action === 'positionUpdate') {
            updateUserPositionOnMap(payload);
        }
    };
}


    if (searchBtn) {
        searchBtn.addEventListener('click', () => {
            searchLocation();
            closeSideMenu();
            if (tutorialIsActive && tutorialSteps[currentStep].step === 'pesquisar') {
                nextTutorialStep();
            }
        });
    }

    

if (startCreateRouteBtn) {
    startCreateRouteBtn.addEventListener('click', () => {
        startRouteCreation();
    });
}

    if (noBtn) {
        noBtn.addEventListener('click', () => {
            hideControlButtons();
        });
    }

    if (carouselModalClose) {
        carouselModalClose.addEventListener('click', closeCarouselModal);
    }


    if (tutorialBtn) {
        tutorialBtn.addEventListener('click', () => {
            if (tutorialIsActive) {
                endTutorial();
            } else {
                showTutorialStep('start-tutorial');
            }
        });


    const tutorialYesBtn = document.getElementById('tutorial-yes-btn');
    const tutorialSiteYesBtn = document.getElementById('tutorial-site-yes-btn');
    const tutorialNoBtn = document.getElementById('tutorial-no-btn');
    const tutorialSendBtn = document.getElementById('tutorial-send-btn');
    const showItineraryBtn = document.getElementById('show-itinerary-btn');
    const generateNewItineraryBtn = document.getElementById('generate-new-itinerary-btn');
    const changePreferencesBtn = document.getElementById('change-preferences-btn');
    const accessSiteBtn = document.getElementById('access-site-btn');

        } if (tutorialSendBtn) {
        tutorialSendBtn.addEventListener('click', () => {
            nextTutorialStep();
        });
    }


    if (tutorialYesBtn) tutorialYesBtn.addEventListener('click', startTutorial);
    if (tutorialSiteYesBtn) tutorialYesBtn.addEventListener('click', startTutorial2);
    if (tutorialNoBtn) tutorialNoBtn.addEventListener('click', () => {
        stopSpeaking();
        endTutorial();
    });
    if (tutorialNextBtn) tutorialNextBtn.addEventListener('click', nextTutorialStep);
    if (tutorialPrevBtn) tutorialPrevBtn.addEventListener('click', previousTutorialStep);
    if (tutorialEndBtn) tutorialEndBtn.addEventListener('click', endTutorial);

    if (createItineraryBtn) {
        createItineraryBtn.addEventListener('click', () => {
            endTutorial();
            closeSideMenu();
            collectInterestData();
            destroyCarousel();
        });
    }



    document.querySelector('.menu-btn[data-feature="dicas"]').addEventListener('click', showTips);
    document.querySelector('.menu-btn[data-feature="ensino"]').addEventListener('click', showEducation);
}
/**
 * 162. handleUserIdleState - Detecta inatividade e oferece ação.
 */
function handleUserIdleState(lastLocation, currentLocation) {
  const movedDistance = calculateDistance(
    lastLocation.latitude,
    lastLocation.longitude,
    currentLocation.latitude,
    currentLocation.longitude
  );
  if (movedDistance < 5) {
    showNotification("Você está inativo. Deseja recalcular a rota?", "info");
    console.log("handleUserIdleState: Usuário inativo detectado.");
  }
}

/**
 * 163. triggerHapticFeedback - Gera feedback tátil (vibração) no dispositivo.
 */
function triggerHapticFeedback(type = "short") {
  if (!navigator.vibrate) {
    console.warn("triggerHapticFeedback: Vibração não suportada.");
    return;
  }
  let pattern;
  switch (type) {
    case "long":
      pattern = [300, 100, 300];
      break;
    case "double":
      pattern = [100, 50, 100, 50, 100];
      break;
    default:
      pattern = 100;
  }
  navigator.vibrate(pattern);
  console.log(`triggerHapticFeedback: Vibração tipo "${type}" executada.`);
}

/**
 * 164. monitorUserState - Monitora o estado do usuário (movimento/inatividade).
 */
let userStateInterval = null;
function monitorUserState() {
  const watchId = startPositionTracking();

  userStateInterval = setInterval(() => {
    if (userLocation && selectedDestination?.lat && selectedDestination?.lon) {
      const distance = calculateDistance(
        userLocation.latitude,
        userLocation.longitude,
        selectedDestination.lat,
        selectedDestination.lon
      );

      if (distance > 2000) {
        console.warn("Possível desvio detectado. Recalculando rota...");
        showNotification("Verificando possível desvio de rota...", "warning");
        recalculateRoute(
          userLocation.latitude,
          userLocation.longitude,
          selectedDestination.lat,
          selectedDestination.lon
        );
      }
    }
  }, 5000); // checa a cada 5s
}

/**
 * 165. trackUserMovement - Rastreia o movimento do usuário e atualiza a navegação.
 */
function trackUserMovement(destLat, destLon, instructions, lang = selectedLanguage) {
  if (window.positionWatcher !== undefined) {
    console.warn("trackUserMovement: Já existe watchPosition ativo.");
    return;
  }
  navigationState.isActive = true;
  navigationState.instructions = instructions;
  navigationState.currentStepIndex = 0;
  window.positionWatcher = navigator.geolocation.watchPosition(
    (position) => {
      if (navigationState.isPaused) return;
      const { latitude, longitude } = position.coords;
      updateUserMarker(latitude, longitude);
      updateNavigationInstructions(latitude, longitude, instructions, destLat, destLon, lang);
      handleNextInstructionIfClose(latitude, longitude);
    },
    (error) => {
      console.error("trackUserMovement: Erro de rastreamento:", error);
      showNotification("Erro ao rastrear o usuário.", "error");
      fallbackToSensorNavigation();
    },
    { enableHighAccuracy: true }
  );
  console.log("trackUserMovement: Rastreamento iniciado.");
}

/**
 * 166. fallbackToSensorNavigation - Ativa fallback se o GPS falhar.
 */
function fallbackToSensorNavigation() {
  console.warn("Fallback para navegação por sensores ativado.");
  // Implemente a lógica de fallback, por exemplo, diminuindo a frequência de atualizações
  // ou mostrando uma mensagem ao usuário.
  showNotification("Navegação por sensores ativada.", "info");
}

function enableEcoMode() {
  console.log("[enableEcoMode] Ativando modo economia...");

  if (window.positionWatcher) {
    navigator.geolocation.clearWatch(window.positionWatcher);
    window.positionWatcher = null;
  }

  window.positionWatcher = navigator.geolocation.watchPosition(
    (pos) => {
      if (navigationState.isPaused) return;
      // Aqui você pode atualizar a navegação em tempo real
      // Exemplo: updateRealTimeNavigation(pos);
    },
    (error) => {
      console.error("[enableEcoMode] watchPosition erro:", error);
      fallbackToSensorNavigation();
    },
    {
      enableHighAccuracy: false,
      maximumAge: 30000,
      timeout: 30000
    }
  );

  document.body.classList.add("eco-mode");
  showNotification("Modo ECO ativado: GPS menos frequente!", "info");
}


/**
 * 167. alertGPSFailure - Exibe alerta em caso de falha de localização.
 */
function alertGPSFailure(error) {
  console.error("alertGPSFailure: Falha no GPS:", error);
  showNotification("Falha no GPS. Tentando usar sensores de movimento...", "warning");
  fallbackToSensorNavigation();
}

/**
 * 168. forceOfflineMode - Ativa modo offline utilizando dados em cache.
 */
function forceOfflineMode() {
  console.warn("forceOfflineMode: Conexão perdida. Ativando modo offline.");
  showNotification("Modo offline ativado. Dados em cache serão utilizados.", "warning");
  loadDestinationsFromCache((data) => {
    console.log("forceOfflineMode: Destinos carregados do cache.", data);
  });
}


/****************************************************************************
 * FIM DA SEÇÃO 10 – DIVERSOS & EVENTOS (Funções 147 – 157)
 ****************************************************************************/

/****************************************************************************
 * SEÇÃO 11 – MARKETING & RESERVAS (Funções 158 – 159)
 ****************************************************************************/

/**
 * 169. handleReservation - Processa reserva do destino selecionado.
 */
function handleReservation(buttonId, url) {
  const button = document.getElementById(buttonId);
  if (button) {
    button.addEventListener("click", () => {
      if (selectedDestination && selectedDestination.url) {
        openDestinationWebsite(url);
      } else {
        alert("Por favor, selecione um destino primeiro.");
      }
    });
    console.log(`handleReservation: Listener configurado para o botão ${buttonId}.`);
  }
}

/**
 * 170. showMarketingPopup - Exibe um popup de marketing com mensagem personalizada.
 */
function showMarketingPopup(message) {
  showNotification(message, "info", 8000);
  console.log("showMarketingPopup: Popup de marketing exibido.");
}


/****************************************************************************
 * FIM DA SEÇÃO 11 – MARKETING & RESERVAS (Funções 158 – 159)
 ****************************************************************************/

/****************************************************************************
 * SEÇÃO 12 – CONTROLE DE MENU & INTERFACE (Funções 160 – 180)
 ****************************************************************************/

/**
 * 171. toggleNavigationInstructions - Alterna a visibilidade do modal de instruções.
 */
function toggleNavigationInstructions() {
  const modal = document.getElementById("navigation-instructions");
  if (!modal) {
    console.warn("toggleNavigationInstructions: Modal não encontrado.");
    return;
  }
  modal.classList.toggle("hidden");
  const isHidden = modal.classList.contains("hidden");
  showNotification(isHidden ? "Instruções ocultadas." : "Instruções exibidas.", "info");
  console.log("toggleNavigationInstructions: Modal de instruções alternado.");
}

/**
 * 172. toggleRouteSummary - Alterna a exibição do resumo da rota.
 */
function toggleRouteSummary() {
  const summaryEl = document.getElementById("route-summary");
  if (!summaryEl) return;
  if (summaryEl.classList.contains("hidden")) {
    summaryEl.classList.remove("hidden");
    summaryEl.style.display = "block";
    showNotification("Resumo da rota exibido.", "info");
  } else {
    summaryEl.classList.add("hidden");
    summaryEl.style.display = "none";
    showNotification("Resumo da rota ocultado.", "info");
  }
  console.log("toggleRouteSummary: Resumo da rota alternado.");
}

/**
 * 173. toggleMenu - Alterna a exibição do menu lateral.
 */
function toggleMenu() {
  const menu = document.getElementById("menu");
  if (!menu) return;
  menu.style.display = menu.style.display === "block" ? "none" : "block";
  console.log("toggleMenu: Menu lateral alternado.");
}

/**
 * 174. hideAllButtons - Oculta todos os botões com a classe .control-btn.
 */
function hideAllButtons() {
  const buttons = document.querySelectorAll(".control-btn");
  buttons.forEach(btn => (btn.style.display = "none"));
  console.log("hideAllButtons: Todos os botões ocultados.");
}

/**
 * 175. hideAllControlButtons - Oculta todos os botões de controle.
 */
function hideAllControlButtons() {
  const controlButtons = document.querySelectorAll(".control-btn");
  controlButtons.forEach(btn => (btn.style.display = "none"));
  console.log("hideAllControlButtons: Botões de controle ocultados.");
}

/**
 * 176. hideAssistantModal - Fecha o modal do assistente.
 */
function hideAssistantModal() {
  const modal = document.getElementById("assistant-modal");
  if (modal) {
    modal.style.display = "none";
    console.log("hideAssistantModal: Modal do assistente fechado.");
  }
}

/**
 * 177. hideControlButtons - Oculta botões de controle específicos.
 */
function hideControlButtons() {
  const ids = ["buy-ticket-btn", "tour-btn", "reserve-restaurants-btn", "reserve-inns-btn", "speak-attendent-btn", "call-btn", "navigation-start"];
  ids.forEach(id => {
    const btn = document.getElementById(id);
    if (btn) btn.style.display = "none";
  });
  console.log("hideControlButtons: Botões específicos ocultados.");
}

/**
 * 178. hideNavigationBar - Oculta a barra de navegação.
 */
function hideNavigationBar() {
  const navBar = document.getElementById("navigation-bar");
  if (navBar) {
    navBar.style.display = "none";
    console.log("hideNavigationBar: Barra de navegação ocultada.");
  }
}

/**
 * 179. hideRouteSummary - Oculta o resumo da rota.
 */
function hideRouteSummary() {
  const summaryContainer = document.getElementById("route-summary");
  const previewContainer = document.getElementById("route-preview");
  if (summaryContainer) {
    summaryContainer.style.display = "none";
    summaryContainer.innerHTML = "";
  }
  if (previewContainer) {
    previewContainer.classList.add("hidden");
    previewContainer.innerHTML = "";
  }
  console.log("hideRouteSummary: Resumo da rota ocultado.");
}

/**
 * 180. closeSideMenu
 *    Fecha o menu lateral #menu e reseta o currentSubMenu (se houver).
 */
function closeSideMenu() {
  const menu = document.getElementById('menu');
  menu.style.display = 'none';
  currentSubMenu = null;
}


/**
 * 181. highlightElement - Adiciona destaque visual a um elemento.
 */
function highlightElement(element) {
  element.classList.add("highlight");
  setTimeout(() => element.classList.remove("highlight"), 3000);
  console.log("highlightElement: Elemento destacado.");
}

/**
 * 182. initializeNavigation - Inicializa os controles de navegação (botões de iniciar/encerrar).
 */
function initializeNavigation() {
  const startBtn = document.getElementById("start-navigation-button");
  const endBtn = document.getElementById("end-navigation-button");
  if (!startBtn || !endBtn) {
    console.error("initializeNavigation: Botões de navegação não encontrados.");
    return;
  }
  startBtn.addEventListener("click", async () => {
    console.log("initializeNavigation: Iniciando navegação...");
    await startNavigation();
  });
  endBtn.addEventListener("click", () => {
    console.log("initializeNavigation: Encerrando navegação...");
    endNavigation();
  });
}

/**
 * 183. isUserOnStreet - Verifica via reverse geocoding se o usuário está em uma rua.
 */
async function isUserOnStreet(lat, lon) {
  try {
    const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`;
    const response = await fetch(url);
    if (!response.ok) {
      console.error("isUserOnStreet: Erro na API Nominatim.");
      return false;
    }
    const data = await response.json();
    if (data.address && data.address.road) {
      console.log("isUserOnStreet: Usuário está em uma rua:", data.address.road);
      return true;
    }
    console.log("isUserOnStreet: Usuário não está em uma rua.");
    return false;
  } catch (error) {
    console.error("isUserOnStreet: Erro ao verificar usuário na rua:", error);
    return false;
  }
}

/**
 * 184. renderItinerary - Renderiza o roteiro na interface.
 */
function renderItinerary(itinerary) {
  let html = '<div class="itinerary-tabs">';
  itinerary.forEach(dayPlan => {
    html += `<div class="itinerary-tab" id="day-${dayPlan.day}">
      <h3>Dia ${dayPlan.day}</h3>
      <ul>`;
    dayPlan.activities.forEach(activity => {
      html += `<li>${activity.name} - R$ ${activity.price}</li>`;
    });
    html += '</ul></div>';
  });
  html += '</div>';
  const container = document.getElementById("itinerary-container");
  if (container) {
    container.innerHTML = html;
  }
  console.log("renderItinerary: Itinerário renderizado.");
}

/**
 * 185. requestLocationPermission - Solicita permissão de geolocalização.
 */
async function requestLocationPermission(lang = 'pt') {
  console.log("[requestLocationPermission] Checando permissão de localização...");
  
  if (!navigator.geolocation) {
    console.error("[requestLocationPermission] Geolocalização não suportada pelo navegador.");
    showNotification(getGeneralText("geolocationUnsupported", lang) || "Geolocation not supported.", "error");
    return false;
  }

  // Tenta obter a posição rapidamente para ver se há bloqueio
  try {
    await new Promise((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(
        () => resolve(true),
        (err) => reject(err),
        { timeout: 3000 }  // Tenta rápido só para ver se é permitido
      );
    });
    console.log("[requestLocationPermission] Permissão de localização concedida.");
    return true;
  } catch (err) {
    console.warn("[requestLocationPermission] Permissão negada ou tempo limite excedido.", err);
    showNotification(getGeneralText("noLocationPermission", lang) || "Location permission denied.", "warning");
    return false;
  }
}

/**
 * 186. selectDestination - Define o destino selecionado.
 */
function selectDestination(destination) {
  selectedDestination = destination;
  console.log("selectDestination: Destino selecionado:", destination);
}

/**
 * 187. sendDestinationToServiceWorker - Envia o destino selecionado ao Service Worker.
 */
function sendDestinationToServiceWorker(destination) {
  if (navigator.serviceWorker && navigator.serviceWorker.controller) {
    navigator.serviceWorker.controller.postMessage({
      type: "SAVE_DESTINATION",
      payload: destination,
    });
    console.log("sendDestinationToServiceWorker: Destino enviado ao SW.");
  } else {
    console.error("sendDestinationToServiceWorker: Service Worker não ativo.");
  }
}

/**
 * 188. setSelectedDestination - Define globalmente o destino e cria rota.
 */
function setSelectedDestination(lat, lon, name = "Destino") {
    if (!lat || !lon) {
        console.error("Coordenadas inválidas para o destino:", { lat, lon });
        showNotification("Erro: coordenadas do destino são inválidas. Por favor, tente novamente.", "error");
        return;
    }

    selectedDestination = { lat, lon, name };
    console.log("Destino selecionado:", selectedDestination);

    // Notifica o usuário sobre a seleção do destino
    showNotification(`Destino "${name}" selecionado com sucesso!`, "success");
    giveVoiceFeedback(`Destino ${name} foi selecionado. Criando rota agora.`);

    // Inicia a criação da rota
    createRoute(lat, lon);
}


/**
 * 189. validateSelectedDestination
 *    Valida se existe um selectedDestination com lat/lon. Emite notificação se inválido.
 */
function validateSelectedDestination() {
    if (!selectedDestination || !selectedDestination.lat || !selectedDestination.lon) {
        showNotification('Por favor, selecione um destino válido.', 'error');
        giveVoiceFeedback('Nenhum destino válido selecionado.');
        return false;
    }
    return true;
}

/**
 * 190. showButtons - Exibe um grupo de botões com base em seus IDs.
 */
function showButtons(buttonIds) {
    const allButtons = document.querySelectorAll('.control-buttons button');
    allButtons.forEach(button => button.style.display = 'none');

    buttonIds.forEach(buttonId => {
        const button = document.getElementById(buttonId);
        if (button) {
            button.style.display = 'inline-block';
        }
    });
}

/**
 * 191. showMenuButtons - Exibe os botões do menu lateral.
 */
function showMenuButtons() {
  const menuButtons = document.querySelectorAll(".menu-btn");
  menuButtons.forEach(btn => btn.classList.remove("hidden"));
  const menuToggle = document.getElementById("menu-btn");
  if (menuToggle) menuToggle.classList.remove("hidden");
  const floatingMenu = document.getElementById("floating-menu");
  if (floatingMenu) floatingMenu.classList.remove("hidden");
  console.log("showMenuButtons: Botões do menu exibidos.");
}

/**
 * 192. showNearbyPOIs - Exibe pontos de interesse próximos no mapa.
 */
function showNearbyPOIs(poiList) {
  poiList.forEach(poi => {
    const marker = L.marker([poi.lat, poi.lon]).addTo(map)
      .bindPopup(`<b>${poi.name}</b>`)
      .openPopup();
    markers.push(marker);
  });
  console.log("showNearbyPOIs: POIs próximos exibidos.", poiList);
}

/**
 * 193. showStartRouteButton - Exibe o botão “Iniciar Rota” na interface.
 */
function showStartRouteButton() {
  const startRouteBtn = document.getElementById("start-route-btn");
  if (startRouteBtn) {
    startRouteBtn.style.display = "block";
    console.log("showStartRouteButton: Botão 'Iniciar Rota' exibido.");
  }
}

/**
 * 194. displayOSMData
 *    Exibe dados vindos do Overpass-API no submenu correspondente e cria marcadores no mapa.
 */
function displayOSMData(data, subMenuId, feature) {
    // Limpa o conteúdo do submenu
    const subMenu = document.getElementById(subMenuId);
    subMenu.innerHTML = '';

    // Cria botões dinamicamente
    data.elements.forEach(element => {
        if (element.type === 'node' && element.tags.name) {
            const btn = document.createElement('button');
            btn.className = 'submenu-item submenu-button';
            btn.textContent = element.tags.name;
            btn.setAttribute('data-destination', element.tags.name);

            const description = element.tags.description || 'Descrição não disponível';

            btn.onclick = () => {
                handleSubmenuButtons(
                    element.lat,
                    element.lon,
                    element.tags.name,
                    description,
                    element.tags.images || [],
                    feature
                );
            };

            subMenu.appendChild(btn);

            // Adiciona marcador
            const marker = L.marker([element.lat, element.lon])
                .addTo(map)
                .bindPopup(`<b>${element.tags.name}</b><br>${description}`);
            markers.push(marker);
        }
    });

    // Configura evento de clique
    document.querySelectorAll('.submenu-button').forEach(btn => {
        btn.addEventListener('click', function() {
            const destination = this.getAttribute('data-destination');
            console.log(`Destination selected: ${destination}`);
            showDestinationContent(destination);
        });
    });
}

/****************************************************************************
 * SEÇÃO 13 – TRADUÇÃO & INTERNACIONALIZAÇÃO (Funções 181 – 185)
 ****************************************************************************/

/**
 * 195. translateInstruction - Traduz uma instrução usando um dicionário.
 */
function translateInstruction(instruction, lang = "pt") {
  const dictionary = {
    pt: {
      "Turn right": "Vire à direita",
      "Turn left": "Vire à esquerda",
      "Continue straight": "Continue em frente"
    },
    en: {
      "Vire à direita": "Turn right",
      "Vire à esquerda": "Turn left",
      "Continue em frente": "Continue straight"
    }
  };
  if (!dictionary[lang]) return instruction;
  return dictionary[lang][instruction] || instruction;
}

/**
 * 196. translatePageContent - Atualiza todos os textos da interface conforme o idioma.
 */
function translatePageContent(lang) {
  const elements = document.querySelectorAll("[data-i18n]");
  let missingCount = 0;
  elements.forEach(el => {
    const key = el.getAttribute("data-i18n");
    const translation = getGeneralText(key, lang);
    if (translation.startsWith("⚠️")) {
      missingCount++;
      console.warn(`translatePageContent: Tradução ausente para "${key}" em ${lang}.`);
    }
    if (el.tagName === "INPUT" || el.tagName === "TEXTAREA") {
      el.placeholder = translation;
    } else if (el.hasAttribute("title")) {
      el.title = translation;
    } else {
      el.textContent = translation;
    }
  });
  if (missingCount > 0) {
    console.warn(`translatePageContent: ${missingCount} traduções ausentes.`);
  } else {
    console.log(`translatePageContent: Interface traduzida para ${lang}.`);
  }
}

/**
 * 197. validateTranslations - Verifica se todas as chaves de tradução estão definidas.
 */
function validateTranslations(lang) {
  const elements = document.querySelectorAll("[data-i18n]");
  const missingKeys = [];
  elements.forEach(el => {
    const key = el.getAttribute("data-i18n");
    const translation = getGeneralText(key, lang);
    if (translation.startsWith("⚠️")) {
      missingKeys.push(key);
    }
  });
  if (missingKeys.length > 0) {
    console.warn(`validateTranslations: Faltam traduções para ${lang}:`, missingKeys);
  } else {
    console.log(`validateTranslations: Todas as traduções definidas para ${lang}.`);
  }
}

/**
 * 198. applyLanguage - Aplica o idioma na interface e valida as traduções.
 */
function applyLanguage(lang) {
  validateTranslations(lang);
  updateInterfaceLanguage(lang);
  console.log(`applyLanguage: Idioma aplicado: ${lang}`);
}

/**
 * 199. getGeneralText - Retorna o texto traduzido para uma chave e idioma.
 */
function getGeneralText(key, lang = 'pt') {
  const translationsData = {
    pt: {
      // NOVAS CHAVES ADICIONADAS OU AJUSTADAS
      title: "Morro de São Paulo Digital",              // <title data-i18n="title">
      chooseLanguage: "Escolha seu idioma:",            // data-i18n="chooseLanguage"
      tourist_spots: "Pontos Turísticos",               // data-i18n="tourist_spots" (botão)
      tours: "Passeios",                                // data-i18n="tours"
      beaches: "Praias",                                // data-i18n="beaches"
      parties: "Festas",                                // data-i18n="parties"
      restaurants: "Restaurantes",                      // data-i18n="restaurants"
      inns: "Pousadas",                                 // data-i18n="inns"
      shops: "Lojas",                                   // data-i18n="shops"
      emergencies: "Emergências",                       // data-i18n="emergencies"
      cancel_navigation: "Cancelar Navegação",          // data-i18n="cancel_navigation"
      start_route: "Iniciar Rota",                      // data-i18n="start_route"
      route_summary_title: "Resumo da Rota",            // data-i18n="route_summary_title"
      route_distance: "Distância:",                     // data-i18n="route_distance"
      route_eta: "Tempo Estimado:",                     // data-i18n="route_eta"
      instructions_title: "Instruções de Navegação",    // data-i18n="instructions_title"

      // Chaves já existentes (mantidas e/ou conferidas com o checklist)
      close_modal: "X",
      close_modal_carousel:"X",
      close_menu: "Fechar Menu",
      offlineTitle: "Modo Offline",
      offlineMsg: "Você está offline. Algumas funcionalidades podem não estar disponíveis.",
      offRoute: "Você saiu da rota. Recalculando...",
      routeError: "Erro",
      noInstructions: "Nenhuma instrução disponível.",
      destinationReached: "Destino alcançado.",
      complete: "completo",
      recalculatingRoute: "Recalculando rota...",
      createRouteError: "Erro ao criar rota. Por favor, tente novamente.",
      pathDrawnSuccess: "Nova rota desenhada com sucesso.",
      navigationStarted: "Navegação iniciada.",
      arrivedAtDestination: "Você chegou ao seu destino!",
      loadingResources: "Carregando recursos necessários...",
      loadingResourcesFail: "Falha ao carregar recursos. Tente novamente.",
      selectDestinationFirst: "Por favor, selecione um destino primeiro.",
      routeNotFoundAPI: "Nenhuma rota encontrada pela API (features vazias).",
      failedToPlotRoute: "Falha ao plotar rota no mapa.",
      userOffRoad: "Você saiu da estrada!",
      trackingError: "Falha no rastreamento de localização. Verifique permissões.",
      checkingDeviation: "Verificando possível desvio de rota...",
      multiRouteFail: "Falha ao plotar rota com múltiplos destinos.",
      userIsIdle: "Você está parado. Deseja continuar ou recalcular a rota?",
      partnerCheckin: "Você chegou em {partnerName}! Ganhou um Drink e 10 pontos!",
      routeRecalculatedOk: "Rota recalculada com sucesso.",
      routeDeviated: "Você desviou da rota. Recalculando...",
      invalidDestination: "Destino inválido. Por favor, selecione outro.",
      obstacleDetected: "Obstáculo detectado à frente. Ajustando rota.",
      routeDataError: "Erro ao carregar dados da rota.",
      noRoutePreview: "Nenhuma rota disponível para pré-visualização.",
      routePreviewActivated: "Pré-visualização da rota ativada.",
      navEnded: "Navegação encerrada.",
      navPaused: "Navegação pausada.",
      navResumed: "Navegação retomada.",
      getRouteInstructions: "Iniciando obtenção de instruções de rota...",
      instructionsMissing: "Instruções ausentes ou não encontradas.",
      pleaseSelectDestination: "Por favor, selecione um destino antes de iniciar a rota.",
      noCarouselImages: "Nenhuma imagem disponível para o carrossel.",
      searchError: "Ocorreu um erro na busca.",
      confirmRoute: "Confirme sua rota.",
      noLocationPermission: "Permissão de localização negada.",
      waitingForRoute: "Aguardando rota.",
      adjustPosition: "Ajuste sua posição para uma rua próxima.",
      errorTitle: "Erro",
      errorCloseButton: "Fechar",
      offlineModeButton: "Entendido",
      assistantModalClose: "Fechar Assistente",
      welcomeTitle: "BEM-VINDO!",
      welcomeSubtitle: "Escolha seu idioma:",
      dicasMenu: "Dicas",
      zoomIn: "Aumentar Zoom",
      zoomOut: "Diminuir Zoom",
      pesquisar: "Pesquisar",
      sobreMenu: "Sobre",
      closeSideMenu: "Fechar Menu",
      submenu_touristSpots: "Pontos Turísticos",
      submenu_tours: "Passeios",
      submenu_beaches: "Praias",
      submenu_nightlife: "Vida Noturna",
      submenu_restaurants: "Restaurantes",
      submenu_inns: "Pousadas",
      submenu_shops: "Lojas",
      submenu_emergencies: "Emergências",
      submenu_tips: "Dicas",
      submenu_about: "Sobre",
      submenu_education: "Educação",
      tutorialBtn: "Iniciar Tutorial",
      pontosTuristicosBtn: "Pontos Turísticos",
      passeiosBtn: "Passeios",
      praiasBtn: "Praias",
      festasBtn: "Festas",
      restaurantesBtn: "Restaurantes",
      pousadasBtn: "Pousadas",
      lojasBtn: "Lojas",
      emergenciasBtn: "Emergências",
      fotosBtn: "Fotos",
      comoChegarBtn: "Como Chegar",
      reservarMesaBtn: "Reservar Mesa",
      ligarBtn: "Ligar",
      reservarQuartoBtn: "Reservar Quarto",
      reservarCadeirasBtn: "Reservar Cadeiras",
      comprarIngressoBtn: "Comprar Ingresso",
      reservarPasseioBtn: "Reservar Passeio",
      enviarBtn: "Enviar",
      acessarSiteBtn: "Acessar Site",
      iniciarNavegacaoBtn: "Iniciar Navegação",
      pararNavegacaoBtn: "Parar Navegação",
      acessarMenuBtn: "Acessar Menu",
      iniciarRotaBtn: "Iniciar Rota",
      cancelarNavegacaoBtn: "Cancelar Navegação",
      pausarBtn: "Pausar",
      back: "Voltar",
      navigate_manually: "Navegar Manualmente",
      carouselModalClose: "Fechar",
      carouselTitle: "Galeria de Imagens",
      nextSlide: "Próximo Slide",
      prevSlide: "Slide Anterior",
      routeSummaryTitle: "Resumo da Rota",
      routeDistance: "Distância:",
      routeETA: "Tempo Estimado:",
      instructionsTitle: "Instruções de Navegação",
      stepExample1: "Siga em frente por 200 metros.",
      stepExample2: "Vire à esquerda em 50 metros.",
      toggle_instructions: "Minimizar Instruções",
      progressLabel: "Progresso:",
      languageChanged: "Idioma alterado para: {lang}",
      tutorialStart: "Iniciar",
      tutorialEnd: "Encerrar Tutorial",
      tutorialYes: "Sim",
      tutorialNo: "Não",
      tutorialSend: "Enviar",
      showItinerary: "Ver Roteiro",
      generateNewItinerary: "Gerar outro Roteiro",
      changePreferences: "Alterar Preferências",
      welcome: "Bem-vindo ao nosso site!",
      youAreHere: "Você está aqui!",
      pousadasMessage: "Encontre as melhores pousadas para sua estadia.",
      touristSpotsMessage: "Descubra os pontos turísticos mais populares.",
      beachesMessage: "Explore as praias mais belas de Morro de São Paulo.",
      toursMessage: "Veja passeios disponíveis e opções de reserva.",
      restaurantsMessage: "Descubra os melhores restaurantes da região.",
      partiesMessage: "Saiba sobre festas e eventos disponíveis.",
      shopsMessage: "Encontre lojas locais para suas compras.",
      emergenciesMessage: "Informações úteis para situações de emergência.",
      createItinerary: "Criar Roteiro",
      aboutMore: "Fotos",
      createRoute: "Como Chegar",
      reserveTable: "Reservar Mesa",
      accessWebsite: "Site",
      reserveRoom: "Reservar Quarto",
      reserveChairs: "Reservar Cadeiras",
      buyTicket: "Comprar Ingresso",
      reserveTour: "Reservar Passeio",
      viewItinerary: "Ver Roteiro",
      navigationStarted_pt: "Navegação iniciada.",
      turnLeft: "Vire à esquerda",
      turnRight: "Vire à direita",
      continueStraight: "Continue em frente",
      assistant_title: "Assistente Virtual",
      assistant_text: "Como posso ajudar você hoje?",
      send_audio: "Enviar Áudio",
      how_to_get_there: "Como Chegar",
      pause: "Pausar",
      partner_checkin: "Você chegou a um parceiro! Aproveite suas recompensas!",
      marketing_popup: "Reserve agora e ganhe desconto!",
      mapInitialized: "Mapa inicializado com sucesso.",
      loaderFail: "Erro ao carregar recursos.",
      routePlotted: "Rota plotada com sucesso.",
      noInstructionsAvailable: "Nenhuma instrução disponível.",
      calculatingRoute: "Calculando rota...",
      routeNotFound: "Nenhuma rota foi encontrada!",
      locationUnavailable: "Localização não disponível.",
      fetchingInstructionsError: "Erro ao buscar instruções de navegação.",
      access_menu: "Acessar Menu",
      startNavigation: "Iniciar Navegação",
      minutes: "minutos",

      // ================================
      // NOVAS CHAVES PARA SUPORTE A INSTRUÇÕES OSM
      // ================================
      head_north: "Siga para o norte",
      head_south: "Siga para o sul",
      head_east: "Siga para o leste",
      head_west: "Siga para o oeste",
      turn_sharp_left: "Vire acentuadamente à esquerda",
      turn_sharp_right: "Vire acentuadamente à direita",
      turn_slight_left: "Vire levemente à esquerda",
      turn_slight_right: "Vire levemente à direita",
      turn_left: "Vire à esquerda",
      turn_right: "Vire à direita",
      continue_straight: "Continue em frente",
      keep_left: "Mantenha-se à esquerda",
      keep_right: "Mantenha-se à direita",
      u_turn: "Faça um retorno",
      enter_roundabout: "Entre na rotatória",
      exit_roundabout: "Saia da rotatória",
      ferry: "Atravesse via balsa",
      end_of_road: "Vá até o fim da via",
      arrive_destination: "Você chegou ao destino final"
    },

    en: {
      // NEW KEYS ADDED OR ADJUSTED
      title: "Morro de São Paulo Digital",
      chooseLanguage: "Choose your language:",
      tourist_spots: "Tourist Spots",
      tours: "Tours",
      beaches: "Beaches",
      parties: "Parties",
      restaurants: "Restaurants",
      inns: "Inns",
      shops: "Shops",
      emergencies: "Emergencies",
      cancel_navigation: "Stop Navigation",
      start_route: "Start Route",
      route_summary_title: "Route Summary",
      route_distance: "Distance:",
      route_eta: "Estimated Time:",
      instructions_title: "Navigation Instructions",

      // Existing keys (verified/renamed to match HTML)
      close_modal: "X",
      close_modal_carousel:"X",
      close_menu: "Close Menu",
      offlineTitle: "Offline Mode",
      offlineMsg: "You are offline. Some features may not be available.",
      offRoute: "You are off route. Recalculating...",
      routeError: "Error",
      noInstructions: "No instructions available.",
      destinationReached: "Destination reached.",
      complete: "complete",
      recalculatingRoute: "Recalculating route...",
      createRouteError: "Error creating route. Please try again.",
      pathDrawnSuccess: "New route drawn successfully.",
      navigationStarted: "Navigation started.",
      arrivedAtDestination: "You have arrived at your destination!",
      loadingResources: "Loading necessary resources...",
      loadingResourcesFail: "Failed to load resources. Please try again.",
      selectDestinationFirst: "Please select a destination first.",
      routeNotFoundAPI: "No route found by the API (empty features).",
      failedToPlotRoute: "Failed to plot route on the map.",
      userOffRoad: "You left the road!",
      trackingError: "Failed to track location. Check permissions.",
      checkingDeviation: "Checking for possible route deviation...",
      multiRouteFail: "Failed to plot route with multiple waypoints.",
      userIsIdle: "You are stopped. Continue or recalculate the route?",
      partnerCheckin: "You arrived at {partnerName}! Enjoy your drink and +10 points!",
      routeRecalculatedOk: "Route successfully recalculated.",
      routeDeviated: "You are off route. Recalculating...",
      invalidDestination: "Invalid destination. Please select another.",
      obstacleDetected: "Obstacle detected ahead. Adjusting route.",
      routeDataError: "Error loading route data.",
      noRoutePreview: "No route available for preview.",
      routePreviewActivated: "Route preview activated.",
      navEnded: "Navigation ended.",
      navPaused: "Navigation paused.",
      navResumed: "Navigation resumed.",
      getRouteInstructions: "Retrieving route instructions...",
      instructionsMissing: "Missing instructions or not found.",
      pleaseSelectDestination: "Please select a destination before starting the route.",
      noCarouselImages: "No images available for the carousel.",
      searchError: "An error occurred during the search.",
      confirmRoute: "Confirm your route.",
      noLocationPermission: "Location permission denied.",
      waitingForRoute: "Waiting for route.",
      adjustPosition: "Adjust your position to a nearby road.",
      errorTitle: "Error",
      errorCloseButton: "Close",
      offlineModeButton: "Understood",
      assistantModalClose: "Close Assistant",
      welcomeTitle: "WELCOME!",
      welcomeSubtitle: "Choose your language:",
      dicasMenu: "Tips",
      zoomIn: "Zoom In",
      zoomOut: "Zoom Out",
      pesquisar: "Search",
      sobreMenu: "About",
      closeSideMenu: "Close Menu",
      submenu_touristSpots: "Tourist Spots",
      submenu_tours: "Tours",
      submenu_beaches: "Beaches",
      submenu_nightlife: "Nightlife",
      submenu_restaurants: "Restaurants",
      submenu_inns: "Inns",
      submenu_shops: "Shops",
      submenu_emergencies: "Emergencies",
      submenu_tips: "Tips",
      submenu_about: "About",
      submenu_education: "Education",
      tutorialBtn: "Start Tutorial",
      pontosTuristicosBtn: "Tourist Spots",
      passeiosBtn: "Tours",
      praiasBtn: "Beaches",
      festasBtn: "Parties",
      restaurantesBtn: "Restaurants",
      pousadasBtn: "Inns",
      lojasBtn: "Shops",
      emergenciasBtn: "Emergencies",
      fotosBtn: "Photos",
      comoChegarBtn: "How to Get There",
      reservarMesaBtn: "Reserve Table",
      ligarBtn: "Call",
      reservarQuartoBtn: "Reserve Room",
      reservarCadeirasBtn: "Reserve Chairs",
      comprarIngressoBtn: "Buy Ticket",
      reservarPasseioBtn: "Reserve Tour",
      enviarBtn: "Send",
      acessarSiteBtn: "Access Site",
      iniciarNavegacaoBtn: "Start Navigation",
      pararNavegacaoBtn: "Stop Navigation",
      acessarMenuBtn: "Access Menu",
      iniciarRotaBtn: "Start Route",
      cancelarNavegacaoBtn: "Cancel Navigation",
      pausarBtn: "Pause",
      back: "Back",
      navigate_manually: "Navigate Manually",
      carouselModalClose: "Close",
      carouselTitle: "Image Gallery",
      nextSlide: "Next Slide",
      prevSlide: "Previous Slide",
      routeSummaryTitle: "Route Summary",
      routeDistance: "Distance:",
      routeETA: "Estimated Time:",
      instructionsTitle: "Navigation Instructions",
      stepExample1: "Go straight for 200 meters.",
      stepExample2: "Turn left in 50 meters.",
      toggle_instructions: "Minimize Instructions",
      progressLabel: "Progress:",
      languageChanged: "Language changed to: {lang}",
      tutorialStart: "Start",
      tutorialEnd: "End Tutorial",
      tutorialYes: "Yes",
      tutorialNo: "No",
      tutorialSend: "Send",
      showItinerary: "View Itinerary",
      generateNewItinerary: "Generate New Itinerary",
      changePreferences: "Change Preferences",
      welcome: "Welcome to our site!",
      youAreHere: "You are here!",
      pousadasMessage: "Find the best inns for your stay.",
      touristSpotsMessage: "Discover the most popular tourist spots.",
      beachesMessage: "Explore the most beautiful beaches of Morro de São Paulo.",
      toursMessage: "Check available tours and booking options.",
      restaurantsMessage: "Discover the best restaurants in the region.",
      partiesMessage: "Learn about available parties and events.",
      shopsMessage: "Find local stores for your shopping.",
      emergenciesMessage: "Useful information for emergency situations.",
      createItinerary: "Create Itinerary",
      aboutMore: "Photos",
      createRoute: "How to Get There",
      reserveTable: "Reserve Table",
      accessWebsite: "Website",
      reserveRoom: "Reserve Room",
      reserveChairs: "Reserve Chairs",
      buyTicket: "Buy Ticket",
      reserveTour: "Reserve Tour",
      viewItinerary: "View Itinerary",
      navigationStarted_en: "Navigation started.",
      turnLeft: "Turn left",
      turnRight: "Turn right",
      continueStraight: "Continue straight",
      assistant_title: "Virtual Assistant",
      assistant_text: "How can I help you today?",
      send_audio: "Send Audio",
      how_to_get_there: "How to Get There",
      pause: "Pause",
      partner_checkin: "You arrived at a partner! Enjoy your rewards!",
      marketing_popup: "Book now and get a discount!",
      mapInitialized: "Map initialized successfully.",
      loaderFail: "Failed to load resources.",
      routePlotted: "Route plotted successfully.",
      noInstructionsAvailable: "No instructions available.",
      calculatingRoute: "Calculating route...",
      routeNotFound: "No route found!",
      locationUnavailable: "Location not available.",
      fetchingInstructionsError: "Error fetching route instructions.",
      access_menu: "Access Menu",
      startNavigation: "Start Navigation",
      minutes: "minutes",

      // ================================
      // NOVAS CHAVES PARA SUPORTE A INSTRUÇÕES OSM
      // ================================
      head_north: "Head north",
      head_south: "Head south",
      head_east: "Head east",
      head_west: "Head west",
      turn_sharp_left: "Turn sharply left",
      turn_sharp_right: "Turn sharply right",
      turn_slight_left: "Turn slightly left",
      turn_slight_right: "Turn slightly right",
      turn_left: "Turn left",
      turn_right: "Turn right",
      continue_straight: "Continue straight",
      keep_left: "Keep left",
      keep_right: "Keep right",
      u_turn: "Make a U-turn",
      enter_roundabout: "Enter the roundabout",
      exit_roundabout: "Exit the roundabout",
      ferry: "Take the ferry",
      end_of_road: "Follow the road to the end",
      arrive_destination: "You have arrived at your final destination"
    },

    es: {
      // ========== CHAVES ADICIONADAS OU AJUSTADAS PARA ESPANHOL ==========
      title: "Morro de São Paulo Digital",
      chooseLanguage: "Elige tu idioma:",
      tourist_spots: "Lugares Turísticos",
      tours: "Paseos",
      beaches: "Playas",
      parties: "Fiestas",
      restaurants: "Restaurantes",
      inns: "Posadas",
      shops: "Tiendas",
      emergencies: "Emergencias",
      cancel_navigation: "Cancelar Navegación",
      start_route: "Iniciar Ruta",
      route_summary_title: "Resumen de la Ruta",
      route_distance: "Distancia:",
      route_eta: "Tiempo Estimado:",
      instructions_title: "Instrucciones de Navegación",

      // ========== CHAVES JÁ EXISTENTES (traduzidas para o Espanhol) ==========
      close_modal: "X",
      close_modal_carousel:"X",
      close_menu: "Cerrar Menú",
      offlineTitle: "Modo Offline",
      offlineMsg: "Estás offline. Algunas funciones pueden no estar disponibles.",
      offRoute: "Has salido de la ruta. Recalculando...",
      routeError: "Error al crear la ruta.",
      noInstructions: "Ninguna instrucción disponible.",
      destinationReached: "Destino alcanzado.",
      complete: "completo",
      recalculatingRoute: "Recalculando ruta...",
      createRouteError: "Error al crear la ruta. Por favor, intenta de nuevo.",
      pathDrawnSuccess: "Nueva ruta dibujada con éxito.",
      navigationStarted: "Navegación iniciada.",
      arrivedAtDestination: "¡Has llegado a tu destino!",
      loadingResources: "Cargando recursos necesarios...",
      loadingResourcesFail: "Error al cargar recursos. Intenta nuevamente.",
      selectDestinationFirst: "Por favor, selecciona un destino primero.",
      routeNotFoundAPI: "La API no ha encontrado ninguna ruta (features vacías).",
      failedToPlotRoute: "No se pudo trazar la ruta en el mapa.",
      userOffRoad: "¡Te has salido de la carretera!",
      trackingError: "Fallo en el rastreo de ubicación. Verifica permisos.",
      checkingDeviation: "Verificando posible desvío de ruta...",
      multiRouteFail: "No se pudo trazar ruta con varios destinos.",
      userIsIdle: "Estás detenido. ¿Continuar o recalcular la ruta?",
      partnerCheckin: "¡Has llegado a {partnerName}! ¡Disfruta de tu bebida y 10 puntos!",
      routeRecalculatedOk: "Ruta recalculada con éxito.",
      routeDeviated: "Te has desviado de la ruta. Recalculando...",
      invalidDestination: "Destino inválido. Por favor, selecciona otro.",
      obstacleDetected: "Se detectó un obstáculo por delante. Ajustando la ruta.",
      routeDataError: "Error al cargar datos de la ruta.",
      noRoutePreview: "No hay ninguna ruta disponible para previsualizar.",
      routePreviewActivated: "Previsualización de la ruta activada.",
      navEnded: "Navegación finalizada.",
      navPaused: "Navegación pausada.",
      navResumed: "Navegación reanudada.",
      getRouteInstructions: "Obteniendo instrucciones de la ruta...",
      instructionsMissing: "Faltan instrucciones o no se han encontrado.",
      pleaseSelectDestination: "Por favor, selecciona un destino antes de iniciar la ruta.",
      noCarouselImages: "No hay imágenes disponibles para el carrusel.",
      searchError: "Ocurrió un error durante la búsqueda.",
      confirmRoute: "Confirma tu ruta.",
      noLocationPermission: "Permiso de ubicación denegado.",
      waitingForRoute: "Esperando la ruta.",
      adjustPosition: "Ajusta tu posición a una carretera cercana.",
      errorTitle: "Error",
      errorCloseButton: "Cerrar",
      offlineModeButton: "Entendido",
      assistantModalClose: "Cerrar Asistente",
      welcomeTitle: "¡BIENVENIDO!",
      welcomeSubtitle: "Elige tu idioma:",
      dicasMenu: "Consejos",
      zoomIn: "Acercar Zoom",
      zoomOut: "Alejar Zoom",
      pesquisar: "Buscar",
      sobreMenu: "Acerca de",
      closeSideMenu: "Cerrar Menú",
      submenu_touristSpots: "Lugares Turísticos",
      submenu_tours: "Paseos",
      submenu_beaches: "Playas",
      submenu_nightlife: "Vida Nocturna",
      submenu_restaurants: "Restaurantes",
      submenu_inns: "Posadas",
      submenu_shops: "Tiendas",
      submenu_emergencies: "Emergencias",
      submenu_tips: "Consejos",
      submenu_about: "Acerca de",
      submenu_education: "Educación",
      tutorialBtn: "Iniciar Tutorial",
      pontosTuristicosBtn: "Lugares Turísticos",
      passeiosBtn: "Paseos",
      praiasBtn: "Playas",
      fiestasBtn: "Fiestas",
      restaurantesBtn: "Restaurantes",
      pousadasBtn: "Posadas",
      lojasBtn: "Tiendas",
      emergenciasBtn: "Emergencias",
      fotosBtn: "Fotos",
      comoChegarBtn: "Cómo Llegar",
      reservarMesaBtn: "Reservar Mesa",
      ligarBtn: "Llamar",
      reservarQuartoBtn: "Reservar Habitación",
      reservarCadeirasBtn: "Reservar Sillas",
      comprarIngressoBtn: "Comprar Entrada",
      reservarPasseioBtn: "Reservar Paseo",
      enviarBtn: "Enviar",
      acessarSiteBtn: "Acceder al Sitio",
      iniciarNavegacaoBtn: "Iniciar Navegación",
      pararNavegacaoBtn: "Parar Navegación",
      acessarMenuBtn: "Acceder al Menú",
      iniciarRotaBtn: "Iniciar Ruta",
      cancelarNavegacaoBtn: "Cancelar Navegación",
      pausarBtn: "Pausar",
      back: "Volver",
      navigate_manually: "Navegar Manualmente",
      carouselModalClose: "Cerrar",
      carouselTitle: "Galería de Imágenes",
      nextSlide: "Siguiente Diapositiva",
      prevSlide: "Diapositiva Anterior",
      routeSummaryTitle: "Resumen de la Ruta",
      routeDistance: "Distancia:",
      routeETA: "Tiempo Estimado:",
      instructionsTitle: "Instrucciones de Navegación",
      stepExample1: "Continúa recto por 200 metros.",
      stepExample2: "Gira a la izquierda en 50 metros.",
      toggle_instructions: "Minimizar Instrucciones",
      progressLabel: "Progreso:",
      languageChanged: "Idioma cambiado a: {lang}",
      tutorialStart: "Iniciar",
      tutorialEnd: "Finalizar Tutorial",
      tutorialYes: "Sí",
      tutorialNo: "No",
      tutorialSend: "Enviar",
      showItinerary: "Ver Itinerario",
      generateNewItinerary: "Generar otro Itinerario",
      changePreferences: "Cambiar Preferencias",
      welcome: "¡Bienvenido a nuestro sitio!",
      youAreHere: "¡Estás aquí!",
      pousadasMessage: "Encuentra las mejores posadas para tu estancia.",
      touristSpotsMessage: "Descubre los lugares turísticos más populares.",
      beachesMessage: "Explora las playas más hermosas de Morro de São Paulo.",
      toursMessage: "Ve paseos disponibles y opciones de reserva.",
      restaurantsMessage: "Descubre los mejores restaurantes de la región.",
      partiesMessage: "Entérate de las fiestas y eventos disponibles.",
      shopsMessage: "Encuentra tiendas locales para tus compras.",
      emergenciesMessage: "Información útil para situaciones de emergencia.",
      createItinerary: "Crear Itinerario",
      aboutMore: "Fotos",
      createRoute: "Cómo Llegar",
      reserveTable: "Reservar Mesa",
      accessWebsite: "Sitio Web",
      reserveRoom: "Reservar Habitación",
      reserveChairs: "Reservar Sillas",
      buyTicket: "Comprar Entrada",
      reserveTour: "Reservar Paseo",
      viewItinerary: "Ver Itinerario",
      navigationStarted_pt: "Navegación iniciada.",
      turnLeft: "Gira a la izquierda",
      turnRight: "Gira a la derecha",
      continueStraight: "Continúa recto",
      assistant_title: "Asistente Virtual",
      assistant_text: "¿En qué puedo ayudarte hoy?",
      send_audio: "Enviar Audio",
      how_to_get_there: "Cómo Llegar",
      pause: "Pausar",
      partner_checkin: "¡Has llegado a un socio! ¡Disfruta tus recompensas!",
      marketing_popup: "¡Reserva ahora y obtén un descuento!",
      mapInitialized: "Mapa inicializado con éxito.",
      loaderFail: "Error al cargar recursos.",
      routePlotted: "Ruta trazada con éxito.",
      noInstructionsAvailable: "Ninguna instrucción disponible.",
      calculatingRoute: "Calculando ruta...",
      routeNotFound: "¡No se encontró ninguna ruta!",
      locationUnavailable: "Ubicación no disponible.",
      fetchingInstructionsError: "Error al buscar instrucciones de navegación.",
      access_menu: "Acceder al Menú",
      startNavigation: "Iniciar Navegación",
      minutes: "minutos",

      // ================================
      // NOVAS CHAVES PARA SUPORTE A INSTRUÇÕES OSM
      // ================================
      head_north: "Dirígete hacia el norte",
      head_south: "Dirígete hacia el sur",
      head_east: "Dirígete hacia el este",
      head_west: "Dirígete hacia el oeste",
      turn_sharp_left: "Gira bruscamente a la izquierda",
      turn_sharp_right: "Gira bruscamente a la derecha",
      turn_slight_left: "Gira levemente a la izquierda",
      turn_slight_right: "Gira levemente a la derecha",
      turn_left: "Gira a la izquierda",
      turn_right: "Gira a la derecha",
      continue_straight: "Continúa recto",
      keep_left: "Mantente a la izquierda",
      keep_right: "Mantente a la derecha",
      u_turn: "Haz un giro en U",
      enter_roundabout: "Entra a la rotonda",
      exit_roundabout: "Sal de la rotonda",
      ferry: "Cruza en ferry",
      end_of_road: "Sigue hasta el final de la vía",
      arrive_destination: "Has llegado a tu destino final"
    },

    he: {
      // ========== CHAVES ADICIONADAS OU AJUSTADAS PARA HEBRAICO ==========
      title: "מורו דה סאו פאולו דיגיטלי",
      chooseLanguage: "בחר את השפה שלך:",
      tourist_spots: "אתרי תיירות",
      tours: "סיורים",
      beaches: "חופים",
      parties: "מסיבות",
      restaurants: "מסעדות",
      inns: "אכסניות",
      shops: "חנויות",
      emergencies: "חירום",
      cancel_navigation: "בטל ניווט",
      start_route: "התחל מסלול",
      route_summary_title: "סיכום המסלול",
      route_distance: "מרחק:",
      route_eta: "זמן משוער:",
      instructions_title: "הוראות ניווט",

      // ========== CHAVES JÁ EXISTENTES (traduzidas para o Hebraico) ==========
      close_modal: "X",
      close_modal_carousel:"X",
      close_menu: "סגור תפריט",
      offlineTitle: "מצב לא מקוון",
      offlineMsg: "אתה במצב לא מקוון. חלק מהפונקציות עשויות להיות לא זמינות.",
      offRoute: "יצאת מהמסלול. מחשב מחדש...",
      routeError: "שגיאה ביצירת המסלול.",
      noInstructions: "אין הוראות זמינות.",
      destinationReached: "הגעת ליעד.",
      complete: "הושלם",
      recalculatingRoute: "מחשב מסלול מחדש...",
      createRouteError: "שגיאה ביצירת המסלול. אנא נסה שוב.",
      pathDrawnSuccess: "מסלול חדש הוצג בהצלחה.",
      navigationStarted: "ניווט התחיל.",
      arrivedAtDestination: "הגעת ליעד שלך!",
      loadingResources: "טוען משאבים נחוצים...",
      loadingResourcesFail: "נכשל בטעינת משאבים. אנא נסה שוב.",
      selectDestinationFirst: "אנא בחר יעד קודם.",
      routeNotFoundAPI: "לא נמצאה מסלול על ידי ה-API (אין נתונים).",
      failedToPlotRoute: "נכשל בניסיון לצייר את המסלול במפה.",
      userOffRoad: "יצאת מהכביש!",
      trackingError: "נכשל במעקב המיקום. בדוק הרשאות.",
      checkingDeviation: "בודק אפשרות לסטייה מהמסלול...",
      multiRouteFail: "נכשל לייצר מסלול מרובה עצירות.",
      userIsIdle: "אתה עומד במקום. האם להמשיך או לחשב מחדש את המסלול?",
      partnerCheckin: "הגעת ל-{partnerName}! קבל משקה ועוד 10 נקודות!",
      routeRecalculatedOk: "המסלול חושב מחדש בהצלחה.",
      routeDeviated: "סטית מהמסלול. מחשב מחדש...",
      invalidDestination: "יעד לא תקין. אנא בחר אחר.",
      obstacleDetected: "זוהה מכשול מלפנים. מתאים את המסלול.",
      routeDataError: "שגיאה בטעינת נתוני המסלול.",
      noRoutePreview: "אין מסלול זמין לתצוגה מקדימה.",
      routePreviewActivated: "תצוגה מקדימה הופעלה.",
      navEnded: "ניווט הסתיים.",
      navPaused: "ניווט הופסק.",
      navResumed: "ניווט חודש.",
      getRouteInstructions: "מקבל הוראות ניווט...",
      instructionsMissing: "הוראות חסרות או לא נמצאו.",
      pleaseSelectDestination: "אנא בחר יעד לפני תחילת הניווט.",
      noCarouselImages: "אין תמונות זמינות לצפייה.",
      searchError: "אירעה שגיאה בחיפוש.",
      confirmRoute: "אשר את המסלול שלך.",
      noLocationPermission: "הרשאת מיקום נדחתה.",
      waitingForRoute: "ממתין למסלול.",
      adjustPosition: "התאם את המיקום שלך לרחוב סמוך.",
      errorTitle: "שגיאה",
      errorCloseButton: "סגור",
      offlineModeButton: "הבנתי",
      assistantModalClose: "סגור עוזר",
      welcomeTitle: "ברוך הבא!",
      welcomeSubtitle: "בחר את השפה שלך:",
      dicasMenu: "טיפים",
      zoomIn: "הגדל תצוגה",
      zoomOut: "הקטן תצוגה",
      pesquisar: "חיפוש",
      sobreMenu: "אודות",
      closeSideMenu: "סגור תפריט",
      submenu_touristSpots: "אתרי תיירות",
      submenu_tours: "סיורים",
      submenu_beaches: "חופים",
      submenu_nightlife: "חיי לילה",
      submenu_restaurants: "מסעדות",
      submenu_inns: "אכסניות",
      submenu_shops: "חנויות",
      submenu_emergencies: "חירום",
      submenu_tips: "טיפים",
      submenu_about: "אודות",
      submenu_education: "חינוך",
      tutorialBtn: "התחל הדרכה",
      pontosTuristicosBtn: "אתרי תיירות",
      passeiosBtn: "סיורים",
      praiasBtn: "חופים",
      festasBtn: "מסיבות",
      restaurantesBtn: "מסעדות",
      pousadasBtn: "אכסניות",
      lojasBtn: "חנויות",
      emergenciasBtn: "חירום",
      fotosBtn: "תמונות",
      comoChegarBtn: "איך להגיע",
      reservarMesaBtn: "הזמן שולחן",
      ligarBtn: "התקשר",
      reservarQuartoBtn: "הזמן חדר",
      reservarCadeirasBtn: "הזמן כיסאות",
      comprarIngressoBtn: "קנה כרטיס",
      reservarPasseioBtn: "הזמן סיור",
      enviarBtn: "שלח",
      acessarSiteBtn: "כניסה לאתר",
      iniciarNavegacaoBtn: "התחל ניווט",
      pararNavegacaoBtn: "עצור ניווט",
      acessarMenuBtn: "כניסה לתפריט",
      iniciarRotaBtn: "התחל מסלול",
      cancelarNavegacaoBtn: "בטל ניווט",
      pausarBtn: "השהה",
      back: "חזור",
      navigate_manually: "ניווט ידני",
      carouselModalClose: "סגור",
      carouselTitle: "גלריית תמונות",
      nextSlide: "שקופית הבאה",
      prevSlide: "שקופית קודמת",
      routeSummaryTitle: "סיכום המסלול",
      routeDistance: "מרחק:",
      routeETA: "זמן משוער:",
      instructionsTitle: "הוראות ניווט",
      stepExample1: "המשך ישר ל-200 מטרים.",
      stepExample2: "פנה שמאלה בעוד 50 מטרים.",
      toggle_instructions: "הקטן הוראות",
      progressLabel: "התקדמות:",
      languageChanged: "השפה הוחלפה ל: {lang}",
      tutorialStart: "ההתחלה",
      tutorialEnd: "סיים הדרכה",
      tutorialYes: "כן",
      tutorialNo: "לא",
      tutorialSend: "שלח",
      showItinerary: "הצג מסלול",
      generateNewItinerary: "צור מסלול חדש",
      changePreferences: "שנה העדפות",
      welcome: "ברוך הבא לאתר שלנו!",
      youAreHere: "אתה כאן!",
      pousadasMessage: "מצא את האכסניות הטובות ביותר לשהותך.",
      touristSpotsMessage: "גלה את האתרים התיירותיים הפופולריים ביותר.",
      beachesMessage: "גלה את החופים היפים ביותר במורו דה סאו פאולו.",
      toursMessage: "בדוק סיורים זמינים ואפשרויות הזמנה.",
      restaurantsMessage: "גלה את המסעדות הטובות ביותר באזור.",
      partiesMessage: "בדוק מסיבות ואירועים זמינים.",
      shopsMessage: "מצא חנויות מקומיות לקניות.",
      emergenciesMessage: "מידע מועיל למקרי חירום.",
      createItinerary: "צור מסלול",
      aboutMore: "תמונות",
      createRoute: "איך להגיע",
      reserveTable: "הזמן שולחן",
      accessWebsite: "אתר",
      reserveRoom: "הזמן חדר",
      reserveChairs: "הזמן כיסאות",
      buyTicket: "קנה כרטיס",
      reserveTour: "הזמן סיור",
      viewItinerary: "הצג מסלול",
      navigationStarted_pt: "ניווט התחיל.",
      turnLeft: "פנה שמאלה",
      turnRight: "פנה ימינה",
      continueStraight: "המשך ישר",
      assistant_title: "עוזר וירטואלי",
      assistant_text: "איך אני יכול לעזור לך היום?",
      send_audio: "שלח אודיו",
      how_to_get_there: "איך להגיע",
      pause: "השהה",
      partner_checkin: "הגעת לשותף! תהנה מהמתנות שלך!",
      marketing_popup: "הזמן עכשיו וקבל הנחה!",
      mapInitialized: "המפה הופעלה בהצלחה.",
      loaderFail: "שגיאה בטעינת המשאבים.",
      routePlotted: "המסלול שורטט בהצלחה.",
      noInstructionsAvailable: "אין הוראות זמינות.",
      calculatingRoute: "מחשב מסלול...",
      routeNotFound: "לא נמצאה מסלול!",
      locationUnavailable: "המיקום אינו זמין.",
      fetchingInstructionsError: "שגיאה בקבלת הוראות ניווט.",
      access_menu: "כניסה לתפריט",
      startNavigation: "התחל ניווט",
      minutes: "דקות",

      // ================================
      // NOVAS CHAVES PARA SUPORTE A INSTRUÇÕES OSM
      // ================================
      head_north: "התחל צפונה",
      head_south: "התחל דרומה",
      head_east: "התחל מזרחה",
      head_west: "התחל מערבה",
      turn_sharp_left: "פנה בחדות שמאלה",
      turn_sharp_right: "פנה בחדות ימינה",
      turn_slight_left: "פנה קלות שמאלה",
      turn_slight_right: "פנה קלות ימינה",
      turn_left: "פנה שמאלה ",
      turn_right: "פנה ימינה ",
      continue_straight: "המשך ישר ",
      keep_left: "הישאר בצד שמאל",
      keep_right: "הישאר בצד ימין",
      u_turn: "בצע פניית פרסה",
      enter_roundabout: "היכנס לכיכר",
      exit_roundabout: "צא מהכיכר",
      ferry: "חצה במעבורת",
      end_of_road: "סע עד סוף הדרך",
      arrive_destination: "הגעת ליעד שלך"
    }
  };

  if (!translationsData[lang]) {
    console.warn(`[getGeneralText] Idioma '${lang}' não encontrado. Fallback 'pt'.`);
    lang = 'pt';
  }

  if (translationsData[lang][key]) {
    return translationsData[lang][key];
  } else if (translationsData['pt'][key]) {
    console.warn(`[getGeneralText] Chave '${key}' ausente em '${lang}', mas existe em 'pt'.`);
    return translationsData['pt'][key];
  }

  console.warn(`[getGeneralText] Chave '${key}' não encontrada em nenhum idioma.`);
  return `⚠️ ${key}`;
}


/****************************************************************************
 * SEÇÃO 15 – MODOS ESPECIAIS & CUSTOMIZAÇÃO (Funções 187 – 188)
 ****************************************************************************/

/**
 * 200. enableDarkMode - Ativa o modo escuro na interface.
 */
function enableDarkMode() {
  document.body.classList.add("dark-mode");
  showNotification("Modo escuro ativado.", "info");
  console.log("enableDarkMode: Modo escuro ativado.");
}

/**
 * 201. enableEcoMode - Ativa o modo econômico, reduzindo a frequência do GPS.
 */
function enableEcoMode() {
  console.log("enableEcoMode: Ativando modo econômico...");
  if (window.positionWatcher) {
    navigator.geolocation.clearWatch(window.positionWatcher);
    window.positionWatcher = null;
  }
  window.positionWatcher = navigator.geolocation.watchPosition(
    (pos) => {
      if (navigationState.isPaused) return;
      console.log("enableEcoMode: Posição (Eco):", pos.coords);
    },
    (error) => {
      console.error("enableEcoMode: Erro no watchPosition:", error);
      fallbackToSensorNavigation();
    },
    {
      enableHighAccuracy: false,
      maximumAge: 30000,
      timeout: 30000
    }
  );
  document.body.classList.add("eco-mode");
  showNotification("Modo ECO ativado: GPS menos frequente.", "info");
  console.log("enableEcoMode: Modo econômico ativado.");
}


/****************************************************************************
 * SEÇÃO 16 – UTILITÁRIOS & HELPERS (Funções 189 – 194)
 ****************************************************************************/

/**
 * 202. clearElement - Remove todos os filhos de um elemento.
 */
function clearElement(element) {
  while (element.firstChild) {
    element.removeChild(element.firstChild);
  }
  console.log("clearElement: Elemento limpo.");
}

/**
 * 203. updateInstructionsOnProgress - Atualiza as instruções conforme o progresso.
 */
function updateInstructionsOnProgress(step) {
  const instructionList = document.getElementById("instruction-list");
  if (instructionList) {
    instructionList.innerHTML = step.instructions.map(inst => `<li>${inst}</li>`).join("");
    console.log("updateInstructionsOnProgress: Instruções atualizadas.", step.instructions);
  }
}

/**
 * 204. updateNavigationControls - Atualiza os controles de navegação (botões).
 */
function updateNavigationControls(isPaused) {
  const startBtn = document.getElementById("start-navigation-button");
  const pauseBtn = document.getElementById("pause-navigation-button");
  const continueBtn = document.getElementById("continue-navigation-button");
  if (!startBtn || !pauseBtn || !continueBtn) {
    console.error("updateNavigationControls: Botões de navegação não encontrados.");
    return;
  }
  if (isPaused) {
    startBtn.style.display = "none";
    pauseBtn.style.display = "none";
    continueBtn.style.display = "block";
  } else {
    startBtn.style.display = "none";
    pauseBtn.style.display = "block";
    continueBtn.style.display = "none";
  }
  console.log(`updateNavigationControls: Navegação ${isPaused ? "pausada" : "ativa"}.`);
}

/**
 * 205. getNavigationText - Gera texto descritivo para uma instrução.
 */
function getNavigationText(instruction) {
  return `${instruction.step}. ${instruction.description}`;
}

/**
 * 206. getSelectedDestination - Retorna o destino selecionado do cache (localStorage).
 */
function getSelectedDestination() {
    return new Promise((resolve, reject) => {
        try {
            const destination = JSON.parse(localStorage.getItem('selectedDestination'));
            console.log('Retrieved Selected Destination:', destination);
            if (destination) {
                selectedDestination = destination;
                resolve(destination);
            } else {
                reject(new Error('No destination selected.'));
            }
        } catch (error) {
            console.error('Erro ao resgatar destino do cache:', error);
            reject(new Error('Erro ao resgatar destino do cache.'));
        }
    });
}

/**
 * 207. getUrlsForLocation - Retorna a URL associada a um local.
 */
function getUrlsForLocation(locationName) {
    const urlDatabase = {
        // Festas
        'Toca do Morcego': 'https://www.tocadomorcego.com.br/',
        'Pulsar': 'http://example.com/pulsar',
        'Mama Iate': 'http://example.com/mama_iate',
        'Teatro do Morro': 'http://example.com/teatro_do_morro',
        // Passeios
        'Passeio de lancha Volta a Ilha de Tinharé': 'https://passeiosmorro.com.br/passeio-volta-a-ilha',
        'Passeio de Quadriciclo para Garapuá': 'https://passeiosmorro.com.br/passeio-de-quadriciclo',
        'Passeio 4X4 para Garapuá': 'https://passeiosmorro.com.br/passeio-de-4x4',
        'Passeio de Barco para Gamboa': 'https://passeiosmorro.com.br/passeio-de-barco',
        // Restaurantes
        'Morena Bela': 'http://example.com/morena_bela',
        'Basílico': 'http://example.com/basilico',
        'Ki Massa': 'http://example.com/ki_massa',
        'Tempeiro Caseiro': 'http://example.com/tempeiro_caseiro',
        'Bizu': 'http://example.com/bizu',
        'Pedra Sobre Pedra': 'http://example.com/pedra_sobre_pedra',
        'Forno a Lenha de Mercedes': 'http://example.com/forno_a_lenha',
        'Ponto G': 'http://example.com/ponto_g',
        'Ponto 9,99': 'http://example.com/ponto_999',
        'Patricia': 'http://example.com/patricia',
        'dizi 10': 'http://example.com/dizi_10',
        'Papoula': 'http://example.com/papoula',
        'Sabor da terra': 'http://example.com/sabor_da_terra',
        'Branco&Negro': 'http://example.com/branco_negro',
        'Six Club': 'http://example.com/six_club',
        'Santa Villa': 'http://example.com/santa_villa',
        'Recanto do Aviador': 'http://example.com/recanto_do_aviador',
        'Sambass': 'https://www.sambass.com.br/',
        'Bar e Restaurante da Morena': 'http://example.com/bar_restaurante_morena',
        'Restaurante Alecrim': 'http://example.com/restaurante_alecrim',
        'Andina Cozinha Latina': 'http://example.com/andina_cozinha_latina',
        'Papoula Culinária Artesanal': 'http://example.com/papoula_culinaria_artesanal',
        'Minha Louca Paixão': 'https://www.minhaloucapaixao.com.br/',
        'Café das Artes': 'http://example.com/cafe_das_artes',
        'Canoa': 'http://example.com/canoa',
        'Restaurante do Francisco': 'http://example.com/restaurante_francisco',
        'La Tabla': 'http://example.com/la_tabla',
        'Santa Luzia': 'http://example.com/santa_luzia',
        'Chez Max': 'http://example.com/chez_max',
        'Barraca da Miriam': 'http://example.com/barraca_miriam',
        'O Casarão restaurante': 'http://example.com/casarao_restaurante',
        // Pousadas
        'Hotel Fazenda Parque Vila': 'http://example.com/hotel_fazenda_parque_vila',
        'Guaiamu': 'http://example.com/guaiamu',
        'Pousada Fazenda Caeiras': 'https://pousadacaeira.com.br/',
        'Amendoeira Hotel': 'http://example.com/amendoeira_hotel',
        'Pousada Natureza': 'http://example.com/pousada_natureza',
        'Pousada dos Pássaros': 'http://example.com/pousada_dos_passaros',
        'Hotel Morro de São Paulo': 'http://example.com/hotel_morro_sao_paulo',
        'Uma Janela para o Sol': 'http://example.com/uma_janela_para_sol',
        'Portaló': 'http://example.com/portalo',
        'Pérola do Morro': 'http://example.com/perola_do_morro',
        'Safira do Morro': 'http://example.com/safira_do_morro',
        'Xerife Hotel': 'http://example.com/xerife_hotel',
        'Ilha da Saudade': 'http://example.com/ilha_da_saudade',
        'Porto dos Milagres': 'http://example.com/porto_dos_milagres',
        'Passarte': 'http://example.com/passarte',
        'Pousada da Praça': 'http://example.com/pousada_da_praca',
        'Pousada Colibri': 'http://example.com/pousada_colibri',
        'Pousada Porto de Cima': 'http://example.com/pousada_porto_de_cima',
        'Vila Guaiamu': 'http://example.com/vila_guaiamu',
        'Villa dos Corais pousada': 'http://example.com/villa_dos_corais',
        'Hotel Anima': 'http://example.com/hotel_anima',
        'Vila dos Orixás Boutique Hotel & Spa': 'http://example.com/vila_dos_orixas',
        'Hotel Karapitangui': 'http://example.com/hotel_karapitangui',
        'Pousada Timbalada': 'http://example.com/pousada_timbalada',
        'Casa Celestino Residence': 'http://example.com/casa_celestino_residence',
        'Bahia Bacana Pousada': 'http://example.com/bahia_bacana_pousada',
        'Hotel Morro da Saudade': 'http://example.com/hotel_morro_da_saudade',
        'Bangalô dos sonhos': 'http://example.com/bangalo_dos_sonhos',
        'Cantinho da Josete': 'http://example.com/cantinho_da_josete',
        'Vila Morro do Sao Paulo': 'http://example.com/vila_morro_sao_paulo',
        'Casa Rossa': 'http://example.com/casa_rossa',
        'Village Paraíso Tropical': 'http://example.com/village_paraiso_tropical',
        // Lojas
        'Absolute': 'http://example.com/absolute',
        'Local Brasil': 'http://example.com/local_brasil',
        'Super Zimbo': 'http://example.com/super_zimbo',
        'Mateus Esquadrais': 'http://example.com/mateus_esquadrais',
        'São Pedro Imobiliária': 'http://example.com/sao_pedro_imobiliaria',
        'Imóveis Brasil Bahia': 'http://example.com/imoveis_brasil_bahia',
        'Coruja': 'http://example.com/coruja',
        'Zimbo Dive': 'http://example.com/zimbo_dive',
        'Havaianas': 'http://example.com/havaianas',
        // Emergências
        'Ambulância': 'http://example.com/ambulancia',
        'Unidade de Saúde': 'http://example.com/unidade_de_saude',
        'Polícia Civil': 'http://example.com/policia_civil',
        'Polícia Militar': 'http://example.com/policia_militar',
    };

    return urlDatabase[locationName] || null;
}


/**
 * 208. searchLocation
 *    Realiza a busca de um local (via Nominatim) e, em seguida,
 *    obtém POIs correlatos via Overpass-API, usando sinônimos e queries definidas.
 */
function searchLocation() {
    const apiKey = OPENROUTESERVICE_API_KEY; // ou sua const

    const queries = {
        'restaurantes': '[out:json];node["amenity"="restaurant"](around:15000,-13.376,-38.913);out body;',
        'pousadas': '[out:json];node["tourism"="hotel"](around:15000,-13.376,-38.913);out body;',
        'lojas': '[out:json];node["shop"](around:15000,-13.376,-38.913);out body;',
        'praias': '[out:json];node["natural"="beach"](around:15000,-13.376,-38.913);out body;',
        'pontos turísticos': '[out:json];node["tourism"="attraction"](around:10000,-13.376,-38.913);out body;',
        'passeios': '[out:json];node["tourism"="information"](around:10000,-13.376,-38.913);out body;',
        'festas': '[out:json];node["amenity"="nightclub"](around:10000,-13.376,-38.913);out body;',
        'bares': '[out:json];node["amenity"="bar"](around:10000,-13.376,-38.913);out body;',
        'cafés': '[out:json];node["amenity"="cafe"](around:10000,-13.376,-38.913);out body;',
        'hospitais': '[out:json];node["amenity"="hospital"](around:10000,-13.376,-38.913);out body;',
        'farmácias': '[out:json];node["amenity"="pharmacy"](around:10000,-13.376,-38.913);out body;',
        'parques': '[out:json];node["leisure"="park"](around:10000,-13.376,-38.913);out body;',
        'postos de gasolina': '[out:json];node["amenity"="fuel"](around:10000,-13.376,-38.913);out body;',
        'banheiros públicos': '[out:json];node["amenity"="toilets"](around:10000,-13.376,-38.913);out body;',
        'caixas eletrônicos': '[out:json];node["amenity"="atm"](around:10000,-13.376,-38.913);out body;',
        'emergências': '[out:json];node["amenity"~"hospital|police"](around:10000,-13.376,-38.913);out body;',
        'dicas': '[out:json];node["tips"](around:10000,-13.376,-38.913);out body;',
        'sobre': '[out:json];node["about"](around:10000,-13.376,-38.913);out body;',
        'educação': '[out:json];node["education"](around:10000,-13.376,-38.913);out body;'
    };

    const synonyms = {
        'restaurantes': ['restaurantes', 'restaurante', 'comida', 'alimentação', 'refeições', 'culinária', 'jantar', 'almoço', 'lanche', 'bistrô', 'churrascaria', 'lanchonete', 'restarante', 'restaurnte', 'restaurente', 'restaurantr', 'restaurnate', 'restauranta'],
        'pousadas': ['pousadas', 'pousada', 'hotéis', 'hotel', 'hospedagem', 'alojamento', 'hostel', 'residência', 'motel', 'resort', 'abrigo', 'estadia', 'albergue', 'pensão', 'inn', 'guesthouse', 'bed and breakfast', 'bnb', 'pousasa', 'pousda', 'pousdada'],
        'lojas': ['lojas', 'loja', 'comércio', 'shopping', 'mercado', 'boutique', 'armazém', 'supermercado', 'minimercado', 'quiosque', 'feira', 'bazaar', 'loj', 'lojs', 'lojinha', 'lojinhas', 'lojz', 'lojax'],
        'praias': ['praias', 'praia', 'litoral', 'costa', 'faixa de areia', 'beira-mar', 'orla', 'prais', 'praia', 'prai', 'preia', 'preias'],
        'pontos turísticos': ['pontos turísticos', 'turismo', 'atrações', 'sítios', 'marcos históricos', 'monumentos', 'locais históricos', 'museus', 'galerias', 'exposições', 'ponto turístico', 'ponto turístco', 'ponto turisico', 'pontus turisticus', 'pont turistic'],
        'passeios': ['passeios', 'excursões', 'tours', 'visitas', 'caminhadas', 'aventuras', 'trilhas', 'explorações', 'paseios', 'paseio', 'pasceios', 'paseis'],
        'festas': ['festas', 'festa', 'baladas', 'balada', 'vida noturna', 'discotecas', 'clubes noturnos', 'boate', 'clube', 'fest', 'festass', 'baladas', 'balad', 'baldas', 'festinh', 'festona', 'fesat', 'fetsas'],
        'bares': ['bares', 'bar', 'botecos', 'pubs', 'tabernas', 'cervejarias', 'choperias', 'barzinho', 'drinks', 'bares', 'barzinhos', 'baress'],
        'cafés': ['cafés', 'café', 'cafeterias', 'bistrôs', 'casas de chá', 'confeitarias', 'docerias', 'cafe', 'caf', 'cafeta', 'cafett', 'cafetta', 'cafeti'],
        'hospitais': ['hospitais', 'hospital', 'saúde', 'clínicas', 'emergências', 'prontos-socorros', 'postos de saúde', 'centros médicos', 'hspital', 'hopital', 'hospial', 'hspitais', 'hsopitais', 'hospitalar', 'hospitai'],
        'farmácias': ['farmácias', 'farmácia', 'drogarias', 'apotecas', 'lojas de medicamentos', 'farmacia', 'fármacia', 'farmásia', 'farmci', 'farmacias', 'farmac', 'farmaci'],
        'parques': ['parques', 'parque', 'jardins', 'praças', 'áreas verdes', 'reserva natural', 'bosques', 'parques urbanos', 'parqe', 'parq', 'parcs', 'paques', 'park', 'parks', 'parqu'],
        'postos de gasolina': ['postos de gasolina', 'posto de gasolina', 'combustível', 'gasolina', 'abastecimento', 'serviços automotivos', 'postos de combustível', 'posto de combustivel', 'pstos de gasolina', 'post de gasolina', 'pstos', 'pstos de combustivel', 'pstos de gas'],
        'banheiros públicos': ['banheiros públicos', 'banheiro público', 'toaletes', 'sanitários', 'banheiros', 'WC', 'lavabos', 'toilets', 'banheiro publico', 'banhero público', 'banhero publico', 'banhero', 'banheir'],
        'caixas eletrônicos': ['caixas eletrônicos', 'caixa eletrônico', 'atm', 'banco', 'caixa', 'terminal bancário', 'caixa automático', 'saque', 'caixa eletronico', 'caxas eletronicas', 'caxa eletronica', 'caxas', 'caias eletronico', 'caias'],
        'emergências': ['emergências', 'emergência', 'polícia', 'hospital', 'serviços de emergência', 'socorro', 'urgências', 'emergencia', 'emergencia', 'emrgencia', 'emrgencias'],
        'dicas': ['dicas', 'dica', 'conselhos', 'sugestões', 'recomendações', 'dics', 'dcias', 'dicaz', 'dicaa', 'dicassa'],
        'sobre': ['sobre', 'informações', 'detalhes', 'a respeito', 'informação', 'sbre', 'sore', 'sob', 'sobr', 'sobe'],
        'educação': ['educação', 'educacao', 'escolas', 'faculdades', 'universidades', 'instituições de ensino', 'cursos', 'aulas', 'treinamentos', 'aprendizagem', 'educaçao', 'educacão', 'eduacão', 'eduacao', 'educaç', 'educça']
    };

    const searchQuery = prompt("Digite o local que deseja buscar em Morro de São Paulo:");
    if (searchQuery) {
        const viewBox = '-38.926, -13.369, -38.895, -13.392';
        let nominatimUrl = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}&viewbox=${viewBox}&bounded=1&key=${apiKey}`;

        fetch(nominatimUrl)
            .then(response => response.json())
            .then(data => {
                console.log("Data from Nominatim:", data);
                if (data && data.length > 0) {
                    // Filtra resultados apenas dentro do retângulo
                    const filteredData = data.filter(location => {
                        const lat = parseFloat(location.lat);
                        const lon = parseFloat(location.lon);
                        return lon >= -38.926 && lon <= -38.895 && lat >= -13.392 && lat <= -13.369;
                    });

                    console.log("Filtered data:", filteredData);

                    if (filteredData.length > 0) {
                        const firstResult = filteredData[0];
                        const lat = firstResult.lat;
                        const lon = firstResult.lon;

                        // Remove o marcador atual, se existir
                        if (currentMarker) {
                            map.removeLayer(currentMarker);
                        }

                        // Remove todos os marcadores antigos
                        markers.forEach(marker => map.removeLayer(marker));
                        markers = [];

                        // Adiciona um novo marcador para o resultado da pesquisa
                        currentMarker = L.marker([lat, lon])
                            .addTo(map)
                            .bindPopup(firstResult.display_name)
                            .openPopup();

                        map.setView([lat, lon], 14);

                        // Verifica se a busca corresponde a alguma categoria
                        let queryKey = null;
                        const lowerQuery = searchQuery.toLowerCase();
                        for (const [key, value] of Object.entries(synonyms)) {
                            if (value.includes(lowerQuery)) {
                                queryKey = key;
                                break;
                            }
                        }

                        console.log("Query key:", queryKey);

                        if (queryKey && queries[queryKey]) {
                            const overpassUrl = `https://overpass-api.de/api/interpreter?data=${encodeURIComponent(queries[queryKey])}`;
                            fetch(overpassUrl)
                                .then(response => response.json())
                                .then(osmData => {
                                    console.log("Data from Overpass:", osmData);
                                    if (osmData && osmData.elements && osmData.elements.length > 0) {
                                        osmData.elements.forEach(element => {
                                            const name = element.tags.name || 'Sem nome';
                                            const description =
                                                element.tags.description ||
                                                element.tags.amenity ||
                                                element.tags.tourism ||
                                                element.tags.natural ||
                                                '';
                                            const marker = L.marker([element.lat, element.lon]).addTo(map)
                                                .bindPopup(`<b>${name}</b><br>${description}`)
                                                .openPopup();
                                            markers.push(marker);
                                        });
                                    } else {
                                        alert(`Nenhum(a) ${searchQuery} encontrado(a) num raio de 1.5km.`);
                                    }
                                })
                                .catch(error => {
                                    console.error("Erro ao buscar dados do Overpass:", error);
                                    alert("Ocorreu um erro ao buscar pontos de interesse.");
                                });
                        } else {
                            alert(`Busca por "${searchQuery}" não é suportada. Tente buscar por restaurantes, pousadas, lojas, praias, ou outros pontos de interesse.`);
                        }
                    } else {
                        alert("Local não encontrado em Morro de São Paulo.");
                    }
                } else {
                    alert("Local não encontrado.");
                }
            })
            .catch(error => {
                console.error("Erro na busca:", error);
                alert("Ocorreu um erro na busca.");
            });
    }
}


/**
 * 209. onDOMContentLoaded (Event Listener)
 *    Ao carregar a página, obtém 'queryParams', chama searchOSM (ou função análoga)
 *    e exibe resultados no console.
 */
document.addEventListener('DOMContentLoaded', async () => {
    const queryParams = {
        bbox: {
            north: -13.3614,
            south: -13.3947,
            east: -38.8974,
            west: -38.9191
        },
        types: [
            { key: 'tourism', value: 'attraction' },
            { key: 'tourism', value: 'museum' },
            { key: 'tourism', value: 'viewpoint' },
            { key: 'amenity', value: 'restaurant' },
            { key: 'amenity', value: 'cafe' },
            { key: 'amenity', value: 'bar' },
            { key: 'amenity', value: 'pub' },
            { key: 'amenity', value: 'fast_food' },
            { key: 'amenity', value: 'hospital' },
            { key: 'amenity', value: 'police' },
            { key: 'amenity', value: 'pharmacy' },
            { key: 'natural', value: 'beach' },
            { key: 'leisure', value: 'park' },
            { key: 'leisure', value: 'garden' },
            { key: 'leisure', value: 'playground' },
            { key: 'historic', value: 'castle' },
            { key: 'historic', value: 'monument' },
            { key: 'historic', value: 'ruins' },
            { key: 'historic', value: 'memorial' },
            { key: 'shop', value: 'supermarket' },
            { key: 'shop', value: 'bakery' },
            { key: 'shop', value: 'clothes' },
            { key: 'shop', value: 'gift' },
            { key: 'shop', value: 'convenience' }
        ],
        radius: 15000
    };

    // Exemplo: se houver uma função searchOSM(queryParams) no seu código:
    const results = await searchOSM(queryParams);
    console.log('Resultados da busca:', results);
});


/**
 * 210. performControlAction
 *    Executa ações específicas de controle, conforme 'action' recebido.
 */
function performControlAction(action) {
    switch (action) {
        case 'next':
            nextTutorialStep(currentStep);
            break;
        case 'previous':
            previousTutorialStep(currentStep);
            break;
        case 'finish':
            endTutorial();
            break;
        case 'start-tutorial':
            initializeTutorial();
            break;
        case 'menu-toggle':
            const floatingMenu = document.getElementById('floating-menu');
            floatingMenu.classList.toggle('hidden');
            break;
        case 'pontos-turisticos':
            storeAndProceed('pontos-turisticos');
            break;
        case 'passeios':
            storeAndProceed('passeios');
            break;
        case 'praias':
            storeAndProceed('praias');
            break;
        case 'festas':
            storeAndProceed('festas');
            break;
        case 'restaurantes':
            storeAndProceed('restaurantes');
            break;
        case 'pousadas':
            storeAndProceed('pousadas');
            break;
        case 'lojas':
            storeAndProceed('lojas');
            break;
        case 'emergencias':
            storeAndProceed('emergencias');
            break;
        case 'reserve-chairs':
            alert('Reserva de cadeiras iniciada.');
            break;
        case 'buy-ticket':
            alert('Compra de ingresso iniciada.');
            break;
        case 'create-route':
            startRouteCreation();
            break;
        case 'access-site':
            accessSite(); 
            break;
        case 'tutorial-send':
            nextTutorialStep();
            break;
        case 'tutorial-menu':
            showTutorialStep('ask-interest');
            break;
        case 'start-navigation-button':
            startNavigation();
            break;
        case 'navigation-end':
            endNavigation();
            break;
        default:
            console.error(`Ação não reconhecida: ${action}`);
    }
}


/**
 * 211. openDestinationWebsite
 *    Abre a URL de um destino em nova aba.
 */
function openDestinationWebsite(url) {
    window.open(url, '_blank');
}


/**
 * 212. getImagesForLocation
 *    Retorna um array de URLs de imagens para um local (nome => lista de strings).
 */
function getImagesForLocation(locationName) {
    const basePath = 'Images/';

    const imageDatabase = {
        'Farol do Morro': [
            `${basePath}farol_do_morro1.jpg`,
            `${basePath}farol_do_morro2.jpg`,
            `${basePath}farol_do_morro3.jpg`
        ],
        'Toca do Morcego': [
            `${basePath}toca_do_morcego1.jpg`,
            `${basePath}toca_do_morcego2.jpg`,
            `${basePath}toca_do_morcego3.jpg`
        ],
        'Mirante da Tirolesa': [
            `${basePath}mirante_da_tirolesa1.jpg`,
            `${basePath}mirante_da_tirolesa2.jpg`,
            `${basePath}mirante_da_tirolesa3.jpg`
        ],
        'Fortaleza de Morro de São Paulo': [
            `${basePath}fortaleza_de_morro1.jpg`,
            `${basePath}fortaleza_de_morro2.jpg`,
            `${basePath}fortaleza_de_morro3.jpg`
        ],
        'Paredão da Argila': [
            `${basePath}paredao_da_argila1.jpg`,
            `${basePath}paredao_da_argila2.jpg`,
            `${basePath}paredao_da_argila3.jpg`
        ],
        'Passeio de lancha Volta a Ilha de Tinharé': [
            `${basePath}passeio_lancha_ilha_tinhare1.jpg`,
            `${basePath}passeio_lancha_ilha_tinhare2.jpg`,
            `${basePath}passeio_lancha_ilha_tinhare3.jpg`
        ],
        'Passeio de Quadriciclo para Garapuá': [
            `${basePath}passeio_quadriciclo_garapua1.jpg`,
            `${basePath}passeio_quadriciclo_garapua2.jpg`,
            `${basePath}passeio_quadriciclo_garapua3.jpg`
        ],
        'Passeio 4X4 para Garapuá': [
            `${basePath}passeio_4x4_garapua1.jpg`,
            `${basePath}passeio_4x4_garapua2.jpg`,
            `${basePath}passeio_4x4_garapua3.jpg`
        ],
        'Passeio de Barco para Gamboa': [
            `${basePath}passeio_barco_gamboa1.jpg`,
            `${basePath}passeio_barco_gamboa2.jpg`,
            `${basePath}passeio_barco_gamboa3.jpg`
        ],
        'Primeira Praia': [
            `${basePath}primeira_praia1.jpg`,
            `${basePath}primeira_praia2.jpg`,
            `${basePath}primeira_praia3.jpg`
        ],
        'Segunda Praia': [
            `${basePath}segunda_praia1.jpg`,
            `${basePath}segunda_praia2.jpg`,
            `${basePath}segunda_praia3.jpg`
        ],
        'Terceira Praia': [
            `${basePath}terceira_praia1.jpg`,
            `${basePath}terceira_praia2.jpg`,
            `${basePath}terceira_praia3.jpg`
        ],
        'Quarta Praia': [
            `${basePath}quarta_praia1.jpg`,
            `${basePath}quarta_praia2.jpg`,
            `${basePath}quarta_praia3.jpg`
        ],
        'Praia do Encanto': [
            `${basePath}praia_do_encanto1.jpg`,
            `${basePath}praia_do_encanto2.jpg`,
            `${basePath}praia_do_encanto3.jpg`
        ],
        'Praia do Pôrto': [
            `${basePath}praia_do_porto1.jpg`,
            `${basePath}praia_do_porto2.jpg`,
            `${basePath}praia_do_porto3.jpg`
        ],
        'Praia da Gamboa': [
            `${basePath}praia_da_gamboa1.jpg`,
            `${basePath}praia_da_gamboa2.jpg`,
            `${basePath}praia_da_gamboa3.jpg`
        ],
        'Toca do Morcego Festas': [
            `${basePath}toca_do_morcego_festas1.jpg`,
            `${basePath}toca_do_morcego_festas2.jpg`,
            `${basePath}toca_do_morcego_festas3.jpg`
        ],
        'One Love': [
            `${basePath}one_love1.jpg`,
            `${basePath}one_love2.jpg`,
            `${basePath}one_love3.jpg`
        ],
        'Pulsar': [
            `${basePath}pulsar1.jpg`,
            `${basePath}pulsar2.jpg`,
            `${basePath}pulsar3.jpg`
        ],
        'Mama Iate': [
            `${basePath}mama_iate1.jpg`,
            `${basePath}mama_iate2.jpg`,
            `${basePath}mama_iate3.jpg`
        ],
        'Teatro do Morro': [
            `${basePath}teatro_do_morro1.jpg`,
            `${basePath}teatro_do_morro2.jpg`,
            `${basePath}teatro_do_morro3.jpg`
        ],
        'Morena Bela': [
            `${basePath}morena_bela1.jpg`,
            `${basePath}morena_bela2.jpg`,
            `${basePath}morena_bela3.jpg`
        ],
        'Basílico': [
            `${basePath}basilico1.jpg`,
            `${basePath}basilico2.jpg`,
            `${basePath}basilico3.jpg`
        ],
        'Ki Massa': [
            `${basePath}ki_massa1.jpg`,
            `${basePath}ki_massa2.jpg`,
            `${basePath}ki_massa3.jpg`
        ],
        'Tempeiro Caseiro': [
            `${basePath}tempeiro_caseiro1.jpg`,
            `${basePath}tempeiro_caseiro2.jpg`,
            `${basePath}tempeiro_caseiro3.jpg`
        ],
        'Bizu': [
            `${basePath}bizu1.jpg`,
            `${basePath}bizu2.jpg`,
            `${basePath}bizu3.jpg`
        ],
        'Pedra Sobre Pedra': [
            `${basePath}pedra_sobre_pedra1.jpg`,
            `${basePath}pedra_sobre_pedra2.jpg`,
            `${basePath}pedra_sobre_pedra3.jpg`
        ],
        'Forno a Lenha de Mercedes': [
            `${basePath}forno_a_lenha1.jpg`,
            `${basePath}forno_a_lenha2.jpg`,
            `${basePath}forno_a_lenha3.jpg`
        ],
        'Ponto G': [
            `${basePath}ponto_g1.jpg`,
            `${basePath}ponto_g2.jpg`,
            `${basePath}ponto_g3.jpg`
        ],
        'Ponto 9,99': [
            `${basePath}ponto_9991.jpg`,
            `${basePath}ponto_9992.jpg`,
            `${basePath}ponto_9993.jpg`
        ],
        'Patricia': [
            `${basePath}patricia1.jpg`,
            `${basePath}patricia2.jpg`,
            `${basePath}patricia3.jpg`
        ],
        'dizi 10': [
            `${basePath}dizi_101.jpg`,
            `${basePath}dizi_102.jpg`,
            `${basePath}dizi_103.jpg`
        ],
        'Papoula': [
            `${basePath}papoula1.jpg`,
            `${basePath}papoula2.jpg`,
            `${basePath}papoula3.jpg`
        ],
        'Sabor da terra': [
            `${basePath}sabor_da_terra1.jpg`,
            `${basePath}sabor_da_terra2.jpg`,
            `${basePath}sabor_da_terra3.jpg`
        ],
        'Branco&Negro': [
            `${basePath}branco_negro1.jpg`,
            `${basePath}branco_negro2.jpg`,
            `${basePath}branco_negro3.jpg`
        ],
        'Six Club': [
            `${basePath}six_club1.jpg`,
            `${basePath}six_club2.jpg`,
            `${basePath}six_club3.jpg`
        ],
        'Santa Villa': [
            `${basePath}santa_villa1.jpg`,
            `${basePath}santa_villa2.jpg`,
            `${basePath}santa_villa3.jpg`
        ],
        'Recanto do Aviador': [
            `${basePath}recanto_do_aviador1.jpg`,
            `${basePath}recanto_do_aviador2.jpg`,
            `${basePath}recanto_do_aviador3.jpg`
        ],
        'Sambass': [
            `${basePath}sambass1.jpg`,
            `${basePath}sambass2.jpg`,
            `${basePath}sambass3.jpg`
        ],
        'Bar e Restaurante da Morena': [
            `${basePath}bar_restaurante_morena1.jpg`,
            `${basePath}bar_restaurante_morena2.jpg`,
            `${basePath}bar_restaurante_morena3.jpg`
        ],
        'Restaurante Alecrim': [
            `${basePath}restaurante_alecrim1.jpg`,
            `${basePath}restaurante_alecrim2.jpg`,
            `${basePath}restaurante_alecrim3.jpg`
        ],
        'Andina Cozinha Latina': [
            `${basePath}andina_cozinha_latina1.jpg`,
            `${basePath}andina_cozinha_latina2.jpg`,
            `${basePath}andina_cozinha_latina3.jpg`
        ],
        'Papoula Culinária Artesanal': [
            `${basePath}papoula_culinaria_artesanal1.jpg`,
            `${basePath}papoula_culinaria_artesanal2.jpg`,
            `${basePath}papoula_culinaria_artesanal3.jpg`
        ],
        'Minha Louca Paixão': [
            `${basePath}minha_louca_paixao1.jpg`,
            `${basePath}minha_louca_paixao2.jpg`,
            `${basePath}minha_louca_paixao3.jpg`
        ],
        'Café das Artes': [
            `${basePath}cafe_das_artes1.jpg`,
            `${basePath}cafe_das_artes2.jpg`,
            `${basePath}cafe_das_artes3.jpg`
        ],
        'Canoa': [
            `${basePath}canoa1.jpg`,
            `${basePath}canoa2.jpg`,
            `${basePath}canoa3.jpg`
        ],
        'Restaurante do Francisco': [
            `${basePath}restaurante_francisco1.jpg`,
            `${basePath}restaurante_francisco2.jpg`,
            `${basePath}restaurante_francisco3.jpg`
        ],
        'La Tabla': [
            `${basePath}la_tabla1.jpg`,
            `${basePath}la_tabla2.jpg`,
            `${basePath}la_tabla3.jpg`
        ],
        'Santa Luzia': [
            `${basePath}santa_luzia1.jpg`,
            `${basePath}santa_luzia2.jpg`,
            `${basePath}santa_luzia3.jpg`
        ],
        'Chez Max': [
            `${basePath}chez_max1.jpg`,
            `${basePath}chez_max2.jpg`,
            `${basePath}chez_max3.jpg`
        ],
        'Barraca da Miriam': [
            `${basePath}barraca_miriam1.jpg`,
            `${basePath}barraca_miriam2.jpg`,
            `${basePath}barraca_miriam3.jpg`
        ],
        'O Casarão restaurante': [
            `${basePath}casarao_restaurante1.jpg`,
            `${basePath}casarao_restaurante2.jpg`,
            `${basePath}casarao_restaurante3.jpg`
        ],
        'Hotel Fazenda Parque Vila': [
            `${basePath}hotel_fazenda_parque_vila1.jpg`,
            `${basePath}hotel_fazenda_parque_vila2.jpg`,
            `${basePath}hotel_fazenda_parque_vila3.jpg`
        ],
        'Guaiamu': [
            `${basePath}guaiamu1.jpg`,
            `${basePath}guaiamu2.jpg`,
            `${basePath}guaiamu3.jpg`
        ],
        'Pousada Fazenda Caeiras': [
            `${basePath}pousada_fazenda_caeiras1.jpg`,
            `${basePath}pousada_fazenda_caeiras2.jpg`,
            `${basePath}pousada_fazenda_caeiras3.jpg`
        ],
        'Amendoeira Hotel': [
            `${basePath}amendoeira_hotel1.jpg`,
            `${basePath}amendoeira_hotel2.jpg`,
            `${basePath}amendoeira_hotel3.jpg`
        ],
        'Pousada Natureza': [
            `${basePath}pousada_natureza1.jpg`,
            `${basePath}pousada_natureza2.jpg`,
            `${basePath}pousada_natureza3.jpg`
        ],
        'Pousada dos Pássaros': [
            `${basePath}pousada_dos_passaros1.jpg`,
            `${basePath}pousada_dos_passaros2.jpg`,
            `${basePath}pousada_dos_passaros3.jpg`
        ],
        'Hotel Morro de São Paulo': [
            `${basePath}hotel_morro_sao_paulo1.jpg`,
            `${basePath}hotel_morro_sao_paulo2.jpg`,
            `${basePath}hotel_morro_sao_paulo3.jpg`
        ],
        'Uma Janela para o Sol': [
            `${basePath}uma_janela_para_sol1.jpg`,
            `${basePath}uma_janela_para_sol2.jpg`,
            `${basePath}uma_janela_para_sol3.jpg`
        ],
        'Portaló': [
            `${basePath}portalo1.jpg`,
            `${basePath}portalo2.jpg`,
            `${basePath}portalo3.jpg`
        ],
        'Pérola do Morro': [
            `${basePath}perola_do_morro1.jpg`,
            `${basePath}perola_do_morro2.jpg`,
            `${basePath}perola_do_morro3.jpg`
        ],
        'Safira do Morro': [
            `${basePath}safira_do_morro1.jpg`,
            `${basePath}safira_do_morro2.jpg`,
            `${basePath}safira_do_morro3.jpg`
        ],
        'Xerife Hotel': [
            `${basePath}xerife_hotel1.jpg`,
            `${basePath}xerife_hotel2.jpg`,
            `${basePath}xerife_hotel3.jpg`
        ],
        'Ilha da Saudade': [
            `${basePath}ilha_da_saudade1.jpg`,
            `${basePath}ilha_da_saudade2.jpg`,
            `${basePath}ilha_da_saudade3.jpg`
        ],
        'Porto dos Milagres': [
            `${basePath}porto_dos_milagres1.jpg`,
            `${basePath}porto_dos_milagres2.jpg`,
            `${basePath}porto_dos_milagres3.jpg`
        ],
        'Passarte': [
            `${basePath}passarte1.jpg`,
            `${basePath}passarte2.jpg`,
            `${basePath}passarte3.jpg`
        ],
        'Pousada da Praça': [
            `${basePath}pousada_da_praca1.jpg`,
            `${basePath}pousada_da_praca2.jpg`,
            `${basePath}pousada_da_praca3.jpg`
        ],
        'Pousada Colibri': [
            `${basePath}pousada_colibri1.jpg`,
            `${basePath}pousada_colibri2.jpg`,
            `${basePath}pousada_colibri3.jpg`
        ],
        'Pousada Porto de Cima': [
            `${basePath}pousada_porto_de_cima1.jpg`,
            `${basePath}pousada_porto_de_cima2.jpg`,
            `${basePath}pousada_porto_de_cima3.jpg`
        ],
        'Vila Guaiamu': [
            `${basePath}vila_guaiamu1.jpg`,
            `${basePath}vila_guaiamu2.jpg`,
            `${basePath}vila_guaiamu3.jpg`
        ],
        'Villa dos Corais pousada': [
            `${basePath}villa_dos_corais1.jpg`,
            `${basePath}villa_dos_corais2.jpg`,
            `${basePath}villa_dos_corais3.jpg`
        ],
        'Hotel Anima': [
            `${basePath}hotel_anima1.jpg`,
            `${basePath}hotel_anima2.jpg`,
            `${basePath}hotel_anima3.jpg`
        ],
        'Vila dos Orixás Boutique Hotel & Spa': [
            `${basePath}vila_dos_orixas1.jpg`,
            `${basePath}vila_dos_orixas2.jpg`,
            `${basePath}vila_dos_orixas3.jpg`
        ],
        'Hotel Karapitangui': [
            `${basePath}hotel_karapitangui1.jpg`,
            `${basePath}hotel_karapitangui2.jpg`,
            `${basePath}hotel_karapitangui3.jpg`
        ],
        'Pousada Timbalada': [
            `${basePath}pousada_timbalada1.jpg`,
            `${basePath}pousada_timbalada2.jpg`,
            `${basePath}pousada_timbalada3.jpg`
        ],
        'Casa Celestino Residence': [
            `${basePath}casa_celestino_residence1.jpg`,
            `${basePath}casa_celestino_residence2.jpg`,
            `${basePath}casa_celestino_residence3.jpg`
        ],
        'Bahia Bacana Pousada': [
            `${basePath}bahia_bacana_pousada1.jpg`,
            `${basePath}bahia_bacana_pousada2.jpg`,
            `${basePath}bahia_bacana_pousada3.jpg`
        ],
        'Hotel Morro da Saudade': [
            `${basePath}hotel_morro_da_saudade1.jpg`,
            `${basePath}hotel_morro_da_saudade2.jpg`,
            `${basePath}hotel_morro_da_saudade3.jpg`
        ],
        'Bangalô dos sonhos': [
            `${basePath}bangalo_dos_sonhos1.jpg`,
            `${basePath}bangalo_dos_sonhos2.jpg`,
            `${basePath}bangalo_dos_sonhos3.jpg`
        ],
        'Cantinho da Josete': [
            `${basePath}cantinho_da_josete1.jpg`,
            `${basePath}cantinho_da_josete2.jpg`,
            `${basePath}cantinho_da_josete3.jpg`
        ],
        'Vila Morro do Sao Paulo': [
            `${basePath}vila_morro_sao_paulo1.jpg`,
            `${basePath}vila_morro_sao_paulo2.jpg`,
            `${basePath}vila_morro_sao_paulo3.jpg`
        ],
        'Casa Rossa': [
            `${basePath}casa_rossa1.jpg`,
            `${basePath}casa_rossa2.jpg`,
            `${basePath}casa_rossa3.jpg`
        ],
        'Village Paraíso Tropical': [
            `${basePath}village_paraiso_tropical1.jpg`,
            `${basePath}village_paraiso_tropical2.jpg`,
            `${basePath}village_paraiso_tropical3.jpg`
        ],
        'Absolute': [
            `${basePath}absolute1.jpg`,
            `${basePath}absolute2.jpg`,
            `${basePath}absolute3.jpg`
        ],
        'Local Brasil': [
            `${basePath}local_brasil1.jpg`,
            `${basePath}local_brasil2.jpg`,
            `${basePath}local_brasil3.jpg`
        ],
        'Super Zimbo': [
            `${basePath}super_zimbo1.jpg`,
            `${basePath}super_zimbo2.jpg`,
            `${basePath}super_zimbo3.jpg`
        ],
        'Mateus Esquadrais': [
            `${basePath}mateus_esquadrais1.jpg`,
            `${basePath}mateus_esquadrais2.jpg`,
            `${basePath}mateus_esquadrais3.jpg`
        ],
        'São Pedro Imobiliária': [
            `${basePath}sao_pedro_imobiliaria1.jpg`,
            `${basePath}sao_pedro_imobiliaria2.jpg`,
            `${basePath}sao_pedro_imobiliaria3.jpg`
        ],
        'Imóveis Brasil Bahia': [
            `${basePath}imoveis_brasil_bahia1.jpg`,
            `${basePath}imoveis_brasil_bahia2.jpg`,
            `${basePath}imoveis_brasil_bahia3.jpg`
        ],
        'Coruja': [
            `${basePath}coruja1.jpg`,
            `${basePath}coruja2.jpg`,
            `${basePath}coruja3.jpg`
        ],
        'Zimbo Dive': [
            `${basePath}zimbo_dive1.jpg`,
            `${basePath}zimbo_dive2.jpg`,
            `${basePath}zimbo_dive3.jpg`
        ],
        'Havaianas': [
            `${basePath}havaianas1.jpg`,
            `${basePath}havaianas2.jpg`,
            `${basePath}havaianas3.jpg`
        ],
        'Ambulância': [
            `${basePath}ambulancia1.jpg`,
            `${basePath}ambulancia2.jpg`,
            `${basePath}ambulancia3.jpg`
        ],
        'Unidade de Saúde': [
            `${basePath}unidade_de_saude1.jpg`,
            `${basePath}unidade_de_saude2.jpg`,
            `${basePath}unidade_de_saude3.jpg`
        ],
        'Polícia Civil': [
            `${basePath}policia_civil1.jpg`,
            `${basePath}policia_civil2.jpg`,
            `${basePath}policia_civil3.jpg`
        ],
        'Polícia Militar': [
            `${basePath}policia_militar1.jpg`,
            `${basePath}policia_militar2.jpg`,
            `${basePath}policia_militar3.jpg`
        ],
        'Melhores Pontos Turísticos': [
            `${basePath}melhores_pontos_turisticos1.jpg`,
            `${basePath}melhores_pontos_turisticos2.jpg`,
            `${basePath}melhores_pontos_turisticos3.jpg`
        ],
        'Melhores Passeios': [
            `${basePath}melhores_passeios1.jpg`,
            `${basePath}melhores_passeios2.jpg`,
            `${basePath}melhores_passeios3.jpg`
        ],
        'Melhores Praias': [
            `${basePath}melhores_praias1.jpg`,
            `${basePath}melhores_praias2.jpg`,
            `${basePath}melhores_praias3.jpg`
        ],
        'Melhores Restaurantes': [
            `${basePath}melhores_restaurantes1.jpg`,
            `${basePath}melhores_restaurantes2.jpg`,
            `${basePath}melhores_restaurantes3.jpg`
        ],
        'Melhores Pousadas': [
            `${basePath}melhores_pousadas1.jpg`,
            `${basePath}melhores_pousadas2.jpg`,
            `${basePath}melhores_pousadas3.jpg`
        ],
        'Melhores Lojas': [
            `${basePath}melhores_lojas1.jpg`,
            `${basePath}melhores_lojas2.jpg`,
            `${basePath}melhores_lojas3.jpg`
        ],
        'Missão': [
            `${basePath}missao1.jpg`,
            `${basePath}missao2.jpg`,
            `${basePath}missao3.jpg`
        ],
        'Serviços': [
            `${basePath}servicos1.jpg`,
            `${basePath}servicos2.jpg`,
            `${basePath}servicos3.jpg`
        ],
        'Benefícios para Turistas': [
            `${basePath}beneficios_turistas1.jpg`,
            `${basePath}beneficios_turistas2.jpg`,
            `${basePath}beneficios_turistas3.jpg`
        ],
        'Benefícios para Moradores': [
            `${basePath}beneficios_moradores1.jpg`,
            `${basePath}beneficios_moradores2.jpg`,
            `${basePath}beneficios_moradores3.jpg`
        ],
        'Benefícios para Pousadas': [
            `${basePath}beneficios_pousadas1.jpg`,
            `${basePath}beneficios_pousadas2.jpg`,
            `${basePath}beneficios_pousadas3.jpg`
        ],
        'Benefícios para Restaurantes': [
            `${basePath}beneficios_restaurantes1.jpg`,
            `${basePath}beneficios_restaurantes2.jpg`,
            `${basePath}beneficios_restaurantes3.jpg`
        ],
        'Benefícios para Agências de Turismo': [
            `${basePath}beneficios_agencias_turismo1.jpg`,
            `${basePath}beneficios_agencias_turismo2.jpg`,
            `${basePath}beneficios_agencias_turismo3.jpg`
        ],
        'Benefícios para Lojas e Comércios': [
            `${basePath}beneficios_lojas_comercios1.jpg`,
            `${basePath}beneficios_lojas_comercios2.jpg`,
            `${basePath}beneficios_lojas_comercios3.jpg`
        ],
        'Benefícios para Transportes': [
            `${basePath}beneficios_transportes1.jpg`,
            `${basePath}beneficios_transportes2.jpg`,
            `${basePath}beneficios_transportes3.jpg`
        ],
        'Impacto em MSP': [
            `${basePath}impacto_msp1.jpg`,
            `${basePath}impacto_msp2.jpg`,
            `${basePath}impacto_msp3.jpg`
        ],
        'Iniciar Tutorial': [
            `${basePath}iniciar_tutorial1.jpg`,
            `${basePath}iniciar_tutorial2.jpg`,
            `${basePath}iniciar_tutorial3.jpg`
        ],
        'Planejar Viagem com IA': [
            `${basePath}planejar_viagem_ia1.jpg`,
            `${basePath}planejar_viagem_ia2.jpg`,
            `${basePath}planejar_viagem_ia3.jpg`
        ],
        'Falar com IA': [
            `${basePath}falar_com_ia1.jpg`,
            `${basePath}falar_com_ia2.jpg`,
            `${basePath}falar_com_ia3.jpg`
        ],
        'Falar com Suporte': [
            `${basePath}falar_com_suporte1.jpg`,
            `${basePath}falar_com_suporte2.jpg`,
            `${basePath}falar_com_suporte3.jpg`
        ],
        'Configurações': [
            `${basePath}configuracoes1.jpg`,
            `${basePath}configuracoes2.jpg`,
            `${basePath}configuracoes3.jpg`
        ]
    };

    return imageDatabase[locationName] || [];
}


/**
 * 213. getDirectionIcon
 *    Retorna o ícone (emoji) apropriado para uma manobra de navegação,
 *    ex.: turn_left => "⬅️".
 */
function getDirectionIcon(maneuverKey) {
  const iconMap = {
    head_north: "⬆️",
    head_south: "⬇️",
    head_east:  "➡️",
    head_west:  "⬅️",
    turn_left:  "⬅️",
    turn_right: "➡️",
    turn_sharp_left: "↰",
    turn_sharp_right: "↱",
    turn_slight_left: "↲",
    turn_slight_right: "↳",
    continue_straight: "⬆️",
    keep_left: "↰",
    keep_right:"↱",
    u_turn: "↩️",
    enter_roundabout: "🔄",
    exit_roundabout: "🔄",
    ferry: "⛴️",
    arrive_destination: "✅"
  };

  if (maneuverKey.startsWith("exit_roundabout_")) {
    const exitNum = maneuverKey.replace("exit_roundabout_", "");
    return `🔄${exitNum}`;
  }

  if (iconMap[maneuverKey]) {
    return iconMap[maneuverKey];
  }

  console.warn(`[getDirectionIcon] Manobra não reconhecida: "${maneuverKey}".`);
  return "⬆️";
}


/**
 * 214. handleFeatureSelection
 *    Gerencia seleção de funcionalidades (ex.: praias, pontos turísticos).
 */
function handleFeatureSelection(feature) {
    lastSelectedFeature = feature;
    const featureMappings = {
        'pontos-turisticos': 'touristSpots-submenu',
        'passeios': 'tours-submenu',
        'praias': 'beaches-submenu',
        'festas': 'nightlife-submenu',
        'restaurantes': 'restaurants-submenu',
        'pousadas': 'inns-submenu',
        'lojas': 'shops-submenu',
        'emergencias': 'emergencies-submenu',
        'dicas': 'tips-submenu',
        'sobre': 'about-submenu',
        'ensino': 'education-submenu'
    };

    const subMenuId = featureMappings[feature];
    if (!subMenuId) {
        console.error(`Feature não reconhecida: ${feature}`);
        return;
    }

    // Oculta todos os submenus
    document.querySelectorAll('#menu .submenu').forEach(subMenu => {
        subMenu.style.display = 'none';
    });

    clearMarkers();

    // Se já estiver ativo, fecha
    if (currentSubMenu === subMenuId) {
        document.getElementById('menu').style.display = 'none';
        document.querySelectorAll('.menu-btn').forEach(btn => btn.classList.remove('active'));
        currentSubMenu = null;
    } else {
        // Carrega o submenu
        loadSubMenu(subMenuId, feature);

        if (tutorialIsActive && tutorialSteps[currentStep].step === 'ask-interest') {
            nextTutorialStep();
        }

        document.getElementById('menu').style.display = 'block';
        document.querySelectorAll('.menu-btn').forEach(btn => btn.classList.add('inactive'));
        const activeButton = document.querySelector(`.menu-btn[data-feature="${feature}"]`);
        if (activeButton) {
            activeButton.classList.remove('inactive');
            activeButton.classList.add('active');
        }

        currentSubMenu = subMenuId;
    }
}

/**
 * 215. startCarousel - Inicia o carrossel de imagens para um local.
 */
function startCarousel(locationName) {
  const images = getImagesForLocation(locationName);
  if (!images || images.length === 0) {
    alert("Nenhuma imagem disponível para o carrossel.");
    return;
  }
  const swiperWrapper = document.querySelector(".swiper-wrapper");
  swiperWrapper.innerHTML = "";
  images.forEach(src => {
    const slide = document.createElement("div");
    slide.className = "swiper-slide";
    slide.innerHTML = `<img src="${src}" alt="${locationName}" style="width: 100%; height: 100%;">`;
    swiperWrapper.appendChild(slide);
  });
  showModal("carousel-modal");
  if (swiperInstance) {
    swiperInstance.destroy(true, true);
  }
  swiperInstance = new Swiper(".swiper-container", {
    slidesPerView: 1,
    spaceBetween: 10,
    loop: true,
    pagination: {
      el: ".swiper-pagination",
      clickable: true
    },
    navigation: {
      nextEl: ".swiper-button-next",
      prevEl: ".swiper-button-prev"
    },
    autoplay: {
      delay: 2500,
      disableOnInteraction: false
    }
  });
  console.log("startCarousel: Carrossel iniciado para", locationName);
}

/**
 * 216. startRouteCreation - Inicia a criação de uma nova rota.
 */
async function startRouteCreation() {
    try {
        validateDestination();  // Verifica destino válido

        const userLocation = await getCurrentLocation();  // Localização do usuário
        const routeData = await createRoute(userLocation);  // Criação de rota com base na localização

        if (!routeData) {
            showNotification(translations[selectedLanguage].routeError, "error");
            triggerHapticFeedback("recalculating");
            return;
        }

        currentRouteData = routeData;  // Armazena rota atual
        startRoutePreview();
        hideAllControlButtons();
        updateRouteFooter(routeData, selectedLanguage);
        closeSideMenu();
    } catch (error) {
        console.error("❌ Erro ao iniciar criação de rota:", error.message);
        showNotification(translations[selectedLanguage].routeError, "error");
    }
}


/**
 * 217. toggleDarkMode - Alterna o modo escuro.
 */
function toggleDarkMode() {
  document.body.classList.toggle("dark-mode");
  map.getContainer().classList.toggle("dark-map");
  showNotification("Modo escuro alternado.", "info");
  console.log("toggleDarkMode: Alternância de modo escuro executada.");
}


/**
 * 218. fetchOSMData - Busca dados do OSM utilizando a Overpass API.
 */
async function fetchOSMData(query) {
  try {
    // Monta URL para Overpass
    const overpassUrl = `https://overpass-api.de/api/interpreter?data=${encodeURIComponent(query)}`;
    console.log("[fetchOSMData] Iniciando busca no Overpass-API:", overpassUrl);

    // Faz a requisição
    const response = await fetch(overpassUrl);
    if (!response.ok) {
      console.error("[fetchOSMData] HTTP Erro Overpass:", response.status, response.statusText);
      showNotification("Erro ao buscar dados OSM. Verifique sua conexão.", "error");
      return null;
    }

    // Tenta parsear JSON
    const data = await response.json();
    if (!data.elements || data.elements.length === 0) {
      console.warn("[fetchOSMData] Nenhum dado encontrado (elements vazio).");
      showNotification("Nenhum dado OSM encontrado para esta busca.", "info");
      return null;
    }

    console.log(`[fetchOSMData] Retornados ${data.elements.length} elementos do OSM.`);
    return data;
  } catch (error) {
    console.error("[fetchOSMData] Erro geral ao buscar dados do OSM:", error);
    showNotification("Ocorreu um erro ao buscar dados no OSM (Overpass).", "error");
    return null;
  }
}


/****************************************************************************
 * SEÇÃO 17 – INSTRUÇÕES AVANÇADAS & INTERAÇÃO NO MAPA (Funções 195 – 200)
 ****************************************************************************/

/**
 * 219. showInstructionsWithTooltip - Exibe instruções no mapa via tooltips permanentes.
 */
function showInstructionsWithTooltip(instructions, mapInstance) {
  if (!instructions || instructions.length === 0) {
    console.warn("showInstructionsWithTooltip: Nenhuma instrução para exibir.");
    return;
  }
  instructions.forEach(step => {
    const marker = L.marker([step.lat, step.lon]).addTo(mapInstance);
    marker.bindTooltip(`${step.text}`, {
      permanent: true,
      direction: "top",
      className: "my-custom-tooltip"
    }).openTooltip();
  });
  console.log("showInstructionsWithTooltip: Instruções exibidas no mapa.");
}

/**
 * 220. showInstructionsOnMap - Exibe instruções no mapa (popups/tooltips).
 */
function showInstructionsOnMap(instructions, mapInstance) {
  if (!instructions || instructions.length === 0) {
    console.warn("showInstructionsOnMap: Nenhuma instrução para exibir.");
    return;
  }
  instructions.forEach((step, index) => {
    const icon = L.divIcon({
      className: "instruction-marker-icon",
      html: "⚠️",
      iconSize: [24, 24],
      iconAnchor: [12, 12]
    });
    const marker = L.marker([step.lat, step.lon], { icon: icon }).addTo(mapInstance);
    marker.bindPopup(`
      <strong>Passo ${index + 1}</strong><br>
      ${step.text}<br>
      (${step.distance}m)
    `);
  });
  console.log("showInstructionsOnMap: Instruções exibidas com popups.");
}

/**
 * 221. goToInstructionStep - Define um passo específico como atual.
 */
function goToInstructionStep(stepIndex) {
  if (!navigationState.instructions || navigationState.instructions.length === 0) {
    console.warn("goToInstructionStep: Nenhuma instrução definida.");
    return;
  }
  stepIndex = Math.max(0, Math.min(stepIndex, navigationState.instructions.length - 1));
  navigationState.currentStepIndex = stepIndex;
  const step = navigationState.instructions[stepIndex];
  if (step) {
    updateInstructionModal(navigationState.instructions, stepIndex, navigationState.lang);
    speakInstruction(step.text, navigationState.lang === "pt" ? "pt-BR" : "en-US");
    highlightNextStepInMap(step);
    console.log(`goToInstructionStep: Passo atualizado para ${stepIndex}.`);
  }
}

/**
 * 222. nextInstructionStep - Avança para a próxima instrução.
 */
function nextInstructionStep() {
  if (navigationState.currentStepIndex < navigationState.instructions.length - 1) {
    goToInstructionStep(navigationState.currentStepIndex + 1);
  } else {
    console.log("nextInstructionStep: Última instrução alcançada.");
    showNotification("Você chegou ao destino final!", "success");
  }
}

/**
 * 223. prevInstructionStep - Retrocede para a instrução anterior.
 */
function prevInstructionStep() {
  if (navigationState.currentStepIndex > 0) {
    goToInstructionStep(navigationState.currentStepIndex - 1);
  } else {
    console.log("prevInstructionStep: Você já está na primeira instrução.");
  }
}

/**
 * 224. showRouteAlternatives - Exibe rotas alternativas no mapa.
 */
function showRouteAlternatives(routeDataArray) {
  clearCurrentRoute();
  const colors = ["blue", "green", "purple", "orange"];
  routeDataArray.forEach((routeData, index) => {
    const color = colors[index % colors.length];
    const polyline = L.polyline(routeData.routeCoords, {
      color: color,
      weight: 5,
      opacity: 0.8
    }).addTo(map);
    polyline.on("click", () => {
      console.log(`showRouteAlternatives: Rota ${index + 1} selecionada.`);
      // Ação opcional: iniciar navegação nessa rota.
    });
    polyline.bindPopup(`${routeData.label || ("Rota " + (index + 1))} - Dist: ${routeData.distance} km, ~${routeData.duration} min`);
  });
  const allPoints = routeDataArray.flatMap(r => r.routeCoords);
  const bounds = L.latLngBounds(allPoints);
  map.fitBounds(bounds, { padding: [50, 50] });
  console.log("showRouteAlternatives: Rotas alternativas exibidas.");
}

// 225. handleNextInstructionIfClose - Avança step se usuário estiver próximo
function handleNextInstructionIfClose(lat, lon) {
  if (!navigationState.instructions || navigationState.instructions.length === 0) {
    console.warn("[handleNextInstructionIfClose] Nenhuma instrução para processar.");
    return;
  }

  const currentIndex = navigationState.currentStepIndex;
  const step = navigationState.instructions[currentIndex];
  if (!step || !step.lat || !step.lon) {
    console.warn("[handleNextInstructionIfClose] Passo atual inválido.");
    return;
  }

  const distToStep = calculateDistance(lat, lon, step.lat, step.lon);
  if (distToStep < 15) {
    navigationState.currentStepIndex++;
    console.log(`[handleNextInstructionIfClose] Avançando para passo ${navigationState.currentStepIndex} (~${distToStep.toFixed(1)}m).`);

    const nextStep = navigationState.instructions[navigationState.currentStepIndex];
    if (nextStep) {
      showNotification(nextStep.text, "info");
      updateInstructionModal(navigationState.instructions, navigationState.currentStepIndex, navigationState.lang);
      speakInstruction(nextStep.text, navigationState.lang === "pt" ? "pt-BR" : "en-US");
    } else {
      showNotification(getGeneralText("destinationReached", navigationState.lang), "success");
    }
  }
}

/**
 * 226. customizeOSMPopup
 *    Personaliza o popup do Leaflet para reduzir tamanho e ajustar estilos.
 */
function customizeOSMPopup(popup) {
    const popupContent = popup.getElement().querySelector('.leaflet-popup-content');
    popupContent.style.fontSize = '12px';
    popupContent.style.maxWidth = '200px';

    const popupWrapper = popup.getElement().querySelector('.leaflet-popup-content-wrapper');
    popupWrapper.style.padding = '10px';

    const popupTipContainer = popup.getElement().querySelector('.leaflet-popup-tip-container');
    popupTipContainer.style.width = '20px';
    popupTipContainer.style.height = '10px';

    const saibaMaisBtn = document.getElementById('saiba-mais');
    const comoChegarBtn = document.getElementById('como-chegar');
    if (saibaMaisBtn) {
        saibaMaisBtn.style.fontSize = '12px';
        saibaMaisBtn.style.padding = '5px 10px';
    }
    if (comoChegarBtn) {
        comoChegarBtn.style.fontSize = '12px';
        comoChegarBtn.style.padding = '5px 10px';
    }
}


/****************************************************************************
 * SEÇÃO 18 – ASSISTÊNCIA CONTÍNUA & DESTAQUES (Funções 201 – 205)
 ****************************************************************************/

/**
 * 227. provideContinuousAssistance - Oferece assistência contínua ao usuário.
 */
function provideContinuousAssistance() {
  setInterval(() => {
    updateNavigationInstructions();
    monitorUserState();
  }, 10000);
  console.log("provideContinuousAssistance: Assistência contínua ativada.");
}

/**
 * 228. removeFloatingMenuHighlights - Remove destaques do menu flutuante.
 */
function removeFloatingMenuHighlights() {
  document.querySelectorAll(".floating-menu .highlight").forEach(el => el.classList.remove("highlight"));
  console.log("removeFloatingMenuHighlights: Destaques removidos.");
}

/**
 * 229. recalcRouteOnDeviation - Recalcula a rota ao detectar desvio.
 */
async function recalcRouteOnDeviation(userLat, userLon, destLat, destLon) {
  console.log("recalcRouteOnDeviation: Recalculando rota devido ao desvio...");
  if (window.currentRouteLayer) {
    map.removeLayer(window.currentRouteLayer);
    window.currentRouteLayer = null;
  }
  const data = await plotRouteOnMap(userLat, userLon, destLat, destLon);
  if (!data) {
    console.warn("recalcRouteOnDeviation: Falha ao recalcular rota.");
    return;
  }
  const newInstructions = await fetchRouteInstructions(userLat, userLon, destLat, destLon, "pt");
  if (!newInstructions || newInstructions.length === 0) {
    console.warn("recalcRouteOnDeviation: Instruções vazias após recalcular rota.");
    return;
  }
  navigationState.instructions = newInstructions;
  navigationState.currentStepIndex = 0;
  navigationState.isPaused = false;
  updateInstructionBanner(newInstructions[0], navigationState.lang);
  updateRouteFooter({
    distance: navigationState.distance,
    duration: navigationState.duration,
  });
  console.log("recalcRouteOnDeviation: Rota recalculada com sucesso.");
}

/****************************************************************************
 * SEÇÃO 19 – FINALIZAÇÃO, LIMPEZA & AJUSTES DE MAPA (Funções 206 – 222)
 ****************************************************************************/

/**
 * 230. toggleNavigationInstructions - Alterna a exibição das instruções de navegação.
 */
function toggleNavigationInstructions() {
  const modal = document.getElementById("navigation-instructions");
  if (!modal) {
    console.warn("toggleNavigationInstructions: Modal de instruções não encontrado.");
    return;
  }
  modal.classList.toggle("hidden");
  const isHidden = modal.classList.contains("hidden");
  showNotification(isHidden ? "Instruções ocultadas." : "Instruções exibidas.", "info");
  console.log("toggleNavigationInstructions: Instruções alternadas.");
}

/**
 * 231. toggleRouteSummary - Alterna a visibilidade do resumo da rota.
 */
function toggleRouteSummary() {
  const summary = document.getElementById("route-summary");
  if (!summary) return;
  if (summary.classList.contains("hidden")) {
    summary.classList.remove("hidden");
    summary.style.display = "block";
    showNotification("Resumo da rota exibido.", "info");
  } else {
    summary.classList.add("hidden");
    summary.style.display = "none";
    showNotification("Resumo da rota ocultado.", "info");
  }
  console.log("toggleRouteSummary: Resumo da rota alternado.");
}

/**
 * 232. updateNavigationProgress - Atualiza a barra de progresso da navegação.
 */
function updateNavigationProgress(progress) {
  const bar = document.getElementById("navigationProgressBar");
  if (bar) {
    bar.style.width = `${progress}%`;
    console.log("updateNavigationProgress: Progresso atualizado para", progress, "%");
  }
}

/**
 * 233. updateProgressBar - Atualiza uma barra de progresso genérica.
 */
function updateProgressBar(selector, progress) {
  const bar = document.querySelector(selector);
  if (bar) {
    bar.style.width = `${progress}%`;
    console.log("updateProgressBar: Barra atualizada.");
  }
}

/****************************************************************************
 * SEÇÃO 20 – AJUSTES AVANÇADOS DE MAPA & VISUALIZAÇÃO (Funções 223 – 226)
 ****************************************************************************/

/**
 * 235. visualizeRouteOnPreview - Exibe a rota na pré-visualização.
 */
function visualizeRouteOnPreview(route) {
    if (!route || route.waypoints.length === 0) {
        showNotification('Nenhuma rota disponível para visualização.', 'warning');
        return;
    }

    clearCurrentRoute();  // Limpa a rota atual
    route.waypoints.forEach(point => {
        const marker = L.marker([point.lat, point.lon]).addTo(map)
            .bindPopup(`Parada: ${point.name}`);
        markers.push(marker);
    });

    const routeLine = L.polyline(route.waypoints.map(p => [p.lat, p.lon]), {
        color: 'blue',
        weight: 4
    }).addTo(map);

    map.fitBounds(routeLine.getBounds());
    console.log('Pré-visualização da rota ativada.');
}

/**
 * 236. zoomToSelectedArea - Aplica zoom aos bounds fornecidos.
 */
function zoomToSelectedArea(bounds) {
  if (!bounds || !bounds.isValid()) {
    console.error("zoomToSelectedArea: Bounds inválidos para aplicar zoom.");
    return;
  }
  map.fitBounds(bounds);
  console.log("zoomToSelectedArea: Zoom aplicado aos bounds.");
}

/**
 * 237. recenterMapOnUser - Recentraliza o mapa na localização do usuário.
 */
/**
 * centerMapOnUser
 * Centraliza o mapa na posição fornecida.
 *
 * @param {number} lat - Latitude do usuário.
 * @param {number} lon - Longitude do usuário.
 * @param {number} [zoom=15] - Nível de zoom padrão.
 */
function centerMapOnUser(lat, lon, zoom = 18) {
  if (!map) {
    console.warn("[centerMapOnUser] Mapa não inicializado.");
    return;
  }
  map.setView([lat, lon], zoom);
  console.log("[centerMapOnUser] Mapa centralizado em:", lat, lon, "com zoom:", zoom);
}


/**
 * 238. clearMapLayers - Remove todas as camadas visuais (marcadores, linhas, polígonos) do mapa.
 */
function clearMapLayers() {
  map.eachLayer(layer => {
    if (layer instanceof L.Marker || layer instanceof L.Polyline || layer instanceof L.Polygon) {
      map.removeLayer(layer);
    }
  });
  console.log("clearMapLayers: Todas as camadas visuais removidas do mapa.");
}

/**
 * 239. showMarketingPopup - Exibe um popup de marketing avançado.
 */
function showMarketingPopup(message) {
  showNotification(message, "info", 8000);
  console.log("showMarketingPopup: Popup de marketing exibido.");
}

/**
 * 240. addArrowToMap - Adiciona um ícone de seta no mapa.
 */
function addArrowToMap(coordinate) {
  const arrowIcon = L.divIcon({
    className: "direction-arrow-icon",
    html: "➡️",
    iconSize: [20, 20],
    iconAnchor: [10, 10]
  });
  L.marker(coordinate, { icon: arrowIcon }).addTo(map);
  console.log("addArrowToMap: Seta adicionada no mapa.");
}

/**
 * showNotification
 * Exibe uma notificação para o usuário.
 *
 * @param {string} message - Mensagem a ser exibida.
 * @param {string} type - Tipo da notificação ("error", "warning", "success", "info").
 * @param {number} [duration=3000] - Duração em milissegundos para ocultar a notificação.
 */
function showNotification(message, type, duration = 3000) {
  // Cria ou seleciona um container de notificações
  let container = document.getElementById("notification-container");
  if (!container) {
    container = document.createElement("div");
    container.id = "notification-container";
    container.style.position = "fixed";
    container.style.top = "20px";
    container.style.right = "20px";
    container.style.zIndex = "1000";
    document.body.appendChild(container);
  }

  // Cria a notificação
  const notification = document.createElement("div");
  notification.className = `notification ${type}`;
  notification.textContent = message;
  // Estilos simples – customize conforme necessário
  notification.style.marginBottom = "10px";
  notification.style.padding = "10px 20px";
  notification.style.borderRadius = "4px";
  notification.style.color = "#fff";
  switch (type) {
    case "error":
      notification.style.backgroundColor = "#e74c3c";
      break;
    case "warning":
      notification.style.backgroundColor = "#f39c12";
      break;
    case "success":
      notification.style.backgroundColor = "#27ae60";
      break;
    default:
      notification.style.backgroundColor = "#3498db";
  }
  container.appendChild(notification);

  // Remove a notificação após o tempo definido
  setTimeout(() => {
    notification.remove();
  }, duration);
}

// Variável global para armazenar o ID do watchPosition
let userLocationWatcherId = null;

/**
 * initContinuousLocationTracking
 * Inicia um watchPosition que atualiza continuamente a variável global userLocation,
 * utilizando as capacidades dos dispositivos móveis (GPS, etc.) com alta precisão.
 * Caso ocorra algum erro, uma notificação é exibida.
 */
function initContinuousLocationTracking() {
  if (!("geolocation" in navigator)) {
    showNotification("Geolocalização não é suportada neste dispositivo.", "error");
    return;
  }

  // Se já existe um watcher, limpe-o
  if (userLocationWatcherId !== null) {
    navigator.geolocation.clearWatch(userLocationWatcherId);
  }

  // Inicia o watchPosition para atualizar a posição do usuário
  userLocationWatcherId = navigator.geolocation.watchPosition(
    (position) => {
      const { latitude, longitude, accuracy } = position.coords;
      userLocation = { latitude, longitude, accuracy };
      updateUserMarkerModified(latitude, longitude); // Atualiza o marcador (a rotação será atualizada pela função deviceOrientationHandler)
      console.log("initContinuousLocationTrackingModified: Localização atualizada:", userLocation);
    },
    (error) => {
      console.error("initContinuousLocationTrackingModified: Erro ao obter localização contínua:", error);
      showNotification(getGeneralText("trackingError", selectedLanguage), "error");
    },
    { enableHighAccuracy: true, maximumAge: 5000, timeout: 15000 }
  );

  // Adiciona o listener para orientação do dispositivo
  if (window.DeviceOrientationEvent) {
    window.addEventListener("deviceorientation", deviceOrientationHandler, true);
    console.log("initContinuousLocationTrackingModified: Listener de orientação adicionado.");
  } else {
    console.warn("initContinuousLocationTrackingModified: DeviceOrientationEvent não suportado.");
  }
  
  console.log("initContinuousLocationTrackingModified: WatchPosition iniciado com ID", userLocationWatcherId);
}

function deviceOrientationHandler(event) {
  let heading;
  // Se o dispositivo oferecer webkitCompassHeading (ex.: iOS)
  if (event.webkitCompassHeading !== undefined) {
    heading = event.webkitCompassHeading;
  } else if (event.alpha !== null) {
    // event.alpha representa a rotação em relação ao norte magnético; pode precisar de ajuste dependendo do dispositivo
    heading = 360 - event.alpha; // Ajusta para obter um ângulo "para frente"
  } else {
    console.warn("deviceOrientationHandler: Dados de orientação não disponíveis.");
    return;
  }
  
  // Atualiza o mapa com o novo heading
  updateMapBearing(heading);
  
  // Se desejar, atualize também o marcador do usuário para refletir a direção
  if (userLocation) {
    updateUserMarkerModified(userLocation.latitude, userLocation.longitude, heading);
  }
  
  console.log("deviceOrientationHandler: Heading atualizado para", heading, "°.");
}

/**
 * Atualiza a visualização do mapa para modo first-person.
 * @param {Object} position - Objeto de posição retornado pelo watchPosition.
 */
function setFirstPersonView(position) {
  const { latitude, longitude, heading } = position.coords;
  
  // Centraliza o mapa na posição atual com zoom adequado
  map.setView([latitude, longitude], 18);

  // Se o plugin (ou função customizada) para rotação estiver disponível
  if (typeof map.setBearing === "function" && typeof heading === "number") {
    // Plugin real que implementa rotação do mapa
    map.setBearing(heading);
  } else {
    // Caso não exista um método nativo ou plugin, podemos aplicar uma rotação CSS como fallback
    const mapContainer = map.getContainer();
    // Nota: Esta abordagem rotaciona todo o conteúdo do mapa, o que pode afetar interações
    mapContainer.style.transform = `rotate(${heading}deg)`;
    mapContainer.style.transformOrigin = "center center";
    console.warn("Função nativa de rotação não disponível. Aplicando rotação via CSS como fallback.");
  }
}

/**
 * setMapRotation
 * Rotaciona o mapa para o ângulo especificado.
 *
 * @param {number} angle - Ângulo em graus para rotacionar o mapa.
 */
function setMapRotation(angle) {
  const mapContainer = document.getElementById("map");
  if (mapContainer) {
    // Aplica uma transformação CSS para rotacionar o mapa.
    mapContainer.style.transform = `rotate(${angle}deg)`;
    console.log(`[setMapRotation] Mapa rotacionado para ${angle} graus.`);
  } else {
    console.warn("[setMapRotation] Elemento de mapa não encontrado.");
  }
}


/**
 * clearRouteMarkers
 * Remove os marcadores de origem e destino adicionados pela função finalizeRouteMarkers.
 */
function clearRouteMarkers() {
  // Verifica e remove o marcador de origem, se existir
  if (window.originRouteMarker) {
    map.removeLayer(window.originRouteMarker);
    window.originRouteMarker = null;
    console.log("[clearRouteMarkers] Marcador de origem removido.");
  }
  
  // Verifica e remove o marcador de destino, se existir
  if (window.destRouteMarker) {
    map.removeLayer(window.destRouteMarker);
    window.destRouteMarker = null;
    console.log("[clearRouteMarkers] Marcador de destino removido.");
  }
  
  console.log("[clearRouteMarkers] Todos os marcadores de rota foram removidos.");
}



/**
 * Esconde o banner de instruções.
 * Elemento: id="instruction-banner"
 */
function hideInstructionBanner() {
  const banner = document.getElementById("instruction-banner");
  if (banner) {
    banner.style.display = "none";
    banner.classList.add("hidden");
    console.log("Banner de instruções escondido.");
  } else {
    console.warn("Elemento 'instruction-banner' não encontrado.");
  }
}

/**
 * Esconde o rodapé do resumo da rota.
 * Elemento: id="route-footer"
 */
function hideRouteFooter() {
  const footer = document.getElementById("route-footer");
  if (footer) {
    footer.style.display = "none";
    footer.classList.add("hidden");
    console.log("Rodapé de resumo da rota escondido.");
  } else {
    console.warn("Elemento 'route-footer' não encontrado.");
  }
}
