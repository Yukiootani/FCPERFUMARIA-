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

    // ESTRUTURA "DATA-ONLY" (O Pulo do Gato)
    // Não enviamos 'notification'. Enviamos apenas 'data'.
    // Isso obriga o Android a acordar o Service Worker.
    const message = {
      data: {
        title: data.title || "FC Perfumaria",
        body: data.body || "Oferta Especial!",
        icon: 'https://cdn-icons-png.flaticon.com/512/2771/2771401.png',
        url: 'https://fcperfumaria.netlify.app',
        timestamp: Date.now().toString() // Garante que cada mensagem é única
      },
      // Configurações de prioridade para garantir a entrega
      android: { priority: 'high' },
      webpush: { 
        headers: { "Urgency": "high" }
      },
      tokens: tokens
    };

    const response = await admin.messaging().sendEachForMulticast(message);

    return { statusCode: 200, body: JSON.stringify({ success: true, enviados: response.successCount }) };

  } catch (error) {
    return { statusCode: 500, body: JSON.stringify({ error: error.message }) };
  }
};
