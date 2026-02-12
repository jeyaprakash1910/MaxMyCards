export type CatalogCard = {
  id: string;
  name: string;
  image_url: string | null;
  bank: string | null;
};

export function searchCatalog(cards: CatalogCard[], query: string): CatalogCard[] {
  const q = query.trim().toLowerCase();
  if (!q) return cards;
  return cards.filter(
    (c) => c.name.toLowerCase().includes(q) || (c.bank?.toLowerCase().includes(q) ?? false)
  );
}

