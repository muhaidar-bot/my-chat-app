import React, { useState, useEffect, useCallback } from 'react';
import { UserRole, CallState, ActiveTab } from './types';
import { useChatSocket } from './hooks/useChatSocket';
import { requestNotificationPermission } from './utils/notifications';
import { Header } from './components/Header';
import { SearchBar } from './components/SearchBar';
import { ChatStream } from './components/ChatStream';
import { MessageInput } from './components/MessageInput';
import { BottomNav } from './components/BottomNav';
import { CommandsDrawer } from './components/CommandsDrawer';
import { CameraModal } from './components/CameraModal';
import { WallpaperModal } from './components/WallpaperModal';
import { VideoCallModal } from './components/VideoCallModal';
import { BackupModal } from './components/BackupModal';
import { ProfileModal } from './components/ProfileModal';
import { MediaPreviewModal } from './components/MediaPreviewModal';
import { EmojiStickerPicker } from './components/EmojiStickerPicker';
import { PWAInstallBanner } from './components/PWAInstallBanner';

export default function App() {
  // Current user identity (default to Bayyan or restore from localStorage)
  const [currentUser, setCurrentUser] = useState<UserRole>(() => {
    const saved = localStorage.getItem('bm_current_user');
    return saved === 'Muhaidar' ? 'Muhaidar' : 'Bayyan';
  });

  const [activeTab, setActiveTab] = useState<ActiveTab>('chat');
  const [searchQuery, setSearchQuery] = useState('');
  const [isCommandsOpen, setIsCommandsOpen] = useState(false);
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [isWallpaperOpen, setIsWallpaperOpen] = useState(false);
  const [isBackupOpen, setIsBackupOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isEmojiPickerOpen, setIsEmojiPickerOpen] = useState(false);
  const [mediaPreview, setMediaPreview] = useState<{ url: string; type: 'photo' | 'video' } | null>(null);

  // Call state
  const [callState, setCallState] = useState<CallState | null>(null);

  // Persist current user in local storage
  const handleSwitchUser = useCallback((newUser: UserRole) => {
    setCurrentUser(newUser);
    localStorage.setItem('bm_current_user', newUser);
  }, []);

  const handleToggleUser = useCallback(() => {
    const nextUser = currentUser === 'Muhaidar' ? 'Bayyan' : 'Muhaidar';
    handleSwitchUser(nextUser);
  }, [currentUser, handleSwitchUser]);

  // Handle incoming call signaling from the other partner
  const handleCallSignal = useCallback(
    (signal: unknown) => {
      const data = signal as {
        action: 'call-request' | 'call-accept' | 'call-reject' | 'call-end';
        from: UserRole;
        callType?: 'voice' | 'video';
      };

      if (!data) return;

      if (data.action === 'call-request' && data.from !== currentUser) {
        setCallState({
          active: true,
          type: data.callType || 'video',
          mode: 'incoming',
          partner: data.from,
          duration: 0,
          isMuted: false,
          isVideoOff: false,
          facingMode: 'user',
        });
      } else if (data.action === 'call-accept') {
        setCallState((prev) => (prev ? { ...prev, mode: 'connected', startedAt: Date.now() } : null));
      } else if (data.action === 'call-reject' || data.action === 'call-end') {
        setCallState(null);
      }
    },
    [currentUser]
  );

  // Real-time chat socket hook
  const {
    messages,
    wallpaper,
    isConnected,
    isPartnerOnline,
    partnerIsTyping,
    sendMessage,
    markMessagesSeen,
    toggleReaction,
    deleteMessage,
    setTyping,
    updateWallpaper,
    sendCallSignal,
    supabaseStatus,
  } = useChatSocket({
    currentUser,
    onCallSignal: handleCallSignal,
  });

  // Request browser notification permissions on first user click
  useEffect(() => {
    const handleFirstClick = () => {
      requestNotificationPermission();
      window.removeEventListener('click', handleFirstClick);
    };
    window.addEventListener('click', handleFirstClick);
    return () => window.removeEventListener('click', handleFirstClick);
  }, []);

  // Initiate call
  const startCall = (type: 'voice' | 'video') => {
    const partner = currentUser === 'Muhaidar' ? 'Bayyan' : 'Muhaidar';
    setCallState({
      active: true,
      type,
      mode: 'outgoing',
      partner,
      duration: 0,
      isMuted: false,
      isVideoOff: false,
      facingMode: 'user',
    });

    sendCallSignal({
      action: 'call-request',
      from: currentUser,
      callType: type,
    });

    // Auto-connect after 3 seconds for smooth preview testing if partner is offline
    setTimeout(() => {
      setCallState((prev) => (prev && prev.mode === 'outgoing' ? { ...prev, mode: 'connected', startedAt: Date.now() } : prev));
    }, 3200);
  };

  const handleEndCall = (duration: number) => {
    if (callState) {
      sendCallSignal({
        action: 'call-end',
        from: currentUser,
      });

      // Log call into chat
      sendMessage({
        type: 'call_log',
        text: `${callState.type === 'video' ? 'Video' : 'Voice'} call ended`,
        duration: duration || 120,
      });
      setCallState(null);
    }
  };

  const handleAcceptIncoming = () => {
    if (callState) {
      sendCallSignal({
        action: 'call-accept',
        from: currentUser,
      });
      setCallState((prev) => (prev ? { ...prev, mode: 'connected', startedAt: Date.now() } : null));
    }
  };

  const handleRejectIncoming = () => {
    if (callState) {
      sendCallSignal({
        action: 'call-reject',
        from: currentUser,
      });
      setCallState(null);
    }
  };

  // Send photo or video from device file
  const handleSendMediaFile = async (file: File) => {
    const isVideo = file.type.startsWith('video');
    const isAudio = file.type.startsWith('audio');
    const type = isVideo ? 'video' : isAudio ? 'audio' : 'photo';

    const reader = new FileReader();
    reader.onload = async () => {
      const base64Data = reader.result as string;
      try {
        const res = await fetch('/api/upload', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            data: base64Data,
            filename: file.name,
            fileType: file.type,
          }),
        });
        const json = await res.json();
        sendMessage({
          type,
          mediaUrl: json.url || base64Data,
          mediaName: file.name,
          mediaSize: file.size,
        });
      } catch {
        sendMessage({
          type,
          mediaUrl: base64Data,
          mediaName: file.name,
          mediaSize: file.size,
        });
      }
    };
    reader.readAsDataURL(file);
  };

  // Send voice note
  const handleSendVoiceNote = (audioUrl: string, duration: number) => {
    sendMessage({
      type: 'audio',
      mediaUrl: audioUrl,
      mediaName: `voice_note_${Date.now()}.webm`,
      duration,
    });
  };

  // Send captured photo / video from Snapchat camera
  const handleSendCapturedMedia = (mediaUrl: string, type: 'photo' | 'video') => {
    sendMessage({
      type,
      mediaUrl,
      mediaName: `snap_${Date.now()}.${type === 'photo' ? 'jpg' : 'webm'}`,
    });
  };

  // Send sticker / GIF
  const handleSelectStickerOrGif = (url: string) => {
    sendMessage({
      type: 'sticker',
      mediaUrl: url,
      mediaName: 'romantic_sticker.gif',
    });
    setIsEmojiPickerOpen(false);
  };

  // Append emoji to active input or send directly
  const handleSelectEmoji = (emoji: string) => {
    sendMessage({
      type: 'text',
      text: emoji,
    });
  };

  // Handle bottom navigation clicks
  const handleSelectTab = (tab: ActiveTab) => {
    setActiveTab(tab);
    if (tab === 'camera') {
      setIsCameraOpen(true);
    } else if (tab === 'theme') {
      setIsWallpaperOpen(true);
    } else if (tab === 'backup') {
      setIsBackupOpen(true);
    } else if (tab === 'profile') {
      setIsProfileOpen(true);
    }
  };

  return (
    <div className="h-full w-full flex items-center justify-center bg-[#0d0410] font-sans">
      {/* Mobile-sized shell centered on desktop, 100% full-screen on mobile */}
      <div className="relative w-full max-w-md h-full flex flex-col bg-[#160719] shadow-2xl overflow-hidden border-x border-pink-950/30">
        {/* PWA Install Banner */}
        <PWAInstallBanner />

        {/* Top Header matching Image 1 */}
        <Header
          currentUser={currentUser}
          isPartnerOnline={isPartnerOnline}
          partnerIsTyping={partnerIsTyping}
          onVoiceCall={() => startCall('voice')}
          onVideoCall={() => startCall('video')}
          onOpenCamera={() => setIsCameraOpen(true)}
          onOpenCommands={() => setIsCommandsOpen(true)}
          onOpenProfile={() => setIsProfileOpen(true)}
        />

        {/* Search Bar matching Image 1 */}
        <SearchBar
          query={searchQuery}
          onChange={setSearchQuery}
          onClear={() => setSearchQuery('')}
        />

        {/* Chat Area with Synced Shared Wallpaper */}
        <div className="relative flex-1 flex flex-col overflow-hidden">
          {/* Synced Wallpaper Background */}
          <div
            className="absolute inset-0 bg-cover bg-center transition-all duration-700 pointer-events-none scale-105"
            style={{
              backgroundImage: `url(${wallpaper.url || '/assets/aistudio/79918_d9859049.jpg'})`,
              filter: `blur(${wallpaper.blur ?? 4}px)`,
            }}
          />
          {/* Dimming overlay */}
          <div
            className="absolute inset-0 bg-[#140618] pointer-events-none transition-opacity duration-500"
            style={{ opacity: (wallpaper.dim ?? 35) / 100 }}
          />

          {/* Chat message stream */}
          <div className="relative z-10 flex-1 flex flex-col overflow-hidden">
            <ChatStream
              messages={messages}
              currentUser={currentUser}
              searchQuery={searchQuery}
              onMarkSeen={markMessagesSeen}
              onToggleReaction={toggleReaction}
              onDeleteMessage={deleteMessage}
              onMediaPreview={(url, type) => setMediaPreview({ url, type })}
            />
          </div>
        </div>

        {/* Message Input matching Image 1 */}
        <MessageInput
          currentUser={currentUser}
          onSendMessage={(text) => sendMessage({ type: 'text', text })}
          onSendVoiceNote={handleSendVoiceNote}
          onSendMedia={handleSendMediaFile}
          onOpenCamera={() => setIsCameraOpen(true)}
          onToggleEmojiPicker={() => setIsEmojiPickerOpen((prev) => !prev)}
          isEmojiPickerOpen={isEmojiPickerOpen}
          onTyping={setTyping}
        />

        {/* WhatsApp-style Emoji, Sticker & GIF Picker Drawer */}
        {isEmojiPickerOpen && (
          <EmojiStickerPicker
            onSelectEmoji={handleSelectEmoji}
            onSelectStickerOrGif={handleSelectStickerOrGif}
            onClose={() => setIsEmojiPickerOpen(false)}
          />
        )}

        {/* Bottom Navigation Bar matching Image 1 */}
        <BottomNav
          activeTab={activeTab}
          onSelectTab={handleSelectTab}
          unreadCount={messages.filter((m) => m.sender !== currentUser && m.status !== 'seen').length}
        />

        {/* Commands & Tools Sheet matching Image 2 */}
        <CommandsDrawer
          isOpen={isCommandsOpen}
          onClose={() => setIsCommandsOpen(false)}
          currentUser={currentUser}
          onSwitchProfile={handleToggleUser}
          onOpenWallpaper={() => setIsWallpaperOpen(true)}
          onOpenBackup={() => setIsBackupOpen(true)}
          onOpenCamera={() => setIsCameraOpen(true)}
          isConnected={isConnected}
          isPartnerOnline={isPartnerOnline}
          supabaseStatus={supabaseStatus}
        />

        {/* Snapchat Camera Modal with 10+ Filters & Dual Camera */}
        <CameraModal
          isOpen={isCameraOpen}
          onClose={() => setIsCameraOpen(false)}
          onSendCapturedMedia={handleSendCapturedMedia}
        />

        {/* Live Wallpaper & Themes Manager */}
        <WallpaperModal
          isOpen={isWallpaperOpen}
          onClose={() => setIsWallpaperOpen(false)}
          currentWallpaper={wallpaper}
          onUpdateWallpaper={updateWallpaper}
          currentUser={currentUser}
        />

        {/* Video / Voice Call Modal */}
        <VideoCallModal
          callState={callState}
          currentUser={currentUser}
          onEndCall={handleEndCall}
          onAcceptIncoming={handleAcceptIncoming}
          onRejectIncoming={handleRejectIncoming}
          onSendSignal={sendCallSignal}
        />

        {/* Backup & Export Memories Modal */}
        <BackupModal
          isOpen={isBackupOpen}
          onClose={() => setIsBackupOpen(false)}
          messages={messages}
          currentUser={currentUser}
        />

        {/* Profile & Multi-Device Links Modal */}
        <ProfileModal
          isOpen={isProfileOpen}
          onClose={() => setIsProfileOpen(false)}
          currentUser={currentUser}
          onSwitchUser={handleSwitchUser}
          isPartnerOnline={isPartnerOnline}
        />

        {/* Fullscreen Media Viewer */}
        <MediaPreviewModal
          media={mediaPreview}
          onClose={() => setMediaPreview(null)}
        />
      </div>
    </div>
  );
}
