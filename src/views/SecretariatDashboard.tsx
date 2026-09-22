import React, { useState } from "react";
import { useStore } from "../store";
import { Card, Button, Input } from "../components/ui";
import {
  Users,
  GraduationCap,
  FileText,
  UserPlus,
  FileSignature,
  Printer,
  BookOpen,
  CheckSquare,
  Square,
  MessageSquare,
  Plus,
  Inbox,
  Send,
  User,
  ChevronRight,
} from "lucide-react";
import { Student } from "../types";
import { EmployeeManagement } from "../components/EmployeeManagement";
import { StudentProcessDocument } from "../components/StudentProcessDocument";
import { CertificateDocument } from "../components/CertificateDocument";
import { DeclarationDocument } from "../components/DeclarationDocument";
import { SecretariatOverview } from "../components/SecretariatOverview";
import { CollectionFormView } from "../components/CollectionFormView";
import { GovernanceChat } from "../components/GovernanceChat";
import { SignatureManager } from "../components/SignatureManager";
import { AcademicCalendarComponent } from "../components/AcademicCalendarComponent";
import {
  Search,
  Award,
  CheckCircle,
  AlertCircle,
  LayoutDashboard,
  Globe,
  Calendar,
  BarChart2,
  Clock,
} from "lucide-react";
import { CollapsibleSidebar } from "../components/CollapsibleSidebar";
import { SidebarMenu } from "../components/SidebarMenu";
import { MOZAMBIQUE_PROVINCES, getDistrictsForProvince } from "../data/mozambiqueLocations";
import { QuickSearchHeader } from "../components/QuickSearchHeader";

