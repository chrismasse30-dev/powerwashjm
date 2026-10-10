import { supabase } from '../lib/supabase';

export interface ServiceShowcaseCard {
  id: string;
  service_name: string;
  service_slug: string;
  image_url: string;
  display_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export const serviceShowcaseService = {
  async getRotatedCards(limit: number = 6): Promise<ServiceShowcaseCard[]> {
    try {
      const { data: allCards, error } = await supabase
        .from('service_showcase_cards')
        .select('*')
        .eq('is_active', true)
        .order('display_order', { ascending: true });

      if (error) {
        console.error('Error fetching service showcase cards:', error);
        return [];
      }

      if (!allCards || allCards.length === 0) {
        return [];
      }

      const dayOfYear = Math.floor(Date.now() / 86400000);
      const offset = dayOfYear % allCards.length;

      const rotatedCards = [
        ...allCards.slice(offset),
        ...allCards.slice(0, offset)
      ];

      return rotatedCards.slice(0, limit);
    } catch (error) {
      console.error('Error in getRotatedCards:', error);
      return [];
    }
  },

  async getAllCards(): Promise<ServiceShowcaseCard[]> {
    try {
      const { data, error } = await supabase
        .from('service_showcase_cards')
        .select('*')
        .eq('is_active', true)
        .order('display_order', { ascending: true });

      if (error) {
        console.error('Error fetching all service showcase cards:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Error in getAllCards:', error);
      return [];
    }
  },

  async addCard(card: Omit<ServiceShowcaseCard, 'id' | 'created_at' | 'updated_at'>): Promise<ServiceShowcaseCard | null> {
    try {
      const { data, error } = await supabase
        .from('service_showcase_cards')
        .insert([card])
        .select()
        .single();

      if (error) {
        console.error('Error adding service showcase card:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error in addCard:', error);
      return null;
    }
  },

  async updateCard(id: string, updates: Partial<ServiceShowcaseCard>): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('service_showcase_cards')
        .update(updates)
        .eq('id', id);

      if (error) {
        console.error('Error updating service showcase card:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error in updateCard:', error);
      return false;
    }
  },

  async deleteCard(id: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('service_showcase_cards')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Error deleting service showcase card:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error in deleteCard:', error);
      return false;
    }
  },

  getDayOffset(): number {
    return Math.floor(Date.now() / 86400000);
  }
};
