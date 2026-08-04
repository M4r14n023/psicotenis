// Módulo independiente para gestión de gráficos con Chart.js
const trackerCharts = {
    instances: {},

    // Destruir gráfico si ya existe antes de volver a crearlo
    destroyChart(id) {
        if (this.instances[id]) {
            this.instances[id].destroy();
        }
    },

    renderAll(data) {
        // Configuración global para Dark Mode
        Chart.defaults.color = '#A0A0A0';
        Chart.defaults.borderColor = '#333333';

        const labels = data.map(s => `${s.date.substring(0, 5)} (${s.time})`);
        const dataGral = data.map(s => s.metrics.index_pre);
        const dataPsyPre = data.map(s => s.metrics.prom_psi);
        const dataFisPre = data.map(s => s.metrics.prom_fis);
        const dataPsyChange = data.map(s => s.metrics.diff_total);

        const dConc = data.map(s => s.pre.conc);
        const dMot = data.map(s => s.pre.mot);
        const dConf = data.map(s => s.pre.conf);
        const dCtrl = data.map(s => s.pre.ctrl);

        // 1. Evolución del Índice General PRE
        this.destroyChart('chartGeneral');
        this.instances['chartGeneral'] = new Chart(document.getElementById('chartGeneral'), {
            type: 'line',
            data: {
                labels,
                datasets: [{
                    label: 'Índice General PRE (%)',
                    data: dataGral,
                    borderColor: '#10B981',
                    backgroundColor: 'rgba(16, 185, 129, 0.1)',
                    fill: true,
                    tension: 0.3
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: { y: { min: 0, max: 100 } }
            }
        });

        // 2. Estado Psicológico vs Físico (PRE)
        this.destroyChart('chartPrePsyFis');
        this.instances['chartPrePsyFis'] = new Chart(document.getElementById('chartPrePsyFis'), {
            type: 'line',
            data: {
                labels,
                datasets: [
                    { label: 'Psicológico PRE', data: dataPsyPre, borderColor: '#A855F7', tension: 0.3 },
                    { label: 'Físico PRE', data: dataFisPre, borderColor: '#F59E0B', tension: 0.3 }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: { y: { min: 0, max: 100 } }
            }
        });

        // 3. Variables Psicológicas individuales
        this.destroyChart('chartPsyVars');
        this.instances['chartPsyVars'] = new Chart(document.getElementById('chartPsyVars'), {
            type: 'line',
            data: {
                labels,
                datasets: [
                    { label: 'Concentración', data: dConc, borderColor: '#3B82F6', tension: 0.3 },
                    { label: 'Motivación', data: dMot, borderColor: '#EC4899', tension: 0.3 },
                    { label: 'Confianza', data: dConf, borderColor: '#10B981', tension: 0.3 },
                    { label: 'Control Emocional', data: dCtrl, borderColor: '#F59E0B', tension: 0.3 }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: { y: { min: 0, max: 100 } }
            }
        });

        // 4. Cambio Psicológico / Efecto del Entrenamiento (DT %)
        this.destroyChart('chartPsyChange');
        this.instances['chartPsyChange'] = new Chart(document.getElementById('chartPsyChange'), {
            type: 'bar',
            data: {
                labels,
                datasets: [{
                    label: 'Diferencia de Entrenamiento (DT %)',
                    data: dataPsyChange,
                    backgroundColor: dataPsyChange.map(v => v >= 5 ? '#10B981' : (v > -5 ? '#F59E0B' : '#EF4444'))
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false
            }
        });
    }
};