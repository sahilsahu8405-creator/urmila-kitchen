import React from 'react';
import { useSettings } from '../../context/SettingsContext';
import { useCart } from '../../context/CartContext';
import { MenuItem } from '../../types/database.types';
import { Plus, Check, Sparkles, AlertCircle } from 'lucide-react';

interface BestsellersProps {
  onSelectDish: (item: MenuItem) => void;
  onOpenPartyModal?: () => void;
}

export const Bestsellers: React.FC<BestsellersProps> = ({ onSelectDish, onOpenPartyModal }) => {
  const { menuItems } = useSettings();
  const { addToCart } = useCart();
  const [addedId, setAddedId] = React.useState<string | null>(null);

  // Filter bestsellers from menuItems, fallback to top 4 featured items
  const bestsellers = menuItems
    .filter((item) => item.is_bestseller && item.is_available)
    .slice(0, 4);

  // If fewer than 4 marked, take available items from Starters and Mains
  const displayItems = bestsellers.length >= 4
    ? bestsellers
    : menuItems.filter(item => item.is_available).slice(0, 4);

  const handleAdd = (e: React.MouseEvent, item: MenuItem) => {
    e.stopPropagation();
    if (item.price === null || item.price <= 0) {
      if (onOpenPartyModal) {
        onOpenPartyModal();
      }
      return;
    }
    const res = addToCart(item);
    if (res.success) {
      setAddedId(item.id);
      setTimeout(() => setAddedId(null), 1500);
    }
  };

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-16">
      <div className="flex items-center justify-between mb-8">
        <div>
          <span className="text-xs uppercase tracking-widest font-semibold text-olive">Chef's Signature</span>
          <h2 className="font-serif text-3xl sm:text-4xl font-bold text-forest mt-1">Bestsellers</h2>
        </div>
        <a
          href="#menu"
          className="text-sm font-semibold text-forest hover:text-forest-light flex items-center gap-1 group"
        >
          <span>View full menu</span>
          <span className="transition-transform group-hover:translate-x-1">→</span>
        </a>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {displayItems.map((dish) => {
          const isPriced = dish.price !== null && dish.price > 0;
          const isAdded = addedId === dish.id;

          return (
            <div
              key={dish.id}
              onClick={() => onSelectDish(dish)}
              className="bg-cream-light rounded-2xl border border-borderLight overflow-hidden p-3.5 shadow-subtle hover:shadow-card hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between group cursor-pointer"
            >
              <div>
                {/* Food Image with Veg Badge */}
                <div className="relative rounded-xl overflow-hidden aspect-4/3 bg-cream-dark/20 mb-3.5">
                  <img
                    src={
                      dish.image_url ||
                      'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&auto=format&fit=crop&q=80'
                    }
                    alt={dish.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    loading="lazy"
                  />

                  {/* Pure Veg Indicator Symbol */}
                  <div className="absolute top-2.5 right-2.5 bg-cream/95 backdrop-blur-sm p-1 rounded border border-borderLight shadow-sm">
                    <div className="w-3.5 h-3.5 border border-emerald-700 flex items-center justify-center">
                      <span className="w-2 h-2 rounded-full bg-emerald-700" />
                    </div>
                  </div>

                  {/* Bestseller Badge */}
                  <div className="absolute bottom-2.5 left-2.5 bg-forest/90 text-cream text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full backdrop-blur-sm">
                    Bestseller
                  </div>
                </div>

                {/* Dish Info */}
                <h3 className="font-serif text-lg font-bold text-forest leading-snug group-hover:text-forest-light transition-colors">
                  {dish.name}
                </h3>
                <p className="text-xs text-charcoal/70 line-clamp-2 mt-1 min-h-8">
                  {dish.description || 'Artisanal vegetarian delicacy prepared fresh with authentic spices.'}
                </p>
              </div>

              {/* Price & Action Button */}
              <div className="pt-3 mt-2 border-t border-borderLight/60 flex items-center justify-between">
                <div>
                  {isPriced ? (
                    <div>
                      <span className="text-xs text-charcoal/60">Price</span>
                      <p className="font-serif text-lg font-bold text-forest">₹{dish.price}</p>
                    </div>
                  ) : (
                    <div>
                      <span className="text-[10px] text-terracotta font-semibold uppercase tracking-wider block">
                        Party Booking
                      </span>
                      <span className="text-xs font-medium text-charcoal/70">Price on Request</span>
                    </div>
                  )}
                </div>

                {isPriced ? (
                  <button
                    type="button"
                    onClick={(e) => handleAdd(e, dish)}
                    className={`inline-flex items-center gap-1 px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all active:scale-95 ${
                      isAdded
                        ? 'bg-emerald-700 text-cream'
                        : 'bg-cream border border-forest/30 text-forest hover:bg-forest hover:text-cream shadow-sm'
                    }`}
                  >
                    {isAdded ? (
                      <>
                        <Check className="w-3.5 h-3.5" />
                        <span>Added</span>
                      </>
                    ) : (
                      <>
                        <span>Add</span>
                        <Plus className="w-3.5 h-3.5" />
                      </>
                    )}
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={(e) => handleAdd(e, dish)}
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-[11px] font-semibold bg-terracotta/10 text-terracotta hover:bg-terracotta hover:text-cream transition-all"
                  >
                    <span>Enquire</span>
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};
