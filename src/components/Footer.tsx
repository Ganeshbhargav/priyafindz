import React from 'react';
import { 
  Instagram, 
  Send, 
  MessageCircle, 
  Heart, 
  Sparkles, 
  ShieldCheck,
  CheckCircle2
} from 'lucide-react';

interface FooterProps {
  onNavigate: (page: string, params?: { category?: string }) => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate }) => {
  return (
    <footer className="bg-[#2D1E1F] text-[#FFF9F4] pt-14 pb-20 md:pb-12 border-t border-[#743D4A]/40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          {/* Brand & Mission */}
          <div className="md:col-span-1 space-y-3">
            <div className="flex items-center gap-1.5">
              <span className="font-serif text-2xl font-bold tracking-tight text-[#E9B8BD]">
                PriyaFindz
              </span>
              <Sparkles className="w-4 h-4 text-[#E9B8BD]" />
            </div>
            <p className="text-xs text-[#FFF9F4]/80 leading-relaxed">
              Discover Your Style, Find Your Favorites. Curated trendy fashion and verified budget finds from Meesho, Myntra & top retailers for Indian women.
            </p>
            <div className="flex items-center gap-3 pt-2">
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-[#E9B8BD] hover:text-[#2D1E1F] transition-all flex items-center justify-center text-[#FFF9F4]"
                aria-label="Follow PriyaFindz on Instagram"
              >
                <Instagram className="w-4 h-4" />
              </a>
              <a
                href="https://t.me"
                target="_blank"
                rel="noopener noreferrer"
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-[#E9B8BD] hover:text-[#2D1E1F] transition-all flex items-center justify-center text-[#FFF9F4]"
                aria-label="Join PriyaFindz Telegram Deals Channel"
              >
                <Send className="w-4 h-4" />
              </a>
              <a
                href="https://whatsapp.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-[#E9B8BD] hover:text-[#2D1E1F] transition-all flex items-center justify-center text-[#FFF9F4]"
                aria-label="Join PriyaFindz WhatsApp Channel"
              >
                <MessageCircle className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Quick Categories */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#E9B8BD] mb-3">
              Shop by Category
            </h4>
            <ul className="space-y-2 text-xs text-[#FFF9F4]/75">
              {['Ethnic Wear', 'Kurtis', 'Co-ord Sets', 'Western Wear', 'Dresses', 'Handbags', 'Accessories'].map((cat) => (
                <li key={cat}>
                  <button
                    onClick={() => onNavigate('shop', { category: cat })}
                    className="hover:text-[#E9B8BD] transition-colors cursor-pointer"
                  >
                    {cat}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Budget Steals */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#E9B8BD] mb-3">
              Budget Collections
            </h4>
            <ul className="space-y-2 text-xs text-[#FFF9F4]/75">
              <li>
                <button
                  onClick={() => onNavigate('shop', { category: 'Under ₹299' })}
                  className="hover:text-[#E9B8BD] transition-colors cursor-pointer flex items-center gap-1.5"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-[#E9B8BD]" />
                  <span>Steals Under ₹299</span>
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('shop', { category: 'Under ₹399' })}
                  className="hover:text-[#E9B8BD] transition-colors cursor-pointer flex items-center gap-1.5"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-[#E9B8BD]" />
                  <span>Trending Under ₹399</span>
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('shop', { category: 'Under ₹499' })}
                  className="hover:text-[#E9B8BD] transition-colors cursor-pointer flex items-center gap-1.5"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-[#E9B8BD]" />
                  <span>Wardrobe Under ₹499</span>
                </button>
              </li>
              <li className="pt-2">
                <button
                  onClick={() => onNavigate('reels')}
                  className="hover:text-[#E9B8BD] transition-colors cursor-pointer font-semibold text-[#E9B8BD]"
                >
                  Shop The Reel (Instagram Finds) ↗
                </button>
              </li>
            </ul>
          </div>

          {/* Our Promise */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#E9B8BD]">
              The PriyaFindz Promise
            </h4>
            <ul className="space-y-2 text-xs text-[#FFF9F4]/80">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#E9B8BD] shrink-0 mt-0.5" />
                <span>Zero price markups — pay exact retailer price</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#E9B8BD] shrink-0 mt-0.5" />
                <span>Hand-tested fabric and 4+ star seller ratings</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#E9B8BD] shrink-0 mt-0.5" />
                <span>Official retailer return and refund policies apply</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Affiliate Disclosure Notice (Full Box) */}
        <div className="bg-[#382729] rounded-2xl p-4 sm:p-5 border border-[#743D4A]/50 mb-8 text-xs text-[#FFF9F4]/80 leading-relaxed">
          <div className="flex items-center gap-2 mb-1.5 text-[#E9B8BD] font-semibold">
            <ShieldCheck className="w-4 h-4" />
            <span>Full Affiliate Transparency Disclosure</span>
          </div>
          <p>
            PriyaFindz is an independent fashion curation platform and participant in affiliate marketing programs. We curate the best affordable fashion deals across verified Indian e-commerce merchants including Meesho, Myntra, Ajio, Nykaa Fashion, and Amazon India. When you click on "Shop Now" and complete a purchase on merchant websites, we may receive a small referral commission at absolutely zero additional cost to you. PriyaFindz does not hold inventory, collect payment details, or fulfill orders. All purchases, returns, and warranties are handled directly by the destination merchant.
          </p>
        </div>

        {/* Bottom Credits */}
        <div className="pt-6 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-[#FFF9F4]/60">
          <p>© {new Date().getFullYear()} PriyaFindz. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <button onClick={() => onNavigate('about')} className="hover:text-[#E9B8BD]">About</button>
            <button onClick={() => onNavigate('contact')} className="hover:text-[#E9B8BD]">Contact & Collabs</button>
            <button onClick={() => onNavigate('shop')} className="hover:text-[#E9B8BD]">All Catalog</button>
          </div>
        </div>
      </div>
    </footer>
  );
};
