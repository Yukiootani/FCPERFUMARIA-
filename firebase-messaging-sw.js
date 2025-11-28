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

// --- CORREÇÃO PARA ANDROID ---
// Isso impede a mensagem "Site atualizado em segundo plano"
messaging.setBackgroundMessageHandler(function(payload) {
  console.log('[FC Perfumaria] Background:', payload);

  // Prioriza pegar os dados que mandamos dentro de 'data'
  const title = payload.data.title || payload.notification.title;
  const body = payload.data.body || payload.notification.body;
  const icon = payload.data.icon || 'https://cdn-icons-png.flaticon.com/512/2771/2771401.png';
  const url = payload.data.url || 'https://fcperfumaria.netlify.app';

  const notificationOptions = {
    body: body,
    icon: icon,
    badge: icon, // Ícone pequeno monocromático (se possível)
    vibrate: [200, 100, 200, 100, 200], // Vibração padrão
    tag: 'fc-promo-' + Date.now(), // Garante nova notificação
    renotify: true, // Força tocar som novamente
    data: {
      url: url
    }
  };

  return self.registration.showNotification(title, notificationOptions);
});

// Clique na notificação
self.addEventListener('notificationclick', function(event) {
  event.notification.close();
  // Abre o site
  event.waitUntil(
    clients.matchAll({type: 'window', includeUncontrolled: true}).then(function(clientList) {
      if (clientList.length > 0) {
        let client = clientList[0];
        if ('focus' in client) { return client.focus(); }
      }
      if (clients.openWindow) {
        return clients.openWindow(event.notification.data.url);
      }
    })
  );
});
