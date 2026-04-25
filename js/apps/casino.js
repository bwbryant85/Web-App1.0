/* ════════════ CASINO 🎰 ════════════ */

/* ── Wallet lives OUTSIDE initCasino so it survives app re-opens ──
First call reads localStorage. After that the in-memory value is
authoritative and localStorage is kept in sync on every change.   */
const _CASINO_KEY = ‘ipocket_casino_coins’;
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
const root = document.createElement(‘div’);
root.style.cssText = ‘width:100%;height:100%;display:flex;flex-direction:column;background:#050508;overflow:hidden;’;
content.appendChild(root);

/* ── Styles ── */
if (!document.getElementById(‘casino-styles’)) {
const st = document.createElement(‘style’);
st.id = ‘casino-styles’;
st.textContent = `@keyframes cs-deal  {from{opacity:0;transform:translateY(-40px) rotate(-8deg)}to{opacity:1;transform:translateY(0) rotate(0)}} @keyframes cs-win   {0%,100%{transform:scale(1)}25%{transform:scale(1.18)}75%{transform:scale(1.1)}} @keyframes cs-shake {0%,100%{transform:translateX(0)}25%{transform:translateX(-8px)}75%{transform:translateX(8px)}} @keyframes cs-spinb {from{filter:blur(4px);transform:translateY(-60px)}to{filter:blur(0);transform:translateY(0)}} @keyframes cs-coins {0%{transform:translateY(0) scale(1);opacity:1}100%{transform:translateY(-80px) scale(1.4);opacity:0}} @keyframes cs-pulse {0%,100%{box-shadow:0 0 20px rgba(255,215,0,.4)}50%{box-shadow:0 0 40px rgba(255,215,0,.9)}}`;
document.head.appendChild(st);
}

/* ── Header ── */
const header = document.createElement(‘div’);
header.style.cssText = ‘flex-shrink:0;padding:89px 18px 0;background:#050508;’;
root.appendChild(header);

const headerRow = document.createElement(‘div’);
headerRow.style.cssText = ‘display:flex;align-items:center;gap:12px;margin-bottom:14px;’;
headerRow.innerHTML = ` <button id="cs-back" style="display:none;font-family:'Orbitron',sans-serif;font-size:.78rem;letter-spacing:.1em;text-transform:uppercase;color:var(--cyan);background:transparent;border:none;cursor:pointer;-webkit-tap-highlight-color:transparent;padding:6px 0;text-shadow:var(--gc);">← Back</button> <div id="cs-title" style="font-family:'Orbitron',sans-serif;font-size:1.05rem;font-weight:900;letter-spacing:.1em;text-transform:uppercase;background:linear-gradient(135deg,#ffd700,#ff8c00);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;flex:1;">🎰 Casino</div> <div id="cs-wallet" style="font-family:'Share Tech Mono',monospace;font-size:.85rem;color:#ffd700;text-shadow:0 0 12px rgba(255,215,0,.6);letter-spacing:.06em;">🪙 ${_casinoCoins.toLocaleString()}</div>`;
header.appendChild(headerRow);

/* ── Body ── */
const body = document.createElement(‘div’);
body.style.cssText = ‘flex:1;overflow:hidden;position:relative;’;
root.appendChild(body);

/* ── Wallet helpers ── */
const refreshWalletDisplay = () => {
const el = document.getElementById(‘cs-wallet’);
if (el) el.textContent = `🪙 ${_casinoCoins.toLocaleString()}`;
const lb = document.getElementById(‘cs-lobby-bal’);
if (lb) lb.textContent = `🪙 ${_casinoCoins.toLocaleString()}`;
};

const updateWallet = (delta, refEl) => {
_addCoins(delta);
refreshWalletDisplay();
if (delta !== 0 && refEl) {
const float = document.createElement(‘div’);
float.style.cssText = `position:fixed;font-family:'Orbitron',sans-serif;font-size:.9rem;font-weight:900;color:${delta>0?'#ffd700':'#ff6b6b'};pointer-events:none;z-index:9999;animation:cs-coins .8s ease forwards;`;
float.textContent = (delta > 0 ? ‘+’ : ‘’) + delta.toLocaleString();
const r = refEl.getBoundingClientRect();
float.style.left = (r.left + r.width/2 - 30) + ‘px’;
float.style.top  = r.top + ‘px’;
document.body.appendChild(float);
setTimeout(() => float.remove(), 900);
}
};

/* ════ LOBBY ════ */
const lobbyPanel = document.createElement(‘div’);
lobbyPanel.style.cssText = ‘position:absolute;inset:0;overflow-y:auto;-webkit-overflow-scrolling:touch;padding:12px 16px 60px;display:flex;flex-direction:column;gap:14px;’;
body.appendChild(lobbyPanel);

