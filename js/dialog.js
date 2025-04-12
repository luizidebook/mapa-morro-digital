// dialog.js – Processamento de entrada do usuário e definição de respostas

import { showLocationOnMap, showAllLocationsOnMap } from "./map-controls.js";
import { intents } from "./intent-manager.js";
import { translations } from "./translations.js";
import { conversationState } from "./assistant.js";
import { locations } from "./locations.js";

/**
 * Processa a mensagem do usuário, define resposta e ação.
 * @param {string} input - Texto do usuário.
 * @param {object} context - Contexto atual da aplicação (ex: { map })
 * @returns {Promise<{ text: string, action?: Function }>}
 */
export async function processUserInput(input, context = {}) {
  const normalized = input.trim().toLowerCase();

  // Verifica se o usuário mencionou "praias"
  if (normalized.includes("praias")) {
    return {
      text: "Aqui estão todas as praias disponíveis. Estou exibindo no mapa.",
      action: () => showAllLocationsOnMap(locations.beaches),
    };
  }

  // Verifica se o usuário mencionou uma praia específica
  for (const beach of locations.beaches) {
    if (normalized.includes(beach.name.toLowerCase())) {
      return {
        text: `Aqui está a localização da ${beach.name}: ${beach.description}`,
        action: () => showLocationOnMap(beach.name, beach.lat, beach.lon),
      };
    }
  }

  // Verifica se o usuário mencionou "restaurantes"
  if (normalized.includes("restaurantes")) {
    return {
      text: "Aqui estão todos os restaurantes disponíveis. Estou exibindo no mapa.",
      action: () => showAllLocationsOnMap(locations.restaurants),
    };
  }

  // Verifica se o usuário mencionou um restaurante específico
  for (const restaurant of locations.restaurants) {
    if (normalized.includes(restaurant.name.toLowerCase())) {
      return {
        text: `Aqui está a localização do ${restaurant.name}: ${restaurant.description}`,
        action: () =>
          showLocationOnMap(restaurant.name, restaurant.lat, restaurant.lon),
      };
    }
  }

  // Verifica se o usuário mencionou "hotéis"
  if (normalized.includes("hotéis") || normalized.includes("pousadas")) {
    return {
      text: "Aqui estão todos os hotéis e pousadas disponíveis. Estou exibindo no mapa.",
      action: () => showAllLocationsOnMap(locations.hotels),
    };
  }

  // Verifica se o usuário mencionou um hotel específico
  for (const hotel of locations.hotels) {
    if (normalized.includes(hotel.name.toLowerCase())) {
      return {
        text: `Aqui está a localização do ${hotel.name}: ${hotel.description}`,
        action: () => showLocationOnMap(hotel.name, hotel.lat, hotel.lon),
      };
    }
  }

  // Verifica se o usuário mencionou "lojas"
  if (normalized.includes("lojas") || normalized.includes("compras")) {
    return {
      text: "Aqui estão todas as lojas disponíveis. Estou exibindo no mapa.",
      action: () => showAllLocationsOnMap(locations.shops),
    };
  }

  // Verifica se o usuário mencionou uma loja específica
  for (const shop of locations.shops) {
    if (normalized.includes(shop.name.toLowerCase())) {
      return {
        text: `Aqui está a localização da loja ${shop.name}: ${shop.description}`,
        action: () => showLocationOnMap(shop.name, shop.lat, shop.lon),
      };
    }
  }

  // Verifica se o usuário mencionou "atrações"
  if (
    normalized.includes("atrações") ||
    normalized.includes("pontos turísticos")
  ) {
    return {
      text: "Aqui estão todas as atrações disponíveis. Estou exibindo no mapa.",
      action: () => showAllLocationsOnMap(locations.attractions),
    };
  }

  // Verifica se o usuário mencionou uma atração específica
  for (const attraction of locations.attractions) {
    if (normalized.includes(attraction.name.toLowerCase())) {
      return {
        text: `Aqui está a localização da atração ${attraction.name}: ${attraction.description}`,
        action: () =>
          showLocationOnMap(attraction.name, attraction.lat, attraction.lon),
      };
    }
  }

  // Resposta padrão para entradas não reconhecidas
  return {
    text: "Desculpe, não entendi. Você pode perguntar sobre praias, restaurantes, pousadas, lojas ou atrações.",
  };
}
