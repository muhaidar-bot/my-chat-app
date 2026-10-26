import React from 'react';
import {
  X,
  ShieldCheck,
  Download,
  FileCode,
  FileText,
  Heart,
  Calendar,
  Sparkles,
} from 'lucide-react';
import { ChatMessage, UserRole } from '../types';

interface BackupModalProps {
  isOpen: boolean;
  onClose: () => void;
  messages: ChatMessage[];
  currentUser: UserRole;
}

export const BackupModal: React.FC<BackupModalProps> = ({
  isOpen,
  onClose,
  messages,
}) => {
  if (!isOpen) return null;

  const totalPhotos = messages.filter((m) => m.type === 'photo').length;
  const totalVideos = messages.filter((m) => m.type === 'video').length;
  const totalAudios = messages.filter((m) => m.type === 'audio').length;

  const exportJSON = () => {
    const dataStr =
      'data:text/json;charset=utf-8,' +
      encodeURIComponent(
        JSON.stringify(
          {
            title: 'Bayyan ❤️ Muhaidar Love Memories',
            exportedAt: new Date().toISOString(),
            messages,
          },
          null,
          2
        )
      );
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', 'bayyan_muhaidar_memories.json');
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const exportHTML = () => {
    const htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Bayyan ❤️ Muhaidar - Love Scrapbook</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; background: #120716; color: #fce7f3; padding: 24px; margin: 0; }
    .header { text-align: center; padding: 32px 16px; border-bottom: 2px solid #ec4899; }
    .title { font-size: 28px; color: #ff758c; margin: 0; }
    .subtitle { color: #f472b6; font-size: 14px; margin-top: 8px; }
    .container { max-width: 600px; margin: 24px auto; display: flex; flex-direction: column; gap: 16px; }
    .bubble { background: #230d2b; border: 1px solid #701a75; border-radius: 16px; padding: 14px; }
    .bubble.muhaidar { border-left: 4px solid #f43f5e; }
    .bubble.bayyan { border-left: 4px solid #ec4899; }
    .sender { font-weight: bold; color: #f472b6; font-size: 13px; margin-bottom: 6px; }
    .text { font-size: 14px; line-height: 1.5; }
    .time { font-size: 11px; color: #a21caf; text-align: right; margin-top: 8px; }
    img, video { max-width: 100%; border-radius: 12px; margin-top: 8px; }
  </style>
</head>
<body>
  <div class="header">
    <h1 class="title">Bayyan ❤️ Muhaidar</h1>
    <p class="subtitle">Our Cherished Love Memories & Private Messages</p>
    <p style="font-size: 12px; color: #fbcfe8;">Exported on: ${new Date().toLocaleDateString()}</p>
  </div>
  <div class="container">
    ${messages
      .map(
        (m) => `
      <div class="bubble ${m.sender.toLowerCase()}">
        <div class="sender">🌙 ${m.sender}</div>
        ${m.text ? `<div class="text">${m.text}</div>` : ''}
        ${m.type === 'photo' && m.mediaUrl ? `<img src="${m.mediaUrl}" alt="Photo" />` : ''}
        ${m.type === 'video' && m.mediaUrl ? `<video src="${m.mediaUrl}" controls></video>` : ''}
        <div class="time">${new Date(m.timestamp).toLocaleString()} • ${m.status}</div>
      </div>
    `
      )
      .join('')}
  </div>
</body>
</html>`;

    const blob = new Blob([htmlContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'bayyan_muhaidar_scrapbook.html';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
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
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-pink-100">Backup & Memories</h3>
              <p className="text-[11px] text-pink-300/70">Safe & eternal love memories</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-pink-300/70 hover:text-white hover:bg-pink-900/40 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-2 my-4">
          <div className="bg-[#280b2f] p-3 rounded-2xl border border-pink-900/40 flex flex-col items-center text-center">
            <Heart className="w-5 h-5 text-pink-400 mb-1" />
            <span className="text-xl font-bold text-pink-100">{messages.length}</span>
            <span className="text-[11px] text-pink-300/70">Messages Sent</span>
          </div>

          <div className="bg-[#280b2f] p-3 rounded-2xl border border-pink-900/40 flex flex-col items-center text-center">
            <Sparkles className="w-5 h-5 text-amber-400 mb-1" />
            <span className="text-xl font-bold text-pink-100">
              {totalPhotos + totalVideos + totalAudios}
            </span>
            <span className="text-[11px] text-pink-300/70">Photos & Media</span>
          </div>
        </div>

        {/* Export Buttons */}
        <div className="space-y-2.5">
          <button
            onClick={exportHTML}
            className="w-full flex items-center justify-between p-3 rounded-2xl bg-[#290d31] hover:bg-[#34113e] border border-pink-800/40 text-left transition group active:scale-98"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-pink-600/30 border border-pink-500/40 flex items-center justify-center text-pink-300">
                <FileText className="w-5 h-5" />
              </div>
              <div>
                <p className="font-semibold text-xs text-pink-100">Download Romantic Scrapbook (HTML)</p>
                <p className="text-[10px] text-pink-300/70">Styled offline memories with photos</p>
              </div>
            </div>
            <Download className="w-4 h-4 text-pink-400" />
          </button>

          <button
            onClick={exportJSON}
            className="w-full flex items-center justify-between p-3 rounded-2xl bg-[#290d31] hover:bg-[#34113e] border border-pink-800/40 text-left transition group active:scale-98"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-purple-600/30 border border-purple-500/40 flex items-center justify-center text-purple-300">
                <FileCode className="w-5 h-5" />
              </div>
              <div>
                <p className="font-semibold text-xs text-pink-100">Download Raw Backup (JSON)</p>
                <p className="text-[10px] text-pink-300/70">Universal format for safe keeping</p>
              </div>
            </div>
            <Download className="w-4 h-4 text-pink-400" />
          </button>
        </div>

        {/* Security Note */}
        <p className="mt-4 text-[11px] text-pink-300/60 text-center leading-relaxed">
          🔒 Encrypted love tunnel. All memories are stored exclusively between Muhaidar and Bayyan.
        </p>
      </div>
    </div>
  );
};
