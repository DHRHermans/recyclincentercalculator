const CACHE = 'recycle-calc-v9';
const ASSETS = [
  './',
  './index.html',
  './manifest.webmanifest',
  './icon-192.png',
  './icon-512.png'
];

self.addEventListener('install', event => {
  self.skipWaiting();

  event.waitUntil(
    caches.open(CACHE)
      .then(cache => cache.addAll(ASSETS))
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(keys =>
        Promise.all(
          keys
            .filter(key => key !== CACHE)
            .map(key => caches.delete(key))
        )
      )
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', event => {

  // HTML-pagina: probeer altijd eerst de nieuwste versie
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request)
        .then(response => {
          const copy = response.clone();

          caches.open(CACHE)
            .then(cache => cache.put('./index.html', copy));

          return response;
        })
        .catch(() => caches.match('./index.html'))
    );

    return;
  }

  // Andere bestanden
  event.respondWith(
    fetch(event.request)
      .then(response => {

        if (event.request.method === 'GET' && response.ok) {
          const copy = response.clone();

          caches.open(CACHE)
            .then(cache => cache.put(event.request, copy));
        }

        return response;
      })
      .catch(() => caches.match(event.request))
  );
});
