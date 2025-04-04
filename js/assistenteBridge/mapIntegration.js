/**
 * Integração do Assistente com Mapa OSM
 * Este módulo fornece funções específicas para integração com o mapa OpenStreetMap
 * através da biblioteca Leaflet.
 * Versão: 1.0.0
 */

import { showNotification } from '../ui/notifications.js';
import { getMapInstance } from '../map/mapManager.js';

// Referências para gerenciamento de objetos no mapa
let currentMarkers = [];
let currentRoutes = [];
let currentPopups = [];

/**
 * Mostra local no mapa e centraliza a visualização
 * @param {Object} location - Local a ser mostrado (com lat/lng ou coordenadas)
 * @param {Object} options - Opções adicionais
 * @returns {Object} Marcador criado
 */
export function showLocationOnMap(location, options = {}) {
  try {
    const map = getMapInstance();
    if (!map) {
      throw new Error('Mapa não disponível');
    }

    // Extrair coordenadas
    let coords;
    let name = '';

    if (typeof location === 'string') {
      // Considera que é um nome de local, tentar buscar
      return findAndShowLocationByName(location, options);
    } else if (location.lat && location.lng) {
      coords = [location.lat, location.lng];
      name = location.name || '';
    } else if (location.latitude && location.longitude) {
      coords = [location.latitude, location.longitude];
      name = location.name || '';
    } else if (Array.isArray(location) && location.length >= 2) {
      coords = [location[0], location[1]];
    } else {
      throw new Error('Formato de localização inválido');
    }

    // Opções padrão
    const defaultOptions = {
      zoom: true,
      zoomLevel: 16,
      showPopup: true,
      popupContent: name ? `<div><h4>${name}</h4></div>` : null,
      markerOptions: {},
      panTo: true,
      permanent: false,
    };

    const finalOptions = { ...defaultOptions, ...options };

    // Criar e adicionar marcador
    const marker = L.marker(coords, finalOptions.markerOptions).addTo(map);

    // Adicionar popup se necessário
    if (finalOptions.showPopup && finalOptions.popupContent) {
      const popup = marker.bindPopup(finalOptions.popupContent);
      if (finalOptions.openPopup) {
        popup.openPopup();
      }
      currentPopups.push(popup);
    }

    // Ajustar visualização
    if (finalOptions.panTo) {
      if (finalOptions.zoom) {
        map.setView(coords, finalOptions.zoomLevel);
      } else {
        map.panTo(coords);
      }
    }

    // Armazenar referência se não for permanente
    if (!finalOptions.permanent) {
      currentMarkers.push(marker);
    }

    return marker;
  } catch (error) {
    console.error('Erro ao mostrar local no mapa:', error);
    showNotification('Não foi possível mostrar o local no mapa', 'error');
    return null;
  }
}

/**
 * Busca e mostra local por nome
 * @param {string} locationName - Nome do local a ser buscado
 * @param {Object} options - Opções para exibição
 * @returns {Object|null} Marcador criado ou null se não encontrado
 */
export function findAndShowLocationByName(locationName, options = {}) {
  try {
    // Esta função seria idealmente integrada com seu banco de dados
    // de locais ou uma API de geocodificação

    // Exemplo simples com dados estáticos
    const locations = {
      'primeira praia': { lat: -13.381, lng: -38.913, name: 'Primeira Praia' },
      'segunda praia': { lat: -13.383, lng: -38.914, name: 'Segunda Praia' },
      'terceira praia': { lat: -13.385, lng: -38.915, name: 'Terceira Praia' },
      'quarta praia': { lat: -13.388, lng: -38.916, name: 'Quarta Praia' },
      farol: { lat: -13.376, lng: -38.919, name: 'Farol do Morro' },
      vila: { lat: -13.38, lng: -38.911, name: 'Vila do Morro' },
    };

    // Normalizar nome para busca
    const normalizedName = locationName.toLowerCase().trim();

    // Buscar correspondência
    for (const [key, location] of Object.entries(locations)) {
      if (
        key.includes(normalizedName) ||
        location.name.toLowerCase().includes(normalizedName)
      ) {
        return showLocationOnMap(location, options);
      }
    }

    console.warn(`Local não encontrado: ${locationName}`);
    showNotification(`Local "${locationName}" não encontrado`, 'warning');
    return null;
  } catch (error) {
    console.error('Erro ao buscar e mostrar local por nome:', error);
    return null;
  }
}

/**
 * Mostra uma categoria completa de locais no mapa
 * @param {string} category - Categoria a ser mostrada (praias, restaurantes, etc)
 * @param {Object} options - Opções para exibição
 * @returns {Array} Marcadores criados
 */
