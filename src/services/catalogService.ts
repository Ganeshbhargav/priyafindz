import type { Product, CatalogMetadata, ReelFind } from '../types/catalog.ts';
import { DEMO_PRODUCTS, DEMO_REELS } from '../data/demoCatalog.ts';

export interface CatalogResponse {
  products: Product[];
  metadata: CatalogMetadata;
}

export async function fetchCatalog(): Promise<CatalogResponse> {
  try {
    const response = await fetch('/api/catalog');
    if (!response.ok) {
      throw new Error(`HTTP error ${response.status}`);
    }
    const data = await response.json();
    return {
      products: Array.isArray(data.products) && data.products.length > 0 ? data.products : DEMO_PRODUCTS,
      metadata: data.metadata || {
        source: 'demo',
        lastSyncedAt: new Date().toISOString(),
        itemCount: DEMO_PRODUCTS.length,
        status: 'demo'
      }
    };
  } catch (err) {
    console.warn('Falling back to local demo catalog due to network/server state:', err);
    return {
      products: DEMO_PRODUCTS,
      metadata: {
        source: 'demo',
        lastSyncedAt: new Date().toISOString(),
        itemCount: DEMO_PRODUCTS.length,
        status: 'demo',
        errorMessage: 'Serving offline demo catalog'
      }
    };
  }
}

export async function connectGoogleSheet(sheetUrl: string): Promise<{
  success: boolean;
  message?: string;
  error?: string;
  details?: string[];
  metadata?: CatalogMetadata;
  previewProducts?: Product[];
}> {
  try {
    const response = await fetch('/api/catalog/connect', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sheetUrl })
    });
    const result = await response.json();
    return result;
  } catch (err: any) {
    return {
      success: false,
      error: err.message || 'Network error while attempting to connect spreadsheet.'
    };
  }
}

export async function resetCatalogToDemo(): Promise<{
  success: boolean;
  message?: string;
  metadata?: CatalogMetadata;
}> {
  try {
    const response = await fetch('/api/catalog/reset-demo', {
      method: 'POST'
    });
    const result = await response.json();
    return result;
  } catch (err: any) {
    return {
      success: false,
      message: err.message || 'Failed to reset catalog'
    };
  }
}

export function fetchReels(): ReelFind[] {
  return DEMO_REELS;
}
