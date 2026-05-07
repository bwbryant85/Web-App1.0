/* ════════════ SETTINGS v8 MODERN ════════════
   Modern settings panel with glass effects
   ════════════════════════════════════ */

function initSettings98() {
  const c = window.content;
  c.style.cssText = 'width:100%;height:100%;display:flex;flex-direction:column;overflow:hidden;background:rgba(248,249,252,.92);border-radius:28px;';

  const scroll = document.createElement('div');
  scroll.style.cssText = 'flex:1;overflow-y:auto;-webkit-overflow-scrolling:touch;padding:20px;';
  c.appendChild(scroll);

  const s = POS.get();
  const getSetting = (key, def) => {
    const value = localStorage.getItem('ipocket_' + key);
    return value === null ? def : value === '1';
  };
  const setSetting = (key, value) => {
    localStorage.setItem('ipocket_' + key, value ? '1' : '0');
  };

  document.body.classList.toggle('auto-bright', getSetting('auto_brightness', false));
  window.homeEditEnabled = getSetting('home_edit', true);

  // Header
  const header = document.createElement('div');
  header.style.cssText = 'text-align:center;margin-bottom:24px;';
  header.innerHTML = `
    <div style="font-size:2.5rem;margin-bottom:8px;">⚙️</div>
    <div style="font-family:'Inter',sans-serif;font-size:1.5rem;color:#111;font-weight:600;">Settings</div>
    <div style="font-family:'Inter',sans-serif;font-size:.9rem;color:#666;margin-top:4px;">Customize your iPOCKET experience</div>
  `;
  scroll.appendChild(header);

  const rows = [
    {
      label: 'Theme', type: 'select',
      options: [{v:'retro',l:'Retro'},{v:'hacker',l:'Hacker'},{v:'modern',l:'Modern'}],
      value: OS.getTheme(),
      onChange(v) { OS.applyTheme(v); }
    },
    { label: 'Sound', type: 'toggle', value: getSetting('sound', true), onChange(v) { setSetting('sound', v); showToast98('Sound', v ? 'Enabled' : 'Disabled'); } },
    { label: 'Notifications', type: 'toggle', value: getSetting('notifs', true), onChange(v) { setSetting('notifs', v); showToast98('Notifications', v ? 'Enabled' : 'Disabled'); } },
    { label: 'Auto Brightness', type: 'toggle', value: getSetting('auto_brightness', false), onChange(v) { setSetting('auto_brightness', v); document.body.classList.toggle('auto-bright', v); } },
    { label: 'Home Edit Mode', type: 'toggle', value: getSetting('home_edit', true), onChange(v) { setSetting('home_edit', v); window.homeEditEnabled = v; } },
  ];

  rows.forEach(row => {
    const card = document.createElement('div');
    card.style.cssText = 'background:rgba(255,255,255,.9);backdrop-filter:blur(20px);-webkit-backdrop-filter:blur(20px);border:1px solid rgba(15,23,42,.08);border-radius:16px;padding:16px;margin-bottom:12px;display:flex;align-items:center;justify-content:space-between;';

    const lbl = document.createElement('div');
    lbl.style.cssText = 'font-family:\'Inter\',sans-serif;font-size:1rem;color:#111;font-weight:500;';
    lbl.textContent = row.label;

    let ctrl;
    if (row.type === 'select') {
      ctrl = document.createElement('select');
      ctrl.style.cssText = 'background:#f8f9fa;border:1px solid rgba(15,23,42,.12);border-radius:12px;padding:8px 12px;font-family:\'Inter\',sans-serif;font-size:.9rem;color:#111;outline:none;';
      row.options.forEach(o => {
        const opt = document.createElement('option');
        opt.value = o.v; opt.textContent = o.l;
        if (o.v === row.value) opt.selected = true;
        ctrl.appendChild(opt);
      });
      ctrl.onchange = () => row.onChange(ctrl.value);
    } else if (row.type === 'toggle') {
      ctrl = document.createElement('div');
      ctrl.style.cssText = `width:52px;height:28px;background:${row.value?'#4a90d9':'#e0e0e0'};border-radius:14px;position:relative;cursor:pointer;-webkit-tap-highlight-color:transparent;transition:background .2s;`;
      const knob = document.createElement('div');
      knob.style.cssText = `width:24px;height:24px;background:#ffffff;border-radius:12px;position:absolute;top:2px;left:${row.value?'26px':'2px'};transition:left .2s;box-shadow:0 2px 4px rgba(0,0,0,.1);`;
      ctrl.appendChild(knob);
      let state = row.value;
      ctrl.onclick = () => {
        state = !state;
        ctrl.style.background = state ? '#4a90d9' : '#e0e0e0';
        knob.style.left = state ? '26px' : '2px';
        row.onChange(state);
      };
    }

    card.appendChild(lbl);
    if (ctrl) card.appendChild(ctrl);
    scroll.appendChild(card);
  });

  // Theme preview section
  const previewCard = document.createElement('div');
  previewCard.style.cssText = 'background:rgba(255,255,255,.9);backdrop-filter:blur(20px);-webkit-backdrop-filter:blur(20px);border:1px solid rgba(15,23,42,.08);border-radius:16px;padding:16px;margin-bottom:12px;';
  previewCard.innerHTML = '<div style="font-family:\'Inter\',sans-serif;font-size:1.1rem;color:#111;font-weight:600;margin-bottom:12px;">Theme Preview</div>';

  const previews = document.createElement('div');
  previews.style.cssText = 'display:flex;gap:12px;justify-content:space-around;';

  const themes = [
    { id:'retro', label:'Retro', bg:'#c0c0c0', titleBg:'#000080', text:'#000' },
    { id:'hacker', label:'Hacker', bg:'#111', titleBg:'#003300', text:'#00ff41' },
    { id:'modern', label:'Modern', bg:'#f8f8f8', titleBg:'#4a90d9', text:'#222' },
  ];

  themes.forEach(t => {
    const pv = document.createElement('div');
    pv.style.cssText = `display:flex;flex-direction:column;align-items:center;gap:6px;cursor:pointer;-webkit-tap-highlight-color:transparent;`;

    const frame = document.createElement('div');
    frame.style.cssText = `width:80px;height:60px;background:${t.bg};border-radius:12px;overflow:hidden;position:relative;border:2px solid ${OS.getTheme()===t.id?'#4a90d9':'rgba(15,23,42,.12)'};`;
    frame.innerHTML = `
      <div style="height:14px;background:${t.titleBg};display:flex;align-items:center;padding:0 4px;">
        <span style="font-family:'Inter',sans-serif;font-size:8px;color:#fff;font-weight:500;">Window</span>
        <span style="margin-left:auto;font-size:8px;color:#fff;">✕</span>
      </div>
      <div style="padding:4px;font-family:'Inter',sans-serif;font-size:8px;color:${t.text};">Hello!</div>
    `;
    frame.onclick = () => {
      OS.applyTheme(t.id);
      previews.querySelectorAll('div>div').forEach(f => f.style.borderColor='rgba(15,23,42,.12)');
      frame.style.borderColor = '#4a90d9';
      const sel = scroll.querySelector('select');
      if (sel) sel.value = t.id;
    };

    const tlbl = document.createElement('div');
    tlbl.style.cssText = 'font-family:\'Inter\',sans-serif;font-size:.9rem;color:#666;';
    tlbl.textContent = t.label;

    pv.appendChild(frame);
    pv.appendChild(tlbl);
    previews.appendChild(pv);
  });

  previewCard.appendChild(previews);
  scroll.appendChild(previewCard);

  // About section
  const aboutCard = document.createElement('div');
  aboutCard.style.cssText = 'background:rgba(255,255,255,.9);backdrop-filter:blur(20px);-webkit-backdrop-filter:blur(20px);border:1px solid rgba(15,23,42,.08);border-radius:16px;padding:16px;margin-bottom:12px;display:flex;align-items:center;justify-content:space-between;cursor:pointer;-webkit-tap-highlight-color:transparent;';
  aboutCard.innerHTML = '<div><div style="font-family:\'Inter\',sans-serif;font-size:1rem;color:#111;font-weight:500;">About iPOCKET</div><div style="font-family:\'Inter\',sans-serif;font-size:.8rem;color:#666;">Version 8.0</div></div><div style="font-size:1.2rem;color:#666;">›</div>';
  aboutCard.onclick = () => OS.showAbout();
  scroll.appendChild(aboutCard);
}