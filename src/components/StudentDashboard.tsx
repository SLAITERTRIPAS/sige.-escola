import React, { useState } from 'react';
import { useStore } from '../store';
import { Card } from './ui';
import { 
  GraduationCap, BookOpen, MessageSquare, ArrowRightLeft, 
  Search, MapPin, School, CheckCircle, AlertCircle, FileText,
  Upload, Send, Info, ShieldCheck
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { CollapsibleSidebar } from './CollapsibleSidebar';
import { SidebarMenu } from './SidebarMenu';

export const StudentDashboard: React.FC = () => {
  const { currentUser, students, schools, districts, provinces, grades, subjects, submitTransferRequest, submitComplaint, updateSchoolChoice } = useStore();
  const [activeTab, setActiveTab] = useState<'grades' | 'cycle' | 'transfer' | 'complaint'>('grades');
  
  if (!currentUser || !currentUser.studentId) return null;
  
  const student = students.find(s => s.id === currentUser.studentId);
  if (!student) return null;

  // Check if student is at the end of a cycle (e.g., 7th, 10th, 12th)
  const isEndOfCycle = ['7.ª Classe', '10.ª Classe', '12.ª Classe'].includes(student.gradeLevel);

  return (
    <CollapsibleSidebar
      sidebarContent={<SidebarMenu activeTab={activeTab} setActiveTab={setActiveTab} />}
    >
      <div className="p-8 space-y-8 max-w-6xl mx-auto pb-20">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div>
            <div className="flex items-center gap-2 text-blue-600 mb-1">
              <GraduationCap className="w-5 h-5" />
              <span className="text-xs font-bold uppercase tracking-widest">Painel do Aluno</span>
            </div>
            <h1 className="text-3xl font-black text-slate-800 tracking-tight">
              Olá, {student.name}!
            </h1>
            <div className="flex items-center gap-2 mt-1">
              <ShieldCheck className="w-4 h-4 text-emerald-500" />
              <p className="text-slate-500 text-sm">
                Competência: Acesso a Resultados, Gestão de Vagas e Processos de Transferência.
              </p>
            </div>
          </div>
        </div>

        <AnimatePresence mode="wait">
          {activeTab === 'grades' && (
            <motion.div key="grades" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <GradesView studentId={student.id} />
            </motion.div>
          )}
          {activeTab === 'cycle' && (
            <motion.div key="cycle" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <CycleSelectionView student={student} />
            </motion.div>
          )}
          {activeTab === 'transfer' && (
            <motion.div key="transfer" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <TransferView student={student} />
            </motion.div>
          )}
          {activeTab === 'complaint' && (
            <motion.div key="complaint" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <ComplaintView student={student} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </CollapsibleSidebar>
  );
};

const TabButton = ({ active, onClick, icon, label }: any) => (
  <button 
    onClick={onClick}
    className={`px-4 py-2 rounded-lg text-sm font-bold transition-all flex items-center gap-2 ${
      active ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'
    }`}
  >
    {icon}
    {label}
  </button>
);

const GradesView = ({ studentId }: { studentId: string }) => {
  const { grades, subjects } = useStore();
  const studentGrades = grades.filter(g => g.studentId === studentId);

  const trimesters = [1, 2, 3];

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {trimesters.map(t => (
          <Card key={t} className="p-6 bg-white border border-slate-200 shadow-sm rounded-xl">
            <h3 className="font-bold text-slate-800 mb-4 flex items-center justify-between">
              {t}º Trimestre
              <span className="text-[10px] px-2 py-0.5 bg-blue-50 text-blue-600 rounded-full">2026</span>
            </h3>
            <div className="space-y-3">
              {subjects.map(sub => {
                const grade = studentGrades.find(g => g.subjectId === sub.id && g.trimester === t);
                return (
                  <div key={sub.id} className="flex justify-between items-center text-sm">
                    <span className="text-slate-500">{sub.name}</span>
                    <span className={`font-mono font-bold ${grade && grade.value >= 10 ? 'text-emerald-600' : 'text-red-500'}`}>
                      {grade ? grade.value.toFixed(1) : '-'}
                    </span>
                  </div>
                );
              })}
            </div>
          </Card>
        ))}
      </div>
      <div className="bg-blue-50 border border-blue-100 p-4 rounded-xl flex items-start gap-3">
        <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
        <p className="text-xs text-blue-800 leading-relaxed">
          Estes resultados são provisórios. Para obter o certificado oficial de aproveitamento, por favor solicite uma Declaração com Notas na Secretaria Geral.
        </p>
      </div>
    </motion.div>
  );
};

const CycleSelectionView = ({ student }: { student: any }) => {
  const { provinces, districts, schools, updateSchoolChoice } = useStore();
  const [selectedProvince, setSelectedProvince] = useState('');
  const [selectedDistrict, setSelectedDistrict] = useState('');
  const [selectedSchool, setSelectedSchool] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const filteredDistricts = districts.filter(d => d.provinceId === selectedProvince);
  const filteredSchools = schools.filter(s => s.districtId === selectedDistrict);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateSchoolChoice(student.id, selectedSchool);
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <Card className="p-12 text-center border-emerald-200 bg-emerald-50 max-w-2xl mx-auto">
        <CheckCircle className="w-16 h-16 text-emerald-500 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-emerald-900">Escolha Confirmada!</h2>
        <p className="text-emerald-700 mt-2">
          A vaga para a nova escola foi reservada com sucesso. Receberá uma notificação quando o processo de matrícula for concluído.
        </p>
      </Card>
    );
  }

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="max-w-2xl mx-auto">
      <Card className="p-8 bg-white border border-slate-200 shadow-lg rounded-2xl">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl">
            <ArrowRightLeft className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-800">Transição de Ciclo</h2>
            <p className="text-sm text-slate-500">Escolha a escola para o próximo nível de ensino</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-2">1. Escolha a Província</label>
              <select 
                required
                value={selectedProvince}
                onChange={e => { setSelectedProvince(e.target.value); setSelectedDistrict(''); setSelectedSchool(''); }}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
              >
                <option value="">Selecione uma província...</option>
                {provinces.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-2">2. Escolha o Distrito</label>
              <select 
                required
                disabled={!selectedProvince}
                value={selectedDistrict}
                onChange={e => { setSelectedDistrict(e.target.value); setSelectedSchool(''); }}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all disabled:opacity-50"
              >
                <option value="">Selecione um distrito...</option>
                {filteredDistricts.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-2">3. Escolha a Escola (Disponíveis)</label>
              <select 
                required
                disabled={!selectedDistrict}
                value={selectedSchool}
                onChange={e => setSelectedSchool(e.target.value)}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all disabled:opacity-50"
              >
                <option value="">Selecione uma escola...</option>
                {filteredSchools.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </div>
          </div>

          <button 
            type="submit"
            className="w-full py-4 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-200"
          >
            Confirmar Escolha de Vaga
          </button>
        </form>
      </Card>
    </motion.div>
  );
};

const TransferView = ({ student }: { student: any }) => {
  const { provinces, districts, schools, submitTransferRequest } = useStore();
  const [formData, setFormData] = useState({
    provinceId: '',
    districtId: '',
    schoolId: '',
    reason: '',
    proof: null as File | null
  });
  const [submitted, setSubmitted] = useState(false);

  const filteredDistricts = districts.filter(d => d.provinceId === formData.provinceId);
  const filteredSchools = schools.filter(s => s.districtId === formData.districtId);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    submitTransferRequest({
      studentId: student.id,
      currentSchoolId: student.schoolId,
      targetSchoolId: formData.schoolId,
      targetDistrictId: formData.districtId,
      targetProvinceId: formData.provinceId,
      reason: formData.reason,
      proofOfPaymentUrl: 'dummy_url_proof.pdf'
    });
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <Card className="p-12 text-center border-amber-200 bg-amber-50 max-w-2xl mx-auto">
        <CheckCircle className="w-16 h-16 text-amber-500 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-amber-900">Pedido de Transferência Submetido!</h2>
        <p className="text-amber-700 mt-2">
          O seu pedido está em análise. A Secretaria Geral irá validar o comprovativo de pagamento e o motivo da transferência.
        </p>
      </Card>
    );
  }

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="max-w-2xl mx-auto">
      <Card className="p-8 bg-white border border-slate-200 shadow-lg rounded-2xl">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 bg-amber-50 text-amber-600 rounded-xl">
            <School className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-800">Solicitar Transferência</h2>
            <p className="text-sm text-slate-500">Mudar de escola durante o ano lectivo</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Província Destino</label>
              <select 
                required
                value={formData.provinceId}
                onChange={e => setFormData(prev => ({ ...prev, provinceId: e.target.value, districtId: '', schoolId: '' }))}
                className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm"
              >
                <option value="">Selecione...</option>
                {provinces.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Distrito Destino</label>
              <select 
                required
                disabled={!formData.provinceId}
                value={formData.districtId}
                onChange={e => setFormData(prev => ({ ...prev, districtId: e.target.value, schoolId: '' }))}
                className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm"
              >
                <option value="">Selecione...</option>
                {filteredDistricts.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Escola Destino</label>
            <select 
              required
              disabled={!formData.districtId}
              value={formData.schoolId}
              onChange={e => setFormData(prev => ({ ...prev, schoolId: e.target.value }))}
              className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm"
            >
              <option value="">Selecione a escola...</option>
              {filteredSchools.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Motivo da Transferência</label>
            <textarea 
              required
              rows={3}
              value={formData.reason}
              onChange={e => setFormData(prev => ({ ...prev, reason: e.target.value }))}
              className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm resize-none"
              placeholder="Ex: Mudança de residência..."
            />
          </div>

          <div className="p-4 border-2 border-dashed border-slate-200 rounded-xl bg-slate-50 hover:bg-slate-100 transition-colors cursor-pointer group text-center">
            <Upload className="w-8 h-8 text-slate-300 mx-auto mb-2 group-hover:text-blue-500" />
            <p className="text-xs font-bold text-slate-500 mb-1">Comprovativo de Depósito (Taxas)</p>
            <p className="text-[10px] text-slate-400">PDF ou JPG (Máx 2MB)</p>
            <input type="file" className="hidden" />
          </div>

          <button 
            type="submit"
            className="w-full py-3 bg-amber-600 text-white rounded-xl font-bold hover:bg-amber-700 transition-all shadow-lg"
          >
            Submeter Pedido de Transferência
          </button>
        </form>
      </Card>
    </motion.div>
  );
};

const ComplaintView = ({ student }: { student: any }) => {
  const { subjects, submitComplaint } = useStore();
  const [formData, setFormData] = useState({
    subjectId: '',
    trimester: 1,
    description: ''
  });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    submitComplaint({
      studentId: student.id,
      subjectId: formData.subjectId,
      trimester: formData.trimester,
      description: formData.description
    });
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <Card className="p-12 text-center border-blue-200 bg-blue-50 max-w-2xl mx-auto">
        <Send className="w-16 h-16 text-blue-500 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-blue-900">Reclamação Enviada</h2>
        <p className="text-blue-700 mt-2">
          O seu pedido foi encaminhado para a Direção Pedagógica. Receberá uma resposta no prazo de 48 horas úteis.
        </p>
      </Card>
    );
  }

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="max-w-2xl mx-auto">
      <Card className="p-8 bg-white border border-slate-200 shadow-lg rounded-2xl">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 bg-red-50 text-red-600 rounded-xl">
            <MessageSquare className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-800">Reclamação Académica</h2>
            <p className="text-sm text-slate-500">Solicite revisão de notas ou esclarecimentos</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Disciplina</label>
              <select 
                required
                value={formData.subjectId}
                onChange={e => setFormData(prev => ({ ...prev, subjectId: e.target.value }))}
                className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm"
              >
                <option value="">Selecione...</option>
                {subjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Trimestre</label>
              <select 
                value={formData.trimester}
                onChange={e => setFormData(prev => ({ ...prev, trimester: Number(e.target.value) }))}
                className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm"
              >
                <option value={1}>1º Trimestre</option>
                <option value={2}>2º Trimestre</option>
                <option value={3}>3º Trimestre</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Descrição do Problema</label>
            <textarea 
              required
              rows={4}
              value={formData.description}
              onChange={e => setFormData(prev => ({ ...prev, description: e.target.value }))}
              className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm resize-none"
              placeholder="Descreva detalhadamente o motivo da sua reclamação..."
            />
          </div>

          <button 
            type="submit"
            className="w-full py-3 bg-red-600 text-white rounded-xl font-bold hover:bg-red-700 transition-all shadow-lg"
          >
            Enviar Reclamação
          </button>
        </form>
      </Card>
    </motion.div>
  );
};
