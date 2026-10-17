import type { Product, CatalogResponse, ReelFind } from '../types/catalog.ts';
import { DEMO_PRODUCTS, DEMO_REELS } from '../data/demoCatalog.ts';

export async function fetchCatalog(): Promise<CatalogResponse> {
  try {
    const response = await fetch('/api/catalog');
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
    const data = await response.json();
    return {
      products: Array.isArray(data.products) && data.products.length > 0 ? data.products : DEMO_PRODUCTS,
      total: typeof data.total === 'number' ? data.total : (data.products?.length || DEMO_PRODUCTS.length),
      isDemo: Boolean(data.isDemo),
      cachedAt: data.cachedAt
    };
  } catch (err) {
    console.warn('[Catalog Service] Falling back to offline curated demo products:', err);
    return {
      products: DEMO_PRODUCTS,
      total: DEMO_PRODUCTS.length,
      isDemo: true,
      cachedAt: new Date().toISOString()
    };
  }
}

export function fetchReels(): ReelFind[] {
  return DEMO_REELS;
}
