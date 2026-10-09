import React, { useState, useEffect } from 'react';
import { X, Sparkles, Plus, Shirt } from 'lucide-react';
import { ClosetItem, SizeCategory } from '../types';
import { enxovalService } from '../services/enxovalService';

interface ClosetModalProps {
  onClose: () => void;
  babyName: string;
  babyId: string;
}

export const ClosetModal: React.FC<ClosetModalProps> = ({ onClose, babyName, babyId }) => {
  const [closetList, setClosetList] = useState<ClosetItem[]>([]);
  const [selectedSize, setSelectedSize] = useState<SizeCategory>('RN');
  const [suggestedLook, setSuggestedLook] = useState<string | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [loading, setLoading] = useState(true);

  // Form state for adding new clothing
  const [newType, setNewType] = useState('Body manga curta');
  const [newSize, setNewSize] = useState<SizeCategory>('RN');
  const [newColor, setNewColor] = useState('Branco');
  const [newStatus, setNewStatus] = useState<'comprado' | 'presente' | 'emprestado'>('comprado');

  useEffect(() => {
    let mounted = true;
    (async () => {
      setLoading(true);
      const items = await enxovalService.getCloset(babyId);
      if (mounted) {
        setClosetList(items);
        setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, [babyId]);

  const filteredItems = closetList.filter(item => item.size === selectedSize);

  const handleGenerateLook = () => {
    setSuggestedLook(
      `Look do dia montado para ${babyName} (${selectedSize}):\n• Body manga longa suedine macio\n• Macacão plush quentinho com zíper duplo\n• Meias com punho suave e touquinha`
    );
  };

  const handleSaveItem = async () => {
    const newItem: ClosetItem = {
      id: `cloth-${Date.now()}`,
      name: `${newType} (${newColor})`,
      type: newType,
      size: newSize,
      color: newColor,
      status: newStatus,
      createdAt: new Date().toISOString()
    };
    setClosetList(prev => [newItem, ...prev]);
    setIsAdding(false);
    await enxovalService.addClosetItem(babyId, newItem);
  };

  const sizes: SizeCategory[] = ['RN', 'P', 'M', 'G', 'GG'];

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 animate-fade-in">
      <div className="bg-white w-full sm:max-w-lg rounded-t-[32px] sm:rounded-[32px] p-6 shadow-pop max-h-[90vh] overflow-y-auto no-scrollbar animate-slide-up">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-lavender-100">
          <div>
            <span className="text-[10px] font-extrabold uppercase tracking-widest text-lavender-700">
              Armário Virtual
            </span>
            <h2 className="font-heading italic text-2xl font-bold text-baby-dark">
              Roupinhas de {babyName}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-lavender-50 hover:bg-lavender-100 flex items-center justify-center text-baby-muted"
          >
            <X size={18} />
          </button>
        </div>

        {/* Serving status banner */}
        <div className="my-4 p-4 rounded-2xl bg-gradient-to-r from-lavender-100 to-lavender-50 border border-lavender-200/60 flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-lavender-800 block">
              Serve agora: <strong className="text-lavender-900 underline">Tamanho RN</strong>
            </span>
            <span className="text-xs text-lavender-600 block mt-0.5">
              Tamanho P em breve · M e G guardados na gaveta
            </span>
          </div>

          <button
            onClick={handleGenerateLook}
            className="px-3.5 py-2 rounded-xl bg-lavender-700 hover:bg-lavender-800 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all"
          >
            <Sparkles size={13} />
            <span>Look do dia</span>
          </button>
        </div>

        {/* Look of the day suggestion popup */}
        {suggestedLook && (
          <div className="mb-4 p-4 rounded-2xl bg-amber-50 border border-amber-200/80 text-amber-900 animate-fade-in relative">
            <button
              onClick={() => setSuggestedLook(null)}
              className="absolute top-2 right-2 text-amber-700 hover:text-amber-900"
            >
              <X size={14} />
            </button>
            <h4 className="text-xs font-extrabold uppercase tracking-wider text-amber-800 mb-1 flex items-center gap-1.5">
              <Sparkles size={13} className="text-amber-600" />
              Look sugerido pelo clima
            </h4>
            <p className="text-xs whitespace-pre-line leading-relaxed font-medium">
              {suggestedLook}
            </p>
          </div>
        )}

        {/* Size selector tabs */}
        <div className="flex items-center gap-2 border-b border-lavender-100 pb-3">
          {sizes.map(size => {
            const count = closetList.filter(c => c.size === size).length;
            const isSelected = selectedSize === size;
            return (
              <button
                key={size}
                onClick={() => setSelectedSize(size)}
                className={`flex-1 py-2 px-1 text-center rounded-xl text-xs font-bold transition-all ${
                  isSelected
                    ? 'bg-lavender-700 text-white shadow-sm'
                    : 'bg-lavender-50 text-lavender-800 hover:bg-lavender-100'
                }`}
              >
                <span>{size}</span>
                <span className="block text-[10px] font-normal opacity-80">{count} pçs</span>
              </button>
            );
          })}
        </div>

        {/* Clothing Items Grid */}
        <div className="my-4 space-y-2">
          {loading ? (
            <div className="text-center py-6 text-baby-muted text-xs">
              Carregando armário...
            </div>
          ) : filteredItems.length === 0 ? (
            <div className="text-center py-8 text-baby-muted text-xs">
              Nenhuma peça cadastrada no tamanho {selectedSize} ainda.
            </div>
          ) : (
            filteredItems.map(item => (
              <div
                key={item.id}
                className="p-3 rounded-2xl bg-white border border-lavender-100/90 shadow-soft flex items-center justify-between gap-3"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-lavender-50 flex items-center justify-center text-lavender-700">
                    <Shirt size={18} />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-baby-dark">{item.name}</h4>
                    <div className="flex items-center gap-2 mt-0.5 text-[11px] text-baby-muted">
                      <span className="capitalize">{item.color}</span>
                      <span>•</span>
                      <span className={`font-semibold ${
                        item.status === 'presente' ? 'text-lavender-700' :
                        item.status === 'emprestado' ? 'text-amber-700' : 'text-emerald-700'
                      }`}>
                        {item.status === 'comprado' ? 'Comprado' : item.status === 'presente' ? 'Ganhou de presente' : 'Emprestado'}
                      </span>
                    </div>
                  </div>
                </div>

                <span className="text-[11px] font-bold px-2 py-1 bg-lavender-100 text-lavender-800 rounded-lg">
                  {item.size}
                </span>
              </div>
            ))
          )}
        </div>

        {/* Add clothing button / form */}
        {isAdding ? (
          <div className="p-4 rounded-2xl bg-lavender-50/80 border border-lavender-200 space-y-3">
            <h4 className="text-xs font-bold text-lavender-900">Cadastrar nova peça no armário</h4>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div>
                <label className="block text-baby-muted mb-1">Tipo de peça</label>
                <select
                  value={newType}
                  onChange={e => setNewType(e.target.value)}
                  className="w-full bg-white border border-lavender-200 rounded-xl p-2 text-xs"
                >
                  <option>Body manga curta</option>
                  <option>Body manga longa</option>
                  <option>Macacão</option>
                  <option>Calça</option>
                  <option>Casaquinho</option>
                  <option>Meias</option>
                  <option>Touca e luva</option>
                </select>
              </div>

              <div>
                <label className="block text-baby-muted mb-1">Tamanho</label>
                <select
                  value={newSize}
                  onChange={e => setNewSize(e.target.value as SizeCategory)}
                  className="w-full bg-white border border-lavender-200 rounded-xl p-2 text-xs"
                >
                  <option value="RN">RN</option>
                  <option value="P">P</option>
                  <option value="M">M</option>
                  <option value="G">G</option>
                  <option value="GG">GG</option>
                </select>
              </div>

              <div>
                <label className="block text-baby-muted mb-1">Cor</label>
                <input
                  type="text"
                  value={newColor}
                  onChange={e => setNewColor(e.target.value)}
                  placeholder="Ex: Amarelo claro"
                  className="w-full bg-white border border-lavender-200 rounded-xl p-2 text-xs"
                />
              </div>

              <div>
                <label className="block text-baby-muted mb-1">Como chegou?</label>
                <select
                  value={newStatus}
                  onChange={e => setNewStatus(e.target.value as any)}
                  className="w-full bg-white border border-lavender-200 rounded-xl p-2 text-xs"
                >
                  <option value="comprado">Comprado</option>
                  <option value="presente">Ganhei de presente</option>
                  <option value="emprestado">Emprestado</option>
                </select>
              </div>
            </div>

            <div className="flex items-center gap-2 pt-1">
              <button
                onClick={handleSaveItem}
                className="flex-1 py-2 rounded-xl bg-lavender-700 text-white font-bold text-xs"
              >
                Salvar no armário
              </button>
              <button
                onClick={() => setIsAdding(false)}
                className="py-2 px-3 text-xs text-baby-muted"
              >
                Cancelar
              </button>
            </div>
          </div>
        ) : (
          <button
            onClick={() => setIsAdding(true)}
            className="w-full py-3 rounded-2xl bg-lavender-700 hover:bg-lavender-800 text-white text-xs font-bold flex items-center justify-center gap-2 shadow-sm transition-all"
          >
            <Plus size={16} />
            <span>Cadastrar peça no armário</span>
          </button>
        )}
      </div>
    </div>
  );
};
