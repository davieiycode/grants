import React from 'react';
import { Rocket, Users, BookOpen, FileText, AlertTriangle, CheckCircle } from 'lucide-react';

const Dashboard = ({ events, proposals, reviews, currentUser }) => {
  const role = currentUser?.role || 'CLIENT';
  
  return (
    <div className="animate-fade-in">
      <header className="max-w-3xl mx-auto text-center mb-16">
        <h1 className="text-5xl md:text-6xl font-black mb-4 tracking-tight bg-gradient-to-r from-[#0ea5e9] to-[#6366f1] bg-clip-text text-transparent pb-2 font-['Outfit']">
          Sistem Pengelolaan Proposal
        </h1>
        <p className="text-lg text-[#64748b] font-medium max-w-2xl mx-auto">
          Selamat datang, {currentUser?.full_name || currentUser?.email_address}. Anda masuk sebagai {role}.
        </p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        <StatCard title="Total Event" value={events?.length || 0} icon={<Rocket />} color="sky" />
        <StatCard title="Total Proposal" value={proposals?.length || 0} icon={<FileText />} color="indigo" />
        {['SUPERADMIN', 'ADMIN', 'MANAGER', 'REVIEWER'].includes(role) && (
          <StatCard title="Total Review" value={reviews?.length || 0} icon={<CheckCircle />} color="emerald" />
        )}
      </div>
    </div>
  );
};

const StatCard = ({ title, value, icon, color }) => {
  const colorMap = {
    sky: 'from-sky-400 to-sky-600 shadow-sky-100',
    indigo: 'from-indigo-400 to-indigo-600 shadow-indigo-100',
    emerald: 'from-emerald-400 to-emerald-600 shadow-emerald-100',
  };
  
  return (
    <div className="bg-white rounded-[2rem] p-8 flex items-center gap-6 shadow-sm border border-slate-100">
      <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${colorMap[color]} flex items-center justify-center text-white shadow-xl`}>
        {icon}
      </div>
      <div>
        <div className="text-sm font-bold text-slate-400 uppercase tracking-widest">{title}</div>
        <div className="text-4xl font-black text-slate-800">{value}</div>
      </div>
    </div>
  );
}

export default Dashboard;
