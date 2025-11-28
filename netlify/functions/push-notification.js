var admin = require("firebase-admin");

if (admin.apps.length === 0) {
  if (process.env.FIREBASE_SERVICE_ACCOUNT) {
    try {
      var serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
      admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });
    } catch (e) { console.error(e); }
  }
}

exports.handler = async function(event, context) {
  if (event.httpMethod !== "POST") return { statusCode: 405, body: "Method Not Allowed" };

  try {
    const data = JSON.parse(event.body);
    const db = admin.firestore();
    const snapshot = await db.collection('push_tokens').get();
    
    if (snapshot.empty) return { statusCode: 200, body: JSON.stringify({ message: "Empty" }) };

    const tokens = snapshot.docs.map(doc => doc.data().token);

    const message = {
      notification: { 
        title: data.title, 
        body: data.body 
      },
      android: {
        priority: 'high',
        notification: {
          sound: 'default',
          click_action: 'https://fcperfumaria.netlify.app'
        }
      },
      webpush: { 
        headers: {
          Urgency: "high"
        },
        notification: {
          icon: 'https://cdn-icons-png.flaticon.com/512/2771/2771401.png',
          requireInteraction: true,
          click_action: 'https://fcperfumaria.netlify.app'
        },
        fcm_options: { 
          link: 'https://fcperfumaria.netlify.app' 
        } 
      },
      tokens: tokens
    };

    const response = await admin.messaging().sendEachForMulticast(message);
    return { statusCode: 200, body: JSON.stringify({ success: true, count: response.successCount }) };

  } catch (error) {
    return { statusCode: 500, body: JSON.stringify({ error: error.message }) };
  }
};
