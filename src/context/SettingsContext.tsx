import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import {
  Category,
  MenuItem,
  DeliverySlot,
  BusinessSettings,
  BusinessSchedule,
  BusinessClosure,
  CustomerReview,
} from '../types/database.types';
import {
  INITIAL_CATEGORIES,
  INITIAL_MENU_ITEMS,
  INITIAL_DELIVERY_SLOTS,
  INITIAL_SETTINGS,
  INITIAL_SCHEDULES,
  INITIAL_REVIEWS,
} from '../lib/initialData';

interface SettingsContextType {
  categories: Category[];
  menuItems: MenuItem[];
  deliverySlots: DeliverySlot[];
  settings: BusinessSettings;
  schedules: BusinessSchedule[];
  closures: BusinessClosure[];
  reviews: CustomerReview[];
  isLoading: boolean;
  isUsingFallback: boolean;
  refreshData: () => Promise<void>;
  updateMenuItemPrice: (itemId: string, newPrice: number | null) => Promise<{ success: boolean; error?: string }>;
  toggleMenuItemAvailability: (itemId: string, isAvailable: boolean) => Promise<{ success: boolean; error?: string }>;
  toggleMenuItemBestseller: (itemId: string, isBestseller: boolean) => Promise<{ success: boolean; error?: string }>;
  updateSettings: (newSettings: Partial<BusinessSettings>) => Promise<{ success: boolean; error?: string }>;
  addClosure: (closure: Omit<BusinessClosure, 'id' | 'created_at'>) => Promise<{ success: boolean; error?: string }>;
  deleteClosure: (closureId: string) => Promise<{ success: boolean; error?: string }>;
  toggleScheduleDay: (dayOfWeek: number, isOpen: boolean) => Promise<{ success: boolean; error?: string }>;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export const SettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [categories, setCategories] = useState<Category[]>(INITIAL_CATEGORIES);
  const [menuItems, setMenuItems] = useState<MenuItem[]>(INITIAL_MENU_ITEMS);
  const [deliverySlots, setDeliverySlots] = useState<DeliverySlot[]>(INITIAL_DELIVERY_SLOTS);
  const [settings, setSettings] = useState<BusinessSettings>(INITIAL_SETTINGS);
  const [schedules, setSchedules] = useState<BusinessSchedule[]>(INITIAL_SCHEDULES);
  const [closures, setClosures] = useState<BusinessClosure[]>([]);
  const [reviews, setReviews] = useState<CustomerReview[]>(INITIAL_REVIEWS);
  const [isLoading, setIsLoading] = useState(true);
  const [isUsingFallback, setIsUsingFallback] = useState(false);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      // 1. Fetch categories
      const { data: catData, error: catError } = await supabase
        .from('categories')
        .select('*')
        .order('display_order', { ascending: true });

      // If table doesn't exist yet, we fall back to initialData
      if (catError || !catData || catData.length === 0) {
        setIsUsingFallback(true);
        // Load locally saved custom prices if any
        const savedCustomPrices = localStorage.getItem('urmila_custom_prices');
        if (savedCustomPrices) {
          try {
            const parsed = JSON.parse(savedCustomPrices);
            setMenuItems(prev =>
              prev.map(it => (parsed[it.id] !== undefined ? { ...it, price: parsed[it.id] } : it))
            );
          } catch (e) {}
        }
        setIsLoading(false);
        return;
      }

      setCategories(catData);
      setIsUsingFallback(false);

      // 2. Fetch menu items
      const { data: itemData } = await supabase
        .from('menu_items')
        .select('*')
        .order('display_order', { ascending: true });
      if (itemData && itemData.length > 0) {
        setMenuItems(itemData);
      }

      // 3. Fetch delivery slots
      const { data: slotData } = await supabase
        .from('delivery_slots')
        .select('*')
        .order('display_order', { ascending: true });
      if (slotData && slotData.length > 0) {
        setDeliverySlots(slotData);
      }

      // 4. Fetch business settings
      const { data: settingsData } = await supabase
        .from('business_settings')
        .select('*')
        .limit(1)
        .single();
      if (settingsData) {
        setSettings(settingsData);
      }

      // 5. Fetch schedules
      const { data: schedData } = await supabase
        .from('business_schedules')
        .select('*')
        .order('day_of_week', { ascending: true });
      if (schedData && schedData.length > 0) {
        setSchedules(schedData);
      }

      // 6. Fetch closures
      const { data: closureData } = await supabase
        .from('business_closures')
        .select('*')
        .order('start_date', { ascending: true });
      if (closureData) {
        setClosures(closureData);
      }

