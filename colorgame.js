/* ════════════ COLOR MEMORY GAME ════════════ */
function initColorGame() {
  const N = 5;
  let colors = [], currentIdx = 0, scores = [], timerInt = null;
  let cs = { h:180, s:60, l:50 };
  let colorSide = null, sTrack = null, lTrack = null;

  const hsl = (h, s, l) => `hsl(${h},${s}%,${l}%)`;

  const hsl2hex = (h, s, l) => {
    s /= 100; l /= 100;
    const a = s * Math.min(l, 1 - l);
    const f = n => {
      const k = (n + h / 30) % 12;
      const c = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
      return Math.round(255 * c).toString(16).padStart(2, '0');
    };
    return `#${f(0)}${f(8)}${f(4)}`;
  };

  const dist = (c, g) => {
    const dh = Math.min(Math.abs(c.h - g.h), 360 - Math.abs(c.h - g.h)) / 180;
    const ds = Math.abs(c.s - g.s) / 100;
    const dl = Math.abs(c.l - g.l) / 100;
    return Math.sqrt(dh*dh + ds*ds + dl*dl) / Math.sqrt(3);
  };

  const genColors = () => Array.from({ length: N }, () => ({
    h: Math.floor(Math.random() * 360),
    s: 55 + Math.floor(Math.random() * 35),
    l: 35 + Math.floor(Math.random() * 30),
  }));

  const updateVisuals = () => {
    if (colorSide) colorSide.style.background = hsl(cs.h, cs.s, cs.l);
    if (sTrack) sTrack.style.background = `linear-gradient(to bottom,${hsl(cs.h,100,cs.l)},${hsl(cs.h,0,cs.l)})`;
    if (lTrack) lTrack.style.background = `linear-gradient(to bottom,${hsl(cs.h,cs.s,90)},${hsl(cs.h,cs.s,10)})`;
  };

  const makeSlider = (parent, getInitGrad, min, max, initVal, onChange) => {
    const track = document.createElement('div');
    track.className = 'cg-vtrack';
    track.style.background = getInitGrad();
    const knob = document.createElement('div');
    knob.className = 'cg-vknob';
    track.appendChild(knob);
    parent.appendChild(track);

    let val = initVal;
    const setKnob = () => { const pct = (1 - (val - min) / (max - min)) * 100; knob.style.top = `calc(${pct}% - 13px)`; };
    setKnob();

    const setVal = clientY => {
      const r = track.getBoundingClientRect();
      const pct = Math.max(0, Math.min(1, (clientY - r.top) / r.height));
      val = Math.round(min + (1 - pct) * (max - min));
      setKnob(); onChange(val);
    };

    track.addEventListener('touchstart', e => { e.preventDefault(); setVal(e.touches[0].clientY); }, { passive: false });
    track.addEventListener('touchmove',  e => { e.preventDefault(); setVal(e.touches[0].clientY); }, { passive: false });
    track.addEventListener('mousedown', e => {
      const mv = e2 => setVal(e2.clientY);
      const up = () => { document.removeEventListener('mousemove', mv); document.removeEventListener('mouseup', up); };
      document.addEventListener('mousemove', mv);
      document.addEventListener('mouseup', up);
      setVal(e.clientY);
    });
    return track;
  };

  const showStart = () => {
    content.innerHTML = '';
    const w = document.createElement('div');
    w.className = 'cg-start';
    content.appendChild(w);
    w.innerHTML = `
      <div style="font-size:.55rem;letter-spacing:.25em;text-transform:uppercase;color:var(--dim)">// COLOR MEMORY //</div>
      <div style="font-family:'Share Tech Mono',monospace;font-size:.78rem;color:var(--dim);text-align:center;line-height:1.7;max-width:280px">
        One color at a time.<br>Memorize it.<br>Match it with the sliders.
      </div>
      <button class="cyan-btn" id="cg-go">Play →</button>`;
    document.getElementById('cg-go').onclick = () => { colors = genColors(); scores = []; currentIdx = 0; showMemorize(); };
  };

  const showMemorize = () => {
    content.innerHTML = ''; colorSide = null; sTrack = null; lTrack = null;
    const c = colors[currentIdx], hex = hsl2hex(c.h, c.s, c.l);
    const wrap = document.createElement('div');
    wrap.className = 'cg-mem'; wrap.style.background = hex;
    content.appendChild(wrap);

    const topL = document.createElement('div');
    topL.className = 'cg-mem-top'; topL.textContent = `${currentIdx + 1} / ${N}`;
    wrap.appendChild(topL);

    const timerBox = document.createElement('div');
    timerBox.className = 'cg-mem-timer';
    timerBox.innerHTML = `<div class="cg-count-num" id="cg-n">7</div><div class="cg-count-lbl">Seconds to remember</div>`;
    wrap.appendChild(timerBox);

    let secs = 7;
    timerInt = setInterval(() => {
      secs--;
      const el = document.getElementById('cg-n');
      if (el) el.textContent = secs;
      if (secs <= 0) { clearInterval(timerInt); showRecall(); }
    }, 1000);
  };

  const showRecall = () => {
    content.innerHTML = '';
    cs = { h:180, s:60, l:50 };
    colorSide = null; sTrack = null; lTrack = null;

    const outer = document.createElement('div');
    outer.className = 'cg-recall';
    content.appendChild(outer);

    // Sliders column
    const slCol = document.createElement('div');
    slCol.className = 'cg-sliders-col';
    outer.appendChild(slCol);

    // Color preview
    const cSide = document.createElement('div');
    cSide.className = 'cg-color-side';
    cSide.style.background = hsl(cs.h, cs.s, cs.l);
    outer.appendChild(cSide);
    colorSide = cSide;

    const info = document.createElement('div');
    info.className = 'cg-recall-info';
    info.textContent = `${currentIdx + 1} / ${N}`;
    cSide.appendChild(info);

    const nextBtn = document.createElement('button');
    nextBtn.className = 'cyan-btn';
    nextBtn.style.cssText = 'position:fixed;bottom:34px;right:20px;z-index:200;font-size:.58rem;padding:10px 20px;';
    nextBtn.textContent = currentIdx < N - 1 ? 'Next →' : 'Results →';
    nextBtn.onclick = () => {
      scores.push({ c: colors[currentIdx], g: { ...cs } });
      currentIdx++;
      if (currentIdx >= N) showResults();
      else showMemorize();
    };
    outer.appendChild(nextBtn);

    // Hue slider
    makeSlider(slCol,
      () => `linear-gradient(to bottom,hsl(360,80%,50%),hsl(300,80%,50%),hsl(240,80%,50%),hsl(180,80%,50%),hsl(120,80%,50%),hsl(60,80%,50%),hsl(0,80%,50%))`,
      0, 360, 180, v => { cs.h = v; updateVisuals(); }
    );

    // Saturation slider
    const sT = makeSlider(slCol,
      () => `linear-gradient(to bottom,${hsl(cs.h,100,cs.l)},${hsl(cs.h,0,cs.l)})`,
      0, 100, 60, v => { cs.s = v; updateVisuals(); }
    );
    sTrack = sT;

    // Lightness slider
    const lT = makeSlider(slCol,
      () => `linear-gradient(to bottom,${hsl(cs.h,cs.s,90)},${hsl(cs.h,cs.s,10)})`,
      10, 90, 50, v => { cs.l = v; updateVisuals(); }
    );
    lTrack = lT;
  };

  const showResults = () => {
    content.innerHTML = ''; colorSide = null; sTrack = null; lTrack = null;
    const w = document.createElement('div');
    w.className = 'cg-results';
    content.appendChild(w);

    const ttl = document.createElement('div');
    ttl.style.cssText = 'font-size:.55rem;letter-spacing:.25em;text-transform:uppercase;color:var(--dim);flex-shrink:0;';
    ttl.textContent = '// RESULTS //';
    w.appendChild(ttl);

    let total = 0;
    scores.forEach((s, i) => {
      const d = dist(s.c, s.g);
      const pts = Math.max(0, Math.round((1 - d) * 10));
      total += pts;
      const grade = pts >= 9 ? ['PERFECT','#00ffcc']
                  : pts >= 7 ? ['GREAT',  '#69ff47']
                  : pts >= 5 ? ['GOOD',   '#ffeb3b']
                  : pts >= 3 ? ['OK',     '#ff9800']
                  :            ['MISS',   '#ff6d6d'];
      const row = document.createElement('div');
      row.className = 'cg-res-row';
      row.innerHTML = `
        <div class="cg-swatch-pair">
          <div class="cg-sw" style="background:${hsl2hex(s.c.h,s.c.s,s.c.l)}" title="Original"></div>
          <div class="cg-sw" style="background:${hsl2hex(s.g.h,s.g.s,s.g.l)}" title="Yours"></div>
        </div>
        <div class="cg-res-info">
          <div class="cg-res-score" style="color:${grade[1]}">${pts}/10 — ${grade[0]}</div>
          <div class="cg-res-lbl">Color ${i+1} · Hue off by ${Math.min(Math.abs(s.c.h-s.g.h),360-Math.abs(s.c.h-s.g.h))}°</div>
        </div>`;
      w.appendChild(row);
    });

    const pct = Math.round(total / N / 10 * 100);
    const msg = pct >= 90 ? 'PERFECT 🎯' : pct >= 70 ? 'GREAT 🔥' : pct >= 50 ? 'GOOD 👍' : pct >= 30 ? 'PRACTICE 😅' : 'KEEP TRYING 😬';
    const tot = document.createElement('div');
    tot.style.cssText = 'text-align:center;margin-top:8px;flex-shrink:0;';
    tot.innerHTML = `
      <div style="font-size:2rem;font-weight:900;color:var(--cyan);text-shadow:var(--gc);letter-spacing:.1em">${total}/${N*10}</div>
      <div style="font-family:'Share Tech Mono',monospace;font-size:.7rem;color:var(--dim);letter-spacing:.15em;text-transform:uppercase;margin-top:4px">${msg}</div>`;
    w.appendChild(tot);

    const again = document.createElement('button');
    again.className = 'cyan-btn';
    again.textContent = 'Play Again →';
    again.onclick = () => { colors = genColors(); scores = []; currentIdx = 0; showMemorize(); };
    w.appendChild(again);
  };

  showStart();
  return () => clearInterval(timerInt);
}
