import {
  map,
  selectedDestination,
  navigationState,
  userLocation,
} from '../core/varGlobals.js';
import { showNotification } from '../ui/notifications.js';
import { getGeneralText } from '../ui/texts.js';
import { clearRouteMarkers } from '../ui/routeMarkers.js';

/**
 * startNavigation
 * Inicia a navegação para o destino selecionado, configurando o fluxo completo:
 *  - Validação do destino e disponibilidade de localização;
 *  - Obtenção de múltiplas opções de rota e escolha pelo usuário;
 *  - Enriquecimento das instruções de rota (por exemplo, com dados do OSM);
 *  - Animação e plotagem da rota no mapa;
 *  - Configuração do monitoramento contínuo da posição do usuário.
 */
export function startNavigation() {
  if (!selectedDestination) {
    console.error('Destino não selecionado.');
    showNotification(
      'Por favor, selecione um destino antes de iniciar a navegação.',
      'warning'
    );
    return;
  }

  if (!userLocation) {
    console.error('Localização do usuário não disponível.');
    showNotification(
      'Localização do usuário não disponível. Verifique as permissões de localização.',
      'error'
    );
    return;
  }

  // Lógica de navegação
  console.log('Navegação iniciada.');
}

/**
 * endNavigation
 * Finaliza a navegação, limpando estados e parando o monitoramento.
 */
export function endNavigation() {
  // 1) Finaliza e limpa tudo relativo à navegação
  isNavigationActive = false;
  isNavigationPaused = false;
  trackingActive = false; // Se houver uma flag global de rastreamento

  if (navigationWatchId !== null) {
    navigator.geolocation.clearWatch(navigationWatchId);
    navigationWatchId = null;
  }
  clearCurrentRoute();
  clearRouteMarkers(); // Remove marcadores de origem/destino e demais marcadores relacionados
  clearUserMarker();
  hideInstructionBanner();
  hideRouteFooter();
  hideRouteSummary();

  // 2) Agora restaura a interface com base na feature que o usuário estava usando
  if (lastSelectedFeature) {
    restoreFeatureUI(lastSelectedFeature);
  } else {
    // Se não tinha nada selecionado, volte para um estado genérico
    showMainCategories();
  }

  // 3) Exibe notificação de que a navegação foi encerrada
  showNotification(getGeneralText('navEnded', selectedLanguage), 'info');
}

export function showMainCategories() {
  hideAllControlButtons('start-navigation-button'); // garante que não haja botões duplicados
}

/**
 * pauseNavigation
 * Pausa a navegação.
 */
export function pauseNavigation() {
  if (!navigationState.isActive) {
    console.warn('Navegação não está ativa para pausar.');
    return;
  }
  if (navigationState.isPaused) {
    console.log('Navegação já está pausada.');
    return;
  }
  navigationState.isPaused = true;
  if (window.positionWatcher) {
    navigator.geolocation.clearWatch(window.positionWatcher);
    window.positionWatcher = null;
  }
  showNotification(getGeneralText('navPaused', navigationState.lang), 'info');
  console.log('Navegação pausada.');
}

/**
 * toggleNavigationPause
 * Alterna entre pausar e retomar a navegação. */
export function toggleNavigationPause() {
  if (navigationState.isPaused) {
    navigationState.isPaused = false;
    showNotification(
      getGeneralText('navResumed', navigationState.lang),
      'success'
    );
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
          console.error('Erro ao retomar watchPosition:', err);
          showNotification(
            getGeneralText('trackingError', navigationState.lang),
            'error'
          );
        },
        { enableHighAccuracy: true }
      );
    }
    console.log('Navegação retomada.');
  } else {
    pauseNavigation();
  }
  console.log('toggleNavigationPause executado.');
}

/**
 * updateRealTimeNavigation
 /**
 * updateRealTimeNavigation(lat, lon, instructions, destLat, destLon, lang, heading)
 * Atualiza a navegação em tempo real:
 * - Atualiza o marker do usuário com updateUserMarker.
 * - Reposiciona o mapa suavemente com panTo.
 * - Atualiza a interface (ex.: banner de instruções) com a instrução atual.
 */
export function updateRealTimeNavigation(
  lat,
  lon,
  instructions,
  destLat,
  destLon,
  lang,
  heading
) {
  // Atualiza ou cria o marcador do usuário com a nova posição e heading
  updateUserMarker(lat, lon, heading);
  // Se houver instruções disponíveis, atualiza o banner com a instrução atual
  if (instructions && instructions.length > 0) {
    const currentStepIndex = navigationState.currentStepIndex;
    const currentInstruction = instructions[currentStepIndex];
    if (currentInstruction) {
      updateInstructionBanner(currentInstruction, lang);
    }
  }
  // Centraliza o mapa na nova posição com uma animação suave (panTo)
  map.panTo([lat, lon], { animate: true, duration: 0.5 });
}

