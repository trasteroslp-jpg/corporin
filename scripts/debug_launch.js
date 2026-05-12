
const { Telegraf } = require('telegraf');
require('dotenv').config();
const axios = require('axios');

async function debug() {
    console.log('--- STARTING SYNC DEBUG BOT ---');
    const token = process.env.TELEGRAM_BOT_TOKEN;
    
    try {
        console.log('Testing raw axios request to Telegram...');
        const res = await axios.get(`https://api.telegram.org/bot${token}/getMe`);
        console.log('Raw API Success:', res.data.result.username);
    } catch (e) {
        console.error('Raw API Error:', e.message);
    }

    const bot = new Telegraf(token);

    bot.on('text', (ctx) => {
        console.log('Got message:', ctx.message.text);
        ctx.reply('Echo');
    });

    console.log('Calling bot.launch()...');
    try {
        await bot.launch();
        console.log('--- BOT LAUNCHED SUCCESSFULLY (RESOLVED) ---');
    } catch (err) {
        console.error('--- BOT LAUNCH ERROR ---');
        console.error(err);
    }
}

debug();

setTimeout(() => {
    console.log('Exit after 10s');
    process.exit(0);
}, 10000);
