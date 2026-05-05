/* ════════════ SPARKS ════════════ */
function initParticles() {
  const cv = document.createElement('canvas');
  cv.style.cssText = 'display:block;width:100%;height:100%;touch-action:none;';
  content.appendChild(cv);
  const ctx = cv.getContext('2d');
  let W, H, raf;

  const resize = () => { W = cv.width = cv.offsetWidth; H = cv.height = cv.offsetHeight; };
  resize();
  const ro = new ResizeObserver(resize);
  ro.observe(cv);

  const pts = [];

  const spawn = (x, y) => {
    for (let i = 0; i < 75 + Math.random() * 40; i++) {
      const a = -Math.PI / 2 + (Math.random() - .5) * Math.PI * 1.55;
      const spd = 4 + Math.random() * 14;
      const isCore = Math.random() < .25;
      const life = .15 + Math.random() * .44;
      pts.push({ x, y, px:x, py:y, vx:Math.cos(a)*spd, vy:Math.sin(a)*spd-1, life, ml:life, sz:isCore?2+Math.random()*1.5:.6+Math.random()*1.2, isCore, hot:Math.random()<.12, bounced:false });
    }
    for (let i = 0; i < 24; i++) {
      const a = Math.random() * Math.PI * 2, spd = 1 + Math.random() * 5;
      const life = .08 + Math.random() * .2;
      pts.push({ x:x+(Math.random()-.5)*18, y:y+(Math.random()-.5)*18, px:x, py:y, vx:Math.cos(a)*spd, vy:Math.sin(a)*spd, life, ml:life, sz:.5, isCore:false, hot:false, bounced:false });
    }
  };

  const getCol = p => {
    const t = 1 - p.life / p.ml;
    if (p.hot) return `rgb(255,255,${Math.round(255 * (1 - t))})`;
    if (t < .25) return `rgb(255,${Math.round(230 - t / .25 * 60)},0)`;
    if (t < .6)  return `rgb(255,${Math.round(170 - (t - .25) / .35 * 130)},0)`;
    return `rgb(255,${Math.round(40 * (1 - (t - .6) / .4))},0)`;
  };

  const onPtr = e => {
    const rc = cv.getBoundingClientRect();
    const list = e.touches || [e];
    for (const t of list) spawn((t.clientX - rc.left) * (W / rc.width), (t.clientY - rc.top) * (H / rc.height));
  };

  cv.addEventListener('click', onPtr);
  cv.addEventListener('touchstart', e => { e.preventDefault(); onPtr(e); }, { passive: false });
  cv.addEventListener('touchmove',  e => { e.preventDefault(); onPtr(e); }, { passive: false });

  const ht = setTimeout(() => spawn(W * .5, H * .55), 1600);

  const draw = () => {
    ctx.fillStyle = 'rgba(5,5,8,0.19)';
    ctx.fillRect(0, 0, W, H);

    for (let i = pts.length - 1; i >= 0; i--) {
      const p = pts[i];
      p.px = p.x; p.py = p.y;
      p.x += p.vx; p.y += p.vy;
      p.vy += .32; p.vx *= .991;
      p.life -= p.life / p.ml > .5 ? .022 : .03;
      if (p.y > H && !p.bounced) { p.vy *= -.4; p.vx *= .65; p.y = H; p.bounced = true; }
      if (p.life <= 0) { pts.splice(i, 1); continue; }

      const alpha = Math.pow(p.life / p.ml, .7);
      const c = getCol(p);
      ctx.save();
      ctx.globalAlpha = alpha;
      const dx = p.x - p.px, dy = p.y - p.py, len = Math.sqrt(dx*dx + dy*dy);
      if (len > 1.5) {
        ctx.beginPath(); ctx.moveTo(p.px, p.py); ctx.lineTo(p.x, p.y);
        ctx.strokeStyle = c; ctx.lineWidth = p.sz * alpha;
        ctx.shadowColor = c; ctx.shadowBlur = p.isCore ? 14 : 5; ctx.stroke();
      }
      ctx.beginPath(); ctx.arc(p.x, p.y, p.sz * alpha * .7, 0, Math.PI * 2);
      ctx.fillStyle = p.hot ? '#fff' : c;
      ctx.shadowColor = p.hot ? '#ffffaa' : c;
      ctx.shadowBlur = p.isCore ? 18 : 8;
      ctx.fill();
      ctx.restore();
    }
    raf = requestAnimationFrame(draw);
  };

  draw();
  return () => { cancelAnimationFrame(raf); clearTimeout(ht); ro.disconnect(); };
}
