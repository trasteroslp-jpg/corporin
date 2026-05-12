const admin = require('firebase-admin');
const serviceAccount = require('./credentials.json.json');

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
});

async function listBuckets() {
    try {
        const [buckets] = await admin.storage().getBuckets();
        console.log("Buckets disponibles:");
        buckets.forEach(b => console.log("- " + b.name));
    } catch (e) {
        console.error("ERROR LISTING BUCKETS:", e.message);
    }
}
listBuckets();
