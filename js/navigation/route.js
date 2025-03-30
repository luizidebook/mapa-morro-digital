import { map } from '../map/map-core.js';
import { selectedDestination, navigationState } from '../core/state.js';
import { showNotification } from '../ui/notifications.js';
import { getCurrentLocation } from '../geolocation/tracking.js';
import { ORS_API_KEY } from '../core/constants.js';

/**
 * startRouteCreation - Inicia a criação de uma nova rota.
 */
export async function startRouteCreation() {
  try {
    validateDestination(); // Verifica destino válido

    const userLocation = await getCurrentLocation(); // Localização do usuário
    const routeData = await createRoute(userLocation); // Criação de rota com base na localização

    if (!routeData) {
      showNotification(translations[selectedLanguage].routeError, 'error');
      triggerHapticFeedback('recalculating');
      return;
    }

    currentRouteData = routeData; // Armazena rota atual
    startRoutePreview();
    hideAllControlButtons();
    updateRouteFooter(routeData, selectedLanguage);
    closeSideMenu();
  } catch (error) {
    console.error('❌ Erro ao iniciar criação de rota:', error.message);
    showNotification(translations[selectedLanguage].routeError, 'error');
  }
}

/**
 * createRoute
 *    Exemplo de função async para criar rota a partir de userLocation até selectedDestination. */
export async function createRoute(userLocation) {
  try {
    validateDestination(); // ou validateSelectedDestination()
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
  const url =
    `https://api.openrouteservice.org/v2/directions/${profile}?api_key=${ORS_API_KEY}` +
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
    if (window.currentRoute) {
      map.removeLayer(window.currentRoute);
    }
    window.currentRoute = L.polyline(latLngs, {
      color: 'blue',
      weight: 5,
      dashArray: '10,5',
    }).addTo(map);
    map.fitBounds(window.currentRoute.getBounds(), { padding: [50, 50] });
    console.log('[plotRouteOnMap] Rota plotada com sucesso.');
    return data;
  } catch (error) {
    console.error('[plotRouteOnMap] Erro ao plotar rota:', error);
    return null;
  }
}

/**
 * calculateDistance
 * Calcula a distância (em metros) entre dois pontos usando a fórmula de Haversine.
 * @param {number} lat1
 * @param {number} lon1
 * @param {number} lat2
 * @param {number} lon2
 * @returns {number} Distância em metros.
 */
