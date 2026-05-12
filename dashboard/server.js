const express = require('express');
const fs = require('fs');
const path = require('path');
const app = express();
const PORT = 3000;

app.use(express.static(path.join(__dirname, 'public')));

// API para obtener métricas
app.get('/api/metrics', (ctx, res) => {
    const logPath = path.join(__dirname, '..', 'logs', 'metrics.jsonl');
    if (!fs.existsSync(logPath)) {
        return res.json([]);
    }
    
    const lines = fs.readFileSync(logPath, 'utf8').split('\n').filter(Boolean);
    const data = lines.map(JSON.parse);
    res.json(data);
});

app.listen(PORT, () => {
    console.log(`📊 Cuadro de Mandos AVIS iniciado en http://localhost:${PORT}`);
});