/**
 * adjustMapZoomBasedOnSpeed
 * Cria um sistema de zoom dinâmico que ajusta o zoom com base na velocidade.
 */
export function adjustMapZoomBasedOnSpeed(speed) {
  let zoomLevel;

  if (speed < 5) {
    zoomLevel = 18; // Caminhando
  } else if (speed < 15) {
    zoomLevel = 16; // Bicicleta
  } else if (speed < 50) {
    zoomLevel = 14; // Carro
  } else {
    zoomLevel = 12; // Alta velocidade
  }

  map.setZoom(zoomLevel);
}

/**
 * getRouteBearingForUser
 * Calcula o rumo que o usuário deve seguir com base na rota.
 * Utiliza a projeção do ponto do usuário sobre a rota para identificar
 * o segmento e, a partir dele, determina o rumo em direção ao próximo ponto.
 * @param {number} userLat - Latitude do usuário.
 * @param {number} userLon - Longitude do usuário.
 * @param {Array} routeCoordinates - Array de pontos {lat, lon}.
 * @returns {number} Rumo (bearing) em graus.
 */
export function getRouteBearingForUser(userLat, userLon, routeCoordinates) {
  if (!routeCoordinates || routeCoordinates.length < 2) return 0;

  const { closestPoint, segmentIndex } = getClosestPointOnRoute(
    userLat,
    userLon,
    routeCoordinates
  );

  // Se o usuário estiver no último segmento, use o último ponto
  const nextPoint =
    segmentIndex < routeCoordinates.length - 1
      ? routeCoordinates[segmentIndex + 1]
      : routeCoordinates[routeCoordinates.length - 1];

  return computeBearing(
    closestPoint.lat,
    closestPoint.lon,
    nextPoint.lat,
    nextPoint.lon
  );
}

/**
 * clearUserMarker
 * Remove o marcador do usuário e o círculo de precisão do mapa,
 * desfazendo todas as alterações realizadas por updateUserMarker.
 * - Remove window.userMarker (se existir) e o retira do mapa.
 * - Remove window.userAccuracyCircle (se existir) e o retira do mapa.
 * - Limpa a variável window.lastPosition.
 */
export function clearUserMarker() {
  // Remove o marcador do usuário, se existir
  if (window.userMarker) {
    map.removeLayer(window.userMarker);
    window.userMarker = null;
  }

  // Remove o círculo de precisão, se existir
  if (window.userAccuracyCircle) {
    map.removeLayer(window.userAccuracyCircle);
    window.userAccuracyCircle = null;
  }

  // Limpa a última posição armazenada
  window.lastPosition = null;

  console.log(
    'clearUserMarker: Marcador do usuário e círculo de precisão removidos.'
  );
}

/**

  --- Recalibração e Notificações ---

/**
 * recalculateRoute
 * Recalcula a rota em caso de desvio. */
/**
 * Recalcula a rota com base na posição atual do usuário.
 * Atualiza as instruções, a rota no mapa e fornece feedback ao usuário.
 * @param {number} currentLat - Latitude atual do usuário.
 * @param {number} currentLon - Longitude atual do usuário.
 * @param {number} destLat - Latitude do destino.
 * @param {number} destLon - Longitude do destino.
 */
export async function recalculateRoute(
  currentLat,
  currentLon,
  destLat,
  destLon
) {
  lastRecalculationTime = Date.now();
  showRouteLoadingIndicator();
  // Busca novas opções de rota com base na posição atual e destino
  let newRouteOptions = await fetchMultipleRouteOptions(
    currentLat,
    currentLon,
    destLat,
    destLon
  );
  if (!newRouteOptions || newRouteOptions.length === 0) {
    showNotification(
      getGeneralText('noInstructions', selectedLanguage),
      'error'
    );
    hideRouteLoadingIndicator();
    return;
  }
  // Permite que o usuário escolha a nova rota
  let newSelectedRoute = await promptUserToChooseRoute(newRouteOptions);
  if (!newSelectedRoute) {
    hideRouteLoadingIndicator();
    return;
  }

  // Enriquece as instruções da nova rota e atualiza o estado global
  let newRouteInstructions = await enrichInstructionsWithOSM(
    newSelectedRoute.routeData,
    selectedLanguage
  );
  navigationState.instructions = newRouteInstructions;

  // Plota a nova rota e finaliza os marcadores
  const newRouteData = await plotRouteOnMap(
    currentLat,
    currentLon,
    destLat,
    destLon
  );
  finalizeRouteMarkers(currentLat, currentLon, selectedDestination);

  // Atualiza a interface com a nova rota
  updateInstructionBanner(newRouteInstructions[0], selectedLanguage);
  updateRouteFooter(newRouteData, selectedLanguage);
  hideRouteLoadingIndicator();
  giveVoiceFeedback(
    getGeneralText('routeRecalculated', selectedLanguage) || 'Rota recalculada.'
  );
}

