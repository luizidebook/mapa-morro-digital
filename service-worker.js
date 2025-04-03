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

const CACHE_NAME = 'my-site-cache-v3'; // Nome que você já usava
const urlsToCache = [
  '/',
  '/styles.css',
  '/scripts.js',
  '/images/logo.png', // Ajuste conforme seus assets
  '/offline.html',
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
    (async () => {
      const cache = await caches.open(CACHE_NAME);
      try {
        await cache.addAll(urlsToCache);
        console.log('Recursos armazenados em cache com sucesso.');
      } catch (error) {
        console.error('Erro ao armazenar recursos em cache:', error);
      }
    })()
  );
});

/**
 * ACTIVATE
 * Limpa caches antigos que não sejam o CACHE_NAME atual
 */
self.addEventListener('activate', (event) => {
  event.waitUntil(
    (async () => {
      const cacheNames = await caches.keys();
      const cacheWhitelist = [CACHE_NAME];
      await Promise.all(
        cacheNames.map((cacheName) => {
          if (!cacheWhitelist.includes(cacheName)) {
            return caches.delete(cacheName);
          }
        })
      );
      console.log('Caches antigos limpos.');
    })()
  );
});

/**
 * FETCH
 * Responde com recursos do cache se disponíveis;
 * caso contrário, tenta buscar da rede e, se falhar, volta para /offline.html.
 */
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      return (
        cachedResponse ||
        fetch(event.request).catch(() => {
          // Verifica se a requisição espera um conteúdo HTML
          if (event.request.headers.get('accept').includes('text/html')) {
            return caches.match('/offline.html');
          }
        })
      );
    })
  );
});

/**
 * MESSAGE
 * Exemplo de comunicação com a thread principal (scripts.js):
 * você pode usar essa parte se quiser iniciar/parar rastreamento (GPS) ou algo similar.
 */
self.addEventListener('message', (event) => {
  const { action, payload } = event.data;

  if (action === 'saveDestination') {
    console.log('[Service Worker] Salvando destino:', payload);
    self.selectedDestination = payload;
  }
});
