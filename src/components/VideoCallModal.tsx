import React, { useEffect, useRef, useState, useCallback } from 'react';
import {
  PhoneOff,
  Mic,
  MicOff,
  Video,
  VideoOff,
  RotateCcw,
  Heart,
  Phone,
  Sparkles,
  Volume2,
} from 'lucide-react';
import { CallState, UserRole } from '../types';
import { startRingtone, stopRingtone, playCallEndSound } from '../utils/audio';

interface VideoCallModalProps {
  callState: CallState | null;
  currentUser: UserRole;
  onEndCall: (duration: number) => void;
  onAcceptIncoming: () => void;
  onRejectIncoming: () => void;
  onSendSignal: (signal: unknown) => void;
}

export const VideoCallModal: React.FC<VideoCallModalProps> = ({
  callState,
  currentUser,
  onEndCall,
  onAcceptIncoming,
  onRejectIncoming,
  onSendSignal,
}) => {
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const localStreamRef = useRef<MediaStream | null>(null);

  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('user');
  const [callDuration, setCallDuration] = useState(0);

  const partnerName = currentUser === 'Muhaidar' ? 'Bayyan' : 'Muhaidar';

  // Ringtone for incoming or outgoing
  useEffect(() => {
    if (callState) {
      if (callState.mode === 'incoming' || callState.mode === 'outgoing') {
        startRingtone();
      } else {
        stopRingtone();
      }
    } else {
      stopRingtone();
    }
    return () => {
      stopRingtone();
    };
  }, [callState]);

  // Duration timer when connected
  useEffect(() => {
    let timer: number | null = null;
    if (callState?.mode === 'connected') {
      timer = window.setInterval(() => {
        setCallDuration((prev) => prev + 1);
      }, 1000);
    } else {
      setCallDuration(0);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [callState?.mode]);

  // Initialize camera/mic stream
  const initLocalStream = useCallback(async () => {
    if (!callState) return;
    try {
      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach((t) => t.stop());
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video:
          callState.type === 'video'
            ? { facingMode: { ideal: facingMode }, width: { ideal: 1280 }, height: { ideal: 720 } }
            : false,
        audio: true,
      });

      localStreamRef.current = stream;
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }
    } catch (err) {
      console.warn('Local media access issue:', err);
    }
  }, [callState, facingMode]);

  useEffect(() => {
    if (callState?.mode === 'connected' || callState?.mode === 'outgoing') {
      initLocalStream();
    }
    return () => {
      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach((t) => t.stop());
        localStreamRef.current = null;
      }
    };
  }, [callState?.mode, initLocalStream]);

  const toggleMute = () => {
    if (localStreamRef.current) {
      localStreamRef.current.getAudioTracks().forEach((track) => {
        track.enabled = !track.enabled;
      });
      setIsMuted((prev) => !prev);
    }
  };

  const toggleVideo = () => {
    if (localStreamRef.current) {
      localStreamRef.current.getVideoTracks().forEach((track) => {
        track.enabled = !track.enabled;
      });
      setIsVideoOff((prev) => !prev);
    }
  };

  const flipCamera = () => {
    setFacingMode((prev) => (prev === 'user' ? 'environment' : 'user'));
  };

  const handleEnd = () => {
    playCallEndSound();
    stopRingtone();
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((t) => t.stop());
    }
    onEndCall(callDuration);
  };

  if (!callState) return null;

  // 1. INCOMING CALL SCREEN
  if (callState.mode === 'incoming') {
    return (
      <div className="fixed inset-0 z-50 flex flex-col items-center justify-between p-8 bg-gradient-to-b from-[#2a0b33] via-[#1b0722] to-[#120417] text-white">
        <div className="flex flex-col items-center mt-12 animate-pulse">
          <div className="w-28 h-28 rounded-full bg-[#351040] border-4 border-pink-500/70 p-1 flex items-center justify-center shadow-2xl shadow-pink-600/40">
            <span className="text-5xl">🌙</span>
          </div>
          <h2 className="text-2xl font-bold mt-4 text-pink-100">{partnerName} ❤️</h2>
          <p className="text-sm text-pink-300/80 mt-1 flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-pink-400" />
            Incoming {callState.type === 'video' ? 'Video Call' : 'Voice Call'}...
          </p>
        </div>

        {/* Action Buttons: Accept / Decline */}
        <div className="flex items-center gap-12 mb-12">
          {/* Decline */}
          <button
            onClick={() => {
              playCallEndSound();
              onRejectIncoming();
            }}
            className="flex flex-col items-center gap-2 group"
          >
            <div className="w-16 h-16 rounded-full bg-rose-600 group-hover:bg-rose-500 flex items-center justify-center text-white shadow-xl shadow-rose-600/40 transition active:scale-90">
              <PhoneOff className="w-7 h-7" />
            </div>
            <span className="text-xs text-rose-300 font-medium">Decline</span>
          </button>

          {/* Accept */}
          <button
            onClick={onAcceptIncoming}
            className="flex flex-col items-center gap-2 group"
          >
            <div className="w-16 h-16 rounded-full bg-emerald-600 group-hover:bg-emerald-500 flex items-center justify-center text-white shadow-xl shadow-emerald-600/40 transition active:scale-90 animate-bounce">
              <Phone className="w-7 h-7" />
            </div>
            <span className="text-xs text-emerald-300 font-bold">Accept ❤️</span>
          </button>
        </div>
      </div>
    );
  }

  // 2. OUTGOING OR CONNECTED CALL SCREEN
  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-black text-white select-none">
      {/* Remote Video Feed (Main Screen) */}
      <div className="relative flex-1 bg-[#120516] flex items-center justify-center overflow-hidden">
        {callState.type === 'video' ? (
          <div className="relative w-full h-full flex items-center justify-center">
            {/* When connected, we show partner simulation / stream */}
            <video
              ref={remoteVideoRef}
              autoPlay
              playsInline
              className="w-full h-full object-cover"
            />
            {/* Fallback romantic lover avatar if partner camera is connecting */}
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-b from-[#22072b]/80 via-[#180520]/80 to-[#120417]/80 backdrop-blur-sm pointer-events-none">
              <div className="w-24 h-24 rounded-full bg-pink-900/40 border-2 border-pink-500/50 flex items-center justify-center shadow-2xl">
                <span className="text-5xl">🌙</span>
              </div>
              <h3 className="text-lg font-bold text-pink-100 mt-3">{partnerName} ❤️</h3>
              <p className="text-xs text-pink-300/80 mt-1">
                {callState.mode === 'outgoing'
                  ? 'Calling my forever & moon...'
                  : 'Connected in Love'}
              </p>
            </div>
          </div>
        ) : (
          /* Voice Call Avatar UI */
          <div className="flex flex-col items-center justify-center">
            <div className="w-32 h-32 rounded-full bg-gradient-to-tr from-pink-600 to-rose-500 p-1 shadow-2xl shadow-pink-600/40 animate-pulse flex items-center justify-center">
              <div className="w-full h-full rounded-full bg-[#200928] flex items-center justify-center">
                <span className="text-5xl">🌙</span>
              </div>
            </div>
            <h2 className="text-2xl font-bold mt-4 text-pink-100">{partnerName} ❤️</h2>
            <p className="text-xs text-pink-300/80 mt-1 font-mono">
              {callState.mode === 'connected' ? (
                `Connected • ${Math.floor(callDuration / 60)}:${(callDuration % 60)
                  .toString()
                  .padStart(2, '0')}`
              ) : (
                'Ringing...'
              )}
            </p>
          </div>
        )}

        {/* Local Self Video PIP (Picture-in-picture) */}
        {callState.type === 'video' && !isVideoOff && (
          <div className="absolute top-4 right-4 w-28 h-40 rounded-2xl overflow-hidden border-2 border-pink-500/60 shadow-2xl z-20 bg-black">
            <video
              ref={localVideoRef}
              autoPlay
              playsInline
              muted
              className={`w-full h-full object-cover ${
                facingMode === 'user' ? 'scale-x-[-1]' : ''
              }`}
            />
            <span className="absolute bottom-1 right-2 text-[9px] bg-black/60 px-1 rounded text-pink-200">
              You
            </span>
          </div>
        )}

        {/* Top Floating Header */}
        <div className="absolute top-4 left-4 z-20 flex items-center gap-2 bg-black/40 backdrop-blur-md px-3 py-1.5 rounded-full border border-pink-900/40">
          <Heart className="w-4 h-4 text-pink-400 fill-current animate-pulse" />
          <span className="text-xs font-mono font-medium text-pink-100">
            {callState.mode === 'connected'
              ? `${Math.floor(callDuration / 60)}:${(callDuration % 60)
                  .toString()
                  .padStart(2, '0')}`
              : 'Connecting...'}
          </span>
        </div>
      </div>

      {/* Bottom Call Action Toolbar */}
      <div className="p-6 bg-gradient-to-t from-black via-black/90 to-transparent flex items-center justify-around z-20">
        {/* Mute Mic */}
        <button
          onClick={toggleMute}
          className={`p-3.5 rounded-full transition active:scale-95 ${
            isMuted ? 'bg-white text-black' : 'bg-white/20 hover:bg-white/30 text-white'
          }`}
          title={isMuted ? 'Unmute' : 'Mute'}
        >
          {isMuted ? <MicOff className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
        </button>

        {/* Video Toggle */}
        {callState.type === 'video' && (
          <button
            onClick={toggleVideo}
            className={`p-3.5 rounded-full transition active:scale-95 ${
              isVideoOff ? 'bg-white text-black' : 'bg-white/20 hover:bg-white/30 text-white'
            }`}
            title={isVideoOff ? 'Turn Video On' : 'Turn Video Off'}
          >
            {isVideoOff ? <VideoOff className="w-6 h-6" /> : <Video className="w-6 h-6" />}
          </button>
        )}

        {/* Dual Camera Flip */}
        {callState.type === 'video' && (
          <button
            onClick={flipCamera}
            className="p-3.5 rounded-full bg-white/20 hover:bg-white/30 text-white transition active:rotate-180 duration-300"
            title="Flip Dual Camera"
          >
            <RotateCcw className="w-6 h-6" />
          </button>
        )}

        {/* End Call Button */}
        <button
          onClick={handleEnd}
          className="p-4 rounded-full bg-rose-600 hover:bg-rose-500 text-white shadow-xl shadow-rose-600/50 transition active:scale-90"
          title="End Call"
        >
          <PhoneOff className="w-7 h-7" />
        </button>
      </div>
    </div>
  );
};
