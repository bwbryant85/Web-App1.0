/* ════════════ GYROSCOPE / COMPASS ════════════ */
function initGyro() {
  const wrap = document.createElement('div');
  wrap.style.cssText = 'width:100%;height:100%;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:20px;background:#050508;padding-top:89px;padding-bottom:calc(var(--sb,0px)+40px);overflow:hidden;position:relative;';
  content.appendChild(wrap);

  /* ── Canvas ── */
  const cv = document.createElement('canvas');
  const SIZE = Math.min(content.offsetWidth - 48, 320);
  cv.width = SIZE; cv.height = SIZE;
  cv.style.cssText = `width:${SIZE}px;height:${SIZE}px;flex-shrink:0;`;
  wrap.appendChild(cv);
  const ctx = cv.getContext('2d');
  const CX = SIZE / 2, CY = SIZE / 2, R = SIZE * .44;

  /* ── Data readout ── */
  const dataGrid = document.createElement('div');
  dataGrid.style.cssText = 'display:grid;grid-template-columns:1fr 1fr 1fr;gap:10px;width:100%;max-width:360px;padding:0 16px;';
  wrap.appendChild(dataGrid);

  const mkCard = (label, id, color) => {
    const c = document.createElement('div');
    c.style.cssText = `background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.07);border-radius:14px;padding:12px 10px;text-align:center;`;
    c.innerHTML = `<div style="font-size:.45rem;letter-spacing:.14em;text-transform:uppercase;color:${color};font-family:'Orbitron',sans-serif;margin-bottom:5px;">${label}</div><div id="${id}" style="font-family:'Share Tech Mono',monospace;font-size:.9rem;color:var(--text);">--</div>`;
    dataGrid.appendChild(c);
    return c;
  };
  mkCard('Alpha', 'gy-a', 'var(--cyan)');
  mkCard('Beta',  'gy-b', 'var(--mag)');
  mkCard('Gamma', 'gy-g', '#ffd740');
  mkCard('Heading', 'gy-h', '#69ff47');
  mkCard('Tilt X',  'gy-x', '#81d4fa');
  mkCard('Tilt Y',  'gy-y', '#ffcc80');

  const statusEl = document.createElement('div');
  statusEl.style.cssText = 'font-family:"Share Tech Mono",monospace;font-size:.6rem;color:var(--dim);letter-spacing:.12em;text-transform:uppercase;text-align:center;';
  statusEl.textContent = 'Waiting for sensor permission...';
  wrap.appendChild(statusEl);

  /* ── State ── */
  let alpha = 0, beta = 0, gamma = 0;
  let raf = null, listening = false;

  /* ── Draw compass rose ── */
  const drawCompass = () => {
    ctx.clearRect(0, 0, SIZE, SIZE);

    // Outer ring
    ctx.beginPath(); ctx.arc(CX, CY, R, 0, Math.PI * 2);
    ctx.strokeStyle = 'rgba(0,255,204,.18)'; ctx.lineWidth = 1.5; ctx.stroke();
    ctx.beginPath(); ctx.arc(CX, CY, R * .88, 0, Math.PI * 2);
    ctx.strokeStyle = 'rgba(0,255,204,.06)'; ctx.lineWidth = 1; ctx.stroke();

    // Tick marks + cardinal labels
    const CARDS = ['N','NE','E','SE','S','SW','W','NW'];
    for (let i = 0; i < 36; i++) {
      const a = (i / 36) * Math.PI * 2;
      const maj = i % 9 === 0, mid = i % 3 === 0;
      const r0 = maj ? R * .72 : mid ? R * .80 : R * .86;
      ctx.beginPath();
      ctx.moveTo(CX + Math.cos(a - Math.PI/2) * r0, CY + Math.sin(a - Math.PI/2) * r0);
      ctx.lineTo(CX + Math.cos(a - Math.PI/2) * R * .95, CY + Math.sin(a - Math.PI/2) * R * .95);
      ctx.strokeStyle = maj ? 'rgba(0,255,204,.7)' : mid ? 'rgba(0,255,204,.35)' : 'rgba(0,255,204,.12)';
      ctx.lineWidth = maj ? 2 : 1; ctx.stroke();

      if (maj) {
        const label = CARDS[i / 9];
        const lx = CX + Math.cos(a - Math.PI/2) * R * .60;
        const ly = CY + Math.sin(a - Math.PI/2) * R * .60;
        ctx.font = `${label.length > 1 ? SIZE*.046 : SIZE*.058}px 'Orbitron',sans-serif`;
        ctx.fillStyle = label === 'N' ? '#ff4af8' : 'rgba(0,255,204,.65)';
        ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
        if (label === 'N') { ctx.shadowColor = '#ff4af8'; ctx.shadowBlur = 10; }
        ctx.fillText(label, lx, ly);
        ctx.shadowBlur = 0;
      }
    }

    // Heading needle
    // alpha is now the true magnetic heading (degrees, 0=N, clockwise)
    // The needle must always point to magnetic North = top of screen
    // So we rotate the whole compass rose by -heading, keeping needle fixed at top
    const headRad = -(alpha * Math.PI / 180);
    const needleLen = R * .78;

    // North (red) end — needle always points up (toward top of screen = north)
    ctx.save();
    ctx.translate(CX, CY);
    ctx.rotate(headRad);
    ctx.beginPath();
    ctx.moveTo(0, -needleLen);
    ctx.lineTo(SIZE * .028, SIZE * .045);
    ctx.lineTo(0, SIZE * .02);
    ctx.lineTo(-SIZE * .028, SIZE * .045);
    ctx.closePath();
    ctx.fillStyle = '#ff4af8'; ctx.shadowColor = '#ff4af8'; ctx.shadowBlur = 16; ctx.fill();
    // South (cyan) end
    ctx.beginPath();
    ctx.moveTo(0, SIZE * .02);
    ctx.lineTo(SIZE * .024, SIZE * .045);
    ctx.lineTo(0, needleLen * .6);
    ctx.lineTo(-SIZE * .024, SIZE * .045);
    ctx.closePath();
    ctx.fillStyle = 'var(--cyan)'; ctx.shadowColor = 'var(--cyan)'; ctx.shadowBlur = 10; ctx.fill();
    ctx.shadowBlur = 0; ctx.restore();

    // Tilt indicator (bubble level)
    const tiltX = Math.max(-1, Math.min(1, gamma / 90));
    const tiltY = Math.max(-1, Math.min(1, beta  / 90));
    const bx = CX + tiltX * R * .22;
    const by = CY + tiltY * R * .22;
    ctx.beginPath(); ctx.arc(CX, CY, R * .12, 0, Math.PI * 2);
    ctx.strokeStyle = 'rgba(0,255,204,.12)'; ctx.lineWidth = 1; ctx.stroke();
    ctx.beginPath(); ctx.arc(bx, by, SIZE * .028, 0, Math.PI * 2);
    const centered = Math.abs(tiltX) < .1 && Math.abs(tiltY) < .1;
    ctx.fillStyle = centered ? '#69ff47' : 'var(--cyan)';
    ctx.shadowColor = ctx.fillStyle; ctx.shadowBlur = 12; ctx.fill(); ctx.shadowBlur = 0;

    // Center dot
    ctx.beginPath(); ctx.arc(CX, CY, SIZE * .012, 0, Math.PI * 2);
    ctx.fillStyle = '#fff'; ctx.fill();
  };

  const tick = () => {
    drawCompass();

    // alpha is already true heading: 0=N, 90=E, 180=S, 270=W
    const headingDeg = Math.round(alpha);
    const DIRS = ['N','NNE','NE','ENE','E','ESE','SE','SSE','S','SSW','SW','WSW','W','WNW','NW','NNW'];
    const dir = DIRS[Math.round(headingDeg / 22.5) % 16];

    const set = (id, v) => { const el = document.getElementById(id); if (el) el.textContent = v; };
    set('gy-a', headingDeg + '°');
    set('gy-b', Math.round(beta)  + '°');
    set('gy-g', Math.round(gamma) + '°');
    set('gy-h', headingDeg + '° ' + dir);
    set('gy-x', Math.round(gamma) + '°');
    set('gy-y', Math.round(beta)  + '°');

    raf = requestAnimationFrame(tick);
  };

  /* ── Request permission + start ── */
  const startSensors = () => {
    window.addEventListener('deviceorientation', e => {
      // webkitCompassHeading is true magnetic north (iOS Safari).
      // e.alpha is relative to arbitrary device startup orientation — NOT true north.
      // Use webkitCompassHeading when available; it is already 0=N, increases clockwise.
      if (e.webkitCompassHeading != null) {
        alpha = e.webkitCompassHeading; // true magnetic north heading, 0-360
      } else if (e.absolute && e.alpha != null) {
        // On Android with absolute=true, alpha is 0=N clockwise
        alpha = (360 - e.alpha + 360) % 360;
      } else {
        // Relative alpha — not reliable for compass, show with warning
        alpha = e.alpha || 0;
      }
      beta  = e.beta  || 0;
      gamma = e.gamma || 0;
      if (!listening) {
        listening = true;
        statusEl.textContent = 'True magnetic north compass';
        tick();
      }
    }, true);

    // Fallback: if no event fires in 2s, show demo mode
    setTimeout(() => {
      if (!listening) {
        statusEl.textContent = 'Sensor unavailable — demo mode';
        // Animate demo
        let t = 0;
        const demo = () => {
          t += 0.012;
          alpha = (t * 25) % 360;
          beta  = Math.sin(t) * 30;
          gamma = Math.cos(t * .7) * 20;
          raf = requestAnimationFrame(demo);
          drawCompass();
        };
        demo();
      }
    }, 2000);
  };

  // iOS 13+ requires explicit permission
  if (typeof DeviceOrientationEvent !== 'undefined' && typeof DeviceOrientationEvent.requestPermission === 'function') {
    statusEl.textContent = 'Tap to enable motion sensors';
    const permBtn = document.createElement('button');
    permBtn.textContent = 'Enable Sensors';
    permBtn.style.cssText = 'font-family:"Orbitron",sans-serif;font-size:.6rem;letter-spacing:.15em;text-transform:uppercase;color:#050508;background:var(--cyan);border:none;padding:12px 28px;border-radius:22px;cursor:pointer;box-shadow:var(--gc);-webkit-tap-highlight-color:transparent;';
    permBtn.onclick = () => {
      DeviceOrientationEvent.requestPermission().then(state => {
        if (state === 'granted') { permBtn.remove(); startSensors(); }
        else { statusEl.textContent = 'Permission denied'; }
      }).catch(() => { statusEl.textContent = 'Permission error'; });
    };
    wrap.appendChild(permBtn);
  } else {
    startSensors();
  }

  // Draw static compass immediately while waiting
  drawCompass();

  return () => { cancelAnimationFrame(raf); };
}
