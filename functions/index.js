const { onRequest } = require("firebase-functions/v2/https");
const { GoogleGenerativeAI } = require("@google/generative-ai");
const { initializeApp } = require("firebase-admin/app");
const { getFirestore } = require("firebase-admin/firestore");
const axios = require("axios");

initializeApp();
const db = getFirestore();

// Gemini Proxy 2.0: "Encripción" y Seguridad Total
// Este servicio actúa como el único motor de IA para Corporín (Prod y Dev)

exports.geminiProxy = onRequest({ 
    cors: true,
    region: "us-central1",
    secrets: ["GEMINI_KEY"],
    timeoutSeconds: 120,
    memory: "256MiB"
}, async (req, res) => {
    const { prompt, contents, model: modelName } = req.body || {};
    
    if (!prompt && !contents) {
        return res.status(400).json({ error: "Faltan contenidos para procesar." });
    }
    
    try {
        const apiKey = process.env.GEMINI_KEY;
        if (!apiKey) throw new Error("GEMINI_KEY no configurada.");

        // Lista de modelos a probar en orden de preferencia (fallback automático)
        const modelsToTry = modelName 
            ? [modelName, "gemini-2.5-flash", "gemini-2.0-flash", "gemini-1.5-flash"]
            : ["gemini-2.5-flash", "gemini-2.0-flash", "gemini-1.5-flash"];
        // Eliminar duplicados
        const uniqueModels = [...new Set(modelsToTry)];

        let requestBody;
        if (contents) {
            requestBody = { contents: Array.isArray(contents) ? contents : [contents] };
        } else {
            requestBody = { 
                contents: [{ 
                    role: "user", 
                    parts: [{ text: prompt }] 
                }] 
            };
        }

        let lastError = null;
        const apiVersions = ["v1beta", "v1"]; // v1beta es el que usa producción
        for (const selectedModel of uniqueModels) {
            for (const apiVersion of apiVersions) {
                try {
                    const apiUrl = `https://generativelanguage.googleapis.com/${apiVersion}/models/${selectedModel}:generateContent?key=${apiKey}`;
                    console.log(`[Proxy] Intentando modelo: ${selectedModel} (${apiVersion})`);
                    
                    const response = await axios.post(apiUrl, requestBody, {
                        headers: { "Content-Type": "application/json" },
                        timeout: 90000
                    });
                    
                    const data = response.data;
                    const text = data.candidates?.[0]?.content?.parts?.[0]?.text || "";
                    const usage = data.usageMetadata || {};
                    
                    console.log(`[Proxy] ✅ Éxito con ${selectedModel} (${apiVersion})`);
                    return res.json({ 
                        success: true, 
                        text: text,
                        usage: usage,
                        modelUsed: selectedModel
                    });
                } catch (modelError) {
                    lastError = modelError;
                    const errMsg = modelError.response?.data?.error?.message || modelError.message;
                    console.warn(`[Proxy] ⚠️ Falló ${selectedModel} (${apiVersion}): ${errMsg}`);
                    continue;
                }
            }
        }
        
        // Si ningún modelo/versión funcionó
        const errMsg = lastError?.response?.data?.error?.message || lastError?.message || "Todos los modelos fallaron";
        console.error("❌ Error en Proxy Gemini (todos los modelos fallaron):", errMsg);
        res.status(500).json({ success: false, error: errMsg });

    } catch (error) {
        const errMsg = error.response?.data?.error?.message || error.message;
        console.error("❌ Error en Proxy Gemini:", errMsg);
        res.status(500).json({ success: false, error: errMsg });
    }
});

