import React from 'react';

const UserManagement = ({ users, currentUser }) => {
  return (
    <div className="animate-fade-in">
      <header className="mb-10">
        <h1 className="text-3xl font-black text-[#0f172a] mb-2 font-['Outfit']">User Management</h1>
        <p className="text-[#64748b]">Kelola pengguna sistem dan hak akses.</p>
      </header>

      <div className="bg-white rounded-[2rem] border border-slate-100 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 border-b border-slate-100 text-slate-500 uppercase tracking-wider font-bold">
              <tr>
                <th className="p-6">ID User</th>
                <th className="p-6">Email</th>
                <th className="p-6">Nama Lengkap</th>
                <th className="p-6">Role</th>
                <th className="p-6">Unit</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {users?.map((u, i) => (
                <tr key={i} className="hover:bg-slate-50 transition-colors">
                  <td className="p-6 font-medium text-slate-800">{u.user_id}</td>
                  <td className="p-6 text-slate-600">{u.email_address}</td>
                  <td className="p-6 font-bold text-slate-800">{u.prefix} {u.full_name} {u.suffix}</td>
                  <td className="p-6">
                    <span className="px-3 py-1 bg-sky-100 text-sky-700 rounded-full text-xs font-bold tracking-wide">
                      {u.role}
                    </span>
                  </td>
                  <td className="p-6 text-slate-600">{u.unit} - {u.department}</td>
                </tr>
              ))}
              {(!users || users.length === 0) && (
                <tr>
                  <td colSpan="5" className="p-8 text-center text-slate-500 font-medium">Belum ada data user.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default UserManagement;
