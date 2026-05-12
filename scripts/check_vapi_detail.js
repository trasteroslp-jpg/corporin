const admin = require('firebase-admin');
const serviceAccount = require('./credentials.json.json');

if (!admin.apps.length) {
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
    });
}

const db = admin.firestore();

async function checkSpecificToolCall() {
    console.log('Fetching details of tool-calls at 14:54:04...');
    const snapshot = await db.collection('vapi_debug_logs')
        .where('timestamp', '==', '2026-03-11T14:54:04.691Z')
        .get();

    snapshot.forEach(doc => {
        const data = doc.data();
        console.log('Payload:', data.full_payload);
    });
}

checkSpecificToolCall().catch(console.error);
