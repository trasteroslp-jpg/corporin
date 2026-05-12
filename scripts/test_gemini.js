require('dotenv').config();
const { GoogleGenerativeAI } = require('@google/generative-ai');

async function listModels() {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    try {
        // The listModels method might not exist in this exact way in all versions, 
        // but we can try to see what's available or just test common ones.
        // Let's try to just call it with a common one and see if it works.
        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
        const result = await model.generateContent("test");
        console.log("Success with gemini-1.5-flash:", result.response.text());
    } catch (e) {
        console.error("Error with gemini-1.5-flash:", e.message);
    }
}

listModels();
