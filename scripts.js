import {
  loadResources,
  setLanguage,
  updateInterfaceLanguage,
} from "./js/core/config.js";
import {
  initNavigationState,
  saveNavigationState,
  restoreNavigationState,
  saveStateToServiceWorker,
  autoRestoreState,
  restoreState,
  updateNavigationState,
  sendDestinationToServiceWorker,
  getState,
} from "./js/core/state.js";
import {
  onDOMContentLoaded,
  setupEventListeners,
} from "./js/core/event-listeners.js";
import {
  cacheRouteData,
  loadRouteFromCache,
  getLocalStorageItem,
  setLocalStorageItem,
  removeLocalStorageItem,
  saveDestinationToCache,
  saveRouteToHistory,
  saveSearchQueryToHistory,
  loadSearchHistory,
} from "./js/data/cache.js";
import {
  initializeMap,
  resetMapView,
  adjustMapWithLocation,
  clearMarkers,
  clearMapLayers,
} from "./js/map/map-core.js";
import {
  displayCustomTouristSpots,
  displayCustomBeaches,
  displayCustomRestaurants,
  displayCustomShops,
} from "./js/map/map-markers.js";
import {
  startNavigation,
  endNavigation,
  pauseNavigation,
  toggleNavigationPause,
} from "./js/navigation/navigation-control.js";
import {
  startRouteCreation,
  createRoute,
  plotRouteOnMap,
  calculateDistance,
} from "./js/navigation/route.js";
import {
  getCurrentLocation,
  useCurrentLocation,
  initContinuousLocationTracking,
  updateUserMarker,
} from "./js/geolocation/tracking.js";
import {
  toggleModals,
  showModal,
  closeCarouselModal,
  closeAssistantModal,
  animateInstructionChange,
  updateAssistantModalContent,
} from "./js/ui/modals.js";
import { showNotification } from "./js/ui/notifications.js";
import {
  hideAllButtons,
  showControlButtonsTouristSpots,
  showControlButtonsBeaches,
  showControlButtonsRestaurants,
  showControlButtonsShops,
} from "./js/ui/buttons.js";
import {
  handleSubmenuButtonClick,
  handleSubmenuButtonsTouristSpots,
  handleSubmenuButtonsBeaches,
  handleSubmenuButtonsRestaurants,
  handleSubmenuButtonsShops,
  setupSubmenuClickListeners,
} from "./js/ui/submenus.js";

const lang = localStorage.getItem("preferredLanguage") || "pt";
setLanguage(lang);
updateInterfaceLanguage(lang);

// Inicializar o mapa
const map = initializeMap();
resetMapView();

// Exibir pontos turísticos no mapa
displayCustomTouristSpots();

// Iniciar navegação de exemplo
startNavigation();

// Criar rota de exemplo
createRoute({ lat: -23.55052, lon: -46.633308 });

// Iniciar rastreamento de localização
initContinuousLocationTracking();

// Exibir modal de exemplo
showModal("welcome-modal");

// Exibir notificação de exemplo
showNotification("Bem-vindo ao Mapa Morro Digital!", "success");

// Exibir botões de exemplo
showControlButtonsTouristSpots();

// Configurar listeners de submenu
setupSubmenuClickListeners();
