import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, FileText, Settings as SettingsIcon, History, Plus } from 'lucide-react';
import ProposalsTable from '../components/ProposalsTable';
import ProgramSettings from '../components/ProgramSettings';

const ProgramDetail = ({ programs, proposals }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('proposals'); // proposals, settings, timeline

  const program = programs.find(p => String(p.id) === String(id));

  if (!program) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-slate-400">
        <h2 className="text-2xl font-bold mb-4">Program tidak ditemukan</h2>
        <button onClick={() => navigate('/')} className="text-[#0ea5e9] font-bold">Kembali ke Dashboard</button>
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
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
        
        <button className="bg-[#0ea5e9] text-white px-6 py-3 rounded-2xl font-black text-sm shadow-xl shadow-sky-100 hover:brightness-110 flex items-center gap-2 transition-all shrink-0">
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
        {activeTab === 'timeline' && (
           <div className="p-20 text-center text-slate-400">
             <History size={48} strokeWidth={1} className="mx-auto mb-4 opacity-20" />
             <p className="font-bold text-sm uppercase tracking-widest opacity-40">Fitur Linimasa segera hadir.</p>
           </div>
        )}
      </div>
    </div>
  );
};

const TabButton = ({ children, active, onClick, icon }) => (
  <button 
    onClick={onClick}
    className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-sm transition-all ${active ? 'bg-[#0f172a] text-white shadow-lg' : 'text-[#64748b] hover:bg-slate-50'}`}
  >
    {icon}
    {children}
  </button>
);

export default ProgramDetail;
