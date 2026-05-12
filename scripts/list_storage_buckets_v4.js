const admin = require('firebase-admin');
const serviceAccount = require('./credentials.json.json');

if (!admin.apps.length) {
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
    });
}

async function listAllBuckets() {
    try {
        const storageInstance = admin.storage().bucket().storage;
        const [buckets] = await storageInstance.getBuckets();
        console.log("Buckets encontrados:");
        buckets.forEach(b => console.log("- " + b.name));
    } catch (e) {
        console.error("ERROR:", e.message);
    }
}

listAllBuckets();
