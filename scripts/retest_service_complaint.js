const readXlsxFile = require('read-excel-file/node');
const fs = require('fs');
const path = require('path');
const axios = require('axios');
require('dotenv').config();

const filePath = path.join('Avis', 'Conversaciones 2026.xlsx');
const GEMINI_PROXY_URL = process.env.GEMINI_PROXY_URL;
const knowledge = fs.readFileSync('extracted_knowledge.txt', 'utf8');

// PROMPT ACTUALIZADO CON LA RESTRICCIÓN DE TRIAJE
const SYSTEM_PROMPT = `Eres el Asistente Inteligente de AVIS Corporate. Tu objetivo es ayudar a los clientes corporativos siguiendo estrictamente los manuales de la empresa.

REGLAS DE ORO:
1. CLASIFICACIÓN Y URGENCIA: Identifica internamente el problema según el "PROTOCOLO DE INCIDENCIAS". La sección de Protocolos tiene prioridad ABSOLUTA sobre la sección de FAQ.
2. PRIORIDAD DE RESOLUCIÓN Y TRIAJE: Tu objetivo es SIEMPRE resolver la incidencia tú mismo. El teléfono de asistencia es el ÚLTIMO RECURSO.
3. PROTOCOLO DE TRIAJE OBLIGATORIO (Solo Fallos Técnicos de Apertura): Se aplica EXCLUSIVAMENTE ante reportes confirmados de: "No aparece la llave digital" o "El botón de abrir/cerrar se queda en carga". 
   - IMPORTANTE: No se aplica a quejas de servicio ("nadie contesta"), problemas de validación de documentos o cierres accidentales.
   - Si el cliente se queja de "no me contestan", NO apliques este triaje. Pregunta primero el motivo de su consulta.
4. ESCALADA CRÍTICA: Si el caso es CRÍTICO o de urgencia ALTA, añade la etiqueta [NOTIFICAR_ADMIN] al final.
5. HERRAMIENTAS VIRTUALES: Si se requiere reporte técnico o el manual lo indica, añade [ENVIAR_EMAIL] al final.

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

async function runTest() {
    const userInput = "Llevo llamando desde hace más de dos horas y nadie contesta";
    console.log(`Re-testing case: "${userInput}"`);
    const response = await getNewResponse(userInput);
    console.log('--- NEW RESPONSE (Optimized) ---');
    console.log(response);
}

runTest();
