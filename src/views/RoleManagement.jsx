import React, { useState } from 'react';
import { Plus, Edit2, Trash2, X, Loader2, ShieldCheck } from 'lucide-react';
import { cloudSync } from '../utils/cloudSync';

const RoleManagement = ({ roles, currentUser, onRefresh }) => {
  const [showModal, setShowModal] = useState(false);
  const [editingRole, setEditingRole] = useState(null);
  const [isSyncing, setIsSyncing] = useState(false);

  const handleAdd = () => {
    setEditingRole(null);
    setShowModal(true);
  };

  const handleEdit = (role) => {
    setEditingRole(role);
    setShowModal(true);
  };

  const handleDelete = async (role_id) => {
    if (!window.confirm('Hapus role ini?')) return;
    setIsSyncing(true);
    await cloudSync.push('roles', role_id, null);
    if (onRefresh) await onRefresh();
    setIsSyncing(false);
  };

  const handleSave = async (roleData) => {
    setIsSyncing(true);
    const roleId = roleData.role_id || `ROLE-${Date.now()}`;
    const newRole = { ...roleData, role_id: roleId };
    
    await cloudSync.push('roles', roleId, newRole);
    if (onRefresh) await onRefresh();
    
    setIsSyncing(false);
    setShowModal(false);
  };

  const renderPermissions = (permString) => {
    if (!permString) return <span className="text-slate-400 italic text-xs">-</span>;
    const perms = permString.split(',').map(s => s.trim()).filter(s => s);
    return (
      <div className="flex flex-wrap gap-1">
        {perms.map((p, idx) => (
          <span key={idx} className="px-2 py-0.5 bg-slate-100 text-slate-600 rounded text-[10px] font-bold uppercase tracking-wider">
            {p}
          </span>
        ))}
      </div>
    );
  };

  return (
    <div className="animate-fade-in relative">
      <header className="mb-10 flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-black text-[#0f172a] mb-2 font-['Outfit']">Role Management</h1>
          <p className="text-[#64748b]">Konfigurasi perizinan dan akses role pada sistem.</p>
        </div>
        <button 
          onClick={handleAdd}
          className="bg-[#0ea5e9] text-white px-6 py-3 rounded-2xl font-black text-sm shadow-xl shadow-sky-100 flex items-center gap-2 hover:-translate-y-1 transition-all"
        >
          <Plus size={18} />
          TAMBAH ROLE
        </button>
      </header>

      <div className="bg-white rounded-[2rem] border border-slate-100 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 border-b border-slate-100 text-slate-500 uppercase tracking-wider font-bold">
              <tr>
                <th className="p-4 w-16">ID</th>
                <th className="p-4 w-32">Role Name</th>
                <th className="p-4 w-48">View Access</th>
                <th className="p-4 w-48">Add Access</th>
                <th className="p-4 w-48">Edit Access</th>
                <th className="p-4 w-48">Delete Access</th>
                <th className="p-4 w-48">Restore Access</th>
                <th className="p-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {roles?.map((r, i) => (
                <tr key={i} className="hover:bg-slate-50 transition-colors">
                  <td className="p-4 font-medium text-slate-800">{r.role_id}</td>
                  <td className="p-4 font-black text-sky-600 uppercase tracking-wide">{r.role_name}</td>
                  <td className="p-4">{renderPermissions(r.view_access)}</td>
                  <td className="p-4">{renderPermissions(r.add_access)}</td>
                  <td className="p-4">{renderPermissions(r.edit_access)}</td>
                  <td className="p-4">{renderPermissions(r.delete_access)}</td>
                  <td className="p-4">{renderPermissions(r.restore_access)}</td>
                  <td className="p-4 flex justify-end gap-2">
                    <button onClick={() => handleEdit(r)} className="p-2 text-slate-400 hover:text-sky-500 transition-colors bg-white rounded-lg border border-slate-200 shadow-sm">
                      <Edit2 size={16} />
                    </button>
                    <button onClick={() => handleDelete(r.role_id)} className="p-2 text-slate-400 hover:text-rose-500 transition-colors bg-white rounded-lg border border-slate-200 shadow-sm">
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))}
              {(!roles || roles.length === 0) && (
                <tr>
                  <td colSpan="8" className="p-8 text-center text-slate-500 font-medium">Belum ada data role.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <RoleModal 
          role={editingRole} 
          onSave={handleSave} 
          onClose={() => setShowModal(false)}
          isSyncing={isSyncing}
        />
      )}
    </div>
  );
};

