/**
 * core.js — iPOCKET v8 Windows 98 OS Shell
 * Global: OS, haptic, content (compat), showToast98
 */
'use strict';

/* ── HAPTICS ─────────────────────────────────────────────── */
let _hac = null;
window.haptic = function(type) {
  if (localStorage.getItem('ipocket_sound') === '0') return;
  type = type || 'light';
  if (navigator.vibrate) {
    const p = {light:8,medium:18,heavy:40,success:[8,30,8],error:[30,15,30]};
    navigator.vibrate(p[type]||8);
  }
  try {
    if (!_hac) _hac = new (window.AudioContext||window.webkitAudioContext)();
    if (_hac.state==='suspended') _hac.resume();
    const o=_hac.createOscillator(), g=_hac.createGain();
    o.connect(g); g.connect(_hac.destination);
    o.frequency.value = type==='heavy'?60:type==='medium'?120:440;
    o.type='square';
    g.gain.setValueAtTime(0.015,_hac.currentTime);
    g.gain.exponentialRampToValueAtTime(0.0001,_hac.currentTime+0.06);
    o.start(_hac.currentTime); o.stop(_hac.currentTime+0.07);
  } catch(e){}
};

/* ── COMPAT GLOBALS ──────────────────────────────────────── */
// content = the body of the currently open win98 window

/* ── Theme override tracking ─────────────────────────────── */
// Maps appId → base retro script path (used to restore init functions on theme switch)
const APP_BASE_SCRIPT = {
  appstore:   'js/apps/appstore.js',
  assistant:  'js/apps/assistant.js',
  browser:    'js/apps/browser.js',
  clock:      'js/apps/clock.js',
  contacts:   'js/apps/contacts.js',
  filesystem: 'js/apps/filesystem.js',
  library:    'js/apps/library.js',
  messages:   'js/apps/messages.js',
  notes:      'js/apps/notes.js',
  paint:      'js/apps/paint.js',
  settings:   'js/apps/settings98.js',
  terminal:   'js/apps/terminal.js',
  weather:    'js/apps/weather.js',
  maps:       'js/apps/maps.js',
};
// Tracks which apps have had their init functions overridden by a non-retro theme script
const themedApps = new Set();
// This is set by OS.openApp so old app code still works
window.content = null;

/* ── APP REGISTRY ────────────────────────────────────────── */
// Page 1: 16 icons (4×4)
// Page 2: 16 icons (4×4)
const APP_PAGES = [
  // PAGE 1
  [
    {id:'games',      name:'Games',       ico:'🎮', stub:false},
    {id:'filesystem', name:'Files',       ico:'📁', stub:false},
    {id:'notes',      name:'Notes',       ico:'📝', stub:false},
    {id:'weather',    name:'Weather',     ico:'☁️',  stub:false},
    {id:'timer',      name:'Timer',       ico:'⏱️',  stub:false},
    {id:'ascii',      name:'ASCII Cam',   ico:'📸',  stub:false},
    {id:'settings',   name:'Settings',    ico:'⚙️',  stub:false},
    {id:'music',      name:'Music',       ico:'🎵',  stub:'Coming Soon'},
    {id:'paint',      name:'Paint',       ico:'🎨',  stub:false},
    {id:'idcard',     name:'ID Card',     ico:'🪪',  stub:'Coming Soon'},
    {id:'videos',     name:'Videos',      ico:'🎬',  stub:'Coming Soon'},
    {id:'tasks',      name:'Tasks',       ico:'✅',  stub:'Coming Soon'},
    {id:'appstore',   name:'Store',       ico:'🛍️',  stub:false},
    {id:'achievements',name:'Achievements',ico:'🏆',stub:false},
    {id:'terminal',   name:'Terminal',    ico:'💻',  stub:false},
    {id:'virus',      name:'Virus',       ico:'☣️',  stub:'Coming Soon'},
  ],
  // PAGE 2
  [
    {id:'maps',       name:'Maps',        ico:'🗺️',  stub:false},
    {id:'library',    name:'Library',     ico:'📚',  stub:false},
    {id:'crypto',     name:'Crypto',      ico:'₿',   stub:'Coming Soon'},
    {id:'sparks',      name:'Sparks',      ico:'✨',  stub:false},
    {id:'debug',      name:'Debug',       ico:'🐛',  stub:false},
    {id:'snake',      name:'Snake',       ico:'🐍',  stub:false},
    {id:'casino',     name:'Casino',      ico:'🎰',  stub:false},
    {id:'screensaver', name:'Screensaver', ico:'🌊',  stub:false},
    {id:'contacts',   name:'Contacts',    ico:'👤',  stub:false},
    {id:'messages',   name:'Messages',    ico:'💬',  stub:false},
    {id:'browser',    name:'Browser',     ico:'🌐',  stub:false},
    {id:'gallery',    name:'Gallery',     ico:'🖼️',  stub:false},
    {id:'clock',      name:'Clock',       ico:'🕐',  stub:false},
    {id:'assistant',  name:'Assistant',   ico:'🤖',  stub:false},
    {id:'sports',     name:'Sports',      ico:'⚽',  stub:false},
    {id:'benchmark',  name:'Benchmark',   ico:'🔬',  stub:false},
  ]
];

// Flat app lookup
const APP_LOOKUP = {};
APP_PAGES.forEach(page => page.forEach(a => { APP_LOOKUP[a.id] = a; }));

// Register sub-apps not on any home page (launched from Games Hub etc.)
// These need entries in APP_LOOKUP so OS.openApp() doesn't reject them
const HIDDEN_APPS = [
  {id:'flappy',    name:'Flappy',     ico:'🐦', stub:false},
  {id:'pong',      name:'Pong',       ico:'🏓', stub:false},
  {id:'breakout',  name:'Breakout',   ico:'🧱', stub:false},
  {id:'simon',     name:'Simon',      ico:'🟢', stub:false},
  {id:'reaction',  name:'Reaction',   ico:'⚡', stub:false},
  {id:'colorgame', name:'Colors',     ico:'🎨', stub:false},
  {id:'g2048',     name:'2048',       ico:'🟦', stub:false},
  {id:'pacman',    name:'Pac-Man',    ico:'👾', stub:false},
  {id:'screensaver',name:'Screensaver',ico:'🌊', stub:false},
  {id:'djpad',     name:'DJ Pad',     ico:'🎹', stub:false},
  {id:'visualizer',name:'Visualizer', ico:'🎵', stub:false},
  {id:'gyro',      name:'Compass',    ico:'🧭', stub:false},
  {id:'deviceinfo',name:'Device Info',ico:'📊', stub:false},
  {id:'clock',     name:'Clock',      ico:'🕐', stub:false},
];
HIDDEN_APPS.forEach(a => { APP_LOOKUP[a.id] = a; });

const STORE_APP_IDS = ['assistant','terminal','filesystem','clock','weather','timer','notes','sports','casino','snake','flappy','pong','breakout','simon','reaction','colorgame','g2048','pacman','deviceinfo','benchmark','gyro','ascii','djpad','visualizer','particles','screensaver'];
const HOME_ORDER_KEY = 'ipocket_home_order';
let HOME_ORDER = loadHomeOrder();

function loadHomeOrder() {
  try { return JSON.parse(localStorage.getItem(HOME_ORDER_KEY) || '{}'); } catch (e) { return {}; }
}

function saveHomeOrder() {
  try { localStorage.setItem(HOME_ORDER_KEY, JSON.stringify(HOME_ORDER)); } catch(e) {}
}

function getOrderedApps(apps, pageIdx) {
  const order = HOME_ORDER[pageIdx] || apps.map(a => a.id);
  return apps.slice().sort((a, b) => {
    const ai = order.indexOf(a.id);
    const bi = order.indexOf(b.id);
    if (ai === -1 && bi === -1) return 0;
    if (ai === -1) return 1;
    if (bi === -1) return -1;
    return ai - bi;
  });
}

window.homeEditEnabled = localStorage.getItem('ipocket_home_edit') !== '0';
let homeEditMode = false;

function isModernTheme() {
  return document.body.classList.contains('theme-modern');
}

function enterHomeEditMode() {
  if (homeEditMode || !isModernTheme()) return;
  homeEditMode = true;
  document.body.classList.add('home-editing-enter');
  haptic && haptic('medium');
  setTimeout(() => {
    document.body.classList.remove('home-editing-enter');
    document.body.classList.add('home-editing');
  }, 420);
}

