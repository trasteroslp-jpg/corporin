const fs = require('fs');
const axios = require('axios');
require('dotenv').config();

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
    // Replicating production prompt logic:
    const consolidatedPrompt = `${SYSTEM_PROMPT}\n\n` +
        `Hora actual en Canarias: ${now}\n` +
        `Datos usuario: DNI: Desconocido, Matrícula: Desconocida, Isla: No confirmada\n\n` +
        `Mensaje del Usuario: ${userInput}`;

    const payload = {
        contents: [{
            role: 'user',
            parts: [{ text: consolidatedPrompt }]
        }],
        model: "gemini-2.0-flash" 
    };

    try {
        const response = await axios.post(GEMINI_PROXY_URL, payload);
        return response.data.text;
    } catch (e) {
        return "Error: " + e.message;
    }
}

async function runComparison() {
    const cases = [
        {
            type: "Fallo de Apertura",
            input: "No puedo abrir el coche, estoy en el parking y el bluetooth está activado pero no hace nada.",
            oldBot: "Hola, intenta reiniciar el móvil o llamar al 928 092 337 para que te ayuden."
        },
        {
            type: "Suciedad / Daños",
            input: "He recogido el coche y los asientos están llenos de arena. ¿Qué hago?",
            oldBot: "Lo sentimos mucho. Puedes limpiar el coche y pedir el reembolso si tienes el ticket."
        },
        {
            type: "Información Logística",
            input: "¿Cómo llego a la oficina de Tenerife Norte si estoy en el aeropuerto?",
            oldBot: "La oficina está en Camino San Lazaro 142. Hay un bus que te lleva."
        }
    ];

    for (let c of cases) {
        c.newBot = await getNewResponse(c.input);
    }

    fs.writeFileSync('comparison_results.json', JSON.stringify(cases, null, 2));
}

runComparison();
