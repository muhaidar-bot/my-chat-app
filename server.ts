import 'dotenv/config';
import express from 'express';
import http from 'http';
import { WebSocketServer, WebSocket } from 'ws';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DATA_DIR = path.join(__dirname, 'data');
const STORE_FILE = path.join(DATA_DIR, 'chat-store.json');
const UPLOADS_DIR = path.join(__dirname, 'public', 'uploads');

if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

export interface ChatMessage {
  id: string;
  sender: 'Muhaidar' | 'Bayyan';
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
  updatedBy: 'Muhaidar' | 'Bayyan';
  updatedAt: string;
}

interface AppStore {
  messages: ChatMessage[];
  wallpaper: WallpaperState;
}

const defaultInitialStore: AppStore = {
  messages: [
    {
      id: 'm-1',
      sender: 'Muhaidar',
      type: 'call_log',
      text: 'Voice call ended',
      duration: 312,
      timestamp: new Date(Date.now() - 3600000 * 4).toISOString(),
      status: 'seen',
      seenAt: new Date(Date.now() - 3600000 * 3.8).toISOString(),
    },
    {
      id: 'm-2',
      sender: 'Muhaidar',
      type: 'text',
      text: 'Hi my love ❤️ I miss you so much',
      timestamp: new Date(Date.now() - 3600000 * 2).toISOString(),
      status: 'seen',
      seenAt: new Date(Date.now() - 3600000 * 1.9).toISOString(),
    },
    {
      id: 'm-3',
      sender: 'Bayyan',
      type: 'text',
      text: 'Hi baby! ❤️ My forever & moon 🌙 Just arrived home, I miss you more!',
      timestamp: new Date(Date.now() - 3600000 * 1.8).toISOString(),
      status: 'seen',
      seenAt: new Date(Date.now() - 3600000 * 1.7).toISOString(),
    },
    {
      id: 'm-4',
      sender: 'Muhaidar',
      type: 'text',
      text: 'Hi ❤️',
      timestamp: new Date(Date.now() - 3600000 * 1.5).toISOString(),
      status: 'seen',
      seenAt: new Date(Date.now() - 3600000 * 1.4).toISOString(),
    },
  ],
  wallpaper: {
    type: 'custom',
    url: '/assets/aistudio/79918_d9859049.jpg',
    blur: 4,
    dim: 35,
    updatedBy: 'Muhaidar',
    updatedAt: new Date().toISOString(),
  },
};

function loadStore(): AppStore {
  try {
    if (fs.existsSync(STORE_FILE)) {
      const data = fs.readFileSync(STORE_FILE, 'utf-8');
      const parsed = JSON.parse(data);
      if (parsed && Array.isArray(parsed.messages)) {
        return parsed;
      }
    }
  } catch (err) {
    console.error('Error loading store, using default:', err);
  }
  saveStore(defaultInitialStore);
  return defaultInitialStore;
}

function saveStore(store: AppStore) {
  try {
    fs.writeFileSync(STORE_FILE, JSON.stringify(store, null, 2), 'utf-8');
  } catch (err) {
    console.error('Failed to save store:', err);
  }
}

let currentStore = loadStore();

// Supabase Initialization
const SUPABASE_URL = process.env.SUPABASE_URL || 'https://yzihbeegbwxiykomeaxw.supabase.co';
const rawAnonKey = process.env.SUPABASE_ANON_KEY || '';
const hasValidKey = rawAnonKey.trim() !== '' && !rawAnonKey.includes('PASTE');

let supabase: SupabaseClient | null = null;
let supabaseStatus: 'connected' | 'waiting_for_key' | 'error' = hasValidKey ? 'connected' : 'waiting_for_key';
let supabaseStatusMessage = hasValidKey ? 'Connecting to Supabase...' : 'Waiting for Supabase Anon Key';

