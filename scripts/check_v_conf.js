const axios = require('axios');
require('dotenv').config();
async function check() {
    const assId = process.env.VAPI_ASSISTANT_ID;
    console.log('Checking assistant:', assId);
    try {
        const response = await axios.get(`https://api.vapi.ai/assistant/${assId}`, {
            headers: { 'Authorization': `Bearer ${process.env.VAPI_API_KEY}` }
        });
        console.log('Assistant Name:', response.data.name);
        console.log('Assistant Model Config:', JSON.stringify(response.data.model, null, 2));
    } catch (e) {
        console.error('Error fetching assistant:', e.response?.data || e.message);
    }
}
check();
