export interface Product {
  product_id: string;
  name: string;
  description: string;
  price_inr: number;
  original_price_inr: number;
  category: string;
  merchant: string;
  affiliate_url: string;
  image_url: string;
  reel_url?: string;
  featured: boolean;
  active: boolean;
  created_at: string;
  // Computed / UI helpers
  discount_percent?: number;
  tags?: string[];
  in_stock?: boolean;
}

export type Category = 
  | 'All'
  | 'Ethnic Wear'
  | 'Kurtis'
  | 'Co-ord Sets'
  | 'Western Wear'
  | 'Dresses'
  | 'Handbags'
  | 'Accessories'
  | 'Under ₹299'
  | 'Under ₹499'
  | 'Under ₹999';

export const CATEGORIES: Category[] = [
  'All',
  'Ethnic Wear',
  'Kurtis',
  'Co-ord Sets',
  'Western Wear',
  'Dresses',
  'Handbags',
  'Accessories',
  'Under ₹299',
  'Under ₹499',
  'Under ₹999',
];

export const MERCHANTS = [
  'All',
  'Meesho',
  'Myntra',
  'Ajio',
  'Amazon India',
  'Nykaa Fashion'
] as const;

export interface ReelFind {
  id: string;
  reel_url: string;
  title: string;
  creator: string;
  video_preview?: string;
  thumbnail_url: string;
  views: string;
  likes: string;
  tagged_product_ids: string[];
}

export interface CatalogMetadata {
  source: 'demo' | 'google_sheet';
  sheetId?: string;
  sheetUrl?: string;
  lastSyncedAt: string;
  itemCount: number;
  status: 'demo' | 'connected' | 'error' | 'syncing';
  errorMessage?: string;
  validatedColumns?: string[];
}
