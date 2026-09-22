import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { 
  User, School, Student, Class, Subject, TeacherAssignment, Grade, ExamGrade, 
  LessonSummary, TrimesterReport, Employee, IssuedDeclaration, Province, District, 
  CollectionPeriod, CollectionForm, ChatMessage, TransferRequest, AcademicComplaint, 
  AcademicArchive, EmailNotification, SmtpSettings, FinancialTransaction, 
  PatrimonyItem, PatrimonyMovement, LibraryBook, LibraryLoan, HRContract, 
  HRLeave, HRPromotion, HRTraining, ReceptionVisitor, ReceptionTicket, 
  ArchiveRecord, ClassSchedule, SchoolRoom, AIPrediction, AIReportGeneration 
} from './types';
import { initialData } from './mockData';
import { generateEmployeeId, generateStudentId, generateIUE, generateNIM } from './data/mozambiqueLocations';

export const defaultSmtpSettings: SmtpSettings = {
  host: 'smtp.minedh.gov.mz',
  port: 587,
  username: 'notificacoes.caderneta@minedh.gov.mz',
  password: '••••••••••••',
  encryption: 'TLS',
  senderName: 'MINEDH - Sistema de Gestão de Cadernetas Escolares',
  senderEmail: 'notificacoes.caderneta@minedh.gov.mz',
  replyTo: 'suporte.pedagogico@minedh.gov.mz',
  isActive: true,
  lastTestedAt: new Date().toISOString(),
  autoSendOnTrimesterClose: true,
};

interface StoreState {
  users: User[];
  schools: School[];
  provinces: Province[];
  districts: District[];
  students: Student[];
  employees: Employee[];
  classes: Class[];
  subjects: Subject[];
  assignments: TeacherAssignment[];
  grades: Grade[];
  examGrades: ExamGrade[];
  lessonSummaries: LessonSummary[];
  reports: TrimesterReport[];
  issuedDeclarations: IssuedDeclaration[];
  collectionPeriods: CollectionPeriod[];
  collectionForms: CollectionForm[];
  chatMessages: ChatMessage[];
  transferRequests: TransferRequest[];
  academicComplaints: AcademicComplaint[];
  academicArchives: AcademicArchive[];
  emailNotifications: EmailNotification[];
  smtpSettings: SmtpSettings;
  financialTransactions: FinancialTransaction[];
  patrimonyItems: PatrimonyItem[];
  patrimonyMovements: PatrimonyMovement[];
  libraryBooks: LibraryBook[];
  libraryLoans: LibraryLoan[];
  hrContracts: HRContract[];
  hrLeaves: HRLeave[];
  hrPromotions: HRPromotion[];
  hrTrainings: HRTraining[];
  receptionVisitors: ReceptionVisitor[];
  receptionTickets: ReceptionTicket[];
  archiveRecords: ArchiveRecord[];
  classSchedules: ClassSchedule[];
  schoolRooms: SchoolRoom[];
  aiPredictions: AIPrediction[];
  aiReports: AIReportGeneration[];
  currentUser: User | null;
  highContrast: boolean;
}

interface StoreActions {
  login: (email: string) => boolean;
  logout: () => void;
  enrollStudent: (studentData: Omit<Student, 'id' | 'classId' | 'status'>) => void;
  addEmployee: (employeeData: Omit<Employee, 'id'> & { id?: string }) => void;
  deleteEmployee: (id: string) => void;
  updateEmployee: (id: string, data: Partial<Employee>) => void;
  assignClasses: () => void; // Auto-assign logic
  addGrade: (gradeData: Omit<Grade, 'id' | 'isLocked'>) => void;
  addExamGrade: (examGradeData: Omit<ExamGrade, 'id' | 'isLocked'>) => void;
  addLessonSummary: (summaryData: Omit<LessonSummary, 'id'>) => void;
  submitReport: (classId: string, trimester: 1 | 2 | 3) => void;
  signReport: (reportId: string) => void;
  publishReport: (reportId: string) => void;
  issueDeclaration: (declarationData: {
    studentId: string;
    academicYear: number;
    gradeLevel: string;
    className?: string;
    schoolName?: string;
    directorName?: string;
    secretaryName?: string;
    status?: 'Transitou' | 'Não Transitou';
    finalAverage?: number;
    gradesSnapshot?: any[];
    exemplar?: string;
  }) => IssuedDeclaration;
  addCollectionPeriod: (period: Omit<CollectionPeriod, 'id' | 'createdAt'>) => void;
  publishCollectionPeriod: (id: string) => void;
  submitCollectionForm: (form: Omit<CollectionForm, 'id' | 'submittedAt'>) => void;
  sendChatMessage: (message: Omit<ChatMessage, 'id' | 'timestamp'>) => void;
  submitTransferRequest: (request: Omit<TransferRequest, 'id' | 'status' | 'requestedAt'>) => void;
  submitComplaint: (complaint: Omit<AcademicComplaint, 'id' | 'status' | 'createdAt'>) => void;
  updateSchoolChoice: (studentId: string, schoolId: string) => void;
  addSchool: (schoolData: Omit<School, 'id'>) => void;
  removeSchool: (id: string) => void;
  toggleHighContrast: () => void;
  lockClassGrades: (classId: string) => void;
  archiveAcademicData: (year: number, classId: string) => void;
  sendEmailNotification: (notification: Omit<EmailNotification, 'id' | 'sentAt' | 'status'>) => void;
  updateSmtpSettings: (settings: Partial<SmtpSettings>) => void;
  testSmtpConnection: () => Promise<{ success: boolean; message: string; log: string[] }>;
  triggerTrimesterCloseEmailToTeachers: (classId: string, trimester?: number) => void;
  updateUserSignature: (userId: string, signature: string) => void;
  // Module Actions
  addFinancialTransaction: (transaction: Omit<FinancialTransaction, 'id'>) => void;
  updateFinancialStatus: (id: string, status: 'pago' | 'pendente' | 'cancelado') => void;
  addPatrimonyItem: (item: Omit<PatrimonyItem, 'id'>) => void;
  updatePatrimonyItem: (id: string, updates: Partial<PatrimonyItem>) => void;
  addPatrimonyMovement: (movement: Omit<PatrimonyMovement, 'id'>) => void;
  addLibraryBook: (book: Omit<LibraryBook, 'id'>) => void;
  borrowBook: (loan: Omit<LibraryLoan, 'id' | 'status'>) => void;
  returnBook: (loanId: string, returnDate?: string) => void;
  addHRContract: (contract: Omit<HRContract, 'id'>) => void;
  addHRLeave: (leave: Omit<HRLeave, 'id' | 'status'>) => void;
  approveHRLeave: (leaveId: string, approved: boolean, approverName: string) => void;
  addHRPromotion: (promotion: Omit<HRPromotion, 'id'>) => void;
  addHRTraining: (training: Omit<HRTraining, 'id'>) => void;
  addReceptionVisitor: (visitor: Omit<ReceptionVisitor, 'id' | 'status'>) => void;
  updateVisitorStatus: (id: string, status: 'Em Atendimento' | 'Concluído' | 'Aguardando') => void;
  addReceptionTicket: (ticket: Omit<ReceptionTicket, 'id' | 'status' | 'requestedAt'>) => void;
  callReceptionTicket: (id: string) => void;
  addArchiveRecord: (record: Omit<ArchiveRecord, 'id'>) => void;
  addClassSchedule: (schedule: Omit<ClassSchedule, 'id'>) => void;
  generateAIReport: (report: Omit<AIReportGeneration, 'id' | 'generatedAt'>) => void;
}

type StoreContextType = StoreState & StoreActions;

const StoreContext = createContext<StoreContextType | undefined>(undefined);

