import React, { useState } from 'react';
import { useStore } from '../store';
import { Card, Button, Input } from './ui';
import { 
  BookOpen, Plus, Search, Filter, Bookmark, CheckCircle, 
  Clock, AlertTriangle, ArrowRightLeft, User, Calendar, 
  Layers, Download, Printer, Book
} from 'lucide-react';
import { LibraryBook, LibraryLoan } from '../types';

export function LibraryManagement() {
  const { 
    libraryBooks, 
    libraryLoans, 
    addLibraryBook, 
    borrowBook, 
    returnBook, 
    students, 
    currentUser 
  } = useStore();

  const [activeTab, setActiveTab] = useState<'catalog' | 'loans' | 'overdue'>('catalog');
  const [searchTerm, setSearchTerm] = useState('');
  const [gradeFilter, setGradeFilter] = useState<string>('all');
  const [showAddBookModal, setShowAddBookModal] = useState(false);
  const [showBorrowModal, setShowBorrowModal] = useState(false);
  const [selectedBook, setSelectedBook] = useState<LibraryBook | null>(null);

  // Form states
  const [newBookForm, setNewBookForm] = useState({
    isbn: '',
    title: '',
    author: '',
    publisher: 'Editora Nacional de Moçambique / MINEDH',
    category: 'Manual Escolar' as LibraryBook['category'],
    gradeLevel: '10ª Classe',
    totalCopies: 50,
    availableCopies: 50,
    shelfLocation: 'Estante 02 - Prateleira A'
  });

  const [loanForm, setLoanForm] = useState({
    studentId: '',
    studentName: '',
    dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  });

  const filteredBooks = libraryBooks.filter(b => {
    const matchesSearch = b.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          b.author.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          b.isbn.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesGrade = gradeFilter === 'all' || b.gradeLevel === gradeFilter;
    return matchesSearch && matchesGrade;
  });

  const activeLoans = libraryLoans.filter(l => l.status === 'Activo');
  const overdueLoans = libraryLoans.filter(l => {
    if (l.status !== 'Activo') return false;
    const due = new Date(l.dueDate);
    return due < new Date();
  });

  const handleAddBook = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBookForm.title) return;

    addLibraryBook({
      isbn: newBookForm.isbn.trim() || `ISBN-MZ-${Math.floor(100000 + Math.random() * 900000)}`,
      title: newBookForm.title,
      author: newBookForm.author,
      publisher: newBookForm.publisher,
      category: newBookForm.category,
      gradeLevel: newBookForm.gradeLevel,
      totalCopies: Number(newBookForm.totalCopies) || 1,
      availableCopies: Number(newBookForm.totalCopies) || 1,
      shelfLocation: newBookForm.shelfLocation
    });

    setShowAddBookModal(false);
    setNewBookForm({
      isbn: '',
      title: '',
      author: '',
      publisher: 'Editora Nacional de Moçambique / MINEDH',
      category: 'Manual Escolar',
      gradeLevel: '10ª Classe',
      totalCopies: 50,
      availableCopies: 50,
      shelfLocation: 'Estante 02 - Prateleira A'
    });
  };

  const handleBorrowBook = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBook || !loanForm.studentId) return;

    const student = students.find(s => s.id === loanForm.studentId);

    borrowBook({
      bookId: selectedBook.id,
      bookTitle: selectedBook.title,
      studentId: loanForm.studentId,
      studentName: student?.name || loanForm.studentName || 'Aluno(a)',
      loanDate: new Date().toISOString().split('T')[0],
      dueDate: loanForm.dueDate
    });

    setShowBorrowModal(false);
    setSelectedBook(null);
    setLoanForm({ studentId: '', studentName: '', dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-purple-950 via-slate-900 to-indigo-950 text-white p-6 rounded-2xl shadow-md">
        <div>
          <div className="flex items-center gap-2 mb-1 text-purple-300 text-xs font-bold uppercase tracking-wider">
            <BookOpen className="w-4 h-4" />
            <span>EduGestão • Biblioteca Escolar & Centro de Recursos de Aprendizagem</span>
          </div>
          <h1 className="text-2xl font-bold">Gestão da Biblioteca e Manuais Escolares</h1>
          <p className="text-purple-100/80 text-sm mt-1">
            Catálogo bibliográfico oficial do MINEDH, controlo de requisições de livros, devoluções e leituras de alunos e professores.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <Button 
            onClick={() => setShowAddBookModal(true)}
            className="bg-purple-500 hover:bg-purple-600 text-white font-bold text-sm shadow-sm flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            <span>Cadastrar Novo Livro</span>
          </Button>
          <Button 
            onClick={() => window.print()}
            variant="outline"
            className="text-white border-white/30 hover:bg-white/10 font-bold text-sm flex items-center gap-2"
          >
            <Printer className="w-4 h-4" />
            <span>Relatório de Empréstimos</span>
          </Button>
        </div>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="p-4 bg-white border border-slate-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-slate-500">Títulos no Catálogo</p>
              <p className="text-2xl font-bold text-slate-800">{libraryBooks.length}</p>
            </div>
            <div className="p-3 bg-purple-50 rounded-xl text-purple-600">
              <Book className="w-5 h-5" />
            </div>
          </div>
          <p className="text-xs text-slate-500 mt-2">
            {libraryBooks.reduce((acc, b) => acc + b.totalCopies, 0)} exemplares físicos
          </p>
        </Card>

        <Card className="p-4 bg-white border border-slate-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-slate-500">Exemplares Disponíveis</p>
              <p className="text-2xl font-bold text-emerald-700">
                {libraryBooks.reduce((acc, b) => acc + b.availableCopies, 0)}
              </p>
            </div>
            <div className="p-3 bg-emerald-50 rounded-xl text-emerald-600">
              <CheckCircle className="w-5 h-5" />
            </div>
          </div>
          <p className="text-xs text-emerald-600 mt-2 font-medium">Prontos para empréstimo</p>
        </Card>

        <Card className="p-4 bg-white border border-slate-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-slate-500">Empréstimos Activos</p>
              <p className="text-2xl font-bold text-indigo-700">{activeLoans.length}</p>
            </div>
            <div className="p-3 bg-indigo-50 rounded-xl text-indigo-600">
              <Clock className="w-5 h-5" />
            </div>
          </div>
          <p className="text-xs text-indigo-600 mt-2 font-medium">Com alunos e docentes</p>
        </Card>

        <Card className="p-4 bg-white border border-slate-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-slate-500">Devoluções em Atraso</p>
              <p className="text-2xl font-bold text-rose-600">{overdueLoans.length}</p>
            </div>
            <div className="p-3 bg-rose-50 rounded-xl text-rose-600">
              <AlertTriangle className="w-5 h-5" />
            </div>
          </div>
          <p className="text-xs text-rose-600 mt-2 font-medium">Notificar encarregados</p>
        </Card>
      </div>

      {/* Tabs */}
      <div className="border-b border-slate-200 flex gap-2">
        <button
          onClick={() => setActiveTab('catalog')}
          className={`px-4 py-2.5 font-bold text-sm border-b-2 flex items-center gap-2 transition-all ${
            activeTab === 'catalog' 
              ? 'border-purple-600 text-purple-700 bg-purple-50/50 rounded-t-lg' 
              : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
        >
          <Book className="w-4 h-4" />
          <span>Catálogo de Manuais & Livros ({libraryBooks.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('loans')}
          className={`px-4 py-2.5 font-bold text-sm border-b-2 flex items-center gap-2 transition-all ${
            activeTab === 'loans' 
              ? 'border-purple-600 text-purple-700 bg-purple-50/50 rounded-t-lg' 
              : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
        >
          <Clock className="w-4 h-4" />
          <span>Empréstimos Activos ({activeLoans.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('overdue')}
          className={`px-4 py-2.5 font-bold text-sm border-b-2 flex items-center gap-2 transition-all ${
            activeTab === 'overdue' 
              ? 'border-rose-600 text-rose-700 bg-rose-50/50 rounded-t-lg' 
              : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
        >
          <AlertTriangle className="w-4 h-4" />
          <span>Alertas de Atraso ({overdueLoans.length})</span>
        </button>
      </div>

      {/* Tab 1: Catalog */}
      {activeTab === 'catalog' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
            <div className="relative flex-1 w-full">
              <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
              <input
                type="text"
                placeholder="Pesquisar por título, autor ou ISBN..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <select
                value={gradeFilter}
                onChange={(e) => setGradeFilter(e.target.value)}
                className="px-3 py-2 text-sm border border-slate-300 rounded-lg bg-white"
              >
                <option value="all">Todas as Classes</option>
                <option value="7ª Classe">7ª Classe</option>
                <option value="8ª Classe">8ª Classe</option>
                <option value="9ª Classe">9ª Classe</option>
                <option value="10ª Classe">10ª Classe</option>
                <option value="11ª Classe">11ª Classe</option>
                <option value="12ª Classe">12ª Classe</option>
                <option value="Geral">Geral / Referência</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredBooks.map((book) => (
              <Card key={book.id} className="p-5 border border-slate-200 hover:shadow-md transition-shadow flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-start mb-2">
                    <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-purple-50 text-purple-700 border border-purple-200">
                      {book.gradeLevel || 'Ensino Geral'}
                    </span>
                    <span className={`px-2 py-0.5 rounded text-xs font-bold ${
                      book.availableCopies > 0 ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                    }`}>
                      {book.availableCopies} disp. / {book.totalCopies} total
                    </span>
                  </div>

                  <h3 className="font-bold text-slate-900 text-base line-clamp-2">{book.title}</h3>
                  <p className="text-xs text-slate-500 mt-1">Autor: <strong>{book.author}</strong></p>
                  <p className="text-xs text-slate-400 font-mono mt-0.5">ISBN: {book.isbn}</p>
                  <p className="text-xs text-indigo-700 font-medium mt-2 bg-slate-50 p-2 rounded border border-slate-100">
                    📍 {book.shelfLocation}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 flex justify-between items-center">
                  <span className="text-xs text-slate-500">{book.category}</span>
                  <Button
                    size="sm"
                    disabled={book.availableCopies <= 0}
                    onClick={() => {
                      setSelectedBook(book);
                      setShowBorrowModal(true);
                    }}
                    className="bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold px-3 py-1.5"
                  >
                    Emprestar Livro
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Tab 2: Loans */}
      {activeTab === 'loans' && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-slate-700 font-semibold border-b border-slate-200">
                <tr>
                  <th className="px-4 py-3">Livro Requisitado</th>
                  <th className="px-4 py-3">Aluno / Leitor</th>
                  <th className="px-4 py-3">Data Empréstimo</th>
                  <th className="px-4 py-3">Data Limite Devolução</th>
                  <th className="px-4 py-3">Estado</th>
                  <th className="px-4 py-3 text-right">Ação</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {libraryLoans.map((loan) => (
                  <tr key={loan.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3 font-bold text-slate-800">{loan.bookTitle}</td>
                    <td className="px-4 py-3 text-slate-700 font-medium">{loan.studentName}</td>
                    <td className="px-4 py-3 text-xs text-slate-500">{loan.loanDate}</td>
                    <td className="px-4 py-3 text-xs font-bold text-indigo-700">{loan.dueDate}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-bold ${
                        loan.status === 'Devolvido' ? 'bg-slate-100 text-slate-700' :
                        loan.status === 'Atrasado' ? 'bg-rose-100 text-rose-800' : 'bg-emerald-100 text-emerald-800'
                      }`}>
                        {loan.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      {loan.status === 'Activo' && (
                        <Button
                          size="sm"
                          onClick={() => returnBook(loan.id)}
                          className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold"
                        >
                          Devolver
                        </Button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 3: Overdue */}
      {activeTab === 'overdue' && (
        <div className="space-y-4">
          <div className="bg-rose-50 border border-rose-200 p-4 rounded-xl text-xs text-rose-800 flex items-center gap-3">
            <AlertTriangle className="w-5 h-5 text-rose-600 flex-shrink-0" />
            <p>
              Os seguintes livros ultrapassaram a data limite estipulada pelo regulamento interno da biblioteca escolar. Clique em notificar para gerar aviso ao encarregado de educação.
            </p>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-slate-700 font-semibold border-b">
                <tr>
                  <th className="px-4 py-3">Livro</th>
                  <th className="px-4 py-3">Aluno</th>
                  <th className="px-4 py-3">Prazo Limite</th>
                  <th className="px-4 py-3 text-right">Ação</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {overdueLoans.map((loan) => (
                  <tr key={loan.id} className="hover:bg-rose-50/50">
                    <td className="px-4 py-3 font-bold text-slate-800">{loan.bookTitle}</td>
                    <td className="px-4 py-3 font-medium text-slate-700">{loan.studentName}</td>
                    <td className="px-4 py-3 font-bold text-rose-600 text-xs">{loan.dueDate}</td>
                    <td className="px-4 py-3 text-right">
                      <Button
                        size="sm"
                        onClick={() => returnBook(loan.id)}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold mr-2"
                      >
                        Registar Devolução
                      </Button>
                    </td>
                  </tr>
                ))}
                {overdueLoans.length === 0 && (
                  <tr>
                    <td colSpan={4} className="text-center py-6 text-slate-500">
                      Nenhum livro em atraso no momento.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add Book Modal */}
      {showAddBookModal && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <div className="flex justify-between items-center border-b pb-3">
              <h3 className="font-bold text-slate-900 text-lg">Cadastrar Livro na Biblioteca</h3>
              <button onClick={() => setShowAddBookModal(false)} className="text-slate-400 hover:text-slate-600">✕</button>
            </div>

            <form onSubmit={handleAddBook} className="space-y-3">
              <div>
                <label className="text-xs font-bold text-slate-700">Título da Obra / Manual</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Saber Matemática - 10ª Classe"
                  value={newBookForm.title}
                  onChange={(e) => setNewBookForm(prev => ({ ...prev, title: e.target.value }))}
                  className="w-full mt-1 px-3 py-2 border rounded-lg text-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700">Autor</label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: Carlos Machava"
                    value={newBookForm.author}
                    onChange={(e) => setNewBookForm(prev => ({ ...prev, author: e.target.value }))}
                    className="w-full mt-1 px-3 py-2 border rounded-lg text-sm"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700">Classe / Nível</label>
                  <select
                    value={newBookForm.gradeLevel}
                    onChange={(e) => setNewBookForm(prev => ({ ...prev, gradeLevel: e.target.value }))}
                    className="w-full mt-1 px-3 py-2 border rounded-lg text-sm bg-white"
                  >
                    <option value="7ª Classe">7ª Classe</option>
                    <option value="8ª Classe">8ª Classe</option>
                    <option value="9ª Classe">9ª Classe</option>
                    <option value="10ª Classe">10ª Classe</option>
                    <option value="11ª Classe">11ª Classe</option>
                    <option value="12ª Classe">12ª Classe</option>
                    <option value="Geral">Geral</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700">Exemplares</label>
                  <input
                    type="number"
                    min="1"
                    value={newBookForm.totalCopies}
                    onChange={(e) => setNewBookForm(prev => ({ ...prev, totalCopies: Number(e.target.value) }))}
                    className="w-full mt-1 px-3 py-2 border rounded-lg text-sm"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700">Localização / Estante</label>
                  <input
                    type="text"
                    placeholder="Ex: Estante 02 - Prateleira A"
                    value={newBookForm.shelfLocation}
                    onChange={(e) => setNewBookForm(prev => ({ ...prev, shelfLocation: e.target.value }))}
                    className="w-full mt-1 px-3 py-2 border rounded-lg text-sm"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t">
                <Button type="button" variant="outline" onClick={() => setShowAddBookModal(false)}>Cancelar</Button>
                <Button type="submit" className="bg-purple-600 hover:bg-purple-700 text-white font-bold">Gravar no Catálogo</Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Borrow Modal */}
      {showBorrowModal && selectedBook && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <div className="flex justify-between items-center border-b pb-3">
              <h3 className="font-bold text-slate-900 text-lg">Empréstimo de Livro</h3>
              <button onClick={() => setShowBorrowModal(false)} className="text-slate-400 hover:text-slate-600">✕</button>
            </div>

            <div className="bg-purple-50 p-3 rounded-lg text-xs text-purple-900">
              <p><strong>Livro:</strong> {selectedBook.title}</p>
              <p><strong>Autor:</strong> {selectedBook.author}</p>
              <p><strong>Disponíveis:</strong> {selectedBook.availableCopies} unidades</p>
            </div>

            <form onSubmit={handleBorrowBook} className="space-y-3">
              <div>
                <label className="text-xs font-bold text-slate-700">Aluno Requisitante</label>
                <select
                  required
                  value={loanForm.studentId}
                  onChange={(e) => setLoanForm(prev => ({ ...prev, studentId: e.target.value }))}
                  className="w-full mt-1 px-3 py-2 border rounded-lg text-sm bg-white"
                >
                  <option value="">Selecione o aluno...</option>
                  {students.map(st => (
                    <option key={st.id} value={st.id}>{st.name} ({st.id})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700">Data Limite de Devolução</label>
                <input
                  type="date"
                  required
                  value={loanForm.dueDate}
                  onChange={(e) => setLoanForm(prev => ({ ...prev, dueDate: e.target.value }))}
                  className="w-full mt-1 px-3 py-2 border rounded-lg text-sm"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t">
                <Button type="button" variant="outline" onClick={() => setShowBorrowModal(false)}>Cancelar</Button>
                <Button type="submit" className="bg-purple-600 hover:bg-purple-700 text-white font-bold">Confirmar Empréstimo</Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
