import React from 'react';
import type { Product } from '../types/catalog.ts';
import { ImageWithFallback } from './ImageWithFallback.tsx';
import { Play, Instagram, ExternalLink, Eye, Sparkles } from 'lucide-react';

interface ReelCardProps {
  product: Product;
  onSelectProduct: (p: Product) => void;
  onOpenReel?: (reelUrl: string) => void;
}

export const ReelCard: React.FC<ReelCardProps> = ({
  product,
  onSelectProduct,
  onOpenReel
}) => {
  const price = product.price ?? product.price_inr ?? 0;
  const originalPrice = product.originalPrice ?? (product.original_price_inr > price ? product.original_price_inr : undefined);
  const discount = product.discountPercent ?? product.discount_percent ?? (
    originalPrice && originalPrice > price ? Math.round(((originalPrice - price) / originalPrice) * 100) : 0
  );

  const name = product.productName || product.name || 'Featured Look';
  const retailer = product.retailer || product.merchant || 'Merchant';
  const imageUrl = product.imageUrl || product.image_url;
  const affiliateUrl = product.affiliateUrl || product.affiliate_url || '#';
  const reelUrl = product.reelUrl || product.reel_url || '';
  const productId = product.productId || product.product_id;

  const handleWatchReel = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onOpenReel && reelUrl) {
      onOpenReel(reelUrl);
    } else if (reelUrl) {
      window.open(reelUrl, '_blank', 'noopener,noreferrer');
    }
  };

  const handleShopNow = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (affiliateUrl && affiliateUrl !== '#') {
      window.open(affiliateUrl, '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <div 
      className="group bg-white rounded-3xl overflow-hidden border border-[#F0E4DC] hover:border-[#E9B8BD] shadow-xs hover:shadow-xl transition-all duration-300 flex flex-col justify-between"
      data-testid={`reel-card-${productId}`}
    >
      {/* Reel Thumbnail Header with Instagram Aesthetic */}
      <div 
        onClick={() => onSelectProduct(product)}
        className="relative aspect-9/14 bg-stone-900 overflow-hidden cursor-pointer"
      >
        <ImageWithFallback
          src={imageUrl}
          alt={name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 opacity-95 group-hover:opacity-100"
        />

        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-black/30 pointer-events-none" />

        {/* Top Badges */}
        <div className="absolute top-3 left-3 right-3 flex items-center justify-between text-white z-10">
          <div className="flex items-center gap-1.5 bg-black/45 backdrop-blur-md px-2.5 py-1 rounded-full border border-white/20 text-xs font-semibold">
            <Instagram className="w-3.5 h-3.5 text-[#E9B8BD]" />
            <span>Shop The Reel</span>
          </div>

          {discount > 0 && (
            <span className="bg-[#743D4A] text-white text-[11px] font-bold px-2 py-0.5 rounded-full shadow-sm">
              {discount}% OFF
            </span>
          )}
        </div>

        {/* Center Play Button to Open Reel */}
        {reelUrl && (
          <button
            type="button"
            onClick={handleWatchReel}
            className="absolute inset-0 m-auto w-13 h-13 rounded-full bg-white/30 hover:bg-white/45 backdrop-blur-md border border-white/50 flex items-center justify-center text-white transition-all hover:scale-110 active:scale-95 shadow-xl z-10 cursor-pointer"
            aria-label={`Play Reel for ${name}`}
          >
            <Play className="w-5 h-5 fill-white ml-0.5" />
          </button>
        )}

        {/* Bottom Media Card Content */}
        <div className="absolute bottom-3 left-3 right-3 text-white z-10 space-y-1.5">
          <span className="text-[10px] font-semibold text-[#E9B8BD] uppercase tracking-wider block">
            {retailer} • {product.category}
          </span>
          <p className="text-xs sm:text-sm font-semibold line-clamp-2 drop-shadow-md leading-snug">
            {name}
          </p>

          <div className="flex items-baseline gap-2 pt-0.5">
            <span className="text-sm font-bold text-white">
              ₹{price.toLocaleString('en-IN')}
            </span>
            {originalPrice && originalPrice > price && (
              <span className="text-xs text-white/60 line-through">
                ₹{originalPrice.toLocaleString('en-IN')}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Action Footer */}
      <div className="p-3 bg-[#FFFDFB] border-t border-[#F0E4DC] flex items-center gap-2">
        {reelUrl ? (
          <button
            type="button"
            onClick={handleWatchReel}
            className="flex-1 bg-white hover:bg-[#FFF5F6] border border-[#E9B8BD] text-[#743D4A] text-xs font-semibold py-2 px-2.5 rounded-xl flex items-center justify-center gap-1.5 transition-all shadow-xs cursor-pointer"
          >
            <Instagram className="w-3.5 h-3.5 text-pink-600" />
            <span>Watch Reel</span>
          </button>
        ) : (
          <button
            type="button"
            onClick={() => onSelectProduct(product)}
            className="flex-1 bg-white hover:bg-[#FFF5F6] border border-[#E9B8BD] text-[#743D4A] text-xs font-semibold py-2 px-2.5 rounded-xl flex items-center justify-center gap-1.5 transition-all shadow-xs cursor-pointer"
          >
            <Eye className="w-3.5 h-3.5 text-[#743D4A]" />
            <span>Details</span>
          </button>
        )}

        <button
          type="button"
          onClick={handleShopNow}
          className="flex-1 bg-[#743D4A] hover:bg-[#5E2F3B] text-[#FFF9F4] text-xs font-semibold py-2 px-2.5 rounded-xl flex items-center justify-center gap-1.5 transition-all shadow-xs cursor-pointer text-center"
        >
          <span>Shop Look</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
