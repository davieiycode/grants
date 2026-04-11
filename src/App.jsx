import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Navigation from './components/Navigation';
import Dashboard from './views/Dashboard';
import ProgramDetail from './views/ProgramDetail';
import CrewManagement from './views/CrewManagement';
import FlightManual from './views/FlightManual';
import ProposalDetail from './views/ProposalDetail';
import { cloudSync } from './utils/cloudSync';
import { Rocket } from 'lucide-react';

const App = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [programs, setPrograms] = useState([]);
  const [proposals, setProposals] = useState([]);
  const [isSyncing, setIsSyncing] = useState(false);

  useEffect(() => {
    // Check local session
    const savedUser = localStorage.getItem('grants_currentUser');
    if (savedUser) {
      setCurrentUser(JSON.parse(savedUser));
      setIsLoggedIn(true);
    }
    
    // Load local data
    const localProgs = localStorage.getItem('grants_programs_meta');
    if (localProgs) setPrograms(JSON.parse(localProgs));

    const localProps = localStorage.getItem('grants_proposals');
    if (localProps) setProposals(JSON.parse(localProps));

    handleSync();
  }, []);

  const handleSync = async () => {
    setIsSyncing(true);
    const data = await cloudSync.pull();
    if (data) {
      if (data.programs) setPrograms(data.programs);
      if (data.proposals) setProposals(data.proposals);
    }
    setIsSyncing(false);
  };

  if (!isLoggedIn) {
    return (
      <LoginGate onLogin={(user) => {
        setCurrentUser(user);
        setIsLoggedIn(true);
        localStorage.setItem('grants_currentUser', JSON.stringify(user));
      }} />
    );
  }

  return (
    <Router basename="/grants">
      <div className="min-h-screen bg-[#f8fafc] text-[#0f172a]">
        <Navigation currentUser={currentUser} isSyncing={isSyncing} />
        
        <main className="container py-12">
          <Routes>
            <Route path="/" element={<Dashboard programs={programs} />} />
            <Route path="/program/:id" element={<ProgramDetail programs={programs} proposals={proposals} />} />
            <Route path="/proposal/:id" element={<ProposalDetail proposals={proposals} />} />
            <Route path="/crew" element={<CrewManagement />} />
            <Route path="/manual" element={<FlightManual />} />
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
};

// Placeholder for sub-views
const LoginGate = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f8fafc] to-[#e2e8f0] flex items-center justify-center p-6">
      <div className="bg-white/70 backdrop-blur-2xl border border-white rounded-[2rem] p-12 w-full max-w-[440px] shadow-2xl shadow-slate-200 animate-fade-in text-center">
        <div className="flex items-center justify-center gap-3 mb-10">
          <div className="w-14 h-14 bg-gradient-to-br from-[#0ea5e9] to-[#6366f1] rounded-2xl flex items-center justify-center text-white shadow-xl shadow-sky-100">
            <Rocket size={32} />
          </div>
          <div className="flex items-baseline gap-0.5 mt-2">
            <span className="font-['Outfit'] text-3xl font-black text-[#0ea5e9] tracking-tight">Pro</span>
            <span className="font-['Playfair_Display'] text-[2rem] font-bold italic text-[#0f172a]">Space</span>
          </div>
        </div>

        <h1 className="text-2xl font-black text-[#0f172a] mb-2 tracking-tight">Elevate your Research</h1>
        <p className="text-[#64748b] font-medium text-sm mb-10">Open the book to manage your space.</p>

        <div className="space-y-6 text-left mb-10">
          <div className="space-y-1.5">
            <label className="text-[10px] font-black text-[#64748b] uppercase tracking-wider pl-1 font-['Outfit']">Email address</label>
            <input 
              type="email" 
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="email@ugm.ac.id" 
              className="w-full h-[56px] px-5 bg-white border border-[#e2e8f0] rounded-2xl focus:outline-none focus:ring-4 focus:ring-sky-100 transition-all font-medium" 
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-[10px] font-black text-[#64748b] uppercase tracking-wider pl-1 font-['Outfit']">Password</label>
            <input 
              type="password" 
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="••••••••" 
              className="w-full h-[56px] px-5 bg-white border border-[#e2e8f0] rounded-2xl focus:outline-none focus:ring-4 focus:ring-sky-100 transition-all font-medium" 
            />
          </div>
        </div>

        <button 
          onClick={() => onLogin({ name: email.split('@')[0], email, role: 'SUPERADMIN' })}
          className="w-full h-[60px] bg-[#0ea5e9] text-white rounded-2xl font-black text-lg shadow-xl shadow-sky-100 hover:-translate-y-1 active:scale-95 transition-all font-['Outfit']"
        >
          INITIATE DOCKING
        </button>

        <p className="mt-12 text-[10px] font-black text-[#64748b]/50 uppercase tracking-[0.1em] leading-relaxed font-['Outfit']">
          © 2026 Universitas Gadjah Mada.<br/>
          Powered by ProSpace v3.2.0
        </p>
      </div>
    </div>
  );
};

export default App;
