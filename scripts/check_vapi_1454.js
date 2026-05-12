const admin = require('firebase-admin');
const serviceAccount = require('./credentials.json.json');

if (!admin.apps.length) {
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
    });
}

const db = admin.firestore();

async function checkRecentVapi() {
    console.log('Checking Vapi logs around 14:54...');
    const snapshot = await db.collection('vapi_debug_logs')
        .where('timestamp', '>=', '2026-03-11T14:50:00Z')
        .get();

    if (snapshot.empty) {
        console.log('No logs found after 14:50.');
    } else {
        snapshot.forEach(doc => {
            const data = doc.data();
            console.log(`[${data.timestamp}] Type: ${data.type}`);
            if (data.type === 'tool-call') {
                console.log('TOOL CALL DETECTED:');
                console.log(data.full_payload);
            }
        });
    }
}

checkRecentVapi().catch(console.error);
