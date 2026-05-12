/* ════════════════════════════════════════════════════════════
   MAPS v3.0 — Modern (Windows 11 / Apple Maps style)
   MapLibre GL JS + OpenFreeMap | Nominatim geocoding
   Real WebGL 3D buildings • Satellite (Esri) • Glass UI
   ════════════════════════════════════════════════════════════ */

function initMaps98() {
  let mapInstance   = null;
  let currentMarker = null;
  let userMarker    = null;
  let libLoaded     = false;
  let currentMode   = 'map';   // 'map' | 'satellite'
  let is3D          = false;

  /* Tile sources */
  const STYLE_ROAD = 'https://tiles.openfreemap.org/styles/liberty';
  const SAT_TILES  = 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}';

  /* ── Root ── */
  const root = document.createElement('div');
  root.style.cssText = 'width:100%;height:100%;display:flex;flex-direction:column;overflow:hidden;position:relative;background:#f2f2f7;font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",system-ui,sans-serif;border-radius:12px;';
  content.appendChild(root);

  const mapDiv = document.createElement('div');
  mapDiv.id = 'maps-mod-' + Date.now();
  mapDiv.style.cssText = 'width:100%;height:100%;position:absolute;inset:0;border-radius:12px;overflow:hidden;';
  root.appendChild(mapDiv);

  /* ── Search bar ── */
  const searchCard = document.createElement('div');
  searchCard.style.cssText = 'position:absolute;top:16px;left:50%;transform:translateX(-50%);z-index:1000;width:calc(100% - 32px);max-width:380px;background:rgba(255,255,255,0.92);backdrop-filter:blur(20px) saturate(180%);-webkit-backdrop-filter:blur(20px) saturate(180%);border-radius:16px;box-shadow:0 4px 24px rgba(0,0,0,0.12),0 1px 4px rgba(0,0,0,0.08);overflow:visible;';

  const searchRow = document.createElement('div');
  searchRow.style.cssText = 'display:flex;align-items:center;padding:10px 14px;gap:10px;';

  const searchIcon = document.createElement('span');
  searchIcon.textContent = '🔍';
  searchIcon.style.cssText = 'font-size:16px;flex-shrink:0;opacity:0.55;';

  const searchInput = document.createElement('input');
  searchInput.type = 'text';
  searchInput.placeholder = 'Search Maps';
  searchInput.style.cssText = 'flex:1;border:none;outline:none;background:transparent;font-size:16px;font-family:inherit;color:#1c1c1e;';

  const clearBtn = document.createElement('button');
  clearBtn.textContent = '✕';
  clearBtn.style.cssText = 'border:none;background:rgba(0,0,0,0.09);color:#48484a;width:20px;height:20px;border-radius:50%;cursor:pointer;font-size:11px;display:none;align-items:center;justify-content:center;flex-shrink:0;padding:0;';

  searchRow.appendChild(searchIcon);
  searchRow.appendChild(searchInput);
  searchRow.appendChild(clearBtn);
  searchCard.appendChild(searchRow);

  const divider = document.createElement('div');
  divider.style.cssText = 'height:1px;background:rgba(0,0,0,0.07);margin:0 14px;display:none;';
  searchCard.appendChild(divider);

  const suggestList = document.createElement('div');
  suggestList.style.cssText = 'max-height:220px;overflow-y:auto;display:none;';
  searchCard.appendChild(suggestList);
  root.appendChild(searchCard);

  /* ── Segmented Map / Satellite / 3D control ── */
  const viewControl = document.createElement('div');
  viewControl.style.cssText = 'position:absolute;top:84px;left:50%;transform:translateX(-50%);z-index:1000;display:flex;background:rgba(255,255,255,0.88);backdrop-filter:blur(20px) saturate(180%);-webkit-backdrop-filter:blur(20px) saturate(180%);border-radius:10px;box-shadow:0 2px 12px rgba(0,0,0,0.14);overflow:hidden;';

  function makeSegBtn(label, active) {
    const b = document.createElement('button');
    b.textContent = label;
    b.dataset.label = label;
    b.style.cssText = `border:none;cursor:pointer;padding:7px 14px;font-family:inherit;font-size:13px;font-weight:${active?'600':'400'};background:${active?'#007aff':'transparent'};color:${active?'#fff':'#1c1c1e'};transition:all 0.2s ease;`;
    return b;
  }
  function makeSep() {
    const s = document.createElement('div');
    s.style.cssText = 'width:1px;background:rgba(0,0,0,0.12);margin:6px 0;flex-shrink:0;';
    return s;
  }

  const mapBtn = makeSegBtn('Map', true);
  const satBtn = makeSegBtn('Satellite', false);
  const btn3D  = makeSegBtn('3D', false);
  viewControl.appendChild(mapBtn);
  viewControl.appendChild(makeSep());
  viewControl.appendChild(satBtn);
  viewControl.appendChild(makeSep());
  viewControl.appendChild(btn3D);
  root.appendChild(viewControl);

  /* ── Bottom pill ── */
  const bottomPill = document.createElement('div');
  bottomPill.style.cssText = 'position:absolute;bottom:24px;left:50%;transform:translateX(-50%);z-index:1000;display:flex;align-items:center;background:rgba(255,255,255,0.92);backdrop-filter:blur(20px) saturate(180%);-webkit-backdrop-filter:blur(20px) saturate(180%);border-radius:22px;box-shadow:0 4px 20px rgba(0,0,0,0.14);overflow:hidden;';

  function makePillBtn(icon, label) {
    const btn = document.createElement('button');
    btn.style.cssText = 'border:none;background:transparent;cursor:pointer;padding:10px 18px;display:flex;flex-direction:column;align-items:center;gap:3px;font-family:inherit;color:#007aff;font-size:10px;font-weight:500;transition:background 0.15s ease;border-right:1px solid rgba(0,0,0,0.07);';
    btn.innerHTML = `<span style="font-size:18px;">${icon}</span><span>${label}</span>`;
    btn.addEventListener('pointerdown', () => btn.style.background='rgba(0,122,255,0.08)');
    btn.addEventListener('pointerup',   () => btn.style.background='transparent');
    btn.addEventListener('pointerleave',() => btn.style.background='transparent');
    return btn;
  }
  const locBtn     = makePillBtn('📍', 'Location');
  const zoomInBtn  = makePillBtn('＋', 'Zoom In');
  const zoomOutBtn = makePillBtn('－', 'Zoom Out');
  zoomOutBtn.style.borderRight = 'none';
  [locBtn,zoomInBtn,zoomOutBtn].forEach(b=>bottomPill.appendChild(b));
  root.appendChild(bottomPill);

  /* ── Status toast ── */
  const statusChip = document.createElement('div');
  statusChip.style.cssText = 'position:absolute;bottom:88px;left:50%;transform:translateX(-50%) translateY(8px);z-index:1000;background:rgba(28,28,30,0.82);color:#fff;backdrop-filter:blur(16px);-webkit-backdrop-filter:blur(16px);border-radius:20px;padding:7px 16px;font-size:13px;font-weight:500;white-space:nowrap;pointer-events:none;opacity:0;transition:opacity 0.25s ease,transform 0.25s ease;max-width:calc(100% - 48px);text-align:center;';
  root.appendChild(statusChip);

  let statusTimer = null;
  function showStatus(msg, dur) {
    statusChip.textContent = msg;
    statusChip.style.opacity = '1';
    statusChip.style.transform = 'translateX(-50%) translateY(0)';
    clearTimeout(statusTimer);
    if ((dur ?? 3000) > 0) statusTimer = setTimeout(()=>{
      statusChip.style.opacity='0';
      statusChip.style.transform='translateX(-50%) translateY(8px)';
    }, dur ?? 3000);
  }

  /* ── Loading screen ── */
  const loadScreen = document.createElement('div');
  loadScreen.style.cssText = 'position:absolute;inset:0;z-index:2000;background:#f2f2f7;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:16px;border-radius:12px;';
  loadScreen.innerHTML = `
    <div style="font-size:52px;animation:maps-float 1.6s ease-in-out infinite alternate;">🗺️</div>
    <div style="font-size:17px;font-weight:600;color:#1c1c1e;letter-spacing:-0.02em;">Maps</div>
    <div style="font-size:13px;color:#8e8e93;">Loading…</div>
    <div style="width:200px;height:4px;background:#e5e5ea;border-radius:2px;overflow:hidden;margin-top:4px;">
      <div id="maps-mod-prog" style="height:100%;width:0%;background:linear-gradient(90deg,#007aff,#5ac8fa);border-radius:2px;transition:width 0.3s ease;"></div>
    </div>
    <style>@keyframes maps-float{0%{transform:translateY(0) scale(1)}100%{transform:translateY(-10px) scale(1.04)}}</style>
  `;
  root.appendChild(loadScreen);

  /* ── Load MapLibre GL JS ── */
  function loadMapLibre(cb) {
    if (window.maplibregl && libLoaded) { cb(); return; }
    const prog = document.getElementById('maps-mod-prog');
    if (prog) prog.style.width = '25%';

    if (!document.getElementById('maplibre-css')) {
      const lc = document.createElement('link');
      lc.id = 'maplibre-css'; lc.rel = 'stylesheet';
      lc.href = 'https://unpkg.com/maplibre-gl@4.7.1/dist/maplibre-gl.css';
      document.head.appendChild(lc);
    }

    if (window.maplibregl) { libLoaded=true; if(prog) prog.style.width='100%'; cb(); return; }

    const script = document.createElement('script');
    script.src = 'https://unpkg.com/maplibre-gl@4.7.1/dist/maplibre-gl.js';
    script.onload = () => {
      libLoaded = true;
      if (prog) prog.style.width = '100%';
      setTimeout(cb, 300);
    };
    script.onerror = () => {
      loadScreen.innerHTML = '<div style="font-size:40px;">⚠️</div><div style="font-size:16px;font-weight:600;color:#1c1c1e;">Connection Error</div><div style="font-size:13px;color:#8e8e93;text-align:center;max-width:220px;">Unable to load Maps.</div>';
    };
    document.head.appendChild(script);
  }

  /* ── Init MapLibre ── */
  function initMapLibre() {
    loadScreen.style.opacity = '0';
    loadScreen.style.transition = 'opacity 0.4s ease';
    setTimeout(() => loadScreen.remove(), 400);

    /* Inject MapLibre CSS overrides */
    const sid = 'maplibre-mod-ov-' + mapDiv.id;
    if (!document.getElementById(sid)) {
      const st = document.createElement('style');
      st.id = sid;
      st.textContent = `
        #${mapDiv.id} .maplibregl-ctrl-attrib { font-size:10px; background:rgba(255,255,255,0.75) !important; backdrop-filter:blur(8px); border-radius:8px 0 0 0 !important; }
        #${mapDiv.id} .maplibregl-ctrl-attrib a { color:#007aff !important; }
        #${mapDiv.id} .maplibregl-ctrl-bottom-right { display:none; }
        #${mapDiv.id} .maplibregl-popup-content { background:rgba(255,255,255,0.95) !important; backdrop-filter:blur(20px) !important; -webkit-backdrop-filter:blur(20px) !important; border-radius:14px !important; box-shadow:0 8px 32px rgba(0,0,0,0.16) !important; border:none !important; font-family:-apple-system,BlinkMacSystemFont,system-ui,sans-serif; font-size:14px; color:#1c1c1e; padding:12px 16px !important; }
        #${mapDiv.id} .maplibregl-popup-tip { border-top-color:rgba(255,255,255,0.95) !important; }
        #${mapDiv.id} .maplibregl-popup-close-button { color:#8e8e93; font-size:18px; top:8px; right:10px; }
        #${mapDiv.id} .maplibregl-canvas { border-radius:12px; }
      `;
      document.head.appendChild(st);
    }

    mapInstance = new maplibregl.Map({
      container: mapDiv.id,
      style: STYLE_ROAD,
      center: [-74.006, 40.7128],
      zoom: 13,
      pitch: 0,
      bearing: 0,
      antialias: true,
    });

    mapInstance.on('load', () => {
      showStatus('Maps loaded', 2000);
    });

    mapInstance.on('click', (e) => {
      const { lng, lat } = e.lngLat;
      placeMarker(lat, lng, `${lat.toFixed(5)}, ${lng.toFixed(5)}`);
    });
  }

  /* ── Satellite style (raster override) ── */
  function buildSatelliteStyle() {
    return {
      version: 8,
      sources: {
        'esri-sat': {
          type: 'raster',
          tiles: [`https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}`],
          tileSize: 256,
          attribution: '© Esri, Maxar, Earthstar Geographics',
          maxzoom: 19,
        },
      },
      layers: [{ id:'sat-tiles', type:'raster', source:'esri-sat', minzoom:0, maxzoom:20 }],
    };
  }

  /* ── Set map/satellite mode ── */
  function setMode(mode) {
    if (!mapInstance) return;
    currentMode = mode;

    /* Update seg buttons */
    [mapBtn, satBtn].forEach(b => {
      const active = (mode === 'map' && b.dataset.label === 'Map') || (mode === 'satellite' && b.dataset.label === 'Satellite');
      b.style.background = active ? '#007aff' : 'transparent';
      b.style.color      = active ? '#fff'    : '#1c1c1e';
      b.style.fontWeight = active ? '600'     : '400';
    });

    if (mode === 'map') {
      showStatus('Map view', 1500);
      mapInstance.setStyle(STYLE_ROAD);
      mapInstance.once('style.load', () => {
        if (is3D) enable3DBuildings();
      });
    } else {
      showStatus('Satellite view', 1500);
      mapInstance.setStyle(buildSatelliteStyle());
    }
  }

  /* ── 3D buildings via fill-extrusion ── */
  function enable3DBuildings() {
    if (!mapInstance || !mapInstance.getStyle()) return;
    /* OpenFreeMap liberty style has building data in 'building' layer */
    if (!mapInstance.getLayer('3d-buildings')) {
      try {
        mapInstance.addLayer({
          id: '3d-buildings',
          source: 'openmaptiles',
          'source-layer': 'building',
          type: 'fill-extrusion',
          minzoom: 14,
          paint: {
            'fill-extrusion-color': [
              'interpolate', ['linear'], ['get', 'render_height'],
              0,  '#e8e4dc',
              50, '#d4cfc5',
              100,'#c5bfb3',
            ],
            'fill-extrusion-height': ['coalesce', ['get', 'render_height'], ['get', 'height'], 10],
            'fill-extrusion-base':   ['coalesce', ['get', 'render_min_height'], 0],
            'fill-extrusion-opacity': 0.88,
            'fill-extrusion-ambient-occlusion-intensity': 0.4,
          },
        });
      } catch(e) { /* style not ready yet */ }
    }
  }

  function disable3DBuildings() {
    if (!mapInstance) return;
    try { if (mapInstance.getLayer('3d-buildings')) mapInstance.removeLayer('3d-buildings'); } catch(e){}
  }

  /* ── Toggle 3D ── */
  function toggle3D() {
    if (!mapInstance) return;
    is3D = !is3D;
    btn3D.style.background = is3D ? '#007aff' : 'transparent';
    btn3D.style.color      = is3D ? '#fff'    : '#1c1c1e';
    btn3D.style.fontWeight = is3D ? '600'     : '400';

    if (is3D) {
      /* Tilt camera like Apple Maps 3D */
      mapInstance.easeTo({ pitch:55, zoom: Math.max(mapInstance.getZoom(), 15), duration:700, easing:t=>t<0.5?2*t*t:(4-2*t)*t-1 });
      if (currentMode === 'map') enable3DBuildings();
      showStatus('3D', 1500);
    } else {
      mapInstance.easeTo({ pitch:0, duration:600 });
      disable3DBuildings();
      showStatus('2D', 1500);
    }
  }

  /* ── Markers ── */
  function placeMarker(lat, lng, label) {
    if (currentMarker) { currentMarker.remove(); currentMarker = null; }
    const el = document.createElement('div');
    el.style.cssText = 'width:32px;height:44px;position:relative;cursor:pointer;';
    el.innerHTML = `
      <div style="width:32px;height:32px;background:linear-gradient(145deg,#007aff,#0055cc);border-radius:50% 50% 50% 0;transform:rotate(-45deg);box-shadow:0 4px 12px rgba(0,122,255,0.4),0 2px 4px rgba(0,0,0,0.2);border:2px solid rgba(255,255,255,0.85);"></div>
      <div style="position:absolute;top:8px;left:8px;width:12px;height:12px;background:#fff;border-radius:50%;opacity:0.9;"></div>
    `;
    currentMarker = new maplibregl.Marker({ element:el, anchor:'bottom' })
      .setLngLat([lng, lat])
      .setPopup(new maplibregl.Popup({ offset:44, closeButton:true, maxWidth:'240px' })
        .setHTML(`<div style="font-weight:600;font-size:14px;color:#1c1c1e;">${label}</div>`))
      .addTo(mapInstance)
      .togglePopup();
  }

  function placeUserMarker(lat, lng) {
    if (userMarker) { userMarker.remove(); userMarker = null; }
    const el = document.createElement('div');
    el.style.cssText = 'width:24px;height:24px;display:flex;align-items:center;justify-content:center;position:relative;';
    el.innerHTML = `
      <div style="position:absolute;width:24px;height:24px;border-radius:50%;background:rgba(0,122,255,0.18);animation:maps-ripple 1.8s ease-out infinite;"></div>
      <div style="width:14px;height:14px;background:#007aff;border-radius:50%;border:2.5px solid #fff;box-shadow:0 2px 8px rgba(0,122,255,0.5);position:relative;z-index:1;"></div>
      <style>@keyframes maps-ripple{0%{transform:scale(1);opacity:0.6}100%{transform:scale(2.5);opacity:0}}</style>
    `;
    userMarker = new maplibregl.Marker({ element:el, anchor:'center' })
      .setLngLat([lng, lat])
      .addTo(mapInstance);
  }

  /* ── Search ── */
  function doSearch(query) {
    if (!query.trim() || !mapInstance) return;
    showStatus('Searching…', 0);
    hideSuggestions();
    fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=1&addressdetails=1`, { headers:{'Accept-Language':'en'} })
      .then(r=>r.json())
      .then(data=>{
        if (!data||!data.length) { showStatus('No results found',3000); return; }
        const{lat,lon,display_name}=data[0];
        const la=parseFloat(lat),ln=parseFloat(lon);
        mapInstance.flyTo({ center:[ln,la], zoom:15, pitch:is3D?55:0, duration:1400 });
        const label=display_name.split(',').slice(0,2).join(',').trim();
        placeMarker(la,ln,label);
        showStatus(label,4000);
      })
      .catch(()=>showStatus('Search failed',3000));
  }

  let lastQ='',sugTimer=null;
  function fetchSuggestions(q) {
    if (!q||q.length<3||q===lastQ) { if(!q||q.length<3) hideSuggestions(); return; }
    lastQ=q;
    clearTimeout(sugTimer);
    sugTimer=setTimeout(()=>{
      fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(q)}&format=json&limit=5&addressdetails=1`,{headers:{'Accept-Language':'en'}})
        .then(r=>r.json()).then(data=>renderSuggestions(data||[])).catch(()=>{});
    },350);
  }

  function renderSuggestions(items) {
    suggestList.innerHTML='';
    if (!items.length) { hideSuggestions(); return; }
    divider.style.display='block';
    items.forEach((item,i)=>{
      const parts=item.display_name.split(',');
      const main=parts[0],sub=parts.slice(1,3).join(',').trim();
      const row=document.createElement('div');
      row.style.cssText=`padding:10px 14px;display:flex;align-items:center;gap:10px;cursor:pointer;${i<items.length-1?'border-bottom:1px solid rgba(0,0,0,0.05);':'border-radius:0 0 16px 16px;'}transition:background 0.1s ease;`;
      row.innerHTML=`<span style="font-size:18px;flex-shrink:0;opacity:0.7;">📍</span><div style="flex:1;overflow:hidden;"><div style="font-size:14px;font-weight:500;color:#1c1c1e;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${main}</div><div style="font-size:12px;color:#8e8e93;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${sub}</div></div>`;
      row.addEventListener('mouseenter',()=>row.style.background='#f2f2f7');
      row.addEventListener('mouseleave',()=>row.style.background='transparent');
      row.addEventListener('click',()=>{
        searchInput.value=main;
        const la=parseFloat(item.lat),ln=parseFloat(item.lon);
        mapInstance.flyTo({center:[ln,la],zoom:15,pitch:is3D?55:0,duration:1400});
        placeMarker(la,ln,item.display_name.split(',').slice(0,2).join(',').trim());
        showStatus(main,4000);
        hideSuggestions();
      });
      suggestList.appendChild(row);
    });
    suggestList.style.display='block';
  }

  function hideSuggestions(){suggestList.style.display='none';divider.style.display='none';lastQ='';}

  /* ── Geolocation ── */
  function goToMyLocation(){
    if(!navigator.geolocation){showStatus('Geolocation not supported',3000);return;}
    showStatus('Finding your location…',0);
    locBtn.style.opacity='0.5';
    navigator.geolocation.getCurrentPosition(
      (pos)=>{
        const{latitude:la,longitude:ln}=pos.coords;
        mapInstance.flyTo({center:[ln,la],zoom:16,pitch:is3D?55:0,duration:1500});
        placeUserMarker(la,ln);
        showStatus('Location found',2500);
        locBtn.style.opacity='1';
      },
      ()=>{showStatus('Location access denied',3000);locBtn.style.opacity='1';},
      {timeout:8000}
    );
  }

  /* ── Events ── */
  searchInput.addEventListener('input',()=>{
    const v=searchInput.value;
    clearBtn.style.display=v?'flex':'none';
    fetchSuggestions(v);
    if(!v) hideSuggestions();
  });
  searchInput.addEventListener('keydown',(e)=>{
    if(e.key==='Enter'){e.preventDefault();doSearch(searchInput.value);}
    if(e.key==='Escape'){hideSuggestions();searchInput.blur();}
  });
  clearBtn.addEventListener('click',()=>{searchInput.value='';clearBtn.style.display='none';hideSuggestions();searchInput.focus();});
  root.addEventListener('click',(e)=>{if(!searchCard.contains(e.target)) hideSuggestions();});

  mapBtn.addEventListener('click',()=>setMode('map'));
  satBtn.addEventListener('click',()=>setMode('satellite'));
  btn3D.addEventListener('click',toggle3D);

  locBtn.addEventListener('click',()=>{if(mapInstance) goToMyLocation();});
  zoomInBtn.addEventListener('click',()=>mapInstance&&mapInstance.zoomIn());
  zoomOutBtn.addEventListener('click',()=>mapInstance&&mapInstance.zoomOut());

  /* ── Boot ── */
  const pt=setTimeout(()=>{const p=document.getElementById('maps-mod-prog');if(p) p.style.width='60%';},300);
  loadMapLibre(()=>{clearTimeout(pt);initMapLibre();});

  return function cleanup(){
    if(mapInstance){try{mapInstance.remove();}catch(e){}mapInstance=null;}
  };
}