function exitHomeEditMode() {
  if (!homeEditMode) return;
  homeEditMode = false;
  document.body.classList.remove('home-editing');
  document.body.classList.remove('home-editing-enter');
}

/* ── Uninstall with progress bar popup ── */
function uninstallApp(appId, iconEl) {
  if (!appId) return;
  /* Shrink the icon out */
  iconEl.style.transition = 'transform 0.25s ease, opacity 0.25s ease';
  iconEl.style.transform = 'scale(0)';
  iconEl.style.opacity = '0';

  /* Progress bar popup */
  const popup = document.createElement('div');
  popup.style.cssText = [
    'position:fixed;left:50%;transform:translateX(-50%);bottom:110px;z-index:99999;',
    'background:rgba(28,28,30,0.88);backdrop-filter:blur(16px);-webkit-backdrop-filter:blur(16px);',
    'border-radius:16px;padding:14px 20px;min-width:200px;max-width:280px;',
    'box-shadow:0 8px 32px rgba(0,0,0,0.4);',
    'font-family:-apple-system,BlinkMacSystemFont,system-ui,sans-serif;',
    'animation:uninstall-popup-in 0.25s cubic-bezier(0.34,1.56,0.64,1) both;',
  ].join('');
  popup.innerHTML = `
    <div style="color:#fff;font-size:13px;font-weight:600;margin-bottom:8px;text-align:center;">Removing App…</div>
    <div style="background:rgba(255,255,255,0.15);border-radius:4px;height:5px;overflow:hidden;">
      <div id="uninstall-bar" style="height:100%;width:0%;background:#ff3b30;border-radius:4px;transition:width 0.4s ease;"></div>
    </div>
  `;
  document.body.appendChild(popup);

  /* Animate bar */
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      const bar = popup.querySelector('#uninstall-bar');
      if (bar) bar.style.width = '100%';
    });
  });

  setTimeout(() => {
    /* Actually remove from installed list */
    const cur = POS.getInstalledApps();
    const allIds = [].concat(...APP_PAGES.map(p=>p.map(a=>a.id)));
    const base = cur === null ? allIds : cur;
    POS.setInstalledApps(base.filter(id => id !== appId));
    popup.style.opacity = '0';
    popup.style.transition = 'opacity 0.2s ease';
    setTimeout(() => { popup.remove(); buildGrid(); }, 200);
  }, 500);
}

/* ── Drag state ── */
const homeDragState = {
  timer: null,
  dragging: false,
  target: null,
  dragEl: null,
  placeholder: null,
  pageIdx: null,
  startX: 0,
  startY: 0,
  offsetX: 0,
  offsetY: 0,
};

function clearHomeDragTimer() {
  if (homeDragState.timer) { clearTimeout(homeDragState.timer); homeDragState.timer = null; }
}

function endHomeDrag() {
  if (!homeDragState.dragging) return;
  homeDragState.dragging = false;
  document.removeEventListener('pointermove', handleHomeDragMove);
  document.removeEventListener('pointerup',   handleHomeDragUp);

  if (homeDragState.dragEl) homeDragState.dragEl.remove();

  if (homeDragState.placeholder && homeDragState.placeholder.parentNode) {
    const grid = homeDragState.placeholder.parentNode;
    /* Insert the real icon where the placeholder is */
    if (homeDragState.target) {
      grid.insertBefore(homeDragState.target, homeDragState.placeholder);
      homeDragState.target.style.visibility = '';
    }
    homeDragState.placeholder.remove();

    /* Save new order */
    const ids = Array.from(grid.querySelectorAll('.app-icon:not(.placeholder)'))
      .map(el => el.dataset.appId).filter(Boolean);
    HOME_ORDER[homeDragState.pageIdx] = ids;
    saveHomeOrder();
    /* Rebuild to ensure clean state */
    setTimeout(() => buildGrid(), 50);
  } else if (homeDragState.target) {
    homeDragState.target.style.visibility = '';
  }

  homeDragState.target      = null;
  homeDragState.dragEl      = null;
  homeDragState.placeholder = null;
  homeDragState.pageIdx     = null;
}

function handleHomeDragUp() { clearHomeDragTimer(); endHomeDrag(); }

function beginHomeDrag(e, icon, pageIdx) {
  if (!window.homeEditEnabled) return;
  if (isModernTheme() && !homeEditMode) return;
  if (homeDragState.dragging) return;

  homeDragState.dragging = true;
  homeDragState.timer    = null;
  homeDragState.pageIdx  = pageIdx;
  homeDragState.target   = icon;

  const rect = icon.getBoundingClientRect();
  homeDragState.offsetX = e.clientX - rect.left;
  homeDragState.offsetY = e.clientY - rect.top;

  /* Clone for dragging */
  const clone = document.createElement('div');
  clone.className = icon.className + ' dragging';
  clone.innerHTML = icon.innerHTML;
  clone.dataset.appId   = icon.dataset.appId;
  clone.dataset.pageIdx = icon.dataset.pageIdx;
  clone.style.cssText = [
    'position:fixed;pointer-events:none;z-index:9999;',
    'left:' + rect.left + 'px;',
    'top:'  + rect.top  + 'px;',
    'width:'  + rect.width  + 'px;',
    'height:' + rect.height + 'px;',
    'opacity:0.95;',
    'transform:scale(1.12) rotate(2deg);',
    'transition:transform 0.12s cubic-bezier(0.34,1.56,0.64,1);',
    'will-change:left,top;',
  ].join('');
  document.body.appendChild(clone);
  homeDragState.dragEl = clone;

  /* Placeholder in original slot */
  const ph = document.createElement('div');
  ph.className = 'app-icon placeholder';
  ph.style.width  = rect.width  + 'px';
  ph.style.height = rect.height + 'px';
  icon.parentNode.insertBefore(ph, icon);
  icon.style.visibility = 'hidden';
  homeDragState.placeholder = ph;

  document.addEventListener('pointermove', handleHomeDragMove, { passive: false });
  document.addEventListener('pointerup',   handleHomeDragUp);
}

function handleHomeDragMove(e) {
  if (!homeDragState.dragging || !homeDragState.dragEl) return;
  e.preventDefault();

  /* Move clone with finger */
  homeDragState.dragEl.style.left = (e.clientX - homeDragState.offsetX) + 'px';
  homeDragState.dragEl.style.top  = (e.clientY - homeDragState.offsetY) + 'px';

  /* Find which icon we're hovering */
  homeDragState.dragEl.style.pointerEvents = 'none';
  const over = document.elementFromPoint(e.clientX, e.clientY);
  if (!over) return;
  const hoverIcon = over.closest('.app-icon:not(.placeholder):not(.dragging)');
  if (
    hoverIcon &&
    hoverIcon !== homeDragState.target &&
    hoverIcon.parentNode === homeDragState.placeholder.parentNode
  ) {
    const hr = hoverIcon.getBoundingClientRect();
    const after = e.clientX > hr.left + hr.width / 2;
    hoverIcon.parentNode.insertBefore(
      homeDragState.placeholder,
      after ? hoverIcon.nextSibling : hoverIcon
    );
  }
}

/* ── OPEN APP FUNCTIONS ──────────────────────────────────── */
const APP_INIT = {
  clock:        () => initClock98(),
  snake:        () => initSnake98(),
  flappy:       () => initFlappy98(),
  pong:         () => initPong98(),
  breakout:     () => initBreakout98(),
  simon:        () => initSimon98(),
  reaction:     () => initReaction98(),
  colorgame:    () => initColorGame98(),
  g2048:        () => init2048_98(),
  pacman:       () => initPacman98(),
  djpad:        () => initDJPad98(),
  visualizer:   () => initVisualizer98(),
  ascii:        () => initASCII98(),
  browser:      () => initBrowser98(),
  paint:        () => initPaint98(),
  screensaver:  () => initScreensaver98(),
  sparks:       () => initParticles98(),
  gyro:         () => initGyro98(),
  deviceinfo:   () => initDeviceInfo98(),
  benchmark:    () => initBenchmark98(),
  weather:      () => initWeather98(),
  maps:         () => initMaps98(),
  timer:        () => initTimer98(),
  notes:        () => initNotes98(),
  library:      () => initLibrary98(),
  sports:       () => initSports98(),
  casino:       () => initCasino98(),
  assistant:    () => initAssistant98(),
  terminal:     () => initTerminal98(),
  filesystem:   () => initFileSystem98(),
  appstore:     () => initAppStore98(),
  gallery:      () => initGallery98(),
  settings:     () => initSettings98(),
  achievements: () => initAchievements98(),
  games:        () => initGames98(),
  debug:        () => initDebug98(),
  messages:     () => initMessages98(),
  contacts:     () => initContacts98(),
};

