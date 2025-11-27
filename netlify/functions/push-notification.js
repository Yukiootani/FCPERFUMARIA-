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
    
    // 1. Pega os tokens
    const snapshot = await db.collection('push_tokens').get();
    if (snapshot.empty) return { statusCode: 200, body: JSON.stringify({ message: "Sem tokens." }) };
    const tokens = snapshot.docs.map(doc => doc.data().token);

    // 2. O LINK DEVE SER O DA SUA LOJA ATUAL
    const lojaLink = 'https://fcperfumaria.netlify.app'; 
    const iconUrl = 'https://i.imgur.com/BIXdM6M.png'; // Ícone universal

    // 3. ESTRUTURA CLÁSSICA (Igual ao 3 Marias)
    // Removemos o bloco 'android' e focamos no 'webpush' que funciona no Chrome Android
    const message = {
      notification: {
        title: data.title || "FC Perfumaria",
        body: data.body || "Nova oferta!"
      },
      webpush: {
        headers: {
          "Urgency": "high"
        },
        notification: {
          icon: iconUrl,
          requireInteraction: true, // Obriga o usuário a interagir
          click_action: lojaLink
        },
        fcm_options: {
          link: lojaLink
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
