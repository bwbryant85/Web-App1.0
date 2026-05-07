/* ════════════ NOTES v8 MODERN ════════════
   Modern notes app with glass effects
   ════════════════════════════════════ */

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

  const c = window.content;
  c.style.cssText = 'width:100%;height:100%;display:flex;flex-direction:column;overflow:hidden;background:rgba(248,249,252,.92);border-radius:28px;';

  // Header
  const header = document.createElement('div');
  header.style.cssText = 'flex-shrink:0;padding:16px;background:rgba(255,255,255,.9);backdrop-filter:blur(20px);-webkit-backdrop-filter:blur(20px);border-bottom:1px solid rgba(15,23,42,.08);border-radius:28px 28px 0 0;display:flex;align-items:center;justify-content:space-between;';
  header.innerHTML = `
    <div style="display:flex;align-items:center;gap:8px;">
      <div style="font-size:1.5rem;">📝</div>
      <div style="font-family:'Inter',sans-serif;font-size:1.2rem;color:#111;font-weight:600;">Notes</div>
    </div>
    <button id="notes-new" style="font-family:'Inter',sans-serif;font-size:.9rem;color:#fff;background:#4a90d9;border:none;border-radius:16px;padding:8px 16px;cursor:pointer;-webkit-tap-highlight-color:transparent;">+ New Note</button>
  `;
  c.appendChild(header);

  // Body
  const body = document.createElement('div');
  body.style.cssText = 'flex:1;overflow:hidden;position:relative;';
  c.appendChild(body);

  const listPanel = document.createElement('div');
  listPanel.style.cssText = 'position:absolute;inset:0;overflow-y:auto;-webkit-overflow-scrolling:touch;padding:16px;display:flex;flex-direction:column;gap:8px;';
  body.appendChild(listPanel);

  const editorPanel = document.createElement('div');
  editorPanel.style.cssText = 'position:absolute;inset:0;display:flex;flex-direction:column;background:rgba(248,249,252,.92);transform:translateX(100%);transition:transform .3s ease;';
  body.appendChild(editorPanel);

  // Editor contents
  const editorHeader = document.createElement('div');
  editorHeader.style.cssText = 'flex-shrink:0;padding:16px;background:rgba(255,255,255,.9);backdrop-filter:blur(20px);-webkit-backdrop-filter:blur(20px);border-bottom:1px solid rgba(15,23,42,.08);display:flex;align-items:center;gap:12px;';
  editorHeader.innerHTML = `
    <button id="notes-back" style="font-size:1.2rem;color:#666;background:none;border:none;cursor:pointer;-webkit-tap-highlight-color:transparent;padding:4px;">←</button>
    <input id="note-title" type="text" placeholder="Note title" style="flex:1;border:none;outline:none;font-family:'Inter',sans-serif;font-size:1rem;color:#111;background:transparent;" />
    <button id="notes-delete" style="font-size:1.2rem;color:#ff3b30;background:none;border:none;cursor:pointer;-webkit-tap-highlight-color:transparent;padding:4px;">🗑️</button>
  `;
  editorPanel.appendChild(editorHeader);

  const editorBody = document.createElement('div');
  editorBody.style.cssText = 'flex:1;padding:16px;display:flex;flex-direction:column;gap:12px;';
  const textarea = document.createElement('textarea');
  textarea.style.cssText = 'flex:1;border:none;outline:none;font-family:\'Inter\',sans-serif;font-size:1rem;color:#111;background:#ffffff;border-radius:12px;padding:16px;resize:none;-webkit-appearance:none;';
  textarea.placeholder = 'Start writing your note...';
  editorBody.appendChild(textarea);
  editorPanel.appendChild(editorBody);

  const newBtn = header.querySelector('#notes-new');
  const backBtn = editorHeader.querySelector('#notes-back');
  const deleteBtn = editorHeader.querySelector('#notes-delete');
  const titleInput = editorHeader.querySelector('#note-title');

  function renderList() {
    listPanel.innerHTML = '';
    if (notes.length === 0) {
      const empty = document.createElement('div');
      empty.style.cssText = 'text-align:center;padding:40px;font-family:\'Inter\',sans-serif;color:#666;';
      empty.innerHTML = '<div style="font-size:3rem;margin-bottom:16px;">📝</div><div>No notes yet. Tap "New Note" to create one.</div>';
      listPanel.appendChild(empty);
      return;
    }

    notes.forEach((note, idx) => {
      const item = document.createElement('div');
      item.style.cssText = 'background:rgba(255,255,255,.9);backdrop-filter:blur(20px);-webkit-backdrop-filter:blur(20px);border:1px solid rgba(15,23,42,.08);border-radius:12px;padding:16px;cursor:pointer;-webkit-tap-highlight-color:transparent;';
      const title = note.title || 'Untitled';
      const preview = note.content ? note.content.substring(0, 100) + (note.content.length > 100 ? '...' : '') : 'Empty note';
      item.innerHTML = `
        <div style="font-family:'Inter',sans-serif;font-size:1rem;color:#111;font-weight:500;margin-bottom:4px;">${title}</div>
        <div style="font-family:'Inter',sans-serif;font-size:.9rem;color:#666;line-height:1.4;">${preview}</div>
      `;
      item.onclick = () => openNote(idx);
      listPanel.appendChild(item);
    });
  }

  function openNote(idx) {
    activeIdx = idx;
    const note = notes[idx];
    titleInput.value = note.title || '';
    textarea.value = note.content || '';
    listPanel.style.transform = 'translateX(-100%)';
    editorPanel.style.transform = 'translateX(0)';
    setTimeout(() => textarea.focus(), 300);
  }

  function closeEditor() {
    if (activeIdx !== null) {
      notes[activeIdx] = {
        title: titleInput.value.trim(),
        content: textarea.value.trim(),
        updated: Date.now()
      };
      save(notes);
    }
    activeIdx = null;
    listPanel.style.transform = 'translateX(0)';
    editorPanel.style.transform = 'translateX(100%)';
    renderList();
  }

  function deleteNote() {
    if (activeIdx !== null && confirm('Delete this note?')) {
      notes.splice(activeIdx, 1);
      save(notes);
      closeEditor();
    }
  }

  function newNote() {
    notes.unshift({ title: '', content: '', created: Date.now() });
    openNote(0);
  }

  newBtn.onclick = newNote;
  backBtn.onclick = closeEditor;
  deleteBtn.onclick = deleteNote;

  textarea.oninput = () => {
    if (activeIdx !== null) {
      notes[activeIdx].content = textarea.value;
      save(notes);
    }
  };

  titleInput.oninput = () => {
    if (activeIdx !== null) {
      notes[activeIdx].title = titleInput.value;
      save(notes);
    }
  };

  renderList();
}