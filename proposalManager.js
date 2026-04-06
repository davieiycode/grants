/**
 * ProSpace Proposal Management Module (v2.7.0)
 * Handles detailed proposal views, scoring, reviewer assignments, and status lifecycle.
 */

window.viewProposalDetail = function(proposalId) {
    const proposal = proposals.find(p => String(p.id) === String(proposalId));
    if (!proposal) return showToast("Usulan tidak ditemukan!");

    const program = programs.find(pg => String(pg.id) === String(proposal.programId));
    const container = document.getElementById('proposal-detail-view');
    const mainView = document.getElementById('dashboard-view');
    const progView = document.getElementById('program-dashboard');
    
    mainView.style.display = 'none';
    progView.style.display = 'none';
    container.style.display = 'block';

    container.innerHTML = `
        <div class="header-row" style="display:flex; justify-content:space-between; align-items:center; margin-bottom:2rem;">
            <button class="btn-secondary" onclick="renderProgramDashboard('${proposal.programId}')" style="display:flex; align-items:center; gap:8px;">
                <span class="material-symbols-outlined">arrow_back</span> Kembali ke Program
            </button>
            <div class="status-badge" style="font-size:1rem; padding:8px 20px;">${proposal.status.toUpperCase()}</div>
        </div>

        <div style="display:grid; grid-template-columns: 350px 1fr; gap:2.5rem;">
            <!-- Profil Singkat -->
            <div class="glass" style="padding:2.5rem; border-radius:24px; height:fit-content; position:sticky; top:100px;">
                <div class="group-header"><span class="material-symbols-outlined">person</span> Informasi Pengusul</div>
                <div style="text-align:center; margin:1.5rem 0;">
                    <div style="width:80px; height:80px; border-radius:20px; background:var(--primary-soft); color:var(--primary); display:flex; align-items:center; justify-content:center; margin:0 auto 1rem;">
                        <span class="material-symbols-outlined" style="font-size:40px;">person</span>
                    </div>
                    <h3 style="font-family:'Outfit'; font-size:1.4rem; font-weight:800;">${proposal.leader}</h3>
                    <p style="color:var(--text-muted); font-size:0.9rem;">${proposal.unit || 'Unit Belum Terdaftar'}</p>
                </div>
                <hr style="border:none; border-top:1px solid var(--border); margin:1.5rem 0;">
                <div class="f-group">
                    <label class="info-label">E-MAIL</label>
                    <div class="info-value" style="font-size:0.85rem;">${proposal.email || '-'}</div>
                </div>
                <div class="f-group" style="margin-top:1rem;">
                    <label class="info-label">TANGGAL SUBMISI</label>
                    <div class="info-value" style="font-size:0.85rem;">${proposal.date || '-'}</div>
                </div>
            </div>

            <!-- Konten Utama (Tabs) -->
            <div class="glass" style="padding:0; border-radius:24px; overflow:hidden;">
                <div class="tabs" style="background:var(--background); padding:0 2rem; border-bottom:1px solid var(--border); display:flex; gap:1.5rem;">
                    <button class="tab-btn active" onclick="switchProposalTab('content', '${proposalId}', this)">Submisi & Berkas</button>
                    <button class="tab-btn" onclick="switchProposalTab('reviews', '${proposalId}', this)">Penilaian Reviewer</button>
                    <button class="tab-btn" onclick="switchProposalTab('logs', '${proposalId}', this)">Histori & Log</button>
                </div>
                <div id="proposal-tab-content" style="padding:2.5rem;"></div>
            </div>
        </div>
    `;

    window.switchProposalTab('content', proposalId);
};

