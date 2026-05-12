// Configuración Firebase (Revisada)
const firebaseConfig = {
  "projectId": "corporin-avis-chatbot",
  "appId": "1:1075833947594:web:fb804bb0d2a60b322a7b33",
  "storageBucket": "corporin-avis-chatbot.firebasestorage.app",
  "apiKey": "AIzaSyCSxnXLrYVXvgqpkTCnNjDDVC103kx1VFA",
  "authDomain": "corporin-avis-chatbot.firebaseapp.com",
  "messagingSenderId": "1075833947594",
  "projectNumber": "1075833947594"
};

// Inicialización
if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
}

const db = firebase.firestore();
const auth = firebase.auth();

let allLogs = [];
let filteredLogs = [];
let interactionsList = []; // Para manejar el modal de forma segura
let charts = {};
let activeFilters = { urgency: null, date: null };

// Monitorizar estado de autenticación
auth.onAuthStateChanged((user) => {
    const loginScreen = document.getElementById('login-screen');
    const sidebar = document.getElementById('sidebar');
    const dashSection = document.getElementById('dashboard-section');
    const loadingScreen = document.getElementById('loading-screen');

    if (user) {
        console.log("Usuario autenticado:", user.email);
        loginScreen.style.display = 'none';
        loadingScreen.style.display = 'flex';
        
        // Mostrar estructura básica de inmediato
        sidebar.style.display = 'flex';
        dashSection.style.display = 'block';
        
        document.getElementById('user-display').innerText = user.email.split('@')[0];
        
        fetchData().finally(() => {
            loadingScreen.style.display = 'none';
        });

        // Refresco automático cada minuto
        if (window.refreshInterval) clearInterval(window.refreshInterval);
        window.refreshInterval = setInterval(fetchData, 60000);
    } else {
        console.log("No hay usuario. Mostrando Login.");
        loginScreen.style.display = 'flex';
        sidebar.style.display = 'none';
        dashSection.style.display = 'none';
        document.getElementById('conversations-section').style.display = 'none';
        loadingScreen.style.display = 'none';
    }
});

async function checkAuth() {
    const email = document.getElementById('email-input').value;
    const password = document.getElementById('pass-input').value;
    const errorMsg = document.getElementById('error-msg');

    if (!email || !password) return;

    try {
        await auth.signInWithEmailAndPassword(email, password);
        errorMsg.style.display = 'none';
    } catch (error) {
        errorMsg.style.display = 'block';
        console.error("Login Error:", error.message);
        alert("Error de acceso: " + error.message);
    }
}

async function fetchData() {
    try {
        console.log("Solicitando datos a Firestore...");
        const querySnapshot = await db.collection('metrics').limit(500).get();
        
        const rawLogs = [];
        querySnapshot.forEach(doc => {
            const data = doc.data();
            rawLogs.push(data);
        });

        // Agrupar feedback con sus mensajes originales
        const messageMap = new Map();
        const feedbackItems = [];

        rawLogs.forEach(log => {
            if (log.ref) {
                feedbackItems.push(log);
            } else if (log.timestamp && (log.userMessage || log.botResponse)) {
                messageMap.set(log.timestamp, { ...log });
            }
        });

        feedbackItems.forEach(fb => {
            const original = messageMap.get(fb.ref);
            if (original) {
                original.feedback = fb.feedback || (fb.userId ? 'positive' : 'neutral');
            }
        });

        allLogs = Array.from(messageMap.values());
        allLogs.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
        
        console.log(`Sincronización completada: ${allLogs.length} registros hallados.`);
        
        applyGlobalFilters();

    } catch (e) {
        console.error("Error en fetchData:", e);
        document.getElementById('stat-automation').innerText = "ERROR";
        document.getElementById('stat-automation').style.color = "red";
    }
}

