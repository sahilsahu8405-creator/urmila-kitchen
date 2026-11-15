import React from 'react';
import { useSettings } from '../../context/SettingsContext';

export const PhotoGallery: React.FC = () => {
  const { galleryImages } = useSettings();

  if (!galleryImages || galleryImages.length === 0) {
    return null;
  }

  return (
    <section id="gallery" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-20 scroll-mt-24">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
        <div>
          <span className="text-xs uppercase tracking-widest font-semibold text-olive">Visual Journey</span>
          <h2 className="font-serif text-3xl sm:text-4xl font-bold text-forest mt-1">From Our Kitchen</h2>
        </div>
        <p className="text-xs sm:text-sm text-charcoal/70 max-w-sm">
          Every dish is prepared fresh on the day of your order with authentic recipes and pure ingredients.
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">
        {galleryImages.map((item) => (
          <div
            key={item.id}
            className="group relative rounded-2xl overflow-hidden aspect-square bg-cream-dark/20 border border-borderLight shadow-subtle hover:shadow-card transition-all"
          >
            <img
              src={item.image_url}
              alt={item.title}
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
              loading="lazy"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-forest/80 via-forest/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4">
              <span className="text-[10px] uppercase tracking-wider font-semibold text-sage-light">
                {item.category}
              </span>
              <p className="font-serif text-base font-bold text-cream leading-tight">
                {item.title}
              </p>
              {Boolean('caption' in item && item.caption) && (
                <p className="text-xs text-cream/80 line-clamp-1 mt-0.5">{String(item.caption)}</p>
              )}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

