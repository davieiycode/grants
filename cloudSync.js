/**
 * ProSpace Cloud Sync Engine (v2.6.9)
 * Manages bidirectional data flow between LocalStorage and Google Sheets / Firestore.
 */

// --- SYNC HUB MANAGER ---
window.syncHub = {
    lastSynced: Date.now(),
    update(newState) {
        const icon = document.getElementById('sync-icon');
        const dot = document.getElementById('sync-status-dot');
        const relTime = document.getElementById('sync-time-rel');
        
        if (!icon || !dot) return;
        
        if (newState === 'syncing') {
            icon.innerText = 'sync'; icon.classList.add('animate-spin');
            dot.style.background = '#f59e0b';
            if (relTime) relTime.innerText = 'Sinkronisasi...';
        } else if (newState === 'error') {
            icon.innerText = 'cloud_off'; icon.classList.remove('animate-spin');
            dot.style.background = 'var(--error)';
            if (relTime) relTime.innerText = 'Gagal sinkron';
        } else {
            icon.innerText = 'cloud_done'; icon.classList.remove('animate-spin');
            dot.style.background = 'var(--secondary)';
            this.lastSynced = Date.now();
            this.updateRelTime();
        }
    },
    start() { this.update('syncing'); },
    end() { this.update('synced'); },
    updateRelTime() {
        const relTime = document.getElementById('sync-time-rel');
        if (!relTime) return;
        const diff = Math.floor((Date.now() - this.lastSynced) / 60000); // minutes
        if (diff < 1) relTime.innerText = 'Baru saja';
        else relTime.innerText = `${diff} menit lalu`;
    }
};

// Update relative time every minute
setInterval(() => window.syncHub.updateRelTime(), 60000);

// --- APPS SCRIPT SYNC BRIDGE ---
window.cloudSync = {
    url: localStorage.getItem('grants_appscript_url'),
    isSyncing: false,
    async pull() {
        if (!this.url || this.isSyncing) return;
        this.isSyncing = true;
        window.syncHub.start();
        try {
            const res = await fetch(this.url + '?action=pull');
            const data = await res.json();
            
            if (data.programs) {
                programs = data.programs;
                localStorage.setItem('grants_programs_meta', JSON.stringify(programs));
            }
            if (data.proposals) {
                proposals = data.proposals;
                localStorage.setItem('grants_proposals', JSON.stringify(proposals));
            }
            if (data.registeredUsers) {
                registeredUsers = data.registeredUsers;
                localStorage.setItem('grants_registeredUsers', JSON.stringify(registeredUsers));
            }
            if (data.globalBlacklist) {
                globalBlacklist = data.globalBlacklist;
                localStorage.setItem('grants_global_blacklist', JSON.stringify(globalBlacklist));
            }
            if (data.globalPermissions && Array.isArray(data.globalPermissions)) {
                data.globalPermissions.forEach(p => {
                   const rowId = (p.id || p.ID || "").toString().trim().toLowerCase();
                   const roleKey = Object.keys(defaultPermissions).find(k => k.toLowerCase() === rowId); 
                   if (roleKey) {
                     const normalizedP = {};
                     Object.keys(p).forEach(key => {
                         const val = p[key];
                         if (key !== 'id' && key !== 'ID') {
                            normalizedP[key] = isNaN(val) || val === "" || val === null ? (defaultPermissions[roleKey][key] || 0) : Number(val);
                         }
                     });
                     globalPermissions[roleKey] = { ...defaultPermissions[roleKey], ...normalizedP };
                     if (roleKey.toLowerCase() === 'superadmin') {
                        Object.keys(defaultPermissions['Superadmin']).forEach(f => globalPermissions[roleKey][f] = 2);
                     }
                   }
                });
                localStorage.setItem('grants_global_permissions', JSON.stringify(globalPermissions));
            }
            if (data.globalLogs && Array.isArray(data.globalLogs)) {
                window.globalLogs = data.globalLogs.map(log => ({
                    ...log,
                    timestamp: log.timestamp || log.Timestamp || new Date().toISOString()
                }));
                localStorage.setItem('grants_global_logs', JSON.stringify(window.globalLogs));
            }

            if (typeof checkAdminVisibility === 'function') checkAdminVisibility();
            
            const params = new URLSearchParams(window.location.search);
            if (params.get('p')) { if (typeof init === 'function') init(); }
            else { if (typeof renderDashboard === 'function') renderDashboard(); }
            
            window.syncHub.end();
            this.isSyncing = false;
            return data;
        } catch (e) {
            console.error("Pull Sync Failed:", e);
            window.syncHub.update('error');
            this.isSyncing = false;
            return null;
        }
    },
    async push(collection, id, data) {
        if (!this.url) return;
        this.isSyncing = true;
        window.syncHub.start();
        try {
            await fetch(this.url, {
                method: 'POST',
                mode: 'no-cors',
                body: JSON.stringify({ 
                    action: 'push', 
                    collection, 
                    id, 
                    data,
                    user_email: (typeof currentUser !== 'undefined' ? currentUser?.email : 'system'),
                    timestamp: new Date().toISOString()
                })
            });
            window.syncHub.end();
            this.isSyncing = false;
            await new Promise(resolve => setTimeout(resolve, 300));
        } catch (e) {
            console.error("Push Sync Failed:", e);
            window.syncHub.update('error');
            this.isSyncing = false;
        }
    }
};

