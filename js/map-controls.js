// map-control.js - Controle e interação com o mapa Leaflet

/* O que esse módulo cobre:
Inicializa o mapa OpenStreetMap com Leaflet.
Centraliza o mapa em Morro de São Paulo.
Permite ao assistente exibir localizações com base no nome.
Remove marcadores e rotas anteriores para manter o mapa limpo.
Adiciona controle de geolocalização para o usuário encontrar sua localização no mapa.
*/

// Variáveis de controle de mapa e marcadores
export let mapInstance;
let markers = [];
let routeLayer;
export let map; // Variável global para armazenar a instância do mapa

/**
 * Inicializa o mapa Leaflet e configura as camadas.
 * @param {string} containerId - ID do elemento HTML que conterá o mapa.
 * @returns {Object} Instância do mapa Leaflet.
 */
export function initializeMap(containerId) {
  if (map) {
    console.warn("Mapa já inicializado.");
    return map;
  }

  const mapElement = document.getElementById(containerId);
  if (!mapElement) {
    console.error(`Elemento com ID "${containerId}" não encontrado no DOM.`);
    return null;
  }

  // Verificar se o Leaflet está disponível globalmente
  if (typeof window.L === "undefined") {
    console.error(
      "Leaflet (L) não está definido. Certifique-se de incluir a biblioteca Leaflet no HTML."
    );
    return null;
  }

  // Usar window.L explicitamente para evitar o erro de referência
  map = window.L.map(containerId).setView([-13.3766787, -38.9172057], 13);
  window.L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution:
      '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
  }).addTo(map);

  mapInstance = map; // Definindo a instância mapInstance

  console.log("Mapa inicializado com sucesso.");
  return map;
}

/**
 * Limpa todos os marcadores e rotas existentes no mapa.
 */
export function clearMarkers() {
  markers.forEach((marker) => mapInstance.removeLayer(marker));
  markers = [];

  if (routeLayer) {
    mapInstance.removeLayer(routeLayer);
    routeLayer = null;
  }
}

/**
 * Mostra uma localização no mapa com base no nome do local.
 * @param {string} locationName - Nome descritivo (ex: 'Praia do Encanto')
 * @param {object} map - Instância do mapa Leaflet
 */
export function showLocationOnMap(locationName, map = mapInstance) {
  clearMarkers();

  // Base de dados expandida de localizações
  const locations = {
    // Praias
    "praia do encanto": [-13.392, -38.91],
    "segunda praia": [-13.3782, -38.9134],
    "terceira praia": [-13.381, -38.9102],
    "quarta praia": [-13.384, -38.908],
    "primeira praia": [-13.376, -38.916],
    "praia do porto": [-13.373, -38.918],

    // Pontos turísticos
    "farol do morro": [-13.3772, -38.9155],
    tirolesa: [-13.3775, -38.914],
    "fonte do morro": [-13.376, -38.9145],
    "fortaleza do morro": [-13.3767, -38.9175],
    "mirante do farol": [-13.3771, -38.9154],

    // Restaurantes
    "restaurante farol": [-13.3778, -38.9138],
    "sabores da ilha": [-13.3787, -38.913],
    "punto divino": [-13.3785, -38.9132],
    "restaurante do porto": [-13.3735, -38.9175],

    // Hospedagem
    "pousada mar azul": [-13.3782, -38.9136],
    "vila dos coqueiros": [-13.3798, -38.912],
    "hotel morro": [-13.3777, -38.9142],
    "pousada da praia": [-13.3786, -38.9128],
  };

  const key = locationName.toLowerCase();
  const coords = locations[key];

  if (!coords) {
    console.warn("Localização não encontrada:", locationName);
    return;
  }

  // Personalizar marcadores por categoria
  let icon = window.L.icon({
    iconUrl: getMarkerIconForLocation(key),
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32],
  });

  const marker = window.L.marker(coords, { icon }).addTo(map);
  marker.bindPopup(createPopupContent(locationName, key)).openPopup();
  markers.push(marker);

  map.setView(coords, 16);
}

/**
 * Seleciona o ícone apropriado com base no tipo de localização
 */
function getMarkerIconForLocation(name) {
  if (name.includes("praia")) {
    return "/images/markers/beach-marker.png";
  } else if (name.includes("restaurante") || name.includes("sabores")) {
    return "/images/markers/food-marker.png";
  } else if (
    name.includes("pousada") ||
    name.includes("hotel") ||
    name.includes("vila")
  ) {
    return "/images/markers/hotel-marker.png";
  } else {
    return "/images/markers/attraction-marker.png";
  }
}

/**
 * Cria conteúdo HTML personalizado para os popups
 */
function createPopupContent(name, key) {
  return `<div class="custom-popup">
    <h3>${name}</h3>
    <p>${getLocationDescription(key)}</p>
    <button class="popup-button" onclick="window.navigateTo('${key}')">Mais detalhes</button>
  </div>`;
}

/**
 * Retorna uma descrição curta para a localização
 */
function getLocationDescription(key) {
  const descriptions = {
    "segunda praia": "A mais movimentada e cheia de quiosques.",
    "terceira praia": "Mais tranquila, com águas calmas.",
    "quarta praia": "Extensa e com menos estrutura, perfeita para caminhadas.",
    "praia do encanto": "Paraíso isolado com águas cristalinas.",
    // Adicione mais descrições conforme necessário
  };

  return (
    descriptions[key] ||
    "Um local incrível para conhecer em Morro de São Paulo."
  );
}

/**
 * Adicionar controle de geolocalização para o usuário encontrar sua localização no mapa
 */
export function setupGeolocation(map = mapInstance) {
  let userLocationMarker = null;

  // Adiciona botão de geolocalização personalizado
  const geolocateControl = document.createElement("div");
  geolocateControl.className = "geolocate-control";
  geolocateControl.innerHTML = '<i class="fas fa-location-arrow"></i>';
  document.getElementById("map-section").appendChild(geolocateControl);

  geolocateControl.addEventListener("click", () => {
    if (navigator.geolocation) {
      geolocateControl.classList.add("loading");

      navigator.geolocation.getCurrentPosition(
        (position) => {
          const userLatLng = [
            position.coords.latitude,
            position.coords.longitude,
          ];

          // Remove o marcador anterior se existir
          if (userLocationMarker) {
            map.removeLayer(userLocationMarker);
          }

          // Criar marcador com efeito pulsante
          userLocationMarker = window.L.circleMarker(userLatLng, {
            radius: 8,
            color: "#3b82f6",
            fillColor: "#60a5fa",
            fillOpacity: 0.7,
            weight: 2,
          }).addTo(map);

          // Adiciona efeito pulsante via CSS
          userLocationMarker._icon?.classList.add("pulse");

          // Adiciona círculo para mostrar precisão
          const accuracyCircle = window.L.circle(userLatLng, {
            radius: position.coords.accuracy,
            color: "rgba(59, 130, 246, 0.3)",
            fillColor: "rgba(59, 130, 246, 0.1)",
            fillOpacity: 0.4,
            weight: 1,
          }).addTo(map);

          markers.push(userLocationMarker, accuracyCircle);

          map.setView(userLatLng, 16);
          geolocateControl.classList.remove("loading");
          geolocateControl.classList.add("active");
        },
        (error) => {
          console.error("Erro ao obter localização:", error);
          geolocateControl.classList.remove("loading");
          alert(
            "Não foi possível obter sua localização. Verifique as permissões do navegador."
          );
        }
      );
    } else {
      alert("Seu navegador não suporta geolocalização.");
    }
  });
}
