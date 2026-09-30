// @ts-nocheck -- legacy Yaawp code ported from strict-off Vite app; type cleanup pending
import React, { useState, useRef } from 'react';
import {
  X,
  Palette,
  Image as ImageIcon,
  Sparkles,
  Upload,
  Check,
  RotateCcw,
  Layers,
  Shapes,
  Eye
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

export interface WallpaperOption {
  id: string;
  name: string;
  type: 'gradient' | 'shape' | 'scenery' | 'custom';
  value: string; // CSS style or image URL
  previewClass?: string;
  isDarkCompatible?: boolean;
}

export const PRESET_WALLPAPERS: WallpaperOption[] = [
  // 1. Gradients
  {
    id: 'grad_mesh_slate',
    name: 'Midnight Slate',
    type: 'gradient',
    value: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #312e81 100%)',
    previewClass: 'from-slate-900 via-indigo-950 to-indigo-900'
  },
  {
    id: 'grad_emerald_forest',
    name: 'Emerald Aurora',
    type: 'gradient',
    value: 'linear-gradient(135deg, #064e3b 0%, #065f46 50%, #022c22 100%)',
    previewClass: 'from-emerald-900 via-emerald-800 to-teal-950'
  },
  {
    id: 'grad_cosmic_violet',
    name: 'Cosmic Violet',
    type: 'gradient',
    value: 'linear-gradient(135deg, #3b0764 0%, #581c87 50%, #1e1b4b 100%)',
    previewClass: 'from-purple-950 via-purple-900 to-indigo-950'
  },
  {
    id: 'grad_sunset_amber',
    name: 'Twilight Amber',
    type: 'gradient',
    value: 'linear-gradient(135deg, #451a03 0%, #78350f 50%, #1c1917 100%)',
    previewClass: 'from-amber-950 via-amber-900 to-stone-900'
  },
  {
    id: 'grad_nordic_frost',
    name: 'Nordic Clean',
    type: 'gradient',
    value: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 50%, #cbd5e1 100%)',
    previewClass: 'from-slate-50 via-slate-200 to-slate-300'
  },
  {
    id: 'grad_rose_twilight',
    name: 'Rose Dusk',
    type: 'gradient',
    value: 'linear-gradient(135deg, #4c0519 0%, #831843 50%, #18181b 100%)',
    previewClass: 'from-rose-950 via-pink-900 to-zinc-900'
  },

  // 2. Shapes & Geometric Patterns (SVG data URLs / CSS geometry)
  {
    id: 'shape_blueprint_grid',
    name: 'Architect Grid',
    type: 'shape',
    value: `radial-gradient(rgba(99, 102, 241, 0.15) 1px, transparent 1px), radial-gradient(rgba(99, 102, 241, 0.1) 1px, #090d16 1px)`,
    previewClass: 'bg-indigo-950/80 border-dashed border-indigo-400/30'
  },
  {
    id: 'shape_isometric_cubes',
    name: 'Isometric Flow',
    type: 'shape',
    value: `linear-gradient(60deg, rgba(16, 185, 129, 0.08) 25%, transparent 25%), linear-gradient(120deg, rgba(16, 185, 129, 0.08) 25%, transparent 25%), #051310`,
    previewClass: 'bg-emerald-950 border-emerald-500/20'
  },
  {
    id: 'shape_carbon_fiber',
    name: 'Carbon Weave',
    type: 'shape',
    value: `radial-gradient(#18181b 15%, transparent 16%) 0 0, radial-gradient(#27272a 15%, transparent 16%) 8px 8px, #09090b`,
    previewClass: 'bg-zinc-900 border-zinc-700/40'
  },
  {
    id: 'shape_abstract_waves',
    name: 'Topographic Waves',
    type: 'shape',
    value: `repeating-radial-gradient(circle at 0 0, transparent 0, rgba(147, 51, 234, 0.08) 20px, transparent 40px), #0f0a1c`,
    previewClass: 'bg-purple-950 border-purple-500/30'
  },
  {
    id: 'shape_honeycomb',
    name: 'Hexagonal Cells',
    type: 'shape',
    value: `radial-gradient(circle, rgba(234, 179, 8, 0.12) 10%, transparent 11%), #11100b`,
    previewClass: 'bg-amber-950 border-amber-500/30'
  },

  // 3. Sceneries & Nature (Unsplash Unlicensed/CC0 nature photography)
  {
    id: 'scene_mountain_fog',
    name: 'Misty Alpine Peaks',
    type: 'scenery',
    value: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1200&q=80',
    previewClass: 'bg-slate-800'
  },
  {
    id: 'scene_starlit_night',
    name: 'Starlit Galaxy',
    type: 'scenery',
    value: 'https://images.unsplash.com/photo-1506703719100-a0f3a48c0f86?auto=format&fit=crop&w=1200&q=80',
    previewClass: 'bg-indigo-950'
  },
  {
    id: 'scene_pacific_sunset',
    name: 'Pacific Golden Coast',
    type: 'scenery',
    value: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80',
    previewClass: 'bg-amber-900'
  },
  {
    id: 'scene_redwood_forest',
    name: 'Deep Redwood Pines',
    type: 'scenery',
    value: 'https://images.unsplash.com/photo-1448375240586-882707db888b?auto=format&fit=crop&w=1200&q=80',
    previewClass: 'bg-emerald-950'
  },
  {
    id: 'scene_desert_dunes',
    name: 'Sahara Sand Dunes',
    type: 'scenery',
    value: 'https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?auto=format&fit=crop&w=1200&q=80',
    previewClass: 'bg-orange-950'
  },
  {
    id: 'scene_minimal_rain',
    name: 'Raindrops on Glass',
    type: 'scenery',
    value: 'https://images.unsplash.com/photo-1515694346937-94d85e41e6f0?auto=format&fit=crop&w=1200&q=80',
    previewClass: 'bg-slate-900'
  }
];

interface ChatWallpapersModalProps {
  isOpen: boolean;
  onClose: () => void;
  conversationId: string;
  conversationName: string;
}

export const ChatWallpapersModal: React.FC<ChatWallpapersModalProps> = ({
  isOpen,
  onClose,
  conversationId,
  conversationName
}) => {
  const { setChatWallpaper, conversations, showToast } = useApp();
  const [activeCategory, setActiveCategory] = useState<'all' | 'gradient' | 'shape' | 'scenery' | 'custom'>('gradient');
  const [previewOption, setPreviewOption] = useState<WallpaperOption | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const currentConv = conversations.find(c => c.id === conversationId);
  const currentWallpaper = currentConv?.wallpaper;

  const filteredPresets = PRESET_WALLPAPERS.filter(
    item => activeCategory === 'all' || item.type === activeCategory
  );

  const handleApplyWallpaper = (wp: WallpaperOption) => {
    setChatWallpaper(conversationId, {
      type: wp.type,
      value: wp.value,
      name: wp.name
    });
    showToast(`Applied "${wp.name}" wallpaper to this chat`);
    onClose();
  };

  const handleRemoveWallpaper = () => {
    setChatWallpaper(conversationId, undefined);
    showToast('Wallpaper reset to default chat theme');
    onClose();
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      showToast('Please select a valid image file (PNG, JPG, WebP)');
      return;
    }

    const reader = new FileReader();
    reader.onload = event => {
      const dataUrl = event.target?.result as string;
      if (dataUrl) {
        setChatWallpaper(conversationId, {
          type: 'custom',
          value: dataUrl,
          name: file.name.slice(0, 20) || 'Custom Image'
        });
        showToast('Custom device wallpaper applied!');
        onClose();
      }
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xs p-3 md:p-6 animate-in fade-in duration-150">
      <div className="w-full max-w-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[88vh]">
        {/* Header */}
        <div className="p-4 px-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/70 dark:bg-slate-950/60 shrink-0">
          <div className="flex items-center gap-2.5">
            <span className="p-2 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20">
              <Palette className="w-5 h-5" />
            </span>
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                Chat Wallpaper & Theme
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Custom background for chat with <span className="font-semibold text-slate-700 dark:text-slate-200">{conversationName}</span>
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Categories Bar */}
        <div className="flex items-center gap-1.5 px-4 pt-3 pb-2 border-b border-slate-200 dark:border-slate-800/80 bg-slate-50/30 dark:bg-slate-950/30 overflow-x-auto no-scrollbar">
          {[
            { id: 'gradient', label: 'Gradients', icon: Sparkles },
            { id: 'shape', label: 'Shapes & Geometric', icon: Shapes },
            { id: 'scenery', label: 'Sceneries (Nature)', icon: ImageIcon },
            { id: 'custom', label: 'Choose from Device', icon: Upload }
          ].map(cat => {
            const Icon = cat.icon;
            return (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id as any)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                  activeCategory === cat.id
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{cat.label}</span>
              </button>
            );
          })}
        </div>

        {/* Body Grid */}
        <div className="p-5 flex-1 overflow-y-auto space-y-4">
          {/* Custom File Upload Category */}
          {activeCategory === 'custom' ? (
            <div className="p-6 border-2 border-dashed border-indigo-400/40 rounded-2xl bg-indigo-50/20 dark:bg-indigo-950/10 text-center space-y-3 flex flex-col items-center justify-center">
              <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                <Upload className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-900 dark:text-white">Upload from your device</h4>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 max-w-xs mt-0.5">
                  Pick any photo, graphic, or landscape from your phone or computer.
                </p>
              </div>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                className="hidden"
              />

              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md transition-all cursor-pointer"
              >
                Select Image File
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {filteredPresets.map(wp => {
                const isSelected = currentWallpaper?.value === wp.value;

                return (
                  <button
                    key={wp.id}
                    type="button"
                    onClick={() => handleApplyWallpaper(wp)}
                    className={`group relative aspect-[9/14] rounded-2xl overflow-hidden border-2 text-left transition-all p-2.5 flex flex-col justify-between cursor-pointer hover:scale-[1.02] shadow-sm ${
                      isSelected
                        ? 'border-indigo-600 ring-2 ring-indigo-500/30'
                        : 'border-slate-200 dark:border-slate-800 hover:border-indigo-400'
                    }`}
                    style={
                      wp.type === 'scenery'
                        ? {
                            backgroundImage: `url(${wp.value})`,
                            backgroundSize: 'cover',
                            backgroundPosition: 'center'
                          }
                        : wp.type === 'shape'
                        ? {
                            background: wp.value,
                            backgroundSize: '24px 24px'
                          }
                        : {
                            background: wp.value
                          }
                    }
                  >
                    {/* Dark gradient overlay for text readability */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent pointer-events-none" />

                    {/* Top Status */}
                    <div className="relative z-10 flex justify-between items-start w-full">
                      <span className="text-[9px] uppercase tracking-wider px-1.5 py-0.5 rounded bg-black/40 backdrop-blur-xs text-white font-mono font-medium">
                        {wp.type}
                      </span>
                      {isSelected && (
                        <span className="p-1 rounded-full bg-emerald-500 text-white shadow-xs">
                          <Check className="w-3 h-3 stroke-[3]" />
                        </span>
                      )}
                    </div>

                    {/* Title */}
                    <div className="relative z-10">
                      <p className="text-xs font-bold text-white drop-shadow-sm leading-snug">{wp.name}</p>
                      <span className="text-[9px] text-white/70 block mt-0.5">Click to apply</span>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-3.5 px-5 border-t border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-950/80 flex items-center justify-between shrink-0">
          {currentWallpaper ? (
            <button
              type="button"
              onClick={handleRemoveWallpaper}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/50 transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset to Default</span>
            </button>
          ) : (
            <span className="text-[11px] text-slate-400">Using standard chat wallpaper</span>
          )}

          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl text-xs font-semibold bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-300 dark:hover:bg-slate-700 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
