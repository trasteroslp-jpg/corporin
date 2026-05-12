const { Telegraf } = require('telegraf');
const fs = require('fs');
const dotenv = require('dotenv');

dotenv.config();

const token = process.env.TELEGRAM_BOT_TOKEN;
const photoPath = process.argv[2];

if (!token || !photoPath) {
    console.error('Uso: node set_bot_photo.js <ruta_imagen>');
    process.exit(1);
}

const bot = new Telegraf(token);

async function setPhoto() {
    try {
        console.log(`Intentando subir imagen: ${photoPath}`);
        // Telegram API method: setChatPhoto (para canales/grupos) or just use BotFather if it's a bot profile
        // Para bots, generalmente se usa BotFather, pero hay un secreto: 
        // El bot no puede cambiarse a sí mismo la foto de perfil vía API de forma estándar (setChatPhoto es para chats).
        // Sin embargo, podemos intentar llamar a la API cruda si existiera setBotPhoto.
        // En realidad, la API de Telegram NO permite a un bot cambiarse su propia foto de perfil.
        // Se debe hacer a través de @BotFather manualmente.
        
        console.log('⚠️ Aviso: La API de Telegram no permite que un bot cambie su propia foto de perfil.');
        console.log('Debes enviarle el logo a @BotFather y usar el comando /setuserpic.');
        
        process.exit(0);
    } catch (error) {
        console.error('Error:', error.message);
        process.exit(1);
    }
}

setPhoto();
