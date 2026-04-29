import React, { useState } from 'react';
import { Plus, Edit2, Trash2, X, Loader2, CheckSquare } from 'lucide-react';
import { cloudSync } from '../utils/cloudSync';

const ReviewManagement = ({ reviews, proposals, users, currentUser, onRefresh }) => {
  const [showModal, setShowModal] = useState(false);
  const [editingReview, setEditingReview] = useState(null);
  const [isSyncing, setIsSyncing] = useState(false);

  const handleAdd = () => {
    setEditingReview(null);
    setShowModal(true);
  };

  const handleEdit = (review) => {
    setEditingReview(review);
    setShowModal(true);
  };

  const handleDelete = async (review_id) => {
    if (!window.confirm('Hapus penugasan review ini?')) return;
    setIsSyncing(true);
    await cloudSync.push('reviews', review_id, null);
    if (onRefresh) await onRefresh();
    setIsSyncing(false);
  };

  const handleSave = async (reviewData) => {
    setIsSyncing(true);
    const reviewId = reviewData.review_id || `REV-${Date.now()}`;
    const newReview = { ...reviewData, review_id: reviewId };
    
    await cloudSync.push('reviews', reviewId, newReview);
    if (onRefresh) await onRefresh();
    
    setIsSyncing(false);
    setShowModal(false);
  };

  return (
    <div className="animate-fade-in relative">
      <header className="mb-10 flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-black text-[#0f172a] mb-2 font-['Outfit']">Review Management</h1>
          <p className="text-[#64748b]">Daftar review proposal oleh reviewer yang ditugaskan.</p>
        </div>
        <button 
          onClick={handleAdd}
          className="bg-[#0ea5e9] text-white px-6 py-3 rounded-2xl font-black text-sm shadow-xl shadow-sky-100 flex items-center gap-2 hover:-translate-y-1 transition-all"
        >
          <Plus size={18} />
          TAMBAH REVIEW
        </button>
      </header>

      <div className="bg-white rounded-[2rem] border border-slate-100 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 border-b border-slate-100 text-slate-500 uppercase tracking-wider font-bold">
              <tr>
                <th className="p-6">ID Review</th>
                <th className="p-6">Proposal</th>
                <th className="p-6">Reviewer</th>
                <th className="p-6">Status</th>
                <th className="p-6">Selesai Pada</th>
                <th className="p-6 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {reviews?.map((r, i) => {
                const prop = proposals?.find(p => p.proposal_id === r.proposal_id) || {};
                const reviewer = users?.find(u => u.user_id === r.user_id) || {};
                
                return (
                  <tr key={i} className="hover:bg-slate-50 transition-colors">
                    <td className="p-6 font-medium text-slate-800">{r.review_id}</td>
                    <td className="p-6">
                      <div className="font-bold text-slate-800 max-w-[200px] truncate">{prop.title_proposal || r.proposal_id}</div>
                    </td>
                    <td className="p-6 text-slate-600">{reviewer.full_name || reviewer.name || r.user_id}</td>
                    <td className="p-6">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold tracking-wide ${r.complete_date ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'}`}>
                        {r.complete_date ? 'Selesai' : 'Pending'}
                      </span>
                    </td>
                    <td className="p-6 text-slate-600">{r.complete_date || '-'}</td>
                    <td className="p-6 flex justify-end gap-2">
                      <button onClick={() => handleEdit(r)} className="p-2 text-slate-400 hover:text-sky-500 transition-colors bg-white rounded-lg border border-slate-200 shadow-sm">
                        <Edit2 size={16} />
                      </button>
                      <button onClick={() => handleDelete(r.review_id)} className="p-2 text-slate-400 hover:text-rose-500 transition-colors bg-white rounded-lg border border-slate-200 shadow-sm">
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                );
              })}
              {(!reviews || reviews.length === 0) && (
                <tr>
                  <td colSpan="6" className="p-8 text-center text-slate-500 font-medium">Belum ada data review.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <ReviewModal 
          review={editingReview} 
          proposals={proposals}
          users={users}
          onSave={handleSave} 
          onClose={() => setShowModal(false)}
          isSyncing={isSyncing}
        />
      )}
    </div>
  );
};

