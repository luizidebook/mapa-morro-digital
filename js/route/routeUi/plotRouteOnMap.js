// plotRouteOnMap.js
// Importações necessárias
import { map } from '../../main.js';
import {
  currentRoute,
  selectedProfile,
  currentRouteData,
} from '../../core/varGlobals.js';

// Constantes
export const ORS_API_KEY =
  '5b3ce3597851110001cf62480e27ce5b5dcf4e75a9813468e027d0d3';

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
  // Verifica se o mapa está inicializado
  if (!map) {
    console.error('[plotRouteOnMap] Erro: O mapa não está inicializado.');
    return null;
  }

  // Constrói a URL da API
  const url =
    `https://api.openrouteservice.org/v2/directions/${profile}?api_key=${ORS_API_KEY}` +
    `&start=${startLon},${startLat}&end=${destLon},${destLat}&instructions=false`;

  console.log('URL da API:', url);
  console.log('Parâmetros da rota:', {
    startLat,
    startLon,
    destLat,
    destLon,
    profile,
  });

  try {
    // Envia a solicitação para a API
    const response = await fetch(url);
    if (!response.ok) {
      console.error('[plotRouteOnMap] Erro ao obter rota:', response.status);
      return null;
    }

    // Processa a resposta da API
    const data = await response.json();

    // Remove a rota anterior, se existir
    if (window.currentRoute) {
      map.removeLayer(window.currentRoute);
    }

    // Cria uma polyline com os dados da rota
    const coords = data.features[0].geometry.coordinates;
    const latLngs = coords.map(([lon, lat]) => [lat, lon]);
    window.currentRoute = L.polyline(latLngs, {
      color: 'blue',
      weight: 5,
      dashArray: '10,5',
    }).addTo(map);

    // Ajusta os limites do mapa para a nova rota
    map.fitBounds(window.currentRoute.getBounds(), { padding: [50, 50] });

    console.log('[plotRouteOnMap] Rota plotada com sucesso.');
    return data;
  } catch (error) {
    console.error('[plotRouteOnMap] Erro ao plotar rota:', error);
    return null;
  }
}
