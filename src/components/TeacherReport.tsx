import React, { useState } from 'react';
import { useStore } from '../store';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { Printer, Download, ArrowLeft, Save, CheckCircle2, Plus, Trash2 } from 'lucide-react';
import { SignatureBox } from './SignatureBox';

export const MOZAMBIQUE_LOGO_URL = "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQua66hW5lOO75LXVLwiJWQJKtgoRJzX58EUSAAc2QdYQ&s=10";

export const MozambiqueEmblem: React.FC<{ className?: string }> = ({ className = "h-16 w-16" }) => (
  <img 
    src={MOZAMBIQUE_LOGO_URL} 
    alt="Emblema da República de Moçambique" 
    className={`${className} object-contain mx-auto`}
    referrerPolicy="no-referrer"
  />
);

export function TeacherReport() {
  const { currentUser, schools, classes, subjects } = useStore();
  const school = schools.find(s => s.id === currentUser?.schoolId);

  // Form state
  const [formData, setFormData] = useState({
    disciplina: subjects[0]?.name || 'Matemática',
    classe: '10ª Classe',
    turma: classes[0]?.name || 'Turma A',
    trimestre: '1º Trimestre',
    anoLectivo: String(new Date().getFullYear()),
    dataElaboracao: new Date().toISOString().split('T')[0],
    introducao: 'O presente relatório tem por objectivo apresentar as actividades pedagógicas desenvolvidas durante o trimestre, evidenciando os conteúdos leccionados, o desempenho dos alunos, as estratégias adoptadas, os desafios encontrados e as recomendações para a melhoria contínua do processo de ensino e aprendizagem.',
    
    // Actividades
    actividades: [
      { actividade: 'Planificação de aulas', prevista: 'Sim', realizada: 'Sim', obs: 'Cumprido no prazo' },
      { actividade: 'Lecção de conteúdos', prevista: 'Sim', realizada: 'Sim', obs: '95% do programa leccionado' },
      { actividade: 'Avaliações contínuas', prevista: 'Sim', realizada: 'Sim', obs: '3 ACS realizadas' },
      { actividade: 'Apoio pedagógico', prevista: 'Sim', realizada: 'Sim', obs: 'Aulas de reforço aos sábados' },
      { actividade: 'Reuniões pedagógicas', prevista: 'Sim', realizada: 'Sim', obs: 'Participação ativa' },
    ],

    // Conteúdos
    conteudos: [
      { unidade: 'Unidade 1', conteudo: 'Números Reais e Funções', estado: 'Concluído' },
      { unidade: 'Unidade 2', conteudo: 'Trigonometria no Triângulo Retângulo', estado: 'Concluído' },
      { unidade: 'Unidade 3', conteudo: 'Estatística Descritiva', estado: 'Em curso' },
      { unidade: 'Unidade 4', conteudo: 'Geometria Analítica', estado: 'Por iniciar' },
    ],

    // Estatísticas
    totalAlunos: '42',
    alunosAvaliados: '40',
    alunosAprovados: '32',
    alunosReprovados: '8',
    alunosDesistentes: '2',
    analiseDesempenho: 'O desempenho geral dos alunos foi satisfatório, com destaque positivo para a unidade de Trigonometria. Notou-se alguma dificuldade na resolução de problemas práticos de Estatística, superada através de sessões de apoio suplementar.',

    metodologias: 'Método expositivo interactivo, trabalho em grupo, resolução de fichas de exercícios práticos e debates orientados em sala de aula.',
    dificuldades: 'Insuficiência temporária de manuais escolares para todos os alunos e necessidade de maior recurso a laboratórios de informática.',
    recomendacoes: 'Reforço na aquisição de material didáctico de apoio e continuidade das aulas de recuperação quinzenais para alunos com notas inferiores a 10 valores.',
    conclusao: 'Em suma, o trimestre decorreu com normalidade e cumprimento rigoroso do plano curricular estabelecido pelo MINEDH.',
  });

  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleActivityChange = (index: number, field: string, value: string) => {
    const updated = [...formData.actividades];
    updated[index] = { ...updated[index], [field]: value };
    setFormData(prev => ({ ...prev, actividades: updated }));
  };

  const handleContentChange = (index: number, field: string, value: string) => {
    const updated = [...formData.conteudos];
    updated[index] = { ...updated[index], [field]: value };
    setFormData(prev => ({ ...prev, conteudos: updated }));
  };

  const handleAddContentRow = () => {
    setFormData(prev => ({
      ...prev,
      conteudos: [
        ...prev.conteudos,
        { unidade: `Unidade ${prev.conteudos.length + 1}`, conteudo: '', estado: 'Por iniciar' }
      ]
    }));
  };

  const handleRemoveContentRow = (index: number) => {
    if (formData.conteudos.length <= 1) return;
    setFormData(prev => ({
      ...prev,
      conteudos: prev.conteudos.filter((_, i) => i !== index)
    }));
  };

  const printReport = () => window.print();

  const exportPDF = async () => {
    const input = document.getElementById('report-content');
    if (!input) return;

    const canvas = await html2canvas(input, { scale: 2 });
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF('p', 'mm', 'a4');
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
    
    pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
    pdf.save(`Relatorio_Trimestral_${formData.disciplina}_${formData.turma}.pdf`);
  };

  const handleSaveDraft = (e: React.FormEvent) => {
    e.preventDefault();
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  const taxaAproveitamento = formData.alunosAvaliados && Number(formData.alunosAvaliados) > 0
    ? ((Number(formData.alunosAprovados) / Number(formData.alunosAvaliados)) * 100).toFixed(1)
    : '0.0';

  return (
    <div className="min-h-screen bg-slate-100 py-8 px-4 text-slate-900">
      {/* Top Action Bar */}
      <div className="max-w-4xl mx-auto mb-6 flex flex-wrap justify-between items-center gap-4 bg-white p-4 rounded-2xl border border-slate-200 shadow-sm no-print">
        <button 
          onClick={() => window.history.back()} 
          className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-4 py-2 rounded-xl font-bold flex items-center gap-2 text-sm transition-all"
        >
          <ArrowLeft size={16} /> Voltar
        </button>

        <div className="flex items-center gap-3">
          {savedSuccess && (
            <span className="text-emerald-700 text-xs font-bold flex items-center gap-1 bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-200 animate-pulse">
              <CheckCircle2 size={14} /> Rascunho guardado!
            </span>
          )}
          <button 
            onClick={handleSaveDraft}
            className="bg-blue-900 hover:bg-blue-800 text-white px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 shadow transition-all"
          >
            <Save size={16} /> Guardar Rascunho
          </button>
          <button 
            onClick={printReport} 
            className="bg-slate-800 hover:bg-slate-900 text-white px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 transition-all"
          >
            <Printer size={16} /> Imprimir
          </button>
          <button 
            onClick={exportPDF} 
            className="bg-emerald-700 hover:bg-emerald-800 text-white px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 transition-all"
          >
            <Download size={16} /> Exportar PDF
          </button>
        </div>
      </div>

      {/* Report Form / Printable Sheet */}
      <div id="report-content" className="max-w-4xl mx-auto bg-white p-8 md:p-12 rounded-3xl border border-slate-200 shadow-lg space-y-8">
        
        {/* Official Institution Header */}
        <div className="text-center font-sans border-b-2 border-slate-900 pb-6">
          <div className="flex justify-center mb-2">
            <MozambiqueEmblem className="h-16 w-16" />
          </div>
          <h2 className="text-sm font-black uppercase tracking-wider text-black">
            REPÚBLICA DE MOÇAMBIQUE
          </h2>
          <h3 className="text-xs font-bold uppercase tracking-wide text-black mt-0.5">
            MINISTÉRIO DA EDUCAÇÃO E DESENVOLVIMENTO HUMANO
          </h3>
          <h4 className="text-xs font-bold text-black mt-1">
            {school?.province ? (school.province.startsWith('Província') ? school.province : `Província de ${school.province}`) : 'Província de Maputo'}
          </h4>
          <h4 className="text-xs font-bold text-black mt-0.5">
            Direcção Distrital de Educação da {school?.province ? (school.province.startsWith('Província') ? school.province : `Província de ${school.province}`) : 'Província de Maputo'}
          </h4>
          <h4 className="text-xs font-bold text-black mt-0.5">
            {school?.name || 'Escola Secundária Central de Maputo'}
          </h4>
          
          <h1 className="text-xl font-black uppercase tracking-tight text-black mt-4 font-serif">
            RELATÓRIO TRIMESTRAL DE ACTIVIDADES DOCENTES
          </h1>
        </div>

        {/* 1. IDENTIFICAÇÃO */}
        <section className="space-y-3">
          <h3 className="text-sm font-black text-slate-900 bg-slate-100 px-3 py-1.5 rounded-lg border-l-4 border-blue-900 uppercase">
            1. Identificação
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm pt-2">
            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1">Nome do Docente:</label>
              <input 
                type="text" 
                value={currentUser?.name || 'Docente'} 
                readOnly 
                className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 font-semibold text-slate-800"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1">Escola / Instituição:</label>
              <input 
                type="text" 
                value={school?.name || 'Escola Secundária Central'} 
                readOnly 
                className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 font-semibold text-slate-800"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1">Disciplina:</label>
              <input 
                type="text" 
                value={formData.disciplina} 
                onChange={e => handleChange('disciplina', e.target.value)}
                className="w-full bg-white border border-slate-300 rounded-lg p-2 font-semibold text-slate-800 focus:border-blue-700"
              />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">Classe:</label>
                <input 
                  type="text" 
                  value={formData.classe} 
                  onChange={e => handleChange('classe', e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-lg p-2 font-semibold text-slate-800"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">Turma:</label>
                <input 
                  type="text" 
                  value={formData.turma} 
                  onChange={e => handleChange('turma', e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-lg p-2 font-semibold text-slate-800"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1">Período de Referência:</label>
              <select 
                value={formData.trimestre} 
                onChange={e => handleChange('trimestre', e.target.value)}
                className="w-full bg-white border border-slate-300 rounded-lg p-2 font-semibold text-slate-800"
              >
                <option value="1º Trimestre">1º Trimestre</option>
                <option value="2º Trimestre">2º Trimestre</option>
                <option value="3º Trimestre">3º Trimestre</option>
              </select>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">Ano Lectivo:</label>
                <input 
                  type="text" 
                  value={formData.anoLectivo} 
                  onChange={e => handleChange('anoLectivo', e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-lg p-2 font-semibold text-slate-800"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">Data:</label>
                <input 
                  type="date" 
                  value={formData.dataElaboracao} 
                  onChange={e => handleChange('dataElaboracao', e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-lg p-2 font-semibold text-slate-800"
                />
              </div>
            </div>
          </div>
        </section>

        {/* 2. INTRODUÇÃO */}
        <section className="space-y-2">
          <h3 className="text-sm font-black text-slate-900 bg-slate-100 px-3 py-1.5 rounded-lg border-l-4 border-blue-900 uppercase">
            2. Introdução
          </h3>
          <textarea 
            rows={3}
            value={formData.introducao}
            onChange={e => handleChange('introducao', e.target.value)}
            className="w-full bg-white border border-slate-300 rounded-xl p-3 text-sm text-slate-800 font-medium leading-relaxed focus:border-blue-700"
          />
        </section>

        {/* 3. PLANO DE ACTIVIDADES */}
        <section className="space-y-3">
          <h3 className="text-sm font-black text-slate-900 bg-slate-100 px-3 py-1.5 rounded-lg border-l-4 border-blue-900 uppercase">
            3. Plano de Actividades Realizadas
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm border-collapse border border-slate-300">
              <thead>
                <tr className="bg-slate-50 text-slate-700 text-left">
                  <th className="border border-slate-300 p-2.5">Actividade</th>
                  <th className="border border-slate-300 p-2.5 w-28">Prevista</th>
                  <th className="border border-slate-300 p-2.5 w-28">Realizada</th>
                  <th className="border border-slate-300 p-2.5">Observações</th>
                </tr>
              </thead>
              <tbody>
                {formData.actividades.map((act, idx) => (
                  <tr key={idx}>
                    <td className="border border-slate-300 p-2">
                      <input 
                        type="text" 
                        value={act.actividade} 
                        onChange={e => handleActivityChange(idx, 'actividade', e.target.value)}
                        className="w-full bg-transparent font-medium"
                      />
                    </td>
                    <td className="border border-slate-300 p-2">
                      <select 
                        value={act.prevista} 
                        onChange={e => handleActivityChange(idx, 'prevista', e.target.value)}
                        className="w-full bg-white border border-slate-200 rounded p-1 text-xs"
                      >
                        <option value="Sim">Sim</option>
                        <option value="Não">Não</option>
                      </select>
                    </td>
                    <td className="border border-slate-300 p-2">
                      <select 
                        value={act.realizada} 
                        onChange={e => handleActivityChange(idx, 'realizada', e.target.value)}
                        className="w-full bg-white border border-slate-200 rounded p-1 text-xs"
                      >
                        <option value="Sim">Sim</option>
                        <option value="Parcial">Parcial</option>
                        <option value="Não">Não</option>
                      </select>
                    </td>
                    <td className="border border-slate-300 p-2">
                      <input 
                        type="text" 
                        value={act.obs} 
                        onChange={e => handleActivityChange(idx, 'obs', e.target.value)}
                        className="w-full bg-transparent text-xs"
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* 4. CONTEÚDOS LECCIONADOS */}
        <section className="space-y-3">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 bg-slate-100 px-3 py-2 rounded-lg border-l-4 border-blue-900">
            <h3 className="text-sm font-black text-slate-900 uppercase">
              4. Conteúdos Leccionados
            </h3>
            <button
              type="button"
              onClick={handleAddContentRow}
              className="no-print text-xs font-bold bg-blue-900 hover:bg-blue-800 text-white px-3 py-1.5 rounded-lg flex items-center gap-1.5 shadow-sm transition-all"
            >
              <Plus size={14} /> Adicionar Unidade Temática
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm border-collapse border border-slate-300">
              <thead>
                <tr className="bg-slate-50 text-slate-700 text-left">
                  <th className="border border-slate-300 p-2.5 w-40">Unidade Temática</th>
                  <th className="border border-slate-300 p-2.5">Conteúdo / Matéria</th>
                  <th className="border border-slate-300 p-2.5 w-36">Estado</th>
                  <th className="border border-slate-300 p-2.5 w-12 no-print text-center">Acção</th>
                </tr>
              </thead>
              <tbody>
                {formData.conteudos.map((cont, idx) => (
                  <tr key={idx}>
                    <td className="border border-slate-300 p-2 font-semibold">
                      <input 
                        type="text" 
                        value={cont.unidade} 
                        onChange={e => handleContentChange(idx, 'unidade', e.target.value)}
                        className="w-full bg-transparent p-1 border border-transparent hover:border-slate-300 focus:border-blue-500 rounded text-xs"
                      />
                    </td>
                    <td className="border border-slate-300 p-2">
                      <input 
                        type="text" 
                        value={cont.conteudo} 
                        onChange={e => handleContentChange(idx, 'conteudo', e.target.value)}
                        className="w-full bg-transparent font-medium p-1 border border-transparent hover:border-slate-300 focus:border-blue-500 rounded text-xs"
                        placeholder="Insira o conteúdo leccionado..."
                      />
                    </td>
                    <td className="border border-slate-300 p-2">
                      <select 
                        value={cont.estado} 
                        onChange={e => handleContentChange(idx, 'estado', e.target.value)}
                        className="w-full bg-white border border-slate-200 rounded p-1 text-xs"
                      >
                        <option value="Concluído">Concluído</option>
                        <option value="Em curso">Em curso</option>
                        <option value="Por iniciar">Por iniciar</option>
                      </select>
                    </td>
                    <td className="border border-slate-300 p-2 text-center no-print">
                      <button
                        type="button"
                        onClick={() => handleRemoveContentRow(idx)}
                        disabled={formData.conteudos.length <= 1}
                        title="Remover Unidade"
                        className="text-red-500 hover:text-red-700 disabled:opacity-30 disabled:hover:text-red-500 p-1 rounded transition-all"
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* 5. DESEMPENHO DOS ALUNOS */}
        <section className="space-y-3">
          <h3 className="text-sm font-black text-slate-900 bg-slate-100 px-3 py-1.5 rounded-lg border-l-4 border-blue-900 uppercase">
            5. Desempenho dos Alunos & Estatísticas
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-center">
              <label className="block text-[11px] font-bold text-slate-500 uppercase">Total Alunos</label>
              <input 
                type="number" 
                value={formData.totalAlunos} 
                onChange={e => handleChange('totalAlunos', e.target.value)}
                className="w-full text-center font-black text-lg bg-white border border-slate-300 rounded-lg p-1 mt-1"
              />
            </div>
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-center">
              <label className="block text-[11px] font-bold text-slate-500 uppercase">Avaliados</label>
              <input 
                type="number" 
                value={formData.alunosAvaliados} 
                onChange={e => handleChange('alunosAvaliados', e.target.value)}
                className="w-full text-center font-black text-lg bg-white border border-slate-300 rounded-lg p-1 mt-1"
              />
            </div>
            <div className="bg-emerald-50 p-3 rounded-xl border border-emerald-200 text-center">
              <label className="block text-[11px] font-bold text-emerald-700 uppercase">Aprovados</label>
              <input 
                type="number" 
                value={formData.alunosAprovados} 
                onChange={e => handleChange('alunosAprovados', e.target.value)}
                className="w-full text-center font-black text-lg bg-white border border-emerald-300 rounded-lg p-1 mt-1 text-emerald-900"
              />
            </div>
            <div className="bg-red-50 p-3 rounded-xl border border-red-200 text-center">
              <label className="block text-[11px] font-bold text-red-700 uppercase">Reprovados</label>
              <input 
                type="number" 
                value={formData.alunosReprovados} 
                onChange={e => handleChange('alunosReprovados', e.target.value)}
                className="w-full text-center font-black text-lg bg-white border border-red-300 rounded-lg p-1 mt-1 text-red-900"
              />
            </div>
            <div className="bg-amber-50 p-3 rounded-xl border border-amber-200 text-center col-span-2 md:col-span-1">
              <label className="block text-[11px] font-bold text-amber-700 uppercase">Desistentes</label>
              <input 
                type="number" 
                value={formData.alunosDesistentes} 
                onChange={e => handleChange('alunosDesistentes', e.target.value)}
                className="w-full text-center font-black text-lg bg-white border border-amber-300 rounded-lg p-1 mt-1 text-amber-900"
              />
            </div>
          </div>
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 flex justify-between items-center text-sm font-bold text-blue-900">
            <span>Taxa de Aproveitamento Pedagógico:</span>
            <span className="text-lg font-black bg-white px-3 py-1 rounded-lg border border-blue-300">{taxaAproveitamento}%</span>
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Análise Qualitativa do Desempenho:</label>
            <textarea 
              rows={3}
              value={formData.analiseDesempenho}
              onChange={e => handleChange('analiseDesempenho', e.target.value)}
              className="w-full bg-white border border-slate-300 rounded-xl p-3 text-sm text-slate-800 font-medium leading-relaxed"
            />
          </div>
        </section>

        {/* 6, 7, 8, 9, 10 SECTIONS */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <section className="space-y-2">
            <h3 className="text-sm font-black text-slate-900 bg-slate-100 px-3 py-1.5 rounded-lg border-l-4 border-blue-900 uppercase">
              6. Metodologias Utilizadas
            </h3>
            <textarea 
              rows={3}
              value={formData.metodologias}
              onChange={e => handleChange('metodologias', e.target.value)}
              className="w-full bg-white border border-slate-300 rounded-xl p-3 text-xs text-slate-800 font-medium"
            />
          </section>

          <section className="space-y-2">
            <h3 className="text-sm font-black text-slate-900 bg-slate-100 px-3 py-1.5 rounded-lg border-l-4 border-blue-900 uppercase">
              7. Dificuldades Encontradas
            </h3>
            <textarea 
              rows={3}
              value={formData.dificuldades}
              onChange={e => handleChange('dificuldades', e.target.value)}
              className="w-full bg-white border border-slate-300 rounded-xl p-3 text-xs text-slate-800 font-medium"
            />
          </section>
        </div>

        <section className="space-y-2">
          <h3 className="text-sm font-black text-slate-900 bg-slate-100 px-3 py-1.5 rounded-lg border-l-4 border-blue-900 uppercase">
            8 & 9. Medidas de Melhoria & Recomendações
          </h3>
          <textarea 
            rows={2}
            value={formData.recomendacoes}
            onChange={e => handleChange('recomendacoes', e.target.value)}
            className="w-full bg-white border border-slate-300 rounded-xl p-3 text-xs text-slate-800 font-medium"
          />
        </section>

        <section className="space-y-2">
          <h3 className="text-sm font-black text-slate-900 bg-slate-100 px-3 py-1.5 rounded-lg border-l-4 border-blue-900 uppercase">
            10. Conclusão
          </h3>
          <textarea 
            rows={2}
            value={formData.conclusao}
            onChange={e => handleChange('conclusao', e.target.value)}
            className="w-full bg-white border border-slate-300 rounded-xl p-3 text-xs text-slate-800 font-medium"
          />
        </section>

        {/* Signatures */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-8 border-t border-slate-300 text-center text-xs font-bold text-slate-700">
          <SignatureBox label="O Docente / Professor" />
          <SignatureBox label="Visto do Director Pedagógico" />
          <SignatureBox label="Visto do Director da Escola" />
        </section>

      </div>
    </div>
  );
}
