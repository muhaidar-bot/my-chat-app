import React from 'react';
import { MessageCircleHeart, ShieldCheck, Camera, Image as ImageIcon, UserCheck } from 'lucide-react';
import { ActiveTab } from '../types';

interface BottomNavProps {
  activeTab: ActiveTab;
  onSelectTab: (tab: ActiveTab) => void;
  unreadCount?: number;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  activeTab,
  onSelectTab,
  unreadCount = 0,
}) => {
  return (
    <nav className="relative z-20 flex items-center justify-around bg-[#140518]/95 backdrop-blur-md border-t border-pink-950/60 px-2 py-1.5 shrink-0">
      {/* 1. Chat Tab */}
      <button
        onClick={() => onSelectTab('chat')}
        className={`flex flex-col items-center gap-1 transition relative px-3 py-1 ${
          activeTab === 'chat' ? 'text-pink-400 font-semibold' : 'text-pink-300/60 hover:text-pink-200'
        }`}
      >
        <div className="relative">
          <MessageCircleHeart className="w-5 h-5" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1.5 w-4 h-4 rounded-full bg-pink-500 text-[9px] font-bold text-white flex items-center justify-center">
              {unreadCount}
            </span>
          )}
        </div>
        <span className="text-[11px]">Chat</span>
      </button>

      {/* 2. Backup Tab */}
      <button
        onClick={() => onSelectTab('backup')}
        className={`flex flex-col items-center gap-1 transition px-3 py-1 ${
          activeTab === 'backup' ? 'text-pink-400 font-semibold' : 'text-pink-300/60 hover:text-pink-200'
        }`}
      >
        <ShieldCheck className="w-5 h-5" />
        <span className="text-[11px]">Backup</span>
      </button>

      {/* 3. Center Raised Camera Button matching screenshot */}
      <div className="relative -top-4 flex flex-col items-center">
        <button
          onClick={() => onSelectTab('camera')}
          title="Snapchat Camera"
          className="w-14 h-14 rounded-full bg-gradient-to-tr from-pink-600 via-rose-500 to-amber-400 p-0.5 shadow-xl shadow-pink-600/40 hover:scale-105 active:scale-95 transition-transform flex items-center justify-center border-4 border-[#140518]"
        >
          <div className="w-full h-full rounded-full bg-gradient-to-br from-pink-500 to-rose-600 flex items-center justify-center text-white">
            <Camera className="w-6 h-6 stroke-[2.2]" />
          </div>
        </button>
        <span className="text-[10px] text-pink-300/80 font-medium -mt-1">Camera</span>
      </div>

      {/* 4. Theme Tab */}
      <button
        onClick={() => onSelectTab('theme')}
        className={`flex flex-col items-center gap-1 transition px-3 py-1 ${
          activeTab === 'theme' ? 'text-pink-400 font-semibold' : 'text-pink-300/60 hover:text-pink-200'
        }`}
      >
        <ImageIcon className="w-5 h-5" />
        <span className="text-[11px]">Theme</span>
      </button>

      {/* 5. Profile Tab */}
      <button
        onClick={() => onSelectTab('profile')}
        className={`flex flex-col items-center gap-1 transition px-3 py-1 ${
          activeTab === 'profile' ? 'text-pink-400 font-semibold' : 'text-pink-300/60 hover:text-pink-200'
        }`}
      >
        <UserCheck className="w-5 h-5" />
        <span className="text-[11px]">Profile</span>
      </button>
    </nav>
  );
};
