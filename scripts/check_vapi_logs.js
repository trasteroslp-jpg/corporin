const admin = require('firebase-admin');
const serviceAccount = require('./credentials.json.json');

if (!admin.apps.length) {
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
    });
}

const db = admin.firestore();

async function checkVapiLogs() {
    console.log('Checking recent Vapi debug logs...');
    const snapshot = await db.collection('vapi_debug_logs')
        .orderBy('timestamp', 'desc')
        .limit(5)
        .get();

    if (snapshot.empty) {
        console.log('No Vapi logs found.');
        return;
    }

    snapshot.forEach(doc => {
        const data = doc.data();
        console.log(`[${data.timestamp}] Type: ${data.type}`);
    });
}

checkVapiLogs().catch(console.error);
