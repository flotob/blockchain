---
layout: none
---
const VERSION_HASH = '{{ site.data.version.hash }}';
const CACHE_NAME = `portfolio-images-${VERSION_HASH}`;

// Only handle image requests
function isImageRequest(request) {
  return request.destination === 'image' || 
         request.url.match(/\.(png|jpg|jpeg|gif|webp|ico|svg)$/i);
}

// Install event - we don't pre-cache anything
self.addEventListener('install', (event) => {
  self.skipWaiting(); // Activate new service worker immediately
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name.startsWith('portfolio-images-') && name !== CACHE_NAME)
          .map((name) => caches.delete(name))
      );
    })
  );
});

// Fetch event - only cache images
self.addEventListener('fetch', (event) => {
  if (!isImageRequest(event.request)) {
    return; // Let browser handle non-image requests normally
  }

  event.respondWith(
    // Try network first
    fetch(event.request)
      .then((response) => {
        if (response && response.status === 200) {
          // Cache a copy of the image response
          const responseToCache = response.clone();
          caches.open(CACHE_NAME)
            .then((cache) => {
              cache.put(event.request, responseToCache);
            });
        }
        return response;
      })
      .catch(() => {
        // On network failure, try cache
        return caches.match(event.request);
      })
  );
}); 