if (hasValidKey) {
  try {
    supabase = createClient(SUPABASE_URL, rawAnonKey.trim());
    supabaseStatus = 'connected';
    supabaseStatusMessage = `Connected to Supabase (${SUPABASE_URL})`;
    console.log(`[Supabase] Initialized client with ${SUPABASE_URL}`);
  } catch (err) {
    console.error('[Supabase] Init error:', err);
    supabaseStatus = 'error';
    supabaseStatusMessage = 'Error initializing Supabase client';
  }
} else {
  console.log('[Supabase] Waiting for SUPABASE_ANON_KEY in .env');
}

// Map between Supabase DB row and ChatMessage
function rowToMessage(row: Record<string, any>): ChatMessage {
  let text = row.text || '';
  let type: ChatMessage['type'] = 'text';
  let mediaUrl = row.media_url || row.mediaUrl;

  if (!mediaUrl && typeof text === 'string') {
    if (text.startsWith('[photo]: ')) {
      type = 'photo';
      mediaUrl = text.replace('[photo]: ', '');
      text = '';
    } else if (text.startsWith('[video]: ')) {
      type = 'video';
      mediaUrl = text.replace('[video]: ', '');
      text = '';
    } else if (text.startsWith('[audio]: ')) {
      type = 'audio';
      mediaUrl = text.replace('[audio]: ', '');
      text = '';
    } else if (text.startsWith('[sticker]: ')) {
      type = 'sticker';
      mediaUrl = text.replace('[sticker]: ', '');
      text = '';
    } else if (text.startsWith('Voice call ended') || text.startsWith('Video call ended')) {
      type = 'call_log';
    }
  }

  if (row.type) {
    type = row.type;
  }

  return {
    id: String(row.id || `msg-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`),
    sender: row.sender === 'Muhaidar' ? 'Muhaidar' : 'Bayyan',
    text,
    type,
    mediaUrl,
    mediaName: row.media_name || row.mediaName,
    mediaSize: row.media_size || row.mediaSize,
    duration: row.duration,
    timestamp: row.timestamp || row.created_at || new Date().toISOString(),
    status: (row.status as 'sent' | 'delivered' | 'seen') || 'sent',
    seenAt: row.seen_at || row.seenAt,
    reactions: typeof row.reactions === 'object' && row.reactions !== null ? row.reactions : {},
  };
}

function messageToRow(msg: ChatMessage) {
  // Always include the core columns: sender, text, timestamp, status
  const row: Record<string, any> = {
    sender: msg.sender,
    text: msg.text || (msg.mediaUrl ? `[${msg.type}]: ${msg.mediaUrl}` : ''),
    timestamp: msg.timestamp,
    status: msg.status || 'sent',
  };

  if (msg.id) row.id = msg.id;
  if (msg.type) row.type = msg.type;
  if (msg.mediaUrl) row.media_url = msg.mediaUrl;
  if (msg.seenAt) row.seen_at = msg.seenAt;
  if (msg.reactions && Object.keys(msg.reactions).length > 0) row.reactions = msg.reactions;

  return row;
}

