import React from 'react';
import { Camera } from 'lucide-react';

export const PhotoGallery: React.FC = () => {
  const galleryItems = [
    {
      title: 'Artisanal Starters',
      category: 'Starters',
      url: 'https://images.unsplash.com/photo-1541529086526-db283c563270?w=600&auto=format&fit=crop&q=80',
    },
    {
      title: 'Signature Paneer Tikka',
      category: 'Mains',
      url: 'https://images.unsplash.com/photo-1567188040759-fb8a883dc6d8?w=600&auto=format&fit=crop&q=80',
    },
    {
      title: 'Pav Bhaji Delicacy',
      category: 'Classics',
      url: 'https://images.unsplash.com/photo-1606491956689-2ea866880c84?w=600&auto=format&fit=crop&q=80',
    },
    {
      title: 'Oven Baked Specialties',
      category: 'Baked Dishes',
      url: 'https://images.unsplash.com/photo-1574894709920-11b28e7367e3?w=600&auto=format&fit=crop&q=80',
    },
    {
      title: 'Chaat Specialities',
      category: 'Chaats',
      url: 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=600&auto=format&fit=crop&q=80',
    },
    {
      title: 'Handcrafted Desserts',
      category: 'Desserts',
      url: 'https://images.unsplash.com/photo-1551024709-8f23befc6f87?w=600&auto=format&fit=crop&q=80',
    },
  ];

  return (
    <section id="gallery" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-20 scroll-mt-24">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
        <div>
          <span className="text-xs uppercase tracking-widest font-semibold text-olive">Visual Journey</span>
          <h2 className="font-serif text-3xl sm:text-4xl font-bold text-forest mt-1">From Our Kitchen</h2>
        </div>
        <p className="text-xs sm:text-sm text-charcoal/70 max-w-sm">
          Every dish is prepared fresh on the day of delivery with authentic recipes and pure ingredients.
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">
        {galleryItems.map((item, idx) => (
          <div
            key={idx}
            className="group relative rounded-2xl overflow-hidden aspect-square bg-cream-dark/20 border border-borderLight shadow-subtle hover:shadow-card transition-all"
          >
            <img
              src={item.url}
              alt={item.title}
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
              loading="lazy"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-forest-900/80 via-forest-900/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4">
              <span className="text-[10px] uppercase tracking-wider font-semibold text-sage-light">
                {item.category}
              </span>
              <p className="font-serif text-base font-bold text-cream leading-tight">
                {item.title}
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

