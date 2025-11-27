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

    // Ícone Oficial (O mesmo do App)
    const iconUrl = 'https://i.imgur.com/BIXdM6M.png';

    const message = {
      // Dados visíveis básicos
      notification: {
        title: data.title || "FC Perfumaria",
        body: data.body || "Nova oferta!"
      },
      // Configuração ESPECIAL para Web App (Chrome Android/PWA)
      webpush: {
        headers: {
          "Urgency": "high", // OBRIGA a acordar
          "TTL": "4500"
        },
        notification: {
          icon: iconUrl,
          badge: iconUrl,
          requireInteraction: true, // A mensagem fica na tela até clicar (Não some sozinha)
          vibrate: [500, 200, 500], // Vibração Longa
          click_action: 'https://fcperfumaria.netlify.app'
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
