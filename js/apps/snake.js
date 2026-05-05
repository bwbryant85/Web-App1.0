/* ════════════ SNAKE ════════════ */
function initSnake() {
  const wrap = document.createElement('div');
  wrap.className = 'snake-wrap';
  content.appendChild(wrap);

  const hud = document.createElement('div');
  hud.id = 'snake-hud';
  hud.textContent = 'SCORE: 0';
  wrap.appendChild(hud);

  const cv = document.createElement('canvas');
  cv.id = 'snake-cv';
  wrap.appendChild(cv);

  const dpad = document.createElement('div');
  dpad.className = 'snake-dpad';
  dpad.innerHTML = `<div></div><button class="dpad-btn" data-d="up">▲</button><div></div><button class="dpad-btn" data-d="left">◀</button><button class="dpad-btn" data-d="down">▼</button><button class="dpad-btn" data-d="right">▶</button>`;
  wrap.appendChild(dpad);

  const CELL = 17;
  const avW = content.offsetWidth - SA.l - SA.r;
  const avH = content.offsetHeight - SA.t - SA.b - 36 - 148 - 90;
  const COLS = Math.floor(avW / CELL);
  const ROWS = Math.floor(Math.max(avH, CELL * 6) / CELL);
  cv.width = COLS * CELL;
  cv.height = ROWS * CELL;
  const ctx = cv.getContext('2d');

  let snake, dir, nextDir, food, score, gloop;

  const reset = () => {
    const sx = Math.floor(COLS / 2), sy = Math.floor(ROWS / 2);
    snake = [{ x:sx, y:sy }, { x:sx-1, y:sy }, { x:sx-2, y:sy }];
    dir = { x:1, y:0 }; nextDir = { x:1, y:0 };
    score = 0; hud.textContent = 'SCORE: 0';
    const ov = wrap.querySelector('.snake-over');
    if (ov) ov.remove();
    placeFood(); draw();
  };

  const placeFood = () => {
    let p;
    do { p = { x: Math.floor(Math.random() * COLS), y: Math.floor(Math.random() * ROWS) }; }
    while (snake.some(s => s.x === p.x && s.y === p.y));
    food = p;
  };

  const draw = () => {
    ctx.fillStyle = '#050508'; ctx.fillRect(0, 0, cv.width, cv.height);
    ctx.strokeStyle = 'rgba(0,255,204,.025)'; ctx.lineWidth = .5;
    for (let x = 0; x <= COLS; x++) { ctx.beginPath(); ctx.moveTo(x*CELL,0); ctx.lineTo(x*CELL,cv.height); ctx.stroke(); }
    for (let y = 0; y <= ROWS; y++) { ctx.beginPath(); ctx.moveTo(0,y*CELL); ctx.lineTo(cv.width,y*CELL); ctx.stroke(); }

    const fc = food.x * CELL + CELL/2, fr = food.y * CELL + CELL/2;
    ctx.beginPath(); ctx.arc(fc, fr, CELL/2-2, 0, Math.PI*2);
    ctx.fillStyle = '#ff4af8'; ctx.shadowColor = '#ff4af8'; ctx.shadowBlur = 20; ctx.fill(); ctx.shadowBlur = 0;

    snake.forEach((s, i) => {
      const bright = 1 - i / snake.length * .7;
      ctx.fillStyle = `rgba(0,${Math.round(200 + bright*55)},${Math.round(100 + bright*100)},${bright})`;
      ctx.shadowColor = '#00ffcc'; ctx.shadowBlur = i === 0 ? 20 : 4;
      ctx.fillRect(s.x*CELL+1, s.y*CELL+1, CELL-2, CELL-2);
    });
    ctx.shadowBlur = 0;
  };

  const step = () => {
    dir = nextDir;
    const head = { x:(snake[0].x + dir.x + COLS) % COLS, y:(snake[0].y + dir.y + ROWS) % ROWS };
    if (snake.some(s => s.x === head.x && s.y === head.y)) { gameOver(); return; }
    snake.unshift(head);
    if (head.x === food.x && head.y === food.y) { score++; hud.textContent = `SCORE: ${score}`; placeFood(); }
    else snake.pop();
    draw();
  };

  const gameOver = () => {
    clearInterval(gloop);
    if (window.POS) POS.submitScore('snake', score);
    const best = window.POS ? POS.getHighScore('snake') : score;
    const ov = document.createElement('div');
    ov.className = 'snake-over';
    ov.innerHTML = `<h2>GAME OVER</h2><div class="sco">SCORE: ${score}</div><div class="sco" style="font-size:.7rem;opacity:.6;margin-top:4px;">BEST: ${best}</div><button class="cyan-btn" id="snk-r">PLAY AGAIN</button>`;
    wrap.appendChild(ov);
    document.getElementById('snk-r').onclick = () => { reset(); gloop = setInterval(step, 115); };
  };

  const dm = { up:{x:0,y:-1}, down:{x:0,y:1}, left:{x:-1,y:0}, right:{x:1,y:0} };
  const setDir = d => {
    const nd = dm[d]; if (!nd) return;
    if (dir.x === -nd.x && dir.y === -nd.y) return;
    nextDir = nd;
  };

  dpad.querySelectorAll('.dpad-btn').forEach(b => {
    b.addEventListener('touchstart', e => { e.preventDefault(); setDir(b.dataset.d); }, { passive:false });
    b.addEventListener('mousedown', () => { haptic('light'); setDir(b.dataset.d); });
  });

  const hKey = e => {
    const m = { ArrowUp:'up', ArrowDown:'down', ArrowLeft:'left', ArrowRight:'right' };
    if (m[e.key]) { e.preventDefault(); setDir(m[e.key]); }
  };
  document.addEventListener('keydown', hKey);

  reset();
  gloop = setInterval(step, 115);
  return () => { clearInterval(gloop); document.removeEventListener('keydown', hKey); };
}
