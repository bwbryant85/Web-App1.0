/* ════════════ TIMER (Stopwatch + Countdown) ════════════ */
function initTimer() {
  const wrap = document.createElement('div');
  wrap.style.cssText = 'width:100%;height:100%;display:flex;flex-direction:column;align-items:center;background:var(--win-chrome);overflow:hidden;padding-top:0;padding-bottom:8px;';
  content.appendChild(wrap);

  /* ── Tab bar ── */
  const tabBar = document.createElement('div');
  tabBar.style.cssText = [
    'display:flex;gap:0;background:var(--win-chrome);flex-shrink:0;',
    'border-bottom:2px solid;',
    'border-color:var(--win-chrome-dark) var(--win-chrome-light) var(--win-chrome-light) var(--win-chrome-dark);',
    'width:100%;',
  ].join('');
  tabBar.innerHTML = `
    <button id="t-sw" style="font-family:var(--pixel-font);font-size:.95rem;border:none;border-right:2px solid var(--win-chrome-dark);padding:8px 0;cursor:pointer;-webkit-tap-highlight-color:transparent;flex:1;background:var(--win-chrome-highlight);color:var(--win-text);font-weight:bold;">Stopwatch</button>
    <button id="t-cd" style="font-family:var(--pixel-font);font-size:.95rem;border:none;padding:8px 0;cursor:pointer;-webkit-tap-highlight-color:transparent;flex:1;background:var(--win-chrome);color:var(--win-text-dim);">Countdown</button>`;
  wrap.appendChild(tabBar);

  const panel = document.createElement('div');
  panel.style.cssText = 'width:100%;flex:1;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:20px;padding:0 16px;overflow:hidden;';
  wrap.appendChild(panel);

  let activeTab = 'sw';

  /* helper: Win98 button style */
  const btn98Style = (primary) => [
    'font-family:var(--pixel-font);font-size:.95rem;',
    primary
      ? 'color:var(--win-select-text);background:var(--win-select);'
      : 'color:var(--win-text);background:var(--win-btn-face);',
    'border:2px solid;',
    primary
      ? 'border-color:var(--win-chrome-light) var(--win-chrome-dark) var(--win-chrome-dark) var(--win-chrome-light);'
      : 'border-color:var(--win-chrome-light) var(--win-chrome-dark) var(--win-chrome-dark) var(--win-chrome-light);',
    'padding:8px 24px;cursor:pointer;-webkit-tap-highlight-color:transparent;min-width:110px;',
  ].join('');

  /* ══ STOPWATCH ══ */
  let swRunning = false, swStart = 0, swElapsed = 0, swRaf = null, swLaps = [];

  const renderSW = () => {
    panel.innerHTML = '';

    const display = document.createElement('div');
    display.style.cssText = [
      'font-family:var(--mono-font),monospace;font-size:clamp(2.8rem,16vw,5.5rem);',
      'color:var(--win-text);letter-spacing:.06em;text-align:center;line-height:1;',
      'background:#fff;border:2px solid;',
      'border-color:var(--win-chrome-dark) var(--win-chrome-light) var(--win-chrome-light) var(--win-chrome-dark);',
      'padding:12px 20px;width:100%;max-width:380px;',
    ].join('');
    display.id = 'sw-disp';
    panel.appendChild(display);

    const ms = document.createElement('div');
    ms.style.cssText = 'font-family:var(--mono-font),monospace;font-size:1.3rem;color:var(--win-text-dim);letter-spacing:.08em;margin-top:-6px;';
    ms.id = 'sw-ms';
    panel.appendChild(ms);

    const btns = document.createElement('div');
    btns.style.cssText = 'display:flex;gap:10px;margin-top:4px;';

    const resetBtn = document.createElement('button');
    resetBtn.textContent = swRunning ? 'Lap' : 'Reset';
    resetBtn.style.cssText = btn98Style(false);
    resetBtn.id = 'sw-lap';

    const startBtn = document.createElement('button');
    startBtn.textContent = swRunning ? 'Stop' : 'Start';
    startBtn.style.cssText = btn98Style(true);
    if (swRunning) startBtn.style.background = '#800000';
    startBtn.id = 'sw-start';

    btns.appendChild(resetBtn);
    btns.appendChild(startBtn);
    panel.appendChild(btns);

    /* Lap list */
    if (swLaps.length) {
      const lapWrap = document.createElement('div');
      lapWrap.style.cssText = [
        'width:100%;max-width:380px;overflow-y:auto;max-height:220px;',
        '-webkit-overflow-scrolling:touch;',
        'border:2px solid;',
        'border-color:var(--win-chrome-dark) var(--win-chrome-light) var(--win-chrome-light) var(--win-chrome-dark);',
        'background:#fff;',
      ].join('');

      const parse = str => {
        const parts = str.split(':');
        let ms = 0;
        if(parts.length === 3) { ms = parseInt(parts[0])*3600000 + parseInt(parts[1])*60000; ms += parseFloat(parts[2])*1000; }
        else { ms = parseInt(parts[0])*60000 + parseFloat(parts[1])*1000; }
        return ms;
      };
      const lapTimes = swLaps.map((t,i) => { const cur2=parse(t); const prev=i>0?parse(swLaps[i-1]):0; return cur2-prev; });
      const fastest = Math.min(...lapTimes);
      const slowest = Math.max(...lapTimes);
      const allSame = fastest === slowest;

      swLaps.slice().reverse().forEach((lap, i) => {
        const lapIdx = swLaps.length - 1 - i;
        const lapNum = swLaps.length - i;
        const lapDur = lapTimes[lapIdx];
        const isFastest = !allSame && lapDur === fastest;
        const isSlowest = !allSame && lapDur === slowest;
        const col = isFastest ? '#008000' : isSlowest ? '#800000' : '#000';
        const fmtLap = ms => { const m2=Math.floor(ms/60000); const sec=Math.floor((ms%60000)/1000); const cs2=Math.floor((ms%1000)/10); return m2+':'+String(sec).padStart(2,'0')+'.'+String(cs2).padStart(2,'0'); };
        const row = document.createElement('div');
        row.style.cssText = `display:flex;justify-content:space-between;align-items:center;padding:5px 10px;border-bottom:1px solid var(--win-chrome-dark);background:${(lapIdx%2===0)?'#fff':'#f0f0f0'};`;
        row.innerHTML = `
          <span style="font-family:var(--pixel-font);font-size:.9rem;color:${col};">Lap ${lapNum}</span>
          <span style="font-family:var(--mono-font),monospace;font-size:.9rem;color:${col};letter-spacing:.04em;">${fmtLap(lapDur)}</span>`;
        lapWrap.appendChild(row);
      });
      panel.appendChild(lapWrap);
    }

    const fmtSW = () => {
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
      if (swRunning) { swElapsed += Date.now() - swStart; swRunning = false; cancelAnimationFrame(swRaf); }
      else { swStart = Date.now(); swRunning = true; tick(); }
      renderSW();
    };

    document.getElementById('sw-lap').onclick = () => {
      haptic('light');
      if (swRunning) {
        const total = swElapsed + (Date.now() - swStart);
        const h=Math.floor(total/3600000), m=Math.floor((total%3600000)/60000), s=Math.floor((total%60000)/1000), cs=Math.floor((total%1000)/10);
        swLaps.push((h?`${h}:`:'')+(h?String(m).padStart(2,'0'):m)+':'+String(s).padStart(2,'0')+'.'+String(cs).padStart(2,'0'));
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
    const h=Math.floor(total/3600000), m=Math.floor((total%3600000)/60000), s=Math.floor((total%60000)/1000);
    return (h ? `${h}:` : '') + (h ? String(m).padStart(2,'0') : m) + ':' + String(s).padStart(2,'0');
  };

  const renderCD = () => {
    panel.innerHTML = '';
    if (cdRunning || cdRemaining > 0) {
      const rem = cdRunning ? Math.max(0, cdTarget - Date.now()) : cdRemaining;
      const totalMs = (cdH*3600 + cdM*60 + cdS)*1000;
      const pct = totalMs > 0 ? rem / totalMs : 0;

      /* Progress ring */
      const ring = document.createElement('div');
      ring.style.cssText = 'position:relative;width:180px;height:180px;display:flex;align-items:center;justify-content:center;flex-shrink:0;';
      ring.innerHTML = `
        <svg width="180" height="180" style="position:absolute;inset:0;transform:rotate(-90deg)">
          <circle cx="90" cy="90" r="78" fill="none" stroke="var(--win-chrome-dark)" stroke-width="6"/>
          <circle id="cd-arc" cx="90" cy="90" r="78" fill="none" stroke="var(--win-select)" stroke-width="6"
            stroke-linecap="square" stroke-dasharray="490" stroke-dashoffset="${490*(1-pct)}"/>
        </svg>
        <div style="display:flex;flex-direction:column;align-items:center;gap:4px;position:relative">
          <div id="cd-disp" style="font-family:var(--mono-font),monospace;font-size:clamp(1.8rem,10vw,2.8rem);color:var(--win-text);letter-spacing:.06em;">${fmtCD(rem)}</div>
          <div id="cd-label" style="font-family:var(--pixel-font);font-size:.85rem;color:var(--win-text-dim);letter-spacing:.1em;text-transform:uppercase;">${cdRunning ? 'Running' : 'Paused'}</div>
        </div>`;
      panel.appendChild(ring);

      const btns = document.createElement('div');
      btns.style.cssText = 'display:flex;gap:10px;margin-top:8px;';

      const cancelBtn = document.createElement('button');
      cancelBtn.textContent = 'Cancel';
      cancelBtn.style.cssText = btn98Style(false);
      cancelBtn.onclick = () => { haptic('medium'); clearInterval(cdInterval); cdRunning = false; cdRemaining = 0; renderCD(); };

      const pauseBtn = document.createElement('button');
      pauseBtn.textContent = cdRunning ? 'Pause' : 'Resume';
      pauseBtn.style.cssText = btn98Style(true);
      pauseBtn.onclick = () => {
        haptic('medium');
        if (cdRunning) { cdRemaining = Math.max(0, cdTarget - Date.now()); clearInterval(cdInterval); cdRunning = false; }
        else { cdTarget = Date.now() + cdRemaining; cdRunning = true; startCDTick(); }
        renderCD();
      };

      btns.appendChild(cancelBtn);
      btns.appendChild(pauseBtn);
      panel.appendChild(btns);

    } else {
      /* Picker */
      const pickerLabel = document.createElement('div');
      pickerLabel.style.cssText = 'font-family:var(--pixel-font);font-size:.9rem;color:var(--win-text);letter-spacing:.1em;text-transform:uppercase;margin-bottom:6px;';
      pickerLabel.textContent = 'Set Duration';
      panel.appendChild(pickerLabel);

      const pickerRow = document.createElement('div');
      pickerRow.style.cssText = 'display:flex;align-items:center;gap:4px;';

      const mkSpinner = (label, min, max, val, onCh) => {
        const col = document.createElement('div');
        col.style.cssText = 'display:flex;flex-direction:column;align-items:center;gap:4px;';
        const up = document.createElement('button');
        up.textContent = '▲';
        up.style.cssText = 'font-size:1rem;background:var(--win-btn-face);border:2px solid;border-color:var(--win-chrome-light) var(--win-chrome-dark) var(--win-chrome-dark) var(--win-chrome-light);color:var(--win-text);cursor:pointer;padding:3px 10px;-webkit-tap-highlight-color:transparent;';
        const num = document.createElement('div');
        num.style.cssText = 'font-family:var(--mono-font),monospace;font-size:2.2rem;color:var(--win-text);min-width:64px;text-align:center;background:#fff;border:2px solid;border-color:var(--win-chrome-dark) var(--win-chrome-light) var(--win-chrome-light) var(--win-chrome-dark);padding:4px 0;';
        num.textContent = String(val).padStart(2,'0');
        const dn = document.createElement('button');
        dn.textContent = '▼';
        dn.style.cssText = up.style.cssText;
        const lbl = document.createElement('div');
        lbl.style.cssText = 'font-family:var(--pixel-font);font-size:.75rem;color:var(--win-text-dim);letter-spacing:.1em;text-transform:uppercase;';
        lbl.textContent = label;
        up.onclick = () => { haptic('light'); val = val >= max ? min : val + 1; num.textContent = String(val).padStart(2,'0'); onCh(val); };
        dn.onclick = () => { haptic('light'); val = val <= min ? max : val - 1; num.textContent = String(val).padStart(2,'0'); onCh(val); };
        col.appendChild(up); col.appendChild(num); col.appendChild(dn); col.appendChild(lbl);
        return col;
      };

      const sep = document.createElement('div');
      sep.style.cssText = 'font-family:var(--mono-font),monospace;font-size:2.2rem;color:var(--win-text);padding-bottom:20px;';
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
      startBtn.style.cssText = btn98Style(true);
      startBtn.style.marginTop = '10px';
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
      if (arc)  arc.style.strokeDashoffset = String(490 * (1 - rem / totalMs));
      if (rem <= 0) {
        clearInterval(cdInterval); cdRunning = false; cdRemaining = 0;
        haptic('success');
        if (lbl) { lbl.textContent = 'Done!'; lbl.style.color = '#008000'; }
        if (arc) arc.style.stroke = '#008000';
        setTimeout(() => renderCD(), 2000);
      }
    }, 100);
  };

  /* ── Tab switching ── */
  const swTab = () => {
    activeTab = 'sw';
    document.getElementById('t-sw').style.cssText = 'font-family:var(--pixel-font);font-size:.95rem;border:none;border-right:2px solid var(--win-chrome-dark);padding:8px 0;cursor:pointer;-webkit-tap-highlight-color:transparent;flex:1;background:var(--win-chrome-highlight);color:var(--win-text);font-weight:bold;';
    document.getElementById('t-cd').style.cssText = 'font-family:var(--pixel-font);font-size:.95rem;border:none;padding:8px 0;cursor:pointer;-webkit-tap-highlight-color:transparent;flex:1;background:var(--win-chrome);color:var(--win-text-dim);';
    cancelAnimationFrame(swRaf);
    clearInterval(cdInterval);
    renderSW();
  };
  const cdTab = () => {
    activeTab = 'cd';
    document.getElementById('t-cd').style.cssText = 'font-family:var(--pixel-font);font-size:.95rem;border:none;border-left:2px solid var(--win-chrome-dark);padding:8px 0;cursor:pointer;-webkit-tap-highlight-color:transparent;flex:1;background:var(--win-chrome-highlight);color:var(--win-text);font-weight:bold;';
    document.getElementById('t-sw').style.cssText = 'font-family:var(--pixel-font);font-size:.95rem;border:none;border-right:2px solid var(--win-chrome-dark);padding:8px 0;cursor:pointer;-webkit-tap-highlight-color:transparent;flex:1;background:var(--win-chrome);color:var(--win-text-dim);';
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
