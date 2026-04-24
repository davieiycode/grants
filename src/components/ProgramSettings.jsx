import React, { useState } from 'react';
import { Settings, ListTodo, Award, Trash2, Loader2 } from 'lucide-react';
import { cloudSync } from '../utils/cloudSync';
import { useNavigate } from 'react-router-dom';

const ProgramSettings = ({ program }) => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ name: program.name, desc: program.desc });
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

  const handleDelete = async () => {
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
        <SideTab active icon={<Settings size={18} />}>Informasi Dasar</SideTab>
        <SideTab icon={<ListTodo size={18} />}>Atribut Formulir</SideTab>
        <SideTab icon={<Award size={18} />}>Kriteria Reviewer</SideTab>
        <div className="mt-8 pt-4 border-t border-slate-100">
           <button 
             onClick={handleDelete}
             disabled={isSyncing}
             className="flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-sm text-rose-500 hover:bg-rose-50 transition-all w-full text-left disabled:opacity-50"
           >
             <Trash2 size={18} />
             Hapus Program
           </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="space-y-10">
        <section className="bg-slate-50/50 p-8 rounded-[2rem] border border-slate-100">
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
            <div className="flex justify-end">
               <button 
                 onClick={handleSave}
                 disabled={isSyncing}
                 className="bg-[#0f172a] text-white px-8 py-3 rounded-xl font-black text-sm shadow-lg hover:-translate-y-1 transition-all flex items-center gap-2 disabled:opacity-50 disabled:translate-y-0"
               >
                 {isSyncing ? <Loader2 className="animate-spin" size={18} /> : 'SIMPAN PERUBAHAN'}
               </button>
            </div>
          </div>
        </section>

        <section className="bg-slate-50/50 p-8 rounded-[2rem] border border-slate-100">
           <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-black font-['Outfit'] flex items-center gap-3">
                <span className="w-8 h-8 rounded-lg bg-white flex items-center justify-center text-[#0ea5e9] shadow-sm">
                    <ListTodo size={18} />
                </span>
                Atribut Formulir
              </h3>
              <button className="text-xs font-black text-[#0ea5e9] bg-white border border-sky-100 px-4 py-2 rounded-lg hover:shadow-md transition-all">+ TAMBAH FIELD</button>
           </div>
           
           <div className="grid gap-3">
             {program.attributes && Object.keys(program.attributes).length > 0 ? (
               Object.entries(program.attributes).map(([key, attr], idx) => (
                 <div key={idx} className="bg-white p-4 rounded-2xl border border-slate-100 flex items-center justify-between group shadow-sm">
                    <div className="flex items-center gap-4">
                       <div className="w-1.5 h-6 bg-slate-200 rounded-full group-hover:bg-[#0ea5e9] transition-colors" />
                       <div>
                         <div className="font-bold text-sm text-[#0f172a]">{key}</div>
                         <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-0.5">VALUE: {String(attr)}</div>
                       </div>
                    </div>
                 </div>
               ))
             ) : (
               <p className="text-center py-10 text-slate-400 italic text-sm">Belum ada atribut kustom ditambahkan.</p>
             )}
           </div>
        </section>
      </div>
    </div>
  );
};

const SideTab = ({ children, active, icon }) => (
  <button className={`flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-sm transition-all ${active ? 'bg-[#0ea5e9] text-white shadow-lg shadow-sky-100' : 'text-[#64748b] hover:bg-sky-50 hover:text-[#0ea5e9]'}`}>
    {icon}
    {children}
  </button>
);

export default ProgramSettings;
