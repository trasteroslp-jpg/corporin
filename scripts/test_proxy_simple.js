const axios = require('axios');
require('dotenv').config();
const fs = require('fs');

const proxyUrl = process.env.GEMINI_PROXY_URL;

async function test() {
    try {
        console.log('Testing proxy at:', proxyUrl);
        const resp = await axios.post(proxyUrl, { 
            prompt: 'Di solo la palabra OK'
        }, { timeout: 30000 });
        
        fs.writeFileSync('proxy_response.json', JSON.stringify(resp.data, null, 2), 'utf8');
        console.log('SUCCESS - saved to proxy_response.json');
    } catch (e) {
        const result = {
            status: e.response?.status,
            data: e.response?.data,
            message: e.message
        };
        fs.writeFileSync('proxy_error.json', JSON.stringify(result, null, 2), 'utf8');
        console.log('ERROR - saved to proxy_error.json');
    }
}

test();