const ReviewModal = ({ review, proposals, users, onSave, onClose, isSyncing }) => {
  const [formData, setFormData] = useState(review || { 
    review_id: '',
    proposal_id: '',
    user_id: '',
    complete_date: '', 
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
            <div className="w-12 h-12 bg-sky-50 text-[#0ea5e9] rounded-2xl flex items-center justify-center">
               <CheckSquare size={24} />
            </div>
            <div>
               <h2 className="text-2xl font-black font-['Outfit'] text-[#0f172a]">{review ? 'Edit Review' : 'Tugaskan Review'}</h2>
               <p className="text-sm text-slate-500 font-medium">Lengkapi detail penugasan review proposal.</p>
            </div>
         </div>

         <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5 col-span-2">
                 <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Pilih Proposal</label>
                 <select 
                    required
                    value={formData.proposal_id}
                    onChange={e => setFormData({...formData, proposal_id: e.target.value})}
                    className="w-full h-12 px-5 bg-slate-50 border border-slate-100 rounded-xl focus:outline-none focus:ring-4 focus:ring-sky-100 transition-all font-bold text-sm appearance-none"
                 >
                    <option value="">-- Pilih Proposal --</option>
                    {proposals?.map(p => (
                      <option key={p.proposal_id} value={p.proposal_id}>{p.title_proposal} ({p.proposal_id})</option>
                    ))}
                 </select>
              </div>

              <div className="space-y-1.5 col-span-2">
                 <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Pilih Reviewer</label>
                 <select 
                    required
                    value={formData.user_id}
                    onChange={e => setFormData({...formData, user_id: e.target.value})}
                    className="w-full h-12 px-5 bg-slate-50 border border-slate-100 rounded-xl focus:outline-none focus:ring-4 focus:ring-sky-100 transition-all font-bold text-sm appearance-none"
                 >
                    <option value="">-- Pilih Reviewer --</option>
                    {users?.filter(u => u.role === 'REVIEWER' || u.role === 'SUPERADMIN' || u.role === 'ADMIN').map(u => (
                      <option key={u.user_id} value={u.user_id}>{u.full_name || u.name} ({u.role})</option>
                    ))}
                 </select>
              </div>

              <div className="space-y-1.5">
                 <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Tanggal Selesai</label>
                 <input 
                    type="date"
                    value={formData.complete_date}
                    onChange={e => setFormData({...formData, complete_date: e.target.value})}
                    className="w-full h-12 px-5 bg-slate-50 border border-slate-100 rounded-xl focus:outline-none focus:ring-4 focus:ring-sky-100 transition-all font-bold text-sm"
                 />
              </div>
              
              <div className="space-y-1.5 col-span-2">
                 <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Catatan</label>
                 <textarea 
                    value={formData.notes}
                    onChange={e => setFormData({...formData, notes: e.target.value})}
                    placeholder="Tambahkan catatan khusus penugasan..."
                    className="w-full min-h-[80px] p-4 bg-slate-50 border border-slate-100 rounded-xl focus:outline-none focus:ring-4 focus:ring-sky-100 transition-all font-medium text-sm resize-y"
                 />
              </div>
            </div>

            <button 
               disabled={isSyncing}
               className="w-full h-14 bg-[#0ea5e9] text-white rounded-xl font-black text-sm shadow-xl shadow-sky-100 hover:-translate-y-1 active:scale-95 transition-all flex items-center justify-center gap-3 disabled:opacity-50 disabled:translate-y-0 mt-6"
            >
               {isSyncing ? <Loader2 className="animate-spin" /> : 'SIMPAN REVIEW'}
            </button>
         </form>
      </div>
    </div>
  );
};

export default ReviewManagement;
