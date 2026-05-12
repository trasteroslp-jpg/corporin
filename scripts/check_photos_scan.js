const admin = require('firebase-admin');
const serviceAccount = require('./credentials.json.json');

if (!admin.apps.length) {
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
    });
}

const db = admin.firestore();

async function findPhotos() {
    const snapshot = await db.collection('metrics').orderBy('timestamp', 'desc').limit(50).get();
    
    let found = false;
    snapshot.forEach(doc => {
        const data = doc.data();
        if (data.photos && data.photos.length > 0) {
            console.log('--- FOUND DOC WITH PHOTOS ---');
            console.log('ID:', doc.id);
            console.log('User:', data.userName);
            console.log('Msg:', data.userMessage);
            console.log('Photos:', data.photos);
            found = true;
        }
    });

    if (!found) console.log('No documents with photos found in the last 50 entries.');
}

findPhotos();
