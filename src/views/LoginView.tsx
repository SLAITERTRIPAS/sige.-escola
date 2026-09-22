import React from 'react';
import { useStore } from '../store';
import { Card } from '../components/ui';

export function LoginView() {
  const { login } = useStore();

  const handleQuickLogin = (quickEmail: string) => {
    login(quickEmail);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <img 
          src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQua66hW5lOO75LXVLwiJWQJKtgoRJzX58EUSAAc2QdYQ&s=10" 
          alt="República de Moçambique" 
          className="mx-auto h-20 w-20 mb-3 object-contain" 
          referrerPolicy="no-referrer"
        />
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          EduGestão
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Sistema Completo de Gestão Escolar
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <Card className="px-4 py-8 sm:px-10">
          <div className="border-b border-gray-200 pb-6 mb-6">
            <h3 className="text-xs font-bold uppercase text-gray-500 tracking-wider text-center">Selecionar Utilizador de Teste:</h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => handleQuickLogin('admin@escola.com')}
                className="col-span-full px-3 py-2.5 text-sm rounded-lg bg-slate-900 text-white hover:bg-slate-800 transition-all font-bold flex items-center justify-center gap-2 shadow-sm border border-slate-700"
              >
                <span>🛡️ Administrador Geral</span>
              </button>

              <button
                type="button"
                onClick={() => handleQuickLogin('secretaria@escola.com')}
                className="px-3 py-2 text-sm rounded-lg bg-emerald-50 text-emerald-800 hover:bg-emerald-100 transition-all border border-emerald-200 font-bold flex items-center gap-2"
              >
                <span>📋 Secretaria</span>
              </button>

              <button
                type="button"
                onClick={() => handleQuickLogin('pedagogico@escola.com')}
                className="px-3 py-2 text-sm rounded-lg bg-blue-50 text-blue-800 hover:bg-blue-100 transition-all border border-blue-200 font-bold flex items-center gap-2"
              >
                <span>🎓 Pedagógico</span>
              </button>

              <button
                type="button"
                onClick={() => handleQuickLogin('aluno@escola.com')}
                className="px-3 py-2 text-sm rounded-lg bg-cyan-50 text-cyan-800 hover:bg-cyan-100 transition-all border border-cyan-200 font-bold flex items-center gap-2"
              >
                <span>🎓 Aluno</span>
              </button>

              <button
                type="button"
                onClick={() => handleQuickLogin('professor@escola.com')}
                className="px-3 py-2 text-sm rounded-lg bg-amber-50 text-amber-800 hover:bg-amber-100 transition-all border border-amber-200 font-bold flex items-center gap-2"
              >
                <span>👨‍🏫 Professor</span>
              </button>

              <button
                type="button"
                onClick={() => handleQuickLogin('diretor@escola.com')}
                className="px-3 py-2 text-sm rounded-lg bg-indigo-50 text-indigo-800 hover:bg-indigo-100 transition-all border border-indigo-200 font-bold flex items-center gap-2"
              >
                <span>🏛️ Diretor</span>
              </button>

              <button
                type="button"
                onClick={() => handleQuickLogin('distrital@gov.mz')}
                className="px-3 py-2 text-sm rounded-lg bg-slate-100 text-slate-800 hover:bg-slate-200 transition-all border border-slate-300 font-bold flex items-center gap-2"
              >
                <span>🏘️ Distrital</span>
              </button>

              <button
                type="button"
                onClick={() => handleQuickLogin('provincial@gov.mz')}
                className="px-3 py-2 text-sm rounded-lg bg-slate-100 text-slate-800 hover:bg-slate-200 transition-all border border-slate-300 font-bold flex items-center gap-2"
              >
                <span>📍 Provincial</span>
              </button>

              <button
                type="button"
                onClick={() => handleQuickLogin('ministro@gov.mz')}
                className="px-3 py-2 text-sm rounded-lg bg-slate-100 text-slate-800 hover:bg-slate-200 transition-all border border-slate-300 font-bold flex items-center gap-2"
              >
                <span>🌍 Nacional</span>
              </button>
            </div>
        </Card>
      </div>
    </div>
  );
}
