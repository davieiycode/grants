import React, { useState } from 'react';
import { Plus, Edit2, Trash2, X, Loader2, FileText } from 'lucide-react';
import { cloudSync } from '../utils/cloudSync';

const ProposalManagement = ({ proposals, events, users, currentUser, onRefresh }) => {
  const [showModal, setShowModal] = useState(false);
  const [editingProposal, setEditingProposal] = useState(null);
  const [isSyncing, setIsSyncing] = useState(false);

  const handleAdd = () => {
    setEditingProposal(null);
    setShowModal(true);
  };

  const handleEdit = (proposal) => {
    setEditingProposal(proposal);
    setShowModal(true);
  };

  const handleDelete = async (proposal_id) => {
    if (!window.confirm('Hapus proposal ini?')) return;
    setIsSyncing(true);
    await cloudSync.push('proposals', proposal_id, null);
    if (onRefresh) await onRefresh();
    setIsSyncing(false);
  };

  const handleSave = async (proposalData) => {
    setIsSyncing(true);
    const proposalId = proposalData.proposal_id || `PRP-${Date.now()}`;
    const newProposal = { ...proposalData, proposal_id: proposalId };
    
    await cloudSync.push('proposals', proposalId, newProposal);
    if (onRefresh) await onRefresh();
    
    setIsSyncing(false);
    setShowModal(false);
  };

  return (
    <div className="animate-fade-in relative">
      <header className="mb-10 flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-black text-[#0f172a] mb-2 font-['Outfit']">Proposal Management</h1>
          <p className="text-[#64748b]">Daftar usulan proposal yang telah diajukan.</p>
        </div>
        <button 
          onClick={handleAdd}
          className="bg-[#0ea5e9] text-white px-6 py-3 rounded-2xl font-black text-sm shadow-xl shadow-sky-100 flex items-center gap-2 hover:-translate-y-1 transition-all"
        >
          <Plus size={18} />
          TAMBAH PROPOSAL
        </button>
      </header>

      <div className="bg-white rounded-[2rem] border border-slate-100 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 border-b border-slate-100 text-slate-500 uppercase tracking-wider font-bold">
              <tr>
                <th className="p-6">ID Proposal</th>
                <th className="p-6">Judul</th>
                <th className="p-6">Pengusul</th>
                <th className="p-6">Status</th>
                <th className="p-6">Tanggal</th>
                <th className="p-6 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {proposals?.map((p, i) => {
                const event = events?.find(e => e.event_id === p.event_id) || {};
                const user = users?.find(u => u.user_id === p.user_id) || {};
                
                return (
                  <tr key={i} className="hover:bg-slate-50 transition-colors">
                    <td className="p-6 font-medium text-slate-800">{p.proposal_id}</td>
                    <td className="p-6">
                      <div className="font-bold text-slate-800 mb-1">{p.title_proposal}</div>
                      <div className="text-xs text-slate-500">{event.event_name || p.event_id}</div>
                    </td>
                    <td className="p-6 text-slate-600">{user.full_name || p.user_id}</td>
                    <td className="p-6">
                      <span className="px-3 py-1 bg-amber-50 text-amber-700 rounded-full text-xs font-bold tracking-wide">
                        {p.status || 'Draft'}
                      </span>
                    </td>
                    <td className="p-6 text-slate-600">{p.submission_date}</td>
                    <td className="p-6 flex justify-end gap-2">
                      <button onClick={() => handleEdit(p)} className="p-2 text-slate-400 hover:text-sky-500 transition-colors bg-white rounded-lg border border-slate-200 shadow-sm">
                        <Edit2 size={16} />
                      </button>
                      <button onClick={() => handleDelete(p.proposal_id)} className="p-2 text-slate-400 hover:text-rose-500 transition-colors bg-white rounded-lg border border-slate-200 shadow-sm">
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                );
              })}
              {(!proposals || proposals.length === 0) && (
                <tr>
                  <td colSpan="6" className="p-8 text-center text-slate-500 font-medium">Belum ada data proposal.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <ProposalModal 
          proposal={editingProposal} 
          events={events}
          users={users}
          onSave={handleSave} 
          onClose={() => setShowModal(false)}
          isSyncing={isSyncing}
        />
      )}
    </div>
  );
};

