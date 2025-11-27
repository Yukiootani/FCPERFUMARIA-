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

// MODO BACKGROUND (Tela Bloqueada ou App Fechado)
messaging.onBackgroundMessage((payload) => {
  console.log('[FC Perfumaria] Background Push:', payload);

  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
    icon: 'https://cdn-icons-png.flaticon.com/512/2771/2771401.png',
    badge: 'https://cdn-icons-png.flaticon.com/512/2771/2771401.png',
    vibrate: [200, 100, 200], // Vibração Padrão
    data: {
        url: 'https://fcperfumaria.netlify.app'
    }
  };

  return self.registration.showNotification(notificationTitle, notificationOptions);
});

// CLIQUE NA NOTIFICAÇÃO
self.addEventListener('notificationclick', function(event) {
  event.notification.close();
  // Tenta abrir a janela do site
  event.waitUntil(
    clients.matchAll({type: 'window', includeUncontrolled: true}).then(windowClients => {
      for (var i = 0; i < windowClients.length; i++) {
        var client = windowClients[i];
        if (client.url.includes('fcperfumaria.netlify.app') && 'focus' in client) {
          return client.focus();
        }
      }
      if (clients.openWindow) {
        return clients.openWindow('https://fcperfumaria.netlify.app');
      }
    })
  );
});
