const CACHE_NAME = 'op-tracker-v12';
const urlsToCache = [
  './',
  './index.html',
  './manifest.json'
];

// Instalação do Service Worker
self.addEventListener('install', (event) => {
  self.skipWaiting(); // Força o novo Service Worker a ativar-se imediatamente
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(urlsToCache))
  );
});

// Ativação e eliminação automática de caches antigas
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          if (cache !== CACHE_NAME) {
            console.log('A eliminar cache antiga:', cache);
            return caches.delete(cache);
          }
        })
      );
    })
  );
  self.clients.claim(); // Assume o controlo das páginas abertas imediatamente
});

// Estratégia Network-First: Procura sempre a versão mais recente na rede!
self.addEventListener('fetch', (event) => {
  event.respondWith(
    fetch(event.request)
      .then((response) => {
        // Se conseguir resposta da rede, atualiza a cache com a nova versão
        if (response && response.status === 200 && response.type === 'basic') {
          const responseToCache = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });
        }
        return response;
      })
      .catch(() => {
        // Se estiver offline/sem rede, aí sim carrega da cache
        return caches.match(event.request);
      })
  );
});
