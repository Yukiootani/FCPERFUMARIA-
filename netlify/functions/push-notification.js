var admin = require("firebase-admin");

if (admin.apps.length === 0) {
  if (process.env.FIREBASE_SERVICE_ACCOUNT) {
    try {
      var serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
      admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });
    } catch (e) { console.error(e); }
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

    // ESTRUTURA UNIVERSAL (WEB PUSH STANDARD)
    const message = {
      // Dados visuais para iOS e Chrome Desktop
      notification: {
        title: data.title || "FC Perfumaria",
        body: data.body || "Oferta Especial"
      },
      // Dados extras para o nosso Service Worker do Android montar
      data: {
        title: data.title,
        body: data.body,
        url: data.link || 'https://fcperfumaria.netlify.app'
      },
      // Configuração de prioridade Web
      webpush: {
        headers: {
          "Urgency": "high"
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
