const app = {
    currentSession: {},

    init() {
        this.renderPlayersList();
        this.updatePlayerSelects();
        this.navigate('setup');
    },

    navigate(viewId) {
        document.querySelectorAll('.view').forEach(v => v.classList.add('hidden'));
        document.getElementById('view-' + viewId).classList.remove('hidden');
        window.scrollTo(0, 0);

        if(viewId === 'history') {
            this.updatePlayerSelects();
            this.renderHistory();
        }
    },

    getColor(val) {
        if(val >= 80) return 'var(--green)';
        if(val >= 60) return 'var(--yellow)';
        if(val >= 40) return 'var(--orange)';
        return 'var(--red)';
    },

    getDiffColor(diff) {
        if(diff >= 5) return 'var(--green)';
        if(diff > -5) return 'var(--yellow)';
        return 'var(--red)';
    },

    // --- GESTIÓN DE JUGADORES ---
    savePlayer() {
        const name = document.getElementById('newPlayerName').value.trim();
        const age = document.getElementById('newPlayerAge').value;
        const gender = document.getElementById('newPlayerGender').value;

        if(!name || !age) return alert('Por favor ingresá Nombre y Edad.');

        storage.savePlayer({ id: Date.now(), name, age, gender });
        document.getElementById('newPlayerName').value = '';
        document.getElementById('newPlayerAge').value = '';

        this.renderPlayersList();
        this.updatePlayerSelects();
        alert('Jugador registrado con éxito.');
    },

    deletePlayer(id) {
        if(confirm('¿Seguro que querés eliminar a este jugador/a?')) {
            storage.deletePlayer(id);
            this.renderPlayersList();
            this.updatePlayerSelects();
        }
    },

    renderPlayersList() {
        const players = storage.getPlayers();
        const container = document.getElementById('playersList');
        if(players.length === 0) {
            container.innerHTML = '<p class="muted">No hay jugadores registrados.</p>';
            return;
        }

        container.innerHTML = players.map(p => `
            <div class="player-item">
                <div>
                    <strong>${p.name}</strong> 
                    <span class="muted">(${p.age} años, ${p.gender})</span>
                </div>
                <button class="btn-danger" onclick="app.deletePlayer(${p.id})">Eliminar</button>
            </div>
        `).join('');
    },

    updatePlayerSelects() {
        const players = storage.getPlayers();
        const options = '<option value="">-- Eventual / Nuevo --</option>' + 
            players.map(p => `<option value="${p.id}">${p.name}</option>`).join('');
        
        document.getElementById('selectPlayer').innerHTML = options;
        
        // Filtro del historial
        const sessions = storage.getSessions();
        const uniqueNames = [...new Set(sessions.map(s => s.name))];
        document.getElementById('filterPlayer').innerHTML = '<option value="ALL">Todos los jugadores</option>' +
            uniqueNames.map(n => `<option value="${n}">${n}</option>`).join('');
    },

    onSelectPlayerChange(val) {
        const quickForm = document.getElementById('quickPlayerForm');
        if(val === '') {
            quickForm.classList.remove('hidden');
        } else {
            quickForm.classList.add('hidden');
        }
    },

    // --- FLUJO DE EVALUACIÓN ---
    startPreEval() {
        const selectedId = document.getElementById('selectPlayer').value;
        let name, age, gender;

        if(selectedId) {
            const player = storage.getPlayers().find(p => p.id == selectedId);
            name = player.name;
            age = player.age;
            gender = player.gender;
        } else {
            name = document.getElementById('playerName').value.trim();
            age = document.getElementById('playerAge').value;
            gender = document.getElementById('playerGender').value;
            if(!name || !age) return alert('Por favor ingresá Nombre y Edad.');
        }

        this.currentSession = {
            id: Date.now(),
            name, age, gender,
            date: new Date().toLocaleDateString('es-AR'),
            time: new Date().toLocaleTimeString('es-AR', {hour: '2-digit', minute:'2-digit'}),
            pre: {}, post: {}, metrics: {}
        };

        this.navigate('pre');
    },

    calculatePreSummary() {
        const p = this.currentSession.pre;
        p.conc = parseInt(document.getElementById('pre-conc').value);
        p.mot = parseInt(document.getElementById('pre-mot').value);
        p.conf = parseInt(document.getElementById('pre-conf').value);
        p.ctrl = parseInt(document.getElementById('pre-ctrl').value);
        
        p.ener = parseInt(document.getElementById('pre-ener').value);
        p.fat = parseInt(document.getElementById('pre-fat').value);
        p.dol = parseInt(document.getElementById('pre-dol').value);
        p.rec = parseInt(document.getElementById('pre-rec').value);

        this.currentSession.metrics.prom_psi = (p.conc + p.mot + p.conf + p.ctrl) / 4;
        this.currentSession.metrics.prom_fis = (p.ener + (100 - p.fat) + (100 - p.dol) + p.rec) / 4;
        this.currentSession.metrics.index_pre = (this.currentSession.metrics.prom_psi * 0.5) + (this.currentSession.metrics.prom_fis * 0.5);

        const setSummaryBar = (idBase, val) => {
            const el = document.getElementById(`summary-${idBase}`);
            const bar = document.getElementById(`bar-summary-${idBase.split('-')[1]}`);
            el.innerText = `${val.toFixed(1)}%`;
            el.style.color = this.getColor(val);
            bar.style.width = `${val}%`;
            bar.style.backgroundColor = this.getColor(val);
        };

        setSummaryBar('pre-psi', this.currentSession.metrics.prom_psi);
        setSummaryBar('pre-fis', this.currentSession.metrics.prom_fis);
        setSummaryBar('pre-gral', this.currentSession.metrics.index_pre);

        this.navigate('pre-summary');
    },

    startTraining() {
        this.navigate('training');
    },

    startPostEval() {
        this.navigate('post');
    },

    calculateResults() {
        const pt = this.currentSession.post;
        pt.conc = parseInt(document.getElementById('post-conc').value);
        pt.mot = parseInt(document.getElementById('post-mot').value);
        pt.conf = parseInt(document.getElementById('post-conf').value);
        pt.ctrl = parseInt(document.getElementById('post-ctrl').value);
        pt.rpe = parseInt(document.getElementById('post-rpe').value);

        const m = this.currentSession.metrics;
        const p = this.currentSession.pre;

        m.prom_psi_post = (pt.conc + pt.mot + pt.conf + pt.ctrl) / 4;
        m.diff_conc = pt.conc - p.conc;
        m.diff_mot = pt.mot - p.mot;
        m.diff_conf = pt.conf - p.conf;
        m.diff_ctrl = pt.ctrl - p.ctrl;
        m.diff_total = m.prom_psi_post - m.prom_psi; 
        
        storage.saveSession(this.currentSession);
        this.renderDashboard();
        this.navigate('results');
    },

    formatDiff(val) {
        if(val > 0) return `+${val}% ⬆`;
        if(val < 0) return `${val}% ⬇`;
        return `0% ➡`;
    },

    renderDashboard() {
        const s = this.currentSession;
        const m = s.metrics;

        document.getElementById('res-date').innerText = `${s.date} ${s.time}`;
        document.getElementById('res-name').innerText = s.name;
        document.getElementById('res-age').innerText = s.age;
        document.getElementById('res-gender').innerText = s.gender;

        const setBar = (idBase, val) => {
            const el = document.getElementById(`res-${idBase}`);
            const bar = document.getElementById(`bar-${idBase}`);
            el.innerText = `${val.toFixed(1)}%`;
            el.style.color = this.getColor(val);
            bar.style.width = `${val}%`;
            bar.style.backgroundColor = this.getColor(val);
        };

        setBar('pre-psi', m.prom_psi);
        setBar('pre-fis', m.prom_fis);
        setBar('pre-gral', m.index_pre);
        setBar('post-psi', m.prom_psi_post);

        const setDiff = (id, val) => {
            const el = document.getElementById(id);
            el.innerText = this.formatDiff(val);
            el.style.color = this.getDiffColor(val);
        };

        setDiff('res-diff-conc', m.diff_conc);
        setDiff('res-diff-mot', m.diff_mot);
        setDiff('res-diff-conf', m.diff_conf);
        setDiff('res-diff-ctrl', m.diff_ctrl);

        const diffTotalEl = document.getElementById('res-diff-total');
        const diffTextEl = document.getElementById('res-diff-text');
        diffTotalEl.innerText = this.formatDiff(m.diff_total.toFixed(1));
        
        let interpretText = "";
        if(m.diff_total > 10) interpretText = "Excelente respuesta psicológica.";
        else if(m.diff_total >= 5) interpretText = "Mejoró el estado psicológico.";
        else if(m.diff_total > -5) interpretText = "Estado estable.";
        else if(m.diff_total >= -10) interpretText = "Disminución moderada.";
        else interpretText = "Impacto psicológico negativo.";

        diffTotalEl.style.color = this.getDiffColor(m.diff_total);
        diffTextEl.innerText = interpretText;
        diffTextEl.style.color = this.getDiffColor(m.diff_total);

        document.getElementById('res-rpe').innerText = `${s.post.rpe}/10`;

        document.getElementById('dt-ppi').innerText = `${m.prom_psi.toFixed(1)}%`;
        document.getElementById('dt-rpf').innerText = `${m.prom_psi_post.toFixed(1)}%`;
        document.getElementById('dt-val').innerText = this.formatDiff(m.diff_total.toFixed(1));
        
        const dtBox = document.getElementById('dt-container');
        const dtMsg = document.getElementById('dt-message');
        dtBox.className = 'dt-box';
        
        if(m.diff_total >= 5) {
            dtBox.classList.add('green');
            dtMsg.innerText = "🌟 Efecto del entrenamiento mejor de lo esperado.";
            dtMsg.style.color = 'var(--green)';
        } else if(m.diff_total > -5) {
            dtBox.classList.add('yellow');
            dtMsg.innerText = "✅ Resultado acorde a lo esperado.";
            dtMsg.style.color = 'var(--yellow)';
        } else {
            dtBox.classList.add('red');
            dtMsg.innerText = "⚠️ Efecto inferior al esperado.";
            dtMsg.style.color = 'var(--red)';
        }
    },

    // --- HISTORIAL Y BORRADO DE SESIONES ---
    deleteSession(sessionId) {
        if(confirm('¿Seguro que querés eliminar este registro de entrenamiento?')) {
            storage.deleteSession(sessionId);
            this.renderHistory();
        }
    },

    renderHistory() {
        const filter = document.getElementById('filterPlayer').value;
        let sessions = storage.getSessions();
        
        if(filter !== 'ALL') {
            sessions = sessions.filter(s => s.name === filter);
        }

        const tbody = document.querySelector('#historyTable tbody');
        tbody.innerHTML = '';
        
        document.getElementById('charts-container').classList.toggle('hidden', sessions.length === 0);

        [...sessions].reverse().forEach(s => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${s.date} ${s.time}</td>
                <td>${s.name}</td>
                <td><span style="color:${this.getColor(s.metrics.index_pre)}">${s.metrics.index_pre.toFixed(1)}%</span></td>
                <td>${s.metrics.prom_psi.toFixed(1)}%</td>
                <td>${s.metrics.prom_psi_post.toFixed(1)}%</td>
                <td><strong style="color:${this.getDiffColor(s.metrics.diff_total)}">${this.formatDiff(s.metrics.diff_total.toFixed(1))}</strong></td>
                <td><button class="btn-danger" onclick="app.deleteSession(${s.id})">Borrar</button></td>
            `;
            tbody.appendChild(tr);
        });

        // Llamada al módulo externo de gráficos
        if(sessions.length > 0) {
            trackerCharts.renderAll(sessions);
        }
    },

    exportCSV() {
        const sessions = storage.getSessions();
        if(sessions.length === 0) return alert('No hay datos para exportar.');
        
        let csv = 'Fecha,Hora,Nombre,Edad,Genero,Indice General PRE,Psicologico PRE,Fisico PRE,Psicologico POST,Cambio Psicologico Total (DT),RPE\n';
        
        sessions.forEach(s => {
            const row = [
                s.date, s.time, `"${s.name}"`, s.age, s.gender,
                s.metrics.index_pre.toFixed(2),
                s.metrics.prom_psi.toFixed(2),
                s.metrics.prom_fis.toFixed(2),
                s.metrics.prom_psi_post.toFixed(2),
                s.metrics.diff_total.toFixed(2),
                s.post.rpe
            ];
            csv += row.join(',') + '\n';
        });

        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', 'tennis_tracker_export.csv');
        link.click();
    }
};

window.onload = () => app.init();