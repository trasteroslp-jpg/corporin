const axios = require('axios');
require('dotenv').config();
const token = process.env.TELEGRAM_BOT_TOKEN;
axios.get(`https://api.telegram.org/bot${token}/getWebhookInfo`)
    .then(res => console.log(JSON.stringify(res.data, null, 2)))
    .catch(err => console.error(err.message));
