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

    // Ícone seguro e direto
    const icon = 'https://cdn-icons-png.flaticon.com/512/2771/2771401.png';
    const link = 'https://fcperfumaria.netlify.app';

    // ESTRUTURA NATIVA (WEB STANDARD)
    const message = {
      // O iOS lê isso
      notification: {
        title: data.title || "FC Perfumaria",
        body: data.body || "Nova oferta!"
      },
      // O Android Chrome lê ISSO AQUI
      webpush: {
        headers: {
          "Urgency": "high", // Prioridade Máxima de Rede
          "TTL": "4500"
        },
        notification: {
          title: data.title || "FC Perfumaria",
          body: data.body || "Nova oferta!",
          icon: icon,
          badge: icon,
          // OS 3 COMANDOS QUE FAZEM VIBRAR E ACENDER:
          tag: 'fc-promo',       // Agrupa mensagens (substitui a anterior)
          renotify: true,        // Obriga a vibrar de novo mesmo se tiver outra notificação
          requireInteraction: true, // A tela fica acesa até o usuário tocar
          click_action: link
        },
        fcm_options: {
          link: link
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
