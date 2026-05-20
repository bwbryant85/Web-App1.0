/* ════════════════════════════════════════════════════════════
   MESSAGES — Modern / Win11 Theme
   - Liquid Glass UI from dashersw/liquid-glass-js
   - html2canvas + container.js + button.js loaded via CDN
   - Adaptive text color (light/dark) based on background
   - iMessage-style bubbles with glass chrome
   - Full auth: register/login/password
   - Cross-device via GitHub Gist
════════════════════════════════════════════════════════════ */
'use strict';

function initMessages98() {
  const c = window.content;
  c.style.cssText = 'width:100%;height:100%;display:flex;flex-direction:column;overflow:hidden;position:relative;';

  const BLUE   = '#0B84FF';
  const FONT   = "font-family:'Inter',system-ui,sans-serif;";
  const inp11  = `padding:11px 16px;${FONT}font-size:.92rem;background:rgba(255,255,255,.18);
    backdrop-filter:blur(12px);-webkit-backdrop-filter:blur(12px);
    border:1px solid rgba(255,255,255,.35);border-radius:14px;
    outline:none;color:#fff;width:100%;box-sizing:border-box;`;

  /* ────────────────────────────────────────────────────────
     LIQUID GLASS LOADER
     Loads html2canvas + container.js + button.js from CDN
  ──────────────────────────────────────────────────────── */
  let _glassReady = false;
  let _glassQueue = [];

  function _loadScript(src) {
    return new Promise((res, rej) => {
      if (document.querySelector(`script[src="${src}"]`)) { res(); return; }
      const s = document.createElement('script');
      s.src = src; s.onload = res; s.onerror = rej;
      document.head.appendChild(s);
    });
  }

  async function _initGlass() {
    if (_glassReady) return true;
    try {
      await _loadScript('https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js');
      await _loadScript('https://dashersw.github.io/liquid-glass-js/container.js');
      await _loadScript('https://dashersw.github.io/liquid-glass-js/button.js');
      _glassReady = true;
      _glassQueue.forEach(fn => fn());
      _glassQueue = [];
      return true;
    } catch (e) {
      console.warn('liquid-glass-js failed to load, using fallback glass CSS', e);
      return false;
    }
  }

  // Inject glass CSS fallback + override styles for readability
  const glassStyle = document.createElement('style');
  glassStyle.textContent = `
    /* Ensure glass text is always readable */
    .glass-button-text {
      color: #fff !important;
      text-shadow: 0 1px 4px rgba(0,0,0,0.55), 0 0 12px rgba(0,0,0,0.25) !important;
      font-family: 'Inter', system-ui, sans-serif !important;
      font-weight: 500 !important;
    }
    .glass-container, .glass-button {
      /* Ensure tint is never too transparent */
      min-opacity: 1;
    }
    /* Fallback glass CSS when WebGL unavailable */
    .ipm-glass-fallback {
      background: rgba(255,255,255,0.18) !important;
      backdrop-filter: blur(20px) saturate(1.8) !important;
      -webkit-backdrop-filter: blur(20px) saturate(1.8) !important;
      border: 1px solid rgba(255,255,255,0.3) !important;
      box-shadow: 0 8px 32px rgba(0,0,0,0.18), inset 0 1px 0 rgba(255,255,255,0.4) !important;
    }
    /* Adaptive text: always use white with shadow on glass */
    .ipm-glass-text {
      color: #fff;
      text-shadow: 0 1px 3px rgba(0,0,0,0.6);
    }
    .ipm-glass-text-dark {
      color: #111;
      text-shadow: 0 1px 2px rgba(255,255,255,0.4);
    }
    /* Glass topbar */
    .ipm-topbar {
      background: rgba(10,10,30,0.55);
      backdrop-filter: blur(28px) saturate(2);
      -webkit-backdrop-filter: blur(28px) saturate(2);
      border-bottom: 1px solid rgba(255,255,255,0.12);
      box-shadow: 0 2px 16px rgba(0,0,0,0.18);
    }
    /* Message bubbles */
    .ipm-bubble-mine {
      background: linear-gradient(135deg, rgba(11,132,255,0.85), rgba(88,86,214,0.85));
      backdrop-filter: blur(12px);
      -webkit-backdrop-filter: blur(12px);
      border: 1px solid rgba(11,132,255,0.5);
      box-shadow: 0 4px 18px rgba(11,132,255,0.3), inset 0 1px 0 rgba(255,255,255,0.25);
      color: #fff;
      text-shadow: 0 1px 2px rgba(0,0,0,0.2);
    }
    .ipm-bubble-theirs {
      background: rgba(255,255,255,0.16);
      backdrop-filter: blur(16px) saturate(1.5);
      -webkit-backdrop-filter: blur(16px) saturate(1.5);
      border: 1px solid rgba(255,255,255,0.28);
      box-shadow: 0 4px 18px rgba(0,0,0,0.15), inset 0 1px 0 rgba(255,255,255,0.3);
      color: #fff;
      text-shadow: 0 1px 2px rgba(0,0,0,0.35);
    }
    /* Input bar */
    .ipm-inputbar {
      background: rgba(10,10,30,0.5);
      backdrop-filter: blur(28px) saturate(2);
      -webkit-backdrop-filter: blur(28px) saturate(2);
      border-top: 1px solid rgba(255,255,255,0.1);
    }
    /* Conversation rows */
    .ipm-conv-row {
      background: rgba(255,255,255,0.06);
      border-bottom: 1px solid rgba(255,255,255,0.06);
      transition: background .12s ease;
    }
    .ipm-conv-row:active { background: rgba(255,255,255,0.14); }
    /* Auth glass card */
    .ipm-auth-card {
      background: rgba(20,20,50,0.6);
      backdrop-filter: blur(32px) saturate(1.8);
      -webkit-backdrop-filter: blur(32px) saturate(1.8);
      border: 1px solid rgba(255,255,255,0.18);
      border-radius: 24px;
      box-shadow: 0 24px 64px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.2);
    }
    /* Glass modal backdrop */
    .ipm-modal-bg {
      background: rgba(0,0,0,0.5);
      backdrop-filter: blur(8px);
      -webkit-backdrop-filter: blur(8px);
    }
    /* Glass sheet */
    .ipm-sheet {
      background: rgba(18,18,42,0.75);
      backdrop-filter: blur(40px) saturate(2);
      -webkit-backdrop-filter: blur(40px) saturate(2);
      border-top: 1px solid rgba(255,255,255,0.15);
      border-radius: 24px 24px 0 0;
      box-shadow: 0 -8px 48px rgba(0,0,0,0.35);
    }
    /* Buttons */
    .ipm-btn-primary {
      background: linear-gradient(135deg, rgba(11,132,255,0.9), rgba(88,86,214,0.9));
      backdrop-filter: blur(8px);
      border: 1px solid rgba(255,255,255,0.25);
      color: #fff;
      text-shadow: 0 1px 2px rgba(0,0,0,0.2);
      box-shadow: 0 4px 16px rgba(11,132,255,0.4);
    }
    .ipm-btn-secondary {
      background: rgba(255,255,255,0.1);
      backdrop-filter: blur(8px);
      border: 1px solid rgba(255,255,255,0.18);
      color: rgba(255,255,255,0.9);
    }
    .ipm-btn-danger {
      background: rgba(255,59,48,0.15);
      backdrop-filter: blur(8px);
      border: 1px solid rgba(255,59,48,0.35);
      color: #ff3b30;
    }
    /* Typing indicator dots */
    @keyframes ipm-dot-bounce {
      0%,80%,100%{transform:translateY(0);opacity:.4}
      40%{transform:translateY(-5px);opacity:1}
    }
    .ipm-typing-dot {
      width:7px;height:7px;border-radius:50%;background:rgba(255,255,255,0.7);
      display:inline-block;animation:ipm-dot-bounce 1s ease-in-out infinite;
    }
    .ipm-typing-dot:nth-child(2){animation-delay:.15s;}
    .ipm-typing-dot:nth-child(3){animation-delay:.3s;}
    /* Scrollbar */
    .ipm-scroll::-webkit-scrollbar{width:3px;}
    .ipm-scroll::-webkit-scrollbar-track{background:transparent;}
    .ipm-scroll::-webkit-scrollbar-thumb{background:rgba(255,255,255,0.2);border-radius:2px;}
  `;
  document.head.appendChild(glassStyle);

  // Start loading glass scripts immediately in background
  _initGlass();

  /* ────────────────────────────────────────────────────────
     ADAPTIVE TEXT COLOR
     Detects luminance of background at element position
     and sets text to white or dark accordingly
  ──────────────────────────────────────────────────────── */
  function _getLuminance(r, g, b) {
    const [rs, gs, bs] = [r, g, b].map(c => {
      c /= 255;
      return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
    });
    return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
  }

  function adaptTextColor(el, bgEl) {
    // For now, on the dark orb background, always use white with shadow
    // This runs quickly — if we detect a bright background we flip to dark
    const computed = window.getComputedStyle(bgEl || el);
    const bg = computed.backgroundColor;
    const m  = bg.match(/\d+/g);
    if (m && m.length >= 3) {
      const lum = _getLuminance(+m[0], +m[1], +m[2]);
      if (lum > 0.35) {
        el.style.color = '#111';
        el.style.textShadow = '0 1px 2px rgba(255,255,255,0.3)';
      } else {
        el.style.color = '#fff';
        el.style.textShadow = '0 1px 3px rgba(0,0,0,0.6)';
      }
    }
  }

  /* ────────────────────────────────────────────────────────
     AUTH SCREEN
  ──────────────────────────────────────────────────────── */
  function showAuth(onDone) {
    c.innerHTML = '';
    let mode = MSG.hasAccount() ? 'login' : 'register';

    function render() {
      c.innerHTML = '';
      const wrap = document.createElement('div');
      wrap.style.cssText = 'flex:1;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:20px;padding:28px;overflow-y:auto;';
      const isReg = mode === 'register';

      const card = document.createElement('div');
      card.className = 'ipm-auth-card';
      card.style.cssText = 'width:100%;max-width:320px;padding:28px 24px;display:flex;flex-direction:column;gap:14px;';
      card.innerHTML = `
        <div style="display:flex;flex-direction:column;align-items:center;gap:10px;margin-bottom:4px;">
          <div style="width:62px;height:62px;background:linear-gradient(135deg,${BLUE},#5856d6);border-radius:18px;display:flex;align-items:center;justify-content:center;font-size:2rem;box-shadow:0 8px 28px rgba(11,132,255,.45);">💬</div>
          <div style="${FONT}font-size:1.35rem;font-weight:700;color:#fff;text-shadow:0 2px 8px rgba(0,0,0,0.3);">Messages</div>
          <div style="${FONT}font-size:.82rem;color:rgba(255,255,255,.6);text-align:center;">
            ${isReg ? 'Create your account' : 'Welcome back'}
          </div>
        </div>
        <input id="au" type="text" maxlength="24" placeholder="Username" autocapitalize="none" style="${inp11}placeholder-color:rgba(255,255,255,0.5)">
        <input id="ap" type="password" maxlength="64" placeholder="${isReg ? 'Password (min 4 chars)' : 'Password'}" style="${inp11}">
        ${isReg ? `<input id="ap2" type="password" maxlength="64" placeholder="Confirm password" style="${inp11}">` : ''}
        <div id="ae" style="${FONT}font-size:.8rem;color:#ff6b6b;min-height:1em;text-align:center;text-shadow:0 1px 3px rgba(0,0,0,0.4);"></div>
        <button id="ab" class="ipm-btn-primary" style="padding:14px;${FONT}font-size:.98rem;font-weight:600;border:none;border-radius:14px;cursor:pointer;width:100%;">
          ${isReg ? 'Create Account' : 'Sign In'}
        </button>
        <button id="as" style="background:none;border:none;color:rgba(255,255,255,.55);${FONT}font-size:.85rem;cursor:pointer;padding:4px;text-align:center;">
          ${isReg ? 'Already have an account? Sign in' : "Don't have an account? Register"}
        </button>
        <div style="${FONT}font-size:.7rem;color:rgba(255,255,255,.35);text-align:center;line-height:1.5;margin-top:4px;">
          Messages stored locally + optional Gist sync for cross-device
        </div>`;
      wrap.appendChild(card);
      c.appendChild(wrap);

      // Placeholder styling fix
      card.querySelectorAll('input').forEach(inp => {
        inp.style.setProperty('--placeholder-color', 'rgba(255,255,255,0.45)');
        inp.addEventListener('focus', () => { inp.style.borderColor = 'rgba(11,132,255,0.8)'; inp.style.background = 'rgba(255,255,255,0.22)'; });
        inp.addEventListener('blur',  () => { inp.style.borderColor = 'rgba(255,255,255,0.25)'; inp.style.background = 'rgba(255,255,255,0.12)'; });
      });

      const errEl = card.querySelector('#ae');
      const btn   = card.querySelector('#ab');
      const uInp  = card.querySelector('#au');
      const pInp  = card.querySelector('#ap');

      card.querySelector('#as').addEventListener('click', () => { mode = mode === 'login' ? 'register' : 'login'; render(); });

      async function doAuth() {
        const u = uInp.value.trim().toLowerCase();
        const p = pInp.value;
        errEl.textContent = ''; btn.disabled = true; btn.style.opacity = '.6';

        if (isReg) {
          const p2 = card.querySelector('#ap2').value;
          if (p !== p2) { errEl.textContent = 'Passwords do not match.'; btn.disabled = false; btn.style.opacity = '1'; return; }
          const res = await MSG.register(u, p);
          if (res.ok) { _resetAndBuild(onDone); }
          else { errEl.textContent = res.error; btn.disabled = false; btn.style.opacity = '1'; }
        } else {
          const res = await MSG.login(u, p);
          if (res.ok) { _resetAndBuild(onDone); }
          else { errEl.textContent = res.error; btn.disabled = false; btn.style.opacity = '1'; }
        }
      }

      function _resetAndBuild(cb) {
        MSG.connect();
        c.innerHTML = '';
        c.style.cssText = 'width:100%;height:100%;display:flex;flex-direction:column;overflow:hidden;position:relative;';
        cb();
      }

      btn.addEventListener('click', doAuth);
      [uInp, pInp].forEach(el => el.addEventListener('keydown', e => { if (e.key === 'Enter') doAuth(); }));
      uInp.focus();
    }
    render();
  }

  /* ────────────────────────────────────────────────────────
     MAIN UI
  ──────────────────────────────────────────────────────── */
  function buildMain() {
    const me = MSG.getUsername();
    const gistOk = MSG.isGistConfigured();

    // ── Top bar ──
    const topbar = document.createElement('div');
    topbar.className = 'ipm-topbar';
    topbar.style.cssText = `flex-shrink:0;padding:14px 18px 10px;display:flex;align-items:center;justify-content:space-between;`;
    topbar.innerHTML = `
      <div style="${FONT}font-size:1.3rem;font-weight:700;color:#fff;text-shadow:0 2px 8px rgba(0,0,0,0.3);">Messages</div>
      <div style="display:flex;gap:10px;align-items:center;">
        <span id="ipm-sync-status" style="${FONT}font-size:.72rem;color:${gistOk ? '#4cd964' : 'rgba(255,255,255,.4)'};
          padding:3px 8px;background:${gistOk ? 'rgba(76,217,100,.15)' : 'rgba(255,255,255,.06)'};
          border:1px solid ${gistOk ? 'rgba(76,217,100,.3)' : 'rgba(255,255,255,.1)'};
          border-radius:8px;">
          ${gistOk ? '☁ Synced' : '⚡ Local'}
        </span>
        <button id="m11-gear" style="background:rgba(255,255,255,.1);border:1px solid rgba(255,255,255,.18);
          font-size:1rem;cursor:pointer;padding:7px;border-radius:11px;color:#fff;min-width:36px;min-height:36px;
          backdrop-filter:blur(8px);" title="Settings">⚙️</button>
      </div>`;
    c.appendChild(topbar);
    topbar.querySelector('#m11-gear').addEventListener('click', () => showSettingsSheet());

    // ── New chat bar ──
    const newBar = document.createElement('div');
    newBar.style.cssText = `flex-shrink:0;display:flex;gap:8px;padding:8px 16px 10px;
      background:rgba(255,255,255,.04);border-bottom:1px solid rgba(255,255,255,.07);`;
    newBar.innerHTML = `
      <input id="mti" type="text" maxlength="24" placeholder="Message someone by username…" autocapitalize="none"
        style="flex:1;${inp11}border-radius:12px;font-size:.88rem;padding:9px 14px;">
      <button id="mtg" class="ipm-btn-primary" style="padding:9px 14px;${FONT}font-size:.9rem;font-weight:600;
        border:none;border-radius:12px;cursor:pointer;white-space:nowrap;min-width:44px;min-height:36px;">→</button>`;
    c.appendChild(newBar);

    // ── Body ──
    const body = document.createElement('div');
    body.style.cssText = 'flex:1;overflow:hidden;position:relative;';
    c.appendChild(body);

    const listPanel = document.createElement('div');
    listPanel.style.cssText = 'position:absolute;inset:0;display:flex;flex-direction:column;transition:transform .32s cubic-bezier(.34,1,.64,1);overflow:hidden;';
    body.appendChild(listPanel);

    const convScroll = document.createElement('div');
    convScroll.className = 'ipm-scroll';
    convScroll.style.cssText = 'flex:1;overflow-y:auto;-webkit-overflow-scrolling:touch;';
    listPanel.appendChild(convScroll);

    // Simulator button at bottom
    const simBar = document.createElement('div');
    simBar.style.cssText = `flex-shrink:0;padding:7px 16px 10px;display:flex;gap:8px;justify-content:flex-end;
      background:rgba(0,0,0,.15);border-top:1px solid rgba(255,255,255,.06);`;
    simBar.innerHTML = `
      <button id="sim11" class="ipm-btn-secondary" style="padding:7px 14px;${FONT}font-size:.8rem;
        font-weight:500;border-radius:10px;cursor:pointer;">🤖 Simulator</button>
      <button id="refresh11" class="ipm-btn-secondary" style="padding:7px 14px;${FONT}font-size:.8rem;
        font-weight:500;border-radius:10px;cursor:pointer;">↻ Refresh</button>`;
    listPanel.appendChild(simBar);
    simBar.querySelector('#sim11').addEventListener('click', () => openSimulator());
    simBar.querySelector('#refresh11').addEventListener('click', async () => {
      const btn = simBar.querySelector('#refresh11');
      btn.textContent = '↻ Syncing…'; btn.disabled = true;
      if (MSG.isGistConfigured()) await MSG.syncNow().catch(() => {});
      await loadConvs();
      btn.textContent = '↻ Refresh'; btn.disabled = false;
    });

    const chatPanel = document.createElement('div');
    chatPanel.style.cssText = `position:absolute;inset:0;display:flex;flex-direction:column;transform:translateX(100%);
      transition:transform .32s cubic-bezier(.34,1,.64,1);`;
    body.appendChild(chatPanel);

    let currentChat = null, unsubList = null, unsubChat = null;

    /* ── Conversation list ── */
    async function loadConvs() {
      convScroll.innerHTML = `<div style="${FONT}padding:24px;font-size:.88rem;color:rgba(255,255,255,.4);text-align:center;">Loading…</div>`;
      const convs = await MSG.getConversations(me).catch(() => []);
      convScroll.innerHTML = '';

      // Update sync badge
      const badge = topbar.querySelector('#ipm-sync-status');
      const ok = MSG.isGistConfigured();
      badge.textContent = ok ? '☁ Synced' : '⚡ Local';
      badge.style.color  = ok ? '#4cd964' : 'rgba(255,255,255,.4)';
      badge.style.background = ok ? 'rgba(76,217,100,.15)' : 'rgba(255,255,255,.06)';
      badge.style.borderColor = ok ? 'rgba(76,217,100,.3)' : 'rgba(255,255,255,.1)';

      if (!convs.length) {
        convScroll.innerHTML = `
          <div style="padding:48px 20px;text-align:center;display:flex;flex-direction:column;align-items:center;gap:12px;">
            <div style="font-size:3rem;filter:drop-shadow(0 4px 12px rgba(11,132,255,.3));">💬</div>
            <div style="${FONT}font-size:1rem;font-weight:600;color:#fff;text-shadow:0 2px 6px rgba(0,0,0,.3);">No conversations yet</div>
            <div style="${FONT}font-size:.85rem;color:rgba(255,255,255,.5);">Enter a username above to start chatting</div>
            ${!MSG.isGistConfigured() ? `<div style="${FONT}font-size:.78rem;color:rgba(255,165,0,.7);margin-top:8px;max-width:240px;text-align:center;line-height:1.5;">
              ⚠️ Set up Gist sync in ⚙️ Settings to message other devices</div>` : ''}
          </div>`;
        return;
      }
      convs.forEach(cv => {
        const row = document.createElement('div');
        row.className = 'ipm-conv-row';
        const init = cv.partner.charAt(0).toUpperCase();
        const hue  = (cv.partner.charCodeAt(0) * 47) % 360;
        row.style.cssText = 'display:flex;align-items:center;gap:12px;padding:12px 18px;cursor:pointer;-webkit-tap-highlight-color:transparent;';
        row.innerHTML = `
          <div style="width:46px;height:46px;border-radius:23px;background:linear-gradient(135deg,hsl(${hue},65%,52%),hsl(${(hue+30)%360},70%,42%));
            display:flex;align-items:center;justify-content:center;font-size:1.2rem;color:#fff;${FONT}font-weight:700;
            flex-shrink:0;box-shadow:0 4px 14px rgba(0,0,0,.25);">${init}</div>
          <div style="flex:1;min-width:0;">
            <div style="${FONT}display:flex;align-items:center;gap:6px;">
              <span style="font-size:.95rem;font-weight:600;color:#fff;text-shadow:0 1px 4px rgba(0,0,0,.3);">@${cv.partner}</span>
              ${cv.unread > 0 ? `<span style="width:19px;height:19px;background:${BLUE};color:#fff;${FONT}font-size:.62rem;font-weight:700;
                border-radius:10px;display:inline-flex;align-items:center;justify-content:center;box-shadow:0 2px 8px rgba(11,132,255,.5);">${cv.unread}</span>` : ''}
              <span style="margin-left:auto;font-size:.72rem;color:rgba(255,255,255,.45);">${MSG.formatTime(cv.ts)}</span>
            </div>
            <div style="${FONT}font-size:.83rem;color:rgba(255,255,255,.5);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;margin-top:1px;">${cv.text || ''}</div>
          </div>`;
        row.addEventListener('click', () => openChat(cv.partner));
        listPanel.appendChild(row);
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

      const init = partner.charAt(0).toUpperCase();
      const hue  = (partner.charCodeAt(0) * 47) % 360;

      // Header
      const hdr = document.createElement('div');
      hdr.className = 'ipm-topbar';
      hdr.style.cssText = `flex-shrink:0;display:flex;align-items:center;gap:10px;padding:12px 14px;`;
      hdr.innerHTML = `
        <button id="cbk" style="background:rgba(255,255,255,.1);border:1px solid rgba(255,255,255,.15);
          color:#fff;${FONT}font-size:.9rem;cursor:pointer;padding:8px 12px;border-radius:10px;
          min-width:44px;min-height:44px;display:flex;align-items:center;backdrop-filter:blur(8px);
          -webkit-tap-highlight-color:transparent;">‹ Back</button>
        <div style="width:36px;height:36px;border-radius:18px;background:linear-gradient(135deg,hsl(${hue},65%,52%),hsl(${(hue+30)%360},70%,42%));
          display:flex;align-items:center;justify-content:center;font-size:1rem;color:#fff;${FONT}font-weight:700;
          flex-shrink:0;box-shadow:0 3px 10px rgba(0,0,0,.25);">${init}</div>
        <div style="${FONT}font-size:.98rem;font-weight:600;color:#fff;text-shadow:0 1px 4px rgba(0,0,0,.3);">@${partner}</div>
        ${MSG.isGistConfigured() ? `<span style="${FONT}font-size:.68rem;color:#4cd964;margin-left:auto;opacity:.8;">● Live</span>` :
          `<span style="${FONT}font-size:.68rem;color:rgba(255,165,0,.7);margin-left:auto;">⚡ Local</span>`}`;
      chatPanel.appendChild(hdr);

      // Messages area
      const msgArea = document.createElement('div');
      msgArea.className = 'ipm-scroll';
      msgArea.style.cssText = 'flex:1;overflow-y:auto;-webkit-overflow-scrolling:touch;padding:12px 16px;display:flex;flex-direction:column;gap:3px;';
      chatPanel.appendChild(msgArea);

      // Typing indicator (sits between messages and input)
      const typingRow = document.createElement('div');
      typingRow.style.cssText = `flex-shrink:0;padding:3px 16px 5px;min-height:24px;display:flex;align-items:center;`;
      chatPanel.appendChild(typingRow);

      // Input bar
      const inputBar = document.createElement('div');
      inputBar.className = 'ipm-inputbar';
      inputBar.style.cssText = `flex-shrink:0;display:flex;align-items:flex-end;gap:10px;padding:10px 16px 16px;`;
      inputBar.innerHTML = `
        <input id="ci" type="text" maxlength="500" placeholder="iMessage"
          style="flex:1;padding:11px 16px;${FONT}font-size:.9rem;background:rgba(255,255,255,.13);
            backdrop-filter:blur(12px);-webkit-backdrop-filter:blur(12px);
            border:1px solid rgba(255,255,255,.22);border-radius:22px;outline:none;
            color:#fff;width:auto;box-sizing:border-box;">
        <button id="cs" class="ipm-btn-primary" style="width:38px;height:38px;border:none;border-radius:19px;
          display:flex;align-items:center;justify-content:center;cursor:pointer;flex-shrink:0;
          -webkit-tap-highlight-color:transparent;transition:transform .1s ease,opacity .1s ease;">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
            <path d="M3 20l19-8L3 4v6l14 2-14 2v6z" fill="white"/>
          </svg>
        </button>`;
      chatPanel.appendChild(inputBar);
      chatPanel.style.transform = 'translateX(0)';

      let receiptTimer = null;

      hdr.querySelector('#cbk').addEventListener('click', () => {
        chatPanel.style.transform = 'translateX(100%)';
        currentChat = null;
        if (unsubChat) { unsubChat(); unsubChat = null; }
        if (receiptTimer) clearInterval(receiptTimer);
        loadConvs();
      });

      const shownIds = new Set();

      function addBubble(msg) {
        if (!msg?.id || !msg.text || shownIds.has(msg.id)) return;
        shownIds.add(msg.id);
        const mine = msg.from_user === me;

        const grp = document.createElement('div');
        grp.style.cssText = `display:flex;flex-direction:column;align-items:${mine ? 'flex-end' : 'flex-start'};margin-bottom:2px;`;

        const bub = document.createElement('div');
        bub.className = mine ? 'ipm-bubble-mine' : 'ipm-bubble-theirs';
        bub.style.cssText = `max-width:78%;padding:11px 15px;${FONT}font-size:.9rem;line-height:1.45;
          word-break:break-word;border-radius:${mine ? '18px 18px 4px 18px' : '18px 18px 18px 4px'};`;
        bub.textContent = msg.text;

        const meta = document.createElement('div');
        meta.style.cssText = `${FONT}font-size:.63rem;color:rgba(255,255,255,.45);margin-top:3px;
          display:flex;align-items:center;gap:4px;justify-content:${mine ? 'flex-end' : 'flex-start'};`;
        meta.innerHTML = `<span>${MSG.formatTime(msg.ts)}</span>`;

        if (mine) {
          const ri = document.createElement('span');
          ri.setAttribute('data-receipt', msg.id);
          ri.style.cssText = `color:${msg.read ? BLUE : 'rgba(255,255,255,.4)'};font-size:.68rem;`;
          ri.textContent = msg.read ? '✓✓' : '✓';
          ri.title = msg.read ? 'Read' : 'Delivered';
          meta.appendChild(ri);
        }

        grp.appendChild(bub); grp.appendChild(meta);
        msgArea.appendChild(grp);
        msgArea.scrollTop = msgArea.scrollHeight;
        if (!mine) MSG.markAsRead(me, partner, msg.id);
      }

      // Receipt updater
      receiptTimer = setInterval(async () => {
        const msgs = await MSG.getConversation(me, partner);
        msgs.filter(m => m.from_user === me && m.read).forEach(m => {
          const el = chatPanel.querySelector(`[data-receipt="${m.id}"]`);
          if (el && el.textContent === '✓') {
            el.textContent = '✓✓';
            el.style.color = BLUE;
            el.title = 'Read';
          }
        });
      }, 2000);

      // Load history
      msgArea.innerHTML = `<div style="${FONT}font-size:.85rem;color:rgba(255,255,255,.35);text-align:center;padding:24px;">Loading…</div>`;
      const msgs = await MSG.getConversation(me, partner).catch(() => []);
      msgArea.innerHTML = '';

      if (!msgs.length) {
        const em = document.createElement('div');
        em.id = 'empty-hint';
        em.style.cssText = `display:flex;flex-direction:column;align-items:center;gap:12px;padding:36px 20px;`;
        em.innerHTML = `
          <div style="width:56px;height:56px;background:linear-gradient(135deg,hsl(${hue},65%,52%),hsl(${(hue+30)%360},70%,42%));
            border-radius:28px;display:flex;align-items:center;justify-content:center;font-size:1.6rem;color:#fff;
            ${FONT}font-weight:700;box-shadow:0 8px 24px rgba(0,0,0,.3);">${init}</div>
          <div style="${FONT}font-size:.95rem;font-weight:600;color:#fff;text-shadow:0 2px 6px rgba(0,0,0,.3);">@${partner}</div>
          <div style="${FONT}font-size:.83rem;color:rgba(255,255,255,.5);">Say hello!</div>
          ${!MSG.isGistConfigured() ? `<div style="${FONT}font-size:.74rem;color:rgba(255,165,0,.65);max-width:220px;text-align:center;line-height:1.5;margin-top:4px;">
            ⚠️ Gist sync not set up — messages won't reach other devices</div>` : ''}`;
        msgArea.appendChild(em);
      } else {
        msgs.forEach(addBubble);
      }

      const chatInp = inputBar.querySelector('#ci');
      const sendBtn = inputBar.querySelector('#cs');

      chatInp.addEventListener('focus', () => { chatInp.style.borderColor = `rgba(11,132,255,.7)`; });
      chatInp.addEventListener('blur',  () => { chatInp.style.borderColor = 'rgba(255,255,255,.22)'; });

      async function doSend() {
        const text = chatInp.value.trim();
        if (!text) return;
        chatInp.value = '';
        sendBtn.style.transform = 'scale(.85)'; sendBtn.style.opacity = '.7';
        setTimeout(() => { sendBtn.style.transform = ''; sendBtn.style.opacity = '1'; }, 120);

        const res = await MSG.sendMessage(me, partner, text).catch(() => ({ ok: false, error: 'Failed' }));
        if (res.ok) {
          document.getElementById('empty-hint')?.remove();
          addBubble(res.message);
        } else {
          showToast98('❌', res.error || 'Failed to send');
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

    /* ── Simulator ── */
    function openSimulator() {
      openChat(MSG.SIM_PARTNER);
      setTimeout(() => {
        const ci = chatPanel.querySelector('#ci');
        const cs = chatPanel.querySelector('#cs');
        if (!ci || !cs) return;

        async function triggerSim() {
          const text = ci.value.trim();
          if (!text) return;
          await new Promise(r => setTimeout(r, 80));
          // Show typing indicator
          const typRow = chatPanel.querySelector('[style*="min-height:24px"]');
          if (typRow) {
            typRow.innerHTML = `
              <div class="ipm-bubble-theirs" style="padding:8px 14px;border-radius:14px;display:flex;gap:4px;align-items:center;">
                <span class="ipm-typing-dot"></span>
                <span class="ipm-typing-dot"></span>
                <span class="ipm-typing-dot"></span>
              </div>`;
          }
          await MSG.simReply(MSG.getUsername());
          if (typRow) typRow.innerHTML = '';
        }

        cs.addEventListener('click', triggerSim, { capture: true });
        ci.addEventListener('keydown', e => { if (e.key === 'Enter') triggerSim(); }, { capture: true });
      }, 380);
    }

    /* ── Settings bottom sheet ── */
    function showSettingsSheet() {
      const d = document.createElement('div');
      d.className = 'ipm-modal-bg';
      d.style.cssText = 'position:fixed;inset:0;z-index:9999;display:flex;align-items:flex-end;justify-content:center;';
      const sheet = document.createElement('div');
      sheet.className = 'ipm-sheet';
      sheet.style.cssText = 'width:100%;max-width:480px;padding:20px 20px 32px;display:flex;flex-direction:column;gap:12px;max-height:90vh;overflow-y:auto;';
      const gistCfg = MSG.getGistConfig();
      sheet.innerHTML = `
        <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:4px;">
          <div style="${FONT}font-size:1.1rem;font-weight:700;color:#fff;text-shadow:0 2px 6px rgba(0,0,0,.3);">Settings</div>
          <button id="s-cl" style="background:rgba(255,255,255,.1);border:1px solid rgba(255,255,255,.15);
            color:rgba(255,255,255,.7);${FONT}font-size:.82rem;cursor:pointer;padding:6px 14px;border-radius:10px;">Done</button>
        </div>
        <div style="${FONT}font-size:.78rem;color:rgba(255,255,255,.5);">@${me}</div>

        <!-- Account section -->
        <div style="background:rgba(255,255,255,.07);border:1px solid rgba(255,255,255,.1);border-radius:16px;overflow:hidden;margin-top:4px;">
          <div id="s-cp" style="${FONT}font-size:.95rem;color:#fff;padding:14px 18px;border-bottom:1px solid rgba(255,255,255,.07);cursor:pointer;-webkit-tap-highlight-color:transparent;">🔑 Change Password</div>
          <div id="s-lo" style="${FONT}font-size:.95rem;color:#ff6b6b;padding:14px 18px;cursor:pointer;-webkit-tap-highlight-color:transparent;">Sign Out</div>
        </div>

        <!-- Gist sync section -->
        <div style="${FONT}font-size:.88rem;font-weight:600;color:rgba(255,255,255,.7);margin-top:8px;">☁ Cross-Device Sync</div>
        <div style="${FONT}font-size:.76rem;color:rgba(255,255,255,.45);line-height:1.6;">
          To message other devices, create a GitHub Gist and paste your token here. Messages sync automatically every 8s.
          <br><br>
          <b style="color:rgba(255,255,255,.65);">Setup:</b>
          1. Go to github.com/settings/tokens → New classic token → check <b>gist</b> scope<br>
          2. Create a secret Gist at gist.github.com with a file called <b>ipocket_db.dat</b><br>
          3. Paste both below. Share the Gist ID (NOT your token) with people you chat with so they can set up their own token pointing to a shared Gist.
        </div>
        <div style="display:flex;flex-direction:column;gap:8px;">
          <input id="s-tok" type="password" placeholder="GitHub token (ghp_xxxxx)" value="${gistCfg?.token || ''}"
            style="${inp11}font-size:.82rem;padding:9px 14px;">
          <input id="s-gid" type="text" placeholder="Gist ID (from gist URL)" value="${gistCfg?.gistId || ''}"
            style="${inp11}font-size:.82rem;padding:9px 14px;">
        </div>
        <div id="s-sync-st" style="${FONT}font-size:.76rem;color:rgba(255,255,255,.5);min-height:1em;"></div>
        <div style="display:flex;gap:8px;flex-wrap:wrap;">
          <button id="s-sync" class="ipm-btn-secondary" style="flex:1;padding:11px;${FONT}font-size:.88rem;border-radius:12px;cursor:pointer;">Sync Now</button>
          <button id="s-sv" class="ipm-btn-primary" style="flex:1;padding:11px;${FONT}font-size:.88rem;border-radius:12px;cursor:pointer;border:none;">Save Config</button>
        </div>
        ${gistCfg ? `<button id="s-clr" class="ipm-btn-danger" style="padding:10px;${FONT}font-size:.85rem;border-radius:12px;cursor:pointer;">Clear Sync Config</button>` : ''}

        <!-- Export/Import section -->
        <div style="${FONT}font-size:.88rem;font-weight:600;color:rgba(255,255,255,.7);margin-top:8px;">📁 Offline Backup</div>
        <div style="display:flex;gap:8px;flex-wrap:wrap;">
          <button id="s-exp" class="ipm-btn-secondary" style="flex:1;padding:10px;${FONT}font-size:.82rem;border-radius:12px;cursor:pointer;">⬇ Export .ipm</button>
        </div>
        <input id="s-impf" type="file" accept=".ipm" style="${FONT}font-size:.78rem;color:rgba(255,255,255,.5);">
        <button id="s-impb" class="ipm-btn-secondary" style="padding:10px;${FONT}font-size:.82rem;border-radius:12px;cursor:pointer;">⬆ Import .ipm</button>
        <div id="s-imps" style="${FONT}font-size:.76rem;color:rgba(255,255,255,.5);min-height:1em;"></div>
      `;
      d.appendChild(sheet);
      document.body.appendChild(d);

      const st = sheet.querySelector('#s-sync-st');
      d.addEventListener('click', e => { if (e.target === d) d.remove(); });
      sheet.querySelector('#s-cl').addEventListener('click', () => d.remove());
      sheet.querySelector('#s-lo').addEventListener('click', () => {
        MSG.logout(); d.remove();
        c.innerHTML = ''; c.style.cssText = 'width:100%;height:100%;display:flex;flex-direction:column;overflow:hidden;position:relative;';
        showAuth(buildMain);
      });
      sheet.querySelector('#s-cp').addEventListener('click', () => { d.remove(); showChangePw(); });
      sheet.querySelector('#s-sv').addEventListener('click', () => {
        const tok = sheet.querySelector('#s-tok').value.trim();
        const gid = sheet.querySelector('#s-gid').value.trim();
        if (tok && gid) { MSG.setGistConfig({ token: tok, gistId: gid }); st.textContent = '✅ Config saved.'; loadConvs(); }
        else st.textContent = '⚠️ Both token and Gist ID required.';
      });
      sheet.querySelector('#s-sync').addEventListener('click', async () => {
        const tok = sheet.querySelector('#s-tok').value.trim();
        const gid = sheet.querySelector('#s-gid').value.trim();
        if (!tok || !gid) { st.textContent = '⚠️ Save config first.'; return; }
        MSG.setGistConfig({ token: tok, gistId: gid });
        st.textContent = '↻ Syncing…';
        const res = await MSG.syncNow().catch(() => ({ ok: false }));
        st.textContent = res.ok ? '✅ Sync complete!' : '❌ Sync failed. Check token/ID.';
        if (res.ok) loadConvs();
      });
      sheet.querySelector('#s-exp').addEventListener('click', () => MSG.exportMessages());
      sheet.querySelector('#s-impb').addEventListener('click', async () => {
        const f = sheet.querySelector('#s-impf').files[0];
        if (!f) { sheet.querySelector('#s-imps').textContent = 'Pick a .ipm file first.'; return; }
        sheet.querySelector('#s-imps').textContent = 'Importing…';
        const res = await MSG.importMessages(f);
        sheet.querySelector('#s-imps').textContent = res.ok ? `✅ ${res.imported} messages imported.` : '❌ ' + res.error;
        if (res.ok) loadConvs();
      });
      if (gistCfg) {
        sheet.querySelector('#s-clr').addEventListener('click', () => { MSG.clearGistConfig(); d.remove(); loadConvs(); });
      }
    }

    function showChangePw() {
      const d = document.createElement('div');
      d.className = 'ipm-modal-bg';
      d.style.cssText = 'position:fixed;inset:0;z-index:9999;display:flex;align-items:center;justify-content:center;padding:20px;';
      const card = document.createElement('div');
      card.className = 'ipm-auth-card';
      card.style.cssText = 'width:100%;max-width:300px;padding:22px;display:flex;flex-direction:column;gap:12px;';
      card.innerHTML = `
        <div style="${FONT}font-size:1rem;font-weight:700;color:#fff;">Change Password</div>
        <input id="cp1" type="password" placeholder="New password" style="${inp11}">
        <input id="cp2" type="password" placeholder="Confirm" style="${inp11}">
        <div id="cpe" style="${FONT}font-size:.8rem;color:#ff6b6b;min-height:1em;"></div>
        <button id="cpsv" class="ipm-btn-primary" style="padding:13px;${FONT}font-size:.92rem;font-weight:600;border:none;border-radius:12px;cursor:pointer;">Save</button>
        <button id="cpcl" class="ipm-btn-secondary" style="padding:11px;${FONT}font-size:.9rem;border-radius:12px;cursor:pointer;">Cancel</button>`;
      d.appendChild(card); document.body.appendChild(d);
      d.addEventListener('click', e => { if (e.target === d) d.remove(); });
      card.querySelector('#cpcl').addEventListener('click', () => d.remove());
      card.querySelector('#cpsv').addEventListener('click', async () => {
        const n1 = card.querySelector('#cp1').value;
        const n2 = card.querySelector('#cp2').value;
        if (n1.length < 4) { card.querySelector('#cpe').textContent = 'Min 4 characters.'; return; }
        if (n1 !== n2) { card.querySelector('#cpe').textContent = "Passwords don't match."; return; }
        const res = await MSG.changePassword(n1);
        d.remove();
        if (res.ok) showToast98('✅', 'Password updated.');
      });
    }

    // Wire up new chat
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

  // Entry point
  if (MSG.getUsername()) { MSG.connect(); buildMain(); }
  else showAuth(buildMain);
}
