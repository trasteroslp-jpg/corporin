const admin = require('firebase-admin');
const serviceAccount = require('./credentials.json.json');

if (!admin.apps.length) {
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
    });
}

const db = admin.firestore();

async function checkRecentToolCalls() {
    console.log('Searching for tool-call logs in the last hour...');
    const snapshot = await db.collection('vapi_debug_logs').get();

    snapshot.forEach(doc => {
        const data = doc.data();
        if (data.type === 'tool-call') {
            console.log('--- TOOL CALL LOG ---');
            console.log('Time:', data.timestamp);
            try {
                const payload = JSON.parse(data.full_payload);
                console.log('Tool Calls:', JSON.stringify(payload.message.toolCalls, null, 2));
            } catch (e) {
                console.log('Payload is not JSON string:', data.full_payload);
            }
        }
    });
}

checkRecentToolCalls().catch(console.error);
