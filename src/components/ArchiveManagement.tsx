import React, { useState } from 'react';
import { useStore } from '../store';
import { Card, Button, Input } from './ui';
import { 
  Archive, Plus, Search, Filter, Folder, FileText, 
  MapPin, CheckCircle, Clock, ShieldCheck, Download, 
  Printer, ArrowUpRight, Box, Layers
} from 'lucide-react';
import { ArchiveRecord } from '../types';

export function ArchiveManagement() {
  const { archiveRecords, addArchiveRecord, currentUser } = useStore();

  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [showAddModal, setShowAddModal] = useState(false);

  const [newRecordForm, setNewRecordForm] = useState({
    code: '',
    title: '',
    type: 'Processo Individual de Aluno' as ArchiveRecord['type'],
    year: new Date().getFullYear(),
    boxNumber: 'CX-01',
    shelfNumber: 'PRAT-03',
    room: 'Sala de Arquivo Geral A',
    status: 'Arquivado' as ArchiveRecord['status'],
    notes: ''
  });

  const filteredRecords = archiveRecords.filter(rec => {
    const matchesSearch = rec.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          rec.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          rec.boxNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          rec.shelfNumber?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = typeFilter === 'all' || rec.type === typeFilter;
    return matchesSearch && matchesType;
  });

  const handleAddRecord = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRecordForm.title) return;

    const generatedCode = newRecordForm.code.trim() || `ARQ-${newRecordForm.year}-${Math.floor(1000 + Math.random() * 9000)}`;

    addArchiveRecord({
      code: generatedCode,
      title: newRecordForm.title,
      type: newRecordForm.type,
      year: Number(newRecordForm.year) || new Date().getFullYear(),
      boxNumber: newRecordForm.boxNumber,
      shelfNumber: newRecordForm.shelfNumber,
      room: newRecordForm.room,
      status: newRecordForm.status,
      digitalFileUrl: undefined,
      notes: newRecordForm.notes
    });

    setShowAddModal(false);
    setNewRecordForm({
      code: '',
      title: '',
      type: 'Processo Individual de Aluno',
      year: new Date().getFullYear(),
      boxNumber: 'CX-01',
      shelfNumber: 'PRAT-03',
      room: 'Sala de Arquivo Geral A',
      status: 'Arquivado',
      notes: ''
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-emerald-950 via-slate-900 to-teal-900 text-white p-6 rounded-2xl shadow-md">
        <div>
          <div className="flex items-center gap-2 mb-1 text-emerald-300 text-xs font-bold uppercase tracking-wider">
            <Archive className="w-4 h-4" />
            <span>EduGestão • Arquivo Geral, Histórico & Custódia Documental</span>
          </div>
          <h1 className="text-2xl font-bold">Arquivo Histórico e Gestão de Processos</h1>
          <p className="text-emerald-100/80 text-sm mt-1">
            Localização física e digital de pastas de alunos, termos de exames nacionais, livros de matrículas e diplomas.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <Button 
            onClick={() => setShowAddModal(true)}
            className="bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold text-sm shadow-sm flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            <span>Arquivar Novo Processo</span>
          </Button>
          <Button 
            onClick={() => window.print()}
            variant="outline"
            className="text-white border-white/30 hover:bg-white/10 font-bold text-sm flex items-center gap-2"
          >
            <Printer className="w-4 h-4" />
            <span>Guia de Arquivo</span>
          </Button>
        </div>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="p-4 bg-white border border-slate-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-slate-500">Processos Registados</p>
              <p className="text-2xl font-bold text-slate-800">{archiveRecords.length}</p>
            </div>
            <div className="p-3 bg-emerald-50 rounded-xl text-emerald-600">
              <Folder className="w-5 h-5" />
            </div>
          </div>
          <p className="text-xs text-slate-500 mt-2">Pastas e Livros Oficiais</p>
        </Card>

        <Card className="p-4 bg-white border border-slate-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-slate-500">Processos de Alunos</p>
              <p className="text-2xl font-bold text-teal-700">
                {archiveRecords.filter(r => r.type === 'Processo Individual de Aluno').length}
              </p>
            </div>
            <div className="p-3 bg-teal-50 rounded-xl text-teal-600">
              <FileText className="w-5 h-5" />
            </div>
          </div>
          <p className="text-xs text-teal-600 mt-2 font-medium">Histórico Académico</p>
        </Card>

        <Card className="p-4 bg-white border border-slate-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-slate-500">Livros de Termos de Exames</p>
              <p className="text-2xl font-bold text-indigo-700">
                {archiveRecords.filter(r => r.type === 'Termo de Exame').length}
              </p>
            </div>
            <div className="p-3 bg-indigo-50 rounded-xl text-indigo-600">
              <ShieldCheck className="w-5 h-5" />
            </div>
          </div>
          <p className="text-xs text-indigo-600 mt-2 font-medium">Exames Nacionais MINEDH</p>
        </Card>

        <Card className="p-4 bg-white border border-slate-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-slate-500">Processos em Consulta</p>
              <p className="text-2xl font-bold text-amber-600">
                {archiveRecords.filter(r => r.status === 'Em Consulta').length}
              </p>
            </div>
            <div className="p-3 bg-amber-50 rounded-xl text-amber-600">
              <Clock className="w-5 h-5" />
            </div>
          </div>
          <p className="text-xs text-amber-600 mt-2 font-medium">Em análise na Secretaria</p>
        </Card>
      </div>

      {/* Search & Filters */}
      <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
          <input
            type="text"
            placeholder="Pesquisar por aluno, código, caixa ou prateleira..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter className="w-4 h-4 text-slate-500" />
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="px-3 py-2 text-sm border border-slate-300 rounded-lg bg-white"
          >
            <option value="all">Todos os Tipos de Documento</option>
            <option value="Processo Individual de Aluno">Processos de Alunos</option>
            <option value="Termo de Exame">Termos de Exames</option>
            <option value="Livro de Matrículas">Livros de Matrículas Antigos</option>
            <option value="Processo de Funcionário">Processos de Funcionários</option>
            <option value="Ofício / Circular">Ofícios & Circulares</option>
          </select>
        </div>
      </div>

      {/* Archive Records Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-700 font-semibold border-b border-slate-200">
              <tr>
                <th className="px-4 py-3">Código do Arquivo</th>
                <th className="px-4 py-3">Título / Titular do Processo</th>
                <th className="px-4 py-3">Tipo de Registo</th>
                <th className="px-4 py-3">Ano</th>
                <th className="px-4 py-3">Localização Física</th>
                <th className="px-4 py-3">Estado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredRecords.map((rec) => (
                <tr key={rec.id} className="hover:bg-slate-50/80">
                  <td className="px-4 py-3 font-mono text-xs font-bold text-slate-700">
                    <span className="bg-slate-100 px-2 py-1 rounded border border-slate-300">
                      {rec.code}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="font-bold text-slate-800">{rec.title}</div>
                    {rec.notes && <div className="text-xs text-slate-400">{rec.notes}</div>}
                  </td>
                  <td className="px-4 py-3">
                    <span className="inline-flex px-2.5 py-0.5 rounded text-xs font-semibold bg-teal-50 text-teal-800 border border-teal-200">
                      {rec.type}
                    </span>
                  </td>
                  <td className="px-4 py-3 font-semibold text-slate-700 text-xs">{rec.year}</td>
                  <td className="px-4 py-3 text-xs text-slate-600">
                    <div className="font-semibold text-slate-800 flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-emerald-600" />
                      {rec.room}
                    </div>
                    <div className="text-slate-500">
                      {rec.shelfNumber} • {rec.boxNumber}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-bold ${
                      rec.status === 'Arquivado' ? 'bg-emerald-100 text-emerald-800' :
                      rec.status === 'Em Consulta' ? 'bg-amber-100 text-amber-800' : 'bg-rose-100 text-rose-800'
                    }`}>
                      {rec.status}
                    </span>
                  </td>
                </tr>
              ))}
              {filteredRecords.length === 0 && (
                <tr>
                  <td colSpan={6} className="text-center py-8 text-slate-500">
                    Nenhum registo documental encontrado.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <div className="flex justify-between items-center border-b pb-3">
              <h3 className="font-bold text-slate-900 text-lg">Arquivar Documento / Processo</h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-600">✕</button>
            </div>
            <form onSubmit={handleAddRecord} className="space-y-3">
              <div>
                <label className="text-xs font-bold text-slate-700">Título / Nome do Processo</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Processo do Aluno Carlos Macamo - 12ª Classe"
                  value={newRecordForm.title}
                  onChange={(e) => setNewRecordForm(prev => ({ ...prev, title: e.target.value }))}
                  className="w-full mt-1 px-3 py-2 border rounded-lg text-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700">Tipo de Registo</label>
                  <select
                    value={newRecordForm.type}
                    onChange={(e) => setNewRecordForm(prev => ({ ...prev, type: e.target.value as any }))}
                    className="w-full mt-1 px-3 py-2 border rounded-lg text-sm bg-white"
                  >
                    <option value="Processo Individual de Aluno">Processo Individual de Aluno</option>
                    <option value="Termo de Exame">Termo de Exame</option>
                    <option value="Livro de Matrículas">Livro de Matrículas</option>
                    <option value="Processo de Funcionário">Processo de Funcionário</option>
                    <option value="Ofício / Circular">Ofício / Circular</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700">Ano Lectivo / Registo</label>
                  <input
                    type="number"
                    value={newRecordForm.year}
                    onChange={(e) => setNewRecordForm(prev => ({ ...prev, year: Number(e.target.value) }))}
                    className="w-full mt-1 px-3 py-2 border rounded-lg text-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700">Sala de Arquivo</label>
                  <input
                    type="text"
                    value={newRecordForm.room}
                    onChange={(e) => setNewRecordForm(prev => ({ ...prev, room: e.target.value }))}
                    className="w-full mt-1 px-3 py-2 border rounded-lg text-sm"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700">Prateleira</label>
                  <input
                    type="text"
                    value={newRecordForm.shelfNumber}
                    onChange={(e) => setNewRecordForm(prev => ({ ...prev, shelfNumber: e.target.value }))}
                    className="w-full mt-1 px-3 py-2 border rounded-lg text-sm"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700">Nº da Caixa</label>
                  <input
                    type="text"
                    value={newRecordForm.boxNumber}
                    onChange={(e) => setNewRecordForm(prev => ({ ...prev, boxNumber: e.target.value }))}
                    className="w-full mt-1 px-3 py-2 border rounded-lg text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700">Observações / Conteúdo</label>
                <textarea
                  rows={2}
                  placeholder="Ex: Contém Certificado da 10ª, BI, Boletins de Notas..."
                  value={newRecordForm.notes}
                  onChange={(e) => setNewRecordForm(prev => ({ ...prev, notes: e.target.value }))}
                  className="w-full mt-1 px-3 py-2 border rounded-lg text-sm"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t">
                <Button type="button" variant="outline" onClick={() => setShowAddModal(false)}>Cancelar</Button>
                <Button type="submit" className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold">Arquivar Processo</Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
