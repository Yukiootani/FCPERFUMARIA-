var admin = require("firebase-admin");

function getServiceAccount() {
  try {
    if (!process.env.FIREBASE_SERVICE_ACCOUNT) return null;
    let rawKey = process.env.FIREBASE_SERVICE_ACCOUNT;
    if (typeof rawKey === 'string') { return JSON.parse(rawKey); }
    return rawKey;
  } catch (e) { console.error("Erro chave:", e); return null; }
}

if (admin.apps.length === 0) {
  const serviceAccount = getServiceAccount();
  if (serviceAccount) {
    admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });
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
    const link = 'https://fcperfumaria.netlify.app';
    
    // Ícone do seu Logo PNG
    const iconUrl = 'https://fcperfumaria.netlify.app/663adacb-9398-45a8-9e83-f0dcf0e1f4ef.png';

    // ESTRUTURA HÍBRIDA (A que funcionou)
    const message = {
      // iOS lê isso
      notification: {
        title: data.title,
        body: data.body
      },
      // Android Nativo lê isso (Prioridade Alta)
      android: {
        priority: 'high',
        notification: {
          icon: 'stock_ticker_update',
          color: '#1B263B',
          sound: 'default',
          click_action: link
        }
      },
      // Web/Chrome lê isso
      webpush: {
        headers: { "Urgency": "high" },
        notification: {
          icon: iconUrl,
          requireInteraction: true,
          click_action: link
        },
        fcm_options: { link: link }
      },
      tokens: tokens
    };

    const response = await admin.messaging().sendEachForMulticast(message);
    return { statusCode: 200, body: JSON.stringify({ success: true, enviados: response.successCount }) };

  } catch (error) {
    return { statusCode: 500, body: JSON.stringify({ error: error.message }) };
  }
};
