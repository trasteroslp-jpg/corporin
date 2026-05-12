require('dotenv').config();
const { GoogleGenerativeAI } = require('@google/generative-ai');

async function testModel(modelName) {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    try {
        console.log(`Testing ${modelName}...`);
        const model = genAI.getGenerativeModel({ model: modelName });
        const result = await model.generateContent("Keep this very short: Hello");
        console.log(`✅ Success with ${modelName}:`, result.response.text());
        return true;
    } catch (e) {
        console.error(`❌ Error with ${modelName}:`, e.message);
        return false;
    }
}

async function runTests() {
    const models = [
        "gemini-flash-latest",
        "gemini-2.0-flash",
        "gemini-2.0-flash-lite",
        "gemini-2.5-flash"
    ];
    for (const m of models) {
        await testModel(m);
    }
}

runTests();
