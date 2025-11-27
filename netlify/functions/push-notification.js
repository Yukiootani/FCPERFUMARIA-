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

    // Configuração Agressiva para Android
    const message = {
      notification: {
        title: data.title || "FC Perfumaria",
        body: data.body || "Nova oferta!"
      },
      android: {
        priority: 'high', // OBRIGA O ANDROID A ACORDAR
        notification: {
          channelId: 'default_channel',
          icon: 'https://cdn-icons-png.flaticon.com/512/2771/2771401.png',
          sound: 'default',
          defaultSound: true,
          defaultVibrateTimings: true,
          clickAction: 'https://fcperfumaria.netlify.app'
        }
      },
      webpush: {
        headers: { Urgency: "high" },
        fcmOptions: { link: 'https://fcperfumaria.netlify.app' },
        notification: {
          icon: 'https://cdn-icons-png.flaticon.com/512/2771/2771401.png',
          requireInteraction: true // A mensagem fica na tela até clicar
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
