/* ════════════ 2048 ════════════ */
function init2048() {
  var wrap = document.createElement('div');
  wrap.className = 'g2048-wrap';
  content.appendChild(wrap);

  var COLORS = {
    0:    { bg:'rgba(255,255,255,.04)', fg:'transparent' },
    2:    { bg:'#eee4da', fg:'#776e65' },
    4:    { bg:'#ede0c8', fg:'#776e65' },
    8:    { bg:'#f2b179', fg:'#fff' },
    16:   { bg:'#f59563', fg:'#fff' },
    32:   { bg:'#f67c5f', fg:'#fff' },
    64:   { bg:'#f65e3b', fg:'#fff' },
    128:  { bg:'#edcf72', fg:'#fff' },
    256:  { bg:'#edcc61', fg:'#fff' },
    512:  { bg:'#edc850', fg:'#fff' },
    1024: { bg:'#edc53f', fg:'#fff' },
    2048: { bg:'#edc22e', fg:'#fff' },
  };

  var GRID = 4, grid, score, best, moving = false;
  var cellSz = 0, GAP = 6, PAD = 7;
  var tileLayer = null, scoreEl = null, bestEl = null, gridWrap = null;

  function newGrid() { return Array.from({ length: GRID }, function() { return Array(GRID).fill(0); }); }

  function addRandom(g) {
    var empty = [];
    for (var r = 0; r < GRID; r++) for (var c = 0; c < GRID; c++) if (!g[r][c]) empty.push([r, c]);
    if (!empty.length) return null;
    var rc = empty[Math.floor(Math.random() * empty.length)];
    g[rc[0]][rc[1]] = Math.random() < .9 ? 2 : 4;
    return rc;
  }

  function isOver(g) {
    for (var r = 0; r < GRID; r++) for (var c = 0; c < GRID; c++) {
      if (!g[r][c]) return false;
      if (c < GRID-1 && g[r][c] === g[r][c+1]) return false;
      if (r < GRID-1 && g[r][c] === g[r+1][c]) return false;
    }
    return true;
  }

  function cellPos(r, c) { return { x: PAD + c * (cellSz + GAP), y: PAD + r * (cellSz + GAP) }; }

  function makeTile(val, r, c, animated) {
    var pos = cellPos(r, c);
    var col = COLORS[val] || { bg:'#3c3a32', fg:'#fff' };
    var fs = val >= 1024 ? cellSz * .27 : val >= 128 ? cellSz * .32 : cellSz * .39;
    var el = document.createElement('div');
    el.style.cssText = 'position:absolute;width:'+cellSz+'px;height:'+cellSz+'px;border-radius:7px;'
      +'background:'+col.bg+';color:'+col.fg+';display:flex;align-items:center;justify-content:center;'
      +'font-size:'+fs+'px;font-weight:900;font-family:Orbitron,sans-serif;'
      +'left:'+pos.x+'px;top:'+pos.y+'px;'
      +(animated ? 'animation:tile-pop .15s ease-out;' : '')
      +(val === 2048 ? 'box-shadow:0 0 20px #edc22e80;' : '');
    el.textContent = val;
    return el;
  }

  function redraw(newSpawn) {
    while (tileLayer.firstChild) tileLayer.removeChild(tileLayer.firstChild);
    for (var r = 0; r < GRID; r++) for (var c = 0; c < GRID; c++) {
      if (!grid[r][c]) continue;
      var isNew = newSpawn && newSpawn[0] === r && newSpawn[1] === c;
      tileLayer.appendChild(makeTile(grid[r][c], r, c, isNew));
    }
    if (scoreEl) scoreEl.textContent = score;
    if (bestEl)  bestEl.textContent  = best;
    if (isOver(grid)) {
      var ov = document.createElement('div');
      ov.style.cssText = 'position:absolute;inset:0;border-radius:12px;background:rgba(5,5,8,.88);display:flex;flex-direction:column;align-items:center;justify-content:center;gap:14px;backdrop-filter:blur(8px);-webkit-backdrop-filter:blur(8px);';
      ov.innerHTML = '<div style="font-size:1.5rem;font-weight:900;color:var(--mag);letter-spacing:.15em;text-shadow:var(--gm)">GAME OVER</div>'
        + '<div style="font-family:Share Tech Mono,monospace;font-size:.7rem;color:var(--dim)">Score: '+score+'</div>';
      var nb = document.createElement('button');
      nb.className = 'cyan-btn'; nb.textContent = 'New Game';
      nb.onclick = function() { haptic('medium'); reset(); };
      ov.appendChild(nb);
      gridWrap.appendChild(ov);
    }
  }

  function doMove(dir) {
    if (moving) return;
    function rotCW(g)  { return g[0].map(function(_,i){ return g.map(function(r){ return r[i]; }).reverse(); }); }
    function rotCCW(g) { return g[0].map(function(_,i){ return g.map(function(r){ return r[GRID-1-i]; }); }); }
    var pre, post;
    if      (dir === 'left')  { pre = function(g){return g;};                                post = function(g){return g;}; }
    else if (dir === 'right') { pre = function(g){return g.map(function(r){return r.slice().reverse();});}; post = function(g){return g.map(function(r){return r.slice().reverse();});}; }
    else if (dir === 'up')    { pre = rotCCW; post = rotCW; }
    else                      { pre = rotCW;  post = rotCCW; }

    var snap = grid.map(function(r){ return r.slice(); });
    var work = pre(snap.map(function(r){ return r.slice(); }));
    var dests = [], pts = 0, anyMoved = false;

    for (var row = 0; row < GRID; row++) {
      var nonZ = [];
      for (var col = 0; col < GRID; col++) if (work[row][col]) nonZ.push({ c:col, v:work[row][col] });
      var dst = 0;
      for (var i = 0; i < nonZ.length;) {
        if (i+1 < nonZ.length && nonZ[i].v === nonZ[i+1].v) {
          dests.push({ wr:row, wfrom:nonZ[i].c,   wto:dst, v:nonZ[i].v,   hide:false });
          dests.push({ wr:row, wfrom:nonZ[i+1].c, wto:dst, v:nonZ[i+1].v, hide:true  });
          work[row][dst] = nonZ[i].v * 2;
          pts += work[row][dst];
          if (work[row][dst] === 2048) haptic('success');
          dst++; i += 2;
        } else {
          dests.push({ wr:row, wfrom:nonZ[i].c, wto:dst, v:nonZ[i].v, hide:false });
          work[row][dst] = nonZ[i].v; dst++; i++;
        }
      }
      for (var c2 = dst; c2 < GRID; c2++) work[row][c2] = 0;
    }

    var newG = post(work);
    for (var rr = 0; rr < GRID; rr++) for (var cc = 0; cc < GRID; cc++) if (snap[rr][cc] !== newG[rr][cc]) anyMoved = true;
    if (!anyMoved) return;
    haptic('light');
    moving = true;

    while (tileLayer.firstChild) tileLayer.removeChild(tileLayer.firstChild);

    function workToReal(wr, wc) {
      var tmp = Array.from({ length:GRID }, function(_,ri){ return Array.from({ length:GRID }, function(_,ci){ return ri===wr&&ci===wc?1:0; }); });
      var res = post(tmp);
      for (var ri = 0; ri < GRID; ri++) for (var ci = 0; ci < GRID; ci++) if (res[ri][ci]) return { r:ri, c:ci };
      return { r:wr, c:wc };
    }

    var ANIM = 120, tileEls = [];
    dests.forEach(function(d) {
      var from = workToReal(d.wr, d.wfrom);
      var to   = workToReal(d.wr, d.wto);
      var pos  = cellPos(from.r, from.c);
      var col  = COLORS[d.v] || { bg:'#3c3a32', fg:'#fff' };
      var fs   = d.v >= 1024 ? cellSz * .27 : d.v >= 128 ? cellSz * .32 : cellSz * .39;
      var el   = document.createElement('div');
      el.style.cssText = 'position:absolute;width:'+cellSz+'px;height:'+cellSz+'px;border-radius:7px;'
        +'background:'+col.bg+';color:'+col.fg+';display:flex;align-items:center;justify-content:center;'
        +'font-size:'+fs+'px;font-weight:900;font-family:Orbitron,sans-serif;'
        +'left:'+pos.x+'px;top:'+pos.y+'px;will-change:left,top;';
      el.textContent = d.v;
      tileLayer.appendChild(el);
      tileEls.push({ el:el, to:to, hide:d.hide });
    });

    requestAnimationFrame(function() {
      requestAnimationFrame(function() {
        tileEls.forEach(function(t) {
          var p = cellPos(t.to.r, t.to.c);
          t.el.style.transition = 'left '+ANIM+'ms ease,top '+ANIM+'ms ease';
          t.el.style.left = p.x + 'px';
          t.el.style.top  = p.y + 'px';
          if (t.hide) t.el.style.opacity = '0';
        });
        setTimeout(function() {
          grid = newG; score += pts;
          if (score > best) { best = score; try { sessionStorage.setItem('bst2048', best); } catch(e) {} }
          var spawned = addRandom(grid);
          redraw(spawned);
          moving = false;
        }, ANIM + 16);
      });
    });
  }

  function reset() {
    grid = newGrid(); score = 0; moving = false;
    try { best = parseInt(sessionStorage.getItem('bst2048') || '0'); } catch(e) { best = 0; }
    build();
  }

  function build() {
    wrap.innerHTML = '';
    var avW = Math.min(content.offsetWidth - 20, 440);
    cellSz = Math.floor((avW - PAD * 2 - GAP * (GRID - 1)) / GRID);

    var top = document.createElement('div');
    top.className = 'g2048-top';
    top.innerHTML = '<div class="g2048-title">2048</div>'
      + '<div class="g2048-scores">'
      + '<div class="g2048-score-box"><div class="g2048-score-lbl">Score</div><div class="g2048-score-val" id="g2sc">0</div></div>'
      + '<div class="g2048-score-box"><div class="g2048-score-lbl">Best</div><div class="g2048-score-val" id="g2best">0</div></div>'
      + '</div>';
    wrap.appendChild(top);
    scoreEl = document.getElementById('g2sc');
    bestEl  = document.getElementById('g2best');

    var total = PAD * 2 + GRID * cellSz + GAP * (GRID - 1);
    gridWrap = document.createElement('div');
    gridWrap.style.cssText = 'position:relative;width:'+total+'px;height:'+total+'px;border-radius:12px;background:rgba(255,255,255,.06);flex-shrink:0;';

    var bg = document.createElement('div');
    bg.style.cssText = 'position:absolute;inset:0;display:grid;grid-template-columns:repeat('+GRID+','+cellSz+'px);gap:'+GAP+'px;padding:'+PAD+'px;box-sizing:border-box;';
    for (var i = 0; i < 16; i++) {
      var b = document.createElement('div');
      b.style.cssText = 'border-radius:7px;background:rgba(255,255,255,.05);';
      bg.appendChild(b);
    }
    gridWrap.appendChild(bg);

    tileLayer = document.createElement('div');
    tileLayer.style.cssText = 'position:absolute;inset:0;';
    gridWrap.appendChild(tileLayer);
    wrap.appendChild(gridWrap);

    var nb = document.createElement('button');
    nb.className = 'cyan-btn'; nb.textContent = 'New Game'; nb.style.marginTop = '4px';
    nb.onclick = function() { haptic('medium'); reset(); };
    wrap.appendChild(nb);

    var hint = document.createElement('div');
    hint.className = 'g2048-hint'; hint.textContent = 'Swipe to move · Merge tiles · Reach 2048';
    wrap.appendChild(hint);

    addRandom(grid); addRandom(grid); redraw(null);
  }

  // Touch swipe
  var tx = null, ty = null;
  wrap.addEventListener('touchstart', function(e) {
    if (moving) return;
    var t = e.touches[0]; tx = t.clientX; ty = t.clientY;
  }, { passive: true });
  wrap.addEventListener('touchend', function(e) {
    if (moving || tx === null) return;
    var t = e.changedTouches[0];
    var dx = t.clientX - tx, dy = t.clientY - ty;
    var adx = Math.abs(dx), ady = Math.abs(dy);
    tx = null; ty = null;
    if (Math.max(adx, ady) < 22) return;
    doMove(adx > ady ? (dx > 0 ? 'right' : 'left') : (dy > 0 ? 'down' : 'up'));
  }, { passive: true });

  // Keyboard
  var KM = { ArrowLeft:'left', ArrowRight:'right', ArrowUp:'up', ArrowDown:'down' };
  var onKey = function(e) { if (moving || !KM[e.key]) return; e.preventDefault(); doMove(KM[e.key]); };
  document.addEventListener('keydown', onKey);

  reset();
  return function() { document.removeEventListener('keydown', onKey); };
}
