/* ════════════ FLAPPY ════════════ */
function initFlappy() {
  const cv = document.createElement('canvas');
  cv.id = 'flap-cv';
  content.appendChild(cv);
  const W = cv.width = content.offsetWidth;
  const H = cv.height = content.offsetHeight;
  const ctx = cv.getContext('2d');

  const TOP = SA.t + 70; // score safely below Dynamic Island
  const GRAV = .48, FV = -9, PW = 58, GAP = 165, PSPD = 2.8, BX = W * .22, BR = 13;
  let bird, pipes, score, frame, state, raf;

  const reset = () => { bird = { y: H/2, vy: 0 }; pipes = []; score = 0; frame = 0; state = 'wait'; };
  const addPipe = () => {
    const gy = TOP + 60 + Math.random() * (H - TOP - 300);
    pipes.push({ x: W + PW, gy, passed: false });
  };
  const flap = () => {
    if (state === 'wait') state = 'play';
    if (state === 'play') bird.vy = FV;
    if (state === 'dead') reset();
  };

  cv.addEventListener('click', flap);
  cv.addEventListener('touchstart', e => { e.preventDefault(); flap(); }, { passive: false });

  const hit = () => {
    if (bird.y + BR > H - SA.b - 20 || bird.y - BR < TOP + 30) return true;
    for (const p of pipes) {
      if (BX + BR > p.x && BX - BR < p.x + PW) {
        if (bird.y - BR < p.gy || bird.y + BR > p.gy + GAP) return true;
      }
    }
    return false;
  };

  const dpipe = p => {
    const gr = ctx.createLinearGradient(p.x, 0, p.x + PW, 0);
    gr.addColorStop(0, '#00b894'); gr.addColorStop(1, '#00695c');
    ctx.fillStyle = gr; ctx.shadowColor = '#00ffcc'; ctx.shadowBlur = 8;
    ctx.fillRect(p.x, 0, PW, p.gy);
    ctx.fillRect(p.x, p.gy + GAP, PW, H);
    ctx.shadowBlur = 0;
    ctx.fillStyle = '#00977a';
    ctx.fillRect(p.x - 4, p.gy - 18, PW + 8, 18);
    ctx.fillRect(p.x - 4, p.gy + GAP, PW + 8, 18);
  };

  const loop = () => {
    ctx.fillStyle = '#050508'; ctx.fillRect(0, 0, W, H);
    // Stars
    for (let i = 0; i < 40; i++) {
      const sx = (i * 137) % W, sy = (i * 97) % H;
      ctx.fillStyle = 'rgba(200,232,255,.3)'; ctx.fillRect(sx, sy, 1, 1);
    }

    if (state === 'play') {
      bird.vy += GRAV; bird.y += bird.vy; frame++;
      if (frame % 90 === 0) addPipe();
      for (const p of pipes) {
        p.x -= PSPD;
        if (!p.passed && p.x + PW < BX) { p.passed = true; score++; }
      }
      pipes = pipes.filter(p => p.x > -PW - 10);
      if (hit()) state = 'dead';
    }

    pipes.forEach(dpipe);

    // Bird
    ctx.save();
    ctx.translate(BX, bird.y);
    ctx.rotate(Math.max(-.6, Math.min(Math.PI / 3, bird.vy * .07)));
    ctx.beginPath(); ctx.arc(0, 0, BR, 0, Math.PI * 2);
    ctx.fillStyle = '#ffd740'; ctx.shadowColor = '#ffeb3b'; ctx.shadowBlur = 18; ctx.fill(); ctx.shadowBlur = 0;
    ctx.beginPath(); ctx.arc(5, -4, 4, 0, Math.PI * 2); ctx.fillStyle = '#fff'; ctx.fill();
    ctx.beginPath(); ctx.arc(6, -4, 2, 0, Math.PI * 2); ctx.fillStyle = '#111'; ctx.fill();
    ctx.beginPath(); ctx.moveTo(11, 2); ctx.lineTo(18, 0); ctx.lineTo(11, -2);
    ctx.fillStyle = '#ff9800'; ctx.fill();
    ctx.restore();

    // Score
    ctx.font = `bold 26px 'Orbitron'`; ctx.textAlign = 'center'; ctx.textBaseline = 'top';
    ctx.fillStyle = 'var(--cyan)'; ctx.shadowColor = 'var(--cyan)'; ctx.shadowBlur = 12;
    ctx.fillText(score, W / 2, TOP - 45); ctx.shadowBlur = 0;

    if (state === 'wait') {
      ctx.fillStyle = 'rgba(0,255,204,.8)'; ctx.font = `14px 'Orbitron'`;
      ctx.textBaseline = 'middle'; ctx.fillText('TAP TO START', W / 2, H / 2 + 60);
    }
    if (state === 'dead') {
      ctx.fillStyle = 'rgba(5,5,8,.78)'; ctx.fillRect(0, 0, W, H);
      ctx.fillStyle = '#ff4af8'; ctx.shadowColor = '#ff4af8'; ctx.shadowBlur = 24;
      ctx.font = `bold 36px 'Orbitron'`; ctx.textBaseline = 'middle'; ctx.fillText('DEAD', W / 2, H / 2 - 50);
      ctx.fillStyle = 'var(--cyan)'; ctx.shadowColor = 'var(--cyan)'; ctx.shadowBlur = 10;
      ctx.font = `20px 'Share Tech Mono'`; ctx.fillText(`SCORE: ${score}`, W / 2, H / 2);
      ctx.fillStyle = 'rgba(0,255,204,.6)'; ctx.shadowBlur = 0;
      ctx.font = `12px 'Orbitron'`; ctx.fillText('TAP TO RETRY', W / 2, H / 2 + 50);
    }
    raf = requestAnimationFrame(loop);
  };

  reset(); loop();
  return () => cancelAnimationFrame(raf);
}
