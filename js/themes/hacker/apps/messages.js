/* ════════════════════════════════════════════════════════════
   MESSAGES — Hacker Theme
   Same backend, green terminal aesthetic
════════════════════════════════════════════════════════════ */
'use strict';

function initMessages98() {
  const c = window.content;
  const BG   = '#050508';
  const GR   = '#00ff41';
  const DIM  = '#006600';
  const WARN = '#ff4444';
  const BORD = `1px solid ${DIM}`;
  const FONT = "font-family:'Share Tech Mono',monospace;";
  c.style.cssText = `width:100%;height:100%;display:flex;flex-direction:column;overflow:hidden;background:${BG};`;

  const inpHk = `padding:7px 10px;${FONT}font-size:.82rem;background:#000;border:1px solid ${DIM};
    color:${GR};outline:none;caret-color:${GR};width:100%;box-sizing:border-box;`;

  /* ── AUTH ── */
  function showAuth(onDone) {
    c.innerHTML = '';
    let mode = MSG.hasAccount() ? 'login' : 'register';

    function render() {
      c.innerHTML = '';
      const wrap = document.createElement('div');
      wrap.style.cssText = `flex:1;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:12px;padding:20px;background:${BG};overflow-y:auto;`;
      const isReg = mode === 'register';
      wrap.innerHTML = `
        <div style="${FONT}font-size:1.4rem;color:${GR};text-shadow:0 0 12px ${GR};letter-spacing:.08em;">[ iPOCKET MSG ]</div>
        <div style="${FONT}font-size:.7rem;color:${DIM};letter-spacing:.12em;">${isReg ? 'CREATE ACCOUNT' : 'AUTHENTICATE'}</div>
        <div style="width:100%;max-width:300px;border:${BORD};padding:14px;background:rgba(0,255,65,.02);display:flex;flex-direction:column;gap:8px;">
          <div style="${FONT}font-size:.68rem;color:${DIM};">HANDLE:</div>
          <input id="au" type="text" maxlength="24" placeholder="your-handle" autocapitalize="none" style="${inpHk}">
          <div style="${FONT}font-size:.68rem;color:${DIM};margin-top:4px;">PASSWORD:</div>
          <input id="ap" type="password" maxlength="64" placeholder="${isReg ? 'min 4 chars' : '••••••••'}" style="${inpHk}">
          ${isReg ? `<div style="${FONT}font-size:.68rem;color:${DIM};margin-top:4px;">CONFIRM:</div>
          <input id="ap2" type="password" maxlength="64" placeholder="confirm password" style="${inpHk}">` : ''}
          <div id="ae" style="${FONT}font-size:.7rem;color:${WARN};min-height:1em;margin-top:2px;"></div>
          <button id="ab" style="margin-top:4px;width:100%;padding:9px;${FONT}font-size:.8rem;background:transparent;border:1px solid ${GR};color:${GR};cursor:pointer;letter-spacing:.12em;text-transform:uppercase;">
            [ ${isReg ? 'CREATE ACCOUNT' : 'AUTHENTICATE'} ]
          </button>
        </div>
        <button id="as" style="background:none;border:none;color:${DIM};${FONT}font-size:.68rem;cursor:pointer;letter-spacing:.08em;">
          ${isReg ? '> ALREADY HAVE ACCOUNT? LOGIN' : '> NO ACCOUNT? REGISTER'}
        </button>
        <div style="${FONT}font-size:.62rem;color:${DIM};text-align:center;letter-spacing:.06em;line-height:1.5;">ALL DATA STORED LOCALLY · ENCODED · NO SERVER</div>`;
      c.appendChild(wrap);

      const errEl = wrap.querySelector('#ae');
      const btn   = wrap.querySelector('#ab');
      const uInp  = wrap.querySelector('#au');
      const pInp  = wrap.querySelector('#ap');

      wrap.querySelector('#as').addEventListener('click', () => { mode = mode === 'login' ? 'register' : 'login'; render(); });

      async function doAuth() {
        const u = uInp.value.trim().toLowerCase();
        const p = pInp.value;
        errEl.textContent = ''; btn.disabled = true; btn.textContent = isReg ? '[ CREATING... ]' : '[ VERIFYING... ]';
        if (isReg) {
          const p2 = wrap.querySelector('#ap2').value;
          if (p !== p2) { errEl.textContent = '> ERROR: passwords do not match'; btn.disabled = false; btn.textContent = '[ CREATE ACCOUNT ]'; return; }
          const res = await MSG.register(u, p);
          if (res.ok) { MSG.connect(); c.innerHTML = ''; c.style.cssText = `width:100%;height:100%;display:flex;flex-direction:column;overflow:hidden;background:${BG};`; onDone(); }
          else { errEl.textContent = '> ERROR: ' + res.error; btn.disabled = false; btn.textContent = '[ CREATE ACCOUNT ]'; }
        } else {
          const res = await MSG.login(u, p);
          if (res.ok) { MSG.connect(); c.innerHTML = ''; c.style.cssText = `width:100%;height:100%;display:flex;flex-direction:column;overflow:hidden;background:${BG};`; onDone(); }
          else { errEl.textContent = '> ERROR: ' + res.error; btn.disabled = false; btn.textContent = '[ AUTHENTICATE ]'; }
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

    const hdr = document.createElement('div');
    hdr.style.cssText = `flex-shrink:0;display:flex;align-items:center;justify-content:space-between;padding:8px 12px;border-bottom:${BORD};`;
    hdr.innerHTML = `
      <span style="${FONT}font-size:.82rem;color:${GR};text-shadow:0 0 8px ${GR};letter-spacing:.1em;">[ MESSAGES ]</span>
      <div style="display:flex;gap:8px;align-items:center;">
        <span style="${FONT}font-size:.65rem;color:${DIM};">@${me}</span>
        <button id="hk-gear" style="background:none;border:1px solid ${DIM};color:${DIM};${FONT}font-size:.65rem;cursor:pointer;padding:3px 7px;">CFG</button>
      </div>`;
    c.appendChild(hdr);
    hdr.querySelector('#hk-gear').addEventListener('click', () => showConfigPanel());

    const newRow = document.createElement('div');
    newRow.style.cssText = `flex-shrink:0;display:flex;gap:6px;padding:7px 10px;border-bottom:${BORD};`;
    newRow.innerHTML = `
      <input id="mti" type="text" maxlength="24" placeholder="target handle…" autocapitalize="none"
        style="flex:1;${inpHk}width:auto;">
      <button id="mtg" style="padding:6px 12px;${FONT}font-size:.72rem;background:transparent;border:1px solid ${GR};color:${GR};cursor:pointer;white-space:nowrap;">OPEN →</button>`;
    c.appendChild(newRow);

    const body = document.createElement('div');
    body.style.cssText = 'flex:1;overflow:hidden;position:relative;';
    c.appendChild(body);

    const listPanel = document.createElement('div');
    listPanel.style.cssText = `position:absolute;inset:0;display:flex;flex-direction:column;background:${BG};transition:transform .28s ease;`;
    body.appendChild(listPanel);

    const convScroll = document.createElement('div');
    convScroll.style.cssText = 'flex:1;overflow-y:auto;-webkit-overflow-scrolling:touch;';
    listPanel.appendChild(convScroll);

    const statusBar = document.createElement('div');
    statusBar.style.cssText = `flex-shrink:0;padding:4px 10px;border-top:${BORD};display:flex;justify-content:space-between;align-items:center;`;
    statusBar.innerHTML = `
      <span style="${FONT}font-size:.62rem;color:${DIM};">CONN:LOCAL · @${me}</span>
      <button id="sim-hk" style="padding:2px 8px;${FONT}font-size:.65rem;background:transparent;border:1px solid ${DIM};color:${DIM};cursor:pointer;">[ SIM ]</button>`;
    listPanel.appendChild(statusBar);
    statusBar.querySelector('#sim-hk').addEventListener('click', () => openSimulator());

    const chatPanel = document.createElement('div');
    chatPanel.style.cssText = `position:absolute;inset:0;display:flex;flex-direction:column;background:${BG};transform:translateX(100%);transition:transform .28s cubic-bezier(.34,1.56,.64,1);`;
    body.appendChild(chatPanel);

    let currentChat = null, unsubList = null, unsubChat = null;

    async function loadConvs() {
      convScroll.innerHTML = `<div style="${FONT}padding:12px;font-size:.72rem;color:${DIM};">> scanning for conversations…</div>`;
      const convs = await MSG.getConversations(me).catch(() => []);
      convScroll.innerHTML = '';
      if (!convs.length) {
        convScroll.innerHTML = `<div style="${FONT}padding:20px 14px;font-size:.72rem;color:${DIM};text-align:center;">
          > no transmissions found<br>> enter a handle above to open a channel</div>`;
        return;
      }
      convs.forEach(cv => {
        const row = document.createElement('div');
        row.style.cssText = `display:flex;align-items:center;gap:8px;padding:9px 12px;border-bottom:${BORD};cursor:pointer;-webkit-tap-highlight-color:transparent;`;
        row.innerHTML = `
          <span style="${FONT}font-size:.9rem;color:${GR};flex-shrink:0;">▶</span>
          <div style="flex:1;min-width:0;">
            <div style="${FONT}font-size:.8rem;color:${GR};display:flex;align-items:center;gap:6px;">
              @${cv.partner}
              ${cv.unread > 0 ? `<span style="background:#cc0000;color:#fff;font-size:.58rem;padding:1px 4px;">${cv.unread}</span>` : ''}
            </div>
            <div style="${FONT}font-size:.68rem;color:${DIM};white-space:nowrap;overflow:hidden;text-overflow:ellipsis;margin-top:1px;">${cv.text || ''}</div>
          </div>
          <span style="${FONT}font-size:.62rem;color:${DIM};flex-shrink:0;">${MSG.formatTime(cv.ts)}</span>`;
        row.addEventListener('click', () => openChat(cv.partner));
        row.addEventListener('touchstart', () => { row.style.background = `rgba(0,255,65,.05)`; }, { passive: true });
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

      const chatHdr = document.createElement('div');
      chatHdr.style.cssText = `flex-shrink:0;display:flex;align-items:center;gap:8px;padding:7px 10px;border-bottom:${BORD};`;
      chatHdr.innerHTML = `
        <button id="cbk" style="padding:5px 10px;${FONT}font-size:.68rem;background:transparent;border:1px solid ${DIM};color:${DIM};cursor:pointer;min-width:44px;min-height:44px;">◄ BACK</button>
        <span style="${FONT}font-size:.8rem;color:${GR};text-shadow:0 0 8px ${GR};">CHANNEL: @${partner}</span>`;
      chatPanel.appendChild(chatHdr);

      const msgArea = document.createElement('div');
      msgArea.style.cssText = `flex:1;overflow-y:auto;-webkit-overflow-scrolling:touch;padding:8px;display:flex;flex-direction:column;gap:5px;`;
      chatPanel.appendChild(msgArea);

      const inputRow = document.createElement('div');
      inputRow.style.cssText = `flex-shrink:0;display:flex;align-items:center;gap:6px;padding:7px 10px;border-top:${BORD};`;
      inputRow.innerHTML = `
        <span style="${FONT}font-size:.8rem;color:${GR};">></span>
        <input id="ci" type="text" maxlength="500" placeholder="encrypt and send…" style="flex:1;${inpHk}width:auto;">
        <button id="cs" style="padding:7px 14px;${FONT}font-size:.72rem;background:transparent;border:1px solid ${GR};color:${GR};cursor:pointer;min-width:44px;min-height:44px;letter-spacing:.04em;">TX</button>`;
      chatPanel.appendChild(inputRow);
      chatPanel.style.transform = 'translateX(0)';

      chatHdr.querySelector('#cbk').addEventListener('click', () => {
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
        const row  = document.createElement('div');
        row.style.cssText = `display:flex;flex-direction:column;align-items:${mine ? 'flex-end' : 'flex-start'};`;
        const bub = document.createElement('div');
        bub.style.cssText = `max-width:82%;padding:6px 11px;word-break:break-word;${FONT}font-size:.8rem;
          ${mine
            ? `background:rgba(0,255,65,.08);border:1px solid ${GR};color:${GR};`
            : `background:rgba(0,80,0,.15);border:1px solid ${DIM};color:#aaffaa;`}`;
        const pfx = document.createElement('span');
        pfx.style.cssText = `font-size:.6rem;color:${DIM};display:block;margin-bottom:2px;`;
        pfx.textContent = mine ? `[${me}]:` : `[${partner}]:`;
        bub.appendChild(pfx);
        bub.appendChild(document.createTextNode(msg.text));
        const ts = document.createElement('div');
        ts.style.cssText = `${FONT}font-size:.6rem;color:${DIM};margin-top:3px;display:flex;align-items:center;gap:4px;`;
        ts.innerHTML = `<span>${MSG.formatTime(msg.ts)}</span>`;
        if (mine) {
          const ri = document.createElement('span');
          ri.setAttribute('data-receipt', msg.id);
          ri.textContent = msg.read ? 'READ' : 'SENT';
          ri.style.cssText = `font-size:.58rem;color:${msg.read ? GR : DIM};border:1px solid ${msg.read ? GR : DIM};padding:0 3px;`;
          ts.appendChild(ri);
        }
        row.appendChild(bub); row.appendChild(ts);
        msgArea.appendChild(row);
        msgArea.scrollTop = msgArea.scrollHeight;
        if (!mine) MSG.markAsRead(me, partner, msg.id);
      }

      const receiptTimer = setInterval(async () => {
        const msgs = await MSG.getConversation(me, partner);
        msgs.filter(m => m.from_user === me && m.read).forEach(m => {
          const el = chatPanel.querySelector(`[data-receipt="${m.id}"]`);
          if (el && el.textContent === 'SENT') { el.textContent = 'READ'; el.style.color = GR; el.style.borderColor = GR; }
        });
      }, 1500);

      msgArea.innerHTML = `<div style="${FONT}font-size:.72rem;color:${DIM};text-align:center;padding:10px;">> loading channel…</div>`;
      const msgs = await MSG.getConversation(me, partner).catch(() => []);
      msgArea.innerHTML = '';
      if (!msgs.length) {
        const em = document.createElement('div');
        em.id = 'empty-hint';
        em.style.cssText = `${FONT}font-size:.72rem;color:${DIM};text-align:center;padding:24px;`;
        em.textContent = '> channel open · awaiting first transmission';
        msgArea.appendChild(em);
      } else { msgs.forEach(addBubble); }

      const chatInp = inputRow.querySelector('#ci');
      const sendBtn = inputRow.querySelector('#cs');

      async function doSend() {
        const text = chatInp.value.trim();
        if (!text) return;
        chatInp.value = '';
        sendBtn.disabled = true; sendBtn.textContent = '…';
        const res = await MSG.sendMessage(me, partner, text).catch(() => ({ ok: false, error: 'WRITE FAILED' }));
        sendBtn.disabled = false; sendBtn.textContent = 'TX';
        if (res.ok) {
          document.getElementById('empty-hint')?.remove();
          addBubble(res.message);
        } else {
          showToast98('TX ERROR', res.error || 'FAILED');
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
            td.style.cssText = `${FONT}font-size:.68rem;color:${DIM};padding:3px 0;`;
            td.textContent = '> simulator-bot is transmitting…';
            ta.appendChild(td); ta.scrollTop = ta.scrollHeight;
          }
          await MSG.simReply(MSG.getUsername());
          document.getElementById('sim-typing')?.remove();
        }
      }, 350);
    }

    function showConfigPanel() {
      const d = document.createElement('div');
      d.style.cssText = `position:fixed;inset:0;z-index:9999;background:rgba(0,0,0,.7);display:flex;align-items:center;justify-content:center;padding:16px;`;
      d.innerHTML = `
        <div style="background:${BG};border:1px solid ${GR};padding:14px;width:100%;max-width:280px;display:flex;flex-direction:column;gap:8px;">
          <div style="${FONT}font-size:.82rem;color:${GR};letter-spacing:.1em;">[ CONFIG ]</div>
          <div style="${FONT}font-size:.7rem;color:${DIM};">HANDLE: @${me}</div>
          <div style="${FONT}font-size:.7rem;color:${DIM};line-height:1.5;">ALL DATA ENCODED LOCALLY<br>NO SERVER · NO NETWORK · NO TRACKING</div>
          <div style="${FONT}font-size:.72rem;color:${GR};margin-top:4px;">CHANGE PASSWORD:</div>
          <input id="cp1" type="password" placeholder="new password" style="${inpHk}">
          <input id="cp2" type="password" placeholder="confirm" style="${inpHk}">
          <div id="cpe" style="${FONT}font-size:.68rem;color:${WARN};min-height:1em;"></div>
          <div style="display:flex;gap:6px;flex-wrap:wrap;">
            <button id="cpsv" style="flex:1;padding:7px;${FONT}font-size:.68rem;background:transparent;border:1px solid ${GR};color:${GR};cursor:pointer;letter-spacing:.06em;">SAVE PASS</button>
            <button id="cplo" style="flex:1;padding:7px;${FONT}font-size:.68rem;background:transparent;border:1px solid ${WARN};color:${WARN};cursor:pointer;letter-spacing:.06em;">LOGOUT</button>
          </div>
          <div style="${FONT}font-size:.72rem;color:${GR};margin-top:4px;">FILE TRANSFER:</div>
          <button id="exp" style="padding:7px;${FONT}font-size:.68rem;background:transparent;border:1px solid ${DIM};color:${DIM};cursor:pointer;letter-spacing:.06em;">EXPORT .IPM</button>
          <input id="impf" type="file" accept=".ipm" style="${FONT}font-size:.68rem;color:${DIM};">
          <button id="impb" style="padding:7px;${FONT}font-size:.68rem;background:transparent;border:1px solid ${DIM};color:${DIM};cursor:pointer;letter-spacing:.06em;">IMPORT .IPM</button>
          <div id="imps" style="${FONT}font-size:.68rem;color:${DIM};min-height:1em;"></div>
          <button id="cpcl" style="align-self:flex-end;padding:5px 12px;${FONT}font-size:.68rem;background:transparent;border:1px solid ${DIM};color:${DIM};cursor:pointer;">[ CLOSE ]</button>
        </div>`;
      document.body.appendChild(d);
      d.querySelector('#cpcl').addEventListener('click', () => d.remove());
      d.querySelector('#cplo').addEventListener('click', () => {
        MSG.logout(); d.remove();
        c.innerHTML = ''; c.style.cssText = `width:100%;height:100%;display:flex;flex-direction:column;overflow:hidden;background:${BG};`;
        showAuth(buildMain);
      });
      d.querySelector('#cpsv').addEventListener('click', async () => {
        const n1 = d.querySelector('#cp1').value;
        const n2 = d.querySelector('#cp2').value;
        if (n1.length < 4) { d.querySelector('#cpe').textContent = '> ERROR: min 4 chars'; return; }
        if (n1 !== n2) { d.querySelector('#cpe').textContent = '> ERROR: mismatch'; return; }
        const res = await MSG.changePassword(n1);
        if (res.ok) { d.remove(); showToast98('OK', 'PASSWORD UPDATED'); }
        else d.querySelector('#cpe').textContent = '> ERROR: ' + res.error;
      });
      d.querySelector('#exp').addEventListener('click', () => MSG.exportMessages());
      d.querySelector('#impb').addEventListener('click', async () => {
        const f = d.querySelector('#impf').files[0];
        if (!f) { d.querySelector('#imps').textContent = '> select file first'; return; }
        d.querySelector('#imps').textContent = '> importing…';
        const res = await MSG.importMessages(f);
        if (res.ok) { d.querySelector('#imps').textContent = `> imported ${res.imported} msgs`; loadConvs(); }
        else d.querySelector('#imps').textContent = '> FAIL: ' + (res.error || 'unknown');
      });
    }

    newRow.querySelector('#mtg').addEventListener('click', () => {
      const to = newRow.querySelector('#mti').value.trim();
      if (to) { newRow.querySelector('#mti').value = ''; openChat(to); }
    });
    newRow.querySelector('#mti').addEventListener('keydown', e => {
      if (e.key === 'Enter') {
        const to = newRow.querySelector('#mti').value.trim();
        if (to) { newRow.querySelector('#mti').value = ''; openChat(to); }
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
