import { createClient } from '@supabase/supabase-js';

const getEnvOrStored = (key: string, storedName: string, defaultVal = '') => {
  if (typeof window !== 'undefined') {
    const stored = localStorage.getItem(storedName);
    if (stored) return stored;
  }
  return (import.meta.env as any)[key] || defaultVal;
};

export const SUPABASE_URL = getEnvOrStored('VITE_SUPABASE_URL', 'enxoval_supabase_url', 'https://udixfystvymljxdqbrom.supabase.co');
export const SUPABASE_ANON_KEY = getEnvOrStored('VITE_SUPABASE_ANON_KEY', 'enxoval_supabase_anon_key', '');

export const isSupabaseConfigured = Boolean(SUPABASE_URL && SUPABASE_ANON_KEY && SUPABASE_ANON_KEY.length > 10);

export const supabase = createClient(
  SUPABASE_URL,
  SUPABASE_ANON_KEY || 'dummy-anon-key-placeholder',
  {
    db: {
      schema: 'enxoval'
    },
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true
    }
  }
);

export function saveSupabaseConfig(anonKey: string, url?: string) {
  if (typeof window !== 'undefined') {
    localStorage.setItem('enxoval_supabase_anon_key', anonKey.trim());
    if (url) localStorage.setItem('enxoval_supabase_url', url.trim());
    window.location.reload();
  }
}
