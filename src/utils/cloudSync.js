export const cloudSync = {
    get url() {
        return localStorage.getItem('grants_appscript_url');
    },
    isSyncing: false,
    async pull() {
        if (!this.url || this.isSyncing) return null;
        this.isSyncing = true;
        try {
            const res = await fetch(this.url + '?action=pull');
            if (!res.ok) throw new Error('Network response was not ok');
            const data = await res.json();
            
            // Helper to parse JSON_DATA from rows
            const parseRows = (rows) => {
                if (!rows) return [];
                return rows.map(row => {
                    let data = {};
                    try {
                        // If it looks like JSON, try to parse it
                        if (row.JSON_DATA && (typeof row.JSON_DATA === 'string' && (row.JSON_DATA.startsWith('{') || row.JSON_DATA.startsWith('[')))) {
                            data = JSON.parse(row.JSON_DATA);
                        } else if (row.JSON_DATA) {
                            // It's a plain string, treat as details/raw
                            data = { details: row.JSON_DATA };
                        }
                    } catch (e) {
                        console.warn('Failed to parse JSON_DATA:', e, row.JSON_DATA);
                        data = { details: row.JSON_DATA };
                    }
                    return {
                        id: row.ID,
                        lastUpdated: row.LAST_UPDATED,
                        ...data
                    };
                });
            };

            const processedData = {
                programs: parseRows(data.programs),
                proposals: parseRows(data.proposals),
                registeredUsers: parseRows(data.registeredUsers),
                logs: parseRows(data.global_logs || data.logs)
            };
            
            if (processedData.programs.length) localStorage.setItem('grants_programs_meta', JSON.stringify(processedData.programs));
            if (processedData.proposals.length) localStorage.setItem('grants_proposals', JSON.stringify(processedData.proposals));
            if (processedData.registeredUsers.length) localStorage.setItem('grants_registeredUsers', JSON.stringify(processedData.registeredUsers));
            if (processedData.logs.length) localStorage.setItem('grants_global_logs', JSON.stringify(processedData.logs));
            
            this.isSyncing = false;
            return processedData;
        } catch (e) {
            console.error("Pull Sync Failed:", e);
            this.isSyncing = false;
            return null;
        }
    },
    async push(collection, id, data) {
        if (!this.url) return;
        this.isSyncing = true;
        try {
            const currentUser = JSON.parse(localStorage.getItem('grants_currentUser') || '{}');
            await fetch(this.url, {
                method: 'POST',
                mode: 'no-cors',
                body: JSON.stringify({ 
                    action: 'push', 
                    collection, 
                    id, 
                    data,
                    user_email: currentUser?.email || 'system',
                    timestamp: new Date().toISOString()
                })
            });
            this.isSyncing = false;
        } catch (e) {
            console.error("Push Sync Failed:", e);
            this.isSyncing = false;
        }
    }
};
