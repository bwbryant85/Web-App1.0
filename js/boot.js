/**
 * boot.js — iPOCKET home screen + navigation
 * Includes folder/group system when apps overflow the grid.
 */
'use strict';

/* ── APP DEFINITIONS ──────────────────────────────────────────────
   group: which folder this app belongs to (null = top-level)
   ─────────────────────────────────────────────────────────────── */
const APPS = [
  // Top-level (always on home screen)
  { id:'clock',       name:'Clock',       ico:'🕐', col:'#00ffcc', group: null },
  { id:'weather',     name:'Weather',     ico:'🌤️', col:'#4dd0e1', group: null },
  { id:'timer',       name:'Timer',       ico:'⏱️', col:'#69ff47', group: null },
  { id:'notes',       name:'Notes',       ico:'📝', col:'#ffd740', group: null },
  { id:'sports',      name:'Sports',      ico:'🏆', col:'#ff9800', group: null },
  { id:'casino',      name:'Casino',      ico:'🎰', col:'#ffd700', group: null },

  // 🎮 Games
  { id:'snake',       name:'Snake',       ico:'🐍', col:'#69ff47',  group:'games' },
  { id:'flappy',      name:'Flappy',      ico:'🐦', col:'#81d4fa',  group:'games' },
  { id:'pong',        name:'Pong',        ico:'🏓', col:'#f48fb1',  group:'games' },
  { id:'breakout',    name:'Breakout',    ico:'🧱', col:'#ffcc80',  group:'games' },
  { id:'simon',       name:'Simon',       ico:'🟢', col:'#ffeb3b',  group:'games' },
  { id:'reaction',    name:'Reaction',    ico:'⚡', col:'#fff9c4',  group:'games' },
  { id:'colorgame',   name:'Colors',      ico:'🎨', col:'#e1bee7',  group:'games' },
  { id:'g2048',       name:'2048',        ico:'🟦', col:'#edc22e',  group:'games' },

  // 📱 Device
  { id:'deviceinfo',  name:'Device',      ico:'📊', col:'#ff6d6d',  group:'device' },
  { id:'benchmark',   name:'Benchmark',   ico:'🔬', col:'#ff6d6d',  group:'device' },
  { id:'gyro',        name:'Compass',     ico:'🧭', col:'#4dd0e1',  group:'device' },

  // 🎨 Creative
  { id:'ascii',       name:'ASCII Cam',   ico:'📷', col:'#fff176',  group:'creative' },
  { id:'djpad',       name:'DJ Pad',      ico:'🎹', col:'#ff9800',  group:'creative' },
  { id:'visualizer',  name:'Visualizer',  ico:'🎵', col:'#ce93d8',  group:'creative' },
  { id:'particles',   name:'Sparks',      ico:'✨', col:'#ff4af8',  group:'creative' },
  { id:'screensaver', name:'Screensaver', ico:'🌊', col:'#ce93d8',  group:'creative' },
];

/* ── FOLDER DEFINITIONS ───────────────────────────────────────── */
const FOLDERS = [
  { id:'games',    name:'Games',    ico:'🎮', col:'#69ff47' },
  { id:'device',   name:'Device',   ico:'📱', col:'#ff6d6d' },
  { id:'creative', name:'Creative', ico:'🎨', col:'#e1bee7' },
];

/* ── APP INIT MAP ─────────────────────────────────────────────── */
const APP_MAP = {
  clock:       () => initClock(),
  particles:   () => initParticles(),
  weather:     () => initWeather(),
  ascii:       () => initASCII(),
  screensaver: () => initScreensaver(),
  snake:       () => initSnake(),
  simon:       () => initSimon(),
  djpad:       () => initDJPad(),
  flappy:      () => initFlappy(),
  pong:        () => initPong(),
  reaction:    () => initReaction(),
  breakout:    () => initBreakout(),
  colorgame:   () => initColorGame(),
  benchmark:   () => initBenchmark(),
  g2048:       () => init2048(),
  timer:       () => initTimer(),
  notes:       () => initNotes(),
  gyro:        () => initGyro(),
  visualizer:  () => initVisualizer(),
  deviceinfo:  () => initDeviceInfo(),
  sports:      () => initSports(),
  casino:      () => initCasino(),
};

/* ── HOME DATE ────────────────────────────────────────────────── */
const homeDate = document.getElementById('home-date');
const fmtDate = () => {
  homeDate.textContent = new Date().toLocaleDateString('en-US', {
    weekday:'short', month:'short', day:'numeric', year:'numeric'
  }).toUpperCase();
};
fmtDate();
setInterval(fmtDate, 30000);

/* ── LAYER / APP LIFECYCLE ────────────────────────────────────── */
const layer = document.getElementById('layer');
let cleanup = null;

