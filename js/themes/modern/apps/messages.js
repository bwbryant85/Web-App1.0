/* ════════════ MESSAGES — Modern (iMessage-style) ════════════ */
'use strict';

function initMessages98() {
  const c = window.content;
  c.style.cssText = 'width:100%;height:100%;display:flex;flex-direction:column;overflow:hidden;background:rgba(248,249,252,.95);border-radius:28px;';

  const BLUE        = '#0B84FF';
  const BUBBLE_SENT = `background:${BLUE};color:#fff;border-radius:20px 20px 4px 20px;`;
  const BUBBLE_RECV = `background:rgba(255,255,255,.92);color:#111;border-radius:20px 20px 20px 4px;box-shadow:0 1px 4px rgba(15,23,42,.08);`;

  /* ── Username setup ───────────────────────────────────── */
  function showSetup(onDone) {
    c.innerHTML = '';
    const wrap = document.createElement('div');
    wrap.style.cssText = 'flex:1;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:20px;padding:32px;';
    wrap.innerHTML = `
      <div style="width:80px;height:80px;background:linear-gradient(135deg,#0B84FF,#007AFF);border-radius:24px;display:flex;align-items:center;justify-content:center;font-size:2.5rem;box-shadow:0 8px 32px rgba(11,132,255,.35);">💬</div>
      <div style="font-family:'Inter',sans-serif;font-size:1.5rem;font-weight:700;color:#111;text-align:center;">Welcome to Messages</div>
      <div style="font-family:'Inter',sans-serif;font-size:.95rem;color:#666;text-align:center;max-width:260px;">Choose a username to start chatting with other iPOCKET users</div>
      <input id="msu-inp" type="text" maxlength="24" placeholder="your-username" autocomplete="off" autocapitalize="none"
        style="width:100%;max-width:280px;padding:14px 18px;font-family:'Inter',sans-serif;font-size:1rem;background:rgba(255,255,255,.9);border:1px solid rgba(15,23,42,.12);border-radius:16px;outline:none;color:#111;backdrop-filter:blur(12px);">
      <div id="msu-err" style="font-family:'Inter',sans-serif;font-size:.88rem;color:#ff3b30;min-height:1.2em;text-align:center;"></div>
      <button id="msu-btn" style="width:100%;max-width:280px;padding:15px;background:${BLUE};color:#fff;font-family:'Inter',sans-serif;font-size:1rem;font-weight:600;border:none;border-radius:16px;cursor:pointer;box-shadow:0 4px 20px rgba(11,132,255,.35);">Continue</button>
      <div style="font-family:'Inter',sans-serif;font-size:.8rem;color:#aaa;text-align:center;">Letters, numbers, - and _ · 2–24 chars</div>
    `;
    c.appendChild(wrap);
    const inp = wrap.querySelector('#msu-inp');
    const err = wrap.querySelector('#msu-err');
    const btn = wrap.querySelector('#msu-btn');
    async function tryReg() {
      const val = inp.value.trim().toLowerCase();
      if (!val) { err.textContent = 'Please enter a username.'; return; }
      btn.disabled = true; btn.textContent = 'Setting up…';
      try {
        const res = await MSG.register(val);
        if (res.ok) {
          MSG.setUsername(val); MSG.connect();
          c.innerHTML = '';
          c.style.cssText = 'width:100%;height:100%;display:flex;flex-direction:column;overflow:hidden;background:rgba(248,249,252,.95);border-radius:28px;';
          onDone();
        } else {
          err.textContent = res.error || 'Try another username.';
          btn.disabled = false; btn.textContent = 'Continue';
        }
      } catch(e) {
        err.textContent = 'Connection error — check internet and try again.';
        btn.disabled = false; btn.textContent = 'Continue';
      }
    }
    btn.addEventListener('click', tryReg);
    inp.addEventListener('keydown', e => { if (e.key === 'Enter') tryReg(); });
    inp.focus();
  }

  /* ── Main UI ──────────────────────────────────────────── */
  function buildMain() {
    const me = MSG.getUsername();

    const body = document.createElement('div');
    body.style.cssText = 'flex:1;overflow:hidden;position:relative;';
    c.appendChild(body);

    /* ── List panel ── */
    const listPanel = document.createElement('div');
    listPanel.style.cssText = 'position:absolute;inset:0;display:flex;flex-direction:column;transition:transform .32s cubic-bezier(.34,1,.64,1);';
    body.appendChild(listPanel);

    const hdr = document.createElement('div');
    hdr.style.cssText = 'flex-shrink:0;padding:16px 20px 10px;display:flex;align-items:center;justify-content:space-between;backdrop-filter:blur(20px);-webkit-backdrop-filter:blur(20px);';
    hdr.innerHTML = `
      <div style="font-family:'Inter',sans-serif;font-size:1.4rem;font-weight:700;color:#111;">Messages</div>
      <div style="font-family:'Inter',sans-serif;font-size:.82rem;color:#666;">@${me}</div>
    `;
    listPanel.appendChild(hdr);

    const newBar = document.createElement('div');
    newBar.style.cssText = 'flex-shrink:0;display:flex;gap:10px;padding:8px 16px 12px;';
    newBar.innerHTML = `
      <input id="msg-to-inp" type="text" maxlength="24" placeholder="Message someone by username…" autocapitalize="none"
        style="flex:1;padding:11px 16px;font-family:'Inter',sans-serif;font-size:.92rem;background:rgba(255,255,255,.85);border:1px solid rgba(15,23,42,.1);border-radius:14px;outline:none;color:#111;backdrop-filter:blur(12px);">
      <button id="msg-to-go" style="padding:10px 16px;background:${BLUE};color:#fff;font-family:'Inter',sans-serif;font-size:.88rem;font-weight:600;border:none;border-radius:14px;cursor:pointer;white-space:nowrap;">→</button>
    `;
    listPanel.appendChild(newBar);

    const convScroll = document.createElement('div');
    convScroll.style.cssText = 'flex:1;overflow-y:auto;-webkit-overflow-scrolling:touch;';
    listPanel.appendChild(convScroll);

    /* ── Chat panel ── */
    const chatPanel = document.createElement('div');
    chatPanel.style.cssText = 'position:absolute;inset:0;display:flex;flex-direction:column;background:rgba(248,249,252,.97);transform:translateX(100%);transition:transform .32s cubic-bezier(.34,1,.64,1);';
    body.appendChild(chatPanel);

    let currentChat = null;
    let unsubList   = null;
    let unsubChat   = null;

    /* Load conversations */
    async function loadConvs() {
      convScroll.innerHTML = '<div style="padding:20px;font-family:\'Inter\',sans-serif;font-size:.9rem;color:#aaa;text-align:center;">Loading…</div>';
      let convs = [];
      try { convs = await MSG.getConversations(me); } catch(e) {}
      convScroll.innerHTML = '';
      if (!convs.length) {
        const em = document.createElement('div');
        em.style.cssText = 'padding:40px 24px;text-align:center;display:flex;flex-direction:column;align-items:center;gap:12px;';
        em.innerHTML = `
          <div style="font-size:3rem;">💬</div>
          <div style="font-family:'Inter',sans-serif;font-size:1rem;font-weight:600;color:#111;">No conversations yet</div>
          <div style="font-family:'Inter',sans-serif;font-size:.88rem;color:#888;">Enter someone's username above to start a conversation</div>
        `;
        convScroll.appendChild(em);
        return;
      }
      convs.forEach(cv => {
        const row = document.createElement('div');
        row.style.cssText = 'display:flex;align-items:center;gap:14px;padding:12px 18px;cursor:pointer;-webkit-tap-highlight-color:transparent;border-bottom:1px solid rgba(15,23,42,.05);transition:background .15s;';
        const initial = cv.partner.charAt(0).toUpperCase();
        const hue = (cv.partner.charCodeAt(0) * 47) % 360;
        row.innerHTML = `
          <div style="width:46px;height:46px;border-radius:23px;background:hsl(${hue},60%,55%);display:flex;align-items:center;justify-content:center;font-size:1.2rem;color:#fff;font-family:'Inter',sans-serif;font-weight:700;flex-shrink:0;">${initial}</div>
          <div style="flex:1;min-width:0;">
            <div style="display:flex;align-items:baseline;gap:6px;">
              <span style="font-family:'Inter',sans-serif;font-size:.98rem;font-weight:600;color:#111;">@${cv.partner}</span>
              ${cv.unread > 0 ? `<span style="width:18px;height:18px;background:${BLUE};color:#fff;font-family:'Inter',sans-serif;font-size:.65rem;font-weight:700;border-radius:9px;display:inline-flex;align-items:center;justify-content:center;">${cv.unread}</span>` : ''}
              <span style="margin-left:auto;font-family:'Inter',sans-serif;font-size:.75rem;color:#aaa;">${MSG.formatTime(cv.ts)}</span>
            </div>
            <div style="font-family:'Inter',sans-serif;font-size:.85rem;color:#888;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;margin-top:2px;">${cv.text || ''}</div>
          </div>
        `;
        row.addEventListener('click', () => openChat(cv.partner));
        row.addEventListener('touchstart', () => { row.style.background = 'rgba(15,23,42,.04)'; }, { passive: true });
        row.addEventListener('touchend',   () => { row.style.background = ''; });
        convScroll.appendChild(row);
      });
    }

    /* Open chat */
    async function openChat(partner) {
      partner = partner.trim().toLowerCase();
      if (!partner || partner === me) return;
      currentChat = partner;

      if (unsubChat) { unsubChat(); unsubChat = null; }
      chatPanel.innerHTML = '';

      const initial = partner.charAt(0).toUpperCase();
      const hue     = (partner.charCodeAt(0) * 47) % 360;

      const chatHdr = document.createElement('div');
      chatHdr.style.cssText = `flex-shrink:0;display:flex;align-items:center;gap:12px;padding:12px 16px;background:rgba(248,249,252,.9);backdrop-filter:blur(20px);-webkit-backdrop-filter:blur(20px);border-bottom:1px solid rgba(15,23,42,.06);`;
      chatHdr.innerHTML = `
        <button id="chat-back" style="background:none;border:none;color:${BLUE};font-family:'Inter',sans-serif;font-size:1rem;cursor:pointer;padding:8px;min-width:44px;min-height:44px;display:flex;align-items:center;justify-content:center;border-radius:12px;-webkit-tap-highlight-color:transparent;">‹ Back</button>
        <div style="width:36px;height:36px;border-radius:18px;background:hsl(${hue},60%,55%);display:flex;align-items:center;justify-content:center;font-size:1rem;color:#fff;font-weight:700;flex-shrink:0;">${initial}</div>
        <div style="font-family:'Inter',sans-serif;font-size:1rem;font-weight:600;color:#111;">@${partner}</div>
      `;
      chatPanel.appendChild(chatHdr);

      const msgArea = document.createElement('div');
      msgArea.style.cssText = 'flex:1;overflow-y:auto;-webkit-overflow-scrolling:touch;padding:12px 16px;display:flex;flex-direction:column;gap:3px;';
      chatPanel.appendChild(msgArea);

      const inputBar = document.createElement('div');
      inputBar.style.cssText = 'flex-shrink:0;display:flex;align-items:flex-end;gap:10px;padding:10px 16px 14px;background:rgba(248,249,252,.9);backdrop-filter:blur(20px);-webkit-backdrop-filter:blur(20px);border-top:1px solid rgba(15,23,42,.06);';
      inputBar.innerHTML = `
        <textarea id="chat-inp" rows="1" maxlength="500" placeholder="iMessage"
          style="flex:1;padding:11px 16px;font-family:'Inter',sans-serif;font-size:.95rem;background:rgba(255,255,255,.9);border:1px solid rgba(15,23,42,.12);border-radius:20px;outline:none;color:#111;resize:none;max-height:100px;overflow-y:auto;line-height:1.4;"></textarea>
        <button id="chat-send" style="width:36px;height:36px;background:${BLUE};border:none;border-radius:18px;display:flex;align-items:center;justify-content:center;cursor:pointer;flex-shrink:0;transition:transform .12s ease;-webkit-tap-highlight-color:transparent;">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M3 20l19-8L3 4v6l14 2-14 2v6z" fill="white"/></svg>
        </button>
      `;
      chatPanel.appendChild(inputBar);

      chatPanel.style.transform = 'translateX(0)';

      chatHdr.querySelector('#chat-back').addEventListener('click', () => {
        chatPanel.style.transform = 'translateX(100%)';
        currentChat = null;
        if (unsubChat) { unsubChat(); unsubChat = null; }
        loadConvs();
      });

      /* Dedup set — populated by history load, then real-time uses it too */
      const shownIds = new Set();

      function addBubble(msg) {
        if (!msg || !msg.id || !msg.text) return;
        if (shownIds.has(msg.id)) return;
        shownIds.add(msg.id);
        const mine  = msg.from_user === me;
        const group = document.createElement('div');
        group.style.cssText = `display:flex;flex-direction:column;align-items:${mine ? 'flex-end' : 'flex-start'};margin-bottom:2px;`;
        const bub = document.createElement('div');
        bub.style.cssText = `max-width:78%;padding:10px 14px;font-family:'Inter',sans-serif;font-size:.92rem;line-height:1.45;word-break:break-word;${mine ? BUBBLE_SENT : BUBBLE_RECV}`;
        bub.textContent = msg.text;
        const ts = document.createElement('div');
        ts.style.cssText = `font-family:'Inter',sans-serif;font-size:.68rem;color:#aaa;margin-top:3px;${mine ? 'text-align:right;' : ''}`;
        ts.textContent = MSG.formatTime(msg.ts);
        group.appendChild(bub); group.appendChild(ts);
        msgArea.appendChild(group);
        msgArea.scrollTop = msgArea.scrollHeight;
      }

      /* Load history */
      msgArea.innerHTML = '<div style="font-family:\'Inter\',sans-serif;font-size:.88rem;color:#aaa;text-align:center;padding:20px;">Loading…</div>';
      let msgs = [];
      try { msgs = await MSG.getConversation(me, partner); } catch(e) {}
      msgArea.innerHTML = '';
      if (!msgs.length) {
        const em = document.createElement('div');
        em.style.cssText = 'display:flex;flex-direction:column;align-items:center;gap:10px;padding:40px 20px;';
        em.innerHTML = `
          <div style="width:60px;height:60px;background:hsl(${hue},60%,55%);border-radius:30px;display:flex;align-items:center;justify-content:center;font-size:1.8rem;color:#fff;font-weight:700;">${initial}</div>
          <div style="font-family:'Inter',sans-serif;font-size:.95rem;font-weight:600;color:#111;">@${partner}</div>
          <div style="font-family:'Inter',sans-serif;font-size:.85rem;color:#aaa;">Say hello!</div>
        `;
        msgArea.appendChild(em);
      } else {
        msgs.forEach(addBubble);
      }

      /* Send */
      const chatInp = chatPanel.querySelector('#chat-inp');
      const sendBtn = chatPanel.querySelector('#chat-send');

      chatInp.addEventListener('input', () => {
        chatInp.style.height = 'auto';
        chatInp.style.height = Math.min(chatInp.scrollHeight, 100) + 'px';
      });

      async function doSend() {
        const text = chatInp.value.trim();
        if (!text) return;
        chatInp.value = ''; chatInp.style.height = 'auto';
        sendBtn.style.transform = 'scale(.88)';
        setTimeout(() => { sendBtn.style.transform = ''; }, 120);
        try {
          const res = await MSG.sendMessage(me, partner, text);
          if (res.ok) {
            const em = msgArea.querySelector('div[style*="flex-direction:column"]');
            if (em && em.textContent.includes('Say hello')) em.remove();
            addBubble(res.message);
          } else {
            showToast98('Error', res.error || 'Failed to send');
          }
        } catch(e) { showToast98('Error', 'Network error'); }
        chatInp.focus();
      }
      sendBtn.addEventListener('click', doSend);
      chatInp.addEventListener('keydown', e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); doSend(); } });
      chatInp.focus();

      /* Real-time subscription (fires after history loaded) */
      unsubChat = MSG.subscribeToConversation(me, partner, msg => {
        const em = msgArea.querySelector('div[style*="flex-direction:column"]');
        if (em && em.textContent.includes('Say hello')) em.remove();
        addBubble(msg);
      });
    }

    function goNew() {
      const to = listPanel.querySelector('#msg-to-inp').value.trim();
      if (to) { listPanel.querySelector('#msg-to-inp').value = ''; openChat(to); }
    }
    listPanel.querySelector('#msg-to-go').addEventListener('click', goNew);
    listPanel.querySelector('#msg-to-inp').addEventListener('keydown', e => { if (e.key === 'Enter') goNew(); });

    unsubList = MSG.onNewMessage(msg => {
      if (msg.to_user === me && !currentChat) loadConvs();
    });

    loadConvs();

    const openWith = localStorage.getItem('ipocket_msg_open_with');
    if (openWith) { localStorage.removeItem('ipocket_msg_open_with'); openChat(openWith); }

    return () => {
      if (unsubList) { unsubList(); unsubList = null; }
      if (unsubChat) { unsubChat(); unsubChat = null; }
    };
  }

  if (MSG.getUsername()) { buildMain(); } else { showSetup(buildMain); }
}