export function showCategoryOnMap(category, options = {}) {
  try {
    // Obter locais da categoria
    const categoryLocations = getCategoryLocations(category);

    if (!categoryLocations || categoryLocations.length === 0) {
      console.warn(`Sem locais para a categoria: ${category}`);
      return [];
    }

    // Limpar marcadores anteriores se necessário
    if (options.clearPrevious !== false) {
      clearMapMarkers();
    }

    // Opções padrão
    const defaultOptions = {
      zoom: true,
      fitBounds: true,
      showPopups: true,
      clusterMarkers: categoryLocations.length > 5,
    };

    const finalOptions = { ...defaultOptions, ...options };

    // Criar marcadores para cada local
    const markers = [];
    const bounds = L.latLngBounds();

    categoryLocations.forEach((location) => {
      // Personalizar opções para o marcador individual
      const markerOptions = {
        zoom: false,
        panTo: false,
        openPopup: false,
        showPopup: finalOptions.showPopups,
        permanent: true,
      };

      // Criar marcador
      const marker = showLocationOnMap(location, markerOptions);

      if (marker) {
        markers.push(marker);
        bounds.extend(marker.getLatLng());
      }
    });

    // Ajustar visualização para incluir todos os marcadores
    const map = getMapInstance();
    if (map && finalOptions.fitBounds && bounds.isValid()) {
      map.fitBounds(bounds, {
        padding: [50, 50],
        maxZoom: 16,
      });
    }

    // Armazenar marcadores para referência
    currentMarkers.push(...markers);

    return markers;
  } catch (error) {
    console.error(`Erro ao mostrar categoria ${category} no mapa:`, error);
    return [];
  }
}

/**
 * Remove marcadores do mapa
 * @param {Array} markers - Marcadores específicos a remover (opcional)
 */
export function clearMapMarkers(markers) {
  try {
    const map = getMapInstance();
    if (!map) return false;

    // Se não foram especificados marcadores, usar a lista global
    const markersToRemove = markers || currentMarkers;

    // Remover cada marcador
    markersToRemove.forEach((marker) => {
      if (marker && map.hasLayer(marker)) {
        map.removeLayer(marker);
      }
    });

    // Limpar a lista global se aplicável
    if (!markers) {
      currentMarkers = [];
    } else {
      // Remover apenas os marcadores especificados da lista global
      currentMarkers = currentMarkers.filter(
        (m) => !markersToRemove.includes(m)
      );
    }

    return true;
  } catch (error) {
    console.error('Erro ao limpar marcadores do mapa:', error);
    return false;
  }
}

/**
 * Mostra rota entre dois pontos no mapa
 * @param {Object} start - Ponto de início da rota
 * @param {Object} end - Ponto final da rota
 * @param {Object} options - Opções para a rota
 * @returns {Object} Objeto representando a rota
 */
export function showRouteOnMap(start, end, options = {}) {
  try {
    const map = getMapInstance();
    if (!map) {
      throw new Error('Mapa não disponível');
    }

    // Extrair coordenadas
    let startCoords, endCoords;

    if (start.lat && start.lng) {
      startCoords = [start.lat, start.lng];
    } else if (Array.isArray(start) && start.length >= 2) {
      startCoords = [start[0], start[1]];
    } else if (typeof start === 'string') {
      // Buscar por nome
      const startMarker = findAndShowLocationByName(start, { permanent: true });
      if (!startMarker) return null;
      startCoords = [startMarker.getLatLng().lat, startMarker.getLatLng().lng];
    } else {
      throw new Error('Formato de ponto inicial inválido');
    }

    if (end.lat && end.lng) {
      endCoords = [end.lat, end.lng];
    } else if (Array.isArray(end) && end.length >= 2) {
      endCoords = [end[0], end[1]];
    } else if (typeof end === 'string') {
      // Buscar por nome
      const endMarker = findAndShowLocationByName(end, { permanent: true });
      if (!endMarker) return null;
      endCoords = [endMarker.getLatLng().lat, endMarker.getLatLng().lng];
    } else {
      throw new Error('Formato de ponto final inválido');
    }

    // Opções padrão
    const defaultOptions = {
      color: '#0066ff',
      weight: 5,
      opacity: 0.7,
      fitRoute: true,
    };

    const finalOptions = { ...defaultOptions, ...options };

    // Criar linha para a rota
    const route = L.polyline([startCoords, endCoords], {
      color: finalOptions.color,
      weight: finalOptions.weight,
      opacity: finalOptions.opacity,
    }).addTo(map);

    // Ajustar visualização para incluir toda a rota
    if (finalOptions.fitRoute) {
      map.fitBounds(route.getBounds(), {
        padding: [50, 50],
      });
    }

    // Armazenar para referência
    currentRoutes.push(route);

    return route;
  } catch (error) {
    console.error('Erro ao mostrar rota no mapa:', error);
    showNotification('Não foi possível mostrar a rota no mapa', 'error');
    return null;
  }
}

