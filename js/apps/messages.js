/* ════════════ MESSAGES — Retro Win98 Theme ════════════ */
'use strict';

function initMessages98() {
  const c = window.content;
  c.style.cssText = 'width:100%;height:100%;display:flex;flex-direction:column;overflow:hidden;';

  /* ── Username setup ─────────────────────────────────── */
  function showUsernameSetup(onDone) {
    c.innerHTML = '';
    c.style.background = 'var(--win-chrome)';
    const wrap = document.createElement('div');
    wrap.style.cssText = 'flex:1;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:14px;padding:24px;';
    wrap.innerHTML = `
      <div style="font-size:2rem;">💬</div>
      <div style="font-family:var(--pixel-font);font-size:1.2rem;color:var(--win-text);text-align:center;font-weight:bold;">Welcome to Messages</div>
      <div style="font-family:var(--pixel-font);font-size:.85rem;color:var(--win-text-dim);text-align:center;">Pick a username to start chatting with other iPOCKET users</div>
      <input id="msu-input" type="text" maxlength="24" placeholder="your-username"
        style="width:100%;max-width:260px;padding:6px 10px;font-family:var(--pixel-font);font-size:.95rem;background:#fff;border:2px solid;border-color:var(--win-chrome-dark) var(--win-chrome-light) var(--win-chrome-light) var(--win-chrome-dark);color:var(--win-text);outline:none;">
      <div id="msu-err" style="font-family:var(--pixel-font);font-size:.8rem;color:#cc0000;min-height:1.2em;text-align:center;"></div>
      <button id="msu-btn" class="btn98 primary" style="padding:8px 24px;font-size:.95rem;">Set Username</button>
      <div style="font-family:var(--pixel-font);font-size:.72rem;color:var(--win-text-dim);text-align:center;">Letters, numbers, - and _ only (2–24 chars)</div>
    `;
    c.appendChild(wrap);
    const inp = wrap.querySelector('#msu-input');
    const err = wrap.querySelector('#msu-err');
    const btn = wrap.querySelector('#msu-btn');
    async function tryRegister() {
      const val = inp.value.trim().toLowerCase();
      if (!val) { err.textContent = 'Please enter a username.'; return; }
      btn.disabled = true; btn.textContent = 'Registering…';
      try {
        const res = await MSG.register(val);
        if (res.ok) {
          MSG.setUsername(val); MSG.connect();
          c.innerHTML = '';
          c.style.cssText = 'width:100%;height:100%;display:flex;flex-direction:column;overflow:hidden;';
          onDone();
        } else {
          err.textContent = res.error || 'Error — try another username.';
          btn.disabled = false; btn.textContent = 'Set Username';
        }
      } catch(e) {
        err.textContent = 'Connection error — check internet and try again.';
        btn.disabled = false; btn.textContent = 'Set Username';
      }
    }
    btn.addEventListener('click', tryRegister);
    inp.addEventListener('keydown', e => { if (e.key === 'Enter') tryRegister(); });
    inp.focus();
  }

  /* ── Main UI ──────────────────────────────────────────── */
  function buildMain() {
    const me = MSG.getUsername();

    const menu = document.createElement('div');
    menu.className = 'win-menubar';
    menu.innerHTML = '<div class="win-menu-item">File</div><div class="win-menu-item">View</div><div class="win-menu-item">Help</div>';
    c.appendChild(menu);

    const body = document.createElement('div');
    body.style.cssText = 'flex:1;overflow:hidden;position:relative;';
    c.appendChild(body);

    /* ── Conversation list panel ── */
    const listPanel = document.createElement('div');
    listPanel.style.cssText = 'position:absolute;inset:0;display:flex;flex-direction:column;background:var(--win-chrome);transition:transform .28s ease;';
    body.appendChild(listPanel);

    const newRow = document.createElement('div');
    newRow.style.cssText = 'flex-shrink:0;display:flex;gap:6px;padding:6px 8px;border-bottom:2px solid var(--win-chrome-dark);';
    newRow.innerHTML = `
      <input id="msg-to-inp" type="text" maxlength="24" placeholder="Username to message…"
        style="flex:1;padding:4px 8px;font-family:var(--pixel-font);font-size:.88rem;background:#fff;border:2px solid;border-color:var(--win-chrome-dark) var(--win-chrome-light) var(--win-chrome-light) var(--win-chrome-dark);color:var(--win-text);outline:none;">
      <button id="msg-to-go" class="btn98" style="white-space:nowrap;">Chat →</button>
    `;
    listPanel.appendChild(newRow);

    const convScroll = document.createElement('div');
    convScroll.style.cssText = 'flex:1;overflow-y:auto;-webkit-overflow-scrolling:touch;';
    listPanel.appendChild(convScroll);

    const listSb = document.createElement('div');
    listSb.className = 'win-statusbar';
    listSb.innerHTML = `<div class="win-status-pane">Logged in as @${me}</div>`;
    listPanel.appendChild(listSb);

    /* ── Chat panel ── */
    const chatPanel = document.createElement('div');
    chatPanel.style.cssText = 'position:absolute;inset:0;display:flex;flex-direction:column;background:var(--win-chrome);transform:translateX(100%);transition:transform .28s cubic-bezier(.34,1.56,.64,1);';
    body.appendChild(chatPanel);

    let currentChat = null;
    let unsubList   = null; // global list listener
    let unsubChat   = null; // per-chat subscription

    /* ── Load conversations ── */
    async function loadConvs() {
      convScroll.innerHTML = '<div style="padding:12px;font-family:var(--pixel-font);font-size:.88rem;color:var(--win-text-dim);">Loading…</div>';
      let convs = [];
      try { convs = await MSG.getConversations(me); } catch(e) {}
      convScroll.innerHTML = '';
      if (!convs.length) {
        convScroll.innerHTML = '<div style="padding:20px;font-family:var(--pixel-font);font-size:.85rem;color:var(--win-text-dim);text-align:center;">No conversations yet.<br>Enter a username above to start chatting!</div>';
        return;
      }
      convs.forEach(cv => {
        const row = document.createElement('div');
        row.style.cssText = 'display:flex;align-items:center;gap:8px;padding:8px 10px;border-bottom:1px solid var(--win-chrome-dark);cursor:pointer;-webkit-tap-highlight-color:transparent;';
        row.innerHTML = `
          <div style="font-size:1.4rem;flex-shrink:0;">👤</div>
          <div style="flex:1;min-width:0;">
            <div style="font-family:var(--pixel-font);font-size:.95rem;color:var(--win-text);font-weight:bold;display:flex;align-items:center;gap:6px;">
              @${cv.partner}
              ${cv.unread > 0 ? `<span style="background:#cc0000;color:#fff;font-size:.65rem;padding:1px 5px;border-radius:2px;">${cv.unread}</span>` : ''}
            </div>
            <div style="font-family:var(--pixel-font);font-size:.78rem;color:var(--win-text-dim);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${cv.text || ''}</div>
          </div>
          <div style="font-family:var(--pixel-font);font-size:.72rem;color:var(--win-text-dim);flex-shrink:0;">${MSG.formatTime(cv.ts)}</div>
        `;
        row.addEventListener('click', () => openChat(cv.partner));
        row.addEventListener('touchstart', () => { row.style.background = 'var(--win-select)'; row.style.color = 'var(--win-select-text)'; }, { passive: true });
        row.addEventListener('touchend',   () => { row.style.background = ''; row.style.color = ''; });
        convScroll.appendChild(row);
      });
    }

    /* ── Open chat with partner ── */
    async function openChat(partner) {
      partner = partner.trim().toLowerCase();
      if (!partner || partner === me) return;
      currentChat = partner;

      // Clean up previous chat subscription
      if (unsubChat) { unsubChat(); unsubChat = null; }
      chatPanel.innerHTML = '';

      const chatHead = document.createElement('div');
      chatHead.style.cssText = 'flex-shrink:0;display:flex;align-items:center;gap:8px;padding:4px 8px;background:var(--win-title-active);';
      chatHead.innerHTML = `
        <button id="chat-back" class="btn98" style="padding:2px 8px;font-size:.82rem;">◄ Back</button>
        <span style="font-family:var(--pixel-font);font-size:.95rem;color:#fff;flex:1;">💬 @${partner}</span>
      `;
      chatPanel.appendChild(chatHead);

      const msgArea = document.createElement('div');
      msgArea.style.cssText = 'flex:1;overflow-y:auto;-webkit-overflow-scrolling:touch;padding:8px;display:flex;flex-direction:column;gap:4px;background:#fff;';
      chatPanel.appendChild(msgArea);

      const inputRow = document.createElement('div');
      inputRow.style.cssText = 'flex-shrink:0;display:flex;gap:6px;padding:5px 8px;border-top:2px solid var(--win-chrome-dark);background:var(--win-chrome);';
      inputRow.innerHTML = `
        <input id="chat-inp" type="text" maxlength="500" placeholder="Type a message…"
          style="flex:1;padding:4px 8px;font-family:var(--pixel-font);font-size:.88rem;background:#fff;border:2px solid;border-color:var(--win-chrome-dark) var(--win-chrome-light) var(--win-chrome-light) var(--win-chrome-dark);color:var(--win-text);outline:none;">
        <button id="chat-send" class="btn98 primary" style="padding:4px 12px;">Send</button>
      `;
      chatPanel.appendChild(inputRow);

      chatPanel.style.transform = 'translateX(0)';

      let readStatusInterval = null;

      chatHead.querySelector('#chat-back').addEventListener('click', () => {
        chatPanel.style.transform = 'translateX(100%)';
        currentChat = null;
        if (unsubChat) { unsubChat(); unsubChat = null; }
        if (readStatusInterval) { clearInterval(readStatusInterval); readStatusInterval = null; }
        loadConvs();
      });

      /* Track shown IDs to deduplicate Gun.js events */
      const shownIds = new Set();

      function addBubble(msg) {
        if (!msg || !msg.id || !msg.text) return;
        if (shownIds.has(msg.id)) return;
        shownIds.add(msg.id);
        const mine = msg.from_user === me;
        const row  = document.createElement('div');
        row.style.cssText = `display:flex;flex-direction:column;align-items:${mine ? 'flex-end' : 'flex-start'};`;
        row.setAttribute('data-msg-id', msg.id);
        const bub = document.createElement('div');
        bub.style.cssText = `max-width:82%;padding:5px 10px;word-break:break-word;font-family:var(--pixel-font);font-size:.88rem;border:2px solid;
          ${mine
            ? 'background:var(--win-select);color:var(--win-select-text);border-color:var(--win-chrome-dark) var(--win-chrome-light) var(--win-chrome-light) var(--win-chrome-dark);'
            : 'background:var(--win-chrome);color:var(--win-text);border-color:var(--win-chrome-light) var(--win-chrome-dark) var(--win-chrome-dark) var(--win-chrome-light);'}`;
        bub.textContent = msg.text;
        const ts = document.createElement('div');
        ts.style.cssText = 'font-family:var(--pixel-font);font-size:.65rem;color:#808080;margin-top:2px;display:flex;align-items:center;gap:4px;';
        ts.innerHTML = `<span>${MSG.formatTime(msg.ts)}</span>`;
        
        /* Add read receipt for sent messages */
        if (mine) {
          const readIndicator = document.createElement('span');
          readIndicator.style.cssText = 'display:inline-block;width:10px;text-align:center;';
          readIndicator.textContent = msg.read ? '✓✓' : '✓';
          readIndicator.title = msg.read ? 'Read' : 'Sent';
          ts.appendChild(readIndicator);
        }
        
        row.appendChild(bub); 
        row.appendChild(ts);
        msgArea.appendChild(row);
        msgArea.scrollTop = msgArea.scrollHeight;
        
        /* Mark received messages as read after 500ms of appearing */
        if (!mine && msg.id) {
          setTimeout(() => {
            MSG.markAsRead(me, partner, msg.id);
          }, 500);
        }
      }

      /* Load history (populates shownIds) */
      msgArea.innerHTML = '<div style="font-family:var(--pixel-font);font-size:.82rem;color:#808080;text-align:center;padding:8px;">Loading…</div>';
      let msgs = [];
      try { msgs = await MSG.getConversation(me, partner); } catch(e) {}
      msgArea.innerHTML = '';
      if (!msgs.length) {
        const em = document.createElement('div');
        em.style.cssText = 'font-family:var(--pixel-font);font-size:.82rem;color:#808080;text-align:center;padding:24px;';
        em.textContent = 'No messages yet. Say hello!';
        msgArea.appendChild(em);
      } else {
        msgs.forEach(addBubble);
      }

      /* Send */
      const chatInp  = chatPanel.querySelector('#chat-inp');
      const sendBtn  = chatPanel.querySelector('#chat-send');
      async function doSend() {
        const text = chatInp.value.trim();
        if (!text) return;
        chatInp.value = '';
        sendBtn.disabled = true;
        sendBtn.textContent = 'Sending…';
        try {
          const res = await MSG.sendMessage(me, partner, text);
          if (res.ok) {
            // Remove "Say hello" placeholder if present
            const em = msgArea.querySelector('div');
            if (em && em.textContent.includes('Say hello')) em.remove();
            addBubble(res.message); // show immediately, dedup handles Gun.js repeat
          } else {
            showToast98('❌ Error', res.error || 'Failed to send');
          }
        } catch(e) { 
          console.error('Send error:', e);
          showToast98('❌ Error', 'Network error'); 
        }
        sendBtn.disabled = false;
        sendBtn.textContent = 'Send';
        chatInp.focus();
      }
      sendBtn.addEventListener('click', doSend);
      chatInp.addEventListener('keydown', e => { if (e.key === 'Enter') doSend(); });
      chatInp.focus();

      /* Real-time: subscribe AFTER history loaded so shownIds is pre-populated */
      unsubChat = MSG.subscribeToConversation(me, partner, msg => {
        const em = msgArea.querySelector('div');
        if (em && em.textContent.includes('Say hello')) em.remove();
        addBubble(msg);
      });
      
      /* Also subscribe to read status updates */
      readStatusInterval = setInterval(() => {
        msgArea.querySelectorAll('[data-msg-id]').forEach(async el => {
          const msgId = el.getAttribute('data-msg-id');
          if (msgId) {
            const status = await MSG.getReadStatus(me, partner, msgId);
            // Find the read indicator (second span in the timestamp div)
            const timeDiv = el.querySelector('div:nth-child(2)');
            if (timeDiv) {
              const spans = timeDiv.querySelectorAll('span');
              if (spans.length >= 2 && status.read && spans[1].textContent === '✓') {
                spans[1].textContent = '✓✓';
                spans[1].title = 'Read';
              }
            }
          }
        });
      }, 2000);
    }

    /* New chat from input bar */
    function goNewChat() {
      const to = listPanel.querySelector('#msg-to-inp').value.trim();
      if (to) { listPanel.querySelector('#msg-to-inp').value = ''; openChat(to); }
    }
    listPanel.querySelector('#msg-to-go').addEventListener('click', goNewChat);
    listPanel.querySelector('#msg-to-inp').addEventListener('keydown', e => { if (e.key === 'Enter') goNewChat(); });

    /* Global listener: refresh conv list on any incoming message */
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

  if (MSG.getUsername()) {
    buildMain();
  } else {
    showUsernameSetup(buildMain);
  }
}
