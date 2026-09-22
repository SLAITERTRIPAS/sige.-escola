import { useStore } from '../store';
import { Card } from './ui';
import { TeacherReport } from './TeacherReport';
import { useState } from 'react';

export function TeacherStatistics() {
  const { students, teacherAssignments, grades, examGrades, subjects, classes, currentUser } = useStore();
  const [showReport, setShowReport] = useState(false);

  if (showReport) return <TeacherReport />;

  if (currentUser?.role !== 'teacher') return null;

  const assignments = teacherAssignments.filter(a => a.teacherId === currentUser.id);

  // Group assignments by subject
  const subjectsTaught = assignments.reduce((acc, assignment) => {
    const subject = subjects.find(s => s.id === assignment.subjectId);
    if (!subject) return acc;
    if (!acc[subject.id]) {
      acc[subject.id] = { name: subject.name, classes: [] };
    }
    if (!acc[subject.id].classes.includes(assignment.classId)) {
      acc[subject.id].classes.push(assignment.classId);
    }
    return acc;
  }, {} as Record<string, { name: string; classes: string[] }>);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-slate-800">Estatísticas por Disciplina</h2>
        <button onClick={() => setShowReport(true)} className="bg-cyan-600 text-white px-4 py-2 rounded-lg">Gerar Relatório</button>
      </div>
      {Object.entries(subjectsTaught).map(([subjectId, data]) => {
        const subjectData = data as { name: string; classes: string[] };
        const { name, classes: subjectClasses } = subjectData;
        const enrolledStudents = students.filter(s => subjectClasses.includes(s.classId || ''));
        
        // Calculations
        const evaluated = enrolledStudents.filter(s => grades.some(g => g.studentId === s.id && g.subjectId === subjectId)).length;
        const approved = enrolledStudents.filter(s => examGrades.some(eg => eg.studentId === s.id && eg.subjectId === subjectId && eg.resultado === 'Aprovado')).length;
        const reproved = enrolledStudents.filter(s => examGrades.some(eg => eg.studentId === s.id && eg.subjectId === subjectId && eg.resultado === 'Reprovado')).length;
        const droppedOut = enrolledStudents.filter(s => s.enrollmentStatus === 'Desistente').length;
        const transferredOut = enrolledStudents.filter(s => s.enrollmentStatus === 'Transferido').length;
        const transferredIn = enrolledStudents.filter(s => s.isNewAdmission).length; // Simplified logic

        return (
          <Card key={subjectId} className="shadow-sm">
            <div className="p-4 border-b border-gray-200">
              <h3 className="text-lg font-bold text-cyan-900">{name}</h3>
            </div>
            <div className="p-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <StatItem label="Inscritos" value={enrolledStudents.length} />
                <StatItem label="Avaliados" value={evaluated} />
                <StatItem label="Aprovados" value={approved} />
                <StatItem label="Reprovados" value={reproved} />
                <StatItem label="Desistentes" value={droppedOut} />
                <StatItem label="Transferidos" value={transferredOut} />
                <StatItem label="Vindo Transferido" value={transferredIn} />
              </div>
            </div>
          </Card>
        );
      })}
    </div>
  );
}

function StatItem({ label, value }: { label: string; value: number }) {
  return (
    <div className="bg-slate-50 p-4 rounded-lg border border-slate-100">
      <div className="text-sm text-slate-500">{label}</div>
      <div className="text-2xl font-bold text-slate-900">{value}</div>
    </div>
  );
}
