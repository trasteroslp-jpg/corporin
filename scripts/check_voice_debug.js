const admin = require('firebase-admin');
const serviceAccount = require('./credentials.json.json');

if (!admin.apps.length) {
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
    });
}

const db = admin.firestore();

async function checkVoiceIncidencias() {
    console.log('Checking logs_incidencias_voz...');
    const snapshot = await db.collection('logs_incidencias_voz')
        .orderBy('timestamp', 'desc')
        .limit(5)
        .get();

    if (snapshot.empty) {
        console.log('No voice incidencias found.');
    } else {
        snapshot.forEach(doc => {
            console.log('--- INCIDENCIA VOZ ---');
            console.log(JSON.stringify(doc.data(), null, 2));
        });
    }

    console.log('\nChecking vapi_debug_logs for tool-calls...');
    const debugSnapshot = await db.collection('vapi_debug_logs')
        .where('type', '==', 'tool-call')
        .orderBy('timestamp', 'desc')
        .limit(5)
        .get();

    if (debugSnapshot.empty) {
        console.log('No tool-call debug logs found.');
    } else {
        debugSnapshot.forEach(doc => {
            console.log('--- DEBUG TOOL CALL ---');
            const data = doc.data();
            console.log('Time:', data.timestamp);
            try {
                const payload = JSON.parse(data.full_payload);
                console.log('Tool Calls:', JSON.stringify(payload.message.toolCalls, null, 2));
            } catch (e) {
                console.log('Could not parse payload');
            }
        });
    }
}

checkVoiceIncidencias().catch(console.error);
