/* ════════════════════════════════════════════════
   SETTINGS — Liquid Glass Theme
   Full liquid glass styling + all 4 theme options
   ════════════════════════════════════════════════ */

function initSettings98() {
  const c = window.content;
  c.style.cssText = 'width:100%;height:100%;display:flex;flex-direction:column;overflow:hidden;background:transparent;';

  const scroll = document.createElement('div');
  scroll.className = 'win-scroll';
  scroll.style.cssText = 'flex:1;overflow-y:auto;-webkit-overflow-scrolling:touch;padding:18px 16px 32px;';
  c.appendChild(scroll);

  const s = POS.get();
  const getSetting = (key, def) => {
    const v = localStorage.getItem('ipocket_' + key);
    return v === null ? def : v === '1';
  };
  const setSetting = (key, val) => localStorage.setItem('ipocket_' + key, val ? '1' : '0');

  document.body.classList.toggle('auto-bright', getSetting('auto_brightness', false));
  window.homeEditEnabled = getSetting('home_edit', true);

  /* ── Header ── */
  const header = document.createElement('div');
  header.style.cssText = 'text-align:center;margin-bottom:22px;padding-top:4px;';
  header.innerHTML = `
    <div style="font-size:2.6rem;margin-bottom:10px;filter:drop-shadow(0 4px 12px rgba(10,132,255,.45));">⚙️</div>
    <div style="font-family:-apple-system,'SF Pro Display',sans-serif;font-size:1.5rem;color:#fff;font-weight:700;letter-spacing:-.02em;">Settings</div>
    <div style="font-family:-apple-system,'SF Pro Display',sans-serif;font-size:.88rem;color:rgba(255,255,255,.50);margin-top:5px;">Customize your iPOCKET experience</div>
  `;
  scroll.appendChild(header);

  /* ── Row definitions ── */
  const rows = [
    {
      label: 'Theme', type: 'select',
      options: [
        {v:'retro',  l:'Retro'},
        {v:'hacker', l:'Hacker'},
        {v:'modern', l:'Modern'},
        {v:'liquid', l:'Liquid Glass'},
      ],
      value: OS.getTheme(),
      onChange(v) { OS.applyTheme(v); }
    },
    { label: 'Sound',            type:'toggle', value:getSetting('sound',true),              onChange(v){setSetting('sound',v);showToast98('Sound',v?'Enabled':'Disabled');} },
    { label: 'Notifications',    type:'toggle', value:getSetting('notifs',true),             onChange(v){setSetting('notifs',v);showToast98('Notifications',v?'Enabled':'Disabled');} },
    { label: 'Receive Messages', type:'toggle', value:getSetting('receive_messages',true),   onChange(v){setSetting('receive_messages',v);if(v){if(window.MSG)MSG.connect();}else{if(window.MSG)MSG.disconnect();}showToast98('Messages',v?'Receiving':'Paused');} },
    { label: 'Auto Brightness',  type:'toggle', value:getSetting('auto_brightness',false),   onChange(v){setSetting('auto_brightness',v);document.body.classList.toggle('auto-bright',v);} },
    { label: 'Home Edit Mode',   type:'toggle', value:getSetting('home_edit',true),          onChange(v){setSetting('home_edit',v);window.homeEditEnabled=v;} },
    { label: 'Lock Screen',      type:'action', icon:'🔒',                                   action(){if(window.LoginSystem)LoginSystem.lock();} },
  ];

  rows.forEach(row => {
    const card = document.createElement('div');
    card.style.cssText = [
      'background:rgba(255,255,255,.10);',
      'backdrop-filter:blur(24px) saturate(160%);',
      '-webkit-backdrop-filter:blur(24px) saturate(160%);',
      'border:0.5px solid rgba(255,255,255,.18);',
      'border-radius:18px;',
      'padding:15px 16px;',
      'margin-bottom:10px;',
      'display:flex;align-items:center;justify-content:space-between;',
      'box-shadow:0 2px 12px rgba(0,0,0,.18),0 0 0 0.5px rgba(255,255,255,.10) inset;',
    ].join('');

    const lbl = document.createElement('div');
    lbl.style.cssText = 'font-family:-apple-system,"SF Pro Display",sans-serif;font-size:1rem;color:rgba(255,255,255,.92);font-weight:500;';
    lbl.textContent = row.label;

    let ctrl;

    if (row.type === 'select') {
      ctrl = document.createElement('select');
      ctrl.style.cssText = [
        'background:rgba(255,255,255,.12);',
        'border:0.5px solid rgba(255,255,255,.22);',
        'border-radius:12px;',
        'padding:7px 28px 7px 12px;',
        'font-family:-apple-system,"SF Pro Display",sans-serif;',
        'font-size:.9rem;color:#fff;',
        'outline:none;',
        '-webkit-appearance:none;',
        'backdrop-filter:blur(12px);',
        '-webkit-backdrop-filter:blur(12px);',
      ].join('');
      row.options.forEach(o => {
        const opt = document.createElement('option');
        opt.value = o.v; opt.textContent = o.l;
        if (o.v === row.value) opt.selected = true;
        opt.style.background = '#1a1e30';
        ctrl.appendChild(opt);
      });
      ctrl.onchange = () => row.onChange(ctrl.value);

    } else if (row.type === 'toggle') {
      ctrl = document.createElement('div');
      const on = row.value;
      ctrl.style.cssText = `width:52px;height:30px;background:${on?'#30d158':'rgba(255,255,255,.18)'};border-radius:15px;position:relative;cursor:pointer;-webkit-tap-highlight-color:transparent;transition:background .22s ease;box-shadow:0 1px 6px rgba(0,0,0,.25) inset;`;
      const knob = document.createElement('div');
      knob.style.cssText = `width:26px;height:26px;background:#ffffff;border-radius:13px;position:absolute;top:2px;left:${on?'24px':'2px'};transition:left .22s cubic-bezier(.34,1.56,.64,1);box-shadow:0 2px 8px rgba(0,0,0,.30);`;
      ctrl.appendChild(knob);
      let state = on;
      ctrl.onclick = () => {
        state = !state;
        ctrl.style.background = state ? '#30d158' : 'rgba(255,255,255,.18)';
        knob.style.left = state ? '24px' : '2px';
        row.onChange(state);
      };

    } else if (row.type === 'action') {
      card.style.cursor = 'pointer';
      card.style.webkitTapHighlightColor = 'transparent';
      card.onclick = () => row.action && row.action();
      const arrow = document.createElement('div');
      arrow.style.cssText = 'font-size:1.1rem;color:rgba(255,255,255,.40);';
      arrow.textContent = row.icon || '›';
      card.appendChild(lbl);
      card.appendChild(arrow);
      scroll.appendChild(card);
      return;
    }

    card.appendChild(lbl);
    if (ctrl) card.appendChild(ctrl);
    scroll.appendChild(card);
  });

  /* ── Theme Preview ── */
  const previewCard = document.createElement('div');
  previewCard.style.cssText = [
    'background:rgba(255,255,255,.10);',
    'backdrop-filter:blur(24px) saturate(160%);',
    '-webkit-backdrop-filter:blur(24px) saturate(160%);',
    'border:0.5px solid rgba(255,255,255,.18);',
    'border-radius:18px;',
    'padding:16px;',
    'margin-bottom:10px;',
    'box-shadow:0 2px 12px rgba(0,0,0,.18),0 0 0 0.5px rgba(255,255,255,.10) inset;',
  ].join('');

  const pvTitle = document.createElement('div');
  pvTitle.style.cssText = 'font-family:-apple-system,"SF Pro Display",sans-serif;font-size:1rem;color:rgba(255,255,255,.92);font-weight:600;margin-bottom:14px;';
  pvTitle.textContent = 'Theme Preview';
  previewCard.appendChild(pvTitle);

  const previews = document.createElement('div');
  previews.style.cssText = 'display:grid;grid-template-columns:repeat(4,1fr);gap:8px;';

  const themes = [
    { id:'retro',  label:'Retro',   bg:'#c0c0c0', titleBg:'linear-gradient(90deg,#000080,#1084d0)', text:'#000' },
    { id:'hacker', label:'Hacker',  bg:'#111',    titleBg:'#003300', text:'#00ff41' },
    { id:'modern', label:'Modern',  bg:'rgba(240,243,252,.95)', titleBg:'linear-gradient(135deg,#4a90d9,#5e5ce6)', text:'#222' },
    { id:'liquid', label:'Glass',   bg:'linear-gradient(135deg,rgba(88,86,214,.80),rgba(10,132,255,.80))', titleBg:'rgba(255,255,255,.15)', text:'#fff' },
  ];

  const cur = OS.getTheme();
  themes.forEach(t => {
    const pv = document.createElement('div');
    pv.style.cssText = 'display:flex;flex-direction:column;align-items:center;gap:6px;cursor:pointer;-webkit-tap-highlight-color:transparent;';

    const frame = document.createElement('div');
    const isActive = cur === t.id;
    frame.style.cssText = [
      `background:${t.bg};`,
      'border-radius:10px;overflow:hidden;',
      `border:2px solid ${isActive?'rgba(10,132,255,.90)':'rgba(255,255,255,.14)'};`,
      'width:100%;aspect-ratio:4/3;',
      'box-shadow:0 4px 12px rgba(0,0,0,.30);',
    ].join('');
    frame.innerHTML = `
      <div style="height:12px;background:${t.titleBg};display:flex;align-items:center;padding:0 3px;">
        <span style="font-size:7px;color:#fff;font-family:-apple-system,sans-serif;font-weight:500;">Window</span>
        <span style="margin-left:auto;font-size:7px;color:#fff;">✕</span>
      </div>
      <div style="padding:3px 4px;font-family:-apple-system,sans-serif;font-size:7px;color:${t.text};">Hello!</div>
    `;
    frame.onclick = () => {
      OS.applyTheme(t.id);
      previews.querySelectorAll('[data-pvframe]').forEach(f => f.style.borderColor='rgba(255,255,255,.14)');
      frame.style.borderColor = 'rgba(10,132,255,.90)';
      const sel = scroll.querySelector('select');
      if (sel) sel.value = t.id;
    };
    frame.dataset.pvframe = t.id;

    const tlbl = document.createElement('div');
    tlbl.style.cssText = 'font-family:-apple-system,"SF Pro Display",sans-serif;font-size:.75rem;color:rgba(255,255,255,.55);text-align:center;';
    tlbl.textContent = t.label;

    pv.appendChild(frame);
    pv.appendChild(tlbl);
    previews.appendChild(pv);
  });

  previewCard.appendChild(previews);
  scroll.appendChild(previewCard);

  /* ── About ── */
  const about = document.createElement('div');
  about.style.cssText = [
    'background:rgba(255,255,255,.10);',
    'backdrop-filter:blur(24px) saturate(160%);',
    '-webkit-backdrop-filter:blur(24px) saturate(160%);',
    'border:0.5px solid rgba(255,255,255,.18);',
    'border-radius:18px;',
    'padding:15px 16px;',
    'margin-bottom:10px;',
    'display:flex;align-items:center;justify-content:space-between;',
    'cursor:pointer;-webkit-tap-highlight-color:transparent;',
    'box-shadow:0 2px 12px rgba(0,0,0,.18),0 0 0 0.5px rgba(255,255,255,.10) inset;',
  ].join('');
  about.innerHTML = `
    <div>
      <div style="font-family:-apple-system,'SF Pro Display',sans-serif;font-size:1rem;color:rgba(255,255,255,.92);font-weight:500;">About iPOCKET</div>
      <div style="font-family:-apple-system,'SF Pro Display',sans-serif;font-size:.82rem;color:rgba(255,255,255,.42);margin-top:2px;">Version 8.0 — Liquid Glass</div>
    </div>
    <div style="font-size:1.1rem;color:rgba(255,255,255,.35);">›</div>
  `;
  about.onclick = () => OS.showAbout && OS.showAbout();
  scroll.appendChild(about);
}
