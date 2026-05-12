console.log('--- INICIANDO INDEX.JS ---');
require('dotenv').config();
const { Telegraf } = require('telegraf');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const googleTTS = require('google-tts-api');
const axios = require('axios');
const ffmpeg = require('fluent-ffmpeg');
const ffmpegPath = require('ffmpeg-static');
const ffprobePath = require('ffprobe-static').path;
const fs = require('fs');
const path = require('path');
const admin = require('firebase-admin');

// Inicializar Firebase Admin
const serviceAccount = require('./credentials.json.json');

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    storageBucket: 'corporin-avis-chatbot.firebasestorage.app'
});
const db = admin.firestore();
const bucket = admin.storage().bucket();

// --- Manejo de Errores Globales ---
process.on('uncaughtException', (error) => {
    console.error('❌ Error no capturado (Uncaught):', error);
    // No salimos del proceso aquí si queremos que el wrapper lo reinicie,
    // pero lo ideal es loguear y salir para tener un estado limpio.
    process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
    console.error('❌ Promesa no manejada (Rejection):', promise, 'Razón:', reason);
});


// Configurar rutas de FFmpeg y FFprobe
ffmpeg.setFfmpegPath(ffmpegPath);
ffmpeg.setFfprobePath(ffprobePath);


// --- Configuración ---
const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const GEMINI_PROXY_URL = process.env.GEMINI_PROXY_URL;

if (!BOT_TOKEN || !GEMINI_PROXY_URL) {
    console.error('ERROR (V2): Faltan variables de entorno TELEGRAM_BOT_TOKEN o GEMINI_PROXY_URL');
}

// --- CONFIGURACIÓN SEGURA DE IA (Proxy Google Cloud) ---
// Ahora usamos un Proxy en la nube para no exponer nunca la API KEY corporativa.

/**
 * Función centralizada para llamar a Gemini de forma segura
 * Soporta texto simple, historial (contents) e imágenes/audio.
 */
async function callGeminiProxy(payload, retries = 3) {
    if (!GEMINI_PROXY_URL) {
        throw new Error("⚠️ GEMINI_PROXY_URL no configurada en el .env.");
    }

    for (let i = 0; i < retries; i++) {
        try {
            console.log(`[DEBUG PROXY] Enviando a Proxy (Intento ${i+1})...`);
            fs.writeFileSync(path.join(__dirname, 'debug_payload.json'), JSON.stringify(payload, null, 2));
            const response = await axios.post(GEMINI_PROXY_URL, payload, {
                timeout: 60000 // 1 minuto de espera
            });

            if (response.data && response.data.success) {
                console.log(`[DEBUG PROXY] Respuesta Recibida: ${response.data.text ? response.data.text.substring(0, 50) + '...' : 'VACÍA'}`);
                return {
                    text: response.data.text,
                    usage: response.data.usage || {}
                };
            } else {
                console.error(`[ERROR API PROXY] Error en respuesta:`, response.data);
                throw new Error(response.data.error || "Respuesta fallida del Proxy");
            }
        } catch (error) {
            const errorMsg = error.response?.data || error.message;
            console.error(`[ERROR API PROXY] Error en Intento ${i+1}:`, errorMsg);
            if (i === retries - 1) throw error;
            
            // Pausa antes de reintentar (Exponencial simple)
            await new Promise(res => setTimeout(res, 2000 * (i + 1)));
        }
    }
}
// ------------------------------------------------------


const bot = new Telegraf(BOT_TOKEN);
console.log('🚀 Inicializando bot con versión V2.1.1 (Proxy Check)...');

// Almacenamiento temporal de sesiones
const sessions = new Map();

