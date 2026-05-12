const fs = require('fs');
const path = require('path');

const BOT_TOKEN_REGEX = /[0-9]{8,10}:[a-zA-Z0-9_-]{35}/g;

const searchTokens = (dir) => {
    try {
        const files = fs.readdirSync(dir, { withFileTypes: true });
        for (const file of files) {
            const res = path.resolve(dir, file.name);
            if (file.isDirectory()) {
                if (!['node_modules', '.git', '.firebase', '.gemini'].includes(file.name)) {
                    searchTokens(res);
                }
            } else {
                const content = fs.readFileSync(res, 'utf8');
                let match;
                while ((match = BOT_TOKEN_REGEX.exec(content)) !== null) {
                    console.log(`Found token in ${res}: ${match[0]}`);
                }
            }
        }
    } catch (e) {}
};

console.log('Searching for bot tokens on Desktop...');
searchTokens('C:\\Users\\David\\Desktop');
