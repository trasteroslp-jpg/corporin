const admin = require('firebase-admin');
const serviceAccount = require('./credentials.json.json');

if (!admin.apps.length) {
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
    });
}

const db = admin.firestore();

async function findFireMetric() {
    console.log('Searching for "ardiendo" in metrics...');
    const snapshot = await db.collection('metrics').get();

    snapshot.forEach(doc => {
        const data = doc.data();
        if (data.userMessage && (data.userMessage.toLowerCase().includes('ardiendo') || data.userMessage.toLowerCase().includes('fire'))) {
            console.log('--- FOUND METRIC ---');
            console.log(JSON.stringify(data, null, 2));
        }
    });
}

findFireMetric().catch(console.error);
