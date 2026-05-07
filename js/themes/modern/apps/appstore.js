/* ════════════ APP STORE v8 MODERN ════════════
   Modern app store with glass effects
   ════════════════════════════════════ */

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

  const c = window.content;
  c.style.cssText = 'width:100%;height:100%;display:flex;flex-direction:column;overflow:hidden;background:rgba(248,249,252,.92);border-radius:28px;';

  // Header
  const header = document.createElement('div');
  header.style.cssText = 'flex-shrink:0;padding:16px;background:rgba(255,255,255,.9);backdrop-filter:blur(20px);-webkit-backdrop-filter:blur(20px);border-bottom:1px solid rgba(15,23,42,.08);border-radius:28px 28px 0 0;';
  header.innerHTML = `
    <div style="display:flex;align-items:center;gap:8px;margin-bottom:12px;">
      <div style="font-size:1.5rem;">🛍️</div>
      <div style="font-family:'Inter',sans-serif;font-size:1.2rem;color:#111;font-weight:600;">App Store</div>
    </div>
    <div style="position:relative;margin-bottom:8px;">
      <input id="store-search" type="search" placeholder="Search apps…" autocomplete="off" style="width:100%;padding:12px 16px;border:1px solid rgba(15,23,42,.12);border-radius:16px;font-family:'Inter',sans-serif;font-size:1rem;color:#111;outline:none;background:#f8f9fa;" />
    </div>
    <div id="store-categories" style="display:flex;gap:8px;overflow-x:auto;-webkit-overflow-scrolling:touch;"></div>
  `;
  c.appendChild(header);

  // Body
  const body = document.createElement('div');
  body.style.cssText = 'flex:1;overflow-y:auto;-webkit-overflow-scrolling:touch;padding:16px;';
  c.appendChild(body);

  // Status
  const status = document.createElement('div');
  status.style.cssText = 'flex-shrink:0;padding:12px 16px;text-align:center;font-family:\'Inter\',sans-serif;font-size:.9rem;color:#666;background:rgba(255,255,255,.9);backdrop-filter:blur(20px);-webkit-backdrop-filter:blur(20px);border-top:1px solid rgba(15,23,42,.08);border-radius:0 0 28px 28px;';
  c.appendChild(status);

  const searchInput = header.querySelector('#store-search');
  const categoriesDiv = header.querySelector('#store-categories');

  let currentCat = 'All';
  let searchTerm = '';

  function updateInstalledCount() {
    const installed = ALL_STORE_APPS.filter(app => APP_LOOKUP[app.id] && !APP_LOOKUP[app.id].stub).length;
    status.textContent = `${installed} of ${ALL_STORE_APPS.length} apps installed`;
  }

  function renderCategories() {
    categoriesDiv.innerHTML = '';
    CATS.forEach(cat => {
      const btn = document.createElement('button');
      btn.style.cssText = `font-family:'Inter',sans-serif;font-size:.9rem;color:${currentCat === cat ? '#fff' : '#111'};background:${currentCat === cat ? '#4a90d9' : '#f8f9fa'};border:1px solid rgba(15,23,42,.12);border-radius:20px;padding:6px 16px;cursor:pointer;-webkit-tap-highlight-color:transparent;white-space:nowrap;`;
      btn.textContent = cat;
      btn.onclick = () => {
        currentCat = cat;
        renderCategories();
        renderApps();
      };
      categoriesDiv.appendChild(btn);
    });
  }

  function renderApps() {
    body.innerHTML = '';
    const filtered = ALL_STORE_APPS.filter(app => {
      const matchesCat = currentCat === 'All' || app.cat === currentCat;
      const matchesSearch = !searchTerm || app.name.toLowerCase().includes(searchTerm.toLowerCase()) || app.desc.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesCat && matchesSearch;
    });

    filtered.forEach(app => {
      const card = document.createElement('div');
      card.style.cssText = 'background:rgba(255,255,255,.9);backdrop-filter:blur(20px);-webkit-backdrop-filter:blur(20px);border:1px solid rgba(15,23,42,.08);border-radius:16px;padding:16px;margin-bottom:12px;display:flex;gap:12px;';

      const iconDiv = document.createElement('div');
      iconDiv.style.cssText = `width:48px;height:48px;border-radius:12px;background:${app.col};display:flex;align-items:center;justify-content:center;font-size:1.5rem;`;
      iconDiv.textContent = app.ico;

      const infoDiv = document.createElement('div');
      infoDiv.style.cssText = 'flex:1;';
      infoDiv.innerHTML = `
        <div style="font-family:'Inter',sans-serif;font-size:1rem;color:#111;font-weight:600;margin-bottom:2px;">${app.name}</div>
        <div style="font-family:'Inter',sans-serif;font-size:.8rem;color:#666;margin-bottom:4px;">${app.cat} • ${app.size}</div>
        <div style="font-family:'Inter',sans-serif;font-size:.9rem;color:#666;line-height:1.4;">${app.desc}</div>
        <div style="display:flex;gap:4px;margin-top:8px;">
          <span style="font-family:'Inter',sans-serif;font-size:.8rem;color:#666;">⭐ ${app.rating}</span>
        </div>
      `;

      const actionBtn = document.createElement('button');
      const isInstalled = APP_LOOKUP[app.id] && !APP_LOOKUP[app.id].stub;
      actionBtn.style.cssText = `font-family:'Inter',sans-serif;font-size:.9rem;color:#fff;background:${isInstalled ? '#34c759' : '#4a90d9'};border:none;border-radius:12px;padding:8px 16px;cursor:pointer;-webkit-tap-highlight-color:transparent;`;
      actionBtn.textContent = isInstalled ? 'Installed' : 'Get';
      actionBtn.onclick = () => {
        if (!isInstalled) {
          // Simulate install
          showToast(`📦 ${app.name} installed!`, 'cyan', 2000);
          updateInstalledCount();
          renderApps();
        }
      };

      card.appendChild(iconDiv);
      card.appendChild(infoDiv);
      card.appendChild(actionBtn);
      body.appendChild(card);
    });

    if (filtered.length === 0) {
      const empty = document.createElement('div');
      empty.style.cssText = 'text-align:center;padding:40px;font-family:\'Inter\',sans-serif;color:#666;';
      empty.innerHTML = '<div style="font-size:3rem;margin-bottom:16px;">🔍</div><div>No apps found matching your search.</div>';
      body.appendChild(empty);
    }
  }

  searchInput.oninput = () => {
    searchTerm = searchInput.value;
    renderApps();
  };

  renderCategories();
  renderApps();
  updateInstalledCount();
}