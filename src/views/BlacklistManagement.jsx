import React, { useState } from 'react';
import { Plus, Edit2, Trash2, X, Loader2, AlertCircle } from 'lucide-react';
import { cloudSync } from '../utils/cloudSync';

const BlacklistManagement = ({ blacklists, users, currentUser, onRefresh }) => {
  const [showModal, setShowModal] = useState(false);
  const [editingBlacklist, setEditingBlacklist] = useState(null);
  const [isSyncing, setIsSyncing] = useState(false);

  const handleAdd = () => {
    setEditingBlacklist(null);
    setShowModal(true);
  };

  const handleEdit = (blacklist) => {
    setEditingBlacklist(blacklist);
    setShowModal(true);
  };

  const handleDelete = async (blacklist_id) => {
    if (!window.confirm('Hapus entri blacklist ini?')) return;
    setIsSyncing(true);
    await cloudSync.push('blacklists', blacklist_id, null);
    if (onRefresh) await onRefresh();
    setIsSyncing(false);
  };

  const handleSave = async (blacklistData) => {
    setIsSyncing(true);
    const blacklistId = blacklistData.blacklist_id || `BLK-${Date.now()}`;
    const newBlacklist = { ...blacklistData, blacklist_id: blacklistId };
    
    await cloudSync.push('blacklists', blacklistId, newBlacklist);
    if (onRefresh) await onRefresh();
    
    setIsSyncing(false);
    setShowModal(false);
  };

  return (
    <div className="animate-fade-in relative">
      <header className="mb-10 flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-black text-[#0f172a] mb-2 font-['Outfit']">Blacklist Management</h1>
          <p className="text-[#64748b]">Daftar user yang terkena sanksi dan pembatasan pengajuan.</p>
        </div>
        <button 
          onClick={handleAdd}
          className="bg-[#0ea5e9] text-white px-6 py-3 rounded-2xl font-black text-sm shadow-xl shadow-sky-100 flex items-center gap-2 hover:-translate-y-1 transition-all"
        >
          <Plus size={18} />
          TAMBAH BLACKLIST
        </button>
      </header>

      <div className="bg-white rounded-[2rem] border border-slate-100 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 border-b border-slate-100 text-slate-500 uppercase tracking-wider font-bold">
              <tr>
                <th className="p-6">ID Blacklist</th>
                <th className="p-6">User</th>
                <th className="p-6">Periode</th>
                <th className="p-6">Catatan</th>
                <th className="p-6 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {blacklists?.map((b, i) => {
                const user = users?.find(u => u.user_id === b.user_id) || {};
                return (
                  <tr key={i} className="hover:bg-slate-50 transition-colors">
                    <td className="p-6 font-medium text-slate-800">{b.blacklist_id}</td>
                    <td className="p-6 font-bold text-slate-800">{user.full_name || user.name || b.user_id}</td>
                    <td className="p-6 text-slate-600">{b.start_date} s/d {b.end_date}</td>
                    <td className="p-6 text-slate-600 max-w-xs truncate" dangerouslySetInnerHTML={{__html: b.notes}}></td>
                    <td className="p-6 flex justify-end gap-2">
                      <button onClick={() => handleEdit(b)} className="p-2 text-slate-400 hover:text-sky-500 transition-colors bg-white rounded-lg border border-slate-200 shadow-sm">
                        <Edit2 size={16} />
                      </button>
                      <button onClick={() => handleDelete(b.blacklist_id)} className="p-2 text-slate-400 hover:text-rose-500 transition-colors bg-white rounded-lg border border-slate-200 shadow-sm">
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                );
              })}
              {(!blacklists || blacklists.length === 0) && (
                <tr>
                  <td colSpan="5" className="p-8 text-center text-slate-500 font-medium">Tidak ada data blacklist.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <BlacklistModal 
          blacklist={editingBlacklist} 
          users={users}
          onSave={handleSave} 
          onClose={() => setShowModal(false)}
          isSyncing={isSyncing}
        />
      )}
    </div>
  );
};

