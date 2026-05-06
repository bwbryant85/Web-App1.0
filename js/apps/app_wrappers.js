/**
 * app_wrappers.js — Maps Win98 init names to existing app inits
 */
'use strict';

/* ── HELPER: simple full-body wrapper ── */
function makeFullWrap() {
  const c = window.content;
  c.style.cssText = 'width:100%;height:100%;display:flex;flex-direction:column;overflow:hidden;';
  return c;
}

/* ── HELPER: deferred game init ──────────────────────────────
   Captures window.content NOW, then restores it inside the
   timeout so the game's init reads the correct win-body element.
   Without this, window.content gets overwritten if another
   window opens before the 60ms timer fires.
   ─────────────────────────────────────────────────────────── */
function deferredGame(innerFn) {
  makeFullWrap();
  const savedContent = window.content; // capture NOW before content changes
  let _cleanup = null;
  setTimeout(() => {
    window.content = savedContent;     // restore so innerFn reads right element
    try { _cleanup = innerFn(); } catch(e) { console.error('Game init error:', e); }
  }, 80);
  return () => { if (_cleanup && typeof _cleanup === 'function') _cleanup(); };
}

/* ── NON-CANVAS APPS (no deferral needed) ────────────────── */
function initWeather98()    { makeFullWrap(); return initWeather(); }
function initCasino98()     { makeFullWrap(); return initCasino(); }
function initSports98()     { makeFullWrap(); return initSports(); }
function initAssistant98()  { makeFullWrap(); return initAssistant(); }
function initTerminal98()   { makeFullWrap(); return initTerminal(); }
function initFileSystem98() { makeFullWrap(); return initFileSystem(); }
function initAppStore98()   { makeFullWrap(); return initAppStore(); }
function initDeviceInfo98() { makeFullWrap(); return initDeviceInfo(); }
function initBenchmark98()  { makeFullWrap(); return initBenchmark(); }

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

function initNotes98() {
  const c = window.content;
  c.style.cssText = 'width:100%;height:100%;display:flex;flex-direction:column;overflow:hidden;';
  const menu = document.createElement('div');
  menu.className = 'win-menubar';
  menu.innerHTML = '<div class="win-menu-item">File</div><div class="win-menu-item">Edit</div><div class="win-menu-item">View</div>';
  c.appendChild(menu);
  window.content = c;
  return initNotes();
}

/* ── CANVAS GAMES (deferred so window has rendered) ──────── */
function initSnake98()      { return deferredGame(initSnake); }
function initFlappy98()     { return deferredGame(initFlappy); }
function initPong98()       { return deferredGame(initPong); }
function initBreakout98()   { return deferredGame(initBreakout); }
function initSimon98()      { return deferredGame(initSimon); }
function initReaction98()   { return deferredGame(initReaction); }
function initColorGame98()  { return deferredGame(initColorGame); }
function init2048_98()      { return deferredGame(init2048); }
function initPacman98()     { return deferredGame(initPacman); }
function initClock98()      { return deferredGame(initClock); }
function initGyro98()       { return deferredGame(initGyro); }
function initScreensaver98(){ return deferredGame(initScreensaver); }
function initParticles98()  { return deferredGame(initParticles); }
function initASCII98()      { return deferredGame(initASCII); }
function initVisualizer98() { return deferredGame(initVisualizer); }
function initDJPad98()      { return deferredGame(initDJPad); }
