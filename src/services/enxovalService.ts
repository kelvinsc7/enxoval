import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { BabyProfile, EnxovalItem, ClosetItem } from '../types';
import { INITIAL_ENXOVAL_ITEMS } from '../data/initialEnxovalData';

export const enxovalService = {
  /**
   * Buscar todos os bebês vinculados ao usuário autenticado
   */
  async getUserBabies(userId: string): Promise<BabyProfile[]> {
    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase
          .schema('enxoval')
          .from('bebes')
          .select('*')
          .eq('user_id', userId)
          .order('criado_em', { ascending: true });

        if (!error && data) {
          const babies: BabyProfile[] = data.map(b => ({
            id: b.id,
            userId: b.user_id,
            name: b.nome,
            dueDate: b.data_prevista,
            city: b.cidade,
            state: b.estado,
            gestationalWeek: b.semana_gestacional || 32,
            gender: (b.genero as any) || 'neutral'
          }));

          // Backup local scoped by user
          localStorage.setItem(`enxoval_${userId}_babies`, JSON.stringify(babies));
          return babies;
        }
      } catch (err) {
        console.warn('Erro ao buscar bebês no Supabase:', err);
      }
    }

    // Fallback local caso offline ou sem Supabase configurado
    const saved = localStorage.getItem(`enxoval_${userId}_babies`);
    return saved ? JSON.parse(saved) : [];
  },

  /**
   * Cadastrar um novo bebê para o usuário e gerar a lista de enxoval inicial limpa e personalizada
   */
  async createBaby(userId: string, babyData: Omit<BabyProfile, 'id'>): Promise<BabyProfile> {
    let newBaby: BabyProfile = {
      id: `baby-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      userId,
      ...babyData
    };

    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase
          .schema('enxoval')
          .from('bebes')
          .insert({
            user_id: userId,
            nome: babyData.name,
            data_prevista: babyData.dueDate,
            cidade: babyData.city,
            estado: babyData.state,
            semana_gestacional: babyData.gestationalWeek,
            genero: babyData.gender
          })
          .select()
          .single();

        if (!error && data) {
          newBaby = {
            id: data.id,
            userId: data.user_id,
            name: data.nome,
            dueDate: data.data_prevista,
            city: data.cidade,
            state: data.estado,
            gestationalWeek: data.semana_gestacional || 32,
            gender: (data.genero as any) || 'neutral'
          };
        }
      } catch (err) {
        console.warn('Erro ao inserir bebê no Supabase:', err);
      }
    }

    // Inicializar os itens do enxoval para esse bebê a partir do template limpo
    const initialItemsForBaby: EnxovalItem[] = INITIAL_ENXOVAL_ITEMS.map(tpl => ({
      ...tpl,
      currentQty: 0,
      isAcquired: false,
      subItems: tpl.subItems ? tpl.subItems.map(s => ({ ...s, isAcquired: false, currentQty: 0 })) : undefined
    }));

    // Se estiver conectado ao Supabase, insere os itens em lote no schema enxoval
    if (isSupabaseConfigured && newBaby.id) {
      try {
        const rows = initialItemsForBaby.map(item => ({
          id: item.id,
          bebe_id: newBaby.id,
          categoria_id: item.categoryId,
          subcategoria: item.subcategory,
          nome: item.name,
          icone: item.iconName || 'Sparkles',
          quantidade_recomendada: item.recommendedQty || null,
          quantidade_atual: 0,
          adquirido: false,
          opcional: !!item.isOptional,
          dispensado: !!item.isDismissed,
          sub_itens: item.subItems || null
        }));

        // Inserir em chunks de 50 para evitar limites de payload
        for (let i = 0; i < rows.length; i += 50) {
          const chunk = rows.slice(i, i + 50);
          await supabase.schema('enxoval').from('itens').insert(chunk);
        }
      } catch (err) {
        console.warn('Erro ao gerar itens iniciais no Supabase:', err);
      }
    }

    // Salvar itens localmente
    localStorage.setItem(`enxoval_${newBaby.id}_items`, JSON.stringify(initialItemsForBaby));

    // Atualizar lista de bebês local
    const currentBabies = await this.getUserBabies(userId);
    const updated = [...currentBabies.filter(b => b.id !== newBaby.id), newBaby];
    localStorage.setItem(`enxoval_${userId}_babies`, JSON.stringify(updated));

    return newBaby;
  },

  /**
   * Atualizar dados cadastrais do bebê
   */
  async updateBaby(baby: BabyProfile): Promise<boolean> {
    if (isSupabaseConfigured) {
      try {
        const { error } = await supabase
          .schema('enxoval')
          .from('bebes')
          .update({
            nome: baby.name,
            data_prevista: baby.dueDate,
            cidade: baby.city,
            estado: baby.state,
            semana_gestacional: baby.gestationalWeek,
            genero: baby.gender
          })
          .eq('id', baby.id);

        if (error) return false;
      } catch {
        return false;
      }
    }

    if (baby.userId) {
      const babies = await this.getUserBabies(baby.userId);
      const updated = babies.map(b => b.id === baby.id ? baby : b);
      localStorage.setItem(`enxoval_${baby.userId}_babies`, JSON.stringify(updated));
    }

    return true;
  },

  /**
   * Deletar bebê e seus dados
   */
  async deleteBaby(userId: string, babyId: string): Promise<boolean> {
    if (isSupabaseConfigured) {
      try {
        await supabase.schema('enxoval').from('itens').delete().eq('bebe_id', babyId);
        await supabase.schema('enxoval').from('armario').delete().eq('bebe_id', babyId);
        await supabase.schema('enxoval').from('presentes_reservas').delete().eq('bebe_id', babyId);
        await supabase.schema('enxoval').from('bebes').delete().eq('id', babyId);
      } catch (err) {
        console.warn('Erro ao deletar bebê no Supabase:', err);
      }
    }

    localStorage.removeItem(`enxoval_${babyId}_items`);
    localStorage.removeItem(`enxoval_${babyId}_closet`);

    const babies = await this.getUserBabies(userId);
    const updated = babies.filter(b => b.id !== babyId);
    localStorage.setItem(`enxoval_${userId}_babies`, JSON.stringify(updated));

    return true;
  },

  /**
   * Obter itens do enxoval de um bebê específico
   */
  async getItems(babyId: string): Promise<EnxovalItem[]> {
    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase
          .schema('enxoval')
          .from('itens')
          .select('*')
          .eq('bebe_id', babyId);

        if (!error && data && data.length > 0) {
          const items: EnxovalItem[] = data.map(row => ({
            id: row.id,
            categoryId: row.categoria_id,
            subcategory: row.subcategoria,
            name: row.nome,
            iconName: row.icone || 'Sparkles',
            recommendedQty: row.quantidade_recomendada,
            currentQty: row.quantidade_atual || 0,
            isAcquired: !!row.adquirido,
            isOptional: !!row.opcional,
            isDismissed: !!row.dispensado,
            subItems: row.sub_itens || undefined
          }));

          localStorage.setItem(`enxoval_${babyId}_items`, JSON.stringify(items));
          return items;
        }
      } catch (err) {
        console.warn('Erro ao carregar itens do Supabase:', err);
      }
    }

    const saved = localStorage.getItem(`enxoval_${babyId}_items`);
    if (saved) return JSON.parse(saved);

    // Se ainda não existir lista salva para este bebê, cria a partir do template limpo
    const freshItems: EnxovalItem[] = INITIAL_ENXOVAL_ITEMS.map(tpl => ({
      ...tpl,
      currentQty: 0,
      isAcquired: false,
      subItems: tpl.subItems ? tpl.subItems.map(s => ({ ...s, isAcquired: false, currentQty: 0 })) : undefined
    }));
    localStorage.setItem(`enxoval_${babyId}_items`, JSON.stringify(freshItems));
    return freshItems;
  },

  /**
   * Salvar/atualizar um item do enxoval do bebê
   */
  async saveItem(babyId: string, item: EnxovalItem): Promise<boolean> {
    if (isSupabaseConfigured) {
      try {
        await supabase
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
          }, { onConflict: 'id,bebe_id' });
      } catch (err) {
        console.warn('Erro ao salvar item no Supabase:', err);
      }
    }
    return true;
  },

  /**
   * Salvar lista completa em lote
   */
  async syncAllItemsLocally(babyId: string, items: EnxovalItem[]): Promise<void> {
    localStorage.setItem(`enxoval_${babyId}_items`, JSON.stringify(items));
  },

  /**
   * Armário Virtual
   */
  async getCloset(babyId: string): Promise<ClosetItem[]> {
    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase
          .schema('enxoval')
          .from('armario')
          .select('*')
          .eq('bebe_id', babyId)
          .order('criado_em', { ascending: false });

        if (!error && data) {
          const closet: ClosetItem[] = data.map(row => ({
            id: row.id,
            name: row.nome,
            type: row.tipo,
            size: row.tamanho as any,
            color: row.cor,
            status: row.status as any,
            createdAt: row.criado_em
          }));
          localStorage.setItem(`enxoval_${babyId}_closet`, JSON.stringify(closet));
          return closet;
        }
      } catch (err) {
        console.warn('Erro ao carregar armário do Supabase:', err);
      }
    }

    const saved = localStorage.getItem(`enxoval_${babyId}_closet`);
    return saved ? JSON.parse(saved) : [];
  },

  async addClosetItem(babyId: string, item: ClosetItem): Promise<boolean> {
    if (isSupabaseConfigured) {
      try {
        await supabase
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
      } catch (err) {
        console.warn('Erro ao adicionar peça no armário no Supabase:', err);
      }
    }

    const current = await this.getCloset(babyId);
    const updated = [item, ...current];
    localStorage.setItem(`enxoval_${babyId}_closet`, JSON.stringify(updated));
    return true;
  },

  async deleteClosetItem(babyId: string, itemId: string): Promise<boolean> {
    if (isSupabaseConfigured) {
      try {
        await supabase
          .schema('enxoval')
          .from('armario')
          .delete()
          .eq('id', itemId);
      } catch (err) {
        console.warn('Erro ao deletar do armário no Supabase:', err);
      }
    }

    const current = await this.getCloset(babyId);
    const updated = current.filter(i => i.id !== itemId);
    localStorage.setItem(`enxoval_${babyId}_closet`, JSON.stringify(updated));
    return true;
  },

  /**
   * Reservar presente no Chá de Bebê
   */
  async reserveGift(babyId: string, itemId: string, guestName: string, message?: string): Promise<boolean> {
    if (isSupabaseConfigured) {
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
    return true;
  }
};
