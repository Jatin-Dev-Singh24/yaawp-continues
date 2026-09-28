import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  RotateCw,
  RotateCcw,
  FlipHorizontal,
  Grid,
  ZoomIn,
  ZoomOut,
  RotateCcw as ResetIcon,
  Check,
  Maximize2,
  Crop as CropIcon,
  Zap,
  ArrowRight
} from 'lucide-react';

export type AspectRatioOption = '1:1' | '4:5' | '16:9' | '4:3' | '9:16' | 'original';

interface ImageCropperProps {
  imageSrc: string;
  onCropComplete: (croppedDataUrl: string, croppedFile: File, formatBadge?: string) => void;
  onSkip?: () => void;
  onBack?: () => void;
}

export const ImageCropper: React.FC<ImageCropperProps> = ({
  imageSrc,
  onCropComplete,
  onSkip,
  onBack
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);

  const [aspectRatio, setAspectRatio] = useState<AspectRatioOption>('1:1');
  const [zoom, setZoom] = useState<number>(1);
  const [pan, setPan] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [rotation, setRotation] = useState<number>(0); // 0, 90, 180, 270
  const [flipH, setFlipH] = useState<boolean>(false);
  const [showGrid, setShowGrid] = useState<boolean>(true);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [dragStart, setDragStart] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [panStart, setPanStart] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [imageNaturalSize, setImageNaturalSize] = useState<{ width: number; height: number }>({
    width: 1,
    height: 1
  });
  const [containerSize, setContainerSize] = useState<{ width: number; height: number }>({
    width: 440,
    height: 380
  });
  const [isProcessing, setIsProcessing] = useState<boolean>(false);

  // Load natural image dimensions
  useEffect(() => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = imageSrc;
    img.onload = () => {
      setImageNaturalSize({
        width: img.naturalWidth || 800,
        height: img.naturalHeight || 600
      });
      // Default to 1:1 or natural if preferred
      setZoom(1);
      setPan({ x: 0, y: 0 });
      setRotation(0);
      setFlipH(false);
    };
  }, [imageSrc]);

  // Track container size
  useEffect(() => {
    const updateSize = () => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        setContainerSize({
          width: Math.max(260, rect.width),
          height: Math.max(240, rect.height)
        });
      }
    };
    updateSize();
    window.addEventListener('resize', updateSize);
    return () => window.removeEventListener('resize', updateSize);
  }, []);

  // Compute target aspect ratio numeric value
  const getAspectNumeric = useCallback((): number => {
    switch (aspectRatio) {
      case '1:1':
        return 1;
      case '4:5':
        return 4 / 5;
      case '16:9':
        return 16 / 9;
      case '4:3':
        return 4 / 3;
      case '9:16':
        return 9 / 16;
      case 'original':
      default: {
        const isRotatedQuarter = rotation === 90 || rotation === 270;
        const w = isRotatedQuarter ? imageNaturalSize.height : imageNaturalSize.width;
        const h = isRotatedQuarter ? imageNaturalSize.width : imageNaturalSize.height;
        return w / Math.max(1, h);
      }
    }
  }, [aspectRatio, rotation, imageNaturalSize]);

  // Calculate crop window box dimensions within container
  const padding = 20;
  const availableWidth = Math.max(120, containerSize.width - padding * 2);
  const availableHeight = Math.max(120, containerSize.height - padding * 2);
  const aspect = getAspectNumeric();

  let cropW = availableWidth;
  let cropH = Math.round(cropW / aspect);

  if (cropH > availableHeight) {
    cropH = availableHeight;
    cropW = Math.round(cropH * aspect);
  }

  // Calculate base scale to ensure image covers the crop window
  const isRotatedQuarter = rotation === 90 || rotation === 270;
  const effectiveNatW = isRotatedQuarter ? imageNaturalSize.height : imageNaturalSize.width;
  const effectiveNatH = isRotatedQuarter ? imageNaturalSize.width : imageNaturalSize.height;

  const baseScale = Math.max(cropW / Math.max(1, effectiveNatW), cropH / Math.max(1, effectiveNatH));
  const currentTotalScale = baseScale * zoom;

  // Rendered dimensions of the image on screen (unrotated frame)
  const imgRenderW = imageNaturalSize.width * currentTotalScale;
  const imgRenderH = imageNaturalSize.height * currentTotalScale;

  // Max pan limits so image doesn't expose empty space
  const displayedEffectiveW = effectiveNatW * currentTotalScale;
  const displayedEffectiveH = effectiveNatH * currentTotalScale;
  const maxPanX = Math.max(0, (displayedEffectiveW - cropW) / 2);
  const maxPanY = Math.max(0, (displayedEffectiveH - cropH) / 2);

  // Clamped pan
  const clampedPanX = Math.max(-maxPanX, Math.min(maxPanX, pan.x));
  const clampedPanY = Math.max(-maxPanY, Math.min(maxPanY, pan.y));

  // Pointer drag event handlers for smooth panning
  const handlePointerDown = (e: React.PointerEvent) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX, y: e.clientY });
    setPanStart({ x: clampedPanX, y: clampedPanY });
    (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging) return;
    const dx = e.clientX - dragStart.x;
    const dy = e.clientY - dragStart.y;
    const newX = panStart.x + dx;
    const newY = panStart.y + dy;
    setPan({
      x: Math.max(-maxPanX, Math.min(maxPanX, newX)),
      y: Math.max(-maxPanY, Math.min(maxPanY, newY))
    });
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    setIsDragging(false);
    try {
      (e.target as HTMLElement).releasePointerCapture?.(e.pointerId);
    } catch {
      // ignore
    }
  };

  // Mouse wheel zoom
  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY < 0 ? 0.1 : -0.1;
    setZoom(prev => {
      const next = Math.min(3.5, Math.max(1, +(prev + delta).toFixed(2)));
      return next;
    });
  };

  // Rotate 90 deg clockwise
  const handleRotateCW = () => {
    setRotation(prev => (prev + 90) % 360);
    setPan({ x: 0, y: 0 });
  };

  // Rotate 90 deg counter-clockwise
  const handleRotateCCW = () => {
    setRotation(prev => (prev + 270) % 360);
    setPan({ x: 0, y: 0 });
  };

  // Flip horizontal
  const handleFlipH = () => {
    setFlipH(prev => !prev);
  };

  // Reset adjustments
  const handleReset = () => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
    setRotation(0);
    setFlipH(false);
  };

  // Execute Canvas Crop and Export as WebP
  const handleApplyCrop = async () => {
    setIsProcessing(true);
    try {
      // Determine output canvas dimensions (high resolution for crisp quality)
      let exportW = 1080;
      let exportH = Math.round(exportW / aspect);

      if (aspect < 1) {
        // Portrait (e.g. 4:5 -> 1080x1350, 9:16 -> 1080x1920)
        exportH = 1350;
        if (aspectRatio === '9:16') exportH = 1920;
        exportW = Math.round(exportH * aspect);
      } else if (aspect > 1.5) {
        // Landscape (e.g. 16:9 -> 1920x1080)
        exportW = 1920;
        exportH = Math.round(exportW / aspect);
      }

      const canvas = document.createElement('canvas');
      canvas.width = Math.max(1, exportW);
      canvas.height = Math.max(1, exportH);
      const ctx = canvas.getContext('2d');

      if (!ctx) {
        throw new Error('Canvas 2D context unavailable');
      }

      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';

      // Load image element
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.src = imageSrc;

      await new Promise<void>((resolve, reject) => {
        if (img.complete) {
          resolve();
        } else {
          img.onload = () => resolve();
          img.onerror = () => reject(new Error('Failed to load image for cropping'));
        }
      });

      // Scale ratio between export canvas and crop window on screen
      const scaleRatio = exportW / cropW;

      ctx.save();
      // Translate to canvas center
      ctx.translate(exportW / 2, exportH / 2);
      // Translate pan offset scaled to export canvas
      ctx.translate(clampedPanX * scaleRatio, clampedPanY * scaleRatio);
      // Rotate
      ctx.rotate((rotation * Math.PI) / 180);
      // Flip
      if (flipH) {
        ctx.scale(-1, 1);
      }

      // Draw image scaled
      const drawW = imageNaturalSize.width * currentTotalScale * scaleRatio;
      const drawH = imageNaturalSize.height * currentTotalScale * scaleRatio;
      ctx.drawImage(img, -drawW / 2, -drawH / 2, drawW, drawH);
      ctx.restore();

      // Export as WebP
      const dataUrl = canvas.toDataURL('image/webp', 0.92);

      canvas.toBlob(
        blob => {
          if (!blob) {
            throw new Error('Failed to convert crop to blob');
          }
          const croppedFile = new File([blob], `cropped_${Date.now()}.webp`, {
            type: 'image/webp',
            lastModified: Date.now()
          });

          const aspectLabel =
            aspectRatio === '1:1'
              ? 'Square 1:1'
              : aspectRatio === '4:5'
              ? 'Portrait 4:5'
              : aspectRatio === '16:9'
              ? 'Landscape 16:9'
              : aspectRatio === '4:3'
              ? 'Standard 4:3'
              : aspectRatio === '9:16'
              ? 'Story 9:16'
              : 'Formatted';

          onCropComplete(dataUrl, croppedFile, `⚡ Cropped (${aspectLabel})`);
          setIsProcessing(false);
        },
        'image/webp',
        0.92
      );
    } catch (err) {
      console.error('Error applying crop:', err);
      setIsProcessing(false);
      // Fallback: pass original image if canvas crop encountered an error
      if (onSkip) onSkip();
    }
  };

  return (
    <div
      id="image-cropper-container"
      className="flex flex-col w-full max-w-xl mx-auto ambient-glow select-none"
    >
      {/* Top Action Bar */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800 mb-3">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-lime-400/10 text-lime-500 dark:text-lime-400">
            <CropIcon className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
              <span>Crop & Format</span>
            </h4>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Drag to reposition, zoom or select aspect ratio
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          {onSkip && (
            <button
              type="button"
              onClick={onSkip}
              className="text-xs px-2.5 py-1 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 transition-colors"
            >
              Skip
            </button>
          )}
          <button
            type="button"
            id="apply-crop-btn"
            onClick={handleApplyCrop}
            disabled={isProcessing}
            className="flex items-center gap-1.5 px-3.5 py-1.5 bg-lime-500 hover:bg-lime-600 dark:bg-lime-400 dark:hover:bg-lime-500 text-slate-950 font-bold text-xs rounded-lg shadow-sm transition-all disabled:opacity-50"
          >
            {isProcessing ? (
              <span>Formatting...</span>
            ) : (
              <>
                <Check className="w-3.5 h-3.5" />
                <span>Apply Crop</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </>
            )}
          </button>
        </div>
      </div>

      {/* Interactive Crop Viewport */}
      <div
        ref={containerRef}
        onWheel={handleWheel}
        className="relative w-full h-[320px] sm:h-[360px] bg-slate-950 rounded-2xl overflow-hidden flex items-center justify-center cursor-grab active:cursor-grabbing border border-slate-800 shadow-inner"
      >
        {/* The Image (rendered behind crop box mask) */}
        <div
          className="absolute inset-0 flex items-center justify-center pointer-events-none"
          style={{
            transform: `translate(${clampedPanX}px, ${clampedPanY}px)`
          }}
        >
          <img
            ref={imageRef}
            src={imageSrc}
            alt="Source for cropping"
            draggable={false}
            className="max-w-none transition-transform duration-75 select-none pointer-events-none"
            style={{
              width: `${imgRenderW}px`,
              height: `${imgRenderH}px`,
              transform: `rotate(${rotation}deg) scaleX(${flipH ? -1 : 1})`,
              transformOrigin: 'center center'
            }}
          />
        </div>

        {/* Semi-transparent Dimming Backdrop around the Crop Box */}
        <div
          className="absolute pointer-events-none transition-all duration-150"
          style={{
            width: `${cropW}px`,
            height: `${cropH}px`,
            boxShadow: '0 0 0 9999px rgba(10, 10, 15, 0.72)',
            border: '1.5px solid rgba(163, 230, 53, 0.85)',
            borderRadius: '4px'
          }}
        >
          {/* Rule-of-Thirds Grid */}
          {showGrid && (
            <div className="absolute inset-0 pointer-events-none">
              {/* Horizontal 1/3 lines */}
              <div
                className="absolute left-0 right-0 border-t border-white/35"
                style={{ top: '33.333%' }}
              />
              <div
                className="absolute left-0 right-0 border-t border-white/35"
                style={{ top: '66.666%' }}
              />
              {/* Vertical 1/3 lines */}
              <div
                className="absolute top-0 bottom-0 border-l border-white/35"
                style={{ left: '33.333%' }}
              />
              <div
                className="absolute top-0 bottom-0 border-l border-white/35"
                style={{ left: '66.666%' }}
              />

              {/* Corner accent marks */}
              <div className="absolute -top-1 -left-1 w-3.5 h-3.5 border-t-2 border-l-2 border-lime-400" />
              <div className="absolute -top-1 -right-1 w-3.5 h-3.5 border-t-2 border-r-2 border-lime-400" />
              <div className="absolute -bottom-1 -left-1 w-3.5 h-3.5 border-b-2 border-l-2 border-lime-400" />
              <div className="absolute -bottom-1 -right-1 w-3.5 h-3.5 border-b-2 border-r-2 border-lime-400" />
            </div>
          )}

          {/* Center target crosshair watermark when dragging */}
          {isDragging && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-40">
              <div className="w-6 h-6 border border-white/50 rounded-full flex items-center justify-center">
                <div className="w-1.5 h-1.5 bg-lime-400 rounded-full" />
              </div>
            </div>
          )}
        </div>

        {/* Pointer capture transparent surface */}
        <div
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
          className="absolute inset-0 z-10 touch-none"
          title="Click and drag to pan photo"
        />

        {/* Viewport Floating Badges */}
        <div className="absolute top-3 left-3 z-20 flex items-center gap-1.5 pointer-events-none">
          <span className="bg-black/80 backdrop-blur-xs text-white font-mono text-[10px] px-2 py-0.5 rounded-full border border-white/10">
            {aspectRatio.toUpperCase()}
          </span>
          {zoom > 1 && (
            <span className="bg-black/80 backdrop-blur-xs text-lime-400 font-mono text-[10px] px-2 py-0.5 rounded-full border border-white/10">
              {Math.round(zoom * 100)}%
            </span>
          )}
        </div>

        {/* Toggle Grid Floating Button */}
        <div className="absolute top-3 right-3 z-20 flex items-center gap-1">
          <button
            type="button"
            onClick={() => setShowGrid(prev => !prev)}
            title={showGrid ? 'Hide composition grid' : 'Show composition grid'}
            className={`p-1.5 rounded-lg text-xs backdrop-blur-xs transition-colors ${
              showGrid
                ? 'bg-lime-400/20 text-lime-400 border border-lime-400/40'
                : 'bg-black/60 text-white/70 hover:text-white border border-white/10'
            }`}
          >
            <Grid className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Aspect Ratio Selector Chips */}
      <div className="mt-3 space-y-1.5">
        <div className="flex items-center justify-between text-[11px] font-semibold text-slate-500 dark:text-slate-400">
          <span>Aspect Ratio</span>
          <span className="text-[10px] font-normal text-slate-400">
            {aspectRatio === '1:1' && 'Square (Instagram Post)'}
            {aspectRatio === '4:5' && 'Portrait 4:5 (Max Feed Real-Estate)'}
            {aspectRatio === '16:9' && 'Landscape 16:9 (Cinematic)'}
            {aspectRatio === '4:3' && 'Standard 4:3'}
            {aspectRatio === '9:16' && 'Vertical 9:16 (Story / Reel)'}
            {aspectRatio === 'original' && 'Original Dimensions'}
          </span>
        </div>

        <div className="grid grid-cols-6 gap-1.5 p-1 bg-slate-100 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
          {[
            { id: '1:1', label: '1:1', sub: 'Square' },
            { id: '4:5', label: '4:5', sub: 'Portrait' },
            { id: '16:9', label: '16:9', sub: 'Wide' },
            { id: '4:3', label: '4:3', sub: 'Classic' },
            { id: '9:16', label: '9:16', sub: 'Story' },
            { id: 'original', label: 'Free', sub: 'Original' }
          ].map(opt => (
            <button
              key={opt.id}
              type="button"
              onClick={() => {
                setAspectRatio(opt.id as AspectRatioOption);
                setPan({ x: 0, y: 0 });
              }}
              className={`py-1.5 px-1 rounded-lg text-center transition-all ${
                aspectRatio === opt.id
                  ? 'bg-white dark:bg-slate-800 text-lime-600 dark:text-lime-400 shadow-xs ring-1 ring-lime-400/40 font-bold'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white font-medium'
              }`}
            >
              <div className="text-xs leading-none">{opt.label}</div>
              <div className="text-[9px] text-slate-400 leading-tight mt-0.5 truncate">
                {opt.sub}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Adjustments: Zoom Slider + Rotation + Flip + Reset */}
      <div className="mt-3 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900/70 border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center gap-3">
        {/* Zoom Controls */}
        <div className="w-full sm:flex-1 flex items-center gap-2">
          <button
            type="button"
            onClick={() => setZoom(prev => Math.max(1, +(prev - 0.2).toFixed(2)))}
            disabled={zoom <= 1}
            className="p-1 rounded-md text-slate-500 hover:text-slate-900 dark:hover:text-white disabled:opacity-30"
            title="Zoom out"
          >
            <ZoomOut className="w-3.5 h-3.5" />
          </button>
          <input
            type="range"
            min="1"
            max="3"
            step="0.05"
            value={zoom}
            onChange={e => setZoom(parseFloat(e.target.value))}
            className="flex-1 accent-lime-500 h-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg cursor-pointer"
            aria-label="Zoom photo"
          />
          <button
            type="button"
            onClick={() => setZoom(prev => Math.min(3, +(prev + 0.2).toFixed(2)))}
            disabled={zoom >= 3}
            className="p-1 rounded-md text-slate-500 hover:text-slate-900 dark:hover:text-white disabled:opacity-30"
            title="Zoom in"
          >
            <ZoomIn className="w-3.5 h-3.5" />
          </button>
          <span className="text-[10px] font-mono text-slate-500 dark:text-slate-400 w-9 text-right shrink-0">
            {Math.round(zoom * 100)}%
          </span>
        </div>

        {/* Divider */}
        <div className="hidden sm:block w-px h-5 bg-slate-200 dark:border-slate-800" />

        {/* Transform Tools: Rotate, Flip, Reset */}
        <div className="flex items-center gap-1.5 self-end sm:self-center">
          <button
            type="button"
            onClick={handleRotateCCW}
            title="Rotate 90° counter-clockwise"
            className="p-1.5 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={handleRotateCW}
            title="Rotate 90° clockwise"
            className="p-1.5 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"
          >
            <RotateCw className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={handleFlipH}
            title="Flip horizontally"
            className={`p-1.5 rounded-lg transition-colors ${
              flipH
                ? 'bg-lime-400/20 text-lime-400'
                : 'text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800'
            }`}
          >
            <FlipHorizontal className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={handleReset}
            title="Reset crop adjustments"
            className="p-1.5 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"
          >
            <ResetIcon className="w-3.5 h-3.5 text-rose-400" />
          </button>
        </div>
      </div>
    </div>
  );
};
