/* ════════════ MUSIC VISUALIZER ════════════ */
function initVisualizer() {
  const wrap = document.createElement('div');
  wrap.style.cssText = 'width:100%;height:100%;display:flex;flex-direction:column;background:#000;overflow:hidden;position:relative;';
  content.appendChild(wrap);

  const cv = document.createElement('canvas');
  cv.style.cssText = 'display:block;flex:1;width:100%;';
  wrap.appendChild(cv);
  const ctx = cv.getContext('2d');

  /* ── Controls ── */
  const controls = document.createElement('div');
  controls.style.cssText = 'flex-shrink:0;display:flex;align-items:center;justify-content:center;gap:10px;padding:10px 16px calc(var(--sb,0px) + 16px);background:rgba(0,0,0,.7);';
  wrap.appendChild(controls);

  const MODES = ['Bars', 'Wave', 'Radial', 'Particles'];
  let currentMode = 0;

  const modeBtn = document.createElement('button');
  modeBtn.style.cssText = 'font-family:"Orbitron",sans-serif;font-size:.52rem;letter-spacing:.12em;text-transform:uppercase;color:var(--text);background:rgba(255,255,255,.08);border:1px solid rgba(255,255,255,.14);padding:9px 20px;border-radius:18px;cursor:pointer;-webkit-tap-highlight-color:transparent;transition:border-color .2s;';
  modeBtn.textContent = '⟳ ' + MODES[currentMode];
  modeBtn.onclick = () => {
    haptic('light');
    currentMode = (currentMode + 1) % MODES.length;
    modeBtn.textContent = '⟳ ' + MODES[currentMode];
    // Clear canvas on mode switch
    ctx.clearRect(0, 0, W, H);
  };
  controls.appendChild(modeBtn);

  let audioCtx = null, analyser = null, freqArr = null, waveArr = null, stream = null, raf = null;
  let particles = [];
  let W = 0, H = 0;
  let hueShift = 0; // global slowly-rotating hue offset

  const resize = () => {
    W = cv.width  = cv.offsetWidth  * (window.devicePixelRatio || 1);
    H = cv.height = cv.offsetHeight * (window.devicePixelRatio || 1);
  };
  resize();
  const ro = new ResizeObserver(resize);
  ro.observe(cv);

  /* ════ BARS ════
     Mirrored left+right, rainbow gradient per bar, glowing tips */
  const drawBars = () => {
    ctx.fillStyle = 'rgba(0,0,0,.35)';
    ctx.fillRect(0, 0, W, H);

    const count = freqArr.length;
    const barW = (W / count) * 1.8;
    const gap  = (W - barW * count) / count;

    for (let i = 0; i < count; i++) {
      const v    = freqArr[i] / 255;
      const h    = v * H * .88;
      const hue  = (hueShift + i / count * 280) % 360;
      const x    = i * (barW + gap);
      const sat  = 80 + v * 20;
      const lit  = 40 + v * 30;

      // Main bar gradient bottom→top
      const grad = ctx.createLinearGradient(0, H, 0, H - h);
      grad.addColorStop(0,   `hsla(${hue},${sat}%,${lit * .6}%,.8)`);
      grad.addColorStop(0.6, `hsla(${hue},${sat}%,${lit}%,.95)`);
      grad.addColorStop(1,   `hsla(${hue + 40},100%,80%,1)`);

      ctx.shadowColor = `hsl(${hue},100%,65%)`;
      ctx.shadowBlur  = v > .5 ? 18 : v > .25 ? 8 : 2;
      ctx.fillStyle   = grad;
      ctx.fillRect(x, H - h, barW, h);

      // Glowing tip cap
      if (v > .05) {
        ctx.fillStyle  = `hsla(${hue + 40},100%,88%,.9)`;
        ctx.shadowBlur = 20;
        ctx.fillRect(x, H - h - 3, barW, 3);
      }
    }
    ctx.shadowBlur = 0;
    hueShift = (hueShift + 0.4) % 360;
  };

  /* ════ WAVE ════
     Multiple layered waveforms with glow, different colours per layer */
  const drawWave = () => {
    ctx.fillStyle = 'rgba(0,0,0,.22)';
    ctx.fillRect(0, 0, W, H);

    const LAYERS = [
      { col: `hsl(${hueShift},100%,65%)`,           lw: 3,   alpha: 1,   offset: 0 },
      { col: `hsl(${(hueShift+120)%360},100%,60%)`, lw: 1.5, alpha: .5,  offset: 6 },
      { col: `hsl(${(hueShift+240)%360},100%,70%)`, lw: 1,   alpha: .3,  offset: -6 },
    ];

    LAYERS.forEach(layer => {
      ctx.beginPath();
      const sliceW = W / waveArr.length;
      let x = 0;
      for (let i = 0; i < waveArr.length; i++) {
        const v = waveArr[i] / 128;
        const y = (v * H) / 2 + layer.offset;
        if (i === 0) ctx.moveTo(x, y);
        else         ctx.lineTo(x, y);
        x += sliceW;
      }
      ctx.lineTo(W, H / 2);
      ctx.strokeStyle    = layer.col;
      ctx.lineWidth      = layer.lw * (window.devicePixelRatio || 1);
      ctx.globalAlpha    = layer.alpha;
      ctx.shadowColor    = layer.col;
      ctx.shadowBlur     = 22;
      ctx.stroke();
    });
    ctx.globalAlpha = 1;
    ctx.shadowBlur  = 0;

    // Bass energy pulse at bottom
    const bassAvg = Array.from(freqArr.slice(0, 6)).reduce((a, b) => a + b, 0) / 6 / 255;
    if (bassAvg > .3) {
      const grad = ctx.createLinearGradient(0, H * .7, 0, H);
      grad.addColorStop(0, `hsla(${hueShift},100%,60%,0)`);
      grad.addColorStop(1, `hsla(${hueShift},100%,60%,${bassAvg * .4})`);
      ctx.fillStyle = grad;
      ctx.fillRect(0, H * .7, W, H * .3);
    }

    hueShift = (hueShift + 0.5) % 360;
  };

  /* ════ RADIAL ════
     Full 360° spectrum, mirrored symmetrically, rotating, with inner glow */
  const drawRadial = () => {
    ctx.fillStyle = 'rgba(0,0,0,.18)';
    ctx.fillRect(0, 0, W, H);

    const cx = W / 2, cy = H / 2;
    const minDim = Math.min(W, H);
    const baseR  = minDim * .16;
    const maxR   = minDim * .44;
    const count  = freqArr.length;

    // Draw bars all the way around (mirror each bar at i and i+count)
    for (let i = 0; i < count; i++) {
      const v    = freqArr[i] / 255;
      const r    = baseR + v * (maxR - baseR);
      const hue  = (hueShift + i / count * 360) % 360;
      // Two symmetric bars per freq band
      [-1, 1].forEach(side => {
        const a = side * (i / count) * Math.PI * 2 - Math.PI / 2;
        const x0 = cx + Math.cos(a) * baseR;
        const y0 = cy + Math.sin(a) * baseR;
        const x1 = cx + Math.cos(a) * r;
        const y1 = cy + Math.sin(a) * r;

        const grad = ctx.createLinearGradient(x0, y0, x1, y1);
        grad.addColorStop(0, `hsla(${hue},80%,50%,.3)`);
        grad.addColorStop(1, `hsla(${hue},100%,72%,${.4 + v * .6})`);

        ctx.beginPath();
        ctx.moveTo(x0, y0);
        ctx.lineTo(x1, y1);
        ctx.strokeStyle = grad;
        ctx.lineWidth   = Math.max(1.5, v * 4) * (window.devicePixelRatio || 1);
        ctx.shadowColor = `hsl(${hue},100%,65%)`;
        ctx.shadowBlur  = v > .6 ? 16 : v > .3 ? 8 : 3;
        ctx.stroke();
      });
    }

    // Center glow ring — pulses with overall volume
    const avgVol = Array.from(freqArr).reduce((a, b) => a + b, 0) / freqArr.length / 255;
    const pulseR = baseR * (.7 + avgVol * .6);

    ctx.beginPath();
    ctx.arc(cx, cy, pulseR, 0, Math.PI * 2);
    ctx.strokeStyle = `hsla(${hueShift},100%,70%,${.3 + avgVol * .6})`;
    ctx.lineWidth   = (2 + avgVol * 6) * (window.devicePixelRatio || 1);
    ctx.shadowColor = `hsl(${hueShift},100%,65%)`;
    ctx.shadowBlur  = 20 + avgVol * 30;
    ctx.stroke();

    // Inner filled circle
    const innerGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, pulseR * .8);
    innerGrad.addColorStop(0, `hsla(${hueShift},80%,30%,${avgVol * .5})`);
    innerGrad.addColorStop(1, 'transparent');
    ctx.beginPath();
    ctx.arc(cx, cy, pulseR * .8, 0, Math.PI * 2);
    ctx.fillStyle  = innerGrad;
    ctx.shadowBlur = 0;
    ctx.fill();

    ctx.shadowBlur = 0;
    hueShift = (hueShift + 0.7) % 360;
  };

  /* ════ PARTICLES ════
     Dense burst on every beat, trails, color-coded by freq band */
  const drawParticles = () => {
    // Long trails
    ctx.fillStyle = 'rgba(0,0,0,.08)';
    ctx.fillRect(0, 0, W, H);

    const cx = W / 2, cy = H / 2;
    const bassAvg  = Array.from(freqArr.slice(0,  6)).reduce((a, b) => a + b, 0) / 6  / 255;
    const midAvg   = Array.from(freqArr.slice(6, 32)).reduce((a, b) => a + b, 0) / 26 / 255;
    const highAvg  = Array.from(freqArr.slice(32, 64)).reduce((a, b) => a + b, 0) / 32 / 255;
    const totalAvg = Array.from(freqArr).reduce((a, b) => a + b, 0) / freqArr.length / 255;

    // Spawn particles on beats across all frequency bands
    const spawnBurst = (hue, count, speed, fromEdge) => {
      for (let i = 0; i < count; i++) {
        const a   = Math.random() * Math.PI * 2;
        const spd = speed * (.5 + Math.random() * .8);
        const ox  = fromEdge ? Math.cos(a) * Math.min(W, H) * .05 : 0;
        const oy  = fromEdge ? Math.sin(a) * Math.min(W, H) * .05 : 0;
        particles.push({
          x: cx + ox, y: cy + oy,
          vx: Math.cos(a) * spd, vy: Math.sin(a) * spd - 1,
          life: 1, ml: .5 + Math.random() * .7,
          hue: (hue + Math.random() * 30) % 360,
          sz: 1.5 + Math.random() * 4,
          trail: [],
        });
      }
    };

    if (bassAvg > .45 && particles.length < 300) spawnBurst(hueShift,                     12, 6 + bassAvg * 10, false);
    if (midAvg  > .50 && particles.length < 300) spawnBurst((hueShift + 120) % 360,        6, 3 + midAvg  * 7,  true);
    if (highAvg > .55 && particles.length < 300) spawnBurst((hueShift + 240) % 360,        4, 2 + highAvg * 5,  true);

    // Update & draw
    for (let i = particles.length - 1; i >= 0; i--) {
      const p = particles[i];
      p.trail.push({ x: p.x, y: p.y });
      if (p.trail.length > 8) p.trail.shift();
      p.x  += p.vx;
      p.y  += p.vy;
      p.vy += .06;
      p.vx *= .98;
      p.life -= .016;

      if (p.life <= 0) { particles.splice(i, 1); continue; }

      const alpha = Math.pow(p.life / p.ml, .6);

      // Draw trail
      if (p.trail.length > 1) {
        ctx.beginPath();
        ctx.moveTo(p.trail[0].x, p.trail[0].y);
        p.trail.forEach(pt => ctx.lineTo(pt.x, pt.y));
        ctx.strokeStyle = `hsla(${p.hue},100%,65%,${alpha * .35})`;
        ctx.lineWidth   = p.sz * .6;
        ctx.shadowBlur  = 0;
        ctx.stroke();
      }

      // Draw particle
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.sz * alpha, 0, Math.PI * 2);
      ctx.fillStyle  = `hsla(${p.hue},100%,70%,${alpha})`;
      ctx.shadowColor = `hsl(${p.hue},100%,65%)`;
      ctx.shadowBlur  = 14;
      ctx.fill();
    }

    // Central energy orb — scales with total volume
    const orbR = Math.min(W, H) * (.04 + totalAvg * .12);
    const orbGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, orbR);
    orbGrad.addColorStop(0,   `hsla(${hueShift},100%,90%,${.5 + totalAvg * .5})`);
    orbGrad.addColorStop(0.5, `hsla(${hueShift},100%,60%,${.3 + totalAvg * .4})`);
    orbGrad.addColorStop(1,   'transparent');
    ctx.beginPath();
    ctx.arc(cx, cy, orbR, 0, Math.PI * 2);
    ctx.fillStyle  = orbGrad;
    ctx.shadowColor = `hsl(${hueShift},100%,70%)`;
    ctx.shadowBlur  = 30 + totalAvg * 40;
    ctx.fill();

    // Bass shockwave ring
    if (bassAvg > .4) {
      ctx.beginPath();
      ctx.arc(cx, cy, Math.min(W, H) * .08 + bassAvg * Math.min(W, H) * .38, 0, Math.PI * 2);
      ctx.strokeStyle = `hsla(${hueShift},100%,65%,${bassAvg * .7})`;
      ctx.lineWidth   = bassAvg * 10 * (window.devicePixelRatio || 1);
      ctx.shadowColor = `hsl(${hueShift},100%,65%)`;
      ctx.shadowBlur  = bassAvg * 40;
      ctx.stroke();
    }

    ctx.shadowBlur = 0;
    hueShift = (hueShift + 0.6) % 360;
  };

  /* ── Animation loop ── */
  const animate = () => {
    if (!analyser) return;
    const mode = MODES[currentMode];
    if (mode === 'Wave') {
      analyser.getByteTimeDomainData(waveArr);
      analyser.getByteFrequencyData(freqArr); // still need freq for bass pulse
      drawWave();
    } else {
      analyser.getByteFrequencyData(freqArr);
      if      (mode === 'Bars')      drawBars();
      else if (mode === 'Radial')    drawRadial();
      else if (mode === 'Particles') drawParticles();
    }
    raf = requestAnimationFrame(animate);
  };

  /* ── Mic setup ── */
  const startMic = async () => {
    try {
      stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
      audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      const source = audioCtx.createMediaStreamSource(stream);
      analyser = audioCtx.createAnalyser();
      analyser.fftSize = 256;
      analyser.smoothingTimeConstant = .80;
      source.connect(analyser);
      freqArr = new Uint8Array(analyser.frequencyBinCount);
      waveArr = new Uint8Array(analyser.fftSize);
      statusOverlay.remove();
      animate();
    } catch(e) {
      statusOverlay.querySelector('div').textContent = 'Microphone denied. Please allow access and try again.';
    }
  };

  /* ── Permission overlay ── */
  const statusOverlay = document.createElement('div');
  statusOverlay.style.cssText = 'position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:18px;z-index:5;background:#000;';
  statusOverlay.innerHTML = `
    <div style="font-size:3.5rem">🎙️</div>
    <div style="font-family:'Share Tech Mono',monospace;font-size:.72rem;color:var(--dim);letter-spacing:.12em;text-transform:uppercase;text-align:center;max-width:260px;line-height:1.6;">Tap to start the visualizer<br><span style="font-size:.58rem;opacity:.6">Microphone access required</span></div>`;
  const micBtn = document.createElement('button');
  micBtn.textContent = 'Enable Mic';
  micBtn.style.cssText = 'font-family:"Orbitron",sans-serif;font-size:.6rem;letter-spacing:.15em;text-transform:uppercase;color:#050508;background:var(--cyan);border:none;padding:13px 30px;border-radius:22px;cursor:pointer;box-shadow:var(--gc);-webkit-tap-highlight-color:transparent;';
  micBtn.onclick = () => startMic();
  statusOverlay.appendChild(micBtn);
  wrap.appendChild(statusOverlay);

  return () => {
    cancelAnimationFrame(raf);
    ro.disconnect();
    if (stream)   stream.getTracks().forEach(t => t.stop());
    if (audioCtx) audioCtx.close();
  };
}