/**
 * notifyDeviation
 * Notifica o usuário sobre um desvio do trajeto e dispara o recálculo da rota.
 * Chama recalculateRoute com a flag bigDeviation.
 */
export function notifyDeviation() {
  const lang = navigationState.lang || 'pt';
  // Exibe uma notificação informando que o usuário desviou da rota
  showNotification(getGeneralText('routeDeviated', lang), 'warning');
  // Se houver uma localização e destino válidos, chama recalculateRoute com a flag de desvio grande
  if (userLocation && selectedDestination) {
    recalculateRoute(
      userLocation.latitude,
      userLocation.longitude,
      selectedDestination.lat,
      selectedDestination.lon,
      { bigDeviation: true, lang }
    );
  }
  console.log(
    '[notifyDeviation] Notificação de desvio enviada e recálculo iniciado.'
  );
}

/**
 * validateDestination
 * Verifica se o destino fornecido (ou o global selectedDestination) possui coordenadas válidas.
 * Agora também verifica os limites geográficos.
 * @param {Object} [destination=selectedDestination] - Objeto com as propriedades lat e lon.
 * @returns {boolean} - true se o destino for válido; false caso contrário. */
export function validateDestination(destination = selectedDestination) {
  console.log('[validateDestination] Verificando destino...');

  if (!destination) {
    showNotification(
      getGeneralText('invalidDestination', navigationState.lang),
      'warning'
    );
    console.warn('[validateDestination] Destino não fornecido.');
    return false;
  }

  const { lat, lon } = destination;
  if (
    typeof lat !== 'number' ||
    typeof lon !== 'number' ||
    Number.isNaN(lat) ||
    Number.isNaN(lon)
  ) {
    showNotification(
      getGeneralText('invalidDestination', navigationState.lang),
      'warning'
    );
    console.warn(
      '[validateDestination] Propriedades lat/lon inválidas:',
      destination
    );
    return false;
  }
  // Verifica limites: latitude entre -90 e 90; longitude entre -180 e 180
  if (lat < -90 || lat > 90 || lon < -180 || lon > 180) {
    showNotification(
      getGeneralText('invalidDestination', navigationState.lang),
      'warning'
    );
    console.warn(
      '[validateDestination] Coordenadas fora dos limites:',
      destination
    );
    return false;
  }
  console.log('[validateDestination] Destino válido:', destination);
  return true;
}

/**
 * handleRecalculation
 * Lida com o recálculo automático da rota. */
export function handleRecalculation() {
  if (checkIfUserIdle()) {
    pauseNavigation();
  } else {
    recalculateRoute(
      userLocation.latitude,
      userLocation.longitude,
      selectedDestination.lat,
      selectedDestination.lon
    );
  }
  console.log('handleRecalculation executado.');
}

/**
 * notifyRouteDeviation
 * Exibe notificação de que o usuário está fora da rota. */
export function notifyRouteDeviation() {
  showNotification('Você está fora da rota. Ajuste seu caminho.', 'warning');
}

/**
 * notifyNextInstruction
 * Exibe a próxima instrução de navegação. */
export function notifyNextInstruction(instruction) {
  showNotification(`Próxima instrução: ${instruction}`, 'info');
  console.log('Instrução notificada:', instruction);
}

/**
 * shouldRecalculateRoute
 * Verifica se o usuário se afastou do passo atual a ponto de necessitar um recálculo da rota.
 *
 * @param {number} userLat - Latitude atual do usuário.
 * @param {number} userLon - Longitude atual do usuário.
 * @param {Array} instructions - Array de instruções da rota.
 * @returns {boolean} - true se a distância até o passo atual for maior que 50 metros.
 */
// Variável global para controlar o tempo do último recálculo
// Defina o limiar de desvio (em metros) e o cooldown (em milissegundos)
const RECALCULATION_THRESHOLD = 10; // Exemplo: 10 metros
const RECALCULATION_COOLDOWN = 30000; // Exemplo: 30 segundos

/**
 * Verifica se é necessário recalcular a rota.
 * @param {number} currentLat - Latitude atual do usuário.
 * @param {number} currentLon - Longitude atual do usuário.
 * @param {Array} routePoints - Array de pontos representando a rota atual.
 * @returns {boolean} - Retorna true se o desvio for maior que o limiar e se passou o cooldown.
 */
export function shouldRecalculateRoute(currentLat, currentLon, routePoints) {
  const now = Date.now();
  if (now - lastRecalculationTime < RECALCULATION_COOLDOWN) {
    return false;
  }
  const deviation = distanceToPolyline(
    { lat: currentLat, lon: currentLon },
    routePoints
  );
  return deviation > RECALCULATION_THRESHOLD;
}

/**
 * checkIfUserIdle
 * Verifica se o usuário está inativo.
 * (Stub: retorna false como exemplo.) */
