import { map } from '../main.js';
import { markers } from '../core/varGlobals.js';

/**
 * Ajusta o mapa para a localização do usuário.
 * @param {number} lat - Latitude do usuário.
 * @param {number} lon - Longitude do usuário.
 */
export function adjustMapWithLocationUser(lat, lon) {
  map.setView([lat, lon], 21);
  const marker = L.marker([lat, lon])
    .addTo(map)
    .bindPopup(translations[selectedLanguage].youAreHere || 'Você está aqui!')
    .openPopup();
  markers.push(marker);
}

/**
 * Ajusta o mapa para uma localização específica.
 * @param {number} lat - Latitude.
 * @param {number} lon - Longitude.
 * @param {string} name - Nome do local.
 * @param {string} description - Descrição do local.
 * @param {number} zoom - Nível de zoom.
 * @param {number} offsetYPercent - Offset vertical em porcentagem.
 */
export function adjustMapWithLocation(
  lat,
  lon,
  name = '',
  description = '',
  zoom = 15,
  offsetYPercent = 10
) {
  try {
    clearMarkers(); // Remove marcadores antigos

    // Adiciona marcador no local especificado
    const marker = L.marker([lat, lon])
      .addTo(map)
      .bindPopup(
        `<b>${name}</b><br>${description || 'Localização selecionada'}`
      )
      .openPopup();

    markers.push(marker); // Armazena marcador para referência futura

    const mapSize = map.getSize();
    const offsetY = (mapSize.y * Math.min(offsetYPercent, 100)) / 100;

    const projectedPoint = map.project([lat, lon], zoom).subtract([0, offsetY]);
    const adjustedLatLng = map.unproject(projectedPoint, zoom);

    map.setView(adjustedLatLng, zoom, {
      animate: true,
      pan: { duration: 0.5 },
    });

    console.log(`Mapa ajustado para (${lat}, ${lon}) com zoom ${zoom}.`);
  } catch (error) {
    console.error('Erro ao ajustar o mapa:', error);
  }
}

/**
 * Remove marcadores do mapa com base em um filtro.
 * @param {Function} filterFn - Função de filtro para remover marcadores.
 */
export function clearMarkers(filterFn) {
  if (map) {
    map.eachLayer((layer) => {
      if (layer instanceof L.Marker && (!filterFn || filterFn(layer))) {
        map.removeLayer(layer);
      }
    });
    console.log('Marcadores removidos do mapa.');
  }
}

/**
 * Remove todas as camadas do mapa.
 */
export function clearMapLayers() {
  if (map) {
    map.eachLayer((layer) => {
      if (!(layer instanceof L.TileLayer)) {
        map.removeLayer(layer);
      }
    });
    console.log('Todas as camadas foram removidas do mapa.');
  }
}

/**
 * Restaura a interface para a última feature selecionada.
 */
export function restoreFeatureUI(feature) {
  console.log('Restaurando interface para a feature:', feature);

  hideAllControlButtons();
  closeCarouselModal();

  if (
    !selectedDestination ||
    !selectedDestination.lat ||
    !selectedDestination.lon
  ) {
    console.warn(
      'Nenhum destino previamente selecionado. Abortando restoreFeatureUI.'
    );
    return;
  }

  adjustMapWithLocation(
    selectedDestination.lat,
    selectedDestination.lon,
    selectedDestination.name,
    selectedDestination.description,
    15,
    -10
  );

  showNotification(
    `Último destino: ${selectedDestination.name || ''} restaurado no mapa.`,
    'info'
  );

  switch (feature) {
    case 'pontos-turisticos':
      showControlButtonsTouristSpots();
      displayCustomTouristSpots();
      break;
    case 'passeios':
      showControlButtonsTour();
      displayCustomTours();
      break;
    case 'praias':
      showControlButtonsBeaches();
      displayCustomBeaches();
      break;
    case 'festas':
      showControlButtonsNightlife();
      displayCustomNightlife();
      break;
    case 'restaurantes':
      showControlButtonsRestaurants();
      displayCustomRestaurants();
      break;
    case 'pousadas':
      showControlButtonsInns();
      displayCustomInns();
      break;
    case 'lojas':
      showControlButtonsShops();
      displayCustomShops();
      break;
    case 'emergencias':
      showControlButtonsEmergencies();
      displayCustomEmergencies();
      break;
    case 'ensino':
      showControlButtonsEducation();
      displayCustomEducation();
      break;
    default:
      console.warn('Feature não reconhecida:', feature);
      break;
  }

  const menuElement = document.getElementById('menu');
  if (menuElement) {
    menuElement.style.display = 'block';
    console.log("restoreFeatureUI: Botão 'menu' reexibido.");
  }
}

/**
 * Exibe a rota na pré-visualização.
 * @param {Object} route - Dados da rota.
 */
export function visualizeRouteOnPreview(route) {
  console.log('Rota exibida na pré-visualização:', route);
}

/**
 * Aplica zoom aos limites especificados.
 * @param {Object} bounds - Limites (bounds) para aplicar o zoom.
 */
export function zoomToSelectedArea(bounds) {
  if (map) {
    map.fitBounds(bounds);
    console.log('Zoom aplicado aos limites especificados.');
  }
}
