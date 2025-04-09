/**
 * Módulo para conexão com a API do OpenStreetMap
 */

// Configurações da API
const OSM_API_CONFIG = {
  baseUrl: "https://api.openstreetmap.org/api/0.6",
  headers: {
    "User-Agent": "Morro-Digital-Map/1.0 (contato@morrodigital.com)",
    Accept: "application/json",
  },
  rateLimit: 1000, // 1 requisição por segundo
};

// Cache simples para armazenar respostas
const apiCache = new Map();
let lastRequestTime = 0;

/**
 * Realiza uma requisição respeitando o rate limit
 * @param {string} endpoint - Endpoint da API
 * @param {Object} options - Opções da requisição
 * @returns {Promise<Object>} - Dados da resposta
 */
async function makeRequest(endpoint, options = {}) {
  const url = `${OSM_API_CONFIG.baseUrl}${endpoint}`;
  const cacheKey = url + JSON.stringify(options);

  // Verificar cache
  if (apiCache.has(cacheKey)) {
    console.log("Usando dados em cache para:", url);
    return apiCache.get(cacheKey);
  }

  // Respeitar rate limit
  const now = Date.now();
  const timeToWait = Math.max(
    0,
    lastRequestTime + OSM_API_CONFIG.rateLimit - now
  );
  if (timeToWait > 0) {
    await new Promise((resolve) => setTimeout(resolve, timeToWait));
  }

  // Registrar tempo da requisição
  lastRequestTime = Date.now();

  // Realizar requisição
  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        ...OSM_API_CONFIG.headers,
        ...(options.headers || {}),
      },
    });

    if (!response.ok) {
      throw new Error(
        `Erro na API OSM: ${response.status} ${response.statusText}`
      );
    }

    const data = await response.json();

    // Armazenar no cache (válido por 1 hora)
    apiCache.set(cacheKey, data);
    setTimeout(() => apiCache.delete(cacheKey), 3600000);

    return data;
  } catch (error) {
    console.error("Erro ao acessar API OSM:", error);
    throw error;
  }
}

/**
 * Obtém detalhes de um nó (node) por ID
 * @param {number} nodeId - ID do nó
 * @returns {Promise<Object>} - Dados do nó
 */
export async function getNode(nodeId) {
  return makeRequest(`/node/${nodeId}`);
}

/**
 * Obtém detalhes de um caminho (way) por ID
 * @param {number} wayId - ID do caminho
 * @returns {Promise<Object>} - Dados do caminho
 */
export async function getWay(wayId) {
  return makeRequest(`/way/${wayId}`);
}

/**
 * Obtém detalhes de uma relação (relation) por ID
 * @param {number} relationId - ID da relação
 * @returns {Promise<Object>} - Dados da relação
 */
export async function getRelation(relationId) {
  return makeRequest(`/relation/${relationId}`);
}

/**
 * Obtém elementos (nodes, ways, relations) em uma área específica
 * @param {number} minLat - Latitude mínima
 * @param {number} minLon - Longitude mínima
 * @param {number} maxLat - Latitude máxima
 * @param {number} maxLon - Longitude máxima
 * @returns {Promise<Object>} - Dados dos elementos na área
 */
export async function getMapData(minLat, minLon, maxLat, maxLon) {
  // Verificar tamanho máximo da área (0.25 graus quadrados)
  const area = (maxLat - minLat) * (maxLon - minLon);
  if (area > 0.25) {
    throw new Error(
      "Área muito grande. Máximo permitido: 0.25 graus quadrados"
    );
  }

  return makeRequest(`/map?bbox=${minLon},${minLat},${maxLon},${maxLat}`);
}

/**
 * Limpa o cache da API
 */
export function clearApiCache() {
  apiCache.clear();
  console.log("Cache da API OSM limpo");
}

export default {
  getNode,
  getWay,
  getRelation,
  getMapData,
  clearApiCache,
};
