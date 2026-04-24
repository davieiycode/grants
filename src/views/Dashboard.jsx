import React, { useState } from 'react';
import ProgramCard from '../components/ProgramCard';
import { Plus, X, Rocket, Database, Loader2 } from 'lucide-react';
import { cloudSync } from '../utils/cloudSync';

const Dashboard = ({ programs, currentUser }) => {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [formData, setFormData] = useState({ name: '', desc: '' });

  const handleCreate = async (e) => {
    e.preventDefault();
    setIsCreating(true);
    const newId = `PROG-${Date.now()}`;
    const newProgram = {
      id: newId,
      ...formData,
      status: 'Active',
      created: new Date().toLocaleDateString()
    };

    await cloudSync.push('programs', newId, newProgram);
    
    // Refresh local data (optimistic)
    const localProgs = JSON.parse(localStorage.getItem('grants_programs_meta') || '[]');
    localStorage.setItem('grants_programs_meta', JSON.stringify([...localProgs, newProgram]));
    
    setIsCreating(false);
    setShowCreateModal(false);
    window.location.reload(); // Refresh to show new data
  };

  return (
    <div className="animate-fade-in">
      <header className="max-w-3xl mx-auto text-center mb-16">
        <h1 className="text-5xl md:text-6xl font-black mb-4 tracking-tight bg-gradient-to-r from-[#0ea5e9] to-[#6366f1] bg-clip-text text-transparent pb-2 font-['Outfit']">
          Portal Hibah & Penelitian
        </h1>
        <p className="text-lg text-[#64748b] font-medium max-w-2xl mx-auto">
          Selamat datang di Command Center ProSpace. Kelola seluruh siklus hibah penelitian dari satu dashboard terpadu.
        </p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {programs.map(program => (
          <ProgramCard key={program.id} program={program} />
        ))}
        
        {/* Create New Program Button - Restricted to Management Roles */}
        {['SUPERADMIN', 'ADMIN', 'MANAGER', 'EDITOR', 'REVIEWER'].includes(currentUser?.role) && (
          <div 
            onClick={() => setShowCreateModal(true)}
            className="bg-[#f8fafc] border-2 border-dashed border-[#e2e8f0] rounded-[2rem] p-8 flex flex-col items-center justify-center gap-4 hover:border-[#0ea5e9] hover:bg-white transition-all cursor-pointer group min-h-[280px]"
          >
            <div className="w-14 h-14 rounded-2xl bg-white border border-[#e2e8f0] flex items-center justify-center text-[#64748b] group-hover:bg-[#0ea5e9] group-hover:text-white group-hover:border-[#0ea5e9] transition-all shadow-sm group-hover:shadow-lg group-hover:shadow-sky-100">
              <Plus size={32} />
            </div>
            <div className="text-center">
              <span className="block font-black text-[#0f172a] font-['Outfit'] text-lg">Inisiasi Expedisi</span>
              <span className="text-sm font-medium text-[#64748b]">Buat program hibah baru</span>
            </div>
          </div>
        )}
      </div>

      {/* Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 animate-in fade-in duration-300">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-md" onClick={() => setShowCreateModal(false)} />
          <div className="bg-white rounded-[2.5rem] w-full max-w-lg p-10 relative shadow-2xl animate-in slide-in-from-bottom-8 duration-500">
             <button onClick={() => setShowCreateModal(false)} className="absolute top-8 right-8 text-slate-300 hover:text-slate-600 transition-colors">
                <X size={24} />
             </button>
             
             <div className="flex items-center gap-4 mb-10">
                <div className="w-12 h-12 bg-sky-50 text-[#0ea5e9] rounded-2xl flex items-center justify-center">
                   <Rocket size={24} />
                </div>
                <div>
                   <h2 className="text-2xl font-black font-['Outfit'] text-[#0f172a]">Inisiasi Expedisi</h2>
                   <p className="text-sm text-slate-500 font-medium">Siapkan parameter untuk program hibah baru.</p>
                </div>
             </div>

             <form onSubmit={handleCreate} className="space-y-6">
                <div className="space-y-1.5">
                   <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Nama Program</label>
                   <input 
                      required
                      value={formData.name}
                      onChange={e => setFormData({...formData, name: e.target.value})}
                      placeholder="Contoh: Hibah Penelitian Strategis 2026"
                      className="w-full h-14 px-6 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:ring-4 focus:ring-sky-100 transition-all font-bold text-sm"
                   />
                </div>
                <div className="space-y-1.5">
                   <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Deskripsi & Objektif</label>
                   <textarea 
                      required
                      value={formData.desc}
                      onChange={e => setFormData({...formData, desc: e.target.value})}
                      placeholder="Jelaskan tujuan dari ekspedisi penelitian ini..."
                      className="w-full h-32 p-6 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:ring-4 focus:ring-sky-100 transition-all font-medium text-sm resize-none"
                   />
                </div>

                <button 
                   disabled={isCreating}
                   className="w-full h-16 bg-[#0ea5e9] text-white rounded-2xl font-black text-lg shadow-xl shadow-sky-100 hover:-translate-y-1 active:scale-95 transition-all flex items-center justify-center gap-3 disabled:opacity-50 disabled:translate-y-0 mt-4"
                >
                   {isCreating ? <Loader2 className="animate-spin" /> : 'LUNCURKAN PROGRAM'}
                </button>
             </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
