const CACHE_NAME = 'my-site-cache-v2'; // Atualizado para a nova versão do cache
const urlsToCache = [
  '/',
  '/styles.css',
  '/scripts.js',
  '/images/logo.png',
  '/offline.html',
];

let userPosition = null; // Armazena a posição do usuário
let trackingActive = false; // Indica se o rastreamento está ativo

// Instalação do Service Worker
self.addEventListener('install', event => {
  event.waitUntil(
    (async () => {
      const cache = await caches.open(CACHE_NAME);
      try {
        await cache.addAll(urlsToCache);
        console.log('Todos os recursos foram buscados e armazenados em cache.');
      } catch (error) {
        console.error('Falha ao armazenar recursos em cache:', error);
      }
    })()
  );
});

// Ativação do Service Worker
self.addEventListener('activate', event => {
  event.waitUntil(
    (async () => {
      const cacheNames = await caches.keys();
      const cacheWhitelist = [CACHE_NAME];
      await Promise.all(
        cacheNames.map(cacheName => {
          if (!cacheWhitelist.includes(cacheName)) {
            return caches.delete(cacheName);
          }
        })
      );
      console.log('Caches antigos foram limpos.');
    })()
  );
});

// Intercepta solicitações de rede
self.addEventListener('fetch', event => {
  event.respondWith(
    (async () => {
      const cachedResponse = await caches.match(event.request);
      if (cachedResponse) {
        return cachedResponse;
      }
      
      try {
        const networkResponse = await fetch(event.request);
        if (!networkResponse || networkResponse.status !== 200 || networkResponse.type !== 'basic') {
          return networkResponse;
        }
        
        const responseToCache = networkResponse.clone();
        const cache = await caches.open(CACHE_NAME);
        cache.put(event.request, responseToCache);
        
        return networkResponse;
      } catch (error) {
        console.error('Falha no fetch; retornando a página offline:', error);
        const cache = await caches.open(CACHE_NAME);
        const offlinePage = await cache.match('/offline.html');
        return offlinePage;
      }
    })()
  );
});

// Comunicação bidirecional entre o Service Worker e a página
self.addEventListener('message', event => {
  const { action, payload } = event.data;

  if (action === 'startTracking') {
    console.log('Iniciando rastreamento de localização...');
    trackingActive = true;
    startPositionTracking();
  } else if (action === 'stopTracking') {
    console.log('Parando rastreamento de localização...');
    trackingActive = false;
    stopPositionTracking();
  } else if (action === 'getCurrentPosition') {
    event.source.postMessage({
      action: 'currentPosition',
      payload: userPosition || { error: 'Localização não disponível.' },
    });
  }
});

// Inicia o rastreamento da posição do usuário
function startPositionTracking() {
  if (!trackingActive || !navigator.geolocation) return;

  try {
    navigator.geolocation.watchPosition(
      position => {
        userPosition = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        };
        console.log('Posição atual:', userPosition);

        // Envia a posição atual para a página
        self.clients.matchAll().then(clients => {
          clients.forEach(client => {
            client.postMessage({
              action: 'positionUpdate',
              payload: userPosition,
            });
          });
        });
      },
      error => {
        console.error('Erro ao rastrear posição:', error.message);
      },
      { enableHighAccuracy: true, maximumAge: 10000, timeout: 15000 }
    );
  } catch (error) {
    console.error('Erro ao iniciar rastreamento de localização:', error);
  }
}

// Para o rastreamento da posição do usuário
function stopPositionTracking() {
  // Implementar lógica para parar watchPosition, se necessário.
  userPosition = null;
  console.log('Rastreamento de localização interrompido.');
}
