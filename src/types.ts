export interface AcademicArchive {
  id: string;
  year: number;
  classId: string;
  grades: Grade[];
  examGrades: ExamGrade[];
  archivedAt: string;
}

export type Role = 
  | 'admin' 
  | 'director' 
  | 'pedagogical' 
  | 'teacher' 
  | 'secretariat' 
  | 'secretariat_rh' 
  | 'secretariat_patrimonio' 
  | 'secretariat_recepcao' 
  | 'secretariat_arquivo' 
  | 'secretariat_financas' 
  | 'librarian' 
  | 'guardian' 
  | 'national' 
  | 'provincial' 
  | 'district' 
  | 'student';

export interface User {
  id: string;
  name: string;
  area?: "CS" | "MCN" | "APTP";
  email: string;
  role: Role;
  subRole?: string;
  department?: string;
  schoolId?: string;
  districtId?: string;
  provinceId?: string;
  signature?: string;
  studentId?: string;
  guardianStudentIds?: string[];
  avatarUrl?: string;
}

export interface Province {
  id: string;
  name: string;
}

export interface District {
  id: string;
  name: string;
  provinceId: string;
}

export type SchoolManagementType = 'estatal' | 'privado';

export type SchoolLevelType = 
  | 'EP1'
  | 'EP2'
  | 'ENSINO BÁSICO'
  | 'ENSINO SECUNDÁRIO DO 1 CICLO'
  | 'ENSINO SECUNDÁRIO DO 2 CICLO'
  | 'ENSINO PRÉ-UNIVERSITÁRIO'
  | 'ENSINO TÉCNICO PROFISSIONAL'
  | 'ENSINO MÉDIO PROFISSIONAL';

export interface School {
  id: string;
  name: string;
  code?: string;
  logoUrl?: string;
  managementType?: SchoolManagementType;
  province?: string;
  district?: string;
  districtId?: string;
  locality?: string;
  administrativePost?: string;
  address: string;
  schoolTypes?: SchoolLevelType[];
  directorName?: string;
  dapName?: string;
  secretariatChiefName?: string;
  phone?: string;
  email?: string;
  shifts?: string[];
  area?: "CS" | "MCN" | "APTP";
  studentCapacity?: number;
  autoAssignedClasses?: string[];
  autoAssignedSubjects?: string[];
}

// Data Collection and Scheduling
export interface CollectionPeriod {
  id: string;
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  status: 'draft' | 'published' | 'closed';
  createdByRole: Role;
  targetLevel: 'provincial' | 'district' | 'school';
  createdAt: string;
}

export interface CollectionForm {
  id: string;
  periodId: string;
  responderId: string; // User ID
  responderRole: Role;
  responderLevelId: string; // provinceId, districtId, or schoolId
  data: any; // Flexible JSON for form responses
  status: 'draft' | 'submitted';
  submittedAt?: string;
}

export interface ChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  senderRole: Role;
  receiverLevel: 'national' | 'provincial' | 'district' | 'school' | 'admin' | 'all';
  receiverId?: string; // specific provinceId, districtId, etc.
  receiverName?: string;
  subject?: string;
  text: string;
  timestamp: string;
  read?: boolean;
  category?: 'suporte' | 'oficial' | 'geral';
}

export interface PreviousSchool {
  entryDate: string;
  exitDate: string;
  schoolName: string;
  district: string;
  province: string;
  grade: string;
  className: string;
}

export interface AttachedDocuments {
  birthCertificate?: boolean;
  idCard?: boolean;
  qualificationsCertificate?: boolean;
  medicalCertificate?: boolean;
  passPhotos?: boolean;
  residenceDeclaration?: boolean;
  paymentProof?: boolean;
  declarationOfGrades?: boolean;
}

export interface GradeSnapshotItem {
  subjectId: string;
  subjectName: string;
  acs1?: number;
  acs2?: number;
  acs3?: number;
  apt?: number;
  media: number;
  words?: string;
}

