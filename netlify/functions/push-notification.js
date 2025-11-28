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
    
    // 1. Busca tokens
    const snapshot = await db.collection('push_tokens').get();
    if (snapshot.empty) return { statusCode: 200, body: JSON.stringify({ message: "Sem tokens." }) };

    const tokens = snapshot.docs.map(doc => doc.data().token);

    // Link da FC Perfumaria
    const linkLoja = 'https://fcperfumaria.netlify.app';

    // 🚨 ESTRUTURA HÍBRIDA (IGUAL AO 3 MARIAS) 🚨
    const message = {
      notification: { 
        title: data.title, 
        body: data.body 
      },
      // Configuração específica para acordar o Android
      android: {
        priority: 'high',
        notification: {
          sound: 'default',
          click_action: data.link || linkLoja
        }
      },
      // Configuração para Web (PC/iPhone/PWA)
      webpush: { 
        headers: {
          Urgency: "high"
        },
        fcm_options: { 
          link: data.link || linkLoja 
        } 
      },
      tokens: tokens
    };

    const response = await admin.messaging().sendEachForMulticast(message);
    return { statusCode: 200, body: JSON.stringify({ success: true, count: response.successCount }) };

  } catch (error) {
    console.error(error);
    return { statusCode: 500, body: JSON.stringify({ error: error.message }) };
  }
};