/* ── OS SHELL ────────────────────────────────────────────── */
const openWindows = []; // {id, appId, el, cleanup}
let currentTheme = localStorage.getItem('ipocket_theme') || 'retro';
let notifPanelOpen = false;
let startMenuOpen = false;

// Apply saved theme silently on startup (no overlay animation)
(function silentApply() {
  const t = currentTheme;
  document.body.classList.remove('theme-hacker','theme-modern','theme-liquid');
  if (t === 'hacker') document.body.classList.add('theme-hacker');
  if (t === 'modern')  document.body.classList.add('theme-modern');
  if (t === 'liquid')  document.body.classList.add('theme-liquid');
})();

function applyTheme(theme) {
  const prevTheme = currentTheme;
  currentTheme = theme;
  localStorage.setItem('ipocket_theme', theme);

  // Full-screen theme switch animation
  const ov = document.createElement('div');
  ov.style.cssText = 'position:fixed;inset:0;z-index:99999;background:#000;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:48px;opacity:0;transition:opacity .6s ease;';

  if (theme === 'modern') {
    // Win11 style
    ov.innerHTML = `
      <svg width="72" height="72" viewBox="0 0 88 88" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="0"  y="0"  width="40" height="40" rx="3" fill="#F25022"/>
        <rect x="48" y="0"  width="40" height="40" rx="3" fill="#7FBA00"/>
        <rect x="0"  y="48" width="40" height="40" rx="3" fill="#00A4EF"/>
        <rect x="48" y="48" width="40" height="40" rx="3" fill="#FFB900"/>
      </svg>
      <div style="display:flex;flex-direction:column;align-items:center;gap:28px;">
        <div style="font-family:'Inter',system-ui,sans-serif;font-size:1.1rem;color:rgba(255,255,255,.85);letter-spacing:.02em;" id="theme-txt">Switching to Windows 11</div>
        <div style="display:flex;gap:10px;" id="theme-dots">
          <div style="width:10px;height:10px;border-radius:50%;background:rgba(255,255,255,.85);animation:theme-dot .9s ease-in-out infinite;animation-delay:0s"></div>
          <div style="width:10px;height:10px;border-radius:50%;background:rgba(255,255,255,.85);animation:theme-dot .9s ease-in-out infinite;animation-delay:.2s"></div>
          <div style="width:10px;height:10px;border-radius:50%;background:rgba(255,255,255,.85);animation:theme-dot .9s ease-in-out infinite;animation-delay:.4s"></div>
        </div>
      </div>`;
  } else if (theme === 'hacker') {
    // Hacker style
    ov.innerHTML = `
      <div style="font-family:monospace;font-size:4rem;color:#00ff41;">⚡</div>
      <div style="display:flex;flex-direction:column;align-items:center;gap:28px;">
        <div style="font-family:monospace;font-size:1.1rem;color:#00ff41;letter-spacing:.02em;" id="theme-txt">Hacking the theme...</div>
        <div style="display:flex;gap:10px;" id="theme-dots">
          <div style="width:10px;height:10px;border-radius:50%;background:#00ff41;animation:theme-dot .9s ease-in-out infinite;animation-delay:0s"></div>
          <div style="width:10px;height:10px;border-radius:50%;background:#00ff41;animation:theme-dot .9s ease-in-out infinite;animation-delay:.2s"></div>
          <div style="width:10px;height:10px;border-radius:50%;background:#00ff41;animation:theme-dot .9s ease-in-out infinite;animation-delay:.4s"></div>
        </div>
      </div>`;
  } else if (theme === 'liquid') {
    ov.innerHTML = `
      <div style="font-size:4rem;filter:drop-shadow(0 0 28px rgba(10,132,255,0.7));">💧</div>
      <div style="display:flex;flex-direction:column;align-items:center;gap:28px;">
        <div style="font-family:-apple-system,'Segoe UI Variable Display','Segoe UI',sans-serif;font-size:1.1rem;font-weight:500;color:rgba(255,255,255,.88);letter-spacing:.01em;" id="theme-txt">Applying Liquid Glass</div>
        <div style="display:flex;gap:10px;" id="theme-dots">
          <div style="width:10px;height:10px;border-radius:50%;background:rgba(10,132,255,.90);animation:theme-dot .9s ease-in-out infinite;animation-delay:0s"></div>
          <div style="width:10px;height:10px;border-radius:50%;background:rgba(94,92,230,.90);animation:theme-dot .9s ease-in-out infinite;animation-delay:.2s"></div>
          <div style="width:10px;height:10px;border-radius:50%;background:rgba(10,132,255,.90);animation:theme-dot .9s ease-in-out infinite;animation-delay:.4s"></div>
        </div>
      </div>`;
  } else {
    ov.innerHTML = `
      <div style="font-family:VT323,monospace;font-size:4rem;color:#fff;">💾</div>
      <div style="display:flex;flex-direction:column;align-items:center;gap:28px;">
        <div style="font-family:VT323,monospace;font-size:1.1rem;color:#fff;letter-spacing:.02em;" id="theme-txt">Loading Windows 98...</div>
        <div style="display:flex;gap:10px;" id="theme-dots">
          <div style="width:10px;height:10px;border-radius:50%;background:#fff;animation:theme-dot .9s ease-in-out infinite;animation-delay:0s"></div>
          <div style="width:10px;height:10px;border-radius:50%;background:#fff;animation:theme-dot .9s ease-in-out infinite;animation-delay:.2s"></div>
          <div style="width:10px;height:10px;border-radius:50%;background:#fff;animation:theme-dot .9s ease-in-out infinite;animation-delay:.4s"></div>
        </div>
      </div>`;
  }

  const kf = document.createElement('style');
  kf.textContent = '@keyframes theme-dot{0%,80%,100%{opacity:.2;transform:scale(.8)}40%{opacity:1;transform:scale(1)}}';
  document.head.appendChild(kf);
  document.body.appendChild(ov);
  requestAnimationFrame(() => { ov.style.opacity = '1'; });

  setTimeout(() => {
    // Apply new body class
    document.body.classList.remove('theme-hacker','theme-modern','theme-liquid');
    if (theme === 'hacker') document.body.classList.add('theme-hacker');
    if (theme === 'modern')  document.body.classList.add('theme-modern');
    if (theme === 'liquid')  document.body.classList.add('theme-liquid');

    // Manage liquid aurora canvas
    const desk = document.getElementById('desktop');
    const existingAurora = desk && desk.querySelector('#lg-desktop-aurora');
    if (theme === 'liquid') {
      if (desk && !existingAurora) {
        const { canvas } = createLiquidAuroraCanvas();
        canvas.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;z-index:0;pointer-events:none;';
        desk.appendChild(canvas);
      }
    } else {
      if (existingAurora) existingAurora.remove();
    }

    // Close all open windows cleanly — prevents stale themed UI after switch
    [...openWindows].forEach(win => {
      if (win.cleanup) { try { win.cleanup(); } catch(e) {} }
      win.el.remove();
    });
    openWindows.length = 0;
    updateTaskbar();
    updateSwitcher();
    if (typeof updateXPStrip === 'function') updateXPStrip();

    function fadeOutOverlay() {
      ov.style.transition = 'opacity 1s ease';
      ov.style.opacity = '0';
      setTimeout(() => { ov.remove(); kf.remove(); }, 1000);
    }

    // When switching TO retro: reload all base scripts that were overridden by theme scripts.
    // This restores the original retro init functions (e.g. initSettings98) so reopening
    // apps shows the correct retro UI instead of the stale modern version.
    if (theme === 'retro' && themedApps.size > 0) {
      const appsToReload = [...themedApps];
      themedApps.clear();
      let pending = appsToReload.length;
      appsToReload.forEach(appId => {
        const basePath = APP_BASE_SCRIPT[appId];
        if (!basePath) { pending--; if (pending === 0) fadeOutOverlay(); return; }
        loadAppScript(basePath + '?t=' + Date.now(), appId, 'retro', () => {
          pending--;
          if (pending === 0) fadeOutOverlay();
        });
      });
    } else {
      fadeOutOverlay();
    }
  }, 1500);
}

