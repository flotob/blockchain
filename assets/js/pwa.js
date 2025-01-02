---
layout: none
---
// Register service worker for PWA functionality
if ('serviceWorker' in navigator) {
  window.addEventListener('load', async () => {
    try {
      const registration = await navigator.serviceWorker.register('/service-worker.js?v={{ site.data.version.hash }}');
      console.log('ServiceWorker registered for image caching');

      // Check for updates periodically (every hour)
      setInterval(async () => {
        try {
          await registration.update();
        } catch (error) {
          console.log('Update check failed:', error);
        }
      }, 60 * 60 * 1000);

    } catch (error) {
      console.error('ServiceWorker registration failed:', error);
    }
  });

  // Handle service worker updates
  navigator.serviceWorker.addEventListener('controllerchange', () => {
    // New service worker took over
    console.log('New service worker active');
  });
} 