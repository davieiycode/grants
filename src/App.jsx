import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Navigation from './components/Navigation';
import Dashboard from './views/Dashboard';
import ProgramDetail from './views/ProgramDetail';
import CrewManagement from './views/CrewManagement';
import FlightManual from './views/FlightManual';
import ProposalDetail from './views/ProposalDetail';
import { cloudSync } from './utils/cloudSync';
import { Rocket, Database, Lock, AlertCircle, Loader2 } from 'lucide-react';

const App = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [programs, setPrograms] = useState([]);
  const [proposals, setProposals] = useState([]);
  const [logs, setLogs] = useState([]);
  const [isSyncing, setIsSyncing] = useState(false);
  const [isInitialSync, setIsInitialSync] = useState(true);

  useEffect(() => {
    const initializeApp = async () => {
      // ... (URL param check logic remains the same)
      const params = new URLSearchParams(window.location.search);
      const scriptUrl = params.get('script');
      if (scriptUrl && scriptUrl.startsWith('https://script.google.com/')) {
        localStorage.setItem('grants_appscript_url', scriptUrl);
        const cleanUrl = window.location.origin + window.location.pathname;
        window.history.replaceState({}, document.title, cleanUrl);
      }

      // 2. Check local session with role normalization
      const savedUser = localStorage.getItem('grants_currentUser');
      if (savedUser) {
        const user = JSON.parse(savedUser);
        if (user.role) user.role = user.role.toUpperCase();
        setCurrentUser(user);
        setIsLoggedIn(true);
      }
      
      // 3. Load local data
      const localProgs = localStorage.getItem('grants_programs_meta');
      if (localProgs) setPrograms(JSON.parse(localProgs));

      const localProps = localStorage.getItem('grants_proposals');
      if (localProps) setProposals(JSON.parse(localProps));

      const localLogs = localStorage.getItem('grants_global_logs');
      if (localLogs) setLogs(JSON.parse(localLogs));

      // 4. Trigger initial sync if URL exists
      if (localStorage.getItem('grants_appscript_url')) {
        await handleSync();
      }
      
      setIsInitialSync(false);
    };

    initializeApp();
  }, []);

  const handleSync = async () => {
    setIsSyncing(true);
    const data = await cloudSync.pull();
    if (data) {
      if (data.programs) setPrograms(data.programs);
      if (data.proposals) setProposals(data.proposals);
      if (data.logs) setLogs(data.logs);
    }
    setIsSyncing(false);
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setCurrentUser(null);
    localStorage.removeItem('grants_currentUser');
  };

  if (isInitialSync) {
    // ... (Loading screen remains same)
    return (
      <div className="min-h-screen bg-[#f8fafc] flex flex-col items-center justify-center font-['Outfit'] p-6">
        {/* ... (loader content) */}
        <div className="relative mb-10">
          <div className="w-20 h-20 bg-gradient-to-br from-[#0ea5e9] to-[#6366f1] rounded-[2rem] flex items-center justify-center text-white shadow-2xl shadow-sky-100 animate-pulse">
            <Rocket size={40} className="animate-bounce" />
          </div>
          <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-white rounded-xl shadow-lg flex items-center justify-center">
            <Loader2 className="animate-spin text-[#0ea5e9]" size={18} />
          </div>
        </div>
        
        <div className="text-center">
          <div className="flex items-center justify-center gap-0.5 mb-2">
            <span className="text-3xl font-black text-[#0ea5e9] tracking-tight">Pro</span>
            <span className="font-['Playfair_Display'] text-[2rem] font-bold italic text-[#0f172a]">Space</span>
          </div>
          <h2 className="text-sm font-black text-[#64748b] uppercase tracking-[0.3em] mb-8">Ground Control Link</h2>
          
          <div className="flex flex-col items-center gap-4">
            <div className="w-48 h-1.5 bg-slate-100 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-[#0ea5e9] to-[#6366f1] animate-progress" />
            </div>
            <p className="text-xs font-bold text-[#0ea5e9] animate-pulse">SYNCHRONIZING TELEMETRY DATA...</p>
          </div>
        </div>

        <p className="fixed bottom-10 text-[10px] font-black text-[#64748b]/30 uppercase tracking-widest">
          Secure Protocol v4.0.0
        </p>
      </div>
    );
  }

  if (!isLoggedIn) {
    return (
      <AuthGate onLogin={(user) => {
        const normalizedUser = { ...user, role: (user.role || 'GUEST').toUpperCase() };
        setCurrentUser(normalizedUser);
        setIsLoggedIn(true);
        localStorage.setItem('grants_currentUser', JSON.stringify(normalizedUser));
        handleSync();
      }} />
    );
  }

  return (
    <Router basename="/grants">
      <div className="min-h-screen bg-[#f8fafc] text-[#0f172a]">
        <Navigation currentUser={currentUser} isSyncing={isSyncing} onLogout={handleLogout} />
        
        <main className="container py-12 px-4 md:px-8">
          <Routes>
            <Route path="/" element={<Dashboard programs={programs} currentUser={currentUser} />} />
            <Route path="/program/:id" element={<ProgramDetail programs={programs} proposals={proposals} currentUser={currentUser} />} />
            <Route path="/proposal/:id" element={<ProposalDetail proposals={proposals} currentUser={currentUser} />} />
            <Route path="/crew" element={
              ['SUPERADMIN', 'ADMIN', 'MANAGER', 'EDITOR', 'REVIEWER'].includes(currentUser?.role) 
                ? <CrewManagement currentUser={currentUser} logs={logs} /> 
                : <Navigate to="/" />
            } />
            <Route path="/manual" element={<FlightManual currentUser={currentUser} />} />
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
};

