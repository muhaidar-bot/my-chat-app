import React, { useEffect, useRef, useState, useCallback } from 'react';
import {
  X,
  Camera,
  RotateCcw,
  Sparkles,
  Video,
  StopCircle,
  Send,
  Download,
  Check,
} from 'lucide-react';
import { FilterOption } from '../types';

interface CameraModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSendCapturedMedia: (mediaUrl: string, type: 'photo' | 'video') => void;
}

const FILTERS: FilterOption[] = [
  { id: 'normal', name: 'Original', icon: '✨', cssFilter: 'none' },
  {
    id: 'romance',
    name: 'Romance Glow',
    icon: '💖',
    cssFilter: 'contrast(105%) brightness(108%) saturate(125%)',
    overlay: 'hearts',
  },
  {
    id: 'golden',
    name: 'Golden Hour',
    icon: '🌅',
    cssFilter: 'sepia(30%) saturate(140%) brightness(105%) contrast(105%)',
    overlay: 'sparkles',
  },
  {
    id: 'crown',
    name: 'Love Crown',
    icon: '👑',
    cssFilter: 'brightness(110%) saturate(120%)',
    overlay: 'crown',
  },
  {
    id: 'blush',
    name: 'Cute Blush',
    icon: '🧸',
    cssFilter: 'hue-rotate(-10deg) saturate(130%) contrast(105%)',
    overlay: 'blush',
  },
  {
    id: 'vintage',
    name: 'Vintage Film',
    icon: '🎞️',
    cssFilter: 'contrast(120%) sepia(45%) hue-rotate(-15deg)',
    overlay: 'vintage_frame',
  },
  {
    id: 'sakura',
    name: 'Sakura Petals',
    icon: '🌸',
    cssFilter: 'brightness(108%) saturate(135%)',
    overlay: 'hearts',
  },
  {
    id: 'noir',
    name: 'Noir Romance',
    icon: '🖤',
    cssFilter: 'grayscale(100%) contrast(140%) brightness(95%)',
  },
  {
    id: 'moon',
    name: 'Moon & Stars',
    icon: '🌙',
    cssFilter: 'brightness(95%) contrast(115%) saturate(130%) hue-rotate(220deg)',
    overlay: 'sparkles',
  },
  {
    id: 'dream',
    name: 'Dreamy Pastel',
    icon: '🦄',
    cssFilter: 'contrast(95%) brightness(115%) saturate(140%)',
    overlay: 'hearts',
  },
];

