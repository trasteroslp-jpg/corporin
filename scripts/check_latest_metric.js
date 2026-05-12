const admin = require('firebase-admin');
const serviceAccount = require('./credentials.json.json');

if (!admin.apps.length) {
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
    });
}

const db = admin.firestore();

async function checkLatestMetric() {
    const snapshot = await db.collection('metrics').orderBy('timestamp', 'desc').limit(1).get();
    if (snapshot.empty) {
        console.log('No metrics found.');
        return;
    }

    snapshot.forEach(doc => {
        console.log('Document ID:', doc.id);
        console.log('Data:', JSON.stringify(doc.data(), null, 2));
    });
}

checkLatestMetric();
