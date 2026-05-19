/* ════════════════════════════════════════════════════════════
   MESSAGES — Win98 Theme
   Auth: register/login with password
   Storage: 100% localStorage, XOR encoded, no server ever
   Simulator: shows real delivery + read receipts, not random bot
════════════════════════════════════════════════════════════ */
'use strict';

function initMessages98() {
  const c = window.content;
  c.style.cssText = 'width:100%;height:100%;display:flex;flex-direction:column;overflow:hidden;';

  const pf    = 'font-family:var(--pixel-font);';
  const inp98 = `padding:5px 8px;${pf}font-size:.88rem;background:#fff;border:2px solid;
    border-color:var(--win-chrome-dark) var(--win-chrome-light) var(--win-chrome-light) var(--win-chrome-dark);
    color:var(--win-text);outline:none;width:100%;box-sizing:border-box;`;

  /* ─────────────────────────────────────────────────────────
     AUTH SCREEN
  ───────────────────────────────────────────────────────── */
  function showAuth(onDone) {
    c.innerHTML = '';
    let mode = MSG.hasAccount() ? 'login' : 'register';

    function render() {
      c.innerHTML = '';
      const wrap = document.createElement('div');
      wrap.style.cssText = 'flex:1;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:10px;padding:18px;overflow-y:auto;';
      const isReg = mode === 'register';
      wrap.innerHTML = `
        <div style="font-size:2rem;">💬</div>
        <div style="${pf}font-size:1.05rem;font-weight:bold;color:var(--win-text);">iPOCKET Messages</div>
        <div style="${pf}font-size:.78rem;color:var(--win-text-dim);text-align:center;">
          ${isReg ? 'Create your account (stored only on this device)' : 'Sign in to continue'}
        </div>
        <div style="width:100%;max-width:280px;display:flex;flex-direction:column;gap:6px;">
          <label style="${pf}font-size:.8rem;">Username</label>
          <input id="au" type="text" maxlength="24" placeholder="your-username" autocapitalize="none" style="${inp98}">
          <label style="${pf}font-size:.8rem;">Password</label>
          <input id="ap" type="password" maxlength="64" placeholder="${isReg ? 'min 4 chars' : 'your password'}" style="${inp98}">
          ${isReg ? `<label style="${pf}font-size:.8rem;">Confirm Password</label>
          <input id="ap2" type="password" maxlength="64" placeholder="confirm" style="${inp98}">` : ''}
        </div>
        <div id="ae" style="${pf}font-size:.78rem;color:#cc0000;min-height:1em;text-align:center;max-width:260px;"></div>
        <button id="ab" class="btn98 primary" style="padding:7px 24px;">${isReg ? 'Create Account' : 'Sign In'}</button>
        <button id="as" class="btn98" style="padding:3px 14px;font-size:.78rem;">
          ${isReg ? '← Already have an account' : 'New here? Register'}
        </button>
        <div style="${pf}font-size:.66rem;color:var(--win-text-dim);text-align:center;max-width:220px;line-height:1.4;">
          All messages are saved locally on this device and encoded. No internet required.
        </div>`;
      c.appendChild(wrap);

      const errEl = wrap.querySelector('#ae');
      const btn   = wrap.querySelector('#ab');
      const uInp  = wrap.querySelector('#au');
      const pInp  = wrap.querySelector('#ap');

      wrap.querySelector('#as').addEventListener('click', () => {
        mode = mode === 'login' ? 'register' : 'login'; render();
      });

      async function doAuth() {
        const u = uInp.value.trim().toLowerCase();
        const p = pInp.value;
        errEl.textContent = '';
        btn.disabled = true;

        if (isReg) {
          const p2 = wrap.querySelector('#ap2').value;
          if (p !== p2) { errEl.textContent = 'Passwords do not match.'; btn.disabled = false; return; }
          const res = await MSG.register(u, p);
          if (res.ok) { MSG.connect(); c.innerHTML = ''; c.style.cssText = 'width:100%;height:100%;display:flex;flex-direction:column;overflow:hidden;'; onDone(); }
          else { errEl.textContent = res.error; btn.disabled = false; }
        } else {
          const res = await MSG.login(u, p);
          if (res.ok) { MSG.connect(); c.innerHTML = ''; c.style.cssText = 'width:100%;height:100%;display:flex;flex-direction:column;overflow:hidden;'; onDone(); }
          else { errEl.textContent = res.error; btn.disabled = false; }
        }
      }

      btn.addEventListener('click', doAuth);
      [uInp, pInp].forEach(el => el.addEventListener('keydown', e => { if (e.key === 'Enter') doAuth(); }));
      uInp.focus();
    }
    render();
  }

  /* ─────────────────────────────────────────────────────────
     MAIN UI
  ───────────────────────────────────────────────────────── */
  function buildMain() {
    const me = MSG.getUsername();

    // Menu bar
    const menu = document.createElement('div');
    menu.className = 'win-menubar';
    menu.innerHTML = `
      <div class="win-menu-item" id="mm-file">File</div>
      <div class="win-menu-item" id="mm-xfer">📁 Transfer</div>`;
    c.appendChild(menu);

    menu.querySelector('#mm-file').addEventListener('click', () => showAccountPanel());
    menu.querySelector('#mm-xfer').addEventListener('click', () => showTransferPanel());

    const body = document.createElement('div');
    body.style.cssText = 'flex:1;overflow:hidden;position:relative;';
    c.appendChild(body);

    /* List panel */
    const listPanel = document.createElement('div');
    listPanel.style.cssText = 'position:absolute;inset:0;display:flex;flex-direction:column;transition:transform .28s ease;';
    body.appendChild(listPanel);

    const newRow = document.createElement('div');
    newRow.style.cssText = 'flex-shrink:0;display:flex;gap:6px;padding:6px 8px;border-bottom:2px solid var(--win-chrome-dark);';
    newRow.innerHTML = `
      <input id="mti" type="text" maxlength="24" placeholder="Username to message…" autocapitalize="none"
        style="flex:1;${inp98}width:auto;">
      <button id="mtg" class="btn98" style="white-space:nowrap;">Chat →</button>`;
    listPanel.appendChild(newRow);

    const convScroll = document.createElement('div');
    convScroll.style.cssText = 'flex:1;overflow-y:auto;-webkit-overflow-scrolling:touch;';
    listPanel.appendChild(convScroll);

    const listSb = document.createElement('div');
    listSb.className = 'win-statusbar';
    listSb.style.cssText = 'display:flex;align-items:center;justify-content:space-between;gap:6px;padding:2px 6px;flex-shrink:0;';
    listSb.innerHTML = `
      <div class="win-status-pane" style="flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;${pf}font-size:.78rem;">@${me}</div>
      <button id="sim-btn" class="btn98" style="font-size:.7rem;padding:2px 6px;white-space:nowrap;flex-shrink:0;">🤖 Simulator</button>`;
    listPanel.appendChild(listSb);
    listSb.querySelector('#sim-btn').addEventListener('click', () => openSimulator());

    /* Chat panel */
    const chatPanel = document.createElement('div');
    chatPanel.style.cssText = 'position:absolute;inset:0;display:flex;flex-direction:column;transform:translateX(100%);transition:transform .28s cubic-bezier(.34,1.56,.64,1);';
    body.appendChild(chatPanel);

    let currentChat = null, unsubList = null, unsubChat = null;

    /* Load conversations */
    async function loadConvs() {
      convScroll.innerHTML = `<div style="padding:12px;${pf}font-size:.82rem;color:var(--win-text-dim);">Loading…</div>`;
      const convs = await MSG.getConversations(me).catch(() => []);
      convScroll.innerHTML = '';
      if (!convs.length) {
        convScroll.innerHTML = `<div style="padding:20px;${pf}font-size:.82rem;color:var(--win-text-dim);text-align:center;">
          No conversations yet.<br>Enter a username above to start!</div>`;
        return;
      }
      convs.forEach(cv => {
        const row = document.createElement('div');
        row.style.cssText = 'display:flex;align-items:center;gap:8px;padding:8px 10px;border-bottom:1px solid var(--win-chrome-dark);cursor:pointer;-webkit-tap-highlight-color:transparent;';
        row.innerHTML = `
          <div style="font-size:1.4rem;flex-shrink:0;">👤</div>
          <div style="flex:1;min-width:0;">
            <div style="${pf}font-size:.92rem;font-weight:bold;display:flex;align-items:center;gap:5px;">
              @${cv.partner}
              ${cv.unread > 0 ? `<span style="background:#cc0000;color:#fff;font-size:.62rem;padding:1px 4px;border-radius:2px;">${cv.unread}</span>` : ''}
            </div>
            <div style="${pf}font-size:.75rem;color:var(--win-text-dim);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${cv.text || ''}</div>
          </div>
          <div style="${pf}font-size:.68rem;color:var(--win-text-dim);flex-shrink:0;">${MSG.formatTime(cv.ts)}</div>`;
        row.addEventListener('click', () => openChat(cv.partner));
        row.addEventListener('touchstart', () => { row.style.background = 'var(--win-select)'; row.style.color = 'var(--win-select-text)'; }, { passive: true });
        row.addEventListener('touchend',   () => { row.style.background = ''; row.style.color = ''; });
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

      const head = document.createElement('div');
      head.style.cssText = 'flex-shrink:0;display:flex;align-items:center;gap:8px;padding:4px 8px;background:var(--win-title-active);';
      head.innerHTML = `
        <button id="cbk" class="btn98" style="padding:2px 8px;font-size:.82rem;">◄ Back</button>
        <span style="${pf}font-size:.92rem;color:#fff;flex:1;">💬 @${partner}</span>`;
      chatPanel.appendChild(head);

      const msgArea = document.createElement('div');
      msgArea.style.cssText = 'flex:1;overflow-y:auto;-webkit-overflow-scrolling:touch;padding:8px;display:flex;flex-direction:column;gap:4px;background:#fff;';
      chatPanel.appendChild(msgArea);

      const inputRow = document.createElement('div');
      inputRow.style.cssText = 'flex-shrink:0;display:flex;gap:6px;padding:5px 8px;border-top:2px solid var(--win-chrome-dark);background:var(--win-chrome);';
      inputRow.innerHTML = `
        <input id="ci" type="text" maxlength="500" placeholder="Type a message…"
          style="flex:1;${inp98}width:auto;">
        <button id="cs" class="btn98 primary" style="padding:4px 12px;">Send</button>`;
      chatPanel.appendChild(inputRow);
      chatPanel.style.transform = 'translateX(0)';

      head.querySelector('#cbk').addEventListener('click', () => {
        chatPanel.style.transform = 'translateX(100%)';
        currentChat = null;
        if (unsubChat) { unsubChat(); unsubChat = null; }
        loadConvs();
      });

      const shownIds = new Set();

      function addBubble(msg) {
        if (!msg?.id || !msg.text || shownIds.has(msg.id)) return;
        shownIds.add(msg.id);
        const mine = msg.from_user === me;
        const row  = document.createElement('div');
        row.setAttribute('data-msg-id', msg.id);
        row.style.cssText = `display:flex;flex-direction:column;align-items:${mine ? 'flex-end' : 'flex-start'};`;
        const bub = document.createElement('div');
        bub.style.cssText = `max-width:82%;padding:5px 10px;word-break:break-word;${pf}font-size:.88rem;border:2px solid;
          ${mine
            ? 'background:var(--win-select);color:var(--win-select-text);border-color:var(--win-chrome-dark) var(--win-chrome-light) var(--win-chrome-light) var(--win-chrome-dark);'
            : 'background:var(--win-chrome);color:var(--win-text);border-color:var(--win-chrome-light) var(--win-chrome-dark) var(--win-chrome-dark) var(--win-chrome-light);'}`;
        bub.textContent = msg.text;
        const ts = document.createElement('div');
        ts.setAttribute('data-ts-id', msg.id);
        ts.style.cssText = `${pf}font-size:.63rem;color:#808080;margin-top:2px;display:flex;align-items:center;gap:4px;`;
        ts.innerHTML = `<span>${MSG.formatTime(msg.ts)}</span>`;
        if (mine) {
          const ri = document.createElement('span');
          ri.setAttribute('data-receipt', msg.id);
          ri.textContent = msg.read ? '✓✓' : '✓';
          ri.title = msg.read ? 'Read' : 'Delivered';
          ts.appendChild(ri);
        }
        row.appendChild(bub); row.appendChild(ts);
        msgArea.appendChild(row);
        msgArea.scrollTop = msgArea.scrollHeight;
        if (!mine) MSG.markAsRead(me, partner, msg.id);
      }

      // Update read receipts periodically
      const receiptTimer = setInterval(async () => {
        const msgs = await MSG.getConversation(me, partner);
        msgs.filter(m => m.from_user === me && m.read).forEach(m => {
          const el = chatPanel.querySelector(`[data-receipt="${m.id}"]`);
          if (el && el.textContent === '✓') { el.textContent = '✓✓'; el.title = 'Read'; }
        });
      }, 1500);

      // Load history
      msgArea.innerHTML = `<div style="${pf}font-size:.8rem;color:#808080;text-align:center;padding:8px;">Loading…</div>`;
      const msgs = await MSG.getConversation(me, partner).catch(() => []);
      msgArea.innerHTML = '';
      if (!msgs.length) {
        const em = document.createElement('div');
        em.id = 'empty-hint';
        em.style.cssText = `${pf}font-size:.8rem;color:#808080;text-align:center;padding:24px;`;
        em.textContent = 'No messages yet. Say hello!';
        msgArea.appendChild(em);
      } else { msgs.forEach(addBubble); }

      const chatInp = inputRow.querySelector('#ci');
      const sendBtn = inputRow.querySelector('#cs');

      async function doSend() {
        const text = chatInp.value.trim();
        if (!text) return;
        chatInp.value = '';
        sendBtn.disabled = true; sendBtn.textContent = '…';
        const res = await MSG.sendMessage(me, partner, text).catch(() => ({ ok: false, error: 'Save failed' }));
        sendBtn.disabled = false; sendBtn.textContent = 'Send';
        if (res.ok) {
          document.getElementById('empty-hint')?.remove();
          addBubble(res.message);
        } else {
          showToast98('❌ Error', res.error || 'Failed');
        }
        chatInp.focus();
      }

      sendBtn.addEventListener('click', doSend);
      chatInp.addEventListener('keydown', e => { if (e.key === 'Enter') doSend(); });
      chatInp.focus();

      unsubChat = MSG.subscribeToConversation(me, partner, msg => {
        document.getElementById('empty-hint')?.remove();
        addBubble(msg);
      });

      // Cleanup receipt timer when chat panel closes
      const origBack = head.querySelector('#cbk');
      origBack.addEventListener('click', () => clearInterval(receiptTimer), { once: true });
    }

    /* ── Simulator ── */
    function openSimulator() {
      if (unsubChat) { unsubChat(); unsubChat = null; }
      openChat(MSG.SIM_PARTNER);

      // After chat opens, wire up sim-send to trigger bot reply
      setTimeout(() => {
        const ci = chatPanel.querySelector('#ci');
        const cs = chatPanel.querySelector('#cs');
        if (!ci || !cs) return;

        // Override send to also trigger sim reply
        const origClick = cs.onclick;
        cs.addEventListener('click', triggerSim, { capture: true });
        ci.addEventListener('keydown', e => { if (e.key === 'Enter') triggerSim(); }, { capture: true });

        async function triggerSim() {
          const text = ci.value.trim();
          if (!text) return;
          // Let normal send happen first, then trigger sim reply
          await new Promise(r => setTimeout(r, 100));
          // Show "typing" indicator
          const typingId = 'sim-typing-' + Date.now();
          const typRow = document.createElement('div');
          typRow.id = typingId;
          typRow.style.cssText = `${pf}font-size:.75rem;color:#808080;padding:2px 4px;`;
          typRow.textContent = 'simulator-bot is typing…';
          chatPanel.querySelector('[style*="background:#fff"]')?.appendChild(typRow);

          await MSG.simReply(MSG.getUsername());
          document.getElementById(typingId)?.remove();
        }
      }, 350);
    }

    /* ── Account panel ── */
    function showAccountPanel() {
      const d = document.createElement('div');
      d.style.cssText = 'position:fixed;inset:0;z-index:9999;background:rgba(0,0,0,.45);display:flex;align-items:center;justify-content:center;padding:16px;';
      d.innerHTML = `
        <div style="background:var(--win-chrome);border:2px solid;border-color:var(--win-chrome-light) var(--win-chrome-dark) var(--win-chrome-dark) var(--win-chrome-light);padding:14px;width:100%;max-width:280px;display:flex;flex-direction:column;gap:8px;">
          <div style="${pf}font-size:.95rem;font-weight:bold;">Account — @${me}</div>
          <div style="${pf}font-size:.74rem;color:var(--win-text-dim);line-height:1.5;">
            Messages are stored locally on this device and encoded with XOR cipher.<br>No internet connection is ever used.
          </div>
          <div style="${pf}font-size:.8rem;font-weight:bold;margin-top:4px;">Change Password</div>
          <input id="cp1" type="password" placeholder="New password" style="${inp98}">
          <input id="cp2" type="password" placeholder="Confirm" style="${inp98}">
          <div id="cpe" style="${pf}font-size:.74rem;color:#cc0000;min-height:1em;"></div>
          <div style="display:flex;gap:6px;flex-wrap:wrap;">
            <button id="cpsv" class="btn98 primary" style="flex:1;">Save Password</button>
            <button id="cplo" class="btn98" style="flex:1;">Log Out</button>
          </div>
          <button id="cpcl" class="btn98" style="align-self:flex-end;">Close</button>
        </div>`;
      document.body.appendChild(d);
      d.querySelector('#cpcl').addEventListener('click', () => d.remove());
      d.querySelector('#cplo').addEventListener('click', () => {
        MSG.logout(); d.remove();
        c.innerHTML = ''; c.style.cssText = 'width:100%;height:100%;display:flex;flex-direction:column;overflow:hidden;';
        showAuth(buildMain);
      });
      d.querySelector('#cpsv').addEventListener('click', async () => {
        const n1 = d.querySelector('#cp1').value;
        const n2 = d.querySelector('#cp2').value;
        if (n1.length < 4) { d.querySelector('#cpe').textContent = 'Min 4 chars.'; return; }
        if (n1 !== n2) { d.querySelector('#cpe').textContent = 'Passwords don\'t match.'; return; }
        const res = await MSG.changePassword(n1);
        if (res.ok) { d.remove(); showToast98('✅', 'Password updated.'); }
        else d.querySelector('#cpe').textContent = res.error || 'Failed';
      });
    }

    /* ── Transfer panel (export/import .ipm files) ── */
    function showTransferPanel() {
      const d = document.createElement('div');
      d.style.cssText = 'position:fixed;inset:0;z-index:9999;background:rgba(0,0,0,.45);display:flex;align-items:center;justify-content:center;padding:16px;';
      d.innerHTML = `
        <div style="background:var(--win-chrome);border:2px solid;border-color:var(--win-chrome-light) var(--win-chrome-dark) var(--win-chrome-dark) var(--win-chrome-light);padding:14px;width:100%;max-width:300px;display:flex;flex-direction:column;gap:8px;">
          <div style="${pf}font-size:.95rem;font-weight:bold;">📁 Message Transfer</div>
          <div style="${pf}font-size:.74rem;color:var(--win-text-dim);line-height:1.5;">
            <b>No server needed.</b> To sync messages with another device:<br>
            1. Export a .ipm file on this device<br>
            2. Share it (AirDrop, cable, email, etc.)<br>
            3. Import it on the other device<br>
            Messages merge automatically.
          </div>
          <button id="exp" class="btn98 primary" style="padding:6px 0;">⬇ Export Messages (.ipm file)</button>
          <div style="${pf}font-size:.8rem;">Import from another device:</div>
          <input id="impf" type="file" accept=".ipm" style="${pf}font-size:.78rem;">
          <button id="impb" class="btn98">⬆ Import</button>
          <div id="imps" style="${pf}font-size:.76rem;color:var(--win-text-dim);min-height:1em;"></div>
          <button id="xcl" class="btn98" style="align-self:flex-end;">Close</button>
        </div>`;
      document.body.appendChild(d);
      d.querySelector('#xcl').addEventListener('click', () => d.remove());
      d.querySelector('#exp').addEventListener('click', () => { MSG.exportMessages(); });
      d.querySelector('#impb').addEventListener('click', async () => {
        const f = d.querySelector('#impf').files[0];
        if (!f) { d.querySelector('#imps').textContent = 'Select a .ipm file first.'; return; }
        d.querySelector('#imps').textContent = 'Importing…';
        const res = await MSG.importMessages(f);
        if (res.ok) {
          d.querySelector('#imps').textContent = `✅ Imported ${res.imported} messages.`;
          loadConvs();
        } else {
          d.querySelector('#imps').textContent = '❌ ' + (res.error || 'Import failed');
        }
      });
    }

    // new chat button
    listPanel.querySelector('#mtg').addEventListener('click', () => {
      const to = listPanel.querySelector('#mti').value.trim();
      if (to) { listPanel.querySelector('#mti').value = ''; openChat(to); }
    });
    listPanel.querySelector('#mti').addEventListener('keydown', e => {
      if (e.key === 'Enter') {
        const to = listPanel.querySelector('#mti').value.trim();
        if (to) { listPanel.querySelector('#mti').value = ''; openChat(to); }
      }
    });

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

  // Entry
  if (MSG.getUsername()) { MSG.connect(); buildMain(); }
  else showAuth(buildMain);
}
