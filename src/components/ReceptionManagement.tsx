import React, { useState } from 'react';
import { useStore } from '../store';
import { Card, Button, Input } from './ui';
import { 
  Users, Plus, Search, Clock, CheckCircle, Volume2, 
  PhoneCall, ShieldAlert, ArrowRight, UserCheck, Calendar, Filter, 
  MessageSquare, UserPlus, FileText
} from 'lucide-react';
import { ReceptionVisitor, ReceptionTicket } from '../types';

export function ReceptionManagement() {
  const { 
    receptionVisitors, 
    receptionTickets, 
    addReceptionVisitor, 
    updateVisitorStatus, 
    addReceptionTicket, 
    callReceptionTicket, 
    currentUser 
  } = useStore();

  const [activeTab, setActiveTab] = useState<'tickets' | 'visitors' | 'logs'>('tickets');
  const [searchTerm, setSearchTerm] = useState('');

  // Modals
  const [showVisitorModal, setShowVisitorModal] = useState(false);
  const [showTicketModal, setShowTicketModal] = useState(false);

  // Forms
  const [visitorForm, setVisitorForm] = useState({
    name: '',
    idCard: '',
    phone: '',
    targetPerson: 'Director da Escola',
    reason: 'Tratamento de Matrícula e Documentos',
    entryTime: new Date().toLocaleTimeString('pt-MZ', { hour: '2-digit', minute: '2-digit' })
  });

  const [ticketForm, setTicketForm] = useState({
    service: 'Secretaria' as ReceptionTicket['service'],
    priority: 'Normal' as ReceptionTicket['priority']
  });

  const activeTickets = receptionTickets.filter(t => t.status === 'Aguardando' || t.status === 'Chamado');
  const calledTicket = receptionTickets.find(t => t.status === 'Chamado');

  const handleCreateVisitor = (e: React.FormEvent) => {
    e.preventDefault();
    if (!visitorForm.name) return;

    addReceptionVisitor({
      name: visitorForm.name,
      idCard: visitorForm.idCard,
      phone: visitorForm.phone,
      targetPerson: visitorForm.targetPerson,
      reason: visitorForm.reason,
      entryTime: visitorForm.entryTime
    });

    setShowVisitorModal(false);
    setVisitorForm({
      name: '',
      idCard: '',
      phone: '',
      targetPerson: 'Director da Escola',
      reason: 'Tratamento de Matrícula e Documentos',
      entryTime: new Date().toLocaleTimeString('pt-MZ', { hour: '2-digit', minute: '2-digit' })
    });
  };

  const handleCreateTicket = (e: React.FormEvent) => {
    e.preventDefault();
    const servicePrefixMap: Record<string, string> = {
      'Secretaria': 'SEC',
      'Tesouraria': 'TES',
      'Matrículas': 'MAT',
      'Direcção': 'DIR',
      'Geral': 'GER'
    };
    const prefix = servicePrefixMap[ticketForm.service] || 'SEN';
    const number = `${prefix}-${Math.floor(100 + Math.random() * 900)}`;

    addReceptionTicket({
      number,
      service: ticketForm.service,
      priority: ticketForm.priority
    });

    setShowTicketModal(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-sky-900 via-slate-800 to-indigo-950 text-white p-6 rounded-2xl shadow-md">
        <div>
          <div className="flex items-center gap-2 mb-1 text-sky-300 text-xs font-bold uppercase tracking-wider">
            <Users className="w-4 h-4" />
            <span>EduGestão • Atendimento ao Cidadão & Recepção Escolar</span>
          </div>
          <h1 className="text-2xl font-bold">Painel de Atendimento e Triagem de Utentes</h1>
          <p className="text-sky-100/80 text-sm mt-1">
            Gestão de senhas de espera, registo diário de visitantes e livro de ocorrências da portaria.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <Button 
            onClick={() => setShowTicketModal(true)}
            className="bg-sky-500 hover:bg-sky-600 text-slate-900 font-bold text-sm shadow-sm flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            <span>Tirar Nova Senha</span>
          </Button>
          <Button 
            onClick={() => setShowVisitorModal(true)}
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm shadow-sm flex items-center gap-2"
          >
            <UserPlus className="w-4 h-4" />
            <span>Registar Visitante</span>
          </Button>
        </div>
      </div>

      {/* Main Waiting Board & Current Ticket Call */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Ticket Call Screen */}
        <Card className="lg:col-span-1 bg-slate-900 text-white p-6 border-slate-800 flex flex-col justify-between rounded-2xl shadow-xl">
          <div>
            <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
              <span className="text-xs font-bold text-sky-400 uppercase tracking-wider">Painel de Chamada</span>
              <span className="flex h-2.5 w-2.5 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
              </span>
            </div>

            {calledTicket ? (
              <div className="text-center py-6 bg-slate-800/80 rounded-xl border border-sky-500/30">
                <p className="text-xs text-slate-400 uppercase tracking-widest font-semibold mb-1">Última Senha Chamada</p>
                <div className="text-4xl sm:text-5xl font-extrabold text-sky-300 font-mono tracking-wider animate-pulse">
                  {calledTicket.number}
                </div>
                <div className="mt-3 inline-flex px-3 py-1 bg-sky-950/80 text-sky-300 rounded-full text-xs font-bold border border-sky-700">
                  Balcão: {calledTicket.service}
                </div>
                <p className="text-xs text-slate-400 mt-2">Chamada às {calledTicket.calledAt || '10:30'}</p>
              </div>
            ) : (
              <div className="text-center py-10 bg-slate-800/40 rounded-xl border border-dashed border-slate-700 text-slate-400">
                <Volume2 className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">Nenhuma senha a ser chamada agora</p>
              </div>
            )}
          </div>

          <div className="mt-6 pt-4 border-t border-slate-800 text-xs text-slate-400">
            <p><strong>Aguardando na Fila:</strong> {activeTickets.filter(t => t.status === 'Aguardando').length} utente(s)</p>
          </div>
        </Card>

        {/* Live Queue Table */}
        <Card className="lg:col-span-2 p-6 border-slate-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-slate-800 text-base flex items-center gap-2">
              <Clock className="w-4 h-4 text-sky-600" />
              <span>Fila de Atendimento em Tempo Real</span>
            </h3>
            <span className="text-xs text-slate-500">Horário de Atendimento: 07:30 - 15:30</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-slate-700 font-semibold border-b border-slate-200">
                <tr>
                  <th className="px-4 py-2.5">Senha</th>
                  <th className="px-4 py-2.5">Serviço / Balcão</th>
                  <th className="px-4 py-2.5">Prioridade</th>
                  <th className="px-4 py-2.5">Hora Emissão</th>
                  <th className="px-4 py-2.5">Estado</th>
                  <th className="px-4 py-2.5 text-right">Ação Balcão</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {receptionTickets.map((t) => (
                  <tr key={t.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3 font-mono font-bold text-slate-800">
                      <span className="bg-slate-100 px-2 py-1 rounded border border-slate-300">
                        {t.number}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-semibold text-slate-700">{t.service}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded text-xs font-bold ${
                        t.priority === 'Idoso' || t.priority === 'Gestante' ? 'bg-purple-100 text-purple-800' :
                        t.priority === 'Prioritário' ? 'bg-amber-100 text-amber-800' : 'bg-slate-100 text-slate-700'
                      }`}>
                        {t.priority}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs text-slate-500">{t.requestedAt}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-bold ${
                        t.status === 'Chamado' ? 'bg-sky-100 text-sky-800' :
                        t.status === 'Atendido' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                      }`}>
                        {t.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      {t.status === 'Aguardando' && (
                        <Button
                          size="sm"
                          onClick={() => callReceptionTicket(t.id)}
                          className="bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold px-2.5 py-1"
                        >
                          <Volume2 className="w-3.5 h-3.5 mr-1" /> Chamar
                        </Button>
                      )}
                      {t.status === 'Chamado' && (
                        <Button
                          size="sm"
                          onClick={() => callReceptionTicket(t.id)}
                          className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-2.5 py-1"
                        >
                          <CheckCircle className="w-3.5 h-3.5 mr-1" /> Concluir
                        </Button>
                      )}
                    </td>
                  </tr>
                ))}
                {receptionTickets.length === 0 && (
                  <tr>
                    <td colSpan={6} className="text-center py-6 text-slate-400">
                      Nenhuma senha gerada no momento.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>
      </div>

      {/* Visitors Book */}
      <Card className="p-6 border-slate-200">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-4">
          <div>
            <h3 className="font-bold text-slate-800 text-lg">Livro Digital de Registo de Visitantes</h3>
            <p className="text-xs text-slate-500">Registo de entradas e saídas de cidadãos, pais e encarregados nas instalações escolares</p>
          </div>
          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              placeholder="Pesquisar visitante..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs border border-slate-300 rounded-lg focus:outline-none"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-700 font-semibold border-b border-slate-200">
              <tr>
                <th className="px-4 py-3">Visitante / Utente</th>
                <th className="px-4 py-3">Documento / Contacto</th>
                <th className="px-4 py-3">Pessoa / Sector Alvo</th>
                <th className="px-4 py-3">Motivo da Visita</th>
                <th className="px-4 py-3">Horário Entrada / Saída</th>
                <th className="px-4 py-3">Estado</th>
                <th className="px-4 py-3 text-right">Ação</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {receptionVisitors
                .filter(v => v.name.toLowerCase().includes(searchTerm.toLowerCase()) || v.reason.toLowerCase().includes(searchTerm.toLowerCase()))
                .map((vis) => (
                  <tr key={vis.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3 font-bold text-slate-800">{vis.name}</td>
                    <td className="px-4 py-3 text-xs text-slate-600">
                      <div>BI: {vis.idCard || 'Apresentou BI'}</div>
                      <div>Tel: {vis.phone || 'N/D'}</div>
                    </td>
                    <td className="px-4 py-3 text-xs font-semibold text-sky-800">{vis.targetPerson}</td>
                    <td className="px-4 py-3 text-xs text-slate-600">{vis.reason}</td>
                    <td className="px-4 py-3 text-xs text-slate-500">
                      <div>Entrada: <strong>{vis.entryTime}</strong></div>
                      {vis.exitTime && <div>Saída: <strong>{vis.exitTime}</strong></div>}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-bold ${
                        vis.status === 'Concluído' ? 'bg-slate-100 text-slate-700' :
                        vis.status === 'Em Atendimento' ? 'bg-sky-100 text-sky-800' : 'bg-amber-100 text-amber-800'
                      }`}>
                        {vis.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      {vis.status !== 'Concluído' && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => updateVisitorStatus(vis.id, 'Concluído')}
                          className="text-xs font-medium text-emerald-700 border-emerald-300 hover:bg-emerald-50"
                        >
                          Dar Saída
                        </Button>
                      )}
                    </td>
                  </tr>
                ))}
              {receptionVisitors.length === 0 && (
                <tr>
                  <td colSpan={7} className="text-center py-6 text-slate-400">
                    Nenhum visitante registado hoje.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Ticket Modal */}
      {showTicketModal && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl space-y-4">
            <div className="flex justify-between items-center border-b pb-3">
              <h3 className="font-bold text-slate-900 text-base">Emitir Senha de Atendimento</h3>
              <button onClick={() => setShowTicketModal(false)} className="text-slate-400 hover:text-slate-600">✕</button>
            </div>
            <form onSubmit={handleCreateTicket} className="space-y-3">
              <div>
                <label className="text-xs font-bold text-slate-700">Serviço Pretendido</label>
                <select
                  value={ticketForm.service}
                  onChange={(e) => setTicketForm(prev => ({ ...prev, service: e.target.value as any }))}
                  className="w-full mt-1 px-3 py-2 border rounded-lg text-sm bg-white"
                >
                  <option value="Secretaria">Secretaria Geral / Matrículas</option>
                  <option value="Tesouraria">Tesouraria / Pagamentos de Propinas</option>
                  <option value="Matrículas">Matrículas & Transferências</option>
                  <option value="Direcção">Gabinete da Direcção</option>
                  <option value="Geral">Informações Gerais</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700">Tipo de Atendimento</label>
                <select
                  value={ticketForm.priority}
                  onChange={(e) => setTicketForm(prev => ({ ...prev, priority: e.target.value as any }))}
                  className="w-full mt-1 px-3 py-2 border rounded-lg text-sm bg-white"
                >
                  <option value="Normal">Normal</option>
                  <option value="Prioritário">Prioritário</option>
                  <option value="Idoso">Terceira Idade</option>
                  <option value="Gestante">Gestante / Bebé de Colo</option>
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t">
                <Button type="button" variant="outline" onClick={() => setShowTicketModal(false)}>Cancelar</Button>
                <Button type="submit" className="bg-sky-600 hover:bg-sky-700 text-white font-bold">Imprimir Senha</Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Visitor Modal */}
      {showVisitorModal && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <div className="flex justify-between items-center border-b pb-3">
              <h3 className="font-bold text-slate-900 text-base">Registo de Entrada de Visitante</h3>
              <button onClick={() => setShowVisitorModal(false)} className="text-slate-400 hover:text-slate-600">✕</button>
            </div>
            <form onSubmit={handleCreateVisitor} className="space-y-3">
              <div>
                <label className="text-xs font-bold text-slate-700">Nome Completo do Visitante</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Manuel Cossa"
                  value={visitorForm.name}
                  onChange={(e) => setVisitorForm(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full mt-1 px-3 py-2 border rounded-lg text-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700">Nº do BI / Identificação</label>
                  <input
                    type="text"
                    placeholder="Ex: 110100483820M"
                    value={visitorForm.idCard}
                    onChange={(e) => setVisitorForm(prev => ({ ...prev, idCard: e.target.value }))}
                    className="w-full mt-1 px-3 py-2 border rounded-lg text-sm"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700">Telefone / Telemóvel</label>
                  <input
                    type="text"
                    placeholder="+258 84..."
                    value={visitorForm.phone}
                    onChange={(e) => setVisitorForm(prev => ({ ...prev, phone: e.target.value }))}
                    className="w-full mt-1 px-3 py-2 border rounded-lg text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700">Pessoa ou Sector a Visitar</label>
                <input
                  type="text"
                  required
                  value={visitorForm.targetPerson}
                  onChange={(e) => setVisitorForm(prev => ({ ...prev, targetPerson: e.target.value }))}
                  className="w-full mt-1 px-3 py-2 border rounded-lg text-sm"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700">Assunto / Motivo da Visita</label>
                <textarea
                  rows={2}
                  value={visitorForm.reason}
                  onChange={(e) => setVisitorForm(prev => ({ ...prev, reason: e.target.value }))}
                  className="w-full mt-1 px-3 py-2 border rounded-lg text-sm"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t">
                <Button type="button" variant="outline" onClick={() => setShowVisitorModal(false)}>Cancelar</Button>
                <Button type="submit" className="bg-sky-600 hover:bg-sky-700 text-white font-bold">Registar Entrada</Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
