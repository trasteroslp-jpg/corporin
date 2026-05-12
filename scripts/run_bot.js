
const { spawn } = require('child_process');
const path = require('path');

function startBot() {
    console.log(`[${new Date().toISOString()}] Starting bot...`);
    
    const bot = spawn('node', ['index.js'], {
        cwd: __dirname,
        stdio: 'inherit'
    });

    bot.on('close', (code) => {
        console.log(`[${new Date().toISOString()}] Bot process exited with code ${code}. Restarting in 5 seconds...`);
        setTimeout(startBot, 5000);
    });

    bot.on('error', (err) => {
        console.error(`[${new Date().toISOString()}] Failed to start bot process:`, err);
        setTimeout(startBot, 10000);
    });
}

startBot();
