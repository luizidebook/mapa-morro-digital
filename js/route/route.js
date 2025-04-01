// Importações necessárias
import { getCurrentLocation } from '../geolocation/tracking.js';
import { showNotification } from '../ui/notifications.js';
import { getSelectedDestination } from '../data/cache.js';
import { selectedDestination } from '../data/cache.js';
import { selectedLanguage } from '../core/varGlobals.js';
import { apiKey } from '../core/varGlobals.js';
import { map } from '../main.js';
import { currentRouteData } from '../core/varGlobals.js';
import { cacheRouteData } from '../data/cache.js';

// Variáveis globais

/**
 * Função principal: startRouteCreation
 * Inicia o fluxo completo de criação de rota.
 */
export async function startRouteCreation() {
  try {
    console.log('[startRouteCreation] Iniciando criação de rota...');

    // 1️⃣ Validação do destino
    if (!selectedDestination || !selectedDestination.name) {
      console.log('[startRouteCreation] Tentando carregar destino do cache...');
      const destination = await getSelectedDestination();
      if (!destination || !destination.name) {
        console.warn(
          '[startRouteCreation] Destino inválido após carregar do cache:',
          destination
        );
        showNotification('Por favor, selecione um destino válido.', 'error');
        return;
      }
      console.log(
        '[startRouteCreation] Destino carregado do cache:',
        destination
      );
    } else {
      console.log(
        '[startRouteCreation] Destino já carregado:',
        selectedDestination
      );
    }

    console.log('[startRouteCreation] Validando destino...');
    if (!validateSelectedDestination()) {
      console.warn('[startRouteCreation] Validação do destino falhou.');
      return; // Interrompe o fluxo se o destino não for válido
    }

    // 2️⃣ Obtenção da localização do usuário
    console.log('[startRouteCreation] Obtendo localização do usuário...');
    const userLocation = await getCurrentLocation();
    if (!userLocation || !userLocation.latitude || !userLocation.longitude) {
      console.error(
        '[startRouteCreation] Localização do usuário inválida:',
        userLocation
      );
      showNotification('Não foi possível obter sua localização.', 'error');
      return;
    }
    console.log(
      '[startRouteCreation] Localização do usuário obtida:',
      userLocation
    );

    // 3️⃣ Criação da rota
    console.log('[startRouteCreation] Criando rota...');
    const routeData = await createRoute(userLocation);
    if (!routeData) {
      console.error('[startRouteCreation] Erro ao criar rota.');
      showNotification('Erro ao criar rota. Tente novamente.', 'error');
      return;
    }
    console.log('[startRouteCreation] Rota criada com sucesso:', routeData);

    // 4️⃣ Atualização dos dados da rota
    if (!currentRouteData) {
      currentRouteData = {}; // Inicializa o objeto, se necessário
    }
    currentRouteData.route = routeData.route;
    currentRouteData.distance = routeData.distance;
    currentRouteData.duration = routeData.duration;

    // 5️⃣ Início da pré-visualização da rota
    console.log('[startRouteCreation] Iniciando pré-visualização da rota...');
    startRoutePreview();

    // 6️⃣ Atualização da interface
    console.log('[startRouteCreation] Atualizando interface...');
    hideAllControlButtons();
    updateRouteFooter(routeData, selectedLanguage);
    closeSideMenu();

    console.log(
      '[startRouteCreation] Fluxo de criação de rota concluído com sucesso.'
    );
  } catch (error) {
    console.error(
      '❌ [startRouteCreation] Erro ao iniciar criação de rota:',
      error.message
    );
    showNotification(
      'Erro ao iniciar criação de rota. Tente novamente.',
      'error'
    );
  }
}

/**
 * Função auxiliar: validateSelectedDestination
 * Valida se o destino selecionado é válido.
 */
// validateSelectedDestination - Valida destino selecionado
export function validateSelectedDestination() {
  if (
    !selectedDestination ||
    !selectedDestination.lat ||
    !selectedDestination.lon
  ) {
    showNotification('Por favor, selecione um destino válido.', 'error');
    giveVoiceFeedback('Nenhum destino válido selecionado.');
    return false;
  }
  return true;
}

/**
 * 2. createRoute
 *    Exemplo de função async para criar rota a partir de userLocation até selectedDestination. */
