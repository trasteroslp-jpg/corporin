const admin = require('firebase-admin');
const serviceAccount = require('./credentials.json.json');

if (!admin.apps.length) {
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
    });
}

const db = admin.firestore();

async function getRecentMetrics() {
    console.log('Fetching last 10 metrics...');
    const snapshot = await db.collection('metrics')
        .orderBy('timestamp', 'desc')
        .limit(10)
        .get();

    snapshot.forEach(doc => {
        const data = doc.data();
        console.log(`[${data.timestamp}] ${data.userName}: ${data.userMessage}`);
        console.log(`Bot: ${data.botResponse.substring(0, 100)}...`);
        console.log('---');
    });
}

getRecentMetrics().catch(console.error);
