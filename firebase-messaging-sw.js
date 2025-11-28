// ATUALIZAÇÃO: Usando bibliotecas mais recentes (v9 Compat)
importScripts('https://www.gstatic.com/firebasejs/9.22.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.22.0/firebase-messaging-compat.js');

const firebaseConfig = {
    apiKey: "AIzaSyDxyqFLm08rqlaemlyYI9gQfrjvddPelJs",
    authDomain: "fc-perfumaria-309fb.firebaseapp.com",
    projectId: "fc-perfumaria-309fb",
    storageBucket: "fc-perfumaria-309fb.firebasestorage.app",
    messagingSenderId: "311935363734",
    appId: "1:311935363734:web:a85cf6ccd93c67d594f0b7"
};

firebase.initializeApp(firebaseConfig);
const messaging = firebase.messaging();

// LÓGICA DE FUNDO (BACKGROUND)
// O Android às vezes esconde notificações sem canal definido. Vamos forçar.
messaging.onBackgroundMessage((payload) => {
  console.log('[FC Perfumaria] Background Push:', payload);

  const notificationTitle = payload.notification.title || payload.data.title;
  const notificationOptions = {
    body: payload.notification.body || payload.data.body,
    icon: 'https://cdn-icons-png.flaticon.com/512/2771/2771401.png', // Ícone externo (teste)
    
    // Força máxima
    tag: 'renotify-tag-' + Date.now(),
    renotify: true,
    requireInteraction: true,
    
    // Dados para o clique
    data: {
        url: payload.data.url || 'https://fcperfumaria.netlify.app'
    }
  };

  return self.registration.showNotification(notificationTitle, notificationOptions);
});

// CLIQUE
self.addEventListener('notificationclick', function(event) {
  event.notification.close();
  event.waitUntil(
    clients.matchAll({type: 'window', includeUncontrolled: true}).then(windowClients => {
      // Se tiver aba aberta, usa ela
      for (var i = 0; i < windowClients.length; i++) {
        var client = windowClients[i];
        if (client.url.includes('fcperfumaria') && 'focus' in client) {
          return client.focus();
        }
      }
      // Senão abre nova
      if (clients.openWindow) {
        return clients.openWindow(event.notification.data.url);
      }
    })
  );
});
