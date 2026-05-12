const readXlsxFile = require('read-excel-file/node');
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
        
        // If current is Cliente and next is Agente (same phone likely if chronological)
        if (current[originIdx] === 'Cliente' && next[originIdx] === 'Agente') {
            interactions.push({
                user: current[msgIdx],
                oldBot: next[msgIdx]
            });
        }
    }

    console.log('REAL INTERACTIONS FOUND:', interactions.length);
    
    // Pick some interesting ones based on keywords
    const samples = [
        interactions.find(it => it.user.toLowerCase().includes('abrir') || it.user.toLowerCase().includes('llave')),
        interactions.find(it => it.user.toLowerCase().includes('sucio') || it.user.toLowerCase().includes('daño')),
        interactions.find(it => it.user.toLowerCase().includes('donde') || it.user.toLowerCase().includes('oficina')),
        interactions.find(it => it.user.toLowerCase().includes('factura') || it.user.toLowerCase().includes('dni'))
    ].filter(Boolean);

    console.log('--- SELECTED REAL CASES ---');
    console.log(JSON.stringify(samples, null, 2));

}).catch(err => console.error(err));