function updateDashboard(data) {
    if (!data.length) return;

    const totalInteractions = data.length;
    const automatedCount = data.filter(d => d.automation).length;
    const automationRate = ((automatedCount / (totalInteractions || 1)) * 100).toFixed(1);
    
    let totalPromptTokens = 0;
    let totalCandidateTokens = 0;
    
    data.forEach(d => {
        try {
            if (d && d.tokens) {
                totalPromptTokens += Number(d.tokens.promptTokenCount || 0);
                totalCandidateTokens += Number(d.tokens.candidatesTokenCount || 0);
            }
        } catch (e) {}
    });

    const totalTokens = totalPromptTokens + totalCandidateTokens;
    const aiCost = (totalPromptTokens / 1000000 * 0.075) + (totalCandidateTokens / 1000000 * 0.30);
    
    const vapiLogs = data.filter(d => d.channel === 'voice' || d.channel === 'voice_active');
    const totalMinutes = vapiLogs.reduce((acc, curr) => acc + ((curr.callDuration || 0) / 60), 0);
    const vapiCost = totalMinutes * 0.10;

    const serverCost = 7.11; 
    const totalEstimated = aiCost + serverCost + vapiCost;

    const uniqueUsers = new Set(data.map(d => d.dni || d.userName).filter(u => u)).size;

    const safeSetText = (id, text) => {
        const el = document.getElementById(id);
        if (el) el.innerText = text;
    };

    safeSetText('stat-automation', `${automationRate}%`);
    safeSetText('stat-fcr', `${(automationRate * 0.85).toFixed(1)}%`);
    safeSetText('stat-tokens', totalTokens.toLocaleString());
    safeSetText('stat-cost-ai', `$${aiCost.toFixed(3)}`);
    safeSetText('stat-cost-vapi', `$${vapiCost.toFixed(2)}`);
    safeSetText('stat-cost-gcp', `$${serverCost.toFixed(2)}`);
    safeSetText('stat-cost-total', `$${totalEstimated.toFixed(2)}`);
    safeSetText('stat-users', uniqueUsers.toLocaleString());
    safeSetText('stat-total', totalInteractions.toLocaleString());

    const logsByDate = data.reduce((acc, log) => {
        if (!log.timestamp) return acc;
        try {
            const date = log.timestamp.split('T')[0];
            acc[date] = (acc[date] || 0) + 1;
        } catch (e) {}
        return acc;
    }, {});

    const labels = Object.keys(logsByDate).sort().slice(-7);
    const values = labels.map(l => logsByDate[l]);

    renderMainChart(labels, values);
    renderDistChart(data);
}

function syncFilters(type, value) {
    if (type === 'from') {
        document.getElementById('global-date-from').value = value;
        document.getElementById('global-date-from-conv').value = value;
    } else {
        document.getElementById('global-date-to').value = value;
        document.getElementById('global-date-to-conv').value = value;
    }
    applyGlobalFilters();
}

function applyGlobalFilters() {
    const from = document.getElementById('global-date-from').value;
    const to = document.getElementById('global-date-to').value;
    
    const dni = (document.getElementById('filter-dni')?.value || "").toUpperCase();
    const plate = (document.getElementById('filter-plate')?.value || "").toUpperCase();
    const urgency = document.getElementById('filter-urgency')?.value;

    filteredLogs = allLogs.filter(log => {
        if (!log.timestamp) return false;
        const date = log.timestamp.split('T')[0];
        
        const matchesFrom = !from || date >= from;
        const matchesTo = !to || date <= to;
        const matchesDni = !dni || (log.dni?.toUpperCase().includes(dni) || log.userName?.toUpperCase().includes(dni));
        const matchesPlate = !plate || log.plate?.toUpperCase().includes(plate);
        const matchesUrgency = !urgency || log.urgency === urgency;
        const matchesDynamic = !activeFilters.urgency || log.urgency === activeFilters.urgency;

        return matchesFrom && matchesTo && matchesDni && matchesPlate && matchesUrgency && matchesDynamic;
    });
    
    updateDashboard(filteredLogs);
    renderLogTable(filteredLogs);
}

function clearGlobalFilters() {
    document.getElementById('global-date-from').value = '';
    document.getElementById('global-date-to').value = '';
    document.getElementById('global-date-from-conv').value = '';
    document.getElementById('global-date-to-conv').value = '';
    if (document.getElementById('filter-dni')) document.getElementById('filter-dni').value = '';
    if (document.getElementById('filter-plate')) document.getElementById('filter-plate').value = '';
    if (document.getElementById('filter-urgency')) document.getElementById('filter-urgency').value = '';
    activeFilters.urgency = null; 
    applyGlobalFilters();
}

function applyDynamicFilter(type, value) {
    if (activeFilters[type] === value) {
        activeFilters[type] = null;
    } else {
        activeFilters[type] = value;
    }
    applyGlobalFilters();
}

function renderMainChart(labels, values) {
    const ctx = document.getElementById('mainChart').getContext('2d');
    if (charts.main) charts.main.destroy();
    
    charts.main = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: 'Interacciones',
                data: values,
                borderColor: '#7b2ff7',
                backgroundColor: 'rgba(123, 47, 247, 0.1)',
                borderWidth: 3,
                tension: 0.4,
                pointRadius: 4,
                fill: true
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { display: false } },
            scales: {
                y: { grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: '#94a3b8' } },
                x: { grid: { display: false }, ticks: { color: '#94a3b8' } }
            }
        }
    });
}

function renderDistChart(data) {
    const urgencies = { 'Baja': 0, 'Media/Alta': 0, 'Crítica': 0 };
    data.forEach(d => {
        if (d.urgency) urgencies[d.urgency] = (urgencies[d.urgency] || 0) + 1;
    });

    const ctx = document.getElementById('distChart').getContext('2d');
    if (charts.dist) charts.dist.destroy();

    charts.dist = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: Object.keys(urgencies),
            datasets: [{
                data: Object.values(urgencies),
                backgroundColor: ['#10b981', '#fbbf24', '#ef4444'],
                borderWidth: 0
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            layout: { padding: 20 },
            plugins: {
                legend: { 
                    position: 'bottom',
                    labels: { color: '#94a3b8', boxWidth: 10, font: { size: 10 } } 
                }
            },
            cutout: '70%',
            onClick: (evt, elements) => {
                if (elements.length > 0) {
                    const index = elements[0].index;
                    applyDynamicFilter('urgency', Object.keys(urgencies)[index]);
                }
            }
        }
    });
}

