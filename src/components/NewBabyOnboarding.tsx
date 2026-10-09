import React, { useState } from 'react';
import { Sparkles, Calendar, MapPin, User, Heart, ArrowRight, Baby } from 'lucide-react';
import { BabyProfile, Gender } from '../types';

interface NewBabyOnboardingProps {
  userName?: string;
  onSaveFirstBaby: (babyData: Omit<BabyProfile, 'id'>) => Promise<void>;
  onSignOut: () => void;
}

export const NewBabyOnboarding: React.FC<NewBabyOnboardingProps> = ({
  userName,
  onSaveFirstBaby,
  onSignOut,
}) => {
  const [name, setName] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [city, setCity] = useState('São Paulo');
  const [state, setState] = useState('SP');
  const [gender, setGender] = useState<Gender>('neutral');
  const [gestationalWeek, setGestationalWeek] = useState(20);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !dueDate) return;

    setLoading(true);
    try {
      await onSaveFirstBaby({
        name: name.trim(),
        dueDate,
        city: city.trim(),
        state: state.trim().toUpperCase(),
        gender,
        gestationalWeek: Number(gestationalWeek)
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#F3ECF8] via-[#FAF7FC] to-[#FFFFFF] flex flex-col justify-center px-4 py-8">
      <div className="w-full max-w-md mx-auto">
        {/* Header Greeting */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-tr from-lavender-700 to-lavender-500 text-white shadow-soft mb-3 ring-4 ring-lavender-100">
            <Heart size={26} className="fill-white/80" />
          </div>
          <span className="text-[11px] font-extrabold uppercase tracking-widest text-lavender-700 block">
            Boas-vindas ao seu Enxoval
          </span>
          <h1 className="font-heading italic text-2xl sm:text-3xl font-bold text-baby-dark mt-1">
            {userName ? `Olá, ${userName}! 💕` : 'Olá, mamãe & papai! 💕'}
          </h1>
          <p className="text-xs text-baby-muted mt-1.5 max-w-xs mx-auto">
            Sua conta está limpa e pronta. Vamos cadastrar seu primeiro bebê para gerar as quantidades e recomendações de clima ideais.
          </p>
        </div>

        {/* Card Form */}
        <div className="bg-white rounded-[32px] border border-lavender-100/90 p-6 shadow-pop">
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Nome */}
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
                  placeholder="Ex: Maya, Gael, Antonella, Noah..."
                  className="w-full bg-lavender-50/70 border border-lavender-200 rounded-xl px-3.5 py-2.5 text-xs text-baby-dark pl-9 focus:outline-none focus:ring-2 focus:ring-lavender-400"
                />
                <Baby size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-lavender-600" />
              </div>
            </div>

            {/* Sexo / Gênero */}
            <div>
              <label className="block text-xs font-bold text-baby-dark mb-1">
                Sexo do bebê
              </label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setGender('girl')}
                  className={`py-2 px-1 text-xs font-bold rounded-xl border transition-all ${
                    gender === 'girl'
                      ? 'bg-pink-50 border-pink-300 text-pink-700 shadow-sm'
                      : 'border-baby-border text-baby-muted hover:bg-lavender-50'
                  }`}
                >
                  🌸 Menina
                </button>
                <button
                  type="button"
                  onClick={() => setGender('boy')}
                  className={`py-2 px-1 text-xs font-bold rounded-xl border transition-all ${
                    gender === 'boy'
                      ? 'bg-sky-50 border-sky-300 text-sky-700 shadow-sm'
                      : 'border-baby-border text-baby-muted hover:bg-lavender-50'
                  }`}
                >
                  🍼 Menino
                </button>
                <button
                  type="button"
                  onClick={() => setGender('neutral')}
                  className={`py-2 px-1 text-xs font-bold rounded-xl border transition-all ${
                    gender === 'neutral'
                      ? 'bg-lavender-100 border-lavender-300 text-lavender-800 shadow-sm'
                      : 'border-baby-border text-baby-muted hover:bg-lavender-50'
                  }`}
                >
                  ✨ Surpresa
                </button>
              </div>
            </div>

            {/* Data Prevista do Parto */}
            <div>
              <label className="block text-xs font-bold text-baby-dark mb-1">
                Data prevista do parto (DPA)
              </label>
              <div className="relative">
                <input
                  type="date"
                  required
                  value={dueDate}
                  onChange={e => setDueDate(e.target.value)}
                  className="w-full bg-lavender-50/70 border border-lavender-200 rounded-xl px-3.5 py-2.5 text-xs text-baby-dark pl-9 focus:outline-none focus:ring-2 focus:ring-lavender-400"
                />
                <Calendar size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-lavender-600" />
              </div>
              <span className="text-[10px] text-baby-muted block mt-1">
                O aplicativo calcula automaticamente as estações do ano para cada tamanho (RN a 12M).
              </span>
            </div>

            {/* Cidade e Estado */}
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
                    placeholder="Ex: Curitiba"
                    className="w-full bg-lavender-50/70 border border-lavender-200 rounded-xl px-3.5 py-2.5 text-xs text-baby-dark pl-9 focus:outline-none focus:ring-2 focus:ring-lavender-400"
                  />
                  <MapPin size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-lavender-600" />
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
                  className="w-full bg-lavender-50/70 border border-lavender-200 rounded-xl px-3 py-2.5 text-xs text-baby-dark text-center font-bold focus:outline-none focus:ring-2 focus:ring-lavender-400 uppercase"
                />
              </div>
            </div>

            {/* Semana Gestacional */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-bold text-baby-dark">
                  Semana atual de gestação
                </label>
                <span className="text-xs font-extrabold text-lavender-700">
                  {gestationalWeek}ª semana
                </span>
              </div>
              <input
                type="range"
                min="4"
                max="41"
                value={gestationalWeek}
                onChange={e => setGestationalWeek(Number(e.target.value))}
                className="w-full accent-lavender-700"
              />
            </div>

            {/* Botão Submeter */}
            <button
              type="submit"
              disabled={loading || !name.trim() || !dueDate}
              className="w-full py-3.5 mt-2 rounded-2xl bg-gradient-to-r from-lavender-700 to-lavender-600 hover:from-lavender-800 hover:to-lavender-700 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-soft hover:shadow-md transition-all disabled:opacity-50"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <Sparkles size={16} />
                  <span>Gerar Enxoval Personalizado</span>
                  <ArrowRight size={15} />
                </>
              )}
            </button>
          </form>
        </div>

        {/* Sair da conta */}
        <div className="text-center mt-5">
          <button
            type="button"
            onClick={onSignOut}
            className="text-xs font-semibold text-baby-muted hover:text-lavender-800 transition-colors underline"
          >
            Sair ou entrar com outra conta
          </button>
        </div>
      </div>
    </div>
  );
};
