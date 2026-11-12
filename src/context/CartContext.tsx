import React, { createContext, useContext, useState, useEffect } from 'react';
import { MenuItem } from '../types/database.types';
import { useSettings } from './SettingsContext';

export interface CartItem {
  item: MenuItem;
  quantity: number;
  special_instructions?: string;
}

interface CartContextType {
  items: CartItem[];
  addToCart: (item: MenuItem, quantity?: number, specialInstructions?: string) => { success: boolean; message?: string };
  updateQuantity: (itemId: string, quantity: number) => void;
  updateItemInstructions: (itemId: string, instructions: string) => void;
  removeFromCart: (itemId: string) => void;
  clearCart: () => void;
  orderInstructions: string;
  setOrderInstructions: (instructions: string) => void;
  subtotal: number;
  deliveryFee: number;
  total: number;
  itemCount: number;
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const CART_STORAGE_KEY = 'urmila_kitchen_cart_v2';
const CART_NOTES_STORAGE_KEY = 'urmila_kitchen_cart_notes_v2';

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { settings } = useSettings();

  const [items, setItems] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem(CART_STORAGE_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.error('Failed to load cart from storage', e);
    }
    return [];
  });

  const [orderInstructions, setOrderInstructions] = useState<string>(() => {
    try {
      return localStorage.getItem(CART_NOTES_STORAGE_KEY) || '';
    } catch (e) {
      return '';
    }
  });

  const [isCartOpen, setIsCartOpen] = useState(false);

  useEffect(() => {
    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
    } catch (e) {
      console.error('Failed to save cart to storage', e);
    }
  }, [items]);

  useEffect(() => {
    try {
      localStorage.setItem(CART_NOTES_STORAGE_KEY, orderInstructions);
    } catch (e) {}
  }, [orderInstructions]);

  const addToCart = (item: MenuItem, quantity: number = 1, specialInstructions?: string) => {
    // Check if dish has a valid price
    if (item.price === null || item.price <= 0) {
      return {
        success: false,
        message: `Price coming soon for "${item.name}". This item cannot be added to cart yet.`,
      };
    }

    if (!item.is_available) {
      return {
        success: false,
        message: `"${item.name}" is currently out of stock.`,
      };
    }

    setItems(prev => {
      const existingIndex = prev.findIndex(ci => ci.item.id === item.id);
      if (existingIndex > -1) {
        const updated = [...prev];
        updated[existingIndex].quantity = Math.min(50, updated[existingIndex].quantity + quantity);
        if (specialInstructions !== undefined) {
          updated[existingIndex].special_instructions = specialInstructions;
        }
        return updated;
      }
      return [...prev, { item, quantity, special_instructions: specialInstructions || '' }];
    });

    setIsCartOpen(true);
    return { success: true };
  };

  const updateQuantity = (itemId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(itemId);
      return;
    }
    setItems(prev =>
      prev.map(ci => (ci.item.id === itemId ? { ...ci, quantity: Math.min(50, quantity) } : ci))
    );
  };

  const updateItemInstructions = (itemId: string, instructions: string) => {
    setItems(prev =>
      prev.map(ci => (ci.item.id === itemId ? { ...ci, special_instructions: instructions } : ci))
    );
  };

  const removeFromCart = (itemId: string) => {
    setItems(prev => prev.filter(ci => ci.item.id !== itemId));
  };

  const clearCart = () => {
    setItems([]);
    setOrderInstructions('');
    try {
      localStorage.removeItem(CART_STORAGE_KEY);
      localStorage.removeItem(CART_NOTES_STORAGE_KEY);
    } catch (e) {}
  };

  const subtotal = items.reduce((sum, ci) => sum + (ci.item.price || 0) * ci.quantity, 0);
  // Dynamically uses settings.delivery_charge from database/owner settings
  const configuredDeliveryCharge = typeof settings.delivery_charge === 'number' ? settings.delivery_charge : 50;
  const deliveryFee = items.length > 0 ? configuredDeliveryCharge : 0;
  const total = subtotal + deliveryFee;
  const itemCount = items.reduce((sum, ci) => sum + ci.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        items,
        addToCart,
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
        isCartOpen,
        setIsCartOpen,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
