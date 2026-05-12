const axios = require('axios');
const proxyUrl = 'https://us-central1-corporin-avis-chatbot.cloudfunctions.net/geminiProxy';

async function test(model) {
    console.log(`Testing model: ${model}`);
    try {
        const response = await axios.post(proxyUrl, {
            prompt: 'Hola, responde con "OK"',
            model: model
        }, { timeout: 30000 });
        console.log(`  Success: ${response.data.success}`);
        if (response.data.text) console.log(`  Text: ${response.data.text}`);
    } catch (error) {
        console.log(`  Error: ${error.response ? JSON.stringify(error.response.data.error) : error.message}`);
    }
}

async function run() {
    await test('gemini-1.5-flash');
    await test('gemini-1.5-flash-latest');
    await test('gemini-1.5-pro');
    await test('gemini-1.0-pro');
    await test('gemini-2.0-flash-exp');
}
run();
