import React from 'react';

const ProposalManagement = ({ proposals, events, users, currentUser }) => {
  return (
    <div className="animate-fade-in">
      <header className="mb-10">
        <h1 className="text-3xl font-black text-[#0f172a] mb-2 font-['Outfit']">Proposal Management</h1>
        <p className="text-[#64748b]">Daftar usulan proposal yang telah diajukan.</p>
      </header>

      <div className="bg-white rounded-[2rem] border border-slate-100 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 border-b border-slate-100 text-slate-500 uppercase tracking-wider font-bold">
              <tr>
                <th className="p-6">ID Proposal</th>
                <th className="p-6">Judul</th>
                <th className="p-6">Pengusul</th>
                <th className="p-6">Status</th>
                <th className="p-6">Tanggal</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {proposals?.map((p, i) => {
                const event = events?.find(e => e.event_id === p.event_id) || {};
                const user = users?.find(u => u.user_id === p.user_id) || {};
                
                return (
                  <tr key={i} className="hover:bg-slate-50 transition-colors">
                    <td className="p-6 font-medium text-slate-800">{p.proposal_id}</td>
                    <td className="p-6">
                      <div className="font-bold text-slate-800 mb-1">{p.title_proposal}</div>
                      <div className="text-xs text-slate-500">{event.event_name || p.event_id}</div>
                    </td>
                    <td className="p-6 text-slate-600">{user.full_name || p.user_id}</td>
                    <td className="p-6">
                      <span className="px-3 py-1 bg-amber-50 text-amber-700 rounded-full text-xs font-bold tracking-wide">
                        {p.status || 'Draft'}
                      </span>
                    </td>
                    <td className="p-6 text-slate-600">{p.submission_date}</td>
                  </tr>
                );
              })}
              {(!proposals || proposals.length === 0) && (
                <tr>
                  <td colSpan="5" className="p-8 text-center text-slate-500 font-medium">Belum ada data proposal.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ProposalManagement;
