import { useEffect, useRef, useState, useCallback } from 'react';
import { ChatMessage, UserRole, WallpaperState, SupabaseStatus } from '../types';
import { playMessageReceivedSound, playMessageSentSound } from '../utils/audio';
import { showPartnerNotification } from '../utils/notifications';

interface UseChatSocketProps {
  currentUser: UserRole;
  onCallSignal?: (signal: unknown) => void;
}

export function useChatSocket({ currentUser, onCallSignal }: UseChatSocketProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [wallpaper, setWallpaper] = useState<WallpaperState>({
    type: 'custom',
    url: '/assets/aistudio/79918_d9859049.jpg',
    blur: 4,
    dim: 35,
    updatedBy: 'Muhaidar',
    updatedAt: new Date().toISOString(),
  });
  const [isConnected, setIsConnected] = useState(false);
  const [activeUsers, setActiveUsers] = useState<{ [key: string]: boolean }>({
    Muhaidar: false,
    Bayyan: false,
  });
  const [partnerIsTyping, setPartnerIsTyping] = useState(false);
  const [supabaseStatus, setSupabaseStatus] = useState<SupabaseStatus>({
    url: 'https://yzihbeegbwxiykomeaxw.supabase.co',
    hasKey: false,
    status: 'waiting_for_key',
    statusMessage: 'Connecting...',
    table: 'messages',
  });

  const socketRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<number | null>(null);
  const typingTimeoutRef = useRef<number | null>(null);
  const onCallSignalRef = useRef(onCallSignal);

  useEffect(() => {
    onCallSignalRef.current = onCallSignal;
  }, [onCallSignal]);

  const partner: UserRole = currentUser === 'Muhaidar' ? 'Bayyan' : 'Muhaidar';

  const connect = useCallback(() => {
    try {
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const wsUrl = `${protocol}//${window.location.host}/api/ws`;
      const ws = new WebSocket(wsUrl);
      socketRef.current = ws;

      ws.onopen = () => {
        setIsConnected(true);
        // Identify self
        ws.send(
          JSON.stringify({
            type: 'user:identify',
            payload: {
              user: currentUser,
              deviceId: `dev-${navigator.userAgent.slice(0, 30)}`,
            },
          })
        );
      };

      ws.onmessage = (event) => {
        try {
          const parsed = JSON.parse(event.data);
          const { type } = parsed;

          switch (type) {
            case 'init': {
              const { messages: initMsgs, wallpaper: initWall, activeUsers: initUsers, typingState, supabase } = parsed.data;
              if (Array.isArray(initMsgs)) {
                setMessages(initMsgs);
              }
              if (initWall) {
                setWallpaper(initWall);
              }
              if (initUsers) {
                setActiveUsers(initUsers);
              }
              if (typingState) {
                setPartnerIsTyping(!!typingState[partner]);
              }
              if (supabase) {
                setSupabaseStatus(supabase);
              }
              break;
            }

            case 'init_messages': {
              if (Array.isArray(parsed.messages)) {
                setMessages(parsed.messages);
              }
              break;
            }

            case 'message:new': {
              const newMsg: ChatMessage = parsed.message;
              setMessages((prev) => {
                if (prev.some((m) => m.id === newMsg.id)) {
                  return prev.map((m) => (m.id === newMsg.id ? newMsg : m));
                }
                return [...prev, newMsg];
              });

              // If from partner, play sweet chime and show notification
              if (newMsg.sender !== currentUser) {
                playMessageReceivedSound();
                let snippet = newMsg.text || 'Sent media';
                if (newMsg.type === 'photo') snippet = '📷 Sent a photo ❤️';
                else if (newMsg.type === 'video') snippet = '🎥 Sent a video ❤️';
                else if (newMsg.type === 'audio') snippet = '🎤 Sent a voice note ❤️';
                else if (newMsg.type === 'sticker') snippet = '💌 Sent a romantic sticker';

                showPartnerNotification(`${newMsg.sender} ❤️`, snippet);
              }
              break;
            }

            case 'message:seen_update': {
              const { messageIds, seenAt } = parsed;
              setMessages((prev) =>
                prev.map((m) => {
                  if (messageIds.includes(m.id)) {
                    return { ...m, status: 'seen', seenAt };
                  }
                  return m;
                })
              );
              break;
            }

            case 'message:reaction_update': {
              const { messageId, reactions } = parsed;
              setMessages((prev) =>
                prev.map((m) => (m.id === messageId ? { ...m, reactions } : m))
              );
              break;
            }

            case 'message:deleted': {
              const { messageId } = parsed;
              setMessages((prev) => prev.filter((m) => m.id !== messageId));
              break;
            }

            case 'presence:update': {
              if (parsed.activeUsers) {
                setActiveUsers(parsed.activeUsers);
              }
              break;
            }

            case 'typing:update': {
              if (parsed.typingState) {
                setPartnerIsTyping(!!parsed.typingState[partner]);
              }
              break;
            }

            case 'wallpaper:update': {
              if (parsed.wallpaper) {
                setWallpaper(parsed.wallpaper);
              }
              break;
            }

            case 'call:signal': {
              if (onCallSignalRef.current) {
                onCallSignalRef.current(parsed.signal);
              }
              break;
            }

            default:
              break;
          }
        } catch (e) {
          console.error('Socket message parse error:', e);
        }
      };

      ws.onclose = () => {
        setIsConnected(false);
        socketRef.current = null;
        // Auto-reconnect after 2 seconds
        reconnectTimeoutRef.current = window.setTimeout(connect, 2000);
      };

      ws.onerror = (e) => {
        console.error('WebSocket connection error:', e);
        ws.close();
      };
    } catch (err) {
      console.error('WebSocket init error:', err);
      reconnectTimeoutRef.current = window.setTimeout(connect, 3000);
    }
  }, [currentUser, partner]);

  useEffect(() => {
    connect();
    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      if (socketRef.current) {
        socketRef.current.close();
      }
    };
  }, [connect]);

  // Emit identity update when currentUser changes
  useEffect(() => {
    if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
      socketRef.current.send(
        JSON.stringify({
          type: 'user:identify',
          payload: { user: currentUser },
        })
      );
    }
  }, [currentUser]);

  // Mark unseen messages from partner as seen
  const markMessagesSeen = useCallback(
    (messageIds: string[]) => {
      if (
        messageIds.length > 0 &&
        socketRef.current &&
        socketRef.current.readyState === WebSocket.OPEN
      ) {
        socketRef.current.send(
          JSON.stringify({
            type: 'message:seen',
            payload: {
              messageIds,
              viewer: currentUser,
            },
          })
        );
      }
    },
    [currentUser]
  );

  // Send message
  const sendMessage = useCallback(
    (msg: Partial<ChatMessage>) => {
      const fullMsg: ChatMessage = {
        id: `msg-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        sender: currentUser,
        type: msg.type || 'text',
        text: msg.text || '',
        mediaUrl: msg.mediaUrl,
        mediaName: msg.mediaName,
        mediaSize: msg.mediaSize,
        duration: msg.duration,
        timestamp: new Date().toISOString(),
        status: activeUsers[partner] ? 'delivered' : 'sent',
        reactions: {},
      };

      // Optimistic update
      setMessages((prev) => [...prev, fullMsg]);
      playMessageSentSound();

      if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
        socketRef.current.send(
          JSON.stringify({
            type: 'message:send',
            payload: fullMsg,
          })
        );
      }
    },
    [currentUser, activeUsers, partner]
  );

  // Send reaction
  const toggleReaction = useCallback(
    (messageId: string, emoji: string) => {
      if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
        socketRef.current.send(
          JSON.stringify({
            type: 'message:reaction',
            payload: {
              messageId,
              user: currentUser,
              emoji,
            },
          })
        );
      }
    },
    [currentUser]
  );

  // Delete message
  const deleteMessage = useCallback((messageId: string) => {
    if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
      socketRef.current.send(
        JSON.stringify({
          type: 'message:delete',
          payload: { messageId },
        })
      );
    }
  }, []);

  // Send typing indicator
  const setTyping = useCallback(
    (isTyping: boolean) => {
      if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
        socketRef.current.send(
          JSON.stringify({
            type: 'typing:status',
            payload: {
              user: currentUser,
              isTyping,
            },
          })
        );
      }
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      if (isTyping) {
        typingTimeoutRef.current = window.setTimeout(() => {
          setTyping(false);
        }, 3000);
      }
    },
    [currentUser]
  );

  // Update wallpaper
  const updateWallpaper = useCallback(
    (newWallpaper: Partial<WallpaperState>) => {
      const merged: WallpaperState = {
        ...wallpaper,
        ...newWallpaper,
        updatedBy: currentUser,
        updatedAt: new Date().toISOString(),
      };
      setWallpaper(merged);

      if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
        socketRef.current.send(
          JSON.stringify({
            type: 'wallpaper:update',
            payload: { wallpaper: merged },
          })
        );
      }
    },
    [wallpaper, currentUser]
  );

  // Send call signal
  const sendCallSignal = useCallback((signal: unknown) => {
    if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
      socketRef.current.send(
        JSON.stringify({
          type: 'call:signal',
          payload: signal,
        })
      );
    }
  }, []);

  return {
    messages,
    wallpaper,
    isConnected,
    isPartnerOnline: !!activeUsers[partner],
    partnerIsTyping,
    sendMessage,
    markMessagesSeen,
    toggleReaction,
    deleteMessage,
    setTyping,
    updateWallpaper,
    sendCallSignal,
    supabaseStatus,
  };
}
