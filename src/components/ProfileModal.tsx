import React, { useState, useEffect } from 'react';
import {
  X,
  UserCheck,
  Heart,
  Smartphone,
  Share2,
  Copy,
  Check,
  Sparkles,
  Calendar,
} from 'lucide-react';
import { UserRole } from '../types';

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserRole;
  onSwitchUser: (newUser: UserRole) => void;
  isPartnerOnline: boolean;
}

export const ProfileModal: React.FC<ProfileModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onSwitchUser,
  isPartnerOnline,
}) => {
  const [copied, setCopied] = useState(false);
  const [elapsed, setElapsed] = useState({ days: 365, hours: 14, mins: 28, secs: 10 });

  // Love duration counter from an anniversary date (e.g. 1 year +)
  useEffect(() => {
    const startDate = new Date('2025-01-01T00:00:00').getTime();
    const update = () => {
      const now = Date.now();
      const diff = Math.max(0, now - startDate);
      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
      const mins = Math.floor((diff / (1000 * 60)) % 60);
      const secs = Math.floor((diff / 1000) % 60);
      setElapsed({ days, hours, mins, secs });
    };
    update();
    const interval = window.setInterval(update, 1000);
    return () => clearInterval(interval);
  }, []);

  if (!isOpen) return null;

  const partnerName = currentUser === 'Muhaidar' ? 'Bayyan' : 'Muhaidar';

  const copyAppUrl = () => {
    navigator.clipboard.writeText(window.location.origin);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/70 backdrop-blur-md animate-in fade-in duration-150">
      <div
        className="relative w-full max-w-sm rounded-3xl bg-[#1c0822] border border-pink-700/50 p-5 shadow-2xl text-white animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-pink-900/40">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-pink-900/60 flex items-center justify-center text-pink-300">
              <UserCheck className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-pink-100">Couple Profile & Devices</h3>
              <p className="text-[11px] text-pink-300/70">bayyan ❤️ muhaidar</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-pink-300/70 hover:text-white hover:bg-pink-900/40 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Identity Selector Box */}
        <div className="my-4 p-4 rounded-2xl bg-[#260b2e] border border-pink-800/40">
          <p className="text-xs text-pink-300/80 mb-2 font-medium">
            Currently using this phone / device as:
          </p>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => onSwitchUser('Muhaidar')}
              className={`p-3 rounded-xl border flex flex-col items-center gap-1 transition ${
                currentUser === 'Muhaidar'
                  ? 'bg-gradient-to-tr from-pink-600 to-rose-500 border-pink-400 text-white shadow-lg'
                  : 'bg-[#1c0822] border-pink-900/60 text-pink-200 hover:border-pink-700'
              }`}
            >
              <span className="text-2xl">🌙</span>
              <span className="font-bold text-xs">Muhaidar</span>
              <span className="text-[10px] opacity-80">His Account</span>
            </button>

            <button
              onClick={() => onSwitchUser('Bayyan')}
              className={`p-3 rounded-xl border flex flex-col items-center gap-1 transition ${
                currentUser === 'Bayyan'
                  ? 'bg-gradient-to-tr from-pink-600 to-rose-500 border-pink-400 text-white shadow-lg'
                  : 'bg-[#1c0822] border-pink-900/60 text-pink-200 hover:border-pink-700'
              }`}
            >
              <span className="text-2xl">🌸</span>
              <span className="font-bold text-xs">Bayyan</span>
              <span className="text-[10px] opacity-80">Her Account</span>
            </button>
          </div>
        </div>

        {/* Love Duration Counter */}
        <div className="p-3 rounded-2xl bg-gradient-to-r from-pink-950/60 to-purple-950/60 border border-pink-800/40 text-center mb-4">
          <div className="flex items-center justify-center gap-1 text-pink-400 text-xs font-semibold mb-1">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Time In Love Together</span>
            <Heart className="w-3.5 h-3.5 text-pink-500 fill-current" />
          </div>
          <div className="flex items-center justify-center gap-2 font-mono text-pink-100 font-bold text-sm">
            <span>{elapsed.days}d</span>
            <span>:</span>
            <span>{elapsed.hours}h</span>
            <span>:</span>
            <span>{elapsed.mins}m</span>
            <span>:</span>
            <span>{elapsed.secs}s</span>
          </div>
          <p className="text-[10px] text-pink-300/60 mt-1">Our Forever & Moon • Unbreakable</p>
        </div>

        {/* Multi-Device Setup Info */}
        <div className="p-3 rounded-2xl bg-[#23092a] border border-pink-900/40 space-y-2 text-xs">
          <div className="flex items-center gap-2 text-pink-200 font-semibold">
            <Smartphone className="w-4 h-4 text-pink-400" />
            <span>How to use on Two Phones / Multiple Devices</span>
          </div>
          <p className="text-[11px] text-pink-300/80 leading-relaxed">
            1. Share this app link with {partnerName}:
          </p>
          <div className="flex items-center gap-2 bg-[#17051c] p-2 rounded-xl border border-pink-900/50">
            <span className="text-[10px] text-pink-300 font-mono truncate flex-1">
              {window.location.origin}
            </span>
            <button
              onClick={copyAppUrl}
              className="px-2 py-1 bg-pink-700/60 hover:bg-pink-600 rounded-lg text-[10px] font-bold text-white flex items-center gap-1 shrink-0"
            >
              {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
              <span>{copied ? 'Copied!' : 'Copy'}</span>
            </button>
          </div>
          <p className="text-[11px] text-pink-300/80 leading-relaxed">
            2. When {partnerName} opens it on her/his phone, select <strong>{partnerName}</strong>. Everything will immediately sync in real-time between both phones!
          </p>
        </div>

        <button
          onClick={onClose}
          className="mt-4 w-full py-2.5 rounded-2xl bg-gradient-to-r from-pink-600 to-rose-500 text-xs font-bold text-white shadow-lg transition active:scale-95"
        >
          Close
        </button>
      </div>
    </div>
  );
};
