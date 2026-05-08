/**
 * boot.js — iPOCKET v8 boot sequence
 */
'use strict';

(function runBoot() {
  POS.incBoot();

  const logLines = [
    '> Checking hardware...',
    '> Mounting storage...',
    '> Loading kernel...',
    '> Starting services...',
    '> Loading apps...',
    '> Almost there...',
    '> System ready.',
  ];

  const logEl    = document.getElementById('boot-log');
  const barEl    = document.getElementById('boot-bar');
  const pctEl    = document.getElementById('boot-pct');
  const labelEl  = document.getElementById('boot-bar-label');
  const skipEl   = document.getElementById('boot-skip');
  const bootEl   = document.getElementById('boot-screen');

  // Build log DOM
  const lineEls = logLines.map(txt => {
    const d = document.createElement('div');
    d.className = 'boot-log-line';
    d.textContent = txt;
    logEl.appendChild(d);
    return d;
  });

  let pct = 0;
  let done = false;
  let canSkip = false;

  setTimeout(() => { skipEl.classList.add('show'); canSkip = true; }, 600);

  function finish() {
    if (done) return;
    done = true;
    barEl.style.width = '100%';
    pctEl.textContent = '100%';
    labelEl.textContent = 'System ready.';
    lineEls.forEach(l => l.classList.add('visible','done'));

    setTimeout(() => {
      bootEl.style.transition = 'opacity .5s ease';
      bootEl.style.opacity = '0';
      document.getElementById('desktop').style.display = 'flex';
      document.getElementById('desktop').style.opacity = '0';
      document.getElementById('desktop').style.transition = 'opacity .4s ease .1s';
      requestAnimationFrame(() => {
        setTimeout(() => { document.getElementById('desktop').style.opacity = '1'; }, 50);
      });
      setTimeout(() => { bootEl.remove(); }, 600);
    }, 400);
  }

  bootEl.addEventListener('click', () => { if (canSkip) finish(); });

  let logIdx = 0;
  function tick() {
    if (done) return;
    pct += 4 + Math.random() * 6;
    if (pct >= 100) { finish(); return; }

    // Update bar (block-style)
    barEl.style.width = pct + '%';
    pctEl.textContent = Math.round(pct) + '%';

    // Reveal log lines
    const targetLine = Math.floor((pct / 100) * logLines.length);
    while (logIdx < targetLine && logIdx < lineEls.length) {
      lineEls[logIdx].classList.add('visible');
      if (logIdx > 0) lineEls[logIdx-1].classList.add('done');
      logIdx++;
    }

    setTimeout(tick, 18 + Math.random() * 14);
  }

  tick();
})();
