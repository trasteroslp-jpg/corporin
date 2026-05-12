const admin = require('firebase-admin');
const serviceAccount = require('./credentials.json.json');

if (!admin.apps.length) {
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
    });
}

const db = admin.firestore();

async function analyzeHistoricalData() {
    console.log("Analyzing 2026 historical data...");
    
    // Fetch a significant sample from the start of 2026 until now
    const snapshot = await db.collection('metrics')
        .orderBy('timestamp', 'asc')
        .limit(200)
        .get();

    if (snapshot.empty) {
        console.log("No data found.");
        return;
    }

    const data = [];
    snapshot.forEach(doc => data.push(doc.data()));

    console.log(`Total sample size: ${data.length}`);

    // Frequency analysis by keywords
    const typologies = {
        'Asistencia / Avería / Accidente': { keywords: ['grúa', 'avería', 'accidente', 'golpe', 'no arranca', 'asistencia', 'carretera', 'pinchaz'], samples: [] },
        'DNI / Contrato / Documentación': { keywords: ['dni', 'contrato', 'papeles', 'documentos', 'alquiler'], samples: [] },
        'Vehículo / Matrícula / Daños': { keywords: ['placa', 'matrícula', 'daño', 'rayón', 'foto', 'estado'], samples: [] },
        'Ubicación / Horarios / Oficinas': { keywords: ['oficina', 'donde', 'horario', 'cerrar', 'abrir', 'dirección'], samples: [] },
        'Otros / General': { keywords: [], samples: [] }
    };

    data.forEach(log => {
        const text = (log.userMessage || "").toLowerCase();
        let categorized = false;

        for (const [cat, config] of Object.entries(typologies)) {
            if (config.keywords.some(k => text.includes(k))) {
                config.samples.push({
                    input: log.userMessage,
                    oldResponse: log.botResponse,
                    timestamp: log.timestamp
                });
                categorized = true;
                break;
            }
        }
        if (!categorized) {
            typologies['Otros / General'].samples.push({
                input: log.userMessage,
                oldResponse: log.botResponse,
                timestamp: log.timestamp
            });
        }
    });

    for (const [cat, config] of Object.entries(typologies)) {
        console.log(`\nTypology: ${cat}`);
        console.log(`Count: ${config.samples.length}`);
        if (config.samples.length > 0) {
            console.log("Sample ID:", config.samples[0].timestamp);
            console.log("Input sample:", config.samples[0].input?.substring(0, 100));
        }
    }
}

analyzeHistoricalData();