const BlacklistModal = ({ blacklist, users, onSave, onClose, isSyncing }) => {
  const [formData, setFormData] = useState(blacklist || { 
    blacklist_id: '',
    user_id: '',
    start_date: new Date().toISOString().split('T')[0],
    end_date: '', 
    notes: ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
      <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-md" onClick={onClose} />
      <div className="bg-white rounded-[2.5rem] w-full max-w-lg p-10 relative shadow-2xl animate-in slide-in-from-bottom-8 duration-500 max-h-[90vh] overflow-y-auto">
         <button onClick={onClose} className="absolute top-8 right-8 text-slate-300 hover:text-slate-600 transition-colors">
            <X size={24} />
         </button>
         
         <div className="flex items-center gap-4 mb-8">
            <div className="w-12 h-12 bg-rose-50 text-rose-500 rounded-2xl flex items-center justify-center">
               <AlertCircle size={24} />
            </div>
            <div>
               <h2 className="text-2xl font-black font-['Outfit'] text-[#0f172a]">{blacklist ? 'Edit Blacklist' : 'Tambah Blacklist'}</h2>
               <p className="text-sm text-slate-500 font-medium">Lengkapi detail sanksi pengguna.</p>
            </div>
         </div>

         <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5 col-span-2">
                 <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Pilih Pengguna</label>
                 <select 
                    required
                    value={formData.user_id}
                    onChange={e => setFormData({...formData, user_id: e.target.value})}
                    className="w-full h-12 px-5 bg-slate-50 border border-slate-100 rounded-xl focus:outline-none focus:ring-4 focus:ring-sky-100 transition-all font-bold text-sm appearance-none"
                 >
                    <option value="">-- Pilih User --</option>
                    {users?.map(u => (
                      <option key={u.user_id} value={u.user_id}>{u.full_name || u.name} ({u.email_address})</option>
                    ))}
                 </select>
              </div>

              <div className="space-y-1.5">
                 <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Tanggal Mulai</label>
                 <input 
                    type="date"
                    required
                    value={formData.start_date}
                    onChange={e => setFormData({...formData, start_date: e.target.value})}
                    className="w-full h-12 px-5 bg-slate-50 border border-slate-100 rounded-xl focus:outline-none focus:ring-4 focus:ring-sky-100 transition-all font-bold text-sm"
                 />
              </div>

              <div className="space-y-1.5">
                 <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Tanggal Selesai</label>
                 <input 
                    type="date"
                    required
                    value={formData.end_date}
                    onChange={e => setFormData({...formData, end_date: e.target.value})}
                    className="w-full h-12 px-5 bg-slate-50 border border-slate-100 rounded-xl focus:outline-none focus:ring-4 focus:ring-sky-100 transition-all font-bold text-sm"
                 />
              </div>
              
              <div className="space-y-1.5 col-span-2">
                 <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Catatan / Alasan</label>
                 <textarea 
                    required
                    value={formData.notes}
                    onChange={e => setFormData({...formData, notes: e.target.value})}
                    placeholder="Pelanggaran atau catatan lain..."
                    className="w-full min-h-[80px] p-4 bg-slate-50 border border-slate-100 rounded-xl focus:outline-none focus:ring-4 focus:ring-sky-100 transition-all font-medium text-sm resize-y"
                 />
              </div>
            </div>

            <button 
               disabled={isSyncing}
               className="w-full h-14 bg-rose-500 text-white rounded-xl font-black text-sm shadow-xl shadow-rose-100 hover:-translate-y-1 active:scale-95 transition-all flex items-center justify-center gap-3 disabled:opacity-50 disabled:translate-y-0 mt-6"
            >
               {isSyncing ? <Loader2 className="animate-spin" /> : 'SIMPAN BLACKLIST'}
            </button>
         </form>
      </div>
    </div>
  );
};

export default BlacklistManagement;
