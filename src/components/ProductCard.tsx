import React from 'react';
import type { Product } from '../types/catalog.ts';
import { ImageWithFallback } from './ImageWithFallback.tsx';
import { ExternalLink, Eye, Play, Sparkles } from 'lucide-react';

interface ProductCardProps {
  product: Product;
  onQuickView: (product: Product) => void;
  onOpenReel?: (reelUrl: string) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  onQuickView,
  onOpenReel
}) => {
  const discount = product.discount_percent || Math.round(
    ((product.original_price_inr - product.price_inr) / product.original_price_inr) * 100
  );

  // Merchant badge color mapping
  const getMerchantBadge = (merchant: string) => {
    const m = merchant.toLowerCase();
    if (m.includes('meesho')) {
      return 'bg-[#FFF0F5] text-[#C2185B] border-[#F8BBD0]';
    }
    if (m.includes('myntra')) {
      return 'bg-[#FFF1F2] text-[#E11D48] border-[#FECDD3]';
    }
    if (m.includes('ajio')) {
      return 'bg-[#FEFCE8] text-[#854D0E] border-[#FEF08A]';
    }
    if (m.includes('nykaa')) {
      return 'bg-[#FAF5FF] text-[#7E22CE] border-[#E9D5FF]';
    }
    return 'bg-[#FFF9F4] text-[#743D4A] border-[#E9B8BD]';
  };

  const handleShopNow = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (product.affiliate_url) {
      window.open(product.affiliate_url, '_blank', 'noopener,noreferrer,sponsored');
    }
  };

  return (
    <div 
      className="group bg-white rounded-2xl overflow-hidden border border-[#F0E4DC] hover:border-[#E9B8BD] shadow-xs hover:shadow-lg transition-all duration-300 flex flex-col justify-between"
      data-testid={`product-card-${product.product_id}`}
    >
      <div className="relative">
        {/* Product Image Area */}
        <div 
          onClick={() => onQuickView(product)}
          className="relative aspect-3/4 overflow-hidden cursor-pointer bg-[#F5EBE6]"
        >
          <ImageWithFallback
            src={product.image_url}
            alt={product.name}
            className="group-hover:scale-105 transition-transform duration-500 ease-out"
          />

          {/* Badges Overlay */}
          <div className="absolute top-2.5 left-2.5 flex flex-col gap-1.5 z-10">
            {discount > 0 && (
              <span className="bg-[#743D4A] text-white text-[11px] font-bold px-2 py-0.5 rounded-full shadow-sm">
                {discount}% OFF
              </span>
            )}
            {product.featured && (
              <span className="bg-[#E9B8BD] text-[#2D1E1F] text-[10px] font-semibold px-2 py-0.5 rounded-full flex items-center gap-1 shadow-sm backdrop-blur-xs">
                <Sparkles className="w-2.5 h-2.5 text-[#743D4A]" /> Featured
              </span>
            )}
          </div>

          {/* Reel Indicator Pill if linked */}
          {product.reel_url && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                if (onOpenReel) onOpenReel(product.reel_url!);
              }}
              className="absolute top-2.5 right-2.5 bg-black/60 hover:bg-black/80 text-white p-1.5 rounded-full backdrop-blur-xs transition-colors z-10"
              title="View on Instagram Reel"
              aria-label={`View ${product.name} on Instagram Reel`}
            >
              <Play className="w-3 h-3 fill-white" />
            </button>
          )}

          {/* Quick View Floating Hover Button */}
          <div className="absolute inset-x-3 bottom-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex justify-center z-10">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onQuickView(product);
              }}
              className="w-full bg-white/95 hover:bg-white text-[#2D1E1F] text-xs font-medium py-2 rounded-xl shadow-md flex items-center justify-center gap-1.5 backdrop-blur-xs border border-[#F0E4DC] transition-transform active:scale-95"
            >
              <Eye className="w-3.5 h-3.5 text-[#743D4A]" /> Quick View
            </button>
          </div>
        </div>

        {/* Product Details Area */}
        <div className="p-3.5">
          {/* Category & Merchant tags */}
          <div className="flex items-center justify-between gap-1 mb-1.5">
            <span className="text-[11px] font-medium text-[#743D4A]/70 uppercase tracking-wider truncate">
              {product.category}
            </span>
            <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded border ${getMerchantBadge(product.merchant)}`}>
              {product.merchant}
            </span>
          </div>

          {/* Product Name */}
          <h3 
            onClick={() => onQuickView(product)}
            className="font-medium text-sm text-[#2D1E1F] hover:text-[#743D4A] line-clamp-2 leading-snug cursor-pointer transition-colors min-h-[2.5rem]"
            title={product.name}
          >
            {product.name}
          </h3>

          {/* Pricing */}
          <div className="mt-2.5 flex items-baseline gap-2">
            <span className="text-base font-bold text-[#743D4A]">
              ₹{product.price_inr.toLocaleString('en-IN')}
            </span>
            {product.original_price_inr > product.price_inr && (
              <span className="text-xs text-stone-400 line-through">
                ₹{product.original_price_inr.toLocaleString('en-IN')}
              </span>
            )}
            {discount > 0 && (
              <span className="text-[11px] font-semibold text-emerald-700 ml-auto">
                Save ₹{(product.original_price_inr - product.price_inr).toLocaleString('en-IN')}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Shop Now Primary Action */}
      <div className="px-3.5 pb-3.5 pt-1">
        <a
          href={product.affiliate_url || '#'}
          target="_blank"
          rel="noopener noreferrer sponsored"
          onClick={handleShopNow}
          className="w-full bg-[#743D4A] hover:bg-[#5E2F3B] active:bg-[#48222B] text-[#FFF9F4] text-xs font-semibold py-2.5 px-3 rounded-xl flex items-center justify-center gap-1.5 transition-all shadow-xs hover:shadow-md cursor-pointer text-center"
          aria-label={`Shop ${product.name} on ${product.merchant}`}
        >
          <span>Shop on {product.merchant}</span>
          <ExternalLink className="w-3.5 h-3.5 shrink-0" />
        </a>
      </div>
    </div>
  );
};
