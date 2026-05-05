/* ════════════ APP STORE ════════════ */
function initAppStore() {
  POS.trackAppOpen('appstore');

  const ALL_STORE_APPS = [
    { id:'assistant', name:'AI Assistant', ico:'🤖', col:'#00ffcc', cat:'Productivity', desc:'Chat with a built-in AI. Ask questions, get answers, launch apps by voice.', size:'2.1 MB', rating:'4.9' },
    { id:'terminal',  name:'Hacker Terminal', ico:'💻', col:'#00ff41', cat:'Tools', desc:'Fake hacker terminal with scan, decrypt, hack, and matrix rain commands.', size:'1.4 MB', rating:'4.8' },
    { id:'filesystem',name:'File System', ico:'🗂️', col:'#ffd740', cat:'Productivity', desc:'Browse your virtual /documents/ and /games/ folders. Manage saved data.', size:'0.9 MB', rating:'4.5' },
    { id:'clock',     name:'Clock', ico:'🕐', col:'#00ffcc', cat:'Utilities', desc:'Live analog + digital clock with neon glow aesthetic.', size:'0.3 MB', rating:'4.7' },
    { id:'weather',   name:'Weather', ico:'🌤️', col:'#4dd0e1', cat:'Utilities', desc:'Real-time weather with animated backgrounds. Uses your location.', size:'1.2 MB', rating:'4.6' },
    { id:'timer',     name:'Timer', ico:'⏱️', col:'#69ff47', cat:'Utilities', desc:'Countdown and stopwatch with haptic feedback.', size:'0.4 MB', rating:'4.4' },
    { id:'notes',     name:'Notes', ico:'📝', col:'#ffd740', cat:'Productivity', desc:'Multi-note editor with titles, timestamps, and auto-save.', size:'0.6 MB', rating:'4.8' },
    { id:'sports',    name:'Sports', ico:'🏆', col:'#ff9800', cat:'Info', desc:'Live scores and standings for major sports leagues.', size:'1.0 MB', rating:'4.3' },
    { id:'casino',    name:'Casino', ico:'🎰', col:'#ffd700', cat:'Games', desc:'Slots, blackjack, and more. Virtual chips only.', size:'0.8 MB', rating:'4.2' },
    { id:'snake',     name:'Snake', ico:'🐍', col:'#69ff47', cat:'Games', desc:'Classic snake game with neon visuals and high score tracking.', size:'0.5 MB', rating:'4.5' },
    { id:'flappy',    name:'Flappy', ico:'🐦', col:'#81d4fa', cat:'Games', desc:'Tap to fly through pipes. Deceptively simple, brutally hard.', size:'0.4 MB', rating:'4.1' },
    { id:'pong',      name:'Pong', ico:'🏓', col:'#f48fb1', cat:'Games', desc:'Two-player touchscreen Pong or play against AI.', size:'0.3 MB', rating:'4.3' },
    { id:'breakout',  name:'Breakout', ico:'🧱', col:'#ffcc80', cat:'Games', desc:'Classic brick breaker with powerups and progressive difficulty.', size:'0.6 MB', rating:'4.4' },
    { id:'simon',     name:'Simon', ico:'🟢', col:'#ffeb3b', cat:'Games', desc:'Memory game. Follow the pattern. How far can you go?', size:'0.3 MB', rating:'4.0' },
    { id:'reaction',  name:'Reaction', ico:'⚡', col:'#fff9c4', cat:'Games', desc:'Test your reaction time. Compete against your own high score.', size:'0.3 MB', rating:'4.2' },
    { id:'colorgame', name:'Colors', ico:'🎨', col:'#e1bee7', cat:'Games', desc:'Can you tell the difference between two similar colors?', size:'0.4 MB', rating:'4.1' },
    { id:'g2048',     name:'2048', ico:'🟦', col:'#edc22e', cat:'Games', desc:'Slide tiles and combine numbers. Reach the 2048 tile.', size:'0.5 MB', rating:'4.6' },
    { id:'pacman',    name:'Pac-Man', ico:'👾', col:'#ffd700', cat:'Games', desc:'Classic ghost-dodging action in neon style.', size:'0.7 MB', rating:'4.5' },
    { id:'deviceinfo',name:'Device Info', ico:'📊', col:'#ff6d6d', cat:'Tools', desc:'View your device specs, sensors, and system information.', size:'0.4 MB', rating:'4.3' },
    { id:'benchmark', name:'Benchmark', ico:'🔬', col:'#ff6d6d', cat:'Tools', desc:'Run CPU, GPU, and memory tests to score your device.', size:'0.8 MB', rating:'4.5' },
    { id:'gyro',      name:'Compass', ico:'🧭', col:'#4dd0e1', cat:'Tools', desc:'Gyroscope-based compass and orientation viewer.', size:'0.3 MB', rating:'4.0' },
    { id:'ascii',     name:'ASCII Cam', ico:'📷', col:'#fff176', cat:'Creative', desc:'Live camera feed rendered as ASCII art. Very cool.', size:'0.6 MB', rating:'4.4' },
    { id:'djpad',     name:'DJ Pad', ico:'🎹', col:'#ff9800', cat:'Creative', desc:'16-pad drum machine and synth. Make beats on the go.', size:'1.1 MB', rating:'4.6' },
    { id:'visualizer',name:'Visualizer', ico:'🎵', col:'#ce93d8', cat:'Creative', desc:'Mic-reactive audio visualizer with animated waveforms.', size:'0.7 MB', rating:'4.4' },
    { id:'particles', name:'Sparks', ico:'✨', col:'#ff4af8', cat:'Creative', desc:'Touch-reactive particle system with neon sparks and trails.', size:'0.5 MB', rating:'4.7' },
    { id:'screensaver',name:'Screensaver', ico:'🌊', col:'#ce93d8', cat:'Creative', desc:'Liquid glass metaball screensaver. Hypnotic.', size:'0.6 MB', rating:'4.8' },
  ];

  const CATS = ['All', 'Games', 'Productivity', 'Tools', 'Utilities', 'Creative', 'Info'];

  const wrap = document.createElement('div');
  wrap.style.cssText = 'width:100%;height:100%;display:flex;flex-direction:column;background:#050508;overflow:hidden;';
  content.appendChild(wrap);

  /* Header */
  const hdr = document.createElement('div');
  hdr.style.cssText = 'flex-shrink:0;padding:89px 18px 0;';
  hdr.innerHTML = `
    <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:12px;">
      <div style="font-family:'Orbitron',sans-serif;font-size:.65rem;letter-spacing:.22em;text-transform:uppercase;color:var(--cyan);text-shadow:var(--gc);">App Store</div>
      <div id="store-installed-count" style="font-family:'Share Tech Mono',monospace;font-size:.5rem;color:var(--dim);letter-spacing:.08em;"></div>
    </div>
    <div style="position:relative;margin-bottom:12px;">
      <input id="store-search" type="search" placeholder="Search apps…" autocomplete="off" style="
        width:100%;padding:10px 14px 10px 36px;
        background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.1);
        border-radius:20px;color:var(--text);
        font-family:'Share Tech Mono',monospace;font-size:.78rem;
        outline:none;-webkit-appearance:none;
      ">
      <span style="position:absolute;left:13px;top:50%;transform:translateY(-50%);color:var(--dim);font-size:.9rem;pointer-events:none;">🔍</span>
    </div>
  `;
  wrap.appendChild(hdr);

  /* Category filter */
  const catBar = document.createElement('div');
  catBar.style.cssText = 'flex-shrink:0;display:flex;gap:8px;overflow-x:auto;padding:0 18px 12px;scrollbar-width:none;border-bottom:1px solid rgba(255,255,255,.05);';
  let activecat = 'All';
  const catBtns = {};
  CATS.forEach(cat => {
    const btn = document.createElement('button');
    btn.textContent = cat;
    btn.style.cssText = [
      'flex-shrink:0;font-family:"Share Tech Mono",monospace;font-size:.55rem;',
      'letter-spacing:.08em;padding:6px 14px;border-radius:20px;cursor:pointer;',
      'white-space:nowrap;-webkit-tap-highlight-color:transparent;transition:all .15s;',
      cat === 'All'
        ? 'background:var(--cyan);color:#050508;border:1px solid var(--cyan);'
        : 'background:transparent;color:var(--dim);border:1px solid rgba(255,255,255,.1);',
    ].join('');
    btn.onclick = () => {
      activecat = cat;
      Object.entries(catBtns).forEach(([c, b]) => {
        if (c === cat) { b.style.background = 'var(--cyan)'; b.style.color = '#050508'; b.style.borderColor = 'var(--cyan)'; }
        else { b.style.background = 'transparent'; b.style.color = 'var(--dim)'; b.style.borderColor = 'rgba(255,255,255,.1)'; }
      });
      renderList();
    };
    catBtns[cat] = btn;
    catBar.appendChild(btn);
  });
  wrap.appendChild(catBar);

  /* List */
  const list = document.createElement('div');
  list.style.cssText = 'flex:1;overflow-y:auto;-webkit-overflow-scrolling:touch;padding:12px 18px calc(var(--sb,20px) + 24px);display:flex;flex-direction:column;gap:10px;';
  wrap.appendChild(list);

  // Get installed state
  const installed = new Set(POS.getInstalledApps() || ALL_STORE_APPS.map(a => a.id));

  const updateInstalledCount = () => {
    const el = document.getElementById('store-installed-count');
    if (el) el.textContent = `${installed.size} installed`;
  };
  updateInstalledCount();

  const search = hdr.querySelector('#store-search');
  search.addEventListener('input', renderList);

  function renderList() {
    const q = search.value.trim().toLowerCase();
    const filtered = ALL_STORE_APPS.filter(a => {
      if (activecat !== 'All' && a.cat !== activecat) return false;
      if (q && !a.name.toLowerCase().includes(q) && !a.desc.toLowerCase().includes(q)) return false;
      return true;
    });

    list.innerHTML = '';
    filtered.forEach(app => {
      const isInstalled = installed.has(app.id);
      const card = document.createElement('div');
      card.style.cssText = [
        'display:flex;align-items:center;gap:14px;',
        'padding:12px 14px;border-radius:18px;',
        'background:rgba(255,255,255,.02);border:1px solid rgba(255,255,255,.06);',
        'transition:background .15s;',
      ].join('');

      card.innerHTML = `
        <div style="width:52px;height:52px;border-radius:22%;flex-shrink:0;display:flex;align-items:center;justify-content:center;font-size:1.7rem;background:rgba(0,0,0,.4);border:1px solid ${app.col}44;box-shadow:0 0 14px ${app.col}18;">${app.ico}</div>
        <div style="flex:1;min-width:0;display:flex;flex-direction:column;gap:3px;">
          <div style="font-family:'Orbitron',sans-serif;font-size:.58rem;letter-spacing:.06em;color:var(--text);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${app.name}</div>
          <div style="font-family:'Share Tech Mono',monospace;font-size:.5rem;color:var(--dim);overflow:hidden;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;">${app.desc}</div>
          <div style="display:flex;gap:8px;align-items:center;margin-top:2px;">
            <span style="font-family:'Share Tech Mono',monospace;font-size:.44rem;color:var(--dim);">${app.cat}</span>
            <span style="font-family:'Share Tech Mono',monospace;font-size:.44rem;color:#ffd700;">★ ${app.rating}</span>
            <span style="font-family:'Share Tech Mono',monospace;font-size:.44rem;color:var(--dim);">${app.size}</span>
          </div>
        </div>
        <button class="store-toggle-btn" data-id="${app.id}" style="
          flex-shrink:0;font-family:'Orbitron',sans-serif;font-size:.46rem;
          letter-spacing:.1em;text-transform:uppercase;
          padding:8px 14px;border-radius:18px;cursor:pointer;
          -webkit-tap-highlight-color:transparent;transition:all .2s;
          ${isInstalled
            ? 'background:rgba(255,82,82,.12);color:#ff5252;border:1px solid rgba(255,82,82,.3);'
            : `background:${app.col};color:#050508;border:1px solid ${app.col};`
          }
        ">${isInstalled ? 'Remove' : 'Install'}</button>
      `;

      const btn = card.querySelector('.store-toggle-btn');
      btn.onclick = () => toggleInstall(app, btn);
      list.appendChild(card);
    });

    if (!filtered.length) {
      list.innerHTML = `<div style="display:flex;flex-direction:column;align-items:center;justify-content:center;gap:12px;padding:60px 30px;text-align:center;"><div style="font-size:3rem">🔍</div><div style="font-family:'Share Tech Mono',monospace;font-size:.7rem;color:var(--dim);letter-spacing:.1em;">No apps found</div></div>`;
    }
  }

  let installing = null;
  function toggleInstall(app, btn) {
    if (installing) return;
    haptic('medium');
    const willInstall = !installed.has(app.id);

    if (willInstall) {
      // Fake install with progress
      installing = app.id;
      btn.textContent = '0%';
      btn.style.background = 'rgba(0,255,204,.1)';
      btn.style.color = 'var(--cyan)';
      btn.style.borderColor = 'rgba(0,255,204,.3)';
      let pct = 0;
      const iv = setInterval(() => {
        pct += Math.floor(Math.random() * 18) + 8;
        if (pct >= 100) {
          clearInterval(iv);
          installed.add(app.id);
          POS.setInstalledApps([...installed]);
          POS.markFlag('installedFromStore');
          POS.addXP(10, 'install');
          btn.textContent = 'Remove';
          btn.style.background = 'rgba(255,82,82,.12)';
          btn.style.color = '#ff5252';
          btn.style.borderColor = 'rgba(255,82,82,.3)';
          showToast(`📦 ${app.name} installed!`, 'cyan', 2000);
          updateInstalledCount();
          installing = null;
          // Rebuild home grid
          window._rebuildGrid && window._rebuildGrid();
        } else {
          btn.textContent = pct + '%';
        }
      }, 80);
    } else {
      installed.delete(app.id);
      POS.setInstalledApps([...installed]);
      btn.textContent = 'Install';
      btn.style.background = app.col;
      btn.style.color = '#050508';
      btn.style.borderColor = app.col;
      showToast(`🗑️ ${app.name} removed`, 'red', 1500);
      updateInstalledCount();
      window._rebuildGrid && window._rebuildGrid();
    }
  }

  renderList();
}
