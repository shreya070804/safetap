/**
 * SafeTap SOS Countdown Module
 * Provides a 3-second grace period before dispatch
 */

const Countdown = {
    timer: null,
    seconds: 3,

    start(onComplete) {
        const overlay = document.getElementById('active-alert-overlay');
        const display = document.getElementById('countdown-display');
        
        if (!overlay || !display) return onComplete();

        this.seconds = 3;
        display.textContent = this.seconds;
        overlay.classList.remove('hidden');
        
        // Block interaction with main UI
        document.body.classList.add('modal-open');

        this.timer = setInterval(() => {
            this.seconds--;
            display.textContent = this.seconds;

            if (this.seconds <= 0) {
                this.stop();
                onComplete();
            }
        }, 1000);
    },

    stop() {
        clearInterval(this.timer);
        const overlay = document.getElementById('active-alert-overlay');
        if (overlay) overlay.classList.add('hidden');
        document.body.classList.remove('modal-open');
    },

    cancel() {
        this.stop();
        Toasts.show("SOS Cancelled", "info");
    }
};

window.Countdown = Countdown;