export interface IssuedDeclaration {
  id: string;
  studentId: string;
  academicYear: number;
  gradeLevel: string;
  className?: string;
  schoolName?: string;
  issuedAt: string;
  directorName: string;
  secretaryName: string;
  status: 'Transitou' | 'Não Transitou';
  finalAverage: number;
  digitalSignatureHash: string;
  verificationCode: string;
  stamped: boolean;
  electronicallySigned: boolean;
  gradesSnapshot: GradeSnapshotItem[];
  exemplar?: string;
}

export interface AcademicHistoryEntry {
  year: string | number;
  grade: string;
  school: string;
  result: string;
}

export interface StudentOccurrence {
  date: string;
  description: string;
  responsible: string;
}

export interface StudentAttendance {
  month: string;
  presences: number;
  justifiedAbsences: number;
  unjustifiedAbsences: number;
}

export interface Student {
  id: string;
  iue?: string; // Identificador Único do Estudante (Padrão MINEDH: [INICIAIS]-[DOC]-[ESCOLA]/[PROV]/[DIST]/[ANO])
  nim?: string; // Número Interno de Matrícula (Padrão Diário: [ANO]-[DIST]-[SEQ])
  schoolId: string;
  name: string;
  frequencyNumber?: number; // Número fixo de identificação por ano letivo durante a frequência (não substituível)
  studentNumber?: string; // Número do Aluno
  processCode?: string; // Código do Processo
  course?: string; // Curso (ex: Ensino Secundário Geral)
  academicYear?: number; // Ano Lectivo
  openingDate?: string; // Data de Abertura do Processo
  area?: "CS" | "MCN" | "APTP";
  birthDate: string; // YYYY-MM-DD
  enrollmentDate: string;
  classId?: string;
  status: 'active' | 'graduated' | 'transferred';
  
  // 1. Identificação do Aluno
  gender?: string;
  isNewAdmission?: boolean; // Novo Ingresso no ano letivo
  entryType?: 'novo_ingresso' | 'continuacao' | 'repetente';
  nationality?: string;
  birthPlace?: string;
  maritalStatus?: string; // Estado Civil
  idCardNumber?: string;
  idCardIssuedAt?: string; // Emitido em
  nuit?: string; // NUIT
  
  // Endereço
  province?: string;
  district?: string;
  administrativePost?: string; // Posto Administrativo
  neighborhood?: string; // Bairro
  address?: string;
  phone?: string;
  email?: string;
  
  // 2. Filiação
  fatherName?: string;
  fatherProfession?: string;
  fatherPhone?: string;
  
  motherName?: string;
  motherProfession?: string;
  motherPhone?: string;
  
  guardianName?: string;
  guardianProfession?: string;
  guardianPhone?: string;
  guardianKinship?: string;
  guardianAddress?: string;
  
  // 3. Documentos Anexos
  attachedDocuments?: AttachedDocuments;
  
  // 4. Histórico Académico
  academicHistory?: AcademicHistoryEntry[];
  previousSchools?: PreviousSchool[];

  // 5. Matrícula
  regime?: string; // Diurno / Nocturno / Geral
  shift?: string; // Manhã / Tarde / Noite
  entryGrade?: string; // Classe de Ingresso
  enrollmentStatus?: 'Activo' | 'Transferido' | 'Desistente' | 'Concluído';

  // 7. Registo de Ocorrências
  occurrences?: StudentOccurrence[];

  // 8. Assiduidade
  attendance?: StudentAttendance[];

  // 9. Transferência ou Conclusão
  transferDate?: string;
  transferReason?: string;
  transferDestination?: string;

  // 10. Observações Gerais
  generalObservations?: string;

  // 11. Declarações e Documentos Oficiais Emitidos
  issuedDeclarations?: IssuedDeclaration[];
  nextSchoolId?: string;
}

