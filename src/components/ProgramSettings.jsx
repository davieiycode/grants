import React, { useState } from 'react';
import { Settings, ListTodo, Award, Trash2, Loader2, Plus, Calendar, UserCheck, Shield, ChevronRight, GripVertical, Eye, Edit3, Layers, Monitor, ChevronUp, ChevronDown } from 'lucide-react';
import { cloudSync } from '../utils/cloudSync';
import { useNavigate } from 'react-router-dom';

const ProgramSettings = ({ program, crew }) => {
  const navigate = useNavigate();
  const [activeSubTab, setActiveSubTab] = useState('basic');
  const [formData, setFormData] = useState({ 
    name: program.name, 
    desc: program.desc,
    attributes: Array.isArray(program.attributes) ? program.attributes : 
               Object.entries(program.attributes || {}).map(([k, v]) => ({ id: `attr-${Date.now()}-${Math.random()}`, label: k, type: 'text', group: 'General', readRoles: ['ADMIN', 'PENGUSUL', 'REVIEWER'], editRoles: ['ADMIN', 'PENGUSUL'] })),
    reviewers: program.reviewers || [],
    timeline: program.timeline || []
  });
  const [isSyncing, setIsSyncing] = useState(false);

  const handleSave = async () => {
    setIsSyncing(true);
    const updatedProgram = { ...program, ...formData };
    await cloudSync.push('programs', program.id, updatedProgram);
    
    const localProgs = JSON.parse(localStorage.getItem('grants_programs_meta') || '[]');
    const updatedProgs = localProgs.map(p => String(p.id) === String(program.id) ? updatedProgram : p);
    localStorage.setItem('grants_programs_meta', JSON.stringify(updatedProgs));
    
    setIsSyncing(false);
    window.location.reload();
  };

  const handleDeleteProgram = async () => {
    if (!window.confirm('Are you sure you want to delete this program and all its telemetry?')) return;
    setIsSyncing(true);
    await cloudSync.push('programs', program.id, null);
    
    const localProgs = JSON.parse(localStorage.getItem('grants_programs_meta') || '[]');
    const updatedProgs = localProgs.filter(p => String(p.id) !== String(program.id));
    localStorage.setItem('grants_programs_meta', JSON.stringify(updatedProgs));
    
    setIsSyncing(false);
    navigate('/');
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[280px,1fr] gap-10 p-8 animate-fade-in">
      {/* Sidebar Nav */}
      <aside className="flex flex-col gap-2">
        <SideTab active={activeSubTab === 'basic'} onClick={() => setActiveSubTab('basic')} icon={<Settings size={18} />}>Informasi Dasar</SideTab>
        <SideTab active={activeSubTab === 'attributes'} onClick={() => setActiveSubTab('attributes')} icon={<Layers size={18} />}>Arsitektur Formulir</SideTab>
        <SideTab active={activeSubTab === 'reviewers'} onClick={() => setActiveSubTab('reviewers')} icon={<UserCheck size={18} />}>Personel & Duty</SideTab>
        <SideTab active={activeSubTab === 'timeline'} onClick={() => setActiveSubTab('timeline')} icon={<Calendar size={18} />}>Protokol Linimasa</SideTab>
        
        <div className="mt-8 pt-4 border-t border-slate-100">
           <button 
             onClick={handleDeleteProgram}
             disabled={isSyncing}
             className="flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-sm text-rose-500 hover:bg-rose-50 transition-all w-full text-left disabled:opacity-50"
           >
             <Trash2 size={18} />
             Hapus Program
           </button>
        </div>

        <button 
           onClick={handleSave}
           disabled={isSyncing}
           className="mt-4 w-full bg-[#0f172a] text-white p-4 rounded-2xl font-black text-sm shadow-xl shadow-slate-200 hover:-translate-y-1 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:translate-y-0"
        >
           {isSyncing ? <Loader2 className="animate-spin" size={18} /> : 'SIMPAN PERUBAHAN'}
        </button>
      </aside>

      {/* Main Content */}
      <div className="space-y-10">
        {activeSubTab === 'basic' && (
          <section className="bg-white p-10 rounded-[2.5rem] border border-slate-100 shadow-sm animate-in fade-in slide-in-from-right-4">
            <h3 className="text-2xl font-black font-['Outfit'] mb-8 text-[#0f172a]">Informasi Utama</h3>
            <div className="space-y-8">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1 font-['Outfit']">Nama Program Strategis</label>
                <input 
                  type="text" 
                  value={formData.name} 
                  onChange={e => setFormData({...formData, name: e.target.value})}
                  className="w-full h-16 px-6 bg-slate-50 border border-[#e2e8f0] rounded-[1.5rem] focus:ring-4 focus:ring-sky-100 transition-all font-bold text-lg text-[#0f172a]"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1 font-['Outfit']">Deskripsi Operasional</label>
                <textarea 
                  rows={6}
                  value={formData.desc} 
                  onChange={e => setFormData({...formData, desc: e.target.value})}
                  className="w-full p-6 bg-slate-50 border border-[#e2e8f0] rounded-[1.5rem] focus:ring-4 focus:ring-sky-100 transition-all font-medium text-[#0f172a] leading-relaxed"
                />
              </div>
            </div>
          </section>
        )}

        {activeSubTab === 'attributes' && (
           <AttributeManager 
              attributes={formData.attributes} 
              onUpdate={(newAttrs) => setFormData({...formData, attributes: newAttrs})} 
           />
        )}

        {activeSubTab === 'reviewers' && (
           <ReviewerManager 
              reviewers={formData.reviewers} 
              crew={crew}
              onUpdate={(newRevs) => setFormData({...formData, reviewers: newRevs})} 
           />
        )}

        {activeSubTab === 'timeline' && (
           <TimelineManager 
              timeline={formData.timeline} 
              onUpdate={(newTime) => setFormData({...formData, timeline: newTime})} 
           />
        )}
      </div>
    </div>
  );
};

