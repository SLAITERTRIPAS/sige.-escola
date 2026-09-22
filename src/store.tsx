import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, School, Student, Class, Subject, TeacherAssignment, Grade, ExamGrade, LessonSummary, TrimesterReport, Employee, IssuedDeclaration, Province, District, CollectionPeriod, CollectionForm, ChatMessage, TransferRequest, AcademicComplaint } from './types';
import { initialData } from './mockData';
import { generateEmployeeId } from './data/mozambiqueLocations';

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
  currentUser: User | null;
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
      currentUser: null
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

  const enrollStudent = (studentData: Omit<Student, 'id' | 'classId' | 'status'>) => {
    const newStudent: Student = {
      ...studentData,
      id: Math.random().toString(36).substr(2, 9),
      status: 'active',
    };
    setState(prev => {
      const updatedStudents = [...prev.students, newStudent];
      return { ...prev, students: updatedStudents };
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
      updateSchoolChoice
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
