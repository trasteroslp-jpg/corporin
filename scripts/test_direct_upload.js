const admin = require('firebase-admin');
const serviceAccount = require('./credentials.json.json');

if (!admin.apps.length) {
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
    });
}

const storage = admin.storage();
const bucket = storage.bucket('corporin-avis-chatbot.firebasestorage.app');

async function testUpload() {
    try {
        const content = 'Test content';
        const file = bucket.file('test.txt');
        await file.save(content);
        console.log("SUBIDA EXITOSA AL BUCKET: corporin-avis-chatbot.firebasestorage.app");
        // Get signed URL to verify access
        const [url] = await file.getSignedUrl({
            action: 'read',
            expires: '03-09-2491'
        });
        console.log("URL de prueba:", url);
    } catch (e) {
        console.error("ERROR EN SUBIDA:", e.message);
        console.log("Probando con .appspot.com...");
        try {
            const bucket2 = storage.bucket('corporin-avis-chatbot.appspot.com');
            await bucket2.file('test.txt').save('test content appspot');
            console.log("SUBIDA EXITOSA AL BUCKET (legacy): corporin-avis-chatbot.appspot.com");
        } catch (e2) {
            console.error("ERROR FINAL:", e2.message);
        }
    }
}

testUpload();
