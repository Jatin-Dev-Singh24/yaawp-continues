// @ts-nocheck
// Media storage provider abstraction for YAAWP.
//
// Architecture (per agreed backend plan):
//   Upload -> object storage -> processing/optimization (Gumlet) -> CDN -> YAAWP
//
// The app code talks only to the MediaProvider interface. The concrete
// provider is chosen by configuration, so the final object-storage and
// Gumlet credentials can be supplied later without rewriting app code.
//
// Providers:
//   - 'supabase'  : Supabase Storage bucket (default; works today)
//   - 's3'        : external S3-compatible object storage (needs credentials)
//   - 'dataurl'   : offline fallback, stores media as data URLs
//
// Required env vars when the external providers are supplied:
//   VITE_MEDIA_PROVIDER            'supabase' | 's3'  (default 'supabase')
//   VITE_SUPABASE_MEDIA_BUCKET     bucket name (default 'media')
//   -- S3-compatible object storage (server-side only, never VITE_) --
//   S3_ENDPOINT, S3_REGION, S3_BUCKET, S3_ACCESS_KEY_ID, S3_SECRET_ACCESS_KEY
//   -- Gumlet video processing/CDN (server-side only) --
//   GUMLET_API_KEY, GUMLET_SOURCE_ID, GUMLET_CDN_BASE_URL

import { supabase, isSupabaseConfigured } from '../supabase';

export type MediaFolder = 'posts' | 'stories' | 'reels' | 'avatars' | 'audio' | 'messages';

export interface MediaUploadResult {
  url: string;
  path?: string;
  error?: string;
}

export interface MediaProvider {
  readonly name: string;
  upload(file: File | Blob, folder: MediaFolder, customFileName?: string, userId?: string): Promise<MediaUploadResult>;
  remove(path: string): Promise<boolean>;
}

export const fileToDataUrl = (file: File | Blob): Promise<string> => {
  return new Promise((resolve) => {
    try {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = () => {
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

// ---------------------------------------------------------------------------
// Supabase Storage adapter (current default)
// ---------------------------------------------------------------------------
const supabaseAdapter: MediaProvider = {
  name: 'supabase',
  async upload(file, folder, customFileName, userId) {
    const bucket = (typeof import.meta !== 'undefined' && import.meta.env?.VITE_SUPABASE_MEDIA_BUCKET) || 'media';
    const ext = file instanceof File ? file.name.split('.').pop() || 'jpg' : 'jpg';
    const cleanFileName = customFileName
      ? `${customFileName}.${ext}`
      : `${Date.now()}_${Math.random().toString(36).substring(2, 9)}.${ext}`;
    const userPrefix = userId || 'anonymous';
    const filePath = `${userPrefix}/${folder}/${cleanFileName}`;

    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(filePath, file, { cacheControl: '3600', upsert: true });

    if (error) {
      console.warn('Supabase storage upload notice:', error.message);
      const dataUrl = await fileToDataUrl(file);
      return { url: dataUrl, error: error.message };
    }

    const { data: publicData } = supabase.storage.from(bucket).getPublicUrl(data.path);
    return { url: publicData.publicUrl, path: data.path };
  },
  async remove(path) {
    const bucket = (typeof import.meta !== 'undefined' && import.meta.env?.VITE_SUPABASE_MEDIA_BUCKET) || 'media';
    const { error } = await supabase.storage.from(bucket).remove([path]);
    if (error) {
      console.warn('Supabase storage delete notice:', error.message);
      return false;
    }
    return true;
  },
};

// ---------------------------------------------------------------------------
// External S3-compatible object storage adapter (placeholder).
// Uploads must go through a server-side signing endpoint so credentials
// never reach the browser. Activated once S3_* env vars are supplied.
// ---------------------------------------------------------------------------
const s3Adapter: MediaProvider = {
  name: 's3',
  async upload(file, folder) {
    // TODO: call the server route that returns a pre-signed PUT URL, then PUT
    // the file directly to object storage. Not active until credentials exist.
    console.warn(`S3 media provider not configured yet; falling back to data URL (folder: ${folder}).`);
    const dataUrl = await fileToDataUrl(file);
    return { url: dataUrl, error: 's3_provider_not_configured' };
  },
  async remove() {
    console.warn('S3 media provider not configured yet; delete skipped.');
    return false;
  },
};

const dataUrlAdapter: MediaProvider = {
  name: 'dataurl',
  async upload(file) {
    return { url: await fileToDataUrl(file) };
  },
  async remove() {
    return true;
  },
};

export function getMediaProvider(): MediaProvider {
  const configured = (typeof import.meta !== 'undefined' && import.meta.env?.VITE_MEDIA_PROVIDER) || 'supabase';
  if (configured === 's3') return s3Adapter;
  if (configured === 'supabase' && isSupabaseConfigured) return supabaseAdapter;
  return dataUrlAdapter;
}
