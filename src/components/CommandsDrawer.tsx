import React, { useState } from 'react';
import {
  Sparkles,
  X,
  ChevronRight,
  Flower2,
  Image as ImageIcon,
  ShieldCheck,
  Database,
  Camera,
} from 'lucide-react';
import { UserRole, SupabaseStatus } from '../types';

interface CommandsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserRole;
  onSwitchProfile: () => void;
  onOpenWallpaper: () => void;
  onOpenBackup: () => void;
  onOpenCamera: () => void;
  isConnected: boolean;
  isPartnerOnline: boolean;
  supabaseStatus?: SupabaseStatus;
}

export const CommandsDrawer: React.FC<CommandsDrawerProps> = ({
  isOpen,
  onClose,
  currentUser,
  onSwitchProfile,
  onOpenWallpaper,
  onOpenBackup,
  onOpenCamera,
  isConnected,
  isPartnerOnline,
  supabaseStatus,
}) => {
  const [showSupabaseInfo, setShowSupabaseInfo] = useState(false);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/60 backdrop-blur-sm animate-in fade-in duration-150">
      <div
        className="relative w-full max-w-sm rounded-3xl bg-[#1c0822] border border-pink-700/50 p-5 shadow-2xl text-white animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header matching Image 2 */}
        <div className="flex items-center justify-between pb-4 border-b border-pink-900/40">
          <div className="flex items-center gap-2 text-pink-300 font-bold tracking-wide text-sm uppercase">
            <Sparkles className="w-4 h-4 text-pink-400" />
            <span>COMMANDS & TOOLS</span>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-pink-300/70 hover:text-white hover:bg-pink-900/40 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* List of items matching Image 2 */}
        <div className="space-y-3 pt-4">
          {/* 1. Switch Profile */}
          <button
            onClick={() => {
              onSwitchProfile();
              onClose();
            }}
            className="w-full flex items-center justify-between p-3 rounded-2xl bg-[#290d31]/80 hover:bg-[#34113e] border border-pink-800/40 transition group text-left"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-rose-500 to-pink-500 flex items-center justify-center text-white shadow-md shadow-pink-950">
                <Flower2 className="w-5 h-5" />
              </div>
              <div>
                <p className="font-semibold text-sm text-pink-100 group-hover:text-white">
                  Switch Profile
                </p>
                <p className="text-xs text-pink-300/70">
                  Logged in: <strong className="text-pink-300">{currentUser}</strong> (Click to switch)
                </p>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-pink-400/60 group-hover:translate-x-0.5 transition" />
          </button>

          {/* 2. Wallpaper & Themes */}
          <button
            onClick={() => {
              onOpenWallpaper();
              onClose();
            }}
            className="w-full flex items-center justify-between p-3 rounded-2xl bg-[#290d31]/80 hover:bg-[#34113e] border border-pink-800/40 transition group text-left"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-purple-600 to-pink-500 flex items-center justify-center text-white shadow-md shadow-pink-950">
                <ImageIcon className="w-5 h-5" />
              </div>
              <div>
                <p className="font-semibold text-sm text-pink-100 group-hover:text-white">
                  Wallpaper & Themes
                </p>
                <p className="text-xs text-pink-300/70">
                  Custom photos & romantic styles (Live Synced!)
                </p>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-pink-400/60 group-hover:translate-x-0.5 transition" />
          </button>

          {/* 3. Backup & Export Chat */}
          <button
            onClick={() => {
              onOpenBackup();
              onClose();
            }}
            className="w-full flex items-center justify-between p-3 rounded-2xl bg-[#290d31]/80 hover:bg-[#34113e] border border-pink-800/40 transition group text-left"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-pink-700 to-rose-600 flex items-center justify-center text-white shadow-md shadow-pink-950">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <p className="font-semibold text-sm text-pink-100 group-hover:text-white">
                  Backup & Export Chat
                </p>
                <p className="text-xs text-pink-300/70">
                  Download memories HTML & JSON
                </p>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-pink-400/60 group-hover:translate-x-0.5 transition" />
          </button>

          {/* 4. Cloud Sync Status matching Image 2 */}
          <button
            onClick={() => setShowSupabaseInfo(true)}
            className="w-full flex items-center justify-between p-3 rounded-2xl bg-[#290d31]/80 hover:bg-[#34113e] border border-pink-800/40 text-left transition group"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white shadow-md shadow-pink-950">
                <Database className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <p className="font-semibold text-sm text-pink-100 group-hover:text-white">
                    Cloud Sync Status
                  </p>
                  <span
                    className={`text-[10px] px-1.5 py-0.2 rounded font-medium ${
                      supabaseStatus?.status === 'connected'
                        ? 'bg-emerald-950 text-emerald-300 border border-emerald-700/50'
                        : 'bg-purple-950 text-pink-300 border border-pink-700/50'
                    }`}
                  >
                    {supabaseStatus?.status === 'connected' ? 'Realtime' : 'Supabase'}
                  </span>
                </div>
                <p className="text-xs text-pink-300/70">
                  Supabase backend connection
                </p>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-pink-400/60 group-hover:translate-x-0.5 transition" />
          </button>

          {/* 5. Snapchat Camera */}
          <button
            onClick={() => {
              onOpenCamera();
              onClose();
            }}
            className="w-full flex items-center justify-between p-3 rounded-2xl bg-[#290d31]/80 hover:bg-[#34113e] border border-pink-800/40 transition group text-left"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-rose-500 via-pink-600 to-amber-500 flex items-center justify-center text-white shadow-md shadow-pink-950">
                <Camera className="w-5 h-5" />
              </div>
              <div>
                <p className="font-semibold text-sm text-pink-100 group-hover:text-white">
                  Snapchat Camera
                </p>
                <p className="text-xs text-pink-300/70">
                  10+ filters & decorative overlays
                </p>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-pink-400/60 group-hover:translate-x-0.5 transition" />
          </button>
        </div>

        {/* Supabase Connection Info Modal */}
        {showSupabaseInfo && (
          <div
            className="fixed inset-0 z-60 flex items-center justify-center p-3 bg-black/80 backdrop-blur-md animate-in fade-in duration-150"
            onClick={(e) => {
              e.stopPropagation();
              setShowSupabaseInfo(false);
            }}
          >
            <div
              className="relative w-full max-w-sm rounded-3xl bg-[#1c0822] border border-pink-700/60 p-5 shadow-2xl text-white"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between pb-3 border-b border-pink-900/40">
                <div className="flex items-center gap-2">
                  <Database className="w-5 h-5 text-emerald-400" />
                  <h3 className="font-bold text-sm text-pink-100">Supabase Realtime Cloud</h3>
                </div>
                <button
                  onClick={() => setShowSupabaseInfo(false)}
                  className="p-1 rounded-full text-pink-300/70 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-3 my-3 text-xs">
                <div className="bg-[#280b2f] p-3 rounded-2xl border border-pink-900/40 space-y-1.5">
                  <div className="flex justify-between items-center">
                    <span className="text-pink-300/70">Project URL</span>
                    <span className="font-mono text-emerald-300 text-[11px] truncate max-w-[170px]">
                      https://yzihbeegbwxiykomeaxw.supabase.co
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-pink-300/70">Target Table</span>
                    <span className="font-mono text-pink-100 font-bold">messages</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-pink-300/70">Sync Engine</span>
                    <span className="text-emerald-400 font-semibold">Instagram DM Realtime</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-pink-300/70">Status</span>
                    <span className="text-pink-200">
                      {supabaseStatus?.hasKey
                        ? '🟢 Connected & Synced'
                        : '🟡 Configured (Ready for Key)'}
                    </span>
                  </div>
                </div>

                <div className="bg-[#23092a] p-3 rounded-2xl border border-pink-900/40 space-y-1.5">
                  <p className="font-semibold text-pink-200 text-[11px] flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-pink-400" />
                    Instagram-like Realtime Sync
                  </p>
                  <p className="text-[11px] text-pink-300/80 leading-relaxed">
                    Messages are synchronized directly to your Supabase table <strong>&quot;messages&quot;</strong> across both devices instantly with zero delay.
                  </p>
                </div>
              </div>

              <button
                onClick={() => setShowSupabaseInfo(false)}
                className="w-full py-2.5 rounded-2xl bg-gradient-to-r from-pink-600 to-rose-500 text-xs font-bold text-white shadow-md transition"
              >
                Close
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
