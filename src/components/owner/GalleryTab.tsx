import React, { useState, useRef } from 'react';
import { useSettings } from '../../context/SettingsContext';
import { uploadImageFile } from '../../lib/storage';
import { Camera, Plus, Trash2, Star, Eye, Upload, Image as ImageIcon } from 'lucide-react';

export const GalleryTab: React.FC = () => {
  const { galleryImages, addGalleryImage, deleteGalleryImage, updateGalleryImage } = useSettings();

  const [isUploading, setIsUploading] = useState(false);
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Kitchen');
  const [caption, setCaption] = useState('');
  const [isFeatured, setIsFeatured] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  };

  const handleSaveImage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile && !previewUrl) {
      setErrorMsg('Please select a photo from your gallery or take a picture.');
      return;
    }
    if (!title.trim()) {
      setErrorMsg('Please provide a title for this photograph.');
      return;
    }

    setIsUploading(true);
    setErrorMsg(null);

    let finalImageUrl = previewUrl || '';
    if (selectedFile) {
      const uploadRes = await uploadImageFile(selectedFile, 'gallery-images');
      if (!uploadRes.success) {
        setErrorMsg(uploadRes.error || 'Failed to upload photo.');
        setIsUploading(false);
        return;
      }
      finalImageUrl = uploadRes.url;
    }

    const res = await addGalleryImage({
      title: title.trim(),
      category: category.trim(),
      image_url: finalImageUrl,
      caption: caption.trim() || null,
      is_featured: isFeatured,
      display_order: galleryImages.length + 1,
    });

    setIsUploading(false);

    if (res.success) {
      // Reset form
      setTitle('');
      setCategory('Kitchen');
      setCaption('');
      setIsFeatured(false);
      setPreviewUrl(null);
      setSelectedFile(null);
      setShowAddForm(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    } else {
      setErrorMsg(res.error || 'Failed to save gallery photo.');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-serif text-2xl sm:text-3xl font-bold text-forest">Kitchen Photo Gallery</h2>
          <p className="text-sm text-charcoal/70">
            Showcase authentic photographs of your cooking, plating, and food packaging.
          </p>
        </div>

        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="px-5 py-3 rounded-full bg-forest text-cream font-bold text-xs hover:bg-forest-light transition-all flex items-center gap-2 self-start sm:self-auto shadow-sm"
        >
          {showAddForm ? (
            <span>Cancel</span>
          ) : (
            <>
              <Plus className="w-4 h-4" />
              <span>Add New Photo</span>
            </>
          )}
        </button>
      </div>

      {/* Add Photo Form */}
      {showAddForm && (
        <div className="bg-cream-light rounded-2xl border border-forest/30 p-5 sm:p-6 shadow-subtle animate-in fade-in duration-200">
          <h3 className="font-serif text-lg font-bold text-forest mb-4 flex items-center gap-2">
            <Camera className="w-5 h-5 text-olive" />
            <span>Upload Photo to Kitchen Gallery</span>
          </h3>

          {errorMsg && (
            <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700">
              {errorMsg}
            </div>
          )}

          <form onSubmit={handleSaveImage} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Image Picker */}
              <div>
                <label className="block text-xs font-bold text-charcoal uppercase tracking-wider mb-2">
                  Select Photo (Mobile Camera or Gallery) *
                </label>
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="relative cursor-pointer aspect-4/3 rounded-2xl border-2 border-dashed border-borderLight hover:border-forest/60 bg-cream/50 flex flex-col items-center justify-center p-4 transition-all overflow-hidden group"
                >
                  {previewUrl ? (
                    <>
                      <img src={previewUrl} alt="Preview" className="w-full h-full object-cover rounded-xl" />
                      <div className="absolute inset-0 bg-charcoal/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-cream font-bold text-xs gap-1">
                        <Upload className="w-4 h-4" />
                        <span>Change Photo</span>
                      </div>
                    </>
                  ) : (
                    <div className="text-center space-y-2">
                      <div className="w-12 h-12 rounded-full bg-forest/10 text-forest flex items-center justify-center mx-auto">
                        <Camera className="w-6 h-6" />
                      </div>
                      <p className="text-xs font-bold text-forest">Tap to take photo or choose from gallery</p>
                      <p className="text-[11px] text-charcoal/50">Supports JPEG, PNG, WebP (Max 8MB)</p>
                    </div>
                  )}
                </div>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </div>

              {/* Meta Details */}
              <div className="space-y-3.5">
                <div>
                  <label className="block text-xs font-bold text-charcoal uppercase tracking-wider mb-1">
                    Photo Title *
                  </label>
                  <input
                    type="text"
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Photo title"
                    className="w-full px-3.5 py-2 rounded-xl bg-cream border border-borderLight text-charcoal text-sm focus:outline-none focus:ring-2 focus:ring-forest/30"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-charcoal uppercase tracking-wider mb-1">
                    Category Tag
                  </label>
                  <input
                    type="text"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    placeholder="Category tag (Starters, Kitchen, Plating...)"
                    className="w-full px-3.5 py-2 rounded-xl bg-cream border border-borderLight text-charcoal text-sm focus:outline-none focus:ring-2 focus:ring-forest/30"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-charcoal uppercase tracking-wider mb-1">
                    Caption (Optional)
                  </label>
                  <textarea
                    rows={2}
                    value={caption}
                    onChange={(e) => setCaption(e.target.value)}
                    placeholder="Brief description of the dish or celebration context"
                    className="w-full px-3.5 py-2 rounded-xl bg-cream border border-borderLight text-charcoal text-xs focus:outline-none focus:ring-2 focus:ring-forest/30 resize-none"
                  />
                </div>

                <div className="pt-2 flex items-center justify-between">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isFeatured}
                      onChange={(e) => setIsFeatured(e.target.checked)}
                      className="w-4 h-4 rounded border-borderLight text-forest focus:ring-forest/30"
                    />
                    <span className="text-xs font-bold text-forest">Feature on Homepage Gallery</span>
                  </label>

                  <button
                    type="submit"
                    disabled={isUploading}
                    className="px-6 py-2.5 rounded-xl bg-forest hover:bg-forest-light text-cream font-bold text-xs shadow-sm transition-all disabled:opacity-50 flex items-center gap-1.5"
                  >
                    {isUploading ? 'Uploading...' : 'Save Photograph'}
                  </button>
                </div>
              </div>
            </div>
          </form>
        </div>
      )}

      {/* Gallery List */}
      <div className="bg-cream-light rounded-2xl border border-borderLight overflow-hidden shadow-subtle">
        <div className="p-4 sm:p-5 border-b border-borderLight bg-cream flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ImageIcon className="w-5 h-5 text-olive" />
            <h3 className="font-serif text-lg font-bold text-forest">
              Uploaded Photos ({galleryImages.length})
            </h3>
          </div>
          <span className="text-xs text-charcoal/60">
            {galleryImages.length === 0 ? 'Showing default showcase on public site' : 'Live on public site'}
          </span>
        </div>

        {galleryImages.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <div className="w-14 h-14 rounded-full bg-cream-dark/30 flex items-center justify-center mx-auto text-charcoal/40">
              <Camera className="w-7 h-7" />
            </div>
            <p className="font-serif text-base font-bold text-forest">No Custom Photos Uploaded Yet</p>
            <p className="text-xs text-charcoal/60 max-w-sm mx-auto">
              Your public website is currently displaying the initial curated kitchen showcase. Upload photos from your camera or gallery to personalize it!
            </p>
            <button
              onClick={() => setShowAddForm(true)}
              className="px-5 py-2.5 rounded-full bg-forest text-cream text-xs font-bold hover:bg-forest-light transition-all shadow-sm"
            >
              Upload First Photograph
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 p-4 sm:p-6">
            {galleryImages.map((img) => (
              <div
                key={img.id}
                className="bg-cream rounded-xl border border-borderLight overflow-hidden flex flex-col justify-between group shadow-subtle hover:shadow-card transition-all"
              >
                <div>
                  <div className="relative aspect-square overflow-hidden bg-cream-dark/20">
                    <img
                      src={img.image_url}
                      alt={img.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <span className="absolute top-2 left-2 bg-cream/90 backdrop-blur-sm text-[10px] font-bold text-olive uppercase px-2 py-0.5 rounded-full">
                      {img.category}
                    </span>
                    {img.is_featured && (
                      <span className="absolute top-2 right-2 bg-amber-500 text-cream text-[10px] font-bold px-1.5 py-0.5 rounded-full flex items-center gap-0.5 shadow-sm">
                        <Star className="w-3 h-3 fill-cream" />
                      </span>
                    )}
                  </div>

                  <div className="p-3">
                    <h4 className="font-serif text-sm font-bold text-forest truncate">{img.title}</h4>
                    {img.caption && (
                      <p className="text-xs text-charcoal/70 line-clamp-2 mt-0.5">{img.caption}</p>
                    )}
                  </div>
                </div>

                <div className="p-3 pt-2 border-t border-borderLight/60 flex items-center justify-between">
                  <button
                    onClick={() => updateGalleryImage(img.id, { is_featured: !img.is_featured })}
                    className={`text-[11px] font-semibold px-2 py-1 rounded-md transition-colors ${
                      img.is_featured
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-cream-dark/40 text-charcoal/70 hover:bg-cream-dark'
                    }`}
                  >
                    {img.is_featured ? 'Featured ★' : 'Feature'}
                  </button>

                  <button
                    onClick={() => {
                      if (confirm(`Delete "${img.title}" from kitchen gallery?`)) {
                        deleteGalleryImage(img.id);
                      }
                    }}
                    className="p-1.5 text-charcoal/40 hover:text-terracotta hover:bg-terracotta/10 rounded-lg transition-colors"
                    title="Delete photograph"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

