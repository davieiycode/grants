import React, { useState } from 'react';
import { Plus, Edit2, Trash2, X, Loader2, Users } from 'lucide-react';
import { cloudSync } from '../utils/cloudSync';

const UserManagement = ({ users, currentUser, onRefresh }) => {
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [isSyncing, setIsSyncing] = useState(false);

  const handleAdd = () => {
    setEditingUser(null);
    setShowModal(true);
  };

  const handleEdit = (user) => {
    setEditingUser(user);
    setShowModal(true);
  };

  const handleDelete = async (user_id) => {
    if (!window.confirm('Hapus user ini?')) return;
    setIsSyncing(true);
    await cloudSync.push('users', user_id, null);
    if (onRefresh) await onRefresh();
    setIsSyncing(false);
  };

  const handleSave = async (userData) => {
    setIsSyncing(true);
    const userId = userData.user_id || `USR-${Date.now()}`;
    const newUser = { ...userData, user_id: userId };
    
    await cloudSync.push('users', userId, newUser);
    if (onRefresh) await onRefresh();
    
    setIsSyncing(false);
    setShowModal(false);
  };

  return (
    <div className="animate-fade-in relative">
      <header className="mb-10 flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-black text-[#0f172a] mb-2 font-['Outfit']">User Management</h1>
          <p className="text-[#64748b]">Kelola pengguna sistem dan hak akses.</p>
        </div>
        <button 
          onClick={handleAdd}
          className="bg-[#0ea5e9] text-white px-6 py-3 rounded-2xl font-black text-sm shadow-xl shadow-sky-100 flex items-center gap-2 hover:-translate-y-1 transition-all"
        >
          <Plus size={18} />
          TAMBAH USER
        </button>
      </header>

      <div className="bg-white rounded-[2rem] border border-slate-100 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 border-b border-slate-100 text-slate-500 uppercase tracking-wider font-bold">
              <tr>
                <th className="p-6">ID User</th>
                <th className="p-6">Email</th>
                <th className="p-6">Nama Lengkap</th>
                <th className="p-6">Role</th>
                <th className="p-6">Unit</th>
                <th className="p-6 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {users?.map((u, i) => (
                <tr key={i} className="hover:bg-slate-50 transition-colors">
                  <td className="p-6 font-medium text-slate-800">{u.user_id}</td>
                  <td className="p-6 text-slate-600">{u.email_address || u.email}</td>
                  <td className="p-6 font-bold text-slate-800">{u.prefix} {u.full_name || u.name} {u.suffix}</td>
                  <td className="p-6">
                    <span className="px-3 py-1 bg-sky-100 text-sky-700 rounded-full text-xs font-bold tracking-wide">
                      {u.role}
                    </span>
                  </td>
                  <td className="p-6 text-slate-600">{u.unit} {u.department ? `- ${u.department}` : ''}</td>
                  <td className="p-6 flex justify-end gap-2">
                    <button onClick={() => handleEdit(u)} className="p-2 text-slate-400 hover:text-sky-500 transition-colors bg-white rounded-lg border border-slate-200 shadow-sm">
                      <Edit2 size={16} />
                    </button>
                    <button onClick={() => handleDelete(u.user_id || u.email_address || u.email)} className="p-2 text-slate-400 hover:text-rose-500 transition-colors bg-white rounded-lg border border-slate-200 shadow-sm">
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))}
              {(!users || users.length === 0) && (
                <tr>
                  <td colSpan="6" className="p-8 text-center text-slate-500 font-medium">Belum ada data user.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <UserModal 
          user={editingUser} 
          onSave={handleSave} 
          onClose={() => setShowModal(false)}
          isSyncing={isSyncing}
        />
      )}
    </div>
  );
};

