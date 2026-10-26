const CACHE_NAME = 'spacetime-v17';
const ASSETS = [
    '/spacetime/',
    '/spacetime/index.html',
    '/spacetime/minkowski.html', // ADD THIS LINE TO CACHE YOUR PHYSICAL PROPERTIES
    '/spacetime/manifest.json',
    '/spacetime/icon-192.png',
    '/spacetime/icon-512.png',
    'https://cloudflare.com',
    'https://jsdelivr.net'
];

// Install Event: Save files to cache
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            return cache.addAll(ASSETS);
        }).then(() => self.skipWaiting())
    );
});

// Activate Event
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((keys) => {
            return Promise.all(
                keys.map((key) => {
                    if (key !== CACHE_NAME) {
                        return caches.delete(key);
                    }
                })
            );
        }).then(() => self.clients.claim())
    );
});
// Fetch Event
self.addEventListener('fetch', (event) => {
    if (event.request.method !== 'GET') return;

    // 1. For HTML / Navigation requests: Try network first so updates appear instantly
    if (event.request.mode === 'navigate' || event.request.destination === 'document') {
        event.respondWith(
            fetch(event.request)
                .then((networkResponse) => {
                    return caches.open(CACHE_NAME).then((cache) => {
                        cache.put(event.request, networkResponse.clone());
                        return networkResponse;
                    });
                })
                .catch(() => {
                    // Fallback to cache if offline
                    return caches.match(event.request) || caches.match('/spacetime/') || caches.match('/spacetime/index.html');
                })
        );
        return;
    }

    // 2. For static assets (icons, manifest): Cache-First
    event.respondWith(
        caches.match(event.request).then((cachedResponse) => {
            return cachedResponse || fetch(event.request);
        })
    );
});