export async function createRoute(userLocation) {
  try {
    if (!validateSelectedDestination()) {
      console.warn('[createRoute] Validação do destino falhou.');
      return null;
    }

    const routeData = await plotRouteOnMap(
      userLocation.latitude,
      userLocation.longitude,
      selectedDestination.lat,
      selectedDestination.lon
    );

    if (!routeData) {
      console.error('[createRoute] Erro ao calcular rota.');
      showNotification('Erro ao calcular rota. Tente novamente.', 'error');
      return null;
    }

    // Atualiza a variável global com os dados da rota
    let currentRouteData = routeData;

    // Salva a rota no cache
    cacheRouteData(routeData);
    console.log('[createRoute] Dados da rota salvos no cache:', routeData);

    finalizeRouteMarkers(
      userLocation.latitude,
      userLocation.longitude,
      selectedDestination
    );
    return routeData;
  } catch (error) {
    console.error('[createRoute] Erro ao criar rota:', error);
    showNotification(
      'Erro ao criar rota. Verifique sua conexão e tente novamente.',
      'error'
    );
    return null;
  }
}

/**
 * 3. plotRouteOnMap
/**
 * plotRouteOnMap
 * Consulta a API OpenRouteService, obtém as coordenadas e plota a rota no mapa.
 * - Remove a rota anterior, se existir.
 * - Cria uma polyline e ajusta os limites do mapa.
 *
 * @param {number} startLat - Latitude de partida.
 * @param {number} startLon - Longitude de partida.
 * @param {number} destLat - Latitude do destino.
 * @param {number} destLon - Longitude do destino.
 * @param {string} [profile="foot-walking"] - Perfil de navegação.
 * @returns {Promise<Object|null>} - Dados da rota ou null em caso de erro.
 */
export async function plotRouteOnMap(
  startLat,
  startLon,
  destLat,
  destLon,
  profile = 'foot-walking'
) {
  if (!map) {
    console.error(
      '[plotRouteOnMap] A instância do mapa (map) não está inicializada.'
    );
    showNotification(
      'Erro ao inicializar o mapa. Recarregue a página.',
      'error'
    );
    return null;
  }

  const url =
    `https://api.openrouteservice.org/v2/directions/${profile}?api_key=${apiKey}` +
    `&start=${startLon},${startLat}&end=${destLon},${destLat}&instructions=false`;

  try {
    const response = await fetch(url);
    if (!response.ok) {
      console.error('[plotRouteOnMap] Erro ao obter rota:', response.status);
      return null;
    }

    const data = await response.json();
    const coords = data.features[0].geometry.coordinates;
    const latLngs = coords.map(([lon, lat]) => [lat, lon]);

    // Remove a rota anterior, se existir
    if (window.currentRoute) {
      map.removeLayer(window.currentRoute);
    }

    // Cria e adiciona a polyline ao mapa
    window.currentRoute = L.polyline(latLngs, {
      color: 'blue',
      weight: 5,
      dashArray: '10,5',
    }).addTo(map);

    // Ajusta o mapa para mostrar toda a rota
    map.fitBounds(window.currentRoute.getBounds(), { padding: [50, 50] });
    console.log('[plotRouteOnMap] Rota plotada com sucesso.');
    return data;
  } catch (error) {
    console.error('[plotRouteOnMap] Erro ao plotar rota:', error);
    return null;
  }
}

/**
 * 6. finalizeRouteMarkers
/**
 * finalizeRouteMarkers
 * Adiciona marcadores de origem e destino no mapa.
 *
 * @param {number} userLat - Latitude do ponto de origem.
 * @param {number} userLon - Longitude do ponto de origem.
 * @param {Object} destination - Objeto contendo lat, lon e (opcionalmente) o nome do destino.
 */
export function finalizeRouteMarkers(userLat, userLon, destination) {
  if (!destination || !destination.lat || !destination.lon) {
    console.error(
      '[finalizeRouteMarkers] Coordenadas do destino inválidas:',
      destination
    );
    return;
  }

  // Adiciona um marcador no destino com um ícone de bandeira de chegada
  window.destRouteMarker = L.marker([destination.lat, destination.lon])
    .addTo(map)
    .bindPopup(`🏁${destination.name || 'Destino'}`)
    .openPopup();
  console.log(
    '[finalizeRouteMarkers] Marcadores de origem e destino adicionados.'
  );
}

/**
 * Função auxiliar: startRoutePreview
 * Exibe uma pré-visualização da rota no mapa.
 */
export function startRoutePreview() {
  if (
    !currentRouteData ||
    !currentRouteData.route ||
    currentRouteData.route.length === 0
  ) {
    console.warn(
      '[startRoutePreview] Dados da rota inválidos para pré-visualização:',
      currentRouteData
    );
    showNotification(
      'Nenhuma rota disponível para pré-visualização.',
      'warning'
    );
    return;
  }

  console.log('[startRoutePreview] Exibindo pré-visualização da rota...');
  // Exemplo: plotar a rota no mapa
  plotRouteOnMap(
    currentRouteData.route[0].latitude,
    currentRouteData.route[0].longitude,
    currentRouteData.route[currentRouteData.route.length - 1].latitude,
    currentRouteData.route[currentRouteData.route.length - 1].longitude
  );
}
