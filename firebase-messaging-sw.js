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

// O Segredo: Lidar com a mensagem em background manualmente
messaging.onBackgroundMessage((payload) => {
  console.log('[FC Perfumaria] Push Recebido:', payload);

  // Tenta pegar do DATA (Android) ou do Notification (padrão)
  const notificationTitle = payload.data.title || payload.notification.title;
  const notificationBody = payload.data.body || payload.notification.body;
  const notificationIcon = payload.data.icon || 'https://i.imgur.com/BIXdM6M.png';
  const targetUrl = payload.data.url || '/';

  const notificationOptions = {
    body: notificationBody,
    icon: notificationIcon,
    // Removi 'badge' pois causa erro se não for monocromático no Android
    vibrate: [200, 100, 200],
    tag: 'fc-promo-' + Date.now(), // Garante que não substitua a anterior
    renotify: true,
    data: {
        url: targetUrl
    }
  };

  return self.registration.showNotification(notificationTitle, notificationOptions);
});

// Clique na notificação
self.addEventListener('notificationclick', function(event) {
  event.notification.close();
  event.waitUntil(
    clients.openWindow(event.notification.data.url)
  );
});
