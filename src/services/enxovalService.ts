import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { BabyProfile, EnxovalItem, ClosetItem } from '../types';

export const enxovalService = {
  async getBabies(): Promise<BabyProfile[] | null> {
    if (!isSupabaseConfigured) return null;
    try {
      const { data, error } = await supabase
        .schema('enxoval')
        .from('bebes')
        .select('*')
        .order('criado_em', { ascending: true });

      if (error || !data) return null;

      return data.map(b => ({
        id: b.id,
        name: b.nome,
        dueDate: b.data_prevista,
        city: b.cidade,
        state: b.estado,
        gestationalWeek: b.semana_gestacional || 32,
        gender: (b.genero as any) || 'neutral'
      }));
    } catch {
      return null;
    }
  },

  async saveBaby(baby: BabyProfile): Promise<boolean> {
    if (!isSupabaseConfigured) return false;
    try {
      const payload: any = {
        nome: baby.name,
        data_prevista: baby.dueDate,
        cidade: baby.city,
        estado: baby.state,
        semana_gestacional: baby.gestationalWeek,
        genero: baby.gender
      };

      if (baby.id && baby.id.includes('-') && baby.id.length > 30) {
        payload.id = baby.id;
      }

      const { error } = await supabase
        .schema('enxoval')
        .from('bebes')
        .upsert(payload);

      return !error;
    } catch {
      return false;
    }
  },

  async getItems(babyId: string): Promise<EnxovalItem[] | null> {
    if (!isSupabaseConfigured) return null;
    try {
      const { data, error } = await supabase
        .schema('enxoval')
        .from('itens')
        .select('*')
        .eq('bebe_id', babyId);

      if (error || !data || data.length === 0) return null;

      return data.map(row => ({
        id: row.id,
        categoryId: row.categoria_id,
        subcategory: row.subcategoria,
        name: row.nome,
        iconName: row.icone || 'Sparkles',
        recommendedQty: row.quantidade_recomendada,
        currentQty: row.quantidade_atual,
        isAcquired: row.adquirido,
        isOptional: row.opcional,
        isDismissed: row.dispensado,
        subItems: row.sub_itens
      }));
    } catch {
      return null;
    }
  },

  async saveItem(babyId: string, item: EnxovalItem): Promise<boolean> {
    if (!isSupabaseConfigured) return false;
    try {
      const { error } = await supabase
        .schema('enxoval')
        .from('itens')
        .upsert({
          id: item.id,
          bebe_id: babyId,
          categoria_id: item.categoryId,
          subcategoria: item.subcategory,
          nome: item.name,
          icone: item.iconName,
          quantidade_recomendada: item.recommendedQty || null,
          quantidade_atual: item.currentQty || 0,
          adquirido: !!item.isAcquired,
          opcional: !!item.isOptional,
          dispensado: !!item.isDismissed,
          sub_itens: item.subItems || null,
          atualizado_em: new Date().toISOString()
        });

      return !error;
    } catch {
      return false;
    }
  },

  async getCloset(babyId: string): Promise<ClosetItem[] | null> {
    if (!isSupabaseConfigured) return null;
    try {
      const { data, error } = await supabase
        .schema('enxoval')
        .from('armario')
        .select('*')
        .eq('bebe_id', babyId);

      if (error || !data) return null;

      return data.map(row => ({
        id: row.id,
        name: row.nome,
        type: row.tipo,
        size: row.tamanho as any,
        color: row.cor,
        status: row.status as any,
        createdAt: row.criado_em
      }));
    } catch {
      return null;
    }
  },

  async addClosetItem(babyId: string, item: ClosetItem): Promise<boolean> {
    if (!isSupabaseConfigured) return false;
    try {
      const { error } = await supabase
        .schema('enxoval')
        .from('armario')
        .insert({
          bebe_id: babyId,
          nome: item.name,
          tipo: item.type,
          tamanho: item.size,
          cor: item.color,
          status: item.status
        });

      return !error;
    } catch {
      return false;
    }
  },

  async reserveGift(babyId: string, itemId: string, guestName: string, message?: string): Promise<boolean> {
    if (!isSupabaseConfigured) return false;
    try {
      const { error } = await supabase
        .schema('enxoval')
        .from('presentes_reservas')
        .insert({
          bebe_id: babyId,
          item_id: itemId,
          nome_convidado: guestName,
          mensagem: message || null
        });

      return !error;
    } catch {
      return false;
    }
  }
};
