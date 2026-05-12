const axios = require('axios');
const proxyUrl = 'https://us-central1-corporin-avis-chatbot.cloudfunctions.net/geminiProxy';

async function test() {
    try {
        const response = await axios.post(proxyUrl, {
            prompt: 'Hola, responde con "OK"',
            model: 'gemini-1.5-flash'
        });
        console.log('Respuesta:', JSON.stringify(response.data, null, 2));
    } catch (error) {
        console.error('Error:', error.response ? JSON.stringify(error.response.data, null, 2) : error.message);
    }
}
test();
