import React, { useState, useMemo } from 'react';
import type { Product, Category } from '../types/catalog.ts';
import { CATEGORIES, MERCHANTS } from '../types/catalog.ts';
import { filterAndSortProducts } from '../utils/catalogLogic.ts';
import { ProductCard } from '../components/ProductCard.tsx';
import { 
  Search, 
  SlidersHorizontal, 
  X, 
  ArrowUpDown, 
  Sparkles, 
  RefreshCw, 
  Filter,
  Check
} from 'lucide-react';

interface ShopPageProps {
  products: Product[];
  initialCategory?: string;
  initialQuery?: string;
  onQuickView: (product: Product) => void;
  onOpenReel: (reelUrl: string) => void;
}

export const ShopPage: React.FC<ShopPageProps> = ({
  products,
  initialCategory = 'All',
  initialQuery = '',
  onQuickView,
  onOpenReel
}) => {
  const [selectedCategory, setSelectedCategory] = useState<Category>(
    (initialCategory as Category) || 'All'
  );
  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [selectedMerchant, setSelectedMerchant] = useState('All');
  const [sortBy, setSortBy] = useState<'trending' | 'price-asc' | 'price-desc' | 'discount' | 'newest'>('trending');
  const [maxPrice, setMaxPrice] = useState<number>(0);
  const [showFiltersMobile, setShowFiltersMobile] = useState(false);

  // Sync initial props if changed
  React.useEffect(() => {
    if (initialCategory) {
      setSelectedCategory(initialCategory as Category);
    }
  }, [initialCategory]);

  React.useEffect(() => {
    if (initialQuery !== undefined) {
      setSearchQuery(initialQuery);
    }
  }, [initialQuery]);

  // Filter & sort products
  const filteredProducts = useMemo(() => {
    return filterAndSortProducts(products, {
      category: selectedCategory,
      searchQuery,
      merchant: selectedMerchant,
      maxPrice: maxPrice > 0 ? maxPrice : undefined,
      sortBy,
      activeOnly: true
    });
  }, [products, selectedCategory, searchQuery, selectedMerchant, maxPrice, sortBy]);

  const activeFiltersCount = 
    (selectedCategory !== 'All' ? 1 : 0) +
    (selectedMerchant !== 'All' ? 1 : 0) +
    (maxPrice > 0 ? 1 : 0) +
    (searchQuery.trim().length > 0 ? 1 : 0);

  const clearAllFilters = () => {
    setSelectedCategory('All');
    setSearchQuery('');
    setSelectedMerchant('All');
    setMaxPrice(0);
    setSortBy('trending');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-10 space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#F0E4DC]">
        <div>
          <h1 className="font-serif text-2xl sm:text-4xl font-bold text-[#743D4A]">
            Curated Fashion Catalog
          </h1>
          <p className="text-xs sm:text-sm text-stone-600 mt-1">
            Browse verified budget fashion deals directly from Meesho, Myntra & top retailers.
          </p>
        </div>

        {/* Search Bar */}
        <div className="relative w-full sm:w-72">
          <input
            type="text"
            placeholder="Search catalog..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white border border-[#E9B8BD] focus:border-[#743D4A] rounded-xl pl-9 pr-8 py-2 text-xs text-[#2D1E1F] outline-none shadow-xs"
          />
          <Search className="w-4 h-4 text-[#743D4A] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Category Pills Slider */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
        {CATEGORIES.map((cat) => {
          const isSelected = selectedCategory === cat;
          return (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`text-xs font-semibold px-3.5 py-2 rounded-xl shrink-0 transition-all cursor-pointer ${
                isSelected
                  ? 'bg-[#743D4A] text-white shadow-xs'
                  : 'bg-white text-[#2D1E1F] border border-[#F0E4DC] hover:border-[#E9B8BD]'
              }`}
            >
              {cat}
            </button>
          );
        })}
      </div>

      {/* Filter and Sort Toolbar */}
      <div className="bg-white rounded-2xl p-3.5 sm:p-4 border border-[#F0E4DC] shadow-xs flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2 flex-wrap">
          {/* Merchant Dropdown */}
          <div className="flex items-center gap-1.5">
            <span className="text-stone-500 font-medium">Merchant:</span>
            <select
              value={selectedMerchant}
              onChange={(e) => setSelectedMerchant(e.target.value)}
              className="bg-[#FFF9F4] border border-[#E9B8BD] rounded-lg px-2.5 py-1.5 text-xs text-[#2D1E1F] font-semibold outline-none cursor-pointer"
            >
              {MERCHANTS.map((m) => (
                <option key={m} value={m}>{m}</option>
              ))}
            </select>
          </div>

          {/* Quick Price Buttons */}
          <div className="hidden sm:flex items-center gap-1.5 ml-2">
            <span className="text-stone-500 font-medium">Budget:</span>
            {[
              { label: 'All', val: 0 },
              { label: '≤ ₹299', val: 299 },
              { label: '≤ ₹499', val: 499 },
              { label: '≤ ₹999', val: 999 }
            ].map((b) => (
              <button
                key={b.val}
                onClick={() => setMaxPrice(b.val)}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-colors cursor-pointer ${
                  maxPrice === b.val
                    ? 'bg-[#E9B8BD] text-[#743D4A] border border-[#743D4A]/30'
                    : 'bg-[#FFF9F4] border border-[#F0E4DC] text-stone-600 hover:border-[#E9B8BD]'
                }`}
              >
                {b.label}
              </button>
            ))}
          </div>
        </div>

        {/* Sort & Count */}
        <div className="flex items-center gap-3 ml-auto">
          <div className="flex items-center gap-1.5">
            <ArrowUpDown className="w-3.5 h-3.5 text-[#743D4A]" />
            <select
              value={sortBy}
              onChange={(e: any) => setSortBy(e.target.value)}
              className="bg-[#FFF9F4] border border-[#E9B8BD] rounded-lg px-2.5 py-1.5 text-xs text-[#2D1E1F] font-semibold outline-none cursor-pointer"
            >
              <option value="trending">Sort: Trending Deals</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
              <option value="discount">Highest Discount %</option>
              <option value="newest">Newest Arrivals</option>
            </select>
          </div>

          <span className="text-stone-500 font-medium">
            <strong>{filteredProducts.length}</strong> items
          </span>
        </div>
      </div>

      {/* Active Filter Chips */}
      {activeFiltersCount > 0 && (
        <div className="flex items-center gap-2 flex-wrap text-xs pt-1">
          <span className="text-stone-500">Active filters:</span>
          {selectedCategory !== 'All' && (
            <span className="bg-[#FFF0F2] text-[#743D4A] border border-[#E9B8BD] px-2.5 py-1 rounded-full flex items-center gap-1 font-semibold">
              Category: {selectedCategory}
              <button onClick={() => setSelectedCategory('All')}><X className="w-3 h-3" /></button>
            </span>
          )}
          {selectedMerchant !== 'All' && (
            <span className="bg-[#FFF0F2] text-[#743D4A] border border-[#E9B8BD] px-2.5 py-1 rounded-full flex items-center gap-1 font-semibold">
              Merchant: {selectedMerchant}
              <button onClick={() => setSelectedMerchant('All')}><X className="w-3 h-3" /></button>
            </span>
          )}
          {maxPrice > 0 && (
            <span className="bg-[#FFF0F2] text-[#743D4A] border border-[#E9B8BD] px-2.5 py-1 rounded-full flex items-center gap-1 font-semibold">
              Under ₹{maxPrice}
              <button onClick={() => setMaxPrice(0)}><X className="w-3 h-3" /></button>
            </span>
          )}
          {searchQuery && (
            <span className="bg-[#FFF0F2] text-[#743D4A] border border-[#E9B8BD] px-2.5 py-1 rounded-full flex items-center gap-1 font-semibold">
              Query: "{searchQuery}"
              <button onClick={() => setSearchQuery('')}><X className="w-3 h-3" /></button>
            </span>
          )}
          <button
            onClick={clearAllFilters}
            className="text-[#743D4A] underline font-semibold hover:text-[#5E2F3B] ml-2 cursor-pointer"
          >
            Clear All
          </button>
        </div>
      )}

      {/* Products Grid */}
      {filteredProducts.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
          {filteredProducts.map((product) => (
            <ProductCard
              key={product.product_id}
              product={product}
              onQuickView={onQuickView}
              onOpenReel={onOpenReel}
            />
          ))}
        </div>
      ) : (
        /* Empty State */
        <div className="bg-white rounded-3xl p-10 text-center border border-[#F0E4DC] max-w-md mx-auto my-12 space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-[#FFF0F2] border border-[#E9B8BD] text-[#743D4A] mx-auto flex items-center justify-center">
            <Search className="w-7 h-7" />
          </div>
          <h3 className="font-serif text-xl font-bold text-[#743D4A]">
            No Matching Finds
          </h3>
          <p className="text-xs text-stone-600 leading-relaxed">
            We couldn't find any items matching your active filters or search query "{searchQuery}". Try clearing filters or searching for another keyword like "kurti" or "co-ord".
          </p>
          <button
            onClick={clearAllFilters}
            className="bg-[#743D4A] hover:bg-[#5E2F3B] text-white text-xs font-bold py-2.5 px-5 rounded-xl transition-colors cursor-pointer shadow-xs"
          >
            Reset All Filters
          </button>
        </div>
      )}
    </div>
  );
};
