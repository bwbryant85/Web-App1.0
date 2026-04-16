/* ════════════ DJ PAD ════════════ */
function initDJPad() {
  let ac = null, bpm = 120, loopMode = false, activeSet = new Set(), seqTimer = null;
  const A = () => { if (!ac) ac = new (window.AudioContext || window.webkitAudioContext)(); return ac; };

  // Sound generators
  const S = {
    k808:   () => { const a=A(),o=a.createOscillator(),g=a.createGain();o.connect(g);g.connect(a.destination);o.frequency.setValueAtTime(100,a.currentTime);o.frequency.exponentialRampToValueAtTime(28,a.currentTime+.55);g.gain.setValueAtTime(1.3,a.currentTime);g.gain.exponentialRampToValueAtTime(.001,a.currentTime+.65);o.start();o.stop(a.currentTime+.7); },
    kTight: () => { const a=A(),o=a.createOscillator(),g=a.createGain();o.connect(g);g.connect(a.destination);o.frequency.setValueAtTime(140,a.currentTime);o.frequency.exponentialRampToValueAtTime(55,a.currentTime+.18);g.gain.setValueAtTime(1.1,a.currentTime);g.gain.exponentialRampToValueAtTime(.001,a.currentTime+.22);o.start();o.stop(a.currentTime+.25); },
    kDeep:  () => { const a=A(),o=a.createOscillator(),g=a.createGain();o.connect(g);g.connect(a.destination);o.frequency.setValueAtTime(60,a.currentTime);o.frequency.exponentialRampToValueAtTime(18,a.currentTime+.7);g.gain.setValueAtTime(1.4,a.currentTime);g.gain.exponentialRampToValueAtTime(.001,a.currentTime+.8);o.start();o.stop(a.currentTime+.85); },
    kSnap:  () => { const a=A(),o=a.createOscillator(),g=a.createGain();o.connect(g);g.connect(a.destination);o.frequency.setValueAtTime(220,a.currentTime);o.frequency.exponentialRampToValueAtTime(80,a.currentTime+.08);g.gain.setValueAtTime(1.2,a.currentTime);g.gain.exponentialRampToValueAtTime(.001,a.currentTime+.12);o.start();o.stop(a.currentTime+.14); },
    kMid:   () => { const a=A(),o=a.createOscillator(),g=a.createGain();o.connect(g);g.connect(a.destination);o.frequency.setValueAtTime(110,a.currentTime);o.frequency.exponentialRampToValueAtTime(42,a.currentTime+.35);g.gain.setValueAtTime(1.1,a.currentTime);g.gain.exponentialRampToValueAtTime(.001,a.currentTime+.4);o.start();o.stop(a.currentTime+.45); },
    kSub:   () => { const a=A(),o=a.createOscillator(),g=a.createGain();o.connect(g);g.connect(a.destination);o.type='triangle';o.frequency.setValueAtTime(55,a.currentTime);o.frequency.exponentialRampToValueAtTime(20,a.currentTime+.6);g.gain.setValueAtTime(.9,a.currentTime);g.gain.exponentialRampToValueAtTime(.001,a.currentTime+.7);o.start();o.stop(a.currentTime+.75); },
    snare:  () => { const a=A(),b=a.createBuffer(1,a.sampleRate*.18,a.sampleRate),d=b.getChannelData(0);for(let i=0;i<d.length;i++)d[i]=Math.random()*2-1;const s=a.createBufferSource();s.buffer=b;const f=a.createBiquadFilter();f.type='highpass';f.frequency.value=1600;const g=a.createGain();s.connect(f);f.connect(g);g.connect(a.destination);g.gain.setValueAtTime(.75,a.currentTime);g.gain.exponentialRampToValueAtTime(.001,a.currentTime+.2);s.start(); },
    clap:   () => { const a=A();[0,.008,.018].forEach(off=>{const b=a.createBuffer(1,a.sampleRate*.09,a.sampleRate),d=b.getChannelData(0);for(let i=0;i<d.length;i++)d[i]=Math.random()*2-1;const s=a.createBufferSource();s.buffer=b;const f=a.createBiquadFilter();f.type='bandpass';f.frequency.value=1100;f.Q.value=.6;const g=a.createGain();s.connect(f);f.connect(g);g.connect(a.destination);g.gain.setValueAtTime(.6,a.currentTime+off);g.gain.exponentialRampToValueAtTime(.001,a.currentTime+off+.1);s.start(a.currentTime+off);}); },
    rim:    () => { const a=A(),b=a.createBuffer(1,a.sampleRate*.04,a.sampleRate),d=b.getChannelData(0);for(let i=0;i<d.length;i++)d[i]=Math.random()*2-1;const s=a.createBufferSource();s.buffer=b;const f=a.createBiquadFilter();f.type='bandpass';f.frequency.value=2200;f.Q.value=1.5;const g=a.createGain();s.connect(f);f.connect(g);g.connect(a.destination);g.gain.setValueAtTime(.5,a.currentTime);g.gain.exponentialRampToValueAtTime(.001,a.currentTime+.05);s.start(); },
    hihat:  () => { const a=A(),b=a.createBuffer(1,Math.round(a.sampleRate*.055),a.sampleRate),d=b.getChannelData(0);for(let i=0;i<d.length;i++)d[i]=Math.random()*2-1;const s=a.createBufferSource();s.buffer=b;const f=a.createBiquadFilter();f.type='highpass';f.frequency.value=9000;const g=a.createGain();s.connect(f);f.connect(g);g.connect(a.destination);g.gain.setValueAtTime(.45,a.currentTime);g.gain.exponentialRampToValueAtTime(.001,a.currentTime+.06);s.start(); },
    openHat:() => { const a=A(),b=a.createBuffer(1,Math.round(a.sampleRate*.28),a.sampleRate),d=b.getChannelData(0);for(let i=0;i<d.length;i++)d[i]=Math.random()*2-1;const s=a.createBufferSource();s.buffer=b;const f=a.createBiquadFilter();f.type='highpass';f.frequency.value=6500;const g=a.createGain();s.connect(f);f.connect(g);g.connect(a.destination);g.gain.setValueAtTime(.38,a.currentTime);g.gain.exponentialRampToValueAtTime(.001,a.currentTime+.3);s.start(); },
    crash:  () => { const a=A(),b=a.createBuffer(1,Math.round(a.sampleRate*1.2),a.sampleRate),d=b.getChannelData(0);for(let i=0;i<d.length;i++)d[i]=Math.random()*2-1;const s=a.createBufferSource();s.buffer=b;const f=a.createBiquadFilter();f.type='highpass';f.frequency.value=4000;const g=a.createGain();s.connect(f);f.connect(g);g.connect(a.destination);g.gain.setValueAtTime(.35,a.currentTime);g.gain.exponentialRampToValueAtTime(.001,a.currentTime+1.3);s.start(); },
    bA:     () => { const a=A(),o=a.createOscillator(),g=a.createGain();o.connect(g);g.connect(a.destination);o.type='sine';o.frequency.value=55;g.gain.setValueAtTime(1.1,a.currentTime);g.gain.exponentialRampToValueAtTime(.001,a.currentTime+.65);o.start();o.stop(a.currentTime+.7); },
    bD:     () => { const a=A(),o=a.createOscillator(),g=a.createGain();o.connect(g);g.connect(a.destination);o.type='sine';o.frequency.value=73.4;g.gain.setValueAtTime(1.1,a.currentTime);g.gain.exponentialRampToValueAtTime(.001,a.currentTime+.65);o.start();o.stop(a.currentTime+.7); },
    bG:     () => { const a=A(),o=a.createOscillator(),g=a.createGain();o.connect(g);g.connect(a.destination);o.type='sine';o.frequency.value=98;g.gain.setValueAtTime(1.0,a.currentTime);g.gain.exponentialRampToValueAtTime(.001,a.currentTime+.55);o.start();o.stop(a.currentTime+.6); },
    bC:     () => { const a=A(),o=a.createOscillator(),g=a.createGain();o.connect(g);g.connect(a.destination);o.type='sine';o.frequency.value=65.4;g.gain.setValueAtTime(1.1,a.currentTime);g.gain.exponentialRampToValueAtTime(.001,a.currentTime+.65);o.start();o.stop(a.currentTime+.7); },
    bE:     () => { const a=A(),o=a.createOscillator(),g=a.createGain();o.connect(g);g.connect(a.destination);o.type='sine';o.frequency.value=82.4;g.gain.setValueAtTime(1.0,a.currentTime);g.gain.exponentialRampToValueAtTime(.001,a.currentTime+.6);o.start();o.stop(a.currentTime+.65); },
    bSlap:  () => { const a=A(),o=a.createOscillator(),g=a.createGain();o.connect(g);g.connect(a.destination);o.type='triangle';o.frequency.setValueAtTime(110,a.currentTime);o.frequency.exponentialRampToValueAtTime(55,a.currentTime+.08);g.gain.setValueAtTime(1.3,a.currentTime);g.gain.exponentialRampToValueAtTime(.001,a.currentTime+.18);o.start();o.stop(a.currentTime+.22); },
    lC:     () => { const a=A(),o=a.createOscillator(),f=a.createBiquadFilter(),g=a.createGain();o.connect(f);f.connect(g);g.connect(a.destination);o.type='sawtooth';o.frequency.value=523;f.type='lowpass';f.frequency.setValueAtTime(2200,a.currentTime);f.frequency.exponentialRampToValueAtTime(400,a.currentTime+.3);g.gain.setValueAtTime(.5,a.currentTime);g.gain.exponentialRampToValueAtTime(.001,a.currentTime+.4);o.start();o.stop(a.currentTime+.45); },
    lE:     () => { const a=A(),o=a.createOscillator(),f=a.createBiquadFilter(),g=a.createGain();o.connect(f);f.connect(g);g.connect(a.destination);o.type='sawtooth';o.frequency.value=659;f.type='lowpass';f.frequency.setValueAtTime(2500,a.currentTime);f.frequency.exponentialRampToValueAtTime(400,a.currentTime+.3);g.gain.setValueAtTime(.5,a.currentTime);g.gain.exponentialRampToValueAtTime(.001,a.currentTime+.4);o.start();o.stop(a.currentTime+.45); },
    lG:     () => { const a=A(),o=a.createOscillator(),f=a.createBiquadFilter(),g=a.createGain();o.connect(f);f.connect(g);g.connect(a.destination);o.type='sawtooth';o.frequency.value=784;f.type='lowpass';f.frequency.setValueAtTime(2800,a.currentTime);f.frequency.exponentialRampToValueAtTime(400,a.currentTime+.3);g.gain.setValueAtTime(.45,a.currentTime);g.gain.exponentialRampToValueAtTime(.001,a.currentTime+.38);o.start();o.stop(a.currentTime+.42); },
    lA:     () => { const a=A(),o=a.createOscillator(),f=a.createBiquadFilter(),g=a.createGain();o.connect(f);f.connect(g);g.connect(a.destination);o.type='sawtooth';o.frequency.value=880;f.type='lowpass';f.frequency.setValueAtTime(3000,a.currentTime);f.frequency.exponentialRampToValueAtTime(500,a.currentTime+.3);g.gain.setValueAtTime(.42,a.currentTime);g.gain.exponentialRampToValueAtTime(.001,a.currentTime+.35);o.start();o.stop(a.currentTime+.4); },
    lF:     () => { const a=A(),o=a.createOscillator(),f=a.createBiquadFilter(),g=a.createGain();o.connect(f);f.connect(g);g.connect(a.destination);o.type='sawtooth';o.frequency.value=698;f.type='lowpass';f.frequency.setValueAtTime(2600,a.currentTime);f.frequency.exponentialRampToValueAtTime(400,a.currentTime+.3);g.gain.setValueAtTime(.48,a.currentTime);g.gain.exponentialRampToValueAtTime(.001,a.currentTime+.38);o.start();o.stop(a.currentTime+.42); },
    arp:    () => { const a=A();[523,659,784,1047].forEach((fr,i)=>{const o=a.createOscillator(),g=a.createGain();o.connect(g);g.connect(a.destination);o.type='square';o.frequency.value=fr;const t=a.currentTime+i*.08;g.gain.setValueAtTime(.3,t);g.gain.exponentialRampToValueAtTime(.001,t+.07);o.start(t);o.stop(t+.08);}); },
    cMaj:   () => { const a=A();[261.6,329.6,392].forEach(fr=>{const o=a.createOscillator(),g=a.createGain();o.connect(g);g.connect(a.destination);o.type='triangle';o.frequency.value=fr;g.gain.setValueAtTime(.28,a.currentTime);g.gain.exponentialRampToValueAtTime(.001,a.currentTime+.8);o.start();o.stop(a.currentTime+.85);}); },
    aMin:   () => { const a=A();[220,261.6,329.6].forEach(fr=>{const o=a.createOscillator(),g=a.createGain();o.connect(g);g.connect(a.destination);o.type='triangle';o.frequency.value=fr;g.gain.setValueAtTime(.28,a.currentTime);g.gain.exponentialRampToValueAtTime(.001,a.currentTime+.8);o.start();o.stop(a.currentTime+.85);}); },
    fMaj:   () => { const a=A();[174.6,220,261.6].forEach(fr=>{const o=a.createOscillator(),g=a.createGain();o.connect(g);g.connect(a.destination);o.type='triangle';o.frequency.value=fr;g.gain.setValueAtTime(.28,a.currentTime);g.gain.exponentialRampToValueAtTime(.001,a.currentTime+.8);o.start();o.stop(a.currentTime+.85);}); },
    gMaj:   () => { const a=A();[196,246.9,294].forEach(fr=>{const o=a.createOscillator(),g=a.createGain();o.connect(g);g.connect(a.destination);o.type='triangle';o.frequency.value=fr;g.gain.setValueAtTime(.28,a.currentTime);g.gain.exponentialRampToValueAtTime(.001,a.currentTime+.8);o.start();o.stop(a.currentTime+.85);}); },
    dMin:   () => { const a=A();[146.8,174.6,220].forEach(fr=>{const o=a.createOscillator(),g=a.createGain();o.connect(g);g.connect(a.destination);o.type='triangle';o.frequency.value=fr;g.gain.setValueAtTime(.28,a.currentTime);g.gain.exponentialRampToValueAtTime(.001,a.currentTime+.8);o.start();o.stop(a.currentTime+.85);}); },
    pad:    () => { const a=A();[261.6,329.6,392,523].forEach(fr=>{const o=a.createOscillator(),g=a.createGain();o.connect(g);g.connect(a.destination);o.type='sine';o.frequency.value=fr;g.gain.setValueAtTime(0,a.currentTime);g.gain.linearRampToValueAtTime(.18,a.currentTime+.15);g.gain.exponentialRampToValueAtTime(.001,a.currentTime+1.5);o.start();o.stop(a.currentTime+1.6);}); },
    zap:    () => { const a=A(),o=a.createOscillator(),g=a.createGain();o.connect(g);g.connect(a.destination);o.type='sawtooth';o.frequency.setValueAtTime(1200,a.currentTime);o.frequency.exponentialRampToValueAtTime(80,a.currentTime+.25);g.gain.setValueAtTime(.7,a.currentTime);g.gain.exponentialRampToValueAtTime(.001,a.currentTime+.28);o.start();o.stop(a.currentTime+.3); },
    laser:  () => { const a=A(),o=a.createOscillator(),g=a.createGain();o.connect(g);g.connect(a.destination);o.type='sine';o.frequency.setValueAtTime(150,a.currentTime);o.frequency.exponentialRampToValueAtTime(1800,a.currentTime+.2);g.gain.setValueAtTime(.6,a.currentTime);g.gain.exponentialRampToValueAtTime(.001,a.currentTime+.22);o.start();o.stop(a.currentTime+.25); },
    noise:  () => { const a=A(),b=a.createBuffer(1,a.sampleRate*.08,a.sampleRate),d=b.getChannelData(0);for(let i=0;i<d.length;i++)d[i]=Math.random()*2-1;const s=a.createBufferSource();s.buffer=b;const g=a.createGain();s.connect(g);g.connect(a.destination);g.gain.setValueAtTime(.6,a.currentTime);g.gain.exponentialRampToValueAtTime(.001,a.currentTime+.1);s.start(); },
    sub808: () => { const a=A(),o=a.createOscillator(),g=a.createGain();o.connect(g);g.connect(a.destination);o.type='sine';o.frequency.setValueAtTime(40,a.currentTime);g.gain.setValueAtTime(1.5,a.currentTime);g.gain.exponentialRampToValueAtTime(.001,a.currentTime+1.2);o.start();o.stop(a.currentTime+1.3); },
    vinyl:  () => { const a=A(),b=a.createBuffer(1,a.sampleRate*.3,a.sampleRate),d=b.getChannelData(0);for(let i=0;i<d.length;i++)d[i]=(Math.random()*2-1)*(i%7===0?.8:.1);const s=a.createBufferSource();s.buffer=b;const f=a.createBiquadFilter();f.type='lowpass';f.frequency.value=3000;const g=a.createGain();s.connect(f);f.connect(g);g.connect(a.destination);g.gain.setValueAtTime(.4,a.currentTime);g.gain.exponentialRampToValueAtTime(.001,a.currentTime+.35);s.start(); },
    glitch: () => { const a=A();for(let i=0;i<8;i++){const o=a.createOscillator(),g=a.createGain();o.connect(g);g.connect(a.destination);o.type='square';o.frequency.value=200+Math.random()*1800;const t=a.currentTime+i*.025;g.gain.setValueAtTime(.25,t);g.gain.exponentialRampToValueAtTime(.001,t+.02);o.start(t);o.stop(t+.025);} },
  };

  const PADS = [
    {key:'k808',   ico:'🥁',lbl:'808',    bg:'linear-gradient(145deg,#c62828,#8b0000)'},
    {key:'kTight', ico:'💢',lbl:'TIGHT',  bg:'linear-gradient(145deg,#ad1457,#880e4f)'},
    {key:'kDeep',  ico:'💣',lbl:'DEEP',   bg:'linear-gradient(145deg,#b71c1c,#7f0000)'},
    {key:'kSnap',  ico:'⚡',lbl:'SNAP',   bg:'linear-gradient(145deg,#d32f2f,#b71c1c)'},
    {key:'kMid',   ico:'🎯',lbl:'MID',    bg:'linear-gradient(145deg,#c0392b,#922b21)'},
    {key:'kSub',   ico:'🌀',lbl:'SUB',    bg:'linear-gradient(145deg,#a93226,#922b21)'},
    {key:'snare',  ico:'🔔',lbl:'SNARE',  bg:'linear-gradient(145deg,#e65100,#bf360c)'},
    {key:'clap',   ico:'👏',lbl:'CLAP',   bg:'linear-gradient(145deg,#f57c00,#e65100)'},
    {key:'rim',    ico:'💥',lbl:'RIM',    bg:'linear-gradient(145deg,#ef6c00,#e65100)'},
    {key:'hihat',  ico:'🎩',lbl:'HIHAT',  bg:'linear-gradient(145deg,#f9a825,#f57f17)'},
    {key:'openHat',ico:'🪘',lbl:'OPEN',   bg:'linear-gradient(145deg,#fdd835,#f9a825)'},
    {key:'crash',  ico:'💫',lbl:'CRASH',  bg:'linear-gradient(145deg,#fff176,#fdd835)'},
    {key:'bA',     ico:'🎸',lbl:'BASS A', bg:'linear-gradient(145deg,#2e7d32,#1b5e20)'},
    {key:'bD',     ico:'🎵',lbl:'BASS D', bg:'linear-gradient(145deg,#388e3c,#1b5e20)'},
    {key:'bG',     ico:'🎶',lbl:'BASS G', bg:'linear-gradient(145deg,#43a047,#2e7d32)'},
    {key:'bC',     ico:'🎼',lbl:'BASS C', bg:'linear-gradient(145deg,#1b5e20,#145214)'},
    {key:'bE',     ico:'🎻',lbl:'BASS E', bg:'linear-gradient(145deg,#33691e,#1b5e20)'},
    {key:'bSlap',  ico:'🤙',lbl:'SLAP',   bg:'linear-gradient(145deg,#558b2f,#33691e)'},
    {key:'lC',     ico:'💎',lbl:'LEAD C', bg:'linear-gradient(145deg,#1565c0,#0d47a1)'},
    {key:'lE',     ico:'🌟',lbl:'LEAD E', bg:'linear-gradient(145deg,#1976d2,#1565c0)'},
    {key:'lG',     ico:'✨',lbl:'LEAD G', bg:'linear-gradient(145deg,#1e88e5,#1565c0)'},
    {key:'lA',     ico:'🔵',lbl:'LEAD A', bg:'linear-gradient(145deg,#0277bd,#01579b)'},
    {key:'lF',     ico:'🔷',lbl:'LEAD F', bg:'linear-gradient(145deg,#0288d1,#0277bd)'},
    {key:'arp',    ico:'🎹',lbl:'ARP',    bg:'linear-gradient(145deg,#283593,#1a237e)'},
    {key:'cMaj',   ico:'🎶',lbl:'C MAJ',  bg:'linear-gradient(145deg,#6a1b9a,#4a148c)'},
    {key:'aMin',   ico:'🎵',lbl:'A MIN',  bg:'linear-gradient(145deg,#7b1fa2,#6a1b9a)'},
    {key:'fMaj',   ico:'🎼',lbl:'F MAJ',  bg:'linear-gradient(145deg,#8e24aa,#7b1fa2)'},
    {key:'gMaj',   ico:'🎻',lbl:'G MAJ',  bg:'linear-gradient(145deg,#512da8,#4527a0)'},
    {key:'dMin',   ico:'🎤',lbl:'D MIN',  bg:'linear-gradient(145deg,#5e35b1,#512da8)'},
    {key:'pad',    ico:'🌌',lbl:'PAD',    bg:'linear-gradient(145deg,#4527a0,#311b92)'},
    {key:'zap',    ico:'⚡',lbl:'ZAP',    bg:'linear-gradient(145deg,#00695c,#004d40)'},
    {key:'laser',  ico:'🔴',lbl:'LASER',  bg:'linear-gradient(145deg,#00838f,#006064)'},
    {key:'noise',  ico:'📡',lbl:'NOISE',  bg:'linear-gradient(145deg,#0097a7,#00838f)'},
    {key:'sub808', ico:'💀',lbl:'SUB 8',  bg:'linear-gradient(145deg,#00796b,#004d40)'},
    {key:'vinyl',  ico:'💿',lbl:'VINYL',  bg:'linear-gradient(145deg,#00acc1,#0097a7)'},
    {key:'glitch', ico:'👾',lbl:'GLITCH', bg:'linear-gradient(145deg,#26c6da,#00acc1)'},
  ];

  const wrap = document.createElement('div');
  wrap.className = 'dj-wrap';
  content.appendChild(wrap);

  const ctrl = document.createElement('div');
  ctrl.className = 'dj-controls';
  ctrl.innerHTML = `<div class="dj-bpm-row"><button class="dj-bpm-btn" id="bpm-dn">−</button><div class="dj-bpm-val" id="bpm-d">120 BPM</div><button class="dj-bpm-btn" id="bpm-up">+</button></div><button class="dj-loop-btn" id="dj-lp">◯ LOOP</button>`;
  wrap.appendChild(ctrl);

  const grid = document.createElement('div');
  grid.className = 'dj-grid';
  wrap.appendChild(grid);

  const padEls = [];
  PADS.forEach((p, idx) => {
    const el = document.createElement('div');
    el.className = 'dj-pad';
    el.style.background = p.bg;
    el.innerHTML = `<span class="dj-ico">${p.ico}</span><span class="dj-lbl">${p.lbl}</span>`;
    const trig = () => {
      S[p.key]();
      el.classList.add('hit');
      setTimeout(() => el.classList.remove('hit'), 90);
      if (loopMode) {
        if (activeSet.has(idx)) { activeSet.delete(idx); el.classList.remove('looping'); }
        else { activeSet.add(idx); el.classList.add('looping'); }
      }
    };
    el.addEventListener('mousedown', () => { haptic('light'); trig(); });
    el.addEventListener('touchstart', e => { e.preventDefault(); trig(); }, { passive: false });
    grid.appendChild(el);
    padEls.push(el);
  });

  const startSeq = () => {
    if (seqTimer) clearInterval(seqTimer);
    seqTimer = setInterval(() => {
      activeSet.forEach(idx => {
        S[PADS[idx].key]();
        const el = padEls[idx];
        if (el) { el.classList.add('hit'); setTimeout(() => el.classList.remove('hit'), 90); }
      });
    }, 60000 / bpm);
  };
  const stopSeq = () => { if (seqTimer) { clearInterval(seqTimer); seqTimer = null; } };

  const lpBtn = document.getElementById('dj-lp');
  lpBtn.onclick = () => {
    loopMode = !loopMode;
    lpBtn.classList.toggle('on', loopMode);
    lpBtn.textContent = loopMode ? '● LOOP' : '◯ LOOP';
    if (loopMode) startSeq();
    else { stopSeq(); activeSet.clear(); padEls.forEach(el => el.classList.remove('looping')); }
  };

  const bpmD = document.getElementById('bpm-d');
  document.getElementById('bpm-dn').onclick = () => { bpm = Math.max(60, bpm - 5); bpmD.textContent = `${bpm} BPM`; if (seqTimer) startSeq(); };
  document.getElementById('bpm-up').onclick = () => { bpm = Math.min(200, bpm + 5); bpmD.textContent = `${bpm} BPM`; if (seqTimer) startSeq(); };

  return () => { stopSeq(); if (ac) ac.close(); };
}
