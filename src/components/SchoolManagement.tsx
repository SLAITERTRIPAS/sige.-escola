import React, { useState, useMemo } from 'react';
import { useStore } from '../store';
import { Card, Button, Input } from './ui';
import { 
  Building2, 
  MapPin, 
  GraduationCap, 
  User, 
  Phone, 
  Mail, 
  Plus, 
  CheckCircle2, 
  Search, 
  Filter, 
  CheckSquare, 
  Square,
  Eye,
  Trash2,
  Edit2,
  Shield,
  Briefcase,
  Image,
  BookOpen,
  UserCheck,
  Sparkles
} from 'lucide-react';
import { School, SchoolLevelType, SchoolManagementType } from '../types';
import { computeAutoCurriculum, ALL_SCHOOL_LEVELS_MAPPING, SCHOOL_PRESET_LOGOS } from '../data/sigeRoles';

const PROVINCES_MOZAMBIQUE = [
  'Maputo Cidade',
  'Maputo Província',
  'Gaza',
  'Inhambane',
  'Sofala',
  'Manica',
  'Tete',
  'Zambézia',
  'Nampula',
  'Cabo Delgado',
  'Niassa'
];

export function SchoolManagement() {
  const { schools, addSchool, removeSchool } = useStore();

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  // Form State
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [logoUrl, setLogoUrl] = useState(SCHOOL_PRESET_LOGOS[0]);
  const [managementType, setManagementType] = useState<SchoolManagementType>('estatal');
  const [province, setProvince] = useState('Maputo Cidade');
  const [district, setDistrict] = useState('');
  const [locality, setLocality] = useState('');
  const [administrativePost, setAdministrativePost] = useState('');
  const [address, setAddress] = useState('');
  
  // Corpo Directivo
  const [directorName, setDirectorName] = useState('');
  const [dapName, setDapName] = useState('');
  const [secretariatChiefName, setSecretariatChiefName] = useState('');

  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [studentCapacity, setStudentCapacity] = useState<number>(1000);
  const [selectedTypes, setSelectedTypes] = useState<SchoolLevelType[]>(['ENSINO SECUNDÁRIO DO 1 CICLO']);
  const [shifts, setShifts] = useState<string[]>(['Diurno']);

  // Dynamic Auto Curriculum Calculation
  const autoCurriculum = useMemo(() => {
    return computeAutoCurriculum(selectedTypes);
  }, [selectedTypes]);

  // Filters & Search
  const [searchTerm, setSearchTerm] = useState('');
  const [filterManagement, setFilterManagement] = useState<string>('all');
  const [filterProvince, setFilterProvince] = useState<string>('all');
  const [selectedSchoolModal, setSelectedSchoolModal] = useState<School | null>(null);

  const toggleSchoolLevel = (level: SchoolLevelType) => {
    setSelectedTypes(prev => 
      prev.includes(level) ? prev.filter(l => l !== level) : [...prev, level]
    );
  };

  const toggleShift = (shift: string) => {
    setShifts(prev =>
      prev.includes(shift) ? prev.filter(s => s !== shift) : [...prev, shift]
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    addSchool({
      name: name.trim(),
      code: code.trim() || `ESC-${Math.floor(100 + Math.random() * 900)}`,
      logoUrl: logoUrl.trim() || SCHOOL_PRESET_LOGOS[0],
      managementType,
      province,
      district: district.trim() || 'Sede',
      locality: locality.trim(),
      administrativePost: administrativePost.trim(),
      address: address.trim() || 'Localidade Sede',
      schoolTypes: selectedTypes,
      directorName: directorName.trim(),
      dapName: dapName.trim(),
      secretariatChiefName: secretariatChiefName.trim(),
      phone: phone.trim(),
      email: email.trim(),
      shifts,
      studentCapacity: Number(studentCapacity) || 500,
      autoAssignedClasses: autoCurriculum.classes,
      autoAssignedSubjects: autoCurriculum.subjects
    });

    setSuccessMessage(`Escola "${name}" e o seu Corpo Directivo registados com sucesso! As contas de usuário e currículo foram atribuídos automaticamente.`);
    
    // Reset Form
    setName('');
    setCode('');
    setLogoUrl(SCHOOL_PRESET_LOGOS[0]);
    setDistrict('');
    setLocality('');
    setAdministrativePost('');
    setAddress('');
    setDirectorName('');
    setDapName('');
    setSecretariatChiefName('');
    setPhone('');
    setEmail('');
    setSelectedTypes(['ENSINO SECUNDÁRIO DO 1 CICLO']);
    setShifts(['Diurno']);

    setTimeout(() => {
      setSuccessMessage('');
      setIsFormOpen(false);
    }, 2500);
  };

  const filteredSchools = schools.filter(s => {
    const matchesSearch = 
      s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (s.code && s.code.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (s.district && s.district.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesManagement = 
      filterManagement === 'all' || s.managementType === filterManagement;

    const matchesProvince = 
      filterProvince === 'all' || s.province === filterProvince;

    return matchesSearch && matchesManagement && matchesProvince;
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-300 font-sans">
      
      {/* Header Banner */}
      <div className="bg-slate-900 text-white rounded-3xl p-6 shadow-md border border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="p-3.5 bg-blue-600/30 border border-blue-500/40 text-blue-400 rounded-2xl shrink-0">
            <Building2 size={28} />
          </div>
          <div>
            <h2 className="text-xl font-extrabold text-slate-100 flex items-center gap-2">
              Gestão da Rede Escolar (MINEDH)
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Cadastro oficial e mapeamento de escolas estatais e privadas em todo o território nacional.
            </p>
          </div>
        </div>

        <button
          onClick={() => setIsFormOpen(!isFormOpen)}
          className="bg-blue-600 hover:bg-blue-500 active:scale-95 text-white font-extrabold text-xs px-5 py-3 rounded-2xl flex items-center gap-2 shadow-lg shadow-blue-600/20 transition-all cursor-pointer"
        >
          {isFormOpen ? <Building2 size={16} /> : <Plus size={16} />}
          <span>{isFormOpen ? 'Fechar Formulário' : 'Registar Nova Escola'}</span>
        </button>
      </div>

      {/* SUCCESS NOTIFICATION */}
      {successMessage && (
        <div className="p-4 bg-emerald-50 border border-emerald-300 text-emerald-900 rounded-2xl font-bold text-xs flex items-center gap-3 animate-fadeIn">
          <CheckCircle2 size={20} className="text-emerald-600 shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      {/* FORMULARIO COMPLETO DE REGISTO DE ESCOLA */}
      {isFormOpen && (
        <Card className="p-6 md:p-8 bg-white border border-slate-200 rounded-3xl shadow-xl space-y-6">
          <div className="border-b border-slate-200 pb-4 flex items-center justify-between">
            <div>
              <h3 className="text-lg font-black text-slate-900 tracking-tight flex items-center gap-2">
                <Plus className="text-blue-600" size={20} /> Formato Oficial de Registo de Escola
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Preencha todos os dados administrativos, de localização territorial e os níveis de ensino leccionados.
              </p>
            </div>
            <span className="text-[10px] bg-blue-50 text-blue-700 border border-blue-200 px-3 py-1 rounded-full font-black uppercase">
              MINEDH Form R-01
            </span>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6 text-xs font-sans">
            
            {/* SEÇÃO 1: TIPO DE GESTÃO & IDENTIFICAÇÃO INSTITUCIONAL & LOGOTIPO */}
            <div className="space-y-4">
              <h4 className="text-xs font-black uppercase tracking-wider text-blue-900 border-l-4 border-blue-600 pl-2.5 flex items-center gap-2">
                <Briefcase size={15} /> 1. Identificação Institucional, Gestão & Logotipo
              </h4>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-200">
                
                {/* Nome da Escola */}
                <div className="md:col-span-2">
                  <label className="block font-bold text-slate-700 mb-1">
                    Nome Oficial da Escola: <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: Escola Secundária Josina Machel ou Instituto Politécnico..."
                    value={name}
                    onChange={e => setName(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl font-bold text-slate-900 focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>

                {/* Código / NUIT */}
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Código / NUIT da Escola:
                  </label>
                  <input
                    type="text"
                    placeholder="Ex: ESC-MAP-001"
                    value={code}
                    onChange={e => setCode(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl font-mono text-xs font-bold text-slate-800 focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>

                {/* Logotipo da Escola */}
                <div className="md:col-span-3 space-y-2">
                  <label className="block font-bold text-slate-700 flex items-center gap-2">
                    <Image size={15} className="text-blue-600" /> Logotipo / Emblema da Escola:
                  </label>
                  
                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                    <img 
                      src={logoUrl} 
                      alt="Logotipo" 
                      className="w-14 h-14 rounded-2xl object-cover border-2 border-blue-500 shadow-sm shrink-0 bg-white"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = SCHOOL_PRESET_LOGOS[0];
                      }}
                    />
                    <div className="flex-1 w-full space-y-2">
                      <input
                        type="url"
                        placeholder="https://exemplo.com/logotipo-escola.png"
                        value={logoUrl}
                        onChange={e => setLogoUrl(e.target.value)}
                        className="w-full px-3.5 py-2 bg-white border border-slate-300 rounded-xl font-mono text-xs text-slate-800 focus:ring-2 focus:ring-blue-500 outline-none"
                      />
                      <div className="flex items-center gap-2 overflow-x-auto pb-1">
                        <span className="text-[10px] text-slate-500 font-bold shrink-0">Modelos de Emblema:</span>
                        {SCHOOL_PRESET_LOGOS.map((preset, idx) => (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => setLogoUrl(preset)}
                            className={`w-7 h-7 rounded-lg border overflow-hidden shrink-0 ${logoUrl === preset ? 'ring-2 ring-blue-600 border-blue-600' : 'border-slate-300'}`}
                          >
                            <img src={preset} alt="preset" className="w-full h-full object-cover" />
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Tipo de Gestão: Estatal ou Privado */}
                <div className="md:col-span-3">
                  <label className="block font-bold text-slate-700 mb-2">
                    Tipo de Gestão (Regime Proprietário): <span className="text-red-500">*</span>
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <label
                      onClick={() => setManagementType('estatal')}
                      className={`p-3.5 rounded-2xl border flex items-center gap-3 cursor-pointer transition-all ${
                        managementType === 'estatal'
                          ? 'bg-blue-50 border-blue-600 text-blue-900 font-black shadow-xs'
                          : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-100/60 font-semibold'
                      }`}
                    >
                      <input
                        type="radio"
                        name="managementType"
                        checked={managementType === 'estatal'}
                        onChange={() => setManagementType('estatal')}
                        className="text-blue-600 focus:ring-blue-500"
                      />
                      <div>
                        <div className="text-xs font-black">Escola Estatal / Pública</div>
                        <div className="text-[10px] text-slate-500 font-normal">Financiada e gerida pelo Governo de Moçambique (MINEDH).</div>
                      </div>
                    </label>

                    <label
                      onClick={() => setManagementType('privado')}
                      className={`p-3.5 rounded-2xl border flex items-center gap-3 cursor-pointer transition-all ${
                        managementType === 'privado'
                          ? 'bg-purple-50 border-purple-600 text-purple-900 font-black shadow-xs'
                          : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-100/60 font-semibold'
                      }`}
                    >
                      <input
                        type="radio"
                        name="managementType"
                        checked={managementType === 'privado'}
                        onChange={() => setManagementType('privado')}
                        className="text-purple-600 focus:ring-purple-500"
                      />
                      <div>
                        <div className="text-xs font-black">Escola Privada / Comunitária / Confessional</div>
                        <div className="text-[10px] text-slate-500 font-normal">Instituição de ensino particular ou sob gestão comunitária/religiosa.</div>
                      </div>
                    </label>
                  </div>
                </div>

              </div>
            </div>

            {/* SEÇÃO 2: LOCALIZAÇÃO TERRITORIAL COMPLETA */}
            <div className="space-y-4">
              <h4 className="text-xs font-black uppercase tracking-wider text-blue-900 border-l-4 border-blue-600 pl-2.5 flex items-center gap-2">
                <MapPin size={15} /> 2. Localização Territorial & Endereço
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-200">
                
                {/* Província */}
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Província: <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={province}
                    onChange={e => setProvince(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl font-bold text-slate-800 focus:ring-2 focus:ring-blue-500 outline-none"
                  >
                    {PROVINCES_MOZAMBIQUE.map(p => (
                      <option key={p} value={p}>{p}</option>
                    ))}
                  </select>
                </div>

                {/* Distrito */}
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Distrito: <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: KaMpfumo, Matola, Chókwè..."
                    value={district}
                    onChange={e => setDistrict(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl font-semibold text-slate-800 focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>

                {/* Posto Administrativo */}
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Posto Administrativo: <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: Urbanização, Matola Sede..."
                    value={administrativePost}
                    onChange={e => setAdministrativePost(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl font-semibold text-slate-800 focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>

                {/* Localidade */}
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Localidade / Bairro: <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: Malangalene, Bairro Central..."
                    value={locality}
                    onChange={e => setLocality(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl font-semibold text-slate-800 focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>

                {/* Endereço Detalhado */}
                <div className="sm:col-span-2 md:col-span-4">
                  <label className="block font-bold text-slate-700 mb-1">
                    Endereço Completo (Rua, Avenida, Número ou Referência):
                  </label>
                  <input
                    type="text"
                    placeholder="Ex: Av. Eduardo Mondlane, nº 450, próximo ao Hospital Geral..."
                    value={address}
                    onChange={e => setAddress(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl font-semibold text-slate-800 focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>

              </div>
            </div>

            {/* SEÇÃO 3: TIPO DE ESCOLA / NÍVEIS DE ENSINO LECCIONADOS & ATRIBUIÇÃO AUTOMÁTICA */}
            <div className="space-y-4">
              <h4 className="text-xs font-black uppercase tracking-wider text-blue-900 border-l-4 border-blue-600 pl-2.5 flex items-center gap-2">
                <GraduationCap size={15} /> 3. Nível de Ensino Leccionado (Atribuição Automática de Classes & Disciplinas)
              </h4>

              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-4">
                <p className="text-slate-700 font-bold text-xs">
                  Selecione o Nível de Ensino Leccionado. O sistema atribui <span className="text-blue-700 underline font-black">automaticamente</span> as disciplinas e as classes correspondentes para esta escola:
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {ALL_SCHOOL_LEVELS_MAPPING.map(lvl => {
                    const isChecked = selectedTypes.includes(lvl.id);
                    return (
                      <div
                        key={lvl.id}
                        onClick={() => toggleSchoolLevel(lvl.id)}
                        className={`p-3 rounded-2xl border cursor-pointer transition-all flex items-start gap-3 ${
                          isChecked
                            ? 'bg-blue-600 text-white border-blue-700 shadow-sm'
                            : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100'
                        }`}
                      >
                        <div className="pt-0.5 shrink-0">
                          {isChecked ? <CheckSquare size={18} /> : <Square size={18} className="text-slate-400" />}
                        </div>
                        <div>
                          <div className="font-extrabold text-xs">{lvl.label}</div>
                          <div className={`text-[10px] mt-0.5 leading-tight ${isChecked ? 'text-blue-100' : 'text-slate-500'}`}>
                            {lvl.desc}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* BANNER DE ATRIBUIÇÃO AUTOMÁTICA EM TEMPO REAL */}
                <div className="p-4 bg-blue-50/80 border border-blue-200 rounded-2xl space-y-3">
                  <div className="flex items-center gap-2 text-blue-900 font-extrabold text-xs">
                    <Sparkles size={16} className="text-blue-600" />
                    <span>Currículo Atribuído Automaticamente pelo Sistema SIGE:</span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Classes Atribuídas */}
                    <div>
                      <span className="text-[11px] font-extrabold text-slate-700 block mb-1 flex items-center gap-1">
                        <GraduationCap size={13} className="text-blue-600" /> Classes Atribuídas ({autoCurriculum.classes.length}):
                      </span>
                      <div className="flex flex-wrap gap-1">
                        {autoCurriculum.classes.map(c => (
                          <span key={c} className="text-[10px] font-bold bg-white text-blue-900 border border-blue-200 px-2 py-0.5 rounded-lg shadow-2xs">
                            {c}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Disciplinas Atribuídas */}
                    <div>
                      <span className="text-[11px] font-extrabold text-slate-700 block mb-1 flex items-center gap-1">
                        <BookOpen size={13} className="text-blue-600" /> Disciplinas Atribuídas ({autoCurriculum.subjects.length}):
                      </span>
                      <div className="flex flex-wrap gap-1">
                        {autoCurriculum.subjects.map(s => (
                          <span key={s} className="text-[10px] font-semibold bg-white text-slate-800 border border-slate-200 px-2 py-0.5 rounded-lg shadow-2xs">
                            {s}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

              </div>
            </div>

            {/* SEÇÃO 4: CORPO DIRECTIVO (ALOCAÇÃO AUTOMÁTICA DE CONTAS) */}
            <div className="space-y-4">
              <h4 className="text-xs font-black uppercase tracking-wider text-blue-900 border-l-4 border-blue-600 pl-2.5 flex items-center gap-2">
                <UserCheck size={15} /> 4. Registo do Corpo Directivo (Criação de Contas & Alocação)
              </h4>

              <p className="text-xs text-slate-500 italic">
                Após o registo do Corpo Directivo, ao aceder ao sistema pelas suas contas, o sistema deteta o usuário e a sua alocação, sendo direcionado diretamente à sua área de trabalho para a gestão da escola e registo de colaboradores.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-200">
                
                {/* Director da Escola */}
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Director da Escola: <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Nome do Director da Escola"
                    value={directorName}
                    onChange={e => setDirectorName(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl font-bold text-slate-900 focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                  <span className="text-[10px] text-blue-700 font-semibold mt-1 block">Cria conta com perfil "Direcção"</span>
                </div>

                {/* DAP - Director Adjunto Pedagógico */}
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Director Adjunto Pedagógico (DAP): <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Nome do DAP / Dir. Pedagógico"
                    value={dapName}
                    onChange={e => setDapName(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl font-bold text-slate-900 focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                  <span className="text-[10px] text-blue-700 font-semibold mt-1 block">Cria conta com perfil "Pedagógico"</span>
                </div>

                {/* Chefe da Secretaria */}
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Chefe da Secretaria: <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Nome do Chefe da Secretaria"
                    value={secretariatChiefName}
                    onChange={e => setSecretariatChiefName(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl font-bold text-slate-900 focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                  <span className="text-[10px] text-blue-700 font-semibold mt-1 block">Cria conta com perfil "Secretaria"</span>
                </div>

                {/* Telefone */}
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Telefone Institucional:
                  </label>
                  <input
                    type="text"
                    placeholder="+258 84 000 0000"
                    value={phone}
                    onChange={e => setPhone(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl font-mono text-xs font-semibold text-slate-800 focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>

                {/* E-mail */}
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    E-mail Oficial da Escola:
                  </label>
                  <input
                    type="email"
                    placeholder="escola@minedh.gov.mz"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl font-mono text-xs font-semibold text-slate-800 focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>

                {/* Capacidade */}
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Capacidade Prevista de Alunos:
                  </label>
                  <input
                    type="number"
                    value={studentCapacity}
                    onChange={e => setStudentCapacity(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl font-bold text-slate-800 focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>

                {/* Turnos */}
                <div className="sm:col-span-3">
                  <label className="block font-bold text-slate-700 mb-1">
                    Turnos em Funcionamento:
                  </label>
                  <div className="flex items-center gap-4 pt-1">
                    {['Diurno', 'Nocturno', 'Integral'].map(s => (
                      <label key={s} className="flex items-center gap-2 font-bold text-slate-800 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={shifts.includes(s)}
                          onChange={() => toggleShift(s)}
                          className="rounded text-blue-600 focus:ring-blue-500"
                        />
                        <span>{s}</span>
                      </label>
                    ))}
                  </div>
                </div>

              </div>
            </div>

            {/* BOTÕES DE AÇÃO */}
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200">
              <button
                type="button"
                onClick={() => setIsFormOpen(false)}
                className="px-5 py-2.5 text-xs font-bold text-slate-600 hover:text-slate-900 border border-slate-300 rounded-xl hover:bg-slate-50 transition-all"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="bg-blue-900 hover:bg-blue-800 text-white font-extrabold text-xs px-8 py-3 rounded-xl shadow-md flex items-center gap-2 transition-all cursor-pointer"
              >
                <Building2 size={16} /> Submeter Registo de Escola
              </button>
            </div>

          </form>
        </Card>
      )}

      {/* LISTAGEM DE ESCOLAS CADASTRADAS */}
      <Card className="p-6 bg-white border border-slate-200 rounded-3xl shadow-sm space-y-5">
        
        {/* Controls Bar */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-4">
          <div>
            <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
              <Building2 className="text-blue-900" size={20} />
              Rede de Escolas Cadastradas ({filteredSchools.length})
            </h3>
            <p className="text-xs text-slate-500">
              Mapeamento de unidades de ensino cadastradas no sistema.
            </p>
          </div>

          {/* Search & Filters */}
          <div className="flex flex-wrap items-center gap-2 text-xs">
            {/* Search Input */}
            <div className="relative">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder="Pesquisar escola, código ou distrito..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="pl-9 pr-3 py-2 border border-slate-300 rounded-xl font-medium text-xs text-slate-800 focus:ring-2 focus:ring-blue-500 outline-none w-56"
              />
            </div>

            {/* Filter Tipo Gestao */}
            <select
              value={filterManagement}
              onChange={e => setFilterManagement(e.target.value)}
              className="px-3 py-2 border border-slate-300 rounded-xl font-bold text-slate-700 bg-white"
            >
              <option value="all">Todos os Tipos (Estatal / Privado)</option>
              <option value="estatal">Apenas Estatais</option>
              <option value="privado">Apenas Privadas</option>
            </select>

            {/* Filter Provincia */}
            <select
              value={filterProvince}
              onChange={e => setFilterProvince(e.target.value)}
              className="px-3 py-2 border border-slate-300 rounded-xl font-bold text-slate-700 bg-white"
            >
              <option value="all">Todas as Províncias</option>
              {PROVINCES_MOZAMBIQUE.map(p => (
                <option key={p} value={p}>{p}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Table / Cards Grid */}
        <div className="space-y-3">
          {filteredSchools.length === 0 ? (
            <div className="p-12 text-center text-slate-400 text-xs space-y-2">
              <Building2 className="mx-auto h-10 w-10 text-slate-300" />
              <p className="font-bold">Nenhuma escola encontrada com os filtros selecionados.</p>
            </div>
          ) : (
            filteredSchools.map(sch => (
              <div
                key={sch.id}
                className="p-5 border border-slate-200 rounded-2xl bg-slate-50/70 hover:bg-white hover:border-blue-300 hover:shadow-md transition-all flex flex-col md:flex-row justify-between items-start md:items-center gap-4"
              >
                {/* Logo + Info */}
                <div className="flex items-start gap-4 max-w-3xl">
                  {sch.logoUrl ? (
                    <img
                      src={sch.logoUrl}
                      alt={sch.name}
                      className="w-12 h-12 rounded-xl object-cover border border-slate-200 shadow-2xs shrink-0 bg-white mt-1"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = SCHOOL_PRESET_LOGOS[0];
                      }}
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-xl bg-blue-100 text-blue-800 border border-blue-200 flex items-center justify-center shrink-0 font-extrabold text-sm">
                      <Building2 size={22} />
                    </div>
                  )}

                  <div className="space-y-1.5">
                    <div className="flex flex-wrap items-center gap-2">
                      <h4 className="font-extrabold text-slate-900 text-sm">
                        {sch.name}
                      </h4>

                      {/* Management Type Badge */}
                      {sch.managementType === 'privado' ? (
                        <span className="text-[10px] font-black uppercase bg-purple-100 text-purple-900 border border-purple-300 px-2.5 py-0.5 rounded-full">
                          Privada
                        </span>
                      ) : (
                        <span className="text-[10px] font-black uppercase bg-blue-100 text-blue-900 border border-blue-300 px-2.5 py-0.5 rounded-full">
                          Estatal / Pública
                        </span>
                      )}

                      {sch.code && (
                        <span className="text-[10px] font-mono bg-slate-200 text-slate-700 px-2 py-0.5 rounded font-bold">
                          {sch.code}
                        </span>
                      )}
                    </div>

                    {/* Localização completa */}
                    <div className="text-xs text-slate-600 font-medium flex flex-wrap items-center gap-x-3 gap-y-1">
                      <span className="flex items-center gap-1 font-bold text-slate-800">
                        <MapPin size={13} className="text-blue-600 shrink-0" />
                        {sch.province || 'Maputo Cidade'} • {sch.district || 'Distrito Central'}
                      </span>
                      {sch.administrativePost && (
                        <span>Posto: <strong>{sch.administrativePost}</strong></span>
                      )}
                      {sch.locality && (
                        <span>Loc: <strong>{sch.locality}</strong></span>
                      )}
                      <span>({sch.address})</span>
                    </div>

                    {/* Corpo Directivo Résumé */}
                    <div className="text-[11px] text-slate-600 font-medium flex flex-wrap items-center gap-x-3 gap-y-0.5 bg-slate-100/80 p-1.5 rounded-lg border border-slate-200/60">
                      <span><strong>Director:</strong> {sch.directorName || 'N/A'}</span>
                      {sch.dapName && <span>| <strong>DAP:</strong> {sch.dapName}</span>}
                      {sch.secretariatChiefName && <span>| <strong>Chefe Sec.:</strong> {sch.secretariatChiefName}</span>}
                    </div>

                    {/* Níveis oferecidos badges */}
                    {sch.schoolTypes && sch.schoolTypes.length > 0 && (
                      <div className="flex flex-wrap gap-1 pt-0.5">
                        {sch.schoolTypes.map(st => (
                          <span key={st} className="text-[9px] font-extrabold bg-blue-50 text-blue-900 px-2 py-0.5 rounded-md border border-blue-200">
                            {st}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => setSelectedSchoolModal(sch)}
                    className="p-2 bg-white border border-slate-300 hover:border-blue-500 text-slate-700 hover:text-blue-600 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-xs"
                  >
                    <Eye size={14} /> Ficha Completa
                  </button>

                  <button
                    onClick={() => {
                      if (confirm(`Remover escola "${sch.name}"?`)) {
                        removeSchool(sch.id);
                      }
                    }}
                    className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-xl transition-all"
                    title="Remover Escola"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>

              </div>
            ))
          )}
        </div>

      </Card>

      {/* MODAL FICHA COMPLETA DA ESCOLA */}
      {selectedSchoolModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-2xl w-full border border-slate-200 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            
            {/* Modal Header */}
            <div className="p-6 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
              <div className="flex items-center gap-3">
                {selectedSchoolModal.logoUrl ? (
                  <img src={selectedSchoolModal.logoUrl} alt="Logo" className="w-12 h-12 rounded-xl object-cover bg-white border-2 border-blue-500 shrink-0" />
                ) : (
                  <div className="p-2.5 bg-blue-600/30 border border-blue-500/40 text-blue-400 rounded-xl">
                    <Building2 size={24} />
                  </div>
                )}
                <div>
                  <h3 className="font-extrabold text-base text-slate-100">
                    {selectedSchoolModal.name}
                  </h3>
                  <p className="text-xs text-slate-400">
                    Código / NUIT: {selectedSchoolModal.code || 'MINEDH-REG'}
                  </p>
                </div>
              </div>

              <button
                onClick={() => setSelectedSchoolModal(null)}
                className="text-slate-400 hover:text-white p-2 rounded-xl font-bold"
              >
                ✕
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto space-y-5 text-xs text-slate-800 leading-relaxed font-sans">
              
              {/* Status */}
              <div className="flex items-center justify-between p-3.5 bg-slate-50 border border-slate-200 rounded-2xl">
                <div>
                  <span className="text-slate-500 font-bold block">Regime de Gestão</span>
                  <span className="font-black text-sm uppercase text-slate-900">
                    {selectedSchoolModal.managementType === 'privado' ? 'Privada / Comunitária' : 'Estatal / Pública'}
                  </span>
                </div>
                <span className="px-3 py-1 bg-emerald-100 text-emerald-800 border border-emerald-300 font-bold rounded-full">
                  Escola Ativa no Sistema
                </span>
              </div>

              {/* Localização Detalhada */}
              <div className="space-y-2">
                <h4 className="font-black text-slate-900 uppercase tracking-wider text-[11px] text-blue-900">
                  Localização Geográfica Completa
                </h4>
                <div className="grid grid-cols-2 gap-3 bg-slate-50 p-4 rounded-2xl border border-slate-200">
                  <div><strong>Província:</strong> {selectedSchoolModal.province || 'Maputo Cidade'}</div>
                  <div><strong>Distrito:</strong> {selectedSchoolModal.district || 'Sede'}</div>
                  <div><strong>Posto Administrativo:</strong> {selectedSchoolModal.administrativePost || 'N/A'}</div>
                  <div><strong>Localidade / Bairro:</strong> {selectedSchoolModal.locality || 'N/A'}</div>
                  <div className="col-span-2"><strong>Endereço:</strong> {selectedSchoolModal.address}</div>
                </div>
              </div>

              {/* Corpo Directivo Alocado */}
              <div className="space-y-2">
                <h4 className="font-black text-slate-900 uppercase tracking-wider text-[11px] text-blue-900 flex items-center gap-1.5">
                  <UserCheck size={14} className="text-blue-600" /> Corpo Directivo Alocado
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-blue-50/60 p-4 rounded-2xl border border-blue-200">
                  <div className="bg-white p-2.5 rounded-xl border border-blue-100">
                    <span className="text-[10px] text-blue-800 font-extrabold uppercase block">Director da Escola</span>
                    <span className="font-black text-slate-900">{selectedSchoolModal.directorName || 'Não especificado'}</span>
                  </div>
                  <div className="bg-white p-2.5 rounded-xl border border-blue-100">
                    <span className="text-[10px] text-blue-800 font-extrabold uppercase block">Dir. Adjunto Pedagógico (DAP)</span>
                    <span className="font-black text-slate-900">{selectedSchoolModal.dapName || 'Não especificado'}</span>
                  </div>
                  <div className="bg-white p-2.5 rounded-xl border border-blue-100">
                    <span className="text-[10px] text-blue-800 font-extrabold uppercase block">Chefe da Secretaria</span>
                    <span className="font-black text-slate-900">{selectedSchoolModal.secretariatChiefName || 'Não especificado'}</span>
                  </div>
                </div>
              </div>

              {/* Níveis de Ensino & Currículo Atribuído */}
              <div className="space-y-2">
                <h4 className="font-black text-slate-900 uppercase tracking-wider text-[11px] text-blue-900 flex items-center gap-1.5">
                  <GraduationCap size={14} className="text-blue-600" /> Níveis de Ensino & Estrutura Curricular
                </h4>
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3">
                  <div>
                    <span className="text-[11px] font-bold text-slate-600 block mb-1">Sub-sistemas de Ensino:</span>
                    <div className="flex flex-wrap gap-1.5">
                      {(selectedSchoolModal.schoolTypes || ['ENSINO BÁSICO']).map(st => (
                        <span key={st} className="bg-blue-600 text-white font-extrabold px-3 py-1 rounded-xl text-[10px]">
                          {st}
                        </span>
                      ))}
                    </div>
                  </div>

                  {selectedSchoolModal.autoAssignedClasses && (
                    <div>
                      <span className="text-[11px] font-bold text-slate-600 block mb-1">Classes Atribuídas:</span>
                      <div className="flex flex-wrap gap-1">
                        {selectedSchoolModal.autoAssignedClasses.map(c => (
                          <span key={c} className="bg-white text-blue-900 border border-blue-200 font-bold px-2 py-0.5 rounded-lg text-[10px]">
                            {c}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {selectedSchoolModal.autoAssignedSubjects && (
                    <div>
                      <span className="text-[11px] font-bold text-slate-600 block mb-1">Disciplinas Atribuídas:</span>
                      <div className="flex flex-wrap gap-1">
                        {selectedSchoolModal.autoAssignedSubjects.map(s => (
                          <span key={s} className="bg-white text-slate-800 border border-slate-200 font-medium px-2 py-0.5 rounded-lg text-[10px]">
                            {s}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Contactos e Capacidade */}
              <div className="space-y-2">
                <h4 className="font-black text-slate-900 uppercase tracking-wider text-[11px] text-blue-900">
                  Contactos e Recursos da Escola
                </h4>
                <div className="grid grid-cols-2 gap-3 bg-slate-50 p-4 rounded-2xl border border-slate-200">
                  <div><strong>Telefone:</strong> {selectedSchoolModal.phone || 'N/A'}</div>
                  <div><strong>E-mail:</strong> {selectedSchoolModal.email || 'N/A'}</div>
                  <div><strong>Turnos:</strong> {(selectedSchoolModal.shifts || ['Diurno']).join(', ')}</div>
                  <div><strong>Capacidade:</strong> {selectedSchoolModal.studentCapacity || 1000} alunos</div>
                </div>
              </div>

            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end">
              <button
                onClick={() => setSelectedSchoolModal(null)}
                className="bg-slate-900 text-white font-bold px-6 py-2 rounded-xl text-xs"
              >
                Fechar Ficha
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
