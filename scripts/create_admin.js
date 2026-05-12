const admin = require('firebase-admin');
const serviceAccount = require('./credentials.json.json');

if (!admin.apps.length) {
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
    });
}

const auth = admin.auth();

async function createAdmin() {
    try {
        const userRec = await auth.createUser({
            email: 'admin@corporin.avis',
            password: process.env.ADMIN_PASSWORD || 'CAMBIAME_2026',
            displayName: 'Director Corporín'
        });
        console.log('🎉 Usuario Administrador creado:', userRec.uid);
    } catch (e) {
        if (e.code === 'auth/email-already-exists') {
            console.log('✅ El usuario ya existe.');
        } else {
            console.error('❌ Error creando usuario:', e);
        }
    }
}

createAdmin();
