import React from 'react';
import { Search, Sparkles, X } from 'lucide-react';

interface SearchBarProps {
  query: string;
  onChange: (val: string) => void;
  onClear: () => void;
}

export const SearchBar: React.FC<SearchBarProps> = ({ query, onChange, onClear }) => {
  return (
    <div className="relative px-3 py-2 z-10 shrink-0">
      <div className="flex items-center gap-2 bg-[#230d29]/80 border border-pink-900/50 rounded-2xl px-3 py-2 shadow-inner backdrop-blur-sm">
        <Search className="w-4 h-4 text-pink-400 shrink-0" />
        <input
          type="text"
          value={query}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Search memories, romantic ..."
          className="w-full bg-transparent text-sm text-pink-100 placeholder-pink-300/40 focus:outline-none"
        />
        {query ? (
          <button onClick={onClear} className="text-pink-400 hover:text-pink-200">
            <X className="w-4 h-4" />
          </button>
        ) : (
          <span className="flex items-center gap-1 text-[11px] font-medium text-pink-300/60 bg-pink-950/60 px-2 py-0.5 rounded-full border border-pink-800/40 shrink-0">
            <Sparkles className="w-2.5 h-2.5 text-pink-400" />
            Find memory
          </span>
        )}
      </div>
    </div>
  );
};
