var admin = require("firebase-admin");

// Função para limpar a chave privada (O erro comum do Netlify)
function getServiceAccount() {
  try {
    if (!process.env.FIREBASE_SERVICE_ACCOUNT) return null;
    
    let rawKey = process.env.FIREBASE_SERVICE_ACCOUNT;
    
    // Se for string, tenta parsear. Se já for objeto, usa direto.
    if (typeof rawKey === 'string') {
        return JSON.parse(rawKey);
    }
    return rawKey;
  } catch (e) {
    console.error("Erro ao ler chave:", e);
    return null;
  }
}

// INICIALIZAÇÃO SEGURA
if (admin.apps.length === 0) {
  const serviceAccount = getServiceAccount();
  
  if (serviceAccount) {
    try {
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
      });
    } catch (e) {
      console.error("Erro no init:", e);
    }
  }
}

exports.handler = async function(event, context) {
  // Permite requisições de qualquer lugar (CORS) para evitar bloqueio
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTION'
  };

  if (event.httpMethod === "OPTIONS") {
    return { statusCode: 200, headers, body: "OK" };
  }

  if (event.httpMethod !== "POST") {
    return { statusCode: 405, headers, body: "Method Not Allowed" };
  }

  // Verifica se o Firebase conectou
  if (admin.apps.length === 0) {
    return { 
      statusCode: 500, 
      headers,
      body: JSON.stringify({ error: "O servidor não conseguiu ler a Chave Secreta do Firebase no Netlify." }) 
    };
  }

  try {
    const data = JSON.parse(event.body);
    const db = admin.firestore();
    
    // Busca Tokens
    const snapshot = await db.collection('push_tokens').get();
    if (snapshot.empty) {
      return { statusCode: 200, headers, body: JSON.stringify({ message: "Nenhum celular cadastrado." }) };
    }

    const tokens = snapshot.docs.map(doc => doc.data().token);
    const link = 'https://fcperfumaria.netlify.app';

    const message = {
      notification: {
        title: data.title || "FC Perfumaria",
        body: data.body || "Oferta!"
      },
      webpush: {
        headers: { "Urgency": "high" },
        notification: {
          icon: 'https://cdn-icons-png.flaticon.com/512/2771/2771401.png',
          click_action: link,
          requireInteraction: true
        },
        fcm_options: { link: link }
      },
      android: {
        priority: 'high',
        notification: {
          icon: 'stock_ticker_update',
          color: '#1B263B',
          clickAction: link
        }
      },
      tokens: tokens
    };

    const response = await admin.messaging().sendEachForMulticast(message);

    return { 
      statusCode: 200, 
      headers,
      body: JSON.stringify({ success: true, enviados: response.successCount, falhas: response.failureCount }) 
    };

  } catch (error) {
    return { statusCode: 500, headers, body: JSON.stringify({ error: error.message }) };
  }
};
