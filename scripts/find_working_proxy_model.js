const axios = require('axios');
const proxyUrl = 'https://us-central1-corporin-avis-chatbot.cloudfunctions.net/geminiProxy';

async function test(model) {
    try {
        const response = await axios.post(proxyUrl, {
            prompt: 'Hola',
            model: model
        }, { timeout: 15000 });
        if (response.data.success) {
            console.log(`WORKING: ${model}`);
            return true;
        }
    } catch (error) {}
    return false;
}

async function run() {
    console.log('Searching for working model...');
    const models = [
        'gemini-1.5-flash',
        'gemini-1.5-flash-latest',
        'gemini-1.5-pro',
        'gemini-1.5-pro-latest',
        'gemini-1.0-pro',
        'gemini-pro',
        'gemini-2.0-flash-exp'
    ];
    for (const m of models) {
        if (await test(m)) {
            // continue searching to see if multiple work
        } else {
            console.log(`FAILED: ${m}`);
        }
    }
    console.log('Done.');
}
run();
