// @ts-nocheck
// YAAWP media routing (final architecture):
//   image        -> ImageKit
//   video / reel -> Gumlet
// Supabase stores only metadata (media_assets table). There is no S3 layer and
// no Supabase Storage / data-URL fallback for production media: if a provider
// is not configured, uploads fail clearly.
//
// Public (browser) config:  VITE_IMAGEKIT_PUBLIC_KEY, VITE_IMAGEKIT_URL_ENDPOINT
// Server-only secrets:      IMAGEKIT_PRIVATE_KEY, GUMLET_API_KEY, GUMLET_SOURCE_ID

import { supabase } from '../supabase';
import { getImageKitUploadAuth, createGumletUpload, deleteMediaAsset } from '@/lib/media.functions';

export type MediaFolder = 'posts' | 'stories' | 'reels' | 'avatars' | 'audio' | 'messages' | 'communities';

export interface MediaUploadResult {
  url: string;
  path?: string;
  provider?: 'imagekit' | 'gumlet';
  assetId?: string;
  thumbnailUrl?: string | null;
  error?: string;
}

export class MediaUploadError extends Error {}

// Kept for local previews only (never used as stored production media).
export const fileToDataUrl = (file: File | Blob): Promise<string> =>
  new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => resolve('');
    reader.readAsDataURL(file);
  });

async function accessToken(): Promise<string> {
  const { data } = await supabase.auth.getSession();
  const t = data.session?.access_token;
  if (!t) throw new MediaUploadError('Please sign in to upload media.');
  return t;
}

async function recordAsset(row: Record<string, unknown>) {
  const { data } = await supabase.auth.getUser();
  if (!data.user) return;
  const { error } = await supabase.from('media_assets').insert({ ...row, user_id: data.user.id });
  if (error) console.warn('media_assets insert failed:', error.message);
}

function friendly(err: any): string {
  const m = String(err?.message || err);
  if (m.includes('media_not_configured')) return 'Media uploads are not set up yet.';
  if (m.includes('unsupported_image_type')) return 'Only JPG, PNG, WebP or GIF images are allowed.';
  if (m.includes('image_too_large')) return 'Images must be 10 MB or smaller.';
  if (m.includes('unsupported_video_type')) return 'Only MP4, WebM or MOV videos are allowed.';
  if (m.includes('video_too_large')) return 'Videos must be 200 MB or smaller.';
  if (m.includes('unauthorized')) return 'Please sign in to upload media.';
  return m || 'Upload failed.';
}

// ImageKit public config (safe to ship in the browser).
const IMAGEKIT_PUBLIC_KEY = 'public_ldiqf6sLzvqOa5OIm4ZvzYIXTk4=';
const IMAGEKIT_URL_ENDPOINT = 'https://ik.imagekit.io/3xvr9skjdp';

async function uploadImage(file: File | Blob, folder: MediaFolder): Promise<MediaUploadResult> {
  const publicKey = import.meta.env.VITE_IMAGEKIT_PUBLIC_KEY || IMAGEKIT_PUBLIC_KEY;
  if (!publicKey) throw new MediaUploadError('Image uploads are not set up yet.');
  const token = await accessToken();
  const auth = await getImageKitUploadAuth({
    data: { accessToken: token, folder: folder === 'reels' || folder === 'audio' ? 'posts' : folder, mimeType: file.type, size: file.size },
  });
  const form = new FormData();
  form.append('file', file);
  form.append('fileName', file instanceof File ? file.name : `image_${Date.now()}.webp`);
  form.append('publicKey', publicKey);
  form.append('signature', auth.signature);
  form.append('expire', String(auth.expire));
  form.append('token', auth.token);
  form.append('folder', auth.folder);
  form.append('useUniqueFileName', 'true');
  const res = await fetch('https://upload.imagekit.io/api/v1/files/upload', { method: 'POST', body: form });
  if (!res.ok) throw new MediaUploadError(`Image upload failed (${res.status}).`);
  const j = await res.json();
  await recordAsset({
    provider: 'imagekit', kind: 'image', folder, provider_asset_id: j.fileId,
    url: j.url, file_path: j.filePath, mime_type: file.type, size_bytes: file.size,
    width: j.width ?? null, height: j.height ?? null,
  });
  return { url: j.url, path: j.filePath, provider: 'imagekit', assetId: j.fileId };
}

async function uploadVideo(file: File | Blob, folder: MediaFolder): Promise<MediaUploadResult> {
  const token = await accessToken();
  const g = await createGumletUpload({ data: { accessToken: token, mimeType: file.type, size: file.size } });
  const put = await fetch(g.uploadUrl, { method: 'PUT', body: file, headers: { 'Content-Type': file.type } });
  if (!put.ok) throw new MediaUploadError(`Video upload failed (${put.status}).`);
  await recordAsset({
    provider: 'gumlet', kind: 'video', folder, provider_asset_id: g.assetId,
    url: g.playbackUrl, thumbnail_url: g.thumbnailUrl, mime_type: file.type, size_bytes: file.size,
  });
  return { url: g.playbackUrl || '', provider: 'gumlet', assetId: g.assetId, thumbnailUrl: g.thumbnailUrl };
}

/** Routes by media type. Throws MediaUploadError with a user-readable message on failure. */
export async function uploadMedia(file: File | Blob, folder: MediaFolder): Promise<MediaUploadResult> {
  try {
    if (file.type.startsWith('image/')) return await uploadImage(file, folder);
    if (file.type.startsWith('video/')) return await uploadVideo(file, folder);
    throw new MediaUploadError('Only images and videos can be uploaded.');
  } catch (err) {
    throw err instanceof MediaUploadError ? err : new MediaUploadError(friendly(err));
  }
}

export async function removeMedia(provider: 'imagekit' | 'gumlet', assetId: string): Promise<boolean> {
  try {
    const token = await accessToken();
    const r = await deleteMediaAsset({ data: { accessToken: token, provider, assetId } });
    if (r.ok) await supabase.from('media_assets').delete().eq('provider', provider).eq('provider_asset_id', assetId);
    return r.ok;
  } catch (err) {
    console.warn('Media delete failed:', err);
    return false;
  }
}
