/* ════════════ CONTACTS — Retro Win98 Theme ════════════ */
'use strict';

function initContacts98() {
  const c = window.content;
  c.style.cssText = 'width:100%;height:100%;display:flex;flex-direction:column;overflow:hidden;';

  if (!MSG.getUsername()) {
    const notice = document.createElement('div');
    notice.style.cssText = 'flex:1;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:14px;padding:24px;background:var(--win-chrome);';
    notice.innerHTML = `
      <div style="font-size:2.5rem;">👤</div>
      <div style="font-family:var(--pixel-font);font-size:1rem;color:var(--win-text);text-align:center;font-weight:bold;">Set up Messages first!</div>
      <div style="font-family:var(--pixel-font);font-size:.82rem;color:var(--win-text-dim);text-align:center;">Open Messages and pick a username before using Contacts.</div>
      <button class="btn98 primary" id="contacts-goto-msg" style="padding:8px 20px;">Open Messages</button>
    `;
    c.appendChild(notice);
    document.getElementById('contacts-goto-msg').addEventListener('click', () => {
      OS.openApp('messages');
    });
    return;
  }

  const me = MSG.getUsername();

  // Menubar
  const menu = document.createElement('div');
  menu.className = 'win-menubar';
  menu.innerHTML = '<div class="win-menu-item">File</div><div class="win-menu-item">Edit</div><div class="win-menu-item">Help</div>';
  c.appendChild(menu);

  const body = document.createElement('div');
  body.style.cssText = 'flex:1;overflow:hidden;display:flex;flex-direction:column;background:var(--win-chrome);';
  c.appendChild(body);

  // Add contact row
  const addRow = document.createElement('div');
  addRow.style.cssText = 'flex-shrink:0;display:flex;gap:6px;padding:6px 8px;border-bottom:2px solid var(--win-chrome-dark);';
  addRow.innerHTML = `
    <input id="ct-new-inp" type="text" maxlength="24" placeholder="Username to add…"
      style="flex:1;padding:4px 8px;font-family:var(--pixel-font);font-size:.88rem;background:#fff;border:2px solid;border-color:var(--win-chrome-dark) var(--win-chrome-light) var(--win-chrome-light) var(--win-chrome-dark);color:var(--win-text);outline:none;">
    <button id="ct-add-btn" class="btn98">Add</button>
  `;
  body.appendChild(addRow);

  const errLine = document.createElement('div');
  errLine.style.cssText = 'flex-shrink:0;padding:3px 10px;font-family:var(--pixel-font);font-size:.78rem;color:#cc0000;min-height:1.3em;';
  body.appendChild(errLine);

  const scroll = document.createElement('div');
  scroll.style.cssText = 'flex:1;overflow-y:auto;-webkit-overflow-scrolling:touch;';
  body.appendChild(scroll);

  const sb = document.createElement('div');
  sb.className = 'win-statusbar';
  sb.innerHTML = `<div class="win-status-pane">@${me}</div><div class="win-status-pane">Contacts</div>`;
  c.appendChild(sb);

  async function loadContacts() {
    scroll.innerHTML = '<div style="padding:12px;font-family:var(--pixel-font);font-size:.88rem;color:var(--win-text-dim);">Loading…</div>';
    let contacts = [];
    try { contacts = await MSG.getContacts(me); } catch(e) {}
    scroll.innerHTML = '';
    if (!contacts.length) {
      scroll.innerHTML = '<div style="padding:20px;font-family:var(--pixel-font);font-size:.85rem;color:var(--win-text-dim);text-align:center;">No contacts yet.<br>Add a username above!</div>';
      return;
    }
    contacts.forEach(ct => {
      const row = document.createElement('div');
      row.style.cssText = 'display:flex;align-items:center;gap:8px;padding:8px 10px;border-bottom:1px solid var(--win-chrome-dark);';
      row.innerHTML = `
        <div style="font-size:1.4rem;flex-shrink:0;">👤</div>
        <div style="flex:1;min-width:0;">
          <div style="font-family:var(--pixel-font);font-size:.95rem;color:var(--win-text);font-weight:bold;">${ct.display_name || ct.username}</div>
          <div style="font-family:var(--pixel-font);font-size:.78rem;color:var(--win-text-dim);">@${ct.username}</div>
        </div>
        <button class="btn98" style="padding:3px 8px;font-size:.8rem;flex-shrink:0;" data-msg="${ct.username}">💬</button>
        <button class="btn98" style="padding:3px 8px;font-size:.8rem;flex-shrink:0;" data-del="${ct.username}">🗑</button>
      `;
      row.querySelector('[data-msg]').addEventListener('click', () => {
        localStorage.setItem('ipocket_msg_open_with', ct.username);
        OS.openApp('messages');
      });
      row.querySelector('[data-del]').addEventListener('click', async () => {
        haptic('medium');
        await MSG.deleteContact(me, ct.username);
        loadContacts();
      });
      scroll.appendChild(row);
    });
  }

  async function addContact() {
    const username = document.getElementById('ct-new-inp').value.trim().toLowerCase();
    if (!username) { errLine.textContent = 'Enter a username.'; return; }
    errLine.textContent = '';
    document.getElementById('ct-add-btn').disabled = true;
    try {
      const res = await MSG.saveContact(me, username, username);
      if (res.ok) {
        document.getElementById('ct-new-inp').value = '';
        showToast98('👤 Contacts', `@${username} added!`);
        loadContacts();
      } else {
        errLine.textContent = res.error || 'Error adding contact.';
      }
    } catch(e) { errLine.textContent = 'Network error.'; }
    document.getElementById('ct-add-btn').disabled = false;
  }

  document.getElementById('ct-add-btn').addEventListener('click', addContact);
  document.getElementById('ct-new-inp').addEventListener('keydown', e => { if (e.key === 'Enter') addContact(); });

  loadContacts();
}
