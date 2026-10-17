import React, { useState, useEffect } from 'react';
import type { Product, ReelFind } from './types/catalog.ts';
import { fetchCatalog, fetchReels } from './services/catalogService.ts';
import { DEMO_PRODUCTS } from './data/demoCatalog.ts';
import { AffiliateDisclosureBanner } from './components/AffiliateDisclosureBanner.tsx';
import { Navbar } from './components/Navbar.tsx';
import { MobileBottomNav } from './components/MobileBottomNav.tsx';
import { Footer } from './components/Footer.tsx';
import { ProductDetailModal } from './components/ProductDetailModal.tsx';

// Pages
import { HomePage } from './pages/HomePage.tsx';
import { ShopPage } from './pages/ShopPage.tsx';
import { ReelsPage } from './pages/ReelsPage.tsx';
import { BudgetPage } from './pages/BudgetPage.tsx';
import { AboutPage } from './pages/AboutPage.tsx';
import { ContactPage } from './pages/ContactPage.tsx';

export default function App() {
  const [activePage, setActivePage] = useState<string>('home');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  
  // Catalog State
  const [products, setProducts] = useState<Product[]>(DEMO_PRODUCTS);
  const [isDemo, setIsDemo] = useState<boolean>(true);
  const [reels] = useState<ReelFind[]>(fetchReels());
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Product Detail Modal
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);

  // Initial load
  useEffect(() => {
    async function loadData() {
      setIsLoading(true);
      try {
        const catalogData = await fetchCatalog();
        setProducts(catalogData.products);
        setIsDemo(catalogData.isDemo);
      } catch (err) {
        console.warn('[Catalog App] Using fallback demo data:', err);
      } finally {
        setIsLoading(false);
      }
    }
    loadData();

    // Check query params for deep linking (e.g. ?product=PF-101 or ?page=shop)
    const urlParams = new URLSearchParams(window.location.search);
    const pageParam = urlParams.get('page');
    const productParam = urlParams.get('product');
    const categoryParam = urlParams.get('category');

    if (pageParam && ['home', 'shop', 'reels', 'budget', 'about', 'contact'].includes(pageParam)) {
      setActivePage(pageParam);
    }
    if (categoryParam) {
      setSelectedCategory(categoryParam);
    }
    if (productParam) {
      const found = DEMO_PRODUCTS.find(p => (p.productId === productParam || p.product_id === productParam));
      if (found) {
        setQuickViewProduct(found);
      }
    }
  }, []);

  // Navigation handler
  const handleNavigate = (page: string, params?: { category?: string; query?: string }) => {
    setActivePage(page);
    if (params?.category) {
      setSelectedCategory(params.category);
    }
    if (params?.query !== undefined) {
      setSearchQuery(params.query);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });

    // Update URL query state cleanly without full reload
    const url = new URL(window.location.href);
    url.searchParams.set('page', page);
    if (params?.category) {
      url.searchParams.set('category', params.category);
    } else {
      url.searchParams.delete('category');
    }
    window.history.replaceState({}, '', url.toString());
  };

  const handleSearchSubmit = () => {
    handleNavigate('shop', { query: searchQuery });
  };

  const handleOpenReel = (reelUrl: string) => {
    if (reelUrl) {
      window.open(reelUrl, '_blank', 'noopener,noreferrer');
    } else {
      handleNavigate('reels');
    }
  };

  // Compute related products for modal
  const relatedProducts = quickViewProduct
    ? products.filter(
        p => p.category === quickViewProduct.category && 
             (p.productId || p.product_id) !== (quickViewProduct.productId || quickViewProduct.product_id)
      )
    : [];

  return (
    <div className="min-h-screen flex flex-col bg-[#FFF9F4] text-[#2D1E1F] selection:bg-[#E9B8BD] selection:text-[#743D4A]">
      {/* Top Affiliate Disclosure Bar */}
      <AffiliateDisclosureBanner />

      {/* Main Navigation Bar */}
      <Navbar
        activePage={activePage}
        onNavigate={handleNavigate}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onSearchSubmit={handleSearchSubmit}
        isDemo={isDemo}
      />

      {/* Main Page Content */}
      <main className="flex-1">
        {activePage === 'home' && (
          <HomePage
            products={products}
            reels={reels}
            isDemo={isDemo}
            onNavigate={handleNavigate}
            onQuickView={(p) => setQuickViewProduct(p)}
            onOpenReel={handleOpenReel}
          />
        )}

        {activePage === 'shop' && (
          <ShopPage
            products={products}
            initialCategory={selectedCategory}
            initialQuery={searchQuery}
            isLoading={isLoading}
            onQuickView={(p) => setQuickViewProduct(p)}
            onOpenReel={handleOpenReel}
          />
        )}

        {activePage === 'reels' && (
          <ReelsPage
            reels={reels}
            products={products}
            onSelectProduct={(p) => setQuickViewProduct(p)}
          />
        )}

        {activePage === 'budget' && (
          <BudgetPage
            products={products}
            onQuickView={(p) => setQuickViewProduct(p)}
            onOpenReel={handleOpenReel}
          />
        )}

        {activePage === 'about' && (
          <AboutPage onNavigate={handleNavigate} />
        )}

        {activePage === 'contact' && (
          <ContactPage />
        )}
      </main>

      {/* Product Detail Modal */}
      <ProductDetailModal
        product={quickViewProduct}
        onClose={() => setQuickViewProduct(null)}
        onSelectProduct={(p) => setQuickViewProduct(p)}
        relatedProducts={relatedProducts}
      />

      {/* Footer */}
      <Footer onNavigate={handleNavigate} />

      {/* Mobile Bottom Navigation */}
      <MobileBottomNav
        activePage={activePage}
        onNavigate={handleNavigate}
      />
    </div>
  );
}
