import React, { useState, useMemo } from 'react';
import { useSettings } from '../../context/SettingsContext';
import { useCart } from '../../context/CartContext';
import { MenuItem } from '../../types/database.types';
import { Search, Plus, Check, Info, Sparkles, Filter } from 'lucide-react';

interface MenuCatalogProps {
  selectedCategoryId: string | null;
  onSelectCategory: (catId: string | null) => void;
  onSelectDish: (item: MenuItem) => void;
  onOpenPartyModal?: () => void;
}

export const MenuCatalog: React.FC<MenuCatalogProps> = ({
  selectedCategoryId,
  onSelectCategory,
  onSelectDish,
  onOpenPartyModal,
}) => {
  const { categories, menuItems } = useSettings();
  const { addToCart } = useCart();
  const [searchQuery, setSearchQuery] = useState('');
  const [addedItemId, setAddedItemId] = useState<string | null>(null);

  // Filter items based on category and search query
  const filteredItems = useMemo(() => {
    return menuItems.filter((item) => {
      const matchesCategory = selectedCategoryId ? item.category_id === selectedCategoryId : true;
      const matchesSearch = searchQuery.trim() === ''
        ? true
        : item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (item.description && item.description.toLowerCase().includes(searchQuery.toLowerCase()));
      return matchesCategory && matchesSearch;
    });
  }, [menuItems, selectedCategoryId, searchQuery]);

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
      setAddedItemId(item.id);
      setTimeout(() => setAddedItemId(null), 1500);
    }
  };

  const activeCategoryName = categories.find((c) => c.id === selectedCategoryId)?.name || 'All Dishes';

  return (
    <section id="menu" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-20 scroll-mt-24">
      {/* Menu Header with Search */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8 border-b border-borderLight pb-6">
        <div>
          <span className="text-xs uppercase tracking-widest font-semibold text-olive">Digital Menu</span>
          <h2 className="font-serif text-3xl sm:text-4xl font-bold text-forest mt-1">Menu</h2>
          <p className="text-sm text-charcoal/70 mt-1">
            A wide range of delicious vegetarian favourites, prepared with pure ingredients.
          </p>
        </div>

        {/* Search Input Box */}
        <div className="relative w-full md:w-80">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search for a dish..."
            className="w-full pl-10 pr-4 py-2.5 rounded-full bg-cream-light border border-borderLight text-charcoal placeholder-charcoal/50 text-sm focus:outline-none focus:ring-2 focus:ring-forest/30 focus:border-forest transition-all"
          />
          <Search className="w-4 h-4 text-charcoal/50 absolute left-3.5 top-1/2 -translate-y-1/2" />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs text-charcoal/50 hover:text-charcoal"
            >
              Clear
            </button>
          )}
        </div>
      </div>

      {/* Category Filter Horizontal Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-4 mb-8 no-scrollbar scrollbar-none">
        <button
          onClick={() => onSelectCategory(null)}
          className={`px-4 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
            selectedCategoryId === null
              ? 'bg-forest text-cream shadow-sm'
              : 'bg-cream-light text-charcoal hover:bg-cream-dark/50 border border-borderLight'
          }`}
        >
          All ({menuItems.length})
        </button>
        {categories.map((cat) => {
          const count = menuItems.filter((i) => i.category_id === cat.id).length;
          const isSelected = selectedCategoryId === cat.id;
          return (
            <button
              key={cat.id}
              onClick={() => onSelectCategory(cat.id)}
              className={`px-4 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
                isSelected
                  ? 'bg-forest text-cream shadow-sm'
                  : 'bg-cream-light text-charcoal hover:bg-cream-dark/50 border border-borderLight'
              }`}
            >
              {cat.name} ({count})
            </button>
          );
        })}
      </div>

      {/* Notice regarding unpriced dishes for Party Booking */}
      <div className="bg-cream-light border border-sage/30 rounded-xl p-3.5 mb-8 flex items-start sm:items-center gap-3 text-xs text-charcoal/80">
        <Info className="w-4 h-4 text-forest shrink-0 mt-0.5 sm:mt-0" />
        <p>
          <strong className="text-forest">Pre-Order & Party Notice:</strong> Regular online ordering is enabled for priced menu items. Dishes marked with{' '}
          <span className="text-terracotta font-semibold">"Price on Request"</span> can be booked in custom quantities for parties and gatherings via our Party Enquiry portal or WhatsApp.
        </p>
      </div>

      {/* Dishes Grid */}
      {filteredItems.length === 0 ? (
        <div className="text-center py-16 bg-cream-light rounded-2xl border border-borderLight p-8">
          <p className="font-serif text-xl font-bold text-forest mb-2">No dishes found</p>
          <p className="text-sm text-charcoal/70 mb-4">
            Try adjusting your search query or selecting a different category.
          </p>
          <button
            onClick={() => {
              setSearchQuery('');
              onSelectCategory(null);
            }}
            className="px-5 py-2 rounded-full bg-forest text-cream text-xs font-semibold hover:bg-forest-light"
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredItems.map((dish) => {
            const isPriced = dish.price !== null && dish.price > 0;
            const isAdded = addedItemId === dish.id;

            return (
              <div
                key={dish.id}
                onClick={() => onSelectDish(dish)}
                className="bg-cream-light rounded-2xl border border-borderLight overflow-hidden p-3.5 shadow-subtle hover:shadow-card hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between group cursor-pointer"
              >
                <div>
                  {/* Food Image */}
                  <div className="relative rounded-xl overflow-hidden aspect-4/3 bg-cream-dark/30 mb-3.5">
                    <img
                      src={
                        dish.image_url ||
                        'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&auto=format&fit=crop&q=80'
                      }
                      alt={dish.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      loading="lazy"
                    />

                    {/* Pure Veg Badge */}
                    <div className="absolute top-2.5 right-2.5 bg-cream/95 backdrop-blur-sm p-1 rounded border border-borderLight shadow-sm">
                      <div className="w-3.5 h-3.5 border border-emerald-700 flex items-center justify-center">
                        <span className="w-2 h-2 rounded-full bg-emerald-700" />
                      </div>
                    </div>

                    {/* Bestseller or Party badge */}
                    {dish.is_bestseller ? (
                      <div className="absolute bottom-2.5 left-2.5 bg-forest/90 text-cream text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full backdrop-blur-sm">
                        Bestseller
                      </div>
                    ) : dish.is_party_special ? (
                      <div className="absolute bottom-2.5 left-2.5 bg-olive/90 text-cream text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full backdrop-blur-sm">
                        Party Special
                      </div>
                    ) : null}
                  </div>

                  {/* Title and Category Tag */}
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-serif text-base sm:text-lg font-bold text-forest leading-snug group-hover:text-forest-light transition-colors">
                      {dish.name}
                    </h3>
                  </div>

                  <p className="text-xs text-charcoal/70 line-clamp-2 mt-1 min-h-8">
                    {dish.description || 'Authentic recipe prepared fresh to order with pure desi ingredients.'}
                  </p>
                </div>

                {/* Card Bottom: Pricing & Action Button */}
                <div className="pt-3 mt-3 border-t border-borderLight/60 flex items-center justify-between">
                  <div>
                    {isPriced ? (
                      <div>
                        <span className="text-[11px] text-charcoal/60">Price</span>
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
      )}
    </section>
  );
};
