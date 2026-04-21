/* ════════════ CASINO 🎰 ════════════ */

/* ── Wallet lives OUTSIDE initCasino so it survives app re-opens ──
   First call reads localStorage. After that the in-memory value is
   authoritative and localStorage is kept in sync on every change.   */
const _CASINO_KEY = 'ipocket_casino_coins';
let _casinoCoins = null; // null = not yet loaded

const _loadCoins  = () => {
  if (_casinoCoins !== null) return; // already loaded this session
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
  _loadCoins(); // no-op after first call in a session

  let activeGame = null;

  /* ── Root ── */
  const root = document.createElement('div');
  root.style.cssText = 'width:100%;height:100%;display:flex;flex-direction:column;background:#050508;overflow:hidden;';
  content.appendChild(root);

  /* ── Styles ── */
  if (!document.getElementById('casino-styles')) {
    const st = document.createElement('style');
    st.id = 'casino-styles';
    st.textContent = `
      @keyframes cs-deal  {from{opacity:0;transform:translateY(-40px) rotate(-8deg)}to{opacity:1;transform:translateY(0) rotate(0)}}
      @keyframes cs-win   {0%,100%{transform:scale(1)}25%{transform:scale(1.18)}75%{transform:scale(1.1)}}
      @keyframes cs-shake {0%,100%{transform:translateX(0)}25%{transform:translateX(-8px)}75%{transform:translateX(8px)}}
      @keyframes cs-spinb {from{filter:blur(4px);transform:translateY(-60px)}to{filter:blur(0);transform:translateY(0)}}
      @keyframes cs-coins {0%{transform:translateY(0) scale(1);opacity:1}100%{transform:translateY(-80px) scale(1.4);opacity:0}}
      @keyframes cs-pulse {0%,100%{box-shadow:0 0 20px rgba(255,215,0,.4)}50%{box-shadow:0 0 40px rgba(255,215,0,.9)}}
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
    <button id="cs-back" style="display:none;font-family:'Orbitron',sans-serif;font-size:.78rem;letter-spacing:.1em;text-transform:uppercase;color:var(--cyan);background:transparent;border:none;cursor:pointer;-webkit-tap-highlight-color:transparent;padding:6px 0;text-shadow:var(--gc);">← Back</button>
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
      float.style.cssText = `position:fixed;font-family:'Orbitron',sans-serif;font-size:.9rem;font-weight:900;color:${delta>0?'#ffd700':'#ff6b6b'};pointer-events:none;z-index:9999;animation:cs-coins .8s ease forwards;`;
      float.textContent = (delta > 0 ? '+' : '') + delta.toLocaleString();
      const r = refEl.getBoundingClientRect();
      float.style.left = (r.left + r.width/2 - 30) + 'px';
      float.style.top  = r.top + 'px';
      document.body.appendChild(float);
      setTimeout(() => float.remove(), 900);
    }
  };

  /* ════ LOBBY ════ */
  const lobbyPanel = document.createElement('div');
  lobbyPanel.style.cssText = 'position:absolute;inset:0;overflow-y:auto;-webkit-overflow-scrolling:touch;padding:12px 16px 60px;display:flex;flex-direction:column;gap:14px;';
  body.appendChild(lobbyPanel);

  const GAMES = [
    {id:'slots',     name:'Slot Machine', ico:'🎰', desc:'3 reels · Match to win',         col:'#ffd700', grad:'linear-gradient(145deg,#3d2000,#1a0d00)', jackpot:'50×'},
    {id:'hilo',      name:'Hi-Lo',        ico:'🃏', desc:'Higher or lower?',               col:'#ff6b6b', grad:'linear-gradient(145deg,#2a0010,#0a0005)', jackpot:'×streak'},
    {id:'blackjack', name:'Blackjack',    ico:'♠️', desc:'Beat the dealer to 21',           col:'#00ffcc', grad:'linear-gradient(145deg,#003322,#000f0a)', jackpot:'1.5×'},
  ];

  // Balance card at top
  const balCard = document.createElement('div');
  balCard.style.cssText = `
    margin-bottom:18px;padding:20px 20px 16px;border-radius:22px;
    background:linear-gradient(135deg,rgba(255,215,0,.08),rgba(255,140,0,.04));
    border:1px solid rgba(255,215,0,.2);
    box-shadow:0 0 30px rgba(255,215,0,.06);
    text-align:center;position:relative;overflow:hidden;`;
  balCard.innerHTML = `
    <div style="position:absolute;top:0;left:0;right:0;height:2px;background:linear-gradient(90deg,transparent,#ffd700,transparent);"></div>
    <div style="font-family:'Share Tech Mono',monospace;font-size:.52rem;color:rgba(255,215,0,.45);letter-spacing:.22em;text-transform:uppercase;margin-bottom:8px;">Your Balance</div>
    <div id="cs-lobby-bal" style="font-family:'Orbitron',sans-serif;font-size:2.4rem;font-weight:900;color:#ffd700;text-shadow:0 0 24px rgba(255,215,0,.6);letter-spacing:.04em;">🪙 ${_casinoCoins.toLocaleString()}</div>
    <div style="display:flex;gap:8px;justify-content:center;margin-top:12px;">
      <button id="cs-refill" style="font-family:'Orbitron',sans-serif;font-size:.52rem;letter-spacing:.1em;text-transform:uppercase;color:rgba(255,255,255,.4);background:rgba(255,255,255,.05);border:1px solid rgba(255,255,255,.1);padding:7px 18px;border-radius:14px;cursor:pointer;-webkit-tap-highlight-color:transparent;">↑ Refill to 1,000</button>
    </div>`;
  lobbyPanel.appendChild(balCard);

  // Section label
  const lobbyHdr = document.createElement('div');
  lobbyHdr.style.cssText = 'font-family:"Orbitron",sans-serif;font-size:.52rem;color:var(--dim);letter-spacing:.22em;text-transform:uppercase;margin-bottom:12px;padding:0 2px;';
  lobbyHdr.textContent = '// Games //';
  lobbyPanel.appendChild(lobbyHdr);

  GAMES.forEach((g, idx) => {
    const card = document.createElement('div');
    card.style.cssText = `
      padding:0;border-radius:24px;
      background:${g.grad};
      border:1px solid ${g.col}35;
      box-shadow:0 6px 28px rgba(0,0,0,.55),0 0 0 0 ${g.col};
      cursor:pointer;-webkit-tap-highlight-color:transparent;
      transition:transform .14s,box-shadow .14s;
      position:relative;overflow:hidden;
      animation:sp-fade-in .4s ${idx*.1}s both;`;
    card.innerHTML = `
      <div style="position:absolute;top:0;left:0;right:0;height:2px;background:linear-gradient(90deg,transparent,${g.col}cc,transparent);"></div>
      <div style="position:absolute;inset:0;background:radial-gradient(ellipse at 20% 30%,rgba(255,255,255,.04),transparent 60%);pointer-events:none;"></div>
      <div style="display:flex;align-items:center;gap:0;padding:20px 20px;">
        <!-- Big icon -->
        <div style="width:64px;height:64px;border-radius:18px;background:rgba(255,255,255,.06);border:1px solid rgba(255,255,255,.08);display:flex;align-items:center;justify-content:center;font-size:2.2rem;flex-shrink:0;margin-right:16px;">
          ${g.ico}
        </div>
        <!-- Info -->
        <div style="flex:1;min-width:0;">
          <div style="font-family:'Orbitron',sans-serif;font-size:.95rem;font-weight:900;letter-spacing:.06em;color:#fff;margin-bottom:4px;">${g.name}</div>
          <div style="font-family:'Share Tech Mono',monospace;font-size:.6rem;color:rgba(255,255,255,.35);letter-spacing:.05em;">${g.desc}</div>
          <div style="margin-top:7px;display:inline-flex;align-items:center;gap:5px;background:rgba(255,255,255,.06);border:1px solid ${g.col}40;padding:3px 10px;border-radius:8px;">
            <span style="font-family:'Share Tech Mono',monospace;font-size:.5rem;color:${g.col};letter-spacing:.08em;text-transform:uppercase;">Max payout</span>
            <span style="font-family:'Orbitron',sans-serif;font-size:.6rem;font-weight:900;color:${g.col};">${g.jackpot}</span>
          </div>
        </div>
        <!-- Arrow -->
        <div style="font-size:1.6rem;color:${g.col};opacity:.4;flex-shrink:0;margin-left:8px;">›</div>
      </div>`;
    card.addEventListener('touchstart', () => {
      card.style.transform='scale(.97)';
      card.style.boxShadow=`0 2px 14px rgba(0,0,0,.4),0 0 22px ${g.col}33`;
    }, {passive:true});
    card.addEventListener('touchend', () => {
      card.style.transform='';
      card.style.boxShadow=`0 6px 28px rgba(0,0,0,.55)`;
    }, {passive:true});
    card.addEventListener('click', () => openGame(g.id));
    lobbyPanel.appendChild(card);
  });

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
    document.getElementById('cs-title').style.cssText = 'font-family:"Orbitron",sans-serif;font-size:1rem;font-weight:900;letter-spacing:.08em;text-transform:uppercase;color:var(--cyan);text-shadow:var(--gc);flex:1;background:none;-webkit-text-fill-color:unset;';
    document.getElementById('cs-back').style.display = '';
    lobbyPanel.style.transition = 'transform .32s cubic-bezier(.34,1.56,.64,1)';
    lobbyPanel.style.transform  = 'translateX(-100%)';
    if (!gamePanels[id]) {
      gamePanels[id] = makePanel();
      if (id==='slots')     buildSlots(gamePanels[id]);
    } else if (id==='slots' && gamePanels[id]._slotCleanup) {
      // Re-open: rebuild so credits sync with wallet
      gamePanels[id]._slotCleanup();
      gamePanels[id].innerHTML='';
      buildSlots(gamePanels[id]);
      gamePanels[id].style.transform='translateX(0)'; return;
      if (id==='hilo')      buildHiLo(gamePanels[id]);
      if (id==='blackjack') buildBlackjack(gamePanels[id]);
    }
    gamePanels[id].style.transform = 'translateX(0)';
  };

  const closeGame = () => {
    haptic('light');
    if (gamePanels[activeGame]) {
      if (activeGame==='slots' && gamePanels[activeGame]._slotCleanup) gamePanels[activeGame]._slotCleanup();
      gamePanels[activeGame].style.transform = 'translateX(100%)';
    }
    lobbyPanel.style.transform = 'translateX(0)';
    document.getElementById('cs-title').innerHTML = '';
    document.getElementById('cs-title').style.cssText = 'font-family:"Orbitron",sans-serif;font-size:1.05rem;font-weight:900;letter-spacing:.1em;text-transform:uppercase;background:linear-gradient(135deg,#ffd700,#ff8c00);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;flex:1;';
    document.getElementById('cs-title').textContent = '🎰 Casino';
    document.getElementById('cs-back').style.display = 'none';
    activeGame = null;
    refreshWalletDisplay();
  };

  document.getElementById('cs-back').addEventListener('click', closeGame);

  /* ════ SLOT MACHINE — canvas-rendered 3-D cabinet ════ */
  const buildSlots = wrap => {
    wrap.style.cssText = 'display:flex;flex-direction:column;align-items:center;background:#0a0005;overflow-y:auto;-webkit-overflow-scrolling:touch;padding-bottom:20px;';

    /* ── Canvas ── */
    const cv = document.createElement('canvas');
    const CW = Math.min(content.offsetWidth, 400);
    const CH = Math.round(CW * 1.62); // tall portrait cabinet
    cv.width = CW; cv.height = CH;
    cv.style.cssText = `width:${CW}px;height:${CH}px;display:block;touch-action:none;-webkit-tap-highlight-color:transparent;`;
    wrap.appendChild(cv);
    const ctx = cv.getContext('2d');

    /* ── Payout table below ── */
    const payTable = document.createElement('div');
    payTable.style.cssText = 'width:100%;max-width:380px;padding:0 16px 8px;';
    payTable.innerHTML = `
      <div style="font-family:'Orbitron',sans-serif;font-size:.48rem;color:rgba(255,215,0,.5);letter-spacing:.2em;text-transform:uppercase;text-align:center;margin:10px 0 8px;">Payout Table</div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:5px;">
        ${[['777','×100 JACKPOT','#ff4af8'],['BAR BAR BAR','×30','#ffd700'],['7 7 7','×20','#ffd700'],['BAR BAR','×8','#c8e8ff'],['7 7','×5','#c8e8ff'],['Cherry+','×2','#69ff47']].map(([k,v,c])=>`<div style="display:flex;justify-content:space-between;align-items:center;background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.06);padding:6px 10px;border-radius:8px;"><span style="font-family:'Share Tech Mono',monospace;font-size:.58rem;color:rgba(255,255,255,.6);">${k}</span><span style="font-family:'Orbitron',sans-serif;font-size:.6rem;font-weight:900;color:${c};">${v}</span></div>`).join('')}
      </div>`;
    wrap.appendChild(payTable);

    /* ── Symbol strip per reel (drawn as tall cylinder) ──
       Each reel has STRIP_LEN symbols in a fixed order — classic layout */
    const STRIP = ['CHERRY','BAR','SEVEN','BAR','CHERRY','BAR','SEVEN','CHERRY','BAR','SEVEN'];
    const COLORS = {
      CHERRY:{ body:'#cc1111', shine:'#ff6666', label:'🍒' },
      BAR:   { body:'#111',    shine:'#555',    label:'BAR' },
      SEVEN: { body:'#cc0000', shine:'#ff4444', label:'7' },
    };
    const STRIP_LEN = STRIP.length;

    /* ── Layout constants ── */
    const CAB_X  = CW * .05;
    const CAB_W  = CW * .90;
    const CAB_TOP = CH * .04;
    const CAB_H   = CH * .96;
    const CHROME  = 14;
    const SIGN_H  = CH * .13;
    const REEL_AREA_TOP = CAB_TOP + SIGN_H + CH * .03;
    const REEL_AREA_H   = CH * .28;
    const REEL_AREA_X   = CAB_X + CHROME + CW * .04;
    const REEL_AREA_W   = CAB_W - CHROME*2 - CW * .08;
    const REEL_W        = REEL_AREA_W / 3;
    const REEL_GAP      = 4;
    const SYM_H         = REEL_AREA_H / 3; // 3 symbols visible per reel

    /* ── Lever geometry ── */
    const LEV_X = CAB_X + CAB_W + 6;
    const LEV_PIVOT_Y = REEL_AREA_TOP + REEL_AREA_H * .3;
    const LEV_BALL_R  = CW * .055;
    let leverAngle = -Math.PI * .18; // rest angle (ball up)
    let leverPulled = false, leverAnim = 0; // 0=rest,1=pulled,2=returning

    /* ── Coin slot & buttons ── */
    const BTN_Y      = REEL_AREA_TOP + REEL_AREA_H + CH * .075;
    const COIN_SLOT_Y = REEL_AREA_TOP + REEL_AREA_H + CH * .02;

    /* ── Game state ── */
    const BET = 25; // fixed bet per spin
    let credits    = _casinoCoins;
    let spinning   = false;
    let coinInserted = false;
    let resultMsg  = '';
    let resultCol  = '#ffd700';
    let flashTimer = 0;
    let winFlash   = false;

    /* Reel state: offset = floating symbol index (can be fractional while spinning) */
    const reels = [0,1,2].map(i => ({
      offset: Math.floor(Math.random() * STRIP_LEN),
      spinning: false,
      speed: 0,
      targetOffset: 0,
      stopped: true,
      finalIdx: 0,
    }));

    /* ── Draw helpers ── */
    const roundRect = (x,y,w,h,r) => {
      ctx.beginPath();
      ctx.moveTo(x+r,y);
      ctx.lineTo(x+w-r,y); ctx.quadraticCurveTo(x+w,y,x+w,y+r);
      ctx.lineTo(x+w,y+h-r); ctx.quadraticCurveTo(x+w,y+h,x+w-r,y+h);
      ctx.lineTo(x+r,y+h); ctx.quadraticCurveTo(x,y+h,x,y+h-r);
      ctx.lineTo(x,y+r); ctx.quadraticCurveTo(x,y,x+r,y);
      ctx.closePath();
    };

    /* Draw one symbol centred in a box */
    const drawSymbol = (sym, cx, cy, size, alpha) => {
      ctx.save();
      ctx.globalAlpha = alpha;
      const S = COLORS[sym];

      if (sym === 'CHERRY') {
        // Red circle + stem
        ctx.beginPath(); ctx.arc(cx, cy + size*.1, size*.32, 0, Math.PI*2);
        const cg = ctx.createRadialGradient(cx-size*.08, cy-size*.05+size*.1, 0, cx, cy+size*.1, size*.35);
        cg.addColorStop(0, '#ff8888'); cg.addColorStop(1, '#880000');
        ctx.fillStyle = cg; ctx.fill();
        // Stem
        ctx.strokeStyle = '#224400'; ctx.lineWidth = size*.06; ctx.lineCap = 'round';
        ctx.beginPath(); ctx.moveTo(cx, cy-size*.05); ctx.quadraticCurveTo(cx+size*.15, cy-size*.25, cx+size*.08, cy-size*.35); ctx.stroke();
        // Shine
        ctx.beginPath(); ctx.arc(cx-size*.1, cy-size*.02+size*.1, size*.09, 0, Math.PI*2);
        ctx.fillStyle = 'rgba(255,255,255,.5)'; ctx.fill();
      } else if (sym === 'BAR') {
        // Metallic bar
        const bw = size*.7, bh = size*.3;
        const bg = ctx.createLinearGradient(cx-bw/2, cy-bh/2, cx-bw/2, cy+bh/2);
        bg.addColorStop(0, '#888'); bg.addColorStop(.4, '#fff'); bg.addColorStop(.6, '#bbb'); bg.addColorStop(1, '#444');
        roundRect(cx-bw/2, cy-bh/2, bw, bh, bh*.25);
        ctx.fillStyle = bg; ctx.fill();
        ctx.strokeStyle = '#333'; ctx.lineWidth = 1.5; ctx.stroke();
        // BAR text
        ctx.fillStyle = '#111'; ctx.font = `900 ${size*.22}px 'Arial',sans-serif`;
        ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
        ctx.fillText('BAR', cx, cy+1);
      } else if (sym === 'SEVEN') {
        // Bold red 7 with black outline
        ctx.font = `900 ${size*.62}px 'Orbitron','Arial',sans-serif`;
        ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
        ctx.strokeStyle = '#220000'; ctx.lineWidth = size*.08; ctx.strokeText('7', cx, cy+size*.04);
        const tg = ctx.createLinearGradient(cx, cy-size*.3, cx, cy+size*.3);
        tg.addColorStop(0, '#ff8888'); tg.addColorStop(.5, '#ff0000'); tg.addColorStop(1, '#880000');
        ctx.fillStyle = tg; ctx.fillText('7', cx, cy+size*.04);
        // Shine
        ctx.fillStyle = 'rgba(255,255,255,.25)'; ctx.fillText('7', cx-1, cy+size*.02);
      }
      ctx.restore();
    };

    /* ── Draw reel drum (3 visible symbols, cylindrical warp) ── */
    const drawReel = (reelIdx, x, y, w, h) => {
      const reel = reels[reelIdx];

      // Reel background — white ivory like real drums
      const rbg = ctx.createLinearGradient(x, y, x+w, y);
      rbg.addColorStop(0, '#e8e0d0'); rbg.addColorStop(.5, '#f5f0e8'); rbg.addColorStop(1, '#d0c8b8');
      roundRect(x, y, w, h, 6);
      ctx.fillStyle = rbg; ctx.fill();

      // Clip to reel area
      ctx.save();
      roundRect(x, y, w, h, 6);
      ctx.clip();

      // Draw 3 visible symbols with cylindrical perspective
      const symH = h / 3;
      const offset = reel.offset;
      const baseIdx = Math.floor(offset);
      const frac = offset - baseIdx;

      for (let row = -1; row <= 3; row++) {
        const symIdx = ((baseIdx + row) % STRIP_LEN + STRIP_LEN) % STRIP_LEN;
        const sym = STRIP[symIdx];
        const rawY = y + (row - frac) * symH + symH / 2;

        // Cylindrical warp: symbols far from centre appear slightly compressed
        const normY = (rawY - (y + h/2)) / (h/2); // -1 to 1
        const scale = Math.max(0.4, Math.cos(normY * Math.PI * 0.45));
        const alpha = Math.max(0, 1 - Math.abs(normY) * 1.1);

        if (rawY < y - symH || rawY > y + h + symH) continue;

        ctx.save();
        ctx.translate(x + w/2, rawY);
        ctx.scale(1, scale);
        drawSymbol(sym, 0, 0, symH * .78, alpha);
        ctx.restore();
      }

      // Reel line separators
      ctx.strokeStyle = '#bbb'; ctx.lineWidth = 1;
      for (let i = 1; i <= 2; i++) {
        ctx.beginPath(); ctx.moveTo(x, y + i*symH); ctx.lineTo(x+w, y + i*symH); ctx.stroke();
      }

      ctx.restore(); // end clip

      // Chrome reel frame
      const frameGrad = ctx.createLinearGradient(x, y, x+w, y+h);
      frameGrad.addColorStop(0, 'rgba(200,200,200,.4)');
      frameGrad.addColorStop(.5, 'rgba(255,255,255,.1)');
      frameGrad.addColorStop(1, 'rgba(100,100,100,.3)');
      roundRect(x, y, w, h, 6);
      ctx.strokeStyle = frameGrad; ctx.lineWidth = 2; ctx.stroke();

      // Top/bottom shadow on drum
      const topShad = ctx.createLinearGradient(x, y, x, y+h*.22);
      topShad.addColorStop(0, 'rgba(0,0,0,.55)'); topShad.addColorStop(1, 'rgba(0,0,0,0)');
      roundRect(x, y, w, h*.22, 6);
      ctx.fillStyle = topShad; ctx.fill();

      const botShad = ctx.createLinearGradient(x, y+h*.78, x, y+h);
      botShad.addColorStop(0, 'rgba(0,0,0,0)'); botShad.addColorStop(1, 'rgba(0,0,0,.55)');
      roundRect(x, y+h*.78, w, h*.22, 6);
      ctx.fillStyle = botShad; ctx.fill();
    };

    /* ── Draw the full machine ── */
    const draw = () => {
      ctx.clearRect(0, 0, CW, CH);

      /* ── Cabinet body ── */
      // Main body — dark metallic red/black
      const cabGrad = ctx.createLinearGradient(CAB_X, CAB_TOP, CAB_X+CAB_W, CAB_TOP);
      cabGrad.addColorStop(0, '#1a0005'); cabGrad.addColorStop(.12, '#2a000a');
      cabGrad.addColorStop(.5, '#220008'); cabGrad.addColorStop(.88, '#2a000a'); cabGrad.addColorStop(1, '#1a0005');
      roundRect(CAB_X, CAB_TOP, CAB_W, CAB_H, 18);
      ctx.fillStyle = cabGrad; ctx.fill();

      // Chrome outer border
      const chromGrad = ctx.createLinearGradient(CAB_X, 0, CAB_X+CAB_W, 0);
      chromGrad.addColorStop(0, '#888'); chromGrad.addColorStop(.15, '#eee'); chromGrad.addColorStop(.5, '#ccc');
      chromGrad.addColorStop(.85, '#eee'); chromGrad.addColorStop(1, '#888');
      roundRect(CAB_X, CAB_TOP, CAB_W, CAB_H, 18);
      ctx.strokeStyle = chromGrad; ctx.lineWidth = CHROME; ctx.stroke();

      /* ── TOP SIGN — "SLOT MACHINE" marquee ── */
      const signX = CAB_X + CHROME/2 + 4;
      const signY = CAB_TOP + CHROME/2 + 2;
      const signW = CAB_W - CHROME - 8;
      const signH2 = SIGN_H - 4;

      const signBg = ctx.createLinearGradient(signX, signY, signX, signY+signH2);
      signBg.addColorStop(0, '#8b0000'); signBg.addColorStop(.5, '#cc0010'); signBg.addColorStop(1, '#6b0000');
      roundRect(signX, signY, signW, signH2, 10);
      ctx.fillStyle = signBg; ctx.fill();

      // Gold stripe top + bottom of sign
      ctx.fillStyle = '#ffd700';
      ctx.fillRect(signX, signY, signW, 5);
      ctx.fillRect(signX, signY+signH2-5, signW, 5);

      // Bulb dots along sign edges
      const bulbCols = ['#ff0','#f80','#f0f','#ff0','#0ff','#ff0','#f80'];
      const numBulbs = 16;
      for (let i = 0; i < numBulbs; i++) {
        const bx = signX + 10 + (i / (numBulbs-1)) * (signW - 20);
        const col = bulbCols[i % bulbCols.length];
        const on = winFlash ? (Math.floor(flashTimer*8+i*1.5)%2===0) : (i % 3 !== 1);
        ctx.beginPath(); ctx.arc(bx, signY+12, 4, 0, Math.PI*2);
        ctx.fillStyle = on ? col : '#333'; ctx.fill();
        if (on) { ctx.shadowColor = col; ctx.shadowBlur = 6; ctx.fill(); ctx.shadowBlur = 0; }
        ctx.beginPath(); ctx.arc(bx, signY+signH2-12, 4, 0, Math.PI*2);
        ctx.fillStyle = on ? col : '#333'; ctx.fill();
      }

      // SLOT MACHINE text
      ctx.font = `900 ${CW*.072}px 'Orbitron','Arial Black',sans-serif`;
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.strokeStyle = '#000'; ctx.lineWidth = 4; ctx.strokeText('SLOT MACHINE', signX+signW/2, signY+signH2*.38);
      const txtGrad = ctx.createLinearGradient(0, signY, 0, signY+signH2*.5);
      txtGrad.addColorStop(0, '#ffe066'); txtGrad.addColorStop(.5, '#ffd700'); txtGrad.addColorStop(1, '#cc8800');
      ctx.fillStyle = txtGrad; ctx.fillText('SLOT MACHINE', signX+signW/2, signY+signH2*.38);

      // WIN NOW subtext
      ctx.font = `700 ${CW*.045}px 'Share Tech Mono',monospace`;
      ctx.strokeStyle = '#000'; ctx.lineWidth = 2; ctx.strokeText('WIN NOW', signX+signW/2, signY+signH2*.72);
      ctx.fillStyle = '#fff'; ctx.fillText('WIN NOW', signX+signW/2, signY+signH2*.72);

      /* ── REEL WINDOW frame ── */
      const winX = REEL_AREA_X - 8;
      const winY = REEL_AREA_TOP - 8;
      const winW = REEL_AREA_W + 16;
      const winH = REEL_AREA_H + 16;

      // Outer chrome frame
      const wfg = ctx.createLinearGradient(winX, winY, winX, winY+winH);
      wfg.addColorStop(0, '#ddd'); wfg.addColorStop(.3, '#fff'); wfg.addColorStop(.7, '#bbb'); wfg.addColorStop(1, '#888');
      roundRect(winX, winY, winW, winH, 12);
      ctx.fillStyle = wfg; ctx.fill();

      // Inner dark bezel
      roundRect(winX+5, winY+5, winW-10, winH-10, 8);
      ctx.fillStyle = '#111'; ctx.fill();

      /* ── REELS ── */
      const rGap = 6;
      const rW = (REEL_AREA_W - rGap*2) / 3;
      for (let i = 0; i < 3; i++) {
        const rx = REEL_AREA_X + i*(rW + rGap);
        drawReel(i, rx, REEL_AREA_TOP, rW, REEL_AREA_H);
      }

      /* ── Payline indicator (centre line) ── */
      const plY = REEL_AREA_TOP + REEL_AREA_H/2;
      ctx.strokeStyle = winFlash ? `rgba(255,215,0,${.5+.5*Math.sin(flashTimer*10)})` : 'rgba(255,50,50,.7)';
      ctx.lineWidth = 2; ctx.setLineDash([6,4]);
      ctx.beginPath(); ctx.moveTo(winX+5, plY); ctx.lineTo(winX+winW-5, plY); ctx.stroke();
      ctx.setLineDash([]);

      /* ── Side panels: PLAY BIG / WIN BIG ── */
      const panW = REEL_AREA_X - CAB_X - CHROME/2 - 6;
      const panH = REEL_AREA_H + 16;
      const panY = REEL_AREA_TOP - 8;

      // Left panel
      const lpg = ctx.createLinearGradient(CAB_X+CHROME/2, panY, CAB_X+CHROME/2+panW, panY);
      lpg.addColorStop(0, '#1a0a00'); lpg.addColorStop(1, '#2a1500');
      roundRect(CAB_X+CHROME/2+2, panY+2, panW-4, panH-4, 6);
      ctx.fillStyle = lpg; ctx.fill();
      ctx.save(); ctx.translate(CAB_X+CHROME/2+2+panW/2, panY+panH/2); ctx.rotate(-Math.PI/2);
      ctx.font = `900 ${panW*.5}px 'Orbitron',sans-serif`;
      ctx.textAlign='center'; ctx.textBaseline='middle';
      ctx.strokeStyle='#000'; ctx.lineWidth=2; ctx.strokeText('PLAY BIG', 0, 0);
      ctx.fillStyle='#ffd700'; ctx.fillText('PLAY BIG', 0, 0);
      ctx.restore();

      // Right panel
      const rpX = winX+winW+2;
      const rpg = ctx.createLinearGradient(rpX, panY, rpX+panW, panY);
      rpg.addColorStop(0, '#2a1500'); rpg.addColorStop(1, '#1a0a00');
      roundRect(rpX, panY+2, panW-4, panH-4, 6);
      ctx.fillStyle = rpg; ctx.fill();
      ctx.save(); ctx.translate(rpX+panW/2, panY+panH/2); ctx.rotate(Math.PI/2);
      ctx.font = `900 ${panW*.5}px 'Orbitron',sans-serif`;
      ctx.textAlign='center'; ctx.textBaseline='middle';
      ctx.strokeStyle='#000'; ctx.lineWidth=2; ctx.strokeText('WIN BIG', 0, 0);
      ctx.fillStyle='#ffd700'; ctx.fillText('WIN BIG', 0, 0);
      ctx.restore();

      /* ── COIN SLOT ── */
      const coinSlotX = CAB_X + CAB_W*.38;
      const coinSlotW = CAB_W * .24;
      const coinSlotH = CW*.03;
      roundRect(coinSlotX, COIN_SLOT_Y, coinSlotW, coinSlotH, coinSlotH/2);
      ctx.fillStyle = '#111'; ctx.fill();
      ctx.strokeStyle = '#666'; ctx.lineWidth = 1.5; ctx.stroke();

      // "INSERT COIN" label
      ctx.font = `${CW*.025}px 'Share Tech Mono',monospace`;
      ctx.textAlign = 'center'; ctx.textBaseline = 'top';
      ctx.fillStyle = coinInserted ? '#ffd700' : '#555';
      ctx.fillText('INSERT COIN', CAB_X + CAB_W*.5, COIN_SLOT_Y + coinSlotH + 4);

      /* ── BUTTONS ── */
      const btnData = [
        { label:'INSERT
COIN', col:'#ffd700', id:'btn-coin', x:.22 },
        { label:'SPIN', col:'#ff2222', id:'btn-spin', x:.5 },
        { label:'MAX
BET', col:'#ffd700', id:'btn-max', x:.78 },
      ];
      const btnR = CW * .065;
      btnData.forEach(b => {
        const bx = CAB_X + CAB_W * b.x;
        const by = BTN_Y + btnR;

        // Housing
        ctx.beginPath(); ctx.ellipse(bx, by+btnR*.18, btnR+4, btnR*.35, 0, 0, Math.PI*2);
        ctx.fillStyle = '#111'; ctx.fill();

        // Button body
        const bgrad = ctx.createRadialGradient(bx-btnR*.2, by-btnR*.3, 0, bx, by, btnR);
        bgrad.addColorStop(0, b.col==='#ff2222'?'#ff8888':'#fff5aa');
        bgrad.addColorStop(.6, b.col);
        bgrad.addColorStop(1, b.col==='#ff2222'?'#660000':'#886600');
        ctx.beginPath(); ctx.arc(bx, by, btnR, 0, Math.PI*2);
        ctx.fillStyle = bgrad; ctx.fill();
        ctx.strokeStyle = '#000'; ctx.lineWidth = 2; ctx.stroke();

        // Shine
        ctx.beginPath(); ctx.ellipse(bx, by-btnR*.28, btnR*.4, btnR*.22, 0, 0, Math.PI*2);
        ctx.fillStyle = 'rgba(255,255,255,.35)'; ctx.fill();

        // Label
        const lines = b.label.split('
');
        ctx.font = `700 ${CW*.028}px 'Orbitron',sans-serif`;
        ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
        ctx.fillStyle = b.col==='#ff2222'?'#fff':'#111';
        if (lines.length===1) { ctx.fillText(lines[0], bx, by); }
        else { ctx.fillText(lines[0], bx, by-CW*.015); ctx.fillText(lines[1], bx, by+CW*.015); }
      });

      /* ── LEVER (right side) ── */
      const pivX = CAB_X + CAB_W + 6;
      const pivY = LEV_PIVOT_Y;
      const leverLen = CH * .16;
      const lbx = pivX + Math.cos(leverAngle) * leverLen;
      const lby = pivY + Math.sin(leverAngle) * leverLen;

      // Lever rod
      const lrg = ctx.createLinearGradient(pivX-5, 0, pivX+5, 0);
      lrg.addColorStop(0,'#888'); lrg.addColorStop(.3,'#eee'); lrg.addColorStop(.7,'#bbb'); lrg.addColorStop(1,'#666');
      ctx.save();
      ctx.translate(pivX, pivY); ctx.rotate(leverAngle - Math.PI/2);
      roundRect(-5, 0, 10, leverLen, 5);
      ctx.fillStyle = lrg; ctx.fill();
      ctx.strokeStyle = '#555'; ctx.lineWidth = 1; ctx.stroke();
      ctx.restore();

      // Pivot base
      ctx.beginPath(); ctx.arc(pivX, pivY, 10, 0, Math.PI*2);
      ctx.fillStyle = '#ccc'; ctx.fill(); ctx.strokeStyle='#888'; ctx.lineWidth=2; ctx.stroke();

      // Ball
      const bgrad2 = ctx.createRadialGradient(lbx-LEV_BALL_R*.25, lby-LEV_BALL_R*.3, 0, lbx, lby, LEV_BALL_R);
      bgrad2.addColorStop(0,'#ff8888'); bgrad2.addColorStop(.5,'#cc0000'); bgrad2.addColorStop(1,'#550000');
      ctx.beginPath(); ctx.arc(lbx, lby, LEV_BALL_R, 0, Math.PI*2);
      ctx.fillStyle = bgrad2; ctx.fill();
      ctx.strokeStyle = '#330000'; ctx.lineWidth = 2; ctx.stroke();
      ctx.beginPath(); ctx.ellipse(lbx-LEV_BALL_R*.22, lby-LEV_BALL_R*.28, LEV_BALL_R*.3, LEV_BALL_R*.18, -Math.PI/6, 0, Math.PI*2);
      ctx.fillStyle = 'rgba(255,255,255,.35)'; ctx.fill();

      /* ── CREDITS & RESULT DISPLAY ── */
      const dispY = BTN_Y + btnR*2 + CW*.04;
      const dispH  = CW*.11;

      // Credits panel
      const dpg = ctx.createLinearGradient(CAB_X+CHROME/2+4, dispY, CAB_X+CHROME/2+4, dispY+dispH);
      dpg.addColorStop(0,'#000'); dpg.addColorStop(1,'#0a0505');
      roundRect(CAB_X+CHROME/2+4, dispY, CAB_W-CHROME-8, dispH, 8);
      ctx.fillStyle = dpg; ctx.fill();
      ctx.strokeStyle = '#333'; ctx.lineWidth = 1.5; ctx.stroke();

      // Credit display (LED style)
      ctx.font = `900 ${CW*.042}px 'Share Tech Mono',monospace`;
      ctx.textAlign = 'left'; ctx.textBaseline = 'middle';
      ctx.fillStyle = 'rgba(255,100,0,.25)'; ctx.fillText('CREDITS', CAB_X+CHROME/2+14, dispY+dispH*.35);
      ctx.fillStyle = '#ff6600'; ctx.shadowColor='#ff6600'; ctx.shadowBlur=6;
      ctx.font = `900 ${CW*.055}px 'Share Tech Mono',monospace`;
      ctx.fillText(credits.toLocaleString(), CAB_X+CHROME/2+14, dispY+dispH*.72);
      ctx.shadowBlur=0;

      // Result message
      if (resultMsg) {
        ctx.font = `900 ${CW*.042}px 'Orbitron',sans-serif`;
        ctx.textAlign = 'right'; ctx.textBaseline = 'middle';
        const flash = Math.sin(flashTimer * 8) > 0;
        if (!winFlash || flash) {
          ctx.fillStyle = resultCol; ctx.shadowColor = resultCol; ctx.shadowBlur = winFlash ? 12 : 0;
          ctx.fillText(resultMsg, CAB_X+CAB_W-CHROME/2-10, dispY+dispH*.55);
          ctx.shadowBlur = 0;
        }
      }

      /* ── LAS VEGAS branding strip ── */
      const lvY = dispY + dispH + CW*.025;
      const lvH = CW*.065;
      const lvg = ctx.createLinearGradient(CAB_X+CHROME/2, lvY, CAB_X+CAB_W-CHROME/2, lvY);
      lvg.addColorStop(0,'#1a0a00'); lvg.addColorStop(.5,'#2a1500'); lvg.addColorStop(1,'#1a0a00');
      roundRect(CAB_X+CHROME/2+4, lvY, CAB_W-CHROME-8, lvH, 6);
      ctx.fillStyle = lvg; ctx.fill();

      // Bokeh dots
      for (let i=0;i<20;i++) {
        const bx2 = CAB_X+CHROME/2+12 + (i/19)*(CAB_W-CHROME-24);
        const col2 = ['#ffd700','#ff8800','#ff4400'][i%3];
        const on2 = winFlash?(Math.floor(flashTimer*6+i*1.3)%2===0):(i%4!==2);
        ctx.beginPath(); ctx.arc(bx2, lvY+lvH/2, 3.5, 0, Math.PI*2);
        ctx.fillStyle = on2?col2:'#222'; ctx.fill();
        if(on2){ctx.shadowColor=col2;ctx.shadowBlur=5;ctx.fill();ctx.shadowBlur=0;}
      }
      ctx.font = `700 ${CW*.038}px 'Orbitron',sans-serif`;
      ctx.textAlign='center'; ctx.textBaseline='middle'; ctx.fillStyle='rgba(255,215,0,.55)';
      ctx.fillText('✦  LAS VEGAS  ✦', CAB_X+CAB_W/2, lvY+lvH/2);
    };

    /* ── Animation loop ── */
    let raf2 = null;
    const SPIN_SPEED_MAX = 28; // symbols/sec during full spin
    let spinFinished = [false, false, false];

    const evalResult = () => {
      const sym = reels.map(r => {
        const idx = ((Math.round(r.offset)) % STRIP_LEN + STRIP_LEN) % STRIP_LEN;
        return STRIP[idx];
      });
      let mult = 0;
      let msg  = '';

      // Jackpot: all SEVEN
      if (sym[0]==='SEVEN'&&sym[1]==='SEVEN'&&sym[2]==='SEVEN') { mult=100; msg='JACKPOT! 777'; }
      else if (sym[0]==='BAR'&&sym[1]==='BAR'&&sym[2]==='BAR')  { mult=30;  msg='BAR BAR BAR!'; }
      else if (sym.every(s=>s===sym[0]))                          { mult=20;  msg='THREE OF A KIND!'; }
      else if (sym[0]===sym[1]&&sym[0]==='BAR')                  { mult=8;   msg='BAR BAR'; }
      else if (sym[0]===sym[1]&&sym[0]==='SEVEN')                { mult=5;   msg='7 7'; }
      else if (sym[0]===sym[1])                                   { mult=2;   msg='PAIR!'; }
      else if (sym.some(s=>s==='CHERRY'))                         { mult=2;   msg='CHERRY!'; }

      if (mult > 0) {
        const prize = BET * mult;
        credits = Math.min(credits + prize, 9999999);
        _addCoins(prize);
        updateWallet(0, null); // update header display
        resultMsg = `+${prize} 🏆`;
        resultCol  = mult >= 100 ? '#ff4af8' : '#ffd700';
        winFlash   = true;
        haptic('success');
      } else {
        resultMsg = 'No match';
        resultCol  = 'rgba(255,255,255,.3)';
        winFlash   = false;
        haptic('light');
      }
    };

    const animLoop = (ts) => {
      flashTimer = ts / 1000;

      if (spinning) {
        let allDone = true;
        reels.forEach((r, i) => {
          if (r.stopped) return;
          allDone = false;

          // Decelerate after delay
          if (r.speed < SPIN_SPEED_MAX && r.targetOffset < 0) {
            r.speed = Math.min(SPIN_SPEED_MAX, r.speed + 2.5);
          }

          // Braking phase
          if (r.targetOffset >= 0) {
            const dist = r.targetOffset - r.offset;
            const wdist = ((dist % STRIP_LEN) + STRIP_LEN) % STRIP_LEN;
            if (wdist < 0.06) {
              r.offset = r.targetOffset;
              r.stopped = true;
              r.speed = 0;
              haptic('light');
            } else {
              // Ease in approach
              const approach = Math.min(r.speed, wdist * 6 + 0.3);
              r.offset = (r.offset + approach / 60) % STRIP_LEN;
            }
          } else {
            r.offset = (r.offset + r.speed / 60) % STRIP_LEN;
          }
        });

        if (allDone) {
          spinning = false;
          evalResult();
        }
      }

      // Lever animation
      if (leverAnim === 1) {
        leverAngle = Math.min(leverAngle + 0.08, Math.PI * .35);
        if (leverAngle >= Math.PI * .35) leverAnim = 2;
      } else if (leverAnim === 2) {
        leverAngle = Math.max(leverAngle - 0.04, -Math.PI * .18);
        if (leverAngle <= -Math.PI * .18) { leverAngle = -Math.PI*.18; leverAnim = 0; }
      }

      draw();
      raf2 = requestAnimationFrame(animLoop);
    };

    raf2 = requestAnimationFrame(animLoop);

    /* ── Input — tap zones ── */
    const getHitZone = (ex, ey) => {
      const btnR = CW * .065;
      const btnPositions = [
        { id:'coin', x: CAB_X+CAB_W*.22, y: BTN_Y+btnR },
        { id:'spin', x: CAB_X+CAB_W*.5,  y: BTN_Y+btnR },
        { id:'max',  x: CAB_X+CAB_W*.78, y: BTN_Y+btnR },
      ];
      for (const b of btnPositions) {
        if (Math.hypot(ex-b.x, ey-b.y) < btnR+10) return b.id;
      }
      // Lever ball
      const lbx = LEV_X + Math.cos(leverAngle) * CH * .16;
      const lby = LEV_PIVOT_Y + Math.sin(leverAngle) * CH * .16;
      if (Math.hypot(ex-lbx, ey-lby) < LEV_BALL_R+14) return 'lever';
      return null;
    };

    const doSpin = () => {
      if (spinning) return;
      if (!coinInserted) { resultMsg = 'Insert coin first!'; resultCol='#ff6b6b'; return; }
      if (credits < BET) { resultMsg = 'Not enough credits!'; resultCol='#ff6b6b'; return; }
      credits -= BET;
      _addCoins(-BET);
      updateWallet(0, null);
      coinInserted = false;
      resultMsg = '';
      winFlash = false;
      spinning = true;
      spinFinished = [false,false,false];

      // Determine final reel positions
      const targets = reels.map((r,i) => {
        const finalSymIdx = Math.floor(Math.random() * STRIP_LEN);
        // Target = finalSymIdx, but we need to be at least 2 full rotations ahead
        const cur = r.offset;
        let tgt = finalSymIdx + STRIP_LEN * (2 + i); // extra rotations for drama
        // Align tgt so it lands on finalSymIdx
        tgt = cur + ((tgt - cur + STRIP_LEN*10) % (STRIP_LEN*10));
        return { finalSymIdx, tgt };
      });

      reels.forEach((r, i) => {
        r.stopped = false;
        r.speed = 0;
        r.targetOffset = -1; // signal: not yet braking
        // Stagger stop times
        const stopDelay = 1200 + i * 800;
        setTimeout(() => {
          if (!spinning) return;
          const tgt = targets[i];
          r.targetOffset = tgt.tgt % STRIP_LEN;
        }, stopDelay);
      });

      leverAnim = 1; // pull animation
      haptic('medium');
    };

    const insertCoin = () => {
      if (coinInserted) return;
      if (credits < BET) { resultMsg='Not enough credits!'; resultCol='#ff6b6b'; return; }
      coinInserted = true;
      resultMsg = 'GOOD LUCK!';
      resultCol = '#ffd700';
      winFlash = false;
      haptic('light');
    };

    cv.addEventListener('touchstart', e => {
      e.preventDefault();
      const rect = cv.getBoundingClientRect();
      const scaleX = CW / rect.width;
      const scaleY = CH / rect.height;
      const t = e.touches[0];
      const ex = (t.clientX - rect.left) * scaleX;
      const ey = (t.clientY - rect.top)  * scaleY;
      const zone = getHitZone(ex, ey);
      if (zone === 'coin')  insertCoin();
      if (zone === 'spin' || zone === 'lever') doSpin();
      if (zone === 'max')  { if (!spinning&&credits>=BET){coinInserted=true;doSpin();} }
    }, { passive: false });

    cv.addEventListener('click', e => {
      const rect = cv.getBoundingClientRect();
      const scaleX = CW / rect.width;
      const scaleY = CH / rect.height;
      const ex = (e.clientX - rect.left) * scaleX;
      const ey = (e.clientY - rect.top)  * scaleY;
      const zone = getHitZone(ex, ey);
      if (zone === 'coin')  insertCoin();
      if (zone === 'spin' || zone === 'lever') doSpin();
      if (zone === 'max')  { if (!spinning&&credits>=BET){coinInserted=true;doSpin();} }
    });

    // Cleanup
    wrap._slotCleanup = () => { cancelAnimationFrame(raf2); };
  };

  /* ════ HI-LO ════ */
  const buildHiLo = wrap => {
    const SUITS=['♠','♥','♦','♣'],RANKS=['A','2','3','4','5','6','7','8','9','10','J','Q','K'];
    const VALUES={A:1,'2':2,'3':3,'4':4,'5':5,'6':6,'7':7,'8':8,'9':9,'10':10,J:11,Q:12,K:13};
    const SCOL={'♠':'#111','♣':'#111','♥':'#cc0000','♦':'#cc0000'};
    let deck=[],cur=null,streak=0,bet=10,busy=false;
    const mkDeck=()=>{deck=[];SUITS.forEach(s=>RANKS.forEach(r=>deck.push({r,s,v:VALUES[r]})));for(let i=deck.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[deck[i],deck[j]]=[deck[j],deck[i]];}};
    const draw=()=>deck.length?deck.pop():(mkDeck(),deck.pop());
    const cHTML=(c,hidden)=>hidden?`<div style="width:90px;height:130px;border-radius:14px;background:linear-gradient(135deg,#1a1260,#0a0830);border:2px solid rgba(255,255,255,.12);display:flex;align-items:center;justify-content:center;font-size:2rem;">🂠</div>`
      :`<div style="width:90px;height:130px;border-radius:14px;background:linear-gradient(135deg,#fff,#f0f0f0);border:2px solid rgba(0,0,0,.1);display:flex;flex-direction:column;padding:8px;color:${SCOL[c.s]};animation:cs-deal .3s both;"><div style="font-family:'Orbitron',sans-serif;font-size:1rem;font-weight:900;line-height:1;">${c.r}<br><span style="font-size:1.2rem;">${c.s}</span></div><div style="flex:1;display:flex;align-items:center;justify-content:center;font-size:2.2rem;">${c.s}</div><div style="font-family:'Orbitron',sans-serif;font-size:1rem;font-weight:900;line-height:1;align-self:flex-end;transform:rotate(180deg);">${c.r}<br><span style="font-size:1.2rem;">${c.s}</span></div></div>`;

    const render=()=>{
      wrap.innerHTML=`<div style="display:flex;flex-direction:column;align-items:center;gap:18px;padding-top:10px;">
        <div style="display:flex;align-items:center;gap:8px;"><div style="font-family:'Share Tech Mono',monospace;font-size:.6rem;color:var(--dim);letter-spacing:.14em;text-transform:uppercase;">Streak</div><div id="hl-st" style="font-family:'Orbitron',sans-serif;font-size:1.1rem;font-weight:900;color:#ffd700;min-width:30px;text-align:center;">${streak}</div>${streak>=3?'<div style="font-size:.7rem;color:#ffd700;">🔥</div>':''}</div>
        <div style="display:flex;align-items:center;gap:14px;"><div id="hl-cur">${cHTML(cur,false)}</div><div style="font-size:2rem;color:rgba(255,255,255,.2);">→</div><div id="hl-nxt">${cHTML(null,true)}</div></div>
        <div style="font-family:'Share Tech Mono',monospace;font-size:.7rem;color:var(--dim);letter-spacing:.1em;">Current: <span style="color:var(--text);">${cur.r}${cur.s} (${cur.v})</span></div>
        <div id="hl-res" style="font-family:'Orbitron',sans-serif;font-size:.85rem;font-weight:900;letter-spacing:.1em;min-height:26px;text-align:center;"></div>
        <div style="font-family:'Share Tech Mono',monospace;font-size:.58rem;color:rgba(255,255,255,.25);text-align:center;">Streak bonus: ×${Math.max(1,streak)} on next win</div>
        <div style="display:flex;gap:12px;" id="hl-btns">
          <button id="hl-lo" style="font-family:'Orbitron',sans-serif;font-size:.85rem;font-weight:900;letter-spacing:.1em;text-transform:uppercase;color:#fff;background:linear-gradient(135deg,#0033cc,#001a66);border:2px solid #4488ff;padding:16px 32px;border-radius:22px;cursor:pointer;-webkit-tap-highlight-color:transparent;box-shadow:0 4px 20px rgba(0,100,255,.4);">▼ Lower</button>
          <button id="hl-hi" style="font-family:'Orbitron',sans-serif;font-size:.85rem;font-weight:900;letter-spacing:.1em;text-transform:uppercase;color:#fff;background:linear-gradient(135deg,#cc0000,#660000);border:2px solid #ff4444;padding:16px 32px;border-radius:22px;cursor:pointer;-webkit-tap-highlight-color:transparent;box-shadow:0 4px 20px rgba(255,0,0,.4);">▲ Higher</button>
        </div>
        <div style="display:flex;align-items:center;gap:10px;flex-wrap:wrap;justify-content:center;">
          <button id="hl-bd" style="width:38px;height:38px;border-radius:50%;background:rgba(255,255,255,.06);border:1px solid rgba(255,255,255,.1);color:var(--text);font-size:1.1rem;cursor:pointer;-webkit-tap-highlight-color:transparent;">−</button>
          <div style="text-align:center;"><div style="font-family:'Share Tech Mono',monospace;font-size:.5rem;color:var(--dim);text-transform:uppercase;letter-spacing:.14em;">Bet</div><div id="hl-bet" style="font-family:'Orbitron',sans-serif;font-size:1rem;font-weight:900;color:#ffd700;">${bet}</div></div>
          <button id="hl-bu" style="width:38px;height:38px;border-radius:50%;background:rgba(255,255,255,.06);border:1px solid rgba(255,255,255,.1);color:var(--text);font-size:1.1rem;cursor:pointer;-webkit-tap-highlight-color:transparent;">+</button>
          ${streak>0?`<button id="hl-cash" style="font-family:'Orbitron',sans-serif;font-size:.6rem;font-weight:900;letter-spacing:.1em;text-transform:uppercase;color:#050508;background:#ffd700;border:none;padding:10px 20px;border-radius:16px;cursor:pointer;-webkit-tap-highlight-color:transparent;box-shadow:0 0 16px rgba(255,215,0,.5);">Cash Out ×${streak}</button>`:''}
        </div>
      </div>`;
      const setBet=v=>{bet=Math.max(5,Math.min(200,v));document.getElementById('hl-bet').textContent=bet;};
      document.getElementById('hl-bd').onclick=()=>{haptic('light');setBet(bet-5);};
      document.getElementById('hl-bu').onclick=()=>{haptic('light');setBet(bet+5);};
      const guess=choice=>{
        if(busy)return;if(_casinoCoins<bet){document.getElementById('hl-res').style.color='#ff6b6b';document.getElementById('hl-res').textContent='Not enough coins!';return;}
        busy=true;updateWallet(-bet,document.getElementById('hl-btns'));haptic('medium');
        const next=draw();document.getElementById('hl-nxt').innerHTML=cHTML(next,false);
        setTimeout(()=>{
          const res=document.getElementById('hl-res'),tie=next.v===cur.v,correct=!tie&&((choice==='hi'&&next.v>cur.v)||(choice==='lo'&&next.v<cur.v));
          if(tie){res.style.color='#ffd700';res.textContent='🤝 Tie — bet returned!';updateWallet(bet,res);streak=0;haptic('light');}
          else if(correct){streak++;const p=bet*Math.max(1,streak);updateWallet(p,res);res.style.color='#ffd700';res.textContent=`✓ Correct! +${p} (×${Math.max(1,streak)} streak)`;haptic('success');}
          else{res.style.color='#ff6b6b';res.textContent=`✗ Wrong! ${next.r}${next.s} (${next.v})`;streak=0;haptic('heavy');}
          cur=next;setTimeout(()=>{busy=false;render();},1200);
        },400);
      };
      document.getElementById('hl-hi').onclick=()=>guess('hi');
      document.getElementById('hl-lo').onclick=()=>guess('lo');
      const ce=document.getElementById('hl-cash');
      if(ce)ce.onclick=()=>{haptic('success');const p=bet*streak;updateWallet(p,ce);streak=0;render();};
    };
    mkDeck();cur=draw();render();
  };

  /* ════ BLACKJACK ════ */
  const buildBlackjack = wrap => {
    const SUITS=['♠','♥','♦','♣'],RANKS=['A','2','3','4','5','6','7','8','9','10','J','Q','K'];
    const SCOL={'♠':'#111','♣':'#111','♥':'#cc0000','♦':'#cc0000'};
    let deck=[],ph=[],dh=[],bet=20,gs='idle';
    const mkDeck=()=>{deck=[];SUITS.forEach(s=>RANKS.forEach(r=>deck.push({r,s})));SUITS.forEach(s=>RANKS.forEach(r=>deck.push({r,s})));for(let i=deck.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[deck[i],deck[j]]=[deck[j],deck[i]];}};
    const draw=()=>deck.length?deck.pop():(mkDeck(),deck.pop());
    const val=c=>['J','Q','K'].includes(c.r)?10:c.r==='A'?11:parseInt(c.r);
    const hval=h=>{let t=h.reduce((s,c)=>s+val(c),0),a=h.filter(c=>c.r==='A').length;while(t>21&&a>0){t-=10;a--;}return t;};
    const cHTML=(c,fd)=>fd?`<div style="width:58px;height:86px;border-radius:10px;background:linear-gradient(135deg,#1a1260,#0a0830);border:2px solid rgba(255,255,255,.12);display:flex;align-items:center;justify-content:center;font-size:1.4rem;flex-shrink:0;">🂠</div>`
      :`<div style="width:58px;height:86px;border-radius:10px;background:linear-gradient(135deg,#fff,#f0f0f0);border:2px solid rgba(0,0,0,.1);display:flex;flex-direction:column;padding:5px;color:${SCOL[c.s]};font-family:'Orbitron',sans-serif;flex-shrink:0;animation:cs-deal .25s both;"><div style="font-size:.65rem;font-weight:900;line-height:1.1;">${c.r}${c.s}</div><div style="flex:1;display:flex;align-items:center;justify-content:center;font-size:1.3rem;">${c.s}</div><div style="font-size:.65rem;font-weight:900;line-height:1.1;align-self:flex-end;transform:rotate(180deg);">${c.r}${c.s}</div></div>`;
    const handHTML=(h,hide2)=>`<div style="display:flex;gap:6px;flex-wrap:wrap;">${h.map((c,i)=>i===1&&hide2?cHTML(c,true):cHTML(c,false)).join('')}</div>`;

    const idle=()=>{
      wrap.innerHTML=`<div style="display:flex;flex-direction:column;align-items:center;gap:22px;padding-top:20px;"><div style="font-size:4rem;">♠️</div><div style="font-family:'Orbitron',sans-serif;font-size:1rem;font-weight:900;color:var(--cyan);letter-spacing:.1em;">BLACKJACK</div><div style="font-family:'Share Tech Mono',monospace;font-size:.62rem;color:var(--dim);text-align:center;line-height:1.7;max-width:260px;">Get closer to 21 than the dealer.<br>Dealer stands on 17. Blackjack pays 1.5×.</div>
        <div style="display:flex;align-items:center;gap:12px;">
          <button id="bj-bd" style="width:40px;height:40px;border-radius:50%;background:rgba(255,255,255,.06);border:1px solid rgba(255,255,255,.1);color:var(--text);font-size:1.2rem;cursor:pointer;-webkit-tap-highlight-color:transparent;">−</button>
          <div style="text-align:center;"><div style="font-family:'Share Tech Mono',monospace;font-size:.5rem;color:var(--dim);text-transform:uppercase;letter-spacing:.14em;">Bet</div><div id="bj-bet" style="font-family:'Orbitron',sans-serif;font-size:1.2rem;font-weight:900;color:#ffd700;">${bet}</div></div>
          <button id="bj-bu" style="width:40px;height:40px;border-radius:50%;background:rgba(255,255,255,.06);border:1px solid rgba(255,255,255,.1);color:var(--text);font-size:1.2rem;cursor:pointer;-webkit-tap-highlight-color:transparent;">+</button>
        </div>
        <button id="bj-deal" style="font-family:'Orbitron',sans-serif;font-size:.9rem;font-weight:900;letter-spacing:.14em;text-transform:uppercase;color:#050508;background:linear-gradient(135deg,#00ffcc,#00aa88);border:none;padding:18px 52px;border-radius:50px;cursor:pointer;box-shadow:0 4px 24px rgba(0,255,204,.4);-webkit-tap-highlight-color:transparent;">Deal</button>
        <div style="font-family:'Share Tech Mono',monospace;font-size:.55rem;color:rgba(255,255,255,.15);text-align:center;">Blackjack pays ×1.5 · Dealer stands on 17</div>
      </div>`;
      const sb=v=>{bet=Math.max(5,Math.min(500,v));document.getElementById('bj-bet').textContent=bet;};
      document.getElementById('bj-bd').onclick=()=>{haptic('light');sb(bet-5);};
      document.getElementById('bj-bu').onclick=()=>{haptic('light');sb(bet+5);};
      document.getElementById('bj-deal').onclick=()=>{
        if(_casinoCoins<bet)return;haptic('medium');updateWallet(-bet,document.getElementById('bj-deal'));
        ph=[draw(),draw()];dh=[draw(),draw()];gs='playing';playing();
      };
    };

    const playing=(rev=false)=>{
      const pv=hval(ph),dv=hval(dh),bust=pv>21,bj=ph.length===2&&pv===21;
      wrap.innerHTML=`<div style="display:flex;flex-direction:column;gap:16px;padding-top:8px;">
        <div style="background:rgba(255,255,255,.03);border:1px solid rgba(255,255,255,.06);border-radius:18px;padding:14px 16px;"><div style="font-family:'Share Tech Mono',monospace;font-size:.55rem;color:var(--dim);letter-spacing:.14em;text-transform:uppercase;margin-bottom:10px;">Dealer ${rev?'— '+dv:''}</div>${handHTML(dh,!rev)}</div>
        <div style="background:rgba(0,255,204,.04);border:1px solid rgba(0,255,204,.12);border-radius:18px;padding:14px 16px;"><div style="font-family:'Share Tech Mono',monospace;font-size:.55rem;color:var(--dim);letter-spacing:.14em;text-transform:uppercase;margin-bottom:10px;">You — <span style="color:${pv>21?'#ff6b6b':pv===21?'#ffd700':'var(--cyan)'}">${pv}</span></div>${handHTML(ph,false)}</div>
        <div id="bj-res" style="font-family:'Orbitron',sans-serif;font-size:.95rem;font-weight:900;letter-spacing:.1em;text-align:center;min-height:28px;"></div>
        <div style="display:flex;gap:10px;justify-content:center;flex-wrap:wrap;">
          ${bust||bj||rev
            ?`<button id="bj-ag" style="font-family:'Orbitron',sans-serif;font-size:.8rem;font-weight:900;letter-spacing:.12em;text-transform:uppercase;color:#050508;background:linear-gradient(135deg,#00ffcc,#00aa88);border:none;padding:16px 40px;border-radius:50px;cursor:pointer;box-shadow:0 4px 20px rgba(0,255,204,.4);-webkit-tap-highlight-color:transparent;">Play Again</button>`
            :`<button id="bj-hit" style="font-family:'Orbitron',sans-serif;font-size:.8rem;font-weight:900;letter-spacing:.12em;text-transform:uppercase;color:#fff;background:linear-gradient(135deg,#e53935,#8b0000);border:none;padding:14px 28px;border-radius:20px;cursor:pointer;box-shadow:0 4px 16px rgba(200,0,0,.4);-webkit-tap-highlight-color:transparent;">Hit</button>
             <button id="bj-st" style="font-family:'Orbitron',sans-serif;font-size:.8rem;font-weight:900;letter-spacing:.12em;text-transform:uppercase;color:#fff;background:linear-gradient(135deg,#1565c0,#0d47a1);border:none;padding:14px 28px;border-radius:20px;cursor:pointer;box-shadow:0 4px 16px rgba(0,80,200,.4);-webkit-tap-highlight-color:transparent;">Stand</button>
             ${ph.length===2&&_casinoCoins>=bet?`<button id="bj-dbl" style="font-family:'Orbitron',sans-serif;font-size:.8rem;font-weight:900;letter-spacing:.12em;text-transform:uppercase;color:#fff;background:linear-gradient(135deg,#6a0dad,#3a006d);border:none;padding:14px 28px;border-radius:20px;cursor:pointer;box-shadow:0 4px 16px rgba(100,0,200,.4);-webkit-tap-highlight-color:transparent;">Double</button>`:''}`
          }
        </div>
      </div>`;
      const re=document.getElementById('bj-res');
      if(bust){re.style.color='#ff6b6b';re.textContent='💥 Bust! Dealer wins.';haptic('heavy');}
      else if(bj){const p=Math.round(bet*1.5)+bet;updateWallet(p,re);re.style.color='#ffd700';re.textContent=`🃏 Blackjack! +${p}`;haptic('success');}
      else if(rev){
        if(hval(dh)>21||pv>dv){const p=bet*2;updateWallet(p,re);re.style.color='#00ffcc';re.textContent=`🏆 You win! +${p}`;haptic('success');}
        else if(pv===dv){updateWallet(bet,re);re.style.color='#ffd700';re.textContent='🤝 Push — bet returned';haptic('light');}
        else{re.style.color='#ff6b6b';re.textContent=`💀 Dealer wins (${hval(dh)} vs ${pv})`;haptic('heavy');}
      }
      const h=document.getElementById('bj-hit'),s=document.getElementById('bj-st'),d=document.getElementById('bj-dbl'),a=document.getElementById('bj-ag');
      if(h)h.onclick=()=>{haptic('medium');ph.push(draw());if(hval(ph)>21)playing(true);else playing(false);};
      if(s)s.onclick=()=>{haptic('medium');while(hval(dh)<17)dh.push(draw());playing(true);};
      if(d)d.onclick=()=>{haptic('medium');updateWallet(-bet,d);bet*=2;ph.push(draw());while(hval(dh)<17)dh.push(draw());playing(true);};
      if(a)a.onclick=()=>{gs='idle';bet=Math.min(bet,Math.max(_casinoCoins,5));idle();};
    };

    mkDeck();idle();
  };

  /* ── Init ── */
  return () => { _saveCoins(); };
}
