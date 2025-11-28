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

// --- LÓGICA CLÁSSICA (V8) PARA ANDROID ---
messaging.setBackgroundMessageHandler(function(payload) {
  console.log('[FC Perfumaria] Background:', payload);

  // Garante que pegamos os dados, venham eles de onde vierem
  const title = payload.data.title || payload.notification.title || 'FC Perfumaria';
  const body = payload.data.body || payload.notification.body || 'Nova novidade!';
  const icon = 'https://i.imgur.com/BIXdM6M.png';

  const notificationOptions = {
    body: body,
    icon: icon,
    badge: icon,
    // A VIBRAÇÃO É O SEGREDO DO ANDROID ACORDAR
    vibrate: [300, 100, 400, 100, 400], 
    requireInteraction: true, // Obriga a ficar na tela
    tag: 'push-fc-' + Date.now(),
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
      // Se já tem aba aberta, foca nela
      for (var i = 0; i < clientList.length; i++) {
        var client = clientList[i];
        if (client.url.includes('fcperfumaria') && 'focus' in client) {
          return client.focus();
        }
      }
      // Se não, abre nova
      if (clients.openWindow) {
        return clients.openWindow('https://fcperfumaria.netlify.app');
      }
    })
  );
});
