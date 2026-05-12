const admin = require('firebase-admin');
const serviceAccount = require('./credentials.json.json');

if (!admin.apps.length) {
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
    });
}

const db = admin.firestore();

async function checkLatestMetric() {
    const snapshot = await db.collection('metrics')
        .where('inputType', '==', 'mixed')
        .orderBy('timestamp', 'desc')
        .limit(1)
        .get();

    if (snapshot.empty) {
        console.log('No mixed metrics found.');
        return;
    }

    snapshot.forEach(doc => {
        const data = doc.data();
        console.log('Document ID:', doc.id);
        console.log('Has photos:', !!data.photos);
        console.log('Photos count:', data.photos ? data.photos.length : 0);
        if (data.photos) {
            data.photos.forEach((p, i) => console.log(`Photo ${i}: ${p.substring(0, 50)}...`));
        }
    });
}

checkLatestMetric();
