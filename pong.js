/* ════════════ PONG ════════════ */
function initPong() {
  const cv = document.createElement('canvas');
  cv.id = 'pong-cv';
  content.appendChild(cv);
  const W = cv.width = content.offsetWidth;
  const H = cv.height = content.offsetHeight;
  const ctx = cv.getContext('2d');

  const HT = SA.t + 70, HB = SA.b + 50;
  const PW = 90, PH = 13, BR = 8, CPUSP = 3.8;
  const PLY = H - HB - 10, CPU_Y = HT;
  let ball, pX, cX, pSc, cSc, raf, state;

  // Rounded rect helper
  const rr = (x, y, w, h, r) => {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + w - r, y); ctx.quadraticCurveTo(x + w, y, x + w, y + r);
    ctx.lineTo(x + w, y + h - r); ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    ctx.lineTo(x + r, y + h); ctx.quadraticCurveTo(x, y + h, x, y + h - r);
    ctx.lineTo(x, y + r); ctx.quadraticCurveTo(x, y, x + r, y);
    ctx.closePath();
  };

  const serve = toP => {
    const a = (Math.random() * .6 + .2) * Math.PI * (toP ? 1 : -1) * (Math.random() > .5 ? 1 : -1);
    ball = { x: W/2, y: H/2, vx: Math.cos(a) * 5.5, vy: Math.sin(a) * 5.5 * (toP ? 1 : -1) };
  };

  const full = () => { pSc = 0; cSc = 0; pX = W/2; cX = W/2; serve(true); state = 'play'; };
  full();

  const onMv = e => {
    const rc = cv.getBoundingClientRect();
    const t = e.touches ? e.touches[0] : e;
    pX = Math.max(PW/2, Math.min(W - PW/2, (t.clientX - rc.left) * (W / rc.width)));
  };
  cv.addEventListener('mousemove', onMv);
  cv.addEventListener('touchmove', e => { e.preventDefault(); onMv(e); }, { passive: false });
  cv.addEventListener('click', () => { if (state === 'over') full(); });
  cv.addEventListener('touchstart', e => { e.preventDefault(); if (state === 'over') full(); }, { passive: false });

  const loop = () => {
    ctx.fillStyle = '#050508'; ctx.fillRect(0, 0, W, H);

    // Center dashed line
    ctx.setLineDash([8, 8]); ctx.strokeStyle = 'rgba(0,255,204,.1)'; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(0, H/2); ctx.lineTo(W, H/2); ctx.stroke();
    ctx.setLineDash([]);

    if (state === 'play') {
      // CPU AI
      if (cX < ball.x - CPUSP) cX += CPUSP;
      else if (cX > ball.x + CPUSP) cX -= CPUSP;
      cX = Math.max(PW/2, Math.min(W - PW/2, cX));

      ball.x += ball.vx; ball.y += ball.vy;

      // Wall bounces
      if (ball.x - BR < 0) { ball.x = BR; ball.vx *= -1; }
      if (ball.x + BR > W) { ball.x = W - BR; ball.vx *= -1; }

      // Player paddle
      if (ball.vy > 0 && ball.y + BR >= PLY && ball.y + BR <= PLY + PH + 4 &&
          ball.x >= pX - PW/2 && ball.x <= pX + PW/2) {
        ball.y = PLY - BR; ball.vy = -Math.abs(ball.vy) * 1.04;
        ball.vx += (ball.x - pX) / (PW/2) * 2.5;
        ball.vy = Math.max(ball.vy, -13);
      }
      // CPU paddle
      if (ball.vy < 0 && ball.y - BR <= CPU_Y + PH + 4 && ball.y - BR >= CPU_Y - 4 &&
          ball.x >= cX - PW/2 && ball.x <= cX + PW/2) {
        ball.vy = Math.abs(ball.vy) * 1.04;
        ball.vx += (ball.x - cX) / (PW/2) * 2.5;
        ball.vy = Math.min(ball.vy, 13);
      }

      // Score
      if (ball.y > H - HB + BR) { cSc++; serve(false); if (cSc >= 7) state = 'over'; }
      if (ball.y < HT - BR)      { pSc++; serve(true);  if (pSc >= 7) state = 'over'; }
    }

    // Draw paddles
    rr(pX - PW/2, PLY, PW, PH, PH/2);
    ctx.fillStyle = '#00ffcc'; ctx.shadowColor = '#00ffcc'; ctx.shadowBlur = 16; ctx.fill(); ctx.shadowBlur = 0;

    rr(cX - PW/2, CPU_Y, PW, PH, PH/2);
    ctx.fillStyle = '#ff4af8'; ctx.shadowColor = '#ff4af8'; ctx.shadowBlur = 16; ctx.fill(); ctx.shadowBlur = 0;

    // Draw ball
    ctx.beginPath(); ctx.arc(ball.x, ball.y, BR, 0, Math.PI * 2);
    ctx.fillStyle = '#fff'; ctx.shadowColor = 'rgba(255,255,255,.9)'; ctx.shadowBlur = 22; ctx.fill(); ctx.shadowBlur = 0;

    // Scores
    ctx.font = `bold 30px 'Orbitron'`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillStyle = 'rgba(255,74,248,.55)'; ctx.fillText(cSc, W * .25, H / 2);
    ctx.fillStyle = 'rgba(0,255,204,.55)';  ctx.fillText(pSc, W * .75, H / 2);

    if (state === 'over') {
      ctx.fillStyle = 'rgba(5,5,8,.82)'; ctx.fillRect(0, 0, W, H);
      const won = pSc >= 7;
      ctx.fillStyle = won ? '#00ffcc' : '#ff4af8';
      ctx.shadowColor = ctx.fillStyle; ctx.shadowBlur = 24;
      ctx.font = `bold 32px 'Orbitron'`; ctx.textBaseline = 'middle';
      ctx.fillText(won ? 'YOU WIN!' : 'CPU WINS', W / 2, H / 2 - 44);
      ctx.fillStyle = 'rgba(200,232,255,.65)'; ctx.shadowBlur = 0;
      ctx.font = `12px 'Orbitron'`; ctx.fillText('TAP TO PLAY AGAIN', W / 2, H / 2 + 44);
    }

    raf = requestAnimationFrame(loop);
  };

  loop();
  return () => cancelAnimationFrame(raf);
}