export function StoreProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<StoreState>(() => {
    const saved = localStorage.getItem('eduGestaoState');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return {
          ...initialData,
          ...parsed,
          employees: (parsed.employees && parsed.employees.length > 0) ? parsed.employees : initialData.employees || [],
          examGrades: parsed.examGrades || initialData.examGrades || [],
          lessonSummaries: parsed.lessonSummaries || [],
          issuedDeclarations: parsed.issuedDeclarations || [],
          emailNotifications: parsed.emailNotifications || [],
          smtpSettings: parsed.smtpSettings || defaultSmtpSettings,
          financialTransactions: parsed.financialTransactions || initialData.financialTransactions || [],
          patrimonyItems: parsed.patrimonyItems || initialData.patrimonyItems || [],
          patrimonyMovements: parsed.patrimonyMovements || initialData.patrimonyMovements || [],
          libraryBooks: parsed.libraryBooks || initialData.libraryBooks || [],
          libraryLoans: parsed.libraryLoans || initialData.libraryLoans || [],
          hrContracts: parsed.hrContracts || initialData.hrContracts || [],
          hrLeaves: parsed.hrLeaves || initialData.hrLeaves || [],
          hrPromotions: parsed.hrPromotions || initialData.hrPromotions || [],
          hrTrainings: parsed.hrTrainings || initialData.hrTrainings || [],
          receptionVisitors: parsed.receptionVisitors || initialData.receptionVisitors || [],
          receptionTickets: parsed.receptionTickets || initialData.receptionTickets || [],
          archiveRecords: parsed.archiveRecords || initialData.archiveRecords || [],
          classSchedules: parsed.classSchedules || initialData.classSchedules || [],
          schoolRooms: parsed.schoolRooms || initialData.schoolRooms || [],
          aiPredictions: parsed.aiPredictions || initialData.aiPredictions || [],
          aiReports: parsed.aiReports || initialData.aiReports || [],
          currentUser: parsed.currentUser || null
        };
      } catch (e) {
        console.error('Error reading localStorage', e);
      }
    }
    return {
      ...initialData,
      provinces: initialData.provinces || [],
      districts: initialData.districts || [],
      employees: initialData.employees || [],
      examGrades: initialData.examGrades || [],
      lessonSummaries: [],
      issuedDeclarations: [],
      collectionPeriods: initialData.collectionPeriods || [],
      collectionForms: initialData.collectionForms || [],
      chatMessages: initialData.chatMessages || [],
      transferRequests: initialData.transferRequests || [],
      academicComplaints: initialData.academicComplaints || [],
      academicArchives: [],
      emailNotifications: [],
      smtpSettings: defaultSmtpSettings,
      financialTransactions: initialData.financialTransactions || [],
      patrimonyItems: initialData.patrimonyItems || [],
      patrimonyMovements: initialData.patrimonyMovements || [],
      libraryBooks: initialData.libraryBooks || [],
      libraryLoans: initialData.libraryLoans || [],
      hrContracts: initialData.hrContracts || [],
      hrLeaves: initialData.hrLeaves || [],
      hrPromotions: initialData.hrPromotions || [],
      hrTrainings: initialData.hrTrainings || [],
      receptionVisitors: initialData.receptionVisitors || [],
      receptionTickets: initialData.receptionTickets || [],
      archiveRecords: initialData.archiveRecords || [],
      classSchedules: initialData.classSchedules || [],
      schoolRooms: initialData.schoolRooms || [],
      aiPredictions: initialData.aiPredictions || [],
      aiReports: initialData.aiReports || [],
      currentUser: null,
      highContrast: false
    };
  });

  useEffect(() => {
    localStorage.setItem('eduGestaoState', JSON.stringify(state));
  }, [state]);

  const login = (email: string) => {
    const user = state.users.find(u => u.email === email);
    if (user) {
      setState(prev => ({ ...prev, currentUser: user }));
      return true;
    }
    return false;
  };

  const logout = () => {
    setState(prev => ({ ...prev, currentUser: null }));
  };

  const addCollectionPeriod = (period: Omit<CollectionPeriod, 'id' | 'createdAt'>) => {
    const newPeriod: CollectionPeriod = {
      ...period,
      id: `period-${Date.now()}`,
      createdAt: new Date().toISOString()
    };
    setState(prev => ({
      ...prev,
      collectionPeriods: [...prev.collectionPeriods, newPeriod]
    }));
  };

  const publishCollectionPeriod = (id: string) => {
    setState(prev => ({
      ...prev,
      collectionPeriods: prev.collectionPeriods.map(p => p.id === id ? { ...p, status: 'published' } : p)
    }));
  };

  const submitCollectionForm = (formData: Omit<CollectionForm, 'id' | 'submittedAt'>) => {
    const newForm: CollectionForm = {
      ...formData,
      id: `form-${Date.now()}`,
      submittedAt: new Date().toISOString(),
      status: 'submitted'
    };
    setState(prev => ({
      ...prev,
      collectionForms: [...prev.collectionForms, newForm]
    }));
  };

  const sendChatMessage = (msg: Omit<ChatMessage, 'id' | 'timestamp'>) => {
    const newMessage: ChatMessage = {
      ...msg,
      id: `msg-${Date.now()}`,
      timestamp: new Date().toISOString()
    };
    setState(prev => ({
      ...prev,
      chatMessages: [...prev.chatMessages, newMessage]
    }));
  };

  const submitTransferRequest = (request: Omit<TransferRequest, 'id' | 'status' | 'requestedAt'>) => {
    const newRequest: TransferRequest = {
      ...request,
      id: `trans-${Date.now()}`,
      status: 'pending',
      requestedAt: new Date().toISOString()
    };
    setState(prev => ({
      ...prev,
      transferRequests: [...prev.transferRequests, newRequest]
    }));
  };

  const submitComplaint = (complaint: Omit<AcademicComplaint, 'id' | 'status' | 'createdAt'>) => {
    const newComplaint: AcademicComplaint = {
      ...complaint,
      id: `comp-${Date.now()}`,
      status: 'pending',
      createdAt: new Date().toISOString()
    };
    setState(prev => ({
      ...prev,
      academicComplaints: [...prev.academicComplaints, newComplaint]
    }));
  };

  const updateSchoolChoice = (studentId: string, schoolId: string) => {
    setState(prev => ({
      ...prev,
      students: prev.students.map(s => s.id === studentId ? { ...s, nextSchoolId: schoolId } : s)
    }));
  };

  const toggleHighContrast = () => {
    setState(prev => ({ ...prev, highContrast: !prev.highContrast }));
  };

  const updateSmtpSettings = (settings: Partial<SmtpSettings>) => {
    setState(prev => ({
      ...prev,
      smtpSettings: {
        ...prev.smtpSettings,
        ...settings
      }
    }));
  };

  const testSmtpConnection = async (): Promise<{ success: boolean; message: string; log: string[] }> => {
    const { host, port, username, encryption, senderEmail } = state.smtpSettings;
    const timestamp = new Date().toISOString();
    const log: string[] = [
      `[${timestamp}] Iniciando handshake de conexão SMTP com ${host}:${port}...`,
      `[${timestamp}] Estabelecendo túnel de comunicação via protocolo ${encryption}...`,
      `[${timestamp}] 220 ${host} ESMTP Service Ready (MINEDH Mail Gateway)`,
      `[${timestamp}] EHLO ${senderEmail || 'sistema.minedh.gov.mz'}`,
      `[${timestamp}] 250-SIZE 35651584`,
      `[${timestamp}] 250-8BITMIME`,
      `[${timestamp}] 250-STARTTLS`,
      `[${timestamp}] 250-AUTH PLAIN LOGIN`,
      `[${timestamp}] AUTH LOGIN (${username})`,
      `[${timestamp}] 235 2.7.0 Authentication successful for ${username}`,
      `[${timestamp}] RSET`,
      `[${timestamp}] 250 2.0.0 OK`,
      `[${timestamp}] Teste de comunicação concluído com êxito. Servidor SMTP pronto para disparos automáticos.`
    ];

    // Simulate connection delay
    await new Promise(resolve => setTimeout(resolve, 800));

    setState(prev => ({
      ...prev,
      smtpSettings: {
        ...prev.smtpSettings,
        lastTestedAt: new Date().toISOString()
      }
    }));

    return {
      success: true,
      message: `Conexão SMTP com ${host}:${port} validada com sucesso (Autenticado como ${username}).`,
      log
    };
  };

  const triggerTrimesterCloseEmailToTeachers = (classId: string, trimester?: number) => {
    setState(prev => {
      if (!prev.smtpSettings.isActive || !prev.smtpSettings.autoSendOnTrimesterClose) {
        return prev;
      }

      const targetClass = prev.classes.find(c => c.id === classId);
      const classAssignments = prev.assignments.filter(a => a.classId === classId);
      const teacherIds = Array.from(new Set(classAssignments.map(a => a.teacherId)));
      const teachersToNotify = prev.users.filter(
        u => u.role === 'teacher' && (teacherIds.includes(u.id) || !teacherIds.length)
      );

      const trimLabel = trimester ? `${trimester}º Trimestre` : 'Trimestre Geral';
      const senderInfo = `${prev.smtpSettings.senderName} <${prev.smtpSettings.senderEmail}>`;

      const newNotifs: EmailNotification[] = teachersToNotify.map(t => ({
        id: `email-smtp-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
        teacherEmail: t.email,
        teacherName: t.name,
        subject: `[MINEDH/SMTP] Confirmação de Encerramento Trimestral de Caderneta - ${targetClass?.name || 'Turma'} (${trimLabel})`,
        message: `Prezado(a) Docente ${t.name},\n\nInformamos que o fechamento trimestral das cadernetas da turma ${targetClass?.name || classId} (${targetClass?.gradeLevel || ''}) foi processado e homologado com sucesso.\n\nServidor SMTP Remetente: ${senderInfo}\nStatus das Notas: Trancadas para edição (Modo Leitura)\nData de Fechamento: ${new Date().toLocaleString('pt-MZ')}\n\nAs pautas de frequência e exames encontram-se arquivadas na Secção Pedagógica.\n\nAtentamente,\nDirecção Pedagógica & Ministério da Educação e Desenvolvimento Humano`,
        classId,
        className: targetClass?.name,
        sentAt: new Date().toISOString(),
        status: 'SENT'
      }));

      return {
        ...prev,
        emailNotifications: [...newNotifs, ...prev.emailNotifications]
      };
    });
  };

  const lockClassGrades = (classId: string) => {
    setState(prev => {
      const updatedGrades = prev.grades.map(g => g.classId === classId ? { ...g, isLocked: true } : g);
      const updatedExamGrades = prev.examGrades.map(eg => eg.classId === classId ? { ...eg, isLocked: true } : eg);
      
      let updatedNotifs = prev.emailNotifications;

      // Automatically dispatch SMTP notification if active
      if (prev.smtpSettings.isActive && prev.smtpSettings.autoSendOnTrimesterClose) {
        const targetClass = prev.classes.find(c => c.id === classId);
        const classAssignments = prev.assignments.filter(a => a.classId === classId);
        const teacherIds = Array.from(new Set(classAssignments.map(a => a.teacherId)));
        const teachersToNotify = prev.users.filter(
          u => u.role === 'teacher' && (teacherIds.includes(u.id) || !teacherIds.length)
        );

        const newNotifs: EmailNotification[] = teachersToNotify.map(t => ({
          id: `email-lock-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
          teacherEmail: t.email,
          teacherName: t.name,
          subject: `[MINEDH] Notificação de Bloqueio de Caderneta - Turma ${targetClass?.name || classId}`,
          message: `Prezado(a) Professor(a) ${t.name},\n\nSua caderneta referente à turma ${targetClass?.name || classId} foi trancada oficialmente após o fechamento do trimestre via servidor SMTP (${prev.smtpSettings.host}). Nenhuma alteração posterior de notas será permitida sem autorização do Director de Escola.\n\nAtentamente,\nSecção Pedagógica / MINEDH`,
          classId,
          className: targetClass?.name,
          sentAt: new Date().toISOString(),
          status: 'SENT'
        }));

        updatedNotifs = [...newNotifs, ...prev.emailNotifications];
      }

      return {
        ...prev,
        grades: updatedGrades,
        examGrades: updatedExamGrades,
        emailNotifications: updatedNotifs
      };
    });
  };

  const sendEmailNotification = (notification: Omit<EmailNotification, 'id' | 'sentAt' | 'status'>) => {
    const newNotif: EmailNotification = {
      ...notification,
      id: `email-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      sentAt: new Date().toISOString(),
      status: 'SENT'
    };
    setState(prev => ({
      ...prev,
      emailNotifications: [newNotif, ...prev.emailNotifications]
    }));
  };

  const archiveAcademicData = (year: number, classId: string) => {
    setState(prev => {
        const gradesToArchive = prev.grades.filter(g => g.classId === classId);
        const examGradesToArchive = prev.examGrades.filter(eg => eg.classId === classId);
        const targetClass = prev.classes.find(c => c.id === classId);
        
        const newArchive: AcademicArchive = {
            id: `arch-${Date.now()}`,
            year,
            classId,
            grades: gradesToArchive,
            examGrades: examGradesToArchive,
            archivedAt: new Date().toISOString()
        };

        // Find teachers assigned to this class
        const classAssignments = prev.assignments.filter(a => a.classId === classId);
        const teacherIds = Array.from(new Set(classAssignments.map(a => a.teacherId)));
        const teachersToNotify = prev.users.filter(u => u.role === 'teacher' && (teacherIds.includes(u.id) || !teacherIds.length));

        const newEmailNotifs: EmailNotification[] = teachersToNotify.map(t => ({
          id: `email-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
          teacherEmail: t.email,
          teacherName: t.name,
          subject: `[MINEDH/SMTP] Arquivo Histórico Processado - Fecho de Trimestre (${targetClass?.name || 'Turma'})`,
          message: `Prezado(a) Professor(a) ${t.name},\n\nInformamos que a Secção Pedagógica processou com sucesso o arquivo histórico institucional para a turma ${targetClass?.name || classId} através do Servidor SMTP Configurado (${prev.smtpSettings.host}:${prev.smtpSettings.port}). As cadernetas encontram-se em modo de leitura (trancadas).\n\nRemetente: ${prev.smtpSettings.senderEmail}\nAtentamente,\nDirecção Pedagógica / MINEDH`,
          classId,
          className: targetClass?.name,
          sentAt: new Date().toISOString(),
          status: 'SENT'
        }));

        return {
            ...prev,
            academicArchives: [...prev.academicArchives, newArchive],
            emailNotifications: [...newEmailNotifs, ...prev.emailNotifications]
        };
    });
  };

  const updateUserSignature = (userId: string, signature: string) => {
    setState(prev => {
      const updatedUsers = prev.users.map(u => u.id === userId ? { ...u, signature } : u);
      const updatedCurrentUser = prev.currentUser?.id === userId ? { ...prev.currentUser, signature } : prev.currentUser;
      return {
        ...prev,
        users: updatedUsers,
        currentUser: updatedCurrentUser
      };
    });
  };

  const addSchool = (schoolData: Omit<School, 'id'>) => {
    const schoolId = `school-${Date.now()}`;
    const newSchool: School = {
      ...schoolData,
      id: schoolId
    };

    // Auto-create user accounts & employee entries for Director, DAP, and Chefe da Secretaria
    const createdUsers: User[] = [];
    const createdEmployees: Employee[] = [];

    // 1. Director da Escola
    if (newSchool.directorName && newSchool.directorName.trim()) {
      const directorUserId = `usr-dir-${Date.now()}-1`;
      createdUsers.push({
        id: directorUserId,
        name: newSchool.directorName.trim(),
        email: `diretor.${schoolId}@minedh.gov.mz`,
        role: 'director',
        schoolId: schoolId,
        provinceId: newSchool.province
      });

      createdEmployees.push({
        id: `emp-dir-${Date.now()}-1`,
        name: newSchool.directorName.trim(),
        gender: 'Masculino',
        nuit: `${Math.floor(100000000 + Math.random() * 900000000)}`,
        email: `diretor.${schoolId}@minedh.gov.mz`,
        phone: newSchool.phone || '+258 84 000 0000',
        maritalStatus: 'Casado(a)',
        fatherName: 'N/A',
        motherName: 'N/A',
        idCardNumber: `010${Math.floor(100000 + Math.random() * 900000)}M`,
        idCardIssuedAt: newSchool.province || 'Maputo',
        idCardIssuedDate: '2020-01-15',
        nationality: 'Moçambicana',
        birthProvince: newSchool.province || 'Maputo Cidade',
        birthDistrict: newSchool.district || 'KaMpfumo',
        birthDate: '1980-05-12',
        address: newSchool.address || 'Sede da Escola',
        neighborhood: newSchool.locality || 'Centro',
        residenceDistrict: newSchool.district || 'Sede',
        cell: newSchool.phone || '+258 84 000 0000',
        blockNo: '1',
        houseNo: '12',
        childrenCount: 2,
        career: 'Técnico Superior de Administração Pública',
        category: 'Gestão Escolar',
        roleFunction: 'Director da Escola',
        isEffective: 'Sim',
        contractType: 'Nomeação Definitiva',
        contractLink: 'Quadro de Nomeação',
        admissionDate: new Date().toISOString().split('T')[0],
        academicLevel: 'Licenciatura',
        trainingArea: 'Gestão e Administração Educacional',
        leadershipRole: 'Director da Escola',
        department: 'Direcção da Escola',
        taughtSubjects: []
      });
    }

    // 2. Director Adjunto Pedagógico (DAP)
    if (newSchool.dapName && newSchool.dapName.trim()) {
      const dapUserId = `usr-dap-${Date.now()}-2`;
      createdUsers.push({
        id: dapUserId,
        name: newSchool.dapName.trim(),
        email: `dap.${schoolId}@minedh.gov.mz`,
        role: 'pedagogical',
        schoolId: schoolId,
        provinceId: newSchool.province
      });

      createdEmployees.push({
        id: `emp-dap-${Date.now()}-2`,
        name: newSchool.dapName.trim(),
        gender: 'Feminino',
        nuit: `${Math.floor(100000000 + Math.random() * 900000000)}`,
        email: `dap.${schoolId}@minedh.gov.mz`,
        phone: newSchool.phone || '+258 82 000 0000',
        maritalStatus: 'Casado(a)',
        fatherName: 'N/A',
        motherName: 'N/A',
        idCardNumber: `020${Math.floor(100000 + Math.random() * 900000)}F`,
        idCardIssuedAt: newSchool.province || 'Maputo',
        idCardIssuedDate: '2021-03-20',
        nationality: 'Moçambicana',
        birthProvince: newSchool.province || 'Maputo Cidade',
        birthDistrict: newSchool.district || 'KaMpfumo',
        birthDate: '1984-08-25',
        address: newSchool.address || 'Sede da Escola',
        neighborhood: newSchool.locality || 'Centro',
        residenceDistrict: newSchool.district || 'Sede',
        cell: newSchool.phone || '+258 82 000 0000',
        blockNo: '2',
        houseNo: '14',
        childrenCount: 3,
        career: 'Docente N1',
        category: 'Pedagógico',
        roleFunction: 'Director Pedagógico',
        isEffective: 'Sim',
        contractType: 'Nomeação Definitiva',
        contractLink: 'Quadro de Nomeação',
        admissionDate: new Date().toISOString().split('T')[0],
        academicLevel: 'Licenciatura',
        trainingArea: 'Ciências da Educação',
        leadershipRole: 'Director Pedagógico',
        department: 'Pedagógico',
        taughtSubjects: []
      });
    }

    // 3. Chefe da Secretaria
    if (newSchool.secretariatChiefName && newSchool.secretariatChiefName.trim()) {
      const secUserId = `usr-sec-${Date.now()}-3`;
      createdUsers.push({
        id: secUserId,
        name: newSchool.secretariatChiefName.trim(),
        email: `secretaria.${schoolId}@minedh.gov.mz`,
        role: 'secretariat',
        schoolId: schoolId,
        provinceId: newSchool.province
      });

      createdEmployees.push({
        id: `emp-sec-${Date.now()}-3`,
        name: newSchool.secretariatChiefName.trim(),
        gender: 'Feminino',
        nuit: `${Math.floor(100000000 + Math.random() * 900000000)}`,
        email: `secretaria.${schoolId}@minedh.gov.mz`,
        phone: newSchool.phone || '+258 87 000 0000',
        maritalStatus: 'Solteiro(a)',
        fatherName: 'N/A',
        motherName: 'N/A',
        idCardNumber: `030${Math.floor(100000 + Math.random() * 900000)}F`,
        idCardIssuedAt: newSchool.province || 'Maputo',
        idCardIssuedDate: '2022-06-10',
        nationality: 'Moçambicana',
        birthProvince: newSchool.province || 'Maputo Cidade',
        birthDistrict: newSchool.district || 'KaMpfumo',
        birthDate: '1988-11-05',
        address: newSchool.address || 'Sede da Escola',
        neighborhood: newSchool.locality || 'Centro',
        residenceDistrict: newSchool.district || 'Sede',
        cell: newSchool.phone || '+258 87 000 0000',
        blockNo: '3',
        houseNo: '20',
        childrenCount: 1,
        career: 'Técnico Administrativo Principal',
        category: 'Secretaria',
        roleFunction: 'Chefe da Secretaria',
        isEffective: 'Sim',
        contractType: 'Nomeação Definitiva',
        contractLink: 'Quadro de Nomeação',
        admissionDate: new Date().toISOString().split('T')[0],
        academicLevel: 'Licenciatura',
        trainingArea: 'Administração Escolar e Gestão',
        leadershipRole: 'Chefe da Secretaria',
        department: 'Secretaria',
        taughtSubjects: []
      });
    }

    // 4. Secretaria: Técnico de Recursos Humanos (RH)
    const rhUserId = `usr-rh-${Date.now()}-4`;
    createdUsers.push({
      id: rhUserId,
      name: `Dra. Fátima Cossa (${newSchool.name})`,
      email: `rh.${schoolId}@minedh.gov.mz`,
      role: 'secretariat_rh',
      schoolId: schoolId,
      provinceId: newSchool.province,
      department: 'Recursos Humanos'
    });
    createdEmployees.push({
      id: `emp-rh-${Date.now()}-4`,
      name: `Dra. Fátima Cossa`,
      gender: 'Feminino',
      nuit: `${Math.floor(100000000 + Math.random() * 900000000)}`,
      email: `rh.${schoolId}@minedh.gov.mz`,
      phone: newSchool.phone || '+258 84 100 0000',
      maritalStatus: 'Casado(a)',
      fatherName: 'N/A',
      motherName: 'N/A',
      idCardNumber: `040${Math.floor(100000 + Math.random() * 900000)}F`,
      idCardIssuedAt: newSchool.province || 'Maputo',
      idCardIssuedDate: '2021-05-18',
      nationality: 'Moçambicana',
      birthProvince: newSchool.province || 'Maputo Cidade',
      birthDistrict: newSchool.district || 'KaMpfumo',
      birthDate: '1987-03-14',
      address: newSchool.address || 'Sede da Escola',
      neighborhood: newSchool.locality || 'Centro',
      residenceDistrict: newSchool.district || 'Sede',
      cell: newSchool.phone || '+258 84 100 0000',
      blockNo: '4',
      houseNo: '18',
      childrenCount: 2,
      career: 'Técnico de Administração Pública N1',
      category: 'Secretaria',
      roleFunction: 'Técnico de Recursos Humanos',
      isEffective: 'Sim',
      contractType: 'Nomeação Definitiva',
      contractLink: 'Quadro de Nomeação',
      admissionDate: new Date().toISOString().split('T')[0],
      academicLevel: 'Licenciatura',
      trainingArea: 'Gestão de Recursos Humanos',
      leadershipRole: 'Técnico de RH',
      department: 'Recursos Humanos',
      taughtSubjects: []
    });

    // 5. Secretaria: Gestor de Património & Logística
    const patUserId = `usr-pat-${Date.now()}-5`;
    createdUsers.push({
      id: patUserId,
      name: `Eng. Alberto Sithole (${newSchool.name})`,
      email: `patrimonio.${schoolId}@minedh.gov.mz`,
      role: 'secretariat_patrimonio',
      schoolId: schoolId,
      provinceId: newSchool.province,
      department: 'Património e Logística'
    });
    createdEmployees.push({
      id: `emp-pat-${Date.now()}-5`,
      name: `Eng. Alberto Sithole`,
      gender: 'Masculino',
      nuit: `${Math.floor(100000000 + Math.random() * 900000000)}`,
      email: `patrimonio.${schoolId}@minedh.gov.mz`,
      phone: newSchool.phone || '+258 84 200 0000',
      maritalStatus: 'Casado(a)',
      fatherName: 'N/A',
      motherName: 'N/A',
      idCardNumber: `050${Math.floor(100000 + Math.random() * 900000)}M`,
      idCardIssuedAt: newSchool.province || 'Maputo',
      idCardIssuedDate: '2020-09-12',
      nationality: 'Moçambicana',
      birthProvince: newSchool.province || 'Maputo Cidade',
      birthDistrict: newSchool.district || 'KaMpfumo',
      birthDate: '1982-07-22',
      address: newSchool.address || 'Sede da Escola',
      neighborhood: newSchool.locality || 'Centro',
      residenceDistrict: newSchool.district || 'Sede',
      cell: newSchool.phone || '+258 84 200 0000',
      blockNo: '5',
      houseNo: '22',
      childrenCount: 1,
      career: 'Técnico de Logística e Património',
      category: 'Secretaria',
      roleFunction: 'Gestor de Património e Infraestruturas',
      isEffective: 'Sim',
      contractType: 'Nomeação Definitiva',
      contractLink: 'Quadro de Nomeação',
      admissionDate: new Date().toISOString().split('T')[0],
      academicLevel: 'Licenciatura',
      trainingArea: 'Engenharia Civil e Gestão Patrimonial',
      leadershipRole: 'Gestor de Património',
      department: 'Património e Logística',
      taughtSubjects: []
    });

    // 6. Secretaria: Recepcionista e Atendimento
    const recUserId = `usr-rec-${Date.now()}-6`;
    createdUsers.push({
      id: recUserId,
      name: `Sra. Laura Nhantumbo (${newSchool.name})`,
      email: `recepcao.${schoolId}@minedh.gov.mz`,
      role: 'secretariat_recepcao',
      schoolId: schoolId,
      provinceId: newSchool.province,
      department: 'Atendimento e Recepção'
    });
    createdEmployees.push({
      id: `emp-rec-${Date.now()}-6`,
      name: `Sra. Laura Nhantumbo`,
      gender: 'Feminino',
      nuit: `${Math.floor(100000000 + Math.random() * 900000000)}`,
      email: `recepcao.${schoolId}@minedh.gov.mz`,
      phone: newSchool.phone || '+258 84 300 0000',
      maritalStatus: 'Solteiro(a)',
      fatherName: 'N/A',
      motherName: 'N/A',
      idCardNumber: `060${Math.floor(100000 + Math.random() * 900000)}F`,
      idCardIssuedAt: newSchool.province || 'Maputo',
      idCardIssuedDate: '2023-01-20',
      nationality: 'Moçambicana',
      birthProvince: newSchool.province || 'Maputo Cidade',
      birthDistrict: newSchool.district || 'KaMpfumo',
      birthDate: '1995-12-04',
      address: newSchool.address || 'Sede da Escola',
      neighborhood: newSchool.locality || 'Centro',
      residenceDistrict: newSchool.district || 'Sede',
      cell: newSchool.phone || '+258 84 300 0000',
      blockNo: '6',
      houseNo: '24',
      childrenCount: 0,
      career: 'Assistente Administrativa',
      category: 'Secretaria',
      roleFunction: 'Recepcionista e Gestora de Atendimento',
      isEffective: 'Sim',
      contractType: 'Contrato de Trabalho a Termo Certo',
      contractLink: 'Quadro de Contratados',
      admissionDate: new Date().toISOString().split('T')[0],
      academicLevel: 'Médio',
      trainingArea: 'Relações Públicas e Secretariado',
      leadershipRole: 'Recepcionista',
      department: 'Atendimento e Recepção',
      taughtSubjects: []
    });

    // 7. Secretaria: Arquivista
    const arqUserId = `usr-arq-${Date.now()}-7`;
    createdUsers.push({
      id: arqUserId,
      name: `Sr. Tomás Cossa (${newSchool.name})`,
      email: `arquivo.${schoolId}@minedh.gov.mz`,
      role: 'secretariat_arquivo',
      schoolId: schoolId,
      provinceId: newSchool.province,
      department: 'Arquivo Geral'
    });
    createdEmployees.push({
      id: `emp-arq-${Date.now()}-7`,
      name: `Sr. Tomás Cossa`,
      gender: 'Masculino',
      nuit: `${Math.floor(100000000 + Math.random() * 900000000)}`,
      email: `arquivo.${schoolId}@minedh.gov.mz`,
      phone: newSchool.phone || '+258 84 400 0000',
      maritalStatus: 'Casado(a)',
      fatherName: 'N/A',
      motherName: 'N/A',
      idCardNumber: `070${Math.floor(100000 + Math.random() * 900000)}M`,
      idCardIssuedAt: newSchool.province || 'Maputo',
      idCardIssuedDate: '2019-11-15',
      nationality: 'Moçambicana',
      birthProvince: newSchool.province || 'Maputo Cidade',
      birthDistrict: newSchool.district || 'KaMpfumo',
      birthDate: '1979-04-18',
      address: newSchool.address || 'Sede da Escola',
      neighborhood: newSchool.locality || 'Centro',
      residenceDistrict: newSchool.district || 'Sede',
      cell: newSchool.phone || '+258 84 400 0000',
      blockNo: '7',
      houseNo: '26',
      childrenCount: 3,
      career: 'Técnico de Arquivo e Documentação',
      category: 'Secretaria',
      roleFunction: 'Arquivista e Gestor de Processos',
      isEffective: 'Sim',
      contractType: 'Nomeação Definitiva',
      contractLink: 'Quadro de Nomeação',
      admissionDate: new Date().toISOString().split('T')[0],
      academicLevel: 'Médio',
      trainingArea: 'Ciências de Informação e Arquivística',
      leadershipRole: 'Arquivista Chefe',
      department: 'Arquivo Geral',
      taughtSubjects: []
    });

    // 8. Secretaria: Tesouraria & Finanças
    const finUserId = `usr-fin-${Date.now()}-8`;
    createdUsers.push({
      id: finUserId,
      name: `Dr. Paulo Guambe (${newSchool.name})`,
      email: `financas.${schoolId}@minedh.gov.mz`,
      role: 'secretariat_financas',
      schoolId: schoolId,
      provinceId: newSchool.province,
      department: 'Tesouraria e Finanças'
    });
    createdEmployees.push({
      id: `emp-fin-${Date.now()}-8`,
      name: `Dr. Paulo Guambe`,
      gender: 'Masculino',
      nuit: `${Math.floor(100000000 + Math.random() * 900000000)}`,
      email: `financas.${schoolId}@minedh.gov.mz`,
      phone: newSchool.phone || '+258 84 500 0000',
      maritalStatus: 'Casado(a)',
      fatherName: 'N/A',
      motherName: 'N/A',
      idCardNumber: `080${Math.floor(100000 + Math.random() * 900000)}M`,
      idCardIssuedAt: newSchool.province || 'Maputo',
      idCardIssuedDate: '2021-08-30',
      nationality: 'Moçambicana',
      birthProvince: newSchool.province || 'Maputo Cidade',
      birthDistrict: newSchool.district || 'KaMpfumo',
      birthDate: '1983-09-10',
      address: newSchool.address || 'Sede da Escola',
      neighborhood: newSchool.locality || 'Centro',
      residenceDistrict: newSchool.district || 'Sede',
      cell: newSchool.phone || '+258 84 500 0000',
      blockNo: '8',
      houseNo: '28',
      childrenCount: 2,
      career: 'Técnico Superior de Finanças N1',
      category: 'Secretaria',
      roleFunction: 'Tesoureiro e Contabilista Escolar',
      isEffective: 'Sim',
      contractType: 'Nomeação Definitiva',
      contractLink: 'Quadro de Nomeação',
      admissionDate: new Date().toISOString().split('T')[0],
      academicLevel: 'Licenciatura',
      trainingArea: 'Contabilidade e Finanças Públicas',
      leadershipRole: 'Tesoureiro',
      department: 'Tesouraria e Finanças',
      taughtSubjects: []
    });

    // 9. Bibliotecário Escolar
    const libUserId = `usr-lib-${Date.now()}-9`;
    createdUsers.push({
      id: libUserId,
      name: `Dra. Teresa Tivane (${newSchool.name})`,
      email: `biblioteca.${schoolId}@minedh.gov.mz`,
      role: 'librarian',
      schoolId: schoolId,
      provinceId: newSchool.province,
      department: 'Biblioteca Escolar'
    });
    createdEmployees.push({
      id: `emp-lib-${Date.now()}-9`,
      name: `Dra. Teresa Tivane`,
      gender: 'Feminino',
      nuit: `${Math.floor(100000000 + Math.random() * 900000000)}`,
      email: `biblioteca.${schoolId}@minedh.gov.mz`,
      phone: newSchool.phone || '+258 84 600 0000',
      maritalStatus: 'Casado(a)',
      fatherName: 'N/A',
      motherName: 'N/A',
      idCardNumber: `090${Math.floor(100000 + Math.random() * 900000)}F`,
      idCardIssuedAt: newSchool.province || 'Maputo',
      idCardIssuedDate: '2022-02-14',
      nationality: 'Moçambicana',
      birthProvince: newSchool.province || 'Maputo Cidade',
      birthDistrict: newSchool.district || 'KaMpfumo',
      birthDate: '1986-06-25',
      address: newSchool.address || 'Sede da Escola',
      neighborhood: newSchool.locality || 'Centro',
      residenceDistrict: newSchool.district || 'Sede',
      cell: newSchool.phone || '+258 84 600 0000',
      blockNo: '9',
      houseNo: '30',
      childrenCount: 2,
      career: 'Técnico de Biblioteca e Documentação',
      category: 'Apoio',
      roleFunction: 'Bibliotecária Escolar Chefe',
      isEffective: 'Sim',
      contractType: 'Nomeação Definitiva',
      contractLink: 'Quadro de Nomeação',
      admissionDate: new Date().toISOString().split('T')[0],
      academicLevel: 'Licenciatura',
      trainingArea: 'Biblioteconomia e Documentação',
      leadershipRole: 'Bibliotecário',
      department: 'Biblioteca Escolar',
      taughtSubjects: []
    });

    // Auto-create initial classes based on autoAssignedClasses
    const createdClasses: Class[] = [];
    if (newSchool.autoAssignedClasses && newSchool.autoAssignedClasses.length > 0) {
      newSchool.autoAssignedClasses.forEach((grade, idx) => {
        createdClasses.push({
          id: `cls-${schoolId}-${idx + 1}`,
          schoolId: schoolId,
          name: `Turma 1`,
          gradeLevel: grade,
          year: new Date().getFullYear(),
          period: 'Manhã'
        });
      });
    }

    setState(prev => ({
      ...prev,
      schools: [...prev.schools, newSchool],
      users: [...prev.users, ...createdUsers],
      employees: [...prev.employees, ...createdEmployees],
      classes: [...prev.classes, ...createdClasses]
    }));
  };

  const removeSchool = (id: string) => {
    setState(prev => ({
      ...prev,
      schools: prev.schools.filter(s => s.id !== id)
    }));
  };

  const enrollStudent = (studentData: Omit<Student, 'id' | 'classId' | 'status'> & { id?: string }) => {
    setState(prev => {
      const targetSchool = prev.schools.find(s => s.id === studentData.schoolId) || prev.schools[0];
      const iue = studentData.iue || generateIUE({
        name: studentData.name,
        documentNumber: studentData.idCardNumber || studentData.nuit,
        idCardNumber: studentData.idCardNumber,
        nuit: studentData.nuit,
        schoolName: targetSchool?.name,
        schoolCode: targetSchool?.code,
        province: studentData.province || targetSchool?.province,
        district: studentData.district || targetSchool?.district,
        academicYear: studentData.academicYear || 2026
      });

      const nim = studentData.nim || generateNIM({
        year: studentData.academicYear || 2026,
        district: studentData.district || targetSchool?.district,
        sequenceNumber: (prev.students?.length || 0) + 1
      });

      const studentId = studentData.id?.trim() || iue;

      const newStudent: Student = {
        ...studentData,
        id: studentId,
        iue: iue,
        nim: nim,
        studentNumber: studentData.studentNumber || iue,
        processCode: studentData.processCode || iue,
        status: 'active',
      };

      // Ensure no duplicates
      const filtered = prev.students.filter(s => s.id !== newStudent.id && s.iue !== newStudent.iue);
      return { ...prev, students: [...filtered, newStudent] };
    });
  };

  const addEmployee = (employeeData: Omit<Employee, 'id'> & { id?: string }) => {
    const generatedId = employeeData.id?.trim() || generateEmployeeId(employeeData.name, employeeData.nuit) || `COL-${Math.random().toString(36).substr(2, 6).toUpperCase()}`;
    const newEmployee: Employee = {
      ...employeeData,
      id: generatedId,
    };
    setState(prev => {
      // Avoid duplicate ID
      const filtered = (prev.employees || []).filter(e => e.id !== newEmployee.id);
      return { ...prev, employees: [...filtered, newEmployee] };
    });
  };

  const deleteEmployee = (id: string) => {
    setState(prev => ({
      ...prev,
      employees: (prev.employees || []).filter(e => e.id !== id)
    }));
  };

  const updateEmployee = (id: string, data: Partial<Employee>) => {
    setState(prev => ({
      ...prev,
      employees: (prev.employees || []).map(e => e.id === id ? { ...e, ...data } : e)
    }));
  };

  const assignClasses = () => {
    setState(prev => {
      // Group unassigned students by age/year roughly, sort by birthDate (youngest first)
      // For simplicity in this prototype, we'll assign to the first available class or create one
      // The rule: youngest in Turma A, then B
      const unassigned = prev.students.filter(s => !s.classId);
      if (unassigned.length === 0) return prev;

      unassigned.sort((a, b) => new Date(b.birthDate).getTime() - new Date(a.birthDate).getTime());

      let currentClassList = [...prev.classes];
      let updatedStudents = [...prev.students];

      // Assuming one grade level for simplicity, e.g., "10ª Classe"
      let turmaIndex = 0;
      const turmas = ['A', 'B', 'C', 'D'];
      const maxPerClass = 2; // small number for testing

      unassigned.forEach((student, index) => {
        const classIndex = Math.floor(index / maxPerClass);
        const letter = turmas[classIndex] || 'X';
        const className = `Turma ${letter}`;

        let targetClass = currentClassList.find(c => c.name === className);
        if (!targetClass) {
          targetClass = {
            id: Math.random().toString(36).substr(2, 9),
            schoolId: student.schoolId,
            name: className,
            gradeLevel: '10ª Classe',
            year: new Date().getFullYear(),
          };
          currentClassList.push(targetClass);
        }

        const studentToUpdate = updatedStudents.find(s => s.id === student.id);
        if (studentToUpdate) {
          studentToUpdate.classId = targetClass.id;
        }
      });

      return {
        ...prev,
        classes: currentClassList,
        students: updatedStudents
      };
    });
  };

  const addGrade = (gradeData: Omit<Grade, 'id' | 'isLocked'>) => {
    setState(prev => {
      // check if grade already exists for this student, subject, trimester
      const existingIndex = prev.grades.findIndex(g => 
        g.studentId === gradeData.studentId && 
        g.subjectId === gradeData.subjectId && 
        g.trimester === gradeData.trimester
      );

      if (existingIndex >= 0 && prev.grades[existingIndex].isLocked) {
        return prev; // locked, cannot change
      }

      const newGrade: Grade = {
        ...gradeData,
        id: Math.random().toString(36).substr(2, 9),
        isLocked: true // Lock immediately upon launching according to requirements
      };

      let newGrades = [...prev.grades];
      if (existingIndex >= 0) {
        newGrades[existingIndex] = newGrade;
      } else {
        newGrades.push(newGrade);
      }

      return { ...prev, grades: newGrades };
    });
  };

  const addExamGrade = (examGradeData: Omit<ExamGrade, 'id' | 'isLocked'>) => {
    setState(prev => {
      const existingIndex = (prev.examGrades || []).findIndex(eg => 
        eg.studentId === examGradeData.studentId && 
        eg.subjectId === examGradeData.subjectId &&
        eg.classId === examGradeData.classId
      );

      const newExamGrade: ExamGrade = {
        ...examGradeData,
        id: Math.random().toString(36).substr(2, 9),
        isLocked: true,
        launchedAt: new Date().toISOString()
      };

      let newExamGrades = [...(prev.examGrades || [])];
      if (existingIndex >= 0) {
        newExamGrades[existingIndex] = newExamGrade;
      } else {
        newExamGrades.push(newExamGrade);
      }

      return { ...prev, examGrades: newExamGrades };
    });
  };

  const addLessonSummary = (summaryData: Omit<LessonSummary, 'id'>) => {
    const newSummary: LessonSummary = {
      ...summaryData,
      id: `ls-${Date.now()}`
    };
    setState(prev => ({
      ...prev,
      lessonSummaries: [...(prev.lessonSummaries || []), newSummary]
    }));
  };

  const submitReport = (classId: string, trimester: 1 | 2 | 3) => {
    setState(prev => {
      const existing = prev.reports.find(r => r.classId === classId && r.trimester === trimester);
      if (existing) {
        return {
          ...prev,
          reports: prev.reports.map(r => r.id === existing.id ? { ...r, status: 'submitted_to_director' } : r)
        };
      } else {
        const newReport: TrimesterReport = {
          id: Math.random().toString(36).substr(2, 9),
          schoolId: prev.currentUser?.schoolId || '',
          classId,
          trimester,
          status: 'submitted_to_director'
        };
        return { ...prev, reports: [...prev.reports, newReport] };
      }
    });
  };

  const signReport = (reportId: string) => {
    setState(prev => ({
      ...prev,
      reports: prev.reports.map(r => r.id === reportId ? { ...r, status: 'signed_by_director' } : r)
    }));
  };

  const publishReport = (reportId: string) => {
    setState(prev => ({
      ...prev,
      reports: prev.reports.map(r => r.id === reportId ? { ...r, status: 'published' } : r)
    }));
  };

  const issueDeclaration = (declarationData: {
    studentId: string;
    academicYear: number;
    gradeLevel: string;
    className?: string;
    schoolName?: string;
    directorName?: string;
    secretaryName?: string;
    status?: 'Transitou' | 'Não Transitou';
    finalAverage?: number;
    gradesSnapshot?: any[];
    exemplar?: string;
  }): IssuedDeclaration => {
    const randomHex = Math.random().toString(16).substring(2, 10).toUpperCase();
    const hash = `SHA256:MZ-MINEDH-${declarationData.academicYear}-${randomHex}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
    const code = `DEC-MZ-${declarationData.academicYear}-${declarationData.gradeLevel.replace(/[^0-9]/g, '') || '10'}C-${declarationData.studentId.toUpperCase()}`;
    const issuedDate = new Date().toLocaleDateString('pt-MZ', { day: '2-digit', month: '2-digit', year: 'numeric' });

    const newDeclaration: IssuedDeclaration = {
      id: `decl-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      studentId: declarationData.studentId,
      academicYear: declarationData.academicYear,
      gradeLevel: declarationData.gradeLevel,
      className: declarationData.className || 'Turma A',
      schoolName: declarationData.schoolName || 'Escola Secundária Central',
      issuedAt: issuedDate,
      directorName: declarationData.directorName || 'Prof. Doutor Zacarias Manuel Tembe',
      secretaryName: declarationData.secretaryName || 'Dra. Ana Beatriz Machava',
      status: declarationData.status || 'Transitou',
      finalAverage: declarationData.finalAverage || 14,
      digitalSignatureHash: hash,
      verificationCode: code,
      stamped: true,
      electronicallySigned: true,
      gradesSnapshot: declarationData.gradesSnapshot || [],
      exemplar: declarationData.exemplar || 'Original para o aluno'
    };

    setState(prev => {
      // 1. Update the student:
      const updatedStudents = prev.students.map(st => {
        if (st.id !== declarationData.studentId) return st;

        // Update academic history with this completed year/grade
        const existingHistory = st.academicHistory || [];
        const resultLabel = declarationData.status === 'Não Transitou' ? 'Não Transitou' : `Aprovado (Média: ${declarationData.finalAverage || 14}v)`;
        const historyIndex = existingHistory.findIndex(h => Number(h.year) === declarationData.academicYear);
        
        let newHistory = [...existingHistory];
        if (historyIndex >= 0) {
          newHistory[historyIndex] = {
            year: declarationData.academicYear,
            grade: declarationData.gradeLevel,
            school: declarationData.schoolName || 'Escola Secundária Central',
            result: resultLabel
          };
        } else {
          newHistory.push({
            year: declarationData.academicYear,
            grade: declarationData.gradeLevel,
            school: declarationData.schoolName || 'Escola Secundária Central',
            result: resultLabel
          });
        }

        // Update attachedDocuments
        const updatedAttached = {
          ...(st.attachedDocuments || {}),
          declarationOfGrades: true,
          qualificationsCertificate: true
        };

        // Update student's issuedDeclarations
        const studentDeclarations = [
          newDeclaration,
          ...(st.issuedDeclarations || []).filter(d => d.academicYear !== declarationData.academicYear || d.gradeLevel !== declarationData.gradeLevel)
        ];

        return {
          ...st,
          academicHistory: newHistory,
          attachedDocuments: updatedAttached,
          issuedDeclarations: studentDeclarations
        };
      });

      // Filter out duplicate declarations for the same student, year & grade
      const filteredDeclarations = (prev.issuedDeclarations || []).filter(
        d => !(d.studentId === declarationData.studentId && d.academicYear === declarationData.academicYear && d.gradeLevel === declarationData.gradeLevel)
      );

      return {
        ...prev,
        students: updatedStudents,
        issuedDeclarations: [newDeclaration, ...filteredDeclarations]
      };
    });

    return newDeclaration;
  };

  // 1. Financial Actions
  const addFinancialTransaction = (transaction: Omit<FinancialTransaction, 'id'>) => {
    const newTx: FinancialTransaction = {
      ...transaction,
      id: `tx-${Date.now()}-${Math.floor(Math.random() * 1000)}`
    };
    setState(prev => ({
      ...prev,
      financialTransactions: [newTx, ...prev.financialTransactions]
    }));
  };

  const updateFinancialStatus = (id: string, status: 'pago' | 'pendente' | 'cancelado') => {
    setState(prev => ({
      ...prev,
      financialTransactions: prev.financialTransactions.map(tx => tx.id === id ? { ...tx, status } : tx)
    }));
  };

  // 2. Patrimony Actions
  const addPatrimonyItem = (item: Omit<PatrimonyItem, 'id'>) => {
    const newItem: PatrimonyItem = {
      ...item,
      id: `pat-${Date.now()}-${Math.floor(Math.random() * 1000)}`
    };
    setState(prev => ({
      ...prev,
      patrimonyItems: [newItem, ...prev.patrimonyItems]
    }));
  };

  const updatePatrimonyItem = (id: string, updates: Partial<PatrimonyItem>) => {
    setState(prev => ({
      ...prev,
      patrimonyItems: prev.patrimonyItems.map(p => p.id === id ? { ...p, ...updates } : p)
    }));
  };

  const addPatrimonyMovement = (movement: Omit<PatrimonyMovement, 'id'>) => {
    const newMov: PatrimonyMovement = {
      ...movement,
      id: `mov-${Date.now()}-${Math.floor(Math.random() * 1000)}`
    };
    setState(prev => ({
      ...prev,
      patrimonyMovements: [newMov, ...prev.patrimonyMovements]
    }));
  };

  // 3. Library Actions
  const addLibraryBook = (book: Omit<LibraryBook, 'id'>) => {
    const newBook: LibraryBook = {
      ...book,
      id: `book-${Date.now()}-${Math.floor(Math.random() * 1000)}`
    };
    setState(prev => ({
      ...prev,
      libraryBooks: [newBook, ...prev.libraryBooks]
    }));
  };

  const borrowBook = (loanData: Omit<LibraryLoan, 'id' | 'status'>) => {
    const newLoan: LibraryLoan = {
      ...loanData,
      id: `loan-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      status: 'Activo'
    };
    setState(prev => ({
      ...prev,
      libraryLoans: [newLoan, ...prev.libraryLoans],
      libraryBooks: prev.libraryBooks.map(b => b.id === loanData.bookId ? { ...b, availableCopies: Math.max(0, b.availableCopies - 1) } : b)
    }));
  };

  const returnBook = (loanId: string, returnDate?: string) => {
    const finalDate = returnDate || new Date().toISOString().split('T')[0];
    setState(prev => {
      const loan = prev.libraryLoans.find(l => l.id === loanId);
      if (!loan) return prev;
      return {
        ...prev,
        libraryLoans: prev.libraryLoans.map(l => l.id === loanId ? { ...l, returnDate: finalDate, status: 'Devolvido' as const } : l),
        libraryBooks: prev.libraryBooks.map(b => b.id === loan.bookId ? { ...b, availableCopies: b.availableCopies + 1 } : b)
      };
    });
  };

  // 4. HR Actions
  const addHRContract = (contract: Omit<HRContract, 'id'>) => {
    const newContract: HRContract = {
      ...contract,
      id: `ctr-${Date.now()}-${Math.floor(Math.random() * 1000)}`
    };
    setState(prev => ({
      ...prev,
      hrContracts: [newContract, ...prev.hrContracts]
    }));
  };

  const addHRLeave = (leave: Omit<HRLeave, 'id' | 'status'>) => {
    const newLeave: HRLeave = {
      ...leave,
      id: `leave-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      status: 'Pendente'
    };
    setState(prev => ({
      ...prev,
      hrLeaves: [newLeave, ...prev.hrLeaves]
    }));
  };

  const approveHRLeave = (leaveId: string, approved: boolean, approverName: string) => {
    setState(prev => ({
      ...prev,
      hrLeaves: prev.hrLeaves.map(l => l.id === leaveId ? { ...l, status: approved ? 'Aprovado' as const : 'Rejeitado' as const, approvedBy: approverName } : l)
    }));
  };

  const addHRPromotion = (promotion: Omit<HRPromotion, 'id'>) => {
    const newProm: HRPromotion = {
      ...promotion,
      id: `prm-${Date.now()}-${Math.floor(Math.random() * 1000)}`
    };
    setState(prev => ({
      ...prev,
      hrPromotions: [newProm, ...prev.hrPromotions]
    }));
  };

  const addHRTraining = (training: Omit<HRTraining, 'id'>) => {
    const newTrn: HRTraining = {
      ...training,
      id: `trn-${Date.now()}-${Math.floor(Math.random() * 1000)}`
    };
    setState(prev => ({
      ...prev,
      hrTrainings: [newTrn, ...prev.hrTrainings]
    }));
  };

  // 5. Reception Actions
  const addReceptionVisitor = (visitor: Omit<ReceptionVisitor, 'id' | 'status'>) => {
    const newVis: ReceptionVisitor = {
      ...visitor,
      id: `vis-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      status: 'Aguardando'
    };
    setState(prev => ({
      ...prev,
      receptionVisitors: [newVis, ...prev.receptionVisitors]
    }));
  };

  const updateVisitorStatus = (id: string, status: 'Em Atendimento' | 'Concluído' | 'Aguardando') => {
    setState(prev => ({
      ...prev,
      receptionVisitors: prev.receptionVisitors.map(v => v.id === id ? { 
        ...v, 
        status, 
        exitTime: status === 'Concluído' ? new Date().toLocaleTimeString('pt-MZ', { hour: '2-digit', minute: '2-digit' }) : v.exitTime 
      } : v)
    }));
  };

  const addReceptionTicket = (ticket: Omit<ReceptionTicket, 'id' | 'status' | 'requestedAt'>) => {
    const newTicket: ReceptionTicket = {
      ...ticket,
      id: `tkt-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      requestedAt: new Date().toLocaleTimeString('pt-MZ', { hour: '2-digit', minute: '2-digit' }),
      status: 'Aguardando'
    };
    setState(prev => ({
      ...prev,
      receptionTickets: [newTicket, ...prev.receptionTickets]
    }));
  };

  const callReceptionTicket = (id: string) => {
    setState(prev => ({
      ...prev,
      receptionTickets: prev.receptionTickets.map(t => t.id === id ? { 
        ...t, 
        status: 'Chamado' as const, 
        calledAt: new Date().toLocaleTimeString('pt-MZ', { hour: '2-digit', minute: '2-digit' }) 
      } : t)
    }));
  };

  // 6. Archive Actions
  const addArchiveRecord = (record: Omit<ArchiveRecord, 'id'>) => {
    const newRec: ArchiveRecord = {
      ...record,
      id: `arq-${Date.now()}-${Math.floor(Math.random() * 1000)}`
    };
    setState(prev => ({
      ...prev,
      archiveRecords: [newRec, ...prev.archiveRecords]
    }));
  };

  // 7. Schedule Actions
  const addClassSchedule = (schedule: Omit<ClassSchedule, 'id'>) => {
    const newSch: ClassSchedule = {
      ...schedule,
      id: `sch-${Date.now()}-${Math.floor(Math.random() * 1000)}`
    };
    setState(prev => ({
      ...prev,
      classSchedules: [newSch, ...prev.classSchedules]
    }));
  };

  // 8. AI Actions
  const generateAIReport = (report: Omit<AIReportGeneration, 'id' | 'generatedAt'>) => {
    const newRep: AIReportGeneration = {
      ...report,
      id: `air-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      generatedAt: new Date().toISOString()
    };
    setState(prev => ({
      ...prev,
      aiReports: [newRep, ...prev.aiReports]
    }));
  };

  return (
    <StoreContext.Provider value={{
      ...state,
      login,
      logout,
      enrollStudent,
      addEmployee,
      deleteEmployee,
      updateEmployee,
      assignClasses,
      addGrade,
      addExamGrade,
      addLessonSummary,
      submitReport,
      signReport,
      publishReport,
      issueDeclaration,
      addCollectionPeriod,
      publishCollectionPeriod,
      submitCollectionForm,
      sendChatMessage,
      submitTransferRequest,
      submitComplaint,
      updateSchoolChoice,
      addSchool,
      removeSchool,
      toggleHighContrast,
      lockClassGrades,
      archiveAcademicData,
      sendEmailNotification,
      updateSmtpSettings,
      testSmtpConnection,
      triggerTrimesterCloseEmailToTeachers,
      updateUserSignature,
      addFinancialTransaction,
      updateFinancialStatus,
      addPatrimonyItem,
      updatePatrimonyItem,
      addPatrimonyMovement,
      addLibraryBook,
      borrowBook,
      returnBook,
      addHRContract,
      addHRLeave,
      approveHRLeave,
      addHRPromotion,
      addHRTraining,
      addReceptionVisitor,
      updateVisitorStatus,
      addReceptionTicket,
      callReceptionTicket,
      addArchiveRecord,
      addClassSchedule,
      generateAIReport
    }}>
      {children}
    </StoreContext.Provider>
  );
}

export function useStore() {
  const context = useContext(StoreContext);
  if (!context) {
    throw new Error('useStore must be used within a StoreProvider');
  }
  return context;
}
