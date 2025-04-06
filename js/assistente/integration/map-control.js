// Adicionar estes dados ao início do arquivo
const localPOIData = {
  beaches: [
    {
      id: 1,
      name: 'Primeira Praia',
      lat: -13.3778,
      lon: -38.9132,
      tags: {
        natural: 'beach',
        description:
          'Praia com águas agitadas, ideal para surf. Mais próxima da vila.',
      },
    },
    {
      id: 2,
      name: 'Segunda Praia',
      lat: -13.3825,
      lon: -38.9138,
      tags: {
        natural: 'beach',
        description:
          'Praia movimentada com muitos bares e restaurantes. Centro da vida social.',
      },
    },
    {
      id: 3,
      name: 'Terceira Praia',
      lat: -13.3865,
      lon: -38.9088,
      tags: {
        natural: 'beach',
        description:
          'Águas calmas e cristalinas, ótimas para banho. Pousadas e restaurantes.',
      },
    },
    {
      id: 4,
      name: 'Quarta Praia',
      lat: -13.3915,
      lon: -38.9046,
      tags: {
        natural: 'beach',
        description:
          'Praia mais tranquila e extensa. Piscinas naturais na maré baixa.',
      },
    },
  ],
  touristSpots: [
    {
      id: 11,
      name: 'Farol de Morro de São Paulo',
      lat: -13.3764,
      lon: -38.9137,
      tags: {
        tourism: 'attraction',
        description: 'Farol histórico com vista panorâmica da ilha.',
      },
    },
    {
      id: 12,
      name: 'Toca do Morcego',
      lat: -13.3775,
      lon: -38.9143,
      tags: {
        tourism: 'attraction',
        description: 'Caverna natural com vista para o mar e pôr do sol.',
      },
    },
  ],
  restaurants: [
    {
      id: 21,
      name: 'Restaurante Sambass',
      lat: -13.3865,
      lon: -38.9088,
      tags: {
        amenity: 'restaurant',
        cuisine: 'seafood',
        description: 'Especializado em frutos do mar frescos.',
      },
    },
  ],
};

// Implementação do controle do mapa pelo assistente

