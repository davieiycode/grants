/**
 * ProSpace User Management Module (v2.6.9)
 * Handles user registration, administrative roles, and the dynamic permission matrix.
 */

window.renderUsers = function() {
    const container = document.getElementById('view-users');
    container.innerHTML = `
        <div class="glass animate-fade-in" style="padding:2rem;">
        <div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:2rem;">
            <div>
                <h2 style="font-family:'Playfair Display'; font-size:1.8rem; font-weight:700; color:var(--text-main); margin-bottom:0.1rem;">Daftar Anggota Aktif</h2>
                <p style="color:var(--text-muted); font-size:0.9rem;">Kelola seluruh pengguna yang terdaftar dalam sistem.</p>
            </div>
            <div style="display:flex; gap:12px;">
                <div class="glass" style="display:flex; align-items:center; padding:0 12px; border-radius:10px; border:1px solid var(--border); background:var(--background);">
                    <span class="material-symbols-outlined" style="font-size:18px; color:var(--text-muted);">search</span>
                    <input type="text" placeholder="Cari user..." style="border:none; background:transparent; padding:8px; font-size:0.85rem; width:200px; outline:none; color:var(--text-main);" onkeyup="filterUsers(this.value)">
                </div>
                <button class="btn-primary" onclick="openAddUserModal()" style="height:40px; padding:0 18px; border-radius:10px; font-weight:800; font-size:0.85rem;">Tambah User</button>
            </div>
        </div>
            
            <div class="main-tabs" style="margin-bottom:2rem;">
                <div class="tab-item active" onclick="switchGlobalUserSubTab('all-users', this)">Daftar Pengguna</div>
                <div class="tab-item" onclick="switchGlobalUserSubTab('permissions-matrix', this)">Matriks Izin Akses</div>
                <div class="tab-item" onclick="switchGlobalUserSubTab('blacklist-global', this)">Daftar Cekal</div>
            </div>

            <div id="global-user-content">
                <!-- Content will be rendered here -->
            </div>
        </div>
    `;
    window.switchGlobalUserSubTab('all-users');
};

window.switchGlobalUserSubTab = function(sub, el) {
    if (el) {
        document.querySelectorAll('.main-tabs .tab-item').forEach(t => t.classList.remove('active'));
        el.classList.add('active');
    }

    const container = document.getElementById('global-user-content');
    if (sub === 'all-users') {
        renderAllUsersList(container);
    } else if (sub === 'permissions-matrix') {
        renderPermissionsMatrix(container);
    } else if (sub === 'blacklist-global') {
        renderBlacklistList(container);
    }
};

function renderAllUsersList(container) {
    container.innerHTML = `
        <div class="f-group" style="margin-bottom:1.5rem; max-width:400px;">
            <div style="position:relative; display:flex; align-items:center;">
                <span class="material-symbols-outlined" style="position:absolute; left:12px; color:var(--text-muted);">search</span>
                <input type="text" placeholder="Cari nama, email, atau unit..." class="f-input" style="padding-left:40px; height:44px; border-radius:12px;" onkeyup="filterUserList(this.value)">
            </div>
        </div>
        <div class="glass" style="overflow:hidden; border-radius:16px; border:1px solid var(--border);">
            <table class="data-table">
                <thead>
                    <tr>
                        <th>Personel</th>
                        <th>Unit / Departemen</th>
                        <th>Peran & Akses</th>
                        <th style="text-align:center;">Status</th>
                        <th style="text-align:right;">Aksi</th>
                    </tr>
                </thead>
                <tbody id="user-list-tbody">
                    ${registeredUsers.map(u => renderUserRow(u)).join('')}
                </tbody>
            </table>
        </div>
    `;
}

