import React from 'react';
import { Sparkles, Heart, ShieldCheck, CheckCircle2, ShoppingBag, Eye, Percent, ArrowRight } from 'lucide-react';
import { ImageWithFallback } from '../components/ImageWithFallback.tsx';

interface AboutPageProps {
  onNavigate: (page: string) => void;
}

export const AboutPage: React.FC<AboutPageProps> = ({ onNavigate }) => {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 sm:py-14 space-y-12">
      {/* Editorial Intro Hero */}
      <div className="text-center space-y-3 max-w-2xl mx-auto">
        <span className="text-xs font-bold uppercase tracking-widest text-[#743D4A]">
          Behind PriyaFindz
        </span>
        <h1 className="font-serif text-3xl sm:text-5xl font-bold text-[#743D4A]">
          Style You Love.<br />
          <span className="italic font-normal text-[#2D1E1F]">Prices You'll Love More.</span>
        </h1>
        <p className="text-sm text-stone-600 leading-relaxed pt-2">
          PriyaFindz was born out of a simple, rebellious fashion belief: Indian women shouldn't have to spend a month's savings to look breathtaking.
        </p>
      </div>

      {/* Story & Image Section */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center bg-white rounded-3xl p-6 sm:p-10 border border-[#F0E4DC] shadow-sm">
        <div className="md:col-span-5 aspect-4/5 rounded-2xl overflow-hidden shadow-md">
          <ImageWithFallback
            src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=800&q=80"
            alt="Priya - Founder & Fashion Curator"
            className="w-full h-full object-cover"
          />
        </div>
        <div className="md:col-span-7 space-y-4 text-xs sm:text-sm text-[#2D1E1F]/90 leading-relaxed">
          <h2 className="font-serif text-2xl font-bold text-[#743D4A]">
            Hi, I'm Priya! 👋
          </h2>
          <p>
            Like millions of college students and working women across India, I spent hours scrolling through Meesho, Myntra, and Ajio looking for chic, high-quality outfits. But finding genuine hidden gems amongst thousands of catalog listings felt impossible.
          </p>
          <p>
            Too often, friends would ask: <em>"Where did you get that Kurti for ₹499? It looks like a designer piece from FabIndia or Nykaa Luxe!"</em>
          </p>
          <p>
            In 2024, I started documenting my verified hauls on Instagram Reels (@priya_findz). Within months, hundreds of thousands of Indian women joined our community to swap styling hacks, test merchant fabrics, and save lakhs of rupees on wardrobe upgrades.
          </p>
          <p className="font-medium text-[#743D4A]">
            PriyaFindz is the permanent digital home of those curations: a clean, aesthetic catalogue with direct affiliate links to Meesho, Myntra, and trusted merchants.
          </p>
        </div>
      </div>

      {/* The 3 Core Pillars */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-[#FFFDFB] rounded-3xl p-6 border border-[#F0E4DC] space-y-3">
          <div className="w-10 h-10 rounded-2xl bg-[#FFF0F2] border border-[#E9B8BD] flex items-center justify-center text-[#743D4A]">
            <Eye className="w-5 h-5" />
          </div>
          <h3 className="font-serif text-lg font-bold text-[#743D4A]">
            1. Zero Markups, 100% Free
          </h3>
          <p className="text-xs text-stone-600 leading-relaxed">
            We never inflate merchant prices or charge subscriptions. Clicking "Shop Now" takes you straight to the merchant's official app or site.
          </p>
        </div>

        <div className="bg-[#FFFDFB] rounded-3xl p-6 border border-[#F0E4DC] space-y-3">
          <div className="w-10 h-10 rounded-2xl bg-[#FFF0F2] border border-[#E9B8BD] flex items-center justify-center text-[#743D4A]">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <h3 className="font-serif text-lg font-bold text-[#743D4A]">
            2. Verified Value & Fabric
          </h3>
          <p className="text-xs text-stone-600 leading-relaxed">
            Every product featured has passed visual fabric checks, seller rating audits (4.0+ stars minimum), and return policy verifications.
          </p>
        </div>

        <div className="bg-[#FFFDFB] rounded-3xl p-6 border border-[#F0E4DC] space-y-3">
          <div className="w-10 h-10 rounded-2xl bg-[#FFF0F2] border border-[#E9B8BD] flex items-center justify-center text-[#743D4A]">
            <Percent className="w-5 h-5" />
          </div>
          <h3 className="font-serif text-lg font-bold text-[#743D4A]">
            3. Pure Transparency
          </h3>
          <p className="text-xs text-stone-600 leading-relaxed">
            We clearly label affiliate partnerships. When you purchase through our links, we earn a tiny commission from the retailer to support our curation team.
          </p>
        </div>
      </div>

      {/* Explore Storefront CTA */}
      <div className="text-center pt-4">
        <button
          onClick={() => onNavigate('shop')}
          className="bg-[#743D4A] hover:bg-[#5E2F3B] text-white text-xs sm:text-sm font-bold py-3 px-8 rounded-2xl shadow-md transition-all inline-flex items-center gap-2 cursor-pointer"
        >
          <span>Explore Priya's Current Finds</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
