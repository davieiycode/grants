import React from 'react';
import { FileText, User, Calendar, Eye } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const ProposalsTable = ({ proposals, programId, programs }) => {
  const navigate = useNavigate();
  
  // Find program name for fallback filtering
  const currentProgram = (programs || []).find(p => String(p.id) === String(programId));
  
  const filteredProposals = proposals.filter(p => 
    String(p.programId) === String(programId) || 
    (currentProgram && p.program === currentProgram.name)
  );

  if (filteredProposals.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-slate-400 bg-slate-50/50 rounded-3xl border border-dashed border-slate-200">
        <FileText size={48} strokeWidth={1} className="mb-4 opacity-20" />
        <p className="font-bold text-sm uppercase tracking-widest opacity-40">Belum ada usulan masuk</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="border-b border-slate-50">
            <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Judul Usulan</th>
            <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Ketua Pengusul</th>
            <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Tanggal</th>
            <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</th>
            <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Aksi</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-50">
          {filteredProposals.map(proposal => {
            const displayId = String(proposal.id);
            const leaderName = proposal.leader || proposal.proposer || 'Unknown';
            
            return (
              <tr key={proposal.id} className="hover:bg-slate-50/50 transition-colors group">
                <td className="px-6 py-5">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-sky-50 text-sky-500 flex items-center justify-center shrink-0">
                      <FileText size={20} />
                    </div>
                    <div>
                      <div className="font-bold text-[#0f172a] line-clamp-1 max-w-md font-['Outfit']">{proposal.title}</div>
                      <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-0.5">ID: #{displayId.slice(-4)}</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-5">
                  <div className="flex items-center gap-2">
                    <User size={14} className="text-slate-400" />
                    <span className="text-sm font-semibold text-slate-600">{leaderName}</span>
                  </div>
                </td>
                <td className="px-6 py-5">
                  <div className="flex items-center gap-2 text-slate-400">
                    <Calendar size={14} />
                    <span className="text-xs font-bold">{proposal.date || 'N/A'}</span>
                  </div>
                </td>
                <td className="px-6 py-5">
                  <StatusBadge status={proposal.status} />
                </td>
                <td className="px-6 py-5 text-right">
                  <button 
                    onClick={() => navigate(`/proposal/${proposal.id}`)}
                    className="p-2 rounded-lg hover:bg-white hover:shadow-md transition-all text-slate-400 hover:text-[#0ea5e9]"
                  >
                    <Eye size={18} />
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

const StatusBadge = ({ status }) => {
  const styles = {
    'submitted': 'bg-sky-50 text-sky-600 border-sky-100',
    'review': 'bg-amber-50 text-amber-600 border-amber-100',
    'accepted': 'bg-emerald-50 text-emerald-600 border-emerald-100',
    'rejected': 'bg-rose-50 text-rose-600 border-rose-100',
  };

  const style = styles[status?.toLowerCase()] || 'bg-slate-50 text-slate-600 border-slate-100';

  return (
    <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${style}`}>
      {status || 'Unknown'}
    </span>
  );
};

export default ProposalsTable;
