const { Telegraf } = require('telegraf');
require('dotenv').config();
const bot = new Telegraf(process.env.TELEGRAM_BOT_TOKEN);
bot.start((ctx) => ctx.reply('Bot minimal activo'));
bot.on('message', (ctx) => ctx.reply('Recibido: ' + ctx.message.text));
console.log('Lanzando bot minimal...');
bot.launch({ dropPendingUpdates: true }).then(() => {
    console.log('Bot minimal listos');
}).catch(console.error);
