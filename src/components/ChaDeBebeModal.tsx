import React, { useState } from 'react';
import { X, Copy, Check, Gift, Share2, Heart, ExternalLink } from 'lucide-react';
import { EnxovalItem, BabyProfile } from '../types';

interface ChaDeBebeModalProps {
  onClose: () => void;
  baby: BabyProfile;
  items: EnxovalItem[];
}

export const ChaDeBebeModal: React.FC<ChaDeBebeModalProps> = ({
  onClose,
  baby,
  items,
}) => {
  const [copied, setCopied] = useState(false);
  const [reservedIds, setReservedIds] = useState<string[]>(['quarto-berco']);

  const shareUrl = `https://enxovalfacil.com/s/${baby.name.toLowerCase()}`;

  // Filter missing items suitable for baby shower gifts
  const giftItems = items.filter(it => !it.isDismissed && !it.isAcquired).slice(0, 12);

  const handleCopy = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleToggleReserve = (id: string) => {
    if (reservedIds.includes(id)) {
      setReservedIds(reservedIds.filter(i => i !== id));
    } else {
      setReservedIds([...reservedIds, id]);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 animate-fade-in">
      <div className="bg-white w-full sm:max-w-lg rounded-t-[32px] sm:rounded-[32px] p-6 shadow-pop max-h-[90vh] overflow-y-auto no-scrollbar animate-slide-up">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-lavender-100">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-full bg-gold/20 text-lavender-800 flex items-center justify-center">
              <Gift size={18} />
            </div>
            <div>
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-lavender-700">
                Lista de Presentes
              </span>
              <h2 className="font-heading italic text-2xl font-bold text-baby-dark">
                Chá de Bebê da {baby.name}
              </h2>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-lavender-50 hover:bg-lavender-100 flex items-center justify-center text-baby-muted"
          >
            <X size={18} />
          </button>
        </div>

        {/* Share Link Banner */}
        <div className="my-4 p-4 rounded-2xl bg-lavender-50 border border-lavender-200/60 space-y-3">
          <div className="flex items-center justify-between text-xs">
            <span className="text-baby-muted">Link público para família e amigos:</span>
            <span className="text-lavender-700 font-bold flex items-center gap-1">
              <Share2 size={12} /> Sem login necessário
            </span>
          </div>

          <div className="flex items-center gap-2 bg-white p-1.5 pl-3 rounded-xl border border-lavender-200">
            <span className="text-xs text-baby-dark font-medium truncate flex-1">
              {shareUrl}
            </span>
            <button
              onClick={handleCopy}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1 transition-all ${
                copied
                  ? 'bg-emerald-600 text-white'
                  : 'bg-lavender-700 hover:bg-lavender-800 text-white'
              }`}
            >
              {copied ? <Check size={13} /> : <Copy size={13} />}
              <span>{copied ? 'Copiado!' : 'Copiar'}</span>
            </button>
          </div>

          <p className="text-[11px] text-baby-muted leading-tight">
            Quem abrir vê apenas o que ainda falta e pode reservar o presente com um toque, evitando presentes repetidos!
          </p>
        </div>

        {/* Simulated list view as seen by guests */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs font-bold text-lavender-800 pt-1">
            <span>SUGESTÕES PARA PRESENTEAR</span>
            <span className="text-baby-muted text-[11px]">Mostrando itens pendentes</span>
          </div>

          <div className="space-y-2 max-h-72 overflow-y-auto no-scrollbar pr-1">
            {giftItems.map(item => {
              const isReserved = reservedIds.includes(item.id);

              return (
                <div
                  key={item.id}
                  className={`p-3 rounded-2xl border transition-all flex items-center justify-between gap-3 ${
                    isReserved
                      ? 'bg-emerald-50/70 border-emerald-200 text-emerald-950'
                      : 'bg-white border-lavender-100 shadow-sm'
                  }`}
                >
                  <div className="min-w-0">
                    <span className="text-sm font-semibold block truncate">
                      {item.name}
                    </span>
                    <span className="text-xs text-baby-muted block">
                      {item.recommendedQty ? `Faltam ${item.recommendedQty - (item.currentQty || 0)} peças` : 'Item pendente'}
                    </span>
                  </div>

                  <button
                    onClick={() => handleToggleReserve(item.id)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 flex items-center gap-1 ${
                      isReserved
                        ? 'bg-emerald-700 text-white shadow-sm'
                        : 'bg-lavender-100 text-lavender-800 hover:bg-lavender-200'
                    }`}
                  >
                    {isReserved ? (
                      <>
                        <Check size={12} />
                        <span>Reservado por você</span>
                      </>
                    ) : (
                      <>
                        <Heart size={12} />
                        <span>Vou presentear</span>
                      </>
                    )}
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
