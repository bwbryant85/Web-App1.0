/**
 * boot.js — iPOCKET home screen + navigation
 * Runs after all app scripts are loaded.
 * Reads window.IPOCKET_APPS which each app file pushes into.
 */
'use strict';

const APPS = [
  { id:'clock',       name:'Clock',       ico:'🕐', col:'#00ffcc' },
  { id:'particles',   name:'Sparks',      ico:'✨', col:'#ff4af8' },
  { id:'weather',     name:'Weather',     ico:'🌤️', col:'#4dd0e1' },
  { id:'ascii',       name:'ASCII Cam',   ico:'📷', col:'#fff176' },
  { id:'screensaver', name:'Screensaver', ico:'🌊', col:'#ce93d8' },
  { id:'snake',       name:'Snake',       ico:'🐍', col:'#69ff47' },
  { id:'simon',       name:'Simon',       ico:'🟢', col:'#ffeb3b' },
  { id:'djpad',       name:'DJ Pad',      ico:'🎹', col:'#ff9800' },
  { id:'flappy',      name:'Flappy',      ico:'🐦', col:'#81d4fa' },
  { id:'pong',        name:'Pong',        ico:'🏓', col:'#f48fb1' },
  { id:'reaction',    name:'Reaction',    ico:'⚡', col:'#fff9c4' },
  { id:'breakout',    name:'Breakout',    ico:'🧱', col:'#ffcc80' },
  { id:'colorgame',   name:'Colors',      ico:'🎨', col:'#e1bee7' },
  { id:'benchmark',   name:'Benchmark',   ico:'🔬', col:'#ff6d6d' },
  { id:'g2048',       name:'2048',        ico:'🟦', col:'#edc22e' },
];

/* App init function map — each app file registers itself here */
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
};

/* ── HOME DATE ──────────────────────────────────────── */
const homeDate = document.getElementById('home-date');
const fmtDate = () => {
  homeDate.textContent = new Date().toLocaleDateString('en-US', {
    weekday:'short', month:'short', day:'numeric', year:'numeric'
  }).toUpperCase();
};
fmtDate();
setInterval(fmtDate, 30000);

/* ── BUILD GRID ─────────────────────────────────────── */
const gridEl = document.getElementById('grid');
APPS.forEach((app, i) => {
  const cell = document.createElement('div');
  if (!app.id) {
    cell.className = 'cell empty';
    cell.innerHTML = '<span class="lbl">Soon</span>';
  } else {
    cell.className = 'cell';
    cell.style.cssText = `border-color:${app.col}55;box-shadow:0 0 18px ${app.col}18,0 5px 24px rgba(0,0,0,.5)`;
    cell.innerHTML = `<span class="ico">${app.ico}</span><span class="lbl">${app.name}</span>`;
    cell.addEventListener('click', () => { haptic('medium'); openApp(app, cell); });
  }
  cell.style.animationDelay = `${.45 + i * .07}s`;
  gridEl.appendChild(cell);
});

/* ── LAYER / APP LIFECYCLE ──────────────────────────── */
const layer = document.getElementById('layer');
let cleanup = null;

function openApp(app, icon) {
  content.innerHTML = '';
  const r = icon.getBoundingClientRect();
  layer.style.transformOrigin = `${r.left + r.width / 2}px ${r.top + r.height / 2}px`;
  // Clear any leftover inline styles from previous swipe gestures
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

/* ── SWIPE FROM LEFT EDGE TO CLOSE ─────────────────── */
(function() {
  let swX = null, swY = null, swDX = 0;

  layer.addEventListener('touchstart', e => {
    const t = e.touches[0];
    if (t.clientX < 24 && layer.classList.contains('open')) {
      swX = t.clientX; swY = t.clientY; swDX = 0;
    }
  }, { passive: true });

  layer.addEventListener('touchmove', e => {
    if (swX === null) return;
    const t = e.touches[0];
    const dx = t.clientX - swX;
    const dy = Math.abs(t.clientY - swY);
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
    if (swDX > 100) {
      closeApp();
    } else {
      layer.style.transition = 'transform .35s cubic-bezier(.34,1.56,.64,1),opacity .25s';
      layer.style.transform = '';
      layer.style.opacity = '';
      setTimeout(() => { layer.style.transition = ''; }, 380);
    }
    swX = null; swY = null; swDX = 0;
  }, { passive: true });
})();

document.addEventListener('keydown', e => { if (e.key === 'Escape') closeApp(); });
