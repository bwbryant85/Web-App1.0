/* ════════════ PAINT ════════════ */
function initPaint() {
  const wrap = document.createElement('div');
  wrap.className = 'paint-wrap';
  content.appendChild(wrap);

  const toolbar = document.createElement('div');
  toolbar.className = 'paint-toolbar';
  toolbar.innerHTML = `
    <div class="paint-palette"></div>
    <div class="paint-controls">
      <label class="paint-label">Size</label>
      <input type="range" min="2" max="32" value="10" class="paint-size" />
      <button class="btn98 paint-clear">Clear</button>
      <button class="btn98 paint-save">Save</button>
    </div>
  `;
  wrap.appendChild(toolbar);

  const colors = ['#000000','#ffffff','#ff3b30','#ff9500','#ffcc00','#34c759','#0a84ff','#5e5ce6','#af52de'];
  const palette = toolbar.querySelector('.paint-palette');
  colors.forEach(color => {
    const swatch = document.createElement('button');
    swatch.className = 'paint-color';
    swatch.style.background = color;
    swatch.dataset.color = color;
    swatch.addEventListener('click', () => {
      brushColor = color;
      ctx.strokeStyle = brushColor;
      palette.querySelectorAll('.paint-color').forEach(c => c.classList.toggle('active', c === swatch));
    });
    palette.appendChild(swatch);
  });
  palette.firstChild.classList.add('active');

  const paintArea = document.createElement('div');
  paintArea.className = 'paint-area';
  const canvas = document.createElement('canvas');
  canvas.className = 'paint-canvas';
  paintArea.appendChild(canvas);
  wrap.appendChild(paintArea);

  const status = document.createElement('div');
  status.className = 'paint-status';
  status.textContent = 'Draw with your finger or mouse.';
  wrap.appendChild(status);

  const sizeInput = toolbar.querySelector('.paint-size');
  const clearBtn = toolbar.querySelector('.paint-clear');
  const saveBtn = toolbar.querySelector('.paint-save');

  const ctx = canvas.getContext('2d');
  let drawing = false;
  let brushColor = '#000000';
  let brushSize = parseInt(sizeInput.value, 10);
  let lastX = 0;
  let lastY = 0;

  function resizeCanvas() {
    const old = document.createElement('canvas');
    old.width = canvas.width;
    old.height = canvas.height;
    old.getContext('2d').drawImage(canvas, 0, 0);

    const rect = paintArea.getBoundingClientRect();
    canvas.width = Math.max(320, Math.floor(rect.width));
    canvas.height = Math.max(240, Math.floor(rect.height));
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(old, 0, 0, canvas.width, canvas.height);
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.lineWidth = brushSize;
    ctx.strokeStyle = brushColor;
  }

  function startDraw(x, y) {
    drawing = true;
    lastX = x;
    lastY = y;
    ctx.strokeStyle = brushColor;
    ctx.lineWidth = brushSize;
    ctx.beginPath();
    ctx.moveTo(x, y);
  }

  function drawLine(x, y) {
    if (!drawing) return;
    ctx.lineTo(x, y);
    ctx.stroke();
    lastX = x;
    lastY = y;
  }

  function stopDraw() {
    drawing = false;
  }

  function pointFromEvent(e) {
    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX || (e.touches && e.touches[0].clientX)) - rect.left;
    const y = (e.clientY || (e.touches && e.touches[0].clientY)) - rect.top;
    return { x, y };
  }

  const onDown = (e) => {
    e.preventDefault();
    canvas.setPointerCapture(e.pointerId);
    const p = pointFromEvent(e);
    startDraw(p.x, p.y);
  };
  const onMove = (e) => {
    if (!drawing) return;
    const p = pointFromEvent(e);
    drawLine(p.x, p.y);
  };
  const onSize = () => {
    brushSize = parseInt(sizeInput.value, 10);
    ctx.lineWidth = brushSize;
    status.textContent = 'Brush size: ' + brushSize;
  };
  const onClear = () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    status.textContent = 'Canvas cleared.';
  };
  const onSave = () => {
    const url = canvas.toDataURL('image/png');
    window.open(url, '_blank');
    status.textContent = 'Saved image opened in new tab.';
  };

  canvas.addEventListener('pointerdown', onDown);
  canvas.addEventListener('pointermove', onMove);
  canvas.addEventListener('pointerup', stopDraw);
  canvas.addEventListener('pointercancel', stopDraw);
  canvas.addEventListener('pointerleave', stopDraw);

  sizeInput.addEventListener('input', onSize);
  clearBtn.addEventListener('click', onClear);
  saveBtn.addEventListener('click', onSave);

  function initCanvas() {
    resizeCanvas();
    ctx.lineWidth = brushSize;
    ctx.strokeStyle = brushColor;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
  }

  const resizeObserver = new ResizeObserver(initCanvas);
  resizeObserver.observe(paintArea);

  initCanvas();

  return () => {
    canvas.removeEventListener('pointerdown', onDown);
    canvas.removeEventListener('pointermove', onMove);
    canvas.removeEventListener('pointerup', stopDraw);
    canvas.removeEventListener('pointercancel', stopDraw);
    canvas.removeEventListener('pointerleave', stopDraw);
    sizeInput.removeEventListener('input', onSize);
    clearBtn.removeEventListener('click', onClear);
    saveBtn.removeEventListener('click', onSave);
    resizeObserver.disconnect();
  };
}
