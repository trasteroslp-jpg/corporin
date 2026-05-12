const { Telegraf } = require('telegraf');
require('dotenv').config();
const bot = new Telegraf(process.env.TELEGRAM_BOT_TOKEN);
const adminId = 2002544203;

bot.telegram.sendMessage(adminId, 'Prueba de conexión desde script de depuración').then(() => {
    console.log('Mensaje enviado correctamente');
    process.exit(0);
}).catch(err => {
    console.error('Error al enviar mensaje:', err);
    process.exit(1);
});
