/* ════════════════════════════════════════════════════════════════
   CASINO 🎰  — full 3-D edition
   All three games + lobby rebuilt with CSS 3-D transforms,
   perspective cards, 3-D slot cabinet rendered on canvas with
   depth shading, and a felt-table blackjack layout.
════════════════════════════════════════════════════════════════ */

const _CASINO_KEY = 'ipocket_casino_coins';
let _casinoCoins = null;

const _loadCoins  = () => {
  if (_casinoCoins !== null) return;
  try {
    const v = parseInt(localStorage.getItem(_CASINO_KEY));
    _casinoCoins = (!isNaN(v) && v >= 0) ? v : 1000;
  } catch(e) { _casinoCoins = 1000; }
};
const _saveCoins  = () => {
  try { localStorage.setItem(_CASINO_KEY, _casinoCoins); } catch(e) {}
};
const _addCoins   = delta => {
  _casinoCoins = Math.max(0, _casinoCoins + delta);
  _saveCoins();
};

/* ════════════════════════════════════════════════════════════════ */
function initCasino() {
  _loadCoins();

  let activeGame = null;

  /* ── Root ── */
  const root = document.createElement('div');
  root.style.cssText = 'width:100%;height:100%;display:flex;flex-direction:column;background:#050508;overflow:hidden;';
  content.appendChild(root);

  /* ── Global styles ── */
  if (!document.getElementById('casino-styles')) {
    const st = document.createElement('style');
    st.id = 'casino-styles';
    st.textContent = `
      @import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@400;700;900&family=Share+Tech+Mono&display=swap');

      @keyframes cs-deal3d {
        from { opacity:0; transform: rotateY(-90deg) translateZ(30px); }
        to   { opacity:1; transform: rotateY(0deg)   translateZ(0); }
      }
      @keyframes cs-dealflip {
        0%   { transform: rotateY(0deg); }
        50%  { transform: rotateY(90deg); }
        100% { transform: rotateY(0deg); }
      }
      @keyframes cs-win3d {
        0%,100% { transform: scale3d(1,1,1) translateZ(0); }
        40%     { transform: scale3d(1.15,1.15,1.15) translateZ(20px); }
      }
      @keyframes cs-shake {
        0%,100% { transform: translateX(0) translateZ(0); }
        25%     { transform: translateX(-8px) translateZ(-4px); }
        75%     { transform: translateX(8px) translateZ(-4px); }
      }
      @keyframes cs-coins {
        0%   { transform: translateY(0) scale(1) rotateY(0deg);   opacity:1; }
        100% { transform: translateY(-90px) scale(1.4) rotateY(360deg); opacity:0; }
      }
      @keyframes cs-pulse3d {
        0%,100% { box-shadow: 0 8px 32px rgba(255,215,0,.3), 0 0 0 0 rgba(255,215,0,.2); }
        50%     { box-shadow: 0 16px 48px rgba(255,215,0,.6), 0 0 40px 8px rgba(255,215,0,.15); }
      }
      @keyframes cs-lobbyfloat {
        0%,100% { transform: translateY(0) rotateX(2deg); }
        50%     { transform: translateY(-6px) rotateX(-1deg); }
      }
      @keyframes cs-spinb {
        from { filter:blur(4px); transform:translateY(-60px) rotateX(45deg); }
        to   { filter:blur(0);   transform:translateY(0)     rotateX(0deg); }
      }
      @keyframes cs-cardentry {
        from { opacity:0; transform: perspective(600px) rotateY(-120deg) translateZ(60px); }
        to   { opacity:1; transform: perspective(600px) rotateY(0deg)    translateZ(0); }
      }
      @keyframes cs-tableslide {
        from { transform: perspective(800px) rotateX(8deg) translateY(40px); opacity:0; }
        to   { transform: perspective(800px) rotateX(0deg) translateY(0);    opacity:1; }
      }
      @keyframes cs-chiptoss {
        0%   { transform: translateY(0) rotate(0deg) scale(1); opacity:1; }
        60%  { transform: translateY(-50px) rotate(360deg) scale(1.2); opacity:1; }
        100% { transform: translateY(0) rotate(720deg) scale(0.8); opacity:0; }
      }
      @keyframes cs-leverpull {
        0%   { transform: rotate(0deg); }
        40%  { transform: rotate(22deg); }
        100% { transform: rotate(0deg); }
      }
      @keyframes cs-reel3d {
        from { transform: rotateX(-20deg) scaleY(0.9); filter:brightness(.7); }
        to   { transform: rotateX(0deg)   scaleY(1);   filter:brightness(1); }
      }

      .cs-card-3d {
        perspective: 800px;
        transform-style: preserve-3d;
      }
      .cs-card-inner {
        transition: transform 0.45s cubic-bezier(.4,0,.2,1);
        transform-style: preserve-3d;
        position: relative;
      }
      .cs-card-face {
        backface-visibility: hidden;
        -webkit-backface-visibility: hidden;
        position: absolute; inset: 0;
        border-radius: 12px;
      }
      .cs-card-back {
        transform: rotateY(180deg);
      }

      .cs-lobby-card {
        transform-style: preserve-3d;
        transition: transform .2s ease, box-shadow .2s ease;
        cursor: pointer;
      }
      .cs-lobby-card:active {
        transform: translateZ(-8px) scale(.97) rotateX(4deg) !important;
      }

      .cs-chip {
        width: 44px; height: 44px; border-radius: 50%;
        display: flex; align-items: center; justify-content: center;
        font-family: 'Orbitron', sans-serif; font-size: .55rem; font-weight: 900;
        color: #fff; cursor: pointer; position: relative;
        box-shadow: 0 4px 0 rgba(0,0,0,.5), inset 0 2px 0 rgba(255,255,255,.25);
        transform-style: preserve-3d;
        transition: transform .12s, box-shadow .12s;
        border: 3px dashed rgba(255,255,255,.4);
        -webkit-tap-highlight-color: transparent;
      }
      .cs-chip:active {
        transform: translateY(3px) !important;
        box-shadow: 0 1px 0 rgba(0,0,0,.5), inset 0 2px 0 rgba(255,255,255,.25) !important;
      }

      .cs-btn-3d {
        position: relative;
        transform-style: preserve-3d;
        transition: transform .12s, filter .12s;
        -webkit-tap-highlight-color: transparent;
      }
      .cs-btn-3d::after {
        content: '';
        position: absolute;
        inset: 0;
        border-radius: inherit;
        transform: translateZ(-6px) translateY(6px);
        filter: brightness(.4);
        background: inherit;
        z-index: -1;
      }
      .cs-btn-3d:active {
        transform: translateY(4px) !important;
      }
      .cs-btn-3d:active::after {
        transform: translateZ(-2px) translateY(2px);
      }

      .cs-felt {
        background:
          radial-gradient(ellipse at 50% 0%, rgba(0,80,0,.6) 0%, transparent 70%),
          repeating-linear-gradient(
            45deg,
            rgba(0,0,0,.03) 0px, rgba(0,0,0,.03) 1px,
            transparent 1px, transparent 8px
          ),
          linear-gradient(160deg, #0a3a0a 0%, #062006 40%, #041804 100%);
        border: 2px solid rgba(255,215,0,.25);
        border-radius: 20px;
        box-shadow: inset 0 2px 8px rgba(0,0,0,.6), 0 8px 32px rgba(0,0,0,.8);
      }

      .cs-machine-body {
        background: linear-gradient(160deg, #2a1800 0%, #1a0f00 50%, #0f0800 100%);
        border-radius: 28px 28px 16px 16px;
        box-shadow:
          0 32px 80px rgba(0,0,0,.9),
          inset 0 1px 0 rgba(255,215,0,.15),
          inset 0 -2px 0 rgba(0,0,0,.8),
          8px 0 24px rgba(0,0,0,.6),
          -8px 0 24px rgba(0,0,0,.6);
        border: 1px solid rgba(255,215,0,.2);
        position: relative;
        transform: perspective(900px) rotateX(2deg);
        transform-origin: top center;
      }
    `;
    document.head.appendChild(st);
  }

  /* ── Header ── */
  const header = document.createElement('div');
  header.style.cssText = 'flex-shrink:0;padding:89px 18px 0;background:#050508;';
  root.appendChild(header);

  const headerRow = document.createElement('div');
  headerRow.style.cssText = 'display:flex;align-items:center;gap:12px;margin-bottom:14px;';
  headerRow.innerHTML = `
    <button id="cs-back" style="display:none;font-family:'Orbitron',sans-serif;font-size:.78rem;letter-spacing:.1em;text-transform:uppercase;color:#00ffcc;background:transparent;border:none;cursor:pointer;-webkit-tap-highlight-color:transparent;padding:6px 0;text-shadow:0 0 12px rgba(0,255,204,.5);">← Back</button>
    <div id="cs-title" style="font-family:'Orbitron',sans-serif;font-size:1.05rem;font-weight:900;letter-spacing:.1em;text-transform:uppercase;background:linear-gradient(135deg,#ffd700,#ff8c00);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;flex:1;">🎰 Casino</div>
    <div id="cs-wallet" style="font-family:'Share Tech Mono',monospace;font-size:.85rem;color:#ffd700;text-shadow:0 0 12px rgba(255,215,0,.6);letter-spacing:.06em;">🪙 ${_casinoCoins.toLocaleString()}</div>`;
  header.appendChild(headerRow);

  /* ── Body ── */
  const body = document.createElement('div');
  body.style.cssText = 'flex:1;overflow:hidden;position:relative;';
  root.appendChild(body);

  /* ── Wallet helpers ── */
  const refreshWalletDisplay = () => {
    const el = document.getElementById('cs-wallet');
    if (el) el.textContent = `🪙 ${_casinoCoins.toLocaleString()}`;
    const lb = document.getElementById('cs-lobby-bal');
    if (lb) lb.textContent = `🪙 ${_casinoCoins.toLocaleString()}`;
  };

  const updateWallet = (delta, refEl) => {
    _addCoins(delta);
    refreshWalletDisplay();
    if (delta !== 0 && refEl) {
      const float = document.createElement('div');
      float.style.cssText = `position:fixed;font-family:'Orbitron',sans-serif;font-size:.9rem;font-weight:900;color:${delta>0?'#ffd700':'#ff6b6b'};pointer-events:none;z-index:9999;animation:cs-coins .9s ease forwards;`;
      float.textContent = (delta > 0 ? '+' : '') + delta.toLocaleString();
      const r = refEl.getBoundingClientRect();
      float.style.left = (r.left + r.width/2 - 30) + 'px';
      float.style.top  = r.top + 'px';
      document.body.appendChild(float);
      setTimeout(() => float.remove(), 950);
    }
  };

  /* ════════════════════════════════════════════════════════════════
     LOBBY  — 3-D perspective cards
  ════════════════════════════════════════════════════════════════ */
  const lobbyPanel = document.createElement('div');
  lobbyPanel.style.cssText = 'position:absolute;inset:0;overflow-y:auto;-webkit-overflow-scrolling:touch;padding:12px 16px 60px;display:flex;flex-direction:column;gap:16px;perspective:1200px;';
  body.appendChild(lobbyPanel);

  const GAMES = [
    {id:'slots',     name:'Slot Machine', ico:'🎰', desc:'3 reels · Match symbols to win',      col:'#ffd700', grad:'linear-gradient(135deg,#4a2800,#1a0a00)', shadow:'rgba(255,180,0,.35)'},
    {id:'hilo',      name:'Hi-Lo',        ico:'🃏', desc:'Higher or lower than the last card?',  col:'#ff4444', grad:'linear-gradient(135deg,#2a0010,#0a0005)', shadow:'rgba(255,40,40,.3)'},
    {id:'blackjack', name:'Blackjack',    ico:'♠️', desc:'Beat the dealer · Get to 21',           col:'#00ffcc', grad:'linear-gradient(135deg,#003320,#000a08)', shadow:'rgba(0,255,180,.25)'},
  ];

  const lobbyHdr = document.createElement('div');
  lobbyHdr.style.cssText = 'font-family:"Share Tech Mono",monospace;font-size:.62rem;color:rgba(255,255,255,.3);letter-spacing:.18em;text-transform:uppercase;margin-bottom:2px;';
  lobbyHdr.textContent = 'Choose a game';
  lobbyPanel.appendChild(lobbyHdr);

  GAMES.forEach((g, gi) => {
    const card = document.createElement('div');
    card.className = 'cs-lobby-card';
    card.style.cssText = `
      padding:22px 20px;border-radius:22px;background:${g.grad};
      border:1px solid ${g.col}40;
      box-shadow: 0 12px 40px ${g.shadow}, 0 4px 12px rgba(0,0,0,.6), inset 0 1px 0 rgba(255,255,255,.06);
      position:relative;overflow:hidden;
      transform: perspective(800px) rotateX(${gi*0.5}deg) translateZ(0);
      animation: cs-tableslide .4s ${gi*0.08}s both;
    `;
    /* top accent bar + shimmer */
    card.innerHTML = `
      <div style="position:absolute;top:0;left:0;right:0;height:3px;background:linear-gradient(90deg,${g.col},transparent);box-shadow:0 0 12px ${g.col};"></div>
      <div style="position:absolute;top:0;left:-60%;width:40%;height:100%;background:linear-gradient(105deg,transparent,rgba(255,255,255,.06),transparent);pointer-events:none;transform:skewX(-15deg);transition:left .5s;"></div>
      <div style="display:flex;align-items:center;gap:16px;">
        <div style="font-size:2.8rem;line-height:1;flex-shrink:0;filter:drop-shadow(0 4px 8px rgba(0,0,0,.5));transform:translateZ(10px);">${g.ico}</div>
        <div style="transform:translateZ(6px);">
          <div style="font-family:'Orbitron',sans-serif;font-size:.9rem;font-weight:900;letter-spacing:.06em;color:${g.col};margin-bottom:5px;text-shadow:0 0 16px ${g.col}88;">${g.name}</div>
          <div style="font-family:'Share Tech Mono',monospace;font-size:.62rem;color:rgba(255,255,255,.4);letter-spacing:.06em;">${g.desc}</div>
        </div>
        <div style="margin-left:auto;font-size:1.6rem;color:${g.col};opacity:.6;transform:translateZ(8px);">›</div>
      </div>
    `;
    /* hover tilt */
    card.addEventListener('touchstart', () => {
      card.style.transform = `perspective(800px) rotateX(4deg) rotateY(-2deg) translateZ(8px) scale(1.01)`;
      card.style.boxShadow = `0 20px 60px ${g.shadow}, 0 8px 24px rgba(0,0,0,.7), inset 0 1px 0 rgba(255,255,255,.08)`;
      const shimmer = card.querySelector('div:nth-child(2)');
      if (shimmer) shimmer.style.left = '120%';
    }, {passive:true});
    card.addEventListener('touchend', () => {
      card.style.transform = `perspective(800px) rotateX(${gi*0.5}deg) translateZ(0)`;
      card.style.boxShadow = `0 12px 40px ${g.shadow}, 0 4px 12px rgba(0,0,0,.6), inset 0 1px 0 rgba(255,255,255,.06)`;
      const shimmer = card.querySelector('div:nth-child(2)');
      if (shimmer) shimmer.style.left = '-60%';
    }, {passive:true});
    card.addEventListener('click', () => openGame(g.id));
    lobbyPanel.appendChild(card);
  });

  /* balance card */
  const balCard = document.createElement('div');
  balCard.style.cssText = 'margin-top:4px;padding:18px 20px;border-radius:18px;background:rgba(255,215,0,.04);border:1px solid rgba(255,215,0,.12);text-align:center;box-shadow:0 8px 32px rgba(0,0,0,.5);animation:cs-tableslide .4s .24s both;';
  balCard.innerHTML = `
    <div style="font-family:'Share Tech Mono',monospace;font-size:.55rem;color:rgba(255,215,0,.45);letter-spacing:.18em;text-transform:uppercase;margin-bottom:6px;">Your Balance</div>
    <div id="cs-lobby-bal" style="font-family:'Orbitron',sans-serif;font-size:2rem;font-weight:900;color:#ffd700;text-shadow:0 0 24px rgba(255,215,0,.5),0 4px 8px rgba(0,0,0,.8);">🪙 ${_casinoCoins.toLocaleString()}</div>
    <button id="cs-refill" style="margin-top:10px;font-family:'Orbitron',sans-serif;font-size:.5rem;letter-spacing:.12em;text-transform:uppercase;color:rgba(255,255,255,.3);background:transparent;border:1px solid rgba(255,255,255,.08);padding:6px 16px;border-radius:12px;cursor:pointer;-webkit-tap-highlight-color:transparent;">Refill to 1,000</button>
  `;
  lobbyPanel.appendChild(balCard);
  document.getElementById('cs-refill').onclick = () => {
    if (_casinoCoins < 1000) { updateWallet(1000 - _casinoCoins, balCard); haptic('success'); }
  };

  /* ── Game panels ── */
  const gamePanels = {};
  const makePanel = () => {
    const p = document.createElement('div');
    p.style.cssText = 'position:absolute;inset:0;overflow-y:auto;-webkit-overflow-scrolling:touch;padding:10px 16px 60px;transform:translateX(100%);transition:transform .32s cubic-bezier(.34,1.56,.64,1);';
    body.appendChild(p);
    return p;
  };

  /* ── Open / close ── */
  const openGame = id => {
    haptic('medium');
    activeGame = id;
    const g = GAMES.find(g=>g.id===id);
    document.getElementById('cs-title').textContent = g.name;
    document.getElementById('cs-title').style.cssText = 'font-family:"Orbitron",sans-serif;font-size:1rem;font-weight:900;letter-spacing:.08em;text-transform:uppercase;color:#00ffcc;text-shadow:0 0 16px rgba(0,255,204,.5);flex:1;background:none;-webkit-text-fill-color:unset;';
    document.getElementById('cs-back').style.display = '';
    lobbyPanel.style.transition = 'transform .32s cubic-bezier(.34,1.56,.64,1)';
    lobbyPanel.style.transform  = 'translateX(-100%)';
    if (!gamePanels[id]) {
      gamePanels[id] = makePanel();
      if (id==='slots')     buildSlots(gamePanels[id]);
      if (id==='hilo')      buildHiLo(gamePanels[id]);
      if (id==='blackjack') buildBlackjack(gamePanels[id]);
    }
    gamePanels[id].style.transform = 'translateX(0)';
  };

  const closeGame = () => {
    haptic('light');
    if (gamePanels[activeGame]) gamePanels[activeGame].style.transform = 'translateX(100%)';
    lobbyPanel.style.transform = 'translateX(0)';
    document.getElementById('cs-title').innerHTML = '';
    document.getElementById('cs-title').style.cssText = 'font-family:"Orbitron",sans-serif;font-size:1.05rem;font-weight:900;letter-spacing:.1em;text-transform:uppercase;background:linear-gradient(135deg,#ffd700,#ff8c00);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;flex:1;';
    document.getElementById('cs-title').textContent = '🎰 Casino';
    document.getElementById('cs-back').style.display = 'none';
    activeGame = null;
    refreshWalletDisplay();
  };
  document.getElementById('cs-back').addEventListener('click', closeGame);

  /* ════════════════════════════════════════════════════════════════
     SLOT MACHINE  — 3-D cabinet rendered on canvas
  ════════════════════════════════════════════════════════════════ */
  const buildSlots = wrap => {
    wrap.innerHTML = '';
    wrap.style.cssText = 'position:absolute;inset:0;overflow-y:auto;-webkit-overflow-scrolling:touch;background:#06040a;display:flex;flex-direction:column;align-items:center;';

    const coinLayer = document.createElement('div');
    coinLayer.style.cssText = 'position:fixed;inset:0;pointer-events:none;overflow:hidden;z-index:9999;';
    document.body.appendChild(coinLayer);

    const container = document.createElement('div');
    container.style.cssText = 'width:100%;flex-shrink:0;';
    wrap.appendChild(container);

    const cv = document.createElement('canvas');
    container.appendChild(cv);
    const ctx = cv.getContext('2d');

    const resize = () => {
      const W = container.offsetWidth || window.innerWidth || 360;
      const H = Math.round(W * 1.72);
      if (cv.width === W && cv.height === H) return;
      cv.width = W; cv.height = H;
      cv.style.width = W + 'px';
      cv.style.height = H + 'px';
    };

    const STRIP = [
      'CHERRY','BAR',      'BELL',    'TWO_BAR',
      'CHERRY','THREE_BAR','BAR',     'BELL',
      'DIAMOND','CHERRY',  'BAR',     'TWO_BAR',
      'BELL',  'CHERRY',  'THREE_BAR','BAR',
      'CHERRY','TWO_BAR', 'BELL',     'DIAMOND',
      'SEVEN', 'BAR',     'CHERRY',   'BELL'
    ];
    const SL = STRIP.length;

    const PAYS = {
      'SEVEN|SEVEN|SEVEN':             100,
      'DIAMOND|DIAMOND|DIAMOND':        50,
      'THREE_BAR|THREE_BAR|THREE_BAR':  30,
      'TWO_BAR|TWO_BAR|TWO_BAR':        20,
      'BAR|BAR|BAR':                    15,
      'BELL|BELL|BELL':                 12,
      'CHERRY|CHERRY|CHERRY':           10
    };

    /* ── rounded-rect helper ── */
    const rr = (x, y, w, h, r) => {
      r = Math.min(r, w/2, h/2);
      ctx.beginPath();
      ctx.moveTo(x+r, y);
      ctx.lineTo(x+w-r, y);   ctx.arcTo(x+w, y,     x+w, y+r,     r);
      ctx.lineTo(x+w, y+h-r); ctx.arcTo(x+w, y+h, x+w-r, y+h,   r);
      ctx.lineTo(x+r, y+h);   ctx.arcTo(x,   y+h, x,     y+h-r,  r);
      ctx.lineTo(x,   y+r);   ctx.arcTo(x,   y,   x+r,   y,       r);
      ctx.closePath();
    };

    /* ── gold gradient ── */
    const gold = (x1,y1,x2,y2) => {
      const g = ctx.createLinearGradient(x1,y1,x2,y2);
      g.addColorStop(0,   '#5a3800');
      g.addColorStop(0.2, '#d4a800');
      g.addColorStop(0.5, '#ffe566');
      g.addColorStop(0.8, '#d4a800');
      g.addColorStop(1,   '#5a3800');
      return g;
    };

    /* ── 3D bevel helper ── */
    const bevel3d = (x, y, w, h, r, depth, col) => {
      /* shadow face (bottom) */
      rr(x+depth, y+depth, w, h, r);
      ctx.fillStyle = 'rgba(0,0,0,.7)'; ctx.fill();
      /* main face */
      rr(x, y, w, h, r);
      ctx.fillStyle = col; ctx.fill();
      /* top highlight */
      rr(x, y, w, h*0.18, r);
      ctx.fillStyle = 'rgba(255,255,255,.12)'; ctx.fill();
    };

    /* ── symbol drawing ── */
    /* ══════════════════════════════════════════════════════════
       drawSym — photorealistic 3-D symbols
       Each symbol uses layered radial/linear gradients, specular
       highlights, cast shadows and rim lighting to achieve depth.
    ══════════════════════════════════════════════════════════ */
    const drawSym = (sym, sz, alpha) => {
      if (alpha <= 0.02) return;
      ctx.save();
      ctx.globalAlpha = Math.min(1, alpha);
      const h = sz * 0.78;

      /* ── helper: sphere gloss ── */
      const sphereGloss = (cx2, cy2, r, baseCol1, baseCol2, shadowCol) => {
        /* cast shadow */
        ctx.beginPath(); ctx.ellipse(cx2 + r*0.18, cy2 + r*0.22, r*0.80, r*0.22, 0, 0, Math.PI*2);
        ctx.fillStyle = 'rgba(0,0,0,0.35)'; ctx.fill();
        /* main sphere */
        const sph = ctx.createRadialGradient(cx2 - r*0.30, cy2 - r*0.32, r*0.04, cx2, cy2, r);
        sph.addColorStop(0, '#fff');
        sph.addColorStop(0.15, baseCol1);
        sph.addColorStop(0.55, baseCol2);
        sph.addColorStop(1, shadowCol);
        ctx.beginPath(); ctx.arc(cx2, cy2, r, 0, Math.PI*2);
        ctx.fillStyle = sph; ctx.fill();
        /* rim light (back-scatter) */
        const rim = ctx.createRadialGradient(cx2 + r*0.55, cy2 + r*0.55, 0, cx2, cy2, r);
        rim.addColorStop(0.72, 'transparent');
        rim.addColorStop(1, 'rgba(255,255,255,0.12)');
        ctx.beginPath(); ctx.arc(cx2, cy2, r, 0, Math.PI*2);
        ctx.fillStyle = rim; ctx.fill();
        /* specular hot spot */
        ctx.beginPath(); ctx.ellipse(cx2 - r*0.28, cy2 - r*0.30, r*0.26, r*0.16, -0.5, 0, Math.PI*2);
        ctx.fillStyle = 'rgba(255,255,255,0.72)'; ctx.fill();
        /* secondary micro-glint */
        ctx.beginPath(); ctx.ellipse(cx2 - r*0.10, cy2 - r*0.46, r*0.08, r*0.05, -0.3, 0, Math.PI*2);
        ctx.fillStyle = 'rgba(255,255,255,0.55)'; ctx.fill();
      };

      if (sym === 'BLANK') {
        ctx.strokeStyle = 'rgba(180,160,120,0.14)';
        ctx.lineWidth = h * 0.04; ctx.lineCap = 'round';
        ctx.beginPath(); ctx.moveTo(-h*0.20, 0); ctx.lineTo(h*0.20, 0); ctx.stroke();
        ctx.restore(); return;
      }

      /* ────────────── CHERRY ────────────── */
      if (sym === 'CHERRY') {
        const r2 = h * 0.195;
        /* stem cast shadow */
        ctx.save(); ctx.translate(3, 5); ctx.globalAlpha *= 0.3;
        ctx.strokeStyle = '#000'; ctx.lineWidth = h*0.065; ctx.lineCap = 'round';
        ctx.beginPath(); ctx.moveTo(-r2, -h*0.12); ctx.quadraticCurveTo(0, -h*0.42, r2, -h*0.12);
        ctx.moveTo(-r2, -h*0.12); ctx.lineTo(-r2, h*0.08 - r2);
        ctx.moveTo(r2, -h*0.12); ctx.lineTo(r2, h*0.04 - r2); ctx.stroke();
        ctx.restore();
        /* stems */
        ctx.strokeStyle = '#2d6b00'; ctx.lineWidth = h*0.062; ctx.lineCap = 'round';
        ctx.shadowColor = 'rgba(0,0,0,0.4)'; ctx.shadowBlur = 3;
        ctx.beginPath(); ctx.moveTo(-r2, -h*0.12); ctx.quadraticCurveTo(0, -h*0.42, r2, -h*0.12); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(-r2, -h*0.12); ctx.lineTo(-r2, h*0.08 - r2); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(r2, -h*0.12); ctx.lineTo(r2, h*0.04 - r2); ctx.stroke();
        ctx.shadowBlur = 0;
        /* leaf */
        ctx.save(); ctx.translate(0, -h*0.30);
        ctx.beginPath(); ctx.ellipse(0, 0, r2*0.55, r2*0.28, -0.4, 0, Math.PI*2);
        const leafG = ctx.createLinearGradient(-r2*0.5, -r2*0.3, r2*0.5, r2*0.3);
        leafG.addColorStop(0, '#88dd44'); leafG.addColorStop(1, '#226600');
        ctx.fillStyle = leafG; ctx.fill(); ctx.restore();
        /* left cherry */
        sphereGloss(-r2, h*0.08, r2, '#ff9999', '#dd0000', '#5a0000');
        /* right cherry */
        sphereGloss(r2, h*0.04, r2, '#ff9999', '#ee0000', '#5a0000');
      }

      /* ────────────── SEVEN ────────────── */
      else if (sym === 'SEVEN') {
        const fs = Math.round(h * 0.80);
        ctx.font = '900 ' + fs + 'px Arial,sans-serif';
        ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
        /* deep 3D extrusion layers */
        for (let d = 6; d >= 1; d--) {
          const t2 = d / 6;
          ctx.fillStyle = `rgb(${Math.round(80*t2)},0,0)`;
          ctx.fillText('7', d * 1.1, h*0.05 + d * 1.1);
        }
        /* stroke outline */
        ctx.strokeStyle = '#1a0000'; ctx.lineWidth = h * 0.10;
        ctx.lineJoin = 'round'; ctx.strokeText('7', 0, h * 0.05);
        /* main face gradient */
        const sevG = ctx.createLinearGradient(0, -h*0.38, 0, h*0.38);
        sevG.addColorStop(0, '#ffcccc');
        sevG.addColorStop(0.25, '#ff4400');
        sevG.addColorStop(0.65, '#cc1100');
        sevG.addColorStop(1, '#660000');
        ctx.fillStyle = sevG; ctx.fillText('7', 0, h * 0.05);
        /* specular streak across the 7 */
        ctx.save(); ctx.globalCompositeOperation = 'source-atop';
        const sevSpec = ctx.createLinearGradient(-h*0.3, -h*0.38, h*0.1, -h*0.10);
        sevSpec.addColorStop(0, 'rgba(255,255,255,0)');
        sevSpec.addColorStop(0.4, 'rgba(255,255,255,0.38)');
        sevSpec.addColorStop(1, 'rgba(255,255,255,0)');
        ctx.fillStyle = sevSpec; ctx.fillText('7', 0, h * 0.05);
        ctx.restore();
      }

      /* ────────────── BAR ────────────── */
      else if (sym === 'BAR') {
        const bw = h*0.84, bh = h*0.29;
        const br = bh * 0.30;
        const rr2 = (x,y,w2,h2,r3) => {
          r3 = Math.min(r3, w2/2, h2/2);
          ctx.beginPath();
          ctx.moveTo(x+r3,y); ctx.lineTo(x+w2-r3,y); ctx.arcTo(x+w2,y,x+w2,y+r3,r3);
          ctx.lineTo(x+w2,y+h2-r3); ctx.arcTo(x+w2,y+h2,x+w2-r3,y+h2,r3);
          ctx.lineTo(x+r3,y+h2); ctx.arcTo(x,y+h2,x,y+h2-r3,r3);
          ctx.lineTo(x,y+r3); ctx.arcTo(x,y,x+r3,y,r3); ctx.closePath();
        };
        /* cast shadow */
        ctx.save(); ctx.translate(4, 6);
        rr2(-bw/2, -bh/2, bw, bh, br); ctx.fillStyle = 'rgba(0,0,0,0.4)'; ctx.fill();
        ctx.restore();
        /* bottom extrusion edge */
        rr2(-bw/2+3, -bh/2+5, bw, bh, br);
        ctx.fillStyle = 'rgba(0,0,0,0.55)'; ctx.fill();
        /* side extrusion */
        ctx.save(); ctx.translate(3, 3);
        rr2(-bw/2, -bh/2, bw, bh, br);
        ctx.fillStyle = '#555'; ctx.fill(); ctx.restore();
        /* main face */
        rr2(-bw/2, -bh/2, bw, bh, br);
        const barG = ctx.createLinearGradient(-bw/2, -bh/2, -bw/2, bh/2);
        barG.addColorStop(0, '#e8e0d0');
        barG.addColorStop(0.12, '#ffffff');
        barG.addColorStop(0.5, '#d8d0c0');
        barG.addColorStop(0.88, '#a09080');
        barG.addColorStop(1, '#706050');
        ctx.fillStyle = barG; ctx.fill();
        ctx.strokeStyle = '#4a3820'; ctx.lineWidth = 1.4;
        rr2(-bw/2, -bh/2, bw, bh, br); ctx.stroke();
        /* embossed text */
        ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
        ctx.font = '900 ' + Math.round(bh*0.68) + 'px Arial,sans-serif';
        /* shadow layer */
        ctx.fillStyle = 'rgba(0,0,0,0.5)'; ctx.fillText('BAR', 1, 2);
        /* main text */
        const txtG = ctx.createLinearGradient(0, -bh*0.3, 0, bh*0.3);
        txtG.addColorStop(0, '#3a2810');
        txtG.addColorStop(0.5, '#1a0c00');
        txtG.addColorStop(1, '#3a2810');
        ctx.fillStyle = txtG; ctx.fillText('BAR', 0, 1);
        /* top sheen on bar face */
        rr2(-bw/2, -bh/2, bw, bh*0.20, br);
        ctx.fillStyle = 'rgba(255,255,255,0.28)'; ctx.fill();
      }

      /* ────────────── TWO_BAR ────────────── */
      else if (sym === 'TWO_BAR') {
        const bw = h*0.82, bh = h*0.175, gap = h*0.118;
        const br = bh*0.30;
        const rr2 = (x,y,w2,h2,r3) => {
          r3 = Math.min(r3, w2/2, h2/2);
          ctx.beginPath();
          ctx.moveTo(x+r3,y); ctx.lineTo(x+w2-r3,y); ctx.arcTo(x+w2,y,x+w2,y+r3,r3);
          ctx.lineTo(x+w2,y+h2-r3); ctx.arcTo(x+w2,y+h2,x+w2-r3,y+h2,r3);
          ctx.lineTo(x+r3,y+h2); ctx.arcTo(x,y+h2,x,y+h2-r3,r3);
          ctx.lineTo(x,y+r3); ctx.arcTo(x,y,x+r3,y,r3); ctx.closePath();
        };
        [-1, 1].forEach(d => {
          const cy3 = d * gap;
          ctx.save(); ctx.translate(3, 5); rr2(-bw/2, cy3-bh/2, bw, bh, br);
          ctx.fillStyle = 'rgba(0,0,0,0.35)'; ctx.fill(); ctx.restore();
          ctx.save(); ctx.translate(2, 3); rr2(-bw/2, cy3-bh/2, bw, bh, br);
          ctx.fillStyle = '#555'; ctx.fill(); ctx.restore();
          rr2(-bw/2, cy3-bh/2, bw, bh, br);
          const g2 = ctx.createLinearGradient(-bw/2, cy3-bh/2, -bw/2, cy3+bh/2);
          g2.addColorStop(0,'#f0e8d8');g2.addColorStop(0.12,'#fff');
          g2.addColorStop(0.55,'#d0c8b8');g2.addColorStop(1,'#887060');
          ctx.fillStyle = g2; ctx.fill();
          ctx.strokeStyle = '#4a3820'; ctx.lineWidth = 1.2; rr2(-bw/2,cy3-bh/2,bw,bh,br); ctx.stroke();
          ctx.textAlign='center';ctx.textBaseline='middle';
          ctx.font='900 '+Math.round(bh*0.66)+'px Arial,sans-serif';
          ctx.fillStyle='rgba(0,0,0,0.45)';ctx.fillText('BAR',1,cy3+2);
          const tg2=ctx.createLinearGradient(0,cy3-bh*0.3,0,cy3+bh*0.3);
          tg2.addColorStop(0,'#3a2810');tg2.addColorStop(0.5,'#1a0c00');tg2.addColorStop(1,'#3a2810');
          ctx.fillStyle=tg2;ctx.fillText('BAR',0,cy3+1);
          rr2(-bw/2,cy3-bh/2,bw,bh*0.22,br);ctx.fillStyle='rgba(255,255,255,0.25)';ctx.fill();
        });
      }

      /* ────────────── THREE_BAR ────────────── */
      else if (sym === 'THREE_BAR') {
        const bw = h*0.80, bh = h*0.134, gap = h*0.106;
        const br = bh*0.30;
        const rr2 = (x,y,w2,h2,r3) => {
          r3 = Math.min(r3, w2/2, h2/2);
          ctx.beginPath();
          ctx.moveTo(x+r3,y); ctx.lineTo(x+w2-r3,y); ctx.arcTo(x+w2,y,x+w2,y+r3,r3);
          ctx.lineTo(x+w2,y+h2-r3); ctx.arcTo(x+w2,y+h2,x+w2-r3,y+h2,r3);
          ctx.lineTo(x+r3,y+h2); ctx.arcTo(x,y+h2,x,y+h2-r3,r3);
          ctx.lineTo(x,y+r3); ctx.arcTo(x,y,x+r3,y,r3); ctx.closePath();
        };
        [-1, 0, 1].forEach(d => {
          const cy3 = d * gap;
          ctx.save();ctx.translate(2,4);rr2(-bw/2,cy3-bh/2,bw,bh,br);ctx.fillStyle='rgba(0,0,0,0.32)';ctx.fill();ctx.restore();
          ctx.save();ctx.translate(1.5,2);rr2(-bw/2,cy3-bh/2,bw,bh,br);ctx.fillStyle='#555';ctx.fill();ctx.restore();
          rr2(-bw/2,cy3-bh/2,bw,bh,br);
          const g3=ctx.createLinearGradient(-bw/2,cy3-bh/2,-bw/2,cy3+bh/2);
          g3.addColorStop(0,'#ece4d4');g3.addColorStop(0.12,'#fff');
          g3.addColorStop(0.55,'#ccc4b4');g3.addColorStop(1,'#807060');
          ctx.fillStyle=g3;ctx.fill();
          ctx.strokeStyle='#4a3820';ctx.lineWidth=1.0;rr2(-bw/2,cy3-bh/2,bw,bh,br);ctx.stroke();
          ctx.textAlign='center';ctx.textBaseline='middle';
          ctx.font='900 '+Math.round(bh*0.64)+'px Arial,sans-serif';
          ctx.fillStyle='rgba(0,0,0,0.40)';ctx.fillText('BAR',1,cy3+1.5);
          const tg3=ctx.createLinearGradient(0,cy3-bh*0.3,0,cy3+bh*0.3);
          tg3.addColorStop(0,'#3a2810');tg3.addColorStop(0.5,'#1a0c00');tg3.addColorStop(1,'#3a2810');
          ctx.fillStyle=tg3;ctx.fillText('BAR',0,cy3+1);
          rr2(-bw/2,cy3-bh/2,bw,bh*0.22,br);ctx.fillStyle='rgba(255,255,255,0.22)';ctx.fill();
        });
      }

      /* ────────────── BELL ────────────── */
      else if (sym === 'BELL') {
        const br = h * 0.36;
        const bellPath = () => {
          ctx.beginPath();
          ctx.moveTo(-br*0.66, br*0.30);
          ctx.bezierCurveTo(-br*0.66,-br*0.36,-br*0.18,-br*0.94, 0,-br*0.94);
          ctx.bezierCurveTo( br*0.18,-br*0.94, br*0.66,-br*0.36, br*0.66, br*0.30);
          ctx.closePath();
        };
        /* cast shadow */
        ctx.save(); ctx.translate(5, 7); ctx.globalAlpha *= 0.35;
        bellPath(); ctx.fillStyle='#000'; ctx.fill(); ctx.restore();
        /* 3D extrusion right side */
        ctx.save(); ctx.translate(4, 4);
        bellPath(); ctx.fillStyle='#806000'; ctx.fill(); ctx.restore();
        ctx.save(); ctx.translate(2, 2);
        bellPath(); ctx.fillStyle='#a07800'; ctx.fill(); ctx.restore();
        /* main bell face */
        bellPath();
        const bellG = ctx.createRadialGradient(-br*0.22, -br*0.45, 0, 0, 0, br*1.1);
        bellG.addColorStop(0,'#fff8aa');
        bellG.addColorStop(0.18,'#ffe033');
        bellG.addColorStop(0.55,'#cc8800');
        bellG.addColorStop(0.85,'#885500');
        bellG.addColorStop(1,'#4a2800');
        ctx.fillStyle=bellG; ctx.fill();
        ctx.strokeStyle='#5a3800'; ctx.lineWidth=1.6; bellPath(); ctx.stroke();
        /* yoke */
        ctx.save(); ctx.translate(2,2);
        ctx.beginPath(); ctx.roundRect(-br*0.72,br*0.22,br*1.44,br*0.22,br*0.08);
        ctx.fillStyle='#6a4800'; ctx.fill(); ctx.restore();
        ctx.beginPath(); ctx.roundRect(-br*0.72,br*0.22,br*1.44,br*0.22,br*0.08);
        const yokeG=ctx.createLinearGradient(-br*0.72,br*0.22,-br*0.72,br*0.44);
        yokeG.addColorStop(0,'#ffe033');yokeG.addColorStop(0.4,'#cc9900');yokeG.addColorStop(1,'#7a5500');
        ctx.fillStyle=yokeG;ctx.fill();ctx.strokeStyle='#5a3800';ctx.lineWidth=1.2;ctx.stroke();
        /* clapper */
        sphereGloss(0, br*0.50, br*0.15, '#ffe066','#cc8800','#4a2800');
        /* specular hot spot */
        ctx.beginPath(); ctx.ellipse(-br*0.18,-br*0.32,br*0.26,br*0.14,-0.5,0,Math.PI*2);
        ctx.fillStyle='rgba(255,255,255,0.60)';ctx.fill();
        /* secondary glint */
        ctx.beginPath(); ctx.ellipse(-br*0.04,-br*0.52,br*0.09,br*0.05,-0.3,0,Math.PI*2);
        ctx.fillStyle='rgba(255,255,255,0.45)';ctx.fill();
      }

      /* ────────────── DIAMOND ────────────── */
      else if (sym === 'DIAMOND') {
        const dr = h * 0.38;
        /* gem facet geometry */
        const top   = [0, -dr];
        const left  = [-dr*0.66, -dr*0.06];
        const right = [ dr*0.66, -dr*0.06];
        const bL    = [-dr*0.52,  dr*0.52];
        const bR    = [ dr*0.52,  dr*0.52];
        const bot   = [0, dr];
        const faces = [
          { pts:[top,right,[dr*0.24,-dr*0.06]],    col:'#c8eeff' },
          { pts:[top,left, [-dr*0.24,-dr*0.06]],   col:'#88ccff' },
          { pts:[top,[dr*0.24,-dr*0.06],right],     col:'#aaddff' },
          { pts:[right,bR,bot],                     col:'#2255cc' },
          { pts:[left,bL,bot],                      col:'#1133aa' },
          { pts:[right,bR,[dr*0.24,-dr*0.06]],      col:'#4477dd' },
          { pts:[left,bL,[-dr*0.24,-dr*0.06]],      col:'#3366cc' },
          { pts:[top,[dr*0.24,-dr*0.06],[-dr*0.24,-dr*0.06]],col:'#ddf0ff'},
          { pts:[bL,bR,bot],                        col:'#0022aa' },
        ];
        const outline = [top, right, bR, bot, bL, left];
        /* cast shadow */
        ctx.save(); ctx.translate(5, 7); ctx.globalAlpha *= 0.3;
        ctx.beginPath(); outline.forEach(([px,py],i)=>i===0?ctx.moveTo(px,py):ctx.lineTo(px,py)); ctx.closePath();
        ctx.fillStyle='rgba(0,0,50,0.5)';ctx.fill();ctx.restore();
        /* draw each facet */
        faces.forEach(({pts, col}) => {
          ctx.beginPath(); pts.forEach(([px,py],i)=>i===0?ctx.moveTo(px,py):ctx.lineTo(px,py)); ctx.closePath();
          ctx.fillStyle=col; ctx.fill();
          ctx.strokeStyle='rgba(255,255,255,0.12)';ctx.lineWidth=0.7;ctx.stroke();
        });
        /* outer edge */
        ctx.beginPath(); outline.forEach(([px,py],i)=>i===0?ctx.moveTo(px,py):ctx.lineTo(px,py)); ctx.closePath();
        ctx.strokeStyle='#1144cc';ctx.lineWidth=1.5;ctx.stroke();
        /* large specular highlight top facet */
        ctx.beginPath(); ctx.ellipse(-dr*0.08,-dr*0.22,dr*0.30,dr*0.14,-0.3,0,Math.PI*2);
        ctx.fillStyle='rgba(255,255,255,0.75)';ctx.fill();
        /* micro glint */
        ctx.beginPath(); ctx.ellipse(dr*0.14,-dr*0.34,dr*0.10,dr*0.06,0.4,0,Math.PI*2);
        ctx.fillStyle='rgba(255,255,255,0.55)';ctx.fill();
        /* iridescent color scatter */
        ctx.beginPath(); ctx.ellipse(dr*0.30,dr*0.08,dr*0.12,dr*0.06,0.8,0,Math.PI*2);
        ctx.fillStyle='rgba(180,220,255,0.30)';ctx.fill();
      }

      ctx.restore();
    };


    /* ── reel state ── */
    const reels = [0,1,2].map(()=>({
      offset: Math.floor(Math.random()*SL)*1.0,
      speed:0, targetOffset:-1, stopped:true
    }));

    const BET=50;
    let credits=_casinoCoins;
    let coinInserted=false,spinning=false;
    let leverY=0,leverDragging=false,leverDragStartY=0,leverDragStartVal=0,leverVel=0;
    let resultMsg='',resultCol='#ffd700',winAmount=0,flashT=0,rafId=null;

    /* ── draw single reel ── */
    const drawReel = (idx, rx, ry, rw, rh) => {
      const R=reels[idx];
      const symH=rh/3;

      /* 3D reel housing depth */
      rr(rx+4, ry+6, rw, rh, 4);
      ctx.fillStyle='rgba(0,0,0,.5)'; ctx.fill();

      rr(rx,ry,rw,rh,4);
      const ibg=ctx.createLinearGradient(rx,ry,rx+rw,ry);
      ibg.addColorStop(0,'#d8d2ba'); ibg.addColorStop(0.5,'#f5f0e2'); ibg.addColorStop(1,'#ccc8b0');
      ctx.fillStyle=ibg; ctx.fill();

      ctx.save(); rr(rx,ry,rw,rh,4); ctx.clip();

      const base=Math.floor(R.offset), frac=R.offset-base;
      for(let row=-1;row<=3;row++){
        const si=((base+row)%SL+SL)%SL;
        const sym=STRIP[si];
        const rawCY=ry+(row-frac)*symH+symH*0.5;
        if(rawCY<ry-symH||rawCY>ry+rh+symH) continue;
        const norm=(rawCY-(ry+rh*0.5))/(rh*0.5);
        /* 3D cylinder perspective warp */
        const scaleY=Math.max(0.18,Math.cos(norm*Math.PI*0.42));
        const alpha=Math.max(0,1-Math.abs(norm)*1.18);
        /* slight horizontal squeeze toward centre of reel = 3D drum illusion */
        const scaleX=Math.max(0.88,1-Math.abs(norm)*0.08);
        ctx.save(); ctx.translate(rx+rw*0.5,rawCY); ctx.scale(scaleX,scaleY);
        drawSym(sym,symH,alpha);
        ctx.restore();
        /* separator line */
        const lineY=ry+(row-frac+1)*symH;
        if(lineY>ry+1&&lineY<ry+rh-1){
          ctx.strokeStyle='rgba(160,145,115,0.28)'; ctx.lineWidth=0.7;
          ctx.beginPath(); ctx.moveTo(rx+3,lineY); ctx.lineTo(rx+rw-3,lineY); ctx.stroke();
        }
      }
      ctx.restore();

      /* top/bottom shade for 3D cylinder illusion */
      const ts=ctx.createLinearGradient(rx,ry,rx,ry+rh*0.30);
      ts.addColorStop(0,'rgba(0,0,0,0.60)'); ts.addColorStop(1,'rgba(0,0,0,0)');
      rr(rx,ry,rw,rh*0.30,4); ctx.fillStyle=ts; ctx.fill();
      const bs=ctx.createLinearGradient(rx,ry+rh*0.70,rx,ry+rh);
      bs.addColorStop(0,'rgba(0,0,0,0)'); bs.addColorStop(1,'rgba(0,0,0,0.60)');
      rr(rx,ry+rh*0.70,rw,rh*0.30,4); ctx.fillStyle=bs; ctx.fill();

      /* gold bezel — shadow then front */
      rr(rx+2,ry+4,rw,rh,6); ctx.strokeStyle='rgba(0,0,0,.5)'; ctx.lineWidth=4; ctx.stroke();
      rr(rx-2.5,ry-2.5,rw+5,rh+5,6);
      ctx.strokeStyle=gold(rx-2.5,ry-2.5,rx+rw+2.5,ry+rh+2.5); ctx.lineWidth=3.5; ctx.stroke();
    };

    /* ── main draw ── */
    const draw = () => {
      const W=cv.width,H=cv.height;
      if(!W||!H) return;
      ctx.clearRect(0,0,W,H);
      const t=flashT;

      /* layout constants */
      const G=W*0.050;
      const CX=W*0.028, CY=H*0.008;
      const CaW=W*0.880, CaH=H*0.975;
      const iX=CX+G, iW=CaW-G*2;
      const signY=CY+G, signH=CaH*0.108;
      const payY=signY+signH, payH=CaH*0.165;
      const reelY=payY+payH, reelH=CaH*0.270;
      const midY=reelY+reelH, midH=CaH*0.108;
      const lowY=midY+midH, lowH=CaH*0.240;
      const trayY=lowY+lowH, trayH=CaH-(trayY-CY)-G;
      const sideW=iW*0.082;
      const rAreaX=iX+sideW, rAreaW=iW-sideW*2;
      const rGap=W*0.012, rW=(rAreaW-rGap*2)/3;
      const levX=CX+CaW+W*0.022;
      const levPivY=reelY+reelH*0.22;
      const levLen=reelH*1.06, ballR=W*0.050;
      const lpMax=levLen*0.84;
      const curBY=levPivY+leverY*lpMax;

      /* ── cabinet body with 3D side faces ── */
      /* left side face */
      ctx.beginPath();
      ctx.moveTo(CX,CY+CaH*0.04);
      ctx.lineTo(CX-W*0.018,CY+CaH*0.06);
      ctx.lineTo(CX-W*0.018,CY+CaH);
      ctx.lineTo(CX,CY+CaH);
      ctx.closePath();
      ctx.fillStyle=ctx.createLinearGradient(CX-W*0.018,0,CX,0);
      const lfg=ctx.createLinearGradient(CX-W*0.018,0,CX,0);
      lfg.addColorStop(0,'#080500'); lfg.addColorStop(1,'#1a0e00');
      ctx.fillStyle=lfg; ctx.fill();
      ctx.strokeStyle='rgba(80,50,0,.4)'; ctx.lineWidth=1; ctx.stroke();

      /* right side face */
      ctx.beginPath();
      ctx.moveTo(CX+CaW,CY+CaH*0.04);
      ctx.lineTo(CX+CaW+W*0.018,CY+CaH*0.06);
      ctx.lineTo(CX+CaW+W*0.018,CY+CaH);
      ctx.lineTo(CX+CaW,CY+CaH);
      ctx.closePath();
      const rfg=ctx.createLinearGradient(CX+CaW,0,CX+CaW+W*0.018,0);
      rfg.addColorStop(0,'#1a0e00'); rfg.addColorStop(1,'#080500');
      ctx.fillStyle=rfg; ctx.fill();
      ctx.strokeStyle='rgba(80,50,0,.4)'; ctx.lineWidth=1; ctx.stroke();

      /* top bevel face */
      ctx.beginPath();
      ctx.moveTo(CX,CY);
      ctx.lineTo(CX+CaW,CY);
      ctx.lineTo(CX+CaW+W*0.018,CY+CaH*0.06);
      ctx.lineTo(CX-W*0.018,CY+CaH*0.06);
      ctx.closePath();
      const tbg=ctx.createLinearGradient(CX,CY,CX,CY+CaH*0.06);
      tbg.addColorStop(0,'#3a2000'); tbg.addColorStop(1,'#1a0e00');
      ctx.fillStyle=tbg; ctx.fill();
      ctx.strokeStyle=gold(CX,CY,CX+CaW,CY); ctx.lineWidth=1.5; ctx.stroke();

      /* cabinet front */
      rr(CX,CY,CaW,CaH,W*0.026);
      const cbg=ctx.createLinearGradient(CX,CY,CX,CY+CaH);
      cbg.addColorStop(0,'#1e1100'); cbg.addColorStop(0.4,'#130c00'); cbg.addColorStop(1,'#0a0600');
      ctx.fillStyle=cbg; ctx.fill();
      rr(CX,CY,CaW,CaH,W*0.026);
      ctx.strokeStyle=gold(CX,CY,CX+CaW,CY+CaH); ctx.lineWidth=G*1.8; ctx.stroke();
      rr(CX+G*0.5,CY+G*0.5,CaW-G,CaH-G,W*0.020);
      ctx.strokeStyle='rgba(255,210,60,0.22)'; ctx.lineWidth=1; ctx.stroke();

      /* ── sign panel ── */
      const sx=iX+1,sy=signY,sw2=iW-2,sh=signH-3;
      rr(sx+3,sy+4,sw2,sh,W*0.016); ctx.fillStyle='rgba(0,0,0,.5)'; ctx.fill();
      rr(sx,sy,sw2,sh,W*0.016);
      const sgbg=ctx.createLinearGradient(sx,sy,sx,sy+sh);
      sgbg.addColorStop(0,'#06061a'); sgbg.addColorStop(0.5,'#0c0c28'); sgbg.addColorStop(1,'#06061a');
      ctx.fillStyle=sgbg; ctx.fill();
      rr(sx,sy,sw2,sh,W*0.016);
      ctx.strokeStyle=gold(sx,sy,sx+sw2,sy+sh); ctx.lineWidth=2.2; ctx.stroke();

      /* bulb row */
      [sy+sh*0.10,sy+sh*0.90].forEach(dotY=>{
        for(let i=0;i<22;i++){
          const bx=sx+sw2*0.06+i*(sw2*0.88/21);
          const on=(Math.floor(t*5+i*1.3)%3!==2)||winAmount>0;
          ctx.beginPath(); ctx.arc(bx,dotY,2.4,0,Math.PI*2);
          ctx.fillStyle=on?'#ffd700':'#443300'; ctx.fill();
          if(on){ctx.shadowColor='#ffd700';ctx.shadowBlur=7;ctx.fill();ctx.shadowBlur=0;}
        }
      });

      /* sign text */
      ctx.save(); ctx.translate(sx+sw2*0.5,sy+sh*0.50); drawSym('DIAMOND',sh*0.32,1); ctx.restore();
      ctx.textAlign='center'; ctx.textBaseline='middle';
      ctx.font='900 '+Math.round(sh*0.23)+'px Arial,sans-serif';
      ctx.strokeStyle='#000'; ctx.lineWidth=sh*0.04; ctx.strokeText('CRAZY',sx+sw2*0.5,sy+sh*0.46);
      const sg1=ctx.createLinearGradient(sx,sy+sh*0.38,sx,sy+sh*0.54);
      sg1.addColorStop(0,'#fff0a0'); sg1.addColorStop(1,'#c89000'); ctx.fillStyle=sg1;
      ctx.fillText('CRAZY',sx+sw2*0.5,sy+sh*0.46);
      ctx.font='900 '+Math.round(sh*0.32)+'px Arial,sans-serif';
      ctx.strokeStyle='#000'; ctx.lineWidth=sh*0.05; ctx.strokeText('DIAMONDS',sx+sw2*0.5,sy+sh*0.78);
      const sg2=ctx.createLinearGradient(sx,sy+sh*0.64,sx,sy+sh*0.90);
      sg2.addColorStop(0,'#fff0a0'); sg2.addColorStop(1,'#c89000'); ctx.fillStyle=sg2;
      ctx.fillText('DIAMONDS',sx+sw2*0.5,sy+sh*0.78);

      /* ── paytable ── */
      const px2=iX+1,py2=payY,pw2=iW-2,ph2=payH-2;
      rr(px2+2,py2+3,pw2,ph2,3); ctx.fillStyle='rgba(0,0,0,.35)'; ctx.fill();
      rr(px2,py2,pw2,ph2,3); ctx.fillStyle='#f0ead8'; ctx.fill();
      rr(px2,py2,pw2,ph2,3); ctx.strokeStyle=gold(px2,py2,px2+pw2,py2+ph2); ctx.lineWidth=2; ctx.stroke();
      ctx.textAlign='center'; ctx.textBaseline='middle';
      ctx.font='900 '+Math.round(ph2*0.14)+'px Arial,sans-serif'; ctx.fillStyle='#000080';
      ctx.fillText('WINS',px2+pw2*0.5,py2+ph2*0.09);

      /* 6 entries in 3 cols x 2 rows — symbol drawn left, multiplier right */
      const payEntries=[
        ['DIAMOND','x50'],['THREE_BAR','x30'],['TWO_BAR','x20'],
        ['BAR','x15'],['BELL','x12'],['CHERRY','x10']
      ];
      const cols=3, rows=2;
      const cellW=pw2/cols, cellH=(ph2*0.86)/rows;
      const cellY0=py2+ph2*0.16;

      payEntries.forEach(([sym2,mult],i)=>{
        const col=i%cols, row=Math.floor(i/cols);
        const cx3=px2+col*cellW, cy3=cellY0+row*cellH;
        /* cell bg */
        rr(cx3+2,cy3+2,cellW-4,cellH-4,3);
        const cbg3=ctx.createLinearGradient(cx3,cy3,cx3,cy3+cellH);
        cbg3.addColorStop(0,'#fffaf0'); cbg3.addColorStop(1,'#e8dfc8');
        ctx.fillStyle=cbg3; ctx.fill();
        /* cell border */
        ctx.strokeStyle='rgba(160,140,100,0.4)'; ctx.lineWidth=0.8;
        rr(cx3+2,cy3+2,cellW-4,cellH-4,3); ctx.stroke();

        /* draw symbol in left portion of cell */
        const symSize = cellH * 0.72;
        const symCX = cx3 + cellW*0.28;
        const symCY = cy3 + cellH*0.50;
        ctx.save(); ctx.translate(symCX, symCY); drawSym(sym2, symSize, 1); ctx.restore();

        /* multiplier text on right */
        ctx.textAlign='right'; ctx.textBaseline='middle';
        ctx.font='900 '+Math.round(cellH*0.36)+'px Arial,sans-serif';
        ctx.fillStyle='#aa0000';
        ctx.shadowColor='rgba(0,0,0,0.2)'; ctx.shadowBlur=2;
        ctx.fillText(mult, cx3+cellW-5, cy3+cellH*0.52);
        ctx.shadowBlur=0;
      });

      /* ── side panels ── */
      [[iX,iX+sideW-1],[iX+iW-sideW+1,iX+iW-1]].forEach(([lx2,rx2])=>{
        const sw3=rx2-lx2;
        rr(lx2+2,reelY+3,sw3,reelH,3); ctx.fillStyle='rgba(0,0,0,.4)'; ctx.fill();
        rr(lx2,reelY,sw3,reelH,3);
        const sbg=ctx.createLinearGradient(lx2,reelY,lx2,reelY+reelH);
        sbg.addColorStop(0,'#1a0d00'); sbg.addColorStop(1,'#0d0800');
        ctx.fillStyle=sbg; ctx.fill();
        rr(lx2,reelY,sw3,reelH,3); ctx.strokeStyle=gold(lx2,reelY,rx2,reelY+reelH); ctx.lineWidth=2; ctx.stroke();
        ctx.save(); ctx.translate(lx2+sw3*0.5,reelY+reelH*0.5); ctx.rotate(-Math.PI/2);
        ctx.textAlign='center'; ctx.textBaseline='middle';
        ctx.font='900 '+Math.round(sw3*0.35)+'px Arial,sans-serif';
        ctx.fillStyle='#ffd700'; ctx.strokeStyle='#000'; ctx.lineWidth=1;
        ctx.strokeText('PAYLINE',0,0); ctx.fillText('PAYLINE',0,0);
        ctx.restore();
      });

      /* ── reel housing with 3D inset ── */
      /* inset shadow */
      rr(rAreaX-3,reelY-3,rAreaW+8,reelH+8,8); ctx.fillStyle='rgba(0,0,0,.8)'; ctx.fill();
      rr(rAreaX-5,reelY-5,rAreaW+10,reelH+10,7); ctx.fillStyle='#111'; ctx.fill();
      rr(rAreaX-5,reelY-5,rAreaW+10,reelH+10,7);
      ctx.strokeStyle=gold(rAreaX-5,reelY-5,rAreaX+rAreaW+5,reelY+reelH+5); ctx.lineWidth=5; ctx.stroke();
      /* inner inset highlight — top edge catches light */
      ctx.strokeStyle='rgba(0,0,0,.9)'; ctx.lineWidth=2;
      ctx.beginPath(); ctx.moveTo(rAreaX-5+8,reelY-5); ctx.lineTo(rAreaX+rAreaW+5-8,reelY-5); ctx.stroke();
      ctx.strokeStyle='rgba(255,200,50,.15)'; ctx.lineWidth=1;
      ctx.beginPath(); ctx.moveTo(rAreaX-5+8,reelY-4); ctx.lineTo(rAreaX+rAreaW+5-8,reelY-4); ctx.stroke();

      for(let i=0;i<3;i++) drawReel(i,rAreaX+i*(rW+rGap),reelY,rW,reelH);

      /* payline */
      const plY=reelY+reelH*0.5;
      ctx.strokeStyle=(winAmount>0&&Math.sin(t*7)>0)?'#ff3300':'rgba(255,50,0,0.55)';
      ctx.lineWidth=2; ctx.setLineDash([5,5]);
      ctx.beginPath(); ctx.moveTo(iX+1,plY); ctx.lineTo(iX+iW-1,plY); ctx.stroke();
      ctx.setLineDash([]);

      /* ── credits / coin panel ── */
      const mpx=iX+1,mpy=midY,mpw=iW-2,mph=midH-2;
      rr(mpx+2,mpy+3,mpw,mph,4); ctx.fillStyle='rgba(0,0,0,.5)'; ctx.fill();
      rr(mpx,mpy,mpw,mph,4);
      const mpbg=ctx.createLinearGradient(mpx,mpy,mpx,mpy+mph);
      mpbg.addColorStop(0,'#0d0800'); mpbg.addColorStop(1,'#060400');
      ctx.fillStyle=mpbg; ctx.fill();
      rr(mpx,mpy,mpw,mph,4); ctx.strokeStyle=gold(mpx,mpy,mpx+mpw,mpy+mph); ctx.lineWidth=1.8; ctx.stroke();
      ctx.font=Math.round(mph*0.20)+'px monospace';
      ctx.textAlign='left'; ctx.textBaseline='middle'; ctx.fillStyle='rgba(255,100,0,0.28)';
      ctx.fillText('CREDITS',mpx+8,mpy+mph*0.28);
      ctx.font='900 '+Math.round(mph*0.44)+'px monospace';
      ctx.fillStyle='#ff6600'; ctx.shadowColor='#ff4400'; ctx.shadowBlur=8;
      ctx.fillText(Math.round(credits).toLocaleString(),mpx+8,mpy+mph*0.76);
      ctx.shadowBlur=0;

      /* coin insert button — 3D bevel */
      const cbx=mpx+mpw*0.54,cby=mpy+mph*0.10,cbw=mpw*0.43,cbh=mph*0.80;
      rr(cbx+3,cby+5,cbw,cbh,cbh*0.38); ctx.fillStyle='rgba(0,0,0,.6)'; ctx.fill();
      rr(cbx,cby,cbw,cbh,cbh*0.38);
      const cbg2=ctx.createLinearGradient(cbx,cby,cbx,cby+cbh);
      if(coinInserted){cbg2.addColorStop(0,'#442200');cbg2.addColorStop(1,'#221100');}
      else{cbg2.addColorStop(0,'#d48000');cbg2.addColorStop(0.5,'#ffaa00');cbg2.addColorStop(1,'#996000');}
      ctx.fillStyle=cbg2; ctx.fill();
      /* top sheen */
      rr(cbx,cby,cbw,cbh*0.22,cbh*0.38);
      ctx.fillStyle='rgba(255,255,255,0.22)'; ctx.fill();
      ctx.strokeStyle='#442200'; ctx.lineWidth=1.5;
      rr(cbx,cby,cbw,cbh,cbh*0.38); ctx.stroke();
      ctx.textAlign='center'; ctx.textBaseline='middle';
      ctx.font='900 '+Math.round(cbh*0.21)+'px Arial,sans-serif';
      ctx.fillStyle=coinInserted?'#886600':'#111';
      ctx.fillText('INSERT',cbx+cbw*0.5,cby+cbh*0.35);
      ctx.fillText('COIN',cbx+cbw*0.5,cby+cbh*0.60);
      ctx.font='700 '+Math.round(cbh*0.18)+'px Arial,sans-serif';
      ctx.fillText('('+BET+')',cbx+cbw*0.5,cby+cbh*0.83);

      if(resultMsg){
        const vis=winAmount>0?(Math.sin(t*5.5)>0.05):true;
        if(vis){
          /* draw result ABOVE the credits panel so it never overlaps */
          const ry2=mpy-mph*0.52;
          ctx.font='900 '+Math.round(mph*0.30)+'px Arial,sans-serif';
          ctx.textAlign='center'; ctx.textBaseline='middle';
          ctx.strokeStyle='#000'; ctx.lineWidth=3;
          ctx.strokeText(resultMsg,mpx+mpw*0.5,ry2);
          ctx.fillStyle=resultCol;
          if(winAmount>0){ctx.shadowColor=resultCol;ctx.shadowBlur=14;}
          ctx.fillText(resultMsg,mpx+mpw*0.5,ry2);
          ctx.shadowBlur=0;
        }
      }

      /* ── lower decorative panel ── */
      const lbx=iX+1,lby=lowY,lbw=iW-2,lbh=lowH-2;
      rr(lbx+2,lby+4,lbw,lbh,4); ctx.fillStyle='rgba(0,0,0,.4)'; ctx.fill();
      rr(lbx,lby,lbw,lbh,4);
      const lbg2=ctx.createLinearGradient(lbx,lby,lbx,lby+lbh);
      lbg2.addColorStop(0,'#0d0800'); lbg2.addColorStop(1,'#080500');
      ctx.fillStyle=lbg2; ctx.fill();
      rr(lbx,lby,lbw,lbh,4); ctx.strokeStyle=gold(lbx,lby,lbx+lbw,lby+lbh); ctx.lineWidth=1.8; ctx.stroke();
      ctx.save(); ctx.translate(lbx+lbw*0.5,lby+lbh*0.34); drawSym('DIAMOND',lbh*0.42,0.70); ctx.restore();
      ctx.textAlign='center'; ctx.textBaseline='middle';
      ctx.font='900 '+Math.round(lbh*0.14)+'px Arial,sans-serif';
      ctx.strokeStyle='#000'; ctx.lineWidth=2.5; ctx.strokeText('CRAZY DIAMONDS',lbx+lbw*0.5,lby+lbh*0.72);
      const ldg=ctx.createLinearGradient(lbx,lby+lbh*0.65,lbx,lby+lbh*0.80);
      ldg.addColorStop(0,'#fff0a0'); ldg.addColorStop(1,'#c89000'); ctx.fillStyle=ldg;
      ctx.fillText('CRAZY DIAMONDS',lbx+lbw*0.5,lby+lbh*0.72);

      /* coin tray — 3D inset */
      const trx=lbx+lbw*0.15,tryY=trayY+2,trw=lbw*0.70,trh=trayH-3;
      rr(trx+3,tryY+4,trw,trh,trh*0.42); ctx.fillStyle='rgba(0,0,0,.7)'; ctx.fill();
      rr(trx,tryY,trw,trh,trh*0.42);
      const trg=ctx.createLinearGradient(trx,tryY,trx,tryY+trh);
      trg.addColorStop(0,'#333'); trg.addColorStop(0.4,'#666'); trg.addColorStop(1,'#222');
      ctx.fillStyle=trg; ctx.fill(); ctx.strokeStyle=gold(trx,tryY,trx+trw,tryY+trh); ctx.lineWidth=2; ctx.stroke();
      /* inner shadow for inset depth */
      rr(trx+2,tryY+2,trw-4,trh*0.40,trh*0.38);
      ctx.fillStyle='rgba(0,0,0,.35)'; ctx.fill();

      /* ── lever ── */
      const armBaseX=CX+CaW-G*0.4,armY=levPivY+ballR*0.22;
      /* rail */
      ctx.strokeStyle='rgba(80,80,80,.6)'; ctx.lineWidth=3;
      ctx.beginPath(); ctx.moveTo(levX,levPivY-8); ctx.lineTo(levX,levPivY+lpMax+8); ctx.stroke();
      ctx.strokeStyle='#444'; ctx.lineWidth=2.5;
      ctx.beginPath(); ctx.moveTo(levX,levPivY-8); ctx.lineTo(levX,levPivY+lpMax+8); ctx.stroke();

      /* arm */
      rr(armBaseX,armY-5,levX-armBaseX+5,10,5);
      const armG=ctx.createLinearGradient(armBaseX,armY-5,levX,armY-5);
      armG.addColorStop(0,'#444'); armG.addColorStop(0.4,'#eee'); armG.addColorStop(0.8,'#bbb'); armG.addColorStop(1,'#555');
      ctx.fillStyle=armG; ctx.fill();
      /* arm 3D shadow */
      ctx.strokeStyle='rgba(0,0,0,.4)'; ctx.lineWidth=2;
      ctx.beginPath(); ctx.moveTo(armBaseX,armY+6); ctx.lineTo(levX,armY+6); ctx.stroke();
      ctx.strokeStyle='#333'; ctx.lineWidth=1; ctx.stroke();

      /* pivot knob */
      ctx.beginPath(); ctx.arc(levX,armY+2,11,0,Math.PI*2);
      ctx.fillStyle='rgba(0,0,0,.5)'; ctx.fill();
      ctx.beginPath(); ctx.arc(levX,armY,10,0,Math.PI*2);
      const pKg=ctx.createRadialGradient(levX-3,armY-3,0,levX,armY,10);
      pKg.addColorStop(0,'#eee'); pKg.addColorStop(1,'#666');
      ctx.fillStyle=pKg; ctx.fill(); ctx.strokeStyle='#333'; ctx.lineWidth=1.5; ctx.stroke();

      /* rod with 3D shine */
      rr(levX-4.5,levPivY,9,lpMax+ballR*0.5,4.5);
      const rodG=ctx.createLinearGradient(levX-5,0,levX+5,0);
      rodG.addColorStop(0,'#444'); rodG.addColorStop(0.35,'#eee'); rodG.addColorStop(0.65,'#ccc'); rodG.addColorStop(1,'#444');
      ctx.fillStyle=rodG; ctx.fill();
      rr(levX-1.5,levPivY,3,lpMax+ballR*0.5,2);
      ctx.fillStyle='rgba(255,255,255,0.40)'; ctx.fill();

      /* ball — 3D sphere */
      ctx.beginPath(); ctx.arc(levX,curBY+3,ballR,0,Math.PI*2);
      ctx.fillStyle='rgba(0,0,0,.5)'; ctx.fill();
      const ballG=ctx.createRadialGradient(levX-ballR*0.32,curBY-ballR*0.35,0,levX,curBY,ballR);
      ballG.addColorStop(0,'#ff9999'); ballG.addColorStop(0.48,'#cc0000'); ballG.addColorStop(1,'#4d0000');
      ctx.beginPath(); ctx.arc(levX,curBY,ballR,0,Math.PI*2);
      ctx.fillStyle=ballG; ctx.fill(); ctx.strokeStyle='#2a0000'; ctx.lineWidth=2; ctx.stroke();
      /* specular highlight */
      ctx.beginPath(); ctx.ellipse(levX-ballR*0.26,curBY-ballR*0.32,ballR*0.30,ballR*0.18,-0.6,0,Math.PI*2);
      ctx.fillStyle='rgba(255,255,255,0.50)'; ctx.fill();
      /* secondary rim light */
      ctx.beginPath(); ctx.ellipse(levX+ballR*0.38,curBY+ballR*0.42,ballR*0.14,ballR*0.08,0.8,0,Math.PI*2);
      ctx.fillStyle='rgba(255,150,150,0.30)'; ctx.fill();
    };

    /* ── game logic ── */
    const symAt = i => {
      // The reel draws row=0 at the TOP third (rawCY = ry+symH*0.5).
      // The payline sits at ry+reelH*0.5 = ry+symH*1.5, which is row=1.
      // So the symbol ON the payline is always base+1 (i.e. targetOffset+1).
      const r = reels[i];
      const base = r.stopped && r.targetOffset >= 0
        ? Math.round(r.targetOffset)
        : Math.round(r.offset);
      return STRIP[((base + 1) % SL + SL) % SL];
    };

    const evalResult = () => {
      const s=[symAt(0),symAt(1),symAt(2)];
      const key=s.join('|');
      let mult=0;
      if(PAYS[key]) mult=PAYS[key];
      else if(s[0]==='CHERRY'&&s[1]==='CHERRY') mult=4;
      if(mult>0){
        const prize=BET*mult;
        winAmount=prize; credits+=prize;
        _addCoins(prize); updateWallet(0,null);
        resultMsg='+'+prize;
        resultCol=mult>=50?'#ff44ff':mult>=20?'#00ffcc':'#ffd700';
        haptic('success'); spawnCoins(prize);
      } else {
        winAmount=0; resultMsg='No Win';
        resultCol='rgba(255,180,80,0.50)'; haptic('light');
        coinLayer.style.pointerEvents='none';
      }
    };

    const spawnCoins = prize => {
      const count=Math.min(55,Math.max(6,Math.floor(prize/BET*6)));
      const rect=cv.getBoundingClientRect();
      const trayCX=rect.left+rect.width*0.5;
      const trayCY=rect.top+rect.height*0.92;
      coinLayer.style.pointerEvents='all';
      setTimeout(()=>{ coinLayer.style.pointerEvents='none'; },3400);
      for(let i=0;i<count;i++){
        setTimeout(()=>{
          const coin=document.createElement('div');
          const sz=14+Math.random()*10;
          const sx2=trayCX+(Math.random()-0.5)*60;
          coin.style.cssText='position:fixed;left:'+sx2+'px;top:'+trayCY+'px;width:'+sz+'px;height:'+sz+'px;border-radius:50%;background:radial-gradient(circle at 35% 32%,#ffe066,#cc8800,#7a4a00);border:1.5px solid #aa7700;box-shadow:0 3px 0 rgba(0,0,0,.4),0 0 5px rgba(255,200,0,0.5);pointer-events:all;cursor:pointer;z-index:9999;transform-style:preserve-3d;';
          coinLayer.appendChild(coin);
          let vx=(Math.random()-0.5)*11,vy=-(9+Math.random()*13);
          let cx2=sx2,cy2=trayCY,life=0,collected=false,rot=0;
          coin.addEventListener('pointerdown',e=>{
            e.stopPropagation(); if(collected)return; collected=true;
            credits+=Math.ceil(BET*0.1); _addCoins(Math.ceil(BET*0.1)); updateWallet(0,null); haptic('light');
            coin.style.opacity='0'; coin.style.transform='scale(1.6) rotateY(180deg)'; coin.style.transition='all .25s';
            setTimeout(()=>coin.remove(),270);
          });
          const anim=()=>{
            if(collected||!coinLayer.contains(coin))return;
            life++; vy+=0.55; cy2+=vy; cx2+=vx; vx*=0.97; rot+=8;
            coin.style.left=cx2+'px'; coin.style.top=cy2+'px';
            coin.style.transform='rotateY('+rot+'deg)';
            if(life>110) coin.style.opacity=Math.max(0,1-(life-110)/50)+'';
            if(life>160){coin.remove();return;}
            requestAnimationFrame(anim);
          };
          requestAnimationFrame(anim);
        },i*52+Math.random()*68);
      }
    };

    const SPSPD=24;
    const animLoop = ts => {
      flashT=ts*0.001;
      if(spinning){
        let allDone=true;
        reels.forEach(r=>{
          if(r.stopped)return; allDone=false;
          if(r.targetOffset<0){
            r.speed=Math.min(SPSPD,r.speed+2.2);
            r.offset=(r.offset+r.speed/60)%SL;
          } else {
            const dist=((r.targetOffset-r.offset)%SL+SL)%SL;
            if(dist<0.06){r.offset=r.targetOffset%SL;r.stopped=true;r.speed=0;haptic('light');}
            else{r.offset=(r.offset+Math.max(0.28,Math.min(r.speed,dist*5+0.4))/60)%SL;}
          }
        });
        if(allDone){spinning=false;evalResult();}
      }
      if(!leverDragging&&leverY>0){
        leverVel+=(-leverY*0.32-leverVel*0.22);
        leverY=Math.max(0,leverY+leverVel*0.09);
        if(leverY<0.008&&Math.abs(leverVel)<0.01){leverY=0;leverVel=0;}
      }
      resize(); draw();
      rafId=requestAnimationFrame(animLoop);
    };
    requestAnimationFrame(()=>requestAnimationFrame(()=>{rafId=requestAnimationFrame(animLoop);}));

    /* ── input ── */
    const getPos = e => {
      const rect=cv.getBoundingClientRect();
      const src=e.touches?e.touches[0]:(e.changedTouches?e.changedTouches[0]:e);
      return {x:(src.clientX-rect.left)*(cv.width/rect.width),y:(src.clientY-rect.top)*(cv.height/rect.height),sY:src.clientY};
    };
    const getLevMetrics = () => {
      const W=cv.width,H=cv.height;
      const G2=W*0.050,CX2=W*0.028,CaW2=W*0.880,CaH2=H*0.975;
      const signY2=H*0.008+G2,signH2=CaH2*0.155;
      const payH2=CaH2*0.118;
      const reelY2=signY2+signH2+payH2,reelH2=CaH2*0.270;
      const levX2=CX2+CaW2+W*0.022;
      const levPivY2=reelY2+reelH2*0.22;
      const lpMax2=reelH2*1.06*0.84;
      const ballR2=W*0.050;
      return {levX2,levPivY2,lpMax2,ballR2};
    };
    const onBall = p => {
      const {levX2,levPivY2,lpMax2,ballR2}=getLevMetrics();
      return Math.hypot(p.x-levX2,p.y-(levPivY2+leverY*lpMax2))<ballR2+22;
    };
    const onCoin = p => {
      const W=cv.width,H=cv.height;
      const G2=W*0.050,iX2=W*0.028+G2,iW2=W*0.880-G2*2;
      const CaH2=H*0.975,signY2=H*0.008+G2;
      const reelY2=signY2+CaH2*0.155+CaH2*0.118;
      const midY2=reelY2+CaH2*0.270,midH2=CaH2*0.108;
      const mpx2=iX2+1,mpy2=midY2,mpw2=iW2-2,mph2=midH2-2;
      const cbx2=mpx2+mpw2*0.54,cby2=mpy2+mph2*0.10,cbw2=mpw2*0.43,cbh2=mph2*0.80;
      return p.x>=cbx2&&p.x<=cbx2+cbw2&&p.y>=cby2&&p.y<=cby2+cbh2;
    };
    const insertCoin = () => {
      if(spinning)return;
      if(coinInserted){resultMsg='Coin ready!';resultCol='#ffd700';return;}
      if(credits<BET){resultMsg='Need '+BET+'!';resultCol='#ff6b6b';return;}
      coinInserted=true;winAmount=0;resultMsg='Pull lever!';resultCol='#ffd700';haptic('light');
    };
    const triggerSpin = () => {
      if(spinning||!coinInserted){if(!coinInserted){resultMsg='Insert coin!';resultCol='#ff9900';}return;}
      credits-=BET;_addCoins(-BET);updateWallet(0,null);
      coinInserted=false;spinning=true;resultMsg='';winAmount=0;
      const s0=Math.floor(Math.random()*SL);
      const s1=Math.floor(Math.random()*SL);
      const s2=Math.floor(Math.random()*SL);
      reels.forEach((r,i)=>{r.stopped=false;r.speed=0;r.targetOffset=-1;setTimeout(()=>{r.targetOffset=[s0,s1,s2][i];},1300+i*950);});
      haptic('medium');
    };

    cv.addEventListener('touchstart',e=>{e.preventDefault();const p=getPos(e);if(onBall(p)){leverDragging=true;leverDragStartY=p.sY;leverDragStartVal=leverY;leverVel=0;}else if(onCoin(p))insertCoin();},{passive:false});
    cv.addEventListener('touchmove',e=>{e.preventDefault();if(!leverDragging)return;const{lpMax2}=getLevMetrics();const rect2=cv.getBoundingClientRect();const p=getPos(e);const dy=(p.sY-leverDragStartY)/(lpMax2*(rect2.height/cv.height));leverY=Math.max(0,Math.min(1,leverDragStartVal+dy));},{passive:false});
    cv.addEventListener('touchend',e=>{e.preventDefault();if(leverDragging){leverDragging=false;if(leverY>=0.62&&!spinning)triggerSpin();}},{passive:false});
    cv.addEventListener('mousedown',e=>{const p=getPos(e);if(onBall(p)){leverDragging=true;leverDragStartY=p.sY;leverDragStartVal=leverY;leverVel=0;}else if(onCoin(p))insertCoin();});
    cv.addEventListener('mousemove',e=>{if(!leverDragging)return;const{lpMax2}=getLevMetrics();const rect2=cv.getBoundingClientRect();const p=getPos(e);const dy=(p.sY-leverDragStartY)/(lpMax2*(rect2.height/cv.height));leverY=Math.max(0,Math.min(1,leverDragStartVal+dy));});
    cv.addEventListener('mouseup',e=>{if(leverDragging){leverDragging=false;if(leverY>=0.62&&!spinning)triggerSpin();}});

    wrap._slotCleanup=()=>{cancelAnimationFrame(rafId);coinLayer.remove();};
  };

  /* ════════════════════════════════════════════════════════════════
     HI-LO  — 3-D flip cards
  ════════════════════════════════════════════════════════════════ */
  const buildHiLo = wrap => {
    const SUITS=['♠','♥','♦','♣'],RANKS=['A','2','3','4','5','6','7','8','9','10','J','Q','K'];
    const VALUES={A:1,'2':2,'3':3,'4':4,'5':5,'6':6,'7':7,'8':8,'9':9,'10':10,J:11,Q:12,K:13};
    const SCOL={'♠':'#1a1a2e','♣':'#1a1a2e','♥':'#aa0000','♦':'#aa0000'};
    let deck=[],cur=null,streak=0,bet=10,busy=false;

    const mkDeck=()=>{deck=[];SUITS.forEach(s=>RANKS.forEach(r=>deck.push({r,s,v:VALUES[r]})));for(let i=deck.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[deck[i],deck[j]]=[deck[j],deck[i]];}};
    const drawCard=()=>deck.length?deck.pop():(mkDeck(),deck.pop());

    /* 3D card HTML */
    const cHTML = (c, hidden) => {
      if (hidden) return `
        <div style="width:100px;height:145px;border-radius:16px;perspective:600px;flex-shrink:0;">
          <div style="width:100%;height:100%;border-radius:16px;
            background:linear-gradient(135deg,#1a1260 0%,#0a0830 50%,#1a1260 100%);
            border:2px solid rgba(255,255,255,.12);
            box-shadow:0 8px 24px rgba(0,0,0,.7),inset 0 1px 0 rgba(255,255,255,.08);
            display:flex;align-items:center;justify-content:center;font-size:2.2rem;
            background-image:repeating-linear-gradient(45deg,rgba(255,255,255,.02) 0,rgba(255,255,255,.02) 1px,transparent 1px,transparent 8px);">
            🂠
          </div>
        </div>`;
      const isRed = c.s==='♥'||c.s==='♦';
      return `
        <div style="width:100px;height:145px;border-radius:16px;perspective:600px;flex-shrink:0;animation:cs-cardentry .4s both;">
          <div style="width:100%;height:100%;border-radius:16px;
            background:linear-gradient(160deg,#ffffff 0%,#f4f4f4 60%,#e8e8e8 100%);
            border:1.5px solid rgba(0,0,0,.15);
            box-shadow:4px 6px 18px rgba(0,0,0,.5),inset 0 1px 0 rgba(255,255,255,.9);
            display:flex;flex-direction:column;padding:9px;
            color:${SCOL[c.s]};">
            <div style="font-family:'Orbitron',sans-serif;font-size:1.05rem;font-weight:900;line-height:1.1;text-shadow:${isRed?'0 1px 3px rgba(180,0,0,.3)':'0 1px 3px rgba(0,0,0,.2)'};">
              ${c.r}<br><span style="font-size:1.3rem;">${c.s}</span>
            </div>
            <div style="flex:1;display:flex;align-items:center;justify-content:center;font-size:2.6rem;
              text-shadow:${isRed?'0 2px 8px rgba(180,0,0,.25)':'0 2px 8px rgba(0,0,0,.15)'};">
              ${c.s}
            </div>
            <div style="font-family:'Orbitron',sans-serif;font-size:1.05rem;font-weight:900;line-height:1.1;align-self:flex-end;transform:rotate(180deg);text-shadow:${isRed?'0 1px 3px rgba(180,0,0,.3)':'0 1px 3px rgba(0,0,0,.2)'};">
              ${c.r}<br><span style="font-size:1.3rem;">${c.s}</span>
            </div>
          </div>
        </div>`;
    };

    const render = () => {
      wrap.innerHTML = `
        <div style="display:flex;flex-direction:column;align-items:center;gap:20px;padding-top:14px;">

          <!-- streak -->
          <div style="display:flex;align-items:center;gap:10px;background:rgba(255,215,0,.06);border:1px solid rgba(255,215,0,.15);border-radius:50px;padding:8px 20px;box-shadow:0 4px 16px rgba(0,0,0,.4);">
            <div style="font-family:'Share Tech Mono',monospace;font-size:.58rem;color:rgba(255,215,0,.5);letter-spacing:.14em;text-transform:uppercase;">Streak</div>
            <div id="hl-st" style="font-family:'Orbitron',sans-serif;font-size:1.15rem;font-weight:900;color:#ffd700;min-width:30px;text-align:center;text-shadow:0 0 16px rgba(255,215,0,.6);">${streak}</div>
            ${streak>=3?'<div style="font-size:.8rem;">🔥</div>':''}
          </div>

          <!-- cards on felt -->
          <div style="width:100%;padding:20px 16px;border-radius:24px;
            background:radial-gradient(ellipse at 50% 30%,rgba(0,100,0,.5) 0%,transparent 70%),
              repeating-linear-gradient(45deg,rgba(0,0,0,.04) 0px,rgba(0,0,0,.04) 1px,transparent 1px,transparent 8px),
              linear-gradient(160deg,#0a3a0a,#062006);
            border:2px solid rgba(255,215,0,.2);
            box-shadow:inset 0 2px 12px rgba(0,0,0,.7),0 12px 40px rgba(0,0,0,.8);
            display:flex;align-items:center;justify-content:center;gap:20px;animation:cs-tableslide .35s both;">
            <div id="hl-cur">${cHTML(cur,false)}</div>
            <div style="display:flex;flex-direction:column;align-items:center;gap:6px;">
              <div style="font-size:1.8rem;color:rgba(255,255,255,.25);">→</div>
              <div style="font-family:'Share Tech Mono',monospace;font-size:.52rem;color:rgba(255,255,255,.2);letter-spacing:.1em;">${cur.r}${cur.s} (${cur.v})</div>
            </div>
            <div id="hl-nxt">${cHTML(null,true)}</div>
          </div>

          <div id="hl-res" style="font-family:'Orbitron',sans-serif;font-size:.9rem;font-weight:900;letter-spacing:.1em;min-height:28px;text-align:center;text-shadow:0 2px 8px rgba(0,0,0,.5);"></div>

          <div style="font-family:'Share Tech Mono',monospace;font-size:.56rem;color:rgba(255,255,255,.2);text-align:center;">Streak bonus: ×${Math.max(1,streak)} on next win</div>

          <!-- Hi / Lo buttons -->
          <div style="display:flex;gap:14px;" id="hl-btns">
            <button id="hl-lo" class="cs-btn-3d" style="font-family:'Orbitron',sans-serif;font-size:.88rem;font-weight:900;letter-spacing:.1em;text-transform:uppercase;color:#fff;background:linear-gradient(135deg,#0044ee,#002299);border:2px solid #5599ff;padding:18px 36px;border-radius:24px;cursor:pointer;-webkit-tap-highlight-color:transparent;box-shadow:0 6px 0 #001166,0 8px 24px rgba(0,80,255,.4);">▼ Lower</button>
            <button id="hl-hi" class="cs-btn-3d" style="font-family:'Orbitron',sans-serif;font-size:.88rem;font-weight:900;letter-spacing:.1em;text-transform:uppercase;color:#fff;background:linear-gradient(135deg,#dd0000,#880000);border:2px solid #ff5555;padding:18px 36px;border-radius:24px;cursor:pointer;-webkit-tap-highlight-color:transparent;box-shadow:0 6px 0 #440000,0 8px 24px rgba(255,0,0,.4);">▲ Higher</button>
          </div>

          <!-- bet chips -->
          <div style="display:flex;align-items:center;gap:12px;flex-wrap:wrap;justify-content:center;">
            <button id="hl-bd" class="cs-chip" style="background:radial-gradient(circle at 40% 38%,#e05555,#992222);box-shadow:0 5px 0 #551111,inset 0 2px 0 rgba(255,255,255,.25);">−</button>
            <div style="text-align:center;background:rgba(255,215,0,.06);border:1px solid rgba(255,215,0,.15);border-radius:14px;padding:8px 18px;box-shadow:0 4px 12px rgba(0,0,0,.4);">
              <div style="font-family:'Share Tech Mono',monospace;font-size:.5rem;color:rgba(255,215,0,.45);text-transform:uppercase;letter-spacing:.14em;">Bet</div>
              <div id="hl-bet" style="font-family:'Orbitron',sans-serif;font-size:1.05rem;font-weight:900;color:#ffd700;text-shadow:0 0 12px rgba(255,215,0,.4);">${bet}</div>
            </div>
            <button id="hl-bu" class="cs-chip" style="background:radial-gradient(circle at 40% 38%,#55e055,#229922);box-shadow:0 5px 0 #115511,inset 0 2px 0 rgba(255,255,255,.25);">+</button>
            ${streak>0?`<button id="hl-cash" class="cs-btn-3d" style="font-family:'Orbitron',sans-serif;font-size:.62rem;font-weight:900;letter-spacing:.1em;text-transform:uppercase;color:#050508;background:linear-gradient(135deg,#ffe033,#cc9900);border:none;padding:12px 22px;border-radius:18px;cursor:pointer;-webkit-tap-highlight-color:transparent;box-shadow:0 5px 0 #664400,0 0 20px rgba(255,215,0,.5);">Cash Out ×${streak}</button>`:''}
          </div>

        </div>`;

      const setBet = v=>{bet=Math.max(5,Math.min(200,v));document.getElementById('hl-bet').textContent=bet;};
      document.getElementById('hl-bd').onclick=()=>{haptic('light');setBet(bet-5);};
      document.getElementById('hl-bu').onclick=()=>{haptic('light');setBet(bet+5);};

      const guess = choice => {
        if(busy)return;
        if(_casinoCoins<bet){
          const r=document.getElementById('hl-res');
          r.style.color='#ff6b6b';r.textContent='Not enough coins!';return;
        }
        busy=true;
        updateWallet(-bet,document.getElementById('hl-btns'));
        haptic('medium');
        const next=drawCard();

        /* flip animation on the next card slot */
        const nxtEl=document.getElementById('hl-nxt');
        nxtEl.style.transition='transform .22s';
        nxtEl.style.transform='perspective(600px) rotateY(90deg) scale(.9)';
        setTimeout(()=>{
          nxtEl.innerHTML=cHTML(next,false);
          nxtEl.style.transform='perspective(600px) rotateY(0deg) scale(1)';
        },220);

        setTimeout(()=>{
          const res=document.getElementById('hl-res');
          const tie=next.v===cur.v;
          const correct=!tie&&((choice==='hi'&&next.v>cur.v)||(choice==='lo'&&next.v<cur.v));
          if(tie){res.style.color='#ffd700';res.textContent='🤝 Tie — bet returned!';updateWallet(bet,res);streak=0;haptic('light');}
          else if(correct){streak++;const p=bet*Math.max(1,streak);updateWallet(p,res);res.style.color='#ffd700';res.textContent=`✓ Correct! +${p} (×${Math.max(1,streak)} streak)`;haptic('success');}
          else{res.style.color='#ff6b6b';res.textContent=`✗ Wrong! ${next.r}${next.s} (${next.v})`;streak=0;haptic('heavy');}
          cur=next;
          setTimeout(()=>{busy=false;render();},1100);
        },500);
      };

      document.getElementById('hl-hi').onclick=()=>guess('hi');
      document.getElementById('hl-lo').onclick=()=>guess('lo');
      const ce=document.getElementById('hl-cash');
      if(ce)ce.onclick=()=>{haptic('success');const p=bet*streak;updateWallet(p,ce);streak=0;render();};
    };

    mkDeck();cur=drawCard();render();
  };

  /* ════════════════════════════════════════════════════════════════
     BLACKJACK  — redesigned to match screenshot style
  ════════════════════════════════════════════════════════════════ */
  const buildBlackjack = wrap => {
    const SUITS=['♠','♥','♦','♣'],RANKS=['A','2','3','4','5','6','7','8','9','10','J','Q','K'];
    let deck=[],ph=[],dh=[],bet=25,gs='idle';

    const mkDeck=()=>{deck=[];SUITS.forEach(s2=>RANKS.forEach(r=>deck.push({r,s:s2})));SUITS.forEach(s2=>RANKS.forEach(r=>deck.push({r,s:s2})));for(let i=deck.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[deck[i],deck[j]]=[deck[j],deck[i]];}};
    const drawCard=()=>deck.length?deck.pop():(mkDeck(),deck.pop());
    const val=c=>['J','Q','K'].includes(c.r)?10:c.r==='A'?11:parseInt(c.r);
    const hval=h=>{let t=h.reduce((a,c)=>a+val(c),0),ac=h.filter(c=>c.r==='A').length;while(t>21&&ac>0){t-=10;ac--;}return t;};
    const isRed=c=>c.s==='♥'||c.s==='♦';

    /* inject styles once */
    if(!document.getElementById('bj-styles')){
      const st=document.createElement('style');
      st.id='bj-styles';
      st.textContent=`
        @keyframes bj-slide-in {
          from { opacity:0; transform: translateY(-28px) rotate(-6deg) scale(.88); }
          to   { opacity:1; transform: translateY(0)     rotate(0deg)  scale(1); }
        }
        @keyframes bj-slide-in2 {
          from { opacity:0; transform: translateY(-28px) rotate(4deg) scale(.88); }
          to   { opacity:1; transform: translateY(0)     rotate(0deg) scale(1); }
        }
        @keyframes bj-result-pop {
          from { opacity:0; transform: scale(.7) translateY(10px); }
          to   { opacity:1; transform: scale(1)  translateY(0); }
        }
        @keyframes bj-shake {
          0%,100%{ transform:translateX(0); }
          20%    { transform:translateX(-10px); }
          60%    { transform:translateX(10px); }
        }
        @keyframes bj-win-glow {
          0%,100%{ box-shadow:0 0 30px rgba(0,255,180,.3); }
          50%    { box-shadow:0 0 60px rgba(0,255,180,.7),0 0 100px rgba(0,255,180,.2); }
        }
        .bj-btn {
          font-family:'Orbitron',sans-serif;
          font-weight:900;
          font-size:.82rem;
          letter-spacing:.1em;
          text-transform:uppercase;
          border:none;
          border-radius:50px;
          cursor:pointer;
          -webkit-tap-highlight-color:transparent;
          transition:transform .1s, box-shadow .1s, filter .1s;
          position:relative;
        }
        .bj-btn:active {
          transform:scale(.95) translateY(2px) !important;
          filter:brightness(.85);
        }
        .bj-card {
          border-radius:14px;
          background:linear-gradient(160deg,#ffffff,#f2f2f2);
          box-shadow:4px 8px 22px rgba(0,0,0,.65), inset 0 1px 0 rgba(255,255,255,.9);
          border:1.5px solid rgba(0,0,0,.12);
          display:flex;flex-direction:column;
          padding:8px 7px;
          flex-shrink:0;
        }
        .bj-card-back {
          border-radius:14px;
          background:linear-gradient(135deg,#0f2a5a 0%,#0a1f45 40%,#0f2a5a 100%);
          background-image:repeating-linear-gradient(
            45deg,
            rgba(255,255,255,.04) 0,rgba(255,255,255,.04) 1px,
            transparent 1px,transparent 10px
          );
          box-shadow:4px 8px 22px rgba(0,0,0,.65),inset 0 1px 0 rgba(255,255,255,.06);
          border:1.5px solid rgba(255,255,255,.08);
          display:flex;align-items:center;justify-content:center;
          flex-shrink:0;
        }
        .bj-table {
          background:
            radial-gradient(ellipse at 50% 0%, rgba(0,80,40,.8) 0%, transparent 70%),
            radial-gradient(ellipse at 50% 100%, rgba(0,40,20,.5) 0%, transparent 60%),
            linear-gradient(180deg, #042a14 0%, #021a0c 50%, #011008 100%);
          border-radius:28px;
          border:2px solid rgba(0,200,100,.15);
          box-shadow:
            0 0 0 1px rgba(0,0,0,.8),
            0 4px 40px rgba(0,0,0,.9),
            inset 0 1px 0 rgba(0,255,140,.08),
            inset 0 -1px 0 rgba(0,0,0,.5);
        }
        .bj-zone {
          background:
            rgba(0,0,0,.25);
          border-radius:20px;
          border:1px solid rgba(255,255,255,.06);
          box-shadow:inset 0 2px 8px rgba(0,0,0,.5), 0 1px 0 rgba(255,255,255,.04);
        }
        .bj-deal-btn {
          font-family:'Orbitron',sans-serif;
          font-weight:900;
          font-size:1rem;
          letter-spacing:.18em;
          text-transform:uppercase;
          color:#030f08;
          background:linear-gradient(135deg,#00ffaa,#00cc88);
          border:none;
          border-radius:50px;
          cursor:pointer;
          -webkit-tap-highlight-color:transparent;
          box-shadow:0 6px 0 #007744, 0 8px 30px rgba(0,255,150,.45);
          transition:transform .1s,box-shadow .1s;
        }
        .bj-deal-btn:active {
          transform:translateY(4px);
          box-shadow:0 2px 0 #007744, 0 4px 16px rgba(0,255,150,.3);
        }
      `;
      document.head.appendChild(st);
    }

    /* card width/height */
    const CW=82, CH=118;

    const cardHTML=(c,delay=0,rot=0)=>`
      <div class="bj-card" style="width:${CW}px;height:${CH}px;color:${isRed(c)?'#cc0000':'#0a0a1a'};
        animation:${rot<0?'bj-slide-in':'bj-slide-in2'} .32s ${delay}s both;">
        <div style="font-family:'Orbitron',sans-serif;font-size:.78rem;font-weight:900;line-height:1.1;">
          ${c.r}<br><span style="font-size:1rem;">${c.s}</span>
        </div>
        <div style="flex:1;display:flex;align-items:center;justify-content:center;font-size:2.1rem;
          text-shadow:${isRed(c)?'0 1px 6px rgba(180,0,0,.2)':'0 1px 6px rgba(0,0,0,.15)'};">
          ${c.s}
        </div>
        <div style="font-family:'Orbitron',sans-serif;font-size:.78rem;font-weight:900;line-height:1.1;
          align-self:flex-end;transform:rotate(180deg);">
          ${c.r}<br><span style="font-size:1rem;">${c.s}</span>
        </div>
      </div>`;

    const cardBackHTML=(delay=0)=>`
      <div class="bj-card-back" style="width:${CW}px;height:${CH}px;animation:bj-slide-in2 .32s ${delay}s both;">
        <div style="width:70%;height:80%;border-radius:8px;border:2px solid rgba(255,255,255,.12);
          display:flex;align-items:center;justify-content:center;
          background:repeating-linear-gradient(45deg,rgba(255,255,255,.03) 0,rgba(255,255,255,.03) 2px,transparent 2px,transparent 8px);">
          <div style="font-size:1.8rem;opacity:.3;">🂠</div>
        </div>
      </div>`;

    const handEl=(h,hide2)=>`
      <div style="display:flex;gap:10px;justify-content:center;flex-wrap:wrap;">
        ${h.map((c,i)=>i===1&&hide2?cardBackHTML(i*0.08):cardHTML(c,i*0.08,i%2===0?-2:2)).join('')}
      </div>`;

    /* ── full-screen layout render ── */
    const render=(state='idle',rev=false,resultMsg='',resultType='')=>{
      const pv=hval(ph), dv=hval(dh);
      const bust=state==='playing'&&pv>21;
      const bj=state==='playing'&&ph.length===2&&pv===21;
      const done=bust||bj||rev;

      wrap.style.cssText='position:absolute;inset:0;overflow-y:auto;-webkit-overflow-scrolling:touch;'+
        'background:linear-gradient(180deg,#000000 0%,#020f07 40%,#011008 100%);'+
        'display:flex;flex-direction:column;padding:10px 14px 30px;gap:12px;';

      wrap.innerHTML=`
        <!-- TABLE -->
        <div class="bj-table" style="flex:1;display:flex;flex-direction:column;padding:14px 14px 16px;gap:10px;min-height:0;">

          <!-- DEALER ZONE -->
          <div class="bj-zone" style="flex:1;padding:12px 14px;display:flex;flex-direction:column;gap:10px;">
            <div style="font-family:'Share Tech Mono',monospace;font-size:.58rem;letter-spacing:.18em;text-transform:uppercase;
              color:rgba(0,255,140,.55);display:flex;align-items:center;gap:8px;">
              DEALER
              ${rev?`<span style="font-size:.72rem;font-weight:700;color:${dv>21?'#ff5555':dv>=17?'#ffd700':'#00ff8c'};
                text-shadow:0 0 10px currentColor;">${dv}</span>`:''}
            </div>
            ${state==='idle'
              ? `<div style="display:flex;gap:10px;justify-content:center;opacity:.3;">
                   ${cardBackHTML(0)}${cardBackHTML(.06)}
                 </div>`
              : handEl(dh,!rev)
            }
          </div>

          <!-- PLAYER ZONE -->
          <div class="bj-zone" style="flex:1.2;padding:12px 14px;display:flex;flex-direction:column;gap:10px;">
            <div style="font-family:'Share Tech Mono',monospace;font-size:.58rem;letter-spacing:.18em;text-transform:uppercase;
              color:rgba(0,255,140,.55);display:flex;align-items:center;gap:8px;">
              YOU
              ${state!=='idle'?`<span style="font-size:.72rem;font-weight:700;
                color:${pv>21?'#ff5555':pv===21?'#ffd700':'rgba(255,255,255,.9)'};
                text-shadow:0 0 10px currentColor;">— ${pv}</span>`:''}
            </div>
            ${state==='idle'
              ? `<div style="display:flex;gap:10px;justify-content:center;opacity:.3;">
                   ${cardBackHTML(0)}${cardBackHTML(.06)}
                 </div>`
              : handEl(ph,false)
            }
          </div>

          <!-- RESULT -->
          ${resultMsg?`
            <div style="text-align:center;animation:bj-result-pop .3s both;
              ${resultType==='shake'?'animation:bj-shake .35s both;':''}">
              <span style="font-family:'Orbitron',sans-serif;font-size:1rem;font-weight:900;
                letter-spacing:.08em;
                color:${resultType==='win'?'#00ffaa':resultType==='bj'?'#ffd700':'#ff5555'};
                text-shadow:0 0 20px currentColor;">${resultMsg}</span>
            </div>`:''
          }

        </div>

        <!-- ACTION BUTTONS -->
        <div style="display:flex;gap:10px;justify-content:center;">
          ${state==='playing'&&!done?`
            <button class="bj-btn" id="bj-hit" style="color:#fff;background:linear-gradient(135deg,#e53935,#8b0000);
              padding:16px 0;width:30%;box-shadow:0 5px 0 #440000,0 6px 22px rgba(220,0,0,.4);">HIT</button>
            <button class="bj-btn" id="bj-st" style="color:#fff;background:linear-gradient(135deg,#1565c0,#0d47a1);
              padding:16px 0;width:30%;box-shadow:0 5px 0 #062070,0 6px 22px rgba(0,80,200,.4);">STAND</button>
            ${ph.length===2&&_casinoCoins>=bet?`
            <button class="bj-btn" id="bj-dbl" style="color:#fff;background:linear-gradient(135deg,#7b1fa2,#4a0072);
              padding:16px 0;width:30%;box-shadow:0 5px 0 #220040,0 6px 22px rgba(120,0,200,.4);">DOUBLE</button>`:''}
          `:done?`
            <button class="bj-btn" id="bj-again" style="color:#030f08;background:linear-gradient(135deg,#00ffaa,#00cc88);
              padding:16px 50px;box-shadow:0 5px 0 #007744,0 6px 22px rgba(0,255,150,.4);">PLAY AGAIN</button>
          `:''}
        </div>

        <!-- BET + DEAL -->
        <div style="display:flex;flex-direction:column;gap:10px;align-items:center;">

          <!-- bet row -->
          <div style="display:flex;align-items:center;gap:16px;
            background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.07);
            border-radius:50px;padding:10px 22px;
            box-shadow:0 4px 16px rgba(0,0,0,.5),inset 0 1px 0 rgba(255,255,255,.05);">
            <button id="bj-bd" style="width:38px;height:38px;border-radius:50%;border:none;cursor:pointer;
              -webkit-tap-highlight-color:transparent;
              background:radial-gradient(circle at 38% 35%,#e05555,#880000);
              box-shadow:0 4px 0 #440000,0 0 12px rgba(200,0,0,.3);
              color:#fff;font-size:1.3rem;font-weight:900;
              display:flex;align-items:center;justify-content:center;
              transition:transform .1s;" onpointerdown="this.style.transform='scale(.92) translateY(2px)'" onpointerup="this.style.transform=''">−</button>
            <div style="text-align:center;min-width:70px;">
              <div style="font-family:'Share Tech Mono',monospace;font-size:.5rem;color:rgba(255,215,0,.4);letter-spacing:.18em;text-transform:uppercase;">BET</div>
              <div id="bj-bet-disp" style="font-family:'Orbitron',sans-serif;font-size:1.4rem;font-weight:900;color:#ffd700;
                text-shadow:0 0 16px rgba(255,215,0,.5);">${bet}</div>
            </div>
            <button id="bj-bu" style="width:38px;height:38px;border-radius:50%;border:none;cursor:pointer;
              -webkit-tap-highlight-color:transparent;
              background:radial-gradient(circle at 38% 35%,#55e077,#117733);
              box-shadow:0 4px 0 #0a4422,0 0 12px rgba(0,200,80,.3);
              color:#fff;font-size:1.3rem;font-weight:900;
              display:flex;align-items:center;justify-content:center;
              transition:transform .1s;" onpointerdown="this.style.transform='scale(.92) translateY(2px)'" onpointerup="this.style.transform=''">+</button>
          </div>

          <!-- deal button -->
          <button class="bj-deal-btn" id="bj-deal" style="width:100%;padding:20px 0;
            ${state!=='idle'?'opacity:.35;pointer-events:none;':''}"
          >DEAL</button>

          <div style="font-family:'Share Tech Mono',monospace;font-size:.5rem;color:rgba(255,255,255,.12);text-align:center;letter-spacing:.08em;">
            Get closer to 21 than the dealer. &nbsp;·&nbsp; Dealer stands on 17. &nbsp;·&nbsp; Blackjack pays 1.5×.
          </div>
        </div>
      `;

      /* wire up buttons */
      const setBet=v=>{bet=Math.max(5,Math.min(500,v));const el=document.getElementById('bj-bet-disp');if(el)el.textContent=bet;};
      const bd=document.getElementById('bj-bd');
      const bu=document.getElementById('bj-bu');
      const deal=document.getElementById('bj-deal');
      const hit=document.getElementById('bj-hit');
      const stand=document.getElementById('bj-st');
      const dbl=document.getElementById('bj-dbl');
      const again=document.getElementById('bj-again');

      if(bd)bd.onclick=()=>{haptic('light');setBet(bet-5);};
      if(bu)bu.onclick=()=>{haptic('light');setBet(bet+5);};

      if(deal)deal.onclick=()=>{
        if(_casinoCoins<bet)return;
        haptic('medium');
        updateWallet(-bet,deal);
        ph=[drawCard(),drawCard()];dh=[drawCard(),drawCard()];
        const pv2=hval(ph);
        if(ph.length===2&&pv2===21){
          // blackjack on deal
          const prize=Math.round(bet*1.5)+bet;updateWallet(prize,null);
          render('playing',true,'🃏 BLACKJACK! +'+prize,'bj');
        } else {
          render('playing',false);
        }
      };

      if(hit)hit.onclick=()=>{
        haptic('medium');ph.push(drawCard());
        const pv2=hval(ph);
        if(pv2>21){render('playing',true,'💥 BUST — Dealer wins','shake');}
        else if(pv2===21){while(hval(dh)<17)dh.push(drawCard());doReveal();}
        else{render('playing',false);}
      };

      if(stand)stand.onclick=()=>{
        haptic('medium');
        while(hval(dh)<17)dh.push(drawCard());
        doReveal();
      };

      if(dbl)dbl.onclick=()=>{
        haptic('medium');
        updateWallet(-bet,dbl);
        bet*=2;
        ph.push(drawCard());
        while(hval(dh)<17)dh.push(drawCard());
        doReveal();
      };

      if(again)again.onclick=()=>{
        ph=[];dh=[];
        bet=Math.min(bet,_casinoCoins||5);
        render('idle');
      };
    };

    const doReveal=()=>{
      const pv=hval(ph),dv=hval(dh);
      if(dv>21||pv>dv){
        const prize=bet*2;updateWallet(prize,null);
        render('playing',true,'🏆 YOU WIN  +'+prize,'win');
      } else if(pv===dv){
        updateWallet(bet,null);
        render('playing',true,'🤝 PUSH — Bet returned','push');
      } else {
        render('playing',true,'💀 DEALER WINS  ('+dv+' vs '+pv+')','lose');
      }
    };

    mkDeck();render('idle');
  };

  /* ── Init ── */
  return () => { _saveCoins(); };
}
