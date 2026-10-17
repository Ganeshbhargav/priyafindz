import React, { useState, useMemo } from 'react';
import type { Product } from '../types/catalog.ts';
import { filterAndSortProducts } from '../utils/catalogLogic.ts';
import { ProductCard } from '../components/ProductCard.tsx';
import { 
  Search, 
  X, 
  ArrowUpDown, 
  Sparkles, 
  ShoppingBag,
  Filter
} from 'lucide-react';

interface ShopPageProps {
  products: Product[];
  initialCategory?: string;
  initialQuery?: string;
  isLoading?: boolean;
  onQuickView: (product: Product) => void;
  onOpenReel: (reelUrl: string) => void;
}

export const ShopPage: React.FC<ShopPageProps> = ({
  products,
  initialCategory = 'All',
  initialQuery = '',
  isLoading = false,
  onQuickView,
  onOpenReel
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>(
    initialCategory || 'All'
  );
  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [selectedRetailer, setSelectedRetailer] = useState('All');
  const [sortBy, setSortBy] = useState<'trending' | 'price-asc' | 'price-desc' | 'discount' | 'newest'>('trending');
  const [maxPrice, setMaxPrice] = useState<number>(0);

  // Sync initial props
  React.useEffect(() => {
    if (initialCategory) {
      setSelectedCategory(initialCategory);
    }
  }, [initialCategory]);

  React.useEffect(() => {
    if (initialQuery !== undefined) {
      setSearchQuery(initialQuery);
    }
  }, [initialQuery]);

  // Dynamically derive categories from active products
  const dynamicCategories = useMemo(() => {
    const set = new Set<string>();
    products.forEach(p => {
      if (p.isActive && p.category?.trim()) {
        set.add(p.category.trim());
      }
    });
    return ['All', ...Array.from(set)];
  }, [products]);

  // Dynamically derive retailers from active products
  const dynamicRetailers = useMemo(() => {
    const set = new Set<string>();
    products.forEach(p => {
      const r = (p.retailer || p.merchant || '').trim();
      if (p.isActive && r) {
        set.add(r);
      }
    });
    return ['All', ...Array.from(set)];
  }, [products]);

  // Filter & sort products
  const filteredProducts = useMemo(() => {
    return filterAndSortProducts(products, {
      category: selectedCategory,
      searchQuery,
      retailer: selectedRetailer,
      maxPrice: maxPrice > 0 ? maxPrice : undefined,
      sortBy,
      activeOnly: true
    });
  }, [products, selectedCategory, searchQuery, selectedRetailer, maxPrice, sortBy]);

  const activeFiltersCount = 
    (selectedCategory !== 'All' ? 1 : 0) +
    (selectedRetailer !== 'All' ? 1 : 0) +
    (maxPrice > 0 ? 1 : 0) +
    (searchQuery.trim().length > 0 ? 1 : 0);

  const clearAllFilters = () => {
    setSelectedCategory('All');
    setSearchQuery('');
    setSelectedRetailer('All');
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
            placeholder="Search catalog by name, category..."
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

      {/* Dynamic Category Pills Slider */}
      {dynamicCategories.length > 1 && (
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
          {dynamicCategories.map((cat) => {
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
      )}

      {/* Filter and Sort Toolbar */}
      <div className="bg-white rounded-2xl p-3.5 sm:p-4 border border-[#F0E4DC] shadow-xs flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2 flex-wrap">
          {/* Retailer Dropdown derived dynamically */}
          {dynamicRetailers.length > 1 && (
            <div className="flex items-center gap-1.5">
              <span className="text-stone-500 font-medium">Retailer:</span>
              <select
                value={selectedRetailer}
                onChange={(e) => setSelectedRetailer(e.target.value)}
                className="bg-[#FFF9F4] border border-[#E9B8BD] rounded-lg px-2.5 py-1.5 text-xs text-[#2D1E1F] font-semibold outline-none cursor-pointer"
              >
                {dynamicRetailers.map((m) => (
                  <option key={m} value={m}>{m}</option>
                ))}
              </select>
            </div>
          )}

          {/* Quick Price Buttons */}
          <div className="hidden sm:flex items-center gap-1.5 ml-2">
            <span className="text-stone-500 font-medium">Budget:</span>
            {[
              { label: 'All', val: 0 },
              { label: '≤ ₹299', val: 299 },
              { label: '≤ ₹399', val: 399 },
              { label: '≤ ₹499', val: 499 }
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
            <span className="bg-[#E9B8BD]/30 border border-[#E9B8BD] text-[#743D4A] px-2.5 py-1 rounded-lg flex items-center gap-1">
              Category: {selectedCategory}
              <button onClick={() => setSelectedCategory('All')} className="hover:text-black">
                <X className="w-3 h-3" />
              </button>
            </span>
          )}
          {selectedRetailer !== 'All' && (
            <span className="bg-[#E9B8BD]/30 border border-[#E9B8BD] text-[#743D4A] px-2.5 py-1 rounded-lg flex items-center gap-1">
              Retailer: {selectedRetailer}
              <button onClick={() => setSelectedRetailer('All')} className="hover:text-black">
                <X className="w-3 h-3" />
              </button>
            </span>
          )}
          {maxPrice > 0 && (
            <span className="bg-[#E9B8BD]/30 border border-[#E9B8BD] text-[#743D4A] px-2.5 py-1 rounded-lg flex items-center gap-1">
              Max: ₹{maxPrice}
              <button onClick={() => setMaxPrice(0)} className="hover:text-black">
                <X className="w-3 h-3" />
              </button>
            </span>
          )}
          {searchQuery && (
            <span className="bg-[#E9B8BD]/30 border border-[#E9B8BD] text-[#743D4A] px-2.5 py-1 rounded-lg flex items-center gap-1">
              "{searchQuery}"
              <button onClick={() => setSearchQuery('')} className="hover:text-black">
                <X className="w-3 h-3" />
              </button>
            </span>
          )}
          <button
            onClick={clearAllFilters}
            className="text-[#743D4A] hover:underline font-semibold ml-1 cursor-pointer"
          >
            Clear all
          </button>
        </div>
      )}

      {/* Loading Skeletons */}
      {isLoading && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6 pt-4">
          {[1, 2, 3, 4, 5, 6, 7, 8].map(n => (
            <div key={n} className="bg-white rounded-2xl p-4 border border-[#F0E4DC] animate-pulse space-y-3">
              <div className="aspect-3/4 bg-[#F5EBE6] rounded-xl" />
              <div className="h-4 bg-stone-200 rounded-md w-3/4" />
              <div className="h-4 bg-stone-200 rounded-md w-1/2" />
              <div className="h-8 bg-stone-200 rounded-xl w-full" />
            </div>
          ))}
        </div>
      )}

      {/* Product Grid */}
      {!isLoading && filteredProducts.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6 pt-2">
          {filteredProducts.map((product) => (
            <ProductCard
              key={product.productId || product.product_id}
              product={product}
              onQuickView={onQuickView}
              onOpenReel={onOpenReel}
            />
          ))}
        </div>
      )}

      {/* Empty State */}
      {!isLoading && filteredProducts.length === 0 && (
        <div className="bg-white rounded-3xl p-10 sm:p-14 border border-[#F0E4DC] text-center max-w-md mx-auto space-y-4 my-8">
          <div className="w-14 h-14 rounded-full bg-[#FFF0F2] text-[#743D4A] flex items-center justify-center mx-auto">
            <ShoppingBag className="w-6 h-6" />
          </div>
          <h3 className="font-serif text-xl font-bold text-[#743D4A]">
            No Products Found
          </h3>
          <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
            {activeFiltersCount > 0
              ? 'No items matched your current filter criteria. Try resetting your search or price filters.'
              : 'Our product catalog is managed directly via Google Sheets. Items added to the spreadsheet will appear here instantly.'}
          </p>
          {activeFiltersCount > 0 && (
            <button
              onClick={clearAllFilters}
              className="bg-[#743D4A] hover:bg-[#5E2F3B] text-white text-xs font-bold py-2.5 px-5 rounded-xl shadow-xs transition-colors cursor-pointer"
            >
              Reset All Filters
            </button>
          )}
        </div>
      )}
    </div>
  );
};
