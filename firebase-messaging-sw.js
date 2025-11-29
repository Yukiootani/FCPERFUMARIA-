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

messaging.setBackgroundMessageHandler(function(payload) {
  console.log('[FC Perfumaria] Background:', payload);
  
  const notificationTitle = payload.notification.title;
  
  const notificationOptions = {
    body: payload.notification.body,
    
    // ✅ SEU LOGO NOVO AQUI
    icon: 'https://fcperfumaria.netlify.app/IMG_6254.jpg',
    
    tag: 'push-alert-' + Date.now(),
    renotify: true,
    requireInteraction: true,
    vibrate: [300, 100, 400],
    
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
