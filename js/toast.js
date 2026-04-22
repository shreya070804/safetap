/**
 * SafeTap Toast Module
 * Handles non-blocking user feedback
 */

const Toasts = {
    show(message, type = 'info') {
        const container = document.getElementById('toast-container');
        if (!container) return;
        
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        
        let icon = '<i class="fas fa-info-circle"></i>';
        if (type === 'warning') icon = '<i class="fas fa-biohazard"></i>';
        if (type === 'success') icon = '<i class="fas fa-check-circle"></i>';
        if (type === 'danger') icon = '<i class="fas fa-exclamation-triangle"></i>';
        
        toast.innerHTML = `${icon} <span>${message}</span>`;
        container.appendChild(toast);
        
        // Auto-cleanup with fade-out
        setTimeout(() => {
            toast.style.animation = 'toastOut 0.3s ease forwards';
            setTimeout(() => toast.remove(), 300);
        }, 4000);
    }
};

// Replace legacy Utils.showToast with modular Toasts.show
if (typeof Utils !== 'undefined') {
    Utils.showToast = (msg, type) => Toasts.show(msg, type);
}

window.Toasts = Toasts;
