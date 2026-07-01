/* Minimal service worker — enables PWA install + a graceful offline fallback for
   navigations. Intentionally conservative (no aggressive caching of API/medical data). */
const CACHE = 'clinic-os-v1';

self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(CACHE).then((c) => c.addAll(['/'])).catch(() => {}));
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.mode !== 'navigate') return; // never touch sub-resources / API / signed-file fetches
  const url = new URL(request.url);
  // Only offline-fallback for same-origin APP pages. API + signed medical-file
  // navigations (e.g. /api/files/report/...) must always hit the network (no stale shell).
  if (url.origin !== self.location.origin || url.pathname.startsWith('/api/')) return;
  event.respondWith(fetch(request).catch(() => caches.match('/')));
});