const SYSTEM_PROMPT = `Eres el Asistente Inteligente de AVIS Corporate (Versión 2.1.1). Tu objetivo es ayudar a los clientes corporativos siguiendo estrictamente los manuales de la empresa.

REGLAS DE ORO:
1. CLASIFICACIÓN Y URGENCIA: Identifica internamente el problema según el "PROTOCOLO DE INCIDENCIAS". La sección de Protocolos tiene prioridad ABSOLUTA sobre la sección de FAQ para determinar los pasos a seguir y las herramientas a usar.
   - IMPORTANTE: No repitas frases como "Esta es una situación CRÍTICA" en cada mensaje. Sé natural y céntrate en la solución. Menciona la gravedad solo una vez si es necesario para empatizar.
2. PRIORIDAD DE RESOLUCIÓN Y TRIAJE: Tu objetivo es SIEMPRE resolver la incidencia tú mismo. El teléfono de asistencia es el ÚLTIMO RECURSO. Ante cualquier fallo técnico o de apertura, DEBES agotar el "PROTOCOLO DE TRIAJE" antes de ofrecer contacto humano.
3. ESCALADA CRÍTICA (Texto y Fotos): Si el caso es CRÍTICO o de urgencia ALTA (como accidentes, robos, vehículos inoperables o PELIGRO INMEDIATO), SIEMPRE añade la etiqueta oculta [NOTIFICAR_ADMIN] al final.
   - REGLA DE ORO DE FOTOS: Si en una foto detectas un riesgo de seguridad (fuego, cristal roto, accidente grave), attiva [NOTIFICAR_ADMIN] automáticamente.
4. HERRAMIENTAS VIRTUALES: Cuando el manual indique "Ejecutar Enviar_Email" o si la foto confirma daños/suciedad que requiere reporte técnico, DEBES añadir la etiqueta oculta [ENVIAR_EMAIL] al final.
5. PROTOCOLO DE TRIAJE OBLIGATORIO (Solo Fallos Técnicos de Apertura): Se aplica EXCLUSIVAMENTE ante reportes de: "No aparece la llave digital" o "El botón de abrir/cerrar se queda en carga" CUANDO EL CLIENTE ESTÁ JUNTO AL VEHÍCULO. 
   - No se aplica a desvíos de vuelo, quejas de servicio ("nadie contesta"), fallos de validación o cuando el cliente no está en el punto de recogida.
   - En los casos aplicables (incidencia de apertura física), antes de dar el teléfono, el cliente DEBE confirmar:
     - Paso 1: Bluetooth y GPS encendidos y buena cobertura.
     - Paso 2: Cerrar App (matar proceso) y volver a iniciar sesión.
     - Paso 3: Estar a <1 metro del vehículo.
   IMPORTANTE: El triaje es una herramienta para fallos de comunicación Bluetooth/App-Coche. No lo uses como respuesta genérica a problemas de gestión de reserva.
6. GESTIÓN DE VALIDACIÓN: Si el cliente lleva esperando >24h, solicita su DNI para consulta interna.
7. HORARIO: Usa la hora proporcionada para decidir entre respuesta de horario laboral o fuera de él. Fuera de horario extrema el uso de [NOTIFICAR_ADMIN].
8. AUTONOMÍA: No menciones que eres una IA a menos que te pregunten. Actúa como un agente de soporte técnico experto que valora el tiempo del cliente resolviendo el problema al momento sin derivarlo.
9. EVIDENCIAS VISUALES: Si el cliente reporta daños, suciedad o falta de gasolina, DEBES solicitar amablemente una foto (del daño, de la suciedad o del cuadro de mandos para el combustible). Indica que esto es necesario para gestionar posibles compensaciones.
10. INTERACCIÓN CON FOTOS: Cuando recibas una foto, analiza su contenido y relaciónalo con la incidencia. Si confirma el daño o suciedad, asegúrate de activar [ENVIAR_EMAIL].
11. POLÍTICA DE CONTACTO Y HORARIOS (TIEMPO DE CANARIAS):
   Debes actuar según la hora actual en Canarias que se te proporciona y el día de la semana.
   - PLAN A (Horario Central): Lunes a Viernes de 08:00 a 20:00. Derivar al teléfono 928 092 337.
   - PLAN B (Horario Oficinas): Lunes a Viernes de 20:00 a 23:00, y Sábados/Domingos de 08:00 a 23:00. 
     * Acción: Pregunta la isla si no la conoces (Las Palmas, Tenerife, La Palma, Lanzarote, Fuerteventura). Una vez sepa la isla, derivar al teléfono:
       - Las Palmas / Gran Canaria: 670553417
       - Tenerife Norte: 672224323
       - Tenerife Sur: 608013023
       - La Palma: 620823514
       - Lanzarote: 608023519
       - Fuerteventura: 606707816
   - PLAN C (Fuera de Horario): Cualquier hora no cubierta arriba. Informar que el soporte humano no está disponible. Indicar el horario de la Central (L-V 08:00-20:00) y ofrecerte a registrar el caso para aviso al equipo.
12. DESVÍOS DE VUELO Y CAMBIOS DE AEROPUERTO: Si el cliente informa que su vuelo ha sido desviado a otro aeropuerto o que no llegará a tiempo por causas del vuelo:
    - Escenario A (Hora de inicio NO ha pasado): Indicar que la cancelación es gratuita y el reembolso automático desde la App. No es necesario pedir el DNI en este caso. Sugerir crear una nueva reserva en el destino actual.
    - Escenario B (Hora de inicio YA ha pasado): Explicar que la App no permite cancelación directa. Debe "Iniciar" y "Finalizar" la reserva original en la App y luego crear una nueva. En este caso, SÍ solicitar el DNI para que el soporte gestione el reembolso del viaje no disfrutado.
    - IMPORTANTE: El PROTOCOLO DE TRIAJE (Bluetooth/acercarse al coche) se aplica ÚNICAMENTE si el problema es que el cliente está físicamente junto al coche y no puede abrirlo. En cualquier otro caso (como desvíos de vuelo o quejas de servicio), está TERMINANTEMENTE PROHIBIDO mencionar los pasos del triaje.
13. PRECISIÓN EN PRECIOS (ESTRICTA): Si el manual de conocimiento (FAQ) especifica un precio exacto (ej: "5€ extra al día"), DEBES dar esa cifra. Está PROHIBIDO decir que el precio "varía" o "se mostrará después". Si el dato está en el manual, dalo con seguridad.

CONOCIMIENTO INTEGRAL (FAQ E INCIDENCIAS):
${fs.readFileSync('extracted_knowledge.txt', 'utf8')}
`;