export function checkIfUserIdle(timeout = 300000) {
  // Exemplo: sempre retorna false
  return false;
}

/**
  --- Enriquecimento das Instruções ---
/**
 * validateRouteData
 * Valida os dados retornados pela API de rota. */
export function validateRouteData(routeData) {
  if (!routeData || !routeData.features || routeData.features.length === 0) {
    showNotification('Erro ao carregar dados da rota.', 'error');
    return false;
  }
  const coords = routeData.features[0].geometry.coordinates;
  if (!coords || coords.length === 0) {
    showNotification('Rota sem coordenadas.', 'error');
    return false;
  }
  console.log('Dados de rota validados.');
  return true;
}

/**
 * startRoutePreview
 * Exibe a pré-visualização da rota antes de iniciar a navegação. */
export function startRoutePreview() {
  if (!currentRouteData) {
    showNotification('Nenhuma rota disponível para pré-visualização.', 'error');
    return;
  }
  // Exibe o resumo e o botão
  displayRouteSummary(currentRouteData);
  displayStartNavigationButton();
}

/**
 * drawPath
 * Desenha uma polyline representando a rota no mapa. */
export function drawPath(userLat, userLon, instructions, lang) {
  try {
    if (window.navigationPath) {
      map.removeLayer(window.navigationPath);
    }
    const latLngs = instructions.map((step) => [step.lat, step.lon]);
    latLngs.unshift([userLat, userLon]);
    window.navigationPath = L.polyline(latLngs, {
      color: 'blue',
      weight: 6,
      dashArray: '10, 5',
    }).addTo(map);
    addInteractiveArrowsOnRoute(latLngs);
    map.fitBounds(window.navigationPath.getBounds(), { padding: [50, 50] });
    console.log('Rota desenhada com sucesso.');
  } catch (error) {
    console.error('Erro ao desenhar rota:', error);
    showNotification(getGeneralText('failedToPlotRoute', lang), 'error');
  }
}

/**
 * enrichInstructionsWithOSM
/**
 * enrichInstructionsWithOSM
 * Enriquece as instruções com dados adicionais do OSM (por exemplo, POIs próximos).
 *
 * @param {Array} instructions - Array de instruções da rota.
 * @param {string} [lang='pt'] - Idioma para as mensagens.
 * @returns {Promise<Array>} - Array de instruções enriquecidas.
 */
export async function enrichInstructionsWithOSM(instructions, lang = 'pt') {
  try {
    const enriched = await Promise.all(
      instructions.map(async (step) => {
        // Chama a função que simula a busca de POIs próximos
        const pois = await fakeFetchPOIsNearby(step.lat, step.lon);
        if (pois && pois.length > 0) {
          // Prepara a mensagem extra substituindo o {count} pela quantidade de POIs
          const extraMsg = getGeneralText('pois_nearby', lang)
            ? getGeneralText('pois_nearby', lang).replace(
                '{count}',
                pois.length
              )
            : `Existem ${pois.length} POIs próximos.`;
          step.enrichedInfo = extraMsg;
        } else {
          step.enrichedInfo = null;
        }
        return step;
      })
    );
    console.log(
      '[enrichInstructionsWithOSM] Instruções enriquecidas com dados do OSM/POIs.'
    );
    return enriched;
  } catch (error) {
    console.error(
      '[enrichInstructionsWithOSM] Erro ao enriquecer instruções:',
      error
    );
    return instructions;
  }
}

/**
 * fakeFetchPOIsNearby
 * Simula uma requisição assíncrona que retorna pontos de interesse próximos.
 */
export async function fakeFetchPOIsNearby(lat, lon) {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve([
        { name: 'POI 1', lat: lat + 0.001, lon: lon + 0.001 },
        { name: 'POI 2', lat: lat - 0.001, lon: lon - 0.001 },
      ]);
    }, 500);
  });
}

/**
 * fetchRouteInstructions
 * Busca instruções de rota (turn-by-turn) via API OpenRouteService.
 * - Monta a URL com os parâmetros fornecidos.
 * - Faz a requisição e mapeia os passos (steps) da rota.
 *
 * @param {number} startLat - Latitude de origem.
 * @param {number} startLon - Longitude de origem.
 * @param {number} destLat - Latitude do destino.
 * @param {number} destLon - Longitude do destino.
 * @param {string} [lang="pt"] - Idioma para as instruções.
 * @param {number} [timeoutMs=10000] - Timeout em ms para a requisição.
 * @param {boolean} [shouldEnrich=true] - Flag para indicar se instruções serão enriquecidas.
 * @param {string} [profile="foot-walking"] - Perfil de rota.
 * @returns {Promise<Array>} - Array de instruções formatadas.
 */
