const admin = require('firebase-admin');
const serviceAccount = require('./credentials.json.json');

if (!admin.apps.length) {
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
    });
}

const storage = admin.storage();
const [buckets] = storage.getBuckets().then(([buckets]) => {
    console.log('Available buckets:');
    buckets.forEach(b => console.log('- ' + b.name));
}).catch(e => console.error(e));
