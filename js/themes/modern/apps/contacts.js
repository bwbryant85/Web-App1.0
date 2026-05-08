/* ════════════ CONTACTS — Modern Theme ════════════ */
'use strict';

function initContacts98() {
  const c = window.content;
  c.style.cssText = 'width:100%;height:100%;display:flex;flex-direction:column;overflow:hidden;background:rgba(248,249,252,.95);border-radius:28px;';

  const BLUE = '#0B84FF';

  if (!MSG.getUsername()) {
    const wrap = document.createElement('div');
    wrap.style.cssText = 'flex:1;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:20px;padding:32px;';
    wrap.innerHTML = `
      <div style="width:80px;height:80px;background:linear-gradient(135deg,#30b0c7,#0B84FF);border-radius:24px;display:flex;align-items:center;justify-content:center;font-size:2.5rem;">👤</div>
      <div style="font-family:'Inter',sans-serif;font-size:1.4rem;font-weight:700;color:#111;text-align:center;">Set up Messages first</div>
      <div style="font-family:'Inter',sans-serif;font-size:.92rem;color:#666;text-align:center;max-width:260px;">Open Messages and pick a username before using Contacts.</div>
      <button id="ct-goto-msg" style="padding:14px 28px;background:${BLUE};color:#fff;font-family:'Inter',sans-serif;font-size:1rem;font-weight:600;border:none;border-radius:16px;cursor:pointer;">Open Messages</button>
    `;
    c.appendChild(wrap);
    document.getElementById('ct-goto-msg').addEventListener('click', () => OS.openApp('messages'));
    return;
  }

  const me = MSG.getUsername();

  // Header
  const hdr = document.createElement('div');
  hdr.style.cssText = 'flex-shrink:0;padding:16px 20px 8px;display:flex;align-items:center;justify-content:space-between;';
  hdr.innerHTML = `
    <div style="font-family:'Inter',sans-serif;font-size:1.4rem;font-weight:700;color:#111;">Contacts</div>
    <div style="font-family:'Inter',sans-serif;font-size:.82rem;color:#666;">@${me}</div>
  `;
  c.appendChild(hdr);

  // Add bar
  const addBar = document.createElement('div');
  addBar.style.cssText = 'flex-shrink:0;display:flex;gap:10px;padding:8px 16px 12px;';
  addBar.innerHTML = `
    <input id="ct-inp" type="text" maxlength="24" placeholder="Add by username…" autocapitalize="none"
      style="flex:1;padding:11px 16px;font-family:'Inter',sans-serif;font-size:.92rem;background:rgba(255,255,255,.85);border:1px solid rgba(15,23,42,.1);border-radius:14px;outline:none;color:#111;">
    <button id="ct-add" style="padding:10px 16px;background:${BLUE};color:#fff;font-family:'Inter',sans-serif;font-size:.88rem;font-weight:600;border:none;border-radius:14px;cursor:pointer;">Add</button>
  `;
  c.appendChild(addBar);

  const errDiv = document.createElement('div');
  errDiv.style.cssText = 'flex-shrink:0;padding:0 20px 4px;font-family:\'Inter\',sans-serif;font-size:.82rem;color:#ff3b30;min-height:1.2em;';
  c.appendChild(errDiv);

  const scroll = document.createElement('div');
  scroll.style.cssText = 'flex:1;overflow-y:auto;-webkit-overflow-scrolling:touch;';
  c.appendChild(scroll);

  async function loadContacts() {
    scroll.innerHTML = '<div style="padding:20px;font-family:\'Inter\',sans-serif;font-size:.9rem;color:#aaa;text-align:center;">Loading…</div>';
    let contacts = [];
    try { contacts = await MSG.getContacts(me); } catch(e) {}
    scroll.innerHTML = '';
    if (!contacts.length) {
      scroll.innerHTML = `
        <div style="padding:40px 24px;text-align:center;display:flex;flex-direction:column;align-items:center;gap:12px;">
          <div style="font-size:3rem;">👤</div>
          <div style="font-family:'Inter',sans-serif;font-size:1rem;font-weight:600;color:#111;">No contacts yet</div>
          <div style="font-family:'Inter',sans-serif;font-size:.88rem;color:#888;">Enter a username above to add them</div>
        </div>`;
      return;
    }
    contacts.forEach(ct => {
      const initial = ct.username.charAt(0).toUpperCase();
      const hue     = (ct.username.charCodeAt(0) * 47) % 360;
      const row = document.createElement('div');
      row.style.cssText = 'display:flex;align-items:center;gap:14px;padding:12px 18px;border-bottom:1px solid rgba(15,23,42,.05);transition:background .15s;cursor:default;';
      row.innerHTML = `
        <div style="width:46px;height:46px;border-radius:23px;background:hsl(${hue},60%,55%);display:flex;align-items:center;justify-content:center;font-size:1.2rem;color:#fff;font-weight:700;flex-shrink:0;">${initial}</div>
        <div style="flex:1;min-width:0;">
          <div style="font-family:'Inter',sans-serif;font-size:.98rem;font-weight:600;color:#111;">${ct.display_name || ct.username}</div>
          <div style="font-family:'Inter',sans-serif;font-size:.82rem;color:#888;">@${ct.username}</div>
        </div>
        <button data-msg="${ct.username}" style="padding:8px 16px;background:${BLUE};color:#fff;font-family:'Inter',sans-serif;font-size:.82rem;font-weight:600;border:none;border-radius:12px;cursor:pointer;-webkit-tap-highlight-color:transparent;">Message</button>
        <button data-del="${ct.username}" style="padding:8px 12px;background:rgba(255,59,48,.12);color:#ff3b30;font-family:'Inter',sans-serif;font-size:.82rem;font-weight:600;border:none;border-radius:12px;cursor:pointer;-webkit-tap-highlight-color:transparent;">✕</button>
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
    const username = document.getElementById('ct-inp').value.trim().toLowerCase();
    if (!username) { errDiv.textContent = 'Enter a username.'; return; }
    errDiv.textContent = '';
    document.getElementById('ct-add').disabled = true;
    try {
      const res = await MSG.saveContact(me, username, username);
      if (res.ok) {
        document.getElementById('ct-inp').value = '';
        showToast98('Contacts', `@${username} added!`);
        loadContacts();
      } else {
        errDiv.textContent = res.error || 'Error adding contact.';
      }
    } catch(e) { errDiv.textContent = 'Network error.'; }
    document.getElementById('ct-add').disabled = false;
  }

  document.getElementById('ct-add').addEventListener('click', addContact);
  document.getElementById('ct-inp').addEventListener('keydown', e => { if (e.key === 'Enter') addContact(); });

  loadContacts();
}