export const CameraModal: React.FC<CameraModalProps> = ({
  isOpen,
  onClose,
  onSendCapturedMedia,
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordedChunksRef = useRef<Blob[]>([]);

  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('user');
  const [selectedFilter, setSelectedFilter] = useState<FilterOption>(FILTERS[1]);
  const [mode, setMode] = useState<'photo' | 'video'>('photo');
  const [isRecording, setIsRecording] = useState(false);
  const [recordSeconds, setRecordSeconds] = useState(0);
  const [capturedPreview, setCapturedPreview] = useState<{
    url: string;
    type: 'photo' | 'video';
  } | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const timerRef = useRef<number | null>(null);

  const startCamera = useCallback(async () => {
    try {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
      setErrorMsg(null);

      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: facingMode }, width: { ideal: 1280 }, height: { ideal: 720 } },
        audio: mode === 'video',
      });

      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
    } catch (err) {
      console.error('Camera access error:', err);
      setErrorMsg('Could not access camera. Please allow camera permissions.');
    }
  }, [facingMode, mode]);

  useEffect(() => {
    if (isOpen && !capturedPreview) {
      startCamera();
    } else {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
        streamRef.current = null;
      }
    }

    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [isOpen, startCamera, capturedPreview]);

  // Flip camera between front & back (dual camera)
  const flipCamera = () => {
    setFacingMode((prev) => (prev === 'user' ? 'environment' : 'user'));
  };

  // Capture Photo
  const capturePhoto = () => {
    if (!videoRef.current) return;
    const video = videoRef.current;
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth || 1280;
    canvas.height = video.videoHeight || 720;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Apply CSS filter on canvas context if needed
    ctx.filter = selectedFilter.cssFilter;

    // If front camera, mirror image
    if (facingMode === 'user') {
      ctx.translate(canvas.width, 0);
      ctx.scale(-1, 1);
    }
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    // Draw decorative watermarks/overlays
    ctx.filter = 'none';
    if (facingMode === 'user') {
      ctx.scale(-1, 1);
      ctx.translate(-canvas.width, 0);
    }

    ctx.font = '22px sans-serif';
    ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
    ctx.fillText('Bayyan ❤️ Muhaidar', 24, canvas.height - 24);

    const dataUrl = canvas.toDataURL('image/jpeg', 0.9);
    setCapturedPreview({ url: dataUrl, type: 'photo' });
  };

  // Record Video
  const startVideoRecord = () => {
    if (!streamRef.current) return;
    recordedChunksRef.current = [];
    const recorder = new MediaRecorder(streamRef.current);
    mediaRecorderRef.current = recorder;

    recorder.ondataavailable = (e) => {
      if (e.data.size > 0) {
        recordedChunksRef.current.push(e.data);
      }
    };

    recorder.onstop = () => {
      const blob = new Blob(recordedChunksRef.current, { type: 'video/webm' });
      const videoUrl = URL.createObjectURL(blob);
      setCapturedPreview({ url: videoUrl, type: 'video' });
    };

    recorder.start();
    setIsRecording(true);
    setRecordSeconds(0);
    timerRef.current = window.setInterval(() => {
      setRecordSeconds((s) => s + 1);
    }, 1000);
  };

  const stopVideoRecord = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (timerRef.current) clearInterval(timerRef.current);
    }
  };

  const handleSend = () => {
    if (capturedPreview) {
      onSendCapturedMedia(capturedPreview.url, capturedPreview.type);
      setCapturedPreview(null);
      onClose();
    }
  };

  const handleRetake = () => {
    setCapturedPreview(null);
    startCamera();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-black text-white select-none">
      {/* Top Header */}
      <div className="relative z-20 flex items-center justify-between p-4 bg-gradient-to-b from-black/80 via-black/40 to-transparent">
        <button
          onClick={onClose}
          className="p-2 rounded-full bg-black/40 backdrop-blur-md text-white hover:bg-black/60 transition"
        >
          <X className="w-6 h-6" />
        </button>

        <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-pink-950/70 border border-pink-700/50 backdrop-blur-md">
          <Sparkles className="w-4 h-4 text-pink-400" />
          <span className="text-xs font-bold text-pink-200">
            Snapchat Camera • {selectedFilter.name}
          </span>
        </div>

        {/* Dual Camera Flip Button */}
        <button
          onClick={flipCamera}
          title="Flip Camera (Front/Rear)"
          className="p-2 rounded-full bg-black/40 backdrop-blur-md text-white hover:bg-black/60 transition active:rotate-180 duration-300"
        >
          <RotateCcw className="w-5 h-5" />
        </button>
      </div>

      {/* Main Viewport */}
      <div className="relative flex-1 flex items-center justify-center overflow-hidden bg-black">
        {errorMsg ? (
          <div className="text-center p-6 text-pink-300">
            <Camera className="w-12 h-12 mx-auto mb-2 opacity-50" />
            <p className="font-semibold">{errorMsg}</p>
          </div>
        ) : capturedPreview ? (
          /* Preview captured media */
          <div className="relative w-full h-full flex items-center justify-center">
            {capturedPreview.type === 'photo' ? (
              <img
                src={capturedPreview.url}
                alt="Captured memory"
                className="max-h-full max-w-full object-contain"
              />
            ) : (
              <video
                src={capturedPreview.url}
                controls
                autoPlay
                loop
                className="max-h-full max-w-full object-contain"
              />
            )}
          </div>
        ) : (
          /* Live Stream */
          <div className="relative w-full h-full flex items-center justify-center">
            <video
              ref={videoRef}
              playsInline
              muted
              style={{ filter: selectedFilter.cssFilter }}
              className={`w-full h-full object-cover transition-all ${
                facingMode === 'user' ? 'scale-x-[-1]' : ''
              }`}
            />

            {/* Decorative Overlay Animations */}
            {selectedFilter.overlay === 'hearts' && (
              <div className="absolute inset-0 pointer-events-none flex items-center justify-center overflow-hidden">
                <span className="absolute top-10 left-8 text-4xl animate-bounce">💖</span>
                <span className="absolute bottom-24 right-10 text-3xl animate-pulse">💕</span>
                <span className="absolute top-20 right-12 text-2xl animate-ping">✨</span>
              </div>
            )}
            {selectedFilter.overlay === 'crown' && (
              <div className="absolute top-8 pointer-events-none animate-pulse">
                <span className="text-6xl drop-shadow-lg">👑</span>
              </div>
            )}
            {selectedFilter.overlay === 'blush' && (
              <div className="absolute inset-0 pointer-events-none flex justify-between px-16 items-center">
                <span className="w-16 h-10 rounded-full bg-pink-500/25 blur-md" />
                <span className="w-16 h-10 rounded-full bg-pink-500/25 blur-md" />
              </div>
            )}

            {/* Recording badge */}
            {isRecording && (
              <div className="absolute top-4 left-1/2 -translate-x-1/2 flex items-center gap-2 bg-rose-600/90 text-white px-4 py-1.5 rounded-full font-mono font-bold text-sm shadow-lg animate-pulse">
                <span className="w-3 h-3 rounded-full bg-white animate-ping" />
                <span>
                  REC {Math.floor(recordSeconds / 60)}:
                  {(recordSeconds % 60).toString().padStart(2, '0')}
                </span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Filter Selector Carousel (Only when live capturing) */}
      {!capturedPreview && (
        <div className="relative z-20 py-2 bg-gradient-to-t from-black via-black/80 to-transparent">
          <div className="flex items-center gap-2 px-4 overflow-x-auto no-scrollbar">
            {FILTERS.map((f) => (
              <button
                key={f.id}
                onClick={() => setSelectedFilter(f)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
                  selectedFilter.id === f.id
                    ? 'bg-gradient-to-r from-pink-600 to-rose-500 text-white shadow-lg shadow-pink-600/50 scale-105'
                    : 'bg-white/10 text-pink-200/80 hover:bg-white/20'
                }`}
              >
                <span>{f.icon}</span>
                <span>{f.name}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Bottom Controls */}
      <div className="relative z-20 p-5 bg-black/90 flex items-center justify-between">
        {capturedPreview ? (
          /* Preview Actions: Retake vs Send */
          <div className="w-full flex items-center justify-around">
            <button
              onClick={handleRetake}
              className="flex items-center gap-1.5 px-6 py-2.5 rounded-full bg-white/20 hover:bg-white/30 text-white font-medium transition"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Retake</span>
            </button>

            <button
              onClick={() => {
                const a = document.createElement('a');
                a.href = capturedPreview.url;
                a.download = `snap_${Date.now()}.${capturedPreview.type === 'photo' ? 'jpg' : 'webm'}`;
                a.click();
              }}
              className="p-3 rounded-full bg-white/20 hover:bg-white/30 text-white transition"
              title="Download to phone"
            >
              <Download className="w-5 h-5" />
            </button>

            <button
              onClick={handleSend}
              className="flex items-center gap-2 px-8 py-2.5 rounded-full bg-gradient-to-r from-pink-600 to-rose-500 hover:from-pink-500 hover:to-rose-400 text-white font-bold shadow-lg shadow-pink-600/50 transition active:scale-95"
            >
              <Send className="w-4 h-4" />
              <span>Send to Lover ❤️</span>
            </button>
          </div>
        ) : (
          /* Live Shutter Controls */
          <div className="w-full flex items-center justify-around">
            {/* Mode Toggle: Photo vs Video */}
            <div className="flex rounded-full bg-white/15 p-1 text-xs">
              <button
                onClick={() => setMode('photo')}
                className={`px-3 py-1 rounded-full font-medium transition ${
                  mode === 'photo' ? 'bg-pink-600 text-white shadow' : 'text-gray-300'
                }`}
              >
                Photo
              </button>
              <button
                onClick={() => setMode('video')}
                className={`px-3 py-1 rounded-full font-medium transition ${
                  mode === 'video' ? 'bg-pink-600 text-white shadow' : 'text-gray-300'
                }`}
              >
                Video
              </button>
            </div>

            {/* Shutter Button */}
            {mode === 'photo' ? (
              <button
                onClick={capturePhoto}
                title="Take Photo"
                className="w-18 h-18 rounded-full border-4 border-white p-1 flex items-center justify-center hover:scale-105 active:scale-90 transition-transform shadow-xl shadow-pink-500/30"
              >
                <div className="w-full h-full rounded-full bg-gradient-to-tr from-pink-500 to-rose-500" />
              </button>
            ) : isRecording ? (
              <button
                onClick={stopVideoRecord}
                title="Stop Recording"
                className="w-18 h-18 rounded-full border-4 border-rose-500 p-1 flex items-center justify-center hover:scale-105 active:scale-90 transition-transform animate-pulse"
              >
                <div className="w-7 h-7 rounded-md bg-rose-600" />
              </button>
            ) : (
              <button
                onClick={startVideoRecord}
                title="Start Recording Video"
                className="w-18 h-18 rounded-full border-4 border-white p-1 flex items-center justify-center hover:scale-105 active:scale-90 transition-transform shadow-xl shadow-rose-500/30"
              >
                <div className="w-full h-full rounded-full bg-rose-600" />
              </button>
            )}

            {/* Quick helper tip */}
            <span className="text-[11px] text-pink-300/60 font-medium">
              {mode === 'photo' ? 'Tap to snap' : isRecording ? 'Recording...' : 'Tap to record'}
            </span>
          </div>
        )}
      </div>
    </div>
  );
};
