/**
 * SafeTap Security Module
 * Handles PIN lock and biometric verification
 */

const Security = {
    correctPin: "1234",
    currentPin: "",
    isLocked: false,

    init() {
        // Automatically lock sensitive areas if PIN is set
        this.checkInitialLock();
    },

    checkInitialLock() {
        const pinSet = localStorage.getItem('safetap_pin_enabled');
        if (pinSet === 'true') {
            this.showLock();
        }
    },

    showLock() {
        const modal = document.getElementById('modal-pin-lock');
        if (modal) {
            modal.classList.remove('hidden');
            this.isLocked = true;
            this.currentPin = "";
            this.updatePinDots();
        }
    },

    addPinDigit(digit) {
        if (this.currentPin.length < 4) {
            this.currentPin += digit;
            this.updatePinDots();
            
            if (this.currentPin.length === 4) {
                this.verifyPin();
            }
        }
    },

    backspace() {
        this.currentPin = this.currentPin.slice(0, -1);
        this.updatePinDots();
    },

    clearPin() {
        this.currentPin = "";
        this.updatePinDots();
    },

    updatePinDots() {
        const dots = document.querySelectorAll('#pin-display span');
        dots.forEach((dot, index) => {
            if (index < this.currentPin.length) {
                dot.classList.add('filled');
            } else {
                dot.classList.remove('filled');
            }
        });
    },

    verifyPin() {
        if (this.currentPin === this.correctPin) {
            this.unlock();
        } else {
            this.currentPin = "";
            this.updatePinDots();
            if (typeof Toasts !== 'undefined') Toasts.show("Incorrect PIN. Access Denied.", "danger");
            if (navigator.vibrate) navigator.vibrate([200, 100, 200]);
        }
    },

    unlock() {
        const modal = document.getElementById('modal-pin-lock');
        if (modal) modal.classList.add('hidden');
        this.isLocked = false;
        if (typeof Toasts !== 'undefined') Toasts.show("Security Verified. Access Granted.", "success");
    }
};

window.Security = Security;
