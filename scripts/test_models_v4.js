const axios = require('axios');
require('dotenv').config();
const fs = require('fs');

const proxyUrl = process.env.GEMINI_PROXY_URL;
const models = [
    'gemini-2.0-flash',
    'gemini-2.0-flash-lite',
    'gemini-1.5-flash',
    'gemini-1.5-pro',
    'gemini-pro',
];

const results = [];

async function testModel(model) {
    try {
        const resp = await axios.post(proxyUrl, { prompt: 'Di solo OK', model }, { timeout: 20000 });
        if (resp.data && resp.data.success) {
            results.push(`OK: ${model}`);
            return true;
        } else {
            results.push(`FAIL: ${model} - ${resp.data.error || 'unknown'}`);
            return false;
        }
    } catch (e) {
        const msg = e.response?.data?.error || e.message;
        results.push(`FAIL: ${model} - ${typeof msg === 'string' ? msg.substring(0, 100) : JSON.stringify(msg).substring(0, 100)}`);
        return false;
    }
}

(async () => {
    for (const m of models) {
        await testModel(m);
    }
    fs.writeFileSync('model_results.txt', results.join('\n'), 'utf8');
    console.log('DONE - results written to model_results.txt');
})();
