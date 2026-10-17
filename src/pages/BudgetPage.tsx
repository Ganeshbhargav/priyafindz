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
  const [selectedTier, setSelectedTier] = useState<299 | 399 | 499>(399);

  const tierProducts = products.filter((p) => {
    if (!p.isActive) return false;
    if (selectedTier === 299) return p.price <= 299;
    if (selectedTier === 399) return p.price <= 399;
    return p.price <= 499;
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
          Premium styling without a designer budget. Explore our hand-vetted collections separated by strict price ceilings with zero compromises on quality.
        </p>

        {/* Tier Tabs: Under 299, Under 399, Under 499 */}
        <div className="flex items-center justify-center gap-2 pt-2 flex-wrap">
          {[
            { tier: 299 as const, label: 'Under ₹299 Steals', desc: 'Earrings, Chains & Daily Tops' },
            { tier: 399 as const, label: 'Under ₹399 Everyday', desc: 'Kurtis, Tops & Lounge Sets' },
            { tier: 499 as const, label: 'Under ₹499 Staples', desc: 'Chikankari, Bags & Blouses' }
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
          <span>Verified deals with direct retailer checkout</span>
        </div>
      </div>

      {/* Products Grid */}
      {tierProducts.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
          {tierProducts.map((product) => (
            <ProductCard
              key={product.productId || product.product_id}
              product={product}
              onQuickView={onQuickView}
              onOpenReel={onOpenReel}
            />
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-3xl p-10 sm:p-14 border border-[#F0E4DC] text-center max-w-md mx-auto space-y-3">
          <Tag className="w-8 h-8 text-[#743D4A] mx-auto" />
          <h3 className="font-serif text-lg font-bold text-[#743D4A]">
            No Items Currently Under ₹{selectedTier}
          </h3>
          <p className="text-xs text-stone-600">
            Products priced at or below ₹{selectedTier} in your Google Sheet will be featured in this price edit.
          </p>
        </div>
      )}
    </div>
  );
};