export interface Class {
  id: string;
  schoolId: string;
  name: string;
  area?: "CS" | "MCN" | "APTP"; // e.g. "Turma A"
  gradeLevel: string; // e.g. "10ª Classe"
  year: number;
  period?: "Manhã" | "Tarde" | "Noite";
}

export interface Subject {
  id: string;
  name: string;
  area?: "CS" | "MCN" | "APTP";
}

export interface TransferRequest {
  id: string;
  studentId: string;
  currentSchoolId: string;
  targetSchoolId: string;
  targetDistrictId: string;
  targetProvinceId: string;
  reason: string;
  proofOfPaymentUrl: string;
  status: 'pending' | 'approved' | 'rejected';
  requestedAt: string;
}

export interface AcademicComplaint {
  id: string;
  studentId: string;
  subjectId: string;
  trimester: number;
  description: string;
  status: 'pending' | 'resolved';
  createdAt: string;
}

export interface TeacherAssignment {
  id: string;
  teacherId: string;
  classId: string;
  subjectId: string;
}

export interface LessonSummary {
  id: string;
  assignmentId: string;
  date: string;
  lessonNumber: number;
  topic: string;
  objectives: string;
  status: 'planned' | 'completed';
}

export interface Grade {
  id: string;
  studentId: string;
  classId: string;
  subjectId: string;
  teacherId: string;
  trimester: 1 | 2 | 3;
  acs1?: number;
  acs2?: number;
  acs3?: number;
  mediaAcs?: number;
  trabalho1?: number;
  trabalho2?: number;
  mediaTrabalho?: number;
  apt?: number;
  media?: number;
  isLocked: boolean; // Once launched, cannot be altered
}

export interface ExamGrade {
  id: string;
  studentId: string;
  classId: string;
  subjectId: string;
  teacherId: string;
  mediaFrequencia: number; // MF
  notaExame: number; // NE (0 a 20)
  classificacaoFinal: number; // CF
  resultado: 'Aprovado' | 'Reprovado' | 'Dispensado' | 'Excluído';
  isLocked: boolean;
  launchedAt?: string;
}

export interface TrimesterReport {
  id: string;
  schoolId: string;
  classId: string;
  trimester: 1 | 2 | 3;
  status: 'draft' | 'submitted_to_director' | 'signed_by_director' | 'published';
}

export interface Employee {
  id: string;
  schoolId: string;
  name: string;
  area?: "CS" | "MCN" | "APTP";
  gender: string;
  nuit: string;
  email: string;
  phone: string;
  maritalStatus: string;
  fatherName: string;
  motherName: string;
  idCardNumber: string;
  idCardIssuedAt: string;
  idCardIssuedDate: string;
  
  nationality: string;
  birthProvince: string;
  birthDistrict: string;
  birthDate: string;
  address: string;
  neighborhood: string;
  residenceDistrict: string;
  cell: string;
  blockNo: string;
  houseNo: string;
  childrenCount: number;

  career: string;
  category: string;
  roleFunction: string;
  isEffective: string;
  contractType: string;
  contractLink: string;
  admissionDate: string;
  academicLevel: string;
  trainingArea: string;
  leadershipRole?: string; // Cargo de Chefia
  department?: string; // Alocação: Secretaria, Biblioteca, etc.

  taughtSubjects: string[];
}

export interface AcademicEvent {
  id: string;
  title: string;
  description?: string;
  message?: string;
  date: string; // YYYY-MM-DD (compatibilidade)
  startDate: string; // YYYY-MM-DD
  endDate: string; // YYYY-MM-DD
  location: string; // Lugar
  roomNumber: string; // Número da sala
  targetAudience: string; // Público-alvo
  category: 'feriado' | 'prazo' | 'evento' | 'reuniao';
  recipients?: { id: string; name: string; role: string; email?: string }[];
  creatorName: string;
  creatorRole: string;
  schoolId?: string;
  createdAt?: string;
}

