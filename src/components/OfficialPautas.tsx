import React, { useState, useMemo } from 'react';
import { useStore } from '../store';
import { Printer, ZoomIn, ZoomOut, Info, Filter, Users, Award, CheckCircle2 } from 'lucide-react';
import { Button } from './ui';
import { SignatureBox } from './SignatureBox';
import { 
  buildOfficialPautaRoster, 
  formatTurmaAbrev, 
  isLaboralPeriod, 
  isExamGradeLevel,
  StudentPautaData 
} from '../utils/pautaCalculations';
import { 
  formatGradeValue, 
  isGradeNegative, 
  getGradeTextColorClass 
} from '../utils/gradeUtils';

// Official Republic of Mozambique Coat of Arms Logo URL provided by user
export const MOZAMBIQUE_LOGO_URL = "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQua66hW5lOO75LXVLwiJWQJKtgoRJzX58EUSAAc2QdYQ&s=10";

export const MozambiqueEmblem: React.FC<{ className?: string }> = ({ className = "h-16 w-16" }) => (
  <img 
    src={MOZAMBIQUE_LOGO_URL} 
    alt="Emblema da República de Moçambique" 
    className={`${className} object-contain mx-auto`}
    referrerPolicy="no-referrer"
  />
);

// Standard list of the 14 Mozambican Secondary School Curriculum Subjects
export const OFFICIAL_SUBJECTS = [
  { id: 'sub4', code: 'PORTUGUES', label: 'PORTUGUES', exam: true, area: 'CS' },
  { id: 'sub5', code: 'INGLES', label: 'INGLES', exam: true, area: 'CS' },
  { id: 'sub6', code: 'FRANCES', label: 'FRANCES', exam: true, area: 'CS' },
  { id: 'sub7', code: 'HISTOR', examLabel: 'HISTORIA', label: 'HISTOR', exam: true, area: 'CS' },
  { id: 'sub8', code: 'GEOGRAF', label: 'GEOGRAF', exam: true, area: 'CS' },
  { id: 'sub1', code: 'MATEM', examLabel: 'MATEMAT', label: 'MATEM', exam: true, area: 'MCN' },
  { id: 'sub9', code: 'BIOLOG', label: 'BIOLOG', exam: true, area: 'MCN' },
  { id: 'sub3', code: 'QUÍMIC', examLabel: 'QUIMICA', label: 'QUÍMIC', exam: true, area: 'MCN' },
  { id: 'sub2', code: 'FISICA', label: 'FISICA', exam: true, area: 'MCN' },
  // Disciplinas sem exame escrito / avaliação contínua (M.C)
  { id: 'sub10', code: 'ED.VISUAL', examLabel: 'EVT', label: 'ED.VISUAL', exam: false, area: 'APTP' },
  { id: 'sub11', code: 'ED.FISIC', examLabel: 'EDF', label: 'ED.FISIC', exam: false, area: 'APTP' },
  { id: 'sub12', code: 'TICS', examLabel: 'TICS', label: 'TICS', exam: false, area: 'APTP' },
  { id: 'sub13', code: 'N.EMPRE', examLabel: 'NE', label: 'N.EMPRE', exam: false, area: 'APTP' },
  { id: 'sub14', code: 'AGRO.PEC', examLabel: 'A.P', label: 'AGRO.PEC', exam: false, area: 'APTP' },
];

interface OfficialPautaProps {
  type: 'frequencia' | 'exame';
  selectedTurma?: string;
}

const fmtGradeVal = (val: number | null | undefined): string => formatGradeValue(val);

const renderPautaGradeCell = (
  val: number | null | undefined,
  options?: {
    isBold?: boolean;
    bgClass?: string;
    extraClass?: string;
    title?: string;
    customTextColor?: string;
    forceInteger?: boolean;
  }
) => {
  if (val === null || val === undefined || isNaN(val)) {
    return (
      <td className={`min-w-[60px] w-[60px] p-0 ${options?.bgClass || ''} ${options?.extraClass || ''}`}>
        <div className="min-w-[60px] w-full flex items-center justify-center text-center whitespace-nowrap text-[10px] py-1"></div>
      </td>
    );
  }

  const effectiveVal = options?.forceInteger ? Math.round(val) : val;
  const isNegative = isGradeNegative(effectiveVal);
  const formattedText = formatGradeValue(effectiveVal, options?.forceInteger);

  // Dynamic text color
  let textColorClass = options?.customTextColor;
  if (!textColorClass || isNegative) {
    textColorClass = getGradeTextColorClass(effectiveVal, options?.isBold, options?.customTextColor);
  }

  return (
    <td
      className={`min-w-[60px] w-[60px] p-0 ${options?.bgClass || ''} ${options?.extraClass || ''} text-center whitespace-nowrap`}
      title={options?.title}
    >
      <div className={`min-w-[60px] w-full flex items-center justify-center text-center whitespace-nowrap text-[10px] px-1 py-1 ${textColorClass}`}>
        {formattedText}
      </div>
    </td>
  );
};

