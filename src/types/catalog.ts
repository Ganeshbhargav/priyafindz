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

  // Aliases for compatibility
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

export interface CatalogResponse {
  products: Product[];
  total: number;
  cachedAt?: string;
}
