/**
 * ProSpace Proposal Management Module (v2.6.9)
 * Handles the detailed view of individual proposals, reviews, and scoring logic.
 */

window.viewProposalDetail = function(proposalId) {
    const proposal = proposals.find(p => String(p.id) === String(proposalId));
    if (!proposal) return showToast("Usulan tidak ditemukan!");

    // Switch view in index.html
    document.getElementById('dashboard-view').style.display = 'none';
    document.getElementById('program-dashboard').style.display = 'none';
    const detailContainer = document.getElementById('proposal-detail-view');
    detailContainer.style.display = 'block';

    detailContainer.innerHTML = `
        <div class="animate-fade-in">
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:2rem;">
                <button class="btn-secondary" onclick="backToProgram('${proposal.programId}')">
                    <span class="material-symbols-outlined">arrow_back</span> KEMBALI KE PROGRAM
                </button>
                <div style="display:flex; gap:1rem;">
                   <button class="btn-secondary" onclick="exportProposalPDF('${proposal.id}')"><span class="material-symbols-outlined">description</span> PDF</button>
                   <span class="status-badge" style="background:var(--primary-soft); color:var(--primary); padding:10px 20px; font-size:1rem;">${proposal.status.toUpperCase()}</span>
                </div>
            </div>

            <div class="grid-cols-3" style="gap:2rem;">
                <!-- Main Info (Left 2 cols) -->
                <div style="grid-column: span 2; display:flex; flex-direction:column; gap:2rem;">
                    <div class="glass" style="padding:2.5rem;">
                        <h1 style="font-family:'Playfair Display'; font-size:2.2rem; margin-bottom:1rem;">${proposal.title}</h1>
                        <div style="display:flex; gap:2rem; color:var(--text-muted); font-size:0.9rem;">
                            <div style="display:flex; align-items:center; gap:8px;"><span class="material-symbols-outlined">person</span> ${proposal.leader}</div>
                            <div style="display:flex; align-items:center; gap:8px;"><span class="material-symbols-outlined">calendar_today</span> Diajukan: ${new Date(proposal.submittedAt || proposal.id).toLocaleDateString('id-ID')}</div>
                            <div style="display:flex; align-items:center; gap:8px;"><span class="material-symbols-outlined">account_balance</span> ${proposal.unit || '-'}</div>
                        </div>
                    </div>

                    <div class="glass" style="padding:2rem;">
                        <h3 style="margin-bottom:1.5rem; display:flex; align-items:center; gap:10px;">
                            <span class="material-symbols-outlined" style="color:var(--primary);">subject</span> Ringkasan Usulan
                        </h3>
                        <div style="color:var(--text-main); line-height:1.8; font-size:1rem;">
                            ${proposal.summary || 'Tidak ada ringkasan tersedia.'}
                        </div>
                    </div>
                    
                    <div id="review-section-container">
                        ${renderReviewSection(proposal)}
                    </div>
                </div>

                <!-- Sidebar (Right 1 col) -->
                <div style="display:flex; flex-direction:column; gap:2rem;">
                    <div class="glass" style="padding:1.5rem;">
                         <h4 style="margin-bottom:1rem;">Kelola Status</h4>
                         <select class="f-input" onchange="updateProposalStatus('${proposal.id}', this.value)" style="margin-bottom:1rem;">
                             <option value="submitted" ${proposal.status === 'submitted' ? 'selected' : ''}>Submisi Baru</option>
                             <option value="screening" ${proposal.status === 'screening' ? 'selected' : ''}>Internal Screening</option>
                             <option value="review" ${proposal.status === 'review' ? 'selected' : ''}>Review Pakar</option>
                             <option value="approved" ${proposal.status === 'approved' ? 'selected' : ''}>Diterima / Lolos</option>
                             <option value="rejected" ${proposal.status === 'rejected' ? 'selected' : ''}>Ditolak</option>
                         </select>
                         <button class="btn-primary" style="width:100%;" onclick="saveStatusChange('${proposal.id}')">Update Status</button>
                    </div>

                    <div class="glass" style="padding:1.5rem;">
                        <h4 style="margin-bottom:1rem;">Berkas Lampiran</h4>
                        <div style="display:flex; flex-direction:column; gap:10px;">
                            ${(proposal.files || []).map(f => `
                                <a href="${f.url}" target="_blank" class="glass-btn" style="text-decoration:none; display:flex; align-items:center; gap:10px; padding:12px; border-radius:12px;">
                                    <span class="material-symbols-outlined">attachment</span>
                                    <span style="font-size:0.85rem; font-weight:700;">${f.name}</span>
                                </a>
                            `).join('')}
                            ${(!proposal.files || proposal.files.length === 0) ? '<p style="color:var(--text-muted); font-size:0.8rem;">Tidak ada berkas.</p>' : ''}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
};

function renderReviewSection(proposal) {
    return `
        <div class="glass" style="padding:2rem;">
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:2rem;">
                <h3 style="display:flex; align-items:center; gap:10px;">
                    <span class="material-symbols-outlined" style="color:var(--primary);">rate_review</span> Penilaian & Review
                </h3>
                <div style="font-size:1.5rem; font-weight:900; color:var(--secondary);">Skor: ${proposal.totalScore || 0}</div>
            </div>
            
            <div id="review-list">
                <!-- Logic to render individual reviewer results -->
                <p style="color:var(--text-muted); italic;">Belum ada penilaian masuk.</p>
            </div>
        </div>
    `;
}

window.backToProgram = function(programId) {
    document.getElementById('proposal-detail-view').style.display = 'none';
    window.renderProgramDashboard(programId);
};

window.updateProposalStatus = function(id, status) {
    // Current state management inside the view
    console.log("Status changed to", status);
};

window.saveStatusChange = async function(id) {
    const status = document.querySelector('#proposal-detail-view select').value;
    const proposal = proposals.find(p => String(p.id) === String(id));
    if (proposal) {
        proposal.status = status;
        await window.fbSave('proposals', id, proposal);
        showToast(`Status usulan diperbarui ke ${status}`);
    }
};
