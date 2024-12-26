const CACHE_NAME = 'my-site-cache-v3'; // Atualizado para a nova versão do cache
const urlsToCache = [
  '/',
  '/styles.css',
  '/scripts.js',
  '/images/logo.png',
  '/offline.html',
];

let userPosition = null; // Armazena a posição do usuário
let trackingActive = false; // Indica se o rastreamento está ativo

const DB_NAME = 'navigationStateDB';
const DB_VERSION = 1;

self.addEventListener('install', event => {
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
      console.log('Caches antigos limpos.');
    })()
  );
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request).then(cachedResponse => {
      return cachedResponse || fetch(event.request).catch(() => {
        return caches.match('/offline.html');
      });
    })
  );
});


self.addEventListener('message', event => {
  const { action, payload } = event.data;
  if (action === 'startTracking') {
    console.log('Iniciando rastreamento...');
    trackingActive = true;
    startPositionTracking();
  } else if (action === 'stopTracking') {
    console.log('Parando rastreamento...');
    trackingActive = false;
    stopPositionTracking();
  }
});

function startPositionTracking() {
  if (!trackingActive || !navigator.geolocation) {
    console.warn('Geolocalização não suportada ou rastreamento inativo.');
    return;
  }

  navigator.geolocation.watchPosition(
    position => {
      userPosition = {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
      };
      console.log('Posição atualizada:', userPosition);
      self.clients.matchAll().then(clients => {
        clients.forEach(client => {
          client.postMessage({ action: 'positionUpdate', payload: userPosition });
        });
      });
    },
    error => {
      console.error('Erro ao rastrear posição:', error.message);
      self.clients.matchAll().then(clients => {
        clients.forEach(client => {
          client.postMessage({ action: 'trackingError', payload: error.message });
        });
      });
    },
    { enableHighAccuracy: true, maximumAge: 10000, timeout: 15000 }
  );
}

function stopPositionTracking() {
  userPosition = null;
  console.log('Rastreamento interrompido.');
}

// IndexedDB - Armazena o estado de navegação
async function saveNavigationState(routeData) {
    const db = await openDB(DB_NAME, DB_VERSION, {
        upgrade(db) {
            if (!db.objectStoreNames.contains('routes')) {
                db.createObjectStore('routes', { keyPath: 'id' });
            }
        },
    });
    const tx = db.transaction('routes', 'readwrite');
    tx.store.put({ id: 'currentRoute', data: routeData });
    await tx.done;
    console.log('Estado de navegação salvo em IndexedDB.');
}

// Ativa rastreamento com baixa precisão (Eco Mode)
function enableEcoModeTracking() {
    navigator.geolocation.watchPosition(
        (position) => {
            userPosition = {
                latitude: position.coords.latitude,
                longitude: position.coords.longitude,
            };
            console.log('🌱 Modo Eco - Posição Atualizada:', userPosition);
        },
        (error) => {
            console.warn('Erro no rastreamento Eco Mode:', error.message);
        },
        {
            enableHighAccuracy: false,
            maximumAge: 10000,
            timeout: 20000,
        }
    );
}

// Recalculo de rota offline
async function handleRouteDeviationOffline() {
    const db = await openDB(DB_NAME, DB_VERSION);
    const routeData = await db.get('routes', 'currentRoute');

    if (routeData) {
        console.log('Recalculando rota offline...');
        self.clients.matchAll().then((clients) => {
            clients.forEach((client) => {
                client.postMessage({ action: 'recalculateOffline', payload: routeData.data });
            });
        });
    } else {
        console.warn('Nenhuma rota salva para recalculo offline.');
    }
}

// Feedback Tátil (Haptic Feedback)
function triggerHapticFeedback(type) {
    if ('vibrate' in navigator) {
        if (type === 'recalculating') {
            navigator.vibrate([200, 100, 200]);  // Vibração dupla ao recalcular rota
        } else if (type === 'waypoint') {
            navigator.vibrate(100);  // Vibração leve ao atingir waypoint
        }
    }
}

// Cache de POIs (Pontos de Interesse)
async function cachePOIs(pois) {
    const db = await openDB(DB_NAME, DB_VERSION, {
        upgrade(db) {
            if (!db.objectStoreNames.contains('pois')) {
                db.createObjectStore('pois', { keyPath: 'id' });
            }
        },
    });
    const tx = db.transaction('pois', 'readwrite');
    pois.forEach((poi) => {
        tx.store.put(poi);
    });
    await tx.done;
    console.log('POIs armazenados em cache para uso offline.');
}
