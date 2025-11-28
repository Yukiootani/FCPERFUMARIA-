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

messaging.onBackgroundMessage((payload) => {
  console.log('[FC Perfumaria] Background:', payload);
  
  const notificationTitle = payload.notification.title || 'FC Perfumaria';
  const notificationOptions = {
    body: payload.notification.body,
    
    // ✅ ÍCONE NOVO DE PERFUME
    icon: 'https://cdn-icons-png.flaticon.com/512/2771/2771401.png',
    badge: 'https://cdn-icons-png.flaticon.com/512/2771/2771401.png',
    
    tag: 'push-alert-' + Date.now(),
    renotify: true,
    requireInteraction: true,
    data: {
        url: 'https://fcperfumaria.netlify.app'
    }
  };

  return self.registration.showNotification(notificationTitle, notificationOptions);
});

self.addEventListener('notificationclick', function(event) {
  event.notification.close();
  event.waitUntil(clients.openWindow('https://fcperfumaria.netlify.app'));
});
