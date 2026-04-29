import React from 'react';

const RoleManagement = ({ roles, currentUser }) => {
  return (
    <div className="animate-fade-in">
      <header className="mb-10">
        <h1 className="text-3xl font-black text-[#0f172a] mb-2 font-['Outfit']">Role Management</h1>
        <p className="text-[#64748b]">Konfigurasi perizinan dan akses role pada sistem.</p>
      </header>

      <div className="bg-white rounded-[2rem] border border-slate-100 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 border-b border-slate-100 text-slate-500 uppercase tracking-wider font-bold">
              <tr>
                <th className="p-6">Role ID</th>
                <th className="p-6">Role Name</th>
                <th className="p-6 text-center">View Access</th>
                <th className="p-6 text-center">Add Access</th>
                <th className="p-6 text-center">Edit Access</th>
                <th className="p-6 text-center">Delete Access</th>
                <th className="p-6 text-center">Restore Access</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {roles?.map((r, i) => (
                <tr key={i} className="hover:bg-slate-50 transition-colors">
                  <td className="p-6 font-medium text-slate-800">{r.role_id}</td>
                  <td className="p-6 font-bold text-slate-800">{r.role_name}</td>
                  <td className="p-6 text-center">{r.view_access === 'TRUE' ? '✅' : '❌'}</td>
                  <td className="p-6 text-center">{r.add_access === 'TRUE' ? '✅' : '❌'}</td>
                  <td className="p-6 text-center">{r.edit_access === 'TRUE' ? '✅' : '❌'}</td>
                  <td className="p-6 text-center">{r.delete_access === 'TRUE' ? '✅' : '❌'}</td>
                  <td className="p-6 text-center">{r.restore_access === 'TRUE' ? '✅' : '❌'}</td>
                </tr>
              ))}
              {(!roles || roles.length === 0) && (
                <tr>
                  <td colSpan="7" className="p-8 text-center text-slate-500 font-medium">Belum ada data role.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default RoleManagement;