function renderLogTable(data) {
    const tableBody = document.getElementById('logs-table-body');
    tableBody.innerHTML = '';

    // Filtrar para mostrar solo registros que son mensajes (no feedback puro)
    interactionsList = data.filter(log => {
        const hasContent = log.userMessage || log.botResponse;
        const isNotPlaceholder = log.userMessage !== "--" && log.userMessage !== "...";
        return hasContent && isNotPlaceholder;
    });

    if (interactionsList.length === 0) {
        tableBody.innerHTML = '<tr><td colspan="8" style="text-align:center; padding:40px; color:var(--text-dim)">No hay conversaciones registradas.</td></tr>';
        return;
    }

    interactionsList.forEach((log, index) => {
        const tr = document.createElement('tr');
        
        let formattedDate = '---';
        try {
            const dateObj = new Date(log.timestamp);
            if (!isNaN(dateObj.getTime())) {
                formattedDate = dateObj.toLocaleDateString() + ' ' + dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            }
        } catch(e) {}
        
        const hasPhotos = log.photos && log.photos.length > 0;
        const photoBadge = hasPhotos ? ` <i class="fas fa-camera" style="color:var(--accent)" title="Contiene fotos"></i>` : '';

        let urgencyClass = 'tag-low';
        if (log.urgency === 'Crítica') urgencyClass = 'tag-critical';
        else if (log.urgency === 'Media/Alta') urgencyClass = 'tag-medium';

        let feedbackIcon = '<span style="opacity:0.3">⚪ (Neutro)</span>';
        if (log.feedback === 'positive') feedbackIcon = '<span style="color:#10b981">😊 (Resuelto)</span>';
        else if (log.feedback === 'negative') feedbackIcon = '<span style="color:#ef4444">🙁 (No preciso)</span>';

        tr.innerHTML = `
            <td>${formattedDate}${photoBadge}</td>
            <td><div style="font-weight:600">${log.userName || 'Usuario'}</div><div style="font-size:0.75rem; color:var(--text-dim)">${log.dni || '--'}</div></td>
            <td style="font-family:monospace">${log.plate || '--'}</td>
            <td title="${log.userMessage}">${log.userMessage ? log.userMessage.substring(0, 30) + (log.userMessage.length > 30 ? '...' : '') : '--'}</td>
            <td title="${log.botResponse}">${log.botResponse ? (log.botResponse.length > 30 ? log.botResponse.substring(0, 30) + '...' : log.botResponse) : '--'}</td>
            <td>${feedbackIcon}</td>
            <td><span class="tag ${urgencyClass}">${log.urgency || 'Normal'}</span></td>
            <td style="text-align:right">
                <button onclick="openDetails(${index})" style="background:rgba(123,47,247,0.15); border:1px solid var(--accent); color:var(--accent); cursor:pointer; padding:8px 12px; border-radius:8px; font-weight:600; font-size:0.8rem">
                    <i class="fas fa-eye"></i> Detalle
                </button>
            </td>
        `;
        tableBody.appendChild(tr);
    });
}

function openDetails(index) {
    const log = interactionsList[index];
    if (!log) return;

    document.getElementById('modal-user-info').innerText = `${log.userName || 'Usuario'} | DNI: ${log.dni || '--'} | Matrícula: ${log.plate || '--'}`;
    document.getElementById('modal-user-msg').innerText = log.userMessage || '--';
    document.getElementById('modal-bot-res').innerText = log.botResponse || '--';
    document.getElementById('modal-tokens').innerText = log.tokens ? (log.tokens.totalTokenCount || 0) : 0;
    document.getElementById('modal-urgency').innerText = log.urgency || 'Normal';
    
    const photoContainer = document.getElementById('modal-photos-container');
    const photosList = document.getElementById('modal-photos-list');
    photosList.innerHTML = '';
    
    if (log.photos && Array.isArray(log.photos) && log.photos.length > 0) {
        photoContainer.style.display = 'block';
        log.photos.forEach(url => {
            if (!url) return;
            const img = document.createElement('img');
            img.src = url;
            img.style.width = '120px';
            img.style.height = '120px';
            img.style.objectFit = 'cover';
            img.style.borderRadius = '12px';
            img.style.border = '2px solid var(--border)';
            img.style.cursor = 'pointer';
            img.style.transition = 'transform 0.2s';
            img.onmouseover = () => img.style.transform = 'scale(1.05)';
            img.onmouseout = () => img.style.transform = 'scale(1)';
            img.onclick = () => window.open(url, '_blank');
            img.title = "Ver imagen completa";
            photosList.appendChild(img);
        });
    } else {
        photoContainer.style.display = 'none';
    }
    
    document.getElementById('details-modal').style.display = 'flex';
}

function applyFilters() {
    applyGlobalFilters();
}
