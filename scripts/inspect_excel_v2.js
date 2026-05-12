const readXlsxFile = require('read-excel-file/node');
const path = require('path');

const filePath = path.join('Avis', 'Conversaciones 2026.xlsx');

readXlsxFile(filePath).then((rows) => {
    console.log('Headers:', rows[0]);
    console.log('Sample Row 1:', rows[1]);
    console.log('Sample Row 2:', rows[2]);
}).catch(err => {
    console.error(err);
});
