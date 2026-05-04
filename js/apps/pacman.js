/* ════════════ PAC-MAN v4 ════════════
   10 levels, optimized layout, easier level 1, progressive difficulty.
   ═════════════════════════════════════════════════════════════════ */
function initPacman() {

  /* ══ LAYOUT ══ */
  const root = document.createElement('div');
  root.style.cssText = 'width:100%;height:100%;display:flex;flex-direction:column;align-items:center;background:#000;overflow:hidden;';
  content.appendChild(root);

  const spacer = document.createElement('div');
  spacer.style.cssText = `flex-shrink:0;height:${SA.t}px;width:100%;background:#000;`;
  root.appendChild(spacer);

  const cv = document.createElement('canvas');
  cv.style.cssText = 'display:block;flex-shrink:0;touch-action:none;';
  root.appendChild(cv);
  const ctx = cv.getContext('2d');

  const hud = document.createElement('div');
  hud.style.cssText = 'flex-shrink:0;display:flex;align-items:center;justify-content:space-between;width:100%;padding:5px 16px calc(var(--sb,0px)+6px);background:#000;box-sizing:border-box;';
  hud.innerHTML = `
    <div style="display:flex;align-items:center;gap:5px;"><span style="font-size:.9rem;">😀</span><span id="pm-lives" style="font-family:'Share Tech Mono',monospace;font-size:.82rem;color:#ffd700;">× 3</span></div>
    <div id="pm-score" style="font-family:'Orbitron',sans-serif;font-size:.78rem;font-weight:900;color:#ffd700;letter-spacing:.1em;">0</div>
    <div id="pm-level" style="font-family:'Share Tech Mono',monospace;font-size:.68rem;color:rgba(255,255,255,.35);letter-spacing:.1em;">LVL 1</div>`;
  root.appendChild(hud);

  /* ══ MAZE DEFINITIONS ══
     0=open  1=wall  2=pellet  3=power  4=house-interior */

  // Level 1 — open, wide corridors, few dead ends, easy to navigate
  const MAZE_L1 = [
    [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
    [1,2,2,2,2,2,2,2,2,2,2,2,2,1,1,2,2,2,2,2,2,2,2,2,2,2,2,1],
    [1,2,1,1,1,2,1,1,1,1,1,2,2,1,1,2,2,1,1,1,1,1,2,1,1,1,2,1],
    [1,3,1,1,1,2,1,1,1,1,1,2,2,1,1,2,2,1,1,1,1,1,2,1,1,1,3,1],
    [1,2,1,1,1,2,1,1,1,1,1,2,2,1,1,2,2,1,1,1,1,1,2,1,1,1,2,1],
    [1,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,1],
    [1,2,1,1,1,2,1,1,2,1,1,1,1,1,1,1,1,1,1,2,1,1,2,1,1,1,2,1],
    [1,2,1,1,1,2,1,1,2,1,1,1,1,1,1,1,1,1,1,2,1,1,2,1,1,1,2,1],
    [1,2,2,2,2,2,1,1,2,2,2,2,2,1,1,2,2,2,2,2,1,1,2,2,2,2,2,1],
    [1,1,1,1,1,2,1,1,1,1,1,0,0,1,1,0,0,1,1,1,1,1,2,1,1,1,1,1],
    [1,1,1,1,1,2,1,1,1,1,1,0,0,1,1,0,0,1,1,1,1,1,2,1,1,1,1,1],
    [1,1,1,1,1,2,1,1,0,0,0,0,0,0,0,0,0,0,0,0,1,1,2,1,1,1,1,1],
    [1,1,1,1,1,2,1,1,0,1,1,4,4,4,4,4,4,1,1,0,1,1,2,1,1,1,1,1],
    [1,1,1,1,1,2,1,1,0,1,4,4,4,4,4,4,4,4,1,0,1,1,2,1,1,1,1,1],
    [0,0,0,0,0,2,0,0,0,1,4,4,4,4,4,4,4,4,1,0,0,0,2,0,0,0,0,0],
    [1,1,1,1,1,2,1,1,0,1,1,1,1,1,1,1,1,1,1,0,1,1,2,1,1,1,1,1],
    [1,1,1,1,1,2,1,1,0,0,0,0,0,0,0,0,0,0,0,0,1,1,2,1,1,1,1,1],
    [1,1,1,1,1,2,1,1,0,1,1,1,1,1,1,1,1,1,1,0,1,1,2,1,1,1,1,1],
    [1,1,1,1,1,2,1,1,0,1,1,1,1,1,1,1,1,1,1,0,1,1,2,1,1,1,1,1],
    [1,2,2,2,2,2,2,2,2,2,2,2,2,1,1,2,2,2,2,2,2,2,2,2,2,2,2,1],
    [1,2,1,1,1,2,1,1,1,1,1,2,2,1,1,2,2,1,1,1,1,1,2,1,1,1,2,1],
    [1,2,1,1,1,2,1,1,1,1,1,2,2,1,1,2,2,1,1,1,1,1,2,1,1,1,2,1],
    [1,3,2,2,1,2,2,2,2,2,2,2,2,0,0,2,2,2,2,2,2,2,2,2,1,2,2,3],
    [1,1,1,2,1,2,1,1,2,1,1,1,1,1,1,1,1,1,1,2,1,1,2,1,1,2,1,1],
    [1,1,1,2,1,2,1,1,2,1,1,1,1,1,1,1,1,1,1,2,1,1,2,1,1,2,1,1],
    [1,2,2,2,2,2,2,2,2,2,2,2,2,1,1,2,2,2,2,2,2,2,2,2,2,2,2,1],
    [1,2,1,1,1,1,1,2,1,1,1,1,2,1,1,2,1,1,1,1,2,1,1,1,1,1,2,1],
    [1,2,1,1,1,1,1,2,1,1,1,1,2,1,1,2,1,1,1,1,2,1,1,1,1,1,2,1],
    [1,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,1],
    [1,2,1,1,2,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,2,1,1,2,1],
    [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
  ];

  // Level 2 — slightly tighter corridors
  const MAZE_L2 = [
    [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
    [1,2,2,2,2,2,1,2,2,2,2,2,2,1,1,2,2,2,2,2,2,2,1,2,2,2,2,1],
    [1,2,1,1,1,2,1,2,1,1,1,2,2,1,1,2,2,1,1,1,2,1,1,2,1,1,2,1],
    [1,3,1,1,1,2,1,2,1,1,1,2,2,1,1,2,2,1,1,1,2,1,1,2,1,1,3,1],
    [1,2,1,1,1,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,1,1,2,1],
    [1,2,2,2,2,2,1,2,1,1,2,1,1,1,1,1,1,2,1,1,2,1,2,2,2,2,2,1],
    [1,1,1,1,1,2,1,2,1,1,2,1,1,1,1,1,1,2,1,1,2,1,2,1,1,1,2,1],
    [1,1,1,1,1,2,1,2,2,2,2,2,2,1,1,2,2,2,2,2,2,1,2,1,1,1,2,1],
    [1,1,1,1,1,2,1,1,1,1,0,1,0,1,1,0,1,0,1,1,1,1,2,1,1,1,1,1],
    [1,1,1,1,1,2,1,1,1,1,0,1,0,1,1,0,1,0,1,1,1,1,2,1,1,1,1,1],
    [1,1,1,1,1,2,1,1,0,0,0,0,0,0,0,0,0,0,0,0,1,1,2,1,1,1,1,1],
    [1,1,1,1,1,2,1,1,0,1,1,4,4,4,4,4,4,1,1,0,1,1,2,1,1,1,1,1],
    [1,1,1,1,1,2,1,1,0,1,4,4,4,4,4,4,4,4,1,0,1,1,2,1,1,1,1,1],
    [1,1,1,1,1,2,1,1,0,1,4,4,4,4,4,4,4,4,1,0,1,1,2,1,1,1,1,1],
    [0,0,0,0,0,2,0,0,0,1,4,4,4,4,4,4,4,4,1,0,0,0,2,0,0,0,0,0],
    [1,1,1,1,1,2,1,1,0,1,1,1,1,1,1,1,1,1,1,0,1,1,2,1,1,1,1,1],
    [1,1,1,1,1,2,1,1,0,0,0,0,0,0,0,0,0,0,0,0,1,1,2,1,1,1,1,1],
    [1,1,1,1,1,2,1,1,0,1,1,1,0,1,1,0,1,1,1,0,1,1,2,1,1,1,1,1],
    [1,1,1,1,1,2,2,2,2,1,1,1,0,1,1,0,1,1,1,2,2,2,2,1,1,1,1,1],
    [1,2,2,2,2,2,1,1,2,2,2,2,2,1,1,2,2,2,2,2,1,1,2,2,2,2,2,1],
    [1,2,1,1,1,2,1,1,1,1,1,2,2,1,1,2,2,1,1,1,1,1,2,1,1,1,2,1],
    [1,2,1,1,1,2,1,1,1,1,1,2,2,1,1,2,2,1,1,1,1,1,2,1,1,1,2,1],
    [1,3,2,2,1,2,2,2,2,2,2,2,2,0,0,2,2,2,2,2,2,2,2,2,1,2,2,3],
    [1,1,1,2,1,2,1,1,2,1,1,1,1,1,1,1,1,1,1,2,1,1,2,1,1,2,1,1],
    [1,1,1,2,1,2,1,1,2,1,1,1,1,1,1,1,1,1,1,2,1,1,2,1,1,2,1,1],
    [1,2,2,2,2,2,2,2,2,2,2,2,2,1,1,2,2,2,2,2,2,2,2,2,2,2,2,1],
    [1,2,1,1,1,1,1,2,1,1,1,1,2,1,1,2,1,1,1,1,2,1,1,1,1,1,2,1],
    [1,2,1,1,1,1,1,2,1,1,1,1,2,1,1,2,1,1,1,1,2,1,1,1,1,1,2,1],
    [1,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,1],
    [1,2,1,1,2,1,2,1,1,1,1,2,1,1,1,1,2,1,1,1,1,2,1,2,1,1,2,1],
    [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
  ];

  // Levels 3–10 are generated procedurally as variations of L2 with more walls added
  // We'll alternate between two base mazes and vary ghost counts/speeds via config

  const MAZES = [MAZE_L1, MAZE_L2];
  // Levels 3-10 use MAZE_L2 (can be extended later)

  const getMaze = lvl => {
    if (lvl === 1) return MAZE_L1;
    return MAZE_L2;
  };

  /* ══ LEVEL CONFIG ══ */
  const getLevelCfg = lvl => {
    // Ghost release delays get shorter as levels increase
    // Ghost speed increases
    // Fright time decreases
    const spd   = Math.min(6.5 + (lvl - 1) * 0.30, 10.5);
    const fspd  = Math.max(3.5 - (lvl - 1) * 0.15, 1.5);
    const ftime = Math.max(12 - (lvl - 1) * 1.2, 2);
    const delays = [
      0,                                        // Blinky always immediate
      Math.max(3 - (lvl - 1) * 0.4, 0),        // Pinky
      Math.max(7 - (lvl - 1) * 0.8, 0),        // Inky
      Math.max(12 - (lvl - 1) * 1.2, 0),       // Clyde
    ];
    return { spd, fspd, ftime, delays };
  };

  /* ══ LAYOUT SIZING ══ */
  const COLS = 28, ROWS = 31, TUNNEL_ROW = 14;

  // Fill ALL available screen height so there's no black gap
  const availW = content.offsetWidth  || window.innerWidth  || 390;
  const availH = content.offsetHeight || window.innerHeight || 844;
  const hudH   = 36;
  const usableH = availH - SA.t - hudH;
  const CELL = Math.floor(Math.min(availW / COLS, usableH / ROWS));
  const MW   = CELL * COLS;
  const MH   = CELL * ROWS;
  cv.width  = MW; cv.height = MH;
  cv.style.width  = MW + 'px';
  cv.style.height = MH + 'px';

  /* ══ STATE ══ */
  let maze, pelletsLeft, totalPellets;
  let score = 0, lives = 3, level = 1;
  let gameState = 'title';
  let raf = null, lastTS = 0;
  let frightSec = 0, frightTotal = 0, eatCombo = 0;

  /* ══ MAZE HELPERS ══ */
  const wrapC = c => ((c % COLS) + COLS) % COLS;

  const isWall = (r, c) => {
    c = wrapC(c);
    if (r < 0 || r >= ROWS) return true;
    return maze[r][c] === 1;
  };

  const passable = (r, c, ghost, mode) => {
    c = wrapC(c);
    if (r < 0 || r >= ROWS) return false;
    const v = maze[r][c];
    if (v === 1) return false;
    if (ghost && v === 4 && mode !== 'eaten' && mode !== 'house') return false;
    return true;
  };

  const resetMaze = () => {
    const src = getMaze(level);
    maze = src.map(r => [...r]);
    totalPellets = 0;
    maze.forEach(r => r.forEach(v => { if (v === 2 || v === 3) totalPellets++; }));
    pelletsLeft = totalPellets;
  };

  /* ══ PAC-MAN ══ */
  let pR, pC, pNR, pNC, pProg;
  let pDR, pDC, qDR, qDC;
  let mouthA = 0.05, mouthDir = 1;

  // Level 1 is slower — easier. Speed ramps up each level.
  const pacSpeed = () => Math.min(6.5 + (level - 1) * 0.25, 10.0);

  const resetPac = () => {
    pR = 22; pC = 13;
    pDR = 0; pDC = -1;
    qDR = 0; qDC = -1;
    pNR = pR; pNC = pC - 1;
    pProg = 0;
    mouthA = 0.05; mouthDir = 1;
  };

  const pickNextPac = () => {
    if (qDR !== 0 || qDC !== 0) {
      const tr = pR + qDR, tc = wrapC(pC + qDC);
      if (!isWall(tr, tc)) {
        pDR = qDR; pDC = qDC;
        pNR = tr; pNC = pC + qDC;
        pProg = 0; return;
      }
    }
    if (pDR !== 0 || pDC !== 0) {
      const tr = pR + pDR, tc = wrapC(pC + pDC);
      if (!isWall(tr, tc)) { pNR = tr; pNC = pC + pDC; pProg = 0; return; }
    }
    pNR = pR; pNC = pC; pProg = 1.0;
  };

  const updatePac = dt => {
    mouthA += mouthDir * dt * 4.0;
    if (mouthA > 0.7) mouthDir = -1;
    if (mouthA < 0.04) mouthDir = 1;
    if (pProg >= 1.0) { pickNextPac(); return; }
    pProg += pacSpeed() * dt;
    if (pProg >= 1.0) {
      pProg = 1.0;
      pR = pNR; pC = wrapC(pNC); pNR = pR; pNC = pC;
      const v = maze[pR][pC];
      if (v === 2) {
        maze[pR][pC] = 0; score += 10; pelletsLeft--;
        if (pelletsLeft <= 0) { gameState = 'levelup'; haptic('success'); return; }
      } else if (v === 3) {
        maze[pR][pC] = 0; score += 50; pelletsLeft--;
        const cfg = getLevelCfg(level);
        frightTotal = cfg.ftime; frightSec = frightTotal; eatCombo = 0;
        ghosts.forEach(g => {
          if (g.mode !== 'eaten' && g.mode !== 'house') {
            g.mode = 'frightened';
            // Force immediate random direction so no BFS step is in flight
            const valid = DIRS.filter(d => passable(g.r+d.r, g.c+d.c, true, 'frightened'));
            if (valid.length) {
              const pick = valid[Math.floor(Math.random()*valid.length)];
              g.dr=pick.r; g.dc=pick.c;
              g.nr=g.r+pick.r; g.nc=g.c+pick.c; g.prog=0;
            }
          }
        });
        if (pelletsLeft <= 0) { gameState = 'levelup'; haptic('success'); return; }
      }
      pickNextPac();
    }
  };

  /* ══ GHOSTS ══ */
  const GHOST_DEF = [
    {name:'Blinky', color:'#ff0000', sr:11, sc:13, homeR:1,  homeC:26},
    {name:'Pinky',  color:'#ffb8ff', sr:13, sc:13, homeR:1,  homeC:1 },
    {name:'Inky',   color:'#00ffff', sr:13, sc:14, homeR:29, homeC:26},
    {name:'Clyde',  color:'#ffb852', sr:13, sc:11, homeR:29, homeC:1 },
  ];

  let ghosts = [];

  const initGhosts = () => {
    const cfg = getLevelCfg(level);
    ghosts = GHOST_DEF.map((d, i) => ({
      ...d,
      r: d.sr, c: d.sc,
      nr: d.sr, nc: d.sc - 1, prog: 0,
      dr: 0, dc: -1,
      mode: 'house',
      houseTimer: cfg.delays[i],
    }));
  };

  const DIRS = [{r:-1,c:0},{r:1,c:0},{r:0,c:-1},{r:0,c:1}];

  const bfs = (sr, sc, tr, tc, g) => {
    tr = Math.max(0, Math.min(ROWS-1, tr)); tc = wrapC(tc);
    const key = (r,c) => r * COLS + wrapC(c);
    const visited = new Map();
    const queue = [{r:sr, c:sc, fdr:null, fdc:null}];
    visited.set(key(sr,sc), null);
    while (queue.length) {
      const cur = queue.shift();
      if (cur.r === tr && wrapC(cur.c) === tc)
        return cur.fdr !== null ? {dr:cur.fdr,dc:cur.fdc} : {dr:0,dc:0};
      if (visited.size > 500) break;
      for (const d of DIRS) {
        const nr = cur.r + d.r, nc = cur.c + d.c, nk = key(nr,nc);
        if (visited.has(nk)) continue;
        if (!passable(nr, nc, true, g.mode)) continue;
        if (cur.fdr === null && d.r === -g.dr && d.c === -g.dc) continue;
        visited.set(nk, true);
        queue.push({r:nr, c:nc, fdr:cur.fdr??d.r, fdc:cur.fdc??d.c});
      }
    }
    for (const d of DIRS) {
      if (d.r === -g.dr && d.c === -g.dc) continue;
      if (passable(sr+d.r, sc+d.c, true, g.mode)) return {dr:d.r,dc:d.c};
    }
    for (const d of DIRS)
      if (passable(sr+d.r, sc+d.c, true, g.mode)) return {dr:d.r,dc:d.c};
    return {dr:0,dc:0};
  };

  const ghostTarget = g => {
    if (g.mode === 'scatter')    return {r:g.homeR, c:g.homeC};
    if (g.mode === 'frightened') return {r:g.homeR, c:g.homeC};
    if (g.mode === 'eaten')      return {r:11, c:13};
    if (g.name==='Blinky') return {r:pR, c:pC};
    if (g.name==='Pinky')  return {r:pR+pDR*4, c:pC+pDC*4};
    if (g.name==='Inky')   {
      const b=ghosts[0];
      return {r:pR+pDR*2+(pR+pDR*2-b.r), c:pC+pDC*2+(pC+pDC*2-b.c)};
    }
    if (g.name==='Clyde')  {
      const dist=Math.abs(g.r-pR)+Math.abs(g.c-pC);
      return dist>8?{r:pR,c:pC}:{r:g.homeR,c:g.homeC};
    }
    return {r:pR, c:pC};
  };

  const gSpeed = g => {
    const cfg = getLevelCfg(level);
    if (g.mode === 'frightened') return cfg.fspd;
    if (g.mode === 'eaten')      return 14.0;
    if (g.mode === 'house')      return 2.5;
    return cfg.spd;
  };

  const pickNextGhost = g => {
    if (g.mode === 'house') {
      if (g.c !== 13) {
        const dc = g.c < 13 ? 1 : -1, nc = g.c + dc;
        if (getMaze(level)[g.r] && (getMaze(level)[g.r][nc]===4||getMaze(level)[g.r][nc]===0))
          { g.dr=0; g.dc=dc; g.nr=g.r; g.nc=nc; g.prog=0; }
        else
          { g.dr=-1; g.dc=0; g.nr=g.r-1; g.nc=g.c; g.prog=0; }
      } else if (g.r > 11) {
        g.dr=-1; g.dc=0; g.nr=g.r-1; g.nc=g.c; g.prog=0;
      } else {
        g.mode='scatter'; g.dr=0; g.dc=-1; g.nr=g.r; g.nc=g.c-1; g.prog=0;
      }
      return;
    }
    if (g.mode === 'frightened') {
      // Pure random walk — no BFS (avoids freeze). Try non-reverse first.
      const valid = DIRS.filter(d => (d.r !== -g.dr || d.c !== -g.dc) && passable(g.r+d.r, g.c+d.c, true, g.mode));
      const any   = valid.length ? valid : DIRS.filter(d => passable(g.r+d.r, g.c+d.c, true, g.mode));
      if (any.length) {
        const d = any[Math.floor(Math.random() * any.length)];
        g.dr=d.r; g.dc=d.c; g.nr=g.r+d.r; g.nc=g.c+d.c; g.prog=0;
      } else {
        g.prog=0.01;
      }
      return;
    }
    const t = ghostTarget(g);
    const step = bfs(g.r, g.c, t.r, t.c, g);
    if (step.dr!==0||step.dc!==0) {
      const nr=g.r+step.dr, nc=g.c+step.dc;
      if (passable(nr,nc,true,g.mode)) { g.dr=step.dr; g.dc=step.dc; g.nr=nr; g.nc=nc; g.prog=0; return; }
    }
    for (const d of DIRS)
      if (passable(g.r+d.r,g.c+d.c,true,g.mode))
        { g.dr=d.r; g.dc=d.c; g.nr=g.r+d.r; g.nc=g.c+d.c; g.prog=0; return; }
    g.prog=0.01;
  };

  let modeTimer = 0;
  const MODE_SCHED = [[7,20],[7,20],[5,999]];

  const updateGhosts = dt => {
    if (frightSec > 0) {
      frightSec -= dt;
      if (frightSec <= 0) {
        frightSec = 0;
        ghosts.forEach(g => { if (g.mode==='frightened') g.mode='chase'; });
      }
    } else {
      modeTimer += dt;
      const sch = MODE_SCHED[Math.min(level-1, MODE_SCHED.length-1)];
      const pos = modeTimer % (sch[0]+sch[1]);
      const wantMode = pos < sch[0] ? 'scatter' : 'chase';
      ghosts.forEach(g => { if (g.mode==='chase'||g.mode==='scatter') g.mode=wantMode; });
    }
    ghosts.forEach(g => {
      if (g.mode==='house') {
        g.houseTimer -= dt;
        if (g.houseTimer > 0) return; // still waiting in house
        // houseTimer expired — let ghost start moving but keep house mode
        // pickNextGhost will handle the exit sequence
      }
      g.prog = Math.min(g.prog + gSpeed(g) * dt, 1.5); // cap to avoid skipping tiles
      if (g.prog >= 1.0) {
        g.prog = 0; g.r=g.nr; g.c=wrapC(g.nc); g.nr=g.r; g.nc=g.c;
        if (g.r===TUNNEL_ROW) {
          if (g.c<=0) g.c=COLS-1;
          if (g.c>=COLS-1) g.c=0;
          g.nr=g.r; g.nc=g.c;
        }
        if (g.mode==='eaten'&&g.r===11&&wrapC(g.c)===13) { g.mode='scatter'; g.dr=0; g.dc=0; }
        try { pickNextGhost(g); } catch(e) { g.prog=0.01; }
      }
    });
  };

  /* ══ COLLISIONS ══ */
  const checkCollisions = () => {
    ghosts.forEach(g => {
      if (g.mode==='house'||g.mode==='eaten') return;
      const gr=Math.round(g.r+(g.nr-g.r)*g.prog);
      const gc=wrapC(Math.round(g.c+(g.nc-g.c)*g.prog));
      const pr=Math.round(pR+(pNR-pR)*Math.min(pProg,1));
      const pc=wrapC(Math.round(pC+(pNC-pC)*Math.min(pProg,1)));
      if (Math.abs(gr-pr)<=1&&Math.abs(gc-pc)<=1&&Math.abs(gr-pr)+Math.abs(gc-pc)<2) {
        if (g.mode==='frightened') {
          eatCombo++; score+=[200,400,800,1600][Math.min(eatCombo-1,3)]; g.mode='eaten'; haptic('light');
        } else {
          if (gameState!=='playing') return;
          gameState='dying'; haptic('heavy');
        }
      }
    });
  };

  /* ══ DRAW ══ */
  const drawMaze = () => {
    ctx.fillStyle='#000'; ctx.fillRect(0,0,MW,MH);
    for (let r=0;r<ROWS;r++) for (let c=0;c<COLS;c++) {
      const v=maze[r][c], x=c*CELL, y=r*CELL;
      if (v===1) {
        ctx.fillStyle='#1a1acc'; ctx.fillRect(x,y,CELL,CELL);
        ctx.strokeStyle='#3333ff'; ctx.lineWidth=0.8;
        ctx.strokeRect(x+.5,y+.5,CELL-1,CELL-1);
      } else if (v===2) {
        ctx.beginPath(); ctx.arc(x+CELL/2,y+CELL/2,CELL*.11,0,Math.PI*2);
        ctx.fillStyle='#ffb8ae'; ctx.fill();
      } else if (v===3) {
        const p=.65+.35*Math.sin(lastTS*.006);
        ctx.beginPath(); ctx.arc(x+CELL/2,y+CELL/2,CELL*.28*p,0,Math.PI*2);
        ctx.fillStyle='#ffb8ae'; ctx.shadowColor='#ffb8ae'; ctx.shadowBlur=8; ctx.fill(); ctx.shadowBlur=0;
      }
    }
  };

  const drawPac = () => {
    const t=Math.min(pProg,1);
    const x=(pC+(pNC-pC)*t)*CELL+CELL/2, y=(pR+(pNR-pR)*t)*CELL+CELL/2;
    const r=CELL*.44;
    let rot=0;
    if (pDR===1) rot=Math.PI/2; if (pDR===-1) rot=-Math.PI/2;
    if (pDC===1) rot=0;         if (pDC===-1) rot=Math.PI;
    if (pDR===0&&pDC===0) rot=Math.PI;
    ctx.save(); ctx.translate(x,y); ctx.rotate(rot);
    ctx.beginPath(); ctx.moveTo(0,0); ctx.arc(0,0,r,mouthA,Math.PI*2-mouthA); ctx.closePath();
    ctx.fillStyle='#ffd700'; ctx.shadowColor='#ffd700'; ctx.shadowBlur=6; ctx.fill(); ctx.shadowBlur=0;
    ctx.restore();
  };

  const drawGhosts = () => {
    ghosts.forEach(g => {
      const t=Math.min(g.prog,1);
      const x=(g.c+(g.nc-g.c)*t)*CELL+CELL/2, y=(g.r+(g.nr-g.r)*t)*CELL+CELL/2;
      const r=CELL*.44;
      const fright=g.mode==='frightened', eaten=g.mode==='eaten';
      const flashing=fright&&frightSec<frightTotal*.35&&Math.floor(lastTS*.004)%2===0;
      if (eaten) {
        ctx.fillStyle='#fff';
        [-0.2,0.2].forEach(ox=>{
          ctx.beginPath();ctx.arc(x+ox*CELL,y-.08*CELL,CELL*.09,0,Math.PI*2);ctx.fill();
          ctx.fillStyle='#00f';ctx.beginPath();ctx.arc(x+ox*CELL+g.dc*CELL*.04,y-.08*CELL+g.dr*CELL*.04,CELL*.05,0,Math.PI*2);ctx.fill();
          ctx.fillStyle='#fff';
        });
        return;
      }
      const col=fright?(flashing?'#fff':'#0000bb'):g.color;
      ctx.beginPath();ctx.arc(x,y,r,Math.PI,0);ctx.lineTo(x+r,y+r*.9);
      for(let i=0;i<4;i++){const wx=x+r-(i+.5)*(r*.5),wy=y+r*.9+(i%2===0?-CELL*.1:CELL*.1);ctx.quadraticCurveTo(wx,wy,x+r-(i+1)*(r*.5),y+r*.9);}
      ctx.closePath();ctx.fillStyle=col;ctx.shadowColor=col;ctx.shadowBlur=fright?0:6;ctx.fill();ctx.shadowBlur=0;
      if(!fright){
        ctx.fillStyle='#fff';
        [-0.2,0.2].forEach(ox=>{
          ctx.beginPath();ctx.arc(x+ox*CELL,y-.08*CELL,CELL*.1,0,Math.PI*2);ctx.fill();
          ctx.fillStyle='#00f';ctx.beginPath();ctx.arc(x+ox*CELL+g.dc*CELL*.04,y-.08*CELL+g.dr*CELL*.04,CELL*.055,0,Math.PI*2);ctx.fill();
          ctx.fillStyle='#fff';
        });
      } else {
        ctx.strokeStyle=flashing?'#000':'#fff';ctx.lineWidth=1.5;
        [-0.2,0.2].forEach(ox=>{const ex=x+ox*CELL,ey=y-.09*CELL,s=CELL*.07;
          ctx.beginPath();ctx.moveTo(ex-s,ey-s);ctx.lineTo(ex+s,ey+s);ctx.stroke();
          ctx.beginPath();ctx.moveTo(ex+s,ey-s);ctx.lineTo(ex-s,ey+s);ctx.stroke();});
      }
    });
  };

  const drawOverlay = () => {
    const box=(t1,c1,t2,c2,t3)=>{
      ctx.fillStyle='rgba(0,0,0,.78)';ctx.fillRect(0,0,MW,MH);
      ctx.textAlign='center';ctx.textBaseline='middle';
      ctx.font=`900 ${CELL*1.1}px 'Orbitron',sans-serif`;
      ctx.fillStyle=c1;ctx.shadowColor=c1;ctx.shadowBlur=22;ctx.fillText(t1,MW/2,MH*.35);ctx.shadowBlur=0;
      if(t2){ctx.font=`${CELL*.72}px 'Share Tech Mono',monospace`;ctx.fillStyle=c2;ctx.fillText(t2,MW/2,MH*.50);}
      if(t3){ctx.font=`${CELL*.50}px 'Share Tech Mono',monospace`;ctx.fillStyle='rgba(255,255,255,.3)';ctx.fillText(t3,MW/2,MH*.63);}
    };
    if(gameState==='title'){
      ctx.fillStyle='rgba(0,0,0,.65)';ctx.fillRect(0,0,MW,MH);
      ctx.textAlign='center';ctx.textBaseline='middle';
      ctx.font=`900 ${CELL*1.1}px 'Orbitron',sans-serif`;
      ctx.fillStyle='#ffd700';ctx.shadowColor='#ffd700';ctx.shadowBlur=22;ctx.fillText('PAC-MAN',MW/2,MH*.32);ctx.shadowBlur=0;
      ctx.font=`${CELL*.62}px 'Share Tech Mono',monospace`;ctx.fillStyle='rgba(255,255,255,.7)';ctx.fillText('SWIPE TO START',MW/2,MH*.46);
      ctx.font=`${CELL*.44}px 'Share Tech Mono',monospace`;ctx.fillStyle='rgba(255,255,255,.28)';ctx.fillText('Swipe to steer  ·  Queue turns ahead',MW/2,MH*.56);
      // Level indicator if > 1
      if(level>1){
        ctx.font=`${CELL*.52}px 'Share Tech Mono',monospace`;ctx.fillStyle='rgba(0,255,200,.5)';
        ctx.fillText('LEVEL '+level,MW/2,MH*.68);
      }
    }
    if(gameState==='over')    box('GAME OVER','#ff4af8',score.toLocaleString(),'#ffd700','SWIPE TO RETRY');
    if(gameState==='levelup'){
      if(level>=10) box('YOU WIN!','#ffd700',score.toLocaleString(),'#00ffcc','SWIPE TO PLAY AGAIN');
      else          box('LEVEL '+(level+1),'#00ffcc','','','SWIPE TO CONTINUE');
    }
    if(gameState==='dying'){ctx.fillStyle='rgba(255,0,0,.12)';ctx.fillRect(0,0,MW,MH);}
  };

  const updateHUD = () => {
    document.getElementById('pm-score').textContent = score.toLocaleString();
    document.getElementById('pm-lives').textContent = '× ' + lives;
    document.getElementById('pm-level').textContent = 'LVL ' + level + (level>=10?' 🏆':'');
  };

  /* ══ GAME LOOP ══ */
  let dyingTimer = 0;

  const loop = ts => {
    const dt = Math.min((ts - lastTS) / 1000, 0.05);
    lastTS = ts;
    if (gameState==='playing') { updatePac(dt); updateGhosts(dt); checkCollisions(); }
    if (gameState==='dying') {
      if (dyingTimer<=0) dyingTimer=1.2;
      dyingTimer-=dt;
      if (dyingTimer<=0) {
        lives--;
        if (lives<=0) { gameState='over'; }
        else { resetPositions(); gameState='title'; }
        updateHUD();
      }
    }
    drawMaze(); drawPac(); drawGhosts(); drawOverlay(); updateHUD();
    raf = requestAnimationFrame(loop);
  };

  const resetPositions = () => {
    resetPac(); initGhosts(); frightSec=0; eatCombo=0; modeTimer=0;
  };

  /* ══ INPUT ══ */
  let swX=null, swY=null;

  const handleSwipeDir = (dx, dy) => {
    if (Math.max(Math.abs(dx),Math.abs(dy)) < 14) return;
    if (gameState==='title') {
      gameState='playing';
    } else if (gameState==='over') {
      score=0; lives=3; level=1; resetMaze(); resetPositions(); gameState='playing';
    } else if (gameState==='levelup') {
      if (level>=10) { score=0; lives=3; level=1; resetMaze(); resetPositions(); gameState='playing'; }
      else { level++; resetMaze(); resetPositions(); gameState='playing'; frightSec=0; }
    }
    if (Math.abs(dx)>Math.abs(dy)) { qDR=0; qDC=dx>0?1:-1; }
    else { qDR=dy>0?1:-1; qDC=0; }
    haptic('light');
  };

  cv.addEventListener('touchstart',e=>{e.preventDefault();const t=e.touches[0];swX=t.clientX;swY=t.clientY;},{passive:false});
  cv.addEventListener('touchend',e=>{if(swX===null)return;e.preventDefault();const t=e.changedTouches[0];handleSwipeDir(t.clientX-swX,t.clientY-swY);swX=null;swY=null;},{passive:false});
  root.addEventListener('touchstart',e=>{const t=e.touches[0];swX=t.clientX;swY=t.clientY;},{passive:true});
  root.addEventListener('touchend',e=>{if(swX===null)return;const t=e.changedTouches[0];handleSwipeDir(t.clientX-swX,t.clientY-swY);swX=null;swY=null;},{passive:true});

  const onKey = e => {
    const map={ArrowLeft:[0,-1],ArrowRight:[0,1],ArrowUp:[-1,0],ArrowDown:[1,0]};
    const d=map[e.key]; if(!d)return; e.preventDefault();
    handleSwipeDir(d[1]*50,d[0]*50);
  };
  document.addEventListener('keydown',onKey);

  /* ── Boot ── */
  resetMaze(); resetPac(); initGhosts();
  lastTS = performance.now();
  raf = requestAnimationFrame(loop);

  return () => { cancelAnimationFrame(raf); document.removeEventListener('keydown',onKey); };
}
