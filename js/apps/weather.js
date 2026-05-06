/* ════════════ WEATHER v8 ════════════
   Animated sky hero + Win98 data panels
   Full location fallback with city search
   ════════════════════════════════════ */

const WX_ICONS_DAY   = {0:'☀️',1:'🌤️',2:'⛅',3:'☁️',45:'🌫️',48:'🌫️',51:'🌦️',53:'🌦️',55:'🌧️',61:'🌧️',63:'🌧️',65:'🌧️',71:'🌨️',73:'❄️',75:'❄️',77:'❄️',80:'🌦️',81:'🌧️',82:'🌧️',85:'🌨️',86:'🌨️',95:'⛈️',96:'⛈️',99:'⛈️'};
const WX_ICONS_NIGHT = {0:'🌙',1:'🌙',2:'☁️',3:'☁️',45:'🌫️',48:'🌫️',51:'🌦️',53:'🌦️',55:'🌧️',61:'🌧️',63:'🌧️',65:'🌧️',71:'🌨️',73:'❄️',75:'❄️',77:'❄️',80:'🌦️',81:'🌧️',82:'🌧️',85:'🌨️',86:'🌨️',95:'⛈️',96:'⛈️',99:'⛈️'};
const WX_DESC = {0:'Clear Sky',1:'Mainly Clear',2:'Partly Cloudy',3:'Overcast',45:'Foggy',48:'Icy Fog',51:'Light Drizzle',53:'Drizzle',55:'Heavy Drizzle',61:'Light Rain',63:'Rain',65:'Heavy Rain',71:'Light Snow',73:'Snow',75:'Heavy Snow',80:'Showers',81:'Rain Showers',82:'Heavy Showers',95:'Thunderstorm',96:'Hail Storm',99:'Heavy Hail'};

