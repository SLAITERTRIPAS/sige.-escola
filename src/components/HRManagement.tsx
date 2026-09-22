import React, { useState } from 'react';
import { useStore } from '../store';
import { Card, Button, Input } from './ui';
import { 
  Users, Plus, Search, Calendar, Award, BookOpen, CheckCircle, 
  XCircle, Clock, FileText, Download, Briefcase, UserCheck, ShieldCheck, 
  ChevronRight, Filter, AlertCircle, TrendingUp, MapPin
} from 'lucide-react';
import { HRContract, HRLeave, HRPromotion, HRTraining, Employee } from '../types';

export function HRManagement() {
  const { 
    employees, 
    hrContracts, 
    hrLeaves, 
    hrPromotions, 
    hrTrainings, 
    addHRLeave, 
    approveHRLeave, 
    addHRContract, 
    addHRPromotion, 
    addHRTraining, 
    currentUser 
  } = useStore();

  const [activeTab, setActiveTab] = useState<'employees' | 'contracts' | 'leaves' | 'promotions' | 'trainings'>('employees');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDept, setSelectedDept] = useState<string>('all');
  
  // New Leave Modal state
  const [showLeaveModal, setShowLeaveModal] = useState(false);
  const [leaveForm, setLeaveForm] = useState({
    employeeId: '',
    type: 'Férias Anuais' as HRLeave['type'],
    startDate: '',
    endDate: '',
    reason: ''
  });

  // New Promotion Modal
  const [showPromotionModal, setShowPromotionModal] = useState(false);
  const [promotionForm, setPromotionForm] = useState({
    employeeId: '',
    previousCategory: '',
    newCategory: '',
    effectiveDate: new Date().toISOString().split('T')[0],
    dispatchNumber: ''
  });

  // New Training Modal
  const [showTrainingModal, setShowTrainingModal] = useState(false);
  const [trainingForm, setTrainingForm] = useState({
    title: '',
    entity: 'MINEDH / Instituto de Formação',
    startDate: '',
    endDate: '',
    hours: 40,
    selectedEmployees: [] as string[]
  });

  const filteredEmployees = employees.filter(emp => {
    const matchesSearch = emp.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          emp.nuit?.includes(searchTerm) || 
                          emp.career?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDept = selectedDept === 'all' || emp.department === selectedDept;
    return matchesSearch && matchesDept;
  });

  const handleCreateLeave = (e: React.FormEvent) => {
    e.preventDefault();
    const emp = employees.find(e => e.id === leaveForm.employeeId);
    if (!emp || !leaveForm.startDate || !leaveForm.endDate) return;

    // Calculate days
    const start = new Date(leaveForm.startDate);
    const end = new Date(leaveForm.endDate);
    const days = Math.max(1, Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)));

    addHRLeave({
      employeeId: emp.id,
      employeeName: emp.name,
      type: leaveForm.type,
      startDate: leaveForm.startDate,
      endDate: leaveForm.endDate,
      daysCount: days,
      reason: leaveForm.reason
    });

    setShowLeaveModal(false);
    setLeaveForm({ employeeId: '', type: 'Férias Anuais', startDate: '', endDate: '', reason: '' });
  };

  const handleCreatePromotion = (e: React.FormEvent) => {
    e.preventDefault();
    const emp = employees.find(e => e.id === promotionForm.employeeId);
    if (!emp || !promotionForm.newCategory) return;

    addHRPromotion({
      employeeId: emp.id,
      employeeName: emp.name,
      previousCategory: promotionForm.previousCategory || emp.category || 'Assistente',
      newCategory: promotionForm.newCategory,
      effectiveDate: promotionForm.effectiveDate,
      dispatchNumber: promotionForm.dispatchNumber || `DESP-DRE-${Math.floor(1000 + Math.random() * 9000)}/2026`
    });

    setShowPromotionModal(false);
    setPromotionForm({ employeeId: '', previousCategory: '', newCategory: '', effectiveDate: new Date().toISOString().split('T')[0], dispatchNumber: '' });
  };

  const handleCreateTraining = (e: React.FormEvent) => {
    e.preventDefault();
    if (!trainingForm.title || !trainingForm.startDate) return;

    addHRTraining({
      title: trainingForm.title,
      entity: trainingForm.entity,
      startDate: trainingForm.startDate,
      endDate: trainingForm.endDate || trainingForm.startDate,
      hours: Number(trainingForm.hours),
      participantIds: trainingForm.selectedEmployees.length > 0 ? trainingForm.selectedEmployees : employees.slice(0, 3).map(e => e.id),
      status: 'Agendada'
    });

    setShowTrainingModal(false);
    setTrainingForm({ title: '', entity: 'MINEDH / Instituto de Formação', startDate: '', endDate: '', hours: 40, selectedEmployees: [] });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-teal-900 via-slate-800 to-indigo-900 text-white p-6 rounded-2xl shadow-md">
        <div>
          <div className="flex items-center gap-2 mb-1 text-teal-300 text-xs font-bold uppercase tracking-wider">
            <Users className="w-4 h-4" />
            <span>EduGestão • Recursos Humanos & Administração de Pessoal</span>
          </div>
          <h1 className="text-2xl font-bold">Gestão Integrada de Recursos Humanos</h1>
          <p className="text-teal-100/80 text-sm mt-1">
            Controlo de pessoal, quadros de pessoal, licenças, contratos, progressões de carreira e capacitação docente.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <Button 
            onClick={() => setShowLeaveModal(true)}
            className="bg-teal-500 hover:bg-teal-600 text-slate-900 font-bold text-sm shadow-sm flex items-center gap-2"
          >
            <Calendar className="w-4 h-4" />
            <span>Registar Licença / Férias</span>
          </Button>
          <Button 
            onClick={() => setShowPromotionModal(true)}
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm shadow-sm flex items-center gap-2"
          >
            <TrendingUp className="w-4 h-4" />
            <span>Registar Promoção</span>
          </Button>
        </div>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="p-4 bg-white border border-slate-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-slate-500">Total de Funcionários</p>
              <p className="text-2xl font-bold text-slate-800">{employees.length}</p>
            </div>
            <div className="p-3 bg-teal-50 rounded-xl text-teal-600">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <p className="text-xs text-slate-500 mt-2">Corpo Docente & Corpo Técnico</p>
        </Card>

        <Card className="p-4 bg-white border border-slate-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-slate-500">Quadro de Nomeação</p>
              <p className="text-2xl font-bold text-indigo-700">
                {employees.filter(e => e.isEffective === 'Sim' || e.contractType === 'Nomeação Definitiva').length}
              </p>
            </div>
            <div className="p-3 bg-indigo-50 rounded-xl text-indigo-600">
              <ShieldCheck className="w-5 h-5" />
            </div>
          </div>
          <p className="text-xs text-indigo-600 mt-2 font-medium">Efectivos no Sistema</p>
        </Card>

        <Card className="p-4 bg-white border border-slate-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-slate-500">Licenças & Férias Activas</p>
              <p className="text-2xl font-bold text-amber-600">
                {hrLeaves.filter(l => l.status === 'Aprovado' || l.status === 'Pendente').length}
              </p>
            </div>
            <div className="p-3 bg-amber-50 rounded-xl text-amber-600">
              <Clock className="w-5 h-5" />
            </div>
          </div>
          <p className="text-xs text-amber-600 mt-2 font-medium">
            {hrLeaves.filter(l => l.status === 'Pendente').length} pedidos pendentes
          </p>
        </Card>

        <Card className="p-4 bg-white border border-slate-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-slate-500">Ações de Formação</p>
              <p className="text-2xl font-bold text-emerald-700">{hrTrainings.length}</p>
            </div>
            <div className="p-3 bg-emerald-50 rounded-xl text-emerald-600">
              <Award className="w-5 h-5" />
            </div>
          </div>
          <p className="text-xs text-emerald-600 mt-2 font-medium">Capacitação Contínua</p>
        </Card>
      </div>

      {/* Tabs */}
      <div className="border-b border-slate-200 flex gap-2">
        <button
          onClick={() => setActiveTab('employees')}
          className={`px-4 py-2.5 font-bold text-sm border-b-2 flex items-center gap-2 transition-all ${
            activeTab === 'employees' 
              ? 'border-teal-600 text-teal-700 bg-teal-50/50 rounded-t-lg' 
              : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Fichas de Funcionários ({employees.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('contracts')}
          className={`px-4 py-2.5 font-bold text-sm border-b-2 flex items-center gap-2 transition-all ${
            activeTab === 'contracts' 
              ? 'border-teal-600 text-teal-700 bg-teal-50/50 rounded-t-lg' 
              : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
        >
          <Briefcase className="w-4 h-4" />
          <span>Contratos & Nomeações ({hrContracts.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('leaves')}
          className={`px-4 py-2.5 font-bold text-sm border-b-2 flex items-center gap-2 transition-all ${
            activeTab === 'leaves' 
              ? 'border-teal-600 text-teal-700 bg-teal-50/50 rounded-t-lg' 
              : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
        >
          <Calendar className="w-4 h-4" />
          <span>Férias & Licenças ({hrLeaves.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('promotions')}
          className={`px-4 py-2.5 font-bold text-sm border-b-2 flex items-center gap-2 transition-all ${
            activeTab === 'promotions' 
              ? 'border-teal-600 text-teal-700 bg-teal-50/50 rounded-t-lg' 
              : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
        >
          <TrendingUp className="w-4 h-4" />
          <span>Promoções & Carreiras ({hrPromotions.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('trainings')}
          className={`px-4 py-2.5 font-bold text-sm border-b-2 flex items-center gap-2 transition-all ${
            activeTab === 'trainings' 
              ? 'border-teal-600 text-teal-700 bg-teal-50/50 rounded-t-lg' 
              : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
        >
          <Award className="w-4 h-4" />
          <span>Formações & Capacitação ({hrTrainings.length})</span>
        </button>
      </div>

      {/* Tab 1: Employees List */}
      {activeTab === 'employees' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
            <div className="relative flex-1 w-full">
              <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
              <input
                type="text"
                placeholder="Pesquisar por nome, NUIT ou cargo..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <Filter className="w-4 h-4 text-slate-500" />
              <select
                value={selectedDept}
                onChange={(e) => setSelectedDept(e.target.value)}
                className="px-3 py-2 text-sm border border-slate-300 rounded-lg bg-white"
              >
                <option value="all">Todos os Departamentos</option>
                <option value="Direcção da Escola">Direcção da Escola</option>
                <option value="Pedagógico">Pedagógico</option>
                <option value="Secretaria">Secretaria Geral</option>
                <option value="Recursos Humanos">Recursos Humanos</option>
                <option value="Património e Logística">Património</option>
                <option value="Tesouraria e Finanças">Tesouraria / Finanças</option>
                <option value="Biblioteca Escolar">Biblioteca</option>
              </select>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 text-slate-700 font-semibold border-b border-slate-200">
                  <tr>
                    <th className="px-4 py-3">Funcionário</th>
                    <th className="px-4 py-3">Função / Cargo</th>
                    <th className="px-4 py-3">Departamento</th>
                    <th className="px-4 py-3">Vínculo</th>
                    <th className="px-4 py-3">Contactos</th>
                    <th className="px-4 py-3 text-right">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredEmployees.map((emp) => (
                    <tr key={emp.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="px-4 py-3">
                        <div className="font-bold text-slate-800">{emp.name}</div>
                        <div className="text-xs text-slate-500">NUIT: {emp.nuit || 'N/D'} • BI: {emp.idCardNumber || 'N/D'}</div>
                      </td>
                      <td className="px-4 py-3">
                        <span className="font-medium text-slate-700">{emp.roleFunction || emp.career}</span>
                        <div className="text-xs text-teal-700 font-semibold">{emp.academicLevel || 'Licenciatura'}</div>
                      </td>
                      <td className="px-4 py-3">
                        <span className="inline-flex px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-800">
                          {emp.department || 'Geral'}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                          emp.contractType === 'Nomeação Definitiva' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-amber-50 text-amber-700 border border-amber-200'
                        }`}>
                          <UserCheck className="w-3 h-3" />
                          {emp.contractType || 'Quadro Efectivo'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-xs text-slate-600">
                        <div>{emp.email}</div>
                        <div>{emp.phone || emp.cell}</div>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setLeaveForm(prev => ({ ...prev, employeeId: emp.id }));
                            setShowLeaveModal(true);
                          }}
                          className="text-xs font-medium"
                        >
                          Licença
                        </Button>
                      </td>
                    </tr>
                  ))}
                  {filteredEmployees.length === 0 && (
                    <tr>
                      <td colSpan={6} className="text-center py-8 text-slate-500">
                        Nenhum funcionário encontrado.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Contracts */}
      {activeTab === 'contracts' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {hrContracts.map((contract) => (
              <Card key={contract.id} className="p-5 border border-slate-200 hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="font-bold text-slate-800">{contract.employeeName}</h3>
                    <p className="text-xs text-slate-500 font-mono">Processo: {contract.id}</p>
                  </div>
                  <span className={`px-2.5 py-0.5 text-xs font-bold rounded-full ${
                    contract.contractType === 'Nomeação Definitiva' ? 'bg-emerald-100 text-emerald-800' : 'bg-blue-100 text-blue-800'
                  }`}>
                    {contract.contractType}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs text-slate-600 bg-slate-50 p-3 rounded-lg border border-slate-100 mb-3">
                  <div>
                    <span className="text-slate-400 block">Cargo / Categoria:</span>
                    <span className="font-semibold text-slate-700">{contract.position}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block">Vencimento Base:</span>
                    <span className="font-bold text-emerald-700">{contract.baseSalary.toLocaleString('pt-MZ')} MZN</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block">Início do Vínculo:</span>
                    <span className="font-semibold">{contract.startDate}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block">Término:</span>
                    <span className="font-semibold">{contract.endDate || 'Indeterminado (Vitalício)'}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs pt-2 border-t border-slate-100">
                  <span className="text-slate-500">Registo Oficial MINEDH</span>
                  <span className="text-teal-700 font-bold flex items-center gap-1">
                    <CheckCircle className="w-3.5 h-3.5" /> Aprovado pelo Tribunal Administrativo
                  </span>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Tab 3: Leaves & Vacations */}
      {activeTab === 'leaves' && (
        <div className="space-y-4">
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 text-slate-700 font-semibold border-b border-slate-200">
                  <tr>
                    <th className="px-4 py-3">Funcionário</th>
                    <th className="px-4 py-3">Tipo de Licença</th>
                    <th className="px-4 py-3">Período</th>
                    <th className="px-4 py-3">Duração</th>
                    <th className="px-4 py-3">Estado</th>
                    <th className="px-4 py-3 text-right">Ações de Aprovação</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {hrLeaves.map((leave) => (
                    <tr key={leave.id} className="hover:bg-slate-50/80">
                      <td className="px-4 py-3 font-bold text-slate-800">{leave.employeeName}</td>
                      <td className="px-4 py-3">
                        <span className="font-medium text-slate-700">{leave.type}</span>
                        {leave.reason && <div className="text-xs text-slate-500">{leave.reason}</div>}
                      </td>
                      <td className="px-4 py-3 text-xs text-slate-600">
                        {leave.startDate} até {leave.endDate}
                      </td>
                      <td className="px-4 py-3 text-xs font-bold text-slate-700">
                        {leave.daysCount} dias
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-bold ${
                          leave.status === 'Aprovado' ? 'bg-emerald-100 text-emerald-800' :
                          leave.status === 'Rejeitado' ? 'bg-rose-100 text-rose-800' : 'bg-amber-100 text-amber-800'
                        }`}>
                          {leave.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right space-x-1">
                        {leave.status === 'Pendente' && (
                          <>
                            <Button 
                              size="sm" 
                              onClick={() => approveHRLeave(leave.id, true, currentUser?.name || 'Chefe de RH')}
                              className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs px-2.5 py-1"
                            >
                              Aprovar
                            </Button>
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => approveHRLeave(leave.id, false, currentUser?.name || 'Chefe de RH')}
                              className="text-rose-600 border-rose-300 text-xs px-2.5 py-1"
                            >
                              Rejeitar
                            </Button>
                          </>
                        )}
                        {leave.status !== 'Pendente' && (
                          <span className="text-xs text-slate-400">Despachado por {leave.approvedBy || 'Direcção'}</span>
                        )}
                      </td>
                    </tr>
                  ))}
                  {hrLeaves.length === 0 && (
                    <tr>
                      <td colSpan={6} className="text-center py-8 text-slate-500">
                        Nenhuma licença registada no momento.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Tab 4: Promotions */}
      {activeTab === 'promotions' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {hrPromotions.map((prm) => (
              <Card key={prm.id} className="p-5 border border-slate-200">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="font-bold text-slate-800">{prm.employeeName}</h3>
                    <p className="text-xs text-indigo-700 font-semibold">{prm.dispatchNumber}</p>
                  </div>
                  <span className="bg-indigo-50 text-indigo-700 px-2 py-1 rounded text-xs font-bold border border-indigo-200">
                    {prm.effectiveDate}
                  </span>
                </div>
                <div className="flex items-center gap-3 bg-slate-50 p-3 rounded-lg text-xs">
                  <div className="flex-1">
                    <span className="text-slate-400 block">De:</span>
                    <span className="font-semibold text-slate-700">{prm.previousCategory}</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-400" />
                  <div className="flex-1">
                    <span className="text-slate-400 block">Para:</span>
                    <span className="font-bold text-emerald-700">{prm.newCategory}</span>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Tab 5: Trainings */}
      {activeTab === 'trainings' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="font-bold text-slate-800 text-lg">Plano Anual de Formação e Capacitação</h3>
            <Button 
              onClick={() => setShowTrainingModal(true)}
              className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" /> Nova Formação
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {hrTrainings.map((trn) => (
              <Card key={trn.id} className="p-5 border border-slate-200">
                <div className="flex justify-between items-start mb-2">
                  <h4 className="font-bold text-slate-800">{trn.title}</h4>
                  <span className="px-2 py-0.5 rounded text-xs font-bold bg-teal-100 text-teal-800">
                    {trn.status}
                  </span>
                </div>
                <p className="text-xs text-slate-500 mb-3">Entidade Promotora: {trn.entity}</p>
                <div className="flex justify-between items-center text-xs text-slate-600 bg-slate-50 p-2.5 rounded border border-slate-100">
                  <span>Duração: <strong>{trn.hours} horas</strong></span>
                  <span>Período: <strong>{trn.startDate} a {trn.endDate}</strong></span>
                  <span>Participantes: <strong>{trn.participantIds.length} inscritos</strong></span>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Leave Modal */}
      {showLeaveModal && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <div className="flex justify-between items-center border-b pb-3">
              <h3 className="font-bold text-slate-900 text-lg">Registar Licença ou Férias</h3>
              <button onClick={() => setShowLeaveModal(false)} className="text-slate-400 hover:text-slate-600">✕</button>
            </div>
            <form onSubmit={handleCreateLeave} className="space-y-3">
              <div>
                <label className="text-xs font-bold text-slate-700">Funcionário</label>
                <select
                  required
                  value={leaveForm.employeeId}
                  onChange={(e) => setLeaveForm(prev => ({ ...prev, employeeId: e.target.value }))}
                  className="w-full mt-1 px-3 py-2 border rounded-lg text-sm bg-white"
                >
                  <option value="">Selecione o funcionário...</option>
                  {employees.map(emp => (
                    <option key={emp.id} value={emp.id}>{emp.name} ({emp.department || 'Geral'})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700">Tipo de Licença</label>
                <select
                  value={leaveForm.type}
                  onChange={(e) => setLeaveForm(prev => ({ ...prev, type: e.target.value as any }))}
                  className="w-full mt-1 px-3 py-2 border rounded-lg text-sm bg-white"
                >
                  <option value="Férias Anuais">Férias Anuais Regulamentares (30 dias)</option>
                  <option value="Licença de Doença">Licença de Doença com Atestado</option>
                  <option value="Licença de Maternidade/Paternidade">Licença de Maternidade/Paternidade</option>
                  <option value="Licença de Casamento">Licença de Casamento</option>
                  <option value="Licença de Luto">Licença de Luto</option>
                  <option value="Licença para Estudos">Licença de Formação / Estudos</option>
                  <option value="Licença Sem Vencimento">Licença Sem Vencimento</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700">Data de Início</label>
                  <input
                    type="date"
                    required
                    value={leaveForm.startDate}
                    onChange={(e) => setLeaveForm(prev => ({ ...prev, startDate: e.target.value }))}
                    className="w-full mt-1 px-3 py-2 border rounded-lg text-sm"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700">Data de Término</label>
                  <input
                    type="date"
                    required
                    value={leaveForm.endDate}
                    onChange={(e) => setLeaveForm(prev => ({ ...prev, endDate: e.target.value }))}
                    className="w-full mt-1 px-3 py-2 border rounded-lg text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700">Motivo / Observações</label>
                <textarea
                  rows={2}
                  value={leaveForm.reason}
                  onChange={(e) => setLeaveForm(prev => ({ ...prev, reason: e.target.value }))}
                  placeholder="Ex: Férias do ano lectivo 2026 conforme plano aprovado..."
                  className="w-full mt-1 px-3 py-2 border rounded-lg text-sm"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t">
                <Button type="button" variant="outline" onClick={() => setShowLeaveModal(false)}>Cancelar</Button>
                <Button type="submit" className="bg-teal-600 hover:bg-teal-700 text-white font-bold">Submeter Licença</Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Promotion Modal */}
      {showPromotionModal && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <div className="flex justify-between items-center border-b pb-3">
              <h3 className="font-bold text-slate-900 text-lg">Registar Promoção / Progressão</h3>
              <button onClick={() => setShowPromotionModal(false)} className="text-slate-400 hover:text-slate-600">✕</button>
            </div>
            <form onSubmit={handleCreatePromotion} className="space-y-3">
              <div>
                <label className="text-xs font-bold text-slate-700">Funcionário</label>
                <select
                  required
                  value={promotionForm.employeeId}
                  onChange={(e) => {
                    const emp = employees.find(x => x.id === e.target.value);
                    setPromotionForm(prev => ({
                      ...prev,
                      employeeId: e.target.value,
                      previousCategory: emp?.category || emp?.career || ''
                    }));
                  }}
                  className="w-full mt-1 px-3 py-2 border rounded-lg text-sm bg-white"
                >
                  <option value="">Selecione o funcionário...</option>
                  {employees.map(emp => (
                    <option key={emp.id} value={emp.id}>{emp.name} ({emp.category || emp.career})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700">Nova Categoria / Escalão</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Docente N1 - Escalão B"
                  value={promotionForm.newCategory}
                  onChange={(e) => setPromotionForm(prev => ({ ...prev, newCategory: e.target.value }))}
                  className="w-full mt-1 px-3 py-2 border rounded-lg text-sm"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700">Nº de Despacho / Visto do Tribunal</label>
                <input
                  type="text"
                  placeholder="Ex: DESP-MINEDH-2026/094"
                  value={promotionForm.dispatchNumber}
                  onChange={(e) => setPromotionForm(prev => ({ ...prev, dispatchNumber: e.target.value }))}
                  className="w-full mt-1 px-3 py-2 border rounded-lg text-sm"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700">Data de Efeitos</label>
                <input
                  type="date"
                  required
                  value={promotionForm.effectiveDate}
                  onChange={(e) => setPromotionForm(prev => ({ ...prev, effectiveDate: e.target.value }))}
                  className="w-full mt-1 px-3 py-2 border rounded-lg text-sm"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t">
                <Button type="button" variant="outline" onClick={() => setShowPromotionModal(false)}>Cancelar</Button>
                <Button type="submit" className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold">Registar Promoção</Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Training Modal */}
      {showTrainingModal && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <div className="flex justify-between items-center border-b pb-3">
              <h3 className="font-bold text-slate-900 text-lg">Agendar Ação de Formação</h3>
              <button onClick={() => setShowTrainingModal(false)} className="text-slate-400 hover:text-slate-600">✕</button>
            </div>
            <form onSubmit={handleCreateTraining} className="space-y-3">
              <div>
                <label className="text-xs font-bold text-slate-700">Título da Formação</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Metodologias Activas e Novo Currículo Escolar"
                  value={trainingForm.title}
                  onChange={(e) => setTrainingForm(prev => ({ ...prev, title: e.target.value }))}
                  className="w-full mt-1 px-3 py-2 border rounded-lg text-sm"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700">Entidade Promotora</label>
                <input
                  type="text"
                  required
                  value={trainingForm.entity}
                  onChange={(e) => setTrainingForm(prev => ({ ...prev, entity: e.target.value }))}
                  className="w-full mt-1 px-3 py-2 border rounded-lg text-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700">Data de Início</label>
                  <input
                    type="date"
                    required
                    value={trainingForm.startDate}
                    onChange={(e) => setTrainingForm(prev => ({ ...prev, startDate: e.target.value }))}
                    className="w-full mt-1 px-3 py-2 border rounded-lg text-sm"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700">Horas Lectivas</label>
                  <input
                    type="number"
                    value={trainingForm.hours}
                    onChange={(e) => setTrainingForm(prev => ({ ...prev, hours: Number(e.target.value) }))}
                    className="w-full mt-1 px-3 py-2 border rounded-lg text-sm"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t">
                <Button type="button" variant="outline" onClick={() => setShowTrainingModal(false)}>Cancelar</Button>
                <Button type="submit" className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold">Agendar Formação</Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
