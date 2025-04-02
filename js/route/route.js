/**
 * Módulo: route.js
 * Descrição: Este módulo gerencia a criação de rotas, cálculo de distâncias, manipulação de polylines e exibição de rotas no mapa.
 */

// Importações de funções externas
import { getCurrentLocation } from '../geolocation/tracking.js';
import { showNotification } from '../ui/notifications.js';
import { finalizeRouteMarkers } from '../ui/routeMarkers.js';
import { hideAllControlButtons } from '../ui/buttons.js';
import { closeSideMenu } from '../ui/menu.js';
// Importações de variáveis globais
import { selectedDestination, currentRouteData } from '../core/varGlobals.js';
import { plotRouteOnMap, showMenuFooter } from '../route/managerRoute.js';
// Importação de constantes
/////////////////////////////
// 1. FLUXO PRINCIPAL
/////////////////////////////

/**
 * 1.1. startRouteCreation
 * Inicia a criação de uma nova rota.
 */
export async function startRouteCreation() {
  try {
    console.log('[startRouteCreation] Iniciando criação de rota...');

    // 1️⃣ Validação do destino
    validateSelectedDestination();

    // 2️⃣ Obtenção da localização do usuário
    const userLocation = await getCurrentLocation();

    // 3️⃣ Criação da rota
    const routeData = await createRoute(userLocation);

    if (!routeData) {
      showNotification('Erro ao criar rota. Tente novamente.', 'error');
      return;
    }

    // 4️⃣ Atualização dos dados da rota
    currentRouteData = routeData;

    // 5️⃣ Início da pré-visualização da rota
    showRouteSummary();
    showMenuFooter();

    // 6️⃣ Atualização da interface
    hideAllControlButtons();
    closeSideMenu();

    console.log('[startRouteCreation] Rota criada com sucesso.');
  } catch (error) {
    console.error('❌ Erro ao iniciar criação de rota:', error.message);
    showNotification('Erro ao iniciar criação de rota.', 'error');
  }
}

/**
 * 1.2. createRoute
 * Cria uma rota a partir da localização do usuário até o destino selecionado.
 *
 * @param {Object} userLocation - Localização do usuário ({ latitude, longitude }).
 * @returns {Object|null} - Dados da rota ou null em caso de erro.
 */
async function createRoute(userLocation) {
  try {
    validateSelectedDestination();

    const routeData = await plotRouteOnMap(
      userLocation.latitude,
      userLocation.longitude,
      selectedDestination.lat,
      selectedDestination.lon
    );

    if (!routeData) {
      showNotification('Erro ao calcular rota. Tente novamente.', 'error');
      return null;
    }

    finalizeRouteMarkers(
      userLocation.latitude,
      userLocation.longitude,
      selectedDestination
    );
    return routeData;
  } catch (error) {
    console.error('Erro ao criar rota:', error);
    showNotification(
      'Erro ao criar rota. Verifique sua conexão e tente novamente.',
      'error'
    );
    return null;
  }
}

/////////////////////////////
// 2. FUNÇÕES AUXILIARES
/////////////////////////////

/**
 * 2.1. validateSelectedDestination
 * Valida se o destino selecionado é válido.
 */
function validateSelectedDestination() {
  if (
    !selectedDestination ||
    !selectedDestination.lat ||
    !selectedDestination.lon
  ) {
    showNotification('Por favor, selecione um destino válido.', 'error');
    return false;
  }
  return true;
}
