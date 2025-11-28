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

    // ESTRUTURA HÍBRIDA (A Chave do Sucesso)
    const message = {
      // 1. Para iOS (Display Automático)
      notification: {
        title: data.title || "FC Perfumaria",
        body: data.body || "Nova oferta!"
      },
      // 2. Para Android (Dados para o Service Worker montar a notificação vibratória)
      data: {
        title: data.title || "FC Perfumaria",
        body: data.body || "Nova oferta!",
        icon: 'https://i.imgur.com/BIXdM6M.png',
        url: 'https://fcperfumaria.netlify.app'
      },
      // 3. Configurações de Prioridade
      android: { priority: 'high' },
      webpush: { 
        headers: { "Urgency": "high" },
        fcm_options: { link: 'https://fcperfumaria.netlify.app' }
      },
      tokens: tokens
    };

    const response = await admin.messaging().sendEachForMulticast(message);

    return { statusCode: 200, body: JSON.stringify({ success: true, enviados: response.successCount }) };

  } catch (error) {
    return { statusCode: 500, body: JSON.stringify({ error: error.message }) };
  }
};
