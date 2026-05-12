const admin = require('firebase-admin');
const serviceAccount = require('./credentials.json.json');

if (!admin.apps.length) {
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        storageBucket: 'corporin-avis-chatbot.firebasestorage.app'
    });
}

const bucket = admin.storage().bucket();

async function setLifecycle() {
    console.log("Configurando ciclo de vida del almacenamiento (90 días)...");
    try {
        await bucket.setMetadata({
            lifecycle: {
                rule: [
                    {
                        action: { type: 'Delete' },
                        condition: { age: 90 } // 90 días = aprox 3 meses
                    }
                ]
            }
        });
        console.log("✅ Ciclo de vida configurado con éxito. Las fotos se borrarán automáticamente tras 3 meses.");
        
        // Verificar
        const [metadata] = await bucket.getMetadata();
        console.log("Metadatos actuales del bucket:", JSON.stringify(metadata.lifecycle, null, 2));

    } catch (error) {
        console.error("❌ Error configurando ciclo de vida:", error.message);
    }
}

setLifecycle();
