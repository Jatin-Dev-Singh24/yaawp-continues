// @ts-nocheck -- legacy Yaawp code ported from strict-off Vite app; type cleanup pending
/**
 * Media Converter & WebP Optimization Utilities
 * Ensures all images and text-post cards are converted and stored in WebP format,
 * supports video frame extraction to WebP thumbnails, and handles various image formats (PNG, JPG, JPEG, GIF, etc.).
 */

export interface ConvertedMediaResult {
  blob: Blob;
  dataUrl: string;
  file: File;
  width: number;
  height: number;
}

/**
 * Checks whether a given media URL or filename is a video.
 */
export function isVideoUrl(url?: string): boolean {
  if (!url) return false;
  const clean = url.split('?')[0].toLowerCase();
  return (
    clean.endsWith('.mp4') ||
    clean.endsWith('.webm') ||
    clean.endsWith('.mov') ||
    clean.endsWith('.m4v') ||
    clean.endsWith('.ogg') ||
    clean.startsWith('data:video/')
  );
}

/**
 * Converts any standard image (PNG, JPG, JPEG, GIF, SVG, BMP, WebP) to an optimized WebP image.
 * Uses maxDimension 1200 and quality 0.78 to ensure crisp HD quality while keeping payload compact (~60-120KB)
 * so it safely persists in offline cache and storage without QuotaExceededError.
 */
export async function convertImageToWebP(
  input: File | Blob | string,
  quality = 0.78,
  maxDimension = 1200
): Promise<ConvertedMediaResult> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';

    let objectUrl = '';
    if (typeof input === 'string') {
      img.src = input;
    } else {
      objectUrl = URL.createObjectURL(input);
      img.src = objectUrl;
    }

    img.onload = () => {
      if (objectUrl) URL.revokeObjectURL(objectUrl);

      // Scale dimensions if larger than maxDimension
      let { naturalWidth: width, naturalHeight: height } = img;
      if (width > maxDimension || height > maxDimension) {
        if (width > height) {
          height = Math.round((height * maxDimension) / width);
          width = maxDimension;
        } else {
          width = Math.round((width * maxDimension) / height);
          height = maxDimension;
        }
      }

      const canvas = document.createElement('canvas');
      canvas.width = Math.max(1, width);
      canvas.height = Math.max(1, height);
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        reject(new Error('Canvas 2D context not available'));
        return;
      }

      // Smooth resizing
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';
      ctx.drawImage(img, 0, 0, width, height);

      // Export as WebP
      const dataUrl = canvas.toDataURL('image/webp', quality);

      canvas.toBlob(
        blob => {
          if (!blob) {
            reject(new Error('Failed to generate WebP blob'));
            return;
          }
          const baseName =
            input instanceof File
              ? input.name.replace(/\.[^/.]+$/, '')
              : `media_${Date.now()}`;
          const webpFile = new File([blob], `${baseName}.webp`, {
            type: 'image/webp',
            lastModified: Date.now()
          });

          resolve({
            blob,
            dataUrl,
            file: webpFile,
            width,
            height
          });
        },
        'image/webp',
        quality
      );
    };

    img.onerror = err => {
      if (objectUrl) URL.revokeObjectURL(objectUrl);
      reject(new Error(`Failed to load image for WebP conversion: ${err}`));
    };
  });
}

/**
 * Extracts a frame from a video and exports it as an optimized WebP image thumbnail.
 */
export async function extractVideoThumbnailWebP(
  input: File | string,
  seekTime = 0.5,
  quality = 0.85
): Promise<ConvertedMediaResult> {
  return new Promise((resolve, reject) => {
    const video = document.createElement('video');
    video.crossOrigin = 'anonymous';
    video.muted = true;
    video.playsInline = true;
    video.autoplay = false;

    let objectUrl = '';
    if (typeof input === 'string') {
      video.src = input;
    } else {
      objectUrl = URL.createObjectURL(input);
      video.src = objectUrl;
    }

    const cleanup = () => {
      if (objectUrl) URL.revokeObjectURL(objectUrl);
      video.remove();
    };

    video.onloadedmetadata = () => {
      const timeToSeek = Math.min(seekTime, video.duration > 0 ? video.duration / 2 : 0.1);
      video.currentTime = timeToSeek;
    };

    video.onseeked = () => {
      try {
        const width = video.videoWidth || 640;
        const height = video.videoHeight || 360;
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          cleanup();
          reject(new Error('Could not get canvas context'));
          return;
        }

        ctx.drawImage(video, 0, 0, width, height);
        const dataUrl = canvas.toDataURL('image/webp', quality);

        canvas.toBlob(
          blob => {
            cleanup();
            if (!blob) {
              reject(new Error('Could not generate WebP thumbnail for video'));
              return;
            }
            const baseName =
              input instanceof File
                ? input.name.replace(/\.[^/.]+$/, '')
                : `video_poster_${Date.now()}`;
            const file = new File([blob], `${baseName}_thumb.webp`, {
              type: 'image/webp',
              lastModified: Date.now()
            });

            resolve({
              blob,
              dataUrl,
              file,
              width,
              height
            });
          },
          'image/webp',
          quality
        );
      } catch (err) {
        cleanup();
        reject(err);
      }
    };

    video.onerror = () => {
      cleanup();
      reject(new Error('Failed to load video for thumbnail extraction'));
    };
  });
}

