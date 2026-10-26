import React, { useState } from 'react';
import { Search, Heart, Smile, Sparkles, Image as ImageIcon, X } from 'lucide-react';

interface EmojiStickerPickerProps {
  onSelectEmoji: (emoji: string) => void;
  onSelectStickerOrGif: (url: string, type: 'sticker') => void;
  onClose: () => void;
}

const EMOJI_CATEGORIES = [
  {
    name: 'Love & Romance',
    icon: '❤️',
    emojis: [
      '❤️', '💖', '💕', '💞', '💓', '💗', '💘', '💝', '💟', '💌',
      '😍', '🥰', '😘', '😗', '😙', '😚', '😻', '👩‍❤️‍👨', '👩‍❤️‍💋‍👨', '💍',
      '🌹', '🌸', '🌺', '🌷', '💐', '🍫', '🥂', '🍷', '🕯️', '🌙',
      '✨', '⭐', '🕊️', '🧸', '💏', '👰', '🤵', '💋', '👄', '🔥'
    ],
  },
  {
    name: 'Smileys & Expressions',
    icon: '😊',
    emojis: [
      '😀', '😃', '😄', '😁', '😆', '😅', '🤣', '😂', '🙂', '🙃',
      '😉', '😊', '😇', '😋', '😛', '😜', '🤪', '😝', '🤑', '🤗',
      '🤭', '🤫', '🤔', '🤐', '🤨', '😐', '😑', '😶', '😏', '😒',
      '🙄', '😬', '🤥', '😌', '😔', '😪', '🤤', '😴', '😷', '🤒'
    ],
  },
  {
    name: 'Hands & Gestures',
    icon: '🫶',
    emojis: [
      '🫶', '🤲', '👐', '🙌', '👏', '🤝', '👍', '👎', '👊', '✊',
      '🤛', '🤜', '🤞', '✌️', '🫰', '🤟', '🤘', '👌', '🤌', '🤏',
      '👈', '👉', '👆', '👇', '☝️', '✋', '🤚', '🖐️', '🖖', '👋'
    ],
  },
  {
    name: 'Cute & Celebrations',
    icon: '🎉',
    emojis: [
      '🎉', '🎊', '🎈', '🎂', '🍰', '🎁', '🎀', '🪄', '👑', '💎',
      '💫', '🌟', '🧁', '🍭', '🍓', '🍒', '☕', '🥐', '🐱', '🐰'
    ],
  },
];

// Rich romantic stickers
const ROMANTIC_STICKERS = [
  {
    id: 's-1',
    name: 'I love you heart',
    url: 'https://images.unsplash.com/photo-1518199266791-5375a83190b7?w=300&auto=format&fit=crop&q=80',
    tags: ['love', 'heart', 'romantic'],
  },
  {
    id: 's-2',
    name: 'Pink Rose Bouquet',
    url: 'https://images.unsplash.com/photo-1559563458-527698bf5295?w=300&auto=format&fit=crop&q=80',
    tags: ['rose', 'flower', 'romance'],
  },
  {
    id: 's-3',
    name: 'Sweet Couple Silhouette',
    url: 'https://images.unsplash.com/photo-1516589178581-6cd7833ae3b2?w=300&auto=format&fit=crop&q=80',
    tags: ['couple', 'hug', 'kiss'],
  },
  {
    id: 's-4',
    name: 'Cute Teddy Bear',
    url: 'https://images.unsplash.com/photo-1559454403-b8fb88521f11?w=300&auto=format&fit=crop&q=80',
    tags: ['teddy', 'cute', 'hug'],
  },
  {
    id: 's-5',
    name: 'Moon and Stars',
    url: 'https://images.unsplash.com/photo-1532767153582-b1a0e5145009?w=300&auto=format&fit=crop&q=80',
    tags: ['moon', 'forever', 'night'],
  },
  {
    id: 's-6',
    name: 'Sparkling Heart Neon',
    url: 'https://images.unsplash.com/photo-1518895949257-7621c3c786d7?w=300&auto=format&fit=crop&q=80',
    tags: ['neon', 'glow', 'heart'],
  },
  {
    id: 's-7',
    name: 'Love Letter Envelope',
    url: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b675?w=300&auto=format&fit=crop&q=80',
    tags: ['letter', 'notes', 'sweet'],
  },
  {
    id: 's-8',
    name: 'Warm Sunset Hug',
    url: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=300&auto=format&fit=crop&q=80',
    tags: ['sunset', 'hold', 'forever'],
  },
];

