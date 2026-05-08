/* ════════════ CONTACTS — Hacker Theme ════════════ */
'use strict';

function initContacts98() {
  const c = window.content;
  const GREEN = '#00ff41';
  const DIM   = '#006600';
  const BG    = '#050508';
  const BORDER = '1px solid #003300';
  c.style.cssText = `width:100%;height:100%;display:flex;flex-direction:column;overflow:hidden;background:${BG};`;

  if (!MSG.getUsername()) {
    const wrap = document.createElement('div');
    wrap.style.cssText = `flex:1;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:16px;padding:28px;background:${BG};`;
    wrap.innerHTML = `
      <div style="font-family:'Share Tech Mono',monospace;font-size:1.5rem;color:${GREEN};text-shadow:0 0 12px ${GREEN};">[ CONTACTS ]</div>
      <div style="font-family:'Share Tech Mono',monospace;font-size:.75rem;color:${DIM};text-align:center;letter-spacing:.06em;">REGISTER IN MESSAGES FIRST</div>
      <button id="ct-goto-msg" style="padding:10px 20px;font-family:'Share Tech Mono',monospace;font-size:.78rem;background:transparent;border:1px solid ${GREEN};color:${GREEN};cursor:pointer;letter-spacing:.1em;">[ OPEN MESSAGES ]</button>
    `;
    c.appendChild(wrap);
    document.getElementById('ct-goto-msg').addEventListener('click', () => OS.openApp('messages'));
    return;
  }

  const me = MSG.getUsername();

  const hdr = document.createElement('div');
  hdr.style.cssText = `flex-shrink:0;display:flex;align-items:center;justify-content:space-between;padding:10px 14px;border-bottom:${BORDER};`;
  hdr.innerHTML = `
    <span style="font-family:'Share Tech Mono',monospace;font-size:.82rem;color:${GREEN};text-shadow:0 0 8px ${GREEN};letter-spacing:.1em;">[ CONTACTS ]</span>
    <span style="font-family:'Share Tech Mono',monospace;font-size:.68rem;color:${DIM};">@${me}</span>
  `;
  c.appendChild(hdr);

  const addRow = document.createElement('div');
  addRow.style.cssText = `flex-shrink:0;display:flex;gap:6px;padding:8px 10px;border-bottom:${BORDER};align-items:center;`;
  addRow.innerHTML = `
    <span style="font-family:'Share Tech Mono',monospace;font-size:.8rem;color:${GREEN};">></span>
    <input id="ct-inp" type="text" maxlength="24" placeholder="add handle…" autocapitalize="none"
      style="flex:1;padding:7px 10px;font-family:'Share Tech Mono',monospace;font-size:.82rem;background:#000;border:1px solid ${DIM};color:${GREEN};outline:none;caret-color:${GREEN};">
    <button id="ct-add" style="padding:7px 14px;font-family:'Share Tech Mono',monospace;font-size:.72rem;background:transparent;border:1px solid ${GREEN};color:${GREEN};cursor:pointer;letter-spacing:.06em;min-width:44px;min-height:44px;">ADD</button>
  `;
  c.appendChild(addRow);

  const errLine = document.createElement('div');
  errLine.style.cssText = `flex-shrink:0;padding:3px 12px;font-family:'Share Tech Mono',monospace;font-size:.7rem;color:#ff4444;min-height:1.2em;`;
  c.appendChild(errLine);

  const scroll = document.createElement('div');
  scroll.style.cssText = 'flex:1;overflow-y:auto;-webkit-overflow-scrolling:touch;';
  c.appendChild(scroll);

  async function loadContacts() {
    scroll.innerHTML = `<div style="padding:14px;font-family:'Share Tech Mono',monospace;font-size:.75rem;color:${DIM};">> loading directory...</div>`;
    let contacts = [];
    try { contacts = await MSG.getContacts(me); } catch(e) {}
    scroll.innerHTML = '';
    if (!contacts.length) {
      scroll.innerHTML = `<div style="padding:24px;font-family:'Share Tech Mono',monospace;font-size:.75rem;color:${DIM};text-align:center;">> directory empty<br>> add a handle above</div>`;
      return;
    }
    contacts.forEach(ct => {
      const row = document.createElement('div');
      row.style.cssText = `display:flex;align-items:center;gap:10px;padding:10px 12px;border-bottom:${BORDER};`;
      row.innerHTML = `
        <span style="font-family:'Share Tech Mono',monospace;font-size:1rem;color:${GREEN};flex-shrink:0;">▶</span>
        <div style="flex:1;min-width:0;">
          <div style="font-family:'Share Tech Mono',monospace;font-size:.82rem;color:${GREEN};">@${ct.username}</div>
          <div style="font-family:'Share Tech Mono',monospace;font-size:.7rem;color:${DIM};">${ct.display_name !== ct.username ? ct.display_name : 'trusted contact'}</div>
        </div>
        <button data-msg="${ct.username}" style="padding:6px 10px;font-family:'Share Tech Mono',monospace;font-size:.68rem;background:transparent;border:1px solid ${DIM};color:${DIM};cursor:pointer;min-width:44px;min-height:44px;letter-spacing:.04em;">TX</button>
        <button data-del="${ct.username}" style="padding:6px 10px;font-family:'Share Tech Mono',monospace;font-size:.68rem;background:transparent;border:1px solid #440000;color:#ff4444;cursor:pointer;min-width:44px;min-height:44px;">DEL</button>
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
    if (!username) { errLine.textContent = '> ERROR: empty handle'; return; }
    errLine.textContent = '';
    document.getElementById('ct-add').disabled = true;
    try {
      const res = await MSG.saveContact(me, username, username);
      if (res.ok) {
        document.getElementById('ct-inp').value = '';
        showToast98('CONTACTS', `@${username} added`);
        loadContacts();
      } else {
        errLine.textContent = '> ERROR: ' + (res.error || 'add failed');
      }
    } catch(e) { errLine.textContent = '> ERROR: network failure'; }
    document.getElementById('ct-add').disabled = false;
  }

  document.getElementById('ct-add').addEventListener('click', addContact);
  document.getElementById('ct-inp').addEventListener('keydown', e => { if (e.key === 'Enter') addContact(); });

  loadContacts();
}
