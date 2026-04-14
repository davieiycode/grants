import React from 'react';
import { Rocket, ChevronRight, FileText } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const ProgramCard = ({ program }) => {
  const navigate = useNavigate();

  return (
    <div 
      onClick={() => navigate(`/program/${program.id}`)}
      className="group bg-white border border-[#e2e8f0] rounded-[2rem] p-8 flex flex-col gap-6 hover:-translate-y-2 hover:border-[#0ea5e9] hover:shadow-2xl hover:shadow-sky-100 transition-all cursor-pointer relative overflow-hidden"
    >
      <div className="absolute top-0 left-0 w-1.5 h-full bg-gradient-to-b from-[#0ea5e9] to-[#6366f1] opacity-0 group-hover:opacity-100 transition-opacity" />
      
      <div className="w-14 h-14 bg-sky-50 rounded-2xl flex items-center justify-center text-[#0ea5e9] group-hover:scale-110 group-hover:bg-[#0ea5e9] group-hover:text-white transition-all duration-300">
         <Rocket size={28} />
      </div>
      
      <div>
        <div className="flex items-center gap-2 mb-2">
          <h2 className="text-xl font-bold group-hover:text-[#0ea5e9] transition-colors font-['Outfit'] tracking-tight">
            {program.name}
          </h2>
          {program.status === 'active' && (
            <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-600 text-[10px] font-black uppercase tracking-widest border border-emerald-100">Open</span>
          )}
        </div>
        <p className="text-[#64748b] text-sm line-clamp-2 leading-relaxed font-medium">
          {program.desc || 'Deskripsi program belum diatur.'}
        </p>
      </div>

      <div className="mt-auto pt-6 border-t border-slate-50 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center text-slate-400">
            <FileText size={16} />
          </div>
          <div>
            <span className="block text-[10px] font-black text-[#64748b] opacity-60 uppercase tracking-wider">Usulan</span>
            <span className="text-lg font-black text-[#0f172a] font-['Outfit'] leading-none">
              {program.proposalsCount || 0}
            </span>
          </div>
        </div>
        <div className="w-10 h-10 rounded-full border border-[#e2e8f0] flex items-center justify-center text-[#64748b] group-hover:bg-[#0ea5e9] group-hover:text-white group-hover:border-[#0ea5e9] transition-all">
          <ChevronRight size={20} />
        </div>
      </div>
    </div>
  );
};

export default ProgramCard;