function renderPermissionsMatrix(container) {
    const features = [
       { id: 'create_program', label: 'Buat & Hapus Program' },
       { id: 'manage_settings', label: 'Konfigurasi Program' },
       { id: 'manage_team', label: 'Kelola Tim Pengelola' },
       { id: 'manage_reviewers', label: 'Penugasan Reviewer' },
       { id: 'manage_proposals', label: 'Internal Review (Skrining)' },
       { id: 'manage_users', label: 'Manajemen Pengguna global' },
       { id: 'view_logs', label: 'Lihat Jejak Audit (Log)' },
       { id: 'delete_logs', label: 'Hapus Log Aktivitas' },
       { id: 'import_export_data', label: 'Ekspor/Impor Data Excel' }
    ];

    const roles = Object.keys(defaultPermissions);

    container.innerHTML = `
        <div class="glass" style="padding:1.5rem; border-radius:16px; border:1px solid var(--border); overflow-x:auto;">
            <table class="permission-table">
                <thead>
                    <tr>
                        <th style="min-width:260px; text-align:left;">Fitur Keamanan</th>
                        ${roles.map(r => `<th style="text-align:center; min-width:120px; font-weight:850; letter-spacing:0.025em;">${r.toUpperCase()}</th>`).join('')}
                    </tr>
                </thead>
                <tbody>
                    ${features.map(f => `
                        <tr>
                            <td style="font-weight:700; color:var(--text-main); font-size:0.85rem;">${f.label}</td>
                            ${roles.map(r => {
                                const val = (globalPermissions[r] || {})[f.id] || 0;
                                const isSuperadmin = r === 'Superadmin';
                                return `
                                    <td style="text-align:center;">
                                        <select class="perm-select ${val == 2 ? 'full' : val == 1 ? 'read' : 'none'}" 
                                                onchange="updateRolePermission('${r}', '${f.id}', this.value)"
                                                ${(currentUser.role !== 'Superadmin' || (isSuperadmin && currentUser.email !== 'rafieiy@gmail.com')) ? 'disabled' : ''}>
                                            <option value="0" ${val == 0 ? 'selected' : ''}>TUTUP</option>
                                            <option value="1" ${val == 1 ? 'selected' : ''}>LIHAT SAJA</option>
                                            <option value="2" ${val == 2 ? 'selected' : ''}>FULL AKSES</option>
                                        </select>
                                    </td>
                                `;
                            }).join('')}
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>
        <div style="margin-top:1.5rem; color:var(--text-muted); font-size:0.75rem; font-style:italic;">
           * Superadmin memiliki hak akses mutlak dan tidak dapat dikurangi perizinannya lewat antarmuka ini demi stabilitas sistem.
        </div>
    `;
}

window.updateRolePermission = function(role, feature, val) {
    if (!globalPermissions[role]) globalPermissions[role] = {};
    globalPermissions[role][feature] = parseInt(val);
    
    // Save to Firestore
    window.fbSave('globalPermissions', role, globalPermissions[role]);
    showToast(`Izin ${role} untuk ${feature} diperbarui`);
};

function renderUserRow(u) {
    const isBlocked = u.isBlocked || globalBlacklist.some(b => b.email === u.email);
    return `
        <tr data-search="${u.name} ${u.email} ${u.unit}">
            <td>
                <div style="display:flex; align-items:center; gap:12px;">
                    <div style="width:36px; height:36px; border-radius:10px; background:var(--primary-soft); color:var(--primary); display:flex; align-items:center; justify-content:center; font-weight:800; font-size:0.8rem;">
                        ${u.name.substring(0, 2).toUpperCase()}
                    </div>
                    <div>
                        <div style="font-weight:750; font-size:0.9rem; color:var(--text-main);">${u.name}</div>
                        <div style="font-size:0.75rem; color:var(--text-muted);">${u.email}</div>
                    </div>
                </div>
            </td>
            <td><div style="font-weight:600; font-size:0.85rem;">${u.unit}</div></td>
            <td>
                <select class="f-input" style="height:32px; font-size:0.75rem; font-weight:700; width:150px; padding:0 8px;" onchange="updateUserRole('${u.email}', this.value)">
                    ${Object.keys(defaultPermissions).map(r => `<option value="${r}" ${u.role === r ? 'selected' : ''}>${r}</option>`).join('')}
                </select>
            </td>
            <td style="text-align:center;">
                <span class="status-badge" style="background:${isBlocked ? 'var(--error-soft)' : 'var(--secondary-soft)'}; color:${isBlocked ? 'var(--error)' : 'var(--secondary)'};">
                    ${isBlocked ? 'DICEKAL' : 'AKTIF'}
                </span>
            </td>
            <td style="text-align:right;">
                <button class="btn-icon" onclick="openEditUserModal('${u.email}')"><span class="material-symbols-outlined">edit</span></button>
                <button class="btn-icon" onclick="deleteUser('${u.email}')" style="color:var(--error);"><span class="material-symbols-outlined">delete</span></button>
            </td>
        </tr>
    `;
}

window.updateUserRole = function(email, role) {
    const user = registeredUsers.find(u => u.email === email);
    if (user) {
        user.role = role;
        window.fbSave('registeredUsers', email, user);
        showToast(`Peran ${user.name} diperbarui menjadi ${role}`);
    }
};
