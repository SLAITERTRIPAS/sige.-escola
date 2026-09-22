import React from 'react';
import { 
  LayoutDashboard, 
  Calendar, 
  MessageSquare, 
  FileText, 
  BarChart2, 
  FileSignature,
  GraduationCap,
  AlertCircle,
  ArrowRightLeft,
  Settings,
  HelpCircle
} from 'lucide-react';
import { useStore } from '../store';

interface SidebarMenuProps {
  activeTab: string;
  setActiveTab: (tab: any) => void;
  additionalContent?: React.ReactNode;
}

export const SidebarMenu: React.FC<SidebarMenuProps> = ({ activeTab, setActiveTab, additionalContent }) => {
  const { currentUser } = useStore();

  const standardItems = [
    { id: 'overview', label: 'Visão Geral', icon: <LayoutDashboard size={18} /> },
    { id: 'calendar', label: 'Calendário', icon: <Calendar size={18} /> },
    { id: 'messages', label: 'Mensagem', icon: <MessageSquare size={18} /> },
    { id: 'reports', label: 'Relatório', icon: <FileText size={18} /> },
    { id: 'statistics', label: 'Estatística', icon: <BarChart2 size={18} /> },
    { id: 'signature', label: 'Assinatura', icon: <FileSignature size={18} /> },
  ];

  const studentItems = [
    { id: 'grades', label: 'Consultar o Meu Resultado', icon: <GraduationCap size={18} /> },
    { id: 'complaint', label: 'Reclamação', icon: <AlertCircle size={18} /> },
    { id: 'transfer', label: 'Pedido de Transferência', icon: <ArrowRightLeft size={18} /> },
  ];

  const isStudent = currentUser?.role === 'student';
  const menuItems = isStudent ? studentItems : standardItems;

  return (
    <div className="flex flex-col h-full bg-white border-r border-slate-200 w-64 no-print">
      <div className="p-6 border-b border-slate-100 bg-slate-50/50">
        <h2 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] mb-1">Menu Principal</h2>
        <p className="text-sm font-bold text-slate-800">
          {isStudent ? 'Portal do Aluno' : 'Espaço de Trabalho'}
        </p>
      </div>

      <nav className="flex-1 overflow-y-auto p-3 space-y-1">
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-bold transition-all ${
              activeTab === item.id 
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-200' 
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-950'
            }`}
          >
            <span className={`${activeTab === item.id ? 'text-white' : 'text-slate-400'}`}>
              {item.icon}
            </span>
            {item.label}
          </button>
        ))}

        {additionalContent && (
          <>
            <div className="my-6 border-t border-slate-100 mx-4"></div>
            <div className="px-4 mb-2">
              <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Funcionalidades</h3>
            </div>
            {additionalContent}
          </>
        )}

        {/* Separator if needed */}
        <div className="my-6 border-t border-slate-100 mx-4"></div>

        {/* Secondary Items */}
        <button
          className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-bold text-slate-500 hover:bg-slate-50 transition-all"
          onClick={() => alert('Configurações do Perfil')}
        >
          <Settings size={18} className="text-slate-400" />
          Definições
        </button>
        <button
          className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-bold text-slate-500 hover:bg-slate-50 transition-all"
          onClick={() => alert('Centro de Ajuda EduGestão')}
        >
          <HelpCircle size={18} className="text-slate-400" />
          Suporte
        </button>
      </nav>

      {/* Institutional Footer */}
      <div className="p-4 bg-slate-50 border-t border-slate-100">
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-lg bg-white border border-slate-200 flex items-center justify-center">
             <img src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQua66hW5lOO75LXVLwiJWQJKtgoRJzX58EUSAAc2QdYQ&s=10" alt="Gov" className="h-5 w-5" />
          </div>
          <div className="text-[10px] leading-tight font-bold text-slate-400 uppercase tracking-wider">
            República de <br/> Moçambique
          </div>
        </div>
      </div>
    </div>
  );
};
