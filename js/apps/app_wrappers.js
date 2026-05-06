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
  return initClock();
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
  return initGyro();
}

/* ── SCREENSAVER ──────────────────────────────────────── */
function initScreensaver98() {
  makeFullWrap();
  return initScreensaver();
}

/* ── SPARKS ───────────────────────────────────────────── */
function initParticles98() {
  makeFullWrap();
  return initParticles();
}

/* ── ASCII CAM ────────────────────────────────────────── */
function initASCII98() {
  makeFullWrap();
  return initASCII();
}

/* ── VISUALIZER ───────────────────────────────────────── */
function initVisualizer98() {
  makeFullWrap();
  return initVisualizer();
}

/* ── DJ PAD ───────────────────────────────────────────── */
function initDJPad98() {
  makeFullWrap();
  return initDJPad();
}

/* ── SNAKE ─────────────────────────────────────────────── */
function initSnake98() {
  makeFullWrap();
  return initSnake();
}

/* ── FLAPPY ────────────────────────────────────────────── */
function initFlappy98() {
  makeFullWrap();
  return initFlappy();
}

/* ── PONG ─────────────────────────────────────────────── */
function initPong98() {
  makeFullWrap();
  return initPong();
}

/* ── BREAKOUT ─────────────────────────────────────────── */
function initBreakout98() {
  makeFullWrap();
  return initBreakout();
}

/* ── SIMON ────────────────────────────────────────────── */
function initSimon98() {
  makeFullWrap();
  return initSimon();
}

/* ── REACTION ─────────────────────────────────────────── */
function initReaction98() {
  makeFullWrap();
  return initReaction();
}

/* ── COLOR GAME ───────────────────────────────────────── */
function initColorGame98() {
  makeFullWrap();
  return initColorGame();
}

/* ── 2048 ─────────────────────────────────────────────── */
function init2048_98() {
  makeFullWrap();
  return init2048();
}

/* ── PACMAN ───────────────────────────────────────────── */
function initPacman98() {
  makeFullWrap();
  return initPacman();
}