// Cargar configuración (ID de admin para notificaciones)
let config = { adminId: null, telegramAlerts: '630849333' };
try {
    if (fs.existsSync(path.join(__dirname, 'logs', 'config.json'))) {
        config = JSON.parse(fs.readFileSync(path.join(__dirname, 'logs', 'config.json'), 'utf8'));
    }
} catch (e) { console.error("Error cargando config:", e); }

function saveConfig() {
    fs.writeFileSync(path.join(__dirname, 'logs', 'config.json'), JSON.stringify(config));
}






bot.start((ctx) => {
    const welcomeMsg = `¡Bienvenido a **AVIS Corporate Support**! 🚗💨\n\n` +
        `Soy tu asistente virtual inteligente, disponible las 24 horas para que tu experiencia con AVIS sea impecable.\n\n` +
        `**¿Qué puedo hacer por ti?**\n` +
        `🛠️ **Asistencia Técnica**: Si tienes problemas con la App o la apertura/cierre del vehículo.\n` +
        `📸 **Gestión de Incidencias**: Reporta suciedad, daños o falta de combustible (puedes enviarme fotos de evidencia).\n` +
        `❓ **Consultas Rápidas**: Dudas sobre devoluciones, facturación o funcionamiento del servicio.\n` +
        `🆘 **Emergencias**: Si el vehículo es inoperable, gestionaré tu caso con máxima prioridad.\n\n` +
        `*💡 Consejo: Puedes escribirme con naturalidad, enviarme fotos o incluso notas de voz.*\n\n` +
        `¿En qué puedo ayudarte en este momento?`;
    
    ctx.reply(welcomeMsg, { parse_mode: 'Markdown' });
});


// Comando para registrar al dueño como receptor de alertas críticas
// Comando para registrar al dueño como receptor de alertas críticas (BLOQUEADO TRAS REGISTRO)
bot.command('admin', (ctx) => {
    if (config.adminId && config.adminId !== ctx.chat.id) {
        console.log(`[SECURITY] Intento de acceso admin denegado para ${ctx.chat.id}`);
        return ctx.reply('⛔ Acceso denegado. Ya existe un administrador registrado.');
    }
    config.adminId = ctx.chat.id;
    saveConfig();
    ctx.reply('✅ Tu ID ha sido confirmado como administrador.');
});

