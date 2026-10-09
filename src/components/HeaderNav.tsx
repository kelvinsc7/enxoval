import React from 'react';
import { Search, Gift, Sparkles, Shirt, Plus } from 'lucide-react';
import { BabyProfile } from '../types';

interface HeaderNavProps {
  currentBaby: BabyProfile;
  babyList: BabyProfile[];
  onSelectBaby: (baby: BabyProfile) => void;
  onOpenAddBaby: () => void;
  onOpenChaDeBebe: () => void;
  onOpenLia: () => void;
  onOpenCloset: () => void;
  onOpenSearch: () => void;
}

export const HeaderNav: React.FC<HeaderNavProps> = ({
  currentBaby,
  babyList,
  onSelectBaby,
  onOpenAddBaby,
  onOpenChaDeBebe,
  onOpenLia,
  onOpenCloset,
  onOpenSearch,
}) => {
  return (
    <header className="sticky top-0 z-30 bg-[#FAF7FC]/90 backdrop-blur-md px-4 pt-3 pb-2 border-b border-lavender-100/60">
      <div className="flex items-center justify-between gap-2 max-w-lg mx-auto">
        {/* Baby profile selector pills */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-0.5">
          {babyList.map((baby) => {
            const isSelected = baby.id === currentBaby.id;
            return (
              <button
                key={baby.id}
                onClick={() => onSelectBaby(baby)}
                className={`flex items-center gap-2 h-9 rounded-full pl-1 pr-3.5 transition-all text-xs font-semibold whitespace-nowrap shadow-sm ${
                  isSelected
                    ? 'bg-lavender-700 text-white ring-2 ring-lavender-400/40'
                    : 'bg-white text-baby-dark border border-baby-border hover:bg-lavender-50'
                }`}
              >
                <span
                  className={`w-7 h-7 rounded-full flex items-center justify-center font-heading text-xs font-bold ${
                    isSelected
                      ? 'bg-white text-lavender-700'
                      : 'bg-lavender-100 text-lavender-800'
                  }`}
                >
                  {baby.name.charAt(0).toUpperCase()}
                </span>
                <span>{baby.name}</span>
              </button>
            );
          })}

          <button
            onClick={onOpenAddBaby}
            title="Adicionar bebê / gêmeos"
            className="w-8 h-8 rounded-full border border-dashed border-lavender-300 flex items-center justify-center text-lavender-600 hover:bg-lavender-100 transition-colors"
          >
            <Plus size={16} />
          </button>
        </div>

        {/* Right action icons */}
        <div className="flex items-center gap-1.5 flex-shrink-0">
          <button
            onClick={onOpenSearch}
            aria-label="Buscar item"
            className="w-9 h-9 rounded-full bg-white border border-baby-border/80 flex items-center justify-center text-lavender-800 hover:bg-lavender-50 transition-colors shadow-sm"
          >
            <Search size={18} />
          </button>

          <button
            onClick={onOpenCloset}
            title="Armário Inteligente"
            className="w-9 h-9 rounded-full bg-white border border-baby-border/80 flex items-center justify-center text-lavender-800 hover:bg-lavender-50 transition-colors shadow-sm"
          >
            <Shirt size={18} />
          </button>

          <button
            onClick={onOpenChaDeBebe}
            aria-label="Chá de bebê e presentes"
            className="relative w-9 h-9 rounded-full bg-white border border-baby-border/80 flex items-center justify-center text-lavender-800 hover:bg-lavender-50 transition-colors shadow-sm"
          >
            <Gift size={18} />
            <span className="absolute -top-1 -right-1 bg-gold text-lavender-900 text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center border border-white">
              4
            </span>
          </button>

          <button
            onClick={onOpenLia}
            aria-label="Lia Assistente com IA"
            className="w-9 h-9 rounded-full bg-gradient-to-tr from-lavender-700 to-lavender-500 text-white flex items-center justify-center hover:opacity-95 transition-opacity shadow-sm ring-2 ring-lavender-300/40"
          >
            <Sparkles size={17} />
          </button>
        </div>
      </div>
    </header>
  );
};
