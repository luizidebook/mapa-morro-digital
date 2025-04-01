/**===========================================================================
CACHE, PERSISTÊNCIA & HISTÓRICO
===========================================================================
  --- Cache de POIs e Rota ---
/**
 * 1. cacheRouteData - Salva dados da rota (instruções e polyline) no cache local (localStorage).
 */
import { showNotification } from '../ui/notifications.js';

export let selectedDestination = null; // Permitir reatribuição
export let cachedRoute = null; // Permitir reatribuição
/**
 * 5. saveDestinationToCache - Salva destino selecionado no cache local.
 */
export function saveDestinationToLocalStorage(destination) {
  return new Promise((resolve, reject) => {
    if (!isLocalStorageAvailable()) {
      console.warn('localStorage não está disponível. Destino não será salvo.');
      reject(new Error('localStorage não está disponível.'));
      return;
    }

    try {
      if (!destination || !destination.name) {
        console.error(
          'Destino inválido para salvar no Local Storage:',
          destination
        );
        reject(new Error('Destino inválido.'));
        return;
      }

      console.log('Salvando destino no Local Storage:', destination);
      localStorage.setItem('selectedDestination', JSON.stringify(destination));
      resolve();
    } catch (error) {
      console.error('Erro ao salvar destino no Local Storage:', error);
      reject(new Error('Erro ao salvar destino no Local Storage.'));
    }
  });
}

export function loadDestinationFromLocalStorage() {
  try {
    const destination = localStorage.getItem('selectedDestination');
    if (!destination) {
      console.warn('Nenhum destino salvo no Local Storage.');
      return null;
    }
    console.log('Destino carregado do Local Storage:', JSON.parse(destination));
    return JSON.parse(destination);
  } catch (error) {
    console.error('Erro ao carregar destino do Local Storage:', error);
    return null;
  }
}

export function cacheRouteData(routeData) {
  if (!isLocalStorageAvailable()) {
    console.warn('localStorage não está disponível. Dados não serão salvos.');
    return;
  }
  try {
    const data = {
      instructions: routeData.instructions || [],
      route: routeData.route || [],
      distance: routeData.distance || 0,
      duration: routeData.duration || 0,
      timestamp: Date.now(),
    };
    localStorage.setItem('cachedRoute', JSON.stringify(data));
    console.log('[cacheRouteData] Rota salva no cache local (localStorage).');
    showNotification('Rota salva em cache.', 'success');
  } catch (err) {
    console.error('[cacheRouteData] Erro ao salvar rota no cache:', err);
    showNotification('Erro ao salvar rota no cache.', 'error');
  }
}

//  --- 5.2. Destinos, LocalStorage e Histórico ---
/**
 * 1. loadDestinationsFromCache - Carrega destinos salvos do cache (ou Service Worker). */
export function loadDestinationsFromCache(callback) {
  const destination = loadDestinationFromLocalStorage();
  if (destination) {
    callback([destination]);
  } else {
    console.warn('Nenhum destino encontrado no cache.');
  }
}

/*
 * 2. loadRouteFromCache - Carrega rota salva do cache (localStorage). */
export function loadRouteFromCache() {
  if (!isLocalStorageAvailable()) {
    console.warn('localStorage não está disponível.');
    return null;
  }
  try {
    const dataStr = localStorage.getItem('cachedRoute');
    if (!dataStr) {
      console.warn('[loadRouteFromCache] Nenhuma rota salva no cache.');
      return null;
    }
    const data = JSON.parse(dataStr);
    if (!data.route || !data.instructions) {
      console.warn(
        '[loadRouteFromCache] Dados da rota incompletos no cache:',
        data
      );
      return null;
    }
    console.log('[loadRouteFromCache] Rota carregada do cache:', data);
    showNotification('Rota carregada do cache com sucesso.', 'info');
    return data;
  } catch (err) {
    console.error('[loadRouteFromCache] Erro ao carregar rota do cache:', err);
    showNotification('Erro ao carregar rota do cache.', 'error');
    return null;
  }
}

