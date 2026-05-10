/* ════════════ GAMES HUB — Modern (liquid glass) ════════════ */
function initGames98() {
  const c = window.content;
  c.style.cssText = 'width:100%;height:100%;display:flex;flex-direction:column;overflow:hidden;background:transparent;';

  const GAMES = [
    { id:'snake',     name:'Snake',        ico:'🐍', hs: POS.getHighScore('snake')     || 0 },
    { id:'flappy',    name:'Flappy',       ico:'🐦', hs: POS.getHighScore('flappy')    || 0 },
    { id:'pong',      name:'Pong',         ico:'🏓', hs: POS.getHighScore('pong')      || 0 },
    { id:'breakout',  name:'Breakout',     ico:'🧱', hs: POS.getHighScore('breakout')  || 0 },
    { id:'simon',     name:'Simon',        ico:'🟢', hs: POS.getHighScore('simon')     || 0 },
    { id:'reaction',  name:'Reaction',     ico:'⚡', hs: POS.getHighScore('reaction')  || 0 },
    { id:'colorgame', name:'Colors',       ico:'🎨', hs: POS.getHighScore('colorgame') || 0 },
    { id:'g2048',     name:'2048',         ico:'🟦', hs: POS.getHighScore('g2048')     || 0 },
    { id:'pacman',    name:'Pac-Man',      ico:'👾', hs: POS.getHighScore('pacman')    || 0 },
    { id:'casino',    name:'Casino',       ico:'🎰', hs: POS.getHighScore('casino')    || 0 },
  ];

  GAMES.forEach(g => {
    if (!APP_LOOKUP[g.id]) APP_LOOKUP[g.id] = { id:g.id, name:g.name, ico:g.ico, stub:false };
  });

  /* ── Section header ── */
  const label = document.createElement('div');
  label.style.cssText = 'font-family:-apple-system,BlinkMacSystemFont,sans-serif;font-size:.72rem;font-weight:600;color:rgba(0,0,0,.45);text-transform:uppercase;letter-spacing:.06em;padding:16px 20px 6px;';
  label.textContent = 'Select a Game';
  c.appendChild(label);

  /* ── Glass list ── */
  const scroll = document.createElement('div');
  scroll.style.cssText = 'flex:1;overflow-y:auto;-webkit-overflow-scrolling:touch;padding:0 16px 20px;';
  c.appendChild(scroll);

  const list = document.createElement('div');
  list.style.cssText = [
    'background:rgba(255,255,255,.68);',
    'backdrop-filter:blur(24px) saturate(180%);-webkit-backdrop-filter:blur(24px) saturate(180%);',
    'border-radius:20px;overflow:hidden;',
    'box-shadow:0 2px 16px rgba(0,0,0,.08);',
  ].join('');
  scroll.appendChild(list);

  GAMES.forEach((game, i) => {
    const row = document.createElement('div');
    row.style.cssText = [
      'display:flex;align-items:center;gap:14px;padding:12px 16px;cursor:pointer;',
      '-webkit-tap-highlight-color:transparent;',
      i < GAMES.length - 1 ? 'border-bottom:1px solid rgba(0,0,0,.06);' : '',
    ].join('');

    row.innerHTML = `
      <div style="font-size:1.8rem;line-height:1;flex-shrink:0;width:36px;text-align:center;">${game.ico}</div>
      <div style="flex:1;">
        <div style="font-family:-apple-system,BlinkMacSystemFont,sans-serif;font-size:1rem;font-weight:600;color:#000;letter-spacing:-.2px;">${game.name}</div>
        <div style="font-family:-apple-system,BlinkMacSystemFont,sans-serif;font-size:.8rem;color:rgba(0,0,0,.4);margin-top:1px;">High Score: ${game.hs.toLocaleString()}</div>
      </div>
      <div style="color:rgba(0,0,0,.2);font-size:1.1rem;">›</div>`;

    row.addEventListener('touchstart', () => { row.style.background = 'rgba(0,0,0,.05)'; }, {passive:true});
    row.addEventListener('touchend',   () => { row.style.background = ''; }, {passive:true});
    row.addEventListener('click', () => { haptic('medium'); OS.openApp(game.id); });
    list.appendChild(row);
  });

  /* ── Achievements button ── */
  const achBtn = document.createElement('button');
  achBtn.style.cssText = [
    'width:100%;margin-top:12px;padding:14px 16px;',
    'font-family:-apple-system,BlinkMacSystemFont,sans-serif;font-size:1rem;font-weight:600;color:#007AFF;',
    'background:rgba(255,255,255,.68);',
    'backdrop-filter:blur(24px) saturate(180%);-webkit-backdrop-filter:blur(24px) saturate(180%);',
    'border:none;border-radius:16px;cursor:pointer;',
    '-webkit-tap-highlight-color:transparent;',
    'box-shadow:0 2px 12px rgba(0,0,0,.07);',
  ].join('');
  achBtn.innerHTML = '🏆 View Achievements';
  achBtn.addEventListener('touchstart', () => { achBtn.style.opacity = '.7'; }, {passive:true});
  achBtn.addEventListener('touchend',   () => { achBtn.style.opacity = ''; }, {passive:true});
  achBtn.onclick = () => OS.openApp('achievements');
  scroll.appendChild(achBtn);

  /* ── Footer stats ── */
  const footer = document.createElement('div');
  footer.style.cssText = 'flex-shrink:0;padding:8px 20px 12px;font-family:-apple-system,BlinkMacSystemFont,sans-serif;font-size:.78rem;color:rgba(0,0,0,.35);display:flex;gap:16px;';
  footer.innerHTML = `<span>${GAMES.length} games</span><span>Games played: ${POS.get().gamesPlayed || 0}</span>`;
  c.appendChild(footer);
}
