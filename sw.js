const CACHE_NAME = 'fc-perfumaria-v1';

self.addEventListener('install', (event) => {
  // Força o SW a ativar imediatamente
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  // Limpa caches antigos se houver
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          if (cache !== CACHE_NAME) {
            return caches.delete(cache);
          }
        })
      );
    })
  );
  return self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  // Busca sempre na rede para garantir estoque atualizado
  event.respondWith(fetch(event.request));
});
