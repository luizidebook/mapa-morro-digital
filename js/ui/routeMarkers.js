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
