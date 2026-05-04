/* ════════════ COLOR MEMORY GAME v2 ════════════
   Full-screen layout, large color display, horizontal hue wheel,
   vertical saturation/lightness sliders, progress ring timer.
════════════════════════════════════════════════ */
function initColorGame() {
  const N = 5;
  let colors = [], currentIdx = 0, scores = [], timerInt = null;
  let cs = { h:180, s:60, l:50 };
  let colorSide = null, hueKnob = null, sTrack = null, lTrack = null;
  let hueVal = 180, satVal = 60, litVal = 50;

  /* ── inject styles once ── */
  if (!document.getElementById('cg-styles')) {
    const st = document.createElement('style');
    st.id = 'cg-styles';
    st.textContent = `
      .cg-root {
        width:100%; height:100%; display:flex; flex-direction:column;
        background:#050508; overflow:hidden; box-sizing:border-box;
        font-family:'Share Tech Mono',monospace;
      }

      /* ── START SCREEN ── */
      .cg-start-root {
        width:100%; height:100%; display:flex; flex-direction:column;
        align-items:center; justify-content:space-between;
        background:#050508; box-sizing:border-box;
        padding-top:0; padding-bottom:0;
      }
      .cg-start-palette {
        flex:1; width:100%; display:flex;
      }
      .cg-start-swatch {
        flex:1; transition:flex .4s;
      }
      .cg-start-bottom {
        width:100%; padding:28px 28px calc(${typeof SA !== 'undefined' ? SA.b : 0}px + 36px);
        display:flex; flex-direction:column; align-items:center; gap:16px;
        background:linear-gradient(0deg,#050508 80%,transparent);
      }

      /* ── MEMORIZE SCREEN ── */
      .cg-mem-root {
        width:100%; height:100%; display:flex; flex-direction:column;
        align-items:center; justify-content:center; position:relative;
        transition:background .3s;
      }
      .cg-mem-hud {
        position:absolute; top:0; left:0; right:0;
        display:flex; justify-content:space-between; align-items:center;
        padding:12px 20px; background:rgba(0,0,0,.18);
      }
      .cg-timer-ring {
        position:relative; width:96px; height:96px; flex-shrink:0;
      }
      .cg-timer-ring svg { position:absolute; inset:0; transform:rotate(-90deg); }
      .cg-timer-num {
        position:absolute; inset:0; display:flex; flex-direction:column;
        align-items:center; justify-content:center;
        font-family:'Orbitron',sans-serif; font-size:1.9rem; font-weight:900; color:#fff;
        text-shadow:0 2px 10px rgba(0,0,0,.5);
      }
      .cg-timer-lbl { font-size:.38rem; opacity:.55; letter-spacing:.1em; text-transform:uppercase; }
      .cg-mem-label {
        font-family:'Orbitron',sans-serif; font-size:1.1rem; font-weight:900;
        color:#fff; text-shadow:0 2px 16px rgba(0,0,0,.6);
        letter-spacing:.1em; text-transform:uppercase; text-align:center;
      }
      .cg-mem-sublabel {
        font-size:.62rem; color:rgba(255,255,255,.45); letter-spacing:.12em;
        text-transform:uppercase; margin-top:6px;
      }
      @keyframes cg-pulse {
        0%,100%{transform:scale(1);}50%{transform:scale(1.06);}
      }

      /* ── RECALL SCREEN ── */
      .cg-recall-root {
        width:100%; height:100%; display:flex; flex-direction:column;
        background:#050508; overflow:hidden;
      }
      .cg-recall-preview-row {
        display:flex; flex-direction:row; flex:0 0 auto;
      }
      .cg-preview-half {
        flex:1; display:flex; align-items:center; justify-content:center;
        flex-direction:column; gap:4px; padding:10px 0;
        font-size:.44rem; color:rgba(255,255,255,.3);
        letter-spacing:.1em; text-transform:uppercase;
      }
      .cg-preview-swatch {
        width:100%; flex:1; min-height:0;
      }
      .cg-sliders-area {
        flex:1; display:flex; flex-direction:column; gap:0; min-height:0; padding:0 0 0;
      }
      .cg-slider-row {
        flex:1; display:flex; align-items:center; gap:0; padding:0 14px;
        border-bottom:1px solid rgba(255,255,255,.04);
      }
      .cg-slider-label {
        font-size:.48rem; color:rgba(255,255,255,.3); letter-spacing:.12em;
        text-transform:uppercase; width:20px; flex-shrink:0; text-align:center;
        writing-mode:vertical-rl; transform:rotate(180deg);
      }
      .cg-htrack {
        flex:1; height:36px; border-radius:18px; position:relative;
        cursor:pointer; margin:0 10px;
        box-shadow:0 2px 8px rgba(0,0,0,.4),inset 0 1px 0 rgba(255,255,255,.08);
      }
      .cg-hknob {
        position:absolute; top:50%; transform:translateY(-50%);
        width:32px; height:32px; border-radius:50%;
        background:#fff; border:3px solid rgba(0,0,0,.25);
        box-shadow:0 3px 12px rgba(0,0,0,.5),0 0 0 3px rgba(255,255,255,.2);
        cursor:grab; transition:transform .08s; touch-action:none;
        margin-left:-16px;
      }
      .cg-hknob:active { transform:translateY(-50%) scale(1.15); }

      .cg-vslider-wrap {
        flex:1; display:flex; align-items:stretch; height:100%;
        position:relative; margin:0 10px;
      }
      .cg-vtrack {
        flex:1; border-radius:12px; position:relative; cursor:pointer;
        box-shadow:0 2px 8px rgba(0,0,0,.4),inset 0 1px 0 rgba(255,255,255,.08);
      }
      .cg-vknob {
        position:absolute; left:50%; transform:translateX(-50%);
        width:32px; height:32px; border-radius:50%;
        background:#fff; border:3px solid rgba(0,0,0,.25);
        box-shadow:0 3px 12px rgba(0,0,0,.5),0 0 0 3px rgba(255,255,255,.2);
        cursor:grab; touch-action:none;
      }

      .cg-recall-bottom {
        flex-shrink:0; padding:14px 20px 20px;
        display:flex; align-items:center; justify-content:space-between;
        background:#050508;
      }
      .cg-progress-dots { display:flex; gap:8px; align-items:center; }
      .cg-dot {
        width:8px; height:8px; border-radius:50%;
        background:rgba(255,255,255,.15); transition:background .3s, transform .3s;
      }
      .cg-dot.active { background:#00ffcc; transform:scale(1.3); }
      .cg-dot.done { background:rgba(0,255,204,.4); }

      /* ── RESULTS ── */
      .cg-results-root {
        width:100%; height:100%; display:flex; flex-direction:column;
        background:#050508; overflow-y:auto; -webkit-overflow-scrolling:touch;
        padding-bottom:20px; box-sizing:border-box;
      }
      .cg-res-row {
        display:flex; align-items:center; gap:14px;
        padding:14px 18px; border-bottom:1px solid rgba(255,255,255,.06);
        flex-shrink:0;
      }
      .cg-swatch-pair { display:flex; gap:4px; flex-shrink:0; }
      .cg-sw {
        width:52px; height:52px; border-radius:12px;
        box-shadow:0 4px 12px rgba(0,0,0,.5);
      }
      .cg-res-score {
        font-family:'Orbitron',sans-serif; font-size:.92rem;
        font-weight:900; letter-spacing:.06em;
      }
      .cg-res-lbl {
        font-size:.52rem; color:rgba(255,255,255,.3);
        letter-spacing:.06em; margin-top:3px;
      }

      @keyframes cg-score-in {
        from{opacity:0;transform:scale(.7) translateY(10px);}
        to{opacity:1;transform:scale(1) translateY(0);}
      }
    `;
    document.head.appendChild(st);
  }

  const hsl   = (h,s,l) => `hsl(${h},${s}%,${l}%)`;
  const hsl2hex = (h,s,l) => {
    s/=100; l/=100;
    const a=s*Math.min(l,1-l);
    const f=n=>{const k=(n+h/30)%12,c=l-a*Math.max(Math.min(k-3,9-k,1),-1);return Math.round(255*c).toString(16).padStart(2,'0');};
    return `#${f(0)}${f(8)}${f(4)}`;
  };
  const dist = (c,g) => {
    const dh=Math.min(Math.abs(c.h-g.h),360-Math.abs(c.h-g.h))/180;
    const ds=Math.abs(c.s-g.s)/100, dl=Math.abs(c.l-g.l)/100;
    return Math.sqrt(dh*dh+ds*ds+dl*dl)/Math.sqrt(3);
  };
  const genColors = () => Array.from({length:N},()=>({
    h:Math.floor(Math.random()*360),
    s:50+Math.floor(Math.random()*40),
    l:35+Math.floor(Math.random()*30),
  }));

  /* ── START SCREEN ── */
  const showStart = () => {
    content.innerHTML = '';
    const root = document.createElement('div');
    root.className = 'cg-start-root';
    content.appendChild(root);

    // Animated palette fills the top
    const palette = document.createElement('div');
    palette.className = 'cg-start-palette';
    root.appendChild(palette);

    const swatchHues = [0, 50, 120, 200, 270, 330];
    swatchHues.forEach((h, i) => {
      const sw = document.createElement('div');
      sw.className = 'cg-start-swatch';
      sw.style.background = `linear-gradient(180deg,${hsl(h,75,55)},${hsl(h,75,35)})`;
      sw.style.transitionDelay = (i*0.06)+'s';
      palette.appendChild(sw);
    });

    const bottom = document.createElement('div');
    bottom.className = 'cg-start-bottom';
    bottom.innerHTML = `
      <div style="font-family:'Orbitron',sans-serif;font-size:1.4rem;font-weight:900;
        color:#fff;letter-spacing:.1em;text-align:center;text-shadow:0 2px 16px rgba(0,0,0,.5);">
        COLOR MEMORY
      </div>
      <div style="font-size:.66rem;color:rgba(255,255,255,.45);letter-spacing:.1em;
        text-align:center;line-height:1.9;max-width:260px;">
        A color flashes on screen.<br>
        Memorize it — then recreate it<br>
        using the sliders.
      </div>
      <div style="display:flex;gap:20px;align-items:center;">
        <div style="text-align:center;">
          <div style="font-family:'Orbitron',sans-serif;font-size:1.1rem;font-weight:900;color:#00ffcc;">${N}</div>
          <div style="font-size:.48rem;color:rgba(255,255,255,.3);letter-spacing:.1em;text-transform:uppercase;">Rounds</div>
        </div>
        <div style="width:1px;height:30px;background:rgba(255,255,255,.1);"></div>
        <div style="text-align:center;">
          <div style="font-family:'Orbitron',sans-serif;font-size:1.1rem;font-weight:900;color:#00ffcc;">7s</div>
          <div style="font-size:.48rem;color:rgba(255,255,255,.3);letter-spacing:.1em;text-transform:uppercase;">To Memorize</div>
        </div>
        <div style="width:1px;height:30px;background:rgba(255,255,255,.1);"></div>
        <div style="text-align:center;">
          <div style="font-family:'Orbitron',sans-serif;font-size:1.1rem;font-weight:900;color:#00ffcc;">HSL</div>
          <div style="font-size:.48rem;color:rgba(255,255,255,.3);letter-spacing:.1em;text-transform:uppercase;">Sliders</div>
        </div>
      </div>
      <button id="cg-go" style="
        font-family:'Orbitron',sans-serif;font-weight:900;font-size:.88rem;
        letter-spacing:.14em;text-transform:uppercase;
        color:#030f08;background:linear-gradient(135deg,#00ffcc,#00cc99);
        border:none;padding:18px 60px;border-radius:50px;cursor:pointer;
        box-shadow:0 6px 0 #007744,0 8px 30px rgba(0,255,150,.4);
        -webkit-tap-highlight-color:transparent;
        transition:transform .1s,box-shadow .1s;"
        onpointerdown="this.style.transform='scale(.96) translateY(3px)';this.style.boxShadow='0 3px 0 #007744,0 4px 14px rgba(0,255,150,.3)'"
        onpointerup="this.style.transform='';this.style.boxShadow='0 6px 0 #007744,0 8px 30px rgba(0,255,150,.4)'">
        PLAY →
      </button>`;
    root.appendChild(bottom);

    document.getElementById('cg-go').onclick = () => {
      colors = genColors(); scores = []; currentIdx = 0; showMemorize();
    };
  };

  /* ── MEMORIZE SCREEN ── */
  const showMemorize = () => {
    content.innerHTML = '';
    colorSide = null; sTrack = null; lTrack = null;
    const c = colors[currentIdx];
    const hex = hsl2hex(c.h, c.s, c.l);

    const root = document.createElement('div');
    root.className = 'cg-mem-root';
    root.style.background = hex;
    content.appendChild(root);

    // HUD: round counter left, hex code right
    const hud = document.createElement('div');
    hud.className = 'cg-mem-hud';
    hud.innerHTML = `
      <div style="font-family:'Orbitron',sans-serif;font-size:.72rem;font-weight:900;
        color:rgba(255,255,255,.7);letter-spacing:.1em;">
        ${currentIdx+1} <span style="opacity:.4">/ ${N}</span>
      </div>
      <div style="font-family:'Share Tech Mono',monospace;font-size:.6rem;
        color:rgba(255,255,255,.45);letter-spacing:.1em;">${hex.toUpperCase()}</div>`;
    root.appendChild(hud);

    // Centre: big timer ring + label
    const centre = document.createElement('div');
    centre.style.cssText = 'display:flex;flex-direction:column;align-items:center;gap:20px;';
    root.appendChild(centre);

    const label = document.createElement('div');
    label.className = 'cg-mem-label';
    label.textContent = 'Memorize This Color';
    centre.appendChild(label);

    const sub = document.createElement('div');
    sub.className = 'cg-mem-sublabel';
    sub.textContent = 'You\'ll recreate it from memory';
    centre.appendChild(sub);

    // Timer ring SVG
    const RADIUS = 40, CIRC = 2 * Math.PI * RADIUS;
    const ring = document.createElement('div');
    ring.className = 'cg-timer-ring';
    ring.style.cssText = 'width:108px;height:108px;position:relative;';
    ring.innerHTML = `
      <svg width="108" height="108" viewBox="0 0 108 108" style="position:absolute;inset:0;transform:rotate(-90deg);">
        <circle cx="54" cy="54" r="${RADIUS}" fill="none" stroke="rgba(0,0,0,.2)" stroke-width="6"/>
        <circle id="cg-arc" cx="54" cy="54" r="${RADIUS}" fill="none" stroke="#fff"
          stroke-width="6" stroke-linecap="round"
          stroke-dasharray="${CIRC}" stroke-dashoffset="0"
          style="transition:stroke-dashoffset 1s linear,stroke .5s;"/>
      </svg>
      <div class="cg-timer-num">
        <span id="cg-n">7</span>
        <span class="cg-timer-lbl">sec</span>
      </div>`;
    centre.appendChild(ring);

    // Progress dots at bottom
    const dots = document.createElement('div');
    dots.style.cssText = 'position:absolute;bottom:32px;display:flex;gap:10px;';
    for (let i = 0; i < N; i++) {
      const d = document.createElement('div');
      d.className = 'cg-dot' + (i < currentIdx ? ' done' : i === currentIdx ? ' active' : '');
      d.style.cssText = 'width:10px;height:10px;border-radius:50%;transition:background .3s,transform .3s;background:' + (i < currentIdx ? 'rgba(0,255,204,.4)' : i === currentIdx ? '#00ffcc' : 'rgba(255,255,255,.15)');
      dots.appendChild(d);
    }
    root.appendChild(dots);

    let secs = 7;
    const arc = document.getElementById('cg-arc');
    const numEl = document.getElementById('cg-n');

    timerInt = setInterval(() => {
      secs--;
      if (numEl) numEl.textContent = secs;
      if (arc) {
        const pct = secs / 7;
        arc.style.strokeDashoffset = CIRC * (1 - pct);
        // Go from white → orange → red as time runs out
        arc.style.stroke = pct > 0.5 ? '#fff' : pct > 0.25 ? '#ffaa00' : '#ff4444';
      }
      if (secs <= 0) { clearInterval(timerInt); showRecall(); }
    }, 1000);
  };

  /* ── RECALL SCREEN ── */
  const showRecall = () => {
    content.innerHTML = '';
    cs = { h: 180, s: 60, l: 50 };
    hueVal = 180; satVal = 60; litVal = 50;
    colorSide = null;

    const root = document.createElement('div');
    root.className = 'cg-recall-root';
    content.appendChild(root);

    // ── Top: side-by-side swatches (original hidden vs guess) ──
    const previewH = Math.round(content.offsetHeight * 0.28);
    const previewRow = document.createElement('div');
    previewRow.className = 'cg-recall-preview-row';
    previewRow.style.height = previewH + 'px';
    root.appendChild(previewRow);

    // Left: original (hidden behind ? overlay)
    const origHalf = document.createElement('div');
    origHalf.className = 'cg-preview-half';
    origHalf.style.cssText = 'flex:1;position:relative;overflow:hidden;';
    const origSwatch = document.createElement('div');
    origSwatch.style.cssText = 'width:100%;height:100%;background:rgba(255,255,255,.05);display:flex;align-items:center;justify-content:center;flex-direction:column;gap:6px;';
    origSwatch.innerHTML = `
      <div style="font-size:2.2rem;opacity:.3;">?</div>
      <div style="font-size:.44rem;color:rgba(255,255,255,.2);letter-spacing:.1em;text-transform:uppercase;">Target</div>`;
    origHalf.appendChild(origSwatch);
    previewRow.appendChild(origHalf);

    // Divider
    const div = document.createElement('div');
    div.style.cssText = 'width:2px;background:rgba(255,255,255,.06);flex-shrink:0;';
    previewRow.appendChild(div);

    // Right: guess preview (live)
    const guessHalf = document.createElement('div');
    guessHalf.className = 'cg-preview-half';
    guessHalf.style.cssText = 'flex:1;position:relative;overflow:hidden;';
    const guessSwatch = document.createElement('div');
    guessSwatch.style.cssText = 'width:100%;height:100%;transition:background .08s;display:flex;align-items:flex-end;justify-content:center;padding-bottom:10px;';
    guessSwatch.style.background = hsl(180, 60, 50);
    guessSwatch.innerHTML = `<div style="font-size:.44rem;color:rgba(255,255,255,.3);letter-spacing:.1em;text-transform:uppercase;">Your Guess</div>`;
    guessHalf.appendChild(guessSwatch);
    previewRow.appendChild(guessHalf);
    colorSide = guessSwatch;

    // ── Sliders area ──
    const slidersArea = document.createElement('div');
    slidersArea.className = 'cg-sliders-area';
    root.appendChild(slidersArea);

    const updateAll = () => {
      if (colorSide) colorSide.style.background = hsl(hueVal, satVal, litVal);
      cs.h = hueVal; cs.s = satVal; cs.l = litVal;
      // Update sat/lit track gradients
      if (sTrack) sTrack.style.background = `linear-gradient(to right,${hsl(hueVal,0,litVal)},${hsl(hueVal,100,litVal)})`;
      if (lTrack) lTrack.style.background = `linear-gradient(to right,${hsl(hueVal,satVal,10)},${hsl(hueVal,satVal,90)})`;
    };

    const makeHorizSlider = (parent, getGrad, min, max, initVal, onChange) => {
      const row = document.createElement('div');
      row.className = 'cg-slider-row';
      parent.appendChild(row);

      const track = document.createElement('div');
      track.className = 'cg-htrack';
      track.style.background = getGrad();
      const knob = document.createElement('div');
      knob.className = 'cg-hknob';
      track.appendChild(knob);
      row.appendChild(track);

      let val = initVal;
      const setKnob = () => {
        const pct = (val - min) / (max - min);
        knob.style.left = `calc(${pct*100}% )`;
      };
      setKnob();

      const setVal = clientX => {
        const r = track.getBoundingClientRect();
        const pct = Math.max(0, Math.min(1, (clientX - r.left) / r.width));
        val = Math.round(min + pct * (max - min));
        setKnob(); onChange(val);
      };

      track.addEventListener('touchstart', e => { e.preventDefault(); setVal(e.touches[0].clientX); }, {passive:false});
      track.addEventListener('touchmove',  e => { e.preventDefault(); setVal(e.touches[0].clientX); }, {passive:false});
      track.addEventListener('mousedown',  e => {
        const mv = e2 => setVal(e2.clientX);
        const up = () => { document.removeEventListener('mousemove',mv); document.removeEventListener('mouseup',up); };
        document.addEventListener('mousemove',mv); document.addEventListener('mouseup',up); setVal(e.clientX);
      });
      return track;
    };

    // Hue row
    const hRow = document.createElement('div');
    hRow.className = 'cg-slider-row';
    hRow.style.cssText = 'flex:1;display:flex;align-items:center;gap:10px;padding:0 14px;border-bottom:1px solid rgba(255,255,255,.04);';
    slidersArea.appendChild(hRow);
    const hLabel = document.createElement('div');
    hLabel.innerHTML = `<div style="font-size:.44rem;color:rgba(255,255,255,.35);letter-spacing:.1em;text-transform:uppercase;writing-mode:vertical-rl;transform:rotate(180deg);">HUE</div>`;
    hRow.appendChild(hLabel);
    const hTrackWrap = document.createElement('div');
    hTrackWrap.style.cssText = 'flex:1;display:flex;align-items:center;height:100%;';
    hRow.appendChild(hTrackWrap);
    const htrack = document.createElement('div');
    htrack.className = 'cg-htrack';
    htrack.style.cssText = 'flex:1;height:38px;border-radius:19px;position:relative;background:linear-gradient(to right,hsl(0,80%,55%),hsl(30,80%,55%),hsl(60,80%,55%),hsl(90,80%,55%),hsl(120,80%,55%),hsl(150,80%,55%),hsl(180,80%,55%),hsl(210,80%,55%),hsl(240,80%,55%),hsl(270,80%,55%),hsl(300,80%,55%),hsl(330,80%,55%),hsl(360,80%,55%));box-shadow:0 2px 8px rgba(0,0,0,.4),inset 0 1px 0 rgba(255,255,255,.08);cursor:pointer;';
    const hknob = document.createElement('div');
    hknob.className = 'cg-hknob';
    hknob.style.cssText = 'position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);width:34px;height:34px;border-radius:50%;background:hsl(180,60%,50%);border:3px solid #fff;box-shadow:0 3px 12px rgba(0,0,0,.5);cursor:grab;touch-action:none;';
    htrack.appendChild(hknob);
    hTrackWrap.appendChild(htrack);

    const setHue = clientX => {
      const r = htrack.getBoundingClientRect();
      const pct = Math.max(0,Math.min(1,(clientX-r.left)/r.width));
      hueVal = Math.round(pct*360);
      hknob.style.left = (pct*100)+'%';
      hknob.style.background = hsl(hueVal,70,55);
      updateAll();
    };
    htrack.addEventListener('touchstart',e=>{e.preventDefault();setHue(e.touches[0].clientX);},{passive:false});
    htrack.addEventListener('touchmove', e=>{e.preventDefault();setHue(e.touches[0].clientX);},{passive:false});
    htrack.addEventListener('mousedown', e=>{
      const mv=e2=>setHue(e2.clientX);
      const up=()=>{document.removeEventListener('mousemove',mv);document.removeEventListener('mouseup',up);};
      document.addEventListener('mousemove',mv);document.addEventListener('mouseup',up);setHue(e.clientX);
    });

    // Sat row
    const sRow = document.createElement('div');
    sRow.style.cssText = 'flex:1;display:flex;align-items:center;gap:10px;padding:0 14px;border-bottom:1px solid rgba(255,255,255,.04);';
    slidersArea.appendChild(sRow);
    const sLabel = document.createElement('div');
    sLabel.innerHTML = `<div style="font-size:.44rem;color:rgba(255,255,255,.35);letter-spacing:.1em;text-transform:uppercase;writing-mode:vertical-rl;transform:rotate(180deg);">SAT</div>`;
    sRow.appendChild(sLabel);
    const sWrap = document.createElement('div');
    sWrap.style.cssText = 'flex:1;display:flex;align-items:center;height:100%;';
    sRow.appendChild(sWrap);
    const strack = document.createElement('div');
    strack.style.cssText = 'flex:1;height:38px;border-radius:19px;position:relative;background:'+`linear-gradient(to right,${hsl(180,0,50)},${hsl(180,100,50)})`+';box-shadow:0 2px 8px rgba(0,0,0,.4),inset 0 1px 0 rgba(255,255,255,.08);cursor:pointer;';
    const sknob = document.createElement('div');
    sknob.className = 'cg-hknob';
    sknob.style.cssText = 'position:absolute;top:50%;left:60%;transform:translate(-50%,-50%);width:34px;height:34px;border-radius:50%;background:#fff;border:3px solid #fff;box-shadow:0 3px 12px rgba(0,0,0,.5);cursor:grab;touch-action:none;';
    strack.appendChild(sknob);
    sWrap.appendChild(strack);
    sTrack = strack;

    const setSat = clientX => {
      const r = strack.getBoundingClientRect();
      const pct = Math.max(0,Math.min(1,(clientX-r.left)/r.width));
      satVal = Math.round(pct*100);
      sknob.style.left = (pct*100)+'%';
      updateAll();
    };
    strack.addEventListener('touchstart',e=>{e.preventDefault();setSat(e.touches[0].clientX);},{passive:false});
    strack.addEventListener('touchmove', e=>{e.preventDefault();setSat(e.touches[0].clientX);},{passive:false});
    strack.addEventListener('mousedown', e=>{
      const mv=e2=>setSat(e2.clientX);
      const up=()=>{document.removeEventListener('mousemove',mv);document.removeEventListener('mouseup',up);};
      document.addEventListener('mousemove',mv);document.addEventListener('mouseup',up);setSat(e.clientX);
    });

    // Lit row
    const lRow = document.createElement('div');
    lRow.style.cssText = 'flex:1;display:flex;align-items:center;gap:10px;padding:0 14px;';
    slidersArea.appendChild(lRow);
    const lLabel = document.createElement('div');
    lLabel.innerHTML = `<div style="font-size:.44rem;color:rgba(255,255,255,.35);letter-spacing:.1em;text-transform:uppercase;writing-mode:vertical-rl;transform:rotate(180deg);">LIT</div>`;
    lRow.appendChild(lLabel);
    const lWrap = document.createElement('div');
    lWrap.style.cssText = 'flex:1;display:flex;align-items:center;height:100%;';
    lRow.appendChild(lWrap);
    const ltrack = document.createElement('div');
    ltrack.style.cssText = 'flex:1;height:38px;border-radius:19px;position:relative;background:'+`linear-gradient(to right,${hsl(180,60,10)},${hsl(180,60,90)})`+';box-shadow:0 2px 8px rgba(0,0,0,.4),inset 0 1px 0 rgba(255,255,255,.08);cursor:pointer;';
    const lknob = document.createElement('div');
    lknob.className = 'cg-hknob';
    lknob.style.cssText = 'position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);width:34px;height:34px;border-radius:50%;background:#fff;border:3px solid #fff;box-shadow:0 3px 12px rgba(0,0,0,.5);cursor:grab;touch-action:none;';
    ltrack.appendChild(lknob);
    lWrap.appendChild(ltrack);
    lTrack = ltrack;

    const setLit = clientX => {
      const r = ltrack.getBoundingClientRect();
      const pct = Math.max(0,Math.min(1,(clientX-r.left)/r.width));
      litVal = Math.round(10 + pct*80);
      lknob.style.left = ((litVal-10)/80*100)+'%';
      updateAll();
    };
    ltrack.addEventListener('touchstart',e=>{e.preventDefault();setLit(e.touches[0].clientX);},{passive:false});
    ltrack.addEventListener('touchmove', e=>{e.preventDefault();setLit(e.touches[0].clientX);},{passive:false});
    ltrack.addEventListener('mousedown', e=>{
      const mv=e2=>setLit(e2.clientX);
      const up=()=>{document.removeEventListener('mousemove',mv);document.removeEventListener('mouseup',up);};
      document.addEventListener('mousemove',mv);document.addEventListener('mouseup',up);setLit(e.clientX);
    });

    // ── Bottom bar: progress dots + submit button ──
    const bottom = document.createElement('div');
    bottom.className = 'cg-recall-bottom';
    root.appendChild(bottom);

    const dotRow = document.createElement('div');
    dotRow.className = 'cg-progress-dots';
    for (let i=0;i<N;i++) {
      const d = document.createElement('div');
      d.className = 'cg-dot';
      d.style.cssText = 'width:9px;height:9px;border-radius:50%;background:' + (i<currentIdx?'rgba(0,255,204,.45)':i===currentIdx?'#00ffcc':'rgba(255,255,255,.15)');
      dotRow.appendChild(d);
    }
    bottom.appendChild(dotRow);

    const nextBtn = document.createElement('button');
    nextBtn.style.cssText = `
      font-family:'Orbitron',sans-serif;font-weight:900;font-size:.72rem;
      letter-spacing:.12em;text-transform:uppercase;
      color:#030f08;background:linear-gradient(135deg,#00ffcc,#00cc99);
      border:none;padding:14px 28px;border-radius:50px;cursor:pointer;
      box-shadow:0 5px 0 #007744,0 6px 20px rgba(0,255,150,.35);
      -webkit-tap-highlight-color:transparent;
      transition:transform .1s,box-shadow .1s;`;
    nextBtn.textContent = currentIdx < N-1 ? 'Next →' : 'Results →';
    nextBtn.onpointerdown = () => { nextBtn.style.transform='scale(.96) translateY(3px)'; nextBtn.style.boxShadow='0 2px 0 #007744'; };
    nextBtn.onpointerup = () => { nextBtn.style.transform=''; nextBtn.style.boxShadow='0 5px 0 #007744,0 6px 20px rgba(0,255,150,.35)'; };
    nextBtn.onclick = () => {
      scores.push({c:colors[currentIdx], g:{h:hueVal,s:satVal,l:litVal}});
      currentIdx++;
      if (currentIdx >= N) showResults(); else showMemorize();
    };
    bottom.appendChild(nextBtn);
  };

  /* ── RESULTS SCREEN ── */
  const showResults = () => {
    content.innerHTML = '';
    const root = document.createElement('div');
    root.className = 'cg-results-root';
    content.appendChild(root);

    // Top bar
    const topBar = document.createElement('div');
    topBar.style.cssText = 'padding:' + (SA.t+12) + 'px 20px 14px;font-size:.54rem;letter-spacing:.22em;text-transform:uppercase;color:rgba(255,255,255,.25);flex-shrink:0;border-bottom:1px solid rgba(255,255,255,.06);';
    topBar.textContent = '// RESULTS //';
    root.appendChild(topBar);

    let total = 0;
    scores.forEach((s,i) => {
      const d = dist(s.c, s.g);
      const pts = Math.max(0,Math.round((1-d)*10));
      total += pts;
      const grade = pts>=9?['PERFECT','#00ffcc']:pts>=7?['GREAT','#69ff47']:pts>=5?['GOOD','#ffeb3b']:pts>=3?['OK','#ff9800']:['MISS','#ff6d6d'];
      const row = document.createElement('div');
      row.className = 'cg-res-row';
      row.style.animation = `cg-score-in .3s ${i*0.07}s both`;
      row.innerHTML = `
        <div class="cg-swatch-pair">
          <div style="display:flex;flex-direction:column;align-items:center;gap:3px;">
            <div class="cg-sw" style="background:${hsl2hex(s.c.h,s.c.s,s.c.l)}"></div>
            <div style="font-size:.38rem;color:rgba(255,255,255,.25);letter-spacing:.06em;">REAL</div>
          </div>
          <div style="display:flex;flex-direction:column;align-items:center;gap:3px;">
            <div class="cg-sw" style="background:${hsl2hex(s.g.h,s.g.s,s.g.l)}"></div>
            <div style="font-size:.38rem;color:rgba(255,255,255,.25);letter-spacing:.06em;">YOURS</div>
          </div>
        </div>
        <div class="cg-res-info" style="flex:1;">
          <div class="cg-res-score" style="color:${grade[1]}">${pts}/10 — ${grade[0]}</div>
          <div class="cg-res-lbl">Color ${i+1} · Hue off by ${Math.min(Math.abs(s.c.h-s.g.h),360-Math.abs(s.c.h-s.g.h))}° · Sat off by ${Math.abs(s.c.s-s.g.s)}%</div>
        </div>
        <div style="font-family:'Orbitron',sans-serif;font-size:1.1rem;font-weight:900;color:${grade[1]};text-shadow:0 0 12px ${grade[1]}44;">${pts}</div>`;
      root.appendChild(row);
    });

    // Total score
    const pct = Math.round(total/N/10*100);
    const msg = pct>=90?'PERFECT 🎯':pct>=70?'GREAT 🔥':pct>=50?'GOOD 👍':pct>=30?'PRACTICE 😅':'KEEP TRYING 😬';
    const totEl = document.createElement('div');
    totEl.style.cssText = 'text-align:center;padding:24px 20px;flex-shrink:0;animation:cg-score-in .4s .35s both;';
    totEl.innerHTML = `
      <div style="font-family:'Orbitron',sans-serif;font-size:2.8rem;font-weight:900;
        color:#00ffcc;text-shadow:0 0 30px rgba(0,255,204,.5);letter-spacing:.1em;">
        ${total}/${N*10}
      </div>
      <div style="font-family:'Share Tech Mono',monospace;font-size:.72rem;
        color:rgba(255,255,255,.4);letter-spacing:.18em;text-transform:uppercase;margin-top:6px;">
        ${msg}
      </div>`;
    root.appendChild(totEl);

    const again = document.createElement('button');
    again.style.cssText = `
      display:block;margin:0 auto 32px;
      font-family:'Orbitron',sans-serif;font-weight:900;font-size:.82rem;
      letter-spacing:.12em;text-transform:uppercase;
      color:#030f08;background:linear-gradient(135deg,#00ffcc,#00cc99);
      border:none;padding:16px 48px;border-radius:50px;cursor:pointer;
      box-shadow:0 5px 0 #007744,0 6px 20px rgba(0,255,150,.35);
      -webkit-tap-highlight-color:transparent;flex-shrink:0;`;
    again.textContent = 'Play Again →';
    again.onclick = () => { colors=genColors(); scores=[]; currentIdx=0; showMemorize(); };
    root.appendChild(again);
  };

  showStart();
  return () => clearInterval(timerInt);
}
