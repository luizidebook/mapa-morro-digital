/**
 * 1. calculateDistance
 * Calcula a distância (em metros) entre dois pontos usando a fórmula de Haversine.
 * @param {number} lat1
 * @param {number} lon1
 * @param {number} lat2
 * @param {number} lon2
 * @returns {number} Distância em metros.
 */
export function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371000; // Raio da Terra em metros
  const toRad = Math.PI / 180;
  const dLat = (lat2 - lat1) * toRad;
  const dLon = (lon2 - lon1) * toRad;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1 * toRad) * Math.cos(lat2 * toRad) * Math.sin(dLon / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/**
 * 2. computeBearing
 * Calcula o rumo (bearing) entre dois pontos geográficos.
 * @param {number} lat1 - Latitude do ponto de partida.
 * @param {number} lon1 - Longitude do ponto de partida.
 * @param {number} lat2 - Latitude do ponto de destino.
 * @param {number} lon2 - Longitude do ponto de destino.
 * @returns {number} Rumo em graus (0-360).
 */
export function computeBearing(lat1, lon1, lat2, lon2) {
  const toRad = Math.PI / 180;
  const toDeg = 180 / Math.PI;
  const dLon = (lon2 - lon1) * toRad;
  const y = Math.sin(dLon) * Math.cos(lat2 * toRad);
  const x =
    Math.cos(lat1 * toRad) * Math.sin(lat2 * toRad) -
    Math.sin(lat1 * toRad) * Math.cos(lat2 * toRad) * Math.cos(dLon);
  let bearing = Math.atan2(y, x) * toDeg;
  return (bearing + 360) % 360;
}
