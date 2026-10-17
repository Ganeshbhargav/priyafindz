import React, { useEffect } from 'react';
import type { Product } from '../types/catalog.ts';
import { ImageWithFallback } from './ImageWithFallback.tsx';
import { 
  X, 
  ExternalLink, 
  ShieldCheck, 
  Sparkles, 
  Share2, 
  Check, 
  Truck, 
  RefreshCcw, 
  Instagram
} from 'lucide-react';

interface ProductDetailModalProps {
  product: Product | null;
  onClose: () => void;
  onSelectProduct: (p: Product) => void;
  relatedProducts: Product[];
}

export const ProductDetailModal: React.FC<ProductDetailModalProps> = ({
  product,
  onClose,
  onSelectProduct,
  relatedProducts
}) => {
  const [copied, setCopied] = React.useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (product) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [product, onClose]);

  if (!product) return null;

  const price = product.price ?? product.price_inr ?? 0;
  const originalPrice = product.originalPrice ?? (product.original_price_inr > price ? product.original_price_inr : undefined);
  const discount = product.discountPercent ?? product.discount_percent ?? (
    originalPrice && originalPrice > price ? Math.round(((originalPrice - price) / originalPrice) * 100) : 0
  );

  const name = product.productName || product.name || 'Fashion Item';
  const retailer = product.retailer || product.merchant || 'Retailer';
  const imageUrl = product.imageUrl || product.image_url;
  const affiliateUrl = product.affiliateUrl || product.affiliate_url || '#';
  const reelUrl = product.reelUrl || product.reel_url;
  const productId = product.productId || product.product_id;

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: name,
        text: `Look at this trendy find on PriyaFindz: ${name} for only ₹${price}!`,
        url: window.location.href
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(`${window.location.origin}/?product=${productId}`);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div 
        className="bg-[#FFF9F4] rounded-3xl max-w-3xl w-full max-h-[92vh] overflow-y-auto shadow-2xl border border-[#E9B8BD]/50 flex flex-col relative text-[#2D1E1F]"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-product-title"
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 bg-white/90 hover:bg-white text-[#2D1E1F] p-2 rounded-full shadow-md border border-[#F0E4DC] transition-all hover:scale-105 active:scale-95 cursor-pointer"
          aria-label="Close product details"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-5 sm:p-7">
          {/* Left Column: Image & Badges */}
          <div className="flex flex-col gap-3">
            <div className="relative aspect-4/5 rounded-2xl overflow-hidden bg-[#F5EBE6] border border-[#F0E4DC] shadow-xs">
              <ImageWithFallback
                src={imageUrl}
                alt={name}
                className="w-full h-full object-cover"
              />
              {discount > 0 && originalPrice && (
                <div className="absolute top-3 left-3 bg-[#743D4A] text-[#FFF9F4] text-xs font-bold px-3 py-1 rounded-full shadow-md">
                  {discount}% OFF
                </div>
              )}
            </div>

            {/* Quick value badges */}
            <div className="grid grid-cols-3 gap-2 text-center text-[11px] text-[#743D4A]/80 font-medium py-1">
              <div className="bg-white/80 rounded-xl p-2 border border-[#F0E4DC] flex flex-col items-center gap-1">
                <ShieldCheck className="w-4 h-4 text-[#743D4A]" />
                <span>Verified Deal</span>
              </div>
              <div className="bg-white/80 rounded-xl p-2 border border-[#F0E4DC] flex flex-col items-center gap-1">
                <Truck className="w-4 h-4 text-[#743D4A]" />
                <span>Fast Delivery</span>
              </div>
              <div className="bg-white/80 rounded-xl p-2 border border-[#F0E4DC] flex flex-col items-center gap-1">
                <RefreshCcw className="w-4 h-4 text-[#743D4A]" />
                <span>Official Return</span>
              </div>
            </div>
          </div>

          {/* Right Column: Information & CTAs */}
          <div className="flex flex-col justify-between">
            <div>
              {/* Category & Retailer header with close button clearance */}
              <div className="flex items-center justify-between gap-2 mb-2 pr-10">
                <span className="text-xs uppercase tracking-wider font-semibold text-[#743D4A]">
                  {product.category}
                </span>
                <span className="bg-[#E9B8BD]/40 text-[#743D4A] border border-[#E9B8BD] text-xs font-bold px-2.5 py-0.5 rounded-full shrink-0">
                  Sold on {retailer}
                </span>
              </div>

              {/* Title */}
              <h2 id="modal-product-title" className="text-xl sm:text-2xl font-serif font-bold leading-tight mb-3 text-[#2D1E1F]">
                {name}
              </h2>

              {/* Price section */}
              <div className="bg-white rounded-2xl p-4 border border-[#F0E4DC] mb-4">
                <div className="flex items-baseline gap-3">
                  <span className="text-2xl sm:text-3xl font-bold text-[#743D4A]">
                    ₹{price.toLocaleString('en-IN')}
                  </span>
                  {originalPrice && originalPrice > price && (
                    <span className="text-sm text-stone-400 line-through">
                      ₹{originalPrice.toLocaleString('en-IN')}
                    </span>
                  )}
                  {discount > 0 && originalPrice && (
                    <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-200">
                      Save ₹{(originalPrice - price).toLocaleString('en-IN')}
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-stone-500 mt-1">
                  * Prices are tracked directly from {retailer} and reflect active merchant promotions.
                </p>
              </div>

              {/* Description */}
              <div className="mb-4">
                <h4 className="text-xs font-semibold text-[#743D4A] uppercase tracking-wider mb-1.5">
                  About This Find
                </h4>
                <p className="text-sm text-[#2D1E1F]/90 leading-relaxed">
                  {product.description}
                </p>
              </div>

              {/* Priya's Styling Note */}
              <div className="bg-[#FFF0F2] rounded-xl p-3 border border-[#E9B8BD] mb-4">
                <div className="flex items-center gap-1.5 text-xs font-bold text-[#743D4A] mb-1">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Priya's Styling Tip</span>
                </div>
                <p className="text-xs text-[#2D1E1F]/80 italic">
                  Pair this with subtle golden oxidized studs and strappy nude heels for a balanced, high-end editorial look under budget!
                </p>
              </div>

              {/* Linked Reel CTA if available */}
              {reelUrl && (
                <a
                  href={reelUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mb-4 inline-flex items-center gap-2 text-xs font-semibold text-[#743D4A] bg-[#FFF] px-3 py-2 rounded-xl border border-[#E9B8BD] hover:bg-[#E9B8BD]/20 transition-colors"
                >
                  <Instagram className="w-4 h-4 text-pink-600" />
                  <span>Watch styling video on Instagram Reel ↗</span>
                </a>
              )}
            </div>

            {/* CTAs */}
            <div className="pt-2 flex flex-col gap-2.5">
              <a
                href={affiliateUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full bg-[#743D4A] hover:bg-[#5E2F3B] active:bg-[#48222B] text-[#FFF9F4] text-sm sm:text-base font-bold py-3.5 px-6 rounded-2xl flex items-center justify-center gap-2 shadow-lg hover:shadow-xl transition-all cursor-pointer text-center"
              >
                <span>Shop Now on {retailer}</span>
                <ExternalLink className="w-4 h-4" />
              </a>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleShare}
                  className="flex-1 bg-white hover:bg-[#F5EBE6] text-[#2D1E1F] text-xs font-medium py-2.5 px-3 rounded-xl border border-[#F0E4DC] flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Share2 className="w-3.5 h-3.5 text-[#743D4A]" />}
                  <span>{copied ? 'Link Copied!' : 'Share Deal'}</span>
                </button>
              </div>

              {/* Transparent Disclosure */}
              <p className="text-[10px] text-stone-500 text-center leading-normal">
                PriyaFindz earns a small affiliate commission when you complete a purchase through our verified {retailer} links, at no extra cost to you.
              </p>
            </div>
          </div>
        </div>

        {/* Related Products Section */}
        {relatedProducts.length > 0 && (
          <div className="border-t border-[#F0E4DC] p-5 sm:p-7 bg-[#FFFDFB] rounded-b-3xl">
            <h3 className="font-serif text-lg font-bold text-[#743D4A] mb-3">
              More You Might Love in {product.category}
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {relatedProducts.slice(0, 4).map((item) => (
                <div
                  key={item.productId || item.product_id}
                  onClick={() => onSelectProduct(item)}
                  className="group bg-white p-2 rounded-xl border border-[#F0E4DC] hover:border-[#E9B8BD] cursor-pointer transition-all"
                >
                  <div className="aspect-3/4 rounded-lg overflow-hidden bg-[#F5EBE6] mb-1.5">
                    <ImageWithFallback
                      src={item.imageUrl || item.image_url}
                      alt={item.productName || item.name}
                      className="group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  <h4 className="text-xs font-medium text-[#2D1E1F] truncate group-hover:text-[#743D4A]">
                    {item.productName || item.name}
                  </h4>
                  <div className="flex items-center justify-between text-[11px] mt-0.5">
                    <span className="font-bold text-[#743D4A]">₹{item.price ?? item.price_inr}</span>
                    <span className="text-stone-400 text-[10px]">{item.retailer ?? item.merchant}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
