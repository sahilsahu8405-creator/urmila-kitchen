import { supabase } from './supabase';

/**
 * Optimizes an image using an HTML5 Canvas:
 * Resizes down to maxWidth/maxHeight and compresses to JPEG with quality 0.85
 */
export async function optimizeImage(file: File, maxWidth = 1200, maxHeight = 1200, quality = 0.85): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        let width = img.width;
        let height = img.height;

        if (width > maxWidth || height > maxHeight) {
          if (width > height) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          } else {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(file);
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);
        canvas.toBlob(
          (blob) => {
            if (blob) {
              resolve(blob);
            } else {
              resolve(file);
            }
          },
          'image/jpeg',
          quality
        );
      };
      img.onerror = () => reject(new Error('Failed to load image for optimization'));
      img.src = e.target?.result as string;
    };
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsDataURL(file);
  });
}

/**
 * Uploads an image to Supabase Storage with automatic fallback to data URL
 */
export async function uploadImageFile(
  file: File,
  bucket: 'product-images' | 'gallery-images' | 'review-images' = 'product-images'
): Promise<{ success: boolean; url: string; error?: string }> {
  // Validate file type
  if (!file.type.startsWith('image/')) {
    return { success: false, url: '', error: 'Please select a valid image file (JPEG, PNG, WebP).' };
  }

  // Validate size (max 8MB before compression)
  if (file.size > 8 * 1024 * 1024) {
    return { success: false, url: '', error: 'Image file is too large. Maximum size is 8MB.' };
  }

  try {
    // 1. Optimize image client-side
    const optimizedBlob = await optimizeImage(file);
    const fileName = `${bucket.replace('-images', '')}-${Date.now()}-${Math.random().toString(36).substring(2, 8)}.jpg`;

    // 2. Try Supabase Storage upload
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from(bucket)
      .upload(fileName, optimizedBlob, {
        contentType: 'image/jpeg',
        upsert: true,
      });

    if (!uploadError && uploadData) {
      const { data: publicUrlData } = supabase.storage
        .from(bucket)
        .getPublicUrl(uploadData.path);

      if (publicUrlData?.publicUrl) {
        return { success: true, url: publicUrlData.publicUrl };
      }
    }

    // 3. Fallback to Data URL if storage bucket is not created or permissions are pending
    console.warn('Supabase storage upload bypassed or failed, using local optimized image data:', uploadError?.message);
    const dataUrl = await new Promise<string>((resolve) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.readAsDataURL(optimizedBlob);
    });

    return { success: true, url: dataUrl };
  } catch (err: any) {
    console.error('Image upload error:', err);
    return { success: false, url: '', error: err.message || 'Failed to process and upload image.' };
  }
}
