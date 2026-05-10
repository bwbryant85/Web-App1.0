/* ════════════ CLOCK (Win98 + Hacker) ════════════ */
function initClock() {
  let timer = null;

  const isHacker = document.body.classList.contains('theme-hacker');
  const LCD_BG   = isHacker ? '#000'              : '#1a1200';
  const LCD_FG   = isHacker ? '#00ff41'           : '#ffb300';
  const LCD_GLOW = isHacker ? 'rgba(0,255,65,.5)' : 'rgba(255,180,0,.4)';

  const wrap = document.createElement('div');
  wrap.className = 'clock98-wrap';
  content.appendChild(wrap);

  const trans = builder => {
    const old = wrap.querySelector('.clk-inner');
    if (old) {
      old.classList.add('leaving');
      setTimeout(() => old.parentNode && old.remove(), 295);
      setTimeout(() => wrap.appendChild(builder()), 165);
    } else {
      wrap.appendChild(builder());
    }
  };

  const showDig = anim => {
    clearInterval(timer);
    const build = () => {
      const el = document.createElement('div');
      el.className = 'clk-inner';
      el.style.cssText = 'width:100%;max-width:560px;display:flex;flex-direction:column;align-items:center;gap:14px;';

      const timeBox = document.createElement('div');
      timeBox.id = 'ct';
      timeBox.style.cssText = [
        'width:100%;',
        `background:${LCD_BG};`,
        'border:2px solid;border-color:var(--win-chrome-dark) var(--win-chrome-light) var(--win-chrome-light) var(--win-chrome-dark);',
        'padding:16px 20px;',
        'font-family:var(--mono-font),"Share Tech Mono",monospace;',
        'font-size:clamp(2.8rem,14vw,6rem);',
        `color:${LCD_FG};`,
        'letter-spacing:.1em;text-align:center;line-height:1.05;',
        `text-shadow:0 0 10px ${LCD_GLOW};`,
      ].join('');

      const dateBox = document.createElement('div');
      dateBox.id = 'cd';
      dateBox.style.cssText = [
        'width:100%;',
        'background:var(--win-chrome);',
        'border:2px solid;border-color:var(--win-chrome-dark) var(--win-chrome-light) var(--win-chrome-light) var(--win-chrome-dark);',
        'padding:6px 20px;',
        'font-family:var(--pixel-font);font-size:1rem;',
        'color:var(--win-text);',
        'text-align:center;letter-spacing:.06em;',
      ].join('');

      el.appendChild(timeBox);
      el.appendChild(dateBox);

      const togBtn = document.createElement('button');
      togBtn.className = 'tog-btn';
      togBtn.textContent = '⟳ Analog';
      el.appendChild(togBtn);

      const tick = () => {
        const c = document.getElementById('ct');
        const d = document.getElementById('cd');
        if (!c) return;
        const n = new Date();
        c.textContent = n.toLocaleTimeString('en-US', { hour12:false, hour:'2-digit', minute:'2-digit', second:'2-digit' });
        d.textContent = n.toLocaleDateString('en-US', { weekday:'long', month:'long', day:'numeric' }).toUpperCase();
      };
      tick();
      timer = setInterval(tick, 1000);
      togBtn.onclick = () => showAna(true);
      return el;
    };
    anim ? trans(build) : wrap.appendChild(build());
  };

  const showAna = anim => {
    clearInterval(timer);
    const sz = Math.min(content.offsetWidth, content.offsetHeight - 160) * .65;
    const build = () => {
      const el = document.createElement('div');
      el.className = 'clk-inner';
      el.style.cssText = 'width:100%;max-width:560px;display:flex;flex-direction:column;align-items:center;gap:16px;';

      const canvasWrap = document.createElement('div');
      canvasWrap.style.cssText = [
        `background:${LCD_BG};`,
        'border:2px solid;border-color:var(--win-chrome-dark) var(--win-chrome-light) var(--win-chrome-light) var(--win-chrome-dark);',
        'padding:4px;display:inline-block;',
      ].join('');
      const cv = document.createElement('canvas');
      cv.id = 'clkc';
      cv.width  = sz; cv.height = sz;
      cv.style.cssText = `width:${sz}px;height:${sz}px;display:block;`;
      canvasWrap.appendChild(cv);
      el.appendChild(canvasWrap);

      const togBtn = document.createElement('button');
      togBtn.className = 'tog-btn';
      togBtn.textContent = '⟳ Digital';
      el.appendChild(togBtn);
      togBtn.onclick = () => showDig(true);

      setTimeout(() => drawAna(sz), 20);
      return el;
    };
    anim ? trans(build) : wrap.appendChild(build());
  };

  const drawAna = sz => {
    const cv = document.getElementById('clkc');
    if (!cv) return;
    const ctx = cv.getContext('2d');
    const cx = sz / 2, cy = sz / 2, r = sz * .43;
    const secCol = isHacker ? '#ff4136' : '#ff6600';

    const hand = (a, len, w, col) => {
      ctx.save();
      ctx.shadowColor = col; ctx.shadowBlur = 8;
      ctx.beginPath();
      ctx.moveTo(cx + Math.cos(a + Math.PI) * len * .14, cy + Math.sin(a + Math.PI) * len * .14);
      ctx.lineTo(cx + Math.cos(a) * len, cy + Math.sin(a) * len);
      ctx.strokeStyle = col; ctx.lineWidth = w; ctx.lineCap = 'round';
      ctx.stroke(); ctx.restore();
    };

    const draw = () => {
      if (!document.getElementById('clkc')) { clearInterval(timer); return; }
      const n = new Date();
      const s = n.getSeconds(), m = n.getMinutes(), h = n.getHours() % 12;
      const sa = s / 60 * Math.PI * 2 - Math.PI / 2;
      const ma = (m + s / 60) / 60 * Math.PI * 2 - Math.PI / 2;
      const ha = (h + m / 60) / 12 * Math.PI * 2 - Math.PI / 2;

      ctx.fillStyle = LCD_BG;
      ctx.fillRect(0, 0, sz, sz);

      ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.strokeStyle = LCD_FG + '33'; ctx.lineWidth = 1.5; ctx.stroke();

      for (let i = 0; i < 60; i++) {
        const a = i / 60 * Math.PI * 2, maj = i % 5 === 0;
        ctx.beginPath();
        ctx.moveTo(cx + Math.cos(a) * r * (maj ? .80 : .89), cy + Math.sin(a) * r * (maj ? .80 : .89));
        ctx.lineTo(cx + Math.cos(a) * r * .96, cy + Math.sin(a) * r * .96);
        ctx.strokeStyle = maj ? LCD_FG + 'cc' : LCD_FG + '33';
        ctx.lineWidth = maj ? 2.2 : 1; ctx.stroke();
      }

      ctx.font = `${sz * .06}px 'Share Tech Mono',monospace`;
      ctx.fillStyle = LCD_FG + '66';
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      [12, 3, 6, 9].forEach(num => {
        const a = (num / 12) * Math.PI * 2 - Math.PI / 2, d = r * .72;
        ctx.fillText(num, cx + Math.cos(a) * d, cy + Math.sin(a) * d);
      });

      hand(ha, r * .55, sz * .024, LCD_FG);
      hand(ma, r * .76, sz * .016, LCD_FG);
      hand(sa, r * .84, sz * .011, secCol);

      ctx.beginPath(); ctx.arc(cx, cy, sz * .02, 0, Math.PI * 2);
      ctx.fillStyle = LCD_FG; ctx.shadowColor = LCD_FG; ctx.shadowBlur = 8; ctx.fill();
      ctx.beginPath(); ctx.arc(cx, cy, sz * .009, 0, Math.PI * 2);
      ctx.fillStyle = LCD_BG; ctx.shadowBlur = 0; ctx.fill();
    };

    draw();
    timer = setInterval(draw, 1000);
  };

  showDig(false);
  return () => clearInterval(timer);
}
