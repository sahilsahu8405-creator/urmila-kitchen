import React, { useState } from 'react';
import { useSettings } from '../../context/SettingsContext';
import { X, Plus, Trash2, FolderPlus, Layers, CheckCircle2, AlertCircle } from 'lucide-react';

interface AddCategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCategoryCreated?: (newCategoryId: string) => void;
}

export const AddCategoryModal: React.FC<AddCategoryModalProps> = ({
  isOpen,
  onClose,
  onCategoryCreated,
}) => {
  const { categories, menuItems, addCategory, deleteCategory } = useSettings();
  const [categoryName, setCategoryName] = useState('');
  const [categoryDesc, setCategoryDesc] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    const clean = categoryName.trim();
    if (!clean) {
      setErrorMessage('Please enter a category name.');
      return;
    }

    // Check for duplicate name
    const exists = categories.some((c) => c.name.toLowerCase() === clean.toLowerCase());
    if (exists) {
      setErrorMessage(`A category named "${clean}" already exists.`);
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await addCategory({
        name: clean,
        description: categoryDesc.trim() || null,
      });

      if (res.success && res.category) {
        setSuccessMessage(`Category "${clean}" created successfully!`);
        setCategoryName('');
        setCategoryDesc('');
        if (onCategoryCreated) {
          onCategoryCreated(res.category.id);
        }
        setTimeout(() => {
          setSuccessMessage(null);
        }, 2500);
      } else {
        setErrorMessage(res.error || 'Failed to create category.');
      }
    } catch (err: any) {
      setErrorMessage(err?.message || 'Error creating category.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (catId: string, catName: string) => {
    const dishCount = menuItems.filter((m) => m.category_id === catId).length;
    if (dishCount > 0) {
      alert(`Cannot delete "${catName}": It still contains ${dishCount} dish${dishCount > 1 ? 'es' : ''}. Move or delete those dishes first.`);
      return;
    }

    if (confirm(`Are you sure you want to delete the empty category "${catName}"?`)) {
      const res = await deleteCategory(catId);
      if (!res.success) {
        alert(res.error || 'Failed to delete category.');
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-charcoal/60 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="bg-cream rounded-3xl border border-borderLight p-6 sm:p-7 max-w-lg w-full shadow-modal space-y-6 max-h-[90vh] overflow-y-auto">
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-4 border-b border-borderLight">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-forest/10 text-forest flex items-center justify-center">
              <FolderPlus className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-serif text-xl font-bold text-forest">Menu Categories Manager</h3>
              <p className="text-xs text-charcoal/60">
                Organize menu items into customer-facing sections & banners.
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

        {/* Section 1: Create New Category Form */}
        <form onSubmit={handleCreate} className="space-y-4 bg-cream-light p-4 sm:p-5 rounded-2xl border border-borderLight">
          <div className="flex items-center gap-2">
            <Plus className="w-4 h-4 text-forest" />
            <h4 className="font-serif font-bold text-forest text-sm">Add New Category</h4>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-charcoal/80 uppercase tracking-wider mb-1">
              Category Name *
            </label>
            <input
              type="text"
              required
              value={categoryName}
              onChange={(e) => setCategoryName(e.target.value)}
              placeholder="e.g. Signature Biryanis, Chaats, Beverages, etc."
              className="w-full px-3.5 py-2.5 rounded-xl bg-cream border border-borderLight text-xs text-charcoal focus:outline-none focus:ring-2 focus:ring-forest/30"
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold text-charcoal/80 uppercase tracking-wider mb-1">
              Description (Optional)
            </label>
            <input
              type="text"
              value={categoryDesc}
              onChange={(e) => setCategoryDesc(e.target.value)}
              placeholder="e.g. Slow-cooked authentic Awadhi & Hyderabadi specialties"
              className="w-full px-3.5 py-2 rounded-xl bg-cream border border-borderLight text-xs text-charcoal focus:outline-none focus:ring-2 focus:ring-forest/30"
            />
          </div>

          <div className="flex items-center justify-end pt-1">
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 rounded-xl bg-forest text-cream font-bold text-xs hover:bg-forest-light transition-all flex items-center gap-1.5 shadow-sm disabled:opacity-50"
            >
              <Plus className="w-4 h-4" />
              <span>{isSubmitting ? 'Creating Category...' : 'Create Category'}</span>
            </button>
          </div>
        </form>

        {/* Section 2: Active Categories List */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Layers className="w-4 h-4 text-forest" />
              <h4 className="font-serif font-bold text-forest text-sm">
                Active Categories ({categories.length})
              </h4>
            </div>
            <span className="text-[11px] text-charcoal/50">
              {menuItems.length} total dishes cataloged
            </span>
          </div>

          <div className="divide-y divide-borderLight/60 max-h-56 overflow-y-auto rounded-xl border border-borderLight bg-cream-light/60 p-1">
            {categories.map((cat) => {
              const count = menuItems.filter((m) => m.category_id === cat.id).length;
              const isRemovable = count === 0;

              return (
                <div
                  key={cat.id}
                  className="px-3.5 py-2.5 flex items-center justify-between gap-3 text-xs"
                >
                  <div>
                    <span className="font-bold text-forest block">{cat.name}</span>
                    <span className="text-[10px] text-charcoal/50 font-medium">
                      slug: <code className="text-olive">{cat.slug}</code>
                      {cat.description ? ` • ${cat.description}` : ''}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                        count > 0
                          ? 'bg-forest/10 text-forest'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {count} {count === 1 ? 'dish' : 'dishes'}
                    </span>

                    {isRemovable ? (
                      <button
                        type="button"
                        onClick={() => handleDelete(cat.id, cat.name)}
                        className="p-1 rounded-lg text-charcoal/40 hover:text-terracotta hover:bg-terracotta/10 transition-colors"
                        title="Delete empty category"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    ) : (
                      <span className="w-3.5" />
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="pt-2 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl bg-cream-dark/50 hover:bg-cream-dark text-charcoal text-xs font-bold transition-all"
          >
            Done & Close
          </button>
        </div>
      </div>
    </div>
  );
};
