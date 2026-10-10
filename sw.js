const CACHE_NAME = 'spacetime-v2'; // Bump this version number
const urlsToCache = [
  './',
  './index.html',
  // other assets...
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(urlsToCache))
      .then(() => self.skipWaiting()) // Forces the new service worker to activate immediately
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName); // Deletes the old cache containing the broken file
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});
