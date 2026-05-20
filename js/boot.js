/**
 * boot.js — iPOCKET boot sequence
 * - No tap-to-skip
 * - 5–10s random duration
 * - Win11 theme: dark orb canvas injected behind content
 * - Layout fits full screen, no overflow
 */
'use strict';

(function runBoot() {
  POS.incBoot();

  const savedTheme = localStorage.getItem('ipocket_theme') || 'retro';

  // BSOD check (1/200)
  if (typeof maybeBSOD === 'function' && maybeBSOD(savedTheme)) {
    const bs = document.getElementById('boot-screen');
    if (bs) bs.style.display = 'none';
    return;
  }

  const bootEl      = document.getElementById('boot-screen');
  const isModern    = savedTheme === 'modern';
  const isLiquid    = savedTheme === 'liquid';
  const isHacker    = savedTheme === 'hacker';

  // Remove cursor:pointer — no tap-to-skip
  bootEl.style.cursor = 'default';

  // Win11 / Liquid: inject dark orb canvas
  if ((isModern || isLiquid) && typeof createOrbCanvas === 'function') {
    const { canvas } = createOrbCanvas();
    canvas.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;z-index:0;';
    bootEl.insertBefore(canvas, bootEl.firstChild);
  }

  // Make the boot screen a proper flex column that fills 100dvh with no overflow
  bootEl.style.cssText = [
    bootEl.style.cssText,
    'display:flex;flex-direction:column;align-items:center;justify-content:center;',
    'gap:clamp(10px,3vh,22px);',
    'padding:max(env(safe-area-inset-top,20px),20px) 20px max(env(safe-area-inset-bottom,20px),20px);',
    'box-sizing:border-box;overflow:hidden;',
  ].join('');

  const logEl   = document.getElementById('boot-log');
  const barEl   = document.getElementById('boot-bar');
  const pctEl   = document.getElementById('boot-pct');
  const labelEl = document.getElementById('boot-bar-label');
  const skipEl  = document.getElementById('boot-skip');

  // Hide skip — no tap-to-skip
  if (skipEl) skipEl.style.display = 'none';

  const logLines = [
    '> Checking hardware...',
    '> Mounting storage...',
    '> Loading kernel...',
    '> Starting services...',
    '> Loading apps...',
    '> Almost there...',
    '> System ready.',
  ];

  const lineEls = logLines.map(txt => {
    const d = document.createElement('div');
    d.className = 'boot-log-line';
    d.textContent = txt;
    logEl.appendChild(d);
    return d;
  });

  // 5–10 second random duration
  const targetMs  = 5000 + Math.random() * 5000;
  const startTime = Date.now();
  let done = false;

  function finish() {
    if (done) return;
    done = true;
    barEl.style.width = '100%';
    if (pctEl)   pctEl.textContent   = '100%';
    if (labelEl) labelEl.textContent = 'System ready.';
    lineEls.forEach(l => l.classList.add('visible', 'done'));

    setTimeout(() => {
      bootEl.style.transition = 'opacity .5s ease';
      bootEl.style.opacity = '0';
      const desk = document.getElementById('desktop');
      if (desk) {
        desk.style.display  = 'flex';
        desk.style.opacity  = '0';
        desk.style.transition = 'opacity .4s ease .1s';
        requestAnimationFrame(() => setTimeout(() => { desk.style.opacity = '1'; }, 50));
      }
      setTimeout(() => { if (bootEl.parentNode) bootEl.remove(); }, 600);

      // Show login after boot if LoginSystem is available
      setTimeout(() => {
        if (window.LoginSystem) {
          LoginSystem.init(() => {
            // Logged in — apply liquid noise layer if needed
            if (document.body.classList.contains('theme-liquid')) {
              const dsk = document.getElementById('desktop');
              if (dsk && !dsk.querySelector('.lg-noise')) {
                const noise = document.createElement('div');
                noise.className = 'lg-noise';
                dsk.insertBefore(noise, dsk.firstChild);
              }
            }
          });
        }
      }, 700);
    }, 350);
  }

  let logIdx = 0;
  function tick() {
    if (done) return;
    const elapsed = Date.now() - startTime;
    const pct = Math.min(99.5, (elapsed / targetMs) * 100);

    barEl.style.width = pct + '%';
    if (pctEl)   pctEl.textContent   = Math.round(pct) + '%';
    if (labelEl) labelEl.textContent = pct < 30 ? 'Initializing...' : pct < 70 ? 'Loading...' : 'Almost ready...';

    const targetLine = Math.floor((pct / 100) * logLines.length);
    while (logIdx < targetLine && logIdx < lineEls.length) {
      lineEls[logIdx].classList.add('visible');
      if (logIdx > 0) lineEls[logIdx - 1].classList.add('done');
      logIdx++;
    }

    if (elapsed >= targetMs) finish();
    else setTimeout(tick, 40 + Math.random() * 25);
  }

  tick();
})();
