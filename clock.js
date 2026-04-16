/* ════════════ CLOCK ════════════ */
function initClock() {
  let timer = null;
  const wrap = document.createElement('div');
  wrap.className = 'clk-wrap';
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
      el.innerHTML = `<div class="clk-dig" id="ct"></div><div class="clk-date" id="cd"></div><button class="tog-btn">⟳ Analog</button>`;
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
      el.querySelector('.tog-btn').onclick = () => showAna(true);
      return el;
    };
    anim ? trans(build) : wrap.appendChild(build());
  };

  const showAna = anim => {
    clearInterval(timer);
    const sz = Math.min(content.offsetWidth, content.offsetHeight - SA.t - SA.b - 160) * .65;
    const build = () => {
      const el = document.createElement('div');
      el.className = 'clk-inner';
      el.innerHTML = `<canvas id="clkc" width="${sz}" height="${sz}" style="width:${sz}px;height:${sz}px;display:block"></canvas><button class="tog-btn">⟳ Digital</button>`;
      el.querySelector('.tog-btn').onclick = () => showDig(true);
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

    const hand = (a, len, w, col) => {
      ctx.save();
      ctx.shadowColor = col; ctx.shadowBlur = 12;
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

      ctx.clearRect(0, 0, sz, sz);

      // Outer rings
      ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.strokeStyle = 'rgba(0,255,204,.22)'; ctx.lineWidth = 1.5; ctx.stroke();
      ctx.beginPath(); ctx.arc(cx, cy, r * .9, 0, Math.PI * 2);
      ctx.strokeStyle = 'rgba(0,255,204,.07)'; ctx.lineWidth = 1; ctx.stroke();

      // Tick marks
      for (let i = 0; i < 60; i++) {
        const a = i / 60 * Math.PI * 2, maj = i % 5 === 0;
        ctx.beginPath();
        ctx.moveTo(cx + Math.cos(a) * r * (maj ? .80 : .89), cy + Math.sin(a) * r * (maj ? .80 : .89));
        ctx.lineTo(cx + Math.cos(a) * r * .96, cy + Math.sin(a) * r * .96);
        ctx.strokeStyle = maj ? 'rgba(0,255,204,.8)' : 'rgba(0,255,204,.18)';
        ctx.lineWidth = maj ? 2.2 : 1; ctx.stroke();
      }

      // Numbers
      ctx.font = `${sz * .06}px 'Share Tech Mono',monospace`;
      ctx.fillStyle = 'rgba(0,255,204,.42)';
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      [12, 3, 6, 9].forEach(num => {
        const a = (num / 12) * Math.PI * 2 - Math.PI / 2, d = r * .72;
        ctx.fillText(num, cx + Math.cos(a) * d, cy + Math.sin(a) * d);
      });

      // Hands
      hand(ha, r * .55, sz * .024, '#cce8ff');
      hand(ma, r * .76, sz * .016, '#cce8ff');
      hand(sa, r * .84, sz * .011, '#ff4af8');

      // Center dot
      ctx.beginPath(); ctx.arc(cx, cy, sz * .02, 0, Math.PI * 2);
      ctx.fillStyle = 'var(--cyan)'; ctx.shadowColor = 'var(--cyan)'; ctx.shadowBlur = 10; ctx.fill();
      ctx.beginPath(); ctx.arc(cx, cy, sz * .009, 0, Math.PI * 2);
      ctx.fillStyle = '#050508'; ctx.shadowBlur = 0; ctx.fill();
    };

    draw();
    timer = setInterval(draw, 1000);
  };

  showDig(false);
  return () => clearInterval(timer);
}