window.switchProposalTab = function(tab, pId, btn) {
    const proposal = proposals.find(p => String(p.id) === String(pId));
    const container = document.getElementById('proposal-tab-content');
    
    if (btn) {
        document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
    }

    if (tab === 'content') {
        container.innerHTML = `
            <div class="animate-fade-in">
                <h2 style="font-family:'Outfit'; font-size:1.8rem; font-weight:900; margin-bottom:1rem;">${proposal.title}</h2>
                <div class="glass" style="padding:2rem; background:rgba(255,255,255,0.4); border-radius:16px;">
                    <div class="group-header"><span class="material-symbols-outlined">attachment</span> Berkas Lampiran</div>
                    <div style="display:grid; grid-template-columns:1fr 1fr; gap:1rem; margin-top:1rem;">
                        ${(proposal.files || []).map(f => `
                            <div class="glass" style="padding:1rem; display:flex; align-items:center; gap:12px; border-radius:12px;">
                                <span class="material-symbols-outlined" style="color:var(--primary);">description</span>
                                <div style="flex:1;">
                                    <div style="font-weight:700; font-size:0.85rem;">${f.name}</div>
                                    <div style="font-size:0.7rem; color:var(--text-muted);">${f.size || 'N/A'}</div>
                                </div>
                                <button class="btn-icon" style="background:var(--primary-soft); color:var(--primary);"><span class="material-symbols-outlined">download</span></button>
                            </div>
                        `).join('') || '<p style="color:var(--text-muted);">Tidak ada berkas terlampir.</p>'}
                    </div>
                </div>
            </div>
        `;
    } else if (tab === 'reviews') {
        renderProposalReviews(proposal);
    } else if (tab === 'logs') {
        container.innerHTML = `<div class="glass" style="padding:3rem; text-align:center; color:var(--text-muted);">Fitur log aktivitas usulan sedang dimuat...</div>`;
    }
};

function renderProposalReviews(proposal) {
    const container = document.getElementById('proposal-tab-content');
    const reviews = proposal.reviews || [];
    const assignments = proposal.assignments || [];

    container.innerHTML = `
        <div class="animate-fade-in">
            <!-- Penugasan Aktif -->
            ${assignments.length > 0 ? `
                <div style="margin-bottom:2.5rem;">
                    <div class="group-header"><span class="material-symbols-outlined">pending_actions</span> Penugasan Reviewer (Pending)</div>
                    <div style="display:flex; flex-direction:column; gap:12px; margin-top:1rem;">
                        ${assignments.map(as => `
                            <div class="glass" style="padding:1.25rem 2rem; border-radius:16px; border:1px solid var(--primary-soft); background:rgba(99,102,241,0.02); display:flex; justify-content:space-between; align-items:center;">
                                <div style="display:flex; align-items:center; gap:1rem;">
                                    <div style="width:40px; height:40px; border-radius:10px; background:var(--primary-soft); color:var(--primary); display:flex; align-items:center; justify-content:center; font-weight:800;">${as.reviewer[0]}</div>
                                    <div>
                                        <div style="font-weight:800; font-size:1rem;">${as.reviewer}</div>
                                        <div style="font-size:0.75rem; color:var(--text-muted);">Tenggat: <strong style="color:var(--primary);">${as.dueDate}</strong></div>
                                    </div>
                                </div>
                                <button class="btn-primary" onclick="openScoringModal('${proposal.id}', '${as.reviewer}')" style="padding:8px 16px; font-size:0.8rem; border-radius:10px;">ISI PENILAIAN</button>
                            </div>
                        `).join('')}
                    </div>
                </div>
            ` : ''}

            <!-- Hasil Review Selesai -->
            <div class="group-header"><span class="material-symbols-outlined">task_alt</span> Hasil Review Selesai</div>
            ${reviews.length === 0 ? `
                <div style="text-align:center; padding:4rem; color:var(--text-muted); border:1px dashed var(--border); border-radius:24px; margin-top:1rem;">Belum ada review yang diselesaikan.</div>
            ` : `
                <div style="display:flex; flex-direction:column; gap:1.5rem; margin-top:1rem;">
                    ${reviews.map(rev => {
                        const score = calculateTotalScore(rev);
                        return `
                            <div class="glass animate-fade-in" style="padding:2rem; border-radius:20px; position:relative;">
                                <div style="position:absolute; top:2rem; right:2rem; background:var(--primary); color:white; padding:8px 16px; border-radius:12px; font-weight:900; font-size:1.4rem;">${score.toFixed(1)}</div>
                                <div style="font-weight:800; font-size:1.1rem; color:var(--text-main);">${rev.reviewer}</div>
                                <div style="font-size:0.75rem; color:var(--text-muted);">${rev.date}</div>
                                <div style="margin-top:1.5rem; display:flex; flex-direction:column; gap:8px;">
                                    ${rev.items.map(it => `
                                        <div style="display:flex; justify-content:space-between; font-size:0.85rem;">
                                            <span style="color:var(--text-muted);">${it.label}</span>
                                            <span style="font-weight:700;">${it.value}</span>
                                        </div>
                                    `).join('')}
                                </div>
                                <div style="margin-top:1rem; padding-top:1rem; border-top:1px dashed var(--border); font-style:italic; font-size:0.85rem; color:var(--text-main);">
                                    "${rev.comment || 'Tidak ada komentar tambahan.'}"
                                </div>
                            </div>
                        `;
                    }).join('')}
                </div>
            `}
        </div>
    `;
}

