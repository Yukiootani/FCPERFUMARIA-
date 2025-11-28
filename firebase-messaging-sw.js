importScripts('https://www.gstatic.com/firebasejs/8.10.0/firebase-app-compat.js'); // Versão Compat para garantir
importScripts('https://www.gstatic.com/firebasejs/8.10.0/firebase-messaging-compat.js');

// CHAVES DA FC PERFUMARIA
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

messaging.onBackgroundMessage((payload) => {
  console.log('[FC Perfumaria] Background:', payload);
  
  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
    // Ícone de Perfume
    icon: 'https://cdn-icons-png.flaticon.com/512/2771/2771401.png',
    
    // 🚨 LÓGICA EXATA DO 3 MARIAS 🚨
    tag: 'push-alert-' + Date.now(), // Tag única para sempre tocar
    renotify: true, // Força vibração/som
    requireInteraction: true, // Fica na tela até clicar
    
    data: {
        url: payload.notification.click_action || 'https://fcperfumaria.netlify.app'
    }
  };

  return self.registration.showNotification(notificationTitle, notificationOptions);
});

self.addEventListener('notificationclick', function(event) {
  event.notification.close();
  event.waitUntil(
    clients.openWindow(event.notification.data.url || '/')
  );
});
