const CACHE = 'unidos-sem-nocao-v11-npc-composition';
const SHELL = [
  './', './index.html', './style.css', './game.js', './manifest.webmanifest', './icon.svg',
  './assets/roster/roster-data.js'
];

self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(CACHE).then((cache) => cache.addAll(SHELL)));
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(caches.keys().then((keys) => Promise.all(keys.filter((key) => key !== CACHE).map((key) => caches.delete(key)))));
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;
  event.respondWith(caches.match(event.request).then((cached) => {
    if (cached) return cached;
    return fetch(event.request).then(async (response) => {
      if (response.ok && new URL(event.request.url).origin === self.location.origin) {
        const copy = response.clone();
        await caches.open(CACHE).then((cache) => cache.put(event.request, copy));
      }
      return response;
    }).catch(() => {
      if (event.request.mode === 'navigate') return caches.match('./index.html');
      return Response.error();
    });
  }));
});
