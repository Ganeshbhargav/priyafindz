import React, { useMemo } from 'react';
import type { Product } from '../types/catalog.ts';
import { ProductCard } from '../components/ProductCard.tsx';
import { ReelCard } from '../components/ReelCard.tsx';
import { ImageWithFallback } from '../components/ImageWithFallback.tsx';
import { 
  ArrowRight, 
  Sparkles, 
  ShoppingBag, 
  Film, 
  Tag, 
  Flame, 
  ShieldCheck, 
  Percent,
  CheckCircle2,
  RefreshCw
} from 'lucide-react';

interface HomePageProps {
  products: Product[];
  isLoading?: boolean;
  onNavigate: (page: string, params?: { category?: string; query?: string }) => void;
  onQuickView: (product: Product) => void;
  onOpenReel: (reelUrl: string) => void;
}

export const HomePage: React.FC<HomePageProps> = ({
  products,
  isLoading = false,
  onNavigate,
  onQuickView,
  onOpenReel
}) => {
  // Derive active products
  const activeProducts = useMemo(() => products.filter(p => p.isActive), [products]);

  // Dynamic Categories derived directly from Google Sheets rows
  const dynamicCategories = useMemo(() => {
    const map = new Map<string, string>();
    activeProducts.forEach(p => {
      const cat = (p.category || '').trim();
      if (cat && !map.has(cat)) {
        map.set(cat, p.imageUrl || p.image_url);
      }
    });
    return Array.from(map.entries()).map(([name, img]) => ({ name, img }));
  }, [activeProducts]);

  // Featured pieces
  const featuredProducts = useMemo(() => {
    const featured = activeProducts.filter(p => p.featured);
    return featured.length > 0 ? featured.slice(0, 8) : activeProducts.slice(0, 8);
  }, [activeProducts]);

  // Trending pieces sorted by calculated discount %
  const trendingProducts = useMemo(() => {
    return [...activeProducts]
      .sort((a, b) => (b.discountPercent || b.discount_percent || 0) - (a.discountPercent || a.discount_percent || 0))
      .slice(0, 6);
  }, [activeProducts]);

  // Latest added finds
  const latestArrivals = useMemo(() => {
    return [...activeProducts]
      .sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime())
      .slice(0, 8);
  }, [activeProducts]);

  // Dynamic budget tiers based on real prices in Google Sheets
  const under299 = useMemo(() => activeProducts.filter(p => p.price <= 299), [activeProducts]);
  const under399 = useMemo(() => activeProducts.filter(p => p.price <= 399 && p.price > 299), [activeProducts]);
  const under499 = useMemo(() => activeProducts.filter(p => p.price <= 499 && p.price > 399), [activeProducts]);

  // Dynamic Reels derived directly from products with a reel URL populated
  const reelProducts = useMemo(() => {
    return activeProducts.filter(p => {
      const url = (p.reelUrl || p.reel_url || '').trim();
      return url.length > 0;
    });
  }, [activeProducts]);

  // Hero featured spotlight product
  const heroSpotlight = featuredProducts[0] || activeProducts[0];

  return (
    <div className="space-y-12 sm:space-y-16 pb-12">
      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 pt-4 sm:pt-6">
        <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-[#743D4A] via-[#854553] to-[#5C2B36] text-[#FFF9F4] shadow-xl">
          <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#FFF9F4_1px,transparent_1px)] [background-size:16px_16px]" />

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center p-6 sm:p-10 lg:p-14 relative z-10">
            {/* Left Copy */}
            <div className="lg:col-span-7 space-y-4 sm:space-y-6">
              <div className="inline-flex items-center gap-2 bg-[#FFF9F4]/15 border border-[#FFF9F4]/30 px-3.5 py-1.5 rounded-full text-xs font-semibold text-[#E9B8BD] backdrop-blur-xs">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Curated Fashion for Indian Women</span>
              </div>

              <h1 className="font-serif text-3xl sm:text-5xl lg:text-6xl font-bold leading-tight tracking-tight">
                Discover Your Style.<br />
                <span className="text-[#E9B8BD] italic">Find Your Favorites.</span>
              </h1>

              <p className="text-sm sm:text-base text-[#FFF9F4]/85 max-w-xl font-normal leading-relaxed">
                Explore handpicked ethnic wear, breathable daily kurtis, Parisian co-ord sets, and viral Instagram fashion finds from Meesho, Myntra & top retailers — with honest pricing and zero markups.
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
                  <span>Direct Retailer Checkout</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Tag className="w-4 h-4 text-[#E9B8BD] shrink-0" />
                  <span>Budget Glamour</span>
                </div>
              </div>
            </div>

            {/* Right Editorial Hero Card — Dynamically rendered from Google Sheets */}
            <div className="lg:col-span-5 relative">
              {heroSpotlight ? (
                <div 
                  onClick={() => onQuickView(heroSpotlight)}
                  className="relative mx-auto max-w-sm rounded-3xl overflow-hidden shadow-2xl border-4 border-white/20 aspect-3/4 cursor-pointer group"
                >
                  <ImageWithFallback
                    src={heroSpotlight.imageUrl || heroSpotlight.image_url}
                    alt={heroSpotlight.productName || heroSpotlight.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent pointer-events-none" />

                  {/* Floating Price Pill */}
                  <div className="absolute bottom-4 left-4 right-4 bg-white/95 backdrop-blur-md p-3.5 rounded-2xl text-[#2D1E1F] shadow-lg border border-[#F0E4DC]">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-serif font-bold text-[#743D4A] text-sm truncate mr-2">
                        {heroSpotlight.productName || heroSpotlight.name}
                      </span>
                      {(heroSpotlight.discountPercent || 0) > 0 && (
                        <span className="bg-[#743D4A] text-white font-bold text-[10px] px-2 py-0.5 rounded-full shrink-0">
                          {heroSpotlight.discountPercent}% OFF
                        </span>
                      )}
                    </div>
                    <div className="flex items-center justify-between mt-1">
                      <div className="flex items-baseline gap-1.5">
                        <span className="text-sm font-bold text-[#743D4A]">
                          ₹{heroSpotlight.price.toLocaleString('en-IN')}
                        </span>
                        {heroSpotlight.originalPrice && (
                          <span className="text-xs text-stone-400 line-through">
                            ₹{heroSpotlight.originalPrice.toLocaleString('en-IN')}
                          </span>
                        )}
                      </div>
                      <span className="text-[11px] font-semibold text-stone-600">
                        {heroSpotlight.retailer || heroSpotlight.merchant} Find
                      </span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="mx-auto max-w-sm rounded-3xl border-2 border-dashed border-[#FFF9F4]/30 p-8 text-center aspect-3/4 flex flex-col items-center justify-center space-y-3 bg-white/5">
                  <Sparkles className="w-8 h-8 text-[#E9B8BD] animate-pulse" />
                  <h3 className="font-serif text-lg font-bold text-[#FFF9F4]">Curating Fresh Looks</h3>
                  <p className="text-xs text-[#FFF9F4]/70 max-w-xs">
                    Your real-time Google Sheets fashion catalog is syncing.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Dynamic Categories derived from Google Sheets */}
      {dynamicCategories.length > 0 && (
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

          <div className="flex items-center gap-3 sm:gap-4 overflow-x-auto no-scrollbar pb-2">
            {dynamicCategories.map((cat) => (
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
      )}

      {/* Loading Skeletons */}
      {isLoading && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map(n => (
              <div key={n} className="bg-white rounded-2xl p-4 border border-[#F0E4DC] animate-pulse space-y-3">
                <div className="aspect-3/4 bg-[#F5EBE6] rounded-xl" />
                <div className="h-4 bg-stone-200 rounded-md w-3/4" />
                <div className="h-4 bg-stone-200 rounded-md w-1/2" />
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Empty State when no products exist in Google Sheet */}
      {!isLoading && activeProducts.length === 0 && (
        <section className="max-w-4xl mx-auto px-4 sm:px-6 py-12 text-center">
          <div className="bg-white rounded-3xl p-8 sm:p-12 border border-[#F0E4DC] shadow-xs space-y-4">
            <div className="w-12 h-12 rounded-full bg-[#FFF0F2] text-[#743D4A] flex items-center justify-center mx-auto">
              <ShoppingBag className="w-6 h-6" />
            </div>
            <h2 className="font-serif text-2xl font-bold text-[#743D4A]">
              Our Fresh Curation Is Being Updated
            </h2>
            <p className="text-xs sm:text-sm text-stone-600 max-w-md mx-auto leading-relaxed">
              Products managed in your Google Sheet catalog will appear here automatically. Once active products are added, this storefront will display them instantly with direct affiliate checkout.
            </p>
          </div>
        </section>
      )}

      {/* Trending Finds Section */}
      {trendingProducts.length > 0 && (
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
                key={product.productId || product.product_id}
                product={product}
                onQuickView={onQuickView}
                onOpenReel={onOpenReel}
              />
            ))}
          </div>
        </section>
      )}

      {/* Budget Collections Spotlight */}
      {activeProducts.length > 0 && (
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
                  Pocket Steals
                </span>
                <h3 className="font-serif text-2xl font-bold text-[#743D4A] mt-3">
                  Steals Under ₹299
                </h3>
                <p className="text-xs text-stone-600 mt-1">
                  Budget jewellery, accessories, and daily cotton staples.
                </p>
              </div>
              <div className="mt-6 flex items-center justify-between text-xs font-bold text-[#743D4A]">
                <span>Explore {under299.length} verified items</span>
                <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center shadow-xs group-hover:translate-x-1 transition-transform">
                  <ArrowRight className="w-4 h-4" />
                </div>
              </div>
            </div>

            {/* Under ₹399 Card */}
            <div 
              onClick={() => onNavigate('shop', { category: 'Under ₹399' })}
              className="group relative rounded-3xl p-6 bg-gradient-to-br from-[#FAF3ED] to-[#F5EBE6] border border-[#EEDDD5] hover:shadow-lg transition-all cursor-pointer overflow-hidden flex flex-col justify-between"
            >
              <div>
                <span className="bg-[#743D4A] text-white text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider">
                  Everyday Chic
                </span>
                <h3 className="font-serif text-2xl font-bold text-[#743D4A] mt-3">
                  Trending Under ₹399
                </h3>
                <p className="text-xs text-stone-600 mt-1">
                  Comfortable kurtis, printed tops, and everyday favorites.
                </p>
              </div>
              <div className="mt-6 flex items-center justify-between text-xs font-bold text-[#743D4A]">
                <span>Explore {under399.length} verified items</span>
                <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center shadow-xs group-hover:translate-x-1 transition-transform">
                  <ArrowRight className="w-4 h-4" />
                </div>
              </div>
            </div>

            {/* Under ₹499 Card */}
            <div 
              onClick={() => onNavigate('shop', { category: 'Under ₹499' })}
              className="group relative rounded-3xl p-6 bg-gradient-to-br from-[#F5EFF2] to-[#EAE0E5] border border-[#D5C2CC] hover:shadow-lg transition-all cursor-pointer overflow-hidden flex flex-col justify-between"
            >
              <div>
                <span className="bg-[#743D4A] text-white text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider">
                  Wardrobe Staples
                </span>
                <h3 className="font-serif text-2xl font-bold text-[#743D4A] mt-3">
                  Must-Haves Under ₹499
                </h3>
                <p className="text-xs text-stone-600 mt-1">
                  Chikankari work, co-ords, and structured fashion bags.
                </p>
              </div>
              <div className="mt-6 flex items-center justify-between text-xs font-bold text-[#743D4A]">
                <span>Explore {under499.length} verified items</span>
                <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center shadow-xs group-hover:translate-x-1 transition-transform">
                  <ArrowRight className="w-4 h-4" />
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Featured Products Section */}
      {featuredProducts.length > 0 && (
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
                key={product.productId || product.product_id}
                product={product}
                onQuickView={onQuickView}
                onOpenReel={onOpenReel}
              />
            ))}
          </div>
        </section>
      )}

      {/* Dynamic Instagram Reels "Shop The Reel" Section */}
      {reelProducts.length > 0 && (
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
                  Watch genuine styling videos and try-ons. Tap any reel to instantly purchase the featured piece directly from the retailer.
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
              {reelProducts.slice(0, 4).map((product) => (
                <ReelCard
                  key={product.productId || product.product_id}
                  product={product}
                  onSelectProduct={onQuickView}
                  onOpenReel={onOpenReel}
                />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Latest Arrivals */}
      {latestArrivals.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="font-serif text-xl sm:text-2xl font-bold text-[#743D4A]">
                Latest Added Finds
              </h2>
              <p className="text-xs text-stone-500">Fresh drops added regularly to our curated collection</p>
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
                key={product.productId || product.product_id}
                product={product}
                onQuickView={onQuickView}
                onOpenReel={onOpenReel}
              />
            ))}
          </div>
        </section>
      )}
    </div>
  );
};
