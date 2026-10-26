import React, { useState, useRef, useEffect } from 'react';
import {
  Smile,
  Paperclip,
  Camera,
  Mic,
  Send,
  Tag,
  Trash2,
  StopCircle,
} from 'lucide-react';
import { UserRole } from '../types';

interface MessageInputProps {
  currentUser: UserRole;
  onSendMessage: (text: string) => void;
  onSendVoiceNote: (audioUrl: string, duration: number) => void;
  onSendMedia: (file: File) => void;
  onOpenCamera: () => void;
  onToggleEmojiPicker: () => void;
  isEmojiPickerOpen: boolean;
  onTyping: (isTyping: boolean) => void;
}

const QUICK_LOVE_TAGS = [
  'I love you endlessly ❤️',
  'You are my moon & forever 🌙',
  'Thinking of you always ✨',
  'Missing your sweet embrace 🥺',
  'Good morning my queen 👑',
  'Sweet dreams my love 💖',
  'Forever yours ❤️💍',
];

export const MessageInput: React.FC<MessageInputProps> = ({
  currentUser,
  onSendMessage,
  onSendVoiceNote,
  onSendMedia,
  onOpenCamera,
  onToggleEmojiPicker,
  isEmojiPickerOpen,
  onTyping,
}) => {
  const [text, setText] = useState('');
  const [showQuickTags, setShowQuickTags] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Voice recording state
  const [isRecording, setIsRecording] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerIntervalRef = useRef<number | null>(null);

  const partnerName = currentUser === 'Muhaidar' ? 'Bayyan' : 'Muhaidar';

  const handleTextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setText(e.target.value);
    onTyping(true);
  };

  const handleSend = () => {
    if (text.trim()) {
      onSendMessage(text.trim());
      setText('');
      onTyping(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSend();
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onSendMedia(file);
      e.target.value = '';
    }
  };

  // Voice recording
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          audioChunksRef.current.push(e.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        stream.getTracks().forEach((track) => track.stop());

        if (recordingSeconds > 0) {
          // Convert blob to base64 data URL
          const reader = new FileReader();
          reader.readAsDataURL(audioBlob);
          reader.onloadend = () => {
            const base64data = reader.result as string;
            onSendVoiceNote(base64data, recordingSeconds);
          };
        }
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordingSeconds(0);
      timerIntervalRef.current = window.setInterval(() => {
        setRecordingSeconds((prev) => prev + 1);
      }, 1000);
    } catch (err) {
      console.error('Microphone error:', err);
      alert('Microphone access is required to record voice notes.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
      }
    }
  };

  const cancelRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      audioChunksRef.current = [];
      setRecordingSeconds(0);
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
      }
    }
  };

  useEffect(() => {
    return () => {
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
      }
    };
  }, []);

  return (
    <div className="relative px-3 pt-2 pb-2 z-20 shrink-0">
      {/* Quick Love Tags Popover */}
      {showQuickTags && (
        <div className="absolute bottom-16 left-4 right-4 bg-[#210929]/95 backdrop-blur-md border border-pink-700/60 rounded-2xl p-3 shadow-2xl z-30 animate-in fade-in zoom-in-95 duration-150">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-pink-300 flex items-center gap-1.5">
              <Tag className="w-3.5 h-3.5 text-pink-400" />
              Quick Sweet Notes for {partnerName}
            </span>
            <button
              onClick={() => setShowQuickTags(false)}
              className="text-xs text-pink-400/80 hover:text-pink-200"
            >
              Close
            </button>
          </div>
          <div className="flex flex-wrap gap-1.5 max-h-36 overflow-y-auto">
            {QUICK_LOVE_TAGS.map((tag, idx) => (
              <button
                key={idx}
                onClick={() => {
                  onSendMessage(tag);
                  setShowQuickTags(false);
                }}
                className="text-[12px] bg-pink-950/70 hover:bg-pink-900 text-pink-100 px-2.5 py-1 rounded-full border border-pink-700/40 transition active:scale-95"
              >
                {tag}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Hidden file input for attachments */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*,video/*,audio/*"
        onChange={handleFileChange}
        className="hidden"
      />

      {/* Recording in progress overlay */}
      {isRecording ? (
        <div className="flex items-center justify-between bg-gradient-to-r from-rose-950/90 to-pink-950/90 border border-rose-500/50 rounded-full px-4 py-2 shadow-lg backdrop-blur-md animate-pulse">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-rose-500 animate-ping" />
            <span className="text-xs font-mono font-bold text-rose-200">
              Recording Voice Note: {Math.floor(recordingSeconds / 60)}:
              {(recordingSeconds % 60).toString().padStart(2, '0')}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={cancelRecording}
              title="Discard Recording"
              className="p-1.5 rounded-full bg-black/40 hover:bg-black/60 text-rose-300 transition"
            >
              <Trash2 className="w-4 h-4" />
            </button>
            <button
              onClick={stopRecording}
              title="Send Voice Note"
              className="flex items-center gap-1 bg-rose-600 hover:bg-rose-500 text-white text-xs px-3 py-1.5 rounded-full font-medium shadow-md transition"
            >
              <StopCircle className="w-3.5 h-3.5" />
              <span>Send</span>
            </button>
          </div>
        </div>
      ) : (
        /* Regular input bar matching Image 1 */
        <div className="flex items-center gap-2">
          {/* Main pill container */}
          <div className="flex-1 flex items-center gap-1.5 bg-[#23092b]/90 border border-pink-900/60 rounded-full px-3 py-1.5 shadow-lg backdrop-blur-md">
            {/* Emoji Picker trigger */}
            <button
              type="button"
              onClick={onToggleEmojiPicker}
              className={`p-1.5 rounded-full transition ${
                isEmojiPickerOpen
                  ? 'text-pink-400 bg-pink-950'
                  : 'text-pink-300/80 hover:text-pink-100'
              }`}
              title="Emoji & Stickers"
            >
              <Smile className="w-5 h-5" />
            </button>

            {/* Quick romantic love tags */}
            <button
              type="button"
              onClick={() => setShowQuickTags((prev) => !prev)}
              className="p-1.5 rounded-full text-pink-300/80 hover:text-pink-100 transition"
              title="Quick Love Tags"
            >
              <Tag className="w-4 h-4" />
            </button>

            {/* Text Input */}
            <input
              type="text"
              value={text}
              onChange={handleTextChange}
              onKeyDown={handleKeyDown}
              placeholder={`Message ${partnerName}...`}
              className="flex-1 bg-transparent text-sm text-pink-50 placeholder-pink-300/40 focus:outline-none px-1"
            />

            {/* Paperclip attachment button */}
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="p-1.5 rounded-full text-pink-300/80 hover:text-pink-100 transition"
              title="Attach photo, video or audio"
            >
              <Paperclip className="w-4 h-4" />
            </button>

            {/* Camera icon button inside input pill */}
            <button
              type="button"
              onClick={onOpenCamera}
              className="p-1.5 rounded-full text-pink-300/80 hover:text-pink-100 transition"
              title="Snapchat Camera"
            >
              <Camera className="w-4 h-4" />
            </button>
          </div>

          {/* Right Action: Voice Note Mic OR Send Button */}
          {text.trim() ? (
            <button
              type="button"
              onClick={handleSend}
              className="w-11 h-11 rounded-full bg-gradient-to-tr from-pink-600 to-rose-500 hover:from-pink-500 hover:to-rose-400 active:scale-95 flex items-center justify-center text-white shadow-lg shadow-pink-600/40 transition shrink-0"
              title="Send Message"
            >
              <Send className="w-5 h-5 ml-0.5" />
            </button>
          ) : (
            <button
              type="button"
              onClick={startRecording}
              className="w-11 h-11 rounded-full bg-gradient-to-tr from-pink-600 to-rose-500 hover:from-pink-500 hover:to-rose-400 active:scale-95 flex items-center justify-center text-white shadow-lg shadow-pink-600/40 transition shrink-0"
              title="Record Voice Note"
            >
              <Mic className="w-5 h-5" />
            </button>
          )}
        </div>
      )}
    </div>
  );
};
