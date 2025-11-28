var admin = require("firebase-admin");

// Conexão segura (Lógica 3 Marias)
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
    
    // Ícone seguro
    const iconUrl = 'https://cdn-icons-png.flaticon.com/512/2771/2771401.png';
    const linkLoja = 'https://fcperfumaria.netlify.app';

    // 🚨 ESTRUTURA EXATA DO 3 MARIAS 🚨
    const message = {
      // 1. Notificação Básica
      notification: { 
        title: data.title, 
        body: data.body 
      },
      
      // 2. Configuração ANDROID (Do jeito que estava no 3 Marias)
      android: {
        priority: 'high',
        notification: {
          sound: 'default',
          icon: 'stock_ticker_update', // Ícone nativo seguro
          click_action: linkLoja
        }
      },
      
      // 3. Configuração WEB
      webpush: { 
        headers: {
          "Urgency": "high"
        },
        notification: {
          icon: iconUrl,
          click_action: linkLoja
        },
        fcm_options: { 
          link: linkLoja 
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
