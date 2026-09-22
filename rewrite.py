import sys

def rewrite():
    with open('src/views/PedagogicalDashboard.tsx', 'r') as f:
        lines = f.read().split('\n')

    out = []
    
    # We find the return statement
    return_idx = -1
    for i, l in enumerate(lines):
        if l.startswith('  return ('):
            return_idx = i
            break
            
    if return_idx == -1:
        print("Error finding return")
        return

    # Add everything before return
    for i in range(return_idx):
        out.append(lines[i])
        
    out.append('  return (')
    out.append('    <div className="flex w-full">')
    out.append('      {/* Sidebar */}')
    out.append('      <div className="w-64 bg-white border-r border-gray-200 flex flex-col hidden md:flex no-print min-h-[calc(100vh-64px)]">')
    out.append('        <div className="p-4 border-b border-gray-200">')
    out.append('          <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">')
    out.append('            <BookOpen className="h-5 w-5" /> Pedagógica')
    out.append('          </h2>')
    out.append('        </div>')
    out.append('        <nav className="flex-1 p-4 space-y-6">')
    out.append('          <div>')
    out.append('            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Gestão Académica</h3>')
    out.append('            <button ')
    out.append('              onClick={() => setActiveTab(\'pautas\')}')
    out.append('              className={`w-full flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium ${activeTab === \'pautas\' ? \'bg-blue-50 text-blue-700\' : \'text-gray-700 hover:bg-gray-100\'}`}')
    out.append('            >')
    out.append('              <FileSpreadsheet className="h-4 w-4" /> Gestão de Pautas')
    out.append('            </button>')
    out.append('            <button ')
    out.append('              onClick={() => setActiveTab(\'horarios\')}')
    out.append('              className={`w-full flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium ${activeTab === \'horarios\' ? \'bg-blue-50 text-blue-700\' : \'text-gray-700 hover:bg-gray-100\'}`}')
    out.append('            >')
    out.append('              <CalendarDays className="h-4 w-4" /> Gestão de Horários')
    out.append('            </button>')
    out.append('            <button ')
    out.append('              onClick={() => setActiveTab(\'disciplinas\')}')
    out.append('              className={`w-full flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium ${activeTab === \'disciplinas\' ? \'bg-blue-50 text-blue-700\' : \'text-gray-700 hover:bg-gray-100\'}`}')
    out.append('            >')
    out.append('              <BookOpen className="h-4 w-4" /> Disciplinas & Exames')
    out.append('            </button>')
    out.append('            <button ')
    out.append('              onClick={() => setActiveTab(\'docentes\')}')
    out.append('              className={`w-full flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium ${activeTab === \'docentes\' ? \'bg-blue-50 text-blue-700\' : \'text-gray-700 hover:bg-gray-100\'}`}')
    out.append('            >')
    out.append('              <Users className="h-4 w-4" /> Gestão de Docentes')
    out.append('            </button>')
    out.append('          </div>')
    out.append('        </nav>')
    out.append('      </div>')
    out.append('')
    out.append('      {/* Main Content */}')
    out.append('      <div className="flex-1 overflow-y-auto p-8 bg-gray-50 min-h-[calc(100vh-64px)] custom-scrollbar">')
    
    # We need to extract the parts for each tab.
    # Currently they are inside details tags.
    # Pautas content:
    # 1. <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6"> ...
    # 2. {selectedClass && activeTab === 'pautas' && ( ... Card ... )}
    
    # Let's just write the raw JSX for each tab based on what we had.
    
    with open('src/views/PedagogicalDashboard.tsx', 'r') as f:
        full_content = f.read()

    # Extract Pautas filters:
    import re
    pautas_filters = re.search(r'<div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">.*?</div>\s*</div>\s*</details>', full_content, re.DOTALL)
    pautas_filters_jsx = pautas_filters.group(0).replace('</div>\n          </div>\n        </details>', '</div>')

    # Extract Pautas table:
    pautas_table = re.search(r'{selectedClass && activeTab === \'pautas\' && \(\s*<Card id="pauta-container".*?</Card>\s*\)}', full_content, re.DOTALL)
    
    # Extract Horarios content:
    horarios = re.search(r'<div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12">.*?</Button>\s*</div>\s*</div>', full_content, re.DOTALL)
    
    # Extract Disciplinas content:
    disciplinas = re.search(r'<div className="flex justify-between items-center mb-6">\s*<p className="text-sm text-gray-500">.*?</Card>\s*</div>', full_content, re.DOTALL)
    
    # Extract Docentes content:
    docentes = re.search(r'<div className="text-center py-8">\s*<Users className="h-16 w-16 text-gray-300 mx-auto mb-4" />.*?</Button>\s*</div>\s*</div>', full_content, re.DOTALL)
    
    out.append('        {activeTab === \'pautas\' && (')
    out.append('          <div className="max-w-[100vw] mx-auto pb-12">')
    out.append('            <h2 className="text-2xl font-bold text-gray-900 mb-6">Gestão de Pautas</h2>')
    out.append('            <Card className="p-6 mb-6">')
    
    out.append('              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">')
    
    # Just read from the original
    select_blocks = re.findall(r'<div(?:(?!<div).)*?<select(?:(?!</select>).)*?</select>\s*</div>', pautas_filters_jsx, re.DOTALL)
    for sb in select_blocks:
        out.extend(['              ' + line for line in sb.split('\n')])
        
    out.append('              </div>')
    out.append('            </Card>')
    out.append('')
    if pautas_table:
        out.extend(['            ' + line for line in pautas_table.group(0).replace("activeTab === 'pautas'", "true").split('\n')])
    
    out.append('          </div>')
    out.append('        )}')
    
    out.append('        {activeTab === \'horarios\' && (')
    out.append('          <div className="max-w-[100vw] mx-auto pb-12">')
    out.append('            <h2 className="text-2xl font-bold text-gray-900 mb-6">Gerador de Horário (Docente, Salas & Turmas)</h2>')
    out.append('            <Card className="p-6 mb-6">')
    if horarios:
        out.extend(['              ' + line for line in horarios.group(0).replace('</div>\n          </div>', '</div>').split('\n')])
    out.append('            </Card>')
    out.append('          </div>')
    out.append('        )}')

    out.append('        {activeTab === \'disciplinas\' && (')
    out.append('          <div className="max-w-[100vw] mx-auto pb-12">')
    out.append('            <h2 className="text-2xl font-bold text-gray-900 mb-6">Gestão de Disciplinas & Classificação de Exames</h2>')
    if disciplinas:
        out.extend(['            ' + line for line in disciplinas.group(0).replace('</div>\n        </details>', '').split('\n')])
    out.append('          </div>')
    out.append('        )}')

    out.append('        {activeTab === \'docentes\' && (')
    out.append('          <div className="max-w-[100vw] mx-auto pb-12">')
    out.append('            <h2 className="text-2xl font-bold text-gray-900 mb-6">Gestão de Docentes</h2>')
    out.append('            <Card className="p-6 mb-6">')
    if docentes:
        out.extend(['              ' + line for line in docentes.group(0).replace('</div>\n          </div>', '</div>').split('\n')])
    out.append('            </Card>')
    out.append('          </div>')
    out.append('        )}')

    out.append('      </div>')
    out.append('    </div>')
    out.append('  );')
    out.append('}')

    with open('src/views/PedagogicalDashboard.tsx', 'w') as f:
        f.write('\n'.join(out))

rewrite()
