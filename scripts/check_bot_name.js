const { Telegraf } = require('telegraf');
require('dotenv').config();
const bot = new Telegraf(process.env.TELEGRAM_BOT_TOKEN);
bot.telegram.getMe().then(me => {
    console.log('Bot logged in as:', me.username);
    process.exit(0);
}).catch(err => {
    console.error('Failed to log in:', err.message);
    process.exit(1);
});
