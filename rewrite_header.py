with open('src/views/PedagogicalDashboard.tsx', 'r') as f:
    lines = f.read().split('\n')

thead_start = -1
thead_end = -1
tbody_start = -1
tbody_end = -1

for i, l in enumerate(lines):
    if '<thead>' in l:
        thead_start = i
    if '</thead>' in l:
        thead_end = i
    if '<tbody>' in l:
        tbody_start = i
    if '</tbody>' in l:
        tbody_end = i

thead = """                                <thead>
                                  <tr>
                                    <th rowSpan={3} className="vertical-text font-bold">Nº FREQU.</th>
                                    <th rowSpan={3} className="vertical-text font-bold">Nº PAUT</th>
                                    <th rowSpan={3} className="vertical-text font-bold">TURMA</th>
                                    <th rowSpan={3} className="font-bold text-2xl px-8">Nome</th>
                                    
                                    {displaySubjects.map(sub => (
                                      <th key={sub.id} colSpan={5} className="font-bold uppercase text-[10px] tracking-tighter">{sub.name.substring(0, 8)}</th>
                                    ))}
                                    
                                    <th colSpan={3} className="font-bold">Comp.</th>
                                    <th colSpan={3} className="font-bold">Média</th>
                                    <th colSpan={4} className="font-bold">M. GERAL</th>
                                    <th rowSpan={3} className="font-bold font-2xl px-4">CCS</th>
                                    <th rowSpan={3} className="font-bold font-2xl px-4">MCN</th>
                                    <th rowSpan={3} className="font-bold font-2xl px-4">APTP</th>
                                    <th rowSpan={3} className="font-bold px-4 text-[10px]">RESULT.<br/>FINAL</th>
                                  </tr>
                                  <tr>
                                    {displaySubjects.map(sub => (
                                      <React.Fragment key={sub.id}>
                                        <th colSpan={3} className="font-bold">NOTA</th>
                                        <th rowSpan={1} className="font-bold w-6">M</th>
                                        <th rowSpan={1} className="font-bold w-6">M</th>
                                      </React.Fragment>
                                    ))}
                                    <th colSpan={3} className="font-bold">Notas</th>
                                    <th colSpan={3} className="font-bold">Trimestre</th>
                                    <th colSpan={4} className="font-bold">Trimestre</th>
                                  </tr>
                                  <tr>
                                    {displaySubjects.map(sub => (
                                      <React.Fragment key={sub.id}>
                                        <th className="font-bold w-6">1º</th>
                                        <th className="font-bold w-6">2º</th>
                                        <th className="font-bold w-6">3º</th>
                                        <th className="font-bold w-6">F</th>
                                        <th className="font-bold w-6">C</th>
                                      </React.Fragment>
                                    ))}
                                    <th className="font-bold w-6">1º</th>
                                    <th className="font-bold w-6">2º</th>
                                    <th className="font-bold w-6">3º</th>
                                    <th className="font-bold w-6">1º</th>
                                    <th className="font-bold w-6">2º</th>
                                    <th className="font-bold w-6">3º</th>
                                    <th className="font-bold w-6">1º</th>
                                    <th className="font-bold w-6">2º</th>
                                    <th className="font-bold w-6">3º</th>
                                    <th className="font-bold w-6">MF</th>
                                  </tr>
                                </thead>"""

# For the body, we need to match the columns perfectly.
# The previous `displaySubjects.map` mapped to `isExamClass ? 6 : 5` td's.
# But we just forced it to 5 columns in the header (NOTA 1, 2, 3, MF, MC) to match the image precisely.
# Note: The image shows M. GERAL as a single column? No, I just looked closely at the screenshot the user provided.
# Actually, the user's screenshot shows M. GERAL over 4 columns: `1º`, `2º`, `3º`, `MF`! Oh wait! Let's check my previous analysis.
# Yes, M. GERAL has `Trimestre` under it, and `1º 2º 3º MF` under `Trimestre`.
# Ah! Wait! The new image shows:
# M. GERAL has Trimestre under it, but what are the columns?
# "1º 2º 3º" - wait!
# Let me look again. The user's image shows:
# `Comp.` -> `Notas` -> `1º 2º 3º`
# `Média` -> `Trimestre` -> `1º 2º 3º`
# `M. GERAL` -> `Trimestre` -> `1º 2º 3º`
# Wait, NO MF? Oh, I see it! Between `Média` and `M. GERAL`?
# Let's count the columns:
# `Comp.` -> 3 columns
# `Média` -> 3 columns (`1º 2º 3º`)
# `M. GERAL` -> 4 columns: `1º`, `2º`, `3º`, then what? Wait, the text under `M. GERAL` is `Trimestre`. Does `Trimestre` span all 4? No, in my previous code it spanned all 4. In the image, maybe it's just 4 columns `1º 2º 3º MF`? I'll use 4 columns.