const AttributeManager = ({ attributes, onUpdate }) => {
  const [editingAttr, setEditingAttr] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const handleAdd = () => {
    const newAttr = {
      id: `attr-${Date.now()}`,
      label: 'Field Baru',
      type: 'text',
      group: 'General',
      readRoles: ['ADMIN', 'PENGUSUL', 'REVIEWER'],
      editRoles: ['ADMIN', 'PENGUSUL']
    };
    onUpdate([...attributes, newAttr]);
    setEditingAttr(newAttr);
    setShowModal(true);
  };

  const handleUpdate = (updated) => {
    onUpdate(attributes.map(a => a.id === updated.id ? updated : a));
    setShowModal(false);
  };

  const handleDelete = (id) => {
    onUpdate(attributes.filter(a => a.id !== id));
  };

  const move = (index, direction) => {
    const nextIndex = index + direction;
    if (nextIndex < 0 || nextIndex >= attributes.length) return;
    const nextArr = [...attributes];
    [nextArr[index], nextArr[nextIndex]] = [nextArr[nextIndex], nextArr[index]];
    onUpdate(nextArr);
  };

  return (
    <section className="bg-white p-10 rounded-[2.5rem] border border-slate-100 shadow-sm animate-in fade-in slide-in-from-right-4">
      <div className="flex justify-between items-center mb-10">
        <h3 className="text-2xl font-black font-['Outfit'] text-[#0f172a]">Arsitektur Formulir</h3>
        <button 
          onClick={handleAdd}
          className="bg-[#0ea5e9] text-white px-6 py-3 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-sky-100 hover:-translate-y-1 transition-all flex items-center gap-2"
        >
          <Plus size={18} /> TAMBAH ATRIBUT
        </button>
      </div>

      <div className="space-y-4">
        {attributes.map((attr, idx) => (
          <div key={attr.id} className="bg-slate-50/50 p-6 rounded-3xl border border-slate-100 flex items-center gap-6 group hover:bg-white hover:border-[#0ea5e9] transition-all">
             <div className="flex flex-col gap-1">
                <button onClick={() => move(idx, -1)} className="p-1 text-slate-300 hover:text-sky-500 disabled:opacity-0" disabled={idx === 0}><ChevronUp size={16} /></button>
                <button onClick={() => move(idx, 1)} className="p-1 text-slate-300 hover:text-sky-500 disabled:opacity-0" disabled={idx === attributes.length - 1}><ChevronDown size={16} /></button>
             </div>
             
             <div className="flex-1">
                <div className="flex items-center gap-3 mb-1">
                   <div className="text-[10px] font-black bg-white border border-slate-200 text-slate-400 px-2 py-0.5 rounded uppercase tracking-widest">{attr.group || 'General'}</div>
                   <div className="text-[10px] font-black bg-sky-50 text-sky-600 px-2 py-0.5 rounded uppercase tracking-widest">{attr.type || 'Text'}</div>
                </div>
                <div className="font-black text-[#0f172a] font-['Outfit']">{attr.label}</div>
             </div>

             <div className="flex items-center gap-6 px-6 border-x border-slate-200">
                <div className="flex flex-col">
                   <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Visibility</span>
                   <div className="flex gap-1 mt-1">
                      {attr.readRoles?.map(r => <div key={r} title={`Can Read: ${r}`} className="w-1.5 h-1.5 rounded-full bg-emerald-400" />)}
                   </div>
                </div>
                <div className="flex flex-col">
                   <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Edit Power</span>
                   <div className="flex gap-1 mt-1">
                      {attr.editRoles?.map(r => <div key={r} title={`Can Edit: ${r}`} className="w-1.5 h-1.5 rounded-full bg-amber-400" />)}
                   </div>
                </div>
             </div>

             <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-all">
                <button onClick={() => { setEditingAttr(attr); setShowModal(true); }} className="p-3 bg-white text-slate-400 hover:text-sky-500 rounded-xl shadow-sm border border-slate-100">
                   <Edit3 size={18} />
                </button>
                <button onClick={() => handleDelete(attr.id)} className="p-3 bg-white text-slate-400 hover:text-rose-500 rounded-xl shadow-sm border border-slate-100">
                   <Trash2 size={18} />
                </button>
             </div>
          </div>
        ))}
      </div>

      {showModal && editingAttr && (
        <AttributeModal 
          attr={editingAttr} 
          onSave={handleUpdate} 
          onClose={() => setShowModal(false)} 
        />
      )}
    </section>
  );
};