export function SecretariatDashboard() {
  const {
    students,
    classes,
    enrollStudent,
    assignClasses,
    subjects,
    grades,
    collectionPeriods,
    currentUser,
  } = useStore();
  const [activeTab, setActiveTab] = useState<
    | "overview"
    | "enrollment"
    | "certificates"
    | "declarations"
    | "employees"
    | "collection"
    | "messages"
  >("overview");
  const [selectedClass, setSelectedClass] = useState<string>("");
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [selectedListClassId, setSelectedListClassId] = useState<string | null>(
    null,
  );
  const [enrollmentSubView, setEnrollmentSubView] = useState<'hub' | 'form'>('hub');
  const [selectedCycleFilter, setSelectedCycleFilter] = useState<'all' | '1' | '2'>('all');

  // Filters for Certificates & Declarations
  const [certYear, setCertYear] = useState<number>(2026);
  const [certGradeFilter, setCertGradeFilter] = useState<string>("all");
  const [certStudentSearch, setCertStudentSearch] = useState<string>("");

  const [declYear, setDeclYear] = useState<number>(2026);
  const [declGradeFilter, setDeclGradeFilter] = useState<string>("all");
  const [declStudentSearch, setDeclStudentSearch] = useState<string>("");

  // New Student State aligned with official Processo Individual
  const [newStudent, setNewStudent] = useState({
    processCode: "",
    studentNumber: "",
    name: "",
    entryGrade: "10ª Classe",
    course: "Ensino Secundário Geral (ESG)",
    academicYear: 2026,
    openingDate: new Date().toISOString().split("T")[0],

    // 1. Identificação do Aluno
    gender: "M",
    birthDate: "",
    birthPlace: "",
    nationality: "Moçambicana",
    maritalStatus: "Solteiro(a)",
    idCardNumber: "",
    idCardIssuedAt: "Maputo",
    nuit: "",

    // Endereço
    province: "Maputo Cidade",
    district: "Kamavota",
    administrativePost: "Posto Central",
    neighborhood: "",
    address: "",
    phone: "",
    email: "",

    // 2. Filiação
    fatherName: "",
    fatherProfession: "",
    fatherPhone: "",
    motherName: "",
    motherProfession: "",
    motherPhone: "",
    guardianName: "",
    guardianKinship: "Pai/Mãe",
    guardianProfession: "",
    guardianPhone: "",
    guardianAddress: "",

    // 3. Documentos Anexos
    attachedDocuments: {
      birthCertificate: true,
      idCard: true,
      qualificationsCertificate: true,
      medicalCertificate: true,
      passPhotos: true,
      residenceDeclaration: true,
      paymentProof: true,
    },

    // 4. Histórico Académico
    academicHistory: [
      {
        year: 2024,
        grade: "8ª Classe",
        school: "Escola Comunitária São Pedro",
        result: "Aprovado",
      },
      {
        year: 2025,
        grade: "9ª Classe",
        school: "Escola Secundária Josina Machel",
        result: "Aprovado",
      },
    ],

    // 5. Matrícula
    enrollmentDate: new Date().toISOString().split("T")[0],
    regime: "Diurno",
    shift: "Manhã",
    enrollmentStatus: "Activo" as const,

    // 10. Observações Gerais
    generalObservations: "",
  });

  const handleEnroll = (e: React.FormEvent) => {
    e.preventDefault();
    const generatedProcessCode =
      newStudent.processCode.trim() ||
      `PROC-2026-${Math.random().toString(36).substr(2, 6).toUpperCase()}`;
    const generatedStudentNumber =
      newStudent.studentNumber.trim() ||
      `ALU-${Math.floor(1000 + Math.random() * 9000)}`;

    enrollStudent({
      schoolId: "s1",
      ...newStudent,
      processCode: generatedProcessCode,
      studentNumber: generatedStudentNumber,
    });

    // Reset form
    setNewStudent({
      processCode: "",
      studentNumber: "",
      name: "",
      entryGrade: "10ª Classe",
      course: "Ensino Secundário Geral (ESG)",
      academicYear: 2026,
      openingDate: new Date().toISOString().split("T")[0],
      gender: "M",
      birthDate: "",
      birthPlace: "",
      nationality: "Moçambicana",
      maritalStatus: "Solteiro(a)",
      idCardNumber: "",
      idCardIssuedAt: "Maputo",
      nuit: "",
      province: "Maputo Cidade",
      district: "Kamavota",
      administrativePost: "Posto Central",
      neighborhood: "",
      address: "",
      phone: "",
      email: "",
      fatherName: "",
      fatherProfession: "",
      fatherPhone: "",
      motherName: "",
      motherProfession: "",
      motherPhone: "",
      guardianName: "",
      guardianKinship: "Pai/Mãe",
      guardianProfession: "",
      guardianPhone: "",
      guardianAddress: "",
      attachedDocuments: {
        birthCertificate: true,
        idCard: true,
        qualificationsCertificate: true,
        medicalCertificate: true,
        passPhotos: true,
        residenceDeclaration: true,
        paymentProof: true,
      },
      academicHistory: [
        {
          year: 2024,
          grade: "8ª Classe",
          school: "Escola Comunitária São Pedro",
          result: "Aprovado",
        },
        {
          year: 2025,
          grade: "9ª Classe",
          school: "Escola Secundária Josina Machel",
          result: "Aprovado",
        },
      ],
      enrollmentDate: new Date().toISOString().split("T")[0],
      regime: "Diurno",
      shift: "Manhã",
      enrollmentStatus: "Activo",
      generalObservations: "",
    });

    assignClasses();
  };

  const getFinalGrade = (studentId: string, subjectId: string) => {
    const sGrades = grades.filter(
      (g) => g.studentId === studentId && g.subjectId === subjectId,
    );
    if (sGrades.length === 0) return 0;

    let sum = 0;
    sGrades.forEach((g) => {
      sum += g.media || 0;
    });

    const average = sum / 3; // Média Final over 3 trimesters
    if (average >= 9.5) {
      return Math.max(10, Math.round(average));
    }
    return Math.round(average);
  };

  const isApproved = (studentId: string) => {
    // simple logic: average of all subjects >= 9.5
    const averages = subjects.map((s) => getFinalGrade(studentId, s.id));
    const total = averages.reduce((a, b) => a + b, 0);
    const finalScore = total / (subjects.length || 1);
    return finalScore >= 9.5;
  };

  return (
    <CollapsibleSidebar
      sidebarContent={
        <SidebarMenu
          activeTab={activeTab}
          setActiveTab={(tab) => {
            setSelectedStudent(null);
            setActiveTab(tab as any);
          }}
          additionalContent={
            <div className="space-y-1">
              <button
                onClick={() => {
                  setActiveTab("enrollment");
                  setSelectedStudent(null);
                }}
                className={`w-full flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-bold transition-all ${
                  activeTab === "enrollment"
                    ? "bg-blue-50 text-blue-700"
                    : "text-slate-600 hover:bg-slate-50"
                }`}
              >
                <UserPlus className="h-4 w-4" /> Matrículas
              </button>
              <button
                onClick={() => {
                  setActiveTab("collection");
                  setSelectedStudent(null);
                }}
                className={`w-full flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-bold transition-all ${
                  activeTab === "collection"
                    ? "bg-blue-50 text-blue-700"
                    : "text-slate-600 hover:bg-slate-50"
                }`}
              >
                <FileSignature className="h-4 w-4" /> Recolha de Dados
              </button>
              <button
                onClick={() => {
                  setActiveTab("employees");
                  setSelectedStudent(null);
                }}
                className={`w-full flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-bold transition-all ${
                  activeTab === "employees"
                    ? "bg-blue-50 text-blue-700"
                    : "text-slate-600 hover:bg-slate-50"
                }`}
              >
                <Users className="h-4 w-4" /> Gestão Colaboradores
              </button>
              <button
                onClick={() => {
                  setActiveTab("certificates");
                  setSelectedStudent(null);
                }}
                className={`w-full flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-bold transition-all ${
                  activeTab === "certificates"
                    ? "bg-blue-50 text-blue-700"
                    : "text-slate-600 hover:bg-slate-50"
                }`}
              >
                <GraduationCap className="h-4 w-4" /> Certificados
              </button>
              <button
                onClick={() => {
                  setActiveTab("declarations");
                  setSelectedStudent(null);
                }}
                className={`w-full flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-bold transition-all ${
                  activeTab === "declarations"
                    ? "bg-blue-50 text-blue-700"
                    : "text-slate-600 hover:bg-slate-50"
                }`}
              >
                <FileText className="h-4 w-4" /> Declarações Notas
              </button>
            </div>
          }
        />
      }
    >
      <div className="p-8 space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
          <div>
            <h1 className="text-xl font-black text-slate-900 tracking-tight">Portal da Secretaria Geral</h1>
            <p className="text-xs text-slate-500">Sistema de Gestão Escolar e Processos Individuais</p>
          </div>
          <QuickSearchHeader
            onSelectStudent={(s) => {
              setActiveTab("enrollment");
              setSelectedStudent(s);
            }}
            onSelectClass={(c) => {
              setActiveTab("overview");
              setSelectedListClassId(c.id);
            }}
            onSelectTeacher={(e) => {
              setActiveTab("employees");
            }}
          />
        </div>

        {activeTab === "calendar" && (
          <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in">
            <AcademicCalendarComponent />
          </div>
        )}

        {["reports", "statistics", "signature", "messages"].includes(
          activeTab,
        ) && (
          <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4">
            <div className="flex flex-col items-center justify-center text-center py-32 bg-white rounded-3xl border border-slate-200 shadow-sm">
              {activeTab === "reports" && (
                <FileText size={64} className="text-slate-200 mb-6" />
              )}
              {activeTab === "statistics" && (
                <BarChart2 size={64} className="text-slate-200 mb-6" />
              )}
              {activeTab === "signature" && (
                <FileSignature size={64} className="text-slate-200 mb-6" />
              )}
              {activeTab === "messages" && (
                <MessageSquare size={64} className="text-slate-200 mb-6" />
              )}
              <h2 className="text-2xl font-black text-slate-800 uppercase tracking-tight">
                {activeTab === "reports"
                  ? "Relatórios de Secretaria"
                  : activeTab === "statistics"
                    ? "Indicadores Financeiros & Cadastro"
                    : activeTab === "signature"
                      ? "Assinaturas de Processos"
                      : "Mensagens"}
              </h2>
              <p className="text-slate-500 max-w-sm mt-2">
                Esta funcionalidade está a ser integrada com o Sistema de Gestão
                Integrada de Moçambique.
              </p>
            </div>
          </div>
        )}
        
        {activeTab === "signature" && <SignatureManager />}

        {activeTab === "overview" && <SecretariatOverview />}

        {activeTab === "collection" && (
          <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-indigo-100 text-indigo-600 rounded-lg">
                <Globe className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-slate-900">
                  Recolha de Dados Estatísticos
                </h2>
                <p className="text-sm text-slate-500">
                  Sincronização oficial com a Direção Distrital e Provincial
                </p>
              </div>
            </div>

            <div className="space-y-6">
              {collectionPeriods.filter((p) => p.status === "published")
                .length === 0 ? (
                <Card className="p-12 text-center border-dashed border-2">
                  <AlertCircle className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                  <p className="text-slate-500 font-medium">
                    Não existem períodos de recolha ativos no momento.
                  </p>
                </Card>
              ) : (
                collectionPeriods
                  .filter((p) => p.status === "published")
                  .map((period) => (
                    <CollectionFormView key={period.id} period={period} />
                  ))
              )}
            </div>
          </div>
        )}

        {activeTab === "messages" && (
          <div className="max-w-7xl mx-auto h-[calc(100vh-100px)] animate-in fade-in duration-500 flex gap-6">
            <div className="w-64 space-y-2">
              <Button className="w-full flex items-center gap-2 bg-blue-600 hover:bg-blue-700">
                <Plus size={18} /> Nova Mensagem
              </Button>
              <Button variant="ghost" className="w-full justify-start gap-2">
                <Inbox size={18} /> Entrada
              </Button>
              <Button variant="ghost" className="w-full justify-start gap-2">
                <Send size={18} /> Saída
              </Button>
            </div>
            <Card className="flex-1 p-0 overflow-hidden flex flex-col">
              <div className="p-4 border-b border-slate-200 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="bg-blue-100 p-2 rounded-full">
                    <User size={20} className="text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900">Nova Mensagem de Sistema</h3>
                    <p className="text-xs text-slate-500">Remetente: {currentUser?.name}</p>
                  </div>
                </div>
              </div>
              <div className="p-6 flex-1 flex flex-col gap-4">
                <div className="text-slate-400 text-sm italic">Nova Mensagem: Defina o assunto e o texto</div>
                <hr />
                <input className="w-full text-lg outline-none" placeholder="ASSUNTO DA MENSAGEM..." />
                <textarea className="flex-1 w-full outline-none resize-none" placeholder="Escreva aqui o conteúdo da sua mensagem..." />
                <div className="flex justify-end pt-4 border-t">
                  <Button className="bg-blue-600 hover:bg-blue-700">SELECIONAR DESTINATÁRIOS <Users size={16} className="ml-2"/></Button>
                </div>
              </div>
            </Card>
          </div>
        )}

        {activeTab === "enrollment" && (
          <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-2xl font-black text-slate-900 tracking-tight">Gestão de Matrículas e Processos</h2>
                <p className="text-xs text-slate-500">Selecione o ciclo ou turma com 1 clique para listar alunos, ou abra um novo processo individual.</p>
              </div>
              <Button
                onClick={() => setEnrollmentSubView(enrollmentSubView === 'hub' ? 'form' : 'hub')}
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold gap-2 text-xs py-2 px-4 rounded-xl shadow-md"
              >
                <UserPlus size={16} />
                {enrollmentSubView === 'hub' ? '+ Nova Matrícula / Processo Individual' : '← Voltar à Seleção de Turmas'}
              </Button>
            </div>

            {enrollmentSubView === 'hub' ? (
              <div className="space-y-6">
                {/* Cycle Filter Buttons */}
                <div className="flex flex-wrap items-center gap-3 bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Filtrar por Ciclo:</span>
                  <button
                    onClick={() => setSelectedCycleFilter('all')}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                      selectedCycleFilter === 'all' ? 'bg-blue-600 text-white shadow-md' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    Todos os Ciclos ({classes.length})
                  </button>
                  <button
                    onClick={() => setSelectedCycleFilter('1')}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                      selectedCycleFilter === '1' ? 'bg-blue-600 text-white shadow-md' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    1º Ciclo (8ª e 9ª Classe)
                  </button>
                  <button
                    onClick={() => setSelectedCycleFilter('2')}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                      selectedCycleFilter === '2' ? 'bg-blue-600 text-white shadow-md' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    2º Ciclo (10ª, 11ª e 12ª Classe)
                  </button>
                </div>

                {/* Class List Cards (1-Click Selection) */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {classes
                    .filter((c) => {
                      const isCycle1 = c.gradeLevel.includes('8') || c.gradeLevel.includes('9');
                      if (selectedCycleFilter === '1') return isCycle1;
                      if (selectedCycleFilter === '2') return !isCycle1;
                      return true;
                    })
                    .map((cls) => {
                      const classStudents = students.filter((s) => s.classId === cls.id);
                      return (
                        <Card
                          key={cls.id}
                          className="p-5 border border-slate-200 hover:border-blue-400 hover:shadow-lg transition-all cursor-pointer bg-white rounded-2xl flex flex-col justify-between group"
                          onClick={() => {
                            setSelectedListClassId(cls.id);
                            setActiveTab("overview");
                          }}
                        >
                          <div>
                            <div className="flex items-center justify-between mb-3">
                              <span className="bg-blue-50 text-blue-700 text-[11px] font-black px-2.5 py-1 rounded-lg uppercase tracking-wider">
                                {cls.gradeLevel}
                              </span>
                              <span className="text-xs font-bold text-slate-400">
                                {cls.year}
                              </span>
                            </div>
                            <h3 className="text-lg font-black text-slate-900 group-hover:text-blue-600 transition-colors">
                              {cls.name}
                            </h3>
                            <p className="text-xs text-slate-500 mt-1">
                              Período: {cls.period || 'Diurno'} • Alunos: {classStudents.length}
                            </p>
                          </div>
                          <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
                            <span className="text-xs font-bold text-blue-600 flex items-center gap-1">
                              Ver Lista de Alunos <ChevronRight size={14} />
                            </span>
                            <span className="text-[10px] bg-emerald-50 text-emerald-700 font-bold px-2 py-0.5 rounded-full">
                              Activa
                            </span>
                          </div>
                        </Card>
                      );
                    })}
                </div>
              </div>
            ) : (
              <Card className="p-0 overflow-hidden border-2 border-[#1e293b] shadow-xl bg-[#fdfbf7]">
                <div className="p-8 text-black">
                  <div className="text-center mb-8 border-b-2 border-black pb-6 relative flex flex-col items-center">
                    <img
                      src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQua66hW5lOO75LXVLwiJWQJKtgoRJzX58EUSAAc2QdYQ&s=10"
                      alt="Logotipo da República"
                      className="h-16 w-16 mb-2 object-contain"
                      referrerPolicy="no-referrer"
                    />
                    <h4 className="font-bold text-sm tracking-wider">
                      REPÚBLICA DE MOÇAMBIQUE
                    </h4>
                    <h4 className="font-bold text-xs uppercase text-gray-800">
                      MINISTÉRIO DA EDUCAÇÃO E DESENVOLVIMENTO HUMANO
                    </h4>
                    <div className="mt-2 font-bold text-base text-blue-950 underline underline-offset-4">
                      ESCOLA SECUNDÁRIA CENTRAL
                    </div>

                    <div className="mt-4 bg-slate-900 text-white px-6 py-1.5 rounded text-sm font-bold tracking-widest uppercase">
                      PROCESSO INDIVIDUAL DO ALUNO — FICHA DE CADASTRO E MATRÍCULA
                    </div>
                  </div>

                <form onSubmit={handleEnroll} className="space-y-8">
                  {/* CAPA DO PROCESSO */}
                  <div className="bg-amber-50/60 p-4 border border-amber-200 rounded-md">
                    <h3 className="font-bold text-sm uppercase text-amber-950 border-b border-amber-300 pb-1 mb-3 flex items-center gap-2">
                      <BookOpen className="h-4 w-4 text-amber-800" /> Capa do
                      Processo
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                      <div>
                        <label className="block text-xs font-bold text-gray-700 mb-1">
                          Código do Processo
                        </label>
                        <input
                          type="text"
                          placeholder="Ex: PROC-2026-0842"
                          value={newStudent.processCode}
                          onChange={(e) =>
                            setNewStudent({
                              ...newStudent,
                              processCode: e.target.value,
                            })
                          }
                          className="w-full bg-white border border-gray-300 rounded px-3 py-1.5 text-sm outline-none focus:border-blue-600"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-gray-700 mb-1">
                          Número do Aluno / Frequência
                        </label>
                        <input
                          type="text"
                          placeholder="Ex: ALU-1049"
                          value={newStudent.studentNumber}
                          onChange={(e) =>
                            setNewStudent({
                              ...newStudent,
                              studentNumber: e.target.value,
                            })
                          }
                          className="w-full bg-white border border-gray-300 rounded px-3 py-1.5 text-sm outline-none focus:border-blue-600"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-gray-700 mb-1">
                          Ano Lectivo
                        </label>
                        <input
                          type="number"
                          value={newStudent.academicYear}
                          onChange={(e) =>
                            setNewStudent({
                              ...newStudent,
                              academicYear: parseInt(e.target.value) || 2026,
                            })
                          }
                          className="w-full bg-white border border-gray-300 rounded px-3 py-1.5 text-sm outline-none focus:border-blue-600"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-gray-700 mb-1">
                          Classe de Ingresso
                        </label>
                        <select
                          value={newStudent.entryGrade}
                          onChange={(e) =>
                            setNewStudent({
                              ...newStudent,
                              entryGrade: e.target.value,
                            })
                          }
                          className="w-full bg-white border border-gray-300 rounded px-3 py-1.5 text-sm outline-none focus:border-blue-600"
                        >
                          <option value="8ª Classe">8ª Classe</option>
                          <option value="9ª Classe">9ª Classe</option>
                          <option value="10ª Classe">10ª Classe</option>
                          <option value="11ª Classe">11ª Classe</option>
                          <option value="12ª Classe">12ª Classe</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-gray-700 mb-1">
                          Curso
                        </label>
                        <input
                          type="text"
                          value={newStudent.course}
                          onChange={(e) =>
                            setNewStudent({
                              ...newStudent,
                              course: e.target.value,
                            })
                          }
                          className="w-full bg-white border border-gray-300 rounded px-3 py-1.5 text-sm outline-none focus:border-blue-600"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-gray-700 mb-1">
                          Data de Abertura do Processo
                        </label>
                        <input
                          type="date"
                          value={newStudent.openingDate}
                          onChange={(e) =>
                            setNewStudent({
                              ...newStudent,
                              openingDate: e.target.value,
                            })
                          }
                          className="w-full bg-white border border-gray-300 rounded px-3 py-1.5 text-sm outline-none focus:border-blue-600"
                        />
                      </div>
                    </div>
                  </div>

                  {/* 1. IDENTIFICAÇÃO DO ALUNO */}
                  <div className="border-t border-gray-300 pt-4">
                    <h3 className="font-bold text-base text-gray-900 mb-3 uppercase tracking-wide">
                      1. IDENTIFICAÇÃO DO ALUNO
                    </h3>

                    <div className="space-y-4">
                      <div className="bg-gray-50 p-4 border border-gray-200 rounded">
                        <h4 className="font-bold text-xs uppercase text-gray-600 mb-3">
                          Dados Pessoais
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-12 gap-3 text-sm">
                          <div className="md:col-span-8">
                            <label className="block text-xs font-semibold text-gray-700 mb-1">
                              Nome Completo *
                            </label>
                            <input
                              required
                              value={newStudent.name}
                              onChange={(e) =>
                                setNewStudent({
                                  ...newStudent,
                                  name: e.target.value,
                                })
                              }
                              placeholder="Nome completo do estudante"
                              className="w-full bg-white border border-gray-300 rounded px-3 py-1.5 text-sm outline-none focus:border-blue-600"
                            />
                          </div>
                          <div className="md:col-span-4">
                            <label className="block text-xs font-semibold text-gray-700 mb-1">
                              Sexo *
                            </label>
                            <select
                              value={newStudent.gender}
                              onChange={(e) =>
                                setNewStudent({
                                  ...newStudent,
                                  gender: e.target.value,
                                })
                              }
                              className="w-full bg-white border border-gray-300 rounded px-3 py-1.5 text-sm outline-none focus:border-blue-600"
                            >
                              <option value="M">Masculino (H)</option>
                              <option value="F">Feminino (M)</option>
                            </select>
                          </div>

                          <div className="md:col-span-4">
                            <label className="block text-xs font-semibold text-gray-700 mb-1">
                              Data de Nascimento *
                            </label>
                            <input
                              type="date"
                              required
                              value={newStudent.birthDate}
                              onChange={(e) =>
                                setNewStudent({
                                  ...newStudent,
                                  birthDate: e.target.value,
                                })
                              }
                              className="w-full bg-white border border-gray-300 rounded px-3 py-1.5 text-sm outline-none focus:border-blue-600"
                            />
                          </div>
                          <div className="md:col-span-4">
                            <label className="block text-xs font-semibold text-gray-700 mb-1">
                              Naturalidade
                            </label>
                            <input
                              value={newStudent.birthPlace}
                              placeholder="Cidade / Local de Nasc."
                              onChange={(e) =>
                                setNewStudent({
                                  ...newStudent,
                                  birthPlace: e.target.value,
                                })
                              }
                              className="w-full bg-white border border-gray-300 rounded px-3 py-1.5 text-sm outline-none focus:border-blue-600"
                            />
                          </div>
                          <div className="md:col-span-4">
                            <label className="block text-xs font-semibold text-gray-700 mb-1">
                              Nacionalidade
                            </label>
                            <input
                              value={newStudent.nationality}
                              onChange={(e) =>
                                setNewStudent({
                                  ...newStudent,
                                  nationality: e.target.value,
                                })
                              }
                              className="w-full bg-white border border-gray-300 rounded px-3 py-1.5 text-sm outline-none focus:border-blue-600"
                            />
                          </div>

                          <div className="md:col-span-3">
                            <label className="block text-xs font-semibold text-gray-700 mb-1">
                              Estado Civil
                            </label>
                            <input
                              value={newStudent.maritalStatus}
                              onChange={(e) =>
                                setNewStudent({
                                  ...newStudent,
                                  maritalStatus: e.target.value,
                                })
                              }
                              className="w-full bg-white border border-gray-300 rounded px-3 py-1.5 text-sm outline-none focus:border-blue-600"
                            />
                          </div>
                          <div className="md:col-span-3">
                            <label className="block text-xs font-semibold text-gray-700 mb-1">
                              BI / Documento n.º
                            </label>
                            <input
                              value={newStudent.idCardNumber}
                              placeholder="110100234567M"
                              onChange={(e) =>
                                setNewStudent({
                                  ...newStudent,
                                  idCardNumber: e.target.value,
                                })
                              }
                              className="w-full bg-white border border-gray-300 rounded px-3 py-1.5 text-sm outline-none focus:border-blue-600"
                            />
                          </div>
                          <div className="md:col-span-3">
                            <label className="block text-xs font-semibold text-gray-700 mb-1">
                              Emitido em
                            </label>
                            <input
                              value={newStudent.idCardIssuedAt}
                              placeholder="Maputo"
                              onChange={(e) =>
                                setNewStudent({
                                  ...newStudent,
                                  idCardIssuedAt: e.target.value,
                                })
                              }
                              className="w-full bg-white border border-gray-300 rounded px-3 py-1.5 text-sm outline-none focus:border-blue-600"
                            />
                          </div>
                          <div className="md:col-span-3">
                            <label className="block text-xs font-semibold text-gray-700 mb-1">
                              NUIT
                            </label>
                            <input
                              value={newStudent.nuit}
                              placeholder="123456789"
                              onChange={(e) =>
                                setNewStudent({
                                  ...newStudent,
                                  nuit: e.target.value,
                                })
                              }
                              className="w-full bg-white border border-gray-300 rounded px-3 py-1.5 text-sm outline-none focus:border-blue-600"
                            />
                          </div>
                        </div>
                      </div>

                      <div className="bg-gray-50 p-4 border border-gray-200 rounded">
                        <h4 className="font-bold text-xs uppercase text-gray-600 mb-3">
                          Endereço e Contactos
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-12 gap-3 text-sm">
                          <div className="md:col-span-3">
                            <label className="block text-xs font-semibold text-gray-700 mb-1">
                              Província
                            </label>
                            <select
                              value={newStudent.province}
                              onChange={(e) => {
                                const prov = e.target.value;
                                const dList = getDistrictsForProvince(prov);
                                setNewStudent({
                                  ...newStudent,
                                  province: prov,
                                  district: dList[0] || "",
                                });
                              }}
                              className="w-full bg-white border border-gray-300 rounded px-3 py-1.5 text-sm outline-none focus:border-blue-600"
                            >
                              {MOZAMBIQUE_PROVINCES.map((p) => (
                                <option key={p.province} value={p.province}>{p.province}</option>
                              ))}
                            </select>
                          </div>
                          <div className="md:col-span-3">
                            <label className="block text-xs font-semibold text-gray-700 mb-1">
                              Distrito
                            </label>
                            <select
                              value={newStudent.district}
                              onChange={(e) =>
                                setNewStudent({
                                  ...newStudent,
                                  district: e.target.value,
                                })
                              }
                              className="w-full bg-white border border-gray-300 rounded px-3 py-1.5 text-sm outline-none focus:border-blue-600"
                            >
                              {getDistrictsForProvince(newStudent.province).map((d) => (
                                <option key={d} value={d}>{d}</option>
                              ))}
                            </select>
                          </div>
                          <div className="md:col-span-3">
                            <label className="block text-xs font-semibold text-gray-700 mb-1">
                              Posto Administrativo
                            </label>
                            <select
                              value={newStudent.administrativePost}
                              onChange={(e) =>
                                setNewStudent({
                                  ...newStudent,
                                  administrativePost: e.target.value,
                                })
                              }
                              className="w-full bg-white border border-gray-300 rounded px-3 py-1.5 text-sm outline-none focus:border-blue-600"
                            >
                              <option value="Posto Central">Posto Central</option>
                              <option value="Posto Urbano 1">Posto Urbano 1</option>
                              <option value="Posto Urbano 2">Posto Urbano 2</option>
                              <option value="Posto Periférico">Posto Periférico</option>
                              <option value="Posto Sede">Posto Sede</option>
                            </select>
                          </div>
                          <div className="md:col-span-3">
                            <label className="block text-xs font-semibold text-gray-700 mb-1">
                              Bairro
                            </label>
                            <select
                              value={newStudent.neighborhood}
                              onChange={(e) =>
                                setNewStudent({
                                  ...newStudent,
                                  neighborhood: e.target.value,
                                })
                              }
                              className="w-full bg-white border border-gray-300 rounded px-3 py-1.5 text-sm outline-none focus:border-blue-600"
                            >
                              <option value="">Selecione o Bairro...</option>
                              <option value="Central">Central</option>
                              <option value="Polana Cimento">Polana Cimento</option>
                              <option value="Alto Maé">Alto Maé</option>
                              <option value="Malhangalene">Malhangalene</option>
                              <option value="Sommerschield">Sommerschield</option>
                              <option value="Mavalane">Mavalane</option>
                              <option value="Chamanculo">Chamanculo</option>
                              <option value="Aeroporto">Aeroporto</option>
                              <option value="Zimpeto">Zimpeto</option>
                              <option value="Costa do Sol">Costa do Sol</option>
                              <option value="Fomento">Fomento</option>
                              <option value="Matola-Gare">Matola-Gare</option>
                              <option value="Outro">Outro</option>
                            </select>
                          </div>

                          <div className="md:col-span-6">
                            <label className="block text-xs font-semibold text-gray-700 mb-1">
                              Morada / Rua / Q.
                            </label>
                            <input
                              value={newStudent.address}
                              placeholder="Av. Julius Nyerere, Quarteirão 12"
                              onChange={(e) =>
                                setNewStudent({
                                  ...newStudent,
                                  address: e.target.value,
                                })
                              }
                              className="w-full bg-white border border-gray-300 rounded px-3 py-1.5 text-sm outline-none focus:border-blue-600"
                            />
                          </div>
                          <div className="md:col-span-3">
                            <label className="block text-xs font-semibold text-gray-700 mb-1">
                              Contacto Telefónico
                            </label>
                            <input
                              value={newStudent.phone}
                              placeholder="+258 84 123 4567"
                              onChange={(e) =>
                                setNewStudent({
                                  ...newStudent,
                                  phone: e.target.value,
                                })
                              }
                              className="w-full bg-white border border-gray-300 rounded px-3 py-1.5 text-sm outline-none focus:border-blue-600"
                            />
                          </div>
                          <div className="md:col-span-3">
                            <label className="block text-xs font-semibold text-gray-700 mb-1">
                              E-mail
                            </label>
                            <input
                              type="email"
                              value={newStudent.email}
                              placeholder="estudante@email.com"
                              onChange={(e) =>
                                setNewStudent({
                                  ...newStudent,
                                  email: e.target.value,
                                })
                              }
                              className="w-full bg-white border border-gray-300 rounded px-3 py-1.5 text-sm outline-none focus:border-blue-600"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* 2. FILIAÇÃO */}
                  <div className="border-t border-gray-300 pt-4">
                    <h3 className="font-bold text-base text-gray-900 mb-3 uppercase tracking-wide">
                      2. FILIAÇÃO
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                      {/* Pai */}
                      <div className="bg-gray-50 p-3.5 border border-gray-200 rounded space-y-2.5">
                        <h4 className="font-bold text-xs uppercase text-gray-800">
                          Pai
                        </h4>
                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-0.5">
                            Nome do Pai
                          </label>
                          <input
                            value={newStudent.fatherName}
                            onChange={(e) =>
                              setNewStudent({
                                ...newStudent,
                                fatherName: e.target.value,
                              })
                            }
                            className="w-full bg-white border border-gray-300 rounded px-2.5 py-1 text-sm outline-none focus:border-blue-600"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-0.5">
                            Profissão
                          </label>
                          <input
                            value={newStudent.fatherProfession}
                            onChange={(e) =>
                              setNewStudent({
                                ...newStudent,
                                fatherProfession: e.target.value,
                              })
                            }
                            className="w-full bg-white border border-gray-300 rounded px-2.5 py-1 text-sm outline-none focus:border-blue-600"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-0.5">
                            Contacto Telefónico
                          </label>
                          <input
                            value={newStudent.fatherPhone}
                            placeholder="+258 82 000 0000"
                            onChange={(e) =>
                              setNewStudent({
                                ...newStudent,
                                fatherPhone: e.target.value,
                              })
                            }
                            className="w-full bg-white border border-gray-300 rounded px-2.5 py-1 text-sm outline-none focus:border-blue-600"
                          />
                        </div>
                      </div>

                      {/* Mãe */}
                      <div className="bg-gray-50 p-3.5 border border-gray-200 rounded space-y-2.5">
                        <h4 className="font-bold text-xs uppercase text-gray-800">
                          Mãe
                        </h4>
                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-0.5">
                            Nome da Mãe
                          </label>
                          <input
                            value={newStudent.motherName}
                            onChange={(e) =>
                              setNewStudent({
                                ...newStudent,
                                motherName: e.target.value,
                              })
                            }
                            className="w-full bg-white border border-gray-300 rounded px-2.5 py-1 text-sm outline-none focus:border-blue-600"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-0.5">
                            Profissão
                          </label>
                          <input
                            value={newStudent.motherProfession}
                            onChange={(e) =>
                              setNewStudent({
                                ...newStudent,
                                motherProfession: e.target.value,
                              })
                            }
                            className="w-full bg-white border border-gray-300 rounded px-2.5 py-1 text-sm outline-none focus:border-blue-600"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-0.5">
                            Contacto Telefónico
                          </label>
                          <input
                            value={newStudent.motherPhone}
                            placeholder="+258 84 000 0000"
                            onChange={(e) =>
                              setNewStudent({
                                ...newStudent,
                                motherPhone: e.target.value,
                              })
                            }
                            className="w-full bg-white border border-gray-300 rounded px-2.5 py-1 text-sm outline-none focus:border-blue-600"
                          />
                        </div>
                      </div>

                      {/* Encarregado */}
                      <div className="bg-blue-50/50 p-3.5 border border-blue-200 rounded space-y-2.5">
                        <h4 className="font-bold text-xs uppercase text-blue-900">
                          Encarregado de Educação
                        </h4>
                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-0.5">
                            Nome do Encarregado
                          </label>
                          <input
                            value={newStudent.guardianName}
                            onChange={(e) =>
                              setNewStudent({
                                ...newStudent,
                                guardianName: e.target.value,
                              })
                            }
                            className="w-full bg-white border border-gray-300 rounded px-2.5 py-1 text-sm outline-none focus:border-blue-600"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-0.5">
                            Grau de Parentesco
                          </label>
                          <input
                            value={newStudent.guardianKinship}
                            placeholder="Pai, Mãe, Tio(a), etc."
                            onChange={(e) =>
                              setNewStudent({
                                ...newStudent,
                                guardianKinship: e.target.value,
                              })
                            }
                            className="w-full bg-white border border-gray-300 rounded px-2.5 py-1 text-sm outline-none focus:border-blue-600"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-0.5">
                            Profissão / Contacto
                          </label>
                          <div className="grid grid-cols-2 gap-2">
                            <input
                              placeholder="Profissão"
                              value={newStudent.guardianProfession}
                              onChange={(e) =>
                                setNewStudent({
                                  ...newStudent,
                                  guardianProfession: e.target.value,
                                })
                              }
                              className="w-full bg-white border border-gray-300 rounded px-2 py-1 text-xs outline-none focus:border-blue-600"
                            />
                            <input
                              placeholder="Telefone"
                              value={newStudent.guardianPhone}
                              onChange={(e) =>
                                setNewStudent({
                                  ...newStudent,
                                  guardianPhone: e.target.value,
                                })
                              }
                              className="w-full bg-white border border-gray-300 rounded px-2 py-1 text-xs outline-none focus:border-blue-600"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* 3. DOCUMENTOS ANEXOS */}
                  <div className="border-t border-gray-300 pt-4">
                    <h3 className="font-bold text-base text-gray-900 mb-3 uppercase tracking-wide">
                      3. DOCUMENTOS ANEXOS
                    </h3>
                    <div className="border border-gray-300 rounded overflow-hidden">
                      <table className="w-full text-sm">
                        <thead className="bg-gray-100 text-gray-700 border-b border-gray-300">
                          <tr>
                            <th className="py-2 px-3 text-left w-12 font-bold">
                              N.º
                            </th>
                            <th className="py-2 px-3 text-left font-bold">
                              Documento
                            </th>
                            <th className="py-2 px-3 text-center w-24 font-bold">
                              Entregue
                            </th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 bg-white">
                          {[
                            {
                              key: "birthCertificate",
                              name: "Cópia da Certidão de Nascimento / Assento de Nascimento",
                              num: 1,
                            },
                            {
                              key: "idCard",
                              name: "Cópia do Bilhete de Identidade (BI) / Passaporte / DIRE",
                              num: 2,
                            },
                            {
                              key: "qualificationsCertificate",
                              name: "Certificado de Habilitações Literárias da classe anterior",
                              num: 3,
                            },
                            {
                              key: "medicalCertificate",
                              name: "Atestado Médico de Sanidade Mental e Física",
                              num: 4,
                            },
                            {
                              key: "passPhotos",
                              name: "2 Fotografias tipo passe",
                              num: 5,
                            },
                            {
                              key: "residenceDeclaration",
                              name: "Declaração de Residência / Comprovativo de Bairro",
                              num: 6,
                            },
                            {
                              key: "paymentProof",
                              name: "Comprovativo de Pagamento de Taxa de Matrícula",
                              num: 7,
                            },
                          ].map((doc) => (
                            <tr key={doc.key} className="hover:bg-gray-50">
                              <td className="py-2 px-3 text-gray-500 font-mono text-center">
                                {doc.num}
                              </td>
                              <td className="py-2 px-3 text-gray-800">
                                {doc.name}
                              </td>
                              <td className="py-2 px-3 text-center">
                                <input
                                  type="checkbox"
                                  checked={
                                    !!newStudent.attachedDocuments[
                                      doc.key as keyof typeof newStudent.attachedDocuments
                                    ]
                                  }
                                  onChange={(e) =>
                                    setNewStudent({
                                      ...newStudent,
                                      attachedDocuments: {
                                        ...newStudent.attachedDocuments,
                                        [doc.key]: e.target.checked,
                                      },
                                    })
                                  }
                                  className="h-4 w-4 text-blue-600 rounded cursor-pointer"
                                />
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* 4. HISTÓRICO ACADÉMICO */}
                  <div className="border-t border-gray-300 pt-4">
                    <h3 className="font-bold text-base text-gray-900 mb-3 uppercase tracking-wide">
                      4. HISTÓRICO ACADÉMICO
                    </h3>
                    <div className="border border-gray-300 rounded overflow-hidden">
                      <table className="w-full text-sm">
                        <thead className="bg-gray-100 text-gray-700 border-b border-gray-300">
                          <tr>
                            <th className="py-2 px-3 text-center w-28 font-bold">
                              Ano
                            </th>
                            <th className="py-2 px-3 text-center w-32 font-bold">
                              Classe
                            </th>
                            <th className="py-2 px-3 text-left font-bold">
                              Escola
                            </th>
                            <th className="py-2 px-3 text-center w-32 font-bold">
                              Resultado
                            </th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 bg-white">
                          {newStudent.academicHistory.map((hist, idx) => (
                            <tr key={idx}>
                              <td className="py-2 px-2">
                                <input
                                  type="number"
                                  value={hist.year}
                                  onChange={(e) => {
                                    const updated = [
                                      ...newStudent.academicHistory,
                                    ];
                                    updated[idx].year =
                                      parseInt(e.target.value) || 2024;
                                    setNewStudent({
                                      ...newStudent,
                                      academicHistory: updated,
                                    });
                                  }}
                                  className="w-full text-center border border-gray-300 rounded py-1 text-sm"
                                />
                              </td>
                              <td className="py-2 px-2">
                                <input
                                  value={hist.grade}
                                  onChange={(e) => {
                                    const updated = [
                                      ...newStudent.academicHistory,
                                    ];
                                    updated[idx].grade = e.target.value;
                                    setNewStudent({
                                      ...newStudent,
                                      academicHistory: updated,
                                    });
                                  }}
                                  className="w-full text-center border border-gray-300 rounded py-1 text-sm"
                                />
                              </td>
                              <td className="py-2 px-2">
                                <input
                                  value={hist.school}
                                  onChange={(e) => {
                                    const updated = [
                                      ...newStudent.academicHistory,
                                    ];
                                    updated[idx].school = e.target.value;
                                    setNewStudent({
                                      ...newStudent,
                                      academicHistory: updated,
                                    });
                                  }}
                                  className="w-full border border-gray-300 rounded px-2 py-1 text-sm"
                                />
                              </td>
                              <td className="py-2 px-2">
                                <select
                                  value={hist.result}
                                  onChange={(e) => {
                                    const updated = [
                                      ...newStudent.academicHistory,
                                    ];
                                    updated[idx].result = e.target.value;
                                    setNewStudent({
                                      ...newStudent,
                                      academicHistory: updated,
                                    });
                                  }}
                                  className="w-full text-center border border-gray-300 rounded py-1 text-sm"
                                >
                                  <option value="Aprovado">Aprovado</option>
                                  <option value="Reprovado">Reprovado</option>
                                  <option value="Transferido">
                                    Transferido
                                  </option>
                                </select>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* 5. MATRÍCULA */}
                  <div className="border-t border-gray-300 pt-4">
                    <h3 className="font-bold text-base text-gray-900 mb-3 uppercase tracking-wide">
                      5. MATRÍCULA
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm bg-gray-50 p-4 border border-gray-200 rounded">
                      <div>
                        <label className="block text-xs font-semibold text-gray-700 mb-1">
                          Data da Matrícula
                        </label>
                        <input
                          type="date"
                          value={newStudent.enrollmentDate}
                          onChange={(e) =>
                            setNewStudent({
                              ...newStudent,
                              enrollmentDate: e.target.value,
                            })
                          }
                          className="w-full bg-white border border-gray-300 rounded px-3 py-1.5 text-sm outline-none focus:border-blue-600"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-gray-700 mb-1">
                          Regime
                        </label>
                        <select
                          value={newStudent.regime}
                          onChange={(e) =>
                            setNewStudent({
                              ...newStudent,
                              regime: e.target.value,
                            })
                          }
                          className="w-full bg-white border border-gray-300 rounded px-3 py-1.5 text-sm outline-none focus:border-blue-600"
                        >
                          <option value="Diurno">Diurno</option>
                          <option value="Nocturno">Nocturno</option>
                          <option value="EaD (À Distância)">
                            EaD (À Distância)
                          </option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-gray-700 mb-1">
                          Turno
                        </label>
                        <select
                          value={newStudent.shift}
                          onChange={(e) =>
                            setNewStudent({
                              ...newStudent,
                              shift: e.target.value,
                            })
                          }
                          className="w-full bg-white border border-gray-300 rounded px-3 py-1.5 text-sm outline-none focus:border-blue-600"
                        >
                          <option value="Manhã">Manhã (1º Turno)</option>
                          <option value="Tarde">Tarde (2º Turno)</option>
                          <option value="Noite">Noite (3º Turno)</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-gray-700 mb-1">
                          Situação Inicial
                        </label>
                        <select
                          value={newStudent.enrollmentStatus}
                          onChange={(e) =>
                            setNewStudent({
                              ...newStudent,
                              enrollmentStatus: e.target.value as any,
                            })
                          }
                          className="w-full bg-white border border-gray-300 rounded px-3 py-1.5 text-sm outline-none focus:border-blue-600 font-semibold text-green-700"
                        >
                          <option value="Activo">Activo</option>
                          <option value="Transferido">Transferido</option>
                          <option value="Desistente">Desistente</option>
                          <option value="Concluído">Concluído</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* 10. OBSERVAÇÕES GERAIS */}
                  <div className="border-t border-gray-300 pt-4">
                    <h3 className="font-bold text-base text-gray-900 mb-2 uppercase tracking-wide">
                      10. OBSERVAÇÕES GERAIS
                    </h3>
                    <textarea
                      rows={3}
                      value={newStudent.generalObservations}
                      onChange={(e) =>
                        setNewStudent({
                          ...newStudent,
                          generalObservations: e.target.value,
                        })
                      }
                      placeholder="Registo de observações adicionais relativas à matrícula, saúde, acompanhamento psicopedagógico ou transferências..."
                      className="w-full bg-white border border-gray-300 rounded p-3 text-sm outline-none focus:border-blue-600"
                    />
                  </div>

                  <div className="pt-6 flex justify-end border-t border-gray-300">
                    <Button
                      type="submit"
                      className="bg-emerald-700 hover:bg-emerald-800 text-white font-medium px-8 py-3 text-base rounded shadow-md flex items-center gap-2"
                    >
                      <UserPlus className="h-5 w-5" /> Registar e Abrir Processo
                      Individual
                    </Button>
                  </div>
                </form>
              </div>
            </Card>
            )}

            <Card className="p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4 border-b pb-2">
                Lista de Alunos (Processos)
              </h3>
              {!selectedListClassId ? (
                <div className="space-y-6">
                  {Object.entries(
                    classes.reduce(
                      (acc, c) => {
                        if (!acc[c.year]) acc[c.year] = {};
                        if (!acc[c.year][c.gradeLevel])
                          acc[c.year][c.gradeLevel] = [];
                        acc[c.year][c.gradeLevel].push(c);
                        return acc;
                      },
                      {} as Record<number, Record<string, typeof classes>>,
                    ),
                  )
                    .sort((a, b) => Number(b[0]) - Number(a[0]))
                    .map(([year, grades]) => (
                      <div key={year}>
                        <h4 className="font-bold text-gray-800 text-lg mb-3">
                          Ano Letivo: {year}
                        </h4>
                        <div className="space-y-4 pl-4 border-l-2 border-gray-200">
                          {Object.entries(grades).map(
                            ([gradeLevel, turmas]) => (
                              <div key={gradeLevel}>
                                <h5 className="font-semibold text-gray-700 mb-2">
                                  Classe: {gradeLevel}
                                </h5>
                                <div className="flex flex-wrap gap-3">
                                  {turmas.map((t) => (
                                    <button
                                      key={t.id}
                                      onClick={() =>
                                        setSelectedListClassId(t.id)
                                      }
                                      className="px-4 py-2 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-blue-50 hover:border-blue-300 text-sm font-medium text-gray-800 transition-colors"
                                    >
                                      {t.name}
                                    </button>
                                  ))}
                                </div>
                              </div>
                            ),
                          )}
                        </div>
                      </div>
                    ))}

                  {students.some((s) => !s.classId) && (
                    <div className="mt-8">
                      <h4 className="font-bold text-red-600 text-lg mb-3">
                        Alunos Pendentes de Turma
                      </h4>
                      <button
                        onClick={() => setSelectedListClassId("pending")}
                        className="px-4 py-2 bg-red-50 border border-red-200 text-red-700 rounded-md shadow-sm hover:bg-red-100 text-sm font-medium transition-colors"
                      >
                        Ver Alunos Pendentes (
                        {students.filter((s) => !s.classId).length})
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex justify-between items-center mb-4">
                    <h4 className="font-bold text-gray-900 text-lg">
                      {selectedListClassId === "pending"
                        ? "Alunos Pendentes de Turma"
                        : `Alunos: ${classes.find((c) => c.id === selectedListClassId)?.name} (${classes.find((c) => c.id === selectedListClassId)?.gradeLevel} - ${classes.find((c) => c.id === selectedListClassId)?.year})`}
                    </h4>
                    <Button
                      variant="outline"
                      onClick={() => setSelectedListClassId(null)}
                    >
                      Voltar aos Grupos
                    </Button>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                            Nome
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                            Nascimento
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                            Data de Matrícula
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {students
                          .filter((s) =>
                            selectedListClassId === "pending"
                              ? !s.classId
                              : s.classId === selectedListClassId,
                          )
                          .map((s) => (
                            <tr key={s.id}>
                              <td
                                className="px-6 py-4 whitespace-nowrap text-sm font-medium text-blue-600 hover:underline cursor-pointer"
                                onClick={() => setSelectedStudent(s)}
                              >
                                {s.name}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {s.birthDate}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {s.enrollmentDate}
                              </td>
                            </tr>
                          ))}
                        {students.filter((s) =>
                          selectedListClassId === "pending"
                            ? !s.classId
                            : s.classId === selectedListClassId,
                        ).length === 0 && (
                          <tr>
                            <td
                              colSpan={3}
                              className="px-6 py-8 text-center text-sm text-gray-500"
                            >
                              Nenhum aluno encontrado nesta turma.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </Card>

            {/* STUDENT PROCESSO INDIVIDUAL VIEW MODAL */}
            {selectedStudent && activeTab === "enrollment" && (
              <StudentProcessDocument
                student={selectedStudent}
                schoolName="Escola Secundária Central"
                classes={classes}
                subjects={subjects}
                grades={grades}
                onClose={() => setSelectedStudent(null)}
              />
            )}
          </div>
        )}

        {activeTab === "employees" && <EmployeeManagement />}

        {activeTab === "certificates" && (
          <div className="max-w-5xl mx-auto space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gray-200 pb-4">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                  <Award className="h-6 w-6 text-amber-600" />
                  Emissão de Certificados
                </h2>
                <p className="text-sm text-gray-500 mt-0.5">
                  Matriz Oficial MINEDH • Classes de Conclusão / Exame:{" "}
                  <strong>3.ª Classe</strong>, <strong>6.ª Classe</strong> e{" "}
                  <strong>9.ª Classe</strong>
                </p>
              </div>
              <div className="inline-flex items-center gap-1 text-xs px-3 py-1.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200 font-medium">
                <CheckCircle className="h-3.5 w-3.5 text-amber-600" />
                Selo Branco • Marca d'Água 30% • QR Code • 4 Exemplares
              </div>
            </div>

            {!selectedStudent ? (
              <Card className="p-6 shadow-sm border border-gray-200">
                {/* Filtros Superiores conforme imagem da solicitação */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Ano Letivo / Conclusão
                    </label>
                    <select
                      value={certYear}
                      onChange={(e) => setCertYear(Number(e.target.value))}
                      className="block w-full rounded-md border-gray-300 border px-3 py-2 text-sm focus:border-amber-500 focus:ring-amber-500 bg-white"
                    >
                      <option value={2026}>2026</option>
                      <option value={2025}>2025</option>
                      <option value={2024}>2024</option>
                      <option value={2023}>2023</option>
                      <option value={2022}>2022</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Classe
                    </label>
                    <select
                      value={certGradeFilter}
                      onChange={(e) => {
                        setCertGradeFilter(e.target.value);
                        setSelectedClass("");
                      }}
                      className="block w-full rounded-md border-gray-300 border px-3 py-2 text-sm focus:border-amber-500 focus:ring-amber-500 bg-white"
                    >
                      <option value="all">
                        Todas as Classes de Certificado
                      </option>
                      <option value="3.ª Classe">
                        3.ª Classe (Ensino Primário 1º Ciclo)
                      </option>
                      <option value="6.ª Classe">
                        6.ª Classe (Ensino Primário 2º Ciclo)
                      </option>
                      <option value="9.ª Classe">
                        9.ª Classe (Ensino Básico / 1º Ciclo ESG)
                      </option>
                      <option value="10ª Classe">10ª Classe (ESG Geral)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Turma
                    </label>
                    <select
                      className="block w-full rounded-md border-gray-300 border px-3 py-2 text-sm focus:border-amber-500 focus:ring-amber-500 bg-white"
                      value={selectedClass}
                      onChange={(e) => setSelectedClass(e.target.value)}
                    >
                      <option value="">Selecione...</option>
                      {classes
                        .filter(
                          (c) =>
                            certGradeFilter === "all" ||
                            c.gradeLevel === certGradeFilter,
                        )
                        .map((c) => (
                          <option key={c.id} value={c.id}>
                            {c.name} ({c.gradeLevel})
                          </option>
                        ))}
                    </select>
                  </div>
                </div>

                {/* Campo "Nome do Aluno" com pesquisa em tempo real conforme destacado na imagem */}
                <div className="mb-6 pt-2">
                  <label className="block text-sm font-medium text-gray-900 mb-1">
                    Nome do Aluno
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                      <Search className="h-4 w-4" />
                    </div>
                    <input
                      type="text"
                      value={certStudentSearch}
                      onChange={(e) => setCertStudentSearch(e.target.value)}
                      placeholder="Pesquisar o nome do aluno"
                      className="block w-full pl-9 pr-4 py-2.5 border border-gray-300 rounded-md text-sm placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all bg-white"
                    />
                  </div>
                </div>

                {/* Lista de Alunos Filtrada para Certificado */}
                {(() => {
                  const filtered = students.filter((s) => {
                    // Match class if selected
                    if (selectedClass && s.classId !== selectedClass)
                      return false;
                    // Match grade level if class filter is specific and no specific class selected
                    if (!selectedClass && certGradeFilter !== "all") {
                      const studentClass = classes.find(
                        (c) => c.id === s.classId,
                      );
                      if (
                        studentClass?.gradeLevel !== certGradeFilter &&
                        s.entryGrade !== certGradeFilter
                      )
                        return false;
                    }
                    // Match search query
                    if (certStudentSearch.trim()) {
                      const q = certStudentSearch.toLowerCase();
                      const matchName = s.name.toLowerCase().includes(q);
                      const matchId = s.id.toLowerCase().includes(q);
                      const matchProcess = s.processCode
                        ?.toLowerCase()
                        .includes(q);
                      if (!matchName && !matchId && !matchProcess) return false;
                    }
                    return true;
                  });

                  return (
                    <div className="border border-gray-200 rounded-lg overflow-hidden divide-y divide-gray-200 bg-white">
                      <div className="bg-gray-50 px-4 py-3 flex items-center justify-between text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        <span>Aluno / Identificação</span>
                        <span>Classe & Turma</span>
                        <span className="text-right">Ação / Certificação</span>
                      </div>

                      {filtered.length > 0 ? (
                        filtered.map((student) => {
                          const studentClass = classes.find(
                            (c) => c.id === student.classId,
                          );
                          const approved = isApproved(student.id);

                          return (
                            <div
                              key={student.id}
                              className="flex flex-col sm:flex-row sm:items-center justify-between p-4 hover:bg-amber-50/40 transition-colors gap-3"
                            >
                              <div className="space-y-0.5">
                                <div className="flex items-center gap-2">
                                  <p className="font-semibold text-gray-900">
                                    {student.name}
                                  </p>
                                  {approved ? (
                                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-emerald-100 text-emerald-800">
                                      Apto / Concluído
                                    </span>
                                  ) : (
                                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-amber-100 text-amber-800">
                                      Em Avaliação
                                    </span>
                                  )}
                                </div>
                                <p className="text-xs text-gray-500 font-mono">
                                  Nº Aluno:{" "}
                                  {student.studentNumber || student.id} |
                                  Processo:{" "}
                                  {student.processCode || `PROC-${student.id}`}
                                </p>
                              </div>

                              <div className="text-xs text-gray-600 font-medium">
                                {studentClass
                                  ? `${studentClass.gradeLevel} - ${studentClass.name}`
                                  : student.entryGrade || "Sem Turma"}
                              </div>

                              <div className="flex items-center gap-2">
                                <Button
                                  variant="primary"
                                  onClick={() => setSelectedStudent(student)}
                                  className="bg-amber-600 hover:bg-amber-700 text-white text-xs gap-1.5 shadow-sm"
                                >
                                  <Award className="h-4 w-4" /> Gerar
                                  Certificado
                                </Button>
                              </div>
                            </div>
                          );
                        })
                      ) : (
                        <div className="p-8 text-center text-sm text-gray-500">
                          Nenhum aluno encontrado para os filtros selecionados.
                        </div>
                      )}
                    </div>
                  );
                })()}
              </Card>
            ) : (
              <CertificateDocument
                student={selectedStudent}
                schoolClass={classes.find(
                  (c) => c.id === selectedStudent.classId,
                )}
                schoolName="Escola Secundária Central"
                subjects={subjects}
                grades={grades}
                academicYear={certYear}
                onClose={() => setSelectedStudent(null)}
              />
            )}
          </div>
        )}

        {activeTab === "declarations" && (
          <div className="max-w-5xl mx-auto space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gray-200 pb-4">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                  <FileText className="h-6 w-6 text-blue-600" />
                  Declarações com Notas
                </h2>
                <p className="text-sm text-gray-500 mt-0.5">
                  Matriz Oficial MINEDH • Classes de Transição / Frequência:{" "}
                  <strong>
                    1.ª, 2.ª, 4.ª, 5.ª, 7.ª, 8.ª, 10.ª, 11.ª Classe
                  </strong>
                </p>
              </div>
              <div className="inline-flex items-center gap-1 text-xs px-3 py-1.5 rounded-full bg-blue-50 text-blue-800 border border-blue-200 font-medium">
                <CheckCircle className="h-3.5 w-3.5 text-blue-600" />
                Classificações Trimestrais • Situação Transitou/Não Transitou •
                3 Exemplares
              </div>
            </div>

            {!selectedStudent ? (
              <Card className="p-6 shadow-sm border border-gray-200">
                {/* Filtros Superiores conforme padrão oficial */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Ano Letivo
                    </label>
                    <select
                      value={declYear}
                      onChange={(e) => setDeclYear(Number(e.target.value))}
                      className="block w-full rounded-md border-gray-300 border px-3 py-2 text-sm focus:border-blue-500 focus:ring-blue-500 bg-white"
                    >
                      <option value={2026}>2026</option>
                      <option value={2025}>2025</option>
                      <option value={2024}>2024</option>
                      <option value={2023}>2023</option>
                      <option value={2022}>2022</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Classe
                    </label>
                    <select
                      value={declGradeFilter}
                      onChange={(e) => {
                        setDeclGradeFilter(e.target.value);
                        setSelectedClass("");
                      }}
                      className="block w-full rounded-md border-gray-300 border px-3 py-2 text-sm focus:border-blue-500 focus:ring-blue-500 bg-white"
                    >
                      <option value="all">Todas as Classes de Transição</option>
                      <optgroup label="1º Ciclo Primário (Azul Safira)">
                        <option value="1.ª Classe">1.ª Classe</option>
                        <option value="2.ª Classe">2.ª Classe</option>
                      </optgroup>
                      <optgroup label="2º Ciclo Primário (Verde Esmeralda)">
                        <option value="4.ª Classe">4.ª Classe</option>
                        <option value="5.ª Classe">5.ª Classe</option>
                      </optgroup>
                      <optgroup label="3º Ciclo Básico (Bordô / Vinho)">
                        <option value="7.ª Classe">7.ª Classe</option>
                        <option value="8.ª Classe">8.ª Classe</option>
                      </optgroup>
                      <optgroup label="2º Ciclo ESG (Índigo Real)">
                        <option value="10ª Classe">10ª Classe</option>
                        <option value="11.ª Classe">11.ª Classe</option>
                      </optgroup>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Turma
                    </label>
                    <select
                      className="block w-full rounded-md border-gray-300 border px-3 py-2 text-sm focus:border-blue-500 focus:ring-blue-500 bg-white"
                      value={selectedClass}
                      onChange={(e) => setSelectedClass(e.target.value)}
                    >
                      <option value="">Selecione uma turma...</option>
                      {classes
                        .filter(
                          (c) =>
                            declGradeFilter === "all" ||
                            c.gradeLevel === declGradeFilter,
                        )
                        .map((c) => (
                          <option key={c.id} value={c.id}>
                            {c.name} ({c.gradeLevel})
                          </option>
                        ))}
                    </select>
                  </div>
                </div>

                {/* Campo "Nome do Aluno" com pesquisa em tempo real */}
                <div className="mb-6 pt-2">
                  <label className="block text-sm font-medium text-gray-900 mb-1">
                    Nome do Aluno
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                      <Search className="h-4 w-4" />
                    </div>
                    <input
                      type="text"
                      value={declStudentSearch}
                      onChange={(e) => setDeclStudentSearch(e.target.value)}
                      placeholder="Pesquisar o nome do aluno"
                      className="block w-full pl-9 pr-4 py-2.5 border border-gray-300 rounded-md text-sm placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all bg-white"
                    />
                  </div>
                </div>

                {/* Lista de Alunos para Declaração */}
                {(() => {
                  const filtered = students.filter((s) => {
                    // Match class if selected
                    if (selectedClass && s.classId !== selectedClass)
                      return false;
                    // Match grade level if class filter is specific and no specific class selected
                    if (!selectedClass && declGradeFilter !== "all") {
                      const studentClass = classes.find(
                        (c) => c.id === s.classId,
                      );
                      if (
                        studentClass?.gradeLevel !== declGradeFilter &&
                        s.entryGrade !== declGradeFilter
                      )
                        return false;
                    }
                    // Match search query
                    if (declStudentSearch.trim()) {
                      const q = declStudentSearch.toLowerCase();
                      const matchName = s.name.toLowerCase().includes(q);
                      const matchId = s.id.toLowerCase().includes(q);
                      const matchProcess = s.processCode
                        ?.toLowerCase()
                        .includes(q);
                      if (!matchName && !matchId && !matchProcess) return false;
                    }
                    return true;
                  });

                  return (
                    <div className="border border-gray-200 rounded-lg overflow-hidden divide-y divide-gray-200 bg-white">
                      <div className="bg-gray-50 px-4 py-3 flex items-center justify-between text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        <span>Aluno / Processo</span>
                        <span>Classe & Turma</span>
                        <span className="text-right">Ação / Declaração</span>
                      </div>

                      {filtered.length > 0 ? (
                        filtered.map((student) => {
                          const studentClass = classes.find(
                            (c) => c.id === student.classId,
                          );
                          const approved = isApproved(student.id);

                          return (
                            <div
                              key={student.id}
                              className="flex flex-col sm:flex-row sm:items-center justify-between p-4 hover:bg-blue-50/40 transition-colors gap-3"
                            >
                              <div className="space-y-0.5">
                                <div className="flex items-center gap-2">
                                  <p className="font-semibold text-gray-900">
                                    {student.name}
                                  </p>
                                  {approved ? (
                                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-emerald-100 text-emerald-800">
                                      Transitou
                                    </span>
                                  ) : (
                                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-800">
                                      Não Transitou
                                    </span>
                                  )}
                                </div>
                                <p className="text-xs text-gray-500 font-mono">
                                  Nº Processo:{" "}
                                  {student.processCode || student.id}
                                </p>
                              </div>

                              <div className="text-xs text-gray-600 font-medium">
                                {studentClass
                                  ? `${studentClass.gradeLevel} - ${studentClass.name}`
                                  : student.entryGrade || "Sem Turma"}
                              </div>

                              <div className="flex items-center gap-2">
                                <Button
                                  variant="primary"
                                  onClick={() => setSelectedStudent(student)}
                                  className="bg-blue-600 hover:bg-blue-700 text-white text-xs gap-1.5 shadow-sm"
                                >
                                  <FileText className="h-4 w-4" /> Emitir
                                  Declaração
                                </Button>
                              </div>
                            </div>
                          );
                        })
                      ) : (
                        <div className="p-8 text-center text-sm text-gray-500">
                          Nenhum aluno registado com os critérios selecionados.
                        </div>
                      )}
                    </div>
                  );
                })()}
              </Card>
            ) : (
              <DeclarationDocument
                student={selectedStudent}
                schoolClass={classes.find(
                  (c) => c.id === selectedStudent.classId,
                )}
                schoolName="Escola Secundária Central"
                subjects={subjects}
                grades={grades}
                academicYear={declYear}
                onClose={() => setSelectedStudent(null)}
              />
            )}
          </div>
        )}
      </div>
    </CollapsibleSidebar>
  );
}
