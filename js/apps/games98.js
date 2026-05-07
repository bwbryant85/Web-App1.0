/* ════════ GAMES HUB (Win98) ════════ */
function initGames98() {
  const c = window.content;
  c.style.cssText = 'width:100%;height:100%;display:flex;flex-direction:column;overflow:hidden;';

  const menu = document.createElement('div');
  menu.className = 'win-menubar';
  menu.innerHTML = '<div class="win-menu-item">Game</div><div class="win-menu-item">View</div><div class="win-menu-item">Help</div>';
  c.appendChild(menu);

  const wrap = document.createElement('div');
  wrap.className = 'games98-wrap';

  const header = document.createElement('div');
  header.style.cssText = 'padding:5px 8px;font-family:var(--pixel-font);font-size:16px;color:var(--win-text);border-bottom:1px solid var(--win-chrome-dark);';
  header.textContent = 'Select a game to play';
  wrap.appendChild(header);

  const GAMES = [
    { id:'snake',    name:'Snake',    ico:'🐍', color:'#006400' },
    { id:'flappy',   name:'Flappy',   ico:'🐦', color:'#005080' },
    { id:'pong',     name:'Pong',     ico:'🏓', color:'#600060' },
    { id:'breakout', name:'Breakout', ico:'🧱', color:'#804000' },
    { id:'simon',    name:'Simon',    ico:'🟢', color:'#005050' },
    { id:'reaction', name:'Reaction', ico:'⚡', color:'#606000' },
    { id:'colorgame',name:'Colors',   ico:'🎨', color:'#400060' },
    { id:'g2048',    name:'2048',     ico:'🟦', color:'#804020' },
    { id:'pacman',   name:'Pac-Man',  ico:'👾', color:'#806000' },
    { id:'casino',   name:'Casino',   ico:'🎰', color:'#600040' },
  ];

  GAMES.forEach(game => {
    if (!APP_LOOKUP[game.id]) {
      APP_LOOKUP[game.id] = { id: game.id, name: game.name, ico: game.ico, stub:false };
    }
  });

  const list = document.createElement('div');
  list.className = 'games98-list win-scroll';

  GAMES.forEach(game => {
    const hs = POS.getHighScore(game.id);
    const row = document.createElement('div');
    row.className = 'games98-item';
    row.innerHTML = `
      <div class="games98-ico">${game.ico}</div>
      <div>
        <div class="games98-name">${game.name}</div>
        <div class="games98-hs">High Score: ${hs || 0}</div>
      </div>
    `;
    row.onclick = () => { haptic('medium'); OS.openApp(game.id); };
    list.appendChild(row);
  });

  wrap.appendChild(list);

  const achBtn = document.createElement('button');
  achBtn.className = 'btn98 games98-ach-btn';
  achBtn.innerHTML = '🏆 View Achievements';
  achBtn.onclick = () => OS.openApp('achievements');
  wrap.appendChild(achBtn);

  c.appendChild(wrap);

  const sb = document.createElement('div');
  sb.className = 'win-statusbar';
  sb.innerHTML = `<div class="win-status-pane">${GAMES.length} games</div><div class="win-status-pane">Games played: ${POS.get().gamesPlayed||0}</div>`;
  c.appendChild(sb);
}