// NUEVO: Comando para reiniciar el bot desde Telegram (Solo Admin)
bot.command('reboot', async (ctx) => {
    if (config.adminId && ctx.chat.id !== config.adminId) {
        return ctx.reply('⛔ Solo el administrador puede reiniciar el bot.');
    }
    await ctx.reply('🔄 Reiniciando bot para aplicar cambios... Por favor espera 10 segundos.');
    console.log('🔄 REINICIO SOLICITADO POR ADMIN VIA TELEGRAM. Saliendo del proceso...');
    setTimeout(() => {
        process.exit(0);
    }, 1000);
});

bot.on('text', async (ctx) => {
    console.log(`[DEBUG] Mensaje de texto recibido de ${ctx.from.id}: ${ctx.message.text.substring(0, 20)}...`);
    collectInput(ctx, 'text', ctx.message.text);
});


bot.on('voice', async (ctx) => {
    const oggPath = path.join(__dirname, `voice_${ctx.from.id}.ogg`);
    const wavPath = path.join(__dirname, `voice_${ctx.from.id}.wav`);
    
    try {
        await ctx.sendChatAction('typing');
        const fileId = ctx.message.voice.file_id;
        const fileLink = await ctx.telegram.getFileLink(fileId);
        
        // 1. Descargar audio OGG
        const response = await axios.get(fileLink.href, { responseType: 'stream' });
        const writer = fs.createWriteStream(oggPath);
        response.data.pipe(writer);

        await new Promise((resolve, reject) => {
            writer.on('finish', resolve);
            writer.on('error', reject);
        });

        // 2. Convertir OGG a WAV
        await new Promise((resolve, reject) => {
            ffmpeg(oggPath)
                .toFormat('wav')
                .on('error', reject)
                .on('end', resolve)
                .save(wavPath);
        });

        // 3. Leer WAV
        if (!fs.existsSync(wavPath)) throw new Error('Archivo WAV no generado');
        const voiceBuffer = fs.readFileSync(wavPath);
        
        // 4. Enviar al Proxy Gemini (Seguridad total)
        const getGeminiAudioResponse = async (buffer) => {
            const payload = {
                model: "gemini-2.5-flash",
                contents: [
                    { 
                        role: 'user', 
                        parts: [
                            { text: SYSTEM_PROMPT + "\n\nAnaliza este audio y responde al usuario de forma natural pero siguiendo estrictamente las reglas de asistencia." },
                            {
                                inlineData: {
                                    data: buffer.toString('base64'),
                                    mimeType: 'audio/wav'
                                }
                            }
                        ]
                    }
                ]
            };
            return await callGeminiProxy(payload);
        };

        const { text, usage } = await getGeminiAudioResponse(voiceBuffer);
        logMetric(ctx, 'audio', text, usage); // Log del mensaje de audio
        await handleBotResponse(ctx, text, true); // Enviar audio si el usuario mandó audio

    } catch (error) {
        console.error('--- ERROR DE VOZ ---');
        console.error(error);
        ctx.reply('He recibido tu audio, pero los servidores de Google están algo saturados ahora mismo. ¿Podrías intentar enviarlo de nuevo o escribírmelo?');
    } finally {
        if (fs.existsSync(oggPath)) try { fs.unlinkSync(oggPath); } catch (e) {}
        if (fs.existsSync(wavPath)) try { fs.unlinkSync(wavPath); } catch (e) {}
    }
});

bot.on('photo', async (ctx) => {
    try {
        const photo = ctx.message.photo.pop();
        const fileLink = await ctx.telegram.getFileLink(photo.file_id);
        const caption = ctx.message.caption || "";
        
        // Descargamos para tener el base64 listo para cuando expire el debounce
        const response = await axios.get(fileLink.href, { responseType: 'arraybuffer' });
        const imageBase64 = Buffer.from(response.data).toString('base64');

        collectInput(ctx, 'photo', {
            id: photo.file_id,
            url: fileLink.href,
            buffer: response.data, // Guardamos el buffer original para subirlo
            base64: imageBase64,
            caption: caption
        });
    } catch (error) {
        console.error('Error recolectando foto:', error);
    }
});

/**
 * Sube un buffer a Firebase Storage y devuelve la URL firmada (o pública si aplica)
 */
