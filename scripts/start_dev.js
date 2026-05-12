require('dotenv').config({ path: '.env.dev' });
const { spawn } = require('child_process');
const path = require('path');

console.log('--- INICIANDO CORPORIN DEV (LOCAL) ---');
console.log('Usando configuración de .env.dev');

const bot = spawn('node', ['index.js'], {
    cwd: __dirname,
    stdio: 'inherit'
});

bot.on('close', (code) => {
    console.log(`Bot DEV cerrado con código ${code}`);
});
