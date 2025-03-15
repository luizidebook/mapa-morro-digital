"use strict";

const CACHE_NAME = 'my-site-cache-v3';
const urlsToCache = [
  '/',
  '/styles.css',
  '/scripts.js',
  '/images/logo.png',
  '/offline.html'
];

let userPosition = null;
let trackingActive = false;

// INSTALL: Cacheia os recursos e força a ativação imediata do novo SW.
self.addEventListener('install', event => {
  event.waitUntil(
    (async () => {
      try {
        const cache = await caches.open(CACHE_NAME);
        await cache.addAll(urlsToCache);
        console.log('Recursos armazenados em cache com sucesso.');
      } catch (error) {
        console.error('Erro ao armazenar recursos em cache:', error);
      }
      // Força a ativação imediata
      await self.skipWaiting();
    })()
  );
});

// ACTIVATE: Limpa caches antigos e assume o controle das páginas imediatamente.
self.addEventListener('activate', event => {
  event.waitUntil(
    (async () => {
      try {
        const cacheNames = await caches.keys();
        const cacheWhitelist = [CACHE_NAME];
        await Promise.all(
          cacheNames.map(cacheName => {
            if (!cacheWhitelist.includes(cacheName)) {
              return caches.delete(cacheName);
            }
          })
        );
        console.log('Caches antigos limpos.');
      } catch (error) {
        console.error('Erro ao limpar caches antigos:', error);
      }
      // Faz com que o SW controle imediatamente as páginas
      await self.clients.claim();
    })()
  );
});

// FETCH: Aplica estratégia Stale-While-Revalidate para requisições GET.
self.addEventListener('fetch', event => {
  // Se a requisição não for GET, não interferir com o cache.
  if (event.request.method !== "GET") {
    return;
  }
  
  event.respondWith(
    (async () => {
      try {
        // Tenta obter a resposta do cache.
        const cachedResponse = await caches.match(event.request);
        
        // Tenta buscar da rede e atualiza o cache se obtiver sucesso.
        const fetchPromise = fetch(event.request)
          .then(networkResponse => {
            if (networkResponse && networkResponse.ok) {
              caches.open(CACHE_NAME).then(cache => {
                cache.put(event.request, networkResponse.clone());
              });
            }
            return networkResponse;
          })
          .catch(err => {
            console.error('Erro ao buscar da rede:', err);
            // Se a requisição espera HTML, retorna o offline.html.
            if (event.request.headers.get('accept')?.includes('text/html')) {
              return caches.match('/offline.html');
            }
          });
        
        // Retorna a resposta do cache imediatamente ou aguarda a rede.
        return cachedResponse || await fetchPromise;
      } catch (error) {
        console.error('Erro no fetch handler:', error);
        if (event.request.headers.get('accept')?.includes('text/html')) {
          return caches.match('/offline.html');
        }
      }
    })()
  );
});

// BACKGROUND SYNC: Sincroniza dados offline pendentes quando a conexão for restabelecida.
self.addEventListener('sync', event => {
  if (event.tag === 'syncOfflineData') {
    event.waitUntil(syncOfflineData());
  }
});

/**
 * Função de sincronização de dados offline.
 * Aqui você pode implementar a lógica para enviar dados pendentes ao servidor.
 */
async function syncOfflineData() {
  try {
    console.log('Sincronizando dados offline...');
    // Implemente aqui a lógica de sincronização, por exemplo, lendo dados pendentes de IndexedDB.
    // Exemplo: await sendPendingDataToServer();
    console.log('Sincronização offline concluída.');
  } catch (error) {
    console.error('Erro durante a sincronização offline:', error);
  }
}

// MESSAGE: Comunicação entre o SW e a thread principal (scripts.js).
self.addEventListener('message', event => {
  const { action } = event.data;
  if (action === 'startTracking') {
    trackingActive = true;
  } else if (action === 'stopTracking') {
    trackingActive = false;
  } else if (action === 'saveUserPosition') {
    userPosition = event.data.position;
  } else if (action === 'getStoredPosition') {
    event.source.postMessage({ 
      action: 'storedPosition', 
      position: userPosition 
    });
  }
});
