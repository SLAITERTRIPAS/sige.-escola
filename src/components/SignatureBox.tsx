import React, { useState, useEffect } from 'react';
import { useStore } from '../store';
import { PenTool, CheckCircle2 } from 'lucide-react';

interface SignatureBoxProps {
  label?: string;
  className?: string;
  targetRole?: 'director' | 'pedagogical' | 'teacher' | 'secretariat' | 'admin';
  forcedSignature?: string;
  forcedSignerName?: string;
}

export const SignatureBox: React.FC<SignatureBoxProps> = ({ 
  label = "O Director da Escola", 
  className = "",
  targetRole,
  forcedSignature,
  forcedSignerName
}) => {
  const { currentUser, users } = useStore();
  const [signature, setSignature] = useState<string | null>(forcedSignature || null);
  const [signerName, setSignerName] = useState<string>(forcedSignerName || '');

  // Auto-detect matching signature based on label or targetRole
  useEffect(() => {
    if (forcedSignature) {
      setSignature(forcedSignature);
      if (forcedSignerName) setSignerName(forcedSignerName);
      return;
    }

    // Determine target role from label if not explicitly provided
    let derivedRole = targetRole;
    if (!derivedRole) {
      const lowerLabel = label.toLowerCase();
      if (lowerLabel.includes('director da escola')) derivedRole = 'director';
      else if (lowerLabel.includes('pedagógico') || lowerLabel.includes('pedagogico')) derivedRole = 'pedagogical';
      else if (lowerLabel.includes('turma') || lowerLabel.includes('júri') || lowerLabel.includes('juri') || lowerLabel.includes('professor')) derivedRole = 'teacher';
      else if (lowerLabel.includes('secretár') || lowerLabel.includes('secretar')) derivedRole = 'secretariat';
    }

    // 1. Check currentUser first if role matches or if currentUser is acting
    if (currentUser?.signature && (!derivedRole || currentUser.role === derivedRole || currentUser.role === 'admin')) {
      setSignature(currentUser.signature);
      setSignerName(currentUser.name);
      return;
    }

    // 2. Check users array for a user with the matching role and signature
    if (derivedRole) {
      const matchingUser = users.find(u => u.role === derivedRole && u.signature);
      if (matchingUser) {
        setSignature(matchingUser.signature!);
        setSignerName(matchingUser.name);
        return;
      }
    }

    // 3. Fallback to currentUser if they have a signature
    if (currentUser?.signature) {
      setSignature(currentUser.signature);
      setSignerName(currentUser.name);
    }
  }, [currentUser, users, label, targetRole, forcedSignature, forcedSignerName]);

  const handleClick = () => {
    if (currentUser?.signature) {
      setSignature(currentUser.signature);
      setSignerName(currentUser.name);
    } else {
      alert(`O utilizador atual (${currentUser?.name || 'Anónimo'}) não possui nenhuma assinatura digital carregada no perfil (ID: ${currentUser?.id || 'N/A'}). Aceda ao menu 'Assinatura' para desenhar ou carregar a sua assinatura digital.`);
    }
  };

  return (
    <div className={`flex flex-col items-center ${className}`}>
      <span className="text-[10px] font-bold uppercase tracking-wide text-black mb-1 text-center">{label}</span>
      <div 
        onClick={handleClick}
        title="Assinatura Digital Vinculada - Clique para alterar/atualizar com seu perfil"
        className="cursor-pointer border border-dashed border-black/50 p-1 rounded bg-white hover:bg-slate-50 transition-all text-center w-48 h-16 flex flex-col items-center justify-center relative print:border-none"
      >
        {signature ? (
          <div className="relative w-full h-full flex flex-col items-center justify-center">
            <img src={signature} alt="Assinatura Digital" className="max-h-12 max-w-full object-contain" />
            <div className="absolute top-0.5 right-0.5 bg-emerald-100 text-emerald-800 rounded-full p-0.5 no-print" title="Assinatura Digital Autenticada pelo ID do Utilizador">
              <CheckCircle2 size={10} />
            </div>
          </div>
        ) : (
          <div className="text-[9px] text-slate-400 flex flex-col items-center gap-0.5 no-print select-none">
            <PenTool size={12} className="text-blue-600" />
            <span>Clique para injetar assinatura</span>
          </div>
        )}
      </div>
      <span className="text-[9px] text-slate-700 mt-0.5 font-mono font-medium text-center truncate max-w-[200px]">
        {signerName || currentUser?.name || 'Sem Assinatura Vinculada'}
      </span>
    </div>
  );
};
