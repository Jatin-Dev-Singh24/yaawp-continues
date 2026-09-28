import { supabase, isSupabaseConfigured } from './supabase';

export type MediaFolder = 'posts' | 'stories' | 'reels' | 'avatars' | 'audio' | 'messages';

const fileToDataUrl = (file: File | Blob): Promise<string> => {
  return new Promise((resolve) => {
    try {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = () => {
        // Fallback: convert directly to WebP canvas if FileReader fails
        const url = URL.createObjectURL(file);
        const img = new Image();
        img.onload = () => {
          URL.revokeObjectURL(url);
          const canvas = document.createElement('canvas');
          canvas.width = Math.min(img.naturalWidth || 800, 1200);
          canvas.height = Math.min(img.naturalHeight || 800, 1200);
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
            resolve(canvas.toDataURL('image/webp', 0.8));
          } else {
            resolve('');
          }
        };
        img.onerror = () => {
          URL.revokeObjectURL(url);
          resolve('');
        };
        img.src = url;
      };
      reader.readAsDataURL(file);
    } catch {
      resolve('');
    }
  });
};

/**
 * Uploads a file/blob to the Supabase Storage 'media' bucket.
 * If Supabase is configured and connected, stores into the bucket and returns the permanent public CDN URL.
 * If offline or not configured, falls back smoothly to a persistent Data URL so images remain permanently visible across reloads.
 */
export async function uploadMediaToSupabase(
  file: File | Blob,
  folder: MediaFolder = 'posts',
  customFileName?: string,
  userId?: string
): Promise<{ url: string; path?: string; error?: string }> {
  // If not configured, provide permanent data URL fallback
  if (!isSupabaseConfigured) {
    const dataUrl = await fileToDataUrl(file);
    return { url: dataUrl };
  }

  try {
    const ext = file instanceof File ? file.name.split('.').pop() || 'jpg' : 'jpg';
    const cleanFileName = customFileName
      ? `${customFileName}.${ext}`
      : `${Date.now()}_${Math.random().toString(36).substring(2, 9)}.${ext}`;

    const userPrefix = userId || 'anonymous';
    const filePath = `${userPrefix}/${folder}/${cleanFileName}`;

    const { data, error } = await supabase.storage
      .from('media')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: true
      });

    if (error) {
      console.warn('Supabase storage upload notice:', error.message);
      // Fallback to permanent Data URL on upload error so user's post flow is not interrupted
      const dataUrl = await fileToDataUrl(file);
      return { url: dataUrl, error: error.message };
    }

    const { data: publicData } = supabase.storage
      .from('media')
      .getPublicUrl(data.path);

    return { url: publicData.publicUrl, path: data.path };
  } catch (err: any) {
    console.warn('Error during Supabase media upload:', err);
    const dataUrl = await fileToDataUrl(file);
    return { url: dataUrl, error: err?.message || 'Upload failed' };
  }
}

/**
 * Removes a file from the Supabase Storage 'media' bucket by path.
 */
export async function deleteMediaFromSupabase(filePath: string): Promise<boolean> {
  if (!isSupabaseConfigured || !filePath) return true;

  try {
    const { error } = await supabase.storage.from('media').remove([filePath]);
    if (error) {
      console.warn('Supabase storage delete notice:', error.message);
      return false;
    }
    return true;
  } catch (err) {
    console.warn('Error deleting media from Supabase:', err);
    return false;
  }
}