window.fbSave = async (collection, id, data) => {
    // 1. UPDATE LOCAL STATE IMMEDIATELY
    if (collection === 'programs') {
        const idx = programs.findIndex(p => String(p.id) === String(id));
        if (idx !== -1) programs[idx] = data; else programs.push(data);
        localStorage.setItem('grants_programs_meta', JSON.stringify(programs));
    } else if (collection === 'proposals') {
        const idx = proposals.findIndex(p => String(p.id) === String(id));
        if (idx !== -1) proposals[idx] = data; else proposals.push(data);
        localStorage.setItem('grants_proposals', JSON.stringify(proposals));
    } else if (collection === 'registeredUsers') {
        const idx = registeredUsers.findIndex(u => (u.id == id || u.email == id));
        if (idx !== -1) {
            registeredUsers[idx] = { ...registeredUsers[idx], ...data };
        } else {
            if (!data.id) data.id = Date.now();
            registeredUsers.push(data);
        }
        localStorage.setItem('grants_registeredUsers', JSON.stringify(registeredUsers));
        id = registeredUsers.find(u => (u.id == id || u.email == id))?.email || id;
    } else if (collection === 'globalBlacklist') {
        const idx = globalBlacklist.findIndex(b => b.id == id || b.email == id);
        if (idx !== -1) globalBlacklist[idx] = { ...globalBlacklist[idx], ...data };
        else globalBlacklist.push(data);
        localStorage.setItem('grants_global_blacklist', JSON.stringify(globalBlacklist));
    } else if (collection === 'globalPermissions') {
        globalPermissions[id] = data; 
        localStorage.setItem('grants_global_permissions', JSON.stringify(globalPermissions));
    } else if (collection === 'globalLogs') {
        if (!window.globalLogs) window.globalLogs = [];
        window.globalLogs.unshift(data);
        localStorage.setItem('grants_global_logs', JSON.stringify(window.globalLogs));
    }

    // 2. PUSH TO CLOUD 
    await window.cloudSync.push(collection, id, data);
    
    // 3. LOG THE CHANGE
    if (collection !== 'globalLogs') {
        const details = `Update ${collection} ID:${id}`;
        window.addGlobalLog('DATA_CHANGE', details);
    }
    return true;
};

// PREVENT DATA LOSS ON REFRESH DURING SYNC
window.addEventListener('beforeunload', function(e) {
    if (window.cloudSync.isSyncing) {
        e.preventDefault();
        return "Sedang sinkron...";
    }
});

window.fbDelete = (col, id) => {
    const data = { deleted: true };
    window.fbSave(col, id, data);
};

window.addGlobalLog = (action, details = "") => {
    const logId = Date.now().toString();
    const logData = {
        id: logId,
        timestamp: new Date().toISOString(),
        user: (typeof currentUser !== 'undefined' ? currentUser?.name : 'System'),
        email: (typeof currentUser !== 'undefined' ? currentUser?.email : 'system@prospace.id'),
        avatar: (typeof currentUser !== 'undefined' ? currentUser?.avatar : ''),
        action,
        details
    };
    
    if (!window.globalLogs) window.globalLogs = [];
    window.globalLogs.unshift(logData);
    localStorage.setItem('grants_global_logs', JSON.stringify(window.globalLogs));
    
    // Auto sync logs to cloud
    window.cloudSync.push('globalLogs', logId, logData);
};
