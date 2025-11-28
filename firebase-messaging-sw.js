// USANDO A VERSÃO EXATA DO 3 MARIAS (8.10.0)
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

// LÓGICA DE INTERCEPTAÇÃO DO 3 MARIAS
messaging.onBackgroundMessage((payload) => {
  console.log('[FC Perfumaria] Background:', payload);
  
  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
    icon: 'https://cdn-icons-png.flaticon.com/512/2771/2771401.png', // Ícone Seguro
    
    // 🚨 O SEGREDO DO 3 MARIAS: TAG + RENOTIFY + INTERACTION
    tag: 'push-alert-' + Date.now(), 
    renotify: true, 
    requireInteraction: true, 
    vibrate: [500, 100, 500],
    
    data: {
        url: payload.notification.click_action || 'https://fcperfumaria.netlify.app'
    }
  };

  return self.registration.showNotification(notificationTitle, notificationOptions);
});

// CLIQUE (Igual ao 3 Marias)
self.addEventListener('notificationclick', function(event) {
  event.notification.close();
  event.waitUntil(
    clients.matchAll({type: 'window'}).then( windowClients => {
      for (var i = 0; i < windowClients.length; i++) {
        var client = windowClients[i];
        if (client.url.includes('fcperfumaria') && 'focus' in client) {
          return client.focus();
        }
      }
      if (clients.openWindow) {
        return clients.openWindow(event.notification.data.url || '/');
      }
    })
  );
});
