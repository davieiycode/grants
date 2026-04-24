import React, { useState, useEffect } from 'react';
import { Users, ShieldCheck, History, Archive, Search, X, Plus, Trash2, Loader2, RefreshCw, Mail, MapPin } from 'lucide-react';
import { cloudSync } from '../utils/cloudSync';

const CrewManagement = ({ logs }) => {
  const [activeTab, setActiveTab] = useState('astronauts');
  const [users, setUsers] = useState([]);
  const [showUserModal, setShowUserModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [isSyncing, setIsSyncing] = useState(false);

  useEffect(() => {
    refreshData();
  }, []);

  const refreshData = () => {
    const localUsers = localStorage.getItem('grants_registeredUsers');
    if (localUsers) setUsers(JSON.parse(localUsers));
  };

  const handleSaveUser = async (userData) => {
    setIsSyncing(true);
    const userId = userData.email || editingUser?.email || `USER-${Date.now()}`;
    const newUser = { ...userData, email: userId };
    
    await cloudSync.push('registeredUsers', userId, newUser);
    
    // Update local state
    const currentUsers = JSON.parse(localStorage.getItem('grants_registeredUsers') || '[]');
    let updatedUsers;
    if (editingUser) {
      updatedUsers = currentUsers.map(u => u.email === editingUser.email ? newUser : u);
    } else {
      updatedUsers = [...currentUsers, newUser];
    }
    
    localStorage.setItem('grants_registeredUsers', JSON.stringify(updatedUsers));
    setUsers(updatedUsers);
    setIsSyncing(false);
    setShowUserModal(false);
    setEditingUser(null);
  };

  const handleDeleteUser = async (email) => {
    if (!window.confirm('Are you sure you want to remove this crew member?')) return;
    setIsSyncing(true);
    const currentUsers = JSON.parse(localStorage.getItem('grants_registeredUsers') || '[]');
    const updatedUsers = currentUsers.filter(u => u.email !== email);
    
    await cloudSync.push('registeredUsers', email, null); 
    
    localStorage.setItem('grants_registeredUsers', JSON.stringify(updatedUsers));
    setUsers(updatedUsers);
    setIsSyncing(false);
  };

  return (
    <div className="animate-fade-in relative">
      <header className="mb-12 flex justify-between items-end">
        <div>
          <h1 className="text-4xl font-black font-['Outfit'] mb-2 tracking-tight text-[#0f172a]">Crew Management</h1>
          <p className="text-[#64748b] font-medium">Manage astronaut access, personnel clearance, and activity logs.</p>
        </div>
        <button 
           onClick={async () => {
             setIsSyncing(true);
             await cloudSync.pull();
             refreshData();
             setIsSyncing(false);
           }}
           className="p-3 bg-white border border-slate-200 rounded-xl text-slate-400 hover:text-[#0ea5e9] transition-all shadow-sm"
        >
           <RefreshCw size={18} className={isSyncing ? 'animate-spin' : ''} />
        </button>
      </header>

      <div className="flex flex-col lg:flex-row bg-white rounded-[2.5rem] border border-[#e2e8f0] overflow-hidden min-h-[600px] shadow-sm">
        <aside className="w-full lg:w-[300px] bg-[#f8fafc] p-8 border-r border-[#e2e8f0] flex flex-col gap-2">
          <SideTab active={activeTab === 'astronauts'} onClick={() => setActiveTab('astronauts')} icon={<Users size={18} />}>Active Astronauts</SideTab>
          <SideTab active={activeTab === 'clearance'} onClick={() => setActiveTab('clearance')} icon={<ShieldCheck size={18} />}>Clearance Levels</SideTab>
          <SideTab active={activeTab === 'logs'} onClick={() => setActiveTab('logs')} icon={<History size={18} />}>Black Box Data</SideTab>
          <div className="mt-auto pt-6 border-t border-slate-200">
             <SideTab active={activeTab === 'archives'} onClick={() => setActiveTab('archives')} icon={<Archive size={18} />}>Archives</SideTab>
          </div>
        </aside>

        <main className="flex-1 p-10">
           {activeTab === 'astronauts' && (
             <AstronautsList 
               users={users} 
               onAdd={() => { setEditingUser(null); setShowUserModal(true); }}
               onEdit={(u) => { setEditingUser(u); setShowUserModal(true); }}
               onDelete={handleDeleteUser}
             />
           )}
           {activeTab === 'clearance' && <ClearanceLevels users={users} />}
           {activeTab === 'logs' && <BlackBoxData logs={logs} />}
           {activeTab === 'archives' && (
             <div className="flex flex-col items-center justify-center h-full text-slate-300">
                <Archive size={64} strokeWidth={1} className="mb-4 opacity-20" />
                <p className="font-bold text-sm uppercase tracking-widest opacity-40">Arsip data sedang dienkripsi.</p>
             </div>
           )}
        </main>
      </div>

      {showUserModal && (
        <UserModal 
          user={editingUser} 
          onSave={handleSaveUser} 
          onClose={() => setShowUserModal(false)}
          isSyncing={isSyncing}
        />
      )}
    </div>
  );
};

const AstronautsList = ({ users, onAdd, onEdit, onDelete }) => (
  <div className="space-y-8 animate-fade-in">
    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
      <div className="relative flex-1 max-w-md">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
        <input 
          type="text" 
          placeholder="Scan crew names or units..." 
          className="w-full pl-12 pr-6 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:ring-4 focus:ring-sky-100 transition-all font-medium text-sm" 
        />
      </div>
      <button 
        onClick={onAdd}
        className="bg-[#0f172a] text-white px-6 py-3 rounded-2xl font-black text-sm shadow-xl flex items-center gap-2 hover:-translate-y-1 transition-all"
      >
        <Plus size={18} />
        ENLIST NEW CREW
      </button>
    </div>

    {users.length > 0 ? (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {users.map((user, idx) => (
          <div key={idx} className="p-5 bg-white border border-slate-100 rounded-[1.5rem] flex items-center gap-4 hover:shadow-lg hover:shadow-slate-100 transition-all group">
            <div className="w-14 h-14 rounded-2xl bg-slate-50 text-slate-400 flex items-center justify-center group-hover:bg-[#0ea5e9] group-hover:text-white transition-all shadow-sm">
              <span className="text-xl font-black">{user.name ? user.name[0] : 'U'}</span>
            </div>
            <div className="flex-1 min-w-0 text-left">
              <div className="font-black text-[#0f172a] tracking-tight truncate font-['Outfit']">{user.name}</div>
              <div className="flex items-center gap-3 mt-1">
                  <div className="flex items-center gap-1 text-[10px] font-black text-slate-400 tracking-wider uppercase">
                    <MapPin size={12} className="text-sky-400" />
                    {user.unit || 'General Service'}
                  </div>
                  <div className="w-1 h-1 rounded-full bg-slate-200" />
                  <div className="text-[10px] font-black text-[#0ea5e9] tracking-wider uppercase">{user.role || 'Astronaut'}</div>
              </div>
            </div>
            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <button onClick={() => onEdit(user)} className="p-2 text-slate-300 hover:text-sky-500 transition-colors">
                <ShieldCheck size={18} />
              </button>
              <button onClick={() => onDelete(user.email)} className="p-2 text-slate-300 hover:text-rose-500 transition-colors">
                <Trash2 size={18} />
              </button>
            </div>
          </div>
        ))}
      </div>
    ) : (
      <div className="flex flex-col items-center justify-center py-20 px-6 border-2 border-dashed border-slate-100 rounded-[2rem] bg-slate-50/50">
        <div className="w-20 h-20 bg-white rounded-3xl flex items-center justify-center text-slate-300 shadow-sm mb-6">
          <Users size={40} strokeWidth={1.5} />
        </div>
        <h3 className="text-xl font-black text-slate-900 mb-2 font-['Outfit']">No Crew Members Found</h3>
        <p className="text-slate-500 text-sm max-w-[280px] text-center mb-8">
          The space station is currently empty. Sync with the ground control or enlist your first crew.
        </p>
        <button onClick={onAdd} className="text-sky-500 font-black text-xs uppercase tracking-widest hover:text-sky-600 transition-colors">
          ➕ Enlist First Crew
        </button>
      </div>
    )}
  </div>
);

const UserModal = ({ user, onSave, onClose, isSyncing }) => {
  const [formData, setFormData] = useState(user || { name: '', email: '', role: 'PENGUSUL', password: '', unit: '' });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
      <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-md" onClick={onClose} />
      <div className="bg-white rounded-[2.5rem] w-full max-w-lg p-10 relative shadow-2xl animate-in slide-in-from-bottom-8 duration-500">
         <button onClick={onClose} className="absolute top-8 right-8 text-slate-300 hover:text-slate-600 transition-colors">
            <X size={24} />
         </button>
         
         <div className="flex items-center gap-4 mb-10">
            <div className="w-12 h-12 bg-sky-50 text-[#0ea5e9] rounded-2xl flex items-center justify-center">
               <Users size={24} />
            </div>
            <div>
               <h2 className="text-2xl font-black font-['Outfit'] text-[#0f172a]">{user ? 'Edit Crew Details' : 'Enlist New Crew'}</h2>
               <p className="text-sm text-slate-500 font-medium">Configure personnel clearance and access.</p>
            </div>
         </div>

         <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5 col-span-2">
                 <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Full Name</label>
                 <input 
                    required
                    value={formData.name}
                    onChange={e => setFormData({...formData, name: e.target.value})}
                    placeholder="e.g. Dr. Jane Doe"
                    className="w-full h-12 px-5 bg-slate-50 border border-slate-100 rounded-xl focus:outline-none focus:ring-4 focus:ring-sky-100 transition-all font-bold text-sm"
                 />
              </div>
              <div className="space-y-1.5">
                 <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Email / ID</label>
                 <input 
                    required
                    disabled={!!user}
                    value={formData.email}
                    onChange={e => setFormData({...formData, email: e.target.value})}
                    placeholder="jane@ugm.ac.id"
                    className="w-full h-12 px-5 bg-slate-50 border border-slate-100 rounded-xl focus:outline-none focus:ring-4 focus:ring-sky-100 transition-all font-bold text-sm disabled:opacity-50"
                 />
              </div>
              <div className="space-y-1.5">
                 <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Unit / Sector</label>
                 <input 
                    required
                    value={formData.unit}
                    onChange={e => setFormData({...formData, unit: e.target.value})}
                    placeholder="e.g. BioScience"
                    className="w-full h-12 px-5 bg-slate-50 border border-slate-100 rounded-xl focus:outline-none focus:ring-4 focus:ring-sky-100 transition-all font-bold text-sm"
                 />
              </div>
              <div className="space-y-1.5">
                 <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Security Role</label>
                 <select 
                    value={formData.role}
                    onChange={e => setFormData({...formData, role: e.target.value})}
                    className="w-full h-12 px-5 bg-slate-50 border border-slate-100 rounded-xl focus:outline-none focus:ring-4 focus:ring-sky-100 transition-all font-bold text-sm appearance-none"
                 >
                    <option value="SUPERADMIN">SUPERADMIN</option>
                    <option value="ADMIN">ADMIN</option>
                    <option value="MANAGER">MANAGER</option>
                    <option value="EDITOR">EDITOR</option>
                    <option value="REVIEWER">REVIEWER</option>
                    <option value="PENGUSUL">PENGUSUL</option>
                 </select>
              </div>
              <div className="space-y-1.5">
                 <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Access Key</label>
                 <input 
                    required
                    type="password"
                    value={formData.password}
                    onChange={e => setFormData({...formData, password: e.target.value})}
                    placeholder="••••••••"
                    className="w-full h-12 px-5 bg-slate-50 border border-slate-100 rounded-xl focus:outline-none focus:ring-4 focus:ring-sky-100 transition-all font-bold text-sm"
                 />
              </div>
            </div>

            <button 
               disabled={isSyncing}
               className="w-full h-14 bg-[#0ea5e9] text-white rounded-xl font-black text-sm shadow-xl shadow-sky-100 hover:-translate-y-1 active:scale-95 transition-all flex items-center justify-center gap-3 disabled:opacity-50 disabled:translate-y-0 mt-6"
            >
               {isSyncing ? <Loader2 className="animate-spin" /> : (user ? 'UPDATE CLEARANCE' : 'ENLIST CREW')}
            </button>
         </form>
      </div>
    </div>
  );
};

