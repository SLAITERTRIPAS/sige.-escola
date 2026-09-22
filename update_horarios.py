import re

with open('src/views/PedagogicalDashboard.tsx', 'r') as f:
    c = f.read()

# Add state hooks just above the return
# But let's find the correct location, right after the new docente states
state_injection = """
  const [isScheduleGenerated, setIsScheduleGenerated] = useState(false);
  const [scheduleView, setScheduleView] = useState<'turma' | 'sala' | 'docente'>('turma');
  const [scheduleRegime, setScheduleRegime] = useState<'laboral' | 'pos-laboral'>('laboral');

  // Time slots mapping for schedule mock
  const scheduleSlots = [
    { t: '1º Tempo', laboral: '07:00 - 07:45', pos: '17:00 - 17:45', id: 1 },
    { t: '2º Tempo', laboral: '07:50 - 08:35', pos: '17:50 - 18:35', id: 2 },
    { t: '3º Tempo', laboral: '08:40 - 09:25', pos: '18:40 - 19:25', id: 3 },
    { isBreak: true, t: 'Intervalo', laboral: '09:25 - 09:45', pos: '19:25 - 19:40', id: 'break' },
    { t: '4º Tempo', laboral: '09:45 - 10:30', pos: '19:40 - 20:25', id: 4 },
    { t: '5º Tempo', laboral: '10:35 - 11:20', pos: '20:30 - 21:15', id: 5 },
  ];
"""

c = c.replace('  const displaySubjects = hasAreas ? [...csSubjects, ...mcnSubjects, ...aptpSubjects] : subjects;', '  const displaySubjects = hasAreas ? [...csSubjects, ...mcnSubjects, ...aptpSubjects] : subjects;\n' + state_injection)

