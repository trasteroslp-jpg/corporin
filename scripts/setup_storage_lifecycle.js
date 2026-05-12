const admin = require('firebase-admin');
const serviceAccount = require('./credentials.json.json');

if (!admin.apps.length) {
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        storageBucket: 'corporin-avis-chatbot.firebasestorage.app'
    });
}

async function setLifecycle() {
    try {
        const bucket = admin.storage().bucket();
        
        // Define la política: Borrar objetos con más de 90 días (aprox 3 meses)
        const lifecycleRule = [
            {
                action: { type: 'Delete' },
                condition: { age: 90 }
            }
        ];

        await bucket.setStorageLifecyclePolicy(lifecycleRule);
        console.log("✅ Política de ciclo de vida establecida: Los archivos se borrarán tras 90 días.");
        
        // Verificar
        const [metadata] = await bucket.getMetadata();
        console.log("Metadatos del bucket actualizados:", JSON.stringify(metadata.lifecycle, null, 2));

    } catch (e) {
        console.error("❌ ERROR estableciendo ciclo de vida:", e.message);
    }
}

setLifecycle();
