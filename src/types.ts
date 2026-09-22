export type Role = 'admin' | 'director' | 'pedagogical' | 'teacher' | 'secretariat' | 'national' | 'provincial' | 'district' | 'student';

export interface User {
  id: string;
  name: string;
  area?: "CS" | "MCN" | "APTP";
  email: string;
  role: Role;
  schoolId?: string;
  districtId?: string;
  provinceId?: string;
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

export interface School {
  id: string;
  name: string;
  area?: "CS" | "MCN" | "APTP";
  address: string;
  districtId?: string;
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
  receiverLevel: 'national' | 'provincial' | 'district' | 'school';
  receiverId?: string; // specific provinceId, districtId, etc.
  text: string;
  timestamp: string;
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
  resultado: 'Aprovado' | 'Reprovado';
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
