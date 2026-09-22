import re

with open('src/views/PedagogicalDashboard.tsx', 'r') as f:
    c = f.read()

# Add states
states_str = """
  const [isAddingDocente, setIsAddingDocente] = useState(false);
  const [newDocente, setNewDocente] = useState({
    nome: '',
    email: '',
    telefone: '',
    ciclo: '',
    disciplina: '',
    classe: '',
  });
"""

c = c.replace('  const displaySubjects = hasAreas ? [...csSubjects, ...mcnSubjects, ...aptpSubjects] : subjects;', '  const displaySubjects = hasAreas ? [...csSubjects, ...mcnSubjects, ...aptpSubjects] : subjects;\n' + states_str)

# Docentes block
docentes_block = """
        {activeTab === 'docentes' && (
          <div className="max-w-[100vw] mx-auto pb-12">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Gestão de Docentes</h2>
              {!isAddingDocente && (
                <Button onClick={() => setIsAddingDocente(true)} className="bg-blue-600 hover:bg-blue-700 text-white">
                  + Adicionar Docente
                </Button>
              )}
            </div>

            {isAddingDocente ? (
              <Card className="p-6">
                <div className="flex justify-between items-center mb-6 border-b pb-4">
                  <h3 className="text-lg font-bold text-blue-900">Registo de Novo Docente</h3>
                  <Button variant="outline" onClick={() => setIsAddingDocente(false)}>
                    Fechar Formulário
                  </Button>
                </div>
                
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1">Nome Completo *</label>
                      <input 
                        type="text" 
                        className="block w-full rounded-md border-gray-300 border px-3 py-2 text-sm focus:border-blue-500 focus:ring-blue-500 bg-white" 
                        value={newDocente.nome}
                        onChange={e => setNewDocente({...newDocente, nome: e.target.value})}
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1">Email</label>
                      <input 
                        type="email" 
                        className="block w-full rounded-md border-gray-300 border px-3 py-2 text-sm focus:border-blue-500 focus:ring-blue-500 bg-white" 
                        value={newDocente.email}
                        onChange={e => setNewDocente({...newDocente, email: e.target.value})}
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1">Telefone</label>
                      <input 
                        type="tel" 
                        className="block w-full rounded-md border-gray-300 border px-3 py-2 text-sm focus:border-blue-500 focus:ring-blue-500 bg-white" 
                        value={newDocente.telefone}
                        onChange={e => setNewDocente({...newDocente, telefone: e.target.value})}
                      />
                    </div>
                  </div>

                  <h4 className="font-semibold text-gray-700 border-b pb-2 mt-8">Alocação Pedagógica</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1">Ciclo *</label>
                      <select 
                        className="block w-full rounded-md border-gray-300 border px-3 py-2 text-sm focus:border-blue-500 focus:ring-blue-500 bg-white"
                        value={newDocente.ciclo}
                        onChange={e => setNewDocente({...newDocente, ciclo: e.target.value})}
                      >
                        <option value="">Selecione o Ciclo</option>
                        {Array.from(new Set(classes.map(c => c.gradeLevel))).map(g => (
                          <option key={g} value={g}>{g}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1">Disciplina *</label>
                      <select 
                        className="block w-full rounded-md border-gray-300 border px-3 py-2 text-sm focus:border-blue-500 focus:ring-blue-500 bg-white"
                        value={newDocente.disciplina}
                        onChange={e => setNewDocente({...newDocente, disciplina: e.target.value})}
                      >
                        <option value="">Selecione a Disciplina</option>
                        {subjects.map(s => (
                          <option key={s.id} value={s.id}>{s.name}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1">Classe / Nível *</label>
                      <select 
                        className="block w-full rounded-md border-gray-300 border px-3 py-2 text-sm focus:border-blue-500 focus:ring-blue-500 bg-white"
                        value={newDocente.classe}
                        onChange={e => setNewDocente({...newDocente, classe: e.target.value})}
                      >
                        <option value="">Selecione a Classe</option>
                        {Array.from(new Set(classes.map(c => c.gradeLevel))).map(g => (
                          <option key={g} value={g}>{g}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="flex justify-end gap-3 pt-6 border-t mt-8">
                    <Button variant="outline" className="border-gray-300 text-gray-700 bg-white hover:bg-gray-50 rounded-full px-6" onClick={() => setIsAddingDocente(false)}>
                      Cancelar
                    </Button>
                    <Button className="bg-blue-600 hover:bg-blue-700 text-white rounded-full px-6" onClick={() => setIsAddingDocente(false)}>
                      Salvar Docente
                    </Button>
                  </div>
                </div>
              </Card>
            ) : (
              <Card className="p-6">
                <div className="text-center py-8">
                  <Users className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900">Nenhum Docente Registado</h3>
                  <p className="text-gray-500 mt-2 max-w-md mx-auto">
                    Utilize o botão "Adicionar Docente" no topo para começar a registar a equipa pedagógica e alocar disciplinas.
                  </p>
                </div>
              </Card>
            )}
          </div>
        )}
"""

docentes_regex = re.compile(r'        {activeTab === \'docentes\' && \(\s*<div.*?</div>\s*\)}\s*</div>\s*</div>\s*\);\s*}', re.DOTALL)
c = docentes_regex.sub(docentes_block + '\n      </div>\n    </div>\n  );\n}', c)

with open('src/views/PedagogicalDashboard.tsx', 'w') as f:
    f.write(c)

