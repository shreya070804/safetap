/**
 * SafeTap Emergency Module
 * Handles SOS triggering with hold-to-confirm logic and visual feedback
 */

const Emergency = {
    holdTimer: null,
    progressInterval: null,
    holdDuration: 2000, 
    isHolding: false,
    
    init() {
        this.setupHoldLogic();
    },

    setupHoldLogic() {
        const sosBtn = document.getElementById('sos-btn'); 
        const progressCircle = document.getElementById('sos-progress-circle'); 
        
        if (!sosBtn) return;

        const start = (e) => {
            if (this.isHolding) return;
            this.isHolding = true;
            sosBtn.classList.add('holding');
            
            let startTime = Date.now();
            this.progressInterval = setInterval(() => {
                let elapsed = Date.now() - startTime;
                let progress = Math.min(elapsed / this.holdDuration, 1);
                
                if (progressCircle) {
                    let offset = 816 * (1 - progress);
                    progressCircle.style.strokeDashoffset = offset;
                }

                if (progress >= 1) {
                    this.finishHolding(sosBtn, progressCircle);
                }
            }, 16);

            this.holdTimer = setTimeout(() => {
                this.triggerSOS();
            }, this.holdDuration);
        };

        const stop = () => {
            if (!this.isHolding) return;
            this.isHolding = false;
            sosBtn.classList.remove('holding');
            clearTimeout(this.holdTimer);
            clearInterval(this.progressInterval);
            if (progressCircle) progressCircle.style.strokeDashoffset = '816';
        };

        sosBtn.addEventListener('pointerdown', start);
        window.addEventListener('pointerup', stop);
        window.addEventListener('pointercancel', stop);
    },

    finishHolding(btn, circle) {
        this.isHolding = false;
        btn.classList.remove('holding');
        clearTimeout(this.holdTimer);
        clearInterval(this.progressInterval);
        circle.style.strokeDashoffset = '0'; // Solid circle on finish
    },

    async triggerSOS() {
        const settings = Utils.get('settings') || { camera: true, audio: true };
        
        // Feedback
        if (navigator.vibrate) navigator.vibrate([100, 50, 100]);
        if (typeof Utils !== 'undefined' && Utils.playAlarm) Utils.playAlarm();
        
        Toasts.show('🚨 EMERGENCY ACTIVATED', 'danger');
        
        // 📸 Feature 13: Camera Snapshot
        let photoData = null;
        if (settings.camera) {
            Toasts.show('Capturing security snapshot...', 'info');
            photoData = await Utils.capturePhoto();
        }

        // 🎙️ Feature 14: Audio Recording
        let audioData = null;
        if (settings.audio) {
            Toasts.show('Recording environmental audio...', 'info');
            audioData = await Utils.captureAudio(4000);
        }

        Toasts.show('Fetching precise location...', 'warning');

        navigator.geolocation.getCurrentPosition(
            async (position) => {
                const { latitude, longitude, accuracy } = position.coords;
                const mapsLink = `https://www.google.com/maps?q=${latitude},${longitude}`;
                
                // save to history with media (Features 13, 14, 15)
                this.saveToHistory(latitude, longitude, accuracy, mapsLink, photoData, audioData);

                // whatsapp alert
                this.sendWhatsAppAlert(mapsLink);

                Toasts.show('Location synced and contacts notified!', 'success');
                
                // Feature 20: Start Inactivity Watch
                this.startInactivityWatch();
            },
            (err) => {
                console.error("Geo Error", err);
                this.saveToHistory("N/A", "N/A", "N/A", null, photoData, audioData);
                Toasts.show('SOS Sent (Location Unavailable)', 'warning');
                this.startInactivityWatch();
            },
            { enableHighAccuracy: true, timeout: 5000 }
        );
    },

    // 🤖 Feature 20: Auto SOS on Inactivity
    inactivityTimer: null,
    initInactivitySOS() {
        // Setup listeners for "Life Check"
        window.addEventListener('scroll', () => this.resetInactivityTimer());
        window.addEventListener('click', () => this.resetInactivityTimer());
        window.addEventListener('touchstart', () => this.resetInactivityTimer());
    },

    startInactivityWatch() {
        const settings = Utils.get('settings') || {};
        if (!settings.inactivity) return;

        this.resetInactivityTimer();
        Toasts.show("Inactivity watch active (60s)", "info");
        
        this.inactivityTimer = setTimeout(() => {
            Toasts.show("No response detected. Re-triggering SOS!", "danger");
            this.triggerSOS();
        }, 60000); // 1 minute inactivity
    },

    resetInactivityTimer() {
        if (this.inactivityTimer) {
            clearTimeout(this.inactivityTimer);
            this.inactivityTimer = null;
        }
    },

    sendWhatsAppAlert(link) {
        const profile = Utils.get('profile') || {};
        const contacts = profile.contacts || [];
        
        if (contacts.length === 0) {
            Toasts.show('No emergency contacts found in profile.', 'info');
            return;
        }

        const message = encodeURIComponent(`SOS! I need help. My location: ${link}`);
        const firstContact = contacts[0].phone.replace(/\D/g, '');
        const whatsappUrl = `https://wa.me/${firstContact}?text=${message}`;
        window.open(whatsappUrl, '_blank');
    },

    saveToHistory(lat, lng, accuracy, mapsLink = null, photo = null, audio = null) {
        try {
            let alerts = JSON.parse(localStorage.getItem("sosHistory")) || [];
            const timestamp = new Date().toLocaleString();
            
            const newAlert = {
                type: "EMERGENCY",
                time: timestamp,
                accuracy: accuracy,
                lat: lat,
                lng: lng,
                mapsLink: mapsLink,
                photo: photo, // Feature 13
                audio: audio, // Feature 14
                battery: document.getElementById('battery-status')?.querySelector('span')?.textContent || 'N/A', // Feature 15
                network: navigator.onLine ? 'Online' : 'Offline' // Feature 15
            };
            alerts.push(newAlert);
            localStorage.setItem("sosHistory", JSON.stringify(alerts));
            
            // 🤖 Risk Detection (Task Requirement)
            this.detectRisk(alerts);

            // Immediately refresh UI
            if (typeof renderHistory === 'function') {
                renderHistory();
            } else if (typeof alertHistory !== 'undefined' && alertHistory.renderHistory) {
                alertHistory.renderHistory();
            }

            // Sync with Analytics
            if (typeof Analytics !== 'undefined') Analytics.init();
            
            // Update Trust Score
            if (typeof App !== 'undefined' && App.updateTrustUI) App.updateTrustUI();

        } catch (e) {
            console.error("SOS Alert Storage Failed:", e);
        }
    },

    detectRisk(alerts) {
        const now = new Date();
        const lastAlert = alerts[alerts.length - 2]; // Previous alert
        
        // 1. Frequency Check
        if (lastAlert) {
            const lastTime = new Date(lastAlert.time);
            const diffMins = (now - lastTime) / (1000 * 60);
            if (diffMins < 10) {
                Toasts.show("⚠️ HIGH RISK DETECTED: Rapid SOS frequency. Stay alert.", "danger");
            }
        }

        // 2. Late Night Check
        const hour = now.getHours();
        if (hour >= 23 || hour <= 4) {
             Toasts.show("⚠️ HIGH RISK DETECTED: Late night alert. Stay in well-lit areas.", "warning");
        }
    },

    // 📞 Fake Call Feature (Task Requirement)
    simulateFakeCall() {
        const modal = document.getElementById('modal-fake-call');
        if (modal) {
            modal.classList.remove('hidden');
            Toasts.show("Fake Call Simulated. Keep your phone visible.", "info");
        }
    },

    stopFakeCall() {
        const modal = document.getElementById('modal-fake-call');
        if (modal) modal.classList.add('hidden');
    },

    acceptFakeCall() {
        this.stopFakeCall();
        Toasts.show("Call Ended. Stay safe.", "info");
    },

    // 🎙️ Voice Trigger (Task Requirement)
    initVoiceTrigger() {
        const toggle = document.getElementById('voice-trigger-toggle');
        if (!toggle) return;

        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!SpeechRecognition) {
            console.warn("Speech API not supported");
            toggle.disabled = true;
            return;
        }

        const recognition = new SpeechRecognition();
        recognition.continuous = true;
        recognition.lang = 'en-US';

        recognition.onresult = (event) => {
            const transcript = event.results[event.results.length - 1][0].transcript.toLowerCase();
            console.log("Detected phrase:", transcript);
            if (transcript.includes("help me")) {
                Toasts.show("VOICE TRIGGER: Phrase detected!", "danger");
                this.triggerSOS();
            }
        };

        toggle.onchange = () => {
            if (toggle.checked) {
                recognition.start();
                Toasts.show("Voice SOS Active: Say 'Help Me' to trigger.", "success");
            } else {
                recognition.stop();
                Toasts.show("Voice SOS Deactivated.", "info");
            }
        };
    }
};

window.triggerSOS = () => Emergency.triggerSOS();
window.Emergency = Emergency;
window.simulateFakeCall = () => Emergency.simulateFakeCall();