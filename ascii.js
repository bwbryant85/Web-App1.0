/* ════════════ ASCII CAM ════════════ */
function initASCII() {
  const wrap = document.createElement('div');
  wrap.className = 'asc-wrap';
  content.appendChild(wrap);

  const area = document.createElement('div');
  area.className = 'asc-area';
  wrap.appendChild(area);

  const tb = document.createElement('div');
  tb.className = 'asc-botbar';
  tb.innerHTML = '<button class="asc-snap" id="asc-snap">📸 Save</button><button class="asc-clr" id="asc-clr">🎨 Color</button>';
  wrap.appendChild(tb);

  let stream = null, raf2 = null;

  setTimeout(() => {
    const CW = area.offsetWidth || content.offsetWidth;
    const CH = area.offsetHeight || content.offsetHeight - 80;
    const DPR = Math.min(window.devicePixelRatio || 1, 2);
    const FS = 5, CHAR_W = FS * .601, LINE_H = FS * 1.05;
    const COLS = Math.floor(CW / CHAR_W), ROWS = Math.floor(CH / LINE_H);

    const ascCV = document.createElement('canvas');
    ascCV.width = Math.round(CW * DPR);
    ascCV.height = Math.round(CH * DPR);
    ascCV.style.cssText = `display:block;width:${CW}px;height:${CH}px;`;
    area.appendChild(ascCV);

    const actx = ascCV.getContext('2d');
    actx.scale(DPR, DPR);

    const sCV = document.createElement('canvas');
    sCV.width = COLS; sCV.height = ROWS;
    const sCtx = sCV.getContext('2d', { willReadFrequently: true });

    let colorMode = false;
    const RAMP = ' .`-_:,;=+*!?|/\\()[]{}^~%$#@';

    const vid = document.createElement('video');
    Object.assign(vid, { autoplay:true, playsInline:true, muted:true });
    vid.style.display = 'none';
    document.body.appendChild(vid);

    const frame = () => {
      if (vid.readyState >= 2) {
        sCtx.drawImage(vid, 0, 0, COLS, ROWS);
        const d = sCtx.getImageData(0, 0, COLS, ROWS).data;
        actx.fillStyle = '#000';
        actx.fillRect(0, 0, CW, CH);
        actx.font = `${FS}px 'Share Tech Mono',monospace`;
        actx.textBaseline = 'top';
        for (let row = 0; row < ROWS; row++) {
          for (let col = 0; col < COLS; col++) {
            const i = (row * COLS + col) * 4;
            const b = (d[i] * .299 + d[i+1] * .587 + d[i+2] * .114) / 255;
            actx.fillStyle = colorMode ? `rgb(${d[i]},${d[i+1]},${d[i+2]})` : '#00ffcc';
            actx.fillText(RAMP[Math.floor(b * (RAMP.length - 1))], col * CHAR_W, row * LINE_H);
          }
        }
      }
      raf2 = requestAnimationFrame(frame);
    };

    document.getElementById('asc-snap').onclick = () => {
      const fl = document.createElement('div');
      fl.style.cssText = 'position:absolute;inset:0;background:#fff;pointer-events:none;z-index:5;animation:flash .35s ease forwards;';
      area.appendChild(fl);
      setTimeout(() => fl.remove(), 400);
      ascCV.toBlob(async blob => {
        const file = new File([blob], `ascii-${Date.now()}.png`, { type:'image/png' });
        try {
          if (navigator.canShare && navigator.canShare({ files:[file] })) {
            await navigator.share({ files:[file], title:'ASCII Photo' });
          } else {
            const a = document.createElement('a');
            a.href = URL.createObjectURL(blob);
            a.download = file.name;
            a.click();
            setTimeout(() => URL.revokeObjectURL(a.href), 3000);
          }
        } catch(e) {}
      }, 'image/png');
    };

    document.getElementById('asc-clr').onclick = () => {
      colorMode = !colorMode;
      haptic('light');
      const btn = document.getElementById('asc-clr');
      btn.classList.toggle('active', colorMode);
      btn.textContent = colorMode ? '🌿 Green' : '🎨 Color';
    };

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
      actx.fillText('CAMERA DENIED', CW / 2, CH / 2);
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