function openApp(app, iconEl) {
  content.innerHTML = '';
  const r = iconEl.getBoundingClientRect();
  layer.style.transformOrigin = `${r.left + r.width / 2}px ${r.top + r.height / 2}px`;
  layer.style.transform = '';
  layer.style.opacity = '';
  layer.style.transition = '';
  layer.classList.add('open');
  const fn = APP_MAP[app.id];
  cleanup = fn ? fn() : null;
}

function closeApp() {
  if (cleanup) { cleanup(); cleanup = null; }
  layer.style.transition = 'transform .32s ease,opacity .24s ease';
  layer.style.transform = 'translateX(105%)';
  layer.style.opacity = '0';
  setTimeout(() => {
    layer.classList.remove('open');
    layer.style.transform = '';
    layer.style.opacity = '';
    layer.style.transition = '';
    content.innerHTML = '';
  }, 340);
}

/* ── SWIPE FROM LEFT EDGE TO CLOSE ───────────────────────────── */
(function() {
  let swX = null, swY = null, swDX = 0;
  layer.addEventListener('touchstart', e => {
    const t = e.touches[0];
    if (t.clientX < 24 && layer.classList.contains('open')) { swX = t.clientX; swY = t.clientY; swDX = 0; }
  }, { passive: true });
  layer.addEventListener('touchmove', e => {
    if (swX === null) return;
    const t = e.touches[0];
    const dx = t.clientX - swX, dy = Math.abs(t.clientY - swY);
    if (dy > 55 && dx < 30) { swX = null; return; }
    swDX = Math.max(0, dx);
    if (swDX > 5) {
      layer.style.transition = 'none';
      layer.style.transform = `translateX(${swDX * .75}px)`;
      layer.style.opacity = `${Math.max(.2, 1 - swDX / 300)}`;
    }
  }, { passive: true });
  layer.addEventListener('touchend', () => {
    if (swX === null) return;
    if (swDX > 100) { closeApp(); }
    else {
      layer.style.transition = 'transform .35s cubic-bezier(.34,1.56,.64,1),opacity .25s';
      layer.style.transform = ''; layer.style.opacity = '';
      setTimeout(() => { layer.style.transition = ''; }, 380);
    }
    swX = null; swY = null; swDX = 0;
  }, { passive: true });
})();

document.addEventListener('keydown', e => { if (e.key === 'Escape') { closeApp(); closeFolder(); } });

/* ── FOLDER OVERLAY ───────────────────────────────────────────── */
let folderOverlay = null;

function openFolder(folder) {
  if (folderOverlay) folderOverlay.remove();
  haptic('medium');

  const appsInFolder = APPS.filter(a => a.group === folder.id);

  folderOverlay = document.createElement('div');
  folderOverlay.style.cssText = 'position:fixed;inset:0;z-index:150;display:flex;flex-direction:column;align-items:center;justify-content:center;';

  // Blurred backdrop
  const backdrop = document.createElement('div');
  backdrop.style.cssText = 'position:absolute;inset:0;background:rgba(5,5,8,.88);backdrop-filter:blur(24px);-webkit-backdrop-filter:blur(24px);opacity:0;transition:opacity .22s ease;';
  folderOverlay.appendChild(backdrop);

  // Panel
  const panel = document.createElement('div');
  panel.style.cssText = 'position:relative;z-index:1;display:flex;flex-direction:column;align-items:center;gap:18px;padding:28px 20px 32px;transform:scale(.82);opacity:0;transition:transform .32s cubic-bezier(.34,1.56,.64,1),opacity .26s ease;width:100%;max-width:380px;';

  // Title
  const ftitle = document.createElement('div');
  ftitle.style.cssText = 'font-family:"Orbitron",sans-serif;font-size:.7rem;letter-spacing:.24em;text-transform:uppercase;color:var(--text);';
  ftitle.textContent = folder.ico + ' ' + folder.name;
  panel.appendChild(ftitle);

  // Inner grid
  const innerGrid = document.createElement('div');
  innerGrid.style.cssText = 'display:grid;grid-template-columns:repeat(3,1fr);gap:14px;width:100%;';

  appsInFolder.forEach((app, i) => {
    const cell = document.createElement('div');
    cell.style.cssText = [
      'aspect-ratio:1;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:7px;',
      'border-radius:22%;cursor:pointer;user-select:none;-webkit-tap-highlight-color:transparent;',
      `border:1px solid ${app.col}55;`,
      'background:rgba(0,0,0,.35);position:relative;overflow:hidden;',
      'transition:transform .15s ease;',
      `box-shadow:0 0 16px ${app.col}18,0 4px 20px rgba(0,0,0,.5);`,
      `animation:ci .5s ${i * .055}s both;`,
    ].join('');

    const gloss = document.createElement('div');
    gloss.style.cssText = 'position:absolute;inset:0;border-radius:inherit;background:radial-gradient(ellipse at 30% 25%,rgba(255,255,255,.09),transparent 65%);pointer-events:none;';
    cell.appendChild(gloss);

    cell.innerHTML += `<span style="font-size:clamp(1.9rem,9.5vw,2.5rem);line-height:1;position:relative;">${app.ico}</span><span style="font-size:.48rem;letter-spacing:.1em;text-transform:uppercase;color:var(--text);opacity:.85;position:relative;">${app.name}</span>`;

    cell.addEventListener('click', () => {
      closeFolder();
      setTimeout(() => openApp(app, cell), 150);
    });
    cell.addEventListener('touchstart', () => { cell.style.transform = 'scale(.87)'; }, { passive: true });
    cell.addEventListener('touchend',   () => { cell.style.transform = ''; }, { passive: true });
    innerGrid.appendChild(cell);
  });
  panel.appendChild(innerGrid);

  // Close button
  const closeBtn = document.createElement('button');
  closeBtn.style.cssText = 'font-family:"Orbitron",sans-serif;font-size:.54rem;letter-spacing:.15em;text-transform:uppercase;color:var(--dim);border:1px solid var(--dim);background:transparent;padding:9px 26px;border-radius:20px;cursor:pointer;-webkit-tap-highlight-color:transparent;';
  closeBtn.textContent = '✕ Close';
  closeBtn.onclick = closeFolder;
  panel.appendChild(closeBtn);

  folderOverlay.appendChild(panel);
  document.body.appendChild(folderOverlay);

  requestAnimationFrame(() => {
    backdrop.style.opacity = '1';
    panel.style.transform = 'scale(1)';
    panel.style.opacity = '1';
  });

  backdrop.addEventListener('click', closeFolder);
}

