/**
 * msg-api.js — iPOCKET Messaging — 100% Local / GitHub Pages Edition
 *
 * HOW IT WORKS:
 *  - All messages stored in localStorage, XOR+base64 encoded
 *  - Username + SHA-256 hashed password auth
 *  - "Cross-device" = export a .ipm file → share it → other device imports it
 *  - NO outside network connections ever. Works completely offline.
 *  - The .ipm file is encoded so contents are not human-readable
 *
 * ACCOUNT SYSTEM:
 *  - register(username, password) → creates account on this device
 *  - login(username, password) → verifies and sets active session
 *  - logout() → clears session (keeps account data)
 *  - changePassword(newPassword) → updates hash
 *
 * SESSION:
 *  - Active session tracked via sessionStorage (clears on tab close)
 *  - On revisit: if account exists, show login screen
 */
'use strict';

window.MSG = (() => {

  /* ══════════════════════════════════════════════════════════
     CIPHER — XOR with rolling key, output as base64
  ══════════════════════════════════════════════════════════ */
  const _SEED = 'iPK_v2_xX9#mQ3$nR7@wS5!tV1^kW8&';

  function _key(len) {
    const k = new Uint8Array(len);
    let h = 0x811c9dc5;
    for (let i = 0; i < len; i++) {
      h ^= _SEED.charCodeAt(i % _SEED.length);
      h = Math.imul(h, 0x01000193) >>> 0;
      k[i] = h & 0xFF;
    }
    return k;
  }

  function encode(str) {
    const b = new TextEncoder().encode(str);
    const k = _key(b.length);
    return btoa(String.fromCharCode(...b.map((x, i) => x ^ k[i])));
  }

  function decode(b64) {
    try {
      const r = atob(b64);
      const b = Uint8Array.from(r, c => c.charCodeAt(0));
      const k = _key(b.length);
      return new TextDecoder().decode(b.map((x, i) => x ^ k[i]));
    } catch { return null; }
  }

  /* ══════════════════════════════════════════════════════════
     SHA-256 (async, SubtleCrypto)
  ══════════════════════════════════════════════════════════ */
  async function sha256(s) {
    const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(s));
    return [...new Uint8Array(buf)].map(b => b.toString(16).padStart(2,'0')).join('');
  }

  /* ══════════════════════════════════════════════════════════
     STORAGE KEYS
  ══════════════════════════════════════════════════════════ */
  const K = {
    ACCOUNT:  'ipm_acct',    // encoded {username, passHash, createdAt}
    MESSAGES: 'ipm_msgs',    // encoded DB
    SESSION:  'ipm_sess',    // sessionStorage — {username}
  };

  /* ══════════════════════════════════════════════════════════
     ACCOUNT
  ══════════════════════════════════════════════════════════ */
  function _getAcct() {
    const raw = localStorage.getItem(K.ACCOUNT);
    if (!raw) return null;
    try { return JSON.parse(decode(raw)); } catch { return null; }
  }
  function _saveAcct(obj) {
    localStorage.setItem(K.ACCOUNT, encode(JSON.stringify(obj)));
  }

  // Session = who is logged in RIGHT NOW this tab
  function _getSession() {
    try { return JSON.parse(sessionStorage.getItem(K.SESSION) || 'null'); } catch { return null; }
  }
  function _setSession(username) {
    sessionStorage.setItem(K.SESSION, JSON.stringify({ username }));
  }
  function _clearSession() {
    sessionStorage.removeItem(K.SESSION);
  }

  function getUsername() {
    return _getSession()?.username || null;
  }

  function hasAccount() {
    return !!localStorage.getItem(K.ACCOUNT);
  }

  async function register(username, password) {
    username = username.trim().toLowerCase();
    if (!username || !/^[a-z0-9_-]{2,24}$/.test(username))
      return { ok: false, error: 'Username: 2–24 chars, letters/numbers/–/_' };
    if (!password || password.length < 4)
      return { ok: false, error: 'Password must be at least 4 characters' };
    if (hasAccount())
      return { ok: false, error: 'An account already exists on this device. Log in instead.' };
    const passHash = await sha256(password + username + _SEED);
    _saveAcct({ username, passHash, createdAt: Date.now() });
    _setSession(username);
    return { ok: true, username };
  }

  async function login(username, password) {
    username = username.trim().toLowerCase();
    const acct = _getAcct();
    if (!acct) return { ok: false, error: 'No account on this device. Register first.' };
    if (acct.username !== username) return { ok: false, error: 'Wrong username.' };
    const passHash = await sha256(password + username + _SEED);
    if (acct.passHash !== passHash) return { ok: false, error: 'Wrong password.' };
    _setSession(username);
    return { ok: true, username };
  }

  function logout() { _clearSession(); }

  async function changePassword(newPassword) {
    const acct = _getAcct();
    if (!acct) return { ok: false };
    if (newPassword.length < 4) return { ok: false, error: 'Password too short' };
    acct.passHash = await sha256(newPassword + acct.username + _SEED);
    _saveAcct(acct);
    return { ok: true };
  }

  function deleteAccount() {
    localStorage.removeItem(K.ACCOUNT);
    localStorage.removeItem(K.MESSAGES);
    _clearSession();
  }

  /* ══════════════════════════════════════════════════════════
     MESSAGE DATABASE
     Structure: { conversations: { "aaa__bbb": [msg, ...] } }
     Key always sorted so both users share the same bucket
  ══════════════════════════════════════════════════════════ */
  function _ck(a, b) { return [a, b].sort().join('__'); }

  function _db() {
    const raw = localStorage.getItem(K.MESSAGES);
    if (!raw) return { conversations: {} };
    try { return JSON.parse(decode(raw)) || { conversations: {} }; } catch { return { conversations: {} }; }
  }

  function _save(db) {
    localStorage.setItem(K.MESSAGES, encode(JSON.stringify(db)));
  }

  function _genId() {
    return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
  }

  /* ══════════════════════════════════════════════════════════
     MESSAGES API
  ══════════════════════════════════════════════════════════ */
  async function sendMessage(from_user, to_user, text) {
    const db  = _db();
    const key = _ck(from_user, to_user);
    if (!db.conversations[key]) db.conversations[key] = [];
    const msg = {
      id: _genId(),
      from_user, to_user,
      text: text.trim(),
      ts: Date.now(),
      read: false,
    };
    db.conversations[key].push(msg);
    _save(db);
    // Notify local listeners (same tab)
    _notify(msg);
    return { ok: true, message: msg };
  }

  async function getConversation(me, other) {
    const db   = _db();
    const key  = _ck(me, other);
    const msgs = (db.conversations[key] || []).slice();
    // Mark incoming as read
    let dirty = false;
    msgs.forEach(m => {
      if (m.to_user === me && !m.read) { m.read = true; dirty = true; }
    });
    if (dirty) {
      // Write read flags back
      const dbw = _db();
      const km  = dbw.conversations[key] || [];
      km.forEach(m => { if (m.to_user === me) m.read = true; });
      dbw.conversations[key] = km;
      _save(dbw);
    }
    return msgs;
  }

  async function getConversations(username) {
    const db  = _db();
    const out = [];
    for (const [key, msgs] of Object.entries(db.conversations)) {
      if (!msgs.length) continue;
      const parts = key.split('__');
      if (!parts.includes(username)) continue;
      const partner = parts.find(p => p !== username) || parts[0];
      const last    = msgs[msgs.length - 1];
      const unread  = msgs.filter(m => m.to_user === username && !m.read).length;
      out.push({ partner, text: last.text, ts: last.ts, unread });
    }
    return out.sort((a, b) => b.ts - a.ts);
  }

  async function markAsRead(me, partner, messageId) {
    const db  = _db();
    const key = _ck(me, partner);
    const msgs = db.conversations[key] || [];
    let changed = false;
    msgs.forEach(m => { if (m.id === messageId && !m.read) { m.read = true; changed = true; } });
    if (changed) _save(db);
  }

  async function getReadStatus(me, partner, messageId) {
    const db  = _db();
    const key = _ck(me, partner);
    const msg = (db.conversations[key] || []).find(m => m.id === messageId);
    return { read: !!msg?.read };
  }

  /* ══════════════════════════════════════════════════════════
     REAL-TIME — poll localStorage every 800ms
     Works across tabs on the same browser (same device).
     For cross-device: use export/import below.
  ══════════════════════════════════════════════════════════ */
  let _cbs    = [];
  let _pollId = null;
  const _seen = new Set();

  function _notify(msg) {
    _cbs.forEach(cb => { try { cb(msg); } catch {} });
  }

  function connect() {
    if (_pollId) return;
    _pollId = setInterval(() => {
      const me = getUsername();
      if (!me) return;
      const db = _db();
      for (const msgs of Object.values(db.conversations)) {
        for (const msg of msgs) {
          if (msg.to_user === me && !_seen.has(msg.id) && !msg.read) {
            _seen.add(msg.id);
            _notify(msg);
          }
        }
      }
    }, 800);
  }

  function disconnect() {
    if (_pollId) { clearInterval(_pollId); _pollId = null; }
  }

  function onNewMessage(cb) {
    _cbs.push(cb);
    return () => { _cbs = _cbs.filter(c => c !== cb); };
  }

  function subscribeToConversation(me, partner, onMsg) {
    const seen = new Set();
    const id = setInterval(async () => {
      const msgs = await getConversation(me, partner);
      msgs.forEach(msg => { if (!seen.has(msg.id)) { seen.add(msg.id); onMsg(msg); } });
    }, 800);
    return () => clearInterval(id);
  }

  /* ══════════════════════════════════════════════════════════
     EXPORT / IMPORT — cross-device sync via file
     Export: saves encoded .ipm file (download it, AirDrop it, etc.)
     Import: merges another device's .ipm into local storage
  ══════════════════════════════════════════════════════════ */
  function exportMessages() {
    const db = _db();
    const payload = encode(JSON.stringify({ v: 2, db, exported: Date.now() }));
    const blob = new Blob([payload], { type: 'text/plain' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `ipocket_msgs_${Date.now()}.ipm`;
    a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 1000);
  }

  async function importMessages(file) {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const raw = decode(e.target.result.trim());
          if (!raw) { resolve({ ok: false, error: 'Invalid file' }); return; }
          const parsed = JSON.parse(raw);
          if (!parsed?.db?.conversations) { resolve({ ok: false, error: 'Bad file format' }); return; }

          const local  = _db();
          // Merge: union messages, dedup by id
          for (const [key, msgs] of Object.entries(parsed.db.conversations)) {
            if (!local.conversations[key]) {
              local.conversations[key] = msgs;
            } else {
              const ids = new Set(local.conversations[key].map(m => m.id));
              msgs.forEach(m => { if (!ids.has(m.id)) local.conversations[key].push(m); });
              local.conversations[key].sort((a, b) => a.ts - b.ts);
            }
          }
          _save(local);
          resolve({ ok: true, imported: Object.values(parsed.db.conversations).flat().length });
        } catch (err) {
          resolve({ ok: false, error: 'Failed to read file: ' + err.message });
        }
      };
      reader.onerror = () => resolve({ ok: false, error: 'File read error' });
      reader.readAsText(file);
    });
  }

  /* ══════════════════════════════════════════════════════════
     SIMULATOR — built-in test conversation with fake "device"
     Shows real delivery flow: saved→confirmed, then "read" after delay
  ══════════════════════════════════════════════════════════ */
  const SIM_PARTNER = 'simulator-bot';
  const _simReplies = [
    "Hey! Got your message 👋","That's interesting, tell me more.",
    "lol yeah same honestly","Wait really?? No way","ok ok ok I hear you",
    "bro I was JUST thinking about that","haha yeah for sure",
    "Nah I don't think so tbh","omg same 💀","...","k","YES exactly!!",
    "That's wild when you think about it","ok so basically... idk actually",
    "fr fr 💯","👀","makes sense","lmaooo no way","not me doing the same thing",
    "wait say that again","hold on brb","ok back, what were you saying?",
  ];

  async function simReply(me) {
    // Simulate the other "device" reading and replying
    // 1. Mark all sent messages as read (simulating other device saw them)
    const db   = _db();
    const key  = _ck(me, SIM_PARTNER);
    const msgs = db.conversations[key] || [];
    msgs.forEach(m => { if (m.from_user === me) m.read = true; });
    db.conversations[key] = msgs;
    _save(db);

    // 2. Reply after realistic delay
    const delay = 900 + Math.random() * 2200;
    await new Promise(r => setTimeout(r, delay));

    const reply = _simReplies[Math.floor(Math.random() * _simReplies.length)];
    await sendMessage(SIM_PARTNER, me, reply);
  }

  /* ══════════════════════════════════════════════════════════
     UTILS
  ══════════════════════════════════════════════════════════ */
  function formatTime(ts) {
    const d = new Date(ts), now = new Date();
    const diff = Math.floor((now - d) / 86400000);
    if (diff === 0) return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    if (diff === 1) return 'Yesterday';
    if (diff < 7)  return d.toLocaleDateString([], { weekday: 'short' });
    return d.toLocaleDateString([], { month: 'short', day: 'numeric' });
  }

  // Compat stubs for old code that calls these
  function setUsername() {}
  function isReceiving() { return true; }
  async function checkUser() { return { exists: true }; }
  async function checkServer() { return true; }
  function isServerAvailable() { return true; }
  async function getContacts() { return []; }
  async function saveContact() { return { ok: true }; }
  async function deleteContact() { return { ok: true }; }

  return {
    // Auth
    getUsername, hasAccount, register, login, logout, changePassword, deleteAccount,
    // Messages
    connect, disconnect, onNewMessage, subscribeToConversation,
    sendMessage, getConversation, getConversations, markAsRead, getReadStatus,
    // Export/Import
    exportMessages, importMessages,
    // Simulator
    SIM_PARTNER, simReply,
    // Utils
    formatTime,
    // Compat
    setUsername, isReceiving, checkUser, checkServer, isServerAvailable,
    getContacts, saveContact, deleteContact,
  };
})();
