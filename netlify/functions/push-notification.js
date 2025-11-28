var admin = require("firebase-admin");

// Conexão Segura
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
    
    // Pega tokens
    const snapshot = await db.collection('push_tokens').get();
    if (snapshot.empty) return { statusCode: 200, body: JSON.stringify({ message: "Sem tokens." }) };

    const tokens = snapshot.docs.map(doc => doc.data().token);

    // ESTRUTURA UNIVERSAL PURA
    // Sem 'android: {}', sem 'data: {}', sem ícones externos.
    // Apenas o básico que funciona em qualquer sistema.
    const message = {
      notification: {
        title: data.title || "FC Perfumaria",
        body: data.body || "Nova oferta!"
      },
      webpush: {
        headers: {
          "Urgency": "high"
        },
        fcm_options: {
          link: "https://fcperfumaria.netlify.app"
        }
      },
      tokens: tokens
    };

    const response = await admin.messaging().sendEachForMulticast(message);

    return { statusCode: 200, body: JSON.stringify({ success: true, enviados: response.successCount, falhas: response.failureCount }) };

  } catch (error) {
    return { statusCode: 500, body: JSON.stringify({ error: error.message }) };
  }
};
