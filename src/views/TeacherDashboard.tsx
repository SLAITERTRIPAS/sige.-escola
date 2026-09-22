import { useState } from "react";
import { useStore } from "../store";
import { Card, Button } from "../components/ui";
import {
  BookOpen,
  CheckCircle,
  Lock,
  ChevronDown,
  ChevronRight,
  Users,
  BookMarked,
  FileSpreadsheet,
  Award,
  AlertCircle,
  CheckCheck,
  LayoutDashboard,
  Calendar,
  FileText,
  BarChart2,
  FileSignature,
  MessageSquare,
} from "lucide-react";
import { TeacherAssignment, LessonSummary } from "../types";
import { CollapsibleSidebar } from "../components/CollapsibleSidebar";
import { SidebarMenu } from "../components/SidebarMenu";
import { AcademicCalendarComponent } from "../components/AcademicCalendarComponent";

export function TeacherDashboard() {
  const {
    currentUser,
    assignments,
    subjects,
    classes,
    students,
    grades,
    examGrades,
    lessonSummaries,
    addGrade,
    addExamGrade,
    addLessonSummary,
  } = useStore();

  const myAssignments = assignments.filter(
    (a) => a.teacherId === currentUser?.id,
  );
  const [selectedAssignment, setSelectedAssignment] =
    useState<TeacherAssignment | null>(null);
  const [activeTab, setActiveTab] = useState<string>("overview");

  // Navigation mode: Caderneta vs. Exame vs. Sumários
  const [activeMode, setActiveMode] = useState<
    "caderneta" | "exame" | "sumarios"
  >("caderneta");

  // Sumários state
  const [newSummary, setNewSummary] = useState({
    topic: "",
    objectives: "",
    date: new Date().toISOString().split("T")[0],
  });
  const [isAddingSummary, setIsAddingSummary] = useState(false);

  // Caderneta state
  const [selectedTrimester, setSelectedTrimester] = useState<1 | 2 | 3>(1);
  const [draftGrades, setDraftGrades] = useState<
    Record<
      string,
      { acs1?: number; acs2?: number; acs3?: number; apt?: number }
    >
  >({});

  // Exam state
  const [draftExamGrades, setDraftExamGrades] = useState<
    Record<string, number>
  >({});
  const [feedbackMsg, setFeedbackMsg] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const [expandedGrades, setExpandedGrades] = useState<Record<string, boolean>>(
    {},
  );

  // Show feedback banner helper
  const showFeedback = (
    text: string,
    type: "success" | "error" = "success",
  ) => {
    setFeedbackMsg({ text, type });
    setTimeout(() => setFeedbackMsg(null), 4500);
  };

  const handleGradeChange = (
    studentId: string,
    field: "acs1" | "acs2" | "acs3" | "apt",
    val: string,
  ) => {
    const num = parseInt(val);
    if (isNaN(num) && val !== "") return;
    if (num < 0 || num > 20) return;

    setDraftGrades((prev) => {
      const studentGrades = prev[studentId] || {};
      const next = { ...prev };

      if (val === "") {
        delete studentGrades[field];
      } else {
        studentGrades[field] = num;
      }

      if (Object.keys(studentGrades).length === 0) {
        delete next[studentId];
      } else {
        next[studentId] = studentGrades;
      }
      return next;
    });
  };

  const handleLaunchGrade = (studentId: string) => {
    const dGrades = draftGrades[studentId];
    if (!dGrades || !selectedAssignment || !currentUser) return;

    let media = 0;
    if (
      dGrades.acs1 !== undefined &&
      dGrades.acs2 !== undefined &&
      dGrades.acs3 !== undefined &&
      dGrades.apt !== undefined
    ) {
      media = (dGrades.acs1 + dGrades.acs2 + dGrades.acs3 + dGrades.apt) / 4;
    }

    addGrade({
      studentId,
      classId: selectedAssignment.classId,
      subjectId: selectedAssignment.subjectId,
      teacherId: currentUser.id,
      trimester: selectedTrimester,
      acs1: dGrades.acs1,
      acs2: dGrades.acs2,
      acs3: dGrades.acs3,
      apt: dGrades.apt,
      media: media,
    });

    showFeedback(
      "Nota trimestral lançada e copiada para a Pauta Geral com sucesso!",
    );
  };

  // Helper: calculate the student's continuous assessment subject average (MF)
  const getStudentSubjectMF = (
    studentId: string,
    subjectId: string,
  ): number => {
    const t1 = grades.find(
      (g) =>
        g.studentId === studentId &&
        g.subjectId === subjectId &&
        g.trimester === 1,
    )?.media;
    const t2 = grades.find(
      (g) =>
        g.studentId === studentId &&
        g.subjectId === subjectId &&
        g.trimester === 2,
    )?.media;
    const t3 = grades.find(
      (g) =>
        g.studentId === studentId &&
        g.subjectId === subjectId &&
        g.trimester === 3,
    )?.media;

    const valid = [t1, t2, t3].filter(
      (g): g is number => g !== undefined && g !== null,
    );
    if (valid.length > 0) {
      const avg = valid.reduce((a, b) => a + b, 0) / valid.length;
      return Math.round(avg * 10) / 10;
    }
    return 10; // Default baseline if not yet filled
  };

  // Helper: check exam admission status
  const getExamAdmissionInfo = (mf: number) => {
    if (mf >= 13.5) {
      return {
        status: "Dispensado",
        label: "Dispensado",
        badge: "bg-blue-50 text-blue-700 border-blue-200",
        canTakeExam: true,
        desc: "Dispensado do exame (pode realizar exame para melhoria)",
      };
    }
    if (mf >= 9.5) {
      return {
        status: "Admitido",
        label: "Admitido ao Exame",
        badge: "bg-green-50 text-green-700 border-green-200",
        canTakeExam: true,
        desc: "Inscrito e admitido a exame",
      };
    }
    return {
      status: "Excluído",
      label: "Excluído",
      badge: "bg-red-50 text-red-700 border-red-200",
      canTakeExam: false,
      desc: "Média de frequência inferior a 9.5 valores",
    };
  };

  // Handle input change for exam grade
  const handleExamGradeChange = (studentId: string, val: string) => {
    if (val === "") {
      setDraftExamGrades((prev) => {
        const next = { ...prev };
        delete next[studentId];
        return next;
      });
      return;
    }
    const num = parseFloat(val);
    if (isNaN(num)) return;
    if (num < 0 || num > 20) return;

    setDraftExamGrades((prev) => ({
      ...prev,
      [studentId]: num,
    }));
  };

  // Launch a single exam grade
  const handleLaunchExamGrade = (studentId: string) => {
    if (!selectedAssignment || !currentUser) return;
    const ne = draftExamGrades[studentId];
    if (ne === undefined) return;

    const mf = getStudentSubjectMF(studentId, selectedAssignment.subjectId);
    // Official Mozambican ESG standard formula: CF = 40% MF + 60% NE (rounded)
    const cf = Math.round(mf * 0.4 + ne * 0.6);
    const resultado = cf >= 9.5 ? "Aprovado" : "Reprovado";

    addExamGrade({
      studentId,
      classId: selectedAssignment.classId,
      subjectId: selectedAssignment.subjectId,
      teacherId: currentUser.id,
      mediaFrequencia: mf,
      notaExame: ne,
      classificacaoFinal: cf,
      resultado,
    });

    showFeedback(
      "Nota de exame lançada com sucesso! Copiada diretamente para a Pauta Geral de Exames.",
    );
  };

  // Launch all filled exam grades in batch
  const handleLaunchAllExamGrades = () => {
    if (!selectedAssignment || !currentUser) return;
    const myStudents = students.filter(
      (s) => s.classId === selectedAssignment.classId,
    );
    let launchedCount = 0;

    myStudents.forEach((student) => {
      const existing = (examGrades || []).find(
        (eg) =>
          eg.studentId === student.id &&
          eg.subjectId === selectedAssignment.subjectId &&
          eg.classId === selectedAssignment.classId,
      );

      if (!existing && draftExamGrades[student.id] !== undefined) {
        const ne = draftExamGrades[student.id];
        const mf = getStudentSubjectMF(
          student.id,
          selectedAssignment.subjectId,
        );
        const cf = Math.round(mf * 0.4 + ne * 0.6);
        const resultado = cf >= 9.5 ? "Aprovado" : "Reprovado";

        addExamGrade({
          studentId: student.id,
          classId: selectedAssignment.classId,
          subjectId: selectedAssignment.subjectId,
          teacherId: currentUser.id,
          mediaFrequencia: mf,
          notaExame: ne,
          classificacaoFinal: cf,
          resultado,
        });
        launchedCount++;
      }
    });

    if (launchedCount > 0) {
      showFeedback(
        `${launchedCount} notas de exame lançadas e copiadas diretamente para a Pauta Geral de Exames!`,
      );
    } else {
      showFeedback("Nenhuma nova nota preenchida para lançar.", "error");
    }
  };

  const handleSaveSummary = () => {
    if (!selectedAssignment || !newSummary.topic) return;

    const mySummaries = lessonSummaries.filter(
      (ls) => ls.assignmentId === selectedAssignment.id,
    );
    const lessonNumber = mySummaries.length + 1;

    addLessonSummary({
      assignmentId: selectedAssignment.id,
      date: newSummary.date,
      lessonNumber,
      topic: newSummary.topic,
      objectives: newSummary.objectives,
      status: "completed",
    });

    setNewSummary({
      topic: "",
      objectives: "",
      date: new Date().toISOString().split("T")[0],
    });
    setIsAddingSummary(false);
    showFeedback("Sumário de aula registado com sucesso!");
  };

  const toggleGrade = (gradeLevel: string) => {
    setExpandedGrades((prev) => ({
      ...prev,
      [gradeLevel]: !prev[gradeLevel],
    }));
  };

  const assignmentsByGrade: Record<string, TeacherAssignment[]> = {};
  myAssignments.forEach((a) => {
    const turma = classes.find((c) => c.id === a.classId);
    if (turma) {
      if (!assignmentsByGrade[turma.gradeLevel])
        assignmentsByGrade[turma.gradeLevel] = [];
      assignmentsByGrade[turma.gradeLevel].push(a);
    }
  });

  const renderMainContent = () => {
    if (!selectedAssignment) {
      return (
        <div className="h-full flex flex-col items-center justify-center text-center py-20">
          <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center mb-6 shadow-sm border border-gray-200">
            <BookOpen className="h-10 w-10 text-gray-400" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Portal do Docente
          </h2>
          <p className="text-gray-500 max-w-md">
            Selecione uma turma no menu lateral para visualizar a caderneta de
            frequência e lançar notas de exame da sua disciplina.
          </p>
        </div>
      );
    }

    const subject = subjects.find((s) => s.id === selectedAssignment.subjectId);
    const turma = classes.find((c) => c.id === selectedAssignment.classId);
    const myStudents = students.filter(
      (s) => s.classId === selectedAssignment.classId,
    );

    // Exam statistics for this class and subject
    const admittedCount = myStudents.filter((s) => {
      const mf = getStudentSubjectMF(s.id, selectedAssignment.subjectId);
      return mf >= 9.5 && mf < 13.5;
    }).length;

    const dispensadosCount = myStudents.filter((s) => {
      const mf = getStudentSubjectMF(s.id, selectedAssignment.subjectId);
      return mf >= 13.5;
    }).length;

    const excluidosCount = myStudents.filter((s) => {
      const mf = getStudentSubjectMF(s.id, selectedAssignment.subjectId);
      return mf < 9.5;
    }).length;

    const examLaunchedCount = myStudents.filter((s) => {
      return (examGrades || []).some(
        (eg) =>
          eg.studentId === s.id &&
          eg.subjectId === selectedAssignment.subjectId &&
          eg.classId === selectedAssignment.classId,
      );
    }).length;

    return (
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header with Title and Mode Switcher */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-gray-100">
            <div>
              <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-md text-xs font-semibold bg-blue-50 text-blue-700 mb-2">
                <BookMarked className="h-3.5 w-3.5" />
                Disciplina Atribuída: {subject?.name}
              </div>
              <h2 className="text-2xl font-bold text-gray-900">
                {activeMode === "caderneta"
                  ? `Caderneta: ${subject?.name}`
                  : activeMode === "exame"
                    ? `Exame: ${subject?.name}`
                    : `Gestão de Disciplina: ${subject?.name}`}
              </h2>
              <p className="text-gray-600 text-sm mt-1">
                {turma?.name} • {turma?.gradeLevel} • Período{" "}
                {turma?.period || "Manhã"}
              </p>
            </div>

            {/* View Switcher Tabs */}
            <div className="inline-flex p-1 bg-gray-100 rounded-lg border border-gray-200">
              <button
                onClick={() => setActiveMode("caderneta")}
                className={`flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-md transition-all ${
                  activeMode === "caderneta"
                    ? "bg-white text-blue-700 shadow-sm"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                <BookOpen className="h-4 w-4" />
                Caderneta
              </button>
              <button
                onClick={() => setActiveMode("sumarios")}
                className={`flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-md transition-all ${
                  activeMode === "sumarios"
                    ? "bg-white text-blue-700 shadow-sm"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                <BookMarked className="h-4 w-4" />
                Sumários
              </button>
              <button
                id="btn-tab-pauta-exame"
                onClick={() => setActiveMode("exame")}
                className={`flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-md transition-all ${
                  activeMode === "exame"
                    ? "bg-blue-600 text-white shadow-sm"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                <FileSpreadsheet className="h-4 w-4" />
                Exames
              </button>
            </div>
          </div>

          {/* Contextual Notice */}
          <div className="mt-4 flex items-center justify-between text-xs text-gray-600 bg-gray-50 rounded-lg p-3 border border-gray-200">
            <span className="flex items-center gap-2">
              <Lock className="h-3.5 w-3.5 text-gray-500" />
              <strong>Segurança & Acesso:</strong> Você só tem acesso ao
              lançamento da disciplina{" "}
              <span className="font-semibold text-blue-700">
                {subject?.name}
              </span>
              .
            </span>
            <span className="text-gray-500">
              Sincronização imediata com a Pauta Geral da Escola
            </span>
          </div>
        </div>

        {/* Feedback Alert Toast */}
        {feedbackMsg && (
          <div
            className={`p-4 rounded-lg flex items-center gap-3 border shadow-sm transition-all ${
              feedbackMsg.type === "success"
                ? "bg-green-50 text-green-800 border-green-200"
                : "bg-red-50 text-red-800 border-red-200"
            }`}
          >
            <CheckCheck className="h-5 w-5 flex-shrink-0 text-green-600" />
            <p className="text-sm font-medium">{feedbackMsg.text}</p>
          </div>
        )}

        {/* MODE 1: CADERNETA TRIMESTRAL */}
        {activeMode === "caderneta" && (
          <Card className="p-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              <div className="flex items-center space-x-3">
                <label className="font-semibold text-sm text-gray-700">
                  Trimestre:
                </label>
                <select
                  className="rounded-md border-gray-300 border px-3 py-1.5 text-sm font-medium focus:border-blue-500 focus:ring-blue-500 bg-white"
                  value={selectedTrimester}
                  onChange={(e) =>
                    setSelectedTrimester(Number(e.target.value) as 1 | 2 | 3)
                  }
                >
                  <option value={1}>1º Trimestre</option>
                  <option value={2}>2º Trimestre</option>
                  <option value={3}>3º Trimestre</option>
                </select>
              </div>

              <div className="text-xs text-gray-500">
                Lançamento contínuo: ACS1, ACS2, ACS3 e APT (Média = 40% ACS +
                60% APT ou Média Aritmética)
              </div>
            </div>

            <div className="overflow-x-auto rounded-lg border border-gray-200">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50 text-gray-600">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-bold uppercase border-r border-gray-200">
                      Aluno
                    </th>
                    <th className="px-2 py-3 text-center text-xs font-bold uppercase">
                      ACS1
                    </th>
                    <th className="px-2 py-3 text-center text-xs font-bold uppercase">
                      ACS2
                    </th>
                    <th className="px-2 py-3 text-center text-xs font-bold uppercase">
                      ACS3
                    </th>
                    <th className="px-2 py-3 text-center text-xs font-bold text-gray-800 uppercase bg-gray-100 border-x border-gray-200">
                      Média
                      <br />
                      ACS
                    </th>
                    <th className="px-2 py-3 text-center text-xs font-bold uppercase">
                      APT
                    </th>
                    <th className="px-2 py-3 text-center text-xs font-bold text-gray-800 uppercase bg-gray-100 border-x border-gray-200">
                      Média
                      <br />
                      Final
                    </th>
                    <th className="px-2 py-3 text-center text-xs font-bold uppercase">
                      Classificação
                    </th>
                    <th className="px-4 py-3 text-center text-xs font-bold uppercase">
                      Ação
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {myStudents.length === 0 ? (
                    <tr>
                      <td
                        colSpan={9}
                        className="px-6 py-8 text-center text-gray-500"
                      >
                        Nenhum estudante inscrito nesta turma.
                      </td>
                    </tr>
                  ) : (
                    myStudents.map((student) => {
                      const existingGrade = grades.find(
                        (g) =>
                          g.studentId === student.id &&
                          g.subjectId === selectedAssignment.subjectId &&
                          g.trimester === selectedTrimester,
                      );

                      const isLocked = existingGrade?.isLocked;
                      const dg = draftGrades[student.id] || {};

                      let draftMediaAcs = 0;
                      if (
                        dg.acs1 !== undefined &&
                        dg.acs2 !== undefined &&
                        dg.acs3 !== undefined
                      ) {
                        draftMediaAcs = (dg.acs1 + dg.acs2 + dg.acs3) / 3;
                      }

                      let draftMedia = 0;
                      if (
                        dg.acs1 !== undefined &&
                        dg.acs2 !== undefined &&
                        dg.acs3 !== undefined &&
                        dg.apt !== undefined
                      ) {
                        draftMedia = (dg.acs1 + dg.acs2 + dg.acs3 + dg.apt) / 4;
                      }

                      let existingMediaAcs = 0;
                      if (
                        isLocked &&
                        existingGrade.acs1 !== undefined &&
                        existingGrade.acs2 !== undefined &&
                        existingGrade.acs3 !== undefined
                      ) {
                        existingMediaAcs =
                          (existingGrade.acs1 +
                            existingGrade.acs2 +
                            existingGrade.acs3) /
                          3;
                      }

                      const finalMedia = isLocked
                        ? existingGrade.media
                        : draftMedia > 0
                          ? draftMedia
                          : undefined;
                      const classficacao =
                        finalMedia !== undefined
                          ? finalMedia >= 9.5
                            ? "Transita"
                            : "Reprova"
                          : "-";

                      return (
                        <tr key={student.id} className="hover:bg-gray-50/50">
                          <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900 border-r border-gray-200">
                            {student.name}
                          </td>
                          <td className="px-2 py-3 whitespace-nowrap text-center">
                            {isLocked ? (
                              <span className="font-semibold text-gray-900">
                                {existingGrade.acs1 ?? "-"}
                              </span>
                            ) : (
                              <input
                                type="number"
                                min="0"
                                max="20"
                                className="w-14 text-center rounded-md border-gray-300 border px-1 py-1 text-sm focus:border-blue-500 focus:ring-blue-500"
                                value={dg.acs1 ?? ""}
                                onChange={(e) =>
                                  handleGradeChange(
                                    student.id,
                                    "acs1",
                                    e.target.value,
                                  )
                                }
                              />
                            )}
                          </td>
                          <td className="px-2 py-3 whitespace-nowrap text-center">
                            {isLocked ? (
                              <span className="font-semibold text-gray-900">
                                {existingGrade.acs2 ?? "-"}
                              </span>
                            ) : (
                              <input
                                type="number"
                                min="0"
                                max="20"
                                className="w-14 text-center rounded-md border-gray-300 border px-1 py-1 text-sm focus:border-blue-500 focus:ring-blue-500"
                                value={dg.acs2 ?? ""}
                                onChange={(e) =>
                                  handleGradeChange(
                                    student.id,
                                    "acs2",
                                    e.target.value,
                                  )
                                }
                              />
                            )}
                          </td>
                          <td className="px-2 py-3 whitespace-nowrap text-center">
                            {isLocked ? (
                              <span className="font-semibold text-gray-900">
                                {existingGrade.acs3 ?? "-"}
                              </span>
                            ) : (
                              <input
                                type="number"
                                min="0"
                                max="20"
                                className="w-14 text-center rounded-md border-gray-300 border px-1 py-1 text-sm focus:border-blue-500 focus:ring-blue-500"
                                value={dg.acs3 ?? ""}
                                onChange={(e) =>
                                  handleGradeChange(
                                    student.id,
                                    "acs3",
                                    e.target.value,
                                  )
                                }
                              />
                            )}
                          </td>
                          <td className="px-2 py-3 whitespace-nowrap text-center bg-gray-50 border-x border-gray-200">
                            <span className="font-bold text-blue-900 text-sm">
                              {isLocked
                                ? existingMediaAcs.toFixed(1)
                                : dg.acs1 !== undefined &&
                                    dg.acs2 !== undefined &&
                                    dg.acs3 !== undefined
                                  ? draftMediaAcs.toFixed(1)
                                  : "-"}
                            </span>
                          </td>
                          <td className="px-2 py-3 whitespace-nowrap text-center">
                            {isLocked ? (
                              <span className="font-semibold text-gray-900">
                                {existingGrade.apt ?? "-"}
                              </span>
                            ) : (
                              <input
                                type="number"
                                min="0"
                                max="20"
                                className="w-14 text-center rounded-md border-gray-300 border px-1 py-1 text-sm focus:border-blue-500 focus:ring-blue-500"
                                value={dg.apt ?? ""}
                                onChange={(e) =>
                                  handleGradeChange(
                                    student.id,
                                    "apt",
                                    e.target.value,
                                  )
                                }
                              />
                            )}
                          </td>
                          <td className="px-2 py-3 whitespace-nowrap text-center bg-gray-50 border-x border-gray-200">
                            <span className="font-bold text-blue-900 text-base">
                              {finalMedia !== undefined
                                ? finalMedia.toFixed(1)
                                : "-"}
                            </span>
                          </td>
                          <td className="px-2 py-3 whitespace-nowrap text-center text-xs font-bold">
                            {finalMedia !== undefined ? (
                              <span
                                className={
                                  finalMedia >= 9.5
                                    ? "text-green-600"
                                    : "text-red-600"
                                }
                              >
                                {classficacao}
                              </span>
                            ) : (
                              <span className="text-gray-400">-</span>
                            )}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-center text-sm">
                            {isLocked ? (
                              <span className="inline-flex items-center text-gray-500 gap-1 justify-center text-xs font-medium">
                                <Lock className="h-3.5 w-3.5 text-gray-400" />{" "}
                                Lançada
                              </span>
                            ) : (
                              <Button
                                onClick={() => handleLaunchGrade(student.id)}
                                disabled={
                                  dg.acs1 === undefined ||
                                  dg.acs2 === undefined ||
                                  dg.acs3 === undefined ||
                                  dg.apt === undefined
                                }
                                className="bg-green-600 hover:bg-green-700 text-white gap-1.5 text-xs py-1 px-3 h-8 rounded-md"
                              >
                                <CheckCircle className="h-3.5 w-3.5" /> Lançar
                              </Button>
                            )}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
            <div className="mt-4 bg-blue-50 border border-blue-100 rounded-lg p-3 text-xs text-blue-800">
              <strong>Atenção:</strong> Uma vez lançada, a nota é bloqueada e
              copiada automaticamente para a Pauta Geral da turma.
            </div>
          </Card>
        )}

        {/* MODE 3: GESTÃO DE SUMÁRIOS */}
        {activeMode === "sumarios" && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-gray-900">
                Registo de Sumários
              </h3>
              <Button
                onClick={() => setIsAddingSummary(true)}
                className="bg-blue-600 text-white hover:bg-blue-700"
              >
                Novo Sumário
              </Button>
            </div>

            {isAddingSummary && (
              <Card className="p-6 border-blue-200 bg-blue-50/30">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">
                      Data da Aula
                    </label>
                    <input
                      type="date"
                      value={newSummary.date}
                      onChange={(e) =>
                        setNewSummary({ ...newSummary, date: e.target.value })
                      }
                      className="w-full rounded-md border-gray-300 border px-3 py-2 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">
                      Tema / Tópico
                    </label>
                    <input
                      type="text"
                      placeholder="Ex: Introdução à Genética"
                      value={newSummary.topic}
                      onChange={(e) =>
                        setNewSummary({ ...newSummary, topic: e.target.value })
                      }
                      className="w-full rounded-md border-gray-300 border px-3 py-2 text-sm"
                    />
                  </div>
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    Objetivos da Aula
                  </label>
                  <textarea
                    placeholder="Descreva o que os alunos devem aprender..."
                    rows={3}
                    value={newSummary.objectives}
                    onChange={(e) =>
                      setNewSummary({
                        ...newSummary,
                        objectives: e.target.value,
                      })
                    }
                    className="w-full rounded-md border-gray-300 border px-3 py-2 text-sm"
                  />
                </div>
                <div className="flex justify-end gap-3">
                  <Button
                    variant="outline"
                    onClick={() => setIsAddingSummary(false)}
                  >
                    Cancelar
                  </Button>
                  <Button
                    onClick={handleSaveSummary}
                    className="bg-blue-600 text-white"
                  >
                    Lançar Sumário
                  </Button>
                </div>
              </Card>
            )}

            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                        Nº
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                        Data
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                        Tópico
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                        Estado
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {lessonSummaries
                      .filter((ls) => ls.assignmentId === selectedAssignment.id)
                      .sort((a, b) => b.lessonNumber - a.lessonNumber)
                      .map((summary) => (
                        <tr key={summary.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900">
                            Aula {summary.lessonNumber}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                            {new Date(summary.date).toLocaleDateString("pt-MZ")}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-900">
                            <div className="font-semibold">{summary.topic}</div>
                            <div className="text-xs text-gray-500 mt-1">
                              {summary.objectives}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="px-2 py-1 text-xs font-bold rounded bg-green-100 text-green-700">
                              Concluída
                            </span>
                          </td>
                        </tr>
                      ))}
                    {lessonSummaries.filter(
                      (ls) => ls.assignmentId === selectedAssignment.id,
                    ).length === 0 && (
                      <tr>
                        <td
                          colSpan={4}
                          className="px-6 py-12 text-center text-gray-500"
                        >
                          Nenhum sumário registado para esta disciplina.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* MODE 2: PAUTA DE EXAME (EXAM GRADE LAUNCHING) */}
        {activeMode === "exame" && (
          <div className="space-y-6">
            {/* Quick Stat Summary Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
              <div className="bg-white p-3 rounded-lg border border-gray-200 shadow-sm">
                <span className="text-xs text-gray-500 font-medium">
                  Total de Alunos
                </span>
                <p className="text-xl font-bold text-gray-900 mt-1">
                  {myStudents.length}
                </p>
              </div>
              <div className="bg-white p-3 rounded-lg border border-green-200 shadow-sm bg-green-50/20">
                <span className="text-xs text-green-700 font-medium">
                  Admitidos a Exame
                </span>
                <p className="text-xl font-bold text-green-700 mt-1">
                  {admittedCount}
                </p>
              </div>
              <div className="bg-white p-3 rounded-lg border border-blue-200 shadow-sm bg-blue-50/20">
                <span className="text-xs text-blue-700 font-medium">
                  Dispensados
                </span>
                <p className="text-xl font-bold text-blue-700 mt-1">
                  {dispensadosCount}
                </p>
              </div>
              <div className="bg-white p-3 rounded-lg border border-red-200 shadow-sm bg-red-50/20">
                <span className="text-xs text-red-700 font-medium">
                  Excluídos
                </span>
                <p className="text-xl font-bold text-red-700 mt-1">
                  {excluidosCount}
                </p>
              </div>
              <div className="bg-white p-3 rounded-lg border border-purple-200 shadow-sm bg-purple-50/20 col-span-2 sm:col-span-1">
                <span className="text-xs text-purple-700 font-medium">
                  Exames Lançados
                </span>
                <p className="text-xl font-bold text-purple-700 mt-1">
                  {examLaunchedCount} / {myStudents.length}
                </p>
              </div>
            </div>

            {/* Exam Pauta Card */}
            <Card className="p-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                <div>
                  <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                    <Award className="h-5 w-5 text-blue-600" />
                    Pauta de Exame: {subject?.name} ({turma?.name})
                  </h3>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Fórmula Oficial ESG: Classificação Final (CF) = 40% MF
                    (Média Frequência) + 60% NE (Nota Exame)
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    id="btn-lancar-todos-exames"
                    onClick={handleLaunchAllExamGrades}
                    className="bg-blue-600 hover:bg-blue-700 text-white text-xs py-2 px-4 rounded-md shadow-sm gap-2"
                  >
                    <CheckCheck className="h-4 w-4" />
                    Lançar Todas as Notas Preenchidas
                  </Button>
                </div>
              </div>

              {/* Table of students for exam launching */}
              <div className="overflow-x-auto rounded-lg border border-gray-200 shadow-sm">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-100/70 text-gray-700">
                    <tr>
                      <th className="px-3 py-3 text-center text-xs font-bold uppercase w-12 border-r border-gray-200">
                        Nº
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-bold uppercase border-r border-gray-200">
                        Nome do Estudante
                      </th>
                      <th className="px-3 py-3 text-center text-xs font-bold uppercase bg-blue-50/60 border-r border-gray-200">
                        MF
                        <br />
                        <span className="text-[10px] font-normal text-gray-500">
                          (Frequência)
                        </span>
                      </th>
                      <th className="px-3 py-3 text-center text-xs font-bold uppercase border-r border-gray-200">
                        Estado de Admissão
                      </th>
                      <th className="px-4 py-3 text-center text-xs font-bold uppercase bg-yellow-50/60 border-r border-gray-200">
                        Nota de Exame (NE)
                        <br />
                        <span className="text-[10px] font-normal text-gray-500">
                          (0 a 20)
                        </span>
                      </th>
                      <th className="px-3 py-3 text-center text-xs font-bold uppercase bg-gray-50 border-r border-gray-200">
                        CF
                        <br />
                        <span className="text-[10px] font-normal text-gray-500">
                          (Class. Final)
                        </span>
                      </th>
                      <th className="px-3 py-3 text-center text-xs font-bold uppercase border-r border-gray-200">
                        Resultado
                      </th>
                      <th className="px-4 py-3 text-center text-xs font-bold uppercase">
                        Ação / Sincronização
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {myStudents.length === 0 ? (
                      <tr>
                        <td
                          colSpan={8}
                          className="px-6 py-8 text-center text-gray-500"
                        >
                          Nenhum estudante inscrito para esta turma.
                        </td>
                      </tr>
                    ) : (
                      myStudents.map((student, idx) => {
                        const mf = getStudentSubjectMF(
                          student.id,
                          selectedAssignment.subjectId,
                        );
                        const admission = getExamAdmissionInfo(mf);

                        const existingExamGrade = (examGrades || []).find(
                          (eg) =>
                            eg.studentId === student.id &&
                            eg.subjectId === selectedAssignment.subjectId &&
                            eg.classId === selectedAssignment.classId,
                        );

                        const isLocked = existingExamGrade?.isLocked;
                        const draftNE = draftExamGrades[student.id];

                        // Real-time calculation of CF
                        let activeNE = isLocked
                          ? existingExamGrade.notaExame
                          : draftNE;
                        let activeCF = isLocked
                          ? existingExamGrade.classificacaoFinal
                          : draftNE !== undefined
                            ? Math.round(mf * 0.4 + draftNE * 0.6)
                            : undefined;

                        let activeResultado = isLocked
                          ? existingExamGrade.resultado
                          : activeCF !== undefined
                            ? activeCF >= 9.5
                              ? "Aprovado"
                              : "Reprovado"
                            : undefined;

                        return (
                          <tr
                            key={student.id}
                            className={`hover:bg-gray-50/70 transition-colors ${!admission.canTakeExam ? "bg-red-50/10" : ""}`}
                          >
                            <td className="px-3 py-3 whitespace-nowrap text-center text-xs font-bold text-gray-600 border-r border-gray-200">
                              {idx + 1}
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap text-sm font-semibold text-gray-900 border-r border-gray-200">
                              {student.name}
                            </td>
                            <td className="px-3 py-3 whitespace-nowrap text-center text-sm font-bold text-blue-900 bg-blue-50/30 border-r border-gray-200">
                              {mf.toFixed(1)}
                            </td>
                            <td className="px-3 py-3 whitespace-nowrap text-center border-r border-gray-200">
                              <span
                                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold border ${admission.badge}`}
                              >
                                {admission.label}
                              </span>
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap text-center bg-yellow-50/30 border-r border-gray-200">
                              {isLocked ? (
                                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded bg-green-100 text-green-900 font-bold text-sm">
                                  <Lock className="h-3.5 w-3.5 text-green-700" />
                                  <span>{existingExamGrade.notaExame}</span>
                                </div>
                              ) : admission.canTakeExam ? (
                                <input
                                  id={`input-exam-${student.id}`}
                                  type="number"
                                  min="0"
                                  max="20"
                                  step="0.5"
                                  placeholder="Nota 0-20"
                                  value={draftNE !== undefined ? draftNE : ""}
                                  onChange={(e) =>
                                    handleExamGradeChange(
                                      student.id,
                                      e.target.value,
                                    )
                                  }
                                  className="w-24 text-center font-bold text-sm rounded-md border-gray-300 border py-1.5 px-2 focus:border-blue-500 focus:ring-blue-500 shadow-sm"
                                />
                              ) : (
                                <span className="text-xs text-red-500 italic font-medium">
                                  Não admitido a exame
                                </span>
                              )}
                            </td>
                            <td className="px-3 py-3 whitespace-nowrap text-center bg-gray-50 border-r border-gray-200">
                              <span className="font-extrabold text-sm text-gray-900">
                                {activeCF !== undefined ? activeCF : "-"}
                              </span>
                            </td>
                            <td className="px-3 py-3 whitespace-nowrap text-center border-r border-gray-200">
                              {activeResultado ? (
                                <span
                                  className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-bold ${
                                    activeResultado === "Aprovado"
                                      ? "bg-green-100 text-green-800"
                                      : "bg-red-100 text-red-800"
                                  }`}
                                >
                                  {activeResultado}
                                </span>
                              ) : (
                                <span className="text-gray-400 text-xs">-</span>
                              )}
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap text-center text-xs">
                              {isLocked ? (
                                <div className="flex flex-col items-center justify-center">
                                  <span className="inline-flex items-center gap-1 text-green-700 font-semibold">
                                    <CheckCircle className="h-3.5 w-3.5" />{" "}
                                    Lançada & Sincronizada
                                  </span>
                                  <span className="text-[10px] text-gray-400">
                                    Copiada na Pauta Geral
                                  </span>
                                </div>
                              ) : (
                                <Button
                                  id={`btn-lancar-${student.id}`}
                                  onClick={() =>
                                    handleLaunchExamGrade(student.id)
                                  }
                                  disabled={
                                    !admission.canTakeExam ||
                                    draftNE === undefined
                                  }
                                  className="bg-blue-600 hover:bg-blue-700 text-white text-xs py-1.5 px-3 rounded-md shadow-sm gap-1.5 font-medium disabled:opacity-40"
                                >
                                  <CheckCircle className="h-3.5 w-3.5" /> Lançar
                                  Nota
                                </Button>
                              )}
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>

              {/* Informative Footer */}
              <div className="mt-6 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs text-blue-900">
                <div className="flex items-center gap-2.5">
                  <AlertCircle className="h-5 w-5 text-blue-600 flex-shrink-0" />
                  <div>
                    <strong className="font-bold">Integração Direta:</strong> Ao
                    clicar em "Lançar Nota", o resultado é copiado diretamente
                    para a <strong>Pauta Geral de Exames</strong> da escola,
                    ficando imediatamente disponível para visualização e
                    impressão pela Direção Pedagógica.
                  </div>
                </div>
              </div>
            </Card>
          </div>
        )}
      </div>
    );
  };

  return (
    <CollapsibleSidebar
      sidebarContent={
        <SidebarMenu
          activeTab={activeTab === "chat" ? "messages" : activeTab}
          setActiveTab={(tab) => {
            if (tab === "messages") setActiveTab("chat");
            else setActiveTab(tab as any);
          }}
          additionalContent={
            <div className="p-2 overflow-y-auto flex-1">
              {Object.keys(assignmentsByGrade).length === 0 ? (
                <p className="text-[10px] text-slate-500 p-2 italic">
                  Nenhuma turma atribuída.
                </p>
              ) : (
                Object.entries(assignmentsByGrade).map(
                  ([gradeLevel, gradeAssignments]) => (
                    <div key={gradeLevel} className="mb-2">
                      <button
                        onClick={() => toggleGrade(gradeLevel)}
                        className="w-full flex items-center justify-between px-3 py-1.5 text-[11px] font-black text-slate-500 uppercase tracking-wider hover:bg-slate-50 rounded-lg transition-colors"
                      >
                        <span>{gradeLevel}</span>
                        {expandedGrades[gradeLevel] ? (
                          <ChevronDown size={14} />
                        ) : (
                          <ChevronRight size={14} />
                        )}
                      </button>

                      {expandedGrades[gradeLevel] && (
                        <div className="mt-1 space-y-1">
                          {gradeAssignments.map((a) => {
                            const subject = subjects.find(
                              (s) => s.id === a.subjectId,
                            );
                            const turma = classes.find(
                              (c) => c.id === a.classId,
                            );
                            const isSelected = selectedAssignment?.id === a.id;

                            return (
                              <button
                                key={a.id}
                                onClick={() => {
                                  setSelectedAssignment(a);
                                  setActiveTab("overview");
                                }}
                                className={`w-full flex flex-col items-start px-3 py-2 text-xs rounded-xl transition-all border ${
                                  isSelected
                                    ? "bg-blue-50 border-blue-200 text-blue-700 font-bold shadow-sm"
                                    : "border-transparent text-slate-600 hover:bg-slate-50"
                                }`}
                              >
                                <span className="flex items-center gap-2">
                                  <Users size={12} />
                                  {turma?.name}
                                </span>
                                <span className="text-[10px] text-slate-400 truncate w-full pl-5">
                                  {subject?.name}
                                </span>
                              </button>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  ),
                )
              )}
            </div>
          }
        />
      }
    >
      <div className="p-6 md:p-8 bg-slate-50 h-full overflow-y-auto">
        {activeTab === "overview" ? (
          renderMainContent()
        ) : activeTab === "calendar" ? (
          <AcademicCalendarComponent />
        ) : (
          <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4">
            <div className="flex flex-col items-center justify-center text-center py-32 bg-white rounded-3xl border border-slate-200 shadow-sm">
              {activeTab === "messages" && (
                <MessageSquare size={64} className="text-slate-200 mb-6" />
              )}
              {activeTab === "reports" && (
                <FileText size={64} className="text-slate-200 mb-6" />
              )}
              {activeTab === "statistics" && (
                <BarChart2 size={64} className="text-slate-200 mb-6" />
              )}
              {activeTab === "signature" && (
                <FileSignature size={64} className="text-slate-200 mb-6" />
              )}

              <h2 className="text-2xl font-black text-slate-800">
                {activeTab === "messages"
                  ? "Mensagens e Avisos"
                  : activeTab === "reports"
                    ? "Relatórios de Conteúdo"
                    : activeTab === "statistics"
                      ? "Indicadores de Rendimento"
                      : "Assinatura de Cadernetas"}
              </h2>
              <p className="text-slate-500 mt-2">
                Esta funcionalidade está a ser integrada com o Sistema Nacional
                de Gestão Escolar.
              </p>
            </div>
          </div>
        )}
      </div>
    </CollapsibleSidebar>
  );
}
