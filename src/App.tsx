import React, { useState, useEffect } from 'react';
import type { Product, CatalogMetadata, ReelFind } from './types/catalog.ts';
import { fetchCatalog, connectGoogleSheet, resetCatalogToDemo, fetchReels } from './services/catalogService.ts';
import { DEMO_PRODUCTS } from './data/demoCatalog.ts';
import { AffiliateDisclosureBanner } from './components/AffiliateDisclosureBanner.tsx';
import { Navbar } from './components/Navbar.tsx';
import { MobileBottomNav } from './components/MobileBottomNav.tsx';
import { Footer } from './components/Footer.tsx';
import { ProductDetailModal } from './components/ProductDetailModal.tsx';
import { GoogleSheetModal } from './components/GoogleSheetModal.tsx';

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
  const [metadata, setMetadata] = useState<CatalogMetadata>({
    source: 'demo',
    lastSyncedAt: new Date().toISOString(),
    itemCount: DEMO_PRODUCTS.length,
    status: 'demo'
  });
  const [reels] = useState<ReelFind[]>(fetchReels());
  const [isLoading, setIsLoading] = useState(true);

  // Modals
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);
  const [isSheetModalOpen, setIsSheetModalOpen] = useState(false);

  // Initial load
  useEffect(() => {
    async function loadData() {
      setIsLoading(true);
      try {
        const catalogData = await fetchCatalog();
        setProducts(catalogData.products);
        setMetadata(catalogData.metadata);
      } catch (err) {
        console.warn('Using demo data fallback:', err);
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
      const found = DEMO_PRODUCTS.find(p => p.product_id === productParam);
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

  const handleConnectSheet = async (sheetUrl: string) => {
    const res = await connectGoogleSheet(sheetUrl);
    if (res.success && res.metadata) {
      const refreshed = await fetchCatalog();
      setProducts(refreshed.products);
      setMetadata(refreshed.metadata);
    }
    return res;
  };

  const handleResetDemo = async () => {
    await resetCatalogToDemo();
    const refreshed = await fetchCatalog();
    setProducts(refreshed.products);
    setMetadata(refreshed.metadata);
  };

  // Compute related products for modal
  const relatedProducts = quickViewProduct
    ? products.filter(
        p => p.category === quickViewProduct.category && p.product_id !== quickViewProduct.product_id
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
        metadata={metadata}
        onOpenSheetModal={() => setIsSheetModalOpen(true)}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onSearchSubmit={handleSearchSubmit}
      />

      {/* Main Page Content */}
      <main className="flex-1">
        {activePage === 'home' && (
          <HomePage
            products={products}
            reels={reels}
            metadata={metadata}
            onNavigate={handleNavigate}
            onQuickView={(p) => setQuickViewProduct(p)}
            onOpenReel={handleOpenReel}
            onOpenSheetModal={() => setIsSheetModalOpen(true)}
          />
        )}

        {activePage === 'shop' && (
          <ShopPage
            products={products}
            initialCategory={selectedCategory}
            initialQuery={searchQuery}
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

      {/* Google Sheets Connection Modal */}
      <GoogleSheetModal
        isOpen={isSheetModalOpen}
        onClose={() => setIsSheetModalOpen(false)}
        metadata={metadata}
        onConnect={handleConnectSheet}
        onResetDemo={handleResetDemo}
      />

      {/* Footer */}
      <Footer
        onNavigate={handleNavigate}
        onOpenSheetModal={() => setIsSheetModalOpen(true)}
      />

      {/* Mobile Bottom Navigation */}
      <MobileBottomNav
        activePage={activePage}
        onNavigate={handleNavigate}
      />
    </div>
  );
}
