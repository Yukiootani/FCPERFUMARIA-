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

    // Ícone seguro (Google) para garantir que o Android não bloqueie o download da imagem
    const iconUrl = 'https://www.gstatic.com/mobilesdk/160503_mobilesdk/logo/2x/firebase_28dp.png';
    const link = 'https://fcperfumaria.netlify.app';

    const message = {
      // 1. Configuração Base (Para iOS)
      notification: {
        title: data.title || "FC Perfumaria",
        body: data.body || "Nova oferta!"
      },
      
      // 2. Configuração Android Chrome (AQUI ESTÁ A MÁGICA)
      // Mandamos as ordens de vibração direto no pacote
      webpush: {
        headers: {
          "Urgency": "high",
          "TTL": "4500"
        },
        notification: {
          title: data.title || "FC Perfumaria",
          body: data.body || "Nova oferta!",
          icon: iconUrl,
          badge: iconUrl,
          
          // OBRIGA A TELA A ACENDER/VIBRAR
          vibrate: [200, 100, 200, 100, 200, 100, 200],
          requireInteraction: true, // A notificação não some sozinha
          renotify: true, // Toca o som mesmo se tiver outra
          tag: 'fc-alert-' + Date.now(), // Tag única para forçar novo alerta
          
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
