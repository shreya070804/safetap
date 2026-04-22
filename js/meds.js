
const Meds = {
    init() {
        this.setupEventListeners();
    },

    setupEventListeners() {
        const btnAdd = document.getElementById('btn-add-med');
        const btnSave = document.getElementById('btn-save-med');
        const btnCancel = document.getElementById('btn-cancel-med');

        if (btnAdd) btnAdd.onclick = () => this.toggleForm(true);
        if (btnCancel) btnCancel.onclick = () => this.toggleForm(false);
        if (btnSave) btnSave.onclick = () => this.saveMed();
    },

    toggleForm(show) {
        const form = document.getElementById('meds-form-container');
        if (form) {
            if (show) {
                form.classList.remove('hidden');
            } else {
                form.classList.add('hidden');
                this.clearForm();
            }
        }
    },

    clearForm() {
        document.getElementById('med-name').value = '';
        document.getElementById('med-dosage').value = '';
        document.getElementById('med-time').value = '';
    },

    saveMed() {
        const name = document.getElementById('med-name').value.trim();
        const dosage = document.getElementById('med-dosage').value.trim();
        const time = document.getElementById('med-time').value.trim();

        if (!name || !time) {
            Utils.showToast('Name and Time are required', 'danger');
            return;
        }

        const medsList = Utils.get('meds') || [];
        medsList.push({
            id: Utils.uid(),
            name,
            dosage,
            time,
            takenLast: null
        });

        Utils.save('meds', medsList);
        this.toggleForm(false);
        this.renderMeds();
        Utils.showToast('Medication added', 'success');
    },

    deleteMed(id) {
        if (!confirm('Remove this medication?')) return;
        let medsList = Utils.get('meds') || [];
        medsList = medsList.filter(m => m.id !== id);
        Utils.save('meds', medsList);
        this.renderMeds();
        Utils.showToast('Medication removed', 'info');
    },

    takeMed(id) {
        let medsList = Utils.get('meds') || [];
        const idx = medsList.findIndex(m => m.id === id);
        if (idx !== -1) {
            medsList[idx].takenLast = Date.now();
            Utils.save('meds', medsList);
            this.renderMeds();
            Utils.showToast(`${medsList[idx].name} marked as taken!`, 'success');
        }
    },

    renderMeds() {
        const container = document.getElementById('active-meds-list');
        if (!container) return;

        const medsList = Utils.get('meds') || [];
        
        if (medsList.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-pills"></i>
                    <p>No active medications.</p>
                </div>`;
            return;
        }

        medsList.sort((a, b) => a.time.localeCompare(b.time));

        container.innerHTML = medsList.map(m => {
            const isTaken = m.takenLast && new Date(m.takenLast).toDateString() === new Date().toDateString();
            
            return `
                <div class="med-card" style="background: var(--bg-dark); padding: 1.25rem; border-radius: var(--radius-md); border: 1px solid var(--border); border-left: 6px solid ${isTaken ? 'var(--success-green)' : 'var(--secondary-blue)'}; display: flex; justify-content: space-between; align-items: center; opacity: ${isTaken ? '0.75' : '1'}; transition: all 0.2s;">
                    <div class="med-info">
                        <h4 style="font-size: 1.25rem; margin-bottom: 0.25rem; font-weight: 800; ${isTaken ? 'text-decoration: line-through; color: var(--text-gray);' : 'color: white;'}">${m.name}</h4>
                        <p style="color: var(--text-gray); font-size: 0.95rem; font-weight: 600;"><i class="far fa-clock"></i> ${m.time} &nbsp;&bull;&nbsp; ${m.dosage || 'No dosage specified'}</p>
                    </div>
                    <div class="med-actions" style="display: flex; gap: 0.75rem; align-items: center;">
                        ${!isTaken ? `
                        <button onclick="Meds.takeMed('${m.id}')" style="background: var(--success-green); color: white; border: none; padding: 0.75rem 1.25rem; border-radius: 8px; font-weight: 900; cursor: pointer; transition: transform 0.2s; box-shadow: 0 4px 15px rgba(16, 185, 129, 0.3);">
                            <i class="fas fa-check"></i> Take
                        </button>
                        ` : `
                        <button disabled style="background: rgba(16, 185, 129, 0.1); color: var(--success-green); border: 1px solid var(--success-green); padding: 0.75rem 1.25rem; border-radius: 8px; font-weight: 900;">
                            Done
                        </button>
                        `}
                        <button onclick="Meds.deleteMed('${m.id}')" style="background: transparent; color: var(--text-muted); border: none; padding: 0.75rem; border-radius: 8px; cursor: pointer; font-size: 1.2rem;">
                            <i class="fas fa-trash-can"></i>
                        </button>
                    </div>
                </div>
            `;
        }).join('');
    }
};
