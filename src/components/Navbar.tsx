import React, { useState } from 'react';
import type { CatalogMetadata } from '../types/catalog.ts';
import { 
  Search, 
  Menu, 
  X, 
  FileSpreadsheet, 
  Sparkles, 
  Heart, 
  ShoppingBag, 
  Film, 
  Tag, 
  Info, 
  Mail, 
  CheckCircle2, 
  Database 
} from 'lucide-react';

interface NavbarProps {
  activePage: string;
  onNavigate: (page: string, params?: { category?: string; query?: string }) => void;
  metadata: CatalogMetadata;
  onOpenSheetModal: () => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  onSearchSubmit: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activePage,
  onNavigate,
  metadata,
  onOpenSheetModal,
  searchQuery,
  onSearchChange,
  onSearchSubmit
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showSearchMobile, setShowSearchMobile] = useState(false);

  const handleNav = (page: string) => {
    onNavigate(page);
    setMobileMenuOpen(false);
  };

  const navLinks = [
    { id: 'home', label: 'Home' },
    { id: 'shop', label: 'Shop Catalog' },
    { id: 'reels', label: 'Shop The Reel' },
    { id: 'budget', label: 'Budget Deals' },
    { id: 'about', label: 'About Priya' },
    { id: 'contact', label: 'Contact' }
  ];

  return (
    <header className="sticky top-0 z-40 bg-[#FFF9F4]/95 backdrop-blur-md border-b border-[#F0E4DC] transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16 sm:h-20 gap-3 sm:gap-6">
          {/* Brand Logo & Tagline */}
          <div 
            onClick={() => handleNav('home')}
            className="flex flex-col cursor-pointer shrink-0"
          >
            <div className="flex items-center gap-1.5">
              <span className="font-serif text-2xl sm:text-3xl font-bold tracking-tight text-[#743D4A]">
                PriyaFindz
              </span>
              <span className="inline-block w-2 h-2 rounded-full bg-[#E9B8BD] -mt-2 animate-pulse" />
            </div>
            <span className="text-[10px] sm:text-[11px] font-medium tracking-wide text-[#2D1E1F]/70 hidden xs:inline">
              Style You Love. Prices You'll Love More.
            </span>
          </div>

          {/* Desktop Search Bar */}
          <div className="hidden md:flex flex-1 max-w-md mx-2">
            <form 
              onSubmit={(e) => {
                e.preventDefault();
                onSearchSubmit();
              }}
              className="relative w-full"
            >
              <input
                type="text"
                placeholder="Search kurtis, co-ords, lehengas, under ₹499..."
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                className="w-full bg-white border border-[#E9B8BD]/70 focus:border-[#743D4A] focus:ring-1 focus:ring-[#743D4A] rounded-full pl-10 pr-4 py-2 text-xs text-[#2D1E1F] placeholder-stone-400 transition-all outline-none shadow-xs"
              />
              <Search className="w-4 h-4 text-[#743D4A] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => onSearchChange('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </form>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-6">
            {navLinks.map((link) => (
              <button
                key={link.id}
                onClick={() => handleNav(link.id)}
                className={`text-xs font-semibold tracking-wide transition-colors cursor-pointer py-1 relative ${
                  activePage === link.id
                    ? 'text-[#743D4A]'
                    : 'text-[#2D1E1F]/75 hover:text-[#743D4A]'
                }`}
              >
                {link.label}
                {activePage === link.id && (
                  <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#743D4A] rounded-full" />
                )}
              </button>
            ))}
          </nav>

          {/* Right Action Icons: Google Sheet Trigger & Mobile Search Toggle */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Google Sheets Status Pill / Trigger */}
            <button
              onClick={onOpenSheetModal}
              className={`text-[11px] font-semibold px-2.5 sm:px-3 py-1.5 rounded-full border transition-all flex items-center gap-1.5 shadow-xs cursor-pointer ${
                metadata.source === 'google_sheet'
                  ? 'bg-emerald-50 text-emerald-800 border-emerald-300 hover:bg-emerald-100'
                  : 'bg-white text-[#743D4A] border-[#E9B8BD] hover:bg-[#F5EBE6]'
              }`}
              title="Configure Google Sheet Catalog"
              aria-label="Google Sheets Catalog Settings"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-[#743D4A] shrink-0" />
              <span className="hidden sm:inline">
                {metadata.source === 'google_sheet' ? 'Google Sheet Active' : 'Demo Catalog'}
              </span>
              <span className="sm:hidden">
                {metadata.source === 'google_sheet' ? 'Live' : 'Demo'}
              </span>
            </button>

            {/* Mobile Search Button */}
            <button
              onClick={() => setShowSearchMobile(!showSearchMobile)}
              className="md:hidden p-2 rounded-xl text-[#743D4A] hover:bg-[#F5EBE6] transition-colors"
              aria-label="Toggle search"
            >
              <Search className="w-5 h-5" />
            </button>

            {/* Mobile Menu Hamburger */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-xl text-[#743D4A] hover:bg-[#F5EBE6] transition-colors"
              aria-label="Open navigation menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Search Dropdown Bar */}
        {showSearchMobile && (
          <div className="md:hidden pb-3 pt-1 animate-in slide-in-from-top-1 duration-150">
            <form 
              onSubmit={(e) => {
                e.preventDefault();
                onSearchSubmit();
                setShowSearchMobile(false);
              }}
              className="relative w-full"
            >
              <input
                type="text"
                autoFocus
                placeholder="Search kurtis, dresses, under ₹499..."
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                className="w-full bg-white border border-[#E9B8BD] rounded-xl pl-10 pr-4 py-2.5 text-xs text-[#2D1E1F] outline-none shadow-xs"
              />
              <Search className="w-4 h-4 text-[#743D4A] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => onSearchChange('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </form>
          </div>
        )}
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-[#F0E4DC] bg-[#FFF9F4] px-4 py-4 space-y-2 shadow-lg animate-in slide-in-from-top duration-200">
          {navLinks.map((link) => (
            <button
              key={link.id}
              onClick={() => handleNav(link.id)}
              className={`w-full text-left py-2.5 px-3 rounded-xl text-sm font-semibold transition-colors flex items-center justify-between ${
                activePage === link.id
                  ? 'bg-[#743D4A] text-[#FFF9F4]'
                  : 'text-[#2D1E1F] hover:bg-[#F5EBE6]'
              }`}
            >
              <span>{link.label}</span>
              {activePage === link.id && <Sparkles className="w-4 h-4 text-[#E9B8BD]" />}
            </button>
          ))}

          {/* Quick Google Sheet Connect link in mobile drawer */}
          <div className="pt-2 border-t border-[#F0E4DC]">
            <button
              onClick={() => {
                onOpenSheetModal();
                setMobileMenuOpen(false);
              }}
              className="w-full py-2.5 px-3 rounded-xl text-xs font-semibold text-[#743D4A] bg-[#FFF0F2] border border-[#E9B8BD] flex items-center justify-between"
            >
              <span className="flex items-center gap-2">
                <FileSpreadsheet className="w-4 h-4" />
                <span>Configure Google Sheets Source</span>
              </span>
              <span className="text-[10px] bg-white px-2 py-0.5 rounded-full font-bold">
                {metadata.source === 'google_sheet' ? 'Live' : 'Demo'}
              </span>
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
