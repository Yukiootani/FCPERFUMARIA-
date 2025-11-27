importScripts('https://www.gstatic.com/firebasejs/8.10.0/firebase-app.js');
importScripts('https://www.gstatic.com/firebasejs/8.10.0/firebase-messaging.js');

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

// --- CORREÇÃO AQUI: USANDO O COMANDO CERTO DA VERSÃO 8 ---
messaging.setBackgroundMessageHandler(function(payload) {
  console.log('[FC Perfumaria] Background:', payload);

  // Tenta pegar o título/corpo do DATA ou do NOTIFICATION
  const title = payload.data.title || payload.notification.title || 'FC Perfumaria';
  const body = payload.data.body || payload.notification.body || 'Nova novidade!';
  const icon = 'https://i.imgur.com/BIXdM6M.png'; 

  const notificationOptions = {
    body: body,
    icon: icon,
    badge: icon, // Ícone pequeno (Android)
    vibrate: [200, 100, 200],
    requireInteraction: true, // Fica na tela até clicar
    data: {
      url: 'https://fcperfumaria.netlify.app'
    }
  };

  return self.registration.showNotification(title, notificationOptions);
});

// Clique na notificação
self.addEventListener('notificationclick', function(event) {
  event.notification.close();
  event.waitUntil(
    clients.matchAll({type: 'window', includeUncontrolled: true}).then(function(clientList) {
      // Se tiver uma aba aberta, foca nela
      for (var i = 0; i < clientList.length; i++) {
        var client = clientList[i];
        if (client.url.includes('fcperfumaria') && 'focus' in client) {
          return client.focus();
        }
      }
      // Senão, abre nova
      if (clients.openWindow) {
        return clients.openWindow('https://fcperfumaria.netlify.app');
      }
    })
  );
});
