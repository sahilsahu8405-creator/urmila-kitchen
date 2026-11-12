import React, { useState } from 'react';
import { MenuItem } from '../../types/database.types';
import { useCart } from '../../context/CartContext';
import { X, Plus, Minus, Check, Clock } from 'lucide-react';
import { DishImage } from '../common/DishImage';

interface ProductDetailModalProps {
  item: MenuItem | null;
  onClose: () => void;
}

export const ProductDetailModal: React.FC<ProductDetailModalProps> = ({
  item,
  onClose,
}) => {
  if (!item) return null;

  const { addToCart } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [instructions, setInstructions] = useState('');
  const [isAdded, setIsAdded] = useState(false);

  const isPriced = item.price !== null && item.price > 0;

  const handleAddToCart = () => {
    if (!isPriced) return;
    const res = addToCart(item, quantity, instructions);
    if (res.success) {
      setIsAdded(true);
      setTimeout(() => {
        setIsAdded(false);
        onClose();
      }, 1000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-charcoal/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-lg bg-cream rounded-3xl border border-borderLight shadow-elevated overflow-hidden animate-in zoom-in-95 duration-200 max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 w-9 h-9 rounded-full bg-cream/90 backdrop-blur-sm border border-borderLight flex items-center justify-center text-charcoal hover:text-forest transition-colors shadow-sm"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Dish Photograph */}
        <div className="relative aspect-16/9 bg-cream-dark/30 shrink-0">
          <DishImage
            src={item.image_url}
            alt={item.name}
            className="w-full h-full object-cover"
          />

          {/* Pure Veg Badge */}
          <div className="absolute top-4 left-4 bg-cream/95 backdrop-blur-sm px-2.5 py-1 rounded-full border border-borderLight shadow-sm flex items-center gap-1.5">
            <div className="w-3.5 h-3.5 border border-emerald-700 flex items-center justify-center">
              <span className="w-2 h-2 rounded-full bg-emerald-700" />
            </div>
            <span className="text-[11px] font-bold text-forest uppercase tracking-wider">100% Pure Veg</span>
          </div>

          {item.is_bestseller && (
            <div className="absolute bottom-4 left-4 bg-forest text-cream text-xs font-semibold px-3 py-1 rounded-full shadow-sm">
              Chef's Bestseller
            </div>
          )}
        </div>

        {/* Details Scroll Area */}
        <div className="p-6 overflow-y-auto space-y-5 flex-1">
          <div>
            <h2 className="font-serif text-2xl font-bold text-forest">{item.name}</h2>
            <p className="text-sm text-charcoal/75 mt-1.5 leading-relaxed">
              {item.description || 'Authentic dish handcrafted fresh in our kitchen with pure desi ingredients and aromatic spices.'}
            </p>
          </div>

          {/* Pricing Box */}
          <div className="p-4 rounded-2xl bg-cream-light border border-borderLight flex items-center justify-between">
            <div>
              <span className="text-xs text-charcoal/60 uppercase tracking-wider font-semibold">Pricing</span>
              {isPriced ? (
                <div className="flex items-baseline gap-2 mt-0.5">
                  <span className="font-serif text-2xl font-bold text-forest">₹{item.price}</span>
                  <span className="text-xs text-charcoal/60">per portion</span>
                </div>
              ) : (
                <div className="flex items-center gap-1.5 mt-1 text-sm font-semibold text-charcoal/70 italic">
                  <Clock className="w-4 h-4 text-olive" />
                  <span>Price coming soon</span>
                </div>
              )}
            </div>
          </div>

          {/* If unpriced note */}
          {!isPriced && (
            <div className="p-4 rounded-2xl bg-cream-dark/20 border border-borderLight text-xs text-charcoal/70">
              This dish is currently being priced by the kitchen owner. Once published, regular online pre-ordering will be immediately enabled.
            </div>
          )}

          {/* Individual Dish Instructions Input */}
          {isPriced && (
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-charcoal/80 mb-1.5">
                Special Instructions for this dish (Optional)
              </label>
              <input
                type="text"
                value={instructions}
                onChange={(e) => setInstructions(e.target.value)}
                placeholder="e.g. Less spicy, please / No onions / Extra crispy"
                className="w-full px-4 py-2.5 rounded-xl bg-cream-light border border-borderLight text-sm text-charcoal placeholder-charcoal/40 focus:outline-none focus:ring-2 focus:ring-forest/30"
              />
            </div>
          )}
        </div>

        {/* Modal Bottom Actions */}
        <div className="p-5 border-t border-borderLight bg-cream-light shrink-0">
          {isPriced ? (
            <div className="flex items-center gap-4">
              {/* Stepper */}
              <div className="flex items-center border border-borderLight rounded-full bg-cream p-1">
                <button
                  type="button"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="w-9 h-9 rounded-full flex items-center justify-center text-charcoal hover:bg-cream-dark transition-colors"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="w-8 text-center font-bold text-sm text-forest">{quantity}</span>
                <button
                  type="button"
                  onClick={() => setQuantity(Math.min(20, quantity + 1))}
                  className="w-9 h-9 rounded-full flex items-center justify-center text-charcoal hover:bg-cream-dark transition-colors"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>

              {/* Add to Cart Button */}
              <button
                type="button"
                onClick={handleAddToCart}
                disabled={isAdded}
                className="flex-1 py-3.5 px-6 rounded-full bg-forest text-cream font-bold text-sm hover:bg-forest-light transition-all shadow-sm flex items-center justify-center gap-2 active:scale-[0.98]"
              >
                {isAdded ? (
                  <>
                    <Check className="w-4 h-4" />
                    <span>Added to Cart</span>
                  </>
                ) : (
                  <span>Add to Cart • ₹{(item.price || 0) * quantity}</span>
                )}
              </button>
            </div>
          ) : (
            <button
              type="button"
              disabled
              className="w-full py-3.5 px-6 rounded-full bg-cream-dark/50 text-charcoal/50 font-bold text-sm cursor-not-allowed border border-borderLight text-center"
            >
              Price Coming Soon
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