export function setupMapIntegration(map, config) {
  const { stateManager, language } = config;

  // Verificar se o mapa é válido
  if (!map) {
    console.error('Assistente: Mapa não fornecido para integração');
    return null;
  }

  // Variáveis para controle de marcadores e rotas
  let currentMarkers = [];
  let currentRoute = null;
  let navigationActive = false;
  let locationWatcher = null;

  // Ícones personalizados
  const userIcon = L.divIcon({
    className: 'user-location-marker',
    html: '<i class="fas fa-circle"></i>',
    iconSize: [20, 20],
  });

  const destinationIcon = L.divIcon({
    className: 'destination-marker',
    html: '<i class="fas fa-map-marker-alt"></i>',
    iconSize: [30, 30],
  });

  // Métodos de integração com o mapa
  return {
    // Mostrar localização no mapa
    showLocation: async (locationData) => {
      try {
        console.log('Assistente: Mostrando localização', locationData);

        // Pode receber um objeto com lat/lon ou uma string (nome do local)
        let coordinates;
        let locationName;

        if (typeof locationData === 'string') {
          locationName = locationData;
          coordinates = await getCoordinatesForLocation(locationName);
          if (!coordinates) {
            throw new Error(
              `Não foi possível encontrar coordenadas para: ${locationName}`
            );
          }
        } else {
          coordinates = locationData;
          locationName = locationData.name || 'Local selecionado';
        }

        // Centralizar o mapa
        map.setView([coordinates.lat, coordinates.lon], 16);

        // Limpar marcadores existentes
        clearMarkers();

        // Adicionar novo marcador
        addLocationMarker(coordinates.lat, coordinates.lon, locationName);

        return true;
      } catch (error) {
        console.error(`Erro ao mostrar localização:`, error);
        return false;
      }
    },

    // Criar rota para um destino
    createRoute: async (destination) => {
      try {
        console.log('Assistente: Criando rota para', destination);

        // Obter posição atual do usuário
        const userLocation = await getCurrentLocation();
        if (!userLocation) {
          throw new Error('Não foi possível obter sua localização atual');
        }

        // Se destino for string, obter coordenadas
        let destCoords;
        if (typeof destination === 'string') {
          destCoords = await getCoordinatesForLocation(destination);
          if (!destCoords) {
            throw new Error(
              `Não foi possível encontrar coordenadas para: ${destination}`
            );
          }
        } else {
          destCoords = destination;
        }

        // Calcular e exibir a rota
        const route = await calculateRoute(
          [userLocation.latitude, userLocation.longitude],
          [destCoords.lat, destCoords.lon]
        );

        // Exibir rota no mapa
        showRouteOnMap(route);

        // Exibir resumo da rota
        displayRouteSummary(route);

        // Armazenar no estado para uso posterior
        stateManager.set('currentRoute', route);
        currentRoute = route;

        return true;
      } catch (error) {
        console.error('Erro ao criar rota:', error);
        return false;
      }
    },

    // Iniciar navegação
    startNavigation: async () => {
      try {
        console.log('Assistente: Iniciando navegação');

        // Verificar se há uma rota ativa
        if (!currentRoute && !stateManager.get('currentRoute')) {
          throw new Error('Nenhuma rota ativa para iniciar navegação');
        }

        const routeData = currentRoute || stateManager.get('currentRoute');

        // Inicializar estado de navegação
        navigationActive = true;
        stateManager.set('navigationActive', true);

        // Configurar monitor de localização
        setupLocationTracking();

        // Exibir interface de navegação
        showNavigationInterface(routeData);

        return true;
      } catch (error) {
        console.error('Erro ao iniciar navegação:', error);
        return false;
      }
    },

    // Cancelar navegação
    cancelNavigation: () => {
      if (locationWatcher) {
        navigator.geolocation.clearWatch(locationWatcher);
        locationWatcher = null;
      }

      navigationActive = false;
      stateManager.set('navigationActive', false);

      // Ocultar interface de navegação
      hideNavigationInterface();

      return true;
    },

    // Mostrar categoria
    showCategory: async (category) => {
      try {
        console.log('Assistente: Mostrando categoria', category);

        // Obter query OSM para a categoria
        const osmQuery = getOSMQueryForCategory(category);

        let data;

        try {
          // Tentar buscar dados OSM
          if (osmQuery) {
            data = await fetchOSMData(osmQuery);
          } else {
            throw new Error('Query não encontrada');
          }

          // Verificar se retornou dados
          if (!data || !data.elements || data.elements.length === 0) {
            throw new Error('Sem resultados online');
          }
        } catch (osmError) {
          console.warn(
            `Falha ao obter dados online para ${category}, usando dados locais:`,
            osmError
          );

          // Usar dados locais como fallback
          if (localPOIData[category]) {
            // Converter dados locais para formato compatível com OSM
            data = {
              elements: localPOIData[category].map((poi) => ({
                id: poi.id,
                type: 'node',
                lat: poi.lat,
                lon: poi.lon,
                tags: poi.tags,
              })),
            };
            console.log(
              `Usando ${data.elements.length} dados locais para ${category}`
            );
          } else {
            throw new Error(
              `Sem dados online ou locais para categoria: ${category}`
            );
          }
        }

        // Processar e exibir resultados
        const results = displayCategoryResults(data, category);
        return results.length > 0;
      } catch (error) {
        console.error(`Erro ao mostrar categoria ${category}:`, error);
        return false;
      }
    },

    // Buscar atrações próximas
    findNearbyAttractions: async (location, radius = 500) => {
      try {
        // Buscar POIs próximos à localização do usuário
        const query = `
          [out:json];
          (
            node["tourism"](around:${radius},${location.latitude},${location.longitude});
            node["amenity"="restaurant"](around:${radius},${location.latitude},${location.longitude});
            node["natural"="beach"](around:${radius},${location.latitude},${location.longitude});
          );
          out body;
        `;

        const data = await fetchOSMData(query);
        if (!data || !data.elements || data.elements.length === 0) {
          return [];
        }

        // Processar resultados
        return data.elements
          .map((element) => {
            // Calcular distância
            const distance = calculateDistance(
              location.latitude,
              location.longitude,
              element.lat,
              element.lon
            );

            return {
              id: element.id,
              name: element.tags?.name || 'Local sem nome',
              type:
                element.tags?.tourism ||
                element.tags?.amenity ||
                element.tags?.natural,
              lat: element.lat,
              lon: element.lon,
              distance: Math.round(distance),
            };
          })
          .filter((item) => item.name !== 'Local sem nome')
          .sort((a, b) => a.distance - b.distance);
      } catch (error) {
        console.error('Erro ao buscar atrações próximas:', error);
        return [];
      }
    },

    // Responder a evento do menu
    handleFeatureSelection: (feature) => {
      console.log('Assistente: Manipulando seleção de feature', feature);

      // Mapear feature para categoria
      const categoryMap = {
        touristSpots: 'touristSpots',
        beaches: 'beaches',
        restaurants: 'restaurants',
        inns: 'inns',
        shops: 'shops',
        nightlife: 'nightlife',
        tours: 'tours',
        emergencies: 'emergencies',
      };

      const category = categoryMap[feature] || feature;

      return this.showCategory(category);
    },
  };

  // Funções auxiliares locais
  async function getCoordinatesForLocation(locationName) {
    try {
      // Usar Nominatim para geocodificação (limitar à área de Morro de São Paulo)
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(locationName)}+Morro+de+São+Paulo&format=json&limit=1`
      );

      if (!response.ok) {
        throw new Error(`Erro na resposta: ${response.status}`);
      }

      const data = await response.json();
      if (data.length === 0) {
        return null;
      }

      return {
        lat: parseFloat(data[0].lat),
        lon: parseFloat(data[0].lon),
      };
    } catch (error) {
      console.error('Erro ao obter coordenadas:', error);
      return null;
    }
  }

  function addLocationMarker(lat, lon, name) {
    // Adicionar marcador no mapa
    const marker = L.marker([lat, lon], {
      icon: destinationIcon,
    }).addTo(map);

    // Adicionar popup com o nome
    marker.bindPopup(name).openPopup();

    // Adicionar à lista de marcadores
    currentMarkers.push(marker);

    return marker;
  }

  function clearMarkers() {
    // Remover todos os marcadores atuais
    currentMarkers.forEach((marker) => {
      map.removeLayer(marker);
    });

    currentMarkers = [];
  }

  function getCurrentLocation() {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocalização não suportada pelo navegador'));
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy,
          });
        },
        (error) => {
          reject(new Error(`Erro ao obter localização: ${error.message}`));
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0,
        }
      );
    });
  }

  async function calculateRoute(origin, destination) {
    try {
      // Usar OSRM para cálculo de rota
      const url = `https://router.project-osrm.org/route/v1/walking/${origin[1]},${origin[0]};${destination[1]},${destination[0]}?overview=full&geometries=geojson&steps=true`;

      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Erro na resposta: ${response.status}`);
      }

      const data = await response.json();
      if (data.code !== 'Ok' || !data.routes || data.routes.length === 0) {
        throw new Error('Não foi possível calcular a rota');
      }

      const route = data.routes[0];

      return {
        geometry: route.geometry,
        duration: route.duration,
        distance: route.distance,
        steps: route.legs[0].steps,
      };
    } catch (error) {
      console.error('Erro ao calcular rota:', error);
      throw error;
    }
  }

  function showRouteOnMap(route) {
    // Limpar rota atual se existir
    if (currentRoute && currentRoute.polyline) {
      map.removeLayer(currentRoute.polyline);
    }

    // Criar e adicionar a polyline
    const polyline = L.geoJSON(route.geometry, {
      style: {
        color: '#3388ff',
        weight: 6,
        opacity: 0.7,
      },
    }).addTo(map);

    // Ajustar a visualização
    map.fitBounds(polyline.getBounds(), {
      padding: [50, 50],
    });

    // Armazenar a polyline
    route.polyline = polyline;
    currentRoute = route;

    return polyline;
  }

  function displayRouteSummary(route) {
    // Formatar distância e duração
    const distance =
      route.distance < 1000
        ? `${Math.round(route.distance)} m`
        : `${(route.distance / 1000).toFixed(1)} km`;

    const duration =
      route.duration < 60
        ? `${Math.round(route.duration)} segundos`
        : route.duration < 3600
          ? `${Math.floor(route.duration / 60)} minutos`
          : `${Math.floor(route.duration / 3600)} horas e ${Math.floor((route.duration % 3600) / 60)} minutos`;

    console.log(`Rota: ${distance} - ${duration}`);

    // Aqui você pode implementar a exibição do resumo na interface
    // ou retornar os dados para o assistente exibir
    return { distance, duration };
  }

  function setupLocationTracking() {
    // Cancelar tracking anterior se existir
    if (locationWatcher) {
      navigator.geolocation.clearWatch(locationWatcher);
    }

    // Iniciar novo tracking
    locationWatcher = navigator.geolocation.watchPosition(
      updateUserPosition,
      handleLocationError,
      {
        enableHighAccuracy: true,
        maximumAge: 10000,
        timeout: 10000,
      }
    );
  }

  function updateUserPosition(position) {
    const { latitude, longitude, heading } = position.coords;

    // Atualizar estado
    stateManager.setUserLocation({
      latitude,
      longitude,
      heading: heading || null,
      timestamp: new Date().getTime(),
    });

    // Se houver navegação ativa, atualizar a visualização
    if (navigationActive) {
      // Atualizar marcador do usuário
      // Verificar progresso na rota
      // Atualizar instruções
    }
  }

  function handleLocationError(error) {
    console.error('Erro de geolocalização:', error);
    // Implementar tratamento de erro
  }

  function showNavigationInterface(routeData) {
    // Implementação da interface de navegação
    console.log('Exibindo interface de navegação');
  }

  function hideNavigationInterface() {
    // Ocultar interface de navegação
    console.log('Ocultando interface de navegação');
  }

  function getOSMQueryForCategory(category) {
    // Mapeamento de categorias para queries OSM
    const queries = {
      touristSpots: `
        [out:json];
        // Buscar diretamente por coordenadas em vez de área
        (
          node["tourism"="attraction"](around:5000,-13.3831,-38.9134);
          way["tourism"="attraction"](around:5000,-13.3831,-38.9134);
        );
        out body;
        >;
        out skel qt;
      `,
      beaches: `
        [out:json];
        // Coordenadas centrais de Morro de São Paulo
        (
          node["natural"="beach"](around:5000,-13.3831,-38.9134);
          way["natural"="beach"](around:5000,-13.3831,-38.9134);
          // Adicionar praias manualmente para garantir resultados
          node(id:7839567934,7752690164,4394029747);
        );
        out body;
        >;
        out skel qt;
      `,
      restaurants: `
        [out:json];
        (
          node["amenity"="restaurant"](around:5000,-13.3831,-38.9134);
          way["amenity"="restaurant"](around:5000,-13.3831,-38.9134);
        );
        out body;
        >;
        out skel qt;
      `,
      // Adicionar outras categorias conforme necessário
    };

    return queries[category] || null;
  }

  async function fetchOSMData(query) {
    try {
      const endpoint = 'https://overpass-api.de/api/interpreter';
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: `data=${encodeURIComponent(query)}`,
      });

      if (!response.ok) {
        throw new Error(`Erro na resposta: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Erro ao buscar dados OSM:', error);
      throw error;
    }
  }

  function displayCategoryResults(data, category) {
    if (!data || !data.elements || data.elements.length === 0) {
      console.warn(`Nenhum resultado encontrado para ${category}`);
      return [];
    }

    // Limpar marcadores existentes
    clearMarkers();

    // Processar elementos
    const results = [];

    data.elements.forEach((element) => {
      if (element.type === 'node' && element.lat && element.lon) {
        const name = element.tags?.name || `Local em ${category}`;

        // Adicionar marcador
        const marker = addLocationMarker(element.lat, element.lon, name);

        // Adicionar ao array de resultados
        results.push({
          id: element.id,
          name,
          lat: element.lat,
          lon: element.lon,
          tags: element.tags || {},
        });
      }
    });

    // Ajustar visualização se houver resultados
    if (results.length > 0) {
      // Criar bounds para todos os marcadores
      const group = new L.featureGroup(currentMarkers);
      map.fitBounds(group.getBounds().pad(0.1));
    }

    return results;
  }

  function calculateDistance(lat1, lon1, lat2, lon2) {
    // Implementação da fórmula de Haversine
    const R = 6371e3; // raio da Terra em metros
    const φ1 = (lat1 * Math.PI) / 180;
    const φ2 = (lat2 * Math.PI) / 180;
    const Δφ = ((lat2 - lat1) * Math.PI) / 180;
    const Δλ = ((lon2 - lon1) * Math.PI) / 180;

    const a =
      Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
      Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c; // em metros
  }
}

