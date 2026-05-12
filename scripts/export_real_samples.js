const readXlsxFile = require('read-excel-file/node');
const fs = require('fs');
const path = require('path');
const filePath = path.join('Avis', 'Conversaciones 2026.xlsx');

readXlsxFile(filePath).then((rows) => {
    const headers = rows[0];
    const originIdx = headers.indexOf('Origen Mensaje');
    const msgIdx = headers.indexOf('Mensaje');
    
    const interactions = [];
    for (let i = 1; i < rows.length - 1; i++) {
        const current = rows[i];
        const next = rows[i+1];
        if (current[originIdx] === 'Cliente' && next[originIdx] === 'Agente') {
            interactions.push({ 
                user: String(current[msgIdx] || ""), 
                oldBot: String(next[msgIdx] || "") 
            });
        }
    }

    const samples = [
        interactions.find(it => it.user.toLowerCase().includes('abrir')),
        interactions.find(it => it.user.toLowerCase().includes('factura')),
        interactions.find(it => it.user.toLowerCase().includes('horario')),
        interactions.find(it => it.user.toLowerCase().includes('avería'))
    ].filter(Boolean);

    fs.writeFileSync('real_excel_samples.json', JSON.stringify(samples, null, 2));
}).catch(err => console.error(err));
