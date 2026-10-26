import React, { useEffect, useRef, useState } from 'react';
import {
  Download,
  Play,
  Pause,
  PhoneCall,
  Check,
  CheckCheck,
  Heart,
  Smile,
  Trash2,
  Volume2,
} from 'lucide-react';
import { ChatMessage, UserRole } from '../types';

interface ChatStreamProps {
  messages: ChatMessage[];
  currentUser: UserRole;
  searchQuery: string;
  onMarkSeen: (ids: string[]) => void;
  onToggleReaction: (messageId: string, emoji: string) => void;
  onDeleteMessage: (messageId: string) => void;
  onMediaPreview: (url: string, type: 'photo' | 'video') => void;
}

export const ChatStream: React.FC<ChatStreamProps> = ({
  messages,
  currentUser,
  searchQuery,
  onMarkSeen,
  onToggleReaction,
  onDeleteMessage,
  onMediaPreview,
}) => {
  const bottomRef = useRef<HTMLDivElement>(null);
  const [playingAudioId, setPlayingAudioId] = useState<string | null>(null);
  const audioElementsRef = useRef<{ [key: string]: HTMLAudioElement }>({});
  const [hoveredMessageId, setHoveredMessageId] = useState<string | null>(null);

  // Filter by search query if any
  const filteredMessages = messages.filter((msg) => {
    if (!searchQuery) return true;
    const textMatch = msg.text?.toLowerCase().includes(searchQuery.toLowerCase());
    const senderMatch = msg.sender.toLowerCase().includes(searchQuery.toLowerCase());
    return textMatch || senderMatch;
  });

  // Mark incoming unseen messages as seen
  useEffect(() => {
    const unseenIds = messages
      .filter((m) => m.sender !== currentUser && m.status !== 'seen')
      .map((m) => m.id);

    if (unseenIds.length > 0) {
      onMarkSeen(unseenIds);
    }
  }, [messages, currentUser, onMarkSeen]);

  // Scroll to bottom on new message
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages.length]);

  const handleAudioPlay = (msgId: string, url: string) => {
    if (playingAudioId === msgId) {
      audioElementsRef.current[msgId]?.pause();
      setPlayingAudioId(null);
      return;
    }

    if (playingAudioId && audioElementsRef.current[playingAudioId]) {
      audioElementsRef.current[playingAudioId].pause();
    }

    let audio = audioElementsRef.current[msgId];
    if (!audio) {
      audio = new Audio(url);
      audioElementsRef.current[msgId] = audio;
      audio.onended = () => setPlayingAudioId(null);
    }
    audio.play();
    setPlayingAudioId(msgId);
  };

  const handleDownload = (url: string, filename: string) => {
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const reactionEmojis = ['❤️', '😘', '🥰', '🌹', '✨', '😂'];

  return (
    <div className="flex-1 overflow-y-auto px-3 py-4 space-y-4 scroll-smooth">
      {filteredMessages.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-48 text-center text-pink-200/60 text-sm">
          <Heart className="w-8 h-8 text-pink-400/40 mb-2 animate-bounce" />
          <p className="font-medium text-pink-100">Our Private Love Sanctuary</p>
          <p className="text-xs text-pink-300/50 mt-1">
            Send your first love message, photo, or call ❤️
          </p>
        </div>
      ) : (
        filteredMessages.map((msg) => {
          const isMine = msg.sender === currentUser;
          const formattedTime = new Date(msg.timestamp).toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
          });

          return (
            <div
              key={msg.id}
              className={`flex flex-col ${isMine ? 'items-end' : 'items-start'} group relative`}
              onMouseEnter={() => setHoveredMessageId(msg.id)}
              onMouseLeave={() => setHoveredMessageId(null)}
            >
              {/* Sender Name with Moon matching screenshot */}
              <div className="flex items-center gap-1 mb-1 text-[12px] font-semibold text-pink-300 px-1">
                <span>🌙</span>
                <span>{msg.sender}</span>
                {isMine && <span className="text-[10px] text-pink-400/70 font-normal">(You)</span>}
              </div>

              {/* Message Bubble matching Screenshot shape & deep violet color */}
              <div
                className={`relative max-w-[85%] sm:max-w-[70%] rounded-2xl p-3 shadow-lg transition-all ${
                  isMine
                    ? 'bg-gradient-to-br from-[#2f113a] to-[#220a2b] border border-pink-700/40 text-pink-50 rounded-tr-sm shadow-pink-950/40'
                    : 'bg-gradient-to-br from-[#250d2e] to-[#1a0820] border border-pink-900/40 text-pink-100 rounded-tl-sm shadow-black/50'
                }`}
              >
                {/* 1. Voice / Video Call Log */}
                {msg.type === 'call_log' && (
                  <div className="flex items-center gap-2.5 py-0.5">
                    <div className="w-8 h-8 rounded-full bg-pink-900/60 border border-pink-600/40 flex items-center justify-center text-pink-300">
                      <PhoneCall className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="font-medium text-[13px] text-pink-200">{msg.text}</p>
                      {msg.duration && (
                        <p className="text-[11px] text-pink-400/70">
                          Duration: {Math.floor(msg.duration / 60)}:
                          {(msg.duration % 60).toString().padStart(2, '0')}
                        </p>
                      )}
                    </div>
                  </div>
                )}

                {/* 2. Photo Message */}
                {msg.type === 'photo' && msg.mediaUrl && (
                  <div className="space-y-2">
                    <div className="relative group/media overflow-hidden rounded-xl bg-black/30 border border-pink-900/40">
                      <img
                        src={msg.mediaUrl}
                        alt="Shared memory"
                        onClick={() => onMediaPreview(msg.mediaUrl!, 'photo')}
                        className="max-h-72 w-auto object-cover rounded-xl cursor-pointer hover:scale-[1.02] transition"
                        loading="lazy"
                      />
                      <button
                        onClick={() =>
                          handleDownload(msg.mediaUrl!, msg.mediaName || 'romantic_memory.jpg')
                        }
                        title="Download Photo"
                        className="absolute bottom-2 right-2 p-1.5 rounded-full bg-black/60 hover:bg-black/80 text-white backdrop-blur-md transition border border-white/20"
                      >
                        <Download className="w-4 h-4" />
                      </button>
                    </div>
                    {msg.text && <p className="text-[13px] leading-relaxed pt-1">{msg.text}</p>}
                  </div>
                )}

                {/* 3. Video Message */}
                {msg.type === 'video' && msg.mediaUrl && (
                  <div className="space-y-2">
                    <div className="relative overflow-hidden rounded-xl bg-black/40 border border-pink-900/40">
                      <video
                        src={msg.mediaUrl}
                        controls
                        className="max-h-72 w-full rounded-xl"
                      />
                      <button
                        onClick={() =>
                          handleDownload(msg.mediaUrl!, msg.mediaName || 'romantic_video.mp4')
                        }
                        title="Download Video"
                        className="absolute top-2 right-2 p-1.5 rounded-full bg-black/60 hover:bg-black/80 text-white backdrop-blur-md transition border border-white/20"
                      >
                        <Download className="w-4 h-4" />
                      </button>
                    </div>
                    {msg.text && <p className="text-[13px] leading-relaxed pt-1">{msg.text}</p>}
                  </div>
                )}

                {/* 4. Audio Voice Note */}
                {msg.type === 'audio' && msg.mediaUrl && (
                  <div className="flex items-center gap-3 py-1 pr-1 min-w-[200px]">
                    <button
                      onClick={() => handleAudioPlay(msg.id, msg.mediaUrl!)}
                      className="w-10 h-10 rounded-full bg-gradient-to-tr from-pink-600 to-rose-500 hover:from-pink-500 hover:to-rose-400 active:scale-95 flex items-center justify-center text-white shrink-0 shadow-md shadow-pink-950"
                    >
                      {playingAudioId === msg.id ? (
                        <Pause className="w-4 h-4 fill-current" />
                      ) : (
                        <Play className="w-4 h-4 fill-current ml-0.5" />
                      )}
                    </button>

                    {/* Voice wave bars */}
                    <div className="flex-1 flex flex-col justify-center">
                      <div className="flex items-center gap-0.5 h-6">
                        {[40, 70, 30, 90, 60, 80, 45, 95, 30, 75, 50, 85, 40].map((h, i) => (
                          <span
                            key={i}
                            className={`w-1 rounded-full transition-all ${
                              playingAudioId === msg.id
                                ? 'bg-pink-400 animate-pulse'
                                : 'bg-pink-700/60'
                            }`}
                            style={{ height: `${h}%` }}
                          />
                        ))}
                      </div>
                      <div className="flex justify-between items-center text-[10px] text-pink-300/70 mt-1">
                        <span className="flex items-center gap-1">
                          <Volume2 className="w-3 h-3" /> Voice Note
                        </span>
                        {msg.duration && (
                          <span>
                            {Math.floor(msg.duration / 60)}:
                            {(msg.duration % 60).toString().padStart(2, '0')}
                          </span>
                        )}
                      </div>
                    </div>

                    <button
                      onClick={() =>
                        handleDownload(msg.mediaUrl!, msg.mediaName || 'voice_note.webm')
                      }
                      title="Download Voice Note"
                      className="p-1.5 rounded-full hover:bg-pink-900/40 text-pink-300 transition"
                    >
                      <Download className="w-4 h-4" />
                    </button>
                  </div>
                )}

                {/* 5. Sticker / GIF */}
                {msg.type === 'sticker' && msg.mediaUrl && (
                  <div className="relative group/sticker">
                    <img
                      src={msg.mediaUrl}
                      alt="Love sticker"
                      className="w-40 h-40 object-contain rounded-lg drop-shadow-md"
                    />
                    <button
                      onClick={() =>
                        handleDownload(msg.mediaUrl!, msg.mediaName || 'sticker.gif')
                      }
                      title="Download Sticker"
                      className="absolute bottom-1 right-1 p-1 rounded-full bg-black/60 text-white opacity-0 group-hover/sticker:opacity-100 transition"
                    >
                      <Download className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}

                {/* 6. Standard Text Message */}
                {msg.type === 'text' && (
                  <p className="text-[14px] leading-relaxed break-words whitespace-pre-wrap select-text">
                    {msg.text}
                  </p>
                )}

                {/* Bubble Footer: Timestamp & Seen Indicator matching screenshot */}
                <div className="flex items-center justify-end gap-1.5 mt-1 text-[11px] text-pink-300/60 font-mono select-none">
                  <span>{formattedTime}</span>

                  {/* Seen Indicator */}
                  {isMine ? (
                    <div className="flex items-center" title={`Status: ${msg.status}`}>
                      {msg.status === 'seen' ? (
                        <div className="flex items-center gap-0.5 text-pink-400 font-medium">
                          {/* Screenshot cute smile/seen icon */}
                          <Smile className="w-3.5 h-3.5 stroke-[2.2] text-pink-400" />
                          <span className="text-[9px] uppercase tracking-wider text-pink-300 font-sans">
                            Seen
                          </span>
                        </div>
                      ) : msg.status === 'delivered' ? (
                        <CheckCheck className="w-3.5 h-3.5 text-pink-300/60" />
                      ) : (
                        <Check className="w-3.5 h-3.5 text-pink-300/40" />
                      )}
                    </div>
                  ) : (
                    <Smile className="w-3.5 h-3.5 text-pink-400/70" />
                  )}
                </div>

                {/* Reactions list attached to bottom of bubble */}
                {msg.reactions && Object.keys(msg.reactions).length > 0 && (
                  <div className="absolute -bottom-3 left-2 flex items-center gap-1 bg-[#1c0822] border border-pink-700/50 rounded-full px-2 py-0.5 shadow-md">
                    {Object.entries(msg.reactions).map(([user, emoji]) => (
                      <span key={user} className="text-xs" title={`${user} reacted`}>
                        {emoji}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Action Toolbar on Hover (Quick Reactions & Delete) */}
              {hoveredMessageId === msg.id && (
                <div
                  className={`flex items-center gap-1 mt-1 bg-[#23092b]/95 border border-pink-800/60 rounded-full px-2 py-1 shadow-lg backdrop-blur-md z-10 animate-in fade-in zoom-in-95 duration-100 ${
                    isMine ? 'mr-1' : 'ml-1'
                  }`}
                >
                  {reactionEmojis.map((emoji) => (
                    <button
                      key={emoji}
                      onClick={() => onToggleReaction(msg.id, emoji)}
                      className="hover:scale-125 transition-transform text-sm px-0.5"
                    >
                      {emoji}
                    </button>
                  ))}
                  {isMine && (
                    <button
                      onClick={() => onDeleteMessage(msg.id)}
                      title="Delete for everyone"
                      className="p-1 hover:text-red-400 text-pink-400 transition ml-1"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  )}
                </div>
              )}
            </div>
          );
        })
      )}
      <div ref={bottomRef} />
    </div>
  );
};
