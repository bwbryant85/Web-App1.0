/* ════════════ PAC-MAN v3 ════════════
   Tile-based discrete movement — same model as original arcade.
   Each entity moves between adjacent tile centers one step at a time.
   Progress 0→1 per step gives smooth rendering.
   Swipe queues next direction (like 2048 — fires when pac reaches next intersection).
   ═════════════════════════════════════════════════════════════════ */
function initPacman() {

  /* ══ LAYOUT ══ */
  const root = document.createElement('div');
  root.style.cssText = 'width:100%;height:100%;display:flex;flex-direction:column;align-items:center;background:#000;overflow:hidden;';
  content.appendChild(root);

  // Dynamic Island spacer
  const spacer = document.createElement('div');
  spacer.style.cssText = `flex-shrink:0;height:${SA.t}px;width:100%;background:#000;`;
  root.appendChild(spacer);

  const cv = document.createElement('canvas');
  cv.style.cssText = 'display:block;flex-shrink:0;touch-action:none;';
  root.appendChild(cv);
  const ctx = cv.getContext('2d');

  const hud = document.createElement('div');
  hud.style.cssText = 'flex-shrink:0;display:flex;align-items:center;justify-content:space-between;width:100%;padding:6px 20px calc(var(--sb,0px)+8px);background:#000;';
  hud.innerHTML = `
    <div style="display:flex;align-items:center;gap:5px;"><span style="font-size:.95rem;">😀</span><span id="pm-lives" style="font-family:'Share Tech Mono',monospace;font-size:.9rem;color:#ffd700;">× 3</span></div>
    <div id="pm-score" style="font-family:'Orbitron',sans-serif;font-size:.8rem;font-weight:900;color:#ffd700;letter-spacing:.1em;">0</div>
    <div id="pm-level" style="font-family:'Share Tech Mono',monospace;font-size:.72rem;color:rgba(255,255,255,.3);letter-spacing:.1em;">LVL 1</div>`;
  root.appendChild(hud);

  /* ══ MAZE ══ */
  const COLS = 28, ROWS = 31, TUNNEL_ROW = 14;
  // 0=open  1=wall  2=pellet  3=power  4=house-interior
  const BASE = [
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

  /* ── Cell size to fit available space ── */
  const availW = content.offsetWidth;
  const availH = content.offsetHeight - SA.t - 44; // DI + HUD
  const CELL   = Math.floor(Math.min(availW / COLS, availH / ROWS));
  const MW = CELL * COLS, MH = CELL * ROWS;
  cv.width = MW; cv.height = MH;
  cv.style.width = MW + 'px'; cv.style.height = MH + 'px';

  /* ══ STATE ══ */
  let maze, pelletsLeft, totalPellets;
  let score = 0, lives = 3, level = 1;
  let gameState = 'title'; // title | playing | dying | levelup | over
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
    if (ghost && v === 4 && mode !== 'eaten') return false;
    return true;
  };

  const resetMaze = () => {
    maze = BASE.map(r => [...r]);
    totalPellets = 0;
    maze.forEach(r => r.forEach(v => { if (v === 2 || v === 3) totalPellets++; }));
    pelletsLeft = totalPellets;
  };

  /* ══ PAC-MAN ══
     Tile-based: each step moves one tile.
     pR,pC = tile we are AT (or just left)
     pNR,pNC = tile we are moving TOWARD
     pProg 0→1 = progress between them
     When pProg hits 1: snap to pNR,pNC → pick next tile */

  let pR, pC, pNR, pNC, pProg;
  let pDR, pDC;   // current direction
  let qDR, qDC;   // queued direction from swipe
  let mouthA = 0.05, mouthDir = 1;

  const PAC_SPEED = 8.0; // tiles/sec

  const resetPac = () => {
    // Start at row 23, col 14 (verified open: value 0 or 2)
    // Find a guaranteed open cell near bottom center
    pR = 22; pC = 11; // row 22 is the T-bar, col 11 is value 2
    pNR = pR; pNC = pC;
    pProg = 1.0;   // start already "arrived" so pickNextPac runs immediately
    pDR = 0; pDC = 0;
    qDR = 0; qDC = 1; // initial queue: move right
  };

  const pickNextPac = () => {
    // Try queued direction
    if (qDR !== 0 || qDC !== 0) {
      const tr = pR + qDR, tc = wrapC(pC + qDC);
      if (!isWall(tr, tc)) {
        pDR = qDR; pDC = qDC;
        pNR = tr; pNC = pC + qDC; // use unwrapped so progress interpolates correctly
        pProg = 0;
        return;
      }
    }
    // Continue current direction
    if (pDR !== 0 || pDC !== 0) {
      const tr = pR + pDR, tc = wrapC(pC + pDC);
      if (!isWall(tr, tc)) {
        pNR = tr; pNC = pC + pDC;
        pProg = 0;
        return;
      }
    }
    // Stopped (wall ahead, no valid queue)
    pNR = pR; pNC = pC; pProg = 1.0;
  };

  const updatePac = dt => {
    // Mouth
    mouthA += mouthDir * dt * 4.0;
    if (mouthA > 0.7) mouthDir = -1;
    if (mouthA < 0.04) mouthDir = 1;

    if (pProg < 1.0) {
      pProg += PAC_SPEED * dt;
      if (pProg >= 1.0) {
        pProg = 1.0;
        // Arrived — snap row/col, handle tunnel
        pR = pNR;
        pC = wrapC(pNC);
        pNR = pR; pNC = pC;
        // Eat
        const v = maze[pR][pC];
        if (v === 2) {
          maze[pR][pC] = 0; score += 10; pelletsLeft--;
          if (pelletsLeft <= 0) { gameState = 'levelup'; haptic('success'); return; }
        } else if (v === 3) {
          maze[pR][pC] = 0; score += 50; pelletsLeft--;
          frightTotal = Math.max(5, 12 - (level - 1) * 1.5);
          frightSec   = frightTotal;
          eatCombo    = 0;
          ghosts.forEach(g => { if (g.mode !== 'eaten' && g.mode !== 'house') g.mode = 'frightened'; });
          if (pelletsLeft <= 0) { gameState = 'levelup'; haptic('success'); return; }
        }
        pickNextPac();
      }
    }
  };

  /* ══ GHOSTS ══ */
  const GHOST_DEF = [
    {name:'Blinky', color:'#ff0000', sr:11, sc:13, homeR:1,  homeC:26, delay:0 },
    {name:'Pinky',  color:'#ffb8ff', sr:13, sc:13, homeR:1,  homeC:1,  delay:3 },
    {name:'Inky',   color:'#00ffff', sr:13, sc:14, homeR:29, homeC:26, delay:7 },
    {name:'Clyde',  color:'#ffb852', sr:13, sc:11, homeR:29, homeC:1,  delay:11},
  ];

  const G_SPEED_NORM  = 6.5;
  const G_SPEED_FRIGHT= 3.5;
  const G_SPEED_EATEN = 14.0;

  let ghosts = [];

  const initGhosts = () => {
    ghosts = GHOST_DEF.map(d => ({
      ...d,
      r: d.sr, c: d.sc,
      nr: d.sr, nc: d.sc, prog: 1.0,
      dr: 0, dc: 0,
      mode: 'house',
      houseTimer: d.delay,
    }));
  };

  /* BFS: returns {dr,dc} of best first step from (sr,sc) toward (tr,tc).
     Never reverses (unless no other option). Returns random valid dir if target unreachable. */
  const DIRS = [{r:-1,c:0},{r:1,c:0},{r:0,c:-1},{r:0,c:1}];

  const bfs = (sr, sc, tr, tc, g) => {
    tr = Math.max(0, Math.min(ROWS-1, tr));
    tc = wrapC(tc);
    const key = (r,c) => r * COLS + wrapC(c);
    const visited = new Map(); // key → first-step {dr,dc}
    const queue = [{r:sr, c:sc, fdr:null, fdc:null}];
    visited.set(key(sr,sc), null);

    while (queue.length) {
      const cur = queue.shift();
      if (cur.r === tr && wrapC(cur.c) === tc) {
        return cur.fdr !== null ? {dr:cur.fdr,dc:cur.fdc} : {dr:0,dc:0};
      }
      if ((visited.get(key(cur.r,cur.c)) !== undefined ? visited.size : 0) > 450) break;
      for (const d of DIRS) {
        const nr = cur.r + d.r;
        const nc = cur.c + d.c;
        const nk = key(nr,nc);
        if (visited.has(nk)) continue;
        if (!passable(nr, nc, true, g.mode)) continue;
        // No immediate reversal on first step
        if (cur.fdr === null && d.r === -g.dr && d.c === -g.dc) continue;
        visited.set(nk, true);
        const fdr = cur.fdr !== null ? cur.fdr : d.r;
        const fdc = cur.fdc !== null ? cur.fdc : d.c;
        queue.push({r:nr, c:nc, fdr, fdc});
      }
    }
    // Fallback: any non-reverse valid direction
    for (const d of DIRS) {
      if (d.r === -g.dr && d.c === -g.dc) continue;
      if (passable(sr + d.r, sc + d.c, true, g.mode)) return {dr:d.r,dc:d.c};
    }
    // Last resort: even reverse
    for (const d of DIRS) {
      if (passable(sr + d.r, sc + d.c, true, g.mode)) return {dr:d.r,dc:d.c};
    }
    return {dr:0,dc:0};
  };

  const ghostTarget = g => {
    const pr = pR, pc = pC;
    if (g.mode === 'scatter')    return {r:g.homeR,c:g.homeC};
    if (g.mode === 'frightened') return {r:g.homeR,c:g.homeC}; // BFS will avoid – we randomize below
    if (g.mode === 'eaten')      return {r:11,c:13};
    // Chase
    if (g.name==='Blinky') return {r:pr,c:pc};
    if (g.name==='Pinky')  return {r:pr+pDR*4,c:pc+pDC*4};
    if (g.name==='Inky')   {
      const b=ghosts[0];
      return {r:pr+pDR*2+(pr+pDR*2-b.r),c:pc+pDC*2+(pc+pDC*2-b.c)};
    }
    if (g.name==='Clyde')  {
      const dist=Math.abs(g.r-pr)+Math.abs(g.c-pc);
      return dist>8?{r:pr,c:pc}:{r:g.homeR,c:g.homeC};
    }
    return {r:pr,c:pc};
  };

  const gSpeed = g => {
    if (g.mode === 'frightened') return G_SPEED_FRIGHT + (level-1)*0.2;
    if (g.mode === 'eaten')      return G_SPEED_EATEN;
    if (g.mode === 'house')      return 2.5;
    return G_SPEED_NORM + (level-1)*0.25;
  };

  /* Pick next tile for a ghost that has arrived */
  const pickNextGhost = g => {
    if (g.mode === 'house') {
      // Move up to exit
      if (g.r > 11) { g.nr = g.r - 1; g.nc = g.c; g.dr = -1; g.dc = 0; }
      else { g.mode = 'scatter'; g.nr = g.r; g.nc = g.c; g.dr = 0; g.dc = 0; }
      g.prog = 0; return;
    }

    let step;
    if (g.mode === 'frightened') {
      // Random non-reverse direction
      const valid = DIRS.filter(d => d.r !== -g.dr || d.c !== -g.dc)
                        .filter(d => passable(g.r+d.r, g.c+d.c, true, g.mode));
      if (valid.length) {
        const d = valid[Math.floor(Math.random() * valid.length)];
        step = {dr:d.r, dc:d.c};
      } else {
        step = bfs(g.r, g.c, g.homeR, g.homeC, g);
      }
    } else {
      const t = ghostTarget(g);
      step = bfs(g.r, g.c, t.r, t.c, g);
    }

    if (step.dr !== 0 || step.dc !== 0) {
      const nr = g.r + step.dr, nc = g.c + step.dc;
      if (passable(nr, nc, true, g.mode)) {
        g.dr = step.dr; g.dc = step.dc;
        g.nr = nr; g.nc = nc; g.prog = 0;
        return;
      }
    }
    // Truly stuck — stay
    g.nr = g.r; g.nc = g.c; g.prog = 1.0;
  };

  let modeTimer = 0;
  const MODE_SCHED = [[7,20],[7,20],[5,999]]; // [scatter, chase] seconds per phase

  const updateGhosts = dt => {
    // Fright timer
    if (frightSec > 0) {
      frightSec -= dt;
      if (frightSec <= 0) {
        frightSec = 0;
        ghosts.forEach(g => { if (g.mode === 'frightened') g.mode = 'chase'; });
      }
    } else {
      // Scatter/chase cycling
      modeTimer += dt;
      const sch = MODE_SCHED[Math.min(level-1, MODE_SCHED.length-1)];
      const cycle = sch[0] + sch[1];
      const pos = modeTimer % cycle;
      const wantMode = pos < sch[0] ? 'scatter' : 'chase';
      ghosts.forEach(g => {
        if (g.mode === 'chase' || g.mode === 'scatter') g.mode = wantMode;
      });
    }

    ghosts.forEach(g => {
      // House delay countdown
      if (g.mode === 'house') {
        g.houseTimer -= dt;
        if (g.houseTimer > 0) return; // still waiting
        // Start exiting
      }

      g.prog += gSpeed(g) * dt;
      if (g.prog >= 1.0) {
        g.prog = 1.0;
        g.r = g.nr; g.c = wrapC(g.nc);
        g.nr = g.r; g.nc = g.c;

        // Tunnel wrap
        if (g.r === TUNNEL_ROW) {
          if (g.c <= 0)        g.c = COLS - 1;
          if (g.c >= COLS - 1) g.c = 0;
          g.nr = g.r; g.nc = g.c;
        }

        // Eaten ghost arrives at house entrance
        if (g.mode === 'eaten' && g.r === 11 && wrapC(g.c) === 13) {
          g.mode = 'scatter'; g.dr = 0; g.dc = 0;
        }

        pickNextGhost(g);
      }
    });
  };

  /* ══ COLLISIONS ══ */
  const checkCollisions = () => {
    ghosts.forEach(g => {
      if (g.mode === 'house' || g.mode === 'eaten') return;
      // Check tile proximity
      const gr = Math.round(g.r + (g.nr - g.r) * g.prog);
      const gc = wrapC(Math.round(g.c + (g.nc - g.c) * g.prog));
      const pr = Math.round(pR + (pNR - pR) * Math.min(pProg,1));
      const pc = wrapC(Math.round(pC + (pNC - pC) * Math.min(pProg,1)));
      if (Math.abs(gr - pr) <= 1 && Math.abs(gc - pc) <= 1 && Math.abs(gr-pr)+Math.abs(gc-pc) < 2) {
        if (g.mode === 'frightened') {
          eatCombo++; const pts=[200,400,800,1600][Math.min(eatCombo-1,3)]; score+=pts; g.mode='eaten'; haptic('light');
        } else {
          if (gameState !== 'playing') return;
          gameState = 'dying'; haptic('heavy');
        }
      }
    });
  };

  /* ══ DRAW ══ */
  const drawMaze = () => {
    ctx.fillStyle = '#000'; ctx.fillRect(0,0,MW,MH);
    for (let r=0;r<ROWS;r++) for (let c=0;c<COLS;c++) {
      const v=maze[r][c], x=c*CELL, y=r*CELL;
      if (v===1) {
        ctx.fillStyle='#1a1acc'; ctx.fillRect(x,y,CELL,CELL);
        ctx.strokeStyle='#3333ff'; ctx.lineWidth=0.8;
        ctx.strokeRect(x+.5,y+.5,CELL-1,CELL-1);
      } else if (v===2) {
        ctx.beginPath(); ctx.arc(x+CELL/2,y+CELL/2,CELL*.1,0,Math.PI*2);
        ctx.fillStyle='#ffb8ae'; ctx.fill();
      } else if (v===3) {
        const p=.65+.35*Math.sin(lastTS*.006);
        ctx.beginPath(); ctx.arc(x+CELL/2,y+CELL/2,CELL*.28*p,0,Math.PI*2);
        ctx.fillStyle='#ffb8ae'; ctx.shadowColor='#ffb8ae'; ctx.shadowBlur=8; ctx.fill(); ctx.shadowBlur=0;
      }
    }
  };

  const drawPac = () => {
    const t = Math.min(pProg, 1);
    const x = (pC + (pNC - pC) * t) * CELL + CELL/2;
    const y = (pR + (pNR - pR) * t) * CELL + CELL/2;
    const r = CELL * .44;
    let rot = pDC===1?0:pDC===-1?Math.PI:pDY===-1?-Math.PI/2:pDR===1?Math.PI/2:Math.PI;
    if (pDR===1) rot=Math.PI/2;
    if (pDR===-1)rot=-Math.PI/2;
    if (pDC===1) rot=0;
    if (pDC===-1)rot=Math.PI;
    if (pDR===0&&pDC===0) rot=Math.PI;

    ctx.save(); ctx.translate(x,y); ctx.rotate(rot);
    ctx.beginPath(); ctx.moveTo(0,0); ctx.arc(0,0,r,mouthA,Math.PI*2-mouthA); ctx.closePath();
    ctx.fillStyle='#ffd700'; ctx.shadowColor='#ffd700'; ctx.shadowBlur=6; ctx.fill(); ctx.shadowBlur=0;
    ctx.restore();
  };

  const drawGhosts = () => {
    ghosts.forEach(g => {
      const t = Math.min(g.prog,1);
      const x = (g.c + (g.nc - g.c) * t) * CELL + CELL/2;
      const y = (g.r + (g.nr - g.r) * t) * CELL + CELL/2;
      const r = CELL * .44;
      const fright   = g.mode === 'frightened';
      const eaten    = g.mode === 'eaten';
      const flashing = fright && frightSec < frightTotal*.35 && Math.floor(lastTS*.004)%2===0;

      if (eaten) {
        ctx.fillStyle='#fff';
        [-0.2,0.2].forEach(ox=>{
          ctx.beginPath();ctx.arc(x+ox*CELL,y-.08*CELL,CELL*.09,0,Math.PI*2);ctx.fill();
          ctx.fillStyle='#00f';ctx.beginPath();ctx.arc(x+ox*CELL+g.dc*CELL*.04,y-.08*CELL+g.dr*CELL*.04,CELL*.05,0,Math.PI*2);ctx.fill();
          ctx.fillStyle='#fff';
        });
        return;
      }
      const col = fright?(flashing?'#fff':'#0000bb'):g.color;
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
      ctx.fillStyle='rgba(0,0,0,.75)';ctx.fillRect(0,0,MW,MH);
      ctx.textAlign='center';ctx.textBaseline='middle';
      ctx.font=`900 ${CELL*1.1}px 'Orbitron',sans-serif`;
      ctx.fillStyle=c1;ctx.shadowColor=c1;ctx.shadowBlur=20;ctx.fillText(t1,MW/2,MH*.36);ctx.shadowBlur=0;
      if(t2){ctx.font=`${CELL*.7}px 'Share Tech Mono',monospace`;ctx.fillStyle=c2;ctx.fillText(t2,MW/2,MH*.5);}
      if(t3){ctx.font=`${CELL*.5}px 'Share Tech Mono',monospace`;ctx.fillStyle='rgba(255,255,255,.3)';ctx.fillText(t3,MW/2,MH*.62);}
    };
    if(gameState==='title'){
      ctx.fillStyle='rgba(0,0,0,.65)';ctx.fillRect(0,0,MW,MH);
      ctx.textAlign='center';ctx.textBaseline='middle';
      ctx.font=`900 ${CELL*1.1}px 'Orbitron',sans-serif`;
      ctx.fillStyle='#ffd700';ctx.shadowColor='#ffd700';ctx.shadowBlur=22;ctx.fillText('PAC-MAN',MW/2,MH*.34);ctx.shadowBlur=0;
      ctx.font=`${CELL*.62}px 'Share Tech Mono',monospace`;ctx.fillStyle='rgba(255,255,255,.7)';ctx.fillText('SWIPE TO START',MW/2,MH*.47);
      ctx.font=`${CELL*.46}px 'Share Tech Mono',monospace`;ctx.fillStyle='rgba(255,255,255,.27)';ctx.fillText('Swipe to steer  ·  Queue turns ahead',MW/2,MH*.57);
    }
    if(gameState==='over')    box('GAME OVER','#ff4af8',score.toLocaleString(),'#ffd700','SWIPE TO RETRY');
    if(gameState==='levelup') box('LEVEL '+level,'#00ffcc','','','SWIPE TO CONTINUE');
    if(gameState==='dying'){ctx.fillStyle='rgba(255,0,0,.12)';ctx.fillRect(0,0,MW,MH);}
  };

  const updateHUD = () => {
    document.getElementById('pm-score').textContent = score.toLocaleString();
    document.getElementById('pm-lives').textContent = '× ' + lives;
    document.getElementById('pm-level').textContent = 'LVL ' + level;
  };

  /* ══ GAME LOOP ══ */
  let dyingTimer = 0;

  const loop = ts => {
    const dt = Math.min((ts - lastTS) / 1000, 0.05); // seconds, max 50ms
    lastTS = ts;

    if (gameState === 'playing') {
      updatePac(dt);
      updateGhosts(dt);
      checkCollisions();
    }

    if (gameState === 'dying') {
      dyingTimer -= dt;
      if (dyingTimer <= 0) {
        lives--;
        if (lives <= 0) { gameState = 'over'; }
        else { resetPositions(); gameState = 'title'; }
        updateHUD();
      }
    }

    drawMaze();
    if (gameState !== 'over') drawPac();
    drawGhosts();
    drawOverlay();
    updateHUD();

    raf = requestAnimationFrame(loop);
  };

  const resetPositions = () => {
    resetPac();
    initGhosts();
    frightSec = 0; eatCombo = 0; modeTimer = 0;
  };

  /* ══ SWIPE — on canvas element ══ */
  let swX = null, swY = null;

  const handleSwipeDir = (dx, dy) => {
    if (Math.max(Math.abs(dx), Math.abs(dy)) < 14) return;

    if (gameState === 'title') {
      gameState = 'playing';
    } else if (gameState === 'over') {
      score=0; lives=3; level=1; resetMaze(); resetPositions(); gameState='playing';
    } else if (gameState === 'levelup') {
      level++; resetMaze(); resetPositions(); gameState='playing'; frightSec=0;
    }

    if (Math.abs(dx) > Math.abs(dy)) { qDR=0; qDC=dx>0?1:-1; }
    else                              { qDR=dy>0?1:-1; qDC=0; }
    haptic('light');
  };

  cv.addEventListener('touchstart', e => {
    e.preventDefault();
    const t = e.touches[0]; swX=t.clientX; swY=t.clientY;
  }, { passive:false });

  cv.addEventListener('touchend', e => {
    if (swX===null) return;
    e.preventDefault();
    const t = e.changedTouches[0];
    handleSwipeDir(t.clientX-swX, t.clientY-swY);
    swX=null; swY=null;
  }, { passive:false });

  // Also catch swipes that start outside canvas (common on mobile)
  root.addEventListener('touchstart', e => {
    const t=e.touches[0]; swX=t.clientX; swY=t.clientY;
  }, { passive:true });
  root.addEventListener('touchend', e => {
    if (swX===null) return;
    const t=e.changedTouches[0];
    handleSwipeDir(t.clientX-swX, t.clientY-swY);
    swX=null; swY=null;
  }, { passive:true });

  const onKey = e => {
    const map={ArrowLeft:[0,-1],ArrowRight:[0,1],ArrowUp:[-1,0],ArrowDown:[1,0]};
    const d=map[e.key]; if(!d)return; e.preventDefault();
    handleSwipeDir(d[1]*50, d[0]*50);
  };
  document.addEventListener('keydown', onKey);

  /* ── Boot ── */
  resetMaze();
  resetPac();
  initGhosts();
  lastTS = performance.now();
  raf = requestAnimationFrame(loop);

  return () => { cancelAnimationFrame(raf); document.removeEventListener('keydown',onKey); };
}
