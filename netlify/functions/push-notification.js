var admin = require("firebase-admin");

if (admin.apps.length === 0) {
  if (process.env.FIREBASE_SERVICE_ACCOUNT) {
    try {
      var serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
      admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });
    } catch (e) { console.error("Erro Credencial:", e); }
  }
}

exports.handler = async function(event, context) {
  if (event.httpMethod !== "POST") return { statusCode: 405, body: "Method Not Allowed" };

  try {
    const data = JSON.parse(event.body);
    const db = admin.firestore();
    const snapshot = await db.collection('push_tokens').get();
    
    if (snapshot.empty) return { statusCode: 200, body: JSON.stringify({ message: "Sem tokens." }) };

    const tokens = snapshot.docs.map(doc => doc.data().token);

    // Configuração Híbrida (iOS + Android Lock Screen)
    const message = {
      // 1. Para iOS (Apple lê isso e exibe)
      notification: {
        title: data.title || "FC Perfumaria",
        body: data.body || "Nova oferta disponível!"
      },
      // 2. Para Android/Chrome (Configuração Completa de WebPush)
      webpush: {
        headers: {
          "Urgency": "high", // Obriga o servidor a entregar rápido
          "TTL": "4500"
        },
        notification: {
          icon: 'https://i.imgur.com/BIXdM6M.png',
          badge: 'https://i.imgur.com/BIXdM6M.png', // Ícone pequeno na barra
          vibrate: [500, 200, 500], // VIBRAÇÃO FORTE (Meio segundo, pausa, meio segundo)
          requireInteraction: true, // Fica na tela até o usuário tocar (Acorda a tela)
          click_action: 'https://fcperfumaria.netlify.app',
          tag: 'fc-notification-' + Date.now() // Evita agrupar e esconder
        },
        fcm_options: {
          link: 'https://fcperfumaria.netlify.app'
        }
      },
      tokens: tokens
    };

    const response = await admin.messaging().sendEachForMulticast(message);

    return { statusCode: 200, body: JSON.stringify({ success: true, enviados: response.successCount }) };

  } catch (error) {
    return { statusCode: 500, body: JSON.stringify({ error: error.message }) };
  }
};
