const admin = require('firebase-admin');
const serviceAccount = require('./credentials.json.json');

if (!admin.apps.length) {
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
    });
}

const db = admin.firestore();

async function getArmindaDetails() {
    console.log('Fetching detailed logs for Arminda (no order)...');
    const snapshot = await db.collection('metrics')
        .where('userName', '==', 'Arminda')
        .get();

    snapshot.forEach(doc => {
        const data = doc.data();
        console.log('---');
        console.log('Timestamp:', data.timestamp);
        console.log('User Message:', data.userMessage);
        console.log('Bot Response:', data.botResponse);
        console.log('Urgency:', data.urgency);
    });
}

getArmindaDetails().catch(console.error);
