const admin = require('firebase-admin');
const serviceAccount = require('./credentials.json.json');

if (!admin.apps.length) {
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
    });
}

const db = admin.firestore();

async function checkVapiLogs() {
    try {
        console.log('Querying latest vapi_debug_logs...');
        const snapshot = await db.collection('vapi_debug_logs')
            .orderBy('timestamp', 'desc')
            .limit(5)
            .get();

        if (snapshot.empty) {
            console.log('No vapi logs found.');
            return;
        }

        snapshot.forEach(doc => {
            const data = doc.data();
            console.log(`[${data.timestamp}] Type: ${data.type}`);
            // console.log(`   Payload: ${data.full_payload}`);
            console.log('---');
        });
    } catch (error) {
        console.error('Error querying vapi logs:', error);
    }
}

checkVapiLogs();
