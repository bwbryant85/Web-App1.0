/* ════════════ TIMER (Stopwatch + Countdown) ════════════ */
function initTimer() {
  const wrap = document.createElement('div');
  wrap.style.cssText = 'width:100%;height:100%;display:flex;flex-direction:column;align-items:center;background:#050508;overflow:hidden;padding-top:89px;padding-bottom:calc(var(--sb,0px) + 24px);';
  content.appendChild(wrap);

  /* ── Tab bar ── */
  const tabBar = document.createElement('div');
  tabBar.style.cssText = 'display:flex;gap:0;background:rgba(255,255,255,.06);border-radius:22px;padding:3px;margin-bottom:28px;flex-shrink:0;';
  tabBar.innerHTML = `
    <button id="t-sw" style="font-family:'Orbitron',sans-serif;font-size:.58rem;letter-spacing:.14em;text-transform:uppercase;border:none;padding:9px 28px;border-radius:18px;cursor:pointer;transition:background .2s,color .2s;-webkit-tap-highlight-color:transparent;background:var(--cyan);color:#050508;">Stopwatch</button>
    <button id="t-cd" style="font-family:'Orbitron',sans-serif;font-size:.58rem;letter-spacing:.14em;text-transform:uppercase;border:none;padding:9px 28px;border-radius:18px;cursor:pointer;transition:background .2s,color .2s;-webkit-tap-highlight-color:transparent;background:transparent;color:var(--dim);">Countdown</button>`;
  wrap.appendChild(tabBar);

  const panel = document.createElement('div');
  panel.style.cssText = 'width:100%;flex:1;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:24px;padding:0 24px;';
  wrap.appendChild(panel);

  let activeTab = 'sw';

  /* ══ STOPWATCH ══ */
  let swRunning = false, swStart = 0, swElapsed = 0, swRaf = null, swLaps = [];

  const renderSW = () => {
    panel.innerHTML = '';

    const display = document.createElement('div');
    display.style.cssText = 'font-family:"Share Tech Mono",monospace;font-size:clamp(3.2rem,18vw,6rem);color:var(--cyan);letter-spacing:.06em;text-shadow:0 0 30px rgba(0,255,204,.8);text-align:center;line-height:1;';
    display.id = 'sw-disp';
    panel.appendChild(display);

    const ms = document.createElement('div');
    ms.style.cssText = 'font-family:"Share Tech Mono",monospace;font-size:1.4rem;color:rgba(0,255,204,.5);letter-spacing:.08em;margin-top:-8px;';
    ms.id = 'sw-ms';
    panel.appendChild(ms);

    const btns = document.createElement('div');
    btns.style.cssText = 'display:flex;gap:16px;margin-top:8px;';

    const resetBtn = document.createElement('button');
    resetBtn.textContent = swRunning ? 'Lap' : 'Reset';
    resetBtn.style.cssText = 'font-family:"Orbitron",sans-serif;font-size:.6rem;letter-spacing:.15em;text-transform:uppercase;color:var(--text);background:rgba(255,255,255,.08);border:1px solid rgba(255,255,255,.15);padding:13px 28px;border-radius:50px;cursor:pointer;-webkit-tap-highlight-color:transparent;min-width:110px;';
    resetBtn.id = 'sw-lap';

    const startBtn = document.createElement('button');
    startBtn.textContent = swRunning ? 'Stop' : 'Start';
    startBtn.style.cssText = `font-family:"Orbitron",sans-serif;font-size:.6rem;letter-spacing:.15em;text-transform:uppercase;color:#050508;background:${swRunning ? '#ff6b6b' : 'var(--cyan)'};border:none;padding:13px 28px;border-radius:50px;cursor:pointer;-webkit-tap-highlight-color:transparent;box-shadow:var(--gc);min-width:110px;`;
    startBtn.id = 'sw-start';

    btns.appendChild(resetBtn);
    btns.appendChild(startBtn);
    panel.appendChild(btns);

    // Lap list - Apple style
    if (swLaps.length) {
      const lapWrap = document.createElement('div');
      lapWrap.style.cssText = 'width:100%;max-width:420px;overflow-y:auto;max-height:280px;-webkit-overflow-scrolling:touch;';

      // Find fastest and slowest to color them
      // swLaps stores cumulative times; compute individual lap durations
      const lapTimes = swLaps.map((t,i) => {
        // parse "M:SS.cs" or "H:MM:SS.cs" back to ms
        const parse = str => {
          const parts = str.split(':');
          let ms = 0;
          if(parts.length === 3) {
            ms = parseInt(parts[0])*3600000 + parseInt(parts[1])*60000;
            ms += parseFloat(parts[2])*1000;
          } else {
            ms = parseInt(parts[0])*60000 + parseFloat(parts[1])*1000;
          }
          return ms;
        };
        const cur2 = parse(t);
        const prev = i > 0 ? parse(swLaps[i-1]) : 0;
        return cur2 - prev;
      });
      const fastest = Math.min(...lapTimes);
      const slowest = Math.max(...lapTimes);
      const allSame = fastest === slowest;

      swLaps.slice().reverse().forEach((lap, i) => {
        const lapIdx = swLaps.length - 1 - i; // actual index in array
        const lapNum = swLaps.length - i;
        const lapDur = lapTimes[lapIdx];
        const isFastest = !allSame && lapDur === fastest;
        const isSlowest = !allSame && lapDur === slowest;
        const col = isFastest ? '#30d158' : isSlowest ? '#ff453a' : 'rgba(255,255,255,0.85)';

        // Format individual lap duration
        const fmtLap = ms => {
          const m2 = Math.floor(ms/60000);
          const sec = Math.floor((ms%60000)/1000);
          const cs2 = Math.floor((ms%1000)/10);
          return m2 + ':' + String(sec).padStart(2,'0') + '.' + String(cs2).padStart(2,'0');
        };

        const row = document.createElement('div');
        row.style.cssText = 'display:flex;justify-content:space-between;align-items:center;padding:12px 0;border-bottom:1px solid rgba(255,255,255,0.08);';
        row.innerHTML = `
          <span style="font-family:'Share Tech Mono',monospace;font-size:.85rem;color:${col};min-width:60px;">Lap ${lapNum}</span>
          <span style="font-family:'Share Tech Mono',monospace;font-size:.85rem;color:${col};letter-spacing:.04em;">${fmtLap(lapDur)}</span>`;
        lapWrap.appendChild(row);
      });
      panel.appendChild(lapWrap);
    }

    const fmtSW = ms => {
      const total = swElapsed + (swRunning ? Date.now() - swStart : 0);
      const h = Math.floor(total / 3600000);
      const m = Math.floor((total % 3600000) / 60000);
      const s = Math.floor((total % 60000) / 1000);
      const cs = Math.floor((total % 1000) / 10);
      const disp = document.getElementById('sw-disp');
      const msDisp = document.getElementById('sw-ms');
      if (disp) disp.textContent = (h ? `${h}:` : '') + (h ? String(m).padStart(2,'0') : m) + ':' + String(s).padStart(2,'0');
      if (msDisp) msDisp.textContent = '.' + String(cs).padStart(2,'0');
    };
    fmtSW();

    const tick = () => { fmtSW(); swRaf = requestAnimationFrame(tick); };

    document.getElementById('sw-start').onclick = () => {
      haptic('medium');
      if (swRunning) {
        swElapsed += Date.now() - swStart;
        swRunning = false;
        cancelAnimationFrame(swRaf);
      } else {
        swStart = Date.now();
        swRunning = true;
        tick();
      }
      renderSW();
    };

    document.getElementById('sw-lap').onclick = () => {
      haptic('light');
      if (swRunning) {
        const total = swElapsed + (Date.now() - swStart);
        const h = Math.floor(total / 3600000);
        const m = Math.floor((total % 3600000) / 60000);
        const s = Math.floor((total % 60000) / 1000);
        const cs = Math.floor((total % 1000) / 10);
        swLaps.push((h ? `${h}:` : '') + (h ? String(m).padStart(2,'0') : m) + ':' + String(s).padStart(2,'0') + '.' + String(cs).padStart(2,'0'));
        renderSW();
        if (swRunning) tick();
      } else {
        swElapsed = 0; swLaps = []; renderSW();
      }
    };

    if (swRunning) tick();
  };

  /* ══ COUNTDOWN ══ */
  let cdRunning = false, cdRemaining = 0, cdTarget = 0, cdInterval = null;
  let cdH = 0, cdM = 0, cdS = 0;

  const fmtCD = ms => {
    const total = Math.max(0, ms);
    const h = Math.floor(total / 3600000);
    const m = Math.floor((total % 3600000) / 60000);
    const s = Math.floor((total % 60000) / 1000);
    return (h ? `${h}:` : '') + (h ? String(m).padStart(2,'0') : m) + ':' + String(s).padStart(2,'0');
  };

  const renderCD = () => {
    panel.innerHTML = '';
    if (cdRunning || cdRemaining > 0) {
      // Active countdown
      const display = document.createElement('div');
      const rem = cdRunning ? Math.max(0, cdTarget - Date.now()) : cdRemaining;
      const pct = cdRemaining > 0 ? rem / ((cdH*3600 + cdM*60 + cdS)*1000) : 0;

      display.style.cssText = 'position:relative;width:200px;height:200px;display:flex;align-items:center;justify-content:center;flex-shrink:0;';
      display.innerHTML = `
        <svg width="200" height="200" style="position:absolute;inset:0;transform:rotate(-90deg)">
          <circle cx="100" cy="100" r="88" fill="none" stroke="rgba(255,255,255,.06)" stroke-width="8"/>
          <circle id="cd-arc" cx="100" cy="100" r="88" fill="none" stroke="var(--cyan)" stroke-width="8"
            stroke-linecap="round" stroke-dasharray="553" stroke-dashoffset="${553*(1-pct)}"
            style=""/>
        </svg>
        <div style="display:flex;flex-direction:column;align-items:center;gap:4px;position:relative">
          <div id="cd-disp" style="font-family:'Share Tech Mono',monospace;font-size:clamp(2rem,12vw,3.2rem);color:var(--cyan);letter-spacing:.06em;text-shadow:0 0 30px rgba(0,255,204,.8);">${fmtCD(rem)}</div>
          <div id="cd-label" style="font-family:'Share Tech Mono',monospace;font-size:.58rem;color:var(--dim);letter-spacing:.15em;text-transform:uppercase;">${cdRunning ? 'Running' : 'Paused'}</div>
        </div>`;
      panel.appendChild(display);

      const btns = document.createElement('div');
      btns.style.cssText = 'display:flex;gap:16px;margin-top:16px;';

      const cancelBtn = document.createElement('button');
      cancelBtn.textContent = 'Cancel';
      cancelBtn.style.cssText = 'font-family:"Orbitron",sans-serif;font-size:.6rem;letter-spacing:.15em;text-transform:uppercase;color:var(--text);background:rgba(255,255,255,.08);border:1px solid rgba(255,255,255,.15);padding:13px 28px;border-radius:50px;cursor:pointer;-webkit-tap-highlight-color:transparent;min-width:110px;';
      cancelBtn.onclick = () => {
        haptic('medium');
        clearInterval(cdInterval); cdRunning = false; cdRemaining = 0;
        renderCD();
      };

      const pauseBtn = document.createElement('button');
      pauseBtn.textContent = cdRunning ? 'Pause' : 'Resume';
      pauseBtn.style.cssText = `font-family:"Orbitron",sans-serif;font-size:.6rem;letter-spacing:.15em;text-transform:uppercase;color:#050508;background:${cdRunning ? '#ffd740' : 'var(--cyan)'};border:none;padding:13px 28px;border-radius:50px;cursor:pointer;-webkit-tap-highlight-color:transparent;box-shadow:var(--gc);min-width:110px;`;
      pauseBtn.onclick = () => {
        haptic('medium');
        if (cdRunning) {
          cdRemaining = Math.max(0, cdTarget - Date.now());
          clearInterval(cdInterval); cdRunning = false;
        } else {
          cdTarget = Date.now() + cdRemaining; cdRunning = true;
          startCDTick();
        }
        renderCD();
      };

      btns.appendChild(cancelBtn);
      btns.appendChild(pauseBtn);
      panel.appendChild(btns);

    } else {
      // Picker
      const pickerLabel = document.createElement('div');
      pickerLabel.style.cssText = 'font-family:"Share Tech Mono",monospace;font-size:.6rem;color:var(--dim);letter-spacing:.2em;text-transform:uppercase;margin-bottom:4px;';
      pickerLabel.textContent = 'Set Duration';
      panel.appendChild(pickerLabel);

      const pickerRow = document.createElement('div');
      pickerRow.style.cssText = 'display:flex;align-items:center;gap:4px;';

      const mkSpinner = (label, min, max, val, onCh) => {
        const col = document.createElement('div');
        col.style.cssText = 'display:flex;flex-direction:column;align-items:center;gap:6px;';
        const up = document.createElement('button');
        up.textContent = '▲'; up.style.cssText = 'font-size:1.2rem;background:transparent;border:none;color:var(--dim);cursor:pointer;padding:4px 12px;-webkit-tap-highlight-color:transparent;';
        const num = document.createElement('div');
        num.style.cssText = 'font-family:"Share Tech Mono",monospace;font-size:2.6rem;color:var(--cyan);letter-spacing:.06em;min-width:72px;text-align:center;text-shadow:0 0 20px rgba(0,255,204,.6);';
        num.textContent = String(val).padStart(2,'0');
        const dn = document.createElement('button');
        dn.textContent = '▼'; dn.style.cssText = up.style.cssText;
        const lbl = document.createElement('div');
        lbl.style.cssText = 'font-family:"Share Tech Mono",monospace;font-size:.5rem;color:var(--dim);letter-spacing:.14em;text-transform:uppercase;';
        lbl.textContent = label;
        up.onclick = () => { haptic('light'); val = val >= max ? min : val + 1; num.textContent = String(val).padStart(2,'0'); onCh(val); };
        dn.onclick = () => { haptic('light'); val = val <= min ? max : val - 1; num.textContent = String(val).padStart(2,'0'); onCh(val); };
        col.appendChild(up); col.appendChild(num); col.appendChild(dn); col.appendChild(lbl);
        return col;
      };

      const sep = document.createElement('div');
      sep.style.cssText = 'font-family:"Share Tech Mono",monospace;font-size:2.6rem;color:var(--dim);padding-bottom:22px;';
      sep.textContent = ':';
      const sep2 = sep.cloneNode(true);

      pickerRow.appendChild(mkSpinner('Hours',   0, 23, cdH, v => cdH = v));
      pickerRow.appendChild(sep);
      pickerRow.appendChild(mkSpinner('Minutes', 0, 59, cdM, v => cdM = v));
      pickerRow.appendChild(sep2);
      pickerRow.appendChild(mkSpinner('Seconds', 0, 59, cdS, v => cdS = v));
      panel.appendChild(pickerRow);

      const startBtn = document.createElement('button');
      startBtn.textContent = 'Start →';
      startBtn.style.cssText = 'font-family:"Orbitron",sans-serif;font-size:.6rem;letter-spacing:.15em;text-transform:uppercase;color:#050508;background:var(--cyan);border:none;padding:13px 32px;border-radius:50px;cursor:pointer;box-shadow:var(--gc);-webkit-tap-highlight-color:transparent;margin-top:8px;';
      startBtn.onclick = () => {
        const totalMs = (cdH * 3600 + cdM * 60 + cdS) * 1000;
        if (!totalMs) return;
        haptic('medium');
        cdRemaining = totalMs;
        cdTarget = Date.now() + totalMs;
        cdRunning = true;
        renderCD();
        startCDTick();
      };
      panel.appendChild(startBtn);
    }
  };

  const startCDTick = () => {
    clearInterval(cdInterval);
    cdInterval = setInterval(() => {
      const rem = Math.max(0, cdTarget - Date.now());
      const disp = document.getElementById('cd-disp');
      const arc  = document.getElementById('cd-arc');
      const lbl  = document.getElementById('cd-label');
      const totalMs = (cdH*3600 + cdM*60 + cdS)*1000;
      if (disp) disp.textContent = fmtCD(rem);
      if (arc)  arc.style.strokeDashoffset = String(553 * (1 - rem / totalMs));
      if (rem <= 0) {
        clearInterval(cdInterval); cdRunning = false; cdRemaining = 0;
        haptic('success');
        if (lbl) lbl.textContent = 'Done!';
        if (arc) arc.style.stroke = 'var(--mag)';
        setTimeout(() => renderCD(), 2000);
      }
    }, 100);
  };

  /* ── Tab switching ── */
  const swTab = () => {
    activeTab = 'sw';
    document.getElementById('t-sw').style.background = 'var(--cyan)';
    document.getElementById('t-sw').style.color = '#050508';
    document.getElementById('t-cd').style.background = 'transparent';
    document.getElementById('t-cd').style.color = 'var(--dim)';
    cancelAnimationFrame(swRaf);
    clearInterval(cdInterval);
    renderSW();
  };
  const cdTab = () => {
    activeTab = 'cd';
    document.getElementById('t-cd').style.background = 'var(--cyan)';
    document.getElementById('t-cd').style.color = '#050508';
    document.getElementById('t-sw').style.background = 'transparent';
    document.getElementById('t-sw').style.color = 'var(--dim)';
    cancelAnimationFrame(swRaf);
    renderCD();
  };

  document.getElementById('t-sw').onclick = () => { haptic('light'); swTab(); };
  document.getElementById('t-cd').onclick = () => { haptic('light'); cdTab(); };

  renderSW();

  return () => {
    cancelAnimationFrame(swRaf);
    clearInterval(cdInterval);
  };
}
