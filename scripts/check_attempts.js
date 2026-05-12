const admin = require('firebase-admin');
const serviceAccount = require('./credentials.json.json');
if (!admin.apps.length) {
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
    });
}
const db = admin.firestore();
async function check() {
    console.log('Checking logs_attempts (last 10)...');
    const snapshot = await db.collection('logs_attempts').orderBy('timestamp', 'desc').limit(10).get();
    if (snapshot.empty) {
        console.log('No attempts found.');
    } else {
        snapshot.forEach(doc => {
            const data = doc.data();
            console.log(`[${data.timestamp}] ${data.userName}: ${data.messageSnippet}`);
        });
    }
}
check();