function calculateTotalScore(rev) {
    if (!rev.items) return 0;
    return rev.items.reduce((sum, it) => {
        const val = parseFloat(it.value) || 0;
        const weight = parseFloat(it.weight || 10) / 100;
        return sum + (val * weight);
    }, 0);
}

window.openScoringModal = function(pId, reviewer) {
    const proposal = proposals.find(p => String(p.id) === String(pId));
    const program = programs.find(pg => String(pg.id) === String(proposal.programId));
    
    // Use attributes from program configuration that are type "Review" or similar
    const criteria = program.criteria || [
        { label: 'Originalitas Kebaruan', weight: 30 },
        { label: 'Kesesuaian Metodologi', weight: 40 },
        { label: 'Potensi Dampak', weight: 30 }
    ];

    const html = `
        <div style="display:flex; flex-direction:column; gap:1.5rem;">
            <p style="color:var(--text-muted); font-size:0.9rem;">Memberikan penilaian untuk usulan: <strong>${proposal.title}</strong></p>
            ${criteria.map((c, i) => `
                <div class="f-group">
                    <label class="f-label">${c.label} (Bobot: ${c.weight}%)</label>
                    <input type="number" id="score-val-${i}" class="f-input" placeholder="Skor 0-100" min="0" max="100">
                    <input type="hidden" id="score-label-${i}" value="${c.label}">
                    <input type="hidden" id="score-weight-${i}" value="${c.weight}">
                </div>
            `).join('')}
            <div class="f-group">
                <label class="f-label">Komentar Rekomendasi</label>
                <textarea id="score-comment" class="f-input" rows="3"></textarea>
            </div>
            <div style="display:flex; justify-content:flex-end; gap:12px; margin-top:1rem;">
                <button class="btn-secondary" onclick="closeModal()">BATAL</button>
                <button class="btn-primary" onclick="submitReview('${pId}', '${reviewer}', ${criteria.length})">SIMPAN PENILAIAN</button>
            </div>
        </div>
    `;
    window.openModal(`Scoring: ${reviewer}`, html);
};

window.submitReview = async function(pId, reviewer, itemCount) {
    const proposal = proposals.find(p => String(p.id) === String(pId));
    const items = [];
    for (let i = 0; i < itemCount; i++) {
        items.push({
            label: document.getElementById(`score-label-${i}`).value,
            value: document.getElementById(`score-val-${i}`).value,
            weight: document.getElementById(`score-weight-${i}`).value
        });
    }
    const comment = document.getElementById('score-comment').value;
    const newReview = { reviewer, date: new Date().toLocaleDateString(), items, comment };
    
    if (!proposal.reviews) proposal.reviews = [];
    proposal.reviews.push(newReview);
    
    // Remove from assignments
    proposal.assignments = proposal.assignments.filter(as => as.reviewer !== reviewer);
    
    await window.fbSave('proposals', pId, proposal);
    window.closeModal();
    window.viewProposalDetail(pId);
    showToast("Penilaian berhasil disimpan!");
};
