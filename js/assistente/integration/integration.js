/**
 * Módulo de integração do assistente com o mapa
 */

// Armazenar referência aos marcadores ativos
let activeMarkers = [];

/**
 * Mostra uma localização no mapa
 * @param {Object} coordinates - Coordenadas {lat, lng}
 * @param {string} name - Nome do local
 * @param {Object} options - Opções adicionais
 */
export function showLocationOnMap(coordinates, name, options = {}) {
  console.log(`Mostrando localização no mapa: ${name}`, coordinates);

  if (!window.map) {
    showNotification('Erro: O mapa não está disponível. Tente novamente mais tarde.', 'error');
    return false;
  }

  try {
    // Remover marcadores anteriores
    clearActiveMarkers();

    // Configurar ícone
    let markerIcon = null;
    if (options.icon) {
      markerIcon = L.icon(options.icon);
    } else {
      // Ícone padrão
      markerIcon = L.icon({
        iconUrl: '/img/marker-icon.png',
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
      });
    }

    // Criar marcador
    const marker = addMarkerToMap(coordinates.lat, coordinates.lng, name, {
      icon: markerIcon || L.Icon.Default,
      title: name,
    });

    // Armazenar marcador
    activeMarkers.push(marker);

    // Centralizar mapa
    window.map.setView([coordinates.lat, coordinates.lng], options.zoom || 15);

    // Abrir popup se solicitado
    if (options.openPopup) {
      marker.openPopup();
    }

    // Armazenar no estado
    assistantStateManager.set('lastLocation', {
      name,
      coordinates,
      timestamp: Date.now(),
    });
    assistantStateManager.save();

    return true;
  } catch (error) {
    console.error('Erro ao mostrar localização no mapa:', error);
    return false;
  }
}

/**
 * Mostra múltiplos pontos no mapa por categoria
 * @param {string} category - Categoria de POIs
 */
export function showPoiCategory(category) {
  const categoryMap = {
    beaches: [
      { name: 'Primeira Praia', coordinates: { lat: -13.3795, lng: -38.9157 } },
      { name: 'Segunda Praia', coordinates: { lat: -13.3825, lng: -38.9138 } },
      { name: 'Terceira Praia', coordinates: { lat: -13.3865, lng: -38.9088 } },
      { name: 'Quarta Praia', coordinates: { lat: -13.3915, lng: -38.9046 } },
      { name: 'Quinta Praia', coordinates: { lat: -13.3975, lng: -38.899 } },
    ],
    restaurants: [
      {
        name: 'Ponto do Marisco',
        coordinates: { lat: -13.3824, lng: -38.9133 },
      },
      { name: 'Sambass', coordinates: { lat: -13.3865, lng: -38.9082 } },
      { name: 'Maria Mata Fome', coordinates: { lat: -13.383, lng: -38.9125 } },
    ],
    inns: [
      {
        name: 'Pousada Bahia Inn',
        coordinates: { lat: -13.381, lng: -38.9145 },
      },
      {
        name: 'Pousada Praia do Encanto',
        coordinates: { lat: -13.387, lng: -38.908 },
      },
      { name: 'Vila dos Corais', coordinates: { lat: -13.3845, lng: -38.91 } },
    ],
    // Adicionar mais categorias conforme necessário
  };

  if (!categoryMap[category]) {
    console.error(`Categoria de POI não encontrada: ${category}`);
    return false;
  }

  try {
    // Limpar marcadores anteriores
    clearActiveMarkers();

    // Adicionar todos os marcadores da categoria
    const bounds = L.latLngBounds();

    categoryMap[category].forEach((poi) => {
      const marker = addMarkerToMap(poi.coordinates.lat, poi.coordinates.lng, poi.name);
      activeMarkers.push(marker);

      // Expandir os limites para incluir este ponto
      bounds.extend([poi.coordinates.lat, poi.coordinates.lng]);
    });

    // Ajustar o mapa para mostrar todos os pontos
    window.map.fitBounds(bounds, { padding: [50, 50] });

    return true;
  } catch (error) {
    console.error('Erro ao mostrar categoria no mapa:', error);
    return false;
  }
}

/**
 * Mostra uma rota entre dois pontos
 * @param {Object} start - Ponto inicial {lat, lng}
 * @param {Object} end - Ponto final {lat, lng}
 * @param {string} mode - Modo de transporte (foot, bike)
 */
export function showRoute(start, end, mode = 'foot') {
  // Implementar apenas se tiver a biblioteca de roteamento instalada
  console.log('Função showRoute chamada, mas não implementada totalmente');

  // Exemplo de implementação usando Leaflet Routing Machine
  if (window.L && window.L.Routing && window.map) {
    try {
      // Remover rotas anteriores
      if (window.currentRoute) {
        window.map.removeControl(window.currentRoute);
      }

      // Criar nova rota
      window.currentRoute = L.Routing.control({
        waypoints: [L.latLng(start.lat, start.lng), L.latLng(end.lat, end.lng)],
        routeWhileDragging: false,
        lineOptions: {
          styles: [{ color: '#6FA1EC', weight: 4 }],
        },
        createMarker: function () {
          return null;
        }, // Não criar marcadores adicionais
      }).addTo(window.map);

      return true;
    } catch (error) {
      console.error('Erro ao mostrar rota:', error);
      return false;
    }
  } else {
    console.error('Leaflet Routing Machine ou mapa não disponível.');
  }

  return false;
}

/**
 * Limpa todos os marcadores ativos do mapa
 */
function clearActiveMarkers() {
  activeMarkers.forEach((marker) => {
    if (window.map) {
      window.map.removeLayer(marker);
    }
  });

  activeMarkers = [];
}

/**
 * Reseta a visualização do mapa para a posição padrão
 */
export function resetMapView() {
  if (!window.map) return false;

  const defaultView = {
    lat: -13.3825,
    lng: -38.9138,
    zoom: 13,
  };

  window.map.setView([defaultView.lat, defaultView.lng], defaultView.zoom);
  return true;
}

/**
 * Adiciona um marcador ao mapa
 * @param {number} lat - Latitude
 * @param {number} lon - Longitude
 * @param {string} name - Nome do local
 * @param {Object} options - Opções adicionais
 * @returns {Object} Marker criado
 */
function addMarkerToMap(lat, lon, name, options = {}) {
  const marker = L.marker([lat, lon], options).addTo(window.map);
  marker.bindPopup(`<strong>${name}</strong>`);
  return marker;
}

// Exportar todas as funções públicas
export default {
  showLocationOnMap,
  showPoiCategory,
  showRoute,
  resetMapView,
  clearActiveMarkers,
};