window.OS = {
  openApp(appId) {
    haptic('medium');
    const meta = APP_LOOKUP[appId];
    if (!meta) return;

    // If already open, focus it
    const existing = openWindows.find(w => w.appId === appId);
    if (existing) {
      bringToFront(existing);
      updateTaskbar();
      updateSwitcher();
      updateXPStrip();
      return;
    }

    // Stub apps open a placeholder window instead of rejecting them
    if (meta.stub) {
      const win = createWindow98(meta);
      openWindows.push(win);
      updateTaskbar();
      updateSwitcher();
      updateXPStrip();
      window.content = win.body;
      win.body.style.cssText = 'width:100%;height:100%;display:flex;flex-direction:column;overflow:hidden;';
      const menu = document.createElement('div');
      menu.className = 'win-menubar';
      menu.innerHTML = '<div class="win-menu-item">Info</div>';
      win.body.appendChild(menu);
      const placeholder = document.createElement('div');
      placeholder.className = 'placeholder98';
      placeholder.innerHTML = `
        <div class="placeholder98-ico">🛠️</div>
        <div class="placeholder98-title">${meta.name} is coming soon</div>
        <div class="placeholder98-msg">This app is not built yet, but it will appear in iPOCKET soon. Close this window and check back later.</div>
        <button class="btn98 primary" onclick="OS.closeApp('${win.id}')">Close</button>
      `;
      win.body.appendChild(placeholder);
      POS.trackAppOpen(appId);
      return;
    }

    POS.trackAppOpen(appId);

    // Create window
    const win = createWindow98(meta);
    openWindows.push(win);
    updateTaskbar();
    updateSwitcher();
    updateXPStrip();

    // Init app inside window body
    window.content = win.body;
    
    // Load theme-specific app script if it exists and theme is not retro
    if (currentTheme !== 'retro') {
      loadAppScript(`js/themes/${currentTheme}/apps/${appId}.js`, appId, currentTheme, () => {
        const initFn = APP_INIT[appId];
        win.cleanup = initFn ? initFn() : null;
      });
    } else {
      const initFn = APP_INIT[appId];
      win.cleanup = initFn ? initFn() : null;
    }

    // Notify
    POS.addXP(2,'app_open');
  },

  closeApp(winId) {
    const idx = openWindows.findIndex(w => w.id === winId);
    if (idx === -1) return;
    const win = openWindows[idx];
    haptic('light');

    // Run cleanup
    if (win.cleanup && typeof win.cleanup === 'function') {
      try { win.cleanup(); } catch(e){}
    }

    // Animate close
    win.el.style.transition = 'transform .2s ease, opacity .15s ease';
    win.el.style.transform = 'scale(0.04)';
    win.el.style.opacity = '0';
    setTimeout(() => {
      win.el.remove();
    }, 220);

    openWindows.splice(idx, 1);
    updateTaskbar();
    updateSwitcher();
    window.content = null;
  },

  closeAllApps() {
    [...openWindows].forEach(w => OS.closeApp(w.id));
    OS.closeSwitcher();
  },

  openPage(page) { goPage(page); },
  goPage,
  toggleNotif() {
    notifPanelOpen ? this.closeNotif() : this.openNotif();
  },
  openNotif() {
    const p = document.getElementById('notif-panel');
    p.style.display = 'flex';
    requestAnimationFrame(() => p.classList.add('open'));
    notifPanelOpen = true;
    this.closeStart();
  },
  closeNotif() {
    const p = document.getElementById('notif-panel');
    p.classList.remove('open');
    setTimeout(() => { p.style.display = 'none'; }, 320);
    notifPanelOpen = false;
  },
  clearNotifs() {
    NOTIFICATIONS.length = 0;
    document.getElementById('notif-list').innerHTML =
      '<div style="padding:16px;font-family:var(--pixel-font);font-size:16px;color:var(--win-text-dim);text-align:center;">No notifications</div>';
  },
  toggleStart() {
    startMenuOpen ? this.closeStart() : this.openStart();
  },
  openStart() {
    document.getElementById('start-menu').classList.add('open');
    startMenuOpen = true;
    this.closeNotif();
  },
  closeStart() {
    document.getElementById('start-menu').classList.remove('open');
    startMenuOpen = false;
  },
  openSwitcher() {
    document.getElementById('app-switcher').classList.add('open');
    updateSwitcher();
  },
  closeSwitcher() {
    document.getElementById('app-switcher').classList.remove('open');
  },
  applyTheme,
  getTheme: () => currentTheme,
  showAbout() {
    showDialog98('About iPOCKET',
      '🖥️ iPOCKET OS v8.0\n\nA Pocket OS with Retro Power.\n\nBuilt with ❤️ using HTML, CSS & JS.\n\nLevel: ' + POS.get().level,
      [{label:'OK',primary:true}]
    );
  },
  showShutdown() {
    const isModern = currentTheme === 'modern';
    showDialog98(isModern ? 'Shut down' : 'Shut Down',
      isModern ? 'Shut down and close iPOCKET?' : 'Are you sure you want to shut down iPOCKET?', [
      {label: isModern ? 'Shut down' : 'Shut Down', primary:true, action:() => {
        if (isModern) {
          // ── Windows 11 shutdown — orb background + typewriter text ──
          win11OrbShutdown();

        } else {
          // ── Windows 98 shutdown ──────────────────────────────────
          try {
            const ac = new (window.AudioContext||window.webkitAudioContext)();
            const play = (freq, t, dur, vol) => {
              const o = ac.createOscillator(), g = ac.createGain();
              o.connect(g); g.connect(ac.destination);
              o.frequency.value = freq; o.type = 'sine';
              g.gain.setValueAtTime(0, ac.currentTime+t);
              g.gain.linearRampToValueAtTime(vol, ac.currentTime+t+0.03);
              g.gain.exponentialRampToValueAtTime(0.0001, ac.currentTime+t+dur);
              o.start(ac.currentTime+t); o.stop(ac.currentTime+t+dur+0.05);
            };
            play(523, 0,    0.5, 0.10);
            play(494, 0.15, 0.5, 0.09);
            play(440, 0.30, 0.5, 0.08);
            play(392, 0.45, 0.6, 0.07);
            play(349, 0.65, 0.8, 0.06);
            play(262, 0.85, 1.2, 0.08);
          } catch(e) {}
          setTimeout(() => {
            document.body.style.transition = 'opacity 1.2s';
            document.body.style.opacity = '0';
            setTimeout(() => {
              document.body.innerHTML = '<div style="background:#000;width:100%;height:100%;position:fixed;inset:0;display:flex;align-items:center;justify-content:center;font-family:VT323,monospace;font-size:1.8rem;color:#fff;text-align:center;padding:20px;">It is now safe to<br>close this tab.</div>';
              document.body.style.opacity='1';
            }, 1200);
          }, 200);
        }
      }},
      {label:'Cancel'},
    ]);
  },
};

/* ── LIQUID GLASS AURORA CANVAS ── */
function createLiquidAuroraCanvas() {
  const canvas = document.createElement('canvas');
  canvas.id = 'lg-desktop-aurora';
  canvas.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;z-index:0;pointer-events:none;';
  let W, H, animId;

  const orbs = [
    { x:0.15, y:0.20, r:0.58, c:[88,86,214],   a:0.60, vx:0.00022, vy:0.00014, px:0, py:0 },
    { x:0.85, y:0.18, r:0.52, c:[10,132,255],  a:0.50, vx:-0.00017, vy:0.00019, px:1, py:0.5 },
    { x:0.70, y:0.82, r:0.48, c:[48,209,88],   a:0.25, vx:-0.00013, vy:-0.00016, px:2, py:1 },
    { x:0.20, y:0.78, r:0.44, c:[255,55,95],   a:0.22, vx:0.00019, vy:-0.00012, px:3, py:1.5 },
    { x:0.50, y:0.50, r:0.68, c:[100,60,180],  a:0.32, vx:0.00010, vy:0.00010, px:4, py:2 },
    { x:0.92, y:0.60, r:0.40, c:[255,159,10],  a:0.20, vx:-0.00021, vy:0.00015, px:5, py:2.5 },
    { x:0.08, y:0.55, r:0.42, c:[191,90,242],  a:0.24, vx:0.00018, vy:-0.00013, px:6, py:3 },
  ];

  function resize() {
    W = canvas.width  = canvas.offsetWidth  || window.innerWidth;
    H = canvas.height = canvas.offsetHeight || window.innerHeight;
  }

  function draw() {
    const t = Date.now();
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0,0,W,H);
    ctx.fillStyle = '#08091a';
    ctx.fillRect(0,0,W,H);

    orbs.forEach(o => {
      // Smooth drift via compound sin waves
      const wx = o.x + Math.sin(t * o.vx + o.px) * 0.28 + Math.sin(t * o.vx * 0.4 + o.px * 2) * 0.12;
      const wy = o.y + Math.cos(t * o.vy + o.py) * 0.22 + Math.cos(t * o.vy * 0.5 + o.py * 1.7) * 0.10;
      const pulse = 1 + 0.10 * Math.sin(t * 0.00045 + o.px);
      const rx = wx * W, ry = wy * H;
      const rr = Math.min(W,H) * o.r * pulse;

      const g = ctx.createRadialGradient(rx,ry,0,rx,ry,rr);
      g.addColorStop(0,   `rgba(${o.c[0]},${o.c[1]},${o.c[2]},${o.a})`);
      g.addColorStop(0.4, `rgba(${o.c[0]},${o.c[1]},${o.c[2]},${o.a*0.45})`);
      g.addColorStop(0.7, `rgba(${o.c[0]},${o.c[1]},${o.c[2]},${o.a*0.15})`);
      g.addColorStop(1,   `rgba(${o.c[0]},${o.c[1]},${o.c[2]},0)`);
      ctx.fillStyle = g;
      ctx.fillRect(0,0,W,H);
    });

    // Vignette
    const vig = ctx.createRadialGradient(W/2,H/2,H*0.25,W/2,H/2,H*0.82);
    vig.addColorStop(0,'transparent');
    vig.addColorStop(1,'rgba(4,5,18,0.48)');
    ctx.fillStyle = vig;
    ctx.fillRect(0,0,W,H);

    animId = requestAnimationFrame(draw);
  }
  resize();
  window.addEventListener('resize', resize);
  draw();
  return { canvas, stop: () => cancelAnimationFrame(animId) };
}

