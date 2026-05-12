const admin = require('firebase-admin');
const fs = require('fs');
const path = require('path');
const readline = require('readline');

// Load credentials
const serviceAccount = require('./credentials.json.json');

if (!admin.apps.length) {
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
    });
}

const db = admin.firestore();
const metricsFile = path.join(__dirname, 'logs', 'metrics.jsonl');

async function migrate() {
    console.log("🚀 Iniciando migración de datos históricos a Firestore...");
    
    if (!fs.existsSync(metricsFile)) {
        console.log("❌ No se encontró el archivo de métricas local.");
        return;
    }

    const fileStream = fs.createReadStream(metricsFile);
    const rl = readline.createInterface({
        input: fileStream,
        crlfDelay: Infinity
    });

    let count = 0;
    const batchSize = 100;
    let batch = db.batch();

    for await (const line of rl) {
        if (!line.trim()) continue;
        const entry = JSON.parse(line);
        const ref = db.collection('metrics').doc();
        batch.set(ref, entry);
        count++;

        if (count % batchSize === 0) {
            await batch.commit();
            console.log(`✅ Subidos ${count} registros...`);
            batch = db.batch();
        }
    }

    if (count % batchSize !== 0) {
        await batch.commit();
    }

    console.log(`🎉 Migración completada. Total: ${count} registros subidos.`);
}

migrate().catch(console.error);
