import React, { useState, useEffect } from 'react';
import { ShoppingBag, ImageOff, Loader2 } from 'lucide-react';

interface ImageWithFallbackProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  categoryName?: string;
  fallbackText?: string;
}

export const ImageWithFallback: React.FC<ImageWithFallbackProps> = ({
  src,
  alt,
  className = '',
  categoryName,
  fallbackText,
  ...props
}) => {
  const [hasError, setHasError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const cleanSrc = typeof src === 'string' ? src.trim() : '';
  const isBlank = !cleanSrc;

  // Reset loading and error states whenever src changes (e.g., catalog refresh or pagination)
  useEffect(() => {
    setHasError(false);
    setIsLoading(Boolean(cleanSrc));
  }, [cleanSrc]);

  // If blank or failed to load, render the neutral branded PriyaFindz placeholder
  if (isBlank || hasError) {
    return (
      <div 
        className={`w-full h-full min-h-[140px] relative overflow-hidden bg-gradient-to-br from-[#FFF9F4] via-[#F8EFE9] to-[#F3E5DD] flex flex-col items-center justify-center p-6 select-none ${className}`}
        role="img"
        aria-label={alt || 'PriyaFindz Product Image Placeholder'}
      >
        {/* Subtle decorative concentric rings */}
        <div className="absolute inset-0 opacity-15 pointer-events-none flex items-center justify-center">
          <svg className="w-full h-full max-w-[200px] max-h-[200px]" viewBox="0 0 100 100" fill="none">
            <circle cx="50" cy="50" r="44" stroke="#743D4A" strokeWidth="0.75" strokeDasharray="3 3" />
            <circle cx="50" cy="50" r="30" stroke="#E9B8BD" strokeWidth="1" />
            <circle cx="50" cy="50" r="16" stroke="#743D4A" strokeWidth="0.5" />
          </svg>
        </div>

        {/* Central branded emblem */}
        <div className="relative z-10 flex flex-col items-center text-center">
          <div className="w-12 h-12 rounded-full bg-white/90 shadow-xs border border-[#E9B8BD]/70 flex items-center justify-center mb-2.5 text-[#743D4A]">
            {hasError ? (
              <ShoppingBag className="w-5 h-5 text-[#743D4A]" strokeWidth={1.5} />
            ) : (
              <ShoppingBag className="w-5 h-5 text-[#743D4A]" strokeWidth={1.5} />
            )}
          </div>
          <span className="font-serif italic text-base font-semibold tracking-wide text-[#743D4A]">
            PriyaFindz
          </span>
          <span className="text-[11px] font-medium uppercase tracking-wider text-[#743D4A]/70 mt-0.5">
            {fallbackText || categoryName || 'Curated Find'}
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className={`w-full h-full relative overflow-hidden bg-[#F5EBE6] ${className}`}>
      {/* Animated shimmer & spinner loading state */}
      {isLoading && (
        <div className="absolute inset-0 bg-gradient-to-br from-[#FFF9F4] to-[#F5EBE6] animate-pulse flex flex-col items-center justify-center z-10">
          <Loader2 className="w-6 h-6 text-[#743D4A]/40 animate-spin mb-1.5" />
          <span className="text-[11px] text-[#743D4A]/60 font-serif italic tracking-wider">Loading...</span>
        </div>
      )}

      <img
        src={cleanSrc}
        alt={alt || 'PriyaFindz Fashion Item'}
        loading="lazy"
        onLoad={() => setIsLoading(false)}
        onError={() => {
          setHasError(true);
          setIsLoading(false);
        }}
        className={`w-full h-full object-cover transition-opacity duration-300 ${
          isLoading ? 'opacity-0' : 'opacity-100'
        }`}
        {...props}
      />
    </div>
  );
};
