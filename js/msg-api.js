/**
 * msg-api.js — iPOCKET Messaging Client API (Gun.js edition)
 * Works on GitHub Pages — no server required.
 * All data is stored in Gun.js distributed graph (public relay peers + localStorage).
 */
'use strict';

window.MSG = (function () {
  /* Public Gun.js relay peers — fall back to localStorage if all fail */
  const PEERS = [
    'https://relay.gun.eco/gun',
    'https://gun-us.era.eco/gun',
    'https://gun-eu.era.eco/gun',
    'https://gunjs.herokuapp.com/gun',
    'https://gun-manhattan.herokuapp.com/gun'
  ];

  let _gun       = null;
  let _callbacks = [];     // onNewMessage subscribers
  let _inboxSeen = new Set(); // dedup inbox events
  let _readReceipts = {}; // { messageId: { read: true, readAt: timestamp } }
  let _inboxSubscription = null; // inbox subscription reference
  let _isConnected = false; // connection state

  /* ── Gun.js singleton ── */
  function getGun() {
    if (!_gun) {
      if (!window.Gun) { console.warn('[MSG] Gun.js not loaded'); return null; }
      _gun = Gun(PEERS);
    }
    return _gun;
  }

  /* ── Persistence helpers ── */
  function getUsername() { return localStorage.getItem('ipocket_username') || null; }
  function setUsername(u){ localStorage.setItem('ipocket_username', u.trim().toLowerCase()); }
  function isReceiving() { return localStorage.getItem('ipocket_receive_messages') !== '0'; }

  /* ── Real-time inbox subscription (called after login) ── */
  function connect() {
    const me = getUsername();
    if (!me || !isReceiving()) return;
    if (_isConnected) return; // already connected
    
    const g = getGun();
    if (!g) return;
    
    _isConnected = true;
    console.log('[MSG] Connected for user:', me);
    
    /* Subscribe to inbox using .on() for continuous real-time updates */
    _inboxSubscription = g.get('ipocket8-inbox-' + me).map().on(function(msg) {
      if (!msg) return;
      if (!msg.id || !msg.text || !msg.from_user) return;
      if (_inboxSeen.has(msg.id)) return;
      
      _inboxSeen.add(msg.id);
      console.log('[MSG] New message received:', msg.id);
      _callbacks.forEach(cb => { try { cb(msg); } catch(e) { console.error('[MSG] Callback error:', e); } });
    });
  }
  function disconnect() { /* subscriptions are session-scoped */ }

  function onNewMessage(cb) {
    _callbacks.push(cb);
    return () => { _callbacks = _callbacks.filter(c => c !== cb); };
  }

  /* ── Server compat stubs (previously Flask-based) ── */
  async function checkServer()  { return true; }
  function  isServerAvailable() { return true; }

  /* ── Username registration ── */
  async function register(username) {
    username = username.trim().toLowerCase();
    if (!username || !/^[a-z0-9_-]{2,24}$/.test(username))
      return { ok: false, error: 'Invalid username — letters, numbers, - and _ only (2–24 chars)' };
    const g = getGun();
    if (!g) return { ok: false, error: 'Gun.js unavailable — refresh and try again' };

    return new Promise(resolve => {
      let settled = false;
      const done  = r => { if (!settled) { settled = true; resolve(r); } };

      /* Give peers 2.5 s to confirm if name is taken.
         null/undefined once() → name is free. */
      const timer = setTimeout(() => {
        g.get('ipocket8-users').get(username).put({ username, created_at: Date.now() });
        done({ ok: true, username });
      }, 2500);

      g.get('ipocket8-users').get(username).once(data => {
        if (data && data.username) { clearTimeout(timer); done({ ok: false, error: 'Username already taken' }); }
      });
    });
  }

  async function checkUser(username) {
    const g = getGun();
    if (!g) return { exists: false };
    return new Promise(resolve => {
      const t = setTimeout(() => resolve({ exists: false }), 2500);
      g.get('ipocket8-users').get(username).once(data => {
        clearTimeout(t);
        resolve({ exists: !!(data && data.username) });
      });
    });
  }

  /* ── Conversation key (sorted so both users see same node) ── */
  function convKey(a, b) {
    return 'ipocket8-conv-' + [a, b].sort().join('__');
  }

  /* ── Message history ── */
  async function getConversation(me, other) {
    const g = getGun();
    if (!g) return [];
    return new Promise(resolve => {
      const map = {};
      const key = convKey(me, other);
      let timeoutId = null;
      
      /* Subscribe and collect messages for 2 seconds */
      const subscription = g.get(key).map().on(msg => {
        if (msg && msg.id && msg.text) {
          map[msg.id] = msg;
        }
      });
      
      timeoutId = setTimeout(() => {
        if (subscription && subscription.off) subscription.off();
        const result = Object.values(map).sort((a, b) => a.ts - b.ts);
        console.log('[MSG] Got', result.length, 'messages from', key);
        resolve(result);
      }, 2000);
    });
  }

  /* ── Send message ── */
  async function sendMessage(from_user, to_user, text) {
    const g = getGun();
    if (!g) return { ok: false, error: 'Not connected' };
    
    const ts  = Date.now();
    const id  = ts + '_' + Math.random().toString(36).slice(2, 7);
    const msg = { id, from_user, to_user, text, ts, read: false };

    console.log('[MSG] Sending message from', from_user, 'to', to_user, '- ID:', id);
    
    const convkey = convKey(from_user, to_user);
    
    try {
      /* Write to shared conversation history */
      await new Promise((resolve) => {
        g.get(convkey).get(id).put(msg, (ack) => {
          if (ack.ok) console.log('[MSG] Conv history saved');
          resolve();
        });
      });
      
      /* Write to recipient's inbox with multiple retries */
      for (let i = 0; i < 3; i++) {
        await new Promise((resolve) => {
          g.get('ipocket8-inbox-' + to_user).get(id).put(msg, (ack) => {
            if (ack.ok) console.log('[MSG] Inbox write #' + (i+1) + ' succeeded');
            resolve();
          });
        });
        if (i < 2) await new Promise(r => setTimeout(r, 50));
      }
      
      /* Update conversation index for both users */
      await new Promise((resolve) => {
        g.get('ipocket8-convs-' + from_user).get(to_user).put({ partner: to_user, text, ts }, () => resolve());
      });
      
      await new Promise((resolve) => {
        g.get('ipocket8-convs-' + to_user).get(from_user).put({ partner: from_user, text, ts }, () => resolve());
      });
      
      console.log('[MSG] Message sent successfully:', id);
    } catch(e) {
      console.error('[MSG] Send error:', e);
      return { ok: false, error: 'Failed to send message' };
    }

    /* Notify local listeners immediately (sender sees sent msg at once) */
    _callbacks.forEach(cb => { try { cb(msg); } catch(e) {} });
    return { ok: true, message: msg };
  }

  /* ── Mark message as read ── */
  async function markAsRead(me, partner, messageId) {
    const g = getGun();
    if (!g) return;
    const key = convKey(me, partner);
    g.get(key).get(messageId).get('read').put(true);
    g.get(key).get(messageId).get('readAt').put(Date.now());
    _readReceipts[messageId] = { read: true, readAt: Date.now() };
  }

  /* ── Get read status for a message ── */
  async function getReadStatus(me, partner, messageId) {
    if (_readReceipts[messageId]) return _readReceipts[messageId];
    const g = getGun();
    if (!g) return { read: false };
    return new Promise(resolve => {
      const t = setTimeout(() => resolve({ read: false }), 800);
      g.get(convKey(me, partner)).get(messageId).once(msg => {
        clearTimeout(t);
        if (msg && msg.read) {
          resolve({ read: msg.read, readAt: msg.readAt || 0 });
        } else {
          resolve({ read: false });
        }
      });
    });
  }

  /* ── Conversation list ── */
  async function getConversations(username) {
    const g = getGun();
    if (!g) return [];
    return new Promise(resolve => {
      const map = {};
      
      const subscription = g.get('ipocket8-convs-' + username).map().on(entry => {
        if (entry && entry.partner) {
          map[entry.partner] = { 
            partner: entry.partner, 
            text: entry.text || '', 
            ts: entry.ts || 0, 
            unread: 0 
          };
        }
      });
      
      /* Collect for 2 seconds then resolve */
      setTimeout(() => {
        if (subscription && subscription.off) subscription.off();
        const result = Object.values(map).sort((a, b) => (b.ts || 0) - (a.ts || 0));
        console.log('[MSG] Got', result.length, 'conversations for', username);
        resolve(result);
      }, 2000);
    });
  }

  /* ── Real-time subscription for an open chat ── */
  function subscribeToConversation(me, partner, onMsg) {
    const g = getGun();
    if (!g) return () => {};
    const key  = convKey(me, partner);
    const seen = new Set();
    let   ref  = null;
    
    console.log('[MSG] Subscribing to conversation:', key);
    
    /* Continuous listening for new messages */
    ref = g.get(key).map().on(function(msg) {
      if (!msg || !msg.id || !msg.text) return;
      if (seen.has(msg.id)) return;
      seen.add(msg.id);
      console.log('[MSG] Conversation message received:', msg.id);
      onMsg(msg);
    });
    
    return () => { 
      if (ref && ref.off) {
        ref.off();
        console.log('[MSG] Unsubscribed from conversation:', key);
      }
    };
  }

  /* ── Contacts ── */
  async function getContacts(owner) {
    const g = getGun();
    if (!g) return [];
    return new Promise(resolve => {
      const map = {};
      setTimeout(() => resolve(Object.values(map)), 1600);
      g.get('ipocket8-contacts-' + owner).map().once(ct => {
        if (ct && ct.username) map[ct.username] = ct;
      });
    });
  }
  async function saveContact(owner, username, display_name) {
    const g = getGun();
    if (!g) return { ok: false };
    const check = await checkUser(username);
    if (!check.exists) return { ok: false, error: 'User not found — they must register first' };
    g.get('ipocket8-contacts-' + owner).get(username).put({ username, display_name: display_name || username });
    return { ok: true };
  }
  async function deleteContact(owner, username) {
    const g = getGun();
    if (!g) return { ok: false };
    g.get('ipocket8-contacts-' + owner).get(username).put(null);
    return { ok: true };
  }

  function formatTime(ts) {
    const d    = new Date(ts);
    const now  = new Date();
    const diff = Math.floor((now - d) / 86400000);
    if (diff === 0) return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    if (diff === 1) return 'Yesterday';
    if (diff < 7)  return d.toLocaleDateString([], { weekday: 'short' });
    return d.toLocaleDateString([], { month: 'short', day: 'numeric' });
  }

  /* Auto-init on page load */
  document.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => { 
      console.log('[MSG] Initializing Gun.js...');
      getGun();
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
