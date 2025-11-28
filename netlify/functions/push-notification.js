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

    // DADOS DA MENSAGEM
    const title = data.title || "FC Perfumaria";
    const body = data.body || "Nova oferta disponível!";
    const icon = "https://cdn-icons-png.flaticon.com/512/2771/2771401.png";
    const link = "https://fcperfumaria.netlify.app";

    const message = {
      // 1. IOS (Lê daqui automático)
      notification: {
        title: title,
        body: body
      },
      // 2. ANDROID (Nosso script vai ler daqui)
      data: {
        title: title,
        body: body,
        icon: icon,
        url: link,
        click_action: link // Necessário para alguns Androids antigos
      },
      // Prioridade Máxima
      android: { priority: "high" },
      webpush: { 
        headers: { "Urgency": "high" },
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