export async function fetchRouteInstructions(
  startLat,
  startLon,
  destLat,
  destLon,
  lang = 'pt',
  timeoutMs = 10000,
  shouldEnrich = true,
  profile = 'foot-walking'
) {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeoutMs);
  try {
    // Monta a URL para a API com os parâmetros necessários
    const url =
      `https://api.openrouteservice.org/v2/directions/${profile}?` +
      `start=${startLon},${startLat}&end=${destLon},${destLat}&language=${lang}` +
      `&api_key=${apiKey}&instructions=true`;
    const response = await fetch(url, { signal: controller.signal });
    clearTimeout(id);
    if (!response.ok) {
      showNotification(
        `Falha ao obter rota (status ${response.status})`,
        'error'
      );
      return [];
    }
    const data = await response.json();
    // Extrai os passos (steps) e as coordenadas da rota
    const steps = data.features?.[0]?.properties?.segments?.[0]?.steps;
    const coords = data.features?.[0]?.geometry?.coordinates;
    if (!steps || !coords) {
      showNotification(getGeneralText('noInstructions', lang), 'error');
      return [];
    }
    // Mapeia os passos para um formato mais simples, extraindo também dados via mapORSInstruction
    const finalSteps = steps.map((step, index) => {
      const coordIndex = step.way_points?.[0] ?? 0;
      const [lon, lat] = coords[coordIndex];
      const { maneuverKey, placeName } = mapORSInstruction(step.instruction);
      return {
        id: index + 1,
        raw: step.instruction,
        text: step.instruction,
        distance: Math.round(step.distance),
        lat,
        lon,
        maneuverKey,
        streetName: placeName,
      };
    });
    return finalSteps;
  } catch (err) {
    clearTimeout(id);
    console.error(
      '[fetchRouteInstructions] Erro ou timeout na requisição:',
      err
    );
    showNotification(
      'Tempo excedido ou erro ao buscar rota. Tente novamente.',
      'error'
    );
    return [];
  }
}

/**
 * finalizeRouteMarkers
/**
 * finalizeRouteMarkers
 * Adiciona marcadores de origem e destino no mapa.
 *
 * @param {number} userLat - Latitude do ponto de origem.
 * @param {number} userLon - Longitude do ponto de origem.
 * @param {Object} destination - Objeto contendo lat, lon e (opcionalmente) o nome do destino.
 */
