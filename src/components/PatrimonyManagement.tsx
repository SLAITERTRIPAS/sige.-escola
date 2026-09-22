import React, { useState } from 'react';
import { useStore } from '../store';
import { Card, Button, Input } from './ui';
import { 
  Package, Plus, Search, Filter, QrCode, AlertTriangle, 
  CheckCircle, ArrowRightLeft, Trash2, Wrench, Shield, 
  Layers, MapPin, Tag, Download, Printer, Box
} from 'lucide-react';
import { PatrimonyItem, PatrimonyMovement } from '../types';

export function PatrimonyManagement() {
  const { 
    patrimonyItems, 
    patrimonyMovements, 
    addPatrimonyItem, 
    updatePatrimonyItem, 
    addPatrimonyMovement, 
    currentUser 
  } = useStore();

  const [activeTab, setActiveTab] = useState<'inventory' | 'movements' | 'maintenance' | 'writeoff'>('inventory');
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [conditionFilter, setConditionFilter] = useState<string>('all');

  // Modal states
  const [showAddModal, setShowAddModal] = useState(false);
  const [showMoveModal, setShowMoveModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState<PatrimonyItem | null>(null);

  // Form states
  const [newItemForm, setNewItemForm] = useState({
    code: '',
    description: '',
    category: 'Mobiliário' as PatrimonyItem['category'],
    location: 'Bloco A - Sala 01',
    condition: 'Bom' as PatrimonyItem['condition'],
    quantity: 1,
    acquisitionDate: new Date().toISOString().split('T')[0],
    estimatedValue: 5000,
    serialNumber: '',
    supplier: 'Fornecedor Escolar Nacional'
  });

  const [moveForm, setMoveForm] = useState({
    toLocation: '',
    responsibleName: currentUser?.name || 'Responsável',
    reason: ''
  });

  const filteredItems = patrimonyItems.filter(item => {
    const matchesSearch = item.description.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          item.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          item.location.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCat = categoryFilter === 'all' || item.category === categoryFilter;
    const matchesCond = conditionFilter === 'all' || item.condition === conditionFilter;
    return matchesSearch && matchesCat && matchesCond;
  });

  const totalPatrimonyValue = patrimonyItems.reduce((acc, item) => acc + (item.estimatedValue || 0) * (item.quantity || 1), 0);
  const totalItemsCount = patrimonyItems.reduce((acc, item) => acc + (item.quantity || 1), 0);
  const damagedItems = patrimonyItems.filter(i => i.condition === 'Danificado' || i.condition === 'Necessita Reparação');

  const handleAddItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItemForm.description) return;

    const generatedCode = newItemForm.code.trim() || `PAT-2026-${Math.floor(1000 + Math.random() * 9000)}`;

    addPatrimonyItem({
      code: generatedCode,
      description: newItemForm.description,
      category: newItemForm.category,
      location: newItemForm.location,
      condition: newItemForm.condition,
      quantity: Number(newItemForm.quantity) || 1,
      acquisitionDate: newItemForm.acquisitionDate,
      estimatedValue: Number(newItemForm.estimatedValue) || 0,
      serialNumber: newItemForm.serialNumber,
      supplier: newItemForm.supplier
    });

    setShowAddModal(false);
    setNewItemForm({
      code: '',
      description: '',
      category: 'Mobiliário',
      location: 'Bloco A - Sala 01',
      condition: 'Bom',
      quantity: 1,
      acquisitionDate: new Date().toISOString().split('T')[0],
      estimatedValue: 5000,
      serialNumber: '',
      supplier: 'Fornecedor Escolar Nacional'
    });
  };

  const handleMoveItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedItem || !moveForm.toLocation) return;

    addPatrimonyMovement({
      itemId: selectedItem.id,
      itemCode: selectedItem.code,
      itemDescription: selectedItem.description,
      fromLocation: selectedItem.location,
      toLocation: moveForm.toLocation,
      movedBy: moveForm.responsibleName,
      date: new Date().toISOString().split('T')[0],
      reason: moveForm.reason
    });

    updatePatrimonyItem(selectedItem.id, {
      location: moveForm.toLocation
    });

    setShowMoveModal(false);
    setSelectedItem(null);
    setMoveForm({ toLocation: '', responsibleName: currentUser?.name || 'Responsável', reason: '' });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-amber-900 via-slate-800 to-slate-900 text-white p-6 rounded-2xl shadow-md">
        <div>
          <div className="flex items-center gap-2 mb-1 text-amber-300 text-xs font-bold uppercase tracking-wider">
            <Package className="w-4 h-4" />
            <span>EduGestão • Património, Logística & Inventário Escolar</span>
          </div>
          <h1 className="text-2xl font-bold">Gestão Patrimonial e Controlo de Bens</h1>
          <p className="text-amber-100/80 text-sm mt-1">
            Inventariação permanente de imobilizado, equipamentos informáticos, mobiliário escolar, termos de carga e abate.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <Button 
            onClick={() => setShowAddModal(true)}
            className="bg-amber-500 hover:bg-amber-600 text-slate-900 font-bold text-sm shadow-sm flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            <span>Registar Novo Bem</span>
          </Button>
          <Button 
            onClick={() => window.print()}
            variant="outline"
            className="text-white border-white/30 hover:bg-white/10 font-bold text-sm flex items-center gap-2"
          >
            <Printer className="w-4 h-4" />
            <span>Imprimir Livro de Carga</span>
          </Button>
        </div>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="p-4 bg-white border border-slate-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-slate-500">Total de Artigos / Bens</p>
              <p className="text-2xl font-bold text-slate-800">{totalItemsCount}</p>
            </div>
            <div className="p-3 bg-amber-50 rounded-xl text-amber-600">
              <Box className="w-5 h-5" />
            </div>
          </div>
          <p className="text-xs text-slate-500 mt-2">{patrimonyItems.length} lotes registados</p>
        </Card>

        <Card className="p-4 bg-white border border-slate-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-slate-500">Valor Estimado do Ativo</p>
              <p className="text-xl font-bold text-emerald-700">{totalPatrimonyValue.toLocaleString('pt-MZ')} MZN</p>
            </div>
            <div className="p-3 bg-emerald-50 rounded-xl text-emerald-600">
              <Shield className="w-5 h-5" />
            </div>
          </div>
          <p className="text-xs text-emerald-600 mt-2 font-medium">Património Institucional</p>
        </Card>

        <Card className="p-4 bg-white border border-slate-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-slate-500">Bens em Estado Excelente / Bom</p>
              <p className="text-2xl font-bold text-indigo-700">
                {patrimonyItems.filter(i => i.condition === 'Excelente' || i.condition === 'Bom').length}
              </p>
            </div>
            <div className="p-3 bg-indigo-50 rounded-xl text-indigo-600">
              <CheckCircle className="w-5 h-5" />
            </div>
          </div>
          <p className="text-xs text-indigo-600 mt-2 font-medium">Prontos para uso lectivo</p>
        </Card>

        <Card className="p-4 bg-white border border-slate-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-slate-500">Necessita Reparação / Abate</p>
              <p className="text-2xl font-bold text-rose-600">{damagedItems.length}</p>
            </div>
            <div className="p-3 bg-rose-50 rounded-xl text-rose-600">
              <AlertTriangle className="w-5 h-5" />
            </div>
          </div>
          <p className="text-xs text-rose-600 mt-2 font-medium">Requer intervenção técnica</p>
        </Card>
      </div>

      {/* Tabs */}
      <div className="border-b border-slate-200 flex gap-2">
        <button
          onClick={() => setActiveTab('inventory')}
          className={`px-4 py-2.5 font-bold text-sm border-b-2 flex items-center gap-2 transition-all ${
            activeTab === 'inventory' 
              ? 'border-amber-600 text-amber-700 bg-amber-50/50 rounded-t-lg' 
              : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
        >
          <Package className="w-4 h-4" />
          <span>Inventário Geral ({patrimonyItems.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('movements')}
          className={`px-4 py-2.5 font-bold text-sm border-b-2 flex items-center gap-2 transition-all ${
            activeTab === 'movements' 
              ? 'border-amber-600 text-amber-700 bg-amber-50/50 rounded-t-lg' 
              : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
        >
          <ArrowRightLeft className="w-4 h-4" />
          <span>Movimentações & Guias ({patrimonyMovements.length})</span>
        </button>
      </div>

      {/* Tab 1: Inventory */}
      {activeTab === 'inventory' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
            <div className="relative flex-1 w-full">
              <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
              <input
                type="text"
                placeholder="Pesquisar por código, descrição ou localização..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="px-3 py-2 text-sm border border-slate-300 rounded-lg bg-white"
              >
                <option value="all">Todas as Categorias</option>
                <option value="Mobiliário">Mobiliário Escolar</option>
                <option value="Informática">Equipamentos de Informática</option>
                <option value="Equipamento">Equipamentos Gerais</option>
                <option value="Material Didático">Material Didático / Laboratório</option>
                <option value="Veículo">Viaturas / Transporte</option>
              </select>

              <select
                value={conditionFilter}
                onChange={(e) => setConditionFilter(e.target.value)}
                className="px-3 py-2 text-sm border border-slate-300 rounded-lg bg-white"
              >
                <option value="all">Todos os Estados</option>
                <option value="Excelente">Excelente</option>
                <option value="Bom">Bom</option>
                <option value="Regular">Regular</option>
                <option value="Necessita Reparação">Necessita Reparação</option>
                <option value="Danificado">Danificado</option>
              </select>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 text-slate-700 font-semibold border-b border-slate-200">
                  <tr>
                    <th className="px-4 py-3">Código / Etiqueta</th>
                    <th className="px-4 py-3">Descrição do Bem</th>
                    <th className="px-4 py-3">Categoria</th>
                    <th className="px-4 py-3">Localização Actual</th>
                    <th className="px-4 py-3">Qtd / Valor</th>
                    <th className="px-4 py-3">Estado</th>
                    <th className="px-4 py-3 text-right">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredItems.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-50/80">
                      <td className="px-4 py-3 font-mono text-xs font-bold text-slate-700">
                        <span className="bg-slate-100 px-2 py-1 rounded border border-slate-200">
                          {item.code}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="font-bold text-slate-800">{item.description}</div>
                        {item.serialNumber && <div className="text-xs text-slate-400">S/N: {item.serialNumber}</div>}
                      </td>
                      <td className="px-4 py-3">
                        <span className="inline-flex px-2 py-0.5 rounded text-xs font-semibold bg-amber-50 text-amber-800 border border-amber-200">
                          {item.category}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-xs text-slate-600 flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-slate-400" />
                        <span>{item.location}</span>
                      </td>
                      <td className="px-4 py-3 text-xs">
                        <div className="font-bold text-slate-700">{item.quantity} un.</div>
                        <div className="text-emerald-700 font-semibold">{(item.estimatedValue * item.quantity).toLocaleString('pt-MZ')} MZN</div>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-bold ${
                          item.condition === 'Excelente' ? 'bg-emerald-100 text-emerald-800' :
                          item.condition === 'Bom' ? 'bg-teal-100 text-teal-800' :
                          item.condition === 'Regular' ? 'bg-amber-100 text-amber-800' :
                          'bg-rose-100 text-rose-800'
                        }`}>
                          {item.condition}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setSelectedItem(item);
                            setShowMoveModal(true);
                          }}
                          className="text-xs font-medium flex items-center gap-1 ml-auto"
                        >
                          <ArrowRightLeft className="w-3 h-3" />
                          <span>Transferir</span>
                        </Button>
                      </td>
                    </tr>
                  ))}
                  {filteredItems.length === 0 && (
                    <tr>
                      <td colSpan={7} className="text-center py-8 text-slate-500">
                        Nenhum bem patrimonial encontrado.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Movements */}
      {activeTab === 'movements' && (
        <div className="space-y-4">
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 text-slate-700 font-semibold border-b border-slate-200">
                  <tr>
                    <th className="px-4 py-3">Data</th>
                    <th className="px-4 py-3">Artigo</th>
                    <th className="px-4 py-3">Origem</th>
                    <th className="px-4 py-3">Destino</th>
                    <th className="px-4 py-3">Responsável</th>
                    <th className="px-4 py-3">Motivo</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {patrimonyMovements.map((mov) => (
                    <tr key={mov.id} className="hover:bg-slate-50/80">
                      <td className="px-4 py-3 font-semibold text-slate-600 text-xs">{mov.date}</td>
                      <td className="px-4 py-3">
                        <div className="font-bold text-slate-800">{mov.itemDescription}</div>
                        <div className="text-xs text-slate-400 font-mono">{mov.itemCode}</div>
                      </td>
                      <td className="px-4 py-3 text-xs text-rose-700 font-medium">{mov.fromLocation}</td>
                      <td className="px-4 py-3 text-xs text-emerald-700 font-bold">{mov.toLocation}</td>
                      <td className="px-4 py-3 text-xs text-slate-700">{mov.movedBy}</td>
                      <td className="px-4 py-3 text-xs text-slate-500">{mov.reason || 'Reorganização de salas'}</td>
                    </tr>
                  ))}
                  {patrimonyMovements.length === 0 && (
                    <tr>
                      <td colSpan={6} className="text-center py-8 text-slate-500">
                        Nenhuma movimentação registada.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Add Item Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-lg w-full shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center border-b pb-3">
              <h3 className="font-bold text-slate-900 text-lg">Registar Novo Bem Patrimonial</h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-600">✕</button>
            </div>

            <form onSubmit={handleAddItem} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700">Código do Bem (Auto se vazio)</label>
                  <input
                    type="text"
                    placeholder="Ex: PAT-2026-009"
                    value={newItemForm.code}
                    onChange={(e) => setNewItemForm(prev => ({ ...prev, code: e.target.value }))}
                    className="w-full mt-1 px-3 py-2 border rounded-lg text-sm"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700">Categoria</label>
                  <select
                    value={newItemForm.category}
                    onChange={(e) => setNewItemForm(prev => ({ ...prev, category: e.target.value as any }))}
                    className="w-full mt-1 px-3 py-2 border rounded-lg text-sm bg-white"
                  >
                    <option value="Mobiliário">Mobiliário Escolar (Carteiras/Mesas)</option>
                    <option value="Informática">Informática (Computadores/Projectores)</option>
                    <option value="Material Didático">Material Didático / Laboratório</option>
                    <option value="Equipamento">Equipamentos Gerais / Escritório</option>
                    <option value="Veículo">Viaturas / Transporte</option>
                    <option value="Imóvel">Edifício / Infraestrutura</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700">Descrição do Artigo / Bem</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Computador All-in-One HP 24 pol Core i5 16GB"
                  value={newItemForm.description}
                  onChange={(e) => setNewItemForm(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full mt-1 px-3 py-2 border rounded-lg text-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700">Localização Inicial</label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: Sala dos Professores / Sala 04"
                    value={newItemForm.location}
                    onChange={(e) => setNewItemForm(prev => ({ ...prev, location: e.target.value }))}
                    className="w-full mt-1 px-3 py-2 border rounded-lg text-sm"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700">Estado de Conservação</label>
                  <select
                    value={newItemForm.condition}
                    onChange={(e) => setNewItemForm(prev => ({ ...prev, condition: e.target.value as any }))}
                    className="w-full mt-1 px-3 py-2 border rounded-lg text-sm bg-white"
                  >
                    <option value="Excelente">Excelente (Novo)</option>
                    <option value="Bom">Bom Estado</option>
                    <option value="Regular">Regular</option>
                    <option value="Necessita Reparação">Necessita Reparação</option>
                    <option value="Danificado">Danificado</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700">Quantidade</label>
                  <input
                    type="number"
                    min="1"
                    value={newItemForm.quantity}
                    onChange={(e) => setNewItemForm(prev => ({ ...prev, quantity: Number(e.target.value) }))}
                    className="w-full mt-1 px-3 py-2 border rounded-lg text-sm"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700">Valor Unit. (MZN)</label>
                  <input
                    type="number"
                    value={newItemForm.estimatedValue}
                    onChange={(e) => setNewItemForm(prev => ({ ...prev, estimatedValue: Number(e.target.value) }))}
                    className="w-full mt-1 px-3 py-2 border rounded-lg text-sm"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700">Data de Entrada</label>
                  <input
                    type="date"
                    value={newItemForm.acquisitionDate}
                    onChange={(e) => setNewItemForm(prev => ({ ...prev, acquisitionDate: e.target.value }))}
                    className="w-full mt-1 px-3 py-2 border rounded-lg text-sm"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t">
                <Button type="button" variant="outline" onClick={() => setShowAddModal(false)}>Cancelar</Button>
                <Button type="submit" className="bg-amber-600 hover:bg-amber-700 text-white font-bold">Gravar no Inventário</Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Move Item Modal */}
      {showMoveModal && selectedItem && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <div className="flex justify-between items-center border-b pb-3">
              <h3 className="font-bold text-slate-900 text-lg">Guia de Transferência / Movimentação</h3>
              <button onClick={() => setShowMoveModal(false)} className="text-slate-400 hover:text-slate-600">✕</button>
            </div>

            <div className="bg-slate-50 p-3 rounded-lg text-xs space-y-1">
              <p><strong>Artigo:</strong> {selectedItem.description}</p>
              <p><strong>Código:</strong> {selectedItem.code}</p>
              <p><strong>Localização Actual:</strong> {selectedItem.location}</p>
            </div>

            <form onSubmit={handleMoveItem} className="space-y-3">
              <div>
                <label className="text-xs font-bold text-slate-700">Nova Localização / Sala de Destino</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Bloco B - Laboratório de Informática"
                  value={moveForm.toLocation}
                  onChange={(e) => setMoveForm(prev => ({ ...prev, toLocation: e.target.value }))}
                  className="w-full mt-1 px-3 py-2 border rounded-lg text-sm"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700">Responsável pela Entrega / Recepção</label>
                <input
                  type="text"
                  required
                  value={moveForm.responsibleName}
                  onChange={(e) => setMoveForm(prev => ({ ...prev, responsibleName: e.target.value }))}
                  className="w-full mt-1 px-3 py-2 border rounded-lg text-sm"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700">Motivo da Transferência</label>
                <input
                  type="text"
                  placeholder="Ex: Reabastecimento de salas para o 2º Trimestre"
                  value={moveForm.reason}
                  onChange={(e) => setMoveForm(prev => ({ ...prev, reason: e.target.value }))}
                  className="w-full mt-1 px-3 py-2 border rounded-lg text-sm"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t">
                <Button type="button" variant="outline" onClick={() => setShowMoveModal(false)}>Cancelar</Button>
                <Button type="submit" className="bg-amber-600 hover:bg-amber-700 text-white font-bold">Emitir Guia de Transferência</Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
