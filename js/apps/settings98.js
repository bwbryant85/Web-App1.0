/* ════════ SETTINGS (Win98) ════════ */
function initSettings98() {
  const c = window.content;
  c.style.cssText = 'width:100%;height:100%;overflow:hidden;display:flex;flex-direction:column;';

  // Add menubar
  const menu = document.createElement('div');
  menu.className = 'win-menubar';
  menu.innerHTML = '<div class="win-menu-item">File</div><div class="win-menu-item">View</div><div class="win-menu-item">Help</div>';
  c.appendChild(menu);

  const wrap = document.createElement('div');
  wrap.className = 'settings98-wrap';
  c.appendChild(wrap);

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

  const rows = [
    {
      label: 'Theme', type: 'select',
      options: [{v:'retro',l:'Retro'},{v:'hacker',l:'Hacker'},{v:'modern',l:'Modern'},{v:'liquid',l:'Liquid Glass'}],
      value: OS.getTheme(),
      onChange(v) { OS.applyTheme(v); }
    },
    { label: 'Sound', type: 'toggle', value: getSetting('sound', true), onChange(v) { setSetting('sound', v); showToast98('Sound', v ? 'Enabled' : 'Disabled'); } },
    { label: 'Lock Screen', type: 'action', icon: '🔒', action() { OS.closeApp && OS.closeApp(OS.getFocusedId && OS.getFocusedId()); if(window.LoginSystem) LoginSystem.lock(); } },
    { label: 'Notifications', type: 'toggle', value: getSetting('notifs', true), onChange(v) { setSetting('notifs', v); showToast98('Notifications', v ? 'Enabled' : 'Disabled'); } },
    { label: 'Receive Messages', type: 'toggle', value: getSetting('receive_messages', true), onChange(v) { setSetting('receive_messages', v); if (v) { if (window.MSG) MSG.connect(); } else { if (window.MSG) MSG.disconnect(); } showToast98('Messages', v ? 'Receiving messages' : 'Messages paused'); } },
    { label: 'Auto Brightness', type: 'toggle', value: getSetting('auto_brightness', false), onChange(v) { setSetting('auto_brightness', v); document.body.classList.toggle('auto-bright', v); } },
    { label: 'Home Edit Mode', type: 'toggle', value: getSetting('home_edit', true), onChange(v) { setSetting('home_edit', v); window.homeEditEnabled = v; } },
  ];

  rows.forEach(row => {
    const div = document.createElement('div');
    div.className = 'settings98-row';

    const lbl = document.createElement('div');
    lbl.className = 'settings98-label';
    lbl.textContent = row.label;

    let ctrl;
    if (row.type === 'select') {
      ctrl = document.createElement('select');
      ctrl.className = 'settings98-select';
      row.options.forEach(o => {
        const opt = document.createElement('option');
        opt.value = o.v; opt.textContent = o.l;
        if (o.v === row.value) opt.selected = true;
        ctrl.appendChild(opt);
      });
      ctrl.onchange = () => row.onChange(ctrl.value);
    } else if (row.type === 'action') {
      div.style.cursor = 'pointer';
      div.onclick = () => row.action && row.action();
      const arrow = document.createElement('span');
      arrow.style.cssText = 'font-family:var(--pixel-font);font-size:16px;color:var(--win-text-dim);';
      arrow.textContent = row.icon || '›';
      div.appendChild(lbl);
      div.appendChild(arrow);
      wrap.appendChild(div);
      return; // skip normal ctrl append
    } else if (row.type === 'toggle') {
      ctrl = document.createElement('div');
      ctrl.className = 'toggle98' + (row.value ? ' on' : '');
      ctrl.innerHTML = '<div class="toggle98-knob"></div>';
      let state = row.value;
      ctrl.onclick = () => {
        state = !state;
        ctrl.classList.toggle('on', state);
        row.onChange(state);
      };
    }

    div.appendChild(lbl);
    if (ctrl) div.appendChild(ctrl);
    wrap.appendChild(div);
  });

  // Theme preview section
  const previewHeader = document.createElement('div');
  previewHeader.style.cssText = 'background:var(--win-select);color:var(--win-select-text);font-family:var(--pixel-font);font-size:15px;padding:2px 8px;font-weight:bold;';
  previewHeader.textContent = 'Theme Preview';
  wrap.appendChild(previewHeader);

  const previews = document.createElement('div');
  previews.style.cssText = 'display:grid;grid-template-columns:repeat(4,1fr);gap:6px;padding:8px;';

  const themes = [
    { id:'retro',  label:'Retro',        bg:'#c0c0c0', titleBg:'#000080', text:'#000' },
    { id:'hacker', label:'Hacker',       bg:'#111',    titleBg:'#003300', text:'#00ff41' },
    { id:'modern', label:'Modern',       bg:'#f8f8f8', titleBg:'#4a90d9', text:'#222' },
    { id:'liquid', label:'Liquid Glass', bg:'linear-gradient(135deg,rgba(88,86,214,.85),rgba(10,132,255,.85))', titleBg:'rgba(255,255,255,.15)', text:'#fff' },
  ];

  themes.forEach(t => {
    const pv = document.createElement('div');
    pv.style.cssText = `display:flex;flex-direction:column;align-items:center;gap:4px;cursor:pointer;-webkit-tap-highlight-color:transparent;`;

    const frame = document.createElement('div');
    frame.style.cssText = `width:100%;aspect-ratio:4/3;background:${t.bg};border:2px solid #808080;overflow:hidden;position:relative;${OS.getTheme()===t.id?'outline:3px solid var(--win-select);outline-offset:2px;':''}`;
    frame.innerHTML = `
      <div style="height:12px;background:${t.titleBg};display:flex;align-items:center;padding:0 3px;">
        <span style="font-family:var(--pixel-font);font-size:9px;color:#fff;">Window</span>
        <span style="margin-left:auto;font-size:7px;color:#fff;">✕</span>
      </div>
      <div style="padding:4px;font-family:var(--pixel-font);font-size:9px;color:${t.text};">Hello iPOCKET!</div>
      <div style="padding:0 4px;"><div style="background:${t.bg};border:1px solid #808080;font-family:var(--pixel-font);font-size:8px;color:${t.text};padding:1px 4px;display:inline-block;">Button</div></div>
    `;
    frame.onclick = () => {
      OS.applyTheme(t.id);
      previews.querySelectorAll('div>div').forEach(f => f.style.outline='none');
      frame.style.outline = '3px solid var(--win-select)';
      frame.style.outlineOffset = '2px';
      const sel = wrap.querySelector('select');
      if (sel) sel.value = t.id;
    };

    const tlbl = document.createElement('div');
    tlbl.style.cssText = 'font-family:var(--pixel-font);font-size:14px;color:var(--win-text);';
    tlbl.textContent = t.label;

    pv.appendChild(frame);
    pv.appendChild(tlbl);
    previews.appendChild(pv);
  });

  wrap.appendChild(previews);

  // About row
  const aboutRow = document.createElement('div');
  aboutRow.style.cssText = 'display:flex;align-items:center;justify-content:space-between;padding:8px 10px;border-bottom:1px solid var(--win-chrome-dark);cursor:pointer;-webkit-tap-highlight-color:transparent;';
  aboutRow.innerHTML = '<span style="font-family:var(--pixel-font);font-size:17px;color:var(--win-text);">About iPOCKET</span><span style="font-family:var(--pixel-font);font-size:16px;color:var(--win-text-dim);">›</span>';
  aboutRow.onclick = () => OS.showAbout();
  wrap.appendChild(aboutRow);

  // Status bar
  const sb = document.createElement('div');
  sb.className = 'win-statusbar';
  sb.innerHTML = '<div class="win-status-pane">v8.0</div><div class="win-status-pane">Retro OS</div>';
  c.appendChild(sb);
}
