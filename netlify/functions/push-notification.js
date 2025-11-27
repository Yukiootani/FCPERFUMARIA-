var admin = require("firebase-admin");

if (admin.apps.length === 0) {
  if (!process.env.FIREBASE_SERVICE_ACCOUNT) {
    console.error("ERRO: Chave FIREBASE_SERVICE_ACCOUNT não encontrada.");
  } else {
    try {
      var serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
      admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });
    } catch (e) { console.error("ERRO JSON:", e); }
  }
}

exports.handler = async function(event, context) {
  if (event.httpMethod !== "POST") { return { statusCode: 405, body: "Method Not Allowed" }; }

  try {
    const data = JSON.parse(event.body);
    const db = admin.firestore();
    const snapshot = await db.collection('push_tokens').get();
    
    if (snapshot.empty) { return { statusCode: 200, body: JSON.stringify({ message: "Sem tokens." }) }; }

    const tokens = snapshot.docs.map(doc => doc.data().token);

    // Ícone Seguro (O mesmo do App)
    const iconUrl = 'https://i.imgur.com/BIXdM6M.png';

    const message = {
      notification: {
        title: data.title || "FC Perfumaria",
        body: data.body || "Nova oferta disponível!"
      },
      android: {
        priority: 'high',
        notification: {
          icon: iconUrl,
          color: '#1B263B', // Cor da marca
          click_action: 'https://fcperfumaria.netlify.app'
        }
      },
      webpush: {
        headers: { Urgency: "high" },
        fcm_options: { link: 'https://fcperfumaria.netlify.app' },
        notification: { icon: iconUrl }
      },
      tokens: tokens
    };

    const response = await admin.messaging().sendEachForMulticast(message);

    return { statusCode: 200, body: JSON.stringify({ success: true, enviados: response.successCount, falhas: response.failureCount }) };

  } catch (error) {
    return { statusCode: 500, body: JSON.stringify({ error: error.message }) };
  }
};
