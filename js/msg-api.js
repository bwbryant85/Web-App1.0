/**
 * msg-api.js — iPOCKET Messaging v4
 *
 * FIXES:
 *  - Multiple accounts per device (keyed by username, not one-per-device)
 *  - Session stored in localStorage NOT sessionStorage — survives PWA/browser switch
 *  - Account accessible from both browser tab and PWA homescreen install
 *
 * CROSS-DEVICE: GitHub Gist shared message bus
 *  - Each user needs: a GitHub token (gist scope) + the shared Gist ID
 *  - Messages written to Gist on send, polled every 8s when app is open
 *  - Account profile (hashed password) stored in Gist → login works on any device
 *
 * LOCAL-ONLY: works fully offline if no Gist configured
 */
'use strict';

window.MSG = (() => {

  /* ── CIPHER ── */
  const _SEED = 'iPK_v4_xX9#mQ3$nR7@wS5!tV1^kW8&zY2*';
  function _key(len) {
    const k = new Uint8Array(len); let h = 0x811c9dc5;
    for (let i = 0; i < len; i++) {
      h ^= _SEED.charCodeAt(i % _SEED.length);
      h = Math.imul(h, 0x01000193) >>> 0; k[i] = h & 0xFF;
    }
    return k;
  }
  function encode(str) {
    const b = new TextEncoder().encode(str), k = _key(b.length);
    return btoa(String.fromCharCode(...b.map((x,i) => x ^ k[i])));
  }
  function decode(b64) {
    try {
      const r = atob(b64), b = Uint8Array.from(r, c => c.charCodeAt(0)), k = _key(b.length);
      return new TextDecoder().decode(b.map((x,i) => x ^ k[i]));
    } catch { return null; }
  }

  /* ── SHA-256 ── */
  async function sha256(s) {
    const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(s));
    return [...new Uint8Array(buf)].map(b => b.toString(16).padStart(2,'0')).join('');
  }

  /* ── STORAGE KEYS ──
     Accounts: ipm_acct_<username>   → encoded {username, passHash, createdAt}
     Messages: ipm_msgs              → encoded DB {conversations:{}}
     Session:  ipm_session           → localStorage (NOT sessionStorage) so PWA+browser share it
     Gist:     ipm_gist              → {token, gistId}
  ── */
  const K = {
    acct:    u => `ipm_acct_${u}`,
    MSGS:    'ipm_msgs',
    SESSION: 'ipm_session',   // localStorage — shared between browser + PWA on same origin
    GIST:    'ipm_gist',
  };

  /* ── ACCOUNT ── */
  function _getAcct(username) {
    const r = localStorage.getItem(K.acct(username));
    if (!r) return null;
    try { return JSON.parse(decode(r)); } catch { return null; }
  }
  function _saveAcct(obj) {
    localStorage.setItem(K.acct(obj.username), encode(JSON.stringify(obj)));
  }

  /* Session stored in localStorage so both browser tab and PWA see the same logged-in state */
  function _getSession() {
    try { return JSON.parse(localStorage.getItem(K.SESSION) || 'null'); } catch { return null; }
  }
  function _setSession(u) { localStorage.setItem(K.SESSION, JSON.stringify({ username: u, ts: Date.now() })); }
  function _clearSession() { localStorage.removeItem(K.SESSION); }

  function getUsername() { return _getSession()?.username || null; }

  /* hasAccount now checks for a specific username, not "any account" */
  function hasAccount(username) {
    if (username) return !!localStorage.getItem(K.acct(username.trim().toLowerCase()));
    // No username given — check if any account exists (for showing login vs register UI)
    return !!Object.keys(localStorage).some(k => k.startsWith('ipm_acct_'));
  }

  async function register(username, password) {
    username = username.trim().toLowerCase();
    if (!username || !/^[a-z0-9_-]{2,24}$/.test(username))
      return { ok: false, error: 'Username: 2–24 chars, a-z / 0-9 / – / _' };
    if (!password || password.length < 4)
      return { ok: false, error: 'Password must be at least 4 characters' };
    if (_getAcct(username))
      return { ok: false, error: `@${username} already exists on this device. Sign in instead.` };
    const passHash = await sha256(password + username + _SEED);
    _saveAcct({ username, passHash, createdAt: Date.now() });
    _setSession(username);
    // Push profile to Gist in background
    _gistPushProfile(username, passHash).catch(() => {});
    return { ok: true, username };
  }

  async function login(username, password) {
    username = username.trim().toLowerCase();
    const passHash = await sha256(password + username + _SEED);

    // Check local account first
    const local = _getAcct(username);
    if (local) {
      if (local.passHash !== passHash) return { ok: false, error: 'Wrong password.' };
      _setSession(username);
      _gistPull().catch(() => {});
      return { ok: true, username };
    }

    // Try pulling from Gist (account created on another device)
    const cfg = _getGistCfg();
    if (cfg?.token && cfg?.gistId) {
      const remote = await _gistFetch(true).catch(() => null);
      if (remote?.profiles?.[username]) {
        const profile = remote.profiles[username];
        if (profile.passHash !== passHash) return { ok: false, error: 'Wrong password.' };
        // Cache account locally
        _saveAcct({ username, passHash, createdAt: profile.createdAt || Date.now() });
        _setSession(username);
        // Merge messages
        if (remote.messages) {
          _saveDB_local(_mergeDB(_db(), remote.messages));
        }
        return { ok: true, username };
      }
      return { ok: false, error: 'Username not found. Register first, or check your Gist config.' };
    }

    return { ok: false, error: `No account found for @${username}. Register first.` };
  }

  function logout() { _clearSession(); }

  async function changePassword(newPassword) {
    const username = getUsername();
    const acct = username ? _getAcct(username) : null;
    if (!acct) return { ok: false, error: 'Not logged in' };
    if (newPassword.length < 4) return { ok: false, error: 'Password too short' };
    acct.passHash = await sha256(newPassword + acct.username + _SEED);
    _saveAcct(acct);
    await _gistPushProfile(acct.username, acct.passHash).catch(() => {});
    return { ok: true };
  }

  /* ── GIST CONFIG ── */
  function _getGistCfg() { try { return JSON.parse(localStorage.getItem(K.GIST) || 'null'); } catch { return null; } }
  function setGistConfig(cfg) { localStorage.setItem(K.GIST, JSON.stringify(cfg)); }
  function getGistConfig()    { return _getGistCfg(); }
  function clearGistConfig()  { localStorage.removeItem(K.GIST); }
  function isGistConfigured() { const c = _getGistCfg(); return !!(c?.token && c?.gistId); }

  /* ── GIST API ── */
  const GIST_FILE = 'ipocket_db.dat';
  let _gistCache = null, _lastFetch = 0;

  async function _gistFetch(force = false) {
    const cfg = _getGistCfg();
    if (!cfg?.token || !cfg?.gistId) return null;
    const now = Date.now();
    if (!force && _gistCache && now - _lastFetch < 8000) return _gistCache;
    try {
      const res = await fetch(`https://api.github.com/gists/${cfg.gistId}`, {
        headers: { Authorization: `token ${cfg.token}`, Accept: 'application/vnd.github.v3+json' },
        cache: 'no-store',
      });
      if (!res.ok) return null;
      const data = await res.json();
      const raw  = data.files?.[GIST_FILE]?.content;
      if (!raw) return null;
      const dec = decode(raw.trim());
      _gistCache = dec ? JSON.parse(dec) : null;
      _lastFetch = now;
      return _gistCache;
    } catch { return null; }
  }

  async function _gistWrite(db) {
    const cfg = _getGistCfg();
    if (!cfg?.token || !cfg?.gistId) return false;
    try {
      const res = await fetch(`https://api.github.com/gists/${cfg.gistId}`, {
        method: 'PATCH',
        headers: { Authorization: `token ${cfg.token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ files: { [GIST_FILE]: { content: encode(JSON.stringify(db)) } } }),
      });
      if (res.ok) { _gistCache = db; _lastFetch = Date.now(); }
      return res.ok;
    } catch { return false; }
  }

  async function _gistPushProfile(username, passHash) {
    if (!isGistConfigured()) return;
    const remote = await _gistFetch(true) || { profiles: {}, messages: { conversations: {} }, version: 0 };
    remote.profiles = remote.profiles || {};
    remote.profiles[username] = { passHash, createdAt: Date.now() };
    remote.version = (remote.version || 0) + 1;
    await _gistWrite(remote);
  }

  async function _gistPull() {
    const remote = await _gistFetch(true);
    if (!remote?.messages) return { ok: false };
    _saveDB_local(_mergeDB(_db(), remote.messages));
    return { ok: true };
  }

  async function _gistPushMessage(msg) {
    if (!isGistConfigured()) return;
    const remote = await _gistFetch(true) || { profiles: {}, messages: { conversations: {} }, version: 0 };
    remote.messages = remote.messages || { conversations: {} };
    const key = _ck(msg.from_user, msg.to_user);
    remote.messages.conversations[key] = remote.messages.conversations[key] || [];
    if (!remote.messages.conversations[key].find(m => m.id === msg.id))
      remote.messages.conversations[key].push(msg);
    remote.version = (remote.version || 0) + 1;
    await _gistWrite(remote);
  }

  async function syncNow() {
    const res = await _gistPull();
    return res;
  }

  /* ── LOCAL DB ── */
  function _ck(a, b) { return [a, b].sort().join('__'); }
  function _db() {
    const r = localStorage.getItem(K.MSGS);
    if (!r) return { conversations: {} };
    try { return JSON.parse(decode(r)) || { conversations: {} }; } catch { return { conversations: {} }; }
  }
  function _saveDB_local(db) { localStorage.setItem(K.MSGS, encode(JSON.stringify(db))); }
  function _mergeDB(localDB, remoteDB) {
    const out = { conversations: { ...localDB.conversations } };
    for (const [key, msgs] of Object.entries(remoteDB.conversations || {})) {
      if (!out.conversations[key]) { out.conversations[key] = msgs; }
      else {
        const seen = new Set(out.conversations[key].map(m => m.id));
        msgs.forEach(m => { if (!seen.has(m.id)) out.conversations[key].push(m); });
        out.conversations[key].sort((a, b) => a.ts - b.ts);
      }
    }
    return out;
  }
  function _genId() { return Date.now().toString(36) + Math.random().toString(36).slice(2, 8); }

  /* ── MESSAGES API ── */
  async function sendMessage(from_user, to_user, text) {
    const db  = _db(), key = _ck(from_user, to_user);
    if (!db.conversations[key]) db.conversations[key] = [];
    const msg = { id: _genId(), from_user, to_user, text: text.trim(), ts: Date.now(), read: false };
    db.conversations[key].push(msg);
    _saveDB_local(db);
    _notify(msg);
    _gistPushMessage(msg).catch(() => {});
    return { ok: true, message: msg };
  }

  async function getConversation(me, other) {
    const db = _db(), key = _ck(me, other);
    const msgs = (db.conversations[key] || []).slice();
    let dirty = false;
    msgs.forEach(m => { if (m.to_user === me && !m.read) { m.read = true; dirty = true; } });
    if (dirty) {
      const dbw = _db();
      (dbw.conversations[key] || []).forEach(m => { if (m.to_user === me) m.read = true; });
      _saveDB_local(dbw);
    }
    return msgs;
  }

  async function getConversations(username) {
    const db = _db(), out = [];
    for (const [key, msgs] of Object.entries(db.conversations)) {
      if (!msgs.length) continue;
      const parts = key.split('__');
      if (!parts.includes(username)) continue;
      const partner = parts.find(p => p !== username) || parts[0];
      const last = msgs[msgs.length - 1];
      const unread = msgs.filter(m => m.to_user === username && !m.read).length;
      out.push({ partner, text: last.text, ts: last.ts, unread });
    }
    return out.sort((a, b) => b.ts - a.ts);
  }

  async function markAsRead(me, partner, messageId) {
    const db = _db(), key = _ck(me, partner);
    let changed = false;
    (db.conversations[key] || []).forEach(m => { if (m.id === messageId && !m.read) { m.read = true; changed = true; } });
    if (changed) {
      _saveDB_local(db);
      if (isGistConfigured()) {
        _gistFetch(true).then(remote => {
          if (!remote) return;
          const m = (remote.messages?.conversations?.[key] || []).find(m => m.id === messageId);
          if (m && !m.read) { m.read = true; _gistWrite(remote); }
        }).catch(() => {});
      }
    }
  }

  async function getReadStatus(me, partner, messageId) {
    const msg = (_db().conversations[_ck(me, partner)] || []).find(m => m.id === messageId);
    return { read: !!msg?.read };
  }

  /* ── REAL-TIME ── */
  let _cbs = [], _pollId = null;
  const _seen = new Set();
  function _notify(msg) { _cbs.forEach(cb => { try { cb(msg); } catch {} }); }

  function connect() {
    if (_pollId) return;
    _pollId = setInterval(async () => {
      const me = getUsername(); if (!me) return;
      if (isGistConfigured()) await _gistPull().catch(() => {});
      const db = _db();
      for (const msgs of Object.values(db.conversations)) {
        for (const msg of msgs) {
          if (msg.to_user === me && !_seen.has(msg.id) && !msg.read) {
            _seen.add(msg.id); _notify(msg);
          }
        }
      }
    }, 8000);
  }
  function disconnect() { if (_pollId) { clearInterval(_pollId); _pollId = null; } }
  function onNewMessage(cb) { _cbs.push(cb); return () => { _cbs = _cbs.filter(c => c !== cb); }; }
  function subscribeToConversation(me, partner, onMsg) {
    const seen = new Set();
    const id = setInterval(async () => {
      const msgs = await getConversation(me, partner);
      msgs.forEach(msg => { if (!seen.has(msg.id)) { seen.add(msg.id); onMsg(msg); } });
    }, 800);
    return () => clearInterval(id);
  }

  /* ── SIMULATOR ── */
  const SIM_PARTNER = 'simulator-bot';
  const _simReplies = [
    "Hey! Got your message 👋","That's interesting, tell me more.","lol yeah same honestly",
    "Wait really?? No way","ok ok ok I hear you","bro I was JUST thinking about that",
    "haha yeah for sure","Nah I don't think so tbh","omg same 💀","...","k","YES exactly!!",
    "That's wild when you think about it","ok so basically... idk actually","fr fr 💯","👀",
    "makes sense","lmaooo","not me doing the same thing",
  ];
  async function simReply(me) {
    const db = _db(), key = _ck(me, SIM_PARTNER);
    (db.conversations[key] || []).forEach(m => { if (m.from_user === me) m.read = true; });
    _saveDB_local(db);
    await new Promise(r => setTimeout(r, 900 + Math.random() * 2000));
    await sendMessage(SIM_PARTNER, me, _simReplies[Math.floor(Math.random() * _simReplies.length)]);
  }

  /* ── EXPORT / IMPORT ── */
  function exportMessages() {
    const blob = new Blob([encode(JSON.stringify({ v: 4, db: _db(), exported: Date.now() }))], { type: 'text/plain' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob); a.download = `ipocket_msgs_${Date.now()}.ipm`; a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 1000);
  }
  async function importMessages(file) {
    return new Promise(resolve => {
      const reader = new FileReader();
      reader.onload = e => {
        try {
          const raw = decode(e.target.result.trim());
          if (!raw) { resolve({ ok: false, error: 'Invalid file' }); return; }
          const parsed = JSON.parse(raw);
          if (!parsed?.db?.conversations) { resolve({ ok: false, error: 'Bad format' }); return; }
          _saveDB_local(_mergeDB(_db(), parsed.db));
          resolve({ ok: true, imported: Object.values(parsed.db.conversations).flat().length });
        } catch (err) { resolve({ ok: false, error: err.message }); }
      };
      reader.onerror = () => resolve({ ok: false, error: 'Read error' });
      reader.readAsText(file);
    });
  }

  /* ── UTILS ── */
  function formatTime(ts) {
    const d = new Date(ts), now = new Date(), diff = Math.floor((now - d) / 86400000);
    if (diff === 0) return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    if (diff === 1) return 'Yesterday';
    if (diff < 7)  return d.toLocaleDateString([], { weekday: 'short' });
    return d.toLocaleDateString([], { month: 'short', day: 'numeric' });
  }

  // Compat stubs
  function setUsername() {} function isReceiving() { return true; }
  async function checkUser() { return { exists: true }; } async function checkServer() { return true; }
  function isServerAvailable() { return true; }
  async function getContacts() { return []; } async function saveContact() { return { ok: true }; }
  async function deleteContact() { return { ok: true }; }

  return {
    getUsername, hasAccount, register, login, logout, changePassword,
    connect, disconnect, onNewMessage, subscribeToConversation,
    sendMessage, getConversation, getConversations, markAsRead, getReadStatus,
    getGistConfig, setGistConfig, clearGistConfig, isGistConfigured, syncNow,
    exportMessages, importMessages,
    SIM_PARTNER, simReply, formatTime,
    setUsername, isReceiving, checkUser, checkServer, isServerAvailable,
    getContacts, saveContact, deleteContact,
  };
})();
