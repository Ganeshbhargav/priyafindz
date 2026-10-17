import React, { useState } from 'react';

interface ImageWithFallbackProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  fallbackSrc?: string;
  categoryName?: string;
}

export const ImageWithFallback: React.FC<ImageWithFallbackProps> = ({
  src,
  alt,
  className = '',
  categoryName,
  ...props
}) => {
  const [hasError, setHasError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Safe fallback placeholder
  const placeholderUrl = `https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=600&q=80`;

  return (
    <div className={`relative overflow-hidden bg-[#F5EBE6] ${className}`}>
      {isLoading && (
        <div className="absolute inset-0 bg-[#F5EBE6] animate-pulse flex items-center justify-center">
          <span className="text-xs text-[#743D4A]/50 font-serif italic">PriyaFindz</span>
        </div>
      )}
      <img
        src={hasError || !src ? placeholderUrl : src}
        alt={alt || 'Fashion item'}
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
