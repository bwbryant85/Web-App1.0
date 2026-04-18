/* ════════════ SPORTS SCORES ════════════
   Uses ESPN's unofficial public scoreboard API — no key needed.
   Endpoint: https://site.api.espn.com/apis/site/v2/sports/{sport}/{league}/scoreboard?dates=YYYYMMDD
   ════════════════════════════════════════ */
function initSports() {

  /* ── Sport definitions ── */
  const SPORTS = [
    { id:'nfl',         name:'NFL',          sport:'football',      league:'nfl',           ico:'🏈', col:'#004C97' },
    { id:'nba',         name:'NBA',          sport:'basketball',    league:'nba',            ico:'🏀', col:'#C9082A' },
    { id:'mlb',         name:'MLB',          sport:'baseball',      league:'mlb',            ico:'⚾', col:'#002D72' },
    { id:'nhl',         name:'NHL',          sport:'hockey',        league:'nhl',            ico:'🏒', col:'#0033A0' },
    { id:'wnba',        name:'WNBA',         sport:'basketball',    league:'wnba',           ico:'🏀', col:'#FF6900' },
    { id:'mls',         name:'MLS',          sport:'soccer',        league:'usa.1',          ico:'⚽', col:'#005293' },
    { id:'epl',         name:'Premier Lg',   sport:'soccer',        league:'eng.1',          ico:'⚽', col:'#3D195B' },
    { id:'laliga',      name:'La Liga',       sport:'soccer',        league:'esp.1',          ico:'⚽', col:'#EE3524' },
    { id:'bundesliga',  name:'Bundesliga',    sport:'soccer',        league:'ger.1',          ico:'⚽', col:'#D3010C' },
    { id:'seriea',      name:'Serie A',       sport:'soccer',        league:'ita.1',          ico:'⚽', col:'#024494' },
    { id:'ucl',         name:'Champions Lg',  sport:'soccer',        league:'uefa.champions', ico:'⭐', col:'#001489' },
    { id:'ncaaf',       name:'College FB',    sport:'football',      league:'college-football',ico:'🏈',col:'#BF5700' },
    { id:'ncaab',       name:'College BB',    sport:'basketball',    league:'mens-college-basketball',ico:'🏀',col:'#003087' },
    { id:'f1',          name:'Formula 1',     sport:'racing',        league:'f1',             ico:'🏎️', col:'#E8002D' },
    { id:'mma',         name:'MMA / UFC',     sport:'mma',           league:'ufc',            ico:'🥊', col:'#D20A0A' },
    { id:'golf',        name:'Golf / PGA',    sport:'golf',          league:'pga',            ico:'⛳', col:'#00843D' },
    { id:'tennis',      name:'Tennis / ATP',  sport:'tennis',        league:'atp',            ico:'🎾', col:'#C8A951' },
  ];

  /* ── State ── */
  let selectedSport = null;
  let selectedDate  = new Date();
  let loading       = false;
  let cache         = {}; // key: `${sportId}_${dateStr}`

  /* ── Root ── */
  const root = document.createElement('div');
  root.style.cssText = 'width:100%;height:100%;display:flex;flex-direction:column;background:#050508;overflow:hidden;position:relative;';
  content.appendChild(root);

  /* ── Header ── */
  const header = document.createElement('div');
  header.style.cssText = 'flex-shrink:0;padding:89px 16px 0;background:#050508;';
  root.appendChild(header);

  const headerTop = document.createElement('div');
  headerTop.style.cssText = 'display:flex;align-items:center;gap:12px;margin-bottom:14px;';
  headerTop.innerHTML = `
    <button id="sp-back" style="display:none;font-family:'Orbitron',sans-serif;font-size:.5rem;letter-spacing:.14em;text-transform:uppercase;color:var(--cyan);background:transparent;border:none;cursor:pointer;-webkit-tap-highlight-color:transparent;padding:4px 0;flex-shrink:0;">← Back</button>
    <div id="sp-title" style="font-family:'Orbitron',sans-serif;font-size:.65rem;letter-spacing:.24em;text-transform:uppercase;color:var(--cyan);text-shadow:var(--gc);flex:1;">⚡ Sports</div>
    <div id="sp-live-badge" style="display:none;font-family:'Share Tech Mono',monospace;font-size:.48rem;letter-spacing:.12em;text-transform:uppercase;background:#c62828;color:#fff;padding:3px 8px;border-radius:8px;box-shadow:0 0 10px rgba(198,40,40,.7);animation:sp-blink 1.2s infinite;">● LIVE</div>`;
  header.appendChild(headerTop);

  /* ── Date strip (shown when a sport is selected) ── */
  const dateStrip = document.createElement('div');
  dateStrip.id = 'sp-date-strip';
  dateStrip.style.cssText = 'display:none;overflow-x:auto;scrollbar-width:none;-webkit-overflow-scrolling:touch;white-space:nowrap;padding-bottom:12px;margin:0 -16px;padding-left:16px;padding-right:16px;';
  header.appendChild(dateStrip);

  /* ── Body ── */
  const body = document.createElement('div');
  body.style.cssText = 'flex:1;overflow:hidden;position:relative;';
  root.appendChild(body);

  /* ── Sport grid panel ── */
  const gridPanel = document.createElement('div');
  gridPanel.style.cssText = 'position:absolute;inset:0;overflow-y:auto;-webkit-overflow-scrolling:touch;padding:12px 14px 40px;';
  body.appendChild(gridPanel);

  /* ── Games panel ── */
  const gamesPanel = document.createElement('div');
  gamesPanel.style.cssText = 'position:absolute;inset:0;overflow-y:auto;-webkit-overflow-scrolling:touch;padding:8px 14px 40px;transform:translateX(100%);transition:transform .32s cubic-bezier(.34,1.56,.64,1);';
  body.appendChild(gamesPanel);

  /* ── Inject keyframes ── */
  if (!document.getElementById('sp-styles')) {
    const st = document.createElement('style');
    st.id = 'sp-styles';
    st.textContent = `
      @keyframes sp-blink { 0%,100%{opacity:1} 50%{opacity:.3} }
      @keyframes sp-slide-in { from{opacity:0;transform:translateY(14px)} to{opacity:1;transform:translateY(0)} }
      @keyframes sp-fade-in { from{opacity:0} to{opacity:1} }
      .sp-game-card { animation: sp-slide-in .35s both; }
    `;
    document.head.appendChild(st);
  }

  /* ════ DATE HELPERS ════ */
  const fmtDateKey = d => {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}${m}${day}`;
  };

  const fmtDateLabel = d => {
    const now = new Date();
    const diff = Math.round((new Date(d.getFullYear(), d.getMonth(), d.getDate()) - new Date(now.getFullYear(), now.getMonth(), now.getDate())) / 86400000);
    if (diff === -1) return 'Yesterday';
    if (diff === 0)  return 'Today';
    if (diff === 1)  return 'Tomorrow';
    return d.toLocaleDateString('en-US', { weekday:'short', month:'short', day:'numeric' });
  };

  const fmtTime = isoStr => {
    try {
      const d = new Date(isoStr);
      return d.toLocaleTimeString('en-US', { hour:'numeric', minute:'2-digit', hour12:true });
    } catch(e) { return '—'; }
  };

  /* ════ BUILD SPORT GRID ════ */
  const buildGrid = () => {
    gridPanel.innerHTML = '';
    const grid = document.createElement('div');
    grid.style.cssText = 'display:grid;grid-template-columns:1fr 1fr;gap:11px;';

    SPORTS.forEach((sp, i) => {
      const card = document.createElement('div');
      card.style.cssText = `
        display:flex;align-items:center;gap:12px;
        padding:15px 14px;border-radius:18px;
        background:rgba(255,255,255,.03);
        border:1px solid ${sp.col}40;
        box-shadow:0 0 20px ${sp.col}12;
        cursor:pointer;-webkit-tap-highlight-color:transparent;
        transition:transform .15s,background .15s;
        animation:sp-fade-in .4s ${i * .04}s both;
        position:relative;overflow:hidden;
      `;
      // Accent glow top edge
      card.innerHTML = `
        <div style="position:absolute;top:0;left:0;right:0;height:2px;background:linear-gradient(90deg,${sp.col},transparent);border-radius:2px 2px 0 0;"></div>
        <span style="font-size:1.8rem;line-height:1;flex-shrink:0;">${sp.ico}</span>
        <div>
          <div style="font-family:'Orbitron',sans-serif;font-size:.55rem;letter-spacing:.1em;text-transform:uppercase;color:var(--text);line-height:1.3;">${sp.name}</div>
        </div>
        <div style="position:absolute;right:12px;top:50%;transform:translateY(-50%);font-size:.7rem;color:${sp.col};opacity:.5;">›</div>`;

      card.addEventListener('touchstart', () => { card.style.transform = 'scale(.96)'; card.style.background = `${sp.col}18`; }, { passive:true });
      card.addEventListener('touchend',   () => { card.style.transform = ''; card.style.background = 'rgba(255,255,255,.03)'; }, { passive:true });
      card.addEventListener('click', () => openSport(sp));
      grid.appendChild(card);
    });

    gridPanel.appendChild(grid);
  };

  /* ════ BUILD DATE STRIP ════ */
  const buildDateStrip = () => {
    dateStrip.innerHTML = '';
    // Show -3 days to +7 days (10 total, or whatever ESPN supports)
    for (let offset = -3; offset <= 7; offset++) {
      const d = new Date(new Date().setDate(new Date().getDate() + offset));
      const btn = document.createElement('button');
      const isToday = offset === 0;
      const isSelected = fmtDateKey(d) === fmtDateKey(selectedDate);
      btn.style.cssText = `
        display:inline-flex;flex-direction:column;align-items:center;gap:2px;
        margin-right:6px;padding:7px 14px;border-radius:14px;
        background:${isSelected ? 'var(--cyan)' : 'rgba(255,255,255,.05)'};
        border:1px solid ${isSelected ? 'var(--cyan)' : 'rgba(255,255,255,.08)'};
        color:${isSelected ? '#050508' : isToday ? 'var(--cyan)' : 'var(--dim)'};
        cursor:pointer;-webkit-tap-highlight-color:transparent;
        transition:background .15s,color .15s;white-space:nowrap;
        font-family:'Orbitron',sans-serif;font-size:.42rem;letter-spacing:.1em;text-transform:uppercase;
      `;
      const dayName = offset === 0 ? 'TODAY' : offset === -1 ? 'YEST' : d.toLocaleDateString('en-US',{weekday:'short'}).toUpperCase();
      const dayNum  = d.getDate();
      btn.innerHTML = `<span style="font-size:.52rem;font-weight:700;">${dayName}</span><span style="font-size:.7rem;font-weight:900;">${dayNum}</span>`;
      btn.addEventListener('click', () => {
        selectedDate = d;
        buildDateStrip();
        fetchGames();
      });
      dateStrip.appendChild(btn);
    }
    // Scroll selected into view
    setTimeout(() => {
      const btns = dateStrip.querySelectorAll('button');
      btns[3]?.scrollIntoView({ inline:'center', behavior:'smooth' }); // today is index 3
    }, 50);
  };

  /* ════ OPEN SPORT ════ */
  const openSport = sp => {
    haptic('medium');
    selectedSport = sp;
    selectedDate  = new Date();

    // Update header
    document.getElementById('sp-title').textContent = `${sp.ico} ${sp.name}`;
    document.getElementById('sp-back').style.display = '';
    document.getElementById('sp-date-strip').style.display = '';

    buildDateStrip();

    // Slide panels
    gridPanel.style.transition  = 'transform .32s cubic-bezier(.34,1.56,.64,1)';
    gridPanel.style.transform   = 'translateX(-100%)';
    gamesPanel.style.transform  = 'translateX(0)';

    fetchGames();
  };

  /* ════ BACK TO GRID ════ */
  document.getElementById('sp-back').addEventListener('click', () => {
    haptic('light');
    selectedSport = null;
    document.getElementById('sp-title').textContent        = '⚡ Sports';
    document.getElementById('sp-back').style.display      = 'none';
    document.getElementById('sp-date-strip').style.display = 'none';
    document.getElementById('sp-live-badge').style.display = 'none';

    gridPanel.style.transform  = 'translateX(0)';
    gamesPanel.style.transform = 'translateX(100%)';
    gamesPanel.innerHTML       = '';
  });

  /* ════ FETCH GAMES ════ */
  const fetchGames = async () => {
    if (!selectedSport || loading) return;
    const sp = selectedSport;
    const dateKey = fmtDateKey(selectedDate);
    const cacheKey = `${sp.id}_${dateKey}`;

    gamesPanel.innerHTML = `
      <div style="display:flex;flex-direction:column;align-items:center;justify-content:center;gap:14px;min-height:200px;padding:40px 20px;">
        <div class="ld-ring"></div>
        <div style="font-family:'Share Tech Mono',monospace;font-size:.62rem;color:var(--dim);letter-spacing:.14em;text-transform:uppercase;">Fetching ${sp.name}…</div>
      </div>`;

    if (cache[cacheKey]) {
      renderGames(cache[cacheKey], sp);
      return;
    }

    loading = true;
    try {
      const url = `https://site.api.espn.com/apis/site/v2/sports/${sp.sport}/${sp.league}/scoreboard?dates=${dateKey}&limit=50`;
      const res = await fetch(url);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      cache[cacheKey] = data;
      // Only render if sport hasn't changed while fetching
      if (selectedSport?.id === sp.id) renderGames(data, sp);
    } catch(e) {
      gamesPanel.innerHTML = `
        <div style="display:flex;flex-direction:column;align-items:center;justify-content:center;gap:14px;min-height:200px;padding:40px 20px;text-align:center;">
          <div style="font-size:2.5rem;">📡</div>
          <div style="font-family:'Share Tech Mono',monospace;font-size:.65rem;color:var(--dim);letter-spacing:.1em;text-transform:uppercase;">Could not load games</div>
          <div style="font-family:'Share Tech Mono',monospace;font-size:.55rem;color:rgba(255,255,255,.25);max-width:220px;line-height:1.6;">${e.message}</div>
          <button onclick="fetchGames()" style="font-family:'Orbitron',sans-serif;font-size:.52rem;letter-spacing:.12em;text-transform:uppercase;color:#050508;background:var(--cyan);border:none;padding:10px 22px;border-radius:18px;cursor:pointer;">Retry</button>
        </div>`;
    } finally {
      loading = false;
    }
  };

  /* ════ RENDER GAMES ════ */
  const renderGames = (data, sp) => {
    gamesPanel.innerHTML = '';
    const events = data.events || [];
    let hasLive = false;

    if (!events.length) {
      gamesPanel.innerHTML = `
        <div style="display:flex;flex-direction:column;align-items:center;justify-content:center;gap:14px;min-height:240px;padding:40px 20px;text-align:center;">
          <div style="font-size:3rem;">${sp.ico}</div>
          <div style="font-family:'Orbitron',sans-serif;font-size:.6rem;letter-spacing:.18em;text-transform:uppercase;color:var(--dim);">No Games</div>
          <div style="font-family:'Share Tech Mono',monospace;font-size:.58rem;color:rgba(255,255,255,.2);line-height:1.6;">No ${sp.name} games scheduled for ${fmtDateLabel(selectedDate)}.</div>
        </div>`;
      document.getElementById('sp-live-badge').style.display = 'none';
      return;
    }

    events.forEach((event, idx) => {
      const comp = event.competitions?.[0];
      if (!comp) return;

      const competitors = comp.competitors || [];
      const home = competitors.find(c => c.homeAway === 'home') || competitors[1] || {};
      const away = competitors.find(c => c.homeAway === 'away') || competitors[0] || {};

      const status     = comp.status?.type?.description || 'Scheduled';
      const statusShort = comp.status?.type?.shortDetail || status;
      const isLive     = comp.status?.type?.state === 'in';
      const isFinal    = comp.status?.type?.state === 'post';
      const clock      = comp.status?.displayClock || '';
      const period     = comp.status?.period || 0;
      const venue      = comp.venue?.fullName || '';
      const broadcast  = comp.broadcasts?.[0]?.names?.[0] || '';

      if (isLive) hasLive = true;

      // Score
      const homeScore = home.score ?? '—';
      const awayScore = away.score ?? '—';
      const homeWin   = isFinal && parseInt(homeScore) > parseInt(awayScore);
      const awayWin   = isFinal && parseInt(awayScore) > parseInt(homeScore);

      // Team info
      const homeName  = home.team?.shortDisplayName || home.team?.displayName || 'Home';
      const awayName  = away.team?.shortDisplayName || away.team?.displayName || 'Away';
      const homeLogo  = home.team?.logo || '';
      const awayLogo  = away.team?.logo || '';
      const homeAbbr  = home.team?.abbreviation || homeName.slice(0,3).toUpperCase();
      const awayAbbr  = away.team?.abbreviation || awayName.slice(0,3).toUpperCase();
      const homeColor = '#' + (home.team?.color || '00ffcc');
      const awayColor = '#' + (away.team?.color || 'ff4af8');

      /* ── Status badge ── */
      let statusHTML = '';
      if (isLive) {
        const periodLabel = sp.sport === 'baseball' ? `${getPeriodLabel('baseball', period)}` :
                            sp.sport === 'soccer'   ? `${period === 1 ? '1st Half' : '2nd Half'}` :
                            sp.sport === 'hockey'   ? `P${period}` :
                            sp.sport === 'football' ? `Q${period}` :
                            sp.sport === 'basketball' ? `Q${period}` : `P${period}`;
        statusHTML = `<div style="display:flex;align-items:center;gap:5px;">
          <span style="width:7px;height:7px;border-radius:50%;background:#ff4444;box-shadow:0 0 8px #ff4444;animation:sp-blink 1s infinite;display:inline-block;flex-shrink:0;"></span>
          <span style="font-family:'Share Tech Mono',monospace;font-size:.58rem;color:#ff6b6b;letter-spacing:.06em;">${periodLabel} ${clock}</span>
        </div>`;
      } else if (isFinal) {
        statusHTML = `<span style="font-family:'Share Tech Mono',monospace;font-size:.58rem;color:var(--dim);letter-spacing:.08em;">Final${statusShort.includes('OT') || statusShort.includes('OT') ? ' (OT)' : ''}</span>`;
      } else {
        statusHTML = `<span style="font-family:'Share Tech Mono',monospace;font-size:.58rem;color:var(--dim);letter-spacing:.08em;">${fmtTime(event.date)}</span>`;
      }

      /* ── Card ── */
      const card = document.createElement('div');
      card.className = 'sp-game-card';
      card.style.cssText = `
        margin-bottom:10px;border-radius:20px;overflow:hidden;
        background:rgba(255,255,255,.03);
        border:1px solid ${isLive ? 'rgba(255,68,68,.35)' : 'rgba(255,255,255,.06)'};
        box-shadow:${isLive ? '0 0 18px rgba(255,68,68,.12)' : '0 2px 12px rgba(0,0,0,.3)'};
        animation-delay:${idx * .05}s;
        position:relative;overflow:hidden;
      `;

      // Top accent line uses team colors
      const accentLine = `<div style="height:2px;background:linear-gradient(90deg,${awayColor},${homeColor});opacity:.6;"></div>`;

      // Team logo img (with emoji fallback)
      const logoImg = (url, abbr, size) => url
        ? `<img src="${url}" style="width:${size}px;height:${size}px;object-fit:contain;border-radius:4px;" onerror="this.style.display='none';this.nextSibling.style.display='flex'"><span style="display:none;font-family:'Orbitron',sans-serif;font-size:${size*.28}px;font-weight:900;color:var(--dim);">${abbr}</span>`
        : `<span style="font-family:'Orbitron',sans-serif;font-size:${size*.28}px;font-weight:900;color:var(--dim);">${abbr}</span>`;

      card.innerHTML = `
        ${accentLine}
        <div style="padding:14px 16px 12px;">
          <!-- Teams row -->
          <div style="display:flex;align-items:center;gap:10px;margin-bottom:10px;">
            <!-- Away team -->
            <div style="flex:1;display:flex;flex-direction:column;align-items:center;gap:6px;opacity:${awayWin === false && isFinal ? '.5' : '1'};">
              <div style="width:44px;height:44px;display:flex;align-items:center;justify-content:center;border-radius:10px;background:rgba(255,255,255,.04);">
                ${logoImg(awayLogo, awayAbbr, 36)}
              </div>
              <div style="font-family:'Orbitron',sans-serif;font-size:.48rem;letter-spacing:.08em;text-transform:uppercase;color:var(--dim);text-align:center;max-width:72px;line-height:1.2;">${awayName}</div>
            </div>

            <!-- Score / VS -->
            <div style="display:flex;flex-direction:column;align-items:center;gap:4px;min-width:90px;">
              ${(isLive || isFinal) ? `
                <div style="display:flex;align-items:center;gap:10px;">
                  <span style="font-family:'Share Tech Mono',monospace;font-size:2rem;font-weight:900;color:${awayWin ? 'var(--text)' : isFinal ? 'var(--dim)' : 'var(--cyan)'};line-height:1;">${awayScore}</span>
                  <span style="font-family:'Share Tech Mono',monospace;font-size:.9rem;color:rgba(255,255,255,.15);">–</span>
                  <span style="font-family:'Share Tech Mono',monospace;font-size:2rem;font-weight:900;color:${homeWin ? 'var(--text)' : isFinal ? 'var(--dim)' : 'var(--cyan)'};line-height:1;">${homeScore}</span>
                </div>` : `
                <div style="font-family:'Orbitron',sans-serif;font-size:.75rem;letter-spacing:.12em;color:var(--dim);">VS</div>`}
              <div>${statusHTML}</div>
            </div>

            <!-- Home team -->
            <div style="flex:1;display:flex;flex-direction:column;align-items:center;gap:6px;opacity:${homeWin === false && isFinal ? '.5' : '1'};">
              <div style="width:44px;height:44px;display:flex;align-items:center;justify-content:center;border-radius:10px;background:rgba(255,255,255,.04);">
                ${logoImg(homeLogo, homeAbbr, 36)}
              </div>
              <div style="font-family:'Orbitron',sans-serif;font-size:.48rem;letter-spacing:.08em;text-transform:uppercase;color:var(--dim);text-align:center;max-width:72px;line-height:1.2;">${homeName}</div>
            </div>
          </div>

          <!-- Footer row -->
          <div style="display:flex;align-items:center;justify-content:space-between;border-top:1px solid rgba(255,255,255,.04);padding-top:8px;gap:8px;">
            ${venue ? `<span style="font-family:'Share Tech Mono',monospace;font-size:.48rem;color:rgba(255,255,255,.2);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">📍 ${venue}</span>` : '<span></span>'}
            ${broadcast ? `<span style="font-family:'Share Tech Mono',monospace;font-size:.48rem;color:rgba(255,255,255,.25);flex-shrink:0;">📺 ${broadcast}</span>` : ''}
          </div>
        </div>`;

      gamesPanel.appendChild(card);
    });

    // Live badge
    document.getElementById('sp-live-badge').style.display = hasLive ? '' : 'none';

    // Auto-refresh if there are live games
    if (hasLive) {
      clearTimeout(root._refreshTimer);
      root._refreshTimer = setTimeout(() => {
        if (selectedSport?.id === sp.id) {
          const dateKey = fmtDateKey(selectedDate);
          delete cache[`${sp.id}_${dateKey}`]; // invalidate cache
          fetchGames();
        }
      }, 30000); // refresh every 30s during live games
    }
  };

  /* ── Period label helper ── */
  const getPeriodLabel = (sport, period) => {
    if (sport === 'baseball') {
      const inning = period;
      if (inning === 1) return '1st';
      if (inning === 2) return '2nd';
      if (inning === 3) return '3rd';
      return `${inning}th`;
    }
    return `P${period}`;
  };

  /* ── Init ── */
  buildGrid();

  return () => {
    clearTimeout(root._refreshTimer);
    const st = document.getElementById('sp-styles');
    // Leave styles since they're lightweight
  };
}