/* Inject liquid aurora into desktop when DOM is ready */
(function injectLiquidDesktopAurora() {
  if (currentTheme !== 'liquid') return;
  function inject() {
    const desk = document.getElementById('desktop');
    if (!desk) { setTimeout(inject, 80); return; }
    if (desk.querySelector('#lg-desktop-aurora')) return;
    const { canvas } = createLiquidAuroraCanvas();
    // position:absolute so it's out of flex flow entirely
    canvas.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;z-index:0;pointer-events:none;';
    desk.appendChild(canvas);
  }
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', inject);
  } else {
    inject();
  }
})();

/* ── WIN11 ORB BACKGROUND — 3 dark navy liquid blobs ── */
function createOrbCanvas() {
  const canvas = document.createElement('canvas');
  canvas.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;';
  let W, H, animId;

  // 3 blobs — each has a bezier-like path via sin/cos drift for liquid feel
  const orbs = [
    { x: 0.25, y: 0.35, r: 0.52, hue: 218, sat: 82, phase: 0.0,  spd: 0.00018, drift: 0.7 },
    { x: 0.75, y: 0.60, r: 0.48, hue: 225, sat: 75, phase: 2.1,  spd: 0.00014, drift: 0.9 },
    { x: 0.50, y: 0.80, r: 0.44, hue: 210, sat: 90, phase: 4.3,  spd: 0.00021, drift: 0.6 },
  ];

  // Each orb gets a slow wandering offset
  const wander = orbs.map((o, i) => ({
    ax: Math.random() * 6.28, ay: Math.random() * 6.28,
    sax: 0.00031 + i * 0.00009, say: 0.00027 + i * 0.00011,
    rax: 0.0, ray: 0.0,
  }));

  function resize() {
    W = canvas.width  = canvas.offsetWidth  || window.innerWidth;
    H = canvas.height = canvas.offsetHeight || window.innerHeight;
  }

  function draw() {
    resize();
    const ctx = canvas.getContext('2d');
    const t   = Date.now();

    ctx.fillStyle = '#04050e';
    ctx.fillRect(0, 0, W, H);

    orbs.forEach((o, i) => {
      const w = wander[i];
      w.ax += w.sax; w.ay += w.say;

      // Liquid morph: position drifts smoothly via compound sin waves
      const wx = o.x + Math.sin(w.ax) * 0.22 * o.drift + Math.sin(w.ax * 0.37) * 0.10;
      const wy = o.y + Math.cos(w.ay) * 0.18 * o.drift + Math.cos(w.ay * 0.41) * 0.08;

      // Radius pulses slowly — liquid breathing
      const tp  = t * 0.001;
      const pulse = 1 + 0.12 * Math.sin(tp * 0.4 + o.phase) + 0.06 * Math.sin(tp * 0.9 + o.phase * 1.3);
      const rx  = wx * W;
      const ry  = wy * H;
      const rr  = Math.min(W, H) * o.r * pulse;

      const g = ctx.createRadialGradient(rx, ry, 0, rx, ry, rr);
      // Dark navy core → near-black edge — very subtle, deep
      g.addColorStop(0,    `hsla(${o.hue},${o.sat}%,28%,0.55)`);
      g.addColorStop(0.35, `hsla(${o.hue},${o.sat}%,22%,0.35)`);
      g.addColorStop(0.65, `hsla(${o.hue},${o.sat}%,16%,0.16)`);
      g.addColorStop(1,    `hsla(${o.hue},${o.sat}%,10%,0)`);
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, W, H);
    });

    // Darken pass so it stays very deep
    ctx.fillStyle = 'rgba(4,5,14,0.22)';
    ctx.fillRect(0, 0, W, H);

    animId = requestAnimationFrame(draw);
  }
  draw();
  return { canvas, stop: () => cancelAnimationFrame(animId) };
}

/* typewriter helper: types text into el, returns promise */
function typewriterText(el, text, speed = 48) {
  return new Promise(resolve => {
    el.textContent = '';
    let i = 0;
    function next() {
      if (i >= text.length) { resolve(); return; }
      el.textContent += text[i++];
      setTimeout(next, speed + Math.random() * speed * 0.5);
    }
    next();
  });
}

/* ── WIN11 ORB SHUTDOWN ── */
function win11OrbShutdown() {
  const ov = document.createElement('div');
  ov.style.cssText = 'position:fixed;inset:0;z-index:99999;overflow:hidden;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:48px;opacity:0;transition:opacity .6s ease;';

  const { canvas, stop: stopOrbs } = createOrbCanvas();
  ov.appendChild(canvas);

  const ui = document.createElement('div');
  ui.style.cssText = 'position:relative;z-index:2;display:flex;flex-direction:column;align-items:center;gap:48px;';
  ui.innerHTML = `
    <svg width="72" height="72" viewBox="0 0 88 88" fill="none">
      <rect x="0"  y="0"  width="40" height="40" rx="3" fill="#F25022"/>
      <rect x="48" y="0"  width="40" height="40" rx="3" fill="#7FBA00"/>
      <rect x="0"  y="48" width="40" height="40" rx="3" fill="#00A4EF"/>
      <rect x="48" y="48" width="40" height="40" rx="3" fill="#FFB900"/>
    </svg>
    <div style="display:flex;flex-direction:column;align-items:center;gap:28px;">
      <div style="font-family:'Inter',system-ui,sans-serif;font-size:1.1rem;color:rgba(255,255,255,.9);letter-spacing:.04em;min-height:1.6em;" id="sd11-txt"></div>
      <div style="display:flex;gap:10px;" id="sd11-dots">
        <div style="width:10px;height:10px;border-radius:50%;background:rgba(255,255,255,.85);animation:sd11dot .9s ease-in-out infinite;animation-delay:0s"></div>
        <div style="width:10px;height:10px;border-radius:50%;background:rgba(255,255,255,.85);animation:sd11dot .9s ease-in-out infinite;animation-delay:.2s"></div>
        <div style="width:10px;height:10px;border-radius:50%;background:rgba(255,255,255,.85);animation:sd11dot .9s ease-in-out infinite;animation-delay:.4s"></div>
      </div>
    </div>`;
  ov.appendChild(ui);

  const kf = document.createElement('style');
  kf.textContent = '@keyframes sd11dot{0%,80%,100%{opacity:.2;transform:scale(.8)}40%{opacity:1;transform:scale(1)}}';
  document.head.appendChild(kf);
  document.body.appendChild(ov);
  requestAnimationFrame(() => { ov.style.opacity = '1'; });

  const txtEl = ov.querySelector('#sd11-txt');
  typewriterText(txtEl, 'Shutting down…').then(() => {
    setTimeout(() => {
      typewriterText(txtEl, 'See you later', 55).then(() => {
        setTimeout(() => {
          stopOrbs();
          ov.style.transition = 'opacity 1.2s ease';
          ov.style.opacity = '0';
          setTimeout(() => {
            document.body.innerHTML = '<div style="background:#05060f;width:100%;height:100%;position:fixed;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:32px;"><svg width="56" height="56" viewBox="0 0 88 88" fill="none"><rect x="0" y="0" width="40" height="40" rx="3" fill="#F25022"/><rect x="48" y="0" width="40" height="40" rx="3" fill="#7FBA00"/><rect x="0" y="48" width="40" height="40" rx="3" fill="#00A4EF"/><rect x="48" y="48" width="40" height="40" rx="3" fill="#FFB900"/></svg><div style="font-family:Inter,system-ui,sans-serif;font-size:1rem;color:rgba(255,255,255,.5);letter-spacing:.02em;">You can close this tab</div></div>';
          }, 1200);
        }, 1800);
      });
    }, 2200);
  });
}

