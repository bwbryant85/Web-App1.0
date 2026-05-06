/**
 * core.js — iPOCKET v8 Windows 98 OS Shell
 * Global: OS, haptic, content (compat), showToast98
 */
'use strict';

/* ── HAPTICS ─────────────────────────────────────────────── */
let _hac = null;
window.haptic = function(type) {
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
    {id:'paint',      name:'Paint',       ico:'🎨',  stub:'Coming Soon'},
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
    {id:'maps',       name:'Maps',        ico:'🗺️',  stub:'Coming Soon'},
    {id:'library',    name:'Library',     ico:'📚',  stub:'Coming Soon'},
    {id:'crypto',     name:'Crypto',      ico:'₿',   stub:'Coming Soon'},
    {id:'sparks',      name:'Sparks',      ico:'✨',  stub:false},
    {id:'debug',      name:'Debug',       ico:'🐛',  stub:false},
    {id:'snake',      name:'Snake',       ico:'🐍',  stub:false},
    {id:'casino',     name:'Casino',      ico:'🎰',  stub:false},
    {id:'screensaver', name:'Screensaver', ico:'🌊',  stub:false},
    {id:'contacts',   name:'Contacts',    ico:'👤',  stub:'Coming Soon'},
    {id:'messages',   name:'Messages',    ico:'💬',  stub:'Coming Soon'},
    {id:'browser',    name:'Browser',     ico:'🌐',  stub:'Coming Soon'},
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
  screensaver:  () => initScreensaver98(),
  sparks:       () => initParticles98(),
  gyro:         () => initGyro98(),
  deviceinfo:   () => initDeviceInfo98(),
  benchmark:    () => initBenchmark98(),
  weather:      () => initWeather98(),
  timer:        () => initTimer98(),
  notes:        () => initNotes98(),
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
};

/* ── OS SHELL ────────────────────────────────────────────── */
const openWindows = []; // {id, appId, el, cleanup}
let currentTheme = localStorage.getItem('ipocket_theme') || 'retro';
let notifPanelOpen = false;
let startMenuOpen = false;

// Apply saved theme immediately
applyTheme(currentTheme);

function applyTheme(theme) {
  currentTheme = theme;
  document.body.classList.remove('theme-hacker','theme-modern');
  if (theme === 'hacker') document.body.classList.add('theme-hacker');
  if (theme === 'modern') document.body.classList.add('theme-modern');
  localStorage.setItem('ipocket_theme', theme);
}

window.OS = {
  openApp(appId) {
    haptic('medium');
    const meta = APP_LOOKUP[appId];
    if (!meta) return;

    // Stub apps
    if (meta.stub) {
      showToast98('Coming Soon', meta.name + ' is not available yet.', '⚠️');
      return;
    }

    // If already open, focus it
    const existing = openWindows.find(w => w.appId === appId);
    if (existing) {
      bringToFront(existing);
      updateTaskbar();
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
    const initFn = APP_INIT[appId];
    win.cleanup = initFn ? initFn() : null;

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
    showDialog98('Shut Down', 'Are you sure you want to shut down iPOCKET?', [
      {label:'Shut Down', primary:true, action:() => {
        document.body.style.transition = 'opacity 1s';
        document.body.style.opacity = '0';
        setTimeout(() => { document.body.innerHTML = '<div style="background:#000;width:100%;height:100%;display:flex;align-items:center;justify-content:center;font-family:VT323,monospace;font-size:2rem;color:#fff;">It is now safe to close this tab.</div>'; document.body.style.opacity='1'; }, 1000);
      }},
      {label:'Cancel'},
    ]);
  },
};

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

  el.querySelector('[data-close]').addEventListener('click', () => OS.closeApp(id));

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
    btn.className = 'taskbar-app-btn active';
    btn.innerHTML = `${meta.ico} ${meta.name}`;
    btn.onclick = () => {
      if (win.el.classList.contains('win-open')) {
        // Minimize (hide)
        win.el.style.display = 'none';
        btn.classList.remove('active');
      } else {
        win.el.style.display = 'flex';
        bringToFront(win);
        btn.classList.add('active');
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
    document.body.appendChild(t);
  }
  t.innerHTML = `
    <div class="toast98-title">${ico||'📢'} ${title}</div>
    <div class="toast98-body">${msg}</div>
  `;
  t.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => t.classList.remove('show'), 3500);
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
  APP_PAGES.forEach((apps, pageIdx) => {
    const pageEl = document.getElementById('page-'+pageIdx);
    if (!pageEl) return;
    pageEl.innerHTML = '';
    const grid = document.createElement('div');
    grid.className = 'icon-grid';
    apps.forEach(app => {
      const icon = document.createElement('div');
      icon.className = 'app-icon';
      icon.innerHTML = `<div class="icon-img">${app.ico}</div><div class="icon-label">${app.name}</div>`;
      icon.addEventListener('click', () => {
        haptic('light');
        OS.openApp(app.id);
      });
      grid.appendChild(icon);
    });
    pageEl.appendChild(grid);
  });
}

buildGrid();
updateXPStrip();
renderNotifList();

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
window._rebuildGrid = function() {};
