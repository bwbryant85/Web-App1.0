/* ════════════ REACTION TIME ════════════ */
function initReaction() {
  const wrap = document.createElement('div');
  wrap.className = 'react-wrap';
  content.appendChild(wrap);

  let state = 'ready', t0, tid, results = [], round = 0;
  const MAX_R = 5;
  const RATINGS = [
    [180, 'SUPERHUMAN ⚡', '#00ffcc'],
    [230, 'ELITE 🔥',      '#69ff47'],
    [280, 'GREAT ✓',       '#ffeb3b'],
    [340, 'GOOD',          '#ff9800'],
    [450, 'AVERAGE',       '#ff6d6d'],
    [Infinity, 'SLOW 🐢',  '#666'],
  ];
  const rate = ms => RATINGS.find(r => ms < r[0]);

  const render = (bg, main, mc, sub, showR) => {
    wrap.style.background = bg || '#050508';
    let h = `
      <div style="font-family:'Share Tech Mono',monospace;font-size:.75rem;letter-spacing:.2em;text-transform:uppercase;color:var(--dim)">ROUND ${round}/${MAX_R}</div>
      <div class="react-big" style="color:${mc || 'var(--cyan)'}">${main}</div>
      <div class="react-sub">${sub}</div>`;
    if (showR && results.length) {
      const avg = Math.round(results.reduce((a, b) => a + b, 0) / results.length);
      const r = rate(avg);
      h += `<div class="react-results">
        ${results.map((ms, i) => {
          const rr = rate(ms);
          return `<div class="react-row" style="color:${rr[2]}">${i + 1}. ${ms}ms — ${rr[1]}</div>`;
        }).join('')}
        <div class="react-row" style="color:${r[2]};margin-top:6px;font-size:.72rem">AVG: ${avg}ms — ${r[1]}</div>
      </div>`;
    }
    wrap.innerHTML = h;
  };

  const start = () => {
    if (state === 'done') {
      results = []; round = 0; state = 'ready';
      render(null, 'READY', 'var(--dim)', 'Tap to start', false);
      return;
    }
    if (state !== 'ready') return;
    round++;
    state = 'waiting';
    render(null, 'WAIT...', 'var(--dim)', "Don't tap yet...", false);
    const delay = 1400 + Math.random() * 3600;
    tid = setTimeout(() => {
      state = 'go'; t0 = performance.now();
      render('#003322', 'NOW!', '#00ffcc', 'TAP!', false);
    }, delay);
  };

  const tap = () => {
    if (state === 'go') {
      const ms = Math.round(performance.now() - t0);
      results.push(ms);
      state = 'result';
      const r = rate(ms);
      render(null, `${ms}ms`, r[2], r[1] + '  ' + (round < MAX_R ? 'tap for next' : 'tap for results'), false);
      if (round >= MAX_R) {
        setTimeout(() => { state = 'done'; render(null, 'RESULTS', 'var(--text)', 'Your scores:', true); }, 1500);
      } else {
        setTimeout(() => { state = 'ready'; render(null, 'READY', 'var(--dim)', 'Tap for next round', false); }, 1400);
      }
    } else if (state === 'waiting') {
      clearTimeout(tid);
      state = 'early';
      render('#220000', 'EARLY!', '#ff4af8', 'Too soon!', false);
      setTimeout(() => { state = 'ready'; render(null, 'OOPS', 'var(--dim)', 'Wait for flash. Tap to retry.', false); }, 1500);
    } else if (state === 'ready' || state === 'done') {
      start();
    }
  };

  wrap.addEventListener('click', tap);
  wrap.addEventListener('touchstart', e => { e.preventDefault(); tap(); }, { passive: false });

  render(null, 'READY', 'var(--dim)', 'Tap to start', false);
  return () => clearTimeout(tid);
}
