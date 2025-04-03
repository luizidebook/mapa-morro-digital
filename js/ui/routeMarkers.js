import { map } from '../map/map.js'; // Importa o mapa do arquivo principal

/**
 * clearRouteMarkers
 * Remove marcadores de origem, destino e quaisquer marcadores relacionados à rota.
 */
export function clearRouteMarkers() {
  markers.forEach((marker) => map.removeLayer(marker));
  markers = [];
  console.log(
    'clearRouteMarkers: Todos os marcadores da rota foram removidos.'
  );
}

/**
 * clearCurrentRoute
 * Remove a rota atual (polyline) do mapa, se existir.
 */
export function clearCurrentRoute() {
  if (window.currentRoute) {
    map.removeLayer(window.currentRoute);
    window.currentRoute = null;
    console.log('[clearCurrentRoute] Rota removida do mapa.');
  } else {
    console.log('[clearCurrentRoute] Nenhuma rota ativa para remover.');
  }
}

/**
 * clearMarkers
/**
 * clearMarkers
 * Remove todos os marcadores do mapa.
 * Se uma função de filtro for fornecida, remove apenas os que satisfazem a condição.
 *
 * @param {Function} [filterFn] - Função para filtrar quais marcadores remover.
 */
export function clearMarkers(filterFn) {
  if (typeof filterFn === 'function') {
    markers = markers.filter((marker) => {
      if (filterFn(marker)) {
        map.removeLayer(marker);
        return false;
      }
      return true;
    });
  } else {
    markers.forEach((marker) => map.removeLayer(marker));
    markers = [];
  }
  console.log('clearMarkers: Marcadores removidos (com ou sem filtro).');
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
