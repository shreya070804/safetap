/**
 * SafeTap Caregiver Dashboard Engine - ENTERPRISE UPGRADE
 * Real-time monitoring, live breadcrumbs, and safety analytics
 */

const USER_ID = "user123"; // Global filter constant

const Caregiver = {
    map: null,
    marker: null,
    polyline: null,
    path: [],
    
    lastAlertId: null,
    lastUpdate: Date.now(),
    sosChart: null,

    async init() {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
            console.warn("🔐 Access Denied: Link lost.");
            window.history.back();
            return;
        }

        this.initMap();
        this.requestNotifications();
        this.initAnalytics();
        
        // 1. Initial Load
        await this.syncAll();
        
        // 2. Real-time Subscriptions (Replacement for polling)
        this.setupRealtime();
        
        // 3. Offline Monitoring Heartbeat
        setInterval(() => this.checkConnectivity(), 5000);

        // 4. Auto Refresh (Step 2)
        setInterval(() => {
            this.renderDashboard();
        }, 3000);
    },

    renderDashboard() {
        this.syncAll();
    },

    initMap() {
        this.map = L.map('map', { zoomControl: false }).setView([19.0760, 72.8777], 15);
        L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png').addTo(this.map);
        
        this.marker = L.marker([19.0760, 72.8777]).addTo(this.map);
        this.polyline = L.polyline([], { color: '#ef4444', weight: 4, opacity: 0.6, dashArray: '5, 10' }).addTo(this.map);
    },

    async syncAll() {
        await Promise.all([
            this.fetchTelemerty(),
            this.fetchAlerts(),
            this.refreshAnalytics()
        ]);
    },

    setupRealtime() {
        if (typeof supabase === 'undefined') return;

        // Listen for new location points
        supabase.channel('tracking')
            .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'locations', filter: `user_id=eq.${USER_ID}` }, 
                payload => this.handleLocationUpdate(payload.new))
            .subscribe();

        // Listen for new SOS alerts
        supabase.channel('alerts')
            .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'sos_alerts', filter: `user_id=eq.${USER_ID}` }, 
                payload => this.handleNewAlert(payload.new))
            .subscribe();
    },

    async fetchTelemerty() {
        const { data } = await supabase.from('locations').select('*').eq('user_id', USER_ID).order('timestamp', { ascending: false }).limit(50);
        if (data && data.length > 0) {
            // Reconstruct path (reverse to get chronological)
            this.path = data.reverse().map(p => [p.lat, p.lng]);
            const latest = data[data.length - 1];
            this.updateMap(latest.lat, latest.lng);
        }
    },

    async fetchAlerts() {
        const { data } = await supabase.from('sos_alerts').select('*').eq('user_id', USER_ID).order('timestamp', { ascending: false }).limit(50);
        this.renderAlerts(data || []);
    },

    handleLocationUpdate(point) {
        this.lastUpdate = Date.now();
        this.path.push([point.lat, point.lng]);
        this.updateMap(point.lat, point.lng);
        this.checkConnectivity();
    },

    handleNewAlert(alert) {
        this.fetchAlerts();
        this.playSound();
        this.sendNotification();
    },

    updateMap(lat, lng) {
        const coords = [lat, lng];
        this.marker.setLatLng(coords);
        this.polyline.setLatLngs(this.path);
        this.map.panTo(coords);
        document.getElementById('last-coord').textContent = `${lat.toFixed(5)}, ${lng.toFixed(5)}`;
    },

    checkConnectivity() {
        const isOffline = (Date.now() - this.lastUpdate) > 30000;
        const notice = document.getElementById('offline-notice');
        const connText = document.getElementById('conn-text');
        
        if (isOffline) {
            notice?.classList.remove('hidden');
            connText && (connText.textContent = "⚠️ User Offline");
        } else {
            notice?.classList.add('hidden');
            connText && (connText.textContent = "🟢 Live Tracking");
        }
    },

    renderAlerts(alerts) {
        const list = document.getElementById('history-list');
        const latestCard = document.getElementById('latest-alert-card');
        const totalBadge = document.getElementById('history-count');
        
        totalBadge.textContent = `${alerts.length} Signals Locked`;

        if (alerts.length === 0) {
            list.innerHTML = '<div class="empty-state-dark"><i class="fas fa-satellite-dish"></i><p>Scanning for signals...</p></div>';
            latestCard.classList.add('hidden');
            return;
        }

        const active = alerts[0];
        this.showLatestAlert(active);

        // Render Night-Watch Tactical Cards
        list.innerHTML = alerts.map(a => {
            const isResolved = a.resolved;
            const cardClass = isResolved ? 'resolved' : 'critical';
            const icon = isResolved ? 'fa-shield-check' : 'fa-circle-exclamation';
            const readableTime = Utils.timeAgo(a.timestamp);

            return `
                <div class="log-entry-card ${cardClass}">
                    <div class="log-card-header">
                        <div class="log-title">
                            <i class="fas ${icon}"></i>
                            ${isResolved ? 'SIGNAL CLEAR' : 'EMERGENCY ALERT'}
                        </div>
                        <span class="log-time">${readableTime}</span>
                    </div>
                    <div class="log-message">
                        ${a.message || 'Standard emergency protocol triggered.'}
                        <br><small style="opacity: 0.6; font-size: 0.65rem;">UID: ${a.id.slice(0, 8)}</small>
                    </div>
                    <div class="log-actions">
                        ${!isResolved ? `
                            <button class="log-btn-resolve" onclick="Caregiver.resolveAlert('${a.id}')">
                                <i class="fas fa-check-circle"></i> Resolve Incident
                            </button>
                        ` : `
                            <span class="log-badge-red" style="background: rgba(34, 197, 94, 0.1); color: #22c55e;">
                                Archived Record
                            </span>
                        `}
                    </div>
                </div>
            `;
        }).join('');
    },

    showLatestAlert(a) {
        const card = document.getElementById('latest-alert-card');
        card.classList.remove('hidden');
        
        document.getElementById('alert-time').textContent = Utils.timeAgo(a.timestamp);
        document.getElementById('alert-location').textContent = `📍 Lat: ${a.lat || 'N/A'}, Lng: ${a.lng || 'N/A'}`;
        
        const imgContainer = document.getElementById('alert-image-container');
        if (a.image_url) {
            imgContainer.style.backgroundImage = `url(${a.image_url})`;
            imgContainer.classList.remove('hidden');
        } else {
            imgContainer.classList.add('hidden');
        }

        document.getElementById('btn-resolve').onclick = () => this.resolveAlert(a.id);
    },

    async resolveAlert(id) {
        await supabase.from('sos_alerts').update({ resolved: true }).eq('id', id);
        this.fetchAlerts();
        this.refreshAnalytics();
    },

    initAnalytics() {
        const ctx = document.getElementById('sosChart');
        if (!ctx) return;
        this.sosChart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: ['Total', 'Last 24h'],
                datasets: [{
                    label: 'SOS Volume',
                    data: [0, 0],
                    backgroundColor: ['#ef4444', '#f87171'],
                    borderRadius: 8
                }]
            },
            options: { plugins: { legend: { display: false } }, scales: { y: { beginAtZero: true } } }
        });
    },

    async refreshAnalytics() {
        const { count: total } = await supabase.from('sos_alerts').select('*', { count: 'exact', head: true }).eq('user_id', USER_ID);
        const yesterday = new Array(Date.now() - 86400000);
        const { count: recent } = await supabase.from('sos_alerts').select('*', { count: 'exact', head: true }).eq('user_id', USER_ID).gt('timestamp', new Date(yesterday).toISOString());
        
        document.getElementById('stat-total').textContent = total || 0;
        document.getElementById('stat-24h').textContent = recent || 0;
        
        if (this.sosChart) {
            this.sosChart.data.datasets[0].data = [total || 0, recent || 0];
            this.sosChart.update();
        }
    },

    playSound() {
        const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3');
        audio.play().catch(() => console.log("Audio blocked by browser policy"));
    },

    sendNotification() {
        if ("Notification" in window && Notification.permission === "granted") {
            new Notification("🚨 SOS ALERT TRIGGERED", { body: `Emergency alert from USER: ${USER_ID}`, icon: '../icon.png' });
        }
    },

    requestNotifications() {
        if ("Notification" in window) Notification.requestPermission();
    }
};

window.onload = () => Caregiver.init();

// Helper for relative time if not in Utils
if (!window.Utils) {
    window.Utils = {
        timeAgo: (date) => {
            const seconds = Math.floor((new Date() - new Date(date)) / 1000);
            if (seconds < 60) return "just now";
            const mins = Math.floor(seconds / 60);
            return mins + "m ago";
        }
    };
}
