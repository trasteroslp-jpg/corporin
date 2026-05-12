console.log('START');
require('dotenv').config();
console.log('DOTENV OK');
const { Telegraf } = require('telegraf');
console.log('REQUIRE TELEGRAF OK');
const bot = new Telegraf(process.env.TELEGRAM_BOT_TOKEN);
console.log('BOT CREATED OK');
process.exit(0);
