import { appState } from '../core/state.js';
import { eventBus, EVENT_TYPES } from '../core/eventBus.js';
import { API, MAP_CONFIG, LOCATION_CONFIG } from '../core/config.js';
import { getMap, clearMapLayers, centerMap } from '../map/map-core.js';
import {
  createDestinationMarker,
  removeDestinationMarker,
  highlightNextStepInMap,
} from '../map/map-markers.js';
import {
  showNotification,
  showError,
  showSuccess,
  showWarning,
} from '../ui/notifications.js';
import { translate } from '../i18n/language.js';
import {
  calculateDistance,
  calculateBearing,
  formatDistance,
  formatDuration,
} from '../utils/geo.js';
import { debounce } from '../utils/helpers.js';

/**
 * Módulo de rotas
 * Responsável pela criação, exibição e gerenciamento de rotas de navegação
 */

// Constantes locais
const RECALCULATION_THRESHOLD =
  LOCATION_CONFIG.TRACKING.RECALCULATION_THRESHOLD || 50; // metros
const RECALCULATION_COOLDOWN =
  LOCATION_CONFIG.TRACKING.RECALCULATION_COOLDOWN || 30000; // 30 segundos

// Guarda referência à última vez que uma rota foi recalculada
let lastRecalculationTime = 0;

/**
 * Cria uma rota entre dois pontos
 * @param {number} startLat - Latitude do ponto de partida
 * @param {number} startLon - Longitude do ponto de partida
 * @param {number} destLat - Latitude do destino
 * @param {number} destLon - Longitude do destino
 * @param {string} [profile='foot-walking'] - Perfil de navegação (foot-walking, cycling-regular, driving-car)
 * @param {Object} [options={}] - Opções adicionais
 * @returns {Promise<Object>} Dados da rota ou null em caso de erro
 */
