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
  GalleryImage,
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
  galleryImages: GalleryImage[];
  isLoading: boolean;
  isUsingFallback: boolean;
  refreshData: () => Promise<void>;
  updateMenuItemPrice: (itemId: string, newPrice: number | null) => Promise<{ success: boolean; error?: string }>;
  updateMenuItemImage: (itemId: string, imageUrl: string | null) => Promise<{ success: boolean; error?: string }>;
  toggleMenuItemAvailability: (itemId: string, isAvailable: boolean) => Promise<{ success: boolean; error?: string }>;
  toggleMenuItemBestseller: (itemId: string, isBestseller: boolean) => Promise<{ success: boolean; error?: string }>;
  updateSettings: (newSettings: Partial<BusinessSettings>) => Promise<{ success: boolean; error?: string }>;
  addClosure: (closure: Omit<BusinessClosure, 'id' | 'created_at'>) => Promise<{ success: boolean; error?: string }>;
  deleteClosure: (closureId: string) => Promise<{ success: boolean; error?: string }>;
  toggleScheduleDay: (dayOfWeek: number, isOpen: boolean) => Promise<{ success: boolean; error?: string }>;
  addGalleryImage: (image: Omit<GalleryImage, 'id' | 'created_at'>) => Promise<{ success: boolean; error?: string }>;
  deleteGalleryImage: (imageId: string) => Promise<{ success: boolean; error?: string }>;
  updateGalleryImage: (imageId: string, updates: Partial<GalleryImage>) => Promise<{ success: boolean; error?: string }>;
  submitReview: (review: Omit<CustomerReview, 'id' | 'created_at' | 'is_approved' | 'is_featured'>) => Promise<{ success: boolean; error?: string }>;
  approveReview: (reviewId: string, isApproved: boolean) => Promise<{ success: boolean; error?: string }>;
  deleteReview: (reviewId: string) => Promise<{ success: boolean; error?: string }>;
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
  const [galleryImages, setGalleryImages] = useState<GalleryImage[]>(() => {
    try {
      const saved = localStorage.getItem('urmila_gallery_cache');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
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
        const savedCustomImages = localStorage.getItem('urmila_custom_images');
        let parsedPrices: Record<string, number | null> = {};
        let parsedImages: Record<string, string | null> = {};
        try {
          if (savedCustomPrices) parsedPrices = JSON.parse(savedCustomPrices);
          if (savedCustomImages) parsedImages = JSON.parse(savedCustomImages);
        } catch {}

        setMenuItems(prev =>
          prev.map(it => {
            let updated = { ...it };
            if (parsedPrices[it.id] !== undefined) updated.price = parsedPrices[it.id];
            if (parsedImages[it.id] !== undefined) updated.image_url = parsedImages[it.id];
            return updated;
          })
        );
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
        // Overlay local custom prices and images so changes are immediately persistent across refreshes
        let parsedPrices: Record<string, number | null> = {};
        let parsedImages: Record<string, string | null> = {};
        let parsedAvail: Record<string, boolean> = {};
        let parsedBestseller: Record<string, boolean> = {};
        try {
          const sp = localStorage.getItem('urmila_custom_prices');
          const si = localStorage.getItem('urmila_custom_images');
          const sa = localStorage.getItem('urmila_custom_avail');
          const sb = localStorage.getItem('urmila_custom_bestseller');
          if (sp) parsedPrices = JSON.parse(sp);
          if (si) parsedImages = JSON.parse(si);
          if (sa) parsedAvail = JSON.parse(sa);
          if (sb) parsedBestseller = JSON.parse(sb);
        } catch {}

        setMenuItems(
          itemData.map(it => {
            let updated = { ...it };
            if (parsedPrices[it.id] !== undefined) updated.price = parsedPrices[it.id];
            if (parsedImages[it.id] !== undefined) updated.image_url = parsedImages[it.id];
            if (parsedAvail[it.id] !== undefined) updated.is_available = parsedAvail[it.id];
            if (parsedBestseller[it.id] !== undefined) updated.is_bestseller = parsedBestseller[it.id];
            return updated;
          })
        );
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
        // Overlay any locally cached updates if present
        try {
          const cachedSettings = localStorage.getItem('urmila_settings_cache');
          if (cachedSettings) {
            setSettings({ ...settingsData, ...JSON.parse(cachedSettings) });
          } else {
            setSettings(settingsData);
          }
        } catch {
          setSettings(settingsData);
        }
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

      // 7. Fetch reviews (fetch all for context)
      const { data: revData } = await supabase
        .from('customer_reviews')
        .select('*')
        .order('created_at', { ascending: false });
      if (revData && revData.length > 0) {
        setReviews(revData);
      }

      // 8. Fetch gallery images
      const { data: galleryData } = await supabase
        .from('gallery_images')
        .select('*')
        .order('display_order', { ascending: true });
      if (galleryData && galleryData.length > 0) {
        setGalleryImages(galleryData);
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
      // 1. Try owner RPC
      const { data: rpcData, error: rpcError } = await supabase.rpc('owner_update_menu_item_price', {
        p_item_id: itemId,
        p_price: newPrice,
      });

      if (rpcError) {
        console.warn('owner_update_menu_item_price RPC failed, trying direct table update:', rpcError.message);
        const { error } = await supabase
          .from('menu_items')
          .update({ price: newPrice, updated_at: new Date().toISOString() })
          .eq('id', itemId);
        if (error) {
          return { success: false, error: error.message };
        }
      }
    }
    return { success: true };
  };

  // Update Menu Item Image
  const updateMenuItemImage = async (itemId: string, imageUrl: string | null) => {
    setMenuItems(prev =>
      prev.map(it => (it.id === itemId ? { ...it, image_url: imageUrl } : it))
    );

    // Save in local cache for offline/fallback
    try {
      const saved = JSON.parse(localStorage.getItem('urmila_custom_images') || '{}');
      saved[itemId] = imageUrl;
      localStorage.setItem('urmila_custom_images', JSON.stringify(saved));
    } catch {}

    if (!isUsingFallback) {
      const { error: rpcError } = await supabase.rpc('owner_update_menu_item_image', {
        p_item_id: itemId,
        p_image_url: imageUrl,
      });

      if (rpcError) {
        const { error } = await supabase
          .from('menu_items')
          .update({ image_url: imageUrl, updated_at: new Date().toISOString() })
          .eq('id', itemId);
        if (error) {
          return { success: false, error: error.message };
        }
      }
    }
    return { success: true };
  };

  // Toggle Availability
  const toggleMenuItemAvailability = async (itemId: string, isAvailable: boolean) => {
    setMenuItems(prev =>
      prev.map(it => (it.id === itemId ? { ...it, is_available: isAvailable } : it))
    );

    try {
      const saved = JSON.parse(localStorage.getItem('urmila_custom_avail') || '{}');
      saved[itemId] = isAvailable;
      localStorage.setItem('urmila_custom_avail', JSON.stringify(saved));
    } catch {}

    if (!isUsingFallback) {
      const { error: rpcError } = await supabase.rpc('owner_toggle_item_availability', {
        p_item_id: itemId,
        p_is_available: isAvailable,
      });

      if (rpcError) {
        const { error } = await supabase
          .from('menu_items')
          .update({ is_available: isAvailable, updated_at: new Date().toISOString() })
          .eq('id', itemId);
        if (error) {
          return { success: false, error: error.message };
        }
      }
    }
    return { success: true };
  };

  // Toggle Bestseller
  const toggleMenuItemBestseller = async (itemId: string, isBestseller: boolean) => {
    setMenuItems(prev =>
      prev.map(it => (it.id === itemId ? { ...it, is_bestseller: isBestseller } : it))
    );

    try {
      const saved = JSON.parse(localStorage.getItem('urmila_custom_bestseller') || '{}');
      saved[itemId] = isBestseller;
      localStorage.setItem('urmila_custom_bestseller', JSON.stringify(saved));
    } catch {}

    if (!isUsingFallback) {
      const { error: rpcError } = await supabase.rpc('owner_toggle_item_bestseller', {
        p_item_id: itemId,
        p_is_bestseller: isBestseller,
      });

      if (rpcError) {
        const { error } = await supabase
          .from('menu_items')
          .update({ is_bestseller: isBestseller, updated_at: new Date().toISOString() })
          .eq('id', itemId);
        if (error) {
          return { success: false, error: error.message };
        }
      }
    }
    return { success: true };
  };

  // Update Settings
  const updateSettings = async (newSettings: Partial<BusinessSettings>) => {
    setSettings(prev => {
      const updated = { ...prev, ...newSettings };
      try {
        localStorage.setItem('urmila_settings_cache', JSON.stringify(updated));
      } catch {}
      return updated;
    });

    if (!isUsingFallback) {
      const { error: rpcError } = await supabase.rpc('owner_update_business_settings', {
        p_whatsapp_number: newSettings.whatsapp_number ?? null,
        p_contact_phone: newSettings.contact_phone ?? null,
        p_cutoff_time: newSettings.default_cutoff_time ?? null,
        p_delivery_charge: newSettings.delivery_charge !== undefined ? newSettings.delivery_charge : null,
        p_address: newSettings.address ?? null,
      });

      if (rpcError && settings.id) {
        const { error } = await supabase
          .from('business_settings')
          .update({ ...newSettings, updated_at: new Date().toISOString() })
          .eq('id', settings.id);
        if (error) {
          console.warn('Supabase business_settings update warning:', error.message);
        }
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

  // Add Gallery Image
  const addGalleryImage = async (image: Omit<GalleryImage, 'id' | 'created_at'>) => {
    const tempId = `gallery-${Date.now()}`;
    const newEntry: GalleryImage = {
      ...image,
      id: tempId,
      created_at: new Date().toISOString(),
    };
    setGalleryImages(prev => {
      const updated = [newEntry, ...prev];
      try {
        localStorage.setItem('urmila_gallery_cache', JSON.stringify(updated));
      } catch {}
      return updated;
    });

    if (!isUsingFallback) {
      const { data, error } = await supabase
        .from('gallery_images')
        .insert([image])
        .select()
        .single();
      if (error) {
        return { success: false, error: error.message };
      }
      if (data) {
        setGalleryImages(prev => {
          const updated = prev.map(img => (img.id === tempId ? data : img));
          try {
            localStorage.setItem('urmila_gallery_cache', JSON.stringify(updated));
          } catch {}
          return updated;
        });
      }
    }
    return { success: true };
  };

  // Delete Gallery Image
  const deleteGalleryImage = async (imageId: string) => {
    setGalleryImages(prev => {
      const updated = prev.filter(img => img.id !== imageId);
      try {
        localStorage.setItem('urmila_gallery_cache', JSON.stringify(updated));
      } catch {}
      return updated;
    });

    if (!isUsingFallback) {
      const { error } = await supabase.from('gallery_images').delete().eq('id', imageId);
      if (error) {
        return { success: false, error: error.message };
      }
    }
    return { success: true };
  };

  // Update Gallery Image
  const updateGalleryImage = async (imageId: string, updates: Partial<GalleryImage>) => {
    setGalleryImages(prev => {
      const updated = prev.map(img => (img.id === imageId ? { ...img, ...updates } : img));
      try {
        localStorage.setItem('urmila_gallery_cache', JSON.stringify(updated));
      } catch {}
      return updated;
    });

    if (!isUsingFallback) {
      const { error } = await supabase
        .from('gallery_images')
        .update(updates)
        .eq('id', imageId);
      if (error) {
        return { success: false, error: error.message };
      }
    }
    return { success: true };
  };

  // Submit Review (Customer facing)
  const submitReview = async (review: Omit<CustomerReview, 'id' | 'created_at' | 'is_approved' | 'is_featured'>) => {
    const tempId = `rev-${Date.now()}`;
    const newEntry: CustomerReview = {
      ...review,
      id: tempId,
      is_approved: false, // requires owner approval
      is_featured: false,
      created_at: new Date().toISOString(),
    };

    setReviews(prev => [newEntry, ...prev]);

    if (!isUsingFallback) {
      const { data, error } = await supabase
        .from('customer_reviews')
        .insert([{
          customer_name: review.customer_name,
          rating: review.rating,
          review_text: review.review_text,
          dish_highlight: review.dish_highlight,
          event_type: review.event_type,
          image_url: review.image_url,
          is_approved: false,
          is_featured: false,
        }])
        .select()
        .single();
      if (error) {
        return { success: false, error: error.message };
      }
      if (data) {
        setReviews(prev => prev.map(r => (r.id === tempId ? data : r)));
      }
    }
    return { success: true };
  };

  // Approve / Unapprove Review (Owner facing)
  const approveReview = async (reviewId: string, isApproved: boolean) => {
    setReviews(prev =>
      prev.map(r => (r.id === reviewId ? { ...r, is_approved: isApproved } : r))
    );

    if (!isUsingFallback) {
      const { error } = await supabase
        .from('customer_reviews')
        .update({ is_approved: isApproved })
        .eq('id', reviewId);
      if (error) {
        return { success: false, error: error.message };
      }
    }
    return { success: true };
  };

  // Delete Review
  const deleteReview = async (reviewId: string) => {
    setReviews(prev => prev.filter(r => r.id !== reviewId));

    if (!isUsingFallback) {
      const { error } = await supabase.from('customer_reviews').delete().eq('id', reviewId);
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
        galleryImages,
        isLoading,
        isUsingFallback,
        refreshData: fetchData,
        updateMenuItemPrice,
        updateMenuItemImage,
        toggleMenuItemAvailability,
        toggleMenuItemBestseller,
        updateSettings,
        addClosure,
        deleteClosure,
        toggleScheduleDay,
        addGalleryImage,
        deleteGalleryImage,
        updateGalleryImage,
        submitReview,
        approveReview,
        deleteReview,
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

