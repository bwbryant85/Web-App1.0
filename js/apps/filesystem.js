/* ════════════ FILE SYSTEM ════════════ */
function initFileSystem() {
  POS.trackAppOpen('filesystem');

  const wrap = document.createElement('div');
  wrap.className = 'files98-wrap';
  content.appendChild(wrap);

  const menu = document.createElement('div');
  menu.className = 'win-menubar';
  menu.innerHTML = '<div class="win-menu-item">File</div><div class="win-menu-item">Edit</div><div class="win-menu-item">View</div>';
  wrap.appendChild(menu);

  /* ── Header ── */
  const hdr = document.createElement('div');
  hdr.style.cssText = 'flex-shrink:0;padding:8px 18px 12px;border-bottom:1px solid rgba(0,0,0,.08);background:var(--win-chrome);';
  wrap.appendChild(hdr);

  const breadcrumb = document.createElement('div');
  breadcrumb.style.cssText = 'display:flex;align-items:center;gap:6px;flex-wrap:wrap;margin-top:10px;';
  hdr.innerHTML = `<div style="font-family:'Orbitron',sans-serif;font-size:.6rem;letter-spacing:.22em;text-transform:uppercase;color:var(--cyan);text-shadow:var(--gc);">File System</div>`;
  hdr.appendChild(breadcrumb);

  /* ── Body ── */
  const body = document.createElement('div');
  body.style.cssText = 'flex:1;overflow-y:auto;-webkit-overflow-scrolling:touch;padding:12px 18px calc(var(--sb,20px) + 24px);display:flex;flex-direction:column;gap:8px;';
  wrap.appendChild(body);

  /* ── Virtual FS ── */
  const getNotes = () => {
    try { return JSON.parse(localStorage.getItem('ipocket_notes') || '[]'); } catch { return []; }
  };
  const getHighScores = () => {
    const s = POS.get();
    return Object.entries(s.highScores || {}).map(([game, score]) => ({ game, score }));
  };

  const FS = {
    '/': {
      type: 'dir',
      children: ['documents', 'games', 'system', 'readme.txt', 'todo.txt'],
    },
    '/documents': {
      type: 'dir',
      label: '📁 documents',
      children: ['notes'],
    },
    '/documents/notes': {
      type: 'dynamic',
      label: '📂 notes',
      getItems: () => {
        const notes = getNotes();
        return notes.map(n => ({
          type: 'file',
          ico: '📝',
          name: (n.title || 'Untitled') + '.txt',
          size: `${(n.body || '').length} chars`,
          modified: new Date(n.updated).toLocaleDateString('en-US', { month:'short', day:'numeric', year:'numeric' }),
          preview: (n.body || '').slice(0, 120) || '(empty)',
        }));
      },
    },
    '/games': {
      type: 'dir',
      label: '📁 games',
      children: ['highscores', 'saves'],
    },
    '/games/highscores': {
      type: 'dynamic',
      label: '📂 highscores',
      getItems: () => {
        const scores = getHighScores();
        if (!scores.length) return [{ type: 'file', ico: '📊', name: 'no_scores_yet.dat', size: '0 B', modified: '—', preview: 'Play some games to see scores here.' }];
        return scores.map(({ game, score }) => ({
          type: 'file',
          ico: '🏆',
          name: `${game}.score`,
          size: `${score} pts`,
          modified: 'now',
          preview: `High score: ${score}`,
        }));
      },
    },
    '/games/saves': {
      type: 'dynamic',
      label: '📂 saves',
      getItems: () => {
        const s = POS.get();
        return [
          { type: 'file', ico: '💾', name: 'player.dat', size: `LV.${s.level}`, modified: 'now', preview: `Level ${s.level} — ${s.xp} XP — ${s.gamesPlayed||0} games played` },
          { type: 'file', ico: '🏅', name: 'achievements.dat', size: `${Object.keys(s.achievements||{}).length} unlocked`, modified: 'now', preview: `Achievements: ${Object.keys(s.achievements||{}).join(', ') || 'none yet'}` },
        ];
      },
    },
    '/system': {
      type: 'dir',
      label: '📁 system',
      children: ['config', 'logs'],
    },
    '/system/config': {
      type: 'dynamic',
      label: '📂 config',
      getItems: () => [
        { type: 'file', ico: '⚙️', name: 'ipocket.conf', size: '412 B', modified: 'v7.0', preview: 'theme=cyber\nbootAnim=true\nhaptics=true\nsafeTop=89px\nversion=7.0.0' },
        { type: 'file', ico: '🔒', name: 'permissions.sys', size: '128 B', modified: 'factory', preview: 'camera=granted\ngeolocation=prompt\nnotifications=granted\nmicrophone=prompt' },
      ],
    },
    '/system/logs': {
      type: 'dynamic',
      label: '📂 logs',
      getItems: () => {
        const s = POS.get();
        return [
          { type: 'file', ico: '📋', name: 'boot.log', size: `${s.bootCount||1} entries`, modified: 'latest', preview: `Boot count: ${s.bootCount||1}\nLast session: ${new Date().toLocaleString()}\nStatus: OK` },
          { type: 'file', ico: '📋', name: 'apps.log', size: `${s.appsOpened||0} entries`, modified: 'latest', preview: `Apps opened: ${s.appsOpened||0}\nXP gained this session: tracking...` },
        ];
      },
    },
    '/readme.txt': {
      type: 'file',
      ico: '📄',
      name: 'README.txt',
      size: '1.2 KB',
      modified: 'today',
      preview: 'Welcome to iPOCKET!\n\nUse the Files app to browse notes, game saves, and system files. This is a retro-inspired pocket OS shell built with HTML, CSS, and JavaScript.',
    },
    '/todo.txt': {
      type: 'file',
      ico: '📝',
      name: 'TODO.txt',
      size: '320 B',
      modified: 'today',
      preview: '- Add drag reorder for home icons\n- Fix paint palette and drawing coordinates\n- Improve browser fallback support\n- Theme Files and App Store in Win98 style',
    },
  };

  /* ── Navigation ── */
  let currentPath = '/';
  let pathStack = ['/'];

  function navigate(path) {
    currentPath = path;
    pathStack = buildPathStack(path);
    render();
  }

  function buildPathStack(path) {
    if (path === '/') return ['/'];
    const parts = path.split('/').filter(Boolean);
    const stack = ['/'];
    parts.forEach((p, i) => {
      stack.push('/' + parts.slice(0, i + 1).join('/'));
    });
    return stack;
  }

  function render() {
    // Breadcrumb
    breadcrumb.innerHTML = '';
    pathStack.forEach((p, i) => {
      const seg = document.createElement('span');
      const label = p === '/' ? '~' : p.split('/').pop();
      seg.style.cssText = [
        'font-family:"Share Tech Mono",monospace;font-size:.58rem;letter-spacing:.08em;',
        'cursor:pointer;-webkit-tap-highlight-color:transparent;',
        i === pathStack.length - 1
          ? 'color:var(--cyan);'
          : 'color:var(--dim);',
      ].join('');
      seg.textContent = label;
      seg.onclick = () => navigate(p);
      breadcrumb.appendChild(seg);
      if (i < pathStack.length - 1) {
        const sep = document.createElement('span');
        sep.style.cssText = 'font-family:"Share Tech Mono",monospace;font-size:.58rem;color:var(--dim);';
        sep.textContent = ' / ';
        breadcrumb.appendChild(sep);
      }
    });

    // Body
    body.innerHTML = '';
    const node = FS[currentPath];
    if (!node) return;

    if (node.type === 'file') {
      showFilePreview(node);
      return;
    }

    if (node.type === 'dir') {
      node.children.forEach((child, i) => {
        const childPath = currentPath === '/' ? `/${child}` : `${currentPath}/${child}`;
        const childNode = FS[childPath];
        const label = childNode?.label || `📁 ${child}`;

        const row = makeRow(label, '—', 'dir', i);
        row.onclick = () => { haptic('light'); navigate(childPath); };
        body.appendChild(row);
      });
    } else if (node.type === 'dynamic') {
      const items = node.getItems();
      if (!items.length) {
        body.innerHTML = `<div style="display:flex;flex-direction:column;align-items:center;justify-content:center;gap:12px;padding:60px 30px;text-align:center;"><div style="font-size:3rem">📂</div><div style="font-family:'Share Tech Mono',monospace;font-size:.7rem;color:var(--dim);">Empty folder</div></div>`;
        return;
      }
      items.forEach((item, i) => {
        const row = makeRow(`${item.ico} ${item.name}`, item.size, 'file', i);
        row.onclick = () => { haptic('light'); showFilePreview(item); };
        body.appendChild(row);
      });
    }

    // Back button
    if (currentPath !== '/') {
      const backRow = makeRow('← ..' , '', 'back', 999);
      backRow.onclick = () => {
        haptic('light');
        const parts = currentPath.split('/').filter(Boolean);
        parts.pop();
        navigate(parts.length ? '/' + parts.join('/') : '/');
      };
      body.insertBefore(backRow, body.firstChild);
    }
  }

  function makeRow(label, meta, type, idx) {
    const row = document.createElement('div');
    row.style.cssText = [
      'display:flex;align-items:center;gap:12px;',
      'padding:12px 14px;border-radius:14px;cursor:pointer;',
      'background:rgba(255,255,255,.02);border:1px solid rgba(255,255,255,.05);',
      'transition:background .15s;',
      `animation:ci .35s ${idx * 0.04}s both;`,
    ].join('');
    row.innerHTML = `
      <div style="flex:1;font-family:'Share Tech Mono',monospace;font-size:.72rem;color:${type === 'back' ? 'var(--dim)' : type === 'dir' ? 'var(--cyan)' : 'var(--text)'};overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">${label}</div>
      ${meta ? `<div style="font-family:'Share Tech Mono',monospace;font-size:.52rem;color:var(--dim);flex-shrink:0;">${meta}</div>` : ''}
      ${type === 'dir' ? '<div style="color:var(--dim);flex-shrink:0;">›</div>' : ''}
    `;
    row.addEventListener('touchstart', () => { row.style.background = 'rgba(0,255,204,.04)'; }, { passive: true });
    row.addEventListener('touchend', () => { row.style.background = 'rgba(255,255,255,.02)'; }, { passive: true });
    return row;
  }

  function showFilePreview(item) {
    const overlay = document.createElement('div');
    overlay.style.cssText = 'position:fixed;inset:0;z-index:800;display:flex;flex-direction:column;';

    const bd = document.createElement('div');
    bd.style.cssText = 'position:absolute;inset:0;background:rgba(5,5,8,.94);backdrop-filter:blur(20px);-webkit-backdrop-filter:blur(20px);';
    overlay.appendChild(bd);

    const panel = document.createElement('div');
    panel.style.cssText = [
      'position:relative;z-index:1;margin:auto;width:min(92%,400px);',
      'background:rgba(255,255,255,.03);border:1px solid rgba(255,255,255,.1);',
      'border-radius:22px;overflow:hidden;',
    ].join('');

    panel.innerHTML = `
      <div style="padding:20px 20px 14px;border-bottom:1px solid rgba(255,255,255,.06);">
        <div style="font-size:2rem;margin-bottom:8px;">${item.ico}</div>
        <div style="font-family:'Orbitron',sans-serif;font-size:.62rem;letter-spacing:.08em;color:var(--text);">${item.name}</div>
        <div style="display:flex;gap:14px;margin-top:6px;">
          <span style="font-family:'Share Tech Mono',monospace;font-size:.5rem;color:var(--dim);">Size: ${item.size}</span>
          <span style="font-family:'Share Tech Mono',monospace;font-size:.5rem;color:var(--dim);">Modified: ${item.modified}</span>
        </div>
      </div>
      <div style="padding:16px 20px;font-family:'Share Tech Mono',monospace;font-size:.68rem;line-height:1.7;color:var(--text);white-space:pre-wrap;max-height:240px;overflow-y:auto;">${item.preview}</div>
      <div style="padding:14px 20px;border-top:1px solid rgba(255,255,255,.06);display:flex;justify-content:flex-end;">
        <button id="fs-preview-close" style="font-family:'Orbitron',sans-serif;font-size:.52rem;letter-spacing:.12em;text-transform:uppercase;color:var(--dim);border:1px solid var(--dim);background:transparent;padding:9px 22px;border-radius:18px;cursor:pointer;-webkit-tap-highlight-color:transparent;">Close</button>
      </div>
    `;

    overlay.appendChild(panel);
    document.body.appendChild(overlay);

    const close = () => { overlay.style.opacity = '0'; overlay.style.transition = 'opacity .2s'; setTimeout(() => overlay.remove(), 220); };
    panel.querySelector('#fs-preview-close').onclick = close;
    bd.onclick = close;
  }

  navigate('/');
}
