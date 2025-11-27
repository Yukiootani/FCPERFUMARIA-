var admin = require("firebase-admin");

// 1. Conectar ao Google usando a Chave Secreta do Netlify
if (admin.apps.length === 0) {
  if (!process.env.FIREBASE_SERVICE_ACCOUNT) {
    console.error("ERRO: Chave FIREBASE_SERVICE_ACCOUNT não encontrada no Netlify.");
  } else {
    try {
      var serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
      });
    } catch (e) {
      console.error("ERRO JSON: A chave colada no Netlify está quebrada ou incompleta.", e);
    }
  }
}

exports.handler = async function(event, context) {
  // Apenas aceita método POST
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method Not Allowed" };
  }

  try {
    const data = JSON.parse(event.body);
    const db = admin.firestore();

    // 2. Buscar todos os tokens de clientes
    const snapshot = await db.collection('push_tokens').get();
    
    if (snapshot.empty) {
      return { statusCode: 200, body: JSON.stringify({ message: "Nenhum cliente cadastrado para receber." }) };
    }

    // Lista de destinatários
    const tokens = snapshot.docs.map(doc => doc.data().token);

    // 3. Configurar a Mensagem
    const message = {
      notification: {
        title: data.title || "FC Perfumaria",
        body: data.body || "Confira as novidades!"
      },
      // Configuração Android
      android: {
        priority: 'high',
        notification: {
          icon: 'https://cdn-icons-png.flaticon.com/512/2771/2771401.png',
          click_action: data.link || 'https://fcperfumaria.netlify.app'
        }
      },
      // Configuração Web/PC
      webpush: {
        headers: { Urgency: "high" },
        fcm_options: {
          link: data.link || 'https://fcperfumaria.netlify.app'
        }
      },
      tokens: tokens
    };

    // 4. Disparar!
    const response = await admin.messaging().sendEachForMulticast(message);

    return {
      statusCode: 200,
      body: JSON.stringify({ 
        success: true, 
        enviados: response.successCount, 
        falhas: response.failureCount 
      })
    };

  } catch (error) {
    console.error("Erro no disparo:", error);
    return { statusCode: 500, body: JSON.stringify({ error: error.message }) };
  }
};
