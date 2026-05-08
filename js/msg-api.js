/**
 * msg-api.js — iPOCKET Messaging Client API
 * Provides: window.MSG
 */
'use strict';

window.MSG = (function () {
  let _socket   = null;
  let _callbacks = [];
  let _connected = false;

  function getUsername() {
    return localStorage.getItem('ipocket_username') || null;
  }
  function setUsername(u) {
    localStorage.setItem('ipocket_username', u.trim().toLowerCase());
  }
  function isReceiving() {
    return localStorage.getItem('ipocket_receive_messages') !== '0';
  }

  function connect() {
    const username = getUsername();
    if (!username || !isReceiving()) return;
    if (_socket && _connected) return;
    if (!window.io) return;
    _socket = io({ transports: ['websocket', 'polling'] });
    _socket.on('connect', () => {
      _connected = true;
      _socket.emit('join', { username });
    });
    _socket.on('disconnect', () => { _connected = false; });
    _socket.on('new_message', (msg) => {
      _callbacks.forEach(cb => { try { cb(msg); } catch (e) {} });
    });
  }
  function disconnect() {
    if (_socket) { _socket.disconnect(); _socket = null; _connected = false; }
  }
  function onNewMessage(cb) {
    _callbacks.push(cb);
    return function unsubscribe() {
      _callbacks = _callbacks.filter(c => c !== cb);
    };
  }

  async function register(username) {
    const r = await fetch('/api/username/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username })
    });
    return r.json();
  }
  async function checkUser(username) {
    const r = await fetch('/api/username/check/' + encodeURIComponent(username));
    return r.json();
  }
  async function getConversation(me, other) {
    const r = await fetch('/api/messages/' + encodeURIComponent(me) + '/' + encodeURIComponent(other));
    return r.json();
  }
  async function sendMessage(from_user, to_user, text) {
    const r = await fetch('/api/messages/send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ from_user, to_user, text })
    });
    return r.json();
  }
  async function getConversations(username) {
    const r = await fetch('/api/messages/conversations/' + encodeURIComponent(username));
    return r.json();
  }
  async function getContacts(owner) {
    const r = await fetch('/api/contacts/' + encodeURIComponent(owner));
    return r.json();
  }
  async function saveContact(owner, username, display_name) {
    const r = await fetch('/api/contacts/save', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ owner, username, display_name })
    });
    return r.json();
  }
  async function deleteContact(owner, username) {
    const r = await fetch('/api/contacts/delete', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ owner, username })
    });
    return r.json();
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

  // Auto-connect after boot completes
  document.addEventListener('DOMContentLoaded', () => { setTimeout(connect, 1200); });

  return {
    getUsername, setUsername, isReceiving, connect, disconnect,
    onNewMessage, register, checkUser,
    getConversation, sendMessage, getConversations,
    getContacts, saveContact, deleteContact, formatTime
  };
})();