export interface UserNotification {
  id: string;
  title: string;
  message: string;
  eventId?: string;
  eventDetails?: AcademicEvent;
  senderName: string;
  senderRole: string;
  recipientId: string; // Employee ID or User ID
  recipientName: string;
  isRead: boolean;
  createdAt: string;
}

export interface EmailNotification {
  id: string;
  teacherEmail: string;
  teacherName: string;
  subject: string;
  message: string;
  classId?: string;
  className?: string;
  sentAt: string;
  status: 'SENT' | 'FAILED';
}

export interface SmtpSettings {
  host: string;
  port: number;
  username: string;
  password?: string;
  encryption: 'TLS' | 'SSL' | 'NONE';
  senderName: string;
  senderEmail: string;
  replyTo?: string;
  isActive: boolean;
  lastTestedAt?: string;
  autoSendOnTrimesterClose: boolean;
}

// 7. Gestão Financeira
export interface FinancialTransaction {
  id: string;
  schoolId: string;
  type: 'receita' | 'despesa';
  category: 'Propinas' | 'Taxas' | 'Multas' | 'Outros Serviços' | 'Salários' | 'Material Escolar' | 'Água' | 'Energia' | 'Manutenção' | 'Investimento';
  amount: number;
  date: string;
  description: string;
  referenceNumber: string;
  studentId?: string;
  studentName?: string;
  employeeId?: string;
  payerBeneficiary: string;
  paymentMethod: 'M-Pesa' | 'e-Mola' | 'Transferência Bancária' | 'POS' | 'Numerário' | 'Cheque';
  status: 'pago' | 'pendente' | 'cancelado';
  receiptUrl?: string;
  month?: string;
  year: number;
}

// 8. Gestão Patrimonial
export interface PatrimonyItem {
  id: string;
  schoolId: string;
  code: string;
  name: string;
  category: 'Computadores' | 'Mobiliário' | 'Equipamentos' | 'Viaturas' | 'Laboratórios';
  status: 'Bom' | 'Regular' | 'Danificado' | 'Em Manutenção' | 'Abatido';
  locationRoom: string;
  acquisitionDate: string;
  acquisitionValue: number;
  serialNumber?: string;
  responsiblePerson: string;
  notes?: string;
  lastMaintenanceDate?: string;
}

export interface PatrimonyMovement {
  id: string;
  schoolId: string;
  itemId: string;
  itemName: string;
  type: 'Aquisição' | 'Movimentação' | 'Manutenção' | 'Abate';
  date: string;
  fromLocation?: string;
  toLocation?: string;
  reason: string;
  registeredBy: string;
  documentRef?: string;
}

// 9. Biblioteca Escolar
export interface LibraryBook {
  id: string;
  schoolId: string;
  title: string;
  author: string;
  isbn: string;
  category: string;
  gradeLevel?: string;
  totalCopies: number;
  availableCopies: number;
  shelfLocation: string;
  yearPublished?: number;
  publisher?: string;
}

export interface LibraryLoan {
  id: string;
  schoolId: string;
  bookId: string;
  bookTitle: string;
  userType: 'aluno' | 'professor' | 'funcionario';
  userId: string;
  userName: string;
  loanDate: string;
  expectedReturnDate: string;
  returnDate?: string;
  status: 'Activo' | 'Devolvido' | 'Atrasado';
  penaltyAmount?: number;
  notes?: string;
}

// 10. Recursos Humanos (RH)
export interface HRContract {
  id: string;
  employeeId: string;
  employeeName: string;
  schoolId: string;
  contractType: 'Nomeação Definitiva' | 'Contrato de Trabalho a Termo Certo' | 'Eventual' | 'Prestação de Serviços';
  startDate: string;
  endDate?: string;
  salaryGrade: string;
  status: 'Activo' | 'Renovado' | 'Cessado' | 'Em Avaliação';
  position: string;
}

