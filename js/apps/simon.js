/* ════════════ SIMON ════════════ */
function initSimon() {
  const wrap = document.createElement('div');
  wrap.className = 'simon-wrap';
  content.appendChild(wrap);

  const SC = ['#ff3030','#30ff30','#ffee00','#00ddff'];
  const SD = ['#7f0000','#1b5e20','#e65100','#006064'];

  wrap.innerHTML = `
    <div class="simon-hud" id="sim-hud">Press Start</div>
    <div class="simon-grid">
      ${[0,1,2,3].map(i => `<div class="simon-pad" data-id="${i}" style="background:radial-gradient(at 35% 35%,${SC[i]},${SD[i]})"></div>`).join('')}
    </div>
    <button class="cyan-btn" id="sim-start">Start</button>`;

  let seq = [], pIdx = 0, level = 0, playing = false, accepting = false, ac = null;
  const FREQS = [196, 330, 264, 165];
  const hud = document.getElementById('sim-hud');

  const tone = (id, dur = .3) => {
    if (!ac) ac = new (window.AudioContext || window.webkitAudioContext)();
    const o = ac.createOscillator(), g = ac.createGain();
    o.connect(g); g.connect(ac.destination);
    o.type = 'sine'; o.frequency.value = FREQS[id];
    g.gain.setValueAtTime(.5, ac.currentTime);
    g.gain.exponentialRampToValueAtTime(.001, ac.currentTime + dur);
    o.start(); o.stop(ac.currentTime + dur);
  };

  const flash = (id, dur = 360) => {
    const el = wrap.querySelector(`[data-id="${id}"]`);
    if (!el) return;
    el.classList.add('active');
    tone(id, dur / 1000);
    setTimeout(() => el.classList.remove('active'), dur);
  };

  const wait = ms => new Promise(r => setTimeout(r, ms));

  const playSeq = async () => {
    accepting = false;
    await wait(550);
    for (const id of seq) { flash(id, 380); await wait(520); }
    accepting = true; pIdx = 0;
  };

  const nextRound = async () => {
    level++;
    hud.textContent = `Level ${level}`;
    seq.push(Math.floor(Math.random() * 4));
    await playSeq();
  };

  const onTap = async id => {
    if (!accepting || !playing) return;
    flash(id, 220);
    if (id !== seq[pIdx]) {
      accepting = false; playing = false;
      await wait(150);
      for (let i = 0; i < 3; i++) { [0,1,2,3].forEach(p => flash(p, 180)); await wait(320); }
      hud.textContent = `Game Over — Level ${level}`;
      const btn = document.getElementById('sim-start');
      btn.textContent = 'Play Again'; btn.style.display = '';
      return;
    }
    pIdx++;
    if (pIdx === seq.length) { await wait(480); nextRound(); }
  };

  document.getElementById('sim-start').onclick = () => {
    if (!playing) {
      seq = []; level = 0; playing = true;
      document.getElementById('sim-start').style.display = 'none';
      nextRound();
    }
  };

  wrap.querySelectorAll('.simon-pad').forEach(p => {
    p.addEventListener('click', () => { haptic('medium'); onTap(+p.dataset.id); });
    p.addEventListener('touchstart', e => { e.preventDefault(); onTap(+p.dataset.id); }, { passive:false });
  });

  return () => { playing = false; accepting = false; if (ac) ac.close(); };
}
