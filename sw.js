// Service worker for offline support
// Strategy: NETWORK-FIRST so updated content (letter, photos, wishes) is always
// fresh when online; cache is only a fallback for offline use.
const CACHE = 'nireshnee-birthday-v3';
const CORE = [
  './',
  './index.html',
  './style.css',
  './script.js',
  './wishes.json',
  './secret.enc.json',
  './manifest.json',
  './assets/favicon.svg',
  './assets/icon-192.png',
  './assets/icon-512.png',
  './assets/og-image.png'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE).then(cache => cache.addAll(CORE)).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', event => {
  const req = event.request;
  if (req.method !== 'GET') return;

  const url = new URL(req.url);
  // Only handle same-origin requests; let Spotify/fonts/etc. go straight to network
  if (url.origin !== self.location.origin) return;

  // Network-first: always try the network, update the cache, fall back to cache offline
  event.respondWith(
    fetch(req).then(res => {
      if (res && res.status === 200) {
        const copy = res.clone();
        caches.open(CACHE).then(cache => cache.put(req, copy));
      }
      return res;
    }).catch(() =>
      caches.match(req, { ignoreSearch: true }).then(cached =>
        cached || caches.match('./index.html')
      )
    )
  );
});