export function finalizeRouteMarkers(userLat, userLon, destination) {
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
 * recalcRouteOnDeviation
 * Recalcula a rota ao detectar que o usuário se desviou. */
export async function recalcRouteOnDeviation(
  userLat,
  userLon,
  destLat,
  destLon
) {
  console.log('Recalculando rota devido ao desvio...');
  if (currentRoute) {
    map.removeLayer(currentRoute);
    currentRoute = null;
  }
  const data = await plotRouteOnMap(userLat, userLon, destLat, destLon);
  if (!data) {
    console.warn('Falha ao recalcular rota (plot).');
    return;
  }
  const newInstructions = await fetchRouteInstructions(
    userLat,
    userLon,
    destLat,
    destLon,
    selectedLanguage
  );
  if (!newInstructions || newInstructions.length === 0) {
    console.warn('Instruções vazias após recalc.');
    return;
  }
  navigationState.instructions = newInstructions;
  navigationState.currentStepIndex = 0;
  navigationState.isPaused = false;
  updateInstructionBanner(newInstructions[0], selectedLanguage);
  console.log('Rota recalculada com sucesso.');
}

/**
 * updateRouteFooter
/**
 * updateRouteFooter
 * Atualiza o rodapé da rota com informações de tempo estimado e distância.
 *
 * @param {Object} routeData - Dados da rota retornados pela API.
 * @param {string} [lang=selectedLanguage] - Código do idioma.
 */
export function updateRouteFooter(routeData, lang = selectedLanguage) {
  if (!routeData || !routeData.features || routeData.features.length === 0) {
    console.warn(
      '[updateRouteFooter] Dados de rota inválidos para atualização.'
    );
    return;
  }
  // Extrai o resumo da rota com duração e distância
  const summary = routeData.features[0].properties.summary;
  const etaMinutes = Math.round(summary.duration / 60);
  const distanceKm = (summary.distance / 1000).toFixed(2);

  // Atualiza os elementos do DOM com o tempo e distância
  const routeTimeElem = document.getElementById('route-time');
  const routeDistanceElem = document.getElementById('route-distance');
  if (routeTimeElem) {
    routeTimeElem.textContent = `${etaMinutes} ${getGeneralText(
      'minutes',
      lang
    )}`;
  }
  if (routeDistanceElem) {
    routeDistanceElem.textContent = `${distanceKm} km`;
  }

  const footer = document.getElementById('route-footer');
  if (footer) {
    footer.classList.remove('hidden');
    footer.style.display = 'flex';
  }
  console.log(
    '[updateRouteFooter] Rodapé atualizado: Tempo =',
    etaMinutes,
    'min; Distância =',
    distanceKm,
    'km.'
  );
}

/**
 * updateInstructionBanner
/**
 * updateInstructionBanner
 * Atualiza o banner de instruções exibido na interface.
 * - Formata a mensagem utilizando buildInstructionMessage e mapORSInstruction.
 * - Atualiza o ícone correspondente à manobra.
 *
 * @param {Object} instruction - Objeto contendo a instrução atual.
 * @param {string} [lang=selectedLanguage] - Código do idioma.
 */
export function updateInstructionBanner(instruction, lang = selectedLanguage) {
  const banner = document.getElementById('instruction-banner');
  if (!banner) {
    console.error(
      'updateInstructionBanner: Banner de instruções não encontrado (#instruction-banner).'
    );
    return;
  }
  const arrowEl = document.getElementById('instruction-arrow');
  const mainEl = document.getElementById('instruction-main');

  let finalMessage = '';
  // Se a instrução possui um texto bruto, constrói a mensagem formatada
  if (instruction.raw) {
    finalMessage = buildInstructionMessage(instruction.raw, lang);
  } else {
    finalMessage = instruction.text || getGeneralText('unknown', lang);
  }
  // Extrai a manobra e o nome do local usando mapORSInstruction para obter o ícone
  const mapped = instruction.raw
    ? mapORSInstruction(instruction.raw)
    : { maneuverKey: 'unknown' };
  const directionIcon =
    typeof getDirectionIcon === 'function'
      ? getDirectionIcon(mapped.maneuverKey)
      : '➡️';

  if (arrowEl) arrowEl.textContent = directionIcon;
  if (mainEl) mainEl.textContent = finalMessage;

  banner.classList.remove('hidden');
  banner.style.display = 'flex';
  console.log('updateInstructionBanner: Banner atualizado com:', finalMessage);
}

/**
 * updateNavigationInstructions
 * Atualiza as instruções de navegação em tempo real conforme o usuário se move. */
export function updateNavigationInstructions(
  userLat,
  userLon,
  instructions,
  destLat,
  destLon,
  lang = selectedLanguage
) {
  if (!instructions || instructions.length === 0) {
    console.warn('Nenhuma instrução disponível para atualizar.');
    return;
  }
  const currentIndex = navigationState.currentStepIndex;
  const currentStep = instructions[currentIndex];
  if (!currentStep) {
    console.warn('Nenhum passo atual encontrado.');
    return;
  }
  const dist = calculateDistance(
    userLat,
    userLon,
    currentStep.lat,
    currentStep.lon
  );
  console.log(`Distância até a instrução atual: ${dist.toFixed(1)} m`);
  if (dist < 10) {
    navigationState.currentStepIndex++;
    if (navigationState.currentStepIndex < instructions.length) {
      const nextStep = instructions[navigationState.currentStepIndex];
      updateInstructionBanner(nextStep, lang);
      speakInstruction(nextStep.text, lang === 'pt' ? 'pt-BR' : 'en-US');
    } else {
      showNotification(getGeneralText('destinationReached', lang), 'success');
      endNavigation();
    }
  }
}

/**
 * updateNavigationProgress
 * Atualiza a barra de progresso da navegação. */
export function updateNavigationProgress(progress) {
  const progressBar = document.getElementById('progress-bar');
  if (!progressBar) return;
  progressBar.style.width = `${progress}%`;
  progressBar.setAttribute('aria-valuenow', progress.toString());
  console.log(`Progresso atualizado: ${progress}%`);
}

/**
 * updateRoutePreview
 * Atualiza container com pré-visualização de rota */
export function updateRoutePreview(contentHTML) {
  const previewContainer = document.getElementById('route-preview');
  if (!previewContainer) {
    console.error('Container de pré-visualização não encontrado.');
    return;
  }
  previewContainer.innerHTML = contentHTML;
  previewContainer.classList.remove('hidden');
  previewContainer.style.display = 'block';
  console.log('Pré-visualização da rota atualizada.');
}
/**

  --- Rotina de Navegação ---

 * startRotationAuto
 * @description Ativa a rotação automática do mapa, sincronizando com o heading (orientação)
 * do usuário, se suportado. Usa DeviceOrientationEvent, solicitando permissão em iOS.
*/
// Declare globalmente
// Função para anexar o listener de deviceorientation e iniciar a rotação automática
export function startRotationAuto() {
  if (
    DeviceOrientationEvent.requestPermission &&
    typeof DeviceOrientationEvent.requestPermission === 'function'
  ) {
    DeviceOrientationEvent.requestPermission()
      .then((response) => {
        if (response === 'granted') {
          attachOrientationListener();
        } else {
          showNotification('Rotação automática não autorizada.', 'warning');
        }
      })
      .catch((err) => {
        showNotification(
          'Não foi possível ativar rotação automática.',
          'error'
        );
      });
  } else {
    attachOrientationListener();
  }

  function attachOrientationListener() {
    window.removeEventListener(
      'deviceorientation',
      onDeviceOrientationChange,
      true
    );
    window.addEventListener(
      'deviceorientation',
      onDeviceOrientationChange,
      true
    );
  }
}

// Função de callback para o evento deviceorientation
function onDeviceOrientationChange(event) {
  const alpha = event.alpha;
  if (typeof alpha === 'number' && !isNaN(alpha)) {
    setMapRotation(alpha);
  }
}

/**
 * stopRotationAuto
 * Desativa a rotação automática do mapa removendo o listener de deviceorientation.
 * Também reseta a transformação CSS do container do mapa.
 */
export function stopRotationAuto() {
  if (navigationState) {
    navigationState.isRotationEnabled = false;
  }
  window.removeEventListener(
    'deviceorientation',
    onDeviceOrientationChange,
    true
  );

  // Em vez de alterar o container principal, remova a transformação da camada de tiles
  removeRotationFromTileLayer();

  console.log('stopRotationAuto: Rotação automática desativada.');
}

/**
  --- Formatação e Exibição de Instruções ---

 * buildInstructionMessage
 * Monta a mensagem final a partir da instrução bruta.
 */
export function buildInstructionMessage(rawInstruction, lang = 'pt') {
  // Usa mapORSInstruction para extrair a chave da manobra e o nome do local
  const { maneuverKey, placeName } = mapORSInstruction(rawInstruction);
  // Se houver um local, utiliza a chave com sufixo "_on"
  if (placeName) {
    return getGeneralText(`${maneuverKey}_on`, lang) + ' ' + placeName;
  } else {
    return getGeneralText(maneuverKey, lang);
  }
}

/**
 * updateInstructionDisplay
 * Atualiza e exibe a lista de instruções na interface.
 * Recebe um array de instruções brutas e o idioma selecionado.
 * O elemento com id "instructions-container" deve existir na página.
 */
export function updateInstructionDisplay(rawInstructions, lang = 'pt') {
  const container = document.getElementById('instruction-banner');
  if (!container) {
    console.error("Elemento 'instruction-banner' não encontrado.");
    return;
  }
  // Limpa o conteúdo atual
  container.innerHTML = '';

  rawInstructions.forEach((instruction) => {
    const message = buildInstructionMessage(instruction, lang);
    // Cria um elemento para cada instrução (por exemplo, um <li>)
    const li = document.createElement('li');
    li.textContent = message;
    container.appendChild(li);
  });
}

/**
 * mapORSInstruction
 * Extrai da instrução bruta a manobra, a direção e o nome do local.
 */
export function mapORSInstruction(rawInstruction) {
  let maneuverKey = 'unknown';
  let placeName = '';
  let prepositionUsed = '';
  if (!rawInstruction) return { maneuverKey, placeName, prepositionUsed };

  const text = rawInstruction.toLowerCase();

  // Tenta identificar padrões de instrução como "head north", "turn left", etc.
  const headRegex =
    /^head\s+(north(?:\s*east|west)?|south(?:\s*east|west)?|east(?:\s*north|south)?|west(?:\s*north|south)?|northeast|southeast|southwest|northwest)/;
  const headMatch = text.match(headRegex);
  if (headMatch) {
    const direction = headMatch[1].replace(/\s+/g, '_');
    maneuverKey = `head_${direction}`;
  } else if (text.includes('turn sharp left')) {
    maneuverKey = 'turn_sharp_left';
  } else if (text.includes('turn sharp right')) {
    maneuverKey = 'turn_sharp_right';
  } else if (text.includes('turn slight left')) {
    maneuverKey = 'turn_slight_left';
  } else if (text.includes('turn slight right')) {
    maneuverKey = 'turn_slight_right';
  } else if (text.includes('turn left')) {
    maneuverKey = 'turn_left';
  } else if (text.includes('turn right')) {
    maneuverKey = 'turn_right';
  } else if (text.includes('continue straight')) {
    maneuverKey = 'continue_straight';
  } else if (text.includes('keep left')) {
    maneuverKey = 'keep_left';
  } else if (text.includes('keep right')) {
    maneuverKey = 'keep_right';
  } else if (text.includes('u-turn')) {
    maneuverKey = 'u_turn';
  } else if (text.includes('enter roundabout')) {
    maneuverKey = 'enter_roundabout';
  } else if (text.includes('exit roundabout')) {
    maneuverKey = 'exit_roundabout';
  } else if (text.includes('ferry')) {
    maneuverKey = 'ferry';
  } else if (text.includes('end of road')) {
    maneuverKey = 'end_of_road';
  }

  // Detecta a preposição (on, onto, in) e, se encontrada, extrai o nome do local
  const prepositionRegex = /\b(on|onto|in)\b/;
  const prepositionMatch = text.match(prepositionRegex);
  if (prepositionMatch) {
    prepositionUsed = prepositionMatch[1];
  }
  if (prepositionUsed) {
    const placeRegex = new RegExp(
      `\\b(?:${prepositionUsed})\\b\\s+(.+?)(?:[,\\.]|$)`,
      'i'
    );
    const placeMatch = rawInstruction.match(placeRegex);
    if (placeMatch && placeMatch[1]) {
      placeName = placeMatch[1].trim();
    }
  }
  return { maneuverKey, placeName, prepositionUsed };
}

/**

 * animateMapToLocalizationUser
 /**
/**
 * animateMapToLocalizationUser(targetLat, targetLon)
 * Realiza uma animação suave para centralizar o mapa na localização do usuário.
 * A animação interpola entre o centro atual e a posição (targetLat, targetLon) durante 1 segundo.
 */
export function animateMapToLocalizationUser(targetLat, targetLon) {
  const animationDuration = 1000; // duração em milissegundos
  const startCenter = map.getCenter();
  const startLat = startCenter.lat;
  const startLon = startCenter.lng;
  const startTime = performance.now();

  function animateFrame(currentTime) {
    const elapsed = currentTime - startTime;
    const progress = Math.min(elapsed / animationDuration, 1); // Progresso de 0 a 1
    // Interpolação linear entre a posição atual e a posição alvo
    const interpolatedLat = startLat + (targetLat - startLat) * progress;
    const interpolatedLon = startLon + (targetLon - startLon) * progress;
    // Atualiza a vista do mapa sem animação nativa
    map.setView([interpolatedLat, interpolatedLon], map.getZoom(), {
      animate: false,
    });
    if (progress < 1) {
      requestAnimationFrame(animateFrame);
    }
  }
  requestAnimationFrame(animateFrame);
}

/**
 * promptUserToChooseRoute
 * Exibe uma interface gráfica (modal) para que o usuário escolha uma das rotas disponíveis.
 * Cria dinamicamente um modal com botões para cada opção de rota e aguarda a seleção do usuário.
 *
 * @param {Array} routeOptions - Array de objetos com { profile, routeData }.
 * @returns {Promise<Object|null>} - Retorna a opção escolhida ou null se cancelado.
 */
async function promptUserToChooseRoute(routeOptions) {
  return new Promise((resolve, reject) => {
    // Cria o overlay do modal para seleção de rota
    const modalOverlay = document.createElement('div');
    modalOverlay.style.position = 'fixed';
    modalOverlay.style.top = '0';
    modalOverlay.style.left = '0';
    modalOverlay.style.width = '100%';
    modalOverlay.style.height = '100%';
    modalOverlay.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
    modalOverlay.style.display = 'flex';
    modalOverlay.style.justifyContent = 'center';
    modalOverlay.style.alignItems = 'center';
    modalOverlay.style.zIndex = '9999';
    // Cria o container do modal com título e botões
    const modalContainer = document.createElement('div');
    modalContainer.style.backgroundColor = '#fff';
    modalContainer.style.padding = '20px';
    modalContainer.style.borderRadius = '8px';
    modalContainer.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.2)';
    modalContainer.style.maxWidth = '400px';
    modalContainer.style.width = '80%';
    modalContainer.style.textAlign = 'center';
    const title = document.createElement('h3');
    title.textContent = 'Escolha uma opção de rota:';
    title.style.marginBottom = '20px';
    modalContainer.appendChild(title);
    // Para cada rota disponível, cria um botão
    routeOptions.forEach((option, index) => {
      const btn = document.createElement('button');
      btn.textContent = `${index + 1}: ${option.profile}`;
      btn.style.margin = '10px';
      btn.style.padding = '10px 20px';
      btn.style.border = 'none';
      btn.style.borderRadius = '4px';
      btn.style.backgroundColor = '#007BFF';
      btn.style.color = '#fff';
      btn.style.cursor = 'pointer';
      btn.onclick = () => {
        document.body.removeChild(modalOverlay);
        resolve(option);
      };
      modalContainer.appendChild(btn);
    });
    // Botão de cancelar a seleção
    const cancelBtn = document.createElement('button');
    cancelBtn.textContent = 'Cancelar';
    cancelBtn.style.margin = '10px';
    cancelBtn.style.padding = '10px 20px';
    cancelBtn.style.border = 'none';
    cancelBtn.style.borderRadius = '4px';
    cancelBtn.style.backgroundColor = '#dc3545';
    cancelBtn.style.color = '#fff';
    cancelBtn.style.cursor = 'pointer';
    cancelBtn.onclick = () => {
      document.body.removeChild(modalOverlay);
      resolve(null);
    };
    modalContainer.appendChild(cancelBtn);
    modalOverlay.appendChild(modalContainer);
    document.body.appendChild(modalOverlay);
  });
}
