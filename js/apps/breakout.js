/* ════════════ BREAKOUT (physics + powerups) ════════════ */
function initBreakout() {
  const cv = document.createElement('canvas');
  cv.id = 'brk-cv';
  content.appendChild(cv);
  const W = cv.width = content.offsetWidth;
  const H = cv.height = content.offsetHeight;
  const ctx = cv.getContext('2d');

  const TOP = SA.t + 70, BOT = SA.b + 65;
  const ROWS_B = 6, COLS_B = 8;
  const BW = (W - 12) / COLS_B, BH = 22, B_TOP = TOP + 4;
  const BRICK_COLS = ['#ff4af8','#ff6b6b','#ffd740','#69ff47','#00ffcc','#81d4fa'];
  const DEF_PW = W * .3, PAD_H = 13, BAL_R = 8;
  const PAD_Y = H - BOT - PAD_H;

  const GOOD = [
    { id:'WIDE', lbl:'⟺ WIDE', col:'#00ffcc' },
    { id:'BALL', lbl:'⊕ +BALL', col:'#69ff47' },
    { id:'LIFE', lbl:'♥ +LIFE', col:'#ff69b4' },
    { id:'SLOW', lbl:'🐌 SLOW', col:'#81d4fa' },
  ];
  const BAD = [
    { id:'NARR',  lbl:'⟺ NARR',  col:'#ff4af8' },
    { id:'KILL',  lbl:'☠ -LIFE', col:'#ff6d6d' },
    { id:'FAST',  lbl:'⚡ FAST',  col:'#ffd740' },
    { id:'GHOST', lbl:'👻 GHOST', col:'#ce93d8' },
  ];

  let balls, padX, padW, lives, bricks, drops, state, lvl, score, ghostUntil, msg, msgUntil, raf;

  const makeBricks = () => {
    bricks = [];
    for (let r = 0; r < ROWS_B; r++) {
      for (let c = 0; c < COLS_B; c++) {
        const rnd = Math.random();
        const fx = rnd < .08 ? GOOD[Math.floor(Math.random() * GOOD.length)]
                 : rnd < .18 ? BAD[Math.floor(Math.random() * BAD.length)]
                 : null;
        bricks.push({ x: 6 + c * BW, y: B_TOP + r * BH, w: BW - 4, h: BH - 3, alive: true, col: BRICK_COLS[r], fx });
      }
    }
  };

  const newBall = () => ({ x: padX, y: PAD_Y - 20, vx: (Math.random() > .5 ? 1 : -1) * (3.5 + lvl * .3), vy: -(5 + lvl * .4) });

  const full = () => {
    lives = 3; score = 0; lvl = 1; padX = W/2; padW = DEF_PW;
    ghostUntil = 0; drops = []; makeBricks(); balls = [newBall()]; state = 'play';
  };
  full();

  const onMv = e => {
    const rc = cv.getBoundingClientRect();
    const t = e.touches ? e.touches[0] : e;
    padX = Math.max(padW/2, Math.min(W - padW/2, (t.clientX - rc.left) * (W / rc.width)));
  };
  cv.addEventListener('mousemove', onMv);
  cv.addEventListener('touchmove', e => { e.preventDefault(); onMv(e); }, { passive: false });
  cv.addEventListener('click', () => { if (state !== 'play') full(); });
  cv.addEventListener('touchstart', e => { e.preventDefault(); if (state !== 'play') full(); }, { passive: false });

  const applyFX = fx => {
    const now = performance.now();
    msg = fx.lbl; msgUntil = now + 2000;
    if      (fx.id === 'WIDE') { padW = Math.min(DEF_PW * 1.7, W * .55); setTimeout(() => padW = DEF_PW, 7000); }
    else if (fx.id === 'NARR') { padW = Math.max(DEF_PW * .45, 44);     setTimeout(() => padW = DEF_PW, 6000); }
    else if (fx.id === 'BALL' && balls.length < 6) { balls.push({ x: padX, y: PAD_Y - 30, vx: (Math.random() - .5) * 8, vy: -(5 + Math.random() * 3) }); }
    else if (fx.id === 'LIFE') { lives = Math.min(lives + 1, 5); }
    else if (fx.id === 'KILL') { lives--; if (lives <= 0) state = 'dead'; }
    else if (fx.id === 'SLOW') {
      balls.forEach(b => {
        const sp = Math.sqrt(b.vx*b.vx + b.vy*b.vy);
        if (sp > 1) { const a = Math.atan2(b.vy, b.vx); b.vx = Math.cos(a) * Math.max(sp * .6, 2); b.vy = Math.sin(a) * Math.max(sp * .6, 2); }
        if (Math.abs(b.vy) < 1.5) b.vy = b.vy > 0 ? 1.5 : -1.5;
      });
    }
    else if (fx.id === 'FAST') {
      balls.forEach(b => {
        const sp = Math.min(Math.sqrt(b.vx*b.vx + b.vy*b.vy) * 1.4, 16);
        const a = Math.atan2(b.vy, b.vx); b.vx = Math.cos(a) * sp; b.vy = Math.sin(a) * sp;
      });
    }
    else if (fx.id === 'GHOST') { ghostUntil = now + 4000; }
  };

  const loop = () => {
    ctx.fillStyle = '#050508'; ctx.fillRect(0, 0, W, H);
    const now = performance.now();

    if (state === 'play') {
      // Update balls
      for (let bi = balls.length - 1; bi >= 0; bi--) {
        const b = balls[bi];
        b.x += b.vx; b.y += b.vy;
        if (b.x - BAL_R < 0) { b.x = BAL_R; b.vx = Math.abs(b.vx); }
        if (b.x + BAL_R > W) { b.x = W - BAL_R; b.vx = -Math.abs(b.vx); }
        if (b.y - BAL_R < TOP) { b.y = TOP + BAL_R; b.vy = Math.abs(b.vy); }

        const ghost = now < ghostUntil;
        if (!ghost && b.vy > 0 && b.y + BAL_R >= PAD_Y && b.y + BAL_R <= PAD_Y + PAD_H + 8 &&
            b.x + BAL_R > padX - padW/2 && b.x - BAL_R < padX + padW/2) {
          b.y = PAD_Y - BAL_R; b.vy = -Math.abs(b.vy) * 1.03;
          b.vx += (b.x - padX) / (padW/2) * 2;
          const sp = Math.sqrt(b.vx*b.vx + b.vy*b.vy);
          if (sp > 15) { b.vx *= 15/sp; b.vy *= 15/sp; }
        }

        if (b.y > H + BAL_R) {
          balls.splice(bi, 1);
          if (balls.length === 0) { lives--; if (lives <= 0) { state = 'dead'; if (window.POS) POS.submitScore('breakout', score); } else balls = [newBall()]; }
          continue;
        }

        // Brick collisions
        for (const br of bricks) {
          if (!br.alive) continue;
          if (b.x + BAL_R > br.x && b.x - BAL_R < br.x + br.w &&
              b.y + BAL_R > br.y && b.y - BAL_R < br.y + br.h) {
            br.alive = false; score += 10;
            if (br.fx) drops.push({ x: br.x + br.w/2, y: br.y + br.h, vy: 3, ...br.fx });
            const oL = b.x + BAL_R - br.x, oR = br.x + br.w - (b.x - BAL_R);
            const oT = b.y + BAL_R - br.y, oB = br.y + br.h - (b.y - BAL_R);
            if (Math.min(oL, oR) < Math.min(oT, oB)) { b.vx *= -1; b.x += b.vx > 0 ? oL : -oR; }
            else { b.vy *= -1; b.y += b.vy > 0 ? oT : -oB; }
            break;
          }
        }
      }

      // Drops
      for (let i = drops.length - 1; i >= 0; i--) {
        const d = drops[i]; d.y += d.vy;
        if (d.y > H + 20) { drops.splice(i, 1); continue; }
        if (d.y >= PAD_Y - 10 && d.y <= PAD_Y + PAD_H + 14 && Math.abs(d.x - padX) < padW/2 + 20) {
          applyFX(d); drops.splice(i, 1);
        }
      }

      if (bricks.every(b => !b.alive)) { lvl++; makeBricks(); balls = [newBall()]; }
    }

    // Draw bricks
    bricks.forEach(b => {
      if (!b.alive) return;
      ctx.fillStyle = b.col; ctx.shadowColor = b.col; ctx.shadowBlur = b.fx ? 16 : 5;
      ctx.fillRect(b.x, b.y, b.w, b.h);
      if (b.fx) {
        ctx.shadowBlur = 0; ctx.fillStyle = 'rgba(255,255,255,.8)';
        ctx.font = '9px sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
        ctx.fillText(b.fx.lbl[0], b.x + b.w/2, b.y + b.h/2);
      }
      ctx.shadowBlur = 0;
    });

    // Draw drops
    drops.forEach(d => {
      ctx.beginPath(); ctx.arc(d.x, d.y, 11, 0, Math.PI * 2);
      ctx.fillStyle = d.col; ctx.shadowColor = d.col; ctx.shadowBlur = 14; ctx.fill(); ctx.shadowBlur = 0;
      ctx.fillStyle = 'rgba(0,0,0,.8)'; ctx.font = 'bold 8px sans-serif';
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(d.id[0], d.x, d.y);
    });

    // Paddle
    const ghost = now < ghostUntil;
    ctx.save(); if (ghost) ctx.globalAlpha = .35;
    ctx.beginPath();
    if (ctx.roundRect) ctx.roundRect(padX - padW/2, PAD_Y, padW, PAD_H, PAD_H/2);
    else ctx.rect(padX - padW/2, PAD_Y, padW, PAD_H);
    ctx.fillStyle = '#00ffcc'; ctx.shadowColor = '#00ffcc'; ctx.shadowBlur = 16; ctx.fill(); ctx.shadowBlur = 0;
    ctx.restore();

    // Balls
    balls.forEach(b => {
      ctx.beginPath(); ctx.arc(b.x, b.y, BAL_R, 0, Math.PI * 2);
      ctx.fillStyle = '#fff'; ctx.shadowColor = '#fff'; ctx.shadowBlur = 20; ctx.fill(); ctx.shadowBlur = 0;
    });

    // HUD
    ctx.shadowBlur = 0; ctx.font = `11px 'Orbitron'`; ctx.textBaseline = 'top';
    ctx.textAlign = 'left';  ctx.fillStyle = 'var(--dim)'; ctx.fillText(`LVL ${lvl}`, SA.l + 8, SA.t + 70);
    ctx.textAlign = 'center'; ctx.fillText(`${score}`, W/2, SA.t + 70);
    ctx.textAlign = 'right';  ctx.fillStyle = '#ff6b6b'; ctx.fillText('♥'.repeat(lives), W - SA.r - 8, SA.t + 70);

    // Effect message
    if (msg && now < msgUntil) {
      ctx.globalAlpha = Math.min(1, (msgUntil - now) / 350);
      ctx.font = `bold 15px 'Orbitron'`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      const bad = msg.includes('☠') || msg.includes('NARR') || msg.includes('FAST') || msg.includes('GHOST');
      ctx.fillStyle = bad ? '#ff4af8' : '#00ffcc';
      ctx.shadowColor = ctx.fillStyle; ctx.shadowBlur = 16;
      ctx.fillText(msg, W/2, PAD_Y - 30); ctx.shadowBlur = 0; ctx.globalAlpha = 1;
    }

    if (state === 'dead' || state === 'won') {
      ctx.globalAlpha = 1;
      ctx.fillStyle = 'rgba(5,5,8,.82)'; ctx.fillRect(0, 0, W, H);
      ctx.fillStyle = state === 'dead' ? '#ff4af8' : '#00ffcc';
      ctx.shadowColor = ctx.fillStyle; ctx.shadowBlur = 24;
      ctx.font = `bold 34px 'Orbitron'`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillText(state === 'dead' ? 'GAME OVER' : 'YOU WIN!', W/2, H/2 - 44);
      ctx.fillStyle = 'var(--cyan)'; ctx.shadowBlur = 0;
      ctx.font = `13px 'Share Tech Mono'`; ctx.fillText(`SCORE: ${score}`, W/2, H/2);
      ctx.fillStyle = 'rgba(0,255,204,.6)'; ctx.font = `11px 'Orbitron'`; ctx.fillText('TAP TO RETRY', W/2, H/2 + 44);
    }

    raf = requestAnimationFrame(loop);
  };

  loop();
  return () => cancelAnimationFrame(raf);
}
