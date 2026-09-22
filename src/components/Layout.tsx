import { useStore } from '../store';
import { Button } from './ui';
import { 
  LogOut, 
  User, 
  School, 
  BookOpen, 
  FileText, 
  Bell, 
  RotateCw, 
  Database, 
  Minimize2, 
  Maximize2, 
  ArrowLeft,
  GraduationCap,
  ShieldCheck,
  CheckCircle2
} from 'lucide-react';
import { ReactNode, useState, useEffect } from 'react';

export function Layout({ children }: { children: ReactNode }) {
  const { currentUser, logout, login, schools, provinces, districts } = useStore();
  const school = schools.find(s => s.id === currentUser?.schoolId);

  // Live Mozambican Institutional Digital Clock matching the user interface design
  const [currentDateTime, setCurrentDateTime] = useState(new Date());
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentDateTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Format date in Portuguese
  const dayName = currentDateTime.toLocaleDateString('pt-PT', { weekday: 'long' });
  const capitalizedDayName = dayName.charAt(0).toUpperCase() + dayName.slice(1);
  const formattedTime = currentDateTime.toLocaleTimeString('pt-PT', { hour12: false });
  const formattedDate = currentDateTime.toLocaleDateString('pt-PT', { 
    day: 'numeric', 
    month: 'long', 
    year: 'numeric' 
  });

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen().catch(() => {});
        setIsFullscreen(false);
      }
    }
  };

  const handleRefresh = () => {
    window.location.reload();
  };

  const getRoleName = (role: string) => {
    switch (role) {
      case 'admin': return 'Administrador Geral';
      case 'director': return 'Diretor';
      case 'pedagogical': return 'Diretor Adjunto Pedagógico';
      case 'teacher': return 'Professor';
      case 'secretariat': return 'Chefe da Secretaria';
      case 'national': return 'Ministério (Nacional)';
      case 'provincial': return 'Direção Provincial';
      case 'district': return 'Direção Distrital';
      case 'student': return 'Aluno / Encarregado';
      default: return role;
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col font-sans text-slate-900">
      {/* ------------------------------------------------------------- */}
      {/* TOP HEADER: EXECUTIVE NAVY SHELL WITH GOLD ACCENTS & CLOCK    */}
      {/* ------------------------------------------------------------- */}
      <header className="bg-[#070d24] border-b border-[#18234d] text-white sticky top-0 z-40 shadow-lg no-print">
        <div className="max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-8 py-2.5">
          <div className="flex flex-wrap items-center justify-between gap-4">
            
            {/* Left: Official Emblem & School Info */}
            <div className="flex items-center space-x-3.5">
              <img 
                src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQua66hW5lOO75LXVLwiJWQJKtgoRJzX58EUSAAc2QdYQ&s=10" 
                alt="República de Moçambique" 
                className="h-11 w-11 object-contain drop-shadow" 
                referrerPolicy="no-referrer"
              />
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-lg font-black tracking-wide text-white font-serif">
                    SIGE • MOÇAMBIQUE
                  </h1>
                  <span className="bg-amber-400 text-slate-950 text-[9px] font-black uppercase px-2 py-0.5 rounded shadow-xs tracking-wider">
                    Oficial MINEDH
                  </span>
                </div>
                <p className="text-xs text-amber-200/90 font-medium tracking-wide">
                  {currentUser?.role === 'national' ? 'Coordenação Central de Moçambique' : 
                   currentUser?.role === 'provincial' ? `Direção Provincial - ${provinces.find(p => p.id === currentUser.provinceId)?.name || 'Maputo'}` :
                   currentUser?.role === 'district' ? `Direção Distrital - ${districts.find(d => d.id === currentUser.districtId)?.name || 'KaMpfumo'}` :
                   currentUser?.role === 'student' ? `Portal do Estudante • ${school?.name || 'Escola Secundária Central'}` :
                   `${school?.name || 'Escola Secundária Central'} • ${provinces.find(p => p.id === currentUser?.provinceId)?.name || 'Maputo'}`}
                </p>
              </div>
            </div>

            {/* Center: Mozambican Digital Live Clock Widget matching user image */}
            <div className="flex justify-center">
              <div className="border border-amber-400/50 bg-[#0c163b] px-6 py-1.5 rounded-xl text-center shadow-lg shadow-black/40 min-w-[210px]">
                <div className="text-amber-400 text-xs font-bold uppercase tracking-wider leading-none">
                  {capitalizedDayName}
                </div>
                <div className="text-amber-300 font-mono text-xl font-black tracking-widest leading-tight my-0.5 drop-shadow">
                  {formattedTime}
                </div>
                <div className="text-slate-300 text-[11px] font-medium leading-none">
                  {formattedDate}
                </div>
              </div>
            </div>

            {/* Right: Notifications, User Profile & Quick Action Toolbar */}
            <div className="flex items-center space-x-3 sm:space-x-4">
              {/* Notification Bell */}
              <button 
                className="relative p-2 rounded-lg border border-cyan-500/40 bg-[#0c1738] text-cyan-300 hover:bg-cyan-500/20 transition-colors shadow-xs"
                title="Notificações do Sistema"
              >
                <Bell className="h-4 w-4" />
                <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-cyan-400 animate-pulse"></span>
              </button>

              {/* User Profile Badge */}
              <div className="flex items-center space-x-2.5 pl-2 border-l border-slate-700/60">
                <div className="relative">
                  <div className="h-10 w-10 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-slate-950 font-black shadow-md border-2 border-amber-300">
                    <User className="h-5 w-5 text-slate-950" />
                  </div>
                  <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-emerald-500 border-2 border-[#070d24]" title="Online"></span>
                </div>
                <div className="hidden sm:block text-left">
                  <div className="flex items-center gap-1.5">
                    <span className="text-sm font-black text-white tracking-wide">
                      SLAITER TRIPAS
                    </span>
                    <span className="bg-amber-400 text-slate-950 text-[9px] font-black uppercase px-1.5 py-0.2 rounded leading-tight">
                      Programador
                    </span>
                  </div>
                  <div className="text-[10px] text-amber-200/90 font-medium">
                    {currentUser?.name} • {currentUser ? getRoleName(currentUser.role) : 'Proprietário do Sistema'}
                  </div>
                </div>
              </div>

              {/* Quick Action Toolbar (Cyan-bordered icons matching user design) */}
              <div className="flex items-center space-x-1.5 pl-2 border-l border-slate-700/60">
                <button
                  onClick={handleRefresh}
                  className="p-2 rounded-lg border border-cyan-500/50 bg-[#0c1738] text-cyan-300 hover:bg-cyan-500/20 hover:text-white transition-colors"
                  title="Recarregar Dados"
                >
                  <RotateCw className="h-4 w-4" />
                </button>

                <button
                  onClick={() => alert("Base de Dados Oficial MINEDH conectada e sincronizada!")}
                  className="p-2 rounded-lg border border-cyan-500/50 bg-[#0c1738] text-cyan-300 hover:bg-cyan-500/20 hover:text-white transition-colors"
                  title="Base de Dados"
                >
                  <Database className="h-4 w-4" />
                </button>

                <button
                  onClick={toggleFullscreen}
                  className="p-2 rounded-lg border border-cyan-500/50 bg-[#0c1738] text-cyan-300 hover:bg-cyan-500/20 hover:text-white transition-colors"
                  title={isFullscreen ? "Minimizar Ecrã" : "Ecrã Inteiro"}
                >
                  {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
                </button>

                <button
                  onClick={logout}
                  className="p-2 rounded-lg border border-red-500/50 bg-red-950/40 text-red-300 hover:bg-red-600 hover:text-white transition-colors ml-1"
                  title="Terminar Sessão / Sair"
                >
                  <LogOut className="h-4 w-4" />
                </button>
              </div>

            </div>
          </div>
        </div>

        {/* ------------------------------------------------------------- */}
        {/* SUBHEADER: NAVIGATION BAR WITH "VOLTAR" & SYSTEM STATUS       */}
        {/* ------------------------------------------------------------- */}
        <div className="bg-[#05091b] border-t border-[#121a38] px-4 sm:px-6 lg:px-8 py-2">
          <div className="max-w-[1920px] mx-auto flex flex-wrap items-center justify-between gap-3 text-xs">
            
            {/* Left: "← Voltar" Button with gold accent border */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => window.history.back()}
                className="border border-amber-400 text-amber-300 hover:bg-amber-400 hover:text-slate-950 font-bold text-xs px-3.5 py-1.5 rounded-lg flex items-center gap-1.5 shadow-sm transition-all"
              >
                <ArrowLeft className="h-3.5 w-3.5" />
                Voltar
              </button>

              <div className="hidden md:flex items-center gap-2 text-slate-300">
                <span className="text-amber-400 font-bold">Módulo:</span>
                <span className="font-semibold text-white">Sistema de Pautas & Gestão Pedagógica</span>
              </div>
            </div>

            {/* Quick Profile Switching (Prof, Pedagógico, Secretaria, Diretor) */}
            <div className="flex items-center bg-[#0d163a] rounded-lg p-1 border border-slate-700/60">
              <button 
                onClick={() => login('admin@escola.com')}
                className={`px-2 font-semibold text-[11px] transition-colors ${
                  currentUser?.role === 'admin' ? 'text-amber-400' : 'text-slate-400 hover:text-white'
                }`}
                title="Aceder à Administração Geral do Sistema"
              >
                Perfil:
              </button>
              <button
                onClick={() => login('secretaria@escola.com')}
                className={`px-2.5 py-1 rounded font-bold transition-all text-xs ${
                  currentUser?.role === 'secretariat' ? 'bg-amber-400 text-slate-950 shadow-sm' : 'text-slate-300 hover:text-white'
                }`}
                title="Aceder como Secretaria"
              >
                📋 Secretaria
              </button>
              <button
                onClick={() => login('pedagogico@escola.com')}
                className={`px-2.5 py-1 rounded font-bold transition-all text-xs ${
                  currentUser?.role === 'pedagogical' ? 'bg-amber-400 text-slate-950 shadow-sm' : 'text-slate-300 hover:text-white'
                }`}
                title="Aceder como Diretor Pedagógico (Pautas Oficiais, Júris, Admitidos)"
              >
                🎓 Pedagógico
              </button>
              <button
                onClick={() => login('aluno@escola.com')}
                className={`px-2.5 py-1 rounded font-bold transition-all text-xs ${
                  currentUser?.role === 'student' ? 'bg-indigo-500 text-white shadow-sm' : 'text-slate-300 hover:text-white'
                }`}
                title="Aceder como Aluno (Portal do Estudante)"
              >
                🎓 Aluno
              </button>
              <button
                onClick={() => login('professor@escola.com')}
                className={`px-2.5 py-1 rounded font-bold transition-all text-xs ${
                  currentUser?.role === 'teacher' ? 'bg-amber-400 text-slate-950 shadow-sm' : 'text-slate-300 hover:text-white'
                }`}
                title="Aceder como Professor (Lançamento de Notas)"
              >
                👨‍🏫 Professor
              </button>
              <button
                onClick={() => login('diretor@escola.com')}
                className={`px-2.5 py-1 rounded font-bold transition-all text-xs ${
                  currentUser?.role === 'director' ? 'bg-amber-400 text-slate-950 shadow-sm' : 'text-slate-300 hover:text-white'
                }`}
                title="Aceder como Diretor"
              >
                🏛️ Diretor
              </button>
              <div className="w-px h-4 bg-slate-700/60 mx-1"></div>
              <button
                onClick={() => login('distrital@gov.mz')}
                className={`px-2.5 py-1 rounded font-bold transition-all text-xs ${
                  currentUser?.role === 'district' ? 'bg-indigo-500 text-white shadow-sm' : 'text-slate-300 hover:text-white'
                }`}
                title="Aceder como Distrito"
              >
                🏘️ Distrital
              </button>
              <button
                onClick={() => login('provincial@gov.mz')}
                className={`px-2.5 py-1 rounded font-bold transition-all text-xs ${
                  currentUser?.role === 'provincial' ? 'bg-indigo-500 text-white shadow-sm' : 'text-slate-300 hover:text-white'
                }`}
                title="Aceder como Província"
              >
                📍 Provincial
              </button>
              <button
                onClick={() => login('ministro@gov.mz')}
                className={`px-2.5 py-1 rounded font-bold transition-all text-xs ${
                  currentUser?.role === 'national' ? 'bg-indigo-500 text-white shadow-sm' : 'text-slate-300 hover:text-white'
                }`}
                title="Aceder como Ministério (Nacional)"
              >
                🌍 Nacional
              </button>
            </div>

            {/* Right: System Status */}
            <div className="flex items-center gap-2">
              <span className="flex items-center gap-1.5 text-emerald-400 font-bold text-xs bg-emerald-950/50 border border-emerald-500/40 px-3 py-1 rounded-full">
                <span className="h-2 w-2 rounded-full bg-emerald-400 animate-ping"></span>
                Sistema Online | Sempre em Dia
              </span>
            </div>

          </div>
        </div>
      </header>

      {/* Main Content Area - High Contrast, Razor Sharp Text */}
      <main className="flex-1 flex w-full">
        {children}
      </main>
    </div>
  );
}
