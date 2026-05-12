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
        // The correct method to list buckets is on the storage object itself
        const [buckets] = await storage.getBuckets();
        console.log("Buckets encontrados:");
        buckets.forEach(b => console.log("- " + b.name));
    } catch (e) {
        console.error("ERROR AL LISTAR BUCKETS:", e.message);
    }
}

listAllBuckets();
