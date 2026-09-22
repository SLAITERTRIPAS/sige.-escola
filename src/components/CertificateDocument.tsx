import React, { useState } from 'react';
import { Student, Class, Subject, Grade } from '../types';
import { Button } from './ui';
import { Printer, CheckCircle, ShieldCheck, X, Award, BookOpen, GraduationCap, Sparkles, FileSpreadsheet } from 'lucide-react';

interface CertificateDocumentProps {
  student: Student;
  schoolClass?: Class;
  schoolName?: string;
  directorName?: string;
  pedagogicalDirectorName?: string;
  secretaryName?: string;
  subjects: Subject[];
  grades: Grade[];
  academicYear?: number;
  onClose: () => void;
}

function numberToWords(num: number): string {
  const words: Record<number, string> = {
    0: 'Zero', 1: 'Um', 2: 'Dois', 3: 'Três', 4: 'Quatro', 5: 'Cinco',
    6: 'Seis', 7: 'Sete', 8: 'Oito', 9: 'Nove', 10: 'Dez', 11: 'Onze',
    12: 'Doze', 13: 'Treze', 14: 'Catorze', 15: 'Quinze', 16: 'Dezasseis',
    17: 'Dezassete', 18: 'Dezoito', 19: 'Dezanove', 20: 'Vinte'
  };
  return words[Math.round(num)] || `${num}`;
}

