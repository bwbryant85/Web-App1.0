/**
 * core.js — iPOCKET engine
 * Exposes globals: haptic(), SA, content
 * Must load before any app scripts.
 */
'use strict';

/* ── HAPTICS ──────────────────────────────────────────────────────────────────
   iOS Safari does not support navigator.vibrate().
   We use AudioContext for a micro-click that can trigger taptic feedback on iOS,
   and navigator.vibrate() as fallback for Android.
*/
let _hapticAC = null;
window.haptic = function(type) {
  type = type || 'light';
  // Android
  if (navigator.vibrate) {
    const p = {light:10, medium:22, heavy:45, success:[10,40,10], error:[40,20,40]};
    navigator.vibrate(p[type] || 10);
  }
  // iOS AudioContext micro-pop
  try {
    if (!_hapticAC) _hapticAC = new (window.AudioContext || window.webkitAudioContext)();
    if (_hapticAC.state === 'suspended') _hapticAC.resume();
    const o = _hapticAC.createOscillator();
    const g = _hapticAC.createGain();
    o.connect(g); g.connect(_hapticAC.destination);
    o.frequency.value = type === 'heavy' ? 60 : type === 'medium' ? 80 : 200;
    g.gain.setValueAtTime(0.001, _hapticAC.currentTime);
    g.gain.exponentialRampToValueAtTime(0.0001, _hapticAC.currentTime + 0.04);
    o.start(_hapticAC.currentTime);
    o.stop(_hapticAC.currentTime + 0.04);
  } catch(e) {}
};

/* ── SAFE AREA ────────────────────────────────────────────────────────────────
   Reads env() safe area insets for canvas games that need pixel-accurate layout.
*/
window.SA = (function() {
  const probe = document.createElement('div');
  probe.style.cssText = 'position:fixed;top:0;left:0;width:env(safe-area-inset-left,0px);height:env(safe-area-inset-top,0px);opacity:0;pointer-events:none;';
  document.body.appendChild(probe);
  const t = probe.getBoundingClientRect().height || 0;
  const l = probe.getBoundingClientRect().width  || 0;
  probe.style.cssText = 'position:fixed;bottom:0;right:0;width:env(safe-area-inset-right,0px);height:env(safe-area-inset-bottom,0px);opacity:0;pointer-events:none;';
  const b = probe.getBoundingClientRect().height || 0;
  const r = probe.getBoundingClientRect().width  || 0;
  probe.remove();
  return { t: Math.max(t, 59), b: Math.max(b, 0), l: Math.max(l, 0), r: Math.max(r, 0) };
})();

/* ── SHARED DOM REFS ──────────────────────────────────────────────────────── */
window.content = document.getElementById('app-content');
