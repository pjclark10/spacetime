const CACHE_NAME = 'spacetime-v14';
const ASSETS = [
    '/spacetime/',
    '/spacetime/index.html',
    '/spacetime/manifest.json',
    '/spacetime/icon-192.png',
    '/spacetime/icon-512.png'
];

// Install Event
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

    event.respondWith(
        caches.match(event.request).then((cachedResponse) => {
            if (cachedResponse) {
                return cachedResponse;
            }
            return fetch(event.request).catch((err) => {
                // Return root cached index page as fallback for navigation requests
                if (event.request.mode === 'navigate') {
                    return caches.match('/spacetime/index.html') || caches.match('/spacetime/');
                }
            });
        })
    );
});
