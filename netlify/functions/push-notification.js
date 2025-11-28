var admin = require("firebase-admin");

// Função para limpar a chave (Essencial no Netlify)
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
    
    // Busca tokens
    const snapshot = await db.collection('push_tokens').get();
    if (snapshot.empty) return { statusCode: 200, body: JSON.stringify({ message: "Sem tokens." }) };

    const tokens = snapshot.docs.map(doc => doc.data().token);
    
    // Link e Ícone
    const linkLoja = 'https://fcperfumaria.netlify.app';
    const iconUrl = 'https://cdn-icons-png.flaticon.com/512/2771/2771401.png';

    // MENSAGEM HÍBRIDA (Cobre todas as bases)
    const message = {
      notification: {
        title: data.title || "FC Perfumaria",
        body: data.body || "Oferta Especial"
      },
      // Configuração específica para Android Nativo/Chrome
      android: {
        priority: 'high',
        notification: {
          icon: 'stock_ticker_update', // Ícone de sistema
          color: '#1B263B',
          default_sound: true,
          click_action: linkLoja
        }
      },
      // Configuração Web (PWA)
      webpush: {
        headers: {
          "Urgency": "high"
        },
        notification: {
          icon: iconUrl,
          requireInteraction: true,
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
