/* ════════════ DEVICE INFO ════════════ */
function initDeviceInfo() {
  const wrap = document.createElement('div');
  // Dynamic Island safe zone: padding-top matches 89px enforced everywhere else
  wrap.style.cssText = 'width:100%;height:100%;overflow-y:auto;-webkit-overflow-scrolling:touch;background:#050508;padding:89px 16px calc(var(--sb,0px) + 50px);display:flex;flex-direction:column;gap:12px;box-sizing:border-box;';
  content.appendChild(wrap);

  const titleEl = document.createElement('div');
  titleEl.style.cssText = 'font-family:"Orbitron",sans-serif;font-size:.52rem;letter-spacing:.28em;text-transform:uppercase;color:var(--dim);margin-bottom:2px;flex-shrink:0;';
  titleEl.textContent = '// Device Info //';
  wrap.appendChild(titleEl);

  /* ── Helpers ── */
  const section = label => {
    const s = document.createElement('div');
    s.style.cssText = 'background:rgba(255,255,255,.03);border:1px solid rgba(255,255,255,.06);border-radius:16px;overflow:hidden;flex-shrink:0;';
    const hdr = document.createElement('div');
    hdr.style.cssText = 'font-family:"Orbitron",sans-serif;font-size:.46rem;letter-spacing:.2em;text-transform:uppercase;color:var(--dim);padding:10px 14px 8px;border-bottom:1px solid rgba(255,255,255,.05);';
    hdr.textContent = label;
    s.appendChild(hdr);
    wrap.appendChild(s);
    return s;
  };

  const row = (parent, key, value, accent) => {
    const r = document.createElement('div');
    r.style.cssText = 'display:flex;justify-content:space-between;align-items:flex-start;gap:10px;padding:9px 14px;border-bottom:1px solid rgba(255,255,255,.03);';
    r.innerHTML = `
      <span style="font-family:'Share Tech Mono',monospace;font-size:.58rem;color:var(--dim);flex-shrink:0;">${key}</span>
      <span style="font-family:'Share Tech Mono',monospace;font-size:.58rem;color:${accent||'var(--text)'};text-align:right;word-break:break-word;max-width:65%;">${value}</span>`;
    parent.appendChild(r);
    return r;
  };

  const ua = navigator.userAgent;
  const isIOS = /iPhone|iPad|iPod/.test(ua);
  const isAndroid = /Android/.test(ua);

  /* ── iPhone model from screen dimensions ── */
  const getIPhoneModel = () => {
    if (!/iPhone/.test(ua)) return null;
    // Use physical screen pixels
    const sw = screen.width, sh = screen.height;
    const w = Math.min(sw, sh), h = Math.max(sw, sh);
    const r = window.devicePixelRatio || 1;
    // Map physical px (not CSS px) — multiply by DPR
    const pw = Math.round(w * r), ph = Math.round(h * r);
    const models = {
      // width × height @ dpr
      '1179x2556': 'iPhone 15 Pro / 14 Pro',
      '1290x2796': 'iPhone 15 Pro Max / 14 Pro Max',
      '1170x2532': 'iPhone 15 / 14 / 13 / 12',
      '1284x2778': 'iPhone 14 Plus / 13 Pro Max / 12 Pro Max',
      '1080x2340': 'iPhone 13 / 12 Mini',
      '1125x2436': 'iPhone X / XS / 11 Pro',
      '828x1792':  'iPhone XR / 11',
      '1242x2688': 'iPhone XS Max / 11 Pro Max',
      '750x1334':  'iPhone SE (2nd/3rd) / 8 / 7 / 6S',
      '1242x2208': 'iPhone 8 Plus / 7 Plus / 6S Plus',
      '640x1136':  'iPhone SE (1st gen)',
      '1179x2556x3': 'iPhone 15 Pro / 14 Pro',  // fallback with dpr
      // CSS px based fallback
    };
    // Try physical pixels first
    const physKey = `${pw}x${ph}`;
    if (models[physKey]) return models[physKey];
    // Try CSS px × dpr rounded
    const cssKey = `${w}x${h}`;
    const cssDprModels = {
      '393x852': 'iPhone 15 / 14 Pro / 15 Pro',
      '390x844': 'iPhone 14 / 13 / 12',
      '430x932': 'iPhone 14 Plus / 15 Plus',
      '428x926': 'iPhone 13 Pro Max / 12 Pro Max',
      '375x812': 'iPhone X / XS / 11 Pro / 12 Mini / 13 Mini',
      '414x896': 'iPhone XR / 11 / XS Max / 11 Pro Max',
      '414x736': 'iPhone 8 Plus / 7 Plus',
      '375x667': 'iPhone SE (2nd/3rd gen) / 8 / 7',
      '320x568': 'iPhone SE (1st gen)',
      '402x874': 'iPhone 16 Pro',
      '440x956': 'iPhone 16 Pro Max',
      '460x1004': 'iPhone 16 / 16 Plus',
    };
    return cssDprModels[cssKey] || `iPhone (${w}×${h})`;
  };

  /* ── OS version ── */
  const getOS = () => {
    if (isIOS) {
      const m = ua.match(/OS (\d+[_\d]+)/);
      return m ? 'iOS ' + m[1].replace(/_/g, '.') : 'iOS';
    }
    if (isAndroid) {
      const m = ua.match(/Android ([\d.]+)/);
      return m ? 'Android ' + m[1] : 'Android';
    }
    if (/Mac OS X/.test(ua)) {
      const m = ua.match(/Mac OS X ([\d_]+)/);
      return m ? 'macOS ' + m[1].replace(/_/g,'.') : 'macOS';
    }
    if (/Windows/.test(ua)) return 'Windows';
    return 'Unknown';
  };

  /* ── Browser ── */
  const getBrowser = () => {
    if (/CriOS/.test(ua))         return 'Chrome (iOS)';
    if (/FxiOS/.test(ua))         return 'Firefox (iOS)';
    if (/EdgA|EdgiOS/.test(ua))   return 'Edge (iOS)';
    if (/OPiOS/.test(ua))         return 'Opera (iOS)';
    if (/Firefox/.test(ua))       return 'Firefox';
    if (/Edg\//.test(ua))         return 'Edge';
    if (/Chrome/.test(ua))        return 'Chrome';
    if (/Safari/.test(ua))        return 'Safari';
    return 'Unknown';
  };

  const getBrowserVer = () => {
    const patterns = [/CriOS\/([\d.]+)/, /FxiOS\/([\d.]+)/, /EdgA\/([\d.]+)/, /Firefox\/([\d.]+)/, /Edg\/([\d.]+)/, /Chrome\/([\d.]+)/, /Version\/([\d.]+)/];
    for (const p of patterns) { const m = ua.match(p); if (m) return m[1]; }
    return '—';
  };

  /* ── GPU via WebGL ── */
  const getGPU = () => {
    try {
      const c = document.createElement('canvas');
      const g = c.getContext('webgl') || c.getContext('experimental-webgl');
      if (!g) return 'WebGL not available';
      const ext = g.getExtension('WEBGL_debug_renderer_info');
      if (ext) {
        const r = g.getParameter(ext.UNMASKED_RENDERER_WEBGL);
        // Safari on iOS returns "Apple GPU" — that's correct, not made up
        return r || g.getParameter(g.RENDERER);
      }
      return g.getParameter(g.RENDERER);
    } catch(e) { return 'Unknown'; }
  };

  /* ══ BUILD SECTIONS ══ */

  /* ── Device & Browser ── */
  const devSec = section('📱 Device & Browser');
  const platform = isIOS
    ? (getIPhoneModel() || 'iOS Device')
    : isAndroid ? 'Android Device'
    : /iPad/.test(ua) ? 'iPad'
    : 'Desktop';
  row(devSec, 'Platform',        platform,          'var(--cyan)');
  row(devSec, 'OS Version',      getOS());
  row(devSec, 'Browser',         getBrowser());
  row(devSec, 'Browser Version', getBrowserVer());
  row(devSec, 'Language',        navigator.language || '—');
  row(devSec, 'Timezone',        Intl.DateTimeFormat().resolvedOptions().timeZone || '—');

  /* ── Display ── */
  const dispSec = section('🖥️ Display');
  // screen.width/height are in CSS px on iOS, multiply by DPR for physical
  row(dispSec, 'CSS Viewport',   `${window.innerWidth} × ${window.innerHeight} px`);
  row(dispSec, 'Screen (CSS px)',`${screen.width} × ${screen.height} px`);
  row(dispSec, 'Physical px',    `${Math.round(screen.width * window.devicePixelRatio)} × ${Math.round(screen.height * window.devicePixelRatio)} px`);
  row(dispSec, 'Pixel Ratio',    `${window.devicePixelRatio}× (≈${Math.round(window.devicePixelRatio * 160)} PPI)`);
  row(dispSec, 'Color Depth',    `${screen.colorDepth}-bit`);
  const orient = screen.orientation ? screen.orientation.type.split('-')[0] : (window.innerWidth > window.innerHeight ? 'landscape' : 'portrait');
  row(dispSec, 'Orientation',    orient.charAt(0).toUpperCase() + orient.slice(1));
  row(dispSec, 'HDR',            window.matchMedia('(dynamic-range: high)').matches ? 'Supported' : 'Standard');
  row(dispSec, 'Dark Mode Pref', window.matchMedia('(prefers-color-scheme: dark)').matches ? 'Dark' : 'Light');

  /* ── Hardware ── */
  const hwSec = section('⚙️ Hardware');
  // navigator.hardwareConcurrency — Safari does expose this
  const cores = navigator.hardwareConcurrency;
  row(hwSec, 'CPU Cores',    cores ? `${cores} logical cores` : 'Not reported');
  // navigator.deviceMemory — Safari does NOT expose this (returns undefined)
  // Honest: only Chrome exposes it
  row(hwSec, 'RAM',          navigator.deviceMemory ? `≥${navigator.deviceMemory} GB` : 'Not exposed by Safari');
  row(hwSec, 'Touch Points', `${navigator.maxTouchPoints}`);
  row(hwSec, 'GPU',          getGPU(), 'var(--mag)');
  const gl2 = !!document.createElement('canvas').getContext('webgl2');
  row(hwSec, 'WebGL',        gl2 ? 'WebGL 2.0' : 'WebGL 1.0');

  /* ── Network ── */
  const netSec = section('🌐 Network');
  // Network Information API — only Chrome/Android, not Safari
  const conn = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
  if (conn && conn.effectiveType) {
    row(netSec, 'Connection',  conn.effectiveType.toUpperCase());
    row(netSec, 'Downlink',    conn.downlink ? `~${conn.downlink} Mbps` : '—');
    row(netSec, 'RTT',         conn.rtt != null ? `${conn.rtt} ms` : '—');
    row(netSec, 'Data Saver',  conn.saveData ? 'On' : 'Off');
  } else {
    row(netSec, 'Online',      navigator.onLine ? 'Yes' : 'No', navigator.onLine ? '#69ff47' : '#ff6b6b');
    row(netSec, 'Network API', 'Not available in Safari');
  }

  /* ── Battery ── */
  // Battery API: not supported in Safari (never has been). Show a clear note.
  const batSec = section('🔋 Battery');
  if (navigator.getBattery) {
    const lvlRow = row(batSec, 'Level',          '…');
    const stRow  = row(batSec, 'Status',         '…');
    navigator.getBattery().then(b => {
      const upd = () => {
        const pct = Math.round(b.level * 100);
        lvlRow.querySelector('span:last-child').textContent = `${pct}%`;
        lvlRow.querySelector('span:last-child').style.color = pct > 50 ? '#69ff47' : pct > 20 ? '#ffd740' : '#ff6b6b';
        stRow.querySelector('span:last-child').textContent = b.charging ? '⚡ Charging' : '🔋 Discharging';
      };
      upd();
      b.addEventListener('chargingchange', upd);
      b.addEventListener('levelchange', upd);
    }).catch(() => {
      lvlRow.querySelector('span:last-child').textContent = 'Not available';
    });
  } else {
    row(batSec, 'Battery API', 'Not supported in Safari — use the status bar');
  }

  /* ── Storage ── */
  const storSec = section('💾 Storage');
  if (navigator.storage && navigator.storage.estimate) {
    const qRow = row(storSec, 'Quota',     '…');
    const uRow = row(storSec, 'Used',      '…');
    const aRow = row(storSec, 'Available', '…', 'var(--cyan)');
    navigator.storage.estimate().then(est => {
      const fmt = b => b >= 1e9 ? (b/1e9).toFixed(1)+' GB' : b >= 1e6 ? (b/1e6).toFixed(0)+' MB' : (b/1e3).toFixed(0)+' KB';
      qRow.querySelector('span:last-child').textContent = fmt(est.quota || 0);
      uRow.querySelector('span:last-child').textContent = fmt(est.usage || 0);
      aRow.querySelector('span:last-child').textContent = fmt((est.quota||0)-(est.usage||0));
    });
  } else {
    row(storSec, 'Storage API', 'Not supported');
  }

  /* ── APIs & Sensors ── */
  const sensSec = section('🔬 APIs & Sensors');
  const chk = (label, val, note) => {
    const r = row(sensSec, label, val ? '✓ Available' : '✗ Not available', val ? '#69ff47' : '#ff6b6b');
    if (note && !val) {
      r.querySelector('span:last-child').title = note;
    }
  };
  chk('Geolocation',    !!navigator.geolocation);
  chk('Gyroscope',      typeof DeviceOrientationEvent !== 'undefined');
  chk('Accelerometer',  typeof DeviceMotionEvent !== 'undefined');
  chk('Camera',         !!(navigator.mediaDevices));
  chk('Microphone',     !!(navigator.mediaDevices));
  chk('Vibration',      !!navigator.vibrate,      'Not supported in Safari');
  chk('Web Share',      !!navigator.share);
  chk('Notifications',  typeof Notification !== 'undefined');
  chk('Service Worker', !!navigator.serviceWorker);
  chk('Web Bluetooth',  !!navigator.bluetooth,    'Requires Chrome/Edge');
  chk('WebGL 2',        !!document.createElement('canvas').getContext('webgl2'));

  /* ── Misc ── */
  const miscSec = section('ℹ️ Misc');
  row(miscSec, 'Cookies',      navigator.cookieEnabled ? 'Enabled' : 'Disabled');
  row(miscSec, 'Do Not Track', navigator.doNotTrack === '1' ? 'On' : 'Off');
  // JS heap — Chrome only, Safari won't have it
  const heap = (performance && performance.memory) ? performance.memory.jsHeapSizeLimit : null;
  if (heap) row(miscSec, 'JS Heap Limit', `${Math.round(heap/1e6)} MB`);
  // Reduce user agent to key parts only
  const shortUA = ua.replace(/\(.*?\)/g, '').replace(/\s+/g,' ').trim().slice(0, 100);
  row(miscSec, 'User Agent', shortUA);

  return () => {};
}
