import React, { useState, useRef } from 'react';
import { useSettings } from '../../context/SettingsContext';
import { MenuItem } from '../../types/database.types';
import { DishImage } from '../common/DishImage';
import { uploadImageFile } from '../../lib/storage';
import { AddCategoryModal } from './AddCategoryModal';
import { AddDishModal } from './AddDishModal';
import {
  Search,
  Plus,
  Edit2,
  Check,
  X,
  Sparkles,
  AlertCircle,
  Eye,
  EyeOff,
  Camera,
  Upload,
  Trash2,
  Utensils,
  CheckCircle2,
  ShoppingBag,
  FolderPlus,
} from 'lucide-react';

interface MenuTabProps {
  onOpenAddDishModal: () => void;
}

export const MenuTab: React.FC<MenuTabProps> = ({ onOpenAddDishModal }) => {
  const {
    categories,
    menuItems,
    deleteMenuItem,
    updateMenuItemPrice,
    updateMenuItemImage,
    toggleMenuItemAvailability,
    toggleMenuItemBestseller,
  } = useSettings();

  const [selectedCatId, setSelectedCatId] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [editingPriceId, setEditingPriceId] = useState<string | null>(null);
  const [priceInput, setPriceInput] = useState('');
  const [uploadingItemId, setUploadingItemId] = useState<string | null>(null);
  const [isAddCategoryOpen, setIsAddCategoryOpen] = useState(false);
  const [isAddDishModalOpen, setIsAddDishModalOpen] = useState(false);
  const [previewModal, setPreviewModal] = useState<{
    item: MenuItem;
    file: File;
    previewUrl: string;
  } | null>(null);
  const [isSavingImage, setIsSavingImage] = useState(false);
  const fileInputMap = useRef<{ [key: string]: HTMLInputElement | null }>({});

  const totalDishes = menuItems.length;
  const orderableCount = menuItems.filter(m => m.is_available && m.price !== null && m.price > 0).length;
  const bestsellersCount = menuItems.filter(m => m.is_bestseller).length;
  const unpricedCount = menuItems.filter(m => m.price === null || m.price <= 0).length;

  const filteredItems = menuItems.filter((item) => {
    const matchesCat = selectedCatId === 'all' ? true : item.category_id === selectedCatId;
    const matchesSearch = !searchQuery.trim()
      ? true
      : item.name.toLowerCase().includes(searchQuery.toLowerCase().trim());
    return matchesCat && matchesSearch;
  });

  const handleStartEditPrice = (item: MenuItem) => {
    setEditingPriceId(item.id);
    setPriceInput(item.price ? String(item.price) : '');
  };

  const handleSavePrice = async (itemId: string) => {
    const parsed = priceInput.trim() === '' ? null : Number(priceInput);
    if (parsed !== null && (isNaN(parsed) || parsed <= 0)) {
      alert('Please enter a valid price greater than 0, or leave blank for unpriced.');
      return;
    }
    await updateMenuItemPrice(itemId, parsed);
    setEditingPriceId(null);
  };

  const handleConfirmUpload = async () => {
    if (!previewModal) return;
    setIsSavingImage(true);
    setUploadingItemId(previewModal.item.id);
    try {
      const res = await uploadImageFile(previewModal.file, 'product-images');
      if (res.success && res.url) {
        await updateMenuItemImage(previewModal.item.id, res.url);
        URL.revokeObjectURL(previewModal.previewUrl);
        setPreviewModal(null);
      } else {
        alert(res.error || 'Failed to upload photo.');
      }
    } catch (err: any) {
      alert(err?.message || 'Error uploading photo.');
    } finally {
      setIsSavingImage(false);
      setUploadingItemId(null);
    }
  };

  const handleCancelPreview = () => {
    if (previewModal) {
      URL.revokeObjectURL(previewModal.previewUrl);
      setPreviewModal(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-serif text-2xl sm:text-3xl font-bold text-forest">Menu Management</h2>
          <p className="text-sm text-charcoal/70">
            Control dish availability, update prices, and designate bestsellers with 1-click.
          </p>
        </div>

        <div className="flex items-center gap-2.5 self-start sm:self-auto">
          <button
            type="button"
            onClick={() => setIsAddCategoryOpen(true)}
            className="px-4 py-2.5 rounded-full bg-cream-light border border-borderLight text-forest font-bold text-xs hover:bg-cream-dark transition-all flex items-center gap-2 shadow-2xs"
            title="Create or manage menu categories"
          >
            <FolderPlus className="w-4 h-4 text-forest" />
            <span>+ Add Category</span>
          </button>

          <button
            type="button"
            onClick={() => setIsAddDishModalOpen(true)}
            className="px-5 py-2.5 rounded-full bg-forest text-cream font-bold text-xs hover:bg-forest-light transition-all flex items-center gap-2 shadow-sm"
            title="Add a new dish to the menu"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Dish</span>
          </button>
        </div>
      </div>

      {/* Live Menu Status & Catalog Health Ribbon */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="p-4 rounded-2xl bg-cream-light border border-borderLight shadow-2xs flex items-center justify-between">
          <div>
            <p className="text-[11px] font-bold text-charcoal/60 uppercase tracking-wider">Total Catalog</p>
            <h4 className="font-serif text-2xl font-bold text-forest mt-0.5">{totalDishes} Dishes</h4>
            <p className="text-[10px] text-olive font-semibold mt-0.5">Across {categories.length} categories</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-forest/10 flex items-center justify-center text-forest shrink-0">
            <Utensils className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-cream-light border border-borderLight shadow-2xs flex items-center justify-between">
          <div>
            <p className="text-[11px] font-bold text-charcoal/60 uppercase tracking-wider">Live & Orderable</p>
            <h4 className="font-serif text-2xl font-bold text-emerald-800 mt-0.5">{orderableCount} Active</h4>
            <p className="text-[10px] text-emerald-700 font-semibold mt-0.5">Ready for online pre-orders</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-800 shrink-0">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-cream-light border border-borderLight shadow-2xs flex items-center justify-between">
          <div>
            <p className="text-[11px] font-bold text-charcoal/60 uppercase tracking-wider">Bestsellers</p>
            <h4 className="font-serif text-2xl font-bold text-amber-900 mt-0.5">{bestsellersCount} Featured</h4>
            <p className="text-[10px] text-amber-700 font-semibold mt-0.5">Starred on customer site</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center text-amber-800 shrink-0">
            <Sparkles className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-cream-light border border-borderLight shadow-2xs flex items-center justify-between">
          <div>
            <p className="text-[11px] font-bold text-charcoal/60 uppercase tracking-wider">Priced Items</p>
            <h4 className="font-serif text-2xl font-bold text-forest mt-0.5">{totalDishes - unpricedCount} / {totalDishes}</h4>
            <p className="text-[10px] text-charcoal/60 font-semibold mt-0.5">
              {unpricedCount > 0 ? `${unpricedCount} price pending` : 'All prices set'}
            </p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-cream-dark/50 flex items-center justify-center text-forest shrink-0">
            <ShoppingBag className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Search and Category Filter */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative flex-1">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search 68 authentic dishes..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-cream-light border border-borderLight text-xs text-charcoal focus:outline-none focus:ring-2 focus:ring-forest/30"
          />
          <Search className="w-4 h-4 text-charcoal/50 absolute left-3.5 top-1/2 -translate-y-1/2" />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
          <button
            onClick={() => setSelectedCatId('all')}
            className={`px-3 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
              selectedCatId === 'all'
                ? 'bg-forest text-cream shadow-2xs'
                : 'bg-cream-light text-charcoal border border-borderLight hover:bg-cream'
            }`}
          >
            All Categories ({menuItems.length})
          </button>
          {categories.map((cat) => {
            const count = menuItems.filter((m) => m.category_id === cat.id).length;
            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCatId(cat.id)}
                className={`px-3 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 ${
                  selectedCatId === cat.id
                    ? 'bg-forest text-cream shadow-2xs'
                    : 'bg-cream-light text-charcoal border border-borderLight hover:bg-cream'
                }`}
              >
                <span>{cat.name}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${
                    selectedCatId === cat.id
                      ? 'bg-cream/20 text-cream'
                      : 'bg-forest/10 text-forest'
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
          <button
            type="button"
            onClick={() => setIsAddCategoryOpen(true)}
            className="px-3 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all border border-dashed border-forest/40 text-forest bg-forest/5 hover:bg-forest/10 flex items-center gap-1"
            title="Create a new category"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New Category</span>
          </button>
        </div>
      </div>

      {/* Dishes List / Cards */}
      <div className="bg-cream-light rounded-2xl border border-borderLight divide-y divide-borderLight/70 overflow-hidden shadow-subtle">
        {filteredItems.map((item) => {
          const categoryName = categories.find((c) => c.id === item.category_id)?.name || 'General';
          const isPriced = item.price !== null && item.price > 0;
          const isEditingThisPrice = editingPriceId === item.id;

          return (
            <div
              key={item.id}
              className={`p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 transition-colors ${
                !item.is_available ? 'opacity-60 bg-cream/30' : 'hover:bg-cream/40'
              }`}
            >
              {/* Left Column: Details & Photo Uploader */}
              <div className="flex items-start gap-4">
                {/* Thumbnail with direct camera/file upload button */}
                <div className="relative group/thumb w-16 h-16 rounded-xl overflow-hidden bg-cream-dark/30 shrink-0 aspect-square border border-borderLight">
                  <DishImage
                    src={item.image_url}
                    alt={item.name}
                    categorySlug={categories.find(c => c.id === item.category_id)?.slug}
                    className="w-full h-full object-cover"
                  />

                  {/* Hover / Tap overlay to upload photo */}
                  <button
                    type="button"
                    onClick={() => fileInputMap.current[item.id]?.click()}
                    disabled={uploadingItemId === item.id}
                    className="absolute inset-0 bg-charcoal/60 backdrop-blur-xs opacity-0 group-hover/thumb:opacity-100 flex flex-col items-center justify-center text-cream text-[9px] font-bold transition-opacity"
                    title="Change / Upload Photograph"
                  >
                    <Camera className="w-4 h-4 mb-0.5" />
                    <span>{uploadingItemId === item.id ? 'Saving...' : 'Photo'}</span>
                  </button>

                  <input
                    ref={(el) => {
                      fileInputMap.current[item.id] = el;
                    }}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (!file) return;
                      const objectUrl = URL.createObjectURL(file);
                      setPreviewModal({ item, file, previewUrl: objectUrl });
                      e.target.value = '';
                    }}
                  />
                </div>

                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] uppercase font-bold text-olive tracking-wider bg-olive/10 px-2 py-0.5 rounded-full">
                      {categoryName}
                    </span>
                    {item.is_bestseller && (
                      <span className="text-[10px] uppercase font-bold text-forest tracking-wider bg-forest/10 px-2 py-0.5 rounded-full">
                        ★ Bestseller
                      </span>
                    )}
                  </div>
                  <h3 className="font-serif text-base sm:text-lg font-bold text-forest mt-1">
                    {item.name}
                  </h3>
                  <div className="flex items-center gap-3 mt-1">
                    <button
                      type="button"
                      onClick={() => fileInputMap.current[item.id]?.click()}
                      className="text-[11px] font-semibold text-olive hover:text-forest flex items-center gap-1"
                    >
                      <Camera className="w-3 h-3" />
                      <span>{item.image_url ? 'Change Photo' : 'Upload Photo'}</span>
                    </button>
                    {item.image_url && (
                      <button
                        type="button"
                        onClick={async () => {
                          if (confirm(`Remove custom photo from "${item.name}"?`)) {
                            await updateMenuItemImage(item.id, null);
                          }
                        }}
                        className="text-[11px] font-semibold text-charcoal/40 hover:text-terracotta"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Right Column: Price & 1-Click Controls */}
              <div className="flex flex-wrap items-center justify-between md:justify-end gap-3 pt-2 md:pt-0 border-t md:border-t-0 border-borderLight/60">
                {/* Price Display / Inline Edit */}
                <div className="mr-2">
                  {isEditingThisPrice ? (
                    <div className="flex items-center gap-1.5">
                      <span className="text-sm font-bold text-forest">₹</span>
                      <input
                        type="number"
                        min="1"
                        autoFocus
                        value={priceInput}
                        onChange={(e) => setPriceInput(e.target.value)}
                        placeholder="Price"
                        className="w-20 px-2.5 py-1 text-sm font-bold rounded-lg bg-cream border border-forest text-forest focus:outline-none"
                      />
                      <button
                        onClick={() => handleSavePrice(item.id)}
                        className="p-1.5 rounded-lg bg-forest text-cream hover:bg-forest-light"
                      >
                        <Check className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => setEditingPriceId(null)}
                        className="p-1.5 rounded-lg bg-cream-dark/50 text-charcoal hover:bg-cream-dark"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => handleStartEditPrice(item)}
                      className="group flex items-center gap-1.5 text-left p-1.5 rounded-xl hover:bg-cream border border-transparent hover:border-borderLight transition-all"
                    >
                      {isPriced ? (
                        <div>
                          <span className="text-[10px] text-charcoal/50 block font-semibold uppercase">Online Price</span>
                          <span className="font-serif text-lg font-bold text-forest group-hover:text-forest-light">
                            ₹{item.price}
                          </span>
                        </div>
                      ) : (
                        <div className="bg-amber-100/70 border border-amber-300 px-3 py-1 rounded-lg">
                          <span className="text-xs font-bold text-amber-900 flex items-center gap-1">
                            <span>Set Price</span>
                            <Edit2 className="w-3 h-3 text-amber-800" />
                          </span>
                        </div>
                      )}
                    </button>
                  )}
                </div>

                {/* 1-Click Bestseller Toggle */}
                <button
                  type="button"
                  onClick={() => toggleMenuItemBestseller(item.id, !item.is_bestseller)}
                  className={`px-3 py-2 rounded-xl text-xs font-bold transition-all border ${
                    item.is_bestseller
                      ? 'bg-amber-100 text-amber-900 border-amber-300'
                      : 'bg-cream text-charcoal/60 border-borderLight hover:bg-cream-dark/40'
                  }`}
                  title="Toggle Bestseller status on homepage"
                >
                  {item.is_bestseller ? '★ Bestseller' : '☆ Make Bestseller'}
                </button>

                {/* 1-Click Availability Toggle */}
                <button
                  type="button"
                  onClick={() => toggleMenuItemAvailability(item.id, !item.is_available)}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                    item.is_available
                      ? 'bg-emerald-700 text-cream hover:bg-emerald-600 shadow-sm'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  {item.is_available ? (
                    <>
                      <Eye className="w-3.5 h-3.5" />
                      <span>Available</span>
                    </>
                  ) : (
                    <>
                      <EyeOff className="w-3.5 h-3.5" />
                      <span>Out of Stock</span>
                    </>
                  )}
                </button>

                {/* Delete Dish Button */}
                <button
                  type="button"
                  onClick={async () => {
                    if (confirm(`Are you sure you want to delete "${item.name}" from the menu?`)) {
                      await deleteMenuItem(item.id);
                    }
                  }}
                  className="p-2 rounded-xl text-charcoal/40 hover:text-terracotta hover:bg-terracotta/10 transition-colors"
                  title={`Delete "${item.name}" from menu`}
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          );
        })}

        {/* Empty State when no dishes match */}
        {filteredItems.length === 0 && (
          <div className="p-10 sm:p-14 text-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-forest/10 text-forest mx-auto flex items-center justify-center">
              <Utensils className="w-6 h-6" />
            </div>
            <h4 className="font-serif font-bold text-forest text-base sm:text-lg">
              No dishes found in this category
            </h4>
            <p className="text-xs text-charcoal/60 max-w-sm mx-auto">
              {searchQuery
                ? `No dishes matching "${searchQuery}". Try a different keyword.`
                : 'This category is currently empty. Click below to add your first dish here!'}
            </p>
            <button
              type="button"
              onClick={() => setIsAddDishModalOpen(true)}
              className="px-5 py-2.5 rounded-full bg-forest text-cream font-bold text-xs hover:bg-forest-light transition-all inline-flex items-center gap-1.5 shadow-sm"
            >
              <Plus className="w-4 h-4" />
              <span>Add Dish to This Category</span>
            </button>
          </div>
        )}
      </div>

      {/* Add Category Modal */}
      <AddCategoryModal
        isOpen={isAddCategoryOpen}
        onClose={() => setIsAddCategoryOpen(false)}
        onCategoryCreated={(newId) => setSelectedCatId(newId)}
      />

      {/* Add Dish Modal */}
      <AddDishModal
        isOpen={isAddDishModalOpen}
        onClose={() => setIsAddDishModalOpen(false)}
        initialCategoryId={selectedCatId !== 'all' ? selectedCatId : null}
      />

      {/* Image Preview & Confirmation Modal before saving */}
      {previewModal && (
        <div className="fixed inset-0 z-50 bg-charcoal/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-cream rounded-3xl border border-borderLight shadow-modal max-w-md w-full overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-borderLight flex items-center justify-between">
              <div>
                <h3 className="font-serif text-xl font-bold text-forest">Preview Dish Photograph</h3>
                <p className="text-xs text-charcoal/70 mt-0.5">
                  Confirm photo for <strong>{previewModal.item.name}</strong>
                </p>
              </div>
              <button
                type="button"
                onClick={handleCancelPreview}
                disabled={isSavingImage}
                className="p-1 rounded-full hover:bg-cream-dark/50 text-charcoal/50 hover:text-charcoal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              {/* Square Preview Container */}
              <div className="relative aspect-square w-full rounded-2xl overflow-hidden border border-borderLight bg-cream-dark/30 shadow-subtle">
                <img
                  src={previewModal.previewUrl}
                  alt={previewModal.item.name}
                  className="w-full h-full object-cover"
                />
                {/* Pure Veg Indicator */}
                <div className="absolute top-3 right-3 bg-cream/95 backdrop-blur-sm p-1 rounded border border-borderLight shadow-sm">
                  <div className="w-3.5 h-3.5 border border-emerald-700 flex items-center justify-center">
                    <span className="w-2 h-2 rounded-full bg-emerald-700" />
                  </div>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-forest/5 border border-forest/10 flex items-start gap-2.5 text-xs text-forest">
                <Sparkles className="w-4 h-4 shrink-0 mt-0.5" />
                <p>
                  This photo will be displayed across menu cards, search results, customer modals, and cart summaries.
                </p>
              </div>
            </div>

            <div className="p-4 bg-cream-light border-t border-borderLight flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={handleCancelPreview}
                disabled={isSavingImage}
                className="px-4 py-2.5 rounded-full text-xs font-semibold text-charcoal/70 hover:bg-cream-dark/40"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmUpload}
                disabled={isSavingImage}
                className="px-6 py-2.5 rounded-full bg-forest text-cream text-xs font-bold hover:bg-forest-light transition-all flex items-center gap-2 shadow-sm disabled:opacity-50"
              >
                {isSavingImage ? (
                  <>
                    <span className="w-3.5 h-3.5 border-2 border-cream/30 border-t-cream rounded-full animate-spin" />
                    <span>Uploading & Saving...</span>
                  </>
                ) : (
                  <>
                    <Upload className="w-3.5 h-3.5" />
                    <span>Save Photo to Dish</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