      // 7. Fetch approved reviews
      const { data: revData } = await supabase
        .from('customer_reviews')
        .select('*')
        .eq('is_approved', true)
        .order('created_at', { ascending: false });
      if (revData && revData.length > 0) {
        setReviews(revData);
      }
    } catch (err) {
      console.warn('Using local fallback configuration:', err);
      setIsUsingFallback(true);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Update Menu Item Price
  const updateMenuItemPrice = async (itemId: string, newPrice: number | null) => {
    // Optimistic state update
    setMenuItems(prev =>
      prev.map(it => (it.id === itemId ? { ...it, price: newPrice } : it))
    );

    // Save in local cache for offline/fallback mode
    try {
      const saved = JSON.parse(localStorage.getItem('urmila_custom_prices') || '{}');
      saved[itemId] = newPrice;
      localStorage.setItem('urmila_custom_prices', JSON.stringify(saved));
    } catch (e) {}

    if (!isUsingFallback) {
      const { error } = await supabase
        .from('menu_items')
        .update({ price: newPrice, updated_at: new Date().toISOString() })
        .eq('id', itemId);
      if (error) {
        return { success: false, error: error.message };
      }
    }
    return { success: true };
  };

  // Toggle Availability
  const toggleMenuItemAvailability = async (itemId: string, isAvailable: boolean) => {
    setMenuItems(prev =>
      prev.map(it => (it.id === itemId ? { ...it, is_available: isAvailable } : it))
    );

    if (!isUsingFallback) {
      const { error } = await supabase
        .from('menu_items')
        .update({ is_available: isAvailable, updated_at: new Date().toISOString() })
        .eq('id', itemId);
      if (error) {
        return { success: false, error: error.message };
      }
    }
    return { success: true };
  };

  // Toggle Bestseller
  const toggleMenuItemBestseller = async (itemId: string, isBestseller: boolean) => {
    setMenuItems(prev =>
      prev.map(it => (it.id === itemId ? { ...it, is_bestseller: isBestseller } : it))
    );

    if (!isUsingFallback) {
      const { error } = await supabase
        .from('menu_items')
        .update({ is_bestseller: isBestseller, updated_at: new Date().toISOString() })
        .eq('id', itemId);
      if (error) {
        return { success: false, error: error.message };
      }
    }
    return { success: true };
  };

  // Update Settings
  const updateSettings = async (newSettings: Partial<BusinessSettings>) => {
    setSettings(prev => ({ ...prev, ...newSettings }));
    if (!isUsingFallback && settings.id) {
      const { error } = await supabase
        .from('business_settings')
        .update({ ...newSettings, updated_at: new Date().toISOString() })
        .eq('id', settings.id);
      if (error) {
        return { success: false, error: error.message };
      }
    }
    return { success: true };
  };

  // Add Closure / Holiday
  const addClosure = async (closure: Omit<BusinessClosure, 'id' | 'created_at'>) => {
    const tempId = `closure-${Date.now()}`;
    const newEntry: BusinessClosure = { ...closure, id: tempId, created_at: new Date().toISOString() };
    setClosures(prev => [...prev, newEntry]);

    if (!isUsingFallback) {
      const { data, error } = await supabase
        .from('business_closures')
        .insert([closure])
        .select()
        .single();
      if (error) {
        return { success: false, error: error.message };
      }
      if (data) {
        setClosures(prev => prev.map(c => (c.id === tempId ? data : c)));
      }
    }
    return { success: true };
  };

  // Delete Closure
  const deleteClosure = async (closureId: string) => {
    setClosures(prev => prev.filter(c => c.id !== closureId));
    if (!isUsingFallback) {
      const { error } = await supabase.from('business_closures').delete().eq('id', closureId);
      if (error) {
        return { success: false, error: error.message };
      }
    }
    return { success: true };
  };

  // Toggle Schedule Day
  const toggleScheduleDay = async (dayOfWeek: number, isOpen: boolean) => {
    setSchedules(prev =>
      prev.map(s => (s.day_of_week === dayOfWeek ? { ...s, is_open: isOpen } : s))
    );
    if (!isUsingFallback) {
      const { error } = await supabase
        .from('business_schedules')
        .update({ is_open: isOpen })
        .eq('day_of_week', dayOfWeek);
      if (error) {
        return { success: false, error: error.message };
      }
    }
    return { success: true };
  };

  return (
    <SettingsContext.Provider
      value={{
        categories,
        menuItems,
        deliverySlots,
        settings,
        schedules,
        closures,
        reviews,
        isLoading,
        isUsingFallback,
        refreshData: fetchData,
        updateMenuItemPrice,
        toggleMenuItemAvailability,
        toggleMenuItemBestseller,
        updateSettings,
        addClosure,
        deleteClosure,
        toggleScheduleDay,
      }}
    >
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
};