// Curated romantic GIFs
const ROMANTIC_GIFS = [
  {
    id: 'g-1',
    title: 'Warm Hug',
    url: 'https://media.giphy.com/media/l2QDM9Jnim1YV55y8/giphy.gif',
    tags: ['hug', 'cuddle', 'love'],
  },
  {
    id: 'g-2',
    title: 'Sweet Kiss',
    url: 'https://media.giphy.com/media/G3va31oEEnIkM/giphy.gif',
    tags: ['kiss', 'romance', 'lovers'],
  },
  {
    id: 'g-3',
    title: 'Heart Pulse',
    url: 'https://media.giphy.com/media/26BRv0ThflsDTqUXa/giphy.gif',
    tags: ['heart', 'beat', 'forever'],
  },
  {
    id: 'g-4',
    title: 'I Miss You',
    url: 'https://media.giphy.com/media/ISOckXUybVfQ4/giphy.gif',
    tags: ['miss you', 'sad', 'thinking'],
  },
  {
    id: 'g-5',
    title: 'Cute Love Cat',
    url: 'https://media.giphy.com/media/MDJ9IbxxvDUQM/giphy.gif',
    tags: ['cat', 'cute', 'purr'],
  },
  {
    id: 'g-6',
    title: 'Sparkle Romance',
    url: 'https://media.giphy.com/media/3o7TKoWXm3okO1kgHC/giphy.gif',
    tags: ['sparkle', 'magic', 'shine'],
  },
];

