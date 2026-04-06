/**
 * ProSpace Program Management Module (v2.7.0)
 * Handles all logic for program configuration, attributes, timelines, and settings.
 */

window.renderProgramDashboard = function(progId, activeTab = 'usulan') {
    const program = programs.find(p => String(p.id) === String(progId));
    if (!program) return renderDashboard();

    const dashboard = document.getElementById('program-dashboard');
    const mainView = document.getElementById('dashboard-view');
    mainView.style.display = 'none';
    dashboard.style.display = 'block';

    dashboard.innerHTML = `
        <div class="program-nav-wrapper">
            <div class="prog-header" style="display:flex; align-items:center; gap:2rem; margin-bottom:2rem; padding: 1.5rem 0; border-bottom: 1px solid var(--border);">
                <div class="program-icon" style="width:64px; height:64px; background:var(--primary-soft); border-radius:16px; display:flex; align-items:center; justify-content:center; color:var(--primary);">
                    <span class="material-symbols-outlined" style="font-size:32px;">${program.icon || 'rocket_launch'}</span>
                </div>
                <div>
                    <h1 style="font-family:'Outfit'; font-size:2.2rem; font-weight:900;">${program.name}</h1>
                    <p style="color:var(--text-muted);">${program.desc || ''}</p>
                </div>
            </div>

            <div class="tabs glass" style="display:flex; align-items:center; justify-content:space-between; padding: 0.5rem 1rem; border-radius:18px;">
                <div style="display:flex; gap:0.5rem; overflow-x:auto;">
                    <button class="tab-btn ${activeTab === 'usulan' ? 'active' : ''}" onclick="switchTab('usulan', '${progId}')"><span class="material-symbols-outlined">description</span> Usulan</button>
                    <button class="tab-btn ${activeTab === 'setting' ? 'active' : ''}" onclick="switchTab('setting', '${progId}')"><span class="material-symbols-outlined">settings</span> Pengaturan</button>
                </div>
                <button class="btn-primary" onclick="openProposalModal('${progId}')" style="padding:10px 20px; border-radius:12px;">+ Buat Usulan Baru</button>
            </div>
        </div>

        <div id="prog-tab-content" style="margin-top:2rem;"></div>
    `;

    window.switchTab(activeTab, progId);
};

window.switchTab = function(tab, progId) {
    const container = document.getElementById('prog-tab-content');
    const program = programs.find(p => String(p.id) === String(progId));
    
    document.querySelectorAll('.tab-btn').forEach(btn => {
        if (btn.innerText.toLowerCase().includes(tab)) btn.classList.add('active');
        else btn.classList.remove('active');
    });

    if (tab === 'usulan') {
        container.innerHTML = `<div id="proposal-list-container"></div>`;
        renderProposalsTable(progId);
    } else if (tab === 'setting') {
        renderProgramSettings(progId);
    }
};

window.renderProposalsTable = function(progId) {
    const container = document.getElementById('proposal-list-container');
    const filtered = (proposals || []).filter(p => String(p.programId) === String(progId));

    if (filtered.length === 0) {
        container.innerHTML = `<div class="glass" style="padding:4rem; text-align:center; color:var(--text-muted);">Belum ada usulan masuk.</div>`;
        return;
    }

    container.innerHTML = `
        <div class="glass" style="border-radius:24px; overflow:hidden;">
            <table style="width:100%; border-collapse:collapse;">
                <thead style="background:var(--background);">
                    <tr style="text-align:left;">
                        <th style="padding:1.5rem;">Judul Usulan</th>
                        <th style="padding:1.5rem;">Ketua</th>
                        <th style="padding:1.5rem;">Status</th>
                        <th style="padding:1.5rem;">Aksi</th>
                    </tr>
                </thead>
                <tbody>
                    ${filtered.map(p => `
                        <tr style="border-top:1px solid var(--border);">
                            <td style="padding:1.5rem; font-weight:800;">${p.title}</td>
                            <td style="padding:1.5rem;">${p.leader}</td>
                            <td style="padding:1.5rem;"><span class="status-badge">${p.status.toUpperCase()}</span></td>
                            <td style="padding:1.5rem;">
                                <button class="btn-secondary" onclick="viewProposalDetail('${p.id}')">LIHAT</button>
                            </td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>
    `;
};

window.renderProgramSettings = function(pId) {
    const container = document.getElementById('prog-tab-content');
    const program = programs.find(p => String(p.id) === String(pId));
    
    container.innerHTML = `
        <div class="glass" style="padding:2.5rem; border-radius:24px;">
            <div class="f-group">
                <label class="f-label">Nama Program</label>
                <input type="text" id="prog-set-name" class="f-input" value="${program.name}">
            </div>
            <div class="f-group" style="margin-top:1.5rem;">
                <label class="f-label">Deskripsi</label>
                <textarea id="prog-set-desc" class="f-input" rows="4">${program.desc || ''}</textarea>
            </div>
            <div style="margin-top:2rem; display:flex; justify-content:space-between; align-items:center;">
                <button class="btn-secondary" style="color:var(--error); border-color:var(--error);" onclick="deleteProgram('${pId}')">HAPUS PROGRAM PERMANEN</button>
                <button class="btn-primary" onclick="saveQuickSetting('${pId}')">SIMPAN PERUBAHAN</button>
            </div>
        </div>
    `;
};

window.openAddProgramModal = function() {
    const html = `
        <div class="f-group">
            <label class="f-label">Nama Program Baru</label>
            <input type="text" id="new-prog-name" class="f-input" placeholder="Misal: Hibah Unggulan 2026">
        </div>
        <div class="f-group" style="margin-top:1rem;">
            <label class="f-label">Deskripsi Program</label>
            <textarea id="new-prog-desc" class="f-input" rows="3"></textarea>
        </div>
        <div style="margin-top:2rem; display:flex; justify-content:flex-end;">
            <button class="btn-primary" onclick="saveNewProgram()">BUAT PROGRAM SEKARANG</button>
        </div>
    `;
    window.openModal("Tambah Program Baru", html);
};

window.saveNewProgram = async function() {
    const name = document.getElementById('new-prog-name').value;
    const desc = document.getElementById('new-prog-desc').value;
    if (!name) return alert("Nama program wajib diisi!");
    
    const newProg = { id: Date.now().toString(), name, desc, status: 'Archived', students: [], reviewers: [], files: [] };
    await window.fbSave('programs', newProg.id, newProg);
    window.closeModal();
    window.renderDashboard();
    showToast(`Program ${name} berhasil dibuat.`);
};

window.deleteProgram = async function(pId) {
    if (!confirm("Apakah Anda yakin ingin menghapus program ini selamanya? Seluruh data usulan terkait akan ikut terhapus.")) return;
    await window.fbDelete('programs', pId);
    showToast("Program telah dihapus.");
    window.switchMainView('program');
    window.renderDashboard();
};

window.saveQuickSetting = async function(pId) {
    const program = programs.find(p => String(p.id) === String(pId));
    program.name = document.getElementById('prog-set-name').value;
    program.desc = document.getElementById('prog-set-desc').value;
    
    await window.fbSave('programs', pId, program);
    showToast("Pengaturan disimpan!");
    renderDashboard();
    renderProgramDashboard(pId, 'setting');
};
