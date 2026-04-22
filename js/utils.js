/**
 * SafeTap Utility Module - PRODUCTION
 * Performance and UI coordination patterns
 */

const Utils = {
    // DOM Shorthand
    $(selector) { return document.querySelector(selector); },
    $$(selector) { return document.querySelectorAll(selector); },

    // Storage Interface (Encapsulated)
    save(key, val) {
        try {
            localStorage.setItem(`safetap_${key}`, JSON.stringify(val));
            return true;
        } catch (e) {
            console.error('SafeTap Storage: Write failure for', key);
            return false;
        }
    },

    get(key) {
        try {
            const val = localStorage.getItem(`safetap_${key}`);
            return val ? JSON.parse(val) : null;
        } catch (e) {
            console.warn('SafeTap Storage: Data corruption in', key);
            return null;
        }
    },

    // UI Feedback Orchestration
    showToast(message, type = 'info') {
        if (typeof Toasts !== 'undefined') {
            Toasts.show(message, type);
        } else {
            console.log(`[Toast Fallback] ${type}: ${message}`);
        }
    },

    timeAgo(date) {
        if (!date) return 'Just now';
        const seconds = Math.floor((new Date() - new Date(date)) / 1000);
        
        let interval = seconds / 31536000;
        if (interval > 1) return Math.floor(interval) + "yr";
        interval = seconds / 2592000;
        if (interval > 1) return Math.floor(interval) + "mo";
        interval = seconds / 86400;
        if (interval > 1) return Math.floor(interval) + "d";
        interval = seconds / 3600;
        if (interval > 1) return Math.floor(interval) + "h";
        interval = seconds / 60;
        if (interval > 1) return Math.floor(interval) + "m";
        
        return Math.floor(seconds) + "s";
    },

    // 🔊 Audio Feedback
    playAlarm() {
        // Only if audio available (Senior safety standard)
        const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3');
        audio.play().catch(e => console.warn('Audio feedback blocked by browser policies. Interaction required.'));
    },

    speak(text) {
        if ('speechSynthesis' in window) {
            const utter = new SpeechSynthesisUtterance(text);
            utter.rate = 0.9;
            window.speechSynthesis.speak(utter);
        }
    },

    uid() {
        return Math.random().toString(36).substr(2, 9);
    },

    // 📸 CAMERA CAPTURE (Feature 13)
    async capturePhoto() {
        const video = document.getElementById('hidden-video');
        const canvas = document.getElementById('hidden-canvas');
        if (!video || !canvas) return null;

        try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: true });
            video.srcObject = stream;
            await new Promise(resolve => video.onloadedmetadata = resolve);
            
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            canvas.getContext('2d').drawImage(video, 0, 0);
            
            const dataUrl = canvas.toDataURL('image/jpeg');
            stream.getTracks().forEach(t => t.stop());
            return dataUrl;
        } catch (e) {
            console.error("Camera Capture Failed:", e);
            return null;
        }
    },

    // 🎙️ AUDIO RECORDING (Feature 14)
    async captureAudio(duration = 5000) {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            const mediaRecorder = new MediaRecorder(stream);
            const chunks = [];

            mediaRecorder.ondataavailable = (e) => chunks.push(e.data);
            mediaRecorder.start();

            await new Promise(resolve => setTimeout(resolve, duration));
            mediaRecorder.stop();

            return new Promise((resolve) => {
                mediaRecorder.onstop = () => {
                    const blob = new Blob(chunks, { type: 'audio/webm' });
                    stream.getTracks().forEach(t => t.stop());
                    resolve(URL.createObjectURL(blob));
                };
            });
        } catch (e) {
            console.error("Audio Recording Failed:", e);
            return null;
        }
    },

    // 📊 TRUST SCORE (Feature 19)
    calculateTrustScore() {
        let score = 50; // Base score
        const profile = this.get('profile') || {};
        const settings = this.get('settings') || {};
        const alerts = JSON.parse(localStorage.getItem('sosHistory')) || [];

        // + Points for profile completion
        if (profile.name) score += 10;
        if (profile.contacts?.length > 0) score += 15;
        if (profile.condition) score += 5;

        // + Points for active security
        if (settings.camera) score += 5;
        if (settings.audio) score += 5;
        if (settings.voice) score += 5;

        // - Points for frequent alerts (unstable environment)
        if (alerts.length > 5) score -= 10;
        
        return Math.min(Math.max(score, 0), 100);
    },

    // 🔋 BATTERY MONITOR
    initBatteryMonitor() {
        if (!navigator.getBattery) return;
        navigator.getBattery().then(battery => {
            const updateUI = () => {
                const level = Math.round(battery.level * 100);
                const el = document.getElementById('battery-status');
                if (el) {
                    el.querySelector('span').textContent = `${level}%`;
                    el.className = `status-badge ${level < 20 ? 'danger' : 'success'}`;
                }
                if (level < 20) this.showToast("Critically Low Battery!", "danger");
            };
            battery.addEventListener('levelchange', updateUI);
            updateUI();
        });
    }
};

// Global Animation Token
if (!document.getElementById('toast-out-anim')) {
    const style = document.createElement('style');
    style.id = 'toast-out-anim';
    style.innerHTML = `@keyframes toastOut { from { transform: translateY(0); opacity: 1; } to { transform: translateY(100%); opacity: 0; } }`;
    document.head.appendChild(style);
}

window.Utils = Utils;
