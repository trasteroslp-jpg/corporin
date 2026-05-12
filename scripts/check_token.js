require('dotenv').config();
const axios = require('axios');

async function checkToken() {
    const token = process.env.TELEGRAM_BOT_TOKEN;
    try {
        const response = await axios.get(`https://api.telegram.org/bot${token}/getMe`);
        console.log('Bot info:', response.data);
        const webhook = await axios.get(`https://api.telegram.org/bot${token}/getWebhookInfo`);
        console.log('Webhook info:', webhook.data);
    } catch (e) {
        console.error('Error checking token:', e.response ? e.response.data : e.message);
    }
}

checkToken();
