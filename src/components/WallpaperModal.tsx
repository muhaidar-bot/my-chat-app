import React, { useState, useRef } from 'react';
import {
  X,
  Upload,
  Check,
  Sparkles,
  Sliders,
  Image as ImageIcon,
  Heart,
} from 'lucide-react';
import { UserRole, WallpaperState } from '../types';

interface WallpaperModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentWallpaper: WallpaperState;
  onUpdateWallpaper: (wallpaper: Partial<WallpaperState>) => void;
  currentUser: UserRole;
}

const PRESETS = [
  {
    name: 'Our Romantic Photo (Default)',
    url: '/assets/aistudio/79918_d9859049.jpg',
    preview: '/assets/aistudio/79918_d9859049.jpg',
  },
  {
    name: 'Midnight Moon & Stars',
    url: 'https://images.unsplash.com/photo-1532767153582-b1a0e5145009?w=1200&auto=format&fit=crop&q=80',
    preview: 'https://images.unsplash.com/photo-1532767153582-b1a0e5145009?w=300&auto=format&fit=crop&q=80',
  },
  {
    name: 'Sunset Lovers Embrace',
    url: 'https://images.unsplash.com/photo-1518199266791-5375a83190b7?w=1200&auto=format&fit=crop&q=80',
    preview: 'https://images.unsplash.com/photo-1518199266791-5375a83190b7?w=300&auto=format&fit=crop&q=80',
  },
  {
    name: 'Romantic Candlelit Rose',
    url: 'https://images.unsplash.com/photo-1559563458-527698bf5295?w=1200&auto=format&fit=crop&q=80',
    preview: 'https://images.unsplash.com/photo-1559563458-527698bf5295?w=300&auto=format&fit=crop&q=80',
  },
  {
    name: 'Deep Purple Romance Minimal',
    url: 'https://images.unsplash.com/photo-1550684848-fac1c5b4e853?w=1200&auto=format&fit=crop&q=80',
    preview: 'https://images.unsplash.com/photo-1550684848-fac1c5b4e853?w=300&auto=format&fit=crop&q=80',
  },
];

