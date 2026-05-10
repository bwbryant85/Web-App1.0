/* ════════════════════════════════════════════════════════════════
   CASINO — Modern (liquid glass) theme
   Lobby: frosted glass cards, SF Pro, iOS aesthetics
   Games: kept identical to Win98 version (canvas-based)
════════════════════════════════════════════════════════════════ */

const _CASINO_KEY = 'ipocket_casino_coins';
let _casinoCoins = null;
const _loadCoins = () => {
  if (_casinoCoins !== null) return;
  try { const v = parseInt(localStorage.getItem(_CASINO_KEY)); _casinoCoins = (!isNaN(v) && v >= 0) ? v : 1000; }
  catch(e) { _casinoCoins = 1000; }
};
const _saveCoins  = () => { try { localStorage.setItem(_CASINO_KEY, _casinoCoins); } catch(e) {} };
const _addCoins   = delta => { _casinoCoins = Math.max(0, _casinoCoins + delta); _saveCoins(); };

function initCasino() {
  _loadCoins();
  let activeGame = null;

  const c = window.content;
  c.style.cssText = 'width:100%;height:100%;display:flex;flex-direction:column;overflow:hidden;background:transparent;';

  /* ── Inject keyframes (shared with game canvases) ── */
  if (!document.getElementById('casino-styles')) {
    const st = document.createElement('style');
    st.id = 'casino-styles';
    st.textContent = `
      @import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@400;700;900&family=Share+Tech+Mono&display=swap');
      @keyframes cs-deal3d { from{opacity:0;transform:rotateY(-90deg) translateZ(30px);} to{opacity:1;transform:rotateY(0deg) translateZ(0);} }
      @keyframes cs-dealflip { 0%{transform:rotateY(0deg);} 50%{transform:rotateY(90deg);} 100%{transform:rotateY(0deg);} }
      @keyframes cs-tableslide { from{opacity:0;transform:translateY(18px);} to{opacity:1;transform:translateY(0);} }
      @keyframes cs-coins { 0%{opacity:1;transform:translateY(0);} 100%{opacity:0;transform:translateY(-40px);} }
      @keyframes cs-spin { to{transform:rotate(360deg);} }
      @keyframes cs-reel { 0%{transform:translateY(0);} 100%{transform:translateY(-100%);} }
      @keyframes cs-shine { 0%,100%{opacity:.4;} 50%{opacity:1;} }
    `;
    document.head.appendChild(st);
  }

  /* ── Header: glass nav bar ── */
  const header = document.createElement('div');
  header.style.cssText = [
    'flex-shrink:0;',
    'background:rgba(255,255,255,.72);',
    'backdrop-filter:blur(28px) saturate(200%);-webkit-backdrop-filter:blur(28px) saturate(200%);',
    'border-bottom:1px solid rgba(0,0,0,.08);',
    'padding:12px 16px 10px;',
    'display:flex;align-items:center;gap:12px;',
  ].join('');
  header.innerHTML = `
    <button id="cs-back" style="display:none;font-family:-apple-system,BlinkMacSystemFont,sans-serif;font-size:1rem;font-weight:500;color:#007AFF;background:none;border:none;cursor:pointer;-webkit-tap-highlight-color:transparent;padding:0;">‹ Back</button>
    <div id="cs-title" style="font-family:-apple-system,BlinkMacSystemFont,sans-serif;font-size:1.1rem;font-weight:700;color:#000;flex:1;">🎰 Casino</div>
    <div id="cs-wallet" style="font-family:-apple-system,BlinkMacSystemFont,sans-serif;font-size:.95rem;font-weight:600;color:#c8a000;">🪙 ${_casinoCoins.toLocaleString()}</div>`;
  c.appendChild(header);

  /* ── Body ── */
  const body = document.createElement('div');
  body.style.cssText = 'flex:1;overflow:hidden;position:relative;';
  c.appendChild(body);

  /* ── Wallet helpers ── */
  const refreshWalletDisplay = () => {
    const el = document.getElementById('cs-wallet'); if (el) el.textContent = `🪙 ${_casinoCoins.toLocaleString()}`;
    const lb = document.getElementById('cs-lobby-bal'); if (lb) lb.textContent = `🪙 ${_casinoCoins.toLocaleString()}`;
  };
  const updateWallet = (delta, refEl) => {
    _addCoins(delta); refreshWalletDisplay();
    if (delta !== 0 && refEl) {
      const float = document.createElement('div');
      float.style.cssText = `position:fixed;font-family:-apple-system,sans-serif;font-size:1rem;font-weight:700;color:${delta>0?'#34c759':'#ff3b30'};pointer-events:none;z-index:9999;animation:cs-coins .9s ease forwards;`;
      float.textContent = (delta > 0 ? '+' : '') + delta.toLocaleString();
      const r = refEl.getBoundingClientRect();
      float.style.left = (r.left + r.width/2 - 30) + 'px'; float.style.top = r.top + 'px';
      document.body.appendChild(float); setTimeout(() => float.remove(), 950);
    }
  };

  /* ── Lobby ── */
  const lobbyPanel = document.createElement('div');
  lobbyPanel.style.cssText = 'position:absolute;inset:0;overflow-y:auto;-webkit-overflow-scrolling:touch;padding:20px 16px 60px;display:flex;flex-direction:column;gap:0;';
  body.appendChild(lobbyPanel);

  const GAMES = [
    {id:'slots',     name:'Slot Machine', ico:'🎰', desc:'3 reels · Match symbols to win'},
    {id:'hilo',      name:'Hi-Lo',        ico:'🃏', desc:'Higher or lower than the last card?'},
    {id:'blackjack', name:'Blackjack',    ico:'♠️', desc:'Beat the dealer · Get to 21'},
  ];

  /* Section label */
  const lobbyLabel = document.createElement('div');
  lobbyLabel.style.cssText = 'font-family:-apple-system,BlinkMacSystemFont,sans-serif;font-size:.72rem;font-weight:600;color:rgba(0,0,0,.45);text-transform:uppercase;letter-spacing:.06em;padding:0 4px 8px;';
  lobbyLabel.textContent = 'Choose a Game';
  lobbyPanel.appendChild(lobbyLabel);

  /* Glass list container */
  const gameList = document.createElement('div');
  gameList.style.cssText = [
    'background:rgba(255,255,255,.7);',
    'backdrop-filter:blur(24px) saturate(180%);-webkit-backdrop-filter:blur(24px) saturate(180%);',
    'border-radius:18px;',
    'overflow:hidden;',
    'box-shadow:0 2px 16px rgba(0,0,0,.08);',
  ].join('');
  lobbyPanel.appendChild(gameList);

  GAMES.forEach((g, i) => {
    const row = document.createElement('div');
    row.style.cssText = [
      'display:flex;align-items:center;gap:14px;padding:14px 16px;cursor:pointer;',
      '-webkit-tap-highlight-color:transparent;',
      i < GAMES.length - 1 ? 'border-bottom:1px solid rgba(0,0,0,.06);' : '',
    ].join('');
    row.innerHTML = `
      <div style="font-size:2rem;line-height:1;flex-shrink:0;">${g.ico}</div>
      <div style="flex:1;">
        <div style="font-family:-apple-system,BlinkMacSystemFont,sans-serif;font-size:1rem;font-weight:600;color:#000;margin-bottom:2px;">${g.name}</div>
        <div style="font-family:-apple-system,BlinkMacSystemFont,sans-serif;font-size:.82rem;color:rgba(0,0,0,.45);">${g.desc}</div>
      </div>
      <div style="color:rgba(0,0,0,.25);font-size:1.1rem;">›</div>`;
    row.addEventListener('touchstart', () => { row.style.background = 'rgba(0,0,0,.04)'; }, {passive:true});
    row.addEventListener('touchend',   () => { row.style.background = ''; }, {passive:true});
    row.addEventListener('click', () => openGame(g.id));
    gameList.appendChild(row);
  });

  /* Balance card */
  const balCard = document.createElement('div');
  balCard.style.cssText = [
    'margin-top:16px;padding:20px;text-align:center;',
    'background:rgba(255,255,255,.65);',
    'backdrop-filter:blur(24px) saturate(180%);-webkit-backdrop-filter:blur(24px) saturate(180%);',
    'border-radius:18px;',
    'box-shadow:0 2px 16px rgba(0,0,0,.06);',
  ].join('');
  balCard.innerHTML = `
    <div style="font-family:-apple-system,BlinkMacSystemFont,sans-serif;font-size:.72rem;font-weight:600;color:rgba(0,0,0,.4);text-transform:uppercase;letter-spacing:.06em;margin-bottom:8px;">Your Balance</div>
    <div id="cs-lobby-bal" style="font-family:-apple-system,BlinkMacSystemFont,sans-serif;font-size:2.6rem;font-weight:700;color:#000;line-height:1.1;">🪙 ${_casinoCoins.toLocaleString()}</div>
    <button id="cs-refill" style="margin-top:12px;font-family:-apple-system,BlinkMacSystemFont,sans-serif;font-size:.9rem;font-weight:600;color:#007AFF;background:rgba(0,122,255,.1);border:none;border-radius:10px;padding:8px 20px;cursor:pointer;-webkit-tap-highlight-color:transparent;">Refill to 1,000</button>`;
  lobbyPanel.appendChild(balCard);
  document.getElementById('cs-refill').onclick = () => {
    if (_casinoCoins < 1000) { updateWallet(1000 - _casinoCoins, balCard); haptic('success'); }
  };

  /* ── Game panels ── */
  const gamePanels = {};
  const makePanel = () => {
    const p = document.createElement('div');
    p.style.cssText = 'position:absolute;inset:0;overflow-y:auto;-webkit-overflow-scrolling:touch;padding:10px 16px 60px;transform:translateX(100%);transition:transform .32s cubic-bezier(.34,1.56,.64,1);background:transparent;';
    body.appendChild(p);
    return p;
  };

  const openGame = id => {
    haptic('medium'); activeGame = id;
    const g = GAMES.find(g => g.id === id);
    const titleEl = document.getElementById('cs-title');
    const backEl  = document.getElementById('cs-back');
    if (titleEl) titleEl.textContent = g.name;
    if (backEl)  backEl.style.display = '';
    lobbyPanel.style.transition = 'transform .32s cubic-bezier(.34,1.56,.64,1)';
    lobbyPanel.style.transform  = 'translateX(-100%)';
    if (!gamePanels[id]) {
      gamePanels[id] = makePanel();
      if (id==='slots')     _casinoBuildSlots(gamePanels[id]);
      if (id==='hilo')      _casinoBuildHiLo(gamePanels[id]);
      if (id==='blackjack') _casinoBuildBlackjack(gamePanels[id]);
    }
    gamePanels[id].style.transform = 'translateX(0)';
  };

  const closeGame = () => {
    haptic('light');
    if (gamePanels[activeGame]) gamePanels[activeGame].style.transform = 'translateX(100%)';
    lobbyPanel.style.transform = 'translateX(0)';
    const titleEl = document.getElementById('cs-title');
    const backEl  = document.getElementById('cs-back');
    if (titleEl) titleEl.textContent = '🎰 Casino';
    if (backEl)  backEl.style.display = 'none';
    activeGame = null; refreshWalletDisplay();
  };
  document.getElementById('cs-back').addEventListener('click', closeGame);

  /* ── Game panels use shared module-scope builders from casino.js ── */
}