/**
 * Generates an elegant, high-resolution WebP card graphic for text-only posts.
 */
export async function generateTextPostCardWebP(
  text: string,
  options: {
    authorName?: string;
    username?: string;
    theme?: 'slate' | 'indigo' | 'emerald' | 'amber' | 'sunset' | 'dark';
    fontScale?: number;
  } = {}
): Promise<ConvertedMediaResult> {
  const canvas = document.createElement('canvas');
  const size = 1080;
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas context unavailable');

  const theme = options.theme || 'slate';

  // Theme gradient palettes
  const palettes: Record<string, [string, string, string]> = {
    slate: ['#0f172a', '#1e293b', '#334155'],
    indigo: ['#1e1b4b', '#312e81', '#4338ca'],
    emerald: ['#064e3b', '#065f46', '#047857'],
    amber: ['#451a03', '#78350f', '#b45309'],
    sunset: ['#4c0519', '#831843', '#be185d'],
    dark: ['#09090b', '#18181b', '#27272a']
  };

  const [c1, c2, c3] = palettes[theme] || palettes.slate;

  // Background gradient
  const grad = ctx.createLinearGradient(0, 0, size, size);
  grad.addColorStop(0, c1);
  grad.addColorStop(0.5, c2);
  grad.addColorStop(1, c3);
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, size, size);

  // Subtle pattern overlay
  ctx.fillStyle = 'rgba(255, 255, 255, 0.03)';
  for (let i = 0; i < size; i += 40) {
    ctx.fillRect(i, 0, 1, size);
    ctx.fillRect(0, i, size, 1);
  }

  // Border frame
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.12)';
  ctx.lineWidth = 16;
  ctx.strokeRect(32, 32, size - 64, size - 64);

  // Top header (Author info)
  if (options.authorName || options.username) {
    ctx.font = '600 32px "Plus Jakarta Sans", sans-serif';
    ctx.fillStyle = 'rgba(255, 255, 255, 0.75)';
    ctx.fillText(options.authorName || `@${options.username}`, 80, 110);

    if (options.username && options.authorName) {
      ctx.font = '400 24px "Plus Jakarta Sans", sans-serif';
      ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
      ctx.fillText(`@${options.username}`, 80, 145);
    }
  }

  // Quote mark
  ctx.font = 'italic 700 120px "Playfair Display", serif';
  ctx.fillStyle = 'rgba(255, 255, 255, 0.18)';
  ctx.fillText('“', 70, 240);

  // Main Text formatting with word wrap
  const fontSize = text.length > 180 ? 44 : text.length > 90 ? 54 : 64;
  ctx.font = `600 ${fontSize}px "Plus Jakarta Sans", sans-serif`;
  ctx.fillStyle = '#ffffff';

  const maxLineWidth = size - 180;
  const words = text.split(/\s+/);
  let line = '';
  const lines: string[] = [];

  for (let n = 0; n < words.length; n++) {
    const testLine = line + words[n] + ' ';
    const metrics = ctx.measureText(testLine);
    if (metrics.width > maxLineWidth && n > 0) {
      lines.push(line.trim());
      line = words[n] + ' ';
    } else {
      line = testLine;
    }
  }
  lines.push(line.trim());

  // Center vertical placement
  const lineHeight = fontSize * 1.35;
  const totalTextHeight = lines.length * lineHeight;
  let startY = Math.max(300, (size - totalTextHeight) / 2 + 40);

  for (let i = 0; i < lines.length && i < 11; i++) {
    ctx.fillText(lines[i], 80, startY);
    startY += lineHeight;
  }

  // Bottom watermark badge
  ctx.font = '600 24px "Plus Jakarta Sans", sans-serif';
  ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
  ctx.fillText('YAAWP · Thoughts', 80, size - 70);

  const dataUrl = canvas.toDataURL('image/webp', 0.9);

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      blob => {
        if (!blob) {
          reject(new Error('Could not generate WebP text card'));
          return;
        }
        const file = new File([blob], `thought_${Date.now()}.webp`, {
          type: 'image/webp',
          lastModified: Date.now()
        });
        resolve({
          blob,
          dataUrl,
          file,
          width: size,
          height: size
        });
      },
      'image/webp',
      0.9
    );
  });
}
