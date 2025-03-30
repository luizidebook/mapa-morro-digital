import { map, markers } from '../core/state.js';

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
