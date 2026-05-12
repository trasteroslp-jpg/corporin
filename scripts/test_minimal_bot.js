console.log('START');
require('dotenv').config();
console.log('DOTENV OK');
const admin = require('firebase-admin');
console.log('REQUIRE ADMIN OK');
const serviceAccount = require('./credentials.json.json');
console.log('REQUIRE CREDENTIALS OK');
admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
});
console.log('APP INITIALIZED OK');
const db = admin.firestore();
console.log('FIRESTORE OK');
const { Telegraf } = require('telegraf');
console.log('REQUIRE TELEGRAF OK');
const bot = new Telegraf(process.env.TELEGRAM_BOT_TOKEN);
console.log('BOT CREATED OK');
bot.launch().then(() => {
    console.log('BOT LAUNCHED OK');
    process.exit(0);
}).catch(err => {
    console.error('BOT LAUNCH FAIL:', err);
    process.exit(1);
});
