/* ════════ ACHIEVEMENTS (Win98) ════════ */
function initAchievements98() {
  const c = window.content;
  c.style.cssText = 'width:100%;height:100%;display:flex;flex-direction:column;overflow:hidden;';

  const menu = document.createElement('div');
  menu.className = 'win-menubar';
  menu.innerHTML = '<div class="win-menu-item">View</div><div class="win-menu-item">Help</div>';
  c.appendChild(menu);

  const s = POS.get();
  const prog = POS.getXPProgress();
  const achs = POS.getAchievements();
  const unlocked = achs.filter(a=>a.unlocked).length;

  // XP summary bar
  const summary = document.createElement('div');
  summary.style.cssText = 'flex-shrink:0;padding:8px 10px;background:var(--win-chrome);border-bottom:2px solid var(--win-chrome-dark);display:flex;flex-direction:column;gap:5px;';
  summary.innerHTML = `
    <div style="display:flex;align-items:center;justify-content:space-between;">
      <span style="font-family:var(--pixel-font);font-size:18px;color:var(--win-text);font-weight:bold;">Level ${s.level}</span>
      <span style="font-family:var(--pixel-font);font-size:14px;color:var(--win-text-dim);">${unlocked}/${achs.length} unlocked</span>
    </div>
    <div class="progress98-wrap">
      <div class="progress98-fill" id="ach-xp-bar" style="width:${Math.round(prog.pct*100)}%">
        ${Array(Math.floor(prog.pct*20)).fill('<div class="progress98-block"></div>').join('')}
      </div>
    </div>
    <div style="font-family:var(--pixel-font);font-size:14px;color:var(--win-text-dim);">${s.xp} / ${prog.needed} XP &nbsp;·&nbsp; ${s.gamesPlayed||0} games played</div>
  `;
  c.appendChild(summary);

  // List
  const list = document.createElement('div');
  list.className = 'ach98-wrap win-scroll';
  c.appendChild(list);

  achs.forEach(a => {
    const row = document.createElement('div');
    row.className = 'ach98-item';
    row.style.opacity = a.unlocked ? '1' : '.55';
    row.innerHTML = `
      <div class="ach98-ico">${a.label.split(' ')[0]}</div>
      <div class="ach98-info">
        <div class="ach98-title">${a.label.split(' ').slice(1).join(' ')}</div>
        <div class="ach98-desc">${a.desc}</div>
      </div>
      <div class="ach98-progress">${a.unlocked ? '<span class="ach98-completed">✔</span>' : '🔒'}</div>
    `;
    list.appendChild(row);
  });

  const sb = document.createElement('div');
  sb.className = 'win-statusbar';
  sb.innerHTML = `<div class="win-status-pane">${unlocked} unlocked</div><div class="win-status-pane">${achs.length} total</div>`;
  c.appendChild(sb);
}
