/**
 * msg-api.js — iPOCKET Messaging Client API
 * Uses Flask backend server with SQLite database + WebSocket for real-time delivery
 */
'use strict';

window.MSG = (function () {
  const API_BASE = window.location.origin; // Use same origin as app
  let _callbacks = [];       // onNewMessage subscribers
  let _inboxSeen = new Set(); // dedup inbox events
  let _socket = null;         // WebSocket connection
  let _isConnected = false;   // connection state
  let _pollInterval = null;   // fallback polling

  /* ── Persistence helpers ── */
  function getUsername() { return localStorage.getItem('ipocket_username') || null; }
  function setUsername(u) { localStorage.setItem('ipocket_username', u.trim().toLowerCase()); }
  function isReceiving() { return localStorage.getItem('ipocket_receive_messages') !== '0'; }

  /* ── Initialize WebSocket for real-time messages ── */
  function initWebSocket() {
    try {
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const socketUrl = protocol + '//' + window.location.host;
      const io = window.io;
      
      if (!io) {
        console.log('[MSG] Socket.IO not loaded, using polling fallback');
        return null;
      }

      _socket = io(socketUrl, {
        reconnection: true,
        reconnectionDelay: 1000,
        reconnectionDelayMax: 5000,
        reconnectionAttempts: 5
      });

      _socket.on('connect', () => {
        console.log('[MSG] WebSocket connected');
        const me = getUsername();
        if (me) {
          _socket.emit('join', { username: me });
        }
      });

      _socket.on('new_message', (msg) => {
        const me = getUsername();
        if (msg.to_user === me && !_inboxSeen.has(msg.id)) {
          _inboxSeen.add(msg.id);
          console.log('[MSG] New message via WebSocket:', msg.id);
          _callbacks.forEach(cb => { try { cb(msg); } catch (e) { console.error('[MSG] Callback error:', e); } });
        }
      });

      _socket.on('disconnect', () => {
        console.log('[MSG] WebSocket disconnected');
      });

      return _socket;
    } catch (e) {
      console.log('[MSG] WebSocket init failed:', e);
      return null;
    }
  }

  /* ── Real-time polling fallback ── */
  function startPolling() {
    const me = getUsername();
    if (!me) return;

    _pollInterval = setInterval(async () => {
      try {
        const response = await fetch(`${API_BASE}/api/messages/conversations/${me}`);
        if (response.ok) {
          const convs = await response.json();
          // For each conversation, get latest messages
          for (const conv of convs) {
            const msgResponse = await fetch(`${API_BASE}/api/messages/${me}/${conv.partner}`);
            if (msgResponse.ok) {
              const msgs = await msgResponse.json();
              msgs.forEach(msg => {
                if (msg.from_user === conv.partner && !_inboxSeen.has(msg.id)) {
                  _inboxSeen.add(msg.id);
                  console.log('[MSG] New message via polling:', msg.id);
                  _callbacks.forEach(cb => { try { cb(msg); } catch (e) {} });
                }
              });
            }
          }
        }
      } catch (e) {
        console.error('[MSG] Polling error:', e);
      }
    }, 1000);
  }

  function stopPolling() {
    if (_pollInterval) {
      clearInterval(_pollInterval);
      _pollInterval = null;
    }
  }

  /* ── Real-time connection ── */
  function connect() {
    const me = getUsername();
    if (!me || !isReceiving()) return;
    if (_isConnected) return;

    _isConnected = true;
    console.log('[MSG] Connecting for user:', me);

    // Try WebSocket first
    if (!initWebSocket()) {
      // Fall back to polling
      startPolling();
    }
  }

  function disconnect() {
    stopPolling();
    if (_socket) {
      _socket.disconnect();
      _socket = null;
    }
    _isConnected = false;
  }

  function onNewMessage(cb) {
    _callbacks.push(cb);
    return () => { _callbacks = _callbacks.filter(c => c !== cb); };
  }

  /* ── Server checking ── */
  async function checkServer() {
    try {
      const response = await fetch(`${API_BASE}/api/ping`);
      return response.ok;
    } catch (e) {
      return false;
    }
  }

  function isServerAvailable() {
    return true; // Assume server available, will fail on actual requests if not
  }

  /* ── Username registration ── */
  async function register(username) {
    username = username.trim().toLowerCase();
    if (!username || !/^[a-z0-9_-]{2,24}$/.test(username))
      return { ok: false, error: 'Invalid username — letters, numbers, - and _ only (2–24 chars)' };

    try {
      const response = await fetch(`${API_BASE}/api/username/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username })
      });

      const data = await response.json();
      if (response.ok) {
        return { ok: true, username };
      } else {
        return { ok: false, error: data.error || 'Registration failed' };
      }
    } catch (e) {
      return { ok: false, error: 'Network error — check internet connection' };
    }
  }

  async function checkUser(username) {
    try {
      const response = await fetch(`${API_BASE}/api/username/check/${username.toLowerCase()}`);
      if (response.ok) {
        const data = await response.json();
        return { exists: data.exists };
      }
      return { exists: false };
    } catch (e) {
      return { exists: false };
    }
  }

  /* ── Message history ── */
  async function getConversation(me, other) {
    try {
      const response = await fetch(`${API_BASE}/api/messages/${me}/${other}`);
      if (response.ok) {
        const msgs = await response.json();
        console.log('[MSG] Got', msgs.length, 'messages from conversation with:', other);
        return msgs;
      }
      return [];
    } catch (e) {
      console.error('[MSG] Error getting conversation:', e);
      return [];
    }
  }

  /* ── Send message ── */
  async function sendMessage(from_user, to_user, text) {
    try {
      console.log('[MSG] Sending message from', from_user, 'to', to_user);

      const response = await fetch(`${API_BASE}/api/messages/send`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ from_user, to_user, text })
      });

      const data = await response.json();
      if (response.ok) {
        console.log('[MSG] Message sent successfully:', data.message.id);
        // Notify local listeners immediately
        _callbacks.forEach(cb => { try { cb(data.message); } catch (e) {} });
        return { ok: true, message: data.message };
      } else {
        return { ok: false, error: data.error || 'Failed to send message' };
      }
    } catch (e) {
      console.error('[MSG] Send error:', e);
      return { ok: false, error: 'Network error' };
    }
  }

  /* ── Mark message as read ── */
  async function markAsRead(me, partner, messageId) {
    // Server auto-marks messages as read when fetching conversation
    // This is handled in getConversation()
    console.log('[MSG] Message marked as read:', messageId);
  }

  /* ── Get read status ── */
  async function getReadStatus(me, partner, messageId) {
    try {
      const msgs = await getConversation(me, partner);
      const msg = msgs.find(m => m.id === messageId);
      if (msg && msg.read) {
        return { read: true, readAt: Date.now() };
      }
      return { read: false };
    } catch (e) {
      return { read: false };
    }
  }

  /* ── Conversation list ── */
  async function getConversations(username) {
    try {
      const response = await fetch(`${API_BASE}/api/messages/conversations/${username}`);
      if (response.ok) {
        const convs = await response.json();
        console.log('[MSG] Got', convs.length, 'conversations for', username);
        return convs;
      }
      return [];
    } catch (e) {
      console.error('[MSG] Error getting conversations:', e);
      return [];
    }
  }

  /* ── Real-time subscription for an open chat ── */
  function subscribeToConversation(me, partner, onMsg) {
    const seen = new Set();
    let pollId = null;

    console.log('[MSG] Subscribing to conversation with:', partner);

    // Set up polling for new messages in this conversation
    pollId = setInterval(async () => {
      try {
        const msgs = await getConversation(me, partner);
        msgs.forEach(msg => {
          if (!seen.has(msg.id)) {
            seen.add(msg.id);
            console.log('[MSG] Conversation message received:', msg.id);
            onMsg(msg);
          }
        });
      } catch (e) {
        console.error('[MSG] Subscription error:', e);
      }
    }, 500);

    return () => {
      if (pollId) {
        clearInterval(pollId);
        console.log('[MSG] Unsubscribed from conversation with:', partner);
      }
    };
  }

  /* ── Contacts ── */
  async function getContacts(owner) {
    try {
      const response = await fetch(`${API_BASE}/api/contacts/${owner}`);
      if (response.ok) {
        return await response.json();
      }
      return [];
    } catch (e) {
      return [];
    }
  }

  async function saveContact(owner, username, display_name) {
    const check = await checkUser(username);
    if (!check.exists) return { ok: false, error: 'User not found — they must register first' };

    try {
      const response = await fetch(`${API_BASE}/api/contacts/save`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ owner, username, display_name })
      });

      if (response.ok) {
        return { ok: true };
      } else {
        return { ok: false, error: 'Failed to save contact' };
      }
    } catch (e) {
      return { ok: false, error: 'Network error' };
    }
  }

  async function deleteContact(owner, username) {
    try {
      const response = await fetch(`${API_BASE}/api/contacts/delete`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ owner, username })
      });

      return { ok: response.ok };
    } catch (e) {
      return { ok: false };
    }
  }

  function formatTime(ts) {
    const d = new Date(ts);
    const now = new Date();
    const diff = Math.floor((now - d) / 86400000);
    if (diff === 0) return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    if (diff === 1) return 'Yesterday';
    if (diff < 7) return d.toLocaleDateString([], { weekday: 'short' });
    return d.toLocaleDateString([], { month: 'short', day: 'numeric' });
  }

  /* Auto-init on page load */
  document.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => {
      console.log('[MSG] Initializing backend messaging...');
      connect();
    }, 200);
  });

  return {
    getUsername, setUsername, isReceiving, connect, disconnect,
    onNewMessage, register, checkUser, checkServer, isServerAvailable,
    getConversation, sendMessage, getConversations,
    getContacts, saveContact, deleteContact, formatTime,
    subscribeToConversation, markAsRead, getReadStatus
  };
})();
