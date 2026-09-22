import React, { useState } from 'react';
import { Card, Button, Input } from './ui';
import { Upload, PenTool, MessageSquare, FileCheck } from 'lucide-react';

export const SignatureManager: React.FC = () => {
  const [signature, setSignature] = useState<string | null>(null);
  const [parecer, setParecer] = useState('');
  const [despacho, setDespacho] = useState('');

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSignature(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in duration-500">
      <h2 className="text-2xl font-bold text-slate-900">Gestão de Assinaturas e Despachos</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="p-6 space-y-4">
          <h3 className="font-bold flex items-center gap-2"><PenTool size={18} /> Carregar Minha Assinatura</h3>
          <input type="file" accept="image/*" onChange={handleFileUpload} className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100" />
        </Card>
        
        <Card className="p-6 space-y-4">
          <h3 className="font-bold flex items-center gap-2"><FileCheck size={18} /> Minha Assinatura</h3>
          {signature ? (
            <img src={signature} alt="Assinatura" className="h-24 w-auto border border-slate-200 rounded p-1" />
          ) : (
            <div className="h-24 border-2 border-dashed border-slate-200 rounded flex items-center justify-center text-slate-400">Nenhuma assinatura</div>
          )}
        </Card>
      </div>

      <Card className="p-6 space-y-4">
        <h3 className="font-bold flex items-center gap-2"><MessageSquare size={18} /> Meu Parecer</h3>
        <textarea 
          value={parecer} 
          onChange={(e) => setParecer(e.target.value)}
          className="w-full h-32 p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
          placeholder="Digite seu parecer..."
        />
      </Card>

      <Card className="p-6 space-y-4">
        <h3 className="font-bold flex items-center gap-2"><FileCheck size={18} /> Meu Despacho</h3>
        <textarea 
          value={despacho} 
          onChange={(e) => setDespacho(e.target.value)}
          className="w-full h-32 p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
          placeholder="Digite seu despacho..."
        />
      </Card>
      
      <Button className="w-full bg-blue-600 hover:bg-blue-700">Guardar Alterações</Button>
    </div>
  );
};
