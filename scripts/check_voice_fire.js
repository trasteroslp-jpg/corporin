const admin = require('firebase-admin');
const serviceAccount = require('./credentials.json.json');

if (!admin.apps.length) {
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
    });
}

const db = admin.firestore();

async function checkVoiceFire() {
    console.log('Searching for voice fire metric...');
    const snapshot = await db.collection('metrics')
        .where('channel', '==', 'voice')
        .get();

    snapshot.forEach(doc => {
        const data = doc.data();
        console.log('--- VOICE METRIC ---');
        console.log('Timestamp:', data.timestamp);
        console.log('Transcript Snippet:', data.userMessage.substring(0, 100));
        console.log('Summary:', data.botResponse);
    });
}

checkVoiceFire().catch(console.error);