// Initial sync with Supabase and listen to Realtime updates
async function initSupabaseSync() {
  if (!supabase) return;

  try {
    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .order('timestamp', { ascending: true });

    if (error) {
      console.warn('[Supabase] Initial messages fetch error (table may need setup):', error.message);
      supabaseStatusMessage = `Supabase: ${error.message}`;
    } else if (data && data.length > 0) {
      console.log(`[Supabase] Synced ${data.length} messages from table 'messages'`);
      const fetched = data.map(rowToMessage);

      // Merge fetched messages with local store
      const map = new Map<string, ChatMessage>();
      currentStore.messages.forEach((m) => map.set(m.id, m));
      fetched.forEach((m) => map.set(m.id, m));

      currentStore.messages = Array.from(map.values()).sort(
        (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
      );
      saveStore(currentStore);
      broadcast({ type: 'init_messages', messages: currentStore.messages });
    }

    // Subscribe to Postgres Realtime changes on 'messages' table
    supabase
      .channel('public:messages')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'messages' },
        (payload) => {
          console.log('[Supabase Realtime] Event received:', payload.eventType);

          if (payload.eventType === 'INSERT') {
            const newMsg = rowToMessage(payload.new);
            if (!currentStore.messages.some((m) => m.id === newMsg.id)) {
              currentStore.messages.push(newMsg);
              saveStore(currentStore);
              broadcast({ type: 'message:new', message: newMsg });
            }
          } else if (payload.eventType === 'UPDATE') {
            const updated = rowToMessage(payload.new);
            const idx = currentStore.messages.findIndex((m) => m.id === updated.id);
            if (idx !== -1) {
              currentStore.messages[idx] = { ...currentStore.messages[idx], ...updated };
              saveStore(currentStore);
              broadcast({
                type: 'message:seen_update',
                messageIds: [updated.id],
                seenAt: updated.seenAt,
              });
              if (updated.reactions) {
                broadcast({
                  type: 'message:reaction_update',
                  messageId: updated.id,
                  reactions: updated.reactions,
                });
              }
            }
          } else if (payload.eventType === 'DELETE' && payload.old) {
            const deletedId = String(payload.old.id);
            currentStore.messages = currentStore.messages.filter((m) => m.id !== deletedId);
            saveStore(currentStore);
            broadcast({ type: 'message:deleted', messageId: deletedId });
          }
        }
      )
      .subscribe((status) => {
        console.log(`[Supabase Realtime] Channel status: ${status}`);
        if (status === 'SUBSCRIBED') {
          supabaseStatus = 'connected';
          supabaseStatusMessage = 'Realtime active (Instagram DM sync)';
        }
      });
  } catch (err) {
    console.error('[Supabase] Sync init exception:', err);
  }
}

initSupabaseSync();

const app = express();
const server = http.createServer(app);
const wss = new WebSocketServer({ server, path: '/api/ws' });

app.use(express.json({ limit: '100mb' }));
app.use(express.urlencoded({ extended: true, limit: '100mb' }));
app.use('/uploads', express.static(UPLOADS_DIR));

// Connected clients tracking
interface ConnectedClient {
  ws: WebSocket;
  user?: 'Muhaidar' | 'Bayyan';
  deviceId?: string;
}

const clients = new Set<ConnectedClient>();
const typingState: { [user: string]: boolean } = {
  Muhaidar: false,
  Bayyan: false,
};

function broadcast(data: object, excludeWs?: WebSocket) {
  const payload = JSON.stringify(data);
  for (const client of clients) {
    if (client.ws.readyState === WebSocket.OPEN && client.ws !== excludeWs) {
      client.ws.send(payload);
    }
  }
}

function getActiveUsers() {
  const active: { [key: string]: boolean } = {
    Muhaidar: false,
    Bayyan: false,
  };
  for (const client of clients) {
    if (client.user && client.ws.readyState === WebSocket.OPEN) {
      active[client.user] = true;
    }
  }
  return active;
}

// REST Endpoints
app.get('/api/state', (req, res) => {
  res.json({
    messages: currentStore.messages,
    wallpaper: currentStore.wallpaper,
    activeUsers: getActiveUsers(),
    typingState,
    supabase: {
      url: SUPABASE_URL,
      hasKey: hasValidKey,
      status: supabaseStatus,
      statusMessage: supabaseStatusMessage,
      table: 'messages',
    },
  });
});

app.get('/api/supabase/status', (req, res) => {
  res.json({
    url: SUPABASE_URL,
    hasKey: hasValidKey,
    status: supabaseStatus,
    statusMessage: supabaseStatusMessage,
    table: 'messages',
    messageCount: currentStore.messages.length,
  });
});

