/* ════════════ CLOCK v8 MODERN ════════════
   Modern clock with glass effects
   ════════════════════════════════════ */

function initClock() {
  let timer = null;
  let currentMode = 'digital'; // 'digital' or 'analog'

  const c = window.content;
  c.style.cssText = 'width:100%;height:100%;display:flex;flex-direction:column;overflow:hidden;background:rgba(248,249,252,.92);border-radius:28px;';

  // Header
  const header = document.createElement('div');
  header.style.cssText = 'flex-shrink:0;padding:16px;background:rgba(255,255,255,.9);backdrop-filter:blur(20px);-webkit-backdrop-filter:blur(20px);border-bottom:1px solid rgba(15,23,42,.08);border-radius:28px 28px 0 0;display:flex;align-items:center;justify-content:space-between;';
  header.innerHTML = `
    <div style="display:flex;align-items:center;gap:8px;">
      <div style="font-size:1.5rem;">🕐</div>
      <div style="font-family:'Inter',sans-serif;font-size:1.2rem;color:#111;font-weight:600;">Clock</div>
    </div>
    <button id="mode-toggle" style="font-family:'Inter',sans-serif;font-size:.9rem;color:#111;background:#f8f9fa;border:1px solid rgba(15,23,42,.12);border-radius:16px;padding:6px 16px;cursor:pointer;-webkit-tap-highlight-color:transparent;">Analog</button>
  `;
  c.appendChild(header);

  // Clock area
  const clockArea = document.createElement('div');
  clockArea.style.cssText = 'flex:1;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:20px;';
  c.appendChild(clockArea);

  // Status
  const status = document.createElement('div');
  status.style.cssText = 'flex-shrink:0;padding:12px 16px;text-align:center;font-family:\'Inter\',sans-serif;font-size:.9rem;color:#666;background:rgba(255,255,255,.9);backdrop-filter:blur(20px);-webkit-backdrop-filter:blur(20px);border-top:1px solid rgba(15,23,42,.08);border-radius:0 0 28px 28px;';
  c.appendChild(status);

  const modeBtn = header.querySelector('#mode-toggle');

  function showDigital() {
    clearInterval(timer);
    clockArea.innerHTML = '';

    const digital = document.createElement('div');
    digital.style.cssText = 'text-align:center;';
    digital.innerHTML = `
      <div id="time" style="font-family:'Inter',sans-serif;font-size:3rem;color:#111;font-weight:300;margin-bottom:8px;">00:00:00</div>
      <div id="date" style="font-family:'Inter',sans-serif;font-size:1rem;color:#666;margin-bottom:20px;">Monday, January 1</div>
    `;
    clockArea.appendChild(digital);

    const tick = () => {
      const timeEl = document.getElementById('time');
      const dateEl = document.getElementById('date');
      if (!timeEl) return;

      const now = new Date();
      timeEl.textContent = now.toLocaleTimeString('en-US', {
        hour12: false,
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      });
      dateEl.textContent = now.toLocaleDateString('en-US', {
        weekday: 'long',
        month: 'long',
        day: 'numeric'
      });
    };

    tick();
    timer = setInterval(tick, 1000);
    status.textContent = 'Digital Clock';
  }

  function showAnalog() {
    clearInterval(timer);
    clockArea.innerHTML = '';

    const size = Math.min(clockArea.offsetWidth - 40, clockArea.offsetHeight - 40, 300);
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    canvas.style.cssText = `width:${size}px;height:${size}px;background:rgba(255,255,255,.9);backdrop-filter:blur(20px);-webkit-backdrop-filter:blur(20px);border-radius:50%;box-shadow:0 16px 40px rgba(15,23,42,.06);`;
    clockArea.appendChild(canvas);

    const ctx = canvas.getContext('2d');
    const centerX = size / 2;
    const centerY = size / 2;
    const radius = size * 0.4;

    function drawClock() {
      ctx.clearRect(0, 0, size, size);

      // Draw outer circle
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
      ctx.strokeStyle = '#4a90d9';
      ctx.lineWidth = 3;
      ctx.stroke();

      // Draw hour markers
      for (let i = 0; i < 12; i++) {
        const angle = (i * Math.PI) / 6;
        const x1 = centerX + Math.cos(angle) * (radius - 15);
        const y1 = centerY + Math.sin(angle) * (radius - 15);
        const x2 = centerX + Math.cos(angle) * (radius - 25);
        const y2 = centerY + Math.sin(angle) * (radius - 25);

        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.strokeStyle = '#111';
        ctx.lineWidth = 2;
        ctx.stroke();
      }

      // Draw minute markers
      for (let i = 0; i < 60; i++) {
        if (i % 5 !== 0) {
          const angle = (i * Math.PI) / 30;
          const x1 = centerX + Math.cos(angle) * (radius - 10);
          const y1 = centerY + Math.sin(angle) * (radius - 10);
          const x2 = centerX + Math.cos(angle) * (radius - 15);
          const y2 = centerY + Math.sin(angle) * (radius - 15);

          ctx.beginPath();
          ctx.moveTo(x1, y1);
          ctx.lineTo(x2, y2);
          ctx.strokeStyle = '#666';
          ctx.lineWidth = 1;
          ctx.stroke();
        }
      }

      const now = new Date();
      const hours = now.getHours() % 12;
      const minutes = now.getMinutes();
      const seconds = now.getSeconds();

      // Hour hand
      const hourAngle = ((hours + minutes / 60) * Math.PI) / 6;
      ctx.beginPath();
      ctx.moveTo(centerX, centerY);
      ctx.lineTo(centerX + Math.cos(hourAngle - Math.PI / 2) * radius * 0.5,
                centerY + Math.sin(hourAngle - Math.PI / 2) * radius * 0.5);
      ctx.strokeStyle = '#111';
      ctx.lineWidth = 4;
      ctx.stroke();

      // Minute hand
      const minuteAngle = (minutes * Math.PI) / 30;
      ctx.beginPath();
      ctx.moveTo(centerX, centerY);
      ctx.lineTo(centerX + Math.cos(minuteAngle - Math.PI / 2) * radius * 0.7,
                centerY + Math.sin(minuteAngle - Math.PI / 2) * radius * 0.7);
      ctx.strokeStyle = '#111';
      ctx.lineWidth = 3;
      ctx.stroke();

      // Second hand
      const secondAngle = (seconds * Math.PI) / 30;
      ctx.beginPath();
      ctx.moveTo(centerX, centerY);
      ctx.lineTo(centerX + Math.cos(secondAngle - Math.PI / 2) * radius * 0.8,
                centerY + Math.sin(secondAngle - Math.PI / 2) * radius * 0.8);
      ctx.strokeStyle = '#ff3b30';
      ctx.lineWidth = 1;
      ctx.stroke();

      // Center dot
      ctx.beginPath();
      ctx.arc(centerX, centerY, 5, 0, 2 * Math.PI);
      ctx.fillStyle = '#111';
      ctx.fill();
    }

    drawClock();
    timer = setInterval(drawClock, 1000);
    status.textContent = 'Analog Clock';
  }

  function toggleMode() {
    currentMode = currentMode === 'digital' ? 'analog' : 'digital';
    modeBtn.textContent = currentMode === 'digital' ? 'Analog' : 'Digital';
    if (currentMode === 'digital') {
      showDigital();
    } else {
      showAnalog();
    }
  }

  modeBtn.onclick = toggleMode;

  // Start with digital
  showDigital();

  return () => {
    clearInterval(timer);
  };
}