const UserModal = ({ user, onSave, onClose, isSyncing }) => {
  const [formData, setFormData] = useState(user || { 
    user_id: '',
    full_name: '', 
    email_address: '', 
    role: 'PENGUSUL', 
    password: '', 
    unit: '',
    department: '',
    prefix: '',
    suffix: ''
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
            <div className="w-12 h-12 bg-sky-50 text-[#0ea5e9] rounded-2xl flex items-center justify-center">
               <Users size={24} />
            </div>
            <div>
               <h2 className="text-2xl font-black font-['Outfit'] text-[#0f172a]">{user ? 'Edit User' : 'Tambah User Baru'}</h2>
               <p className="text-sm text-slate-500 font-medium">Lengkapi detail pengguna di bawah ini.</p>
            </div>
         </div>

         <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5 col-span-2">
                 <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Nama Lengkap</label>
                 <div className="flex gap-2">
                   <input 
                      value={formData.prefix}
                      onChange={e => setFormData({...formData, prefix: e.target.value})}
                      placeholder="Gelar Depan"
                      className="w-1/4 h-12 px-3 bg-slate-50 border border-slate-100 rounded-xl focus:outline-none focus:ring-4 focus:ring-sky-100 transition-all font-bold text-sm"
                   />
                   <input 
                      required
                      value={formData.full_name || formData.name}
                      onChange={e => setFormData({...formData, full_name: e.target.value, name: e.target.value})}
                      placeholder="Nama Lengkap"
                      className="flex-1 h-12 px-5 bg-slate-50 border border-slate-100 rounded-xl focus:outline-none focus:ring-4 focus:ring-sky-100 transition-all font-bold text-sm"
                   />
                   <input 
                      value={formData.suffix}
                      onChange={e => setFormData({...formData, suffix: e.target.value})}
                      placeholder="Gelar Belakang"
                      className="w-1/4 h-12 px-3 bg-slate-50 border border-slate-100 rounded-xl focus:outline-none focus:ring-4 focus:ring-sky-100 transition-all font-bold text-sm"
                   />
                 </div>
              </div>
              <div className="space-y-1.5">
                 <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Email</label>
                 <input 
                    required
                    disabled={!!user}
                    value={formData.email_address || formData.email}
                    onChange={e => setFormData({...formData, email_address: e.target.value, email: e.target.value})}
                    placeholder="email@ugm.ac.id"
                    className="w-full h-12 px-5 bg-slate-50 border border-slate-100 rounded-xl focus:outline-none focus:ring-4 focus:ring-sky-100 transition-all font-bold text-sm disabled:opacity-50"
                 />
              </div>
              <div className="space-y-1.5">
                 <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Role</label>
                 <select 
                    value={formData.role}
                    onChange={e => setFormData({...formData, role: e.target.value})}
                    className="w-full h-12 px-5 bg-slate-50 border border-slate-100 rounded-xl focus:outline-none focus:ring-4 focus:ring-sky-100 transition-all font-bold text-sm appearance-none"
                 >
                    <option value="SUPERADMIN">SUPERADMIN</option>
                    <option value="ADMIN">ADMIN</option>
                    <option value="MANAGER">MANAGER</option>
                    <option value="REVIEWER">REVIEWER</option>
                    <option value="PENGUSUL">PENGUSUL</option>
                 </select>
              </div>
              <div className="space-y-1.5">
                 <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Unit</label>
                 <input 
                    required
                    value={formData.unit}
                    onChange={e => setFormData({...formData, unit: e.target.value})}
                    placeholder="e.g. Fakultas Teknik"
                    className="w-full h-12 px-5 bg-slate-50 border border-slate-100 rounded-xl focus:outline-none focus:ring-4 focus:ring-sky-100 transition-all font-bold text-sm"
                 />
              </div>
              <div className="space-y-1.5">
                 <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Departemen</label>
                 <input 
                    value={formData.department}
                    onChange={e => setFormData({...formData, department: e.target.value})}
                    placeholder="e.g. TIF"
                    className="w-full h-12 px-5 bg-slate-50 border border-slate-100 rounded-xl focus:outline-none focus:ring-4 focus:ring-sky-100 transition-all font-bold text-sm"
                 />
              </div>
              <div className="space-y-1.5 col-span-2">
                 <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Password</label>
                 <input 
                    required={!user}
                    type="password"
                    value={formData.password}
                    onChange={e => setFormData({...formData, password: e.target.value})}
                    placeholder={user ? "(Biarkan kosong jika tidak diubah)" : "••••••••"}
                    className="w-full h-12 px-5 bg-slate-50 border border-slate-100 rounded-xl focus:outline-none focus:ring-4 focus:ring-sky-100 transition-all font-bold text-sm"
                 />
              </div>
            </div>

            <button 
               disabled={isSyncing}
               className="w-full h-14 bg-[#0ea5e9] text-white rounded-xl font-black text-sm shadow-xl shadow-sky-100 hover:-translate-y-1 active:scale-95 transition-all flex items-center justify-center gap-3 disabled:opacity-50 disabled:translate-y-0 mt-6"
            >
               {isSyncing ? <Loader2 className="animate-spin" /> : 'SIMPAN DATA'}
            </button>
         </form>
      </div>
    </div>
  );
};

export default UserManagement;