async function uploadToStorage(buffer, userId, originalUrl) {
    try {
        const timestamp = Date.now();
        const fileName = `uploads/${userId}/${timestamp}_photo.jpg`;
        const file = bucket.file(fileName);

        await file.save(buffer, {
            metadata: { contentType: 'image/jpeg' }
        });

        // Generamos una URL con expiración muy lejana (o podrías hacerlo público si el bucket lo permite)
        const [url] = await file.getSignedUrl({
            action: 'read',
            expires: '03-09-2491' // Literalmente siglos
        });

        console.log(`[STORAGE] Foto subida con éxito: ${fileName}`);
        return url;
    } catch (e) {
        console.error("Error subiendo a Storage, usando URL original de Telegram:", e);
        return originalUrl;
    }
}





const DEBOUNCE_TIME = 2500; // 2.5 segundos de espera

function getSession(userId) {
    if (!sessions.has(userId)) {
        sessions.set(userId, { 
            history: [], 
            userData: { dni: null, plate: null, isla: null, photos: [], photoIds: [] },
            buffer: { text: "", photos: [], timer: null } 
        });
    }
    return sessions.get(userId);
}

async function collectInput(ctx, type, data) {
    const userId = ctx.from.id;
    const session = getSession(userId);

    if (type === 'text') {
        session.buffer.text += (session.buffer.text ? "\n" : "") + data;
    } else if (type === 'photo') {
        // En un bot real con mucho tráfico, esto debería ser asíncrono y no bloquear
        // pero para este volumen, subimos antes de meter al buffer
        const persistentUrl = await uploadToStorage(data.buffer, userId, data.url);
        data.url = persistentUrl; 
        delete data.buffer; // Limpiar memoria
        session.buffer.photos.push(data);
    }

    console.log(`[INPUT] Recibido ${type} de ${userId}. Debounce iniciado...`);
    // Reiniciar temporizador
    if (session.buffer.timer) clearTimeout(session.buffer.timer);
    
    session.buffer.timer = setTimeout(() => {
        processAggregatedInput(ctx, session);
    }, DEBOUNCE_TIME);
}

async function processAggregatedInput(ctx, session) {
    const { buffer, userData, history } = session;
    const userId = ctx.from.id;
    
    // Extraer y limpiar buffer
    const textToProcess = buffer.text;
    const photosToProcess = [...buffer.photos];
    session.buffer = { text: "", photos: [], timer: null };

    try {
        await ctx.sendChatAction('typing');
        
        // Log de intento consolidado
        db.collection('logs_attempts').add({
            timestamp: new Date().toISOString(),
            userId: userId,
            userName: ctx.from.first_name || 'Desconocido',
            messageSnippet: textToProcess.substring(0, 100) + (photosToProcess.length ? " (+FOTOS)" : "")
        }).catch(e => console.error("Error logging attempt to Firestore:", e));

        // 1. Triaje de datos (DNI/Placa) del texto acumulado
        const dniMatch = textToProcess.match(/([0-9]{8}[A-Z]|[XYZ][0-9]{7}[A-Z])/i);
        if (dniMatch) userData.dni = dniMatch[0].toUpperCase();
        
        const plateMatch = textToProcess.match(/[0-9]{4}[A-Z]{3}/i);
        if (plateMatch) userData.plate = plateMatch[0].toUpperCase();

        const islandRegex = /(Gran Canaria|Las Palmas|Tenerife|La Palma|Lanzarote|Fuerteventura|El Hierro|La Gomera)/i;
        const islandMatch = textToProcess.match(islandRegex);
        if (islandMatch) userData.isla = islandMatch[0];

        // 2. Preparar el contexto acumulado (DNI, Matrícula e Isla)
        const now = new Date().toLocaleString("es-ES", { timeZone: "Atlantic/Canary" });
        const consolidatedPrompt = `${SYSTEM_PROMPT}\n\n` +
            `Hora actual en Canarias: ${now}\n` +
            `Datos usuario: DNI: ${userData.dni || 'Desconocido'}, Matrícula: ${userData.plate || 'Desconocida'}, Isla: ${userData.isla || 'No confirmada'}\n\n` +
            `Historial reciente:\n${history.map(h => `${h.role}: ${h.text}`).join('\n')}\n\n` +
            `Mensaje del Usuario: ${textToProcess || "(Imagen enviada)"}`;

        const parts = [{ text: consolidatedPrompt }];

        // Añadir fotos al payload si existen
        photosToProcess.forEach(p => {
            parts.push({ inlineData: { data: p.base64, mimeType: 'image/jpeg' } });
            if (!userData.photos.includes(p.url)) {
                userData.photos.push(p.url);
                userData.photoIds.push(p.id);
            }
        });

        // 3. Llamada a Gemini multimodal a través del Proxy
        const result = await callGeminiProxy({ 
            contents: [{
                role: 'user',
                parts: parts
            }],
            model: "gemini-2.5-flash" 
        });
        const botResponse = result.text;
        const usage = result.usage;

        // Obtener un timestamp único para este intercambio para referenciar el feedback
        const messageTimestamp = new Date().toISOString();
        const finalUserText = textToProcess || (photosToProcess.length > 0 ? "Analiza estas imágenes." : "");
        
        logMetric(ctx, photosToProcess.length > 0 ? 'mixed' : 'text', botResponse, usage, userData, finalUserText, messageTimestamp);
        
        history.push({ role: "Usuario", text: finalUserText });
        history.push({ role: "Asistente", text: botResponse });
        if (history.length > 20) history.shift();

        await handleBotResponse(ctx, botResponse, false, userData, history, messageTimestamp);

    } catch (error) {
        console.error('Error en processAggregatedInput:', error);
        const errorMsg = error.response?.data?.error || error.message || "";
        if (errorMsg.toLowerCase().includes('quota') || errorMsg.includes('429')) {
            ctx.reply('⚠️ El sistema está experimentando una alta demanda ahora mismo (límite de cuota alcanzado). Por favor, espera un minuto e inténtalo de nuevo.');
        } else {
            ctx.reply('Lo siento, he tenido un problema al procesar tus mensajes. ¿Podrías intentar de nuevo en unos momentos?');
        }
    }
}


