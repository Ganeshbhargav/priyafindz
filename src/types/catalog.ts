export interface Product {
  productId: string;
  productName: string;
  category: string;
  retailer: string;
  price: number;
  originalPrice?: number;
  imageUrl: string;
  affiliateUrl: string;
  description: string;
  reelUrl?: string;
  featured: boolean;
  isActive: boolean;
  createdAt: string;
  discountPercent?: number;

  // Backwards compatibility aliases
  product_id: string;
  name: string;
  merchant: string;
  price_inr: number;
  original_price_inr: number;
  image_url: string;
  affiliate_url: string;
  reel_url?: string;
  active: boolean;
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
  | 'Under ₹399'
  | 'Under ₹499';

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
  'Under ₹399',
  'Under ₹499'
];

export const RETAILERS = [
  'All',
  'Meesho',
  'Myntra',
  'Ajio',
  'Amazon India',
  'Nykaa Fashion'
] as const;

export const MERCHANTS = RETAILERS;

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

export interface CatalogResponse {
  products: Product[];
  total: number;
  isDemo: boolean;
  cachedAt?: string;
}
