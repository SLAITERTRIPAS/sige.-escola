import React, { useState } from 'react';
import { 
  Users, School as SchoolIcon, Map, Globe, Calendar, MessageSquare, 
  TrendingUp, BarChart3, PieChart, ChevronRight, LayoutDashboard,
  Filter, Search, ArrowUpRight, ArrowDownRight, Clock, ShieldCheck
} from 'lucide-react';
import { useStore } from '../store';
import { Role } from '../types';
import { CalendarScheduler } from './CalendarScheduler';
import { GovernanceChat } from './GovernanceChat';
import { motion } from 'motion/react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  LineChart, Line, AreaChart, Area, Cell, PieChart as RePieChart, Pie
} from 'recharts';

export const GovernanceDashboard: React.FC = () => {
  const { currentUser, schools, districts, provinces, students } = useStore();
  const [activeTab, setActiveTab] = useState<'overview' | 'scheduler' | 'chat'>('overview');

  if (!currentUser) return null;

  // Filter entities based on role hierarchy
  const visibleProvinces = provinces;
  const visibleDistricts = districts.filter(d => 
    currentUser.role === 'national' || (currentUser.role === 'provincial' && d.provinceId === currentUser.provinceId)
  );
  const visibleSchools = schools.filter(s => {
    if (currentUser.role === 'national') return true;
    if (currentUser.role === 'provincial') {
      const pDistricts = districts.filter(d => d.provinceId === currentUser.provinceId).map(d => d.id);
      return s.districtId && pDistricts.includes(s.districtId);
    }
    if (currentUser.role === 'district') return s.districtId === currentUser.districtId;
    return false;
  });

  const totalStudents = students.filter(st => visibleSchools.some(s => s.id === st.schoolId)).length;

  const mockLevelData = [
    { name: 'Nampula', value: 450, color: '#3b82f6' },
    { name: 'Zambézia', value: 380, color: '#10b981' },
    { name: 'Tete', value: 320, color: '#f59e0b' },
    { name: 'Maputo', value: 310, color: '#6366f1' },
    { name: 'Gaza', value: 280, color: '#ec4899' },
  ];

  return (
    <div className="space-y-8 p-1">
      {/* Header section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-blue-600 mb-1">
            <LayoutDashboard className="w-4 h-4" />
            <span className="text-[10px] font-bold uppercase tracking-[0.2em]">Gestão Estatística Central</span>
          </div>
          <h1 className="text-3xl font-black text-slate-800 tracking-tight">
            Dashboard {currentUser.role === 'national' ? 'Nacional' : currentUser.role === 'provincial' ? 'Provincial' : 'Distrital'}
          </h1>
          <div className="flex items-center gap-2 mt-1">
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
            <p className="text-slate-500 text-sm">
              {currentUser.role === 'national' && 'Competência: Definição de Políticas, Calendário Nacional e Monitoria Geral.'}
              {currentUser.role === 'provincial' && 'Competência: Supervisão Pedagógica, Gestão de Recursos e Apoio Distrital.'}
              {currentUser.role === 'district' && 'Competência: Fiscalização das Escolas, Validação de Dados e Apoio Direto.'}
            </p>
          </div>
        </div>

        <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200">
          <button 
            onClick={() => setActiveTab('overview')}
            className={`px-4 py-2 rounded-lg text-sm font-bold transition-all flex items-center gap-2 ${
              activeTab === 'overview' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            <BarChart3 className="w-4 h-4" />
            Visão Geral
          </button>
          <button 
            onClick={() => setActiveTab('scheduler')}
            className={`px-4 py-2 rounded-lg text-sm font-bold transition-all flex items-center gap-2 ${
              activeTab === 'scheduler' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            <Calendar className="w-4 h-4" />
            Agendamento
          </button>
          <button 
            onClick={() => setActiveTab('chat')}
            className={`px-4 py-2 rounded-lg text-sm font-bold transition-all flex items-center gap-2 ${
              activeTab === 'chat' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            <MessageSquare className="w-4 h-4" />
            Comunicação
          </button>
        </div>
      </div>

      {activeTab === 'overview' && (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard 
              label="Total Escolas" 
              value={visibleSchools.length} 
              icon={<SchoolIcon className="w-6 h-6" />} 
              color="blue"
              trend="+3 novas esta semana"
            />
            <StatCard 
              label="Efetivo Escolar" 
              value={totalStudents.toLocaleString()} 
              icon={<Users className="w-6 h-6" />} 
              color="emerald"
              trend="+12% vs ano anterior"
            />
            <StatCard 
              label={currentUser.role === 'national' ? "Províncias" : "Distritos"} 
              value={currentUser.role === 'national' ? visibleProvinces.length : visibleDistricts.length} 
              icon={<Map className="w-6 h-6" />} 
              color="indigo"
            />
            <StatCard 
              label="Recolhas Ativas" 
              value="2" 
              icon={<Clock className="w-6 h-6" />} 
              color="amber"
              trend="Faltam 5 dias para o fim"
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Chart */}
            <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h3 className="font-bold text-slate-800">Aproveitamento Escolar por Nível</h3>
                  <p className="text-xs text-slate-500">Comparativo estatístico do semestre atual</p>
                </div>
                <div className="flex gap-2">
                  <div className="flex items-center gap-2 px-3 py-1 bg-slate-50 rounded-lg border border-slate-200">
                    <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                    <span className="text-[10px] font-bold text-slate-600 uppercase">Aprovados</span>
                  </div>
                </div>
              </div>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={mockLevelData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis 
                      dataKey="name" 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fill: '#64748b', fontSize: 11, fontWeight: 600 }}
                      dy={10}
                    />
                    <YAxis 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fill: '#64748b', fontSize: 11 }}
                    />
                    <Tooltip 
                      cursor={{ fill: '#f8fafc' }}
                      contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                    />
                    <Bar dataKey="value" radius={[6, 6, 0, 0]} barSize={40}>
                      {mockLevelData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} fillOpacity={0.8} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* List of entities */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-bold text-slate-800">Subdivisões Ativas</h3>
                <button className="text-blue-600 text-[10px] font-bold uppercase hover:underline">Ver Todos</button>
              </div>
              <div className="space-y-4">
                {(currentUser.role === 'national' ? visibleProvinces : visibleDistricts).slice(0, 6).map((item, idx) => (
                  <div key={item.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer group">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-slate-400 group-hover:text-blue-600 transition-colors">
                        <Map className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-slate-700">{item.name}</p>
                        <p className="text-[10px] text-slate-500 uppercase tracking-wider">
                          {currentUser.role === 'national' ? 'Província' : 'Distrito'}
                        </p>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-blue-600 group-hover:translate-x-1 transition-all" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'scheduler' && (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
          <CalendarScheduler />
        </div>
      )}

      {activeTab === 'chat' && (
        <div className="max-w-4xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
          <GovernanceChat />
        </div>
      )}
    </div>
  );
};

interface StatCardProps {
  label: string;
  value: string | number;
  icon: React.ReactNode;
  color: 'blue' | 'emerald' | 'indigo' | 'amber';
  trend?: string;
}

const StatCard: React.FC<StatCardProps> = ({ label, value, icon, color, trend }) => {
  const colorMap = {
    blue: 'bg-blue-50 text-blue-600 border-blue-100',
    emerald: 'bg-emerald-50 text-emerald-600 border-emerald-100',
    indigo: 'bg-indigo-50 text-indigo-600 border-indigo-100',
    amber: 'bg-amber-50 text-amber-600 border-amber-100'
  };

  return (
    <motion.div 
      whileHover={{ y: -4 }}
      className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm"
    >
      <div className="flex justify-between items-start mb-4">
        <div className={`p-3 rounded-xl border ${colorMap[color]}`}>
          {icon}
        </div>
        {trend && (
          <div className="flex items-center gap-1 text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full">
            <TrendingUp className="w-3 h-3" />
            {trend}
          </div>
        )}
      </div>
      <h4 className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-1">{label}</h4>
      <p className="text-3xl font-black text-slate-800 tracking-tight">{value}</p>
    </motion.div>
  );
};
