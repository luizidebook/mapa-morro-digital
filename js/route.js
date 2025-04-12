// route.js – Cálculo e exibição de rotas no mapa
/*  O que esse módulo faz:
Usa a API de Geolocalização do navegador para obter a posição do usuário.
Envia um request à OpenRouteService para gerar uma rota a pé.
Renderiza a rota no mapa com estilo customizado.
Remove rotas anteriores ao traçar uma nova.*/

import { clearMarkers } from "./map-control.js";

let currentRoute = null;

/**
 * Obtém a localização atual do usuário.
 * @returns {Promise<{ lat: number, lon: number }>}
 */
export function getCurrentLocation() {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      return reject("Geolocalização não suportada.");
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          lat: position.coords.latitude,
          lon: position.coords.longitude,
        });
      },
      (error) => reject("Erro ao obter localização: " + error.message)
    );
  });
}

/**
 * Traça e exibe uma rota entre o ponto atual e o destino.
 * @param {object} map - Instância do Leaflet
 * @param {object} destination - { name: string, lat: number, lon: number }
 */
export async function plotRouteOnMap(map, destination) {
  try {
    const origin = await getCurrentLocation();
    clearMarkers();

    const apiKey = "5b3ce3597851110001cf62480e27ce5b5dcf4e75a9813468e027d0d3"; // Substitua pela sua chave real
    const response = await fetch(
      "https://api.openrouteservice.org/v2/directions/foot-walking/geojson",
      {
        method: "POST",
        headers: {
          Authorization: apiKey,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          coordinates: [
            [origin.lon, origin.lat],
            [destination.lon, destination.lat],
          ],
        }),
      }
    );

    const data = await response.json();

    if (currentRoute) {
      map.removeLayer(currentRoute);
    }

    currentRoute = L.geoJSON(data, {
      style: {
        color: "#3388ff",
        weight: 5,
        opacity: 0.8,
      },
    }).addTo(map);

    map.fitBounds(currentRoute.getBounds());
  } catch (err) {
    console.error("[ROTA] Erro ao traçar rota:", err);
  }
}

/**
 * 1.1. startRouteCreation
 * Inicia a criação de uma nova rota.
 */

export async function startRouteCreation() {
  if (!selectedDestination || !validateDestination(selectedDestination)) {
    console.error(
      "[startRouteCreation] Destino inválido. Selecione um destino válido."
    );
    return;
  }

  try {
    console.log("[startRouteCreation] Iniciando criação de rota...");
    const userLocation = await getCurrentLocation();
    if (!userLocation) {
      console.error("[startRouteCreation] Localização do usuário não obtida.");
      return;
    }

    const routeData = await createRoute(userLocation);
    if (!routeData) {
      console.error(
        "[startRouteCreation] Erro ao criar rota. Fluxo interrompido."
      );
      return;
    }

    currentRouteData = routeData;
    console.log(
      "[startRouteCreation] Rota criada com sucesso:",
      currentRouteData
    );
    showRouteSummary();
  } catch (error) {
    console.error(
      "[startRouteCreation] Erro ao iniciar criação de rota:",
      error.message
    );
  }
}

/**
 * 1.2. createRoute
 * Cria uma rota a partir da localização do usuário até o destino selecionado.
 *
 * @param {Object} userLocation - Localização do usuário ({ latitude, longitude }).
 * @returns {Object|null} - Dados da rota ou null em caso de erro.
 */
export async function createRoute(userLocation) {
  try {
    validateDestination();

    const routeData = await plotRouteOnMap(
      userLocation.latitude,
      userLocation.longitude,
      selectedDestination.lat,
      selectedDestination.lon
    );

    if (!routeData) {
      showNotification("Erro ao calcular rota. Tente novamente.", "error");
      return null;
    }

    // Atualiza currentRouteData com os dados da rota
    currentRouteData = routeData;

    finalizeRouteMarkers(
      userLocation.latitude,
      userLocation.longitude,
      selectedDestination
    );
    return routeData;
  } catch (error) {
    console.error("Erro ao criar rota:", error);
    showNotification(
      "Erro ao criar rota. Verifique sua conexão e tente novamente.",
      "error"
    );
    return null;
  }
}

/////////////////////////////
// 2. FUNÇÕES AUXILIARES
/////////////////////////////

/**
 * 2.1. validateSelectedDestination
 * Valida se o destino selecionado é válido.
 */
/**
 * 3. validateDestination
 * Verifica se o destino fornecido (ou o global selectedDestination) possui coordenadas válidas.
 * Agora também verifica os limites geográficos.
 * @param {Object} [destination=selectedDestination] - Objeto com as propriedades lat e lon.
 * @returns {boolean} - true se o destino for válido; false caso contrário. */
export function validateDestination(destination = selectedDestination) {
  console.log("[validateDestination] Verificando destino...");

  if (!destination) {
    console.warn("[validateDestination] Destino não fornecido.");
    return false;
  }

  const { lat, lon, name, description, feature } = destination;
  if (
    typeof lat !== "number" ||
    typeof lon !== "number" ||
    Number.isNaN(lat) ||
    Number.isNaN(lon) ||
    !name ||
    !description ||
    !feature
  ) {
    console.warn("[validateDestination] Propriedades inválidas:", destination);
    return false;
  }

  if (lat < -90 || lat > 90 || lon < -180 || lon > 180) {
    console.warn(
      "[validateDestination] Coordenadas fora dos limites:",
      destination
    );
    return false;
  }

  console.log("[validateDestination] Destino válido:", destination);
  return true;
}
