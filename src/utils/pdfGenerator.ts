import { Student, Grade, Subject, Class } from '../types';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

export const generateStudentHistoryPDF = (
  student: Student,
  grades: Grade[],
  subjects: Subject[],
  classes: Class[]
) => {
  const doc = new jsPDF();

  // Header
  doc.setFontSize(18);
  doc.text('Histórico Escolar Completo', 105, 20, { align: 'center' });
  
  doc.setFontSize(12);
  doc.text(`Aluno: ${student.name}`, 20, 40);
  doc.text(`Ano Lectivo: ${student.academicYear || 'N/A'}`, 20, 48);
  doc.text(`Turma: ${classes.find(c => c.id === student.classId)?.name || 'N/A'}`, 20, 56);

  // Grades Table
  const tableData = grades.map(g => [
    subjects.find(s => s.id === g.subjectId)?.name || 'N/A',
    g.trimester,
    g.acs1 || '-',
    g.acs2 || '-',
    g.acs3 || '-',
    g.apt || '-',
    g.media || '-'
  ]);

  (doc as any).autoTable({
    startY: 70,
    head: [['Disciplina', 'Trim', 'ACS1', 'ACS2', 'ACS3', 'APT', 'Média']],
    body: tableData,
  });

  // Observations
  const finalY = (doc as any).lastAutoTable.finalY + 20;
  doc.text('Observações do Conselho de Turma:', 20, finalY);
  doc.setFontSize(10);
  doc.text(student.generalObservations || 'Sem observações.', 20, finalY + 10, { maxWidth: 170 });

  doc.save(`Historico_${student.name.replace(/\s+/g, '_')}.pdf`);
};
