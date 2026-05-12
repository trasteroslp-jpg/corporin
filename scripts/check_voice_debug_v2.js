const admin = require('firebase-admin');
const serviceAccount = require('./credentials.json.json');

if (!admin.apps.length) {
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
    });
}

const db = admin.firestore();

async function checkVoiceIncidencias() {
    console.log('Checking logs_incidencias_voz (no order)...');
    const snapshot = await db.collection('logs_incidencias_voz').limit(10).get();

    if (snapshot.empty) {
        console.log('No voice incidencias found.');
    } else {
        snapshot.forEach(doc => {
            console.log('--- INCIDENCIA VOZ ---');
            console.log(JSON.stringify(doc.data(), null, 2));
        });
    }

    console.log('\nChecking vapi_debug_logs (no order)...');
    const debugSnapshot = await db.collection('vapi_debug_logs').limit(20).get();

    if (debugSnapshot.empty) {
        console.log('No debug logs found.');
    } else {
        debugSnapshot.forEach(doc => {
            const data = doc.data();
            if (data.type === 'tool-call') {
                console.log('--- DEBUG TOOL CALL FOUND ---');
                console.log('Time:', data.timestamp);
                try {
                    const payload = JSON.parse(data.full_payload);
                    console.log('Tool Calls:', JSON.stringify(payload.message.toolCalls, null, 2));
                } catch (e) {
                    console.log('Could not parse payload');
                }
            }
        });
    }
}

checkVoiceIncidencias().catch(console.error);
