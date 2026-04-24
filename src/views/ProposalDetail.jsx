import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, User, FileText, CheckCircle, Clock, Download, AlertCircle, MessageSquare, Trash2, Loader2, Mail } from 'lucide-react';
import { cloudSync } from '../utils/cloudSync';

const ProposalDetail = ({ proposals, currentUser }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('submission');
  const [isSyncing, setIsSyncing] = useState(false);

  const proposal = proposals.find(p => String(p.id) === String(id));

  const handleUpdateStatus = async (newStatus) => {
    setIsSyncing(true);
    const updatedProposal = { ...proposal, status: newStatus };
    await cloudSync.push('proposals', proposal.id, updatedProposal);
    
    const localProps = JSON.parse(localStorage.getItem('grants_proposals') || '[]');
    const updatedProps = localProps.map(p => String(p.id) === String(proposal.id) ? updatedProposal : p);
    localStorage.setItem('grants_proposals', JSON.stringify(updatedProps));
    
    setIsSyncing(false);
    window.location.reload();
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this proposal?')) return;
    setIsSyncing(true);
    await cloudSync.push('proposals', proposal.id, null);
    
    const localProps = JSON.parse(localStorage.getItem('grants_proposals') || '[]');
    const updatedProps = localProps.filter(p => String(p.id) !== String(proposal.id));
    localStorage.setItem('grants_proposals', JSON.stringify(updatedProps));
    
    setIsSyncing(false);
    navigate(-1);
  };

  if (!proposal) {
// ...
// (lines 13-20)
// ...
  }

  const isAdmin = ['SUPERADMIN', 'ADMIN', 'MANAGER', 'EDITOR', 'REVIEWER'].includes(currentUser?.role);

  return (
    <div className="animate-fade-in">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-10 pb-8 border-b border-[#e2e8f0] gap-6">
        <button 
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 font-black text-xs text-slate-400 hover:text-[#0ea5e9] transition-all uppercase tracking-widest"
        >
          <ArrowLeft size={16} />
          Kembali
        </button>
        
        <div className="flex flex-wrap items-center gap-4">
           {isAdmin && (
             <div className="flex items-center gap-2 bg-slate-50 p-1.5 rounded-2xl border border-slate-100">
               <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-3">Mission Control</span>
               <button onClick={() => handleUpdateStatus('Review')} disabled={isSyncing} className="px-4 py-1.5 rounded-xl bg-white border border-slate-200 text-[10px] font-black hover:bg-amber-50 hover:text-amber-600 transition-all">REVIEW</button>
               <button onClick={() => handleUpdateStatus('Accepted')} disabled={isSyncing} className="px-4 py-1.5 rounded-xl bg-white border border-slate-200 text-[10px] font-black hover:bg-emerald-50 hover:text-emerald-600 transition-all">ACCEPT</button>
               <button onClick={() => handleUpdateStatus('Rejected')} disabled={isSyncing} className="px-4 py-1.5 rounded-xl bg-white border border-slate-200 text-[10px] font-black hover:bg-rose-50 hover:text-rose-600 transition-all">REJECT</button>
               <button onClick={handleDelete} disabled={isSyncing} className="p-1.5 rounded-xl bg-white border border-slate-200 text-rose-400 hover:bg-rose-50 hover:text-rose-600 transition-all ml-2">
                 {isSyncing ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
               </button>
             </div>
           )}
           <div className="flex items-center gap-3">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mr-2">Status Manifest</span>
              <StatusBadge status={proposal.status} />
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr,380px] gap-12 items-start">
        <div className="space-y-12">
           <section>
              <h1 className="text-4xl font-black font-['Outfit'] mb-6 tracking-tight leading-tight text-[#0f172a]">
                {proposal.title}
              </h1>
              <div className="flex flex-wrap gap-4">
                 <InfoChip icon={<Clock size={14} />} label="Submitted On" value={proposal.date || 'N/A'} />
                 <InfoChip icon={<FileText size={14} />} label="Program ID" value={proposal.programId || proposal.program || 'N/A'} />
                 <InfoChip icon={<User size={14} />} label="Unit Origin" value={proposal.unit || 'General'} />
              </div>
           </section>

           <div className="bg-white rounded-[2.5rem] border border-[#e2e8f0] overflow-hidden shadow-sm">
              <div className="flex p-2 bg-slate-50 border-b border-[#e2e8f0]">
                 <DetailTab active={activeTab === 'submission'} onClick={() => setActiveTab('submission')} icon={<FileText size={18} />}>Submisi & Berkas</DetailTab>
                 <DetailTab active={activeTab === 'reviews'} onClick={() => setActiveTab('reviews')} icon={<CheckCircle size={18} />}>Hasil Penilaian</DetailTab>
                 <DetailTab active={activeTab === 'discussions'} onClick={() => setActiveTab('discussions')} icon={<MessageSquare size={18} />}>Diskusi</DetailTab>
              </div>
              <div className="p-10 min-h-[400px]">
                 {activeTab === 'submission' && <SubmissionContent proposal={proposal} />}
                 {activeTab === 'reviews' && <ReviewsContent proposal={proposal} />}
                 {activeTab === 'discussions' && (
                   <div className="flex flex-col items-center justify-center h-full py-20 text-slate-300">
                      <MessageSquare size={48} strokeWidth={1} className="mb-4 opacity-20" />
                      <p className="font-bold text-sm uppercase tracking-widest opacity-40">Modul diskusi sedang disiapkan.</p>
                   </div>
                 )}
              </div>
           </div>
        </div>

        <aside className="space-y-8">
           <div className="bg-white p-8 rounded-[2.5rem] border border-[#e2e8f0] shadow-sm">
              <h3 className="text-sm font-black text-[#0f172a] uppercase tracking-wider mb-8 flex items-center gap-2">
                 <User size={18} className="text-[#0ea5e9]" />
                 Mission Leader (PI)
              </h3>
              <div className="flex flex-col items-center text-center">
                 <div className="w-24 h-24 rounded-3xl bg-sky-50 text-[#0ea5e9] flex items-center justify-center mb-4 shadow-sm border border-sky-100">
                    <span className="text-4xl font-black">{(proposal.leader || proposal.proposer || 'U')[0]}</span>
                 </div>
                 <h4 className="text-xl font-black font-['Outfit'] text-[#0f172a]">{proposal.leader || proposal.proposer || 'Unknown'}</h4>
                 <p className="text-slate-400 font-bold text-xs uppercase tracking-widest mt-1">{proposal.unit || 'ASTRONAUT'}</p>
                 <div className="mt-8 pt-6 border-t border-slate-50 w-full text-left space-y-4">
                    <div className="flex items-center gap-3 text-sm text-slate-500 font-medium">
                       <Mail size={14} className="text-slate-300" />
                       {proposal.email || 'no-email@ugm.ac.id'}
                    </div>
                 </div>
              </div>
           </div>
           
           <div className="bg-slate-900 p-8 rounded-[2.5rem] text-white shadow-2xl shadow-slate-200">
              <h3 className="text-xs font-black uppercase tracking-[0.2em] mb-4 opacity-50">Logbook Status</h3>
              <div className="flex items-center gap-4">
                 <div className="w-2 h-2 rounded-full bg-[#10b981] animate-pulse" />
                 <span className="font-bold text-sm">Station Contact Established</span>
              </div>
              <p className="mt-4 text-xs text-slate-400 leading-relaxed font-medium">Usulan ini telah diterima oleh Mission Control dan sedang dalam tahap verifikasi administratif dasar.</p>
           </div>
        </aside>
      </div>
    </div>
  );
};

const SubmissionContent = ({ proposal }) => (
  <div className="space-y-10 animate-fade-in">
    <div>
      <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-6">Berkas Payload (Attachments)</h3>
      <div className="grid gap-4">
        {Array.isArray(proposal.files) && proposal.files.length > 0 ? (
          proposal.files.map((file, idx) => (
            <div key={idx} className="flex items-center justify-between p-6 bg-slate-50 border border-slate-100 rounded-[1.5rem] group hover:bg-white hover:border-[#0ea5e9] transition-all">
               <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-white border border-slate-100 flex items-center justify-center text-slate-400 group-hover:text-[#0ea5e9] transition-colors shadow-sm">
                     <Download size={20} />
                  </div>
                  <div>
                     <div className="font-bold text-[#0f172a] text-sm">{file.name}</div>
                     <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-0.5">{file.size || 'N/A KB'} • PDF DOCUMENT</div>
                  </div>
               </div>
               <button className="text-xs font-black text-[#0ea5e9] px-4 py-2 bg-white border border-sky-100 rounded-lg opacity-0 group-hover:opacity-100 transition-all shadow-sm">UNDUH</button>
            </div>
          ))
        ) : (
          <div className="p-8 text-center bg-slate-50 border border-dashed border-slate-200 rounded-[1.5rem]">
             <p className="text-sm font-bold text-slate-400 uppercase tracking-widest opacity-60">Tidak ada berkas yang diunggah.</p>
          </div>
        )}
      </div>
    </div>
  </div>
);

const ReviewsContent = ({ proposal }) => (
  <div className="space-y-8 animate-fade-in">
    {(proposal.reviews || []).length === 0 ? (
       <div className="flex flex-col items-center justify-center py-20 text-slate-300">
          <CheckCircle size={48} strokeWidth={1} className="mb-4 opacity-20" />
          <p className="font-bold text-sm uppercase tracking-widest opacity-40">Belum ada penilaian masuk.</p>
       </div>
    ) : (
      proposal.reviews.map((rev, idx) => (
        <div key={idx} className="p-10 bg-slate-50 border border-slate-100 rounded-[2rem] relative overflow-hidden">
           <div className="absolute top-0 right-0 p-8">
              <div className="w-16 h-16 bg-white border border-slate-100 text-[#0f172a] flex flex-col items-center justify-center rounded-2xl shadow-sm">
                 <span className="text-[10px] font-black uppercase text-slate-400 leading-none mb-1">Score</span>
                 <span className="text-xl font-black">8.5</span>
              </div>
           </div>
           
           <div className="flex items-center gap-4 mb-8">
              <div className="w-10 h-10 rounded-full bg-slate-200" />
              <div>
                 <div className="font-black text-[#0f172a] font-['Outfit']">{rev.reviewer}</div>
                 <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{rev.date}</div>
              </div>
           </div>
           
           <div className="space-y-6">
              <div className="grid grid-cols-2 gap-8 py-6 border-y border-slate-100">
                 {rev.items?.map((it, i) => (
                   <div key={i} className="flex justify-between items-center text-sm font-bold">
                      <span className="text-slate-500">{it.label}</span>
                      <span className="text-[#0f172a]">{it.value}</span>
                   </div>
                 ))}
              </div>
              <p className="text-slate-600 leading-relaxed font-medium italic">"{rev.comment || 'Tidak ada komentar tambahan.'}"</p>
           </div>
        </div>
      ))
    )}
  </div>
);

const DetailTab = ({ children, active, onClick, icon }) => (
  <button 
    onClick={onClick}
    className={`flex items-center gap-2 px-8 py-4 rounded-2xl font-black text-sm transition-all ${active ? 'bg-white text-[#0f172a] shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
  >
    {icon}
    {children}
  </button>
);

const InfoChip = ({ icon, label, value }) => (
  <div className="flex items-center gap-2 py-2 px-4 bg-slate-50 border border-slate-100 rounded-xl">
    <div className="text-[#0ea5e9]">{icon}</div>
    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{label}: <span className="text-[#0f172a] font-black">{value}</span></div>
  </div>
);

const StatusBadge = ({ status }) => {
  const styles = {
    'submitted': 'bg-sky-50 text-sky-600 border-sky-100',
    'review': 'bg-amber-50 text-amber-600 border-amber-100',
    'accepted': 'bg-emerald-50 text-emerald-600 border-emerald-100',
    'rejected': 'bg-rose-50 text-rose-600 border-rose-100',
  };
  const style = styles[status?.toLowerCase()] || 'bg-slate-50 text-slate-600 border-slate-100';
  return (
    <span className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-[0.15em] border ${style} shadow-sm`}>
      {status || 'Unknown'}
    </span>
  );
};

export default ProposalDetail;
