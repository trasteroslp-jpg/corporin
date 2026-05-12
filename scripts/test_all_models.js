const axios = require('axios');
require('dotenv').config();
const fs = require('fs');

const proxyUrl = process.env.GEMINI_PROXY_URL;

const models = [
    'gemini-2.5-flash',
    'gemini-2.5-pro',
    'gemini-2.0-flash',
    'gemini-2.0-flash-lite',
    'gemini-1.5-flash',
    'gemini-1.5-pro',
    'gemini-pro',
];

async function test() {
    const results = [];
    for (const model of models) {
        try {
            const resp = await axios.post(proxyUrl, { 
                prompt: 'Di solo OK', model 
            }, { timeout: 25000 });
            
            if (resp.data?.success) {
                results.push({ model, status: 'OK', text: resp.data.text?.substring(0, 30) });
            } else {
                results.push({ model, status: 'FAIL', error: resp.data.error?.substring(0, 100) });
            }
        } catch (e) {
            const err = e.response?.data?.error || e.message;
            results.push({ model, status: 'FAIL', error: (typeof err === 'string' ? err : JSON.stringify(err)).substring(0, 100) });
        }
    }
    
    fs.writeFileSync('all_models_test.json', JSON.stringify(results, null, 2), 'utf8');
    console.log('Done - saved to all_models_test.json');
}

test();
