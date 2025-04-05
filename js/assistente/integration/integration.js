/**
 * Módulo de integração do assistente com o mapa
 * Responsável por conectar o assistente com as funcionalidades do mapa
 */

/**
 * Mostra uma localização no mapa
 * @param {Object} coordinates - Coordenadas {lat, lng}
 * @param {string} name - Nome do local
 * @param {Object} options - Opções adicionais
 */
export function showLocationOnMap(coordinates, name, options = {}) {
  console.log(`Mostrando local no mapa: ${name}`, coordinates);

  if (!coordinates || !coordinates.lat || !coordinates.lng) {
    console.error('Coordenadas inválidas para mostrar no mapa');
    return false;
  }

  try {
    // Verificar se o mapa está disponível
    if (!window.map) {
      console.error('Mapa não disponível');
      return false;
    }

    // Centralizar o mapa na localização
    window.map.setView([coordinates.lat, coordinates.lng], options.zoom || 16);

    // Adicionar marcador se não existir
    const markerId = `marker-${name.replace(/\s+/g, '-').toLowerCase()}`;

    // Verificar se já existe um marcador para este local
    let marker = window.mapMarkers && window.mapMarkers[markerId];

    if (!marker) {
      // Criar novo marcador
      marker = L.marker([coordinates.lat, coordinates.lng])
        .addTo(window.map)
        .bindPopup(`<strong>${name}</strong>`)
        .openPopup();

      // Armazenar referência ao marcador
      if (!window.mapMarkers) window.mapMarkers = {};
      window.mapMarkers[markerId] = marker;
    } else {
      // Usar marcador existente
      marker.openPopup();
    }

    console.log(`Local "${name}" mostrado no mapa com sucesso`);
    return true;
  } catch (error) {
    console.error('Erro ao mostrar local no mapa:', error);
    return false;
  }
}

/**
 * Configura os listeners para eventos do mapa
 */
export function setupMapEventListeners() {
  try {
    // Verificar se o mapa está disponível
    if (!window.map) {
      console.error('Mapa não disponível para configurar event listeners');
      return false;
    }

    // Configurar evento de clique no mapa
    window.map.on('click', function (e) {
      console.log('Clique no mapa detectado:', e.latlng);

      // Se o assistente tiver um modo de seleção de destino ativo
      if (window.assistantState && window.assistantState.selectingDestination) {
        const coords = { lat: e.latlng.lat, lng: e.latlng.lng };

        // Notificar o assistente sobre a seleção
        if (
          window.assistantApi &&
          typeof window.assistantApi.onMapSelection === 'function'
        ) {
          window.assistantApi.onMapSelection(coords);
        }
      }
    });

    // Configurar evento para quando um marcador for clicado
    if (window.mapMarkers) {
      Object.values(window.mapMarkers).forEach((marker) => {
        marker.on('click', function (e) {
          const markerPosition = marker.getLatLng();
          console.log('Marcador clicado:', markerPosition);

          // Notificar o assistente sobre o clique no marcador
          if (
            window.assistantApi &&
            typeof window.assistantApi.onMarkerClick === 'function'
          ) {
            window.assistantApi.onMarkerClick({
              lat: markerPosition.lat,
              lng: markerPosition.lng,
              name: marker
                .getPopup()
                .getContent()
                .replace(/<[^>]*>/g, ''),
            });
          }
        });
      });
    }

    console.log('Event listeners do mapa configurados com sucesso');
    return true;
  } catch (error) {
    console.error('Erro ao configurar event listeners do mapa:', error);
    return false;
  }
}
