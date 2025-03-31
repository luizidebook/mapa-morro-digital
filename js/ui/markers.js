/**
 * 1. clearAllMarkers
 *    Remove todos os marcadores do mapa e limpa o array global. */
export function clearAllMarkers() {
  markers.forEach((marker) => map.removeLayer(marker));
  markers = [];
  if (userMarker) {
    map.removeLayer(userMarker);
    userMarker = null;
  }
  if (currentMarker) {
    map.removeLayer(currentMarker);
    currentMarker = null;
  }
  console.log('Todos os marcadores removidos.');
}
