/**
 * 1. setMapRotation
 /**
 * Rotaciona a camada de tiles do mapa de acordo com o heading.
 * Utiliza suavização e verifica se a rotação está habilitada.
 *
 * @param {number} heading - Ângulo atual em graus fornecido pelo dispositivo.
 */
export function setMapRotation(heading) {
  // Seleciona a camada de tiles do Leaflet
  const tileLayerElement = document.querySelector('.leaflet-tile-pane');
  if (!tileLayerElement) {
    console.warn('[setMapRotation] Camada de tiles não encontrada.');
    return;
  }
  // Se a navegação não estiver ativa ou a rotação estiver desabilitada, remove a rotação
  if (!navigationState.isActive || !navigationState.isRotationEnabled) {
    tileLayerElement.style.transform = 'none';
    return;
  }
  const now = Date.now();
  // Se em modo “quiet” e a velocidade for muito baixa ou o intervalo não tiver passado, não atualiza
  if (navigationState.quietMode) {
    if (navigationState.speed < 0.5) return;
    if (
      now - navigationState.lastRotationTime <
      navigationState.rotationInterval
    )
      return;
  }
  // Se houver override manual, aplica o ângulo manual
  if (navigationState.manualOverride) {
    applyRotationTransform(navigationState.manualAngle, navigationState.tilt);
    navigationState.lastRotationTime = now;
    console.log(
      '[setMapRotation] Rotação manual aplicada:',
      navigationState.manualAngle,
      'º'
    );
    return;
  }
  if (heading == null || isNaN(heading)) {
    console.warn('[setMapRotation] heading inválido => rotação não efetuada.');
    return;
  }
  // Ajusta o heading conforme o modo de rotação selecionado
  let desiredHeading = heading;
  if (navigationState.rotationMode === 'north-up') {
    desiredHeading = 0;
  } else {
    desiredHeading =
      desiredHeading < 0 ? (desiredHeading % 360) + 360 : desiredHeading % 360;
  }
  // Usa um buffer para suavizar as atualizações
  navigationState.headingBuffer.push(desiredHeading);
  if (navigationState.headingBuffer.length > 5) {
    navigationState.headingBuffer.shift();
  }
  const avgHeading =
    navigationState.headingBuffer.reduce((a, b) => a + b, 0) /
    navigationState.headingBuffer.length;
  const delta = Math.abs(avgHeading - navigationState.currentHeading);
  if (delta < navigationState.minRotationDelta) {
    return;
  }
  // Suaviza a rotação
  const smoothedHeading =
    navigationState.currentHeading +
    navigationState.alpha * (avgHeading - navigationState.currentHeading);
  navigationState.currentHeading = smoothedHeading;
  const tilt = navigationState.tilt;
  // Aplica a transformação à camada de tiles
  applyRotationTransform(smoothedHeading, tilt);
  navigationState.lastRotationTime = now;
  console.log(
    `[setMapRotation] heading final = ${smoothedHeading.toFixed(1)}°, tilt = ${tilt}`
  );
}

/**
 * applyRotationTransform(heading, tilt)
 * Aplica a transformação de rotação e tilt à camada de tiles do Leaflet.
 * Essa transformação não afeta os markers ou a posição real do mapa.
 */
function applyRotationTransform(heading, tilt) {
  // Seleciona a camada de tiles onde a rotação será aplicada
  const tilePane = document.querySelector('.leaflet-tile-pane');
  if (!tilePane) {
    console.warn('[applyRotationTransform] .leaflet-tile-pane não encontrado.');
    return;
  }
  // Define uma transição suave para a transformação
  tilePane.style.transition = 'transform 0.3s ease-out';
  tilePane.style.transformOrigin = 'center center';
  // Aplica a rotação e o tilt usando CSS (rotate e rotateX com perspectiva)
  tilePane.style.transform = `rotate(${heading}deg) perspective(1000px) rotateX(${tilt}deg)`;
}

