require('dotenv').config();
const { Telegraf } = require('telegraf');
const bot = new Telegraf(process.env.TELEGRAM_BOT_TOKEN);

async function clean() {
    try {
        console.log('Eliminando webhook anterior...');
        await bot.telegram.deleteWebhook({ drop_pending_updates: true });
        console.log('Webhook eliminado.');
        process.exit(0);
    } catch (e) {
        console.error('Error eliminando webhook:', e);
        process.exit(1);
    }
}

clean();
