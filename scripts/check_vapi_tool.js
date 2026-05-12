const admin = require('firebase-admin');
const serviceAccount = require('./credentials.json.json');
const fs = require('fs');

if (!admin.apps.length) {
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
    });
}

const db = admin.firestore();

async function getToolCall() {
    const snapshot = await db.collection('vapi_debug_logs')
        .where('type', 'in', ['tool-call', 'tool-calls'])
        .orderBy('timestamp', 'desc')
        .limit(1)
        .get();

    if (snapshot.empty) {
        console.log('No tool calls found.');
        return;
    }

    const data = snapshot.docs[0].data();
    fs.writeFileSync('vapi_tool_call_debug.json', data.full_payload, 'utf8');
    console.log(`Tool call from ${data.timestamp} saved to vapi_tool_call_debug.json`);
}

getToolCall().catch(console.error);
