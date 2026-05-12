const admin = require('firebase-admin');
const serviceAccount = require('./credentials.json.json');
if (!admin.apps.length) {
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
    });
}
const db = admin.firestore();
const todayString = new Date().toISOString().split('T')[0];
async function check() {
    console.log(`Checking metrics for ${todayString}...`);
    const snapshot = await db.collection('metrics')
        .where('timestamp', '>=', todayString)
        .orderBy('timestamp', 'desc').get();
    if (snapshot.empty) {
        console.log('No metrics found for today.');
    } else {
        snapshot.forEach(doc => {
            const data = doc.data();
            console.log(`[${data.timestamp}] ${data.userName}: ${data.userMessage}`);
            console.log(` -> Bot: ${data.botResponse}`);
        });
    }
}
check();
