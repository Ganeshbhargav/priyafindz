import React, { useState } from 'react';
import type { Product } from '../types/catalog.ts';
import { ProductCard } from '../components/ProductCard.tsx';
import { Tag, Sparkles, Percent, ShieldCheck } from 'lucide-react';

interface BudgetPageProps {
  products: Product[];
  onQuickView: (product: Product) => void;
  onOpenReel: (reelUrl: string) => void;
}

export const BudgetPage: React.FC<BudgetPageProps> = ({
  products,
  onQuickView,
  onOpenReel
}) => {
  const [selectedTier, setSelectedTier] = useState<299 | 499 | 999>(499);

  const tierProducts = products.filter((p) => {
    if (!p.active) return false;
    if (selectedTier === 299) return p.price_inr <= 299;
    if (selectedTier === 499) return p.price_inr <= 499;
    return p.price_inr <= 999;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-10 space-y-8">
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <div className="inline-flex items-center gap-1.5 bg-[#FFF0F2] border border-[#E9B8BD] px-3.5 py-1 rounded-full text-xs font-bold text-[#743D4A]">
          <Tag className="w-3.5 h-3.5" />
          <span>India's Best Affordable Fashion Deals</span>
        </div>
        <h1 className="font-serif text-3xl sm:text-4xl font-bold text-[#743D4A]">
          Budget Wardrobe Edits
        </h1>
        <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
          Premium styling doesn't require a designer budget. Explore our hand-vetted collections separated by strict price ceilings with zero compromises on aesthetic quality.
        </p>

        {/* Tier Tabs */}
        <div className="flex items-center justify-center gap-2 pt-2">
          {[
            { tier: 299 as const, label: 'Under ₹299 Steals', desc: 'Earrings, Chains & Daily Tops' },
            { tier: 499 as const, label: 'Under ₹499 Wardrobe', desc: 'Kurtis, Bags & Blouses' },
            { tier: 999 as const, label: 'Under ₹999 Festive', desc: 'Anarkalis, Co-ords & Heels' }
          ].map((t) => (
            <button
              key={t.tier}
              onClick={() => setSelectedTier(t.tier)}
              className={`py-2.5 px-4 rounded-2xl text-xs font-bold transition-all cursor-pointer ${
                selectedTier === t.tier
                  ? 'bg-[#743D4A] text-white shadow-md scale-105'
                  : 'bg-white text-[#2D1E1F] border border-[#F0E4DC] hover:border-[#E9B8BD]'
              }`}
            >
              <span>{t.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Info Highlight */}
      <div className="bg-[#FFFDFB] rounded-2xl p-4 border border-[#F0E4DC] flex items-center justify-between gap-4 text-xs">
        <span className="font-medium text-stone-600">
          Showing <strong className="text-[#743D4A]">{tierProducts.length}</strong> items strictly under ₹{selectedTier}
        </span>
        <div className="flex items-center gap-2 text-[#743D4A] font-semibold">
          <Percent className="w-3.5 h-3.5" />
          <span>All verified with destination merchant links</span>
        </div>
      </div>

      {/* Products Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
        {tierProducts.map((product) => (
          <ProductCard
            key={product.product_id}
            product={product}
            onQuickView={onQuickView}
            onOpenReel={onOpenReel}
          />
        ))}
      </div>
    </div>
  );
};
