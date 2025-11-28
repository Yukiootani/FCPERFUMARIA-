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

// 🚨 CORREÇÃO CRÍTICA 🚨
// Esse código impede que o Android mostre a mensagem genérica "Site atualizado..."
messaging.onBackgroundMessage(function(payload) {
  console.log('[FC Perfumaria] Background:', payload);

  // Pega os dados manuais que enviamos no 'data'
  const title = payload.data.custom_title || 'FC Perfumaria';
  const body = payload.data.custom_body || 'Nova novidade!';
  
  const notificationOptions = {
    body: body,
    icon: 'https://www.gstatic.com/mobilesdk/160503_mobilesdk/logo/2x/firebase_28dp.png', // Ícone Padrão Google (Não falha)
    tag: 'fc-promo-' + Date.now(),
    renotify: true,
    requireInteraction: true,
    vibrate: [300, 100, 300], // Vibração
    data: {
      url: payload.data.custom_url || 'https://fcperfumaria.netlify.app'
    }
  };

  // RETORNA A PROMESSA (Isso avisa o Android que terminamos e ele exibe o texto correto)
  return self.registration.showNotification(title, notificationOptions);
});

self.addEventListener('notificationclick', function(event) {
  event.notification.close();
  event.waitUntil(
    clients.matchAll({type: 'window'}).then(windowClients => {
      for (var i = 0; i < windowClients.length; i++) {
        var client = windowClients[i];
        if (client.url.includes('fcperfumaria') && 'focus' in client) {
          return client.focus();
        }
      }
      if (clients.openWindow) {
        return clients.openWindow(event.notification.data.url);
      }
    })
  );
});
