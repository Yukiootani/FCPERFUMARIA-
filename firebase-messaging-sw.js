importScripts('https://www.gstatic.com/firebasejs/8.10.0/firebase-app.js');
importScripts('https://www.gstatic.com/firebasejs/8.10.0/firebase-messaging.js');

// 1. CHAVES DA FC PERFUMARIA (Não pode ser a antiga!)
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

// 2. CONFIGURAÇÃO DO BACKGROUND (Tela Bloqueada)
messaging.onBackgroundMessage((payload) => {
  console.log('[FC Perfumaria] Notificação Background:', payload);

  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
    icon: 'https://cdn-icons-png.flaticon.com/512/2771/2771401.png', // Ícone de Perfume
    badge: 'https://cdn-icons-png.flaticon.com/512/2771/2771401.png', // Ícone pequeno na barra (Android)
    color: '#1B263B', // Cor Azul Marinho da marca
    data: {
        url: payload.notification.click_action || 'https://fcperfumaria.netlify.app'
    }
  };

  return self.registration.showNotification(notificationTitle, notificationOptions);
});

// 3. CLIQUE NA NOTIFICAÇÃO (Abrir o Site)
self.addEventListener('notificationclick', function(event) {
  event.notification.close();
  // Abre o site quando clica no aviso
  event.waitUntil(
    clients.matchAll({type: 'window'}).then( windowClients => {
        for (var i = 0; i < windowClients.length; i++) {
            var client = windowClients[i];
            if (client.url === event.notification.data.url && 'focus' in client) {
                return client.focus();
            }
        }
        if (clients.openWindow) {
            return clients.openWindow(event.notification.data.url);
        }
    })
  );
});