function initWeather() {
  let celsius = true, wdata = null;

  const root = document.createElement('div');
  root.style.cssText = 'width:100%;height:100%;display:flex;flex-direction:column;overflow:hidden;position:relative;background:#1c4a8a;';
  content.appendChild(root);

  /* Animated sky canvas */
  const cv = document.createElement('canvas');
  cv.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;pointer-events:none;z-index:0;';
  root.appendChild(cv);
  let skyRaf = null;

  function startSky(code, isDay) {
    cancelAnimationFrame(skyRaf);
    const ctx = cv.getContext('2d');
    cv.width  = root.offsetWidth  || 390;
    cv.height = root.offsetHeight || 600;
    const W = cv.width, H = cv.height;

    let topCol, botCol;
    if (!isDay) {
      topCol = code>=95?'#0a0a18':code>=61?'#0d1520':'#0d1b3e';
      botCol = code>=95?'#1a0a18':code>=61?'#1a2530':'#091228';
    } else {
      if      (code>=95) { topCol='#1c1f26'; botCol='#3d3530'; }
      else if (code>=71) { topCol='#b0c4d8'; botCol='#e8f0f8'; }
      else if (code>=61) { topCol='#2c3e50'; botCol='#546070'; }
      else if (code>=45) { topCol='#8090a0'; botCol='#b8c8d8'; }
      else if (code>=2)  { topCol='#2e6db0'; botCol='#7898b0'; }
      else               { topCol='#1c4a8a'; botCol='#64b0e0'; }
    }

    const clouds = Array.from({length:6},()=>({
      x:Math.random()*W, y:30+Math.random()*(H*0.35),
      r:28+Math.random()*40, spd:0.12+Math.random()*0.18,
      alpha:0.12+Math.random()*0.18,
    }));
    const drops = (code>=51&&code<=82)?Array.from({length:60},()=>({
      x:Math.random()*W, y:Math.random()*H,
      len:8+Math.random()*14, spd:5+Math.random()*6,
    })):[];
    const flakes = (code>=71&&code<=86)?Array.from({length:40},()=>({
      x:Math.random()*W, y:Math.random()*H,
      r:1.5+Math.random()*2.5, spd:1.2+Math.random()*1.6,
      drift:(Math.random()-0.5)*0.6,
    })):[];
    const stars = (!isDay&&code<45)?Array.from({length:60},()=>({
      x:Math.random()*W, y:Math.random()*H*0.55,
      r:0.5+Math.random()*1.2, tw:Math.random()*Math.PI*2,
    })):[];
    let ltick=0;

    function draw() {
      skyRaf = requestAnimationFrame(draw);
      ctx.clearRect(0,0,W,H);
      const g=ctx.createLinearGradient(0,0,0,H);
      g.addColorStop(0,topCol); g.addColorStop(1,botCol);
      ctx.fillStyle=g; ctx.fillRect(0,0,W,H);

      stars.forEach(s=>{
        s.tw+=0.04;
        ctx.beginPath(); ctx.arc(s.x,s.y,s.r,0,Math.PI*2);
        ctx.fillStyle=`rgba(255,255,255,${0.4+0.4*Math.sin(s.tw)})`; ctx.fill();
      });

      if(code>=95){
        ltick++;
        if(ltick%90<3){
          ctx.fillStyle=`rgba(220,220,255,${0.08*(3-ltick%90)})`;
          ctx.fillRect(0,0,W,H);
          if(ltick%90===0){
            ctx.strokeStyle='rgba(255,255,220,0.7)'; ctx.lineWidth=1.5;
            ctx.beginPath();
            const lx=W*0.2+Math.random()*W*0.6;
            ctx.moveTo(lx,0); ctx.lineTo(lx-15+Math.random()*30,H*0.4);
            ctx.lineTo(lx-25+Math.random()*50,H*0.8); ctx.stroke();
          }
        }
      }

      if(code>=1) clouds.forEach(cl=>{
        cl.x+=cl.spd; if(cl.x>W+cl.r*2) cl.x=-cl.r*2;
        ctx.beginPath();
        ctx.arc(cl.x,cl.y,cl.r,0,Math.PI*2);
        ctx.arc(cl.x+cl.r*.7,cl.y-cl.r*.3,cl.r*.7,0,Math.PI*2);
        ctx.arc(cl.x-cl.r*.6,cl.y-cl.r*.2,cl.r*.6,0,Math.PI*2);
        ctx.fillStyle=`rgba(255,255,255,${cl.alpha})`; ctx.fill();
      });

      drops.forEach(d=>{
        d.y+=d.spd; if(d.y>H){d.y=-d.len;d.x=Math.random()*W;}
        ctx.beginPath(); ctx.moveTo(d.x,d.y); ctx.lineTo(d.x-1,d.y+d.len);
        ctx.strokeStyle='rgba(174,214,241,0.55)'; ctx.lineWidth=1; ctx.stroke();
      });

      flakes.forEach(f=>{
        f.y+=f.spd; f.x+=f.drift;
        if(f.y>H){f.y=-f.r;f.x=Math.random()*W;}
        ctx.beginPath(); ctx.arc(f.x,f.y,f.r,0,Math.PI*2);
        ctx.fillStyle='rgba(255,255,255,0.7)'; ctx.fill();
      });
    }
    draw();
  }

  /* Hero sits over sky */
  const hero = document.createElement('div');
  hero.style.cssText = 'position:relative;z-index:1;flex-shrink:0;padding:10px 14px 12px;display:flex;flex-direction:column;gap:2px;';
  root.appendChild(hero);

  /* Win98 panel below */
  const panel = document.createElement('div');
  panel.style.cssText = 'position:relative;z-index:1;flex:1;overflow-y:auto;-webkit-overflow-scrolling:touch;background:var(--win-chrome);border-top:3px solid;border-color:var(--win-chrome-light) var(--win-chrome-dark) var(--win-chrome-dark) var(--win-chrome-light);display:flex;flex-direction:column;';
  root.appendChild(panel);

  const comDir = d => ['N','NE','E','SE','S','SW','W','NW'][Math.round(d/45)%8];
  const toT = v => celsius?Math.round(v):Math.round(v*9/5+32);
  const u = () => celsius?'°C':'°F';

  function setHero(city, temp, icon, desc, hi, lo) {
    hero.innerHTML = `
      <div style="display:flex;align-items:flex-start;justify-content:space-between;">
        <div>
          <div style="font-family:var(--pixel-font);font-size:clamp(.9rem,5vw,1.4rem);color:#fff;font-weight:bold;text-shadow:1px 1px 6px rgba(0,0,0,.6);">${city}</div>
          <div style="font-family:var(--pixel-font);font-size:clamp(2.8rem,16vw,5rem);color:#fff;line-height:1;font-weight:bold;text-shadow:2px 2px 12px rgba(0,0,0,.5);">${temp}°</div>
          <div style="font-family:var(--pixel-font);font-size:1rem;color:rgba(255,255,255,.85);text-shadow:1px 1px 4px rgba(0,0,0,.5);">${icon} ${desc}</div>
          <div style="font-family:var(--pixel-font);font-size:.85rem;color:rgba(255,255,255,.65);text-shadow:1px 1px 4px rgba(0,0,0,.5);">H:${hi}° · L:${lo}°</div>
        </div>
        <button id="wx-utog" style="font-family:var(--pixel-font);font-size:14px;color:rgba(255,255,255,.85);background:rgba(0,0,0,.28);border:1px solid rgba(255,255,255,.3);padding:4px 10px;cursor:pointer;margin-top:4px;-webkit-tap-highlight-color:transparent;">${celsius?'°F · Switch':'°C · Switch'}</button>
      </div>`;
    document.getElementById('wx-utog').onclick = ()=>{celsius=!celsius;render();};
  }

  function render() {
    if(!wdata) return;
    const d=wdata;
    const icons = d.isDay?WX_ICONS_DAY:WX_ICONS_NIGHT;
    const icon=icons[d.code]||'🌡️', desc=WX_DESC[d.code]||'';
    const daily=d.daily, hourly=d.hourly;
    const hiTemp=toT(daily?.temperature_2m_max?.[0]??d.tc);
    const loTemp=toT(daily?.temperature_2m_min?.[0]??d.tc);
    setHero(d.city.split(',')[0], toT(d.tc), icon, desc, hiTemp, loTemp);
    startSky(d.code, d.isDay);
    panel.innerHTML='';

    /* toolbar */
    const tb=document.createElement('div');
    tb.className='win-toolbar'; tb.style.flexShrink='0';
    tb.innerHTML='<button class="win-toolbar-btn" id="wx-refresh-btn">🔄 Refresh</button><div class="win-toolbar-sep"></div><button class="win-toolbar-btn" id="wx-search-btn">🔍 Change City</button>';
    panel.appendChild(tb);
    tb.querySelector('#wx-refresh-btn').onclick=()=>{ if(d._lat) fetchW(d._lat,d._lon,d.city); };
    tb.querySelector('#wx-search-btn').onclick=()=>showManual();

    const scroll=document.createElement('div');
    scroll.style.cssText='flex:1;overflow-y:auto;-webkit-overflow-scrolling:touch;';
    panel.appendChild(scroll);

    /* hourly */
    const hw=document.createElement('div');
    hw.innerHTML='<div style="background:var(--win-select);color:var(--win-select-text);font-family:var(--pixel-font);font-size:15px;padding:2px 8px;font-weight:bold;">🕐 Hourly Forecast</div>';
    const hs=document.createElement('div');
    hs.style.cssText='display:flex;overflow-x:auto;-webkit-overflow-scrolling:touch;scrollbar-width:thin;background:#fff;border-bottom:2px solid var(--win-chrome-dark);';
    if(hourly?.time){
      const now=new Date(); let shown=0;
      for(let i=0;i<hourly.time.length&&shown<24;i++){
        const ht=new Date(hourly.time[i]);
        if(ht<now-1800000) continue;
        const hLabel=shown===0?'Now':ht.toLocaleTimeString('en-US',{hour:'numeric',hour12:true});
        const code=hourly.weather_code?.[i]??0;
        const hDay=ht.getHours()>=6&&ht.getHours()<20;
        const hIcon=(hDay?WX_ICONS_DAY:WX_ICONS_NIGHT)[code]||'🌡️';
        const precip=hourly.precipitation_probability?.[i]??0;
        const cell=document.createElement('div');
        cell.style.cssText='display:flex;flex-direction:column;align-items:center;gap:3px;padding:8px 10px;flex-shrink:0;border-right:1px solid #e0e0e0;min-width:56px;';
        cell.innerHTML=`<span style="font-family:var(--pixel-font);font-size:13px;color:#808080;white-space:nowrap;">${hLabel}</span><span style="font-size:18px;line-height:1;">${hIcon}</span><span style="font-family:var(--pixel-font);font-size:16px;color:#000;font-weight:bold;">${toT(hourly.temperature_2m?.[i]??0)}°</span>${precip>=20?`<span style="font-family:var(--pixel-font);font-size:12px;color:#4a90d9;">${precip}%</span>`:''}`;
        hs.appendChild(cell); shown++;
      }
    }
    hw.appendChild(hs); scroll.appendChild(hw);

    /* 7-day */
    const fw=document.createElement('div');
    fw.innerHTML='<div style="background:var(--win-select);color:var(--win-select-text);font-family:var(--pixel-font);font-size:15px;padding:2px 8px;font-weight:bold;">📅 7-Day Forecast</div>';
    if(daily?.time){
      const days=['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
      const maxT=daily.temperature_2m_max||[], minT=daily.temperature_2m_min||[];
      const allT=[...maxT,...minT].filter(v=>v!=null);
      const gMin=Math.min(...allT),gMax=Math.max(...allT);
      for(let i=0;i<Math.min(7,daily.time.length);i++){
        const dt=new Date(daily.time[i]+'T12:00:00');
        const day=i===0?'Today':days[dt.getDay()];
        const hi=toT(maxT[i]??0),lo=toT(minT[i]??0);
        const code=daily.weather_code?.[i]??0;
        const precip=daily.precipitation_probability_max?.[i]??0;
        const cMin=toT(gMin),cMax=toT(gMax),br=cMax-cMin||1;
        const fl=((lo-cMin)/br*100).toFixed(1),fw2=((hi-lo)/br*100).toFixed(1);
        const t=(maxT[i]-gMin)/(gMax-gMin||1);
        const col=t<0.33?'#4dd0e1':t<0.55?'#81d4fa':t<0.7?'#ffb300':t<0.85?'#f57c00':'#e53935';
        const row=document.createElement('div');
        row.style.cssText='display:flex;align-items:center;gap:6px;padding:5px 10px;border-bottom:1px solid #f0f0f0;background:#fff;';
        row.innerHTML=`<span style="font-family:var(--pixel-font);font-size:15px;color:#000;min-width:38px;">${day}</span><span style="font-size:16px;">${WX_ICONS_DAY[code]||'🌡️'}</span>${precip>=20?`<span style="font-family:var(--pixel-font);font-size:12px;color:#4a90d9;min-width:28px;">${precip}%</span>`:'<span style="min-width:28px;"></span>'}<span style="font-family:var(--pixel-font);font-size:14px;color:#808080;min-width:26px;text-align:right;">${lo}°</span><div style="flex:1;height:8px;background:#e0e0e0;border:1px solid #c0c0c0;position:relative;"><div style="position:absolute;left:${fl}%;width:${fw2}%;height:100%;background:${col};"></div></div><span style="font-family:var(--pixel-font);font-size:14px;color:#000;min-width:26px;">${hi}°</span>`;
        fw.appendChild(row);
      }
    }
    scroll.appendChild(fw);

    /* conditions grid */
    const ch=document.createElement('div');
    ch.style.cssText='background:var(--win-select);color:var(--win-select-text);font-family:var(--pixel-font);font-size:15px;padding:2px 8px;font-weight:bold;';
    ch.textContent='📊 Conditions'; scroll.appendChild(ch);
    const cg=document.createElement('div');
    cg.style.cssText='display:grid;grid-template-columns:1fr 1fr;background:var(--win-chrome-dark);';
    const conds=[
      {ico:'💧',label:'Humidity',val:d.hum+'%',sub:d.hum<30?'Dry':d.hum<60?'Comfortable':'Humid'},
      {ico:'💨',label:'Wind',val:Math.round(d.ws)+' km/h',sub:'Dir: '+comDir(d.wd)},
      {ico:'🌡️',label:'Feels Like',val:toT(d.feels)+'°'+u(),sub:'Apparent'},
      {ico:'☀️',label:'UV Index',val:d.uv,sub:d.uv<=2?'Low':d.uv<=5?'Moderate':d.uv<=7?'High':'Very High'},
      {ico:'🌧️',label:'Precip',val:d.precip+'%',sub:'Today'},
      {ico:'👁️',label:'Visibility',val:d.vis+' km',sub:''},
    ];
    conds.forEach(c=>{
      const tile=document.createElement('div');
      tile.style.cssText='background:var(--win-chrome);border-right:1px solid var(--win-chrome-dark);border-bottom:1px solid var(--win-chrome-dark);padding:8px 10px;display:flex;flex-direction:column;gap:2px;';
      tile.innerHTML=`<div style="font-family:var(--pixel-font);font-size:13px;color:var(--win-text-dim);">${c.ico} ${c.label}</div><div style="font-family:var(--pixel-font);font-size:1.3rem;color:var(--win-text);font-weight:bold;line-height:1;">${c.val}</div><div style="font-family:var(--pixel-font);font-size:12px;color:var(--win-text-dim);">${c.sub}</div>`;
      cg.appendChild(tile);
    });
    scroll.appendChild(cg);

    /* status bar */
    const sb=document.createElement('div');
    sb.className='win-statusbar';
    sb.innerHTML=`<div class="win-status-pane">${d.city}</div><div class="win-status-pane">Updated: ${new Date().toLocaleTimeString('en-US',{hour:'2-digit',minute:'2-digit'})}</div>`;
    panel.appendChild(sb);
  }

  const fetchW = async (lat, lon, cityName) => {
    hero.innerHTML=`<div style="font-family:var(--pixel-font);font-size:1rem;color:rgba(255,255,255,.7);padding:8px;">Fetching weather…</div>`;
    panel.innerHTML=`<div style="display:flex;align-items:center;justify-content:center;height:100%;font-family:var(--pixel-font);font-size:1rem;color:var(--win-text-dim);">Loading…</div>`;
    try {
      const wr=await fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}`+
        `&current=temperature_2m,apparent_temperature,relative_humidity_2m,wind_speed_10m,wind_direction_10m,weather_code,uv_index,visibility,is_day`+
        `&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max`+
        `&hourly=temperature_2m,weather_code,precipitation_probability`+
        `&timezone=auto&forecast_days=7`
      );
      const wj=await wr.json();
      const c=wj.current;
      let city=cityName;
      if(!city){
        try{
          const gr=await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json`);
          const gj=await gr.json();
          city=gj.address?.city||gj.address?.town||gj.address?.village||`${lat.toFixed(1)}°N`;
        }catch(e){city=`${lat.toFixed(1)}°, ${lon.toFixed(1)}°`;}
      }
      wdata={
        tc:c.temperature_2m, feels:c.apparent_temperature,
        ws:c.wind_speed_10m, wd:c.wind_direction_10m,
        code:c.weather_code, city,
        hum:c.relative_humidity_2m,
        uv:Math.round(c.uv_index||0),
        vis:Math.round((c.visibility||0)/1000),
        precip:(wj.daily?.precipitation_probability_max?.[0])||0,
        daily:wj.daily, hourly:wj.hourly,
        isDay:c.is_day===1, _lat:lat, _lon:lon,
      };
      render();
    }catch(e){ showManual('Connection error. Check your internet and try again.'); }
  };

  const showManual = (err) => {
    cancelAnimationFrame(skyRaf);
    root.style.background='linear-gradient(180deg,#0d1b3e 0%,#091228 60%,#040810 100%)';
    hero.innerHTML='';
    panel.innerHTML='';
    panel.style.cssText='position:relative;z-index:1;flex:1;overflow-y:auto;-webkit-overflow-scrolling:touch;background:transparent;border:none;display:flex;flex-direction:column;';

    const screen=document.createElement('div');
    screen.style.cssText='width:100%;flex:1;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:16px 20px;gap:14px;';
    const geoAvail=!!navigator.geolocation;
    screen.innerHTML=`
      <div style="font-size:4rem;line-height:1;filter:drop-shadow(0 4px 20px rgba(100,180,255,.4));">🌍</div>
      <div style="font-family:var(--pixel-font);font-size:1.4rem;color:#fff;font-weight:bold;text-align:center;">iPOCKET Weather</div>
      <div style="font-family:var(--pixel-font);font-size:.9rem;color:rgba(255,255,255,.4);letter-spacing:.1em;">WHERE ARE YOU?</div>
      ${geoAvail?`<button id="wx-loc-btn" style="font-family:var(--pixel-font);font-size:1.1rem;color:#030f08;background:linear-gradient(135deg,#00ffaa,#00cc88);border:none;border-bottom:4px solid #007744;padding:12px 0;cursor:pointer;width:100%;max-width:300px;-webkit-tap-highlight-color:transparent;">📍 Use My Location</button>`:''}
      <div style="display:flex;align-items:center;gap:10px;width:100%;max-width:300px;">
        <div style="flex:1;height:1px;background:rgba(255,255,255,.12);"></div>
        <span style="font-family:var(--pixel-font);font-size:.85rem;color:rgba(255,255,255,.3);">OR SEARCH</span>
        <div style="flex:1;height:1px;background:rgba(255,255,255,.12);"></div>
      </div>
      <div style="position:relative;width:100%;max-width:300px;">
        <input id="wx-city-inp" type="text" placeholder="City name, e.g. New York"
          autocomplete="off" spellcheck="false"
          style="width:100%;padding:10px 44px 10px 12px;background:rgba(255,255,255,.1);border:2px solid rgba(255,255,255,.2);color:#fff;font-family:var(--pixel-font);font-size:1rem;outline:none;-webkit-appearance:none;box-sizing:border-box;">
        <button id="wx-go-btn" style="position:absolute;right:0;top:0;bottom:0;width:42px;background:rgba(0,255,150,.2);border:2px solid rgba(0,255,150,.35);border-left:none;color:#00ffaa;font-family:var(--pixel-font);font-size:1.1rem;cursor:pointer;-webkit-tap-highlight-color:transparent;">→</button>
        <div id="wx-drop" style="position:absolute;top:100%;left:0;right:0;background:#111;border:2px solid rgba(255,255,255,.15);border-top:none;display:none;z-index:20;max-height:160px;overflow-y:auto;"></div>
      </div>
      ${err?`<div style="font-family:var(--pixel-font);font-size:.85rem;color:rgba(255,180,80,.9);text-align:center;max-width:280px;line-height:1.5;background:rgba(255,150,0,.1);border:1px solid rgba(255,150,0,.2);padding:10px 14px;">${err}</div>`:''}
      <div style="font-family:var(--pixel-font);font-size:.75rem;color:rgba(255,255,255,.18);">Powered by Open-Meteo</div>
    `;
    panel.appendChild(screen);

    const locBtn=screen.querySelector('#wx-loc-btn');
    if(locBtn) locBtn.onclick=()=>{
      locBtn.textContent='Getting location…'; locBtn.disabled=true;
      navigator.geolocation.getCurrentPosition(
        p=>fetchW(p.coords.latitude,p.coords.longitude,null),
        e=>showManual(e.code===1?'Location access denied. Enable it in Settings → Privacy → Location Services → Safari, then try again.':'Could not get location. Try searching instead.'),
        {timeout:10000,enableHighAccuracy:false,maximumAge:60000}
      );
    };

    const inp=screen.querySelector('#wx-city-inp');
    const drop=screen.querySelector('#wx-drop');
    let dbt=null;
    const sel=(lat,lon,name)=>{drop.style.display='none';fetchW(lat,lon,name);};

    inp.addEventListener('input',()=>{
      clearTimeout(dbt); const q=inp.value.trim();
      if(q.length<2){drop.style.display='none';return;}
      dbt=setTimeout(async()=>{
        try{
          const r=await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(q)}&count=6&format=json`);
          const d=await r.json(); const res=d.results||[];
          if(!res.length){drop.style.display='none';return;}
          drop.innerHTML=res.map(loc=>{
            const lbl=[loc.name,loc.admin1,loc.country].filter(Boolean).join(', ');
            return `<div data-lat="${loc.latitude}" data-lon="${loc.longitude}" data-name="${lbl}" style="padding:8px 12px;font-family:var(--pixel-font);font-size:.9rem;color:#fff;cursor:pointer;border-bottom:1px solid rgba(255,255,255,.1);">${lbl}</div>`;
          }).join('');
          drop.style.display='block';
          drop.querySelectorAll('div').forEach(el=>{
            el.addEventListener('touchstart',e=>{e.preventDefault();sel(+el.dataset.lat,+el.dataset.lon,el.dataset.name);},{passive:false});
            el.addEventListener('mousedown',()=>sel(+el.dataset.lat,+el.dataset.lon,el.dataset.name));
          });
        }catch(e){}
      },280);
    });

    const go=async()=>{
      const first=drop.querySelector('div');
      if(first){sel(+first.dataset.lat,+first.dataset.lon,first.dataset.name);return;}
      const q=inp.value.trim(); if(!q) return;
      try{
        const r=await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(q)}&count=1&format=json`);
        const d=await r.json();
        if(!d.results?.length){showManual('City not found. Try a different spelling.');return;}
        const loc=d.results[0];
        fetchW(loc.latitude,loc.longitude,[loc.name,loc.country].filter(Boolean).join(', '));
      }catch(e){showManual('Connection error.');}
    };
    screen.querySelector('#wx-go-btn').onclick=go;
    inp.onkeydown=e=>{if(e.key==='Enter')go();};
    setTimeout(()=>inp.focus(),200);
  };

  const isStandalone=window.navigator.standalone===true||window.matchMedia('(display-mode:standalone)').matches;
  if(isStandalone){
    showManual('Running as home screen app. Tap "Use My Location" or search your city.');
  } else if(navigator.geolocation){
    hero.innerHTML=`<div style="font-family:var(--pixel-font);font-size:1rem;color:rgba(255,255,255,.6);padding:8px;">Getting your location…</div>`;
    panel.innerHTML=`<div style="display:flex;align-items:center;justify-content:center;height:100%;font-family:var(--pixel-font);font-size:1rem;color:var(--win-text-dim);">Loading…</div>`;
    navigator.geolocation.getCurrentPosition(
      p=>fetchW(p.coords.latitude,p.coords.longitude,null),
      ()=>showManual(),
      {timeout:6000,enableHighAccuracy:false,maximumAge:600000}
    );
  } else {
    showManual();
  }

  return ()=>{ cancelAnimationFrame(skyRaf); };
}
