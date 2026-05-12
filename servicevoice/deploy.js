const axios = require('axios');
const { assistantConfig, tools } = require('./config');

// URL de la nueva Cloud Function que gestiona la API Key de forma segura
const DEPLOY_URL = "https://us-central1-corporin-avis-chatbot.cloudfunctions.net/deployVapiAssistant";

async function secureDeploy() {
    try {
        console.log("🚀 Iniciando despliegue seguro a través de Google Cloud...");
        console.log("📡 Conectando con Cloud Function...");

        const response = await axios.post(DEPLOY_URL, {
            assistantConfig,
            tools
        });

        if (response.data.success) {
            console.log("\n✅ ¡ÉXITO TOTAL!");
            console.log("🆔 NUEVO ASSISTANT ID:", response.data.assistantId);
            console.log("\nPróximos pasos:");
            console.log("1. Copia este ID.");
            console.log("2. Ve al Dashboard de Vapi.");
            console.log("3. Enlaza este asistente con tu número gratuito.");
        }

    } catch (error) {
        console.error("\n❌ Error en el despliegue:");
        if (error.response?.status === 404) {
            console.error("La Cloud Function aún no parece estar activa. ¿Ya hiciste 'firebase deploy'?");
        } else {
            console.error(error.response?.data || error.message);
        }
    }
}

secureDeploy();
