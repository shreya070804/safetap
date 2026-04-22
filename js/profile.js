// --- 3. PROFILE LOGIC ---
const Profile = {
    currentStep: 1, maxContacts: 5, contacts: [],
    
    init() {
        this.loadProfile();
        this.setupEventListeners();
    },
    setupEventListeners() {
        // ... navigation buttons logic ...
        Utils.$$('.btn-next').forEach(btn => btn.onclick = () => this.goToStep(parseInt(btn.dataset.next)));
        Utils.$$('.btn-back').forEach(btn => btn.onclick = () => this.goToStep(parseInt(btn.dataset.back)));
        
        const addBtn = Utils.$('#btn-add-contact');
        if (addBtn) addBtn.onclick = () => this.addContact();

        const saveBtn = Utils.$('#btn-save-profile');
        if (saveBtn) saveBtn.onclick = () => this.saveProfile();

        const editBtn = Utils.$('#btn-edit-profile');
        if (editBtn) editBtn.onclick = () => {
             const summary = Utils.$('#profile-summary');
             const header = Utils.$('.profile-header');
             if (summary) {
                 summary.classList.add('hidden');
                 if (header) header.classList.remove('hidden');
                 this.goToStep(1);
             }
        };
    },
    goToStep(step) {
        if (step > this.currentStep && !this.validateStep(this.currentStep)) return;

        Utils.$$('.setup-step').forEach(s => s.classList.remove('active'));
        const targetStep = Utils.$(`#setup-step-${step}`);
        if (targetStep) targetStep.classList.add('active');
        
        Utils.$$('.step').forEach((s, idx) => {
            s.classList.toggle('active', idx + 1 === step);
            s.classList.toggle('completed', idx + 1 < step);
        });

        this.currentStep = step;
    },
    validateStep(step) {
        if (step === 1) {
            const nameInput = Utils.$('#user-name');
            if (nameInput && !nameInput.value.trim()) {
                Utils.showToast('Name is required.', 'danger'); return false;
            }
        }
        if (step === 2 && this.contacts.length === 0) {
            Utils.showToast('Add at least 1 contact.', 'danger'); return false;
        }
        return true;
    },
    addContact(name = '', phone = '') {
        if (this.contacts.length >= this.maxContacts) return Utils.showToast('Max 5 contacts allowed.', 'info');
        this.contacts.push({ id: Utils.uid(), name, phone });
        this.renderContacts();
    },
    removeContact(id) {
        this.contacts = this.contacts.filter(c => c.id !== id);
        this.renderContacts();
    },
    updateContact(id, field, value) {
        const c = this.contacts.find(c => c.id === id);
        if (c) c[field] = value;
    },
    renderContacts() {
        const list = Utils.$('#contacts-list');
        if (!list) return;
        
        list.innerHTML = '';
        this.contacts.forEach(c => {
            const card = document.createElement('div'); 
            card.className = 'contact-card';
            card.innerHTML = `
                <input type="text" class="contact-name" value="${c.name || ''}" placeholder="Name" oninput="Profile.updateContact('${c.id}', 'name', this.value)">
                <input type="tel" class="contact-phone" value="${c.phone || ''}" placeholder="Phone" oninput="Profile.updateContact('${c.id}', 'phone', this.value)">
                <button class="remove-btn" onclick="Profile.removeContact('${c.id}')">✕</button>
            `;
            list.appendChild(card);
        });
    },

    async saveProfile() {
        const checkedRadio = Utils.$('input[name="msg-preset"]:checked');
        const nameInput = Utils.$('#user-name');
        const conditionInput = Utils.$('#user-condition');
        
        const profileData = {
            name: nameInput ? nameInput.value.trim() : '',
            condition: conditionInput ? conditionInput.value.trim() : '',
            blood: Utils.$('#user-blood')?.value || '',
            allergies: Utils.$('#user-allergies')?.value || '',
            contacts: this.contacts,
            message_preset: checkedRadio ? checkedRadio.value : 'sos',
            setup_completed: true
        };

        Utils.showToast('Syncing secure profile...', 'info');

        try {
            // ☁️ SYNC TO SUPABASE
            if (typeof supabase !== 'undefined' && supabase) {
                const user = await getCurrentUser();
                if (user) {
                    const { error } = await supabase
                        .from('profiles')
                        .upsert({
                            id: user.id,
                            email: user.email
                        });
                    
                    // 📡 SYNC INDIVIDUAL CONTACTS (as per user request)
                    for (const contact of profileData.contacts) {
                        await supabase
                            .from('contacts')
                            .upsert({
                                user_id: user.id,
                                name: contact.name,
                                phone: contact.phone
                            }); // Removed on_conflict to use default / id
                    }
                    
                    if (error) throw error;
                }
            }

            // 💾 LOCAL FALLBACK
            Utils.save('profile', profileData);
            Utils.showToast('Profile Secured Successfully', 'success');
            console.log('Profile created');
            this.showSummary(profileData);
        } catch (error) {
            console.warn('Auth not ready yet');
            Utils.showToast('Local Save Active (Cloud Sync Failed)', 'warning');
            Utils.save('profile', profileData);
            this.showSummary(profileData);
        }
    },

    async loadProfile() {
        // 1. Load Local First (Immediate UI)
        let p = Utils.get('profile');
        
        // 2. Try Fetching from Supabase (Cloud Truth)
        if (typeof supabase !== 'undefined' && supabase) {
            try {
                const user = await getCurrentUser();
                if (user) {
                    // ✅ Using .maybeSingle() to prevent 406 errors if row is missing
                    let { data, error } = await supabase
                        .from("profiles")
                        .select("*")
                        .eq("id", user.id)
                        .maybeSingle();

                    if (error) {
                    }
                    
                    // 🔄 AUTO-CREATE: If no profile exists, create a basic record
                    if (!data && !error) {
                        const { data: newProfile, error: createError } = await supabase
                            .from("profiles")
                            .insert([{ id: user.id, email: user.email }])
                            .select()
                            .maybeSingle();
                        
                        if (!createError) {
                            data = newProfile;
                        } else {
                            console.warn("Auth not ready yet");
                        }
                    }

                    if (data && !error) {
                        p = data;
                        Utils.save('profile', p); // Update local cache
                    }
                }
            } catch (e) {
                console.warn('SafeTap Profile: Load from cloud failed, using local.');
            }
        }

        if (p) {
            const nameInput = Utils.$('#user-name');
            const conditionInput = Utils.$('#user-condition');
            const bloodInput = Utils.$('#user-blood');
            const allergiesInput = Utils.$('#user-allergies');
            
            if (nameInput) nameInput.value = p.name || '';
            if (conditionInput) conditionInput.value = p.condition || '';
            if (bloodInput) bloodInput.value = p.blood || '';
            if (allergiesInput) allergiesInput.value = p.allergies || '';
            
            this.contacts = p.contacts || [];
            this.renderContacts();
            
            // Set message preset radio if exists
            if (p.message_preset) {
                const radio = Utils.$(`input[value="${p.message_preset}"]`);
                if (radio) {
                    radio.checked = true;
                    const card = radio.closest('.radio-card');
                    if (card) card.classList.add('selected');
                }
            }

            if (p.setup_completed) this.showSummary(p);
        } else {
            this.addContact();
        }
    },

    showSummary(p) {
        const namePrev = Utils.$('#preview-name');
        const condPrev = Utils.$('#preview-condition');
        const countPrev = Utils.$('#preview-contacts-count');
        const header = Utils.$('.profile-header');
        const summary = Utils.$('#profile-summary');
        
        if (namePrev) namePrev.textContent = p.name || 'Anonymous User';
        if (condPrev) condPrev.textContent = p.condition || 'No conditions listed';
        if (countPrev) countPrev.textContent = (p.contacts || []).length;
        
        if (header) header.classList.add('hidden');
        Utils.$$('.setup-step').forEach(s => s.classList.remove('active'));
        if (summary) summary.classList.remove('hidden');
        
        // Refresh Stats globally
        if (window.App) App.refreshStats();
    }
};
