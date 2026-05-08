#!/usr/bin/env python3
"""iPOCKET v8 — Flask + SocketIO backend with SQLite messaging"""

import os
import time
import sqlite3
import threading
from flask import Flask, send_from_directory, request, jsonify
from flask_socketio import SocketIO, join_room
from flask_cors import CORS

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DB_PATH  = os.path.join(BASE_DIR, 'messages.db')

app = Flask(__name__, static_folder=BASE_DIR, static_url_path='')
app.config['SECRET_KEY'] = 'ipocket-secret-key-v8'
CORS(app)
socketio = SocketIO(app, cors_allowed_origins='*', async_mode='threading')

_db_local = threading.local()

def get_db():
    if not getattr(_db_local, 'conn', None):
        conn = sqlite3.connect(DB_PATH, check_same_thread=False)
        conn.row_factory = sqlite3.Row
        _db_local.conn = conn
    return _db_local.conn

def init_db():
    conn = sqlite3.connect(DB_PATH)
    conn.executescript('''
        CREATE TABLE IF NOT EXISTS users (
            username TEXT PRIMARY KEY,
            created_at INTEGER NOT NULL
        );
        CREATE TABLE IF NOT EXISTS messages (
            id        INTEGER PRIMARY KEY AUTOINCREMENT,
            from_user TEXT NOT NULL,
            to_user   TEXT NOT NULL,
            text      TEXT NOT NULL,
            ts        INTEGER NOT NULL,
            read      INTEGER DEFAULT 0
        );
        CREATE TABLE IF NOT EXISTS contacts (
            id           INTEGER PRIMARY KEY AUTOINCREMENT,
            owner        TEXT NOT NULL,
            username     TEXT NOT NULL,
            display_name TEXT,
            UNIQUE(owner, username)
        );
        CREATE INDEX IF NOT EXISTS idx_msg_to   ON messages(to_user, ts);
        CREATE INDEX IF NOT EXISTS idx_msg_pair ON messages(from_user, to_user, ts);
    ''')
    conn.commit()
    conn.close()

# ── Static files ──────────────────────────────────────────────────────────────

@app.route('/')
def index():
    return send_from_directory(BASE_DIR, 'index.html')

@app.route('/<path:path>')
def static_files(path):
    return send_from_directory(BASE_DIR, path)

# ── Username API ──────────────────────────────────────────────────────────────

@app.route('/api/username/register', methods=['POST'])
def register_username():
    data     = request.json or {}
    username = (data.get('username') or '').strip().lower()
    if not username or len(username) < 2 or len(username) > 24:
        return jsonify({'ok': False, 'error': 'Username must be 2–24 characters'}), 400
    if not all(c.isalnum() or c in '-_' for c in username):
        return jsonify({'ok': False, 'error': 'Letters, numbers, - and _ only'}), 400
    db = get_db()
    try:
        db.execute('INSERT INTO users(username,created_at) VALUES(?,?)',
                   (username, int(time.time() * 1000)))
        db.commit()
        return jsonify({'ok': True, 'username': username})
    except sqlite3.IntegrityError:
        return jsonify({'ok': False, 'error': 'Username already taken'}), 409

@app.route('/api/username/check/<username>')
def check_username(username):
    username = username.strip().lower()
    db  = get_db()
    row = db.execute('SELECT 1 FROM users WHERE username=?', (username,)).fetchone()
    return jsonify({'exists': bool(row)})

# ── Messages API ──────────────────────────────────────────────────────────────

@app.route('/api/messages/<me>/<other>')
def get_conversation(me, other):
    me    = me.strip().lower()
    other = other.strip().lower()
    db    = get_db()
    rows  = db.execute(
        '''SELECT id, from_user, to_user, text, ts FROM messages
           WHERE (from_user=? AND to_user=?) OR (from_user=? AND to_user=?)
           ORDER BY ts ASC LIMIT 200''',
        (me, other, other, me)
    ).fetchall()
    db.execute('UPDATE messages SET read=1 WHERE to_user=? AND from_user=?', (me, other))
    db.commit()
    return jsonify([dict(r) for r in rows])

