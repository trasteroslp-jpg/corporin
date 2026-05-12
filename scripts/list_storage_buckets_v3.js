const admin = require('firebase-admin');
const serviceAccount = require('./credentials.json.json');

if (!admin.apps.length) {
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
    });
}

async function listAllBuckets() {
    try {
        const storage = admin.storage();
        // The bucket listing might be a top level call on storage() or we might need to use the @google-cloud/storage directly
        const [buckets] = await storage.bucket().parent.getBuckets();
        console.log("Buckets encontrados:");
        buckets.forEach(b => console.log("- " + b.name));
    } catch (e) {
        console.log("Intento 1 fallido, probando alternativa...");
        try {
            // Alternative way since firebase-admin storage returns a gcs storage instance
            const gcsStorage = storage.bucket().storage;
            const [buckets] = await gcsStorage.getBuckets();
            console.log("Buckets encontrados (Alt):");
            buckets.forEach(b => console.log("- " + b.name));
        } catch (e2) {
             console.error("ERROR FINAL:", e2.message);
        }
    }
}

listAllBuckets();
