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

    // Ícone seguro
    const iconUrl = 'https://cdn-icons-png.flaticon.com/512/2771/2771401.png';
    const linkLoja = 'https://fcperfumaria.netlify.app';

    const message = {
      // 1. IOS PRECISA DISSO (Display Automático)
      notification: {
        title: data.title || "FC Perfumaria",
        body: data.body || "Oferta Especial!"
      },
      // 2. ANDROID VAI LER ISSO (Dados para montagem manual)
      data: {
        custom_title: data.title || "FC Perfumaria",
        custom_body: data.body || "Oferta Especial!",
        custom_icon: iconUrl,
        click_action: linkLoja
      },
      // 3. PRIORIDADES
      android: { priority: 'high' },
      webpush: { 
        headers: { "Urgency": "high" },
        fcm_options: { link: linkLoja }
      },
      tokens: tokens
    };

    const response = await admin.messaging().sendEachForMulticast(message);

    return { statusCode: 200, body: JSON.stringify({ success: true, enviados: response.successCount }) };

  } catch (error) {
    return { statusCode: 500, body: JSON.stringify({ error: error.message }) };
  }
};
