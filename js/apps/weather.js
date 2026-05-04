/* ════════════ WEATHER ════════════ */
const WX_ICONS_DAY   = {0:'☀️',1:'🌤️',2:'⛅',3:'☁️',45:'🌫️',48:'🌫️',51:'🌦️',53:'🌦️',55:'🌧️',61:'🌧️',63:'🌧️',65:'🌧️',71:'🌨️',73:'❄️',75:'❄️',77:'❄️',80:'🌦️',81:'🌧️',82:'🌧️',85:'🌨️',86:'🌨️',95:'⛈️',96:'⛈️',99:'⛈️'};
const WX_ICONS_NIGHT = {0:'🌙',1:'🌙',2:'☁️',3:'☁️',45:'🌫️',48:'🌫️',51:'🌦️',53:'🌦️',55:'🌧️',61:'🌧️',63:'🌧️',65:'🌧️',71:'🌨️',73:'❄️',75:'❄️',77:'❄️',80:'🌦️',81:'🌧️',82:'🌧️',85:'🌨️',86:'🌨️',95:'⛈️',96:'⛈️',99:'⛈️'};
const WX_ICONS = WX_ICONS_DAY; // fallback
const WX_DESC = {0:'Clear Sky',1:'Mainly Clear',2:'Partly Cloudy',3:'Overcast',45:'Foggy',48:'Icy Fog',51:'Light Drizzle',53:'Drizzle',55:'Heavy Drizzle',61:'Light Rain',63:'Rain',65:'Heavy Rain',71:'Light Snow',73:'Snow',75:'Heavy Snow',80:'Showers',81:'Rain Showers',82:'Heavy Showers',95:'Thunderstorm',96:'Hail Storm',99:'Heavy Hail'};

