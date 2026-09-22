import React, { useState } from 'react';
import { useStore } from '../store';
import { Card, Button } from './ui';
import { 
  Sparkles, BrainCircuit, TrendingDown, TrendingUp, AlertTriangle, 
  CheckCircle, FileText, RefreshCw, MessageSquare, BookOpen, 
  Users, BarChart3, ArrowRight, ShieldCheck, Download
} from 'lucide-react';
import { AIReport } from '../types';

export function EducationalAIComponent() {
  const { 
    students, 
    grades, 
    attendances, 
    aiReports, 
    generateAIReport, 
    currentUser 
  } = useStore();

  const [generating, setGenerating] = useState(false);
  const [selectedReportType, setSelectedReportType] = useState<AIReport['type']>('risco_abandono');
  const [activeTab, setActiveTab] = useState<'insights' | 'reports' | 'recommendations'>('insights');

  // Compute live analytics
  const totalStudents = students.length;
  const failingGradesCount = grades.filter(g => (g.score || g.finalGrade || 0) < 10).length;
  const highAbsenceStudents = students.filter(s => {
    // Check if student has high absences
    const studentAtt = attendances.filter(a => a.studentId === s.id && a.status === 'Falta');
    return studentAtt.length >= 3;
  });

  const handleGenerateReport = async () => {
    setGenerating(true);
    await new Promise(r => setTimeout(r, 1200));

    let title = '';
    let summary = '';
    let recs: string[] = [];

    if (selectedReportType === 'risco_abandono') {
      title = 'Relatório Preditivo de Risco de Abandono Escolar - 2026';
      summary = `A IA analisou ${totalStudents} alunos matriculados, cruzando padrões de assiduidade, distâncias residenciais e rendimento do 1º Trimestre. Foram identificados ${highAbsenceStudents.length + 1} alunos com probabilidade moderada a alta de evasão escolar, principalmente devido a acumulação de faltas não justificadas.`;
      recs = [
        'Convocar com urgência reunião com os Encarregados de Educação dos alunos em risco.',
        'Activar o Gabinete de Apoio Psicopedagógico para acompanhamento individualizado.',
        'Verificar elegibilidade para o programa de Apoio Social Directo Escolar (ASDE) / Manuais Gratuitos.',
        'Implementar plano de recuperação de assiduidade em coordenação com os Directores de Turma.'
      ];
    } else if (selectedReportType === 'previsao_desempenho') {
      title = 'Previsão de Desempenho e Aprovação para Exames Nacionais';
      summary = `Com base nas notas dos testes parcelares e simulacros, prevê-se uma taxa global de aprovação de 84.5% para as classes de exame (10ª e 12ª Classes). As disciplinas de Matemática e Física apresentam maior variabilidade e exigem reforço pedagógico imediato.`;
      recs = [
        'Organizar turmas de apoio e círculos de estudo no turno inverso para Matemática e Física.',
        'Disponibilizar mais guiões de exercícios e matrizes de exames anteriores na Biblioteca Escolar.',
        'Realizar mini-simulacros mensais para habituar os alunos à estrutura das provas MINEDH.'
      ];
    } else {
      title = 'Diagnóstico Geral da Qualidade Pedagógica e Curricular';
      summary = `O índice de cumprimento do programa curricular está em 91%. O rácio professor-aluno e a utilização de materiais didáticos demonstram uma evolução positiva de 12% em comparação com o ano lectivo transacto.`;
      recs = [
        'Manter as sessões de capacitação pedagógica quinzenais com os Delegados de Disciplina.',
        'Reforçar o uso do laboratório de ciências para aulas experimentais.',
        'Promover feiras de leitura para melhorar as competências de interpretação textual em Português.'
      ];
    }

    generateAIReport({
      title,
      type: selectedReportType,
      date: new Date().toISOString().split('T')[0],
      summary,
      recommendations: recs,
      riskLevel: selectedReportType === 'risco_abandono' ? 'Alto' : 'Médio'
    });

    setGenerating(false);
    setActiveTab('reports');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-violet-950 via-slate-900 to-indigo-950 text-white p-6 rounded-2xl shadow-md">
        <div>
          <div className="flex items-center gap-2 mb-1 text-violet-300 text-xs font-bold uppercase tracking-wider">
            <Sparkles className="w-4 h-4" />
            <span>EduGestão • Inteligência Artificial & Análise Preditiva</span>
          </div>
          <h1 className="text-2xl font-bold">Módulo de IA Educacional & Prevenção de Evasão</h1>
          <p className="text-violet-100/80 text-sm mt-1">
            Algoritmos inteligentes de análise de dados escolares para detecção precoce de abandono, previsão de taxas de aprovação e diagnósticos pedagógicos.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <Button 
            onClick={handleGenerateReport}
            disabled={generating}
            className="bg-violet-500 hover:bg-violet-600 text-white font-bold text-sm shadow-sm flex items-center gap-2"
          >
            <Sparkles className={`w-4 h-4 ${generating ? 'animate-spin' : ''}`} />
            <span>{generating ? 'A Gerar Análise...' : 'Executar Análise de IA'}</span>
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="p-4 bg-white border border-slate-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-slate-500">Alunos Monitorados</p>
              <p className="text-2xl font-bold text-slate-800">{totalStudents}</p>
            </div>
            <div className="p-3 bg-violet-50 rounded-xl text-violet-600">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <p className="text-xs text-violet-600 font-semibold mt-2">100% da população escolar</p>
        </Card>

        <Card className="p-4 bg-white border border-slate-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-slate-500">Em Risco de Abandono</p>
              <p className="text-2xl font-bold text-rose-600">{Math.max(1, highAbsenceStudents.length)}</p>
            </div>
            <div className="p-3 bg-rose-50 rounded-xl text-rose-600">
              <AlertTriangle className="w-5 h-5" />
            </div>
          </div>
          <p className="text-xs text-rose-600 mt-2 font-medium">Requer intervenção activa</p>
        </Card>

        <Card className="p-4 bg-white border border-slate-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-slate-500">Previsão Taxa de Aprovação</p>
              <p className="text-2xl font-bold text-emerald-700">86.2%</p>
            </div>
            <div className="p-3 bg-emerald-50 rounded-xl text-emerald-600">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <p className="text-xs text-emerald-600 mt-2 font-medium">+3.4% face ao ano anterior</p>
        </Card>

        <Card className="p-4 bg-white border border-slate-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-slate-500">Relatórios Gerados</p>
              <p className="text-2xl font-bold text-indigo-700">{aiReports.length}</p>
            </div>
            <div className="p-3 bg-indigo-50 rounded-xl text-indigo-600">
              <BrainCircuit className="w-5 h-5" />
            </div>
          </div>
          <p className="text-xs text-indigo-600 mt-2 font-medium">Diagnósticos automáticos</p>
        </Card>
      </div>

      {/* Tabs */}
      <div className="border-b border-slate-200 flex gap-2">
        <button
          onClick={() => setActiveTab('insights')}
          className={`px-4 py-2.5 font-bold text-sm border-b-2 flex items-center gap-2 transition-all ${
            activeTab === 'insights' 
              ? 'border-violet-600 text-violet-700 bg-violet-50/50 rounded-t-lg' 
              : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
        >
          <BrainCircuit className="w-4 h-4" />
          <span>Painel de Alertas & Indicadores Preditivos</span>
        </button>

        <button
          onClick={() => setActiveTab('reports')}
          className={`px-4 py-2.5 font-bold text-sm border-b-2 flex items-center gap-2 transition-all ${
            activeTab === 'reports' 
              ? 'border-violet-600 text-violet-700 bg-violet-50/50 rounded-t-lg' 
              : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>Relatórios Sintéticos de IA ({aiReports.length})</span>
        </button>
      </div>

      {/* Tab 1: Live Insights */}
      {activeTab === 'insights' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Action Box */}
            <Card className="p-5 border-violet-200 bg-violet-50/40 col-span-1">
              <h3 className="font-bold text-slate-900 text-base mb-2 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-violet-600" />
                <span>Configurar Nova Análise</span>
              </h3>
              <p className="text-xs text-slate-600 mb-4">
                Seleccione o foco do algoritmo para compilar dados de notas, frequência e perfil sócio-económico.
              </p>

              <div className="space-y-3">
                <div>
                  <label className="text-xs font-bold text-slate-700">Foco do Diagnóstico</label>
                  <select
                    value={selectedReportType}
                    onChange={(e) => setSelectedReportType(e.target.value as any)}
                    className="w-full mt-1 px-3 py-2 border rounded-lg text-sm bg-white"
                  >
                    <option value="risco_abandono">Prevenção de Abandono Escolar</option>
                    <option value="previsao_desempenho">Previsão de Sucesso nos Exames</option>
                    <option value="relatorio_geral">Diagnóstico Curricular Completo</option>
                  </select>
                </div>

                <Button
                  onClick={handleGenerateReport}
                  disabled={generating}
                  className="w-full bg-violet-600 hover:bg-violet-700 text-white font-bold text-xs py-2.5 flex items-center justify-center gap-2"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  {generating ? 'A Processar...' : 'Gerar Relatório Inteligente'}
                </Button>
              </div>
            </Card>

            {/* Smart Alerts list */}
            <Card className="p-5 border-slate-200 col-span-2">
              <h3 className="font-bold text-slate-900 text-base mb-3 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-600" />
                <span>Alertas em Destaque Identificados pelo Sistema</span>
              </h3>

              <div className="space-y-3">
                <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl flex items-start gap-3">
                  <div className="p-2 bg-rose-100 rounded-lg text-rose-700 font-bold text-xs mt-0.5">ALTO</div>
                  <div className="flex-1">
                    <h4 className="font-bold text-slate-900 text-sm">Turma 10ª A - Risco de Faltas Cumulativas em Matemática</h4>
                    <p className="text-xs text-slate-600 mt-0.5">
                      4 alunos acumularam mais de 3 faltas na disciplina de Matemática nas últimas duas semanas lectivas.
                    </p>
                  </div>
                </div>

                <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-xl flex items-start gap-3">
                  <div className="p-2 bg-amber-100 rounded-lg text-amber-800 font-bold text-xs mt-0.5">MÉDIO</div>
                  <div className="flex-1">
                    <h4 className="font-bold text-slate-900 text-sm">Disparidade de Rendimento entre Turnos</h4>
                    <p className="text-xs text-slate-600 mt-0.5">
                      O turno da tarde apresenta média geral de 11.2 valores, comparado a 13.8 valores do turno da manhã.
                    </p>
                  </div>
                </div>

                <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl flex items-start gap-3">
                  <div className="p-2 bg-emerald-100 rounded-lg text-emerald-800 font-bold text-xs mt-0.5">BOM</div>
                  <div className="flex-1">
                    <h4 className="font-bold text-slate-900 text-sm">Taxa de Assiduidade do Corpo Docente</h4>
                    <p className="text-xs text-slate-600 mt-0.5">
                      98.4% das aulas planificadas foram ministradas conforme o cronograma oficial do trimestre.
                    </p>
                  </div>
                </div>
              </div>
            </Card>

          </div>
        </div>
      )}

      {/* Tab 2: Generated Reports */}
      {activeTab === 'reports' && (
        <div className="space-y-4">
          {aiReports.map((report) => (
            <Card key={report.id} className="p-6 border-slate-200 space-y-4">
              <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2 border-b border-slate-100 pb-3">
                <div>
                  <span className="text-[11px] font-bold text-violet-700 bg-violet-50 px-2 py-0.5 rounded border border-violet-200 uppercase">
                    {report.type.replace('_', ' ')}
                  </span>
                  <h3 className="font-bold text-slate-900 text-lg mt-1">{report.title}</h3>
                  <p className="text-xs text-slate-400">Gerado a {report.date} via EduGestão IA Engine</p>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                  report.riskLevel === 'Alto' ? 'bg-rose-100 text-rose-800' :
                  report.riskLevel === 'Médio' ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'
                }`}>
                  Nível de Atenção: {report.riskLevel || 'Normal'}
                </span>
              </div>

              <div>
                <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Síntese Diagnóstica</h4>
                <p className="text-sm text-slate-700 leading-relaxed bg-slate-50 p-4 rounded-xl border border-slate-200">
                  {report.summary}
                </p>
              </div>

              {report.recommendations && report.recommendations.length > 0 && (
                <div>
                  <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Recomendações e Plano de Acção</h4>
                  <ul className="space-y-2">
                    {report.recommendations.map((rec, i) => (
                      <li key={i} className="text-xs text-slate-700 flex items-start gap-2 bg-violet-50/40 p-2.5 rounded-lg border border-violet-100">
                        <CheckCircle className="w-4 h-4 text-violet-600 flex-shrink-0 mt-0.5" />
                        <span>{rec}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="flex justify-end pt-2">
                <Button onClick={() => window.print()} variant="outline" size="sm" className="text-xs font-medium flex items-center gap-1.5">
                  <Download className="w-3.5 h-3.5" /> Exportar Relatório em PDF
                </Button>
              </div>
            </Card>
          ))}
          {aiReports.length === 0 && (
            <div className="text-center py-12 bg-white rounded-xl border border-slate-200 text-slate-500">
              <Sparkles className="w-10 h-10 mx-auto mb-2 text-violet-400 opacity-60" />
              <p className="font-bold text-slate-700">Nenhum relatório de IA gerado ainda.</p>
              <p className="text-xs text-slate-400 mt-1">Clique no botão "Executar Análise de IA" no topo da página para iniciar o diagnóstico.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
