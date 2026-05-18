/* ════════════ MESSAGES — Serverless Edition ════════════ */
'use strict';

function initMessages98() {
  const c = window.content;
  c.style.cssText = 'width:100%;height:100%;display:flex;flex-direction:column;overflow:hidden;';

  const pf = 'font-family:var(--pixel-font);';
  const inp98 = 'padding:5px 8px;'+pf+'font-size:.88rem;background:#fff;border:2px solid;border-color:var(--win-chrome-dark) var(--win-chrome-light) var(--win-chrome-light) var(--win-chrome-dark);color:var(--win-text);outline:none;width:100%;box-sizing:border-box;';

  /* ══════════════════════════════════════════════
     AUTH SCREEN — register or login
  ══════════════════════════════════════════════ */
  function showAuth(onDone) {
    c.innerHTML = '';
    c.style.background = 'var(--win-chrome)';

    let mode = 'login'; // 'login' | 'register'
    const acc = MSG.getUsername();

    function render() {
      c.innerHTML = '';
      const wrap = document.createElement('div');
      wrap.style.cssText = 'flex:1;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:12px;padding:20px;overflow-y:auto;';

      const isReg = mode === 'register';
      wrap.innerHTML = `
        <div style="font-size:2rem;">💬</div>
        <div style="${pf}font-size:1.15rem;color:var(--win-text);font-weight:bold;text-align:center;">
          iPOCKET Messages
        </div>
        <div style="${pf}font-size:.8rem;color:var(--win-text-dim);text-align:center;max-width:260px;">
          ${isReg ? 'Create a new account' : 'Sign in to your account'}
        </div>

        <div style="width:100%;max-width:280px;display:flex;flex-direction:column;gap:8px;">
          <label style="${pf}font-size:.82rem;color:var(--win-text);">Username</label>
          <input id="auth-user" type="text" maxlength="24" placeholder="your-username" autocomplete="username" style="${inp98}">

          <label style="${pf}font-size:.82rem;color:var(--win-text);">Password</label>
          <input id="auth-pass" type="password" maxlength="64" placeholder="${isReg ? 'min 4 characters' : 'your password'}" autocomplete="${isReg ? 'new-password' : 'current-password'}" style="${inp98}">

          ${isReg ? `
          <label style="${pf}font-size:.82rem;color:var(--win-text);">Confirm Password</label>
          <input id="auth-pass2" type="password" maxlength="64" placeholder="confirm password" autocomplete="new-password" style="${inp98}">
          ` : ''}
        </div>

        <div id="auth-err" style="${pf}font-size:.8rem;color:#cc0000;min-height:1.2em;text-align:center;max-width:260px;"></div>
        <button id="auth-btn" class="btn98 primary" style="padding:8px 28px;font-size:.95rem;">
          ${isReg ? 'Create Account' : 'Sign In'}
        </button>
        <button id="auth-switch" class="btn98" style="padding:4px 16px;font-size:.8rem;">
          ${isReg ? '← Back to Sign In' : 'New user? Register'}
        </button>
        <div style="${pf}font-size:.68rem;color:var(--win-text-dim);text-align:center;max-width:240px;line-height:1.5;">
          Your messages are stored locally on this device and encoded. Sync across devices with GitHub Gist in Settings.
        </div>
      `;
      c.appendChild(wrap);

      const errEl = wrap.querySelector('#auth-err');
      const btn   = wrap.querySelector('#auth-btn');
      const userI = wrap.querySelector('#auth-user');
      const passI = wrap.querySelector('#auth-pass');

      wrap.querySelector('#auth-switch').addEventListener('click', () => {
        mode = mode === 'login' ? 'register' : 'login';
        render();
      });

      async function doAuth() {
        const u = userI.value.trim().toLowerCase();
        const p = passI.value;
        errEl.textContent = '';
        btn.disabled = true;
        btn.textContent = isReg ? 'Creating…' : 'Signing in…';

        if (isReg) {
          const p2 = wrap.querySelector('#auth-pass2').value;
          if (p !== p2) { errEl.textContent = 'Passwords do not match.'; btn.disabled = false; btn.textContent = 'Create Account'; return; }
          const res = await MSG.register(u, p);
          if (res.ok) { MSG.connect(); c.innerHTML = ''; c.style.cssText = 'width:100%;height:100%;display:flex;flex-direction:column;overflow:hidden;'; onDone(); }
          else { errEl.textContent = res.error; btn.disabled = false; btn.textContent = 'Create Account'; }
        } else {
          const res = await MSG.login(u, p);
          if (res.ok) { MSG.connect(); c.innerHTML = ''; c.style.cssText = 'width:100%;height:100%;display:flex;flex-direction:column;overflow:hidden;'; onDone(); }
          else { errEl.textContent = res.error; btn.disabled = false; btn.textContent = 'Sign In'; }
        }
      }

      btn.addEventListener('click', doAuth);
      [userI, passI].forEach(el => el.addEventListener('keydown', e => { if (e.key === 'Enter') doAuth(); }));
      userI.focus();
    }

    // If account exists on device, default to login; otherwise register
    mode = MSG.getUsername() ? 'login' : 'register';
    render();
  }

  /* ══════════════════════════════════════════════
     MAIN UI
  ══════════════════════════════════════════════ */
  function buildMain() {
    const me = MSG.getUsername();

    const menu = document.createElement('div');
    menu.className = 'win-menubar';
    menu.innerHTML = `
      <div class="win-menu-item" id="msg-menu-file">File</div>
      <div class="win-menu-item" id="msg-menu-sync">☁ Sync</div>
      <div class="win-menu-item" id="msg-menu-help">Help</div>`;
    c.appendChild(menu);

    // File menu → account settings
    menu.querySelector('#msg-menu-file').addEventListener('click', () => showAccountSettings());
    // Sync menu → gist settings
    menu.querySelector('#msg-menu-sync').addEventListener('click', () => showSyncSettings());

    const body = document.createElement('div');
    body.style.cssText = 'flex:1;overflow:hidden;position:relative;';
    c.appendChild(body);

    /* ── Conversation list ── */
    const listPanel = document.createElement('div');
    listPanel.style.cssText = 'position:absolute;inset:0;display:flex;flex-direction:column;background:var(--win-chrome);transition:transform .28s ease;';
    body.appendChild(listPanel);

    const newRow = document.createElement('div');
    newRow.style.cssText = 'flex-shrink:0;display:flex;gap:6px;padding:6px 8px;border-bottom:2px solid var(--win-chrome-dark);';
    newRow.innerHTML = `
      <input id="msg-to-inp" type="text" maxlength="24" placeholder="Username to message…"
        style="flex:1;${inp98}width:auto;">
      <button id="msg-to-go" class="btn98" style="white-space:nowrap;">Chat →</button>`;
    listPanel.appendChild(newRow);

    const convScroll = document.createElement('div');
    convScroll.style.cssText = 'flex:1;overflow-y:auto;-webkit-overflow-scrolling:touch;';
    listPanel.appendChild(convScroll);

    const listSb = document.createElement('div');
    listSb.className = 'win-statusbar';
    listSb.style.cssText = 'display:flex;align-items:center;justify-content:space-between;gap:6px;padding:2px 6px;flex-shrink:0;';
    listSb.innerHTML = `
      <div class="win-status-pane" style="flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">@${me}</div>
      <button id="msg-sim-btn" class="btn98" style="font-size:.7rem;padding:2px 6px;white-space:nowrap;flex-shrink:0;">🤖 Test</button>`;
    listPanel.appendChild(listSb);
    listSb.querySelector('#msg-sim-btn').addEventListener('click', () => openSimulator());

    /* ── Chat panel ── */
    const chatPanel = document.createElement('div');
    chatPanel.style.cssText = 'position:absolute;inset:0;display:flex;flex-direction:column;background:var(--win-chrome);transform:translateX(100%);transition:transform .28s cubic-bezier(.34,1.56,.64,1);';
    body.appendChild(chatPanel);

    let currentChat = null, unsubList = null, unsubChat = null;

    /* ── Load conversations ── */
    async function loadConvs() {
      convScroll.innerHTML = `<div style="padding:12px;${pf}font-size:.88rem;color:var(--win-text-dim);">Loading…</div>`;
      let convs = [];
      try { convs = await MSG.getConversations(me); } catch {}
      convScroll.innerHTML = '';
      if (!convs.length) {
        convScroll.innerHTML = `<div style="padding:20px;${pf}font-size:.85rem;color:var(--win-text-dim);text-align:center;">No conversations yet.<br>Enter a username above to start!</div>`;
        return;
      }
      convs.forEach(cv => {
        const row = document.createElement('div');
        row.style.cssText = 'display:flex;align-items:center;gap:8px;padding:8px 10px;border-bottom:1px solid var(--win-chrome-dark);cursor:pointer;-webkit-tap-highlight-color:transparent;';
        row.innerHTML = `
          <div style="font-size:1.4rem;flex-shrink:0;">👤</div>
          <div style="flex:1;min-width:0;">
            <div style="${pf}font-size:.95rem;color:var(--win-text);font-weight:bold;display:flex;align-items:center;gap:6px;">
              @${cv.partner}
              ${cv.unread > 0 ? `<span style="background:#cc0000;color:#fff;font-size:.65rem;padding:1px 5px;border-radius:2px;">${cv.unread}</span>` : ''}
            </div>
            <div style="${pf}font-size:.78rem;color:var(--win-text-dim);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${cv.text || ''}</div>
          </div>
          <div style="${pf}font-size:.72rem;color:var(--win-text-dim);flex-shrink:0;">${MSG.formatTime(cv.ts)}</div>`;
        row.addEventListener('click', () => openChat(cv.partner));
        row.addEventListener('touchstart', () => { row.style.background = 'var(--win-select)'; }, { passive: true });
        row.addEventListener('touchend',   () => { row.style.background = ''; });
        convScroll.appendChild(row);
      });
    }

    /* ── Open chat ── */
    async function openChat(partner) {
      partner = partner.trim().toLowerCase();
      if (!partner || partner === me) return;
      currentChat = partner;
      if (unsubChat) { unsubChat(); unsubChat = null; }
      chatPanel.innerHTML = '';

      const head = document.createElement('div');
      head.style.cssText = 'flex-shrink:0;display:flex;align-items:center;gap:8px;padding:4px 8px;background:var(--win-title-active);';
      head.innerHTML = `
        <button id="chat-back" class="btn98" style="padding:2px 8px;font-size:.82rem;">◄ Back</button>
        <span style="${pf}font-size:.95rem;color:#fff;flex:1;">💬 @${partner}</span>`;
      chatPanel.appendChild(head);

      const msgArea = document.createElement('div');
      msgArea.style.cssText = 'flex:1;overflow-y:auto;-webkit-overflow-scrolling:touch;padding:8px;display:flex;flex-direction:column;gap:4px;background:#fff;';
      chatPanel.appendChild(msgArea);

      const inputRow = document.createElement('div');
      inputRow.style.cssText = 'flex-shrink:0;display:flex;gap:6px;padding:5px 8px;border-top:2px solid var(--win-chrome-dark);background:var(--win-chrome);';
      inputRow.innerHTML = `
        <input id="chat-inp" type="text" maxlength="500" placeholder="Type a message…"
          style="flex:1;${inp98}width:auto;">
        <button id="chat-send" class="btn98 primary" style="padding:4px 12px;">Send</button>`;
      chatPanel.appendChild(inputRow);
      chatPanel.style.transform = 'translateX(0)';

      head.querySelector('#chat-back').addEventListener('click', () => {
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
        row.style.cssText = `display:flex;flex-direction:column;align-items:${mine ? 'flex-end' : 'flex-start'};`;
        row.setAttribute('data-msg-id', msg.id);
        const bub = document.createElement('div');
        bub.style.cssText = `max-width:82%;padding:5px 10px;word-break:break-word;${pf}font-size:.88rem;border:2px solid;
          ${mine
            ? 'background:var(--win-select);color:var(--win-select-text);border-color:var(--win-chrome-dark) var(--win-chrome-light) var(--win-chrome-light) var(--win-chrome-dark);'
            : 'background:var(--win-chrome);color:var(--win-text);border-color:var(--win-chrome-light) var(--win-chrome-dark) var(--win-chrome-dark) var(--win-chrome-light);'}`;
        bub.textContent = msg.text;
        const ts = document.createElement('div');
        ts.style.cssText = `${pf}font-size:.65rem;color:#808080;margin-top:2px;display:flex;align-items:center;gap:4px;`;
        ts.innerHTML = `<span>${MSG.formatTime(msg.ts)}</span>`;
        if (mine) {
          const ri = document.createElement('span');
          ri.textContent = msg.read ? '✓✓' : '✓';
          ri.title = msg.read ? 'Read' : 'Sent';
          ts.appendChild(ri);
        }
        row.appendChild(bub); row.appendChild(ts);
        msgArea.appendChild(row);
        msgArea.scrollTop = msgArea.scrollHeight;
        if (!mine) setTimeout(() => MSG.markAsRead(me, partner, msg.id), 500);
      }

      msgArea.innerHTML = `<div style="${pf}font-size:.82rem;color:#808080;text-align:center;padding:8px;">Loading…</div>`;
      let msgs = [];
      try { msgs = await MSG.getConversation(me, partner); } catch {}
      msgArea.innerHTML = '';
      if (!msgs.length) {
        const em = document.createElement('div');
        em.style.cssText = `${pf}font-size:.82rem;color:#808080;text-align:center;padding:24px;`;
        em.textContent = 'No messages yet. Say hello!';
        msgArea.appendChild(em);
      } else { msgs.forEach(addBubble); }

      const chatInp = chatPanel.querySelector('#chat-inp');
      const sendBtn = chatPanel.querySelector('#chat-send');
      async function doSend() {
        const text = chatInp.value.trim();
        if (!text) return;
        chatInp.value = '';
        sendBtn.disabled = true; sendBtn.textContent = 'Sending…';
        try {
          const res = await MSG.sendMessage(me, partner, text);
          if (res.ok) {
            const em = msgArea.querySelector('div');
            if (em?.textContent.includes('Say hello')) em.remove();
            addBubble(res.message);
          } else { showToast98('❌ Error', res.error || 'Failed to send'); }
        } catch { showToast98('❌ Error', 'Send failed'); }
        sendBtn.disabled = false; sendBtn.textContent = 'Send';
        chatInp.focus();
      }
      sendBtn.addEventListener('click', doSend);
      chatInp.addEventListener('keydown', e => { if (e.key === 'Enter') doSend(); });
      chatInp.focus();

      unsubChat = MSG.subscribeToConversation(me, partner, msg => {
        const em = msgArea.querySelector('div');
        if (em?.textContent.includes('Say hello')) em.remove();
        addBubble(msg);
      });
    }

    function goNewChat() {
      const to = listPanel.querySelector('#msg-to-inp').value.trim();
      if (to) { listPanel.querySelector('#msg-to-inp').value = ''; openChat(to); }
    }
    listPanel.querySelector('#msg-to-go').addEventListener('click', goNewChat);
    listPanel.querySelector('#msg-to-inp').addEventListener('keydown', e => { if (e.key === 'Enter') goNewChat(); });

    unsubList = MSG.onNewMessage(msg => {
      if (msg.to_user === me && !currentChat) loadConvs();
    });

    /* ── Simulator ── */
    function openSimulator() {
      if (unsubChat) { unsubChat(); unsubChat = null; }
      chatPanel.innerHTML = '';

      const replies = [
        "Hey! Got your message 👋","That's interesting, tell me more.","lol yeah same honestly",
        "Wait really?? No way","ok ok ok I hear you","bro I was JUST thinking about that",
        "haha yeah for sure","Nah I don't think so","omg same 💀","...","k","YES exactly!!",
        "That's wild when you think about it","ok so basically... idk actually","🤝","👀","fr fr",
      ];

      const head = document.createElement('div');
      head.style.cssText = 'flex-shrink:0;display:flex;align-items:center;gap:8px;padding:4px 8px;background:var(--win-title-active);';
      head.innerHTML = `
        <button id="sim-back" class="btn98" style="padding:2px 8px;font-size:.82rem;">◄ Back</button>
        <span style="${pf}font-size:.88rem;color:#fff;flex:1;">🤖 Simulator <span style="font-size:.7rem;opacity:.7;">(local test)</span></span>`;
      chatPanel.appendChild(head);

      const area = document.createElement('div');
      area.style.cssText = 'flex:1;overflow-y:auto;-webkit-overflow-scrolling:touch;padding:8px;display:flex;flex-direction:column;gap:4px;background:#fff;';
      chatPanel.appendChild(area);

      const typing = document.createElement('div');
      typing.style.cssText = `flex-shrink:0;${pf}font-size:.75rem;color:#808080;padding:2px 8px;min-height:1.3em;background:#fff;border-top:1px solid var(--win-chrome-dark);`;
      chatPanel.appendChild(typing);

      const inpRow = document.createElement('div');
      inpRow.style.cssText = 'flex-shrink:0;display:flex;gap:6px;padding:5px 8px;border-top:2px solid var(--win-chrome-dark);background:var(--win-chrome);';
      inpRow.innerHTML = `
        <input id="sim-inp" type="text" maxlength="500" placeholder="Type to test…" style="flex:1;${inp98}width:auto;">
        <button id="sim-send" class="btn98 primary" style="padding:4px 12px;">Send</button>`;
      chatPanel.appendChild(inpRow);
      chatPanel.style.transform = 'translateX(0)';

      function bubble(text, fromMe) {
        const row = document.createElement('div');
        row.style.cssText = `display:flex;flex-direction:column;align-items:${fromMe ? 'flex-end' : 'flex-start'};`;
        const bub = document.createElement('div');
        bub.style.cssText = `max-width:82%;padding:5px 10px;word-break:break-word;${pf}font-size:.88rem;border:2px solid;
          ${fromMe
            ? 'background:var(--win-select);color:var(--win-select-text);border-color:var(--win-chrome-dark) var(--win-chrome-light) var(--win-chrome-light) var(--win-chrome-dark);'
            : 'background:var(--win-chrome);color:var(--win-text);border-color:var(--win-chrome-light) var(--win-chrome-dark) var(--win-chrome-dark) var(--win-chrome-light);'}`;
        bub.textContent = text;
        const ts = document.createElement('div');
        ts.style.cssText = `${pf}font-size:.65rem;color:#808080;margin-top:2px;`;
        ts.textContent = new Date().toLocaleTimeString([], {hour:'2-digit',minute:'2-digit'}) + (fromMe ? ' ✓✓' : '');
        row.appendChild(bub); row.appendChild(ts);
        area.appendChild(row);
        area.scrollTop = area.scrollHeight;
      }

      bubble("Hey! I'm the test bot 🤖 — type anything to test the chat UI.", false);

      const simInp = inpRow.querySelector('#sim-inp');
      const simSnd = inpRow.querySelector('#sim-send');
      let timer = null;

      function simSend() {
        const t = simInp.value.trim();
        if (!t) return;
        simInp.value = '';
        bubble(t, true);
        simSnd.disabled = true;
        typing.textContent = 'simulator-bot is typing…';
        timer = setTimeout(() => {
          typing.textContent = '';
          bubble(replies[Math.floor(Math.random() * replies.length)], false);
          simSnd.disabled = false;
          simInp.focus();
        }, 700 + Math.random() * 1800);
      }

      simSnd.addEventListener('click', simSend);
      simInp.addEventListener('keydown', e => { if (e.key === 'Enter') simSend(); });
      simInp.focus();
      head.querySelector('#sim-back').addEventListener('click', () => {
        if (timer) clearTimeout(timer);
        chatPanel.style.transform = 'translateX(100%)';
      });
    }

    /* ── Account settings ── */
    function showAccountSettings() {
      showDialog98('Account', `Logged in as @${me}\n\nMessages are stored locally on this device.\n\nTo change password or log out, use the buttons below.`, [
        { label: 'Change Password', action: () => showChangePassword() },
        { label: 'Log Out', action: () => {
          MSG.logout();
          localStorage.removeItem('ipocket_username');
          // Reset and show auth
          c.innerHTML = '';
          c.style.cssText = 'width:100%;height:100%;display:flex;flex-direction:column;overflow:hidden;';
          showAuth(buildMain);
        }},
        { label: 'Close', primary: true },
      ]);
    }

    function showChangePassword() {
      const d = document.createElement('div');
      d.style.cssText = 'position:fixed;inset:0;z-index:9999;background:rgba(0,0,0,.5);display:flex;align-items:center;justify-content:center;';
      d.innerHTML = `
        <div style="background:var(--win-chrome);border:2px solid;border-color:var(--win-chrome-light) var(--win-chrome-dark) var(--win-chrome-dark) var(--win-chrome-light);padding:16px;min-width:240px;display:flex;flex-direction:column;gap:8px;">
          <div style="${pf}font-size:1rem;font-weight:bold;color:var(--win-text);">Change Password</div>
          <input id="cp-new" type="password" placeholder="New password" style="${inp98}">
          <input id="cp-con" type="password" placeholder="Confirm" style="${inp98}">
          <div id="cp-err" style="${pf}font-size:.78rem;color:#cc0000;min-height:1em;"></div>
          <div style="display:flex;gap:6px;justify-content:flex-end;">
            <button id="cp-ok" class="btn98 primary">Save</button>
            <button id="cp-cancel" class="btn98">Cancel</button>
          </div>
        </div>`;
      document.body.appendChild(d);
      d.querySelector('#cp-cancel').addEventListener('click', () => d.remove());
      d.querySelector('#cp-ok').addEventListener('click', () => {
        const n = d.querySelector('#cp-new').value;
        const c2 = d.querySelector('#cp-con').value;
        if (n.length < 4) { d.querySelector('#cp-err').textContent = 'Min 4 characters.'; return; }
        if (n !== c2) { d.querySelector('#cp-err').textContent = 'Passwords do not match.'; return; }
        MSG.changePassword(n);
        d.remove();
        showToast98('✅ Done', 'Password changed.');
      });
    }

    /* ── Sync / Gist settings ── */
    function showSyncSettings() {
      const cfg = MSG.getGistConfig();
      const d = document.createElement('div');
      d.style.cssText = 'position:fixed;inset:0;z-index:9999;background:rgba(0,0,0,.5);display:flex;align-items:center;justify-content:center;padding:16px;';
      d.innerHTML = `
        <div style="background:var(--win-chrome);border:2px solid;border-color:var(--win-chrome-light) var(--win-chrome-dark) var(--win-chrome-dark) var(--win-chrome-light);padding:16px;width:100%;max-width:320px;display:flex;flex-direction:column;gap:8px;max-height:90vh;overflow-y:auto;">
          <div style="${pf}font-size:1rem;font-weight:bold;color:var(--win-text);">☁ GitHub Gist Sync</div>
          <div style="${pf}font-size:.75rem;color:var(--win-text-dim);line-height:1.5;">
            Optional — sync messages across devices using a free GitHub Gist. Create a token at github.com/settings/tokens (needs <b>gist</b> scope only).
          </div>
          <label style="${pf}font-size:.82rem;color:var(--win-text);">GitHub Token</label>
          <input id="gist-tok" type="password" placeholder="ghp_xxxxxxxxxxxx" value="${cfg?.token || ''}" style="${inp98}">
          <label style="${pf}font-size:.82rem;color:var(--win-text);">Gist ID <span style="color:var(--win-text-dim);font-size:.72rem;">(auto-filled after first sync)</span></label>
          <input id="gist-id" type="text" placeholder="leave blank to create new" value="${cfg?.gistId || ''}" style="${inp98}">
          <div id="sync-status" style="${pf}font-size:.78rem;color:var(--win-text-dim);min-height:1em;"></div>
          <div style="display:flex;gap:6px;flex-wrap:wrap;justify-content:flex-end;">
            <button id="sync-now" class="btn98">Sync Now</button>
            <button id="sync-save" class="btn98 primary">Save</button>
            <button id="sync-clear" class="btn98">Clear</button>
            <button id="sync-cancel" class="btn98">Cancel</button>
          </div>
        </div>`;
      document.body.appendChild(d);
      const st = d.querySelector('#sync-status');
      d.querySelector('#sync-cancel').addEventListener('click', () => d.remove());
      d.querySelector('#sync-clear').addEventListener('click', () => { MSG.clearGistConfig(); d.remove(); showToast98('✅', 'Sync config cleared.'); });
      d.querySelector('#sync-save').addEventListener('click', () => {
        const tok = d.querySelector('#gist-tok').value.trim();
        const id  = d.querySelector('#gist-id').value.trim();
        if (tok) { MSG.setGistConfig({ token: tok, gistId: id || null }); showToast98('✅', 'Sync config saved.'); }
        d.remove();
      });
      d.querySelector('#sync-now').addEventListener('click', async () => {
        const tok = d.querySelector('#gist-tok').value.trim();
        const id  = d.querySelector('#gist-id').value.trim();
        if (!tok) { st.textContent = 'Enter a token first.'; return; }
        MSG.setGistConfig({ token: tok, gistId: id || null });
        st.textContent = 'Syncing…';
        const res = await MSG.syncGist();
        st.textContent = res.ok ? '✅ Sync complete!' : '❌ ' + (res.error || 'Sync failed');
        // Update gist ID field if it was created
        const newCfg = MSG.getGistConfig();
        if (newCfg?.gistId) d.querySelector('#gist-id').value = newCfg.gistId;
        if (res.ok) loadConvs();
      });
    }

    loadConvs();

    const openWith = localStorage.getItem('ipocket_msg_open_with');
    if (openWith) { localStorage.removeItem('ipocket_msg_open_with'); openChat(openWith); }

    return () => {
      if (unsubList) { unsubList(); unsubList = null; }
      if (unsubChat) { unsubChat(); unsubChat = null; }
    };
  }

  /* ── Entry point ── */
  // Check if account exists and has been authenticated this session
  const acct = MSG.getUsername();
  if (acct && localStorage.getItem('ipm_account')) {
    // Account exists on device — go straight to main (they registered previously)
    MSG.connect();
    buildMain();
  } else {
    showAuth(buildMain);
  }
}
