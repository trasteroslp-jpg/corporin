const admin = require('firebase-admin');
const serviceAccount = require('./credentials.json.json');

if (!admin.apps.length) {
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
    });
}
const db = admin.firestore();

db.collection('metrics').get()
    .then(snap => {
        console.log(`Documentos en 'metrics': ${snap.size}`);
        if(snap.size > 0) {
            console.log("Ejemplo de primer documento:", snap.docs[0].data());
        }
    })
    .catch(console.error);
