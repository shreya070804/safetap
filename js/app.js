/**
 * SafeTap App Controller - Aurora Premium Redesign
 * Main entry point and orchestration for the Ultra-Premium experience.
 */

const App = {
    currentScreen: 'emergency',
    currentMode: 'user',
    
    init() {
        // SafeTap Engine Initialization
        Utils.showToast('Aurora Shield Synchronized', 'info');
        
        // Listen for authentication state
        supabase.auth.onAuthStateChange((event, session) => {
            this.updateAuthUI(session?.user);
            if (session) {
                this.showAppUI();
                if (event === 'SIGNED_IN' || event === 'INITIAL_SESSION') {
                    this.initAfterAuth();
                }
            } else {
                this.showLoginUI();
            }
        });

        Emergency.init();
        Profile.init();
        
        this.setupNavigation();
        this.setupAccessibility();
        this.setupSystemFeatures();
        this.setupNetworkMonitoring();
        this.setupSettings();
        
        // Start in default mode
        this.refreshStats();
        this.updateTrustUI();
        Utils.initBatteryMonitor();
        
        // Initialize Core Components
        if (typeof alertHistory !== 'undefined') alertHistory.init();
        if (typeof Emergency !== 'undefined') {
            Emergency.initVoiceTrigger();
            Emergency.initInactivitySOS();
        }
    },

    setupSettings() {
        const resetBtn = document.getElementById('btn-reset-app');
        if (resetBtn) {
            resetBtn.onclick = () => {
                if (confirm("🚨 ABORT: This will PERMANENTLY purge all security credentials. Proceed?")) {
                    localStorage.clear();
                    location.reload();
                }
            };
        }
    },

    updateTrustUI() {
        const score = Utils.calculateTrustScore();
        const scoreTexts = document.querySelectorAll('.score-text');
        scoreTexts.forEach(el => el.textContent = `${score}%`);
    },

    async initAfterAuth() {
        if (typeof supabase === 'undefined' || !supabase) return;
        
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;
            
            Utils.showToast('Accessing Neural Profile...', 'info');

            let { data: profile, error } = await supabase
                .from("profiles")
                .select("*")
                .eq("id", user.id)
                .maybeSingle();

            if (!profile && !error) {
                await Auth.createProfile(); 
                const { data: finalProfile } = await supabase
                    .from("profiles")
                    .select("*")
                    .eq("id", user.id)
                    .maybeSingle();
                profile = finalProfile;
            }

            if (profile) {
                localStorage.setItem(`safetap_profile`, JSON.stringify(profile));
            }
        } catch (e) {
            console.warn('Sync failed, using localized cache.');
        }

        Profile.init();
        this.refreshStats();
        this.switchTab('emergency');
    },

    setupNavigation() {
        const tabs = document.querySelectorAll('.tab-btn');
        
        tabs.forEach(tab => {
            tab.addEventListener('click', () => {
                const target = tab.getAttribute('data-target');
                if (!target) return;

                // UI Active States
                tabs.forEach(t => t.classList.remove('active'));
                tab.classList.add('active');

                this.switchTab(target.replace('screen-', ''));
            });
        });
        
        // Clear history feature
        const clearBtn = document.getElementById("clearHistory");
        if (clearBtn) {
            clearBtn.onclick = () => {
                localStorage.removeItem("sosHistory");
                if (typeof renderHistory === 'function') renderHistory();
                Utils.showToast('Log Cleared', 'info');
            };
        }
    },

    switchTab(tabId) {
        if (!tabId) return;
        
        const targetId = tabId.startsWith('screen-') ? tabId : `screen-${tabId}`;
        const cleanTabId = tabId.replace('screen-', '');
        
        this.currentScreen = cleanTabId;
        
        const sections = document.querySelectorAll('.screen');
        sections.forEach(section => {
            section.classList.remove('active');
            section.style.display = 'none';
        });

        const activeSection = document.getElementById(targetId);
        if(activeSection) {
            activeSection.style.display = 'block';
            activeSection.classList.add('active');
        }
        
        if (tabId === 'history') this.renderAlertHistory('all');
        this.refreshStats();
    },

    showAppUI() {
        const authOverlay = document.getElementById("auth-overlay");
        if (authOverlay) authOverlay.classList.add('hidden');
        this.closeModal();
    },

    showLoginUI() {
        const authOverlay = document.getElementById("auth-overlay");
        if (authOverlay) authOverlay.classList.remove('hidden');
    },

    updateAuthUI(user) {
        const label = document.getElementById("profile-email-label");
        if (user && label) {
            label.textContent = `AUTHENTICATED: ${user.email}`;
            label.style.color = "var(--success-green)";
        }
    },

    setMode(mode) {
        this.currentMode = mode;
        Utils.showToast(`Console: ${mode.toUpperCase()} Access`, 'info');
        this.switchTab('emergency');
    },

    setupAccessibility() {
        // Accessibility hooks for Aurora Glass
    },

    closeModal() {
        const overlays = ['#modal-overlay', '#active-alert-overlay'];
        overlays.forEach(selector => {
            const el = document.querySelector(selector);
            if (el) el.classList.add('hidden');
        });
        document.body.classList.remove('modal-open');
    },

    showMedicalID() {
        const profile = Utils.get('profile') || {};
        const contacts = profile.contacts || [];
        const modal = document.querySelector('#modal-overlay');
        
        if (!modal) return;

        let contactsHtml = contacts.map(c => `
            <div class="crystal-card" style="padding: 12px; margin-bottom: 8px; flex-direction: row; justify-content: space-between;">
                <span style="font-weight: bold;">${c.name}</span>
                <span style="color: var(--p-glow);">${c.phone}</span>
            </div>
        `).join('') || '<p style="color: var(--text-dim);">No contacts synced.</p>';

        const content = `
            <div class="alert-overlay">
                <div class="hero-card" style="width: 90%; max-width: 380px;">
                    <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 24px;">
                        <i class="fas fa-heart-pulse" style="font-size: 2rem; color: var(--sos-red);"></i>
                        <h2 style="margin: 0;">MEDICAL ID</h2>
                    </div>
                    
                    <div style="margin-bottom: 24px;">
                        <label style="font-size: 0.7rem; color: var(--text-dim); text-transform: uppercase;">Identity</label>
                        <h3 style="margin: 4px 0;">${profile.name || 'Anonymous User'}</h3>
                        <p style="margin: 4px 0; color: var(--p-glow); font-weight: 800;">${profile.condition || 'No conditions listed'}</p>
                    </div>

                    <div style="margin-bottom: 24px;">
                        <label style="font-size: 0.7rem; color: var(--text-dim); text-transform: uppercase;">Dispatch Contacts</label>
                        <div style="margin-top: 12px;">${contactsHtml}</div>
                    </div>

                    <button class="btn-crystal" onclick="App.closeModal()">Dismiss Access</button>
                </div>
            </div>
        `;
        Utils.$('.phone-container').insertAdjacentHTML('beforeend', content);
    },

    setupSystemFeatures() {
        // Global PWA and Platform hooks
    },

    renderAlertHistory(filter = 'all') {
        if (typeof alertHistory !== 'undefined') {
            alertHistory.renderHistory();
        }
    },

    setupNetworkMonitoring() {
        window.addEventListener('online', () => Toasts.show("Signal Restored", "success"));
        window.addEventListener('offline', () => Toasts.show("Signal Lost — Backup Localized", "danger"));
    },

    refreshStats() {
        if (typeof Profile !== 'undefined' && typeof Profile.renderSummary === 'function') {
            Profile.renderSummary();
        }
        this.updateTrustUI();
    }
};

window.App = App;

document.addEventListener("DOMContentLoaded", () => {
    // Initial SOS Click logic
    const sosBtn = document.getElementById("sos-btn");
    if (sosBtn) {
        sosBtn.addEventListener("click", () => {
            Utils.showToast("Hold for 3s to trigger security dispatch", "info");
        });
    }

    // Auth Initialization
    (async () => {
        const { data: { session } } = await supabase.auth.getSession();
        if (session) App.showAppUI();
        else App.showLoginUI();
        App.init();
    })();
});
