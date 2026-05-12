/* ════════════════════════════════════════════════════════════
   MAPS v2.2 — Win98 Edition
   Leaflet + OpenStreetMap | Nominatim | No API key
   Pixel scale • Tooltip (no floating popup) • Live suggestions
   ════════════════════════════════════════════════════════════ */

function initMaps98() {
  let mapInstance   = null;
  let currentMarker = null;
  let userMarker    = null;
  let leafletLoaded = false;
  let pixMode       = true;
  const PIXEL_SCALE = 3;

  const root = document.createElement('div');
  root.style.cssText = 'width:100%;height:100%;display:flex;flex-direction:column;overflow:hidden;background:#c0c0c0;font-family:"W95FA",VT323,monospace;';
  content.appendChild(root);

  /* ── Menubar ── */
  const menu = document.createElement('div');
  menu.className = 'win-menubar';
  menu.innerHTML = '<div class="win-menu-item">File</div><div class="win-menu-item">View</div><div class="win-menu-item">Help</div>';
  root.appendChild(menu);

  /* ── Toolbar ── */
  const toolbar = document.createElement('div');
  toolbar.style.cssText = 'display:flex;align-items:center;gap:4px;padding:4px 6px;background:#c0c0c0;border-bottom:2px solid #808080;box-shadow:inset 0 -1px 0 #fff;flex-shrink:0;position:relative;';

  const searchWrap = document.createElement('div');
  searchWrap.style.cssText = 'position:relative;flex:1;display:flex;flex-direction:column;';

  const searchInput = document.createElement('input');
  searchInput.type = 'text';
  searchInput.placeholder = 'Search location...';
  searchInput.style.cssText = 'width:100%;padding:3px 5px;font-family:"W95FA",VT323,monospace;font-size:13px;border:2px inset #808080;background:#fff;color:#000;box-shadow:inset 1px 1px 0 #000,inset -1px -1px 0 #dfdfdf;outline:none;box-sizing:border-box;';

  const suggestBox = document.createElement('div');
  suggestBox.style.cssText = 'position:absolute;top:100%;left:0;right:0;z-index:9999;background:#fff;border:2px outset #c0c0c0;box-shadow:2px 2px 0 #000;max-height:150px;overflow-y:auto;display:none;';
  searchWrap.appendChild(searchInput);
  searchWrap.appendChild(suggestBox);

  function makeBtn(label, extra) {
    const b = document.createElement('button');
    b.className = 'btn98';
    b.textContent = label;
    b.style.cssText = 'font-size:11px;padding:2px 8px;flex-shrink:0;' + (extra||'');
    return b;
  }
  const searchBtn  = makeBtn('🔍 Find'); searchBtn.classList.add('primary');
  const locBtn     = makeBtn('📍 Locate');
  const zoomInBtn  = makeBtn('[+]','font-family:monospace;');
  const zoomOutBtn = makeBtn('[-]','font-family:monospace;');
  const pixBtn     = makeBtn('[PIX:ON]','font-family:monospace;');

  [searchWrap,searchBtn,locBtn,zoomInBtn,zoomOutBtn,pixBtn].forEach(el=>toolbar.appendChild(el));
  root.appendChild(toolbar);

  /* ── Map container ── */
  const mapWrap = document.createElement('div');
  mapWrap.style.cssText = 'flex:1;position:relative;overflow:hidden;border:2px inset #808080;margin:4px;box-shadow:inset 1px 1px 0 #000;';

  const leafletHost = document.createElement('div');
  leafletHost.id = 'maps98-lf-' + Date.now();
  leafletHost.style.cssText = `width:${100/PIXEL_SCALE}%;height:${100/PIXEL_SCALE}%;position:absolute;top:0;left:0;transform-origin:top left;transform:scale(${PIXEL_SCALE});pointer-events:auto;`;
  mapWrap.appendChild(leafletHost);

  const scanline = document.createElement('div');
  scanline.style.cssText = 'position:absolute;inset:0;pointer-events:none;z-index:600;background:repeating-linear-gradient(to bottom,rgba(0,0,0,0.07) 0px,rgba(0,0,0,0.07) 1px,transparent 1px,transparent 2px);';
  mapWrap.appendChild(scanline);

  /* Loading */
  const loadPanel = document.createElement('div');
  loadPanel.style.cssText = 'position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;background:#c0c0c0;z-index:2000;gap:12px;';
  loadPanel.innerHTML = `<div style="font-family:VT323,monospace;font-size:28px;color:#000080;">🗺️ Maps 98</div><div style="font-family:VT323,monospace;font-size:15px;">Loading tile data...</div><div style="width:180px;height:14px;border:2px inset #808080;background:#fff;box-shadow:inset 1px 1px 0 #000;"><div id="maps98-prog" style="height:100%;width:0%;background:#000080;transition:width 0.2s;"></div></div><div style="font-family:VT323,monospace;font-size:11px;color:#808080;">© OpenStreetMap</div>`;
  mapWrap.appendChild(loadPanel);
  root.appendChild(mapWrap);

  /* ── Status bar ── */
  const statusBar = document.createElement('div');
  statusBar.style.cssText = 'display:flex;gap:6px;padding:2px 6px;background:#c0c0c0;border-top:1px solid #fff;font-family:VT323,monospace;font-size:12px;flex-shrink:0;';
  const statusPane = document.createElement('div');
  statusPane.style.cssText = 'flex:2;padding:1px 4px;border:1px inset #808080;box-shadow:inset 1px 1px 0 #000;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;';
  statusPane.textContent = 'Ready';
  const coordPane = document.createElement('div');
  coordPane.style.cssText = 'flex:1;padding:1px 4px;border:1px inset #808080;box-shadow:inset 1px 1px 0 #000;text-align:right;white-space:nowrap;';
  coordPane.textContent = 'Lat: \u2013 Lng: \u2013';
  statusBar.appendChild(statusPane);
  statusBar.appendChild(coordPane);
  root.appendChild(statusBar);

  /* ── Load Leaflet ── */
  function loadLeaflet(cb) {
    if (window.L && leafletLoaded) { cb(); return; }
    if (!document.getElementById('leaflet-css-98')) {
      const lc = document.createElement('link');
      lc.id='leaflet-css-98';lc.rel='stylesheet';
      lc.href='https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
      document.head.appendChild(lc);
    }
    if (window.L) { leafletLoaded=true; cb(); return; }
    const prog=document.getElementById('maps98-prog');
    if(prog) prog.style.width='30%';
    const s=document.createElement('script');
    s.src='https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
    s.onload=()=>{ leafletLoaded=true; if(prog) prog.style.width='100%'; setTimeout(cb,200); };
    s.onerror=()=>{ loadPanel.innerHTML='<div style="font-family:VT323,monospace;color:#800000;font-size:16px;">⚠️ Network Error</div>'; };
    document.head.appendChild(s);
  }

  /* ── Init map ── */
  function initLeafletMap() {
    loadPanel.style.display='none';

    const sid='leaflet-98-ov-'+leafletHost.id;
    if(!document.getElementById(sid)){
      const st=document.createElement('style');
      st.id=sid;
      st.textContent=`
        #${leafletHost.id} .leaflet-container{font-family:"W95FA",VT323,monospace;cursor:crosshair !important;background:#c0c0c0;}
        #${leafletHost.id} .leaflet-tile{image-rendering:pixelated !important;image-rendering:crisp-edges !important;filter:contrast(1.05) saturate(0.8);}
        #${leafletHost.id} .leaflet-control-attribution{font-family:VT323,monospace;font-size:10px;background:rgba(192,192,192,0.9) !important;color:#000 !important;border:1px solid #808080;}
        #${leafletHost.id} .leaflet-control-zoom{display:none;}
        #${leafletHost.id} .leaflet-tooltip{
          background:#c0c0c0 !important;
          border:2px outset #fff !important;
          box-shadow:2px 2px 0 #000 !important;
          border-radius:0 !important;
          font-family:"W95FA",VT323,monospace !important;
          font-size:13px !important;
          color:#000 !important;
          padding:2px 6px !important;
          white-space:nowrap !important;
          pointer-events:none !important;
        }
        #${leafletHost.id} .leaflet-tooltip::before{
          border-top-color:#808080 !important;
        }
        #${leafletHost.id} .leaflet-tooltip-bottom::before{
          border-bottom-color:#808080 !important;
        }
      `;
      document.head.appendChild(st);
    }

    mapInstance=L.map(leafletHost.id,{zoomControl:false,attributionControl:true,preferCanvas:true}).setView([40.7128,-74.006],12);

    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png',{
      maxZoom:19,
      attribution:'\u00a9 <a href="https://www.openstreetmap.org/copyright" style="color:#000080;">OpenStreetMap</a>',
      crossOrigin:true,
    }).addTo(mapInstance);

    mapInstance.on('mousemove',(e)=>{ coordPane.textContent=`Lat:${e.latlng.lat.toFixed(4)} Lng:${e.latlng.lng.toFixed(4)}`; });
    mapInstance.on('click',(e)=>{ placeMarker(e.latlng.lat,e.latlng.lng,`${e.latlng.lat.toFixed(4)}, ${e.latlng.lng.toFixed(4)}`); });
    statusPane.textContent='Map loaded. Click to pin. Search above.';
  }

  /* ── Markers — use tooltip instead of popup so it stays pinned to marker ── */
  function makeMarker98(){
    return L.divIcon({
      className:'',
      /* Square head + stem — classic Win98 map pin */
      html:`<div style="display:flex;flex-direction:column;align-items:center;">
        <div style="width:12px;height:12px;background:#000080;border:2px solid #fff;box-shadow:1px 1px 0 #000,-1px -1px 0 #000;"></div>
        <div style="width:2px;height:8px;background:#000;"></div>
      </div>`,
      iconSize:[12,22],iconAnchor:[6,22],tooltipAnchor:[8,-18],
    });
  }
  function makeUserMarker98(){
    return L.divIcon({
      className:'',
      html:`<div style="width:14px;height:14px;background:#c00000;border:2px solid #fff;box-shadow:1px 1px 0 #000,-1px -1px 0 #000;border-radius:50%;animation:maps98-pulse 1.2s ease-in-out infinite;"></div>
      <style>@keyframes maps98-pulse{0%,100%{box-shadow:1px 1px 0 #000,0 0 0 0 rgba(192,0,0,.5)}50%{box-shadow:1px 1px 0 #000,0 0 0 6px rgba(192,0,0,0)}}</style>`,
      iconSize:[14,14],iconAnchor:[7,7],tooltipAnchor:[9,-7],
    });
  }

  /* Use L.tooltip with permanent:false — it stays attached to marker, no floating pane issues */
  function placeMarker(lat,lng,label){
    if(currentMarker) mapInstance.removeLayer(currentMarker);
    currentMarker=L.marker([lat,lng],{icon:makeMarker98()})
      .addTo(mapInstance)
      .bindTooltip(label,{permanent:false,direction:'right',offset:[4,0],className:''})
      .openTooltip();
    coordPane.textContent=`Lat:${lat.toFixed(4)} Lng:${lng.toFixed(4)}`;
  }

  /* ── Search ── */
  function doSearch(query){
    if(!query.trim()||!mapInstance) return;
    statusPane.textContent=`Searching: "${query}"...`;
    hideSuggestions();
    fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=1`,{headers:{'Accept-Language':'en'}})
      .then(r=>r.json())
      .then(data=>{
        if(!data||!data.length){statusPane.textContent=`No results for "${query}".`;return;}
        const{lat,lon,display_name}=data[0];
        const la=parseFloat(lat),ln=parseFloat(lon);
        mapInstance.flyTo([la,ln],14,{duration:1.2});
        const label=display_name.split(',').slice(0,2).join(',').trim();
        placeMarker(la,ln,label);
        statusPane.textContent=display_name.split(',').slice(0,3).join(',');
      })
      .catch(()=>{statusPane.textContent='Search failed.';});
  }

  let sugTimer=null;
  function fetchSuggestions(q){
    if(!q||q.length<3){hideSuggestions();return;}
    clearTimeout(sugTimer);
    sugTimer=setTimeout(()=>{
      fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(q)}&format=json&limit=5`,{headers:{'Accept-Language':'en'}})
        .then(r=>r.json()).then(data=>renderSuggestions(data||[])).catch(()=>{});
    },350);
  }

  function renderSuggestions(items){
    suggestBox.innerHTML='';
    if(!items.length){hideSuggestions();return;}
    items.forEach((item,i)=>{
      const parts=item.display_name.split(',');
      const main=parts[0],sub=parts.slice(1,3).join(',').trim();
      const row=document.createElement('div');
      row.style.cssText=`padding:3px 6px;cursor:default;font-family:"W95FA",VT323,monospace;font-size:12px;${i<items.length-1?'border-bottom:1px solid #c0c0c0;':''}`;
      row.innerHTML=`<div style="color:#000080;font-size:13px;">📍 ${main}</div><div style="color:#808080;font-size:11px;">${sub}</div>`;
      row.addEventListener('mouseenter',()=>{row.style.background='#000080';row.querySelectorAll('div').forEach(d=>d.style.color='#fff');});
      row.addEventListener('mouseleave',()=>{row.style.background='#fff';row.querySelectorAll('div')[0].style.color='#000080';row.querySelectorAll('div')[1].style.color='#808080';});
      row.addEventListener('mousedown',(e)=>{
        e.preventDefault();
        searchInput.value=main;
        const la=parseFloat(item.lat),ln=parseFloat(item.lon);
        mapInstance&&mapInstance.flyTo([la,ln],14,{duration:1.2});
        placeMarker(la,ln,item.display_name.split(',').slice(0,2).join(',').trim());
        statusPane.textContent=item.display_name.split(',').slice(0,3).join(',');
        hideSuggestions();
      });
      suggestBox.appendChild(row);
    });
    suggestBox.style.display='block';
  }
  function hideSuggestions(){suggestBox.style.display='none';}

  /* ── Geolocation ── */
  function goToMyLocation(){
    if(!navigator.geolocation){statusPane.textContent='Geolocation not supported';return;}
    statusPane.textContent='Finding your location...';
    locBtn.disabled=true;
    navigator.geolocation.getCurrentPosition(
      (pos)=>{
        const{latitude:la,longitude:ln}=pos.coords;
        mapInstance.flyTo([la,ln],15,{duration:1.5});
        if(userMarker) mapInstance.removeLayer(userMarker);
        userMarker=L.marker([la,ln],{icon:makeUserMarker98()})
          .addTo(mapInstance)
          .bindTooltip('📍 You are here',{permanent:false,direction:'right',offset:[4,0]})
          .openTooltip();
        statusPane.textContent=`Location: ${la.toFixed(4)}, ${ln.toFixed(4)}`;
        locBtn.disabled=false;
      },
      ()=>{statusPane.textContent='Location access denied.';locBtn.disabled=false;},
      {timeout:8000}
    );
  }

  /* ── Pixel toggle ── */
  pixBtn.addEventListener('click',()=>{
    pixMode=!pixMode;
    pixBtn.textContent=pixMode?'[PIX:ON]':'[PIX:OFF]';
    leafletHost.style.transform=pixMode?`scale(${PIXEL_SCALE})`:'scale(1)';
    leafletHost.style.width=pixMode?`${100/PIXEL_SCALE}%`:'100%';
    leafletHost.style.height=pixMode?`${100/PIXEL_SCALE}%`:'100%';
    scanline.style.display=pixMode?'block':'none';
    if(mapInstance) mapInstance.invalidateSize();
  });

  /* ── Events ── */
  searchBtn.addEventListener('click',()=>doSearch(searchInput.value));
  searchInput.addEventListener('keydown',(e)=>{if(e.key==='Enter') doSearch(searchInput.value);if(e.key==='Escape') hideSuggestions();});
  searchInput.addEventListener('input',()=>fetchSuggestions(searchInput.value));
  searchInput.addEventListener('blur',()=>setTimeout(hideSuggestions,120));
  locBtn.addEventListener('click',()=>{if(mapInstance) goToMyLocation();});
  zoomInBtn.addEventListener('click',()=>mapInstance&&mapInstance.zoomIn());
  zoomOutBtn.addEventListener('click',()=>mapInstance&&mapInstance.zoomOut());

  /* ── Boot ── */
  const pt=setTimeout(()=>{const p=document.getElementById('maps98-prog');if(p)p.style.width='60%';},300);
  loadLeaflet(()=>{clearTimeout(pt);initLeafletMap();});

  return function cleanup(){
    if(mapInstance){try{mapInstance.remove();}catch(e){}mapInstance=null;}
  };
}
