const readXlsxFile = require('read-excel-file/node');
const fs = require('fs');
const path = require('path');
const axios = require('axios');
require('dotenv').config();

const filePath = path.join('Avis', 'Conversaciones 2026.xlsx');
const GEMINI_PROXY_URL = process.env.GEMINI_PROXY_URL;
const knowledge = fs.readFileSync('extracted_knowledge.txt', 'utf8');

const SYSTEM_PROMPT = `Eres el Asistente Inteligente de AVIS Corporate. Tu objetivo es ayudar a los clientes corporativos siguiendo estrictamente los manuales de la empresa.

REGLAS DE ORO:
1. CLASIFICACIÓN Y URGENCIA: Identifica internamente el problema según el "PROTOCOLO DE INCIDENCIAS". La sección de Protocolos tiene prioridad ABSOLUTA sobre la sección de FAQ.
2. PRIORIDAD DE RESOLUCIÓN Y TRIAJE: SIEMPRE resolver la incidencia tú mismo. El teléfono de asistencia es el ÚLTIMO RECURSO.
3. ESCALADA CRÍTICA: Si el caso es CRÍTICO o de urgencia ALTA, añade la etiqueta [NOTIFICAR_ADMIN] al final.
4. HERRAMIENTAS VIRTUALES: Si se requiere reporte técnico, añade [ENVIAR_EMAIL] al final.
5. PROTOCOLO DE TRIAJE OBLIGATORIO (Fallos de App/Apertura/Cierre): Antes de escalar, el cliente DEBE confirmar Bluetooth/GPS On, Cerrar/Abrir App, y estar a <1m del coche.
6. EVIDENCIAS VISUALES: Si hay daños/suciedad, DEBES solicitar foto.

CONOCIMIENTO INTEGRAL (FAQ E INCIDENCIAS):
${knowledge}
`;

async function getNewResponse(userInput) {
    const now = new Date().toLocaleString("es-ES", { timeZone: "Atlantic/Canary" });
    const consolidatedPrompt = `${SYSTEM_PROMPT}\n\n` +
        `Hora actual en Canarias: ${now}\n` +
        `Mensaje del Usuario: ${userInput}`;

    const payload = {
        contents: [{ role: 'user', parts: [{ text: consolidatedPrompt }] }],
        model: "gemini-2.0-flash" 
    };

    try {
        const response = await axios.post(GEMINI_PROXY_URL, payload);
        return response.data.text;
    } catch (e) {
        return "Error: " + e.message;
    }
}

readXlsxFile(filePath).then(async (rows) => {
    const headers = rows[0];
    const originIdx = headers.indexOf('Origen Mensaje');
    const msgIdx = headers.indexOf('Mensaje');
    
    const interactions = [];
    for (let i = 1; i < rows.length - 1; i++) {
        if (rows[i][originIdx] === 'Cliente' && rows[i+1][originIdx] === 'Agente') {
            const userMsg = String(rows[i][msgIdx] || "");
            // Filtramos saludos cortos para obtener algo más sustancial
            if (userMsg.length > 20) {
                interactions.push({ 
                    user: userMsg, 
                    oldBot: String(rows[i+1][msgIdx] || "") 
                });
            }
        }
    }

    const shuffled = interactions.sort(() => 0.5 - Math.random());
    const selected = shuffled.slice(0, 5);

    console.log(`Processing 5 random substantial cases...`);
    const results = [];
    for (let c of selected) {
        console.log(`- Query: ${c.user.substring(0, 40)}...`);
        const newBot = await getNewResponse(c.user);
        results.push({
            user: c.user,
            oldBot: c.oldBot,
            newBot: newBot
        });
    }

    fs.writeFileSync('random_comparison_5_detailed.json', JSON.stringify(results, null, 2));
    console.log("Comparison saved to random_comparison_5_detailed.json");
}).catch(err => console.error(err));
