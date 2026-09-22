import React, { useState } from 'react';
import { useStore } from '../store';
import { Card, Button } from './ui';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
  Cell,
} from 'recharts';
import { BarChart2, Award, Printer, FileText } from 'lucide-react';

export const AcademicPerformanceChart: React.FC = () => {
  const { classes, subjects, grades, students } = useStore();
  const [viewMode, setViewMode] = useState<'class' | 'subject' | 'distribution'>('class');
  const [selectedTrimester, setSelectedTrimester] = useState<number>(1);

  // Calculate data by Class
  const classData = classes.map((cls) => {
    const classStudents = students.filter((s) => s.classId === cls.id);
    let totalScore = 0;
    let count = 0;
    let approvedCount = 0;

    classStudents.forEach((student) => {
      const studentGrades = grades.filter(
        (g) => g.studentId === student.id && g.trimester === selectedTrimester
      );
      if (studentGrades.length > 0) {
        const studentAvg =
          studentGrades.reduce((sum, g) => sum + (g.media || 0), 0) / studentGrades.length;
        totalScore += studentAvg;
        count++;
        if (studentAvg >= 9.5) approvedCount++;
      }
    });

    const avgScore = count > 0 ? Number((totalScore / count).toFixed(1)) : 0;
    const approvalRate = count > 0 ? Math.round((approvedCount / count) * 100) : 0;

    return {
      name: cls.name,
      gradeLevel: cls.gradeLevel,
      media: avgScore,
      aproveitamento: approvalRate,
      alunos: classStudents.length,
    };
  });

  // Calculate data by Subject
  const subjectData = subjects.map((sub) => {
    const subGrades = grades.filter(
      (g) => g.subjectId === sub.id && g.trimester === selectedTrimester
    );
    let totalScore = 0;
    let count = subGrades.length;
    let approvedCount = 0;

    subGrades.forEach((g) => {
      const m = g.media || 0;
      totalScore += m;
      if (m >= 9.5) approvedCount++;
    });

    const avgScore = count > 0 ? Number((totalScore / count).toFixed(1)) : 0;
    const approvalRate = count > 0 ? Math.round((approvedCount / count) * 100) : 0;

    return {
      name: sub.name,
      media: avgScore,
      aproveitamento: approvalRate,
      avaliados: count,
    };
  });

  // Calculate overall distribution
  let dispensados = 0;
  let aprovados = 0;
  let reprovados = 0;

  students.forEach((student) => {
    const studentGrades = grades.filter(
      (g) => g.studentId === student.id && g.trimester === selectedTrimester
    );
    if (studentGrades.length > 0) {
      const avg =
        studentGrades.reduce((sum, g) => sum + (g.media || 0), 0) / studentGrades.length;
      if (avg >= 14) dispensados++;
      else if (avg >= 9.5) aprovados++;
      else reprovados++;
    } else {
      reprovados++;
    }
  });

  const distributionData = [
    { name: 'Dispensados (14-20)', value: dispensados, color: '#10b981' },
    { name: 'Aprovados (10-13)', value: aprovados, color: '#2563eb' },
    { name: 'Reprovados (<10)', value: reprovados, color: '#ef4444' },
  ];

  return (
    <div className="space-y-6">
      {/* Header controls (hidden in print) */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm print:hidden">
        <div>
          <h3 className="text-lg font-black text-slate-900 tracking-tight flex items-center gap-2">
            <BarChart2 className="text-blue-600" size={20} />
            Painel Analítico de Aproveitamento Escolar & Exportação PDF
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Métricas de desempenho académico e listas de alunos prontas para exportação em PDF.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Trimestre filter */}
          <div className="flex items-center bg-slate-100 p-1 rounded-xl">
            {[1, 2, 3].map((trim) => (
              <button
                key={trim}
                onClick={() => setSelectedTrimester(trim as any)}
                className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
                  selectedTrimester === trim
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {trim}º Trimestre
              </button>
            ))}
          </div>

          {/* View mode switcher */}
          <div className="flex items-center bg-slate-100 p-1 rounded-xl">
            <button
              onClick={() => setViewMode('class')}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
                viewMode === 'class'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Por Turma
            </button>
            <button
              onClick={() => setViewMode('subject')}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
                viewMode === 'subject'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Por Disciplina
            </button>
            <button
              onClick={() => setViewMode('distribution')}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
                viewMode === 'distribution'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Distribuição
            </button>
          </div>

          {/* Export PDF Button */}
          <Button
            onClick={() => window.print()}
            className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold gap-2 text-xs py-2 px-4 rounded-xl shadow-md"
          >
            <Printer size={16} />
            Exportar PDF / Imprimir
          </Button>
        </div>
      </div>

      {/* Main Chart Area (hidden in print) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 print:hidden">
        <Card className="lg:col-span-2 p-6 bg-white border border-slate-200 rounded-2xl shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h4 className="text-sm font-black text-slate-800 uppercase tracking-wider">
              {viewMode === 'class'
                ? 'Média de Notas e Aproveitamento por Turma'
                : viewMode === 'subject'
                ? 'Desempenho Médio por Disciplina'
                : 'Distribuição Geral de Notas'}
            </h4>
            <span className="text-xs font-bold bg-blue-50 text-blue-700 px-3 py-1 rounded-full">
              {selectedTrimester}º Trimestre 2026
            </span>
          </div>

          <div className="h-80 w-full">
            {viewMode === 'class' && (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={classData} margin={{ top: 10, right: 30, left: 0, bottom: 25 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis
                    dataKey="name"
                    tick={{ fontSize: 11, fill: '#64748b' }}
                    interval={0}
                    angle={-20}
                    textAnchor="end"
                  />
                  <YAxis domain={[0, 20]} tick={{ fontSize: 11, fill: '#64748b' }} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                  />
                  <Legend />
                  <Bar dataKey="media" name="Média (0-20)" fill="#2563eb" radius={[6, 6, 0, 0]} />
                  <Bar dataKey="aproveitamento" name="Taxa Aprov. (%)" fill="#10b981" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}

            {viewMode === 'subject' && (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={subjectData} margin={{ top: 10, right: 30, left: 0, bottom: 25 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis
                    dataKey="name"
                    tick={{ fontSize: 10, fill: '#64748b' }}
                    interval={0}
                    angle={-25}
                    textAnchor="end"
                  />
                  <YAxis domain={[0, 20]} tick={{ fontSize: 11, fill: '#64748b' }} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                  />
                  <Legend />
                  <Bar dataKey="media" name="Média da Disciplina" fill="#8b5cf6" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}

            {viewMode === 'distribution' && (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={distributionData} margin={{ top: 10, right: 30, left: 0, bottom: 10 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#64748b' }} />
                  <YAxis tick={{ fontSize: 11, fill: '#64748b' }} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                  />
                  <Bar dataKey="value" name="Nº de Alunos" fill="#06b6d4" radius={[6, 6, 0, 0]}>
                    {distributionData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </Card>

        {/* Side Summary Cards */}
        <div className="space-y-4">
          <Card className="p-6 bg-gradient-to-br from-blue-900 to-indigo-900 text-white rounded-2xl shadow-md">
            <div className="flex items-center justify-between mb-3">
              <span className="text-[10px] font-black uppercase tracking-widest bg-blue-800 px-2.5 py-1 rounded-lg text-blue-200">
                Destaque Académico
              </span>
              <Award className="text-amber-400" size={24} />
            </div>
            <h4 className="text-base font-bold">Turma com Maior Média</h4>
            <div className="text-2xl font-black mt-1 text-white">
              {classData.length > 0
                ? classData.reduce((prev, current) => (prev.media > current.media ? prev : current)).name
                : 'N/A'}
            </div>
            <p className="text-xs text-blue-200 mt-2">
              Média Geral: {classData.length > 0 ? Math.max(...classData.map(c => c.media)) : 0} valores
            </p>
          </Card>

          <Card className="p-6 bg-white border border-slate-200 rounded-2xl shadow-sm">
            <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-3">
              Indicadores Principais
            </h4>
            <div className="space-y-3">
              <div className="flex justify-between items-center pb-2 border-b border-slate-100">
                <span className="text-xs font-semibold text-slate-600">Taxa Média de Aproveitamento</span>
                <span className="text-xs font-black text-emerald-600">
                  {classData.length > 0
                    ? Math.round(classData.reduce((acc, c) => acc + c.aproveitamento, 0) / classData.length)
                    : 0}%
                </span>
              </div>
              <div className="flex justify-between items-center pb-2 border-b border-slate-100">
                <span className="text-xs font-semibold text-slate-600">Total de Alunos Avaliados</span>
                <span className="text-xs font-black text-slate-900">{students.length}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs font-semibold text-slate-600">Disciplinas Registadas</span>
                <span className="text-xs font-black text-blue-600">{subjects.length}</span>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* PRINTABLE OFFICIAL PDF REPORT (Visible ONLY on print) */}
      <div className="hidden print:block bg-white text-black p-8 font-serif space-y-6">
        <div className="text-center border-b-2 border-black pb-4">
          <h4 className="font-bold text-sm tracking-wider">REPÚBLICA DE MOÇAMBIQUE</h4>
          <h4 className="font-bold text-xs uppercase text-gray-800">MINISTÉRIO DA EDUCAÇÃO E DESENVOLVIMENTO HUMANO</h4>
          <h3 className="font-black text-base mt-2">RELATÓRIO OFICIAL DE APROVEITAMENTO ESCOLAR — {selectedTrimester}º TRIMESTRE 2026</h3>
        </div>

        <div className="space-y-4">
          <h4 className="font-bold text-xs uppercase bg-slate-100 p-2 border border-black">1. Desempenho por Turma</h4>
          <table className="w-full border-collapse border border-black text-xs">
            <thead>
              <tr className="bg-slate-200">
                <th className="border border-black p-1.5 text-left">Turma</th>
                <th className="border border-black p-1.5 text-left">Classe</th>
                <th className="border border-black p-1.5 text-center">Nº Alunos</th>
                <th className="border border-black p-1.5 text-center">Média Geral</th>
                <th className="border border-black p-1.5 text-center">Taxa de Aprov. (%)</th>
              </tr>
            </thead>
            <tbody>
              {classData.map((cls, idx) => (
                <tr key={idx}>
                  <td className="border border-black p-1.5 font-bold">{cls.name}</td>
                  <td className="border border-black p-1.5">{cls.gradeLevel}</td>
                  <td className="border border-black p-1.5 text-center">{cls.alunos}</td>
                  <td className="border border-black p-1.5 text-center font-bold">{cls.media}</td>
                  <td className="border border-black p-1.5 text-center">{cls.aproveitamento}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="space-y-4 pt-4">
          <h4 className="font-bold text-xs uppercase bg-slate-100 p-2 border border-black">2. Desempenho por Disciplina</h4>
          <table className="w-full border-collapse border border-black text-xs">
            <thead>
              <tr className="bg-slate-200">
                <th className="border border-black p-1.5 text-left">Disciplina</th>
                <th className="border border-black p-1.5 text-center">Média da Disciplina</th>
                <th className="border border-black p-1.5 text-center">Taxa de Aproveitamento</th>
              </tr>
            </thead>
            <tbody>
              {subjectData.map((sub, idx) => (
                <tr key={idx}>
                  <td className="border border-black p-1.5 font-bold">{sub.name}</td>
                  <td className="border border-black p-1.5 text-center">{sub.media}</td>
                  <td className="border border-black p-1.5 text-center">{sub.aproveitamento}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="pt-12 flex justify-between items-end text-xs">
          <div className="text-center">
            <div className="border-t border-black w-48 pt-1">O(A) Diretor(a) Pedagógico(a)</div>
          </div>
          <div className="text-center">
            <div className="border-t border-black w-48 pt-1">O(A) Diretor(a) da Escola</div>
          </div>
        </div>
      </div>
    </div>
  );
};
