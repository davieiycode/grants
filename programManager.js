/**
 * ProSpace Program Management Module (v2.7.0)
 * Handles all logic for program configuration, custom attributes, timelines, and reviewers.
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
                    <div style="display:flex; align-items:center; gap:12px;">
                        <h1 style="font-family:'Outfit'; font-size:2.2rem; font-weight:900;">${program.name}</h1>
                        <span class="status-badge" style="background:var(--secondary-soft); color:var(--secondary);">${program.status.toUpperCase()}</span>
                    </div>
                    <p style="color:var(--text-muted); font-size:1.1rem; margin-top:4px;">${program.desc || 'Deskripsi program belum diatur.'}</p>
                </div>
            </div>

            <div class="tabs glass" style="display:flex; align-items:center; justify-content:space-between; padding: 0.5rem 1rem; border-radius:18px;">
                <div style="display:flex; gap:0.5rem; overflow-x:auto;">
                    <button class="tab-btn ${activeTab === 'usulan' ? 'active' : ''}" onclick="switchTab('usulan', '${progId}')"><span class="material-symbols-outlined">description</span> Daftar Usulan</button>
                    <button class="tab-btn ${activeTab === 'settings' ? 'active' : ''}" onclick="switchTab('settings', '${progId}')"><span class="material-symbols-outlined">tune</span> Konfigurasi Skema</button>
                    <button class="tab-btn ${activeTab === 'timeline' ? 'active' : ''}" onclick="switchTab('timeline', '${progId}')"><span class="material-symbols-outlined">history</span> Linimasa & Tahapan</button>
                </div>
                <button class="btn-primary" onclick="openProposalModal('${progId}')" style="padding:10px 24px; border-radius:12px; font-weight:800;">+ Entri Usulan</button>
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
        renderProposalsTable(progId);
    } else if (tab === 'settings') {
        renderFullProgramSettings(progId);
    } else if (tab === 'timeline') {
        container.innerHTML = `<div class="glass" style="padding:4rem; text-align:center; color:var(--text-muted); border-radius:32px;">Fitur Manajemen Linimasa sedang diperbarui.</div>`;
    }
};

window.renderFullProgramSettings = function(pId) {
    const container = document.getElementById('prog-tab-content');
    const p = programs.find(pg => String(pg.id) === String(pId));
    
    container.innerHTML = `
        <div style="display:grid; grid-template-columns: 280px 1fr; gap:2.5rem;">
            <!-- Sidebar Pengaturan -->
            <div class="glass" style="padding:1.5rem; border-radius:24px; height:fit-content; position:sticky; top:100px;">
                <div style="display:flex; flex-direction:column; gap:8px;">
                    <button class="btn-secondary active" style="justify-content:flex-start; height:48px;" onclick="scrollToSection('info-dasar')">Informasi Dasar</button>
                    <button class="btn-secondary" style="justify-content:flex-start; height:48px;" onclick="scrollToSection('atribut-form')">Atribut Formulir</button>
                    <button class="btn-secondary" style="justify-content:flex-start; height:48px;" onclick="scrollToSection('skoring-review')">Kriteria Reviewer</button>
                    <hr style="border:none; border-top:1px solid var(--border); margin:12px 0;">
                    <button class="btn-secondary" style="justify-content:flex-start; height:48px; color:var(--error); border-color:var(--error);" onclick="deleteProgram('${pId}')">Hapus Program</button>
                </div>
            </div>

            <!-- Konten Pengaturan -->
            <div style="display:flex; flex-direction:column; gap:2.5rem;">
                <section id="info-dasar" class="glass" style="padding:3rem; border-radius:32px;">
                    <div class="group-header" style="margin-bottom:2rem;"><span class="material-symbols-outlined">info</span> Informasi Utama Program</div>
                    <div class="f-group">
                        <label class="f-label">Nama Program Penelitian/Hibah</label>
                        <input type="text" id="prog-edit-name" class="f-input" value="${p.name}">
                    </div>
                    <div class="f-group" style="margin-top:1.5rem;">
                        <label class="f-label">Deskripsi & Tujuan</label>
                        <textarea id="prog-edit-desc" class="f-input" rows="4">${p.desc || ''}</textarea>
                    </div>
                    <div style="margin-top:2rem; display:flex; justify-content:flex-end;">
                        <button class="btn-primary" onclick="saveProgramInfo('${pId}')">SIMPAN INFORMASI DASAR</button>
                    </div>
                </section>

                <section id="atribut-form" class="glass" style="padding:3rem; border-radius:32px;">
                    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:2rem;">
                        <div class="group-header" style="margin:0;"><span class="material-symbols-outlined">list_alt</span> Atribut Formulir Pendaftaran</div>
                        <button class="btn-primary" style="padding:8px 16px; border-radius:10px; font-size:0.85rem;" onclick="openAddAttributeModal('${pId}')">+ Tambah Field</button>
                    </div>
                    <div id="attribute-list" style="display:flex; flex-direction:column; gap:12px;">
                        ${(p.attributes || []).map((attr, idx) => `
                            <div class="glass" style="padding:1.25rem 1.5rem; background:rgba(255,255,255,0.4); border-radius:16px; display:flex; justify-content:space-between; align-items:center;">
                                <div style="display:flex; align-items:center; gap:1.25rem;">
                                    <span class="material-symbols-outlined" style="cursor:grab; color:var(--text-muted);">drag_indicator</span>
                                    <div>
                                        <div style="font-weight:800; font-size:1.05rem;">${attr.label}</div>
                                        <div style="font-size:0.75rem; color:var(--text-muted); text-transform:uppercase;">Tipe: ${attr.type} | Group: ${attr.group || 'Umum'}</div>
                                    </div>
                                </div>
                                <div style="display:flex; gap:8px;">
                                    <button class="btn-icon" onclick="deleteAttribute('${pId}', ${idx})"><span class="material-symbols-outlined" style="color:var(--error);">delete</span></button>
                                </div>
                            </div>
                        `).join('') || '<p style="text-align:center; color:var(--text-muted); padding:2rem;">Belum ada atribut kustom ditambahkan.</p>'}
                    </div>
                </section>

                <section id="skoring-review" class="glass" style="padding:3rem; border-radius:32px;">
                    <div class="group-header" style="margin-bottom:2rem;"><span class="material-symbols-outlined">rate_review</span> Kriteria Penilaian Pack (Reviewer)</div>
                    <div style="text-align:center; padding:2rem; color:var(--text-muted);">Gunakan menu ini untuk mengatur bobot nilai tiap kriteria evaluasi (Skala 0-100).</div>
                </section>
            </div>
        </div>
    `;
};

window.openAddAttributeModal = function(pId) {
    const html = `
        <div class="f-group">
            <label class="f-label">Label Field (Pertanyaan)</label>
            <input type="text" id="new-attr-label" class="f-input" placeholder="Misal: Nomor Induk Pegawai">
        </div>
        <div class="f-group" style="margin-top:1rem;">
            <label class="f-label">Tipe Data</label>
            <select id="new-attr-type" class="f-input">
                <option value="text">Satu Baris Teks</option>
                <option value="textarea">Beberapa Baris Teks (Páragraf)</option>
                <option value="file">Unggah Berkas (PDF/IMG)</option>
                <option value="number">Angka / Nominal</option>
            </select>
        </div>
        <div style="margin-top:2rem; display:flex; justify-content:flex-end;">
            <button class="btn-primary" onclick="saveNewAttribute('${pId}')">TAMBAH FIELD KE FORMULIR</button>
        </div>
    `;
    window.openModal("Tambah Atribut Formulir", html);
};

window.saveNewAttribute = async function(pId) {
    const label = document.getElementById('new-attr-label').value;
    const type = document.getElementById('new-attr-type').value;
    if (!label) return alert("Label wajib diisi!");

    const program = programs.find(p => String(p.id) === String(pId));
    if (!program.attributes) program.attributes = [];
    program.attributes.push({ label, type, group: 'Kustom' });
    
    await window.fbSave('programs', pId, program);
    window.closeModal();
    renderFullProgramSettings(pId);
    showToast("Atribut baru ditambahkan ke skema program.");
};

window.deleteAttribute = async function(pId, idx) {
    if (!confirm("Hapus atribut ini dari formulir? Data usulan yang sudah masuk akan kehilangan nilai field ini.")) return;
    const program = programs.find(p => String(p.id) === String(pId));
    program.attributes.splice(idx, 1);
    await window.fbSave('programs', pId, program);
    renderFullProgramSettings(pId);
    showToast("Atribut dihapus.");
};

window.saveProgramInfo = async function(pId) {
    const program = programs.find(p => String(p.id) === String(pId));
    program.name = document.getElementById('prog-edit-name').value;
    program.desc = document.getElementById('prog-edit-desc').value;
    
    await window.fbSave('programs', pId, program);
    window.renderDashboard();
    renderProgramDashboard(pId, 'settings');
    showToast("Informasi program diperbarui!");
};

// ... Internal helper for scrolling ...
window.scrollToSection = (id) => {
    document.getElementById(id).scrollIntoView({ behavior: 'smooth' });
    document.querySelectorAll('.btn-secondary').forEach(b => {
        if (b.innerText.toLowerCase().includes(id.split('-')[0])) b.classList.add('active');
        else b.classList.remove('active');
    });
};
