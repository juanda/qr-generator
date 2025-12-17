const CACHE_NAME = 'qr-generator-v1';
const urlsToCache = [
  '/qr-generator/',
  '/qr-generator/index.html',
  '/qr-generator/app.js',
  '/qr-generator/style.css',
  '/qr-generator/qrcode-generator.min.js',
  '/qr-generator/icons/icon-72x72.png',
  '/qr-generator/icons/icon-96x96.png',
  '/qr-generator/icons/icon-128x128.png',
  '/qr-generator/icons/icon-144x144.png',
  '/qr-generator/icons/icon-152x152.png',
  '/qr-generator/icons/icon-180x180.png',
  '/qr-generator/icons/icon-192x192.png',
  '/qr-generator/icons/icon-384x384.png',
  '/qr-generator/icons/icon-512x512.png'
];

// Install event - cache all static assets
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Opened cache');
        return cache.addAll(urlsToCache);
      })
      .then(() => self.skipWaiting())
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch event - serve from cache, fallback to network
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // Cache hit - return cached response
        if (response) {
          return response;
        }

        // Clone the request
        const fetchRequest = event.request.clone();

        return fetch(fetchRequest).then(response => {
          // Check if valid response
          if (!response || response.status !== 200 || response.type !== 'basic') {
            return response;
          }

          // Clone the response
          const responseToCache = response.clone();

          // Cache the new response
          caches.open(CACHE_NAME)
            .then(cache => {
              cache.put(event.request, responseToCache);
            });

          return response;
        });
      })
  );
});