/* ── BSOD — theme-aware, 1/200 boot chance ── */
function maybeBSOD(theme) {
  if (Math.random() > 1/200) return false;
  const isHacker = theme === 'hacker';
  const isModern = theme === 'modern';
  const bsod = document.createElement('div');

  if (isModern) {
    // Win11 style BSOD — blue with sad face
    bsod.style.cssText = 'position:fixed;inset:0;z-index:999999;background:#0078d4;display:flex;flex-direction:column;align-items:flex-start;justify-content:center;padding:10vw;font-family:"Segoe UI",system-ui,sans-serif;color:#fff;overflow:hidden;';
    bsod.innerHTML = `
      <div style="font-size:clamp(5rem,20vw,9rem);margin-bottom:2rem;line-height:1;">:(</div>
      <div style="font-size:clamp(1.1rem,3vw,1.6rem);font-weight:400;max-width:580px;line-height:1.5;margin-bottom:2.5rem;">
        Your iPOCKET ran into a problem and needs to restart. We're<br>just collecting some error info, and then we'll restart for you.
      </div>
      <div style="font-size:clamp(2rem,8vw,4.5rem);font-weight:700;letter-spacing:.01em;margin-bottom:1.5rem;" id="bsod-pct">0% complete</div>
      <div style="font-size:.95rem;opacity:.8;max-width:500px;line-height:1.6;margin-bottom:3rem;">
        For more information about this issue and possible fixes, visit<br>
        <span style="text-decoration:underline;">https://www.windows.com/stopcode</span>
      </div>
      <div style="font-size:.9rem;opacity:.7;">Stop code: <strong>IPOCKET_KERNEL_PANIC</strong></div>
      <div style="position:absolute;bottom:6vw;right:8vw;opacity:.18;">
        <svg width="120" height="120" viewBox="0 0 88 88" fill="none">
          <rect x="0" y="0" width="40" height="40" rx="3" fill="#fff"/>
          <rect x="48" y="0" width="40" height="40" rx="3" fill="#fff"/>
          <rect x="0" y="48" width="40" height="40" rx="3" fill="#fff"/>
          <rect x="48" y="48" width="40" height="40" rx="3" fill="#fff"/>
        </svg>
      </div>`;
    document.body.appendChild(bsod);
    // Animate pct up to 100 slowly then restart
    let p = 0;
    const pctEl = bsod.querySelector('#bsod-pct');
    const inc = setInterval(() => {
      p += Math.random() * 3 + 0.5;
      if (p >= 100) { p = 100; clearInterval(inc); setTimeout(() => location.reload(), 2000); }
      pctEl.textContent = Math.round(p) + '% complete';
    }, 220);

  } else if (isHacker) {
    // Hacker BSOD — green matrix kernel panic
    bsod.style.cssText = 'position:fixed;inset:0;z-index:999999;background:#000;display:flex;flex-direction:column;padding:4vw;font-family:"Share Tech Mono",monospace;color:#00ff41;overflow:hidden;';
    const lines = [
      'KERNEL PANIC — not syncing: iPOCKET fatal exception',
      'CPU: 0 PID: 1337 Comm: ipocket-kernel Not tainted 6.6.0-iPOCKET',
      'RIP: 0010:ipocket_boot_sequence+0x4a2/0x7f0',
      'RSP: 0018:ffffcff4c0003d98 EFLAGS: 00010246',
      'RAX: 0000000000000000 RBX: ffff9d3c40000000 RCX: 00000000ffffffff',
      '---[ end Kernel panic - not syncing: iPOCKET_FATAL ]---',
      '',
      'Rebooting in 10 seconds...',
    ];
    const pre = document.createElement('pre');
    pre.style.cssText = 'margin:0;white-space:pre-wrap;font-size:clamp(.7rem,2.2vw,1rem);line-height:1.6;';
    bsod.appendChild(pre);
    document.body.appendChild(bsod);
    let lineIdx = 0;
    function nextLine() {
      if (lineIdx < lines.length) { pre.textContent += lines[lineIdx++] + '\n'; setTimeout(nextLine, 300); }
      else { setTimeout(() => location.reload(), 4000); }
    }
    nextLine();

  } else {
    // Win98 BSOD — classic blue
    bsod.style.cssText = 'position:fixed;inset:0;z-index:999999;background:#0000aa;display:flex;flex-direction:column;align-items:center;justify-content:center;font-family:"VT323",monospace;color:#fff;text-align:center;padding:20px;';
    bsod.innerHTML = `
      <div style="background:#aaaaaa;color:#0000aa;font-size:clamp(.9rem,3vw,1.3rem);padding:4px 8px;margin-bottom:1.5rem;font-weight:bold;">Windows</div>
      <div style="font-size:clamp(1rem,3.5vw,1.5rem);max-width:560px;line-height:1.8;text-align:left;">
        A fatal exception 0E has occurred at 0028:C006FAD1 in VXD IPOCKET(03)<br>
        + 00001B44. The current application will be terminated.<br><br>
        *  Press any key to terminate the current application.<br>
        *  Press CTRL+ALT+DEL to restart your computer. You will<br>
        &nbsp;&nbsp;&nbsp;lose any unsaved information in all applications.<br><br>
        Press any key to continue <span id="bsod-blink">_</span>
      </div>`;
    document.body.appendChild(bsod);
    setInterval(() => {
      const b = bsod.querySelector('#bsod-blink');
      if (b) b.style.visibility = b.style.visibility === 'hidden' ? 'visible' : 'hidden';
    }, 530);
    document.addEventListener('keydown', () => location.reload(), { once: true });
    bsod.addEventListener('click', () => location.reload());
  }
  return true;
}

// Close start/notif on outside tap
document.addEventListener('click', (e) => {
  if (startMenuOpen && !e.target.closest('#start-menu') && !e.target.closest('#start-btn')) {
    OS.closeStart();
  }
  if (notifPanelOpen && !e.target.closest('#notif-panel') && !e.target.closest('#status-bar')) {
    OS.closeNotif();
  }
  if (document.getElementById('app-switcher').classList.contains('open') &&
      !e.target.closest('.switcher-window') && e.target.id === 'app-switcher') {
    OS.closeSwitcher();
  }
});

function loadAppScript(src, appId, theme, callback) {
  // Remove any existing theme script for this app
  document.querySelectorAll(`script[data-theme-script][data-app-id="${appId}"]`).forEach(el => el.remove());
  const s = document.createElement('script');
  s.src = src;
  s.dataset.themeScript = 'true';
  s.dataset.appId = appId;
  s.dataset.theme = theme;
  s.onload = () => {
    // Track which apps have non-retro overrides active
    if (theme !== 'retro') {
      themedApps.add(appId);
    } else {
      themedApps.delete(appId);
    }
    if (callback) callback();
  };
  s.onerror = () => {
    // If theme script fails, reload the correct base retro script
    if (theme !== 'retro') {
      const basePath = APP_BASE_SCRIPT[appId] || `js/apps/${appId}.js`;
      loadAppScript(basePath + '?t=' + Date.now(), appId, 'retro', callback);
    } else {
      if (callback) callback();
    }
  };
  document.head.appendChild(s);
}

