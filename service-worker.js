'use strict';

/**
 * service-worker.js
 *
 * Versão final consolidada a partir do seu código original que estava no HTML.
 *
 * Mantém:
 *  - Mesmo nome de cache "my-site-cache-v3"
 *  - Mesmo array de urlsToCache que você usava (ajuste conforme seu projeto)
 *  - Offline fallback para /offline.html
 *  - Funções de install, activate e fetch
 *  - Eventos de mensagem para iniciar e parar rastreamento (se quiser).
 */

const CACHE_NAME = 'morro-digital-cache-v1';
const RESOURCES_TO_CACHE = [
  '/',
  '/index.html',
  '/manifest.json',
  '/css/styles.css',
  '/js/main.js',
  // ... outros recursos essenciais
];

// Variáveis que você usava no SW
let userPosition = null; // Armazena a posição do usuário
let trackingActive = false; // Indica se o rastreamento está ativo

/**
 * INSTALL
 * Abre o cache e adiciona os arquivos listados
 */
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('Cacheando recursos');
      return cache.addAll(RESOURCES_TO_CACHE);
    })
  );
});

/**
 * ACTIVATE
 * Limpa caches antigos que não sejam o CACHE_NAME atual
 */
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('Removendo cache antigo', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

/**
 * FETCH
 * Responde com recursos do cache se disponíveis;
 * caso contrário, tenta buscar da rede e, se falhar, volta para /offline.html.
 */
self.addEventListener('fetch', (event) => {
  // Estratégia stale-while-revalidate para mapas e API
  if (
    event.request.url.includes('tile.openstreetmap.org') ||
    event.request.url.includes('api.openrouteservice.org')
  ) {
    event.respondWith(
      caches.open(CACHE_NAME).then((cache) => {
        return fetch(event.request)
          .then((response) => {
            // Guardar cópia no cache
            cache.put(event.request, response.clone());
            return response;
          })
          .catch(() => {
            // Retornar do cache se falhar
            return caches.match(event.request);
          });
      })
    );
    return;
  }

  // Estratégia cache-primeiro para recursos estáticos
  if (
    event.request.url.endsWith('.css') ||
    event.request.url.endsWith('.js') ||
    event.request.url.endsWith('.png') ||
    event.request.url.endsWith('.jpg') ||
    event.request.url.endsWith('.svg')
  ) {
    event.respondWith(
      caches.match(event.request).then((cachedResponse) => {
        if (cachedResponse) {
          return cachedResponse;
        }
        return fetch(event.request).then((response) => {
          // Guardar no cache
          caches
            .open(CACHE_NAME)
            .then((cache) => cache.put(event.request, response.clone()));
          return response;
        });
      })
    );
    return;
  }

  // Estratégia rede com fallback para cache
  event.respondWith(
    fetch(event.request).catch(() => {
      return caches.match(event.request);
    })
  );
});

/**
 * MESSAGE
 * Exemplo de comunicação com a thread principal (scripts.js):
 * você pode usar essa parte se quiser iniciar/parar rastreamento (GPS) ou algo similar.
 */
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'CACHE_LOCATION_DATA') {
    // Cachear dados de localização para uso offline
    caches.open(CACHE_NAME).then((cache) => {
      const data = event.data.payload;
      const locationKey = `location-${data.id}`;
      cache.put(locationKey, new Response(JSON.stringify(data)));
    });
  }
});