function initWeather() {
  let celsius = true, wdata = null;
  const wrap = document.createElement('div');
  wrap.className = 'wx-wrap';

  /* Dynamic background helper — called after wdata is set */
  const applyBackground = () => {
    if (!wdata) return;
    const code = wdata.code, isDay = wdata.isDay;
    const tc = wdata.tc;

    // Pick gradient based on condition + time of day
    let bg;
    if (!isDay) {
      // Night — deep navy/purple sky, stars hinted via radial
      if ([95,96,99].includes(code))
        bg = 'linear-gradient(180deg,#1a0a2e 0%,#0d0818 40%,#060308 100%)';
      else if ([61,63,65,80,81,82].includes(code))
        bg = 'linear-gradient(180deg,#1a2030 0%,#0d1520 50%,#060a0f 100%)';
      else
        bg = 'linear-gradient(180deg,#0d1b3e 0%,#091228 40%,#040810 100%)';
    } else {
      // Daytime conditions
      if ([95,96,99].includes(code))      // thunderstorm
        bg = 'linear-gradient(180deg,#1c1f26 0%,#2d3040 40%,#3d3530 100%)';
      else if ([71,73,75,77,85,86].includes(code)) // snow
        bg = 'linear-gradient(180deg,#b0c4d8 0%,#d8e8f0 50%,#e8f0f8 100%)';
      else if ([61,63,65,80,81,82].includes(code)) // rain
        bg = 'linear-gradient(180deg,#2c3e50 0%,#3d5060 40%,#546070 100%)';
      else if ([45,48].includes(code))    // fog
        bg = 'linear-gradient(180deg,#8090a0 0%,#a0b0c0 50%,#b8c8d8 100%)';
      else if ([2,3].includes(code))      // cloudy
        bg = 'linear-gradient(180deg,#4a6080 0%,#607898 40%,#7898b0 100%)';
      else if (code === 1)                // partly cloudy
        bg = 'linear-gradient(180deg,#2980b9 0%,#6bb6e0 40%,#87ceeb 100%)';
      else {                              // clear/sunny
        if (tc > 30)
          bg = 'linear-gradient(180deg,#1a4a8a 0%,#2e6db0 30%,#5fa8d8 60%,#f4a460 100%)';
        else
          bg = 'linear-gradient(180deg,#1c4a8a 0%,#2e78b8 40%,#64b0e0 100%)';
      }
    }
    wrap.style.background = bg;
    wrap.style.backgroundAttachment = 'fixed';

    // Star overlay for night
    if (!isDay) {
      wrap.style.backgroundImage = bg + ', radial-gradient(ellipse at 20% 15%, rgba(255,255,255,.04) 0%, transparent 60%)';
    }
  };
  content.appendChild(wrap);

  const comDir = d => ['N','NE','E','SE','S','SW','W','NW'][Math.round(d / 45) % 8];
  const toT = v => celsius ? Math.round(v) : Math.round(v * 9 / 5 + 32);
  const u = () => celsius ? '°C' : '°F';

  const loading = m => {
    wrap.innerHTML = `<div class="ld"><div class="ld-ring"></div>${m || 'Locating...'}</div>`;
  };

  /* ── Temperature → colorful gradient (cold=blue → warm=orange → hot=red) ── */
  const tempColor = (lo, hi, globalMin, globalMax) => {
    // Normalise the hi temp across the week's range to pick a hue
    const range = globalMax - globalMin || 1;
    const t = (hi - globalMin) / range; // 0 = coldest day, 1 = hottest day
    // Cold days: cyan→blue, warm days: yellow→orange, hot days: orange→red
    if (t < 0.33)      return `linear-gradient(90deg,#4dd0e1,#29b6f6)`; // blue-ish
    else if (t < 0.55) return `linear-gradient(90deg,#81d4fa,#aed581)`; // blue→green
    else if (t < 0.70) return `linear-gradient(90deg,#fff176,#ffb300)`; // yellow→amber
    else if (t < 0.85) return `linear-gradient(90deg,#ffb300,#f57c00)`; // amber→orange
    else               return `linear-gradient(90deg,#f57c00,#e53935)`; // orange→red
  };

  /* ── Precipitation % colour ── */
  const precipColor = pct => pct >= 70 ? '#4dd0e1' : pct >= 40 ? '#81d4fa' : 'rgba(255,255,255,.4)';

  const render = () => {
    if (!wdata) return;
    const d = wdata;
    const wxIconSet = d.isDay ? WX_ICONS_DAY : WX_ICONS_NIGHT;
    const icon = wxIconSet[d.code] || (d.isDay ? '🌡️' : '🌙');
    const desc = WX_DESC[d.code] || 'Unknown';
    const daily = d.daily, hourly = d.hourly;

    /* ── 7-day forecast rows with colourful bars ── */
    const days = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
    let forecastHTML = '';
    if (daily && daily.time) {
      const maxTemps = daily.temperature_2m_max || [];
      const minTemps = daily.temperature_2m_min || [];
      const allTemps = [...maxTemps, ...minTemps].filter(v => v != null);
      const globalMin = Math.min(...allTemps);
      const globalMax = Math.max(...allTemps);

      for (let i = 0; i < Math.min(7, daily.time.length); i++) {
        const dt = new Date(daily.time[i] + 'T12:00:00');
        const dayLabel = i === 0 ? 'Today' : days[dt.getDay()];
        const rawHi  = maxTemps[i] ?? 0;
        const rawLo  = minTemps[i] ?? 0;
        const hi  = toT(rawHi);
        const lo  = toT(rawLo);
        const code = daily.weather_code?.[i] ?? 0;
        const precip = daily.precipitation_probability_max?.[i] ?? 0;

        // Bar position relative to week range
        const convMin = toT(globalMin), convMax = toT(globalMax);
        const barRange = convMax - convMin || 1;
        const fillLeft  = ((lo - convMin) / barRange * 100).toFixed(1);
        const fillWidth = ((hi - lo) / barRange * 100).toFixed(1);
        const grad = tempColor(rawLo, rawHi, globalMin, globalMax);

        const precipBadge = precip >= 20
          ? `<span style="font-family:'Share Tech Mono',monospace;font-size:.55rem;color:${precipColor(precip)};margin-right:4px;">${precip}%</span>`
          : '';

        forecastHTML += `<div class="wx-fcast-row">
          <span class="wx-fcast-day">${dayLabel}</span>
          <span class="wx-fcast-ico">${WX_ICONS[code] || '🌡️'}</span>
          ${precipBadge}<span class="wx-fcast-lo">${lo}°</span>
          <div class="wx-fcast-bar-wrap">
            <div class="wx-fcast-bar-fill" style="left:${fillLeft}%;width:${fillWidth}%;background:${grad};border-radius:4px;"></div>
          </div>
          <span class="wx-fcast-hi">${hi}°</span>
        </div>`;
      }
    }

    /* ── Hourly strip ── */
    let hourlyHTML = '';
    if (hourly && hourly.time) {
      const now = new Date();
      let shown = 0;
      for (let i = 0; i < hourly.time.length && shown < 24; i++) {
        const ht = new Date(hourly.time[i]);
        if (ht < now - 1800000) continue;
        const isNow = shown === 0;
        const hLabel = isNow ? 'Now' : ht.toLocaleTimeString('en-US', { hour:'numeric', hour12:true });
        const code = hourly.weather_code?.[i] ?? 0;
        const hourIsDay = (() => { const h2=ht.getHours(); return h2>=6&&h2<20; })();
        const precip = hourly.precipitation_probability?.[i] ?? 0;
        const precipStr = precip >= 20 ? `<span style="font-size:.5rem;color:#4dd0e1;">${precip}%</span>` : '';
        hourlyHTML += `<div class="wx-hour-cell">
          <span class="wx-hour-time">${hLabel}</span>
          <span class="wx-hour-ico">${(hourIsDay?WX_ICONS_DAY:WX_ICONS_NIGHT)[code] || (hourIsDay?'🌡️':'🌙')}</span>
          <span class="wx-hour-temp">${toT(hourly.temperature_2m?.[i] ?? 0)}°</span>
          ${precipStr}
        </div>`;
        shown++;
      }
    }

    const uvIndex = d.uv || 0;
    const uvLabel = uvIndex <= 2 ? 'Low' : uvIndex <= 5 ? 'Moderate' : uvIndex <= 7 ? 'High' : uvIndex <= 10 ? 'Very High' : 'Extreme';
    const dewPoint = d.dew != null ? toT(d.dew) + u() : '—';

    wrap.innerHTML = `
      <div class="wx-scroll-body">
        <div class="wx-loc-bar">
          <span class="wx-loc-city">${d.city}</span>
          <button class="wx-unit-tog" id="wx-utog">${celsius ? '°F · Switch' : '°C · Switch'}</button>
        </div>
        <div class="wx-hero-section">
          <div class="wx-city-name">${d.city.split(',')[0]}</div>
          <div class="wx-hero-temp" style="color:#fff;text-shadow:0 2px 20px rgba(0,0,0,.3);">${toT(d.tc)}°</div>
          <div class="wx-hero-cond">${icon} ${desc}</div>
          <div class="wx-hero-hl">H:${toT(daily?.temperature_2m_max?.[0] ?? d.tc)}° · L:${toT(daily?.temperature_2m_min?.[0] ?? d.tc)}°</div>
        </div>
        <div class="wx-glass">
          <div class="wx-section-label">🕐 Hourly Forecast</div>
          <div class="wx-hourly-scroll">${hourlyHTML}</div>
        </div>
        <div class="wx-glass">
          <div class="wx-section-label">📅 7-Day Forecast</div>
          <div class="wx-forecast-list">${forecastHTML}</div>
        </div>
        <div class="wx-conditions-grid">
          <div class="wx-cond-tile wx-glass">
            <div class="wx-cond-label">💧 Humidity</div>
            <div class="wx-cond-val">${d.hum}%</div>
            <div class="wx-cond-sub">${d.hum < 30 ? 'Dry' : d.hum < 60 ? 'Comfortable' : 'Humid'}</div>
          </div>
          <div class="wx-cond-tile wx-glass">
            <div class="wx-cond-label">💨 Wind</div>
            <div class="wx-cond-val">${Math.round(d.ws)}</div>
            <div class="wx-cond-sub">km/h · ${comDir(d.wd)}</div>
          </div>
          <div class="wx-cond-tile wx-glass">
            <div class="wx-cond-label">🌡️ Feels Like</div>
            <div class="wx-cond-val">${toT(d.feels)}°</div>
            <div class="wx-cond-sub">${u()}</div>
          </div>
          <div class="wx-cond-tile wx-glass">
            <div class="wx-cond-label">☀️ UV Index</div>
            <div class="wx-cond-val">${uvIndex}</div>
            <div class="wx-cond-sub">${uvLabel}</div>
          </div>
          <div class="wx-cond-tile wx-glass">
            <div class="wx-cond-label">🌧️ Precip Chance</div>
            <div class="wx-cond-val">${d.precip}%</div>
            <div class="wx-cond-sub">Today</div>
          </div>
          <div class="wx-cond-tile wx-glass">
            <div class="wx-cond-label">👁️ Visibility</div>
            <div class="wx-cond-val">${d.vis}</div>
            <div class="wx-cond-sub">km</div>
          </div>
        </div>
      </div>`;

    document.getElementById('wx-utog').onclick = () => { celsius = !celsius; render(); };
  };

  const fetchW = async (lat, lon, cityName) => {
    loading('Fetching weather…');
    try {
      const wr = await fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}` +
        `&current=temperature_2m,apparent_temperature,relative_humidity_2m,dew_point_2m,wind_speed_10m,wind_direction_10m,weather_code,uv_index,visibility,is_day` +
        `&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max` +
        `&hourly=temperature_2m,weather_code,precipitation_probability` +
        `&timezone=auto&forecast_days=7`
      );
      const wj = await wr.json();
      const c = wj.current, dl = wj.daily, h = wj.hourly;

      let city = cityName;
      if (!city) {
        try {
          const gr = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json`);
          const gj = await gr.json();
          city = (gj.address && (gj.address.city || gj.address.town || gj.address.village)) || `${lat.toFixed(1)}°`;
        } catch(e) { city = `${lat.toFixed(1)}°, ${lon.toFixed(1)}°`; }
      }

      wdata = {
        tc:c.temperature_2m, feels:c.apparent_temperature,
        ws:c.wind_speed_10m, wd:c.wind_direction_10m,
        code:c.weather_code, city,
        hum:c.relative_humidity_2m,
        dew:c.dew_point_2m,
        uv:Math.round(c.uv_index || 0),
        vis:Math.round((c.visibility || 0) / 1000),
        precip:(dl && dl.precipitation_probability_max && dl.precipitation_probability_max[0]) || 0,
        daily:dl, hourly:h,
        isDay: c.is_day === 1
      };
      applyBackground();
      render();
    } catch(e) { showManual('Connection error. Try searching manually.'); }
  };

  /* ── Manual search / location fallback ──
     Always shown when geolocation is blocked or fails.
     Does NOT say "blocked" — just gives the user tools to get weather. */
  const showManual = (err) => {
    err = err || '';

    // Determine whether to show the location button at all
    const geoAvail = !!navigator.geolocation;
    const locBtnHTML = geoAvail
      ? `<button id="wx-loc" style="font-family:'Orbitron',sans-serif;font-size:.62rem;letter-spacing:.1em;text-transform:uppercase;color:#050508;background:var(--cyan);border:none;padding:13px 0;border-radius:22px;cursor:pointer;box-shadow:var(--gc);-webkit-tap-highlight-color:transparent;width:100%;max-width:280px;">📍 Use My Location</button>`
      : '';

    // If err mentions "blocked" swap it for a more helpful instruction
    let errMsg = err;
    if (err && (err.toLowerCase().includes('block') || err.toLowerCase().includes('denied'))) {
      errMsg = 'Location access is off. Enable it in Settings → Privacy → Location Services → Safari, then tap "Use My Location" again. Or just search below.';
    }

    wrap.innerHTML = `
      <div style="width:100%;height:100%;display:flex;flex-direction:column;background:linear-gradient(180deg,#0d1b3e 0%,#091228 60%,#040810 100%);box-sizing:border-box;overflow-y:auto;-webkit-overflow-scrolling:touch;">

        <!-- Top spacer for Dynamic Island -->
        <div style="height:${SA.t + 20}px;flex-shrink:0;"></div>

        <!-- Icon + title area -->
        <div style="flex:1;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:0 28px 20px;gap:0;">

          <!-- Weather globe animation -->
          <div style="font-size:5.5rem;line-height:1;margin-bottom:16px;filter:drop-shadow(0 4px 20px rgba(100,180,255,.4));animation:wx-float 3s ease-in-out infinite;">🌍</div>

          <div style="font-family:'Orbitron',sans-serif;font-size:1.4rem;font-weight:900;color:#fff;letter-spacing:.08em;text-align:center;margin-bottom:6px;">iPOCKET Weather</div>
          <div style="font-family:'Share Tech Mono',monospace;font-size:.62rem;color:rgba(255,255,255,.35);letter-spacing:.12em;text-align:center;margin-bottom:28px;">WHERE ARE YOU?</div>

          <!-- Location button — big and prominent -->
          ${geoAvail ? `
          <button id="wx-loc" style="
            font-family:'Orbitron',sans-serif;font-size:.78rem;font-weight:900;
            letter-spacing:.12em;text-transform:uppercase;
            color:#030f08;background:linear-gradient(135deg,#00ffaa,#00cc88);
            border:none;padding:18px 0;border-radius:50px;cursor:pointer;
            box-shadow:0 6px 0 #007744,0 8px 30px rgba(0,255,150,.4);
            -webkit-tap-highlight-color:transparent;
            width:100%;max-width:320px;margin-bottom:24px;
            transition:transform .1s,box-shadow .1s;">
            📍 &nbsp;Use My Location
          </button>` : ''}

          <!-- Divider -->
          <div style="display:flex;align-items:center;gap:12px;width:100%;max-width:320px;margin-bottom:20px;">
            <div style="flex:1;height:1px;background:rgba(255,255,255,.1);"></div>
            <div style="font-family:'Share Tech Mono',monospace;font-size:.52rem;color:rgba(255,255,255,.25);letter-spacing:.1em;">OR SEARCH</div>
            <div style="flex:1;height:1px;background:rgba(255,255,255,.1);"></div>
          </div>

          <!-- Search input -->
          <div style="position:relative;width:100%;max-width:320px;margin-bottom:10px;">
            <input class="wx-city-input" id="wxi" type="text"
              placeholder="City name, e.g. New York"
              autocomplete="off" spellcheck="false"
              style="font-size:.88rem;padding:16px 50px 16px 18px;border-radius:18px;
                background:rgba(255,255,255,.08);border:1.5px solid rgba(255,255,255,.15);
                color:#fff;width:100%;box-sizing:border-box;
                font-family:'Share Tech Mono',monospace;letter-spacing:.04em;
                outline:none;-webkit-appearance:none;">
            <button id="wxgo" style="
              position:absolute;right:8px;top:50%;transform:translateY(-50%);
              background:rgba(0,255,150,.15);border:1px solid rgba(0,255,150,.3);
              color:#00ffaa;border-radius:12px;padding:8px 12px;
              font-family:'Orbitron',sans-serif;font-size:.62rem;font-weight:700;
              cursor:pointer;-webkit-tap-highlight-color:transparent;">→</button>
            <div class="wx-dropdown" id="wxd" style="top:calc(100% + 6px);"></div>
          </div>

          ${errMsg ? `<div style="font-family:'Share Tech Mono',monospace;font-size:.54rem;color:rgba(255,180,80,.85);text-align:center;max-width:300px;line-height:1.6;margin-top:8px;background:rgba(255,150,0,.08);border:1px solid rgba(255,150,0,.15);border-radius:14px;padding:12px 16px;">${errMsg}</div>` : ''}

        </div>

        <!-- Bottom info -->
        <div style="text-align:center;padding:0 24px 40px;font-family:'Share Tech Mono',monospace;font-size:.5rem;color:rgba(255,255,255,.15);letter-spacing:.08em;line-height:1.8;">
          Powered by Open-Meteo &amp; OpenStreetMap
        </div>
      </div>

      <style>
        @keyframes wx-float {
          0%,100%{transform:translateY(0);}
          50%{transform:translateY(-10px);}
        }
        #wxi::placeholder{color:rgba(255,255,255,.3);}
        #wxi:focus{background:rgba(255,255,255,.12);border-color:rgba(0,255,150,.4);}
      </style>
    `;

    // Location button
    const locEl = document.getElementById('wx-loc');
    if (locEl) {
      locEl.addEventListener('click', () => {
        loading('Requesting location…');
        navigator.geolocation.getCurrentPosition(
          p => fetchW(p.coords.latitude, p.coords.longitude, null),
          e => {
            let msg = 'Could not get location.';
            if (e.code === 1) {
              // In PWA mode the permission dialog never appears — give targeted help
              msg = isStandalone
                ? 'Location doesn\'t work in home screen mode. Open iPOCKET in Safari instead, allow location there, then save to home screen again. Or just search below.'
                : 'Location access is off. Go to Settings → Privacy → Location Services → Safari → Allow. Then tap Use My Location again.';
            } else if (e.code === 2) {
              msg = 'Location unavailable right now. Try searching instead.';
            } else if (e.code === 3) {
              msg = 'Location request timed out. Try searching instead.';
            }
            showManual(msg);
          },
          { timeout:12000, enableHighAccuracy:false, maximumAge:60000 }
        );
      });
    }

    // Search input
    const inp = document.getElementById('wxi');
    const drop = document.getElementById('wxd');
    if (!inp) return;

    let dbt = null;
    const sel = (lat, lon, name) => { drop.style.display='none'; loading('Fetching…'); fetchW(lat, lon, name); };
    const mkDrop = res => {
      if (!res || !res.length) { drop.style.display='none'; return; }
      drop.innerHTML = res.map(loc => {
        const lbl = [loc.name, loc.admin1, loc.country].filter(Boolean).join(', ');
        return `<div class="wx-drop-item" data-lat="${loc.latitude}" data-lon="${loc.longitude}" data-name="${lbl}">${lbl}</div>`;
      }).join('');
      drop.style.display = 'block';
      drop.querySelectorAll('.wx-drop-item').forEach(el => {
        const go = () => sel(+el.dataset.lat, +el.dataset.lon, el.dataset.name);
        el.addEventListener('touchstart', e => { e.preventDefault(); go(); }, { passive:false });
        el.addEventListener('mousedown', go);
      });
    };

    inp.addEventListener('input', () => {
      clearTimeout(dbt);
      const q = inp.value.trim();
      if (q.length < 2) { drop.style.display='none'; return; }
      dbt = setTimeout(async () => {
        try {
          const r = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(q)}&count=8&format=json`);
          const d = await r.json();
          mkDrop(d.results || []);
        } catch(e) {}
      }, 280);
    });

    const go = async () => {
      const first = drop.querySelector('.wx-drop-item');
      if (first) { sel(+first.dataset.lat, +first.dataset.lon, first.dataset.name); return; }
      const city = inp.value.trim();
      if (!city) return;
      loading('Searching…');
      try {
        const r = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1&format=json`);
        const d = await r.json();
        if (!d.results || !d.results.length) { showManual('City not found. Try a different name.'); return; }
        const loc = d.results[0];
        fetchW(loc.latitude, loc.longitude, loc.name + (loc.country ? ', ' + loc.country : ''));
      } catch(e) { showManual('Connection error.'); }
    };

    document.getElementById('wxgo').onclick = go;
    inp.onkeydown = e => { if (e.key === 'Enter') go(); };
    setTimeout(() => inp.focus(), 300);
  };

  /* ── On open: try geolocation.
     EXCEPTION: when running as a PWA (saved to home screen), iOS gives the
     app a standalone browsing context that does NOT inherit Safari's location
     permission — the prompt never fires and the request silently times out.
     Detect standalone mode and skip straight to manual search instead. ── */
  const isStandalone = window.navigator.standalone === true
    || window.matchMedia('(display-mode: standalone)').matches;

  if (isStandalone) {
    // PWA mode: location API is unreliable — skip auto-request entirely
    showManual('Running as a home screen app. Tap "Use My Location" or search your city below.');
  } else if (navigator.geolocation) {
    loading('Getting your location…');
    navigator.geolocation.getCurrentPosition(
      p => fetchW(p.coords.latitude, p.coords.longitude, null),
      e => {
        const msg = e.code === 1
          ? 'Location access is off. Enable it in Settings → Privacy → Location Services → Safari, then tap "Use My Location". Or just search below.'
          : '';
        showManual(msg);
      },
      { timeout:6000, enableHighAccuracy:false, maximumAge:600000 }
    );
  } else {
    showManual();
  }

  return () => {};
}
