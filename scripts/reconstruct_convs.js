const readXlsxFile = require('read-excel-file/node');
const path = require('path');
const filePath = path.join('Avis', 'Conversaciones 2026.xlsx');

readXlsxFile(filePath).then((rows) => {
    const headers = rows[0];
    console.log('HEADERS:', headers);
    // Find column indices
    const originIdx = headers.indexOf('Origen Mensaje');
    const msgIdx = headers.indexOf('Mensaje');
    
    // Group by conversation (phone) to find User -> Bot pairs
    const conversations = {};
    rows.slice(1).forEach(row => {
        const phone = row[0];
        if (!conversations[phone]) conversations[phone] = [];
        conversations[phone].push({ origin: row[originIdx], text: row[msgIdx] });
    });

    console.log('CONV SAMPLES (First phone):');
    const firstPhone = Object.keys(conversations)[0];
    console.log(conversations[firstPhone].slice(0, 4));

}).catch(err => console.error(err));