async function handleBotResponse(ctx, text, sendAudio = false, userData = {}, fullHistory = [], messageTimestamp = null) {
// 1. Detectar etiquetas de control y limpiar texto
let shouldNotify = text.includes('[NOTIFICAR_ADMIN]');
// ... resto del código ... (el replace_file_content se encargará de los límites)
    let shouldEmail = text.includes('[ENVIAR_EMAIL]');
    
    let cleanText = text
        .replace('[NOTIFICAR_ADMIN]', '')
        .replace('[ENVIAR_EMAIL]', '')
        .replace(/`?Usar Herramienta: [a-zA-Z0-9_]+`?/gi, '') // Elimina cualquier mención a herramientas como Enviar_Email o Add_Label
        .replace(/- `Usar Herramienta: [a-zA-Z0-9_]+`/gi, '') // Elimina formato de lista con herramientas
        .replace(/\*\*/g, '') // Limpiar negritas
        .replace(/\n\s*\n/g, '\n\n') // Eliminar saltos de línea excesivos tras las limpiezas
        .trim();


    // Simulación de log de envíos de email (SIEMPRE se guarda en log si se solicita, incluso si no hay admin)
    if (shouldEmail) {
        const emailData = {
            timestamp: new Date().toISOString(),
            to: 'corporate@aviscanarias.es',
            userId: ctx.from.id,
            userName: ctx.from.first_name || 'Desconocido',
            userDNI: userData.dni || 'No facilitado aún',
            vehiclePlate: userData.plate || 'No identificada aún',
            incidentSummary: cleanText,
            attachments: userData.photos || [],
            fullConversation: fullHistory.map(h => `${h.role}: ${h.text}`).join('\n')
        };
        
        // Log de email en Firestore (reemplaza archivo local)
        db.collection('logs_emails').add(emailData)
          .then(() => console.log(`[CLOUD] Reporte de email guardado en Firestore para ${ctx.from.id}`))
          .catch(e => console.error("Error logging email to Firestore:", e));

        // Limpiar fotos tras generar el reporte
        userData.photos = [];
        userData.photoIds = [];
    }


    // Notificar al administrador si es crítico o requiere email (SÓLO si hay admin registrado)
    if ((shouldNotify || shouldEmail) && config.adminId) {
        let alertMsg = '';
        if (shouldNotify) alertMsg += `🚨 **ALERTA URGENTE / CRÍTICA** 🚨\n`;
        if (shouldEmail) alertMsg += `📧 **REPORTE AUTOMÁTICO GENERADO**\n`;
        
        alertMsg += `\n━━━━━━━━━━━━━━━━━━━━\n`;
        alertMsg += `👤 **Usuario:** ${ctx.from.first_name || 'Desconocido'} (\`${ctx.from.id}\`)`;
        alertMsg += `\n🆔 **DNI:** ${userData.dni || 'No facilitado'}`;
        alertMsg += `\n🚗 **Matrícula:** ${userData.plate || 'No detectada'}`;
        
        const photoCount = (userData.photos || []).length;
        if (photoCount > 0) {
            alertMsg += `\n🖼️ **Evidencias:** ${photoCount} fotos recibidas.`;
            alertMsg += `\n🔗 **Links permanentes:**\n`;
            userData.photos.forEach((url, i) => {
                alertMsg += `- [Foto ${i+1}](${url})\n`;
            });
        }
        
        alertMsg += `\n📝 **Resumen IA:**\n_${cleanText.substring(0, 500)}..._`;
        alertMsg += `\n━━━━━━━━━━━━━━━━━━━━`;
        
        await ctx.telegram.sendMessage(config.adminId, alertMsg, { parse_mode: 'Markdown' });

        // REENVIAR FOTOS AL ADMIN (EVIDENCIA REAL para visualización rápida)
        if ((userData.photoIds || []).length > 0) {
            for (const photoId of userData.photoIds) {
                try {
                    await ctx.telegram.sendPhoto(config.adminId, photoId, {
                        caption: `📸 Evidencia del usuario ${ctx.from.first_name || 'id:' + ctx.from.id}`
                    });
                } catch (err) {
                    console.error("Error reenviando foto al admin:", err.message);
                }
            }
        }
    }

    
    // Enviar respuesta al cliente con botones de feedback (usando el timestamp del mensaje como ref)
    const ref = messageTimestamp || new Date().toISOString();
    await ctx.reply(cleanText, {
        reply_markup: {
            inline_keyboard: [[
                { text: "👍 Resolvió mi duda", callback_data: `fb_pos_${ref}` },
                { text: "👎 No es preciso", callback_data: `fb_neg_${ref}` }
            ]]
        }
    });

    // 2. Enviar respuesta de audio (TTS mejorado) SOLO si se solicita
    if (!sendAudio) return;


    try {
        await ctx.sendChatAction('upload_voice');
        
        // Formatear para el audio: 
        // Primero eliminamos asteriscos en el audio también
        let textForAudio = cleanText;

        // Corregir pronunciación de "24 h" o "24h"
        textForAudio = textForAudio.replace(/24\s?h/gi, 'veinticuatro horas');

        // Buscamos teléfonos (ej: 928092337 o 928 092 337) y los separamos con puntos
        // para que Google TTS los lea como cifras individuales/pausadas
        textForAudio = textForAudio.replace(/(\d{3})\s?(\d{3})\s?(\d{3})/g, '$1. $2. $3.');


        // Obtener URLs para fragmentos de máximo 200 caracteres (límite de Google)
        const chunks = googleTTS.getAllAudioUrls(textForAudio, {
            lang: 'es',
            slow: false,
            host: 'https://translate.google.com',
            splitPunct: '.,;!?'
        });

        const tempDir = path.join(__dirname, 'temp_audio');
        if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir);

        const filePaths = [];
        
        // Descargar cada fragmento
        for (let i = 0; i < chunks.length; i++) {
            const chunkPath = path.join(tempDir, `chunk_${ctx.from.id}_${i}.mp3`);
            const response = await axios.get(chunks[i].url, { responseType: 'arraybuffer' });
            fs.writeFileSync(chunkPath, Buffer.from(response.data));
            filePaths.push(chunkPath);
        }

        const mergedPath = path.join(tempDir, `resp_${ctx.from.id}.mp3`);
        const finalPath = path.join(tempDir, `final_${ctx.from.id}.mp3`);

        // Unir fragmentos
        await new Promise((resolve, reject) => {
            const command = ffmpeg();
            filePaths.forEach(p => command.input(p));
            command
                .on('error', reject)
                .on('end', resolve)
                .mergeToFile(mergedPath, tempDir);
        });

        // Ajustar velocidad (1.2x para que sea más dinámico y natural)
        await new Promise((resolve, reject) => {
            ffmpeg(mergedPath)
                .audioFilters('atempo=1.2')
                .on('error', (err) => {
                    console.error('Error en FFmpeg filter:', err);
                    reject(err);
                })
                .on('end', resolve)
                .save(finalPath);
        });

        await ctx.replyWithVoice({ source: finalPath });

        // Limpieza
        filePaths.forEach(p => { if (fs.existsSync(p)) fs.unlinkSync(p); });
        if (fs.existsSync(mergedPath)) fs.unlinkSync(mergedPath);
        if (fs.existsSync(finalPath)) fs.unlinkSync(finalPath);

    } catch (ttsError) {
        console.error('Error generando TTS completo:', ttsError);
    }
}