const ProposalModal = ({ proposal, events, users, onSave, onClose, isSyncing }) => {
  const [formData, setFormData] = useState(proposal || { 
    proposal_id: '',
    event_id: '',
    user_id: '',
    title_proposal: '', 
    submission_date: new Date().toISOString().split('T')[0], 
    status: 'Draft'
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
               <FileText size={24} />
            </div>
            <div>
               <h2 className="text-2xl font-black font-['Outfit'] text-[#0f172a]">{proposal ? 'Edit Proposal' : 'Tambah Proposal'}</h2>
               <p className="text-sm text-slate-500 font-medium">Lengkapi detail pengajuan proposal.</p>
            </div>
         </div>

         <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5 col-span-2">
                 <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Judul Proposal</label>
                 <input 
                    required
                    value={formData.title_proposal}
                    onChange={e => setFormData({...formData, title_proposal: e.target.value})}
                    placeholder="e.g. Pengembangan Sistem AI..."
                    className="w-full h-12 px-5 bg-slate-50 border border-slate-100 rounded-xl focus:outline-none focus:ring-4 focus:ring-sky-100 transition-all font-bold text-sm"
                 />
              </div>

              <div className="space-y-1.5 col-span-2">
                 <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Event / Program</label>
                 <select 
                    required
                    value={formData.event_id}
                    onChange={e => setFormData({...formData, event_id: e.target.value})}
                    className="w-full h-12 px-5 bg-slate-50 border border-slate-100 rounded-xl focus:outline-none focus:ring-4 focus:ring-sky-100 transition-all font-bold text-sm appearance-none"
                 >
                    <option value="">-- Pilih Event --</option>
                    {events?.map(e => (
                      <option key={e.event_id} value={e.event_id}>{e.event_name}</option>
                    ))}
                 </select>
              </div>

              <div className="space-y-1.5 col-span-2">
                 <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Pengusul</label>
                 <select 
                    required
                    value={formData.user_id}
                    onChange={e => setFormData({...formData, user_id: e.target.value})}
                    className="w-full h-12 px-5 bg-slate-50 border border-slate-100 rounded-xl focus:outline-none focus:ring-4 focus:ring-sky-100 transition-all font-bold text-sm appearance-none"
                 >
                    <option value="">-- Pilih Pengusul --</option>
                    {users?.map(u => (
                      <option key={u.user_id} value={u.user_id}>{u.full_name || u.name} ({u.email_address})</option>
                    ))}
                 </select>
              </div>

              <div className="space-y-1.5">
                 <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Status</label>
                 <select 
                    value={formData.status}
                    onChange={e => setFormData({...formData, status: e.target.value})}
                    className="w-full h-12 px-5 bg-slate-50 border border-slate-100 rounded-xl focus:outline-none focus:ring-4 focus:ring-sky-100 transition-all font-bold text-sm appearance-none"
                 >
                    <option value="Draft">Draft</option>
                    <option value="Submitted">Submitted</option>
                    <option value="Under Review">Under Review</option>
                    <option value="Approved">Approved</option>
                    <option value="Rejected">Rejected</option>
                 </select>
              </div>

              <div className="space-y-1.5">
                 <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Tanggal Submit</label>
                 <input 
                    type="date"
                    required
                    value={formData.submission_date}
                    onChange={e => setFormData({...formData, submission_date: e.target.value})}
                    className="w-full h-12 px-5 bg-slate-50 border border-slate-100 rounded-xl focus:outline-none focus:ring-4 focus:ring-sky-100 transition-all font-bold text-sm"
                 />
              </div>
            </div>

            <button 
               disabled={isSyncing}
               className="w-full h-14 bg-[#0ea5e9] text-white rounded-xl font-black text-sm shadow-xl shadow-sky-100 hover:-translate-y-1 active:scale-95 transition-all flex items-center justify-center gap-3 disabled:opacity-50 disabled:translate-y-0 mt-6"
            >
               {isSyncing ? <Loader2 className="animate-spin" /> : 'SIMPAN PROPOSAL'}
            </button>
         </form>
      </div>
    </div>
  );
};

export default ProposalManagement;
