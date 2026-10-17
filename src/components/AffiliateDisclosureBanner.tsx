import React, { useState } from 'react';
import { Sparkles, Info, X } from 'lucide-react';

export const AffiliateDisclosureBanner: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="bg-[#743D4A] text-[#FFF9F4] text-xs py-1.5 px-3 transition-colors">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5 overflow-hidden">
          <Sparkles className="w-3.5 h-3.5 text-[#E9B8BD] shrink-0 animate-pulse" />
          <p className="truncate font-medium">
            <span className="font-semibold text-[#E9B8BD]">Affiliate Disclosure:</span> Handpicked deals from Meesho & Myntra. We may earn a small commission at no extra cost to you.
          </p>
        </div>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="underline text-[#E9B8BD] hover:text-white shrink-0 text-[11px] font-medium transition-colors cursor-pointer"
        >
          {isOpen ? 'Close' : 'Details'}
        </button>
      </div>

      {isOpen && (
        <div className="max-w-7xl mx-auto mt-2 pt-2 border-t border-[#8A4B59] text-[11px] text-[#FFF9F4]/90 flex items-start gap-2">
          <Info className="w-3.5 h-3.5 text-[#E9B8BD] shrink-0 mt-0.5" />
          <p className="leading-relaxed">
            PriyaFindz operates as a curated editorial affiliate showcase. We do not process payments, ship orders, or mark up prices. Clicking "Shop Now" redirects you directly to the verified merchant (e.g. Meesho, Myntra, Amazon, Ajio) where all checkout and customer protections apply.
          </p>
        </div>
      )}
    </div>
  );
};