const AttributeModal = ({ attr, onSave, onClose }) => {
  const [data, setData] = useState({ ...attr });
  const roles = ['SUPERADMIN', 'ADMIN', 'MANAGER', 'EDITOR', 'REVIEWER', 'PENGUSUL'];
  const types = ['Text', 'Number', 'Date', 'Select', 'TextArea', 'FileUpload', 'Checkbox'];

  const toggleRole = (listName, role) => {
    const list = data[listName] || [];
    const next = list.includes(role) ? list.filter(r => r !== role) : [...list, role];
    setData({ ...data, [listName]: next });
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md animate-in fade-in" onClick={onClose} />
      <div className="bg-white rounded-[3rem] w-full max-w-xl p-10 relative shadow-2xl animate-in zoom-in-95 duration-300">
         <h2 className="text-3xl font-black font-['Outfit'] text-[#0f172a] mb-2">Konfigurasi Atribut</h2>
         <p className="text-slate-500 font-medium mb-10">Atur parameter teknis dan hak akses untuk field ini.</p>

         <div className="grid grid-cols-2 gap-6 mb-10">
            <div className="col-span-2 space-y-2">
               <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Label Field</label>
               <input 
                  value={data.label}
                  onChange={e => setData({...data, label: e.target.value})}
                  className="w-full h-14 px-6 bg-slate-50 border border-slate-100 rounded-2xl font-bold"
               />
            </div>
            <div className="space-y-2">
               <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Tipe Isian</label>
               <select 
                  value={data.type}
                  onChange={e => setData({...data, type: e.target.value})}
                  className="w-full h-14 px-6 bg-slate-50 border border-slate-100 rounded-2xl font-bold appearance-none"
               >
                  {types.map(t => <option key={t} value={t}>{t}</option>)}
               </select>
            </div>
            <div className="space-y-2">
               <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Grup / Kategori</label>
               <input 
                  value={data.group}
                  onChange={e => setData({...data, group: e.target.value})}
                  className="w-full h-14 px-6 bg-slate-50 border border-slate-100 rounded-2xl font-bold"
               />
            </div>
         </div>

         <div className="space-y-8 mb-10">
            <div>
               <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1 block mb-4">Izin Baca (Who can see this?)</label>
               <div className="flex flex-wrap gap-2">
                  {roles.map(r => (
                    <button 
                      key={r} 
                      onClick={() => toggleRole('readRoles', r)}
                      className={`px-4 py-2 rounded-xl text-[10px] font-black transition-all ${data.readRoles?.includes(r) ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-100' : 'bg-slate-100 text-slate-400 hover:bg-slate-200'}`}
                    >
                      {r}
                    </button>
                  ))}
               </div>
            </div>
            <div>
               <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1 block mb-4">Izin Edit (Who can fill this?)</label>
               <div className="flex flex-wrap gap-2">
                  {roles.map(r => (
                    <button 
                      key={r} 
                      onClick={() => toggleRole('editRoles', r)}
                      className={`px-4 py-2 rounded-xl text-[10px] font-black transition-all ${data.editRoles?.includes(r) ? 'bg-amber-500 text-white shadow-lg shadow-amber-100' : 'bg-slate-100 text-slate-400 hover:bg-slate-200'}`}
                    >
                      {r}
                    </button>
                  ))}
               </div>
            </div>
         </div>

         <button 
            onClick={() => onSave(data)}
            className="w-full h-16 bg-[#0f172a] text-white rounded-[1.5rem] font-black text-sm shadow-xl hover:-translate-y-1 transition-all"
         >
            SIMPAN KONFIGURASI
         </button>
      </div>
    </div>
  );
};