/**
 * 3. getLocalStorageItem - Recupera item do localStorage, parseando JSON se necessário.
 * @param {string} key - Chave do item no localStorage
 * @param {any} defaultValue - Valor padrão se o item não existir
 * @returns {any} Valor convertido do localStorage ou defaultValue
 */
export function getLocalStorageItem(key, defaultValue) {
  const item = localStorage.getItem(key);
  try {
    // Verifica se o valor é um JSON válido
    return item && (item.startsWith('{') || item.startsWith('['))
      ? JSON.parse(item)
      : item || defaultValue;
  } catch (error) {
    console.error(`Erro ao analisar JSON para a chave ${key}:`, error);
    return defaultValue; // Retorna o valor padrão se não for JSON válido
  }
}

/**
 * 4. setLocalStorageItem - Define item no localStorage, convertendo para JSON.
 */
export function setLocalStorageItem(key, value) {
  localStorage.setItem(key, JSON.stringify(value)); // Armazena o valor de forma segura como JSON
}

/**
 * 5. removeLocalStorageItem - Remove item do localStorage por chave.
 */
export function removeLocalStorageItem(key) {
  try {
    localStorage.removeItem(key);
  } catch (error) {
    console.error(`Erro ao remover item do localStorage (${key}):`, error);
  }
}

/**
 * 6. saveSearchQueryToHistory - Salva query de pesquisa no histórico.
 */
export function saveSearchQueryToHistory(query) {
  const searchHistoryStr = localStorage.getItem('searchHistory') || '[]';
  const searchHistoryArr = JSON.parse(searchHistoryStr);
  searchHistoryArr.push(query);
  localStorage.setItem('searchHistory', JSON.stringify(searchHistoryArr));
  console.log('Consulta de pesquisa salva no histórico:', query);
}

/**
 * 12. openOfflineCacheDB
 * Abre (ou cria) o banco de dados IndexedDB para cache offline.
 * @returns {Promise<IDBDatabase>} Promise que resolve com a instância do banco de dados.
 */
export function openOfflineCacheDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('OfflineCacheDB', 1);
    request.onerror = (event) => {
      console.error('Erro ao abrir IndexedDB:', event.target.errorCode);
      reject(new Error('Erro ao abrir IndexedDB'));
    };
    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains('routes')) {
        db.createObjectStore('routes', { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains('destinations')) {
        db.createObjectStore('destinations', { keyPath: 'id' });
      }
    };
    request.onsuccess = (event) => {
      resolve(event.target.result);
    };
  });
}

/**
 * 13. cacheRouteDataOffline
 * Cacheia os dados da rota no IndexedDB.
 * @param {string} id - Identificador único para os dados (por exemplo, uma concatenação de coordenadas ou um hash).
 * @param {Object} routeData - Dados da rota a serem armazenados.
 * @returns {Promise<boolean>} Promise que resolve com true em caso de sucesso.
 */
export async function cacheRouteDataOffline(id, routeData) {
  const db = await openOfflineCacheDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(['routes'], 'readwrite');
    const store = transaction.objectStore('routes');
    const request = store.put({ id, data: routeData, timestamp: Date.now() });
    request.onsuccess = () => {
      console.log('Route data cached offline.');
      resolve(true);
    };
    request.onerror = (event) => {
      console.error('Error caching route data:', event);
      reject(event);
    };
  });
}

/**
 * 14. getRouteDataOffline
 * Recupera os dados de rota cacheados do IndexedDB.
 * @param {string} id - Identificador usado para armazenar os dados.
 * @returns {Promise<Object>} Promise que resolve com os dados cacheados ou undefined.
 */
