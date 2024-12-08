const CACHE_NAME = 'my-site-cache-v1'; // Atualizado para uma nova versão do cache
const urlsToCache = [
  '/',
  '/styles.css',
  '/scripts.js',
  '/images/logo.png',
  'enhancedNavigation.js',
  'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
];

self.addEventListener('install', event => {
  event.waitUntil(
    (async () => {
      const cache = await caches.open(CACHE_NAME);
      try {
        await cache.addAll(urlsToCache);
        console.log('All resources have been fetched and cached.');
      } catch (error) {
        console.error('Failed to cache resources:', error);
      }
    })()
  );
});

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
        console.error('Fetch failed; returning offline page instead:', error);
        const cache = await caches.open(CACHE_NAME);
        const offlinePage = await cache.match('/offline.html');
        return offlinePage;
      }
    })()
  );
});

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
      console.log('Old caches cleared.');
    })()
  );
});

self.addEventListener('message', event => {
  if (event.data.action === 'skipWaiting') {
    self.skipWaiting();
  }
});

self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            console.log('Arquivos em cache.');
            return cache.addAll(URLS_TO_CACHE);
        })
    );
});

self.addEventListener('fetch', (event) => {
    event.respondWith(
        caches.match(event.request).then((response) => {
            return response || fetch(event.request);
        })
    );
});