async function getGeminiResponse(prompt) {
    // Encapsulamos el prompt con el historial o contexto si fuera necesario
    const payload = { prompt: prompt };
    return await callGeminiProxy(payload);
}


// Nueva función para loguear métricas
function logMetric(ctx, inputType, responseText, usage, userData = {}, userMsg = "", overrideTimestamp = null) {
    if (!responseText) responseText = "";
    const isAutomated = !responseText.includes('928 092 337') && !responseText.includes('900 112 222');
    
    // Detectar urgencia estimada (para el dashboard)
    let urgency = 'Baja';
    if (responseText.includes('[NOTIFICAR_ADMIN]')) urgency = 'Crítica';
    else if (responseText.includes('DNI') || responseText.includes('asistencia')) urgency = 'Media/Alta';

    const logEntry = {
        timestamp: overrideTimestamp || new Date().toISOString(),
        version: "2.1.1",
        userId: ctx.from.id,
        userName: ctx.from.first_name || 'Desconocido',
        dni: userData.dni || 'No facilitado',
        plate: userData.plate || 'No detectada',
        inputType,
        userMessage: userMsg.substring(0, 500), // Guardar mensaje para el log de conversaciones
        botResponse: responseText.substring(0, 500),
        automation: isAutomated,
        urgency,
        tokens: usage,
        responseSize: responseText.length,
        photos: userData.photos || []
    };
    
    fs.appendFileSync(path.join(__dirname, 'logs', 'metrics.jsonl'), JSON.stringify(logEntry) + '\n');

    // Sincronizar con Firebase Firestore para Dashboard Remoto
    db.collection('metrics').add(logEntry).catch(e => console.error("Error sincronizando con Firebase:", e));
}

