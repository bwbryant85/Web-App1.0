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
        width:100%; padding:28px 28px calc(${typeof SA !== 'undefined' ? 0 : 0}px + 36px);
        display:flex; flex-direction:column; align-items:center; gap:16px;
        background:linear-gradient(0deg,#050508 80%,transparent);
      }

      /* ── MEMORIZE SCREEN ── */
      .cg-mem-root {
        width:100%; height:100%; display:flex; flex-direction:column;
        align-items:center; justify-content:center; position:relative;
        transition:background .3s; overflow:hidden;
      }
      .cg-mem-hud {
        position:absolute; top:0; left:0; right:0;
        display:flex; justify-content:space-between; align-items:center;
        padding-top:calc(var(--st, 59px) + 10px); padding-left:20px; padding-right:20px; padding-bottom:12px; background:rgba(0,0,0,.18);
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

  /* ── RECALL SCREEN — original vertical sliders ── */
  const showRecall = () => {
    content.innerHTML = '';
    cs = { h:180, s:60, l:50 };
    colorSide = null; sTrack = null; lTrack = null;

    const outer = document.createElement('div');
    outer.style.cssText = 'width:100%;height:100%;display:flex;flex-direction:row;background:#050508;overflow:hidden;position:relative;';
    content.appendChild(outer);

    /* ── Left: vertical sliders column ── */
    const slCol = document.createElement('div');
    slCol.style.cssText = 'display:flex;flex-direction:row;align-items:stretch;padding:' + (0) + 'px 8px 80px 8px;gap:12px;flex-shrink:0;width:108px;order:2;';
    outer.appendChild(slCol);

    /* ── Right: colour preview ── */
    const cSide = document.createElement('div');
    cSide.style.cssText = 'flex:1;transition:background .06s;position:relative;order:1;';
    cSide.style.background = `hsl(180,60%,50%)`;
    outer.appendChild(cSide);
    colorSide = cSide;

    /* Round label on colour side */
    const info = document.createElement('div');
    info.style.cssText = 'position:absolute;top:' + (0) + 'px;right:16px;font-family:"Share Tech Mono",monospace;font-size:.58rem;color:rgba(255,255,255,.45);letter-spacing:.1em;';
    info.textContent = (currentIdx+1) + ' / ' + N;
    cSide.appendChild(info);

    /* Instruction hint */
    const hint = document.createElement('div');
    hint.style.cssText = 'position:absolute;bottom:90px;left:0;right:0;text-align:center;font-family:"Share Tech Mono",monospace;font-size:.52rem;color:rgba(255,255,255,.2);letter-spacing:.1em;';
    hint.textContent = 'Match the memorized color';
    cSide.appendChild(hint);

    /* Progress dots on colour side */
    const dots = document.createElement('div');
    dots.style.cssText = 'position:absolute;bottom:26px;left:0;right:0;display:flex;gap:10px;justify-content:center;';
    for (let i=0;i<N;i++) {
      const d=document.createElement('div');
      d.style.cssText='width:9px;height:9px;border-radius:50%;background:'+(i<currentIdx?'rgba(0,255,204,.45)':i===currentIdx?'#00ffcc':'rgba(255,255,255,.15)');
      dots.appendChild(d);
    }
    cSide.appendChild(dots);

    const updateVisuals = () => {
      if (colorSide) colorSide.style.background = `hsl(${cs.h},${cs.s}%,${cs.l}%)`;
      if (sTrack) sTrack.style.background = `linear-gradient(to bottom,hsl(${cs.h},100%,${cs.l}%),hsl(${cs.h},0%,${cs.l}%))`;
      if (lTrack) lTrack.style.background = `linear-gradient(to bottom,hsl(${cs.h},${cs.s}%,90%),hsl(${cs.h},${cs.s}%,10%))`;
    };

    const makeSlider = (getInitGrad, min, max, initVal, onChange) => {
      const wrap = document.createElement('div');
      wrap.style.cssText = 'display:flex;flex-direction:column;align-items:center;flex:1;padding:8px 0;gap:6px;';
      slCol.appendChild(wrap);

      const track = document.createElement('div');
      track.style.cssText = 'flex:1;width:40px;border-radius:20px;position:relative;cursor:pointer;background:'+getInitGrad()+';box-shadow:0 2px 10px rgba(0,0,0,.5),inset 0 1px 0 rgba(255,255,255,.1);';
      const knob = document.createElement('div');
      knob.style.cssText = 'position:absolute;left:50%;transform:translateX(-50%);width:42px;height:42px;border-radius:50%;background:#fff;border:3px solid rgba(0,0,0,.3);box-shadow:0 4px 16px rgba(0,0,0,.6),0 0 0 3px rgba(255,255,255,.25);cursor:grab;touch-action:none;';
      track.appendChild(knob);
      wrap.appendChild(track);

      let val = initVal;
      const setKnob = () => {
        const pct = (1-(val-min)/(max-min))*100;
        knob.style.top = `calc(${pct}% - 14px)`;
      };
      setKnob();

      const setVal = clientY => {
        const r = track.getBoundingClientRect();
        const pct = Math.max(0,Math.min(1,(clientY-r.top)/r.height));
        val = Math.round(min+(1-pct)*(max-min));
        setKnob(); onChange(val);
      };
      track.addEventListener('touchstart',e=>{e.preventDefault();setVal(e.touches[0].clientY);},{passive:false});
      track.addEventListener('touchmove', e=>{e.preventDefault();setVal(e.touches[0].clientY);},{passive:false});
      track.addEventListener('mousedown', e=>{
        const mv=e2=>setVal(e2.clientY);
        const up=()=>{document.removeEventListener('mousemove',mv);document.removeEventListener('mouseup',up);};
        document.addEventListener('mousemove',mv);document.addEventListener('mouseup',up);setVal(e.clientY);
      });
      return track;
    };

    // Hue slider
    makeSlider(
      ()=>`linear-gradient(to bottom,hsl(360,80%,50%),hsl(300,80%,50%),hsl(240,80%,50%),hsl(180,80%,50%),hsl(120,80%,50%),hsl(60,80%,50%),hsl(0,80%,50%))`,
      0, 360, 180, v=>{ cs.h=v; updateVisuals(); }
    );

    // Saturation slider
    const sT = makeSlider(
      ()=>`linear-gradient(to bottom,hsl(${cs.h},100%,${cs.l}%),hsl(${cs.h},0%,${cs.l}%))`,
      0, 100, 60, v=>{ cs.s=v; updateVisuals(); }
    );
    sTrack = sT;

    // Lightness slider
    const lT = makeSlider(
      ()=>`linear-gradient(to bottom,hsl(${cs.h},${cs.s}%,90%),hsl(${cs.h},${cs.s}%,10%))`,
      10, 90, 50, v=>{ cs.l=v; updateVisuals(); }
    );
    lTrack = lT;

    /* Next / Results button — fixed to bottom-right of colour side */
    const nextBtn = document.createElement('button');
    nextBtn.style.cssText = `
      position:fixed;bottom:${0}px;right:18px;z-index:200;
      font-family:'Orbitron',sans-serif;font-weight:900;font-size:.72rem;
      letter-spacing:.12em;text-transform:uppercase;
      color:#030f08;background:linear-gradient(135deg,#00ffcc,#00cc99);
      border:none;padding:14px 28px;border-radius:50px;cursor:pointer;
      box-shadow:0 5px 0 #007744,0 6px 20px rgba(0,255,150,.35);
      -webkit-tap-highlight-color:transparent;`;
    nextBtn.textContent = currentIdx < N-1 ? 'Next →' : 'Results →';
    nextBtn.onclick = () => {
      scores.push({c:colors[currentIdx], g:{...cs}});
      currentIdx++;
      if (currentIdx >= N) showResults(); else showMemorize();
    };
    outer.appendChild(nextBtn);
  };

  /* ── RESULTS SCREEN — full-screen, accurate scoring ── */
  const showResults = () => {
    content.innerHTML = '';

    /* Score is 0-10 per colour based on perceptual distance.
       Use tighter hue weight so small hue errors don't tank the score. */
    const scoreColor = (c, g) => {
      const dh = Math.min(Math.abs(c.h-g.h), 360-Math.abs(c.h-g.h)); // 0-180
      const ds = Math.abs(c.s-g.s);   // 0-100
      const dl = Math.abs(c.l-g.l);   // 0-80 (range 10-90)
      // Normalise each to 0-1 then weight
      const nh = dh/180, ns = ds/100, nl = dl/80;
      const err = nh*0.5 + ns*0.28 + nl*0.22; // weighted combined error
      return Math.max(0, Math.round((1-err)*10));
    };

    const root = document.createElement('div');
    root.style.cssText = 'width:100%;height:100%;display:flex;flex-direction:column;background:#050508;overflow:hidden;box-sizing:border-box;';
    content.appendChild(root);

    /* ── Score cards (flex:1, equal height) ── */
    const cards = document.createElement('div');
    cards.style.cssText = 'flex:1;display:flex;flex-direction:column;min-height:0;padding:' + (0) + 'px 0 0;';
    root.appendChild(cards);

    let total = 0;
    const rowData = scores.map((s2, i) => {
      const pts = scoreColor(s2.c, s2.g);
      total += pts;
      const dh = Math.min(Math.abs(s2.c.h-s2.g.h),360-Math.abs(s2.c.h-s2.g.h));
      const ds = Math.abs(s2.c.s-s2.g.s);
      const grade = pts>=9?['PERFECT','#00ffcc']:pts>=7?['GREAT','#69ff47']:pts>=5?['GOOD','#ffeb3b']:pts>=3?['OK','#ff9800']:['MISS','#ff6d6d'];
      return {pts, dh, ds, grade, c:s2.c, g:s2.g, i};
    });

    rowData.forEach(({pts,dh,ds,grade,c,g,i}) => {
      const row = document.createElement('div');
      row.style.cssText = `
        flex:1;display:flex;align-items:center;gap:12px;padding:0 16px;
        border-bottom:1px solid rgba(255,255,255,.05);
        animation:cg-score-in .3s ${i*0.06}s both;min-height:0;`;
      row.innerHTML = `
        <!-- Swatches -->
        <div style="display:flex;flex-direction:column;gap:3px;flex-shrink:0;">
          <div style="display:flex;gap:3px;">
            <div style="width:40px;height:40px;border-radius:10px;background:hsl(${c.h},${c.s}%,${c.l}%);box-shadow:0 3px 10px rgba(0,0,0,.5);"></div>
            <div style="width:40px;height:40px;border-radius:10px;background:hsl(${g.h},${g.s}%,${g.l}%);box-shadow:0 3px 10px rgba(0,0,0,.5);"></div>
          </div>
          <div style="display:flex;gap:3px;">
            <div style="width:40px;text-align:center;font-size:.32rem;color:rgba(255,255,255,.22);letter-spacing:.06em;">REAL</div>
            <div style="width:40px;text-align:center;font-size:.32rem;color:rgba(255,255,255,.22);letter-spacing:.06em;">YOURS</div>
          </div>
        </div>
        <!-- Info -->
        <div style="flex:1;min-width:0;">
          <div style="font-family:'Orbitron',sans-serif;font-size:.78rem;font-weight:900;color:${grade[1]};letter-spacing:.04em;">${pts}/10 — ${grade[0]}</div>
          <div style="font-size:.46rem;color:rgba(255,255,255,.28);letter-spacing:.05em;margin-top:3px;">Color ${i+1} · H ±${dh}° · S ±${ds}%</div>
          <!-- Accuracy bar -->
          <div style="margin-top:6px;height:4px;border-radius:2px;background:rgba(255,255,255,.08);overflow:hidden;">
            <div style="height:100%;width:${pts*10}%;background:${grade[1]};border-radius:2px;transition:width .6s ${i*0.08}s;box-shadow:0 0 6px ${grade[1]}88;"></div>
          </div>
        </div>
        <!-- Score number -->
        <div style="font-family:'Orbitron',sans-serif;font-size:1.5rem;font-weight:900;color:${grade[1]};text-shadow:0 0 16px ${grade[1]}66;flex-shrink:0;width:24px;text-align:right;">${pts}</div>`;
      cards.appendChild(row);
    });

    /* ── Bottom: total score panel ── */
    const pct = Math.round(total/N/10*100);
    const msg  = pct>=90?'PERFECT 🎯':pct>=70?'GREAT 🔥':pct>=50?'GOOD 👍':pct>=30?'PRACTICE 😅':'KEEP TRYING 😬';
    const botH = 200;
    const bot = document.createElement('div');
    bot.style.cssText = `flex-shrink:0;height:${botH}px;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:6px;background:rgba(255,255,255,.02);border-top:1px solid rgba(255,255,255,.06);padding-bottom:${0}px;`;
    bot.innerHTML = `
      <div style="font-family:'Orbitron',sans-serif;font-size:2.6rem;font-weight:900;
        color:#00ffcc;text-shadow:0 0 28px rgba(0,255,204,.55);letter-spacing:.08em;
        animation:cg-score-in .4s .32s both;">${total}/${N*10}</div>
      <div style="font-family:'Share Tech Mono',monospace;font-size:.66rem;
        color:rgba(255,255,255,.4);letter-spacing:.18em;text-transform:uppercase;">${msg}</div>`;
    root.appendChild(bot);

    /* Play again button overlaid on score panel */
    const again = document.createElement('button');
    again.style.cssText = `
      position:fixed;bottom:${0}px;right:18px;
      font-family:'Orbitron',sans-serif;font-weight:900;font-size:.72rem;
      letter-spacing:.12em;text-transform:uppercase;
      color:#030f08;background:linear-gradient(135deg,#00ffcc,#00cc99);
      border:none;padding:14px 24px;border-radius:50px;cursor:pointer;
      box-shadow:0 5px 0 #007744,0 6px 20px rgba(0,255,150,.4);
      -webkit-tap-highlight-color:transparent;z-index:100;`;
    again.textContent = 'Play Again →';
    again.onclick = () => { colors=genColors(); scores=[]; currentIdx=0; showMemorize(); };
    root.appendChild(again);
  };

    showStart();
  return () => clearInterval(timerInt);
}
