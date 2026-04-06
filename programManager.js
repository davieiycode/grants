/**
 * ProSpace Program Management Module (v2.6.9)
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
                <div class="program-icon" style="width:64px; height:64px;"><span class="material-symbols-outlined" style="font-size:32px;">${program.icon || 'rocket_launch'}</span></div>
                <div>
                    <h1 style="font-family:'Outfit'; font-size:2.2rem; font-weight:900;">${program.name}</h1>
                    <p style="color:var(--text-muted);">${program.desc || ''}</p>
                </div>
            </div>

            <div class="tabs glass" style="display:flex; align-items:center; justify-content:space-between; padding: 0.5rem 0.75rem;">
                <div style="display:flex; gap:0.5rem; overflow-x:auto;">
                    <button class="tab-btn ${activeTab === 'usulan' ? 'active' : ''}" onclick="switchTab('usulan', '${progId}')"><span class="material-symbols-outlined">description</span> Usulan</button>
                    <button class="tab-btn ${activeTab === 'periode' ? 'active' : ''}" onclick="switchTab('periode', '${progId}')"><span class="material-symbols-outlined">event_repeat</span> Periode</button>
                    <button class="tab-btn ${activeTab === 'setting' ? 'active' : ''}" onclick="switchTab('setting', '${progId}')"><span class="material-symbols-outlined">settings</span> Pengaturan</button>
                </div>
                <button class="btn-primary" onclick="openProposalModal('${progId}')"><span class="material-symbols-outlined">add_circle</span> Usulan Baru</button>
            </div>
        </div>

        <div id="prog-tab-content" style="margin-top:2rem;">
            <!-- Tab content dynamically here -->
        </div>
    `;

    window.switchTab(activeTab, progId);
};

window.switchTab = function(tab, progId) {
    const container = document.getElementById('prog-tab-content');
    const program = programs.find(p => String(p.id) === String(progId));
    
    // Update tab button styles
    document.querySelectorAll('.tab-btn').forEach(btn => {
        if (btn.innerText.toLowerCase().includes(tab)) btn.classList.add('active');
        else btn.classList.remove('active');
    });

    if (tab === 'usulan') {
        container.innerHTML = `<div id="proposal-list-container"></div>`;
        renderProposalsTable(progId);
    } else if (tab === 'setting') {
        container.innerHTML = `<div class="settings-container"><div class="settings-sidebar" id="prog-settings-sidebar"></div><div id="setting-sub-content" class="settings-content"></div></div>`;
        renderProgramSettings(progId);
    } else if (tab === 'periode') {
        container.innerHTML = `<div id="period-container"></div>`;
        renderPeriods(progId);
    }
};

window.renderProposalsTable = function(progId) {
    const container = document.getElementById('proposal-list-container');
    const filtered = proposals.filter(p => String(p.programId) === String(progId));

    if (filtered.length === 0) {
        container.innerHTML = `<div class="glass" style="padding:4rem; text-align:center; color:var(--text-muted);">Belum ada usulan masuk untuk program ini.</div>`;
        return;
    }

    container.innerHTML = `
        <div class="glass" style="border-radius:18px; overflow:hidden;">
            <table style="width:100%; border-collapse:collapse;">
                <thead style="background:var(--background);">
                    <tr style="text-align:left;">
                        <th style="padding:1.5rem;">JUDUL USULAN</th>
                        <th style="padding:1.5rem;">KETUA</th>
                        <th style="padding:1.5rem;">STATUS</th>
                        <th style="padding:1.5rem;">AKSI</th>
                    </tr>
                </thead>
                <tbody>
                    ${filtered.map(p => `
                        <tr style="border-top:1px solid var(--border); transition:all 0.2s;" onmouseover="this.style.background='rgba(0,0,0,0.01)'" onmouseout="this.style.background='transparent'">
                            <td style="padding:1.5rem; font-weight:750;">${p.title}</td>
                            <td style="padding:1.5rem; color:var(--text-muted);">${p.leader}</td>
                            <td style="padding:1.5rem;"><span class="status-badge">${p.status.toUpperCase()}</span></td>
                            <td style="padding:1.5rem;">
                                <button class="btn-secondary" onclick="viewProposalDetail('${p.id}')">LIHAT DETAIL</button>
                            </td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>
    `;
};

// ... logic setting dll tetap ada (fungsi-fungsi pendukung lainnya akan ditambahkan di sini) ...
