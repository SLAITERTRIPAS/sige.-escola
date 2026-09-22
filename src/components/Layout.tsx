import { useStore } from '../store';
import { 
  LogOut, 
  User, 
  Bell, 
  RotateCw, 
  Database, 
  Minimize2, 
  Maximize2, 
  ArrowLeft,
  Eye
} from 'lucide-react';
import { ReactNode, useState, useEffect } from 'react';
import { Sidebar } from './Sidebar';

export function Layout({ children }: { children: ReactNode }) {
  const { currentUser, logout, login, schools, provinces, districts, highContrast, toggleHighContrast } = useStore();
  const school = schools.find(s => s.id === currentUser?.schoolId);
  const showSidebar = ['district', 'provincial', 'national'].includes(currentUser?.role || '');

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
    <div className={`min-h-screen ${highContrast ? 'high-contrast' : 'bg-slate-100'} flex font-sans text-slate-900`}>
      {showSidebar && (
        <Sidebar 
          highContrast={highContrast} 
          toggleHighContrast={toggleHighContrast}
          handleRefresh={handleRefresh}
          toggleFullscreen={toggleFullscreen}
          isFullscreen={isFullscreen}
          logout={logout}
        />
      )}
      
      <div className="flex flex-col flex-1">
      {/* ------------------------------------------------------------- */}
      {/* TOP HEADER: EXECUTIVE NAVY SHELL WITH GOLD ACCENTS & CLOCK    */}
      {/* ------------------------------------------------------------- */}
      <header className="bg-[#070d24] border-b border-[#18234d] text-white sticky top-0 z-40 shadow-lg no-print">
        <div className="max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-8 py-2.5">
          <div className="flex items-center justify-between gap-4">
            
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
                    OFICIAL MINEDH
                  </span>
                </div>
                <p className="text-xs text-amber-200/90 font-medium tracking-wide">
                  Escola Secundária Central • Maputo
                </p>
              </div>
            </div>

            {/* Center: Mozambican Digital Live Clock Widget matching user image */}
            <div className="hidden md:flex justify-center">
              <div className="border border-amber-400/50 bg-[#0c163b] px-6 py-1.5 rounded-xl text-center shadow-lg shadow-black/40 min-w-[210px]">
                <div className="text-amber-400 text-xs font-bold uppercase tracking-wider">{capitalizedDayName}</div>
                <div className="text-amber-300 font-mono text-xl font-black tracking-widest">{formattedTime}</div>
                <div className="text-slate-300 text-[11px] font-medium">{formattedDate}</div>
              </div>
            </div>

            {/* Right: User Profile & Actions */}
            <div className="flex items-center space-x-3 sm:space-x-4">
                 <button 
                  className="relative p-2 rounded-lg border border-cyan-500/40 bg-[#0c1738] text-cyan-300 hover:bg-cyan-500/20 transition-colors shadow-xs"
                  title="Notificações do Sistema"
                >
                  <Bell className="h-4 w-4" />
                  <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-cyan-400 animate-pulse"></span>
                </button>
                <div className="flex items-center space-x-2.5 pl-2 border-l border-slate-700/60">
                  <div className="relative">
                    <div className="h-10 w-10 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-slate-950 font-black shadow-md border-2 border-amber-300">
                      <User className="h-5 w-5 text-slate-950" />
                    </div>
                  </div>
                  <div className="hidden sm:block text-left">
                    <div className="flex items-center gap-2">
                        <div className="text-sm font-black text-white">{currentUser?.name || 'Utilizador'}</div>
                        <span className="bg-amber-400 text-slate-950 text-[9px] font-black uppercase px-2 py-0.5 rounded shadow-xs tracking-wider">PROGRAMADOR</span>
                    </div>
                    <div className="text-[10px] text-amber-200/90">Sr. Diretor • Diretor</div>
                  </div>
                </div>
                
                {/* Actions Toolbar */}
                <div className="flex items-center gap-2 pl-2 border-l border-slate-700/60">
                    <button onClick={handleRefresh} className="p-2 text-cyan-300 hover:text-white"><RotateCw className="h-4 w-4"/></button>
                    <button className="p-2 text-cyan-300 hover:text-white"><Database className="h-4 w-4"/></button>
                    <button onClick={toggleFullscreen} className="p-2 text-cyan-300 hover:text-white">
                        {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
                    </button>
                    <button onClick={logout} className="p-2 text-red-300 hover:text-white"><LogOut className="h-4 w-4"/></button>
                </div>
            </div>
          </div>
        </div>
      </header>

      {/* Subheader */}
      <div className="bg-[#05091b] border-t border-[#121a38] px-4 py-2 flex items-center justify-between">
          <button
            onClick={() => window.history.back()}
            className="border border-amber-400 text-amber-300 hover:bg-amber-400 hover:text-slate-950 font-bold text-xs px-3.5 py-1.5 rounded-lg flex items-center gap-1.5"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Voltar
          </button>
          <div className="text-amber-300 font-bold text-sm">
            Módulo: <span className="text-white">Sistema de Pautas & Gestão Pedagógica</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-emerald-400 font-medium bg-emerald-950/30 px-3 py-1 rounded-full border border-emerald-900/50">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
            Sistema Online | Sempre em Dia
          </div>
      </div>
      
      <main className="flex-1 w-full p-4">
        {children}
      </main>
      </div>
    </div>
  );
}