export function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371000; // Raio da Terra em metros
  const toRad = Math.PI / 180;
  const dLat = (lat2 - lat1) * toRad;
  const dLon = (lon2 - lon1) * toRad;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1 * toRad) * Math.cos(lat2 * toRad) * Math.sin(dLon / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/**
* distanceToPolyline
/**
* Calcula a distância mínima entre um ponto e uma linha (polyline) definida por um array de pontos.
* Cada ponto no array deve ter as propriedades {lat, lon}.
* @param {Object} currentPos - Objeto com {lat, lon} representando a posição atual.
* @param {Array} routePoints - Array de pontos representando a rota.
* @returns {number} - Distância mínima em metros entre o ponto e a rota.
*/
export function distanceToPolyline(currentPos, routePoints) {
  if (!routePoints || routePoints.length === 0) return Infinity;

  let minDistance = Infinity;
  for (let i = 0; i < routePoints.length - 1; i++) {
    const A = routePoints[i];
    const B = routePoints[i + 1];
    const dist = pointToSegmentDistance(currentPos, A, B);
    if (dist < minDistance) {
      minDistance = dist;
    }
  }
  return minDistance;
}

/**
 * pointToSegmentDistance
 * Calcula a distância de um ponto a um segmento. */
/**
 * Calcula a distância de um ponto P à reta definida pelos pontos A e B.
 * @param {Object} P - Objeto com {lat, lon} representando o ponto.
 * @param {Object} A - Objeto com {lat, lon} representando o início do segmento.
 * @param {Object} B - Objeto com {lat, lon} representando o fim do segmento.
 * @returns {number} - Distância mínima em metros.
 */
export function pointToSegmentDistance(P, A, B) {
  // Conversão de graus para radianos
  const toRad = (deg) => (deg * Math.PI) / 180;

  // Converter os pontos para uma aproximação local (equirectangular)
  const latA = toRad(A.lat),
    lonA = toRad(A.lon);
  const latB = toRad(B.lat),
    lonB = toRad(B.lon);
  const latP = toRad(P.lat),
    lonP = toRad(P.lon);

  // Aproximar coordenadas para uma projeção plana
  const xA = lonA * Math.cos(latA),
    yA = latA;
  const xB = lonB * Math.cos(latB),
    yB = latB;
  const xP = lonP * Math.cos(latP),
    yP = latP;

  const AtoP_x = xP - xA;
  const AtoP_y = yP - yA;
  const AtoB_x = xB - xA;
  const AtoB_y = yB - yA;

  const segmentLengthSq = AtoB_x * AtoB_x + AtoB_y * AtoB_y;
  let t = 0;
  if (segmentLengthSq !== 0) {
    t = (AtoP_x * AtoB_x + AtoP_y * AtoB_y) / segmentLengthSq;
    t = Math.max(0, Math.min(1, t));
  }

  const projX = xA + t * AtoB_x;
  const projY = yA + t * AtoB_y;

  const deltaX = xP - projX;
  const deltaY = yP - projY;
  const distanceRad = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

  // Converter a distância radiana para metros
  const R = 6371000; // Raio da Terra em metros
  return distanceRad * R;
}

/**
* clearCurrentRoute /**
/**
* clearCurrentRoute
* Remove a rota atual (polyline) do mapa, se existir.
*/
function clearCurrentRoute() {
  if (window.currentRoute) {
    map.removeLayer(window.currentRoute);
    window.currentRoute = null;
    console.log('[clearCurrentRoute] Rota removida do mapa.');
  } else {
    console.log('[clearCurrentRoute] Nenhuma rota ativa para remover.');
  }
}

/**
 * getClosestPointOnRoute
 * Para cada segmento da rota (definida por um array de {lat, lon}),
 * calcula a projeção do ponto do usuário sobre o segmento e retorna o
 * ponto de projeção, o índice do segmento e o fator de projeção (t).
 * @param {number} userLat - Latitude do usuário.
 * @param {number} userLon - Longitude do usuário.
 * @param {Array} routeCoordinates - Array de pontos {lat, lon}.
 * @returns {Object} { closestPoint: {lat, lon}, segmentIndex, t }
 */
export function getClosestPointOnRoute(userLat, userLon, routeCoordinates) {
  let minDistance = Infinity;
  let bestProjection = null;
  let bestIndex = -1;
  let bestT = 0;

  for (let i = 0; i < routeCoordinates.length - 1; i++) {
    const A = routeCoordinates[i];
    const B = routeCoordinates[i + 1];
    const dx = B.lon - A.lon;
    const dy = B.lat - A.lat;
    const magSq = dx * dx + dy * dy;
    // Se o segmento é um ponto único, pule
    if (magSq === 0) continue;

    // Fator de projeção t (pode estar fora do intervalo [0, 1])
    const t = ((userLon - A.lon) * dx + (userLat - A.lat) * dy) / magSq;
    // Projeção restrita ao segmento
    const tClamped = Math.max(0, Math.min(1, t));
    const projLon = A.lon + tClamped * dx;
    const projLat = A.lat + tClamped * dy;

    const d = calculateDistance(userLat, userLon, projLat, projLon);
    if (d < minDistance) {
      minDistance = d;
      bestProjection = { lat: projLat, lon: projLon };
      bestIndex = i;
      bestT = tClamped;
    }
  }

  return {
    closestPoint: bestProjection,
    segmentIndex: bestIndex,
    t: bestT,
  };
}

/**
 * computeBearing
 * Calcula o rumo (bearing) entre dois pontos geográficos.
 * @param {number} lat1 - Latitude do ponto de partida.
 * @param {number} lon1 - Longitude do ponto de partida.
 * @param {number} lat2 - Latitude do ponto de destino.
 * @param {number} lon2 - Longitude do ponto de destino.
 * @returns {number} Rumo em graus (0-360).
 */
export function computeBearing(lat1, lon1, lat2, lon2) {
  const toRad = Math.PI / 180;
  const toDeg = 180 / Math.PI;
  const dLon = (lon2 - lon1) * toRad;
  const y = Math.sin(dLon) * Math.cos(lat2 * toRad);
  const x =
    Math.cos(lat1 * toRad) * Math.sin(lat2 * toRad) -
    Math.sin(lat1 * toRad) * Math.cos(lat2 * toRad) * Math.cos(dLon);
  let bearing = Math.atan2(y, x) * toDeg;
  return (bearing + 360) % 360;
}

/**
 * showRouteLoadingIndicator
 * Adiciona um indicador de carregamento antes da rota ser traçada
 */
export function showRouteLoadingIndicator(timeout = 15000) {
  const loader = document.getElementById('route-loader');
  if (!loader) {
    console.error('Elemento do loader não encontrado no DOM.');
    return;
  }

  loader.style.display = 'block';
  console.log('[showRouteLoadingIndicator] Indicador de carregamento ativado.');

  // Define um timeout para evitar carregamento infinito
  navigationState.loadingTimeout = setTimeout(() => {
    hideRouteLoadingIndicator();

    // Notifica o usuário do erro
    showNotification(
      getGeneralText('routeLoadTimeout', selectedLanguage) ||
        'Tempo esgotado para carregar a rota. Por favor, tente novamente.',
      'error'
    );

    console.error(
      '[showRouteLoadingIndicator] Timeout: Falha ao carregar rota.'
    );

    // Oferece ação ao usuário: tentar novamente
    displayRetryRouteLoadOption();
  }, 15000); // timeout após 15 segundos
}

/**
 * hideRouteLoadingIndicator
 * Remove o indicador de carregamento antes da rota ser traçada
 */
export function hideRouteLoadingIndicator() {
  // Cancela timeout se existir
  if (navigationState.loadingTimeout) {
    clearTimeout(navigationState.loadingTimeout);
    navigationState.loadingTimeout = null;
  }

  const loader = document.getElementById('route-loader');
  if (loader) loader.style.display = 'none';

  console.log('Indicador de carregamento desativado.');
}

/**
* fetchMultipleRouteOptions
/**
* fetchMultipleRouteOptions
* Obtém diferentes opções de rota para o trajeto, usando perfis variados.
* - Para cada perfil (ex.: "foot-walking", "cycling-regular", "driving-car"),
*   chama fetchRouteInstructions para obter as instruções correspondentes.
*
* @param {number} startLat - Latitude de partida.
* @param {number} startLon - Longitude de partida.
* @param {number} destLat - Latitude do destino.
* @param {number} destLon - Longitude do destino.
* @returns {Promise<Array>} - Array de objetos contendo o perfil e as instruções da rota.
*/
export async function fetchMultipleRouteOptions(
  startLat,
  startLon,
  destLat,
  destLon
) {
  const options = ['foot-walking', 'cycling-regular', 'driving-car'];
  let routes = [];
  // Para cada perfil (modo de transporte), obtém as instruções de rota
  for (const profile of options) {
    const routeData = await fetchRouteInstructions(
      startLat,
      startLon,
      destLat,
      destLon,
      selectedLanguage,
      10000,
      true,
      profile
    );
    routes.push({ profile, routeData });
  }
  return routes;
}

/**
 * applyRouteStyling
 * Cria gradientes de cor e adicionar ícones personalizados
 */
export function applyRouteStyling(routeLayer) {
  routeLayer.setStyle({
    color: 'blue',
    weight: 5,
    dashArray: '10, 5',
  });

  routeLayer.on('mouseover', function () {
    this.setStyle({ color: 'yellow' });
  });

  routeLayer.on('mouseout', function () {
    this.setStyle({ color: 'blue' });
  });
}