// Função para logging detalhado
function logDebug(message, data) {
  console.log(`Map Control: ${message}`, data);

  // Adicionar ao DOM para debugging em dispositivos móveis
  const debugLog = document.getElementById('debug-log');
  if (debugLog) {
    const logItem = document.createElement('div');
    logItem.className = 'debug-log-item';
    logItem.textContent = `${new Date().toLocaleTimeString()} - ${message}`;
    debugLog.appendChild(logItem);

    // Limitar o número de itens de log
    if (debugLog.children.length > 20) {
      debugLog.removeChild(debugLog.firstChild);
    }
  }
}

// Substituir funções de API por mocks para desenvolvimento
function mockFetchOSMData(query) {
  logDebug(`Mockando dados OSM para: ${query.substring(0, 50)}...`);

  // Extrair categoria da query
  let category = 'unknown';
  if (query.includes('"tourism"="attraction"')) {
    category = 'touristSpots';
  } else if (query.includes('"natural"="beach"')) {
    category = 'beaches';
  } else if (query.includes('"amenity"="restaurant"')) {
    category = 'restaurants';
  }

  // Retornar dados mockados
  return Promise.resolve({
    elements: localPOIData[category]
      ? localPOIData[category].map((poi) => ({
          id: poi.id,
          type: 'node',
          lat: poi.lat,
          lon: poi.lon,
          tags: poi.tags,
        }))
      : [],
  });
}

