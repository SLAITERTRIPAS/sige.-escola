import React, { useState, useRef, useEffect } from 'react';
import { useStore } from '../store';
import { Card, Button } from './ui';
import { 
  Upload, 
  PenTool, 
  Trash2, 
  CheckCircle2, 
  ShieldCheck, 
  UserCheck, 
  FileText, 
  Download, 
  RotateCcw,
  Sparkles,
  Info
} from 'lucide-react';

export const SignatureManager: React.FC = () => {
  const { currentUser, updateUserSignature } = useStore();
  const [activeTab, setActiveTab] = useState<'draw' | 'upload'>('draw');
  const [signature, setSignature] = useState<string | null>(currentUser?.signature || null);
  const [penColor, setPenColor] = useState<string>('#1e3a8a'); // Default Pen Blue
  const [penLineWidth, setPenLineWidth] = useState<number>(2.5);
  const [success, setSuccess] = useState<boolean>(false);
  const [isDrawing, setIsDrawing] = useState<boolean>(false);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Setup canvas background
  useEffect(() => {
    if (activeTab === 'draw' && canvasRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      if (ctx && canvas.width > 0 && canvas.height > 0) {
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
      }
    }
  }, [activeTab]);

  // Start Drawing
  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    setIsDrawing(true);
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

    ctx.beginPath();
    ctx.moveTo(clientX - rect.left, clientY - rect.top);
  };

  // Draw Stroke
  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

    ctx.strokeStyle = penColor;
    ctx.lineWidth = penLineWidth;
    ctx.lineTo(clientX - rect.left, clientY - rect.top);
    ctx.stroke();
  };

  // Stop Drawing
  const stopDrawing = () => {
    if (isDrawing) {
      setIsDrawing(false);
    }
  };

  // Clear Canvas
  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  };

  // Apply Drawing to Signature
  const applyCanvasSignature = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    // Check if canvas is empty
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const pixelData = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
    const hasDrawing = pixelData.some(alpha => alpha !== 0);

    if (!hasDrawing) {
      alert('Desenhe a sua assinatura no quadro antes de confirmar.');
      return;
    }

    const dataUrl = canvas.toDataURL('image/png');
    setSignature(dataUrl);
    if (currentUser) {
      updateUserSignature(currentUser.id, dataUrl);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3500);
    }
  };

  // Handle File Upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        alert('O ficheiro da imagem deve ter menos de 2MB.');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        const dataUrl = reader.result as string;
        setSignature(dataUrl);
        if (currentUser) {
          updateUserSignature(currentUser.id, dataUrl);
          setSuccess(true);
          setTimeout(() => setSuccess(false), 3500);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Remove Signature
  const handleRemoveSignature = () => {
    if (window.confirm('Tem certeza que deseja remover a assinatura digital vinculada ao seu perfil?')) {
      setSignature(null);
      if (currentUser) {
        updateUserSignature(currentUser.id, '');
        clearCanvas();
      }
    }
  };

  // Determine document permissions based on user role
  const getRolePermissions = () => {
    const role = currentUser?.role || 'teacher';
    switch (role) {
      case 'director':
        return {
          title: 'Director da Escola',
          badge: 'bg-amber-100 text-amber-900 border-amber-300',
          docs: [
            'Pautas Oficiais de Frequência e Exames (Assinatura do Director)',
            'Certificados e Declarações de Notas com Carimbo Digital',
            'Processo Individual do Aluno (Ficha de Matrícula e Histórico)',
            'Relatórios Trimestrais de Gestão Escolar'
          ]
        };
      case 'pedagogical':
        return {
          title: 'Dir. Adjunto Pedagógico',
          badge: 'bg-purple-100 text-purple-900 border-purple-300',
          docs: [
            'Pautas de Exame e Frequência (Visto Pedagógico)',
            'Relatórios Trimestrais de Aproveitamento Académico',
            'Calendários de Exames e Escalões de Avaliação'
          ]
        };
      case 'teacher':
        return {
          title: 'Director de Turma / Professor',
          badge: 'bg-blue-100 text-blue-900 border-blue-300',
          docs: [
            'Caderneta de Avaliação Contínua do Professor',
            'Pautas da Turma (Assinatura do Director de Turma / Presidente do Júri)',
            'Boletins de Informação Trimestral aos Encarregados'
          ]
        };
      case 'secretariat':
        return {
          title: 'Secretaria Escolar',
          badge: 'bg-emerald-100 text-emerald-900 border-emerald-300',
          docs: [
            'Emissão de Guias de Transferência e Matrículas',
            'Declarações com e sem Notas e Certificados de Conclusão'
          ]
        };
      default:
        return {
          title: 'Administrador do Sistema',
          badge: 'bg-slate-200 text-slate-900 border-slate-300',
          docs: [
            'Autenticação de Pautas e Documentos Gerais do Sistema'
          ]
        };
    };
  };

  const roleInfo = getRolePermissions();

  return (
    <div className="max-w-5xl mx-auto space-y-6 animate-in fade-in duration-500 pb-12">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 rounded-2xl p-6 text-white shadow-lg flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <ShieldCheck className="text-amber-400 h-6 w-6" />
            <h2 className="text-2xl font-bold tracking-tight">Painel de Assinatura Digital do Colaborador</h2>
          </div>
          <p className="text-xs text-blue-200 max-w-2xl">
            Desenhe ou faça upload da sua assinatura oficial. A sua assinatura fica vinculada ao seu ID de Utilizador (<span className="font-mono text-amber-300 font-bold">{currentUser?.id || 'N/A'}</span>) e é injetada automaticamente em pautas, cadernetas e certificados de acordo com as suas permissões.
          </p>
        </div>

        {success && (
          <div className="bg-emerald-500/90 text-white px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 shadow-md animate-bounce">
            <CheckCircle2 size={18} /> Assinatura guardada e vinculada com sucesso!
          </div>
        )}
      </div>

      {/* User Identity & Role Badge Card */}
      <Card className="p-5 bg-white border border-slate-200 shadow-sm flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="h-12 w-12 rounded-full bg-blue-100 text-blue-900 flex items-center justify-center font-black text-lg border border-blue-200 shadow-inner">
            {currentUser?.name ? currentUser.name.charAt(0).toUpperCase() : 'U'}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-base text-slate-900">{currentUser?.name || 'Colaborador'}</h3>
              <span className={`text-[10px] font-bold uppercase px-2.5 py-0.5 rounded-full border ${roleInfo.badge}`}>
                {roleInfo.title}
              </span>
            </div>
            <p className="text-xs text-slate-500 flex items-center gap-2 mt-0.5">
              <span>Email: <strong className="text-slate-700">{currentUser?.email}</strong></span>
              <span>•</span>
              <span>ID: <strong className="font-mono text-slate-700">{currentUser?.id}</strong></span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 bg-slate-50 px-3 py-2 rounded-xl border border-slate-200 text-xs text-slate-600">
          <UserCheck size={16} className="text-blue-700" />
          <span>Injeção Automática de Assinatura: <strong className="text-emerald-700">Ativa</strong></span>
        </div>
      </Card>

      {/* Main Grid: Signature Creator + Live Preview & Permissions */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Creator / Drawing Pad (8 cols) */}
        <div className="lg:col-span-7 space-y-5">
          <Card className="p-6 border border-slate-200 bg-white shadow-sm space-y-5">
            {/* Tabs selection */}
            <div className="flex border-b border-slate-200">
              <button
                onClick={() => setActiveTab('draw')}
                className={`pb-3 px-4 text-xs font-bold flex items-center gap-2 border-b-2 transition-all ${
                  activeTab === 'draw'
                    ? 'border-blue-900 text-blue-900'
                    : 'border-transparent text-slate-400 hover:text-slate-600'
                }`}
              >
                <PenTool size={16} /> Desenhar na Tela (Mouse / Touch)
              </button>
              <button
                onClick={() => setActiveTab('upload')}
                className={`pb-3 px-4 text-xs font-bold flex items-center gap-2 border-b-2 transition-all ${
                  activeTab === 'upload'
                    ? 'border-blue-900 text-blue-900'
                    : 'border-transparent text-slate-400 hover:text-slate-600'
                }`}
              >
                <Upload size={16} /> Carregar Imagem
              </button>
            </div>

            {/* TAB 1: DRAW CANVAS */}
            {activeTab === 'draw' && (
              <div className="space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-50 p-3 rounded-xl border border-slate-200">
                  {/* Pen Color Selector */}
                  <div className="flex items-center gap-2 text-xs font-semibold text-slate-700">
                    <span>Cor:</span>
                    <button
                      onClick={() => setPenColor('#1e3a8a')}
                      className={`h-6 w-6 rounded-full border-2 ${penColor === '#1e3a8a' ? 'border-slate-900 scale-110' : 'border-transparent'}`}
                      style={{ backgroundColor: '#1e3a8a' }}
                      title="Azul Caneta Oficial"
                    />
                    <button
                      onClick={() => setPenColor('#0f172a')}
                      className={`h-6 w-6 rounded-full border-2 ${penColor === '#0f172a' ? 'border-slate-900 scale-110' : 'border-transparent'}`}
                      style={{ backgroundColor: '#0f172a' }}
                      title="Preto Caneta"
                    />
                    <button
                      onClick={() => setPenColor('#dc2626')}
                      className={`h-6 w-6 rounded-full border-2 ${penColor === '#dc2626' ? 'border-slate-900 scale-110' : 'border-transparent'}`}
                      style={{ backgroundColor: '#dc2626' }}
                      title="Vermelho"
                    />
                  </div>

                  {/* Pen Line Width */}
                  <div className="flex items-center gap-2 text-xs font-semibold text-slate-700">
                    <span>Espessura:</span>
                    <button
                      onClick={() => setPenLineWidth(1.5)}
                      className={`px-2 py-0.5 text-[11px] rounded border ${penLineWidth === 1.5 ? 'bg-blue-900 text-white font-bold' : 'bg-white text-slate-700'}`}
                    >
                      Fina
                    </button>
                    <button
                      onClick={() => setPenLineWidth(2.5)}
                      className={`px-2 py-0.5 text-[11px] rounded border ${penLineWidth === 2.5 ? 'bg-blue-900 text-white font-bold' : 'bg-white text-slate-700'}`}
                    >
                      Média
                    </button>
                    <button
                      onClick={() => setPenLineWidth(4)}
                      className={`px-2 py-0.5 text-[11px] rounded border ${penLineWidth === 4 ? 'bg-blue-900 text-white font-bold' : 'bg-white text-slate-700'}`}
                    >
                      Espessa
                    </button>
                  </div>

                  {/* Clear button */}
                  <Button
                    onClick={clearCanvas}
                    variant="outline"
                    className="text-xs py-1 px-3 text-slate-600 hover:text-red-700 gap-1"
                  >
                    <RotateCcw size={14} /> Limpar
                  </Button>
                </div>

                {/* Canvas Box */}
                <div className="relative border-2 border-dashed border-slate-300 rounded-xl bg-white overflow-hidden shadow-inner flex justify-center items-center">
                  <canvas
                    ref={canvasRef}
                    width={520}
                    height={180}
                    onMouseDown={startDrawing}
                    onMouseMove={draw}
                    onMouseUp={stopDrawing}
                    onMouseLeave={stopDrawing}
                    onTouchStart={startDrawing}
                    onTouchMove={draw}
                    onTouchEnd={stopDrawing}
                    className="cursor-crosshair touch-none bg-transparent max-w-full h-auto"
                  />
                  <div className="absolute bottom-2 left-3 text-[10px] text-slate-400 select-none pointer-events-none font-sans">
                    Assine dentro do quadro com o mouse ou ecrã tátil
                  </div>
                </div>

                <Button
                  onClick={applyCanvasSignature}
                  className="w-full bg-blue-900 hover:bg-blue-950 text-white font-bold py-3 rounded-xl gap-2 shadow-sm text-xs uppercase tracking-wider"
                >
                  <Sparkles size={16} /> Guardar e Injetar Assinatura Desenhada
                </Button>
              </div>
            )}

            {/* TAB 2: FILE UPLOAD */}
            {activeTab === 'upload' && (
              <div className="space-y-4">
                <div className="border-2 border-dashed border-slate-300 rounded-2xl p-8 text-center bg-slate-50 hover:bg-blue-50/50 transition-colors cursor-pointer relative">
                  <input
                    type="file"
                    accept="image/png, image/jpeg, image/svg+xml"
                    onChange={handleFileUpload}
                    className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                  />
                  <div className="flex flex-col items-center justify-center gap-2">
                    <div className="h-12 w-12 rounded-full bg-blue-100 text-blue-800 flex items-center justify-center">
                      <Upload size={22} />
                    </div>
                    <p className="font-bold text-sm text-slate-800">Clique para selecionar ou arraste o ficheiro de imagem</p>
                    <p className="text-xs text-slate-500">Aceita formatos PNG, JPEG ou SVG (Máximo 2MB)</p>
                    <p className="text-[11px] text-slate-400 italic mt-1">Recomendado: Imagem recortada com fundo transparente.</p>
                  </div>
                </div>
              </div>
            )}
          </Card>
        </div>

        {/* Right Column: Active Signature Preview + Permissions (4 cols) */}
        <div className="lg:col-span-5 space-y-5">
          {/* Active Signature Box Card */}
          <Card className="p-6 border border-slate-200 bg-white shadow-sm space-y-4">
            <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2 border-b pb-2">
              <CheckCircle2 size={18} className="text-emerald-600" /> Assinatura Ativa Vinculada ao Perfil
            </h3>

            {signature ? (
              <div className="space-y-3">
                <div className="h-32 border border-slate-200 bg-slate-50/80 rounded-xl p-3 flex flex-col items-center justify-center relative shadow-inner">
                  <img src={signature} alt="Assinatura Vinculada" className="max-h-24 max-w-full object-contain" />
                  <span className="absolute bottom-1 right-2 text-[9px] font-mono text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200 font-bold">
                    ID: {currentUser?.id}
                  </span>
                </div>

                <div className="flex gap-2">
                  <Button
                    onClick={handleRemoveSignature}
                    variant="outline"
                    className="w-full text-xs text-red-600 border-red-200 hover:bg-red-50 py-2.5 font-bold gap-1.5"
                  >
                    <Trash2 size={14} /> Remover Assinatura
                  </Button>
                </div>
              </div>
            ) : (
              <div className="h-32 border-2 border-dashed border-slate-200 bg-slate-50 rounded-xl flex flex-col items-center justify-center text-slate-400 text-xs gap-1.5 p-4 text-center">
                <PenTool size={20} className="text-slate-300" />
                <span>Nenhuma assinatura vinculada neste momento.</span>
                <span className="text-[10px] text-slate-400">Desenhe ou carregue uma imagem para ativar.</span>
              </div>
            )}
          </Card>

          {/* Role Document Permissions Card */}
          <Card className="p-6 border border-slate-200 bg-slate-50/80 shadow-sm space-y-3">
            <h3 className="font-bold text-xs text-slate-900 uppercase tracking-wider flex items-center gap-2 border-b pb-2">
              <FileText size={16} className="text-blue-800" /> Injeção Automática em Documentos ({roleInfo.title})
            </h3>
            <p className="text-[11px] text-slate-600">
              Com o cargo de <strong className="text-slate-900">{roleInfo.title}</strong>, a sua assinatura vinculada será automaticamente aplicada nos seguintes documentos oficiais:
            </p>
            <ul className="space-y-2 text-xs text-slate-700">
              {roleInfo.docs.map((doc, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <CheckCircle2 size={14} className="text-emerald-600 shrink-0 mt-0.5" />
                  <span>{doc}</span>
                </li>
              ))}
            </ul>
            <div className="mt-3 pt-2 border-t border-slate-200 flex items-center gap-1.5 text-[10px] text-slate-500">
              <Info size={12} className="text-blue-600 shrink-0" />
              <span>Pode re-injetar ou atualizar sua assinatura a qualquer momento ao visualizar o documento.</span>
            </div>
          </Card>

        </div>

      </div>
    </div>
  );
};

