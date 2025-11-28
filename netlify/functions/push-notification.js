var admin = require("firebase-admin");

// Limpeza da chave (caso tenha erros de formatação)
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
    
    // 1. Pegar Tokens
    const snapshot = await db.collection('push_tokens').get();
    if (snapshot.empty) return { statusCode: 200, body: JSON.stringify({ message: "Sem tokens." }) };

    const tokens = snapshot.docs.map(doc => doc.data().token);

    // 2. Configuração WEB PURE (Sem conflito Android Nativo)
    const iconUrl = 'https://cdn-icons-png.flaticon.com/512/2771/2771401.png';
    const link = 'https://fcperfumaria.netlify.app';

    const message = {
      // O iOS e o Android lêem isso
      notification: {
        title: data.title || "FC Perfumaria",
        body: data.body || "Oferta Especial!"
      },
      // Configurações adicionais de comportamento
      webpush: {
        headers: {
          "Urgency": "high"
        },
        notification: {
          icon: iconUrl,
          badge: iconUrl,
          requireInteraction: true, // Obriga a ficar na tela
          click_action: link
        },
        fcm_options: {
          link: link
        }
      },
      tokens: tokens
    };

    // 3. Enviar
    const response = await admin.messaging().sendEachForMulticast(message);

    // Resposta detalhada para o Admin saber o que houve
    return { 
      statusCode: 200, 
      body: JSON.stringify({ 
        success: true, 
        enviados: response.successCount, 
        falhas: response.failureCount 
      }) 
    };

  } catch (error) {
    return { statusCode: 500, body: JSON.stringify({ error: error.message }) };
  }
};
