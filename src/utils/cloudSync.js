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
                    if (row.JSON_DATA) {
                        try {
                            const parsed = typeof row.JSON_DATA === 'string' ? JSON.parse(row.JSON_DATA) : row.JSON_DATA;
                            return { ...row, ...parsed };
                        } catch (e) {
                            console.error("Failed to parse JSON_DATA:", e);
                            return row;
                        }
                    }
                    return row;
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
