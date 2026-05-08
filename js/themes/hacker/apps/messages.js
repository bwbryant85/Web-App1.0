/* ════════════ MESSAGES — Hacker Theme ════════════ */
'use strict';

function initMessages98() {
  const c = window.content;
  c.style.cssText = 'width:100%;height:100%;display:flex;flex-direction:column;overflow:hidden;background:#050508;';

  const GREEN  = '#00ff41';
  const DIM    = '#006600';
  const BG     = '#050508';
  const BORDER = '1px solid #003300';

  /* ── Username setup ─────────────────────────────── */
  function showSetup(onDone) {
    c.innerHTML = '';
    const wrap = document.createElement('div');
    wrap.style.cssText = `flex:1;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:18px;padding:28px;background:${BG};`;
    wrap.innerHTML = `
      <div style="font-family:'Share Tech Mono',monospace;font-size:2rem;color:${GREEN};text-shadow:0 0 12px ${GREEN};">[ MESSAGES ]</div>
      <div style="font-family:'Share Tech Mono',monospace;font-size:.78rem;color:${DIM};letter-spacing:.1em;text-align:center;">SECURE MESSENGER · iPOCKET v8</div>
      <div style="width:100%;max-width:300px;border:${BORDER};padding:16px;background:rgba(0,255,65,.03);">
        <div style="font-family:'Share Tech Mono',monospace;font-size:.72rem;color:${DIM};margin-bottom:8px;">CHOOSE YOUR HANDLE:</div>
        <input id="msu-inp" type="text" maxlength="24" placeholder="your-handle" autocapitalize="none"
          style="width:100%;padding:8px 10px;font-family:'Share Tech Mono',monospace;font-size:.88rem;background:#000;border:1px solid ${GREEN};color:${GREEN};outline:none;box-sizing:border-box;caret-color:${GREEN};">
        <div id="msu-err" style="font-family:'Share Tech Mono',monospace;font-size:.7rem;color:#ff4444;min-height:1.2em;margin-top:6px;"></div>
        <button id="msu-btn" style="margin-top:10px;width:100%;padding:10px;font-family:'Share Tech Mono',monospace;font-size:.82rem;background:transparent;border:1px solid ${GREEN};color:${GREEN};cursor:pointer;letter-spacing:.12em;text-transform:uppercase;">[ REGISTER ]</button>
      </div>
      <div style="font-family:'Share Tech Mono',monospace;font-size:.65rem;color:${DIM};text-align:center;letter-spacing:.06em;">Letters, numbers, - and _ · 2–24 chars</div>
    `;
    c.appendChild(wrap);
    const inp = wrap.querySelector('#msu-inp');
    const err = wrap.querySelector('#msu-err');
    const btn = wrap.querySelector('#msu-btn');
    async function tryReg() {
      const val = inp.value.trim().toLowerCase();
      if (!val) { err.textContent = '> ERROR: empty handle'; return; }
      btn.disabled = true; btn.textContent = '[ REGISTERING... ]';
      try {
        const res = await MSG.register(val);
        if (res.ok) {
          MSG.setUsername(val); MSG.connect();
          c.innerHTML = '';
          c.style.cssText = `width:100%;height:100%;display:flex;flex-direction:column;overflow:hidden;background:${BG};`;
          onDone();
        } else {
          err.textContent = '> ERROR: ' + (res.error || 'try another handle');
          btn.disabled = false; btn.textContent = '[ REGISTER ]';
        }
      } catch(e) {
        err.textContent = '> ERROR: network failure';
        btn.disabled = false; btn.textContent = '[ REGISTER ]';
      }
    }
    btn.addEventListener('click', tryReg);
    inp.addEventListener('keydown', e => { if (e.key === 'Enter') tryReg(); });
    inp.focus();
  }

  /* ── Main UI ──────────────────────────────────────── */
  function buildMain() {
    const me = MSG.getUsername();

    const body = document.createElement('div');
    body.style.cssText = 'flex:1;overflow:hidden;position:relative;';
    c.appendChild(body);

    /* ── List panel ── */
    const listPanel = document.createElement('div');
    listPanel.style.cssText = `position:absolute;inset:0;display:flex;flex-direction:column;background:${BG};transition:transform .28s ease;`;
    body.appendChild(listPanel);

    const hdr = document.createElement('div');
    hdr.style.cssText = `flex-shrink:0;display:flex;align-items:center;justify-content:space-between;padding:10px 14px;border-bottom:${BORDER};`;
    hdr.innerHTML = `
      <span style="font-family:'Share Tech Mono',monospace;font-size:.82rem;color:${GREEN};letter-spacing:.1em;text-shadow:0 0 8px ${GREEN};">[ MESSAGES ]</span>
      <span style="font-family:'Share Tech Mono',monospace;font-size:.68rem;color:${DIM};">@${me}</span>
    `;
    listPanel.appendChild(hdr);

    const newRow = document.createElement('div');
    newRow.style.cssText = `flex-shrink:0;display:flex;gap:6px;padding:8px 10px;border-bottom:${BORDER};`;
    newRow.innerHTML = `
      <input id="msg-to-inp" type="text" maxlength="24" placeholder="target handle…" autocapitalize="none"
        style="flex:1;padding:6px 10px;font-family:'Share Tech Mono',monospace;font-size:.82rem;background:#000;border:1px solid ${DIM};color:${GREEN};outline:none;caret-color:${GREEN};">
      <button id="msg-to-go" style="padding:6px 12px;font-family:'Share Tech Mono',monospace;font-size:.75rem;background:transparent;border:1px solid ${GREEN};color:${GREEN};cursor:pointer;letter-spacing:.06em;">OPEN →</button>
    `;
    listPanel.appendChild(newRow);

    const convScroll = document.createElement('div');
    convScroll.style.cssText = 'flex:1;overflow-y:auto;-webkit-overflow-scrolling:touch;';
    listPanel.appendChild(convScroll);

    const statusBar = document.createElement('div');
    statusBar.style.cssText = `flex-shrink:0;padding:4px 10px;border-top:${BORDER};display:flex;justify-content:space-between;`;
    statusBar.innerHTML = `<span style="font-family:'Share Tech Mono',monospace;font-size:.65rem;color:${DIM};">LOGGED IN · @${me}</span><span style="font-family:'Share Tech Mono',monospace;font-size:.65rem;color:${DIM};">iPOCKET MSG</span>`;
    listPanel.appendChild(statusBar);

    /* ── Chat panel ── */
    const chatPanel = document.createElement('div');
    chatPanel.style.cssText = `position:absolute;inset:0;display:flex;flex-direction:column;background:${BG};transform:translateX(100%);transition:transform .28s cubic-bezier(.34,1.56,.64,1);`;
    body.appendChild(chatPanel);

    let currentChat = null;
    let unsub = null;

    async function loadConvs() {
      convScroll.innerHTML = `<div style="padding:14px;font-family:'Share Tech Mono',monospace;font-size:.75rem;color:${DIM};">> loading...</div>`;
      let convs = [];
      try { convs = await MSG.getConversations(me); } catch(e) {}
      convScroll.innerHTML = '';
      if (!convs.length) {
        convScroll.innerHTML = `<div style="padding:24px 16px;font-family:'Share Tech Mono',monospace;font-size:.75rem;color:${DIM};text-align:center;">> no transmissions yet<br>> enter a handle above to connect</div>`;
        return;
      }
      convs.forEach(cv => {
        const row = document.createElement('div');
        row.style.cssText = `display:flex;align-items:center;gap:10px;padding:10px 12px;border-bottom:${BORDER};cursor:pointer;-webkit-tap-highlight-color:transparent;`;
        row.innerHTML = `
          <div style="font-family:'Share Tech Mono',monospace;font-size:1rem;color:${GREEN};flex-shrink:0;">▶</div>
          <div style="flex:1;min-width:0;">
            <div style="font-family:'Share Tech Mono',monospace;font-size:.82rem;color:${GREEN};display:flex;align-items:center;gap:8px;">
              @${cv.partner}
              ${cv.unread > 0 ? `<span style="background:#003300;border:1px solid ${GREEN};color:${GREEN};font-size:.65rem;padding:1px 5px;">[${cv.unread}]</span>` : ''}
            </div>
            <div style="font-family:'Share Tech Mono',monospace;font-size:.7rem;color:${DIM};white-space:nowrap;overflow:hidden;text-overflow:ellipsis;margin-top:2px;">${cv.text || ''}</div>
          </div>
          <div style="font-family:'Share Tech Mono',monospace;font-size:.65rem;color:${DIM};flex-shrink:0;">${MSG.formatTime(cv.ts)}</div>
        `;
        row.addEventListener('click', () => openChat(cv.partner));
        row.addEventListener('touchstart', () => { row.style.background = 'rgba(0,255,65,.05)'; }, { passive: true });
        row.addEventListener('touchend',   () => { row.style.background = ''; });
        convScroll.appendChild(row);
      });
    }

    async function openChat(partner) {
      partner = partner.trim().toLowerCase();
      if (!partner || partner === me) return;
      currentChat = partner;
      chatPanel.innerHTML = '';

      const chatHdr = document.createElement('div');
      chatHdr.style.cssText = `flex-shrink:0;display:flex;align-items:center;gap:10px;padding:8px 12px;border-bottom:${BORDER};`;
      chatHdr.innerHTML = `
        <button id="chat-back" style="padding:6px 12px;font-family:'Share Tech Mono',monospace;font-size:.72rem;background:transparent;border:1px solid ${DIM};color:${DIM};cursor:pointer;letter-spacing:.06em;min-width:44px;min-height:44px;">◄ BACK</button>
        <span style="font-family:'Share Tech Mono',monospace;font-size:.82rem;color:${GREEN};text-shadow:0 0 8px ${GREEN};">@${partner}</span>
      `;
      chatPanel.appendChild(chatHdr);

      const msgArea = document.createElement('div');
      msgArea.style.cssText = `flex:1;overflow-y:auto;-webkit-overflow-scrolling:touch;padding:10px;display:flex;flex-direction:column;gap:6px;font-family:'Share Tech Mono',monospace;`;
      chatPanel.appendChild(msgArea);

      const inputRow = document.createElement('div');
      inputRow.style.cssText = `flex-shrink:0;display:flex;align-items:center;gap:6px;padding:8px 10px;border-top:${BORDER};`;
      inputRow.innerHTML = `
        <span style="font-family:'Share Tech Mono',monospace;font-size:.8rem;color:${GREEN};">></span>
        <input id="chat-inp" type="text" maxlength="500" placeholder="encrypt and send…"
          style="flex:1;padding:8px 10px;font-family:'Share Tech Mono',monospace;font-size:.82rem;background:#000;border:1px solid ${DIM};color:${GREEN};outline:none;caret-color:${GREEN};">
        <button id="chat-send" style="padding:8px 14px;font-family:'Share Tech Mono',monospace;font-size:.72rem;background:transparent;border:1px solid ${GREEN};color:${GREEN};cursor:pointer;min-width:44px;min-height:44px;letter-spacing:.04em;">SEND</button>
      `;
      chatPanel.appendChild(inputRow);

      chatPanel.style.transform = 'translateX(0)';

      chatHdr.querySelector('#chat-back').addEventListener('click', () => {
        chatPanel.style.transform = 'translateX(100%)';
        currentChat = null;
        if (unsub) { unsub(); unsub = null; }
        loadConvs();
      });

      function addBubble(msg) {
        const mine = msg.from_user === me;
        const row  = document.createElement('div');
        row.style.cssText = `display:flex;flex-direction:column;align-items:${mine ? 'flex-end' : 'flex-start'};`;
        const bub = document.createElement('div');
        bub.style.cssText = `max-width:82%;padding:7px 12px;word-break:break-word;font-size:.82rem;
          ${mine
            ? `background:rgba(0,255,65,.08);border:1px solid ${GREEN};color:${GREEN};`
            : `background:rgba(0,100,0,.15);border:1px solid ${DIM};color:#aaffaa;`}`;
        const prefix = document.createElement('span');
        prefix.style.cssText = `font-size:.65rem;color:${DIM};display:block;margin-bottom:3px;`;
        prefix.textContent = mine ? `[${me}]:` : `[${partner}]:`;
        bub.appendChild(prefix);
        bub.appendChild(document.createTextNode(msg.text));
        const ts = document.createElement('div');
        ts.style.cssText = `font-size:.6rem;color:${DIM};margin-top:3px;`;
        ts.textContent = MSG.formatTime(msg.ts);
        row.appendChild(bub); row.appendChild(ts);
        msgArea.appendChild(row);
        msgArea.scrollTop = msgArea.scrollHeight;
      }

      msgArea.innerHTML = `<div style="font-size:.75rem;color:${DIM};text-align:center;padding:10px;">> loading transmission…</div>`;
      let msgs = [];
      try { msgs = await MSG.getConversation(me, partner); } catch(e) {}
      msgArea.innerHTML = '';
      if (!msgs.length) {
        const em = document.createElement('div');
        em.style.cssText = `font-family:'Share Tech Mono',monospace;font-size:.75rem;color:${DIM};text-align:center;padding:24px;`;
        em.textContent = '> channel open · awaiting transmission';
        msgArea.appendChild(em);
      } else {
        msgs.forEach(addBubble);
      }

      const chatInp = chatPanel.querySelector('#chat-inp');
      const sendBtn = chatPanel.querySelector('#chat-send');
      async function doSend() {
        const text = chatInp.value.trim();
        if (!text) return;
        chatInp.value = '';
        const em = msgArea.querySelector('div:only-child');
        if (em && em.textContent.includes('awaiting')) em.remove();
        try {
          const res = await MSG.sendMessage(me, partner, text);
          if (!res.ok) showToast98('ERROR', res.error || 'TX failed');
        } catch(e) { showToast98('ERROR', 'Network failure'); }
        chatInp.focus();
      }
      sendBtn.addEventListener('click', doSend);
      chatInp.addEventListener('keydown', e => { if (e.key === 'Enter') doSend(); });
      chatInp.focus();

      if (unsub) unsub();
      unsub = MSG.onNewMessage(msg => {
        if ((msg.from_user === partner && msg.to_user === me) ||
            (msg.from_user === me && msg.to_user === partner)) {
          const em = msgArea.querySelector('div:only-child');
          if (em && em.textContent.includes('awaiting')) em.remove();
          addBubble(msg);
        }
      });
    }

    function goNew() {
      const to = listPanel.querySelector('#msg-to-inp').value.trim();
      if (to) { listPanel.querySelector('#msg-to-inp').value = ''; openChat(to); }
    }
    listPanel.querySelector('#msg-to-go').addEventListener('click', goNew);
    listPanel.querySelector('#msg-to-inp').addEventListener('keydown', e => { if (e.key === 'Enter') goNew(); });

    if (unsub) unsub();
    unsub = MSG.onNewMessage(msg => {
      if (msg.to_user === me && !currentChat) loadConvs();
    });

    loadConvs();

    const openWith = localStorage.getItem('ipocket_msg_open_with');
    if (openWith) { localStorage.removeItem('ipocket_msg_open_with'); openChat(openWith); }

    return () => { if (unsub) { unsub(); unsub = null; } };
  }

  if (MSG.getUsername()) { buildMain(); } else { showSetup(buildMain); }
}
