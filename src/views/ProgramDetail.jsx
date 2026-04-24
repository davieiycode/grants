import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, FileText, Settings as SettingsIcon, History, Plus, X, Rocket, Loader2 } from 'lucide-react';
import ProposalsTable from '../components/ProposalsTable';
import ProgramSettings from '../components/ProgramSettings';
import { cloudSync } from '../utils/cloudSync';

const ProgramDetail = ({ programs, proposals }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('proposals'); // proposals, settings, timeline
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [formData, setFormData] = useState({ title: '', leader: '', unit: '' });

  const program = programs.find(p => String(p.id) === String(id));

  const handleCreate = async (e) => {
    e.preventDefault();
    setIsCreating(true);
    const newId = `PROP-${Date.now()}`;
    const newProposal = {
      id: newId,
      programId: id,
      ...formData,
      status: 'Submitted',
      date: new Date().toLocaleDateString(),
      leader: formData.leader || 'Unknown Lead',
      unit: formData.unit || 'General'
    };

    await cloudSync.push('proposals', newId, newProposal);
    
    // Refresh local data (optimistic)
    const localProps = JSON.parse(localStorage.getItem('grants_proposals') || '[]');
    localStorage.setItem('grants_proposals', JSON.stringify([...localProps, newProposal]));
    
    setIsCreating(false);
    setShowCreateModal(false);
    window.location.reload(); 
  };

  if (!program) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-slate-400">
        <h2 className="text-2xl font-bold mb-4">Program tidak ditemukan</h2>
        <button onClick={() => navigate('/')} className="text-[#0ea5e9] font-bold">Kembali ke Dashboard</button>
      </div>
    );
  }

  return (
    <div className="animate-fade-in relative">
      {/* Detail Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10 pb-8 border-b border-[#e2e8f0]">
        <div className="flex items-center gap-6">
          <button 
            onClick={() => navigate('/')}
            className="w-12 h-12 rounded-xl bg-white border border-[#e2e8f0] flex items-center justify-center text-[#64748b] hover:border-[#0ea5e9] hover:text-[#0ea5e9] transition-all"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h1 className="text-3xl font-black font-['Outfit'] tracking-tight text-[#0f172a]">{program.name}</h1>
              <span className="px-3 py-1 rounded-full bg-sky-50 text-[#0ea5e9] text-[11px] font-black uppercase tracking-widest border border-sky-100">
                {program.status || 'Active'}
              </span>
            </div>
            <p className="text-[#64748b] font-medium max-w-2xl">{program.desc || 'Deskripsi program belum diatur.'}</p>
          </div>
        </div>
        
        <button 
          onClick={() => setShowCreateModal(true)}
          className="bg-[#0ea5e9] text-white px-6 py-3 rounded-2xl font-black text-sm shadow-xl shadow-sky-100 hover:brightness-110 flex items-center gap-2 transition-all shrink-0"
        >
          <Plus size={18} />
          ENTRI USULAN BARU
        </button>
      </div>

      {/* Tabs */}
      <div className="flex items-center justify-between bg-white p-2 rounded-2xl border border-[#e2e8f0] mb-8 shadow-sm">
        <div className="flex gap-1 overflow-x-auto">
          <TabButton active={activeTab === 'proposals'} onClick={() => setActiveTab('proposals')} icon={<FileText size={18} />}>
            Daftar Usulan
          </TabButton>
          <TabButton active={activeTab === 'settings'} onClick={() => setActiveTab('settings')} icon={<SettingsIcon size={18} />}>
            Skema & Atribut
          </TabButton>
          <TabButton active={activeTab === 'timeline'} onClick={() => setActiveTab('timeline')} icon={<History size={18} />}>
            Linimasa
          </TabButton>
        </div>
      </div>

      {/* Tab Content */}
      <div className="bg-white rounded-3xl border border-[#e2e8f0] shadow-sm min-h-[400px] overflow-hidden">
        {activeTab === 'proposals' && <ProposalsTable proposals={proposals} programId={id} />}
        {activeTab === 'settings' && <ProgramSettings program={program} />}
        {activeTab === 'timeline' && <ProgramTimeline program={program} />}
      </div>

      {/* Create Proposal Modal */}
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
                   <h2 className="text-2xl font-black font-['Outfit'] text-[#0f172a]">Entri Usulan Baru</h2>
                   <p className="text-sm text-slate-500 font-medium">Siapkan payload usulan untuk program ini.</p>
                </div>
             </div>

             <form onSubmit={handleCreate} className="space-y-6">
                <div className="space-y-1.5">
                   <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Judul Usulan</label>
                   <input 
                      required
                      value={formData.title}
                      onChange={e => setFormData({...formData, title: e.target.value})}
                      placeholder="Contoh: Analisis Kuantum pada Sektor 7"
                      className="w-full h-14 px-6 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:ring-4 focus:ring-sky-100 transition-all font-bold text-sm"
                   />
                </div>
                <div className="space-y-1.5">
                   <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Ketua Peneliti (Leader)</label>
                   <input 
                      required
                      value={formData.leader}
                      onChange={e => setFormData({...formData, leader: e.target.value})}
                      placeholder="Nama lengkap gelar"
                      className="w-full h-14 px-6 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:ring-4 focus:ring-sky-100 transition-all font-bold text-sm"
                   />
                </div>
                <div className="space-y-1.5">
                   <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Unit / Departemen</label>
                   <input 
                      required
                      value={formData.unit}
                      onChange={e => setFormData({...formData, unit: e.target.value})}
                      placeholder="Contoh: Teknik Fisika"
                      className="w-full h-14 px-6 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:ring-4 focus:ring-sky-100 transition-all font-bold text-sm"
                   />
                </div>

                <button 
                   disabled={isCreating}
                   className="w-full h-16 bg-[#0ea5e9] text-white rounded-2xl font-black text-lg shadow-xl shadow-sky-100 hover:-translate-y-1 active:scale-95 transition-all flex items-center justify-center gap-3 disabled:opacity-50 disabled:translate-y-0 mt-4"
                >
                   {isCreating ? <Loader2 className="animate-spin" /> : 'SUBMIT USULAN'}
                </button>
             </form>
          </div>
        </div>
      )}
    </div>
  );
};

