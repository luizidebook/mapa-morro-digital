// plotRouteOnMap.js
//  * Cria a rota usando a API OpenRouteService.

import { map, apiKey } from '../../core/varGlobals.js';

/**
 * 1. plotRouteOnMap
 * Consulta a API OpenRouteService, obtém as coordenadas e plota a rota no mapa.
 * - Remove a rota anterior, se existir.
 * - Cria uma polyline e ajusta os limites do mapa.
 *
 * @param {number} startLat - Latitude de partida.
 * @param {number} startLon - Longitude de partida.
 * @param {number} destLat - Latitude do destino.
 * @param {number} destLon - Longitude do destino.
 * @param {string} [profile="foot-walking"] - Perfil de navegação.
 * @returns {Promise<Object|null>} - Dados da rota ou null em caso de erro.
 */
export async function plotRouteOnMap(
  startLat,
  startLon,
  destLat,
  destLon,
  profile = 'foot-walking'
) {
  const url =
    `https://api.openrouteservice.org/v2/directions/${profile}?api_key=${apiKey}` +
    `&start=${startLon},${startLat}&end=${destLon},${destLat}&instructions=false`;
  try {
    const response = await fetch(url);
    if (!response.ok) {
      console.error('[plotRouteOnMap] Erro ao obter rota:', response.status);
      return null;
    }
    const data = await response.json();
    // Extrai as coordenadas da rota e converte para formato [lat, lon]
    const coords = data.features[0].geometry.coordinates;
    const latLngs = coords.map(([lon, lat]) => [lat, lon]);
    // Se já houver uma rota traçada, remove-a
    if (window.currentRoute) {
      map.removeLayer(window.currentRoute);
    }
    // Cria e adiciona a polyline ao mapa
    window.currentRoute = L.polyline(latLngs, {
      color: 'blue',
      weight: 5,
      dashArray: '10,5',
    }).addTo(map);
    // Ajusta o mapa para mostrar toda a rota
    map.fitBounds(window.currentRoute.getBounds(), { padding: [50, 50] });
    console.log('[plotRouteOnMap] Rota plotada com sucesso.');
    return data;
  } catch (error) {
    console.error('[plotRouteOnMap] Erro ao plotar rota:', error);
    return null;
  }
}
