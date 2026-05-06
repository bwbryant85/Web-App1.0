/* ════════════ ASCII CAM + EDGE DETECTION ════════════ */
function initASCII() {
  const wrap = document.createElement('div');
  wrap.className = 'asc-wrap';
  content.appendChild(wrap);

  const area = document.createElement('div');
  area.className = 'asc-area';
  wrap.appendChild(area);

  /* ── inject styles ── */
  if (!document.getElementById('asc-styles')) {
    const st = document.createElement('style');
    st.id = 'asc-styles';
    st.textContent = `
      .asc-wrap { width:100%;height:100%;display:flex;flex-direction:column;background:#000;overflow:hidden; }
      .asc-area { flex:1;position:relative;overflow:hidden;background:#000; }
      .asc-botbar {
        flex-shrink:0;display:flex;align-items:center;justify-content:center;gap:10px;
        padding:10px 14px calc(var(--sb,0px) + 10px);background:#000;
      }
      .asc-btn {
        font-family:'Orbitron',sans-serif;font-size:.58rem;font-weight:700;
        letter-spacing:.1em;text-transform:uppercase;
        color:rgba(255,255,255,.5);background:rgba(255,255,255,.06);
        border:1.5px solid rgba(255,255,255,.1);border-radius:50px;
        padding:10px 16px;cursor:pointer;-webkit-tap-highlight-color:transparent;
        transition:all .15s;flex-shrink:0;
      }
      .asc-btn.active {
        color:#000;background:#00ffcc;border-color:#00ffcc;
        box-shadow:0 0 18px rgba(0,255,204,.45);
      }
      .asc-btn-snap {
        font-family:'Orbitron',sans-serif;font-size:.58rem;font-weight:700;
        letter-spacing:.1em;text-transform:uppercase;
        color:#000;background:linear-gradient(135deg,#00ffcc,#00cc99);
        border:none;border-radius:50px;padding:10px 18px;
        cursor:pointer;-webkit-tap-highlight-color:transparent;
        box-shadow:0 4px 0 #007744,0 4px 16px rgba(0,255,150,.35);
        transition:transform .1s,box-shadow .1s;flex-shrink:0;
      }
      .asc-btn-snap:active { transform:translateY(3px);box-shadow:0 1px 0 #007744; }
      .asc-mode-label {
        position:absolute;top:${typeof SA!=='undefined'?SA.t+10:69}px;left:0;right:0;
        text-align:center;font-family:'Share Tech Mono',monospace;
        font-size:.52rem;letter-spacing:.18em;text-transform:uppercase;
        color:rgba(255,255,255,.25);pointer-events:none;z-index:2;
      }
      @keyframes asc-flash { 0%{opacity:.8}100%{opacity:0} }
    `;
    document.head.appendChild(st);
  }

  const tb = document.createElement('div');
  tb.className = 'asc-botbar';
  tb.innerHTML = `
    <button class="asc-btn-snap" id="asc-snap">📸 Save</button>
    <button class="asc-btn active" id="asc-ascii">ASCII</button>
    <button class="asc-btn" id="asc-clr">Color</button>
    <button class="asc-btn" id="asc-edge">Edge</button>`;
  wrap.appendChild(tb);

  const modeLabel = document.createElement('div');
  modeLabel.className = 'asc-mode-label';
  modeLabel.textContent = 'ASCII MODE';
  area.appendChild(modeLabel);

  let stream = null, raf2 = null;

  setTimeout(() => {
    const CW = area.offsetWidth  || content.offsetWidth;
    const CH = area.offsetHeight || content.offsetHeight - 80;
    const DPR = Math.min(window.devicePixelRatio || 1, 2);
    const FS = 5, CHAR_W = FS * .601, LINE_H = FS * 1.05;
    const COLS = Math.floor(CW / CHAR_W), ROWS = Math.floor(CH / LINE_H);

    /* ── output canvas (full res) ── */
    const ascCV = document.createElement('canvas');
    ascCV.width  = CW;
    ascCV.height = CH;
    ascCV.style.cssText = 'position:absolute;top:0;left:0;width:100%;height:100%;display:block;';
    area.appendChild(ascCV);
    const actx = ascCV.getContext('2d');
    // No DPR scale needed — canvas fills 100% via CSS

    /* ── small sampling canvas (ASCII / Color) ── */
    const sCV = document.createElement('canvas');
    sCV.width = COLS; sCV.height = ROWS;
    const sCtx = sCV.getContext('2d', { willReadFrequently:true });

    /* ── edge detection canvas (native resolution) ── */
    const eCV = document.createElement('canvas');
    // Use full display resolution for edge detection — no chunky pixels
    const EW = CW, EH = CH;
    eCV.width = EW; eCV.height = EH;
    const eCtx = eCV.getContext('2d', { willReadFrequently:true });

    const RAMP = ' .`-_:,;=+*!?|/\\()[]{}^~%$#@';

    /* ── mode: 'ascii' | 'color' | 'edge' ── */
    let mode = 'ascii';

    const vid = document.createElement('video');
    Object.assign(vid, { autoplay:true, playsInline:true, muted:true });
    vid.style.display = 'none';
    document.body.appendChild(vid);

    /* ═══════════════════════════════════════════════
       Sobel edge detection — clean single-pass render
    ═══════════════════════════════════════════════ */
    const GX = [-1,0,1,-2,0,2,-1,0,1];
    const GY = [-1,-2,-1,0,0,0,1,2,1];
    const THRESH = 35;
    const grey = new Float32Array(EW * EH);

    const edgeFrame = () => {
      // 1. Sample the video frame into the small edge canvas
      eCtx.drawImage(vid, 0, 0, EW, EH);
      const src = eCtx.getImageData(0, 0, EW, EH);
      const d   = src.data;

      // 2. Convert to greyscale
      for (let i = 0; i < EW * EH; i++) {
        const p = i * 4;
        grey[i] = d[p]*0.299 + d[p+1]*0.587 + d[p+2]*0.114;
      }

      // 3. Sobel + threshold — write directly into src buffer (reuse memory)
      for (let y = 1; y < EH-1; y++) {
        for (let x = 1; x < EW-1; x++) {
          let gx = 0, gy = 0;
          for (let ky = -1; ky <= 1; ky++) {
            for (let kx = -1; kx <= 1; kx++) {
              const g  = grey[(y+ky)*EW + (x+kx)];
              const ki = (ky+1)*3 + (kx+1);
              gx += GX[ki] * g;
              gy += GY[ki] * g;
            }
          }
          const mag = Math.sqrt(gx*gx + gy*gy);
          const p   = (y*EW + x) * 4;
          if (mag > THRESH) {
            // Neon cyan edge: R=0 G=255 B=204
            d[p]   = 0;
            d[p+1] = 255;
            d[p+2] = 204;
            d[p+3] = 255;
          } else {
            d[p]   = 0;
            d[p+1] = 0;
            d[p+2] = 0;
            d[p+3] = 255;
          }
        }
      }

      // 4. Put the coloured edge data back and scale to output canvas
      eCtx.putImageData(src, 0, 0);
      actx.imageSmoothingEnabled = false;
      actx.drawImage(eCV, 0, 0, CW, CH);
    };

    /* ═══════════════════════════════════════════════
       ASCII / Color frame
    ═══════════════════════════════════════════════ */
    const asciiFrame = () => {
      sCtx.drawImage(vid, 0, 0, COLS, ROWS);
      const d = sCtx.getImageData(0, 0, COLS, ROWS).data;
      actx.fillStyle = '#000';
      actx.fillRect(0, 0, CW, CH);
      actx.font = `${FS}px 'Share Tech Mono',monospace`;
      actx.textBaseline = 'top';
      for (let row = 0; row < ROWS; row++) {
        for (let col = 0; col < COLS; col++) {
          const i = (row * COLS + col) * 4;
          const b = (d[i]*.299 + d[i+1]*.587 + d[i+2]*.114) / 255;
          actx.fillStyle = mode === 'color'
            ? `rgb(${d[i]},${d[i+1]},${d[i+2]})`
            : '#00ffcc';
          actx.fillText(RAMP[Math.floor(b * (RAMP.length-1))], col*CHAR_W, row*LINE_H);
        }
      }
    };

    /* ── main loop ── */
    const frame = () => {
      if (vid.readyState >= 2) {
        if (mode === 'edge') edgeFrame();
        else                 asciiFrame();
      }
      raf2 = requestAnimationFrame(frame);
    };

    /* ── button wiring ── */
    const setMode = (m, label) => {
      mode = m;
      modeLabel.textContent = label;
      haptic('light');
      ['asc-ascii','asc-clr','asc-edge'].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.classList.remove('active');
      });
      const idMap = { ascii:'asc-ascii', color:'asc-clr', edge:'asc-edge' };
      const el = document.getElementById(idMap[m]);
      if (el) el.classList.add('active');
    };

    document.getElementById('asc-ascii').onclick = () => setMode('ascii', 'ASCII MODE');
    document.getElementById('asc-clr').onclick   = () => setMode('color', 'COLOR MODE');
    document.getElementById('asc-edge').onclick   = () => setMode('edge',  'EDGE DETECTION');

    /* ── save ── */
    document.getElementById('asc-snap').onclick = () => {
      haptic && haptic('success');

      // Flash effect
      const fl = document.createElement('div');
      fl.style.cssText = 'position:absolute;inset:0;background:#fff;pointer-events:none;z-index:5;opacity:1;transition:opacity .35s;';
      area.appendChild(fl);
      requestAnimationFrame(() => { fl.style.opacity = '0'; setTimeout(() => fl.remove(), 380); });

      // Capture dataURL
      const dataURL = ascCV.toDataURL('image/jpeg', 0.82);
      const fname = 'ascii-cam-' + new Date().toISOString().slice(0,19).replace(/[:T]/g,'-') + '.jpg';

      // 1. Save to iPOCKET Gallery (localStorage)
      const GALLERY_KEY = 'ipocket_gallery_v8';
      try {
        let photos = [];
        try { photos = JSON.parse(localStorage.getItem(GALLERY_KEY) || '[]'); } catch(e) {}
        photos.unshift({ data: dataURL, name: fname, date: new Date().toLocaleDateString() });
        if (photos.length > 100) photos = photos.slice(0, 100);
        localStorage.setItem(GALLERY_KEY, JSON.stringify(photos));
      } catch(e) {
        // quota exceeded — try lower quality
        try {
          const small = ascCV.toDataURL('image/jpeg', 0.45);
          let photos = [];
          try { photos = JSON.parse(localStorage.getItem(GALLERY_KEY) || '[]'); } catch(e2) {}
          photos.unshift({ data: small, name: fname, date: new Date().toLocaleDateString() });
          if (photos.length > 50) photos = photos.slice(0, 50);
          localStorage.setItem(GALLERY_KEY, JSON.stringify(photos));
        } catch(e2) {}
      }

      // 2. Show Win98-style dialog: save to device photos
      ascCV.toBlob(blob => {
        const file = new File([blob], fname, { type: 'image/jpeg' });
        const objURL = URL.createObjectURL(blob);

        // Build dialog
        const bd = document.createElement('div');
        bd.style.cssText = 'position:fixed;inset:0;z-index:9000;background:rgba(0,0,0,.45);display:flex;align-items:center;justify-content:center;';

        const dlg = document.createElement('div');
        dlg.style.cssText = 'background:var(--win-chrome);border:2px solid;border-color:var(--win-chrome-light) var(--win-chrome-dark) var(--win-chrome-dark) var(--win-chrome-light);min-width:min(300px,90vw);max-width:90vw;';

        // Preview image
        const preview = document.createElement('img');
        preview.src = dataURL;
        preview.style.cssText = 'width:100%;max-height:200px;object-fit:contain;background:#000;display:block;border-bottom:2px solid var(--win-chrome-dark);';

        const titleBar = document.createElement('div');
        titleBar.style.cssText = 'background:var(--win-title-active);padding:3px 6px;font-family:var(--pixel-font);font-size:17px;color:#fff;font-weight:bold;display:flex;align-items:center;justify-content:space-between;';
        titleBar.innerHTML = '<span>📷 Photo Saved</span>';

        const body = document.createElement('div');
        body.style.cssText = 'padding:10px 14px;font-family:var(--pixel-font);font-size:16px;color:var(--win-text);line-height:1.5;';
        body.textContent = 'Saved to Gallery. Also save to your Photos app?';

        const footer = document.createElement('div');
        footer.style.cssText = 'padding:8px 12px;display:flex;gap:8px;justify-content:flex-end;border-top:1px solid var(--win-chrome-dark);flex-wrap:wrap;';

        const saveBtn = document.createElement('button');
        saveBtn.className = 'btn98 primary';
        saveBtn.textContent = '📲 Save to Photos';
        saveBtn.onclick = async () => {
          try {
            if (navigator.canShare && navigator.canShare({ files: [file] })) {
              await navigator.share({ files: [file], title: 'iPOCKET Camera' });
            } else {
              // Fallback: direct download
              const a = document.createElement('a');
              a.href = objURL;
              a.download = fname;
              a.click();
            }
          } catch(e) {
            // User cancelled share — that's fine
          }
          setTimeout(() => URL.revokeObjectURL(objURL), 5000);
          bd.remove();
        };

        const skipBtn = document.createElement('button');
        skipBtn.className = 'btn98';
        skipBtn.textContent = 'Just Gallery';
        skipBtn.onclick = () => { URL.revokeObjectURL(objURL); bd.remove(); };

        footer.append(saveBtn, skipBtn);
        dlg.append(titleBar, preview, body, footer);
        bd.appendChild(dlg);
        document.body.appendChild(bd);

        // Also tap outside to dismiss
        bd.addEventListener('click', e => { if (e.target === bd) { URL.revokeObjectURL(objURL); bd.remove(); } });

      }, 'image/jpeg', 0.82);
    };

    /* ── camera ── */
    navigator.mediaDevices.getUserMedia({
      video: { facingMode:'environment', width:{ ideal:1280 }, height:{ ideal:720 } }
    }).then(s => {
      stream = s;
      vid.srcObject = s;
      vid.play();
      frame();
    }).catch(() => {
      actx.fillStyle = '#000'; actx.fillRect(0, 0, CW, CH);
      actx.fillStyle = '#00ffcc';
      actx.font = `bold 14px 'Orbitron',sans-serif`;
      actx.textAlign = 'center'; actx.textBaseline = 'middle';
      actx.fillText('CAMERA DENIED', CW/2, CH/2);
      tb.style.display = 'none';
    });

    wrap._kill = () => {
      cancelAnimationFrame(raf2);
      if (stream) stream.getTracks().forEach(t => t.stop());
      vid.remove();
    };
  }, 60);

  return () => { if (wrap._kill) wrap._kill(); };
}
