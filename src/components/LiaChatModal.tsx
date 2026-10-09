import React, { useState } from 'react';
import { X, Send, Sparkles, Bot, CheckCircle } from 'lucide-react';
import { ChatMessage, BabyProfile, EnxovalItem } from '../types';

interface LiaChatModalProps {
  onClose: () => void;
  baby: BabyProfile;
  items: EnxovalItem[];
  onAutoAddCloth?: (name: string, size: string) => void;
}

export const LiaChatModal: React.FC<LiaChatModalProps> = ({
  onClose,
  baby,
  onAutoAddCloth,
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'm1',
      sender: 'assistant',
      text: `Olá, mamãe! 💜 Sou a Lia, sua especialista em enxoval de bebê. Estou aqui para te ajudar a montar o enxoval da ${baby.name} sem exageros e na medida certa para o clima de ${baby.city}. O que você gostaria de saber hoje?`,
      timestamp: 'Agora'
    }
  ]);
  const [inputText, setInputText] = useState('');

  const quickQuestions = [
    'Quantos bodies RN realmente preciso?',
    'O que não pode faltar na sala de parto?',
    'Ganhei 3 macacões P, cadastre pra mim',
    'Diferença entre cueiro e fralda de boca'
  ];

  const handleSend = (userText: string) => {
    if (!userText.trim()) return;

    const userMsg: ChatMessage = {
      id: `u-${Date.now()}`,
      sender: 'user',
      text: userText,
      timestamp: 'Agora'
    };

    setMessages(prev => [...prev, userMsg]);
    setInputText('');

    // Generate intelligent and friendly response
    setTimeout(() => {
      let replyText = '';
      let action: any = undefined;

      const lower = userText.toLowerCase();

      if (lower.includes('bodies rn') || lower.includes('tamanho rn') || lower.includes('quantos bodies')) {
        replyText = `Para o tamanho RN, bebês usam por volta de 3 a 4 semanas. Recomendamos em média **5 a 7 bodies manga curta** e **5 a 7 bodies manga longa** (especialmente para as noites ou meia estação). Mais do que isso quase sempre sobra e perde sem uso! 💜`;
      } else if (lower.includes('sala de parto') || lower.includes('mochila') || lower.includes('maternidade')) {
        replyText = `Na sala de parto você precisa de pouca coisa e muito fácil de pegar:
1. **A 1ª troca do bebê** em um saquinho separado (body, calça mijão, macacão quentinho, luvas, touca e meia);
2. **Documentos e cartão pré-natal**;
3. **Top de parto** e chinelo para você.
Todo o resto fica na mala maior no quarto! 👶✨`;
      } else if (lower.includes('ganhei') || lower.includes('cadastre') || lower.includes('macacão')) {
        replyText = `Que delícia de presente! Já anotei aqui e registrei **3 macacões tamanho P** no armário da ${baby.name} 💜 Você já pode vê-los organizados por tamanho!`;
        action = {
          type: 'added',
          itemName: '3 macacões P',
          details: 'Adicionado ao armário'
        };
        if (onAutoAddCloth) {
          onAutoAddCloth('Macacão estampado', 'P');
        }
      } else if (lower.includes('cueiro') || lower.includes('fralda de boca')) {
        replyText = `Boa dúvida!
• **Fralda de boca**: Pequenininha, para limpar baba, leite e regurgitadas o dia todo. Vai usar muitas (15+ unidades).
• **Cueiro**: É maior (em flanela ou algodão), serve para enrolar o bebê em charutinho, cobrir o trocador público ou forrar o carrinho.`;
      } else {
        replyText = `Compreendo perfeitamente! Para o enxoval da ${baby.name}, o segredo é priorizar itens de 0 a 3 meses agora e deixar as fases maiores para quando ela estiver crescendo. Posso te ajudar a revisar alguma categoria específica?`;
      }

      const assistantMsg: ChatMessage = {
        id: `a-${Date.now()}`,
        sender: 'assistant',
        text: replyText,
        timestamp: 'Agora',
        itemAction: action
      };

      setMessages(prev => [...prev, assistantMsg]);
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 animate-fade-in">
      <div className="bg-white w-full sm:max-w-lg rounded-t-[32px] sm:rounded-[32px] p-5 shadow-pop h-[90vh] flex flex-col animate-slide-up">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-lavender-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-lavender-700 to-lavender-500 text-white flex items-center justify-center shadow-sm">
              <Bot size={20} />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h3 className="font-heading italic text-lg font-bold text-baby-dark">
                  Lia
                </h3>
                <span className="text-[10px] font-bold uppercase bg-lavender-100 text-lavender-800 px-2 py-0.5 rounded-full">
                  IA
                </span>
              </div>
              <span className="text-xs text-baby-muted block">Especialista em Enxoval & Maternidade</span>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-lavender-50 hover:bg-lavender-100 flex items-center justify-center text-baby-muted"
          >
            <X size={18} />
          </button>
        </div>

        {/* Chat message history */}
        <div className="flex-1 overflow-y-auto no-scrollbar py-4 space-y-3">
          {messages.map(msg => (
            <div
              key={msg.id}
              className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
            >
              <div
                className={`max-w-[85%] rounded-[20px] p-3.5 text-xs leading-relaxed shadow-sm ${
                  msg.sender === 'user'
                    ? 'bg-lavender-700 text-white rounded-br-none'
                    : 'bg-lavender-50/90 text-baby-dark border border-lavender-100 rounded-bl-none'
                }`}
              >
                <p className="whitespace-pre-line">{msg.text}</p>

                {msg.itemAction && (
                  <div className="mt-2.5 p-2 bg-white/90 rounded-xl border border-lavender-200 text-lavender-900 flex items-center gap-2">
                    <CheckCircle size={15} className="text-emerald-600 shrink-0" />
                    <span className="font-bold text-[11px]">{msg.itemAction.details}: {msg.itemAction.itemName}</span>
                  </div>
                )}
              </div>
              <span className="text-[10px] text-baby-muted mt-1 px-2">{msg.timestamp}</span>
            </div>
          ))}
        </div>

        {/* Quick questions chips */}
        <div className="pt-2 pb-1 overflow-x-auto no-scrollbar flex items-center gap-2">
          {quickQuestions.map((q, idx) => (
            <button
              key={idx}
              onClick={() => handleSend(q)}
              className="text-[11px] font-medium whitespace-nowrap bg-lavender-100/70 hover:bg-lavender-200/80 text-lavender-800 px-3 py-1.5 rounded-full transition-colors shrink-0"
            >
              {q}
            </button>
          ))}
        </div>

        {/* Message Input box */}
        <form
          onSubmit={e => {
            e.preventDefault();
            handleSend(inputText);
          }}
          className="mt-2 flex items-center gap-2 border-t border-lavender-100 pt-3"
        >
          <input
            type="text"
            value={inputText}
            onChange={e => setInputText(e.target.value)}
            placeholder="Pergunte à Lia ou diga o que ganhou..."
            className="flex-1 bg-lavender-50/80 border border-lavender-200 rounded-full px-4 py-2.5 text-xs text-baby-dark focus:outline-none focus:ring-2 focus:ring-lavender-400"
          />
          <button
            type="submit"
            disabled={!inputText.trim()}
            className="w-10 h-10 rounded-full bg-lavender-700 text-white flex items-center justify-center hover:bg-lavender-800 disabled:opacity-40 transition-all shrink-0"
          >
            <Send size={16} />
          </button>
        </form>
      </div>
    </div>
  );
};