// Substitua fetchOSMData pelo mock em ambiente de desenvolvimento
if (
  window.location.hostname === 'localhost' ||
  window.location.hostname === '127.0.0.1'
) {
  console.log('Ambiente de desenvolvimento detectado, usando mocks para APIs');
  // Armazenar a função original
  const originalFetchOSMData = fetchOSMData;
  // Substituir por mock
  fetchOSMData = mockFetchOSMData;
}

/**
 * Busca dados do OpenStreetMap usando a API Overpass
 * @param {string} query - Query Overpass para buscar dados
 * @returns {Promise<Object>} Dados retornados pela API
 */
/**
 * 1. fetchOSMData - Busca dados do OSM utilizando a Overpass API.
 */
async function fetchOSMData(query) {
  try {
    const overpassUrl = `https://overpass-api.de/api/interpreter?data=${encodeURIComponent(query)}`;
    console.log('[fetchOSMData] Iniciando busca no Overpass-API:', overpassUrl);

    const response = await fetch(overpassUrl);
    if (!response.ok) {
      console.error(
        '[fetchOSMData] HTTP Erro Overpass:',
        response.status,
        response.statusText
      );
      showNotification(
        'Erro ao buscar dados OSM. Verifique sua conexão.',
        'error'
      );
      return null;
    }

    const data = await response.json();
    if (!data.elements || data.elements.length === 0) {
      console.warn('[fetchOSMData] Nenhum dado encontrado (elements vazio).');
      showNotification('Nenhum dado OSM encontrado para esta busca.', 'info');
      return null;
    }

    // Filtra apenas os dados essenciais
    const filteredData = data.elements.map((element) => ({
      lat: element.lat,
      lon: element.lon,
      name: element.tags.name || 'Sem nome',
      description: element.tags.description || 'Descrição não disponível',
      images: element.tags.images || [],
      feature:
        element.tags.tourism ||
        element.tags.amenity ||
        element.tags.natural ||
        'Desconhecido',
    }));

    console.log(`[fetchOSMData] Dados filtrados:`, filteredData);
    return filteredData;
  } catch (error) {
    console.error('[fetchOSMData] Erro geral ao buscar dados do OSM:', error);
    showNotification(
      'Ocorreu um erro ao buscar dados no OSM (Overpass).',
      'error'
    );
    return null;
  }
}