export interface HRLeave {
  id: string;
  employeeId: string;
  employeeName: string;
  schoolId: string;
  type: 'Férias' | 'Licença de Doença' | 'Licença de Maternidade/Paternidade' | 'Casamento' | 'Luto' | 'Formação' | 'Assuntos Pessoais';
  startDate: string;
  endDate: string;
  totalDays: number;
  status: 'Pendente' | 'Aprovada' | 'Rejeitada';
  approvedBy?: string;
  documentProofUrl?: string;
  reason?: string;
}

export interface HRPromotion {
  id: string;
  employeeId: string;
  employeeName: string;
  schoolId: string;
  previousCategory: string;
  newCategory: string;
  date: string;
  officialBulletinNumber?: string;
  approvedBy: string;
}

export interface HRTraining {
  id: string;
  employeeId: string;
  employeeName: string;
  schoolId: string;
  courseTitle: string;
  institution: string;
  hours: number;
  completionDate: string;
  certificateStatus: 'Concluído' | 'Em Curso' | 'Agendado';
}

// Secretaria: Atendimento / Recepção
export interface ReceptionVisitor {
  id: string;
  schoolId: string;
  visitorName: string;
  idCard: string;
  phone: string;
  reason: 'Matrículas/Secretaria' | 'Reunião com Direcção' | 'Contacto com Professor' | 'Levantamento de Documentos' | 'Informações Gerais' | 'Outro';
  departmentTarget: string;
  entryTime: string;
  exitTime?: string;
  status: 'Em Atendimento' | 'Concluído' | 'Aguardando';
  attendantName: string;
  notes?: string;
}

export interface ReceptionTicket {
  id: string;
  schoolId: string;
  ticketNumber: string;
  serviceType: 'Secretaria Geral' | 'Tesouraria' | 'Matrículas' | 'Declarações e Certificados' | 'Gabinete do Director';
  requestedAt: string;
  calledAt?: string;
  completedAt?: string;
  status: 'waiting' | 'in_service' | 'done';
}

// Secretaria: Arquivo Escolar
export interface ArchiveRecord {
  id: string;
  schoolId: string;
  code: string;
  title: string;
  recordType: 'Processo Individual de Aluno' | 'Livro de Termos de Exames' | 'Livro de Matrículas' | 'Pauta Histórica' | 'Dossiê de Funcionário' | 'Ofício/Expediente';
  year: number;
  boxNumber: string;
  shelfNumber: string;
  roomNumber: string;
  digitalCopyUrl?: string;
  status: 'Arquivado' | 'Em Consulta' | 'Transferido';
  notes?: string;
}

// Horários e Salas
export interface ClassSchedule {
  id: string;
  schoolId: string;
  classId: string;
  className: string;
  dayOfWeek: 'Segunda-feira' | 'Terça-feira' | 'Quarta-feira' | 'Quinta-feira' | 'Sexta-feira' | 'Sábado';
  timeSlot: string;
  subjectId: string;
  subjectName: string;
  teacherId: string;
  teacherName: string;
  room: string;
}

export interface SchoolRoom {
  id: string;
  schoolId: string;
  name: string;
  capacity: number;
  type: 'Sala Normal' | 'Laboratório de Informática' | 'Laboratório de Ciências' | 'Biblioteca' | 'Ginásio/Polidesportivo' | 'Oficina';
  status: 'Disponível' | 'Ocupada' | 'Em Manutenção';
}

// 14. Inteligência Artificial Educacional
export interface AIPrediction {
  studentId: string;
  studentName: string;
  classId: string;
  className: string;
  dropOutRiskScore: number; // 0-100%
  riskLevel: 'Baixo' | 'Médio' | 'Alto';
  riskFactors: string[];
  recommendedInterventions: string[];
  predictedFinalAverage: number;
  attendanceRate: number;
  generatedAt: string;
}

export interface AIReportGeneration {
  id: string;
  schoolId: string;
  title: string;
  category: 'Desempenho Pedagógico' | 'Previsão de Abandono' | 'Planeamento Escolar' | 'Relatório Executivo';
  content: string;
  generatedAt: string;
  author: string;
}

