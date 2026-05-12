const admin = require('firebase-admin');
const serviceAccount = require('./credentials.json.json');

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    storageBucket: 'corporin-avis-chatbot.firebasestorage.app'
});

const bucket = admin.storage().bucket();

async function testBucket() {
    try {
        const [files] = await bucket.getFiles({ maxResults: 1 });
        console.log("CONEXIÓN A STORAGE OK. Archivos encontrados:", files.length);
    } catch (e) {
        console.error("ERROR STORAGE:", e.message);
    }
}
testBucket();