app.post('/api/upload', (req, res) => {
  try {
    const { data, filename, fileType } = req.body;
    if (!data) {
      return res.status(400).json({ error: 'No data provided' });
    }

    let buffer: Buffer;
    let extension = 'bin';
    if (typeof data === 'string' && data.includes(',')) {
      const parts = data.split(',');
      const meta = parts[0];
      const match = meta.match(/:(.*?);/);
      if (match) {
        const mime = match[1];
        if (mime.includes('image/png')) extension = 'png';
        else if (mime.includes('image/jpeg') || mime.includes('image/jpg')) extension = 'jpg';
        else if (mime.includes('image/webp')) extension = 'webp';
        else if (mime.includes('video/mp4')) extension = 'mp4';
        else if (mime.includes('video/webm')) extension = 'webm';
        else if (mime.includes('audio/webm')) extension = 'webm';
        else if (mime.includes('audio/mp3') || mime.includes('audio/mpeg')) extension = 'mp3';
        else if (mime.includes('audio/wav')) extension = 'wav';
        else if (mime.includes('audio/ogg')) extension = 'ogg';
      }
      buffer = Buffer.from(parts[1], 'base64');
    } else {
      buffer = Buffer.from(data, 'base64');
      if (fileType) {
        extension = fileType.replace(/.*\//, '');
      }
    }

    const uniqueName = `media_${Date.now()}_${Math.random().toString(36).substring(2, 8)}.${extension}`;
    const filePath = path.join(UPLOADS_DIR, uniqueName);
    fs.writeFileSync(filePath, buffer);

    const publicUrl = `/uploads/${uniqueName}`;
    res.json({
      url: publicUrl,
      size: buffer.length,
      name: filename || uniqueName,
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ error: 'Upload failed' });
  }
});

app.post('/api/wallpaper', (req, res) => {
  try {
    const { wallpaper } = req.body;
    if (wallpaper) {
      currentStore.wallpaper = {
        ...currentStore.wallpaper,
        ...wallpaper,
        updatedAt: new Date().toISOString(),
      };
      saveStore(currentStore);
      broadcast({
        type: 'wallpaper:update',
        wallpaper: currentStore.wallpaper,
      });
      return res.json({ success: true, wallpaper: currentStore.wallpaper });
    }
    res.status(400).json({ error: 'Invalid wallpaper object' });
  } catch {
    res.status(500).json({ error: 'Failed to update wallpaper' });
  }
});

app.get('/api/export/json', (req, res) => {
  res.setHeader('Content-Disposition', 'attachment; filename="bayyan_muhaidar_memories.json"');
  res.setHeader('Content-Type', 'application/json');
  res.send(JSON.stringify(currentStore, null, 2));
});

// WebSocket Handling
wss.on('connection', (ws) => {
  const client: ConnectedClient = { ws };
  clients.add(client);

  ws.send(
    JSON.stringify({
      type: 'init',
      data: {
        messages: currentStore.messages,
        wallpaper: currentStore.wallpaper,
        activeUsers: getActiveUsers(),
        typingState,
        supabase: {
          url: SUPABASE_URL,
          hasKey: hasValidKey,
          status: supabaseStatus,
          statusMessage: supabaseStatusMessage,
        },
      },
    })
  );

  ws.on('message', async (messageBuffer) => {
    try {
      const parsed = JSON.parse(messageBuffer.toString());
      const { type, payload } = parsed;

      switch (type) {
        case 'user:identify': {
          client.user = payload.user;
          client.deviceId = payload.deviceId;
          broadcast({
            type: 'presence:update',
            activeUsers: getActiveUsers(),
          });
          break;
        }

        case 'message:send': {
          const newMsg: ChatMessage = {
            id: payload.id || `msg-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
            sender: payload.sender,
            text: payload.text,
            type: payload.type || 'text',
            mediaUrl: payload.mediaUrl,
            mediaName: payload.mediaName,
            mediaSize: payload.mediaSize,
            duration: payload.duration,
            timestamp: payload.timestamp || new Date().toISOString(),
            status: 'sent',
            reactions: {},
          };

          const activeUsers = getActiveUsers();
          const recipient = payload.sender === 'Muhaidar' ? 'Bayyan' : 'Muhaidar';
          if (activeUsers[recipient]) {
            newMsg.status = 'delivered';
          }

          if (!currentStore.messages.some((m) => m.id === newMsg.id)) {
            currentStore.messages.push(newMsg);
            saveStore(currentStore);
          }

          // Immediate broadcast for Instagram DM speed
          broadcast({
            type: 'message:new',
            message: newMsg,
          });

          // Save to Supabase table 'messages'
          if (supabase) {
            try {
              const row = messageToRow(newMsg);
              supabase
                .from('messages')
                .upsert(row)
                .then(({ error }) => {
                  if (error) {
                    console.error('[Supabase Save Error]:', error.message);
                  } else {
                    console.log('[Supabase Save Success]: message saved to table messages');
                  }
                });
            } catch (err) {
              console.error('[Supabase Upsert Exception]:', err);
            }
          }
          break;
        }

        case 'message:seen': {
          const { messageIds, viewer } = payload;
          if (Array.isArray(messageIds) && messageIds.length > 0) {
            let updated = false;
            const seenTime = new Date().toISOString();
            currentStore.messages.forEach((m) => {
              if (messageIds.includes(m.id) && m.sender !== viewer) {
                m.status = 'seen';
                m.seenAt = seenTime;
                updated = true;
              }
            });
            if (updated) {
              saveStore(currentStore);
              broadcast({
                type: 'message:seen_update',
                messageIds,
                viewer,
                seenAt: seenTime,
              });

              // Update in Supabase
              if (supabase) {
                supabase
                  .from('messages')
                  .update({ status: 'seen', seen_at: seenTime })
                  .in('id', messageIds)
                  .then(({ error }) => {
                    if (error) console.error('[Supabase Seen Update Error]:', error.message);
                  });
              }
            }
          }
          break;
        }

        case 'message:reaction': {
          const { messageId, user, emoji } = payload;
          const msg = currentStore.messages.find((m) => m.id === messageId);
          if (msg) {
            msg.reactions = msg.reactions || {};
            if (msg.reactions[user] === emoji) {
              delete msg.reactions[user];
            } else {
              msg.reactions[user] = emoji;
            }
            saveStore(currentStore);
            broadcast({
              type: 'message:reaction_update',
              messageId,
              reactions: msg.reactions,
            });

            // Update in Supabase
            if (supabase) {
              supabase
                .from('messages')
                .update({ reactions: msg.reactions })
                .eq('id', messageId)
                .then(({ error }) => {
                  if (error) console.error('[Supabase Reaction Error]:', error.message);
                });
            }
          }
          break;
        }

        case 'message:delete': {
          const { messageId } = payload;
          const index = currentStore.messages.findIndex((m) => m.id === messageId);
          if (index !== -1) {
            currentStore.messages.splice(index, 1);
            saveStore(currentStore);
            broadcast({
              type: 'message:deleted',
              messageId,
            });

            // Delete from Supabase
            if (supabase) {
              supabase
                .from('messages')
                .delete()
                .eq('id', messageId)
                .then(({ error }) => {
                  if (error) console.error('[Supabase Delete Error]:', error.message);
                });
            }
          }
          break;
        }

        case 'typing:status': {
          const { user, isTyping } = payload;
          if (user === 'Muhaidar' || user === 'Bayyan') {
            typingState[user] = !!isTyping;
            broadcast({
              type: 'typing:update',
              typingState,
            });
          }
          break;
        }

        case 'wallpaper:update': {
          const { wallpaper } = payload;
          if (wallpaper) {
            currentStore.wallpaper = {
              ...currentStore.wallpaper,
              ...wallpaper,
              updatedAt: new Date().toISOString(),
            };
            saveStore(currentStore);
            broadcast({
              type: 'wallpaper:update',
              wallpaper: currentStore.wallpaper,
            });
          }
          break;
        }

        case 'call:signal': {
          broadcast(
            {
              type: 'call:signal',
              signal: payload,
            },
            ws
          );
          break;
        }

        default:
          break;
      }
    } catch (err) {
      console.error('Error parsing websocket message:', err);
    }
  });

  ws.on('close', () => {
    clients.delete(client);
    if (client.user) {
      typingState[client.user] = false;
      broadcast({
        type: 'presence:update',
        activeUsers: getActiveUsers(),
      });
      broadcast({
        type: 'typing:update',
        typingState,
      });
    }
  });

  ws.on('error', (err) => {
    console.error('WebSocket error:', err);
    clients.delete(client);
  });
});

const PORT = 3000;

async function startServer() {
  if (process.env.NODE_ENV === 'production' && fs.existsSync(path.join(__dirname, 'dist'))) {
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
  } else {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true, hmr: false, watch: null },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  server.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