/**
 * Remove rotas do mapa
 * @param {Array} routes - Rotas específicas a remover (opcional)
 */
export function clearMapRoutes(routes) {
  try {
    const map = getMapInstance();
    if (!map) return false;

    // Se não foram especificadas rotas, usar a lista global
    const routesToRemove = routes || currentRoutes;

    // Remover cada rota
    routesToRemove.forEach((route) => {
      if (route && map.hasLayer(route)) {
        map.removeLayer(route);
      }
    });

    // Limpar a lista global se aplicável
    if (!routes) {
      currentRoutes = [];
    } else {
      // Remover apenas as rotas especificadas da lista global
      currentRoutes = currentRoutes.filter((r) => !routesToRemove.includes(r));
    }

    return true;
  } catch (error) {
    console.error('Erro ao limpar rotas do mapa:', error);
    return false;
  }
}

/**
 * Limpa todos os objetos do mapa (marcadores, rotas, popups)
 */
export function clearMap() {
  try {
    clearMapMarkers();
    clearMapRoutes();
    clearMapPopups();
    return true;
  } catch (error) {
    console.error('Erro ao limpar mapa:', error);
    return false;
  }
}

/**
 * Remove popups do mapa
 * @param {Array} popups - Popups específicos a remover (opcional)
 */
export function clearMapPopups(popups) {
  try {
    const map = getMapInstance();
    if (!map) return false;

    // Se não foram especificados popups, usar a lista global
    const popupsToRemove = popups || currentPopups;

    // Remover cada popup
    popupsToRemove.forEach((popup) => {
      if (popup && map.hasLayer(popup)) {
        map.removeLayer(popup);
      }
    });

    // Limpar a lista global se aplicável
    if (!popups) {
      currentPopups = [];
    } else {
      // Remover apenas os popups especificados da lista global
      currentPopups = currentPopups.filter((p) => !popupsToRemove.includes(p));
    }

    return true;
  } catch (error) {
    console.error('Erro ao limpar popups do mapa:', error);
    return false;
  }
}

/**
 * Obtém locais de uma categoria específica
 * @param {string} category - Nome da categoria
 * @returns {Array} Lista de locais
 */
