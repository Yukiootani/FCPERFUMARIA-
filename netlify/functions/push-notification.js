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

    const title = data.title || "FC Perfumaria";
    const body = data.body || "Nova oferta disponível!";
    const link = 'https://fcperfumaria.netlify.app';

    const message = {
      // 1. iOS (Usa isso)
      notification: {
        title: title,
        body: body
      },
      // 2. Android (Vai ler daqui para montar manual)
      data: {
        custom_title: title,
        custom_body: body,
        custom_url: link
      },
      // 3. Prioridade
      android: { priority: 'high' },
      tokens: tokens
    };

    const response = await admin.messaging().sendEachForMulticast(message);

    return { statusCode: 200, body: JSON.stringify({ success: true, enviados: response.successCount }) };

  } catch (error) {
    return { statusCode: 500, body: JSON.stringify({ error: error.message }) };
  }
};
