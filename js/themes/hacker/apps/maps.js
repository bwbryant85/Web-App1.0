/* ════════════════════════════════════════════════════════════
   MAPS v2 — Hacker Edition
   Leaflet + CartoDB Dark Matter  |  Nominatim geocoding
   Matrix rain overlay • Terminal chrome • Glitch effects
   ════════════════════════════════════════════════════════════ */

function initMaps98() {
  let mapInstance   = null;
  let currentMarker = null;
  let userMarker    = null;
  let leafletLoaded = false;
  let rainRaf       = null;

  /* ── Root ── */
  const root = document.createElement('div');
  root.style.cssText = 'width:100%;height:100%;display:flex;flex-direction:column;overflow:hidden;position:relative;background:#050d05;font-family:"Courier New",Courier,monospace;';
  content.appendChild(root);

  /* ── Header terminal bar ── */
  const header = document.createElement('div');
  header.style.cssText = 'display:flex;align-items:center;gap:8px;padding:5px 10px;background:#050d05;border-bottom:1px solid #00ff41;flex-shrink:0;';
  header.innerHTML = `
    <span style="color:#00ff41;font-size:11px;letter-spacing:0.1em;text-shadow:0 0 8px rgba(0,255,65,0.7);">MAP_SYS v2.0 // GEOSPATIAL TERMINAL</span>
    <span style="color:#00ff41;margin-left:auto;font-size:11px;animation:hkmap-blink 1s step-end infinite;" id="hkmap-cur">█</span>
    <style>@keyframes hkmap-blink{0%,100%{opacity:1}50%{opacity:0}}</style>
  `;
  root.appendChild(header);

  /* ── Search row ── */
  const searchRow = document.createElement('div');
  searchRow.style.cssText = 'display:flex;align-items:center;gap:6px;padding:5px 10px;background:#050d05;border-bottom:1px solid #003a0f;flex-shrink:0;';

  const prompt = document.createElement('span');
  prompt.style.cssText = 'color:#00ff41;font-size:12px;text-shadow:0 0 6px rgba(0,255,65,0.6);white-space:nowrap;';
  prompt.textContent = 'QUERY>';

  const searchInput = document.createElement('input');
  searchInput.type = 'text';
  searchInput.placeholder = 'enter location string...';
  searchInput.style.cssText = 'flex:1;background:transparent;border:none;outline:none;color:#00ff41;font-family:"Courier New",Courier,monospace;font-size:12px;caret-color:#00ff41;text-shadow:0 0 6px rgba(0,255,65,0.6);';

  function makeHkBtn(label) {
    const b = document.createElement('button');
    b.textContent = label;
    b.style.cssText = 'background:transparent;border:1px solid #00ff41;color:#00ff41;font-family:"Courier New",Courier,monospace;font-size:11px;padding:3px 8px;cursor:pointer;text-shadow:0 0 6px rgba(0,255,65,0.6);transition:all 0.1s;flex-shrink:0;';
    b.addEventListener('mouseenter', () => { b.style.background='#00ff41'; b.style.color='#050d05'; b.style.textShadow='none'; });
    b.addEventListener('mouseleave', () => { b.style.background='transparent'; b.style.color='#00ff41'; b.style.textShadow='0 0 6px rgba(0,255,65,0.6)'; });
    return b;
  }

  const execBtn = makeHkBtn('[EXEC]');
  const locBtn  = makeHkBtn('[GPS]');
  const zInBtn  = makeHkBtn('[+]');
  const zOutBtn = makeHkBtn('[-]');

  searchRow.appendChild(prompt);
  searchRow.appendChild(searchInput);
  searchRow.appendChild(execBtn);
  searchRow.appendChild(locBtn);
  searchRow.appendChild(zInBtn);
  searchRow.appendChild(zOutBtn);
  root.appendChild(searchRow);

  /* ── Map wrapper ── */
  const mapWrap = document.createElement('div');
  mapWrap.style.cssText = 'flex:1;position:relative;overflow:hidden;border:1px solid #003a0f;margin:4px;';

  const mapDiv = document.createElement('div');
  mapDiv.id = 'maps-hacker-' + Date.now();
  mapDiv.style.cssText = 'width:100%;height:100%;';
  mapWrap.appendChild(mapDiv);

  /* Matrix rain canvas */
  const rainCanvas = document.createElement('canvas');
  rainCanvas.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;pointer-events:none;z-index:700;opacity:0.12;';
  mapWrap.appendChild(rainCanvas);

  /* Scanlines */
  const scanlines = document.createElement('div');
  scanlines.style.cssText = 'position:absolute;inset:0;pointer-events:none;z-index:650;background:repeating-linear-gradient(to bottom,transparent 0px,transparent 1px,rgba(0,0,0,0.2) 2px,rgba(0,0,0,0.2) 2px);background-size:100% 2px;';
  mapWrap.appendChild(scanlines);

  /* Vignette */
  const vignette = document.createElement('div');
  vignette.style.cssText = 'position:absolute;inset:0;pointer-events:none;z-index:660;background:radial-gradient(ellipse at center,transparent 55%,rgba(0,0,0,0.65) 100%);';
  mapWrap.appendChild(vignette);

  /* Zoom buttons */
  const zoomWrap = document.createElement('div');
  zoomWrap.style.cssText = 'position:absolute;bottom:40px;right:10px;z-index:900;display:flex;flex-direction:column;gap:2px;';
  mapWrap.appendChild(zoomWrap);

  /* Loading screen */
  const loadScreen = document.createElement('div');
  loadScreen.style.cssText = 'position:absolute;inset:0;z-index:2000;background:#050d05;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:12px;';
  const loadLog = document.createElement('pre');
  loadLog.style.cssText = 'color:#00ff41;font-family:"Courier New",Courier,monospace;font-size:11px;margin:0;text-align:left;text-shadow:0 0 6px rgba(0,255,65,0.5);';
  loadLog.textContent = '> boot map_sys v2.0...\n> loading leaflet engine...\n> connecting tile servers...';
  const loadBar = document.createElement('div');
  loadBar.style.cssText = 'width:200px;height:6px;background:#001a07;border:1px solid #00ff41;overflow:hidden;';
  const loadFill = document.createElement('div');
  loadFill.style.cssText = 'height:100%;width:0%;background:#00ff41;transition:width 0.3s ease;box-shadow:0 0 8px rgba(0,255,65,0.6);';
  loadBar.appendChild(loadFill);
  loadScreen.appendChild(loadLog);
  loadScreen.appendChild(loadBar);
  mapWrap.appendChild(loadScreen);

  root.appendChild(mapWrap);

  /* ── Status bar ── */
  const statusBar = document.createElement('div');
  statusBar.style.cssText = 'padding:4px 10px;background:#050d05;border-top:1px solid #003a0f;font-size:10px;color:#00a829;font-family:"Courier New",Courier,monospace;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;flex-shrink:0;text-shadow:0 0 4px rgba(0,168,41,0.4);';
  statusBar.textContent = '> SYSTEM READY. AWAITING COORDINATES.';
  root.appendChild(statusBar);

  function setStatus(msg) { statusBar.textContent = '> ' + msg; }

  /* ── Matrix rain engine ── */
  function startRain() {
    cancelAnimationFrame(rainRaf);
    const ctx = rainCanvas.getContext('2d');
    let W, H, cols, drops;

    function resize() {
      W = rainCanvas.offsetWidth || 400;
      H = rainCanvas.offsetHeight || 600;
      rainCanvas.width  = W;
      rainCanvas.height = H;
      cols  = Math.floor(W / 14);
      drops = Array(cols).fill(1).map(() => Math.random() * H);
    }
    resize();

    const chars = '01アイウエオカキクケコサシスセソタチツテトナニヌネノ'.split('');
    function rain() {
      rainRaf = requestAnimationFrame(rain);
      ctx.fillStyle = 'rgba(5,13,5,0.04)';
      ctx.fillRect(0, 0, W, H);
      ctx.fillStyle = '#00ff41';
      ctx.font = '12px "Courier New",monospace';
      drops.forEach((y, i) => {
        const ch = chars[Math.floor(Math.random() * chars.length)];
        ctx.fillStyle = y < 20 ? '#aaffaa' : '#00ff41';
        ctx.fillText(ch, i * 14, y * 14);
        if (y * 14 > H && Math.random() > 0.975) drops[i] = 0;
        drops[i] += 0.35;
      });
    }
    rain();
  }

  /* ── Load Leaflet ── */
  function loadLeaflet(cb) {
    if (window.L && leafletLoaded) { cb(); return; }
    loadFill.style.width = '30%';
    if (!document.getElementById('leaflet-css-hacker')) {
      const lc = document.createElement('link');
      lc.id = 'leaflet-css-hacker'; lc.rel = 'stylesheet';
      lc.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
      document.head.appendChild(lc);
    }
    if (window.L) { leafletLoaded=true; loadFill.style.width='100%'; cb(); return; }
    const script = document.createElement('script');
    script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
    script.onload = () => {
      leafletLoaded = true;
      loadFill.style.width = '100%';
      loadLog.textContent += '\n> tile servers connected.\n> rendering map matrix...';
      setStatus('Engine loaded. Rendering...');
      setTimeout(cb, 400);
    };
    script.onerror = () => {
      loadLog.textContent += '\n> ERROR: NETWORK FAILURE';
      loadLog.style.color = '#ff4141';
    };
    document.head.appendChild(script);
  }

  /* ── Init map ── */
  function initLeafletMap() {
    loadScreen.style.opacity = '0';
    loadScreen.style.transition = 'opacity 0.5s ease';
    setTimeout(() => loadScreen.remove(), 500);

    const styleId = 'leaflet-hacker-ov-' + mapDiv.id;
    if (!document.getElementById(styleId)) {
      const st = document.createElement('style');
      st.id = styleId;
      st.textContent = `
        #${mapDiv.id} .leaflet-container { font-family:"Courier New",Courier,monospace; cursor:crosshair !important; }
        #${mapDiv.id} .leaflet-tile { filter:hue-rotate(108deg) saturate(0.35) brightness(0.75) contrast(1.25); }
        #${mapDiv.id} .leaflet-control-attribution { background:rgba(0,10,0,0.85) !important; color:#00a829 !important; font-family:"Courier New",monospace; font-size:9px !important; border:1px solid #003a0f; }
        #${mapDiv.id} .leaflet-control-attribution a { color:#00ff41 !important; }
        #${mapDiv.id} .leaflet-control-zoom { display:none; }
        #${mapDiv.id} .leaflet-popup-content-wrapper { background:rgba(0,10,0,0.94) !important; border:1px solid #00ff41 !important; border-radius:0 !important; box-shadow:0 0 20px rgba(0,255,65,0.25) !important; font-family:"Courier New",Courier,monospace; font-size:11px; color:#00ff41 !important; }
        #${mapDiv.id} .leaflet-popup-tip { background:#00ff41 !important; }
        #${mapDiv.id} .leaflet-popup-close-button { color:#00ff41 !important; }
        #${mapDiv.id} .leaflet-popup-content { color:#00ff41; text-shadow:0 0 6px rgba(0,255,65,0.5); }
      `;
      document.head.appendChild(st);
    }

    mapInstance = L.map(mapDiv.id, { zoomControl:false, attributionControl:true }).setView([40.7128,-74.006], 12);

    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
      attribution: '\u00a9 OSM \u00a9 CARTO',
      subdomains: 'abcd',
      maxZoom: 20,
    }).addTo(mapInstance);

    mapInstance.on('mousemove', (e) => { setStatus(`LAT:${e.latlng.lat.toFixed(5)}  LNG:${e.latlng.lng.toFixed(5)}`); });
    mapInstance.on('click', (e) => {
      placeMarker(e.latlng.lat, e.latlng.lng, `${e.latlng.lat.toFixed(5)}, ${e.latlng.lng.toFixed(5)}`);
      setStatus(`MARKER DROPPED: ${e.latlng.lat.toFixed(5)}, ${e.latlng.lng.toFixed(5)}`);
    });

    startRain();
    setStatus('MAP_SYS ONLINE. GEOSPATIAL DATA LOADED.');
  }

  /* ── Markers ── */
  function makeHackerMarker() {
    return L.divIcon({
      className:'',
      html:`<div style="position:relative;width:20px;height:20px;">
        <div style="width:20px;height:20px;border:2px solid #00ff41;transform:rotate(45deg);box-shadow:0 0 10px rgba(0,255,65,0.7),inset 0 0 6px rgba(0,255,65,0.2);background:rgba(0,10,0,0.8);"></div>
        <div style="position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);width:4px;height:4px;background:#00ff41;border-radius:50%;box-shadow:0 0 8px #00ff41;"></div>
      </div>`,
      iconSize:[20,20], iconAnchor:[10,10], popupAnchor:[0,-14],
    });
  }

  function makeHackerUserMarker() {
    return L.divIcon({
      className:'',
      html:`<div style="position:relative;width:24px;height:24px;display:flex;align-items:center;justify-content:center;">
        <div style="position:absolute;width:24px;height:24px;border-radius:50%;border:1px solid #00ff41;animation:hkmarker-ping 1.2s ease-out infinite;"></div>
        <div style="width:10px;height:10px;background:#00ff41;border-radius:50%;box-shadow:0 0 14px rgba(0,255,65,0.9);position:relative;z-index:1;"></div>
      </div>
      <style>@keyframes hkmarker-ping{0%{transform:scale(1);opacity:0.8}100%{transform:scale(2.4);opacity:0}}</style>`,
      iconSize:[24,24], iconAnchor:[12,12], popupAnchor:[0,-14],
    });
  }

  function placeMarker(lat, lng, label) {
    if (currentMarker) mapInstance.removeLayer(currentMarker);
    currentMarker = L.marker([lat,lng], { icon:makeHackerMarker() }).addTo(mapInstance).bindPopup(`<span>TARGET: ${label.toUpperCase()}</span>`).openPopup();
  }

  /* ── Search ── */
  function doSearch(query) {
    if (!query.trim() || !mapInstance) return;
    setStatus(`QUERYING NOMINATIM: "${query.toUpperCase()}"`);
    glitch();
    fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=1`, { headers:{'Accept-Language':'en'} })
      .then(r => r.json())
      .then(data => {
        if (!data || !data.length) { setStatus('ERROR: LOCATION NOT FOUND IN DATABASE'); showToast98&&showToast98('Location not found','error'); return; }
        const { lat, lon, display_name } = data[0];
        const la = parseFloat(lat), ln = parseFloat(lon);
        mapInstance.flyTo([la,ln], 14, { duration:1.2 });
        placeMarker(la, ln, display_name.split(',').slice(0,2).join(','));
        setStatus(`LOCATED: ${display_name.split(',').slice(0,2).join(',').toUpperCase()}`);
      })
      .catch(() => setStatus('ERROR: NETWORK FAILURE. RETRY.'));
  }

  /* ── Glitch flash ── */
  function glitch() {
    root.style.filter = 'hue-rotate(30deg) brightness(1.2)';
    setTimeout(() => { root.style.filter = ''; }, 80);
    setTimeout(() => { root.style.filter = 'hue-rotate(-20deg) brightness(0.9)'; }, 140);
    setTimeout(() => { root.style.filter = ''; }, 200);
  }

  /* ── Geolocation ── */
  function goToMyLocation() {
    if (!navigator.geolocation) { setStatus('ERROR: GEOLOCATION NOT AVAILABLE'); return; }
    setStatus('ACQUIRING GPS SIGNAL...');
    locBtn.textContent = '[...]';
    glitch();
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude:la, longitude:ln } = pos.coords;
        mapInstance.flyTo([la,ln], 16, { duration:1.5 });
        if (userMarker) mapInstance.removeLayer(userMarker);
        userMarker = L.marker([la,ln], { icon:makeHackerUserMarker() }).addTo(mapInstance).bindPopup(`<span>OPERATOR LOCATION: ${la.toFixed(5)}, ${ln.toFixed(5)}</span>`).openPopup();
        setStatus(`GPS LOCK ACQUIRED: ${la.toFixed(5)}, ${ln.toFixed(5)}`);
        locBtn.textContent = '[GPS]';
      },
      () => { setStatus('ERROR: GPS ACCESS DENIED'); locBtn.textContent='[GPS]'; },
      { timeout:8000 }
    );
  }

  /* ── Events ── */
  execBtn.addEventListener('click', () => doSearch(searchInput.value));
  searchInput.addEventListener('keydown', (e) => { if (e.key==='Enter') doSearch(searchInput.value); });
  locBtn.addEventListener('click', () => { if (mapInstance) goToMyLocation(); });
  zInBtn.addEventListener('click', () => mapInstance && mapInstance.zoomIn());
  zOutBtn.addEventListener('click', () => mapInstance && mapInstance.zoomOut());

  /* ── Boot ── */
  setTimeout(() => { loadFill.style.width='60%'; loadLog.textContent+='\n> tile servers connected...'; }, 300);
  loadLeaflet(() => initLeafletMap());

  return function cleanup() {
    cancelAnimationFrame(rainRaf);
    if (mapInstance) { try { mapInstance.remove(); } catch(e){} mapInstance=null; }
  };
}
