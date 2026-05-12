const mammoth = require("mammoth");
const readXlsxFile = require('read-excel-file/node');
const fs = require('fs');
const path = require('path');

async function extractKnowledge() {
    let knowledgeBase = "BASE DE CONOCIMIENTO AVIS CORPORATE\n\n";

    // 1. Leer Preguntas Frecuentes (.docx)
    try {
        const faqPath = path.join(__dirname, 'AVIS', 'Preguntas Frecuentes', 'Preguntas Frecuentes.docx');
        const result = await mammoth.extractRawText({path: faqPath});
        knowledgeBase += "=== PREGUNTAS FRECUENTES (FAQ) ===\n" + result.value + "\n\n";
    } catch (e) { console.error("Error FAQ:", e.message); }

    // 2. Leer Gestión Incidencias (.xlsx)
    try {
        const incPath = path.join(__dirname, 'AVIS', 'Configuración Incidencias', 'Geston Incidencias.xlsx');
        const rows = await readXlsxFile(incPath);
        knowledgeBase += "=== PROTOCOLO DE INCIDENCIAS ===\n" + rows.map(r => r.join(" | ")).join("\n") + "\n\n";
    } catch (e) { console.error("Error Incidencias:", e.message); }

    // 3. Leer No se puede abrir el coche (.xlsx)
    try {
        const openPath = path.join(__dirname, 'AVIS', 'Configuración Incidencias', 'Gestion No se puede abrir el coche.xlsx');
        const rows = await readXlsxFile(openPath);
        knowledgeBase += "=== GESTIÓN: NO SE PUEDE ABRIR EL COCHE ===\n" + rows.map(r => r.join(" | ")).join("\n") + "\n\n";
    } catch (e) { console.error("Error Abrir Coche:", e.message); }

    fs.writeFileSync('extracted_knowledge.txt', knowledgeBase);
    console.log("Conocimiento extraído correctamente en extracted_knowledge.txt");
}

extractKnowledge();
