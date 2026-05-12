const admin = require('firebase-admin');
const serviceAccount = require('./credentials.json.json');
const fs = require('fs');

if (!admin.apps.length) {
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
    });
}

const db = admin.firestore();

async function dumpVapiPayload() {
    console.log('Fetching last Vapi debug payload...');
    const snapshot = await db.collection('vapi_debug_logs')
        .orderBy('timestamp', 'desc')
        .limit(1)
        .get();

    if (snapshot.empty) {
        console.log('No Vapi logs found.');
        return;
    }

    const data = snapshot.docs[0].data();
    console.log(`Timestamp: ${data.timestamp}`);
    console.log(`Type: ${data.type}`);
    
    // Write full payload to file to avoid console truncation
    fs.writeFileSync('vapi_payload_debug.json', data.full_payload, 'utf8');
    console.log('Full payload written to vapi_payload_debug.json');
}

dumpVapiPayload().catch(console.error);
