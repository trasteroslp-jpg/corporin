const readXlsxFile = require('read-excel-file/node');
const path = require('path');

const filePath = path.join('Avis', 'Conversaciones 2026.xlsx');
const targetUserMsg = "Llevo llamando desde hace más de dos horas y nadie contesta";

readXlsxFile(filePath).then((rows) => {
    const headers = rows[0];
    const phoneIdx = headers.indexOf('Telefono cliente');
    const msgIdx = headers.indexOf('Mensaje');
    const originIdx = headers.indexOf('Origen Mensaje');
    const dateIdx = headers.indexOf('Fecha');
    
    let targetPhone = null;
    for (let i = 1; i < rows.length; i++) {
        if (String(rows[i][msgIdx]).includes(targetUserMsg)) {
            targetPhone = rows[i][phoneIdx];
            break;
        }
    }

    if (!targetPhone) return;

    const fullConv = rows.filter(row => row[phoneIdx] === targetPhone);
    fullConv.forEach(row => {
        console.log(`[${row[dateIdx]}] [${row[originIdx]}] : ${row[msgIdx]}`);
    });

}).catch(err => console.error(err));
