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

// RECEBE A MENSAGEM INVISÍVEL (DATA) E TORNA ELA VISÍVEL
messaging.onBackgroundMessage((payload) => {
  console.log('[FC Perfumaria] Data Push:', payload);

  // Pega os dados brutos
  const title = payload.data.title;
  const body = payload.data.body;
  const icon = payload.data.icon;
  const url = payload.data.url;

  const notificationOptions = {
    body: body,
    icon: icon,
    badge: icon, // Ícone monocromático pequeno
    vibrate: [200, 100, 200, 100, 200, 100, 200], // Vibração longa para chamar atenção
    tag: 'fc-notification-' + payload.data.timestamp, // Tag única
    renotify: true, // Obriga a tocar som
    requireInteraction: true, // Não some até clicar
    data: {
        url: url
    }
  };

  return self.registration.showNotification(title, notificationOptions);
});

// CLIQUE NA NOTIFICAÇÃO
self.addEventListener('notificationclick', function(event) {
  event.notification.close();
  event.waitUntil(
    clients.matchAll({type: 'window', includeUncontrolled: true}).then(function(clientList) {
      if (clientList.length > 0) {
        let client = clientList[0];
        if ('focus' in client) return client.focus();
      }
      if (clients.openWindow) {
        return clients.openWindow(event.notification.data.url);
      }
    })
  );
});
