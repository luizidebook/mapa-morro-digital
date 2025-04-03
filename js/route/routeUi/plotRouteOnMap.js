import { map } from '../../map/map.js';
import { ORS_API_KEY } from '../../core/varGlobals.js';

export async function plotRouteOnMap(
  startLat,
  startLon,
  destLat,
  destLon,
  profile = 'foot-walking'
) {
  if (!map) {
    console.error('[plotRouteOnMap] Erro: O mapa não está inicializado.');
    return null;
  }

  const url =
    `https://api.openrouteservice.org/v2/directions/${profile}?api_key=${ORS_API_KEY}` +
    `&start=${startLon},${startLat}&end=${destLon},${destLat}&instructions=false`;

  console.log('URL da API:', url);

  try {
    const response = await fetch(url);
    if (!response.ok) {
      console.error('[plotRouteOnMap] Erro ao obter rota:', response.status);
      return null;
    }

    const data = await response.json();

    // Verifica se os dados incluem as informações necessárias
    if (
      !data.features ||
      !data.features[0] ||
      !data.features[0].properties.summary
    ) {
      console.error('[plotRouteOnMap] Dados da rota inválidos:', data);
      return null;
    }

    console.log('[plotRouteOnMap] Dados da rota retornados:', data);

    // Adicionar após a validação dos dados
    const coordinates = data.features[0].geometry.coordinates;
    // Converter coordenadas (inversão necessária pois GeoJSON usa [lon,lat] e Leaflet usa [lat,lon])
    const points = coordinates.map((coord) => [coord[1], coord[0]]);

    // Desenhar a polyline no mapa
    const routePolyline = L.polyline(points, {
      color: '#3388ff',
      weight: 6,
      opacity: 0.7,
    }).addTo(map);

    // Salvar referência para remover posteriormente
    window.currentRoute = routePolyline;

    // Ajustar visualização para mostrar toda a rota
    map.fitBounds(routePolyline.getBounds());

    return data;
  } catch (error) {
    console.error('[plotRouteOnMap] Erro ao plotar rota:', error);
    return null;
  }
}
