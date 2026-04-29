import React, { useState } from 'react';
import { Plus, Edit2, Trash2, X, Loader2, Calendar } from 'lucide-react';
import { cloudSync } from '../utils/cloudSync';

const EventManagement = ({ events, currentUser, onRefresh }) => {
  const [showModal, setShowModal] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  const [isSyncing, setIsSyncing] = useState(false);

  const handleAdd = () => {
    setEditingEvent(null);
    setShowModal(true);
  };

  const handleEdit = (event) => {
    setEditingEvent(event);
    setShowModal(true);
  };

  const handleDelete = async (event_id) => {
    if (!window.confirm('Hapus event ini?')) return;
    setIsSyncing(true);
    await cloudSync.push('events', event_id, null);
    if (onRefresh) await onRefresh();
    setIsSyncing(false);
  };

  const handleSave = async (eventData) => {
    setIsSyncing(true);
    const eventId = eventData.event_id || `EVT-${Date.now()}`;
    const newEvent = { ...eventData, event_id: eventId };
    
    await cloudSync.push('events', eventId, newEvent);
    if (onRefresh) await onRefresh();
    
    setIsSyncing(false);
    setShowModal(false);
  };

  return (
    <div className="animate-fade-in relative">
      <header className="mb-10 flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-black text-[#0f172a] mb-2 font-['Outfit']">Event Management</h1>
          <p className="text-[#64748b]">Daftar program hibah yang tersedia dan riwayat kegiatan.</p>
        </div>
        <button 
          onClick={handleAdd}
          className="bg-[#0ea5e9] text-white px-6 py-3 rounded-2xl font-black text-sm shadow-xl shadow-sky-100 flex items-center gap-2 hover:-translate-y-1 transition-all"
        >
          <Plus size={18} />
          TAMBAH EVENT
        </button>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {events?.map((e, i) => (
          <div key={i} className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm flex flex-col gap-4 group hover:border-sky-200 hover:shadow-lg transition-all">
            <div className="flex items-center justify-between">
              <span className="px-3 py-1 bg-indigo-50 text-indigo-600 rounded-full text-[10px] font-black uppercase tracking-wider">
                {e.category || 'General'}
              </span>
              <span className="text-xs font-bold text-slate-400">{e.start_date} s/d {e.end_date}</span>
            </div>
            <h3 className="text-xl font-black text-slate-800 leading-tight group-hover:text-sky-600 transition-colors">
              {e.event_name}
            </h3>
            <div className="text-sm font-medium text-slate-500 line-clamp-2">
              Batas Pagu: {e.allocated_fee || 'Tidak ditentukan'}
            </div>
            <div className="mt-4 pt-4 border-t border-slate-100 flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
               <button onClick={() => handleEdit(e)} className="p-2 text-slate-400 hover:text-sky-500 transition-colors bg-slate-50 rounded-lg">
                 <Edit2 size={16} />
               </button>
               <button onClick={() => handleDelete(e.event_id)} className="p-2 text-slate-400 hover:text-rose-500 transition-colors bg-slate-50 rounded-lg">
                 <Trash2 size={16} />
               </button>
            </div>
          </div>
        ))}
        {(!events || events.length === 0) && (
          <div className="col-span-full p-8 text-center bg-white rounded-[2rem] border border-slate-100 shadow-sm">
            <p className="text-slate-500 font-medium">Belum ada data event.</p>
          </div>
        )}
      </div>

      {showModal && (
        <EventModal 
          event={editingEvent} 
          onSave={handleSave} 
          onClose={() => setShowModal(false)}
          isSyncing={isSyncing}
        />
      )}
    </div>
  );
};

const EventModal = ({ event, onSave, onClose, isSyncing }) => {
  const [formData, setFormData] = useState(event || { 
    event_id: '',
    event_name: '', 
    category: '', 
    start_date: '', 
    end_date: '', 
    allocated_fee: '',
    status: 'ACTIVE'
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
               <Calendar size={24} />
            </div>
            <div>
               <h2 className="text-2xl font-black font-['Outfit'] text-[#0f172a]">{event ? 'Edit Event' : 'Tambah Event'}</h2>
               <p className="text-sm text-slate-500 font-medium">Lengkapi detail program hibah/event.</p>
            </div>
         </div>

         <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5 col-span-2">
                 <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Nama Event</label>
                 <input 
                    required
                    value={formData.event_name}
                    onChange={e => setFormData({...formData, event_name: e.target.value})}
                    placeholder="e.g. Hibah Penelitian Dosen 2026"
                    className="w-full h-12 px-5 bg-slate-50 border border-slate-100 rounded-xl focus:outline-none focus:ring-4 focus:ring-sky-100 transition-all font-bold text-sm"
                 />
              </div>
              <div className="space-y-1.5">
                 <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Kategori</label>
                 <input 
                    required
                    value={formData.category}
                    onChange={e => setFormData({...formData, category: e.target.value})}
                    placeholder="e.g. PENELITIAN"
                    className="w-full h-12 px-5 bg-slate-50 border border-slate-100 rounded-xl focus:outline-none focus:ring-4 focus:ring-sky-100 transition-all font-bold text-sm"
                 />
              </div>
              <div className="space-y-1.5">
                 <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Batas Pagu (Rp)</label>
                 <input 
                    value={formData.allocated_fee}
                    onChange={e => setFormData({...formData, allocated_fee: e.target.value})}
                    placeholder="e.g. 50000000"
                    type="number"
                    className="w-full h-12 px-5 bg-slate-50 border border-slate-100 rounded-xl focus:outline-none focus:ring-4 focus:ring-sky-100 transition-all font-bold text-sm"
                 />
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
                 <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Status</label>
                 <select 
                    value={formData.status}
                    onChange={e => setFormData({...formData, status: e.target.value})}
                    className="w-full h-12 px-5 bg-slate-50 border border-slate-100 rounded-xl focus:outline-none focus:ring-4 focus:ring-sky-100 transition-all font-bold text-sm appearance-none"
                 >
                    <option value="ACTIVE">ACTIVE</option>
                    <option value="DRAFT">DRAFT</option>
                    <option value="CLOSED">CLOSED</option>
                 </select>
              </div>
            </div>

            <button 
               disabled={isSyncing}
               className="w-full h-14 bg-[#0ea5e9] text-white rounded-xl font-black text-sm shadow-xl shadow-sky-100 hover:-translate-y-1 active:scale-95 transition-all flex items-center justify-center gap-3 disabled:opacity-50 disabled:translate-y-0 mt-6"
            >
               {isSyncing ? <Loader2 className="animate-spin" /> : 'SIMPAN EVENT'}
            </button>
         </form>
      </div>
    </div>
  );
};

export default EventManagement;
