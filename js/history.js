const alertHistory = {
    async init() {
        this.renderHistory();
    },

    renderHistory() {
        // 1. Get container
        const container = document.getElementById("historyContainer");
        if (!container) return;

        // 2. Clear UI
        container.innerHTML = "";

        // 3. Load alerts (Avoid 'history' variable name)
        const alerts = JSON.parse(localStorage.getItem("sosHistory")) || [];

        // Update stats (Internal sync)
        const totalEl = document.getElementById('stat-total-alerts');
        const sosEl = document.getElementById('stat-sos-count');
        if (totalEl) totalEl.textContent = alerts.length;
        if (sosEl) sosEl.textContent = alerts.filter(a => a.type === 'EMERGENCY').length;

        // 4. If empty
        if (alerts.length === 0) {
            container.innerHTML = "<p style='text-align: center; padding: 2rem; color: var(--text-muted);'>No alerts yet</p>";
            return;
        }

        // 5. Show newest first
        alerts.slice().reverse().forEach(item => {
            container.innerHTML += `
                <div class="alert-card" style="background: var(--surface-light); border: 1px solid var(--border-color); border-radius: 12px; padding: 15px; margin-bottom: 10px;">
                    <div style="display: flex; justify-content: space-between; align-items: start;">
                        <b>${item.type}</b>
                        <div style="display: flex; gap: 5px;">
                            ${item.battery ? `<span class="badge" style="font-size: 0.6rem; background: rgba(255,255,255,0.05);">${item.battery}</span>` : ''}
                            ${item.network ? `<span class="badge" style="font-size: 0.6rem; background: rgba(255,255,255,0.05);">${item.network}</span>` : ''}
                        </div>
                    </div>
                    <p style="margin: 5px 0; font-size: 0.85rem;">${item.time}</p>
                    <p style="font-size: 0.8rem; color: var(--text-gray);">Status: ${item.accuracy || 'Manual'}</p>
                    
                    ${item.photo ? `
                        <div style="margin: 10px 0; border-radius: 8px; overflow: hidden; border: 1px solid var(--border);">
                            <img src="${item.photo}" style="width: 100%; display: block; filter: brightness(0.8);" alt="Security Snapshot">
                        </div>
                    ` : ''}

                    ${item.audio ? `
                        <div style="margin: 10px 0;">
                            <audio src="${item.audio}" controls style="width: 100%; height: 32px;"></audio>
                        </div>
                    ` : ''}

                    ${item.mapsLink ? `
                        <a href="${item.mapsLink}" target="_blank" style="color: #3b82f6; text-decoration: none; font-size: 0.8rem; display: block; margin-top: 8px; font-weight: bold;">
                            <i class="fas fa-location-dot"></i> Maps Location
                        </a>
                    ` : ''}
                </div>
            `;
        });
    }
};

window.renderHistory = () => alertHistory.renderHistory();
window.fetchAlerts = () => {
    try {
        return JSON.parse(localStorage.getItem("sosHistory")) || [];
    } catch(e) { return []; }
};
window.alertHistory = alertHistory;
