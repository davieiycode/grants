export const cloudSync = {
    url: localStorage.getItem('grants_appscript_url'),
    isSyncing: false,
    async pull() {
        if (!this.url || this.isSyncing) return null;
        this.isSyncing = true;
        try {
            const res = await fetch(this.url + '?action=pull');
            const data = await res.json();
            
            if (data.programs) localStorage.setItem('grants_programs_meta', JSON.stringify(data.programs));
            if (data.proposals) localStorage.setItem('grants_proposals', JSON.stringify(data.proposals));
            if (data.registeredUsers) localStorage.setItem('grants_registeredUsers', JSON.stringify(data.registeredUsers));
            
            this.isSyncing = false;
            return data;
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