export async function createRoute(
  startLat,
  startLon,
  destLat,
  destLon,
  profile = 'foot-walking',
  options = {}
) {
  try {
    // Publicar evento de criação de rota iniciada
    eventBus.publish(EVENT_TYPES.ROUTE_CREATION_STARTED, {
      start: { lat: startLat, lon: startLon },
      destination: { lat: destLat, lon: destLon },
      profile,
    });

    // Mostrar indicador de carregamento se solicitado
    if (options.showLoader !== false) {
      showRouteLoading();
    }

    // Validar os pontos de origem e destino
    if (
      !validateCoordinates(startLat, startLon) ||
      !validateCoordinates(destLat, destLon)
    ) {
      throw new Error('Coordenadas inválidas para criação de rota');
    }

    // Construir URL para a API OpenRouteService
    const url =
      `${API.ORS_BASE_URL}/directions/${profile}?api_key=${API.ORS_KEY}` +
      `&start=${startLon},${startLat}&end=${destLon},${destLat}` +
      `&instructions=true&units=m&language=${
        appState.get('language.selected') || 'pt'
      }`;

    // Fazer a requisição à API
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Erro na API: ${response.status} ${response.statusText}`);
    }

    // Processar resposta da API
    const data = await response.json();

    // Verificar se a API retornou uma rota válida
    if (!data.features || data.features.length === 0) {
      throw new Error('A API não retornou nenhuma rota válida');
    }

    // Extrair dados da rota
    const routeData = processRouteData(data);

    // Criar o destino no mapa
    if (options.createDestinationMarker !== false) {
      createDestinationMarker(
        destLat,
        destLon,
        options.destinationName || translate('destination')
      );
    }

    // Exibir a rota no mapa
    displayRoute(routeData, profile);

    // Esconder indicador de carregamento
    hideRouteLoading();

    // Armazenar a rota no estado da aplicação
    appState.set('route.current', routeData);
    appState.set('route.profile', profile);

    // Publicar evento de rota criada
    eventBus.publish(EVENT_TYPES.ROUTE_CREATED, {
      routeData,
      profile,
      start: { lat: startLat, lon: startLon },
      destination: { lat: destLat, lon: destLon },
    });

    // Salvar rota em cache se solicitado
    if (options.cache !== false) {
      cacheRouteData(routeData);
    }

    return routeData;
  } catch (error) {
    console.error('Erro ao criar rota:', error);

    // Esconder indicador de carregamento
    hideRouteLoading();

    // Mostrar notificação de erro
    showError(translate('createRouteError'));

    // Publicar evento de erro na criação da rota
    eventBus.publish(EVENT_TYPES.ROUTE_CREATION_ERROR, {
      error: error.message,
    });

    return null;
  }
}

/**
 * Processa os dados de rota recebidos da API para um formato padronizado
 * @param {Object} apiData - Dados brutos da API
 * @returns {Object} Dados de rota processados
 */
function processRouteData(apiData) {
  const feature = apiData.features[0];
  const geometry = feature.geometry;
  const properties = feature.properties;
  const summary = properties.summary;

  // Extrair coordenadas e converter para formato [lat, lon]
  const coordinates = geometry.coordinates.map(([lon, lat]) => ({ lat, lon }));

  // Processar instruções
  const segments = properties.segments || [];
  let instructions = [];

  segments.forEach((segment, segmentIndex) => {
    const steps = segment.steps || [];

    steps.forEach((step, stepIndex) => {
      const stepInstruction = {
        index: instructions.length,
        text: step.instruction,
        distance: step.distance,
        duration: step.duration,
        type: step.type,
        maneuver: step.maneuver,
        name: step.name || '',
        location:
          step.location || step.way_points
            ? coordinates[step.way_points[0]]
            : null,
        segmentIndex,
        stepIndex,
      };

      instructions.push(stepInstruction);
    });
  });

  // Criar objeto de rota padronizado
  return {
    distance: summary.distance,
    duration: summary.duration,
    coordinates,
    instructions,
    bounds: properties.bbox
      ? [
          { lat: properties.bbox[1], lon: properties.bbox[0] },
          { lat: properties.bbox[3], lon: properties.bbox[2] },
        ]
      : null,
    raw: apiData, // Mantém os dados brutos para referência futura se necessário
  };
}

/**
 * Exibe uma rota no mapa
 * @param {Object} routeData - Dados da rota a ser exibida
 * @param {string} [profile='foot-walking'] - Perfil de navegação
 */
export function displayRoute(routeData, profile = 'foot-walking') {
  const map = getMap();
  if (!map) return;

  // Limpar camadas de rota existentes
  clearRouteFromMap();

  // Converter coordenadas para formato LeafletJS
  const latLngs = routeData.coordinates.map((coord) => [coord.lat, coord.lon]);

  // Obter estilo com base no perfil
  const routeStyle = getRouteStyleForProfile(profile);

  // Criar a polyline
  const routeLine = L.polyline(latLngs, routeStyle).addTo(map);

  // Armazenar referência no estado
  appState.set('map.layers.currentRoute', routeLine);

  // Ajustar o mapa para mostrar toda a rota se houver bounds
  if (routeData.bounds) {
    const bounds = [
      [routeData.bounds[0].lat, routeData.bounds[0].lon],
      [routeData.bounds[1].lat, routeData.bounds[1].lon],
    ];
    map.fitBounds(bounds, { padding: [50, 50] });
  } else {
    // Fallback se não houver bounds
    map.fitBounds(routeLine.getBounds(), { padding: [50, 50] });
  }

  // Publicar evento de rota exibida
  eventBus.publish(EVENT_TYPES.ROUTE_DISPLAYED, { routeData });

  return routeLine;
}

/**
 * Limpa a rota atual do mapa
 */
export function clearRouteFromMap() {
  const map = getMap();
  if (!map) return;

  // Remover a camada da rota atual
  const currentRoute = appState.get('map.layers.currentRoute');
  if (currentRoute) {
    map.removeLayer(currentRoute);
    appState.set('map.layers.currentRoute', null);
  }

  // Remover qualquer destaque de segmento
  const highlightedSegment = appState.get('map.layers.highlightedSegment');
  if (highlightedSegment) {
    map.removeLayer(highlightedSegment);
    appState.set('map.layers.highlightedSegment', null);
  }

  // Remover qualquer destaque de passo
  const highlightedStep = appState.get('map.layers.highlightedStep');
  if (highlightedStep) {
    map.removeLayer(highlightedStep);
    appState.set('map.layers.highlightedStep', null);
  }
}

/**
 * Obtém o estilo da rota com base no perfil de navegação
 * @param {string} profile - Perfil de navegação
 * @returns {Object} Objeto de estilo para a polyline
 */
function getRouteStyleForProfile(profile) {
  // Estilos base para os diferentes perfis
  const styles = {
    'foot-walking': MAP_CONFIG.ROUTE_STYLES.PRIMARY,
    'cycling-regular': {
      ...MAP_CONFIG.ROUTE_STYLES.PRIMARY,
      color: 'green',
      dashArray: '15,10',
    },
    'driving-car': {
      ...MAP_CONFIG.ROUTE_STYLES.PRIMARY,
      color: 'purple',
      dashArray: '5,15',
    },
  };

  return styles[profile] || MAP_CONFIG.ROUTE_STYLES.PRIMARY;
}

/**
 * Exibe rotas alternativas no mapa
 * @param {Array} routeOptions - Array de objetos de rota
 * @returns {Array} Array de camadas de rota
 */
export function showRouteAlternatives(routeOptions) {
  const map = getMap();
  if (!map) return [];

  // Limpar alternativas existentes
  clearRouteAlternatives();

  // Cores para as rotas alternativas
  const colors = ['#2196F3', '#4CAF50', '#9C27B0', '#FF9800'];

  // Array para armazenar as camadas criadas
  const alternativeRoutes = [];

  // Criar polylines para cada rota alternativa
  routeOptions.forEach((option, index) => {
    const color = colors[index % colors.length];

    // Converter coordenadas para formato LeafletJS
    const latLngs = option.routeData.coordinates.map((coord) => [
      coord.lat,
      coord.lon,
    ]);

    // Criar a polyline com estilo personalizado
    const polyline = L.polyline(latLngs, {
      color: color,
      weight: 4,
      opacity: 0.7,
      dashArray: '5,8',
    }).addTo(map);

    // Adicionar popup com informações sobre a rota
    const distance = formatDistance(option.routeData.distance);
    const duration = formatDuration(option.routeData.duration);

    polyline.bindPopup(`
      <div class="route-alternative-popup">
        <strong>${option.profile}</strong>
        <div>${translate('route_distance')}: ${distance}</div>
        <div>${translate('route_eta')}: ${duration}</div>
        <button class="select-route-btn" data-index="${index}">${translate(
          'select'
        )}</button>
      </div>
    `);

    // Evento para seleção da rota através do popup
    polyline.on('popupopen', (e) => {
      setTimeout(() => {
        const popupContainer = e.popup._container;
        if (popupContainer) {
          const button = popupContainer.querySelector('.select-route-btn');
          if (button) {
            button.addEventListener('click', () => {
              selectRouteAlternative(index);
              map.closePopup();
            });
          }
        }
      }, 100);
    });

    // Armazenar referência à polyline
    alternativeRoutes.push(polyline);
  });

  // Armazenar referências no estado
  appState.set('map.layers.alternatives', alternativeRoutes);
  appState.set('route.alternatives', routeOptions);

  // Calcular os limites para todas as rotas
  if (alternativeRoutes.length > 0) {
    const group = L.featureGroup(alternativeRoutes);
    map.fitBounds(group.getBounds(), { padding: [50, 50] });
  }

  // Publicar evento
  eventBus.publish(EVENT_TYPES.ROUTE_ALTERNATIVES_DISPLAYED, {
    count: alternativeRoutes.length,
  });

  return alternativeRoutes;
}

/**
 * Limpa as rotas alternativas do mapa
 */
export function clearRouteAlternatives() {
  const map = getMap();
  if (!map) return;

  // Remover as camadas de rotas alternativas
  const alternatives = appState.get('map.layers.alternatives') || [];
  alternatives.forEach((route) => {
    if (route) {
      map.removeLayer(route);
    }
  });

  // Limpar referências no estado
  appState.set('map.layers.alternatives', []);
}

/**
 * Seleciona uma rota alternativa
 * @param {number} index - Índice da rota alternativa
 */
export function selectRouteAlternative(index) {
  const alternatives = appState.get('route.alternatives') || [];
  if (index < 0 || index >= alternatives.length) return;

  // Obter a rota selecionada
  const selectedRoute = alternatives[index];

  // Exibir a rota selecionada
  displayRoute(selectedRoute.routeData, selectedRoute.profile);

  // Atualizar o estado
  appState.set('route.current', selectedRoute.routeData);
  appState.set('route.profile', selectedRoute.profile);

  // Limpar as rotas alternativas do mapa
  clearRouteAlternatives();

  // Publicar evento
  eventBus.publish(EVENT_TYPES.ROUTE_ALTERNATIVE_SELECTED, {
    index,
    profile: selectedRoute.profile,
    routeData: selectedRoute.routeData,
  });

  // Mostrar notificação
  showSuccess(translate('routeSelected'));
}

/**
 * Recalcula a rota com base na posição atual do usuário
 * @param {number} currentLat - Latitude atual do usuário
 * @param {number} currentLon - Longitude atual do usuário
 * @param {number} destLat - Latitude do destino
 * @param {number} destLon - Longitude do destino
 * @param {Object} [options={}] - Opções adicionais
 * @returns {Promise<Object|null>} Nova rota ou null em caso de erro
 */
export async function recalculateRoute(
  currentLat,
  currentLon,
  destLat,
  destLon,
  options = {}
) {
  // Verificar cooldown para evitar recálculos frequentes demais
  const now = Date.now();
  if (now - lastRecalculationTime < RECALCULATION_COOLDOWN && !options.force) {
    console.log('Recálculo de rota ignorado (cooldown)');
    return null;
  }

  // Atualizar timestamp do último recálculo
  lastRecalculationTime = now;

  // Mostrar notificação
  showWarning(translate('recalculatingRoute'));

  // Publicar evento de recálculo iniciado
  eventBus.publish(EVENT_TYPES.ROUTE_RECALCULATION_STARTED, {
    current: { lat: currentLat, lon: currentLon },
    destination: { lat: destLat, lon: destLon },
  });

  // Obter o perfil atual ou usar o padrão
  const profile = appState.get('route.profile') || 'foot-walking';

  // Criar nova rota
  const routeData = await createRoute(
    currentLat,
    currentLon,
    destLat,
    destLon,
    profile,
    {
      showLoader: true,
      createDestinationMarker: false,
      ...options,
    }
  );

  if (routeData) {
    // Mostrar notificação de sucesso
    showSuccess(translate('routeRecalculatedOk'));

    // Publicar evento de recálculo concluído
    eventBus.publish(EVENT_TYPES.ROUTE_RECALCULATION_COMPLETED, { routeData });

    return routeData;
  }

  // Publicar evento de falha no recálculo
  eventBus.publish(EVENT_TYPES.ROUTE_RECALCULATION_ERROR);

  return null;
}

/**
 * Verifica se é necessário recalcular a rota
 * @param {number} currentLat - Latitude atual do usuário
 * @param {number} currentLon - Longitude atual do usuário
 * @returns {boolean} true se for necessário recalcular
 */
export function shouldRecalculateRoute(currentLat, currentLon) {
  // Verificar cooldown
  const now = Date.now();
  if (now - lastRecalculationTime < RECALCULATION_COOLDOWN) {
    return false;
  }

  // Obter rota atual
  const route = appState.get('route.current');
  if (!route || !route.coordinates || route.coordinates.length === 0) {
    return false;
  }

  // Encontrar o ponto mais próximo na rota
  const closestPoint = findClosestPointOnRoute(
    currentLat,
    currentLon,
    route.coordinates
  );

  // Se o desvio for maior que o limiar, recalcular
  return closestPoint.distance > RECALCULATION_THRESHOLD;
}

/**
 * Encontra o ponto mais próximo na rota
 * @param {number} lat - Latitude do ponto
 * @param {number} lon - Longitude do ponto
 * @param {Array} routeCoordinates - Array de coordenadas da rota
 * @returns {Object} Objeto com o ponto mais próximo e informações adicionais
 */
export function findClosestPointOnRoute(lat, lon, routeCoordinates) {
  let minDistance = Infinity;
  let closestPoint = null;
  let closestSegmentIndex = -1;
  let closestPointIndex = -1;
  let progress = 0;

  // Percorrer os segmentos da rota
  for (let i = 0; i < routeCoordinates.length - 1; i++) {
    const start = routeCoordinates[i];
    const end = routeCoordinates[i + 1];

    // Calcular o ponto mais próximo no segmento
    const projectedPoint = projectPointOnSegment(lat, lon, start, end);
    const distance = calculateDistance(
      lat,
      lon,
      projectedPoint.lat,
      projectedPoint.lon
    );

    if (distance < minDistance) {
      minDistance = distance;
      closestPoint = projectedPoint;
      closestSegmentIndex = i;
      closestPointIndex = i + projectedPoint.t; // Posição interpolada
    }
  }

  // Calcular o progresso na rota (0-1)
  if (closestSegmentIndex >= 0) {
    let distanceTraveled = 0;
    let totalDistance = 0;

    // Somar distâncias dos segmentos completos
    for (let i = 0; i < closestSegmentIndex; i++) {
      const segmentDistance = calculateDistance(
        routeCoordinates[i].lat,
        routeCoordinates[i].lon,
        routeCoordinates[i + 1].lat,
        routeCoordinates[i + 1].lon
      );
      distanceTraveled += segmentDistance;
      totalDistance += segmentDistance;
    }

    // Adicionar a distância parcial do segmento atual
    if (closestPoint && closestPoint.t !== undefined) {
      const currentSegmentLength = calculateDistance(
        routeCoordinates[closestSegmentIndex].lat,
        routeCoordinates[closestSegmentIndex].lon,
        routeCoordinates[closestSegmentIndex + 1].lat,
        routeCoordinates[closestSegmentIndex + 1].lon
      );
      distanceTraveled += currentSegmentLength * closestPoint.t;
      totalDistance += currentSegmentLength;
    }

    // Adicionar as distâncias dos segmentos restantes
    for (
      let i = closestSegmentIndex + 1;
      i < routeCoordinates.length - 1;
      i++
    ) {
      const segmentDistance = calculateDistance(
        routeCoordinates[i].lat,
        routeCoordinates[i].lon,
        routeCoordinates[i + 1].lat,
        routeCoordinates[i + 1].lon
      );
      totalDistance += segmentDistance;
    }

    // Calcular o progresso
    progress = totalDistance > 0 ? distanceTraveled / totalDistance : 0;
  }

  return {
    point: closestPoint,
    distance: minDistance,
    segmentIndex: closestSegmentIndex,
    pointIndex: closestPointIndex,
    progress,
  };
}

/**
 * Projeta um ponto em um segmento de reta
 * @param {number} lat - Latitude do ponto
 * @param {number} lon - Longitude do ponto
 * @param {Object} start - Ponto de início do segmento {lat, lon}
 * @param {Object} end - Ponto de fim do segmento {lat, lon}
 * @returns {Object} Ponto projetado no segmento
 */
function projectPointOnSegment(lat, lon, start, end) {
  // Caso especial: se os pontos de início e fim são praticamente os mesmos
  if (calculateDistance(start.lat, start.lon, end.lat, end.lon) < 1) {
    return { lat: start.lat, lon: start.lon, t: 0 };
  }

  // Vetores para o cálculo da projeção
  const x = lat - start.lat;
  const y = lon - start.lon;
  const dx = end.lat - start.lat;
  const dy = end.lon - start.lon;

  // Comprimento quadrado do segmento
  const segmentLengthSquared = dx * dx + dy * dy;

  // Parâmetro t da projeção (0 = início do segmento, 1 = fim do segmento)
  const t = Math.max(0, Math.min(1, (x * dx + y * dy) / segmentLengthSquared));

  // Coordenadas do ponto projetado
  const projectedLat = start.lat + t * dx;
  const projectedLon = start.lon + t * dy;

  return { lat: projectedLat, lon: projectedLon, t };
}

/**
 * Avança para o próximo passo da rota se o usuário estiver próximo
 * @param {number} userLat - Latitude do usuário
 * @param {number} userLon - Longitude do usuário
 * @returns {boolean} true se avançou para o próximo passo
 */
export function advanceToNextStepIfClose(userLat, userLon) {
  const route = appState.get('route.current');
  const currentStepIndex = appState.get('navigation.currentStepIndex') || 0;

  if (!route || !route.instructions || route.instructions.length === 0) {
    return false;
  }

  // Se já estamos no último passo, não há para onde avançar
  if (currentStepIndex >= route.instructions.length - 1) {
    return false;
  }

  // Obter o passo atual e o próximo
  const currentStep = route.instructions[currentStepIndex];
  const nextStep = route.instructions[currentStepIndex + 1];

  // Se não temos localização no próximo passo, não podemos verificar proximidade
  if (!nextStep.location) {
    return false;
  }

  // Calcular distância do usuário ao ponto do próximo passo
  const distance = calculateDistance(
    userLat,
    userLon,
    nextStep.location.lat,
    nextStep.location.lon
  );

  // Se estiver mais próximo do próximo passo do que do atual, avançar
  const PROXIMITY_THRESHOLD = 20; // metros
  if (distance < PROXIMITY_THRESHOLD) {
    // Avançar para o próximo passo
    goToInstructionStep(currentStepIndex + 1);
    return true;
  }

  return false;
}

/**
 * Define um passo específico como o passo atual de navegação
 * @param {number} stepIndex - Índice do passo
 */
export function goToInstructionStep(stepIndex) {
  const route = appState.get('route.current');

  if (!route || !route.instructions || route.instructions.length === 0) {
    console.warn('goToInstructionStep: Nenhuma instrução definida.');
    return;
  }

  // Limitar o índice entre 0 e o número de instruções - 1
  stepIndex = Math.max(0, Math.min(stepIndex, route.instructions.length - 1));

  // Atualizar o índice no estado
  appState.set('navigation.currentStepIndex', stepIndex);

  // Obter o passo
  const step = route.instructions[stepIndex];

  if (step) {
    // Atualizar a interface
    updateInstructionDisplay(route.instructions, stepIndex);

    // Falar a instrução
    speakInstruction(step.text);

    // Destacar o passo no mapa
    highlightNextStepInMap(step);

    // Publicar evento
    eventBus.publish(EVENT_TYPES.NAVIGATION_STEP_CHANGED, {
      index: stepIndex,
      step,
      total: route.instructions.length,
    });
  }
}

/**
 * Avança para o próximo passo da navegação
 */
export function nextInstructionStep() {
  const currentStepIndex = appState.get('navigation.currentStepIndex') || 0;
  goToInstructionStep(currentStepIndex + 1);
}

/**
 * Retrocede para o passo anterior da navegação
 */
export function prevInstructionStep() {
  const currentStepIndex = appState.get('navigation.currentStepIndex') || 0;
  goToInstructionStep(currentStepIndex - 1);
}

/**
 * Atualiza a exibição das instruções na interface
 * @param {Array} instructions - Array de instruções
 * @param {number} currentIndex - Índice da instrução atual
 */
function updateInstructionDisplay(instructions, currentIndex) {
  // Esta função será implementada no módulo de UI
  eventBus.publish(EVENT_TYPES.INSTRUCTION_DISPLAY_UPDATE_NEEDED, {
    instructions,
    currentIndex,
  });
}

/**
 * Fala uma instrução usando a API de síntese de voz
 * @param {string} text - Texto a ser falado
 * @param {string} [lang='pt-BR'] - Idioma
 */
export function speakInstruction(text, lang = 'pt-BR') {
  // Verificar se a síntese de voz está disponível
  if (!('speechSynthesis' in window)) {
    console.warn('API de síntese de voz não disponível');
    return;
  }

  // Verificar se a navegação por voz está ativada
  if (appState.get('config.voiceGuidance') === false) {
    return;
  }

  // Cancelar falas anteriores
  window.speechSynthesis.cancel();

  // Criar nova instância de fala
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = lang;
  utterance.volume = 1;
  utterance.rate = 1;
  utterance.pitch = 1;

  // Falar
  window.speechSynthesis.speak(utterance);
}

/**
 * Exibe o indicador de carregamento da rota
 * @param {number} [timeout=15000] - Tempo limite em ms
 */
function showRouteLoading(timeout = 15000) {
  // Publicar evento para exibir o indicador
  eventBus.publish(EVENT_TYPES.ROUTE_LOADING_STARTED);

  // Configurar timeout
  const timeoutId = setTimeout(() => {
    hideRouteLoading();
    showError(translate('routeLoadTimeout'));
  }, timeout);

  // Armazenar ID do timeout no estado
  appState.set('route.loadingTimeoutId', timeoutId);
}

/**
 * Esconde o indicador de carregamento da rota
 */
function hideRouteLoading() {
  // Cancelar timeout se existir
  const timeoutId = appState.get('route.loadingTimeoutId');
  if (timeoutId) {
    clearTimeout(timeoutId);
    appState.set('route.loadingTimeoutId', null);
  }

  // Publicar evento para esconder o indicador
  eventBus.publish(EVENT_TYPES.ROUTE_LOADING_ENDED);
}

/**
 * Valida coordenadas geográficas
 * @param {number} lat - Latitude
 * @param {number} lon - Longitude
 * @returns {boolean} true se as coordenadas forem válidas
 */
function validateCoordinates(lat, lon) {
  return (
    typeof lat === 'number' &&
    typeof lon === 'number' &&
    !isNaN(lat) &&
    !isNaN(lon) &&
    lat >= -90 &&
    lat <= 90 &&
    lon >= -180 &&
    lon <= 180
  );
}

/**
 * Salva os dados da rota no cache
 * @param {Object} routeData - Dados da rota
 */
function cacheRouteData(routeData) {
  if (typeof localStorage === 'undefined') return;

  try {
    const cacheData = {
      routeData,
      timestamp: Date.now(),
    };

    localStorage.setItem('cachedRoute', JSON.stringify(cacheData));
    console.log('Rota salva no cache');
  } catch (error) {
    console.error('Erro ao salvar rota no cache:', error);
  }
}

/**
 * Carrega uma rota do cache
 * @returns {Object|null} Dados da rota ou null se não houver cache
 */
export function loadRouteFromCache() {
  if (typeof localStorage === 'undefined') return null;

  try {
    const cacheDataStr = localStorage.getItem('cachedRoute');
    if (!cacheDataStr) return null;

    const cacheData = JSON.parse(cacheDataStr);

    // Verificar se o cache expirou (24 horas)
    const now = Date.now();
    const cacheAge = now - (cacheData.timestamp || 0);
    const MAX_CACHE_AGE = 24 * 60 * 60 * 1000; // 24 horas

    if (cacheAge > MAX_CACHE_AGE) {
      localStorage.removeItem('cachedRoute');
      return null;
    }

    return cacheData.routeData;
  } catch (error) {
    console.error('Erro ao carregar rota do cache:', error);
    return null;
  }
}

/**
 * Verifica se o usuário chegou ao destino
 * @param {number} userLat - Latitude do usuário
 * @param {number} userLon - Longitude do usuário
 * @param {number} destLat - Latitude do destino
 * @param {number} destLon - Longitude do destino
 * @param {number} [threshold=30] - Distância em metros considerada como "chegada"
 * @returns {boolean} true se o usuário chegou ao destino
 */
export function hasReachedDestination(
  userLat,
  userLon,
  destLat,
  destLon,
  threshold = 30
) {
  const distance = calculateDistance(userLat, userLon, destLat, destLon);
  return distance <= threshold;
}

/**
 * Gera uma estimativa de tempo de chegada
 * @param {Object} routeData - Dados da rota
 * @param {number} progress - Progresso atual na rota (0-1)
 * @returns {Object} Objeto com hora e minutos restantes
 */
export function estimateArrivalTime(routeData, progress = 0) {
  if (!routeData || typeof routeData.duration !== 'number') {
    return {
      time: null,
      remainingMinutes: 0,
    };
  }

  // Calcular o tempo restante com base no progresso
  const remainingSeconds = routeData.duration * (1 - progress);
  const remainingMinutes = Math.ceil(remainingSeconds / 60);

  // Calcular o horário de chegada
  const now = new Date();
  const arrivalTime = new Date(now.getTime() + remainingSeconds * 1000);

  return {
    time: arrivalTime,
    remainingMinutes,
  };
}

// Exportar funções
export default {
  createRoute,
  displayRoute,
  clearRouteFromMap,
  showRouteAlternatives,
  clearRouteAlternatives,
  selectRouteAlternative,
  recalculateRoute,
  shouldRecalculateRoute,
  findClosestPointOnRoute,
  advanceToNextStepIfClose,
  goToInstructionStep,
  nextInstructionStep,
  prevInstructionStep,
  speakInstruction,
  loadRouteFromCache,
  hasReachedDestination,
  estimateArrivalTime,
};
