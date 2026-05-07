/* ════════════ PAINT v8 MODERN ════════════
   Modern paint app with glass effects
   ════════════════════════════════════ */

function initPaint() {
  const c = window.content;
  c.style.cssText = 'width:100%;height:100%;display:flex;flex-direction:column;overflow:hidden;background:rgba(248,249,252,.92);border-radius:28px;';

  const toolbar = document.createElement('div');
  toolbar.style.cssText = 'flex-shrink:0;padding:16px;background:rgba(255,255,255,.9);backdrop-filter:blur(20px);-webkit-backdrop-filter:blur(20px);border-bottom:1px solid rgba(15,23,42,.08);border-radius:28px 28px 0 0;display:flex;flex-direction:column;gap:12px;';

  // Color palette
  const paletteRow = document.createElement('div');
  paletteRow.style.cssText = 'display:flex;gap:8px;flex-wrap:wrap;';
  const colors = ['#000000','#ffffff','#ff3b30','#ff9500','#ffcc00','#34c759','#0a84ff','#5e5ce6','#af52de','#ff6b9d','#ffd60a','#30d158'];
  colors.forEach(color => {
    const swatch = document.createElement('button');
    swatch.style.cssText = `width:32px;height:32px;border-radius:16px;border:2px solid rgba(15,23,42,.12);cursor:pointer;-webkit-tap-highlight-color:transparent;background:${color};`;
    swatch.dataset.color = color;
    swatch.addEventListener('click', () => {
      brushColor = color;
      ctx.strokeStyle = brushColor;
      paletteRow.querySelectorAll('button').forEach(btn => btn.style.borderColor = 'rgba(15,23,42,.12)');
      swatch.style.borderColor = '#4a90d9';
    });
    paletteRow.appendChild(swatch);
  });
  paletteRow.firstChild.style.borderColor = '#4a90d9';
  toolbar.appendChild(paletteRow);

  // Controls
  const controlsRow = document.createElement('div');
  controlsRow.style.cssText = 'display:flex;gap:12px;align-items:center;';
  controlsRow.innerHTML = `
    <div style="display:flex;flex-direction:column;gap:4px;">
      <label style="font-family:'Inter',sans-serif;font-size:.8rem;color:#666;font-weight:500;">Brush Size</label>
      <input type="range" min="2" max="32" value="10" id="paint-size" style="width:120px;" />
    </div>
    <button id="paint-clear" style="font-family:'Inter',sans-serif;font-size:.9rem;color:#111;background:#f8f9fa;border:1px solid rgba(15,23,42,.12);border-radius:12px;padding:8px 16px;cursor:pointer;-webkit-tap-highlight-color:transparent;">Clear</button>
    <button id="paint-save" style="font-family:'Inter',sans-serif;font-size:.9rem;color:#fff;background:#4a90d9;border:none;border-radius:12px;padding:8px 16px;cursor:pointer;-webkit-tap-highlight-color:transparent;">Save</button>
  `;
  toolbar.appendChild(controlsRow);
  c.appendChild(toolbar);

  const paintArea = document.createElement('div');
  paintArea.style.cssText = 'flex:1;display:flex;align-items:center;justify-content:center;padding:20px;background:rgba(248,249,252,.92);';
  const canvas = document.createElement('canvas');
  canvas.style.cssText = 'background:#ffffff;border-radius:16px;box-shadow:0 16px 40px rgba(15,23,42,.06);max-width:100%;max-height:100%;';
  paintArea.appendChild(canvas);
  c.appendChild(paintArea);

  const status = document.createElement('div');
  status.style.cssText = 'flex-shrink:0;padding:12px 16px;text-align:center;font-family:\'Inter\',sans-serif;font-size:.9rem;color:#666;background:rgba(255,255,255,.9);backdrop-filter:blur(20px);-webkit-backdrop-filter:blur(20px);border-top:1px solid rgba(15,23,42,.08);border-radius:0 0 28px 28px;';
  status.textContent = 'Draw with your finger or mouse';
  c.appendChild(status);

  const sizeInput = toolbar.querySelector('#paint-size');
  const clearBtn = toolbar.querySelector('#paint-clear');
  const saveBtn = toolbar.querySelector('#paint-save');

  let brushColor = '#000000';
  let brushSize = 10;

  const ctx = canvas.getContext('2d');
  let drawing = false;

  function resizeCanvas() {
    const rect = paintArea.getBoundingClientRect();
    const size = Math.min(rect.width - 40, rect.height - 40, 600);
    canvas.width = size;
    canvas.height = size;
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.strokeStyle = brushColor;
    ctx.lineWidth = brushSize;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
  }

  resizeCanvas();
  window.addEventListener('resize', resizeCanvas);

  sizeInput.oninput = () => {
    brushSize = sizeInput.value;
    ctx.lineWidth = brushSize;
  };

  clearBtn.onclick = () => {
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  };

  saveBtn.onclick = () => {
    const link = document.createElement('a');
    link.download = 'ipocket-paint.png';
    link.href = canvas.toDataURL();
    link.click();
  };

  function getPos(e) {
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY
    };
  }

  canvas.addEventListener('pointerdown', (e) => {
    drawing = true;
    const pos = getPos(e);
    ctx.beginPath();
    ctx.moveTo(pos.x, pos.y);
  });

  canvas.addEventListener('pointermove', (e) => {
    if (!drawing) return;
    const pos = getPos(e);
    ctx.lineTo(pos.x, pos.y);
    ctx.stroke();
  });

  canvas.addEventListener('pointerup', () => {
    drawing = false;
  });

  canvas.addEventListener('pointercancel', () => {
    drawing = false;
  });

  return () => {
    window.removeEventListener('resize', resizeCanvas);
  };
}