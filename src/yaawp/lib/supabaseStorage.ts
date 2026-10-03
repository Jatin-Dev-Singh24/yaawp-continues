// @ts-nocheck
// Backwards-compatible names. Media no longer goes to Supabase Storage:
// images -> ImageKit, videos -> Gumlet (see ./media/provider).
import { uploadMedia, removeMedia, fileToDataUrl, type MediaFolder, type MediaUploadResult } from './media/provider';

export type { MediaFolder };
export { fileToDataUrl };

/** Uploads via the correct provider. Throws a user-readable error on failure (no silent fallback). */
export async function uploadMediaToSupabase(
  file: File | Blob,
  folder: MediaFolder = 'posts',
  _customFileName?: string,
  _userId?: string
): Promise<MediaUploadResult> {
  return uploadMedia(file, folder);
}

export async function deleteMediaFromSupabase(provider: 'imagekit' | 'gumlet', assetId: string): Promise<boolean> {
  if (!assetId) return true;
  return removeMedia(provider, assetId);
}
