import React, { useState } from 'react';
import { useCart } from '../../context/CartContext';
import { X, Plus, Minus, Trash2, ArrowRight, ShoppingBag, Edit3, MessageSquare } from 'lucide-react';
import { DishImage } from '../common/DishImage';

interface CartDrawerProps {
  onProceedToCheckout: () => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({ onProceedToCheckout }) => {
  const {
    items,
    isCartOpen,
    setIsCartOpen,
    updateQuantity,
    updateItemInstructions,
    removeFromCart,
    clearCart,
    orderInstructions,
    setOrderInstructions,
    subtotal,
    deliveryFee,
    total,
    itemCount,
  } = useCart();

  const [editingNoteItemId, setEditingNoteItemId] = useState<string | null>(null);
  const [noteInput, setNoteInput] = useState('');

  if (!isCartOpen) return null;

  const handleStartEditNote = (itemId: string, currentNote: string = '') => {
    setEditingNoteItemId(itemId);
    setNoteInput(currentNote);
  };

  const handleSaveNote = (itemId: string) => {
    updateItemInstructions(itemId, noteInput.trim());
    setEditingNoteItemId(null);
  };

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
                <p className="text-xs text-charcoal/60">{itemCount} {itemCount === 1 ? 'item' : 'items'} in your cart</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {items.length > 0 && (
                <button
                  type="button"
                  onClick={clearCart}
                  className="text-xs font-semibold text-charcoal/50 hover:text-terracotta transition-colors px-2 py-1"
                >
                  Clear All
                </button>
              )}
              <button
                onClick={() => setIsCartOpen(false)}
                className="w-8 h-8 rounded-full bg-cream border border-borderLight flex items-center justify-center text-charcoal hover:text-forest transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Cart Items List */}
          <div className="p-5 overflow-y-auto flex-1 space-y-4">
            {items.length === 0 ? (
              <div className="text-center py-16 space-y-3">
                <div className="w-16 h-16 rounded-full bg-cream-dark/30 flex items-center justify-center mx-auto text-charcoal/40">
                  <ShoppingBag className="w-8 h-8" />
                </div>
                <p className="font-serif text-lg font-bold text-forest">Your cart is empty</p>
                <p className="text-xs text-charcoal/60 max-w-xs mx-auto">
                  Explore our vegetarian menu and add your favourite dishes for next-day delivery.
                </p>
                <button
                  onClick={() => setIsCartOpen(false)}
                  className="px-6 py-2.5 rounded-full bg-forest text-cream text-xs font-bold hover:bg-forest-light transition-all shadow-sm"
                >
                  Browse Menu
                </button>
              </div>
            ) : (
              <>
                {items.map((cartItem) => {
                  const { item, quantity, special_instructions } = cartItem;
                  const unitPrice = item.price || 0;
                  const lineTotal = unitPrice * quantity;
                  const isEditingNote = editingNoteItemId === item.id;

                  return (
                    <div
                      key={item.id}
                      className="p-3.5 rounded-2xl bg-cream-light border border-borderLight flex flex-col gap-2.5 shadow-subtle"
                    >
                      <div className="flex items-center gap-3.5">
                        {/* Thumbnail */}
                        <div className="w-16 h-16 rounded-xl overflow-hidden bg-cream-dark/30 shrink-0 aspect-square">
                          <DishImage
                            src={item.image_url}
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

                      {/* Individual Item Instructions */}
                      <div className="pt-2 border-t border-borderLight/60">
                        {isEditingNote ? (
                          <div className="flex items-center gap-2">
                            <input
                              type="text"
                              value={noteInput}
                              onChange={(e) => setNoteInput(e.target.value)}
                              className="flex-1 px-2.5 py-1 text-xs rounded-lg bg-cream border border-borderLight text-charcoal focus:outline-none focus:ring-1 focus:ring-forest"
                            />
                            <button
                              onClick={() => handleSaveNote(item.id)}
                              className="px-2.5 py-1 rounded-lg bg-forest text-cream text-[11px] font-bold"
                            >
                              Save
                            </button>
                            <button
                              onClick={() => setEditingNoteItemId(null)}
                              className="px-2 py-1 rounded-lg bg-cream-dark/50 text-[11px] text-charcoal"
                            >
                              Cancel
                            </button>
                          </div>
                        ) : (
                          <div className="flex items-center justify-between text-xs">
                            {special_instructions ? (
                              <p className="text-olive italic flex-1 truncate mr-2">
                                Note: {special_instructions}
                              </p>
                            ) : (
                              <span className="text-charcoal/50 text-[11px]">No custom note</span>
                            )}
                            <button
                              onClick={() => handleStartEditNote(item.id, special_instructions)}
                              className="text-[11px] font-semibold text-forest hover:underline flex items-center gap-1 shrink-0"
                            >
                              <Edit3 className="w-3 h-3" />
                              <span>{special_instructions ? 'Edit note' : 'Add note'}</span>
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}

                {/* Overall Order Instructions Box */}
                <div className="p-3.5 rounded-2xl bg-cream-light border border-borderLight space-y-1.5">
                  <label className="block text-xs font-bold text-forest flex items-center gap-1.5">
                    <MessageSquare className="w-3.5 h-3.5 text-olive" />
                    <span>Overall Order Instructions (Optional)</span>
                  </label>
                  <textarea
                    rows={2}
                    value={orderInstructions}
                    onChange={(e) => setOrderInstructions(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl bg-cream border border-borderLight text-charcoal focus:outline-none focus:ring-1 focus:ring-forest resize-none"
                  />
                </div>
              </>
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
                  <span>Grand Total</span>
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
