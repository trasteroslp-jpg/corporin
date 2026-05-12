const admin = require('firebase-admin');
const serviceAccount = require('./credentials.json.json');

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    storageBucket: 'corporin-avis-chatbot.appspot.com' 
});

const bucket = admin.storage().bucket();

async function testStorage() {
    try {
        const [files] = await bucket.getFiles({ maxResults: 1 });
        console.log('✅ Conexión a Storage exitosa. Archivos encontrados:', files.length);
        process.exit(0);
    } catch (e) {
        console.error('❌ Error Storage (appspot.com):', e.message);
        
        // Intentar con la nueva extensión si falla
        try {
            console.log('Probando con firebasestorage.app...');
            admin.app().delete();
            admin.initializeApp({
                credential: admin.credential.cert(serviceAccount),
                storageBucket: 'corporin-avis-chatbot.firebasestorage.app'
            });
            const bucket2 = admin.storage().bucket();
            const [files2] = await bucket2.getFiles({ maxResults: 1 });
            console.log('✅ Conexión a Storage exitosa (firebasestorage.app).');
            process.exit(0);
        } catch (e2) {
            console.error('❌ Error final Storage:', e2.message);
            process.exit(1);
        }
    }
}

testStorage();