const ReviewerManager = ({ reviewers, crew, onUpdate }) => {
  const [selectedCrew, setSelectedCrew] = useState('');
  const [selectedRole, setSelectedRole] = useState('REVIEWER');

  const handleAdd = () => {
    if (!selectedCrew || (reviewers || []).find(r => r.email === selectedCrew)) return;
    const assignment = { email: selectedCrew, role: selectedRole };
    onUpdate([...(reviewers || []), assignment]);
    setSelectedCrew('');
  };

  const handleRemove = (email) => {
    onUpdate(reviewers.filter(r => r.email !== email));
  };

  return (
    <section className="bg-white p-10 rounded-[2.5rem] border border-slate-100 shadow-sm animate-in fade-in slide-in-from-right-4">
      <h3 className="text-2xl font-black font-['Outfit'] mb-8 text-[#0f172a]">Personel & Duty</h3>

      <div className="flex flex-col md:flex-row gap-4 mb-10 p-8 bg-slate-50/50 border border-slate-100 rounded-[2rem]">
         <div className="flex-1 space-y-1.5">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Pilih Personel Crew</label>
            <select 
              value={selectedCrew}
              onChange={e => setSelectedCrew(e.target.value)}
              className="w-full h-14 px-5 bg-white border border-slate-200 rounded-2xl font-bold appearance-none shadow-sm"
            >
              <option value="">Select Personnel...</option>
              {(crew || []).map((c, i) => (
                <option key={i} value={c.email}>{c.name} ({c.role})</option>
              ))}
            </select>
         </div>
         <div className="w-full md:w-56 space-y-1.5">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Peran di Program</label>
            <select 
              value={selectedRole}
              onChange={e => setSelectedRole(e.target.value)}
              className="w-full h-14 px-5 bg-white border border-slate-200 rounded-2xl font-bold appearance-none shadow-sm"
            >
              <option value="REVIEWER">REVIEWER</option>
              <option value="STAFF">STAFF PIC</option>
              <option value="MANAGER">MANAGER</option>
            </select>
         </div>
         <button onClick={handleAdd} className="self-end h-14 px-8 bg-[#0ea5e9] text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-sky-100 shrink-0 hover:-translate-y-1 transition-all">
            Assign Duty
         </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {(reviewers || []).map((assignment, idx) => {
          const person = crew.find(c => c.email === assignment.email);
          return (
            <div key={idx} className="bg-white p-6 rounded-[2rem] border border-slate-100 flex items-center justify-between group hover:border-[#0ea5e9] transition-all shadow-sm">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-400 font-black border border-slate-100 shadow-inner">
                   {person?.name?.[0] || 'U'}
                </div>
                <div>
                   <div className="font-bold text-[#0f172a] text-sm">{person?.name || assignment.email}</div>
                   <div className="flex items-center gap-2 mt-1">
                      <span className="text-[8px] font-black bg-sky-50 text-sky-500 px-2 py-0.5 rounded uppercase tracking-widest">Duty: {assignment.role}</span>
                   </div>
                </div>
              </div>
              <button onClick={() => handleRemove(assignment.email)} className="p-3 text-slate-300 hover:text-rose-500 transition-colors">
                <Trash2 size={18} />
              </button>
            </div>
          );
        })}
      </div>
    </section>
  );
};

