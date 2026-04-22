const CACHE_NAME = 'safetap-v1';
const ASSETS = [
  '/',
  '/index.html',
  '/css/styles.css',
  '/js/app.js',
  '/js/auth.js',
  '/js/emergency.js',
  '/js/utils.js',
  '/js/profile.js',
  '/js/caregiver.js',
  '/js/meds.js',
  '/js/history.js',
  '/js/toast.js',
  '/manifest.json'
];

// Install Event - Caching Core Assets
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(ASSETS))
      .then(() => self.skipWaiting())
  );
});

// Activate Event - Cleaning old caches
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys => {
      return Promise.all(
        keys.filter(key => key !== CACHE_NAME)
          .map(key => caches.delete(key))
      );
    })
  );
});

// Fetch Strategy: Cache First for core assets, bypass external APIs
self.addEventListener('fetch', event => {
  // Ignore non-GET requests (like form submissions or legacy API POSTs)
  if (event.request.method !== 'GET') return;

  // Ignore external API calls to prevent fetch errors for non-existent endpoints
  if (event.request.url.includes('api.safetap.io')) return;

  event.respondWith(
    caches.match(event.request)
      .then(response => response || fetch(event.request))
  );
});