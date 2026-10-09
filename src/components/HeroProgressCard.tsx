import React from 'react';
import { Link2, Gift, Sparkles, MapPin, Calendar } from 'lucide-react';
import { BabyProfile } from '../types';

interface HeroProgressCardProps {
  currentBaby: BabyProfile;
  totalPercentage: number;
  onOpenChaDeBebe: () => void;
  onOpenLinks: () => void;
  onOpenFases: () => void;
  onEditProfile: () => void;
}

export const HeroProgressCard: React.FC<HeroProgressCardProps> = ({
  currentBaby,
  totalPercentage,
  onOpenChaDeBebe,
  onOpenLinks,
  onOpenFases,
  onEditProfile,
}) => {
  return (
    <div className="px-4 pt-2 pb-4 max-w-lg mx-auto">
      {/* Context pill badge: City + Birth month */}
      <div className="flex items-center justify-between mb-3 text-xs text-lavender-700 bg-lavender-100/70 py-1.5 px-3 rounded-full border border-lavender-200/50">
        <div className="flex items-center gap-1.5 font-medium truncate">
          <Calendar size={13} className="text-lavender-600 shrink-0" />
          <span>Parto previsto: <strong>{currentBaby.dueDate ? new Date(currentBaby.dueDate).toLocaleDateString('pt-BR', { month: 'short', year: 'numeric' }) : 'Fev 2027'}</strong></span>
          <span className="text-lavender-300">·</span>
          <MapPin size={13} className="text-lavender-600 shrink-0" />
          <span className="truncate">{currentBaby.city}, {currentBaby.state}</span>
        </div>
        <button
          onClick={onEditProfile}
          className="text-xs font-bold text-lavender-800 underline hover:text-lavender-900 shrink-0 ml-1"
        >
          Editar
        </button>
      </div>

      {/* Main purple banner */}
      <div className="relative overflow-hidden rounded-[26px] bg-gradient-to-br from-[#8E6BB8] via-[#7B59A5] to-[#674492] p-5 text-white shadow-float">
        {/* Subtle decorative glow */}
        <div className="absolute -top-12 -right-12 w-44 h-44 rounded-full bg-white/10 blur-2xl pointer-events-none" />

        {/* Phase pills & explanation link */}
        <div className="relative flex items-center justify-between gap-3">
          <div className="flex items-center gap-1 rounded-full p-1 bg-white/15 border border-white/20">
            <span className="rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-wider bg-gold text-[#4A3A1A]">
              Fase 1
            </span>
            <span className="rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-white/70">
              Fase 2
            </span>
          </div>
          <button
            onClick={onOpenFases}
            className="text-xs font-semibold text-gold-light underline hover:text-white transition-colors"
          >
            Entenda as fases
          </button>
        </div>

        {/* Title & Progress info */}
        <div className="relative mt-4">
          <h2 className="font-heading text-xl font-medium tracking-tight text-white/95">
            Essenciais para o parto
          </h2>

          <div className="mt-1 flex items-baseline justify-between">
            <span className="font-heading text-4xl font-semibold tracking-tight text-white tabular-nums">
              {totalPercentage}%
            </span>
            <span className="text-xs text-white/80">
              <strong className="text-white font-bold">{currentBaby.gestationalWeek}ª semana</strong> de gestação
            </span>
          </div>

          {/* Progress bar with gold indicator dot */}
          <div className="relative mt-2.5 h-2 w-full rounded-full bg-white/20 overflow-visible">
            <div
              className="h-full rounded-full bg-[#D5C2EE] transition-all duration-700 ease-out relative"
              style={{ width: `${Math.max(totalPercentage, 6)}%` }}
            >
              <span
                className="absolute right-0 top-1/2 -translate-y-1/2 w-3.5 h-3.5 rounded-full bg-gold border-2 border-[#7B59A5] shadow-sm transform translate-x-1"
                aria-hidden="true"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Floating dual action cards: Links salvos + Chá de bebê */}
      <div className="relative z-10 -mt-4 mx-2 flex items-stretch rounded-2xl bg-white shadow-soft border border-lavender-100/80 divide-x divide-lavender-100">
        <button
          onClick={onOpenLinks}
          className="flex-1 flex items-center gap-3 px-4 py-3 hover:bg-lavender-50/50 transition-colors rounded-l-2xl text-left"
        >
          <div className="w-9 h-9 rounded-full bg-lavender-100 text-lavender-700 flex items-center justify-center shrink-0">
            <Link2 size={18} />
          </div>
          <div className="min-w-0">
            <span className="block truncate text-sm font-bold text-baby-dark">Links salvos</span>
            <span className="block truncate text-xs text-baby-muted">4 produtos</span>
          </div>
        </button>

        <button
          onClick={onOpenChaDeBebe}
          className="flex-1 flex items-center gap-3 px-4 py-3 hover:bg-lavender-50/50 transition-colors rounded-r-2xl text-left"
        >
          <div className="w-9 h-9 rounded-full bg-lavender-100 text-lavender-700 flex items-center justify-center shrink-0">
            <Gift size={18} />
          </div>
          <div className="min-w-0">
            <span className="block truncate text-sm font-bold text-baby-dark">Chá de bebê</span>
            <span className="block truncate text-xs text-lavender-700 font-semibold flex items-center gap-1">
              compartilhe <Sparkles size={11} />
            </span>
          </div>
        </button>
      </div>
    </div>
  );
};
