require('dotenv').config();
console.log('TELEGRAM_BOT_TOKEN:', process.env.TELEGRAM_BOT_TOKEN ? 'Present' : 'Missing');
console.log('GEMINI_PROXY_URL:', process.env.GEMINI_PROXY_URL ? 'Present' : 'Missing');
console.log('GEMINI_API_KEY:', process.env.GEMINI_API_KEY ? 'Present' : 'Missing');
console.log('All keys:', Object.keys(process.env).filter(k => k.includes('TOKEN') || k.includes('GEMINI')));
