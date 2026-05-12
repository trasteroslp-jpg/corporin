const readXlsxFile = require('read-excel-file/node');
const fs = require('fs');
const path = require('path');

const filePath = 'c:\\Users\\David\\Desktop\\Corporin\\AVIS\\Conversaciones 2026.xlsx';
const outputPath = 'c:\\Users\\David\\Desktop\\Corporin\\temp_conversations_2026.txt';

async function extract() {
    try {
        const rows = await readXlsxFile(filePath);
        let content = '';
        rows.forEach((row, index) => {
            content += `Fila ${index + 1}: ${row.join(' | ')}\n`;
        });
        fs.writeFileSync(outputPath, content);
        console.log('Extracción completada en temp_conversations_2026.txt');
    } catch (error) {
        console.error('Error extrayendo:', error);
    }
}

extract();