const RoleModal = ({ role, onSave, onClose, isSyncing }) => {
  const [formData, setFormData] = useState(role || { 
    role_id: '',
    role_name: '', 
    view_access: '', 
    add_access: '', 
    edit_access: '', 
    delete_access: '',
    restore_access: ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
      <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-md" onClick={onClose} />
      <div className="bg-white rounded-[2.5rem] w-full max-w-2xl p-10 relative shadow-2xl animate-in slide-in-from-bottom-8 duration-500 max-h-[90vh] overflow-y-auto">
         <button onClick={onClose} className="absolute top-8 right-8 text-slate-300 hover:text-slate-600 transition-colors">
            <X size={24} />
         </button>
         
         <div className="flex items-center gap-4 mb-8">
            <div className="w-12 h-12 bg-sky-50 text-[#0ea5e9] rounded-2xl flex items-center justify-center">
               <ShieldCheck size={24} />
            </div>
            <div>
               <h2 className="text-2xl font-black font-['Outfit'] text-[#0f172a]">{role ? 'Edit Role' : 'Tambah Role Baru'}</h2>
               <p className="text-sm text-slate-500 font-medium">Pisahkan permission dengan koma (,).</p>
            </div>
         </div>

         <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                 <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Role ID</label>
                 <input 
                    required
                    disabled={!!role}
                    value={formData.role_id}
                    onChange={e => setFormData({...formData, role_id: e.target.value})}
                    placeholder="e.g. 1"
                    className="w-full h-12 px-5 bg-slate-50 border border-slate-100 rounded-xl focus:outline-none focus:ring-4 focus:ring-sky-100 transition-all font-bold text-sm disabled:opacity-50"
                 />
              </div>
              <div className="space-y-1.5">
                 <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Role Name</label>
                 <input 
                    required
                    value={formData.role_name}
                    onChange={e => setFormData({...formData, role_name: e.target.value})}
                    placeholder="e.g. admin"
                    className="w-full h-12 px-5 bg-slate-50 border border-slate-100 rounded-xl focus:outline-none focus:ring-4 focus:ring-sky-100 transition-all font-bold text-sm"
                 />
              </div>
              
              <div className="space-y-1.5 col-span-2">
                 <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">View Access</label>
                 <textarea 
                    value={formData.view_access}
                    onChange={e => setFormData({...formData, view_access: e.target.value})}
                    placeholder="self_user, other_user, role..."
                    className="w-full min-h-[60px] p-4 bg-slate-50 border border-slate-100 rounded-xl focus:outline-none focus:ring-4 focus:ring-sky-100 transition-all font-medium text-sm resize-y"
                 />
              </div>

              <div className="space-y-1.5 col-span-2">
                 <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Add Access</label>
                 <textarea 
                    value={formData.add_access}
                    onChange={e => setFormData({...formData, add_access: e.target.value})}
                    placeholder="self_user, managed_event..."
                    className="w-full min-h-[60px] p-4 bg-slate-50 border border-slate-100 rounded-xl focus:outline-none focus:ring-4 focus:ring-sky-100 transition-all font-medium text-sm resize-y"
                 />
              </div>

              <div className="space-y-1.5 col-span-2">
                 <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Edit Access</label>
                 <textarea 
                    value={formData.edit_access}
                    onChange={e => setFormData({...formData, edit_access: e.target.value})}
                    placeholder="self_user, managed_event..."
                    className="w-full min-h-[60px] p-4 bg-slate-50 border border-slate-100 rounded-xl focus:outline-none focus:ring-4 focus:ring-sky-100 transition-all font-medium text-sm resize-y"
                 />
              </div>

              <div className="space-y-1.5 col-span-2">
                 <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Delete Access</label>
                 <textarea 
                    value={formData.delete_access}
                    onChange={e => setFormData({...formData, delete_access: e.target.value})}
                    placeholder="self_user, managed_event..."
                    className="w-full min-h-[60px] p-4 bg-slate-50 border border-slate-100 rounded-xl focus:outline-none focus:ring-4 focus:ring-sky-100 transition-all font-medium text-sm resize-y"
                 />
              </div>

              <div className="space-y-1.5 col-span-2">
                 <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Restore Access</label>
                 <textarea 
                    value={formData.restore_access}
                    onChange={e => setFormData({...formData, restore_access: e.target.value})}
                    placeholder="self_user, managed_event..."
                    className="w-full min-h-[60px] p-4 bg-slate-50 border border-slate-100 rounded-xl focus:outline-none focus:ring-4 focus:ring-sky-100 transition-all font-medium text-sm resize-y"
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

export default RoleManagement;