export const EmojiStickerPicker: React.FC<EmojiStickerPickerProps> = ({
  onSelectEmoji,
  onSelectStickerOrGif,
  onClose,
}) => {
  const [activeTab, setActiveTab] = useState<'emoji' | 'stickers' | 'gifs'>('emoji');
  const [search, setSearch] = useState('');

  // Filter stickers or gifs by search
  const filteredStickers = ROMANTIC_STICKERS.filter((s) =>
    s.tags.some((t) => t.includes(search.toLowerCase())) || s.name.toLowerCase().includes(search.toLowerCase())
  );

  const filteredGifs = ROMANTIC_GIFS.filter((g) =>
    g.tags.some((t) => t.includes(search.toLowerCase())) || g.title.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex flex-col h-72 bg-[#1b0821] border-t border-pink-900/60 shadow-2xl z-30 select-none animate-in slide-in-from-bottom-2 duration-200">
      {/* Search & Close Header */}
      <div className="flex items-center gap-2 p-2.5 border-b border-pink-950/60 bg-[#14051a]">
        <div className="flex-1 flex items-center gap-2 bg-[#260c2d] px-3 py-1.5 rounded-xl border border-pink-900/40">
          <Search className="w-3.5 h-3.5 text-pink-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={`Search WhatsApp ${activeTab}...`}
            className="w-full bg-transparent text-xs text-pink-100 placeholder-pink-300/40 focus:outline-none"
          />
          {search && (
            <button onClick={() => setSearch('')}>
              <X className="w-3.5 h-3.5 text-pink-400" />
            </button>
          )}
        </div>
        <button
          onClick={onClose}
          className="p-1.5 rounded-lg bg-pink-950/60 hover:bg-pink-900/60 text-pink-300"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Tabs */}
      <div className="flex items-center justify-around border-b border-pink-950/60 bg-[#16061c] py-1 text-xs">
        <button
          onClick={() => setActiveTab('emoji')}
          className={`flex items-center gap-1.5 px-4 py-1.5 rounded-lg transition font-medium ${
            activeTab === 'emoji'
              ? 'bg-pink-600 text-white shadow'
              : 'text-pink-300/70 hover:text-pink-100'
          }`}
        >
          <Smile className="w-4 h-4" />
          <span>Emojis</span>
        </button>
        <button
          onClick={() => setActiveTab('stickers')}
          className={`flex items-center gap-1.5 px-4 py-1.5 rounded-lg transition font-medium ${
            activeTab === 'stickers'
              ? 'bg-pink-600 text-white shadow'
              : 'text-pink-300/70 hover:text-pink-100'
          }`}
        >
          <Heart className="w-4 h-4" />
          <span>Love Stickers</span>
        </button>
        <button
          onClick={() => setActiveTab('gifs')}
          className={`flex items-center gap-1.5 px-4 py-1.5 rounded-lg transition font-medium ${
            activeTab === 'gifs'
              ? 'bg-pink-600 text-white shadow'
              : 'text-pink-300/70 hover:text-pink-100'
          }`}
        >
          <ImageIcon className="w-4 h-4" />
          <span>GIFs</span>
        </button>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-y-auto p-3">
        {/* EMOJIS TAB */}
        {activeTab === 'emoji' && (
          <div className="space-y-4">
            {EMOJI_CATEGORIES.map((cat) => {
              const matchedEmojis = cat.emojis.filter(
                () => !search || cat.name.toLowerCase().includes(search.toLowerCase())
              );
              if (matchedEmojis.length === 0) return null;

              return (
                <div key={cat.name}>
                  <p className="text-[11px] font-semibold text-pink-300/80 mb-2 flex items-center gap-1">
                    <span>{cat.icon}</span>
                    <span>{cat.name}</span>
                  </p>
                  <div className="grid grid-cols-8 sm:grid-cols-10 gap-1.5">
                    {matchedEmojis.map((emoji, idx) => (
                      <button
                        key={idx}
                        onClick={() => onSelectEmoji(emoji)}
                        className="text-2xl p-1.5 rounded-lg hover:bg-pink-900/40 hover:scale-125 transition-transform"
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* STICKERS TAB */}
        {activeTab === 'stickers' && (
          <div>
            <div className="grid grid-cols-4 sm:grid-cols-4 gap-2">
              {filteredStickers.map((sticker) => (
                <button
                  key={sticker.id}
                  onClick={() => onSelectStickerOrGif(sticker.url, 'sticker')}
                  className="group relative flex flex-col items-center p-1 rounded-xl bg-pink-950/40 hover:bg-pink-900/50 border border-pink-900/30 hover:scale-105 transition"
                >
                  <img
                    src={sticker.url}
                    alt={sticker.name}
                    className="w-20 h-20 object-cover rounded-lg"
                  />
                  <span className="text-[10px] text-pink-200/80 truncate w-full text-center mt-1">
                    {sticker.name}
                  </span>
                </button>
              ))}
            </div>
            {filteredStickers.length === 0 && (
              <p className="text-center text-xs text-pink-300/50 py-8">No stickers found for &quot;{search}&quot;</p>
            )}
          </div>
        )}

        {/* GIFS TAB */}
        {activeTab === 'gifs' && (
          <div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {filteredGifs.map((gif) => (
                <button
                  key={gif.id}
                  onClick={() => onSelectStickerOrGif(gif.url, 'sticker')}
                  className="group relative flex flex-col items-center rounded-xl overflow-hidden bg-pink-950/40 border border-pink-900/40 hover:scale-102 transition"
                >
                  <img
                    src={gif.url}
                    alt={gif.title}
                    className="w-full h-28 object-cover"
                  />
                  <span className="text-[10px] text-pink-200 bg-black/60 w-full py-0.5 text-center truncate">
                    {gif.title}
                  </span>
                </button>
              ))}
            </div>
            {filteredGifs.length === 0 && (
              <p className="text-center text-xs text-pink-300/50 py-8">No GIFs found for &quot;{search}&quot;</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
