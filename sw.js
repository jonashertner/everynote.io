// Service Worker for everynote
// Update VERSION when deploying new changes to bust cache
const VERSION = '2';
const CACHE_NAME = `everynote-v${VERSION}`;
const urlsToCache = [
    '/',
    '/index.html',
    '/manifest.json'
];

// Install event - cache resources
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => {
                return cache.addAll(urlsToCache.map(url => new Request(url, { cache: 'reload' })));
            })
            .catch(() => {
                // Silent fail - app works without service worker cache
            })
    );
    // Force new service worker to activate immediately
    self.skipWaiting();
});

// Activate event - clean up ALL old caches
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cacheName) => {
                    // Delete ANY cache that doesn't match current version
                    if (cacheName !== CACHE_NAME) {
                        return caches.delete(cacheName);
                    }
                })
            );
        }).then(() => {
            // Take control of all clients immediately
            return self.clients.claim();
        })
    );
});

// Fetch event - network-first strategy for HTML, cache-first for static assets
self.addEventListener('fetch', (event) => {
    // Skip non-GET requests
    if (event.request.method !== 'GET') {
        return;
    }

    // Skip Firebase and external API requests
    if (event.request.url.includes('firebase') ||
        event.request.url.includes('googleapis') ||
        event.request.url.includes('gstatic')) {
        return;
    }

    const url = new URL(event.request.url);

    // For HTML pages, use network-first strategy
    if (event.request.mode === 'navigate' ||
        url.pathname === '/' ||
        url.pathname.endsWith('.html')) {
        event.respondWith(
            fetch(event.request)
                .then((response) => {
                    // Clone and cache successful response
                    if (response && response.status === 200) {
                        const responseToCache = response.clone();
                        caches.open(CACHE_NAME).then((cache) => {
                            cache.put(event.request, responseToCache);
                        });
                    }
                    return response;
                })
                .catch(() => {
                    // Network failed, try cache
                    return caches.match(event.request).then((cachedResponse) => {
                        return cachedResponse || caches.match('/index.html');
                    });
                })
        );
        return;
    }

    // For other assets, use cache-first with network fallback
    event.respondWith(
        caches.match(event.request)
            .then((response) => {
                // Return cached version or fetch from network
                return response || fetch(event.request).then((networkResponse) => {
                    // Don't cache if not a valid response
                    if (!networkResponse || networkResponse.status !== 200 || networkResponse.type !== 'basic') {
                        return networkResponse;
                    }

                    // Clone the response
                    const responseToCache = networkResponse.clone();

                    caches.open(CACHE_NAME)
                        .then((cache) => {
                            cache.put(event.request, responseToCache);
                        });

                    return networkResponse;
                });
            })
            .catch(() => {
                // Return offline page if available
                return caches.match('/index.html');
            })
    );
});

// Listen for messages from the main app
self.addEventListener('message', (event) => {
    if (event.data && event.data.type === 'SKIP_WAITING') {
        self.skipWaiting();
    }
});
