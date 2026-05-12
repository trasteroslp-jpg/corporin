const axios = require('axios');
const proxyUrl = 'https://us-central1-corporin-avis-chatbot.cloudfunctions.net/geminiProxy';

async function test(model) {
    console.log(`Testing model: ${model}`);
    try {
        const response = await axios.post(proxyUrl, {
            prompt: 'Hola',
            model: model
        }, { timeout: 15000 });
        console.log(`  RESULT: ${response.data.success ? 'SUCCESS' : 'FAILURE'}`);
        if (response.data.text) console.log(`  TEXT: ${response.data.text.substring(0, 30)}...`);
    } catch (error) {
        if (error.response) {
            console.log(`  ERROR: ${JSON.stringify(error.response.data)}`);
        } else {
            console.log(`  ERROR: ${error.message}`);
        }
    }
}

async function run() {
    const models = [
        'gemini-1.5-flash',
        'gemini-1.5-flash-latest',
        'gemini-1.5-pro',
        'gemini-pro',
        'gemini-1.0-pro'
    ];
    for (const m of models) {
        await test(m);
        console.log('---');
    }
}
run();