function getCategoryLocations(category) {
  // Normalizar categoria
  const normalizedCategory = category.toLowerCase().trim();

  // Mapeamento de categorias para locais
  // Esta seria idealmente conectada ao seu banco de dados
  const categoryMap = {
    praias: [
      {
        lat: -13.381,
        lng: -38.913,
        name: 'Primeira Praia',
        description: 'Praia próxima da Vila, ideal para mergulho.',
      },
      {
        lat: -13.383,
        lng: -38.914,
        name: 'Segunda Praia',
        description: 'A mais movimentada, com diversos bares e restaurantes.',
      },
      {
        lat: -13.385,
        lng: -38.915,
        name: 'Terceira Praia',
        description: 'Bom equilíbrio entre tranquilidade e estrutura.',
      },
      {
        lat: -13.388,
        lng: -38.916,
        name: 'Quarta Praia',
        description: 'Praia mais tranquila e extensa.',
      },
      {
        lat: -13.39,
        lng: -38.917,
        name: 'Praia do Encanto',
        description: 'Uma das mais preservadas da região.',
      },
    ],
    restaurantes: [
      {
        lat: -13.382,
        lng: -38.913,
        name: 'Restaurante do Gallo',
        description: 'Especializado em frutos do mar.',
      },
      {
        lat: -13.38,
        lng: -38.912,
        name: 'Dona Carmô',
        description: 'Autêntica culinária baiana.',
      },
      {
        lat: -13.379,
        lng: -38.911,
        name: 'O Beco',
        description: 'Culinária italiana em Morro de São Paulo.',
      },
      {
        lat: -13.384,
        lng: -38.915,
        name: 'Sambass',
        description: 'Ambiente à beira-mar com música ao vivo.',
      },
      {
        lat: -13.386,
        lng: -38.915,
        name: 'Minha Louca Paixão',
        description: 'Gastronomia refinada com vista para o mar.',
      },
    ],
    hospedagem: [
      {
        lat: -13.38,
        lng: -38.912,
        name: 'Pousada Natureza',
        description: 'Pousada econômica no centro da Vila.',
      },
      {
        lat: -13.384,
        lng: -38.914,
        name: 'Villa dos Corais',
        description: 'Hotel de luxo na Segunda Praia.',
      },
      {
        lat: -13.385,
        lng: -38.915,
        name: 'Pousada Morena',
        description: 'Charmosa pousada na Terceira Praia.',
      },
      {
        lat: -13.389,
        lng: -38.916,
        name: 'Hotel Morro de São Paulo',
        description: 'Hotel tradicional próximo à Quarta Praia.',
      },
      {
        lat: -13.382,
        lng: -38.913,
        name: 'Charme de Morro Hostel',
        description: 'Hostel econômico com boa localização.',
      },
    ],
    atrações: [
      {
        lat: -13.376,
        lng: -38.919,
        name: 'Farol do Morro',
        description: 'Vista panorâmica de toda a ilha.',
      },
      {
        lat: -13.379,
        lng: -38.91,
        name: 'Forte Tapirandu',
        description: 'Construção histórica do século XVII.',
      },
      {
        lat: -13.38,
        lng: -38.911,
        name: 'Igreja Nossa Senhora da Luz',
        description: 'Igreja histórica na Vila.',
      },
      {
        lat: -13.377,
        lng: -38.914,
        name: 'Fonte Grande',
        description: 'Fonte histórica de água doce.',
      },
      {
        lat: -13.382,
        lng: -38.92,
        name: 'Ponta do Sino',
        description: 'Ponto para assistir ao pôr-do-sol.',
      },
    ],
    passeios: [
      {
        lat: -13.415,
        lng: -38.9,
        name: 'Piscina Natural Garapuá',
        description: 'Passeio de barco até piscinas naturais.',
      },
      {
        lat: -13.36,
        lng: -38.93,
        name: 'Ilha de Boipeba',
        description: 'Ilha vizinha ainda mais preservada.',
      },
      {
        lat: -13.392,
        lng: -38.918,
        name: 'Camambu',
        description: 'Praia mais isolada ao sul da ilha.',
      },
      {
        lat: -13.375,
        lng: -38.918,
        name: 'Trilha do Farol',
        description: 'Caminhada com vista panorâmica.',
      },
      {
        lat: -13.378,
        lng: -38.922,
        name: 'Volta à Ilha',
        description: 'Passeio de barco ao redor da ilha.',
      },
    ],
  };

  // Retornar locais da categoria ou array vazio
  return categoryMap[normalizedCategory] || [];
}

/**
 * Busca por locais no mapa usando texto
 * @param {string} searchText - Texto a ser buscado
 * @param {Object} options - Opções para a busca
 * @returns {Array} Lista de resultados encontrados
 */
export function searchLocationsOnMap(searchText, options = {}) {
  try {
    if (!searchText) return [];

    const normalizedSearch = searchText.toLowerCase().trim();
    let results = [];

    // Normalizar opções
    const defaultOptions = {
      maxResults: 5,
      searchInCategories: [
        'praias',
        'restaurantes',
        'hospedagem',
        'atrações',
        'passeios',
      ],
      highlightResults: true,
      fitBounds: true,
    };

    const finalOptions = { ...defaultOptions, ...options };

    // Buscar em todas as categorias solicitadas
    finalOptions.searchInCategories.forEach((category) => {
      const categoryLocations = getCategoryLocations(category);

      if (categoryLocations && categoryLocations.length > 0) {
        // Filtrar locais que correspondem à busca
        const matchingLocations = categoryLocations.filter((location) => {
          return (
            location.name.toLowerCase().includes(normalizedSearch) ||
            (location.description &&
              location.description.toLowerCase().includes(normalizedSearch))
          );
        });

        if (matchingLocations.length > 0) {
          // Adicionar categoria ao resultado para referência
          matchingLocations.forEach((location) => {
            results.push({
              ...location,
              category,
            });
          });
        }
      }
    });

    // Limitar número de resultados
    if (results.length > finalOptions.maxResults) {
      results = results.slice(0, finalOptions.maxResults);
    }

    // Destacar resultados no mapa se solicitado
    if (finalOptions.highlightResults && results.length > 0) {
      // Limpar marcadores anteriores
      clearMapMarkers();

      const bounds = L.latLngBounds();

      // Criar marcador para cada resultado
      results.forEach((location) => {
        const marker = showLocationOnMap(location, {
          zoom: false,
          panTo: false,
          permanent: true,
          popupContent: `<div><h4>${location.name}</h4><p>${location.description || ''}</p><p><em>Categoria: ${getCategoryName(location.category)}</em></p></div>`,
        });

        if (marker) {
          bounds.extend(marker.getLatLng());
        }
      });

      // Ajustar visualização para mostrar todos os resultados
      if (finalOptions.fitBounds && bounds.isValid()) {
        const map = getMapInstance();
        if (map) {
          map.fitBounds(bounds, {
            padding: [50, 50],
            maxZoom: 16,
          });
        }
      }
    }

    return results;
  } catch (error) {
    console.error('Erro ao buscar locais no mapa:', error);
    return [];
  }
}

