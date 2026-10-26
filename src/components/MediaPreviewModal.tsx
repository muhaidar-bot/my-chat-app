import React from 'react';
import { X, Download } from 'lucide-react';

interface MediaPreviewModalProps {
  media: { url: string; type: 'photo' | 'video' } | null;
  onClose: () => void;
}

export const MediaPreviewModal: React.FC<MediaPreviewModalProps> = ({ media, onClose }) => {
  if (!media) return null;

  const handleDownload = () => {
    const a = document.createElement('a');
    a.href = media.url;
    a.download = `memory_${Date.now()}.${media.type === 'photo' ? 'jpg' : 'mp4'}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-2 sm:p-6 backdrop-blur-md animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div className="absolute top-4 right-4 z-10 flex items-center gap-3">
        <button
          onClick={(e) => {
            e.stopPropagation();
            handleDownload();
          }}
          className="p-2.5 rounded-full bg-white/20 hover:bg-white/30 text-white transition backdrop-blur-sm"
          title="Download"
        >
          <Download className="w-5 h-5" />
        </button>
        <button
          onClick={onClose}
          className="p-2.5 rounded-full bg-white/20 hover:bg-white/30 text-white transition backdrop-blur-sm"
          title="Close"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      <div
        className="max-w-4xl max-h-[90vh] flex items-center justify-center overflow-hidden rounded-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {media.type === 'photo' ? (
          <img
            src={media.url}
            alt="Full size memory"
            className="max-w-full max-h-[85vh] object-contain rounded-2xl shadow-2xl"
          />
        ) : (
          <video
            src={media.url}
            controls
            autoPlay
            className="max-w-full max-h-[85vh] rounded-2xl shadow-2xl"
          />
        )}
      </div>
    </div>
  );
};
