const axios = require('axios');
require('dotenv').config();
const fs = require('fs');

// Primero: listar modelos disponibles con la API key
const proxyUrl = process.env.GEMINI_PROXY_URL;

// Test directo contra la API (sin proxy) para diagnosticar
async function listModels() {
    // Obtener la GEMINI_KEY del proxy probando un request especial
    // En su lugar, probemos endpoints directamente
    const endpoints = [
        { version: 'v1', model: 'gemini-2.0-flash' },
        { version: 'v1beta', model: 'gemini-2.0-flash' },
        { version: 'v1', model: 'gemini-1.5-flash' },
        { version: 'v1beta', model: 'gemini-1.5-flash' },
        { version: 'v1', model: 'gemini-pro' },
        { version: 'v1beta', model: 'gemini-pro' },
        { version: 'v1beta', model: 'gemini-2.0-flash-lite' },
        { version: 'v1', model: 'gemini-2.5-flash' },
        { version: 'v1beta', model: 'gemini-2.5-flash' },
    ];

    const results = [];
    
    for (const ep of endpoints) {
        try {
            const resp = await axios.post(proxyUrl, { 
                prompt: 'Di solo OK', 
                model: ep.model,
                _apiVersion: ep.version  // El proxy no soporta esto aún, pero probamos el default
            }, { timeout: 20000 });
            
            if (resp.data && resp.data.success) {
                results.push(`OK [${ep.version}] ${ep.model} -> "${resp.data.text.substring(0, 30)}" (Used: ${resp.data.modelUsed})`);
            } else {
                results.push(`FAIL [${ep.version}] ${ep.model} - ${(resp.data.error || 'unknown').substring(0, 80)} (Last tried: ${resp.data.modelUsed})`);
            }
        } catch (e) {
            const msg = e.response?.data?.error || e.message;
            const errStr = typeof msg === 'string' ? msg.substring(0, 80) : JSON.stringify(msg).substring(0, 80);
            results.push(`FAIL [${ep.version}] ${ep.model} - ${errStr}`);
        }
    }
    
    fs.writeFileSync('endpoint_results.txt', results.join('\n'), 'utf8');
    console.log('Results:');
    results.forEach(r => console.log(r));
}

listModels();
