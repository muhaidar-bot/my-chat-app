import React from 'react';
import { Phone, Video, Camera, MoreVertical, Wifi } from 'lucide-react';
import { UserRole } from '../types';

interface HeaderProps {
  currentUser: UserRole;
  isPartnerOnline: boolean;
  partnerIsTyping: boolean;
  onVoiceCall: () => void;
  onVideoCall: () => void;
  onOpenCamera: () => void;
  onOpenCommands: () => void;
  onOpenProfile: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentUser,
  isPartnerOnline,
  partnerIsTyping,
  onVoiceCall,
  onVideoCall,
  onOpenCamera,
  onOpenCommands,
  onOpenProfile,
}) => {
  const partnerName = currentUser === 'Muhaidar' ? 'Bayyan' : 'Muhaidar';

  return (
    <header className="relative z-20 flex flex-col bg-[#160719]/90 backdrop-blur-md border-b border-pink-950/40 text-white shrink-0">
      {/* Top simulated status bar */}
      <div className="flex items-center justify-between px-4 pt-1.5 pb-0.5 text-[11px] text-pink-200/60 font-medium tracking-tight">
        <span className="font-semibold text-pink-100">
          {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </span>
        <div className="flex items-center gap-1.5">
          <Wifi className="w-3.5 h-3.5" />
          <span className="text-[10px] bg-pink-900/50 px-1 rounded border border-pink-700/40 text-pink-300">
            VoWiFi
          </span>
          <span className="font-mono text-[10px]">76%</span>
        </div>
      </div>

      {/* Main Header bar */}
      <div className="flex items-center justify-between px-3 py-2">
        {/* Left: Crescent Moon Avatar & Info */}
        <button
          onClick={onOpenProfile}
          className="flex items-center gap-2.5 text-left group hover:opacity-90 transition"
        >
          {/* Crescent Moon Avatar matching Image 1 */}
          <div className="relative w-10 h-10 rounded-full bg-[#270b2e] border-2 border-pink-500/60 flex items-center justify-center shadow-lg shadow-pink-950/60">
            <svg
              className="w-6 h-6 text-pink-400 group-hover:scale-110 transition-transform"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" fill="#ff7eb3" />
            </svg>
            {/* Online indicator dot */}
            <span
              className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-[#160719] ${
                isPartnerOnline ? 'bg-emerald-400' : 'bg-gray-400'
              }`}
            />
          </div>

          <div className="flex flex-col">
            <div className="flex items-center gap-1">
              <span className="font-bold text-[16px] text-pink-100 tracking-wide">
                {partnerName}
              </span>
              <span className="text-pink-500 text-sm">❤️</span>
            </div>
            <span className="text-[11px] text-pink-300/80 truncate max-w-[150px] sm:max-w-[200px]">
              {partnerIsTyping ? (
                <span className="text-pink-400 animate-pulse font-medium">
                  typing love notes...
                </span>
              ) : isPartnerOnline ? (
                '• My Forever & Moon ...'
              ) : (
                '• Offline (saved in heart)'
              )}
            </span>
          </div>
        </button>

        {/* Right Action Icons */}
        <div className="flex items-center gap-1 sm:gap-2">
          {/* Phone Call */}
          <button
            onClick={onVoiceCall}
            title="Voice Call"
            className="w-9 h-9 rounded-full flex items-center justify-center bg-pink-950/50 hover:bg-pink-900/60 active:scale-95 text-pink-200 transition border border-pink-800/30"
          >
            <Phone className="w-4 h-4" />
          </button>

          {/* Video Call */}
          <button
            onClick={onVideoCall}
            title="Video Call"
            className="w-9 h-9 rounded-full flex items-center justify-center bg-pink-950/50 hover:bg-pink-900/60 active:scale-95 text-pink-200 transition border border-pink-800/30"
          >
            <Video className="w-4 h-4" />
          </button>

          {/* Snapchat Camera Button - Solid pink/magenta circle */}
          <button
            onClick={onOpenCamera}
            title="Snapchat Camera"
            className="w-9 h-9 rounded-full flex items-center justify-center bg-gradient-to-tr from-pink-600 to-rose-500 hover:from-pink-500 hover:to-rose-400 active:scale-95 text-white shadow-md shadow-pink-600/40 transition"
          >
            <Camera className="w-4 h-4" />
          </button>

          {/* 3-Dots Menu */}
          <button
            onClick={onOpenCommands}
            title="Commands & Tools"
            className="w-9 h-9 rounded-full flex items-center justify-center bg-pink-950/50 hover:bg-pink-900/60 active:scale-95 text-pink-300 transition border border-pink-800/30"
          >
            <MoreVertical className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};