const GAMES = [
{id:‘slots’,     name:‘Slot Machine’, ico:‘🎰’, desc:‘3 reels · Match to win’,         col:’#ffd700’, grad:‘linear-gradient(145deg,#3d2000,#1a0d00)’, jackpot:‘50×’},
{id:‘hilo’,      name:‘Hi-Lo’,        ico:‘🃏’, desc:‘Higher or lower?’,               col:’#ff6b6b’, grad:‘linear-gradient(145deg,#2a0010,#0a0005)’, jackpot:‘×streak’},
{id:‘blackjack’, name:‘Blackjack’,    ico:‘♠️’, desc:‘Beat the dealer to 21’,           col:’#00ffcc’, grad:‘linear-gradient(145deg,#003322,#000f0a)’, jackpot:‘1.5×’},
];

// Balance card at top
const balCard = document.createElement(‘div’);
balCard.style.cssText = ` margin-bottom:18px;padding:20px 20px 16px;border-radius:22px; background:linear-gradient(135deg,rgba(255,215,0,.08),rgba(255,140,0,.04)); border:1px solid rgba(255,215,0,.2); box-shadow:0 0 30px rgba(255,215,0,.06); text-align:center;position:relative;overflow:hidden;`;
balCard.innerHTML = ` <div style="position:absolute;top:0;left:0;right:0;height:2px;background:linear-gradient(90deg,transparent,#ffd700,transparent);"></div> <div style="font-family:'Share Tech Mono',monospace;font-size:.52rem;color:rgba(255,215,0,.45);letter-spacing:.22em;text-transform:uppercase;margin-bottom:8px;">Your Balance</div> <div id="cs-lobby-bal" style="font-family:'Orbitron',sans-serif;font-size:2.4rem;font-weight:900;color:#ffd700;text-shadow:0 0 24px rgba(255,215,0,.6);letter-spacing:.04em;">🪙 ${_casinoCoins.toLocaleString()}</div> <div style="display:flex;gap:8px;justify-content:center;margin-top:12px;"> <button id="cs-refill" style="font-family:'Orbitron',sans-serif;font-size:.52rem;letter-spacing:.1em;text-transform:uppercase;color:rgba(255,255,255,.4);background:rgba(255,255,255,.05);border:1px solid rgba(255,255,255,.1);padding:7px 18px;border-radius:14px;cursor:pointer;-webkit-tap-highlight-color:transparent;">↑ Refill to 1,000</button> </div>`;
lobbyPanel.appendChild(balCard);

// Section label
const lobbyHdr = document.createElement(‘div’);
lobbyHdr.style.cssText = ‘font-family:“Orbitron”,sans-serif;font-size:.52rem;color:var(–dim);letter-spacing:.22em;text-transform:uppercase;margin-bottom:12px;padding:0 2px;’;
lobbyHdr.textContent = ‘// Games //’;
lobbyPanel.appendChild(lobbyHdr);

GAMES.forEach((g, idx) => {
const card = document.createElement(‘div’);
card.style.cssText = ` padding:0;border-radius:24px; background:${g.grad}; border:1px solid ${g.col}35; box-shadow:0 6px 28px rgba(0,0,0,.55),0 0 0 0 ${g.col}; cursor:pointer;-webkit-tap-highlight-color:transparent; transition:transform .14s,box-shadow .14s; position:relative;overflow:hidden; animation:sp-fade-in .4s ${idx*.1}s both;`;
card.innerHTML = ` <div style="position:absolute;top:0;left:0;right:0;height:2px;background:linear-gradient(90deg,transparent,${g.col}cc,transparent);"></div> <div style="position:absolute;inset:0;background:radial-gradient(ellipse at 20% 30%,rgba(255,255,255,.04),transparent 60%);pointer-events:none;"></div> <div style="display:flex;align-items:center;gap:0;padding:20px 20px;"> <!-- Big icon --> <div style="width:64px;height:64px;border-radius:18px;background:rgba(255,255,255,.06);border:1px solid rgba(255,255,255,.08);display:flex;align-items:center;justify-content:center;font-size:2.2rem;flex-shrink:0;margin-right:16px;"> ${g.ico} </div> <!-- Info --> <div style="flex:1;min-width:0;"> <div style="font-family:'Orbitron',sans-serif;font-size:.95rem;font-weight:900;letter-spacing:.06em;color:#fff;margin-bottom:4px;">${g.name}</div> <div style="font-family:'Share Tech Mono',monospace;font-size:.6rem;color:rgba(255,255,255,.35);letter-spacing:.05em;">${g.desc}</div> <div style="margin-top:7px;display:inline-flex;align-items:center;gap:5px;background:rgba(255,255,255,.06);border:1px solid ${g.col}40;padding:3px 10px;border-radius:8px;"> <span style="font-family:'Share Tech Mono',monospace;font-size:.5rem;color:${g.col};letter-spacing:.08em;text-transform:uppercase;">Max payout</span> <span style="font-family:'Orbitron',sans-serif;font-size:.6rem;font-weight:900;color:${g.col};">${g.jackpot}</span> </div> </div> <!-- Arrow --> <div style="font-size:1.6rem;color:${g.col};opacity:.4;flex-shrink:0;margin-left:8px;">›</div> </div>`;
card.addEventListener(‘touchstart’, () => {
card.style.transform=‘scale(.97)’;
card.style.boxShadow=`0 2px 14px rgba(0,0,0,.4),0 0 22px ${g.col}33`;
}, {passive:true});
card.addEventListener(‘touchend’, () => {
card.style.transform=’’;
card.style.boxShadow=`0 6px 28px rgba(0,0,0,.55)`;
}, {passive:true});
card.addEventListener(‘click’, () => openGame(g.id));
lobbyPanel.appendChild(card);
});

document.getElementById(‘cs-refill’).onclick = () => {
if (_casinoCoins < 1000) { updateWallet(1000 - _casinoCoins, balCard); haptic(‘success’); }
};

/* ── Game panels ── */
const gamePanels = {};
const makePanel = () => {
const p = document.createElement(‘div’);
p.style.cssText = ‘position:absolute;inset:0;overflow-y:auto;-webkit-overflow-scrolling:touch;padding:10px 16px 60px;transform:translateX(100%);transition:transform .32s cubic-bezier(.34,1.56,.64,1);’;
body.appendChild(p);
return p;
};

/* ── Open / close ── */
const openGame = id => {
haptic(‘medium’);
activeGame = id;
const g = GAMES.find(g=>g.id===id);
document.getElementById(‘cs-title’).textContent = g.name;
document.getElementById(‘cs-title’).style.cssText = ‘font-family:“Orbitron”,sans-serif;font-size:1rem;font-weight:900;letter-spacing:.08em;text-transform:uppercase;color:var(–cyan);text-shadow:var(–gc);flex:1;background:none;-webkit-text-fill-color:unset;’;
document.getElementById(‘cs-back’).style.display = ‘’;
lobbyPanel.style.transition = ‘transform .32s cubic-bezier(.34,1.56,.64,1)’;
lobbyPanel.style.transform  = ‘translateX(-100%)’;

```
// Show panel first so layout is calculated, then build
if (!gamePanels[id]) {
  gamePanels[id] = makePanel();
} else if (id === 'slots' && gamePanels[id]._slotCleanup) {
  gamePanels[id]._slotCleanup();
  gamePanels[id].innerHTML = '';
}

gamePanels[id].style.transform = 'translateX(0)';

// Build AFTER panel is visible so wrap.clientWidth/Height are real
requestAnimationFrame(() => {
  if (id === 'slots' && !gamePanels[id]._slotCleanup) buildSlots(gamePanels[id]);
  else if (id === 'slots') buildSlots(gamePanels[id]);
  else if (id === 'hilo' && !gamePanels[id]._hiloBuilt) { buildHiLo(gamePanels[id]); gamePanels[id]._hiloBuilt = true; }
  else if (id === 'blackjack' && !gamePanels[id]._bjBuilt) { buildBlackjack(gamePanels[id]); gamePanels[id]._bjBuilt = true; }
});
```

};

const closeGame = () => {
haptic(‘light’);
if (gamePanels[activeGame]) {
if (activeGame===‘slots’ && gamePanels[activeGame]._slotCleanup) gamePanels[activeGame]._slotCleanup();
gamePanels[activeGame].style.transform = ‘translateX(100%)’;
}
lobbyPanel.style.transform = ‘translateX(0)’;
document.getElementById(‘cs-title’).innerHTML = ‘’;
document.getElementById(‘cs-title’).style.cssText = ‘font-family:“Orbitron”,sans-serif;font-size:1.05rem;font-weight:900;letter-spacing:.1em;text-transform:uppercase;background:linear-gradient(135deg,#ffd700,#ff8c00);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;flex:1;’;
document.getElementById(‘cs-title’).textContent = ‘🎰 Casino’;
document.getElementById(‘cs-back’).style.display = ‘none’;
activeGame = null;
refreshWalletDisplay();
};

document.getElementById(‘cs-back’).addEventListener(‘click’, closeGame);

/* ════ SLOT MACHINE — Crazy Diamonds ════ */
const buildSlots = wrap => {
wrap.style.cssText = ‘display:flex;flex-direction:column;align-items:center;justify-content:flex-start;background:#111;overflow:hidden;position:relative;width:100%;height:100%;min-height:500px;’;

```
const cv = document.createElement('canvas');
const rect0 = wrap.getBoundingClientRect();
const CW = Math.min(rect0.width  > 10 ? rect0.width  : (window.innerWidth  || 360), 390);
const CH = Math.min(rect0.height > 10 ? rect0.height : (window.innerHeight || 660), Math.round(CW * 1.72));
cv.width = CW; cv.height = CH;
cv.style.cssText = 'display:block;width:' + CW + 'px;height:' + CH + 'px;touch-action:none;-webkit-tap-highlight-color:transparent;';
wrap.appendChild(cv);
const ctx = cv.getContext('2d');
// Immediate red test — proves canvas is mounted and drawing works
ctx.fillStyle = '#ff0000'; ctx.fillRect(0, 0, CW, CH);

// Coin DOM overlay
const coinLayer = document.createElement('div');
coinLayer.style.cssText = 'position:absolute;inset:0;pointer-events:none;overflow:hidden;z-index:10;';
wrap.appendChild(coinLayer);

// ── Layout ──
const G   = CW * 0.050;
const CX  = CW * 0.038;
const CY  = CH * 0.010;
const CaW = CW * 0.920;
const CaH = CH * 0.970;
const iX  = CX + G;
const iW  = CaW - G * 2;

const signY  = CY + G;        const signH = CaH * 0.158;
const payY   = signY + signH;  const payH  = CaH * 0.122;
const reelY  = payY  + payH;   const reelH = CaH * 0.268;
const midY   = reelY + reelH;  const midH  = CaH * 0.108;
const lowY   = midY  + midH;   const lowH  = CaH * 0.244;
const trayY  = lowY  + lowH;   const trayH = CaH - (trayY - CY) - G;

const sideW = iW * 0.082;
const rAreaX = iX + sideW;
const rAreaW = iW - sideW * 2;
const rGap   = CW * 0.012;
const rW     = (rAreaW - rGap * 2) / 3;

const levX    = CX + CaW + CW * 0.015;
const levPivY = reelY + reelH * 0.22;
const levLen  = reelH * 1.04;
const ballR   = CW * 0.046;

// ── Rounded rect helper (no ctx.roundRect — Safari compat) ──
const rr = (x, y, w, h, r) => {
  r = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);   ctx.arcTo(x + w, y,     x + w, y + r,     r);
  ctx.lineTo(x + w, y + h - r); ctx.arcTo(x + w, y + h, x + w - r, y + h, r);
  ctx.lineTo(x + r, y + h);   ctx.arcTo(x,     y + h, x,     y + h - r, r);
  ctx.lineTo(x, y + r);       ctx.arcTo(x,     y,     x + r, y,         r);
  ctx.closePath();
};

// ── Gold gradient ──
const gold = (x1, y1, x2, y2) => {
  const g = ctx.createLinearGradient(x1, y1, x2, y2);
  g.addColorStop(0,   '#7a5000');
  g.addColorStop(0.2, '#f0c000');
  g.addColorStop(0.5, '#ffe566');
  g.addColorStop(0.8, '#f0c000');
  g.addColorStop(1,   '#7a5000');
  return g;
};

// ── Symbol strip ──
const STRIP = [
  'CHERRY','BLANK','BAR',     'BLANK',
  'BELL',  'BLANK','TWO_BAR', 'BLANK',
  'CHERRY','BLANK','BAR',     'BLANK',
  'BELL',  'BLANK','THREE_BAR','BLANK',
  'DIAMOND','BLANK','CHERRY', 'BLANK',
  'SEVEN', 'BLANK','TWO_BAR', 'BLANK'
];
const SL = STRIP.length; // 24

// ── Payouts — only 3-of-a-kind or 2 cherries (reel 0+1) ──
const PAYS = {
  'SEVEN|SEVEN|SEVEN':            100,
  'DIAMOND|DIAMOND|DIAMOND':       50,
  'THREE_BAR|THREE_BAR|THREE_BAR': 30,
  'TWO_BAR|TWO_BAR|TWO_BAR':       20,
  'BAR|BAR|BAR':                   15,
  'BELL|BELL|BELL':                12,
  'CHERRY|CHERRY|CHERRY':          10,
};

// ── Draw one symbol centred at (0,0), size=symH ──
const drawSym = (sym, sz, alpha) => {
  if (alpha <= 0.02) return;
  ctx.save();
  ctx.globalAlpha = Math.min(1, alpha);
  const h = sz * 0.76;

  if (sym === 'CHERRY') {
    const r = h * 0.20;
    ctx.strokeStyle = '#1a5200'; ctx.lineWidth = h * 0.06; ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(-r, -h * 0.10);
    ctx.quadraticCurveTo(0, -h * 0.40, r, -h * 0.10);
    ctx.stroke();
    ctx.beginPath(); ctx.moveTo(-r, -h * 0.10); ctx.lineTo(-r, h * 0.10 - r); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(r,  -h * 0.10); ctx.lineTo(r,  h * 0.06 - r); ctx.stroke();
    const g1 = ctx.createRadialGradient(-r * 1.2, -h*0.02, 0, -r, h*0.10, r);
    g1.addColorStop(0, '#ff9999'); g1.addColorStop(0.5, '#dd0000'); g1.addColorStop(1, '#880000');
    ctx.beginPath(); ctx.arc(-r, h * 0.10, r, 0, Math.PI * 2);
    ctx.fillStyle = g1; ctx.fill(); ctx.strokeStyle = '#660000'; ctx.lineWidth = 0.8; ctx.stroke();
    const g2 = ctx.createRadialGradient(r * 0.75, -h*0.04, 0, r, h*0.06, r);
    g2.addColorStop(0, '#ff9999'); g2.addColorStop(0.5, '#ee0000'); g2.addColorStop(1, '#880000');
    ctx.beginPath(); ctx.arc(r, h * 0.06, r, 0, Math.PI * 2);
    ctx.fillStyle = g2; ctx.fill(); ctx.strokeStyle = '#660000'; ctx.lineWidth = 0.8; ctx.stroke();
    ctx.beginPath(); ctx.arc(-r - r*0.18, h*0.02, r*0.26, 0, Math.PI*2);
    ctx.fillStyle = 'rgba(255,255,255,0.44)'; ctx.fill();

  } else if (sym === 'BAR') {
    const bw = h*0.82, bh = h*0.27;
    const g = ctx.createLinearGradient(-bw/2, -bh/2, -bw/2, bh/2);
    g.addColorStop(0,'#999'); g.addColorStop(0.3,'#fff'); g.addColorStop(0.65,'#ccc'); g.addColorStop(1,'#555');
    rr(-bw/2, -bh/2, bw, bh, bh*0.28); ctx.fillStyle = g; ctx.fill();
    ctx.strokeStyle = '#333'; ctx.lineWidth = 1.2; ctx.stroke();
    ctx.fillStyle = '#1a1a1a'; ctx.font = '900 ' + (bh*0.70) + 'px Arial,sans-serif';
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText('BAR', 0, 1);

  } else if (sym === 'TWO_BAR') {
    const bw = h*0.80, bh = h*0.17, gap = h*0.115;
    [-1, 1].forEach(d => {
      const g = ctx.createLinearGradient(-bw/2, d*gap-bh/2, -bw/2, d*gap+bh/2);
      g.addColorStop(0,'#999'); g.addColorStop(0.3,'#fff'); g.addColorStop(0.7,'#bbb'); g.addColorStop(1,'#555');
      rr(-bw/2, d*gap-bh/2, bw, bh, bh*0.28); ctx.fillStyle = g; ctx.fill();
      ctx.strokeStyle = '#333'; ctx.lineWidth = 0.8; ctx.stroke();
      ctx.fillStyle = '#111'; ctx.font = '900 ' + (bh*0.70) + 'px Arial,sans-serif';
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText('BAR', 0, d*gap + 0.5);
    });

  } else if (sym === 'THREE_BAR') {
    const bw = h*0.78, bh = h*0.13, gap = h*0.10;
    [-1, 0, 1].forEach(d => {
      const g = ctx.createLinearGradient(-bw/2, d*gap-bh/2, -bw/2, d*gap+bh/2);
      g.addColorStop(0,'#888'); g.addColorStop(0.3,'#eee'); g.addColorStop(0.7,'#bbb'); g.addColorStop(1,'#444');
      rr(-bw/2, d*gap-bh/2, bw, bh, bh*0.28); ctx.fillStyle = g; ctx.fill();
      ctx.strokeStyle = '#333'; ctx.lineWidth = 0.6; ctx.stroke();
      ctx.fillStyle = '#111'; ctx.font = '700 ' + (bh*0.70) + 'px Arial,sans-serif';
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText('BAR', 0, d*gap + 0.5);
    });

  } else if (sym === 'BELL') {
    const br = h * 0.34;
    ctx.beginPath();
    ctx.moveTo(-br*0.66, br*0.30);
    ctx.bezierCurveTo(-br*0.66, -br*0.36, -br*0.18, -br*0.90, 0, -br*0.90);
    ctx.bezierCurveTo(br*0.18,  -br*0.90,  br*0.66,  -br*0.36, br*0.66, br*0.30);
    ctx.closePath();
    const bg = ctx.createLinearGradient(-br, -br, br, br*0.5);
    bg.addColorStop(0,'#ffe066'); bg.addColorStop(0.4,'#ffd700'); bg.addColorStop(1,'#a06800');
    ctx.fillStyle = bg; ctx.fill(); ctx.strokeStyle = '#806000'; ctx.lineWidth = 1.2; ctx.stroke();
    rr(-br*0.72, br*0.22, br*1.44, br*0.20, br*0.08);
    ctx.fillStyle = '#b08000'; ctx.fill(); ctx.strokeStyle = '#806000'; ctx.lineWidth = 1; ctx.stroke();
    ctx.beginPath(); ctx.arc(0, br*0.44, br*0.13, 0, Math.PI*2);
    ctx.fillStyle = '#a06800'; ctx.fill();
    ctx.beginPath(); ctx.ellipse(-br*0.16, -br*0.26, br*0.19, br*0.11, -0.5, 0, Math.PI*2);
    ctx.fillStyle = 'rgba(255,255,255,0.38)'; ctx.fill();

  } else if (sym === 'DIAMOND') {
    const dr = h * 0.35;
    const pts = [[0,-dr],[dr*0.62,-dr*0.08],[dr*0.52,dr*0.50],[0,dr],[-dr*0.52,dr*0.50],[-dr*0.62,-dr*0.08]];
    ctx.beginPath();
    pts.forEach(([x, y], i) => i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y));
    ctx.closePath();
    const dg = ctx.createLinearGradient(-dr, -dr, dr, dr);
    dg.addColorStop(0,'#e8f8ff'); dg.addColorStop(0.25,'#bbddff'); dg.addColorStop(0.55,'#4499ee'); dg.addColorStop(1,'#0044bb');
    ctx.fillStyle = dg; ctx.fill(); ctx.strokeStyle = '#0033aa'; ctx.lineWidth = 1.2; ctx.stroke();
    ctx.strokeStyle = 'rgba(255,255,255,0.48)'; ctx.lineWidth = 0.8;
    [[pts[0],pts[2]],[pts[0],pts[3]],[pts[0],pts[4]],[pts[5],pts[2]]].forEach(([a,b]) => {
      ctx.beginPath(); ctx.moveTo(a[0],a[1]); ctx.lineTo(b[0],b[1]); ctx.stroke();
    });
    ctx.beginPath(); ctx.ellipse(-dr*0.10, -dr*0.30, dr*0.20, dr*0.11, -0.4, 0, Math.PI*2);
    ctx.fillStyle = 'rgba(255,255,255,0.60)'; ctx.fill();

  } else if (sym === 'SEVEN') {
    ctx.font = '900 ' + (h*0.76) + 'px Arial,sans-serif';
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.strokeStyle = '#440000'; ctx.lineWidth = h*0.10; ctx.strokeText('7', 0, h*0.04);
    const tg = ctx.createLinearGradient(0, -h*0.36, 0, h*0.36);
    tg.addColorStop(0,'#ffaaaa'); tg.addColorStop(0.4,'#ff2200'); tg.addColorStop(1,'#880000');
    ctx.fillStyle = tg; ctx.fillText('7', 0, h*0.04);
  }
  // BLANK: draw nothing
  ctx.restore();
};

// ── Reel state ──
const reels = [0,1,2].map(() => ({
  offset: Math.floor(Math.random() * SL) * 1.0,
  speed: 0, targetOffset: -1, stopped: true
}));

// ── Game state ──
const BET = 50;
let credits      = _casinoCoins;
let coinInserted = false;
let spinning     = false;
let leverY       = 0;
let leverDragging = false;
let leverDragStartScreenY = 0;
let leverDragStartVal = 0;
let leverVel     = 0;
let resultMsg    = '';
let resultCol    = '#ffd700';
let winAmount    = 0;
let flashT       = 0;
let rafId        = null;

// ── Draw reel drum ──
const drawReel = (idx, rx, ry, rw, rh) => {
  const R = reels[idx];
  const symH = rh / 3;

  // Ivory drum background
  rr(rx, ry, rw, rh, 4);
  const ibg = ctx.createLinearGradient(rx, ry, rx+rw, ry);
  ibg.addColorStop(0,'#ddd8c0'); ibg.addColorStop(0.5,'#f5f0e2'); ibg.addColorStop(1,'#d8d2ba');
  ctx.fillStyle = ibg; ctx.fill();

  // Clip to drum window
  ctx.save();
  rr(rx, ry, rw, rh, 4); ctx.clip();

  const base = Math.floor(R.offset);
  const frac = R.offset - base;

  for (let row = -1; row <= 3; row++) {
    const si  = ((base + row) % SL + SL) % SL;
    const sym = STRIP[si];
    const rawCY = ry + (row - frac) * symH + symH * 0.5;
    if (rawCY < ry - symH || rawCY > ry + rh + symH) continue;
    const norm  = (rawCY - (ry + rh * 0.5)) / (rh * 0.5);
    const scale = Math.max(0.22, Math.cos(norm * Math.PI * 0.43));
    const alpha = Math.max(0, 1 - Math.abs(norm) * 1.20);

    ctx.save();
    ctx.translate(rx + rw * 0.5, rawCY);
    ctx.scale(1, scale);
    drawSym(sym, symH, alpha);
    ctx.restore();

    // Row separator line
    const lineY = ry + (row - frac + 1) * symH;
    if (lineY > ry + 1 && lineY < ry + rh - 1) {
      ctx.strokeStyle = 'rgba(170,155,120,0.25)'; ctx.lineWidth = 0.7;
      ctx.beginPath(); ctx.moveTo(rx+3, lineY); ctx.lineTo(rx+rw-3, lineY); ctx.stroke();
    }
  }
  ctx.restore();

  // Top shadow
  const ts = ctx.createLinearGradient(rx, ry, rx, ry + rh*0.22);
  ts.addColorStop(0,'rgba(0,0,0,0.52)'); ts.addColorStop(1,'rgba(0,0,0,0)');
  rr(rx, ry, rw, rh*0.22, 4); ctx.fillStyle = ts; ctx.fill();
  // Bottom shadow
  const bs = ctx.createLinearGradient(rx, ry+rh*0.78, rx, ry+rh);
  bs.addColorStop(0,'rgba(0,0,0,0)'); bs.addColorStop(1,'rgba(0,0,0,0.52)');
  rr(rx, ry+rh*0.78, rw, rh*0.22, 4); ctx.fillStyle = bs; ctx.fill();

  // Gold reel frame
  rr(rx-2.5, ry-2.5, rw+5, rh+5, 6);
  ctx.strokeStyle = gold(rx-2.5,ry-2.5,rx+rw+2.5,ry+rh+2.5);
  ctx.lineWidth = 3.5; ctx.stroke();
};

// ── Main draw ──
const draw = () => {
  ctx.clearRect(0, 0, CW, CH);
  const t = flashT;

  // Cabinet body
  rr(CX, CY, CaW, CaH, CW*0.028);
  ctx.fillStyle = '#100a00'; ctx.fill();
  rr(CX, CY, CaW, CaH, CW*0.028);
  ctx.strokeStyle = gold(CX,CY,CX+CaW,CY+CaH); ctx.lineWidth = G*2; ctx.stroke();
  // Inner accent
  rr(CX+G*0.55, CY+G*0.55, CaW-G*1.1, CaH-G*1.1, CW*0.022);
  ctx.strokeStyle = 'rgba(255,210,60,0.30)'; ctx.lineWidth = 1; ctx.stroke();

  // ── TOP SIGN ──
  const sx = iX+1, sy = signY, sw = iW-2, sh = signH-3;
  rr(sx, sy, sw, sh, CW*0.016);
  const sgbg = ctx.createLinearGradient(sx,sy,sx,sy+sh);
  sgbg.addColorStop(0,'#06061a'); sgbg.addColorStop(0.5,'#0c0c28'); sgbg.addColorStop(1,'#06061a');
  ctx.fillStyle = sgbg; ctx.fill();
  rr(sx, sy, sw, sh, CW*0.016);
  ctx.strokeStyle = gold(sx,sy,sx+sw,sy+sh); ctx.lineWidth = 2.2; ctx.stroke();

  // Dot border row top+bottom of sign
  [sy+sh*0.10, sy+sh*0.90].forEach(dotY => {
    for (let i = 0; i < 22; i++) {
      const bx = sx + sw*0.06 + i*(sw*0.88/21);
      const on = (Math.floor(t*5+i*1.3)%3 !== 2) || winAmount > 0;
      ctx.beginPath(); ctx.arc(bx, dotY, 2.2, 0, Math.PI*2);
      ctx.fillStyle = on ? '#ffd700' : '#443300'; ctx.fill();
      if (on) { ctx.shadowColor='#ffd700'; ctx.shadowBlur=5; ctx.fill(); ctx.shadowBlur=0; }
    }
  });

  // Art-Deco fans
  [[sx+sw*0.08,sy+sh*0.54,1],[sx+sw*0.92,sy+sh*0.54,-1]].forEach(([fx,fy,d]) => {
    ctx.save(); ctx.translate(fx,fy); ctx.scale(d,1);
    const fr = sh*0.36;
    for (let a = -Math.PI*0.40; a <= Math.PI*0.40; a += Math.PI/6) {
      ctx.beginPath(); ctx.moveTo(0,0); ctx.lineTo(Math.cos(a)*fr, Math.sin(a)*fr);
      ctx.strokeStyle='#d4a800'; ctx.lineWidth=1.2; ctx.stroke();
    }
    ctx.restore();
  });

  // BAR side text
  [[sx+sw*0.02,'left'],[sx+sw*0.98,'right']].forEach(([bx,al]) => {
    ctx.textAlign = al; ctx.font = '700 '+(sh*0.088)+'px Arial,sans-serif'; ctx.fillStyle='#cc9900';
    ['BAR','BAR','BAR'].forEach((t2,i) => ctx.fillText(t2, bx, sy+sh*0.35+i*sh*0.20));
  });

  // Diamond above CRAZY
  ctx.save(); ctx.translate(sx+sw*0.5, sy+sh*0.24); drawSym('DIAMOND', sh*0.36, 1); ctx.restore();

  // CRAZY
  ctx.textAlign='center'; ctx.textBaseline='middle';
  ctx.font = '900 '+(sh*0.21)+'px Arial,sans-serif';
  ctx.strokeStyle='#000'; ctx.lineWidth=sh*0.04; ctx.strokeText('CRAZY', sx+sw*0.5, sy+sh*0.52);
  const g1 = ctx.createLinearGradient(sx,sy+sh*0.43,sx,sy+sh*0.61);
  g1.addColorStop(0,'#fff0a0'); g1.addColorStop(1,'#c89000'); ctx.fillStyle=g1;
  ctx.fillText('CRAZY', sx+sw*0.5, sy+sh*0.52);

  // DIAMONDS
  ctx.font = '900 '+(sh*0.28)+'px Arial,sans-serif';
  ctx.strokeStyle='#000'; ctx.lineWidth=sh*0.05; ctx.strokeText('DIAMONDS', sx+sw*0.5, sy+sh*0.79);
  const g2 = ctx.createLinearGradient(sx,sy+sh*0.66,sx,sy+sh*0.90);
  g2.addColorStop(0,'#fff0a0'); g2.addColorStop(1,'#c89000'); ctx.fillStyle=g2;
  ctx.fillText('DIAMONDS', sx+sw*0.5, sy+sh*0.79);

  // ── PAY TABLE PANEL ──
  const px = iX+1, py = payY, pw = iW-2, ph = payH-2;
  rr(px, py, pw, ph, 3);
  ctx.fillStyle = '#f0ead8'; ctx.fill();
  rr(px, py, pw, ph, 3); ctx.strokeStyle=gold(px,py,px+pw,py+ph); ctx.lineWidth=2; ctx.stroke();

  ctx.textAlign='center'; ctx.textBaseline='middle';
  ctx.font = '900 '+(ph*0.23)+'px Arial,sans-serif';
  ctx.fillStyle='#000080'; ctx.fillText('WINS', px+pw*0.5, py+ph*0.17);

  const entries=[['Diam x3','x50'],['3xBAR','x30'],['2xBAR','x20'],['BAR x3','x15'],['Bell x3','x12'],['Cherry x3','x10']];
  const mw=pw*0.27, mh=ph*0.31;
  entries.forEach(([k,v],i) => {
    const ex=px+pw*0.04+(i%3)*(mw+pw*0.025), ey=py+ph*0.33+Math.floor(i/3)*(mh+ph*0.04);
    rr(ex,ey,mw,mh,2);
    const ebg=ctx.createLinearGradient(ex,ey,ex,ey+mh);
    ebg.addColorStop(0,'#fff8e8'); ebg.addColorStop(1,'#e8dfc0');
    ctx.fillStyle=ebg; ctx.fill(); ctx.strokeStyle='#aaa'; ctx.lineWidth=0.7; ctx.stroke();
    ctx.textAlign='left'; ctx.font='600 '+(mh*0.34)+'px Arial,sans-serif'; ctx.fillStyle='#222';
    ctx.fillText(k, ex+2, ey+mh*0.40);
    ctx.textAlign='right'; ctx.font='900 '+(mh*0.37)+'px Arial,sans-serif'; ctx.fillStyle='#880000';
    ctx.fillText(v, ex+mw-2, ey+mh*0.62);
  });

  // ── SIDE PAYLINE STRIPS ──
  [[iX, iX+sideW-1],[iX+iW-sideW+1, iX+iW-1]].forEach(([lx, rx2]) => {
    const sw2=rx2-lx;
    rr(lx, reelY, sw2, reelH, 3);
    const sbg=ctx.createLinearGradient(lx,reelY,lx,reelY+reelH);
    sbg.addColorStop(0,'#1a0d00'); sbg.addColorStop(1,'#0d0800');
    ctx.fillStyle=sbg; ctx.fill();
    rr(lx, reelY, sw2, reelH, 3); ctx.strokeStyle=gold(lx,reelY,rx2,reelY+reelH); ctx.lineWidth=2; ctx.stroke();
    ctx.save(); ctx.translate(lx+sw2*0.5, reelY+reelH*0.5); ctx.rotate(-Math.PI/2);
    ctx.textAlign='center'; ctx.textBaseline='middle';
    ctx.font='900 '+(sw2*0.35)+'px Arial,sans-serif';
    ctx.fillStyle='#ffd700'; ctx.strokeStyle='#000'; ctx.lineWidth=1;
    ctx.strokeText('PAYLINE',0,0); ctx.fillText('PAYLINE',0,0);
    ctx.restore();
  });

  // ── REEL WINDOW ──
  const rfx=rAreaX-5, rfy=reelY-5, rfw=rAreaW+10, rfh=reelH+10;
  rr(rfx, rfy, rfw, rfh, 7); ctx.fillStyle='#1a1a1a'; ctx.fill();
  rr(rfx, rfy, rfw, rfh, 7); ctx.strokeStyle=gold(rfx,rfy,rfx+rfw,rfy+rfh); ctx.lineWidth=5; ctx.stroke();

  // ── REELS ──
  for (let i = 0; i < 3; i++) {
    drawReel(i, rAreaX+i*(rW+rGap), reelY, rW, reelH);
  }

  // Payline
  const plY = reelY + reelH * 0.5;
  const plash = winAmount > 0 && Math.sin(t*7) > 0;
  ctx.strokeStyle = plash ? '#ff3300' : 'rgba(255,50,0,0.55)';
  ctx.lineWidth=2; ctx.setLineDash([5,5]);
  ctx.beginPath(); ctx.moveTo(iX+1,plY); ctx.lineTo(iX+iW-1,plY); ctx.stroke();
  ctx.setLineDash([]);

  // ── MID PANEL ──
  const mpx=iX+1, mpy=midY, mpw=iW-2, mph=midH-2;
  rr(mpx, mpy, mpw, mph, 4);
  const mpbg=ctx.createLinearGradient(mpx,mpy,mpx,mpy+mph);
  mpbg.addColorStop(0,'#0d0800'); mpbg.addColorStop(1,'#060400');
  ctx.fillStyle=mpbg; ctx.fill();
  rr(mpx, mpy, mpw, mph, 4); ctx.strokeStyle=gold(mpx,mpy,mpx+mpw,mpy+mph); ctx.lineWidth=1.8; ctx.stroke();

  // Credits LED
  ctx.font = (mph*0.20)+'px monospace';
  ctx.textAlign='left'; ctx.textBaseline='middle'; ctx.fillStyle='rgba(255,100,0,0.28)';
  ctx.fillText('CREDITS', mpx+8, mpy+mph*0.28);
  ctx.font = '900 '+(mph*0.44)+'px monospace';
  ctx.fillStyle='#ff6600'; ctx.shadowColor='#ff4400'; ctx.shadowBlur=7;
  ctx.fillText(Math.round(credits).toLocaleString(), mpx+8, mpy+mph*0.76);
  ctx.shadowBlur=0;

  // INSERT COIN button (right half of mid panel)
  const cbx=mpx+mpw*0.54, cby=mpy+mph*0.10, cbw=mpw*0.43, cbh=mph*0.80;
  rr(cbx, cby, cbw, cbh, cbh*0.38);
  const cbg2=ctx.createLinearGradient(cbx,cby,cbx,cby+cbh);
  if (coinInserted) { cbg2.addColorStop(0,'#553300'); cbg2.addColorStop(1,'#332200'); }
  else              { cbg2.addColorStop(0,'#d48000'); cbg2.addColorStop(0.5,'#ffaa00'); cbg2.addColorStop(1,'#996000'); }
  ctx.fillStyle=cbg2; ctx.fill(); ctx.strokeStyle='#442200'; ctx.lineWidth=1.5; ctx.stroke();
  ctx.beginPath(); ctx.ellipse(cbx+cbw*0.5, cby+cbh*0.27, cbw*0.32, cbh*0.13, 0, 0, Math.PI*2);
  ctx.fillStyle='rgba(255,255,255,0.18)'; ctx.fill();
  ctx.textAlign='center'; ctx.textBaseline='middle';
  ctx.font='900 '+(cbh*0.21)+'px Arial,sans-serif';
  ctx.fillStyle=coinInserted?'#886600':'#111';
  ctx.fillText('INSERT', cbx+cbw*0.5, cby+cbh*0.35);
  ctx.fillText('COIN', cbx+cbw*0.5, cby+cbh*0.60);
  ctx.font='700 '+(cbh*0.18)+'px Arial,sans-serif';
  ctx.fillText('('+BET+')', cbx+cbw*0.5, cby+cbh*0.83);

  // Result msg
  if (resultMsg) {
    const vis = winAmount>0 ? (Math.sin(t*5.5)>0.05) : true;
    if (vis) {
      ctx.font='900 '+(mph*0.27)+'px Arial,sans-serif';
      ctx.textAlign='center'; ctx.textBaseline='middle';
      ctx.strokeStyle='#000'; ctx.lineWidth=2.5;
      ctx.strokeText(resultMsg, mpx+mpw*0.27, mpy+mph*0.52);
      ctx.fillStyle=resultCol; ctx.fillText(resultMsg, mpx+mpw*0.27, mpy+mph*0.52);
    }
  }

  // ── LOWER BODY ──
  const lx=iX+1, ly=lowY, lw=iW-2, lh=lowH-2;
  rr(lx, ly, lw, lh, 4);
  const lbg=ctx.createLinearGradient(lx,ly,lx,ly+lh);
  lbg.addColorStop(0,'#0d0800'); lbg.addColorStop(1,'#080500');
  ctx.fillStyle=lbg; ctx.fill();
  rr(lx, ly, lw, lh, 4); ctx.strokeStyle=gold(lx,ly,lx+lw,ly+lh); ctx.lineWidth=1.8; ctx.stroke();

  // Diamond + branding
  ctx.save(); ctx.translate(lx+lw*0.5, ly+lh*0.34); drawSym('DIAMOND', lh*0.42, 0.70); ctx.restore();
  ctx.textAlign='center'; ctx.textBaseline='middle';
  ctx.font='900 '+(lh*0.14)+'px Arial,sans-serif';
  ctx.strokeStyle='#000'; ctx.lineWidth=2.5; ctx.strokeText('CRAZY DIAMONDS', lx+lw*0.5, ly+lh*0.72);
  const ld=ctx.createLinearGradient(lx,ly+lh*0.65,lx,ly+lh*0.80);
  ld.addColorStop(0,'#fff0a0'); ld.addColorStop(1,'#c89000'); ctx.fillStyle=ld;
  ctx.fillText('CRAZY DIAMONDS', lx+lw*0.5, ly+lh*0.72);
  // Grooves
  for (let i=1; i<=5; i++) {
    ctx.strokeStyle='rgba(255,200,50,0.15)'; ctx.lineWidth=1;
    ctx.beginPath(); ctx.moveTo(lx+6,ly+lh*0.83+i*lh*0.026); ctx.lineTo(lx+lw-6,ly+lh*0.83+i*lh*0.026); ctx.stroke();
  }

  // ── COIN TRAY ──
  const tx=lx+lw*0.15, ty=trayY+2, tw=lw*0.70, th=trayH-3;
  rr(tx, ty, tw, th, th*0.42);
  const tg2=ctx.createLinearGradient(tx,ty,tx,ty+th);
  tg2.addColorStop(0,'#444'); tg2.addColorStop(0.5,'#777'); tg2.addColorStop(1,'#333');
  ctx.fillStyle=tg2; ctx.fill(); ctx.strokeStyle=gold(tx,ty,tx+tw,ty+th); ctx.lineWidth=2; ctx.stroke();

  // ── LEVER ──
  const lpMax = levLen * 0.84;
  const curBY = levPivY + leverY * lpMax;
  // Track
  ctx.strokeStyle='#555'; ctx.lineWidth=2.5;
  ctx.beginPath(); ctx.moveTo(levX,levPivY-8); ctx.lineTo(levX,levPivY+lpMax+8); ctx.stroke();
  // Horizontal arm
  const armBaseX=CX+CaW-G*0.4, armY=levPivY+ballR*0.22;
  rr(armBaseX, armY-5, levX-armBaseX+5, 10, 5);
  const armG=ctx.createLinearGradient(armBaseX,armY-5,levX,armY-5);
  armG.addColorStop(0,'#555'); armG.addColorStop(0.4,'#eee'); armG.addColorStop(0.8,'#bbb'); armG.addColorStop(1,'#666');
  ctx.fillStyle=armG; ctx.fill(); ctx.strokeStyle='#444'; ctx.lineWidth=1; ctx.stroke();
  // Pivot
  ctx.beginPath(); ctx.arc(levX, armY, 10, 0, Math.PI*2);
  const pKg=ctx.createRadialGradient(levX-3,armY-3,0,levX,armY,10);
  pKg.addColorStop(0,'#eee'); pKg.addColorStop(1,'#777');
  ctx.fillStyle=pKg; ctx.fill(); ctx.strokeStyle='#444'; ctx.lineWidth=1.5; ctx.stroke();
  // Rod
  rr(levX-4.5, levPivY, 9, lpMax+ballR*0.5, 4.5);
  const rodG=ctx.createLinearGradient(levX-5,0,levX+5,0);
  rodG.addColorStop(0,'#555'); rodG.addColorStop(0.35,'#eee'); rodG.addColorStop(0.65,'#ccc'); rodG.addColorStop(1,'#555');
  ctx.fillStyle=rodG; ctx.fill();
  rr(levX-1.5, levPivY, 3, lpMax+ballR*0.5, 2);
  ctx.fillStyle='rgba(255,255,255,0.36)'; ctx.fill();
  // Ball
  const ballG=ctx.createRadialGradient(levX-ballR*0.28,curBY-ballR*0.32,0,levX,curBY,ballR);
  ballG.addColorStop(0,'#ff9999'); ballG.addColorStop(0.48,'#cc0000'); ballG.addColorStop(1,'#4d0000');
  ctx.beginPath(); ctx.arc(levX, curBY, ballR, 0, Math.PI*2);
  ctx.fillStyle=ballG; ctx.fill(); ctx.strokeStyle='#2a0000'; ctx.lineWidth=2; ctx.stroke();
  ctx.beginPath(); ctx.ellipse(levX-ballR*0.26, curBY-ballR*0.30, ballR*0.27, ballR*0.17, -0.6, 0, Math.PI*2);
  ctx.fillStyle='rgba(255,255,255,0.42)'; ctx.fill();
};

// ── Eval result ──
const symAt = i => STRIP[(Math.round(reels[i].offset) % SL + SL) % SL];

const evalResult = () => {
  const s = [symAt(0), symAt(1), symAt(2)];
  const key = s.join('|');
  let mult = 0;
  if (PAYS[key]) { mult = PAYS[key]; }
  else if (s[0]==='CHERRY' && s[1]==='CHERRY') { mult = 4; } // exactly 2 cherries pays

  if (mult > 0) {
    const prize = BET * mult;
    winAmount = prize;
    credits  += prize;
    _addCoins(prize);
    updateWallet(0, null);
    resultMsg = '+' + prize;
    resultCol = mult>=50?'#ff44ff':mult>=20?'#00ffcc':'#ffd700';
    haptic('success');
    spawnCoins(prize);
  } else {
    winAmount = 0;
    resultMsg = 'No Win';
    resultCol = 'rgba(255,180,80,0.50)';
    haptic('light');
  }
};

// ── Coin shower ──
const spawnCoins = prize => {
  const count = Math.min(55, Math.max(6, Math.floor(prize / BET * 6)));
  const rect  = cv.getBoundingClientRect();
  const wRect = wrap.getBoundingClientRect();
  const scX   = rect.width  / CW;
  const scY   = rect.height / CH;
  const trayCX = (iX + iW*0.50) * scX + (rect.left - wRect.left);
  const trayCY =  trayY          * scY + (rect.top  - wRect.top);

  coinLayer.style.pointerEvents = 'all';
  for (let i = 0; i < count; i++) {
    setTimeout(() => {
      const coin = document.createElement('div');
      const sz   = 14 + Math.random() * 10;
      const sx2  = trayCX + (Math.random()-0.5)*60;
      coin.style.cssText = 'position:absolute;left:'+sx2+'px;top:'+trayCY+'px;width:'+sz+'px;height:'+sz+'px;border-radius:50%;background:radial-gradient(circle at 38% 36%,#ffe066,#cc8800,#7a4a00);border:1.5px solid #aa7700;box-shadow:0 0 5px rgba(255,200,0,0.6);pointer-events:all;cursor:pointer;z-index:20;';
      coinLayer.appendChild(coin);
      let vx=( Math.random()-0.5)*11, vy=-(9+Math.random()*13);
      let cx2=sx2, cy2=trayCY, life=0, collected=false;
      coin.addEventListener('pointerdown', e => {
        e.stopPropagation();
        if (collected) return; collected=true;
        credits += Math.ceil(BET*0.1); _addCoins(Math.ceil(BET*0.1)); updateWallet(0,null); haptic('light');
        coin.style.opacity='0'; coin.style.transform='scale(1.6)'; coin.style.transition='all .25s';
        setTimeout(()=>coin.remove(),270);
      });
      const anim = () => {
        if (collected || !coinLayer.contains(coin)) return;
        life++; vy+=0.55; cy2+=vy; cx2+=vx; vx*=0.97;
        coin.style.left=cx2+'px'; coin.style.top=cy2+'px';
        if (life>110) coin.style.opacity=Math.max(0,1-(life-110)/50)+'';
        if (life>160) { coin.remove(); return; }
        requestAnimationFrame(anim);
      };
      requestAnimationFrame(anim);
    }, i*52+Math.random()*68);
  }
  setTimeout(()=>{ if(!coinLayer.children.length) coinLayer.style.pointerEvents='none'; }, count*120+2200);
};

// ── Animation loop ──
const SPSPD = 24;
const animLoop = ts => {
  flashT = ts * 0.001;
  if (spinning) {
    let allDone = true;
    reels.forEach(r => {
      if (r.stopped) return; allDone = false;
      if (r.targetOffset < 0) {
        r.speed = Math.min(SPSPD, r.speed+2.2);
        r.offset = (r.offset + r.speed/60) % SL;
      } else {
        const dist = ((r.targetOffset - r.offset) % SL + SL) % SL;
        if (dist < 0.06) { r.offset=r.targetOffset%SL; r.stopped=true; r.speed=0; haptic('light'); }
        else { r.offset = (r.offset + Math.max(0.28, Math.min(r.speed, dist*5+0.4))/60) % SL; }
      }
    });
    if (allDone) { spinning=false; evalResult(); }
  }
  if (!leverDragging && leverY > 0) {
    leverVel += (-leverY*0.32 - leverVel*0.22);
    leverY = Math.max(0, leverY + leverVel*0.09);
    if (leverY<0.008 && Math.abs(leverVel)<0.01) { leverY=0; leverVel=0; }
  }
  try { draw(); } catch(e) { console.error('SLOT DRAW ERROR:', e.message, e.stack); }
  rafId = requestAnimationFrame(animLoop);
};
// Triple rAF: guarantees layout done, panel painted, then loop starts
requestAnimationFrame(() => requestAnimationFrame(() => requestAnimationFrame(() => {
  rafId = requestAnimationFrame(animLoop);
})));

// -- Input helpers --
const getPos = e => {
  const rect = cv.getBoundingClientRect();
  const src  = e.touches ? e.touches[0] : (e.changedTouches ? e.changedTouches[0] : e);
  return { x:(src.clientX-rect.left)*(CW/rect.width), y:(src.clientY-rect.top)*(CH/rect.height), sY:src.clientY };
};

const lpMax2 = levLen*0.84;
const onBall = p => Math.hypot(p.x-levX, p.y-(levPivY+leverY*lpMax2)) < ballR+20;
const onCoin = p => {
  const mpx=iX+1,mpy=midY,mpw=iW-2,mph=midH-2;
  const cbx=mpx+mpw*0.54,cby=mpy+mph*0.10,cbw=mpw*0.43,cbh=mph*0.80;
  return p.x>=cbx&&p.x<=cbx+cbw&&p.y>=cby&&p.y<=cby+cbh;
};

const insertCoin = () => {
  if (spinning) return;
  if (coinInserted) { resultMsg='Coin ready!'; resultCol='#ffd700'; return; }
  if (credits < BET) { resultMsg='Need '+BET+'!'; resultCol='#ff6b6b'; return; }
  coinInserted=true; winAmount=0; resultMsg='Pull lever!'; resultCol='#ffd700'; haptic('light');
};

const triggerSpin = () => {
  if (spinning || !coinInserted) { if(!coinInserted){resultMsg='Insert coin!';resultCol='#ff9900';} return; }
  credits-=BET; _addCoins(-BET); updateWallet(0,null);
  coinInserted=false; spinning=true; resultMsg=''; winAmount=0;
  // House-edge: 70% chance reel1 != reel0, 70% chance reel2 != reel1
  const s0=Math.floor(Math.random()*SL);
  let s1=Math.floor(Math.random()*SL);
  if(Math.random()<0.70&&STRIP[s1]===STRIP[s0]){let t2=0;while(STRIP[s1]===STRIP[s0]&&t2++<30)s1=Math.floor(Math.random()*SL);}
  let s2=Math.floor(Math.random()*SL);
  if(Math.random()<0.70&&STRIP[s2]===STRIP[s1]){let t2=0;while(STRIP[s2]===STRIP[s1]&&t2++<30)s2=Math.floor(Math.random()*SL);}
  reels.forEach((r,i)=>{r.stopped=false;r.speed=0;r.targetOffset=-1;setTimeout(()=>{r.targetOffset=[s0,s1,s2][i];},1300+i*950);});
  haptic('medium');
};

const startDrag = (p) => { leverDragging=true; leverDragStartScreenY=p.sY; leverDragStartVal=leverY; leverVel=0; };
const moveDrag  = (p) => {
  const dy=(p.sY-leverDragStartScreenY)/(lpMax2*(cv.getBoundingClientRect().height/CH));
  leverY=Math.max(0,Math.min(1,leverDragStartVal+dy));
};
const endDrag   = () => { leverDragging=false; if(leverY>=0.62&&!spinning) triggerSpin(); };

cv.addEventListener('touchstart', e=>{ e.preventDefault(); const p=getPos(e); if(onBall(p)) startDrag(p); else if(onCoin(p)) insertCoin(); },{passive:false});
cv.addEventListener('touchmove',  e=>{ e.preventDefault(); if(leverDragging) moveDrag(getPos(e)); },{passive:false});
cv.addEventListener('touchend',   e=>{ e.preventDefault(); if(leverDragging) endDrag(); },{passive:false});
cv.addEventListener('mousedown',  e=>{ const p=getPos(e); if(onBall(p)) startDrag(p); else if(onCoin(p)) insertCoin(); });
cv.addEventListener('mousemove',  e=>{ if(leverDragging) moveDrag(getPos(e)); });
cv.addEventListener('mouseup',    e=>{ if(leverDragging) endDrag(); });

wrap._slotCleanup = () => { cancelAnimationFrame(rafId); };
```

};

/* ════ HI-LO ════ */
const buildHiLo = wrap => {
const SUITS=[‘♠’,‘♥’,‘♦’,‘♣’],RANKS=[‘A’,‘2’,‘3’,‘4’,‘5’,‘6’,‘7’,‘8’,‘9’,‘10’,‘J’,‘Q’,‘K’];
const VALUES={A:1,‘2’:2,‘3’:3,‘4’:4,‘5’:5,‘6’:6,‘7’:7,‘8’:8,‘9’:9,‘10’:10,J:11,Q:12,K:13};
const SCOL={‘♠’:’#111’,‘♣’:’#111’,‘♥’:’#cc0000’,‘♦’:’#cc0000’};
let deck=[],cur=null,streak=0,bet=10,busy=false;
const mkDeck=()=>{deck=[];SUITS.forEach(s=>RANKS.forEach(r=>deck.push({r,s,v:VALUES[r]})));for(let i=deck.length-1;i>0;i–){const j=Math.floor(Math.random()*(i+1));[deck[i],deck[j]]=[deck[j],deck[i]];}};
const draw=()=>deck.length?deck.pop():(mkDeck(),deck.pop());
const cHTML=(c,hidden)=>hidden?`<div style="width:90px;height:130px;border-radius:14px;background:linear-gradient(135deg,#1a1260,#0a0830);border:2px solid rgba(255,255,255,.12);display:flex;align-items:center;justify-content:center;font-size:2rem;">🂠</div>`
:`<div style="width:90px;height:130px;border-radius:14px;background:linear-gradient(135deg,#fff,#f0f0f0);border:2px solid rgba(0,0,0,.1);display:flex;flex-direction:column;padding:8px;color:${SCOL[c.s]};animation:cs-deal .3s both;"><div style="font-family:'Orbitron',sans-serif;font-size:1rem;font-weight:900;line-height:1;">${c.r}<br><span style="font-size:1.2rem;">${c.s}</span></div><div style="flex:1;display:flex;align-items:center;justify-content:center;font-size:2.2rem;">${c.s}</div><div style="font-family:'Orbitron',sans-serif;font-size:1rem;font-weight:900;line-height:1;align-self:flex-end;transform:rotate(180deg);">${c.r}<br><span style="font-size:1.2rem;">${c.s}</span></div></div>`;

```
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
```

};

/* ════ BLACKJACK ════ */
const buildBlackjack = wrap => {
const SUITS=[‘♠’,‘♥’,‘♦’,‘♣’],RANKS=[‘A’,‘2’,‘3’,‘4’,‘5’,‘6’,‘7’,‘8’,‘9’,‘10’,‘J’,‘Q’,‘K’];
const SCOL={‘♠’:’#111’,‘♣’:’#111’,‘♥’:’#cc0000’,‘♦’:’#cc0000’};
let deck=[],ph=[],dh=[],bet=20,gs=‘idle’;
const mkDeck=()=>{deck=[];SUITS.forEach(s=>RANKS.forEach(r=>deck.push({r,s})));SUITS.forEach(s=>RANKS.forEach(r=>deck.push({r,s})));for(let i=deck.length-1;i>0;i–){const j=Math.floor(Math.random()*(i+1));[deck[i],deck[j]]=[deck[j],deck[i]];}};
const draw=()=>deck.length?deck.pop():(mkDeck(),deck.pop());
const val=c=>[‘J’,‘Q’,‘K’].includes(c.r)?10:c.r===‘A’?11:parseInt(c.r);
const hval=h=>{let t=h.reduce((s,c)=>s+val(c),0),a=h.filter(c=>c.r===‘A’).length;while(t>21&&a>0){t-=10;a–;}return t;};
const cHTML=(c,fd)=>fd?`<div style="width:58px;height:86px;border-radius:10px;background:linear-gradient(135deg,#1a1260,#0a0830);border:2px solid rgba(255,255,255,.12);display:flex;align-items:center;justify-content:center;font-size:1.4rem;flex-shrink:0;">🂠</div>`
:`<div style="width:58px;height:86px;border-radius:10px;background:linear-gradient(135deg,#fff,#f0f0f0);border:2px solid rgba(0,0,0,.1);display:flex;flex-direction:column;padding:5px;color:${SCOL[c.s]};font-family:'Orbitron',sans-serif;flex-shrink:0;animation:cs-deal .25s both;"><div style="font-size:.65rem;font-weight:900;line-height:1.1;">${c.r}${c.s}</div><div style="flex:1;display:flex;align-items:center;justify-content:center;font-size:1.3rem;">${c.s}</div><div style="font-size:.65rem;font-weight:900;line-height:1.1;align-self:flex-end;transform:rotate(180deg);">${c.r}${c.s}</div></div>`;
const handHTML=(h,hide2)=>`<div style="display:flex;gap:6px;flex-wrap:wrap;">${h.map((c,i)=>i===1&&hide2?cHTML(c,true):cHTML(c,false)).join('')}</div>`;

```
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
```

};

/* ── Init ── */
return () => { _saveCoins(); };
}