@app.route('/api/messages/send', methods=['POST'])
def send_message():
    data      = request.json or {}
    from_user = (data.get('from_user') or '').strip().lower()
    to_user   = (data.get('to_user')   or '').strip().lower()
    text      = (data.get('text')      or '').strip()
    if not from_user or not to_user or not text:
        return jsonify({'ok': False, 'error': 'Missing fields'}), 400
    if len(text) > 2000:
        return jsonify({'ok': False, 'error': 'Message too long'}), 400
    db  = get_db()
    row = db.execute('SELECT 1 FROM users WHERE username=?', (to_user,)).fetchone()
    if not row:
        return jsonify({'ok': False, 'error': 'User not found — they must register first'}), 404
    ts  = int(time.time() * 1000)
    cur = db.execute(
        'INSERT INTO messages(from_user,to_user,text,ts) VALUES(?,?,?,?)',
        (from_user, to_user, text, ts)
    )
    db.commit()
    msg = {'id': cur.lastrowid, 'from_user': from_user,
           'to_user': to_user, 'text': text, 'ts': ts}
    socketio.emit('new_message', msg, room=to_user)
    socketio.emit('new_message', msg, room=from_user)
    return jsonify({'ok': True, 'message': msg})

@app.route('/api/messages/conversations/<username>')
def get_conversations(username):
    username = username.strip().lower()
    db = get_db()
    rows = db.execute(
        '''SELECT
               CASE WHEN from_user=? THEN to_user ELSE from_user END AS partner,
               text, ts,
               SUM(CASE WHEN to_user=? AND read=0 THEN 1 ELSE 0 END) AS unread
           FROM messages
           WHERE from_user=? OR to_user=?
           GROUP BY partner
           ORDER BY ts DESC''',
        (username, username, username, username)
    ).fetchall()
    return jsonify([dict(r) for r in rows])

# ── Contacts API ──────────────────────────────────────────────────────────────

@app.route('/api/contacts/<owner>')
def get_contacts(owner):
    owner = owner.strip().lower()
    db    = get_db()
    rows  = db.execute(
        'SELECT username, display_name FROM contacts WHERE owner=? ORDER BY display_name, username',
        (owner,)
    ).fetchall()
    return jsonify([dict(r) for r in rows])

@app.route('/api/contacts/save', methods=['POST'])
def save_contact():
    data         = request.json or {}
    owner        = (data.get('owner')        or '').strip().lower()
    username     = (data.get('username')     or '').strip().lower()
    display_name = (data.get('display_name') or '').strip()
    if not owner or not username:
        return jsonify({'ok': False, 'error': 'Missing fields'}), 400
    db  = get_db()
    row = db.execute('SELECT 1 FROM users WHERE username=?', (username,)).fetchone()
    if not row:
        return jsonify({'ok': False, 'error': 'User not found — they must register first'}), 404
    db.execute(
        'INSERT OR REPLACE INTO contacts(owner,username,display_name) VALUES(?,?,?)',
        (owner, username, display_name or username)
    )
    db.commit()
    return jsonify({'ok': True})

@app.route('/api/contacts/delete', methods=['POST'])
def delete_contact():
    data     = request.json or {}
    owner    = (data.get('owner')    or '').strip().lower()
    username = (data.get('username') or '').strip().lower()
    db       = get_db()
    db.execute('DELETE FROM contacts WHERE owner=? AND username=?', (owner, username))
    db.commit()
    return jsonify({'ok': True})

# ── WebSocket ─────────────────────────────────────────────────────────────────

@socketio.on('connect')
def on_connect():
    pass

@socketio.on('join')
def on_join(data):
    username = (data.get('username') or '').strip().lower()
    if username:
        join_room(username)

@socketio.on('disconnect')
def on_disconnect():
    pass

if __name__ == '__main__':
    init_db()
    socketio.run(app, host='0.0.0.0', port=5000, debug=False, allow_unsafe_werkzeug=True)
