require('dotenv').config();
const { Telegraf } = require('telegraf');

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const bot = new Telegraf(BOT_TOKEN);

bot.start((ctx) => ctx.reply('Test started'));
bot.on('text', (ctx) => {
    console.log('Message received:', ctx.message.text);
    ctx.reply('Echo: ' + ctx.message.text);
});

console.log('Launching test bot...');
bot.launch().then(() => {
    console.log('Test bot launched!');
}).catch(err => {
    console.error('Failed to launch test bot:', err);
});

process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));
