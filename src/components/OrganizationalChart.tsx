import React from 'react';
import { useStore } from '../store';
import { Card, Button } from './ui';
import { 
  Building2, Users, UserCheck, ShieldCheck, 
  ChevronDown, ArrowDown, Award, Briefcase, 
  BookOpen, DollarSign, Package, Archive, PhoneCall, CheckCircle
} from 'lucide-react';

export function OrganizationalChart() {
  const { currentSchool, employees } = useStore();

  const getEmpByRole = (roleFunc: string) => {
    return employees.find(e => 
      e.roleFunction?.toLowerCase().includes(roleFunc.toLowerCase()) ||
      e.career?.toLowerCase().includes(roleFunc.toLowerCase()) ||
      e.department?.toLowerCase().includes(roleFunc.toLowerCase())
    );
  };

  const director = getEmpByRole('Director') || { name: 'Dr. Armando Sitoe', academicLevel: 'Mestrado em Gestão Educacional', career: 'Director da Escola' };
  const dap = getEmpByRole('Pedagógico') || { name: 'Prof. Sérgio Cossa', academicLevel: 'Licenciatura em Ciências da Educação', career: 'Director Adjunto Pedagógico (DAP)' };
  const dac = getEmpByRole('Chefe da Secretaria') || { name: 'Dra. Elsa Tembe', academicLevel: 'Licenciatura em Administração Pública', career: 'Chefe da Secretaria' };
  const rh = getEmpByRole('Recursos Humanos') || { name: 'Dra. Lurdes Macamo', academicLevel: 'Técnica Superior', career: 'Responsável de Recursos Humanos' };
  const tesoureiro = getEmpByRole('Finanças') || getEmpByRole('Tesouraria') || { name: 'Sr. Jacinto Matusse', academicLevel: 'Técnico de Finanças', career: 'Tesoureiro e Gestor Financeiro' };
  const patrimonio = getEmpByRole('Património') || { name: 'Sr. Alberto Zandamela', academicLevel: 'Técnico de Logística', career: 'Gestor de Património e Infraestruturas' };
  const recepcionista = getEmpByRole('Recepção') || { name: 'Sra. Teresa Nhantumbo', academicLevel: 'Técnica de Atendimento', career: 'Oficial de Recepção e Portaria' };
  const arquivista = getEmpByRole('Arquivo') || { name: 'Sr. Bernardo Mondlane', academicLevel: 'Técnico Documentalista', career: 'Arquivista e Gestor de Processos' };
  const bibliotecario = getEmpByRole('Biblioteca') || { name: 'Dra. Graça Sumbane', academicLevel: 'Licenciatura em Biblioteconomia', career: 'Responsável da Biblioteca Escolar' };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white p-6 rounded-2xl shadow-md">
        <div>
          <div className="flex items-center gap-2 mb-1 text-indigo-300 text-xs font-bold uppercase tracking-wider">
            <Building2 className="w-4 h-4" />
            <span>EduGestão • Estrutura Orgânica & Organograma Institucional</span>
          </div>
          <h1 className="text-2xl font-bold">Organograma Escolar Oficial</h1>
          <p className="text-indigo-100/80 text-sm mt-1">
            Hierarquia orgânica da instituição escolar em conformidade com o Regulamento Geral do Ensino Básico e Secundário de Moçambique.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button onClick={() => window.print()} variant="outline" className="text-white border-white/30 hover:bg-white/10 text-xs font-bold">
            Imprimir Organograma
          </Button>
        </div>
      </div>

      {/* Org Chart Tree Container */}
      <div className="bg-white p-6 md:p-8 rounded-2xl border border-slate-200 shadow-sm overflow-x-auto">
        <div className="min-w-[900px] flex flex-col items-center space-y-6">
          
          {/* Level 1: Conselho de Escola */}
          <div className="flex flex-col items-center">
            <div className="bg-amber-600 text-white p-4 rounded-xl shadow-md text-center w-80 border-2 border-amber-400">
              <span className="text-[10px] uppercase font-black tracking-widest text-amber-200 block">Órgão Máximo Deliberativo</span>
              <h3 className="font-extrabold text-base">Conselho da Escola</h3>
              <p className="text-xs text-amber-100 mt-1">Representantes de Pais, Comunidade, Professores e Alunos</p>
            </div>
            <div className="w-0.5 h-6 bg-slate-300"></div>
          </div>

          {/* Level 2: Director da Escola */}
          <div className="flex flex-col items-center">
            <div className="bg-indigo-900 text-white p-5 rounded-2xl shadow-lg text-center w-96 border-2 border-indigo-400 relative">
              <span className="text-[10px] uppercase font-black tracking-widest text-indigo-300 block">Direcção Executiva</span>
              <h3 className="font-black text-lg mt-0.5">Director da Escola</h3>
              <div className="mt-2 bg-indigo-950/60 p-2.5 rounded-lg border border-indigo-800 text-left flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-indigo-700 flex items-center justify-center font-bold text-sm">
                  {director.name.split(' ').map(n => n[0]).slice(0, 2).join('')}
                </div>
                <div>
                  <p className="font-bold text-sm text-white">{director.name}</p>
                  <p className="text-xs text-indigo-300">{director.academicLevel || 'Direcção Geral'}</p>
                </div>
              </div>
            </div>
            <div className="w-0.5 h-8 bg-slate-300"></div>
          </div>

          {/* Horizontal Splitter */}
          <div className="w-3/4 border-t-2 border-slate-300 relative flex justify-between">
            <div className="w-0.5 h-6 bg-slate-300 -mt-0"></div>
            <div className="w-0.5 h-6 bg-slate-300 -mt-0"></div>
          </div>

          {/* Level 3: DAP & Chefe da Secretaria */}
          <div className="grid grid-cols-2 gap-12 w-full max-w-4xl">
            
            {/* Sector Pedagógico */}
            <div className="flex flex-col items-center">
              <div className="bg-teal-800 text-white p-4 rounded-xl shadow-md w-full border border-teal-600">
                <span className="text-[10px] uppercase font-bold text-teal-300 block">Sector Pedagógico</span>
                <h4 className="font-bold text-base">Director Adjunto Pedagógico (DAP)</h4>
                <div className="mt-2 bg-teal-900/60 p-2 rounded text-xs">
                  <p className="font-bold text-white">{dap.name}</p>
                  <p className="text-teal-200 text-[11px]">{dap.academicLevel || 'Coordenação Pedagógica'}</p>
                </div>
              </div>

              <div className="w-0.5 h-6 bg-slate-300"></div>

              {/* Sub-pedagógico branches */}
              <div className="w-full space-y-2">
                <div className="bg-slate-50 border border-slate-200 p-3 rounded-lg text-xs">
                  <span className="font-bold text-slate-800 flex items-center gap-1">
                    <BookOpen className="w-3.5 h-3.5 text-teal-600" />
                    Delegados de Disciplina & Classes
                  </span>
                  <p className="text-slate-500 text-[11px] mt-0.5">Grupos de Matemática, Português, Ciências, etc.</p>
                </div>

                <div className="bg-slate-50 border border-slate-200 p-3 rounded-lg text-xs">
                  <span className="font-bold text-slate-800 flex items-center gap-1">
                    <Users className="w-3.5 h-3.5 text-teal-600" />
                    Directores de Turma
                  </span>
                  <p className="text-slate-500 text-[11px] mt-0.5">Acompanhamento directo de turmas e encarregados</p>
                </div>

                <div className="bg-purple-50 border border-purple-200 p-3 rounded-lg text-xs">
                  <span className="font-bold text-purple-900 flex items-center gap-1">
                    <BookOpen className="w-3.5 h-3.5 text-purple-600" />
                    Biblioteca Escolar
                  </span>
                  <p className="text-purple-700 text-[11px] mt-0.5">Titular: <strong>{bibliotecario.name}</strong></p>
                </div>
              </div>
            </div>

            {/* Sector da Secretaria e Administração */}
            <div className="flex flex-col items-center">
              <div className="bg-slate-800 text-white p-4 rounded-xl shadow-md w-full border border-slate-600">
                <span className="text-[10px] uppercase font-bold text-slate-300 block">Administração Escolar</span>
                <h4 className="font-bold text-base">Chefe da Secretaria Geral</h4>
                <div className="mt-2 bg-slate-900/80 p-2 rounded text-xs">
                  <p className="font-bold text-white">{dac.name}</p>
                  <p className="text-slate-300 text-[11px]">{dac.academicLevel || 'Chefia Administrativa'}</p>
                </div>
              </div>

              <div className="w-0.5 h-6 bg-slate-300"></div>

              {/* Sub-secretaria branches (User's specific request for Secretaria sub-roles) */}
              <div className="w-full space-y-2">
                <div className="bg-teal-50 border border-teal-200 p-2.5 rounded-lg text-xs">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-teal-900 flex items-center gap-1">
                      <Users className="w-3.5 h-3.5 text-teal-600" /> Recursos Humanos (RH)
                    </span>
                    <span className="text-[10px] bg-teal-100 text-teal-800 px-1.5 py-0.5 rounded font-semibold">Alocado</span>
                  </div>
                  <p className="text-slate-600 text-[11px] mt-0.5 font-medium">{rh.name}</p>
                </div>

                <div className="bg-emerald-50 border border-emerald-200 p-2.5 rounded-lg text-xs">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-emerald-900 flex items-center gap-1">
                      <DollarSign className="w-3.5 h-3.5 text-emerald-600" /> Finanças & Tesouraria
                    </span>
                    <span className="text-[10px] bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded font-semibold">Alocado</span>
                  </div>
                  <p className="text-slate-600 text-[11px] mt-0.5 font-medium">{tesoureiro.name}</p>
                </div>

                <div className="bg-amber-50 border border-amber-200 p-2.5 rounded-lg text-xs">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-amber-900 flex items-center gap-1">
                      <Package className="w-3.5 h-3.5 text-amber-600" /> Património & Logística
                    </span>
                    <span className="text-[10px] bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded font-semibold">Alocado</span>
                  </div>
                  <p className="text-slate-600 text-[11px] mt-0.5 font-medium">{patrimonio.name}</p>
                </div>

                <div className="bg-sky-50 border border-sky-200 p-2.5 rounded-lg text-xs">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-sky-900 flex items-center gap-1">
                      <PhoneCall className="w-3.5 h-3.5 text-sky-600" /> Recepção & Atendimento
                    </span>
                    <span className="text-[10px] bg-sky-100 text-sky-800 px-1.5 py-0.5 rounded font-semibold">Alocado</span>
                  </div>
                  <p className="text-slate-600 text-[11px] mt-0.5 font-medium">{recepcionista.name}</p>
                </div>

                <div className="bg-slate-100 border border-slate-200 p-2.5 rounded-lg text-xs">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-slate-800 flex items-center gap-1">
                      <Archive className="w-3.5 h-3.5 text-slate-600" /> Arquivo Geral & Processos
                    </span>
                    <span className="text-[10px] bg-slate-200 text-slate-700 px-1.5 py-0.5 rounded font-semibold">Alocado</span>
                  </div>
                  <p className="text-slate-600 text-[11px] mt-0.5 font-medium">{arquivista.name}</p>
                </div>
              </div>
            </div>

          </div>

        </div>
      </div>
    </div>
  );
}
