self.addEventListener('install', (e) => {
    console.log('[FC Perfumaria] Service Worker Instalado');
    self.skipWaiting();
});

self.addEventListener('activate', (e) => {
    console.log('[FC Perfumaria] Service Worker Ativo');
    return self.clients.claim();
});

self.addEventListener('fetch', (e) => {
    // Estratégia simples: Apenas busca na rede (Network Only) para garantir dados frescos de estoque
    e.respondWith(fetch(e.request));
});
