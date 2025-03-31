let markers = []; // Array global para armazenar os marcadores

export function clearAllMarkers() {
  if (!markers || markers.length === 0) {
    console.warn('Nenhum marcador para limpar.');
    return;
  }

  markers.forEach((marker) => marker.remove());
  markers = []; // Limpa o array de marcadores
  console.log('Todos os marcadores foram removidos.');
}

export function clearMarkers() {
  if (!markers || markers.length === 0) {
    console.warn('Nenhum marcador para limpar.');
    return;
  }

  markers.forEach((marker) => marker.remove());
  markers = []; // Limpa o array de marcadores
  console.log('Todos os marcadores foram removidos.');
}
