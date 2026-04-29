import React from 'react';

const BlacklistManagement = ({ blacklists, users, currentUser }) => {
  return (
    <div className="animate-fade-in">
      <header className="mb-10">
        <h1 className="text-3xl font-black text-[#0f172a] mb-2 font-['Outfit']">Blacklist Management</h1>
        <p className="text-[#64748b]">Daftar user yang terkena sanksi dan pembatasan pengajuan.</p>
      </header>

      <div className="bg-white rounded-[2rem] border border-slate-100 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 border-b border-slate-100 text-slate-500 uppercase tracking-wider font-bold">
              <tr>
                <th className="p-6">ID Blacklist</th>
                <th className="p-6">User</th>
                <th className="p-6">Periode</th>
                <th className="p-6">Catatan</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {blacklists?.map((b, i) => {
                const user = users?.find(u => u.user_id === b.user_id) || {};
                return (
                  <tr key={i} className="hover:bg-slate-50 transition-colors">
                    <td className="p-6 font-medium text-slate-800">{b.blacklist_id}</td>
                    <td className="p-6 font-bold text-slate-800">{user.full_name || b.user_id}</td>
                    <td className="p-6 text-slate-600">{b.start_date} s/d {b.end_date}</td>
                    <td className="p-6 text-slate-600 max-w-xs truncate" dangerouslySetInnerHTML={{__html: b.notes}}></td>
                  </tr>
                );
              })}
              {(!blacklists || blacklists.length === 0) && (
                <tr>
                  <td colSpan="4" className="p-8 text-center text-slate-500 font-medium">Tidak ada data blacklist.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default BlacklistManagement;
