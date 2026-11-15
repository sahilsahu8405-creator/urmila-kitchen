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
  INITIAL_GALLERY_IMAGES,
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
  addMenuItem: (item: Omit<MenuItem, 'id' | 'created_at'>) => Promise<{ success: boolean; item?: MenuItem; error?: string }>;
  deleteMenuItem: (itemId: string) => Promise<{ success: boolean; error?: string }>;
  addCategory: (category: { name: string; description?: string | null }) => Promise<{ success: boolean; category?: Category; error?: string }>;
  deleteCategory: (categoryId: string) => Promise<{ success: boolean; error?: string }>;
  updateMenuItemPrice: (itemId: string, newPrice: number | null) => Promise<{ success: boolean; error?: string }>;
  updateMenuItemImage: (itemId: string, imageUrl: string | null) => Promise<{ success: boolean; error?: string }>;
  toggleMenuItemAvailability: (itemId: string, isAvailable: boolean) => Promise<{ success: boolean; error?: string }>;
  toggleMenuItemBestseller: (itemId: string, isBestseller: boolean) => Promise<{ success: boolean; error?: string }>;
  updateSettings: (newSettings: Partial<BusinessSettings>) => Promise<{ success: boolean; error?: string }>;
  updateDeliverySlot: (slotId: string, updates: Partial<DeliverySlot>) => Promise<{ success: boolean; error?: string }>;
  addDeliverySlot: (slot: Omit<DeliverySlot, 'id' | 'created_at'>) => Promise<{ success: boolean; error?: string }>;
  deleteDeliverySlot: (slotId: string) => Promise<{ success: boolean; error?: string }>;
  resetDeliverySlots: () => Promise<{ success: boolean; error?: string }>;
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

const GALLERY_MANIFEST_URL = 'https://crtqlfpebjtqkiemqnpp.supabase.co/storage/v1/object/public/gallery-images/meta/gallery_manifest.json';
const CUSTOM_MENU_MANIFEST_URL = 'https://crtqlfpebjtqkiemqnpp.supabase.co/storage/v1/object/public/gallery-images/meta/custom_menu_manifest.json';

interface CustomMenuManifest {
  customCategories: Category[];
  customDishes: MenuItem[];
  deletedItemIds: string[];
  deletedCategoryIds: string[];
  updatedAt: string;
}

const syncGalleryToCloud = async (images: GalleryImage[]) => {
  try {
    const payload = JSON.stringify(images, null, 2);
    const blob = new Blob([payload], { type: 'image/webp' });
    await supabase.storage.from('gallery-images').upload('meta/gallery_manifest.json', blob, {
      upsert: true,
      contentType: 'image/webp',
    });
  } catch (err) {
    console.warn('Notice: Gallery cloud sync error:', err);
  }
};

const syncMenuToCloud = async (manifest: CustomMenuManifest) => {
  try {
    const payload = JSON.stringify(manifest, null, 2);
    const blob = new Blob([payload], { type: 'image/webp' });
    try {
      await supabase.storage.from('gallery-images').remove(['meta/custom_menu_manifest.json']);
    } catch {}
    await supabase.storage.from('gallery-images').upload('meta/custom_menu_manifest.json', blob, {
      contentType: 'image/webp',
    });
  } catch (err) {
    console.warn('Notice: Menu cloud manifest sync error:', err);
  }
};

const broadcastGalleryChange = (images: GalleryImage[]) => {
  try {
    if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
      const channel = new BroadcastChannel('urmila_gallery_channel');
      channel.postMessage({ type: 'GALLERY_UPDATED', images });
      channel.close();
    }
  } catch {}
};

const broadcastMenuChange = (payload: any) => {
  try {
    if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
      const channel = new BroadcastChannel('urmila_menu_channel');
      channel.postMessage({ type: 'MENU_UPDATED', ...payload });
      channel.close();
    }
  } catch {}
};

const getStoredDeletedGalleryIds = (): string[] => {
  try {
    const raw = localStorage.getItem('urmila_deleted_gallery_ids');
    if (raw) return JSON.parse(raw);
  } catch {}
  return [];
};

