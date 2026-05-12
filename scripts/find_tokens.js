const fs = require('fs');
const path = require('path');
const glob = require('glob'); // If not available, I'll use find

const searchEnv = (dir) => {
    const files = fs.readdirSync(dir, { withFileTypes: true });
    for (const file of files) {
        const res = path.resolve(dir, file.name);
        if (file.isDirectory() && !file.name.includes('node_modules')) {
            try { searchEnv(res); } catch(e) {}
        } else if (file.name.startsWith('.env')) {
            const content = fs.readFileSync(res, 'utf8');
            const match = content.match(/TELEGRAM_BOT_TOKEN=(.+)/);
            if (match) {
                console.log(`${res}: ${match[1]}`);
            }
        }
    }
};

try { searchEnv('C:\\Users\\David\\Desktop'); } catch(e) { console.error(e); }
