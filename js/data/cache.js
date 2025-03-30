// Importações necessárias
import { navigationState, searchHistory } from '../core/state.js';
import { showNotification } from '../ui/notifications.js';
import { getGeneralText } from '../ui/texts.js';

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

/**
 * 2. loadRouteFromCache - Carrega rota salva do cache (localStorage).
 */
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
}

/**
 * 3. getLocalStorageItem - Recupera item do localStorage, parseando JSON.
 */
export function getLocalStorageItem(key, defaultValue = null) {
  const item = localStorage.getItem(key);
  try {
    return item ? JSON.parse(item) : defaultValue;
  } catch (error) {
    console.error(`Erro ao analisar JSON para a chave ${key}:`, error);
    return defaultValue;
  }
}

/**
 * 4. setLocalStorageItem - Define item no localStorage, convertendo para JSON.
 */
export function setLocalStorageItem(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
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
 * 6. loadSearchHistory - Carrega o histórico de buscas do localStorage e exibe na interface.
 */
export function loadSearchHistory() {
  const history = getLocalStorageItem('searchHistory', []);
  searchHistory.length = 0; // Limpa o array global
  searchHistory.push(...history); // Atualiza a variável global

  const historyContainer = document.getElementById('search-history-container');
  if (historyContainer) {
    historyContainer.innerHTML = '';
    history.forEach((query) => {
      const historyItem = document.createElement('div');
      historyItem.className = 'history-item';
      historyItem.textContent = query;
      historyContainer.appendChild(historyItem);
    });
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
 * 8. loadOfflineInstructions - Carrega instruções offline (ex.: localStorage).
 */
export function loadOfflineInstructions() {
  const cachedInstr = localStorage.getItem('offlineInstructions');
  if (cachedInstr) {
    return JSON.parse(cachedInstr);
  } else {
    console.warn('Nenhuma instrução offline encontrada.');
    return [];
  }
}

/**
 * 9. loadSearchHistory
 *    Carrega o histórico de buscas do localStorage e exibe na interface.
 */
export function loadSearchHistory() {
  const history = getLocalStorageItem('searchHistory', []);
  searchHistory = history; // Atualiza a variável global

  const historyContainer = document.getElementById('search-history-container');
  if (historyContainer) {
    historyContainer.innerHTML = '';
    history.forEach((query) => {
      const historyItem = document.createElement('div');
      historyItem.className = 'history-item';
      historyItem.textContent = query;
      historyContainer.appendChild(historyItem);
    });
  }
}
