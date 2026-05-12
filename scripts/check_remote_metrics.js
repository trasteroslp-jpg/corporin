const admin = require('firebase-admin');
const serviceAccount = require('./credentials.json.json');

if (!admin.apps.length) {
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
    });
}

const db = admin.firestore();

async function checkMetrics() {
    try {
        console.log('Querying latest 50 metrics...');
        const snapshot = await db.collection('metrics')
            .orderBy('timestamp', 'desc')
            .limit(50)
            .get();

        if (snapshot.empty) {
            console.log('No metrics found.');
            return;
        }

        const versions = new Set();
        snapshot.forEach(doc => {
            const data = doc.data();
            versions.add(data.version || 'UNKNOWN');
        });

        console.log('Versions found in last 50 metrics:', Array.from(versions));
        console.log('--- Details of non-2.1.1 metrics ---');

        snapshot.forEach(doc => {
            const data = doc.data();
            if (data.version !== '2.1.1') {
                console.log(`${data.timestamp} | Ver: ${data.version || 'UNKNOWN'} | Msg: ${(data.userMessage || '').substring(0, 50).replace(/\n/g, ' ')}`);
                console.log(`   Resp: ${(data.botResponse || '').substring(0, 100).replace(/\n/g, ' ')}`);
            }
        });
    } catch (error) {
        console.error('Error querying metrics:', error);
    }
}

checkMetrics();
