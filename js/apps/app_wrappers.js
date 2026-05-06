/**
 * app_wrappers.js — Maps new Win98 init function names
 * to the existing app init functions, wrapping them in
 * a Win98-style HUD shell where needed.
 */
'use strict';

/* ── HELPER: build a Win98 game container ───────────────── */
function makeGame98Shell(hud1, hud2) {
  const c = window.content;
  c.style.cssText = 'width:100%;height:100%;display:flex;flex-direction:column;overflow:hidden;background:#050508;';
  const hud = document.createElement('div');
  hud.className = 'game98-hud';
  hud.innerHTML = `<span id="g98-hud1">${hud1||''}</span><span id="g98-hud2" style="color:var(--win-text-dim)">${hud2||''}</span>`;
  c.appendChild(hud);
  const cw = document.createElement('div');
  cw.className = 'game98-canvas-wrap';
  c.appendChild(cw);
  const ctrl = document.createElement('div');
  ctrl.className = 'game98-controls';
  c.appendChild(ctrl);
  // Set content to the canvas wrap so old apps render inside
  window.content = cw;
  return {hud, canvasWrap:cw, controls:ctrl, container:c};
}

/* ── HELPER: simple full-body wrapper ───────────────────── */
function makeFullWrap() {
  const c = window.content;
  c.style.cssText = 'width:100%;height:100%;display:flex;flex-direction:column;overflow:hidden;';
  return c;
}

/* ── CLOCK ────────────────────────────────────────────── */
function initClock98() {
  makeFullWrap();
  let _cl = null;
  setTimeout(() => { _cl = initClock(); }, 60);
  return () => { if (_cl && typeof _cl === 'function') _cl(); };
}

/* ── WEATHER ──────────────────────────────────────────── */
function initWeather98() {
  makeFullWrap();
  return initWeather();
}

/* ── TIMER ────────────────────────────────────────────── */
function initTimer98() {
  const c = window.content;
  c.style.cssText = 'width:100%;height:100%;display:flex;flex-direction:column;overflow:hidden;';
  const menu = document.createElement('div');
  menu.className = 'win-menubar';
  menu.innerHTML = '<div class="win-menu-item">Timer</div><div class="win-menu-item">Stopwatch</div>';
  c.appendChild(menu);
  window.content = c;
  return initTimer();
}

/* ── NOTES ────────────────────────────────────────────── */
function initNotes98() {
  const c = window.content;
  c.style.cssText = 'width:100%;height:100%;display:flex;flex-direction:column;overflow:hidden;';
  const menu = document.createElement('div');
  menu.className = 'win-menubar';
  menu.innerHTML = '<div class="win-menu-item">File</div><div class="win-menu-item">Edit</div><div class="win-menu-item">View</div>';
  c.appendChild(menu);
  const toolbar = document.createElement('div');
  toolbar.className = 'win-toolbar';
  toolbar.innerHTML = '<button class="win-toolbar-btn" id="notes-new-btn98">📄 New</button><div class="win-toolbar-sep"></div><button class="win-toolbar-btn">🗑️ Delete</button>';
  c.appendChild(toolbar);
  window.content = c;
  return initNotes();
}

/* ── CASINO ───────────────────────────────────────────── */
function initCasino98() {
  makeFullWrap();
  return initCasino();
}

/* ── SPORTS ───────────────────────────────────────────── */
function initSports98() {
  makeFullWrap();
  return initSports();
}

/* ── ASSISTANT ────────────────────────────────────────── */
function initAssistant98() {
  makeFullWrap();
  return initAssistant();
}

/* ── TERMINAL ─────────────────────────────────────────── */
function initTerminal98() {
  makeFullWrap();
  return initTerminal();
}

/* ── FILE SYSTEM ──────────────────────────────────────── */
function initFileSystem98() {
  makeFullWrap();
  return initFileSystem();
}

/* ── APP STORE ────────────────────────────────────────── */
function initAppStore98() {
  makeFullWrap();
  return initAppStore();
}

/* ── DEVICE INFO ──────────────────────────────────────── */
function initDeviceInfo98() {
  makeFullWrap();
  return initDeviceInfo();
}

/* ── BENCHMARK ────────────────────────────────────────── */
function initBenchmark98() {
  makeFullWrap();
  return initBenchmark();
}

