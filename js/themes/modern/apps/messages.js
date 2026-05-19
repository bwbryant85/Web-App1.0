/* ════════════════════════════════════════════════════════════
   MESSAGES — Modern / iMessage-style
   Same backend as Win98 (msg-api.js), different visual layer
════════════════════════════════════════════════════════════ */
'use strict';

function initMessages98() {
  const c = window.content;
  c.style.cssText = 'width:100%;height:100%;display:flex;flex-direction:column;overflow:hidden;background:rgba(248,249,252,.97);border-radius:28px;';

  const BLUE  = '#0B84FF';
  const SENT  = `background:${BLUE};color:#fff;border-radius:18px 18px 4px 18px;`;
  const RECV  = 'background:rgba(235,235,240,1);color:#111;border-radius:18px 18px 18px 4px;';
  const FONT  = "font-family:'Inter',system-ui,sans-serif;";
  const inp11 = `padding:11px 16px;${FONT}font-size:.92rem;background:rgba(255,255,255,.92);
    border:1px solid rgba(0,0,0,.1);border-radius:14px;outline:none;color:#111;width:100%;box-sizing:border-box;`;

  /* ── AUTH ── */
  function showAuth(onDone) {
    c.innerHTML = '';
    let mode = MSG.hasAccount() ? 'login' : 'register';

    function render() {
      c.innerHTML = '';
      const wrap = document.createElement('div');
      wrap.style.cssText = 'flex:1;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:14px;padding:28px;overflow-y:auto;';
      const isReg = mode === 'register';
      wrap.innerHTML = `
        <div style="width:72px;height:72px;background:linear-gradient(135deg,${BLUE},#5856d6);border-radius:22px;display:flex;align-items:center;justify-content:center;font-size:2.2rem;box-shadow:0 6px 28px rgba(11,132,255,.3);">💬</div>
        <div style="${FONT}font-size:1.4rem;font-weight:700;color:#111;">Messages</div>
        <div style="${FONT}font-size:.88rem;color:#888;text-align:center;max-width:260px;">
          ${isReg ? 'Create your account — stored only on this device' : 'Welcome back'}
        </div>
        <div style="width:100%;max-width:280px;display:flex;flex-direction:column;gap:10px;">
          <input id="au" type="text" maxlength="24" placeholder="Username" autocapitalize="none" style="${inp11}">
          <input id="ap" type="password" maxlength="64" placeholder="${isReg ? 'Password (min 4 chars)' : 'Password'}" style="${inp11}">
          ${isReg ? `<input id="ap2" type="password" maxlength="64" placeholder="Confirm password" style="${inp11}">` : ''}
        </div>
        <div id="ae" style="${FONT}font-size:.82rem;color:#ff3b30;min-height:1em;text-align:center;"></div>
        <button id="ab" style="width:100%;max-width:280px;padding:14px;background:${BLUE};color:#fff;${FONT}font-size:1rem;font-weight:600;border:none;border-radius:14px;cursor:pointer;">
          ${isReg ? 'Create Account' : 'Sign In'}
        </button>
        <button id="as" style="background:none;border:none;color:${BLUE};${FONT}font-size:.88rem;cursor:pointer;padding:4px;">
          ${isReg ? 'Already have an account? Sign in' : "Don't have an account? Register"}
        </button>
        <div style="${FONT}font-size:.74rem;color:#bbb;text-align:center;max-width:240px;line-height:1.5;">
          All messages saved locally. No internet required.
        </div>`;
      c.appendChild(wrap);

      const errEl = wrap.querySelector('#ae');
      const btn   = wrap.querySelector('#ab');
      const uInp  = wrap.querySelector('#au');
      const pInp  = wrap.querySelector('#ap');

      wrap.querySelector('#as').addEventListener('click', () => { mode = mode === 'login' ? 'register' : 'login'; render(); });

      async function doAuth() {
        const u = uInp.value.trim().toLowerCase();
        const p = pInp.value;
        errEl.textContent = ''; btn.disabled = true;
        if (isReg) {
          const p2 = wrap.querySelector('#ap2').value;
          if (p !== p2) { errEl.textContent = 'Passwords do not match.'; btn.disabled = false; return; }
          const res = await MSG.register(u, p);
          if (res.ok) { MSG.connect(); c.innerHTML = ''; c.style.cssText = 'width:100%;height:100%;display:flex;flex-direction:column;overflow:hidden;background:rgba(248,249,252,.97);border-radius:28px;'; onDone(); }
          else { errEl.textContent = res.error; btn.disabled = false; }
        } else {
          const res = await MSG.login(u, p);
          if (res.ok) { MSG.connect(); c.innerHTML = ''; c.style.cssText = 'width:100%;height:100%;display:flex;flex-direction:column;overflow:hidden;background:rgba(248,249,252,.97);border-radius:28px;'; onDone(); }
          else { errEl.textContent = res.error; btn.disabled = false; }
        }
      }
      btn.addEventListener('click', doAuth);
      [uInp, pInp].forEach(el => el.addEventListener('keydown', e => { if (e.key === 'Enter') doAuth(); }));
      uInp.focus();
    }
    render();
  }

  /* ── MAIN ── */
  function buildMain() {
    const me = MSG.getUsername();

    // Top bar with settings icon
    const topbar = document.createElement('div');
    topbar.style.cssText = `flex-shrink:0;padding:14px 18px 8px;display:flex;align-items:center;justify-content:space-between;`;
    topbar.innerHTML = `
      <div style="${FONT}font-size:1.35rem;font-weight:700;color:#111;">Messages</div>
      <div style="display:flex;gap:10px;align-items:center;">
        <span style="${FONT}font-size:.78rem;color:#888;">@${me}</span>
        <button id="m11-gear" style="background:none;border:none;font-size:1.2rem;cursor:pointer;padding:4px;min-width:36px;min-height:36px;" title="Settings">⚙️</button>
      </div>`;
    c.appendChild(topbar);
    topbar.querySelector('#m11-gear').addEventListener('click', () => showSettingsSheet());

    const newBar = document.createElement('div');
    newBar.style.cssText = 'flex-shrink:0;display:flex;gap:8px;padding:4px 16px 12px;';
    newBar.innerHTML = `
      <input id="mti" type="text" maxlength="24" placeholder="Message someone by username…" autocapitalize="none"
        style="flex:1;${inp11}border-radius:12px;">
      <button id="mtg" style="padding:10px 14px;background:${BLUE};color:#fff;${FONT}font-size:.85rem;font-weight:600;border:none;border-radius:12px;cursor:pointer;white-space:nowrap;min-width:44px;min-height:44px;">→</button>`;
    c.appendChild(newBar);

    const body = document.createElement('div');
    body.style.cssText = 'flex:1;overflow:hidden;position:relative;';
    c.appendChild(body);

    const listPanel = document.createElement('div');
    listPanel.style.cssText = 'position:absolute;inset:0;display:flex;flex-direction:column;transition:transform .32s cubic-bezier(.34,1,.64,1);overflow:hidden;';
    body.appendChild(listPanel);

    const convScroll = document.createElement('div');
    convScroll.style.cssText = 'flex:1;overflow-y:auto;-webkit-overflow-scrolling:touch;';
    listPanel.appendChild(convScroll);

    // Sim button in bottom safe area
    const simBar = document.createElement('div');
    simBar.style.cssText = `flex-shrink:0;padding:6px 16px 10px;display:flex;justify-content:flex-end;`;
    simBar.innerHTML = `<button id="sim11" style="padding:7px 14px;background:rgba(11,132,255,.1);color:${BLUE};${FONT}font-size:.82rem;font-weight:500;border:none;border-radius:10px;cursor:pointer;">🤖 Simulator</button>`;
    listPanel.appendChild(simBar);
    simBar.querySelector('#sim11').addEventListener('click', () => openSimulator());

    const chatPanel = document.createElement('div');
    chatPanel.style.cssText = `position:absolute;inset:0;display:flex;flex-direction:column;background:rgba(248,249,252,.97);transform:translateX(100%);transition:transform .32s cubic-bezier(.34,1,.64,1);`;
    body.appendChild(chatPanel);

    let currentChat = null, unsubList = null, unsubChat = null;

    async function loadConvs() {
      convScroll.innerHTML = `<div style="${FONT}padding:20px;font-size:.88rem;color:#aaa;text-align:center;">Loading…</div>`;
      const convs = await MSG.getConversations(me).catch(() => []);
      convScroll.innerHTML = '';
      if (!convs.length) {
        convScroll.innerHTML = `
          <div style="padding:40px 20px;text-align:center;display:flex;flex-direction:column;align-items:center;gap:10px;">
            <div style="font-size:2.5rem;">💬</div>
            <div style="${FONT}font-size:1rem;font-weight:600;color:#111;">No conversations yet</div>
            <div style="${FONT}font-size:.85rem;color:#aaa;">Enter a username above to start chatting</div>
          </div>`;
        return;
      }
      convs.forEach(cv => {
        const row = document.createElement('div');
        const init = cv.partner.charAt(0).toUpperCase();
        const hue  = (cv.partner.charCodeAt(0) * 47) % 360;
        row.style.cssText = 'display:flex;align-items:center;gap:12px;padding:11px 18px;cursor:pointer;border-bottom:1px solid rgba(0,0,0,.05);-webkit-tap-highlight-color:transparent;';
        row.innerHTML = `
          <div style="width:44px;height:44px;border-radius:22px;background:hsl(${hue},60%,55%);display:flex;align-items:center;justify-content:center;font-size:1.15rem;color:#fff;${FONT}font-weight:700;flex-shrink:0;">${init}</div>
          <div style="flex:1;min-width:0;">
            <div style="${FONT}display:flex;align-items:center;gap:6px;">
              <span style="font-size:.95rem;font-weight:600;color:#111;">@${cv.partner}</span>
              ${cv.unread > 0 ? `<span style="width:18px;height:18px;background:${BLUE};color:#fff;${FONT}font-size:.62rem;font-weight:700;border-radius:9px;display:inline-flex;align-items:center;justify-content:center;">${cv.unread}</span>` : ''}
              <span style="margin-left:auto;font-size:.72rem;color:#aaa;">${MSG.formatTime(cv.ts)}</span>
            </div>
            <div style="${FONT}font-size:.83rem;color:#888;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;margin-top:1px;">${cv.text || ''}</div>
          </div>`;
        row.addEventListener('click', () => openChat(cv.partner));
        row.addEventListener('touchstart', () => { row.style.background = 'rgba(0,0,0,.04)'; }, { passive: true });
        row.addEventListener('touchend',   () => { row.style.background = ''; });
        convScroll.appendChild(row);
      });
    }

    async function openChat(partner) {
      partner = partner.trim().toLowerCase();
      if (!partner || partner === me) return;
      currentChat = partner;
      if (unsubChat) { unsubChat(); unsubChat = null; }
      chatPanel.innerHTML = '';

      const init = partner.charAt(0).toUpperCase();
      const hue  = (partner.charCodeAt(0) * 47) % 360;

      const hdr = document.createElement('div');
      hdr.style.cssText = `flex-shrink:0;display:flex;align-items:center;gap:10px;padding:12px 14px;border-bottom:1px solid rgba(0,0,0,.06);background:rgba(248,249,252,.95);backdrop-filter:blur(16px);-webkit-backdrop-filter:blur(16px);`;
      hdr.innerHTML = `
        <button id="cbk" style="background:none;border:none;color:${BLUE};${FONT}font-size:1rem;cursor:pointer;padding:8px;min-width:44px;min-height:44px;display:flex;align-items:center;border-radius:10px;-webkit-tap-highlight-color:transparent;">‹ Back</button>
        <div style="width:34px;height:34px;border-radius:17px;background:hsl(${hue},60%,55%);display:flex;align-items:center;justify-content:center;font-size:.95rem;color:#fff;${FONT}font-weight:700;flex-shrink:0;">${init}</div>
        <div style="${FONT}font-size:.98rem;font-weight:600;color:#111;">@${partner}</div>`;
      chatPanel.appendChild(hdr);

      const msgArea = document.createElement('div');
      msgArea.style.cssText = 'flex:1;overflow-y:auto;-webkit-overflow-scrolling:touch;padding:12px 14px;display:flex;flex-direction:column;gap:2px;';
      chatPanel.appendChild(msgArea);

      const inputBar = document.createElement('div');
      inputBar.style.cssText = `flex-shrink:0;display:flex;align-items:flex-end;gap:8px;padding:8px 14px 14px;border-top:1px solid rgba(0,0,0,.06);background:rgba(248,249,252,.95);backdrop-filter:blur(16px);-webkit-backdrop-filter:blur(16px);`;
      inputBar.innerHTML = `
        <input id="ci" type="text" maxlength="500" placeholder="iMessage"
          style="flex:1;padding:10px 16px;${FONT}font-size:.92rem;background:rgba(255,255,255,.95);border:1px solid rgba(0,0,0,.1);border-radius:20px;outline:none;color:#111;width:auto;box-sizing:border-box;">
        <button id="cs" style="width:34px;height:34px;background:${BLUE};border:none;border-radius:17px;display:flex;align-items:center;justify-content:center;cursor:pointer;flex-shrink:0;-webkit-tap-highlight-color:transparent;transition:transform .1s ease;">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none"><path d="M3 20l19-8L3 4v6l14 2-14 2v6z" fill="white"/></svg>
        </button>`;
      chatPanel.appendChild(inputBar);
      chatPanel.style.transform = 'translateX(0)';

      hdr.querySelector('#cbk').addEventListener('click', () => {
        chatPanel.style.transform = 'translateX(100%)';
        currentChat = null;
        if (unsubChat) { unsubChat(); unsubChat = null; }
        clearInterval(receiptTimer);
        loadConvs();
      });

      const shownIds = new Set();

      function addBubble(msg) {
        if (!msg?.id || !msg.text || shownIds.has(msg.id)) return;
        shownIds.add(msg.id);
        const mine = msg.from_user === me;
        const grp  = document.createElement('div');
        grp.style.cssText = `display:flex;flex-direction:column;align-items:${mine ? 'flex-end' : 'flex-start'};margin-bottom:1px;`;
        const bub = document.createElement('div');
        bub.style.cssText = `max-width:78%;padding:10px 14px;${FONT}font-size:.9rem;line-height:1.4;word-break:break-word;${mine ? SENT : RECV}`;
        bub.textContent = msg.text;
        const ts = document.createElement('div');
        ts.style.cssText = `${FONT}font-size:.65rem;color:#aaa;margin-top:3px;${mine ? 'text-align:right;' : ''}display:flex;align-items:center;gap:3px;justify-content:${mine ? 'flex-end' : 'flex-start'};`;
        ts.innerHTML = `<span>${MSG.formatTime(msg.ts)}</span>`;
        if (mine) {
          const ri = document.createElement('span');
          ri.setAttribute('data-receipt', msg.id);
          ri.style.color = msg.read ? BLUE : '#aaa';
          ri.textContent = msg.read ? '✓✓' : '✓';
          ts.appendChild(ri);
        }
        grp.appendChild(bub); grp.appendChild(ts);
        msgArea.appendChild(grp);
        msgArea.scrollTop = msgArea.scrollHeight;
        if (!mine) MSG.markAsRead(me, partner, msg.id);
      }

      const receiptTimer = setInterval(async () => {
        const msgs = await MSG.getConversation(me, partner);
        msgs.filter(m => m.from_user === me && m.read).forEach(m => {
          const el = chatPanel.querySelector(`[data-receipt="${m.id}"]`);
          if (el && el.textContent === '✓') { el.textContent = '✓✓'; el.style.color = BLUE; }
        });
      }, 1500);

      msgArea.innerHTML = `<div style="${FONT}font-size:.85rem;color:#aaa;text-align:center;padding:20px;">Loading…</div>`;
      const msgs = await MSG.getConversation(me, partner).catch(() => []);
      msgArea.innerHTML = '';
      if (!msgs.length) {
        const em = document.createElement('div');
        em.id = 'empty-hint';
        em.style.cssText = `display:flex;flex-direction:column;align-items:center;gap:10px;padding:36px 16px;`;
        em.innerHTML = `
          <div style="width:54px;height:54px;background:hsl(${hue},60%,55%);border-radius:27px;display:flex;align-items:center;justify-content:center;font-size:1.6rem;color:#fff;${FONT}font-weight:700;">${init}</div>
          <div style="${FONT}font-size:.95rem;font-weight:600;color:#111;">@${partner}</div>
          <div style="${FONT}font-size:.83rem;color:#aaa;">Say hello!</div>`;
        msgArea.appendChild(em);
      } else { msgs.forEach(addBubble); }

      const chatInp = inputBar.querySelector('#ci');
      const sendBtn = inputBar.querySelector('#cs');

      async function doSend() {
        const text = chatInp.value.trim();
        if (!text) return;
        chatInp.value = '';
        sendBtn.style.transform = 'scale(.85)';
        setTimeout(() => { sendBtn.style.transform = ''; }, 110);
        const res = await MSG.sendMessage(me, partner, text).catch(() => ({ ok: false, error: 'Save failed' }));
        if (res.ok) {
          document.getElementById('empty-hint')?.remove();
          addBubble(res.message);
        } else {
          showToast98('Error', res.error || 'Failed');
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
    }

    /* Simulator */
    function openSimulator() {
      openChat(MSG.SIM_PARTNER);
      setTimeout(() => {
        const ci = chatPanel.querySelector('#ci');
        const cs = chatPanel.querySelector('#cs');
        if (!ci || !cs) return;
        cs.addEventListener('click', triggerSim, { capture: true });
        ci.addEventListener('keydown', e => { if (e.key === 'Enter') triggerSim(); }, { capture: true });
        async function triggerSim() {
          const text = ci.value.trim();
          if (!text) return;
          await new Promise(r => setTimeout(r, 100));
          const ta = chatPanel.querySelector('[style*="overflow-y:auto"]');
          if (ta) {
            const td = document.createElement('div');
            td.id = 'sim-typing';
            td.style.cssText = `${FONT}font-size:.78rem;color:#aaa;padding:4px 0;`;
            td.textContent = 'simulator-bot is typing…';
            ta.appendChild(td);
            ta.scrollTop = ta.scrollHeight;
          }
          await MSG.simReply(MSG.getUsername());
          document.getElementById('sim-typing')?.remove();
        }
      }, 350);
    }

    /* Settings bottom sheet */
    function showSettingsSheet() {
      const d = document.createElement('div');
      d.style.cssText = 'position:fixed;inset:0;z-index:9999;background:rgba(0,0,0,.4);display:flex;align-items:flex-end;justify-content:center;padding-bottom:env(safe-area-inset-bottom,0);';
      d.innerHTML = `
        <div style="background:#f9f9f9;border-radius:18px 18px 0 0;width:100%;max-width:420px;padding:20px;display:flex;flex-direction:column;gap:12px;">
          <div style="${FONT}font-size:1.1rem;font-weight:700;color:#111;">Settings</div>
          <div style="${FONT}font-size:.85rem;color:#888;">Logged in as @${me}</div>
          <div style="background:#fff;border-radius:14px;overflow:hidden;border:1px solid rgba(0,0,0,.08);">
            <div id="s11-cp" style="${FONT}font-size:.95rem;color:#111;padding:14px 18px;border-bottom:1px solid rgba(0,0,0,.06);cursor:pointer;">🔑 Change Password</div>
            <div id="s11-tr" style="${FONT}font-size:.95rem;color:#111;padding:14px 18px;border-bottom:1px solid rgba(0,0,0,.06);cursor:pointer;">📁 Export / Import Messages</div>
            <div id="s11-lo" style="${FONT}font-size:.95rem;color:#ff3b30;padding:14px 18px;cursor:pointer;">Sign Out</div>
          </div>
          <div style="${FONT}font-size:.74rem;color:#bbb;line-height:1.5;text-align:center;">All messages stored locally and encoded.<br>No internet or server ever used.</div>
          <button id="s11-cl" style="background:rgba(0,0,0,.08);border:none;border-radius:12px;padding:13px;${FONT}font-size:.95rem;font-weight:600;color:#111;cursor:pointer;">Done</button>
        </div>`;
      document.body.appendChild(d);
      d.querySelector('#s11-cl').addEventListener('click', () => d.remove());
      d.querySelector('#s11-lo').addEventListener('click', () => {
        MSG.logout(); d.remove();
        c.innerHTML = ''; c.style.cssText = 'width:100%;height:100%;display:flex;flex-direction:column;overflow:hidden;background:rgba(248,249,252,.97);border-radius:28px;';
        showAuth(buildMain);
      });
      d.querySelector('#s11-cp').addEventListener('click', () => { d.remove(); showChangePassword(); });
      d.querySelector('#s11-tr').addEventListener('click', () => { d.remove(); showTransfer(); });
      d.addEventListener('click', e => { if (e.target === d) d.remove(); });
    }

    function showChangePassword() {
      const d = document.createElement('div');
      d.style.cssText = 'position:fixed;inset:0;z-index:9999;background:rgba(0,0,0,.4);display:flex;align-items:center;justify-content:center;padding:20px;';
      d.innerHTML = `
        <div style="background:#f9f9f9;border-radius:18px;padding:20px;width:100%;max-width:300px;display:flex;flex-direction:column;gap:10px;">
          <div style="${FONT}font-size:1.05rem;font-weight:700;color:#111;">Change Password</div>
          <input id="cp1" type="password" placeholder="New password" style="${inp11}">
          <input id="cp2" type="password" placeholder="Confirm" style="${inp11}">
          <div id="cpe" style="${FONT}font-size:.82rem;color:#ff3b30;min-height:1em;"></div>
          <button id="cpsv" style="padding:13px;background:${BLUE};color:#fff;${FONT}font-size:.95rem;font-weight:600;border:none;border-radius:12px;cursor:pointer;">Save</button>
          <button id="cpcl" style="padding:11px;background:rgba(0,0,0,.07);border:none;border-radius:12px;${FONT}font-size:.92rem;cursor:pointer;color:#111;">Cancel</button>
        </div>`;
      document.body.appendChild(d);
      d.querySelector('#cpcl').addEventListener('click', () => d.remove());
      d.querySelector('#cpsv').addEventListener('click', async () => {
        const n1 = d.querySelector('#cp1').value;
        const n2 = d.querySelector('#cp2').value;
        if (n1.length < 4) { d.querySelector('#cpe').textContent = 'Min 4 characters.'; return; }
        if (n1 !== n2) { d.querySelector('#cpe').textContent = "Passwords don't match."; return; }
        const res = await MSG.changePassword(n1);
        d.remove();
        if (res.ok) showToast98('✅ Done', 'Password updated.');
      });
    }

    function showTransfer() {
      const d = document.createElement('div');
      d.style.cssText = 'position:fixed;inset:0;z-index:9999;background:rgba(0,0,0,.4);display:flex;align-items:center;justify-content:center;padding:20px;';
      d.innerHTML = `
        <div style="background:#f9f9f9;border-radius:18px;padding:20px;width:100%;max-width:310px;display:flex;flex-direction:column;gap:10px;">
          <div style="${FONT}font-size:1.05rem;font-weight:700;color:#111;">📁 Message Transfer</div>
          <div style="${FONT}font-size:.83rem;color:#888;line-height:1.55;">
            Sync with another device — no server needed.<br>
            Export a .ipm file → share it → import on the other device.
          </div>
          <button id="exp" style="padding:13px;background:${BLUE};color:#fff;${FONT}font-size:.92rem;font-weight:600;border:none;border-radius:12px;cursor:pointer;">⬇ Export Messages</button>
          <div style="${FONT}font-size:.85rem;color:#555;font-weight:500;">Import from file</div>
          <input id="impf" type="file" accept=".ipm" style="${FONT}font-size:.82rem;">
          <button id="impb" style="padding:11px;background:rgba(0,0,0,.07);border:none;border-radius:12px;${FONT}font-size:.9rem;cursor:pointer;color:#111;">⬆ Import</button>
          <div id="imps" style="${FONT}font-size:.78rem;color:#888;min-height:1em;"></div>
          <button id="xcl" style="padding:11px;background:rgba(0,0,0,.07);border:none;border-radius:12px;${FONT}font-size:.92rem;cursor:pointer;color:#111;">Done</button>
        </div>`;
      document.body.appendChild(d);
      d.querySelector('#xcl').addEventListener('click', () => d.remove());
      d.querySelector('#exp').addEventListener('click', () => MSG.exportMessages());
      d.querySelector('#impb').addEventListener('click', async () => {
        const f = d.querySelector('#impf').files[0];
        if (!f) { d.querySelector('#imps').textContent = 'Pick a .ipm file first.'; return; }
        d.querySelector('#imps').textContent = 'Importing…';
        const res = await MSG.importMessages(f);
        if (res.ok) { d.querySelector('#imps').textContent = `✅ ${res.imported} messages imported.`; loadConvs(); }
        else d.querySelector('#imps').textContent = '❌ ' + (res.error || 'Import failed');
      });
    }

    newBar.querySelector('#mtg').addEventListener('click', () => {
      const to = newBar.querySelector('#mti').value.trim();
      if (to) { newBar.querySelector('#mti').value = ''; openChat(to); }
    });
    newBar.querySelector('#mti').addEventListener('keydown', e => {
      if (e.key === 'Enter') {
        const to = newBar.querySelector('#mti').value.trim();
        if (to) { newBar.querySelector('#mti').value = ''; openChat(to); }
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

  if (MSG.getUsername()) { MSG.connect(); buildMain(); }
  else showAuth(buildMain);
}
