import React, { useState } from 'react';
import { useStore } from '../store';
import { Card, Button, Input } from './ui';
import { 
  DollarSign, Plus, Search, Filter, TrendingUp, TrendingDown, 
  CreditCard, CheckCircle, Clock, AlertCircle, Printer, Download, 
  PieChart, FileText, ArrowUpRight, ArrowDownRight, Wallet
} from 'lucide-react';
import { FinancialTransaction } from '../types';

export function FinancialManagement() {
  const { 
    financialTransactions, 
    addFinancialTransaction, 
    updateFinancialStatus, 
    currentUser,
    students 
  } = useStore();

  const [activeTab, setActiveTab] = useState<'all' | 'income' | 'expenses' | 'statement'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedReceipt, setSelectedReceipt] = useState<FinancialTransaction | null>(null);

  // Form State
  const [txForm, setTxForm] = useState({
    type: 'Receita' as FinancialTransaction['type'],
    category: 'Mensalidade / Propina' as FinancialTransaction['category'],
    amount: 1500,
    paymentMethod: 'M-Pesa' as FinancialTransaction['paymentMethod'],
    description: '',
    studentId: '',
    studentName: '',
    status: 'pago' as FinancialTransaction['status'],
    reference: ''
  });

  const totalIncome = financialTransactions
    .filter(t => t.type === 'Receita' && t.status === 'pago')
    .reduce((acc, t) => acc + t.amount, 0);

  const totalExpense = financialTransactions
    .filter(t => t.type === 'Despesa' && t.status === 'pago')
    .reduce((acc, t) => acc + t.amount, 0);

  const currentBalance = totalIncome - totalExpense;

  const pendingPayments = financialTransactions.filter(t => t.status === 'pendente');

  const filteredTransactions = financialTransactions.filter(t => {
    const matchesSearch = t.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          t.receiptNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          t.studentName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          t.category.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesTab = activeTab === 'all' || 
                       (activeTab === 'income' && t.type === 'Receita') ||
                       (activeTab === 'expenses' && t.type === 'Despesa');
    return matchesSearch && matchesTab;
  });

  const handleCreateTransaction = (e: React.FormEvent) => {
    e.preventDefault();
    if (!txForm.description || txForm.amount <= 0) return;

    const receiptNumber = `REC-2026-${Math.floor(100000 + Math.random() * 900000)}`;

    addFinancialTransaction({
      type: txForm.type,
      category: txForm.category,
      amount: Number(txForm.amount),
      date: new Date().toISOString().split('T')[0],
      paymentMethod: txForm.paymentMethod,
      description: txForm.description,
      studentId: txForm.studentId || undefined,
      studentName: txForm.studentName || undefined,
      status: txForm.status,
      receiptNumber,
      reference: txForm.reference || undefined
    });

    setShowAddModal(false);
    setTxForm({
      type: 'Receita',
      category: 'Mensalidade / Propina',
      amount: 1500,
      paymentMethod: 'M-Pesa',
      description: '',
      studentId: '',
      studentName: '',
      status: 'pago',
      reference: ''
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-emerald-900 via-slate-800 to-indigo-950 text-white p-6 rounded-2xl shadow-md">
        <div>
          <div className="flex items-center gap-2 mb-1 text-emerald-300 text-xs font-bold uppercase tracking-wider">
            <DollarSign className="w-4 h-4" />
            <span>EduGestão • Gestão Financeira, Contabilidade & Tesouraria</span>
          </div>
          <h1 className="text-2xl font-bold">Tesouraria Escolar e Fluxo de Caixa</h1>
          <p className="text-emerald-100/80 text-sm mt-1">
            Cobrança de propinas, taxas de matrícula, despesas correntes, reconciliação bancária (M-Pesa, E-Mola, BIM) e emissão de recibos oficiais.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <Button 
            onClick={() => setShowAddModal(true)}
            className="bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold text-sm shadow-sm flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            <span>Registar Movimento / Pagamento</span>
          </Button>
          <Button 
            onClick={() => window.print()}
            variant="outline"
            className="text-white border-white/30 hover:bg-white/10 font-bold text-sm flex items-center gap-2"
          >
            <Printer className="w-4 h-4" />
            <span>Imprimir Balancete</span>
          </Button>
        </div>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="p-4 bg-white border border-slate-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-slate-500">Saldo Actual em Caixa</p>
              <p className="text-2xl font-extrabold text-slate-900">{currentBalance.toLocaleString('pt-MZ')} MZN</p>
            </div>
            <div className="p-3 bg-emerald-50 rounded-xl text-emerald-600">
              <Wallet className="w-5 h-5" />
            </div>
          </div>
          <p className="text-xs text-emerald-600 font-semibold mt-2">Disponibilidade Imediata</p>
        </Card>

        <Card className="p-4 bg-white border border-slate-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-slate-500">Total Receitas Arrecadadas</p>
              <p className="text-2xl font-bold text-emerald-700">{totalIncome.toLocaleString('pt-MZ')} MZN</p>
            </div>
            <div className="p-3 bg-teal-50 rounded-xl text-teal-600">
              <ArrowUpRight className="w-5 h-5" />
            </div>
          </div>
          <p className="text-xs text-slate-500 mt-2">Propinas, Matrículas e Taxas</p>
        </Card>

        <Card className="p-4 bg-white border border-slate-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-slate-500">Total Despesas Executadas</p>
              <p className="text-2xl font-bold text-rose-600">{totalExpense.toLocaleString('pt-MZ')} MZN</p>
            </div>
            <div className="p-3 bg-rose-50 rounded-xl text-rose-600">
              <ArrowDownRight className="w-5 h-5" />
            </div>
          </div>
          <p className="text-xs text-slate-500 mt-2">Serviços, Manutenção e Custos</p>
        </Card>

        <Card className="p-4 bg-white border border-slate-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-slate-500">Pagamentos Pendentes</p>
              <p className="text-2xl font-bold text-amber-600">{pendingPayments.length}</p>
            </div>
            <div className="p-3 bg-amber-50 rounded-xl text-amber-600">
              <Clock className="w-5 h-5" />
            </div>
          </div>
          <p className="text-xs text-amber-600 mt-2 font-medium">Aguardando confirmação</p>
        </Card>
      </div>

      {/* Tabs */}
      <div className="border-b border-slate-200 flex gap-2">
        <button
          onClick={() => setActiveTab('all')}
          className={`px-4 py-2.5 font-bold text-sm border-b-2 flex items-center gap-2 transition-all ${
            activeTab === 'all' 
              ? 'border-emerald-600 text-emerald-700 bg-emerald-50/50 rounded-t-lg' 
              : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
        >
          <DollarSign className="w-4 h-4" />
          <span>Todos os Lançamentos ({financialTransactions.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('income')}
          className={`px-4 py-2.5 font-bold text-sm border-b-2 flex items-center gap-2 transition-all ${
            activeTab === 'income' 
              ? 'border-emerald-600 text-emerald-700 bg-emerald-50/50 rounded-t-lg' 
              : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
        >
          <TrendingUp className="w-4 h-4" />
          <span>Receitas / Propinas</span>
        </button>

        <button
          onClick={() => setActiveTab('expenses')}
          className={`px-4 py-2.5 font-bold text-sm border-b-2 flex items-center gap-2 transition-all ${
            activeTab === 'expenses' 
              ? 'border-emerald-600 text-emerald-700 bg-emerald-50/50 rounded-t-lg' 
              : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
        >
          <TrendingDown className="w-4 h-4" />
          <span>Despesas / Pagamentos</span>
        </button>
      </div>

      {/* Transactions Table */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
            <input
              type="text"
              placeholder="Pesquisar por recibo, descrição, aluno ou categoria..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-slate-700 font-semibold border-b border-slate-200">
                <tr>
                  <th className="px-4 py-3">Recibo / Data</th>
                  <th className="px-4 py-3">Descrição / Titular</th>
                  <th className="px-4 py-3">Categoria</th>
                  <th className="px-4 py-3">Canal de Pagamento</th>
                  <th className="px-4 py-3">Valor (MZN)</th>
                  <th className="px-4 py-3">Estado</th>
                  <th className="px-4 py-3 text-right">Recibo</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredTransactions.map((tx) => (
                  <tr key={tx.id} className="hover:bg-slate-50/80">
                    <td className="px-4 py-3">
                      <div className="font-mono text-xs font-bold text-slate-700">{tx.receiptNumber || tx.id}</div>
                      <div className="text-xs text-slate-400">{tx.date}</div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="font-bold text-slate-800">{tx.description}</div>
                      {tx.studentName && <div className="text-xs text-indigo-700 font-semibold">Aluno: {tx.studentName}</div>}
                    </td>
                    <td className="px-4 py-3">
                      <span className="inline-flex px-2 py-0.5 rounded text-xs font-medium bg-slate-100 text-slate-800 border border-slate-200">
                        {tx.category}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs text-slate-600 font-semibold">
                      {tx.paymentMethod}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`font-extrabold text-sm ${
                        tx.type === 'Receita' ? 'text-emerald-700' : 'text-rose-600'
                      }`}>
                        {tx.type === 'Receita' ? '+' : '-'} {tx.amount.toLocaleString('pt-MZ')} MZN
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-bold ${
                        tx.status === 'pago' ? 'bg-emerald-100 text-emerald-800' :
                        tx.status === 'pendente' ? 'bg-amber-100 text-amber-800' : 'bg-rose-100 text-rose-800'
                      }`}>
                        {tx.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setSelectedReceipt(tx)}
                        className="text-xs font-medium text-slate-700 hover:bg-slate-50"
                      >
                        <Printer className="w-3.5 h-3.5 mr-1" /> Ver Recibo
                      </Button>
                    </td>
                  </tr>
                ))}
                {filteredTransactions.length === 0 && (
                  <tr>
                    <td colSpan={7} className="text-center py-8 text-slate-500">
                      Nenhum lançamento financeiro encontrado.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Add Transaction Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center border-b pb-3">
              <h3 className="font-bold text-slate-900 text-lg">Registar Movimento Financeiro</h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-600">✕</button>
            </div>

            <form onSubmit={handleCreateTransaction} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700">Tipo de Lançamento</label>
                  <select
                    value={txForm.type}
                    onChange={(e) => setTxForm(prev => ({ ...prev, type: e.target.value as any }))}
                    className="w-full mt-1 px-3 py-2 border rounded-lg text-sm bg-white"
                  >
                    <option value="Receita">Receita (Entrada)</option>
                    <option value="Despesa">Despesa (Saída)</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700">Categoria</label>
                  <select
                    value={txForm.category}
                    onChange={(e) => setTxForm(prev => ({ ...prev, category: e.target.value as any }))}
                    className="w-full mt-1 px-3 py-2 border rounded-lg text-sm bg-white"
                  >
                    {txForm.type === 'Receita' ? (
                      <>
                        <option value="Mensalidade / Propina">Mensalidade / Propina</option>
                        <option value="Taxa de Matrícula">Taxa de Matrícula</option>
                        <option value="Taxa de Exame">Taxa de Exame</option>
                        <option value="Certificado / Declaração">Certificado / Declaração</option>
                        <option value="Outros Serviços">Outros Serviços</option>
                      </>
                    ) : (
                      <>
                        <option value="Salários e Encargos">Salários e Encargos</option>
                        <option value="Material Didático">Material Didático</option>
                        <option value="Manutenção e Obras">Manutenção e Obras</option>
                        <option value="Água e Luz (EDM/FIPAG)">Água e Luz (EDM/FIPAG)</option>
                        <option value="Comunicações e Internet">Comunicações e Internet</option>
                      </>
                    )}
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700">Descrição do Movimento</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Pagamento de Mensalidade de Maio - 10ª Classe"
                  value={txForm.description}
                  onChange={(e) => setTxForm(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full mt-1 px-3 py-2 border rounded-lg text-sm"
                />
              </div>

              {txForm.type === 'Receita' && (
                <div>
                  <label className="text-xs font-bold text-slate-700">Associar ao Aluno (Opcional)</label>
                  <select
                    value={txForm.studentId}
                    onChange={(e) => {
                      const st = students.find(s => s.id === e.target.value);
                      setTxForm(prev => ({
                        ...prev,
                        studentId: e.target.value,
                        studentName: st?.name || ''
                      }));
                    }}
                    className="w-full mt-1 px-3 py-2 border rounded-lg text-sm bg-white"
                  >
                    <option value="">Selecione o aluno...</option>
                    {students.map(st => (
                      <option key={st.id} value={st.id}>{st.name} ({st.id})</option>
                    ))}
                  </select>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700">Valor em Meticais (MZN)</label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={txForm.amount}
                    onChange={(e) => setTxForm(prev => ({ ...prev, amount: Number(e.target.value) }))}
                    className="w-full mt-1 px-3 py-2 border rounded-lg text-sm font-bold text-emerald-800"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700">Forma de Pagamento</label>
                  <select
                    value={txForm.paymentMethod}
                    onChange={(e) => setTxForm(prev => ({ ...prev, paymentMethod: e.target.value as any }))}
                    className="w-full mt-1 px-3 py-2 border rounded-lg text-sm bg-white"
                  >
                    <option value="M-Pesa">M-Pesa</option>
                    <option value="E-Mola">E-Mola</option>
                    <option value="BIM POS">BIM POS / Cartão</option>
                    <option value="Transferência Bancária">Transferência Bancária</option>
                    <option value="Numerário">Numerário / Caixa</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700">Nº de Transação / Referência</label>
                <input
                  type="text"
                  placeholder="Ex: MP26059281923"
                  value={txForm.reference}
                  onChange={(e) => setTxForm(prev => ({ ...prev, reference: e.target.value }))}
                  className="w-full mt-1 px-3 py-2 border rounded-lg text-sm font-mono"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t">
                <Button type="button" variant="outline" onClick={() => setShowAddModal(false)}>Cancelar</Button>
                <Button type="submit" className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold">Gravar e Emitir Recibo</Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Official Receipt Modal */}
      {selectedReceipt && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-lg w-full shadow-2xl space-y-4">
            <div className="flex justify-between items-center border-b pb-3">
              <h3 className="font-bold text-slate-900 text-base">Recibo Oficial de Pagamento</h3>
              <button onClick={() => setSelectedReceipt(null)} className="text-slate-400 hover:text-slate-600">✕</button>
            </div>

            <div className="border-2 border-slate-900 p-6 rounded-xl space-y-4 text-slate-800 text-sm bg-slate-50/50">
              <div className="text-center border-b border-slate-300 pb-3">
                <p className="text-xs font-bold uppercase tracking-widest text-slate-600">República de Moçambique</p>
                <p className="text-xs font-semibold text-slate-500">Ministério da Educação e Desenvolvimento Humano</p>
                <h4 className="font-extrabold text-slate-900 text-base mt-1">RECIBO DE TESOURARIA ESCOLAR</h4>
                <p className="font-mono text-xs font-bold text-emerald-800 mt-1">Nº: {selectedReceipt.receiptNumber || selectedReceipt.id}</p>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <div><strong>Data de Emissão:</strong> {selectedReceipt.date}</div>
                <div><strong>Forma de Pagamento:</strong> {selectedReceipt.paymentMethod}</div>
                {selectedReceipt.studentName && <div className="col-span-2"><strong>Aluno(a):</strong> {selectedReceipt.studentName}</div>}
                <div className="col-span-2"><strong>Descrição:</strong> {selectedReceipt.description}</div>
                <div><strong>Categoria:</strong> {selectedReceipt.category}</div>
                <div><strong>Referência:</strong> {selectedReceipt.reference || 'N/A'}</div>
              </div>

              <div className="bg-emerald-50 border border-emerald-200 p-3 rounded-lg text-center">
                <span className="text-xs text-emerald-700 font-bold uppercase block">Valor Total Pago</span>
                <span className="text-2xl font-black text-emerald-800">{selectedReceipt.amount.toLocaleString('pt-MZ')} MZN</span>
              </div>

              <div className="pt-4 border-t border-slate-200 flex justify-between text-xs text-slate-500">
                <div>
                  <p className="font-bold text-slate-700">O Tesoureiro / Recepcionista</p>
                  <p className="text-[10px] mt-4 border-t border-slate-400 pt-1">Assinatura e Carimbo Oficial</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-slate-700">Código de Validação</p>
                  <p className="font-mono text-[10px] mt-4 text-slate-600">EDUG-VERIF-{Math.floor(100000 + Math.random() * 900000)}</p>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" onClick={() => setSelectedReceipt(null)}>Fechar</Button>
              <Button onClick={() => window.print()} className="bg-slate-900 hover:bg-slate-800 text-white font-bold flex items-center gap-1.5">
                <Printer className="w-4 h-4" /> Imprimir Recibo
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
