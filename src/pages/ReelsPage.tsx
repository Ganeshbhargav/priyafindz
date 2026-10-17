import React from 'react';
import type { ReelFind, Product } from '../types/catalog.ts';
import { ReelCard } from '../components/ReelCard.tsx';
import { Film, Instagram, Sparkles, ExternalLink, ShieldCheck } from 'lucide-react';

interface ReelsPageProps {
  reels: ReelFind[];
  products: Product[];
  onSelectProduct: (p: Product) => void;
}

export const ReelsPage: React.FC<ReelsPageProps> = ({
  reels,
  products,
  onSelectProduct
}) => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-10 space-y-8">
      {/* Header Banner */}
      <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-[#2D1E1F] via-[#48222B] to-[#743D4A] text-white p-6 sm:p-10 shadow-lg">
        <div className="max-w-2xl space-y-3 relative z-10">
          <div className="inline-flex items-center gap-1.5 bg-[#FFF]/15 border border-[#FFF]/30 px-3 py-1 rounded-full text-xs font-bold text-[#E9B8BD]">
            <Instagram className="w-3.5 h-3.5 text-[#E9B8BD]" />
            <span>@priya_findz Official Reels</span>
          </div>
          <h1 className="font-serif text-3xl sm:text-4xl font-bold leading-tight">
            Shop The Reel
          </h1>
          <p className="text-xs sm:text-sm text-white/85 leading-relaxed">
            Love the outfit you saw on Instagram? Don't hunt through hundreds of links in bio. Every look from our trending try-ons, Meesho hauls, and styling videos is indexed here with direct merchant links.
          </p>
          <div className="pt-2 flex items-center gap-4 text-xs font-medium text-[#E9B8BD]">
            <span>✓ Verified product codes</span>
            <span>✓ Lowest tracked prices</span>
            <span>✓ Direct checkout</span>
          </div>
        </div>
      </div>

      {/* Reels Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
        {reels.map((reel) => {
          const tagged = products.filter(p => reel.tagged_product_ids.includes(p.product_id));
          return (
            <ReelCard
              key={reel.id}
              reel={reel}
              taggedProducts={tagged}
              onSelectProduct={onSelectProduct}
            />
          );
        })}
      </div>

      {/* Community Callout */}
      <div className="bg-[#FFFDFB] rounded-3xl p-6 sm:p-8 border border-[#E9B8BD] text-center max-w-xl mx-auto space-y-3">
        <Sparkles className="w-6 h-6 text-[#743D4A] mx-auto" />
        <h3 className="font-serif text-xl font-bold text-[#743D4A]">
          Want Your Look Styled or Featured?
        </h3>
        <p className="text-xs text-stone-600 leading-relaxed">
          Tag @priya_findz on Instagram or DM us your favorite budget Meesho/Myntra codes to be featured in our upcoming curated haul!
        </p>
        <a
          href="https://instagram.com"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 bg-[#743D4A] hover:bg-[#5E2F3B] text-white text-xs font-bold py-2.5 px-5 rounded-xl shadow-xs transition-colors"
        >
          <Instagram className="w-4 h-4" />
          <span>Follow @priya_findz on Instagram</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </a>
      </div>
    </div>
  );
};