const ClearanceLevels = ({ users }) => {
  const roles = users.reduce((acc, user) => {
    const role = user.role || 'GUEST';
    acc[role] = (acc[role] || 0) + 1;
    return acc;
  }, {});

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Object.entries(roles).map(([role, count]) => (
          <div key={role} className="p-8 bg-slate-50 border border-slate-100 rounded-[2rem] hover:bg-white hover:shadow-lg transition-all">
            <div className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2">{role} Level</div>
            <div className="text-4xl font-black font-['Outfit'] text-[#0f172a] mb-4">{count}</div>
            <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
               <div className="h-full bg-[#0ea5e9]" style={{ width: `${(count / users.length) * 100}%` }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const BlackBoxData = ({ logs }) => {
  if (!logs || logs.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-slate-300">
         <History size={48} strokeWidth={1} className="mb-4 opacity-20" />
         <p className="font-bold text-sm uppercase tracking-widest opacity-40">No activity logs found.</p>
      </div>
    );
  }

  const sortedLogs = [...logs].sort((a, b) => new Date(b.timestamp || 0) - new Date(a.timestamp || 0));

  return (
    <div className="space-y-6 animate-fade-in font-mono">
      {sortedLogs.map((log, idx) => (
        <div key={idx} className="flex gap-6 items-start p-4 border-l-2 border-slate-100 hover:border-[#0ea5e9] hover:bg-slate-50 transition-all group">
          <div className="flex flex-col min-w-[120px]">
            <span className="text-sky-500 font-bold whitespace-nowrap text-xs">{new Date(log.timestamp).toLocaleTimeString()}</span>
            <span className="text-[10px] text-slate-400">{new Date(log.timestamp).toLocaleDateString()}</span>
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <span className={`text-[9px] font-black px-1.5 py-0.5 rounded uppercase ${log.action?.includes('DELETE') ? 'bg-rose-50 text-rose-600' : 'bg-sky-50 text-sky-600'}`}>
                {log.action || 'ACTIVITY'}
              </span>
              <span className="text-xs font-bold text-slate-400">by {log.user || 'System'}</span>
            </div>
            <p className="text-sm text-slate-600 leading-relaxed">{log.details}</p>
          </div>
        </div>
      ))}
    </div>
  );
};

const SideTab = ({ children, active, onClick, icon }) => (
  <button 
    onClick={onClick}
    className={`flex items-center gap-3 px-6 py-3.5 rounded-2xl font-black text-sm transition-all text-left ${active ? 'bg-[#0ea5e9] text-white shadow-xl shadow-sky-100' : 'text-slate-400 hover:bg-white hover:text-[#0ea5e9]'}`}
  >
    {icon}
    {children}
  </button>
);

export default CrewManagement;
