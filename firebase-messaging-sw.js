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

// LÓGICA SIMPLES (Background)
// Se a notificação vier com o campo 'notification' preenchido, o navegador mostra sozinho.
// Esse código serve apenas para logar e garantir o recebimento.
messaging.setBackgroundMessageHandler(function(payload) {
  console.log('[FC Perfumaria] Background:', payload);
  
  // Só força a exibição se o navegador não tiver feito automático
  // Usamos título e corpo padrão para garantir
  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
    icon: 'https://i.imgur.com/BIXdM6M.png',
    data: { url: 'https://fcperfumaria.netlify.app' }
  };

  return self.registration.showNotification(notificationTitle, notificationOptions);
});

self.addEventListener('notificationclick', function(event) {
  event.notification.close();
  event.waitUntil(clients.openWindow('https://fcperfumaria.netlify.app'));
});
