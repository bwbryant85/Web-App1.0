/* ════════════ FILE SYSTEM v8 MODERN ════════════
   Modern file explorer with glass effects
   ════════════════════════════════════ */

function initFileSystem() {
  POS.trackAppOpen('filesystem');

  const c = window.content;
  c.style.cssText = 'width:100%;height:100%;display:flex;flex-direction:column;overflow:hidden;background:rgba(248,249,252,.92);border-radius:28px;';

  // Header
  const header = document.createElement('div');
  header.style.cssText = 'flex-shrink:0;padding:16px;background:rgba(255,255,255,.9);backdrop-filter:blur(20px);-webkit-backdrop-filter:blur(20px);border-bottom:1px solid rgba(15,23,42,.08);border-radius:28px 28px 0 0;';
  header.innerHTML = `
    <div style="display:flex;align-items:center;gap:8px;margin-bottom:8px;">
      <div style="font-size:1.5rem;">📁</div>
      <div style="font-family:'Inter',sans-serif;font-size:1.2rem;color:#111;font-weight:600;">File System</div>
    </div>
    <div id="breadcrumb" style="display:flex;align-items:center;gap:4px;font-family:'Inter',sans-serif;font-size:.9rem;color:#666;"></div>
  `;
  c.appendChild(header);

  // Body
  const body = document.createElement('div');
  body.style.cssText = 'flex:1;overflow-y:auto;-webkit-overflow-scrolling:touch;padding:16px;display:flex;flex-direction:column;gap:8px;';
  c.appendChild(body);

  // Status
  const status = document.createElement('div');
  status.style.cssText = 'flex-shrink:0;padding:12px 16px;text-align:center;font-family:\'Inter\',sans-serif;font-size:.9rem;color:#666;background:rgba(255,255,255,.9);backdrop-filter:blur(20px);-webkit-backdrop-filter:blur(20px);border-top:1px solid rgba(15,23,42,.08);border-radius:0 0 28px 28px;';
  c.appendChild(status);

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
      label: '📁 Documents',
      children: ['notes'],
    },
    '/documents/notes': {
      type: 'dynamic',
      label: '📂 Notes',
      getChildren: () => getNotes().map((note, i) => ({ name: note.title || `Note ${i + 1}`, type: 'file', content: note.content, icon: '📝' })),
    },
    '/games': {
      type: 'dir',
      label: '🎮 Games',
      children: ['highscores.txt'],
    },
    '/games/highscores.txt': {
      type: 'dynamic',
      label: '🏆 High Scores',
      getContent: () => {
        const scores = getHighScores();
        return scores.length ? scores.map(s => `${s.game}: ${s.score}`).join('\n') : 'No high scores yet.';
      },
    },
    '/system': {
      type: 'dir',
      label: '⚙️ System',
      children: ['settings.json', 'achievements.json'],
    },
    '/system/settings.json': {
      type: 'file',
      label: '🔧 Settings',
      content: JSON.stringify({
        theme: localStorage.getItem('ipocket_theme') || 'retro',
        sound: localStorage.getItem('ipocket_sound') !== '0',
        notifications: localStorage.getItem('ipocket_notifs') !== '0',
      }, null, 2),
    },
    '/system/achievements.json': {
      type: 'file',
      label: '🏆 Achievements',
      content: JSON.stringify(POS.get().achievements || {}, null, 2),
    },
    '/readme.txt': {
      type: 'file',
      label: '📄 Readme',
      content: `Welcome to iPOCKET v8!

This is a retro-style mobile OS simulation built with vanilla JavaScript.

Features:
- Multiple apps and games
- Achievement system
- Persistent data storage
- Theme switching
- Touch-friendly interface

Enjoy exploring! 🚀`,
    },
    '/todo.txt': {
      type: 'file',
      label: '✅ Todo',
      content: `iPOCKET Development Tasks:

✓ Core OS shell
✓ App registry and windowing
✓ Basic apps (Paint, Browser, etc.)
✓ Games (Snake, Pong, etc.)
✓ Achievement system
✓ Theme system
✓ File system
○ More games
○ More apps
○ Performance optimizations

Keep building! 💪`,
    },
  };

  let currentPath = '/';

  function updateBreadcrumb() {
    const parts = currentPath.split('/').filter(p => p);
    const breadcrumb = header.querySelector('#breadcrumb');
    breadcrumb.innerHTML = '';

    const homeBtn = document.createElement('span');
    homeBtn.style.cssText = 'cursor:pointer;-webkit-tap-highlight-color:transparent;color:#4a90d9;';
    homeBtn.textContent = 'Home';
    homeBtn.onclick = () => navigate('/');
    breadcrumb.appendChild(homeBtn);

    parts.forEach((part, i) => {
      breadcrumb.appendChild(document.createTextNode(' › '));
      const btn = document.createElement('span');
      btn.style.cssText = 'cursor:pointer;-webkit-tap-highlight-color:transparent;color:#4a90d9;';
      btn.textContent = part;
      btn.onclick = () => navigate('/' + parts.slice(0, i + 1).join('/'));
      breadcrumb.appendChild(btn);
    });
  }

  function navigate(path) {
    currentPath = path;
    updateBreadcrumb();
    renderDirectory();
  }

  function renderDirectory() {
    body.innerHTML = '';
    const node = FS[currentPath];
    if (!node) return;

    if (node.type === 'file') {
      const content = node.getContent ? node.getContent() : node.content;
      const viewer = document.createElement('div');
      viewer.style.cssText = 'background:#ffffff;border-radius:16px;padding:16px;font-family:\'Inter\',sans-serif;font-size:.9rem;color:#111;white-space:pre-wrap;line-height:1.5;';
      viewer.textContent = content;
      body.appendChild(viewer);
      status.textContent = `${node.label} - ${content.length} characters`;
      return;
    }

    let children = [];
    if (node.type === 'dynamic') {
      children = node.getChildren ? node.getChildren() : [];
    } else {
      children = node.children.map(name => {
        const childPath = currentPath === '/' ? `/${name}` : `${currentPath}/${name}`;
        const child = FS[childPath];
        if (child) {
          return { name, path: childPath, ...child };
        } else {
          return { name, path: childPath, type: 'file', label: name, icon: '📄' };
        }
      });
    }

    children.forEach(child => {
      const item = document.createElement('div');
      item.style.cssText = 'display:flex;align-items:center;gap:12px;padding:12px;background:rgba(255,255,255,.9);backdrop-filter:blur(20px);-webkit-backdrop-filter:blur(20px);border:1px solid rgba(15,23,42,.08);border-radius:12px;cursor:pointer;-webkit-tap-highlight-color:transparent;';
      item.innerHTML = `
        <div style="font-size:1.2rem;">${child.icon || (child.type === 'dir' || child.type === 'dynamic' ? '📁' : '📄')}</div>
        <div style="flex:1;font-family:'Inter',sans-serif;font-size:.9rem;color:#111;">${child.label || child.name}</div>
        <div style="font-size:.8rem;color:#666;">${child.type === 'dir' || child.type === 'dynamic' ? 'Folder' : 'File'}</div>
      `;
      item.onclick = () => {
        if (child.type === 'dir' || child.type === 'dynamic') {
          navigate(child.path);
        } else {
          navigate(child.path);
        }
      };
      body.appendChild(item);
    });

    status.textContent = `${children.length} items`;
  }

  updateBreadcrumb();
  renderDirectory();
}