import React from 'react';

const ReviewManagement = ({ reviews, proposals, users, currentUser }) => {
  return (
    <div className="animate-fade-in">
      <header className="mb-10">
        <h1 className="text-3xl font-black text-[#0f172a] mb-2 font-['Outfit']">Review Management</h1>
        <p className="text-[#64748b]">Daftar review proposal oleh reviewer yang ditugaskan.</p>
      </header>

      <div className="bg-white rounded-[2rem] border border-slate-100 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 border-b border-slate-100 text-slate-500 uppercase tracking-wider font-bold">
              <tr>
                <th className="p-6">ID Review</th>
                <th className="p-6">Proposal</th>
                <th className="p-6">Reviewer</th>
                <th className="p-6">Status</th>
                <th className="p-6">Selesai Pada</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {reviews?.map((r, i) => {
                const prop = proposals?.find(p => p.proposal_id === r.proposal_id) || {};
                const reviewer = users?.find(u => u.user_id === r.user_id) || {};
                
                return (
                  <tr key={i} className="hover:bg-slate-50 transition-colors">
                    <td className="p-6 font-medium text-slate-800">{r.review_id}</td>
                    <td className="p-6">
                      <div className="font-bold text-slate-800 max-w-[200px] truncate">{prop.title_proposal || r.proposal_id}</div>
                    </td>
                    <td className="p-6 text-slate-600">{reviewer.full_name || r.user_id}</td>
                    <td className="p-6">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold tracking-wide ${r.complete_date ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'}`}>
                        {r.complete_date ? 'Selesai' : 'Pending'}
                      </span>
                    </td>
                    <td className="p-6 text-slate-600">{r.complete_date || '-'}</td>
                  </tr>
                );
              })}
              {(!reviews || reviews.length === 0) && (
                <tr>
                  <td colSpan="5" className="p-8 text-center text-slate-500 font-medium">Belum ada data review.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ReviewManagement;