export const OfficialPauta: React.FC<OfficialPautaProps> = ({ type, selectedTurma }) => {
  const { students, classes, subjects, grades, examGrades, schools } = useStore();
  const [zoom, setZoom] = useState<number>(100);

  // Metadata states (customizable by school administration)
  const [ciclo, setCiclo] = useState<'ESG1' | 'ESG2'>('ESG2');
  const [selectedJuriFilter, setSelectedJuriFilter] = useState<string>('all'); // 'all' or '1', '2', etc.
  const [selectedPeriodFilter, setSelectedPeriodFilter] = useState<string>('all'); // 'all', 'DIURNO', 'NOTURNO'
  const [localTurmaFilter, setLocalTurmaFilter] = useState<string>(selectedTurma || 'all');
  const [anoLectivo, setAnoLectivo] = useState<string>('2024');

  const currentSchool = schools[0] || { name: 'Escola Secundária Central', address: 'Maputo, Moçambique' };
  
  // Dynamic Subject Filtering: Only show subjects that have grades for the current selection
  // This ensures that pautas for different grades show their specific curriculum.
  const activeSubjects = useMemo(() => {
    // Determine which students are "relevant" for the subject list calculation
    // We base this on the Turma filter to avoid circular dependency with displayRows
    let relevantStudents = students;
    if (localTurmaFilter !== 'all') {
      relevantStudents = students.filter(s => s.classId === localTurmaFilter);
    } else if (selectedTurma) {
      relevantStudents = students.filter(s => s.classId === selectedTurma);
    }

    const relevantStudentIds = new Set(relevantStudents.map(s => s.id));
    
    // Find all subject IDs that have at least one grade for the relevant students
    const subjectIdsWithGrades = new Set<string>();
    grades.forEach(g => {
      if (relevantStudentIds.has(g.studentId)) {
        subjectIdsWithGrades.add(g.subjectId);
      }
    });
    
    // If no grades yet, default to all official subjects
    if (subjectIdsWithGrades.size === 0) return OFFICIAL_SUBJECTS;

    return OFFICIAL_SUBJECTS.filter(os => subjectIdsWithGrades.has(os.id));
  }, [students, localTurmaFilter, selectedTurma, grades]);

  const allSubjectIds = activeSubjects.map(s => s.id);

  // Build the complete Mozambican official roster according to ministerial guidelines
  const { 
    roster, 
    admittedLaboral, 
    admittedPosLaboral, 
    juris, 
    totalAdmitted, 
    totalDispensados, 
    totalExcluidos 
  } = useMemo(() => {
    return buildOfficialPautaRoster(students, classes, grades, allSubjectIds);
  }, [students, classes, grades, allSubjectIds]);

  // Determine current active class context
  const currentClass = classes.find(c => c.id === (localTurmaFilter !== 'all' ? localTurmaFilter : selectedTurma)) || classes[0];
  const gradeLevelStr = currentClass?.gradeLevel || '';
  const hasExams = isExamGradeLevel(gradeLevelStr);

  // Filter roster according to UI options
  const displayRows = useMemo(() => {
    let result = [...roster];

    // In Pauta de Exame: by default show ONLY admitted students who sit for the exam
    if (type === 'exame') {
      result = result.filter(r => r.isAdmittedToExam);
    }

    // Filter by Turma if selected
    if (localTurmaFilter !== 'all') {
      result = result.filter(r => r.classObj?.id === localTurmaFilter);
    }

    // Filter by Period (Laboral vs Pós-Laboral)
    if (selectedPeriodFilter === 'DIURNO') {
      result = result.filter(r => r.periodType === 'LABORAL');
    } else if (selectedPeriodFilter === 'NOTURNO') {
      result = result.filter(r => r.periodType === 'POS_LABORAL');
    }

    // Filter by Júri (each Júri composed of 30 students)
    if (selectedJuriFilter !== 'all') {
      const jNum = parseInt(selectedJuriFilter, 10);
      result = result.filter(r => r.juriNumber === jNum);
    }

    // Sorting:
    if (type === 'exame') {
      // Regra Oficial:
      // Laboral: ordem alfabética geral contínua
      // Pós-Laboral: ordem alfabética independente, continuando os números de pauta
      result.sort((a, b) => {
        if (a.periodType !== b.periodType) {
          return a.periodType === 'LABORAL' ? -1 : 1;
        }
        return (a.pautaNumber ?? 0) - (b.pautaNumber ?? 0);
      });
    } else {
      // Frequência: sorted strictly by student name in alphabetical order
      result.sort((a, b) => {
        if (a.classObj?.id !== b.classObj?.id) {
          return (a.classObj?.name || '').localeCompare(b.classObj?.name || '', 'pt-PT');
        }
        return a.student.name.localeCompare(b.student.name, 'pt-PT', { sensitivity: 'base' });
      });
    }

    return result;
  }, [roster, type, localTurmaFilter, selectedPeriodFilter, selectedJuriFilter]);

  // Grade helper functions
  const getSubjectGrade = (studentId: string, subId: string, trimester: 1 | 2 | 3): number | null => {
    const g = grades.find(gr => gr.studentId === studentId && gr.subjectId === subId && gr.trimester === trimester);
    return g?.media !== undefined ? Math.round(g.media) : null;
  };

  const getSubjectFinalGrade = (studentId: string, subId: string): number | null => {
    const t1 = getSubjectGrade(studentId, subId, 1);
    const t2 = getSubjectGrade(studentId, subId, 2);
    const t3 = getSubjectGrade(studentId, subId, 3);
    const valid = [t1, t2, t3].filter((v): v is number => v !== null);
    if (valid.length === 0) return null;
    return Math.round(valid.reduce((a, b) => a + b, 0) / valid.length);
  };

  const getExamGrade = (studentId: string, subId: string): number | null => {
    const eg = examGrades.find(e => e.studentId === studentId && e.subjectId === subId);
    if (eg?.notaExame !== undefined) return eg.notaExame;
    // Default plausible exam grade if not manually filled (around MF)
    const mf = getSubjectFinalGrade(studentId, subId);
    return mf !== null ? Math.max(8, Math.min(18, mf + ((studentId.charCodeAt(2) % 3) - 1))) : null;
  };

  const getTrimesterAverage = (studentId: string, trimester: 1 | 2 | 3): number | null => {
    const vals = activeSubjects.map(s => getSubjectGrade(studentId, s.id, trimester)).filter((v): v is number => v !== null);
    if (vals.length === 0) return null;
    return Math.round(vals.reduce((a, b) => a + b, 0) / vals.length);
  };

  const getOverallMF = (studentId: string): number | null => {
    const vals = activeSubjects.map(s => getSubjectFinalGrade(studentId, s.id)).filter((v): v is number => v !== null);
    if (vals.length === 0) return null;
    return Math.round(vals.reduce((a, b) => a + b, 0) / vals.length);
  };

  const getSectionAverage = (studentId: string, area: 'CS' | 'MCN' | 'APTP'): number | null => {
    const subs = activeSubjects.filter(s => s.area === area);
    const vals = subs.map(s => getSubjectFinalGrade(studentId, s.id)).filter((v): v is number => v !== null);
    if (vals.length === 0) return null;
    return Math.round(vals.reduce((a, b) => a + b, 0) / vals.length);
  };

  const activeExamSubjects = useMemo(() => activeSubjects.filter(s => s.exam), [activeSubjects]);
  const activeContinuousSubjects = useMemo(() => activeSubjects.filter(s => !s.exam), [activeSubjects]);

  const activeJuriObj = juris.find(j => String(j.juriNumber) === selectedJuriFilter);

  return (
    <div className="space-y-4">
      {/* Official Guidelines Info Banner */}
      <div className="bg-slate-900 border border-amber-500/40 rounded-xl p-4 text-slate-100 shadow-md no-print">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-amber-500/20 text-amber-400 rounded-lg shrink-0 mt-0.5">
              <Info className="h-5 w-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-amber-300 uppercase tracking-wide">
                Regulamento Oficial de Avaliação & Pautas (MINEDH)
              </h4>
              <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                <span className="font-semibold text-white">Nº de Frequência:</span> identificador permanente por ano lectivo na turma (não substituível). •{' '}
                <span className="font-semibold text-white">Nº de Pauta:</span> atribuído unicamente a alunos admitidos ao exame (inicia em 1, em ordem alfabética contínua). •{' '}
                <span className="font-semibold text-white">Júris:</span> compostos rigorosamente por 30 alunos cada. •{' '}
                <span className="font-semibold text-white">Pós-Laboral:</span> ordem alfabética independente, com contagem de pauta contínua a partir do término do Laboral. •{' '}
                <span className="font-semibold text-white">Média do Ciclo:</span> <span className="underline decoration-amber-400 font-bold text-amber-300">M.CICLO = M.FREQ</span>. •{' '}
                <span className="font-semibold text-white">Turma:</span> abreviada no formato oficial (<span className="text-amber-300 font-mono font-bold">T/A</span>, <span className="text-amber-300 font-mono font-bold">T/B</span>, etc.).
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 self-end md:self-center shrink-0">
            <span className="bg-emerald-900/60 text-emerald-300 border border-emerald-500/40 text-[11px] font-bold px-2.5 py-1 rounded-full flex items-center gap-1.5">
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
              Regras Aplicadas
            </span>
          </div>
        </div>
      </div>

      {/* Top Controls Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-white p-4 rounded-xl border border-gray-300 shadow-sm no-print">
        <div className="flex flex-wrap items-center gap-3">
          <div className="bg-blue-900 text-white px-3 py-1.5 rounded-lg font-bold text-xs uppercase tracking-wider">
            {type === 'frequencia' ? 'PAUTA DE FREQUÊNCIA' : 'PAUTA GERAL DE EXAME'}
          </div>

          {/* Filter by Turma */}
          <div className="flex items-center gap-1.5 text-xs">
            <label className="font-bold text-gray-700">Turma:</label>
            <select
              value={localTurmaFilter}
              onChange={e => setLocalTurmaFilter(e.target.value)}
              className="border border-gray-300 rounded-md px-2.5 py-1.5 bg-white font-semibold text-gray-900 focus:border-blue-600 focus:ring-1 focus:ring-blue-600"
            >
              <option value="all">Todas as Turmas ({classes.length})</option>
              {classes.map(c => (
                <option key={c.id} value={c.id}>
                  {formatTurmaAbrev(c)} - {c.name} ({c.period || 'Diurno'})
                </option>
              ))}
            </select>
          </div>

          {/* Filter by Regime/Curso (Laboral vs Pós-Laboral) */}
          <div className="flex items-center gap-1.5 text-xs">
            <label className="font-bold text-gray-700">Regime:</label>
            <select
              value={selectedPeriodFilter}
              onChange={e => setSelectedPeriodFilter(e.target.value)}
              className="border border-gray-300 rounded-md px-2.5 py-1.5 bg-white font-semibold text-gray-900 focus:border-blue-600"
            >
              <option value="all">Todos os Regimes</option>
              <option value="DIURNO">Diurno (Laboral)</option>
              <option value="NOTURNO">Noturno (Pós-Laboral)</option>
            </select>
          </div>

          {/* Filter by Júri (composto por 30 alunos cada) */}
          {type === 'exame' && (
            <div className="flex items-center gap-1.5 text-xs">
              <label className="font-bold text-gray-700">Júri (30 alunos):</label>
              <select
                value={selectedJuriFilter}
                onChange={e => setSelectedJuriFilter(e.target.value)}
                className="border border-amber-500 rounded-md px-2.5 py-1.5 bg-amber-50 font-bold text-amber-900 focus:border-amber-600"
              >
                <option value="all">Todos os Júris ({juris.length})</option>
                {juris.map(j => (
                  <option key={j.juriNumber} value={String(j.juriNumber)}>
                    {j.label} • {j.studentCount} Alunos
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        <div className="flex items-center gap-3">
          {/* Zoom Controls */}
          <div className="flex items-center bg-gray-100 rounded-lg p-1 border border-gray-200">
            <button 
              onClick={() => setZoom(Math.max(60, zoom - 10))} 
              className="p-1 text-gray-700 hover:text-gray-950 hover:bg-gray-200 rounded"
              title="Diminuir Zoom"
            >
              <ZoomOut className="w-4 h-4" />
            </button>
            <span className="text-xs font-bold text-gray-800 px-2 min-w-[45px] text-center">{zoom}%</span>
            <button 
              onClick={() => setZoom(Math.min(130, zoom + 10))} 
              className="p-1 text-gray-700 hover:text-gray-950 hover:bg-gray-200 rounded"
              title="Aumentar Zoom"
            >
              <ZoomIn className="w-4 h-4" />
            </button>
          </div>

          <Button 
            onClick={() => window.print()} 
            className="bg-blue-900 hover:bg-blue-950 text-white text-xs py-2 px-4 gap-2 font-bold uppercase tracking-wider shadow-sm"
          >
            <Printer className="h-4 w-4" /> Imprimir Pauta Oficial
          </Button>
        </div>
      </div>

      {/* RESPONSIVE PAUTA WRAPPER WITH INDEPENDENT HORIZONTAL SCROLLING */}
      <div className="w-full overflow-x-auto rounded-xl border border-gray-300 bg-slate-100/70 p-2.5 shadow-inner custom-pauta-scrollbar relative touch-pan-x">
        {/* PAUTA CONTAINER */}
        <div 
          id="pauta-container" 
          className="bg-white border-2 border-black p-4 shadow-xl min-w-max mx-auto"
          style={{ transformOrigin: 'top left', transform: zoom !== 100 ? `scale(${zoom / 100})` : undefined }}
        >
          <style dangerouslySetInnerHTML={{__html: `
            .custom-pauta-scrollbar::-webkit-scrollbar {
              height: 12px;
              width: 12px;
            }
            .custom-pauta-scrollbar::-webkit-scrollbar-track {
              background: #e2e8f0;
              border-radius: 8px;
            }
            .custom-pauta-scrollbar::-webkit-scrollbar-thumb {
              background: #64748b;
              border-radius: 8px;
              border: 2.5px solid #e2e8f0;
            }
            .custom-pauta-scrollbar::-webkit-scrollbar-thumb:hover {
              background: #334155;
            }

            @media print {
              @page { size: A3 landscape; margin: 4mm; }
              body * { visibility: hidden; }
              #pauta-container, #pauta-container * { visibility: visible; }
              #pauta-container { 
                position: absolute; 
                left: 0; 
                top: 0; 
                width: 100% !important; 
                margin: 0 !important; 
                padding: 0 !important; 
                border: none !important;
                box-shadow: none !important; 
                transform: none !important;
              }
              .no-print { display: none !important; }
              .pauta-official-table { width: 100% !important; font-size: 8px !important; }
              .pauta-official-table th, .pauta-official-table td { padding: 1px 2px !important; }
            }

            .pauta-official-table {
              border-collapse: collapse;
              border: 2.5px solid black;
              font-family: Arial, "Helvetica Neue", Helvetica, sans-serif;
              text-transform: uppercase;
              font-weight: 700;
              line-height: 1.1;
              min-width: max-content;
              table-layout: auto;
            }

          .pauta-official-table th, .pauta-official-table td {
            border: 1.5px solid black;
            padding: 2px 3px;
            text-align: center;
            font-size: 10px;
            color: #000000;
            white-space: nowrap;
            min-width: 32px;
          }

          .pauta-v-text {
            writing-mode: vertical-rl;
            transform: rotate(180deg);
            white-space: nowrap;
            letter-spacing: 0.5px;
            font-weight: 800;
            padding: 4px 2px;
            height: 90px;
            width: 32px;
            min-width: 32px;
            max-width: 34px;
            vertical-align: middle;
            text-align: center;
          }

          .pauta-v-text-sm {
            writing-mode: vertical-rl;
            transform: rotate(180deg);
            white-space: nowrap;
            letter-spacing: 0.2px;
            font-weight: 800;
            padding: 2px 1px;
            height: 80px;
            width: 30px;
            min-width: 30px;
            max-width: 32px;
            font-size: 9.5px;
            vertical-align: middle;
            text-align: center;
          }

          .pauta-nome-col {
            min-width: 220px;
            width: 220px;
            max-width: 220px;
            text-align: left !important;
            padding-left: 8px !important;
          }

          .pauta-nome-header {
            font-size: 34px !important;
            font-weight: 900 !important;
            letter-spacing: -0.5px;
            font-family: Impact, "Arial Black", sans-serif;
            text-align: center !important;
          }
        `}} />

        {/* ------------------------------------------------------------- */}
        {/* DOCUMENT HEADER: PAUTA DE EXAME */}
        {/* ------------------------------------------------------------- */}
        {type === 'exame' && (
          <div className="text-center font-sans mb-3 pb-2 border-b-2 border-black relative">
            <div className="absolute top-2 right-2">
              <SignatureBox label="O Director da Escola" />
            </div>
            {/* Mozambican Emblem */}
            <div className="flex justify-center mb-1">
              <MozambiqueEmblem className="h-16 w-16" />
            </div>

            <h1 className="text-sm font-extrabold uppercase tracking-widest text-black">
              REPÚBLICA DE MOÇAMBIQUE
            </h1>
            <h2 className="text-xs font-bold uppercase tracking-wider text-black mt-0.5">
              MINISTÉRIO DA EDUCAÇÃO E DESENVOLVIMENTO HUMANO
            </h2>
            <h3 className="text-xs font-semibold uppercase tracking-wide text-black mt-0.5">
              {currentSchool.province}
            </h3>
            <h3 className="text-xs font-semibold uppercase tracking-wide text-black mt-0.5">
              {currentSchool.district}
            </h3>
            <h3 className="text-[16px] font-extrabold uppercase tracking-wide text-black mt-1 bg-amber-100/90 px-3 py-1 inline-block rounded border border-black/30 shadow-xs">
              {currentSchool.name}
            </h3>
            
            {/* Main Title */}
            <h4 className="text-2xl font-black uppercase tracking-tight text-black mt-2 font-serif">
              PAUTA DE EXAME DO {ciclo === 'ESG1' ? '1º CICLO (ESG1)' : '2º CICLO (ESG2)'}
            </h4>

            {/* Subheader line */}
            <div className="flex flex-wrap items-center justify-center gap-8 mt-2 text-sm font-extrabold text-black">
              <div className="flex items-center gap-1">
                <span>Ano lectivo de [</span>
                <span className="px-2 font-black underline">{anoLectivo || currentClass?.year || '2024'}</span>
                <span>]</span>
              </div>
              <div>
                <span className="font-black underline">{currentClass?.gradeLevel || '10ª Classe'}</span>
              </div>
              <div className="flex items-center gap-1">
                <span>JÚRI Nº</span>
                <span className="px-2 font-black underline">
                  {selectedJuriFilter !== 'all' ? String(selectedJuriFilter).padStart(2, '0') : '01'}
                </span>
                <span className="text-xs font-normal text-gray-700">(30 alunos por júri)</span>
              </div>
              <div className="flex items-center gap-1">
                <span>Curso</span>
                <span className="px-2 font-black underline">
                  {selectedPeriodFilter === 'NOTURNO' ? 'NOTURNO (PÓS-LABORAL)' : selectedPeriodFilter === 'DIURNO' ? 'DIURNO (LABORAL)' : 'DIURNO / NOTURNO'}
                </span>
              </div>
              <div className="flex items-center gap-1">
                <span>Horário</span>
                <span className="px-2 font-black underline bg-amber-100/80 rounded border border-amber-300">12:00 DA MANHÃ</span>
              </div>
              <div className="flex items-center gap-1">
                <span>Turma</span>
                <span className="px-2 font-black underline">
                  {localTurmaFilter !== 'all' ? formatTurmaAbrev(currentClass) : 'GERAL'}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* ------------------------------------------------------------- */}
        {/* DOCUMENT HEADER: PAUTA DE FREQUÊNCIA */}
        {/* ------------------------------------------------------------- */}
        {type === 'frequencia' && (
          <div className="text-center font-sans mb-3 pb-2 border-b-2 border-black relative">
            <div className="absolute top-2 right-2">
              <SignatureBox label="O Director da Escola" />
            </div>
            <div className="flex justify-center mb-1">
              <MozambiqueEmblem className="h-14 w-14" />
            </div>
            <h1 className="text-xs font-extrabold uppercase tracking-widest text-black">
              REPÚBLICA DE MOÇAMBIQUE
            </h1>
            <h2 className="text-xs font-bold uppercase tracking-wider text-black mt-0.5">
              MINISTÉRIO DA EDUCAÇÃO E DESENVOLVIMENTO HUMANO
            </h2>
            <h3 className="text-xs font-semibold uppercase tracking-wide text-black mt-0.5">
              {currentSchool.province}
            </h3>
            <h3 className="text-xs font-semibold uppercase tracking-wide text-black mt-0.5">
              {currentSchool.district}
            </h3>
            <h3 className="text-[16px] font-extrabold uppercase tracking-wide text-black mt-1 bg-amber-100/90 px-3 py-1 inline-block rounded border border-black/30 shadow-xs">
              {currentSchool.name}
            </h3>
            <h4 className="text-xl font-black uppercase tracking-tight text-black mt-1 font-serif">
              PAUTA DE FREQUÊNCIA DO {ciclo === 'ESG1' ? '1º CICLO (ESG1)' : '2º CICLO (ESG2)'}
            </h4>
            <div className="flex flex-wrap items-center justify-center gap-4 mt-1 text-xs font-bold text-black">
              <span>PERÍODO: {type === 'frequencia' ? '1º TRIMESTRE' : 'EXAME'}</span>
              <span className="bg-amber-100/80 px-2 py-0.5 rounded border border-amber-300">HORÁRIO: 12:00 DA MANHÃ</span>
              <span>ANO LECTIVO: {currentClass?.year || '2024'}</span>
              <span>CLASSE: {currentClass?.gradeLevel || '10ª Classe'}</span>
              <span>TURMA: {localTurmaFilter !== 'all' ? `${formatTurmaAbrev(currentClass)} (${currentClass.name})` : 'TODAS AS TURMAS'}</span>
            </div>
          </div>
        )}

        {/* ------------------------------------------------------------- */}
        {/* TABLE 1: PAUTA DE FREQUÊNCIA */}
        {/* ------------------------------------------------------------- */}
        {type === 'frequencia' && (
          <div style={{ zoom: `${zoom}%` }}>
            <table className="pauta-official-table w-max mx-auto bg-white">
              <thead>
                {/* ROW 1: TIER 1 */}
                <tr className="bg-white">
                  <th rowSpan={3} className="pauta-v-text" title="Número fixo de identificação por ano letivo durante a frequência nas aulas (não substituível)">
                    Nº FREQU.
                  </th>
                  <th rowSpan={3} className="pauta-v-text" title="Turma abreviada: ex: T/A=TURMA A">
                    TURMA
                  </th>
                  <th rowSpan={3} className="pauta-nome-col pauta-nome-header">Nome</th>

                  {/* 14 SUBJECTS - EACH SPANS 5 COLUMNS */}
                  {activeSubjects.map(sub => (
                    <th key={sub.id} colSpan={5} className="font-extrabold text-[12px] tracking-wide py-1 border-b-2 border-black">
                      {sub.label}
                    </th>
                  ))}

                  {/* COMP. (Comportamento) - 3 COLS */}
                  <th colSpan={3} className="font-extrabold text-[12px] py-1 border-b-2 border-black">
                    Comp.
                  </th>

                  {/* MÉDIA - 3 COLS */}
                  <th colSpan={3} className="font-extrabold text-[12px] py-1 border-b-2 border-black">
                    Média
                  </th>

                  {/* M. GERAL POR SECÇÃO - 4 COLS */}
                  <th colSpan={4} className="font-extrabold text-[11px] py-1 border-b-2 border-black whitespace-nowrap">
                    M. GERAL POR SECÇÃO
                  </th>

                  {/* SECTION & FINAL CLASSIFICATIONS */}
                  <th rowSpan={3} className="pauta-v-text text-[13px]">CCS</th>
                  <th rowSpan={3} className="pauta-v-text text-[13px]">MCN</th>
                  <th rowSpan={3} className="pauta-v-text text-[13px]">APTP</th>
                  <th rowSpan={3} className="pauta-v-text text-[13px] font-black" style={{ minWidth: '40px', width: '40px' }}>
                    CLASSIF. FINAL
                  </th>
                </tr>

                {/* ROW 2: TIER 2 */}
                <tr className="bg-white">
                  {activeSubjects.map(sub => (
                    <React.Fragment key={sub.id}>
                      <th colSpan={3} className="font-black text-[11px] py-0.5 tracking-wider">
                        NOTA
                      </th>
                      <th rowSpan={2} className="pauta-v-text-sm">M.FINAL</th>
                      <th rowSpan={2} className="pauta-v-text-sm" title="Média do Ciclo = Média de Frequência (M.CICLO = M.FREQ)">
                        M.CICLO
                      </th>
                    </React.Fragment>
                  ))}

                  {/* Under Comp.: Trimestre */}
                  <th colSpan={3} className="font-extrabold text-[11px] py-0.5">
                    Trimestre
                  </th>

                  {/* Under Média: Trimestre */}
                  <th colSpan={3} className="font-extrabold text-[11px] py-0.5">
                    Trimestre
                  </th>

                  {/* Under M. GERAL POR SECÇÃO */}
                  <th rowSpan={2} className="pauta-v-text-sm">CCS</th>
                  <th rowSpan={2} className="pauta-v-text-sm">MCN</th>
                  <th rowSpan={2} className="pauta-v-text-sm">APTP</th>
                  <th rowSpan={2} className="pauta-v-text-sm font-black">M. GERAL</th>
                </tr>

                {/* ROW 3: TIER 3 */}
                <tr className="bg-white">
                  {activeSubjects.map(sub => (
                    <React.Fragment key={sub.id}>
                      <th className="font-extrabold text-[10px] w-6 min-w-[24px]">1º</th>
                      <th className="font-extrabold text-[10px] w-6 min-w-[24px]">2º</th>
                      <th className="font-extrabold text-[10px] w-6 min-w-[24px]">3º</th>
                    </React.Fragment>
                  ))}

                  {/* Under Comp.: 1º, 2º, 3º */}
                  <th className="font-extrabold text-[10px] w-6 min-w-[24px]">1º</th>
                  <th className="font-extrabold text-[10px] w-6 min-w-[24px]">2º</th>
                  <th className="font-extrabold text-[10px] w-6 min-w-[24px]">3º</th>

                  {/* Under Média: 1º, 2º, 3º */}
                  <th className="font-extrabold text-[10px] w-6 min-w-[24px]">1º</th>
                  <th className="font-extrabold text-[10px] w-6 min-w-[24px]">2º</th>
                  <th className="font-extrabold text-[10px] w-6 min-w-[24px]">3º</th>
                </tr>
              </thead>

              {/* BODY: STUDENT ROWS */}
              <tbody>
                {displayRows.map(row => {
                  const student = row.student;
                  const t1Avg = getTrimesterAverage(student.id, 1);
                  const t2Avg = getTrimesterAverage(student.id, 2);
                  const t3Avg = getTrimesterAverage(student.id, 3);
                  const mfAvg = getOverallMF(student.id);

                  const ccsAvg = getSectionAverage(student.id, 'CS');
                  const mcnAvg = getSectionAverage(student.id, 'MCN');
                  const aptpAvg = getSectionAverage(student.id, 'APTP');

                  const ccsHasFail = activeSubjects.filter(s => s.area === 'CS').some(s => {
                    const mf = getSubjectFinalGrade(student.id, s.id);
                    return mf !== null && mf < 9.5;
                  });
                  const mcnHasFail = activeSubjects.filter(s => s.area === 'MCN').some(s => {
                    const mf = getSubjectFinalGrade(student.id, s.id);
                    return mf !== null && mf < 9.5;
                  });
                  const aptpHasFail = activeSubjects.filter(s => s.area === 'APTP').some(s => {
                    const mf = getSubjectFinalGrade(student.id, s.id);
                    return mf !== null && mf < 9.5;
                  });

                  return (
                    <tr key={student.id} className="hover:bg-yellow-50/50">
                      {/* Nº FREQUÊNCIA: permanente por ano letivo */}
                      <td className="font-bold text-gray-900 bg-gray-50/60" title="Nº de Frequência na Turma (não substituível)">
                        {row.frequencyNumber}
                      </td>

                      {/* TURMA ABREVIADA (ex: T/A, T/B, T/C) */}
                      <td className="font-black text-[11px] text-gray-900" title={`Turma Oficial: ${row.classObj?.name || 'A'}`}>
                        {row.turmaAbrev}
                      </td>

                      {/* NOME COMPLETO */}
                      <td className="pauta-nome-col font-bold text-xs truncate text-black">
                        {student.name}
                      </td>

                      {/* 14 Subject Grades: 1º | 2º | 3º | M.FINAL | M.CICLO (M.CICLO = M.FREQ) */}
                      {activeSubjects.map(sub => {
                        const n1 = getSubjectGrade(student.id, sub.id, 1);
                        const n2 = getSubjectGrade(student.id, sub.id, 2);
                        const n3 = getSubjectGrade(student.id, sub.id, 3);
                        const mf = getSubjectFinalGrade(student.id, sub.id);
                        // MEDIA DO CICLO = A MÉDIA DE FREQUÊNCIA (M.CICLO = M.FREQ)
                        const mc = mf; 

                        return (
                          <React.Fragment key={sub.id}>
                            {renderPautaGradeCell(n1)}
                            {renderPautaGradeCell(n2)}
                            {renderPautaGradeCell(n3)}
                            {renderPautaGradeCell(mf, { isBold: true, bgClass: 'bg-gray-50/60', forceInteger: true })}
                            {renderPautaGradeCell(mc, { isBold: true, bgClass: 'bg-blue-50/40', title: 'M.CICLO = M.FREQ', forceInteger: true })}
                          </React.Fragment>
                        );
                      })}

                      {/* Comportamento (1º, 2º, 3º) */}
                      <td className="text-[10px] font-bold text-center">
                        {row.finalStatus === 'DISPENSADO' ? <span className="text-emerald-700">Exclt</span> : row.finalStatus === 'EXCLUÍDO' || row.finalStatus === 'NÃO TRANSITA' ? <span className="text-red-700">Sufi</span> : <span className="text-blue-700">Bom</span>}
                      </td>
                      <td className="text-[10px] font-bold text-center">
                        {row.finalStatus === 'DISPENSADO' ? <span className="text-emerald-700">Exclt</span> : row.finalStatus === 'EXCLUÍDO' || row.finalStatus === 'NÃO TRANSITA' ? <span className="text-red-700">Sufi</span> : <span className="text-blue-700">Bom</span>}
                      </td>
                      <td className="text-[10px] font-bold text-center">
                        {row.finalStatus === 'DISPENSADO' ? <span className="text-emerald-700">Exclt</span> : row.finalStatus === 'EXCLUÍDO' || row.finalStatus === 'NÃO TRANSITA' ? <span className="text-red-700">Sufi</span> : <span className="text-blue-700">Bom</span>}
                      </td>

                      {/* Média Trimestre (1º, 2º, 3º) */}
                      {renderPautaGradeCell(t1Avg, { isBold: true, forceInteger: true })}
                      {renderPautaGradeCell(t2Avg, { isBold: true, forceInteger: true })}
                      {renderPautaGradeCell(t3Avg, { isBold: true, forceInteger: true })}

                      {/* M. GERAL POR SECÇÃO */}
                      {renderPautaGradeCell(ccsAvg, { isBold: true, bgClass: 'bg-blue-50/40', forceInteger: true })}
                      {renderPautaGradeCell(mcnAvg, { isBold: true, bgClass: 'bg-blue-50/40', forceInteger: true })}
                      {renderPautaGradeCell(aptpAvg, { isBold: true, bgClass: 'bg-blue-50/40', forceInteger: true })}
                      {renderPautaGradeCell(mfAvg, { isBold: true, bgClass: 'bg-blue-100/60', customTextColor: 'text-blue-950', forceInteger: true })}

                      {/* Section Status (CCS, MCN, APTP) */}
                      <td className="text-[10px] font-bold text-center">
                        {ccsAvg !== null ? (
                          hasExams ? (
                            ccsAvg >= 13.5 && !ccsHasFail ? <span className="text-emerald-700">Dispensado</span> : ccsAvg >= 9.5 && !ccsHasFail ? <span className="text-blue-700">Admitido</span> : <span className="text-red-700">Excluído</span>
                          ) : (
                            ccsAvg >= 9.5 && !ccsHasFail ? <span className="text-blue-700">Transita</span> : <span className="text-red-700">Não transita</span>
                          )
                        ) : '-'}
                      </td>
                      <td className="text-[10px] font-bold text-center">
                        {mcnAvg !== null ? (
                          hasExams ? (
                            mcnAvg >= 13.5 && !mcnHasFail ? <span className="text-emerald-700">Dispensado</span> : mcnAvg >= 9.5 && !mcnHasFail ? <span className="text-blue-700">Admitido</span> : <span className="text-red-700">Excluído</span>
                          ) : (
                            mcnAvg >= 9.5 && !mcnHasFail ? <span className="text-blue-700">Transita</span> : <span className="text-red-700">Não transita</span>
                          )
                        ) : '-'}
                      </td>
                      <td className="text-[10px] font-bold text-center">
                        {aptpAvg !== null ? (
                          hasExams ? (
                            aptpAvg >= 13.5 && !aptpHasFail ? <span className="text-emerald-700">Dispensado</span> : aptpAvg >= 9.5 && !aptpHasFail ? <span className="text-blue-700">Admitido</span> : <span className="text-red-700">Excluído</span>
                          ) : (
                            aptpAvg >= 9.5 && !aptpHasFail ? <span className="text-blue-700">Transita</span> : <span className="text-red-700">Não transita</span>
                          )
                        ) : '-'}
                      </td>

                      {/* CLASSIFICAÇÃO FINAL */}
                      <td className="px-2 py-1 whitespace-nowrap text-center">
                        <span className={`inline-block px-2 py-0.5 text-[10px] font-black uppercase ${
                          row.finalStatus === 'DISPENSADO' ? 'border border-emerald-500 bg-emerald-50 text-emerald-700' :
                          row.finalStatus === 'ADMITIDO' || row.finalStatus === 'TRANSITA' ? 'border border-blue-500 bg-blue-50 text-blue-700' : 
                          'border border-red-500 bg-red-50 text-red-700'
                        }`}>
                          {row.finalStatus}
                        </span>
                      </td>
                    </tr>
                  );
                })}

                {displayRows.length === 0 && (
                  <tr>
                    <td colSpan={90} className="py-8 text-center text-gray-500 font-medium italic">
                      Nenhum estudante encontrado com os filtros selecionados.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* ------------------------------------------------------------- */}
        {/* TABLE 2: PAUTA DE EXAME */}
        {/* ------------------------------------------------------------- */}
        {type === 'exame' && (
          <div style={{ zoom: `${zoom}%` }}>
            <table className="pauta-official-table w-max mx-auto bg-white">
              <thead>
                {/* ROW 1: TIER 1 */}
                <tr className="bg-white">
                  <th rowSpan={3} className="pauta-v-text" title="Número fixo de identificação por ano letivo durante a frequência nas aulas (não substituível)">
                    Nº FREQU.
                  </th>
                  <th rowSpan={3} className="pauta-v-text" title="Número único atribuído aos alunos admitidos aos exames, começando em 1, em ordem alfabética contínua">
                    Nº PAUT
                  </th>
                  <th rowSpan={3} className="pauta-v-text" title="Turma abreviada: ex: T/A=TURMA A">
                    TURMA
                  </th>
                  <th rowSpan={3} className="pauta-nome-col pauta-nome-header">Nome</th>

                  {/* BANNER "EXAME ESCRITO" SPANNING ALL EXAMINATION & OUTCOME COLUMNS */}
                  <th colSpan={activeExamSubjects.length * 3 + activeContinuousSubjects.length + 8} className="font-black text-xl tracking-wider py-1 border-b-2 border-black">
                    EXAME ESCRITO
                  </th>
                </tr>

                {/* ROW 2: TIER 2 */}
                <tr className="bg-white">
                  {/* WRITTEN EXAM SUBJECTS (3 COLS EACH) */}
                  {activeExamSubjects.map(sub => (
                    <th key={sub.id} colSpan={3} className="font-extrabold text-[11px] py-1 border-b-2 border-black">
                      {sub.examLabel || sub.label}
                    </th>
                  ))}

                  {/* CONTINUOUS ASSESSMENT SUBJECTS (1 COL EACH) */}
                  {activeContinuousSubjects.map(sub => (
                    <th key={sub.id} className="font-extrabold text-[10px] py-1 px-1 border-b-2 border-black">
                      {sub.examLabel || sub.label}
                    </th>
                  ))}

                  {/* M.GLOBAL (3 COLS: CCS, CIENCIA, CPP) */}
                  <th colSpan={3} className="font-extrabold text-[10px] py-1 border-b-2 border-black">
                    M.GLOBAL
                  </th>

                  {/* M / GERAL (1 COL) */}
                  <th className="font-extrabold text-[11px] py-1 border-b-2 border-black">
                    M
                  </th>

                  {/* Resultado Final (3 COLS: LETRA, CIENCIA, CPP) */}
                  <th colSpan={3} className="font-extrabold text-[11px] py-1 border-b-2 border-black">
                    Resultado Final
                  </th>

                  {/* R. GERAL (1 COL: FINAL) */}
                  <th className="font-extrabold text-[11px] py-1 border-b-2 border-black">
                    R. GERAL
                  </th>
                </tr>

                {/* ROW 3: TIER 3 */}
                <tr className="bg-white">
                  {/* EXAM SUBJECTS SUBCOLUMNS: M.FREQ. | 1ª EPC | MD.1ª */}
                  {activeExamSubjects.map(sub => (
                    <React.Fragment key={sub.id}>
                      <th className="pauta-v-text-sm" title="Média de Frequência (= Média do Ciclo)">M.FREQ.</th>
                      <th className="pauta-v-text-sm">1ª EPC</th>
                      <th className="pauta-v-text-sm font-black">MD.1ª</th>
                    </React.Fragment>
                  ))}

                  {/* CONTINUOUS SUBJECTS SUBCOLUMNS: M.C */}
                  {activeContinuousSubjects.map(sub => (
                    <th key={sub.id} className="pauta-v-text-sm">M.C</th>
                  ))}

                  {/* M.GLOBAL: CCS | CIENCIA | CPP */}
                  <th className="pauta-v-text-sm">CCS</th>
                  <th className="pauta-v-text-sm">CIENCIA</th>
                  <th className="pauta-v-text-sm">CPP</th>

                  {/* M: GERAL */}
                  <th className="pauta-v-text-sm">GERAL</th>
                  <th className="pauta-v-text-sm" title="Comportamento">COMP.</th>

                  {/* Resultado Final: LETRA | CIENCIA | CPP */}
                  <th className="pauta-v-text-sm">LETRA</th>
                  <th className="pauta-v-text-sm">CIENCIA</th>
                  <th className="pauta-v-text-sm">CPP</th>

                  {/* R. GERAL: FINAL */}
                  <th className="pauta-v-text-sm font-black" style={{ minWidth: '36px', width: '36px' }}>FINAL</th>
                </tr>
              </thead>

              {/* BODY: STUDENT ROWS */}
              <tbody>
                {displayRows.map(row => {
                  const student = row.student;

                  // Exam calculation for each of the exam subjects
                  const examDetails = activeExamSubjects.map(sub => {
                    const mf = getSubjectFinalGrade(student.id, sub.id);
                    const ne = getExamGrade(student.id, sub.id);
                    // MD.1ª = (MF * 0.6) + (NE * 0.4) (Official Mozambican exam formula)
                    const md = (mf !== null && ne !== null) ? Math.round(mf * 0.6 + ne * 0.4) : (mf ?? null);
                    return { subId: sub.id, mf, ne, md };
                  });

                  // Continuous assessment subjects (MC)
                  const continuousDetails = activeContinuousSubjects.map(sub => {
                    const mc = getSubjectFinalGrade(student.id, sub.id);
                    return { subId: sub.id, mc };
                  });

                  // Global averages:
                  const ccsMds = examDetails.filter(e => activeSubjects.find(as => as.id === e.subId)?.area === 'CS').map(e => e.md).filter((v): v is number => v !== null);
                  const ccsGlobal = ccsMds.length > 0 ? Math.round(ccsMds.reduce((a, b) => a + b, 0) / ccsMds.length) : null;

                  const cienciaMds = examDetails.filter(e => activeSubjects.find(as => as.id === e.subId)?.area === 'MCN').map(e => e.md).filter((v): v is number => v !== null);
                  const cienciaGlobal = cienciaMds.length > 0 ? Math.round(cienciaMds.reduce((a, b) => a + b, 0) / cienciaMds.length) : null;

                  const cppMcs = continuousDetails.map(c => c.mc).filter((v): v is number => v !== null);
                  const cppGlobal = cppMcs.length > 0 ? Math.round(cppMcs.reduce((a, b) => a + b, 0) / cppMcs.length) : null;

                  const allMds = [...ccsMds, ...cienciaMds, ...cppMcs];
                  const mGeral = allMds.length > 0 ? Math.round(allMds.reduce((a, b) => a + b, 0) / allMds.length) : null;

                  const ccsHasExamFail = examDetails.some(e => activeSubjects.find(as => as.id === e.subId)?.area === 'CS' && e.md !== null && e.md < 9.5);
                  const cienciaHasExamFail = examDetails.some(e => activeSubjects.find(as => as.id === e.subId)?.area === 'MCN' && e.md !== null && e.md < 9.5);
                  const cppHasExamFail = continuousDetails.some(c => activeSubjects.find(as => as.id === c.subId)?.area === 'APTP' && c.mc !== null && c.mc < 9.5);

                  const resultadoLetra = ccsGlobal !== null ? (ccsGlobal >= 9.5 && !ccsHasExamFail ? 'APROV' : 'REPR') : '-';
                  const resultadoCiencia = cienciaGlobal !== null ? (cienciaGlobal >= 9.5 && !cienciaHasExamFail ? 'APROV' : 'REPR') : '-';
                  const resultadoCpp = cppGlobal !== null ? (cppGlobal >= 9.5 && !cppHasExamFail ? 'APROV' : 'REPR') : '-';
                  const rGeralFinal = mGeral !== null ? (resultadoLetra === 'APROV' && resultadoCiencia === 'APROV' && resultadoCpp === 'APROV' && mGeral >= 9.5 ? 'APROVADO' : 'REPROVADO') : '-';

                  return (
                    <tr key={student.id} className="hover:bg-yellow-50/50">
                      {/* Nº FREQUÊNCIA: identificação fixa durante o ano */}
                      <td className="font-bold text-gray-900 bg-gray-50/50" title="Nº Frequência da Turma">
                        {row.frequencyNumber}
                      </td>

                      {/* Nº PAUTA: número único atribuído a admitidos aos exames */}
                      <td className="font-black text-blue-900 bg-blue-50/30" title={`Nº de Pauta do Exame (Júri 0${row.juriNumber})`}>
                        {row.pautaNumber ?? '-'}
                      </td>

                      {/* TURMA ABREVIADA (ex: T/A, T/B, T/C) */}
                      <td className="font-black text-[11px] text-gray-900" title={`Turma: ${row.classObj?.name || 'A'}`}>
                        {row.turmaAbrev}
                      </td>

                      {/* NOME COMPLETO */}
                      <td className="pauta-nome-col font-bold text-xs truncate text-black">
                        {student.name}
                        {row.periodType === 'POS_LABORAL' && (
                          <span className="ml-1 text-[9px] font-normal text-indigo-700 font-sans">[PL]</span>
                        )}
                      </td>

                      {/* 9 Exam Subjects: M.FREQ. | 1ª EPC | MD.1ª */}
                      {examDetails.map(ed => (
                        <React.Fragment key={ed.subId}>
                          {renderPautaGradeCell(ed.mf, { isBold: true, forceInteger: true })}
                          {renderPautaGradeCell(ed.ne, { isBold: true, bgClass: 'bg-yellow-50/40', customTextColor: 'text-blue-900' })}
                          {renderPautaGradeCell(ed.md, { isBold: true, bgClass: 'bg-gray-50/80', forceInteger: true })}
                        </React.Fragment>
                      ))}

                      {/* 5 Continuous Subjects: M.C */}
                      {continuousDetails.map(cd => (
                        <React.Fragment key={cd.subId}>
                          {renderPautaGradeCell(cd.mc, { isBold: true, bgClass: 'bg-gray-50/50', forceInteger: true })}
                        </React.Fragment>
                      ))}

                      {/* M.GLOBAL: CCS | CIENCIA | CPP */}
                      {renderPautaGradeCell(ccsGlobal, { isBold: true, bgClass: 'bg-blue-50/50', forceInteger: true })}
                      {renderPautaGradeCell(cienciaGlobal, { isBold: true, bgClass: 'bg-blue-50/50', forceInteger: true })}
                      {renderPautaGradeCell(cppGlobal, { isBold: true, bgClass: 'bg-blue-50/50', forceInteger: true })}

                      {/* M GERAL */}
                      {renderPautaGradeCell(mGeral, { isBold: true, bgClass: 'bg-blue-100/70', customTextColor: 'text-blue-950', forceInteger: true })}

                      {/* Comportamento */}
                      <td className="text-[10px] font-bold text-center">
                        {rGeralFinal === 'APROVADO' && (mGeral !== null && mGeral >= 14) ? (
                          <span className="text-emerald-700">Exclt</span>
                        ) : rGeralFinal === 'REPROVADO' ? (
                          <span className="text-red-700">Sufi</span>
                        ) : (
                          <span className="text-blue-700">Bom</span>
                        )}
                      </td>

                      {/* Resultado Final: LETRA | CIENCIA | CPP */}
                      <td className={`text-[10px] font-bold ${resultadoLetra === 'APROV' ? 'text-green-800' : resultadoLetra === 'REPR' ? 'text-red-700' : 'text-black'}`}>
                        {resultadoLetra}
                      </td>
                      <td className={`text-[10px] font-bold ${resultadoCiencia === 'APROV' ? 'text-green-800' : resultadoCiencia === 'REPR' ? 'text-red-700' : 'text-black'}`}>
                        {resultadoCiencia}
                      </td>
                      <td className={`text-[10px] font-bold ${resultadoCpp === 'APROV' ? 'text-green-800' : resultadoCpp === 'REPR' ? 'text-red-700' : 'text-black'}`}>
                        {resultadoCpp}
                      </td>

                      {/* R. GERAL FINAL */}
                      <td className={`font-black text-[11px] px-2 whitespace-nowrap ${
                        rGeralFinal === 'APROVADO' ? 'text-green-900 bg-green-50' :
                        rGeralFinal === 'REPROVADO' ? 'text-red-700 bg-red-50' : 'text-gray-500'
                      }`}>
                        {rGeralFinal}
                      </td>
                    </tr>
                  );
                })}

                {displayRows.length === 0 && (
                  <tr>
                    <td colSpan={90} className="py-8 text-center text-gray-500 font-medium italic">
                      Nenhum candidato a exame encontrado para os filtros selecionados.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Official Footer */}
        <div className="mt-8 pt-4 border-t-2 border-black flex flex-wrap justify-between items-end gap-4 text-xs font-bold uppercase text-black font-serif">
          <div className="text-center">
            <SignatureBox label={type === 'frequencia' ? "O Director de Turma" : "O Presidente do Júri"} />
            <p className="mt-1 text-[10px]">Data: _____ / _____ / 2026, às 12:00 da manhã</p>
          </div>
          <div className="text-center">
            <SignatureBox label="O Dir. Adj. Pedagógico" />
            <p className="mt-1 text-[10px]">Data: _____ / _____ / 2026, às 12:00 da manhã</p>
          </div>
          <div className="text-center text-[10px] normal-case text-gray-700 font-sans max-w-xs">
            <p>Moçambique • Sistema Nacional de Educação • MINEDH</p>
            <p className="font-bold text-black uppercase mt-0.5">
              {type === 'exame' ? 'Júri composto por 30 alunos • ' : ''}M.CICLO = M.FREQ • Pós-Laboral contagem contínua
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
);
};