export async function getRouteDataOffline(id) {
  const db = await openOfflineCacheDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(['routes'], 'readonly');
    const store = transaction.objectStore('routes');
    const request = store.get(id);
    request.onsuccess = (event) => {
      resolve(event.target.result);
    };
    request.onerror = (event) => {
      console.error('Error retrieving route data:', event);
      reject(event);
    };
  });
}

/**
 * Send message to service worker and wait for response
 * @param {Object} message - Message to send to service worker
 * @returns {Promise} - Promise that resolves with the service worker's response
 */
export function messageServiceWorker(message) {
  return new Promise((resolve, reject) => {
    // Check if service worker is ready
    if (!navigator.serviceWorker.controller) {
      reject(new Error('Service worker not ready'));
      return;
    }

    // Create a message channel for the response
    const messageChannel = new MessageChannel();

    // Set up the response handler
    messageChannel.port1.onmessage = (event) => {
      if (event.data.error) {
        reject(new Error(event.data.error));
      } else {
        resolve(event.data);
      }
    };

    // Send the message
    navigator.serviceWorker.controller.postMessage(message, [
      messageChannel.port2,
    ]);
  });
}

/**
 * Check if localStorage is available
 * @returns {boolean} True if localStorage is available, false otherwise
 */
export function isLocalStorageAvailable() {
  try {
    const testKey = '__test__';
    localStorage.setItem(testKey, 'test');
    localStorage.removeItem(testKey);
    return true;
  } catch (error) {
    console.warn('localStorage não está disponível:', error);
    return false;
  }
}

/**
 *  getSelectedDestination - Retorna o destino selecionado do cache (localStorage).
 */
export function getSelectedDestination() {
  return new Promise((resolve, reject) => {
    try {
      console.log(
        '[getSelectedDestination] Tentando carregar destino do localStorage...'
      );
      const destinationStr = localStorage.getItem('selectedDestination');
      if (!destinationStr) {
        console.warn(
          '[getSelectedDestination] Nenhum destino encontrado no localStorage.'
        );
        reject(new Error('Nenhum destino encontrado no localStorage.'));
        return;
      }

      const destination = JSON.parse(destinationStr);
      if (destination && destination.name) {
        console.log(
          '[getSelectedDestination] Destino recuperado do localStorage:',
          destination
        );
        if (!selectedDestination) {
          selectedDestination = {}; // Inicializa o objeto, se necessário
        }
        selectedDestination.name = destination.name;
        selectedDestination.lat = destination.lat;
        selectedDestination.lon = destination.lon;
        console.log(
          '[getSelectedDestination] selectedDestination atualizado:',
          selectedDestination
        );
        resolve(destination);
      } else {
        console.warn(
          '[getSelectedDestination] Destino inválido recuperado do localStorage:',
          destination
        );
        reject(new Error('Destino inválido recuperado do localStorage.'));
      }
    } catch (error) {
      console.error(
        '[getSelectedDestination] Erro ao resgatar destino do localStorage:',
        error
      );
      reject(new Error('Erro ao resgatar destino do localStorage.'));
    }
  });
}

/**
 * 6. saveRouteToHistory - Salva rota no histórico (localStorage).
 */
export function saveRouteToHistory(route) {
  if (!isLocalStorageAvailable()) {
    console.warn('localStorage não está disponível. Histórico não será salvo.');
    return;
  }
  try {
    const historyStr = localStorage.getItem('routeHistory') || '[]';
    const history = JSON.parse(historyStr);

    // Evita duplicação de rotas no histórico
    const isDuplicate = history.some(
      (item) =>
        item.route && JSON.stringify(item.route) === JSON.stringify(route.route)
    );
    if (isDuplicate) {
      console.warn('[saveRouteToHistory] Rota já existe no histórico.');
      return;
    }

    history.push(route);
    localStorage.setItem('routeHistory', JSON.stringify(history));
    console.log('[saveRouteToHistory] Rota salva no histórico (routeHistory).');
  } catch (err) {
    console.error(
      '[saveRouteToHistory] Erro ao salvar rota no histórico:',
      err
    );
  }
}