const getStoredCustomCategories = (): Category[] => {
  try {
    const raw = localStorage.getItem('urmila_custom_categories_list');
    if (raw) {
      const parsed: Category[] = JSON.parse(raw);
      const cleaned = parsed.filter(
        (c) => c.id !== 'cat-test' && c.name?.toLowerCase() !== 'signature biryani'
      );
      if (cleaned.length !== parsed.length) {
        localStorage.setItem('urmila_custom_categories_list', JSON.stringify(cleaned));
      }
      return cleaned;
    }
  } catch {}
  return [];
};

const getStoredCustomDishes = (): MenuItem[] => {
  try {
    const raw = localStorage.getItem('urmila_custom_dishes_list');
    if (raw) {
      const parsed: MenuItem[] = JSON.parse(raw);
      const cleaned = parsed.filter(
        (d) => d.id !== 'dish-test' && d.name?.toLowerCase() !== 'dum biryani'
      );
      if (cleaned.length !== parsed.length) {
        localStorage.setItem('urmila_custom_dishes_list', JSON.stringify(cleaned));
      }
      return cleaned;
    }
  } catch {}
  return [];
};

const getStoredDeletedItemIds = (): string[] => {
  try {
    const raw = localStorage.getItem('urmila_deleted_item_ids');
    if (raw) return JSON.parse(raw);
  } catch {}
  return [];
};

const getStoredDeletedCategoryIds = (): string[] => {
  try {
    const raw = localStorage.getItem('urmila_deleted_category_ids');
    if (raw) return JSON.parse(raw);
  } catch {}
  return [];
};

