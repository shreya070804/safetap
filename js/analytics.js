const Analytics = {
    charts: {},

    async init() {
        const data = await this.getMergedData();
        this.renderFrequencyChart(data);
        this.renderTypeChart(data);
        this.updateStats(data);
    },

    async getMergedData() {
        // 1. Get Local Data
        const local = JSON.parse(localStorage.getItem("sosHistory")) || [];
        const localFormatted = local.map(a => ({
            timestamp: a.time,
            type: a.type || 'EMERGENCY'
        }));

        // 2. Get Supabase Data (Optional/Async)
        let remote = [];
        try {
            if (typeof supabase !== 'undefined') {
                const { data: { user } } = await supabase.auth.getUser();
                if (user) {
                    const { data } = await supabase.from('alerts').select('*').eq('user_id', user.id);
                    remote = data || [];
                }
            }
        } catch(e) {}

        return [...localFormatted, ...remote];
    },

    updateStats(data) {
        // Total Alerts
        const totalEl = document.getElementById('stat-total-alerts');
        if (totalEl) totalEl.textContent = data.length;

        // Peak Time Analysis
        if (data.length > 0) {
            const hours = new Array(24).fill(0);
            data.forEach(a => {
                const date = new Date(a.timestamp);
                if (!isNaN(date)) hours[date.getHours()]++;
            });
            const peakHour = hours.indexOf(Math.max(...hours));
            const peakEl = document.getElementById('peak-sos-time');
            if (peakEl) peakEl.textContent = `${peakHour}:00 - ${peakHour + 1}:00`;
        }
    },

    renderFrequencyChart(data) {
        const ctx = document.getElementById('frequencyChart');
        if (!ctx || typeof Chart === 'undefined') return;

        const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        const counts = new Array(7).fill(0);
        
        data.forEach(a => {
            const date = new Date(a.timestamp);
            if (!isNaN(date)) counts[date.getDay()]++;
        });

        if (this.charts.freq) this.charts.freq.destroy();
        
        this.charts.freq = new Chart(ctx, {
            type: 'line',
            data: {
                labels: days,
                datasets: [{
                    label: 'Incidents',
                    data: counts,
                    borderColor: '#ef4444',
                    backgroundColor: 'rgba(239, 68, 68, 0.1)',
                    fill: true,
                    tension: 0.4
                }]
            },
            options: {
                responsive: true,
                plugins: { legend: { display: false } },
                scales: { 
                    y: { beginAtZero: true, grid: { color: 'rgba(255,255,255,0.05)' } },
                    x: { grid: { display: false } }
                }
            }
        });
    },

    renderTypeChart(data) {
        const ctx = document.getElementById('typeChart');
        if (!ctx || typeof Chart === 'undefined') return;

        const types = {};
        data.forEach(a => {
            const t = (a.type || 'SOS').toUpperCase();
            types[t] = (types[t] || 0) + 1;
        });

        if (this.charts.type) this.charts.type.destroy();

        this.charts.type = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: Object.keys(types),
                datasets: [{
                    data: Object.values(types),
                    backgroundColor: ['#ef4444', '#3b82f6', '#10b981', '#f59e0b'],
                    borderWidth: 0
                }]
            },
            options: {
                responsive: true,
                cutout: '70%',
                plugins: { 
                    legend: { position: 'bottom', labels: { color: '#9ca3af', padding: 20 } } 
                }
            }
        });
    }
};

window.Analytics = Analytics;
