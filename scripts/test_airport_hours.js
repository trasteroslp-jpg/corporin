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

async function testAirportHours() {
    // Escenario: Sábado a las 21:00 (Central cerrada, pero Aeropuertos abiertos)
    const userInput = "Le di sin querer a finalizar y no puedo abrir el coche";
    const saturdayNight = "2026-03-14T21:00:00+00:00"; // Sábado 21:00
    
    const consolidatedPrompt = `${SYSTEM_PROMPT}\n\n` +
        `Hora actual en Canarias: 14/03/2026, 21:00:00 (Sábado)\n` +
        `Datos usuario: DNI: Desconocido, Matrícula: Desconocida, Isla: Tenerife\n\n` +
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
        console.log('--- TEST: SATURDAY 21:00 (AIRPORT OPEN) ---');
        console.log(response.data.text);
    } catch (e) {
        console.error("Error:", e.message);
    }
}

testAirportHours();
