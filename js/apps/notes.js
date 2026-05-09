/* ════════════ NOTES ════════════ */
function initNotes() {
  const STORE_KEY = 'ipocket_notes';

  const load = () => {
    try { return JSON.parse(localStorage.getItem(STORE_KEY) || '[]'); }
    catch(e) { return []; }
  };
  const save = notes => {
    try { localStorage.setItem(STORE_KEY, JSON.stringify(notes)); } catch(e) {}
  };

  let notes = load();
  let activeIdx = null;

  const wrap = document.createElement('div');
  wrap.style.cssText = 'width:100%;height:100%;display:flex;flex-direction:column;background:var(--win-chrome);overflow:hidden;';
  content.appendChild(wrap);

  /* ── Top bar ── */
  const topBar = document.createElement('div');
  topBar.style.cssText = [
    'flex-shrink:0;display:flex;align-items:center;justify-content:space-between;',
    'padding:6px 8px;',
    'border-bottom:2px solid;',
    'border-color:var(--win-chrome-dark) var(--win-chrome-light) var(--win-chrome-light) var(--win-chrome-dark);',
    'background:var(--win-chrome);',
  ].join('');
  topBar.innerHTML = `
    <div style="font-family:var(--pixel-font);font-size:1rem;font-weight:bold;color:var(--win-text);letter-spacing:.04em;">📝 Notes</div>
    <button id="notes-new" style="font-family:var(--pixel-font);font-size:.9rem;color:var(--win-select-text);background:var(--win-select);border:2px solid;border-color:var(--win-chrome-light) var(--win-chrome-dark) var(--win-chrome-dark) var(--win-chrome-light);padding:4px 14px;cursor:pointer;-webkit-tap-highlight-color:transparent;">+ New</button>`;
  wrap.appendChild(topBar);

  /* ── List / Editor panels ── */
  const body = document.createElement('div');
  body.style.cssText = 'flex:1;overflow:hidden;position:relative;';
  wrap.appendChild(body);

  const listPanel = document.createElement('div');
  listPanel.style.cssText = 'position:absolute;inset:0;overflow-y:auto;-webkit-overflow-scrolling:touch;padding:0 0 40px;background:var(--win-chrome);';
  body.appendChild(listPanel);

  const editorPanel = document.createElement('div');
  editorPanel.style.cssText = [
    'position:absolute;inset:0;display:flex;flex-direction:column;',
    'background:var(--win-chrome);',
    'transform:translateX(100%);transition:transform .28s cubic-bezier(.34,1.56,.64,1);',
  ].join('');
  body.appendChild(editorPanel);

  /* ── Editor contents ── */
  const editorTop = document.createElement('div');
  editorTop.style.cssText = [
    'flex-shrink:0;display:flex;align-items:center;gap:8px;padding:5px 8px;',
    'border-bottom:2px solid;',
    'border-color:var(--win-chrome-dark) var(--win-chrome-light) var(--win-chrome-light) var(--win-chrome-dark);',
    'background:var(--win-chrome);',
  ].join('');

  const backBtn = document.createElement('button');
  backBtn.innerHTML = '← Back';
  backBtn.style.cssText = [
    'font-family:var(--pixel-font);font-size:.9rem;color:var(--win-text);',
    'background:var(--win-btn-face);border:2px solid;',
    'border-color:var(--win-chrome-light) var(--win-chrome-dark) var(--win-chrome-dark) var(--win-chrome-light);',
    'cursor:pointer;-webkit-tap-highlight-color:transparent;padding:4px 12px;flex-shrink:0;',
  ].join('');

  const deleteBtn = document.createElement('button');
  deleteBtn.innerHTML = '🗑 Delete';
  deleteBtn.style.cssText = [
    'font-family:var(--pixel-font);font-size:.9rem;color:var(--win-text);',
    'background:var(--win-btn-face);border:2px solid;',
    'border-color:var(--win-chrome-light) var(--win-chrome-dark) var(--win-chrome-dark) var(--win-chrome-light);',
    'cursor:pointer;-webkit-tap-highlight-color:transparent;padding:4px 12px;margin-left:auto;',
  ].join('');

  editorTop.appendChild(backBtn);
  editorTop.appendChild(deleteBtn);
  editorPanel.appendChild(editorTop);

  const titleInput = document.createElement('input');
  titleInput.type = 'text';
  titleInput.placeholder = 'Title...';
  titleInput.style.cssText = [
    'width:100%;padding:8px 10px;',
    'font-family:var(--pixel-font);font-size:1.1rem;font-weight:bold;color:#000;',
    'background:#fff;border:none;border-bottom:2px solid var(--win-chrome-dark);',
    'outline:none;flex-shrink:0;',
  ].join('');
  editorPanel.appendChild(titleInput);

  const bodyInput = document.createElement('textarea');
  bodyInput.placeholder = 'Start typing...';
  bodyInput.style.cssText = [
    'flex:1;padding:8px 10px 40px;',
    'font-family:var(--mono-font),monospace;font-size:.92rem;color:#000;',
    'background:#fff;border:none;outline:none;resize:none;line-height:1.6;',
    '-webkit-overflow-scrolling:touch;',
  ].join('');
  editorPanel.appendChild(bodyInput);

  /* ── Render note list ── */
  const renderList = () => {
    listPanel.innerHTML = '';
    if (!notes.length) {
      const empty = document.createElement('div');
      empty.style.cssText = 'display:flex;flex-direction:column;align-items:center;justify-content:center;gap:12px;height:60%;padding:60px 30px;text-align:center;';
      empty.innerHTML = `
        <div style="font-size:3rem">📝</div>
        <div style="font-family:var(--pixel-font);font-size:1rem;color:var(--win-text-dim);">No notes yet.<br>Click + New to start.</div>`;
      listPanel.appendChild(empty);
      return;
    }
    notes.forEach((note, i) => {
      const row = document.createElement('div');
      row.style.cssText = [
        'display:flex;flex-direction:column;gap:3px;padding:8px 10px;',
        'border-bottom:1px solid var(--win-chrome-dark);cursor:pointer;',
        '-webkit-tap-highlight-color:transparent;',
        'background:var(--win-chrome);',
      ].join('');

      const title = document.createElement('div');
      title.style.cssText = 'font-family:var(--pixel-font);font-size:1rem;font-weight:bold;color:var(--win-text);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;';
      title.textContent = note.title || 'Untitled';

      const meta = document.createElement('div');
      meta.style.cssText = 'display:flex;gap:10px;align-items:center;';
      meta.innerHTML = `
        <span style="font-family:var(--pixel-font);font-size:.82rem;color:var(--win-text-dim);">${new Date(note.updated).toLocaleDateString('en-US',{month:'short',day:'numeric'})}</span>
        <span style="font-family:var(--pixel-font);font-size:.82rem;color:var(--win-text-dim);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:200px;">${(note.body || '').replace(/\n/g,' ').slice(0, 60)}</span>`;

      row.appendChild(title);
      row.appendChild(meta);

      row.addEventListener('click', () => openNote(i));
      row.addEventListener('touchstart', () => { row.style.background = 'var(--win-select)'; title.style.color = 'var(--win-select-text)'; }, { passive: true });
      row.addEventListener('touchend',   () => { row.style.background = 'var(--win-chrome)'; title.style.color = 'var(--win-text)'; },         { passive: true });
      listPanel.appendChild(row);
    });
  };

  /* ── Open / create note ── */
  const openNote = (idx) => {
    activeIdx = idx;
    titleInput.value = notes[idx].title || '';
    bodyInput.value  = notes[idx].body  || '';
    editorPanel.style.transform = 'translateX(0)';
    setTimeout(() => {
      if (!notes[idx].title) titleInput.focus();
      else bodyInput.focus();
    }, 310);
  };

  const closeEditor = () => {
    if (activeIdx !== null) {
      notes[activeIdx].title   = titleInput.value.trim() || 'Untitled';
      notes[activeIdx].body    = bodyInput.value;
      notes[activeIdx].updated = Date.now();
      if (!titleInput.value.trim() && !bodyInput.value.trim()) {
        notes.splice(activeIdx, 1);
      }
      save(notes);
    }
    activeIdx = null;
    editorPanel.style.transform = 'translateX(100%)';
    renderList();
  };

  const newNote = () => {
    haptic('medium');
    if (window.POS) POS.markFlag('noteMade');
    const note = { title:'', body:'', updated: Date.now() };
    notes.unshift(note);
    save(notes);
    openNote(0);
  };

  deleteBtn.onclick  = () => {
    haptic('heavy');
    if (activeIdx !== null) { notes.splice(activeIdx, 1); save(notes); }
    activeIdx = null;
    editorPanel.style.transform = 'translateX(100%)';
    renderList();
  };
  backBtn.onclick    = () => { haptic('light'); closeEditor(); };
  document.getElementById('notes-new').onclick = newNote;

  let saveTimer = null;
  const autoSave = () => {
    clearTimeout(saveTimer);
    saveTimer = setTimeout(() => {
      if (activeIdx !== null) {
        notes[activeIdx].title   = titleInput.value.trim() || 'Untitled';
        notes[activeIdx].body    = bodyInput.value;
        notes[activeIdx].updated = Date.now();
        save(notes);
      }
    }, 800);
  };
  titleInput.addEventListener('input', autoSave);
  bodyInput.addEventListener('input',  autoSave);

  renderList();
  return () => { clearTimeout(saveTimer); };
}
