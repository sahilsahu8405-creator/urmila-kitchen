import React, { useState } from 'react';
import {
  UtensilsCrossed,
  Salad,
  Flame,
  Soup,
  Layers,
  Pizza,
  Sandwich,
  Coffee,
  Sparkles,
} from 'lucide-react';

interface DishImageProps {
  src?: string | null;
  alt: string;
  categorySlug?: string;
  className?: string;
}

export const DishImage: React.FC<DishImageProps> = ({
  src,
  alt,
  categorySlug,
  className = 'w-full h-full object-cover',
}) => {
  const [imageFailed, setImageFailed] = useState(false);

  // If valid image provided and hasn't errored
  if (src && src.trim() !== '' && !imageFailed) {
    return (
      <img
        src={src}
        alt={alt}
        className={className}
        loading="lazy"
        onError={() => setImageFailed(true)}
      />
    );
  }

  // Category Icon for honest, elegant placeholder
  const getIcon = () => {
    switch (categorySlug) {
      case 'starters':
        return <Salad className="w-8 h-8 text-forest/40" />;
      case 'chaats':
        return <Flame className="w-8 h-8 text-terracotta/40" />;
      case 'mains':
        return <Soup className="w-8 h-8 text-forest/40" />;
      case 'mexican-mains':
        return <Pizza className="w-8 h-8 text-olive/40" />;
      case 'baked-dishes':
        return <Layers className="w-8 h-8 text-forest/40" />;
      case 'sandwich-corner':
        return <Sandwich className="w-8 h-8 text-olive/40" />;
      case 'fondue-section':
        return <UtensilsCrossed className="w-8 h-8 text-forest/40" />;
      case 'drinks':
        return <Coffee className="w-8 h-8 text-forest/40" />;
      case 'desserts':
        return <Sparkles className="w-8 h-8 text-terracotta/40" />;
      default:
        return <UtensilsCrossed className="w-8 h-8 text-forest/40" />;
    }
  };

  return (
    <div className="w-full h-full flex flex-col items-center justify-center bg-cream-dark/30 border border-borderLight/80 p-3 select-none">
      <div className="w-12 h-12 rounded-full bg-cream flex items-center justify-center border border-borderLight/60 shadow-subtle mb-1.5">
        {getIcon()}
      </div>
      <span className="font-serif text-[11px] font-bold text-forest/60 text-center line-clamp-1 max-w-[85%]">
        {alt}
      </span>
      <span className="text-[9px] uppercase tracking-wider text-charcoal/40 font-semibold mt-0.5">
        Photo coming soon
      </span>
    </div>
  );
};