export function CertificateDocument({
  student,
  schoolClass,
  schoolName = 'Escola Secundária Central',
  directorName = 'Prof. Doutor Zacarias Manuel Tembe',
  pedagogicalDirectorName = 'Dr. Mateus Armando Cuna',
  secretaryName = 'Dra. Ana Beatriz Machava',
  subjects,
  grades,
  academicYear = 2026,
  onClose
}: CertificateDocumentProps) {
  type ExemplarType = 'Original do Aluno' | 'Processo Individual' | 'Arquivo Escolar' | 'Secretaria Académica';
  const [exemplar, setExemplar] = useState<ExemplarType>('Original do Aluno');
  const [viewMode, setViewMode] = useState<'diploma_portrait' | 'transcript_portrait'>('transcript_portrait');
  const [certType, setCertType] = useState<'DE CONCLUSÃO DO CURSO' | 'DE HABILITAÇÕES LITERÁRIAS'>('DE CONCLUSÃO DO CURSO');

  const gradeLevel = schoolClass?.gradeLevel || student.entryGrade || '10ª Classe';
  const processNumber = student.processCode || `PROC-${academicYear}-${student.id.toUpperCase()}`;
  const studentNum = student.studentNumber || (student.frequencyNumber ? `ALU-${student.frequencyNumber.toString().padStart(4, '0')}` : `ALU-1042`);
  const certificateCode = `ES/CC/${academicYear}/${student.frequencyNumber ? String(student.frequencyNumber).padStart(4, '0') : '0042'}`;
  const validationCode = `VAL-MZ-${academicYear}-CERT-${gradeLevel.replace(/[^0-9]/g, '') || '10'}C-${student.id.toUpperCase()}`;
  
  const currentDateFormatted = new Intl.DateTimeFormat('pt-MZ', { day: 'numeric', month: 'long', year: 'numeric' }).format(new Date());

  // Subject Grades Calculation
  const subjectGradeList = subjects.map(sub => {
    const g1 = grades.find(g => g.studentId === student.id && g.subjectId === sub.id && g.trimester === 1);
    const g2 = grades.find(g => g.studentId === student.id && g.subjectId === sub.id && g.trimester === 2);
    const g3 = grades.find(g => g.studentId === student.id && g.subjectId === sub.id && g.trimester === 3);

    const val1 = g1?.media ?? g1?.apt ?? g1?.acs1;
    const val2 = g2?.media ?? g2?.apt ?? g2?.acs1;
    const val3 = g3?.media ?? g3?.apt ?? g3?.acs1;

    const validVals = [val1, val2, val3].filter((v): v is number => typeof v === 'number');
    let finalScore = 14;
    if (validVals.length > 0) {
      finalScore = Math.round(validVals.reduce((a, b) => a + b, 0) / validVals.length);
    }

    return {
      subject: sub,
      score: finalScore,
      words: numberToWords(finalScore)
    };
  });

  const totalScore = subjectGradeList.reduce((acc, item) => acc + item.score, 0);
  const averageScore = subjectGradeList.length > 0 ? Math.round(totalScore / subjectGradeList.length) : 14;
  const isApproved = averageScore >= 10;
  const averageWords = numberToWords(averageScore);

  const courseTitle = gradeLevel.includes('10') || gradeLevel.includes('11') || gradeLevel.includes('12') 
    ? 'Ensino Secundário Geral (2º Ciclo)' 
    : gradeLevel.includes('7') || gradeLevel.includes('8') || gradeLevel.includes('9')
    ? 'Ensino Básico / Secundário Geral (1º Ciclo)'
    : 'Ensino Primário Completo';

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/85 backdrop-blur-md flex flex-col items-center justify-start p-2 sm:p-4 md:p-6 print:p-0 print:bg-white print:static">
      
      {/* Barra de Controlo e Ações Superiores (Oculta na Impressão) */}
      <div className="w-full max-w-6xl bg-slate-900 border border-slate-700 text-white rounded-t-xl p-4 flex flex-wrap items-center justify-between gap-4 sticky top-2 z-30 shadow-2xl print:hidden">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-amber-500/20 text-amber-400 rounded-lg border border-amber-500/30">
            <Award className="h-6 w-6" />
          </div>
          <div>
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              Certificado Oficial • Matriz MINEDH
              <span className="text-xs px-2 py-0.5 rounded-full bg-amber-400/20 text-amber-300 font-mono border border-amber-400/30">
                {gradeLevel}
              </span>
            </h2>
            <p className="text-xs text-slate-400">
              Aluno: <span className="text-white font-medium">{student.name}</span> | Matrícula: {studentNum}
            </p>
          </div>
        </div>

        {/* Alternador de Modelo: Diploma Vertical vs Transcrição Vertical */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-slate-300">Layout:</span>
          <div className="inline-flex rounded-lg bg-slate-800 p-1 border border-slate-700 text-xs">
            <button
              type="button"
              onClick={() => setViewMode('diploma_portrait')}
              className={`px-3 py-1.5 rounded font-medium flex items-center gap-1.5 transition-all ${
                viewMode === 'diploma_portrait'
                  ? 'bg-amber-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
              }`}
            >
              <Award className="h-3.5 w-3.5" /> Diploma Oficial (Vertical)
            </button>
            <button
              type="button"
              onClick={() => setViewMode('transcript_portrait')}
              className={`px-3 py-1.5 rounded font-medium flex items-center gap-1.5 transition-all ${
                viewMode === 'transcript_portrait'
                  ? 'bg-amber-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
              }`}
            >
              <FileSpreadsheet className="h-3.5 w-3.5" /> Pauta Curricular (Vertical A4)
            </button>
          </div>
        </div>

        {/* Tipo de Título & Exemplar */}
        <div className="flex items-center gap-2">
          <select
            value={certType}
            onChange={(e) => setCertType(e.target.value as any)}
            className="bg-slate-800 text-xs text-amber-300 border border-slate-700 rounded-lg px-2.5 py-1.5 outline-none focus:border-amber-500"
          >
            <option value="DE CONCLUSÃO DO CURSO">De Conclusão do Curso</option>
            <option value="DE HABILITAÇÕES LITERÁRIAS">De Habilitações Literárias</option>
          </select>

          <select
            value={exemplar}
            onChange={(e) => setExemplar(e.target.value as any)}
            className="bg-slate-800 text-xs text-slate-200 border border-slate-700 rounded-lg px-2.5 py-1.5 outline-none focus:border-amber-500"
          >
            <option value="Original do Aluno">Original do Aluno</option>
            <option value="Processo Individual">Processo Individual</option>
            <option value="Arquivo Escolar">Arquivo Escolar</option>
            <option value="Secretaria Académica">Secretaria Académica</option>
          </select>
        </div>

        {/* Botões de Ação */}
        <div className="flex items-center gap-2">
          <Button
            onClick={handlePrint}
            className="bg-amber-600 hover:bg-amber-700 text-white gap-2 font-medium shadow"
          >
            <Printer className="h-4 w-4" /> Imprimir Documento
          </Button>
          <Button
            variant="outline"
            onClick={onClose}
            className="text-slate-300 border-slate-700 hover:bg-slate-800 hover:text-white"
          >
            <X className="h-4 w-4" /> Fechar
          </Button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* MODELO 1: DIPLOMA EM PORTRAIT (VERTICAL A4)                              */}
      {/* ========================================================================= */}
      {viewMode === 'diploma_portrait' ? (
        <div 
          id="certificate-print-area"
          className="w-full max-w-4xl bg-[#fcfbf7] text-[#0f172a] shadow-2xl rounded-b-xl print:rounded-none print:shadow-none print:max-w-none print:w-[210mm] print:min-h-[297mm] p-6 sm:p-8 relative overflow-hidden font-serif select-none"
        >
          {/* Fundo de Segurança com Padrão Guilhoché Fino e Marca d'Água do Brasão Nacional */}
          <div className="absolute inset-0 pointer-events-none select-none z-0 opacity-15 overflow-hidden">
            <svg className="w-full h-full text-blue-900" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <pattern id="guilloche-pat" width="60" height="60" patternUnits="userSpaceOnUse">
                  <path d="M 0 30 Q 15 0, 30 30 T 60 30" fill="none" stroke="currentColor" strokeWidth="0.6" opacity="0.6" />
                  <path d="M 0 30 Q 15 60, 30 30 T 60 30" fill="none" stroke="#b45309" strokeWidth="0.5" opacity="0.4" />
                  <circle cx="30" cy="30" r="18" fill="none" stroke="currentColor" strokeWidth="0.4" opacity="0.3" />
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#guilloche-pat)" />
            </svg>
          </div>

          {/* Brasão Nacional em Marca d'Água Central (20% Opacity) */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none z-0">
            <img
              src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQua66hW5lOO75LXVLwiJWQJKtgoRJzX58EUSAAc2QdYQ&s=10"
              alt=""
              className="w-80 h-80 object-contain opacity-20 filter grayscale"
              referrerPolicy="no-referrer"
            />
          </div>

          {/* ========================================================================= */}
          {/* MOLDURA EXTERIOR E INTERIOR COM FAIXAS LATERAIS E CANTOS ORNAMENTAIS       */}
          {/* ========================================================================= */}
          <div className="relative z-10 border-[8px] border-[#0b2545] p-1.5 bg-transparent shadow-inner">
            <div className="border-[3px] border-[#c59b27] p-1.5 bg-transparent relative">
              <div className="border-[2px] border-[#0b2545] p-6 sm:p-8 bg-white/80 backdrop-blur-[1.5px] relative min-h-[580px] flex flex-col justify-between">
                
                {/* 4 Cantos Triangulares Geométricos Azul Marinho & Dourado (Exact Image Style) */}
                {/* Canto Superior Esquerdo */}
                <div className="absolute -top-1 -left-1 w-16 h-16 overflow-hidden pointer-events-none z-30">
                  <div className="w-20 h-20 bg-[#0b2545] border-2 border-[#c59b27] -rotate-45 -translate-x-10 -translate-y-10 flex items-end justify-center pb-2">
                    <div className="w-4 h-4 border-2 border-[#d4af37] rotate-45"></div>
                  </div>
                </div>
                {/* Canto Superior Direito */}
                <div className="absolute -top-1 -right-1 w-16 h-16 overflow-hidden pointer-events-none z-30">
                  <div className="w-20 h-20 bg-[#0b2545] border-2 border-[#c59b27] rotate-45 translate-x-10 -translate-y-10 flex items-end justify-center pb-2">
                    <div className="w-4 h-4 border-2 border-[#d4af37] -rotate-45"></div>
                  </div>
                </div>
                {/* Canto Inferior Esquerdo */}
                <div className="absolute -bottom-1 -left-1 w-16 h-16 overflow-hidden pointer-events-none z-30">
                  <div className="w-20 h-20 bg-[#0b2545] border-2 border-[#c59b27] rotate-45 -translate-x-10 translate-y-10 flex items-start justify-center pt-2">
                    <div className="w-4 h-4 border-2 border-[#d4af37] -rotate-45"></div>
                  </div>
                </div>
                {/* Canto Inferior Direito */}
                <div className="absolute -bottom-1 -right-1 w-16 h-16 overflow-hidden pointer-events-none z-30">
                  <div className="w-20 h-20 bg-[#0b2545] border-2 border-[#c59b27] -rotate-45 translate-x-10 translate-y-10 flex items-start justify-center pt-2">
                    <div className="w-4 h-4 border-2 border-[#d4af37] rotate-45"></div>
                  </div>
                </div>

                {/* ========================================================================= */}
                {/* FAIXA LATERAL ESQUERDA (AZUL MARINHO + DOURADO + DISCIPLINA/CIÊNCIA...)   */}
                {/* ========================================================================= */}
                <div className="absolute left-4 top-10 bottom-10 w-12 bg-[#0b2545] border-2 border-[#c59b27] rounded-sm shadow-xl flex flex-col items-center justify-between py-4 text-[#d4af37] z-20 hidden md:flex">
                  {/* Selo com Ícone do Livro Aberto no Topo */}
                  <div className="w-9 h-9 rounded-full border-2 border-[#d4af37] bg-[#08182b] flex items-center justify-center shadow-lg transform hover:scale-110 transition-transform">
                    <BookOpen className="h-5 w-5 text-[#e6ca65]" />
                  </div>
                  
                  {/* Texto Vertical: DISCIPLINA • CIÊNCIA • TRABALHO • PROGRESSO */}
                  <div className="flex-1 flex flex-col items-center justify-center gap-6 my-4">
                    <span className="[writing-mode:vertical-rl] rotate-180 text-[11px] font-black tracking-[0.3em] uppercase text-[#e6ca65] font-sans drop-shadow-sm">
                      DISCIPLINA
                    </span>
                    <span className="[writing-mode:vertical-rl] rotate-180 text-[11px] font-black tracking-[0.3em] uppercase text-[#e6ca65] font-sans drop-shadow-sm">
                      CIÊNCIA
                    </span>
                    <span className="[writing-mode:vertical-rl] rotate-180 text-[11px] font-black tracking-[0.3em] uppercase text-[#e6ca65] font-sans drop-shadow-sm">
                      TRABALHO
                    </span>
                    <span className="[writing-mode:vertical-rl] rotate-180 text-[11px] font-black tracking-[0.3em] uppercase text-[#e6ca65] font-sans drop-shadow-sm">
                      PROGRESSO
                    </span>
                  </div>

                  {/* Ornamento Dourado na Base */}
                  <div className="w-8 h-8 flex items-center justify-center">
                    <div className="w-4 h-4 rotate-45 border border-[#d4af37] bg-[#e6ca65]/20"></div>
                  </div>
                </div>

                {/* ========================================================================= */}
                {/* FAIXA LATERAL DIREITA (AZUL MARINHO + DOURADO + FORMAR HOJE LÍDERES...)    */}
                {/* ========================================================================= */}
                <div className="absolute right-4 top-10 bottom-10 w-12 bg-[#0b2545] border-2 border-[#c59b27] rounded-sm shadow-xl flex flex-col items-center justify-between py-4 text-[#d4af37] z-20 hidden md:flex">
                  {/* Selo com Ícone do Chapéu de Formatura / Graduação no Topo */}
                  <div className="w-9 h-9 rounded-full border-2 border-[#d4af37] bg-[#08182b] flex items-center justify-center shadow-lg transform hover:scale-110 transition-transform">
                    <GraduationCap className="h-5 w-5 text-[#e6ca65]" />
                  </div>

                  {/* Texto Vertical: FORMAR • HOJE • LÍDERES • PARA AMANHÃ */}
                  <div className="flex-1 flex flex-col items-center justify-center gap-6 my-4">
                    <span className="[writing-mode:vertical-rl] rotate-180 text-[11px] font-black tracking-[0.3em] uppercase text-[#e6ca65] font-sans drop-shadow-sm">
                      FORMAR
                    </span>
                    <span className="[writing-mode:vertical-rl] rotate-180 text-[11px] font-black tracking-[0.3em] uppercase text-[#e6ca65] font-sans drop-shadow-sm">
                      HOJE
                    </span>
                    <span className="[writing-mode:vertical-rl] rotate-180 text-[11px] font-black tracking-[0.3em] uppercase text-[#e6ca65] font-sans drop-shadow-sm">
                      LÍDERES
                    </span>
                    <span className="[writing-mode:vertical-rl] rotate-180 text-[11px] font-black tracking-[0.3em] uppercase text-[#e6ca65] font-sans drop-shadow-sm">
                      PARA AMANHÃ
                    </span>
                  </div>

                  {/* Ornamento Dourado na Base */}
                  <div className="w-8 h-8 flex items-center justify-center">
                    <div className="w-4 h-4 rotate-45 border border-[#d4af37] bg-[#e6ca65]/20"></div>
                  </div>
                </div>

                {/* Conteúdo Central do Certificado (Margens Laterais para Acomodar as Faixas) */}
                <div className="md:px-14 flex flex-col justify-between flex-1 space-y-5">
                  
                  {/* Linha Superior com Indicador de Exemplar & Registro */}
                  <div className="flex justify-between items-center text-[9px] uppercase font-sans tracking-widest text-slate-500 border-b border-slate-200 pb-1">
                    <span className="font-semibold text-amber-900">
                      REPÚBLICA DE MOÇAMBIQUE • DOCUMENTO PÚBLICO OFICIAL [{exemplar.toUpperCase()}]
                    </span>
                    <span className="font-mono text-slate-600 font-bold">
                      PROCESSO N.º: {processNumber}
                    </span>
                  </div>

                  {/* Cabeçalho Oficial (3 Colunas: Esquerda Minedh, Centro Emblema, Direita Escola) */}
                  <div className="grid grid-cols-1 md:grid-cols-12 items-center gap-2 text-center md:text-left">
                    {/* Esquerda: Ministério */}
                    <div className="md:col-span-4 space-y-0.5">
                      <p className="text-xs font-black uppercase text-[#0b2545] tracking-wider leading-tight">
                        REPÚBLICA DE MOÇAMBIQUE
                      </p>
                      <p className="text-[11px] font-bold uppercase text-slate-800 leading-tight">
                        MINISTÉRIO DA EDUCAÇÃO E DESENVOLVIMENTO HUMANO
                      </p>
                      <p className="text-[10px] font-medium text-slate-600">
                        DIRECÇÃO PROVINCIAL DE EDUCAÇÃO
                      </p>
                    </div>

                    {/* Centro: Emblema Nacional Colorido */}
                    <div className="md:col-span-4 flex justify-center py-1">
                      <div className="relative">
                        <img
                          src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQua66hW5lOO75LXVLwiJWQJKtgoRJzX58EUSAAc2QdYQ&s=10"
                          alt="Brasão da República de Moçambique"
                          className="h-20 w-20 object-contain drop-shadow-sm"
                          referrerPolicy="no-referrer"
                        />
                      </div>
                    </div>

                    {/* Direita: Escola e Lema Institucional */}
                    <div className="md:col-span-4 text-center md:text-right space-y-0.5">
                      <p className="text-xs font-black uppercase text-[#0b2545] tracking-wide leading-tight">
                        {schoolName.toUpperCase()}
                      </p>
                      <p className="text-[10px] italic text-[#996515] font-serif">
                        "Conhecimento para um Desenvolvimento Sustentável"
                      </p>
                      <p className="text-[9px] font-semibold text-slate-600 uppercase tracking-wider">
                        Educação, Disciplina e Progresso
                      </p>
                    </div>
                  </div>

                  {/* Título Monumental do Certificado */}
                  <div className="text-center my-1">
                    <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-[#0b2545] tracking-[0.15em] uppercase font-serif">
                      CERTIFICADO
                    </h1>
                    
                    {/* Linhas Douradas com Ornamento Central */}
                    <div className="flex items-center justify-center gap-3 my-1">
                      <div className="h-[1.5px] w-24 sm:w-36 bg-gradient-to-r from-transparent via-[#c59b27] to-[#c59b27]"></div>
                      <div className="flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rotate-45 bg-[#c59b27]"></span>
                        <span className="text-[11px] sm:text-xs font-bold tracking-[0.2em] text-[#8c6d1f] uppercase font-sans">
                          {certType}
                        </span>
                        <span className="w-1.5 h-1.5 rotate-45 bg-[#c59b27]"></span>
                      </div>
                      <div className="h-[1.5px] w-24 sm:w-36 bg-gradient-to-l from-transparent via-[#c59b27] to-[#c59b27]"></div>
                    </div>
                  </div>

                  {/* Corpo do Certificado / Texto Solene */}
                  <div className="text-center space-y-3 px-2 sm:px-6">
                    <p className="text-xs sm:text-sm italic font-serif text-slate-700">
                      Certifica-se que
                    </p>

                    {/* Nome Completo do Aluno em Destaque Vermelho e Negrito com Sublinhado Elegante */}
                    <div className="py-1">
                      <h2 className="text-xl sm:text-2xl md:text-3xl font-black text-red-600 uppercase tracking-wider font-serif inline-block px-4 py-1 border-b-2 border-red-600/60 shadow-xs">
                        {student.name}
                      </h2>
                    </div>

                    {/* Texto de Conclusão */}
                    <p className="text-xs sm:text-sm text-slate-800 leading-relaxed max-w-3xl mx-auto text-justify sm:text-center">
                      concluiu com aproveitamento o Curso de <strong className="font-bold text-[#0b2545]">{courseTitle}</strong> ({gradeLevel}), 
                      ministrado por este Estabelecimento de Ensino, no ano lectivo de <strong className="font-bold text-[#0b2545]">{academicYear}</strong>, 
                      tendo obtido a classificação final de <strong className="font-bold text-slate-950">{averageScore} ({averageWords}) valores</strong> ({isApproved ? 'Aprovado' : 'Não Aprovado'}), 
                      cumprindo integralmente todas as exigências curriculares e regulamentares do Sistema Nacional de Educação.
                    </p>
                  </div>

                  {/* Tabela de Dados e Identificação do Aluno em Grid 2 Colunas */}
                  <div className="bg-slate-50/90 border border-slate-300 rounded p-3 text-[11px] sm:text-xs font-sans max-w-4xl mx-auto w-full shadow-xs">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-1.5">
                      <div className="flex justify-between border-b border-slate-200 pb-0.5">
                        <span className="text-slate-600">N.º de Estudante / Matrícula:</span>
                        <strong className="text-slate-900 font-mono">{studentNum}</strong>
                      </div>
                      <div className="flex justify-between border-b border-slate-200 pb-0.5">
                        <span className="text-slate-600">Data de Nascimento:</span>
                        <strong className="text-slate-900">{student.birthDate || '12/04/2007'}</strong>
                      </div>

                      <div className="flex justify-between border-b border-slate-200 pb-0.5">
                        <span className="text-slate-600">Documento de Identificação (BI/DIRE):</span>
                        <strong className="text-slate-900 font-mono">{student.idCardNumber || '110100984523B'}</strong>
                      </div>
                      <div className="flex justify-between border-b border-slate-200 pb-0.5">
                        <span className="text-slate-600">Naturalidade / Província:</span>
                        <strong className="text-slate-900">{student.birthPlace || student.district || 'Maputo'}</strong>
                      </div>

                      <div className="flex justify-between">
                        <span className="text-slate-600">NUIT / Registo Fiscal:</span>
                        <strong className="text-slate-900 font-mono">148291042</strong>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-600">Data de Conclusão:</span>
                        <strong className="text-slate-900">30 de Novembro de {academicYear}</strong>
                      </div>
                    </div>
                  </div>

                  {/* Local e Data de Emissão */}
                  <div className="text-center sm:text-right text-xs font-medium text-slate-800 font-sans pr-4">
                    Maputo, aos {currentDateFormatted}
                  </div>

                  {/* Bloco das 3 Assinaturas com Selo Branco e Carimbo Circular (Idêntico ao Documento da Imagem) */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-end pt-3 border-t border-slate-300 font-sans text-xs">
                    
                    {/* Assinatura 1: O Director Geral / Director da Escola */}
                    <div className="text-center space-y-1">
                      <p className="text-slate-600 font-bold uppercase text-[10px] tracking-wide">
                        O Director da Escola
                      </p>
                      <div className="h-12 flex items-end justify-center">
                        <span className="font-serif font-bold text-slate-900 text-xs text-center border-b border-slate-800 w-44 pb-1">
                          {directorName}
                        </span>
                      </div>
                      <p className="text-[9px] text-slate-500">Direcção da Escola</p>
                    </div>

                    {/* Assinatura 2: Carimbo Circular a Óleo e Selo Branco */}
                    <div className="flex flex-col items-center justify-center space-y-1">
                      <div className="w-20 h-20 rounded-full border-2 border-dashed border-[#0b2545]/70 flex flex-col items-center justify-center p-1 text-center bg-blue-50/40 shadow-xs">
                        <span className="text-[7px] font-bold text-[#0b2545] tracking-tighter uppercase leading-none">
                          REPÚBLICA DE MOÇAMBIQUE
                        </span>
                        <Award className="h-4 w-4 text-[#c59b27] my-0.5" />
                        <span className="text-[7px] font-bold text-[#0b2545] uppercase leading-none">
                          SELO BRANCO EM USO
                        </span>
                      </div>
                      <span className="text-[8px] text-slate-500 uppercase tracking-widest">Autenticado com Selo Branco</span>
                    </div>

                    {/* Assinatura 3: O Secretário Académico */}
                    <div className="text-center space-y-1">
                      <p className="text-slate-600 font-bold uppercase text-[10px] tracking-wide">
                        A Secretária Académica
                      </p>
                      <div className="h-12 flex items-end justify-center">
                        <span className="font-serif italic text-slate-700 text-xs text-center border-b border-slate-800 w-44 pb-1">
                          {secretaryName}
                        </span>
                      </div>
                      <p className="text-[9px] text-slate-500">Secretaria Académica</p>
                    </div>
                  </div>

                  {/* Rodapé com QR Code, Lema Institucional e Código Oficial do Certificado */}
                  <div className="mt-4 pt-3 border-t border-slate-300 flex flex-wrap items-center justify-between gap-3 font-sans text-[10px] text-slate-600">
                    
                    {/* QR Code e Link de Verificação */}
                    <div className="flex items-center gap-2.5">
                      <div className="w-12 h-12 p-0.5 bg-white border border-slate-400 rounded flex flex-col items-center justify-center shadow-xs">
                        <svg className="w-full h-full text-slate-900" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M2 2h8v8H2V2zm2 2v4h4V4H4zm10-2h8v8h-8V2zm2 2v4h4V4h-4zM2 14h8v8H2v-8zm2 2v4h4v-4H4zm14 2h2v4h-2v-4zm-4-4h4v2h-4v-2zm4 0h4v2h-4v-2zm-4 4h2v2h-2v-2zm2 2h2v2h-2v-2zM5 5h2v2H5V5zm12 0h2v2h-2V5zM5 17h2v2H5v-2z" />
                        </svg>
                      </div>
                      <div className="space-y-0.5">
                        <p className="font-bold text-slate-800 text-[10px] flex items-center gap-1">
                          <CheckCircle className="h-3 w-3 text-emerald-600" />
                          Documento Digitalmente Autenticado
                        </p>
                        <p className="text-[9px] text-slate-500">
                          Verifique a autenticidade em: <strong>www.minedh.gov.mz</strong>
                        </p>
                      </div>
                    </div>

                    {/* Lema Central */}
                    <div className="text-center italic text-[#8c6d1f] font-serif text-[11px]">
                      "Educação, Inovação e Compromisso com o Futuro"
                    </div>

                    {/* Caixa com o Código do Certificado */}
                    <div className="border border-[#0b2545] bg-[#f8fafc] px-3 py-1.5 rounded text-right shadow-xs">
                      <span className="block text-[8px] uppercase tracking-wider text-slate-500 font-medium">Código do Certificado:</span>
                      <span className="font-mono font-bold text-slate-900 text-xs">{certificateCode}</span>
                    </div>

                  </div>

                </div>

              </div>
            </div>
          </div>
        </div>
      ) : (
        /* ========================================================================= */
        /* MODELO 2: PAUTA / TRANSCRIÇÃO DE DISCIPLINAS COMPLETA (VERTICAL A4)       */
        /* ========================================================================= */
        <div 
          id="certificate-print-area"
          className="w-full max-w-4xl bg-[#fffefc] text-slate-900 shadow-2xl rounded-b-xl print:rounded-none print:shadow-none print:max-w-none print:w-[210mm] print:min-h-[297mm] p-6 sm:p-10 md:p-12 relative overflow-hidden font-serif"
        >
          {/* Marca de Água Oficial */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none z-0">
            <img
              src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQua66hW5lOO75LXVLwiJWQJKtgoRJzX58EUSAAc2QdYQ&s=10"
              alt=""
              className="w-96 h-96 object-contain opacity-25 filter grayscale"
              referrerPolicy="no-referrer"
            />
          </div>

          <div className="relative z-10 border-[3.5px] border-[#0b2545] p-2 bg-transparent">
            <div className="border-[1.5px] border-[#c59b27] p-6 sm:p-8 bg-white/80 backdrop-blur-[1px] relative">
              
              {/* Indicador de Topo */}
              <div className="flex justify-between items-start text-[10px] uppercase font-sans tracking-wider border-b border-slate-300 pb-2 mb-4">
                <div className="flex items-center gap-1.5 text-slate-700 font-bold">
                  <ShieldCheck className="h-3.5 w-3.5 text-amber-700" />
                  <span>VIA OFICIAL: <strong className="text-amber-900 bg-amber-100 px-1.5 py-0.5 rounded border border-amber-300">{exemplar}</strong></span>
                </div>
                <div className="text-right text-slate-600 font-mono">
                  REGISTO NACIONAL: {processNumber}
                </div>
              </div>

              {/* Cabeçalho Oficial */}
              <div className="text-center space-y-1.5 mb-6">
                <img
                  src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQua66hW5lOO75LXVLwiJWQJKtgoRJzX58EUSAAc2QdYQ&s=10"
                  alt="Brasão da República de Moçambique"
                  className="mx-auto h-16 w-16 object-contain mb-1"
                  referrerPolicy="no-referrer"
                />
                <h2 className="text-sm sm:text-base font-bold tracking-widest text-[#0b2545] uppercase">
                  REPÚBLICA DE MOÇAMBIQUE
                </h2>
                <h3 className="text-xs sm:text-sm font-semibold tracking-wider text-slate-800 uppercase">
                  MINISTÉRIO DA EDUCAÇÃO E DESENVOLVIMENTO HUMANO
                </h3>
                <h4 className="text-[11px] sm:text-xs font-semibold tracking-wide text-slate-700 uppercase">
                  DIRECÇÃO PROVINCIAL DE EDUCAÇÃO DE {student.province?.toUpperCase() || 'MAPUTO CIDADE'}
                </h4>
                <div className="pt-1">
                  <span className="inline-block font-sans font-bold text-xs uppercase px-3 py-1 bg-slate-100 text-slate-900 border border-slate-400 rounded">
                    {schoolName.toUpperCase()}
                  </span>
                </div>

                <div className="pt-3 pb-1">
                  <h1 className="text-2xl sm:text-3xl font-black text-[#0b2545] tracking-wider uppercase underline underline-offset-8 decoration-1 decoration-[#c59b27]">
                    CERTIFICADO DE HABILITAÇÕES
                  </h1>
                </div>
              </div>

              {/* Texto de Abertura Solene com o Director */}
              <div className="space-y-4 text-justify text-sm leading-relaxed text-slate-900 mb-6">
                <p className="indent-8 leading-relaxed">
                  <strong className="font-bold text-slate-950">{directorName}</strong>, O Director da <strong className="font-bold text-slate-950">{schoolName}</strong>, abaixo-assinado, certifico que, em cumprimento das disposições legais e regulamentares em vigor na República de Moçambique, declaro que:
                </p>

                {/* Box de Identificação */}
                <div className="bg-slate-50/90 border border-slate-300 rounded p-4 font-sans text-xs sm:text-sm space-y-2">
                  <div className="grid grid-cols-1 sm:grid-cols-12 gap-2">
                    <div className="sm:col-span-8">
                      <span className="text-slate-600">Nome Completo: </span>
                      <strong className="text-red-600 font-black uppercase tracking-wide text-base">{student.name}</strong>
                    </div>
                    <div className="sm:col-span-4 text-left sm:text-right">
                      <span className="text-slate-600">Sexo: </span>
                      <strong className="text-slate-950 font-semibold">{student.gender === 'M' ? 'Masculino' : 'Feminino'}</strong>
                    </div>

                    <div className="sm:col-span-6">
                      <span className="text-slate-600">Filho(a) de: </span>
                      <strong className="text-slate-900">{student.fatherName || 'Pai não declarado'}</strong>
                    </div>
                    <div className="sm:col-span-6">
                      <span className="text-slate-600">e de: </span>
                      <strong className="text-slate-900">{student.motherName || 'Mãe não declarada'}</strong>
                    </div>

                    <div className="sm:col-span-4">
                      <span className="text-slate-600">Nascido(a) aos: </span>
                      <strong className="text-slate-900">{student.birthDate || '—'}</strong>
                    </div>
                    <div className="sm:col-span-4">
                      <span className="text-slate-600">Naturalidade: </span>
                      <strong className="text-slate-900">{student.birthPlace || student.district || 'Maputo'}</strong>
                    </div>
                    <div className="sm:col-span-4">
                      <span className="text-slate-600">Nacionalidade: </span>
                      <strong className="text-slate-900">{student.nationality || 'Moçambicana'}</strong>
                    </div>

                    <div className="sm:col-span-6">
                      <span className="text-slate-600">BI / Passaporte / DIRE N.º: </span>
                      <strong className="text-slate-900">{student.idCardNumber || '110100984523B'}</strong>
                    </div>
                    <div className="sm:col-span-6">
                      <span className="text-slate-600">Processo Individual N.º: </span>
                      <strong className="text-slate-900 font-mono">{processNumber}</strong> (Nº Aluno: {studentNum})
                    </div>
                  </div>
                </div>

                <p className="indent-8">
                  Concluiu com aproveitamento no Ano Lectivo de <strong className="font-bold">{academicYear}</strong> a{' '}
                  <strong className="font-bold text-[#0b2545] underline underline-offset-4">{gradeLevel}</strong>{' '}
                  do Sistema Nacional de Educação, tendo obtido no respectivo plano curricular as seguintes classificações:
                </p>

                {/* Tabela de Notas e Disciplinas */}
                <div className="my-4">
                  <table className="w-full border-collapse border-2 border-slate-900 text-xs sm:text-sm">
                    <thead className="bg-slate-100 text-slate-900 uppercase font-sans font-bold border-b-2 border-slate-900">
                      <tr>
                        <th className="border border-slate-800 px-3 py-2 text-center w-12">N.º</th>
                        <th className="border border-slate-800 px-3 py-2 text-left">Disciplina Curricular</th>
                        <th className="border border-slate-800 px-3 py-2 text-center w-28">Classificação (0-20)</th>
                        <th className="border border-slate-800 px-3 py-2 text-left w-48">Por Extenso</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-400 bg-white/90">
                      {subjectGradeList.map((item, idx) => (
                        <tr key={item.subject.id} className="hover:bg-amber-50/40">
                          <td className="border border-slate-800 px-3 py-1.5 text-center font-mono text-slate-600">
                            {idx + 1}
                          </td>
                          <td className="border border-slate-800 px-3 py-1.5 font-medium text-slate-900">
                            {item.subject.name}
                          </td>
                          <td className={`border border-slate-800 px-3 py-1.5 text-center font-bold ${item.score < 10 ? 'text-red-700' : 'text-slate-950'}`}>
                            {item.score}
                          </td>
                          <td className="border border-slate-800 px-3 py-1.5 italic text-slate-800 capitalize">
                            {item.words} valores
                          </td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot className="bg-slate-100 font-bold border-t-2 border-slate-900 text-slate-950">
                      <tr>
                        <td colSpan={2} className="border border-slate-800 px-3 py-2 text-right uppercase tracking-wider font-sans">
                          Média Final de Conclusão:
                        </td>
                        <td className="border border-slate-800 px-3 py-2 text-center text-base font-black text-amber-950">
                          {averageScore}
                        </td>
                        <td className="border border-slate-800 px-3 py-2 italic font-serif">
                          {averageWords} valores
                        </td>
                      </tr>
                      <tr className="bg-amber-50/80">
                        <td colSpan={2} className="border border-slate-800 px-3 py-2 text-right uppercase tracking-wider font-sans">
                          Resultado Final:
                        </td>
                        <td colSpan={2} className="border border-slate-800 px-3 py-2 font-sans font-black text-emerald-800 uppercase tracking-wide">
                          {isApproved ? `Aprovado(a) com ${averageScore} valores` : 'Não Aprovado(a)'}
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>

                <p className="indent-8 text-justify text-xs sm:text-sm italic text-slate-800">
                  E, por ser verdade e constar dos livros de registo desta secretaria académica, mandou-se passar o presente Certificado de Habilitações que vai assinado pelas entidades competentes e autenticado com o selo branco e carimbo a óleo em uso nesta instituição de ensino.
                </p>
              </div>

              {/* Data e Local */}
              <div className="text-right text-xs sm:text-sm font-medium text-slate-800 mb-8 font-sans">
                Maputo, aos {currentDateFormatted}
              </div>

              {/* Bloco de Assinaturas */}
              <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-end pt-4 border-t border-slate-300 font-sans text-xs">
                <div className="sm:col-span-4 text-center space-y-1">
                  <p className="text-slate-600 font-semibold uppercase text-[11px]">A Secretária Académica</p>
                  <div className="h-14 flex items-end justify-center">
                    <span className="font-serif italic text-slate-700 text-xs text-center border-b border-slate-800 w-44 pb-1">
                      {secretaryName}
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-500">Secretaria Académica</p>
                </div>

                <div className="sm:col-span-4 flex flex-col items-center justify-center space-y-2">
                  <div className="w-22 h-22 rounded-full border-2 border-dashed border-[#0b2545]/70 flex flex-col items-center justify-center p-1 text-center bg-amber-50/30">
                    <span className="text-[7.5px] font-bold text-[#0b2545] tracking-tighter uppercase leading-tight">
                      REPÚBLICA DE MOÇAMBIQUE
                    </span>
                    <Award className="h-4 w-4 text-[#c59b27] my-0.5" />
                    <span className="text-[7.5px] font-bold text-amber-950 uppercase">
                      SELO BRANCO
                    </span>
                  </div>
                  <span className="text-[9px] text-slate-500 uppercase tracking-widest">Carimbo e Selo Branco</span>
                </div>

                <div className="sm:col-span-4 text-center space-y-1">
                  <p className="text-slate-600 font-semibold uppercase text-[11px]">O Director da Escola</p>
                  <div className="h-14 flex items-end justify-center">
                    <span className="font-serif font-bold text-slate-900 text-xs text-center border-b border-slate-800 w-44 pb-1">
                      {directorName}
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-500">Direcção da Escola</p>
                </div>
              </div>

              {/* Rodapé com QR Code */}
              <div className="mt-8 pt-4 border-t border-slate-200 flex flex-wrap items-center justify-between gap-4 font-sans text-[10px] text-slate-600">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 p-1 bg-white border border-slate-300 rounded flex flex-col items-center justify-center shadow-xs">
                    <svg className="w-full h-full text-slate-900" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M2 2h8v8H2V2zm2 2v4h4V4H4zm10-2h8v8h-8V2zm2 2v4h4V4h-4zM2 14h8v8H2v-8zm2 2v4h4v-4H4zm14 2h2v4h-2v-4zm-4-4h4v2h-4v-2zm4 0h4v2h-4v-2zm-4 4h2v2h-2v-2zm2 2h2v2h-2v-2zM5 5h2v2H5V5zm12 0h2v2h-2V5zM5 17h2v2H5v-2z" />
                    </svg>
                  </div>
                  <div>
                    <div className="flex items-center gap-1 font-bold text-slate-800">
                      <CheckCircle className="h-3 w-3 text-emerald-600" />
                      AUTENTICIDADE VERIFICÁVEL DIGITALMENTE
                    </div>
                    <p className="font-mono text-[9px] font-bold text-slate-700">
                      Código: {validationCode}
                    </p>
                  </div>
                </div>

                <div className="text-right">
                  <p className="font-semibold text-slate-700">EduGestão Moçambique • Matriz Oficial MINEDH</p>
                  <p className="text-slate-500">Documento Oficial de Habilitações</p>
                </div>
              </div>

            </div>
          </div>
        </div>
      )}

    </div>
  );
}
