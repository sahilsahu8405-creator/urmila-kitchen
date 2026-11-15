import React, { useState, useEffect } from 'react';
import { useSettings } from '../../context/SettingsContext';
import { uploadImageFile } from '../../lib/storage';
import {
  X,
  Plus,
  Camera,
  FolderPlus,
  Utensils,
  CheckCircle2,
  AlertCircle,
  Leaf,
  Sparkles,
} from 'lucide-react';

interface AddDishModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialCategoryId?: string | null;
}

export const AddDishModal: React.FC<AddDishModalProps> = ({
  isOpen,
  onClose,
  initialCategoryId,
}) => {
  const { categories, addMenuItem, addCategory } = useSettings();

  const [dishName, setDishName] = useState('');
  const [selectedCatId, setSelectedCatId] = useState('');
  const [dishPrice, setDishPrice] = useState('');
  const [dishDesc, setDishDesc] = useState('');
  const [dishImageUrl, setDishImageUrl] = useState('');
  const [isVeg, setIsVeg] = useState(true);
  const [isPartySpecial, setIsPartySpecial] = useState(false);

  // Inline Category Creator
  const [isCreatingCategory, setIsCreatingCategory] = useState(false);
  const [newCatName, setNewCatName] = useState('');
  const [isSavingCategory, setIsSavingCategory] = useState(false);

  // Photo Upload State
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);

  // Submission State
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Initialize selected category
  useEffect(() => {
    if (initialCategoryId && initialCategoryId !== 'all') {
      setSelectedCatId(initialCategoryId);
    } else if (categories.length > 0 && !selectedCatId) {
      setSelectedCatId(categories[0].id);
    }
  }, [initialCategoryId, categories, selectedCatId]);

  if (!isOpen) return null;

  const handleCreateInlineCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const clean = newCatName.trim();
    if (!clean) return;

    setIsSavingCategory(true);
    try {
      const res = await addCategory({ name: clean });
      if (res.success && res.category) {
        setSelectedCatId(res.category.id);
        setNewCatName('');
        setIsCreatingCategory(false);
      } else {
        alert(res.error || 'Failed to create category.');
      }
    } catch (err: any) {
      alert(err?.message || 'Error creating category.');
    } finally {
      setIsSavingCategory(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    const cleanName = dishName.trim();
    if (!cleanName) {
      setErrorMessage('Please enter a dish name.');
      return;
    }

    const catId = selectedCatId || categories[0]?.id;
    if (!catId) {
      setErrorMessage('Please select or create a category first.');
      return;
    }

    const parsedPrice = dishPrice.trim() !== '' ? Number(dishPrice) : null;
    if (parsedPrice !== null && (isNaN(parsedPrice) || parsedPrice <= 0)) {
      setErrorMessage('Please enter a valid price greater than ₹0, or leave blank.');
      return;
    }

    setIsSubmitting(true);

    try {
      // 1. Upload photo if selected
      let finalImageUrl = dishImageUrl.trim() || null;
      if (photoFile) {
        const uploadRes = await uploadImageFile(photoFile, 'product-images');
        if (uploadRes.success && uploadRes.url) {
          finalImageUrl = uploadRes.url;
        } else {
          console.warn('Photo upload warning:', uploadRes.error);
        }
      }

      // 2. Add dish to catalog
      const res = await addMenuItem({
        name: cleanName,
        category_id: catId,
        price: parsedPrice,
        description: dishDesc.trim() || null,
        image_url: finalImageUrl,
        is_available: true,
        is_bestseller: false,
        is_party_special: isPartySpecial,
        dietary_flags: { is_veg: isVeg },
        min_party_qty: 'For 10+ guests',
        display_order: 999,
      });

      if (res.success) {
        setSuccessMessage(`"${cleanName}" added to menu successfully!`);
        // Clean form
        setDishName('');
        setDishPrice('');
        setDishDesc('');
        setDishImageUrl('');
        setPhotoFile(null);
        if (photoPreview) URL.revokeObjectURL(photoPreview);
        setPhotoPreview(null);

        setTimeout(() => {
          onClose();
        }, 1200);
      } else {
        setErrorMessage(res.error || 'Failed to add dish to menu.');
      }
    } catch (err: any) {
      setErrorMessage(err?.message || 'Error adding dish.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-charcoal/60 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="bg-cream rounded-3xl border border-borderLight p-6 sm:p-7 max-w-lg w-full shadow-modal space-y-5 max-h-[92vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-3.5 border-b border-borderLight">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-forest text-cream flex items-center justify-center shadow-xs">
              <Utensils className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-serif text-xl font-bold text-forest">Add New Dish</h3>
              <p className="text-xs text-charcoal/60">
                Publish a new culinary creation to your digital menu catalog.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-charcoal/40 hover:text-charcoal hover:bg-cream-dark/50 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Feedback Alerts */}
        {errorMessage && (
          <div className="p-3 rounded-xl bg-terracotta/10 border border-terracotta/20 text-terracotta text-xs font-semibold flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}
        {successMessage && (
          <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{successMessage}</span>
          </div>
        )}

        {/* Main Form */}
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          {/* Dish Name */}
          <div>
            <label className="block text-[11px] font-bold text-charcoal/80 uppercase tracking-wider mb-1">
              Dish Name *
            </label>
            <input
              type="text"
              required
              value={dishName}
              onChange={(e) => setDishName(e.target.value)}
              placeholder="e.g. Kashmiri Dum Aloo, Special Dal Makhani, etc."
              className="w-full px-3.5 py-2.5 rounded-xl bg-cream-light border border-borderLight text-xs text-charcoal focus:outline-none focus:ring-2 focus:ring-forest/30 font-medium"
            />
          </div>

          {/* Category Dropdown + Inline Creator */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-[11px] font-bold text-charcoal/80 uppercase tracking-wider">
                Category *
              </label>
              <button
                type="button"
                onClick={() => setIsCreatingCategory(!isCreatingCategory)}
                className="text-[11px] font-bold text-forest hover:text-forest-light flex items-center gap-1 transition-colors"
              >
                <FolderPlus className="w-3.5 h-3.5" />
                <span>{isCreatingCategory ? 'Cancel' : '+ New Category'}</span>
              </button>
            </div>

            {/* Inline Quick Category Creator */}
            {isCreatingCategory && (
              <div className="p-3 mb-2 rounded-xl bg-forest/5 border border-forest/20 space-y-2 animate-in fade-in duration-150">
                <span className="text-[10px] uppercase font-bold text-forest block">
                  Quick-Create New Category
                </span>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={newCatName}
                    onChange={(e) => setNewCatName(e.target.value)}
                    placeholder="Enter new category name..."
                    className="flex-1 px-3 py-1.5 rounded-lg bg-cream border border-forest/30 text-xs text-charcoal focus:outline-none"
                  />
                  <button
                    type="button"
                    disabled={isSavingCategory || !newCatName.trim()}
                    onClick={handleCreateInlineCategory}
                    className="px-3 py-1.5 rounded-lg bg-forest text-cream font-bold text-xs hover:bg-forest-light disabled:opacity-50 shrink-0"
                  >
                    {isSavingCategory ? 'Adding...' : 'Add'}
                  </button>
                </div>
              </div>
            )}

            <select
              value={selectedCatId}
              onChange={(e) => setSelectedCatId(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-cream-light border border-borderLight text-xs text-charcoal focus:outline-none focus:ring-2 focus:ring-forest/30 font-medium"
            >
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          {/* Price & Dietary Tag Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Price (₹) */}
            <div>
              <label className="block text-[11px] font-bold text-charcoal/80 uppercase tracking-wider mb-1">
                Online Price (₹)
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 font-bold text-forest text-xs">
                  ₹
                </span>
                <input
                  type="number"
                  min="1"
                  value={dishPrice}
                  onChange={(e) => setDishPrice(e.target.value)}
                  placeholder="e.g. 250"
                  className="w-full pl-7 pr-3.5 py-2.5 rounded-xl bg-cream-light border border-borderLight text-xs text-charcoal focus:outline-none focus:ring-2 focus:ring-forest/30 font-medium"
                />
              </div>
              <p className="text-[10px] text-charcoal/50 mt-1">
                Leave blank if available only for bulk party orders.
              </p>
            </div>

            {/* Veg / Non-Veg Toggle */}
            <div>
              <label className="block text-[11px] font-bold text-charcoal/80 uppercase tracking-wider mb-1">
                Dietary Preference
              </label>
              <div className="grid grid-cols-2 gap-2 h-10">
                <button
                  type="button"
                  onClick={() => setIsVeg(true)}
                  className={`flex items-center justify-center gap-1.5 rounded-xl border text-xs font-bold transition-all ${
                    isVeg
                      ? 'bg-emerald-50 text-emerald-800 border-emerald-300 shadow-2xs'
                      : 'bg-cream-light text-charcoal/50 border-borderLight'
                  }`}
                >
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-600 inline-block" />
                  <span>Pure Veg</span>
                </button>
                <button
                  type="button"
                  onClick={() => setIsVeg(false)}
                  className={`flex items-center justify-center gap-1.5 rounded-xl border text-xs font-bold transition-all ${
                    !isVeg
                      ? 'bg-rose-50 text-rose-800 border-rose-300 shadow-2xs'
                      : 'bg-cream-light text-charcoal/50 border-borderLight'
                  }`}
                >
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-600 inline-block" />
                  <span>Non-Veg</span>
                </button>
              </div>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-[11px] font-bold text-charcoal/80 uppercase tracking-wider mb-1">
              Culinary Description
            </label>
            <textarea
              rows={2}
              value={dishDesc}
              onChange={(e) => setDishDesc(e.target.value)}
              placeholder="Describe ingredients, cooking style, aromas, and taste profile..."
              className="w-full px-3.5 py-2 rounded-xl bg-cream-light border border-borderLight text-xs text-charcoal focus:outline-none focus:ring-2 focus:ring-forest/30 resize-none font-medium"
            />
          </div>

          {/* Photo Uploader */}
          <div>
            <label className="block text-[11px] font-bold text-charcoal/80 uppercase tracking-wider mb-1">
              Dish Photograph
            </label>
            <div className="flex items-center gap-3">
              <label className="cursor-pointer px-4 py-2.5 rounded-xl bg-forest/10 hover:bg-forest/20 text-forest font-bold text-xs flex items-center gap-1.5 transition-colors border border-forest/20">
                <Camera className="w-4 h-4" />
                <span>{photoFile ? 'Change Picture' : 'Choose Photo / Camera'}</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      setPhotoFile(file);
                      setPhotoPreview(URL.createObjectURL(file));
                    }
                  }}
                  className="hidden"
                />
              </label>

              {photoPreview && (
                <div className="w-12 h-12 rounded-xl overflow-hidden border border-borderLight shrink-0 relative group">
                  <img src={photoPreview} alt="Preview" className="w-full h-full object-cover" />
                </div>
              )}
            </div>

            <p className="text-[10px] text-charcoal/50 mt-1.5">Or paste a photo URL below:</p>
            <input
              type="url"
              value={dishImageUrl}
              onChange={(e) => setDishImageUrl(e.target.value)}
              placeholder="https://..."
              className="w-full px-3 py-1.5 rounded-xl bg-cream-light border border-borderLight text-xs text-charcoal mt-1 focus:outline-none"
            />
          </div>

          {/* Modal Actions */}
          <div className="pt-3 border-t border-borderLight flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2.5 rounded-xl bg-cream-dark/50 hover:bg-cream-dark text-charcoal font-bold transition-all disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2.5 rounded-xl bg-forest text-cream font-bold hover:bg-forest-light transition-all flex items-center gap-1.5 shadow-sm disabled:opacity-50 active:scale-95"
            >
              <Plus className="w-4 h-4" />
              <span>{isSubmitting ? 'Adding Dish...' : 'Publish Dish to Menu'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
