export type UserRole = 'Muhaidar' | 'Bayyan';

export type ActiveTab = 'chat' | 'backup' | 'camera' | 'theme' | 'profile';

export interface ChatMessage {
  id: string;
  sender: UserRole;
  text?: string;
  type: 'text' | 'photo' | 'video' | 'audio' | 'sticker' | 'call_log';
  mediaUrl?: string;
  mediaName?: string;
  mediaSize?: number;
  duration?: number;
  timestamp: string;
  status: 'sent' | 'delivered' | 'seen';
  seenAt?: string;
  reactions?: { [user: string]: string };
}

export interface WallpaperState {
  type: 'custom' | 'preset' | 'gradient';
  url: string;
  blur: number;
  dim: number;
  updatedBy: UserRole;
  updatedAt: string;
}

export interface CallState {
  active: boolean;
  type: 'voice' | 'video';
  mode: 'outgoing' | 'incoming' | 'connected';
  partner: UserRole;
  startedAt?: number;
  duration: number;
  isMuted: boolean;
  isVideoOff: boolean;
  facingMode: 'user' | 'environment';
}

export interface FilterOption {
  id: string;
  name: string;
  icon: string;
  cssFilter: string;
  overlay?: 'hearts' | 'sparkles' | 'crown' | 'blush' | 'vintage_frame' | 'film_grain' | 'love_quote';
}

export interface SupabaseStatus {
  url: string;
  hasKey: boolean;
  status: 'connected' | 'waiting_for_key' | 'error';
  statusMessage: string;
  table?: string;
}

