import React, { useState } from 'react';
import { Send, User, MessageSquare } from 'lucide-react';
import { useStore } from '../store';
import { ChatMessage, Role } from '../types';
import { motion, AnimatePresence } from 'motion/react';

export const GovernanceChat: React.FC = () => {
  const { chatMessages, currentUser, sendChatMessage } = useStore();
  const [text, setText] = useState('');

  if (!currentUser) return null;

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;

    let receiverLevel: 'national' | 'provincial' | 'district' | 'school' = 'school';
    if (currentUser.role === 'national') receiverLevel = 'provincial';
    else if (currentUser.role === 'provincial') receiverLevel = 'district';
    else if (currentUser.role === 'district') receiverLevel = 'school';
    else if (currentUser.role === 'director' || currentUser.role === 'pedagogical') receiverLevel = 'district';

    sendChatMessage({
      senderId: currentUser.id,
      senderName: currentUser.name,
      senderRole: currentUser.role,
      receiverLevel,
      text: text.trim()
    });
    setText('');
  };

  // Filter messages based on hierarchy
  const visibleMessages = chatMessages.filter(msg => {
    if (currentUser.role === 'national') return true; // Sees everything
    if (currentUser.role === 'provincial') {
      return msg.senderRole === 'national' || msg.senderRole === 'provincial' || msg.senderRole === 'district';
    }
    if (currentUser.role === 'district') {
      return msg.senderRole === 'provincial' || msg.senderRole === 'district' || msg.senderRole === 'director' || msg.senderRole === 'pedagogical';
    }
    if (currentUser.role === 'director' || currentUser.role === 'pedagogical') {
      return msg.senderRole === 'district' || msg.senderRole === 'director' || msg.senderRole === 'pedagogical';
    }
    return false;
  });

  return (
    <div className="flex flex-col h-[500px] bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
      <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center gap-2">
        <MessageSquare className="w-5 h-5 text-blue-600" />
        <h3 className="font-semibold text-slate-800">Canal de Comunicação Hierárquica</h3>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        <AnimatePresence initial={false}>
          {visibleMessages.map((msg) => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex ${msg.senderId === currentUser.id ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`max-w-[80%] rounded-lg p-3 ${
                msg.senderId === currentUser.id 
                  ? 'bg-blue-600 text-white rounded-br-none' 
                  : 'bg-slate-100 text-slate-800 rounded-bl-none'
              }`}>
                <div className="flex items-center gap-2 mb-1">
                  <span className={`text-[10px] font-bold uppercase tracking-wider ${
                    msg.senderId === currentUser.id ? 'text-blue-100' : 'text-slate-500'
                  }`}>
                    {msg.senderName} ({msg.senderRole})
                  </span>
                </div>
                <p className="text-sm leading-relaxed">{msg.text}</p>
                <span className={`text-[9px] block mt-1 text-right ${
                  msg.senderId === currentUser.id ? 'text-blue-200' : 'text-slate-400'
                }`}>
                  {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      <form onSubmit={handleSend} className="p-4 bg-white border-t border-slate-200 flex gap-2">
        <input
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Digite sua mensagem..."
          className="flex-1 px-4 py-2 bg-slate-100 border-none rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all"
        />
        <button
          type="submit"
          className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm active:scale-95"
        >
          <Send className="w-5 h-5" />
        </button>
      </form>
    </div>
  );
};
