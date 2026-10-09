import React, { useState } from 'react';
import { X, Info, Plus, Minus, Check } from 'lucide-react';
import { EnxovalItem, SubItem } from '../types';
import { DynamicIcon } from './DynamicIcon';

interface SubItemSheetProps {
  item: EnxovalItem;
  onClose: () => void;
  onUpdateSubItem: (parentItemId: string, updatedSubItems: SubItem[]) => void;
}

export const SubItemSheet: React.FC<SubItemSheetProps> = ({
  item,
  onClose,
  onUpdateSubItem,
}) => {
  const [newSubName, setNewSubName] = useState('');
  const [isAdding, setIsAdding] = useState(false);

  const subItems = item.subItems || [];
  const regularSubItems = subItems.filter(s => !s.isOptional);
  const optionalSubItems = subItems.filter(s => s.isOptional);

  // Informative description mapping for well-known items from prints
  const getInfoDescription = (itemName: string) => {
    if (itemName.includes('higiene da mamãe')) {
      return 'Itens de higiene pessoal para manter acessíveis na sala de parto.';
    }
    if (itemName.includes('Roupas da mamãe')) {
      return 'Roupas e itens da mãe para manter acessíveis durante o parto e o pós-parto.';
    }
    if (itemName.includes('1ª troca do bebê')) {
      return 'Juntas para facilitar a organização na sala de parto. A touca e as luvas são importantes; a mantinha e o saquinho separador são opcionais.';
    }
    if (itemName.includes('alimentação')) {
      return 'Utensílios essenciais e seguros para as primeiras papinhas e frutas do bebê.';
    }
    return 'Separe estes itens com antecedência para ter tudo à mão na hora necessária.';
  };

  const handleToggleSub = (subId: string) => {
    const nextList = subItems.map(s => {
      if (s.id === subId) {
        return { ...s, isAcquired: !s.isAcquired };
      }
      return s;
    });
    onUpdateSubItem(item.id, nextList);
  };

  const handleStepSub = (subId: string, delta: number) => {
    const nextList = subItems.map(s => {
      if (s.id === subId) {
        const current = s.currentQty || 0;
        const max = s.recommendedQty || 99;
        const next = Math.max(0, Math.min(max, current + delta));
        return {
          ...s,
          currentQty: next,
          isAcquired: next >= max
        };
      }
      return s;
    });
    onUpdateSubItem(item.id, nextList);
  };

  const handleAddNewSub = () => {
    if (!newSubName.trim()) return;
    const newEntry: SubItem = {
      id: `custom-sub-${Date.now()}`,
      name: newSubName.trim(),
      isAcquired: false,
      isOptional: false,
    };
    onUpdateSubItem(item.id, [...subItems, newEntry]);
    setNewSubName('');
    setIsAdding(false);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-end justify-center animate-fade-in">
      <div 
        className="w-full max-w-lg bg-white rounded-t-[32px] p-5 pb-8 shadow-pop max-h-[88vh] overflow-y-auto no-scrollbar animate-slide-up"
        role="dialog"
        aria-modal="true"
      >
        {/* Top drag handle indicator */}
        <div className="w-12 h-1.5 bg-gray-300 rounded-full mx-auto mb-4" />

        {/* Header: Title in serif italic + Close button */}
        <div className="flex items-center justify-between pb-3 border-b border-lavender-100">
          <h2 className="font-heading italic text-2xl font-bold text-baby-dark tracking-tight">
            {item.name}
          </h2>

          <button
            onClick={onClose}
            aria-label="Fechar"
            className="w-9 h-9 rounded-full bg-lavender-50 hover:bg-lavender-100 flex items-center justify-center text-baby-muted hover:text-baby-dark transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Info card box (Exact match IMG_6318, IMG_6319, IMG_6320) */}
        <div className="my-4 p-3.5 rounded-2xl bg-lavender-50/80 border border-lavender-100/90 flex items-start gap-3 text-lavender-900">
          <Info size={18} className="text-lavender-700 shrink-0 mt-0.5" />
          <p className="text-xs leading-relaxed text-lavender-900 font-medium">
            {getInfoDescription(item.name)}
          </p>
        </div>

        {/* Regular Sub-items list */}
        <div className="space-y-1 divide-y divide-lavender-50">
          {regularSubItems.map(sub => (
            <div key={sub.id} className="py-2.5 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0 flex-1">
                <div className="w-9 h-9 rounded-[12px] bg-lavender-100/70 flex items-center justify-center shrink-0">
                  <DynamicIcon name="Sparkles" size={16} className="text-lavender-700" />
                </div>
                <span className="text-sm font-medium text-baby-dark truncate">
                  {sub.name}
                </span>
              </div>

              {sub.recommendedQty !== undefined ? (
                <div className="flex items-center gap-1.5 bg-lavender-50 rounded-full px-2 py-1 border border-lavender-100">
                  <button
                    onClick={() => handleStepSub(sub.id, -1)}
                    className="w-5 h-5 rounded-full flex items-center justify-center text-lavender-700 hover:bg-white"
                  >
                    <Minus size={12} />
                  </button>
                  <span className="text-xs font-bold text-baby-dark tabular-nums px-1">
                    {sub.currentQty || 0}/{sub.recommendedQty}
                  </span>
                  <button
                    onClick={() => handleStepSub(sub.id, 1)}
                    className="w-5 h-5 rounded-full flex items-center justify-center text-lavender-700 hover:bg-white"
                  >
                    <Plus size={12} />
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => handleToggleSub(sub.id)}
                  aria-label={`Marcar ${sub.name}`}
                  className={`w-7 h-7 rounded-full border-2 flex items-center justify-center transition-all ${
                    sub.isAcquired
                      ? 'bg-lavender-700 border-lavender-700 text-white'
                      : 'border-lavender-300 hover:border-lavender-500 bg-white'
                  }`}
                >
                  {sub.isAcquired && <Check size={14} strokeWidth={3} />}
                </button>
              )}
            </div>
          ))}
        </div>

        {/* Opcionais section in sub-sheet */}
        {optionalSubItems.length > 0 && (
          <div className="mt-5 pt-3 border-t border-lavender-100">
            <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-lavender-700/80 mb-2">
              <span>OPCIONAIS</span>
              <span className="text-[11px] text-lavender-600 font-semibold">{optionalSubItems.length}</span>
            </div>

            <div className="space-y-1 divide-y divide-lavender-50">
              {optionalSubItems.map(sub => (
                <div key={sub.id} className="py-2.5 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <div className="w-8 h-8 rounded-[10px] bg-lavender-50 flex items-center justify-center shrink-0">
                      <DynamicIcon name="Sparkles" size={14} className="text-lavender-500" />
                    </div>
                    <span className="text-sm font-medium text-baby-dark truncate">
                      {sub.name}
                    </span>
                  </div>

                  <button
                    onClick={() => handleToggleSub(sub.id)}
                    aria-label={`Marcar ${sub.name}`}
                    className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                      sub.isAcquired
                        ? 'bg-lavender-700 border-lavender-700 text-white'
                        : 'border-lavender-300 hover:border-lavender-500 bg-white'
                    }`}
                  >
                    {sub.isAcquired && <Check size={12} strokeWidth={3} />}
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Add custom sub-item */}
        <div className="mt-4 pt-3 border-t border-lavender-100">
          {isAdding ? (
            <div className="flex items-center gap-2">
              <input
                type="text"
                autoFocus
                value={newSubName}
                onChange={e => setNewSubName(e.target.value)}
                placeholder="Ex: Babador extra, meias..."
                onKeyDown={e => e.key === 'Enter' && handleAddNewSub()}
                className="flex-1 bg-lavender-50 border border-lavender-200 rounded-xl px-3 py-2 text-xs text-baby-dark focus:outline-none focus:ring-2 focus:ring-lavender-400"
              />
              <button
                onClick={handleAddNewSub}
                className="px-3 py-2 bg-lavender-700 text-white text-xs font-bold rounded-xl"
              >
                Salvar
              </button>
              <button
                onClick={() => setIsAdding(false)}
                className="px-2.5 py-2 text-xs text-baby-muted"
              >
                Cancelar
              </button>
            </div>
          ) : (
            <button
              onClick={() => setIsAdding(true)}
              className="flex items-center gap-2 text-xs font-bold text-lavender-700 hover:text-lavender-900 py-1"
            >
              <Plus size={16} />
              <span>Adicionar item</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
