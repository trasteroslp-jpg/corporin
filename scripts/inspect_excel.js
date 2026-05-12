const readXlsxFile = require('read-excel-file/node');
const path = require('path');

const filePath = path.join('Avis', 'Conversaciones 2026.xlsx');

readXlsxFile(filePath).then((rows) => {
    console.log('--- EXCEL STRUCTURE (First 5 rows) ---');
    rows.slice(0, 5).forEach((row, i) => {
        console.log(`Row ${i}:`, JSON.stringify(row));
    });
}).catch(err => {
    console.error('Error reading excel:', err);
});