# Now, we rewrite the 'horarios' tab rendering
horarios_block = """
        {activeTab === 'horarios' && (
          <div className="max-w-[100vw] mx-auto pb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Gerador de Horário (Docente, Salas & Turmas)</h2>
            <Card className="p-6 mb-6">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
                <p className="text-sm text-gray-500 mb-4 md:mb-0 max-w-lg">
                  Gestão de salas fixas por curso e salas comuns partilhadas (1º e 2º ano para disciplinas gerais).
                </p>
                <div className="flex flex-col sm:flex-row items-center gap-4">
                  <div className="flex bg-gray-100 rounded-lg p-1 border border-gray-200">
                    <button 
                      onClick={() => setScheduleView('turma')}
                      className={`px-4 py-1.5 text-sm font-medium rounded-md ${scheduleView === 'turma' ? 'bg-white text-gray-900 shadow-sm border border-gray-200' : 'text-gray-600 hover:text-gray-900'}`}
                    >
                      Estudantes (Turma)
                    </button>
                    <button 
                      onClick={() => setScheduleView('sala')}
                      className={`px-4 py-1.5 text-sm font-medium rounded-md ${scheduleView === 'sala' ? 'bg-white text-gray-900 shadow-sm border border-gray-200' : 'text-gray-600 hover:text-gray-900'}`}
                    >
                      Salas de Aula
                    </button>
                    <button 
                      onClick={() => setScheduleView('docente')}
                      className={`px-4 py-1.5 text-sm font-medium rounded-md ${scheduleView === 'docente' ? 'bg-white text-gray-900 shadow-sm border border-gray-200' : 'text-gray-600 hover:text-gray-900'}`}
                    >
                      Docente
                    </button>
                  </div>
                  <div className="flex bg-gray-100 rounded-lg p-1 border border-gray-200">
                    <button 
                      onClick={() => setScheduleRegime('laboral')}
                      className={`px-4 py-1.5 text-sm font-medium rounded-md flex items-center gap-2 ${scheduleRegime === 'laboral' ? 'bg-white text-gray-900 shadow-sm border border-gray-200' : 'text-gray-600 hover:text-gray-900'}`}
                    >
                      ☀️ Laboral
                    </button>
                    <button 
                      onClick={() => setScheduleRegime('pos-laboral')}
                      className={`px-4 py-1.5 text-sm font-medium rounded-md flex items-center gap-2 ${scheduleRegime === 'pos-laboral' ? 'bg-white text-gray-900 shadow-sm border border-gray-200' : 'text-gray-600 hover:text-gray-900'}`}
                    >
                      🌙 Pós-Laboral
                    </button>
                  </div>
                  <Button onClick={() => setIsScheduleGenerated(true)} className="bg-blue-800 hover:bg-blue-900 text-white flex items-center gap-2">
                    <CalendarDays className="h-4 w-4" /> Gerar Horário
                  </Button>
                </div>
              </div>

              {!isScheduleGenerated ? (
                <div className="text-center py-16 border-t border-gray-100 mt-6">
                  <CalendarDays className="h-16 w-16 text-blue-400 mx-auto mb-6" />
                  <h3 className="text-xl font-bold text-blue-900 mb-2">Geração de Horários Académicos</h3>
                  <p className="text-gray-600 max-w-xl mx-auto mb-8 text-sm">
                    Clique em "Gerar Horário" para construir automaticamente os horários de estudantes (turmas), salas de aula (comuns e fixas) e docentes.
                  </p>
                  <Button onClick={() => setIsScheduleGenerated(true)} className="bg-blue-800 hover:bg-blue-900 text-white px-8 py-2">
                    Gerar Horário Agora
                  </Button>
                </div>
              ) : (
                <div className="mt-8 animate-in fade-in slide-in-from-bottom-4 duration-500 border-t border-gray-100 pt-8">
                  <div className="flex justify-between items-center mb-6">
                     <h3 className="text-xl font-bold text-gray-900">
                        {scheduleView === 'docente' ? 'Horário do Docente (Ex: Prof. João Silva)' : 'Horário da Turma / Sala (Ex: 10ª Classe A - Sala 12)'}
                     </h3>
                     <div className="flex gap-2">
                       <Button variant="outline" className="border-gray-300 gap-2">
                         <Printer className="h-4 w-4" /> Imprimir
                       </Button>
                     </div>
                  </div>
                  
                  <div className="overflow-x-auto rounded-lg border border-gray-200 shadow-sm">
                     <table className="w-full text-sm text-left border-collapse">
                       <thead className="bg-blue-50 text-blue-900 border-b border-blue-100">
                         <tr>
                           <th className="px-4 py-4 font-bold border-r border-blue-100 w-40">Tempo / Hora</th>
                           <th className="px-4 py-4 font-bold border-r border-blue-100 text-center uppercase text-xs tracking-wider">Segunda-feira</th>
                           <th className="px-4 py-4 font-bold border-r border-blue-100 text-center uppercase text-xs tracking-wider">Terça-feira</th>
                           <th className="px-4 py-4 font-bold border-r border-blue-100 text-center uppercase text-xs tracking-wider">Quarta-feira</th>
                           <th className="px-4 py-4 font-bold border-r border-blue-100 text-center uppercase text-xs tracking-wider">Quinta-feira</th>
                           <th className="px-4 py-4 font-bold text-center uppercase text-xs tracking-wider">Sexta-feira</th>
                         </tr>
                       </thead>
                       <tbody>
                         {scheduleSlots.map((row, i) => (
                           row.isBreak ? (
                             <tr key={row.id} className="bg-gray-100/50 border-b border-gray-200">
                               <td className="px-4 py-3 font-medium text-gray-700 border-r border-gray-200 text-center italic" colSpan={6}>
                                 {row.t} ({scheduleRegime === 'laboral' ? row.laboral : row.pos})
                               </td>
                             </tr>
                           ) : (
                             <tr key={row.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                               <td className="px-4 py-4 border-r border-gray-100 bg-gray-50/50">
                                 <div className="font-bold text-gray-900">{row.t}</div>
                                 <div className="text-xs text-gray-500 font-medium">{scheduleRegime === 'laboral' ? row.laboral : row.pos}</div>
                               </td>
                               {['Seg', 'Ter', 'Qua', 'Qui', 'Sex'].map(day => (
                                 <td key={day} className="px-4 py-4 border-r border-gray-100 text-center">
                                    {scheduleView === 'docente' ? (
                                       <div className="flex flex-col items-center justify-center p-2 rounded-md bg-white border border-gray-100 shadow-sm">
                                         <span className="font-bold text-blue-800">10ª Classe {['A','B','C'][Math.floor(Math.random()*3)]}</span>
                                         <span className="text-xs text-gray-500 mt-1">Sala {Math.floor(Math.random() * 20) + 1}</span>
                                       </div>
                                    ) : (
                                       <div className="flex flex-col items-center justify-center p-2 rounded-md bg-white border border-gray-100 shadow-sm">
                                         <span className="font-bold text-blue-800">{['Matemática', 'Português', 'Física', 'Química', 'Biologia', 'História'][Math.floor(Math.random()*6)]}</span>
                                         <span className="text-xs text-gray-500 mt-1">Prof. {['Silva', 'Costa', 'Santos', 'Macamo', 'Sitoe'][Math.floor(Math.random()*5)]}</span>
                                       </div>
                                    )}
                                 </td>
                               ))}
                             </tr>
                           )
                         ))}
                       </tbody>
                     </table>
                  </div>
                </div>
              )}
            </Card>
          </div>
        )}
"""

horarios_regex = re.compile(r'        {activeTab === \'horarios\' && \(\s*<div.*?</div>\s*\)}\s*        {activeTab === \'disciplinas\' && \(', re.DOTALL)
c = horarios_regex.sub(horarios_block + '        {activeTab === \'disciplinas\' && (', c)

with open('src/views/PedagogicalDashboard.tsx', 'w') as f:
    f.write(c)

