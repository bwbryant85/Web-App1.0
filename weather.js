/* ════════════ WEATHER ════════════ */
const WX_ICONS = {0:'☀️',1:'🌤️',2:'⛅',3:'☁️',45:'🌫️',48:'🌫️',51:'🌦️',53:'🌦️',55:'🌧️',61:'🌧️',63:'🌧️',65:'🌧️',71:'🌨️',73:'❄️',75:'❄️',77:'❄️',80:'🌦️',81:'🌧️',82:'🌧️',85:'🌨️',86:'🌨️',95:'⛈️',96:'⛈️',99:'⛈️'};
const WX_DESC = {0:'Clear Sky',1:'Mainly Clear',2:'Partly Cloudy',3:'Overcast',45:'Foggy',48:'Icy Fog',51:'Light Drizzle',53:'Drizzle',55:'Heavy Drizzle',61:'Light Rain',63:'Rain',65:'Heavy Rain',71:'Light Snow',73:'Snow',75:'Heavy Snow',80:'Showers',81:'Rain Showers',82:'Heavy Showers',95:'Thunderstorm',96:'Hail Storm',99:'Heavy Hail'};

function initWeather() {
  let celsius = true, wdata = null;
  const wrap = document.createElement('div');
  wrap.className = 'wx-wrap';
  content.appendChild(wrap);

  const comDir = d => ['N','NE','E','SE','S','SW','W','NW'][Math.round(d / 45) % 8];
  const toT = v => celsius ? Math.round(v) : Math.round(v * 9 / 5 + 32);
  const u = () => celsius ? '°C' : '°F';

  const loading = m => {
    wrap.innerHTML = `<div class="ld"><div class="ld-ring"></div>${m || 'Locating...'}</div>`;
  };

  const render = () => {
    if (!wdata) return;
    const d = wdata;
    const icon = WX_ICONS[d.code] || '🌡️';
    const desc = WX_DESC[d.code] || 'Unknown';
    const daily = d.daily, hourly = d.hourly;

    const days = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
    let forecastHTML = '';
    if (daily && daily.time) {
      const allTemps = [...(daily.temperature_2m_max || []), ...(daily.temperature_2m_min || [])];
      const globalMin = Math.min(...allTemps.filter(Boolean));
      const globalMax = Math.max(...allTemps.filter(Boolean));
      for (let i = 0; i < Math.min(7, daily.time.length); i++) {
        const dt = new Date(daily.time[i] + 'T00:00:00');
        const dayLabel = i === 0 ? 'Today' : days[dt.getDay()];
        const hi = toT(daily.temperature_2m_max?.[i] ?? 0);
        const lo = toT(daily.temperature_2m_min?.[i] ?? 0);
        const code = daily.weather_code?.[i] ?? 0;
        const barMin = toT(globalMin), barMax = toT(globalMax);
        const barRange = barMax - barMin || 1;
        const fillLeft   = ((lo - barMin) / barRange * 100).toFixed(1);
        const fillWidth  = (((hi - lo) / barRange) * 100).toFixed(1);
        forecastHTML += `<div class="wx-fcast-row">
          <span class="wx-fcast-day">${dayLabel}</span>
          <span class="wx-fcast-ico">${WX_ICONS[code] || '🌡️'}</span>
          <span class="wx-fcast-lo">${lo}°</span>
          <div class="wx-fcast-bar-wrap">
            <div class="wx-fcast-bar-fill" style="left:${fillLeft}%;width:${fillWidth}%;background:linear-gradient(90deg,#4dd0e1,#81d4fa)"></div>
          </div>
          <span class="wx-fcast-hi">${hi}°</span>
        </div>`;
      }
    }

    let hourlyHTML = '';
    if (hourly && hourly.time) {
      const now = new Date();
      for (let i = 0; i < hourly.time.length && hourlyHTML.split('wx-hour-cell').length <= 25; i++) {
        const ht = new Date(hourly.time[i]);
        if (ht < now - 1800000) continue;
        const hLabel = i === 0 ? 'Now' : ht.toLocaleTimeString('en-US', { hour:'numeric', hour12:true });
        const code = hourly.weather_code?.[i] ?? 0;
        hourlyHTML += `<div class="wx-hour-cell">
          <span class="wx-hour-time">${hLabel}</span>
          <span class="wx-hour-ico">${WX_ICONS[code] || '🌡️'}</span>
          <span class="wx-hour-temp">${toT(hourly.temperature_2m?.[i] ?? 0)}°</span>
        </div>`;
      }
    }

    const uvIndex = d.uv || 0;
    const uvLabel = uvIndex <= 2 ? 'Low' : uvIndex <= 5 ? 'Moderate' : uvIndex <= 7 ? 'High' : uvIndex <= 10 ? 'Very High' : 'Extreme';

    wrap.innerHTML = `
      <div class="wx-scroll-body">
        <div class="wx-loc-bar">
          <span class="wx-loc-city">${d.city}</span>
          <button class="wx-unit-tog" id="wx-utog">${celsius ? '°C · Switch to °F' : '°F · Switch to °C'}</button>
        </div>
        <div class="wx-hero-section">
          <div class="wx-city-name">${d.city.split(',')[0]}</div>
          <div class="wx-hero-temp">${toT(d.tc)}°</div>
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

    document.getElementById('wx-utog').onclick = () => {
      celsius = !celsius;
      render();
    };
  };

  const fetchW = async (lat, lon, cityName) => {
    loading('Fetching weather…');
    try {
      const [wr, hr] = await Promise.all([
        fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,apparent_temperature,relative_humidity_2m,wind_speed_10m,wind_direction_10m,weather_code,uv_index,visibility&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max&hourly=temperature_2m,weather_code&timezone=auto&forecast_days=7`),
        Promise.resolve(null)
      ]);
      const wj = await wr.json();
      const c = wj.current, d = wj.daily, h = wj.hourly;
      let city = cityName;
      if (!city) {
        try {
          const gr = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json`);
          const gj = await gr.json();
          city = gj.address && (gj.address.city || gj.address.town || gj.address.village) || `${lat.toFixed(1)}°`;
        } catch(e) { city = `${lat.toFixed(1)}°, ${lon.toFixed(1)}°`; }
      }
      wdata = {
        tc:c.temperature_2m, feels:c.apparent_temperature,
        ws:c.wind_speed_10m, wd:c.wind_direction_10m,
        code:c.weather_code, city,
        hum:c.relative_humidity_2m,
        uv:Math.round(c.uv_index || 0),
        vis:Math.round((c.visibility || 0) / 1000),
        precip:(d && d.precipitation_probability_max && d.precipitation_probability_max[0]) || 0,
        daily:d, hourly:h
      };
      render();
    } catch(e) { showManual('Connection error. Try searching manually.'); }
  };

  const showManual = err => {
    err = err || '';
    const locBtn = navigator.geolocation
      ? '<button class="cyan-btn" id="wx-loc" style="margin-bottom:12px;font-size:.72rem;padding:14px 36px;width:100%;max-width:280px">📍 Use My Location</button>'
      : '';
    wrap.innerHTML = `<div style="width:100%;height:100%;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:12px;padding:89px 24px 60px;box-sizing:border-box">
      ${locBtn}
      <div style="font-size:3rem;line-height:1">🌍</div>
      <div style="font-family:'Share Tech Mono',monospace;font-size:.78rem;color:var(--text);letter-spacing:.06em;text-align:center">ENTER YOUR CITY</div>
      <div style="position:relative;width:100%;max-width:300px">
        <input class="wx-city-input" id="wxi" type="text" placeholder="e.g. Dunkirk, NY" autocomplete="off" spellcheck="false">
        <div class="wx-dropdown" id="wxd"></div>
      </div>
      ${err ? `<div style="font-family:'Share Tech Mono',monospace;font-size:.58rem;color:#ff9090;text-align:center;max-width:280px">${err}</div>` : ''}
      <button class="cyan-btn" id="wxgo">Search →</button>
    </div>`;

    const locEl = document.getElementById('wx-loc');
    if (locEl) {
      locEl.addEventListener('click', () => {
        loading('Requesting location…');
        navigator.geolocation.getCurrentPosition(
          p => fetchW(p.coords.latitude, p.coords.longitude, null),
          e => {
            let msg = 'Location access denied.';
            if (e.code === 1) msg = 'Blocked. Go to Settings › Safari › Location.';
            else if (e.code === 2) msg = 'Location unavailable. Try manual search.';
            else if (e.code === 3) msg = 'Timed out. Try manual search.';
            showManual(msg);
          },
          { timeout:15000, enableHighAccuracy:false, maximumAge:60000 }
        );
      });
    }

    const inp = document.getElementById('wxi'), drop = document.getElementById('wxd');
    if (!inp) return;
    let dbt = null;
    const sel = (lat, lon, name) => { drop.style.display = 'none'; loading('Fetching…'); fetchW(lat, lon, name); };
    const mkDrop = res => {
      if (!res || !res.length) { drop.style.display = 'none'; return; }
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
      if (q.length < 2) { drop.style.display = 'none'; return; }
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
        if (!d.results || !d.results.length) { showManual('City not found.'); return; }
        const loc = d.results[0];
        fetchW(loc.latitude, loc.longitude, loc.name + (loc.country ? ', ' + loc.country : ''));
      } catch(e) { showManual('Connection error.'); }
    };
    document.getElementById('wxgo').onclick = go;
    inp.onkeydown = e => { if (e.key === 'Enter') go(); };
    setTimeout(() => inp.focus(), 250);
  };

  // On open: request location immediately
  if (navigator.geolocation) {
    loading('Getting your location…');
    navigator.geolocation.getCurrentPosition(
      p => fetchW(p.coords.latitude, p.coords.longitude, null),
      e => {
        let msg = '';
        if (e.code === 1) msg = 'Location blocked. Tap "Use My Location" after enabling in Settings › Safari › Location.';
        showManual(msg);
      },
      { timeout:8000, enableHighAccuracy:false, maximumAge:300000 }
    );
  } else {
    showManual();
  }
  return () => {};
}