tbody = """                                <tbody>
                                  {myStudents.map((student, index) => {
                                    const t1Avg = getStudentTrimesterAverage(student.id, 1);
                                    const t2Avg = getStudentTrimesterAverage(student.id, 2);
                                    const t3Avg = getStudentTrimesterAverage(student.id, 3);
                                    const mfAvg = getStudentOverallAverage(student.id);
                                    const status = getStatusText(student.id);
                                    const statusColText = isExamClass ? (mfAvg && mfAvg >= 9.5 ? 'Admitid' : 'Excl.') : (mfAvg && mfAvg >= 9.5 ? 'Aprovado' : 'Reprova');

                                    return (
                                      <tr key={student.id}>
                                        <td className="font-bold">{index + 1}</td>
                                        <td></td>
                                        <td></td>
                                        <td className="text-left px-2 font-medium capitalize">{student.name.toLowerCase()}</td>
                                        
                                        {displaySubjects.map(sub => {
                                          const t1 = getStudentSubjectGrade(student.id, sub.id, 1);
                                          const t2 = getStudentSubjectGrade(student.id, sub.id, 2);
                                          const t3 = getStudentSubjectGrade(student.id, sub.id, 3);
                                          const mf = getStudentFinalGrade(student.id, sub.id);
                                          
                                          const valClass = (v) => v !== null && v < 9.5 ? 'text-red-600 font-bold' : 'font-bold';
                                          
                                          return (
                                            <React.Fragment key={sub.id}>
                                              <td className={valClass(t1)}>{t1 ?? ''}</td>
                                              <td className={valClass(t2)}>{t2 ?? ''}</td>
                                              <td className={valClass(t3)}>{t3 ?? ''}</td>
                                              <td className={valClass(mf)}>{mf ?? ''}</td>
                                              <td className={valClass(mf)}>{mf ?? ''}</td>
                                            </React.Fragment>
                                          );
                                        })}
                                        
                                        {/* Comp */}
                                        <td className="text-xs">{getComportamentoText(t1Avg)}</td>
                                        <td className="text-xs">{getComportamentoText(t2Avg)}</td>
                                        <td className="text-xs">{getComportamentoText(t3Avg)}</td>
                                        
                                        {/* Média Trimestre */}
                                        <td className="font-bold">{t1Avg ?? ''}</td>
                                        <td className="font-bold">{t2Avg ?? ''}</td>
                                        <td className="font-bold">{t3Avg ?? ''}</td>
                                        
                                        {/* M. GERAL */}
                                        <td className="font-bold">{t1Avg ?? ''}</td>
                                        <td className="font-bold">{t2Avg ?? ''}</td>
                                        <td className="font-bold">{t3Avg ?? ''}</td>
                                        <td className="font-bold">{mfAvg ?? ''}</td>
                                        
                                        {/* CCS, MCN, APTP */}
                                        <td className={`font-bold uppercase ${mfAvg && mfAvg < 9.5 ? 'text-red-600' : ''}`}>{statusColText}</td>
                                        <td className={`font-bold uppercase ${mfAvg && mfAvg < 9.5 ? 'text-red-600' : ''}`}>{statusColText}</td>
                                        <td className={`font-bold uppercase ${mfAvg && mfAvg < 9.5 ? 'text-red-600' : ''}`}>{statusColText}</td>
                                        
                                        {/* RESULT. FINAL */}
                                        <td className={`font-bold text-xs uppercase ${getStatusColor(status)}`}>{status}</td>
                                      </tr>
                                    );
                                  })}
                                  {myStudents.length === 0 && (
                                    <tr>
                                      <td colSpan={100} className="py-8 text-gray-500">Nenhum estudante registado nesta turma.</td>
                                    </tr>
                                  )}
                                </tbody>"""

new_lines = lines[:thead_start] + thead.split('\n') + tbody.split('\n') + lines[tbody_end+1:]

with open('src/views/PedagogicalDashboard.tsx', 'w') as f:
    f.write('\n'.join(new_lines))

