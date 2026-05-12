const admin = require('firebase-admin');
if (!admin.apps.length) {
    const serviceAccount = require('./credentials.json.json');
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
    });
}
const db = admin.firestore();
async function check() {
    console.log('Fetching last 5 metrics with timestamps...');
    const snapshot = await db.collection('metrics').orderBy('timestamp', 'desc').limit(5).get();
    snapshot.forEach(doc => {
        const data = doc.data();
        console.log(`[${data.timestamp}] User: ${data.userName}, Msg: ${data.userMessage?.substring(0,30)}, Bot: ${data.botResponse?.substring(0,30)}`);
    });
}
check();