const ProgramTimeline = ({ program }) => {
  const events = [
    { date: '2026-01-10', title: 'Mission Planning', desc: 'Initial program configuration and scope definition.' },
    { date: '2026-02-15', title: 'Call for Proposals', desc: 'Sector-wide announcement for research payloads.' },
    { date: '2026-04-01', title: 'Review Phase', desc: 'Mission Control evaluating all submitted docking requests.' },
    { date: '2026-05-20', title: 'Final Selection', desc: 'Announcing the chosen expeditions for this launch cycle.' },
  ];

  return (
    <div className="p-10 space-y-12 animate-fade-in">
       {events.map((ev, idx) => (
         <div key={idx} className="flex gap-8 group">
            <div className="flex flex-col items-center">
               <div className="w-10 h-10 rounded-full bg-sky-50 border-2 border-sky-100 flex items-center justify-center text-[#0ea5e9] group-hover:bg-[#0ea5e9] group-hover:text-white transition-all shadow-sm">
                  <div className="w-2 h-2 rounded-full bg-current" />
               </div>
               {idx !== events.length - 1 && <div className="w-0.5 flex-1 bg-slate-100 my-2" />}
            </div>
            <div className="pb-12">
               <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{ev.date}</div>
               <h4 className="text-lg font-black text-[#0f172a] font-['Outfit'] mb-2">{ev.title}</h4>
               <p className="text-sm text-slate-500 font-medium max-w-lg">{ev.desc}</p>
            </div>
         </div>
       ))}
    </div>
  );
};

const TabButton = ({ children, active, onClick, icon }) => (
  <button 
    onClick={onClick}
    className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-sm transition-all ${active ? 'bg-white text-[#0f172a] shadow-sm' : 'text-slate-400 hover:bg-slate-50'}`}
  >
    {icon}
    {children}
  </button>
);

export default ProgramDetail;
