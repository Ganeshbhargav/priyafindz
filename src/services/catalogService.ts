import type { Product, CatalogResponse } from '../types/catalog.ts';

export async function fetchCatalog(): Promise<CatalogResponse> {
  try {
    const response = await fetch('/api/catalog');
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
    const data = await response.json();
    return {
      products: Array.isArray(data.products) ? data.products : [],
      total: typeof data.total === 'number' ? data.total : (data.products?.length || 0),
      cachedAt: data.cachedAt
    };
  } catch (err) {
    console.warn('[Catalog Service] Unable to reach catalog API:', err);
    return {
      products: [],
      total: 0,
      cachedAt: new Date().toISOString()
    };
  }
}

/**
 * Derives products with attached Instagram Reel links dynamically from Google Sheets rows
 */
export function getProductsWithReels(products: Product[]): Product[] {
  return products.filter(p => {
    const url = (p.reelUrl || p.reel_url || '').trim();
    return url.length > 0 && p.isActive;
  });
}
