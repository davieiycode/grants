import React, { useState } from 'react';
import { Settings, ListTodo, Award, Trash2, Loader2, Plus, Calendar, UserCheck, Shield, ChevronRight } from 'lucide-react';
import { cloudSync } from '../utils/cloudSync';
import { useNavigate } from 'react-router-dom';

const ProgramSettings = ({ program, crew }) => {
  const navigate = useNavigate();
  const [activeSubTab, setActiveSubTab] = useState('basic');
  const [formData, setFormData] = useState({ 
    name: program.name, 
    desc: program.desc,
    attributes: program.attributes || {},
    reviewers: program.reviewers || [],
    timeline: program.timeline || [
      { date: '2026-01-10', title: 'Mission Planning', desc: 'Initial program configuration and scope definition.' },
      { date: '2026-02-15', title: 'Call for Proposals', desc: 'Sector-wide announcement for research payloads.' },
      { date: '2026-04-01', title: 'Review Phase', desc: 'Mission Control evaluating all submitted docking requests.' },
      { date: '2026-05-20', title: 'Final Selection', desc: 'Announcing the chosen expeditions for this launch cycle.' },
    ]
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
        <SideTab active={activeSubTab === 'attributes'} onClick={() => setActiveSubTab('attributes')} icon={<ListTodo size={18} />}>Atribut Formulir</SideTab>
        <SideTab active={activeSubTab === 'reviewers'} onClick={() => setActiveSubTab('reviewers')} icon={<Award size={18} />}>Reviewer & Staff</SideTab>
        <SideTab active={activeSubTab === 'timeline'} onClick={() => setActiveSubTab('timeline')} icon={<Calendar size={18} />}>Manajemen Linimasa</SideTab>
        
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
          <section className="bg-slate-50/50 p-8 rounded-[2rem] border border-slate-100 animate-in fade-in slide-in-from-right-4">
            <h3 className="text-xl font-black font-['Outfit'] mb-6 flex items-center gap-3">
              <span className="w-8 h-8 rounded-lg bg-white flex items-center justify-center text-[#0ea5e9] shadow-sm">
                  <Settings size={18} />
              </span>
              Informasi Utama Program
            </h3>
            
            <div className="space-y-6">
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1 font-['Outfit']">Nama Program</label>
                <input 
                  type="text" 
                  value={formData.name} 
                  onChange={e => setFormData({...formData, name: e.target.value})}
                  className="w-full h-14 px-5 bg-white border border-[#e2e8f0] rounded-2xl focus:ring-4 focus:ring-sky-100 transition-all font-semibold text-[#0f172a]"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1 font-['Outfit']">Deskripsi & Tujuan</label>
                <textarea 
                  rows={4}
                  value={formData.desc} 
                  onChange={e => setFormData({...formData, desc: e.target.value})}
                  className="w-full p-5 bg-white border border-[#e2e8f0] rounded-2xl focus:ring-4 focus:ring-sky-100 transition-all font-medium text-[#0f172a]"
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
  const [newKey, setNewKey] = useState('');
  const [newValue, setNewValue] = useState('');

  const handleAdd = () => {
    if (!newKey) return;
    onUpdate({ ...attributes, [newKey]: newValue });
    setNewKey('');
    setNewValue('');
  };

  const handleDelete = (key) => {
    const next = { ...attributes };
    delete next[key];
    onUpdate(next);
  };

  return (
    <section className="bg-slate-50/50 p-8 rounded-[2rem] border border-slate-100 animate-in fade-in slide-in-from-right-4">
      <div className="flex justify-between items-center mb-8">
        <h3 className="text-xl font-black font-['Outfit'] flex items-center gap-3">
          <span className="w-8 h-8 rounded-lg bg-white flex items-center justify-center text-[#0ea5e9] shadow-sm">
              <ListTodo size={18} />
          </span>
          Atribut Formulir
        </h3>
      </div>

      <div className="grid gap-4 mb-8">
        <div className="grid grid-cols-2 gap-4 p-6 bg-white border border-slate-100 rounded-[1.5rem] shadow-sm">
          <div className="space-y-1.5">
            <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest pl-1">Label / Field Name</label>
            <input 
              value={newKey}
              onChange={e => setNewKey(e.target.value)}
              placeholder="e.g. Dana yang Diajukan"
              className="w-full h-11 px-4 bg-slate-50 border border-slate-100 rounded-xl text-sm font-bold"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest pl-1">Default / Type Hint</label>
            <div className="flex gap-2">
              <input 
                value={newValue}
                onChange={e => setNewValue(e.target.value)}
                placeholder="e.g. Number"
                className="w-full h-11 px-4 bg-slate-50 border border-slate-100 rounded-xl text-sm font-bold"
              />
              <button onClick={handleAdd} className="w-11 h-11 bg-[#0ea5e9] text-white rounded-xl flex items-center justify-center shadow-lg shadow-sky-100 shrink-0">
                <Plus size={20} />
              </button>
            </div>
          </div>
        </div>
      </div>
      
      <div className="grid gap-3">
        {Object.entries(attributes).map(([key, value], idx) => (
          <div key={idx} className="bg-white p-5 rounded-2xl border border-slate-100 flex items-center justify-between group shadow-sm hover:border-[#0ea5e9] transition-all">
            <div className="flex items-center gap-4">
                <div className="w-1.5 h-6 bg-slate-100 rounded-full group-hover:bg-[#0ea5e9] transition-colors" />
                <div>
                  <div className="font-bold text-sm text-[#0f172a]">{key}</div>
                  <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-0.5">HINT: {String(value)}</div>
                </div>
            </div>
            <button onClick={() => handleDelete(key)} className="p-2 text-slate-300 hover:text-rose-500 transition-colors">
                <Trash2 size={18} />
            </button>
          </div>
        ))}
      </div>
    </section>
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
    <section className="bg-slate-50/50 p-8 rounded-[2rem] border border-slate-100 animate-in fade-in slide-in-from-right-4">
      <h3 className="text-xl font-black font-['Outfit'] mb-8 flex items-center gap-3">
        <span className="w-8 h-8 rounded-lg bg-white flex items-center justify-center text-[#0ea5e9] shadow-sm">
            <Award size={18} />
        </span>
        Reviewer & Staf PIC
      </h3>

      <div className="flex flex-col md:flex-row gap-4 mb-8 p-6 bg-white border border-slate-100 rounded-[1.5rem] shadow-sm">
         <div className="flex-1 space-y-1.5">
            <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest pl-1">Assign Personnel</label>
            <select 
              value={selectedCrew}
              onChange={e => setSelectedCrew(e.target.value)}
              className="w-full h-12 px-4 bg-slate-50 border border-slate-100 rounded-xl text-sm font-bold appearance-none"
            >
              <option value="">Select Personnel...</option>
              {(crew || []).map((c, i) => (
                <option key={i} value={c.email}>{c.name} ({c.role})</option>
              ))}
            </select>
         </div>
         <div className="w-full md:w-48 space-y-1.5">
            <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest pl-1">Program Role</label>
            <select 
              value={selectedRole}
              onChange={e => setSelectedRole(e.target.value)}
              className="w-full h-12 px-4 bg-slate-50 border border-slate-100 rounded-xl text-sm font-bold appearance-none"
            >
              <option value="REVIEWER">REVIEWER</option>
              <option value="STAFF">STAFF PIC</option>
              <option value="MANAGER">MANAGER</option>
            </select>
         </div>
         <button onClick={handleAdd} className="self-end h-12 px-6 bg-[#0ea5e9] text-white rounded-xl font-black text-xs uppercase tracking-widest shadow-lg shadow-sky-100 shrink-0">
            Assign Duty
         </button>
      </div>

      <div className="grid gap-4">
        {(reviewers || []).map((assignment, idx) => {
          const person = crew.find(c => c.email === assignment.email);
          return (
            <div key={idx} className="bg-white p-5 rounded-2xl border border-slate-100 flex items-center justify-between group">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-slate-50 rounded-xl flex items-center justify-center text-slate-400 font-black">
                   {person?.name?.[0] || 'U'}
                </div>
                <div>
                   <div className="font-bold text-[#0f172a]">{person?.name || assignment.email}</div>
                   <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-[9px] font-black bg-sky-50 text-sky-500 px-2 py-0.5 rounded uppercase tracking-wider">Role: {assignment.role}</span>
                      <span className="text-[9px] font-bold text-slate-300 uppercase">| Global: {person?.role || 'Guest'}</span>
                   </div>
                </div>
              </div>
              <button onClick={() => handleRemove(assignment.email)} className="p-2 text-slate-300 hover:text-rose-500 transition-colors">
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

  return (
    <section className="bg-slate-50/50 p-8 rounded-[2rem] border border-slate-100 animate-in fade-in slide-in-from-right-4">
      <h3 className="text-xl font-black font-['Outfit'] mb-8 flex items-center gap-3">
        <span className="w-8 h-8 rounded-lg bg-white flex items-center justify-center text-[#0ea5e9] shadow-sm">
            <Calendar size={18} />
        </span>
        Manajemen Linimasa
      </h3>

      <div className="grid gap-4 mb-8 p-6 bg-white border border-slate-100 rounded-[1.5rem] shadow-sm">
         <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
               <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest pl-1">Tanggal Event</label>
               <input 
                  type="date"
                  value={newItem.date}
                  onChange={e => setNewItem({...newItem, date: e.target.value})}
                  className="w-full h-11 px-4 bg-slate-50 border border-slate-100 rounded-xl text-sm font-bold"
               />
            </div>
            <div className="space-y-1.5">
               <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest pl-1">Judul Milestones</label>
               <input 
                  value={newItem.title}
                  onChange={e => setNewItem({...newItem, title: e.target.value})}
                  placeholder="e.g. Batas Akhir Submisi"
                  className="w-full h-11 px-4 bg-slate-50 border border-slate-100 rounded-xl text-sm font-bold"
               />
            </div>
         </div>
         <div className="space-y-1.5">
            <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest pl-1">Deskripsi Singkat</label>
            <div className="flex gap-2">
               <input 
                  value={newItem.desc}
                  onChange={e => setNewItem({...newItem, desc: e.target.value})}
                  placeholder="e.g. Seluruh berkas harus sudah diunggah ke portal."
                  className="w-full h-11 px-4 bg-slate-50 border border-slate-100 rounded-xl text-sm font-bold"
               />
               <button onClick={handleAdd} className="w-11 h-11 bg-[#0ea5e9] text-white rounded-xl flex items-center justify-center shadow-lg shadow-sky-100 shrink-0">
                  <Plus size={20} />
               </button>
            </div>
         </div>
      </div>

      <div className="space-y-4">
        {timeline.map((event, idx) => (
          <div key={idx} className="bg-white p-5 rounded-2xl border border-slate-100 flex items-center justify-between group">
             <div className="flex items-center gap-6">
                <div className="text-center min-w-[80px]">
                   <div className="text-xs font-black text-sky-500">{event.date.split('-')[0]}</div>
                   <div className="text-xl font-black font-['Outfit']">{event.date.split('-')[2] || '??'}</div>
                </div>
                <div className="w-px h-10 bg-slate-100" />
                <div>
                   <div className="font-bold text-[#0f172a]">{event.title}</div>
                   <div className="text-xs text-slate-400 font-medium">{event.desc}</div>
                </div>
             </div>
             <button onClick={() => handleRemove(idx)} className="p-2 text-slate-300 hover:text-rose-500 transition-colors">
                <Trash2 size={18} />
             </button>
          </div>
        ))}
      </div>
    </section>
  );
};

const SideTab = ({ children, active, onClick, icon }) => (
  <button 
    onClick={onClick}
    className={`flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-sm transition-all ${active ? 'bg-[#0ea5e9] text-white shadow-lg shadow-sky-100' : 'text-[#64748b] hover:bg-sky-50 hover:text-[#0ea5e9]'}`}
  >
    {icon}
    {children}
  </button>
);

export default ProgramSettings;
