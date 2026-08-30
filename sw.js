const CACHE_NAME = 'school-teacher-data-v1';
const ASSETS_TO_CACHE = [
  './',
  './index.html', // Update this if your HTML file has a different name
  // Add paths to any specific icons you use here, e.g., './icon-192.png'
];

// Install Event: Cache essential files for offline use
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(ASSETS_TO_CACHE))
      .then(() => self.skipWaiting())
  );
});

// Activate Event: Clean up old cache versions
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          if (cache !== CACHE_NAME) {
            return caches.delete(cache);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch Event: Network-first strategy with offline fallback
self.addEventListener('fetch', (event) => {
  // Ignore external API POST requests (Google Apps Script)
  if (event.request.method === 'POST' || event.request.url.includes('script.google.com')) {
    return;
  }

  event.respondWith(
    fetch(event.request)
      .then((response) => {
        // Clone the response and update the cache for future offline use
        const responseClone = response.clone();
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, responseClone);
        });
        return response;
      })
      .catch(() => {
        // If network fails, serve from cache
        return caches.match(event.request);
      })
  );
});
