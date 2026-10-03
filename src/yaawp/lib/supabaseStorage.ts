// @ts-nocheck -- legacy Yaawp code ported from strict-off Vite app; type cleanup pending
// Thin wrapper kept for backwards compatibility: all media uploads now go
// through the provider abstraction in ./media/provider, so the final
// object-storage / Gumlet credentials can be added later without touching
// app code.
import { getMediaProvider, fileToDataUrl, type MediaFolder, type MediaUploadResult } from './media/provider';

export type { MediaFolder };
export { fileToDataUrl };

/**
 * Uploads a file/blob through the configured media provider.
 * Falls back smoothly to a persistent Data URL so images remain visible across reloads.
 */
export async function uploadMediaToSupabase(
  file: File | Blob,
  folder: MediaFolder = 'posts',
  customFileName?: string,
  userId?: string
): Promise<MediaUploadResult> {
  try {
    return await getMediaProvider().upload(file, folder, customFileName, userId);
  } catch (err: any) {
    console.warn('Error during media upload:', err);
    const dataUrl = await fileToDataUrl(file);
    return { url: dataUrl, error: err?.message || 'Upload failed' };
  }
}

/**
 * Removes a file through the configured media provider by path.
 */
export async function deleteMediaFromSupabase(filePath: string): Promise<boolean> {
  if (!filePath) return true;
  try {
    return await getMediaProvider().remove(filePath);
  } catch (err) {
    console.warn('Error deleting media:', err);
    return false;
  }
}
