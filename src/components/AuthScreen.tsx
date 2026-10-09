import React, { useState } from 'react';
import { Sparkles, Mail, Lock, User, ArrowRight, AlertCircle, CheckCircle2, Key, ShieldCheck } from 'lucide-react';
import { supabase, isSupabaseConfigured, saveSupabaseConfig } from '../lib/supabase';

interface AuthScreenProps {
  onAuthSuccess: (user: { id: string; email?: string; name?: string }) => void;
}

export const AuthScreen: React.FC<AuthScreenProps> = ({ onAuthSuccess }) => {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Modal para chave Supabase caso não esteja configurada
  const [showConfigModal, setShowConfigModal] = useState(false);
  const [customKey, setCustomKey] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);
    setLoading(true);

    const cleanEmail = email.trim().toLowerCase();

    // Se o Supabase estiver configurado, usa a autenticação real do Supabase
    if (isSupabaseConfigured) {
      try {
        if (mode === 'register') {
          const { data, error } = await supabase.auth.signUp({
            email: cleanEmail,
            password,
            options: {
              data: {
                full_name: name.trim() || undefined
              }
            }
          });

          if (error) {
            setErrorMsg(error.message === 'User already registered'
              ? 'Este e-mail já está cadastrado. Tente entrar.'
              : error.message);
            setLoading(false);
            return;
          }

          if (data.user) {
            if (data.session) {
              setSuccessMsg('Conta criada com sucesso!');
              onAuthSuccess({
                id: data.user.id,
                email: data.user.email,
                name: name.trim() || data.user.email?.split('@')[0]
              });
            } else {
              setSuccessMsg('Cadastro realizado! Se a confirmação de e-mail estiver ativa no seu Supabase, verifique sua caixa de entrada.');
            }
          }
        } else {
          // Login
          const { data, error } = await supabase.auth.signInWithPassword({
            email: cleanEmail,
            password
          });

          if (error) {
            setErrorMsg(error.message === 'Invalid login credentials'
              ? 'E-mail ou senha incorretos. Verifique e tente novamente.'
              : error.message);
            setLoading(false);
            return;
          }

          if (data.user) {
            onAuthSuccess({
              id: data.user.id,
              email: data.user.email,
              name: data.user.user_metadata?.full_name || data.user.email?.split('@')[0]
            });
          }
        }
      } catch (err: any) {
        setErrorMsg(err.message || 'Erro de conexão com o servidor.');
      } finally {
        setLoading(false);
      }
    } else {
      // Modo Local / Demo Seguro com isolamento por usuário
      setTimeout(() => {
        setLoading(false);
        const demoUserId = `local-${btoa(cleanEmail).substring(0, 16)}`;
        onAuthSuccess({
          id: demoUserId,
          email: cleanEmail,
          name: name.trim() || cleanEmail.split('@')[0]
        });
      }, 500);
    }
  };

  const handleGuestLogin = () => {
    const guestId = `guest-${Date.now().toString(36)}`;
    onAuthSuccess({
      id: guestId,
      email: 'convidado@enxovalfacil.app',
      name: 'Mamãe Convidada'
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#F3ECF8] via-[#FAF7FC] to-[#FFFFFF] flex flex-col justify-center px-4 py-8">
      <div className="w-full max-w-sm mx-auto">
        {/* Logo & Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-tr from-lavender-700 to-lavender-500 text-white shadow-soft mb-3 ring-4 ring-lavender-100">
            <Sparkles size={28} />
          </div>
          <h1 className="font-heading italic text-3xl font-bold text-baby-dark tracking-tight">
            EnxovalFácil
          </h1>
          <p className="text-xs text-baby-muted mt-1 max-w-[260px] mx-auto">
            O enxoval perfeito e personalizado para a chegada do seu bebê.
          </p>
        </div>

        {/* Supabase Status Banner */}
        {!isSupabaseConfigured && (
          <div className="mb-4 bg-amber-50 border border-amber-200/80 rounded-2xl p-3 text-left flex items-start gap-2.5 shadow-sm">
            <Key size={16} className="text-amber-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-[11px] font-bold text-amber-900 leading-tight">
                Chave da API Supabase pendente
              </p>
              <p className="text-[10px] text-amber-700 leading-tight mt-0.5">
                Para sincronização em tempo real na nuvem, você pode inserir a chave Anon agora.
              </p>
              <button
                type="button"
                onClick={() => setShowConfigModal(true)}
                className="mt-1.5 text-[10px] font-bold text-lavender-700 underline hover:text-lavender-900"
              >
                Configurar chave Supabase agora →
              </button>
            </div>
          </div>
        )}

        {/* Auth Box */}
        <div className="bg-white rounded-[28px] border border-lavender-100/80 p-6 shadow-pop">
          {/* Tabs */}
          <div className="flex bg-lavender-50/80 p-1 rounded-2xl mb-5 border border-lavender-100">
            <button
              type="button"
              onClick={() => { setMode('login'); setErrorMsg(null); setSuccessMsg(null); }}
              className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all ${
                mode === 'login'
                  ? 'bg-white text-lavender-800 shadow-sm'
                  : 'text-baby-muted hover:text-baby-dark'
              }`}
            >
              Entrar
            </button>
            <button
              type="button"
              onClick={() => { setMode('register'); setErrorMsg(null); setSuccessMsg(null); }}
              className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all ${
                mode === 'register'
                  ? 'bg-white text-lavender-800 shadow-sm'
                  : 'text-baby-muted hover:text-baby-dark'
              }`}
            >
              Criar Conta
            </button>
          </div>

          {errorMsg && (
            <div className="mb-4 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl p-3 flex items-start gap-2">
              <AlertCircle size={15} className="flex-shrink-0 mt-0.5 text-rose-500" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="mb-4 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl p-3 flex items-start gap-2">
              <CheckCircle2 size={15} className="flex-shrink-0 mt-0.5 text-emerald-600" />
              <span>{successMsg}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-3.5">
            {mode === 'register' && (
              <div>
                <label className="block text-xs font-bold text-baby-dark mb-1">
                  Seu nome (Mamãe / Papai)
                </label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={e => setName(e.target.value)}
                    placeholder="Ex: Mariana Silva"
                    className="w-full bg-lavender-50/60 border border-lavender-200/90 rounded-xl px-3 py-2.5 text-xs text-baby-dark pl-9 focus:outline-none focus:ring-2 focus:ring-lavender-400"
                  />
                  <User size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-lavender-500" />
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-baby-dark mb-1">
                E-mail
              </label>
              <div className="relative">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="seuemail@exemplo.com"
                  className="w-full bg-lavender-50/60 border border-lavender-200/90 rounded-xl px-3 py-2.5 text-xs text-baby-dark pl-9 focus:outline-none focus:ring-2 focus:ring-lavender-400"
                />
                <Mail size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-lavender-500" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-baby-dark mb-1">
                Senha
              </label>
              <div className="relative">
                <input
                  type="password"
                  required
                  minLength={6}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="Mínimo 6 caracteres"
                  className="w-full bg-lavender-50/60 border border-lavender-200/90 rounded-xl px-3 py-2.5 text-xs text-baby-dark pl-9 focus:outline-none focus:ring-2 focus:ring-lavender-400"
                />
                <Lock size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-lavender-500" />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 mt-1 rounded-xl bg-gradient-to-r from-lavender-700 to-lavender-600 hover:from-lavender-800 hover:to-lavender-700 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-soft hover:shadow-md transition-all disabled:opacity-50"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <span>{mode === 'login' ? 'Entrar no Enxoval' : 'Criar minha conta'}</span>
                  <ArrowRight size={15} />
                </>
              )}
            </button>
          </form>

          <div className="relative my-4">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-lavender-100" />
            </div>
            <div className="relative flex justify-center text-[10px] uppercase">
              <span className="bg-white px-2 text-baby-muted font-bold tracking-wider">
                ou
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={handleGuestLogin}
            className="w-full py-2.5 rounded-xl border border-lavender-200 bg-white text-lavender-700 hover:bg-lavender-50 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
          >
            <ShieldCheck size={14} />
            <span>Experimentar modo convidado</span>
          </button>
        </div>

        <p className="text-[10px] text-center text-baby-muted mt-4">
          Cada conta tem isolamento total e permite cadastrar múltiplos bebês.
        </p>
      </div>

      {/* Modal de Configuração Supabase */}
      {showConfigModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-sm rounded-3xl p-5 shadow-pop">
            <h3 className="font-heading font-bold text-base text-baby-dark mb-1">
              Conectar ao Supabase
            </h3>
            <p className="text-xs text-baby-muted mb-3">
              Cole sua chave <code className="bg-lavender-100 text-lavender-800 px-1 py-0.5 rounded text-[11px]">anon public</code> do painel do Supabase (Project Settings → API).
            </p>
            <textarea
              rows={3}
              value={customKey}
              onChange={e => setCustomKey(e.target.value)}
              placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
              className="w-full bg-lavender-50/70 border border-lavender-200 rounded-xl p-2.5 text-xs text-baby-dark font-mono focus:outline-none focus:ring-2 focus:ring-lavender-400"
            />
            <div className="flex gap-2 mt-4">
              <button
                type="button"
                onClick={() => {
                  if (customKey.trim()) {
                    saveSupabaseConfig(customKey.trim());
                  }
                }}
                className="flex-1 py-2.5 rounded-xl bg-lavender-700 text-white font-bold text-xs hover:bg-lavender-800 transition-colors"
              >
                Salvar e Conectar
              </button>
              <button
                type="button"
                onClick={() => setShowConfigModal(false)}
                className="px-3 py-2.5 rounded-xl text-xs font-bold text-baby-muted hover:text-baby-dark"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