const TimelineManager = ({ timeline, onUpdate }) => {
  const [newItem, setNewItem] = useState({ date: '', title: '', desc: '' });

  const handleAdd = () => {
    if (!newItem.date || !newItem.title) return;
    onUpdate([...timeline, newItem]);
    setNewItem({ date: '', title: '', desc: '' });
  };

  const handleRemove = (idx) => {
    onUpdate(timeline.filter((_, i) => i !== idx));
  };

  const sortedTimeline = [...timeline].sort((a, b) => new Date(a.date) - new Date(b.date));

  return (
    <section className="bg-white p-10 rounded-[2.5rem] border border-slate-100 shadow-sm animate-in fade-in slide-in-from-right-4">
      <h3 className="text-2xl font-black font-['Outfit'] mb-8 text-[#0f172a]">Protokol Linimasa</h3>

      <div className="grid gap-6 mb-10 p-8 bg-slate-50/50 border border-slate-100 rounded-[2rem]">
         <div className="grid grid-cols-2 gap-6">
            <div className="space-y-2">
               <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Tanggal Eksekusi</label>
               <input 
                  type="date"
                  value={newItem.date}
                  onChange={e => setNewItem({...newItem, date: e.target.value})}
                  className="w-full h-14 px-6 bg-white border border-slate-200 rounded-2xl font-bold"
               />
            </div>
            <div className="space-y-2">
               <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Judul Protokol</label>
               <input 
                  value={newItem.title}
                  onChange={e => setNewItem({...newItem, title: e.target.value})}
                  placeholder="e.g. Batas Akhir Submisi"
                  className="w-full h-14 px-6 bg-white border border-slate-200 rounded-2xl font-bold"
               />
            </div>
         </div>
         <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Detail Operasional</label>
            <div className="flex gap-4">
               <input 
                  value={newItem.desc}
                  onChange={e => setNewItem({...newItem, desc: e.target.value})}
                  placeholder="e.g. Seluruh berkas harus sudah diunggah ke portal."
                  className="w-full h-14 px-6 bg-white border border-slate-200 rounded-2xl font-bold"
               />
               <button onClick={handleAdd} className="w-14 h-14 bg-[#0f172a] text-white rounded-2xl flex items-center justify-center shadow-xl shrink-0 hover:-translate-y-1 transition-all">
                  <Plus size={24} />
               </button>
            </div>
         </div>
      </div>

      <div className="space-y-6 relative before:absolute before:left-[39px] before:top-4 before:bottom-4 before:w-0.5 before:bg-slate-100">
        {sortedTimeline.map((event, idx) => (
          <div key={idx} className="relative pl-20 group">
             <div className="absolute left-[34px] top-4 w-3 h-3 rounded-full bg-white border-2 border-[#0ea5e9] z-10 group-hover:scale-125 transition-transform" />
             <div className="bg-white p-6 rounded-[2rem] border border-slate-100 flex items-center justify-between shadow-sm group-hover:border-[#0ea5e9] transition-all">
                <div>
                   <div className="text-[10px] font-black text-sky-500 uppercase tracking-[0.2em] mb-1">{event.date}</div>
                   <div className="font-black text-[#0f172a] font-['Outfit'] text-lg">{event.title}</div>
                   <div className="text-sm text-slate-500 font-medium mt-1">{event.desc}</div>
                </div>
                <button onClick={() => handleRemove(idx)} className="p-3 text-slate-300 hover:text-rose-500 transition-colors">
                   <Trash2 size={20} />
                </button>
             </div>
          </div>
        ))}
      </div>
    </section>
  );
};

const SideTab = ({ children, active, onClick, icon }) => (
  <button 
    onClick={onClick}
    className={`flex items-center gap-4 px-6 py-4 rounded-2xl font-black text-sm transition-all text-left ${active ? 'bg-[#0ea5e9] text-white shadow-2xl shadow-sky-100 translate-x-2' : 'text-[#64748b] hover:bg-white hover:text-[#0ea5e9] hover:shadow-sm'}`}
  >
    <div className={`p-2 rounded-xl transition-all ${active ? 'bg-white/20' : 'bg-slate-100 text-slate-400 group-hover:bg-sky-50'}`}>
       {icon}
    </div>
    {children}
  </button>
);

export default ProgramSettings;
