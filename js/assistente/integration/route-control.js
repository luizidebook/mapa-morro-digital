// route-control.js - Controle de rotas e navegação
export function setupRouteControl(map, config) {
  const { stateManager, language } = config;

  // Variáveis internas
  let currentRoute = null;
  let navigationActive = false;
  let currentStep = 0;
  let routePolyline = null;
  let userMarker = null;
  let destinationMarker = null;
  let locationWatcher = null;

  // API pública
  return {
    // Criar rota
    createRoute: async (origin, destination) => {
      try {
        // Validar parâmetros
        if (!origin || !destination) {
          throw new Error('Origem e destino são necessários');
        }

        // Limpar rota existente
        clearRoute();

        // Calcular nova rota
        const routeData = await calculateRouteFromAPI(origin, destination);
        if (!routeData || !routeData.geometry) {
          throw new Error('Não foi possível calcular a rota');
        }

        // Desenhar rota no mapa
        routePolyline = L.polyline(routeData.geometry, {
          color: '#3388ff',
          weight: 6,
          opacity: 0.8,
        }).addTo(map);

        // Adicionar marcadores
        userMarker = L.marker(origin, {
          icon: createUserIcon(),
        }).addTo(map);

        destinationMarker = L.marker(destination, {
          icon: createDestinationIcon(),
        }).addTo(map);

        // Ajustar visualização
        map.fitBounds(routePolyline.getBounds(), {
          padding: [50, 50],
        });

        // Armazenar rota atual
        currentRoute = routeData;
        stateManager.set('currentRoute', routeData);

        // Atualizar interface com resumo da rota
        displayRouteSummary(routeData);

        return routeData;
      } catch (error) {
        console.error('Erro ao criar rota:', error);
        showNotification(
          getAssistantText('routeCreationError', language),
          'error'
        );
        return null;
      }
    },

    // Iniciar navegação
    startNavigation: async () => {
      try {
        // Verificar se há uma rota
        if (!currentRoute) {
          throw new Error('Nenhuma rota ativa para iniciar navegação');
        }

        // Atualizar estado
        navigationActive = true;
        stateManager.set('navigationActive', true);
        currentStep = 0;

        // Atualizar interface
        showNavigationInterface();
        updateInstructionUI(currentRoute.instructions[currentStep]);

        // Iniciar monitoramento da localização
        if (locationWatcher) {
          navigator.geolocation.clearWatch(locationWatcher);
        }

        locationWatcher = navigator.geolocation.watchPosition(
          (position) => updateUserPosition(position),
          (error) => handleLocationError(error),
          {
            enableHighAccuracy: true,
            maximumAge: 5000,
            timeout: 10000,
          }
        );

        // Feedback ao usuário
        showNotification(
          getAssistantText('navigationStarted', language),
          'info'
        );

        return true;
      } catch (error) {
        console.error('Erro ao iniciar navegação:', error);
        showNotification(
          getAssistantText('navigationError', language),
          'error'
        );
        return false;
      }
    },

    // Terminar navegação
    stopNavigation: () => {
      try {
        // Limpar monitoramento
        if (locationWatcher) {
          navigator.geolocation.clearWatch(locationWatcher);
          locationWatcher = null;
        }

        // Atualizar estado
        navigationActive = false;
        stateManager.set('navigationActive', false);

        // Atualizar interface
        hideNavigationInterface();

        // Feedback ao usuário
        showNotification(
          getAssistantText('navigationStopped', language),
          'info'
        );

        return true;
      } catch (error) {
        console.error('Erro ao parar navegação:', error);
        return false;
      }
    },

    // Limpar rota atual
    clearRoute: () => {
      clearRoute();
      return true;
    },
  };

  // Funções auxiliares internas
  function clearRoute() {
    if (routePolyline) {
      map.removeLayer(routePolyline);
      routePolyline = null;
    }

    if (userMarker) {
      map.removeLayer(userMarker);
      userMarker = null;
    }

    if (destinationMarker) {
      map.removeLayer(destinationMarker);
      destinationMarker = null;
    }

    currentRoute = null;
    stateManager.set('currentRoute', null);

    hideRouteSummary();
  }

  async function calculateRouteFromAPI(origin, destination) {
    try {
      // Formatar coordenadas para a API
      const originStr = `${origin[1]},${origin[0]}`;
      const destStr = `${destination[1]},${destination[0]}`;

      // Chamada à API de rotas (exemplo usando OpenRouteService)
      const response = await fetch(
        `https://api.openrouteservice.org/v2/directions/foot-walking?api_key=${config.routeApiKey}&start=${originStr}&end=${destStr}`,
        {
          method: 'GET',
          headers: {
            Accept: 'application/json',
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Erro na API: ${response.status}`);
      }

      const data = await response.json();

      // Processar dados da rota
      return {
        geometry: decodePolyline(data.routes[0].geometry),
        duration: data.routes[0].summary.duration,
        distance: data.routes[0].summary.distance,
        instructions: processInstructions(data.routes[0].segments[0].steps),
      };
    } catch (error) {
      console.error('Erro ao calcular rota:', error);
      throw error;
    }
  }

  function updateUserPosition(position) {
    if (!navigationActive) return;

    const { latitude, longitude, heading } = position.coords;

    // Atualizar marcador do usuário
    if (userMarker) {
      userMarker.setLatLng([latitude, longitude]);
    } else {
      userMarker = L.marker([latitude, longitude], {
        icon: createUserIcon(),
      }).addTo(map);
    }

    // Centralizar mapa na posição do usuário
    map.panTo([latitude, longitude]);

    // Rotacionar mapa se heading estiver disponível
    if (heading !== null && !isNaN(heading)) {
      map.setBearing(heading);
    }

    // Verificar progresso na rota
    checkRouteProgress(latitude, longitude);
  }

  function checkRouteProgress(lat, lon) {
    if (!currentRoute || !navigationActive) return;

    // Calcular distância até próxima instrução
    const nextWaypoint = currentRoute.instructions[currentStep].coordinate;
    const distance = calculateDistance(
      lat,
      lon,
      nextWaypoint[0],
      nextWaypoint[1]
    );

    // Verificar se chegou ao ponto
    if (distance <= 15) {
      // 15 metros
      // Avançar para próxima instrução
      currentStep++;

      if (currentStep >= currentRoute.instructions.length) {
        // Chegou ao destino
        handleDestinationReached();
      } else {
        // Atualizar para próxima instrução
        updateInstructionUI(currentRoute.instructions[currentStep]);
      }
    }

    // Verificar se desviou da rota
    const routeDeviation = calculateRouteDeviation(
      lat,
      lon,
      currentRoute.geometry
    );
    if (routeDeviation > 50) {
      // 50 metros
      handleRouteDeviation();
    }
  }

  function handleDestinationReached() {
    showNotification(
      getAssistantText('destinationReached', language),
      'success'
    );

    // Parar navegação
    stopNavigation();

    // Evento para o assistente
    document.dispatchEvent(
      new CustomEvent('navigationCompleted', {
        detail: { destination: currentRoute.destination },
      })
    );
  }

  function handleRouteDeviation() {
    showNotification(getAssistantText('offRoute', language), 'warning');

    // Evento para o assistente
    document.dispatchEvent(
      new CustomEvent('routeDeviation', {
        detail: { recalculating: true },
      })
    );

    // Recalcular rota
    // ...
  }

  // ... outras funções auxiliares
}
