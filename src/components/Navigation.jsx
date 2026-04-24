import React from 'react';
import { Rocket, Users, BookOpen, Cloud, User, ChevronDown } from 'lucide-react';
import { NavLink as RouterNavLink } from 'react-router-dom';

const Navigation = ({ currentUser, isSyncing, onLogout }) => {
  return (
    <nav className="sticky top-0 z-50 h-[72px] bg-white/80 backdrop-blur-xl border-b border-[#e2e8f0] px-[5%] flex items-center justify-between gap-8">
      <RouterNavLink to="/" className="flex items-center gap-3 shrink-0">
        <div className="w-10 h-10 bg-gradient-to-br from-[#0ea5e9] to-[#6366f1] rounded-xl flex items-center justify-center text-white shadow-lg shadow-sky-100">
          <Rocket size={24} />
        </div>
        <div className="flex items-baseline gap-0.5">
          <span className="font-['Outfit'] text-2xl font-black text-[#0ea5e9] tracking-tight">Pro</span>
          <span className="font-['Playfair_Display'] text-[1.6rem] font-bold italic text-[#0f172a]">Space</span>
        </div>
      </RouterNavLink>

      <div className="flex items-center gap-8 flex-1">
        <NavLink to="/" icon={<Rocket size={18} />}>Expeditions</NavLink>
        {['SUPERADMIN', 'ADMIN', 'MANAGER', 'EDITOR', 'REVIEWER'].includes(currentUser?.role) && (
          <NavLink to="/crew" icon={<Users size={18} />}>Crew & Protocols</NavLink>
        )}
        <NavLink to="/manual" icon={<BookOpen size={18} />}>Flight Manual</NavLink>
      </div>

      <div className="flex items-center gap-5">
        <div className="flex items-center gap-2 py-1.5 px-3 bg-white border border-[#e2e8f0] rounded-xl min-w-[140px]">
          <Cloud className={isSyncing ? "animate-spin text-amber-500" : "text-[#10b981]"} size={20} />
          <div className="flex flex-col">
            <span className="text-[10px] font-black text-[#64748b] opacity-60 uppercase tracking-wider leading-none">Telemetry</span>
            <span className="text-xs font-bold text-[#0f172a]">{isSyncing ? 'Syncing...' : 'Connected'}</span>
          </div>
        </div>

        <div 
          onClick={onLogout}
          title="Click to logout"
          className="flex items-center gap-3.5 cursor-pointer p-1.5 pr-4 rounded-2xl hover:bg-red-50 border border-transparent hover:border-red-100 transition-all group"
        >
          <div className="w-10 h-10 rounded-xl bg-sky-50 text-[#0ea5e9] flex items-center justify-center shadow-sm group-hover:bg-red-100 group-hover:text-red-600 transition-all">
            <User size={24} />
          </div>
          <div className="text-left hidden md:block">
            <div className="font-black text-sm text-[#0f172a] tracking-tight group-hover:text-red-600">{currentUser?.name || 'GUEST'}</div>
            <div className="text-[11px] font-black text-[#0ea5e9] uppercase tracking-wider leading-none mt-1 group-hover:text-red-500">{currentUser?.role || 'ASTRONAUT'}</div>
          </div>
          <ChevronDown size={14} className="text-slate-400 ml-1 group-hover:text-red-400" />
        </div>
      </div>
    </nav>
  );
};

const NavLink = ({ children, to, icon }) => (
  <RouterNavLink 
    to={to}
    className={({ isActive }) => `
      flex items-center gap-2 font-['Outfit'] font-bold text-sm transition-all relative py-2 
      ${isActive ? 'text-[#0f172a]' : 'text-[#64748b] hover:text-[#0ea5e9]'}
    `}
  >
    {({ isActive }) => (
      <>
        {icon}
        {children}
        {isActive && <div className="absolute -bottom-[22px] left-0 w-full h-[3px] bg-[#0ea5e9] rounded-t-full shadow-[0_-2px_8px_rgba(14,165,233,0.4)]" />}
      </>
    )}
  </RouterNavLink>
);

export default Navigation;