/**
 * Obtém nome formatado de uma categoria
 * @param {string} categoryKey - Chave da categoria
 * @returns {string} Nome formatado
 */
function getCategoryName(categoryKey) {
  const categoryNames = {
    praias: 'Praias',
    restaurantes: 'Restaurantes',
    hospedagem: 'Hospedagem',
    atrações: 'Atrações',
    passeios: 'Passeios',
  };

  return categoryNames[categoryKey] || categoryKey;
}

/**
 * Obtém a localização atual do usuário e mostra no mapa
 * @param {Object} options - Opções para exibição
 * @returns {Promise} Promise com o resultado da operação
 */
export function showUserLocationOnMap(options = {}) {
  return new Promise((resolve, reject) => {
    try {
      const map = getMapInstance();
      if (!map) {
        reject(new Error('Mapa não disponível'));
        return;
      }

      // Verificar suporte a geolocalização
      if (!navigator.geolocation) {
        showNotification('Seu navegador não suporta geolocalização', 'error');
        reject(new Error('Geolocalização não suportada'));
        return;
      }

      // Opções padrão
      const defaultOptions = {
        zoom: true,
        zoomLevel: 15,
        showAccuracy: true,
        panTo: true,
        timeout: 10000,
        showNotification: true,
      };

      const finalOptions = { ...defaultOptions, ...options };

      // Mostrar notificação de aguarde
      if (finalOptions.showNotification) {
        showNotification('Obtendo sua localização...', 'info');
      }

      // Obter localização
      navigator.geolocation.getCurrentPosition(
        (position) => {
          // Sucesso ao obter localização
          if (finalOptions.showNotification) {
            showNotification('Localização obtida com sucesso!', 'success');
          }

          const { latitude, longitude, accuracy } = position.coords;

          // Criar marcador para a localização do usuário
          const userMarker = L.marker([latitude, longitude], {
            icon: L.divIcon({
              className: 'user-location-marker',
              html: '<div class="user-location-dot"></div>',
              iconSize: [24, 24],
              iconAnchor: [12, 12],
            }),
          }).addTo(map);

          // Adicionar círculo de precisão se solicitado
          let accuracyCircle = null;
          if (finalOptions.showAccuracy && accuracy) {
            accuracyCircle = L.circle([latitude, longitude], {
              radius: accuracy,
              color: '#4285F4',
              fillColor: '#4285F4',
              fillOpacity: 0.15,
              weight: 1,
            }).addTo(map);
          }

          // Ajustar visualização
          if (finalOptions.panTo) {
            if (finalOptions.zoom) {
              map.setView([latitude, longitude], finalOptions.zoomLevel);
            } else {
              map.panTo([latitude, longitude]);
            }
          }

          // Armazenar referências
          currentMarkers.push(userMarker);
          if (accuracyCircle) {
            currentMarkers.push(accuracyCircle);
          }

          // Retornar posição e marcadores criados
          resolve({
            position: { latitude, longitude, accuracy },
            marker: userMarker,
            accuracyCircle,
          });
        },
        (error) => {
          // Erro ao obter localização
          let errorMessage = 'Não foi possível obter sua localização';

          switch (error.code) {
            case error.PERMISSION_DENIED:
              errorMessage =
                'Permissão para acessar sua localização foi negada';
              break;
            case error.POSITION_UNAVAILABLE:
              errorMessage = 'Sua localização não está disponível no momento';
              break;
            case error.TIMEOUT:
              errorMessage = 'Tempo esgotado ao tentar obter sua localização';
              break;
          }

          if (finalOptions.showNotification) {
            showNotification(errorMessage, 'error');
          }

          reject(new Error(errorMessage));
        },
        {
          enableHighAccuracy: true,
          timeout: finalOptions.timeout,
          maximumAge: 0,
        }
      );
    } catch (error) {
      console.error('Erro ao mostrar localização do usuário:', error);
      reject(error);
    }
  });
}
