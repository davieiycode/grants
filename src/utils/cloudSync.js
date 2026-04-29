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
            
            const processedData = {
                users: data.user || data.users || [],
                roles: data.role || data.roles || [],
                blacklists: data.blacklist || data.blacklists || [],
                events: data.event || data.events || [],
                proposals: data.proposal || data.proposals || [],
                reviews: data.review || data.reviews || []
            };
            
            if (processedData.users.length) localStorage.setItem('grants_users', JSON.stringify(processedData.users));
            if (processedData.roles.length) localStorage.setItem('grants_roles', JSON.stringify(processedData.roles));
            if (processedData.blacklists.length) localStorage.setItem('grants_blacklists', JSON.stringify(processedData.blacklists));
            if (processedData.events.length) localStorage.setItem('grants_events', JSON.stringify(processedData.events));
            if (processedData.proposals.length) localStorage.setItem('grants_proposals', JSON.stringify(processedData.proposals));
            if (processedData.reviews.length) localStorage.setItem('grants_reviews', JSON.stringify(processedData.reviews));
            
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
