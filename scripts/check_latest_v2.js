const admin = require('firebase-admin');
const serviceAccount = require('./credentials.json.json');

if (!admin.apps.length) {
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
    });
}

const db = admin.firestore();

async function checkLatestMetric() {
    const snapshot = await db.collection('metrics').orderBy('timestamp', 'desc').limit(5).get();
    if (snapshot.empty) {
        console.log('No metrics found.');
        return;
    }

    snapshot.forEach(doc => {
        const data = doc.data();
        console.log('TIMESTAMP:', data.timestamp);
        console.log('VERSION:', data.version || 'NOT SET');
        console.log('USER:', data.userMessage);
        console.log('BOT:', data.botResponse);
    });
}

checkLatestMetric();
