// Importações necessárias
import { OPENROUTESERVICE_API_KEY } from '../core/constants.js';
import { map, markers } from '../core/state.js';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { showNotification } from '../ui/notifications.js';
import { getGeneralText } from '../ui/texts.js';

// Variável global para armazenar o marcador atual
let currentMarker = null;

/**
 * searchLocation
 *    Realiza a busca de um local (via Nominatim) e, em seguida,
 *    obtém POIs correlatos via Overpass-API, usando sinônimos e queries definidas.
 */
export function searchLocation() {
  const apiKey = OPENROUTESERVICE_API_KEY;

  const queries = {
    restaurantes:
      '[out:json];node["amenity"="restaurant"](around:15000,-13.376,-38.913);out body;',
    pousadas:
      '[out:json];node["tourism"="hotel"](around:15000,-13.376,-38.913);out body;',
    lojas: '[out:json];node["shop"](around:15000,-13.376,-38.913);out body;',
    praias:
      '[out:json];node["natural"="beach"](around:15000,-13.376,-38.913);out body;',
    // Outros queries omitidos para brevidade...
  };

  const synonyms = {
    restaurantes: ['restaurantes', 'restaurante', 'comida', 'alimentação'],
    pousadas: ['pousadas', 'pousada', 'hotéis', 'hotel', 'hospedagem'],
    lojas: ['lojas', 'loja', 'comércio', 'shopping', 'mercado'],
    praias: ['praias', 'praia', 'litoral', 'costa', 'beira-mar'],
    // Outros sinônimos omitidos para brevidade...
  };

  const searchQuery = prompt(
    getGeneralText('searchPrompt', 'pt') || 'Digite o local que deseja buscar:'
  );

  if (searchQuery) {
    const viewBox = '-38.926, -13.369, -38.895, -13.392';
    const nominatimUrl = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
      searchQuery
    )}&viewbox=${viewBox}&bounded=1&key=${apiKey}`;

    fetch(nominatimUrl)
      .then((response) => response.json())
      .then((data) => {
        if (data && data.length > 0) {
          const filteredData = data.filter((location) => {
            const lat = parseFloat(location.lat);
            const lon = parseFloat(location.lon);
            return (
              lon >= -38.926 &&
              lon <= -38.895 &&
              lat >= -13.392 &&
              lat <= -13.369
            );
          });

          if (filteredData.length > 0) {
            const firstResult = filteredData[0];
            const lat = firstResult.lat;
            const lon = firstResult.lon;

            // Remove o marcador atual, se existir
            if (currentMarker) {
              map.removeLayer(currentMarker);
            }

            // Remove todos os marcadores antigos
            markers.forEach((marker) => map.removeLayer(marker));
            markers.length = 0;

            // Adiciona um novo marcador para o resultado da pesquisa
            currentMarker = L.marker([lat, lon])
              .addTo(map)
              .bindPopup(firstResult.display_name)
              .openPopup();

            map.setView([lat, lon], 14);

            // Verifica se a busca corresponde a alguma categoria
            let queryKey = null;
            const lowerQuery = searchQuery.toLowerCase();
            for (const [key, value] of Object.entries(synonyms)) {
              if (value.includes(lowerQuery)) {
                queryKey = key;
                break;
              }
            }

            if (queryKey && queries[queryKey]) {
              const overpassUrl = `https://overpass-api.de/api/interpreter?data=${encodeURIComponent(
                queries[queryKey]
              )}`;
              fetch(overpassUrl)
                .then((response) => response.json())
                .then((osmData) => {
                  if (
                    osmData &&
                    osmData.elements &&
                    osmData.elements.length > 0
                  ) {
                    osmData.elements.forEach((element) => {
                      const name = element.tags.name || 'Sem nome';
                      const description =
                        element.tags.description ||
                        element.tags.amenity ||
                        element.tags.tourism ||
                        element.tags.natural ||
                        '';
                      const marker = L.marker([element.lat, element.lon])
                        .addTo(map)
                        .bindPopup(`<b>${name}</b><br>${description}`);
                      markers.push(marker);
                    });
                  } else {
                    showNotification(
                      getGeneralText('noResultsFound', 'pt') ||
                        `Nenhum(a) ${searchQuery} encontrado(a) num raio de 1.5km.`,
                      'warning'
                    );
                  }
                })
                .catch((error) => {
                  console.error('Erro ao buscar dados do Overpass:', error);
                  showNotification(
                    getGeneralText('overpassError', 'pt') ||
                      'Ocorreu um erro ao buscar pontos de interesse.',
                    'error'
                  );
                });
            } else {
              showNotification(
                getGeneralText('unsupportedSearch', 'pt') ||
                  `Busca por "${searchQuery}" não é suportada.`,
                'warning'
              );
            }
          } else {
            showNotification(
              getGeneralText('locationNotFound', 'pt') ||
                'Local não encontrado em Morro de São Paulo.',
              'warning'
            );
          }
        } else {
          showNotification(
            getGeneralText('locationNotFound', 'pt') || 'Local não encontrado.',
            'warning'
          );
        }
      })
      .catch((error) => {
        console.error('Erro na busca:', error);
        showNotification(
          getGeneralText('searchError', 'pt') || 'Ocorreu um erro na busca.',
          'error'
        );
      });
  }
}
