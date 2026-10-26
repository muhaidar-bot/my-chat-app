import React, { useState } from 'react';
import { Download, Smartphone, X, Sparkles } from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';

export const PWAInstallBanner: React.FC = () => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSGuide, setShowIOSGuide] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);

  // If already running as an installed PWA, hide banner
  if (isInstalled || isDismissed) {
    return null;
  }

  return (
    <>
      <div className="bg-gradient-to-r from-pink-950/90 via-purple-950/90 to-rose-950/90 border-b border-pink-700/40 px-3 py-1.5 flex items-center justify-between text-xs text-white z-20 shrink-0">
        <div className="flex items-center gap-2">
          <Smartphone className="w-4 h-4 text-pink-400 shrink-0" />
          <span className="text-[11px] text-pink-100 font-medium truncate">
            Install <strong>bayyan ❤️ muhaidar</strong> on your phone
          </span>
        </div>

        <div className="flex items-center gap-2">
          {/* Chromium / Android / PC Flow */}
          {isInstallable && (
            <button
              onClick={install}
              className="flex items-center gap-1 bg-gradient-to-r from-pink-600 to-rose-500 hover:from-pink-500 hover:to-rose-400 text-white font-bold px-2.5 py-1 rounded-full text-[11px] shadow-sm transition active:scale-95"
            >
              <Download className="w-3 h-3" />
              <span>Install</span>
            </button>
          )}

          {/* iOS Safari Flow */}
          {isIOS && (
            <button
              onClick={() => setShowIOSGuide(true)}
              className="flex items-center gap-1 bg-gradient-to-r from-pink-600 to-rose-500 text-white font-bold px-2.5 py-1 rounded-full text-[11px] shadow-sm transition active:scale-95"
            >
              <Download className="w-3 h-3" />
              <span>iPhone App</span>
            </button>
          )}

          <button
            onClick={() => setIsDismissed(true)}
            className="p-1 text-pink-300/70 hover:text-white"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* iOS Safari Step-by-step Modal */}
      {showIOSGuide && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
          <div className="w-full max-w-sm rounded-3xl bg-[#1c0822] border border-pink-700/60 p-6 shadow-2xl text-white">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-base font-bold text-pink-100 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-pink-400" />
                Install on iPhone / iPad
              </h3>
              <button
                onClick={() => setShowIOSGuide(false)}
                className="p-1 rounded-full text-pink-300 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-3 text-xs text-pink-200/90 leading-relaxed bg-[#280b2f] p-3.5 rounded-2xl border border-pink-900/40">
              <p>
                1. Tap the <strong>Share</strong> button <span className="text-base">⎋</span> at the bottom of Safari toolbar.
              </p>
              <p>
                2. Scroll down and tap <strong>Add to Home Screen</strong> <span className="text-base">➕</span>.
              </p>
              <p>
                3. Tap <strong>Add</strong> in the top right.
              </p>
            </div>
            <p className="text-[11px] text-pink-300/60 text-center mt-3">
              Once added, it opens as a full-screen standalone romantic app without browser bars!
            </p>
            <button
              onClick={() => setShowIOSGuide(false)}
              className="mt-4 w-full rounded-2xl bg-gradient-to-r from-pink-600 to-rose-500 py-2.5 text-xs font-bold text-white shadow-md"
            >
              Got it
            </button>
          </div>
        </div>
      )}
    </>
  );
};
