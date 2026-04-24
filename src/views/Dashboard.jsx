import React from 'react';
import ProgramCard from '../components/ProgramCard';
import { Plus } from 'lucide-react';

const Dashboard = ({ programs, currentUser }) => {
  return (
    <div className="animate-fade-in">
      <header className="max-w-3xl mx-auto text-center mb-16">
        <h1 className="text-5xl md:text-6xl font-black mb-4 tracking-tight bg-gradient-to-r from-[#0ea5e9] to-[#6366f1] bg-clip-text text-transparent pb-2 font-['Outfit']">
          Portal Hibah & Penelitian
        </h1>
        <p className="text-lg text-[#64748b] font-medium max-w-2xl mx-auto">
          Selamat datang di Command Center ProSpace. Kelola seluruh siklus hibah penelitian dari satu dashboard terpadu.
        </p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {programs.map(program => (
          <ProgramCard key={program.id} program={program} />
        ))}
        
        {/* Create New Program Button - Restricted to Admin/Superadmin */}
        {(currentUser?.role === 'SUPERADMIN' || currentUser?.role === 'ADMIN') && (
          <div className="bg-[#f8fafc] border-2 border-dashed border-[#e2e8f0] rounded-[2rem] p-8 flex flex-col items-center justify-center gap-4 hover:border-[#0ea5e9] hover:bg-white transition-all cursor-pointer group min-h-[280px]">
            <div className="w-14 h-14 rounded-2xl bg-white border border-[#e2e8f0] flex items-center justify-center text-[#64748b] group-hover:bg-[#0ea5e9] group-hover:text-white group-hover:border-[#0ea5e9] transition-all shadow-sm group-hover:shadow-lg group-hover:shadow-sky-100">
              <Plus size={32} />
            </div>
            <div className="text-center">
              <span className="block font-black text-[#0f172a] font-['Outfit'] text-lg">Inisiasi Expedisi</span>
              <span className="text-sm font-medium text-[#64748b]">Buat program hibah baru</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
