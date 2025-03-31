/**===========================================================================
CACHE, PERSISTÊNCIA & HISTÓRICO
===========================================================================
  --- Cache de POIs e Rota ---
/**
 * 1. cacheRouteData - Salva dados da rota (instruções e polyline) no cache local (localStorage).
 */
export function cacheRouteData(routeInstructions, routeLatLngs) {
  if (typeof localStorage === 'undefined') {
    console.warn('LocalStorage não está disponível.');
    return;
  }
  try {
    const data = {
      instructions: routeInstructions,
      route: routeLatLngs,
      timestamp: Date.now(),
    };
    localStorage.setItem('cachedRoute', JSON.stringify(data));
    console.log('[cacheRouteData] Rota salva no cache local (localStorage).');
    showNotification('Rota salva em cache para uso offline.', 'success');
  } catch (err) {
    console.error('[cacheRouteData] Erro ao salvar rota no cache:', err);
    showNotification(
      getGeneralText('routeDataError', navigationState.lang),
      'error'
    );
  }
}

/*
 * 2. loadRouteFromCache - Carrega rota salva do cache (localStorage). */
export function loadRouteFromCache() {
  if (typeof localStorage === 'undefined') {
    console.warn('LocalStorage não está disponível.');
    return null;
  }
  try {
    const dataStr = localStorage.getItem('cachedRoute');
    if (!dataStr) {
      console.warn('[loadRouteFromCache] Nenhuma rota salva no cache.');
      return null;
    }
    const data = JSON.parse(dataStr);
    console.log('[loadRouteFromCache] Rota carregada do cache:', data);
    showNotification('Rota carregada do cache com sucesso.', 'info');
    return data;
  } catch (err) {
    console.error('[loadRouteFromCache] Erro ao carregar rota do cache:', err);
    showNotification(
      getGeneralText('routeDataError', navigationState.lang),
      'error'
    );
    return null;
  }
} /*

  --- Destinos, LocalStorage e Histórico ---
 /**
 * 3. loadDestinationsFromCache - Carrega destinos salvos do cache (ou Service Worker). */
export function loadDestinationsFromCache(callback) {
  if (navigator.serviceWorker.controller) {
    navigator.serviceWorker.controller.postMessage({
      command: 'loadDestinations',
    });
    navigator.serviceWorker.onmessage = (event) => {
      if (event.data.command === 'destinationsLoaded') {
        callback(event.data.data);
      }
    };
  } else {
    console.error('Service worker não está ativo.');
  }
} /*

/**
 * 4. getLocalStorageItem - Recupera item do localStorage, parseando JSON.
 */
/**
 * 4. getLocalStorageItem - Recupera item do localStorage, parseando JSON se necessário.
 * @param {string} key - Chave do item no localStorage
 * @param {any} defaultValue - Valor padrão se o item não existir
 * @returns {any} Valor convertido do localStorage ou defaultValue
 */
/**
 * 2. getLocalStorageItem - Recupera item do localStorage, parseando JSON.
 */
export function getLocalStorageItem(key) {
  const item = localStorage.getItem(key);
  try {
    return JSON.parse(item); // Tenta converter o valor para JSON
  } catch (error) {
    console.error(`Erro ao analisar JSON para a chave ${key}:`, error);
    return item; // Retorna o valor bruto se não for JSON válido
  }
}

/**
 * 3. setLocalStorageItem - Define item no localStorage, convertendo para JSON.
 */
export function setLocalStorageItem(key, value) {
  localStorage.setItem(key, JSON.stringify(value)); // Armazena o valor de forma segura como JSON
}

/**
 * 4. removeLocalStorageItem - Remove item do localStorage por chave.
 */
export function removeLocalStorageItem(key) {
  try {
    localStorage.removeItem(key);
  } catch (error) {
    console.error(`Erro ao remover item do localStorage (${key}):`, error);
  }
}

/**
 * 7. saveSearchQueryToHistory - Salva query de pesquisa no histórico.
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
      console.error('IndexedDB error:', event.target.errorCode);
      reject(event.target.errorCode);
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
