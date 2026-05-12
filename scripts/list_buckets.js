const admin = require('firebase-admin');
const serviceAccount = require('./credentials.json.json');

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
});

const storage = admin.storage();

async function listBuckets() {
    try {
        const [buckets] = await storage.getBuckets();
        console.log('Buckets disponibles:');
        buckets.forEach(b => console.log(`- ${b.name}`));
        process.exit(0);
    } catch (e) {
        console.error('Error listando buckets:', e.message);
        process.exit(1);
    }
}

listBuckets();