/**
 * autoRotationAuto
 *
 * Atualiza a visualização do mapa para centralizar na localização atual do usuário e
 * inicia o processo de rotação automática da camada de tiles.
 *
 * Fluxo:
 * 1. Verifica se a variável global userLocation está definida.
 * 2. Chama updateMapWithUserLocation para reposicionar o mapa com base nas coordenadas reais.
 * 3. Se a propriedade heading estiver disponível em userLocation, aplica a rotação inicial
 *    usando setMapRotation. Isso garante que, logo no início, o mapa seja rotacionado
 *    de acordo com o heading atual do usuário.
 * 4. Chama startRotationAuto para ativar os eventos de deviceorientation, permitindo
 *    que o mapa atualize continuamente a rotação com base nas leituras do dispositivo.
 */
export function startRotationAuto() {
  console.log(
    '[startRotationAuto] Tentando ativar rotação automática do mapa...'
  );

  // Habilita a flag no navigationState (caso usemos em setMapRotation)
  if (navigationState) {
    navigationState.isRotationEnabled = true;
  }

  // Verifica se o dispositivo/navegador suportam DeviceOrientationEvent
  if (typeof DeviceOrientationEvent === 'undefined') {
    console.warn("[startRotationAuto] 'DeviceOrientationEvent' não suportado.");
    showNotification(
      'Rotação automática não suportada neste dispositivo.',
      'warning'
    );
    return;
  }

  // iOS >= 13 precisa de permissão
  if (
    DeviceOrientationEvent.requestPermission &&
    typeof DeviceOrientationEvent.requestPermission === 'function'
  ) {
    DeviceOrientationEvent.requestPermission()
      .then((response) => {
        if (response === 'granted') {
          console.log('[startRotationAuto] Permissão concedida para heading.');
          attachOrientationListener();
        } else {
          console.warn('[startRotationAuto] Permissão negada para heading.');
          showNotification('Rotação automática não autorizada.', 'warning');
        }
      })
      .catch((err) => {
        console.error('[startRotationAuto] Erro ao solicitar permissão:', err);
        showNotification(
          'Não foi possível ativar rotação automática.',
          'error'
        );
      });
  } else {
    // Se não exigir permissão, adiciona o listener diretamente
    attachOrientationListener();
  }

  function attachOrientationListener() {
    // Evita adicionar múltiplos listeners
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
    console.log(
      "[startRotationAuto] Evento 'deviceorientation' registrado com sucesso."
    );
  }

  function onDeviceOrientationChange(event) {
    const alpha = event.alpha; // tipicamente 0-360
    if (typeof alpha === 'number' && !isNaN(alpha)) {
      // Ajusta rotação do mapa
      setMapRotation(alpha);
    }
  }
}
/**
  
   * 2. stopRotationAuto
   * Desativa a rotação automática, remove listener e reseta a rotação do container se quiser.
  */
export function stopRotationAuto() {
  // Marca no state
  if (navigationState) {
    navigationState.isRotationEnabled = false;
  }

  window.removeEventListener(
    'deviceorientation',
    onDeviceOrientationChange,
    true
  );

  // Pode querer redefinir transform do map-container
  const mapContainer = document.getElementById('map-container');
  if (mapContainer) {
    mapContainer.style.transform = 'rotate(0deg)';
    mapContainer.style.transition = 'transform 0.3s ease-out';
  }

  console.log('[stopRotationAuto] Rotação automática desativada.');
}

/**
 * Recentraliza o mapa na localização do usuário.
 * @param {number} lat - Latitude do usuário.
 * @param {number} lon - Longitude do usuário.
 * @param {number} zoom - Nível de zoom.
 */
export function centerMapOnUser(lat, lon, zoom = 15) {
  if (map) {
    map.setView([lat, lon], zoom);
    console.log(`Mapa recentralizado no usuário: [${lat}, ${lon}]`);
  }
}

/**
 * Adiciona marcadores de pontos de interesse ao mapa
 * @param {Array} points - Pontos a serem adicionados
 */
export function addPointsOfInterest(points) {
  // Código existente...

  // Adicionar evento de clique
  markers.forEach((marker) => {
    marker.on('click', (e) => {
      // Código existente que mostra popup

      // Notificar assistente sobre ponto de interesse clicado
      if (
        window.assistantApi &&
        typeof window.assistantApi.checkAutoShowAtPoint === 'function'
      ) {
        const point = e.target.options.data;
        window.assistantApi.checkAutoShowAtPoint(
          { lat: point.coordinates[0], lng: point.coordinates[1] },
          point.name
        );
      }
    });
  });
}
