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
        
        await bucket.setMetadata({
            lifecycle: {
                rule: [
                    {
                        action: { type: 'Delete' },
                        condition: { age: 90 }
                    }
                ]
            }
        });
        
        console.log("✅ Política de ciclo de vida establecida (v2): Los archivos se borrarán tras 90 días.");
        
        const [metadata] = await bucket.getMetadata();
        console.log("Metadatos actualizados:", JSON.stringify(metadata.lifecycle, null, 2));

    } catch (e) {
        console.error("❌ ERROR estableciendo ciclo de vida (v2):", e.message);
    }
}

setLifecycle();
