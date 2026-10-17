import React from 'react';
import type { Product, Category, ReelFind, CatalogMetadata } from '../types/catalog.ts';
import { CATEGORIES } from '../types/catalog.ts';
import { ProductCard } from '../components/ProductCard.tsx';
import { ReelCard } from '../components/ReelCard.tsx';
import { ImageWithFallback } from '../components/ImageWithFallback.tsx';
import { 
  ArrowRight, 
  Sparkles, 
  ShoppingBag, 
  Film, 
  Tag, 
  TrendingUp, 
  Flame, 
  ShieldCheck, 
  Zap, 
  FileSpreadsheet, 
  Percent,
  CheckCircle2
} from 'lucide-react';

interface HomePageProps {
  products: Product[];
  reels: ReelFind[];
  metadata: CatalogMetadata;
  onNavigate: (page: string, params?: { category?: string; query?: string }) => void;
  onQuickView: (product: Product) => void;
  onOpenReel: (reelUrl: string) => void;
  onOpenSheetModal: () => void;
}

export const HomePage: React.FC<HomePageProps> = ({
  products,
  reels,
  metadata,
  onNavigate,
  onQuickView,
  onOpenReel,
  onOpenSheetModal
}) => {
  // Derive featured, trending, latest, and budget subsets
  const featuredProducts = products.filter(p => p.featured && p.active).slice(0, 8);
  const trendingProducts = [...products]
    .filter(p => p.active)
    .sort((a, b) => (b.discount_percent || 0) - (a.discount_percent || 0))
    .slice(0, 6);
  const latestArrivals = [...products]
    .filter(p => p.active)
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 8);

  const under299 = products.filter(p => p.active && p.price_inr <= 299).slice(0, 4);
  const under499 = products.filter(p => p.active && p.price_inr <= 499 && p.price_inr > 299).slice(0, 4);
  const under999 = products.filter(p => p.active && p.price_inr <= 999 && p.price_inr > 499).slice(0, 4);

  // Category quick icons & images
  const categoryHighlights = [
    { name: 'Ethnic Wear', img: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=300&q=80' },
    { name: 'Kurtis', img: 'https://images.unsplash.com/photo-1609357605129-26f69add5d6e?auto=format&fit=crop&w=300&q=80' },
    { name: 'Co-ord Sets', img: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=300&q=80' },
    { name: 'Western Wear', img: 'https://images.unsplash.com/photo-1551803091-e20673f15770?auto=format&fit=crop&w=300&q=80' },
    { name: 'Dresses', img: 'https://images.unsplash.com/photo-1496747611176-843222e1e57c?auto=format&fit=crop&w=300&q=80' },
    { name: 'Handbags', img: 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?auto=format&fit=crop&w=300&q=80' },
    { name: 'Accessories', img: 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&w=300&q=80' },
    { name: 'Under ₹299', img: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=300&q=80', isBadge: true }
  ];

  return (
    <div className="space-y-12 sm:space-y-16 pb-12">
      {/* Google Sheet Live Connection Notice Banner */}
      <div className="bg-[#FCEEF0] border-b border-[#E9B8BD]/70 py-2.5 px-4 text-xs text-[#743D4A]">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-2">
            <FileSpreadsheet className="w-4 h-4 text-[#743D4A] shrink-0" />
            <span>
              {metadata.source === 'google_sheet' ? (
                <strong className="text-emerald-800">Live Google Sheet Connected:</strong>
              ) : (
                <strong>Google Sheets Inventory Mode:</strong>
              )}{' '}
              {metadata.itemCount} items loaded. {metadata.source === 'demo' ? 'Currently displaying verified demo catalog.' : 'Spreadsheet is your single source of truth.'}
            </span>
          </div>
          <button
            onClick={onOpenSheetModal}
            className="text-[11px] font-bold underline hover:text-[#5E2F3B] cursor-pointer shrink-0"
          >
            {metadata.source === 'google_sheet' ? 'Manage Sheet Source' : 'Connect Your Google Sheet ↗'}
          </button>
        </div>
      </div>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-[#743D4A] via-[#854553] to-[#5C2B36] text-[#FFF9F4] shadow-xl">
          {/* Subtle Decorative Pattern */}
          <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#FFF9F4_1px,transparent_1px)] [background-size:16px_16px]" />

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center p-6 sm:p-10 lg:p-14 relative z-10">
            {/* Left Copy */}
            <div className="lg:col-span-7 space-y-4 sm:space-y-6">
              <div className="inline-flex items-center gap-2 bg-[#FFF9F4]/15 border border-[#FFF9F4]/30 px-3.5 py-1.5 rounded-full text-xs font-semibold text-[#E9B8BD] backdrop-blur-xs">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Curated Fashion for Indian Women</span>
              </div>

              <h1 className="font-serif text-3xl sm:text-5xl lg:text-6xl font-bold leading-tight tracking-tight">
                Style You Love.<br />
                <span className="text-[#E9B8BD] italic">Prices You'll Love More.</span>
              </h1>

              <p className="text-sm sm:text-base text-[#FFF9F4]/85 max-w-xl font-normal leading-relaxed">
                Discover viral ethnic wear, chic co-ord sets, breathable daily kurtis, and designer lookalikes handpicked from Meesho, Myntra & top merchants — all under real budget prices.
              </p>

              {/* CTAs */}
              <div className="flex flex-wrap items-center gap-3 pt-2">
                <button
                  onClick={() => onNavigate('shop')}
                  className="bg-[#FFF9F4] hover:bg-[#FCEEF0] text-[#743D4A] text-xs sm:text-sm font-bold py-3 px-6 rounded-2xl shadow-md hover:shadow-lg transition-all flex items-center gap-2 cursor-pointer active:scale-95"
                >
                  <ShoppingBag className="w-4 h-4" />
                  <span>Shop Full Catalog</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                <button
                  onClick={() => onNavigate('reels')}
                  className="bg-[#FFF9F4]/15 hover:bg-[#FFF9F4]/25 border border-[#FFF9F4]/30 text-[#FFF9F4] text-xs sm:text-sm font-semibold py-3 px-5 rounded-2xl transition-all flex items-center gap-2 cursor-pointer active:scale-95 backdrop-blur-xs"
                >
                  <Film className="w-4 h-4 text-[#E9B8BD]" />
                  <span>Shop The Reel Finds</span>
                </button>
              </div>

              {/* Trust Indicators */}
              <div className="pt-4 border-t border-[#FFF9F4]/20 grid grid-cols-3 gap-3 text-[11px] sm:text-xs text-[#FFF9F4]/80">
                <div className="flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-[#E9B8BD] shrink-0" />
                  <span>100% Verified Deals</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Percent className="w-4 h-4 text-[#E9B8BD] shrink-0" />
                  <span>Up to 75% Off</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Tag className="w-4 h-4 text-[#E9B8BD] shrink-0" />
                  <span>Under ₹999 Focus</span>
                </div>
              </div>
            </div>

            {/* Right Editorial Hero Card */}
            <div className="lg:col-span-5 relative">
              <div className="relative mx-auto max-w-sm rounded-3xl overflow-hidden shadow-2xl border-4 border-white/20 aspect-3/4">
                <ImageWithFallback
                  src="https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=900&q=80"
                  alt="Indian Ethnic Fashion"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />

                {/* Floating Price Pill */}
                <div className="absolute bottom-4 left-4 right-4 bg-white/95 backdrop-blur-md p-3.5 rounded-2xl text-[#2D1E1F] shadow-lg border border-[#F0E4DC]">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-serif font-bold text-[#743D4A] text-sm">Festive Anarkali Set</span>
                    <span className="bg-[#743D4A] text-white font-bold text-[10px] px-2 py-0.5 rounded-full">
                      70% OFF
                    </span>
                  </div>
                  <div className="flex items-center justify-between mt-1">
                    <div className="flex items-baseline gap-1.5">
                      <span className="text-sm font-bold text-[#743D4A]">₹899</span>
                      <span className="text-xs text-stone-400 line-through">₹2,999</span>
                    </div>
                    <span className="text-[11px] font-semibold text-stone-600">Meesho Find</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Quick Category Bubbles */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-serif text-xl sm:text-2xl font-bold text-[#743D4A]">
            Curated Categories
          </h2>
          <button
            onClick={() => onNavigate('shop')}
            className="text-xs font-semibold text-[#743D4A] hover:underline flex items-center gap-1 cursor-pointer"
          >
            <span>View All</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Scrollable category circles */}
        <div className="flex items-center gap-3 sm:gap-4 overflow-x-auto no-scrollbar pb-2">
          {categoryHighlights.map((cat) => (
            <button
              key={cat.name}
              onClick={() => onNavigate('shop', { category: cat.name })}
              className="flex flex-col items-center gap-2 group shrink-0 cursor-pointer"
            >
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl overflow-hidden border-2 border-[#E9B8BD]/60 group-hover:border-[#743D4A] group-hover:scale-105 transition-all shadow-xs bg-[#F5EBE6]">
                <ImageWithFallback src={cat.img} alt={cat.name} className="w-full h-full object-cover" />
              </div>
              <span className="text-[11px] sm:text-xs font-semibold text-[#2D1E1F] group-hover:text-[#743D4A] transition-colors whitespace-nowrap">
                {cat.name}
              </span>
            </button>
          ))}
        </div>
      </section>

      {/* Trending Finds Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-[#FFF0F2] border border-[#E9B8BD] flex items-center justify-center text-[#743D4A]">
              <Flame className="w-4 h-4 fill-[#743D4A]" />
            </div>
            <div>
              <h2 className="font-serif text-xl sm:text-2xl font-bold text-[#743D4A]">
                Trending Right Now
              </h2>
              <p className="text-xs text-stone-500">Highest discounts and viral community picks</p>
            </div>
          </div>
          <button
            onClick={() => onNavigate('shop')}
            className="text-xs font-semibold text-[#743D4A] hover:underline flex items-center gap-1 cursor-pointer"
          >
            <span>See More</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
          {trendingProducts.map((product) => (
            <ProductCard
              key={product.product_id}
              product={product}
              onQuickView={onQuickView}
              onOpenReel={onOpenReel}
            />
          ))}
        </div>
      </section>

      {/* Budget Collections Spotlight */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="text-center max-w-xl mx-auto mb-8">
          <span className="text-xs font-bold uppercase tracking-widest text-[#743D4A]">
            Budget Friendly Glam
          </span>
          <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#2D1E1F] mt-1">
            Shop by Price Point
          </h2>
          <p className="text-xs sm:text-sm text-stone-600 mt-1">
            Looking for college wear, wedding guest looks, or daily staples without breaking the bank?
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* Under ₹299 Card */}
          <div 
            onClick={() => onNavigate('shop', { category: 'Under ₹299' })}
            className="group relative rounded-3xl p-6 bg-gradient-to-br from-[#FFF5F6] to-[#FCEEF0] border border-[#E9B8BD] hover:shadow-lg transition-all cursor-pointer overflow-hidden flex flex-col justify-between"
          >
            <div>
              <span className="bg-[#743D4A] text-white text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider">
                Pocket Friendly
              </span>
              <h3 className="font-serif text-2xl font-bold text-[#743D4A] mt-3">
                Steals Under ₹299
              </h3>
              <p className="text-xs text-stone-600 mt-1">
                Statement earrings, viral satin scrunchies, chains & daily cotton kurtis.
              </p>
            </div>
            <div className="mt-6 flex items-center justify-between text-xs font-bold text-[#743D4A]">
              <span>Explore {under299.length}+ items</span>
              <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center shadow-xs group-hover:translate-x-1 transition-transform">
                <ArrowRight className="w-4 h-4" />
              </div>
            </div>
          </div>

          {/* Under ₹499 Card */}
          <div 
            onClick={() => onNavigate('shop', { category: 'Under ₹499' })}
            className="group relative rounded-3xl p-6 bg-gradient-to-br from-[#FAF3ED] to-[#F5EBE6] border border-[#EEDDD5] hover:shadow-lg transition-all cursor-pointer overflow-hidden flex flex-col justify-between"
          >
            <div>
              <span className="bg-[#743D4A] text-white text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider">
                Most Popular
              </span>
              <h3 className="font-serif text-2xl font-bold text-[#743D4A] mt-3">
                Wardrobe Under ₹499
              </h3>
              <p className="text-xs text-stone-600 mt-1">
                Lucknowi chikankari kurtis, structured croc bags & trendy blouses.
              </p>
            </div>
            <div className="mt-6 flex items-center justify-between text-xs font-bold text-[#743D4A]">
              <span>Explore {under499.length}+ items</span>
              <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center shadow-xs group-hover:translate-x-1 transition-transform">
                <ArrowRight className="w-4 h-4" />
              </div>
            </div>
          </div>

          {/* Under ₹999 Card */}
          <div 
            onClick={() => onNavigate('shop', { category: 'Under ₹999' })}
            className="group relative rounded-3xl p-6 bg-gradient-to-br from-[#F5EFF2] to-[#EAE0E5] border border-[#D5C2CC] hover:shadow-lg transition-all cursor-pointer overflow-hidden flex flex-col justify-between"
          >
            <div>
              <span className="bg-[#743D4A] text-white text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider">
                Festive & Party
              </span>
              <h3 className="font-serif text-2xl font-bold text-[#743D4A] mt-3">
                Designer Looks Under ₹999
              </h3>
              <p className="text-xs text-stone-600 mt-1">
                Anarkali sets, linen co-ords, floral sundresses, and Kolhapuri heels.
              </p>
            </div>
            <div className="mt-6 flex items-center justify-between text-xs font-bold text-[#743D4A]">
              <span>Explore {under999.length}+ items</span>
              <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center shadow-xs group-hover:translate-x-1 transition-transform">
                <ArrowRight className="w-4 h-4" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Products Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#743D4A]">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Editor's Selection</span>
            </div>
            <h2 className="font-serif text-xl sm:text-2xl font-bold text-[#2D1E1F] mt-0.5">
              Featured Pieces This Week
            </h2>
          </div>
          <button
            onClick={() => onNavigate('shop')}
            className="text-xs font-semibold text-[#743D4A] hover:underline flex items-center gap-1 cursor-pointer"
          >
            <span>Explore All</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
          {featuredProducts.map((product) => (
            <ProductCard
              key={product.product_id}
              product={product}
              onQuickView={onQuickView}
              onOpenReel={onOpenReel}
            />
          ))}
        </div>
      </section>

      {/* Instagram Reels "Shop The Reel" Section */}
      <section className="bg-gradient-to-b from-[#FFFDFB] to-[#FCEEF0]/60 py-12 border-y border-[#F0E4DC]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4">
            <div>
              <div className="inline-flex items-center gap-1.5 bg-[#FFF] border border-[#E9B8BD] px-3 py-1 rounded-full text-xs font-bold text-[#743D4A] mb-2 shadow-xs">
                <Film className="w-3.5 h-3.5 text-pink-600" />
                <span>As Seen on Instagram Reels</span>
              </div>
              <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#743D4A]">
                Shop The Reel
              </h2>
              <p className="text-xs sm:text-sm text-stone-600 mt-1 max-w-xl">
                See real try-on videos, styling tips, and fit reviews. Tap any reel to instantly purchase the featured items from Meesho and Myntra.
              </p>
            </div>
            <button
              onClick={() => onNavigate('reels')}
              className="bg-[#743D4A] hover:bg-[#5E2F3B] text-white text-xs font-bold px-4 py-2.5 rounded-xl flex items-center gap-1.5 self-start sm:self-auto shadow-xs cursor-pointer"
            >
              <span>View All Reels</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {reels.map((reel) => {
              const tagged = products.filter(p => reel.tagged_product_ids.includes(p.product_id));
              return (
                <ReelCard
                  key={reel.id}
                  reel={reel}
                  taggedProducts={tagged}
                  onSelectProduct={onQuickView}
                />
              );
            })}
          </div>
        </div>
      </section>

      {/* Latest Arrivals */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="font-serif text-xl sm:text-2xl font-bold text-[#743D4A]">
              Latest Added Finds
            </h2>
            <p className="text-xs text-stone-500">Fresh drops synced directly from our product sheet</p>
          </div>
          <button
            onClick={() => onNavigate('shop')}
            className="text-xs font-semibold text-[#743D4A] hover:underline flex items-center gap-1 cursor-pointer"
          >
            <span>Browse All</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
          {latestArrivals.map((product) => (
            <ProductCard
              key={product.product_id}
              product={product}
              onQuickView={onQuickView}
              onOpenReel={onOpenReel}
            />
          ))}
        </div>
      </section>

      {/* Google Sheet Direct Callout Box */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="bg-[#FFFDFB] rounded-3xl p-6 sm:p-8 border border-[#E9B8BD] shadow-sm flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
              <span className="text-xs font-bold uppercase tracking-wider text-[#743D4A]">
                Google Sheets Integration
              </span>
            </div>
            <h3 className="font-serif text-xl sm:text-2xl font-bold text-[#2D1E1F]">
              Have a Google Sheet Catalog? Connect it in 1 Click
            </h3>
            <p className="text-xs sm:text-sm text-stone-600 max-w-xl">
              PriyaFindz connects directly to your Google Spreadsheet. Add products, update affiliate links, or tweak prices without touching any code.
            </p>
          </div>
          <button
            onClick={onOpenSheetModal}
            className="bg-[#743D4A] hover:bg-[#5E2F3B] text-white text-xs sm:text-sm font-bold px-6 py-3 rounded-2xl flex items-center gap-2 shadow-md transition-all shrink-0 cursor-pointer"
          >
            <FileSpreadsheet className="w-4 h-4 text-[#E9B8BD]" />
            <span>Setup Google Sheet Catalog</span>
          </button>
        </div>
      </section>
    </div>
  );
};