// Manejar feedback (precisión)
bot.action(/fb_(pos|neg)_(.+)/, (ctx) => {
    const isPos = ctx.match[1] === 'pos';
    const logEntry = {
        timestamp: new Date().toISOString(),
        userId: ctx.from.id,
        ref: ctx.match[2],
        feedback: isPos ? 'positive' : 'negative'
    };
    fs.appendFileSync(path.join(__dirname, 'logs', 'metrics.jsonl'), JSON.stringify(logEntry) + '\n');
    
    // Sincronizar con Firebase Firestore para Dashboard Remoto
    db.collection('metrics').add(logEntry).catch(e => console.error("Error sincronizando feedback con Firebase:", e));

    ctx.answerCbQuery(isPos ? '¡Gracias! Nos alegra haberte ayudado.' : 'Sentimos oirlo. Seguiremos mejorando.');
    ctx.editMessageReplyMarkup(); // Elimina los botones
});


bot.telegram.getMe().then(me => {
    console.log(`✅ Conectado a Telegram como: @${me.username}`);
    console.log('🚀 Llamando a bot.launch()...');
    bot.launch()
        .then(() => {
            console.log('🤖 Bot de Corporin AVIS iniciado correctamente y escuchando.');
        })
        .catch(err => {
            console.error('❌ Error fatal al iniciar el bot:', err);
            process.exit(1);
        });
}).catch(err => {
    console.error('❌ Error de conexión inicial:', err.message);
    process.exit(1);
});

// Heartbeat log cada 15 minutos para confirmar que sigue vivo en segundo plano
setInterval(() => {
    console.log(`[${new Date().toISOString()}] Heartbeat: Bot sigue activo y escuchando.`);
}, 15 * 60 * 1000);

// Detener Gracefully
process.once('SIGINT', () => {
    console.log('Recibido SIGINT, deteniendo bot...');
    bot.stop('SIGINT');
});

process.once('SIGTERM', () => {
    console.log('Recibido SIGTERM, deteniendo bot...');
    bot.stop('SIGTERM');
});
