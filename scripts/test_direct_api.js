const axios = require('axios');
const apiKey = process.env.GEMINI_API_KEY || 'TU_API_KEY_AQUÍ'; // Usar variable de entorno

async function testDirect() {
    const models = [
        'gemini-1.5-flash',
        'gemini-1.5-flash-8b',
        'gemini-2.0-flash',
        'gemini-2.0-flash-lite-preview-02-05',
        'gemini-pro'
    ];

    const apiVersions = ['v1beta', 'v1'];

    for (const model of models) {
        for (const ver of apiVersions) {
            try {
                const url = `https://generativelanguage.googleapis.com/${ver}/models/${model}:generateContent?key=${apiKey}`;
                const resp = await axios.post(url, {
                    contents: [{ role: 'user', parts: [{ text: 'Di OK' }] }]
                }, { timeout: 10000 });
                
                console.log(`✅ [${ver}] ${model}: SUCCESS -> "${resp.data.candidates?.[0]?.content?.parts?.[0]?.text?.trim()}"`);
            } catch (e) {
                const msg = e.response?.data?.error?.message || e.message;
                console.log(`❌ [${ver}] ${model}: FAIL -> ${msg.substring(0, 100)}`);
            }
        }
    }
}

testDirect();
