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
import { plotRouteOnMap } from './routeUi/plotRouteOnMap.js';
// Importações de variáveis globais
import {
  selectedDestination,
  currentRouteData,
  selectedProfile, // Adicionado
  currentRoute, // Adicionado
  markers, // Adicionado
  isNavigationActive, // Adicionado
} from '../core/varGlobals.js';

export let map;
// Importação de constantes
import { ORS_API_KEY } from '../core/varGlobals.js'; // Adicionado

/////////////////////////////
// 1. FLUXO PRINCIPAL
/////////////////////////////

export let userLocation = null; // Última localização conhecida do usuário (atualizada pelo GPS)

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

    console.log('Localização do usuário:', userLocation);
    console.log('Destino selecionado:', selectedDestination);

    // 3️⃣ Verifica se a navegação já está ativa
    if (isNavigationActive) {
      showNotification(
        'Uma navegação já está ativa. Finalize-a antes de iniciar uma nova.',
        'warning'
      );
      return;
    }

    // 4️⃣ Criação da rota
    const routeData = await createRoute(userLocation);

    if (!routeData) {
      showNotification('Erro ao criar rota. Tente novamente.', 'error');
      return;
    }

    // 5️⃣ Atualização dos dados da rota
    currentRouteData = routeData;

    // 6️⃣ Início da pré-visualização da rota
    showRouteSummary();
    showMenuFooter();

    // 7️⃣ Atualização da interface
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
export async function createRoute(userLocation) {
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
export function validateSelectedDestination() {
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
