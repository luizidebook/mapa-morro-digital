'use strict';

const CACHE_NAME = 'my-site-cache-v4';
const urlsToCache = [
  '/', // index.html
  '/styles.css',
  '/scripts.js',
  '/images/logo.png',
  '/offline.html',
  '/css/main.css',
  '/css/map.css',
];

let userPosition = null;
let trackingActive = false;

// INSTALL: Cacheia os recursos e força a ativação imediata do novo SW.
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('Abrindo cache...');
      return cache.addAll(urlsToCache);
    })
  );
});

// ACTIVATE: Limpa caches antigos e assume o controle das páginas imediatamente.
self.addEventListener('activate', (event) => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (!cacheWhitelist.includes(cacheName)) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

// FETCH: Aplica estratégia Stale-While-Revalidate para requisições GET.
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      return (
        response ||
        fetch(event.request).catch(() => {
          if (event.request.mode === 'navigate') {
            return caches.match('/offline.html');
          }
        })
      );
    })
  );
});

// BACKGROUND SYNC: Sincroniza dados offline pendentes quando a conexão for restabelecida.
self.addEventListener('sync', (event) => {
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
self.addEventListener('message', (event) => {
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
      position: userPosition,
    });
  }
});
