/**
 * msg-api.js — iPOCKET Messaging — SERVERLESS EDITION
 * Storage: localStorage (always) + GitHub Gist (optional sync)
 * Encoding: XOR cipher + base64 so raw data is not human-readable
 * Auth: username + SHA-256 hashed password stored locally
 * Cross-device: user connects their own GitHub Gist token once
 */
'use strict';

window.MSG = (function () {

  /* ════════════════════════════════════════════════════════
     CIPHER — XOR with a rolling key derived from a seed
  ════════════════════════════════════════════════════════ */
  const CIPHER_SEED = 'iPOCKET_MSG_v1_xK9#mP2$nQ7@wR4!';

  function _makeKey(len) {
    const out = [];
    let h = 0;
    for (let i = 0; i < len; i++) {
      h = (h * 31 + CIPHER_SEED.charCodeAt(i % CIPHER_SEED.length)) >>> 0;
      out.push(h & 0xFF);
    }
    return out;
  }

  function encode(str) {
    const bytes = new TextEncoder().encode(str);
    const key   = _makeKey(bytes.length);
    const xored = bytes.map((b, i) => b ^ key[i]);
    return btoa(String.fromCharCode(...xored));
  }

  function decode(b64) {
    try {
      const raw   = atob(b64);
      const bytes = Uint8Array.from(raw, c => c.charCodeAt(0));
      const key   = _makeKey(bytes.length);
      const plain = bytes.map((b, i) => b ^ key[i]);
      return new TextDecoder().decode(plain);
    } catch (e) { return null; }
  }

  /* ════════════════════════════════════════════════════════
     HASHING — simple SHA-256 via SubtleCrypto
  ════════════════════════════════════════════════════════ */
  async function sha256(str) {
    const buf  = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(str));
    return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2,'0')).join('');
  }

  /* ════════════════════════════════════════════════════════
     LOCAL STORAGE KEYS
  ════════════════════════════════════════════════════════ */
  const LS = {
    ACCOUNT:   'ipm_account',      // {username, passHash}
    MESSAGES:  'ipm_messages',     // encoded JSON blob
    GIST_CFG:  'ipm_gist_cfg',     // {token, gistId}
    INBOX_VER: 'ipm_inbox_ver',    // last known gist version
  };

  /* ════════════════════════════════════════════════════════
     ACCOUNT
  ════════════════════════════════════════════════════════ */
  function _getAccount() {
    const raw = localStorage.getItem(LS.ACCOUNT);
    if (!raw) return null;
    try { return JSON.parse(decode(raw)); } catch { return null; }
  }
  function _saveAccount(obj) {
    localStorage.setItem(LS.ACCOUNT, encode(JSON.stringify(obj)));
  }

  function getUsername()       { return _getAccount()?.username || null; }
  function setUsername(u)      { /* handled inside register/login */ }
  function isReceiving()       { return true; }

  async function register(username, password) {
    username = username.trim().toLowerCase();
    if (!username || !/^[a-z0-9_-]{2,24}$/.test(username))
      return { ok: false, error: 'Invalid username (2-24 chars, letters/numbers/-/_)' };
    if (!password || password.length < 4)
      return { ok: false, error: 'Password must be at least 4 characters' };

    // Check if account already exists
    const existing = _getAccount();
    if (existing && existing.username === username)
      return { ok: false, error: 'Username already registered on this device' };

    const passHash = await sha256(password + username + CIPHER_SEED);
    _saveAccount({ username, passHash });
    return { ok: true, username };
  }

  async function login(username, password) {
    username = username.trim().toLowerCase();
    const acc = _getAccount();
    if (!acc) return { ok: false, error: 'No account found. Register first.' };
    if (acc.username !== username) return { ok: false, error: 'Wrong username.' };
    const passHash = await sha256(password + username + CIPHER_SEED);
    if (acc.passHash !== passHash) return { ok: false, error: 'Wrong password.' };
    return { ok: true, username };
  }

  function logout() {
    // Keep account but clear session flag if needed
  }

  function changePassword(newPassword) {
    const acc = _getAccount();
    if (!acc) return { ok: false };
    sha256(newPassword + acc.username + CIPHER_SEED).then(h => {
      acc.passHash = h;
      _saveAccount(acc);
    });
    return { ok: true };
  }

  /* ════════════════════════════════════════════════════════
     MESSAGE STORE — all messages in one encoded localStorage blob
     Structure: { conversations: { "userA__userB": [msgObj, ...] } }
     Key is always sorted(from,to).join('__') so both sides share same key
  ════════════════════════════════════════════════════════ */
  function _convKey(a, b) {
    return [a, b].sort().join('__');
  }

  function _loadDB() {
    const raw = localStorage.getItem(LS.MESSAGES);
    if (!raw) return { conversations: {}, users: {} };
    try {
      const dec = decode(raw);
      return JSON.parse(dec) || { conversations: {}, users: {} };
    } catch { return { conversations: {}, users: {} }; }
  }

  function _saveDB(db) {
    localStorage.setItem(LS.MESSAGES, encode(JSON.stringify(db)));
    // If gist sync configured, push in background
    _gistPush(db).catch(() => {});
  }

  function _mergeDB(localDB, remoteDB) {
    // Merge conversations — union of all messages, deduped by id
    const merged = { conversations: { ...localDB.conversations }, users: { ...localDB.users, ...remoteDB.users } };
    for (const key of Object.keys(remoteDB.conversations || {})) {
      if (!merged.conversations[key]) {
        merged.conversations[key] = remoteDB.conversations[key];
      } else {
        const seen = new Set(merged.conversations[key].map(m => m.id));
        for (const msg of remoteDB.conversations[key]) {
          if (!seen.has(msg.id)) { merged.conversations[key].push(msg); seen.add(msg.id); }
        }
        merged.conversations[key].sort((a, b) => a.ts - b.ts);
      }
    }
    return merged;
  }

  /* ════════════════════════════════════════════════════════
     GITHUB GIST SYNC (optional)
  ════════════════════════════════════════════════════════ */
  function getGistConfig()   { try { return JSON.parse(localStorage.getItem(LS.GIST_CFG) || 'null'); } catch { return null; } }
  function setGistConfig(cfg){ localStorage.setItem(LS.GIST_CFG, JSON.stringify(cfg)); }
  function clearGistConfig() { localStorage.removeItem(LS.GIST_CFG); localStorage.removeItem(LS.INBOX_VER); }

  async function _gistPush(db) {
    const cfg = getGistConfig();
    if (!cfg?.token) return;
    const content = encode(JSON.stringify(db));
    const url = cfg.gistId
      ? `https://api.github.com/gists/${cfg.gistId}`
      : 'https://api.github.com/gists';
    const method = cfg.gistId ? 'PATCH' : 'POST';
    const body = JSON.stringify({
      description: 'iPOCKET Messages DB',
      public: false,
      files: { 'ipocket_msgs.dat': { content } }
    });
    const res = await fetch(url, {
      method, headers: { Authorization: `token ${cfg.token}`, 'Content-Type': 'application/json' }, body
    });
    if (res.ok) {
      const data = await res.json();
      if (!cfg.gistId) { cfg.gistId = data.id; setGistConfig(cfg); }
      localStorage.setItem(LS.INBOX_VER, data.updated_at || '');
    }
  }

  async function gistPull() {
    const cfg = getGistConfig();
    if (!cfg?.token || !cfg?.gistId) return null;
    try {
      const res = await fetch(`https://api.github.com/gists/${cfg.gistId}`, {
        headers: { Authorization: `token ${cfg.token}` }
      });
      if (!res.ok) return null;
      const data = await res.json();
      const raw  = data.files?.['ipocket_msgs.dat']?.content;
      if (!raw) return null;
      const dec = decode(raw);
      return JSON.parse(dec);
    } catch { return null; }
  }

  async function syncGist() {
    const remote = await gistPull();
    if (!remote) return { ok: false, error: 'Could not fetch gist' };
    const local  = _loadDB();
    const merged = _mergeDB(local, remote);
    localStorage.setItem(LS.MESSAGES, encode(JSON.stringify(merged)));
    await _gistPush(merged);
    return { ok: true };
  }

  /* ════════════════════════════════════════════════════════
     MESSAGES API
  ════════════════════════════════════════════════════════ */
  function _genId() {
    return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
  }

  async function sendMessage(from_user, to_user, text) {
    const db  = _loadDB();
    const key = _convKey(from_user, to_user);
    if (!db.conversations[key]) db.conversations[key] = [];

    // Register known users
    db.users = db.users || {};
    db.users[from_user] = Date.now();
    db.users[to_user]   = db.users[to_user] || null;

    const msg = { id: _genId(), from_user, to_user, text, ts: Date.now(), read: false };
    db.conversations[key].push(msg);
    _saveDB(db);

    _callbacks.forEach(cb => { try { cb(msg); } catch {} });
    return { ok: true, message: msg };
  }

  async function getConversation(me, other) {
    const db  = _loadDB();
    const key = _convKey(me, other);
    const msgs = db.conversations[key] || [];
    // Mark received as read
    let changed = false;
    msgs.forEach(m => { if (m.to_user === me && !m.read) { m.read = true; changed = true; } });
    if (changed) _saveDB(db);
    return msgs;
  }

  async function getConversations(username) {
    const db = _loadDB();
    const result = [];
    for (const [key, msgs] of Object.entries(db.conversations || {})) {
      if (!msgs.length) continue;
      const parts = key.split('__');
      if (!parts.includes(username)) continue;
      const partner = parts.find(p => p !== username) || parts[0];
      const last    = msgs[msgs.length - 1];
      const unread  = msgs.filter(m => m.to_user === username && !m.read).length;
      result.push({ partner, text: last.text, ts: last.ts, unread });
    }
    return result.sort((a, b) => b.ts - a.ts);
  }

  async function markAsRead(me, partner, messageId) {
    const db  = _loadDB();
    const key = _convKey(me, partner);
    const msg = (db.conversations[key] || []).find(m => m.id === messageId);
    if (msg) { msg.read = true; _saveDB(db); }
  }

  async function getReadStatus(me, partner, messageId) {
    const db  = _loadDB();
    const key = _convKey(me, partner);
    const msg = (db.conversations[key] || []).find(m => m.id === messageId);
    return { read: msg?.read || false };
  }

  /* ════════════════════════════════════════════════════════
     REAL-TIME — poll localStorage for new messages from other tabs
     + pull from gist periodically if configured
  ════════════════════════════════════════════════════════ */
  let _callbacks = [];
  let _pollId    = null;
  let _lastMsgTs = 0;

  function connect() {
    const me = getUsername();
    if (!me || _pollId) return;
    // Poll every 1.5s for new incoming messages
    _pollId = setInterval(async () => {
      // Try gist sync every ~30s
      if (getGistConfig()?.token) {
        const now = Date.now();
        if (!_lastGistSync || now - _lastGistSync > 30000) {
          _lastGistSync = now;
          await syncGist();
        }
      }
      const db = _loadDB();
      for (const msgs of Object.values(db.conversations || {})) {
        for (const msg of msgs) {
          if (msg.to_user === me && msg.ts > _lastMsgTs && !_inboxSeen.has(msg.id)) {
            _inboxSeen.add(msg.id);
            _lastMsgTs = msg.ts;
            _callbacks.forEach(cb => { try { cb(msg); } catch {} });
          }
        }
      }
    }, 1500);
  }

  let _lastGistSync = 0;
  const _inboxSeen  = new Set();

  function disconnect() {
    if (_pollId) { clearInterval(_pollId); _pollId = null; }
  }

  function onNewMessage(cb) {
    _callbacks.push(cb);
    return () => { _callbacks = _callbacks.filter(c => c !== cb); };
  }

  function subscribeToConversation(me, partner, onMsg) {
    const seen = new Set();
    const id = setInterval(async () => {
      const msgs = await getConversation(me, partner);
      msgs.forEach(msg => {
        if (!seen.has(msg.id)) { seen.add(msg.id); onMsg(msg); }
      });
    }, 800);
    return () => clearInterval(id);
  }

  /* ════════════════════════════════════════════════════════
     MISC
  ════════════════════════════════════════════════════════ */
  function formatTime(ts) {
    const d = new Date(ts), now = new Date();
    const diff = Math.floor((now - d) / 86400000);
    if (diff === 0) return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    if (diff === 1) return 'Yesterday';
    if (diff < 7)  return d.toLocaleDateString([], { weekday: 'short' });
    return d.toLocaleDateString([], { month: 'short', day: 'numeric' });
  }

  // Compat stubs (no server needed)
  async function register_compat(username) {
    // Old single-arg register — auto-generate password from username for compat
    return await register(username, username + '_default');
  }
  async function checkUser(username) { return { exists: true }; }
  async function checkServer()       { return true; }
  function isServerAvailable()       { return true; }
  async function getContacts(owner)  { return []; }
  async function saveContact()       { return { ok: true }; }
  async function deleteContact()     { return { ok: true }; }

  document.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => { if (getUsername()) connect(); }, 300);
  });

  return {
    getUsername, setUsername, isReceiving,
    register, register_compat, login, logout, changePassword,
    connect, disconnect, onNewMessage,
    sendMessage, getConversation, getConversations,
    markAsRead, getReadStatus, subscribeToConversation,
    formatTime, checkUser, checkServer, isServerAvailable,
    getContacts, saveContact, deleteContact,
    // Gist sync
    getGistConfig, setGistConfig, clearGistConfig, syncGist,
    // Expose encode/decode for debugging
    _encode: encode, _decode: decode,
  };
})();
