const readXlsxFile = require('read-excel-file/node');
const path = require('path');

const filePath = path.join('Avis', 'Conversaciones 2026.xlsx');
const targetUserMsg = "Llevo llamando desde hace más de dos horas y nadie contesta";

readXlsxFile(filePath).then((rows) => {
    const headers = rows[0];
    const phoneIdx = headers.indexOf('Telefono cliente');
    const msgIdx = headers.indexOf('Mensaje');
    const originIdx = headers.indexOf('Origen Mensaje');
    
    // 1. Encontrar el teléfono del cliente que envió ese mensaje
    let targetPhone = null;
    for (let i = 1; i < rows.length; i++) {
        if (String(rows[i][msgIdx]).includes(targetUserMsg)) {
            targetPhone = rows[i][phoneIdx];
            break;
        }
    }

    if (!targetPhone) {
        console.log("No se encontró la conversación para:", targetUserMsg);
        return;
    }

    console.log(`--- CONVERSACIÓN COMPLETA PARA EL TELÉFONO: ${targetPhone} ---`);
    const fullConv = rows.filter(row => row[phoneIdx] === targetPhone);
    fullConv.forEach(row => {
        console.log(`[${row[originIdx]}] : ${row[msgIdx]}`);
    });

}).catch(err => console.error(err));
