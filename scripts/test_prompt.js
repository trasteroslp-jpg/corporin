require('dotenv').config();
const { GoogleGenerativeAI } = require('@google/generative-ai');
const fs = require('fs');

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-flash-latest" });

const SYSTEM_PROMPT = `Eres el Asistente Inteligente de AVIS Corporate...
${fs.readFileSync('extracted_knowledge.txt', 'utf8')}
`;

async function test() {
    console.log('Testing Gemini with full prompt...');
    try {
        const result = await model.generateContent(SYSTEM_PROMPT + '\nUsuario: Hola, ¿quién eres?\nAsistente:');
        const response = await result.response;
        console.log('Response:', response.text());
        console.log('Usage:', response.usageMetadata);
    } catch (e) {
        console.error('Error:', e);
    }
}

test();
