const admin = require('firebase-admin');
const serviceAccount = require('./credentials.json.json');

if (!admin.apps.length) {
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
    });
}

const db = admin.firestore();

async function searchIncendio() {
    console.log('Searching for "incendio" in metrics...');
    const snapshot = await db.collection('metrics')
        .where('timestamp', '>=', '2026-03-11T00:00:00Z')
        .get();

    if (snapshot.empty) {
        console.log('No messages found today.');
        return;
    }

    snapshot.forEach(doc => {
        const data = doc.data();
        if (data.userMessage && data.userMessage.toLowerCase().includes('incendio')) {
            console.log('--- FOUND INCIDENCIA ---');
            console.log('Doc ID:', doc.id);
            console.log('Timestamp:', data.timestamp);
            console.log('User:', data.userName, '(', data.userId, ')');
            console.log('Message:', data.userMessage);
            console.log('Bot Response:', data.botResponse);
            console.log('Urgency:', data.urgency);
            console.log('-------------------------');
        }
    });
}

searchIncendio().catch(console.error);
