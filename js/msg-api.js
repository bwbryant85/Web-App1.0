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
    const g = getGun();
    if (!g) return;
    
    /* Listen to inbox changes — poll for new messages */
    setInterval(() => {
      g.get('ipocket8-inbox-' + me).map().once(msg => {
        if (!msg || !msg.id || !msg.text || !msg.from_user) return;
        if (_inboxSeen.has(msg.id)) return;
        _inboxSeen.add(msg.id);
        _callbacks.forEach(cb => { try { cb(msg); } catch(e) {} });
      });
    }, 300);
    
    /* Also try continuous listening */
    g.get('ipocket8-inbox-' + me).on(data => {
      if (data && typeof data === 'object') {
        Object.values(data).forEach(msg => {
          if (!msg || !msg.id || !msg.text || !msg.from_user) return;
          if (_inboxSeen.has(msg.id)) return;
          _inboxSeen.add(msg.id);
          _callbacks.forEach(cb => { try { cb(msg); } catch(e) {} });
        });
      }
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
      let lastCount = 0;
      let stableCount = 0;
      
      /* Collect messages for 1.6 s, stopping early if stable */
      const t = setTimeout(() => {
        resolve(Object.values(map).sort((a, b) => a.ts - b.ts));
      }, 1600);
      
      const pollId = setInterval(() => {
        g.get(convKey(me, other)).map().once(msg => {
          if (msg && msg.id && msg.text) map[msg.id] = msg;
        });
        
        /* If message count hasn't changed for 2 polls, resolve early */
        const currentCount = Object.keys(map).length;
        if (currentCount === lastCount) {
          stableCount++;
          if (stableCount >= 2) {
            clearTimeout(t);
            clearInterval(pollId);
            resolve(Object.values(map).sort((a, b) => a.ts - b.ts));
          }
        } else {
          stableCount = 0;
        }
        lastCount = currentCount;
      }, 100);
    });
  }

  /* ── Send message ── */
  async function sendMessage(from_user, to_user, text) {
    const g = getGun();
    if (!g) return { ok: false, error: 'Not connected' };
    const ts  = Date.now();
    const id  = ts + '_' + Math.random().toString(36).slice(2, 7);
    const msg = { id, from_user, to_user, text, ts, read: false };

    /* Shared conversation history */
    g.get(convKey(from_user, to_user)).get(id).put(msg);
    /* Recipient's inbox (for real-time delivery) */
    g.get('ipocket8-inbox-' + to_user).get(id).put(msg);
    /* Conversation index for both users */
    g.get('ipocket8-convs-' + from_user).get(to_user).put({ partner: to_user,   text, ts });
    g.get('ipocket8-convs-' + to_user  ).get(from_user).put({ partner: from_user, text, ts });

    /* Force sync by putting again after a short delay */
    setTimeout(() => {
      g.get(convKey(from_user, to_user)).get(id).put(msg);
      g.get('ipocket8-inbox-' + to_user).get(id).put(msg);
      g.get('ipocket8-convs-' + from_user).get(to_user).put({ partner: to_user,   text, ts });
      g.get('ipocket8-convs-' + to_user  ).get(from_user).put({ partner: from_user, text, ts });
    }, 100);

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
      let lastCount = 0;
      let stableCount = 0;
      
      const t = setTimeout(() => {
        resolve(Object.values(map).sort((a, b) => (b.ts || 0) - (a.ts || 0)));
      }, 1600);
      
      const pollId = setInterval(() => {
        g.get('ipocket8-convs-' + username).map().once(entry => {
          if (entry && entry.partner) {
            map[entry.partner] = { 
              partner: entry.partner, 
              text: entry.text || '', 
              ts: entry.ts || 0, 
              unread: 0 
            };
          }
        });
        
        /* Early exit if stable */
        const currentCount = Object.keys(map).length;
        if (currentCount === lastCount) {
          stableCount++;
          if (stableCount >= 2) {
            clearTimeout(t);
            clearInterval(pollId);
            resolve(Object.values(map).sort((a, b) => (b.ts || 0) - (a.ts || 0)));
          }
        } else {
          stableCount = 0;
        }
        lastCount = currentCount;
      }, 100);
    });
  }

  /* ── Real-time subscription for an open chat ── */
  function subscribeToConversation(me, partner, onMsg) {
    const g = getGun();
    if (!g) return () => {};
    const key  = convKey(me, partner);
    const seen = new Set();
    let   ref  = null;
    let   pollId = null;
    
    /* Slight delay so getConversation() can pre-populate shownIds first */
    const tid = setTimeout(() => {
      /* Continuous listening for new messages */
      ref = g.get(key).map().on(msg => {
        if (!msg || !msg.id || !msg.text) return;
        if (seen.has(msg.id)) return;
        seen.add(msg.id);
        onMsg(msg);
      });
      
      /* Also poll every 200ms to catch messages that real-time missed */
      pollId = setInterval(() => {
        g.get(key).map().once(msg => {
          if (!msg || !msg.id || !msg.text) return;
          if (seen.has(msg.id)) return;
          seen.add(msg.id);
          onMsg(msg);
        });
      }, 200);
    }, 50);
    
    return () => { 
      clearTimeout(tid); 
      clearInterval(pollId);
      if (ref && ref.off) ref.off(); 
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
    setTimeout(() => { getGun(); connect(); }, 500);
  });
  
  /* Also try on window load for slower networks */
  if (document.readyState === 'loading') {
    window.addEventListener('load', () => {
      setTimeout(() => { getGun(); connect(); }, 300);
    });
  }

  return {
    getUsername, setUsername, isReceiving, connect, disconnect,
    onNewMessage, register, checkUser, checkServer, isServerAvailable,
    getConversation, sendMessage, getConversations,
    getContacts, saveContact, deleteContact, formatTime,
    subscribeToConversation, markAsRead, getReadStatus
  };
})();
