const admin = require('firebase-admin');
const serviceAccount = require('./credentials.json.json');
const fs = require('fs');

if (!admin.apps.length) {
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
    });
}

const db = admin.firestore();

async function findToolCall() {
    const snapshot = await db.collection('vapi_debug_logs')
        .get();

    for (const doc of snapshot.docs) {
        const data = doc.data();
        if (data.type === 'tool-call' || data.type === 'tool-calls') {
            fs.writeFileSync('vapi_tool_payload.json', data.full_payload, 'utf8');
            console.log(`Found tool call of type ${data.type} from ${data.timestamp}. Saved.`);
            return;
        }
    }
    console.log('No tool calls found in logs.');
}

findToolCall().catch(console.error);
