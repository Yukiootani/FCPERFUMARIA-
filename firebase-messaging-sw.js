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

// CORREÇÃO: Lê os dados manuais (DATA) para evitar a mensagem genérica
messaging.onBackgroundMessage((payload) => {
  console.log('[FC Perfumaria] Background:', payload);

  // Pega do DATA (que mandamos como custom_*) ou fallback para notification
  const title = payload.data.custom_title || payload.notification.title || 'FC Perfumaria';
  const body = payload.data.custom_body || payload.notification.body || 'Nova novidade!';
  const icon = payload.data.custom_icon || 'https://cdn-icons-png.flaticon.com/512/2771/2771401.png';
  
  const notificationOptions = {
    body: body,
    icon: icon,
    badge: icon,
    vibrate: [500, 200, 500], // Vibra forte
    tag: 'fc-push-' + Date.now(), // Tag única
    renotify: true, // Toca som mesmo se tiver outra
    requireInteraction: true, // Fica na tela
    data: {
        url: payload.data.click_action || 'https://fcperfumaria.netlify.app'
    }
  };

  return self.registration.showNotification(title, notificationOptions);
});

self.addEventListener('notificationclick', function(event) {
  event.notification.close();
  event.waitUntil(clients.openWindow('https://fcperfumaria.netlify.app'));
});
