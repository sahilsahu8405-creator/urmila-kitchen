import React from 'react';
import { useCart } from '../../context/CartContext';
import { X, Plus, Minus, Trash2, ArrowRight, ShoppingBag } from 'lucide-react';

interface CartDrawerProps {
  onProceedToCheckout: () => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({ onProceedToCheckout }) => {
  const {
    items,
    isCartOpen,
    setIsCartOpen,
    updateQuantity,
    removeFromCart,
    subtotal,
    deliveryFee,
    total,
    itemCount,
  } = useCart();

  if (!isCartOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden animate-in fade-in duration-200">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-charcoal/60 backdrop-blur-sm transition-opacity"
        onClick={() => setIsCartOpen(false)}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-cream border-l border-borderLight shadow-elevated flex flex-col justify-between">
          
          {/* Header */}
          <div className="p-5 border-b border-borderLight bg-cream-light flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-full bg-forest/10 flex items-center justify-center text-forest">
                <ShoppingBag className="w-5 h-5" />
              </div>
              <div>
                <h2 className="font-serif text-lg font-bold text-forest">Your Selection</h2>
                <p className="text-xs text-charcoal/60">{itemCount} {itemCount === 1 ? 'dish' : 'dishes'} selected</p>
              </div>
            </div>

            <button
              onClick={() => setIsCartOpen(false)}
              className="w-8 h-8 rounded-full bg-cream border border-borderLight flex items-center justify-center text-charcoal hover:text-forest transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Cart Items List */}
          <div className="p-5 overflow-y-auto flex-1 space-y-4">
            {items.length === 0 ? (
              <div className="text-center py-16 space-y-3">
                <div className="w-16 h-16 rounded-full bg-cream-dark/30 flex items-center justify-center mx-auto text-charcoal/40">
                  <ShoppingBag className="w-8 h-8" />
                </div>
                <p className="font-serif text-lg font-bold text-forest">Your bag is empty</p>
                <p className="text-xs text-charcoal/60 max-w-xs mx-auto">
                  Explore our digital menu and add delicious vegetarian dishes for tomorrow's delivery.
                </p>
                <button
                  onClick={() => setIsCartOpen(false)}
                  className="px-6 py-2 rounded-full bg-forest text-cream text-xs font-semibold hover:bg-forest-light transition-all"
                >
                  Browse Menu
                </button>
              </div>
            ) : (
              items.map((cartItem) => {
                const { item, quantity, special_instructions } = cartItem;
                const unitPrice = item.price || 0;
                const lineTotal = unitPrice * quantity;

                return (
                  <div
                    key={item.id}
                    className="p-3.5 rounded-2xl bg-cream-light border border-borderLight flex items-center gap-3.5 shadow-subtle"
                  >
                    {/* Thumbnail */}
                    <div className="w-16 h-16 rounded-xl overflow-hidden bg-cream-dark/30 shrink-0 aspect-square">
                      <img
                        src={
                          item.image_url ||
                          'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=300&auto=format&fit=crop&q=80'
                        }
                        alt={item.name}
                        className="w-full h-full object-cover"
                      />
                    </div>

                    {/* Details */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-1">
                        <h4 className="font-serif text-sm font-bold text-forest truncate">{item.name}</h4>
                        <button
                          onClick={() => removeFromCart(item.id)}
                          className="text-charcoal/40 hover:text-terracotta transition-colors p-1"
                          title="Remove item"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <p className="text-xs text-charcoal/60 mt-0.5">₹{unitPrice} each</p>

                      {special_instructions && (
                        <p className="text-[11px] text-olive italic truncate mt-0.5">
                          Note: {special_instructions}
                        </p>
                      )}

                      {/* Stepper & Line Price */}
                      <div className="flex items-center justify-between mt-2 pt-1">
                        <div className="flex items-center border border-borderLight rounded-full bg-cream px-1 py-0.5">
                          <button
                            onClick={() => updateQuantity(item.id, quantity - 1)}
                            className="w-6 h-6 rounded-full flex items-center justify-center text-charcoal hover:bg-cream-dark/50"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="w-6 text-center text-xs font-bold text-forest">{quantity}</span>
                          <button
                            onClick={() => updateQuantity(item.id, quantity + 1)}
                            className="w-6 h-6 rounded-full flex items-center justify-center text-charcoal hover:bg-cream-dark/50"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>

                        <span className="font-serif font-bold text-sm text-forest">₹{lineTotal}</span>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Cart Footer */}
          {items.length > 0 && (
            <div className="p-5 border-t border-borderLight bg-cream-light space-y-3.5">
              <div className="space-y-1.5 text-xs text-charcoal/80">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="font-medium text-forest">₹{subtotal}</span>
                </div>
                <div className="flex justify-between">
                  <span>Delivery Charges</span>
                  <span className="font-medium text-forest">₹{deliveryFee}</span>
                </div>
                <div className="border-t border-borderLight/80 pt-2 flex justify-between text-base font-bold text-forest font-serif">
                  <span>Total</span>
                  <span>₹{total}</span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  setIsCartOpen(false);
                  onProceedToCheckout();
                }}
                className="w-full py-3.5 px-6 rounded-full bg-forest text-cream font-bold text-sm hover:bg-forest-light transition-all flex items-center justify-center gap-2 shadow-sm active:scale-[0.98]"
              >
                <span>Proceed to Checkout</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};