export const SettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [categories, setCategories] = useState<Category[]>(INITIAL_CATEGORIES);
  const [menuItems, setMenuItems] = useState<MenuItem[]>(INITIAL_MENU_ITEMS);
  const [deliverySlots, setDeliverySlots] = useState<DeliverySlot[]>(() => {
    try {
      const saved = localStorage.getItem('urmila_slots_cache');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {}
    return INITIAL_DELIVERY_SLOTS;
  });
  const [settings, setSettings] = useState<BusinessSettings>(INITIAL_SETTINGS);
  const [schedules, setSchedules] = useState<BusinessSchedule[]>(INITIAL_SCHEDULES);
  const [closures, setClosures] = useState<BusinessClosure[]>([]);
  const [reviews, setReviews] = useState<CustomerReview[]>(INITIAL_REVIEWS);
  const [galleryImages, setGalleryImages] = useState<GalleryImage[]>(() => {
    try {
      const saved = localStorage.getItem('urmila_gallery_cache');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          return parsed;
        }
      }
      return INITIAL_GALLERY_IMAGES;
    } catch {
      return INITIAL_GALLERY_IMAGES;
    }
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isUsingFallback, setIsUsingFallback] = useState(false);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      // 0. Fetch custom menu manifest from cloud storage
      let cloudCustomCats: Category[] = [];
      let cloudCustomDishes: MenuItem[] = [];
      let cloudDeletedItemIds: string[] = [];
      let cloudDeletedCategoryIds: string[] = [];

      try {
        const manifestRes = await fetch(CUSTOM_MENU_MANIFEST_URL + '?t=' + Date.now(), {
          cache: 'no-store',
        });
        if (manifestRes.ok) {
          const manifestJson = await manifestRes.json();
          if (Array.isArray(manifestJson.customCategories)) {
            cloudCustomCats = manifestJson.customCategories.filter(
              (c: any) => c.id !== 'cat-test' && c.name?.toLowerCase() !== 'signature biryani'
            );
          }
          if (Array.isArray(manifestJson.customDishes)) {
            cloudCustomDishes = manifestJson.customDishes.filter(
              (d: any) => d.id !== 'dish-test' && d.name?.toLowerCase() !== 'dum biryani'
            );
          }
          if (Array.isArray(manifestJson.deletedItemIds)) cloudDeletedItemIds = manifestJson.deletedItemIds;
          if (Array.isArray(manifestJson.deletedCategoryIds)) cloudDeletedCategoryIds = manifestJson.deletedCategoryIds;
        }
      } catch (err) {
        // Fall back to local
      }

      // Merge local with cloud
      const localCustomCats = getStoredCustomCategories();
      const allCustomCatsMap = new Map<string, Category>();
      [...cloudCustomCats, ...localCustomCats].forEach((c) => allCustomCatsMap.set(c.id, c));
      const mergedCustomCats = Array.from(allCustomCatsMap.values());

      const localDeletedCatIds = getStoredDeletedCategoryIds();
      const allDeletedCatIds = Array.from(new Set([...cloudDeletedCategoryIds, ...localDeletedCatIds]));

      const localCustomDishes = getStoredCustomDishes();
      const allCustomDishesMap = new Map<string, MenuItem>();
      [...cloudCustomDishes, ...localCustomDishes].forEach((d) => allCustomDishesMap.set(d.id, d));
      const mergedCustomDishes = Array.from(allCustomDishesMap.values());

      const localDeletedDishIds = getStoredDeletedItemIds();
      const allDeletedDishIds = Array.from(new Set([...cloudDeletedItemIds, ...localDeletedDishIds]));

      // 1. Fetch categories from Supabase (or fallback)
      const { data: catData, error: catError } = await supabase
        .from('categories')
        .select('*')
        .order('display_order', { ascending: true });

      const baseCategories = (!catError && catData && catData.length > 0) ? catData : INITIAL_CATEGORIES;
      const combinedCatsMap = new Map<string, Category>();
      baseCategories.forEach((c) => combinedCatsMap.set(c.id, c));
      mergedCustomCats.forEach((c) => combinedCatsMap.set(c.id, c));

      const finalCategories = Array.from(combinedCatsMap.values()).filter(
        (c) => !allDeletedCatIds.includes(c.id)
      );
      setCategories(finalCategories);

      if (catError || !catData || catData.length === 0) {
        setIsUsingFallback(true);
      } else {
        setIsUsingFallback(false);
      }

      // 2. Fetch menu items
      const { data: itemData } = await supabase
        .from('menu_items')
        .select('*')
        .order('display_order', { ascending: true });

      const baseItems = (itemData && itemData.length > 0) ? itemData : INITIAL_MENU_ITEMS;
      const combinedItemsMap = new Map<string, MenuItem>();
      baseItems.forEach((m) => combinedItemsMap.set(m.id, m));
      mergedCustomDishes.forEach((m) => combinedItemsMap.set(m.id, m));

      const finalItemsList = Array.from(combinedItemsMap.values()).filter(
        (m) => !allDeletedDishIds.includes(m.id)
      );

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

      const initialMap = new Map(
        INITIAL_MENU_ITEMS.map((m) => [m.name.trim().toLowerCase(), m])
      );

      setMenuItems(
        finalItemsList.map((it) => {
          let updated = { ...it };
          const cleanName = (it.name || '').trim().toLowerCase();
          const matchedInit = initialMap.get(cleanName);

          // Restore unique culinary description if database value is null/empty
          if (!updated.description && matchedInit?.description) {
            updated.description = matchedInit.description;
          }

          // Restore curated image if database value is null
          if (!updated.image_url && matchedInit?.image_url) {
            updated.image_url = matchedInit.image_url;
          }

          if (parsedPrices[it.id] !== undefined) updated.price = parsedPrices[it.id];
          if (parsedImages[it.id] !== undefined) updated.image_url = parsedImages[it.id];
          if (parsedAvail[it.id] !== undefined) updated.is_available = parsedAvail[it.id];
          if (parsedBestseller[it.id] !== undefined) updated.is_bestseller = parsedBestseller[it.id];
          return updated;
        })
      );

      // 3. Fetch delivery slots
      const { data: slotData } = await supabase
        .from('delivery_slots')
        .select('*')
        .order('display_order', { ascending: true });
      if (slotData && slotData.length > 0) {
        try {
          const cached = localStorage.getItem('urmila_slots_cache');
          if (cached) {
            const parsed = JSON.parse(cached);
            if (Array.isArray(parsed) && parsed.length > 0) {
              setDeliverySlots(parsed);
            } else {
              setDeliverySlots(slotData);
            }
          } else {
            setDeliverySlots(slotData);
          }
        } catch {
          setDeliverySlots(slotData);
        }
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
      let manifestLoaded = false;
      try {
        const res = await fetch(`${GALLERY_MANIFEST_URL}?t=${Date.now()}`);
        if (res.ok) {
          const cloudManifest = await res.json();
          if (Array.isArray(cloudManifest)) {
            setGalleryImages(cloudManifest);
            try {
              localStorage.setItem('urmila_gallery_cache', JSON.stringify(cloudManifest));
              localStorage.setItem('urmila_gallery_customized', 'true');
            } catch {}
            manifestLoaded = true;
          }
        }
      } catch (err) {
        console.warn('Could not load cloud gallery manifest:', err);
      }

      if (!manifestLoaded) {
        const { data: galleryData } = await supabase
          .from('gallery_images')
          .select('*')
          .order('display_order', { ascending: true });

        const savedGallery = localStorage.getItem('urmila_gallery_cache');

        if (galleryData && galleryData.length > 0) {
          setGalleryImages(galleryData);
          try {
            localStorage.setItem('urmila_gallery_cache', JSON.stringify(galleryData));
          } catch {}
        } else if (savedGallery) {
          try {
            const parsed = JSON.parse(savedGallery);
            if (Array.isArray(parsed)) {
              setGalleryImages(parsed);
            } else {
              setGalleryImages(INITIAL_GALLERY_IMAGES);
            }
          } catch {
            setGalleryImages(INITIAL_GALLERY_IMAGES);
          }
        } else {
          setGalleryImages(INITIAL_GALLERY_IMAGES);
        }
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

    // Cross-tab real-time sync via BroadcastChannel
    let channel: BroadcastChannel | null = null;
    let menuChannel: BroadcastChannel | null = null;
    try {
      if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
        channel = new BroadcastChannel('urmila_gallery_channel');
        channel.onmessage = (event) => {
          if (event.data?.type === 'GALLERY_UPDATED' && Array.isArray(event.data.images)) {
            setGalleryImages(event.data.images);
          }
        };

        menuChannel = new BroadcastChannel('urmila_menu_channel');
        menuChannel.onmessage = (event) => {
          if (event.data?.type === 'MENU_UPDATED') {
            fetchData();
          }
        };
      }
    } catch {}

    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'urmila_gallery_cache' && e.newValue) {
        try {
          const parsed = JSON.parse(e.newValue);
          if (Array.isArray(parsed)) {
            setGalleryImages(parsed);
          }
        } catch {}
      }
      if (
        (e.key === 'urmila_custom_dishes_list' ||
          e.key === 'urmila_custom_categories_list' ||
          e.key === 'urmila_deleted_item_ids' ||
          e.key === 'urmila_deleted_category_ids') &&
        e.newValue
      ) {
        fetchData();
      }
    };

    const handleFocus = () => {
      fetch(`${GALLERY_MANIFEST_URL}?t=${Date.now()}`)
        .then((r) => (r.ok ? r.json() : null))
        .then((cloudManifest) => {
          if (Array.isArray(cloudManifest)) {
            setGalleryImages(cloudManifest);
            try {
              localStorage.setItem('urmila_gallery_cache', JSON.stringify(cloudManifest));
            } catch {}
          }
        })
        .catch(() => {});
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('focus', handleFocus);

    return () => {
      channel?.close();
      menuChannel?.close();
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('focus', handleFocus);
    };
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

  // Add Menu Item
  const addMenuItem = async (dish: Omit<MenuItem, 'id' | 'created_at'>) => {
    const tempId = `dish-${Date.now()}`;
    const newDish: MenuItem = {
      ...dish,
      id: tempId,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    // 1. Update State immediately
    setMenuItems((prev) => [...prev, newDish]);

    // 2. Persist to LocalStorage
    const currentCustom = getStoredCustomDishes();
    const updatedCustom = [...currentCustom, newDish];
    try {
      localStorage.setItem('urmila_custom_dishes_list', JSON.stringify(updatedCustom));
      if (newDish.price !== null) {
        const sp = JSON.parse(localStorage.getItem('urmila_custom_prices') || '{}');
        sp[tempId] = newDish.price;
        localStorage.setItem('urmila_custom_prices', JSON.stringify(sp));
      }
      if (newDish.image_url) {
        const si = JSON.parse(localStorage.getItem('urmila_custom_images') || '{}');
        si[tempId] = newDish.image_url;
        localStorage.setItem('urmila_custom_images', JSON.stringify(si));
      }
    } catch {}

    // 3. Sync to Cloud Storage Manifest
    const manifest: CustomMenuManifest = {
      customCategories: getStoredCustomCategories(),
      customDishes: updatedCustom,
      deletedItemIds: getStoredDeletedItemIds(),
      deletedCategoryIds: getStoredDeletedCategoryIds(),
      updatedAt: new Date().toISOString(),
    };
    await syncMenuToCloud(manifest);
    broadcastMenuChange({ dish: newDish });

    // 4. Attempt Supabase direct insert (if table policy permits)
    try {
      const { data: dbItem, error: dbErr } = await supabase
        .from('menu_items')
        .insert([dish])
        .select()
        .single();
      if (!dbErr && dbItem) {
        setMenuItems((prev) => prev.map((m) => (m.id === tempId ? dbItem : m)));
        const syncedCustom = updatedCustom.map((m) => (m.id === tempId ? dbItem : m));
        localStorage.setItem('urmila_custom_dishes_list', JSON.stringify(syncedCustom));
        manifest.customDishes = syncedCustom;
        await syncMenuToCloud(manifest);
        return { success: true, item: dbItem };
      }
    } catch (err) {
      console.warn('Notice: menu_items DB insert fallback to cloud storage:', err);
    }

    return { success: true, item: newDish };
  };

  // Delete Menu Item
  const deleteMenuItem = async (itemId: string) => {
    // 1. Update State immediately
    setMenuItems((prev) => prev.filter((m) => m.id !== itemId));

    // 2. Remove from custom dishes
    const currentCustom = getStoredCustomDishes().filter((m) => m.id !== itemId);
    localStorage.setItem('urmila_custom_dishes_list', JSON.stringify(currentCustom));

    // 3. Record in deleted list so default or DB item stays deleted
    const deleted = Array.from(new Set([...getStoredDeletedItemIds(), itemId]));
    localStorage.setItem('urmila_deleted_item_ids', JSON.stringify(deleted));

    // 4. Sync Cloud Manifest
    const manifest: CustomMenuManifest = {
      customCategories: getStoredCustomCategories(),
      customDishes: currentCustom,
      deletedItemIds: deleted,
      deletedCategoryIds: getStoredDeletedCategoryIds(),
      updatedAt: new Date().toISOString(),
    };
    await syncMenuToCloud(manifest);
    broadcastMenuChange({ deletedItemId: itemId });

    // 5. Attempt DB Delete
    try {
      await supabase.from('menu_items').delete().eq('id', itemId);
    } catch {}

    return { success: true };
  };

  // Add Category
  const addCategory = async (category: { name: string; description?: string | null }) => {
    const cleanName = category.name.trim();
    if (!cleanName) {
      return { success: false, error: 'Category name is required.' };
    }

    const slug =
      cleanName
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '') || `cat-${Date.now()}`;

    const tempId = `cat-${Date.now()}`;
    const newCategory: Category = {
      id: tempId,
      name: cleanName,
      slug,
      description: category.description || null,
      display_order: categories.length + 1,
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    // 1. Update State immediately
    setCategories((prev) => [...prev, newCategory]);

    // 2. Persist to LocalStorage
    const currentCustom = getStoredCustomCategories();
    const updatedCustom = [...currentCustom, newCategory];
    try {
      localStorage.setItem('urmila_custom_categories_list', JSON.stringify(updatedCustom));
    } catch {}

    // 3. Sync to Cloud Storage Manifest
    const manifest: CustomMenuManifest = {
      customCategories: updatedCustom,
      customDishes: getStoredCustomDishes(),
      deletedItemIds: getStoredDeletedItemIds(),
      deletedCategoryIds: getStoredDeletedCategoryIds(),
      updatedAt: new Date().toISOString(),
    };
    await syncMenuToCloud(manifest);
    broadcastMenuChange({ category: newCategory });

    // 4. Attempt Supabase direct insert
    try {
      const { data: dbCat, error: dbErr } = await supabase
        .from('categories')
        .insert([
          {
            name: newCategory.name,
            slug: newCategory.slug,
            description: newCategory.description,
            display_order: newCategory.display_order,
            is_active: true,
          },
        ])
        .select()
        .single();
      if (!dbErr && dbCat) {
        setCategories((prev) => prev.map((c) => (c.id === tempId ? dbCat : c)));
        const syncedCustom = updatedCustom.map((c) => (c.id === tempId ? dbCat : c));
        localStorage.setItem('urmila_custom_categories_list', JSON.stringify(syncedCustom));
        manifest.customCategories = syncedCustom;
        await syncMenuToCloud(manifest);
        return { success: true, category: dbCat };
      }
    } catch (err) {
      console.warn('Notice: categories DB insert fallback to cloud storage:', err);
    }

    return { success: true, category: newCategory };
  };

  // Delete Category
  const deleteCategory = async (categoryId: string) => {
    // Check if category has dishes
    const count = menuItems.filter((m) => m.category_id === categoryId).length;
    if (count > 0) {
      return {
        success: false,
        error: `Cannot delete category: it currently contains ${count} dish${count > 1 ? 'es' : ''}. Please move or delete the dishes first.`,
      };
    }

    // 1. Update State immediately
    setCategories((prev) => prev.filter((c) => c.id !== categoryId));

    // 2. Remove from custom categories
    const currentCustom = getStoredCustomCategories().filter((c) => c.id !== categoryId);
    localStorage.setItem('urmila_custom_categories_list', JSON.stringify(currentCustom));

    // 3. Add to deleted list
    const deleted = Array.from(new Set([...getStoredDeletedCategoryIds(), categoryId]));
    localStorage.setItem('urmila_deleted_category_ids', JSON.stringify(deleted));

    // 4. Sync Cloud Manifest
    const manifest: CustomMenuManifest = {
      customCategories: currentCustom,
      customDishes: getStoredCustomDishes(),
      deletedItemIds: getStoredDeletedItemIds(),
      deletedCategoryIds: deleted,
      updatedAt: new Date().toISOString(),
    };
    await syncMenuToCloud(manifest);
    broadcastMenuChange({ deletedCategoryId: categoryId });

    // 5. Attempt DB Delete
    try {
      await supabase.from('categories').delete().eq('id', categoryId);
    } catch {}

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
        const {
          fulfillment_mode,
          is_delivery_enabled,
          is_pickup_enabled,
          pickup_instructions,
          pickup_maps_url,
          ...dbSettings
        } = newSettings;
        const { error } = await supabase
          .from('business_settings')
          .update({ ...dbSettings, updated_at: new Date().toISOString() })
          .eq('id', settings.id);
        if (error) {
          console.warn('Supabase business_settings update warning:', error.message);
        }
      }
    }
    return { success: true };
  };

  // Update Delivery Slot
  const updateDeliverySlot = async (slotId: string, updates: Partial<DeliverySlot>) => {
    setDeliverySlots(prev => {
      const updated = prev.map(s => (s.id === slotId ? { ...s, ...updates } : s));
      try {
        localStorage.setItem('urmila_slots_cache', JSON.stringify(updated));
      } catch {}
      return updated;
    });

    if (!isUsingFallback) {
      const { error } = await supabase
        .from('delivery_slots')
        .update(updates)
        .eq('id', slotId);
      if (error) {
        console.warn('Supabase delivery_slots update notice:', error.message);
      }
    }
    return { success: true };
  };

  // Add Delivery Slot
  const addDeliverySlot = async (slot: Omit<DeliverySlot, 'id' | 'created_at'>) => {
    const tempId = `slot-${Date.now()}`;
    const newSlot: DeliverySlot = { ...slot, id: tempId, created_at: new Date().toISOString() };
    setDeliverySlots(prev => {
      const updated = [...prev, newSlot];
      try {
        localStorage.setItem('urmila_slots_cache', JSON.stringify(updated));
      } catch {}
      return updated;
    });

    if (!isUsingFallback) {
      const { data, error } = await supabase
        .from('delivery_slots')
        .insert([slot])
        .select()
        .single();
      if (!error && data) {
        setDeliverySlots(prev => prev.map(s => (s.id === tempId ? data : s)));
        try {
          const current = JSON.parse(localStorage.getItem('urmila_slots_cache') || '[]');
          const updated = current.map((s: any) => (s.id === tempId ? data : s));
          localStorage.setItem('urmila_slots_cache', JSON.stringify(updated));
        } catch {}
      }
    }
    return { success: true };
  };

  // Delete Delivery Slot
  const deleteDeliverySlot = async (slotId: string) => {
    setDeliverySlots(prev => {
      const updated = prev.filter(s => s.id !== slotId);
      try {
        localStorage.setItem('urmila_slots_cache', JSON.stringify(updated));
      } catch {}
      return updated;
    });

    if (!isUsingFallback) {
      const { error } = await supabase
        .from('delivery_slots')
        .delete()
        .eq('id', slotId);
      if (error) {
        console.warn('Supabase delivery_slots delete notice:', error.message);
      }
    }
    return { success: true };
  };

  // Reset Delivery Slots to System Defaults
  const resetDeliverySlots = async () => {
    setDeliverySlots(INITIAL_DELIVERY_SLOTS);
    try {
      localStorage.removeItem('urmila_slots_cache');
    } catch {}
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

    try {
      localStorage.setItem('urmila_gallery_customized', 'true');
    } catch {}

    const updated = [newEntry, ...galleryImages];
    setGalleryImages(updated);
    try {
      localStorage.setItem('urmila_gallery_cache', JSON.stringify(updated));
    } catch {}

    broadcastGalleryChange(updated);
    await syncGalleryToCloud(updated);

    if (!isUsingFallback) {
      try {
        const { data } = await supabase
          .from('gallery_images')
          .insert([image])
          .select()
          .single();
        if (data) {
          const finalUpdated = updated.map(img => (img.id === tempId ? data : img));
          setGalleryImages(finalUpdated);
          localStorage.setItem('urmila_gallery_cache', JSON.stringify(finalUpdated));
          broadcastGalleryChange(finalUpdated);
          await syncGalleryToCloud(finalUpdated);
        }
      } catch (err) {
        console.warn('Notice: gallery table insert fallback:', err);
      }
    }
    return { success: true };
  };

  // Delete Gallery Image
  const deleteGalleryImage = async (imageId: string) => {
    try {
      const deletedIds = getStoredDeletedGalleryIds();
      if (!deletedIds.includes(imageId)) {
        deletedIds.push(imageId);
        localStorage.setItem('urmila_deleted_gallery_ids', JSON.stringify(deletedIds));
      }
      localStorage.setItem('urmila_gallery_customized', 'true');
    } catch {}

    const updated = galleryImages.filter(img => img.id !== imageId);
    setGalleryImages(updated);
    try {
      localStorage.setItem('urmila_gallery_cache', JSON.stringify(updated));
    } catch {}

    broadcastGalleryChange(updated);
    await syncGalleryToCloud(updated);

    if (!isUsingFallback) {
      try {
        await supabase.from('gallery_images').delete().eq('id', imageId);
      } catch (err) {
        console.warn('Supabase gallery delete notice:', err);
      }
    }
    return { success: true };
  };

  // Update Gallery Image
  const updateGalleryImage = async (imageId: string, updates: Partial<GalleryImage>) => {
    const updated = galleryImages.map(img => (img.id === imageId ? { ...img, ...updates } : img));
    setGalleryImages(updated);
    try {
      localStorage.setItem('urmila_gallery_cache', JSON.stringify(updated));
    } catch {}

    broadcastGalleryChange(updated);
    await syncGalleryToCloud(updated);

    if (!isUsingFallback) {
      try {
        await supabase
          .from('gallery_images')
          .update(updates)
          .eq('id', imageId);
      } catch (err) {
        console.warn('Notice: gallery table update fallback:', err);
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
        addMenuItem,
        deleteMenuItem,
        addCategory,
        deleteCategory,
        updateMenuItemPrice,
        updateMenuItemImage,
        toggleMenuItemAvailability,
        toggleMenuItemBestseller,
        updateSettings,
        updateDeliverySlot,
        addDeliverySlot,
        deleteDeliverySlot,
        resetDeliverySlots,
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

