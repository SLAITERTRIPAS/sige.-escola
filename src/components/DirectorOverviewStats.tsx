import { useState } from "react";
import { useStore } from "../store";
import { Card, Button } from "./ui";
import { Users, GraduationCap, ChevronLeft, ArrowRight } from "lucide-react";

export function DirectorOverviewStats() {
  const { employees, students } = useStore();
  const [view, setView] = useState<'root' | 'employees' | 'employee-details' | 'students'>('root');
  const [activeEmpType, setActiveEmpType] = useState<'docents' | 'cta' | null>(null);

  // Employee Stats
  const docents = employees.filter((e) => e.roleFunction === "Professor" || e.career === "Docente");
  const cta = employees.filter((e) => !docents.includes(e));
  
  const maleDocents = docents.filter((e) => e.gender === "M").length;
  const femaleDocents = docents.filter((e) => e.gender === "F").length;
  
  const maleCTA = cta.filter((e) => e.gender === "M").length;
  const femaleCTA = cta.filter((e) => e.gender === "F").length;

  // Student Stats
  const totalStudents = students.length;
  const newAdmission = students.filter((s) => s.entryType === "novo_ingresso").length;
  const finalists = students.filter((s) => s.enrollmentStatus === "Concluído").length;
  const maleStudents = students.filter((s) => s.gender === "M").length;
  const femaleStudents = students.filter((s) => s.gender === "F").length;

  const renderContent = () => {
    switch (view) {
      case 'root':
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="p-6 cursor-pointer hover:shadow-md transition-shadow" onClick={() => setView('employees')}>
              <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2 justify-between">
                <span className="flex items-center gap-2"><Users className="text-blue-600 h-5 w-5" /> Colaboradores</span>
                <ArrowRight className="h-4 w-4 text-gray-400" />
              </h3>
            </Card>
            <Card className="p-6 cursor-pointer hover:shadow-md transition-shadow" onClick={() => setView('students')}>
              <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2 justify-between">
                <span className="flex items-center gap-2"><GraduationCap className="text-emerald-600 h-5 w-5" /> Corpo Discente</span>
                <ArrowRight className="h-4 w-4 text-gray-400" />
              </h3>
            </Card>
          </div>
        );
      case 'employees':
        return (
          <div className="space-y-4">
            <Button variant="outline" onClick={() => setView('root')} className="mb-4 gap-2">
              <ChevronLeft className="h-4 w-4" /> Voltar
            </Button>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="p-6 cursor-pointer hover:shadow-md transition-shadow" onClick={() => { setActiveEmpType('docents'); setView('employee-details'); }}>
                <h3 className="text-lg font-bold text-gray-900">Docentes ({docents.length})</h3>
              </Card>
              <Card className="p-6 cursor-pointer hover:shadow-md transition-shadow" onClick={() => { setActiveEmpType('cta'); setView('employee-details'); }}>
                <h3 className="text-lg font-bold text-gray-900">CTA ({cta.length})</h3>
              </Card>
            </div>
          </div>
        );
      case 'employee-details':
        const emps = activeEmpType === 'docents' ? docents : cta;
        const data = { title: activeEmpType === 'docents' ? 'Docentes' : 'CTA', total: emps.length, m: activeEmpType === 'docents' ? maleDocents : maleCTA, f: activeEmpType === 'docents' ? femaleDocents : femaleCTA };
        
        // Grouping by academic level and training area
        const byLevel = emps.reduce((acc, e) => { acc[e.academicLevel || 'N/A'] = (acc[e.academicLevel || 'N/A'] || 0) + 1; return acc; }, {} as Record<string, number>);
        const byArea = emps.reduce((acc, e) => { acc[e.specialization || 'N/A'] = (acc[e.specialization || 'N/A'] || 0) + 1; return acc; }, {} as Record<string, number>);

        return (
          <div className="space-y-4">
            <Button variant="outline" onClick={() => setView('employees')} className="mb-4 gap-2">
              <ChevronLeft className="h-4 w-4" /> Voltar
            </Button>
            <Card className="p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">{data.title}</h3>
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-slate-50 p-4 rounded-lg"><p className="text-sm text-gray-500">Total</p><p className="text-2xl font-bold">{data.total}</p></div>
                <div className="bg-slate-50 p-4 rounded-lg"><p className="text-sm text-gray-500">Género</p><p className="text-md font-bold">M: {data.m} | F: {data.f}</p></div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                      <h4 className="font-bold text-gray-900 mb-2">Por Nível Académico</h4>
                      {Object.entries(byLevel).map(([level, count]) => <p key={level} className="text-sm">{level}: {count}</p>)}
                  </div>
                  <div>
                      <h4 className="font-bold text-gray-900 mb-2">Por Área de Formação</h4>
                      {Object.entries(byArea).map(([area, count]) => <p key={area} className="text-sm">{area}: {count}</p>)}
                  </div>
              </div>
            </Card>
          </div>
        );
      case 'students':
        const getAge = (birthDate: string) => {
            const today = new Date();
            const birthDateObj = new Date(birthDate);
            let age = today.getFullYear() - birthDateObj.getFullYear();
            const m = today.getMonth() - birthDateObj.getMonth();
            if (m < 0 || (m === 0 && today.getDate() < birthDateObj.getDate())) age--;
            return age;
        };
        const studentStatsByAgeGender = students.reduce((acc, s) => {
            const age = s.birthDate ? getAge(s.birthDate) : 'N/A';
            const gender = s.gender || 'N/A';
            const key = `${age}-${gender}`;
            acc[key] = (acc[key] || 0) + 1;
            return acc;
        }, {} as Record<string, number>);

        return (
          <div className="space-y-4">
            <Button variant="outline" onClick={() => setView('root')} className="mb-4 gap-2">
              <ChevronLeft className="h-4 w-4" /> Voltar
            </Button>
            <Card className="p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Estatísticas do Corpo Discente</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-slate-50 p-4 rounded-lg"><p className="text-sm text-gray-500">Total</p><p className="text-2xl font-bold">{totalStudents}</p></div>
                <div className="bg-slate-50 p-4 rounded-lg"><p className="text-sm text-gray-500">Género</p><p className="text-md font-bold">M: {maleStudents} | F: {femaleStudents}</p></div>
                <div className="bg-slate-50 p-4 rounded-lg"><p className="text-sm text-gray-500">Novos</p><p className="text-2xl font-bold">{newAdmission}</p></div>
                <div className="bg-slate-50 p-4 rounded-lg"><p className="text-sm text-gray-500">Finalistas</p><p className="text-2xl font-bold">{finalists}</p></div>
              </div>
              <h4 className="font-bold text-gray-900 mb-2">Matriculados por Idade e Género</h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                {Object.entries(studentStatsByAgeGender).map(([key, count]) => {
                    const [age, gender] = key.split('-');
                    return <p key={key} className="text-sm bg-slate-50 p-2 rounded">{age} anos ({gender}): {count}</p>
                })}
              </div>
            </Card>
          </div>
        );
    }
  };

  return <div className="animate-in fade-in">{renderContent()}</div>;
}
