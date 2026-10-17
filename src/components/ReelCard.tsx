import React, { useState } from 'react';
import type { ReelFind, Product } from '../types/catalog.ts';
import { ImageWithFallback } from './ImageWithFallback.tsx';
import { Play, Instagram, ShoppingBag, ExternalLink, ChevronDown, ChevronUp, Eye, Heart } from 'lucide-react';

interface ReelCardProps {
  reel: ReelFind;
  taggedProducts: Product[];
  onSelectProduct: (p: Product) => void;
}

export const ReelCard: React.FC<ReelCardProps> = ({
  reel,
  taggedProducts,
  onSelectProduct
}) => {
  const [showProducts, setShowProducts] = useState(false);

  return (
    <div 
      className="bg-white rounded-3xl overflow-hidden border border-[#F0E4DC] hover:border-[#E9B8BD] shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col"
      data-testid={`reel-card-${reel.id}`}
    >
      {/* Reel Thumbnail Header with Instagram Look */}
      <div className="relative aspect-9/14 bg-stone-900 group overflow-hidden">
        <ImageWithFallback
          src={reel.thumbnail_url}
          alt={reel.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 opacity-90 group-hover:opacity-100"
        />

        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-black/30 pointer-events-none" />

        {/* Top Bar: Creator Info */}
        <div className="absolute top-3 left-3 right-3 flex items-center justify-between text-white z-10">
          <div className="flex items-center gap-2 bg-black/40 backdrop-blur-md px-2.5 py-1 rounded-full border border-white/20">
            <Instagram className="w-3.5 h-3.5 text-[#E9B8BD]" />
            <span className="text-xs font-semibold">{reel.creator}</span>
          </div>

          <div className="flex items-center gap-2 text-[11px] font-medium bg-black/40 backdrop-blur-md px-2 py-0.5 rounded-full border border-white/10 text-white/90">
            <span className="flex items-center gap-1"><Eye className="w-3 h-3 text-[#E9B8BD]" /> {reel.views}</span>
            <span className="flex items-center gap-1"><Heart className="w-3 h-3 text-rose-400 fill-rose-400" /> {reel.likes}</span>
          </div>
        </div>

        {/* Center Play Button Overlay */}
        <a
          href={reel.reel_url}
          target="_blank"
          rel="noopener noreferrer"
          className="absolute inset-0 m-auto w-14 h-14 rounded-full bg-white/25 hover:bg-white/40 backdrop-blur-md border border-white/40 flex items-center justify-center text-white transition-all hover:scale-110 active:scale-95 shadow-xl z-10"
          aria-label={`Play Reel: ${reel.title}`}
        >
          <Play className="w-6 h-6 fill-white ml-0.5" />
        </a>

        {/* Bottom Content within Media */}
        <div className="absolute bottom-3 left-3 right-3 text-white z-10">
          <p className="text-sm font-medium line-clamp-2 drop-shadow-md mb-2 leading-snug">
            {reel.title}
          </p>

          <div className="flex items-center justify-between gap-2">
            <a
              href={reel.reel_url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#E9B8BD] hover:text-white transition-colors"
            >
              <span>Watch on Instagram</span>
              <ExternalLink className="w-3 h-3" />
            </a>

            <button
              onClick={() => setShowProducts(!showProducts)}
              className="bg-[#743D4A] hover:bg-[#5E2F3B] text-[#FFF9F4] text-xs font-semibold px-3 py-1.5 rounded-full flex items-center gap-1.5 shadow-md active:scale-95 transition-all cursor-pointer"
            >
              <ShoppingBag className="w-3.5 h-3.5 text-[#E9B8BD]" />
              <span>Shop Look ({taggedProducts.length})</span>
              {showProducts ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
            </button>
          </div>
        </div>
      </div>

      {/* Expandable Tagged Products List */}
      {showProducts && (
        <div className="p-4 bg-[#FFFDFB] border-t border-[#F0E4DC] animate-in fade-in slide-in-from-top-2 duration-200">
          <h4 className="text-xs font-bold uppercase tracking-wider text-[#743D4A] mb-2.5 flex items-center justify-between">
            <span>Items Styled in this Reel</span>
            <span className="text-[11px] text-stone-500 font-normal">Tap item to view</span>
          </h4>

          <div className="flex flex-col gap-2.5">
            {taggedProducts.map((p) => (
              <div
                key={p.product_id}
                onClick={() => onSelectProduct(p)}
                className="flex items-center gap-3 p-2 rounded-xl bg-white border border-[#F0E4DC] hover:border-[#E9B8BD] cursor-pointer transition-all hover:bg-[#FFF9F4]"
              >
                <div className="w-12 h-16 rounded-lg overflow-hidden shrink-0 bg-[#F5EBE6]">
                  <ImageWithFallback src={p.image_url} alt={p.name} className="w-full h-full object-cover" />
                </div>
                <div className="flex-1 min-w-0">
                  <span className="text-[10px] font-semibold text-[#743D4A] uppercase block">
                    {p.merchant}
                  </span>
                  <p className="text-xs font-medium text-[#2D1E1F] truncate">
                    {p.name}
                  </p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-xs font-bold text-[#743D4A]">₹{p.price_inr}</span>
                    {p.original_price_inr > p.price_inr && (
                      <span className="text-[10px] text-stone-400 line-through">₹{p.original_price_inr}</span>
                    )}
                  </div>
                </div>
                <a
                  href={p.affiliate_url}
                  target="_blank"
                  rel="noopener noreferrer sponsored"
                  onClick={(e) => e.stopPropagation()}
                  className="bg-[#743D4A] hover:bg-[#5E2F3B] text-white text-[11px] font-semibold py-1.5 px-2.5 rounded-lg shrink-0 flex items-center gap-1 shadow-xs"
                >
                  <span>Shop</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
