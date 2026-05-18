/**
 * boot.js — iPOCKET v8 boot sequence
 * Features: BSOD (1/200), 5-10s random duration, Win11 orb bg
 */
'use strict';

(function runBoot() {
  POS.incBoot();

  // ── BSOD check (1/200 chance) ──────────────────────────────
  const savedTheme = localStorage.getItem('ipocket_theme') || 'retro';
  if (typeof maybeBSOD === 'function' && maybeBSOD(savedTheme)) {
    document.getElementById('boot-screen').style.display = 'none';
    return;
  }

  const bootEl     = document.getElementById('boot-screen');
  const isModernBoot = savedTheme === 'modern';

  // Win11: inject animated orb canvas into boot screen
  if (isModernBoot) {
    bootEl.style.position = 'relative';
    bootEl.style.overflow = 'hidden';
    if (typeof createOrbCanvas === 'function') {
      const { canvas } = createOrbCanvas();
      canvas.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;z-index:0;';
      bootEl.insertBefore(canvas, bootEl.firstChild);
      Array.from(bootEl.children).forEach(ch => {
        if (ch !== canvas) { ch.style.position = 'relative'; ch.style.zIndex = '1'; }
      });
    }
  }

  const logLines = [
    '> Checking hardware...',
    '> Mounting storage...',
    '> Loading kernel...',
    '> Starting services...',
    '> Loading apps...',
    '> Almost there...',
    '> System ready.',
  ];

  const logEl   = document.getElementById('boot-log');
  const barEl   = document.getElementById('boot-bar');
  const pctEl   = document.getElementById('boot-pct');
  const labelEl = document.getElementById('boot-bar-label');
  const skipEl  = document.getElementById('boot-skip');

  const lineEls = logLines.map(txt => {
    const d = document.createElement('div');
    d.className = 'boot-log-line';
    d.textContent = txt;
    logEl.appendChild(d);
    return d;
  });

  // 5–10 second random boot duration
  const targetMs  = 5000 + Math.random() * 5000;
  const startTime = Date.now();
  let pct = 0, done = false, canSkip = false;

  setTimeout(() => { skipEl.classList.add('show'); canSkip = true; }, 600);

  function finish() {
    if (done) return;
    done = true;
    barEl.style.width = '100%';
    pctEl.textContent = '100%';
    labelEl.textContent = 'System ready.';
    lineEls.forEach(l => l.classList.add('visible', 'done'));
    setTimeout(() => {
      bootEl.style.transition = 'opacity .5s ease';
      bootEl.style.opacity = '0';
      const desk = document.getElementById('desktop');
      desk.style.display = 'flex';
      desk.style.opacity = '0';
      desk.style.transition = 'opacity .4s ease .1s';
      requestAnimationFrame(() => { setTimeout(() => { desk.style.opacity = '1'; }, 50); });
      setTimeout(() => { bootEl.remove(); }, 600);
    }, 400);
  }

  bootEl.addEventListener('click', () => { if (canSkip) finish(); });

  let logIdx = 0;
  function tick() {
    if (done) return;
    const elapsed = Date.now() - startTime;
    pct = Math.min(99.5, (elapsed / targetMs) * 100);
    barEl.style.width = pct + '%';
    pctEl.textContent = Math.round(pct) + '%';
    const targetLine = Math.floor((pct / 100) * logLines.length);
    while (logIdx < targetLine && logIdx < lineEls.length) {
      lineEls[logIdx].classList.add('visible');
      if (logIdx > 0) lineEls[logIdx - 1].classList.add('done');
      logIdx++;
    }
    if (elapsed >= targetMs) { finish(); }
    else { setTimeout(tick, 40 + Math.random() * 20); }
  }

  tick();
})();
