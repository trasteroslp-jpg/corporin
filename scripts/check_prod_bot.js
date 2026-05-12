const axios = require('axios');
const token = process.env.TELEGRAM_BOT_TOKEN || 'TU_TOKEN_AQUÍ';

async function checkProdBot() {
    try {
        const resp = await axios.get(`https://api.telegram.org/bot${token}/getUpdates`);
        console.log('--- Updates ---');
        console.log(JSON.stringify(resp.data, null, 2));
    } catch (e) {
        console.error(e.message);
    }
}

checkProdBot();
