const axios = require('axios');
require('dotenv').config();

const proxyUrl = process.env.GEMINI_PROXY_URL;
console.log('Proxy URL:', proxyUrl);

const models = [
    'gemini-2.0-flash',
    'gemini-2.0-flash-lite',
    'gemini-1.5-flash',
    'gemini-1.5-pro',
    'gemini-pro',
    'gemini-1.0-pro',
];

async function testModel(model) {
    try {
        const resp = await axios.post(proxyUrl, { prompt: 'Di solo "OK"', model }, { timeout: 20000 });
        if (resp.data && resp.data.success) {
            console.log(`✅ ${model} -> "${resp.data.text.substring(0, 40)}"`);
            return true;
        } else {
            console.log(`❌ ${model} -> ${JSON.stringify(resp.data).substring(0, 80)}`);
            return false;
        }
    } catch (e) {
        const msg = e.response?.data?.error || e.message;
        console.log(`❌ ${model} -> ${typeof msg === 'string' ? msg.substring(0, 80) : JSON.stringify(msg).substring(0, 80)}`);
        return false;
    }
}

(async () => {
    console.log('--- Probando modelos tras deploy ---');
    for (const m of models) {
        await testModel(m);
    }
    console.log('--- FIN ---');
})();