/* ── GYRO ─────────────────────────────────────────────── */
function initGyro98() {
  makeFullWrap();
  let _cl = null;
  setTimeout(() => { _cl = initGyro(); }, 60);
  return () => { if (_cl && typeof _cl === 'function') _cl(); };
}

/* ── SCREENSAVER ──────────────────────────────────────── */
function initScreensaver98() {
  makeFullWrap();
  let _cl = null;
  setTimeout(() => { _cl = initScreensaver(); }, 60);
  return () => { if (_cl && typeof _cl === 'function') _cl(); };
}

/* ── SPARKS ───────────────────────────────────────────── */
function initParticles98() {
  makeFullWrap();
  let _cl = null;
  setTimeout(() => { _cl = initParticles(); }, 60);
  return () => { if (_cl && typeof _cl === 'function') _cl(); };
}

/* ── ASCII CAM ────────────────────────────────────────── */
function initASCII98() {
  makeFullWrap();
  let _cl = null;
  setTimeout(() => { _cl = initASCII(); }, 60);
  return () => { if (_cl && typeof _cl === 'function') _cl(); };
}

/* ── VISUALIZER ───────────────────────────────────────── */
function initVisualizer98() {
  makeFullWrap();
  let _cl = null;
  setTimeout(() => { _cl = initVisualizer(); }, 60);
  return () => { if (_cl && typeof _cl === 'function') _cl(); };
}

/* ── DJ PAD ───────────────────────────────────────────── */
function initDJPad98() {
  makeFullWrap();
  let _cl = null;
  setTimeout(() => { _cl = initDJPad(); }, 60);
  return () => { if (_cl && typeof _cl === 'function') _cl(); };
}

/* ── SNAKE ─────────────────────────────────────────────── */
function initSnake98() {
  makeFullWrap();
  let _cl = null;
  setTimeout(() => { _cl = initSnake(); }, 60);
  return () => { if (_cl && typeof _cl === 'function') _cl(); };
}

/* ── FLAPPY ────────────────────────────────────────────── */
function initFlappy98() {
  makeFullWrap();
  let _cl = null;
  setTimeout(() => { _cl = initFlappy(); }, 60);
  return () => { if (_cl && typeof _cl === 'function') _cl(); };
}

/* ── PONG ─────────────────────────────────────────────── */
function initPong98() {
  makeFullWrap();
  let _cl = null;
  setTimeout(() => { _cl = initPong(); }, 60);
  return () => { if (_cl && typeof _cl === 'function') _cl(); };
}

/* ── BREAKOUT ─────────────────────────────────────────── */
function initBreakout98() {
  makeFullWrap();
  let _cl = null;
  setTimeout(() => { _cl = initBreakout(); }, 60);
  return () => { if (_cl && typeof _cl === 'function') _cl(); };
}

/* ── SIMON ────────────────────────────────────────────── */
function initSimon98() {
  makeFullWrap();
  let _cl = null;
  setTimeout(() => { _cl = initSimon(); }, 60);
  return () => { if (_cl && typeof _cl === 'function') _cl(); };
}

/* ── REACTION ─────────────────────────────────────────── */
function initReaction98() {
  makeFullWrap();
  let _cl = null;
  setTimeout(() => { _cl = initReaction(); }, 60);
  return () => { if (_cl && typeof _cl === 'function') _cl(); };
}

/* ── COLOR GAME ───────────────────────────────────────── */
function initColorGame98() {
  makeFullWrap();
  let _cl = null;
  setTimeout(() => { _cl = initColorGame(); }, 60);
  return () => { if (_cl && typeof _cl === 'function') _cl(); };
}

/* ── 2048 ─────────────────────────────────────────────── */
function init2048_98() {
  makeFullWrap();
  let _cl = null;
  setTimeout(() => { _cl = init2048(); }, 60);
  return () => { if (_cl && typeof _cl === 'function') _cl(); };
}

/* ── PACMAN ───────────────────────────────────────────── */
function initPacman98() {
  makeFullWrap();
  let _cl = null;
  setTimeout(() => { _cl = initPacman(); }, 60);
  return () => { if (_cl && typeof _cl === 'function') _cl(); };
}