// VAPI Webhook: Punto de entrada para el Voice AI
exports.vapiWebhook = onRequest({
    cors: true,
    region: "us-central1",
    secrets: ["BOT_TOKEN", "ADMIN_ID"],
    memory: "256MiB"
}, async (req, res) => {
    const payload = req.body;
    const messageType = payload.message?.type;

    console.log(`[VAPI] Mensaje recibido: ${messageType}`);

    try {
        // Log de depuración para ver qué está enviando Vapi exactamente
        await db.collection('vapi_debug_logs').add({
            timestamp: new Date().toISOString(),
            type: messageType || 'desconocido',
            full_payload: JSON.stringify(payload)
        });

        if (messageType === 'tool-call' || messageType === 'tool-calls') {
            const toolCallList = payload.message.toolCalls || payload.message.toolCallList || [];
            const results = [];

            console.log(`[VAPI] Procesando ${toolCallList.length} tool calls`);

            for (const tool of toolCallList) {
                if (tool.function.name === 'reportar_incidencia') {
                    const args = typeof tool.function.arguments === 'string' ? JSON.parse(tool.function.arguments) : tool.function.arguments;
                    const { dni, matricula, resumen } = args;
                    
                    console.log(`[VAPI] Incidencia detectada: DNI=${dni}, Matrícula=${matricula}`);

                    // 1. Registro detallado para historial de voz
                    await db.collection('logs_incidencias_voz').add({
                        timestamp: new Date().toISOString(),
                        dni: dni || 'No facilitado',
                        matricula: matricula || 'No detectada',
                        resumen: resumen || '(Sin resumen)',
                        type: 'voice_ai'
                    });

                    // 2. REGISTRO PARA EL DASHBOARD (metrics) - Para que aparezca de inmediato
                    await db.collection('metrics').add({
                        timestamp: new Date().toISOString(),
                        channel: 'voice_active',
                        userId: payload.message.call?.customer?.number || 'Voz',
                        userName: `Voz (In-Call): ${dni || 'Anon'}`,
                        dni: dni || 'No facilitado',
                        plate: matricula || 'No detectada',
                        userMessage: resumen || 'Reporte de daños en curso',
                        botResponse: "Registrando incidencia...",
                        feedback: 'positive',
                        urgency: 'Alta', // Las incidencias manuales suelen ser altas
                        automation: true,
                        photos: []
                    });

                    // 3. Notificación Telegram
                    const botToken = process.env.BOT_TOKEN;
                    const adminId = process.env.ADMIN_ID;

                    console.log(`[VAPI] Intentando notificar Telegram. Token: ${botToken ? 'OK' : 'MISSING'}, AdminID: ${adminId ? 'OK' : 'MISSING'}`);

                    if (botToken && adminId) {
                        const alert = `📞 **ALERTA VOZ (Vapi)**\n\n👤 DNI: ${dni}\n🚗 Matrícula: ${matricula}\n📝 Resumen: ${resumen}`;
                        try {
                            await axios.post(`https://api.telegram.org/bot${botToken}/sendMessage`, {
                                chat_id: adminId,
                                text: alert,
                                parse_mode: 'Markdown'
                            });
                            console.log("[VAPI] Telegram notificado con éxito");
                        } catch (e) {
                            console.error("[VAPI] Error enviando alerta Telegram:", e.response?.data || e.message);
                        }
                    }

                    results.push({
                        toolCallId: tool.id,
                        result: "Entendido. He registrado el reporte de daños y avisado al equipo de soporte."
                    });
                }
            }
            return res.json({ results });
        }

        if (messageType === 'end-of-call-report') {
            const { call, transcript, summary, analysis } = payload.message || {};
            const structuredData = analysis?.structuredData || {};
            
            console.log(`[VAPI] Reporte final recibido. DNI Extracción: ${structuredData.dni}`);

            const feedback = (structuredData.dni || structuredData.matricula) ? 'positive' : 'neutral';

            // REGISTRO PARA EL DASHBOARD GLOBAL (Colección 'metrics')
            await db.collection('metrics').add({
                timestamp: new Date().toISOString(),
                channel: 'voice',
                userId: call?.customer?.number || 'Oculto',
                userName: `Voz: ${call?.customer?.number || 'Anónimo'}`,
                dni: structuredData.dni || 'No facilitado',
                plate: structuredData.matricula || 'No detectada',
                userMessage: transcript || summary || '(Sin transcripción)',
                botResponse: summary || '(Resumen de voz no generado)',
                feedback: feedback,
                callDuration: call?.duration || 0,
                status: call?.status || 'completed',
                automation: true,
                urgency: structuredData.urgencia || structuredData.urgency || 'Media/Alta', // Soporte para ambos idiomas
                photos: []
            });
        }

        res.json({ success: true });
    } catch (error) {
        console.error("❌ Error en Vapi Webhook:", error.message);
        // Respondemos con 200 para evitar que Vapi reintente infinitamente si es error lógico
        res.status(200).json({ success: false, error: error.message });
    }
});
// Función para desplegar el asistente a VAPI de forma segura
exports.deployVapiAssistant = onRequest({
    cors: true,
    region: "us-central1",
    secrets: ["VAPI_API_KEY"],
    memory: "256MiB"
}, async (req, res) => {
    const { assistantConfig, tools } = req.body;
    const vapiSecret = process.env.VAPI_API_KEY;

    if (!vapiSecret) {
        return res.status(500).json({ error: "VAPI_API_KEY no configurada en Cloud Secrets." });
    }

    try {
        const fullPayload = {
            ...assistantConfig,
            model: {
                ...assistantConfig.model,
                tools: tools
            }
        };

        const response = await axios.post('https://api.vapi.ai/assistant', fullPayload, {
            headers: {
                'Authorization': `Bearer ${vapiSecret}`,
                'Content-Type': 'application/json'
            }
        });

        res.json({ 
            success: true, 
            assistantId: response.data.id,
            message: "Asistente desplegado correctamente en Vapi."
        });
    } catch (error) {
        console.error("❌ Error desplegando en Vapi:", error.response?.data || error.message);
        res.status(500).json({ success: false, error: error.response?.data || error.message });
    }
});
