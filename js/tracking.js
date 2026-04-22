/**
 * SafeTap Live Location Tracking Module
 * Orchestrates high-frequency telemetry during active emergencies
 */

const LiveTracker = {
    watchId: null,
    lastUpdate: 0,
    updateThrottle: 5000, // 5 seconds
    isActive: false,

    async start() {
        if (this.isActive) return;
        
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
            console.error("Tracking: User session missing");
            return;
        }

        this.isActive = true;
        Toasts.show('Live Tracking Activated', 'warning');

        if (!navigator.geolocation) {
            Toasts.show('GPS Not Supported', 'danger');
            return;
        }

        this.watchId = navigator.geolocation.watchPosition(
            (pos) => this.handleUpdate(pos, user.id),
            (err) => this.handleError(err),
            {
                enableHighAccuracy: true,
                timeout: 5000,
                maximumAge: 0
            }
        );
    },

    stop() {
        if (this.watchId) {
            navigator.geolocation.clearWatch(this.watchId);
            this.watchId = null;
        }
        this.isActive = false;
        Toasts.show('Tracking Terminated', 'info');
    },

    async handleUpdate(pos, userId) {
        const now = Date.now();
        if (now - this.lastUpdate < this.updateThrottle) return;

        const { latitude, longitude } = pos.coords;
        
        try {
            // 1. Persist to Cloud
            const { error } = await supabase
                .from('live_locations')
                .insert([{
                    user_id: userId,
                    latitude,
                    longitude,
                    timestamp: new Date().toISOString()
                }]);

            if (error) throw error;
            
            this.lastUpdate = now;

            // 2. Update UI (Broadcast to global state)
            window.latestLocation = { latitude, longitude };
            this.updateUIMarker(latitude, longitude);

        } catch (e) {
            console.warn("Tracking Sync Failed:", e.message);
        }
    },

    updateUIMarker(lat, lng) {
        const display = document.getElementById('live-coord-display');
        if (display) {
            display.textContent = `${lat.toFixed(5)}, ${lng.toFixed(5)}`;
        }
    },

    handleError(err) {
        let msg = "Location error";
        if (err.code === 1) msg = "GPS Permission Denied";
        if (err.code === 2) msg = "GPS Signal Lost";
        if (err.code === 3) msg = "GPS Timeout";
        
        Toasts.show(msg, 'danger');
        this.stop();
    }
};

window.LiveTracker = LiveTracker;
