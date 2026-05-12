require('dotenv').config();
const { GoogleGenerativeAI } = require('@google/generative-ai');
const axios = require('axios');

async function listAllModels() {
    const apiKey = process.env.GEMINI_API_KEY;
    try {
        const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`;
        const response = await axios.get(url);
        console.log("Available models:", response.data.models.map(m => m.name));
    } catch (e) {
        console.error("Error listing models:", e.response ? e.response.data : e.message);
    }
}

listAllModels();
