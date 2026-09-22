import React from 'react';
import { Student, Class, Subject, Grade } from '../types';
import { Printer, CheckSquare, Square, FileText } from 'lucide-react';
import { Button } from './ui';

interface StudentProcessDocumentProps {
  student: Student;
  schoolName?: string;
  classes?: Class[];
  subjects?: Subject[];
  grades?: Grade[];
  onClose?: () => void;
}

export function StudentProcessDocument({
  student,
  schoolName = 'Escola Secundária Central',
  classes = [],
  subjects = [],
  grades = [],
  onClose,
}: StudentProcessDocumentProps) {
  const studentClass = classes.find(c => c.id === student.classId);
  const classLabel = studentClass ? `${studentClass.gradeLevel} - ${studentClass.name}` : (student.entryGrade || '10ª Classe');
  const academicYear = student.academicYear || studentClass?.year || 2026;
  const courseName = student.course || 'Ensino Secundário Geral (ESG)';
  const processCode = student.processCode || `PROC-${academicYear}-${(student.id || '001').toUpperCase()}`;
  const studentNum = student.studentNumber || (student.frequencyNumber ? `Nº ${student.frequencyNumber}` : `ALU-${student.id}`);
  const openingDate = student.openingDate || student.enrollmentDate || '01/02/2026';

  const formatDisplayDate = (d?: string) => {
    if (!d) return '//________';
    if (d.includes('-')) {
      const parts = d.split('-');
      if (parts.length === 3) {
        return `${parts[2]}/${parts[1]}/${parts[0]}`;
      }
    }
    return d;
  };

  const getSubjectGrades = (subjectId: string) => {
    const gradeObj1 = grades.find(g => g.studentId === student.id && g.subjectId === subjectId && g.trimester === 1);
    const gradeObj2 = grades.find(g => g.studentId === student.id && g.subjectId === subjectId && g.trimester === 2);
    const gradeObj3 = grades.find(g => g.studentId === student.id && g.subjectId === subjectId && g.trimester === 3);

    const g1 = gradeObj1?.media ?? gradeObj1?.apt ?? gradeObj1?.acs1;
    const g2 = gradeObj2?.media ?? gradeObj2?.apt ?? gradeObj2?.acs1;
    const g3 = gradeObj3?.media ?? gradeObj3?.apt ?? gradeObj3?.acs1;

    const validGrades = [g1, g2, g3].filter((g): g is number => typeof g === 'number');
    const media = validGrades.length > 0 
      ? Math.round(validGrades.reduce((a, b) => a + b, 0) / validGrades.length) 
      : undefined;

    return { g1, g2, g3, media };
  };

  // Mock / Real attendance months for Mozambican school year
  const defaultAttendanceMonths = [
    { month: 'Fevereiro', presences: 22, justifiedAbsences: 0, unjustifiedAbsences: 0 },
    { month: 'Março', presences: 21, justifiedAbsences: 1, unjustifiedAbsences: 0 },
    { month: 'Abril', presences: 19, justifiedAbsences: 0, unjustifiedAbsences: 0 },
    { month: 'Maio', presences: 22, justifiedAbsences: 0, unjustifiedAbsences: 0 },
    { month: 'Junho', presences: 20, justifiedAbsences: 2, unjustifiedAbsences: 0 },
    { month: 'Julho', presences: 21, justifiedAbsences: 0, unjustifiedAbsences: 0 },
    { month: 'Agosto', presences: 18, justifiedAbsences: 0, unjustifiedAbsences: 0 },
    { month: 'Setembro', presences: 22, justifiedAbsences: 1, unjustifiedAbsences: 0 },
    { month: 'Outubro', presences: 23, justifiedAbsences: 0, unjustifiedAbsences: 0 },
    { month: 'Novembro', presences: 15, justifiedAbsences: 0, unjustifiedAbsences: 0 },
  ];

  const attendanceList = student.attendance && student.attendance.length > 0 
    ? student.attendance 
    : defaultAttendanceMonths;

  // Attached docs checklist
  const docs = student.attachedDocuments || {
    birthCertificate: true,
    idCard: true,
    qualificationsCertificate: true,
    medicalCertificate: true,
    passPhotos: true,
    residenceDeclaration: true,
    paymentProof: true,
  };

  const attachedDocsList = [
    { num: 1, name: 'Certidão de Nascimento', checked: docs.birthCertificate ?? true },
    { num: 2, name: 'BI ou Documento de Identificação', checked: docs.idCard ?? Boolean(student.idCardNumber) },
    { num: 3, name: 'Certificado de Habilitações', checked: docs.qualificationsCertificate ?? true },
    { num: 4, name: 'Atestado Médico', checked: docs.medicalCertificate ?? true },
    { num: 5, name: 'Fotografias Tipo Passe', checked: docs.passPhotos ?? true },
    { num: 6, name: 'Declaração de Residência', checked: docs.residenceDeclaration ?? true },
    { num: 7, name: 'Comprovativo de Pagamento', checked: docs.paymentProof ?? true },
    { num: 8, name: 'Declaração de Notas (Emitida)', checked: docs.declarationOfGrades ?? (student.issuedDeclarations && student.issuedDeclarations.length > 0) },
  ];

  // Academic History - Merge existing history with newly issued declarations automatically
  const baseHistory = student.academicHistory && student.academicHistory.length > 0 ? student.academicHistory : [];
  
  // Create history entries from issued declarations if they don't exist
  const historyFromDeclarations = (student.issuedDeclarations || []).map(dec => ({
    year: dec.academicYear,
    grade: dec.gradeLevel,
    school: dec.schoolName || schoolName,
    result: dec.status === 'Transitou' ? `Aprovado (Média: ${dec.finalAverage}v)` : 'Não Transitou'
  }));

  // Merge and remove duplicates by year
  const academicHistoryMap = new Map();
  [...baseHistory, ...historyFromDeclarations].forEach(h => {
    academicHistoryMap.set(String(h.year), h);
  });
  
  const academicHistory = Array.from(academicHistoryMap.values()).sort((a, b) => Number(a.year) - Number(b.year));

  // If no history at all, provide defaults
  if (academicHistory.length === 0) {
    academicHistory.push(
      { year: 2023, grade: '8ª Classe', school: 'Escola Comunitária São Pedro', result: 'Aprovado' },
      { year: 2024, grade: '9ª Classe', school: 'Escola Secundária Josina Machel', result: 'Aprovado' },
      { year: 2025, grade: '10ª Classe', school: schoolName, result: 'Frequência' }
    );
  }

  // Occurrences
  const occurrences = student.occurrences && student.occurrences.length > 0
    ? student.occurrences
    : [
        { date: '14/03/2026', description: 'Eleito delegado adjunto de turma', responsible: 'Director de Turma' }
      ];

  const studentStatus = student.enrollmentStatus || (student.status === 'active' ? 'Activo' : student.status === 'graduated' ? 'Concluído' : 'Transferido');

  return (
    <div className="bg-white text-gray-950 font-serif print:text-black">
      {/* Action Bar (Hidden in Print) */}
      <div className="print:hidden p-4 bg-slate-900 text-white flex flex-wrap items-center justify-between gap-3 sticky top-0 z-30 shadow-md border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-600 rounded-lg text-white">
            <FileText className="h-5 w-5" />
          </div>
          <div>
            <h3 className="font-sans font-bold text-sm text-white">
              Processo Individual do Aluno · {student.name}
            </h3>
            <p className="font-sans text-xs text-slate-300">
              Documento Oficial Normativo · Ministério da Educação e Desenvolvimento Humano
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            onClick={() => window.print()}
            className="bg-blue-600 hover:bg-blue-700 text-white font-sans text-xs font-bold gap-2 py-2 px-4 rounded-lg shadow-sm cursor-pointer"
          >
            <Printer className="h-4 w-4" />
            <span>Imprimir Processo Individual</span>
          </Button>

          {onClose && (
            <Button
              variant="outline"
              onClick={onClose}
              className="bg-slate-800 hover:bg-slate-700 text-white border-slate-700 font-sans text-xs py-2 px-4 rounded-lg cursor-pointer"
            >
              Fechar
            </Button>
          )}
        </div>
      </div>

      {/* Main Process Content (Document Body) */}
      <div className="p-6 md:p-12 max-w-4xl mx-auto space-y-8 print:p-0 print:max-w-none print:space-y-6">
        
        {/* ========================================================================= */}
        {/* CAPA DO PROCESSO & CABEÇALHO OFICIAL */}
        {/* ========================================================================= */}
        <div className="border-4 border-double border-gray-900 p-8 rounded-sm bg-[#faf8f0] print:bg-white relative shadow-sm">
          
          {/* Brasão Oficial & Cabeçalho */}
          <div className="text-center pb-6 border-b-2 border-gray-900">
            <img 
              src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQua66hW5lOO75LXVLwiJWQJKtgoRJzX58EUSAAc2QdYQ&s=10" 
              alt="República de Moçambique" 
              className="mx-auto h-20 w-20 mb-2 object-contain" 
              referrerPolicy="no-referrer"
            />
            <h2 className="text-sm font-black uppercase tracking-widest text-black">
              REPÚBLICA DE MOÇAMBIQUE
            </h2>
            <h3 className="text-xs font-bold uppercase tracking-wider text-gray-800 mt-0.5">
              MINISTÉRIO DA EDUCAÇÃO E DESENVOLVIMENTO HUMANO
            </h3>
            <h4 className="text-sm font-extrabold uppercase text-blue-950 mt-1 tracking-wide">
              {schoolName.toUpperCase()}
            </h4>
            
            <div className="mt-4 pt-3 border-t border-gray-400 inline-block px-8">
              <span className="text-[11px] font-bold uppercase tracking-widest text-gray-600 block">
                CAPA DO PROCESSO
              </span>
              <h1 className="text-xl md:text-2xl font-black uppercase tracking-wider text-black mt-1">
                PROCESSO INDIVIDUAL DO ALUNO
              </h1>
            </div>
          </div>

          {/* Dados da Capa */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-3 pt-6 text-sm">
            <div className="flex items-baseline gap-2">
              <span className="font-bold whitespace-nowrap">Código do Processo:</span>
              <span className="flex-1 font-mono font-bold border-b border-black border-dotted px-2 text-blue-950">
                {processCode}
              </span>
            </div>

            <div className="flex items-baseline gap-2">
              <span className="font-bold whitespace-nowrap">Número do Aluno:</span>
              <span className="flex-1 font-mono font-bold border-b border-black border-dotted px-2 text-blue-950">
                {studentNum}
              </span>
            </div>

            <div className="md:col-span-2 flex items-baseline gap-2">
              <span className="font-bold whitespace-nowrap">Nome Completo:</span>
              <span className="flex-1 font-bold border-b border-black border-dotted px-2 text-base uppercase text-black">
                {student.name}
              </span>
            </div>

            <div className="flex items-baseline gap-2">
              <span className="font-bold whitespace-nowrap">Classe:</span>
              <span className="flex-1 font-semibold border-b border-black border-dotted px-2">
                {classLabel}
              </span>
            </div>

            <div className="flex items-baseline gap-2">
              <span className="font-bold whitespace-nowrap">Curso:</span>
              <span className="flex-1 font-semibold border-b border-black border-dotted px-2">
                {courseName}
              </span>
            </div>

            <div className="flex items-baseline gap-2">
              <span className="font-bold whitespace-nowrap">Ano Lectivo:</span>
              <span className="flex-1 font-bold border-b border-black border-dotted px-2">
                {academicYear}
              </span>
            </div>

            <div className="flex items-baseline gap-2">
              <span className="font-bold whitespace-nowrap">Data de Abertura:</span>
              <span className="flex-1 font-semibold border-b border-black border-dotted px-2">
                {formatDisplayDate(openingDate)}
              </span>
            </div>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* 1. IDENTIFICAÇÃO DO ALUNO */}
        {/* ========================================================================= */}
        <div className="border border-black p-5 space-y-4 rounded-xs">
          <h3 className="font-bold text-base uppercase tracking-wide border-b-2 border-black pb-1 bg-gray-100 -mx-5 -mt-5 p-3 flex items-center justify-between">
            <span>1. IDENTIFICAÇÃO DO ALUNO</span>
            <span className="text-xs font-mono font-normal">MINEDH / SEC</span>
          </h3>

          {/* Dados Pessoais */}
          <div>
            <h4 className="font-bold text-xs uppercase tracking-wider text-gray-700 mb-2 underline">
              Dados Pessoais
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-12 gap-x-4 gap-y-2.5 text-xs">
              <div className="md:col-span-8 flex items-baseline gap-2">
                <span className="font-bold whitespace-nowrap">Nome Completo:</span>
                <span className="flex-1 font-semibold border-b border-black border-dotted px-1 uppercase">
                  {student.name}
                </span>
              </div>

              <div className="md:col-span-4 flex items-center gap-3">
                <span className="font-bold whitespace-nowrap">Sexo:</span>
                <label className="inline-flex items-center gap-1 font-medium cursor-pointer">
                  {student.gender === 'M' ? (
                    <CheckSquare className="h-4 w-4 text-black" />
                  ) : (
                    <Square className="h-4 w-4 text-gray-500" />
                  )}
                  <span>Masculino</span>
                </label>
                <label className="inline-flex items-center gap-1 font-medium cursor-pointer">
                  {student.gender === 'F' ? (
                    <CheckSquare className="h-4 w-4 text-black" />
                  ) : (
                    <Square className="h-4 w-4 text-gray-500" />
                  )}
                  <span>Feminino</span>
                </label>
              </div>

              <div className="md:col-span-4 flex items-baseline gap-2">
                <span className="font-bold whitespace-nowrap">Data de Nascimento:</span>
                <span className="flex-1 border-b border-black border-dotted px-1">
                  {formatDisplayDate(student.birthDate)}
                </span>
              </div>

              <div className="md:col-span-4 flex items-baseline gap-2">
                <span className="font-bold whitespace-nowrap">Naturalidade:</span>
                <span className="flex-1 border-b border-black border-dotted px-1">
                  {student.birthPlace || '---'}
                </span>
              </div>

              <div className="md:col-span-4 flex items-baseline gap-2">
                <span className="font-bold whitespace-nowrap">Nacionalidade:</span>
                <span className="flex-1 border-b border-black border-dotted px-1">
                  {student.nationality || 'Moçambicana'}
                </span>
              </div>

              <div className="md:col-span-4 flex items-baseline gap-2">
                <span className="font-bold whitespace-nowrap">Estado Civil:</span>
                <span className="flex-1 border-b border-black border-dotted px-1">
                  {student.maritalStatus || 'Solteiro(a)'}
                </span>
              </div>

              <div className="md:col-span-4 flex items-baseline gap-2">
                <span className="font-bold whitespace-nowrap">BI/Documento n.º:</span>
                <span className="flex-1 font-mono font-semibold border-b border-black border-dotted px-1">
                  {student.idCardNumber || '---'}
                </span>
              </div>

              <div className="md:col-span-4 flex items-baseline gap-2">
                <span className="font-bold whitespace-nowrap">Emitido em:</span>
                <span className="flex-1 border-b border-black border-dotted px-1">
                  {student.idCardIssuedAt || student.province || 'Maputo'}
                </span>
              </div>

              <div className="md:col-span-4 flex items-baseline gap-2">
                <span className="font-bold whitespace-nowrap">NUIT:</span>
                <span className="flex-1 font-mono font-semibold border-b border-black border-dotted px-1">
                  {student.nuit || '---'}
                </span>
              </div>
            </div>
          </div>

          {/* Endereço */}
          <div className="pt-2 border-t border-gray-300">
            <h4 className="font-bold text-xs uppercase tracking-wider text-gray-700 mb-2 underline">
              Endereço
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-12 gap-x-4 gap-y-2.5 text-xs">
              <div className="md:col-span-4 flex items-baseline gap-2">
                <span className="font-bold whitespace-nowrap">Província:</span>
                <span className="flex-1 border-b border-black border-dotted px-1">
                  {student.province || 'Maputo Cidade'}
                </span>
              </div>

              <div className="md:col-span-4 flex items-baseline gap-2">
                <span className="font-bold whitespace-nowrap">Distrito:</span>
                <span className="flex-1 border-b border-black border-dotted px-1">
                  {student.district || 'Kamavota'}
                </span>
              </div>

              <div className="md:col-span-4 flex items-baseline gap-2">
                <span className="font-bold whitespace-nowrap">Posto Administrativo:</span>
                <span className="flex-1 border-b border-black border-dotted px-1">
                  {student.administrativePost || 'Posto Central'}
                </span>
              </div>

              <div className="md:col-span-4 flex items-baseline gap-2">
                <span className="font-bold whitespace-nowrap">Bairro:</span>
                <span className="flex-1 border-b border-black border-dotted px-1">
                  {student.neighborhood || student.address || 'Central'}
                </span>
              </div>

              <div className="md:col-span-4 flex items-baseline gap-2">
                <span className="font-bold whitespace-nowrap">Contacto Telefónico:</span>
                <span className="flex-1 font-mono border-b border-black border-dotted px-1">
                  {student.phone || student.guardianPhone || '+258 84 000 0000'}
                </span>
              </div>

              <div className="md:col-span-4 flex items-baseline gap-2">
                <span className="font-bold whitespace-nowrap">E-mail:</span>
                <span className="flex-1 font-mono border-b border-black border-dotted px-1">
                  {student.email || '---'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* 2. FILIAÇÃO */}
        {/* ========================================================================= */}
        <div className="border border-black p-5 space-y-4 rounded-xs">
          <h3 className="font-bold text-base uppercase tracking-wide border-b-2 border-black pb-1 bg-gray-100 -mx-5 -mt-5 p-3">
            2. FILIAÇÃO
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 text-xs">
            {/* Pai */}
            <div className="border border-gray-400 p-3 rounded-xs space-y-2 bg-gray-50/50">
              <h4 className="font-bold text-xs uppercase tracking-wider text-blue-900 border-b border-gray-300 pb-1">
                Pai
              </h4>
              <div className="space-y-2">
                <div>
                  <span className="font-bold block text-[11px]">Nome Completo:</span>
                  <span className="block border-b border-black border-dotted px-1 font-medium">
                    {student.fatherName || '---'}
                  </span>
                </div>
                <div>
                  <span className="font-bold block text-[11px]">Profissão:</span>
                  <span className="block border-b border-black border-dotted px-1">
                    {student.fatherProfession || '---'}
                  </span>
                </div>
                <div>
                  <span className="font-bold block text-[11px]">Contacto:</span>
                  <span className="block font-mono border-b border-black border-dotted px-1">
                    {student.fatherPhone || '---'}
                  </span>
                </div>
              </div>
            </div>

            {/* Mãe */}
            <div className="border border-gray-400 p-3 rounded-xs space-y-2 bg-gray-50/50">
              <h4 className="font-bold text-xs uppercase tracking-wider text-blue-900 border-b border-gray-300 pb-1">
                Mãe
              </h4>
              <div className="space-y-2">
                <div>
                  <span className="font-bold block text-[11px]">Nome Completo:</span>
                  <span className="block border-b border-black border-dotted px-1 font-medium">
                    {student.motherName || '---'}
                  </span>
                </div>
                <div>
                  <span className="font-bold block text-[11px]">Profissão:</span>
                  <span className="block border-b border-black border-dotted px-1">
                    {student.motherProfession || '---'}
                  </span>
                </div>
                <div>
                  <span className="font-bold block text-[11px]">Contacto:</span>
                  <span className="block font-mono border-b border-black border-dotted px-1">
                    {student.motherPhone || '---'}
                  </span>
                </div>
              </div>
            </div>

            {/* Encarregado de Educação */}
            <div className="border border-gray-400 p-3 rounded-xs space-y-2 bg-gray-50/50">
              <h4 className="font-bold text-xs uppercase tracking-wider text-blue-900 border-b border-gray-300 pb-1">
                Encarregado de Educação
              </h4>
              <div className="space-y-2">
                <div>
                  <span className="font-bold block text-[11px]">Nome Completo:</span>
                  <span className="block border-b border-black border-dotted px-1 font-medium">
                    {student.guardianName || student.fatherName || student.motherName || '---'}
                  </span>
                </div>
                <div>
                  <span className="font-bold block text-[11px]">Grau de Parentesco:</span>
                  <span className="block border-b border-black border-dotted px-1">
                    {student.guardianKinship || (student.guardianName ? 'Encarregado' : 'Pai/Mãe')}
                  </span>
                </div>
                <div>
                  <span className="font-bold block text-[11px]">Contacto:</span>
                  <span className="block font-mono border-b border-black border-dotted px-1">
                    {student.guardianPhone || student.fatherPhone || student.motherPhone || '---'}
                  </span>
                </div>
                <div>
                  <span className="font-bold block text-[11px]">Morada:</span>
                  <span className="block border-b border-black border-dotted px-1">
                    {student.guardianAddress || student.address || student.neighborhood || '---'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* 3. DOCUMENTOS ANEXOS */}
        {/* ========================================================================= */}
        <div className="border border-black p-5 space-y-3 rounded-xs">
          <h3 className="font-bold text-base uppercase tracking-wide border-b-2 border-black pb-1 bg-gray-100 -mx-5 -mt-5 p-3">
            3. DOCUMENTOS ANEXOS
          </h3>

          <div className="overflow-x-auto">
            <table className="min-w-full border-collapse border border-black text-xs">
              <thead className="bg-gray-100 font-bold">
                <tr>
                  <th className="border border-black px-3 py-1.5 text-center w-12">Nº</th>
                  <th className="border border-black px-4 py-1.5 text-left">Documento</th>
                  <th className="border border-black px-3 py-1.5 text-center w-20">Sim</th>
                  <th className="border border-black px-3 py-1.5 text-center w-20">Não</th>
                </tr>
              </thead>
              <tbody>
                {attachedDocsList.map((doc) => (
                  <tr key={doc.num} className="hover:bg-gray-50">
                    <td className="border border-black px-3 py-1.5 text-center font-bold">{doc.num}</td>
                    <td className="border border-black px-4 py-1.5 font-medium">{doc.name}</td>
                    <td className="border border-black px-3 py-1.5 text-center">
                      {doc.checked ? (
                        <CheckSquare className="h-4 w-4 mx-auto text-black" />
                      ) : (
                        <Square className="h-4 w-4 mx-auto text-gray-400" />
                      )}
                    </td>
                    <td className="border border-black px-3 py-1.5 text-center">
                      {!doc.checked ? (
                        <CheckSquare className="h-4 w-4 mx-auto text-black" />
                      ) : (
                        <Square className="h-4 w-4 mx-auto text-gray-400" />
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* 4. HISTÓRICO ACADÉMICO */}
        {/* ========================================================================= */}
        <div className="border border-black p-5 space-y-3 rounded-xs">
          <h3 className="font-bold text-base uppercase tracking-wide border-b-2 border-black pb-1 bg-gray-100 -mx-5 -mt-5 p-3">
            4. HISTÓRICO ACADÉMICO
          </h3>

          <div className="overflow-x-auto">
            <table className="min-w-full border-collapse border border-black text-xs">
              <thead className="bg-gray-100 font-bold">
                <tr>
                  <th className="border border-black px-3 py-2 text-center w-24">Ano</th>
                  <th className="border border-black px-3 py-2 text-center w-32">Classe</th>
                  <th className="border border-black px-4 py-2 text-left">Escola</th>
                  <th className="border border-black px-3 py-2 text-center w-32">Resultado</th>
                </tr>
              </thead>
              <tbody>
                {academicHistory.map((entry, idx) => (
                  <tr key={idx}>
                    <td className="border border-black px-3 py-2 text-center font-bold">{entry.year}</td>
                    <td className="border border-black px-3 py-2 text-center">{entry.grade}</td>
                    <td className="border border-black px-4 py-2 font-medium">{entry.school}</td>
                    <td className="border border-black px-3 py-2 text-center font-bold">
                      <span className={entry.result === 'Aprovado' ? 'text-emerald-800' : 'text-gray-900'}>
                        {entry.result}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* 5. MATRÍCULA */}
        {/* ========================================================================= */}
        <div className="border border-black p-5 space-y-3 rounded-xs">
          <h3 className="font-bold text-base uppercase tracking-wide border-b-2 border-black pb-1 bg-gray-100 -mx-5 -mt-5 p-3">
            5. MATRÍCULA
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-x-4 gap-y-3 text-xs">
            <div className="md:col-span-4 flex items-baseline gap-2">
              <span className="font-bold whitespace-nowrap">Data da Matrícula:</span>
              <span className="flex-1 font-semibold border-b border-black border-dotted px-1">
                {formatDisplayDate(student.enrollmentDate)}
              </span>
            </div>

            <div className="md:col-span-4 flex items-baseline gap-2">
              <span className="font-bold whitespace-nowrap">Classe de Ingresso:</span>
              <span className="flex-1 font-semibold border-b border-black border-dotted px-1">
                {student.entryGrade || studentClass?.gradeLevel || '10ª Classe'}
              </span>
            </div>

            <div className="md:col-span-4 flex items-baseline gap-2">
              <span className="font-bold whitespace-nowrap">Regime:</span>
              <span className="flex-1 font-semibold border-b border-black border-dotted px-1">
                {student.regime || 'Diurno / Regular'}
              </span>
            </div>

            <div className="md:col-span-4 flex items-baseline gap-2">
              <span className="font-bold whitespace-nowrap">Turno:</span>
              <span className="flex-1 font-semibold border-b border-black border-dotted px-1">
                {student.shift || studentClass?.period || 'Manhã'}
              </span>
            </div>

            <div className="md:col-span-8 flex items-center gap-4 flex-wrap">
              <span className="font-bold whitespace-nowrap">Situação:</span>
              {(['Activo', 'Transferido', 'Desistente', 'Concluído'] as const).map((sit) => (
                <label key={sit} className="inline-flex items-center gap-1 font-medium cursor-pointer">
                  {studentStatus === sit ? (
                    <CheckSquare className="h-4 w-4 text-black" />
                  ) : (
                    <Square className="h-4 w-4 text-gray-500" />
                  )}
                  <span>{sit}</span>
                </label>
              ))}
            </div>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* 6. AVALIAÇÃO E APROVEITAMENTO */}
        {/* ========================================================================= */}
        <div className="border border-black p-5 space-y-3 rounded-xs">
          <h3 className="font-bold text-base uppercase tracking-wide border-b-2 border-black pb-1 bg-gray-100 -mx-5 -mt-5 p-3">
            6. AVALIAÇÃO E APROVEITAMENTO
          </h3>

          <div className="overflow-x-auto">
            <table className="min-w-full border-collapse border border-black text-xs">
              <thead className="bg-gray-100 font-bold uppercase">
                <tr>
                  <th className="border border-black px-4 py-2 text-left">Disciplina</th>
                  <th className="border border-black px-3 py-2 text-center w-24">I Trimestre</th>
                  <th className="border border-black px-3 py-2 text-center w-24">II Trimestre</th>
                  <th className="border border-black px-3 py-2 text-center w-24">III Trimestre</th>
                  <th className="border border-black px-3 py-2 text-center w-24">Média</th>
                </tr>
              </thead>
              <tbody>
                {subjects.length > 0 ? (
                  subjects.map((sub) => {
                    const { g1, g2, g3, media } = getSubjectGrades(sub.id);
                    return (
                      <tr key={sub.id} className="hover:bg-gray-50">
                        <td className="border border-black px-4 py-1.5 font-medium">{sub.name}</td>
                        <td className="border border-black px-3 py-1.5 text-center">{g1 !== undefined ? g1 : '-'}</td>
                        <td className="border border-black px-3 py-1.5 text-center">{g2 !== undefined ? g2 : '-'}</td>
                        <td className="border border-black px-3 py-1.5 text-center">{g3 !== undefined ? g3 : '-'}</td>
                        <td className={`border border-black px-3 py-1.5 text-center font-bold ${
                          media !== undefined && media < 10 ? 'text-red-700' : 'text-gray-900'
                        }`}>
                          {media !== undefined ? media : '-'}
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={5} className="border border-black px-4 py-3 text-center text-gray-500 italic">
                      Aguardando lançamento oficial de pautas trimestrais.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* 7. REGISTO DE OCORRÊNCIAS */}
        {/* ========================================================================= */}
        <div className="border border-black p-5 space-y-3 rounded-xs">
          <h3 className="font-bold text-base uppercase tracking-wide border-b-2 border-black pb-1 bg-gray-100 -mx-5 -mt-5 p-3">
            7. REGISTO DE OCORRÊNCIAS
          </h3>

          <div className="overflow-x-auto">
            <table className="min-w-full border-collapse border border-black text-xs">
              <thead className="bg-gray-100 font-bold">
                <tr>
                  <th className="border border-black px-3 py-2 text-center w-28">Data</th>
                  <th className="border border-black px-4 py-2 text-left">Descrição</th>
                  <th className="border border-black px-3 py-2 text-left w-48">Responsável</th>
                </tr>
              </thead>
              <tbody>
                {occurrences.map((occ, idx) => (
                  <tr key={idx}>
                    <td className="border border-black px-3 py-2 text-center font-mono">{occ.date}</td>
                    <td className="border border-black px-4 py-2">{occ.description}</td>
                    <td className="border border-black px-3 py-2 font-medium">{occ.responsible}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* 8. ASSIDUIDADE */}
        {/* ========================================================================= */}
        <div className="border border-black p-5 space-y-3 rounded-xs">
          <h3 className="font-bold text-base uppercase tracking-wide border-b-2 border-black pb-1 bg-gray-100 -mx-5 -mt-5 p-3">
            8. ASSIDUIDADE
          </h3>

          <div className="overflow-x-auto">
            <table className="min-w-full border-collapse border border-black text-xs">
              <thead className="bg-gray-100 font-bold">
                <tr>
                  <th className="border border-black px-4 py-2 text-left">Mês</th>
                  <th className="border border-black px-3 py-2 text-center w-28">Presenças</th>
                  <th className="border border-black px-3 py-2 text-center w-36">Faltas Justificadas</th>
                  <th className="border border-black px-3 py-2 text-center w-36">Faltas Injustificadas</th>
                </tr>
              </thead>
              <tbody>
                {attendanceList.map((att, idx) => (
                  <tr key={idx} className="hover:bg-gray-50">
                    <td className="border border-black px-4 py-1.5 font-medium">{att.month}</td>
                    <td className="border border-black px-3 py-1.5 text-center font-mono">{att.presences}</td>
                    <td className="border border-black px-3 py-1.5 text-center font-mono">{att.justifiedAbsences}</td>
                    <td className="border border-black px-3 py-1.5 text-center font-mono font-bold text-red-700">
                      {att.unjustifiedAbsences}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* 9. TRANSFERÊNCIA OU CONCLUSÃO */}
        {/* ========================================================================= */}
        <div className="border border-black p-5 space-y-3 rounded-xs">
          <h3 className="font-bold text-base uppercase tracking-wide border-b-2 border-black pb-1 bg-gray-100 -mx-5 -mt-5 p-3">
            9. TRANSFERÊNCIA OU CONCLUSÃO
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-x-4 gap-y-3 text-xs">
            <div className="md:col-span-4 flex items-baseline gap-2">
              <span className="font-bold whitespace-nowrap">Data:</span>
              <span className="flex-1 font-semibold border-b border-black border-dotted px-1">
                {formatDisplayDate(student.transferDate)}
              </span>
            </div>

            <div className="md:col-span-8 flex items-baseline gap-2">
              <span className="font-bold whitespace-nowrap">Motivo:</span>
              <span className="flex-1 border-b border-black border-dotted px-1">
                {student.transferReason || '__________________________________________________________________'}
              </span>
            </div>

            <div className="md:col-span-12 flex items-baseline gap-2">
              <span className="font-bold whitespace-nowrap">Instituição de Destino:</span>
              <span className="flex-1 border-b border-black border-dotted px-1">
                {student.transferDestination || '__________________________________________________________________'}
              </span>
            </div>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* 10. OBSERVAÇÕES GERAIS */}
        {/* ========================================================================= */}
        <div className="border border-black p-5 space-y-3 rounded-xs">
          <h3 className="font-bold text-base uppercase tracking-wide border-b-2 border-black pb-1 bg-gray-100 -mx-5 -mt-5 p-3">
            10. OBSERVAÇÕES GERAIS
          </h3>

          <div className="p-3 min-h-[70px] border border-gray-300 rounded-xs bg-gray-50/40 text-xs leading-relaxed">
            {student.generalObservations || (
              <p className="text-gray-500 italic">
                O(A) estudante cumpre o regulamento interno e o estatuto do aluno do Ensino Geral (MINEDH). Todos os dados e documentos comprovativos encontram-se devidamente conferidos e arquivados no processo individual da Secretaria Académica.
              </p>
            )}
          </div>
        </div>

        {/* ========================================================================= */}
        {/* ASSINATURAS OFICIAIS */}
        {/* ========================================================================= */}
        <div className="pt-6 border-t-2 border-black space-y-8">
          <h3 className="text-center font-black text-sm uppercase tracking-widest text-black">
            ASSINATURAS
          </h3>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center text-xs">
            <div className="flex flex-col justify-between h-28">
              <div className="flex-1"></div>
              <div className="border-t border-black pt-2">
                <p className="font-bold uppercase text-[11px]">Director da Escola</p>
                <span className="text-[10px] text-gray-500 block">Data: ____/____/20____</span>
              </div>
            </div>

            <div className="flex flex-col justify-between h-28">
              <div className="flex-1"></div>
              <div className="border-t border-black pt-2">
                <p className="font-bold uppercase text-[11px]">Director Pedagógico</p>
                <span className="text-[10px] text-gray-500 block">Data: ____/____/20____</span>
              </div>
            </div>

            <div className="flex flex-col justify-between h-28">
              <div className="flex-1"></div>
              <div className="border-t border-black pt-2">
                <p className="font-bold uppercase text-[11px]">Secretaria Académica</p>
                <span className="text-[10px] text-gray-500 block">Data: ____/____/20____</span>
              </div>
            </div>

            <div className="flex flex-col justify-between h-28">
              <div className="flex-1"></div>
              <div className="border-t border-black pt-2">
                <p className="font-bold uppercase text-[11px]">Encarregado de Educação</p>
                <span className="text-[10px] text-gray-500 block">Data: ____/____/20____</span>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
