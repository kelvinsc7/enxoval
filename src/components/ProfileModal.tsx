import React, { useState } from 'react';
import { X, Calendar, MapPin, User, Check } from 'lucide-react';
import { BabyProfile } from '../types';

interface ProfileModalProps {
  currentBaby: BabyProfile;
  onSave: (updatedBaby: BabyProfile) => void;
  onClose: () => void;
  isNewBaby?: boolean;
}

export const ProfileModal: React.FC<ProfileModalProps> = ({
  currentBaby,
  onSave,
  onClose,
  isNewBaby = false,
}) => {
  const [name, setName] = useState(isNewBaby ? '' : currentBaby.name);
  const [dueDate, setDueDate] = useState(currentBaby.dueDate);
  const [city, setCity] = useState(currentBaby.city);
  const [state, setState] = useState(currentBaby.state);
  const [gestationalWeek, setGestationalWeek] = useState(currentBaby.gestationalWeek || 32);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    onSave({
      ...currentBaby,
      id: isNewBaby ? `baby-${Date.now()}` : currentBaby.id,
      name: name.trim(),
      dueDate,
      city: city.trim(),
      state: state.trim().toUpperCase(),
      gestationalWeek: Number(gestationalWeek),
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 animate-fade-in">
      <div className="bg-white w-full sm:max-w-md rounded-t-[32px] sm:rounded-[32px] p-6 shadow-pop animate-slide-up">
        <div className="flex items-center justify-between pb-3 border-b border-lavender-100">
          <div>
            <span className="text-[10px] font-extrabold uppercase tracking-widest text-lavender-700">
              Personalização do Enxoval
            </span>
            <h2 className="font-heading italic text-xl font-bold text-baby-dark">
              {isNewBaby ? 'Adicionar Novo Bebê' : `Perfil da ${currentBaby.name}`}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-lavender-50 hover:bg-lavender-100 flex items-center justify-center text-baby-muted"
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div>
            <label className="block text-xs font-bold text-baby-dark mb-1">
              Nome do bebê
            </label>
            <div className="relative">
              <input
                type="text"
                required
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="Ex: Aurora, Theo, Helena..."
                className="w-full bg-lavender-50/80 border border-lavender-200 rounded-xl px-3.5 py-2.5 text-xs text-baby-dark pl-9 focus:outline-none focus:ring-2 focus:ring-lavender-400"
              />
              <User size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-lavender-600" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-baby-dark mb-1">
              Data prevista do nascimento (Parto)
            </label>
            <div className="relative">
              <input
                type="date"
                required
                value={dueDate}
                onChange={e => setDueDate(e.target.value)}
                className="w-full bg-lavender-50/80 border border-lavender-200 rounded-xl px-3.5 py-2.5 text-xs text-baby-dark pl-9 focus:outline-none focus:ring-2 focus:ring-lavender-400"
              />
              <Calendar size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-lavender-600" />
            </div>
            <span className="text-[10px] text-baby-muted block mt-1">
              Essa data recalcula as estações e tecidos de cada tamanho (RN a 12M).
            </span>
          </div>

          <div className="grid grid-cols-3 gap-2">
            <div className="col-span-2">
              <label className="block text-xs font-bold text-baby-dark mb-1">
                Cidade
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  value={city}
                  onChange={e => setCity(e.target.value)}
                  placeholder="Ex: Curitiba, Salvador..."
                  className="w-full bg-lavender-50/80 border border-lavender-200 rounded-xl px-3.5 py-2.5 text-xs text-baby-dark pl-9 focus:outline-none focus:ring-2 focus:ring-lavender-400"
                />
                <MapPin size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-lavender-600" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-baby-dark mb-1">
                UF
              </label>
              <input
                type="text"
                required
                maxLength={2}
                value={state}
                onChange={e => setState(e.target.value)}
                placeholder="SP"
                className="w-full bg-lavender-50/80 border border-lavender-200 rounded-xl px-3 py-2.5 text-xs text-baby-dark text-center font-bold focus:outline-none focus:ring-2 focus:ring-lavender-400"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-baby-dark mb-1">
              Semana atual de gestação ({gestationalWeek}ª semana)
            </label>
            <input
              type="range"
              min="4"
              max="41"
              value={gestationalWeek}
              onChange={e => setGestationalWeek(Number(e.target.value))}
              className="w-full accent-lavender-700"
            />
          </div>

          <div className="pt-2 flex items-center gap-2">
            <button
              type="submit"
              className="flex-1 py-3 rounded-2xl bg-lavender-700 hover:bg-lavender-800 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-sm transition-all"
            >
              <Check size={16} />
              <span>Salvar perfil e atualizar enxoval</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-3 rounded-2xl text-xs font-bold text-baby-muted hover:text-baby-dark"
            >
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
