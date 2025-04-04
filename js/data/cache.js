// Variáveis de destino e localização do usuário
export let userLocation = null; // Última localização conhecida do usuário (atualizada pelo GPS)
// Variável global para o ID do watchPosition (armazenada na propriedade window.positionWatcher)
export let positionWatcher = null;

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

  --- 5.2. Destinos, LocalStorage e Histórico ---
 /**
 * 1. loadDestinationsFromCache - Carrega destinos salvos do cache (ou Service Worker). */
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
 * 2. getLocalStorageItem - Recupera item do localStorage, parseando JSON.
 */
export function getLocalStorageItem(key) {
  const item = localStorage.getItem(key);
  try {
    // Verifica se o valor é JSON antes de tentar parsear
    if (item && (item.startsWith('{') || item.startsWith('['))) {
      return JSON.parse(item); // Tenta converter o valor para JSON
    }
    return item; // Retorna o valor bruto se não for JSON válido
  } catch (error) {
    console.error(`Erro ao analisar JSON para a chave ${key}:`, error);
    return item; // Retorna o valor bruto em caso de erro
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
 * 5. saveDestinationToCache - Salva destino selecionado no cache local.
 */
export function saveDestinationToCache(destination) {
  try {
    localStorage.setItem('selectedDestination', JSON.stringify(destination));
    console.log(
      '[saveDestinationToCache] Destino salvo no cache:',
      destination
    );
  } catch (error) {
    console.error(
      '[saveDestinationToCache] Erro ao salvar destino no cache:',
      error
    );
  }
}

/**
 * 6. saveRouteToHistory - Salva rota no histórico (localStorage).
 */
export function saveRouteToHistory(route) {
  const historyStr = localStorage.getItem('routeHistory') || '[]';
  const history = JSON.parse(historyStr);
  history.push(route);
  localStorage.setItem('routeHistory', JSON.stringify(history));
  console.log('Rota salva no histórico (routeHistory).');
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

/**
 * 10. getSelectedDestination - Retorna o destino selecionado do cache (localStorage).
 */
export function getSelectedDestination() {
  return new Promise((resolve, reject) => {
    try {
      const destination = JSON.parse(
        localStorage.getItem('selectedDestination')
      );
      if (destination && destination.lat && destination.lon) {
        resolve(destination);
      } else {
        reject(new Error('Destino inválido ou não encontrado no cache.'));
      }
    } catch (error) {
      reject(new Error('Erro ao recuperar destino do cache.'));
    }
  });
}

/**
 * 11. sendDestinationToServiceWorker - envia os dados do destino para o service worker.
 */
export function sendDestinationToServiceWorker(destination) {
  if (navigator.serviceWorker.controller) {
    navigator.serviceWorker.controller.postMessage({
      action: 'saveDestination',
      payload: destination,
    });
    console.log(
      '[sendDestinationToServiceWorker] Destino enviado para o Service Worker:',
      destination
    );
  } else {
    console.error(
      '[sendDestinationToServiceWorker] Service Worker não está ativo.'
    );
  }
}

/**
 * 12. displayOSMData - Exibe dados do OpenStreetMap no submenu e adiciona marcadores no mapa.
 */
export function displayOSMData(data, subMenuId, feature) {
  const subMenu = document.getElementById(subMenuId);
  subMenu.innerHTML = '';

  data.elements.forEach((element) => {
    if (element.type === 'node' && element.tags.name) {
      const btn = document.createElement('button');
      btn.className = 'submenu-item submenu-button';
      btn.textContent = element.tags.name;
      btn.setAttribute('data-destination', element.tags.name);

      const description =
        element.tags.description || 'Descrição não disponível';

      btn.onclick = () => {
        handleSubmenuButtons(
          element.lat,
          element.lon,
          element.tags.name,
          description,
          element.tags.images || [],
          feature
        );
      };

      subMenu.appendChild(btn);

      const marker = L.marker([element.lat, element.lon])
        .addTo(map)
        .bindPopup(`<b>${element.tags.name}</b><br>${description}`);
      markers.push(marker);
    }
  });
}
