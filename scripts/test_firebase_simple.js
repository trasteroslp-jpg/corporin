console.log('START');
const admin = require('firebase-admin');
console.log('REQUIRE ADMIN OK');
const serviceAccount = require('./credentials.json.json');
console.log('REQUIRE CREDENTIALS OK');
admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
});
console.log('APP INITIALIZED OK');
const db = admin.firestore();
console.log('FIRESTORE OK');
process.exit(0);