function animateWindowToTaskbar(el, btn) {
  if (!btn || !el) return;
  const isModern = document.body.classList.contains('theme-modern') || document.body.classList.contains('theme-liquid');
  const dur      = isModern ? 540 : 320;
  const ease     = isModern ? 'cubic-bezier(.4,0,.2,1)' : 'ease';
  const rect     = el.getBoundingClientRect();
  const target   = btn.getBoundingClientRect();
  const clone    = el.cloneNode(true);
  clone.style.position = 'fixed';
  clone.style.left = `${rect.left}px`;
  clone.style.top = `${rect.top}px`;
  clone.style.width = `${rect.width}px`;
  clone.style.height = `${rect.height}px`;
  clone.style.margin = '0';
  clone.style.transformOrigin = 'top left';
  clone.style.transition = `transform ${dur}ms ${ease}, opacity ${Math.round(dur * 0.65)}ms ${ease}`;
  clone.style.zIndex = '99999';
  clone.style.pointerEvents = 'none';
  clone.style.opacity = '1';
  if (isModern) clone.style.borderRadius = '24px';
  document.body.appendChild(clone);
  requestAnimationFrame(() => {
    clone.style.transform = `translate(${target.left - rect.left}px, ${target.top - rect.top}px) scale(0.08)`;
    clone.style.opacity = '0';
  });
  setTimeout(() => clone.remove(), dur + 20);
}

/* ── WINDOW FACTORY ──────────────────────────────────────── */
let winIdCounter = 0;

function createWindow98(meta) {
  const id = 'win-' + (++winIdCounter);
  const el = document.createElement('div');
  el.className = 'win98-window';
  el.id = id;
  el.style.zIndex = 300 + openWindows.length;

  el.innerHTML = `
    <div class="win-titlebar">
      <span class="win-titlebar-ico">${meta.ico}</span>
      <span class="win-titlebar-text">${meta.name}</span>
      <div class="win-controls">
        <button class="win-btn">_</button>
        <button class="win-btn">□</button>
        <button class="win-btn win-close" data-close="${id}">✕</button>
      </div>
    </div>
    <div class="win-body" id="${id}-body"></div>
  `;

  const controls = el.querySelectorAll('.win-controls button');
  const minBtn = controls[0];
  const maxBtn = controls[1];
  const closeBtn = controls[2];

  minBtn.addEventListener('click', () => {
    const btn = document.querySelector(`#taskbar-apps button[data-win-id="${id}"]`);
    if (document.body.classList.contains('theme-modern')) {
      el.style.transition = 'transform .38s cubic-bezier(.4,0,.2,1), opacity .3s ease';
      el.style.transform = 'scale(0.88)';
      el.style.opacity = '0';
      animateWindowToTaskbar(el, btn);
      setTimeout(() => {
        el.style.display = 'none';
        el.style.transition = '';
        el.style.transform = '';
        el.style.opacity = '';
        updateTaskbar();
      }, 400);
    } else {
      animateWindowToTaskbar(el, btn);
      setTimeout(() => {
        el.style.display = 'none';
        updateTaskbar();
      }, 80);
    }
  });
  maxBtn.addEventListener('click', () => {
    el.style.display = 'flex';
    bringToFront({ id, appId: meta.id, el, body: el.querySelector(`#${id}-body`), cleanup: null });
    updateTaskbar();
  });
  closeBtn.addEventListener('click', () => OS.closeApp(id));

  document.getElementById('windows-layer').appendChild(el);
  requestAnimationFrame(() => el.classList.add('win-open'));

  return {
    id,
    appId: meta.id,
    el,
    body: el.querySelector(`#${id}-body`),
    cleanup: null,
  };
}

function bringToFront(win) {
  win.el.style.zIndex = 300 + openWindows.length + 1;
}

/* ── TASKBAR ─────────────────────────────────────────────── */
function updateTaskbar() {
  const bar = document.getElementById('taskbar-apps');
  bar.innerHTML = '';
  openWindows.forEach(win => {
    const meta = APP_LOOKUP[win.appId] || {name: win.appId, ico:'📦'};
    const btn = document.createElement('button');
    btn.dataset.winId = win.id;
    btn.dataset.appId = win.appId;
    const hidden = window.getComputedStyle(win.el).display === 'none';
    btn.className = hidden ? 'taskbar-app-btn' : 'taskbar-app-btn active';
    btn.innerHTML = `${meta.ico} ${meta.name}`;
    btn.onclick = () => {
      const hiddenNow = window.getComputedStyle(win.el).display === 'none';
      if (hiddenNow) {
        win.el.style.display = 'flex';
        bringToFront(win);
        btn.classList.add('active');
      } else {
        win.el.style.display = 'none';
        btn.classList.remove('active');
      }
    };
    bar.appendChild(btn);
  });
}

/* ── APP SWITCHER ────────────────────────────────────────── */
function updateSwitcher() {
  const list = document.getElementById('switcher-list');
  if (!list) return;
  list.innerHTML = '';
  if (!openWindows.length) {
    list.innerHTML = '<div style="font-family:var(--pixel-font);font-size:15px;color:var(--win-text-dim);padding:8px;">No open windows</div>';
    return;
  }
  openWindows.forEach(win => {
    const meta = APP_LOOKUP[win.appId] || {name:win.appId,ico:'📦'};
    const row = document.createElement('div');
    row.className = 'switcher-item';
    row.innerHTML = `
      <span class="switcher-item-name">${meta.ico} ${meta.name}</span>
      <button class="switcher-close-btn" title="Close">✕</button>
    `;
    row.querySelector('button').onclick = (e) => { e.stopPropagation(); OS.closeApp(win.id); };
    row.onclick = () => {
      win.el.style.display = 'flex';
      bringToFront(win);
      OS.closeSwitcher();
    };
    list.appendChild(row);
  });
}

/* ── XP STRIP ────────────────────────────────────────────── */
function updateXPStrip() {
  const s = POS.get();
  const prog = POS.getXPProgress();
  const lbl = document.getElementById('xp-level-label');
  const bar = document.getElementById('xp-bar-fill');
  const txt = document.getElementById('xp-text-label');
  if (lbl) lbl.textContent = 'LV.' + s.level;
  if (bar) bar.style.width = Math.round(prog.pct * 100) + '%';
  if (txt) txt.textContent = s.xp + ' / ' + prog.needed + ' XP';
}

/* ── NOTIFICATIONS ───────────────────────────────────────── */
const NOTIFICATIONS = [];

function pushNotification(title, msg, ico, time) {
  if (localStorage.getItem('ipocket_notifs') === '0') return;
  const now = time || new Date().toLocaleTimeString('en-US',{hour:'2-digit',minute:'2-digit'});
  NOTIFICATIONS.unshift({title, msg, ico: ico||'📢', time: now});
  renderNotifList();
  showToast98(title, msg, ico||'📢');
}

window.pushNotification = pushNotification;

function renderNotifList() {
  const list = document.getElementById('notif-list');
  if (!list) return;
  if (!NOTIFICATIONS.length) {
    list.innerHTML = '<div style="padding:16px;font-family:var(--pixel-font);font-size:16px;color:var(--win-text-dim);text-align:center;">No notifications</div>';
    return;
  }
  list.innerHTML = '';
  NOTIFICATIONS.slice(0,20).forEach(n => {
    const row = document.createElement('div');
    row.className = 'notif-item';
    row.innerHTML = `
      <div class="notif-ico">${n.ico}</div>
      <div class="notif-body">
        <div class="notif-item-title">${n.title}</div>
        <div class="notif-item-msg">${n.msg}</div>
      </div>
      <div class="notif-time">${n.time}</div>
    `;
    list.appendChild(row);
  });
}

/* ── TOAST 98 ────────────────────────────────────────────── */
let toastTimer = null;
window.showToast98 = function(title, msg, ico) {
  let t = document.querySelector('.toast98');
  if (!t) {
    t = document.createElement('div');
    t.className = 'toast98';
    t.onclick = () => { t.classList.remove('show'); clearTimeout(toastTimer); };
    document.body.appendChild(t);
  }
  t.innerHTML = `
    <div class="toast98-title">${ico||'📢'} ${title}</div>
    <div class="toast98-body">${msg}</div>
  `;
  t.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => {
    t.classList.remove('show');
    setTimeout(() => { if (t.parentNode) t.parentNode.removeChild(t); }, 250);
  }, 5000);
};

// Compat bridge: old apps call showToast(), map to showToast98
window.showToast = function(msg, color, dur) {
  showToast98('iPOCKET', msg, '💬');
};

