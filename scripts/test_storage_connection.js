const admin = require('firebase-admin');
const serviceAccount = require('./credentials.json.json');

if (!admin.apps.length) {
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        storageBucket: 'corporin-avis-chatbot.firebasestorage.app'
    });
}

const bucket = admin.storage().bucket();

async function testUpload() {
    try {
        const file = bucket.file('test_connection.txt');
        await file.save('Connection test ' + new Date().toISOString(), {
            metadata: { contentType: 'text/plain' }
        });
        const [url] = await file.getSignedUrl({ action: 'read', expires: '01-01-2030' });
        console.log('Upload success! Signed URL:', url);
    } catch (e) {
        console.error('Upload failed with .firebasestorage.app:', e.message);
        
        console.log('Trying with .appspot.com...');
        try {
            admin.app().delete();
            admin.initializeApp({
                credential: admin.credential.cert(serviceAccount),
                storageBucket: 'corporin-avis-chatbot.appspot.com'
            });
            const bucket2 = admin.storage().bucket();
            const file2 = bucket2.file('test_connection_v2.txt');
            await file2.save('Connection test v2', { metadata: { contentType: 'text/plain' } });
            const [url2] = await file2.getSignedUrl({ action: 'read', expires: '01-01-2030' });
            console.log('Upload success with .appspot.com! URL:', url2);
        } catch (e2) {
            console.error('Upload failed with .appspot.com:', e2.message);
        }
    }
}

testUpload();