const AuthGate = ({ onLogin }) => {
  const [step, setStep] = useState(localStorage.getItem('grants_appscript_url') ? 'login' : 'config');
  const [appscriptUrl, setAppscriptUrl] = useState(localStorage.getItem('grants_appscript_url') || '');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleConfig = async () => {
    if (!appscriptUrl.startsWith('https://script.google.com/')) {
      setError('Invalid Appscript URL format.');
      return;
    }
    
    setIsLoading(true);
    setError('');
    
    // Test the URL and pull initial data
    localStorage.setItem('grants_appscript_url', appscriptUrl);
    const data = await cloudSync.pull();
    
    if (data) {
      setStep('login');
    } else {
      setError('Could not connect to the Space. Check your URL.');
      localStorage.removeItem('grants_appscript_url');
    }
    setIsLoading(false);
  };

  const handleLogin = () => {
    setError('');
    const registeredUsers = JSON.parse(localStorage.getItem('grants_registeredUsers') || '[]');
    
    const normalizedEmail = email.trim().toLowerCase();
    const normalizedPassword = String(password).trim();
    
    const user = registeredUsers.find(u => {
      const userIdentifier = (u.email || u.id || '').toString().trim().toLowerCase();
      const userPassword = (u.password || u.pass || '').toString().trim();
      
      return userIdentifier === normalizedEmail && userPassword === normalizedPassword;
    });
    
    if (user) {
      onLogin(user);
    } else {
      setError('Invalid credentials. Access denied.');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f8fafc] to-[#e2e8f0] flex items-center justify-center p-6 font-['Outfit']">
      <div className="bg-white/70 backdrop-blur-2xl border border-white rounded-[2.5rem] p-8 md:p-12 w-full max-w-[480px] shadow-2xl shadow-slate-200 animate-fade-in text-center relative overflow-hidden">
        
        {/* Decorative elements */}
        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-[#0ea5e9] to-[#6366f1]" />
        
        <div className="flex items-center justify-center gap-3 mb-10">
          <div className="w-14 h-14 bg-gradient-to-br from-[#0ea5e9] to-[#6366f1] rounded-2xl flex items-center justify-center text-white shadow-xl shadow-sky-100">
            <Rocket size={32} />
          </div>
          <div className="flex items-baseline gap-0.5 mt-2">
            <span className="text-3xl font-black text-[#0ea5e9] tracking-tight">Pro</span>
            <span className="font-['Playfair_Display'] text-[2rem] font-bold italic text-[#0f172a]">Space</span>
          </div>
        </div>

        {step === 'config' ? (
          <div className="animate-in slide-in-from-right-4 fade-in duration-500">
            <h1 className="text-2xl font-black text-[#0f172a] mb-2 tracking-tight">Connect to Space</h1>
            <p className="text-[#64748b] font-medium text-sm mb-10">Input your Space Code (Appscript URL) to begin synchronization.</p>

            <div className="space-y-6 text-left mb-10">
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-[#64748b] uppercase tracking-wider pl-1">Appscript URL</label>
                <div className="relative">
                  <Database className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input 
                    type="text" 
                    value={appscriptUrl}
                    onChange={e => setAppscriptUrl(e.target.value)}
                    placeholder="https://script.google.com/macros/s/.../exec" 
                    className="w-full h-[60px] pl-12 pr-5 bg-white border border-[#e2e8f0] rounded-2xl focus:outline-none focus:ring-4 focus:ring-sky-100 transition-all font-medium text-sm" 
                  />
                </div>
              </div>
            </div>

            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-2xl flex items-center gap-3 text-red-600 text-xs font-bold animate-shake">
                <AlertCircle size={16} />
                {error}
              </div>
            )}

            <button 
              onClick={handleConfig}
              disabled={isLoading || !appscriptUrl}
              className="w-full h-[64px] bg-[#0ea5e9] text-white rounded-2xl font-black text-lg shadow-xl shadow-sky-100 hover:-translate-y-1 active:scale-95 transition-all flex items-center justify-center gap-3 disabled:opacity-50 disabled:translate-y-0"
            >
              {isLoading ? <Loader2 className="animate-spin" /> : 'ESTABLISH CONNECTION'}
            </button>
          </div>
        ) : (
          <div className="animate-in slide-in-from-right-4 fade-in duration-500">
            <h1 className="text-2xl font-black text-[#0f172a] mb-2 tracking-tight">Personnel Authentication</h1>
            <p className="text-[#64748b] font-medium text-sm mb-10">Identify yourself to access the command center.</p>

            <div className="space-y-6 text-left mb-10">
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-[#64748b] uppercase tracking-wider pl-1">Crew Identifier</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input 
                    type="text" 
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="Email or Personnel ID" 
                    className="w-full h-[60px] pl-12 pr-5 bg-white border border-[#e2e8f0] rounded-2xl focus:outline-none focus:ring-4 focus:ring-sky-100 transition-all font-medium" 
                  />
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-[#64748b] uppercase tracking-wider pl-1">Security Key</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input 
                    type="password" 
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="••••••••" 
                    className="w-full h-[60px] pl-12 pr-5 bg-white border border-[#e2e8f0] rounded-2xl focus:outline-none focus:ring-4 focus:ring-sky-100 transition-all font-medium" 
                  />
                </div>
              </div>
            </div>

            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-2xl flex items-center gap-3 text-red-600 text-xs font-bold animate-shake">
                <AlertCircle size={16} />
                {error}
              </div>
            )}

            <button 
              onClick={handleLogin}
              className="w-full h-[64px] bg-[#0ea5e9] text-white rounded-2xl font-black text-lg shadow-xl shadow-sky-100 hover:-translate-y-1 active:scale-95 transition-all"
            >
              INITIATE DOCKING
            </button>

            <button 
              onClick={() => {
                localStorage.removeItem('grants_appscript_url');
                localStorage.removeItem('grants_registeredUsers');
                localStorage.removeItem('grants_programs_meta');
                localStorage.removeItem('grants_proposals');
                localStorage.removeItem('grants_global_logs');
                setStep('config');
                setError('');
              }}
              className="mt-6 text-[10px] font-black text-[#64748b] uppercase tracking-widest hover:text-[#0ea5e9] transition-colors"
            >
              Change Space Connection
            </button>
          </div>
        )}

        <p className="mt-12 text-[10px] font-black text-[#64748b]/40 uppercase tracking-[0.2em] leading-relaxed">
          © 2026 Universitas Gadjah Mada.<br/>
          Secure Protocol v4.0.0
        </p>
      </div>
    </div>
  );
};

export default App;