/* ── DIALOG 98 ───────────────────────────────────────────── */
window.showDialog98 = function(title, msg, buttons) {
  const bd = document.createElement('div');
  bd.className = 'dialog98-backdrop';
  const btns = (buttons||[{label:'OK',primary:true}]);
  bd.innerHTML = `
    <div class="dialog98">
      <div class="dialog98-title">⚠️ ${title}</div>
      <div class="dialog98-body" style="white-space:pre-wrap">${msg}</div>
      <div class="dialog98-footer">
        ${btns.map((b,i)=>`<button class="btn98${b.primary?' primary':''}" data-idx="${i}">${b.label}</button>`).join('')}
      </div>
    </div>
  `;
  btns.forEach((b,i) => {
    bd.querySelector(`[data-idx="${i}"]`).onclick = () => {
      bd.remove();
      if (b.action) b.action();
    };
  });
  document.body.appendChild(bd);
};

/* ── PAGE SWIPE ──────────────────────────────────────────── */
let currentPage = 0;
let swipeStart = null;

function goPage(n) {
  const pages = document.querySelectorAll('.home-page');
  pages.forEach((p, i) => {
    p.classList.remove('page-left','page-active','page-right');
    if (i < n) p.classList.add('page-left');
    else if (i === n) p.classList.add('page-active');
    else p.classList.add('page-right');
  });
  document.querySelectorAll('.page-dot').forEach((d, i) => {
    d.classList.toggle('active', i === n);
  });
  currentPage = n;
}

(function setupSwipe() {
  const hp = document.getElementById('home-pages');
  if (!hp) return;
  let sx=0, sy=0, dx=0;
  hp.addEventListener('touchstart', e=>{sx=e.touches[0].clientX;sy=e.touches[0].clientY;dx=0;},{passive:true});
  hp.addEventListener('touchmove', e=>{dx=e.touches[0].clientX-sx;},{passive:true});
  hp.addEventListener('touchend', ()=>{
    if (Math.abs(dx)>50) {
      if (dx<0 && currentPage<APP_PAGES.length-1) goPage(currentPage+1);
      else if (dx>0 && currentPage>0) goPage(currentPage-1);
    }
  });
})();

/* ── CLOCK ───────────────────────────────────────────────── */
function updateClock() {
  const now = new Date();
  const h = now.getHours(), m = now.getMinutes().toString().padStart(2,'0');
  const ampm = h>=12?'PM':'AM', h12 = ((h%12)||12);
  const timeStr = h12+':'+m+' '+ampm;
  const el = document.getElementById('status-time');
  const tb = document.getElementById('tb-clock');
  if (el) el.textContent = timeStr;
  if (tb) tb.textContent = h12+':'+m;
}
updateClock();
setInterval(updateClock, 5000);

/* ── BATTERY ─────────────────────────────────────────────── */
(async function() {
  try {
    const b = await navigator.getBattery();
    const update = () => {
      const pct = Math.round(b.level*100);
      const fill = document.getElementById('bat-fill');
      const txt = document.getElementById('bat-pct');
      if (fill) fill.style.width = pct+'%';
      if (txt) txt.textContent = pct+'%';
      if (pct<=20 && !b.charging) {
        pushNotification('Battery Low','Battery at '+pct+'%','🔋');
      }
    };
    update();
    b.addEventListener('levelchange',update);
    b.addEventListener('chargingchange',update);
  } catch(e) {}
})();

/* ── BUILD HOME GRID ─────────────────────────────────────── */
function buildGrid() {
  const installed = POS.getInstalledApps();
  APP_PAGES.forEach((apps, pageIdx) => {
    const pageEl = document.getElementById('page-'+pageIdx);
    if (!pageEl) return;
    pageEl.innerHTML = '';
    const grid = document.createElement('div');
    grid.className = 'icon-grid';
    const pageApps = apps.filter(app => !(installed && !installed.includes(app.id) && STORE_APP_IDS.includes(app.id)));
    const orderedApps = getOrderedApps(pageApps, pageIdx);
    orderedApps.forEach(app => {
      const icon = document.createElement('div');
      icon.className = 'app-icon';
      icon.dataset.appId = app.id;
      icon.dataset.pageIdx = pageIdx;
      icon.innerHTML = `<div class="icon-img">${app.ico}</div><div class="icon-label">${app.name}</div>`;
      icon.addEventListener('click', () => {
        if (homeDragState.dragging) return;
        if (homeEditMode && isModernTheme()) return;
        haptic('light');
        OS.openApp(app.id);
      });

      icon.addEventListener('pointerdown', (e) => {
        if (e.pointerType === 'mouse' && e.button !== 0) return;

        /* ── Badge (×) tap detection — top-left 30×30 of icon ── */
        if (homeEditMode && isModernTheme()) {
          const ir = icon.getBoundingClientRect();
          const bx = e.clientX - ir.left;
          const by = e.clientY - ir.top;
          if (bx <= 30 && by <= 30) {
            e.stopPropagation();
            e.preventDefault();
            uninstallApp(app.id, icon);
            return;
          }
          /* Already in edit mode — start drag immediately (no long press needed) */
          e.preventDefault();
          homeDragState.startX = e.clientX;
          homeDragState.startY = e.clientY;
          homeDragState.timer = setTimeout(() => beginHomeDrag(e, icon, pageIdx), 80);
          return;
        }

        /* Not in edit mode */
        homeDragState.startX = e.clientX;
        homeDragState.startY = e.clientY;
        if (isModernTheme()) {
          /* Long press (500ms) enters edit mode then begins drag */
          homeDragState.timer = setTimeout(() => {
            enterHomeEditMode();
            /* Wait for enter animation before starting drag */
            setTimeout(() => beginHomeDrag(e, icon, pageIdx), 430);
          }, 500);
        } else {
          homeDragState.timer = setTimeout(() => beginHomeDrag(e, icon, pageIdx), 150);
        }
      });

      icon.addEventListener('pointermove', (e) => {
        if (!homeDragState.timer && !homeDragState.dragging) return;
        const dx = e.clientX - homeDragState.startX;
        const dy = e.clientY - homeDragState.startY;
        if (Math.hypot(dx, dy) > 8) clearHomeDragTimer();
      });

      icon.addEventListener('pointerup', () => { clearHomeDragTimer(); });
      icon.addEventListener('pointercancel', () => { clearHomeDragTimer(); endHomeDrag(); });
      grid.appendChild(icon);
    });
    pageEl.appendChild(grid);
  });
}

buildGrid();
updateXPStrip();
renderNotifList();

/* ── iOS edit mode Done button ── */
(function() {
  const doneBtn = document.createElement('button');
  doneBtn.id = 'ios-edit-done-btn';
  doneBtn.textContent = 'Done';
  doneBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    exitHomeEditMode();
  });
  document.body.appendChild(doneBtn);

  /* Tap on desktop background (not on an icon) exits edit mode */
  document.addEventListener('pointerdown', (e) => {
    if (!homeEditMode) return;
    if (homeDragState.dragging) return;
    const icon = e.target.closest('.app-icon');
    const doneB = e.target.closest('#ios-edit-done-btn');
    if (!icon && !doneB) exitHomeEditMode();
  });
})();

/* ── GLOBAL _openAppById COMPAT ──────────────────────────── */
window._openAppById = (id) => OS.openApp(id);

/* ── WIN98 WRAPPER HELPERS ───────────────────────────────── */
// Old apps expect: content to be the full container
// New wrapper gives them a win-body div
// Also expose content as the win-body
// We set window.content in OS.openApp before calling initFn()

/* ── SCHEDULED NOTIFICATIONS ─────────────────────────────── */
setTimeout(() => {
  const s = POS.get();
  if ((s.bootCount||0) <= 1) {
    pushNotification('Welcome!','iPOCKET OS v8.0 is ready.','🖥️');
  } else {
    pushNotification('Welcome back!','Level '+s.level+' — keep playing!','🎮');
  }
}, 3000);

setTimeout(() => {
  const hs = POS.get().highScores || {};
  const games = Object.keys(hs);
  if (games.length > 0) {
    const g = games[0];
    pushNotification('High Score!','Your best in '+g+': '+hs[g],'🏆');
  }
}, 20000);

/* ── COMPAT SHIM: old apps call closeApp() globally ─────── */
window.closeApp = function() {
  // Close the most recently opened window
  if (openWindows.length) {
    OS.closeApp(openWindows[openWindows.length-1].id);
  }
};

/* ── STATE.js showToast bridge already handled above ─────── */

/* ── More compat shims ─────────────────────────────────── */
window._rebuildGrid = function() { buildGrid(); };

/* ── SA shim: old apps use SA.t/b/l/r for safe area insets ──
   In v8 apps run inside win-body windows so all insets are 0  */
window.SA = { t: 0, b: 0, l: 0, r: 0 };
