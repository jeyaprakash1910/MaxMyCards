import { supabase } from './supabase';

export type CatalogCard = {
  id: string;
  name: string;
  image_url: string | null;
  bank: string | null;
};

export async function fetchCardCatalog(): Promise<CatalogCard[]> {
  const { data, error } = await supabase
    .from('card_catalog')
    .select('id, name, image_url, bank')
    .order('name');

  if (error) {
    console.error('Error fetching catalog:', error);
    return [];
  }
  return data ?? [];
}

export function searchCatalog(cards: CatalogCard[], query: string): CatalogCard[] {
  const q = query.trim().toLowerCase();
  if (!q) return cards;
  return cards.filter(
    (c) =>
      c.name.toLowerCase().includes(q) || (c.bank?.toLowerCase().includes(q) ?? false)
  );
}