export const WallpaperModal: React.FC<WallpaperModalProps> = ({
  isOpen,
  onClose,
  currentWallpaper,
  onUpdateWallpaper,
  currentUser,
}) => {
  const [selectedUrl, setSelectedUrl] = useState(currentWallpaper.url);
  const [blur, setBlur] = useState(currentWallpaper.blur ?? 4);
  const [dim, setDim] = useState(currentWallpaper.dim ?? 35);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleApply = () => {
    onUpdateWallpaper({
      url: selectedUrl,
      blur,
      dim,
      type: 'custom',
    });
    onClose();
  };

  const handleCustomUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    const reader = new FileReader();
    reader.onload = async () => {
      const base64Data = reader.result as string;
      try {
        const response = await fetch('/api/upload', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            data: base64Data,
            filename: file.name,
            fileType: file.type,
          }),
        });
        const data = await response.json();
        if (data.url) {
          setSelectedUrl(data.url);
        }
      } catch (err) {
        console.error('Upload failed:', err);
        // Fallback to data URL
        setSelectedUrl(base64Data);
      } finally {
        setIsUploading(false);
      }
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/70 backdrop-blur-md animate-in fade-in duration-150">
      <div
        className="relative w-full max-w-md max-h-[90vh] overflow-y-auto rounded-3xl bg-[#1c0822] border border-pink-700/50 p-5 shadow-2xl text-white animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-pink-900/40">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-pink-900/60 flex items-center justify-center text-pink-300">
              <ImageIcon className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-pink-100">Shared Live Wallpaper</h3>
              <p className="text-[11px] text-pink-300/70">
                Syncs instantly to both Muhaidar and Bayyan
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-pink-300/70 hover:text-white hover:bg-pink-900/40 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Live Wallpaper Preview Card */}
        <div className="relative my-4 h-44 rounded-2xl overflow-hidden border border-pink-700/50 shadow-inner">
          <img
            src={selectedUrl}
            alt="Preview wallpaper"
            style={{
              filter: `blur(${blur}px)`,
            }}
            className="w-full h-full object-cover scale-110"
          />
          <div
            className="absolute inset-0 bg-[#120716]"
            style={{ opacity: dim / 100 }}
          />

          {/* Sample Chat Message on top of preview */}
          <div className="absolute inset-0 flex flex-col justify-end p-3 pointer-events-none">
            <div className="self-start max-w-[80%] rounded-2xl bg-[#230e2b]/90 border border-pink-800/60 p-2.5 text-xs text-pink-100 shadow-lg">
              <span className="font-bold text-pink-400 text-[10px] block">🌙 Muhaidar</span>
              I love you so much my moon ❤️
            </div>
            <div className="self-end max-w-[80%] rounded-2xl bg-[#2f113a]/90 border border-pink-700/60 p-2.5 text-xs text-pink-100 shadow-lg mt-1.5">
              <span className="font-bold text-pink-300 text-[10px] block">🌙 Bayyan</span>
              Forever & always baby! 🥰
            </div>
          </div>
        </div>

        {/* Sliders for Blur and Dim */}
        <div className="space-y-3 p-3 rounded-2xl bg-[#270b2e]/80 border border-pink-900/40 text-xs">
          <div className="flex items-center justify-between font-medium text-pink-200">
            <span className="flex items-center gap-1.5">
              <Sliders className="w-3.5 h-3.5 text-pink-400" /> Wallpaper Blur
            </span>
            <span className="font-mono text-pink-300">{blur}px</span>
          </div>
          <input
            type="range"
            min="0"
            max="16"
            step="1"
            value={blur}
            onChange={(e) => setBlur(Number(e.target.value))}
            className="w-full accent-pink-500 cursor-pointer"
          />

          <div className="flex items-center justify-between font-medium text-pink-200 pt-1">
            <span className="flex items-center gap-1.5">
              <Sliders className="w-3.5 h-3.5 text-pink-400" /> Background Dimming
            </span>
            <span className="font-mono text-pink-300">{dim}%</span>
          </div>
          <input
            type="range"
            min="0"
            max="80"
            step="5"
            value={dim}
            onChange={(e) => setDim(Number(e.target.value))}
            className="w-full accent-pink-500 cursor-pointer"
          />
        </div>

        {/* Upload Custom Photo Button */}
        <div className="my-3">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleCustomUpload}
            className="hidden"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
            className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-2xl bg-gradient-to-r from-pink-600/30 to-purple-600/30 hover:from-pink-600/40 hover:to-purple-600/40 border border-pink-500/50 text-pink-100 text-xs font-semibold transition active:scale-98"
          >
            <Upload className="w-4 h-4 text-pink-400" />
            <span>{isUploading ? 'Uploading custom photo...' : 'Upload Our Photo as Wallpaper'}</span>
          </button>
        </div>

        {/* Presets Grid */}
        <div className="space-y-2">
          <span className="text-xs font-semibold text-pink-300">Romantic Presets</span>
          <div className="grid grid-cols-3 gap-2">
            {PRESETS.map((preset, idx) => (
              <button
                key={idx}
                onClick={() => setSelectedUrl(preset.url)}
                className={`group relative h-20 rounded-xl overflow-hidden border-2 transition ${
                  selectedUrl === preset.url
                    ? 'border-pink-500 ring-2 ring-pink-500/50 scale-102'
                    : 'border-pink-900/40 hover:border-pink-700/70 opacity-75 hover:opacity-100'
                }`}
              >
                <img
                  src={preset.preview}
                  alt={preset.name}
                  className="w-full h-full object-cover"
                />
                <span className="absolute inset-x-0 bottom-0 bg-black/70 p-0.5 text-[9px] text-pink-200 text-center truncate">
                  {preset.name}
                </span>
                {selectedUrl === preset.url && (
                  <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-pink-500 flex items-center justify-center text-white text-[10px]">
                    <Check className="w-2.5 h-2.5" />
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Sync Status Banner */}
        <div className="mt-4 flex items-center justify-between text-[11px] text-pink-300/80 bg-pink-950/40 p-2.5 rounded-xl border border-pink-900/30">
          <span className="flex items-center gap-1.5">
            <Heart className="w-3.5 h-3.5 text-pink-400" />
            Applied by: {currentWallpaper.updatedBy || currentUser}
          </span>
          <span className="text-pink-400 font-medium">Auto-syncs to both</span>
        </div>

        {/* Action Button */}
        <div className="mt-4 flex gap-2">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 rounded-2xl bg-white/10 hover:bg-white/20 text-xs font-medium text-pink-200 transition"
          >
            Cancel
          </button>
          <button
            onClick={handleApply}
            className="flex-1 py-2.5 rounded-2xl bg-gradient-to-r from-pink-600 to-rose-500 hover:from-pink-500 hover:to-rose-400 text-xs font-bold text-white shadow-lg shadow-pink-600/40 transition active:scale-95 flex items-center justify-center gap-1.5"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Apply to Both Phones</span>
          </button>
        </div>
      </div>
    </div>
  );
};