function closeFolder() {
  if (!folderOverlay) return;
  const children = folderOverlay.children;
  if (children[0]) children[0].style.opacity = '0';               // backdrop
  if (children[1]) { children[1].style.transform = 'scale(.82)'; children[1].style.opacity = '0'; } // panel
  setTimeout(() => { if (folderOverlay) { folderOverlay.remove(); folderOverlay = null; } }, 300);
}

/* ── BUILD HOME GRID ──────────────────────────────────────────── */
const gridEl = document.getElementById('grid');

// Top-level apps
const topApps = APPS.filter(a => a.group === null);
topApps.forEach((app, i) => {
  const cell = document.createElement('div');
  cell.className = 'cell';
  cell.style.cssText = `border-color:${app.col}55;box-shadow:0 0 18px ${app.col}18,0 5px 24px rgba(0,0,0,.5);animation-delay:${.45 + i * .07}s`;
  cell.innerHTML = `<span class="ico">${app.ico}</span><span class="lbl">${app.name}</span>`;
  const gloss = document.createElement('div');
  gloss.style.cssText = 'position:absolute;inset:0;border-radius:inherit;background:radial-gradient(ellipse at 30% 25%,rgba(255,255,255,.09),transparent 65%);pointer-events:none;';
  cell.appendChild(gloss);
  cell.addEventListener('click', () => { haptic('medium'); openApp(app, cell); });
  gridEl.appendChild(cell);
});

// Folder cells
FOLDERS.forEach((folder, i) => {
  const appsIn = APPS.filter(a => a.group === folder.id);
  if (!appsIn.length) return;

  // Mini 2x2 preview
  const previews = appsIn.slice(0, 4);
  const previewHTML = `
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:3px;width:54%;aspect-ratio:1;background:rgba(255,255,255,.06);border-radius:16%;padding:5px;flex-shrink:0;">
      ${previews.map(a => `<span style="font-size:clamp(.8rem,4vw,1.2rem);line-height:1;display:flex;align-items:center;justify-content:center;">${a.ico}</span>`).join('')}
    </div>`;

  const cell = document.createElement('div');
  cell.className = 'cell';
  cell.style.cssText = `border-color:${folder.col}55;box-shadow:0 0 18px ${folder.col}18,0 5px 24px rgba(0,0,0,.5);animation-delay:${.45 + (topApps.length + i) * .07}s`;
  cell.innerHTML = `${previewHTML}<span class="lbl">${folder.name}</span>`;
  const gloss = document.createElement('div');
  gloss.style.cssText = 'position:absolute;inset:0;border-radius:inherit;background:radial-gradient(ellipse at 30% 25%,rgba(255,255,255,.09),transparent 65%);pointer-events:none;';
  cell.appendChild(gloss);
  cell.addEventListener('click', () => openFolder(folder));
  gridEl.appendChild(cell);
});
